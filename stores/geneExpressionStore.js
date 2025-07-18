import { defineStore } from 'pinia'

export const useGeneExpressionStore = defineStore('geneExpression', {
	state: () => ({
		selectedGene: null,
		geneExpressionData: null,
	}),
	actions: {
		setGeneExpression(gene, data) {
			this.selectedGene = gene
			this.geneExpressionData = data
		},
		clearGeneExpression() {
			this.selectedGene = null
			this.geneExpressionData = null
		},
	},
	getters: {
		isGeneExpressionLoaded: (state) => !!state.geneExpressionData,
	},
})