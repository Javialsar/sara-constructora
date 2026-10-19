// ============================================================================
// SERVICIO DE GESTIÓN DE EQUIPO Y ACCESOS (RBAC MULTI-TENANT)
// Permite al Representante Legal registrar y delegar accesos a:
// - Ingenieros Residentes
// - Arquitectos BIM
// - Contadores Tributarios
// - Jefes de Bodega & Kardex
// - Técnicos de Obra & Topógrafos
// - Clientes de Obra (Supervisión Exclusiva de Avance Físico)
// ============================================================================

export type RolEquipoConstructora = 
  | 'representante_legal'
  | 'ingeniero_residente'
  | 'arquitecto_bim'
  | 'contador_constructora'
  | 'bodeguero_constructora'
  | 'tecnico_apoyo_obra'
  | 'cliente_constructora';

export interface MiembroEquipoConstructora {
  id: string;
  nombreCompleto: string;
  email: string;
  cedulaORuc: string;
  telefono: string;
  rol: RolEquipoConstructora;
  rolEtiqueta: string;
  proyectoAsignado?: string;
  claveProvisional?: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
  fechaRegistro: string;
  ultimoAcceso?: string;
  empresaRuc?: string;
}

const STORAGE_KEY_EQUIPO = 'sara_constructora_equipo_miembros';

export const ROLES_CONFIG: Record<RolEquipoConstructora, { etiqueta: string; badge: string; icon: string; descripcionAcceso: string }> = {
  representante_legal: {
    etiqueta: 'Representante Legal / Gerente General',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
    icon: '👔',
    descripcionAcceso: 'Control Total de la Constructora, Suscripción SaaS y Gestión de Equipo.'
  },
  ingeniero_residente: {
    etiqueta: 'Ingeniero Residente de Obra',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
    icon: '🏗️',
    descripcionAcceso: 'Planillas de avance, cronograma, control de cuadrillas y vales de bodega.'
  },
  arquitecto_bim: {
    etiqueta: 'Arquitecto BIM & Diseñador',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300',
    icon: '📐',
    descripcionAcceso: 'Visor de modelos 3D IFC, cubicación geométrica y planos constructivos.'
  },
  contador_constructora: {
    etiqueta: 'Contador(a) Tributario',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
    icon: '💼',
    descripcionAcceso: 'Conciliación 3-Way Match SRI, retenciones fiscales y costos de adquisición.'
  },
  bodeguero_constructora: {
    etiqueta: 'Jefe de Bodega & Kardex',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300',
    icon: '📦',
    descripcionAcceso: 'Kardex Multibodega (CPP), recepción de OC, actas de devolución y despachos.'
  },
  tecnico_apoyo_obra: {
    etiqueta: 'Técnico de Apoyo & Topografía',
    badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
    icon: '🛠️',
    descripcionAcceso: 'Tareo diario IESS, levantamientos topográficos y libro de obra en campo.'
  },
  cliente_constructora: {
    etiqueta: 'Cliente de Obra (Propietario)',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300',
    icon: '🏢',
    descripcionAcceso: 'Supervisión EXCLUSIVA de avance físico %, fotos geolocalizadas y planos de su inmueble.'
  }
};

const MIEMBROS_INICIALES: MiembroEquipoConstructora[] = [
  {
    id: 'MEM-001',
    nombreCompleto: 'Ing. David Sarango M.',
    email: 'david.sarango@saraconstructora.ec',
    cedulaORuc: '1103849182',
    telefono: '099 384 1928',
    rol: 'ingeniero_residente',
    rolEtiqueta: 'Ingeniero Residente de Obra',
    proyectoAsignado: 'Torre SARA Loja (Pisos 1-8)',
    claveProvisional: 'Sara.Obra2026*',
    estado: 'ACTIVO',
    fechaRegistro: '2026-09-15',
    ultimoAcceso: 'Hoy 08:30 AM',
    empresaRuc: '1190045892001'
  },
  {
    id: 'MEM-002',
    nombreCompleto: 'Arq. Dalton Mejía C.',
    email: 'dalton.bim@saraconstructora.ec',
    cedulaORuc: '1102948172',
    telefono: '098 721 0039',
    rol: 'arquitecto_bim',
    rolEtiqueta: 'Arquitecto BIM & Diseñador',
    proyectoAsignado: 'Todos los Proyectos',
    claveProvisional: 'BimSara.2026#',
    estado: 'ACTIVO',
    fechaRegistro: '2026-09-18',
    ultimoAcceso: 'Ayer 17:45 PM',
    empresaRuc: '1190045892001'
  },
  {
    id: 'MEM-003',
    nombreCompleto: 'Lcda. Carmen Vásquez P.',
    email: 'contabilidad@saraconstructora.ec',
    cedulaORuc: '1104829103',
    telefono: '072 583 490',
    rol: 'contador_constructora',
    rolEtiqueta: 'Contador(a) Tributario',
    proyectoAsignado: 'Administración Central',
    claveProvisional: 'SriContable.2026$',
    estado: 'ACTIVO',
    fechaRegistro: '2026-09-20',
    ultimoAcceso: 'Hoy 09:15 AM',
    empresaRuc: '1190045892001'
  },
  {
    id: 'MEM-004',
    nombreCompleto: 'Sr. Segundo Poma C.',
    email: 'bodega.central@saraconstructora.ec',
    cedulaORuc: '1101928471',
    telefono: '099 812 3456',
    rol: 'bodeguero_constructora',
    rolEtiqueta: 'Jefe de Bodega & Kardex',
    proyectoAsignado: 'Bodega Matriz SARA & Frentes',
    claveProvisional: 'KardexMatriz.2026!',
    estado: 'ACTIVO',
    fechaRegistro: '2026-09-22',
    ultimoAcceso: 'Hoy 07:45 AM',
    empresaRuc: '1190045892001'
  },
  {
    id: 'MEM-005',
    nombreCompleto: 'Téc. Geovanny Narváez',
    email: 'topografia@saraconstructora.ec',
    cedulaORuc: '1105938201',
    telefono: '098 123 7890',
    rol: 'tecnico_apoyo_obra',
    rolEtiqueta: 'Técnico de Apoyo & Topografía',
    proyectoAsignado: 'Residencial Cariamanga Plaza',
    claveProvisional: 'TopoSara.2026@',
    estado: 'ACTIVO',
    fechaRegistro: '2026-10-01',
    ultimoAcceso: 'Hace 2 días',
    empresaRuc: '1190045892001'
  },
  {
    id: 'MEM-006',
    nombreCompleto: 'Dr. Patricio Cárdenas (Cliente)',
    email: 'patricio.cardenas@medicosloja.ec',
    cedulaORuc: '1102837461',
    telefono: '099 555 4321',
    rol: 'cliente_constructora',
    rolEtiqueta: 'Cliente de Obra (Propietario)',
    proyectoAsignado: 'Torre SARA Loja (Suite 402)',
    claveProvisional: 'ClienteSara.402*',
    estado: 'ACTIVO',
    fechaRegistro: '2026-10-05',
    ultimoAcceso: 'Hoy 10:10 AM',
    empresaRuc: '1190045892001'
  },
  {
    id: 'MEM-007',
    nombreCompleto: 'Ing. Sonia Benítez (Cliente)',
    email: 'sonia.benitez@empresa.com',
    cedulaORuc: '1103948572',
    telefono: '098 444 3210',
    rol: 'cliente_constructora',
    rolEtiqueta: 'Cliente de Obra (Propietario)',
    proyectoAsignado: 'Residencial Cariamanga Plaza (Villa 12)',
    claveProvisional: 'Cariamanga.Villa12!',
    estado: 'ACTIVO',
    fechaRegistro: '2026-10-10',
    ultimoAcceso: 'Ayer 15:20 PM',
    empresaRuc: '1190045892001'
  }
];

