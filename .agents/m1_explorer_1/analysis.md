# Milestone 1 Technical Analysis: Typed Storage Driver Architecture & Resilient Fallback Layer

**Explorer**: Milestone 1 Explorer 1 (Storage Driver & Fallback Specialist)  
**Target Files**:
- `src/lib/storage/IStorageDriver.ts`
- `src/lib/storage/LocalStorageDriver.ts`
- `src/lib/storage/MemoryStorageDriver.ts`
- `src/lib/storage/keys.ts`
- `src/lib/storage/index.ts`  
**Scope**: Storage Driver contract, memory fallback, SSR safety, private browsing handling, JSON corruption resilience, quota exception recovery, cross-tab synchronization, and repository ergonomics.

---

## 1. Executive Summary & Architectural Overview

Raider Station requires a robust client-side storage architecture that abstracts raw `window.localStorage` access behind a strictly typed driver interface (`IStorageDriver`). This abstraction fulfills Requirement **R5 (Architecture & Production Scaffolding)** by:
1. Providing a clean seam to swap local storage with remote/database drivers (e.g., Supabase, PostgreSQL, Prisma API routes) in the future without touching React state or UI components.
2. Shielding the application from runtime crashes across hostile browser environments (Server-Side Rendering / Static Generation in Next.js 16, Safari Private Browsing mode, disabled cookies/storage, `QuotaExceededError`, and corrupted/tampered localStorage data).
3. Supplying an isolated, fast `MemoryStorageDriver` for unit tests, E2E test runs, and SSR hydration fallback.

### Storage & Repository Topology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       React Context & UI State Layer                        │
│             useStore()  │  useReviews()  │  useComplaints()                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Typed Repository Layer                            │
│   ProductRepository     │     ReviewRepository     │   ComplaintRepository  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (Constructor Dependency Injection)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            IStorageDriver (Contract)                        │
│   + getItem<T>(key): T | null        + setItem<T>(key, val): boolean        │
│   + removeItem(key): boolean         + hasItem(key): boolean                │
│   + getAllKeys(): string[]           + clear(): void                        │
│   + isAvailable(): boolean           + isFallback(): boolean                │
└──────────────────────┬───────────────────────────────────────┬──────────────┘
                       │                                       │
                       ▼                                       ▼
    ┌──────────────────────────────────────┐   ┌──────────────────────────────┐
    │          LocalStorageDriver          │   │      MemoryStorageDriver     │
    │  - Browser window.localStorage check │   │  - In-memory Map<k, json>    │
    │  - QuotaExceededError recovery       │   │  - Deep clone isolation      │
    │  - JSON syntax error containment     │   │  - Test seed() & dump()      │
    │  - Cross-tab 'storage' sync          │   │  - Zero browser dependencies │
    │  - Transparent fallback to Memory    │   └──────────────────────────────┘
    └──────────────────────────────────────┘
