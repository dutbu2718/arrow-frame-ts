import type { Vector } from "apache-arrow";

export function validateColumnLength(
  id: string,
  column: Vector,
  expectedLength: number,
): void {
  if (column.length !== expectedLength) {
    throw new Error(
      `Column "${id}" has ${column.length} rows; expected ${expectedLength}`,
    );
  }
}
