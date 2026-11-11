import { createSnapshot, type SignalAdapter } from "../reactivity";
import type { ColumnData, ColumnMap, Columns, DeriveFn, Simplify } from "./types";
import { createDerive } from "./utils";

export class DataFrame<T extends ColumnMap> {
  private constructor(
    private readonly runtime: SignalAdapter,
    private readonly columns: Columns<T>,
  ) {}

  static from<T extends ColumnMap>(runtime: SignalAdapter, data: T): DataFrame<T> {
    const columns = Object.fromEntries(
      Object.entries(data).map(([id, column]) => {
        const snapshot = createSnapshot(column, undefined, "resolved");
        return [id, () => snapshot];
      }),
    ) as unknown as Columns<T>;

    return new DataFrame(runtime, columns);
  }

  get cols(): Readonly<Columns<T>> {
    return this.columns;
  }

  derive<K extends string, R extends ColumnData>(
    id: K,
    fn: DeriveFn<T, R>,
  ): DataFrame<Simplify<T & Record<K, R>>> {
    if (id in this.columns) {
      throw new Error(`Column "${id}" already exists`);
    }

    const column = createDerive(this.runtime, this.columns, fn);

    const columns = { ...this.columns, [id]: column } as unknown as Columns<T & Record<K, R>>;

    return new DataFrame(this.runtime, columns);
  }

  select<K extends keyof T>(...ids: K[]): DataFrame<Simplify<Pick<T, K>>> {
    const columns = Object.fromEntries(
      ids.map((id) => {
        if (!(id in this.columns)) {
          throw new Error(`Unknown column "${String(id)}"`);
        }

        return [id, this.columns[id]];
      }),
    ) as unknown as Columns<Pick<T, K>>;

    return new DataFrame(this.runtime, columns);
  }
}
