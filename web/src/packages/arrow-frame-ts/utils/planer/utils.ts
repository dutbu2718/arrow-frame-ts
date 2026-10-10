import type { Table } from "apache-arrow";
import { Column } from "../../column";
import type { Value } from "../../types";
import { LazyCache } from "../cache/lazy-cache";

export function createCache(table: Table) {
  const cache = new LazyCache<string, Column<Value>>();

  for (const { name } of table.schema.fields) {
    cache.defer(name, {
      thunk: () => Column.fromArrow<Value>(table.getChild(name)!),
    });
  }

  return cache;
}

export function pruneCache(
  selections: readonly string[],
  cache: LazyCache<string, Column<Value>>,
): LazyCache<string, Column<Value>> {
  const newCache = new LazyCache<string, Column<Value>>();

  for (const id of selections) {
    const copy = cache.copyEntry(id);

    if (copy) {
      newCache.addEntry(id, copy);
    }
  }

  return newCache;
}
