/**
 * SARA Take-Off - Motor de Renderizado de Planos en PDF
 * Convierte planos PDF vectoriales de Revit/AutoCAD/Archicad en imágenes nítidas de alta resolución para el lienzo de medición.
 */

export interface RenderedPdfPage {
  dataUrl: string
  width: number
  height: number
  pageNumber: number
  totalPages: number
  aspectRatio: number
}

let cachedPdfDoc: any = null
let currentPdfData: ArrayBuffer | null = null

/**
 * Carga la librería PDF.js de forma dinámica en el cliente
 */
async function getPdfJsLibrary() {
  if (typeof window === 'undefined') return null

  // Si ya está en window
  if ((window as any).pdfjsLib) {
    return (window as any).pdfjsLib
  }

  try {
    // Import dinámico de pdfjs-dist
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf')
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
    ;(window as any).pdfjsLib = pdfjs
    return pdfjs
  } catch (err) {
    console.warn("Fallo import dinámico de pdfjs-dist, cargando vía CDN fallback:", err)
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      script.onload = () => {
        const lib = (window as any).pdfjsLib
        if (lib) {
          lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
          resolve(lib)
        } else {
          reject(new Error("No se pudo inicializar pdfjsLib"))
        }
      }
      script.onerror = () => reject(new Error("No se pudo cargar el script de PDF.js desde CDN"))
      document.head.appendChild(script)
    })
  }
}

/**
 * Carga un documento PDF desde un File o ArrayBuffer
 */
export async function loadPdfDocument(fileOrBuffer: File | ArrayBuffer): Promise<{ totalPages: number }> {
  const pdfjs = await getPdfJsLibrary()
  if (!pdfjs) throw new Error("No se pudo cargar el motor PDF")

  let buffer: ArrayBuffer
  if (fileOrBuffer instanceof File) {
    buffer = await fileOrBuffer.arrayBuffer()
  } else {
    buffer = fileOrBuffer
  }

  currentPdfData = buffer
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
    cMapPacked: true
  })

  cachedPdfDoc = await loadingTask.promise
  return {
    totalPages: cachedPdfDoc.numPages
  }
}

/**
 * Renderiza una página específica del PDF en alta resolución
 * @param pageNumber Número de página (1-based)
 * @param renderScale Escala de renderizado (2.0 = 200% para máxima nitidez de cotas)
 */
export async function renderPdfPageToDataUrl(
  pageNumber: number = 1,
  renderScale: number = 2.0
): Promise<RenderedPdfPage> {
  if (!cachedPdfDoc) {
    throw new Error("No hay ningún documento PDF cargado")
  }

  const safePageNum = Math.max(1, Math.min(pageNumber, cachedPdfDoc.numPages))
  const page = await cachedPdfDoc.getPage(safePageNum)

  // Obtener viewport a escala óptima para planos arquitectónicos
  const viewport = page.getViewport({ scale: renderScale })

  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)

  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) throw new Error("No se pudo obtener el contexto 2D del canvas")

  // Fondo blanco para planos de arquitectura
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const renderContext = {
    canvasContext: ctx,
    viewport: viewport
  }

  await page.render(renderContext).promise

  const dataUrl = canvas.toDataURL('image/png', 0.95)
  const aspectRatio = viewport.width / viewport.height

  return {
    dataUrl,
    width: canvas.width,
    height: canvas.height,
    pageNumber: safePageNum,
    totalPages: cachedPdfDoc.numPages,
    aspectRatio
  }
}
