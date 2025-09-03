<template>
	<VTour
		backdrop
		highlight
		trapFocus
		ref="tour"
		lockScroll
		:steps="steps"
		:showArrow="false"
		name="dual_gene_expression_tour"
	/>
	<div class="p-4 grid grid-cols-1 justify-items-center z-50">
		<div class="mb-2 text-center p-4 lg:px-16">
			<div class="flex items-center justify-center gap-1">
				<h2 class="text-2xl font-bold text-gray-900 md:text-3xl">Dual Gene Expression Visualization</h2>
				<Button severity="info" variant="text" rounded class="!p-1" @click="ResetTour">
					<Icon class="!w-7 !h-7 text-slate-800" name="tabler:progress-help" />
				</Button>
			</div>
			<p class="text-gray-500 mt-4 max-w-3xl backdrop-blur">
				This module enables viewers to compare gene expression profiles across multiple covariates.
			</p>
		</div>

		<div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-10 min-w-full mt-2">
			<InteractiveGraph
				id="Graph1"
				ref="graph1"
				class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-start-3 xl:col-span-3 backdrop-blur rounded-lg"
			/>
			<InteractiveGraph
				id="Graph2"
				ref="graph2"
				class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-3 backdrop-blur rounded-lg"
			/>
		</div>
	</div>
</template>

<script setup>
import { useGeneralDataStore } from '@/stores/generalData'

const tour = ref(null)
const graph1 = ref(null)
const graph2 = ref(null)
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
			graph1.value.selectedColorOption = 'Gene'
		},
	},
	{
		target: '#DataFilter',
		title: 'Filter by Annotation',
		subText: 'Focus on specific datasets',
		body: 'Refine the visualization by selecting the source data and CAF clusters that are most relevant to your analysis.',
		onNext: () => {
			graph1.value.selectedFilterOption = 'Cluster'
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
		target: '#Graph1',
		title: 'Left Panel Visualization',
		subText: 'Gene expression overview',
		body: 'This graph displays the expression of the selected gene using your chosen plot type and coloring scheme. Use it to explore spatial or cluster-level patterns across the dataset.',
	},
	{
		target: '#Graph2',
		title: 'Right Panel Visualization',
		subText: 'Compare or customize results',
		body: 'This panel can either mirror Graph 1 for side-by-side validation or display a completely different gene or coloring scheme. It is designed for flexible comparisons and deeper exploration.',
	},
]

const ResetTour = () => {
	tour.value?.resetTour()
}

onMounted(() => {
	nextTick(() => {
		const generalDataStore = useGeneralDataStore()
		generalDataStore.updateNavBarPosition('Dual Gene Expression')
	})
})
</script>
