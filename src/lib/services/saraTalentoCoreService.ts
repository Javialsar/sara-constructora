/**
 * SERVICIO CENTRAL BACKEND: SARA TALENTO HUMANO CORE
 * Módulo: Talento Humano en Construcción, Selección, Expedientes, Asignación y Evaluación
 * Normativa: SECAP, Código del Trabajo (Ecuador), IESS Resolución CD 513, NEC-15
 */

// ============================================================================
// TIPOS E INTERFACES DEL MODELO DE DATOS
// ============================================================================

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export type ModalidadTrabajo = 'presencial_obra' | 'mixto';
export type TipoContratoTalento = 'obra_cierta' | 'servicios_profesionales' | 'novedad_temporal' | 'indefinido';
export type EstadoVacante = 'borrador' | 'publicada' | 'pausada' | 'cerrada' | 'cancelada';

export interface TalentoVacante {
  id: string;
  empresa_id: string;
  proyecto_id?: string | null;
  titulo: string;
  rol_oficio: string;
  especialidad?: string | null;
  descripcion: string;
  requisitos?: string | null;
  certificaciones_requeridas: string[];
  ubicacion_provincia: string;
  ubicacion_canton: string;
  modalidad: ModalidadTrabajo;
  tipo_contrato: TipoContratoTalento;
  salario_min?: number | null;
  salario_max?: number | null;
  estado: EstadoVacante;
  vacantes_disponibles: number;
  vacantes_cubiertas: number;
  created_at: string;
  updated_at: string;
}

export type EstadoPostulacion =
  | 'recibida'
  | 'en_revision'
  | 'preseleccionada'
  | 'entrevista'
  | 'evaluacion_tecnica'
  | 'oferta'
  | 'aceptada'
  | 'rechazada'
  | 'retirada';

export interface TalentoPostulacion {
  id: string;
  vacante_id: string;
  talento_id: string;
  mensaje_presentacion?: string | null;
  tarifa_ofertada?: number | null;
  estado: EstadoPostulacion;
  notas_privadas_empresa?: string | null;
  fecha_entrevista?: string | null;
  created_at: string;
  updated_at: string;
  // Campos enriquecidos para la interfaz
  vacante_titulo?: string;
  vacante_empresa_id?: string;
}

export type EstadoAsignacion = 'activa' | 'suspendida' | 'finalizada';

export interface TalentoAsignacionObra {
  id: string;
  postulacion_id?: string | null;
  talento_id: string;
  proyecto_id?: string | null;
  empresa_id: string;
  rol_asignado: string;
  fecha_inicio: string;
  fecha_fin_prevista?: string | null;
  estado: EstadoAsignacion;
  tarifa_acordada_hora?: number | null;
  fondo_escrow_id?: string | null;
  created_at: string;
  updated_at: string;
}

export type TipoDocumentoExpediente =
  | 'CEDULA'
  | 'CV'
  | 'SECAP_PREVENCION'
  | 'SENESCYT_TITULO'
  | 'LICENCIA_ALTURAS'
  | 'EXAMEN_MEDICO_IESS';

export type EstadoDocumento = 'recibido' | 'en_revision' | 'validado' | 'rechazado' | 'vencido';

