<template>
	<VTour
		backdrop
		highlight
		trapFocus
		ref="tour"
		lockScroll
		:steps="steps"
		:showArrow="false"
		name="gene_coexpression_tour"
	/>
	<div class="p-4 grid grid-cols-1 justify-items-center z-50">
		<div class="mb-2 text-center p-4 lg:px-16">
			<div class="flex items-center justify-center gap-1">
				<h2 class="text-2xl font-bold text-gray-900 md:text-3xl">Gene Co-Expression Visualization</h2>
				<Button severity="info" variant="text" rounded class="!p-1" @click="ResetTour">
					<Icon class="!w-7 !h-7 text-slate-800" name="tabler:progress-help" />
				</Button>
			</div>

			<p class="text-gray-500 mt-4 max-w-3xl backdrop-blur">
				This module enables viewers to visualise co-expression of two genes across user-defined criteria
			</p>
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
				class="col-span-1 sm:col-span-2 lg:col-span-4 xl:col-span-3 xl:col-start-4"
			/>
		</div>

		<div>
			<InteractiveGraphControlsFilterControls
				id="Step2"
				:clusters="clusters"
				:cellTypes="cellTypes"
				class="backdrop-blur rounded-lg"
				@cell-type-filtered="handleCellFilterChange"
				:selectedFilterOption="selectedFilterOption"
				@cluster-filtered="handleClusterFilterChange"
			/>
		</div>

		<div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-7 min-w-full mt-2 mx-4">
			<div
				class="col-span-1 sm:col-span-2 lg:col-span-3 lg:col-start-2 xl:col-span-3 xl:col-start-3 grid grid-cols-2 gap-2 items-center justify-between px-2 xl:px-4 backdrop-blur rounded-lg"
			>
				<InteractiveGraphControlsGeneSearch
					id="Gene1a"
					v-model="selectedGene1"
					selectedColorOption="Gene"
					@gene-cleared="handleClearGene1"
					@gene-selected="handleSearchGene1"
				/>
				<InteractiveGraphControlsGeneSearch
					id="Gene2a"
					v-model="selectedGene2"
					selectedColorOption="Gene"
					@gene-cleared="handleClearGene2"
					@gene-selected="handleSearchGene2"
				/>
			</div>
		</div>

		<div
			class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 min-w-full mt-2 px-2 xl:px-8 pb-12"
		>
			<div class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2">
				<div class="text-center text-sm italic text-gray-600 mb-1">
					{{ selectedGene1 || 'Gene1' }} Expression
				</div>
				<InteractiveGraph
					id="Gene1b"
					noFilter
					ref="graph1"
					:geneSearch="false"
					colorScheme="#9d174d"
					@gene-fetched="handleUpdateGraph1"
					class="backdrop-blur rounded-lg"
				/>
			</div>
			<div class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2">
				<div class="text-center text-sm italic text-gray-600 mb-1">
					{{ selectedGene2 || 'Gene2' }} Expression
				</div>
				<InteractiveGraph
					noFilter
					id="Gene2b"
					ref="graph2"
					:geneSearch="false"
					colorScheme="#16DB93"
					@gene-fetched="handleUpdateGraph2"
					class="backdrop-blur rounded-lg"
				/>
			</div>
			<div class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2">
				<div class="text-center text-sm italic text-gray-600 mb-1">
					Combined {{ selectedGene1 || 'Gene1' }} & {{ selectedGene2 || 'Gene2' }} Expression
				</div>
				<InteractiveGraph
					noFilter
					id="Gene3"
					ref="graph3"
					:key="graph3Key"
					colorScheme="#ca8a04"
					class="backdrop-blur rounded-lg"
				/>
			</div>
			<div class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2">
				<div class="text-center text-sm italic text-gray-600 mb-1">
					Color Heatmap (Click on cells to filter)
				</div>
				<PlotsHeatMap
					id="heatmap"
					ref="heatmap"
					:maxX="maxGene1Expression"
					:maxY="maxGene2Expression"
					@heatmap-updated="updateGraph3Colors"
					class="backdrop-blur rounded-lg"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { useGeneAPI } from '@/api/geneAPI'
import { useGeneralDataStore } from '@/stores/generalData'
import { useHeatmapStore } from '@/stores/heatmapStore'

const toolbar = ref(null)
const tour = ref(null)
const graph1 = ref(null)
const graph2 = ref(null)
const graph3 = ref(null)
const graph3Key = ref(0)
const clusters = ref([])
const cellTypes = ref([])
const heatmap = ref(null)
const selectedGene1 = ref('')
const selectedGene2 = ref('')
const maxGene1Expression = ref(0)
const maxGene2Expression = ref(0)
const activate3DMode = ref(false)
const selectedFilterOption = ref(null)
const selectedVisualizationType = ref('UMAP')
const heatmapStore = useHeatmapStore()

