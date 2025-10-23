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
			:lineageTypes="lineageTypes"
			@cluster-filtered="FilterCluster"
			@lineage-selected="SelectLineage"
			@cell-type-filtered="FilterCellType"
			:selectedColorOption="selectedColorOption"
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
import { map } from 'lodash-es'
import { useGeneAPI } from '@/api/geneAPI'

const props = defineProps({
	noFilter: { type: Boolean, default: false },
	geneSearch: { type: Boolean, default: true },
	colorScheme: { type: String, default: '#5470c6' },
})

// Refs for UI controls
const activate3DMode = ref(false)
const selectedColorOption = ref()
const selectedFilterOption = ref()
const selectedVisualizationType = ref('UMAP')

// Gene search
const selectedGene = ref(null)
const geneExpression = ref(null)

// Loading state
const isLoading = ref(true)

// Data for filters
const clusters = ref([])
const cellTypes = ref([])
const lineageTypes = ref([
	{ name: 'Lineage 1', index: 0, active: false },
	{ name: 'Lineage 2', index: 1, active: false },
	{ name: 'Lineage 3', index: 2, active: false },
	{ name: 'Lineage 4', index: 3, active: false },
])

// Graph components references
const viewer = ref(null)

// Data for visualizations
const umap2DEmbedding = ref([])
const umap3DEmbedding = ref([])
const tsne2DEmbedding = ref([])
const tsne3DEmbedding = ref([])

// Original data (for filtering operations)
const originalUmap2DEmbedding = ref([])
const originalUmap3DEmbedding = ref([])
const originalTsne2DEmbedding = ref([])
const originalTsne3DEmbedding = ref([])

watch(selectedColorOption, (newVal) => {
	if (newVal !== 'Gene') {
		clearGeneSelection()
		lineageTypes.value.forEach((item) => (item.active = false))
	}
})

// Handle visualization type change
const handleVisualizationChange = (value) => {
	isLoading.value = true
	if (value === 't-SNE' && (tsne2DEmbedding.value.length === 0 || tsne3DEmbedding.value.length === 0)) {
		// Load t-SNE data if it hasn't been loaded yet
		setTimeout(async () => {
			await loadTSNEData()
		}, 50)
	} else {
		isLoading.value = false
	}
}

// Select Lineage using the existing gene expression logic to add the expression values
const SelectLineage = async (index) => {
	const { getLineageExpression } = useGeneAPI()
	try {
		isLoading.value = true
		map(lineageTypes.value, (lineage) => (lineage.active = false))
		lineageTypes.value[index].active = true
		const lineage = lineageTypes.value[index].name
		geneExpression.value = (await getLineageExpression(lineage)) || []

		// Update both UMAP and t-SNE with expression values
		updateEmbeddingsWithExpression()
	} catch (err) {
		console.error('Error fetching gene expression:', err)
		geneExpression.value = []
	} finally {
		isLoading.value = false
		emit('gene-fetched')
	}
}

// Get gene expression data and update visualizations
const searchGeneExpression = async (gene) => {
	const { getSingleGeneExpression } = useGeneAPI()
	try {
		isLoading.value = true
		selectedGene.value = gene
		geneExpression.value = (await getSingleGeneExpression(gene)) || []

		// Update both UMAP and t-SNE with expression values
		updateEmbeddingsWithExpression()
	} catch (err) {
		console.error('Error fetching gene expression:', err)
		geneExpression.value = []
	} finally {
		isLoading.value = false
		emit('gene-fetched')
	}
}