```

---

## 2. Deep Edge-Case Analysis & Resilience Strategy

### 2.1 Server-Side Rendering (SSR) & Static Site Generation (SSG)
- **Problem**: Next.js 16 (Turbopack, React 19) prerenders pages at build time and on the server. Referencing `window` or `localStorage` during SSR throws `ReferenceError: window is not defined` or `ReferenceError: localStorage is not defined`, crashing static generation (`next build`).
- **Solution**:
  - `LocalStorageDriver` checks `typeof window === 'undefined' || typeof window.localStorage === 'undefined'`.
  - When in SSR, `isAvailable()` returns `false`, `isFallback()` returns `true`, and all read/write operations transparently execute against an internal `MemoryStorageDriver` instance.
  - Zero reference errors during `next build` or server rendering.

### 2.2 Private Browsing Mode & Security Restrictions
- **Problem**: In Safari Private Mode (and browsers with third-party storage restrictions or sandboxed iframes), merely evaluating `window.localStorage` or calling `.setItem()` throws:
  - `SecurityError: The operation is insecure`
  - `DOMException: Failed to read the 'localStorage' property from 'Window': Access is denied for this document` (code 18).
- **Solution**:
  - `checkAvailability()` wraps access in a try/catch probe test (`__rs_probe_<random>__`).
  - If reading, writing, or removing the probe key throws any exception, `LocalStorageDriver` immediately marks `isLocalStorageAvailable = false` and switches to `MemoryStorageDriver`.
  - The storefront functions completely in memory without displaying fatal error screens to the user.

### 2.3 Storage Quota Exceeded (`QuotaExceededError`)
- **Problem**: Browser `localStorage` has a strict quota (usually 5MB per origin). If the catalog, reviews, or complaints exceed available quota, calling `localStorage.setItem` throws `QuotaExceededError` (or `NS_ERROR_DOM_QUOTA_REACHED` in Firefox, code 22 / 1014). If uncaught, user submissions (submitting a review, filing a complaint, editing a product) crash the UI.
- **Solution**:
  - In `setItem()`, write operations are wrapped in a try/catch block.
  - If a write fails:
    1. Log a structured warning via logger (`[LocalStorageDriver] Storage write failed (QuotaExceededError). Falling back to MemoryStorageDriver.`).
    2. Activate `isFallbackActive = true`.
    3. Sync all existing readable localStorage entries into the memory driver to preserve session state.
    4. Write the new item to the memory driver and notify any reactive listeners.
    5. Return `true` (success in memory fallback).

### 2.4 JSON Serialization & Deserialization Errors (Data Corruption)
- **Problem**:
  - Corrupt or manually edited data in `localStorage` causes `JSON.parse()` to throw `SyntaxError: Unexpected token...`.
  - Passing circular references or BigInt values to `setItem` causes `JSON.stringify()` to throw `TypeError: Converting circular structure to JSON`.
- **Solution**:
  - `getItem<T>(key)`: Catches `SyntaxError`. If parsing fails, logs a warning and cleanly returns `null` rather than crashing the component tree.
  - `setItem<T>(key, value)`: Catches `TypeError` or serialization errors. If serialization fails, logs a warning and cleanly returns `false`.

### 2.5 Key Isolation & Namespace Protection
- **Problem**: Calling `localStorage.clear()` in development clears all keys on `localhost`, wiping other projects or third-party tools.
- **Solution**:
  - The driver supports key prefixing (`prefix?: string`).
  - `clear()` only deletes keys that match the configured prefix.
  - `getAllKeys()` filters and returns only keys matching the prefix, stripping the prefix for clean domain consumption.

### 2.6 Synchronous vs Asynchronous Ergonomics
- **Analysis**:
  - React Context state initialization (e.g. `const [products] = useState(() => repo.getAll())`) must be synchronous to avoid hydration mismatches, layout shifts (CLS), and blank initial frames.
  - Therefore, `IStorageDriver` methods (`getItem`, `setItem`, `removeItem`, `getAllKeys`) are designed with synchronous return signatures (`T | null`, `boolean`).
  - Future database adapters can implement an async repository pattern or background sync worker without disrupting the core synchronous client driver interface.

---

## 3. Concrete Code Blueprints for Implementation

The following 5 files provide the complete implementation ready for the Worker.

### 3.1 `src/lib/storage/IStorageDriver.ts`
```typescript
/**
 * IStorageDriver - Storage abstraction interface for RouseStore.
 * Provides a synchronous, typed contract for client-side persistence
 * with transparent in-memory fallback for SSR, private browsing, and quota errors.
 */

export interface StorageDriverOptions {
  /**
   * Optional prefix for all keys stored by this driver.
   * Example: 'rs_' or '' for root keys.
   */
  prefix?: string;

  /**
   * Optional custom logger for warnings and errors.
   */
  logger?: {
    warn: (message: string, ...args: unknown[]) => void;
    error: (message: string, ...args: unknown[]) => void;
  };
}

export type StorageDriverType = "local" | "memory" | "mock" | "custom";

export interface IStorageDriver {
  /**
   * Identifier for the storage driver implementation.
   */
  readonly type: StorageDriverType;

