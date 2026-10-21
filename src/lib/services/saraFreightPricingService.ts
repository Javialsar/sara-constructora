// ============================================================================
// SERVICIO DE TARIFICACIÓN DINÁMICA Y RUTEO DE FLETES (SARA-DYNAMIC-PRICING)
// Calcula tarifas justas y reales para transporte de carga y renta temporal
// de vehículos de trabajo en Ecuador: fletes urbanos ($2 - $3 USD), interprovinciales
// y alquiler por horas / días tipo Uber, inDrive, DiDi y Turo.
// ============================================================================

export type CategoriaVehiculo = 
  | 'PICKUP_1T'     // Camioneta 1.2T
  | 'FURGON_3T'     // Furgón 3.5T
  | 'CAMION_5T'     // Camión Liviano 5T
  | 'VOLQUETA_V3A'  // Volqueta 14m³ (o 8-14m³)
  | 'CAMION_10T'    // Camión Mediano 10T
  | 'TRACTO_3S3';   // Mula Plataforma 32T

export interface ParametrosVehiculo {
  id: CategoriaVehiculo;
  nombre: string;
  subtitulo: string;
  capacidadTon: number;
  capacidadM3: number;
  // Tarifas de Flete por Viaje
  tarifaMinimaLocalUSD: number;
  banderazoLocalUSD: number;
  costoKmLocalUSD: number;
  costoTonLocalUSD: number;
  costoKmInterurbanoUSD: number;
  costoTonKmInterurbanoUSD: number;
  // Tarifas de Renta Temporal
  tarifaHoraRentaUSD: number;
  tarifaDiaRentaUSD: number;
  depositoGarantiaUSD: number;
  permiteSinChofer: boolean;
  icono: string;
}

export const CATALOGO_VEHICULOS_SARA: Record<CategoriaVehiculo, ParametrosVehiculo> = {
  PICKUP_1T: {
    id: 'PICKUP_1T',
    nombre: 'Camioneta Pickup',
    subtitulo: 'Hasta 1.2 Ton | Balde abierto',
    capacidadTon: 1.2,
    capacidadM3: 2.5,
    tarifaMinimaLocalUSD: 2.00,
    banderazoLocalUSD: 1.50,
    costoKmLocalUSD: 0.50,
    costoTonLocalUSD: 0.30,
    costoKmInterurbanoUSD: 0.45,
    costoTonKmInterurbanoUSD: 0.12,
    tarifaHoraRentaUSD: 12.00,
    tarifaDiaRentaUSD: 65.00,
    depositoGarantiaUSD: 250.00,
    permiteSinChofer: true,
    icono: '🛻'
  },
  FURGON_3T: {
    id: 'FURGON_3T',
    nombre: 'Furgón Urbano',
    subtitulo: 'Hasta 3.5 Ton | Furgón cerrado',
    capacidadTon: 3.5,
    capacidadM3: 14.0,
    tarifaMinimaLocalUSD: 2.50,
    banderazoLocalUSD: 1.80,
    costoKmLocalUSD: 0.60,
    costoTonLocalUSD: 0.25,
    costoKmInterurbanoUSD: 0.55,
    costoTonKmInterurbanoUSD: 0.10,
    tarifaHoraRentaUSD: 18.00,
    tarifaDiaRentaUSD: 95.00,
    depositoGarantiaUSD: 350.00,
    permiteSinChofer: false,
    icono: '🚐'
  },
  CAMION_5T: {
    id: 'CAMION_5T',
    nombre: 'Camión Liviano',
    subtitulo: 'Hasta 5.0 Ton | Barandas o plataforma',
    capacidadTon: 5.0,
    capacidadM3: 18.0,
    tarifaMinimaLocalUSD: 3.00,
    banderazoLocalUSD: 2.20,
    costoKmLocalUSD: 0.70,
    costoTonLocalUSD: 0.20,
    costoKmInterurbanoUSD: 0.75,
    costoTonKmInterurbanoUSD: 0.08,
    tarifaHoraRentaUSD: 25.00,
    tarifaDiaRentaUSD: 140.00,
    depositoGarantiaUSD: 450.00,
    permiteSinChofer: false,
    icono: '🚚'
  },
  VOLQUETA_V3A: {
    id: 'VOLQUETA_V3A',
    nombre: 'Volqueta de Obra',
    subtitulo: 'Hasta 14 Ton (14m³) | Basculante',
    capacidadTon: 14.0,
    capacidadM3: 14.0,
    tarifaMinimaLocalUSD: 18.00,
    banderazoLocalUSD: 15.00,
    costoKmLocalUSD: 1.20,
    costoTonLocalUSD: 0.15,
    costoKmInterurbanoUSD: 1.40,
    costoTonKmInterurbanoUSD: 0.06,
    tarifaHoraRentaUSD: 35.00,
    tarifaDiaRentaUSD: 220.00,
    depositoGarantiaUSD: 500.00,
    permiteSinChofer: false,
    icono: '🚜'
  },
  CAMION_10T: {
    id: 'CAMION_10T',
    nombre: 'Camión Mediano',
    subtitulo: 'Hasta 10 Ton | Plataforma 8m',
    capacidadTon: 10.0,
    capacidadM3: 25.0,
    tarifaMinimaLocalUSD: 15.00,
    banderazoLocalUSD: 12.00,
    costoKmLocalUSD: 1.10,
    costoTonLocalUSD: 0.12,
    costoKmInterurbanoUSD: 1.25,
    costoTonKmInterurbanoUSD: 0.05,
    tarifaHoraRentaUSD: 32.00,
    tarifaDiaRentaUSD: 190.00,
    depositoGarantiaUSD: 500.00,
    permiteSinChofer: false,
    icono: '🚛'
  },
  TRACTO_3S3: {
    id: 'TRACTO_3S3',
    nombre: 'Tráiler / Mula Plataforma',
    subtitulo: 'Hasta 32 Ton (51T PBV MTOP)',
    capacidadTon: 32.0,
    capacidadM3: 35.0,
    tarifaMinimaLocalUSD: 50.00,
    banderazoLocalUSD: 45.00,
    costoKmLocalUSD: 2.20,
    costoTonLocalUSD: 0.10,
    costoKmInterurbanoUSD: 2.50,
    costoTonKmInterurbanoUSD: 0.04,
    tarifaHoraRentaUSD: 55.00,
    tarifaDiaRentaUSD: 380.00,
    depositoGarantiaUSD: 800.00,
    permiteSinChofer: false,
    icono: '🏗️'
  }
};

