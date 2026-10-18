// ============================================================================
// SERVICIO DE GESTIÓN ADMINISTRATIVA: SARA CONSTRUCTORA
// Gestión de Planes SaaS y Clientes Suscritos al Módulo Constructora
// ============================================================================

export interface PlanConstructora {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  precioMensual: number;
  precioAnual: number;
  limiteProyectos: number | 'ILIMITADO';
  limiteUsuarios: number | 'ILIMITADO';
  almacenamientoGb: number;
  modulosIncluidos: string[];
  esRecomendado: boolean;
  activo: boolean;
  orden: number;
  colorBadge?: string;
}

export interface ClienteSuscritoConstructora {
  id: string;
  razonSocialOProfesional: string;
  tipoPerfil: 'Ingeniero Civil' | 'Arquitecto' | 'Constructora / Contratista' | 'Técnico de Apoyo' | 'Empresa Inmobiliaria';
  rucOCedula: string;
  email: string;
  telefono: string;
  ciudad: string;
  planId: string;
  planNombre: string;
  cicloFacturacion: 'MENSUAL' | 'ANUAL';
  montoCobrado: number;
  fechaInicio: string;
  fechaVencimiento: string;
  estado: 'ACTIVO' | 'PENDIENTE_PAGO' | 'SUSPENDIDO' | 'VENCIDO';
  proyectosEnUso: number;
  usuariosEnUso: number;
  comprobantePagoUrl?: string;
  notasAdmin?: string;
}

const STORAGE_KEY_PLANES = 'sara_admin_constructora_planes';
const STORAGE_KEY_CLIENTES = 'sara_admin_constructora_clientes';

// Catálogo Inicial de Planes para SARA-CONSTRUCTORA
const PLANES_INICIALES: PlanConstructora[] = [
  {
    id: 'PLAN-CONST-01',
    codigo: 'BASICO-INDEPENDIENTE',
    nombre: 'Plan Constructor Independiente',
    descripcion: 'Diseñado para ingenieros residentes, arquitectos independientes y directores de obras individuales.',
    precioMensual: 29.00,
    precioAnual: 290.00,
    limiteProyectos: 3,
    limiteUsuarios: 2,
    almacenamientoGb: 5,
    modulosIncluidos: [
      'Gestión de 3 Obras Simultáneas',
      'Fiscalización Fotográfica de Avances',
      'Gestor Documental (Planos & PDFs)',
      'Directorio de Clientes & Proveedores',
      'Kardex Básico de Materiales',
      'Soporte Técnico por Email'
    ],
    esRecomendado: false,
    activo: true,
    orden: 1,
    colorBadge: 'slate'
  },
  {
    id: 'PLAN-CONST-02',
    codigo: 'PRO-PYME',
    nombre: 'Plan Constructora Pro / PyME',
    descripcion: 'La solución estándar de alto impacto para constructoras medianas, consultoras y contratistas de obra civil.',
    precioMensual: 79.00,
    precioAnual: 790.00,
    limiteProyectos: 10,
    limiteUsuarios: 8,
    almacenamientoGb: 30,
    modulosIncluidos: [
      'Gestión de hasta 10 Obras Simultáneas',
      'Kardex Multibodega Central & Frentes (Método CPP)',
      'Checklist de Recepción Física con Actas de Devolución',
      'Three-Way Match SRI (XML vs OC vs Bodega)',
      'Nómina CICS / IESS & Tareo Diario en Obra',
      'Procuramiento Predictivo & Cotizador B2B',
      'Integración con Red SARA Talento Humano',
      'Exportación Oficial a Excel & PDF'
    ],
    esRecomendado: true,
    activo: true,
    orden: 2,
    colorBadge: 'amber'
  },
  {
    id: 'PLAN-CONST-03',
    codigo: 'CORP-HOLDING',
    nombre: 'Plan Corporativo / Holding de Obra Civil',
    descripcion: 'Potencia ilimitada para empresas constructoras grandes, consorcios viales y holdings inmobiliarios.',
    precioMensual: 189.00,
    precioAnual: 1890.00,
    limiteProyectos: 'ILIMITADO',
    limiteUsuarios: 'ILIMITADO',
    almacenamientoGb: 150,
    modulosIncluidos: [
      'Obras y Proyectos Ilimitados en todo el Ecuador',
      'Usuarios, Residentes y Fiscalizadores Ilimitados',
      'Kardex Multibodega en Red con Transferencias Inter-obras',
      'Conciliación Automatizada Three-Way Match SRI Multi-RUC',
      'Nómina IESS Automatizada con Planillas Sectoriales',
      'Logística Pesada y Desalojo con SARA Fletes',
      'Integración BIM (IFC / glTF Cómputos Métricos)',
      'Gestor Documental Corporativo 150 GB',
      'Asesor Dedicado & SLA de 2 Horas'
    ],
    esRecomendado: false,
    activo: true,
    orden: 3,
    colorBadge: 'emerald'
  }
];

