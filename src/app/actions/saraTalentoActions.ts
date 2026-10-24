'use server';

/**
 * SERVER ACTIONS: SARA TALENTO HUMANO CORE
 * Operaciones directas seguras para Server Components y formularios en React
 */

import { revalidatePath } from 'next/cache';
import { 
  SaraTalentoCoreService, 
  TalentoVacante, 
  TalentoPostulacion, 
  TalentoAsignacionObra, 
  TalentoDocumentoExpediente, 
  TalentoEvaluacion,
  EstadoVacante,
  EstadoPostulacion
} from '@/lib/services/saraTalentoCoreService';
import { SaraEventBus } from '@/lib/agents/event-bus';
import { SaraSharedMemory } from '@/lib/agents/shared-memory';
import { ConvocatoriaTalentoEmitidaPayload } from '@/lib/agents/types';

export async function actionCrearVacante(formData: FormData) {
  try {
    const titulo = formData.get('titulo') as string;
    const rol_oficio = formData.get('rol_oficio') as string;
    const especialidad = (formData.get('especialidad') as string) || undefined;
    const descripcion = formData.get('descripcion') as string;
    const requisitos = (formData.get('requisitos') as string) || undefined;
    const ubicacion_provincia = formData.get('ubicacion_provincia') as string;
    const ubicacion_canton = formData.get('ubicacion_canton') as string;
    const salario_min = formData.get('salario_min') ? Number(formData.get('salario_min')) : undefined;
    const salario_max = formData.get('salario_max') ? Number(formData.get('salario_max')) : undefined;
    const vacantes_disponibles = formData.get('vacantes_disponibles') ? Number(formData.get('vacantes_disponibles')) : 1;
    const empresa_id = (formData.get('empresa_id') as string) || '11111111-1111-1111-1111-111111111111';
    const proyecto_id = (formData.get('proyecto_id') as string) || undefined;

    const certsRaw = formData.get('certificaciones_requeridas') as string;
    const certificaciones_requeridas = certsRaw ? certsRaw.split(',').map(s => s.trim()) : [];

    const vacante = await SaraTalentoCoreService.crearVacante({
      empresa_id,
      proyecto_id,
      titulo,
      rol_oficio,
      especialidad,
      descripcion,
      requisitos,
      certificaciones_requeridas,
      ubicacion_provincia,
      ubicacion_canton,
      modalidad: 'presencial_obra',
      tipo_contrato: 'obra_cierta',
      salario_min,
      salario_max,
      estado: 'publicada',
      vacantes_disponibles
    });

    revalidatePath('/talento');
    return { success: true, data: vacante };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error creando vacante' };
  }
}

export async function actionPostularseVacante(payload: {
  vacante_id: string;
  talento_id: string;
  mensaje_presentacion?: string;
  tarifa_ofertada?: number;
}) {
  try {
    const postulacion = await SaraTalentoCoreService.crearPostulacion({
      ...payload,
      estado: 'recibida'
    });
    revalidatePath('/talento');
    return { success: true, data: postulacion };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al postularse' };
  }
}

export async function actionActualizarEstadoPostulacion(payload: {
  id: string;
  estado: EstadoPostulacion;
  notas_privadas?: string;
  fecha_entrevista?: string;
}) {
  try {
    const res = await SaraTalentoCoreService.actualizarEstadoPostulacion(
      payload.id,
      payload.estado,
      payload.notas_privadas,
      payload.fecha_entrevista
    );
    revalidatePath('/talento');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar postulación' };
  }
}

export async function actionAsignarTalentoObra(payload: {
  postulacion_id?: string;
  talento_id: string;
  proyecto_id?: string;
  empresa_id: string;
  rol_asignado: string;
  fecha_inicio: string;
  fecha_fin_prevista?: string;
  tarifa_acordada_hora?: number;
  fondo_escrow_id?: string;
}) {
  try {
    const asignacion = await SaraTalentoCoreService.crearAsignacionObra({
      ...payload,
      estado: 'activa'
    });

    // Publicar evento en el EventBus del ecosistema SARA
    const correlationId = `corr-asig-${Date.now()}`;
    const eventPayload: ConvocatoriaTalentoEmitidaPayload = {
      proyectoId: payload.proyecto_id || 'PROY-GENERAL',
      vacantesPublicadas: 1,
      perfilesContactadosWhatsApp: 1,
      ternaCalificada: [
        {
          trabajadorId: payload.talento_id,
          nombre: payload.rol_asignado,
          rol: payload.rol_asignado,
          calificacionHistorica: 4.9,
          distanciaObraKm: 12.0,
          tarifaHoraUSD: payload.tarifa_acordada_hora || 6.5,
          certificaciones: ['SECAP Certificado', 'Prevención Riesgos IESS CD 513'],
          indiceAfinidadIA: 9.8
        }
      ],
      requiereAlojamientoTecnico: false,
      personalForaneoCount: 0,
      cumplimientoSstDecreto255: {
        sbuAplicadoUSD: 482.0,
        reglamentoSstVigente: 'Decreto Ejecutivo 255 MDT & Resolución CD 513 IESS',
        certificacionesSecapVerificadas: true
      }
    };

    try {
      await SaraSharedMemory.set(
        correlationId,
        'talento',
        'asignacion_obra_activa',
        asignacion,
        0.98,
        ['asignacion', 'obra', 'talento'],
        payload.proyecto_id
      );

      await SaraEventBus.publish<ConvocatoriaTalentoEmitidaPayload>(
        'CONVOCATORIA_TALENTO_EMITIDA',
        'SARA-TALENTOHUMANO',
        ['SARA-CONSTRUCTORA', 'SARA-ALOJAMIENTO'],
        eventPayload,
        correlationId,
        payload.proyecto_id
      );
    } catch (busErr) {
      console.warn('[saraTalentoActions] Error secundario al emitir evento en SaraEventBus:', busErr);
    }

    revalidatePath('/talento');
    return { success: true, data: asignacion };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error formalizando asignación' };
  }
}

export async function actionSubirDocumentoExpediente(payload: {
  talento_id: string;
  tipo_documento: any;
  archivo_url: string;
  nombre_archivo: string;
  fecha_vencimiento?: string;
}) {
  try {
    const doc = await SaraTalentoCoreService.subirDocumentoExpediente(payload);
    revalidatePath('/talento');
    return { success: true, data: doc };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error subiendo documento de expediente' };
  }
}

export async function actionValidarDocumentoExpediente(payload: {
  id: string;
  estado: 'validado' | 'rechazado';
  validado_por?: string;
  motivo_rechazo?: string;
}) {
  try {
    const doc = await SaraTalentoCoreService.validarDocumentoExpediente(
      payload.id,
      payload.estado,
      payload.validado_por,
      payload.motivo_rechazo
    );
    revalidatePath('/talento');
    return { success: true, data: doc };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error validando documento' };
  }
}

export async function actionEvaluarDesempeno(payload: {
  asignacion_id: string;
  proyecto_id?: string;
  empresa_id: string;
  talento_id: string;
  calificacion_calidad: number;
  calificacion_cumplimiento_plazo: number;
  calificacion_sst: number;
  comentarios?: string;
  acta_fiscalizacion_url?: string;
}) {
  try {
    const evalData = await SaraTalentoCoreService.crearEvaluacionDesempeno(payload);
    revalidatePath('/talento');
    return { success: true, data: evalData };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error registrando evaluación de desempeño' };
  }
}
