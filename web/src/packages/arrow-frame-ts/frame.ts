import type { Table } from "apache-arrow";
import type {
  DeriveOperation,
  Operation,
  Schema,
  SelectOperation,
} from "./types";
import { Planer } from "./planer";

export class Frame<S extends Schema> {
  constructor(
    private readonly source: Table,
    private readonly program: Operation[],
  ) {}

  static from<S extends Schema>(source: Table) {
    return new Frame<S>(source, []);
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

  collect() {
    return new Planer(this.source).execute(this.program);
  }

  private append<S extends Schema>(operation: Operation) {
    return new Frame<S>(this.source, [...this.program, operation]);
  }
}
