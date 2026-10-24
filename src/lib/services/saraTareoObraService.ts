/**
 * SERVICIO DE GESTIÓN DE CUADRILLAS, TAREO DIARIO DE OBRA Y COSTOS APU
 * GRUPO SARA - MÓDULO SARA TALENTO HUMANO & DIRECCIÓN TÉCNICA
 * 
 * Normativa Legal y Técnica Aplicada:
 * - Código del Trabajo del Ecuador (Art. 47, 49, 55: Jornada ordinaria 8h, Horas suplementarias 50%, Extraordinarias 100%)
 * - Ley de Seguridad Social y Tablas Sectoriales IESS Construcción (Aporte patronal 12.15%, Personal 9.45%, Fondo Reserva 8.33%)
 * - Salario Básico Unificado Ecuador 2026: $482.00 USD (Acuerdo Ministerial MDT-2025-195)
 * - Seguridad y Salud en el Trabajo: Decreto Ejecutivo 255 & Resolución CD 513 IESS (EPP y Trabajo Seguro en Alturas)
 * - Análisis de Precios Unitarios (APU) bajo metodología SERCOP
 */

import { exportarAExcel, KpiReporteItem } from './exportReports';

// ============================================================================
// TIPOS E INTERFACES DEL SERVICIO
// ============================================================================

export interface ProyectoObra {
  id: string;
  codigo: string;
  nombre: string;
  ciudad: string;
  provincia: string;
  residente: string;
  fiscalizador: string;
  estado: 'En Ejecución' | 'Planificación' | 'Suspendida' | 'Finalizada';
  presupuestoManoObraUSD?: number;
}

export interface RubroApuObra {
  codigo: string;
  descripcion: string;
  unidad: string;
  costoHoraHombreApuUSD: number; // Costo por hora-hombre proyectado en APU
  rendimientoTeoricoHhPorUnidad: number;
  requiereSeguridadAlturas: boolean;
  categoria: 'Estructuras' | 'Albañilería' | 'Acabados' | 'Instalaciones' | 'Movimiento Tierras' | 'Obras Preliminares';
}

export interface IntegranteCuadrilla {
  id: string;
  trabajadorId: string;
  nombre: string;
  cedula: string;
  rol: 'Maestro Mayor' | 'Fierrero' | 'Encofrador' | 'Albañil' | 'Peón' | 'Topógrafo' | 'Soldador' | 'Electricista';
  tarifaHoraBase: number;
  telefono?: string;
  activo: boolean;
  certificacionSecap?: boolean;
}

export interface CuadrillaObra {
  id: string;
  nombre: string;
  especialidad: 'Estructuras y Hormigón' | 'Albañilería y Acabados' | 'Fierrería y Armado' | 'Encofrado' | 'Obras Preliminares';
  maestroLiderId: string;
  maestroLiderNombre: string;
  proyectoId: string;
  proyectoNombre: string;
  integrantes: IntegranteCuadrilla[];
  fechaCreacion: string;
  estado: 'Activa' | 'En Pausa' | 'Disuelta';
  rendimientoHistorico?: number; // e.g. 98.5%
}

export interface RegistroTareoDiario {
  id: string;
  proyectoId: string;
  proyectoNombre: string;
  fecha: string; // YYYY-MM-DD
  trabajadorId: string;
  nombreTrabajador: string;
  cedula: string;
  rol: string;
  cuadrillaId?: string;
  cuadrillaNombre?: string;
  rubroCodigo: string;
  rubroDescripcion: string;
  horasNormales: number; // Base 8h
  horasSuplementarias: number; // Recargo 50% (o 25% diurnas acordadas)
  tipoRecargoSuplementario: '50%' | '25%';
  horasExtraordinarias: number; // Recargo 100% feriados / fines de semana
  totalHoras: number;
  tarifaBaseHora: number;
  cumpleEPP: boolean; // Decreto 255
  cumpleSeguridadAlturas: boolean; // Res. CD 513 IESS
  observacionesSST?: string;
  validado: boolean;
  firmaFiscalizador?: {
    nombre: string;
    cargo: string;
    hashValidacion: string;
    timestamp: string;
  };
}

export interface CalculoCostoTrabajadorTareo {
  registroId: string;
  trabajadorId: string;
  nombreTrabajador: string;
  cedulaEnmascarada: string;
  rol: string;
  horasNormales: number;
  horasSuplementarias: number;
  horasExtraordinarias: number;
  totalHoras: number;
  tarifaHoraBase: number;
  // Ingresos
  ingresoNormal: number;
  ingresoSuplementario: number;
  ingresoExtraordinario: number;
  subtotalMateriaGravada: number;
  // Descuentos personales
  descuentoIessPersonal: number; // 9.45%
  netoRecibirTrabajador: number;
  // Cargas y Provisiones patronales
  aporteIessPatronal: number; // 12.15% (11.15% IESS + 0.5% SECAP + 0.5% IECE)
  provisionFondoReserva: number; // 8.33%
  provisionDecimoTercero: number; // 8.33%
  provisionDecimoCuarto: number; // SBU 2026 ($482.00) / 160h
  provisionVacaciones: number; // 4.16%
  totalCargasPatronales: number;
  // Totales de costo de empresa
  costoRealEmpresaTotal: number;
  costoHoraRealEfectiva: number;
  // Comparativa APU
  costoHoraProyectadaApu: number;
  costoTotalProyectadoApu: number;
  desviacionCostoUSD: number; // real - proyectado
  desviacionPorcentaje: number; // ((real - proyectado) / proyectado) * 100
  estadoPresupuesto: 'En Rango' | 'Sobrepresupuesto' | 'Ahorro';
  cumpleEPP: boolean;
  cumpleSeguridadAlturas: boolean;
  validado: boolean;
}

