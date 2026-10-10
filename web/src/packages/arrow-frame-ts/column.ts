import { Vector } from "apache-arrow";
import type { Value } from "./types";

export class Column<T extends Value> {
  private constructor(private readonly _vector: Vector) {}

  static from<T extends Value>(vector: Vector): Column<T> {
    return new Column<T>(vector);
  }

  get vector() {
    return this._vector;
  }

  get values() {
    return this._vector.toArray();
  }

  get length(): number {
    return this._vector.length;
  }

  get(index: number): T {
    return this.vector.get(index) as T;
  }
}
