import type { SignalAdapter } from "../reactivity";
import type { ColumnData, ColumnMap, Columns, DeriveFn } from "./types";
import { createDerive } from "./utils";

export class DataFrame<T extends ColumnMap> {
  private constructor(
    private readonly runtime: SignalAdapter,
    private readonly columns: Columns<T>,
  ) {}

  static from<T extends ColumnMap>(
    runtime: SignalAdapter,
    data: T,
  ): DataFrame<T> {
    const columns = Object.fromEntries(
      Object.entries(data).map(([id, column]) => [id, () => column]),
    ) as Columns<T>;

    return new DataFrame(runtime, columns);
  }

  derive<K extends string, R extends ColumnData>(
    id: K,
    fn: DeriveFn<T, R>,
  ): DataFrame<T & Record<K, R>> {
    if (id in this.columns) {
      throw new Error(`Column "${id}" already exists`);
    }

    const column = createDerive(this.runtime, this.columns, fn);

    return new DataFrame(this.runtime, {
      ...this.columns,
      [id]: column,
    } as Columns<T & Record<K, R>>);
  }

  select<K extends keyof T>(...ids: K[]): Pick<Columns<T>, K> {
    return Object.fromEntries(
      ids.map((id) => {
        if (!(id in this.columns)) {
          throw new Error(`Unknown column "${String(id)}"`);
        }

        return [id, this.columns[id]];
      }),
    ) as Pick<Columns<T>, K>;
  }
}