const steps = [
	// {
	// 	target: '#ThreeModeFilter',
	// 	title: 'Choose a Whole Slide Image',
	// 	subText: 'Start your exploration here',
	// 	body: 'Use this dropdown to select the H&E Whole Slide Image that you want to analyze. This will serve as the base for all further visualizations.',
	// },
	// {
	// 	target: '#PlotTypeFilter',
	// 	title: 'Select Cancer-Associated Fibroblasts (CAFs)',
	// 	subText: 'Focus on key cell types',
	// 	body: 'Choose the CAF type you wish to highlight in the visualization. This helps in identifying fibroblast-related patterns across the tissue.',
	// },
	// {
	// 	target: '#DataFilter',
	// 	title: 'Pick an Annotation',
	// 	subText: 'Add biological context',
	// 	body: 'Select an annotation layer (e.g., region or feature) to overlay on your slide. This provides deeper insights into cell distribution and structure.',
	// },
	{
		target: '#Gene1a',
		title: 'Gene 1 Search',
		subText: 'Left-side visualization',
		body: 'The left panel shows spatial localization of the selected CAFs with their abundance levels mapped across the tissue image.',
		onShow: async () => {
			selectedGene1.value = 'PDGFRA'
			await handleSearchGene1('PDGFRA')
		},
	},
	{
		target: '#Gene1b',
		title: 'View Annotation Overlay',
		subText: 'Right-side visualization',
		body: 'The right panel displays spatial localization with the selected annotation, allowing you to compare structural and cellular patterns.',
	},
	{
		target: '#Gene2a',
		title: 'View CAF Abundance',
		subText: 'Left-side visualization',
		body: 'The left panel shows spatial localization of the selected CAFs with their abundance levels mapped across the tissue image.',
		onShow: async () => {
			selectedGene2.value = 'COL1A1'
			await handleSearchGene2('COL1A1')
		},
	},
	{
		target: '#Gene2b',
		title: 'View Annotation Overlay',
		subText: 'Right-side visualization',
		body: 'The right panel displays spatial localization with the selected annotation, allowing you to compare structural and cellular patterns.',
	},
	{
		target: '#Gene3',
		title: 'View Annotation Overlay',
		subText: 'Right-side visualization',
		body: 'The right panel displays spatial localization with the selected annotation, allowing you to compare structural and cellular patterns.',
	},
	{
		target: '#heatmap',
		title: 'View Annotation Overlay',
		subText: 'Right-side visualization',
		body: 'The right panel displays spatial localization with the selected annotation, allowing you to compare structural and cellular patterns.',
		onNext: () => {
			heatmapStore.toggleCell('4,7')
			heatmapStore.toggleCell('3,7')
			heatmapStore.toggleCell('4,6')
			heatmapStore.toggleCell('3,6')
			heatmapStore.toggleCell('4,5')
			heatmapStore.toggleCell('3,5')
			heatmapStore.toggleCell('4,4')
			heatmapStore.toggleCell('3,4')
			heatmap.value.updateChart()
			updateGraph3Colors()
		},
	},
	{
		target: '#Gene3',
		title: 'View Annotation Overlay',
		subText: 'Right-side visualization',
		body: 'The right panel displays spatial localization with the selected annotation, allowing you to compare structural and cellular patterns.',
	},
]

watch(
	() => heatmapStore.selectedCells,
	() => {
		updateGraph3Colors()
	},
	{ deep: true },
)

// Handle 3D Mode Changes
const handle3DModeChange = async (changeValue) => {
	graph1.value.set3DMode(changeValue)
	graph2.value.set3DMode(changeValue)
	graph3.value.set3DMode(changeValue)
	nextTick(() => {
		updateGraph3Colors()
	})
}

// Handle Plot Changes
const handlePlotChange = async (changeValue) => {
	graph1.value.setPlotType(changeValue)
	graph2.value.setPlotType(changeValue)
	graph3.value.setPlotType(changeValue)
	nextTick(() => {
		updateGraph3Colors()
	})
}

// Handle Filter Change and Reset Filter
const handleFilterChange = async (changeValue) => {
	selectedFilterOption.value = changeValue
	clusters.value.forEach((item) => (item.active = true))
	cellTypes.value.forEach((item) => (item.active = true))
	graph1.value.resetFilter()
	graph2.value.resetFilter()
	graph3.value.resetFilter()
	updateGraph3Colors()
}

// Handle Cluster based filtering
const handleClusterFilterChange = async (changeValue) => {
	clusters.value[changeValue].active = !clusters.value[changeValue].active
	graph1.value.setFilterByCluster(clusters)
	graph2.value.setFilterByCluster(clusters)
	graph3.value.setFilterByCluster(clusters)
	nextTick(() => {
		updateGraph3Colors()
	})
}

