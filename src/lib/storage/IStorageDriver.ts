/**
 * src/lib/storage/IStorageDriver.ts
 * Storage abstraction interface for RouseStore Raider Station.
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
