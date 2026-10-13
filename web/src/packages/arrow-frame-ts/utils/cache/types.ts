export enum CacheEntryStatus {
  Pending = 0,
  Memorized = 1,
}
export type Thunk<V, C> = (context: C) => V;
export type Validator<V> = (value: V) => void;

export interface CacheEntry<V> {
  status: CacheEntryStatus;
  thunk?: Thunk<V, any>;
  validate?: Validator<V>;
  value?: V;
  valueCreatedAt?: number;
}

export interface CacheAccessor<K, V> {
  get(key: K): V;
  set(key: K, value: V): void;
  has(key: K): boolean;
  keys(): MapIterator<K>;
}

export interface CacheMemoizer<K, V> {
  defer(
    key: K,
    expression: {
      thunk: Thunk<V, any>;
      validate?: Validator<V>;
    },
  ): void;
  evaluate<C>(key: K, context: C): V;
  invalidate(key: K): void;
}

export interface Cache<K, V> extends CacheAccessor<K, V>, CacheMemoizer<K, V> {
  copyEntry(key: K): CacheEntry<V> | undefined;
  addEntry(key: K, entry: CacheEntry<V>): void;
}
