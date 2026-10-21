/**
 * SERVICIO INTEGRAL DE REQUERIMIENTO Y CONTRATACIÓN DE PERSONAL DE OBRA
 * (TÉCNICO DE OBRA -> CONTRATACIÓN PERSONAL + AGENTE IA SARA-TALENTOHUMANO -> SARA-TALENTO)
 * Ecosistema GRUPO SARA Constructora
 *
 * Orquesta el flujo oficial de Talento Humano en Construcción (Normativa Ecuador 2026):
 * 1. El Técnico / Ingeniero Residente solicita Profesionales o Trabajadores en:
 *    `REQUERIMIENTOS MATERIALES/TRABAJADORES -> Solicitar Profesionales/Trabajadores (Obra)`
 *    apoyándose en el Cronograma de Obra y el Presupuesto APU (Mano de Obra E2/D2/C2/B1 CICS 2026, SBU $482.00).
 * 2. El pedido llega en tiempo real a:
 *    `DIRECTORIO Y RECURSOS -> Contratación Personal`
 * 3. El Agente IA `SARA-TALENTOHUMANO` se integra con el módulo `SARA-TALENTO` para evaluar y rankear
 *    a los candidatos registrados según su Score de Idoneidad (0-100%):
 *    - Cercanía geográfica GPS a la obra (1° Local sin viáticos -> 2° Regional -> 3° Foráneo con alerta SARA-ALOJAMIENTO)
 *    - Viabilidad Económica (Jornal/Tarifa Hora del profesional vs Techo Presupuestario APU)
 *    - Certificaciones SECAP / SENESCYT y Seguridad SST (Decreto Ejecutivo 255 & Resolución CD 513 IESS)
 *    - Calificación histórica en obras previas (★ 1.0 a 5.0)
 * 4. Al pulsar "Contratar y Notificar en SARA-TALENTO", se registra formalmente la oferta contractual
 *    en `SaraTalentoRequestsService` (`REQ-TAL-XXXXXX`) y se notifica al profesional/trabajador para que
 *    proceda con la Aceptación o Rechazo del contrato.
 */

import {
  SaraTalentoRequestsService,
  SolicitudPersonalEmpresa,
} from './saraTalentoRequestsService';

export type OrigenRequerimientoPersonal =
  | 'CRONOGRAMA_Y_APU'
  | 'SOLICITUD_ESPECIALISTA_MANUAL';

export type PrioridadContratacion =
  | 'PROGRAMADA_CRONOGRAMA'
  | 'URGENTE_48H'
  | 'INMEDIATA_FRENTE_CRITICO';

export type EstadoVacanteRequerida =
  | 'PENDIENTE_EVALUACION_IA'
  | 'NOTIFICADO_EN_SARA_TALENTO'
  | 'CONTRATO_ACEPTADO_ACTIVO'
  | 'CONTRATO_RECHAZADO_POR_TRABAJADOR';

export type EstadoRequerimientoPersonalObra =
  | 'PENDIENTE_CONTRATACION'
  | 'EN_PROCESO_ACEPTACION_TALENTO'
  | 'CONTRATACION_COMPLETA'
  | 'REQUIERE_REASIGNACION';

export interface CandidatoIdoneoulacionIA {
  talentoId: string;
  nombreCompleto: string;
  cedula: string;
  especialidadCargo: string;
  estructuraCics: 'A1_DIRECCION' | 'B1_MAESTRO_MAYOR' | 'C2_ESPECIALISTA' | 'D2_ALBANIL_FIERRERO' | 'E2_PEON';
  ciudadResidencia: string;
  anilloCobertura: 'ANILLO_1_LOCAL' | 'ANILLO_2_REGIONAL' | 'ANILLO_3_FORANEO';
  etiquetaCercania: string;
  distanciaKmObra: number;
  requiereAlojamientoStays: boolean;
  experienciaAnios: number;
  calificacionHistorica: number; // 1.0 - 5.0
  obrasCompletadasSara: number;
  tarifaHoraPropuestaUSD: number;
  jornalDiarioPropuestoUSD: number;
  dentroTechoApu: boolean;
  ahorroOSobrecostoHoraUSD: number; // Negativo = ahorro frente al APU; Positivo = sobrecosto
  certificacionesVerificadas: string[];
  cumpleSstDecreto255: boolean;
  afiliacionIessActiva: boolean;
  telefonoContacto: string;
  emailContacto: string;
  // Desglose del Score de Idoneidad IA (0 a 100 puntos)
  scoreIdoneidadTotal: number;
  desgloseScore: {
    reputacionObrasPts: number; // máx 35
    cercaniaGpsPts: number; // máx 25
    viabilidadApuPts: number; // máx 20
    certificacionesSecapSenescytPts: number; // máx 10
    cumplimientoSstIessPts: number; // máx 10
  };
  esMasIdoneoIA: boolean;
  dictamenAgenteIA: string;
}

export interface VacanteRequeridaObra {
  id: string;
  codigoPerfilApu: string;
  cargoEspecialidad: string;
  estructuraCics: 'A1_DIRECCION' | 'B1_MAESTRO_MAYOR' | 'C2_ESPECIALISTA' | 'D2_ALBANIL_FIERRERO' | 'E2_PEON';
  rubroApuRelacionado?: string;
  faseCronograma: string;
  cantidadPersonasRequeridas: number;
  horasHombrePresupuestadasApu: number;
  tarifaHoraTechoApuUSD: number;
  jornalDiarioTechoApuUSD: number;
  fechaInicioCronograma: string;
  fechaFinCronograma: string;
  duracionEstimada: string;
  certificacionExigida: string;
  requiereEppAlturaSst: boolean;
  estadoVacante: EstadoVacanteRequerida;
  // Datos del candidato contratado / notificado en SARA-TALENTO
  candidatoSeleccionadoId?: string;
  candidatoSeleccionadoNombre?: string;
  candidatoSeleccionadoCedula?: string;
  candidatoSeleccionadoTarifaHoraUSD?: number;
  candidatoSeleccionadoDistanciaKm?: number;
  candidatoSeleccionadoScoreIA?: number;
  saraTalentoSolicitudId?: string; // Ej: REQ-TAL-482910
  fechaNotificacionTalento?: string;
  fechaRespuestaTrabajador?: string;
  motivoRechazoTrabajador?: string;
  candidatosDescartadosIds?: string[];
}

export interface RequerimientoPersonalObra {
  id: string;
  numeroRequerimiento: string; // Ej: REQ-PER-OBRA-2026-014
  fechaEmision: string;
  horaEmision: string;
  proyectoId: string;
  proyectoNombre: string;
  ciudadObra: string;
  frenteObraEspecifico: string;
  faseCronogramaId: string;
  faseCronogramaNombre: string;
  solicitadoPorTecnico: string;
  cargoSolicitante: string;
  origen: OrigenRequerimientoPersonal;
  prioridad: PrioridadContratacion;
  justificacionCronograma: string;
  estadoGeneral: EstadoRequerimientoPersonalObra;
  vacantes: VacanteRequeridaObra[];
}

