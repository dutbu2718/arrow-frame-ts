<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { MarkerType, useVueFlow, VueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import type { Node as FlowNode, Edge } from "@vue-flow/core";
import type { Node } from "../../packages/arrow-frame-ts/utils/graph/types";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import { useLayout } from "./useLayout";

const props = defineProps<{ nodes: Node[] }>();

const { layout } = useLayout();
const { fitView } = useVueFlow();

const nodes = ref<FlowNode[]>([]);

const edges = computed<Edge[]>(() =>
  props.nodes.flatMap((node) =>
    [...node.downstream].map((target) => ({
      id: `${node.id}->${target}`,
      source: node.id,
      target,
      type: "smoothstep",
      markerEnd: MarkerType.ArrowClosed,
      style: { stroke: "#64748b", strokeWidth: 2 },
    })),
  ),
);

watch(
  () => props.nodes,
  (values) => {
    nodes.value = values.map((node, index) => ({
      id: node.id,
      type: "default",
      position: {
        x: (index % 4) * 220,
        y: Math.floor(index / 4) * 140,
      },
      data: {
        label: `${node.id}${node.dirty ? " (dirty)" : ""}`,
      },
      style: {
        background: node.dirty ? "#fee2e2" : "#dcfce7",
        border: "1px solid #9ca3af",
        borderRadius: "8px",
        padding: "10px",
        width: "140px",
      },
    }));
  },
  { immediate: true },
);

watch(
  () => nodes,
  async () => {
    await nextTick();
    nodes.value = layout(nodes.value, edges.value, "LR");
    await nextTick();
    fitView();
  },
  { immediate: true, flush: "post" },
);
</script>

<template>
  <div class="graph-container">
    <VueFlow :nodes="nodes" :edges="edges" fit-view-on-init>
      <Background pattern-color="#d1d5db" :gap="20" />
    </VueFlow>
  </div>
</template>

<style scoped>
.graph-container {
  width: 100%;
  height: 500px;
  border: 1px solid #ddd;
  background-color: white;
}
</style>
