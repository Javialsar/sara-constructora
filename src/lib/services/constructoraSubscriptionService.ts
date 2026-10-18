// ============================================================================
// AGENTE GUARDIÁN DE SUSCRIPCIONES Y CONTROL DE ACCESO: SARA CONSTRUCTORA
// Supervisa vigencia mensual/anual, estado de pagos y bloquea módulos no autorizados
// ============================================================================

import { ConstructoraAdminService, ClienteSuscritoConstructora, PlanConstructora } from './constructoraAdminService';

export interface AccesoSubscriptionResult {
  hasAccess: boolean;
  motivoBloqueo?: 'SIN_PLAN' | 'PENDIENTE_ACTIVACION' | 'VENCIDO' | 'SUSPENDIDO';
  mensaje: string;
  cliente: ClienteSuscritoConstructora | null;
  plan: PlanConstructora | null;
  diasRestantes: number;
  horasRestantes: number;
  porcentajeVigencia: number;
}

export class ConstructoraSubscriptionService {
  /**
   * Obtiene la suscripción del usuario actual en base a su email o ID
   */
  static getSuscripcionUsuario(userEmailOrId?: string): ClienteSuscritoConstructora | null {
    const clientes = ConstructoraAdminService.getClientes();
    if (!userEmailOrId) {
      // Fallback por defecto al primer cliente activo para ambiente demo si no hay sesión
      return clientes[0] || null;
    }

    const emailNorm = userEmailOrId.toLowerCase().trim();
    const cliente = clientes.find(
      c => c.email.toLowerCase().trim() === emailNorm || c.id === userEmailOrId || c.rucOCedula === userEmailOrId
    );

    return cliente || clientes[0] || null;
  }

  /**
   * AGENTE GUARDIÁN: Verifica si el cliente tiene acceso activo a los módulos operativos (Imagen 5)
   * Reglas:
   * 1. Solo tiene acceso si estado === 'ACTIVO'.
   * 2. El mes/año inicia estrictamente desde la fecha_activacion / fecha_inicio asignada por el Admin.
   * 3. Si hoy > fechaVencimiento, el agente declara la suscripción como VENCIDA y bloquea el acceso.
   */
  static verificarAccesoModulos(userEmailOrId?: string): AccesoSubscriptionResult {
    const cliente = this.getSuscripcionUsuario(userEmailOrId);
    const planes = ConstructoraAdminService.getPlanes();

    if (!cliente) {
      return {
        hasAccess: false,
        motivoBloqueo: 'SIN_PLAN',
        mensaje: 'No tienes ningún plan de suscripción contratado. Por favor selecciona un plan en "Planes - Suscripción".',
        cliente: null,
        plan: null,
        diasRestantes: 0,
        horasRestantes: 0,
        porcentajeVigencia: 0
      };
    }

    const plan = planes.find(p => p.id === cliente.planId) || planes[1] || null;

    if (cliente.estado === 'PENDIENTE_PAGO') {
      return {
        hasAccess: false,
        motivoBloqueo: 'PENDIENTE_ACTIVACION',
        mensaje: `Tu solicitud de ${cliente.planNombre} (${cliente.cicloFacturacion}) fue recibida. El Administrador de GRUPO SARA está validando tu pago para activar tu mes de servicio.`,
        cliente,
        plan,
        diasRestantes: 0,
        horasRestantes: 0,
        porcentajeVigencia: 0
      };
    }

    if (cliente.estado === 'SUSPENDIDO') {
      return {
        hasAccess: false,
        motivoBloqueo: 'SUSPENDIDO',
        mensaje: 'Tu cuenta ha sido suspendida administrativamente. Contacta con soporte@saraconstructora.com.',
        cliente,
        plan,
        diasRestantes: 0,
        horasRestantes: 0,
        porcentajeVigencia: 0
      };
    }

    // Comprobar vigencia temporal (Fecha de vencimiento)
    const ahora = new Date().getTime();
    const vencimiento = new Date(cliente.fechaVencimiento).getTime();
    const inicio = new Date(cliente.fechaInicio).getTime();

    const diferenciaMs = vencimiento - ahora;
    const duracionTotalMs = Math.max(1, vencimiento - inicio);

    if (diferenciaMs <= 0 || cliente.estado === 'VENCIDO') {
      // Auto-actualizar estado a VENCIDO si venció el tiempo
      if (cliente.estado !== 'VENCIDO') {
        ConstructoraAdminService.cambiarEstadoCliente(cliente.id, 'VENCIDO');
      }

      return {
        hasAccess: false,
        motivoBloqueo: 'VENCIDO',
        mensaje: `Tu periodo contratado finalizó el ${cliente.fechaVencimiento}. Las opciones operativas de la constructora están temporalmente bloqueadas hasta que realices la renovación de tu plan.`,
        cliente: { ...cliente, estado: 'VENCIDO' },
        plan,
        diasRestantes: 0,
        horasRestantes: 0,
        porcentajeVigencia: 100
      };
    }

    // Suscripción Activa y Vigente
    const diasRestantes = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
    const horasRestantes = Math.ceil(diferenciaMs / (1000 * 60 * 60));
    const tiempoConsumidoMs = ahora - inicio;
    const porcentajeVigencia = Math.min(100, Math.max(0, Math.round((tiempoConsumidoMs / duracionTotalMs) * 100)));

    return {
      hasAccess: true,
      mensaje: `Plan ${cliente.planNombre} Activo. Te restan ${diasRestantes} días de operaciones ilimitadas.`,
      cliente,
      plan,
      diasRestantes,
      horasRestantes,
      porcentajeVigencia
    };
  }

