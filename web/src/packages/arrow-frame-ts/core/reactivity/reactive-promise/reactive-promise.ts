import type { Getter, MaybePromise, OnCleanup, SignalAdapter } from "../signal-adapter-types";
import type { ErrorLike, ReactivePromise, ReactivePromiseStatus } from "./types";
import { createSnapshot, toErrorLike, isThenable } from "./utils";

export function createReactivePromise<T, E extends ErrorLike = ErrorLike>(
  adapter: SignalAdapter,
  fn: (onCleanup: OnCleanup) => MaybePromise<T>,
): Getter<ReactivePromise<T, E>> {
  let value: T | undefined;
  let error: E | undefined;

  let latestRunId = 0;

  const result = adapter.signal<ReactivePromise<T, E>>(
    createSnapshot<T, E>(value, error, "pending"),
  );

  const setStatus = (status: ReactivePromiseStatus) => {
    result.set(createSnapshot<T, E>(value, error, status));
  };

  adapter.effect((onCleanup) => {
    const runId = ++latestRunId;

    setStatus("pending");

    const resolve = (newValue: T) => {
      value = newValue;
      error = undefined;
      setStatus("resolved");
    };

    // Keep the last good value on failure
    const reject = (reason: unknown) => {
      error = toErrorLike<E>(reason);
      setStatus("rejected");
    };

    try {
      const promiseOrValue = fn(onCleanup);

      if (isThenable<T>(promiseOrValue)) {
        promiseOrValue.then(
          (resolved) => {
            if (runId === latestRunId) {
              resolve(resolved);
            }
          },
          (reason) => {
            if (runId === latestRunId) {
              reject(reason);
            }
          },
        );
      } else {
        resolve(promiseOrValue);
      }
    } catch (reason) {
      reject(reason);
    }
  });

  return result.get;
}
