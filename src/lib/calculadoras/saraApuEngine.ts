import { z } from 'zod';

/**
 * ============================================================================
 * SARA APU - MOTOR DETERMINISTA CENTRAL DE CÁLCULO DE COSTOS Y PRESUPUESTOS
 * Normativa: Ecuador (Cámara de la Construcción, SERCOP, INEC, MDT)
 * ============================================================================
 */

export type TipoRecursoApu = 'material' | 'mano_de_obra' | 'equipo' | 'transporte' | 'subcontrato' | 'otro';

export interface RecursoApuInput {
  id?: string;
  codigo?: string;
  descripcion: string;
  categoria: TipoRecursoApu;
  unidad: string;
  cantidad: number; // Cantidad por unidad de rubro (o horas-hombre / horas-máquina según rendimiento)
  precioUnitario: number;
  desperdicioPct?: number; // Factor explícito de desperdicio (ej. 6.0 para 6%)
  rendimiento?: number; // Producción o factor de rendimiento aplicable
  fuente?: string;
  vigencia?: string;
  esNacional?: boolean;
}

export interface ComponenteApuCalculado {
  id?: string;
  codigo?: string;
  descripcion: string;
  categoria: TipoRecursoApu;
  unidad: string;
  cantidadBase: number;
  desperdicioPct: number;
  cantidadEfectiva: number;
  precioUnitario: number;
  subtotal: number;
  esNacional: boolean;
}

export interface RubroApuInput {
  id?: string;
  codigoRubro: string;
  descripcion: string;
  unidad: string;
  cantidadObra: number;
  recursos: RecursoApuInput[];
  herramientaMenorPct?: number; // Típicamente 5.0% sobre mano de obra directa en Ecuador
  especificaciones?: string;
  capitulo?: string;
}

export interface RubroApuCalculado {
  id?: string;
  codigoRubro: string;
  descripcion: string;
  unidad: string;
  cantidadObra: number;
  componentes: ComponenteApuCalculado[];
  costoMateriales: number;
  costoManoDeObra: number;
  costoEquiposBase: number;
  costoHerramientaMenor: number;
  costoEquiposTotal: number;
  costoTransporte: number;
  costoSubcontratos: number;
  costoDirectoUnitario: number;
  subtotalCostoDirectoRubro: number; // cantidadObra * costoDirectoUnitario
  herramientaMenorPct: number;
}

export interface IndirectosConfigInput {
  regimen?: 'privado' | 'sercop';
  porcentajeAdministracion?: number; // Gasto general / administración obra y oficina
  porcentajeImprevistos?: number; // Contingencias / imprevistos
  porcentajeUtilidad?: number; // Utilidad técnica
  porcentajeImpuestos?: number; // Impuestos contractuales o específicos aplicables
  tasaIva?: number; // IVA general (ej. 15% en Ecuador) o 0 si cotización antes de IVA
  desglosarIva?: boolean;
  porcentaje_admin?: number;
  porcentaje_imprevistos?: number;
  porcentaje_utilidad?: number;
  tasa_iva?: number;
  ggen?: number;
  pgas1?: number;
  pgas2?: number;
  pgas3?: number;
  pimp?: number;
  util?: number;
  pmaq1?: number;
  capitulos?: string[];
  rubro_capitulo_map?: Record<string, string>;
  linea_base_origen_id?: string;
  version_origen_fecha?: string;
  aprobado_at?: string;
  aprobado_por?: string;
}

export interface PresupuestoTotalesCalculados {
  costoMaterialesTotal: number;
  costoManoDeObraTotal: number;
  costoEquiposTotal: number;
  costoTransporteTotal: number;
  costoSubcontratosTotal: number;
  costoDirectoTotal: number;
  
  // Indirectos
  montoAdministracion: number;
  montoImprevistos: number;
  montoUtilidad: number;
  montoOtrosImpuestos: number;
  totalIndirectosMonto: number;
  factorIndirectosPct: number;
  
  // Subtotal antes de IVA
  subtotalAntesIva: number;
  
  // Impuestos
  tasaIva: number;
  montoIva: number;
  
  // Gran Total
  granTotalPresupuesto: number;

  // Propiedades de retrocompatibilidad unificada
  a: number;
  i: number;
  u: number;
  granTotal: number;
  totalGastosGenerales: number;
  simp: number;
  sutil: number;
  cnet: number;
}

