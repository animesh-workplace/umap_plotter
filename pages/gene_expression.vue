<template>
	<VTour
		backdrop
		highlight
		trapFocus
		ref="tour"
		lockScroll
		:steps="steps"
		:showArrow="false"
		name="gene_expression_tour"
	/>
	<div class="p-4 grid grid-cols-1 justify-items-center z-50">
		<div class="mb-2 text-center p-4 lg:px-16">
			<div class="flex items-center justify-center gap-1">
				<h2 class="text-2xl font-bold text-gray-900 md:text-3xl">Gene Expression Visualization</h2>
				<Button severity="info" variant="text" rounded class="!p-1" @click="ResetTour">
					<Icon class="!w-7 !h-7 text-slate-800" name="tabler:progress-help" />
				</Button>
			</div>

			<p class="text-gray-500 mt-4 max-w-2xl backdrop-blur">
				This module enables viewers to visualise gene expression in CAFs based on a specific filtering
				criteria, such as, specific CAF subtype, or study type
			</p>
		</div>

		<div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 min-w-full mt-2">
			<InteractiveGraph
				id="Graph"
				ref="graph"
				class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-start-3 xl:col-span-2 backdrop-blur rounded-lg"
			/>
		</div>
	</div>
</template>

<script setup>
import { useGeneralDataStore } from '@/stores/generalData'

const tour = ref(null)
const graph = ref(null)
const steps = [
	{
		target: '#ThreeModeFilter',
		title: 'Switch Between 2D and 3D Views',
		subText: 'Explore from different perspectives',
		body: 'Use this control to toggle the visualization mode between 2D and 3D, helping you explore spatial patterns more effectively.',
	},
	{
		target: '#PlotTypeFilter',
		title: 'Choose a Plot Type',
		subText: 'Visualize CAF distributions',
		body: 'Select between UMAP and t-SNE plots to view the arrangement of Cancer-Associated Fibroblasts (CAFs) in different dimensional reductions.',
		onNext: () => {},
	},
	{
		target: '#ColorFilter',
		title: 'Apply a Coloring Scheme',
		subText: 'Highlight important patterns',
		body: 'Color your visualization by source, CAF clusters, or gene expression. Switching to "Gene" coloring will highlight expression patterns directly on the plot.',
		onNext: () => {
			graph.value.selectedColorOption = 'Gene'
		},
	},
	{
		target: '#DataFilter',
		title: 'Filter by Annotation',
		subText: 'Focus on specific datasets',
		body: 'Refine the visualization by selecting the source data and CAF clusters that are most relevant to your analysis.',
		onNext: () => {
			graph.value.selectedFilterOption = 'Cluster'
		},
	},
	{
		target: '#GeneSearch',
		title: 'Search for a Gene',
		subText: 'Explore expression patterns',
		body: 'Enter or select a gene to visualize its expression within the dataset. This helps you investigate specific biological markers or compare across different conditions.',
	},
	{
		target: '#ClusterFilter',
		title: 'Search for a Gene',
		subText: 'Explore expression patterns',
		body: 'Enter or select a gene to visualize its expression within the dataset. This helps you investigate specific biological markers or compare across different conditions.',
	},
	{
		target: '#Graph',
		title: 'Panel Visualization',
		subText: 'Gene expression overview',
		body: 'This graph displays the expression of the selected gene using your chosen plot type and coloring scheme. Use it to explore spatial or cluster-level patterns across the dataset.',
	},
]

const ResetTour = () => {
	tour.value?.resetTour()
}

onMounted(() => {
	nextTick(() => {
		const generalDataStore = useGeneralDataStore()
		generalDataStore.updateNavBarPosition('Gene Expression')
	})
})
</script>

<style></style>
