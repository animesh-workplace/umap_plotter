<template>
  <div class="p-8 grid grid-cols-1 justify-items-center">
    <div class="mb-4 text-center">
      <h2 class="text-xl font-semibold mb-2">
        Gene Expression UMAP Visualization
      </h2>
      <p class="text-gray-500">Select a gene to visualize expression levels</p>
    </div>

    <div class="grid grid-cols-4 gap-10 min-w-full">
      <UMAPGraph />
      <UMAPGraph />
      <UMAPGraph />
      <UMAPGraph />
    </div>
  </div>
</template>

<script setup></script>