// Redondeo monetario seguro a N decimales para evitar acumulación de punto flotante
export function roundTo(val: number, decimals: number = 2): number {
  if (isNaN(val) || !isFinite(val)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round((val + Number.EPSILON) * factor) / factor;
}

// Matriz de compatibilidad de unidades para evitar operaciones ilógicas (Caso F)
const UNIDADES_LONGITUD = new Set(['m', 'ml', 'cm', 'mm', 'km']);
const UNIDADES_SUPERFICIE = new Set(['m2', 'm²', 'cm2', 'ha']);
const UNIDADES_VOLUMEN = new Set(['m3', 'm³', 'dm3', 'l', 'lt', 'litro', 'gal', 'galon']);
const UNIDADES_MASA = new Set(['kg', 'g', 't', 'ton', 'lb', 'quintal', 'saco']);
const UNIDADES_TIEMPO = new Set(['h', 'hr', 'hora', 'dia', 'jornada', 'mes']);
const UNIDADES_DISCRETAS = new Set(['u', 'unid', 'und', 'pza', 'glb', 'global', '%mo', 'pto']);

export function validarCompatibilidadUnidad(unidadOrigen: string, unidadDestino: string): { compatible: boolean; detalle?: string } {
  const u1 = (unidadOrigen || '').toLowerCase().trim();
  const u2 = (unidadDestino || '').toLowerCase().trim();

  if (u1 === u2) return { compatible: true };
  if (!u1 || !u2) return { compatible: true }; // Si es abierta se permite

  const familia1 = UNIDADES_LONGITUD.has(u1) ? 'LONGITUD'
    : UNIDADES_SUPERFICIE.has(u1) ? 'SUPERFICIE'
    : UNIDADES_VOLUMEN.has(u1) ? 'VOLUMEN'
    : UNIDADES_MASA.has(u1) ? 'MASA'
    : UNIDADES_TIEMPO.has(u1) ? 'TIEMPO'
    : UNIDADES_DISCRETAS.has(u1) ? 'DISCRETA' : 'OTRA';

  const familia2 = UNIDADES_LONGITUD.has(u2) ? 'LONGITUD'
    : UNIDADES_SUPERFICIE.has(u2) ? 'SUPERFICIE'
    : UNIDADES_VOLUMEN.has(u2) ? 'VOLUMEN'
    : UNIDADES_MASA.has(u2) ? 'MASA'
    : UNIDADES_TIEMPO.has(u2) ? 'TIEMPO'
    : UNIDADES_DISCRETAS.has(u2) ? 'DISCRETA' : 'OTRA';

  if (familia1 !== 'OTRA' && familia2 !== 'OTRA' && familia1 !== familia2) {
    return {
      compatible: false,
      detalle: `Incompatibilidad dimensional: no se puede convertir '${u1}' (${familia1}) a '${u2}' (${familia2}) sin una tasa de conversión o densidad explícita.`
    };
  }

  return { compatible: true };
}

/**
 * Motor determinista: Calcula el desglose analítico de un APU unitario
 */
export function calcularRubroApu(input: RubroApuInput): RubroApuCalculado {
  let costoMateriales = 0;
  let costoManoDeObra = 0;
  let costoEquiposBase = 0;
  let costoTransporte = 0;
  let costoSubcontratos = 0;

  const componentesCalculados: ComponenteApuCalculado[] = [];
  const herramPct = input.herramientaMenorPct !== undefined ? input.herramientaMenorPct : 5.0;

  (input.recursos || []).forEach(rec => {
    const cantBase = Number(rec.cantidad) || 0;
    const pu = Number(rec.precioUnitario) || 0;
    const despPct = Number(rec.desperdicioPct) || 0;
    
    // Aplicación estricta de desperdicio: cantidadEfectiva = cantBase * (1 + despPct / 100)
    const cantidadEfectiva = roundTo(cantBase * (1 + despPct / 100), 4);
    const subtotal = roundTo(cantidadEfectiva * pu, 4);

    const comp: ComponenteApuCalculado = {
      id: rec.id,
      codigo: rec.codigo,
      descripcion: rec.descripcion,
      categoria: rec.categoria,
      unidad: rec.unidad,
      cantidadBase: cantBase,
      desperdicioPct: despPct,
      cantidadEfectiva,
      precioUnitario: pu,
      subtotal,
      esNacional: rec.esNacional ?? true,
    };

    componentesCalculados.push(comp);

    switch (rec.categoria) {
      case 'material':
        costoMateriales += subtotal;
        break;
      case 'mano_de_obra':
        costoManoDeObra += subtotal;
        break;
      case 'equipo':
        costoEquiposBase += subtotal;
        break;
      case 'transporte':
        costoTransporte += subtotal;
        break;
      case 'subcontrato':
      case 'otro':
      default:
        costoSubcontratos += subtotal;
        break;
    }
  });

  // Redondeo de subtotales
  costoMateriales = roundTo(costoMateriales, 2);
  costoManoDeObra = roundTo(costoManoDeObra, 2);
  costoEquiposBase = roundTo(costoEquiposBase, 2);
  costoTransporte = roundTo(costoTransporte, 2);
  costoSubcontratos = roundTo(costoSubcontratos, 2);

  // Herramienta Menor (% sobre Mano de Obra según práctica en Ecuador)
  const costoHerramientaMenor = roundTo(costoManoDeObra * (herramPct / 100), 2);
  const costoEquiposTotal = roundTo(costoEquiposBase + costoHerramientaMenor, 2);

  // Costo Directo Unitario
  const costoDirectoUnitario = roundTo(
    costoMateriales + costoManoDeObra + costoEquiposTotal + costoTransporte + costoSubcontratos,
    2
  );

  const cantObra = Number(input.cantidadObra) || 0;
  const subtotalCostoDirectoRubro = roundTo(cantObra * costoDirectoUnitario, 2);

  return {
    id: input.id,
    codigoRubro: input.codigoRubro,
    descripcion: input.descripcion,
    unidad: input.unidad,
    cantidadObra: cantObra,
    componentes: componentesCalculados,
    costoMateriales,
    costoManoDeObra,
    costoEquiposBase,
    costoHerramientaMenor,
    costoEquiposTotal,
    costoTransporte,
    costoSubcontratos,
    costoDirectoUnitario,
    subtotalCostoDirectoRubro,
    herramientaMenorPct: herramPct,
  };
}

/**
 * Motor determinista: Calcula los totales consolidados de un presupuesto
 * con costos directos, indirectos (AIU), utilidad e impuestos
 */
export function calcularPresupuestoConsolidado(
  rubros: RubroApuCalculado[],
  config: IndirectosConfigInput = {}
): PresupuestoTotalesCalculados {
  let costoMaterialesTotal = 0;
  let costoManoDeObraTotal = 0;
  let costoEquiposTotal = 0;
  let costoTransporteTotal = 0;
  let costoSubcontratosTotal = 0;
  let costoDirectoTotal = 0;

  rubros.forEach(r => {
    const q = r.cantidadObra;
    costoMaterialesTotal += r.costoMateriales * q;
    costoManoDeObraTotal += r.costoManoDeObra * q;
    costoEquiposTotal += r.costoEquiposTotal * q;
    costoTransporteTotal += r.costoTransporte * q;
    costoSubcontratosTotal += r.costoSubcontratos * q;
    costoDirectoTotal += r.subtotalCostoDirectoRubro;
  });

  costoMaterialesTotal = roundTo(costoMaterialesTotal, 2);
  costoManoDeObraTotal = roundTo(costoManoDeObraTotal, 2);
  costoEquiposTotal = roundTo(costoEquiposTotal, 2);
  costoTransporteTotal = roundTo(costoTransporteTotal, 2);
  costoSubcontratosTotal = roundTo(costoSubcontratosTotal, 2);
  costoDirectoTotal = roundTo(costoDirectoTotal, 2);

  // Indirectos configurados sobre el costo directo
  const pctAdmin = Number(
    config.porcentajeAdministracion ??
    config.porcentaje_admin ??
    (Number(config.ggen || 0) + Number(config.pgas1 || 0) + Number(config.pgas2 || 0) + Number(config.pgas3 || 0))
  ) || 0;
  const pctImprev = Number(config.porcentajeImprevistos ?? config.porcentaje_imprevistos ?? config.pimp) || 0;
  const pctUtil = Number(config.porcentajeUtilidad ?? config.porcentaje_utilidad ?? config.util) || 0;
  const pctImp = Number(config.porcentajeImpuestos) || 0;

  const montoAdministracion = roundTo(costoDirectoTotal * (pctAdmin / 100), 2);
  const montoImprevistos = roundTo(costoDirectoTotal * (pctImprev / 100), 2);
  const montoUtilidad = roundTo(costoDirectoTotal * (pctUtil / 100), 2);
  const montoOtrosImpuestos = roundTo(costoDirectoTotal * (pctImp / 100), 2);

  const totalIndirectosMonto = roundTo(
    montoAdministracion + montoImprevistos + montoUtilidad + montoOtrosImpuestos,
    2
  );

  const factorIndirectosPct = costoDirectoTotal > 0
    ? roundTo((totalIndirectosMonto / costoDirectoTotal) * 100, 2)
    : 0;

  const subtotalAntesIva = roundTo(costoDirectoTotal + totalIndirectosMonto, 2);

  const tasaIva = config.desglosarIva !== false ? (Number(config.tasaIva ?? config.tasa_iva) || 0) : 0;
  const montoIva = roundTo(subtotalAntesIva * (tasaIva / 100), 2);

  const granTotalPresupuesto = roundTo(subtotalAntesIva + montoIva, 2);

  return {
    costoMaterialesTotal,
    costoManoDeObraTotal,
    costoEquiposTotal,
    costoTransporteTotal,
    costoSubcontratosTotal,
    costoDirectoTotal,
    montoAdministracion,
    montoImprevistos,
    montoUtilidad,
    montoOtrosImpuestos,
    totalIndirectosMonto,
    factorIndirectosPct,
    subtotalAntesIva,
    tasaIva,
    montoIva,
    granTotalPresupuesto,
    // Propiedades de retrocompatibilidad unificada
    a: montoAdministracion,
    i: montoImprevistos,
    u: montoUtilidad,
    granTotal: granTotalPresupuesto,
    totalGastosGenerales: montoAdministracion,
    simp: montoImprevistos,
    sutil: montoUtilidad,
    cnet: subtotalAntesIva,
  };
}

/**
 * ============================================================================
 * CAPÍTULOS Y AGRUPACIÓN DETERMINISTA (NORMA TÉCNICA ECUADOR / SERCOP)
 * ============================================================================
 */

export const DEFAULT_CAPITULOS_ECUADOR: string[] = [
  "1. Obras Preliminares y Desbroce",
  "2. Movimiento de Tierras y Cimentaciones",
  "3. Estructura y Hormigones",
  "4. Mamposterías, Enlucidos y Cubiertas",
  "5. Instalaciones Hidrosanitarias y Eléctricas",
  "6. Acabados, Pintura y Cerrajería",
  "7. Varios y Limpieza Final"
];

export function inferirCapituloRubro(nombreRubro: string, capitulos: string[] = DEFAULT_CAPITULOS_ECUADOR): string {
  const nom = (nombreRubro || '').toLowerCase();
  const c = capitulos && capitulos.length >= 7 ? capitulos : DEFAULT_CAPITULOS_ECUADOR;
  if (nom.includes('preliminar') || nom.includes('desbroce') || nom.includes('cerramiento') || nom.includes('replanteo') || nom.includes('desmonte')) {
    return c[0];
  } else if (nom.includes('tierra') || nom.includes('excavacion') || nom.includes('excavación') || nom.includes('relleno') || nom.includes('desalojo') || nom.includes('cimentacion') || nom.includes('cimentación')) {
    return c[1];
  } else if (nom.includes('hormigon') || nom.includes('hormigón') || nom.includes('zapata') || nom.includes('columna') || nom.includes('viga') || nom.includes('losa') || nom.includes('acero')) {
    return c[2];
  } else if (nom.includes('mampost') || nom.includes('bloque') || nom.includes('ladrillo') || nom.includes('enlucido') || nom.includes('cubierta') || nom.includes('techo')) {
    return c[3];
  } else if (nom.includes('tubo') || nom.includes('tuber') || nom.includes('electr') || nom.includes('hidro') || nom.includes('pvc') || nom.includes('sanitar') || nom.includes('cable') || nom.includes('iluminac')) {
    return c[4];
  } else if (nom.includes('piso') || nom.includes('pintura') || nom.includes('porcelanato') || nom.includes('ceramica') || nom.includes('cerámica') || nom.includes('puerta') || nom.includes('ventana') || nom.includes('vidrio') || nom.includes('cerraj')) {
    return c[5];
  } else {
    return c[6] || c[0];
  }
}

export interface CapituloPresupuestoCalculado {
  capitulo: string;
  rubros: RubroApuCalculado[];
  subtotalCostoDirecto: number;
  porcentajeDelTotal: number;
}

export function normalizarRecursoApu(item: any): RecursoApuInput {
  const insObj = Array.isArray(item.insumo) ? item.insumo[0] : (item.insumo || {});
  const rawTipo = (insObj?.tipo || item.tipo || item.categoria || '').toLowerCase().trim();
  let categoria: TipoRecursoApu = 'otro';
  if (rawTipo === 'material') {
    categoria = 'material';
  } else if (rawTipo === 'mano_de_obra') {
    categoria = 'mano_de_obra';
  } else if (rawTipo === 'equipo' || rawTipo === 'herramienta_menor' || rawTipo === 'herramienta' || rawTipo === 'maquinaria') {
    categoria = 'equipo';
  } else if (rawTipo === 'transporte' || rawTipo === 'flete') {
    categoria = 'transporte';
  } else if (rawTipo === 'subcontrato') {
    categoria = 'subcontrato';
  }

  const cantidad = Number(item.cantidad) || 0;
  const precioUnitario = Number(item.precio_sin_iva_snapshot ?? insObj?.precio_sin_iva ?? item.precioUnitario ?? 0);
  const desperdicioPct = Number(item.desperdicioPct ?? item.desperdicio ?? 0);

  return {
    id: item.id || item.insumo_id,
    codigo: insObj?.codigo || item.codigo,
    descripcion: insObj?.nombre || item.descripcion || item.nombre || 'Insumo',
    categoria,
    unidad: insObj?.unidad || item.unidad || 'und',
    cantidad,
    precioUnitario,
    desperdicioPct,
    rendimiento: Number(item.rendimiento) || 1,
    esNacional: item.es_nacional ?? insObj?.es_nacional ?? true
  };
}

export function calcularRubroApuDesdePresupuestoRubro(
  presRubro: any,
  recipeItems?: any[],
  herramientaMenorPct?: number
): RubroApuCalculado {
  const cantObra = Number(presRubro.cantidad_obra ?? presRubro.cantidad ?? 0);
  const herramPct = herramientaMenorPct ?? Number(presRubro.herramienta_menor_pct ?? 5.0);

  if (recipeItems && recipeItems.length > 0) {
    const recursos: RecursoApuInput[] = recipeItems.map(normalizarRecursoApu);
    return calcularRubroApu({
      id: presRubro.id,
      codigoRubro: presRubro.codigo_rubro || '',
      descripcion: presRubro.nombre_rubro || presRubro.descripcion || 'Rubro',
      unidad: presRubro.unidad || 'u',
      cantidadObra: cantObra,
      recursos,
      herramientaMenorPct: herramPct,
      capitulo: presRubro.capitulo
    });
  }

  const pu = roundTo(Number(presRubro.precio_unitario_snapshot ?? presRubro.precio_unitario ?? 0), 2);
  const subtotal = roundTo(cantObra * pu, 2);

  return {
    id: presRubro.id,
    codigoRubro: presRubro.codigo_rubro || '',
    descripcion: presRubro.nombre_rubro || presRubro.descripcion || 'Rubro',
    unidad: presRubro.unidad || 'u',
    cantidadObra: cantObra,
    componentes: [],
    costoMateriales: pu,
    costoManoDeObra: 0,
    costoEquiposBase: 0,
    costoHerramientaMenor: 0,
    costoEquiposTotal: 0,
    costoTransporte: 0,
    costoSubcontratos: 0,
    costoDirectoUnitario: pu,
    subtotalCostoDirectoRubro: subtotal,
    herramientaMenorPct: herramPct
  };
}

export function agruparPresupuestoPorCapitulos(
  rubrosCalculados: RubroApuCalculado[],
  capitulos: string[] = DEFAULT_CAPITULOS_ECUADOR,
  rubroCapituloMap: Record<string, string> = {}
): CapituloPresupuestoCalculado[] {
  const caps = capitulos && capitulos.length > 0 ? capitulos : DEFAULT_CAPITULOS_ECUADOR;
  const groups: Record<string, RubroApuCalculado[]> = {};
  caps.forEach(c => { groups[c] = []; });

  let totalDirectoPresupuesto = 0;

  rubrosCalculados.forEach(rubro => {
    let capAsignado = (rubro.id && rubroCapituloMap[rubro.id]) || '';
    if (!capAsignado || !groups[capAsignado]) {
      capAsignado = inferirCapituloRubro(rubro.descripcion, caps);
    }
    if (!groups[capAsignado]) {
      groups[capAsignado] = [];
    }
    groups[capAsignado].push(rubro);
    totalDirectoPresupuesto += rubro.subtotalCostoDirectoRubro;
  });

  totalDirectoPresupuesto = roundTo(totalDirectoPresupuesto, 2);

  return caps.map(cap => {
    const list = groups[cap] || [];
    let sub = 0;
    list.forEach(r => { sub += r.subtotalCostoDirectoRubro; });
    sub = roundTo(sub, 2);
    const pct = totalDirectoPresupuesto > 0 ? roundTo((sub / totalDirectoPresupuesto) * 100, 2) : 0;
    return {
      capitulo: cap,
      rubros: list,
      subtotalCostoDirecto: sub,
      porcentajeDelTotal: pct
    };
  });
}
