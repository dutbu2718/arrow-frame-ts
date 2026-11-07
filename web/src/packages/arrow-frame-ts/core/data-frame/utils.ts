import type { SignalAdapter } from "../reactivity";
import type { Column, ColumnData, ColumnMap, Columns, DeriveFn } from "./types";

export function createDerive<TColumns extends ColumnMap, TResult extends ColumnData>(
  adapter: SignalAdapter,
  columns: Columns<TColumns>,
  fn: DeriveFn<TColumns, TResult>,
): Column<TResult> {
  return adapter.memo<TResult>((previous, onCleanup) => fn(columns, { previous, onCleanup }));
}
