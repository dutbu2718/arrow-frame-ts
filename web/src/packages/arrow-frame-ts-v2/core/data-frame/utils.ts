import type { SignalAdapter } from "../reactivity";
import type { Columns, DeriveFn } from "./types";

export function createDerive<T>(
  sig: SignalAdapter,
  columns: Columns,
  fn: DeriveFn<T>,
) {
  return sig.memo<T>((previous, onCleanup) =>
    fn(columns, { previous, onCleanup }),
  );
}
