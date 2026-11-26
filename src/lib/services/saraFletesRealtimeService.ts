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

export interface DriverBankConfig {
  plate: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  holderName: string;
  holderId: string;
  phone: string;
  email: string;
  deunaPhone?: string;
  payphonePhone?: string;
  guayaquilAccount?: string;
  qrDeunaImage?: string;
  qrPayphoneImage?: string;
  qrGuayaquilImage?: string;
  updatedAt?: string;
}

export interface ViajeHistorialItem {
  id: string | number;
  fleteId?: string;
  cliente: string;
  route: string;
  embarque: string;
  llegada: string;
  tiempo: string;
  tarifa: number;
  comision: number;
  utilidad: number;
  metodoPago?: string;
  calificacion?: number;
  comentario?: string;
  placa?: string;
}

export const DEFAULT_VIAJES_HISTORIAL: ViajeHistorialItem[] = [
  { 
    id: 1, 
    fleteId: 'FLT-8821', 
    cliente: 'Ing. Marco Vivanco (Constructora SARA)', 
    route: 'MAtecons Chile -> El Dorado (Cariamanga)', 
    embarque: '12 Oct 2026, 14:00', 
    llegada: '12 Oct 2026, 14:15', 
    tiempo: '15 min', 
    tarifa: 3.50, 
    comision: 0.18, 
    utilidad: 3.32, 
    metodoPago: 'Efectivo', 
    calificacion: 5 
  },
  { 
    id: 2, 
    fleteId: 'FLT-7649', 
    cliente: 'Arq. Elena Rodríguez (Obra San Vicente)', 
    route: 'Centro Cariamanga -> Vía Colaisaca', 
    embarque: '10 Oct 2026, 09:15', 
    llegada: '10 Oct 2026, 09:45', 
    tiempo: '30 min', 
    tarifa: 8.00, 
    comision: 0.40, 
    utilidad: 7.60, 
    metodoPago: 'Transferencia Banco Pichincha', 
    calificacion: 5 
  },
  { 
    id: 3, 
    fleteId: 'FLT-6102', 
    cliente: 'Ferretería Disensa Cariamanga', 
    route: 'Terminal Terrestre -> San Vicente', 
    embarque: '08 Oct 2026, 16:30', 
    llegada: '08 Oct 2026, 16:50', 
    tiempo: '20 min', 
    tarifa: 4.50, 
    comision: 0.23, 
    utilidad: 4.27, 
    metodoPago: 'Deuna QR', 
    calificacion: 5 
  },
];

export const DEFAULT_DRIVER_BANK_CONFIG: DriverBankConfig = {
  plate: 'PCX-4590',
  bankName: 'Banco Pichincha',
  accountType: 'Cuenta de Ahorros',
  accountNumber: '2208741904',
  holderName: 'David Sarango Malacatus',
  holderId: '1103849182',
  phone: '0995544332',
  email: 'david.sarango@gruposara.com',
  deunaPhone: '0995544332',
  payphonePhone: '0995544332',
  guayaquilAccount: '1098452109'
};

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
      clienteNombre?: string;
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
  | { type: 'FLETE_CALIFICADO'; payload: { fleteId: string; driverName: string; plate: string; rating: number; comentario?: string; tags?: string[]; metodoPago?: string; montoTotal?: number } }
  | { type: 'ACTUALIZAR_GPS_CONDUCTOR'; payload: ConductorEstadoRealtime }
  | { type: 'PLANES_ACTUALIZADOS'; payload: PlanConfigItem[] }
  | { type: 'DEBITO_COMISION_CONDUCTOR'; payload: { plate: string; driverName: string; montoDebitado: number; nuevoSaldo: number; fleteId: string } }
  | { type: 'SOS_DISPARADO'; payload: SOSAlertData }
  | { type: 'SOS_CANCELADO'; payload: { fleteId?: string; plate: string } }
  | { type: 'EPOD_REGISTRADO'; payload: ProofOfDeliveryData }
  | { type: 'RUMBO_A_CASA_CAMBIADO'; payload: { plate: string; activo: boolean; cantonDestino?: string; coordsDestino?: [number, number] } }
  | { type: 'DATOS_BANCARIOS_CONDUCTOR_ACTUALIZADOS'; payload: DriverBankConfig };

