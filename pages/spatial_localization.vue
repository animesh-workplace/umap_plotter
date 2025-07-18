<template>
	<div class="p-4 grid grid-cols-1 justify-items-center z-50">
		<div class="mb-2 text-center">
			<h2 class="text-xl font-semibold mb-1">Spatial Localization</h2>
		</div>
		<div>
			<FloatLabel class="w-full" variant="on">
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

			<div class="my-2">
				<Carousel :value="clusterOptions" :numVisible="6" :showIndicators="false">
					<template #item="slotProp">
						<motion.div :while-hover="{ scale: 0.95 }" class="my-2 w-24">
							<Tag
								rounded
								class="cursor-pointer"
								:value="slotProp.data.name"
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

			<div class="my-2">
				<div class="flex gap-2 items-center backdrop-blur rounded-lg">
					<SelectButton
						v-model="switchAnnotation"
						:options="['Path Annotation', 'TE Annotation']"
						:pt="{ pcToggleButton: { root: '!bg-gray-200' } }"
					/>
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

const scatterData = ref([])
const spatialExpression = ref([])
const selectedImageOption = ref('')
const switchAnnotation = ref('Path Annotation')
const clusterOptions = ref([
	{ name: 'CAF-1', active: false, option_name: 'caf_1', index: 0 },
	{ name: 'CAF-2', active: false, option_name: 'caf_2', index: 1 },
	{ name: 'CAF-3', active: false, option_name: 'caf_3', index: 2 },
	{ name: 'CAF-4', active: false, option_name: 'caf_4', index: 3 },
	{ name: 'CAF-5', active: false, option_name: 'caf_5', index: 4 },
	{ name: 'CAF-6', active: false, option_name: 'caf_6', index: 5 },
	{ name: 'CAF-7', active: false, option_name: 'caf_7', index: 6 },
	{ name: 'CAF-8', active: false, option_name: 'caf_8', index: 7 },
	{ name: 'CAF-9', active: false, option_name: 'caf_9', index: 8 },
])
const imageOptions = ref([
	{ name: 'Sample 1', image: '/fibrohub/media/s1.webp' },
	{ name: 'Sample 2', image: '/fibrohub/media/s2.webp' },
	{ name: 'Sample 3', image: '/fibrohub/media/s3.webp' },
	{ name: 'Sample 4', image: '/fibrohub/media/s4.webp' },
	{ name: 'Sample 5', image: '/fibrohub/media/s5.webp' },
	{ name: 'Sample 6', image: '/fibrohub/media/s6.webp' },
	{ name: 'Sample 7', image: '/fibrohub/media/s7.webp' },
	{ name: 'Sample 8', image: '/fibrohub/media/s8.webp' },
	{ name: 'Sample 9', image: '/fibrohub/media/s9.webp' },
	{ name: 'Sample 10', image: '/fibrohub/media/s10.webp' },
	{ name: 'Sample 11', image: '/fibrohub/media/s11.webp' },
	{ name: 'Sample 12', image: '/fibrohub/media/s12.webp' },
])

const isClusterFilterActive = computed(() => {
	return clusterOptions.value.some((opt) => opt.active)
})

const FilterCluster = (index) => {
	const currentState = clusterOptions.value[index]?.active

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
	})
})
</script>

<style></style>
