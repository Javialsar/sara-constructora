/**
 * SERVICIO DE PROCURAMIENTO PREDICTIVO, RUTEO GEORREFERENCIADO Y EXPLOSIÓN BIM
 * Optimiza compras calculando el Landed Cost (Material + Flete) en las 24 provincias del Ecuador
 * y consolida pedidos multiproyecto para maximizar escalas de descuento por volumen.
 */

export interface EcuadorianLocation {
  provincia: string;
  canton: string;
  lat: number;
  lng: number;
}

export interface SupplierCatalogItem {
  proveedorId: string;
  razonSocial: string;
  ciudadSede: string;
  coordenadas: { lat: number; lng: number };
  coberturaProvincias: string[];
  insumoCodigo: string;
  insumoNombre: string;
  precioBaseUnitario: number;
  escalasDescuento: Array<{
    minCantidad: number;
    maxCantidad?: number;
    descuentoPct: number;
  }>;
}

export interface LandedCostQuote {
  proveedorId: string;
  razonSocial: string;
  distanciaKm: number;
  fleteTotalUSD: number;
  precioMaterialUnitarioBruto: number;
  descuentoVolumenPct: number;
  precioMaterialUnitarioNeto: number;
  subtotalMaterialesUSD: number;
  costoTotalLandedUSD: number; // Material con descuento + Flete
  costoUnitarioPuestoEnObraUSD: number; // Costo real unitario en destino
  tiempoEstimadoEntregaHoras: number;
  recomendado: boolean;
}

export interface BimMaterialTakeoffRow {
  codigoRubro: string;
  rubroNombre: string;
  elementoBim: string; // Columna, Viga, Losa, Zapata, Mampostería
  volumenGeometriaM3: number;
  insumoCodigo: string;
  insumoNombre: string;
  unidadMedida: string;
  factorConversionPorM3: number; // Ej: 8.5 sacos cemento por m3 hormigón f'c=210 kg/cm2
  factorDesperdicioNormativoPct: number; // Ej: 5% cemento, 7% acero
}

export interface MaterialExplosionResult {
  resumenMateriales: Array<{
    insumoCodigo: string;
    insumoNombre: string;
    unidadMedida: string;
    cantidadNeta: number;
    factorDesperdicioPct: number;
    cantidadBrutaConDesperdicio: number;
  }>;
  totalRubrosProcesados: number;
}

export interface MultiProjectConsolidationInput {
  insumoCodigo: string;
  pedidosPorProyecto: Array<{
    proyectoId: string;
    proyectoNombre: string;
    provincia: string;
    canton: string;
    cantidadRequerida: number;
  }>;
}

export interface MultiProjectConsolidationResult {
  insumoCodigo: string;
  totalCantidadConsolidada: number;
  descuentoIndividualPromedioPct: number;
  descuentoConsolidadoAlcanzadoPct: number;
  ahorroTotalConsolidacionUSD: number;
  costoSinConsolidarUSD: number;
  costoConConsolidarUSD: number;
  proyectosParticipantes: number;
  ordenCompraSugerida: {
    cantidadTotal: number;
    precioUnitarioPactado: number;
    desgloseEntregas: Array<{
      proyectoId: string;
      proyectoNombre: string;
      destino: string;
      cantidad: number;
      montoAsignadoUSD: number;
    }>;
  };
}

export class PredictivePurchaseService {
  // Matriz de distancias referenciales intercantonales (Km) en corredores de obra ecuatorianos
  public static readonly COORDENADAS_CANTONES_ECUADOR: Record<string, EcuadorianLocation> = {
    'Cariamanga': { provincia: 'Loja', canton: 'Calvas (Cariamanga)', lat: -4.3312, lng: -79.5542 },
    'Loja': { provincia: 'Loja', canton: 'Loja', lat: -3.9931, lng: -79.2042 },
    'Catamayo': { provincia: 'Loja', canton: 'Catamayo', lat: -3.9875, lng: -79.3558 },
    'Cuenca': { provincia: 'Azuay', canton: 'Cuenca', lat: -2.9001, lng: -79.0059 },
    'Machala': { provincia: 'El Oro', canton: 'Machala', lat: -3.2581, lng: -79.9554 },
    'Quito': { provincia: 'Pichincha', canton: 'Quito', lat: -0.1807, lng: -78.4678 },
    'Guayaquil': { provincia: 'Guayas', canton: 'Guayaquil', lat: -2.1894, lng: -79.8891 },
    'Ambato': { provincia: 'Tungurahua', canton: 'Ambato', lat: -1.2491, lng: -78.6168 },
    'Santo Domingo': { provincia: 'Santo Domingo', canton: 'Santo Domingo', lat: -0.2530, lng: -79.1754 },
    'Manta': { provincia: 'Manabí', canton: 'Manta', lat: -0.9677, lng: -80.7089 },
  };

