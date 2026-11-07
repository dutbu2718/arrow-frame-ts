export type ErrorLike = {
  message: string;
  name?: string;
  stack?: string;
  [key: string]: any;
};

export type ReactivePromiseStatus = "pending" | "resolved" | "rejected";

export interface ReactivePromise<T, E = ErrorLike> {
  value: T | undefined;
  error: E | undefined;
  isPending: boolean;
  isResolved: boolean;
  isRejected: boolean;
  status: ReactivePromiseStatus;

  /**
   * @description
   * Returns the value, or throws if `error` is set.
   */
  valueOrThrow: () => T | undefined;
}
