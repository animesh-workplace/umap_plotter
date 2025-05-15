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
					inputId="on_label"
					:options="colorMethods"
					v-model="selectedColorOption"
				/>
				<label for="on_label" class="flex items-center gap-2">
					<Icon class="w-4 h-4 text-slate-500" name="tabler:color-filter" /> Color by
				</label>
			</FloatLabel>

			<FloatLabel class="w-36" variant="on">
				<Select
					fluid
					showClear
					size="small"
					inputId="on_label"
					:options="filterMethods"
					v-model="selectedFilterOption"
				/>
				<label for="on_label" class="flex items-center gap-2">
					<Icon class="w-4 h-4 text-slate-500" name="akar-icons:filter" /> Filter by
				</label>
			</FloatLabel>
		</div>

		<Skeleton height="45rem" v-if="isLoading" />

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
const colorMethods = ref(['Source', 'Gene', 'Cluster'])
const filterMethods = ref(['Source', 'Cluster'])

const isLoading = ref(true)
const umapCellType = ref([])
const UMAP2DGraph = ref(null)
const UMAP3DGraph = ref(null)
const umap2DEmbedding = ref([])
const umap3DEmbedding = ref([])
const activate3DMode = ref(false)
const original2DUmapEmbedding = ref(null)
const original3DUmapEmbedding = ref(null)

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
	try {
		const response = (await get2DUmapCellType()) || []
		umapCellType.value = response.map((item) => ({
			name: item,
			active: false,
		}))
	} catch (err) {
		console.error('Error fetching 2D cell type names:', err)
		umapCellType.value = []
	}
}

onBeforeMount(() => {
	nextTick(async () => {
		try {
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
