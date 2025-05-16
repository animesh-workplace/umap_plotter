<template>
	<div class="p-4 grid grid-cols-1 justify-items-center">
		<div class="mb-2 text-center">
			<h2 class="text-xl font-semibold mb-1">Gene Expression Visualization</h2>
		</div>
		<!-- <div class="grid gap-4 lg:grid-cols-6 md:grid-cols-2 min-w-full mt-2">
			<Skeleton height="3rem" v-if="isLoading" class="col-span-2 col-start-3" />
			<SelectButton
				v-else
				v-model="selection"
				:options="options"
				class="justify-center col-span-2 col-start-3"
			/>
		</div> -->
		<div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 min-w-full mt-2">
			<GraphManager class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-start-2 xl:col-span-2" />
			<GraphManager class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2" />
		</div>
	</div>
</template>

<script setup>
const isLoading = ref(true)
const selection = ref('UMAP')
const options = ref(['UMAP', 't-SNE'])

onBeforeMount(() => {
	nextTick(() => {
		isLoading.value = false
	})
})
</script>

<!-- Blue Color #0284c7 -->
<!-- Red Color #9d174d -->
<!-- Yellow Color #ca8a04 -->