export interface PlantillaFaseCronogramaApuPersonal {
  id: string;
  codigoFase: string;
  nombreFaseCronograma: string;
  semanasCronograma: string;
  avanceActualFasePct: number;
  rubroApuReferencia: string;
  perfilesPresupuestados: Array<{
    codigoPerfilApu: string;
    cargoEspecialidad: string;
    estructuraCics: 'A1_DIRECCION' | 'B1_MAESTRO_MAYOR' | 'C2_ESPECIALISTA' | 'D2_ALBANIL_FIERRERO' | 'E2_PEON';
    cantidadSugerida: number;
    horasHombrePresupuestadasApu: number;
    horasHombreYaContratadas: number;
    tarifaHoraTechoApuUSD: number;
    jornalDiarioTechoApuUSD: number;
    duracionFase: string;
    certificacionExigida: string;
    requiereEppAlturaSst: boolean;
  }>;
}

const STORAGE_KEY_REQ_PERSONAL = 'sara_requerimientos_personal_obra_v1';

export const PLANTILLAS_CRONOGRAMA_APU_PERSONAL: PlantillaFaseCronogramaApuPersonal[] = [
  {
    id: 'cron-fase-02',
    codigoFase: 'CRON-FASE-02',
    nombreFaseCronograma: 'Fase 2: Superestructura Sismorresistente NEC-15 (Columnas y Losas Niveles 4 al 8)',
    semanasCronograma: 'Semanas 5 a 12 (Cronograma Ruta Crítica)',
    avanceActualFasePct: 38,
    rubroApuReferencia: 'APU-EST-014 • Hormigón Estructural f\'c=280 kg/cm² & Acero fy=4200 kg/cm²',
    perfilesPresupuestados: [
      {
        codigoPerfilApu: 'MO-CICS-B1-01',
        cargoEspecialidad: 'Maestro Mayor de Ejecución de Obras Civiles',
        estructuraCics: 'B1_MAESTRO_MAYOR',
        cantidadSugerida: 1,
        horasHombrePresupuestadasApu: 640,
        horasHombreYaContratadas: 320,
        tarifaHoraTechoApuUSD: 4.65,
        jornalDiarioTechoApuUSD: 37.20,
        duracionFase: '2 Meses (320 Horas)',
        certificacionExigida: 'Certificación SECAP Maestro Mayor + Lectura Planos BIM/NEC-15',
        requiereEppAlturaSst: true,
      },
      {
        codigoPerfilApu: 'MO-CICS-D2-04',
        cargoEspecialidad: 'Fierrero / Armador de Acero Estructural',
        estructuraCics: 'D2_ALBANIL_FIERRERO',
        cantidadSugerida: 2,
        horasHombrePresupuestadasApu: 960,
        horasHombreYaContratadas: 480,
        tarifaHoraTechoApuUSD: 3.85,
        jornalDiarioTechoApuUSD: 30.80,
        duracionFase: '6 Semanas (240 Horas c/u)',
        certificacionExigida: 'Certificación SECAP Armado Estructural Sismorresistente + Trabajo en Alturas',
        requiereEppAlturaSst: true,
      },
      {
        codigoPerfilApu: 'MO-CICS-D2-07',
        cargoEspecialidad: 'Carpintero Encofrador de Losas y Pórticos',
        estructuraCics: 'D2_ALBANIL_FIERRERO',
        cantidadSugerida: 2,
        horasHombrePresupuestadasApu: 800,
        horasHombreYaContratadas: 400,
        tarifaHoraTechoApuUSD: 3.80,
        jornalDiarioTechoApuUSD: 30.40,
        duracionFase: '5 Semanas (200 Horas c/u)',
        certificacionExigida: 'Certificación SECAP Encofrados Metálicos + Licencia PTAR Alturas (>1.80m)',
        requiereEppAlturaSst: true,
      },
    ],
  },
  {
    id: 'cron-fase-03',
    codigoFase: 'CRON-FASE-03',
    nombreFaseCronograma: 'Fase 3: Instalaciones Eléctricas, Redes Hidrosanitarias y Seguridad SST',
    semanasCronograma: 'Semanas 10 a 16 (Cronograma Instalaciones)',
    avanceActualFasePct: 15,
    rubroApuReferencia: 'APU-ELE-009 & APU-HID-008 • Acometidas, Tableros y Colectores PVC',
    perfilesPresupuestados: [
      {
        codigoPerfilApu: 'MO-PRO-A1-02',
        cargoEspecialidad: 'Ingeniero Eléctrico / Especialista Redes de Obra',
        estructuraCics: 'A1_DIRECCION',
        cantidadSugerida: 1,
        horasHombrePresupuestadasApu: 320,
        horasHombreYaContratadas: 0,
        tarifaHoraTechoApuUSD: 5.25,
        jornalDiarioTechoApuUSD: 42.00,
        duracionFase: '2 Meses (Fase Instalaciones)',
        certificacionExigida: 'Título SENESCYT Ingeniero Eléctrico + Licencia Riesgos Eléctricos CISHT',
        requiereEppAlturaSst: true,
      },
      {
        codigoPerfilApu: 'MO-CICS-C2-03',
        cargoEspecialidad: 'Técnico Electricista Industrial & Tableros',
        estructuraCics: 'C2_ESPECIALISTA',
        cantidadSugerida: 2,
        horasHombrePresupuestadasApu: 480,
        horasHombreYaContratadas: 160,
        tarifaHoraTechoApuUSD: 4.15,
        jornalDiarioTechoApuUSD: 33.20,
        duracionFase: '1 Mes (160 Horas c/u)',
        certificacionExigida: 'Certificación SECAP Instalaciones Eléctricas + Prevención Riesgo Eléctrico',
        requiereEppAlturaSst: true,
      },
      {
        codigoPerfilApu: 'MO-CICS-C2-08',
        cargoEspecialidad: 'Maestro Plomero Hidrosanitario & Termofusión',
        estructuraCics: 'C2_ESPECIALISTA',
        cantidadSugerida: 1,
        horasHombrePresupuestadasApu: 320,
        horasHombreYaContratadas: 80,
        tarifaHoraTechoApuUSD: 4.05,
        jornalDiarioTechoApuUSD: 32.40,
        duracionFase: '6 Semanas (240 Horas)',
        certificacionExigida: 'Certificación SECAP Hidrosanitaria + Instalación Grifería FV/Briggs',
        requiereEppAlturaSst: false,
      },
    ],
  },
  {
    id: 'cron-fase-04',
    codigoFase: 'CRON-FASE-04',
    nombreFaseCronograma: 'Fase 4: Mampostería, Acabados Finos, Porcelanato y Piezas Sanitarias',
    semanasCronograma: 'Semanas 14 a 20 (Cronograma Acabados)',
    avanceActualFasePct: 5,
    rubroApuReferencia: 'APU-MAM-022 & APU-ACA-031 • Albañilería, Porcelanato y Sanitarios',
    perfilesPresupuestados: [
      {
        codigoPerfilApu: 'MO-PRO-A1-05',
        cargoEspecialidad: 'Arquitecto Residente de Acabados & Control Calidad',
        estructuraCics: 'A1_DIRECCION',
        cantidadSugerida: 1,
        horasHombrePresupuestadasApu: 320,
        horasHombreYaContratadas: 0,
        tarifaHoraTechoApuUSD: 5.50,
        jornalDiarioTechoApuUSD: 44.00,
        duracionFase: '2 Meses (Cierre Arquitectónico)',
        certificacionExigida: 'Título SENESCYT Arquitecto + Modelado BIM Revit / Control Acabados',
        requiereEppAlturaSst: true,
      },
      {
        codigoPerfilApu: 'MO-CICS-D2-01',
        cargoEspecialidad: 'Albañil Polivalente / Enchape Porcelanato & Mampostería',
        estructuraCics: 'D2_ALBANIL_FIERRERO',
        cantidadSugerida: 3,
        horasHombrePresupuestadasApu: 1200,
        horasHombreYaContratadas: 480,
        tarifaHoraTechoApuUSD: 3.75,
        jornalDiarioTechoApuUSD: 30.00,
        duracionFase: '6 Semanas (240 Horas c/u)',
        certificacionExigida: 'Certificación SECAP Albañilería y Revestimientos Cerámicos',
        requiereEppAlturaSst: false,
      },
      {
        codigoPerfilApu: 'MO-CICS-E2-01',
        cargoEspecialidad: 'Peón de Construcción Calificado (Base SBU 2026 $482)',
        estructuraCics: 'E2_PEON',
        cantidadSugerida: 4,
        horasHombrePresupuestadasApu: 1600,
        horasHombreYaContratadas: 800,
        tarifaHoraTechoApuUSD: 3.35,
        jornalDiarioTechoApuUSD: 26.80,
        duracionFase: '5 Semanas (200 Horas c/u)',
        certificacionExigida: 'Inducción SST Decreto Ejecutivo 255 + Afiliación IESS CD 513',
        requiereEppAlturaSst: false,
      },
    ],
  },
];