// Clientes Iniciales Suscritos a SARA-CONSTRUCTORA
const CLIENTES_INICIALES: ClienteSuscritoConstructora[] = [
  {
    id: 'CLI-CONST-001',
    razonSocialOProfesional: 'Constructora Sarango & Asociados Cía. Ltda.',
    tipoPerfil: 'Constructora / Contratista',
    rucOCedula: '1191728394001',
    email: 'contacto@constructorasarango.com',
    telefono: '099 481 2938',
    ciudad: 'Loja',
    planId: 'PLAN-CONST-02',
    planNombre: 'Plan Constructora Pro / PyME',
    cicloFacturacion: 'ANUAL',
    montoCobrado: 790.00,
    fechaInicio: '2026-01-15',
    fechaVencimiento: '2027-01-15',
    estado: 'ACTIVO',
    proyectosEnUso: 4,
    usuariosEnUso: 5,
    notasAdmin: 'Empresa contratista con proyectos residenciales en Cariamanga y Loja. Excelente récord de pago.'
  },
  {
    id: 'CLI-CONST-002',
    razonSocialOProfesional: 'Arq. Dalton Mejía Orozco',
    tipoPerfil: 'Arquitecto',
    rucOCedula: '1103849182',
    email: 'dalton.mejia@estudioarquitectura.ec',
    telefono: '098 721 0039',
    ciudad: 'Quito',
    planId: 'PLAN-CONST-01',
    planNombre: 'Plan Constructor Independiente',
    cicloFacturacion: 'MENSUAL',
    montoCobrado: 29.00,
    fechaInicio: '2026-09-01',
    fechaVencimiento: '2026-11-01',
    estado: 'ACTIVO',
    proyectosEnUso: 2,
    usuariosEnUso: 1,
    notasAdmin: 'Diseño arquitectónico y fiscalización de viviendas unifamiliares en Cumbayá.'
  },
  {
    id: 'CLI-CONST-003',
    razonSocialOProfesional: 'Consorcio Vial Loja-Catamayo & Edificaciones S.A.',
    tipoPerfil: 'Constructora / Contratista',
    rucOCedula: '1792837461001',
    email: 'gerencia@consorciovialsur.ec',
    telefono: '072 583 910',
    ciudad: 'Loja',
    planId: 'PLAN-CONST-03',
    planNombre: 'Plan Corporativo / Holding de Obra Civil',
    cicloFacturacion: 'ANUAL',
    montoCobrado: 1890.00,
    fechaInicio: '2026-03-10',
    fechaVencimiento: '2027-03-10',
    estado: 'ACTIVO',
    proyectosEnUso: 12,
    usuariosEnUso: 28,
    notasAdmin: 'Holding de infraestructura pesada. Utilizan activamente el Three-Way Match SRI y Kardex Multibodega.'
  },
  {
    id: 'CLI-CONST-004',
    razonSocialOProfesional: 'Ing. María Eugenia Calva',
    tipoPerfil: 'Ingeniero Civil',
    rucOCedula: '1104928174',
    email: 'maria.calva@ingenieriacivil.com',
    telefono: '099 123 4567',
    ciudad: 'Cuenca',
    planId: 'PLAN-CONST-02',
    planNombre: 'Plan Constructora Pro / PyME',
    cicloFacturacion: 'MENSUAL',
    montoCobrado: 79.00,
    fechaInicio: '2026-10-05',
    fechaVencimiento: '2026-11-05',
    estado: 'PENDIENTE_PAGO',
    proyectosEnUso: 1,
    usuariosEnUso: 2,
    notasAdmin: 'Registro reciente vía pasarela. Esperando confirmación de transferencia bancaria directa.'
  },
  {
    id: 'CLI-CONST-005',
    razonSocialOProfesional: 'Construcciones & Acabados del Austro C.A.',
    tipoPerfil: 'Empresa Inmobiliaria',
    rucOCedula: '0190384729001',
    email: 'administracion@austroconstrucciones.ec',
    telefono: '074 102 938',
    ciudad: 'Cuenca',
    planId: 'PLAN-CONST-01',
    planNombre: 'Plan Constructor Independiente',
    cicloFacturacion: 'MENSUAL',
    montoCobrado: 29.00,
    fechaInicio: '2026-07-01',
    fechaVencimiento: '2026-09-01',
    estado: 'VENCIDO',
    proyectosEnUso: 3,
    usuariosEnUso: 2,
    notasAdmin: 'Suscripción caducada hace 45 días. Acceso temporalmente en modo solo lectura.'
  }
];

