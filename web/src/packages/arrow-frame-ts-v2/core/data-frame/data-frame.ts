import type { SignalAdapter } from "../reactivity";
import type { Columns, ColumnarData, DeriveFn } from "./types";
import { createDerive } from "./utils";

export class DataFrame {
  private constructor(
    private readonly sig: SignalAdapter,
    private readonly columns: Columns,
  ) {}

  static from(sig: SignalAdapter, data: ColumnarData = {}): DataFrame {
    const columns: Columns = {};

    for (const [id, values] of Object.entries(data)) {
      if (id in columns) {
        throw new Error(`Column "${id}" already exists`);
      }

      columns[id] = () => values;
    }

    return new DataFrame(sig, {});
  }

  derive<T>(id: string, fn: DeriveFn<T>) {
    if (id in this.columns) {
      throw new Error(`Column "${id}" already exists`);
    }

    const column = createDerive(this.sig, this.columns, fn);

    return new DataFrame(this.sig, {
      ...this.columns,
      [id]: column,
    });
  }

  select<K extends keyof Columns>(...ids: K[]): Pick<Columns, K> {
    return Object.fromEntries(ids.map((id) => [id, this.columns[id]])) as Pick<
      Columns,
      K
    >;
  }
}
