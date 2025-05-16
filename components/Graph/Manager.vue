<template>
	<div class="min-w-full">
		<Skeleton height="3rem" v-if="isLoading" class="mb-4 mt-2" />

		<div class="flex gap-2 items-center justify-between mb-4 mt-2 px-4" v-else>
			<div class="flex gap-2 items-center">
				<ToggleSwitch v-model="activate3DMode" />
				<Icon class="w-5 h-5 text-slate-500" name="akar-icons:augmented-reality" />
				<div>3D Mode</div>
			</div>

			<FloatLabel class="w-36" variant="on">
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

			<FloatLabel class="w-36" variant="on">
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
			<motion.div :index="celltype.index" :while-hover="{ scale: 0.97 }" v-for="celltype in umapCellType">
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
			<Carousel :value="umapCluster" :numVisible="6" :showIndicators="false">
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
			<GraphUMAP3D
				ref="UMAP3DGraph"
				v-if="activate3DMode"
				:scatterData="umap3DEmbedding"
				:colorBy="selectedColorOption"
			/>
			<GraphUMAP2D v-else ref="UMAP2DGraph" :scatterData="umap2DEmbedding" :colorBy="selectedColorOption" />
		</div>
	</div>
</template>

<script setup>
import { motion } from 'motion-v'
import { useGeneAPI } from '@/api/geneAPI'

const props = defineProps({
	colorScheme: { type: String, default: '#5470c6' },
})

const selectedColorOption = ref()
const selectedFilterOption = ref()
const filterMethods = ref(['Source', 'Cluster'])
const colorMethods = ref(['Source', 'Cluster', 'Gene'])

const suggestions = ref([])
const isLoading = ref(true)
const umapCluster = ref([])
const umapCellType = ref([])
const UMAP2DGraph = ref(null)
const UMAP3DGraph = ref(null)
const selectedGene = ref(null)
const umap2DEmbedding = ref([])
const umap3DEmbedding = ref([])
const geneExpression = ref(null)
const activate3DMode = ref(false)
const original2DUmapEmbedding = ref(null)
const original3DUmapEmbedding = ref(null)

// Call the autocomplete API with the user's query and update the suggestions list
const searchGene = async (event) => {
	const { getGeneAutocomplete } = useGeneAPI()
	try {
		suggestions.value = (await getGeneAutocomplete(event?.query)) || []
	} catch (err) {
		console.error('Error fetching gene autocomplete:', err)
		suggestions.value = []
	}
}

// Fetches and updates the graph data with expression values for the selected gene
const searchGeneExpression = async (event) => {
	const { getSingleGeneExpression } = useGeneAPI()
	try {
		isLoading.value = true
		selectedGene.value = event?.value || null
		geneExpression.value = (await getSingleGeneExpression(event?.value)) || []

		// Update the graph with expression values and update visualMap
		updateGraphWithExpression()
	} catch (err) {
		console.error('Error fetching gene expression:', err)
		geneExpression.value = []
	} finally {
		isLoading.value = false
	}
}

// Updates the chart with expression data when a gene is selected
const updateGraphWithExpression = () => {
	// Update the 2D embedding data with expression values
	umap2DEmbedding.value = umap2DEmbedding.value.map(([x, y, cellID, source, cluster, _]) => {
		const expressionValue = geneExpression.value[cellID] !== undefined ? geneExpression.value[cellID] : 0
		return [x, y, cellID, source, cluster, expressionValue]
	})
	original2DUmapEmbedding.value = [...umap2DEmbedding.value]

	// Update the 3D embedding data with expression values
	umap3DEmbedding.value = umap3DEmbedding.value.map(([x, y, z, cellID, source, cluster, _]) => {
		const expressionValue = geneExpression.value[cellID] !== undefined ? geneExpression.value[cellID] : 0
		return [x, y, z, cellID, source, cluster, expressionValue]
	})
	original3DUmapEmbedding.value = [...umap3DEmbedding.value]
}