const CHANNEL_NAME = 'sara_fletes_radar_bus_v1';
const STORAGE_PREFIX = 'sara_fletes_rt_';

export class SaraFletesRealtimeService {
  private static channel: BroadcastChannel | null = null;
  private static listeners: Set<(event: FletesRealtimeEvent) => void> = new Set();
  private static isInitialized = false;
  private static supabaseRealtimeChannel: any = null;
  private static isSupabaseInitAttempted = false;
  private static pendingRemoteQueue: FletesRealtimeEvent[] = [];
  private static recentEventKeys: Map<string, number> = new Map();

  private static getEventDedupKey(event: FletesRealtimeEvent): string | null {
    const p: any = (event as any).payload;
    if (!p) return null;
    if (event.type === 'NUEVA_SOLICITUD_FLETE' && p.id) {
      return `${event.type}:${p.id}:${p.timestamp || ''}`;
    }
    if ((event.type === 'NUEVA_OFERTA_CONDUCTOR' || event.type === 'CHOFER_ACEPTO_FLETE' || event.type === 'CLIENTE_ACEPTO_CONDUCTOR') && p.fleteId) {
      return `${event.type}:${p.fleteId}:${p.plate || p.id || ''}`;
    }
    return null;
  }

  private static isDuplicateEvent(event: FletesRealtimeEvent): boolean {
    const key = this.getEventDedupKey(event);
    if (!key) return false;
    const now = Date.now();
    const prev = this.recentEventKeys.get(key);
    if (prev && now - prev < 2500) return true;
    this.recentEventKeys.set(key, now);
    if (this.recentEventKeys.size > 100) {
      const oldest = this.recentEventKeys.keys().next().value;
      if (oldest) this.recentEventKeys.delete(oldest);
    }
    return false;
  }

  private static flushRemoteQueue() {
    if (!this.supabaseRealtimeChannel || this.pendingRemoteQueue.length === 0) return;
    const queue = [...this.pendingRemoteQueue];
    this.pendingRemoteQueue = [];
    for (const evt of queue) {
      try {
        this.supabaseRealtimeChannel.send({
          type: 'broadcast',
          event: 'fletes_event',
          payload: evt
        });
      } catch {
        // Ignorar fallo individual
      }
    }
  }

