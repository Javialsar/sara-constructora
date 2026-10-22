// ============================================================================
// SERVICIO DE CONTROL DE PESOS, DIMENSIONES Y BALANZAS MTOP (ECUADOR)
// Normativa: Acuerdo Ministerial MTOP N° 018-2021 / Tabla Nacional de Pesos y Dimensiones
// Monitorea el Peso Bruto Vehicular (PBV), pesos máximos por eje y geocercas
// de las estaciones oficiales de pesaje en la Red Vial Estatal del Ecuador.
// ============================================================================

export interface EstacionBalanzaMtop {
  id: string;
  nombre: string;
  corredorVial: string; // e.g., 'E35 Panamericana Sur'
  provincia: string;
  canton: string;
  lat: number;
  lng: number;
  radioGeocercaKm: number;
  operativa: boolean;
  pesajeBidireccional: boolean;
}

export interface LimiteVehicularMtop {
  tipoVehiculo: string;
  nombreComercial: string;
  clasificacionMtop: string; // '2DB', 'V3A', '3S2', '3S3', etc.
  numeroEjes: number;
  pesoMaximoBrutoTon: number; // PBV Máximo Legal
  pesoVacioTaraTon: number;
  capacidadUtilRecomendadaTon: number;
  balanzaObligatoria: boolean;
  normasEspeciales?: string[];
}

export interface EvaluacionPesajeResult {
  dentroDeNorma: boolean;
  sobrepesoTon: number;
  porcentajeOcupacionPbv: number;
  pbvCalculadoTon: number;
  pbvMaximoLegalTon: number;
  alertaNivel: 'NORMAL' | 'PRECAUCION' | 'INFRACCION_GRAVE';
  mensaje: string;
  multaSugeridaSbu?: number; // SBU Ecuador 2026: $482
}

// ----------------------------------------------------------------------------
// 1. CLASIFICACIÓN Y LÍMITES POR TIPO DE VEHÍCULO
// ----------------------------------------------------------------------------
export const LIMITES_VEHICULOS_MTOP: Record<string, LimiteVehicularMtop> = {
  PICKUP_1T: {
    tipoVehiculo: 'PICKUP_1T',
    nombreComercial: 'Camioneta 1 Tonelada',
    clasificacionMtop: 'LIVIANO',
    numeroEjes: 2,
    pesoMaximoBrutoTon: 3.2,
    pesoVacioTaraTon: 1.8,
    capacidadUtilRecomendadaTon: 1.2,
    balanzaObligatoria: false,
    normasEspeciales: ['Carga no debe sobresalir del balde', 'Sujeción con eslingas certificadas']
  },
  FURGON_3T: {
    tipoVehiculo: 'FURGON_3T',
    nombreComercial: 'Furgón 3.5 Toneladas',
    clasificacionMtop: '2D-LIVIANO',
    numeroEjes: 2,
    pesoMaximoBrutoTon: 6.0,
    pesoVacioTaraTon: 2.8,
    capacidadUtilRecomendadaTon: 3.2,
    balanzaObligatoria: false,
    normasEspeciales: ['Altura máxima permitida 3.80m', 'Uso en zonas urbanas sin restricción']
  },
  CAMION_5T: {
    tipoVehiculo: 'CAMION_5T',
    nombreComercial: 'Camión Mediano 5 Toneladas',
    clasificacionMtop: '2DA',
    numeroEjes: 2,
    pesoMaximoBrutoTon: 10.5,
    pesoVacioTaraTon: 4.2,
    capacidadUtilRecomendadaTon: 5.5,
    balanzaObligatoria: true,
    normasEspeciales: ['Paso obligatorio por balanzas en E35 y E25', 'Rótulos reflectivos posteriores']
  },
  VOLQUETA_V3A: {
    tipoVehiculo: 'VOLQUETA_V3A',
    nombreComercial: 'Volqueta Pesada 14m³ (6x4)',
    clasificacionMtop: 'V3A',
    numeroEjes: 3,
    pesoMaximoBrutoTon: 27.0, // Límite legal MTOP para 3 ejes tándem posterior
    pesoVacioTaraTon: 11.5,
    capacidadUtilRecomendadaTon: 14.0, // ~14m³ a 1.0 - 1.1 t/m³
    balanzaObligatoria: true,
    normasEspeciales: [
      'Carpa o lona impermeable obligatoria para áridos y desalojo',
      'Comprobante de escombrera o cantera autorizada',
      'Límite 27.0T PBV estricto'
    ]
  },
  CAMION_10T: {
    tipoVehiculo: 'CAMION_10T',
    nombreComercial: 'Camión Pesado 10 Toneladas',
    clasificacionMtop: '2DB / 3DA',
    numeroEjes: 3,
    pesoMaximoBrutoTon: 22.0,
    pesoVacioTaraTon: 7.5,
    capacidadUtilRecomendadaTon: 12.0,
    balanzaObligatoria: true,
    normasEspeciales: ['Paso obligatorio por balanzas MTOP', 'Control de carga por eje tandem']
  },
  TRACTO_3S3: {
    tipoVehiculo: 'TRACTO_3S3',
    nombreComercial: 'Tractocamión Mula / Plataforma (3S3)',
    clasificacionMtop: '3S3',
    numeroEjes: 6,
    pesoMaximoBrutoTon: 48.0, // PBV Máximo en Red Vial Estatal
    pesoVacioTaraTon: 15.0,
    capacidadUtilRecomendadaTon: 32.0,
    balanzaObligatoria: true,
    normasEspeciales: [
      'Paso obligatorio por todas las balanzas estatales',
      'Permiso especial MTOP para cargas indivisibles de más de 48.0T',
      'Dispositivo de monitoreo satelital GPS activo'
    ]
  }
};

