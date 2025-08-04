<template>
    <div>
        <LoadPDF @loaded="onPdfLoad"/>
    </div>
</template>

<script setup lang="ts">

const pdf_pages = ref<PDFPages | null>(null);
const dpi = ref(300)

const onPdfLoad = async (data: Uint8Array) => {
    if (!data || data.length === 0) {
        return null;
    }
    const result = await convertPdfToImages(data, dpi.value);
    console.log("PDF Pages loaded:", result.length);
    pdf_pages.value = result;
};

</script>

<style scoped>

</style>