  private static initSupabaseRealtime() {
    if (typeof window === 'undefined' || this.isSupabaseInitAttempted) return;
    this.isSupabaseInitAttempted = true;

    try {
      import('../supabase/client')
        .then(({ createClient }) => {
          try {
            const supabase = createClient();
            if (!supabase || !supabase.channel) {
              this.isSupabaseInitAttempted = false;
              return;
            }

            const ch = supabase.channel('sara_fletes_radar_global', {
              config: { broadcast: { self: false, ack: false } }
            });

            ch.on('broadcast', { event: 'fletes_event' }, (payload: any) => {
              const evt = payload?.payload || payload;
              if (evt && evt.type && !this.isDuplicateEvent(evt as FletesRealtimeEvent)) {
                this.notifyListeners(evt as FletesRealtimeEvent);
              }
            });

            ch.subscribe((status: string) => {
              if (status === 'SUBSCRIBED') {
                this.supabaseRealtimeChannel = ch;
                this.flushRemoteQueue();
              } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                this.supabaseRealtimeChannel = null;
                this.isSupabaseInitAttempted = false;
                setTimeout(() => this.initSupabaseRealtime(), 3000);
              }
            });
          } catch (initErr) {
            this.isSupabaseInitAttempted = false;
            console.warn('[REALTIME] Supabase Realtime fallback local:', initErr);
          }
        })
        .catch(() => {
          this.isSupabaseInitAttempted = false;
        });
    } catch {
      this.isSupabaseInitAttempted = false;
    }
  }

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
    this.initSupabaseRealtime();

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

    // 0. Notificar inmediatamente a los listeners locales de la ventana actual
    this.notifyListeners(event);

    // 1. Enviar a través de BroadcastChannel nativo a otras pestañas
    const chan = this.getChannel();
    if (chan) {
      try {
        chan.postMessage(event);
      } catch (e) {
        console.warn('Error postMessage en BroadcastChannel:', e);
      }
    }

    // 2. Persistir y disparar storage event como fallback garantizado con nonce único
    try {
      const storageKey = `${STORAGE_PREFIX}last_event`;
      const eventWithNonce = {
        ...event,
        _realtimeNonce: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      };
      localStorage.setItem(storageKey, JSON.stringify(eventWithNonce));

      // Guardar estados persistentes según el tipo
      if (event.type === 'NUEVA_SOLICITUD_FLETE') {
        localStorage.setItem(`${STORAGE_PREFIX}active_request`, JSON.stringify(event.payload));
      } else if (event.type === 'CHOFER_ACEPTO_FLETE') {
        const existing = localStorage.getItem(`${STORAGE_PREFIX}active_request`);
        let mergedReq: any = {
          id: event.payload.fleteId,
          status: 'accepted',
          assignedDriverName: event.payload.driverName,
          assignedPlate: event.payload.plate,
          codigoAcceso: event.payload.codigoAcceso,
          tarifaOfertadaUSD: event.payload.precio
        };
        if (existing) {
          try {
            const parsed = JSON.parse(existing);
            mergedReq = {
              ...parsed,
              status: 'accepted',
              assignedDriverName: event.payload.driverName,
              assignedPlate: event.payload.plate,
              codigoAcceso: event.payload.codigoAcceso || parsed.codigoAcceso,
              precioAcordado: event.payload.precio || parsed.tarifaOfertadaUSD
            };
          } catch {}
        }
        localStorage.setItem(`${STORAGE_PREFIX}active_request`, JSON.stringify(mergedReq));
        localStorage.setItem(`${STORAGE_PREFIX}accepted_dispatch`, JSON.stringify({
          fleteId: event.payload.fleteId,
          driverName: event.payload.driverName,
          plate: event.payload.plate,
          codigoAcceso: event.payload.codigoAcceso,
          precioAcordado: event.payload.precio,
          origen: mergedReq.origen,
          destino: mergedReq.destino,
          coordsOrigen: mergedReq.coordsOrigen,
          coordsDestino: mergedReq.coordsDestino,
          coordenadasRuta: mergedReq.coordenadasRuta,
          distanciaKm: mergedReq.distanciaKm,
          duracionMinutos: mergedReq.duracionMinutos,
          material: mergedReq.material,
          pesoTon: mergedReq.pesoTon
        }));
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

    // 3. Enviar a través de Supabase Realtime Channel para sincronización entre dispositivos remotos
    // Si el canal aún está conectando, encolar para envío inmediato al completar SUBSCRIBED (cero pérdidas)
    if (this.supabaseRealtimeChannel) {
      try {
        this.supabaseRealtimeChannel.send({
          type: 'broadcast',
          event: 'fletes_event',
          payload: event
        });
      } catch (wsErr) {
        console.warn('[REALTIME] Reencolando envío remoto:', wsErr);
        this.pendingRemoteQueue.push(event);
      }
    } else {
      this.pendingRemoteQueue.push(event);
      if (this.pendingRemoteQueue.length > 25) {
        this.pendingRemoteQueue.shift();
      }
      this.initSupabaseRealtime();
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

  /**
   * Guarda y sincroniza la configuración de cuentas bancarias y QRs del conductor
   */
  static saveDriverBankConfig(config: DriverBankConfig) {
    if (typeof window === 'undefined') return;
    try {
      const cleanPlate = (config.plate || 'PCX-4590').trim().toUpperCase();
      localStorage.setItem(`${STORAGE_PREFIX}bank_${cleanPlate}`, JSON.stringify(config));
      // También guardar como default global del transportista activo
      localStorage.setItem(`${STORAGE_PREFIX}active_driver_bank`, JSON.stringify(config));
    } catch (e) {
      console.warn('Error guardando bank config en localStorage:', e);
    }

    // Emitir evento reactivo a todos los oyentes (clientes, fletes modal, etc.)
    this.emit({
      type: 'DATOS_BANCARIOS_CONDUCTOR_ACTUALIZADOS',
      payload: config
    });
  }

  /**
   * Obtiene la configuración de cuentas bancarias y QRs del conductor
   */
  static getDriverBankConfig(plate?: string): DriverBankConfig {
    if (typeof window === 'undefined') {
      return { ...DEFAULT_DRIVER_BANK_CONFIG, plate: plate || 'PCX-4590' };
    }
    try {
      if (plate) {
        const cleanPlate = plate.trim().toUpperCase();
        const data = localStorage.getItem(`${STORAGE_PREFIX}bank_${cleanPlate}`);
        if (data) return JSON.parse(data);
      }
      const activeData = localStorage.getItem(`${STORAGE_PREFIX}active_driver_bank`);
      if (activeData) return JSON.parse(activeData);
    } catch {}
    return { ...DEFAULT_DRIVER_BANK_CONFIG, plate: plate || 'PCX-4590' };
  }

  /**
   * Obtiene la lista del historial de viajes completados para un conductor específico
   */
  static getCompletedTrips(plate?: string): ViajeHistorialItem[] {
    if (typeof window === 'undefined') return DEFAULT_VIAJES_HISTORIAL;
    try {
      const cleanPlate = plate ? plate.trim().toUpperCase() : 'PCX-4590';
      const driverData = localStorage.getItem(`${STORAGE_PREFIX}viajes_historial_${cleanPlate}`);
      if (driverData) {
        const parsed = JSON.parse(driverData);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const globalData = localStorage.getItem(`${STORAGE_PREFIX}viajes_historial_global`);
      if (globalData) {
        const parsed = JSON.parse(globalData);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error leyendo historial de viajes:', e);
    }
    return DEFAULT_VIAJES_HISTORIAL;
  }

  /**
   * Guarda un nuevo viaje completado en el historial persistente
   */
  static saveCompletedTrip(plate: string | undefined, trip: ViajeHistorialItem) {
    if (typeof window === 'undefined') return;
    try {
      const cleanPlate = plate ? plate.trim().toUpperCase() : 'PCX-4590';
      const existing = this.getCompletedTrips(cleanPlate);
      // Evitar duplicados por id o fleteId
      const filtered = existing.filter(v => v.id !== trip.id && (!trip.fleteId || v.fleteId !== trip.fleteId));
      const updated = [trip, ...filtered];

      localStorage.setItem(`${STORAGE_PREFIX}viajes_historial_${cleanPlate}`, JSON.stringify(updated));
      localStorage.setItem(`${STORAGE_PREFIX}viajes_historial_global`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error guardando viaje en historial:', e);
    }
  }

  /**
   * Actualiza la calificación o método de pago de un viaje en el historial tras el feedback del cliente
   */
  static updateTripFeedback(fleteId: string, rating: number, comentario?: string, metodoPago?: string) {
    if (typeof window === 'undefined' || !fleteId) return;
    try {
      const allKeys = Object.keys(localStorage).filter(k => k.startsWith(`${STORAGE_PREFIX}viajes_historial_`));
      for (const k of allKeys) {
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          let updated = false;
          const newArr = parsed.map((item: ViajeHistorialItem) => {
            if (item.fleteId === fleteId || item.id === fleteId) {
              updated = true;
              return {
                ...item,
                calificacion: rating,
                comentario: comentario || item.comentario,
                metodoPago: metodoPago || item.metodoPago
              };
            }
            return item;
          });
          if (updated) {
            localStorage.setItem(k, JSON.stringify(newArr));
          }
        }
      }
    } catch (e) {
      console.warn('Error actualizando feedback en historial:', e);
    }
  }
}
