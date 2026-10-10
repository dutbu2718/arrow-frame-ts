import {
  type Cache,
  type CacheEntry,
  CacheEntryStatus,
  type Thunk,
  type Validator,
} from "./types";

export class LazyCache<K, V> implements Cache<K, V> {
  private readonly entries = new Map<K, CacheEntry<K, V>>();

  get(key: K): V {
    const entry = this.entries.get(key);

    if (!entry) {
      throw new Error(`Unknown key "${String(key)}"`);
    }

    if (entry.status === CacheEntryStatus.Memorized) {
      return entry.value!;
    }

    const value = entry.thunk!(this);
    entry.validate?.(value);

    // Mutate in place to not override stored thunk and validate
    entry.value = value;
    entry.valueCreatedAt = Date.now();
    entry.status = CacheEntryStatus.Memorized;

    return value;
  }

  has(key: K): boolean {
    return this.entries.has(key);
  }

  defer(
    key: K,
    expression: {
      thunk: Thunk<K, V>;
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

  set(key: K, value: V): void {
    const entry = this.entries.get(key);

    if (!entry) {
      throw new Error(`Unknown key "${String(key)}"`);
    }

    entry.validate?.(value);

    // Mutate in place to not override stored thunk and validate
    entry.value = value;
    entry.valueCreatedAt = Date.now();
    entry.status = CacheEntryStatus.Memorized;
  }

  keys() {
    return this.entries.keys();
  }

  copyEntry(key: K): CacheEntry<K, V> | undefined {
    const entry = this.entries.get(key);

    if (!entry) {
      return undefined;
    }

    return { ...entry };
  }

  addEntry(key: K, entry: CacheEntry<K, V>): void {
    if (this.entries.has(key)) {
      throw new Error(`"${String(key)}" already exists`);
    }

    this.entries.set(key, { ...entry });
  }
}
