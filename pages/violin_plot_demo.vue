<template>
	<div class="p-4">
		<h2 class="text-xl font-semibold mb-4">Violin Plot Demo</h2>
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
			<div class="backdrop-blur rounded-lg p-4">
				<h3 class="text-lg font-medium mb-2">Sample Violin Plot</h3>
				<PlotsViolinPlot :plotData="demoData" />
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'

const demoData = ref([
	['Category A', [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]],
	['Category B', [5, 15, 25, 35, 45, 55, 65, 75, 85, 95]],
	['Category C', [20, 22, 24, 26, 28, 30, 32, 34, 36, 38]],
	['Category D', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]],
])
</script>

<style scoped></style>
