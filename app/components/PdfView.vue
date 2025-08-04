<template>
    <div>
        Páginas: {{ pdfPages.length }}
        <div class="flex flex-row gap-4">
            <div class="flex-1">
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
            </div>
            <div class="flex-1">
                <CutProperties v-model="cut_config" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    const CANVAS_RATIO = 0.25

    const { pdfPages} = defineProps<{
        pdfPages: PDFPages;
    }>();

    const page = ref(0);
    const canvas = ref<HTMLCanvasElement | null>(null);
    const canvas_loaded = ref(false);
    const img = ref<HTMLImageElement | null>(null);
    const cut_config = defineModel<CutConfig>({
        default: () => ({...DEFAULT_CUT_CONFIG})
    });

    watch(cut_config, (newConfig) => {
        if (newConfig) {
            drawCuts();
        }
    });

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

        while (true) {
            ctx.strokeStyle = 'orange';
            ctx.strokeRect(
                width * x,
                height * y,
                width * cut_width,
                height * cut_height
            );
            ctx.fillStyle = 'rgba(255, 165, 0, 0.3)';
            ctx.fillRect(
                width * x,
                height * y,
                width * cut_width,
                height * cut_height
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
            if (i > 1000) {
                console.warn('Loop exceeded 1000 iterations, breaking to prevent infinite loop');
                break;
            }
        }
    }
</script>

<style scoped>

</style>