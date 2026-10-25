import { shallowRef, computed as vueComputed } from "vue";
import { pauseTracking, resetTracking } from "@vue/reactivity";
import type {
  Getter,
  MaybePromise,
  OnCleanup,
  Setter,
  SignalAdapter,
} from "../core/reactivity";

export const VUE_RUNTIME: SignalAdapter = {
  signal: function <T>(initial: T): { get: Getter<T>; set: Setter<T> } {
    const ref = shallowRef(initial);

    return {
      get: () => ref.value,
      set: (value) => {
        ref.value = value;
      },
    };
  },

  computed: function <T>(fn: () => T): Getter<T> {
    const value = vueComputed(fn);

    return () => value.value;
  },

  memo<T>(
    fn: (previous: T | undefined, onCleanup: OnCleanup) => MaybePromise<T>,
  ): Getter<MaybePromise<T>> {
    let previous: T | undefined;
    let cleanup: (() => void) | undefined;

    // Todo: need to look how solid createMemo handle async signals
    // How should async functional reactive programming work...
    let asyncVersion = 0;

    const value = vueComputed<MaybePromise<T>>(() => {
      cleanup?.();
      cleanup = undefined;

      const currentAsyncVersion = ++asyncVersion;

      const result = fn(previous, (callback) => {
        cleanup = callback;
      });

      if (result instanceof Promise) {
        result.then((resolved) => {
          if (currentAsyncVersion === asyncVersion) {
            previous = resolved;
          }
        });
      } else {
        previous = result;
      }

      return result;
    });

    return () => value.value;
  },

  untrack: function <T>(fn: () => T): T {
    try {
      pauseTracking();

      return fn();
    } finally {
      resetTracking();
    }
  },
};
