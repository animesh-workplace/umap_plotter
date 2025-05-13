<script setup>
import { useGeneAPI } from "@/api/geneAPI";

const umapEmbedding = ref(null);
const suggestions = ref([]);
const geneExpression = ref([]);
const isLoading = ref(true);
const graph_data = ref(null);
const processedData = ref([]);

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

// Store the original unfiltered UMAP embedding data
const originalUmapEmbedding = ref(null);

// Track available cell types and their selection state
const umapCellTypes = ref([]);

// Track if cell filtering is active
const isFilterActive = ref(false);

// Extract cell types from cell_ids and initialize tracking array
const extractCellTypes = () => {
  if (!originalUmapEmbedding.value || originalUmapEmbedding.value.length === 0)
    return;

  // Extract cell type prefixes from cell_ids
  const cellTypesSet = new Set();
  originalUmapEmbedding.value.forEach((point) => {
    const cellId = point[2];
    // Extract prefix before first underscore or dot
    const prefix = cellId.split(/[_\.]/)[0];
    if (prefix) {
      cellTypesSet.add(prefix);
    }
  });

  // Convert to array of objects with active state
  umapCellTypes.value = Array.from(cellTypesSet).map((type) => ({
    type,
    active: true,
    color: getRandomColor(), // Assign a color to each cell type
  }));
};

// Generate a random color for cell type visualization
const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Toggle the active state of a specific cell type
const toggleCellType = (cellType, index) => {
  umapCellTypes.value[index].active = !umapCellTypes.value[index].active;

  // Check if any filters are active
  isFilterActive.value = umapCellTypes.value.some((ct) => !ct.active);

  // Apply the filter
  applyFilters();
};

// Toggle all cell types on or off
const toggleAllCellTypes = (active) => {
  umapCellTypes.value.forEach((ct) => {
    ct.active = active;
  });

  isFilterActive.value = !active;
  applyFilters();
};

// Apply cell type filters to the UMAP data
const applyFilters = () => {
  if (!originalUmapEmbedding.value) return;

  // If all filters are active, use the original data
  if (umapCellTypes.value.every((ct) => ct.active)) {
    umapEmbedding.value = [...originalUmapEmbedding.value];
    isFilterActive.value = false;
  } else {
    // Create a set of active cell types for faster lookup
    const activeCellTypes = new Set(
      umapCellTypes.value.filter((ct) => ct.active).map((ct) => ct.type)
    );

    // Filter the data to only include active cell types
    umapEmbedding.value = originalUmapEmbedding.value.filter((point) => {
      const cellId = point[2];
      const prefix = cellId.split(/[_\.]/)[0];
      return activeCellTypes.has(prefix);
    });

    isFilterActive.value = true;
  }

  // Update the chart
  updateChart();

  // If gene is selected, update expression coloring
  if (selectedGene.value) {
    updateGraphWithExpression();
  }
};

