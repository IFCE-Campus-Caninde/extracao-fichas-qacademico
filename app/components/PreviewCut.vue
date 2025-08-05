<template>
    <div>
        <div v-if="isLoading" class="flex justify-center items-center h-64">
            <ProgressSpinner />
        </div>
        <div v-else class="w-full mb-4">
            <Paginator :rows="1" :total-records="totalItems" @page="onItemChange"></Paginator>
            <div v-if="croppedItem" class="flex flex-col items-center gap-4">
                <img :src="croppedItem.image" alt="Cropped Image" />
                <img :src="croppedItem.textImage" alt="Cropped Text Image" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { PageState } from 'primevue';

    const props = defineProps<{
        pdfPages: PDFPages;
        cutRects: CutRects;
        loading?: boolean;
    }>();
    const { pdfPages, cutRects, loading } = toRefs(props);
    const totalItems = computed(() => {
        if (pdfPages.value && pdfPages.value.length > 0 && cutRects.value && cutRects.value.images.length > 0) {
            return pdfPages.value.length * cutRects.value.images.length;
        }
        return 0;
    });
    const item = ref(0);

    const onItemChange = (event: PageState) => {
        item.value = event.page;
    };

    const isLoading = computed(() => {
        return loading.value || cutRects.value.images.length === 0;
    });

    type CroppedItem = {
        image: string;
        textImage: string;
    }
    const croppedItem = ref<CroppedItem | null>(null);
    watch([item, cutRects, pdfPages], async ([newItem, newCutRects, newPdfPages]) => {
        if (newPdfPages && newCutRects.images.length > 0 && import.meta.client) {
            const pageIndex = Math.floor(newItem / newCutRects.images.length);
            const rectIndex = newItem % newCutRects.images.length;
            const rect = newCutRects.images[rectIndex] as Rect;
            const pdfPage = newPdfPages[pageIndex] as string;
            const textRect = newCutRects.texts[rectIndex] as Rect;

            // Assuming you have a function to crop the image based on the rect
            const rects = await getRectsFromImage(pdfPage, [rect, textRect]);
            const [image, textImage] = rects.map((value) => {
                return URL.createObjectURL(value);
            })
            croppedItem.value = {
                image: image as string,
                textImage: textImage as string
            };
        } else {
            croppedItem.value = null;
        }
    });

</script>

<style scoped>

</style>