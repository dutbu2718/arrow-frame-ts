import type { Column } from "../../column";
import type { Value } from "../../types";
import type { LazyCache } from "../cache/lazy-cache";
import type { Graph } from "../graph/graph";

export interface Frame<T> {
  readonly value: T;
  readonly cache: LazyCache<string, Column<Value>>;
  readonly graph: Graph;
}
