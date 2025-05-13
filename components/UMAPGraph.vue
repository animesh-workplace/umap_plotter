<script setup>
import { motion } from "motion-v";
import { useGeneAPI } from "@/api/geneAPI";

const props = defineProps({
  colorScheme: { type: String, default: "#5470c6" },
});

const suggestions = ref([]);
const isLoading = ref(true);
const geneExpression = ref(null);
const selectedGene = ref(null);
const umapEmbedding = ref(null);
const umapCellType = ref([]);
const activate3DMode = ref(false);
const activateFilterMode = ref(false);
const originalUmapEmbedding = ref(null);

// Call the autocomplete API with the user's query and update the suggestions list
const searchGene = async (event) => {
  const { getGeneAutocomplete } = useGeneAPI();
  try {
    suggestions.value = (await getGeneAutocomplete(event?.query)) || [];
  } catch (err) {
    console.error("Error fetching gene autocomplete:", err);
    suggestions.value = [];
  }
};

// Call the autocomplete API with the user's query and update the suggestions list
const getFilterCellType = async () => {
  const { get2DUmapCellType } = useGeneAPI();
  try {
    const response = (await get2DUmapCellType()) || [];
    umapCellType.value = response.map((item) => ({
      name: item,
      active: false,
    }));
  } catch (err) {
    console.error("Error fetching 2D cell type names:", err);
    umapCellType.value = [];
  }
};

const FilterCellType = (cellType, index) => {
  umapCellType.value[index].active = !umapCellType.value[index].active;
  applyFilters();
};

// Apply cell type filters to the UMAP data
const applyFilters = () => {
  if (!originalUmapEmbedding.value) return;

  // Create a set of active cell types for faster lookup
  const activeCellTypes = umapCellType.value
    .filter((ct) => ct.active)
    .map((ct) => ct.name);

  // Filter the data to only include active cell types
  umapEmbedding.value = originalUmapEmbedding.value.filter((point) => {
    const prefix = point[2].split("_")[0];
    return !activeCellTypes.includes(prefix);
  });

  // Update the chart
  updateChart();

  // If gene is selected, update expression coloring
  if (selectedGene.value) {
    updateGraphWithExpression();
  }
};

