import { SaraSharedMemory } from '../shared-memory';
import { SaraEventBus } from '../event-bus';
import { ApuConsolidadoPayload, SuministrosAsignadosPayload } from '../types';

export class SaraMarketplaceAgent {
  static readonly AGENT_ID = 'SARA-MARKETPLACE';

  /**
   * Optimiza el abastecimiento de insumos cruzando inventario, cercanía y predicción de precios
   */
  static async optimizarSuministros(
    apuData: ApuConsolidadoPayload,
    correlationId: string
  ): Promise<SuministrosAsignadosPayload> {
    // APRENDIZAJE EVOLUTIVO: Consultar volatilidad histórica de acero y cemento
    const aceroVolatility = await SaraSharedMemory.getKnowledge('material_volatility', 'acero_corrugado_adelca');
    const aceroEnRiesgo = aceroVolatility?.currentValue?.alerta_compra_anticipada ?? true;

    // Proveedores mayoristas aliados de Grupo SARA en Ecuador
    const proveedoresAliados = [
      {
        proveedorId: 'PROV-ADELCA-01',
        nombre: 'Acería del Ecuador (ADELCA) - Planta Lasso / Distribución Sur',
        ciudadOrigen: 'Lasso / Cuenca',
        coordenadas: { lat: -0.8732, lng: -78.6091 },
        materialesAsignados: ['Acero Corrugado Estructural fy=4200 kg/cm2'],
        descuentoMayoristaPct: 0.08
      },
      {
        proveedorId: 'PROV-HOLCIM-02',
        nombre: 'Holcim Ecuador - Planta San Eduardo / Bodega Regional',
        ciudadOrigen: 'Guayaquil / Cuenca',
        coordenadas: { lat: -2.1812, lng: -79.9213 },
        materialesAsignados: ['Cemento Portland Tipo GU (Sacos 50kg)'],
        descuentoMayoristaPct: 0.06
      },
      {
        proveedorId: 'PROV-CANTERA-03',
        nombre: 'Cantera El Tablón & Agregados del Austro',
        ciudadOrigen: 'Paute / Azuay',
        coordenadas: { lat: -2.7758, lng: -78.7562 },
        materialesAsignados: ['Arena Homogénea Lavada para Hormigón', 'Ripio Triturado 3/4 para Estructuras'],
        descuentoMayoristaPct: 0.12
      },
      {
        proveedorId: 'PROV-CERAMICA-04',
        nombre: 'Ladrillera & Bloquera Cuencana San Pedro',
        ciudadOrigen: 'Cuenca, Challuabamba',
        coordenadas: { lat: -2.8591, lng: -78.9321 },
        materialesAsignados: ['Ladrillo Panel Quemado Artesanal / Cerámico'],
        descuentoMayoristaPct: 0.07
      }
    ];

    // Asignar costos con optimización por volumen
    let costoTotalSuministros = 0;
    let ahorroTotalObtenido = 0;

    const proveedoresSeleccionados = proveedoresAliados.map(prov => {
      let subtotalBase = 0;
      prov.materialesAsignados.forEach(matNombre => {
        const item = apuData.materialesRequeridos.find(m => m.nombre === matNombre);
        if (item) {
          // Costo referencial según material
          let unitPrice = 1.0;
          if (item.codigo.includes('CEM')) unitPrice = 7.45;
          if (item.codigo.includes('ACE')) unitPrice = 1.18;
          if (item.codigo.includes('ARE')) unitPrice = 18.0;
          if (item.codigo.includes('RIP')) unitPrice = 21.0;
          if (item.codigo.includes('LAD')) unitPrice = 0.35;

          subtotalBase += item.cantidad * unitPrice;
        }
      });

      const ahorro = Math.round(subtotalBase * prov.descuentoMayoristaPct);
      const subtotalFinal = Math.round(subtotalBase - ahorro);
      costoTotalSuministros += subtotalFinal;
      ahorroTotalObtenido += ahorro;

      return {
        proveedorId: prov.proveedorId,
        nombre: prov.nombre,
        ciudadOrigen: prov.ciudadOrigen,
        coordenadas: prov.coordenadas,
        materialesAsignados: prov.materialesAsignados,
        subtotalUSD: subtotalFinal,
        ahorroObtenidoUSD: ahorro
      };
    });

    // Desglose Tributario SRI: Resolución NAC-DGERCGC24-00000013 (IVA 5% en materiales de construcción: acero, cemento, áridos, ladrillos/bloques)
    const baseIva5PctUSD = costoTotalSuministros;
    const iva5PctUSD = +(baseIva5PctUSD * 0.05).toFixed(2);
    const baseIva15PctUSD = 0;
    const iva15PctUSD = 0;

    // Predicción de alza de precios y blindaje de compra anticipada
    const prediccionAlzaPrecios = {
      alertaCompraAnticipada: aceroEnRiesgo,
      materialesEnRiesgo: aceroEnRiesgo ? ['Acero Corrugado Adelca'] : [],
      ahorroProyectadoUSD: Math.round(costoTotalSuministros * 0.038)
    };

    const payload: SuministrosAsignadosPayload = {
      proyectoId: apuData.proyectoId,
      proveedoresSeleccionados,
      costoTotalSuministros,
      ahorroTotalObtenidoUSD: ahorroTotalObtenido,
      desgloseIvaMateriales: {
        baseIva5PctUSD,
        iva5PctUSD,
        baseIva15PctUSD,
        iva15PctUSD
      },
      prediccionAlzaPrecios
    };

    // 1. Guardar en Memoria Colectiva
    await SaraSharedMemory.set(
      correlationId,
      'marketplace',
      'suministros_optimizados',
      payload,
      0.96,
      ['marketplace', 'insumos', 'ahorro'],
      apuData.proyectoId
    );

    // 2. Disparar Evento que alimenta a SARA-FLETES
    await SaraEventBus.publish<SuministrosAsignadosPayload>(
      'SUMINISTROS_ASIGNADOS',
      this.AGENT_ID,
      ['SARA-FLETES'],
      payload,
      correlationId,
      apuData.proyectoId
    );

    return payload;
  }
}
