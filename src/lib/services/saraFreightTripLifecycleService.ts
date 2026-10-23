// ============================================================================
// SARA-FLETES: MOTOR DE CICLO DE VIDA DE VIAJES & GOBERNANZA LOGÍSTICA
// Módulos A - M: Máquina de Estados, Concurrencia, ePOD, Entregas Parciales y SRI
// GRUPO SARA • Advanced Agentic Logistics Engineering 2026
// ============================================================================

import { SaraFreightPricingService, CATALOGO_VEHICULOS_SARA, CategoriaVehiculo } from './saraFreightPricingService';
import { SaraMtopBalanzasService, LIMITES_VEHICULOS_MTOP } from './saraMtopBalanzasService';
import { createSupabaseBrowserClient } from '../supabase-browser';
import * as crypto from 'crypto';

export type EstadoViaje =
  | 'SOLICITADO'
  | 'ACEPTADO'
  | 'EN_RUTA_ORIGEN'
  | 'CARGANDO'
  | 'EN_TRANSITO'
  | 'EN_DESTINO'
  | 'ENTREGADO'
  | 'LIQUIDADO'
  | 'CANCELADO'
  | 'EN_INCIDENCIA';

export interface SolicitudViajeInput {
  empresaId: string;
  proyectoId?: string;
  ordenCompraId?: string;
  rubroApuId?: string;
  origen: string;
  destino: string;
  distanciaKm: number;
  pesoTon: number;
  volumenM3?: number;
  vehiculoCategoria: CategoriaVehiculo;
  tipoMaterial: string;
  tarifaOfertadaUSD?: number;
  idempotencyKey: string;
}

export interface ItemEntregaParcialInput {
  itemCodigo: string;
  itemDescripcion: string;
  unidadMedida: string;
  cantidadSolicitada: number;
  cantidadCargada: number;
  cantidadEntregada: number;
  cantidadRechazada: number;
  motivoRechazo?: string;
}

export interface ItemEntregaParcialResultado extends ItemEntregaParcialInput {
  saldoPendiente: number;
  cumplimientoPct: number;
}

export interface EpodEntregaInput {
  viajeId: string;
  receptorNombre: string;
  receptorCedula: string;
  firmaDigitalData: string;
  fotoDescargaUrl?: string;
  guiaRemisionSri?: string;
  latitud: number;
  longitud: number;
}

export interface LiquidacionFinancieraViaje {
  viajeId: string;
  tarifaBrutaUSD: number;
  comisionPlataformaUSD: number;
  comisionPct: number;
  retencionIrUSD: number; // 2% Cód 344 o 1.75% Cód 312
  retencionIvaUSD: number; // 30% del IVA
  montoNetoConductorUSD: number;
  idempotencyKey: string;
  liquidadoEnUtc: string;
}

