
import { defineStore } from 'pinia'
import { useGeneAPI } from '@/api/geneAPI'

export const useEmbeddingDataStore = defineStore('embeddingData', {
	state: () => ({
		// Raw embeddings
		umap2DEmbedding: [],
		umap3DEmbedding: [],
		tsne2DEmbedding: [],
		tsne3DEmbedding: [],

		// Gene expression data for each gene
		gene1Expression: null,
		gene2Expression: null,

		// Loading states
		isLoadingUMAP2D: false,
		isLoadingUMAP3D: false,
		isLoadingTSNE2D: false,
		isLoadingTSNE3D: false,

		// Filter options
		clusters: [],
		cellTypes: [],
		activeFilterType: null, // 'Cluster' or 'Source'
	}),

	getters: {
		// Getters to combine embeddings with gene expression
		umap2DWithExpression(state) {
			if (!state.gene1Expression && !state.gene2Expression) {
				return state.umap2DEmbedding
			}
			return state.umap2DEmbedding.map((point) => {
				const cellID = point[2]
				const expression1 = state.gene1Expression ? state.gene1Expression[cellID] || 0 : 0
				const expression2 = state.gene2Expression ? state.gene2Expression[cellID] || 0 : 0
				// Returning a new array to ensure reactivity
				return [...point.slice(0, 5), expression1, expression2]
			})
		},
		umap3DWithExpression(state) {
			if (!state.gene1Expression && !state.gene2Expression) {
				return state.umap3DEmbedding
			}
			return state.umap3DEmbedding.map((point) => {
				const cellID = point[3]
				const expression1 = state.gene1Expression ? state.gene1Expression[cellID] || 0 : 0
				const expression2 = state.gene2Expression ? state.gene2Expression[cellID] || 0 : 0
				return [...point.slice(0, 6), expression1, expression2]
			})
		},
		tsne2DWithExpression(state) {
			if (!state.gene1Expression && !state.gene2Expression) {
				return state.tsne2DEmbedding
			}
			return state.tsne2DEmbedding.map((point) => {
				const cellID = point[2]
				const expression1 = state.gene1Expression ? state.gene1Expression[cellID] || 0 : 0
				const expression2 = state.gene2Expression ? state.gene2Expression[cellID] || 0 : 0
				return [...point.slice(0, 5), expression1, expression2]
			})
		},
		tsne3DWithExpression(state) {
			if (!state.gene1Expression && !state.gene2Expression) {
				return state.tsne3DEmbedding
			}
			return state.tsne3DEmbedding.map((point) => {
				const cellID = point[3]
				const expression1 = state.gene1Expression ? state.gene1Expression[cellID] || 0 : 0
				const expression2 = state.gene2Expression ? state.gene2Expression[cellID] || 0 : 0
				return [...point.slice(0, 6), expression1, expression2]
			})
		},

		// Getters to apply filters
		filteredUmap2D(state) {
			if (!state.activeFilterType) return this.umap2DWithExpression
			const activeFilters =
				state.activeFilterType === 'Cluster'
					? new Set(state.clusters.filter((c) => c.active).map((c) => c.name))
					: new Set(state.cellTypes.filter((c) => c.active).map((c) => c.name))

			return this.umap2DWithExpression.filter((point) => {
				const filterValue = state.activeFilterType === 'Cluster' ? point[4] : point[3]
				return activeFilters.has(filterValue)
			})
		},
		filteredUmap3D(state) {
			if (!state.activeFilterType) return this.umap3DWithExpression
			const activeFilters =
				state.activeFilterType === 'Cluster'
					? new Set(state.clusters.filter((c) => c.active).map((c) => c.name))
					: new Set(state.cellTypes.filter((c) => c.active).map((c) => c.name))

			return this.umap3DWithExpression.filter((point) => {
				const filterValue = state.activeFilterType === 'Cluster' ? point[5] : point[4]
				return activeFilters.has(filterValue)
			})
		},
		filteredTsne2D(state) {
			if (!state.activeFilterType || state.tsne2DEmbedding.length === 0) return this.tsne2DWithExpression
			const activeFilters =
				state.activeFilterType === 'Cluster'
					? new Set(state.clusters.filter((c) => c.active).map((c) => c.name))
					: new Set(state.cellTypes.filter((c) => c.active).map((c) => c.name))

			return this.tsne2DWithExpression.filter((point) => {
				const filterValue = state.activeFilterType === 'Cluster' ? point[4] : point[3]
				return activeFilters.has(filterValue)
			})
		},
		filteredTsne3D(state) {
			if (!state.activeFilterType || state.tsne3DEmbedding.length === 0) return this.tsne3DWithExpression
			const activeFilters =
				state.activeFilterType === 'Cluster'
					? new Set(state.clusters.filter((c) => c.active).map((c) => c.name))
					: new Set(state.cellTypes.filter((c) => c.active).map((c) => c.name))

			return this.tsne3DWithExpression.filter((point) => {
				const filterValue = state.activeFilterType === 'Cluster' ? point[5] : point[4]
				return activeFilters.has(filterValue)
			})
		},
	},

	actions: {
		async fetchAllEmbeddings() {
			await Promise.all([
				this.fetchUMAP2D(),
				this.fetchUMAP3D(),
				this.fetchTSNE2D(),
				this.fetchTSNE3D(),
				this.loadFilterOptions(),
			])
		},

		async fetchUMAP2D() {
			if (this.umap2DEmbedding.length > 0) return
			this.isLoadingUMAP2D = true
			const { get2DUmapEmbedding } = useGeneAPI()
			try {
				const response = await get2DUmapEmbedding()
				this.umap2DEmbedding = response.map((item) => [
					Number(item.x) || 0,
					Number(item.y) || 0,
					item.cell_id,
					item.cell_id.split('_')[0],
					item.cluster,
					0, // Placeholder for gene1 expression
					0, // Placeholder for gene2 expression
				])
			} catch (error) {
				console.error('Error fetching UMAP 2D embedding:', error)
			} finally {
				this.isLoadingUMAP2D = false
			}
		},

		async fetchUMAP3D() {
			if (this.umap3DEmbedding.length > 0) return
			this.isLoadingUMAP3D = true
			const { get3DUmapEmbedding } = useGeneAPI()
			try {
				const response = await get3DUmapEmbedding()
				this.umap3DEmbedding = response.map((item) => [
					Number(item.x) || 0,
					Number(item.y) || 0,
					Number(item.z) || 0,
					item.cell_id,
					item.cell_id.split('_')[0],
					item.cluster,
					0, // Placeholder for gene1 expression
					0, // Placeholder for gene2 expression
				])
			} catch (error) {
				console.error('Error fetching UMAP 3D embedding:', error)
			} finally {
				this.isLoadingUMAP3D = false
			}
		},

		async fetchTSNE2D() {
			if (this.tsne2DEmbedding.length > 0) return
			this.isLoadingTSNE2D = true
			const { get2DTsneEmbedding } = useGeneAPI()
			try {
				const response = await get2DTsneEmbedding()
				this.tsne2DEmbedding = response.map((item) => [
					Number(item.x) || 0,
					Number(item.y) || 0,
					item.cell_id,
					item.cell_id.split('_')[0],
					item.cluster,
					0, // Placeholder for gene1 expression
					0, // Placeholder for gene2 expression
				])
			} catch (error) {
				console.error('Error fetching t-SNE 2D embedding:', error)
			} finally {
				this.isLoadingTSNE2D = false
			}
		},

		async fetchTSNE3D() {
			if (this.tsne3DEmbedding.length > 0) return
			this.isLoadingTSNE3D = true
			const { get3DTsneEmbedding } = useGeneAPI()
			try {
				const response = await get3DTsneEmbedding()
				this.tsne3DEmbedding = response.map((item) => [
					Number(item.x) || 0,
					Number(item.y) || 0,
					Number(item.z) || 0,
					item.cell_id,
					item.cell_id.split('_')[0],
					item.cluster,
					0, // Placeholder for gene1 expression
					0, // Placeholder for gene2 expression
				])
			} catch (error) {
				console.error('Error fetching t-SNE 3D embedding:', error)
			} finally {
				this.isLoadingTSNE3D = false
			}
		},

		async loadFilterOptions() {
			if (this.clusters.length > 0 && this.cellTypes.length > 0) return
			const { get2DUmapCellType } = useGeneAPI()
			const clusterNames = ['CAF-1', 'CAF-2', 'CAF-3', 'CAF-4', 'CAF-5', 'CAF-6', 'CAF-7', 'CAF-8', 'CAF-9']

			try {
				const response = (await get2DUmapCellType()) || []
				this.cellTypes = response.map((item, index) => ({
					name: item,
					index: index,
					active: true,
				}))
				this.clusters = clusterNames.map((item, index) => ({
					name: item,
					index: index,
					active: true,
				}))
			} catch (err) {
				console.error('Error fetching cell type names:', err)
			}
		},

		updateGeneExpression(geneNumber, expressionData) {
			const expressionKey = `gene${geneNumber}Expression`
			this[expressionKey] = expressionData
		},

		setFilterType(filterType) {
			this.activeFilterType = filterType
		},

		toggleClusterFilter(clusterIndex) {
			this.clusters[clusterIndex].active = !this.clusters[clusterIndex].active
		},

		toggleCellTypeFilter(cellTypeIndex) {
			this.cellTypes[cellTypeIndex].active = !this.cellTypes[cellTypeIndex].active
		},

		resetFilters() {
			this.activeFilterType = null
			this.clusters.forEach((c) => (c.active = true))
			this.cellTypes.forEach((c) => (c.active = true))
		},
	},
})
