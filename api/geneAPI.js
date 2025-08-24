export function useGeneAPI() {
	// const config = useRuntimeConfig()
	// const BASEURL = `${config.public.API_BASE_URL}`
	const BASEURL = 'http://10.10.6.80/fibroscape/api'

	const getGeneAutocomplete = async (payload) => {
		try {
			const { data, error } = await useFetch(`${BASEURL}/genes/autocomplete/`, {
				method: 'GET',
				query: { gene: payload },
			})

			if (error.value) {
				throw new Error(error.value || 'An error occurred')
			}

			return data.value
		} catch (err) {
			console.error(err)
			throw err
		}
	}

	const getSingleGeneExpression = async (payload) => {
		try {
			const { data, error } = await useFetch(`${BASEURL}/genes/single-expr/`, {
				method: 'GET',
				query: { gene_name: payload },
			})

			if (error.value) {
				throw new Error(error.value || 'An error occurred')
			}

			return data.value
		} catch (err) {
			console.error(err)
			throw err
		}
	}

	const get2DUmapEmbedding = async () => {
		try {
			const { data, error } = await useFetch(`${BASEURL}/umap/2d/`, {
				method: 'GET',
			})

			if (error.value) {
				throw new Error(error.value || 'An error occurred')
			}
			return data.value
		} catch (err) {
			console.error(err)
			throw err
		}
	}

	const get3DUmapEmbedding = async () => {
		try {
			const { data, error } = await useFetch(`${BASEURL}/umap/3d/`, {
				method: 'GET',
			})

			if (error.value) {
				throw new Error(error.value || 'An error occurred')
			}
			return data.value
		} catch (err) {
			console.error(err)
			throw err
		}
	}

	const get2DTsneEmbedding = async () => {
		try {
			const { data, error } = await useFetch(`${BASEURL}/tsne/2d/`, {
				method: 'GET',
			})

			if (error.value) {
				throw new Error(error.value || 'An error occurred')
			}
			return data.value
		} catch (err) {
			console.error(err)
			throw err
		}
	}

	const get3DTsneEmbedding = async () => {
		try {
			const { data, error } = await useFetch(`${BASEURL}/tsne/3d/`, {
				method: 'GET',
			})

			if (error.value) {
				throw new Error(error.value || 'An error occurred')
			}
			return data.value
		} catch (err) {
			console.error(err)
			throw err
		}
	}

	const get2DUmapCellType = async () => {
		try {
			const { data, error } = await useFetch(`${BASEURL}/umap/2d/celltype`, {
				method: 'GET',
			})

			if (error.value) {
				throw new Error(error.value || 'An error occurred')
			}
			return data.value
		} catch (err) {
			console.error(err)
			throw err
		}
	}

	const getSpatialExpression = async (payload) => {
		try {
			const { data, error } = await useFetch(`${BASEURL}/spatial/expression/`, {
				method: 'GET',
				query: { sample_name: payload },
			})

			if (error.value) {
				throw new Error(error.value || 'An error occurred')
			}

			return data.value
		} catch (err) {
			console.error(err)
			throw err
		}
	}

	const getSpatialPosition = async (payload) => {
		try {
			const { data, error } = await useFetch(`${BASEURL}/spatial/position/`, {
				method: 'GET',
				query: { sample_name: payload },
			})

			if (error.value) {
				throw new Error(error.value || 'An error occurred')
			}

			return data.value
		} catch (err) {
			console.error(err)
			throw err
		}
	}

	return {
		get2DUmapCellType,
		get2DUmapEmbedding,
		get3DUmapEmbedding,
		get2DTsneEmbedding,
		get3DTsneEmbedding,
		getSpatialPosition,
		getGeneAutocomplete,
		getSpatialExpression,
		getSingleGeneExpression,
	}
}
