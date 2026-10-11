import type { Column } from "../../column";
import type { OperationContext, Value } from "../../types";
import type { LazyCache } from "../cache/lazy-cache";

export interface Frame<T> {
  readonly value: T;
  readonly cache: LazyCache<string, Column<Value>, OperationContext>;
}