export class ConstructoraEquipoService {
  /**
   * Obtiene todos los miembros registrados en la empresa constructora
   */
  static getMiembros(): MiembroEquipoConstructora[] {
    if (typeof window === 'undefined') return MIEMBROS_INICIALES;
    try {
      const data = localStorage.getItem(STORAGE_KEY_EQUIPO);
      if (data) {
        return JSON.parse(data);
      }
      localStorage.setItem(STORAGE_KEY_EQUIPO, JSON.stringify(MIEMBROS_INICIALES));
      return MIEMBROS_INICIALES;
    } catch {
      return MIEMBROS_INICIALES;
    }
  }

  /**
   * Registra un nuevo miembro del equipo o cliente de obra
   */
  static crearMiembro(miembro: Omit<MiembroEquipoConstructora, 'id' | 'fechaRegistro'>): MiembroEquipoConstructora[] {
    const miembros = this.getMiembros();
    const nuevoId = `MEM-${String(miembros.length + 1).padStart(3, '0')}`;
    const fecha = new Date().toISOString().split('T')[0];

    const rolConf = ROLES_CONFIG[miembro.rol];

    const nuevoMiembro: MiembroEquipoConstructora = {
      ...miembro,
      id: nuevoId,
      rolEtiqueta: rolConf?.etiqueta || miembro.rolEtiqueta,
      fechaRegistro: fecha,
      claveProvisional: miembro.claveProvisional || `Sara.${Math.random().toString(36).substring(2, 7)}2026*`,
      estado: 'ACTIVO'
    };

    const actualizados = [nuevoMiembro, ...miembros];

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_EQUIPO, JSON.stringify(actualizados));
        window.dispatchEvent(new CustomEvent('constructora_equipo_changed'));
      } catch (e) {
        console.error('Error guardando miembro del equipo:', e);
      }
    }

    return actualizados;
  }

  /**
   * Cambia el estado de un usuario (ACTIVO / INACTIVO / SUSPENDIDO)
   */
  static cambiarEstado(id: string, nuevoEstado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO'): MiembroEquipoConstructora[] {
    const miembros = this.getMiembros().map(m => {
      if (m.id === id) {
        return { ...m, estado: nuevoEstado };
      }
      return m;
    });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_EQUIPO, JSON.stringify(miembros));
        window.dispatchEvent(new CustomEvent('constructora_equipo_changed'));
      } catch (e) {
        console.error('Error actualizando estado del miembro:', e);
      }
    }

    return miembros;
  }

  /**
   * Elimina un miembro del equipo
   */
  static eliminarMiembro(id: string): MiembroEquipoConstructora[] {
    const miembros = this.getMiembros().filter(m => m.id !== id);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_EQUIPO, JSON.stringify(miembros));
        window.dispatchEvent(new CustomEvent('constructora_equipo_changed'));
      } catch (e) {
        console.error('Error eliminando miembro:', e);
      }
    }

    return miembros;
  }

  /**
   * Retorna exclusivamente los clientes de obra asignados
   */
  static getClientesObra(): MiembroEquipoConstructora[] {
    return this.getMiembros().filter(m => m.rol === 'cliente_constructora');
  }

  /**
   * Retorna el conteo de usuarios activos por rol
   */
  static getConteoPorRol(): Record<string, number> {
    const miembros = this.getMiembros();
    const conteo: Record<string, number> = {};
    miembros.forEach(m => {
      conteo[m.rol] = (conteo[m.rol] || 0) + 1;
    });
    return conteo;
  }
}
