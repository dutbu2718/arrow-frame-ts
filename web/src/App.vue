<script setup lang="ts">
import { Table, tableFromArrays, vectorFromArray } from "apache-arrow";
import { Column } from "./packages/arrow-frame-ts/column.ts";
import { DataFrame } from "./packages/arrow-frame-ts/data-frame.ts";
import type { Value } from "./packages/arrow-frame-ts/types.ts";
import { computed, onMounted, ref, shallowReactive } from "vue";
import type { Frame } from "./packages/arrow-frame-ts/utils/planer/types.ts";
import ArrowFrameGraphViewer from "./components/arrow-frame-graph-viewer/ArrowFrameGraphViewer.vue";

enum FrameId {
  All = "All",
  Kpi = "KPI",
  R12 = "R12",
}

interface RunOptions {
  id: FrameId;
  run: () => Frame<Table>;
}

const N = 1000000;
const P = 35;

const source = loadArrow();

const results = shallowReactive(new Map<string, Frame<Table>>());

const lastRun = ref<FrameId>(FrameId.All);

const lastResult = computed(() => results.get(lastRun.value));

const base = computed(() => {
  return DataFrame.from(() => source)
    .derive({
      id: "kpi",
      compute: (c) => {
        const energy = c.col("energy").values as Float64Array;
        const atemp = c.col("atemp").values as Float64Array;

        const kpi = new Float64Array(energy.length);

        for (let i = 0; i < kpi.length; i++) {
          kpi[i] = Math.round(energy[i] / atemp[i]);
        }

        return Column.from<Value>(vectorFromArray(kpi));
      },
      deps: ["energy", "atemp"],
    })
    .derive({
      id: "r12",
      compute: (c) => {
        const kpi = c.col("kpi").values as Float64Array;

        const n = kpi.length;
        const r12 = new Float64Array(n);

        let sum = 0;
        for (let i = 0; i < n; i++) {
          sum += kpi[i];
          if (i >= 12) sum -= kpi[i - 12];
          if (i >= 11) r12[i] = sum;
        }

        return Column.from<Value>(vectorFromArray(r12));
      },
      deps: ["kpi"],
    })
    .select();
});

const selectA = computed(() => {
  return base.value
    .derive({
      id: "kpiTrend",
      compute: (c) => {
        const kpi = c.col("kpi").values as Float64Array;
        const out = kpi.slice();

        return Column.from<Value>(vectorFromArray(out));
      },
      deps: ["kpi"],
    })
    .select(["kpi", "kpiTrend"]);
});

const selectB = computed(() => {
  return base.value.select(["r12"]);
});

const OPTIONS: RunOptions[] = [
  { id: FrameId.All, run: () => base.value!.collect() },
  { id: FrameId.Kpi, run: () => selectA.value!.collect() },
  { id: FrameId.R12, run: () => selectB.value!.collect() },
];

onMounted(() => {
  run(OPTIONS[0]);
});

function loadArrow() {
  return tableFromArrays({
    energy: Float64Array.from({ length: N }, () =>
      Math.round(100 + Math.random() * 400),
    ),
    atemp: Float64Array.from({ length: N }, () =>
      Math.round(5 + Math.random() * 30),
    ),
  });
}

function run({ id, run }: RunOptions) {
  lastRun.value = id;

  const t0 = performance.now();
  const frame = run();
  const ms = (performance.now() - t0).toFixed(1);

  console.log(`[${id}] ${frame.value.numRows} rows in ${ms} ms`);
  console.table(
    frame.value
      .slice(Math.max(0, frame.value.numRows - P), frame.value.numRows)
      .toArray()
      .map((row) => row.toJSON()),
  );

  results.set(id, frame);
}
</script>

<template>
  <button v-for="option in OPTIONS" :key="option.id" @click="run(option)">
    Run: {{ option.id }}
  </button>

  <ArrowFrameGraphViewer
    v-if="lastResult"
    :nodes="[...lastResult.graph.nodes.values()]"
  />
</template>
