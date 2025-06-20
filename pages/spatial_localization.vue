<template>
	<div class="p-4 grid grid-cols-1 justify-items-center z-50 bg-white">
		<div class="mb-2 text-center">
			<h2 class="text-xl font-semibold mb-1">Spatial Localization</h2>
		</div>
		<div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 min-w-full mt-2">
			<GraphSpatialScatter
				:scatterData="scatterData"
				class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2 backdrop-blur rounded-lg xl:col-start-3"
			/>
		</div>
	</div>
</template>

<script setup>
import { useGeneralDataStore } from '@/stores/generalData'

const scatterData = ref([])

onMounted(() => {
	nextTick(() => {
		const generalDataStore = useGeneralDataStore()
		generalDataStore.updateNavBarPosition('Spatial Localization')
	})
})
</script>

<style></style>
