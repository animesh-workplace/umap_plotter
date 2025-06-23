<template>
	<div class="p-4 grid grid-cols-1 justify-items-center z-50 bg-white">
		<div class="mb-2 text-center">
			<h2 class="text-xl font-semibold mb-1">Spatial Localization</h2>
		</div>
		<div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 min-w-full mt-2">
			<div class="xl:col-start-3 col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2">
				<FloatLabel class="w-full" variant="on">
					<Select
						fluid
						showClear
						size="small"
						optionLabel="name"
						optionValue="image"
						inputId="Image-Select"
						:options="imageOptions"
						v-model="selectedImageOption"
					/>
					<label for="Image-Select" class="flex items-center gap-2">
						<Icon class="w-4 h-4 text-slate-500" name="tabler:photo-square-rounded" /> Select image
					</label>
				</FloatLabel>

				<div>
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

				<GraphSpatialScatter
					:scatterData="scatterData"
					:imageURL="selectedImageOption"
					class="backdrop-blur rounded-lg"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { motion } from 'motion-v'
import { useGeneralDataStore } from '@/stores/generalData'

const selectedImageOption = ref()
const clusterOptions = ref([
	{ name: 'CAF-1', active: false, index: 0 },
	{ name: 'CAF-2', active: false, index: 1 },
	{ name: 'CAF-3', active: false, index: 2 },
	{ name: 'CAF-4', active: false, index: 3 },
	{ name: 'CAF-5', active: false, index: 4 },
	{ name: 'CAF-6', active: false, index: 5 },
	{ name: 'CAF-7', active: false, index: 6 },
	{ name: 'CAF-8', active: false, index: 7 },
	{ name: 'CAF-9', active: false, index: 8 },
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

const scatterData = ref([])

onMounted(() => {
	nextTick(() => {
		const generalDataStore = useGeneralDataStore()
		generalDataStore.updateNavBarPosition('Spatial Localization')
	})
})
</script>

<style></style>
