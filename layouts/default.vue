<template>
	<div class="relative overflow-clip">
		<div class="flex justify-center min-w-full">
			<Menubar
				:model="navItems"
				class="drop-shadow-lg fixed top-3 bg-slate-400/20 backdrop-blur-lg justify-between min-w-[calc(100%-50px)] lg:min-w-0 !rounded-full"
				:pt="{ root: 'l z-50 pr-4', itemContent: '!bg-transparent' }"
			>
				<template #start>
					<NuxtLink
						to="/"
						@click="generalDataStore.updateNavBarPosition('')"
						class="flex justify-center items-center px-4 cursor-pointer"
					>
						<img src="@/assets/images/logo.png" alt="Logo" width="35" />
						<div class="text-[#186aa5ce] text-xl font-semibold">FibroScape</div>
					</NuxtLink>
				</template>

				<template #item="{ item }">
					<NuxtLink class="" :to="item.route" @click="generalDataStore.updateNavBarPosition(item.label)">
						<div
							:class="{ '!bg-[#186aa5ce] !text-white': item.label === navBarPosition }"
							class="flex justify-center items-center gap-1 px-3 py-2 hover:!bg-[#186aa5ce] hover:!text-white rounded-full group/item transition-colors duration-200"
						>
							<Icon
								:name="item.icon"
								:class="{ 'text-white': item.label == navBarPosition }"
								class="w-5 h-5 text-slate-500 group-hover/item:text-white"
							/>
							<span
								:class="{ 'text-white': item.label == navBarPosition }"
								class="text-slate-600 font-medium group-hover/item:text-white"
							>
								{{ item.label }}
							</span>
						</div>
					</NuxtLink>
				</template>
			</Menubar>
		</div>

		<svg
			x="0"
			y="0"
			cx="1"
			cy="1"
			cr="1"
			width="16"
			height="16"
			aria-hidden="true"
			class="pointer-events-none fill-neutral-400/70 absolute inset-0 size-full [mask-image:radial-gradient(1700px_circle_at_center,white,transparent)]"
		>
			<defs>
				<pattern
					x="0"
					y="0"
					width="16"
					height="16"
					id="pattern-v-0"
					patternUnits="userSpaceOnUse"
					patternContentUnits="userSpaceOnUse"
				>
					<circle id="pattern-circle" cx="1" cy="1" r="1"></circle>
				</pattern>
			</defs>
			<rect width="100%" height="100%" strokewidth="0" fill="url(#pattern-v-0)"></rect>
		</svg>

		<div class="w-screen min-h-screen overflow-x-hidden bg-gray-50 pt-[5rem]">
			<!-- Page Content -->
			<slot />
			<!-- Page Content -->
		</div>

		<Footer class="z-10 backdrop-blur rounded-t-lg" />
	</div>
</template>

<script setup>
import { useGeneralDataStore } from '@/stores/generalData'

const generalDataStore = useGeneralDataStore()
const navBarPosition = computed(() => generalDataStore.navBarPosition)

const navItems = ref([
	{
		label: 'Gene Expression',
		icon: 'solar:dna-line-duotone',
		route: '/gene_expression',
	},
	{
		label: 'Gene Co-expression',
		icon: 'tabler:dna-2',
		route: '/gene_coexpression',
	},
	{
		label: 'Spatial Localization',
		icon: 'tabler:image-in-picture',
		route: '/spatial_localization',
	},
	{
		label: 'Dual Gene Expression',
		icon: 'tabler:box-multiple-filled',
		route: '/dual_gene_expression',
	},
	// {
	// 	label: 'Violin Plots',
	// 	icon: 'solar:graph-up-bold-duotone',
	// 	route: '/violin_plot_demo',
	// },
])
</script>

<style scoped></style>
