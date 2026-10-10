import { vectorFromArray } from "apache-arrow";
import type { Vector } from "apache-arrow";

export function createRowIndices(length: number): Uint32Array {
  if (!Number.isSafeInteger(length) || length < 0 || length > 0xffff_ffff) {
    throw new RangeError(`Invalid row count: ${length}`);
  }

  const indices = new Uint32Array(length);

  for (let i = 0; i < length; i++) {
    indices[i] = i;
  }

  return indices;
}

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

export function gatherColumn(
  column: Vector,
  indices: Uint32Array,
  length: number,
): Vector {
  if (!Number.isSafeInteger(length) || length < 0 || length > indices.length) {
    throw new RangeError(`Invalid gather length: ${length}`);
  }

  const values: unknown[] = [];

  for (let i = 0; i < length; i++) {
    values.push(column.get(indices[i]!));
  }

  return vectorFromArray(values, column.type);
}
