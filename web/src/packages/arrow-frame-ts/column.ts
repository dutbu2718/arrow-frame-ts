import { Vector, vectorFromArray } from "apache-arrow";
import type { Value } from "./types";

export class Column<T extends Value> {
  private constructor(private readonly _vector: Vector) {}

  static fromArrow<T extends Value>(vector: Vector): Column<T> {
    return new Column<T>(vector);
  }

  static fromArray<T extends Value>(values: readonly T[]): Column<T> {
    return new Column<T>(vectorFromArray([...values]));
  }

  get vector() {
    return this._vector;
  }

  get length(): number {
    return this._vector.length;
  }

  get(index: number): T {
    return this.vector.get(index) as T;
  }
}
