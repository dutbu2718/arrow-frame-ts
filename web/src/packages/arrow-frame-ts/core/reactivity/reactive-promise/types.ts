export type ErrorLike = {
  message: string;
  name?: string;
  stack?: string;
  [key: string]: any;
};

export type ReactivePromiseStatus = "pending" | "fulfilled" | "rejected";

export interface ReactivePromise<T, E = ErrorLike> {
  value: T | undefined;
  error: E | undefined;
  status: ReactivePromiseStatus;

  /**
   * @description
   * Returns the value, or throws if `error` is set.
   */
  valueOrThrow: () => T | undefined;
}
