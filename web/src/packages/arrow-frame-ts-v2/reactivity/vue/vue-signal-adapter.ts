import { shallowRef, computed as vueComputed, watchEffect } from "vue";
import { pauseTracking, resetTracking } from "@vue/reactivity";
import type {
  Getter,
  MaybePromise,
  OnCleanup,
  Setter,
  SignalAdapter,
} from "../core/adapters";

export const VUE_SIGNAL_ADAPTER: SignalAdapter = {
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
    const value = shallowRef<MaybePromise<T>>();
    let previous: T | undefined;

    watchEffect((onWatcherCleanup) => {
      const result = fn(previous, (cleanup) => {
        onWatcherCleanup(cleanup);
      });

      value.value = result;

      if (result instanceof Promise) {
        result.then((resolved) => {
          previous = resolved;
        });
      } else {
        previous = result;
      }
    });

    return () => value.value!;
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
