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

export type Operation = {
  readonly _operation: "derive";
  id: "string";
  compute: () => Vector;
};
