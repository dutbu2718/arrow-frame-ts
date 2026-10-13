import type { Table } from "apache-arrow";
import { Column } from "../../column";
import type { Value } from "../../types";
import { LazyCache } from "../cache/lazy-cache";
import type { Graph } from "../graph/graph";

export function initializeTableColumns(
  table: Table,
  cache: LazyCache<string, Column<Value>>,
  graph: Graph,
) {
  for (const { name } of table.schema.fields) {
    graph.add(name);

    cache.defer(name, {
      thunk: () => Column.from<Value>(table.getChild(name)!),
    });
  }

  return cache;
}

export function createCacheByIds(
  ids: readonly string[],
  cache: LazyCache<string, Column<Value>>,
): LazyCache<string, Column<Value>> {
  const newCache = new LazyCache<string, Column<Value>>();

  for (const id of ids) {
    const copy = cache.copyEntry(id);

    if (copy) {
      newCache.addEntry(id, copy);
    }
  }

  return newCache;
}

export function cloneCache(
  cache: LazyCache<string, Column<Value>>,
): LazyCache<string, Column<Value>> {
  const newCache = new LazyCache<string, Column<Value>>();

  for (const key of cache.keys()) {
    newCache.addEntry(key, cache.copyEntry(key)!);
  }

  return newCache;
}
