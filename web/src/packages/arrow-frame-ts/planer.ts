import { Table, Vector } from "apache-arrow";
import type { Operation } from "./types";
import { gatherColumn } from "./utils";
import { ColumnCache } from "./column-cache";

export class Planer {
  private readonly cache: ColumnCache;

  private rows: Uint32Array | undefined;
  private rowCount: number;
  private selections: readonly string[] | undefined;

  constructor(source: Table) {
    this.cache = new ColumnCache(source);
    this.rowCount = source.numRows;
  }

  execute(program: readonly Operation[]) {
    for (const operation of program) {
      switch (operation.operation) {
        case "derive":
          this.cache.lazyDerive(operation.id, operation.compute);
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
      const column = this.cache.get(id);

      output[id] =
        this.rows === undefined
          ? column.vector
          : gatherColumn(column.vector, this.rows, this.rowCount);
    }

    return new Table(output);
  }
}
