/**
 * Configuración Universal de Planes y Tarifas de Facturación Electrónica SRI - GRUPO SARA
 * Sincronizado entre Administración (/admin/facturacion/planes) y Portales de Clientes (/modulos/facturacion)
 */

export interface PlanFacturacion {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo_plan: 'tiempo' | 'bolsa' | 'suscripcion';
  precio_usd: number;
  duracion_dias: number; // 0 = sin vencimiento / según bolsa
  limite_documentos: number; // 0 = ilimitado
  beneficios: string[];
  es_destacado: boolean;
  activo: boolean;
  badge: string;
  periodo_texto?: string; // ej. '24 horas', '7 días', 'mes', 'año', 'saldo prepago'
}

export interface PlanContratadoInfo {
  id: string;
  codigo: string;
  nombre: string;
  tipo_plan: 'tiempo' | 'bolsa' | 'suscripcion';
  precio_usd: number;
  creditosRestantes: number;
  creditosTotales: number;
  limite_documentos: number;
  fechaActivacion: string; // ISO
  fechaExpiracion: string | null; // ISO o null para sin caducidad
  duracion_dias: number;
  activo: boolean;
}

export const PLANES_FACTURACION_DEFAULT: PlanFacturacion[] = [
  {
    id: 'plan-1',
    codigo: 'PLAN_DIARIO_24H',
    nombre: 'Plan Diario 24h',
    descripcion: 'Emisión ilimitada durante 24 horas continuas para liquidar trabajos y planillas urgentes.',
    tipo_plan: 'tiempo',
    precio_usd: 1.50,
    duracion_dias: 1,
    limite_documentos: 0,
    periodo_texto: 'por 24 horas',
    beneficios: [
      'Facturas y retenciones ilimitadas por 24 horas',
      'Cálculo dual IVA 15% y 5% materiales de construcción',
      'RIDE en PDF oficial y XML firmado XAdES-BES',
      'Transmisión en tiempo real al Web Service SRI',
      'Envío por correo electrónico automático al cliente'
    ],
    es_destacado: false,
    activo: true,
    badge: 'On-Demand (24h)'
  },
  {
    id: 'plan-2',
    codigo: 'PLAN_SEMANAL_7D',
    nombre: 'Plan Semanal (7 Días)',
    descripcion: 'Facturación ilimitada durante 7 días continuos para consultores, fiscalizadores e inspectores de obra.',
    tipo_plan: 'tiempo',
    precio_usd: 4.50,
    duracion_dias: 7,
    limite_documentos: 0,
    periodo_texto: 'por 7 días',
    beneficios: [
      '7 Días de facturación electrónica ilimitada',
      'Facturas, retenciones y guías de remisión',
      'Catálogo rápido de clientes guardados con autocompletado',
      'Descarga masiva de XMLs autorizados y RIDE PDF',
      'Soporte prioritario para cierres de planilla'
    ],
    es_destacado: false,
    activo: true,
    badge: 'Sprint 7 Días'
  },
  {
    id: 'plan-3',
    codigo: 'BOLSA_15_DOCS',
    nombre: 'Bolsa Micro (15 Docs)',
    descripcion: '15 comprobantes electrónicos que se consumen solo al emitir. Saldo prepago que NUNCA caduca.',
    tipo_plan: 'bolsa',
    precio_usd: 3.99,
    duracion_dias: 0,
    limite_documentos: 15,
    periodo_texto: 'saldo prepago',
    beneficios: [
      '15 Comprobantes que NUNCA caducan',
      'Portal de consulta rápida RIDE para tus clientes',
      'Tarifas IVA duales: 0%, 5% construcción y 15% general',
      'Reenvío directo por WhatsApp y correo electrónico',
      'Cero costos de mantenimiento o mensualidades'
    ],
    es_destacado: true,
    activo: true,
    badge: '⭐ Sin Caducidad'
  },
  {
    id: 'plan-4',
    codigo: 'BOLSA_60_DOCS',
    nombre: 'Bolsa Estándar (60 Docs)',
    descripcion: 'Saldo de 60 comprobantes prepago para contratistas, transportistas de carga pesada y ferreterías.',
    tipo_plan: 'bolsa',
    precio_usd: 11.99,
    duracion_dias: 0,
    limite_documentos: 60,
    periodo_texto: 'saldo prepago',
    beneficios: [
      '60 Comprobantes prepago sin fecha de vencimiento',
      'Acceso móvil PWA Offline-First para emisión en obra',
      'Reportes de ventas para declaración mensual SRI Form. 104',
      'Autocompletado instantáneo por RUC y Razón Social',
      'Soporte técnico VIP vía WhatsApp'
    ],
    es_destacado: false,
    activo: true,
    badge: 'Prepago Regular'
  },
  {
    id: 'plan-5',
    codigo: 'MENSUAL_PRO',
    nombre: 'Plan Mensual Pro Ilimitado',
    descripcion: 'Facturación ilimitada mensual, buzón de gastos deducibles y proyección automática de IVA.',
    tipo_plan: 'suscripcion',
    precio_usd: 7.99,
    duracion_dias: 30,
    limite_documentos: 0,
    periodo_texto: '/ mes',
    beneficios: [
      'Facturas, retenciones y notas de crédito ILIMITADAS',
      'Buzón de compras electrónicas y gastos deducibles',
      'Proyección automática Formulario 104 SRI en tiempo real',
      'API REST para conexión con ERP o sistema contable',
      'Exportación a Excel de ventas y retenciones recibidas'
    ],
    es_destacado: false,
    activo: true,
    badge: 'Suscripción Mensual'
  },
  {
    id: 'plan-6',
    codigo: 'COMBO_ANUAL_VIP',
    nombre: 'Combo Anual VIP + Firma Gratis',
    descripcion: '1 año de facturación ilimitada con emisión de Firma Electrónica .p12 (1 año) incluida sin costo extra.',
    tipo_plan: 'suscripcion',
    precio_usd: 59.99,
    duracion_dias: 365,
    limite_documentos: 0,
    periodo_texto: '/ año',
    beneficios: [
      '365 Días de facturación electrónica ilimitada',
      'Firma Electrónica .p12 de 1 año INCLUIDA (Ahorro $18)',
      'Bóveda de llaves criptográficas cifrada AES-256',
      'Módulo de retenciones automáticas (Cód. 312, 344 y 303)',
      'Acompañamiento tributario y fiscal prioritario 24/7'
    ],
    es_destacado: true,
    activo: true,
    badge: '🏆 Mejor Ahorro (-40%)'
  }
];

