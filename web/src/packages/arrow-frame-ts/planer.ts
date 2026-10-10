import { Table, Vector } from "apache-arrow";
import type { Operation, SourceLoader, Value } from "./types";
import { validateColumnLength } from "./utils";
import { LazyCache } from "./utils/cache/lazy-cache";
import { Column } from "./column";

export class Planer {
  private cache!: LazyCache<string, Column<Value>>;
  private sourceRows!: number;

  private selections: readonly string[] | undefined;

  constructor(private source: SourceLoader<Table>) {}

  execute(program: readonly Operation[]) {
    const source = this.source();

    // Init
    this.cache = createPlanerCache(source);
    this.sourceRows = source.numRows;

    this.buildPlan(program);

    const output: Record<string, Vector> = {};

    for (const id of this.selections ?? this.cache.keys()) {
      output[id] = this.cache.get(id).vector;
    }

    return new Table(output);
  }

  private buildPlan(program: readonly Operation[]) {
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