export interface ResumenJornadaTareo {
  proyectoId: string;
  proyectoNombre: string;
  fecha: string;
  totalTrabajadores: number;
  totalHorasHombre: number;
  totalHorasNormales: number;
  totalHorasSuplementarias: number;
  totalHorasExtraordinarias: number;
  totalMateriaGravada: number;
  totalNetoTrabajadores: number;
  totalAportePersonalIess: number;
  totalAportePatronalIess: number;
  totalProvisionesSociales: number;
  costoTotalRealJornada: number;
  costoTotalProyectadoApu: number;
  desviacionTotalUSD: number;
  desviacionTotalPorcentaje: number;
  estadoGeneral: 'En Rango' | 'Sobrepresupuesto' | 'Ahorro';
  porcentajeCumplimientoEpp: number;
  porcentajeSeguridadAlturas: number;
  estadoTareo: 'Borrador' | 'Validado por Fiscalización';
  validadoPor?: {
    nombre: string;
    cargo: string;
    fechaFirma: string;
    hash: string;
  };
}

// ============================================================================
// DATOS MAESTROS Y SEMILLAS INICIALES DEL ECUADOR
// ============================================================================

export const PROYECTOS_OBRA_INIT: ProyectoObra[] = [
  {
    id: 'proy-cumbaya',
    codigo: 'OBRA-UIO-01',
    nombre: 'Residencias Cumbayá (Quito)',
    ciudad: 'Quito',
    provincia: 'Pichincha',
    residente: 'Ing. Carlos Mantilla',
    fiscalizador: 'Arq. Elena Velásquez',
    estado: 'En Ejecución',
    presupuestoManoObraUSD: 85400.0
  },
  {
    id: 'proy-mirador',
    codigo: 'OBRA-CUE-02',
    nombre: 'Edificio Residencial El Mirador (Cuenca)',
    ciudad: 'Cuenca',
    provincia: 'Azuay',
    residente: 'Ing. Ana Gómez PMP',
    fiscalizador: 'Ing. Marco Sarmiento',
    estado: 'En Ejecución',
    presupuestoManoObraUSD: 124500.0
  },
  {
    id: 'proy-san-sebastian',
    codigo: 'OBRA-LJA-03',
    nombre: 'Torre San Sebastián (Loja Centro)',
    ciudad: 'Loja',
    provincia: 'Loja',
    residente: 'Ing. Byron Zambrano',
    fiscalizador: 'Ing. Diego Carrión',
    estado: 'En Ejecución',
    presupuestoManoObraUSD: 64200.0
  },
  {
    id: 'proy-cerezos',
    codigo: 'OBRA-GYE-04',
    nombre: 'Condominio Los Cerezos (Samborondón)',
    ciudad: 'Samborondón',
    provincia: 'Guayas',
    residente: 'Ing. Xavier Noboa',
    fiscalizador: 'Arq. Roberto Illingworth',
    estado: 'En Ejecución',
    presupuestoManoObraUSD: 98000.0
  }
];

export const RUBROS_APU_INIT: RubroApuObra[] = [
  {
    codigo: 'RUB-001',
    descripcion: "Hormigón en Losas f'c=240 kg/cm² (incluye vibrado y curado)",
    unidad: 'm³',
    costoHoraHombreApuUSD: 5.85,
    rendimientoTeoricoHhPorUnidad: 3.2,
    requiereSeguridadAlturas: true,
    categoria: 'Estructuras'
  },
  {
    codigo: 'RUB-002',
    descripcion: 'Replanteo y Nivelación Topográfica con Estación Total',
    unidad: 'm²',
    costoHoraHombreApuUSD: 4.80,
    rendimientoTeoricoHhPorUnidad: 0.15,
    requiereSeguridadAlturas: false,
    categoria: 'Obras Preliminares'
  },
  {
    codigo: 'RUB-003',
    descripcion: 'Mampostería de Bloque de Cemento 15x20x40 con Mortero 1:4',
    unidad: 'm²',
    costoHoraHombreApuUSD: 5.20,
    rendimientoTeoricoHhPorUnidad: 0.85,
    requiereSeguridadAlturas: true,
    categoria: 'Albañilería'
  },
  {
    codigo: 'RUB-004',
    descripcion: 'Encofrado Metálico y Estructural para Columnas y Vigas',
    unidad: 'm²',
    costoHoraHombreApuUSD: 5.60,
    rendimientoTeoricoHhPorUnidad: 1.1,
    requiereSeguridadAlturas: true,
    categoria: 'Estructuras'
  },
  {
    codigo: 'RUB-005',
    descripcion: 'Armado y Colocación de Acero Estructural B-500D (Fierrería)',
    unidad: 'kg',
    costoHoraHombreApuUSD: 5.75,
    rendimientoTeoricoHhPorUnidad: 0.04,
    requiereSeguridadAlturas: true,
    categoria: 'Estructuras'
  },
  {
    codigo: 'RUB-006',
    descripcion: 'Pintura Elastómerica Exterior e Impermeabilización de Fachadas',
    unidad: 'm²',
    costoHoraHombreApuUSD: 4.95,
    rendimientoTeoricoHhPorUnidad: 0.35,
    requiereSeguridadAlturas: true,
    categoria: 'Acabados'
  }
];