export class ConstructoraAdminService {
  // ============================================================================
  // PLANES DE CONSTRUCTORA
  // ============================================================================
  static getPlanes(): PlanConstructora[] {
    if (typeof window === 'undefined') return PLANES_INICIALES;
    try {
      const data = localStorage.getItem(STORAGE_KEY_PLANES);
      if (data) {
        return JSON.parse(data);
      }
      localStorage.setItem(STORAGE_KEY_PLANES, JSON.stringify(PLANES_INICIALES));
      return PLANES_INICIALES;
    } catch {
      return PLANES_INICIALES;
    }
  }

  static savePlan(plan: PlanConstructora): PlanConstructora[] {
    const planes = this.getPlanes();
    const index = planes.findIndex(p => p.id === plan.id);
    let updated: PlanConstructora[];

    if (index >= 0) {
      updated = planes.map(p => (p.id === plan.id ? plan : p));
    } else {
      updated = [...planes, plan];
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_PLANES, JSON.stringify(updated));
      } catch (err) {
        console.error('Error guardando planes constructora:', err);
      }
    }
    return updated;
  }

  static deletePlan(id: string): PlanConstructora[] {
    const planes = this.getPlanes().filter(p => p.id !== id);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_PLANES, JSON.stringify(planes));
      } catch (err) {
        console.error('Error eliminando plan constructora:', err);
      }
    }
    return planes;
  }

  static togglePlanActivo(id: string): PlanConstructora[] {
    const planes = this.getPlanes().map(p => {
      if (p.id === id) {
        return { ...p, activo: !p.activo };
      }
      return p;
    });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_PLANES, JSON.stringify(planes));
      } catch (err) {
        console.error('Error alternando estado del plan:', err);
      }
    }
    return planes;
  }

  // ============================================================================
  // CLIENTES SUSCRITOS A SARA-CONSTRUCTORA
  // ============================================================================
  static getClientes(): ClienteSuscritoConstructora[] {
    if (typeof window === 'undefined') return CLIENTES_INICIALES;
    try {
      const data = localStorage.getItem(STORAGE_KEY_CLIENTES);
      if (data) {
        return JSON.parse(data);
      }
      localStorage.setItem(STORAGE_KEY_CLIENTES, JSON.stringify(CLIENTES_INICIALES));
      return CLIENTES_INICIALES;
    } catch {
      return CLIENTES_INICIALES;
    }
  }

  static saveCliente(cliente: ClienteSuscritoConstructora): ClienteSuscritoConstructora[] {
    const clientes = this.getClientes();
    const index = clientes.findIndex(c => c.id === cliente.id);
    let updated: ClienteSuscritoConstructora[];

    if (index >= 0) {
      updated = clientes.map(c => (c.id === cliente.id ? cliente : c));
    } else {
      updated = [cliente, ...clientes];
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_CLIENTES, JSON.stringify(updated));
      } catch (err) {
        console.error('Error guardando cliente constructora:', err);
      }
    }
    return updated;
  }

  static cambiarEstadoCliente(id: string, nuevoEstado: 'ACTIVO' | 'PENDIENTE_PAGO' | 'SUSPENDIDO' | 'VENCIDO'): ClienteSuscritoConstructora[] {
    const clientes = this.getClientes().map(c => {
      if (c.id === id) {
        return { ...c, estado: nuevoEstado };
      }
      return c;
    });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_CLIENTES, JSON.stringify(clientes));
      } catch (err) {
        console.error('Error actualizando estado del cliente:', err);
      }
    }
    return clientes;
  }

  static deleteCliente(id: string): ClienteSuscritoConstructora[] {
    const clientes = this.getClientes().filter(c => c.id !== id);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_CLIENTES, JSON.stringify(clientes));
      } catch (err) {
        console.error('Error eliminando cliente suscrito:', err);
      }
    }
    return clientes;
  }
}