// Clears the current gene selection and reverts the graph to default state
const clearGeneSelection = () => {
  selectedGene.value = null;
  geneExpression.value = [];

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

// Fetches embedding with proper handling of original data
const getEmbedding = async () => {
  const { getUmapEmbedding } = useGeneAPI();
  try {
    const response = await getUmapEmbedding();
    console.log("checking response", response);

    // Check if response exists and is an array before calling map
    if (response && Array.isArray(response)) {
      // Store the original complete dataset
      originalUmapEmbedding.value = response.map((item) => [
        item.x,
        item.y,
        item.cell_id,
        0,
      ]);

      // Initialize working copy
      umapEmbedding.value = [...originalUmapEmbedding.value];

      // Extract cell types after loading data
      extractCellTypes();

      // Update chart with the embedding data
      updateChart();
    } else {
      console.error("Invalid UMAP embedding response:", response);
      originalUmapEmbedding.value = [];
      umapEmbedding.value = [];
    }
  } catch (err) {
    console.error("Error fetching UMAP embedding:", err);
    originalUmapEmbedding.value = [];
    umapEmbedding.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Updates the chart with the embedding data
const updateChart = () => {
  if (umapEmbedding.value && umapEmbedding.value.length > 0) {
    // If not using gene expression coloring and cell type filtering is active,
    // color by cell type instead of using a single color
    if (!selectedGene.value && isFilterActive.value) {
      // Create a mapping of cell type prefix to color
      const cellTypeColorMap = {};
      umapCellTypes.value.forEach((ct) => {
        if (ct.active) {
          cellTypeColorMap[ct.type] = ct.color;
        }
      });

      // Use a series for each cell type
      graph_options.value.series = umapCellTypes.value
        .filter((ct) => ct.active)
        .map((ct) => {
          // Filter data for this cell type
          const typeData = umapEmbedding.value.filter((point) => {
            const cellId = point[2];
            const prefix = cellId.split(/[_\.]/)[0];
            return prefix === ct.type;
          });

          return {
            name: ct.type,
            type: "scatter",
            data: typeData,
            symbolSize: 4,
            itemStyle: {
              color: ct.color,
              opacity: 0.8,
            },
          };
        });
    } else {
      // Just update the data with a single series
      graph_options.value.series = [
        {
          type: "scatter",
          data: [...umapEmbedding.value],
          symbolSize: 4,
          name: selectedGene.value ? `Gene: ${selectedGene.value}` : "UMAP",
          itemStyle: selectedGene.value
            ? { opacity: 0.8 }
            : {
                opacity: 0.8,
                color: "#5470c6",
              },
        },
      ];
    }
  }
};

// Updates the chart with expression data when a gene is selected
const updateGraphWithExpression = () => {
  if (
    umapEmbedding.value &&
    geneExpression.value &&
    geneExpression.value.length > 0
  ) {
    // Create a mapping of cell_id to expression value
    const expressionMap = {};
    geneExpression.value.forEach((item) => {
      expressionMap[item.cell_id] = item.expression;
    });

    // Update the embedding data with expression values
    // Use the filtered data if filters are active, otherwise use original data
    const dataToUpdate = [...umapEmbedding.value];

    umapEmbedding.value = dataToUpdate.map((point) => {
      const cellId = point[2];
      const expressionValue =
        expressionMap[cellId] !== undefined ? expressionMap[cellId] : 0;
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
        type: "continuous",
        min: validMin,
        max: validMax,
        calculable: true,
        // Use a simpler color range to avoid gradient issues
        inRange: {
          color: ["#3b4cc0", "#b0d8ef", "#f4f3af", "#eb7d5b", "#d7191c"],
        },
        dimension: 3, // Use the 4th dimension (index 3) for coloring
        orient: "vertical",
        right: 10,
        top: "center",
        text: [`High: ${validMax.toFixed(2)}`, `Low: ${validMin.toFixed(2)}`],
        textStyle: {
          fontFamily: "Averta",
          fontWeight: 500,
        },
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
        color: "#5470c6",
      };

      updateChart();
    }
  }
};

// Track selected gene name for UI
const selectedGene = ref(null);

// Calculate min/max for visualMap when expression data is available
const getExpressionRange = () => {
  if (!geneExpression.value || !geneExpression.value.length) {
    return [0, 0];
  }

  const values = geneExpression.value.map((item) => item.expression);
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
  // No visualMap here - will be added dynamically when needed
  series: [
    {
      type: "scatter",
      data: [],
      symbolSize: 4,
      itemStyle: {
        opacity: 0.8,
        color: "#5470c6", // Default color when no gene is selected
      },
    },
  ],
});

onBeforeMount(async () => {
  try {
    await searchGene();
    await getEmbedding();
  } catch (err) {
    console.error("Error initializing component:", err);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="p-8 grid grid-cols-1 justify-items-center">
    <div class="mb-4 text-center">
      <h2 class="text-xl font-semibold mb-2">
        Gene Expression UMAP Visualization
      </h2>
      <p v-if="selectedGene" class="text-gray-600">
        Currently showing: {{ selectedGene }}
      </p>
      <p v-else class="text-gray-500">
        Select a gene to visualize expression levels
      </p>
    </div>

    <div class="w-1/3 md:w-30rem mb-4 flex relative">
      <AutoComplete
        dropdown
        @complete="searchGene"
        class="w-full"
        :suggestions="suggestions"
        @item-select="searchGeneExpression"
        placeholder="Type gene name to search ... "
      />
      <Button
        v-if="selectedGene"
        icon="pi pi-times"
        class="p-button-rounded p-button-danger ml-2"
        @click="clearGeneSelection"
        aria-label="Clear gene selection"
      />
    </div>

    <!-- Cell Type Filter Panel -->
    <div
      v-if="umapCellTypes.length > 0"
      class="mb-4 w-1/2 md:w-40rem p-4 border border-gray-200 rounded-md"
    >
      <div class="flex justify-between items-center mb-2">
        <h3 class="font-semibold">Filter Cell Types</h3>
        <div>
          <Button
            label="Select All"
            class="p-button-sm p-button-outlined mr-2"
            @click="toggleAllCellTypes(true)"
          />
          <Button
            label="Clear All"
            class="p-button-sm p-button-outlined p-button-danger"
            @click="toggleAllCellTypes(false)"
          />
        </div>
      </div>

      <div
        class="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto"
      >
        <div
          v-for="(cellType, index) in umapCellTypes"
          :key="cellType.type"
          class="flex items-center"
        >
          <Checkbox
            :inputId="'ct_' + index"
            v-model="cellType.active"
            :binary="true"
            @change="toggleCellType(cellType.type, index)"
          />
          <label :for="'ct_' + index" class="ml-2 flex items-center">
            <span
              class="inline-block w-3 h-3 rounded-full mr-1"
              :style="{ backgroundColor: cellType.color }"
            ></span>
            {{ cellType.type }}
          </label>
        </div>
      </div>
    </div>

    <div class="w-full mt-4 flex justify-center">
      <Skeleton
        height="45rem"
        class="w-[50rem]"
        v-if="isLoading || umapEmbedding == null"
      />
      <VChart
        ref="chart"
        :option="graph_options"
        class="w-[50rem] h-[50rem]"
        v-else
      />
    </div>
  </div>
</template>
