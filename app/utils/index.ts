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
  const pdfjsLib = await import(pdfjsSrc);
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

export async function OCRImage(imageData: string): Promise<string> {
  if (!import.meta.client) {
    return '';
  }

  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker();
  const { data: { text } } = await worker.recognize(imageData);
  await worker.terminate();
  
  return text;
}
