/**
 * SERVICIO DE FACTORING DIGITAL Y PRONTO PAGO B2B (SARA-FACTORING-ENGINE)
 * Permite a contratistas de obra civil, proveedores de materiales y transportistas
 * anticipar el cobro de planillas y facturas aprobadas a 30, 45 o 60 días,
 * desembolsando la liquidez en 24 horas vía SPI con tasas reguladas por el BCE.
 */

export interface SolicitudFactoring {
  id: string;
  codigoFactura: string;
  razonSocialEmisor: string;
  rucEmisor: string;
  tipoBeneficiario: 'CONTRATISTA_OBRA' | 'PROVEEDOR_MATERIALES' | 'TRANSPORTISTA_FLETES';
  empresaDeudora: string;
  obraDestino: string;
  montoNominalUSD: number;
  plazoDiasAnticipo: number; // 15, 30, 45, 60 días
  tasaDescuentoMensual: number; // Ej. 1.85% mensual
  descuentoFinancieroUSD: number;
  comisionServicioSaraUSD: number; // 0.5% del monto
  montoNetoDesembolsoUSD: number;
  fechaSolicitud: string;
  fechaEstimadaDesembolso: string;
  estado: 'PENDIENTE_ANALISIS' | 'APROBADA_EN_CUSTODIA' | 'LIQUIDADA_EN_24H' | 'RECHAZADA';
  cuentaBancariaDestino: {
    banco: string;
    tipoCuenta: 'Corriente' | 'Ahorros';
    numeroCuenta: string;
    titular: string;
  };
  observaciones?: string;
}

const STORAGE_KEY_FACTORING = 'sara_factoring_solicitudes_v1';

export const SOLICITUDES_FACTORING_SEMILLA: SolicitudFactoring[] = [
  {
    id: 'FCT-2026-001',
    codigoFactura: 'FAC-001-002-00049281',
    razonSocialEmisor: 'CONSTRUCCIONES & ESTRUCTURAS ANDINAS CÍA. LTDA.',
    rucEmisor: '1792489102001',
    tipoBeneficiario: 'CONTRATISTA_OBRA',
    empresaDeudora: 'GRUPO SARA INMOBILIARIA S.A.',
    obraDestino: 'Torre Residencial Bellavista Norte (Quito)',
    montoNominalUSD: 45000.00,
    plazoDiasAnticipo: 45,
    tasaDescuentoMensual: 1.80,
    descuentoFinancieroUSD: 1215.00,
    comisionServicioSaraUSD: 225.00,
    montoNetoDesembolsoUSD: 43560.00,
    fechaSolicitud: '2026-10-22',
    fechaEstimadaDesembolso: '2026-10-23',
    estado: 'LIQUIDADA_EN_24H',
    cuentaBancariaDestino: {
      banco: 'Banco Pichincha',
      tipoCuenta: 'Corriente',
      numeroCuenta: '210049****',
      titular: 'Construcciones & Estructuras Andinas'
    },
    observaciones: 'Planilla N° 2 de Cimentación y Muros aprobada con fiscalización favorable. Desembolso liquidado con éxito.'
  },
  {
    id: 'FCT-2026-002',
    codigoFactura: 'FAC-004-001-00018392',
    razonSocialEmisor: 'HORMIGONES DEL AUSTRO S.A.',
    rucEmisor: '0190348271001',
    tipoBeneficiario: 'PROVEEDOR_MATERIALES',
    empresaDeudora: 'CONSORCIO VIAL DE LA SIERRA',
    obraDestino: 'Intercambiador Cumbayá - Ruta Viva',
    montoNominalUSD: 28400.00,
    plazoDiasAnticipo: 30,
    tasaDescuentoMensual: 1.75,
    descuentoFinancieroUSD: 497.00,
    comisionServicioSaraUSD: 142.00,
    montoNetoDesembolsoUSD: 27761.00,
    fechaSolicitud: '2026-10-24',
    fechaEstimadaDesembolso: '2026-10-25',
    estado: 'APROBADA_EN_CUSTODIA',
    cuentaBancariaDestino: {
      banco: 'Banco de Guayaquil',
      tipoCuenta: 'Corriente',
      numeroCuenta: '110827****',
      titular: 'Hormigones del Austro S.A.'
    },
    observaciones: 'Recepción en bodega validada con Three-Way Match al 100%. Fondos reservados en Fideicomiso Escrow para dispersión.'
  },
  {
    id: 'FCT-2026-003',
    codigoFactura: 'FAC-002-001-00007812',
    razonSocialEmisor: 'TRANSPORTES PESADOS & VOLQUETAS CHIMBORAZO',
    rucEmisor: '0691728391001',
    tipoBeneficiario: 'TRANSPORTISTA_FLETES',
    empresaDeudora: 'MINERA & CONSTRUCTORA EL PANGUI',
    obraDestino: 'Desalojo de Tierras Proyecto Zamora',
    montoNominalUSD: 9850.00,
    plazoDiasAnticipo: 30,
    tasaDescuentoMensual: 2.00,
    descuentoFinancieroUSD: 197.00,
    comisionServicioSaraUSD: 49.25,
    montoNetoDesembolsoUSD: 9603.75,
    fechaSolicitud: '2026-10-25',
    fechaEstimadaDesembolso: '2026-10-26',
    estado: 'PENDIENTE_ANALISIS',
    cuentaBancariaDestino: {
      banco: 'Banco del Austro',
      tipoCuenta: 'Ahorros',
      numeroCuenta: '040019****',
      titular: 'Manuel Guamán P.'
    },
    observaciones: 'Remitos de entrega verificados con geocerca GPS r <= 50m. Verificando antecedentes SRI.'
  }
];

