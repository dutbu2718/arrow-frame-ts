import type { Vector } from "apache-arrow";

export type Value =
  | string
  | number
  | bigint
  | boolean
  | Date
  | Uint8Array
  | undefined;

export type Schema = Record<string, Value>;

export type Compute = () => Vector;

export type DeriveOperation = {
  readonly _operation: "derive";
  readonly id: "string";
  readonly compute: Compute;
};

export type SelectOperation = {
  readonly _operation: "select";
  readonly columns: readonly string[];
};

export type Operation = DeriveOperation | SelectOperation;