export const CUADRILLAS_INIT: CuadrillaObra[] = [
  {
    id: 'cuad-alfa',
    nombre: 'Cuadrilla Alfa - Hormigón y Fundición Estructural',
    especialidad: 'Estructuras y Hormigón',
    maestroLiderId: 'TAL-002',
    maestroLiderNombre: 'Mstr. Juan Carlos Pérez',
    proyectoId: 'proy-mirador',
    proyectoNombre: 'Edificio Residencial El Mirador (Cuenca)',
    fechaCreacion: '2026-02-10',
    estado: 'Activa',
    rendimientoHistorico: 98.4,
    integrantes: [
      {
        id: 'int-01',
        trabajadorId: 'TAL-002',
        nombre: 'Mstr. Juan Carlos Pérez',
        cedula: '0104829145',
        rol: 'Maestro Mayor',
        tarifaHoraBase: 4.80,
        telefono: '+593 99 712 3456',
        activo: true,
        certificacionSecap: true
      },
      {
        id: 'int-02',
        trabajadorId: 'TAL-101',
        nombre: 'Luis Fernando Guamán',
        cedula: '0105321872',
        rol: 'Albañil',
        tarifaHoraBase: 3.50,
        telefono: '+593 98 441 2309',
        activo: true,
        certificacionSecap: true
      },
      {
        id: 'int-03',
        trabajadorId: 'TAL-102',
        nombre: 'Manuel Antonio Criollo',
        cedula: '0103984510',
        rol: 'Peón',
        tarifaHoraBase: 3.10,
        telefono: '+593 99 123 7890',
        activo: true,
        certificacionSecap: false
      },
      {
        id: 'int-04',
        trabajadorId: 'TAL-103',
        nombre: 'José Patricio Quizhpe',
        cedula: '0106192834',
        rol: 'Peón',
        tarifaHoraBase: 3.10,
        telefono: '+593 98 901 3456',
        activo: true,
        certificacionSecap: false
      }
    ]
  },
  {
    id: 'cuad-beta',
    nombre: 'Cuadrilla Beta - Fierrería & Armado B-500D',
    especialidad: 'Fierrería y Armado',
    maestroLiderId: 'TAL-201',
    maestroLiderNombre: 'Segundo Morales',
    proyectoId: 'proy-mirador',
    proyectoNombre: 'Edificio Residencial El Mirador (Cuenca)',
    fechaCreacion: '2026-02-12',
    estado: 'Activa',
    rendimientoHistorico: 96.8,
    integrantes: [
      {
        id: 'int-05',
        trabajadorId: 'TAL-201',
        nombre: 'Segundo Morales',
        cedula: '0102746193',
        rol: 'Fierrero',
        tarifaHoraBase: 3.90,
        telefono: '+593 99 876 5431',
        activo: true,
        certificacionSecap: true
      },
      {
        id: 'int-06',
        trabajadorId: 'TAL-202',
        nombre: 'Héctor Rolando Zumba',
        cedula: '0104592038',
        rol: 'Fierrero',
        tarifaHoraBase: 3.60,
        telefono: '+593 98 654 3210',
        activo: true,
        certificacionSecap: true
      },
      {
        id: 'int-07',
        trabajadorId: 'TAL-203',
        nombre: 'Cristian David Morocho',
        cedula: '0107819204',
        rol: 'Peón',
        tarifaHoraBase: 3.10,
        telefono: '+593 99 321 6549',
        activo: true,
        certificacionSecap: false
      }
    ]
  },
  {
    id: 'cuad-gamma',
    nombre: 'Cuadrilla Gamma - Encofrado de Losas y Vigas',
    especialidad: 'Encofrado',
    maestroLiderId: 'TAL-301',
    maestroLiderNombre: 'Jorge Washington Tenesaca',
    proyectoId: 'proy-cumbaya',
    proyectoNombre: 'Residencias Cumbayá (Quito)',
    fechaCreacion: '2026-02-15',
    estado: 'Activa',
    rendimientoHistorico: 99.1,
    integrantes: [
      {
        id: 'int-08',
        trabajadorId: 'TAL-301',
        nombre: 'Jorge Washington Tenesaca',
        cedula: '1714529301',
        rol: 'Encofrador',
        tarifaHoraBase: 3.90,
        telefono: '+593 99 432 1098',
        activo: true,
        certificacionSecap: true
      },
      {
        id: 'int-09',
        trabajadorId: 'TAL-302',
        nombre: 'Ángel Bolívar Yánez',
        cedula: '1721094832',
        rol: 'Encofrador',
        tarifaHoraBase: 3.70,
        telefono: '+593 98 765 4321',
        activo: true,
        certificacionSecap: true
      },
      {
        id: 'int-10',
        trabajadorId: 'TAL-303',
        nombre: 'Kevin Alexander Toapanta',
        cedula: '1750293841',
        rol: 'Peón',
        tarifaHoraBase: 3.10,
        telefono: '+593 99 888 1234',
        activo: true,
        certificacionSecap: false
      }
    ]
  }
];

