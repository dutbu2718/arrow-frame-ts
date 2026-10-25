import type { SignalAdapter } from "../reactivity";
import type { ColumnData, ColumnMap, Columns, DeriveFn } from "./types";

export function createDerive<
  TColumns extends ColumnMap,
  TResult extends ColumnData,
>(
  sig: SignalAdapter,
  columns: Columns<TColumns>,
  fn: DeriveFn<TColumns, TResult>,
) {
  return sig.memo<TResult>((previous, onCleanup) =>
    fn(columns, { previous, onCleanup }),
  );
}
