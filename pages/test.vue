<template>
	<div class="p-4 grid grid-cols-1 justify-items-center">
		<div class="mb-2 text-center">
			<h2 class="text-xl font-semibold mb-1">Gene Expression UMAP Visualization</h2>
			<p class="text-gray-500">Select a gene to visualize expression levels</p>
		</div>

		<div class="w-full mb-4">
			<div v-if="isLoading" class="text-center py-4">Loading visualization data...</div>
			<div v-else-if="error" class="text-center py-4 text-red-500">
				{{ error }}
			</div>
			<div v-else-if="scatterData.length === 0" class="text-center py-4">
				No data available for visualization.
			</div>
		</div>

		<div class="flex gap-2 items-center justify-between">
			<div class="flex gap-2 items-center">
				<ToggleSwitch v-model="groupByCluster" />
				<Icon class="w-5 h-5 text-slate-500" name="akar-icons:sparkles" />
				<div>Color by Cluster</div>
			</div>
		</div>

		<div class="grid grid-cols-4 gap-10 min-w-full">
			<UMAP3DGraph
				:scatterData="scatterData"
				class="col-span-2 col-start-2"
				:colorByCluster="groupByCluster"
			/>
		</div>

		<div class="mt-4">
			<button @click="refreshData" class="px-4 py-2 bg-blue-500 text-white rounded">Refresh Data</button>
			<p class="mt-2">Data points loaded: {{ scatterData.length }}</p>
		</div>
	</div>
</template>

<script setup>
import { useGeneAPI } from '@/api/geneAPI'

const error = ref(null)
const scatterData = ref([])
const isLoading = ref(true)
const groupByCluster = ref(false)

const get3DEmbedding = async () => {
	const { get3DUmapEmbedding } = useGeneAPI()
	isLoading.value = true
	error.value = null

	try {
		const response = await get3DUmapEmbedding()

		if (!response || !Array.isArray(response) || response.length === 0) {
			console.warn('API returned empty or invalid data:', response)
			error.value = 'API returned empty or invalid data'
			scatterData.value = []
			return
		}
		// The data structure is [X, Y, Z, Cell_ID, cluster_id, expression]
		scatterData.value = response.map((item) => {
			return [Number(item.x) || 0, Number(item.y) || 0, Number(item.z) || 0, item.cell_id, item.cluster, 0]
		})
	} catch (err) {
		console.error('Error fetching UMAP embedding:', err)
		error.value = `Error fetching data: ${err.message}`
		scatterData.value = []
	} finally {
		isLoading.value = false
	}
}

const refreshData = () => {
	get3DEmbedding()
}

onMounted(async () => {
	await get3DEmbedding()
})
</script>
