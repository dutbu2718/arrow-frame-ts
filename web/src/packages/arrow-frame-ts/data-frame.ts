import type { Table } from "apache-arrow";
import type {
  CacheLoader,
  DeriveOperation,
  Operation,
  SelectOperation,
  SourceLoader,
  Value,
} from "./types";
import { Planer } from "./utils/planer/planer";
import type { Frame } from "./utils/planer/types";
import type { Column } from "./column";
import { LazyCache } from "./utils/cache/lazy-cache";
import { Graph } from "./utils/graph/graph";

/**
 * @description
 * A Fluent API to build operations into a program.
 */
export class DataFrame {
  constructor(
    private readonly program: Operation[],
    private readonly source: SourceLoader<Table>,
    private readonly cache: LazyCache<string, Column<Value>>,
    private readonly graph: Graph,
  ) {}

  static from(source: SourceLoader<Table>) {
    return new DataFrame([], source, new LazyCache(), new Graph());
  }

  derive(option: Pick<DeriveOperation, "id" | "compute" | "deps">) {
    return this.append({
      operation: "derive",
      id: option.id,
      compute: option.compute,
      deps: option.deps,
    } satisfies DeriveOperation);
  }

  select(ids?: readonly string[]) {
    return this.append({
      operation: "select",
      columns: ids,
    } satisfies SelectOperation);
  }

  collect(): Frame<Table> {
    return new Planer().execute(
      this.program,
      this.source,
      this.cache,
      this.graph,
    );
  }

  private append(operation: Operation) {
    return new DataFrame(
      [...this.program, operation],
      this.source,
      this.cache,
      this.graph,
    );
  }
}
