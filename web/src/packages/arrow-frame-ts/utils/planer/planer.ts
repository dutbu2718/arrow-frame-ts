import { Table, Vector } from "apache-arrow";
import type {
  Operation,
  OperationContext,
  SourceLoader,
  Value,
} from "../../types";
import { validateColumnLength } from "../../utils";
import { LazyCache } from "../cache/lazy-cache";
import { Column } from "../../column";
import { initializeTableColumns } from "./utils";
import type { Frame } from "./types";
import { Graph } from "../graph/graph";

/**
 * @description
 * The planer registers deferred computations for execution.
 */
export class Planer {
  private sourceRows!: number;
  private selections: readonly string[] | undefined;

  execute(
    program: readonly Operation[],
    source: SourceLoader<Table>,
    cache: LazyCache<string, Column<Value>>,
    graph: Graph,
  ): Frame<Table> {
    const table = source();

    if (!cache.isInitialized) {
      initializeTableColumns(table, cache, graph);
    }

    this.sourceRows = table.numRows;

    this.buildPlan(program, cache, graph);

    const output: Record<string, Vector> = {};
    const ids = this.selections ?? Array.from(cache.keys());

    const context: OperationContext = {
      col: (key) => {
        return cache.get(key);
      },
    } as const;

    for (const id of ids) {
      output[id] = cache.evaluate(id, context).vector;
    }

    return {
      value: new Table(output),
      cache: cache,
      graph: graph,
    };
  }

  private buildPlan(
    program: readonly Operation[],
    cache: LazyCache<string, Column<Value>>,
    graph: Graph,
  ) {
    for (const operation of program) {
      switch (operation.operation) {
        case "derive":
          graph.add(operation.id);

          for (const columnId of operation.deps ?? []) {
            graph.connect(operation.id, columnId);
          }

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
