<template>
	<footer class="bg-slate-900 z-50">
		<div class="mx-8">
			<div class="lg:grid lg:grid-cols-2">
				<!-- Section -->
				<div
					class="border-b border-gray-100 py-8 lg:order-last lg:border-s lg:border-b-0 lg:py-16 lg:p-16"
				>
					<div class="mt-8 space-y-4 lg:mt-0">
						<!-- Website Logo -->
						<div class="text-teal-600 lg:hidden dark:text-teal-300">
							<div class="flex justify-center items-center px-4">
								<div class="text-2xl font-extrabold cursor-pointer text-white">FibroScape</div>
								<div>
									<button
										class="rounded-2xl bg-gray-100/10 py-0.5 px-2 text-xs font-medium text-gray-50 cursor-pointer"
									>
										v2
									</button>
								</div>
							</div>
						</div>

						<div>
							<p class="mt-4 text-gray-400" align="justify">
								Cancer-associated fibroblasts (CAFs) play a crucial role in tissue homeostasis and
								immune remodelling in head and neck cancers. Our study has created a comprehensive
								single-cell atlas of fibroblast cell states. We present FibroScape - an interactive
								portal for viewing gene expression profiles in these fibroblast cell states to fuel
								your own research questions.
							</p>

							<!-- <h2 class="mt-4 text-xl font-medium text-white">Cite us</h2> -->
							<!-- <p class="mt-2 text-gray-500 dark:text-gray-400">
								Sanchari Pradhan, Subrata Das, Animesh K Singh, Chitrarpita Das, Analabha Basu,
								Partha P Majumder, Nidhan K Biswas, dbGENVOC: database of GENomic Variants of Oral
								Cancer, with special reference to India, Database, Volume 2021, 2021, baab034,
								<NuxtLink to="https://doi.org/10.1093/database/baab034" class="hover:underline">
									https://doi.org/10.1093/database/baab034
								</NuxtLink>
							</p> -->
						</div>
					</div>
				</div>

				<!-- Links -->
				<div class="py-8 lg:py-16 lg:px-8 xl:px-16">
					<!-- Website Logo -->
					<div class="hidden text-teal-600 lg:block">
						<div class="grid grid-cols-2">
							<div class="flex justify-center items-center border-x border-gray-200 px-4">
								<div class="text-2xl font-extrabold cursor-pointer text-white">FibroScape</div>
							</div>

							<div class="flex justify-center items-center border-r border-gray-200 px-4">
								<div class="text-2xl font-extrabold cursor-pointer text-white">BRIC NIBMG</div>
							</div>
						</div>
					</div>

					<!-- Website links -->
					<div class="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
						<div>
							<p class="font-medium text-white">Site Link</p>

							<ul class="mt-6 space-y-4 text-sm">
								<li v-for="(link, index) in siteLinks" :key="index">
									<NuxtLink :to="link.href" class="transition hover:opacity-75 text-gray-200">
										{{ link.label }}
									</NuxtLink>
								</li>
							</ul>
						</div>

						<!-- Helpful links -->
						<div>
							<p class="font-medium text-white">Helpful Links</p>

							<ul class="mt-6 space-y-4 text-sm">
								<li v-for="(link, index) in helpfulLinks" :key="index">
									<NuxtLink :to="link.href" class="transition hover:opacity-75 text-gray-200">
										{{ link.label }}
									</NuxtLink>
								</li>
							</ul>
						</div>

						<!-- NIBMG Links -->
						<div>
							<p class="font-medium text-white">BRIC NIBMG</p>

							<ul class="mt-6 space-y-4 text-sm">
								<li v-for="(link, index) in nibmgLinks" :key="index">
									<NuxtLink :to="link.href" class="transition hover:opacity-75 text-gray-200">
										{{ link.label }}
									</NuxtLink>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>

			<!-- Final Links -->
			<div class="border-t border-gray-100 py-8 dark:border-gray-800 text-center">
				<ul class="flex flex-wrap gap-4 text-xs justify-center">
					<li v-for="(link, index) in basic_links" :key="index">
						<NuxtLink
							:to="link.href"
							class="text-gray-500 transition hover:opacity-75 dark:text-gray-400"
						>
							{{ link.label }}
						</NuxtLink>
					</li>
				</ul>

				<p class="mt-4 text-xs text-gray-500 dark:text-gray-400">
					&copy; {{ new Date().getFullYear() }} | FibroScape | BRIC-NIBMG | All Rights Reserved
				</p>
			</div>
		</div>
	</footer>
</template>

<script setup>
const basic_links = [
	{ label: 'Terms & Conditions', href: '#' },
	{ label: 'Privacy Policy', href: '#' },
	{ label: 'Cookies', href: '#' },
]

const siteLinks = [
	{ label: 'Home', href: '/' },
	{ label: 'Gene Expression', href: '/gene_expression' },
	{ label: 'Gene Co-expression', href: '/gene_coexpression' },
	{ label: 'Spatial Localization', href: '/spatial_localization' },
	{ label: 'Dual Gene Expression', href: '/dual_gene_expression' },
]

const nibmgLinks = [
	{ label: 'Home', href: 'https://www.nibmg.ac.in' },
	{ label: 'Reach us', href: 'https://www.nibmg.ac.in/careers/' },
	{ label: 'Contact us', href: 'https://www.nibmg.ac.in/p/contact' },
	{ label: 'About BRIC', href: 'https://www.bric.nic.in' },
]

const helpfulLinks = [
	{ label: 'Manuscript', href: '#' },
	{ label: 'Frontend Source Code', href: '#' },
	{ label: 'Backend Source Code', href: '#' },
]
</script>