export interface TalentoDocumentoExpediente {
  id: string;
  talento_id: string;
  tipo_documento: TipoDocumentoExpediente;
  archivo_url: string;
  nombre_archivo: string;
  estado: EstadoDocumento;
  validado_por?: string | null;
  fecha_vencimiento?: string | null;
  motivo_rechazo?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TalentoEvaluacion {
  id: string;
  asignacion_id: string;
  proyecto_id?: string | null;
  empresa_id: string;
  talento_id: string;
  calificacion_calidad: number; // 1-5
  calificacion_cumplimiento_plazo: number; // 1-5
  calificacion_sst: number; // 1-5 (Seguridad y Salud en el Trabajo)
  comentarios?: string | null;
  acta_fiscalizacion_url?: string | null;
  created_at: string;
}

export interface FiltrosVacantes {
  provincia?: string;
  canton?: string;
  rol_oficio?: string;
  estado?: EstadoVacante;
  empresa_id?: string;
  proyecto_id?: string;
  q?: string;
}

export interface FiltrosPostulaciones {
  vacante_id?: string;
  talento_id?: string;
  estado?: EstadoPostulacion;
}

export interface FiltrosAsignaciones {
  proyecto_id?: string;
  talento_id?: string;
  empresa_id?: string;
  estado?: EstadoAsignacion;
}

// ============================================================================
// DATOS SEMILLA / MEMORIA CACHE (FALLBACK INMEDIATO Y OFFLINE RESILIENT)
// ============================================================================

const VACANTES_INICIALES: TalentoVacante[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    empresa_id: '11111111-1111-1111-1111-111111111111',
    proyecto_id: 'proy-001',
    titulo: 'Ingeniero Residente de Estructuras',
    rol_oficio: 'Ingeniero Residente',
    especialidad: 'Hormigón Armado y Losas Postensadas',
    descripcion: 'Supervisión y control de vaciados de hormigón f\'c=280 kg/cm2, armado de acero según NEC-SE-DS y libro de obra.',
    requisitos: 'Experiencia mínima 5 años en edificación en altura. Registro profesional SENESCYT vigente.',
    certificaciones_requeridas: ['SENESCYT_TITULO', 'SECAP_PREVENCION'],
    ubicacion_provincia: 'Pichincha',
    ubicacion_canton: 'Quito',
    modalidad: 'presencial_obra',
    tipo_contrato: 'obra_cierta',
    salario_min: 1800,
    salario_max: 2400,
    estado: 'publicada',
    vacantes_disponibles: 2,
    vacantes_cubiertas: 0,
    created_at: new Date('2026-10-15T08:00:00Z').toISOString(),
    updated_at: new Date('2026-10-15T08:00:00Z').toISOString()
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    empresa_id: '11111111-1111-1111-1111-111111111111',
    proyecto_id: 'proy-002',
    titulo: 'Maestro Mayor de Obra Civil',
    rol_oficio: 'Maestro Mayor',
    especialidad: 'Dirección de Cuadrillas de Albañilería',
    descripcion: 'Coordinación de replanteo, colocación de acero de refuerzo, encofrados metálicos y vaciado de cimentaciones.',
    requisitos: 'Experiencia demostrable de 10+ años en obras de hormigón. Manejo de cuadrillas de hasta 30 operarios.',
    certificaciones_requeridas: ['SECAP_PREVENCION', 'LICENCIA_ALTURAS'],
    ubicacion_provincia: 'Guayas',
    ubicacion_canton: 'Guayaquil',
    modalidad: 'presencial_obra',
    tipo_contrato: 'obra_cierta',
    salario_min: 1100,
    salario_max: 1450,
    estado: 'publicada',
    vacantes_disponibles: 3,
    vacantes_cubiertas: 1,
    created_at: new Date('2026-10-18T09:30:00Z').toISOString(),
    updated_at: new Date('2026-10-18T09:30:00Z').toISOString()
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    empresa_id: '22222222-2222-2222-2222-222222222222',
    proyecto_id: null,
    titulo: 'Topógrafo de Precisión con Estación Total',
    rol_oficio: 'Topógrafo',
    especialidad: 'Georreferenciación Satelital y Nivelación',
    descripcion: 'Levantamiento topográfico de rasantes, movimiento de tierras y control milimétrico de ejes estructurales.',
    requisitos: 'Licencia de operador, experiencia mínima 4 años en obras viales e inmobiliarias.',
    certificaciones_requeridas: ['SECAP_PREVENCION'],
    ubicacion_provincia: 'Loja',
    ubicacion_canton: 'Loja',
    modalidad: 'presencial_obra',
    tipo_contrato: 'servicios_profesionales',
    salario_min: 950,
    salario_max: 1300,
    estado: 'publicada',
    vacantes_disponibles: 1,
    vacantes_cubiertas: 0,
    created_at: new Date('2026-10-20T14:15:00Z').toISOString(),
    updated_at: new Date('2026-10-20T14:15:00Z').toISOString()
  }
];

