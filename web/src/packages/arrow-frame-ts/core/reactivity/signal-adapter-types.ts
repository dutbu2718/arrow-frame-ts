export type MaybePromise<T> = T | Promise<T>;

export type Getter<T> = () => T;
export type Setter<T> = (value: T) => void;
export type Cleanup = () => void;
export type OnCleanup = (cleanup: Cleanup) => void;

export interface SignalAdapter {
  signal<T>(initial: T): {
    get: Getter<T>;
    set: Setter<T>;
  };

  computed<T>(fn: () => T): Getter<T>;

  effect(fn: (onCleanup: OnCleanup) => void): () => void;

  untrack<T>(fn: () => T): T;

  memo<T>(
    fn: (previous: T | undefined, onCleanup: OnCleanup) => MaybePromise<T>,
  ): Getter<MaybePromise<T>>;
}
