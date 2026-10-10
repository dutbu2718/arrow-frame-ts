import { Table, Vector } from "apache-arrow";
import type { Operation, Value } from "./types";
import { validateColumnLength } from "./utils";
import { LazyCache } from "./utils/cache/lazy-cache";
import { Column } from "./column";

export class Planer {
  private readonly cache: LazyCache<string, Column<Value>>;
  private readonly sourceRows: number;

  private rowCount: number;
  private selections: readonly string[] | undefined;

  constructor(source: Table) {
    this.cache = createPlanerCache(source);
    this.sourceRows = source.numRows;
    this.rowCount = source.numRows;
  }

  execute(program: readonly Operation[]) {
    for (const operation of program) {
      switch (operation.operation) {
        case "derive":
          this.cache.defer(operation.id, {
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

    const output: Record<string, Vector> = {};

    for (const id of this.selections ?? this.cache.keys()) {
      output[id] = this.cache.get(id).vector;
    }

    return new Table(output);
  }
}

function createPlanerCache(source: Table) {
  const cache = new LazyCache<string, Column<Value>>();

  for (const { name } of source.schema.fields) {
    cache.defer(name, {
      thunk: () => Column.fromArrow<Value>(source.getChild(name)!),
    });
  }

  return cache;
}