const POSTULACIONES_INICIALES: TalentoPostulacion[] = [
  {
    id: 'post-001',
    vacante_id: '00000000-0000-0000-0000-000000000001',
    talento_id: 'tal-1', // Ing. Ana Gómez
    mensaje_presentacion: 'Cuento con 12 años de experiencia liderando obras verticales en Quito y registro PMP y SENESCYT.',
    tarifa_ofertada: 2200,
    estado: 'preseleccionada',
    notas_privadas_empresa: 'Excelente perfil técnico, programar entrevista técnica presencial en obra.',
    fecha_entrevista: new Date('2026-10-28T10:00:00Z').toISOString(),
    created_at: new Date('2026-10-19T11:00:00Z').toISOString(),
    updated_at: new Date('2026-10-21T15:20:00Z').toISOString()
  },
  {
    id: 'post-002',
    vacante_id: '00000000-0000-0000-0000-000000000002',
    talento_id: 'tal-4', // Mstr. Juan Pérez
    mensaje_presentacion: 'Más de 20 años al frente de cuadrillas de estructuras y cimentaciones pesadas en Guayaquil.',
    tarifa_ofertada: 1250,
    estado: 'aceptada',
    notas_privadas_empresa: 'Contratado formalmente. Incorporación inmediata al frente 1.',
    created_at: new Date('2026-10-19T16:00:00Z').toISOString(),
    updated_at: new Date('2026-10-22T09:00:00Z').toISOString()
  }
];

const ASIGNACIONES_INICIALES: TalentoAsignacionObra[] = [
  {
    id: 'asig-001',
    postulacion_id: 'post-002',
    talento_id: 'tal-4',
    proyecto_id: 'proy-002',
    empresa_id: '11111111-1111-1111-1111-111111111111',
    rol_asignado: 'Maestro Mayor de Obra',
    fecha_inicio: '2026-10-23',
    fecha_fin_prevista: '2027-04-30',
    estado: 'activa',
    tarifa_acordada_hora: 7.50,
    fondo_escrow_id: 'escrow-90812',
    created_at: new Date('2026-10-22T09:05:00Z').toISOString(),
    updated_at: new Date('2026-10-22T09:05:00Z').toISOString()
  }
];

const DOCUMENTOS_INICIALES: TalentoDocumentoExpediente[] = [
  {
    id: 'doc-001',
    talento_id: 'tal-1',
    tipo_documento: 'CEDULA',
    archivo_url: 'https://storage.sara.ec/expedientes/tal-1/cedula.pdf',
    nombre_archivo: 'cedula_identidad_ana_gomez.pdf',
    estado: 'validado',
    validado_por: '11111111-1111-1111-1111-111111111111',
    fecha_vencimiento: '2030-12-31',
    created_at: new Date('2026-10-18T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-18T11:00:00Z').toISOString()
  },
  {
    id: 'doc-002',
    talento_id: 'tal-1',
    tipo_documento: 'SENESCYT_TITULO',
    archivo_url: 'https://storage.sara.ec/expedientes/tal-1/titulo_senescyt.pdf',
    nombre_archivo: 'registro_senescyt_ingenieria_civil.pdf',
    estado: 'validado',
    validado_por: '11111111-1111-1111-1111-111111111111',
    created_at: new Date('2026-10-18T10:05:00Z').toISOString(),
    updated_at: new Date('2026-10-18T11:00:00Z').toISOString()
  },
  {
    id: 'doc-003',
    talento_id: 'tal-4',
    tipo_documento: 'SECAP_PREVENCION',
    archivo_url: 'https://storage.sara.ec/expedientes/tal-4/cert_secap.pdf',
    nombre_archivo: 'certificacion_secap_seguridad_obra.pdf',
    estado: 'validado',
    validado_por: '11111111-1111-1111-1111-111111111111',
    fecha_vencimiento: '2027-06-15',
    created_at: new Date('2026-10-19T08:00:00Z').toISOString(),
    updated_at: new Date('2026-10-19T09:30:00Z').toISOString()
  }
];

