// stores/geneOptions.js
import { defineStore } from 'pinia'

export const useGeneOptionsStore = defineStore('geneOptions', {
    state: () => ({
        allGenes: [],
    }),
    getters: {
        filteredGenes: (state) => {
            return (query) =>
                state.allGenes.filter((g) =>
                    g.toLowerCase().includes(query.toLowerCase())
                )
        },
    },
    actions: {
        async fetchGenes() {
            try {
                const res = await fetch('http://localhost:8000/api/umap-gene/')
                if (!res.ok) throw new Error('Failed to fetch')
                this.allGenes = await res.json()
            } catch (err) {
                console.error('Error fetching gene options:', err)
                this.allGenes = []
            }
        },
    },
})
