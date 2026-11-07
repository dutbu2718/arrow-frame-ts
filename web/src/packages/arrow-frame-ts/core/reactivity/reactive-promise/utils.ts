import type { ReactivePromiseStatus, ReactivePromise, ErrorLike } from "./types";

export function createSnapshot<T, E>(
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

export function toThrowable(error: unknown): unknown {
  if (error instanceof Error) {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return Object.assign(new Error(String(error.message)), error);
  }

  return error;
}

export function toErrorLike<E extends ErrorLike>(error: unknown): E {
  if (error instanceof Error) {
    return { message: error.message, name: error.name, stack: error.stack } as E;
  }

  if (typeof error === "string") {
    return { message: error } as E;
  }

  // TODO: handle this case better
  return { message: "UNKNOWN_ERROR", DUMP: error } as unknown as E;
}

export function isThenable<T>(value: unknown): value is PromiseLike<T> {
  return (
    (typeof value === "object" || typeof value === "function") &&
    (value !== null || value !== undefined) &&
    typeof (value as { then?: unknown }).then === "function"
  );
}
