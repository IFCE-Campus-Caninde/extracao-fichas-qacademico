<template>
    <FileUpload mode="basic" name="pdf" accept="application/pdf" custom-upload :max-file-size="1000000" auto :choose-label="label" @select="onFileSelect" />
</template>

<script setup lang="ts">

import type { FileUploadSelectEvent } from 'primevue';

const label = ref('Carregar PDF');
const emit = defineEmits<{
  loaded: [data: Uint8Array]
}>()

const onFileSelect = (event: FileUploadSelectEvent) => {
    if (!event.files || event.files.length === 0) {
        return;
    }
    
    const file: File = event.files[0]
    label.value = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const pdfData = new Uint8Array(arrayBuffer);
        emit('loaded', pdfData);
    }
    reader.readAsArrayBuffer(file);
};

</script>

<style scoped>

</style>