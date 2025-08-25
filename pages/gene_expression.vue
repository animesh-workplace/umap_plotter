<template>
	<div class="p-4 grid grid-cols-1 justify-items-center z-50">
		<div class="mb-2 text-center">
			<div class="p-4 lg:px-16">
				<div class="text-center ltr:sm:text-left rtl:sm:text-right">
					<h2 class="text-2xl font-bold text-gray-900 md:text-3xl">Gene Expression Visualization</h2>

					<p class="text-gray-500 mt-4 max-w-3xl">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Et, egestas tempus tellus etiam
						sed. Quam a scelerisque amet ullamcorper eu enim et fermentum, augue. Aliquet amet volutpat
						quisque ut interdum tincidunt duis.
					</p>
				</div>
			</div>
		</div>

		<div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 min-w-full mt-2">
			<InteractiveGraph
				class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-start-3 xl:col-span-2 backdrop-blur rounded-lg"
			/>
		</div>
	</div>
</template>

<script setup>
import { useGeneralDataStore } from '@/stores/generalData'

onMounted(() => {
	nextTick(() => {
		const generalDataStore = useGeneralDataStore()
		generalDataStore.updateNavBarPosition('Gene Expression')
	})
})
</script>

<style></style>
