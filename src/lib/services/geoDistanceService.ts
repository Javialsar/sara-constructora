/**
 * SERVICIO DE GEOLOCALIZACIÓN, DISTANCIAS Y LOGÍSTICA VIAL ECUATORIANA
 * Ecosistema Empresarial GRUPO SARA - SARA-FLETES & SARA-MARKETPLACE
 * 
 * Normativa y factores:
 * - Factor de sinuosidad vial andina MTOP: 1.35
 * - Velocidad media de transporte de carga pesada: 45 km/h en sierra / 65 km/h en costa
 * - Coordenadas oficiales de cantones y polos industriales del Ecuador
 */

export interface CoordenadasGPS {
  lat: number;
  lng: number;
}

export interface CantonEcuador {
  id: string;
  nombre: string;
  provincia: string;
  region: 'SIERRA' | 'COSTA' | 'ORIENTE' | 'INSULAR';
  coordenadas: CoordenadasGPS;
}

export interface ResultadoGeocodificacion {
  nombreCompleto: string;
  nombreCorto: string;
  coordenadas: CoordenadasGPS;
  calle?: string;
  barrio?: string;
  ciudad?: string;
  provincia?: string;
}

export interface ResultadoGeocodificacionInversa {
  calle: string;
  ciudad: string;
  barrio?: string;
  direccionCompleta: string;
}

// Caché en memoria para evitar llamadas redundantes a OpenStreetMap
const GEOCODE_CACHE: Record<string, ResultadoGeocodificacion[]> = {};
const REVERSE_CACHE: Record<string, string> = {};
const REVERSE_DETALLADO_CACHE: Record<string, ResultadoGeocodificacionInversa> = {};

export const CANTONES_ECUADOR: CantonEcuador[] = [
  { id: 'uio', nombre: 'Quito', provincia: 'Pichincha', region: 'SIERRA', coordenadas: { lat: -0.1807, lng: -78.4678 } },
  { id: 'gye', nombre: 'Guayaquil', provincia: 'Guayas', region: 'COSTA', coordenadas: { lat: -2.1894, lng: -79.8891 } },
  { id: 'cue', nombre: 'Cuenca', provincia: 'Azuay', region: 'SIERRA', coordenadas: { lat: -2.9001, lng: -79.0059 } },
  { id: 'loj', nombre: 'Loja', provincia: 'Loja', region: 'SIERRA', coordenadas: { lat: -3.9931, lng: -79.2042 } },
  { id: 'car', nombre: 'Cariamanga (Calvas)', provincia: 'Loja', region: 'SIERRA', coordenadas: { lat: -4.3260, lng: -79.5559 } },
  { id: 'cat', nombre: 'Catamayo', provincia: 'Loja', region: 'SIERRA', coordenadas: { lat: -3.9845, lng: -79.3542 } },
  { id: 'amb', nombre: 'Ambato', provincia: 'Tungurahua', region: 'SIERRA', coordenadas: { lat: -1.2491, lng: -78.6168 } },
  { id: 'rio', nombre: 'Riobamba', provincia: 'Chimborazo', region: 'SIERRA', coordenadas: { lat: -1.6636, lng: -78.6546 } },
  { id: 'mta', nombre: 'Manta', provincia: 'Manabí', region: 'COSTA', coordenadas: { lat: -0.9677, lng: -80.7089 } },
  { id: 'pto', nombre: 'Portoviejo', provincia: 'Manabí', region: 'COSTA', coordenadas: { lat: -1.0546, lng: -80.4544 } },
  { id: 'mch', nombre: 'Machala', provincia: 'El Oro', region: 'COSTA', coordenadas: { lat: -3.2581, lng: -79.9554 } },
  { id: 'sto', nombre: 'Santo Domingo', provincia: 'Santo Domingo de los Tsáchilas', region: 'COSTA', coordenadas: { lat: -0.2530, lng: -79.1754 } },
  { id: 'iba', nombre: 'Ibarra', provincia: 'Imbabura', region: 'SIERRA', coordenadas: { lat: 0.3517, lng: -78.1223 } },
  { id: 'ota', nombre: 'Otavalo', provincia: 'Imbabura', region: 'SIERRA', coordenadas: { lat: 0.2346, lng: -78.2625 } },
  { id: 'esl', nombre: 'Esmeraldas', provincia: 'Esmeraldas', region: 'COSTA', coordenadas: { lat: 0.9682, lng: -79.6517 } },
  { id: 'lat', nombre: 'Latacunga / Lasso', provincia: 'Cotopaxi', region: 'SIERRA', coordenadas: { lat: -0.9316, lng: -78.6155 } },
  { id: 'bab', nombre: 'Babahoyo', provincia: 'Los Ríos', region: 'COSTA', coordenadas: { lat: -1.8022, lng: -79.5344 } },
  { id: 'que', nombre: 'Quevedo', provincia: 'Los Ríos', region: 'COSTA', coordenadas: { lat: -1.0286, lng: -79.4635 } },
  { id: 'pau', nombre: 'Paute', provincia: 'Azuay', region: 'SIERRA', coordenadas: { lat: -2.7758, lng: -78.7562 } },
  { id: 'gua', nombre: 'Gualaceo', provincia: 'Azuay', region: 'SIERRA', coordenadas: { lat: -2.8942, lng: -78.7778 } },
  { id: 'sam', nombre: 'Samborondón', provincia: 'Guayas', region: 'COSTA', coordenadas: { lat: -1.9628, lng: -79.7228 } },
  { id: 'dau', nombre: 'Daule', provincia: 'Guayas', region: 'COSTA', coordenadas: { lat: -1.8631, lng: -79.9772 } },
  { id: 'dur', nombre: 'Durán', provincia: 'Guayas', region: 'COSTA', coordenadas: { lat: -2.1691, lng: -79.8247 } },
  { id: 'rum', nombre: 'Rumiñahui (Sangolquí)', provincia: 'Pichincha', region: 'SIERRA', coordenadas: { lat: -0.3342, lng: -78.4439 } },
  { id: 'tul', nombre: 'Tulcán', provincia: 'Carchi', region: 'SIERRA', coordenadas: { lat: 0.8116, lng: -77.7176 } }
];

