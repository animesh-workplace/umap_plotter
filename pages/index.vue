<template>
	<div class="p-4 grid grid-cols-1 justify-items-center">
		<div class="mb-2 text-center">
			<h2 class="text-xl font-semibold mb-1">Gene Expression UMAP Visualization</h2>
			<p class="text-gray-500">Select a gene to visualize expression levels</p>
		</div>
		<div class="grid lg:grid-cols-6 md:grid-cols-2 min-w-full">
			<GraphManager class="col-span-2 lg:col-start-3" />
		</div>
	</div>
</template>

<script setup></script>

<!-- Blue Color #0284c7 -->
<!-- Red Color #9d174d -->
<!-- Yellow Color #ca8a04 -->
