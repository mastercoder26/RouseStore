/**
 * src/lib/storage/index.ts
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
  options: StorageDriverOptions & { useMemoryOnly?: boolean } = {}
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
