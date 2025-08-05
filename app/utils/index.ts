// Tamanho A4 padrão em pontos
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?worker&url'
import pdfjsSrc from 'pdfjs-dist/build/pdf.min.mjs?url'
//const A4_WIDTH = 595;
//const A4_HEIGHT = 842;

export type PDFPages = string[];

/**
 * Converte um PDF (em buffer) em imagens PNG (Uint8Array), renderizadas com a resolução desejada.
 */
export async function convertPdfToImages(pdfBuffer: Uint8Array, dpi: number = 300): Promise<PDFPages> {
  if (!import.meta.client) {
    return [];
  }

  /* @vite-ignore */
  const pdfjsLib = await import(pdfjsSrc /* @vite-ignore */);
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

  const images: PDFPages = [];

  // Calcula o fator de escala baseado no DPI desejado (PDF padrão é 72 DPI)
  const scale = dpi / 72;

  // Carrega o PDF
  const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    // Cria o canvas para renderizar a página
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d')!;

    await page.render({ canvasContext: context, viewport, canvas }).promise;

    // Converte canvas para blob e depois para Uint8Array
    const dataURL: string = canvas.toDataURL('image/png');
    images.push(dataURL);
    // Por fim, libera o canvas
    canvas.remove();
  }

  return images;
}

export async function getRectsFromImage(imageData: string, rects: Rect[], out_mime_type: string = 'image/jpeg'): Promise<Blob[]> {
  if (!import.meta.client) {
    return [];
  }
  const output: Blob[] = []
  // cria um ImageBitmap a partir do blob, já carregando em memória
  const image = new Image()
  image.src = imageData
  await image.decode()
  let offscreen: OffscreenCanvas | null = null
  let ctx: OffscreenCanvasRenderingContext2D | null = null
  // cria um canvas (pode ser OffscreenCanvas em Web Worker)
  for (const rect of rects) {
    if (!offscreen || offscreen.width !== rect.width || offscreen.height !== rect.height) {
      offscreen = new OffscreenCanvas(rect.width, rect.height)
      ctx = offscreen.getContext('2d')!
    }
    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }
    // desenha apenas a região desejada no canvas
    ctx.drawImage(
      image,
      rect.x, rect.y, rect.width, rect.height, // fonte
      0, 0, rect.width, rect.height            // destino
    )
    const blob = await offscreen.convertToBlob({ type: out_mime_type })
    output.push(blob)
    
  }

  return output
}

export async function OCRImage(imageData: string|Blob): Promise<string> {
  if (!import.meta.client) {
    return '';
  }

  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker();
  const { data: { text } } = await worker.recognize(imageData);
  await worker.terminate();
  
  return text;
}

export function isValidNumber(text: string): boolean {
  const number = parseInt(text, 10);
  return !isNaN(number) && number > 1000; // Exemplo de validação: número deve ser maior que 1000
}

export type ProcessedImage = {
  data: Blob;
  name: string;
}

export type ProgressState = {
  current: number;
  total: number;
  message: string;
}

export async function processPages(pages: PDFPages, cutRects: CutRects, progress_state?: Ref<ProgressState>): Promise<ProcessedImage[]> {
  if (!import.meta.client) {
    return [];
  }
  const processedImages: ProcessedImage[] = [];
  if (progress_state) {
    progress_state.value = {
      current: 0,
      total: pages.length * cutRects.images.length,
      message: 'Iniciando processamento...'
    }
  }
  for (let i = 0; i < pages.length; i++) {
    if (progress_state) {
      progress_state.value = {
        current: i * cutRects.images.length,
        total: pages.length * cutRects.images.length,
        message: `Processando página ${i + 1} de ${pages.length}`
      }
    }
    const page = pages[i]!;
    const all_cropped = await getRectsFromImage(page, [...cutRects.images, ...cutRects.texts], 'image/jpeg');
    const images = all_cropped.slice(0, cutRects.images.length);
    const texts = all_cropped.slice(cutRects.images.length);
    for (let j = 0; j < images.length; j++) {
      if (progress_state) {
        progress_state.value = {
          current: i * cutRects.images.length + j,
          total: pages.length * cutRects.images.length,
          message: `Processando imagem ${j + 1} de ${images.length} na página ${i + 1}`
        }
      }
      const image = images[j]!;
      const textImage = texts[j]!;
      const ocrText = await OCRImage(textImage);
      if (isValidNumber(ocrText)) {
        processedImages.push({
          data: image,
          name: Number.parseInt(ocrText) + '.jpg'
        });
      } 
    }
  }
  return processedImages;
}

export async function createZipFromProcessedImages(processedImages: ProcessedImage[]): Promise<Blob> {
  if (!import.meta.client) {
    return new Blob();
  }
  return createZip(processedImages);
}

export async function createZip(files: { name: string; data: Blob }[]): Promise<Blob> {
  if (!import.meta.client) {
    return Promise.resolve(new Blob());
  }

  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();

  files.forEach(file => {
    zip.file(file.name, file.data);
  });

  return zip.generateAsync({ type: 'blob' });
}