import type { Getter, MaybePromise, OnCleanup, SignalAdapter } from "../signal-adapter-types";
import type { ErrorLike, ReactivePromise, ReactivePromiseStatus } from "./types";

export function createReactivePromise<T, E extends ErrorLike = ErrorLike>(
  adapter: SignalAdapter,
  fn: (onCleanup: OnCleanup) => MaybePromise<T>,
): Getter<ReactivePromise<T, E>> {
  let value: T | undefined;
  let error: E | undefined;

  const result = adapter.signal<ReactivePromise<T, E>>(
    createSnapshot<T, E>(value, error, "pending"),
  );

  const setStatus = (status: ReactivePromiseStatus) => {
    result.set(createSnapshot<T, E>(value, error, status));
  };

  adapter.effect((onCleanup) => {
    let aborted = false;

    onCleanup(() => {
      aborted = true;
    });

    setStatus("pending");

    const resolve = (newValue: T) => {
      value = newValue;
      error = undefined;
      setStatus("fulfilled");
    };

    // Keep the last good value on failure
    const reject = (error: unknown) => {
      error = toErrorLike<E>(error);
      setStatus("rejected");
    };

    try {
      const promiseOrValue = fn(onCleanup);

      if (isThenable<T>(promiseOrValue)) {
        promiseOrValue.then(
          (value) => {
            if (!aborted) {
              resolve(value);
            }
          },
          (error) => {
            if (!aborted) {
              reject(error);
            }
          },
        );
      } else {
        resolve(promiseOrValue);
      }
    } catch (error) {
      reject(error);
    }
  });

  return result.get;
}

function createSnapshot<T, E>(
  value: T | undefined,
  error: E | undefined,
  status: ReactivePromiseStatus,
): ReactivePromise<T, E> {
  return {
    value: value,
    error: error,
    status: status,
    valueOrThrow: () => {
      if (error !== undefined) {
        throw toThrowable(error);
      }

      return value;
    },
  };
}

function toThrowable(error: unknown): unknown {
  if (error instanceof Error) {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return Object.assign(new Error(String(error.message)), error);
  }

  return error;
}

function toErrorLike<E extends ErrorLike>(error: unknown): E {
  if (error instanceof Error) {
    return { message: error.message, name: error.name, stack: error.stack } as E;
  }

  if (typeof error === "string") {
    return { message: error } as E;
  }

  // TODO: handle this case better
  return { message: "UNKNOWN_ERROR", DUMP: error } as unknown as E;
}

function isThenable<T>(value: unknown): value is PromiseLike<T> {
  return (
    (typeof value === "object" || typeof value === "function") &&
    (value !== null || value !== undefined) &&
    typeof (value as { then?: unknown }).then === "function"
  );
}
