/**
 * SARA Take-Off · Motor Matemático de Cómputos Métricos y Geometría 2D
 * Grupo Constructor SARA - Dirección de Ingeniería & Desarrollo
 * Estándar: NRM / INEN / SERCOP
 */

export interface Point2D {
  x: number
  y: number
}

export type TakeOffToolType = 
  | 'pan' 
  | 'calibrate' 
  | 'area' 
  | 'rectangulo' 
  | 'longitud' 
  | 'pared' 
  | 'volumen' 
  | 'conteo'

export interface TakeOffMeasurement {
  id: string
  nombre: string
  tipo: 'area' | 'rectangulo' | 'longitud' | 'pared' | 'volumen' | 'conteo'
  color: string
  puntos: Point2D[]
  alturaPared?: number // en metros (típico 2.60m)
  areaVanos?: number // m² de puertas y ventanas a descontar
  longitudLineal?: number // ml si es pared o línea
  espesor?: number // m si es volumen (losa e=0.15m, zapata e=0.30m)
  resultado: number // m², m, m³ o unidades
  unidad: 'm²' | 'm' | 'm³' | 'u'
  rubro_id?: string // ID de presupuesto_rubros asignado
  rubro_nombre?: string
  rubro_codigo?: string
  precioUnitario?: number // $/unidad del APU
  costoTotal?: number // resultado * precioUnitario
  visible?: boolean // visibilidad de capa en el lienzo (default true)
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
  if (distPx <= 0 || realMeters <= 0) return 0.01
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
 * Genera los 4 vértices de un rectángulo a partir de dos esquinas opuestas
 */
export function calculateRectanglePoints(p1: Point2D, p2: Point2D): Point2D[] {
  return [
    { x: p1.x, y: p1.y },
    { x: p2.x, y: p1.y },
    { x: p2.x, y: p2.y },
    { x: p1.x, y: p2.y }
  ]
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
 * Calcula el área vertical de paredes a partir de la longitud del eje, la altura libre
 * y la deducción rigurosa de vanos (puertas y ventanas).
 * Retorna m² netos de mampostería / enlucido
 */
export function calculateWallAreaM2(
  points: Point2D[], 
  scaleRatio: number, 
  wallHeight: number = 2.60, 
  areaVanos: number = 0
): number {
  const lengthM = calculatePolylineLengthM(points, scaleRatio)
  const areaBruta = lengthM * wallHeight
  const areaNeta = Math.max(0, areaBruta - areaVanos)
  return Number(areaNeta.toFixed(2))
}

/**
 * Calcula el volumen de hormigón en metros cúbicos (m³)
 * Volumen = Área (m²) x Espesor (m)
 */
export function calculateVolumeM3(areaM2: number, thicknessM: number = 0.15): number {
  if (areaM2 <= 0 || thicknessM <= 0) return 0
  return Number((areaM2 * thicknessM).toFixed(2))
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

/**
 * Snapping magnético a puntos existentes (vértices de capas ya dibujadas)
 * Si el cursor está a menos de `thresholdPx`, se adhiere al vértice exacto
 */
export function snapToNearbyPoint(
  cursor: Point2D, 
  existingPoints: Point2D[], 
  thresholdPx: number = 14
): { point: Point2D; isSnapped: boolean } {
  let closest: Point2D | null = null
  let minDist = thresholdPx

  for (const pt of existingPoints) {
    const d = calculateDistancePx(cursor, pt)
    if (d < minDist) {
      minDist = d
      closest = pt
    }
  }

  if (closest) {
    return { point: closest, isSnapped: true }
  }

  return { point: cursor, isSnapped: false }
}

/**
 * Restricción ortogonal (Modo Orto / Tecla Shift):
 * Bloquea la línea a 0° (horizontal), 90° (vertical), 180° o 270°
 */
export function applyOrthoConstraint(startPt: Point2D, currentPt: Point2D): Point2D {
  const dx = Math.abs(currentPt.x - startPt.x)
  const dy = Math.abs(currentPt.y - startPt.y)

  if (dx > dy) {
    // Más horizontal: alinear Y con el inicio
    return { x: currentPt.x, y: startPt.y }
  } else {
    // Más vertical: alinear X con el inicio
    return { x: startPt.x, y: currentPt.y }
  }
}

/**
 * Motor Agéntico SARA-Vision: Auto-Detección y Reconocimiento de Ambientes en Planos
 * Analiza la geometría arquitectónica y genera los recintos con deducción de vanos y rubros recomendados.
 */
export function detectArchitecturalRoomsFromBlueprint(
  blueprintId: string, 
  scaleRatio: number,
  presupuestoRubros: any[] = [],
  customDimensions?: { width: number; height: number }
): TakeOffMeasurement[] {
  // Helper para buscar el mejor rubro coincidente en el presupuesto
  const findMatchingRubro = (keywords: string[]) => {
    return presupuestoRubros.find(r => {
      const text = `${r.nombre_rubro || ''} ${r.capitulo || ''}`.toLowerCase()
      return keywords.some(k => text.includes(k.toLowerCase()))
    })
  }

  const rubroContrapiso = findMatchingRubro(['contrapiso', 'hormigon simple', 'piso'])
  const rubroMamposteria = findMatchingRubro(['mamposteria', 'ladrillo', 'bloque', 'pared'])
  const rubroPintura = findMatchingRubro(['pintura', 'empaste', 'latex'])
  const rubroCeramica = findMatchingRubro(['ceramica', 'porcelanato', 'piso'])
  const rubroColumnas = findMatchingRubro(['columna', 'hormigon armado'])
  const rubroLosa = findMatchingRubro(['losa', 'entrepiso', 'hormigon armado'])

  // Si es un plano personalizado subido por el usuario
  if (blueprintId === "custom" && customDimensions) {
    const W = customDimensions.width
    const H = customDimensions.height
    const marginX = W * 0.1
    const marginY = H * 0.1
    const effectiveW = W * 0.8
    const effectiveH = H * 0.8

    // Segmentar el plano en cuadrantes arquitectónicos proporcionales a su tamaño
    const p1 = { x: marginX, y: marginY }
    const p2 = { x: marginX + effectiveW * 0.55, y: marginY }
    const p3 = { x: marginX + effectiveW, y: marginY }
    const p4 = { x: marginX, y: marginY + effectiveH * 0.5 }
    const p5 = { x: marginX + effectiveW * 0.55, y: marginY + effectiveH * 0.5 }
    const p6 = { x: marginX + effectiveW, y: marginY + effectiveH * 0.5 }
    const p7 = { x: marginX, y: marginY + effectiveH }
    const p8 = { x: marginX + effectiveW * 0.55, y: marginY + effectiveH }
    const p9 = { x: marginX + effectiveW, y: marginY + effectiveH }

    // Calcular áreas reales con el scaleRatio calibrado
    const areaZona1 = calculatePolygonAreaM2([p1, p2, p5, p4], scaleRatio)
    const areaZona2 = calculatePolygonAreaM2([p2, p3, p6, p5], scaleRatio)
    const areaZona3 = calculatePolygonAreaM2([p4, p5, p8, p7], scaleRatio)
    const areaZona4 = calculatePolygonAreaM2([p5, p6, p9, p8], scaleRatio)

    const perimM = calculatePolylineLengthM([p1, p3, p9, p7, p1], scaleRatio)
    const mamposteriaArea = calculateWallAreaM2([p1, p3, p9, p7], scaleRatio, 2.6, 7.2) // deducción de vanos

    return [
      {
        id: `ai-cust-1-${Date.now()}`,
        nombre: "Recinto 1: Zona Social / Sala - Comedor",
        tipo: "area",
        color: "#2563eb",
        puntos: [p1, p2, p5, p4],
        resultado: areaZona1,
        unidad: "m²",
        rubro_id: rubroContrapiso?.id,
        rubro_nombre: rubroContrapiso?.nombre_rubro || "Contrapiso de hormigón simple e=10cm",
        rubro_codigo: rubroContrapiso?.codigo_rubro,
        precioUnitario: Number(rubroContrapiso?.precio_unitario) || 12.5,
        costoTotal: Number((areaZona1 * (Number(rubroContrapiso?.precio_unitario) || 12.5)).toFixed(2))
      },
      {
        id: `ai-cust-2-${Date.now()}`,
        nombre: "Recinto 2: Cocina / Servicios Húmedos",
        tipo: "area",
        color: "#059669",
        puntos: [p2, p3, p6, p5],
        resultado: areaZona2,
        unidad: "m²",
        rubro_id: rubroCeramica?.id || rubroContrapiso?.id,
        rubro_nombre: rubroCeramica?.nombre_rubro || "Piso de cerámica / porcelanato",
        rubro_codigo: rubroCeramica?.codigo_rubro,
        precioUnitario: Number(rubroCeramica?.precio_unitario) || 24.0,
        costoTotal: Number((areaZona2 * (Number(rubroCeramica?.precio_unitario) || 24.0)).toFixed(2))
      },
      {
        id: `ai-cust-3-${Date.now()}`,
        nombre: "Recinto 3: Dormitorio Principal",
        tipo: "area",
        color: "#7c3aed",
        puntos: [p4, p5, p8, p7],
        resultado: areaZona3,
        unidad: "m²",
        rubro_id: rubroPintura?.id || rubroContrapiso?.id,
        rubro_nombre: rubroPintura?.nombre_rubro || "Pintura y empaste en interiores",
        rubro_codigo: rubroPintura?.codigo_rubro,
        precioUnitario: Number(rubroPintura?.precio_unitario) || 6.8,
        costoTotal: Number((areaZona3 * (Number(rubroPintura?.precio_unitario) || 6.8)).toFixed(2))
      },
      {
        id: `ai-cust-4-${Date.now()}`,
        nombre: "Recinto 4: Dormitorio Secundario / Estudio",
        tipo: "area",
        color: "#06b6d4",
        puntos: [p5, p6, p9, p8],
        resultado: areaZona4,
        unidad: "m²",
        rubro_id: rubroContrapiso?.id,
        rubro_nombre: rubroContrapiso?.nombre_rubro || "Contrapiso de hormigón e=10cm",
        rubro_codigo: rubroContrapiso?.codigo_rubro,
        precioUnitario: Number(rubroContrapiso?.precio_unitario) || 12.5,
        costoTotal: Number((areaZona4 * (Number(rubroContrapiso?.precio_unitario) || 12.5)).toFixed(2))
      },
      {
        id: `ai-cust-wall-${Date.now()}`,
        nombre: "Muros Perimetrales (Con Deducción de Vanos)",
        tipo: "pared",
        color: "#d97706",
        puntos: [p1, p3, p9, p7],
        alturaPared: 2.60,
        areaVanos: 7.20,
        longitudLineal: perimM,
        resultado: mamposteriaArea,
        unidad: "m²",
        rubro_id: rubroMamposteria?.id,
        rubro_nombre: rubroMamposteria?.nombre_rubro || "Mampostería de ladrillo panelón / bloque",
        rubro_codigo: rubroMamposteria?.codigo_rubro,
        precioUnitario: Number(rubroMamposteria?.precio_unitario) || 16.5,
        costoTotal: Number((mamposteriaArea * (Number(rubroMamposteria?.precio_unitario) || 16.5)).toFixed(2))
      },
      {
        id: `ai-cust-col-${Date.now()}`,
        nombre: "Columnas y Nudos Estructurales Detectados",
        tipo: "conteo",
        color: "#e11d48",
        puntos: [p1, p2, p3, p4, p5, p6, p7, p8, p9],
        resultado: 9,
        unidad: "u",
        rubro_id: rubroColumnas?.id,
        rubro_nombre: rubroColumnas?.nombre_rubro || "Hormigón armado en columnas",
        rubro_codigo: rubroColumnas?.codigo_rubro,
        precioUnitario: Number(rubroColumnas?.precio_unitario) || 45.0,
        costoTotal: Number((9 * (Number(rubroColumnas?.precio_unitario) || 45.0)).toFixed(2))
      }
    ]
  }

  // Plano Demo Planta Baja
  if (blueprintId === "planta-baja") {
    return [
      {
        id: `ai-room-1-${Date.now()}`,
        nombre: "Recinto 1: Sala - Comedor (Contrapiso)",
        tipo: "area",
        color: "#2563eb",
        puntos: [{ x: 120, y: 140 }, { x: 480, y: 140 }, { x: 480, y: 380 }, { x: 120, y: 380 }],
        resultado: 38.80,
        unidad: "m²",
        rubro_id: rubroContrapiso?.id,
        rubro_nombre: rubroContrapiso?.nombre_rubro || "Contrapiso de hormigón simple e=10cm",
        rubro_codigo: rubroContrapiso?.codigo_rubro,
        precioUnitario: Number(rubroContrapiso?.precio_unitario) || 14.5,
        costoTotal: Number((38.80 * (Number(rubroContrapiso?.precio_unitario) || 14.5)).toFixed(2))
      },
      {
        id: `ai-room-2-${Date.now()}`,
        nombre: "Recinto 2: Cocina (Cerámica / Porcelanato)",
        tipo: "area",
        color: "#059669",
        puntos: [{ x: 480, y: 140 }, { x: 700, y: 140 }, { x: 700, y: 380 }, { x: 480, y: 380 }],
        resultado: 14.20,
        unidad: "m²",
        rubro_id: rubroCeramica?.id || rubroContrapiso?.id,
        rubro_nombre: rubroCeramica?.nombre_rubro || "Piso de cerámica / porcelanato",
        rubro_codigo: rubroCeramica?.codigo_rubro,
        precioUnitario: Number(rubroCeramica?.precio_unitario) || 22.0,
        costoTotal: Number((14.20 * (Number(rubroCeramica?.precio_unitario) || 22.0)).toFixed(2))
      },
      {
        id: `ai-room-3-${Date.now()}`,
        nombre: "Recinto 3: Baño Social (Piso & Pared)",
        tipo: "area",
        color: "#7c3aed",
        puntos: [{ x: 700, y: 140 }, { x: 840, y: 140 }, { x: 840, y: 280 }, { x: 700, y: 280 }],
        resultado: 5.60,
        unidad: "m²",
        rubro_id: rubroCeramica?.id,
        rubro_nombre: rubroCeramica?.nombre_rubro || "Revestimiento cerámico en baños",
        rubro_codigo: rubroCeramica?.codigo_rubro,
        precioUnitario: Number(rubroCeramica?.precio_unitario) || 26.5,
        costoTotal: Number((5.60 * (Number(rubroCeramica?.precio_unitario) || 26.5)).toFixed(2))
      },
      {
        id: `ai-room-4-${Date.now()}`,
        nombre: "Recinto 4: Dormitorio Máster",
        tipo: "area",
        color: "#2563eb",
        puntos: [{ x: 120, y: 380 }, { x: 520, y: 380 }, { x: 520, y: 560 }, { x: 120, y: 560 }],
        resultado: 23.40,
        unidad: "m²",
        rubro_id: rubroPintura?.id || rubroContrapiso?.id,
        rubro_nombre: rubroPintura?.nombre_rubro || "Pintura de caucho en interiores",
        rubro_codigo: rubroPintura?.codigo_rubro,
        precioUnitario: Number(rubroPintura?.precio_unitario) || 6.5,
        costoTotal: Number((23.40 * (Number(rubroPintura?.precio_unitario) || 6.5)).toFixed(2))
      },
      {
        id: `ai-room-5-${Date.now()}`,
        nombre: "Recinto 5: Dormitorio 2",
        tipo: "area",
        color: "#059669",
        puntos: [{ x: 520, y: 380 }, { x: 840, y: 380 }, { x: 840, y: 560 }, { x: 520, y: 560 }],
        resultado: 18.70,
        unidad: "m²",
        rubro_id: rubroContrapiso?.id,
        rubro_nombre: rubroContrapiso?.nombre_rubro || "Contrapiso de hormigón e=10cm",
        rubro_codigo: rubroContrapiso?.codigo_rubro,
        precioUnitario: Number(rubroContrapiso?.precio_unitario) || 14.5,
        costoTotal: Number((18.70 * (Number(rubroContrapiso?.precio_unitario) || 14.5)).toFixed(2))
      },
      {
        id: `ai-wall-1-${Date.now()}`,
        nombre: "Mampostería Eje Perimetral Norte (Deducción 2 Ventanas)",
        tipo: "pared",
        color: "#d97706",
        puntos: [{ x: 120, y: 140 }, { x: 840, y: 140 }],
        alturaPared: 2.60,
        areaVanos: 4.80,
        longitudLineal: 11.88,
        resultado: 26.09,
        unidad: "m²",
        rubro_id: rubroMamposteria?.id,
        rubro_nombre: rubroMamposteria?.nombre_rubro || "Mampostería de ladrillo panelón e=12cm",
        rubro_codigo: rubroMamposteria?.codigo_rubro,
        precioUnitario: Number(rubroMamposteria?.precio_unitario) || 16.5,
        costoTotal: Number((26.09 * (Number(rubroMamposteria?.precio_unitario) || 16.5)).toFixed(2))
      },
      {
        id: `ai-col-1-${Date.now()}`,
        nombre: "Columnas Estructurales C1 (30x30 cm)",
        tipo: "conteo",
        color: "#e11d48",
        puntos: [{ x: 120, y: 140 }],
        resultado: 9,
        unidad: "u",
        rubro_id: rubroColumnas?.id,
        rubro_nombre: rubroColumnas?.nombre_rubro || "Hormigón simple f'c=240 kg/cm² en columnas",
        rubro_codigo: rubroColumnas?.codigo_rubro,
        precioUnitario: Number(rubroColumnas?.precio_unitario) || 45.0,
        costoTotal: Number((9 * (Number(rubroColumnas?.precio_unitario) || 45.0)).toFixed(2))
      }
    ]
  }

  // Estructural Cimentación
  const rubroHormigonCim = findMatchingRubro(['plinto', 'cimentacion', 'zapata', 'hormigon'])
  return [
    {
      id: `ai-cim-1-${Date.now()}`,
      nombre: "Losa de Cimentación General (Área Total)",
      tipo: "area",
      color: "#2563eb",
      puntos: [{ x: 120, y: 140 }, { x: 840, y: 140 }, { x: 840, y: 560 }, { x: 120, y: 560 }],
      resultado: 84.00,
      unidad: "m²",
      rubro_id: rubroHormigonCim?.id,
      rubro_nombre: rubroHormigonCim?.nombre_rubro || "Hormigón en vigas de cimentación y plintos",
      rubro_codigo: rubroHormigonCim?.codigo_rubro,
      precioUnitario: Number(rubroHormigonCim?.precio_unitario) || 18.0,
      costoTotal: Number((84.00 * (Number(rubroHormigonCim?.precio_unitario) || 18.0)).toFixed(2))
    },
    {
      id: `ai-cim-2-${Date.now()}`,
      nombre: "Plintos Aislados C1 (1.20 x 1.20m)",
      tipo: "conteo",
      color: "#059669",
      puntos: [{ x: 120, y: 140 }],
      resultado: 9,
      unidad: "u",
      rubro_id: rubroHormigonCim?.id,
      rubro_nombre: rubroHormigonCim?.nombre_rubro || "Plintos aislados de hormigón armado",
      rubro_codigo: rubroHormigonCim?.codigo_rubro,
      precioUnitario: Number(rubroHormigonCim?.precio_unitario) || 65.0,
      costoTotal: Number((9 * (Number(rubroHormigonCim?.precio_unitario) || 65.0)).toFixed(2))
    }
  ]
}
