import { Table, Vector } from "apache-arrow";
import type { CacheLoader, Operation, SourceLoader, Value } from "../../types";
import { validateColumnLength } from "../../utils";
import { LazyCache } from "../cache/lazy-cache";
import { Column } from "../../column";
import { createCache, pruneCache } from "./utils";
import type { FrameSnapshot } from "./types";

export class Planer {
  private sourceRows!: number;
  private selections: readonly string[] | undefined;

  execute(
    program: readonly Operation[],
    source: SourceLoader<Table>,
    cache?: CacheLoader,
  ): FrameSnapshot<Table> {
    const _source = source();

    // Init
    const _cache = cache ? cache() : createCache(_source);
    this.sourceRows = _source.numRows;

    this.buildPlan(program, _cache);

    const output: Record<string, Vector> = {};
    const ids = this.selections ?? Array.from(_cache.keys());

    for (const id of ids) {
      output[id] = _cache.get(id).vector;
    }

    return {
      value: new Table(output),
      cache: pruneCache(ids, _cache),
    };
  }

  private buildPlan(
    program: readonly Operation[],
    cache: LazyCache<string, Column<Value>>,
  ) {
    for (const operation of program) {
      switch (operation.operation) {
        case "derive":
          cache.defer(operation.id, {
            thunk: operation.compute,
            validate: (column) => {
              validateColumnLength(
                operation.id,
                column.vector,
                this.sourceRows,
              );
            },
          });
          break;

        case "select":
          this.selections = operation.columns;
          break;

        default:
          throw new Error("Unsupported operation");
      }
    }
  }
}
