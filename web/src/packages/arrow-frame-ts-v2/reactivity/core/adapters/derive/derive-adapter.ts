import type {
  MaybePromise,
  OnCleanup,
  SignalAdapter,
} from "../../../core/adapters/signal-adapter-types";

export type DeriveFn<T> = (
  previous: T | undefined,
  onCleanup: OnCleanup,
) => MaybePromise<T>;

export function createDerive<T>(sig: SignalAdapter, fn: DeriveFn<T>) {
  return sig.memo(fn);
}
