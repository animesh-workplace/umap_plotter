<template>
    <div>
        <AutoComplete v-model="selectedGene" :suggestions="suggestions" @complete="onSearch" placeholder="Search Gene"
            class="w-full md:w-30rem" @item-select="searchExpression" />

        <div class="mt-4">
            <ProgressSpinner v-if="loading" style="width: 50px; height: 50px" strokeWidth="4" />
        </div>
    </div>
</template>

<script setup>
import { useGeneOptionsStore } from '@/stores/geneInfo'
import { useUmapDataStore } from '@/stores/umapData'

const store = useGeneOptionsStore()
const umapStore = useUmapDataStore()

const loading = ref(false)
const suggestions = ref([])
const selectedGene = ref(null)
const geneExpressionData = ref(null)

// Called when user types into the AutoComplete input
const onSearch = (event) => {
    const query = event.query.toLowerCase()
    suggestions.value = store.filteredGenes(query).map(g => g)
}

const searchExpression = async (gene) => {
    loading.value = true
    try {
        const res = await fetch(`http://localhost:8000/api/umap-geneexp/?gene_name=${encodeURIComponent(gene.value)}`)
        if (res.ok) {
            geneExpressionData.value = await res.json()
            // Update the store with the gene expression data
            umapStore.updateGeneExpression(geneExpressionData.value)
            loading.value = false
        } else {
            console.error('Failed to fetch gene expression data')
        }
    } catch (err) {
        console.error('Error fetching gene expression data:', err)
    }
}
</script>