// Padrón Maestro de Profesionales y Trabajadores Registrados en SARA-TALENTO
const PADRON_CANDIDATOS_SARA_TALENTO: Array<{
  talentoId: string;
  nombreCompleto: string;
  cedula: string;
  especialidadCargo: string;
  palabrasClave: string[];
  estructuraCics: 'A1_DIRECCION' | 'B1_MAESTRO_MAYOR' | 'C2_ESPECIALISTA' | 'D2_ALBANIL_FIERRERO' | 'E2_PEON';
  ciudadResidencia: string;
  anilloCobertura: 'ANILLO_1_LOCAL' | 'ANILLO_2_REGIONAL' | 'ANILLO_3_FORANEO';
  distanciaKmObra: number;
  experienciaAnios: number;
  calificacionHistorica: number;
  obrasCompletadasSara: number;
  tarifaHoraPropuestaUSD: number;
  certificacionesVerificadas: string[];
  cumpleSstDecreto255: boolean;
  afiliacionIessActiva: boolean;
  telefonoContacto: string;
  emailContacto: string;
}> = [
  // MAESTROS MAYORES
  {
    talentoId: 'tr-03',
    nombreCompleto: 'Mstr. Andrea Tamayo',
    cedula: '1112028491',
    especialidadCargo: 'Maestro Mayor de Ejecución de Obras Civiles',
    palabrasClave: ['maestro', 'mayor', 'ejecucion', 'estructuras', 'obra'],
    estructuraCics: 'B1_MAESTRO_MAYOR',
    ciudadResidencia: 'Loja (Sector San Sebastián)',
    anilloCobertura: 'ANILLO_1_LOCAL',
    distanciaKmObra: 1.9,
    experienciaAnios: 14,
    calificacionHistorica: 5.0,
    obrasCompletadasSara: 9,
    tarifaHoraPropuestaUSD: 4.39,
    certificacionesVerificadas: [
      'SECAP Maestro Mayor en Obras Civiles',
      'Licencia SST Trabajo en Alturas (Decreto 255)',
      'Lectura de Planos Estructurales NEC-15',
    ],
    cumpleSstDecreto255: true,
    afiliacionIessActiva: true,
    telefonoContacto: '+593 99 123 4567',
    emailContacto: 'andrea.tamayo@profesional.sara.ec',
  },
  {
    talentoId: 'tr-mm-02',
    nombreCompleto: 'Mstr. Segundo Manuel Guamán',
    cedula: '1103849582',
    especialidadCargo: 'Maestro Mayor de Ejecución de Obras Civiles',
    palabrasClave: ['maestro', 'mayor', 'ejecucion', 'estructuras', 'obra'],
    estructuraCics: 'B1_MAESTRO_MAYOR',
    ciudadResidencia: 'Catamayo (Loja)',
    anilloCobertura: 'ANILLO_2_REGIONAL',
    distanciaKmObra: 34.5,
    experienciaAnios: 18,
    calificacionHistorica: 4.8,
    obrasCompletadasSara: 6,
    tarifaHoraPropuestaUSD: 4.55,
    certificacionesVerificadas: [
      'SECAP Maestro Mayor de Obra',
      'Prevención Riesgos Laborales IESS CD 513',
    ],
    cumpleSstDecreto255: true,
    afiliacionIessActiva: true,
    telefonoContacto: '+593 98 765 4321',
    emailContacto: 'segundo.guaman@profesional.sara.ec',
  },
  {
    talentoId: 'tr-mm-03',
    nombreCompleto: 'Mstr. Juan Pérez',
    cedula: '1709283741',
    especialidadCargo: 'Maestro Mayor de Ejecución de Obras Civiles',
    palabrasClave: ['maestro', 'mayor', 'ejecucion', 'estructuras', 'obra'],
    estructuraCics: 'B1_MAESTRO_MAYOR',
    ciudadResidencia: 'Quito (La Magdalena)',
    anilloCobertura: 'ANILLO_3_FORANEO',
    distanciaKmObra: 625.0,
    experienciaAnios: 20,
    calificacionHistorica: 4.9,
    obrasCompletadasSara: 4,
    tarifaHoraPropuestaUSD: 4.85,
    certificacionesVerificadas: ['SECAP Maestro Mayor', 'Trabajo en Alturas'],
    cumpleSstDecreto255: true,
    afiliacionIessActiva: true,
    telefonoContacto: '+593 99 888 1122',
    emailContacto: 'juan.perez@profesional.sara.ec',
  },

  // FIERREROS / ARMADORES Y ENCOFRADORES
  {
    talentoId: 'tr-fie-01',
    nombreCompleto: 'Téc. José Luis Cuenca',
    cedula: '1104829104',
    especialidadCargo: 'Fierrero / Armador de Acero Estructural & Encofrador',
    palabrasClave: ['fierrero', 'armador', 'acero', 'hierro', 'encofrador', 'carpintero'],
    estructuraCics: 'D2_ALBANIL_FIERRERO',
    ciudadResidencia: 'Loja (Barrio Nueva Granada)',
    anilloCobertura: 'ANILLO_1_LOCAL',
    distanciaKmObra: 2.3,
    experienciaAnios: 11,
    calificacionHistorica: 4.9,
    obrasCompletadasSara: 8,
    tarifaHoraPropuestaUSD: 3.68,
    certificacionesVerificadas: [
      'SECAP Armado de Estructuras Sismorresistentes NEC-15',
      'Certificado PTAR Trabajo en Alturas >1.80m',
      'Afiliación IESS Construcción CD 513',
    ],
    cumpleSstDecreto255: true,
    afiliacionIessActiva: true,
    telefonoContacto: '+593 98 412 3980',
    emailContacto: 'joseluis.cuenca@profesional.sara.ec',
  },
  {
    talentoId: 'tr-fie-02',
    nombreCompleto: 'Téc. Marco Vinicio Jaramillo',
    cedula: '1105192837',
    especialidadCargo: 'Fierrero / Carpintero Encofrador de Losas',
    palabrasClave: ['fierrero', 'armador', 'acero', 'encofrador', 'carpintero', 'losas'],
    estructuraCics: 'D2_ALBANIL_FIERRERO',
    ciudadResidencia: 'Loja (Sector Carigán)',
    anilloCobertura: 'ANILLO_1_LOCAL',
    distanciaKmObra: 4.1,
    experienciaAnios: 8,
    calificacionHistorica: 4.7,
    obrasCompletadasSara: 5,
    tarifaHoraPropuestaUSD: 3.78,
    certificacionesVerificadas: [
      'SECAP Carpintería de Ribera y Encofrado Metálico',
      'Inducción SST Decreto Ejecutivo 255',
    ],
    cumpleSstDecreto255: true,
    afiliacionIessActiva: true,
    telefonoContacto: '+593 99 301 4492',
    emailContacto: 'marco.jaramillo@profesional.sara.ec',
  },
  {
    talentoId: 'tr-fie-03',
    nombreCompleto: 'Téc. Darwin Patricio Ordóñez',
    cedula: '0104928371',
    especialidadCargo: 'Fierrero / Armador Estructural',
    palabrasClave: ['fierrero', 'armador', 'acero', 'encofrador', 'carpintero'],
    estructuraCics: 'D2_ALBANIL_FIERRERO',
    ciudadResidencia: 'Cuenca (Totoracocha)',
    anilloCobertura: 'ANILLO_2_REGIONAL',
    distanciaKmObra: 206.0,
    experienciaAnios: 9,
    calificacionHistorica: 4.6,
    obrasCompletadasSara: 3,
    tarifaHoraPropuestaUSD: 4.05,
    certificacionesVerificadas: ['SECAP Fierrería Estructural'],
    cumpleSstDecreto255: true,
    afiliacionIessActiva: true,
    telefonoContacto: '+593 98 991 2034',
    emailContacto: 'darwin.ordonez@profesional.sara.ec',
  },

  // INGENIEROS ELÉCTRICOS / CIVILES / ARQUITECTOS
  {
    talentoId: 'tr-02',
    nombreCompleto: 'Ing. Marcelo Valarezo',
    cedula: '1103948271',
    especialidadCargo: 'Ingeniero Eléctrico / Especialista Redes y Tableros de Obra',
    palabrasClave: ['electrico', 'electricista', 'redes', 'tablero', 'ingeniero', 'instalaciones'],
    estructuraCics: 'A1_DIRECCION',
    ciudadResidencia: 'Loja (Sector El Valle)',
    anilloCobertura: 'ANILLO_1_LOCAL',
    distanciaKmObra: 2.4,
    experienciaAnios: 10,
    calificacionHistorica: 4.9,
    obrasCompletadasSara: 7,
    tarifaHoraPropuestaUSD: 4.89,
    certificacionesVerificadas: [
      'Registro SENESCYT Ingeniero Eléctrico',
      'Licencia Prevención Riesgos Eléctricos CISHT / MDT',
      'Certificación SECAP Media y Baja Tensión',
    ],
    cumpleSstDecreto255: true,
    afiliacionIessActiva: true,
    telefonoContacto: '+593 99 555 7788',
    emailContacto: 'marcelo.valarezo@profesional.sara.ec',
  },
  {
    talentoId: 'tr-01',
    nombreCompleto: 'Ing. Ana Gómez',
    cedula: '1104829173',
    especialidadCargo: 'Ingeniera Civil Residente / Especialista Estructural',
    palabrasClave: ['ingeniero', 'ingeniera', 'civil', 'residente', 'estructural', 'arquitecto', 'acabados'],
    estructuraCics: 'A1_DIRECCION',
    ciudadResidencia: 'Loja (Urb. Rodríguez Witt)',
    anilloCobertura: 'ANILLO_1_LOCAL',
    distanciaKmObra: 1.6,
    experienciaAnios: 12,
    calificacionHistorica: 4.9,
    obrasCompletadasSara: 11,
    tarifaHoraPropuestaUSD: 5.31,
    certificacionesVerificadas: [
      'Título SENESCYT Ingeniería Civil',
      'Certificación PMP & Control Presupuestario APU',
      'Auditoría SST Decreto Ejecutivo 255',
    ],
    cumpleSstDecreto255: true,
    afiliacionIessActiva: true,
    telefonoContacto: '+593 98 421 8973',
    emailContacto: 'ana.gomez@profesional.sara.ec',
  },
  {
    talentoId: 'tr-arq-01',
    nombreCompleto: 'Arq. Ricardo Sánchez',
    cedula: '1714928374',
    especialidadCargo: 'Arquitecto Residente de Acabados & Coordinador BIM',
    palabrasClave: ['arquitecto', 'acabados', 'bim', 'residente', 'porcelanato'],
    estructuraCics: 'A1_DIRECCION',
    ciudadResidencia: 'Loja (Sector Clodoveo)',
    anilloCobertura: 'ANILLO_1_LOCAL',
    distanciaKmObra: 3.1,
    experienciaAnios: 8,
    calificacionHistorica: 4.8,
    obrasCompletadasSara: 5,
    tarifaHoraPropuestaUSD: 5.20,
    certificacionesVerificadas: [
      'Registro SENESCYT Arquitecto',
      'Especialista Revit BIM ISO 19650',
      'Control de Calidad de Acabados Graiman/FV',
    ],
    cumpleSstDecreto255: true,
    afiliacionIessActiva: true,
    telefonoContacto: '+593 99 204 8172',
    emailContacto: 'ricardo.sanchez@profesional.sara.ec',
  },

  // PLOMEROS / HIDROSANITARIOS / ALBAÑILES / PEONES
  {
    talentoId: 'tr-plo-01',
    nombreCompleto: 'Mstr. Klever Bolívar Cueva',
    cedula: '1104192830',
    especialidadCargo: 'Maestro Plomero Hidrosanitario & Especialista Grifería/Sanitarios',
    palabrasClave: ['plomero', 'hidrosanitario', 'tuberia', 'sanitario', 'termofusion', 'agua'],
    estructuraCics: 'C2_ESPECIALISTA',
    ciudadResidencia: 'Loja (Sector Zamora Huayco)',
    anilloCobertura: 'ANILLO_1_LOCAL',
    distanciaKmObra: 2.2,
    experienciaAnios: 13,
    calificacionHistorica: 4.9,
    obrasCompletadasSara: 10,
    tarifaHoraPropuestaUSD: 3.90,
    certificacionesVerificadas: [
      'Certificación SECAP Instalaciones Hidrosanitarias y Gas',
      'Certificado Técnico Instalador Autorizado FV / Briggs / Plastigama',
    ],
    cumpleSstDecreto255: true,
    afiliacionIessActiva: true,
    telefonoContacto: '+593 98 642 1093',
    emailContacto: 'klever.cueva@profesional.sara.ec',
  },
  {
    talentoId: 'tr-alb-01',
    nombreCompleto: 'Mstr. Carlos Eduardo Poma',
    cedula: '1105928174',
    especialidadCargo: 'Albañil Polivalente / Enchape Porcelanato & Mampostería',
    palabrasClave: ['albanil', 'mamposteria', 'porcelanato', 'ceramica', 'bloque', 'peon'],
    estructuraCics: 'D2_ALBANIL_FIERRERO',
    ciudadResidencia: 'Loja (Sector Pedestal)',
    anilloCobertura: 'ANILLO_1_LOCAL',
    distanciaKmObra: 2.7,
    experienciaAnios: 9,
    calificacionHistorica: 4.8,
    obrasCompletadasSara: 7,
    tarifaHoraPropuestaUSD: 3.60,
    certificacionesVerificadas: [
      'Certificación SECAP Albañilería y Revestimientos',
      'Afiliación IESS Activa + SST Decreto 255',
    ],
    cumpleSstDecreto255: true,
    afiliacionIessActiva: true,
    telefonoContacto: '+593 99 441 8273',
    emailContacto: 'carlos.poma@profesional.sara.ec',
  },
  {
    talentoId: 'tr-peo-01',
    nombreCompleto: 'Sr. Luis Alberto Morocho',
    cedula: '1106294821',
    especialidadCargo: 'Peón de Construcción Calificado (CICS E2)',
    palabrasClave: ['peon', 'ayudante', 'construccion', 'excavacion'],
    estructuraCics: 'E2_PEON',
    ciudadResidencia: 'Loja (Sector Obrapía)',
    anilloCobertura: 'ANILLO_1_LOCAL',
    distanciaKmObra: 3.0,
    experienciaAnios: 5,
    calificacionHistorica: 4.8,
    obrasCompletadasSara: 6,
    tarifaHoraPropuestaUSD: 3.15, // Cumple SBU 2026 ($482 -> $3.01/h base + proporcionales)
    certificacionesVerificadas: [
      'Certificado Inducción SST Decreto Ejecutivo 255',
      'Afiliación IESS Construcción CD 513',
    ],
    cumpleSstDecreto255: true,
    afiliacionIessActiva: true,
    telefonoContacto: '+593 98 119 4820',
    emailContacto: 'luis.morocho@profesional.sara.ec',
  },
];