  /**
   * Calcula la distancia geodésica aproximada por carretera (fórmula Haversine x Factor Curvatura Vial Ecuador 1.35)
   */
  public static calculateRoadDistanceKm(loc1: { lat: number; lng: number }, loc2: { lat: number; lng: number }): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180);
    const dLng = (loc2.lng - loc1.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(loc1.lat * (Math.PI / 180)) * Math.cos(loc2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanciaLineaRecta = R * c;

    // En la geografía andina/costa del Ecuador las carreteras tienen un factor de sinuosidad de ~1.35
    return +(distanciaLineaRecta * 1.35).toFixed(1);
  }

  /**
   * Calcula el costo de flete pesado en Ecuador según tonelaje y distancia
   * Tarifario promedio: Camión pesados $0.18 / Ton-Km, Volqueta $0.22 / Ton-Km, Mula Plataforma $0.14 / Ton-Km
   */
  public static estimateFreightCost(distanciaKm: number, pesoEstimadoToneladas: number): number {
    const tarifaPorTonKm = pesoEstimadoToneladas > 20 ? 0.14 : 0.18;
    const fleteBase = distanciaKm * pesoEstimadoToneladas * tarifaPorTonKm;
    // Flete mínimo de movilización local
    const fleteMinimo = 45.0;
    return +Math.max(fleteBase, fleteMinimo).toFixed(2);
  }

  /**
   * Optimiza el procuramiento seleccionando la opción con el mejor Costo Total Puesto en Obra (Landed Cost)
   */
  public static quoteBestSupplier(
    destino: { canton: string; provincia: string; lat?: number; lng?: number },
    insumoCodigo: string,
    cantidadRequerida: number,
    pesoEstimadoToneladas: number,
    catalogoProveedores: SupplierCatalogItem[]
  ): LandedCostQuote[] {
    const coordDestino = (destino.lat && destino.lng)
      ? { lat: destino.lat, lng: destino.lng }
      : (this.COORDENADAS_CANTONES_ECUADOR[destino.canton] || { lat: -4.3312, lng: -79.5542 }); // Default Cariamanga

    const cotizaciones: LandedCostQuote[] = [];

    // Filtrar proveedores que despachan este insumo y cubren la provincia
    const proveedoresValidos = catalogoProveedores.filter(
      p => p.insumoCodigo === insumoCodigo &&
           (p.coberturaProvincias.includes(destino.provincia) || p.coberturaProvincias.includes('TODAS'))
    );

    for (const prov of proveedoresValidos) {
      const distanciaKm = this.calculateRoadDistanceKm(prov.coordenadas, coordDestino);
      const fleteTotal = this.estimateFreightCost(distanciaKm, pesoEstimadoToneladas);

      // Calcular descuento por volumen según escalas
      let descuentoPct = 0;
      for (const escala of prov.escalasDescuento) {
        if (cantidadRequerida >= escala.minCantidad && (!escala.maxCantidad || cantidadRequerida <= escala.maxCantidad)) {
          descuentoPct = escala.descuentoPct;
          break;
        }
      }

      const precioNeto = +(prov.precioBaseUnitario * (1 - descuentoPct / 100)).toFixed(4);
      const subtotalMaterial = +(precioNeto * cantidadRequerida).toFixed(2);
      const landedTotal = +(subtotalMaterial + fleteTotal).toFixed(2);
      const costoUnitarioPuestoEnObra = +(landedTotal / cantidadRequerida).toFixed(4);
      const tiempoEstimadoHoras = +(distanciaKm / 45.0 + 1.5).toFixed(1); // 45 km/h promedio en sierra/valles + carga

      cotizaciones.push({
        proveedorId: prov.proveedorId,
        razonSocial: prov.razonSocial,
        distanciaKm,
        fleteTotalUSD: fleteTotal,
        precioMaterialUnitarioBruto: prov.precioBaseUnitario,
        descuentoVolumenPct: descuentoPct,
        precioMaterialUnitarioNeto: precioNeto,
        subtotalMaterialesUSD: subtotalMaterial,
        costoTotalLandedUSD: landedTotal,
        costoUnitarioPuestoEnObraUSD: costoUnitarioPuestoEnObra,
        tiempoEstimadoEntregaHoras: tiempoEstimadoHoras,
        recomendado: false,
      });
    }

    // Ordenar de menor a mayor por costo landed total
    cotizaciones.sort((a, b) => a.costoTotalLandedUSD - b.costoTotalLandedUSD);
    if (cotizaciones.length > 0) {
      cotizaciones[0].recomendado = true;
    }

    return cotizaciones;
  }

  /**
   * Consolida pedidos de múltiples proyectos para alcanzar escalas de descuento superiores
   */
  public static consolidateMultiProjectOrders(
    input: MultiProjectConsolidationInput,
    catalogoEscalas: Array<{ minCantidad: number; maxCantidad?: number; descuentoPct: number; precioBase: number }>
  ): MultiProjectConsolidationResult {
    const totalCantidad = input.pedidosPorProyecto.reduce((acc, p) => acc + p.cantidadRequerida, 0);

    const precioBase = catalogoEscalas[0]?.precioBase || 7.50;

    // Calcular costo individual sin consolidar
    let costoSinConsolidar = 0;
    let sumaDescuentosIndiv = 0;

    for (const pedido of input.pedidosPorProyecto) {
      let descIndiv = 0;
      for (const e of catalogoEscalas) {
        if (pedido.cantidadRequerida >= e.minCantidad && (!e.maxCantidad || pedido.cantidadRequerida <= e.maxCantidad)) {
          descIndiv = e.descuentoPct;
          break;
        }
      }
      sumaDescuentosIndiv += descIndiv;
      const subIndiv = pedido.cantidadRequerida * precioBase * (1 - descIndiv / 100);
      costoSinConsolidar += subIndiv;
    }

    const descIndivPromedio = input.pedidosPorProyecto.length > 0
      ? +(sumaDescuentosIndiv / input.pedidosPorProyecto.length).toFixed(2)
      : 0;

    // Calcular descuento con la cantidad total consolidada
    let descConsolidado = 0;
    for (const e of catalogoEscalas) {
      if (totalCantidad >= e.minCantidad && (!e.maxCantidad || totalCantidad <= e.maxCantidad)) {
        descConsolidado = e.descuentoPct;
        break;
      }
    }

    const precioUnitarioConsolidado = +(precioBase * (1 - descConsolidado / 100)).toFixed(4);
    const costoConConsolidar = +(totalCantidad * precioUnitarioConsolidado).toFixed(2);
    const ahorroTotal = +(costoSinConsolidar - costoConConsolidar).toFixed(2);

    const desgloseEntregas = input.pedidosPorProyecto.map(p => ({
      proyectoId: p.proyectoId,
      proyectoNombre: p.proyectoNombre,
      destino: `${p.canton}, ${p.provincia}`,
      cantidad: p.cantidadRequerida,
      montoAsignadoUSD: +(p.cantidadRequerida * precioUnitarioConsolidado).toFixed(2),
    }));

    return {
      insumoCodigo: input.insumoCodigo,
      totalCantidadConsolidada: totalCantidad,
      descuentoIndividualPromedioPct: descIndivPromedio,
      descuentoConsolidadoAlcanzadoPct: descConsolidado,
      ahorroTotalConsolidacionUSD: Math.max(ahorroTotal, 0),
      costoSinConsolidarUSD: +costoSinConsolidar.toFixed(2),
      costoConConsolidarUSD: costoConConsolidar,
      proyectosParticipantes: input.pedidosPorProyecto.length,
      ordenCompraSugerida: {
        cantidadTotal: totalCantidad,
        precioUnitarioPactado: precioUnitarioConsolidado,
        desgloseEntregas,
      },
    };
  }

  /**
   * Explosión de Materiales BIM / APU: Transforma cubicación en lista neta de compras con factores de merma
   */
  public static explodeBimTakeoff(takeoffRows: BimMaterialTakeoffRow[]): MaterialExplosionResult {
    const mapaMateriales: Map<string, {
      insumoCodigo: string;
      insumoNombre: string;
      unidadMedida: string;
      cantidadNeta: number;
      factorDesperdicioPct: number;
    }> = new Map();

    for (const row of takeoffRows) {
      const cantidadNetaFila = row.volumenGeometriaM3 * row.factorConversionPorM3;

      if (!mapaMateriales.has(row.insumoCodigo)) {
        mapaMateriales.set(row.insumoCodigo, {
          insumoCodigo: row.insumoCodigo,
          insumoNombre: row.insumoNombre,
          unidadMedida: row.unidadMedida,
          cantidadNeta: cantidadNetaFila,
          factorDesperdicioPct: row.factorDesperdicioNormativoPct,
        });
      } else {
        const item = mapaMateriales.get(row.insumoCodigo)!;
        item.cantidadNeta += cantidadNetaFila;
      }
    }

    const resumenMateriales = Array.from(mapaMateriales.values()).map(m => {
      const cantidadBruta = +(m.cantidadNeta * (1 + m.factorDesperdicioPct / 100)).toFixed(2);
      return {
        insumoCodigo: m.insumoCodigo,
        insumoNombre: m.insumoNombre,
        unidadMedida: m.unidadMedida,
        cantidadNeta: +m.cantidadNeta.toFixed(2),
        factorDesperdicioPct: m.factorDesperdicioPct,
        cantidadBrutaConDesperdicio: cantidadBruta,
      };
    });

    return {
      resumenMateriales,
      totalRubrosProcesados: takeoffRows.length,
    };
  }
}
