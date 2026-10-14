import { SaraSharedMemory } from '../shared-memory';
import { SaraEventBus } from '../event-bus';
import { ApuConsolidadoPayload, ConvocatoriaTalentoEmitidaPayload, ProyectoCreadoPayload } from '../types';

export class SaraTalentoHumanoAgent {
  static readonly AGENT_ID = 'SARA-TALENTOHUMANO';

  /**
   * Ejecuta el mecanismo Push-to-Work, filtrado geolocalizado y conformación de la terna calificada
   */
  static async reclutarPersonal(
    apuData: ApuConsolidadoPayload,
    correlationId: string
  ): Promise<ConvocatoriaTalentoEmitidaPayload> {
    const proyecto = await SaraSharedMemory.get<ProyectoCreadoPayload>(correlationId, 'constructora', 'proyecto_raiz');
    const ciudad = proyecto?.ciudad || 'Cuenca';

    // APRENDIZAJE EVOLUTIVO: Consultar pesos de matching calibrados
    const weightsKnowledge = await SaraSharedMemory.getKnowledge('talent_efficiency', 'pesos_algoritmo_matching');
    const pesoVip = weightsKnowledge?.currentValue?.peso_vip ?? 3.0;
    const pesoCalificacion = weightsKnowledge?.currentValue?.peso_calificacion ?? 2.5;

    // Base de profesionales certificados en el ecosistema SARA
    const baseCandidatos = [
      {
        trabajadorId: 'TAL-001',
        nombre: 'Ing. Ana Gómez PMP',
        rol: 'Ingeniera Residente de Obra',
        calificacionHistorica: 4.95,
        ciudad: 'Cuenca',
        distanciaObraKm: 3.2,
        tarifaHoraUSD: 24.0,
        esVip: true,
        certificaciones: ['Colegio de Ingenieros Azuay Reg. 1420', 'AutoCAD Civil 3D', 'Seguridad Ocupacional IESS'],
        esForaneo: false
      },
      {
        trabajadorId: 'TAL-002',
        nombre: 'Mstr. Juan Carlos Pérez',
        rol: 'Maestro Mayor de Obra',
        calificacionHistorica: 4.98,
        ciudad: 'Cuenca',
        distanciaObraKm: 4.5,
        tarifaHoraUSD: 9.50,
        esVip: true,
        certificaciones: ['Certificación SECAP Maestro Mayor', 'Trabajo Seguro en Alturas'],
        esForaneo: false
      },
      {
        trabajadorId: 'TAL-003',
        nombre: 'Ing. Byron Zambrano',
        rol: 'Especialista en Geotecnia y Topografía',
        calificacionHistorica: 4.88,
        ciudad: 'Guayaquil',
        distanciaObraKm: 190.0,
        tarifaHoraUSD: 26.0,
        esVip: true,
        certificaciones: ['Topografía Satelital RTK / Drones', 'Mecánica de Suelos'],
        esForaneo: true // Requiere campamento/alojamiento temporal
      },
      {
        trabajadorId: 'TAL-004',
        nombre: 'Segundo Morales & Cuadrilla',
        rol: 'Cuadrilla de Encofrado y Hormigón (4 oficiales)',
        calificacionHistorica: 4.82,
        ciudad: 'Cuenca',
        distanciaObraKm: 6.8,
        tarifaHoraUSD: 22.0,
        esVip: false,
        certificaciones: ['Encofradores Calificados Azuay'],
        esForaneo: false
      }
    ];

    // Algoritmo de afinidad IA aplicando pesos evolutivos
    const ternaCalificada = baseCandidatos.map(c => {
      const afinidad = +(
        (c.calificacionHistorica * pesoCalificacion) +
        (c.esVip ? pesoVip * 1.5 : 1.0) +
        Math.max(0, 10 - c.distanciaObraKm / 20)
      ).toFixed(2);

      return {
        trabajadorId: c.trabajadorId,
        nombre: c.nombre,
        rol: c.rol,
        calificacionHistorica: c.calificacionHistorica,
        distanciaObraKm: c.distanciaObraKm,
        tarifaHoraUSD: c.tarifaHoraUSD,
        certificaciones: c.certificaciones,
        indiceAfinidadIA: afinidad,
        esForaneo: c.esForaneo
      };
    }).sort((a, b) => b.indiceAfinidadIA - a.indiceAfinidadIA);

    const personalForaneo = ternaCalificada.filter(t => t.esForaneo);
    const requiereAlojamientoTecnico = personalForaneo.length > 0;

    const payload: ConvocatoriaTalentoEmitidaPayload = {
      proyectoId: apuData.proyectoId,
      vacantesPublicadas: apuData.horasHombreDesglose.reduce((acc, h) => acc + h.cantidadTrabajadoresSugerida, 0),
      perfilesContactadosWhatsApp: 18,
      ternaCalificada: ternaCalificada.map(({ esForaneo, ...rest }) => rest),
      requiereAlojamientoTecnico,
      personalForaneoCount: personalForaneo.length
    };

    // 1. Guardar en Memoria Colectiva
    await SaraSharedMemory.set(
      correlationId,
      'talento',
      'terna_preseleccionada',
      payload,
      0.97,
      ['talento', 'matching', 'push_to_work'],
      apuData.proyectoId
    );

    // 2. Disparar Evento Global
    await SaraEventBus.publish<ConvocatoriaTalentoEmitidaPayload>(
      'CONVOCATORIA_TALENTO_EMITIDA',
      this.AGENT_ID,
      ['SARA-CONSTRUCTORA', 'SARA-ALOJAMIENTO'],
      payload,
      correlationId,
      apuData.proyectoId
    );

    return payload;
  }
}
