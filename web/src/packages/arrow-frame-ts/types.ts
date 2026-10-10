import type { Column } from "./column";
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

export type RuntimeRow = Record<string, Value>;

export interface DeriveOperation {
  readonly operation: "derive";
  readonly id: string;
  readonly compute: Thunk<string, Column<Value>>;
}

export interface FilterOperation {
  readonly operation: "filter";
  readonly predicate: (row: RuntimeRow) => boolean;
}

export interface SelectOperation {
  readonly operation: "select";
  readonly columns?: readonly string[];
}

export type Operation = DeriveOperation | SelectOperation;