// Handle Cell based filtering
const handleCellFilterChange = async (changeValue) => {
	cellTypes.value[changeValue].active = !cellTypes.value[changeValue].active
	graph1.value.setFilterBySource(cellTypes)
	graph2.value.setFilterBySource(cellTypes)
	graph3.value.setFilterBySource(cellTypes)
	nextTick(() => {
		updateGraph3Colors()
	})
}

// Handle Gene Search Logic for Gene 1
const handleClearGene1 = async (changeValue) => {
	graph1.value.selectedColorOption = null
	graph1.value.clearGeneSelection()
	graph3Key.value++
	maxGene1Expression.value = 0
}
const handleSearchGene1 = async (changeValue) => {
	graph1.value.selectedColorOption = 'Gene'
	await graph1.value.setGeneSearch(changeValue)
}

const handleUpdateGraph1 = async () => {
	nextTick(() => {
		const gene1Data = graph1.value.geneExpression
		if (gene1Data && typeof gene1Data === 'object') {
			maxGene1Expression.value = Math.ceil(Math.max(...Object.values(gene1Data)))
		}
	})
}

// Handle Gene Search Logic for Gene 2
const handleClearGene2 = async (changeValue) => {
	graph2.value.selectedColorOption = null
	await graph2.value.clearGeneSelection()
	graph3Key.value++
	maxGene2Expression.value = 0
}
const handleSearchGene2 = async (changeValue) => {
	graph2.value.selectedColorOption = 'Gene'
	await graph2.value.setGeneSearch(changeValue)
}

const handleUpdateGraph2 = async () => {
	nextTick(() => {
		const gene2Data = graph2.value.geneExpression
		if (gene2Data && typeof gene2Data === 'object') {
			maxGene2Expression.value = Math.ceil(Math.max(...Object.values(gene2Data)))
		}
	})
}

const updateGraph3Colors = () => {
	let gene1Embedding, gene2Embedding
	const colorGrid = heatmap.value.colorGrid
	const gene1Data = graph1.value.geneExpression
	const gene2Data = graph2.value.geneExpression

	if (!activate3DMode.value && selectedVisualizationType.value == 'UMAP') {
		gene1Embedding = graph1.value.umap2DEmbedding
		gene2Embedding = graph2.value.umap2DEmbedding
	} else if (activate3DMode.value && selectedVisualizationType.value == 'UMAP') {
		gene1Embedding = graph1.value.umap3DEmbedding
		gene2Embedding = graph2.value.umap3DEmbedding
	} else if (!activate3DMode.value && selectedVisualizationType.value == 't-SNE') {
		gene1Embedding = graph1.value.tsne2DEmbedding
		gene2Embedding = graph2.value.tsne2DEmbedding
	} else if (activate3DMode.value && selectedVisualizationType.value == 't-SNE') {
		gene1Embedding = graph1.value.tsne3DEmbedding
		gene2Embedding = graph2.value.tsne3DEmbedding
	}

	if (gene1Data && gene2Data && colorGrid) {
		const colors = []
		const selectedCells = heatmapStore.selectedCells
		for (let i = 0; i < gene1Embedding.length; i++) {
			const x = Math.round(gene1Embedding[i][activate3DMode.value ? 6 : 5])
			const y = Math.round(gene2Embedding[i][activate3DMode.value ? 6 : 5])
			const cellKey = `${x + 1},${y + 1}`

			if (selectedCells.size > 0 && !selectedCells.has(cellKey)) {
				colors.push('transparent')
			} else {
				colors.push(colorGrid[y][x])
			}
		}
		graph3.value.updatePointColors(colors)
	}
}

const loadFilterOptions = async () => {
	const { get2DUmapCellType } = useGeneAPI()
	const clusterNames = ['CAF-1', 'CAF-2', 'CAF-3', 'CAF-4', 'CAF-5', 'CAF-6', 'CAF-7', 'CAF-8', 'CAF-9']
	const clusterNewNameMap = {
		'CAF-1': 'quiCAF',
		'CAF-2': 'apCAF',
		'CAF-3': 'actCAF',
		'CAF-4': 'periCAF',
		'CAF-5': 'meCAF',
		'CAF-6': 'vsmCAF',
		'CAF-7': 'infCAF',
		'CAF-8': 'msCAF',
		'CAF-9': 'pCAF',
	}

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
			pill_name: clusterNewNameMap[item],
		}))
	} catch (err) {
		console.error('Error fetching cell type names:', err)
		cellTypes.value = []
		clusters.value = []
	}
}

const ResetTour = () => {
	tour.value?.resetTour()
}

onMounted(() => {
	nextTick(async () => {
		const generalDataStore = useGeneralDataStore()
		generalDataStore.updateNavBarPosition('Gene Co-expression')
		await loadFilterOptions()
		console.log(toolbar.value?.$el.querySelector('#ThreeModeFilter'))
	})
})
</script>

<style></style>
