/**
 * src/lib/storage/LocalStorageDriver.ts
 * Browser localStorage implementation of IStorageDriver.
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
  private listeners: Map<string, Set<(newValue: unknown) => void>> = new Map();
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
    const set = this.listeners.get(key)!;
    const typedCallback = callback as (newValue: unknown) => void;
    set.add(typedCallback);

    return () => {
      const currentSet = this.listeners.get(key);
      if (currentSet) {
        currentSet.delete(typedCallback);
        if (currentSet.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  private notifyListeners(key: string, newValue: unknown): void {
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
      for (const [, set] of this.listeners.entries()) {
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
      let parsedValue: unknown = null;
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
