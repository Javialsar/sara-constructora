// ============================================================================
// TIPOS DE SINCRONIZACIÓN EN TIEMPO REAL — SARA-FLETES
// Interfaces tipadas para canales Supabase Realtime:
//   Presence (conductores online), Broadcast (GPS), Postgres Changes (viajes)
// ============================================================================

// ---------------------------------------------------------------------------
// 1. GPS & Ubicación del Conductor (Broadcast cada 3-5 s)
// ---------------------------------------------------------------------------

export interface DriverGpsPayload {
  /** UUID del conductor en tabla `conductores` */
  driverId: string;
  /** Nombre visible */
  driverName: string;
  /** Placa del vehículo activo (ej. PCX-4590) */
  plate: string;
  /** Tipo de vehículo MTOP (ej. V3A, 3S2) */
  tipoVehiculo: string;
  /** Latitud WGS-84 */
  lat: number;
  /** Longitud WGS-84 */
  lng: number;
  /** Velocidad instantánea km/h (del GPS nativo) */
  speedKmh: number;
  /** Rumbo 0-360° (0 = Norte) */
  heading: number;
  /** Precisión horizontal en metros */
  accuracy: number;
  /** Altitud m.s.n.m. (útil para Sierra/Amazonía ecuatoriana) */
  altitude: number | null;
  /** Nivel de batería 0-100 del dispositivo */
  batteryPct: number | null;
  /** Timestamp ISO-8601 UTC de la lectura del sensor */
  capturedAt: string;
  /** ID del flete activo (null si está libre) */
  activeTripId: string | null;
}

// ---------------------------------------------------------------------------
// 2. Presence — Heartbeat de Conductores Online/Offline
// ---------------------------------------------------------------------------

export interface DriverPresenceState {
  /** UUID del conductor */
  driverId: string;
  driverName: string;
  plate: string;
  tipoVehiculo: string;
  /** true si acepta solicitudes activamente */
  disponible: boolean;
  lat: number;
  lng: number;
  /** Saldo prepago USD de la billetera SARA */
  billetera: number;
  rating: number;
  /** Plan activo: vip | standard | basic */
  plan: 'vip' | 'standard' | 'basic';
  /** ISO-8601 de cuando se conectó la sesión */
  onlineAt: string;
  /** Última actualización de heartbeat (ISO-8601) */
  lastHeartbeat: string;
}

export interface PresenceJoinEvent {
  key: string;
  currentPresences: DriverPresenceState[];
  newPresences: DriverPresenceState[];
}

export interface PresenceLeaveEvent {
  key: string;
  currentPresences: DriverPresenceState[];
  leftPresences: DriverPresenceState[];
}

// ---------------------------------------------------------------------------
// 3. Estado del Viaje (Postgres Changes en `fletes_solicitudes`)
// ---------------------------------------------------------------------------

export type TripStatus =
  | 'searching'
  | 'driver_offered'
  | 'accepted'
  | 'en_route_to_pickup'
  | 'at_pickup'
  | 'loading'
  | 'in_transit'
  | 'at_delivery'
  | 'unloading'
  | 'completed'
  | 'cancelled';

export interface TripRealtimeRow {
  id: string;
  origen: string;
  destino: string;
  material: string | null;
  peso_ton: number | null;
  tarifa: number;
  status: TripStatus;
  codigo_acceso: string;
  conductor_id: string | null;
  conductor_nombre: string | null;
  placa: string | null;
  coords_origen: [number, number] | null;
  coords_destino: [number, number] | null;
  eta_minutos: number | null;
  created_at: string;
  updated_at: string;
}

export interface PostgresChangePayload<T = TripRealtimeRow> {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: Partial<T>;
  errors: string[] | null;
}

// ---------------------------------------------------------------------------
// 4. Notificaciones Push de Viaje (Broadcast)
// ---------------------------------------------------------------------------

export type TripNotificationType =
  | 'NUEVA_SOLICITUD'
  | 'OFERTA_RECIBIDA'
  | 'CONDUCTOR_ASIGNADO'
  | 'VIAJE_INICIADO'
  | 'LLEGADA_ESTIMADA'
  | 'VIAJE_COMPLETADO'
  | 'VIAJE_CANCELADO'
  | 'SOS_EMERGENCIA'
  | 'EPOD_FIRMADO'
  | 'CALIFICACION_RECIBIDA';

export interface TripNotification {
  id: string;
  type: TripNotificationType;
  tripId: string;
  title: string;
  body: string;
  /** Datos adicionales específicos del tipo */
  data: Record<string, unknown>;
  /** ISO-8601 */
  timestamp: string;
  /** Destinatario: driverId, clientId o '*' para broadcast global */
  target: string;
}

// ---------------------------------------------------------------------------
// 5. Nombres de canales Supabase Realtime
// ---------------------------------------------------------------------------

/** Prefijo de todos los canales SARA-FLETES */
export const FLETES_CHANNEL_PREFIX = 'sara-fletes' as const;

/** Canal de broadcast para posiciones GPS de todos los conductores */
export const GPS_BROADCAST_CHANNEL = `${FLETES_CHANNEL_PREFIX}:gps` as const;

/** Canal Presence para heartbeat de conductores online */
export const PRESENCE_CHANNEL = `${FLETES_CHANNEL_PREFIX}:presence` as const;

/** Canal de notificaciones push por viaje: `sara-fletes:trip:{tripId}` */
export function tripNotificationChannel(tripId: string): string {
  return `${FLETES_CHANNEL_PREFIX}:trip:${tripId}`;
}

/** Canal global de notificaciones del radar de fletes */
export const RADAR_NOTIFICATION_CHANNEL = `${FLETES_CHANNEL_PREFIX}:radar` as const;

// ---------------------------------------------------------------------------
// 6. Configuración de reconexión
// ---------------------------------------------------------------------------

export interface ReconnectionConfig {
  /** Máximo de intentos antes de pausa larga (default: 10) */
  maxRetries: number;
  /** Delay base en ms para backoff exponencial (default: 1000) */
  baseDelayMs: number;
  /** Delay máximo cap en ms (default: 30000) */
  maxDelayMs: number;
  /** Factor de multiplicación (default: 2) */
  backoffMultiplier: number;
  /** Jitter aleatorio 0-1 para evitar thundering herd (default: 0.3) */
  jitter: number;
}

export const DEFAULT_RECONNECTION_CONFIG: ReconnectionConfig = {
  maxRetries: 10,
  baseDelayMs: 1_000,
  maxDelayMs: 30_000,
  backoffMultiplier: 2,
  jitter: 0.3,
};

// ---------------------------------------------------------------------------
// 7. Estado del canal para hooks
// ---------------------------------------------------------------------------

export type ChannelStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'error';

export interface ChannelState {
  status: ChannelStatus;
  /** Número de reconexiones acumuladas en la sesión */
  reconnectCount: number;
  /** Última vez que se recibió un dato (ISO-8601 o null) */
  lastMessageAt: string | null;
  /** Descripción del error si status === 'error' */
  errorMessage: string | null;
}

export const INITIAL_CHANNEL_STATE: ChannelState = {
  status: 'connecting',
  reconnectCount: 0,
  lastMessageAt: null,
  errorMessage: null,
};
