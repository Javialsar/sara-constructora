/**
 * SARA Vacantes & Reclutamiento Service
 * Gestión integral de Bolsa de Empleo Civil y Embudo Kanban de Reclutamiento
 * Ecosistema GRUPO SARA Constructora (Ecuador 2026)
 */

import { createSupabaseBrowserClient } from '../supabase-browser';

export type CategoriaCICS =
  | 'A1_DIRECCION'
  | 'B1_MAESTRO_MAYOR'
  | 'C2_ESPECIALISTA'
  | 'D2_ALBANIL_FIERRERO'
  | 'E2_PEON';

export type TipoContratoLaboral =
  | 'Obra cierta'
  | 'Servicios profesionales'
  | 'Jornal por tarea'
  | 'Plazo fijo';

export interface VacanteEmpleo {
  id: string; // ej: VAC-EC-2026-001
  titulo: string;
  especialidad: string;
  categoriaCics: CategoriaCICS;
  empresa: string;
  rucEmpresa: string;
  obraDestino: string;
  provincia: string;
  canton: string;
  tipoContrato: TipoContratoLaboral;
  modalidad: 'Presencial en Obra' | 'Mixta / Residencia' | 'Turno Rotativo';
  jornalDiarioUSD: number;
  salarioMensualUSD: number;
  tarifaHoraUSD: number;
  vacantesDisponibles: number;
  vacantesCubiertas: number;
  experienciaMinimaAnios: number;
  certificacionesRequeridas: string[];
  descripcion: string;
  responsabilidades: string[];
  beneficios: string[];
  fechaPublicacion: string;
  fechaCierre: string;
  estado: 'activa' | 'en_proceso' | 'cerrada';
  urgencia: 'Normal' | 'Prioritaria' | 'Urgente 48h';
}

export type EtapaReclutamiento =
  | 'recibidas'
  | 'en_revision'
  | 'preseleccionadas'
  | 'entrevista'
  | 'evaluacion_tecnica'
  | 'contratacion_escrow';

export interface NotaEvaluacion {
  id: string;
  autor: string;
  cargo: string;
  texto: string;
  fecha: string;
}

export interface HitoEscrowContrato {
  id: string;
  descripcion: string;
  porcentaje: number;
  montoUSD: number;
  estado: 'pendiente' | 'liberado' | 'en_custodia';
}

export interface CandidatoPostulacion {
  id: string; // ej: POST-EC-91024
  vacanteId: string;
  vacanteTitulo: string;
  obraDestino: string;
  nombreCandidato: string;
  cedula: string;
  email: string;
  telefono: string;
  especialidad: string;
  categoriaCics: CategoriaCICS;
  provincia: string;
  canton: string;
  experienciaAnios: number;
  calificacionRating: number;
  tarifaPropuestaUSD: number;
  tipoTarifa: 'hora' | 'jornal' | 'mensual';
  mensajePresentacion: string;
  certificaciones: string[];
  documentos: {
    nombre: string;
    tipo: 'CV' | 'SECAP' | 'SENESCYT' | 'CEDULA' | 'ALTURAS' | 'IESS';
    verificado: boolean;
  }[];
  etapa: EtapaReclutamiento;
  fechaPostulacion: string;
  notasEmpresa: NotaEvaluacion[];
  contratoFormalizado?: boolean;
  contratoData?: {
    fechaInicio: string;
    duracionMeses: number;
    montoTotalEscrowUSD: number;
    anticipoPorcentaje: number;
    retencionIessPatronal: number; // 12.15%
    hitos: HitoEscrowContrato[];
    fechaFormalizacion: string;
  };
}

const STORAGE_KEY_VACANTES = 'sara_vacantes_empleo_v1';
const STORAGE_KEY_POSTULACIONES = 'sara_candidatos_postulaciones_v1';