const clearGeneSelection = () => {
	selectedGene.value = null
	original2DUmapEmbedding.value = original2DUmapEmbedding.value.map(([x, y, cellID, source, cluster, _]) => {
		return [x, y, cellID, source, cluster, 0]
	})
	umap2DEmbedding.value = [...original2DUmapEmbedding.value]
	original3DUmapEmbedding.value = original3DUmapEmbedding.value.map(([x, y, z, cellID, source, cluster, _]) => {
		return [x, y, z, cellID, source, cluster, 0]
	})
	umap3DEmbedding.value = [...original3DUmapEmbedding.value]
}

const get2DEmbedding = async () => {
	const { get2DUmapEmbedding } = useGeneAPI()
	isLoading.value = true
	try {
		const response = await get2DUmapEmbedding()
		if (!response || !Array.isArray(response) || response.length === 0) {
			console.warn('API returned empty or invalid data:', response)
			umap2DEmbedding.value = []
			return
		}

		// The data structure is [X, Y, Cell_ID, source, cluster_id, expression]
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
		original2DUmapEmbedding.value = [...umap2DEmbedding.value]
	} catch (err) {
		console.error('Error fetching UMAP embedding:', err)
		umap2DEmbedding.value = []
		original2DUmapEmbedding.value = []
	} finally {
		isLoading.value = false
	}
}

const get3DEmbedding = async () => {
	const { get3DUmapEmbedding } = useGeneAPI()
	isLoading.value = true

	try {
		const response = await get3DUmapEmbedding()

		if (!response || !Array.isArray(response) || response.length === 0) {
			console.warn('API returned empty or invalid data:', response)
			umap3DEmbedding.value = []
			return
		}
		// The data structure is [X, Y, Z, Cell_ID, source, cluster_id, expression]
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
		original3DUmapEmbedding.value = [...umap3DEmbedding.value]
	} catch (err) {
		console.error('Error fetching UMAP embedding:', err)
		umap3DEmbedding.value = []
		original3DUmapEmbedding.value = []
	} finally {
		isLoading.value = false
	}
}

// Call the autocomplete API with the user's query and update the suggestions list
const getFilterCellType = async () => {
	const { get2DUmapCellType } = useGeneAPI()
	const cluster = ['CAF-1', 'CAF-2', 'CAF-3', 'CAF-4', 'CAF-5', 'CAF-6', 'CAF-7', 'CAF-8', 'CAF-9']
	try {
		const response = (await get2DUmapCellType()) || []
		umapCellType.value = response.map((item, index) => ({
			name: item,
			index: index,
			active: true,
		}))
		umapCluster.value = cluster.map((item, index) => ({
			name: item,
			index: index,
			active: true,
		}))
	} catch (err) {
		console.error('Error fetching 2D cell type names:', err)
		umapCellType.value = []
	}
}

const FilterCellType = (index) => {
	umapCellType.value[index].active = !umapCellType.value[index].active
	applyFilters(umapCellType)
}

const FilterCluster = (index) => {
	umapCluster.value[index].active = !umapCluster.value[index].active
	applyFilters(umapCluster)
}

const resetFilter = (value) => {
	umap2DEmbedding.value = [...original2DUmapEmbedding.value]
	umap3DEmbedding.value = [...original3DUmapEmbedding.value]
	umapCellType.value.forEach((item) => (item.active = true))
	umapCluster.value.forEach((item) => (item.active = true))
}

// Apply cell type filters to the UMAP data
const applyFilters = (appliedFilters) => {
	const activeFilters = appliedFilters.value.filter((ct) => ct.active).map((ct) => ct.name)

	// Filter the data to only include active cell types
	umap2DEmbedding.value = original2DUmapEmbedding.value.filter((point) => {
		const prefix = point[selectedFilterOption.value == 'Source' ? 3 : 4]
		return activeFilters.includes(prefix)
	})

	umap3DEmbedding.value = original3DUmapEmbedding.value.filter((point) => {
		const prefix = point[selectedFilterOption.value == 'Source' ? 4 : 5]
		return activeFilters.includes(prefix)
	})
}

onBeforeMount(() => {
	nextTick(async () => {
		try {
			await searchGene()
			await get2DEmbedding()
			await get3DEmbedding()
			await getFilterCellType()
		} catch (err) {
			console.error('Error initializing component:', err)
		} finally {
			isLoading.value = false
			UMAP2DGraph.value.updateChart()
		}
	})
})
</script>

<style></style>
