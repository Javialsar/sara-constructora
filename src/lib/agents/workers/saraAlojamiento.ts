import { SaraSharedMemory } from '../shared-memory';
import { SaraEventBus } from '../event-bus';
import { AlojamientosLogisticosReservadosPayload, ConvocatoriaTalentoEmitidaPayload, ProyectoCreadoPayload } from '../types';

export class SaraAlojamientoAgent {
  static readonly AGENT_ID = 'SARA-ALOJAMIENTO';

  /**
   * Asigna suites o campamentos técnicos ejecutivos con cerraduras inteligentes y tarifa dinámica
   */
  static async gestionarAlojamiento(
    correlationId: string
  ): Promise<AlojamientosLogisticosReservadosPayload> {
    const proyecto = await SaraSharedMemory.get<ProyectoCreadoPayload>(correlationId, 'constructora', 'proyecto_raiz');
    const talento = await SaraSharedMemory.get<ConvocatoriaTalentoEmitidaPayload>(correlationId, 'talento', 'terna_preseleccionada');

    const ciudad = proyecto?.ciudad || 'Cuenca';
    const numHabitaciones = Math.max(1, talento?.personalForaneoCount || 1);

    // APRENDIZAJE EVOLUTIVO: Ajuste dinámico de tarifas por ocupación y temporada en Cuenca/Quito/Galápagos/Baños
    const mesActual = new Date().getMonth(); // 0 a 11
    const esTemporadaAlta = mesActual === 10 || mesActual === 11 || mesActual === 3; // Fiestas de Cuenca / Diciembre / Semana Santa
    const factorDinamico = esTemporadaAlta ? 1.15 : 0.92;

    const tarifaBaseNoche = 55.0; // Tarifa corporativa negociada Grupo SARA Stays
    const tarifaOptimizada = +(tarifaBaseNoche * factorDinamico).toFixed(2);
    const duracionDias = 14; // Primera fase de implantación de obra y topografía
    const totalAlojamientoUSD = Math.round(tarifaOptimizada * duracionDias * numHabitaciones);

    // Generar PIN único de cerradura inteligente autónoma
    const pinGenerado = `${Math.floor(1000 + Math.random() * 9000)}#`;

    const payload: AlojamientosLogisticosReservadosPayload = {
      proyectoId: proyecto?.proyectoId || 'proy_default',
      habitacionesBloqueadas: numHabitaciones,
      ubicacionAlojamiento: `${ciudad} - SARA Stays Suites Ejecutivas (Sector Paseo 3 de Noviembre)`,
      propiedadNombre: `Suite Ejecutiva SARA-Stays Campamento Urbano ${ciudad}`,
      tipoEstadia: 'Campamento Técnico Ejecutivos',
      fechaIngreso: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      fechaSalida: new Date(Date.now() + 86400000 * (3 + duracionDias)).toISOString().split('T')[0],
      tarifaNocheUSD: tarifaOptimizada,
      totalAlojamientoUSD,
      checkInAutonomoPIN: pinGenerado,
      optimizacionTarifaDinamicaPct: esTemporadaAlta ? 15 : -8
    };

    // 1. Guardar en Memoria Colectiva
    await SaraSharedMemory.set(
      correlationId,
      'alojamiento',
      'reserva_logistica',
      payload,
      0.98,
      ['alojamiento', 'stays', 'airbnb', ciudad],
      proyecto?.proyectoId
    );

    // 2. Disparar Evento Global
    await SaraEventBus.publish<AlojamientosLogisticosReservadosPayload>(
      'ALOJAMIENTOS_LOGISTICOS_RESERVADOS',
      this.AGENT_ID,
      ['SARA-TALENTOHUMANO', 'SARA-PAGOS'],
      payload,
      correlationId,
      proyecto?.proyectoId
    );

    return payload;
  }
}
