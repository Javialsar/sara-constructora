import { SaraEventBus } from '../agents/event-bus';
import { SaraAgentEvent } from '../agents/types';

/**
 * SERVICIO DE APRENDIZAJE COLECTIVO CONTINUO & BASE DE CONOCIMIENTO VECTORIAL
 * Alimenta la inteligencia adaptativa de GRUPO SARA cuando se detectan mutaciones de precios
 * en comprobantes del SRI, orquestando la actualización en cadena de APU, Compras y Proyecciones Contables.
 */

export interface VectorKnowledgeItem {
  id?: string;
  domain: 'material_prices' | 'freight_rates' | 'productivity_yields' | 'supplier_discounts';
  itemKey: string;
  contentSummary: string;
  currentPrice: number;
  previousPrice: number;
  variancePct: number;
  sampleSize: number;
  confidenceLevel: number;
  affectedProjects: string[];
  metadata?: Record<string, any>;
  updatedAt?: string;
}

export interface CollectiveLearningCascadeResult {
  itemKey: string;
  precioAnterior: number;
  precioNuevo: number;
  varianzaPct: number;
  alertaVolatilidad: boolean;
  cascadaAcciones: {
    apuAjuste: {
      rubrosAfectados: string[];
      incrementoCostoDirectoUnitarioUSD: number;
      nuevasRecetasActualizadas: number;
    };
    comprasOptimizacion: {
      proformaPredictivaRegenerada: boolean;
      sugerenciaConsolidacionVolumen: string;
      nuevoUmbralEscalaRequerido: number;
    };
    contableRecalculoMargenes: {
      proyectosRecalculados: Array<{
        proyectoId: string;
        proyectoNombre: string;
        margenPrevioPct: number;
        margenProyectadoNuevoPct: number;
        impactoMargenUSD: number;
      }>;
      impactoNetoHoldingUSD: number;
    };
  };
}

export class VectorKnowledgeService {
  // Base de conocimiento semántica en memoria con persistencia simulada/reactiva
  private static knowledgeStore: Map<string, VectorKnowledgeItem> = new Map([
    [
      'cemento_holcim_fuerte_50kg',
      {
        domain: 'material_prices',
        itemKey: 'cemento_holcim_fuerte_50kg',
        contentSummary: 'Cemento Portland Tipo GU 50kg Holcim Fuerte planta Guayaquil/Latacunga',
        currentPrice: 7.45,
        previousPrice: 7.20,
        variancePct: 3.47,
        sampleSize: 48,
        confidenceLevel: 0.98,
        affectedProjects: ['proj-cariamanga-01', 'proj-loja-02', 'proj-cuenca-03'],
        updatedAt: new Date().toISOString(),
      },
    ],
    [
      'acero_adelca_corrugado_12mm',
      {
        domain: 'material_prices',
        itemKey: 'acero_adelca_corrugado_12mm',
        contentSummary: 'Varilla corrugada de acero estructural 12mm x 12m Adelca norma INEN 2167',
        currentPrice: 1.18, // USD / kg
        previousPrice: 1.12,
        variancePct: 5.36,
        sampleSize: 35,
        confidenceLevel: 0.95,
        affectedProjects: ['proj-cariamanga-01', 'proj-cuenca-03'],
        updatedAt: new Date().toISOString(),
      },
    ],
    [
      'hormigon_premezclado_210',
      {
        domain: 'material_prices',
        itemKey: 'hormigon_premezclado_210',
        contentSummary: 'Hormigón premezclado f\'c=210 kg/cm2 slump 10cm puesto en obra con mixer',
        currentPrice: 94.50, // USD / m3
        previousPrice: 91.00,
        variancePct: 3.85,
        sampleSize: 22,
        confidenceLevel: 0.94,
        affectedProjects: ['proj-loja-02', 'proj-cuenca-03'],
        updatedAt: new Date().toISOString(),
      },
    ],
  ]);

  /**
   * Obtiene todos los conocimientos vectoriales
   */
  public static getAllKnowledge(): VectorKnowledgeItem[] {
    return Array.from(this.knowledgeStore.values());
  }

  /**
   * Obtiene un registro por clave
   */
  public static getKnowledge(itemKey: string): VectorKnowledgeItem | undefined {
    return this.knowledgeStore.get(itemKey);
  }

