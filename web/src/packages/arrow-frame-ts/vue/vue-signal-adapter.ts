import { shallowRef, computed as vueComputed, watchEffect } from "vue";
import { pauseTracking, resetTracking } from "@vue/reactivity";
import type { Getter, MaybePromise, OnCleanup, Setter, SignalAdapter } from "../core/reactivity";
import type { ErrorLike, ReactivePromise } from "../core/reactivity/reactive-promise/types";
import { createMemo } from "../core/reactivity/utils/create-memo";

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

  effect: function (fn: (onCleanup: OnCleanup) => void): () => void {
    return watchEffect(fn, { flush: "sync" });
  },

  memo<T, E extends ErrorLike = ErrorLike>(
    fn: (previous: T | undefined, onCleanup: OnCleanup) => MaybePromise<T>,
  ): Getter<ReactivePromise<T, E>> {
    return createMemo<T, E>(VUE_RUNTIME, fn);
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
