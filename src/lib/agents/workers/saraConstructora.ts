import { SaraSharedMemory } from '../shared-memory';
import { SaraEventBus } from '../event-bus';
import { ProyectoCreadoPayload } from '../types';

export class SaraConstructoraAgent {
  static readonly AGENT_ID = 'SARA-CONSTRUCTORA';

  /**
   * Captura y estructura la entidad raíz del proyecto en Ecuador
   */
  static async estructurarProyecto(input: {
    nombre: string;
    provincia: string;
    ciudad: string;
    tipologia: 'Residencial' | 'Vial' | 'Comercial' | 'Estructura Metálica';
    areaM2: number;
    niveles?: number;
    coordenadas?: { lat: number; lng: number };
    cliente: { nombre: string; contacto: string; email: string };
  }): Promise<{ correlationId: string; payload: ProyectoCreadoPayload }> {
    const correlationId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `corr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      
    const proyectoId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `proy_${Date.now()}`;

    // APRENDIZAJE EVOLUTIVO: Consultar qué sistema constructivo genera menos retrasos históricos
    const delayKnowledge = await SaraSharedMemory.getKnowledge('apu_yields', `rendimiento_mano_obra_${input.provincia.toLowerCase()}`);
    let sistemaSugerido: 'Hormigón Armado' | 'Estructura de Acero' | 'Mampostería Portante' | 'Mixto' = 'Hormigón Armado';

    if (input.tipologia === 'Comercial' || input.tipologia === 'Estructura Metálica') {
      sistemaSugerido = 'Estructura de Acero';
    } else if (input.provincia.toLowerCase() === 'guayas' && input.areaM2 > 200) {
      sistemaSugerido = 'Mixto'; // Mitiga retrasos por alta temperatura y fraguado rápido
    }

    // Coordenadas por defecto en Ecuador si no vienen dadas
    const coordenadasDefecto: Record<string, { lat: number; lng: number }> = {
      azuay: { lat: -2.9001, lng: -79.0059 }, // Cuenca
      pichincha: { lat: -0.1807, lng: -78.4678 }, // Quito
      guayas: { lat: -2.1894, lng: -79.8891 }, // Guayaquil
      tungurahua: { lat: -1.2491, lng: -78.6168 }, // Ambato / Baños
      galapagos: { lat: -0.7432, lng: -90.3135 } // Puerto Ayora
    };

    const provKey = input.provincia.toLowerCase();
    const coords = input.coordenadas || coordenadasDefecto[provKey] || { lat: -2.9001, lng: -79.0059 };

    // Estimación paramétrica inicial (promedio $480/m2 para residencial estándar)
    const costoBaseM2 = input.tipologia === 'Comercial' ? 520 : input.tipologia === 'Vial' ? 320 : 480;
    const presupuestoEstimadoReferencial = Math.round(input.areaM2 * costoBaseM2);

    const payload: ProyectoCreadoPayload = {
      proyectoId,
      nombre: input.nombre,
      provincia: input.provincia,
      ciudad: input.ciudad,
      tipologia: input.tipologia,
      sistemaConstructivo: sistemaSugerido,
      areaM2: input.areaM2,
      niveles: input.niveles || (input.areaM2 > 180 ? 2 : 1),
      coordenadas: coords,
      presupuestoEstimadoReferencial,
      cliente: input.cliente
    };

    // 1. Guardar en la Memoria Colectiva
    await SaraSharedMemory.set(
      correlationId,
      'constructora',
      'proyecto_raiz',
      payload,
      0.98,
      ['raiz', input.provincia, input.tipologia],
      proyectoId
    );

    // 2. Disparar Evento Global que despierta a SARA-APU y SARA-INMOBILIARIA
    await SaraEventBus.publish<ProyectoCreadoPayload>(
      'PROYECTO_CREADO',
      this.AGENT_ID,
      ['SARA-APU', 'SARA-INMOBILIARIA'],
      payload,
      correlationId,
      proyectoId
    );

    return { correlationId, payload };
  }
}
