<template>
	<div class="p-4 grid grid-cols-1 justify-items-center z-50">
		<div class="mb-2 text-center">
			<h2 class="text-xl font-semibold mb-1">Gene Co-expression Visualization</h2>
		</div>

		<div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-9 min-w-full mt-2 mx-4">
			<Skeleton height="3rem" v-if="isLoading" class="mb-4 mt-2" />

			<div
				class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-3 xl:col-start-4 grid grid-cols-2 xl:grid-cols-3 gap-1 items-center justify-between mb-2 px-2 xl:px-4 backdrop-blur rounded-lg"
				v-else
			>
				<div class="flex gap-2 items-center justify-center">
					<ToggleSwitch v-model="activate3DMode" @update:modelValue="handle3DModeChange" />
					<Icon class="w-5 h-5 text-slate-500" name="akar-icons:augmented-reality" />
					<div>3D Mode</div>
				</div>

				<FloatLabel variant="on">
					<Select
						fluid
						size="small"
						inputId="Visualization-Type"
						:options="visualizationTypes"
						@update:modelValue="handlePlotChange"
						v-model="selectedVisualizationType"
					/>
					<label for="Visualization-Type" class="flex items-center gap-2">
						<Icon class="w-4 h-4 text-slate-500" name="tabler:chart-dots" /> Plot type
					</label>
				</FloatLabel>

				<FloatLabel variant="on">
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
		</div>

		<div
			v-if="selectedFilterOption == 'Source'"
			class="flex gap-3 items-center mb-2 mt-2 justify-center px-4 backdrop-blur rounded-lg"
		>
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
			<Carousel :value="clusters" :numVisible="6" :showIndicators="false" class="backdrop-blur rounded-lg">
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

		<div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 min-w-full mt-2 mx-4">
			<Skeleton height="3rem" v-if="isLoading" class="mb-4 mt-2" />

			<div
				class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-3 xl:col-start-3 grid grid-cols-2 gap-2 items-center justify-between px-2 xl:px-4 backdrop-blur rounded-lg"
				v-else
			>
				<div class="mb-2 flex relative">
					<AutoComplete
						dropdown
						class="w-full"
						v-model="selectedGene1"
						@complete="handleGeneSearch1"
						@item-select="searchGeneExpression1"
						:suggestions="suggestions_for_graph1"
						placeholder="Type gene name to search ..."
					/>

					<button class="ml-2" v-if="selectedGene1" @click="clearGeneSelection1">
						<Icon name="akar-icons:circle-x" class="w-5 h-5 text-red-500" />
					</button>
				</div>

				<div class="mb-2 flex relative">
					<AutoComplete
						dropdown
						class="w-full"
						v-model="selectedGene2"
						@complete="handleGeneSearch2"
						@item-select="searchGeneExpression2"
						:suggestions="suggestions_for_graph2"
						placeholder="Type gene name to search ..."
					/>

					<button class="ml-2" v-if="selectedGene2" @click="clearGeneSelection2">
						<Icon name="akar-icons:circle-x" class="w-5 h-5 text-red-500" />
					</button>
				</div>
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
			<PlotsHeatMap class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2 backdrop-blur rounded-lg" />
		</div>
	</div>
</template>

<script setup>
import { motion } from 'motion-v'
import { useGeneAPI } from '@/api/geneAPI'
import { useGeneralDataStore } from '@/stores/generalData'

const graph1 = ref(null)
const graph2 = ref(null)
const graph3 = ref(null)
const clusters = ref([])
const cellTypes = ref([])
const isLoading = ref(false)
const selectedGene1 = ref('')
const selectedGene2 = ref('')
const activate3DMode = ref(false)
const selectedFilterOption = ref()
const selectedVisualizationType = ref('UMAP')
const filterMethods = ref(['Source', 'Cluster'])
const visualizationTypes = ref(['UMAP', 't-SNE'])

const resetFilter = () => {
	console.log('resetFilter')
}

// For gene1
const suggestions_for_graph1 = computed(() => {
	return graph1.value?.suggestions || []
})

const handleGeneSearch1 = async (event) => {
	if (graph1.value) {
		await graph1.value.searchGene(event)
	}
}

const searchGeneExpression1 = async (event) => {
	if (graph1.value) {
		graph1.value.selectedColorOption = 'Gene'
		await graph1.value.searchGeneExpression(event)
	}
}

const clearGeneSelection1 = async () => {
	if (graph1.value) {
		await graph1.value.clearGeneSelection()
		selectedGene1.value = ''
		graph1.value.selectedColorOption = ''
	}
}

// For gene2
const suggestions_for_graph2 = computed(() => {
	return graph2.value?.suggestions || []
})

const handleGeneSearch2 = async (event) => {
	if (graph2.value) {
		await graph2.value.searchGene(event)
	}
}

const searchGeneExpression2 = async (event) => {
	if (graph2.value) {
		graph2.value.selectedColorOption = 'Gene'
		await graph2.value.searchGeneExpression(event)
	}
}

const clearGeneSelection2 = async () => {
	if (graph2.value) {
		await graph2.value.clearGeneSelection()
		selectedGene2.value = ''
		graph2.value.selectedColorOption = ''
	}
}

// Handle 3D Mode Changes
const handle3DModeChange = (changeValue) => {
	graph1.value.activate3DMode = changeValue
	graph2.value.activate3DMode = changeValue
	graph3.value.activate3DMode = changeValue
}
// Handle Plot Changes
const handlePlotChange = async (changeValue) => {
	graph1.value.selectedVisualizationType = changeValue
	graph2.value.selectedVisualizationType = changeValue
	graph3.value.selectedVisualizationType = changeValue
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
