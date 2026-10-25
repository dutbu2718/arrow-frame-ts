import type { Table, Vector } from "apache-arrow";
import type { ColumnData } from "../core/data-frame/types";

export function fromArrow<T extends Record<string, ColumnData<Vector>>>(
  table: Table,
): T {
  const columns: Record<string, ColumnData<Vector>> = {};

  for (const field of table.schema.fields) {
    const vector = table.getChild(field.name);

    if (!vector) {
      throw new Error(`Column "${field.name}" not found`);
    }

    columns[field.name] = { data: vector };
  }

  return columns as T;
}
