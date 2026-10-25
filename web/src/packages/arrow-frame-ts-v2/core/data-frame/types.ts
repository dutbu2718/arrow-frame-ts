import type { Getter, MaybePromise, OnCleanup } from "../reactivity";

export type ColumnarData = Record<string, ColumnData>;
export type Columns = Record<string, Getter<MaybePromise<unknown>>>;

export type DeriveFn<T> = (
  columns: Columns,
  options: {
    previous: T | undefined;
    onCleanup: OnCleanup;
  },
) => MaybePromise<T>;

export interface ColumnData<T = unknown> {
  readonly length: number;
  get(index: number): T | null | undefined;
}
