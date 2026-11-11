<script setup lang="ts">
import { Float64, tableFromArrays, Vector, vectorFromArray } from "apache-arrow";
import { computed, ref } from "vue";
import {
  DataFrame,
  type ColumnData,
  type ColumnMap,
} from "./packages/arrow-frame-ts/core/data-frame/index.ts";
import { VUE_SIGNAL_ADAPTER } from "./packages/arrow-frame-ts/vue/index.ts";
import { fromArrow } from "./packages/arrow-frame-ts/arrow/arrow-utils.ts";

enum FrameId {
  All = "All",
  Kpi = "KPI",
  R12 = "R12",
}

interface RunOptions {
  id: FrameId;
  frame: DataFrame<ColumnMap>;
}

type OriginalData = {
  energy: ColumnData<Vector<Float64>>;
  atemp: ColumnData<Vector<Float64>>;
};

const N = 1_000_000;
const P = 35;

function loadData() {
  return tableFromArrays({
    energy: Float64Array.from({ length: N }, () => Math.round(100 + Math.random() * 400)),
    atemp: Float64Array.from({ length: N }, () => Math.round(5 + Math.random() * 30)),
  });
}

const source = loadData();
const multiplier = ref(1);

const base = DataFrame.from(VUE_SIGNAL_ADAPTER, fromArrow<OriginalData>(source))
  .derive("kpi", (c) => {
    console.count("[derive] kpi");

    const energy = c.energy().valueOrThrow()!.data.toArray();
    const atemp = c.atemp().valueOrThrow()!.data.toArray();

    const kpi = new Float64Array(energy.length);

    for (let i = 0; i < kpi.length; i++) {
      kpi[i] = Math.round((energy[i] / atemp[i]) * multiplier.value);
    }

    return { data: vectorFromArray(kpi) } as ColumnData<Vector<Float64>>;
  })
  .derive("r12", (c) => {
    console.count("[derive] r12");

    const kpi = c.kpi().valueOrThrow()!.data.toArray();

    const r12 = new Float64Array(kpi.length);
    let sum = 0;

    for (let i = 0; i < kpi.length; i++) {
      sum += kpi[i];
      if (i >= 12) sum -= kpi[i - 12];
      if (i >= 11) r12[i] = sum;
    }

    return { data: vectorFromArray(r12) } as ColumnData<Vector<Float64>>;
  });

const selectAll = base.select("energy", "atemp", "kpi", "r12");

const selectKpi = base
  .derive("kpiTrend", (c) => {
    console.count("[derive] kpiTrend");

    const kpi = c.kpi().valueOrThrow()!.data.toArray();

    return { data: vectorFromArray(kpi.slice()) } as ColumnData<Vector<Float64>>;
  })
  .select("kpi", "kpiTrend");

const selectR12 = base.select("r12");

const OPTIONS: RunOptions[] = [
  { id: FrameId.All, frame: selectAll },
  { id: FrameId.Kpi, frame: selectKpi },
  { id: FrameId.R12, frame: selectR12 },
];

const lastRun = ref<FrameId>();
const lastResult = ref<Record<string, Vector>>();

const rowCount = computed(() => {
  const first = Object.values(lastResult.value ?? {})[0];
  return first?.length ?? 0;
});

function readColumns<T extends ColumnMap>(frame: DataFrame<T>): Record<string, Vector> {
  return Object.fromEntries(
    Object.entries(frame.cols).map(([id, getter]) => [id, getter().valueOrThrow()!.data]),
  );
}

function run({ id, frame }: RunOptions) {
  lastRun.value = id;

  const t0 = performance.now();
  const data = readColumns(frame);
  const ms = (performance.now() - t0).toFixed(1);

  lastResult.value = data;

  const first = Object.values(data)[0];
  const length = first?.length ?? 0;
  const count = Math.min(P, length);
  const start = length - count;

  console.log(`[${id}] ${length} rows in ${ms} ms`);

  console.table(
    Array.from({ length: count }, (_, offset) => {
      const index = start + offset;

      return Object.fromEntries(
        Object.entries(data).map(([key, vector]) => [key, vector.get(index)]),
      );
    }),
  );
}
</script>

<template>
  <button v-for="option in OPTIONS" :key="option.id" @click="run(option)">
    Run: {{ option.id }}
  </button>

  <p v-if="lastResult">Last run: {{ lastRun }} · {{ rowCount.toLocaleString() }} rows</p>

  <label>
    Multiplier
    <input v-model.number="multiplier" type="number" step="1" />
  </label>
</template>