export const STORAGE_KEY_PLANES_ADMIN = 'sara_admin_planes_facturacion';
export const STORAGE_KEY_PLAN_CONTRATADO = 'sara_facturacion_plan_contratado';

/**
 * Obtiene los planes configurados por el administrador en localStorage, con fallback a los predeterminados
 */
export function getPlanesFacturacionConfigurados(): PlanFacturacion[] {
  if (typeof window === 'undefined') return PLANES_FACTURACION_DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLANES_ADMIN);
    if (!raw) return PLANES_FACTURACION_DEFAULT;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.warn('Error leyendo planes de facturación guardados:', e);
  }
  return PLANES_FACTURACION_DEFAULT;
}

/**
 * Guarda o actualiza los planes configurados
 */
export function setPlanesFacturacionConfigurados(planes: PlanFacturacion[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PLANES_ADMIN, JSON.stringify(planes));
  } catch (e) {
    console.warn('Error persistiendo planes de facturación:', e);
  }
}

/**
 * Calcula con precisión el estado y lo que le falta por culminar al plan activo del usuario:
 * - Para bolsas: documentos restantes y porcentaje.
 * - Para tiempo/suscripción: días, meses o años restantes con texto claro y amigable.
 */
export function calcularDetalleCulminacionPlan(plan: PlanContratadoInfo | null | undefined): {
  esBolsa: boolean;
  esIlimitado: boolean;
  porcentajeRestante: number;
  textoCulminacion: string;
  detalleSecundario: string;
  badgeEstado: string;
  estaVencido: boolean;
} {
  if (!plan) {
    return {
      esBolsa: true,
      esIlimitado: false,
      porcentajeRestante: 100,
      textoCulminacion: '15 documentos restantes',
      detalleSecundario: 'Bolsa prepago sin caducidad',
      badgeEstado: 'Activo',
      estaVencido: false
    };
  }

  // 1. Caso Bolsa de Documentos
  if (plan.tipo_plan === 'bolsa' || (!plan.fechaExpiracion && plan.limite_documentos > 0)) {
    const restantes = Math.max(0, plan.creditosRestantes ?? 0);
    const totales = Math.max(1, plan.creditosTotales || plan.limite_documentos || 15);
    const pct = Math.min(100, Math.max(0, (restantes / totales) * 100));

    return {
      esBolsa: true,
      esIlimitado: false,
      porcentajeRestante: pct,
      textoCulminacion: `${restantes} doc${restantes === 1 ? '' : 's'} restante${restantes === 1 ? '' : 's'}`,
      detalleSecundario: `Te faltan por emitir: ${restantes} de ${totales} comprobantes`,
      badgeEstado: restantes > 0 ? 'Sin Caducidad' : 'Agotado',
      estaVencido: restantes <= 0
    };
  }

  // 2. Caso Tiempo o Suscripción
  const fechaFin = plan.fechaExpiracion ? new Date(plan.fechaExpiracion).getTime() : 0;
  const fechaInicio = plan.fechaActivacion ? new Date(plan.fechaActivacion).getTime() : (fechaFin - (plan.duracion_dias || 30) * 86400000);
  const ahora = Date.now();
  const msRestantes = fechaFin - ahora;

  if (msRestantes <= 0) {
    return {
      esBolsa: false,
      esIlimitado: true,
      porcentajeRestante: 0,
      textoCulminacion: 'Plan culminado',
      detalleSecundario: 'Venció el ' + (plan.fechaExpiracion ? new Date(plan.fechaExpiracion).toLocaleDateString('es-EC') : 'recientemente'),
      badgeEstado: 'Expirado',
      estaVencido: true
    };
  }

  const duracionTotalMs = Math.max(1, fechaFin - fechaInicio);
  const pct = Math.min(100, Math.max(0, (msRestantes / duracionTotalMs) * 100));

  const horasTotales = Math.floor(msRestantes / (1000 * 60 * 60));
  const diasTotales = Math.floor(msRestantes / (1000 * 60 * 60 * 24));

  let texto = '';
  if (diasTotales > 365) {
    const anios = Math.floor(diasTotales / 365);
    const meses = Math.floor((diasTotales % 365) / 30);
    texto = `${anios} año${anios === 1 ? '' : 's'} y ${meses} mes${meses === 1 ? '' : 'es'} restantes`;
  } else if (diasTotales >= 30) {
    const meses = Math.floor(diasTotales / 30);
    const dias = diasTotales % 30;
    texto = dias > 0 
      ? `${meses} mes${meses === 1 ? '' : 'es'} y ${dias} día${dias === 1 ? '' : 's'} restantes`
      : `${meses} mes${meses === 1 ? '' : 'es'} restante${meses === 1 ? '' : 's'}`;
  } else if (diasTotales >= 2) {
    texto = `${diasTotales} días restantes`;
  } else if (horasTotales > 0) {
    texto = `${horasTotales} hora${horasTotales === 1 ? '' : 's'} restante${horasTotales === 1 ? '' : 's'}`;
  } else {
    const minutos = Math.max(1, Math.floor(msRestantes / (1000 * 60)));
    texto = `${minutos} minuto${minutos === 1 ? '' : 's'} restante${minutos === 1 ? '' : 's'}`;
  }

  const fechaFormat = new Date(fechaFin).toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return {
    esBolsa: false,
    esIlimitado: true,
    porcentajeRestante: pct,
    textoCulminacion: texto,
    detalleSecundario: `Culmina el: ${fechaFormat} (Ilimitado)`,
    badgeEstado: 'Activo',
    estaVencido: false
  };
}