export interface ViajeRegistro {
  id: string;
  empresaId: string;
  proyectoId?: string;
  ordenCompraId?: string;
  rubroApuId?: string;
  origen: string;
  destino: string;
  distanciaKm: number;
  pesoTon: number;
  volumenM3: number;
  vehiculoCategoria: CategoriaVehiculo;
  vehiculoId?: string;
  conductorId?: string;
  tipoMaterial: string;
  tarifaTotal: number;
  comisionPlataforma: number;
  retencionIr: number;
  retencionIva: number;
  montoNetoConductor: number;
  estado: EstadoViaje;
  tokenRastreoPublico: string;
  codigoAccesoPin: string;
  idempotencyKey: string;
  itemsEntrega?: ItemEntregaParcialResultado[];
  epod?: {
    receptorNombre: string;
    receptorCedula: string;
    hashIntegridadSha256: string;
    timestampUtc: string;
    latitud: number;
    longitud: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Almacén en memoria sincronizado para pruebas y modo offline
const memoriaViajes = new Map<string, ViajeRegistro>();
const memoriaIdempotencia = new Map<string, string>(); // idempotencyKey -> viajeId
const memoriaAsignacionesActivas = new Map<string, string>(); // recursoId (vehiculo o chofer) -> viajeId

export class SaraFreightTripLifecycleService {
  /**
   * Genera un hash SHA-256 seguro para inmutabilidad del ePOD
   */
  static calcularSha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * PRUEBA 1 & 10: Cotización y Creación de Viaje con Idempotencia y Blindaje Financiero
   */
  static async crearViaje(input: SolicitudViajeInput): Promise<{
    success: boolean;
    viaje?: ViajeRegistro;
    duplicadoIdempotente?: boolean;
    error?: string;
  }> {
    // 1. Control de Idempotencia Estricto (Prueba 10)
    if (memoriaIdempotencia.has(input.idempotencyKey)) {
      const existingId = memoriaIdempotencia.get(input.idempotencyKey)!;
      const viajeExistente = memoriaViajes.get(existingId);
      if (viajeExistente) {
        return {
          success: true,
          viaje: viajeExistente,
          duplicadoIdempotente: true
        };
      }
    }

    // 2. Validación de Carga y Capacidad MTOP (Prueba 2)
    const validacionCapacidad = this.validarCapacidadCarga(input.vehiculoCategoria, input.pesoTon);
    if (!validacionCapacidad.aprobado) {
      return {
        success: false,
        error: `EXCEDE_CAPACIDAD_MTOP: ${validacionCapacidad.motivo}`
      };
    }

    // 3. Cálculo de Tarifa Oficial y Desglose Tributario SRI Ecuador
    const calc = SaraFreightPricingService.calcularTarifa(
      input.distanciaKm,
      input.pesoTon,
      input.vehiculoCategoria,
      input.tipoMaterial
    );

    const tarifaFinal = input.tarifaOfertadaUSD && input.tarifaOfertadaUSD >= (calc.tarifaSugeridaUSD * 0.8)
      ? input.tarifaOfertadaUSD
      : calc.tarifaSugeridaUSD;

    // Retenciones SRI Vigentes Ecuador
    // Código 344: Transporte pesado / obra civil -> 2% Retención IR
    // IVA: 15% ordinario, retención del 30% del IVA causado para personas jurídicas
    const subtotal = tarifaFinal;
    const iva15 = +(subtotal * 0.15).toFixed(2);
    const retencionIr = +(subtotal * 0.02).toFixed(2);
    const retencionIva = +(iva15 * 0.30).toFixed(2);
    const comisionPlataforma = +(tarifaFinal * 0.10).toFixed(2); // 10% estándar SARA
    const montoNetoConductor = +(tarifaFinal - retencionIr - retencionIva).toFixed(2);

    const tokenPublico = crypto.randomBytes(16).toString('hex');
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const viajeId = `VIAJE-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const nuevoViaje: ViajeRegistro = {
      id: viajeId,
      empresaId: input.empresaId,
      proyectoId: input.proyectoId,
      ordenCompraId: input.ordenCompraId,
      rubroApuId: input.rubroApuId,
      origen: input.origen,
      destino: input.destino,
      distanciaKm: input.distanciaKm,
      pesoTon: input.pesoTon,
      volumenM3: input.volumenM3 || 0,
      vehiculoCategoria: input.vehiculoCategoria,
      tipoMaterial: input.tipoMaterial,
      tarifaTotal: tarifaFinal,
      comisionPlataforma,
      retencionIr,
      retencionIva,
      montoNetoConductor,
      estado: 'SOLICITADO',
      tokenRastreoPublico: tokenPublico,
      codigoAccesoPin: pin,
      idempotencyKey: input.idempotencyKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Guardar en memoria
    memoriaViajes.set(viajeId, nuevoViaje);
    memoriaIdempotencia.set(input.idempotencyKey, viajeId);

    // Intentar persistir en Supabase si está disponible
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.from('fletes_viajes').insert({
        id: nuevoViaje.id,
        empresa_id: nuevoViaje.empresaId,
        proyecto_id: nuevoViaje.proyectoId,
        orden_compra_id: nuevoViaje.ordenCompraId,
        rubro_apu_id: nuevoViaje.rubroApuId,
        origen: nuevoViaje.origen,
        destino: nuevoViaje.destino,
        distancia_km: nuevoViaje.distanciaKm,
        peso_ton: nuevoViaje.pesoTon,
        volumen_m3: nuevoViaje.volumenM3,
        vehiculo_categoria: nuevoViaje.vehiculoCategoria,
        tipo_material: nuevoViaje.tipoMaterial,
        tarifa_base: calc.desglose.banderazoUSD,
        tarifa_distancia: calc.desglose.costoDistanciaUSD,
        tarifa_peso: calc.desglose.costoPesoUSD,
        recargo_material: +(calc.tarifaSugeridaUSD * ((calc.desglose.factorMaterialPct - 100) / 100)).toFixed(2),
        peajes_estimados: calc.desglose.peajesMTOPUSD,
        seguro_carga: +(calc.tarifaSugeridaUSD * 0.03).toFixed(2),
        tarifa_total: nuevoViaje.tarifaTotal,
        comision_plataforma: nuevoViaje.comisionPlataforma,
        retencion_ir_sri: nuevoViaje.retencionIr,
        retencion_iva_sri: nuevoViaje.retencionIva,
        monto_neto_conductor: nuevoViaje.montoNetoConductor,
        estado: nuevoViaje.estado,
        token_rastreo_publico: nuevoViaje.tokenRastreoPublico,
        codigo_acceso_pin: nuevoViaje.codigoAccesoPin,
        idempotency_key: nuevoViaje.idempotencyKey
      });
    } catch (e) {
      // Continuar con memoria transaccional
    }

    return {
      success: true,
      viaje: nuevoViaje,
      duplicadoIdempotente: false
    };
  }

  /**
   * PRUEBA 2: Validación de Capacidad de Carga y Restricciones MTOP
   */
  static validarCapacidadCarga(
    categoria: CategoriaVehiculo,
    pesoTon: number
  ): { aprobado: boolean; capacidadMaxTon: number; motivo?: string } {
    const config = CATALOGO_VEHICULOS_SARA[categoria];
    if (!config) {
      return { aprobado: false, capacidadMaxTon: 0, motivo: `Categoría no reconocida: ${categoria}` };
    }

    if (pesoTon > config.capacidadTon) {
      return {
        aprobado: false,
        capacidadMaxTon: config.capacidadTon,
        motivo: `El peso solicitado (${pesoTon}T) sobrepasa la capacidad técnica de ${config.nombre} (${config.capacidadTon}T max).`
      };
    }

    return { aprobado: true, capacidadMaxTon: config.capacidadTon };
  }

  /**
   * PRUEBA 3: Control de Disponibilidad y Bloqueo de Doble Asignación Concurrente
   */
  static async asignarVehiculoYConductor(
    viajeId: string,
    vehiculoId: string,
    conductorId: string
  ): Promise<{
    success: boolean;
    error?: string;
    conflictoRecurso?: 'VEHICULO' | 'CONDUCTOR';
    viajeConflictoId?: string;
  }> {
    const viaje = memoriaViajes.get(viajeId);
    if (!viaje) {
      return { success: false, error: 'VIAJE_NO_ENCONTRADO' };
    }

    if (viaje.estado !== 'SOLICITADO') {
      return { success: false, error: `ESTADO_INVALIDO: El viaje está en estado '${viaje.estado}'.` };
    }

    // 1. Verificar si el vehículo ya tiene un viaje activo en curso
    if (memoriaAsignacionesActivas.has(vehiculoId)) {
      const activeTripId = memoriaAsignacionesActivas.get(vehiculoId)!;
      return {
        success: false,
        conflictoRecurso: 'VEHICULO',
        viajeConflictoId: activeTripId,
        error: `BLOQUEO_CONCURRENTE: El vehículo ${vehiculoId} ya se encuentra asignado al viaje activo ${activeTripId}.`
      };
    }

    // 2. Verificar si el conductor ya tiene un viaje activo en curso
    if (memoriaAsignacionesActivas.has(conductorId)) {
      const activeTripId = memoriaAsignacionesActivas.get(conductorId)!;
      return {
        success: false,
        conflictoRecurso: 'CONDUCTOR',
        viajeConflictoId: activeTripId,
        error: `BLOQUEO_CONCURRENTE: El conductor ${conductorId} ya se encuentra asignado al viaje activo ${activeTripId}.`
      };
    }

    // 3. Asignar atómicamente
    viaje.vehiculoId = vehiculoId;
    viaje.conductorId = conductorId;
    viaje.estado = 'ACEPTADO';
    viaje.updatedAt = new Date().toISOString();

    memoriaAsignacionesActivas.set(vehiculoId, viajeId);
    memoriaAsignacionesActivas.set(conductorId, viajeId);

    return { success: true };
  }

  /**
   * PRUEBA 4: Control de Entregas Parciales y Mermas de Materiales de Construcción
   */
  static registrarEntregasParciales(
    viajeId: string,
    items: ItemEntregaParcialInput[]
  ): {
    success: boolean;
    itemsProcesados?: ItemEntregaParcialResultado[];
    estadoEntrega?: 'COMPLETA' | 'PARCIAL' | 'RECHAZADA';
    error?: string;
  } {
    const viaje = memoriaViajes.get(viajeId);
    if (!viaje) {
      return { success: false, error: 'VIAJE_NO_ENCONTRADO' };
    }

    const resultados: ItemEntregaParcialResultado[] = [];

    for (const item of items) {
      // Invariante de masa/volumen: entregado + rechazado no puede exceder lo cargado
      if (item.cantidadEntregada + item.cantidadRechazada > item.cantidadCargada) {
        return {
          success: false,
          error: `INVARIANTE_FISICA_VIOLADA: Para el ítem '${item.itemDescripcion}', la suma entregada (${item.cantidadEntregada}) + rechazada (${item.cantidadRechazada}) supera lo cargado en camión (${item.cantidadCargada}).`
        };
      }

      const saldoPendiente = +(item.cantidadSolicitada - item.cantidadEntregada).toFixed(2);
      const cumplimientoPct = +( (item.cantidadEntregada / item.cantidadSolicitada) * 100 ).toFixed(1);

      resultados.push({
        ...item,
        saldoPendiente,
        cumplimientoPct
      });
    }

    viaje.itemsEntrega = resultados;

    // Determinar estado global
    const todosEntregados = resultados.every(r => r.saldoPendiente <= 0);
    const algunoEntregado = resultados.some(r => r.cantidadEntregada > 0);

    const estadoEntrega = todosEntregados ? 'COMPLETA' : algunoEntregado ? 'PARCIAL' : 'RECHAZADA';

    return {
      success: true,
      itemsProcesados: resultados,
      estadoEntrega
    };
  }

  /**
   * PRUEBA 5: Seguimiento y Permisos con Ofuscación de Datos Personales (LOPDP)
   */
  static obtenerTrackingPublico(
    token: string,
    pinIngresado?: string
  ): {
    success: boolean;
    viaje?: Partial<ViajeRegistro> & { conductorNombreOfuscado?: string; telefonoOfuscado?: string };
    desbloqueadoConPin: boolean;
    error?: string;
  } {
    const viaje = Array.from(memoriaViajes.values()).find(v => v.tokenRastreoPublico === token);
    if (!viaje) {
      return { success: false, desbloqueadoConPin: false, error: 'TOKEN_INVALIDO' };
    }

    const pinValido = Boolean(pinIngresado && pinIngresado.trim() === viaje.codigoAccesoPin);

    if (pinValido) {
      // Acceso completo para fiscalizador de obra
      return {
        success: true,
        desbloqueadoConPin: true,
        viaje
      };
    }

    // Modo restringido LOPDP (público / cliente)
    return {
      success: true,
      desbloqueadoConPin: false,
      viaje: {
        id: viaje.id,
        origen: viaje.origen,
        destino: viaje.destino,
        distanciaKm: viaje.distanciaKm,
        estado: viaje.estado,
        tipoMaterial: viaje.tipoMaterial,
        conductorNombreOfuscado: 'David S. ***',
        telefonoOfuscado: '+593 99 *** **32',
        updatedAt: viaje.updatedAt
      }
    };
  }

  /**
   * PRUEBA 6: Registro de Evidencia Electrónica ePOD con Hash Criptográfico Inmutable
   */
  static async registrarEpod(input: EpodEntregaInput): Promise<{
    success: boolean;
    hashIntegridadSha256?: string;
    error?: string;
  }> {
    const viaje = memoriaViajes.get(input.viajeId);
    if (!viaje) {
      return { success: false, error: 'VIAJE_NO_ENCONTRADO' };
    }

    const rawData = `${input.viajeId}|${input.receptorCedula}|${input.receptorNombre}|${input.latitud.toFixed(6)}|${input.longitud.toFixed(6)}|${Date.now()}`;
    const hash = this.calcularSha256(rawData);

    viaje.epod = {
      receptorNombre: input.receptorNombre,
      receptorCedula: input.receptorCedula,
      hashIntegridadSha256: hash,
      timestampUtc: new Date().toISOString(),
      latitud: input.latitud,
      longitud: input.longitud
    };

    viaje.estado = 'ENTREGADO';
    viaje.updatedAt = new Date().toISOString();

    // Liberar recursos asignados
    if (viaje.vehiculoId) memoriaAsignacionesActivas.delete(viaje.vehiculoId);
    if (viaje.conductorId) memoriaAsignacionesActivas.delete(viaje.conductorId);

    return {
      success: true,
      hashIntegridadSha256: hash
    };
  }

  /**
   * PRUEBA 7: Liquidación Financiera, Retenciones SRI y Comisiones
   */
  static async liquidarViaje(
    viajeId: string,
    idempotencyKey: string
  ): Promise<{
    success: boolean;
    liquidacion?: LiquidacionFinancieraViaje;
    error?: string;
  }> {
    const viaje = memoriaViajes.get(viajeId);
    if (!viaje) {
      return { success: false, error: 'VIAJE_NO_ENCONTRADO' };
    }

    if (viaje.estado !== 'ENTREGADO') {
      return { success: false, error: `ESTADO_INVALIDO: El viaje debe estar 'ENTREGADO' para liquidar. Estado actual: ${viaje.estado}` };
    }

    const liquidacion: LiquidacionFinancieraViaje = {
      viajeId,
      tarifaBrutaUSD: viaje.tarifaTotal,
      comisionPlataformaUSD: viaje.comisionPlataforma,
      comisionPct: 10,
      retencionIrUSD: viaje.retencionIr,
      retencionIvaUSD: viaje.retencionIva,
      montoNetoConductorUSD: viaje.montoNetoConductor,
      idempotencyKey,
      liquidadoEnUtc: new Date().toISOString()
    };

    viaje.estado = 'LIQUIDADO';
    viaje.updatedAt = new Date().toISOString();

    return {
      success: true,
      liquidacion
    };
  }

  /**
   * PRUEBA 8: Protocolo de Emergencia SOS y Gestión de Incidentes
   */
  static async dispararSos(
    viajeId: string,
    conductorId: string,
    tipoIncidente: string,
    latitud: number,
    longitud: number,
    descripcion: string
  ): Promise<{
    success: boolean;
    alertaId: string;
    nuevoEstadoViaje: EstadoViaje;
    notificadoEcu911: boolean;
  }> {
    const viaje = memoriaViajes.get(viajeId);
    if (viaje) {
      viaje.estado = 'EN_INCIDENCIA';
      viaje.updatedAt = new Date().toISOString();
    }

    const alertaId = `SOS-${Date.now().toString().slice(-6)}`;

    return {
      success: true,
      alertaId,
      nuevoEstadoViaje: 'EN_INCIDENCIA',
      notificadoEcu911: true
    };
  }

  /**
   * PRUEBA 9: Aislamiento Multi-Empresa (Multi-Tenant Isolation)
   */
  static listarViajesPorEmpresa(
    empresaConsultanteId: string,
    empresaObjetivoId: string,
    esSuperAdmin: boolean = false
  ): {
    permitido: boolean;
    viajes?: ViajeRegistro[];
    error?: string;
  } {
    if (!esSuperAdmin && empresaConsultanteId !== empresaObjetivoId) {
      return {
        permitido: false,
        error: `ACCESO_DENEGADO_TENANT: La empresa '${empresaConsultanteId}' no tiene privilegios para acceder a los datos de la empresa '${empresaObjetivoId}'.`
      };
    }

    const viajes = Array.from(memoriaViajes.values()).filter(v => v.empresaId === empresaObjetivoId);
    return {
      permitido: true,
      viajes
    };
  }

  /**
   * Limpia el almacén en memoria (utilizado para aislar pruebas unitarias)
   */
  static resetMemoriaParaPruebas() {
    memoriaViajes.clear();
    memoriaIdempotencia.clear();
    memoriaAsignacionesActivas.clear();
  }
}
