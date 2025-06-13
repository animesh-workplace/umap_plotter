<template>
	<div class="min-w-full">
		<Skeleton height="3rem" v-if="isLoading" class="mb-4 mt-2" />

		<div class="flex gap-1 items-center justify-between mb-4 mt-2 px-4" v-else>
			<div class="flex gap-2 items-center">
				<ToggleSwitch v-model="activate3DMode" />
				<Icon class="w-5 h-5 text-slate-500" name="akar-icons:augmented-reality" />
				<div>3D Mode</div>
			</div>

			<FloatLabel class="w-32" variant="on">
				<Select
					fluid
					size="small"
					inputId="Visualization-Type"
					:options="visualizationTypes"
					v-model="selectedVisualizationType"
					@value-change="handleVisualizationChange"
				/>
				<label for="Visualization-Type" class="flex items-center gap-2">
					<Icon class="w-4 h-4 text-slate-500" name="tabler:chart-dots" /> Plot type
				</label>
			</FloatLabel>

			<FloatLabel class="w-32" variant="on">
				<Select
					fluid
					showClear
					size="small"
					inputId="Color-Filter"
					:options="colorMethods"
					v-model="selectedColorOption"
				/>
				<label for="Color-Filter" class="flex items-center gap-2">
					<Icon class="w-4 h-4 text-slate-500" name="tabler:color-filter" /> Color by
				</label>
			</FloatLabel>

			<FloatLabel class="w-32" variant="on">
				<Select
					fluid
					showClear
					size="small"
					inputId="Data-Filter"
					:options="filterMethods"
					@value-change="resetFilter"
					v-model="selectedFilterOption"
				/>
				<label for="Data-Filter" class="flex items-center gap-2">
					<Icon class="w-4 h-4 text-slate-500" name="akar-icons:filter" /> Filter by
				</label>
			</FloatLabel>
		</div>

		<div v-if="selectedFilterOption == 'Source'" class="flex gap-3 items-center mb-4 mt-2 justify-center px-4">
			<motion.div :index="celltype.index" :while-hover="{ scale: 0.97 }" v-for="celltype in cellTypes">
				<Tag
					rounded
					:value="celltype.name"
					class="cursor-pointer"
					@click="FilterCellType(celltype.index)"
					:severity="celltype.active ? 'success' : 'danger'"
				>
					<template #icon>
						<Icon
							v-if="celltype.active"
							class="w-4 h-4 text-green-500"
							name="akar-icons:tetragon-fill"
						/>
						<Icon v-else class="w-4 h-4 text-rose-500" name="akar-icons:tetragon" />
					</template>
				</Tag>
			</motion.div>
		</div>

		<div v-if="selectedFilterOption == 'Cluster'">
			<Carousel :value="clusters" :numVisible="6" :showIndicators="false">
				<template #item="slotProp">
					<motion.div :while-hover="{ scale: 0.95 }" class="py-2">
						<Tag
							rounded
							class="cursor-pointer"
							:value="slotProp.data.name"
							@click="FilterCluster(slotProp.data.index)"
							:severity="slotProp.data.active ? 'success' : 'danger'"
						>
							<template #icon>
								<Icon
									v-if="slotProp.data.active"
									class="w-4 h-4 text-green-500"
									name="akar-icons:tetragon-fill"
								/>
								<Icon v-else class="w-4 h-4 text-rose-500" name="akar-icons:tetragon" />
							</template>
						</Tag>
					</motion.div>
				</template>
			</Carousel>
		</div>

		<div class="mb-2 flex relative" v-if="selectedColorOption == 'Gene'">
			<AutoComplete
				dropdown
				class="w-full"
				v-model="selectedGene"
				@complete="searchGene"
				:suggestions="suggestions"
				@item-select="searchGeneExpression"
				placeholder="Type gene name to search ..."
			/>

			<button class="ml-2" v-if="selectedGene" @click="clearGeneSelection">
				<Icon name="akar-icons:circle-x" class="w-5 h-5 text-red-500" />
			</button>
		</div>

		<Skeleton height="40rem" v-if="isLoading" />

		<div v-else>
			<!-- UMAP 3D -->
			<GraphUMAP3D
				ref="UMAP3DGraph"
				:colorScheme="colorScheme"
				:scatterData="umap3DEmbedding"
				:colorBy="selectedColorOption"
				v-if="activate3DMode && selectedVisualizationType === 'UMAP'"
			/>
			<!-- UMAP 2D -->
			<GraphUMAP2D
				ref="UMAP2DGraph"
				:colorScheme="colorScheme"
				:scatterData="umap2DEmbedding"
				:colorBy="selectedColorOption"
				v-else-if="!activate3DMode && selectedVisualizationType === 'UMAP'"
			/>
			<!-- t-SNE 3D -->
			<GraphUMAP3D
				ref="TSNE3DGraph"
				:colorScheme="colorScheme"
				:scatterData="tsne3DEmbedding"
				:colorBy="selectedColorOption"
				v-else-if="activate3DMode && selectedVisualizationType === 't-SNE'"
			/>
			<!-- t-SNE 2D -->
			<GraphUMAP2D
				v-else
				ref="TSNE2DGraph"
				:colorScheme="colorScheme"
				:scatterData="tsne2DEmbedding"
				:colorBy="selectedColorOption"
			/>
		</div>
	</div>
