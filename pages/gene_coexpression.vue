<template>
	<div class="p-4 grid grid-cols-1 justify-items-center z-50">
		<div class="mb-2 text-center">
			<h2 class="text-xl font-semibold mb-1">Gene Co-expression Visualization</h2>
		</div>

		<div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-9 min-w-full mt-2 mx-4">
			<InteractiveGraphControlsToolbar
				noColorBy
				:activate3DMode="activate3DMode"
				@update:activate3DMode="handle3DModeChange"
				:selectedFilterOption="selectedFilterOption"
				@update:selectedFilterOption="handleFilterChange"
				@update:selectedVisualizationType="handlePlotChange"
				:selectedVisualizationType="selectedVisualizationType"
				class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-3 xl:col-start-4"
			/>
		</div>

		<div>
			<InteractiveGraphControlsFilterControls
				:clusters="clusters"
				:cellTypes="cellTypes"
				class="backdrop-blur rounded-lg"
				@cell-type-filtered="handleCellFilterChange"
				:selectedFilterOption="selectedFilterOption"
				@cluster-filtered="handleClusterFilterChange"
			/>
		</div>

		<div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 min-w-full mt-2 mx-4">
			<div
				class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-3 xl:col-start-3 grid grid-cols-2 gap-2 items-center justify-between px-2 xl:px-4 backdrop-blur rounded-lg"
			>
				<InteractiveGraphControlsGeneSearch
					v-model="selectedGene1"
					selectedColorOption="Gene"
					@gene-cleared="handleClearGene1"
					@gene-selected="handleSearchGene1"
				/>
				<InteractiveGraphControlsGeneSearch
					v-model="selectedGene2"
					selectedColorOption="Gene"
					@gene-cleared="handleClearGene2"
					@gene-selected="handleSearchGene2"
				/>
			</div>
		</div>

		<div
			class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 min-w-full mt-2 px-2 xl:px-8"
		>
			<InteractiveGraph
				noFilter
				ref="graph1"
				:geneSearch="false"
				colorScheme="#0284c7"
				class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2 backdrop-blur rounded-lg"
			/>
			<InteractiveGraph
				noFilter
				ref="graph2"
				:geneSearch="false"
				colorScheme="#9d174d"
				class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2 backdrop-blur rounded-lg"
			/>
			<InteractiveGraph
				noFilter
				ref="graph3"
				colorScheme="#ca8a04"
				class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2 backdrop-blur rounded-lg"
			/>
			<PlotsHeatMap
				ref="heatmap"
				class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2 backdrop-blur rounded-lg"
			/>
		</div>
	</div>
</template>

<script setup>
import { useGeneAPI } from '@/api/geneAPI'
import { useGeneralDataStore } from '@/stores/generalData'

const graph1 = ref(null)
const graph2 = ref(null)
const graph3 = ref(null)
const heatmap = ref(null)
const clusters = ref([])
const cellTypes = ref([])
const selectedGene1 = ref('')
const selectedGene2 = ref('')
const activate3DMode = ref(false)
const selectedFilterOption = ref(null)
const selectedVisualizationType = ref('UMAP')

// Handle 3D Mode Changes
const handle3DModeChange = (changeValue) => {
	graph1.value.set3DMode(changeValue)
	graph2.value.set3DMode(changeValue)
	graph3.value.set3DMode(changeValue)
}

// Handle Plot Changes
const handlePlotChange = async (changeValue) => {
	graph1.value.setPlotType(changeValue)
	graph2.value.setPlotType(changeValue)
	graph3.value.setPlotType(changeValue)
}

// Handle Filter Change and Reset Filter
const handleFilterChange = async (changeValue) => {
	selectedFilterOption.value = changeValue
	if (changeValue == null) {
		graph1.value.resetFilter()
		graph2.value.resetFilter()
		graph3.value.resetFilter()
	}
}

// Handle Cluster based filtering
const handleClusterFilterChange = async (changeValue) => {
	clusters.value[changeValue].active = !clusters.value[changeValue].active
	graph1.value.setFilterByCluster(clusters)
	graph2.value.setFilterByCluster(clusters)
	graph3.value.setFilterByCluster(clusters)
}

// Handle Cell based filtering
const handleCellFilterChange = async (changeValue) => {
	cellTypes.value[changeValue].active = !cellTypes.value[changeValue].active
	graph1.value.setFilterBySource(cellTypes)
	graph2.value.setFilterBySource(cellTypes)
	graph3.value.setFilterBySource(cellTypes)
}

// Handle Gene Search Logic for Gene 1
const handleClearGene1 = async (changeValue) => {
	graph1.value.selectedColorOption = null
	graph1.value.clearGeneSelection()
}
const handleSearchGene1 = async (changeValue) => {
	graph1.value.selectedColorOption = 'Gene'
	await graph1.value.setGeneSearch(changeValue)
	await updateGraph3Colors()
}

// Handle Gene Search Logic for Gene 2
const handleClearGene2 = async (changeValue) => {
	graph2.value.selectedColorOption = null
	graph2.value.clearGeneSelection()
}
const handleSearchGene2 = async (changeValue) => {
	graph2.value.selectedColorOption = 'Gene'
	await graph2.value.setGeneSearch(changeValue)
	await updateGraph3Colors()
}

const updateGraph3Colors = async () => {
	const gene1Data = graph1.value.geneExpression
	const gene2Data = graph2.value.geneExpression
	const colorGrid = heatmap.value.colorGrid

	if (gene1Data && gene2Data && colorGrid) {
		const colors = []
		const keys = Object.keys(gene1Data)
		for (let i = 0; i < keys.length; i++) {
			const x = Math.ceil(gene1Data[keys[i]])
			const y = Math.ceil(gene2Data[keys[i]])
			colors.push(colorGrid[x][y])
		}
		graph3.value.updatePointColors(colors)
	}
}

const loadFilterOptions = async () => {
	const { get2DUmapCellType } = useGeneAPI()
	const clusterNames = ['CAF-1', 'CAF-2', 'CAF-3', 'CAF-4', 'CAF-5', 'CAF-6', 'CAF-7', 'CAF-8', 'CAF-9']

	try {
		const response = (await get2DUmapCellType()) || []

		cellTypes.value = response.map((item, index) => ({
			name: item,
			index: index,
			active: true,
		}))

		clusters.value = clusterNames.map((item, index) => ({
			name: item,
			index: index,
			active: true,
		}))
	} catch (err) {
		console.error('Error fetching cell type names:', err)
		cellTypes.value = []
		clusters.value = []
	}
}

onMounted(() => {
	nextTick(async () => {
		const generalDataStore = useGeneralDataStore()
		generalDataStore.updateNavBarPosition('Gene Co-expression')
		await loadFilterOptions()
	})
})
</script>

<style></style>
