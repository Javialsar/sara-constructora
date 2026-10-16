/**
 * SARA Take-Off · Motor Matemático de Cómputos Métricos y Geometría 2D
 * Grupo Constructor SARA - Dirección de Ingeniería & Desarrollo
 */

export interface Point2D {
  x: number
  y: number
}

export interface TakeOffMeasurement {
  id: string
  nombre: string
  tipo: 'area' | 'longitud' | 'pared' | 'conteo'
  color: string
  puntos: Point2D[]
  alturaPared?: number // en metros (típico 2.60m)
  resultado: number // m², m o unidades
  unidad: 'm²' | 'm' | 'u'
  rubro_id?: string // ID de presupuesto_rubros asignado
  rubro_nombre?: string
  rubro_codigo?: string
}

/**
 * Calcula la distancia euclidiana entre dos puntos en píxeles
 */
export function calculateDistancePx(p1: Point2D, p2: Point2D): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Calcula la relación de escala (metros por píxel) basada en dos puntos y una cota real conocida
 */
export function calculateScaleRatio(p1: Point2D, p2: Point2D, realMeters: number): number {
  const distPx = calculateDistancePx(p1, p2)
  if (distPx <= 0 || realMeters <= 0) return 0.01 // Fallback estándar
  return realMeters / distPx
}

/**
 * Calcula el área de un polígono cerrado usando la Fórmula de Gauss (Shoelace Formula)
 * Retorna el área en metros cuadrados (m²)
 */
export function calculatePolygonAreaM2(points: Point2D[], scaleRatio: number): number {
  const n = points.length
  if (n < 3) return 0

  let sum = 0
  for (let i = 0; i < n; i++) {
    const current = points[i]
    const next = points[(i + 1) % n]
    sum += current.x * next.y - next.x * current.y
  }

  const areaPx2 = Math.abs(sum) / 2
  const areaM2 = areaPx2 * (scaleRatio * scaleRatio)
  return Number(areaM2.toFixed(2))
}

/**
 * Calcula la longitud total de una polilínea en metros lineales (m)
 */
export function calculatePolylineLengthM(points: Point2D[], scaleRatio: number): number {
  if (points.length < 2) return 0

  let totalDistPx = 0
  for (let i = 0; i < points.length - 1; i++) {
    totalDistPx += calculateDistancePx(points[i], points[i + 1])
  }

  const lengthM = totalDistPx * scaleRatio
  return Number(lengthM.toFixed(2))
}

/**
 * Calcula el área vertical de paredes a partir de la longitud del eje y la altura libre
 * Retorna m² de mampostería / enlucido
 */
export function calculateWallAreaM2(points: Point2D[], scaleRatio: number, wallHeight: number = 2.60): number {
  const lengthM = calculatePolylineLengthM(points, scaleRatio)
  const wallArea = lengthM * wallHeight
  return Number(wallArea.toFixed(2))
}

/**
 * Centroide de un conjunto de puntos para colocar la etiqueta numérica en el plano
 */
export function getPolygonCentroid(points: Point2D[]): Point2D {
  if (points.length === 0) return { x: 0, y: 0 }
  if (points.length === 1) return points[0]

  let sumX = 0
  let sumY = 0
  points.forEach(p => {
    sumX += p.x
    sumY += p.y
  })
  return {
    x: sumX / points.length,
    y: sumY / points.length
  }
}
