<template>
    <div class="container mx-auto px-2 sm:px-4 py-6 flex flex-col gap-4 w-full items-center">
        <Panel toggleable collapsed header="Instruções">
            <ol class="list-decimal list-inside flex flex-col gap-2">
                <li>Carregue o PDF com a ficha de fotos.</li>
                <li>Use os sliders da configuração de corte e mantenha o quadro laranja sobre todas as fotos.</li>
                <li>Use os últimos 2 sliders para ajustar a área de legenda para que o quadro amarelo esteja sobre todas as legendas.</li>
                <li>Use o painel de preview para ver como vai ficar a foto e a leitura da legenda abaixo.</li>
                <li>Se estiver satisfeito, clique em "Processar" e depois baixe o arquivo zip contendo todas as fotos nomeadas.</li>
            </ol>
        </Panel>
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