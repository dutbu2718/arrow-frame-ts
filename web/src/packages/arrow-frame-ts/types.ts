import type { Vector } from "apache-arrow";
import type { Column } from "./column";

export type Value =
  | string
  | number
  | bigint
  | boolean
  | Date
  | Uint8Array
  | undefined;

export type Schema = Record<string, Value>;

export interface ColumnCollection<S extends Schema = Schema> {
  get<K extends keyof S & string>(id: K): Column<S[K]>;
  set<K extends keyof S & string>(id: K, column: Column<S[K]>): void;
  has<K extends keyof S & string>(id: K): boolean;
}

export type Compute<S extends Schema, T extends Value> = (
  columns: ColumnCollection<S>,
) => Column<T>;

export type RuntimeRow = Record<string, Value>;

export interface RuntimeColumnCollection {
  get(id: string): Column<Value>;
  set(id: string, column: Column<Value>): void;
  has(id: string): boolean;
}

export interface DeriveOperation {
  readonly operation: "derive";
  readonly id: string;
  readonly compute: (collection: RuntimeColumnCollection) => Column<Value>;
}

export interface FilterOperation {
  readonly operation: "filter";
  readonly predicate: (row: RuntimeRow) => boolean;
}

export interface SelectOperation {
  readonly operation: "select";
  readonly columns: readonly string[];
}

export type Operation = DeriveOperation | SelectOperation;
