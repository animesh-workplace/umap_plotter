<template>
	<div class="grid grid-cols-1 justify-items-center z-50">
		<div
			class="bg-white/20 backdrop-blur-md w-screen absolute top-0 overflow-hidden h-1/5 md:h-[440px] lg:h-[400px]"
		>
			<div
				class="h-72 w-72 sm:h-[800px] sm:w-[800px] absolute rounded-full blur-[120px] bg-[#9d174d]/40 top-[10%] -left-[50%] xl:-left-[10%] lg:-left-[50%] md:-left-[80%] hero-morph"
			></div>
			<div
				class="h-72 w-72 sm:h-[800px] sm:w-[800px] absolute rounded-full blur-[120px] bg-[#0284c7]/40 top-[10%] -right-[50%] xl:-right-[10%] lg:-right-[50%] md:-right-[80%] hero-morph"
			></div>
		</div>

		<div class="p-8 z-10 w-full">
			<section class="py-8">
				<h2 class="text-2xl font-bold text-gray-900 md:text-4xl max-w-4xl mx-auto text-center">
					FibroScape: Advanced Single-Cell Visualizer
				</h2>

				<h5 class="text-md font-semibold text-gray-600 mt-4 max-w-2xl mx-auto text-center">
					Explore single-cell RNA-seq data with interactive UMAP/tSNE visualizations, co-expression
					analysis, and spatial localization
				</h5>

				<p class="hidden text-gray-500 sm:mt-4 sm:block max-w-2xl mx-auto text-center">
					Empower your research with comprehensive gene expression analysis tools designed for
					researchers, bioinformaticians, and cell biologists. Discover patterns in cancer-associated
					fibroblast data without programming expertise.
				</p>
			</section>
		</div>

		<!-- Features Section -->
		<section class="p-8 w-screen backdrop-blur-sm bg-slate-200/50">
			<h2 class="text-2xl font-bold text-gray-900 md:text-4xl max-w-4xl mx-auto text-center mt-4">
				Powerful Analysis Features
			</h2>

			<h5 class="text-md font-semibold text-gray-600 mt-4 max-w-2xl mx-auto text-center">
				Explore your gene expression data through multiple complementary approaches
			</h5>

			<div class="grid xl:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-8 mt-8">
				<NuxtLink
					:key="index"
					:to="feature.href"
					v-for="(feature, index) in features"
					class="rounded-2xl border border-gray-200 bg-gray-300 p-4 shadow-sm transition hover:shadow sm:p-6 cursor-pointer"
				>
					<div class="flex justify-between mb-2">
						<span class="rounded-xl bg-[#1D4ED826] p-2 text-white">
							<Icon :name="feature.icon" class="w-7 h-7 flex justify-center" />
						</span>
						<span class="text-gray-500">
							<Icon name="tabler:external-link" class="w-7 h-7 flex justify-center" />
						</span>
					</div>

					<h3 class="mt-0.5 text-lg font-bold text-gray-900">
						{{ feature.title }}
					</h3>

					<p class="mt-2 text-sm/relaxed text-gray-500">
						{{ feature.description }}
					</p>
				</NuxtLink>
			</div>
		</section>

		<section class="overflow-hidden bg-gray-50 grid grid-cols-2 gap-12 items-center">
			<div class="p-8 md:p-12 lg:px-16">
				<div class="text-center ltr:sm:text-left rtl:sm:text-right">
					<h2 class="text-2xl font-bold text-gray-900 md:text-3xl">
						Lorem, ipsum dolor sit amet consectetur adipisicing elit
					</h2>

					<p class="hidden text-gray-500 md:mt-4 md:block">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Et, egestas tempus tellus etiam
						sed. Quam a scelerisque amet ullamcorper eu enim et fermentum, augue. Aliquet amet volutpat
						quisque ut interdum tincidunt duis.
					</p>
				</div>
			</div>

			<div class="my-8">
				<div>
					<div
						class="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[8px] rounded-t-xl h-[172px] max-w-[301px] md:h-[294px] md:max-w-[512px]"
					>
						<div class="rounded-lg overflow-hidden h-[156px] md:h-[278px] bg-white dark:bg-gray-800">
							<img
								src="https://flowbite.s3.amazonaws.com/docs/device-mockups/laptop-screen-dark.png"
								class="block h-[156px] md:h-[278px] w-full rounded-lg"
								alt="Analysis Image"
							/>
						</div>
					</div>
					<div
						class="relative mx-auto bg-gray-900 dark:bg-gray-700 rounded-b-xl rounded-t-sm h-[17px] max-w-[351px] md:h-[21px] md:max-w-[597px]"
					>
						<div
							class="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-xl w-[56px] h-[5px] md:w-[96px] md:h-[8px] bg-gray-800"
						></div>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script setup>
import { NuxtLink } from '#components'

const features = ref([
	{
		icon: 'solar:dna-line-duotone',
		title: 'UMAP & tSNE Visualization',
		href: '/gene_expression',
		subtitle: 'General Expression Analysis',
		description:
			'Explore gene expression patterns through interactive UMAP and tSNE plots. Color cells by gene expression levels, data source, or cancer-associated fibroblast (CAF) markers.',
	},
	{
		icon: 'tabler:box-multiple-filled',
		href: '/dual_gene_expression',
		title: 'Simultaneous Plot Comparison',
		subtitle: 'Dual Expression View',
		description:
			'View both tSNE and UMAP plots side-by-side for the same gene, with simultaneous CAF and gene expression coloring for comprehensive analysis.',
	},
	{
		icon: 'tabler:dna-2',
		href: '/gene_coexpression',
		title: 'Gene Co-expression Heatmaps',
		subtitle: 'Co-expression Analysis',
		description:
			'Analyze the co-expression patterns of two genes together using interactive heatmap visualizations showing combined expression profiles.',
	},
	{
		icon: 'tabler:image-in-picture',
		href: '/spatial_localization',
		title: 'Tissue Spatial Mapping',
		subtitle: 'Spatial Localization',
		description:
			'Visualize cell localization overlaid on histological tissue images to understand spatial gene expression patterns in their morphological context.',
	},
])
</script>

<style scoped>
.hero-morph {
	animation: fadeIn 5s ease-in-out infinite;
}

@keyframes fadeIn {
	0%,
	100% {
		opacity: 0.3;
	}
	50% {
		opacity: 1;
	}
}
</style>
