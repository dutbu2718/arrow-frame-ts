import {
  type Cache,
  type CacheEntry,
  CacheEntryStatus,
  type Thunk,
  type Validator,
} from "./types";

/**
 * @description
 * Executes thunks on-demand and memoizes results.
 */
export class LazyCache<K, V> implements Cache<K, V> {
  private readonly entries = new Map<K, CacheEntry<V>>();
  private initialized = false;

  get isInitialized() {
    return this.initialized;
  }

  initialize(entries: Iterable<[K, V]>) {
    if (this.initialized) {
      return;
    }

    for (const [key, value] of entries) {
      this.entries.set(key, {
        status: CacheEntryStatus.Memorized,
        value,
        valueCreatedAt: Date.now(),
      });
    }

    this.initialized = true;
  }

  get(key: K) {
    const entry = this.entries.get(key);

    if (!entry) {
      throw new Error(`Evaluate has not been called for key "${String(key)}"`);
    }

    return entry.value!;
  }

  set(key: K, value: V): void {
    const entry = this.entries.get(key);

    if (!entry) {
      throw new Error(`Unknown key "${String(key)}"`);
    }

    // Mutate in place to not override stored thunk and validate
    entry.value = value;
    entry.valueCreatedAt = Date.now();
    entry.status = CacheEntryStatus.Memorized;
  }

  has(key: K): boolean {
    return this.entries.has(key);
  }

  keys() {
    return this.entries.keys();
  }

  defer(
    key: K,
    expression: {
      thunk: Thunk<V, any>;
      validate?: Validator<V>;
    },
  ): void {
    if (this.entries.has(key)) {
      return;
    }

    this.entries.set(key, {
      status: CacheEntryStatus.Pending,
      thunk: expression.thunk,
      validate: expression.validate,
    });
  }

  evaluate<C>(key: K, context: C) {
    const entry = this.entries.get(key);

    if (!entry) {
      throw new Error(`Unknown key "${String(key)}"`);
    }

    if (entry.status === CacheEntryStatus.Memorized) {
      return entry.value!;
    }

    const value = entry.thunk!(context);
    entry.validate?.(value);

    entry.value = value;
    entry.valueCreatedAt = Date.now();
    entry.status = CacheEntryStatus.Memorized;

    return entry.value;
  }

  invalidate(key: K): void {
    const entry = this.entries.get(key);

    if (!entry) {
      return;
    }

    entry.status = CacheEntryStatus.Pending;
  }

  copyEntry(key: K): CacheEntry<V> | undefined {
    const entry = this.entries.get(key);

    if (!entry) {
      return undefined;
    }

    return { ...entry };
  }

  addEntry(key: K, entry: CacheEntry<V>): void {
    if (this.entries.has(key)) {
      return;
    }

    this.entries.set(key, { ...entry });
  }
}