const EVALUACIONES_INICIALES: TalentoEvaluacion[] = [
  {
    id: 'eval-001',
    asignacion_id: 'asig-001',
    proyecto_id: 'proy-002',
    empresa_id: '11111111-1111-1111-1111-111111111111',
    talento_id: 'tal-4',
    calificacion_calidad: 5,
    calificacion_cumplimiento_plazo: 5,
    calificacion_sst: 5,
    comentarios: 'Excelente liderazgo y apego total al reglamento IESS CD 513 de seguridad en obra.',
    acta_fiscalizacion_url: 'https://storage.sara.ec/actas/acta_hito_01.pdf',
    created_at: new Date('2026-10-23T18:00:00Z').toISOString()
  }
];

// Almacén en memoria global para el proceso
let vacantesMemory: TalentoVacante[] = [...VACANTES_INICIALES];
let postulacionesMemory: TalentoPostulacion[] = [...POSTULACIONES_INICIALES];
let asignacionesMemory: TalentoAsignacionObra[] = [...ASIGNACIONES_INICIALES];
let documentosMemory: TalentoDocumentoExpediente[] = [...DOCUMENTOS_INICIALES];
let evaluacionesMemory: TalentoEvaluacion[] = [...EVALUACIONES_INICIALES];

// ============================================================================
// CLIENTE SUPABASE CON TOLERANCIA A FALLOS
// ============================================================================

async function getSupabaseClient() {
  try {
    const isServer = typeof window === 'undefined';
    if (isServer) {
      const { createSupabaseAdminClient } = await import('@/lib/supabase-server');
      return await createSupabaseAdminClient();
    } else {
      const { createSupabaseBrowserClient } = await import('@/lib/supabase-browser');
      return createSupabaseBrowserClient();
    }
  } catch (err) {
    return null;
  }
}

// ============================================================================
// SERVICIO PRINCIPAL: SARA TALENTO CORE SERVICE
// ============================================================================

export class SaraTalentoCoreService {

  // --------------------------------------------------------------------------
  // 1. GESTIÓN DE VACANTES
  // --------------------------------------------------------------------------