// ----------------------------------------------------------------------------
// 2. ESTACIONES DE PESAJE FIJAS OFICIALES MTOP EN ECUADOR
// ----------------------------------------------------------------------------
export const BALANZAS_OFICIALES_MTOP: EstacionBalanzaMtop[] = [
  {
    id: 'BAL-PICH-01',
    nombre: 'Estación de Pesaje Machachi',
    corredorVial: 'E35 Panamericana Sur (Tramo Tambillo - Aloag - Machachi)',
    provincia: 'Pichincha',
    canton: 'Mejía',
    lat: -0.5102,
    lng: -78.5678,
    radioGeocercaKm: 12.0,
    operativa: true,
    pesajeBidireccional: true
  },
  {
    id: 'BAL-PICH-02',
    nombre: 'Estación de Pesaje Guayllabamba',
    corredorVial: 'E28 / E35 Panamericana Norte',
    provincia: 'Pichincha',
    canton: 'Quito',
    lat: -0.0621,
    lng: -78.3412,
    radioGeocercaKm: 10.0,
    operativa: true,
    pesajeBidireccional: true
  },
  {
    id: 'BAL-COTO-01',
    nombre: 'Estación de Pesaje Jambelí / Lasso',
    corredorVial: 'E35 Panamericana Sur',
    provincia: 'Cotopaxi',
    canton: 'Latacunga',
    lat: -0.8523,
    lng: -78.6145,
    radioGeocercaKm: 15.0,
    operativa: true,
    pesajeBidireccional: true
  },
  {
    id: 'BAL-STOD-01',
    nombre: 'Estación de Pesaje Alóag - Santo Domingo',
    corredorVial: 'E20 Vía Alóag - Santo Domingo (Km 72)',
    provincia: 'Santo Domingo de los Tsáchilas',
    canton: 'Santo Domingo',
    lat: -0.2789,
    lng: -79.1245,
    radioGeocercaKm: 10.0,
    operativa: true,
    pesajeBidireccional: true
  },
  {
    id: 'BAL-LRIO-01',
    nombre: 'Estación de Pesaje San Juan',
    corredorVial: 'E25 Troncal de la Costa (Tramo Babahoyo - Quevedo)',
    provincia: 'Los Ríos',
    canton: 'Puebloviejo',
    lat: -1.6142,
    lng: -79.5213,
    radioGeocercaKm: 14.0,
    operativa: true,
    pesajeBidireccional: true
  },
  {
    id: 'BAL-GUAY-01',
    nombre: 'Estación de Pesaje Naranjal',
    corredorVial: 'E25 Troncal de la Costa (Tramo Guayaquil - Machala)',
    provincia: 'Guayas',
    canton: 'Naranjal',
    lat: -2.6712,
    lng: -79.6201,
    radioGeocercaKm: 12.0,
    operativa: true,
    pesajeBidireccional: true
  },
  {
    id: 'BAL-CANR-01',
    nombre: 'Estación de Pesaje Suscal',
    corredorVial: 'E40 Vía Durán - El Tambo',
    provincia: 'Cañar',
    canton: 'Suscal',
    lat: -2.4412,
    lng: -79.0823,
    radioGeocercaKm: 12.0,
    operativa: true,
    pesajeBidireccional: true
  },
  {
    id: 'BAL-LOJA-01',
    nombre: 'Estación de Pesaje San Lucas',
    corredorVial: 'E35 Panamericana Sur (Tramo Saraguro - Loja)',
    provincia: 'Loja',
    canton: 'Loja',
    lat: -3.7345,
    lng: -79.2456,
    radioGeocercaKm: 15.0,
    operativa: true,
    pesajeBidireccional: true
  },
  {
    id: 'BAL-ELOR-01',
    nombre: 'Estación de Pesaje Río Bonito',
    corredorVial: 'E25 Vía El Guabo - Machala',
    provincia: 'El Oro',
    canton: 'El Guabo',
    lat: -3.1412,
    lng: -79.8234,
    radioGeocercaKm: 12.0,
    operativa: true,
    pesajeBidireccional: true
  },
  {
    id: 'BAL-IMBA-01',
    nombre: 'Estación de Pesaje San Roque',
    corredorVial: 'E35 Panamericana Norte (Tramo Otavalo - Ibarra)',
    provincia: 'Imbabura',
    canton: 'Antonio Ante',
    lat: 0.2987,
    lng: -78.1923,
    radioGeocercaKm: 10.0,
    operativa: true,
    pesajeBidireccional: true
  }
];