const INITIAL_REQUERIMIENTOS_PERSONAL: RequerimientoPersonalObra[] = [
  {
    id: 'req-per-001',
    numeroRequerimiento: 'REQ-PER-OBRA-2026-014',
    fechaEmision: '2026-10-20',
    horaEmision: '09:30',
    proyectoId: 'proy-torre-loja',
    proyectoNombre: 'Torre SARA Loja (Pisos 4-8)',
    ciudadObra: 'Loja',
    frenteObraEspecifico: 'Pórticos Sismorresistentes Ejes A-E y Acometida Eléctrica Nivel 5',
    faseCronogramaId: 'cron-fase-02',
    faseCronogramaNombre: 'Fase 2: Superestructura Sismorresistente NEC-15 (Semanas 5 a 12)',
    solicitadoPorTecnico: 'Ing. David Sarango (Residente de Obra)',
    cargoSolicitante: 'Ingeniero Residente Principal',
    origen: 'CRONOGRAMA_Y_APU',
    prioridad: 'URGENTE_48H',
    justificacionCronograma:
      'Según ruta crítica del Cronograma (Semana 6) y Presupuesto APU-EST-014 / APU-ELE-009, se requiere incorporar Maestro Mayor estructural, Armadores de Acero e Ingeniero Eléctrico para liberar losa del Nivel 5.',
    estadoGeneral: 'PENDIENTE_CONTRATACION',
    vacantes: [
      {
        id: 'vac-001',
        codigoPerfilApu: 'MO-CICS-B1-01',
        cargoEspecialidad: 'Maestro Mayor de Ejecución de Obras Civiles',
        estructuraCics: 'B1_MAESTRO_MAYOR',
        rubroApuRelacionado: 'APU-EST-014 • Hormigón Estructural en Columnas f\'c=280 kg/cm²',
        faseCronograma: 'Fase 2: Superestructura (Semanas 5 a 12)',
        cantidadPersonasRequeridas: 1,
        horasHombrePresupuestadasApu: 320,
        tarifaHoraTechoApuUSD: 4.65,
        jornalDiarioTechoApuUSD: 37.20,
        fechaInicioCronograma: '2026-10-22',
        fechaFinCronograma: '2026-12-22',
        duracionEstimada: '2 Meses (320 Horas)',
        certificacionExigida: 'Certificación SECAP Maestro Mayor + Lectura Planos NEC-15',
        requiereEppAlturaSst: true,
        estadoVacante: 'PENDIENTE_EVALUACION_IA',
      },
      {
        id: 'vac-002',
        codigoPerfilApu: 'MO-PRO-A1-02',
        cargoEspecialidad: 'Ingeniero Eléctrico / Especialista Redes de Obra',
        estructuraCics: 'A1_DIRECCION',
        rubroApuRelacionado: 'APU-ELE-009 • Tableros de Distribución y Acometida Subterránea',
        faseCronograma: 'Fase 3: Instalaciones Eléctricas (Semanas 10 a 16)',
        cantidadPersonasRequeridas: 1,
        horasHombrePresupuestadasApu: 320,
        tarifaHoraTechoApuUSD: 5.25,
        jornalDiarioTechoApuUSD: 42.00,
        fechaInicioCronograma: '2026-10-24',
        fechaFinCronograma: '2026-12-24',
        duracionEstimada: '2 Meses (Fase Instalaciones)',
        certificacionExigida: 'Título SENESCYT Ingeniero Eléctrico + Riesgos Eléctricos CISHT',
        requiereEppAlturaSst: true,
        estadoVacante: 'PENDIENTE_EVALUACION_IA',
      },
      {
        id: 'vac-003',
        codigoPerfilApu: 'MO-CICS-D2-04',
        cargoEspecialidad: 'Fierrero / Armador de Acero Estructural',
        estructuraCics: 'D2_ALBANIL_FIERRERO',
        rubroApuRelacionado: 'APU-EST-014 • Acero de Refuerzo fy=4200 kg/cm²',
        faseCronograma: 'Fase 2: Superestructura (Semanas 5 a 12)',
        cantidadPersonasRequeridas: 2,
        horasHombrePresupuestadasApu: 480,
        tarifaHoraTechoApuUSD: 3.85,
        jornalDiarioTechoApuUSD: 30.80,
        fechaInicioCronograma: '2026-10-22',
        fechaFinCronograma: '2026-12-05',
        duracionEstimada: '6 Semanas (240 Horas c/u)',
        certificacionExigida: 'Certificación SECAP Armado Estructural + Trabajo en Alturas PTAR',
        requiereEppAlturaSst: true,
        estadoVacante: 'PENDIENTE_EVALUACION_IA',
      },
    ],
  },
];