export const TAREOS_INIT: RegistroTareoDiario[] = [
  {
    id: 'tar-001',
    proyectoId: 'proy-mirador',
    proyectoNombre: 'Edificio Residencial El Mirador (Cuenca)',
    fecha: new Date().toISOString().split('T')[0],
    trabajadorId: 'TAL-002',
    nombreTrabajador: 'Mstr. Juan Carlos Pérez',
    cedula: '0104829145',
    rol: 'Maestro Mayor',
    cuadrillaId: 'cuad-alfa',
    cuadrillaNombre: 'Cuadrilla Alfa - Hormigón y Fundición Estructural',
    rubroCodigo: 'RUB-001',
    rubroDescripcion: "Hormigón en Losas f'c=240 kg/cm² (incluye vibrado y curado)",
    horasNormales: 8,
    horasSuplementarias: 2,
    tipoRecargoSuplementario: '50%',
    horasExtraordinarias: 0,
    totalHoras: 10,
    tarifaBaseHora: 4.80,
    cumpleEPP: true,
    cumpleSeguridadAlturas: true,
    observacionesSST: 'Arnés de cuerpo entero verificado para fundición en piso 4.',
    validado: true,
    firmaFiscalizador: {
      nombre: 'Ing. Marco Sarmiento',
      cargo: 'Fiscalizador Principal de Obra',
      hashValidacion: 'HASH-SST-9F82A4',
      timestamp: '2026-10-24 18:30:00'
    }
  },
  {
    id: 'tar-002',
    proyectoId: 'proy-mirador',
    proyectoNombre: 'Edificio Residencial El Mirador (Cuenca)',
    fecha: new Date().toISOString().split('T')[0],
    trabajadorId: 'TAL-101',
    nombreTrabajador: 'Luis Fernando Guamán',
    cedula: '0105321872',
    rol: 'Albañil',
    cuadrillaId: 'cuad-alfa',
    cuadrillaNombre: 'Cuadrilla Alfa - Hormigón y Fundición Estructural',
    rubroCodigo: 'RUB-001',
    rubroDescripcion: "Hormigón en Losas f'c=240 kg/cm² (incluye vibrado y curado)",
    horasNormales: 8,
    horasSuplementarias: 2,
    tipoRecargoSuplementario: '50%',
    horasExtraordinarias: 0,
    totalHoras: 10,
    tarifaBaseHora: 3.50,
    cumpleEPP: true,
    cumpleSeguridadAlturas: true,
    observacionesSST: 'Barbiquejo y guantes de nitrilo para manipulación de concreto.',
    validado: true,
    firmaFiscalizador: {
      nombre: 'Ing. Marco Sarmiento',
      cargo: 'Fiscalizador Principal de Obra',
      hashValidacion: 'HASH-SST-9F82A4',
      timestamp: '2026-10-24 18:30:00'
    }
  },
  {
    id: 'tar-003',
    proyectoId: 'proy-mirador',
    proyectoNombre: 'Edificio Residencial El Mirador (Cuenca)',
    fecha: new Date().toISOString().split('T')[0],
    trabajadorId: 'TAL-102',
    nombreTrabajador: 'Manuel Antonio Criollo',
    cedula: '0103984510',
    rol: 'Peón',
    cuadrillaId: 'cuad-alfa',
    cuadrillaNombre: 'Cuadrilla Alfa - Hormigón y Fundición Estructural',
    rubroCodigo: 'RUB-001',
    rubroDescripcion: "Hormigón en Losas f'c=240 kg/cm² (incluye vibrado y curado)",
    horasNormales: 8,
    horasSuplementarias: 1,
    tipoRecargoSuplementario: '50%',
    horasExtraordinarias: 0,
    totalHoras: 9,
    tarifaBaseHora: 3.10,
    cumpleEPP: true,
    cumpleSeguridadAlturas: true,
    observacionesSST: 'Botas punta de acero y protección auditiva por vibrador.',
    validado: true,
    firmaFiscalizador: {
      nombre: 'Ing. Marco Sarmiento',
      cargo: 'Fiscalizador Principal de Obra',
      hashValidacion: 'HASH-SST-9F82A4',
      timestamp: '2026-10-24 18:30:00'
    }
  },
  {
    id: 'tar-004',
    proyectoId: 'proy-mirador',
    proyectoNombre: 'Edificio Residencial El Mirador (Cuenca)',
    fecha: new Date().toISOString().split('T')[0],
    trabajadorId: 'TAL-201',
    nombreTrabajador: 'Segundo Morales',
    cedula: '0102746193',
    rol: 'Fierrero',
    cuadrillaId: 'cuad-beta',
    cuadrillaNombre: 'Cuadrilla Beta - Fierrería & Armado B-500D',
    rubroCodigo: 'RUB-005',
    rubroDescripcion: 'Armado y Colocación de Acero Estructural B-500D (Fierrería)',
    horasNormales: 8,
    horasSuplementarias: 0,
    tipoRecargoSuplementario: '50%',
    horasExtraordinarias: 0,
    totalHoras: 8,
    tarifaBaseHora: 3.90,
    cumpleEPP: true,
    cumpleSeguridadAlturas: true,
    observacionesSST: 'Guantes de cuero para cizalla y alambre.',
    validado: true,
    firmaFiscalizador: {
      nombre: 'Ing. Marco Sarmiento',
      cargo: 'Fiscalizador Principal de Obra',
      hashValidacion: 'HASH-SST-9F82A4',
      timestamp: '2026-10-24 18:30:00'
    }
  },
  {
    id: 'tar-005',
    proyectoId: 'proy-mirador',
    proyectoNombre: 'Edificio Residencial El Mirador (Cuenca)',
    fecha: new Date().toISOString().split('T')[0],
    trabajadorId: 'TAL-202',
    nombreTrabajador: 'Héctor Rolando Zumba',
    cedula: '0104592038',
    rol: 'Fierrero',
    cuadrillaId: 'cuad-beta',
    cuadrillaNombre: 'Cuadrilla Beta - Fierrería & Armado B-500D',
    rubroCodigo: 'RUB-005',
    rubroDescripcion: 'Armado y Colocación de Acero Estructural B-500D (Fierrería)',
    horasNormales: 8,
    horasSuplementarias: 0,
    tipoRecargoSuplementario: '50%',
    horasExtraordinarias: 0,
    totalHoras: 8,
    tarifaBaseHora: 3.60,
    cumpleEPP: true,
    cumpleSeguridadAlturas: true,
    observacionesSST: 'Lentes de seguridad con protección lateral.',
    validado: true,
    firmaFiscalizador: {
      nombre: 'Ing. Marco Sarmiento',
      cargo: 'Fiscalizador Principal de Obra',
      hashValidacion: 'HASH-SST-9F82A4',
      timestamp: '2026-10-24 18:30:00'
    }
  }
];

// ============================================================================
// CLASE PRINCIPAL DEL SERVICIO
// ============================================================================

export class SaraTareoObraService {
  // Constantes Normativas Ecuador 2026
  public static readonly SBU_2026 = 482.0; // Salario Básico Unificado 2026 Acuerdo MDT-2025-195
  public static readonly JORNADA_MENSUAL_HORAS = 160; // 40h semana * 4 semanas
  public static readonly FACTOR_APORTE_PATRONAL = 0.1215; // 12.15% (11.15% IESS + 0.5% SECAP + 0.5% IECE)
  public static readonly FACTOR_APORTE_PERSONAL = 0.0945; // 9.45%
  public static readonly FACTOR_FONDO_RESERVA = 0.0833; // 8.33%
  public static readonly FACTOR_DECIMO_TERCERO = 1 / 12; // 8.333%
  public static readonly FACTOR_VACACIONES = 1 / 24; // 4.166%

  private static STORAGE_KEYS = {
    PROYECTOS: 'sara_tareo_proyectos',
    RUBROS: 'sara_tareo_rubros',
    CUADRILLAS: 'sara_tareo_cuadrillas',
    TAREOS: 'sara_tareo_registros'
  };

