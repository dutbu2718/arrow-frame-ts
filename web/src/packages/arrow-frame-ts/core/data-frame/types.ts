import type { Getter, MaybePromise, OnCleanup, ReactivePromise } from "../reactivity";

export interface ColumnData<T = unknown> {
  readonly data: T;
}

export type ColumnMap = Record<string, ColumnData>;

export type Column<V extends ColumnData> = Getter<ReactivePromise<V>>;

export type Columns<T extends ColumnMap> = {
  [K in keyof T]: Column<T[K]>;
};

export type DeriveFn<TColumns extends ColumnMap, TResult extends ColumnData> = (
  columns: Columns<TColumns>,
  options: {
    previous: TResult | undefined;
    onCleanup: OnCleanup;
  },
) => MaybePromise<TResult>;
