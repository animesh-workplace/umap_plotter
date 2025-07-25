<template>
	<div class="p-4 grid grid-cols-1 justify-items-center z-50">
		<div class="mb-2 text-center">
			<h2 class="text-xl font-semibold mb-1">Gene Expression Visualization</h2>
		</div>
		<div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-10 min-w-full mt-2">
			<InteractiveGraph
				class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-start-3 xl:col-span-3 backdrop-blur rounded-lg"
			/>
			<InteractiveGraph
				class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-3 backdrop-blur rounded-lg"
			/>
		</div>
	</div>
</template>

<script setup>
import { useGeneralDataStore } from '@/stores/generalData'

onMounted(() => {
	nextTick(() => {
		const generalDataStore = useGeneralDataStore()
		generalDataStore.updateNavBarPosition('Dual Gene Expression')
	})
})
</script>