// Clear gene selection and reset expression values
const clearGeneSelection = () => {
	selectedGene.value = null
	geneExpression.value = null

	// Reset expression values to 0 for UMAP data
	originalUmap2DEmbedding.value = originalUmap2DEmbedding.value.map(([x, y, cellID, source, cluster, _]) => {
		return [x, y, cellID, source, cluster, 0]
	})
	originalUmap3DEmbedding.value = originalUmap3DEmbedding.value.map(([x, y, z, cellID, source, cluster, _]) => {
		return [x, y, z, cellID, source, cluster, 0]
	})

	// Reset expression values to 0 for t-SNE data
	originalTsne2DEmbedding.value = originalTsne2DEmbedding.value.map(([x, y, cellID, source, cluster, _]) => {
		return [x, y, cellID, source, cluster, 0]
	})
	originalTsne3DEmbedding.value = originalTsne3DEmbedding.value.map(([x, y, z, cellID, source, cluster, _]) => {
		return [x, y, z, cellID, source, cluster, 0]
	})

	// Apply filters if any are selected
	if (selectedFilterOption.value) {
		if (selectedFilterOption.value === 'Source') {
			applyFilters(cellTypes)
		} else if (selectedFilterOption.value === 'Cluster') {
			applyFilters(clusters)
		}
	} else {
		// Reset to original data with expression values set to 0
		umap2DEmbedding.value = [...originalUmap2DEmbedding.value]
		umap3DEmbedding.value = [...originalUmap3DEmbedding.value]
		tsne2DEmbedding.value = [...originalTsne2DEmbedding.value]
		tsne3DEmbedding.value = [...originalTsne3DEmbedding.value]
	}
}

// Update all embeddings with gene expression data
const updateEmbeddingsWithExpression = () => {
	// Update UMAP 2D embedding with expression values
	originalUmap2DEmbedding.value = originalUmap2DEmbedding.value.map(([x, y, cellID, source, cluster, _]) => {
		const expressionValue = geneExpression.value[cellID] !== undefined ? geneExpression.value[cellID] : 0
		return [x, y, cellID, source, cluster, expressionValue]
	})

	// Update UMAP 3D embedding with expression values
	originalUmap3DEmbedding.value = originalUmap3DEmbedding.value.map(([x, y, z, cellID, source, cluster, _]) => {
		const expressionValue = geneExpression.value[cellID] !== undefined ? geneExpression.value[cellID] : 0
		return [x, y, z, cellID, source, cluster, expressionValue]
	})

	// Update t-SNE 2D embedding with expression values
	originalTsne2DEmbedding.value = originalTsne2DEmbedding.value.map(([x, y, cellID, source, cluster, _]) => {
		const expressionValue = geneExpression.value[cellID] !== undefined ? geneExpression.value[cellID] : 0
		return [x, y, cellID, source, cluster, expressionValue]
	})

	// Update t-SNE 3D embedding with expression values
	originalTsne3DEmbedding.value = originalTsne3DEmbedding.value.map(([x, y, z, cellID, source, cluster, _]) => {
		const expressionValue = geneExpression.value[cellID] !== undefined ? geneExpression.value[cellID] : 0
		return [x, y, z, cellID, source, cluster, expressionValue]
	})

	// Apply filters if any are selected
	if (selectedFilterOption.value === 'Source') {
		applyFilters(cellTypes)
	} else if (selectedFilterOption.value === 'Cluster') {
		applyFilters(clusters)
	} else {
		// Use complete data with updated expression values
		umap2DEmbedding.value = [...originalUmap2DEmbedding.value]
		umap3DEmbedding.value = [...originalUmap3DEmbedding.value]
		tsne2DEmbedding.value = [...originalTsne2DEmbedding.value]
		tsne3DEmbedding.value = [...originalTsne3DEmbedding.value]
	}
}

// Load UMAP 2D embedding data
const loadUMAP2D = async () => {
	const { get2DUmapEmbedding } = useGeneAPI()
	isLoading.value = true
	try {
		const response = await get2DUmapEmbedding()
		if (!response || !Array.isArray(response) || response.length === 0) {
			console.warn('API returned empty or invalid UMAP 2D data:', response)
			umap2DEmbedding.value = []
			return
		}

		// Data structure: [X, Y, Cell_ID, source, cluster_id, expression]
		umap2DEmbedding.value = response.map((item) => {
			return [
				Number(item.x) || 0,
				Number(item.y) || 0,
				item.cell_id,
				item.cell_id.split('_')[0],
				item.cluster,
				0,
			]
		})
		originalUmap2DEmbedding.value = [...umap2DEmbedding.value]
	} catch (err) {
		console.error('Error fetching UMAP 2D embedding:', err)
		umap2DEmbedding.value = []
		originalUmap2DEmbedding.value = []
	} finally {
		isLoading.value = false
	}
}

