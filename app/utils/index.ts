// Tamanho A4 padrão em pontos
const A4_WIDTH = 595;
const A4_HEIGHT = 842;

export type PDFPages = Uint8Array[];
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?worker&url'

/**
 * Converte um PDF (em buffer) em imagens PNG (Uint8Array), renderizadas com a resolução desejada.
 */
export async function convertPdfToImages(pdfBuffer: Uint8Array, dpi: number = 300): Promise<Uint8Array[]> {
  if (!import.meta.client) {
    return [];
  }

  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

  const images: Uint8Array[] = [];

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
    const blob: Blob = await new Promise(resolve => canvas.toBlob(blob => resolve(blob!), 'image/png')!);
    const arrayBuffer = await blob.arrayBuffer();
    images.push(new Uint8Array(arrayBuffer));
  }

  return images;
}
