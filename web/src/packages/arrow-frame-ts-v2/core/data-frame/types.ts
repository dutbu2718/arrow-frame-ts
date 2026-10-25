import type { Getter, MaybePromise, OnCleanup } from "../reactivity";

export type ColumnarData = Record<string, unknown[]>;
export type Columns = Record<string, Getter<MaybePromise<unknown>>>;

export type DeriveFn<T> = (
  columns: Columns,
  options: {
    previous: T | undefined;
    onCleanup: OnCleanup;
  },
) => MaybePromise<T>;