</template>

<script setup>
import { motion } from 'motion-v'
import { useGeneAPI } from '@/api/geneAPI'

const props = defineProps({
	colorScheme: { type: String, default: '#5470c6' },
})

// Refs for UI controls
const activate3DMode = ref(false)
const selectedColorOption = ref()
const selectedFilterOption = ref()
const selectedVisualizationType = ref('UMAP')
const filterMethods = ref(['Source', 'Cluster'])
const visualizationTypes = ref(['UMAP', 't-SNE'])
const colorMethods = ref(['Source', 'Cluster', 'Gene'])

// Gene search
const suggestions = ref([])
const selectedGene = ref(null)
const geneExpression = ref(null)

// Loading state
const isLoading = ref(true)

// Data for filters
const clusters = ref([])
const cellTypes = ref([])

// Graph components references
const UMAP2DGraph = ref(null)
const UMAP3DGraph = ref(null)
const TSNE2DGraph = ref(null)
const TSNE3DGraph = ref(null)

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

// Handle visualization type change
const handleVisualizationChange = (value) => {
	if (value === 't-SNE' && (tsne2DEmbedding.value.length === 0 || tsne3DEmbedding.value.length === 0)) {
		// Load t-SNE data if it hasn't been loaded yet
		loadTSNEData()
	}
}

// Search gene by name
const searchGene = async (event) => {
	const { getGeneAutocomplete } = useGeneAPI()
	try {
		suggestions.value = (await getGeneAutocomplete(event?.query)) || []
	} catch (err) {
		console.error('Error fetching gene autocomplete:', err)
		suggestions.value = []
	}
}

// Get gene expression data and update visualizations
const searchGeneExpression = async (event) => {
	const { getSingleGeneExpression } = useGeneAPI()
	try {
		isLoading.value = true
		selectedGene.value = event?.value || null
		geneExpression.value = (await getSingleGeneExpression(event?.value)) || []

		// Update both UMAP and t-SNE with expression values
		updateEmbeddingsWithExpression()
	} catch (err) {
		console.error('Error fetching gene expression:', err)
		geneExpression.value = []
	} finally {
		isLoading.value = false
	}
}

// Clear gene selection and reset expression values
const clearGeneSelection = () => {
	selectedGene.value = null

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
				TSNE3DGraph.value?.updateChart()
			} else if (!activate3DMode.value && selectedVisualizationType.value === 't-SNE') {
				TSNE2DGraph.value?.updateChart()
			}
		})
	}
}

// Load cell types and clusters for filtering
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
			await Promise.all([searchGene(), loadUMAP2D(), loadUMAP3D(), loadFilterOptions(), loadTSNEData()])
		} catch (err) {
			console.error('Error initializing component:', err)
		} finally {
			isLoading.value = false

			// Update the appropriate chart
			nextTick(() => {
				if (activate3DMode.value) {
					if (selectedVisualizationType.value === 'UMAP') {
						UMAP3DGraph.value?.updateChart()
					} else {
						TSNE3DGraph.value?.updateChart()
					}
				} else {
					if (selectedVisualizationType.value === 'UMAP') {
						UMAP2DGraph.value?.updateChart()
					} else {
						TSNE2DGraph.value?.updateChart()
					}
				}
			})
		}
	})
})
</script>

<style></style>
