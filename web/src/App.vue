<script setup lang="ts">
import { tableFromArrays, vectorFromArray } from "apache-arrow";
import { Column } from "./packages/arrow-frame-ts/column.ts";
import { Frame } from "./packages/arrow-frame-ts/frame.ts";
import type { Value } from "./packages/arrow-frame-ts/types.ts";
import { onMounted } from "vue";

const N = 1000000;

const source = tableFromArrays({
  energy: Float64Array.from({ length: N }, () =>
    Math.round(100 + Math.random() * 400),
  ),
  atemp: Float64Array.from({ length: N }, () =>
    Math.round(5 + Math.random() * 30),
  ),
});

const frame = Frame.from(source)
  .derived({
    id: "kpi",
    compute: (c) => {
      const energy = c.get("energy").array as Float64Array;
      const atemp = c.get("atemp").array as Float64Array;

      const kpi = new Float64Array(energy.length);

      for (let i = 0; i < kpi.length; i++) {
        kpi[i] = Math.round(energy[i] / atemp[i]);
      }

      return Column.fromArrow<Value>(vectorFromArray(kpi));
    },
  })
  .derived({
    id: "12",
    compute: (c) => {
      const kpi = c.get("kpi").array as Float64Array;

      const n = kpi.length;
      const r12 = new Float64Array(n);

      let sum = 0;
      for (let i = 0; i < n; i++) {
        sum += kpi[i];
        if (i >= 12) sum -= kpi[i - 12];
        if (i >= 11) r12[i] = sum;
      }

      return Column.fromArrow<Value>(vectorFromArray(r12));
    },
  });

function run() {
  const t0 = performance.now();
  const result = frame.collect();
  const ms = (performance.now() - t0).toFixed(1);

  console.log(`${result.numRows} rows in ${ms} ms`);
  console.table(
    result
      .slice(N - 35, N)
      .toArray()
      .map((row) => row.toJSON()),
  );
}

onMounted(() => {
  run();
});
</script>

<template>
  <button @click="run">Run frame again</button>
</template>
