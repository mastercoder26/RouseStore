/**
 * src/lib/storage/MemoryStorageDriver.ts
 * In-memory implementation of IStorageDriver.
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
  private listeners: Map<string, Set<(newValue: unknown) => void>> = new Map();

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
