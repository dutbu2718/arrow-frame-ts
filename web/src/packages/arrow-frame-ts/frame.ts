import type { Table } from "apache-arrow";
import type {
  Schema,
  Operation,
  DeriveOperation,
  SelectOperation,
} from "./types";

export class Frame<S extends Schema> {
  constructor(
    private readonly source: Table,
    private readonly program: Operation[],
  ) {}

  from<S extends Schema>(source: Table) {
    return new Frame<S>(source, []);
  }

  derived(option: Pick<DeriveOperation, "id" | "compute">) {
    return this.add({
      _operation: "derive",
      id: option.id,
      compute: option.compute,
    } satisfies DeriveOperation);
  }

  select(ids: readonly string[]) {
    return this.add({
      _operation: "select",
      columns: [...ids],
    } satisfies SelectOperation);
  }

  collect() {}

  private add<S extends Schema>(operation: Operation) {
    return new Frame<S>(this.source, [...this.program, operation]);
  }
}
