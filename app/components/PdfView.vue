<template>
    <div>
        <div class="flex flex-row gap-4">
            <div class="flex-1">
                <Panel header="Visualização do PDF">
                    <div class="w-full mb-4">
                        <Paginator :rows="1" :total-records="pdfPages.length" @page="onPageChange"></Paginator>
                    </div>
                    <div class="relative w-full max-w-[800px] mx-auto">
                        <img
                            ref="img"
                            :src="pdfPages[page]"
                            class="w-full h-auto block"
                            @load="setupCanvas"
                        />
                        <canvas
                            ref="canvas"
                            class="absolute top-0 left-0 w-full h-full pointer-events-none"
                        ></canvas>
                    </div>
                </Panel>
            </div>
            <div class="flex-1 flex flex-col gap-4">
                <Panel header="Configurações de Corte">
                    <CutProperties v-model="cut_config" />
                </Panel>
                <Panel header="Preview">
                    <PreviewCut :pdf-pages="pdfPages" :cut-rects="cutRectsDebounced" :loading="cutsLoading" />
                </Panel>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { PageState } from 'primevue';

    import { refDebounced } from '@vueuse/core'
    const CANVAS_RATIO = 0.25

    const props = defineProps<{
        pdfPages: PDFPages;
    }>();

    const { pdfPages } = toRefs(props);

    const page = ref(0);
    const canvas = ref<HTMLCanvasElement | null>(null);
    const canvas_loaded = ref(false);
    const img = ref<HTMLImageElement | null>(null);
    const cut_config = defineModel<CutConfig>({
        default: () => ({...DEFAULT_CUT_CONFIG})
    });
    const cutRects = ref<CutRects>({ images: [], texts: [] });
    const cutRectsDebounced = refDebounced(cutRects, 1000)
    const cutsLoading = computed(() => {
        return cutRects.value !== cutRectsDebounced.value;
    });

    watch(cut_config, (newConfig) => {
        if (newConfig) {
            drawCuts();
        }
    });

    watch (pdfPages, (newPages) => {
        if (newPages.length > 0) {
            page.value = 0; // Reset to first page when new pages are loaded
            canvas_loaded.value = false; // Reset canvas loaded state
        }
    });

    const onPageChange = (event: PageState) => {
        page.value = event.page;
        canvas_loaded.value = false; // Reset canvas loaded state when changing page
    };

    const setupCanvas = () => {
        if (canvas.value === null || img.value === null) {
            return;
        }
        const ctx = canvas.value.getContext('2d');

        if (!ctx) return;

        const width = img.value.naturalWidth;
        const height = img.value.naturalHeight;

        canvas.value.width = width * CANVAS_RATIO;
        canvas.value.height = height * CANVAS_RATIO;

        //canvas.value.style.width = img.value.offsetWidth + 'px';
        //canvas.value.style.height = img.value.offsetHeight + 'px';
        
        canvas_loaded.value = true;
        drawCuts();
    }


    const drawCuts = () => {
        if (canvas.value === null || cut_config.value === null || !canvas_loaded.value) {
            return;
        }
        const ctx = canvas.value.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
        const width = canvas.value.width;
        const height = canvas.value.height;


        const cut_width = cut_config.value.width;
        const cut_height = cut_config.value.height;
        const cut_gap_x = cut_config.value.gapX;
        const cut_gap_y = cut_config.value.gapY;
        
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'red';
        const startX = cut_config.value.startX

        ctx.beginPath();
        ctx.moveTo(width * startX, 0);
        ctx.lineTo(width * startX, height);
        ctx.stroke();

        const startY = cut_config.value.startY;
        ctx.beginPath();
        ctx.moveTo(0, height * startY);
        ctx.lineTo(width, height * startY);
        ctx.stroke();

        ctx.strokeStyle = 'green';
        const endX = cut_config.value.startX + cut_config.value.width;
        ctx.beginPath();
        ctx.moveTo(width * endX, 0);
        ctx.lineTo(width * endX, height);
        ctx.stroke();

        const endY = cut_config.value.startY + cut_config.value.height;
        ctx.beginPath();
        ctx.moveTo(0, height * endY);
        ctx.lineTo(width, height * endY);
        ctx.stroke();

        ctx.strokeStyle = 'blue';

        const nextX = cut_config.value.startX + cut_config.value.width + cut_config.value.gapX;
        ctx.beginPath();
        ctx.moveTo(width * nextX, 0);
        ctx.lineTo(width * nextX, height);
        ctx.stroke();

        const nextY = cut_config.value.startY + cut_config.value.height + cut_config.value.gapY;
        ctx.beginPath();
        ctx.moveTo(0, height * nextY);
        ctx.lineTo(width, height * nextY);
        ctx.stroke();
        
        let x = startX;
        let y = startY;
        let i = 0;

        const text_start = cut_config.value.textStart
        const text_size = cut_config.value.textHeight

        const images_rects: Rect[] = [];
        const text_rects: Rect[] = [];

        while (true) {
            const image_rect: Rect = {
                x: (width * x) / CANVAS_RATIO,
                y: (height * y) / CANVAS_RATIO,
                width: (width * cut_width) / CANVAS_RATIO,
                height: (height * cut_height) / CANVAS_RATIO
            }
            images_rects.push(image_rect);
            ctx.strokeStyle = 'orange';
            ctx.strokeRect(
                image_rect.x * CANVAS_RATIO,
                image_rect.y * CANVAS_RATIO,
                image_rect.width * CANVAS_RATIO,
                image_rect.height * CANVAS_RATIO
            );
            ctx.fillStyle = 'rgba(255, 165, 0, 0.3)';
            ctx.fillRect(
                image_rect.x * CANVAS_RATIO,
                image_rect.y * CANVAS_RATIO,
                image_rect.width * CANVAS_RATIO,
                image_rect.height * CANVAS_RATIO
            );

            const textY = text_start * cut_gap_y
            const textWeight = text_size * cut_gap_y;

            const text_rect: Rect = {
                x: (width * x) / CANVAS_RATIO,
                y: (height * (y + cut_height + textY)) / CANVAS_RATIO,
                width: (width * cut_width) / CANVAS_RATIO,
                height: (height * textWeight) / CANVAS_RATIO
            }
            text_rects.push(text_rect);
            ctx.strokeStyle = 'yellow';
            ctx.strokeRect(
                text_rect.x * CANVAS_RATIO,
                text_rect.y * CANVAS_RATIO,
                text_rect.width * CANVAS_RATIO,
                text_rect.height * CANVAS_RATIO
            );

            x += cut_width + cut_gap_x;
            if (x + cut_width + cut_gap_x > 1) {
                x = startX;
                y += cut_height + cut_gap_y;
            }
            if (y + cut_height + cut_gap_y > 1) {
                break;
            }
            i += 1;
            if (i > 100) {
                console.warn('Loop exceeded 100 iterations, breaking to prevent infinite loop');
                break;
            }
        }
        cutRects.value = { images: images_rects, texts: text_rects };
    }

</script>

<style scoped>

</style>