export const FACTORES_MATERIAL: Record<string, number> = {
  'Cemento (Sacos)': 1.05,
  'Arena / Ripio': 1.00,
  'Varillas de Acero': 1.15,
  'Bloques / Ladrillos': 1.05,
  'Desalojo de Escombros': 1.20,
  'Acabados / Cerámica': 1.08,
  'Otros Materiales': 1.00
};

export interface ResultadoTarifaFlete {
  distanciaKm: number;
  duracionMinutos: number;
  esFleteLocal: boolean;
  tipoVehiculo: CategoriaVehiculo;
  pesoTon: number;
  tarifaSugeridaUSD: number;
  rangoNegociacionInDrive: {
    minimoUSD: number;
    maximoUSD: number;
  };
  desglose: {
    banderazoUSD: number;
    costoDistanciaUSD: number;
    costoPesoUSD: number;
    factorMaterialPct: number;
    peajesMTOPUSD: number;
  };
  explicacionIA: string;
}

export interface ResultadoRentaTemporal {
  tipoVehiculo: CategoriaVehiculo;
  duracionTipo: 'HORAS' | 'DIAS';
  duracionValor: number;
  conChofer: boolean;
  tarifaBaseUSD: number;
  suplementoChoferUSD: number;
  seguroCoberturaUSD: number;
  descuentoDuracionPct: number;
  depositoGarantiaUSD: number;
  tarifaTotalUSD: number;
  detalles: string;
}

