import type { Column } from "../../column";
import type { Value } from "../../types";
import type { LazyCache } from "../cache/lazy-cache";

export interface FrameSnapshot<T> {
  readonly value: T;
  readonly cache: LazyCache<string, Column<Value>>;
}