  static async crearVacante(
    vacanteData: Omit<TalentoVacante, 'id' | 'created_at' | 'updated_at' | 'vacantes_cubiertas'> & {
      id?: string;
    }
  ): Promise<TalentoVacante> {
    const now = new Date().toISOString();
    const id = vacanteData.id || generateUUID();
    const nuevaVacante: TalentoVacante = {
      ...vacanteData,
      id,
      certificaciones_requeridas: vacanteData.certificaciones_requeridas || [],
      vacantes_disponibles: vacanteData.vacantes_disponibles ?? 1,
      vacantes_cubiertas: 0,
      estado: vacanteData.estado || 'publicada',
      modalidad: vacanteData.modalidad || 'presencial_obra',
      tipo_contrato: vacanteData.tipo_contrato || 'obra_cierta',
      created_at: now,
      updated_at: now
    };

    // Intentar persistencia en Supabase
    const client = await getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('talento_vacantes')
          .insert(nuevaVacante)
          .select()
          .single();

        if (!error && data) {
          vacantesMemory.unshift(data);
          return data;
        }
      } catch (e) {
        console.warn('Persistencia en DB falló para vacante, usando fallback en memoria:', e);
      }
    }

    vacantesMemory.unshift(nuevaVacante);
    return nuevaVacante;
  }

  static async listarVacantes(filtros?: FiltrosVacantes): Promise<TalentoVacante[]> {
    const client = await getSupabaseClient();
    if (client) {
      try {
        let query = client
          .from('talento_vacantes')
          .select('*')
          .order('created_at', { ascending: false });

        if (filtros?.estado) query = query.eq('estado', filtros.estado);
        if (filtros?.provincia) query = query.ilike('ubicacion_provincia', `%${filtros.provincia}%`);
        if (filtros?.canton) query = query.ilike('ubicacion_canton', `%${filtros.canton}%`);
        if (filtros?.rol_oficio) query = query.ilike('rol_oficio', `%${filtros.rol_oficio}%`);
        if (filtros?.empresa_id) query = query.eq('empresa_id', filtros.empresa_id);
        if (filtros?.proyecto_id) query = query.eq('proyecto_id', filtros.proyecto_id);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          // Fusionar con memoria sin duplicados
          const idsDb = new Set(data.map((d: TalentoVacante) => d.id));
          const soloMemoria = vacantesMemory.filter(v => !idsDb.has(v.id));
          return [...data, ...soloMemoria];
        }
      } catch (e) {
        console.warn('Consulta a Supabase para vacantes falló, sirviendo desde memoria:', e);
      }
    }

    // Filtrar en memoria
    return vacantesMemory.filter(v => {
      if (filtros?.estado && v.estado !== filtros.estado) return false;
      if (filtros?.provincia && !v.ubicacion_provincia.toLowerCase().includes(filtros.provincia.toLowerCase())) return false;
      if (filtros?.canton && !v.ubicacion_canton.toLowerCase().includes(filtros.canton.toLowerCase())) return false;
      if (filtros?.rol_oficio && !v.rol_oficio.toLowerCase().includes(filtros.rol_oficio.toLowerCase())) return false;
      if (filtros?.empresa_id && v.empresa_id !== filtros.empresa_id) return false;
      if (filtros?.proyecto_id && v.proyecto_id !== filtros.proyecto_id) return false;
      if (filtros?.q) {
        const query = filtros.q.toLowerCase();
        const matchTitle = v.titulo.toLowerCase().includes(query);
        const matchDesc = v.descripcion.toLowerCase().includes(query);
        const matchOficio = v.rol_oficio.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchOficio) return false;
      }
      return true;
    });
  }

  static async obtenerVacantePorId(id: string): Promise<TalentoVacante | null> {
    const client = await getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('talento_vacantes')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) return data;
      } catch (e) {
        // Fallback a memoria
      }
    }
    return vacantesMemory.find(v => v.id === id) || null;
  }

  static async actualizarEstadoVacante(id: string, nuevoEstado: EstadoVacante): Promise<TalentoVacante | null> {
    const now = new Date().toISOString();
    const client = await getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('talento_vacantes')
          .update({ estado: nuevoEstado, updated_at: now })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          const idx = vacantesMemory.findIndex(v => v.id === id);
          if (idx !== -1) vacantesMemory[idx] = data;
          return data;
        }
      } catch (e) {
        console.warn('Actualización DB falló para vacante, actualizando en memoria:', e);
      }
    }

    const vacante = vacantesMemory.find(v => v.id === id);
    if (!vacante) return null;
    vacante.estado = nuevoEstado;
    vacante.updated_at = now;
    return { ...vacante };
  }

  // --------------------------------------------------------------------------
  // 2. GESTIÓN DE POSTULACIONES
  // --------------------------------------------------------------------------

  static async crearPostulacion(
    postulacionData: Omit<TalentoPostulacion, 'id' | 'created_at' | 'updated_at' | 'estado'> & {
      id?: string;
      estado?: EstadoPostulacion;
    }
  ): Promise<TalentoPostulacion> {
    const now = new Date().toISOString();
    const id = postulacionData.id || generateUUID();
    const nuevaPostulacion: TalentoPostulacion = {
      ...postulacionData,
      id,
      estado: postulacionData.estado || 'recibida',
      created_at: now,
      updated_at: now
    };

    const client = await getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('talento_postulaciones')
          .insert({
            id: nuevaPostulacion.id,
            vacante_id: nuevaPostulacion.vacante_id,
            talento_id: nuevaPostulacion.talento_id,
            mensaje_presentacion: nuevaPostulacion.mensaje_presentacion,
            tarifa_ofertada: nuevaPostulacion.tarifa_ofertada,
            estado: nuevaPostulacion.estado,
            notas_privadas_empresa: nuevaPostulacion.notas_privadas_empresa,
            fecha_entrevista: nuevaPostulacion.fecha_entrevista
          })
          .select()
          .single();

        if (!error && data) {
          postulacionesMemory.unshift(data);
          return data;
        }
      } catch (e) {
        console.warn('Persistencia DB de postulación falló, guardando en memoria:', e);
      }
    }

    postulacionesMemory.unshift(nuevaPostulacion);
    return nuevaPostulacion;
  }

  static async listarPostulacionesPorVacante(vacanteId: string): Promise<TalentoPostulacion[]> {
    const client = await getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('talento_postulaciones')
          .select('*')
          .eq('vacante_id', vacanteId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const idsDb = new Set(data.map((d: TalentoPostulacion) => d.id));
          const soloMemoria = postulacionesMemory.filter(p => p.vacante_id === vacanteId && !idsDb.has(p.id));
          return [...data, ...soloMemoria];
        }
      } catch (e) {
        console.warn('Consulta DB de postulaciones falló:', e);
      }
    }
    return postulacionesMemory.filter(p => p.vacante_id === vacanteId);
  }

  static async listarPostulacionesPorTalento(talentoId: string): Promise<TalentoPostulacion[]> {
    const client = await getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('talento_postulaciones')
          .select('*')
          .eq('talento_id', talentoId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const idsDb = new Set(data.map((d: TalentoPostulacion) => d.id));
          const soloMemoria = postulacionesMemory.filter(p => p.talento_id === talentoId && !idsDb.has(p.id));
          return [...data, ...soloMemoria];
        }
      } catch (e) {
        console.warn('Consulta DB de postulaciones por talento falló:', e);
      }
    }
    return postulacionesMemory.filter(p => p.talento_id === talentoId);
  }

  static async actualizarEstadoPostulacion(
    id: string,
    nuevoEstado: EstadoPostulacion,
    notasPrivadas?: string,
    fechaEntrevista?: string
  ): Promise<TalentoPostulacion | null> {
    const now = new Date().toISOString();
    const updatePayload: Record<string, any> = {
      estado: nuevoEstado,
      updated_at: now
    };
    if (notasPrivadas !== undefined) updatePayload.notas_privadas_empresa = notasPrivadas;
    if (fechaEntrevista !== undefined) updatePayload.fecha_entrevista = fechaEntrevista;

    const client = await getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('talento_postulaciones')
          .update(updatePayload)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          const idx = postulacionesMemory.findIndex(p => p.id === id);
          if (idx !== -1) postulacionesMemory[idx] = data;
          return data;
        }
      } catch (e) {
        console.warn('Actualización DB falló para postulación:', e);
      }
    }

    const postulacion = postulacionesMemory.find(p => p.id === id);
    if (!postulacion) return null;
    postulacion.estado = nuevoEstado;
    if (notasPrivadas !== undefined) postulacion.notas_privadas_empresa = notasPrivadas;
    if (fechaEntrevista !== undefined) postulacion.fecha_entrevista = fechaEntrevista;
    postulacion.updated_at = now;
    return { ...postulacion };
  }

  // --------------------------------------------------------------------------
  // 3. GESTIÓN DE ASIGNACIONES A OBRA
  // --------------------------------------------------------------------------

  static async crearAsignacionObra(
    asignacionData: Omit<TalentoAsignacionObra, 'id' | 'created_at' | 'updated_at' | 'estado'> & {
      id?: string;
      estado?: EstadoAsignacion;
    }
  ): Promise<TalentoAsignacionObra> {
    const now = new Date().toISOString();
    const id = asignacionData.id || generateUUID();
    const nuevaAsignacion: TalentoAsignacionObra = {
      ...asignacionData,
      id,
      estado: asignacionData.estado || 'activa',
      created_at: now,
      updated_at: now
    };

    // Actualizar estado de postulación si viene vinculada
    if (asignacionData.postulacion_id) {
      await this.actualizarEstadoPostulacion(asignacionData.postulacion_id, 'aceptada');
    }

    const client = await getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('talento_asignaciones_obra')
          .insert({
            id: nuevaAsignacion.id,
            postulacion_id: nuevaAsignacion.postulacion_id,
            talento_id: nuevaAsignacion.talento_id,
            proyecto_id: nuevaAsignacion.proyecto_id,
            empresa_id: nuevaAsignacion.empresa_id,
            rol_asignado: nuevaAsignacion.rol_asignado,
            fecha_inicio: nuevaAsignacion.fecha_inicio,
            fecha_fin_prevista: nuevaAsignacion.fecha_fin_prevista,
            estado: nuevaAsignacion.estado,
            tarifa_acordada_hora: nuevaAsignacion.tarifa_acordada_hora,
            fondo_escrow_id: nuevaAsignacion.fondo_escrow_id
          })
          .select()
          .single();

        if (!error && data) {
          asignacionesMemory.unshift(data);
          return data;
        }
      } catch (e) {
        console.warn('Persistencia DB de asignación falló:', e);
      }
    }

    asignacionesMemory.unshift(nuevaAsignacion);
    return nuevaAsignacion;
  }

  static async listarAsignacionesPorProyecto(proyectoId: string): Promise<TalentoAsignacionObra[]> {
    const client = await getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('talento_asignaciones_obra')
          .select('*')
          .eq('proyecto_id', proyectoId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const idsDb = new Set(data.map((d: TalentoAsignacionObra) => d.id));
          const soloMemoria = asignacionesMemory.filter(a => a.proyecto_id === proyectoId && !idsDb.has(a.id));
          return [...data, ...soloMemoria];
        }
      } catch (e) {
        console.warn('Consulta DB de asignaciones falló:', e);
      }
    }
    return asignacionesMemory.filter(a => a.proyecto_id === proyectoId);
  }

  static async listarAsignacionesPorTalento(talentoId: string): Promise<TalentoAsignacionObra[]> {
    const client = await getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('talento_asignaciones_obra')
          .select('*')
          .eq('talento_id', talentoId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const idsDb = new Set(data.map((d: TalentoAsignacionObra) => d.id));
          const soloMemoria = asignacionesMemory.filter(a => a.talento_id === talentoId && !idsDb.has(a.id));
          return [...data, ...soloMemoria];
        }
      } catch (e) {
        console.warn('Consulta DB de asignaciones por talento falló:', e);
      }
    }
    return asignacionesMemory.filter(a => a.talento_id === talentoId);
  }

  static async finalizarAsignacion(id: string): Promise<TalentoAsignacionObra | null> {
    const now = new Date().toISOString();
    const client = await getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('talento_asignaciones_obra')
          .update({ estado: 'finalizada', updated_at: now })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          const idx = asignacionesMemory.findIndex(a => a.id === id);
          if (idx !== -1) asignacionesMemory[idx] = data;
          return data;
        }
      } catch (e) {
        console.warn('Finalización DB de asignación falló:', e);
      }
    }

    const asignacion = asignacionesMemory.find(a => a.id === id);
    if (!asignacion) return null;
    asignacion.estado = 'finalizada';
    asignacion.updated_at = now;
    return { ...asignacion };
  }

  // --------------------------------------------------------------------------
  // 4. EXPEDIENTES TÉCNICOS Y DOCUMENTOS
  // --------------------------------------------------------------------------

  static async subirDocumentoExpediente(
    docData: Omit<TalentoDocumentoExpediente, 'id' | 'created_at' | 'updated_at' | 'estado'> & {
      id?: string;
      estado?: EstadoDocumento;
    }
  ): Promise<TalentoDocumentoExpediente> {
    const now = new Date().toISOString();
    const id = docData.id || generateUUID();
    const nuevoDocumento: TalentoDocumentoExpediente = {
      ...docData,
      id,
      estado: docData.estado || 'recibido',
      created_at: now,
      updated_at: now
    };

    const client = await getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('talento_documentos_expediente')
          .insert({
            id: nuevoDocumento.id,
            talento_id: nuevoDocumento.talento_id,
            tipo_documento: nuevoDocumento.tipo_documento,
            archivo_url: nuevoDocumento.archivo_url,
            nombre_archivo: nuevoDocumento.nombre_archivo,
            estado: nuevoDocumento.estado,
            validado_por: nuevoDocumento.validado_por,
            fecha_vencimiento: nuevoDocumento.fecha_vencimiento,
            motivo_rechazo: nuevoDocumento.motivo_rechazo
          })
          .select()
          .single();

        if (!error && data) {
          documentosMemory.unshift(data);
          return data;
        }
      } catch (e) {
        console.warn('Persistencia DB de documento falló:', e);
      }
    }

    documentosMemory.unshift(nuevoDocumento);
    return nuevoDocumento;
  }

  static async validarDocumentoExpediente(
    id: string,
    estado: 'validado' | 'rechazado',
    validadoPor?: string,
    motivoRechazo?: string
  ): Promise<TalentoDocumentoExpediente | null> {
    const now = new Date().toISOString();
    const payload: Record<string, any> = {
      estado,
      validado_por: validadoPor || null,
      updated_at: now
    };
    if (motivoRechazo !== undefined) payload.motivo_rechazo = motivoRechazo;

    const client = await getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('talento_documentos_expediente')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          const idx = documentosMemory.findIndex(d => d.id === id);
          if (idx !== -1) documentosMemory[idx] = data;
          return data;
        }
      } catch (e) {
        console.warn('Validación DB de documento falló:', e);
      }
    }

    const doc = documentosMemory.find(d => d.id === id);
    if (!doc) return null;
    doc.estado = estado;
    doc.validado_por = validadoPor || null;
    if (motivoRechazo !== undefined) doc.motivo_rechazo = motivoRechazo;
    doc.updated_at = now;
    return { ...doc };
  }

  static async listarDocumentosTalento(talentoId: string): Promise<TalentoDocumentoExpediente[]> {
    const client = await getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('talento_documentos_expediente')
          .select('*')
          .eq('talento_id', talentoId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const idsDb = new Set(data.map((d: TalentoDocumentoExpediente) => d.id));
          const soloMemoria = documentosMemory.filter(d => d.talento_id === talentoId && !idsDb.has(d.id));
          return [...data, ...soloMemoria];
        }
      } catch (e) {
        console.warn('Consulta DB de documentos falló:', e);
      }
    }
    return documentosMemory.filter(d => d.talento_id === talentoId);
  }

  // --------------------------------------------------------------------------
  // 5. EVALUACIONES DE DESEMPEÑO Y FISCALIZACIÓN
  // --------------------------------------------------------------------------

  static async crearEvaluacionDesempeno(
    evalData: Omit<TalentoEvaluacion, 'id' | 'created_at'> & { id?: string }
  ): Promise<TalentoEvaluacion> {
    const now = new Date().toISOString();
    const id = evalData.id || generateUUID();
    const nuevaEvaluacion: TalentoEvaluacion = {
      ...evalData,
      id,
      calificacion_calidad: Math.max(1, Math.min(5, evalData.calificacion_calidad)),
      calificacion_cumplimiento_plazo: Math.max(1, Math.min(5, evalData.calificacion_cumplimiento_plazo)),
      calificacion_sst: Math.max(1, Math.min(5, evalData.calificacion_sst)),
      created_at: now
    };

    const client = await getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('talento_evaluaciones')
          .insert({
            id: nuevaEvaluacion.id,
            asignacion_id: nuevaEvaluacion.asignacion_id,
            proyecto_id: nuevaEvaluacion.proyecto_id,
            empresa_id: nuevaEvaluacion.empresa_id,
            talento_id: nuevaEvaluacion.talento_id,
            calificacion_calidad: nuevaEvaluacion.calificacion_calidad,
            calificacion_cumplimiento_plazo: nuevaEvaluacion.calificacion_cumplimiento_plazo,
            calificacion_sst: nuevaEvaluacion.calificacion_sst,
            comentarios: nuevaEvaluacion.comentarios,
            acta_fiscalizacion_url: nuevaEvaluacion.acta_fiscalizacion_url
          })
          .select()
          .single();

        if (!error && data) {
          evaluacionesMemory.unshift(data);
          return data;
        }
      } catch (e) {
        console.warn('Persistencia DB de evaluación falló:', e);
      }
    }

    evaluacionesMemory.unshift(nuevaEvaluacion);
    return nuevaEvaluacion;
  }

  static async listarEvaluacionesTalento(talentoId?: string): Promise<TalentoEvaluacion[]> {
    const client = await getSupabaseClient();
    if (client) {
      try {
        let query = client
          .from('talento_evaluaciones')
          .select('*')
          .order('created_at', { ascending: false });

        if (talentoId) {
          query = query.eq('talento_id', talentoId);
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          const idsDb = new Set(data.map((d: TalentoEvaluacion) => d.id));
          const soloMemoria = evaluacionesMemory.filter(e => (!talentoId || e.talento_id === talentoId) && !idsDb.has(e.id));
          return [...data, ...soloMemoria];
        }
      } catch (e) {
        console.warn('Consulta DB de evaluaciones falló:', e);
      }
    }
    return talentoId ? evaluacionesMemory.filter(e => e.talento_id === talentoId) : evaluacionesMemory;
  }
}
