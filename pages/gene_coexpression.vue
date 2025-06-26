<template>
	<div class="p-4 grid grid-cols-1 justify-items-center z-50">
		<div class="mb-2 text-center">
			<h2 class="text-xl font-semibold mb-1">Gene Co-expression Visualization</h2>
		</div>

		<div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-9 min-w-full mt-2 mx-4">
			<Skeleton height="3rem" v-if="isLoading" class="mb-4 mt-2" />

			<div
				class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-3 xl:col-start-4 grid grid-cols-2 xl:grid-cols-3 gap-1 items-center justify-between mb-4 px-2 xl:px-4"
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

		<div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 min-w-full mt-2 mx-4">
			<Skeleton height="3rem" v-if="isLoading" class="mb-4 mt-2" />

			<div
				class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-3 xl:col-start-3 grid grid-cols-2 gap-2 items-center justify-between mb-4 px-2 xl:px-4"
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

					<button class="ml-2" v-if="selectedGene1" @click="clearGeneSelection">
						<Icon name="akar-icons:circle-x" class="w-5 h-5 text-red-500" />
					</button>
				</div>

				<!-- <div class="mb-2 flex relative">
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
				</div> -->
			</div>
		</div>

		<div
			class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 min-w-full mt-2 px-2 xl:px-8"
		>
			<GraphManager
				noFilter
				ref="graph1"
				:geneSearch="false"
				colorScheme="#0284c7"
				class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2 backdrop-blur rounded-lg"
			/>
			<GraphManager
				noFilter
				ref="graph2"
				:geneSearch="false"
				colorScheme="#9d174d"
				class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2 backdrop-blur rounded-lg"
			/>
			<GraphManager
				noFilter
				ref="graph3"
				colorScheme="#ca8a04"
				class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2 backdrop-blur rounded-lg"
			/>
			<GraphHeatMap class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2 backdrop-blur rounded-lg" />
		</div>
	</div>
</template>

<script setup>
import { useGeneralDataStore } from '@/stores/generalData'

const graph1 = ref(null)
const graph2 = ref(null)
const graph3 = ref(null)
const selectedGene1 = ref('')
const selectedGene2 = ref('')
const isLoading = ref(false)
const activate3DMode = ref(false)
const selectedFilterOption = ref()
const selectedVisualizationType = ref('UMAP')
const filterMethods = ref(['Source', 'Cluster'])
const visualizationTypes = ref(['UMAP', 't-SNE'])

const resetFilter = () => {
	console.log('resetFilter')
}

const suggestions_for_graph1 = computed(() => {
	return graph1.value?.suggestions || []
})

// Handle gene search - this will be called when user types
const handleGeneSearch1 = async (event) => {
	// Call searchGene on all graph components
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

const handle3DModeChange = (changeValue) => {
	graph1.value.activate3DMode = changeValue
	graph2.value.activate3DMode = changeValue
	graph3.value.activate3DMode = changeValue
}

const handlePlotChange = (changeValue) => {
	graph1.value.selectedVisualizationType = changeValue
	graph2.value.selectedVisualizationType = changeValue
	graph3.value.selectedVisualizationType = changeValue
}

onMounted(() => {
	nextTick(() => {
		const generalDataStore = useGeneralDataStore()
		generalDataStore.updateNavBarPosition('Gene Co-expression')
	})
})
</script>

<style></style>
