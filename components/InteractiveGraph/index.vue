<template>
	<div class="min-w-full">
		<InteractiveGraphControlsToolbar
			:noFilter="noFilter"
			:isLoading="isLoading"
			@filter-reset="resetFilter"
			:activate3DMode="activate3DMode"
			:selectedColorOption="selectedColorOption"
			:selectedFilterOption="selectedFilterOption"
			@update:activate3DMode="activate3DMode = $event"
			@visualization-changed="handleVisualizationChange"
			:selectedVisualizationType="selectedVisualizationType"
			@update:selectedColorOption="selectedColorOption = $event"
			@update:selectedFilterOption="selectedFilterOption = $event"
			@update:selectedVisualizationType="selectedVisualizationType = $event"
		/>
		<InteractiveGraphControlsGeneSearch
			v-model="selectedGene"
			:geneSearch="geneSearch"
			@gene-cleared="clearGeneSelection"
			@gene-selected="searchGeneExpression"
			:selectedColorOption="selectedColorOption"
		/>
		<InteractiveGraphControlsFilterControls
			:noFilter="noFilter"
			:clusters="clusters"
			:cellTypes="cellTypes"
			@cluster-filtered="FilterCluster"
			@cell-type-filtered="FilterCellType"
			:selectedFilterOption="selectedFilterOption"
		/>
		<InteractiveGraphViewer
			ref="viewer"
			:isLoading="isLoading"
			:colorScheme="colorScheme"
			:activate3DMode="activate3DMode"
			:umap2DEmbedding="umap2DEmbedding"
			:umap3DEmbedding="umap3DEmbedding"
			:tsne2DEmbedding="tsne2DEmbedding"
			:tsne3DEmbedding="tsne3DEmbedding"
			:selectedColorOption="selectedColorOption"
			:selectedVisualizationType="selectedVisualizationType"
		/>
	</div>
</template>

<script setup>
import { useEmbeddingDataStore } from '@/stores/embeddingDataStore'
import { storeToRefs } from 'pinia'
import { useGeneAPI } from '@/api/geneAPI'

const props = defineProps({
	noFilter: { type: Boolean, default: false },
	geneSearch: { type: Boolean, default: true },
	colorScheme: { type: String, default: '#5470c6' },
	geneSlot: { type: Number, required: true },
})

const embeddingDataStore = useEmbeddingDataStore()
const { clusters, cellTypes, isLoadingUMAP2D, isLoadingUMAP3D, isLoadingTSNE2D, isLoadingTSNE3D } = storeToRefs(
	embeddingDataStore,
)

// UI state
const activate3DMode = ref(false)
const selectedColorOption = ref()
const selectedFilterOption = ref()
const selectedVisualizationType = ref('UMAP')
const selectedGene = ref(null)

const viewer = ref(null)

const isLoading = computed(() => {
	if (selectedVisualizationType.value === 'UMAP') {
		return activate3DMode.value ? isLoadingUMAP3D.value : isLoadingUMAP2D.value
	} else {
		return activate3DMode.value ? isLoadingTSNE3D.value : isLoadingTSNE2D.value
	}
})

const currentEmbedding = computed(() => {
	if (selectedVisualizationType.value === 'UMAP') {
		return activate3DMode.value
			? embeddingDataStore.filteredUmap3D
			: embeddingDataStore.filteredUmap2D
	} else {
		return activate3DMode.value
			? embeddingDataStore.filteredTsne3D
			: embeddingDataStore.filteredTsne2D
	}
})

const searchGeneExpression = async (gene) => {
	const { getSingleGeneExpression } = useGeneAPI()
	try {
		selectedGene.value = gene
		const expressionData = (await getSingleGeneExpression(gene)) || []
		embeddingDataStore.updateGeneExpression(props.geneSlot, expressionData)
	} catch (err) {
		console.error('Error fetching gene expression:', err)
	} finally {
		emit('gene-fetched')
	}
}

const clearGeneSelection = () => {
	selectedGene.value = null
	embeddingDataStore.updateGeneExpression(props.geneSlot, null)
	emit('gene-fetched')
}

onBeforeMount(async () => {
	await embeddingDataStore.fetchAllEmbeddings()
})

const set3DMode = (mode) => {
	activate3DMode.value = mode
}

const setPlotType = (type) => {
	selectedVisualizationType.value = type
}

const setFilterBySource = () => {
	embeddingDataStore.setFilterType('Source')
}

const setFilterByCluster = () => {
	embeddingDataStore.setFilterType('Cluster')
}

const resetFilter = () => {
	embeddingDataStore.resetFilters()
}

const setGeneSearch = (gene) => {
	searchGeneExpression(gene)
}

const emit = defineEmits(['gene-fetched'])

defineExpose({
	isLoading,
	set3DMode,
	setPlotType,
	resetFilter,
	setGeneSearch,
	clearGeneSelection,
	selectedColorOption,
	updatePointColors: (colors) => {
		viewer.value.updatePointColors(colors)
	},
	geneExpression: computed(() =>
		props.geneSlot === 1 ? embeddingDataStore.gene1Expression : embeddingDataStore.gene2Expression,
	),
	umap2DEmbedding: computed(() => embeddingDataStore.filteredUmap2D),
	tsne2DEmbedding: computed(() => embeddingDataStore.filteredTsne2D),
	umap3DEmbedding: computed(() => embeddingDataStore.filteredUmap3D),
	tsne3DEmbedding: computed(() => embeddingDataStore.filteredTsne3D),
	setFilterBySource,
	setFilterByCluster,
})
</script>

<style></style>
