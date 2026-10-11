import type { Table } from "apache-arrow";
import { Column } from "../../column";
import type { OperationContext, Value } from "../../types";
import { LazyCache } from "../cache/lazy-cache";

export function createCacheFromTable(table: Table) {
  const cache = new LazyCache<string, Column<Value>, OperationContext>();

  for (const { name } of table.schema.fields) {
    cache.defer(name, {
      thunk: () => Column.from<Value>(table.getChild(name)!),
    });
  }

  return cache;
}

export function createCacheByIds(
  ids: readonly string[],
  cache: LazyCache<string, Column<Value>, OperationContext>,
): LazyCache<string, Column<Value>, OperationContext> {
  const newCache = new LazyCache<string, Column<Value>, OperationContext>();

  for (const id of ids) {
    const copy = cache.copyEntry(id);

    if (copy) {
      newCache.addEntry(id, copy);
    }
  }

  return newCache;
}

export function cloneCache(
  cache: LazyCache<string, Column<Value>, OperationContext>,
): LazyCache<string, Column<Value>, OperationContext> {
  const newCache = new LazyCache<string, Column<Value>, OperationContext>();

  for (const key of cache.keys()) {
    newCache.addEntry(key, cache.copyEntry(key)!);
  }

  return newCache;
}