  /**
   * Registra una nueva solicitud de suscripción / cambio de plan por parte del cliente
   */
  static registrarSolicitudPlan(params: {
    clienteId?: string;
    razonSocial: string;
    email: string;
    ruc: string;
    telefono: string;
    ciudad: string;
    planId: string;
    ciclo: 'MENSUAL' | 'ANUAL';
    metodoPago: 'TARJETA' | 'TRANSFERENCIA';
    comprobanteRef?: string;
    comprobanteUrl?: string;
    esActivacionInmediataDemo?: boolean;
  }): ClienteSuscritoConstructora {
    const planes = ConstructoraAdminService.getPlanes();
    const plan = planes.find(p => p.id === params.planId) || planes[0];

    const hoy = new Date();
    const diasVigencia = params.ciclo === 'ANUAL' ? 365 : 30;
    const fechaVence = new Date(hoy.getTime() + diasVigencia * 24 * 60 * 60 * 1000);

    const monto = params.ciclo === 'ANUAL' ? plan.precioAnual : plan.precioMensual;

    // Si es demo o tarjeta con auto-aprobación, se activa directamente; si es transferencia, queda PENDIENTE_PAGO
    const estadoInicial = params.esActivacionInmediataDemo || params.metodoPago === 'TARJETA' 
      ? 'ACTIVO' 
      : 'PENDIENTE_PAGO';

    const clienteActualizado: ClienteSuscritoConstructora = {
      id: params.clienteId || `CLI-CONST-${Date.now().toString().slice(-4)}`,
      razonSocialOProfesional: params.razonSocial,
      tipoPerfil: 'Constructora / Contratista',
      rucOCedula: params.ruc,
      email: params.email,
      telefono: params.telefono,
      ciudad: params.ciudad,
      planId: plan.id,
      planNombre: plan.nombre,
      cicloFacturacion: params.ciclo,
      montoCobrado: monto,
      fechaInicio: hoy.toISOString().split('T')[0],
      fechaVencimiento: fechaVence.toISOString().split('T')[0],
      estado: estadoInicial,
      proyectosEnUso: 1,
      usuariosEnUso: 1,
      comprobantePagoUrl: params.comprobanteUrl,
      notasAdmin: `Solicitud vía ${params.metodoPago}. Ref: ${params.comprobanteRef || 'En línea'}.`
    };

    ConstructoraAdminService.saveCliente(clienteActualizado);

    // Notificar reactivamente a ventanas y componentes
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('constructora_subscription_changed', {
        detail: { cliente: clienteActualizado }
      }));
    }

    return clienteActualizado;
  }

  /**
   * Activación o Renovación explícita por parte del Administrador de Grupo SARA
   * Cumple la directiva: "el mes inicia desde el día de la activación por parte del administrador"
   */
  static activarPlanPorAdmin(clienteId: string, duracionMeses: number = 1): ClienteSuscritoConstructora | null {
    const clientes = ConstructoraAdminService.getClientes();
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return null;

    const fechaHoy = new Date();
    const dias = cliente.cicloFacturacion === 'ANUAL' ? 365 : (30 * duracionMeses);
    const fechaFin = new Date(fechaHoy.getTime() + dias * 24 * 60 * 60 * 1000);

    const clienteActivado: ClienteSuscritoConstructora = {
      ...cliente,
      fechaInicio: fechaHoy.toISOString().split('T')[0],
      fechaVencimiento: fechaFin.toISOString().split('T')[0],
      estado: 'ACTIVO',
      notasAdmin: `${cliente.notasAdmin || ''}\n[${fechaHoy.toLocaleDateString()}] Aprobado y Activado por Master Admin GRUPO SARA. Ciclo de ${dias} días habilitado.`
    };

    ConstructoraAdminService.saveCliente(clienteActivado);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('constructora_subscription_changed', {
        detail: { cliente: clienteActivado }
      }));
    }

    return clienteActivado;
  }

  /**
   * Cambiar estado de suscripción por parte del Admin (suspender, vencer para pruebas, etc.)
   */
  static cambiarEstadoPorAdmin(clienteId: string, nuevoEstado: 'ACTIVO' | 'PENDIENTE_PAGO' | 'SUSPENDIDO' | 'VENCIDO'): ClienteSuscritoConstructora | null {
    const clientes = ConstructoraAdminService.getClientes();
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return null;

    const fechaHoy = new Date().toISOString().split('T')[0];
    const clienteActualizado: ClienteSuscritoConstructora = {
      ...cliente,
      estado: nuevoEstado,
      // Si se vence forzosamente, ajustar fechaVencimiento a ayer para consistencia
      ...(nuevoEstado === 'VENCIDO' ? {
        fechaVencimiento: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      } : {})
    };

    ConstructoraAdminService.saveCliente(clienteActualizado);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('constructora_subscription_changed', {
        detail: { cliente: clienteActualizado }
      }));
    }

    return clienteActualizado;
  }
}
