import type { Table } from "apache-arrow";
import type { Schema, Operation } from "./types";

export class Frame<S extends Schema> {
  constructor(
    private readonly source: Table,
    private readonly program: Operation[],
  ) {}

  from<S extends Schema>(source: Table) {
    return new Frame<S>(source, []);
  }
}
