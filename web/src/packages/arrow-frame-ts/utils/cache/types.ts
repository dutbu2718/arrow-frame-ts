export enum CacheEntryStatus {
  Pending = 0,
  Memorized = 1,
}

export type Thunk<K, V> = (cache: CacheAccessor<K, V>) => V;
export type Validator<V> = (value: V) => void;

export interface CacheEntry<K, V> {
  status: CacheEntryStatus;
  thunk?: Thunk<K, V>;
  validate?: Validator<V>;
  value?: V;
  valueCreatedAt?: number;
}

export interface CacheAccessor<K, V> {
  get(key: K): V;
  has(key: K): boolean;
}

export interface Cache<K, V> extends CacheAccessor<K, V> {
  defer(
    key: K,
    expression: {
      thunk: Thunk<K, V>;
      validate?: Validator<V>;
    },
  ): void;
  set(key: K, value: V): void;
  keys(): MapIterator<K>;
  copyEntry(key: K): CacheEntry<K, V> | undefined;
  addEntry(key: K, entry: CacheEntry<K, V>): void;
}
