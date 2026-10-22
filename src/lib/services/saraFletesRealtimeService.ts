// ============================================================================
// SERVICIO DE SINCRONIZACIÓN EN TIEMPO REAL (SARA-FLETES REALTIME BUS)
// Canal bidireccional entre Cabina de Transportista (mi-perfil) y Despachador (fletes)
// Utiliza BroadcastChannel nativo + localStorage fallback para sincronización
// instantánea entre pestañas/ventanas con latencia cero.
// ============================================================================

export interface SolicitudFleteRealtime {
  id: string;
  origen: string;
  destino: string;
  material: string;
  pesoTon: number;
  tipoVehiculo: string;
  tarifaOfertadaUSD: number;
  distanciaKm: number;
  duracionMinutos: number;
  coordsOrigen: [number, number];
  coordsDestino: [number, number];
  codigoAcceso: string; // PIN de seguridad
  clienteNombre?: string;
  status: 'searching' | 'driver_offered' | 'accepted' | 'in_transit' | 'completed' | 'cancelled';
  timestamp: number;
  // Campos avanzados 2026
  coordenadasRuta?: [number, number][];
  tokenRastreo?: string; // Token público para seguimiento zero-login
  guiaRemision?: {
    claveAcceso: string;
    numeroGuia?: string;
    autorizada: boolean;
  };
  requiereEstiba?: boolean;
  peonesCount?: number;
  costoEstibaUSD?: number;
  paradasIntermedias?: Array<{
    id: string;
    direccion: string;
    coords: [number, number];
  }>;
}

export interface ProofOfDeliveryData {
  id: string;
  fleteId: string;
  codigoAcceso: string;
  receptorNombre: string;
  receptorCedula: string;
  receptorCargo: string;
  firmaBase64: string;
  fotoCargaUrl?: string;
  odometroKm?: number;
  precintoSeguridad?: string;
  observaciones?: string;
  conformidad: 'CONFORME' | 'OBSERVACION_LEVE' | 'DANOS_REPORTADOS';
  coords: [number, number];
  timestampUtc: string;
  hashCriptografico: string;
  placa: string;
  driverName: string;
}

export interface SOSAlertData {
  id: string;
  fleteId?: string;
  conductorId?: string;
  driverName: string;
  plate: string;
  lat: number;
  lng: number;
  speedKmh?: number;
  bateriaPct?: number;
  motivo: string;
  timestamp: number;
  activa: boolean;
}

export interface OfertaConductorRealtime {
  id: string;
  fleteId: string;
  driverName: string;
  plate: string;
  vehicleName: string;
  rating: number;
  tripsCount: number;
  etaMinutes: number;
  distanceMeters: number;
  offeredPrice: number;
  isCounterOffer: boolean;
  phone: string;
  coords: [number, number];
  timestamp: number;
}

