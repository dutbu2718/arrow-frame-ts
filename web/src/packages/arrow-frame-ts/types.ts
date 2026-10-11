import type { Column } from "./column";
import type { LazyCache } from "./utils/cache/lazy-cache";
import type { Thunk } from "./utils/cache/types";

export type Value =
  | string
  | number
  | bigint
  | boolean
  | Date
  | Uint8Array
  | undefined;

export type Schema = Record<string, Value>;

export type SourceLoader<T> = () => T;
export type CacheLoader = () => LazyCache<
  string,
  Column<Value>,
  OperationContext
>;

export type RuntimeRow = Record<string, Value>;

export interface OperationContext {
  readonly get: (columnId: string) => Column<Value>;
}

export interface BaseOperation {
  readonly operation: string;
}

export interface DeriveOperation extends BaseOperation {
  readonly operation: "derive";
  readonly id: string;
  readonly compute: Thunk<Column<Value>, OperationContext>;
}

export interface FilterOperation extends BaseOperation {
  readonly operation: "filter";
  readonly predicate: (row: RuntimeRow) => boolean;
}

export interface SelectOperation extends BaseOperation {
  readonly operation: "select";
  readonly columns?: readonly string[];
}

export type Operation = DeriveOperation | SelectOperation;