// ============================================================================
// VACANTES SEMILLA - CALIBRADAS AL SECTOR DE LA CONSTRUCCIÓN ECUATORIANA
// ============================================================================
export const VACANTES_SEMILLA: VacanteEmpleo[] = [
  {
    id: 'VAC-EC-2026-001',
    titulo: 'Ingeniero Residente de Estructuras Postensadas',
    especialidad: 'Ingeniería Civil',
    categoriaCics: 'A1_DIRECCION',
    empresa: 'CONSTRUCTORA EL MIRADOR S.A.S.',
    rucEmpresa: '1190048291001',
    obraDestino: 'Torre Bellavista Norte (Pichincha)',
    provincia: 'Pichincha',
    canton: 'Quito (La Carolina)',
    tipoContrato: 'Obra cierta',
    modalidad: 'Presencial en Obra',
    jornalDiarioUSD: 65,
    salarioMensualUSD: 1850,
    tarifaHoraUSD: 8.12,
    vacantesDisponibles: 2,
    vacantesCubiertas: 1,
    experienciaMinimaAnios: 5,
    certificacionesRequeridas: [
      'Registro Profesional SENESCYT',
      'Trabajo en Alturas Decreto 255',
      'Certificación Postensado PTI / ACI'
    ],
    descripcion:
      'Se requiere Ingeniero Civil con experiencia comprobada en cálculo, tesado y fiscalización de losas postensadas y vigas de gran peralte. Control de vaciado de hormigón f’c=350 kg/cm² bajo norma NEC-15.',
    responsabilidades: [
      'Supervisión del trazado y tesado de cables no adheridos de postensado.',
      'Aprobación de Libro de Obra diario y fiscalización de probetas de hormigón con laboratorio.',
      'Control del cumplimiento SST de cuadrillas bajo Resolución CD 513 IESS.'
    ],
    beneficios: [
      'Afiliación al IESS desde el primer día con sectorial de construcción CICS.',
      'EPP certificado clase dieléctrica y arnés integral ANSI Z359.',
      'Almuerzo en comedor técnico de campamento y bono de cumplimiento de cronograma.'
    ],
    fechaPublicacion: '2026-10-18',
    fechaCierre: '2026-11-15',
    estado: 'activa',
    urgencia: 'Urgente 48h'
  },
  {
    id: 'VAC-EC-2026-002',
    titulo: 'Maestro Mayor de Obra Civil & Encofrados',
    especialidad: 'Maestro Mayor',
    categoriaCics: 'B1_MAESTRO_MAYOR',
    empresa: 'GRUPO SARA Constructora S.A.',
    rucEmpresa: '1191782341001',
    obraDestino: 'Complejo Habitacional Las Acacias (Guayas)',
    provincia: 'Guayas',
    canton: 'Samborondón',
    tipoContrato: 'Obra cierta',
    modalidad: 'Presencial en Obra',
    jornalDiarioUSD: 38,
    salarioMensualUSD: 980,
    tarifaHoraUSD: 4.75,
    vacantesDisponibles: 3,
    vacantesCubiertas: 1,
    experienciaMinimaAnios: 8,
    certificacionesRequeridas: [
      'Competencia Laboral SECAP Maestro de Obra',
      'Lectura de Planos Arquitectónicos y Estructurales',
      'Prevención de Riesgos en Construcción'
    ],
    descripcion:
      'Liderazgo y dirección operativa de cuadrillas de albañilería, encofrado fenólico metálico y vaciado de losas para proyecto residencial de 4 torres.',
    responsabilidades: [
      'Distribución de tareas a cuadrillas de fierreros, encofradores y peones.',
      'Recepción y cubicación de hormigón premezclado en obra.',
      'Cuidado estricto del uso de EPP y reporte de incidentes al Residente de Obra.'
    ],
    beneficios: [
      'Contrato formal con fondo de reserva y horas suplementarias al 50%/100%.',
      'EPP completo de dotación y caja de herramientas de precisión.',
      'Seguro colectivo contra accidentes laborales.'
    ],
    fechaPublicacion: '2026-10-19',
    fechaCierre: '2026-11-20',
    estado: 'activa',
    urgencia: 'Prioritaria'
  },
  {
    id: 'VAC-EC-2026-003',
    titulo: 'Topógrafo de Precisión GNSS & Estación Total',
    especialidad: 'Topografía',
    categoriaCics: 'C2_ESPECIALISTA',
    empresa: 'VIALES DEL SUR CONSORCIO',
    rucEmpresa: '1792019482001',
    obraDestino: 'Paso Lateral Sur Loja-Catamayo',
    provincia: 'Loja',
    canton: 'Loja (San Sebastián)',
    tipoContrato: 'Servicios profesionales',
    modalidad: 'Presencial en Obra',
    jornalDiarioUSD: 50,
    salarioMensualUSD: 1350,
    tarifaHoraUSD: 6.25,
    vacantesDisponibles: 1,
    vacantesCubiertas: 0,
    experienciaMinimaAnios: 4,
    certificacionesRequeridas: [
      'Certificación Topografía Civil 3D',
      'Manejo de Receptores GNSS RTK y Drones RTK',
      'Licencia de Conducir Tipo B'
    ],
    descripcion:
      'Replanteo geométrico de ejes viales, cálculo de movimiento de tierras y control de taludes bajo especificaciones MTOP.',
    responsabilidades: [
      'Levantamiento y replanteo de alineamientos horizontales y verticales.',
      'Generación de secciones transversales y cálculo de volúmenes de corte y relleno.',
      'Sincronización con modelos BIM/CAD de la fiscalización.'
    ],
    beneficios: [
      'Vehículo 4x4 provisto por el consorcio para movilización en frentes de obra.',
      'Equipo GNSS doble frecuencia Leica / Trimble de última generación.',
      'Viáticos diarios de alimentación y hospedaje en campamento.'
    ],
    fechaPublicacion: '2026-10-20',
    fechaCierre: '2026-11-10',
    estado: 'activa',
    urgencia: 'Normal'
  },
  {
    id: 'VAC-EC-2026-004',
    titulo: 'Fierrero Especialista en Armado y Doblado de Estructuras',
    especialidad: 'Fierrero',
    categoriaCics: 'D2_ALBANIL_FIERRERO',
    empresa: 'URBANIZADORA DEL VALLE CÍA. LTDA.',
    rucEmpresa: '0190184729001',
    obraDestino: 'Condominio Río Yanuncay (Azuay)',
    provincia: 'Azuay',
    canton: 'Cuenca (El Vergel)',
    tipoContrato: 'Obra cierta',
    modalidad: 'Presencial en Obra',
    jornalDiarioUSD: 30,
    salarioMensualUSD: 720,
    tarifaHoraUSD: 3.75,
    vacantesDisponibles: 4,
    vacantesCubiertas: 2,
    experienciaMinimaAnios: 3,
    certificacionesRequeridas: [
      'SECAP Certificación de Fierrero Armador',
      'Seguridad en Obras de Construcción'
    ],
    descripcion:
      'Corte, doblado y armado de canastillas de columnas, zapatas aisladas y vigas de cimentación con acero corrugado de 16mm a 32mm según despiece estructural.',
    responsabilidades: [
      'Armado de canastillas cumpliendo recubrimientos mínimos con separadores de hormigón.',
      'Amarre con alambre galvanizado #18 sin holguras.',
      'Limpieza y despeje de rebabas y sobrantes de corte de acero.'
    ],
    beneficios: [
      'Salario puntual semanal con liquidación de beneficios de ley.',
      'Guantes anticorte, gafas protectoras y calzado con punta de acero de dotación.',
      'Capacitación continua en nuevas técnicas de encofrado y armado.'
    ],
    fechaPublicacion: '2026-10-21',
    fechaCierre: '2026-11-25',
    estado: 'activa',
    urgencia: 'Normal'
  },
  {
    id: 'VAC-EC-2026-005',
    titulo: 'Operador de Maquinaria Pesada (Excavadora 320D & Volqueta)',
    especialidad: 'Operador Maquinaria Pesada',
    categoriaCics: 'C2_ESPECIALISTA',
    empresa: 'TERRAMOVIL LOGÍSTICA S.A.',
    rucEmpresa: '1391827401001',
    obraDestino: 'Parque Logístico Portuario Manta (Manabí)',
    provincia: 'Manabí',
    canton: 'Manta (Tarqui)',
    tipoContrato: 'Plazo fijo',
    modalidad: 'Presencial en Obra',
    jornalDiarioUSD: 45,
    salarioMensualUSD: 1100,
    tarifaHoraUSD: 5.62,
    vacantesDisponibles: 2,
    vacantesCubiertas: 0,
    experienciaMinimaAnios: 4,
    certificacionesRequeridas: [
      'Licencia Profesional Tipo G vigente (ANT)',
      'Certificación SECAP Operación de Excavadora sobre Orugas',
      'Curso de Manejo Defensivo y Seguridad Minera/Civil'
    ],
    descripcion:
      'Excavación masiva, perfilado de taludes y carguío de volquetas de 14 m³ en suelo compactado y roca fragmentada.',
    responsabilidades: [
      'Inspección pre-operacional diaria del equipo (niveles, mangueras, tren de rodaje).',
      'Operación eficiente respetando rendimientos de ciclo de excavación y carguío.',
      'Cumplimiento de distancias de seguridad con personal de piso.'
    ],
    beneficios: [
      'Contrato bajo Código del Trabajo con estabilidad laboral y beneficios de ley.',
      'Bono por rendimiento y cero incidentes mecánicos por negligencia.',
      'Seguro de vida integral.'
    ],
    fechaPublicacion: '2026-10-22',
    fechaCierre: '2026-11-30',
    estado: 'activa',
    urgencia: 'Prioritaria'
  },
  {
    id: 'VAC-EC-2026-006',
    titulo: 'Albañil Especialista en Mampostería & Acabados Finos',
    especialidad: 'Albañil',
    categoriaCics: 'D2_ALBANIL_FIERRERO',
    empresa: 'PROYECTOS URBANOS AMBATO S.A.',
    rucEmpresa: '1890123984001',
    obraDestino: 'Centro Corporativo Ficoa (Tungurahua)',
    provincia: 'Tungurahua',
    canton: 'Ambato (Ficoa)',
    tipoContrato: 'Jornal por tarea',
    modalidad: 'Presencial en Obra',
    jornalDiarioUSD: 28,
    salarioMensualUSD: 680,
    tarifaHoraUSD: 3.5,
    vacantesDisponibles: 5,
    vacantesCubiertas: 3,
    experienciaMinimaAnios: 3,
    certificacionesRequeridas: [
      'Certificado de Trabajo o Recomendaciones de Maestros Calificados',
      'SECAP Construcción Básica'
    ],
    descripcion:
      'Pegado de bloque alivianado, enlucidos interiores y exteriores a regla y plomo, colocación de cerámica y porcelanato.',
    responsabilidades: [
      'Nivelación y aplomado exacto de paredes de mampostería.',
      'Preparación homogénea de mortero 1:3 y aplicación de estuco.',
      'Cuidado y rendimiento óptimo de los sacos de cemento y arena.'
    ],
    beneficios: [
      'Pago semanal puntual por avance medido en planilla.',
      'Alimentación diaria incluida en la obra.',
      'Capacitación en aplicación de impermeabilizantes y masillas acrílicas.'
    ],
    fechaPublicacion: '2026-10-22',
    fechaCierre: '2026-11-20',
    estado: 'activa',
    urgencia: 'Normal'
  }
];

