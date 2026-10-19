/**
 * SARA Talento Requests Service
 * Servicio centralizado para la intermediación bidireccional de personal de obra
 * entre empresas constructoras / contratistas y los profesionales técnicos calificados.
 * 
 * Cumple con el protocolo de custodia institucional:
 * - Los números de contacto y correos se mantienen protegidos bajo custodia institucional
 *   mientras la solicitud está "Pendiente".
 * - Al presionar "Aceptar Plaza & Notificar Disponibilidad":
 *   1. Se le habilitan al contratista/empresa solicitante los datos de contacto directos del trabajador.
 *   2. Al trabajador le llegan los datos de contacto corporativo de la empresa para coordinar la firma del contrato.
 */

export interface EmpresaSolicitanteInfo {
  razon_social: string;
  ruc: string;
  representante: string;
  cargo: string;
  telefono: string;
  email: string;
  ciudad: string;
}

export interface TrabajadorRequeridoInfo {
  id: string;
  nombre_completo: string;
  cedula: string;
  categoria_ocupacional: string;
  calificacion: number;
  jornal_real: number;
  costo_horario: number;
  telefono: string;
  email: string;
}

export interface SolicitudPersonalEmpresa {
  id: string; // ej. REQ-TAL-104921
  empresa_solicitante: EmpresaSolicitanteInfo;
  trabajador: TrabajadorRequeridoInfo;
  obra_destino: string;
  duracion: string; // "3 meses (Fase Estructuras)", etc.
  fecha_inicio: string; // AAAA-MM-DD
  epp_requerido: boolean;
  notas_adicionales?: string;
  fecha_solicitud: string;
  estado: 'pendiente' | 'aceptado' | 'formalizado' | 'rechazado';
  fecha_aceptacion?: string;
  contactos_desbloqueados: boolean;
}

const STORAGE_KEY = 'sara_talento_solicitudes_v1';

export const SOLICITUDES_SEMILLA: SolicitudPersonalEmpresa[] = [
  {
    id: 'REQ-TAL-104921',
    empresa_solicitante: {
      razon_social: 'CONSTRUCTORA EL MIRADOR S.A.S.',
      ruc: '1190048291001',
      representante: 'Arq. Carlos Benítez',
      cargo: 'Director de Operaciones & Residencia',
      telefono: '+593 99 876 5432',
      email: 'contrataciones@elmirador.ec',
      ciudad: 'Loja, Ecuador'
    },
    trabajador: {
      id: 'tr-01',
      nombre_completo: 'Ing. Ana Gómez',
      cedula: '110482****',
      categoria_ocupacional: 'Ingeniero Residente de Obra',
      calificacion: 4.9,
      jornal_real: 42.50,
      costo_horario: 5.31,
      telefono: '+593 98 421 8973',
      email: 'ana.gomez@profesional.sara.ec'
    },
    obra_destino: 'Edificio Residencial El Mirador (Loja)',
    duracion: '3 meses (Fase Estructuras)',
    fecha_inicio: '2026-11-01',
    epp_requerido: true,
    notas_adicionales: 'Supervisión de vaciados de hormigón en losas postensadas y fiscalización de acero estructural.',
    fecha_solicitud: '2026-10-18 10:15',
    estado: 'pendiente',
    contactos_desbloqueados: false
  },
  {
    id: 'REQ-TAL-994820',
    empresa_solicitante: {
      razon_social: 'GRUPO SARA Constructora S.A.',
      ruc: '1191782341001',
      representante: 'Ing. Roberto Carrión',
      cargo: 'Gerente General de Construcciones',
      telefono: '+593 99 712 3456',
      email: 'talento@gruposara.ec',
      ciudad: 'Loja, Ecuador'
    },
    trabajador: {
      id: 'tr-03',
      nombre_completo: 'Andrea Tamayo',
      cedula: '111202****',
      categoria_ocupacional: 'Maestro de Obra General',
      calificacion: 5.0,
      jornal_real: 35.15,
      costo_horario: 4.39,
      telefono: '+593 99 123 4567',
      email: 'andrea.tamayo@profesional.sara.ec'
    },
    obra_destino: 'Conjunto Habitacional Las Acacias (Cariamanga)',
    duracion: '6 meses (Obra Gruesa)',
    fecha_inicio: '2026-10-15',
    epp_requerido: true,
    notas_adicionales: 'Liderazgo de 3 cuadrillas de encofrado y armado de zapatas aisladas.',
    fecha_solicitud: '2026-10-16 09:00',
    estado: 'aceptado',
    fecha_aceptacion: '2026-10-17 14:30',
    contactos_desbloqueados: true
  },
  {
    id: 'REQ-TAL-883719',
    empresa_solicitante: {
      razon_social: 'CIVILCORP INGENIERÍA CIA. LTDA.',
      ruc: '1792445892001',
      representante: 'Ing. Diego Alvear',
      cargo: 'Jefe de Contratación Técnica',
      telefono: '+593 98 333 4455',
      email: 'talento@civilcorp.ec',
      ciudad: 'Quito, Ecuador'
    },
    trabajador: {
      id: 'tr-02',
      nombre_completo: 'Ing. Marcelo Valarezo',
      cedula: '123456****',
      categoria_ocupacional: 'Ingeniero Eléctrico / Redes Obra',
      calificacion: 4.8,
      jornal_real: 39.12,
      costo_horario: 4.89,
      telefono: '+593 99 555 7788',
      email: 'marcelo.valarezo@profesional.sara.ec'
    },
    obra_destino: 'Torre San Sebastián (Loja Centro)',
    duracion: '1 mes (Fase Cimentación e Instalaciones)',
    fecha_inicio: '2026-11-15',
    epp_requerido: true,
    notas_adicionales: 'Diseño e instalación de acometidas subterráneas y tablero principal.',
    fecha_solicitud: '2026-10-17 16:45',
    estado: 'pendiente',
    contactos_desbloqueados: false
  }
];