export class SaraFreightPricingService {
  /**
   * Calcula la tarifa dinámica y realista para un viaje de flete
   */
  static calcularTarifa(
    distanciaKm: number,
    pesoTon: number,
    vehiculoKey: CategoriaVehiculo,
    tipoMaterial: string = 'Otros Materiales'
  ): ResultadoTarifaFlete {
    const config = CATALOGO_VEHICULOS_SARA[vehiculoKey] || CATALOGO_VEHICULOS_SARA.PICKUP_1T;
    const factorMat = FACTORES_MATERIAL[tipoMaterial] || 1.00;
    const duracionEstimadaMin = Math.max(5, Math.round(distanciaKm <= 5 ? (distanciaKm * 3.5) + 5 : (distanciaKm * 1.5) + 15));
    const esLocal = distanciaKm <= 5.0;

    let tarifaCalculada = 0;
    let banderazo = 0;
    let costoDistancia = 0;
    let costoPeso = 0;
    let peajes = 0;

    if (esLocal) {
      // 1. RÉGIMEN LOCAL URBANO (ej. Dentro de Cariamanga, Loja, Cuenca, etc.)
      banderazo = config.banderazoLocalUSD;
      costoDistancia = +(distanciaKm * config.costoKmLocalUSD).toFixed(2);
      costoPeso = +(Math.min(pesoTon, config.capacidadTon) * config.costoTonLocalUSD).toFixed(2);

      const subtotal = (banderazo + costoDistancia + costoPeso) * factorMat;
      tarifaCalculada = Math.max(config.tarifaMinimaLocalUSD, subtotal);
    } else {
      // 2. RÉGIMEN INTERURBANO / INTERPROVINCIAL (> 5 km)
      banderazo = config.banderazoLocalUSD * 1.5;
      const sinuosidadVial = 1.25;
      const kmEfectivos = distanciaKm * sinuosidadVial;
      costoDistancia = +(kmEfectivos * config.costoKmInterurbanoUSD).toFixed(2);
      costoPeso = +(pesoTon * config.costoTonKmInterurbanoUSD * distanciaKm).toFixed(2);

      peajes = distanciaKm > 40 ? Math.floor(distanciaKm / 60) * (config.id === 'PICKUP_1T' ? 1.00 : config.id === 'TRACTO_3S3' ? 3.00 : 2.00) : 0;

      const subtotal = (banderazo + costoDistancia + costoPeso + peajes) * factorMat;
      tarifaCalculada = Math.max(config.tarifaMinimaLocalUSD * 2, subtotal);
    }

    const tarifaFinal = +tarifaCalculada.toFixed(2);
    const minNegociacion = +Math.max(config.tarifaMinimaLocalUSD, tarifaFinal * 0.85).toFixed(2);
    const maxNegociacion = +(tarifaFinal * 1.30).toFixed(2);

    let explicacion = '';
    if (esLocal) {
      explicacion = `Flete local de corta distancia (${distanciaKm.toFixed(1)} km) en ${config.nombre}. Tarifa optimizada para economía urbana sin recargos pesados innecesarios.`;
    } else {
      explicacion = `Flete interurbano (${distanciaKm.toFixed(1)} km) en ${config.nombre}. Incluye sinuosidad vial, desgaste de neumáticos y costo por ton-km.`;
    }

    return {
      distanciaKm: +distanciaKm.toFixed(2),
      duracionMinutos: duracionEstimadaMin,
      esFleteLocal: esLocal,
      tipoVehiculo: vehiculoKey,
      pesoTon,
      tarifaSugeridaUSD: tarifaFinal,
      rangoNegociacionInDrive: {
        minimoUSD: minNegociacion,
        maximoUSD: maxNegociacion
      },
      desglose: {
        banderazoUSD: +banderazo.toFixed(2),
        costoDistanciaUSD: +costoDistancia.toFixed(2),
        costoPesoUSD: +costoPeso.toFixed(2),
        factorMaterialPct: Math.round((factorMat - 1) * 100),
        peajesMTOPUSD: peajes
      },
      explicacionIA: explicacion
    };
  }

  /**
   * Calcula la tarifa para Renta Temporal de Vehículos (Por Horas o Por Días)
   */
  static calcularRentaTemporal(
    vehiculoKey: CategoriaVehiculo,
    duracionTipo: 'HORAS' | 'DIAS',
    duracionValor: number,
    conChofer: boolean
  ): ResultadoRentaTemporal {
    const config = CATALOGO_VEHICULOS_SARA[vehiculoKey] || CATALOGO_VEHICULOS_SARA.PICKUP_1T;
    const duracion = Math.max(1, duracionValor);
    
    let tarifaBase = 0;
    let suplementoChofer = 0;
    let seguro = 0;
    let descuentoPct = 0;

    if (duracionTipo === 'HORAS') {
      tarifaBase = config.tarifaHoraRentaUSD * duracion;
      suplementoChofer = conChofer ? (6.00 * duracion) : 0;
      seguro = 5.00; // Seguro básico por jornada de horas
    } else {
      // DÍAS
      if (duracion >= 7) {
        descuentoPct = 20; // 20% descuento semanal
      } else if (duracion >= 3) {
        descuentoPct = 10; // 10% descuento
      }

      const factorDescuento = (100 - descuentoPct) / 100;
      tarifaBase = +(config.tarifaDiaRentaUSD * duracion * factorDescuento).toFixed(2);
      suplementoChofer = conChofer ? (40.00 * duracion) : 0;
      seguro = +(8.00 * duracion).toFixed(2);
    }

    const deposito = conChofer ? Math.round(config.depositoGarantiaUSD * 0.5) : config.depositoGarantiaUSD;
    const total = +(tarifaBase + suplementoChofer + seguro).toFixed(2);

    const detalles = duracionTipo === 'HORAS'
      ? `Renta por ${duracion} hora(s) en ${config.nombre}. ${conChofer ? 'Incluye conductor profesional.' : 'Modalidad de conducción libre.'}`
      : `Renta por ${duracion} día(s) en ${config.nombre}. ${descuentoPct > 0 ? `Descuento de ${descuentoPct}% aplicado por duración.` : ''}`;

    return {
      tipoVehiculo: vehiculoKey,
      duracionTipo,
      duracionValor: duracion,
      conChofer,
      tarifaBaseUSD: tarifaBase,
      suplementoChoferUSD: suplementoChofer,
      seguroCoberturaUSD: seguro,
      descuentoDuracionPct: descuentoPct,
      depositoGarantiaUSD: deposito,
      tarifaTotalUSD: total,
      detalles
    };
  }

  /**
   * Calcula distancia aproximada Haversine entre dos pares de coordenadas
   */
  static distanciaHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return +(R * c).toFixed(2);
  }
}
