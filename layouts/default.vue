<template>
	<div class="relative">
		<div class="flex justify-center">
			<Menubar
				:model="navItems"
				class="drop-shadow-lg fixed top-3 bg-slate-100/70 backdrop-blur-sm"
				:pt="{
					itemLink: 'p-2',
					root: 'rounded-full z-50 pr-4',
					itemContent: 'py-2 px-3 hover:!bg-[#186aa5ce] hover:!text-white !rounded-full group/item',
				}"
			>
				<template #start>
					<NuxtLink class="flex justify-center items-center px-4 cursor-pointer" to="/">
						<img src="@/assets/images/logo.png" alt="Logo" width="35" />
						<div class="text-[#186aa5ce] text-xl font-semibold">FibroHub</div>
					</NuxtLink>
				</template>

				<template #item="{ item }">
					<NuxtLink :to="item.route">
						<div class="flex justify-center items-center gap-1">
							<Icon class="w-5 h-5 text-slate-500 group-hover/item:text-white" :name="item.icon" />
							<span class="text-slate-600 font-medium group-hover/item:text-white">
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
	</div>
</template>

<script setup>
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
		route: '/test',
	},
	{
		label: 'Violin Plots',
		icon: 'solar:graph-up-bold-duotone',
		route: '/',
	},
])
</script>

<style scoped></style>