// ============================================================================
// CANDIDATOS POSTULADOS SEMILLA (PARA EL KANBAN DE RECLUTAMIENTO)
// ============================================================================
export const CANDIDATOS_SEMILLA: CandidatoPostulacion[] = [
  {
    id: 'POST-EC-91024',
    vacanteId: 'VAC-EC-2026-001',
    vacanteTitulo: 'Ingeniero Residente de Estructuras Postensadas',
    obraDestino: 'Torre Bellavista Norte (Pichincha)',
    nombreCandidato: 'Ing. Ana Gómez PMP',
    cedula: '1104829182',
    email: 'ana.gomez@profesional.sara.ec',
    telefono: '+593 98 421 8973',
    especialidad: 'Ingeniería Civil',
    categoriaCics: 'A1_DIRECCION',
    provincia: 'Pichincha',
    canton: 'Quito (Iñaquito)',
    experienciaAnios: 12,
    calificacionRating: 4.9,
    tarifaPropuestaUSD: 8.5,
    tipoTarifa: 'hora',
    mensajePresentacion:
      'Cuento con 12 años de experiencia como Residente y Fiscalizadora en edificios de altura. Especialista certificada en postensado PTI y gestión PMP.',
    certificaciones: ['SENESCYT Reg. 1024-14', 'Certificación PMP', 'Postensado PTI'],
    documentos: [
      { nombre: 'CV_Ana_Gomez_2026.pdf', tipo: 'CV', verificado: true },
      { nombre: 'Senescyt_IngenieriaCivil.pdf', tipo: 'SENESCYT', verificado: true },
      { nombre: 'Cert_Alturas_Dec255.pdf', tipo: 'ALTURAS', verificado: true }
    ],
    etapa: 'contratacion_escrow',
    fechaPostulacion: '2026-10-19',
    notasEmpresa: [
      {
        id: 'n-1',
        autor: 'Arq. Carlos Benítez',
        cargo: 'Director de Obra',
        texto: 'Excelente entrevista técnica. Conoce al detalle la normativa NEC-SE-DS y cálculo de tesado.',
        fecha: '2026-10-21 15:30'
      }
    ],
    contratoFormalizado: false,
    contratoData: {
      fechaInicio: '2026-11-03',
      duracionMeses: 6,
      montoTotalEscrowUSD: 11100,
      anticipoPorcentaje: 20,
      retencionIessPatronal: 1348.65,
      hitos: [
        { id: 'h-1', descripcion: 'Acta de Inicio y Aprobación de Plan de Calidad de Losas', porcentaje: 20, montoUSD: 2220, estado: 'en_custodia' },
        { id: 'h-2', descripcion: 'Vaciado y Tesado de Losas Pisos 1 a 4', porcentaje: 40, montoUSD: 4440, estado: 'pendiente' },
        { id: 'h-3', descripcion: 'Vaciado y Tesado de Losas Pisos 5 a 8 y Remate', porcentaje: 40, montoUSD: 4440, estado: 'pendiente' }
      ],
      fechaFormalizacion: '2026-10-23'
    }
  },
  {
    id: 'POST-EC-91025',
    vacanteId: 'VAC-EC-2026-001',
    vacanteTitulo: 'Ingeniero Residente de Estructuras Postensadas',
    obraDestino: 'Torre Bellavista Norte (Pichincha)',
    nombreCandidato: 'Ing. Luis Fernando Silva',
    cedula: '1723491823',
    email: 'luis.silva@estructuras.ec',
    telefono: '+593 99 382 1092',
    especialidad: 'Ingeniería Civil',
    categoriaCics: 'A1_DIRECCION',
    provincia: 'Pichincha',
    canton: 'Quito (Cumbayá)',
    experienciaAnios: 6,
    calificacionRating: 4.6,
    tarifaPropuestaUSD: 7.8,
    tipoTarifa: 'hora',
    mensajePresentacion:
      'Ingeniero Estructural con manejo avanzado de ETABS y Revit Structure. Experiencia en fiscalización de losas aligeradas.',
    certificaciones: ['SENESCYT Reg. 1823-19', 'ETABS Profesional'],
    documentos: [
      { nombre: 'Curriculum_Luis_Silva.pdf', tipo: 'CV', verificado: true },
      { nombre: 'Cedula_Identidad.pdf', tipo: 'CEDULA', verificado: true }
    ],
    etapa: 'evaluacion_tecnica',
    fechaPostulacion: '2026-10-20',
    notasEmpresa: [
      {
        id: 'n-2',
        autor: 'Ing. Gabriel Torres',
        cargo: 'Gerente Técnico',
        texto: 'Buen perfil técnico, en proceso de prueba de cubicación de acero.',
        fecha: '2026-10-22 11:00'
      }
    ]
  },
  {
    id: 'POST-EC-91026',
    vacanteId: 'VAC-EC-2026-002',
    vacanteTitulo: 'Maestro Mayor de Obra Civil & Encofrados',
    obraDestino: 'Complejo Habitacional Las Acacias (Guayas)',
    nombreCandidato: 'Mstr. Juan Pérez Malla',
    cedula: '0912485920',
    email: 'juan.perez.malla@obras.ec',
    telefono: '+593 99 782 1144',
    especialidad: 'Maestro Mayor',
    categoriaCics: 'B1_MAESTRO_MAYOR',
    provincia: 'Guayas',
    canton: 'Samborondón',
    experienciaAnios: 20,
    calificacionRating: 5.0,
    tarifaPropuestaUSD: 38,
    tipoTarifa: 'jornal',
    mensajePresentacion:
      '20 años en obras civiles de gran envergadura en la Costa ecuatoriana. Cuadrilla fija disponible de 12 especialistas.',
    certificaciones: ['SECAP Maestro de Obra Calificado', 'Trabajo Seguro en Alturas'],
    documentos: [
      { nombre: 'Certificado_SECAP_JuanPerez.pdf', tipo: 'SECAP', verificado: true },
      { nombre: 'Cedula_JuanPerez.pdf', tipo: 'CEDULA', verificado: true }
    ],
    etapa: 'entrevista',
    fechaPostulacion: '2026-10-21',
    notasEmpresa: [
      {
        id: 'n-3',
        autor: 'Talento Humano SARA',
        cargo: 'Reclutador',
        texto: 'Referencias laborales impecables con Constructora Uribe Schwarzkopf y Ripconciv.',
        fecha: '2026-10-22 16:40'
      }
    ]
  },
  {
    id: 'POST-EC-91027',
    vacanteId: 'VAC-EC-2026-003',
    vacanteTitulo: 'Topógrafo de Precisión GNSS & Estación Total',
    obraDestino: 'Paso Lateral Sur Loja-Catamayo',
    nombreCandidato: 'Ing. Patricio Jaramillo',
    cedula: '1103948291',
    email: 'pato.jaramillo.topo@gmail.com',
    telefono: '+593 98 123 9988',
    especialidad: 'Topografía',
    categoriaCics: 'C2_ESPECIALISTA',
    provincia: 'Loja',
    canton: 'Loja (San Sebastián)',
    experienciaAnios: 5,
    calificacionRating: 4.8,
    tarifaPropuestaUSD: 50,
    tipoTarifa: 'jornal',
    mensajePresentacion:
      'Topógrafo con equipo propio Trimble R10 GNSS RTK y estación Leica TS06. Disponibilidad para campamento.',
    certificaciones: ['Certificación Topografía Vial MTOP', 'Piloto de Dron DJI Mavic RTK'],
    documentos: [
      { nombre: 'CV_Patricio_Jaramillo.pdf', tipo: 'CV', verificado: true },
      { nombre: 'Certificado_Dron_DGAC.pdf', tipo: 'SECAP', verificado: true }
    ],
    etapa: 'preseleccionadas',
    fechaPostulacion: '2026-10-21',
    notasEmpresa: []
  },
  {
    id: 'POST-EC-91028',
    vacanteId: 'VAC-EC-2026-004',
    vacanteTitulo: 'Fierrero Especialista en Armado y Doblado de Estructuras',
    obraDestino: 'Condominio Río Yanuncay (Azuay)',
    nombreCandidato: 'Manuel Chamba Quizhpe',
    cedula: '0104829103',
    email: 'manuel.chamba@gmail.com',
    telefono: '+593 99 443 2211',
    especialidad: 'Fierrero',
    categoriaCics: 'D2_ALBANIL_FIERRERO',
    provincia: 'Azuay',
    canton: 'Cuenca (El Vergel)',
    experienciaAnios: 4,
    calificacionRating: 4.7,
    tarifaPropuestaUSD: 30,
    tipoTarifa: 'jornal',
    mensajePresentacion:
      'Fierrero oficial con experiencia en despiece de varilla corrugada y doblado hidráulico en taller de obra.',
    certificaciones: ['SECAP Fierrería y Estructuras'],
    documentos: [{ nombre: 'Cedula_Chamba.pdf', tipo: 'CEDULA', verificado: true }],
    etapa: 'en_revision',
    fechaPostulacion: '2026-10-22',
    notasEmpresa: []
  },
  {
    id: 'POST-EC-91029',
    vacanteId: 'VAC-EC-2026-005',
    vacanteTitulo: 'Operador de Maquinaria Pesada (Excavadora 320D & Volqueta)',
    obraDestino: 'Parque Logístico Portuario Manta (Manabí)',
    nombreCandidato: 'Carlos Moreira Zambrano',
    cedula: '1309847291',
    email: 'carlos.moreira.heavy@outlook.com',
    telefono: '+593 98 776 5431',
    especialidad: 'Operador Maquinaria Pesada',
    categoriaCics: 'C2_ESPECIALISTA',
    provincia: 'Manabí',
    canton: 'Manta (Tarqui)',
    experienciaAnios: 7,
    calificacionRating: 4.9,
    tarifaPropuestaUSD: 45,
    tipoTarifa: 'jornal',
    mensajePresentacion:
      'Operador calificado de Excavadora Caterpillar 320 y 336. Licencia Tipo G vigente sin multas.',
    certificaciones: ['Licencia Tipo G ANT', 'SECAP Maquinaria Pesada', 'Seguridad Minera'],
    documentos: [
      { nombre: 'Licencia_Tipo_G_Moreira.pdf', tipo: 'SECAP', verificado: true },
      { nombre: 'Hoja_de_Vida_Moreira.pdf', tipo: 'CV', verificado: true }
    ],
    etapa: 'recibidas',
    fechaPostulacion: '2026-10-23',
    notasEmpresa: []
  }
];

