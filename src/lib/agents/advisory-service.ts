import { createClient } from '@/lib/supabase/server';
import {
  SaraAdvisoryLog,
  SupplierComparisonItem,
  ConsolidatedLogisticsItem,
  CuadroComparativoDocumentData,
  ReporteConsolidadoDocumentData,
  SaraDecisionTecnico
} from './advisory-types';
import { SaraSharedMemory } from './shared-memory';

// Memoria volátil para sesiones rápidas y fallback serverless
const localAdvisoryLogs = new Map<string, SaraAdvisoryLog>();

// Proveedores de referencia en el ecosistema ecuatoriano
const PROVEEDORES_CATALOGO: SupplierComparisonItem[] = [
  {
    id: 'prov-01',
    insumo: 'Acero Corrugado Fy=4200 kg/cm2 (Varilla 12mm - 12m)',
    proveedor: 'Adelca Distribución Directa',
    ciudadOrigen: 'Quito / Lasso',
    precioUnitario: 1.14,
    unidad: 'kg',
    fleteIncluido: true,
    costoFleteUnitario: 0.00,
    diasCredito: 15,
    tiempoEntregaDias: 2,
    puntuacionConfianzaIA: 98,
    recomendado: true,
    motivoRecomendacion: 'Flete absorbido en precio final + línea de crédito de 15 días plazo. Optimiza flujo de caja en 12%.'
  },
  {
    id: 'prov-02',
    insumo: 'Acero Corrugado Fy=4200 kg/cm2 (Varilla 12mm - 12m)',
    proveedor: 'Novacero Mayorista Austro',
    ciudadOrigen: 'Cuenca',
    precioUnitario: 1.17,
    unidad: 'kg',
    fleteIncluido: false,
    costoFleteUnitario: 0.03,
    diasCredito: 0,
    tiempoEntregaDias: 1,
    puntuacionConfianzaIA: 91,
    recomendado: false,
    motivoRecomendacion: 'Disponibilidad inmediata en patio local pero pago de contado y flete no bonificado.'
  },
  {
    id: 'prov-03',
    insumo: 'Acero Corrugado Fy=4200 kg/cm2 (Varilla 12mm - 12m)',
    proveedor: 'Comercializadora Ferretera del Pacífico',
    ciudadOrigen: 'Guayaquil',
    precioUnitario: 1.12,
    unidad: 'kg',
    fleteIncluido: false,
    costoFleteUnitario: 0.06,
    diasCredito: 7,
    tiempoEntregaDias: 3,
    puntuacionConfianzaIA: 87,
    recomendado: false,
    motivoRecomendacion: 'Precio base menor pero flete interprovincial encarece el costo puesto en obra a $1.18/kg.'
  },
  {
    id: 'prov-04',
    insumo: 'Cemento Portland Tipo GU (Saco 50kg)',
    proveedor: 'Holcim Red Aliada Cuenca',
    ciudadOrigen: 'Cuenca / Planta Latacunga',
    precioUnitario: 7.35,
    unidad: 'saco',
    fleteIncluido: true,
    costoFleteUnitario: 0.00,
    diasCredito: 21,
    tiempoEntregaDias: 1,
    puntuacionConfianzaIA: 97,
    recomendado: true,
    motivoRecomendacion: 'Tarifa preferencial Grupo SARA con 21 días de plazo y despacho garantizado a pie de obra.'
  },
  {
    id: 'prov-05',
    insumo: 'Cemento Selvalegre Especial (Saco 50kg)',
    proveedor: 'UNACEM Distribución Sierra',
    ciudadOrigen: 'Otavalo / Quito',
    precioUnitario: 7.42,
    unidad: 'saco',
    fleteIncluido: false,
    costoFleteUnitario: 0.45,
    diasCredito: 10,
    tiempoEntregaDias: 3,
    puntuacionConfianzaIA: 89,
    recomendado: false,
    motivoRecomendacion: 'Mayor costo logístico hacia la zona sur del país.'
  },
  {
    id: 'prov-06',
    insumo: 'Árido Triturado 3/4" y Arena Lavada de Río',
    proveedor: 'Cantera El Chorro - Austro Áridos',
    ciudadOrigen: 'Paute / Azuay',
    precioUnitario: 14.50,
    unidad: 'm3',
    fleteIncluido: true,
    costoFleteUnitario: 0.00,
    diasCredito: 15,
    tiempoEntregaDias: 1,
    puntuacionConfianzaIA: 96,
    recomendado: true,
    motivoRecomendacion: 'Cantera certificada con ensayos de laboratorio ASTM C33 y despacho en volquetas unificadas.'
  }
];

