<template>
	<VTour :steps="steps" ref="tour" name="spatial_localization_tour" backdrop />
	<div class="p-4 grid grid-cols-1 justify-items-center z-50">
		<div class="mb-2 text-center">
			<div class="p-4 lg:px-16">
				<div class="text-center">
					<h2 class="text-2xl font-bold text-gray-900 md:text-3xl">Spatial Localization</h2>

					<p class="text-gray-500 mt-4 max-w-3xl backdrop-blur">
						This module enables viewers to visualise spatial localisation of CAF subtypes across
						pathologist annotated regions, as well as, spatially-distinct tumour niches as identified
						by
						<NuxtLink class="underline" href="https://doi.org/10.1038/s41467-023-40271-4">
							Arora et. al.
						</NuxtLink>

						For gene expression queries, visit:
						<NuxtLink class="underline" href="http://www.pboselab.ca/spatial_OSCC/">
							http://www.pboselab.ca/spatial_OSCC/
						</NuxtLink>
					</p>
				</div>
			</div>
		</div>

		<div class="w-full">
			<FloatLabel variant="on" class="max-w-2xl mx-auto" id="Step1">
				<Select
					fluid
					size="small"
					optionLabel="name"
					optionValue="image"
					inputId="Image-Select"
					:options="imageOptions"
					@change="getSpatialInfo"
					v-model="selectedImageOption"
				/>
				<label for="Image-Select" class="flex items-center gap-2">
					<Icon class="w-4 h-4 text-slate-500" name="tabler:photo-square-rounded" /> Select image
				</label>
			</FloatLabel>

			<div class="my-2 backdrop-blur rounded-lg max-w-4xl mx-auto" id="Step2">
				<Carousel :value="clusterOptions" :numVisible="6" :numScroll="1" :showIndicators="false">
					<template #item="slotProp">
						<motion.div :while-hover="{ scale: 0.95 }" class="p-2">
							<Tag
								rounded
								:value="slotProp.data.pill_name"
								class="cursor-pointer w-full px-2"
								@click="FilterCluster(slotProp.data.index)"
								:severity="slotProp.data.active ? 'success' : 'danger'"
							>
								<template #icon>
									<Icon
										v-if="slotProp.data.active"
										class="w-4 h-4 text-green-500"
										name="akar-icons:tetragon-fill"
									/>
									<Icon v-else class="w-4 h-4 text-rose-500" name="akar-icons:tetragon" />
								</template>
							</Tag>
						</motion.div>
					</template>
				</Carousel>
			</div>

			<div class="my-2" id="Step3">
				<div class="flex gap-2 justify-center items-center">
					<SelectButton
						v-model="switchAnnotation"
						:disabled="!isClusterFilterActive"
						@value-change="handleAnnotationChange"
						:pt="{ pcToggleButton: { root: '!bg-gray-200' } }"
						:options="['Pathologist Annotation', 'TE Annotation']"
					>
						<template #option="slotProps">
							<Icon
								class="w-4 h-4"
								name="tabler:keyframe-align-center-filled"
								v-if="slotProps.index == 0"
							/>
							<Icon class="w-4 h-4" name="tabler:north-star" v-if="slotProps.index == 1" />
							{{ slotProps.option }}
						</template>
					</SelectButton>
				</div>
			</div>
		</div>

		<div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 min-w-full mt-2">
			<div
				class="xl:col-start-2 col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2 backdrop-blur rounded-lg"
			>
				<PlotsSpatialScatter
					:scatterData="scatterData"
					:imageURL="selectedImageOption"
					:clusterSelected="isClusterFilterActive"
				/>
			</div>

			<div class="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2 backdrop-blur rounded-lg">
				<PlotsSpatialScatter
					:scatterData="scatterData"
					:colorScheme="switchAnnotation"
					:imageURL="selectedImageOption"
					:clusterSelected="isClusterFilterActive"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { motion } from 'motion-v'
import { useGeneAPI } from '@/api/geneAPI'
import { useGeneralDataStore } from '@/stores/generalData'

const steps = [
	{ target: '#Step1', body: 'Step1' },
	{ target: '#Step2', body: 'Step2' },
	{ target: '#Step3', body: 'Step3' },
]

