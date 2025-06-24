<template>
	<div class="p-4 grid grid-cols-1 justify-items-center z-50">
		<div class="mb-2 text-center">
			<h2 class="text-xl font-semibold mb-1">Gene Co-expression Visualization</h2>
		</div>
		<div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 min-w-full mt-2">
			<GraphManager
				class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2 backdrop-blur rounded-lg"
				colorScheme="#0284c7"
			/>
			<GraphManager
				class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2 backdrop-blur rounded-lg"
				colorScheme="#9d174d"
			/>
			<GraphManager
				class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2 backdrop-blur rounded-lg"
				colorScheme="#ca8a04"
			/>
			<GraphHeatMap class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2 backdrop-blur rounded-lg" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { useGeneralDataStore } from '@/stores/generalData'

onMounted(() => {
	nextTick(() => {
		const generalDataStore = useGeneralDataStore()
		generalDataStore.updateNavBarPosition('Gene Co-expression')
	})
})
</script>

<style></style>