export class GeoDistanceService {
  /** Factor de sinuosidad vial andina MTOP */
  static readonly FACTOR_SINUOSIDAD_MTOP = 1.35;

  /**
   * Calcula la distancia en línea recta (Haversine) entre dos puntos GPS
   */
  static distanciaHaversineKm(puntoA: CoordenadasGPS, puntoB: CoordenadasGPS): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((puntoB.lat - puntoA.lat) * Math.PI) / 180;
    const dLng = ((puntoB.lng - puntoA.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((puntoA.lat * Math.PI) / 180) *
        Math.cos((puntoB.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Calcula la distancia estimada real por carretera en Ecuador
   */
  static distanciaVialEcuadorKm(origen: CoordenadasGPS, destino: CoordenadasGPS): number {
    const dLineal = this.distanciaHaversineKm(origen, destino);
    // Para distancias muy cortas dentro de la misma ciudad (< 8km), menor sinuosidad
    if (dLineal < 8) {
      return +(dLineal * 1.15).toFixed(1);
    }
    return +(dLineal * this.FACTOR_SINUOSIDAD_MTOP).toFixed(1);
  }

  /**
   * Calcula el tiempo estimado de transporte y tipo de entrega
   */
  static estimarTiempoTransporte(distanciaKm: number): {
    tiempoHoras: number;
    etiquetaTexto: string;
    esExpress: boolean;
  } {
    if (distanciaKm <= 15) {
      return {
        tiempoHoras: 2,
        etiquetaTexto: 'Entrega Express (2 - 4 horas)',
        esExpress: true
      };
    }
    if (distanciaKm <= 60) {
      return {
        tiempoHoras: 6,
        etiquetaTexto: 'Entrega en el día (Mismo día)',
        esExpress: false
      };
    }
    if (distanciaKm <= 200) {
      return {
        tiempoHoras: 18,
        etiquetaTexto: 'Despacho 24 horas',
        esExpress: false
      };
    }
    return {
      tiempoHoras: 36,
      etiquetaTexto: 'Despacho Nacional 24h - 48h',
      esExpress: false
    };
  }

  /**
   * Encuentra el cantón más cercano a partir de coordenadas GPS
   */
  static encontrarCantonMasCercano(gps: CoordenadasGPS): CantonEcuador {
    let cantonCercano = CANTONES_ECUADOR[0];
    let distanciaMinima = Infinity;

    for (const canton of CANTONES_ECUADOR) {
      const dist = this.distanciaHaversineKm(gps, canton.coordenadas);
      if (dist < distanciaMinima) {
        distanciaMinima = dist;
        cantonCercano = canton;
      }
    }
    return cantonCercano;
  }

  /**
   * Geocodificación inteligente directa en OpenStreetMap Nominatim para Ecuador.
   * Ubica automáticamente el marcador y centra el mapa conforme el usuario escribe calles o referencias.
   */
  static async geocodificarDireccionEcuador(
    textoDireccion: string,
    cantonNombre?: string
  ): Promise<ResultadoGeocodificacion[]> {
    if (!textoDireccion || textoDireccion.trim().length < 3) {
      return [];
    }

    const textoLimpio = textoDireccion.trim().replace(/[#]/g, '');
    const cacheKey = `${textoLimpio.toLowerCase()}_${cantonNombre || ''}`;

    if (GEOCODE_CACHE[cacheKey]) {
      return GEOCODE_CACHE[cacheKey];
    }

    // Desglose de posibles calles en intersección (e.g. "Cariamanga, Atahualpa y Cristobal Colon")
    const partesCalles = textoLimpio
      .split(/[,ye&]/i)
      .map(p => p.trim())
      .filter(p => p.length >= 3 && !['cerca', 'obra', 'frente', 'frente a', 'calle', 'avenida', 'lote'].includes(p.toLowerCase()));

    const queriesCandidatas: string[] = [];
    const ciudad = cantonNombre || '';

    // Candidato 1: Frase completa + Ciudad
    queriesCandidatas.push(`${textoLimpio}, ${ciudad}, Ecuador`);

    // Candidato 2: Intersección primera y última calle
    if (partesCalles.length >= 2) {
      queriesCandidatas.push(`${partesCalles[0]} y ${partesCalles[1]}, ${ciudad}, Ecuador`);
      if (partesCalles.length >= 3) {
        queriesCandidatas.push(`${partesCalles[0]} y ${partesCalles[2]}, ${ciudad}, Ecuador`);
        queriesCandidatas.push(`${partesCalles[1]} y ${partesCalles[2]}, ${ciudad}, Ecuador`);
      }
    }

    // Candidato 3: Calles individuales con ciudad
    for (const calle of partesCalles) {
      queriesCandidatas.push(`${calle}, ${ciudad}, Ecuador`);
    }

    // Candidato 4: Solo texto + Ecuador
    queriesCandidatas.push(`${textoLimpio}, Ecuador`);

    for (const query of queriesCandidatas) {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ec&limit=4&addressdetails=1`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept-Language': 'es-EC,es;q=0.9',
            'User-Agent': 'GrupoSaraMarketplace/1.0 (constructorasara@gmail.com)'
          }
        });
        clearTimeout(timeoutId);

        if (!response.ok) continue;

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const resultados: ResultadoGeocodificacion[] = data.map((item: any) => {
            const addr = item.address || {};
            const calleNombre = addr.road || addr.pedestrian || addr.suburb || item.name;
            const ciudadNombre = addr.city || addr.town || addr.municipality || addr.county || ciudad;
            const nombreCorto = calleNombre 
              ? `${calleNombre}${ciudadNombre ? `, ${ciudadNombre}` : ''}`
              : item.display_name.split(',').slice(0, 3).join(',');

            return {
              nombreCompleto: item.display_name,
              nombreCorto,
              coordenadas: {
                lat: Number(parseFloat(item.lat).toFixed(6)),
                lng: Number(parseFloat(item.lon).toFixed(6))
              },
              calle: addr.road,
              barrio: addr.neighbourhood || addr.suburb,
              ciudad: ciudadNombre,
              provincia: addr.state
            };
          });

          GEOCODE_CACHE[cacheKey] = resultados;
          return resultados;
        }
      } catch (err) {
        // Continuar con la siguiente query candidata
      }
    }

    return [];
  }

  /**
   * Geocodificación inversa: Coordenadas GPS -> Nombre de calle y sector en Ecuador
   */
  static async geocodificarInversoEcuador(coords: CoordenadasGPS): Promise<string | null> {
    const lat = Number(coords.lat.toFixed(5));
    const lng = Number(coords.lng.toFixed(5));
    const key = `${lat},${lng}`;

    if (REVERSE_CACHE[key]) {
      return REVERSE_CACHE[key];
    }

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'es-EC,es;q=0.9',
          'User-Agent': 'GrupoSaraMarketplace/1.0 (constructorasara@gmail.com)'
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) return null;
      const data = await response.json();
      if (data && data.address) {
        const a = data.address;
        const partes: string[] = [];
        if (a.road) partes.push(a.road);
        if (a.neighbourhood && a.neighbourhood !== a.road) partes.push(a.neighbourhood);
        if (a.suburb && a.suburb !== a.neighbourhood) partes.push(a.suburb);
        if (a.city || a.town || a.county) partes.push(a.city || a.town || a.county);

        const direccionGenerada = partes.length > 0 
          ? partes.join(', ')
          : data.display_name?.split(',').slice(0, 3).join(', ') || null;

        if (direccionGenerada) {
          REVERSE_CACHE[key] = direccionGenerada;
          return direccionGenerada;
        }
      }
    } catch (e) {
      // Ignorar timeout o red
    }
    return null;
  }

  /**
   * Geocodificación inversa detallada: Devuelve calle y ciudad separadas
   */
  static async geocodificarInversoDetallado(coords: CoordenadasGPS): Promise<ResultadoGeocodificacionInversa | null> {
    const lat = Number(coords.lat.toFixed(5));
    const lng = Number(coords.lng.toFixed(5));
    const key = `${lat},${lng}`;

    if (REVERSE_DETALLADO_CACHE[key]) {
      return REVERSE_DETALLADO_CACHE[key];
    }

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'es-EC,es;q=0.9',
          'User-Agent': 'GrupoSaraMarketplace/1.0 (constructorasara@gmail.com)'
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) return null;
      const data = await response.json();
      if (data && data.address) {
        const a = data.address;
        const calle = a.road || a.pedestrian || a.suburb || '';
        const ciudad = a.city || a.town || a.municipality || a.county || 'Ecuador';
        const barrio = a.neighbourhood || a.suburb || '';

        const resultado: ResultadoGeocodificacionInversa = {
          calle,
          ciudad,
          barrio,
          direccionCompleta: [calle, barrio, ciudad].filter(Boolean).join(', ')
        };

        REVERSE_DETALLADO_CACHE[key] = resultado;
        return resultado;
      }
    } catch (e) {
      // Ignorar timeout o red
    }
    return null;
  }
}
