<template>
	<div>
		<Skeleton height="34rem" v-if="isLoading" />

		<div v-else>
			<!-- UMAP 3D -->
			<PlotsUMAP3D
				ref="UMAP3DGraph"
				:colorScheme="colorScheme"
				:scatterData="umap3DEmbedding"
				:colorBy="selectedColorOption"
				v-if="activate3DMode && selectedVisualizationType === 'UMAP'"
			/>
			<!-- UMAP 2D -->
			<PlotsUMAP2D
				ref="UMAP2DGraph"
				:colorScheme="colorScheme"
				:scatterData="umap2DEmbedding"
				:colorBy="selectedColorOption"
				v-else-if="!activate3DMode && selectedVisualizationType === 'UMAP'"
			/>
			<!-- t-SNE 3D -->
			<PlotsUMAP3D
				ref="TSNE3DGraph"
				:colorScheme="colorScheme"
				:scatterData="tsne3DEmbedding"
				:colorBy="selectedColorOption"
				v-else-if="activate3DMode && selectedVisualizationType === 't-SNE'"
			/>
			<!-- t-SNE 2D -->
			<PlotsUMAP2D
				ref="TSNE2DGraph"
				:colorScheme="colorScheme"
				:scatterData="tsne2DEmbedding"
				:colorBy="selectedColorOption"
				v-else-if="!activate3DMode && selectedVisualizationType === 't-SNE'"
			/>
		</div>
	</div>
</template>

<script setup>
const props = defineProps({
	isLoading: { type: Boolean, default: true },
	activate3DMode: { type: Boolean, default: false },
	colorScheme: { type: String, default: '#5470c6' },
	selectedColorOption: { type: String, default: null },
	umap2DEmbedding: { type: Array, default: () => [] },
	umap3DEmbedding: { type: Array, default: () => [] },
	tsne2DEmbedding: { type: Array, default: () => [] },
	tsne3DEmbedding: { type: Array, default: () => [] },
	selectedVisualizationType: { type: String, default: 'UMAP' },
})

const UMAP2DGraph = ref(null)
const UMAP3DGraph = ref(null)
const TSNE2DGraph = ref(null)
const TSNE3DGraph = ref(null)

defineExpose({
	UMAP2DGraph,
	UMAP3DGraph,
	TSNE2DGraph,
	TSNE3DGraph,
	updatePointColors: (colors) => {
		if (props.activate3DMode && props.selectedVisualizationType === 'UMAP') {
			UMAP3DGraph.value.updatePointColors(colors)
		} else if (!props.activate3DMode && props.selectedVisualizationType === 'UMAP') {
			UMAP2DGraph.value.updatePointColors(colors)
		} else if (props.activate3DMode && props.selectedVisualizationType === 't-SNE') {
			TSNE3DGraph.value.updatePointColors(colors)
		} else if (!props.activate3DMode && props.selectedVisualizationType === 't-SNE') {
			TSNE2DGraph.value.updatePointColors(colors)
		}
	},
})
</script>