export interface ConductorEstadoRealtime {
  driverId: string;
  driverName: string;
  plate: string;
  tipoVehiculo: string;
  lat: number;
  lng: number;
  disponible: boolean;
  billetera: number;
  rating: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

export interface PlanConfigItem {
  id: string; // 'vip' | 'standard' | 'basic'
  name: string;
  monthlyPrice: number; // 0.00 (Sin costo mensual, 100% comisión por viaje)
  commissionRate: number; // Porcentaje de comisión por flete
  priority: 'ALTA' | 'MEDIA' | 'BAJA'; // Jerarquía de notificación
  dispatchDelaySeconds: number; // 0s para VIP, 4s para Estándar, 8s para Básico
  benefits: string[];
}

export const DEFAULT_FLETES_PLANES: PlanConfigItem[] = [
  {
    id: 'vip',
    name: 'Plan VIP',
    monthlyPrice: 0.00,
    commissionRate: 30.0,
    priority: 'ALTA',
    dispatchDelaySeconds: 0,
    benefits: [
      'Prioridad ALTA en Notificación de Radar (Despacho Inmediato Nivel 1)',
      'Soporte 24/7 y Asistencia VIP en Obra',
      'Rutas ilimitadas a nivel nacional',
      'Mayor probabilidad de adjudicación de fletes'
    ]
  },
  {
    id: 'standard',
    name: 'Plan Estándar',
    monthlyPrice: 0.00,
    commissionRate: 20.0,
    priority: 'MEDIA',
    dispatchDelaySeconds: 4,
    benefits: [
      'Prioridad MEDIA en Notificación de Radar (Despacho Nivel 2 tras 4s)',
      'Soporte 24/7',
      'Rutas ilimitadas a nivel nacional',
      'Billetera prepago SARA recargable'
    ]
  },
  {
    id: 'basic',
    name: 'Plan Básico',
    monthlyPrice: 0.00,
    commissionRate: 10.0,
    priority: 'BAJA',
    dispatchDelaySeconds: 8,
    benefits: [
      'Prioridad BAJA en Notificación de Radar (Despacho Nivel 3 tras 8s)',
      'Soporte 24/7',
      'Rutas ilimitadas a nivel nacional',
      'Acceso a bolsa general de carga'
    ]
  }
];

export type FletesRealtimeEvent =
  | { type: 'NUEVA_SOLICITUD_FLETE'; payload: SolicitudFleteRealtime }
  | { type: 'CANCELAR_SOLICITUD_FLETE'; payload: { fleteId: string } }
  | { type: 'NUEVA_OFERTA_CONDUCTOR'; payload: OfertaConductorRealtime }
  | { type: 'RECHAZAR_OFERTA_CONDUCTOR'; payload: { fleteId: string; offerId: string; driverName: string } }
  | { type: 'CLIENTE_ACEPTO_CONDUCTOR'; payload: {
      fleteId: string;
      driverName: string;
      plate: string;
      codigoAcceso: string;
      precioAcordado: number;
      origen?: string;
      destino?: string;
      coordsOrigen?: [number, number];
      coordsDestino?: [number, number];
      coordenadasRuta?: [number, number][];
      distanciaKm?: number;
      duracionMinutos?: number;
      material?: string;
      pesoTon?: number;
    } }
  | { type: 'CHOFER_ACEPTO_FLETE'; payload: { fleteId: string; driverName: string; plate: string; vehicleName: string; codigoAcceso: string; precio: number; coords: [number, number] } }
  | { type: 'FLETE_INICIADO'; payload: { fleteId: string; codigoValidado: string; driverName: string; plate: string; startedAt: number; comisionDebitada: number; nuevoSaldo: number } }
  | { type: 'FLETE_COMPLETADO'; payload: { fleteId: string; codigoAcceso: string; driverName?: string; plate?: string; tarifaFinal?: number } }
  | { type: 'FLETE_CALIFICADO'; payload: { fleteId: string; driverName: string; plate: string; rating: number; comentario?: string; tags?: string[] } }
  | { type: 'ACTUALIZAR_GPS_CONDUCTOR'; payload: ConductorEstadoRealtime }
  | { type: 'PLANES_ACTUALIZADOS'; payload: PlanConfigItem[] }
  | { type: 'DEBITO_COMISION_CONDUCTOR'; payload: { plate: string; driverName: string; montoDebitado: number; nuevoSaldo: number; fleteId: string } }
  | { type: 'SOS_DISPARADO'; payload: SOSAlertData }
  | { type: 'SOS_CANCELADO'; payload: { fleteId?: string; plate: string } }
  | { type: 'EPOD_REGISTRADO'; payload: ProofOfDeliveryData }
  | { type: 'RUMBO_A_CASA_CAMBIADO'; payload: { plate: string; activo: boolean; cantonDestino?: string; coordsDestino?: [number, number] } };

const CHANNEL_NAME = 'sara_fletes_radar_bus_v1';
const STORAGE_PREFIX = 'sara_fletes_rt_';

export class SaraFletesRealtimeService {
  private static channel: BroadcastChannel | null = null;
  private static listeners: Set<(event: FletesRealtimeEvent) => void> = new Set();
  private static isInitialized = false;