  /**
   * Enmascara el número de cédula protegiendo datos personales:
   * Ej: 0104829145 -> 0104***145
   */
  public static enmascararCedula(cedula: string): string {
    if (!cedula || cedula.length < 8) return '********';
    const clean = cedula.replace(/\D/g, '');
    if (clean.length < 8) return '********';
    const first = clean.slice(0, 4);
    const last = clean.slice(-3);
    return `${first}***${last}`;
  }

  // --------------------------------------------------------------------------
  // PROYECTOS DE OBRA
  // --------------------------------------------------------------------------

  public static getProyectos(): ProyectoObra[] {
    if (typeof window === 'undefined') return PROYECTOS_OBRA_INIT;
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.PROYECTOS);
      if (!data) {
        localStorage.setItem(this.STORAGE_KEYS.PROYECTOS, JSON.stringify(PROYECTOS_OBRA_INIT));
        return PROYECTOS_OBRA_INIT;
      }
      return JSON.parse(data);
    } catch {
      return PROYECTOS_OBRA_INIT;
    }
  }

  // --------------------------------------------------------------------------
  // RUBROS APU
  // --------------------------------------------------------------------------

  public static getRubrosApu(): RubroApuObra[] {
    if (typeof window === 'undefined') return RUBROS_APU_INIT;
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.RUBROS);
      if (!data) {
        localStorage.setItem(this.STORAGE_KEYS.RUBROS, JSON.stringify(RUBROS_APU_INIT));
        return RUBROS_APU_INIT;
      }
      return JSON.parse(data);
    } catch {
      return RUBROS_APU_INIT;
    }
  }

  // --------------------------------------------------------------------------
  // GESTIÓN DE CUADRILLAS
  // --------------------------------------------------------------------------

  public static getCuadrillas(proyectoId?: string): CuadrillaObra[] {
    let list: CuadrillaObra[] = CUADRILLAS_INIT;
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(this.STORAGE_KEYS.CUADRILLAS);
        if (raw) {
          list = JSON.parse(raw);
        } else {
          localStorage.setItem(this.STORAGE_KEYS.CUADRILLAS, JSON.stringify(CUADRILLAS_INIT));
        }
      } catch {
        list = CUADRILLAS_INIT;
      }
    }

    if (proyectoId && proyectoId !== 'todos') {
      return list.filter(c => c.proyectoId === proyectoId);
    }
    return list;
  }

  public static guardarCuadrilla(
    cuadrilla: Omit<CuadrillaObra, 'id' | 'fechaCreacion'> & { id?: string }
  ): CuadrillaObra {
    const actuales = this.getCuadrillas();
    const id = cuadrilla.id || `cuad-${Date.now().toString(36)}`;
    const fechaCreacion = new Date().toISOString().split('T')[0];

    const nueva: CuadrillaObra = {
      ...cuadrilla,
      id,
      fechaCreacion: cuadrilla.id 
        ? actuales.find(c => c.id === cuadrilla.id)?.fechaCreacion || fechaCreacion 
        : fechaCreacion,
      rendimientoHistorico: cuadrilla.rendimientoHistorico || 97.5
    };

    const index = actuales.findIndex(c => c.id === id);
    if (index >= 0) {
      actuales[index] = nueva;
    } else {
      actuales.unshift(nueva);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.CUADRILLAS, JSON.stringify(actuales));
    }
    return nueva;
  }

  public static eliminarCuadrilla(id: string): boolean {
    const actuales = this.getCuadrillas();
    const filtradas = actuales.filter(c => c.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.CUADRILLAS, JSON.stringify(filtradas));
    }
    return true;
  }

  // --------------------------------------------------------------------------
  // TAREO DIARIO DE OBRA
  // --------------------------------------------------------------------------

  public static getTareos(proyectoId?: string, fecha?: string): RegistroTareoDiario[] {
    let list: RegistroTareoDiario[] = TAREOS_INIT;
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(this.STORAGE_KEYS.TAREOS);
        if (raw) {
          list = JSON.parse(raw);
        } else {
          localStorage.setItem(this.STORAGE_KEYS.TAREOS, JSON.stringify(TAREOS_INIT));
        }
      } catch {
        list = TAREOS_INIT;
      }
    }

    return list.filter(t => {
      if (proyectoId && proyectoId !== 'todos' && t.proyectoId !== proyectoId) return false;
      if (fecha && t.fecha !== fecha) return false;
      return true;
    });
  }

  public static guardarRegistroTareo(
    registro: Omit<RegistroTareoDiario, 'id' | 'totalHoras'> & { id?: string }
  ): RegistroTareoDiario {
    const list = this.getTareos();
    const id = registro.id || `tar-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
    const totalHoras = Number(registro.horasNormales) + Number(registro.horasSuplementarias) + Number(registro.horasExtraordinarias);

    const nuevo: RegistroTareoDiario = {
      ...registro,
      id,
      totalHoras
    };

    const index = list.findIndex(t => t.id === id);
    if (index >= 0) {
      list[index] = nuevo;
    } else {
      list.unshift(nuevo);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.TAREOS, JSON.stringify(list));

      // Persistencia asíncrona transaccional en Supabase
      try {
        import('@/lib/supabase/client').then(({ createClient }) => {
          const supabase = createClient();
          supabase.from('tareo_diario').upsert({
            id: nuevo.id,
            proyecto_id: nuevo.proyectoId,
            fecha: nuevo.fecha,
            trabajador_id: nuevo.trabajadorId,
            nombre_trabajador: nuevo.nombreTrabajador,
            cedula: nuevo.cedula,
            rol: nuevo.rol,
            rubro_codigo: nuevo.rubroCodigo,
            horas_normales: nuevo.horasNormales,
            horas_suplementarias: nuevo.horasSuplementarias,
            horas_extraordinarias: nuevo.horasExtraordinarias,
            total_horas: nuevo.totalHoras,
            tarifa_base_hora: nuevo.tarifaBaseHora,
            cumple_epp: nuevo.cumpleEPP,
            cumple_alturas: nuevo.cumpleSeguridadAlturas,
            observaciones_sst: nuevo.observacionesSST || null,
            validado: nuevo.validado,
            updated_at: new Date().toISOString(),
          }).then(({ error }) => {
            if (error) console.warn('[TareoObraService] Nota persistencia Supabase:', error.message);
          });
        }).catch(() => {});
      } catch (e) {}
    }
    return nuevo;
  }

  public static guardarLoteTareo(
    registros: Array<Omit<RegistroTareoDiario, 'id' | 'totalHoras'> & { id?: string }>
  ): RegistroTareoDiario[] {
    const guardados: RegistroTareoDiario[] = [];
    for (const r of registros) {
      guardados.push(this.guardarRegistroTareo(r));
    }
    return guardados;
  }

  public static eliminarRegistroTareo(id: string): boolean {
    const list = this.getTareos();
    const filtrados = list.filter(t => t.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.TAREOS, JSON.stringify(filtrados));
    }
    return true;
  }

  /**
   * Firma y valida el tareo diario completo para un proyecto y fecha por parte del Fiscalizador / Residente
   */
  public static firmarYValidarTareo(
    proyectoId: string,
    fecha: string,
    fiscalizador: { nombre: string; cargo: string; cedula?: string }
  ): { success: boolean; hash: string; timestamp: string; mensaje: string } {
    const todos = this.getTareos();
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const hash = `SARA-FISC-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    let count = 0;
    const actualizados = todos.map(t => {
      if (t.proyectoId === proyectoId && t.fecha === fecha) {
        count++;
        return {
          ...t,
          validado: true,
          firmaFiscalizador: {
            nombre: fiscalizador.nombre,
            cargo: fiscalizador.cargo,
            hashValidacion: hash,
            timestamp
          }
        };
      }
      return t;
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.TAREOS, JSON.stringify(actualizados));

      // Persistencia asíncrona de la firma y validación SST en Supabase
      try {
        import('@/lib/supabase/client').then(({ createClient }) => {
          const supabase = createClient();
          supabase.from('tareo_diario')
            .update({
              validado: true,
              firma_fiscalizador: {
                nombre: fiscalizador.nombre,
                cargo: fiscalizador.cargo,
                hashValidacion: hash,
                timestamp,
              },
              updated_at: new Date().toISOString(),
            })
            .eq('proyecto_id', proyectoId)
            .eq('fecha', fecha)
            .then(({ error }) => {
              if (error) console.warn('[TareoObraService] Nota firma Supabase:', error.message);
            });

          // Registro de evento en el bus del ecosistema
          supabase.from('sara_agent_events').insert({
            event_name: 'TAREO_DIARIO_FIRMADO',
            source_agent: 'SARA-TALENTOHUMANO',
            target_agents: ['SARA-CONSTRUCTORA', 'SARA-PAGOS'],
            payload: {
              proyectoId,
              fecha,
              fiscalizadorNombre: fiscalizador.nombre,
              hashValidacion: hash,
              registrosFirmados: count,
            },
          }).then(() => {});
        }).catch(() => {});
      } catch (e) {}
    }

    return {
      success: true,
      hash,
      timestamp,
      mensaje: `Se han validado y firmado electrónicamente ${count} registros de tareo bajo el Decreto Ejecutivo 255 y Res. CD 513 IESS.`
    };
  }

  // --------------------------------------------------------------------------
  // CÁLCULO DE COSTO LABORAL REAL VS APU
  // --------------------------------------------------------------------------

  public static calcularAnalisisCosto(
    tareos: RegistroTareoDiario[],
    rubros?: RubroApuObra[]
  ): { detalles: CalculoCostoTrabajadorTareo[]; resumen: ResumenJornadaTareo } {
    const rubrosMap = new Map<string, RubroApuObra>();
    const rubrosList = rubros || this.getRubrosApu();
    rubrosList.forEach(r => rubrosMap.set(r.codigo, r));

    const detalles: CalculoCostoTrabajadorTareo[] = [];

    let totalHorasHombre = 0;
    let totalHorasNormales = 0;
    let totalHorasSuplementarias = 0;
    let totalHorasExtraordinarias = 0;
    let totalMateriaGravada = 0;
    let totalNetoTrabajadores = 0;
    let totalAportePersonalIess = 0;
    let totalAportePatronalIess = 0;
    let totalProvisionesSociales = 0;
    let costoTotalRealJornada = 0;
    let costoTotalProyectadoApu = 0;
    let countEppOk = 0;
    let countAlturasOk = 0;

    const sbuVigente = this.SBU_2026;

    for (const t of tareos) {
      const tarifaBase = Number(t.tarifaBaseHora) || 3.10;
      const hNorm = Number(t.horasNormales) || 0;
      const hSupl = Number(t.horasSuplementarias) || 0;
      const hExtra = Number(t.horasExtraordinarias) || 0;
      const factorSupl = t.tipoRecargoSuplementario === '25%' ? 1.25 : 1.50; // Código del Trabajo Art. 55

      // 1. Ingresos brutos por tipo de hora
      const ingresoNormal = +(hNorm * tarifaBase).toFixed(2);
      const ingresoSuplementario = +(hSupl * tarifaBase * factorSupl).toFixed(2);
      const ingresoExtraordinario = +(hExtra * tarifaBase * 2.0).toFixed(2); // Recargo 100%
      const subtotalMateriaGravada = +(ingresoNormal + ingresoSuplementario + ingresoExtraordinario).toFixed(2);

      // 2. Deducción Aporte Personal IESS (9.45%)
      const descuentoIessPersonal = +(subtotalMateriaGravada * this.FACTOR_APORTE_PERSONAL).toFixed(2);
      const netoRecibirTrabajador = +(subtotalMateriaGravada - descuentoIessPersonal).toFixed(2);

      // 3. Cargas Patronales de Construcción (12.15%)
      const aporteIessPatronal = +(subtotalMateriaGravada * this.FACTOR_APORTE_PATRONAL).toFixed(2);

      // 4. Provisiones Sociales y Beneficios de Ley
      const provisionFondoReserva = +(subtotalMateriaGravada * this.FACTOR_FONDO_RESERVA).toFixed(2);
      const provisionDecimoTercero = +(subtotalMateriaGravada * this.FACTOR_DECIMO_TERCERO).toFixed(2);
      // Proporcionalidad del décimo cuarto para la jornada diaria: (SBU / 160h) * hNorm
      const factorHorasDecimoCuarto = hNorm > 0 ? hNorm / 160 : (hNorm + hSupl + hExtra) / 160;
      const provisionDecimoCuarto = +((sbuVigente * factorHorasDecimoCuarto)).toFixed(2);
      const provisionVacaciones = +(subtotalMateriaGravada * this.FACTOR_VACACIONES).toFixed(2);

      const totalCargasPatronales = +(
        aporteIessPatronal +
        provisionFondoReserva +
        provisionDecimoTercero +
        provisionDecimoCuarto +
        provisionVacaciones
      ).toFixed(2);

      // 5. Costo Real Empresa Total (Costo Total de Mano de Obra para la Obra)
      const costoRealEmpresaTotal = +(subtotalMateriaGravada + totalCargasPatronales).toFixed(2);
      const totalHoras = hNorm + hSupl + hExtra;
      const costoHoraRealEfectiva = totalHoras > 0 ? +(costoRealEmpresaTotal / totalHoras).toFixed(4) : tarifaBase;

      // 6. Proyección APU
      const rubroApu = rubrosMap.get(t.rubroCodigo);
      const costoHoraProyectadaApu = rubroApu ? rubroApu.costoHoraHombreApuUSD : +(tarifaBase * 1.35).toFixed(2);
      const itemCostoTotalProyectadoApu = +(totalHoras * costoHoraProyectadaApu).toFixed(2);

      // 7. Desviación vs Presupuesto APU
      const desviacionCostoUSD = +(costoRealEmpresaTotal - itemCostoTotalProyectadoApu).toFixed(2);
      const desviacionPorcentaje = itemCostoTotalProyectadoApu > 0
        ? +((desviacionCostoUSD / itemCostoTotalProyectadoApu) * 100).toFixed(2)
        : 0;

      let estadoPresupuesto: 'En Rango' | 'Sobrepresupuesto' | 'Ahorro' = 'En Rango';
      if (desviacionPorcentaje > 5.0) {
        estadoPresupuesto = 'Sobrepresupuesto';
      } else if (desviacionPorcentaje < -5.0) {
        estadoPresupuesto = 'Ahorro';
      }

      if (t.cumpleEPP) countEppOk++;
      if (t.cumpleSeguridadAlturas) countAlturasOk++;

      detalles.push({
        registroId: t.id,
        trabajadorId: t.trabajadorId,
        nombreTrabajador: t.nombreTrabajador,
        cedulaEnmascarada: this.enmascararCedula(t.cedula),
        rol: t.rol,
        horasNormales: hNorm,
        horasSuplementarias: hSupl,
        horasExtraordinarias: hExtra,
        totalHoras,
        tarifaHoraBase: tarifaBase,
        ingresoNormal,
        ingresoSuplementario,
        ingresoExtraordinario,
        subtotalMateriaGravada,
        descuentoIessPersonal,
        netoRecibirTrabajador,
        aporteIessPatronal,
        provisionFondoReserva,
        provisionDecimoTercero,
        provisionDecimoCuarto,
        provisionVacaciones,
        totalCargasPatronales,
        costoRealEmpresaTotal,
        costoHoraRealEfectiva,
        costoHoraProyectadaApu,
        costoTotalProyectadoApu: itemCostoTotalProyectadoApu,
        desviacionCostoUSD,
        desviacionPorcentaje,
        estadoPresupuesto,
        cumpleEPP: t.cumpleEPP,
        cumpleSeguridadAlturas: t.cumpleSeguridadAlturas,
        validado: t.validado
      });

      totalHorasHombre += totalHoras;
      totalHorasNormales += hNorm;
      totalHorasSuplementarias += hSupl;
      totalHorasExtraordinarias += hExtra;
      totalMateriaGravada += subtotalMateriaGravada;
      totalNetoTrabajadores += netoRecibirTrabajador;
      totalAportePersonalIess += descuentoIessPersonal;
      totalAportePatronalIess += aporteIessPatronal;
      totalProvisionesSociales += (provisionFondoReserva + provisionDecimoTercero + provisionDecimoCuarto + provisionVacaciones);
      costoTotalRealJornada += costoRealEmpresaTotal;
      costoTotalProyectadoApu += itemCostoTotalProyectadoApu;
    }

    const desviacionTotalUSD = +(costoTotalRealJornada - costoTotalProyectadoApu).toFixed(2);
    const desviacionTotalPorcentaje = costoTotalProyectadoApu > 0
      ? +((desviacionTotalUSD / costoTotalProyectadoApu) * 100).toFixed(2)
      : 0;

    let estadoGeneral: 'En Rango' | 'Sobrepresupuesto' | 'Ahorro' = 'En Rango';
    if (desviacionTotalPorcentaje > 5.0) {
      estadoGeneral = 'Sobrepresupuesto';
    } else if (desviacionTotalPorcentaje < -5.0) {
      estadoGeneral = 'Ahorro';
    }

    const totalTrabajadores = tareos.length;
    const porcentajeCumplimientoEpp = totalTrabajadores > 0 ? Math.round((countEppOk / totalTrabajadores) * 100) : 100;
    const porcentajeSeguridadAlturas = totalTrabajadores > 0 ? Math.round((countAlturasOk / totalTrabajadores) * 100) : 100;

    const primerTareo = tareos[0];
    const todosValidados = tareos.length > 0 && tareos.every(t => t.validado);

    const resumen: ResumenJornadaTareo = {
      proyectoId: primerTareo?.proyectoId || 'sin-proyecto',
      proyectoNombre: primerTareo?.proyectoNombre || 'Proyecto General',
      fecha: primerTareo?.fecha || new Date().toISOString().split('T')[0],
      totalTrabajadores,
      totalHorasHombre,
      totalHorasNormales,
      totalHorasSuplementarias,
      totalHorasExtraordinarias,
      totalMateriaGravada: +totalMateriaGravada.toFixed(2),
      totalNetoTrabajadores: +totalNetoTrabajadores.toFixed(2),
      totalAportePersonalIess: +totalAportePersonalIess.toFixed(2),
      totalAportePatronalIess: +totalAportePatronalIess.toFixed(2),
      totalProvisionesSociales: +totalProvisionesSociales.toFixed(2),
      costoTotalRealJornada: +costoTotalRealJornada.toFixed(2),
      costoTotalProyectadoApu: +costoTotalProyectadoApu.toFixed(2),
      desviacionTotalUSD,
      desviacionTotalPorcentaje,
      estadoGeneral,
      porcentajeCumplimientoEpp,
      porcentajeSeguridadAlturas,
      estadoTareo: todosValidados ? 'Validado por Fiscalización' : 'Borrador',
      validadoPor: primerTareo?.firmaFiscalizador ? {
        nombre: primerTareo.firmaFiscalizador.nombre,
        cargo: primerTareo.firmaFiscalizador.cargo,
        fechaFirma: primerTareo.firmaFiscalizador.timestamp,
        hash: primerTareo.firmaFiscalizador.hashValidacion
      } : undefined
    };

    return { detalles, resumen };
  }

  // --------------------------------------------------------------------------
  // EXPORTACIÓN A EXCEL NATIVO CORPORATIVO (.XLSX)
  // --------------------------------------------------------------------------

  public static exportarTareoExcel(
    tareos: RegistroTareoDiario[],
    resumen: ResumenJornadaTareo,
    nombreObra: string,
    fecha: string
  ): void {
    const { detalles } = this.calcularAnalisisCosto(tareos);

    const filasExcel = detalles.map((d, index) => ({
      'Nº': index + 1,
      'Cédula (Enmascarada)': d.cedulaEnmascarada,
      'Trabajador': d.nombreTrabajador,
      'Rol / Especialidad': d.rol,
      'H. Normales': d.horasNormales,
      'H. Suplementarias (50%)': d.horasSuplementarias,
      'H. Extraordinarias (100%)': d.horasExtraordinarias,
      'Total H-H': d.totalHoras,
      'Tarifa Base ($/h)': `$${d.tarifaHoraBase.toFixed(2)}`,
      'Ingreso Gravado ($)': `$${d.subtotalMateriaGravada.toFixed(2)}`,
      'Aporte Personal 9.45% ($)': `$${d.descuentoIessPersonal.toFixed(2)}`,
      'Neto a Recibir ($)': `$${d.netoRecibirTrabajador.toFixed(2)}`,
      'Aporte Patronal 12.15% ($)': `$${d.aporteIessPatronal.toFixed(2)}`,
      'Provisiones Sociales ($)': `$${d.totalCargasPatronales.toFixed(2)}`,
      'Costo Real Empresa ($)': `$${d.costoRealEmpresaTotal.toFixed(2)}`,
      'Costo Presupuesto APU ($)': `$${d.costoTotalProyectadoApu.toFixed(2)}`,
      'Desviación ($)': `${d.desviacionCostoUSD >= 0 ? '+' : ''}$${d.desviacionCostoUSD.toFixed(2)}`,
      'Desviación (%)': `${d.desviacionPorcentaje >= 0 ? '+' : ''}${d.desviacionPorcentaje.toFixed(2)}%`,
      'Estado Presupuesto': d.estadoPresupuesto,
      'EPP Decreto 255': d.cumpleEPP ? 'CUMPLE' : 'NO CUMPLE',
      'Seguridad Alturas': d.cumpleSeguridadAlturas ? 'CUMPLE' : 'NO CUMPLE',
      'Validado Fiscalización': d.validado ? 'SI (FIRMADO)' : 'PENDIENTE'
    }));

    const kpis: KpiReporteItem[] = [
      { etiqueta: 'Proyecto de Obra', valor: nombreObra, destacado: true },
      { etiqueta: 'Fecha de Tareo', valor: fecha },
      { etiqueta: 'Personal Activo en Obra', valor: `${resumen.totalTrabajadores} trabajadores` },
      { etiqueta: 'Total Horas-Hombre (H-H)', valor: `${resumen.totalHorasHombre} horas` },
      { etiqueta: 'Costo Real Empresa Jornada', valor: `$${resumen.costoTotalRealJornada.toFixed(2)} USD`, destacado: true },
      { etiqueta: 'Presupuesto Proyectado APU', valor: `$${resumen.costoTotalProyectadoApu.toFixed(2)} USD` },
      {
        etiqueta: 'Desviación Presupuestaria',
        valor: `${resumen.desviacionTotalPorcentaje >= 0 ? '+' : ''}${resumen.desviacionTotalPorcentaje.toFixed(2)}% ($${resumen.desviacionTotalUSD.toFixed(2)} USD)`,
        color: resumen.desviacionTotalUSD > 0 ? 'danger' : 'success'
      },
      { etiqueta: 'Aporte IESS Consolidado (12.15% + 9.45%)', valor: `$${(resumen.totalAportePatronalIess + resumen.totalAportePersonalIess).toFixed(2)} USD` },
      { etiqueta: 'Cumplimiento EPP (Decreto 255)', valor: `${resumen.porcentajeCumplimientoEpp}%` },
      { etiqueta: 'Estado de Fiscalización', valor: resumen.estadoTareo }
    ];

    const safeObra = nombreObra.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20);
    const nombreArchivo = `Tareo_Obra_APU_${safeObra}_${fecha}`;
    exportarAExcel(filasExcel, nombreArchivo, 'Tareo Diario APU', 'talento', kpis);
  }

  /**
   * Resetea la memoria local a los datos iniciales
   */
  public static reiniciarDatosIniciales(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.PROYECTOS, JSON.stringify(PROYECTOS_OBRA_INIT));
      localStorage.setItem(this.STORAGE_KEYS.RUBROS, JSON.stringify(RUBROS_APU_INIT));
      localStorage.setItem(this.STORAGE_KEYS.CUADRILLAS, JSON.stringify(CUADRILLAS_INIT));
      localStorage.setItem(this.STORAGE_KEYS.TAREOS, JSON.stringify(TAREOS_INIT));
    }
  }
}
