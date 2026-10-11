import type { Table } from "apache-arrow";
import type {
  CacheLoader,
  DeriveOperation,
  Operation,
  SelectOperation,
  SourceLoader,
} from "./types";
import { Planer } from "./utils/planer/planer";
import type { Frame } from "./utils/planer/types";

/**
 * @description
 * A Fluent API to build operations into a program.
 */
export class DataFrame {
  constructor(
    private readonly program: Operation[],
    private readonly source: SourceLoader<Table>,
    private readonly cache: CacheLoader | undefined,
  ) {}

  static from(source: SourceLoader<Table>) {
    return new DataFrame([], source, undefined);
  }

  static fromFrame(frame: () => Frame<Table>) {
    return new DataFrame(
      [],
      () => frame().value,
      () => frame().cache,
    );
  }

  derive(option: Pick<DeriveOperation, "id" | "compute">) {
    return this.append({
      operation: "derive",
      id: option.id,
      compute: option.compute,
    } satisfies DeriveOperation);
  }

  select(ids?: readonly string[]) {
    return this.append({
      operation: "select",
      columns: ids,
    } satisfies SelectOperation);
  }

  collect(): Frame<Table> {
    return new Planer().execute(this.program, this.source, this.cache);
  }

  private append(operation: Operation) {
    return new DataFrame([...this.program, operation], this.source, this.cache);
  }
}