  /**
   * Procesa la mutación de precio detectada en una factura del SRI y desencadena
   * el flujo de aprendizaje colectivo multi-agente
   */
  public static async registerPriceMutationFromSri(
    itemKey: string,
    nuevoPrecioUnitario: number,
    origenSriFactura: { numeroComprobante: string; rucEmisor: string; razonSocial: string }
  ): Promise<CollectiveLearningCascadeResult> {
    const existing = this.knowledgeStore.get(itemKey) || {
      domain: 'material_prices',
      itemKey,
      contentSummary: `Insumo detectado en factura SRI de ${origenSriFactura.razonSocial}`,
      currentPrice: nuevoPrecioUnitario,
      previousPrice: nuevoPrecioUnitario,
      variancePct: 0,
      sampleSize: 0,
      confidenceLevel: 0.85,
      affectedProjects: ['proj-cariamanga-01', 'proj-loja-02'],
      updatedAt: new Date().toISOString(),
    };

    const precioAnterior = existing.currentPrice;
    const varianzaPct = precioAnterior > 0
      ? +( ((nuevoPrecioUnitario - precioAnterior) / precioAnterior) * 100 ).toFixed(2)
      : 0;

    const updatedItem: VectorKnowledgeItem = {
      ...existing,
      previousPrice: precioAnterior,
      currentPrice: nuevoPrecioUnitario,
      variancePct: varianzaPct,
      sampleSize: existing.sampleSize + 1,
      confidenceLevel: Math.min(0.99, existing.confidenceLevel + 0.01),
      updatedAt: new Date().toISOString(),
      metadata: {
        ultimaFactura: origenSriFactura.numeroComprobante,
        proveedor: origenSriFactura.razonSocial,
      },
    };

    this.knowledgeStore.set(itemKey, updatedItem);

    // 1. CASCADA AGENTE APU: Ajuste de presupuestos futuros
    const deltaUnitario = +(nuevoPrecioUnitario - precioAnterior).toFixed(4);
    const apuAjuste = {
      rubrosAfectados: [
        `RUB-HORM-${itemKey.slice(0, 6).toUpperCase()}`,
        'RUB-ESTRUCTURA-LOSA',
        'RUB-CIMENTACION-ZAPATAS',
      ],
      incrementoCostoDirectoUnitarioUSD: deltaUnitario,
      nuevasRecetasActualizadas: 3,
    };

    // 2. CASCADA AGENTE COMPRAS: Optimización de proformas predictivas
    const comprasOptimizacion = {
      proformaPredictivaRegenerada: true,
      sugerenciaConsolidacionVolumen: varianzaPct > 3.0
        ? 'ALERTA DE ALZA: Se recomienda consolidar pedidos con obras de Loja y Azuay para negociar escala de descuento del 8% y mitigar el incremento.'
        : 'Variación de precio dentro del rango de inflación proyectada. Mantener proforma estándar.',
      nuevoUmbralEscalaRequerido: varianzaPct > 3.0 ? 1000 : 500,
    };

    // 3. CASCADA AGENTE CONTABLE: Recálculo de márgenes de ganancia de obras activas
    const proyectosMock = [
      { id: 'proj-cariamanga-01', nombre: 'Edificio Residencial Cariamanga Plaza', consumoEstimado: 850, margenPrevio: 22.5 },
      { id: 'proj-loja-02', nombre: 'Urbanización Mirador del Valle - Loja', consumoEstimado: 1400, margenPrevio: 24.0 },
      { id: 'proj-cuenca-03', nombre: 'Torre Corporativa Yanuncay - Cuenca', consumoEstimado: 2100, margenPrevio: 21.8 },
    ];

    let impactoNetoHolding = 0;
    const proyectosRecalculados = proyectosMock.map(p => {
      const impactoUSD = +(p.consumoEstimado * deltaUnitario).toFixed(2);
      impactoNetoHolding += impactoUSD;
      // Cada $1000 de incremento reduce el margen en aprox 0.25%
      const impactoPct = +( (impactoUSD / (p.consumoEstimado * nuevoPrecioUnitario * 5)) * 100 ).toFixed(2);
      const margenNuevo = +(p.margenPrevio - impactoPct).toFixed(2);

      return {
        proyectoId: p.id,
        proyectoNombre: p.nombre,
        margenPrevioPct: p.margenPrevio,
        margenProyectadoNuevoPct: Math.max(margenNuevo, 10.0),
        impactoMargenUSD: impactoUSD,
      };
    });

    // 4. Emitir evento en el Bus de Agentes
    try {
      await SaraEventBus.publish(
        'CICLO_APRENDIZAJE_FINALIZADO',
        'SARA-CONSTRUCTORA',
        ['SARA-APU', 'SARA-MARKETPLACE', 'SARA-PAGOS'],
        {
          itemKey,
          precioAnterior,
          precioNuevo: nuevoPrecioUnitario,
          varianzaPct,
          apuAjuste,
          comprasOptimizacion,
          proyectosAfectadosCount: proyectosRecalculados.length,
        },
        `cor-knowledge-${Date.now()}`
      );
    } catch (e) {
      console.warn('[VectorKnowledgeService] EventBus emit notice:', e);
    }

    return {
      itemKey,
      precioAnterior,
      precioNuevo: nuevoPrecioUnitario,
      varianzaPct,
      alertaVolatilidad: Math.abs(varianzaPct) >= 3.0,
      cascadaAcciones: {
        apuAjuste,
        comprasOptimizacion,
        contableRecalculoMargenes: {
          proyectosRecalculados,
          impactoNetoHoldingUSD: +impactoNetoHolding.toFixed(2),
        },
      },
    };
  }
}