// Fetches and updates the graph data with expression values for the selected gene
const searchGeneExpression = async (event) => {
  const { getSingleGeneExpression } = useGeneAPI();
  try {
    isLoading.value = true;
    selectedGene.value = event?.value || null;
    geneExpression.value = (await getSingleGeneExpression(event?.value)) || [];

    // Update the graph with expression values and update visualMap
    updateGraphWithExpression();
  } catch (err) {
    console.error("Error fetching gene expression:", err);
    geneExpression.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Fetches embedding
const get2DEmbedding = async () => {
  const { get2DUmapEmbedding } = useGeneAPI();
  try {
    const response = await get2DUmapEmbedding();

    // Check if response exists and is an array before calling map
    if (response && Array.isArray(response)) {
      originalUmapEmbedding.value = response.map((item) => [
        item.x,
        item.y,
        item.cell_id,
        0,
      ]);

      umapEmbedding.value = [...originalUmapEmbedding.value];
      // Update chart with the embedding data
      updateChart();
    } else {
      console.error("Invalid UMAP embedding response:", response);
      umapEmbedding.value = [];
    }
  } catch (err) {
    console.error("Error fetching UMAP embedding:", err);
    umapEmbedding.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Clears the current gene selection and reverts the graph to default state
const clearGeneSelection = () => {
  selectedGene.value = null;
  geneExpression.value = null;

  // Remove visualMap from chart options
  if (graph_options.value.visualMap) {
    const { visualMap, ...rest } = graph_options.value;
    graph_options.value = rest;
  }

  // Restore default item color and styling
  graph_options.value.series[0] = {
    type: "scatter",
    data: umapEmbedding.value ? [...umapEmbedding.value] : [],
    symbolSize: 4,
    name: "UMAP",
    itemStyle: {
      opacity: 0.8,
      color: props.colorScheme,
    },
  };

  // Reset embedding data to remove expression values
  if (umapEmbedding.value && umapEmbedding.value.length > 0) {
    umapEmbedding.value = umapEmbedding.value.map((point) => [
      point[0],
      point[1],
      point[2],
      0,
    ]);
    updateChart();
  }
};

// Updates the chart with the embedding data
const updateChart = () => {
  // if (umapEmbedding.value && umapEmbedding.value.length > 0) {
  // Make a copy of the data to ensure reactivity
  graph_options.value.series[0].data = [...umapEmbedding.value];
  // }
};

// Updates the chart with expression data when a gene is selected
const updateGraphWithExpression = () => {
  if (umapEmbedding.value && geneExpression.value && geneExpression.value) {
    // Update the embedding data with expression values
    umapEmbedding.value = umapEmbedding.value.map((point) => {
      const cellId = point[2];
      const expressionValue =
        geneExpression.value[cellId] !== undefined
          ? geneExpression.value[cellId]
          : 0;
      return [point[0], point[1], cellId, expressionValue];
    });

    // Calculate expression range for visualMap
    const [min, max] = getExpressionRange();

    // Make sure min and max are valid numbers and not the same value
    const validMin = isFinite(min) ? min : 0;
    const validMax = isFinite(max) && max > validMin ? max : validMin + 1;

    // Create a new chart option with visualMap for gene expression
    graph_options.value = {
      ...graph_options.value,
      visualMap: {
        show: true,
        right: -5,
        dimension: 3,
        top: "center",
        min: validMin,
        max: validMax,
        hoverLink: false,
        calculable: true,
        type: "continuous",
        orient: "vertical",
        inRange: { color: ["#d3d3d3", props.colorScheme] },
        text: [validMax.toFixed(2), validMin.toFixed(2)],
        textStyle: { fontFamily: "Averta", fontWeight: 500 },
      },
    };

    // Update series name to reflect selected gene
    if (selectedGene.value) {
      graph_options.value.series[0].name = `Gene: ${selectedGene.value}`;

      // Remove any fixed itemStyle color when using visualMap
      if (graph_options.value.series[0].itemStyle) {
        const { color, ...rest } = graph_options.value.series[0].itemStyle;
        graph_options.value.series[0].itemStyle = rest;
      }
    }

    // Update the chart
    updateChart();
  } else {
    // If no expression data, remove visualMap and use default color
    if (graph_options.value.visualMap) {
      const { visualMap, ...rest } = graph_options.value;
      graph_options.value = rest;

      // Restore default item color
      graph_options.value.series[0].itemStyle = {
        opacity: 0.8,
        color: props.colorScheme,
      };

      updateChart();
    }
  }
};

// Calculate min/max for visualMap when expression data is available
const getExpressionRange = () => {
  // if (!geneExpression.value || !geneExpression.value.length) {
  //   return [0, 0];
  // }

  const values = Object.values(geneExpression.value);
  return [Math.min(...values), Math.max(...values)];
};

const graph_options = ref({
  animation: true,
  yAxis: {
    type: "value",
    axisLabel: { fontFamily: "Averta", fontWeight: 500 },
  },
  xAxis: {
    type: "value",
    axisLabel: { fontFamily: "Averta", fontWeight: 500 },
  },
  tooltip: {
    trigger: "item",
    axisPointer: { type: "cross" },
    textStyle: { fontFamily: "Averta", fontWeight: 500 },
    formatter: function (params) {
      const expressionText =
        params.value[3] !== 0
          ? `<br/>Expression: ${params.value[3].toFixed(2)}`
          : "";
      return `X: ${params.value[0].toFixed(2)}<br/>Y: ${params.value[1].toFixed(
        2
      )}<br/>Cell: ${params.value[2]}${expressionText}`;
    },
    borderColor: "#fff",
  },
  grid: {
    top: "0%",
    left: "0%",
    right: "0%",
    bottom: "0%",
    containLabel: true,
  },
  // No visualMap here - will be added dynamically when needed
  series: [
    {
      type: "scatter",
      data: [],
      symbolSize: 4,
      itemStyle: {
        opacity: 0.8,
        color: props.colorScheme,
      },
    },
  ],
});

onBeforeMount(async () => {
  try {
    await searchGene();
    await get2DEmbedding();
    await getFilterCellType();
  } catch (err) {
    console.error("Error initializing component:", err);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="w-full">
    <div class="mb-2 flex relative">
      <AutoComplete
        dropdown
        class="w-full"
        v-model="selectedGene"
        @complete="searchGene"
        :suggestions="suggestions"
        @item-select="searchGeneExpression"
        placeholder="Type gene name to search ... "
      />

      <button class="ml-2" v-if="selectedGene" @click="clearGeneSelection">
        <Icon name="akar-icons:circle-x" class="w-5 h-5 text-red-500" />
      </button>
    </div>

    <div class="flex gap-2 items-center justify-between">
      <div class="flex gap-2 items-center">
        <ToggleSwitch v-model="activate3DMode" />
        <Icon
          class="w-5 h-5 text-slate-500"
          name="akar-icons:augmented-reality"
        />
        <div>3D Mode</div>
      </div>

      <div class="flex gap-2 items-center">
        <ToggleSwitch v-model="activateFilterMode" />
        <Icon
          class="w-5 h-5 text-slate-500"
          name="akar-icons:settings-horizontal"
        />
        <div>Filter Mode</div>
      </div>
    </div>

    <div
      v-if="activateFilterMode"
      class="flex gap-3 items-center mt-2 justify-center"
    >
      <motion.div
        :index="index"
        :while-hover="{ scale: 0.97 }"
        v-for="(celltype, index) in umapCellType"
      >
        <Tag
          rounded
          :value="celltype.name"
          class="cursor-pointer"
          @click="FilterCellType(celltype.name, index)"
          :severity="celltype.active ? 'danger' : 'false'"
        >
          <template #icon>
            <Icon
              v-if="celltype.active"
              class="w-4 h-4 text-rose-500"
              name="akar-icons:tetragon"
            />
            <Icon
              v-else
              class="w-4 h-4 text-green-500"
              name="akar-icons:tetragon-fill"
            />
          </template>
        </Tag>
      </motion.div>
    </div>

    <div class="w-full mt-3 flex justify-center">
      <Skeleton height="45rem" v-if="isLoading || umapEmbedding == null" />
      <VChart ref="chart" :option="graph_options" class="h-[45rem]" v-else />
    </div>
  </div>
</template>
