import type { Table } from "apache-arrow";
import { Column } from "./column";
import type { DeriveOperation, RuntimeColumnCollection, Value } from "./types";
import { validateColumnLength } from "./utils";

type ColumnCompute = DeriveOperation["compute"];

export class ColumnCache implements RuntimeColumnCollection {
  private readonly materialized = new Map<string, Column<Value>>();
  private readonly computes = new Map<string, ColumnCompute>();

  constructor(private readonly source: Table) {}

  get(id: string): Column<Value> {
    const materialized = this.materialized.get(id);

    if (materialized) {
      return materialized;
    }

    const compute = this.computes.get(id);

    if (compute) {
      const column = compute(this);
      validateColumnLength(column.vector, this.source.numRows, id);

      this.materialized.set(id, column);
      this.computes.delete(id);

      return column;
    }

    const column = this.loadFromSource(id);
    this.materialized.set(id, column);

    return column;
  }

  set(id: string, column: Column<Value>): void {
    this.materialized.delete(id);
    this.computes.set(id, () => column);
  }

  has(id: string): boolean {
    return (
      this.materialized.has(id) ||
      this.computes.has(id) ||
      this.source.getChild(id) != null
    );
  }

  lazyDerive(id: string, compute: ColumnCompute): void {
    if (this.has(id)) {
      throw new Error(`Column "${id}" already exists`);
    }

    this.computes.set(id, compute);
  }

  keys(): string[] {
    return [
      ...new Set([
        ...this.source.schema.fields.map((f) => f.name),
        ...this.materialized.keys(),
        ...this.computes.keys(),
      ]),
    ];
  }

  private loadFromSource(id: string): Column<Value> {
    const vector = this.source.getChild(id);

    if (vector == null) {
      throw new Error(`Unknown column "${id}"`);
    }

    return Column.fromArrow<Value>(vector);
  }
}
