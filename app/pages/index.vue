<template>
    <div class="container mx-auto px-2 sm:px-4 py-6 flex flex-col gap-4 w-full items-center">
        <div>
            <LoadPDF @loaded="onPdfLoad"/>
        </div>
        <div v-if="pdf_data && !pdf_pages" class="flex justify-center items-center h-64">
            <ProgressSpinner/>
        </div>
        <div v-else-if="pdf_pages" class="w-full">
            <ClientOnly>
            <PdfView :pdf-pages="pdf_pages"/>
            </ClientOnly>
        </div>
    </div>
</template>

<script setup lang="ts">

const pdf_data = ref<Uint8Array | null>(null);
const pdf_pages = ref<PDFPages | null>(null);
const dpi = ref(300)

watch([pdf_data, dpi], async ([data, dpi]) => {
    if (data && data.length > 0) {
        pdf_pages.value = null; // Reset pages before loading new ones
        pdf_pages.value = await convertPdfToImages(data, dpi);
    } else {
        pdf_pages.value = null;
    }
});

const onPdfLoad = async (data: Uint8Array) => {
    if (!data || data.length === 0) {
        return null;
    }
    pdf_data.value = data;
};

</script>

<style scoped>

</style>