export class SaraMtopBalanzasService {
  /**
   * Evalúa si una carga y vehículo cumplen con el PBV legal del MTOP
   */
  static evaluarPesaje(tipoVehiculo: string, pesoCargaTon: number): EvaluacionPesajeResult {
    const spec = LIMITES_VEHICULOS_MTOP[tipoVehiculo] || LIMITES_VEHICULOS_MTOP['CAMION_5T'];
    const pbvCalculado = Number((spec.pesoVacioTaraTon + pesoCargaTon).toFixed(2));
    const pbvMaximo = spec.pesoMaximoBrutoTon;
    const ocupacion = Number(((pbvCalculado / pbvMaximo) * 100).toFixed(1));

    if (pbvCalculado <= pbvMaximo) {
      return {
        dentroDeNorma: true,
        sobrepesoTon: 0,
        porcentajeOcupacionPbv: ocupacion,
        pbvCalculadoTon: pbvCalculado,
        pbvMaximoLegalTon: pbvMaximo,
        alertaNivel: ocupacion > 92 ? 'PRECAUCION' : 'NORMAL',
        mensaje: ocupacion > 92
          ? `Alerta: PBV al ${ocupacion}% de capacidad legal MTOP (${pbvCalculado}T / ${pbvMaximo}T). Conducir con precaución en pendientes.`
          : `Cumple norma MTOP (${pbvCalculado}T de ${pbvMaximo}T permitidas). Aprobado para circulación.`
      };
    }

    const sobrepeso = Number((pbvCalculado - pbvMaximo).toFixed(2));
    const sbu2026 = 482; // Acuerdo MDT-2025-195
    // Multa estimada según tabla de contravenciones MTOP
    const multaSugerida = sobrepeso > 3.0 ? sbu2026 * 2 : sbu2026;

    return {
      dentroDeNorma: false,
      sobrepesoTon: sobrepeso,
      porcentajeOcupacionPbv: ocupacion,
      pbvCalculadoTon: pbvCalculado,
      pbvMaximoLegalTon: pbvMaximo,
      alertaNivel: 'INFRACCION_GRAVE',
      mensaje: `INFRACCIÓN MTOP: Sobrepeso de +${sobrepeso} Toneladas sobre el PBV máximo de ${pbvMaximo}T. El vehículo será retenido en báscula.`,
      multaSugeridaSbu: multaSugerida
    };
  }

  /**
   * Calcula distancia en km entre dos puntos usando la fórmula de Haversine
   */
  private static distanciaHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
  }

  /**
   * Busca estaciones de pesaje cercanas a la posición actual del vehículo o a lo largo del trayecto
   */
  static buscarBalanzasCercanas(
    lat: number,
    lng: number,
    radioBusquedaKm = 25
  ): Array<EstacionBalanzaMtop & { distanciaKm: number }> {
    return BALANZAS_OFICIALES_MTOP
      .map((balanza) => ({
        ...balanza,
        distanciaKm: this.distanciaHaversineKm(lat, lng, balanza.lat, balanza.lng)
      }))
      .filter((b) => b.distanciaKm <= radioBusquedaKm)
      .sort((a, b) => a.distanciaKm - b.distanciaKm);
  }

  /**
   * Determina las balanzas que se cruzarán entre un origen y un destino
   */
  static obtenerBalanzasEnCorredor(
    coordsOrigen: [number, number],
    coordsDestino: [number, number],
    margenKm = 30
  ): EstacionBalanzaMtop[] {
    const [lat1, lng1] = coordsOrigen;
    const [lat2, lng2] = coordsDestino;

    const minLat = Math.min(lat1, lat2) - 0.25;
    const maxLat = Math.max(lat1, lat2) + 0.25;
    const minLng = Math.min(lng1, lng2) - 0.25;
    const maxLng = Math.max(lng1, lng2) + 0.25;

    return BALANZAS_OFICIALES_MTOP.filter((balanza) => {
      return (
        balanza.lat >= minLat &&
        balanza.lat <= maxLat &&
        balanza.lng >= minLng &&
        balanza.lng <= maxLng
      );
    });
  }
}
