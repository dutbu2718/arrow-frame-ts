import type { Getter, MaybePromise, OnCleanup } from "../reactivity";

export interface ColumnData<T = unknown> {
  readonly data: T;
}

export type ColumnMap = Record<string, ColumnData>;

export type Columns<T extends ColumnMap> = {
  [K in keyof T]: Getter<T[K]>;
};

export type DeriveFn<TColumns extends ColumnMap, TResult extends ColumnData> = (
  columns: Columns<TColumns>,
  options: {
    previous: TResult | undefined;
    onCleanup: OnCleanup;
  },
) => MaybePromise<TResult>;
