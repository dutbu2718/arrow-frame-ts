import { createReactivePromise } from "../reactive-promise/reactive-promise";
import type { ErrorLike, ReactivePromise } from "../reactive-promise/types";
import { isThenable } from "../reactive-promise/utils";
import type { SignalAdapter, OnCleanup, MaybePromise, Getter } from "../signal-adapter-types";

export function createMemo<T, E extends ErrorLike = ErrorLike>(
  adapter: SignalAdapter,
  fn: (previous: T | undefined, onCleanup: OnCleanup) => MaybePromise<T>,
): Getter<ReactivePromise<T, E>> {
  let previous: T | undefined;
  let latestRunId = 0;

  return createReactivePromise<T, E>(adapter, (onCleanup) => {
    const runId = ++latestRunId;

    const promiseOrValue = fn(previous, onCleanup);

    if (isThenable<T>(promiseOrValue)) {
      return promiseOrValue.then((resolved) => {
        // Only the newest run may write `previous`.
        if (runId === latestRunId) {
          previous = resolved;
        }

        return resolved;
      });
    }

    previous = promiseOrValue;

    return promiseOrValue;
  });
}