  /**
   * Whether the underlying persistent storage engine (e.g. window.localStorage)
   * is currently available and functioning.
   */
  isAvailable(): boolean;

  /**
   * Whether the driver is currently operating in fallback mode
   * (e.g. Memory fallback because localStorage is unavailable or quota was exceeded).
   */
  isFallback(): boolean;

  /**
   * Retrieves and deserializes a stored item by key.
   * Returns null if key is not found, or if JSON deserialization fails.
   */
  getItem<T = unknown>(key: string): T | null;

  /**
   * Serializes and stores an item by key.
   * Returns true if successfully stored, false if serialization failed.
   */
  setItem<T = unknown>(key: string, value: T): boolean;

  /**
   * Removes an item by key.
   * Returns true if removed or didn't exist, false if error occurred.
   */
  removeItem(key: string): boolean;

  /**
   * Checks whether a key exists in storage.
   */
  hasItem(key: string): boolean;

  /**
   * Returns all keys stored under this driver's prefix (with prefix stripped).
   */
  getAllKeys(): string[];

  /**
   * Clears all entries managed by this driver (respecting prefix).
   */
  clear(): void;

  /**
   * Subscribes to changes for a specific key (cross-tab or local).
   * Returns an unsubscribe function.
   */
  subscribe?<T = unknown>(key: string, callback: (newValue: T | null) => void): () => void;
}
```

---

### 3.2 `src/lib/storage/MemoryStorageDriver.ts`
```typescript
/**
 * MemoryStorageDriver - In-memory implementation of IStorageDriver.
 * Used for SSR, test environments, private browsing fallback, and quota recovery.
 *
 * Implements value serialization/cloning to guarantee that stored objects
 * cannot be mutated outside the driver without calling setItem (matching localStorage behavior).
 */

import type { IStorageDriver, StorageDriverOptions, StorageDriverType } from "./IStorageDriver";

export class MemoryStorageDriver implements IStorageDriver {
  public readonly type: StorageDriverType = "memory";
  private store: Map<string, string> = new Map();
  private prefix: string;
  private logger: StorageDriverOptions["logger"];
  private listeners: Map<string, Set<(newValue: any) => void>> = new Map();

  constructor(options: StorageDriverOptions = {}) {
    this.prefix = options.prefix ?? "";
    this.logger = options.logger ?? console;
  }

  public isAvailable(): boolean {
    return true;
  }

  public isFallback(): boolean {
    return false;
  }

  private getFullKey(key: string): string {
    return this.prefix ? `${this.prefix}${key}` : key;
  }

  private stripPrefix(fullKey: string): string {
    if (!this.prefix) return fullKey;
    return fullKey.startsWith(this.prefix) ? fullKey.slice(this.prefix.length) : fullKey;
  }

  public getItem<T = unknown>(key: string): T | null {
    const fullKey = this.getFullKey(key);
    const raw = this.store.get(fullKey);
    if (raw === undefined || raw === null) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch (err) {
      this.logger?.warn(`[MemoryStorageDriver] Failed to parse stored JSON for key "${key}":`, err);
      return null;
    }
  }

  public setItem<T = unknown>(key: string, value: T): boolean {
    const fullKey = this.getFullKey(key);
    try {
      const serialized = JSON.stringify(value);
      if (serialized === undefined) {
        this.logger?.warn(`[MemoryStorageDriver] Value for key "${key}" cannot be serialized to JSON.`);
        return false;
      }
      this.store.set(fullKey, serialized);
      this.notifyListeners(key, value);
      return true;
    } catch (err) {
      this.logger?.warn(`[MemoryStorageDriver] Failed to serialize value for key "${key}":`, err);
      return false;
    }
  }

  public removeItem(key: string): boolean {
    const fullKey = this.getFullKey(key);
    this.store.delete(fullKey);
    this.notifyListeners(key, null);
    return true;
  }

  public hasItem(key: string): boolean {
    const fullKey = this.getFullKey(key);
    return this.store.has(fullKey);
  }

