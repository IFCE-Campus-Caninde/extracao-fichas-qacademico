<template>
    <div class="flex flex-col w-full gap-4">
        <Button v-if="!isLoading" @click="onProcessFiles">Processar</Button>
        <div v-if="isLoading" class="flex flex-col">
            <div class="text-center">{{ progress.message }}</div>
            <ProgressBar :value="(progress.current / progress.total) * 100">{{ ((progress.current / progress.total) * 100).toFixed(2) }}%</ProgressBar>
        </div>
        <Message v-if="errorMessage" severity="error">
            {{ errorMessage }}
        </Message>
        <div v-if="items > 0" class="text-lg text-center">
            Processadas {{ items }} imagens
        </div>
        <a v-if="zipUrl" class="text-lg font-bold text-center underline" :href="zipUrl" :download="fileName">Download ZIP</a>
    </div>
</template>

<script setup lang="ts">
import { Message } from 'primevue';


    const props = defineProps<{
        pdfPages: PDFPages;
        cutRects: CutRects;
        zipName?: string;
    }>();
    const { pdfPages, cutRects, zipName } = toRefs(props);

    const items = ref<number>(0);
    const isLoading = ref<boolean>(false);
    const zipUrl = ref<string | null>(null);
    const errorMessage = ref<string | null>(null);
    const fileName = computed(() => {
        return zipName.value ? `${zipName.value}.zip` : 'imagens.zip';
    });
    const progress = ref<ProgressState>({
        current: 0,
        total: 0,
        message: ''
    });


    const onProcessFiles = async () => {
        // Implement the logic to process files based on pdfPages and cutRects
        items.value = 0;
        zipUrl.value = null;
        errorMessage.value = null;
        isLoading.value = true;
        try {
            const processed = await processPages(pdfPages.value, cutRects.value, progress);
            if (processed) {
                items.value = processed.length;
                if (items.value > 0) {
                    const zipBlob = await createZipFromProcessedImages(processed);
                    zipUrl.value = URL.createObjectURL(zipBlob);
                    errorMessage.value = null;
                } else {
                    throw new Error('Nenhuma imagem válida encontrada');
                }
            } else {
                throw new Error('Erro ao processar as páginas');
            }
        } catch (error) {
            console.error('Erro ao processar arquivos:', error);
            errorMessage.value = error instanceof Error ? error.message : 'Erro desconhecido';
            items.value = 0;
            zipUrl.value = null;
        } finally {
            isLoading.value = false;
        }
    };

</script>

<style scoped>

</style>