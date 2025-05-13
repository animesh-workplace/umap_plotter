<template>
  <div class="p-8 grid grid-cols-1 justify-items-center">
    <div class="mb-4 text-center">
      <h2 class="text-xl font-semibold mb-2">
        Gene Expression UMAP Visualization
      </h2>
      <p class="text-gray-500">Select a gene to visualize expression levels</p>
    </div>

    <div class="grid grid-cols-6 gap-10 min-w-full">
      <UMAPGraph class="col-start-3 col-span-2" />
    </div>
  </div>
</template>

<script setup></script>
