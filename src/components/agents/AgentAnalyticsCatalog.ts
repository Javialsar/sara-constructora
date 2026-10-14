import { AgentAnalyticsData } from './AgentAnalyticsModal';

export function getAgentAnalytics(agentId: string, context?: {
  proyectoNombre?: string;
  provincia?: string;
  costoObra?: number;
  areaM2?: number;
}): AgentAnalyticsData {
  const prov = context?.provincia || 'Azuay';
  const obra = context?.proyectoNombre || 'Proyecto Referencial';
  const costo = context?.costoObra || 95000;
  const m2 = context?.areaM2 || 200;

  switch (agentId) {
    case 'constructora':
      return {
        agentId: 'SARA-CONSTRUCTORA',
        name: 'SARA-CONSTRUCTORA: Analítica de Ingeniería & Sistemas',
        role: 'Iniciador Técnico & Modelador Estructural',
        description: 'Estructuración paramétrica, análisis sismorresistente NEC y reducción de plazos de ejecución.',
        confidenceScore: 0.98,
        sampleCount: 142,
        latencyMs: 6,
        lastTrained: 'Octubre 2026',
        metrics: [
          {
            label: 'Tasa de Desviación en Cronograma',
            value: '±3.2%',
            trend: '-18% vs estándar',
            trendPositive: true,
            description: 'Reducción sostenida de desfase temporal gracias a la selección del sistema constructivo óptimo.'
          },
          {
            label: 'Sistema Recomendado',
            value: 'Hormigón Armado / Mixto',
            trend: 'Óptimo en Sierra Sur',
            trendPositive: true,
            description: `Modelado para las condiciones geográficas y de sismicidad de ${prov}.`
          },
          {
            label: 'Costo Paramétrico Base',
            value: `$${Math.round(costo / m2)} / m²`,
            trend: 'Normalizado',
            trendPositive: true,
            description: 'Costo por metro cuadrado construido referencial para la tipología seleccionada.'
          },
          {
            label: 'Precisión de Geometría BIM',
            value: '99.4%',
            trend: 'LOD 350',
            trendPositive: true,
            description: 'Nivel de desarrollo de volumetrías con tolerancias menores a 2 cm.'
          }
        ],
        learnedRules: [
          {
            rule: `Heurística de Fraguado y Clima en ${prov}`,
            impact: 'Ajuste de tiempos de desencofrado en losas a 21 días para evitar microfisuras.',
            confidence: 0.96
          },
          {
            rule: 'Sistemas Modulares en Mampostería',
            impact: 'Ahorro del 11% en mano de obra al utilizar bloque de precisión machihembrado.',
            confidence: 0.94
          }
        ],
        recommendations: [
          `Priorizar cimentación con zapatas aisladas y riostras continuas dada la composición típica de suelo en ${prov}.`,
          'Iniciar la fase de excavación en ventana climática favorable para evitar contingencias por lluvias.',
          'Aprobar el modelo 3D previo a la fundición para sincronizar los pasos hidrosanitarios sin perforaciones posteriores.'
        ]
      };

    case 'apu':
      return {
        agentId: 'SARA-APU',
        name: 'SARA-APU: Motor de Cómputo & Rendimientos Provinciales',
        role: 'Análisis de Precios Unitarios & Rendimientos de Obra',
        description: 'Desglose analítico de insumos, cuadrillas y factores regionales de mano de obra.',
        confidenceScore: 0.97,
        sampleCount: 388,
        latencyMs: 5,
        lastTrained: 'Octubre 2026',
        metrics: [
          {
            label: `Multiplicador Regional (${prov})`,
            value: `${prov === 'Azuay' ? '1.05' : prov === 'Guayas' ? '0.92' : '1.02'}x`,
            trend: 'Calibrado',
            trendPositive: true,
            description: 'Factor de ajuste de horas/hombre derivado de obras reales auditadas en la provincia.'
          },
          {
            label: 'Presupuesto Directo Calculado',
            value: `$${Math.round(costo * 0.82).toLocaleString()} USD`,
            trend: 'Materiales + MO + Equipos',
            trendPositive: true,
            description: 'Costo puro de materiales puestos en obra y nómina directa de cuadrillas.'
          },
          {
            label: 'Overhead & AIU Recomendado',
            value: '18.0%',
            trend: 'Estándar SERCOP',
            trendPositive: true,
            description: 'Gastos generales, administración, imprevistos y utilidad razonable.'
          },
          {
            label: 'Margen de Error Presupuestario',
            value: '< 2.4%',
            trend: 'Alta Precisión',
            trendPositive: true,
            description: 'Historial de variaciones entre el presupuesto ofertado y la liquidación final.'
          }
        ],
        learnedRules: [
          {
            rule: `Rendimiento de Cuadrilla de Albañilería en ${prov}`,
            impact: 'Ajuste del rendimiento a 1.25 m2/hora para enlucidos finos interiores.',
            confidence: 0.97
          },
          {
            rule: 'Desperdicio de Acero Estructural',
            impact: 'Reducción del factor de merma del 7% al 4.2% mediante optimización de corte computarizado.',
            confidence: 0.95
          }
        ],
        recommendations: [
          'Agrupar rubros de hormigón en fundiciones continuas para aprovechar tarifas de bomba telescópica.',
          'Fijar precios unitarios de mano de obra por subcontrato a destajo para garantizar el cumplimiento del plazo.',
          'Exportar la matriz de insumos hacia SARA-Marketplace para cotizaciones en bloque mayorista.'
        ]
      };

    case 'marketplace':
      return {
        agentId: 'SARA-MARKETPLACE',
        name: 'SARA-MARKETPLACE: Optimizador de Suministros Mayoristas',
        role: 'Cruce de Inventarios & Predicción de Precios de Materiales',
        description: 'Negociación directa con acerías, cementeras y canteras con precios en vivo.',
        confidenceScore: 0.96,
        sampleCount: 512,
        latencyMs: 3,
        lastTrained: 'Octubre 2026',
        metrics: [
          {
            label: 'Ahorro Obtenido por Volumen',
            value: `$${Math.round(costo * 0.075).toLocaleString()} USD`,
            trend: '7.5% de ahorro neto',
            trendPositive: true,
            description: 'Diferencial obtenido frente a precios de ferretería minorista tradicional.'
          },
          {
            label: 'Alerta de Inflación en Acero',
            value: '+3.4% trimestral',
            trend: 'Alerta Activa',
            trendPositive: false,
            description: 'Proyección de alza en barras corrugadas para el próximo mes por demanda regional.'
          },
          {
            label: 'Proveedores Homologados',
            value: '4 aliados activos',
            trend: 'ADELCA, Holcim, Canteras',
            trendPositive: true,
            description: 'Distribuidores con stock asegurado y entrega directa a pie de obra.'
          },
          {
            label: 'Tiempo de Despacho Insumos',
            value: '24 a 48 hrs',
            trend: 'Garantizado',
            trendPositive: true,
            description: 'SLA de entrega inmediata desde bodegas regionales en el Austro.'
          }
        ],
        learnedRules: [
          {
            rule: 'Compra Anticipada de Acero',
            impact: 'Recomendación de compra en hito 1 para congelar la tarifa y blindar el presupuesto.',
            confidence: 0.98
          },
          {
            rule: 'Puntos de Carga Cercanos',
            impact: 'Selección de cantera a menos de 30 km para reducir costo de flete por metro cúbico.',
            confidence: 0.93
          }
        ],
        recommendations: [
          'Emitir orden de compra para las varillas de acero estructural de forma anticipada.',
          'Solicitar cemento en entregas programadas de 200 sacos semanales para evitar endurecimiento por humedad.',
          'Coordinar con SARA-Fletes los horarios de recepción en obra para evitar paralización de cuadrillas.'
        ]
      };

    case 'fletes':
      return {
        agentId: 'SARA-FLETES',
        name: 'SARA-FLETES: Ingeniero de Logística Pesada & Rutas',
        role: 'Cubicación, Flota Pesada & Alertas Viales en Ecuador',
        description: 'Cálculo de tonelaje, cubicación de volquetas y plataformas con monitoreo vial en vivo.',
        confidenceScore: 0.95,
        sampleCount: 290,
        latencyMs: 4,
        lastTrained: 'Octubre 2026',
        metrics: [
          {
            label: 'Peso Total Estimado de Carga',
            value: `${Math.round(m2 * 0.45)} Toneladas`,
            trend: 'Mulas + Volquetas',
            trendPositive: true,
            description: 'Peso combinado de áridos, cemento, varillas y equipos pesados.'
          },
          {
            label: 'Monitoreo Ruta Molleturo-Cuenca',
            value: 'Alerta Km 49',
            trend: '28% riesgo deslaves',
            trendPositive: false,
            description: 'Algoritmo vial con ruta alterna programada vía Zhud-Cochancay.'
          },
          {
            label: 'Costo Logístico Optimizado',
            value: `$${Math.round(costo * 0.055).toLocaleString()} USD`,
            trend: 'Tarifas Cooperativas',
            trendPositive: true,
            description: 'Convenios con cooperativas de transporte pesado federadas en Ecuador.'
          },
          {
            label: 'Eficiencia de Despachos',
            value: '94.8%',
            trend: 'Cero tiempos muertos',
            trendPositive: true,
            description: 'Puntualidad en arribo de volquetas para recepción de hormigón premezclado.'
          }
        ],
        learnedRules: [
          {
            rule: 'Ventanas Horarias de Tránsito Pesado',
            impact: 'Evitar ingresos urbanos entre 07:00 y 09:00 en Cuenca para no incurrir en multas municipales.',
            confidence: 0.97
          },
          {
            rule: 'Cubicación Máxima por Eje',
            impact: 'Límite de 28 toneladas netas por plataforma para cumplir pesaje del MTOP.',
            confidence: 0.99
          }
        ],
        recommendations: [
          'Programar los viajes de áridos desde cantera en jornadas tempranas (06:00 a 11:00).',
          'Activar seguimiento satelital GPS de los transportistas en la app móvil de fiscalización.',
          'Verificar espacio de maniobra de volqueta de 14m3 en el acceso al predio antes del primer viaje.'
        ]
      };

    case 'talento':
      return {
        agentId: 'SARA-TALENTOHUMANO',
        name: 'SARA-TALENTOHUMANO: Reclutador Automatizado Push-to-Work',
        role: 'Geolocalización de Profesionales & Calificación Histórica',
        description: 'Filtrado autónomo de maestros de obra, cuadrillas y residentes con contacto directo.',
        confidenceScore: 0.97,
        sampleCount: 620,
        latencyMs: 3,
        lastTrained: 'Octubre 2026',
        metrics: [
          {
            label: 'Profesionales en Base de Datos',
            value: '+1,450',
            trend: 'Azuay, Pichincha, Guayas',
            trendPositive: true,
            description: 'Ingenieros, arquitectos, maestros mayores y albañiles colegiados y verificados.'
          },
          {
            label: 'Velocidad de Conformación de Terna',
            value: '< 4 minutos',
            trend: 'Push-to-Work IA',
            trendPositive: true,
            description: 'Despacho automatizado de notificaciones y preselección por afinidad.'
          },
          {
            label: 'Calificación Promedio de Terna',
            value: '⭐ 4.92 / 5.0',
            trend: 'Certificación SECAP',
            trendPositive: true,
            description: 'Personal con auditoría previa de cumplimiento y cero historial de abandono.'
          },
          {
            label: 'Alojamiento Foráneo Requerido',
            value: '1 especialista',
            trend: 'Derivado a SARA Stays',
            trendPositive: true,
            description: 'Coordinación automática de hospedaje para personal técnico no residente.'
          }
        ],
        learnedRules: [
          {
            rule: 'Ponderación VIP en Cuadrillas',
            impact: 'Profesionales VIP certificados incrementan la velocidad de avance de obra en un 19%.',
            confidence: 0.96
          },
          {
            rule: 'Contratación Georreferenciada',
            impact: 'Priorizar trabajadores con radio menor a 15 km reduce el ausentismo laboral a cero.',
            confidence: 0.98
          }
        ],
        recommendations: [
          'Entrevistar a la terna precalificada dentro de las 48 horas siguientes para asegurar su disponibilidad.',
          'Formalizar el contrato de obra a través del módulo SARA-Docs con respaldo legal del Ministerio de Trabajo.',
          'Vincular los pagos de nómina al cumplimiento de hitos validados por el fiscalizador.'
        ]
      };

    case 'inmobiliaria':
      return {
        agentId: 'SARA-INMOBILIARIA',
        name: 'SARA-INMOBILIARIA: Analista de Plusvalía & Tasación',
        role: 'Estudio de Mercado, Tasación Urbana & Proyección de ROI',
        description: 'Tasación automática por m2, velocidad de absorción comercial y rentabilidad de preventa.',
        confidenceScore: 0.96,
        sampleCount: 215,
        latencyMs: 5,
        lastTrained: 'Octubre 2026',
        metrics: [
          {
            label: `Precio m² Construido en ${prov}`,
            value: `$${prov === 'Azuay' ? '1,150' : '1,280'} USD`,
            trend: '+5.8% anual',
            trendPositive: true,
            description: 'Valor promedio de venta al público en zonas urbanas consolidadas.'
          },
          {
            label: 'Retorno de Inversión (ROI) Estimado',
            value: '+26.4%',
            trend: 'Viabilidad EXCELENTE',
            trendPositive: true,
            description: 'Rendimiento financiero neto proyectado entre costo de obra y valor de mercado.'
          },
          {
            label: 'Velocidad de Absorción',
            value: '4.2 meses',
            trend: 'Alta Demanda',
            trendPositive: true,
            description: 'Tiempo promedio estimado para venta o colocación del inmueble en el mercado.'
          },
          {
            label: 'Margen Bruto de Utilidad',
            value: '31.2%',
            trend: 'Rentabilidad Sólida',
            trendPositive: true,
            description: 'Margen comercial neto deducidos los costos directos e indirectos de construcción.'
          }
        ],
        learnedRules: [
          {
            rule: `Plusvalía por Sector en ${prov}`,
            impact: 'Zonas residenciales suburbanas muestran incremento de valor acelerado post-pandemia.',
            confidence: 0.93
          },
          {
            rule: 'Preventa en Plano con Renders',
            impact: 'Iniciar comercialización al 30% de avance físico reduce el costo financiero del promotor.',
            confidence: 0.95
          }
        ],
        recommendations: [
          'Publicar la propiedad en el catálogo de SARA-Inmobiliaria desde la fase de cimentación.',
          'Considerar acabados de línea moderna (porcelanato y cuarzo) para acelerar la colocación en un 25%.',
          'Ofrecer facilidades de crédito hipotecario BIESS y banca privada mediante asesoría del grupo.'
        ]
      };

    case 'alojamiento':
      return {
        agentId: 'SARA-ALOJAMIENTO',
        name: 'SARA-ALOJAMIENTO: Gestor de Stays & Campamentos',
        role: 'Suites Boutique Tipo Airbnb & Hospedaje Técnico Autónomo',
        description: 'Optimización de tarifas dinámicas, check-in 24/7 con cerraduras inteligentes y atención corporativa.',
        confidenceScore: 0.98,
        sampleCount: 430,
        latencyMs: 2,
        lastTrained: 'Octubre 2026',
        metrics: [
          {
            label: 'Tarifa Dinámica Negociada',
            value: '$48.50 / noche',
            trend: 'Descuento Corporativo',
            trendPositive: true,
            description: 'Tarifa preferencial para estadías prolongadas de personal técnico Grupo SARA.'
          },
          {
            label: 'Acceso Autónomo',
            value: 'PIN Digital 24/7',
            trend: 'Cerradura Inteligente',
            trendPositive: true,
            description: 'Apertura inmediata sin intermediarios con código único generado por el sistema.'
          },
          {
            label: 'Tasa de Ocupación Anual',
            value: '82.4%',
            trend: 'Cuenca / Galápagos',
            trendPositive: true,
            description: 'Desempeño de ocupación en las unidades de alta gama de la división Stays.'
          },
          {
            label: 'Ahorro Logístico en Hospedaje',
            value: '$420 USD',
            trend: 'vs Hotelería Convencional',
            trendPositive: true,
            description: 'Optimización de costos de estancia para ingenieros y fiscalizadores foráneos.'
          }
        ],
        learnedRules: [
          {
            rule: 'Ajuste Estacional de Tarifas',
            impact: 'Tarifas dinámicas suben 15% en fiestas de Cuenca (noviembre) y bajan en temporada regular.',
            confidence: 0.97
          },
          {
            rule: 'Check-in Contactless',
            impact: 'Reducción del 100% en demoras de entrega de llaves al personal técnico.',
            confidence: 0.99
          }
        ],
        recommendations: [
          'Mantener activo el bloqueo de suites para el equipo de topografía durante los primeros 14 días.',
          'Facilitar al técnico el código PIN digital vía WhatsApp para su arribo autónomo nocturno.',
          'Utilizar las estancias disponibles como modelo de showroom para clientes interesados en acabados SARA.'
        ]
      };

    case 'pagos':
      return {
        agentId: 'SARA-PAGOS',
        name: 'SARA-PAGOS: Guardián Financiero & Custodia Escrow',
        role: 'Fideicomiso de Fondos, Pasarelas Seguras & Liberación por Hitos',
        description: 'Protección de capital con liberación condicionada a actas de fiscalización aprobadas.',
        confidenceScore: 0.99,
        sampleCount: 780,
        latencyMs: 2,
        lastTrained: 'Octubre 2026',
        metrics: [
          {
            label: 'Monto Total en Custodia Escrow',
            value: `$${Math.round(costo * 0.92).toLocaleString()} USD`,
            trend: 'Fondo Blindado 100%',
            trendPositive: true,
            description: 'Capital retenido en cuenta fiduciaria y protegido contra incumplimientos.'
          },
          {
            label: 'Riesgo de Liquidez de Obra',
            value: 'BAJO (0.02%)',
            trend: 'Cero Riesgo de Parálisis',
            trendPositive: true,
            description: 'Flujo de caja garantizado para insumos, fletes y salarios semana a semana.'
          },
          {
            label: 'Hitos Contractuales de Pago',
            value: '4 fases',
            trend: 'Contra Acta de Avance',
            trendPositive: true,
            description: 'Arranque (30%), Estructura (35%), Mampostería (20%) y Entrega Definitiva (15%).'
          },
          {
            label: 'Cobros QR Integrados',
            value: 'DeUna / Banco Pichincha',
            trend: 'Cero Comisión Interbancaria',
            trendPositive: true,
            description: 'Pasarela habilitada para transferencias empresariales y pagos con tarjeta.'
          }
        ],
        learnedRules: [
          {
            rule: 'Condición de Fiscalización Notariada',
            impact: 'Ningún fondo de avance se libera sin foto georreferenciada y firma electrónica del fiscalizador.',
            confidence: 0.99
          },
          {
            rule: 'Colchón de Contingencia',
            impact: 'Reserva automática del 5% del valor total para absorber variaciones en precios de mercado.',
            confidence: 0.98
          }
        ],
        recommendations: [
          'Depositar el fondo inicial en la cuenta custodia para activar la movilización de maquinaria.',
          'Notificar al fiscalizador la necesidad de cargar el acta digital al alcanzar el 35% de avance físico.',
          'Monitorear los reportes de desembolsos semanales en el Dashboard Financiero para total transparencia.'
        ]
      };

    default:
      return {
        agentId: 'SARA-CORE',
        name: 'SARA-ECOSYSTEM AGENT',
        role: 'Agente Autónomo Especializado',
        description: 'Inteligencia Colectiva de Grupo SARA.',
        confidenceScore: 0.95,
        sampleCount: 100,
        latencyMs: 4,
        lastTrained: 'Octubre 2026',
        metrics: [],
        learnedRules: [],
        recommendations: []
      };
  }
}
