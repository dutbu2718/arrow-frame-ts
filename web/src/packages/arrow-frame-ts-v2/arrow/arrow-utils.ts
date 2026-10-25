import type { Table } from "apache-arrow";
import type { ColumnarData } from "../core/data-frame";

export function fromArrow(table: Table): ColumnarData {
  const columns: ColumnarData = {};

  for (const field of table.schema.fields) {
    const vector = table.getChild(field.name);

    if (!vector) {
      throw new Error(`Column "${field.name}" not found`);
    }

    columns[field.name] = vector;
  }

  return columns;
}