  public getAllKeys(): string[] {
    const keys: string[] = [];
    for (const fullKey of this.store.keys()) {
      if (!this.prefix || fullKey.startsWith(this.prefix)) {
        keys.push(this.stripPrefix(fullKey));
      }
    }
    return keys;
  }

  public clear(): void {
    if (!this.prefix) {
      this.store.clear();
    } else {
      const keysToRemove: string[] = [];
      for (const fullKey of this.store.keys()) {
        if (fullKey.startsWith(this.prefix)) {
          keysToRemove.push(fullKey);
        }
      }
      for (const k of keysToRemove) {
        this.store.delete(k);
      }
    }
  }

  public subscribe<T = unknown>(key: string, callback: (newValue: T | null) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);
    return () => {
      const set = this.listeners.get(key);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  private notifyListeners(key: string, newValue: any): void {
    const set = this.listeners.get(key);
    if (set) {
      for (const cb of set) {
        try {
          cb(newValue);
        } catch (e) {
          this.logger?.error(`[MemoryStorageDriver] Error in listener callback for key "${key}":`, e);
        }
      }
    }
  }

  // --- Testing & Debugging Helpers ---
  public get size(): number {
    return this.getAllKeys().length;
  }

  public dump(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const key of this.getAllKeys()) {
      result[key] = this.getItem(key);
    }
    return result;
  }

  public seed(data: Record<string, unknown>): void {
    for (const [k, v] of Object.entries(data)) {
      this.setItem(k, v);
    }
  }
}
```

---

### 3.3 `src/lib/storage/LocalStorageDriver.ts`
```typescript
/**
 * LocalStorageDriver - Browser localStorage implementation of IStorageDriver.
 *
 * Robust resilience features:
 * 1. SSR-safe: Operates without error during server-side rendering or build.
 * 2. Private Browsing safe: Handles SecurityError / access restrictions gracefully.
 * 3. Quota resilience: Catches QuotaExceededError and seamlessly falls back to MemoryStorageDriver.
 * 4. JSON Corruption resilience: Catches SyntaxError on parse and TypeError on stringify without throwing.
 * 5. Prefix isolation: Scopes clear() and getAllKeys() only to keys under the driver's prefix.
 * 6. Cross-tab synchronization: Listens to browser 'storage' events for reactive updates.
 */

import type { IStorageDriver, StorageDriverOptions, StorageDriverType } from "./IStorageDriver";
import { MemoryStorageDriver } from "./MemoryStorageDriver";

export class LocalStorageDriver implements IStorageDriver {
  public readonly type: StorageDriverType = "local";
  private prefix: string;
  private logger: StorageDriverOptions["logger"];
  private memoryFallback: MemoryStorageDriver;
  private isFallbackActive = false;
  private isChecked = false;
  private isLocalStorageAvailable = false;
  private listeners: Map<string, Set<(newValue: any) => void>> = new Map();
  private storageEventListenerAttached = false;

  constructor(options: StorageDriverOptions = {}) {
    this.prefix = options.prefix ?? "";
    this.logger = options.logger ?? console;
    this.memoryFallback = new MemoryStorageDriver({ prefix: this.prefix, logger: this.logger });
    this.checkAvailability();
    this.initStorageEventListener();
  }

  /**
   * Probe test to check if localStorage is truly accessible and writable.
   */
  private checkAvailability(): boolean {
    if (this.isChecked) {
      return this.isLocalStorageAvailable && !this.isFallbackActive;
    }
    this.isChecked = true;

    if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
      this.isLocalStorageAvailable = false;
      this.isFallbackActive = true;
      return false;
    }

