import type { Table } from "apache-arrow";
import type {
  CacheLoader,
  DeriveOperation,
  Operation,
  Schema,
  SelectOperation,
  SourceLoader,
} from "./types";
import { Planer } from "./utils/planer/planer";
import type { Frame } from "./utils/planer/types";

/**
 * @description
 * A Fluent API to build operations into a program.
 */
export class DataFrame<S extends Schema> {
  constructor(
    private readonly program: Operation[],
    private readonly source: SourceLoader<Table>,
    private readonly cache: CacheLoader | undefined,
  ) {}

  static from<S extends Schema>(source: SourceLoader<Table>) {
    return new DataFrame<S>([], source, undefined);
  }

  static fromFrame<S extends Schema>(frame: () => Frame<Table>) {
    return new DataFrame<S>(
      [],
      () => frame().value,
      () => frame().cache,
    );
  }

  derive(option: Pick<DeriveOperation, "id" | "compute">) {
    return this.append(
      {
        operation: "derive",
        id: option.id,
        compute: option.compute,
      } satisfies DeriveOperation,
    );
  }

  select(ids?: readonly string[]) {
    return this.append(
      {
        operation: "select",
        columns: ids,
      } satisfies SelectOperation,
    );
  }

  collect(): Frame<Table> {
    return new Planer().execute(this.program, this.source, this.cache);
  }

  private append<S extends Schema>(operation: Operation) {
    return new DataFrame<S>(
      [...this.program, operation],
      this.source,
      this.cache,
    );
  }
}