const tour = ref(null)
const route = useRoute()
const scatterData = ref([])
const spatialExpression = ref([])
const selectedImageOption = ref('')
const switchAnnotation = ref('Pathologist Annotation')
const clusterOptions = ref([
	{ name: 'CAF-1', active: false, option_name: 'caf_1', index: 0, pill_name: 'quiCAF' },
	{ name: 'CAF-2', active: false, option_name: 'caf_2', index: 1, pill_name: 'apCAF' },
	{ name: 'CAF-3', active: false, option_name: 'caf_3', index: 2, pill_name: 'actCAF' },
	{ name: 'CAF-4', active: false, option_name: 'caf_4', index: 3, pill_name: 'periCAF' },
	{ name: 'CAF-5', active: false, option_name: 'caf_5', index: 4, pill_name: 'meCAF' },
	{ name: 'CAF-6', active: false, option_name: 'caf_6', index: 5, pill_name: 'vsmCAF' },
	{ name: 'CAF-7', active: false, option_name: 'caf_7', index: 6, pill_name: 'infCAF' },
	{ name: 'CAF-8', active: false, option_name: 'caf_8', index: 7, pill_name: 'msCAF' },
	{ name: 'CAF-9', active: false, option_name: 'caf_9', index: 8, pill_name: 'pCAF' },
])
const imageOptions = ref([
	{ name: 'Sample 1', image: '/fibroscape/media/s1.webp' },
	{ name: 'Sample 2', image: '/fibroscape/media/s2.webp' },
	{ name: 'Sample 3', image: '/fibroscape/media/s3.webp' },
	{ name: 'Sample 4', image: '/fibroscape/media/s4.webp' },
	{ name: 'Sample 5', image: '/fibroscape/media/s5.webp' },
	{ name: 'Sample 6', image: '/fibroscape/media/s6.webp' },
	{ name: 'Sample 7', image: '/fibroscape/media/s7.webp' },
	{ name: 'Sample 8', image: '/fibroscape/media/s8.webp' },
	{ name: 'Sample 9', image: '/fibroscape/media/s9.webp' },
	{ name: 'Sample 10', image: '/fibroscape/media/s10.webp' },
	{ name: 'Sample 11', image: '/fibroscape/media/s11.webp' },
	{ name: 'Sample 12', image: '/fibroscape/media/s12.webp' },
])

const isClusterFilterActive = computed(() => {
	return clusterOptions.value.some((opt) => opt.active)
})

const handleAnnotationChange = (value) => {
	umami.track('annotation-select', {
		selected: value,
		page: route.path,
	})
}

const FilterCluster = (index) => {
	const currentState = clusterOptions.value[index]?.active
	if (!currentState) {
		umami.track('caf-select', {
			page: route.path,
			selected: clusterOptions.value[index].name,
		})
	}

	// Toggle the selected cluster's active state and deactivate others
	clusterOptions.value = clusterOptions.value.map((d, i) => ({
		...d,
		active: i === index ? !currentState : false,
	}))

	// If the cluster is now active, update scatterData
	if (!currentState) {
		const selectedOption = clusterOptions.value[index]?.option_name

		scatterData.value = scatterData.value.map((p) => ({
			...p,
			expression: spatialExpression.value[p.cell_id]?.[selectedOption] ?? 0,
			value: [p.value[0], p.value[1], spatialExpression.value[p.cell_id]?.[selectedOption] ?? 0],
		}))
	} else {
		// If no cluster is active, reset the 3rd dimension (optional)
		scatterData.value = scatterData.value.map((p) => ({
			...p,
			value: [p.value[0], p.value[1], 0],
		}))
	}
}

const getSpatialInfo = async () => {
	umami.track('spatial-image-select', {
		page: route.path,
		image: imageOptions.value.find((d) => d.image === selectedImageOption.value).name,
	})
	getSpatialExpression()
	getImagePosition()
}

const getImagePosition = async () => {
	const SCALE = 0.026486559
	const { getSpatialPosition } = useGeneAPI()
	const query = imageOptions.value
		.filter((d) => d.image == selectedImageOption.value)[0]
		.name.replace(/\s+/g, '')
	try {
		const response = (await getSpatialPosition(query)) || []
		scatterData.value = response.map((p) => ({
			...p,
			expression: 0,
			value: [p.x * SCALE, p.y * SCALE, 0],
		}))
		const selectedIndex = clusterOptions.value.findIndex((opt) => opt.active)

		if (selectedIndex !== -1) {
			FilterCluster(selectedIndex)
		}
	} catch (err) {
		console.error('Error fetching spatial position:', err)
		scatterData.value = []
	}
}

const getSpatialExpression = async () => {
	const { getSpatialExpression } = useGeneAPI()
	const query = imageOptions.value
		.filter((d) => d.image == selectedImageOption.value)[0]
		.name.replace(/\s+/g, '')
	try {
		const response = (await getSpatialExpression(query)) || []
		spatialExpression.value = Object.fromEntries(response.map((d) => [d.cell_id, { ...d }]))
	} catch (err) {
		console.error('Error fetching spatial position:', err)
		scatterData.value = []
	}
}

onMounted(() => {
	nextTick(() => {
		const generalDataStore = useGeneralDataStore()
		generalDataStore.updateNavBarPosition('Spatial Localization')
		tour.value?.startTour()
		console.log('🚀 ~ :253 ~ tour:', tour)
	})
})
</script>

<style></style>