// Load UMAP 3D embedding data
const loadUMAP3D = async () => {
	const { get3DUmapEmbedding } = useGeneAPI()
	isLoading.value = true
	try {
		const response = await get3DUmapEmbedding()
		if (!response || !Array.isArray(response) || response.length === 0) {
			console.warn('API returned empty or invalid UMAP 3D data:', response)
			umap3DEmbedding.value = []
			return
		}

		// Data structure: [X, Y, Z, Cell_ID, source, cluster_id, expression]
		umap3DEmbedding.value = response.map((item) => {
			return [
				Number(item.x) || 0,
				Number(item.y) || 0,
				Number(item.z) || 0,
				item.cell_id,
				item.cell_id.split('_')[0],
				item.cluster,
				0,
			]
		})
		originalUmap3DEmbedding.value = [...umap3DEmbedding.value]
	} catch (err) {
		console.error('Error fetching UMAP 3D embedding:', err)
		umap3DEmbedding.value = []
		originalUmap3DEmbedding.value = []
	} finally {
		isLoading.value = false
	}
}

// Load t-SNE 2D embedding data
const loadTSNE2D = async () => {
	const { get2DTsneEmbedding } = useGeneAPI()
	isLoading.value = true
	try {
		const response = await get2DTsneEmbedding()
		if (!response || !Array.isArray(response) || response.length === 0) {
			console.warn('API returned empty or invalid t-SNE 2D data:', response)
			tsne2DEmbedding.value = []
			return
		}

		// Data structure is same as UMAP: [X, Y, Cell_ID, source, cluster_id, expression]
		tsne2DEmbedding.value = response.map((item) => {
			return [
				Number(item.x) || 0,
				Number(item.y) || 0,
				item.cell_id,
				item.cell_id.split('_')[0],
				item.cluster,
				0,
			]
		})
		originalTsne2DEmbedding.value = [...tsne2DEmbedding.value]
	} catch (err) {
		console.error('Error fetching t-SNE 2D embedding:', err)
		tsne2DEmbedding.value = []
		originalTsne2DEmbedding.value = []
	} finally {
		isLoading.value = false
	}
}

// Load t-SNE 3D embedding data
const loadTSNE3D = async () => {
	const { get3DTsneEmbedding } = useGeneAPI()
	isLoading.value = true
	try {
		const response = await get3DTsneEmbedding()
		if (!response || !Array.isArray(response) || response.length === 0) {
			console.warn('API returned empty or invalid t-SNE 3D data:', response)
			tsne3DEmbedding.value = []
			return
		}

		// Data structure is same as UMAP: [X, Y, Z, Cell_ID, source, cluster_id, expression]
		tsne3DEmbedding.value = response.map((item) => {
			return [
				Number(item.x) || 0,
				Number(item.y) || 0,
				Number(item.z) || 0,
				item.cell_id,
				item.cell_id.split('_')[0],
				item.cluster,
				0,
			]
		})
		originalTsne3DEmbedding.value = [...tsne3DEmbedding.value]
	} catch (err) {
		console.error('Error fetching t-SNE 3D embedding:', err)
		tsne3DEmbedding.value = []
		originalTsne3DEmbedding.value = []
	} finally {
		isLoading.value = false
	}
}

// Load both 2D and 3D t-SNE data
const loadTSNEData = async () => {
	isLoading.value = true
	try {
		await Promise.all([loadTSNE2D(), loadTSNE3D()])

		// If gene expression data is already loaded, apply it to t-SNE data
		if (geneExpression.value && selectedGene.value) {
			updateEmbeddingsWithExpression()
		}

		// Apply current filters to the newly loaded data
		if (selectedFilterOption.value) {
			if (selectedFilterOption.value === 'Source') {
				applyFilters(cellTypes)
			} else if (selectedFilterOption.value === 'Cluster') {
				applyFilters(clusters)
			}
		}
	} catch (err) {
		console.error('Error loading t-SNE data:', err)
	} finally {
		isLoading.value = false
		// Update the appropriate graph based on the current mode
		nextTick(() => {
			if (activate3DMode.value && selectedVisualizationType.value === 't-SNE') {
				viewer.value?.TSNE3DGraph?.updateChart()
			} else if (!activate3DMode.value && selectedVisualizationType.value === 't-SNE') {
				viewer.value?.TSNE2DGraph?.updateChart()
			}
		})
	}
}