let memoryStorageFactoring: SolicitudFactoring[] = [...SOLICITUDES_FACTORING_SEMILLA];

export class SaraFactoringService {
  /**
   * Obtiene todas las operaciones de factoring registradas
   */
  static getSolicitudes(): SolicitudFactoring[] {
    if (typeof window === 'undefined') return memoryStorageFactoring;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FACTORING);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error leyendo solicitudes de factoring:', e);
    }
    return memoryStorageFactoring;
  }

  /**
   * Guarda las solicitudes y emite evento reactivo
   */
  static saveSolicitudes(items: SolicitudFactoring[]): void {
    memoryStorageFactoring = items;
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_FACTORING, JSON.stringify(items));
      window.dispatchEvent(new CustomEvent('sara_factoring_updated', { detail: items }));
    } catch (e) {
      console.error('Error guardando factoring:', e);
    }
  }

  /**
   * Calcula la liquidación de pronto pago en función del monto y los días
   */
  static simularFactoring(montoUSD: number, plazoDias: number, tipo: SolicitudFactoring['tipoBeneficiario']): {
    montoNominalUSD: number;
    plazoDias: number;
    tasaMensual: number;
    descuentoFinancieroUSD: number;
    comisionSaraUSD: number;
    montoNetoDesembolsoUSD: number;
    tasaEfectivaAnualizada: number;
  } {
    // Tasa mensual diferenciada por riesgo de contraparte
    let tasaMensual = 1.80; // Contratistas con acta
    if (tipo === 'PROVEEDOR_MATERIALES') tasaMensual = 1.70; // Insumos con Three-Way Match
    if (tipo === 'TRANSPORTISTA_FLETES') tasaMensual = 2.00; // Fletes y logística ligera

    // Descuento financiero simple proporcional a los días: Monto * (tasaMensual/30) * plazoDias
    const factorDias = plazoDias / 30;
    const descuentoFinancieroUSD = +(montoUSD * (tasaMensual / 100) * factorDias).toFixed(2);
    
    // Fee tecnológico de originación de SARA: 0.5% del valor nominal
    const comisionSaraUSD = +(montoUSD * 0.005).toFixed(2);

    const montoNetoDesembolsoUSD = +(montoUSD - descuentoFinancieroUSD - comisionSaraUSD).toFixed(2);
    const tasaEfectivaAnualizada = +(tasaMensual * 12).toFixed(2);

    return {
      montoNominalUSD: montoUSD,
      plazoDias,
      tasaMensual,
      descuentoFinancieroUSD,
      comisionSaraUSD,
      montoNetoDesembolsoUSD,
      tasaEfectivaAnualizada
    };
  }

  /**
   * Registra una nueva solicitud de anticipo de liquidez en 24h
   */
  static solicitarFactoring(solicitud: Omit<SolicitudFactoring, 'id' | 'fechaSolicitud' | 'fechaEstimadaDesembolso' | 'estado'>): SolicitudFactoring {
    const solicitudes = this.getSolicitudes();
    const id = `FCT-${new Date().getFullYear()}-${String(solicitudes.length + 1).padStart(3, '0')}`;
    const hoy = new Date().toISOString().split('T')[0];
    
    // Desembolso prometido al siguiente día hábil
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const fechaDesembolso = manana.toISOString().split('T')[0];

    const nueva: SolicitudFactoring = {
      ...solicitud,
      id,
      fechaSolicitud: hoy,
      fechaEstimadaDesembolso: fechaDesembolso,
      estado: 'PENDIENTE_ANALISIS'
    };

    const actualizadas = [nueva, ...solicitudes];
    this.saveSolicitudes(actualizadas);
    return nueva;
  }

  /**
   * Cambia el estado de una operación de factoring (Aprobar, Liquidar, Rechazar)
   */
  static actualizarEstado(id: string, nuevoEstado: SolicitudFactoring['estado'], observaciones?: string): SolicitudFactoring | null {
    const solicitudes = [...this.getSolicitudes()];
    const idx = solicitudes.findIndex(s => s.id === id);
    if (idx === -1) return null;

    solicitudes[idx] = {
      ...solicitudes[idx],
      estado: nuevoEstado,
      observaciones: observaciones || solicitudes[idx].observaciones
    };

    this.saveSolicitudes(solicitudes);
    return solicitudes[idx];
  }

  /**
   * Métricas y KPIs de la cartera de factoring
   */
  static getMetricasCartera(): {
    volumenTotalFinanciadoUSD: number;
    liquidezDesembolsadaUSD: number;
    gananciaTotalSaraUSD: number;
    operacionesActivas: number;
    diasAhorroPromedio: number;
  } {
    const solicitudes = this.getSolicitudes();
    const liquidadas = solicitudes.filter(s => s.estado === 'LIQUIDADA_EN_24H' || s.estado === 'APROBADA_EN_CUSTODIA');
    
    const volumenTotal = liquidadas.reduce((acc, s) => acc + s.montoNominalUSD, 0);
    const desembolsado = liquidadas.reduce((acc, s) => acc + s.montoNetoDesembolsoUSD, 0);
    const comisiones = liquidadas.reduce((acc, s) => acc + s.comisionServicioSaraUSD + (s.descuentoFinancieroUSD * 0.4), 0); // 40% del spread financiero para SARA

    return {
      volumenTotalFinanciadoUSD: +volumenTotal.toFixed(2),
      liquidezDesembolsadaUSD: +desembolsado.toFixed(2),
      gananciaTotalSaraUSD: +comisiones.toFixed(2),
      operacionesActivas: solicitudes.filter(s => s.estado === 'PENDIENTE_ANALISIS' || s.estado === 'APROBADA_EN_CUSTODIA').length,
      diasAhorroPromedio: 38
    };
  }
}
