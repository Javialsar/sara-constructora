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
  status: 'searching' | 'driver_offered' | 'accepted' | 'completed' | 'cancelled';
  timestamp: number;
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
  timestamp: number;
}

export type FletesRealtimeEvent =
  | { type: 'NUEVA_SOLICITUD_FLETE'; payload: SolicitudFleteRealtime }
  | { type: 'CANCELAR_SOLICITUD_FLETE'; payload: { fleteId: string } }
  | { type: 'NUEVA_OFERTA_CONDUCTOR'; payload: OfertaConductorRealtime }
  | { type: 'RECHAZAR_OFERTA_CONDUCTOR'; payload: { fleteId: string; offerId: string; driverName: string } }
  | { type: 'CLIENTE_ACEPTO_CONDUCTOR'; payload: { fleteId: string; driverName: string; plate: string; codigoAcceso: string; precioAcordado: number } }
  | { type: 'CHOFER_ACEPTO_FLETE'; payload: { fleteId: string; driverName: string; plate: string; vehicleName: string; codigoAcceso: string; precio: number; coords: [number, number] } }
  | { type: 'FLETE_COMPLETADO'; payload: { fleteId: string; codigoAcceso: string } }
  | { type: 'ACTUALIZAR_GPS_CONDUCTOR'; payload: ConductorEstadoRealtime };

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
            localStorage.setItem(`${STORAGE_PREFIX}active_request`, JSON.stringify(parsed));
          } catch {}
        }
        localStorage.setItem(`${STORAGE_PREFIX}accepted_dispatch`, JSON.stringify(event.payload));
      } else if (event.type === 'CANCELAR_SOLICITUD_FLETE' || event.type === 'FLETE_COMPLETADO') {
        localStorage.removeItem(`${STORAGE_PREFIX}active_request`);
        localStorage.removeItem(`${STORAGE_PREFIX}accepted_dispatch`);
      } else if (event.type === 'ACTUALIZAR_GPS_CONDUCTOR') {
        localStorage.setItem(`${STORAGE_PREFIX}driver_${event.payload.plate}`, JSON.stringify(event.payload));
      }
    } catch {
      // Ignorar errores de quota de storage
    }
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
  static getAcceptedDispatch(): { fleteId: string; driverName: string; plate: string; codigoAcceso: string; precioAcordado: number } | null {
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
}
