import { Vector, vectorFromArray } from "apache-arrow";
import type { Value } from "./types";

export class Column<T extends Value> {
  private _array?: ArrayLike<T> = undefined;

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

  get array() {
    if (this._array !== undefined) {
      this._array;
    }

    this._array = this._vector.toArray();

    return this._array;
  }

  get length(): number {
    return this._vector.length;
  }

  get(index: number): T {
    return this.vector.get(index) as T;
  }
}
