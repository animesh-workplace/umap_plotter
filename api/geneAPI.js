export function useGeneAPI() {
  // const config = useRuntimeConfig()
  // const BASEURL = `${config.public.API_BASE_URL}`
  const BASEURL = "http://localhost:8000/api";

  const getGeneAutocomplete = async (payload) => {
    try {
      const { data, error } = await useFetch(`${BASEURL}/genes/autocomplete/`, {
        method: "GET",
        query: { gene: payload },
      });

      if (error.value) {
        throw new Error(error.value || "An error occurred");
      }

      return data.value;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const getSingleGeneExpression = async (payload) => {
    try {
      const { data, error } = await useFetch(`${BASEURL}/genes/single-expr/`, {
        method: "GET",
        query: { gene_name: payload },
      });

      if (error.value) {
        throw new Error(error.value || "An error occurred");
      }

      return data.value;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const getUmapEmbedding = async () => {
    try {
      const { data, error } = await useFetch(`${BASEURL}/umap/`, {
        method: "GET",
      });

      if (error.value) {
        throw new Error(error.value || "An error occurred");
      }
      return data.value;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    getUmapEmbedding,
    getGeneAutocomplete,
    getSingleGeneExpression,
  };
}