export class SaraAdvisoryService {
  /**
   * Genera recomendaciones iniciales de co-piloto para un proyecto o presupuesto
   */
  static async generarRecomendacionesContextuales(input: {
    proyectoId?: string;
    nombreProyecto?: string;
    ubicacion?: string;
    costoDirectoTotal?: number;
    volumenDesalojoM3?: number;
    rubrosCount?: number;
  }): Promise<SaraAdvisoryLog[]> {
    const proyectoId = input.proyectoId || 'default-project-id';
    const nombre = input.nombreProyecto || 'Proyecto de Obra Civil';
    const ubicacion = input.ubicacion || 'Cuenca, Azuay';
    const costoDirecto = input.costoDirectoTotal || 45200;
    const volumenDesalojo = input.volumenDesalojoM3 || 45;

    const sugerenciasConfig = [
      {
        agent_id: 'SARA-APU + SARA-MARKETPLACE',
        tipo_asesoria: 'compras_suministros',
        mensaje_sugerencia: `Estimado Ingeniero, analizando el rubro de acero estructural para "${nombre}", le sugiero adquirir la varilla con el "Proveedor Adelca Distribución Directa" en Quito. Aunque su precio base es similar al resto, este proveedor ofrece una línea de crédito de 15 días plazo y el costo del flete ya está considerado dentro del precio final, lo que optimiza su flujo de caja inmediato en un 12%.`,
        datos_contexto: {
          insumoClave: 'Acero Corrugado Fy=4200 kg/cm2',
          proveedorRecomendado: 'Adelca Distribución Directa (Quito)',
          diasCredito: 15,
          fleteIncluido: true,
          optimizacionFlujoCajaPct: 12,
          scoreConfianza: 0.98,
          comparativaProveedoresDisponibles: 3
        },
        ahorro_estimado_usd: Number((costoDirecto * 0.038).toFixed(2)) // ~3.8% de ahorro en insumos de acero
      },
      {
        agent_id: 'SARA-FLETES',
        tipo_asesoria: 'coordinacion_carga',
        mensaje_sugerencia: `Para los ${volumenDesalojo} m³ de desalojo de material de esta semana en ${ubicacion}, he coordinado con la Cooperativa Vial Local. Si autoriza el despacho unificado en plataformas rígidas en lugar de volquetas individuales, el costo logístico baja un 18% y el seguro de carga cubre todo el trayecto sin costo adicional.`,
        datos_contexto: {
          volumenM3: volumenDesalojo,
          modalidadRecomendada: 'Plataforma rígida unificada con Cooperativa Vial',
          reduccionTarifaPct: 18,
          seguroCargaCubierto: true,
          frecuenciaDespacho: 'Unificado semanal',
          scoreConfianza: 0.94
        },
        ahorro_estimado_usd: Number((volumenDesalojo * 5.33).toFixed(2)) // Ahorro neto en viajes de desalojo
      },
      {
        agent_id: 'SARA-INMOBILIARIA + SARA-ALOJAMIENTO',
        tipo_asesoria: 'rentabilidad_campamentos',
        mensaje_sugerencia: `Arquitecto, según las especificaciones de acabados de obra, si destina los tres departamentos del bloque B al módulo SARA-ALOJAMIENTO en lugar de venta tradicional, la tasa de ocupación corporativa proyectada para la zona le generará un flujo mensual estable de $2,400, acelerando el retorno de la inversión total del lote en 1.5 años.`,
        datos_contexto: {
          unidadesSugeridas: 3,
          flujoMensualEstimadoUSD: 2400,
          aceleracionRoiAnos: 1.5,
          moduloExplotacion: 'SARA-ALOJAMIENTO Corporativo & Stays',
          demandaZona: 'Alta demanda ejecutiva / empresas aliadas',
          scoreConfianza: 0.92
        },
        ahorro_estimado_usd: 28800.00
      }
    ];

    const logsGenerados: SaraAdvisoryLog[] = [];

    for (const config of sugerenciasConfig) {
      const logItem: SaraAdvisoryLog = {
        id: `adv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        proyecto_id: proyectoId,
        correlation_id: `corr-${proyectoId}`,
        agent_id: config.agent_id,
        tipo_asesoria: config.tipo_asesoria,
        mensaje_sugerencia: config.mensaje_sugerencia,
        datos_contexto: config.datos_contexto,
        decision_tecnico: 'pendiente',
        ahorro_estimado_usd: config.ahorro_estimado_usd,
        created_at: new Date().toISOString()
      };

      // Guardar en caché y sincronizar con base de datos
      localAdvisoryLogs.set(logItem.id, logItem);
      await this.persistirEnBaseDatos(logItem);
      logsGenerados.push(logItem);
    }

    return logsGenerados;
  }

  /**
   * Atiende una pregunta técnica libre del ingeniero con tono de Consultor Senior en Ingeniería y Finanzas
   */
  static async responderConsultaTecnico(
    mensajeTecnico: string,
    contexto: {
      proyectoId?: string;
      nombreProyecto?: string;
      ubicacion?: string;
      presupuestoTotal?: number;
    }
  ): Promise<{ respuesta: string; agentId: string; ahorroSugeridoUSD: number; datosContexto: any }> {
    const q = (mensajeTecnico || '').toLowerCase();
    const proyecto = contexto.nombreProyecto || 'Proyecto SARA';
    const ubicacion = contexto.ubicacion || 'Cuenca, Azuay';

    // 1. Consulta sobre Suministros y Acero / Cemento
    if (q.includes('acero') || q.includes('varilla') || q.includes('cemento') || q.includes('proveedor') || q.includes('compra')) {
      return {
        agentId: 'SARA-APU + SARA-MARKETPLACE',
        ahorroSugeridoUSD: 450.00,
        datosContexto: { insumo: 'Acero / Cemento', recomendacion: 'Adelca Quito / Holcim Cuenca' },
        respuesta: `Estimado Ingeniero, revisando los requerimientos de insumos para "${proyecto}", le confirmo que el acero corrugado Fy=4200 kg/cm² conviene consolidarlo a través del centro de distribución mayorista en Quito (Adelca) con despacho programado. Aunque el precio de lista parece similar al mostrador local ($1.14 vs $1.17/kg), logramos una línea de crédito comercial a 15 días plazo sin recargo financiero y con seguro de transporte bonificado, liberando liquidez operativa para las planillas iniciales de mano de obra.`
      };
    }

    // 2. Consulta sobre Fletes, Volquetas, Desalojo o Maquinaria
    if (q.includes('flete') || q.includes('transporte') || q.includes('volqueta') || q.includes('desalojo') || q.includes('carga') || q.includes('mula')) {
      return {
        agentId: 'SARA-FLETES',
        ahorroSugeridoUSD: 310.00,
        datosContexto: { tipoCarga: 'Desalojo / Transporte pesado', cooperativa: 'Cooperativa Vial del Austro' },
        respuesta: `Ingeniero, respecto a la logística de desalojo y transporte pesado en la zona de ${ubicacion}: desaconsejo contratar volquetas de 8 m³ por viaje individual debido a los tiempos muertos en báscula. Hemos cerrado una tarifa preferencial con la Cooperativa Vial aliada para emplear volquetas tándem de 14 m³ y plataformas rígidas de 30T para acero. Esta sincronización reduce el costo por metro cúbico en un 18% y cubre póliza contra derrumbes en el trayecto.`
      };
    }

    // 3. Consulta sobre Rentabilidad Inmobiliaria, Airbnb, Vivienda o Campamentos
    if (q.includes('rentab') || q.includes('inmobili') || q.includes('alojamiento') || q.includes('airbnb') || q.includes('roi') || q.includes('venta') || q.includes('campamento')) {
      return {
        agentId: 'SARA-INMOBILIARIA + SARA-ALOJAMIENTO',
        ahorroSugeridoUSD: 18000.00,
        datosContexto: { modelo: 'SARA-ALOJAMIENTO vs Venta tradicional', retorno: '+18% ROI' },
        respuesta: `Arquitecto, evaluando el análisis de plusvalía y absorción de mercado para "${proyecto}": la venta tradicional de unidades residenciales en este sector promedia 14 meses de colocación. Si integramos las unidades a la plataforma SARA-ALOJAMIENTO con cerraduras autónomas y gestión corporativa para técnicos foráneos y turismo ejecutivo, la tasa de ocupación esperada del 72% genera un flujo mensual de \$2,400 por bloque, acortando el plazo de amortización del capital en más de año y medio.`
      };
    }

    // 4. Consulta sobre Pagos, SRI, Retenciones o Escrow
    if (q.includes('pago') || q.includes('escrow') || q.includes('sri') || q.includes('anticipo') || q.includes('custodia')) {
      return {
        agentId: 'SARA-PAGOS',
        ahorroSugeridoUSD: 600.00,
        datosContexto: { escrow: 'Activo', proteccion_fondos: '100%' },
        respuesta: `Estimado colega, para blindar los flujos del proyecto bajo la normativa ecuatoriana, los fondos del anticipo deben permanecer en la cuenta de custodia Escrow de Grupo SARA. Las liberaciones se realizarán de manera automática en dos tramos (40% al verificar acopio de hierro y áridos en territorio, y 60% contra acta de entrega-recepción provisional firmada por el Fiscalizador). Esto evita descapitalización y contingencias tributarias con el SRI.`
      };
    }

    // 5. Respuesta técnica general por defecto
    return {
      agentId: 'SARA-APU + SARA-MARKETPLACE',
      ahorroSugeridoUSD: 250.00,
      datosContexto: { asesor: 'Co-Piloto Senior' },
      respuesta: `Con gusto, Ingeniero. Como consultor senior del proyecto "${proyecto}", estoy monitoreando activamente la estructura de costos directos, las fluctuaciones de proveedores en Ecuador y las rutas logísticas. Le recomiendo generar el "Cuadro Comparativo de Proveedores" y el "Reporte Consolidado de Insumos" para formalizar la asignación de materiales con los mejores plazos de crédito y fletes cubiertos.`
    };
  }

  /**
   * Actualiza la decisión del técnico (Aceptada / Rechazada) y persiste en DB
   */
  static async actualizarDecisionTecnico(
    logId: string,
    decision: SaraDecisionTecnico,
    proyectoId?: string
  ): Promise<SaraAdvisoryLog | null> {
    let log = localAdvisoryLogs.get(logId);

    if (!log) {
      // Buscar en Supabase si no está en memoria
      try {
        const supabase = await createClient();
        const { data } = await supabase
          .from('sara_ai_advisory_logs')
          .select('*')
          .eq('id', logId)
          .maybeSingle();

        if (data) {
          log = {
            id: data.id,
            proyecto_id: data.proyecto_id,
            correlation_id: data.correlation_id,
            agent_id: data.agent_id,
            tipo_asesoria: data.tipo_asesoria,
            mensaje_sugerencia: data.mensaje_sugerencia,
            datos_contexto: data.datos_contexto || {},
            decision_tecnico: data.decision_tecnico,
            ahorro_estimado_usd: Number(data.ahorro_estimado_usd || 0),
            created_at: data.created_at,
            decided_at: data.decided_at
          };
        }
      } catch (err) {
        console.warn('[SaraAdvisoryService] Error buscando log en DB:', err);
      }
    }

    if (!log) {
      // Fallback creando uno nuevo en memoria
      log = {
        id: logId,
        proyecto_id: proyectoId || 'default-project-id',
        agent_id: 'SARA-APU + SARA-MARKETPLACE',
        tipo_asesoria: 'compras_suministros',
        mensaje_sugerencia: 'Recomendación técnica procesada.',
        datos_contexto: {},
        decision_tecnico: decision,
        ahorro_estimado_usd: decision === 'aceptada' ? 350 : 0,
        created_at: new Date().toISOString()
      };
    }

    log.decision_tecnico = decision;
    log.decided_at = new Date().toISOString();
    localAdvisoryLogs.set(log.id, log);

    // Actualizar en base de datos
    try {
      const supabase = await createClient();
      await supabase
        .from('sara_ai_advisory_logs')
        .update({
          decision_tecnico: decision,
          decided_at: log.decided_at
        })
        .eq('id', log.id);
    } catch (e) {
      console.warn('[SaraAdvisoryService] No se pudo actualizar en Supabase:', e);
    }

    // Si la decisión fue aceptada, registrar en la memoria evolutiva compartida
    if (decision === 'aceptada' && log.correlation_id) {
      await SaraSharedMemory.set(
        log.correlation_id,
        'advisory_decisions',
        `decision_${log.id}`,
        {
          agent_id: log.agent_id,
          tipo: log.tipo_asesoria,
          ahorroUSD: log.ahorro_estimado_usd,
          decision: 'aceptada'
        },
        0.98,
        ['advisory', 'learning_feedback'],
        log.proyecto_id || undefined
      );
    }

    return log;
  }

  /**
   * Compila el Cuadro Comparativo de Proveedores listo para exportar
   */
  static compilarCuadroComparativo(
    proyectoNombre: string = 'Edificación Residencial / Vial SARA',
    ubicacion: string = 'Cuenca, Ecuador',
    itemsPersonalizados?: SupplierComparisonItem[]
  ): CuadroComparativoDocumentData {
    const items = itemsPersonalizados && itemsPersonalizados.length > 0 ? itemsPersonalizados : PROVEEDORES_CATALOGO;
    const adjudicados = items.filter(i => i.recomendado).map(i => `${i.proveedor} (${i.insumo.split('(')[0].trim()})`);

    const ahorroTotal = items
      .filter(i => i.recomendado)
      .reduce((acc, curr) => acc + (curr.precioUnitario * 0.12 * 100), 768.00);

    return {
      titulo: 'CUADRO COMPARATIVO TÉCNICO DE PROVEEDORES Y SUMINISTROS',
      proyectoNombre,
      ubicacion,
      fechaEmision: new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' }),
      codigoDocumento: `SARA-MAT-COMP-${Date.now().toString().slice(-6)}`,
      tecnicoResponsable: 'Ing. Evaluador Técnico SARA',
      directorObra: 'Ing. Javier Sarango Gona (Reg. Prof. 01-1402)',
      items,
      resumenFinanciero: {
        totalOpcionesAnalizadas: items.length,
        proveedoresAdjudicados: adjudicados,
        ahorroTotalProyectadoUSD: Number(ahorroTotal.toFixed(2)),
        optimizacionFlujoCajaPct: 12.4,
        diasCreditoPromedio: 17
      },
      dictamenIA: 'Se recomienda proceder con la adjudicación sugerida priorizando a Adelca Directa y Holcim Red Aliada por bonificación de flete y crédito operativo a 15 y 21 días plazo, blindando el capital de trabajo de obra.'
    };
  }

  /**
   * Compila el Reporte Consolidado de Insumos y Logística para firma del Director de Obra
   */
  static compilarReporteConsolidado(
    proyectoNombre: string = 'Edificación Residencial / Vial SARA',
    ubicacion: string = 'Cuenca, Ecuador'
  ): ReporteConsolidadoDocumentData {
    const materiales: ConsolidatedLogisticsItem[] = [
      {
        id: 'mat-01',
        material: 'Acero Corrugado Fy=4200 kg/cm2 (Varillas Ø10, Ø12, Ø16)',
        cantidad: 4850,
        unidad: 'kg',
        pesoTotalKg: 4850,
        volumenM3: 0.62,
        ubicacionDespacho: 'Planta Lasso / Quito',
        proveedorAsignado: 'Adelca Distribución Directa',
        tipoTransporteSugerido: 'Plataforma Rígida Pesada 30T',
        cooperativaAliada: 'Cooperativa Nacional de Carga Sierra',
        costoBaseUSD: 5820.00,
        costoOptimizadoUSD: 5529.00,
        ahorroEstimadoUSD: 291.00,
        seguroCargaIncluido: true
      },
      {
        id: 'mat-02',
        material: 'Cemento Estructural Holcim Tipo GU (Sacos 50kg)',
        cantidad: 540,
        unidad: 'sacos',
        pesoTotalKg: 27000,
        volumenM3: 18.2,
        ubicacionDespacho: 'Centro Logístico Regional Austro',
        proveedorAsignado: 'Holcim Red Aliada',
        tipoTransporteSugerido: 'Camión Pesado 15 Toneladas',
        cooperativaAliada: 'Cooperativa de Transportes Tomebamba',
        costoBaseUSD: 4212.00,
        costoOptimizadoUSD: 3969.00,
        ahorroEstimadoUSD: 243.00,
        seguroCargaIncluido: true
      },
      {
        id: 'mat-03',
        material: 'Árido de Cantera (Grava 3/4" y Arena Gruesa Lavada)',
        cantidad: 75,
        unidad: 'm3',
        pesoTotalKg: 120000,
        volumenM3: 75.0,
        ubicacionDespacho: 'Cantera Certificada Paute',
        proveedorAsignado: 'Cantera El Chorro - Austro Áridos',
        tipoTransporteSugerido: 'Volqueta Tándem 14m3 (6 Despachos Unificados)',
        cooperativaAliada: 'Cooperativa Vial del Austro',
        costoBaseUSD: 1425.00,
        costoOptimizadoUSD: 1185.00,
        ahorroEstimadoUSD: 240.00,
        seguroCargaIncluido: true
      },
      {
        id: 'mat-04',
        material: 'Desalojo de Tierra y Escombros a Botadero Autorizado',
        cantidad: 45,
        unidad: 'm3',
        pesoTotalKg: 67500,
        volumenM3: 45.0,
        ubicacionDespacho: 'Zona de Excavación Obra hacia Escombrera Municipal',
        proveedorAsignado: 'Cooperativa Vial Local',
        tipoTransporteSugerido: 'Despacho Unificado en Plataforma / Volqueta Pesada',
        cooperativaAliada: 'Cooperativa Vial Local',
        costoBaseUSD: 855.00,
        costoOptimizadoUSD: 701.00,
        ahorroEstimadoUSD: 154.00,
        seguroCargaIncluido: true
      }
    ];

    const costoBaseTotal = materiales.reduce((acc, m) => acc + m.costoBaseUSD, 0);
    const costoOptimizadoTotal = materiales.reduce((acc, m) => acc + m.costoOptimizadoUSD, 0);
    const ahorroNeto = costoBaseTotal - costoOptimizadoTotal;

    return {
      titulo: 'REPORTE EJECUTIVO CONSOLIDADO DE INSUMOS Y COORDINACIÓN LOGÍSTICA',
      proyectoNombre,
      codigoDocumento: `SARA-LOG-CONSOL-${Date.now().toString().slice(-6)}`,
      fechaEmision: new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' }),
      directorObra: 'Ing. Javier Sarango Gona (Colegio de Ingenieros Civiles)',
      fiscalizadorColegiado: 'Ing. Fiscalizador Técnico Colegiado',
      ubicacionObra: ubicacion,
      volumenDesalojoTotalM3: 45,
      pesoTotalCargaTon: 219.3,
      materiales,
      cooperativasAsignadas: [
        {
          nombre: 'Cooperativa Vial del Austro',
          ruta: 'Paute - Obra (Cuenca)',
          viajes: 6,
          tipoUnidad: 'Volquetas 14m³',
          seguroCarga: true
        },
        {
          nombre: 'Cooperativa Nacional de Carga Sierra',
          ruta: 'Quito - Cuenca (Vía Panamericana)',
          viajes: 1,
          tipoUnidad: 'Plataforma 30T',
          seguroCarga: true
        }
      ],
      balanceFinanciero: {
        costoLogisticoTradicionalUSD: costoBaseTotal,
        costoLogisticoOptimizadoUSD: costoOptimizadoTotal,
        ahorroNetoLogisticaUSD: Number(ahorroNeto.toFixed(2)),
        porcentajeAhorroGlobal: Number(((ahorroNeto / costoBaseTotal) * 100).toFixed(1))
      },
      declaracionResponsabilidad: 'Certifico que la presente cubicación métrica, rutas viales coordinadas y asignación de proveedores aliados cumplen estrictamente con las especificaciones técnicas ecuatorianas y la optimización financiera del Grupo SARA.'
    };
  }

  /**
   * Obtiene todos los logs de asesoría activos para un proyecto
   */
  static async obtenerLogs(proyectoId?: string): Promise<SaraAdvisoryLog[]> {
    const list: SaraAdvisoryLog[] = [];

    // 1. Obtener de caché local
    for (const log of localAdvisoryLogs.values()) {
      if (!proyectoId || log.proyecto_id === proyectoId) {
        list.push(log);
      }
    }

    // 2. Complementar con Supabase
    try {
      const supabase = await createClient();
      let query = supabase
        .from('sara_ai_advisory_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (proyectoId) {
        query = query.eq('proyecto_id', proyectoId);
      }

      const { data, error } = await query;
      if (data && !error && data.length > 0) {
        for (const row of data) {
          if (!list.find(l => l.id === row.id)) {
            list.push({
              id: row.id,
              proyecto_id: row.proyecto_id,
              correlation_id: row.correlation_id,
              agent_id: row.agent_id,
              tipo_asesoria: row.tipo_asesoria,
              mensaje_sugerencia: row.mensaje_sugerencia,
              datos_contexto: row.datos_contexto || {},
              decision_tecnico: row.decision_tecnico,
              ahorro_estimado_usd: Number(row.ahorro_estimado_usd || 0),
              documento_generado_tipo: row.documento_generado_tipo,
              documento_url_o_datos: row.documento_url_o_datos,
              created_at: row.created_at,
              decided_at: row.decided_at
            });
          }
        }
      }
    } catch (e) {
      // Ignorar fallback
    }

    // Si aún está vacía, generar sugerencias iniciales
    if (list.length === 0) {
      return await this.generarRecomendacionesContextuales({ proyectoId });
    }

    return list;
  }

  private static async persistirEnBaseDatos(log: SaraAdvisoryLog) {
    try {
      const supabase = await createClient();
      await supabase.from('sara_ai_advisory_logs').upsert({
        id: log.id,
        proyecto_id: log.proyecto_id,
        correlation_id: log.correlation_id,
        agent_id: log.agent_id,
        tipo_asesoria: log.tipo_asesoria,
        mensaje_sugerencia: log.mensaje_sugerencia,
        datos_contexto: log.datos_contexto,
        decision_tecnico: log.decision_tecnico,
        ahorro_estimado_usd: log.ahorro_estimado_usd,
        documento_generado_tipo: log.documento_generado_tipo,
        documento_url_o_datos: log.documento_url_o_datos,
        created_at: log.created_at
      });
    } catch (e) {
      console.warn('[SaraAdvisoryService] Guardado solo en memoria local:', e);
    }
  }
}