    try {
      const probeKey = `__rs_probe_${Math.random().toString(36).substring(2, 9)}__`;
      window.localStorage.setItem(probeKey, "probe_val");
      const readVal = window.localStorage.getItem(probeKey);
      window.localStorage.removeItem(probeKey);
      if (readVal === "probe_val") {
        this.isLocalStorageAvailable = true;
        this.isFallbackActive = false;
        return true;
      }
      this.isLocalStorageAvailable = false;
      this.isFallbackActive = true;
      return false;
    } catch {
      // Access denied / SecurityError / Private mode restrictions
      this.isLocalStorageAvailable = false;
      this.isFallbackActive = true;
      return false;
    }
  }

  public isAvailable(): boolean {
    return this.checkAvailability();
  }

  public isFallback(): boolean {
    return !this.isLocalStorageAvailable || this.isFallbackActive;
  }

  private getFullKey(key: string): string {
    return this.prefix ? `${this.prefix}${key}` : key;
  }

  private stripPrefix(fullKey: string): string {
    if (!this.prefix) return fullKey;
    return fullKey.startsWith(this.prefix) ? fullKey.slice(this.prefix.length) : fullKey;
  }

  /**
   * Triggers seamless fallback to in-memory storage if localStorage throws quota or security error.
   */
  private activateFallback(reason: string, error?: unknown): void {
    if (!this.isFallbackActive) {
      this.isFallbackActive = true;
      this.logger?.warn(`[LocalStorageDriver] Switching to in-memory fallback: ${reason}`, error);
      // Copy existing readable items into memory fallback so session continuity is maintained
      this.syncLocalStorageToMemory();
    }
  }

  private syncLocalStorageToMemory(): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key) {
            if (!this.prefix || key.startsWith(this.prefix)) {
              const logicalKey = this.stripPrefix(key);
              const val = window.localStorage.getItem(key);
              if (val !== null) {
                try {
                  const parsed = JSON.parse(val);
                  this.memoryFallback.setItem(logicalKey, parsed);
                } catch {
                  // If not JSON, ignore
                }
              }
            }
          }
        }
      }
    } catch {
      // Ignore errors during fallback sync
    }
  }

  public getItem<T = unknown>(key: string): T | null {
    if (this.isFallback()) {
      return this.memoryFallback.getItem<T>(key);
    }

    const fullKey = this.getFullKey(key);
    try {
      const raw = window.localStorage.getItem(fullKey);
      if (raw === null || raw === undefined) {
        return null;
      }
      return JSON.parse(raw) as T;
    } catch (err) {
      // Could be SyntaxError (corrupt data) or SecurityError
      if (err instanceof SyntaxError) {
        this.logger?.warn(`[LocalStorageDriver] JSON SyntaxError for key "${key}". Returning null:`, err);
        return null;
      }
      // If reading localStorage threw SecurityError/DOMException, fallback to memory
      this.activateFallback(`getItem failed for key "${key}"`, err);
      return this.memoryFallback.getItem<T>(key);
    }
  }

  public setItem<T = unknown>(key: string, value: T): boolean {
    // Attempt serialization first
    let serialized: string;
    try {
      const result = JSON.stringify(value);
      if (result === undefined) {
        this.logger?.warn(`[LocalStorageDriver] Value for key "${key}" serialized to undefined.`);
        return false;
      }
      serialized = result;
    } catch (err) {
      this.logger?.warn(`[LocalStorageDriver] JSON stringify failed for key "${key}":`, err);
      return false;
    }

    if (this.isFallback()) {
      const success = this.memoryFallback.setItem(key, value);
      this.notifyListeners(key, value);
      return success;
    }

    const fullKey = this.getFullKey(key);
    try {
      window.localStorage.setItem(fullKey, serialized);
      // Also mirror in memory fallback
      this.memoryFallback.setItem(key, value);
      this.notifyListeners(key, value);
      return true;
    } catch (err) {
      // LocalStorage quota exceeded or SecurityError
      this.activateFallback(`setItem failed for key "${key}" (possible QuotaExceededError)`, err);
      const success = this.memoryFallback.setItem(key, value);
      this.notifyListeners(key, value);
      return success;
    }
  }

  public removeItem(key: string): boolean {
    this.memoryFallback.removeItem(key);

    if (!this.isFallback()) {
      const fullKey = this.getFullKey(key);
      try {
        window.localStorage.removeItem(fullKey);
      } catch (err) {
        this.activateFallback(`removeItem failed for key "${key}"`, err);
      }
    }

    this.notifyListeners(key, null);
    return true;
  }

  public hasItem(key: string): boolean {
    if (this.isFallback()) {
      return this.memoryFallback.hasItem(key);
    }
    const fullKey = this.getFullKey(key);
    try {
      return window.localStorage.getItem(fullKey) !== null;
    } catch {
      return this.memoryFallback.hasItem(key);
    }
  }

  public getAllKeys(): string[] {
    if (this.isFallback()) {
      return this.memoryFallback.getAllKeys();
    }

    try {
      const keys: string[] = [];
      const len = window.localStorage.length;
      for (let i = 0; i < len; i++) {
        const fullKey = window.localStorage.key(i);
        if (fullKey) {
          if (!this.prefix || fullKey.startsWith(this.prefix)) {
            keys.push(this.stripPrefix(fullKey));
          }
        }
      }
      return keys;
    } catch (err) {
      this.activateFallback("getAllKeys failed", err);
      return this.memoryFallback.getAllKeys();
    }
  }

  public clear(): void {
    this.memoryFallback.clear();

    if (!this.isFallback()) {
      try {
        if (!this.prefix) {
          window.localStorage.clear();
        } else {
          const keysToRemove: string[] = [];
          for (let i = 0; i < window.localStorage.length; i++) {
            const fullKey = window.localStorage.key(i);
            if (fullKey && fullKey.startsWith(this.prefix)) {
              keysToRemove.push(fullKey);
            }
          }
          for (const k of keysToRemove) {
            window.localStorage.removeItem(k);
          }
        }
      } catch (err) {
        this.activateFallback("clear failed", err);
      }
    }
  }

  public subscribe<T = unknown>(key: string, callback: (newValue: T | null) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);
    return () => {
      const set = this.listeners.get(key);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  private notifyListeners(key: string, newValue: any): void {
    const set = this.listeners.get(key);
    if (set) {
      for (const cb of set) {
        try {
          cb(newValue);
        } catch (e) {
          this.logger?.error(`[LocalStorageDriver] Error in listener callback for key "${key}":`, e);
        }
      }
    }
  }

  private initStorageEventListener(): void {
    if (typeof window === "undefined" || this.storageEventListenerAttached) return;
    try {
      window.addEventListener("storage", this.handleStorageEvent);
      this.storageEventListenerAttached = true;
    } catch {
      // Window event listener unavailable
    }
  }

  private handleStorageEvent = (event: StorageEvent): void => {
    if (!event.key) {
      // Storage cleared
      for (const [key, set] of this.listeners.entries()) {
        for (const cb of set) {
          try {
            cb(null);
          } catch (e) {
            this.logger?.error(`[LocalStorageDriver] Error in storage listener:`, e);
          }
        }
      }
      return;
    }

    if (this.prefix && !event.key.startsWith(this.prefix)) {
      return;
    }

    const logicalKey = this.stripPrefix(event.key);
    const set = this.listeners.get(logicalKey);
    if (set && set.size > 0) {
      let parsedValue: any = null;
      if (event.newValue !== null) {
        try {
          parsedValue = JSON.parse(event.newValue);
        } catch {
          parsedValue = event.newValue;
        }
      }
      for (const cb of set) {
        try {
          cb(parsedValue);
        } catch (e) {
          this.logger?.error(`[LocalStorageDriver] Error in storage listener for key "${logicalKey}":`, e);
        }
      }
    }
  };
}
```

---

### 3.4 `src/lib/storage/keys.ts`
```typescript
/**
 * Canonical storage keys for RouseStore Raider Station.
 */

