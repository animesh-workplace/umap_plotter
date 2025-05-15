<template>
	<div class="min-w-full">
		<div class="flex gap-2 items-center justify-between mb-2 px-4">
			<div class="flex gap-2 items-center">
				<ToggleSwitch v-model="activate3DMode" />
				<Icon class="w-5 h-5 text-slate-500" name="akar-icons:augmented-reality" />
				<div>3D Mode</div>
			</div>

			<div class="flex gap-2 items-center">
				<ToggleSwitch v-model="groupByCluster" />
				<Icon class="w-5 h-5 text-slate-500" name="akar-icons:sparkles" />
				<div>Color by Cluster</div>
			</div>
		</div>

		<Skeleton height="45rem" v-if="isLoading" />

		<div v-else>
			<GraphUMAP3D
				ref="UMAP3DGraph"
				v-if="activate3DMode"
				:scatterData="umap3DEmbedding"
				:color-by-cluster="groupByCluster"
			/>
			<GraphUMAP2D
				v-else
				ref="UMAP2DGraph"
				:scatterData="umap2DEmbedding"
				:color-by-cluster="groupByCluster"
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

const isLoading = ref(true)
const UMAP2DGraph = ref(null)
const UMAP3DGraph = ref(null)
const umap2DEmbedding = ref([])
const umap3DEmbedding = ref([])
const activate3DMode = ref(false)
const groupByCluster = ref(false)
const original2DUmapEmbedding = ref(null)
const original3DUmapEmbedding = ref(null)
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const get2DEmbedding = async () => {
	const { get2DUmapEmbedding } = useGeneAPI()
	try {
		const response = await get2DUmapEmbedding()
		if (response && Array.isArray(response)) {
			original2DUmapEmbedding.value = response.map((item) => [item.x, item.y, item.cell_id, item.cluster, 0])
			umap2DEmbedding.value = [...original2DUmapEmbedding.value]
		} else {
			console.error('Invalid UMAP embedding response:', response)
			umap2DEmbedding.value = []
		}
	} catch (err) {
		console.error('Error fetching UMAP embedding:', err)
		umap2DEmbedding.value = []
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
		// The data structure is [X, Y, Z, Cell_ID, cluster_id, expression]
		umap3DEmbedding.value = response.map((item) => {
			return [Number(item.x) || 0, Number(item.y) || 0, Number(item.z) || 0, item.cell_id, item.cluster, 0]
		})
	} catch (err) {
		console.error('Error fetching UMAP embedding:', err)
		umap3DEmbedding.value = []
	} finally {
		isLoading.value = false
	}
}

onBeforeMount(() => {
	nextTick(async () => {
		try {
			await get2DEmbedding()
			await get3DEmbedding()
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