export class SaraTalentoRequestsService {
  /**
   * Obtiene la lista completa de solicitudes registradas en el sistema.
   */
  static getSolicitudes(): SolicitudPersonalEmpresa[] {
    if (typeof window === 'undefined') return SOLICITUDES_SEMILLA;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SOLICITUDES_SEMILLA));
        return SOLICITUDES_SEMILLA;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.warn('Error leyendo solicitudes de talento desde localStorage:', e);
      return SOLICITUDES_SEMILLA;
    }
  }

  /**
   * Guarda la lista de solicitudes y notifica a los listeners reactivos.
   */
  private static saveSolicitudes(solicitudes: SolicitudPersonalEmpresa[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitudes));
      window.dispatchEvent(new CustomEvent('sara_talento_solicitudes_cambio', {
        detail: { solicitudes }
      }));
    } catch (e) {
      console.error('Error guardando solicitudes en localStorage:', e);
    }
  }

  /**
   * Registra una nueva solicitud formal emitida por una constructora / contratista.
   */
  static crearSolicitud(
    data: Omit<SolicitudPersonalEmpresa, 'id' | 'fecha_solicitud' | 'estado' | 'contactos_desbloqueados'>
  ): SolicitudPersonalEmpresa {
    const solicitudes = this.getSolicitudes();
    const nuevoId = `REQ-TAL-${Date.now().toString().slice(-6)}`;
    const fechaHora = new Date().toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' });

    const nuevaSolicitud: SolicitudPersonalEmpresa = {
      ...data,
      id: nuevoId,
      fecha_solicitud: fechaHora,
      estado: 'pendiente',
      contactos_desbloqueados: false
    };

    const actualizadas = [nuevaSolicitud, ...solicitudes];
    this.saveSolicitudes(actualizadas);
    return nuevaSolicitud;
  }

  /**
   * Acepta la solicitud y notifica a la empresa la disponibilidad del profesional.
   * Al ejecutarse, DESBLOQUEA BIDIRECCIONALMENTE los contactos:
   * - El contratista recibe teléfono y email del trabajador.
   * - El trabajador recibe teléfono y email de la empresa solicitante.
   */
  static aceptarSolicitud(id: string): SolicitudPersonalEmpresa | null {
    const solicitudes = this.getSolicitudes();
    const index = solicitudes.findIndex(s => s.id === id);
    if (index === -1) return null;

    const fechaAceptacion = new Date().toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' });
    const solicitudActualizada: SolicitudPersonalEmpresa = {
      ...solicitudes[index],
      estado: 'aceptado',
      fecha_aceptacion: fechaAceptacion,
      contactos_desbloqueados: true
    };

    solicitudes[index] = solicitudActualizada;
    this.saveSolicitudes(solicitudes);
    return solicitudActualizada;
  }

  /**
   * Rechaza una solicitud de personal
   */
  static rechazarSolicitud(id: string, motivo?: string): SolicitudPersonalEmpresa | null {
    const solicitudes = this.getSolicitudes();
    const index = solicitudes.findIndex(s => s.id === id);
    if (index === -1) return null;

    const solicitudActualizada: SolicitudPersonalEmpresa = {
      ...solicitudes[index],
      estado: 'rechazado',
      notas_adicionales: motivo ? `${solicitudes[index].notas_adicionales || ''} [Rechazo: ${motivo}]` : solicitudes[index].notas_adicionales,
      contactos_desbloqueados: false
    };

    solicitudes[index] = solicitudActualizada;
    this.saveSolicitudes(solicitudes);
    return solicitudActualizada;
  }

  /**
   * Marca el contrato como formalizado
   */
  static formalizarContrato(id: string): SolicitudPersonalEmpresa | null {
    const solicitudes = this.getSolicitudes();
    const index = solicitudes.findIndex(s => s.id === id);
    if (index === -1) return null;

    const solicitudActualizada: SolicitudPersonalEmpresa = {
      ...solicitudes[index],
      estado: 'formalizado',
      contactos_desbloqueados: true
    };

    solicitudes[index] = solicitudActualizada;
    this.saveSolicitudes(solicitudes);
    return solicitudActualizada;
  }

  /**
   * Obtiene el estado de requerimiento de un trabajador para la interfaz de Recursos
   */
  static obtenerEstadoRequerimientoTrabajador(trabajadorId: string): {
    estado: 'disponible' | 'requerido' | 'confirmado';
    solicitud?: SolicitudPersonalEmpresa;
  } {
    const solicitudes = this.getSolicitudes();
    const match = solicitudes.find(s => s.trabajador.id === trabajadorId && s.estado !== 'rechazado');
    if (!match) {
      return { estado: 'disponible' };
    }
    if (match.estado === 'pendiente') {
      return { estado: 'requerido', solicitud: match };
    }
    return { estado: 'confirmado', solicitud: match };
  }
}
