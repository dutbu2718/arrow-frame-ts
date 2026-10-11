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
export class LazyCache<K, V, C> implements Cache<K, V, C> {
  private readonly entries = new Map<K, CacheEntry<V>>();

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
      thunk: Thunk<V, C>;
      validate?: Validator<V>;
    },
  ): void {
    if (this.entries.has(key)) {
      throw new Error(`"${String(key)}" already exists`);
    }

    this.entries.set(key, {
      status: CacheEntryStatus.Pending,
      thunk: expression.thunk,
      validate: expression.validate,
    });
  }

  evaluate(key: K, context: C) {
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

  copyEntry(key: K): CacheEntry<V> | undefined {
    const entry = this.entries.get(key);

    if (!entry) {
      return undefined;
    }

    return { ...entry };
  }

  addEntry(key: K, entry: CacheEntry<V>): void {
    if (this.entries.has(key)) {
      throw new Error(`"${String(key)}" already exists`);
    }

    this.entries.set(key, { ...entry });
  }
}