export class SaraVacantesService {
  /**
   * Obtiene la lista de vacantes activas y en proceso
   */
  static getVacantes(): VacanteEmpleo[] {
    if (typeof window === 'undefined') return VACANTES_SEMILLA;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_VACANTES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      localStorage.setItem(STORAGE_KEY_VACANTES, JSON.stringify(VACANTES_SEMILLA));
    } catch (e) {
      console.warn('Error leyendo vacantes de localStorage:', e);
    }
    return VACANTES_SEMILLA;
  }

  /**
   * Obtiene una vacante por su ID
   */
  static getVacanteById(id: string): VacanteEmpleo | undefined {
    const list = this.getVacantes();
    return list.find((v) => v.id === id);
  }

  /**
   * Publica una nueva vacante de empleo
   */
  static crearVacante(
    payload: Omit<VacanteEmpleo, 'id' | 'vacantesCubiertas' | 'fechaPublicacion' | 'estado'>
  ): VacanteEmpleo {
    const list = this.getVacantes();
    const nuevaId = `VAC-EC-2026-${String(list.length + 1).padStart(3, '0')}`;
    const nuevaVacante: VacanteEmpleo = {
      ...payload,
      id: nuevaId,
      vacantesCubiertas: 0,
      fechaPublicacion: new Date().toISOString().slice(0, 10),
      estado: 'activa'
    };

    const updated = [nuevaVacante, ...list];
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_VACANTES, JSON.stringify(updated));
      } catch (e) {
        console.warn('Error guardando vacante:', e);
      }
    }

    // Guardado asíncrono no bloqueante en Supabase
    this.syncVacanteToSupabase(nuevaVacante);

    return nuevaVacante;
  }

  /**
   * Obtiene la lista de candidatos postulados
   */
  static getCandidatos(): CandidatoPostulacion[] {
    if (typeof window === 'undefined') return CANDIDATOS_SEMILLA;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_POSTULACIONES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      localStorage.setItem(STORAGE_KEY_POSTULACIONES, JSON.stringify(CANDIDATOS_SEMILLA));
    } catch (e) {
      console.warn('Error leyendo postulaciones de localStorage:', e);
    }
    return CANDIDATOS_SEMILLA;
  }

  /**
   * Postula un candidato a una vacante específica
   */
  static postularCandidato(
    payload: Omit<CandidatoPostulacion, 'id' | 'etapa' | 'fechaPostulacion' | 'notasEmpresa'>
  ): CandidatoPostulacion {
    const list = this.getCandidatos();
    const nuevoId = `POST-EC-${Math.floor(10000 + Math.random() * 90000)}`;
    const nuevaPostulacion: CandidatoPostulacion = {
      ...payload,
      id: nuevoId,
      etapa: 'recibidas',
      fechaPostulacion: new Date().toISOString().slice(0, 10),
      notasEmpresa: [
        {
          id: `nota-${Date.now()}`,
          autor: 'Sistema SARA Talento',
          cargo: 'Filtro Automático de Entrada',
          texto: `Postulación recibida en línea. Tarifa requerida: $${payload.tarifaPropuestaUSD}/${payload.tipoTarifa}. Documentación adjunta: ${payload.documentos.length} archivo(s).`,
          fecha: new Date().toISOString().slice(0, 16).replace('T', ' ')
        }
      ]
    };

    const updated = [nuevaPostulacion, ...list];
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_POSTULACIONES, JSON.stringify(updated));
      } catch (e) {
        console.warn('Error guardando postulacion:', e);
      }
    }

    // Persistencia en Supabase
    this.syncPostulacionToSupabase(nuevaPostulacion);

    return nuevaPostulacion;
  }

  /**
   * Mueve un candidato a una nueva etapa del Kanban
   */
  static moverEtapaCandidato(
    candidatoId: string,
    nuevaEtapa: EtapaReclutamiento,
    autor: string = 'Dirección de Talento'
  ): CandidatoPostulacion | null {
    const list = this.getCandidatos();
    const idx = list.findIndex((c) => c.id === candidatoId);
    if (idx === -1) return null;

    const cand = list[idx];
    const etapaAnterior = cand.etapa;
    cand.etapa = nuevaEtapa;

    cand.notasEmpresa.unshift({
      id: `nota-${Date.now()}`,
      autor,
      cargo: 'Coordinador de Selección',
      texto: `Candidato promovido de etapa: "${etapaAnterior.toUpperCase()}" ➔ "${nuevaEtapa.toUpperCase()}".`,
      fecha: new Date().toISOString().slice(0, 16).replace('T', ' ')
    });

    list[idx] = { ...cand };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_POSTULACIONES, JSON.stringify(list));
      } catch (e) {
        console.warn('Error actualizando candidato:', e);
      }
    }

    return cand;
  }

  /**
   * Registra una nota de evaluación interna en la ficha del candidato
   */
  static agregarNota(
    candidatoId: string,
    notaTexto: string,
    autor: string = 'Evaluador Técnico',
    cargo: string = 'Fiscalizador de Obra'
  ): CandidatoPostulacion | null {
    const list = this.getCandidatos();
    const idx = list.findIndex((c) => c.id === candidatoId);
    if (idx === -1) return null;

    const cand = list[idx];
    cand.notasEmpresa.unshift({
      id: `nota-${Date.now()}`,
      autor,
      cargo,
      texto: notaTexto,
      fecha: new Date().toISOString().slice(0, 16).replace('T', ' ')
    });

    list[idx] = { ...cand };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_POSTULACIONES, JSON.stringify(list));
      } catch (e) {
        console.warn('Error agregando nota:', e);
      }
    }

    return cand;
  }

  /**
   * Formaliza el contrato y asigna al trabajador a la obra con fondo Escrow
   */
  static formalizarContratoEscrow(
    candidatoId: string,
    datosContrato: {
      obraDestino: string;
      fechaInicio: string;
      duracionMeses: number;
      montoTotalEscrowUSD: number;
      anticipoPorcentaje: number;
      hitos: HitoEscrowContrato[];
    }
  ): CandidatoPostulacion | null {
    const list = this.getCandidatos();
    const idx = list.findIndex((c) => c.id === candidatoId);
    if (idx === -1) return null;

    const cand = list[idx];
    const retencionIessPatronal = Math.round(datosContrato.montoTotalEscrowUSD * 0.1215 * 100) / 100;

    cand.etapa = 'contratacion_escrow';
    cand.contratoFormalizado = true;
    cand.obraDestino = datosContrato.obraDestino;
    cand.contratoData = {
      ...datosContrato,
      retencionIessPatronal,
      fechaFormalizacion: new Date().toISOString().slice(0, 10)
    };

    cand.notasEmpresa.unshift({
      id: `nota-${Date.now()}`,
      autor: 'SARA-PAGOS & Escrow Fiduciario',
      cargo: 'Sistema Financiero Automatizado',
      texto: `Contrato formalizado para la obra "${datosContrato.obraDestino}". Fondo Escrow bloqueado: $${datosContrato.montoTotalEscrowUSD.toLocaleString()} USD (${datosContrato.hitos.length} hitos de desembolso). Aporte patronal IESS calculado al 12.15% ($${retencionIessPatronal} USD).`,
      fecha: new Date().toISOString().slice(0, 16).replace('T', ' ')
    });

    list[idx] = { ...cand };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_POSTULACIONES, JSON.stringify(list));
      } catch (e) {
        console.warn('Error guardando formalizacion:', e);
      }
    }

    // Actualizar también la vacante respectiva incrementando vacantesCubiertas
    const vacantes = this.getVacantes();
    const vIdx = vacantes.findIndex((v) => v.id === cand.vacanteId);
    if (vIdx !== -1) {
      vacantes[vIdx].vacantesCubiertas = Math.min(
        vacantes[vIdx].vacantesDisponibles,
        vacantes[vIdx].vacantesCubiertas + 1
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_VACANTES, JSON.stringify(vacantes));
      }
    }

    // Sincronizar con Supabase
    this.syncEscrowToSupabase(cand, datosContrato);

    return cand;
  }

  // ==========================================================================
  // SINCRONIZACIÓN ASÍNCRONA EN SUPABASE (NON-BLOCKING)
  // ============================================================================
  private static async syncVacanteToSupabase(vacante: VacanteEmpleo) {
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.from('solicitudes_servicio').insert({
        nombre: `Publicación Vacante: ${vacante.titulo}`,
        email: 'reclutamiento@gruposara.ec',
        telefono: '0990000000',
        tipo_servicio: 'vacante_empleo',
        mensaje: `[${vacante.id}] ${vacante.empresa} solicita ${vacante.titulo} en ${vacante.obraDestino} (${vacante.provincia}). Cupos: ${vacante.vacantesDisponibles}. Jornal: $${vacante.jornalDiarioUSD}/día.`,
        estado: 'nueva'
      });
    } catch (err) {
      console.warn('Sync vacante a Supabase (aviso no crítico):', err);
    }
  }

  private static async syncPostulacionToSupabase(postulacion: CandidatoPostulacion) {
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.from('job_applications').insert({
        project_name: postulacion.obraDestino,
        status: postulacion.etapa,
        proposed_rate: postulacion.tarifaPropuestaUSD
      });

      await supabase.from('solicitudes_servicio').insert({
        nombre: `Postulación: ${postulacion.nombreCandidato}`,
        email: postulacion.email,
        telefono: postulacion.telefono,
        tipo_servicio: 'postulacion_talento',
        mensaje: `Postulación para ${postulacion.vacanteTitulo} (${postulacion.id}). Tarifa: $${postulacion.tarifaPropuestaUSD}/${postulacion.tipoTarifa}. Ciudad: ${postulacion.canton}, ${postulacion.provincia}.`,
        estado: 'nueva'
      });
    } catch (err) {
      console.warn('Sync postulacion a Supabase (aviso no crítico):', err);
    }
  }

  private static async syncEscrowToSupabase(
    cand: CandidatoPostulacion,
    datosContrato: { obraDestino: string; montoTotalEscrowUSD: number }
  ) {
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.from('ordenes_pago').insert({
        modulo: 'constructora',
        referencia_id: cand.id,
        concepto: `Fondo Escrow Contrato: ${cand.nombreCandidato} - ${datosContrato.obraDestino}`,
        monto: datosContrato.montoTotalEscrowUSD,
        moneda: 'USD',
        estado: 'completada'
      });
    } catch (err) {
      console.warn('Sync escrow a Supabase (aviso no crítico):', err);
    }
  }
}
