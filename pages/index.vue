<template>
	<div class="p-4 grid grid-cols-1 justify-items-center">
		<div class="mb-2 text-center">
			<h2 class="text-xl font-semibold mb-1">Gene Expression UMAP Visualization</h2>
			<p class="text-gray-500">Select a gene to visualize expression levels</p>
		</div>

		<div class="grid grid-cols-6 gap-10 min-w-full">
			<UMAP2DGraph ref="UMAPGraph" class="col-start-3 col-span-2" :scatterData="umapEmbedding" />
		</div>
	</div>
</template>

<script setup>
import { motion } from 'motion-v'
import { useGeneAPI } from '@/api/geneAPI'

const props = defineProps({
	colorScheme: { type: String, default: '#5470c6' },
})

const UMAPGraph = ref(null)

const isLoading = ref(true)
const umapEmbedding = ref([])
const originalUmapEmbedding = ref(null)

const get2DEmbedding = async () => {
	const { get2DUmapEmbedding } = useGeneAPI()
	try {
		const response = await get2DUmapEmbedding()

		// Check if response exists and is an array before calling map
		if (response && Array.isArray(response)) {
			originalUmapEmbedding.value = response.map((item) => [item.x, item.y, item.cell_id, item.cluster, 0])

			umapEmbedding.value = [...originalUmapEmbedding.value]
			// // Update chart with the embedding data
			// updateChart()
		} else {
			console.error('Invalid UMAP embedding response:', response)
			umapEmbedding.value = []
		}
	} catch (err) {
		console.error('Error fetching UMAP embedding:', err)
		umapEmbedding.value = []
	} finally {
		isLoading.value = false
	}
}
onMounted(() => {
	nextTick(async () => {
		try {
			await get2DEmbedding()
		} catch (err) {
			console.error('Error initializing component:', err)
		} finally {
			isLoading.value = false
			UMAPGraph.value.updateChart()
		}
	})
})
</script>

<!-- Blue Color #0284c7 -->
<!-- Red Color #9d174d -->
<!-- Yellow Color #ca8a04 -->