// Load cell types and clusters for filtering
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

// Toggle cell type filter
const FilterCellType = (index) => {
	cellTypes.value[index].active = !cellTypes.value[index].active
	applyFilters(cellTypes)
}

// Toggle cluster filter
const FilterCluster = (index) => {
	clusters.value[index].active = !clusters.value[index].active
	applyFilters(clusters)
}

// Reset all filters
const resetFilter = () => {
	// Reset all active filters
	cellTypes.value.forEach((item) => (item.active = true))
	clusters.value.forEach((item) => (item.active = true))

	// Reset to original data
	umap2DEmbedding.value = [...originalUmap2DEmbedding.value]
	umap3DEmbedding.value = [...originalUmap3DEmbedding.value]
	tsne2DEmbedding.value = [...originalTsne2DEmbedding.value]
	tsne3DEmbedding.value = [...originalTsne3DEmbedding.value]
}

// Apply filters to both UMAP and t-SNE data
const applyFilters = (appliedFilters) => {
	const activeFilters = appliedFilters.value.filter((item) => item.active).map((item) => item.name)

	// Filter UMAP 2D data
	umap2DEmbedding.value = originalUmap2DEmbedding.value.filter((point) => {
		const prefix = point[selectedFilterOption.value === 'Source' ? 3 : 4]
		return activeFilters.includes(prefix)
	})

	// Filter UMAP 3D data
	umap3DEmbedding.value = originalUmap3DEmbedding.value.filter((point) => {
		const prefix = point[selectedFilterOption.value === 'Source' ? 4 : 5]
		return activeFilters.includes(prefix)
	})

	// Filter t-SNE 2D data if available
	if (originalTsne2DEmbedding.value.length > 0) {
		tsne2DEmbedding.value = originalTsne2DEmbedding.value.filter((point) => {
			const prefix = point[selectedFilterOption.value === 'Source' ? 3 : 4]
			return activeFilters.includes(prefix)
		})
	}

	// Filter t-SNE 3D data if available
	if (originalTsne3DEmbedding.value.length > 0) {
		tsne3DEmbedding.value = originalTsne3DEmbedding.value.filter((point) => {
			const prefix = point[selectedFilterOption.value === 'Source' ? 4 : 5]
			return activeFilters.includes(prefix)
		})
	}
}

onBeforeMount(() => {
	nextTick(async () => {
		try {
			isLoading.value = true

			// Initialize everything
			await Promise.all([loadUMAP2D(), loadUMAP3D(), loadFilterOptions(), loadTSNEData()])
		} catch (err) {
			console.error('Error initializing component:', err)
		} finally {
			isLoading.value = false

			// Update the appropriate chart
			nextTick(() => {
				if (activate3DMode.value) {
					if (selectedVisualizationType.value === 'UMAP') {
						viewer.value?.UMAP3DGraph?.updateChart()
					} else {
						viewer.value?.TSNE3DGraph?.updateChart()
					}
				} else {
					if (selectedVisualizationType.value === 'UMAP') {
						viewer.value?.UMAP2DGraph?.updateChart()
					} else {
						viewer.value?.TSNE2DGraph?.updateChart()
					}
				}
			})
		}
	})
})

const set3DMode = (mode) => {
	activate3DMode.value = mode
}

const setPlotType = (type) => {
	selectedVisualizationType.value = type
	handleVisualizationChange(type)
}

const setFilterBySource = (sources) => {
	selectedFilterOption.value = 'Source'
	applyFilters(sources)
}

const setFilterByCluster = (clustersToFilter) => {
	selectedFilterOption.value = 'Cluster'
	applyFilters(clustersToFilter)
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
	geneExpression,
	umap2DEmbedding,
	tsne2DEmbedding,
	umap3DEmbedding,
	tsne3DEmbedding,
	setFilterBySource,
	setFilterByCluster,
	clearGeneSelection,
	selectedColorOption,
	selectedFilterOption,
	updatePointColors: (colors) => {
		viewer.value.updatePointColors(colors)
	},
})
</script>

<style></style>