  private static getChannel(): BroadcastChannel | null {
    if (typeof window === 'undefined') return null;
    if (!this.channel && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (msgEvent) => {
          if (msgEvent.data && msgEvent.data.type) {
            this.notifyListeners(msgEvent.data as FletesRealtimeEvent);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel no soportado, usando fallback localStorage:', e);
      }
    }
    return this.channel;
  }

  private static initStorageListener() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    window.addEventListener('storage', (e) => {
      if (e.key?.startsWith(STORAGE_PREFIX) && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.type) {
            this.notifyListeners(parsed as FletesRealtimeEvent);
          }
        } catch {
          // Ignorar errores de parseo
        }
      }
    });
  }

  private static notifyListeners(event: FletesRealtimeEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error en listener de SaraFletesRealtimeService:', err);
      }
    });
  }

  /**
   * Suscribe un callback a los eventos en tiempo real.
   * Retorna una función para cancelar la suscripción.
   */
  static subscribe(callback: (event: FletesRealtimeEvent) => void): () => void {
    if (typeof window === 'undefined') return () => {};
    this.initStorageListener();
    this.getChannel();
    this.listeners.add(callback);

    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Emite un evento a todas las pestañas/ventanas conectadas
   */
  static emit(event: FletesRealtimeEvent) {
    if (typeof window === 'undefined') return;
    this.initStorageListener();

    // 1. Enviar a través de BroadcastChannel nativo
    const chan = this.getChannel();
    if (chan) {
      try {
        chan.postMessage(event);
      } catch (e) {
        console.warn('Error postMessage en BroadcastChannel:', e);
      }
    }

    // 2. Persistir y disparar storage event como fallback garantizado
    try {
      const storageKey = `${STORAGE_PREFIX}last_event`;
      localStorage.setItem(storageKey, JSON.stringify(event));

      // Guardar estados persistentes según el tipo
      if (event.type === 'NUEVA_SOLICITUD_FLETE') {
        localStorage.setItem(`${STORAGE_PREFIX}active_request`, JSON.stringify(event.payload));
      } else if (event.type === 'CLIENTE_ACEPTO_CONDUCTOR') {
        const existing = localStorage.getItem(`${STORAGE_PREFIX}active_request`);
        if (existing) {
          try {
            const parsed = JSON.parse(existing);
            parsed.status = 'accepted';
            parsed.assignedDriverName = event.payload.driverName;
            parsed.assignedPlate = event.payload.plate;
            parsed.codigoAcceso = event.payload.codigoAcceso;
            parsed.precioAcordado = event.payload.precioAcordado;
            if (event.payload.origen) parsed.origen = event.payload.origen;
            if (event.payload.destino) parsed.destino = event.payload.destino;
            if (event.payload.coordsOrigen) parsed.coordsOrigen = event.payload.coordsOrigen;
            if (event.payload.coordsDestino) parsed.coordsDestino = event.payload.coordsDestino;
            if (event.payload.coordenadasRuta) parsed.coordenadasRuta = event.payload.coordenadasRuta;
            if (event.payload.distanciaKm) parsed.distanciaKm = event.payload.distanciaKm;
            if (event.payload.duracionMinutos) parsed.duracionMinutos = event.payload.duracionMinutos;
            localStorage.setItem(`${STORAGE_PREFIX}active_request`, JSON.stringify(parsed));
          } catch {}
        } else {
          localStorage.setItem(`${STORAGE_PREFIX}active_request`, JSON.stringify({
            id: event.payload.fleteId,
            status: 'accepted',
            assignedDriverName: event.payload.driverName,
            assignedPlate: event.payload.plate,
            codigoAcceso: event.payload.codigoAcceso,
            tarifaOfertadaUSD: event.payload.precioAcordado,
            origen: event.payload.origen || 'Punto de Carga',
            destino: event.payload.destino || 'Punto de Entrega',
            coordsOrigen: event.payload.coordsOrigen || [-4.3298, -79.5611],
            coordsDestino: event.payload.coordsDestino || [-4.3287, -79.5606],
            coordenadasRuta: event.payload.coordenadasRuta,
            distanciaKm: event.payload.distanciaKm || 1.8,
            duracionMinutos: event.payload.duracionMinutos || 5,
            material: event.payload.material || 'Carga General',
            pesoTon: event.payload.pesoTon || 1
          }));
        }
        localStorage.setItem(`${STORAGE_PREFIX}accepted_dispatch`, JSON.stringify(event.payload));
      } else if (event.type === 'FLETE_INICIADO') {
        const existing = localStorage.getItem(`${STORAGE_PREFIX}active_request`);
        if (existing) {
          try {
            const parsed = JSON.parse(existing);
            parsed.status = 'in_transit';
            parsed.codigoValidado = event.payload.codigoValidado;
            parsed.startedAt = event.payload.startedAt;
            localStorage.setItem(`${STORAGE_PREFIX}active_request`, JSON.stringify(parsed));
          } catch {}
        }
        localStorage.setItem(`${STORAGE_PREFIX}trip_in_progress`, JSON.stringify(event.payload));
      } else if (event.type === 'CANCELAR_SOLICITUD_FLETE' || event.type === 'FLETE_COMPLETADO') {
        localStorage.removeItem(`${STORAGE_PREFIX}active_request`);
        localStorage.removeItem(`${STORAGE_PREFIX}accepted_dispatch`);
        localStorage.removeItem(`${STORAGE_PREFIX}trip_in_progress`);
        if (event.type === 'FLETE_COMPLETADO') {
          localStorage.setItem(`${STORAGE_PREFIX}last_completed_trip`, JSON.stringify(event.payload));
        }
      } else if (event.type === 'ACTUALIZAR_GPS_CONDUCTOR') {
        localStorage.setItem(`${STORAGE_PREFIX}driver_${event.payload.plate}`, JSON.stringify(event.payload));
      } else if (event.type === 'PLANES_ACTUALIZADOS') {
        localStorage.setItem(`${STORAGE_PREFIX}planes_config`, JSON.stringify(event.payload));
      } else if (event.type === 'SOS_DISPARADO') {
        localStorage.setItem(`${STORAGE_PREFIX}active_sos`, JSON.stringify(event.payload));
      } else if (event.type === 'SOS_CANCELADO') {
        localStorage.removeItem(`${STORAGE_PREFIX}active_sos`);
      } else if (event.type === 'EPOD_REGISTRADO') {
        localStorage.setItem(`${STORAGE_PREFIX}epod_${event.payload.fleteId}`, JSON.stringify(event.payload));
      } else if (event.type === 'RUMBO_A_CASA_CAMBIADO') {
        localStorage.setItem(`${STORAGE_PREFIX}rumbo_casa_${event.payload.plate}`, JSON.stringify(event.payload));
      }
    } catch {
      // Ignorar errores de quota de storage
    }
  }

  /**
   * Recupera el flete actualmente en recorrido (si existe)
   */
  static getTripInProgress(): { fleteId: string; codigoValidado: string; driverName: string; plate: string; startedAt: number; comisionDebitada: number; nuevoSaldo: number } | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}trip_in_progress`);
      if (data) return JSON.parse(data);
    } catch {}
    return null;
  }

  /**
   * Obtiene la configuración de planes de suscripción de fletes sincronizada
   */
  static getPlanesConfig(): PlanConfigItem[] {
    if (typeof window === 'undefined') return DEFAULT_FLETES_PLANES;
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}planes_config`);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_FLETES_PLANES;
  }

  /**
   * Guarda y sincroniza la configuración de planes de suscripción en tiempo real
   */
  static savePlanesConfig(planes: PlanConfigItem[]) {
    this.emit({
      type: 'PLANES_ACTUALIZADOS',
      payload: planes
    });
  }

  /**
   * Recupera la solicitud de flete activa guardada en storage (si existe)
   */
  static getActiveRequest(): SolicitudFleteRealtime | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}active_request`);
      if (data) {
        const parsed = JSON.parse(data) as SolicitudFleteRealtime;
        // Solo considerar válida si tiene menos de 30 minutos
        if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
          return parsed;
        }
      }
    } catch {
      // Fallback null
    }
    return null;
  }

  /**
   * Recupera la asignación de flete aceptada por el cliente
   */
  static getAcceptedDispatch(): {
    fleteId: string;
    driverName: string;
    plate: string;
    codigoAcceso: string;
    precioAcordado: number;
    origen?: string;
    destino?: string;
    coordsOrigen?: [number, number];
    coordsDestino?: [number, number];
    coordenadasRuta?: [number, number][];
    distanciaKm?: number;
    duracionMinutos?: number;
    material?: string;
    pesoTon?: number;
  } | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}accepted_dispatch`);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return null;
  }

  /**
   * Limpia la solicitud activa
   */
  static clearActiveRequest() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}active_request`);
    } catch {
      // ignore
    }
  }

  /**
   * Obtiene la alerta de emergencia SOS activa
   */
  static getActiveSos(): SOSAlertData | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}active_sos`);
      if (data) return JSON.parse(data);
    } catch {}
    return null;
  }

  /**
   * Dispara una alerta de pánico / SOS 24/7
   */
  static emitSos(sosData: SOSAlertData) {
    this.emit({
      type: 'SOS_DISPARADO',
      payload: sosData
    });
  }

  /**
   * Cancela la alerta de emergencia SOS
   */
  static cancelSos(plate: string, fleteId?: string) {
    this.emit({
      type: 'SOS_CANCELADO',
      payload: { plate, fleteId }
    });
  }

  /**
   * Registra y emite una prueba de entrega electrónica (e-POD)
   */
  static emitProofOfDelivery(epod: ProofOfDeliveryData) {
    this.emit({
      type: 'EPOD_REGISTRADO',
      payload: epod
    });
  }

  /**
   * Obtiene la prueba de entrega electrónica (e-POD) de un flete
   */
  static getProofOfDelivery(fleteId: string): ProofOfDeliveryData | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}epod_${fleteId}`);
      if (data) return JSON.parse(data);
    } catch {}
    return null;
  }

  /**
   * Guarda o consulta el modo Rumbo a mi Casa
   */
  static getRumboACasa(plate: string): { activo: boolean; cantonDestino?: string; coordsDestino?: [number, number] } | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}rumbo_casa_${plate}`);
      if (data) return JSON.parse(data);
    } catch {}
    return null;
  }

  static setRumboACasa(plate: string, activo: boolean, cantonDestino?: string, coordsDestino?: [number, number]) {
    this.emit({
      type: 'RUMBO_A_CASA_CAMBIADO',
      payload: { plate, activo, cantonDestino, coordsDestino }
    });
  }

  /**
   * Guarda y consulta una instantánea de rastreo público (Zero-Login)
   */
  static savePublicTrackingSnapshot(token: string, payload: any) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_PREFIX}public_track_${token}`, JSON.stringify(payload));
    } catch {}
  }

  static getPublicTrackingSnapshot(token: string): any | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}public_track_${token}`);
      if (data) return JSON.parse(data);
    } catch {}
    return null;
  }
}
