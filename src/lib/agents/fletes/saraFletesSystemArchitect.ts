import crypto from 'crypto';

export interface MultimodalOrderEntity {
  id: string;
  correlationId: string;
  modalidad: 'VIAJE' | 'MANDADITO' | 'FLETE' | 'RENTA';
  estado: 'SOLICITADO' | 'ACEPTADO' | 'EN_CAMINO' | 'EN_SITIO' | 'EN_TRANSITO' | 'ENTREGADO' | 'CANCELADO';
  clienteNombre: string;
  clienteTelefono: string;
  vehiculoTipo: string;
  origen: string;
  origenCoords: [number, number];
  destino: string;
  destinoCoords: [number, number];
  distanciaKm: number;
  duracionEstimadaMinutos: number;
  tarifaTotalUSD: number;
  pinSeguridad: string;
  trackingToken: string;
  idempotencyKey: string;
  detallesPaqueteOInsumo?: string;
  fechaCreacion: string;
}

export class SaraFletesSystemArchitect {
  static readonly AGENT_ID = '@Agent-SystemArchitect';

  /**
   * Genera un token aleatorio criptográfico para seguimiento seguro del cliente
   */
  static generateTrackingToken(): string {
    return 'trk_' + crypto.randomBytes(16).toString('hex');
  }

  /**
   * Genera un PIN numérico de 4 dígitos para entrega segura (ePOD)
   */
  static generatePinCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * Genera una clave de idempotencia única para prevenir cargos duplicados
   */
  static generateIdempotencyKey(cliente: string, destino: string): string {
    const raw = `${cliente}_${destino}_${Date.now()}`;
    return 'idemp_' + crypto.createHash('sha256').update(raw).digest('hex').substring(0, 24);
  }

  /**
   * Genera el Hash Criptográfico del Acta de Entrega Electrónica (ePOD)
   */
  static generateEpodHash(orderId: string, recipientName: string, pin: string, timestamp: string): string {
    const payload = `${orderId}|${recipientName}|${pin}|${timestamp}|SARA_LOGISTICS_2026`;
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  /**
   * Estructura una entidad multimodal lista para persistencia en Supabase o estado reactivo
   */
  static createOrderEntity(params: {
    modalidad: 'VIAJE' | 'MANDADITO' | 'FLETE' | 'RENTA';
    clienteNombre?: string;
    clienteTelefono?: string;
    vehiculoTipo: string;
    origen: string;
    origenCoords: [number, number];
    destino: string;
    destinoCoords: [number, number];
    distanciaKm: number;
    duracionEstimadaMinutos: number;
    tarifaTotalUSD: number;
    detalles?: string;
  }): MultimodalOrderEntity {
    const id = 'ord_' + crypto.randomUUID().substring(0, 12);
    const correlationId = 'corr_' + crypto.randomUUID().substring(0, 12);
    const pin = this.generatePinCode();
    const token = this.generateTrackingToken();
    const idemp = this.generateIdempotencyKey(params.clienteNombre || 'Cliente', params.destino);

    return {
      id,
      correlationId,
      modalidad: params.modalidad,
      estado: 'SOLICITADO',
      clienteNombre: params.clienteNombre || 'Usuario SARA',
      clienteTelefono: params.clienteTelefono || '0991234567',
      vehiculoTipo: params.vehiculoTipo,
      origen: params.origen,
      origenCoords: params.origenCoords,
      destino: params.destino,
      destinoCoords: params.destinoCoords,
      distanciaKm: params.distanciaKm,
      duracionEstimadaMinutos: params.duracionEstimadaMinutos,
      tarifaTotalUSD: params.tarifaTotalUSD,
      pinSeguridad: pin,
      trackingToken: token,
      idempotencyKey: idemp,
      detallesPaqueteOInsumo: params.detalles || 'Transporte Express Multimodal',
      fechaCreacion: new Date().toISOString()
    };
  }
}