export const STORAGE_KEYS = {
  PRODUCTS: "raider_station_products_v2",
  REVIEWS: "raider_station_reviews_v1",
  COMPLAINTS: "raider_station_complaints_v1",
  THEME: "raider_theme",
  ADMIN_SESSION: "raider_station_admin_session",
  CART: "raider_station_cart_v1",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
```

---

### 3.5 `src/lib/storage/index.ts`
```typescript
/**
 * Storage Layer Exports & Utilities
 */

import { LocalStorageDriver } from "./LocalStorageDriver";
import { MemoryStorageDriver } from "./MemoryStorageDriver";
import type { IStorageDriver, StorageDriverOptions } from "./IStorageDriver";

export * from "./IStorageDriver";
export * from "./MemoryStorageDriver";
export * from "./LocalStorageDriver";
export * from "./keys";

/**
 * Storage driver factory.
 * If running in SSR or if useMemoryOnly is requested, creates MemoryStorageDriver.
 * Otherwise creates resilient LocalStorageDriver with memory fallback.
 */
export function createStorageDriver(
  options: StorageDriverOptions & { useMemoryOnly?: boolean } = {},
): IStorageDriver {
  if (options.useMemoryOnly || typeof window === "undefined") {
    return new MemoryStorageDriver(options);
  }
  return new LocalStorageDriver(options);
}

/**
 * Default shared storage driver instance for client application.
 */
let defaultDriverInstance: IStorageDriver | null = null;

export function getStorageDriver(): IStorageDriver {
  if (!defaultDriverInstance) {
    defaultDriverInstance = createStorageDriver();
  }
  return defaultDriverInstance;
}

export const defaultStorageDriver = getStorageDriver();
```

---

## 4. Repository Integration & Dependency Injection Guide

To ensure high modularity and clean testability, all repositories (`ProductRepository`, `ReviewRepository`, `ComplaintRepository`) should accept `IStorageDriver` via constructor dependency injection, defaulting to `getStorageDriver()`.

### Example:
```typescript
import { IStorageDriver, getStorageDriver, STORAGE_KEYS } from "@/lib/storage";
import type { Product } from "@/types/product";
import { SEED_PRODUCTS } from "@/lib/seed/seedProducts";

export class ProductRepository implements IProductRepository {
  private storage: IStorageDriver;

  constructor(storage: IStorageDriver = getStorageDriver()) {
    this.storage = storage;
  }

  public getAll(): Product[] {
    const cached = this.storage.getItem<Product[]>(STORAGE_KEYS.PRODUCTS);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached;
    }
    // Initialize with seed data if storage is empty
    this.storage.setItem(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
    return SEED_PRODUCTS;
  }

  public save(product: Product): void {
    const list = this.getAll();
    const updated = [product, ...list.filter((p) => p.id !== product.id)];
    this.storage.setItem(STORAGE_KEYS.PRODUCTS, updated);
  }
}
```

This pattern guarantees:
1. **Zero Coupling**: Repositories never know whether they are running in the browser, in Node.js, in Jest/Vitest, or on a live server.
2. **Instant Testability**: Tests can pass `new MemoryStorageDriver()` to create fully isolated, reproducible repository instances without mocking globals.
3. **Seamless State Sync**: Changes in the repository are immediately persisted through the driver.

---

## 5. Summary of Benefits & Verification Criteria

| Feature / Scenario | Vulnerability in Baseline Code | Resolution in New Storage Driver |
|---|---|---|
| **SSR / Static Build** | `localStorage.getItem` throws ReferenceError if accessed on server | Automatically detects SSR and delegates to MemoryStorageDriver |
| **Private Browsing** | Accessing `window.localStorage` throws SecurityError / DOMException | Probe test catches exception, falls back to in-memory store |
| **Quota Exceeded** | `localStorage.setItem` throws QuotaExceededError and breaks UI | Catches quota error, syncs data to memory fallback, completes write |
| **Corrupt JSON** | `JSON.parse` throws unhandled SyntaxError | Catches SyntaxError, returns null, logs structured warning |
| **Non-serializable Data** | `JSON.stringify` throws TypeError (circular objects) | Catches TypeError, returns false, prevents component crash |
| **Namespace Isolation** | `localStorage.clear()` wipes all keys on the domain / port | Scopes clear() and getAllKeys() strictly to prefix |
