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

export interface CacheMemoizer<K, V, C> {
  defer(
    key: K,
    expression: {
      thunk: Thunk<V, C>;
      validate?: Validator<V>;
    },
  ): void;
  evaluate(key: K, context: C): V;
}

export interface Cache<K, V, C>
  extends CacheAccessor<K, V>, CacheMemoizer<K, V, C> {
  copyEntry(key: K): CacheEntry<V> | undefined;
  addEntry(key: K, entry: CacheEntry<V>): void;
}