export class ObraPersonalRequestService {
  public static getPlantillasCronogramaApu(): PlantillaFaseCronogramaApuPersonal[] {
    return PLANTILLAS_CRONOGRAMA_APU_PERSONAL;
  }

  public static getRequerimientosPersonal(): RequerimientoPersonalObra[] {
    if (typeof window === 'undefined') return INITIAL_REQUERIMIENTOS_PERSONAL;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_REQ_PERSONAL);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_REQ_PERSONAL, JSON.stringify(INITIAL_REQUERIMIENTOS_PERSONAL));
        return INITIAL_REQUERIMIENTOS_PERSONAL;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_REQUERIMIENTOS_PERSONAL;
    }
  }

  public static saveRequerimientosPersonal(lista: RequerimientoPersonalObra[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_REQ_PERSONAL, JSON.stringify(lista));
    window.dispatchEvent(new CustomEvent('sara_requerimientos_personal_updated'));
  }

  /**
   * Crea un nuevo Requerimiento de Profesionales/Trabajadores desde la obra (Residente / Técnico Encargado)
   * y lo envía a la bandeja de `Directorio y Recursos -> Contratación Personal`.
   */
  public static crearRequerimientoPersonalObra(
    nuevo: Omit<
      RequerimientoPersonalObra,
      'id' | 'numeroRequerimiento' | 'fechaEmision' | 'horaEmision' | 'estadoGeneral'
    >
  ): RequerimientoPersonalObra {
    const actuales = this.getRequerimientosPersonal();
    const correlativo = actuales.length + 14;
    const creado: RequerimientoPersonalObra = {
      ...nuevo,
      id: `req-per-${Date.now()}`,
      numeroRequerimiento: `REQ-PER-OBRA-2026-0${correlativo}`,
      fechaEmision: new Date().toISOString().split('T')[0],
      horaEmision: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
      estadoGeneral: 'PENDIENTE_CONTRATACION',
    };

    this.saveRequerimientosPersonal([creado, ...actuales]);
    return creado;
  }

  /**
   * AGENTE IA SARA-TALENTOHUMANO:
   * Cruza una vacante requerida con la base de datos de `SARA-TALENTO`, evaluando la idoneidad
   * técnica, económica (vs Presupuesto APU), geográfica (Anillo 1 Local -> Anillo 2 Regional -> Anillo 3 Foráneo)
   * y normativa (SECAP/SENESCYT + SST Decreto Ejecutivo 255 + IESS CD 513).
   */
  public static evaluarCandidatosIdoneosIA(
    vacante: VacanteRequeridaObra,
    ciudadObra: string = 'Loja'
  ): CandidatoIdoneoulacionIA[] {
    const textoVacante = `${vacante.cargoEspecialidad} ${vacante.codigoPerfilApu} ${vacante.certificacionExigida}`.toLowerCase();
    const descartados = new Set(vacante.candidatosDescartadosIds || []);

    // Filtrar candidatos afines por especialidad o estructura CICS, y completar con el resto como respaldo
    const afines = PADRON_CANDIDATOS_SARA_TALENTO.filter(c => {
      if (c.estructuraCics === vacante.estructuraCics) return true;
      return c.palabrasClave.some(pk => textoVacante.includes(pk));
    });

    const poolBase = afines.length >= 2 ? afines : PADRON_CANDIDATOS_SARA_TALENTO;

    const evaluados: CandidatoIdoneoulacionIA[] = poolBase
      .filter(c => !descartados.has(c.talentoId))
      .map(c => {
        // 1. Score de Reputación en Obras Previas (Máx 35 pts)
        const reputacionObrasPts = Math.min(
          35,
          Math.round((c.calificacionHistorica / 5.0) * 28 + Math.min(7, c.obrasCompletadasSara))
        );

        // 2. Score de Cercanía GPS por Anillos (Máx 25 pts — Prioriza 1ra Opción Local)
        const cercaniaGpsPts =
          c.anilloCobertura === 'ANILLO_1_LOCAL'
            ? 25
            : c.anilloCobertura === 'ANILLO_2_REGIONAL'
            ? 17
            : 9;

        // 3. Score de Viabilidad Económica vs Techo Presupuesto APU (Máx 20 pts)
        const techoHora = vacante.tarifaHoraTechoApuUSD > 0 ? vacante.tarifaHoraTechoApuUSD : 4.5;
        const diffHora = +(c.tarifaHoraPropuestaUSD - techoHora).toFixed(2);
        const dentroTechoApu = diffHora <= 0;
        const viabilidadApuPts = dentroTechoApu
          ? 20
          : diffHora <= 0.35
          ? 14
          : 8;

        // 4. Score de Certificaciones SECAP / SENESCYT (Máx 10 pts)
        const certificacionesSecapSenescytPts =
          c.certificacionesVerificadas.length >= 3
            ? 10
            : c.certificacionesVerificadas.length === 2
            ? 9
            : 7;

        // 5. Score de Cumplimiento SST Decreto 255 e IESS CD 513 (Máx 10 pts)
        const cumplimientoSstIessPts =
          c.cumpleSstDecreto255 && c.afiliacionIessActiva ? 10 : 5;

        const scoreIdoneidadTotal =
          reputacionObrasPts +
          cercaniaGpsPts +
          viabilidadApuPts +
          certificacionesSecapSenescytPts +
          cumplimientoSstIessPts;

        const jornalDiarioPropuestoUSD = +(c.tarifaHoraPropuestaUSD * 8).toFixed(2);
        const requiereAlojamientoStays = c.anilloCobertura === 'ANILLO_3_FORANEO';

        const etiquetaCercania =
          c.anilloCobertura === 'ANILLO_1_LOCAL'
            ? `🟢 1° Opción Local (${c.distanciaKmObra} km de la obra)`
            : c.anilloCobertura === 'ANILLO_2_REGIONAL'
            ? `🟡 2° Opción Regional (${c.distanciaKmObra} km)`
            : `🔵 3° Opción Foráneo (${c.distanciaKmObra} km • Requiere Alojamiento)`;

        return {
          talentoId: c.talentoId,
          nombreCompleto: c.nombreCompleto,
          cedula: c.cedula,
          especialidadCargo: c.especialidadCargo,
          estructuraCics: c.estructuraCics,
          ciudadResidencia: c.ciudadResidencia,
          anilloCobertura: c.anilloCobertura,
          etiquetaCercania,
          distanciaKmObra: c.distanciaKmObra,
          requiereAlojamientoStays,
          experienciaAnios: c.experienciaAnios,
          calificacionHistorica: c.calificacionHistorica,
          obrasCompletadasSara: c.obrasCompletadasSara,
          tarifaHoraPropuestaUSD: c.tarifaHoraPropuestaUSD,
          jornalDiarioPropuestoUSD,
          dentroTechoApu,
          ahorroOSobrecostoHoraUSD: diffHora,
          certificacionesVerificadas: c.certificacionesVerificadas,
          cumpleSstDecreto255: c.cumpleSstDecreto255,
          afiliacionIessActiva: c.afiliacionIessActiva,
          telefonoContacto: c.telefonoContacto,
          emailContacto: c.emailContacto,
          scoreIdoneidadTotal,
          desgloseScore: {
            reputacionObrasPts,
            cercaniaGpsPts,
            viabilidadApuPts,
            certificacionesSecapSenescytPts,
            cumplimientoSstIessPts,
          },
          esMasIdoneoIA: false,
          dictamenAgenteIA: '',
        };
      })
      .sort((a, b) => b.scoreIdoneidadTotal - a.scoreIdoneidadTotal);

    return evaluados.map((cand, index) => {
      const esGanador = index === 0;
      const ahorroTotalEstimado = +(
        Math.abs(cand.ahorroOSobrecostoHoraUSD) * vacante.horasHombrePresupuestadasApu
      ).toFixed(2);

      let dictamen = '';
      if (esGanador) {
        dictamen = `★ CANDIDATO MÁS IDÓNEO (${cand.scoreIdoneidadTotal}% IA): Reside a ${cand.distanciaKmObra} km (${cand.ciudadResidencia}), calificación ${cand.calificacionHistorica.toFixed(1)}★ en ${cand.obrasCompletadasSara} obras SARA, acreditado en ${cand.certificacionesVerificadas[0]} y tarifa de $${cand.tarifaHoraPropuestaUSD.toFixed(2)}/h ${
          cand.dentroTechoApu
            ? `(Dentro del Techo APU de $${vacante.tarifaHoraTechoApuUSD.toFixed(2)}/h, generando $${ahorroTotalEstimado} USD de ahorro presupuestario)`
            : `(Ligeramente sobre el techo APU)`
        }.`;
      } else if (cand.anilloCobertura === 'ANILLO_2_REGIONAL') {
        dictamen = `Opción #${index + 1} Regional (${cand.scoreIdoneidadTotal}% IA): A ${cand.distanciaKmObra} km (${cand.ciudadResidencia}). Excelente respaldo si el candidato #1 no acepta la plaza.`;
      } else if (cand.requiereAlojamientoStays) {
        dictamen = `Opción #${index + 1} Foráneo (${cand.scoreIdoneidadTotal}% IA): Alta experiencia (${cand.experienciaAnios} años), pero reside a ${cand.distanciaKmObra} km y activaría reserva en SARA-ALOJAMIENTO.`;
      } else {
        dictamen = `Opción #${index + 1} Local (${cand.scoreIdoneidadTotal}% IA): A ${cand.distanciaKmObra} km de la obra con ${cand.experienciaAnios} años de experiencia verificada.`;
      }

      return {
        ...cand,
        esMasIdoneoIA: esGanador,
        dictamenAgenteIA: dictamen,
      };
    });
  }

  /**
   * Acción del botón "Contratar y Notificar en SARA-TALENTO":
   * 1. Registra la oferta contractual en `SaraTalentoRequestsService` (`REQ-TAL-XXXXXX`).
   * 2. Marca la vacante como `NOTIFICADO_EN_SARA_TALENTO` esperando la aceptación del profesional/trabajador.
   */
  public static contratarYNotificarEnSaraTalento(params: {
    requerimientoId: string;
    vacanteId: string;
    candidato: CandidatoIdoneoulacionIA;
    empresaInfo?: {
      razonSocial: string;
      ruc: string;
      representante: string;
      cargo: string;
      telefono: string;
      email: string;
    };
  }): {
    requerimientoActualizado: RequerimientoPersonalObra;
    solicitudTalentoCreada: SolicitudPersonalEmpresa;
  } {
    const lista = this.getRequerimientosPersonal();
    const rIdx = lista.findIndex(r => r.id === params.requerimientoId);
    if (rIdx < 0) {
      throw new Error('Requerimiento de personal no encontrado');
    }

    const req = lista[rIdx];
    const vIdx = req.vacantes.findIndex(v => v.id === params.vacanteId);
    if (vIdx < 0) {
      throw new Error('Vacante no encontrada en el requerimiento');
    }

    const vacante = req.vacantes[vIdx];

    // 1. Registrar el pedido formalmente en SARA-TALENTO (`SaraTalentoRequestsService`)
    const solicitudTalentoCreada = SaraTalentoRequestsService.crearSolicitud({
      empresa_solicitante: {
        razon_social: params.empresaInfo?.razonSocial || 'GRUPO SARA CONSTRUCTORA S.A.S.',
        ruc: params.empresaInfo?.ruc || '1191782341001',
        representante: params.empresaInfo?.representante || req.solicitadoPorTecnico,
        cargo: params.empresaInfo?.cargo || 'Dirección de Talento Humano & Operaciones',
        telefono: params.empresaInfo?.telefono || '+593 98 180 4023',
        email: params.empresaInfo?.email || 'contrataciones@gruposara.ec',
        ciudad: `${req.ciudadObra}, Ecuador`,
      },
      trabajador: {
        id: params.candidato.talentoId,
        nombre_completo: params.candidato.nombreCompleto,
        cedula: params.candidato.cedula,
        categoria_ocupacional: vacante.cargoEspecialidad,
        calificacion: params.candidato.calificacionHistorica,
        jornal_real: params.candidato.jornalDiarioPropuestoUSD,
        costo_horario: params.candidato.tarifaHoraPropuestaUSD,
        telefono: params.candidato.telefonoContacto,
        email: params.candidato.emailContacto,
      },
      obra_destino: `${req.proyectoNombre} — ${req.frenteObraEspecifico}`,
      duracion: `${vacante.duracionEstimada} (${vacante.faseCronograma})`,
      fecha_inicio: vacante.fechaInicioCronograma,
      epp_requerido: vacante.requiereEppAlturaSst,
      notas_adicionales: `[Origen: ${req.numeroRequerimiento} • Rubro APU: ${vacante.rubroApuRelacionado || vacante.codigoPerfilApu}] Seleccionado por Agente IA SARA-TALENTOHUMANO con Score de Idoneidad ${params.candidato.scoreIdoneidadTotal}%. Certificación: ${vacante.certificacionExigida}.`,
    });

    // 2. Actualizar estado de la vacante y del requerimiento
    const vacanteActualizada: VacanteRequeridaObra = {
      ...vacante,
      estadoVacante: 'NOTIFICADO_EN_SARA_TALENTO',
      candidatoSeleccionadoId: params.candidato.talentoId,
      candidatoSeleccionadoNombre: params.candidato.nombreCompleto,
      candidatoSeleccionadoCedula: params.candidato.cedula,
      candidatoSeleccionadoTarifaHoraUSD: params.candidato.tarifaHoraPropuestaUSD,
      candidatoSeleccionadoDistanciaKm: params.candidato.distanciaKmObra,
      candidatoSeleccionadoScoreIA: params.candidato.scoreIdoneidadTotal,
      saraTalentoSolicitudId: solicitudTalentoCreada.id,
      fechaNotificacionTalento: solicitudTalentoCreada.fecha_solicitud,
      motivoRechazoTrabajador: undefined,
    };

    const nuevasVacantes = req.vacantes.map((v, i) => (i === vIdx ? vacanteActualizada : v));
    const estadoGeneral = this.calcularEstadoGeneral(nuevasVacantes);

    const requerimientoActualizado: RequerimientoPersonalObra = {
      ...req,
      estadoGeneral,
      vacantes: nuevasVacantes,
    };

    lista[rIdx] = requerimientoActualizado;
    this.saveRequerimientosPersonal(lista);

    return {
      requerimientoActualizado,
      solicitudTalentoCreada,
    };
  }

  /**
   * Procesa la respuesta del Profesional o Trabajador desde SARA-TALENTO (Aceptar o Rechazar el Contrato)
   */
  public static procesarRespuestaTrabajadorContrato(params: {
    saraTalentoSolicitudId: string;
    decision: 'ACEPTAR_CONTRATO' | 'RECHAZAR_CONTRATO';
    motivoRechazo?: string;
  }): RequerimientoPersonalObra | null {
    if (params.decision === 'ACEPTAR_CONTRATO') {
      SaraTalentoRequestsService.aceptarSolicitud(params.saraTalentoSolicitudId);
    } else {
      SaraTalentoRequestsService.rechazarSolicitud(
        params.saraTalentoSolicitudId,
        params.motivoRechazo || 'No dispone de disponibilidad en las fechas del cronograma.'
      );
    }

    const lista = this.getRequerimientosPersonal();
    let reqModificado: RequerimientoPersonalObra | null = null;
    const ahora = new Date().toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' });

    const nuevaLista = lista.map(req => {
      let huboCambio = false;
      const vacantesActualizadas = req.vacantes.map(vac => {
        if (vac.saraTalentoSolicitudId !== params.saraTalentoSolicitudId) return vac;
        huboCambio = true;
        if (params.decision === 'ACEPTAR_CONTRATO') {
          return {
            ...vac,
            estadoVacante: 'CONTRATO_ACEPTADO_ACTIVO' as EstadoVacanteRequerida,
            fechaRespuestaTrabajador: ahora,
          };
        } else {
          const descartadosPrev = vac.candidatosDescartadosIds || [];
          const nuevosDescartados = vac.candidatoSeleccionadoId
            ? [...descartadosPrev, vac.candidatoSeleccionadoId]
            : descartadosPrev;
          return {
            ...vac,
            estadoVacante: 'CONTRATO_RECHAZADO_POR_TRABAJADOR' as EstadoVacanteRequerida,
            fechaRespuestaTrabajador: ahora,
            motivoRechazoTrabajador:
              params.motivoRechazo || 'El profesional declinó la oferta por cruce de agenda.',
            candidatosDescartadosIds: nuevosDescartados,
          };
        }
      });

      if (!huboCambio) return req;
      const actualizado: RequerimientoPersonalObra = {
        ...req,
        estadoGeneral: this.calcularEstadoGeneral(vacantesActualizadas),
        vacantes: vacantesActualizadas,
      };
      reqModificado = actualizado;
      return actualizado;
    });

    if (reqModificado) {
      this.saveRequerimientosPersonal(nuevaLista);
    }
    return reqModificado;
  }

  /**
   * Sincroniza automáticamente el estado de las vacantes con cualquier cambio hecho en `SaraTalentoRequestsService`
   */
  public static sincronizarConSaraTalento(): RequerimientoPersonalObra[] {
    const solicitudesTalento = SaraTalentoRequestsService.getSolicitudes();
    const mapaTalento = new Map(solicitudesTalento.map(s => [s.id, s]));
    const lista = this.getRequerimientosPersonal();
    let huboCambios = false;

    const sincronizada = lista.map(req => {
      const vacs = req.vacantes.map(v => {
        if (!v.saraTalentoSolicitudId) return v;
        const sol = mapaTalento.get(v.saraTalentoSolicitudId);
        if (!sol) return v;

        if (
          (sol.estado === 'aceptado' || sol.estado === 'formalizado') &&
          v.estadoVacante !== 'CONTRATO_ACEPTADO_ACTIVO'
        ) {
          huboCambios = true;
          return {
            ...v,
            estadoVacante: 'CONTRATO_ACEPTADO_ACTIVO' as EstadoVacanteRequerida,
            fechaRespuestaTrabajador: sol.fecha_aceptacion || new Date().toLocaleDateString('es-EC'),
          };
        }

        if (
          sol.estado === 'rechazado' &&
          v.estadoVacante !== 'CONTRATO_RECHAZADO_POR_TRABAJADOR'
        ) {
          huboCambios = true;
          return {
            ...v,
            estadoVacante: 'CONTRATO_RECHAZADO_POR_TRABAJADOR' as EstadoVacanteRequerida,
            motivoRechazoTrabajador: 'Oferta rechazada por el trabajador desde su portal SARA-TALENTO.',
          };
        }

        return v;
      });

      return {
        ...req,
        estadoGeneral: this.calcularEstadoGeneral(vacs),
        vacantes: vacs,
      };
    });

    if (huboCambios) {
      this.saveRequerimientosPersonal(sincronizada);
    }
    return sincronizada;
  }

  private static calcularEstadoGeneral(
    vacantes: VacanteRequeridaObra[]
  ): EstadoRequerimientoPersonalObra {
    if (vacantes.every(v => v.estadoVacante === 'CONTRATO_ACEPTADO_ACTIVO')) {
      return 'CONTRATACION_COMPLETA';
    }
    if (vacantes.some(v => v.estadoVacante === 'CONTRATO_RECHAZADO_POR_TRABAJADOR')) {
      return 'REQUIERE_REASIGNACION';
    }
    if (
      vacantes.some(
        v =>
          v.estadoVacante === 'NOTIFICADO_EN_SARA_TALENTO' ||
          v.estadoVacante === 'CONTRATO_ACEPTADO_ACTIVO'
      )
    ) {
      return 'EN_PROCESO_ACEPTACION_TALENTO';
    }
    return 'PENDIENTE_CONTRATACION';
  }
}
