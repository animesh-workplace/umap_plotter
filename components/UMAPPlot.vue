<template>
  <div class="flex justify-center">
    <Skeleton class="mb-2" height="24rem" v-if="isLoading" />
    <VChart
      ref="chart"
      class="w-[50rem] h-[50rem]"
      :option="graph_options"
      :class="{ hidden: isLoading }"
    />
  </div>
</template>

<script setup>
import { useUmapDataStore } from "@/stores/umapData";

const props = defineProps({
  data: { type: Array, required: true },
});

const isLoading = ref(true);
const processedData = ref([]);
const umapStore = useUmapDataStore();
const chart = useTemplateRef("chart");

// Process UMAP data with gene expression
processedData.value = umapStore.umapPoints;

const updateProcessedData = () => {
  const umapPoints = umapStore.umapPoints;
  const geneExpressionData = umapStore.geneExpression;

  console.log("checking expression", geneExpressionData);
  if (geneExpressionData == null) {
    return umapPoints;
  }

  return umapPoints.map((point, index) => {
    const cellId = point[2];
    const expression = geneExpressionData[index] || 0;
    return [point[0], point[1], cellId, expression];
  });
};

// Calculate min/max expression values for visualization scaling
const expressionRange = computed(() => {
  if (!umapStore.geneExpression) return { min: 0, max: 0 };

  const values = Object.values(umapStore.geneExpression);
  return {
    min: Math.floor(Math.min(...values)),
    max: Math.ceil(Math.max(...values)),
  };
});

const graph_options = ref({
  animation: false,
  yAxis: {
    type: "value",
    axisLabel: {
      fontFamily: "Averta",
      fontWeight: 500,
    },
  },
  xAxis: {
    type: "value",
    axisLabel: {
      fontFamily: "Averta",
      fontWeight: 500,
    },
  },
  tooltip: {
    trigger: "item",
    axisPointer: { type: "cross" },
    textStyle: {
      fontFamily: "Averta",
      fontWeight: 500,
    },
    formatter: function (params) {
      const expressionText =
        params.value[3] !== undefined
          ? `<br/>Expression: ${params.value[3].toFixed(2)}`
          : "";
      return `X: ${params.value[0].toFixed(2)}<br/>Y: ${params.value[1].toFixed(
        2
      )}<br/>Cell: ${params.value[2]}${expressionText}`;
    },
    borderColor: "#fff",
  },
  grid: {
    left: "0%",
    right: "0%",
    bottom: "0%",
    containLabel: true,
  },
  series: [
    {
      type: "scatter",
      data: processedData.value,
      symbolSize: 5,
    },
  ],
});

// Watch for store changes to update chart
watch(
  () => umapStore.geneExpression,
  () => {
    if (umapStore.geneExpression !== null) {
      processedData.value = updateProcessedData();
      graph_options.value.series[0].data = processedData.value;
      graph_options.value.visualMap = {
        // For Piecewise Logic
        // type: 'piecewise',
        // splitNumber: expressionRange.value.max,
        // For Continuous Logic
        right: 0,
        dimension: 3,
        top: "center",
        precision: 2,
        hoverLink: false,
        calculable: true,
        text: [expressionRange.value.max, expressionRange.value.min],
        textStyle: { color: "#000" },
        max: expressionRange.value.max,
        min: expressionRange.value.min,
        inRange: { color: ["#d3d3d3", "#3217fd"] },
        textStyle: {
          fontFamily: "Averta",
          fontWeight: 500,
        },
      };
    }
  }
);

onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      isLoading.value = false;
    }, 1000);
  });
});
</script>

<style scoped></style>
