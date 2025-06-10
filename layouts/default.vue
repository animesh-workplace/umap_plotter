<template>
	<div class="relative">
		<div class="flex justify-center">
			<Menubar
				:model="navItems"
				class="drop-shadow-lg fixed top-3 bg-slate-100/70 backdrop-blur-sm z-50 rounded-full pr-4"
			>
				<template #start>
					<div class="flex justify-center items-center px-4">
						<img src="@/assets/images/logo.png" alt="Logo" width="35" />
						<div class="text-[#186aa5] text-xl font-semibold">FibroHub</div>
					</div>
				</template>

				<template #item="{ item, props, hasSubmenu }" class="ml-4">
					<router-link v-slot="{ href, navigate }" :to="item.route" custom>
						<a v-ripple :href="href" v-bind="props.action" @click="navigate">
							<Icon class="w-5 h-5 text-slate-500" :name="item.icon" />
							<span>{{ item.label }}</span>
						</a>
					</router-link>
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
			class="pointer-events-none fill-neutral-400/60 absolute inset-0 size-full"
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
		route: '/',
	},
	{
		label: 'Gene Co-expression',
		icon: 'tabler:dna-2',
		route: '/test',
	},
	{
		label: 'Spatial Localization',
		icon: 'tabler:image-in-picture',
		route: '/',
	},
	{
		label: 'Gene vs Cell Info',
		icon: 'solar:command-bold-duotone',
		route: '/',
	},
	{
		label: 'Violin Plots',
		icon: 'solar:graph-up-bold-duotone',
		route: '/',
	},
	{
		label: 'Bubble Plots',
		icon: 'tabler:chart-bubble-filled',
		route: '/',
	},
])
</script>

<style scoped></style>
