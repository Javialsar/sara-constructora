// ============================================================================
// SERVICIO CENTRALIZADO DE PLANES Y COTIZACIÓN POR MÓDULO — GRUPO SARA
// Sincroniza dinámicamente los planes de cada módulo con sus respectivos
// servicios de administración en lugar de utilizar valores fijos estáticos.
// ============================================================================

import { ConstructoraAdminService, PlanConstructora } from './constructoraAdminService';
import { MarketplacePlansService, MarketplacePlan } from './marketplacePlansService';
import { TalentoPlanesService, TalentoPlan } from './talentoPlanesService';
import { SaraSaaSPlansService, SaaSSubscriptionPlan } from './saraSaaSPlansService';

export type ModuloId = 
  | 'grupo-sara'
  | 'constructora' 
  | 'apu' 
  | 'marketplace' 
  | 'compras' 
  | 'inmobiliaria' 
  | 'alojamiento' 
  | 'stays' 
  | 'fletes' 
  | 'talento' 
  | 'pagos' 
  | 'financiero'
  | 'facturacion'
  | 'facturacion-electronica';

export interface PlanGenericoModulo {
  id: string;
  codigo?: string;
  nombre: string;
  descripcion: string;
  precioMensual?: number;
  precioAnual?: number;
  precioFijo?: number;
  porcentajeExito?: number;
  esGratisInicial?: boolean;
  moneda: string;
  badge?: string;
  esRecomendado?: boolean;
  caracteristicas: string[];
  accionTipo: 'checkout' | 'gratis_redireccion' | 'cotizador_externo';
  urlDestino?: string;
}

export interface DetalleModuloCotizacion {
  id: string;
  titulo: string;
  tagline: string;
  descripcion: string;
  tipoModelo: 'saas' | 'success_fee' | 'transaccional' | 'por_volumen' | 'reserva';
  explicacionModelo: string;
  planes: PlanGenericoModulo[];
  urlModulo: string;
  etiquetaBotonSecundario?: string;
}

// Catálogo base de APU
const PLANES_APU_DEFAULT: PlanGenericoModulo[] = [
  {
    id: 'apu-basico',
    nombre: 'APU Constructor Básico',
    descripcion: 'Diseñado para residentes de obra y cálculo rápido de presupuestos.',
    precioMensual: 9.99,
    precioAnual: 99.00,
    moneda: 'USD',
    badge: 'Básico',
    esRecomendado: false,
    caracteristicas: [
      'Acceso a 5,000+ rubros actualizados 2026',
      'Desagregación de equipos, materiales y mano de obra',
      'Exportación a Excel (.xlsx) y PDF institucional',
      'Hasta 5 presupuestos activos simultáneos'
    ],
    accionTipo: 'checkout'
  },
  {
    id: 'apu-pro',
    nombre: 'APU Profesional SERCOP',
    descripcion: 'Generación automática de ofertas SERCOP, VAE y fórmulas polinómicas IPCO.',
    precioMensual: 19.99,
    precioAnual: 199.00,
    moneda: 'USD',
    badge: 'Más Popular',
    esRecomendado: true,
    caracteristicas: [
      'Presupuestos ilimitados para licitaciones públicas',
      'Cálculo de Fórmula Polinómica (INEC IPCO con suma 1.000)',
      'Desagregación Tecnológica y Certificación VAE SERCOP',
      'Costos indirectos AIU personalizables por provincia',
      'Soporte prioritario por ingenieros de costos'
    ],
    accionTipo: 'checkout'
  },
  {
    id: 'apu-empresa',
    nombre: 'APU Empresa Contratista & VAE',
    descripcion: 'Para consorcios y constructoras con múltiples licitaciones de gran escala.',
    precioMensual: 49.99,
    precioAnual: 490.00,
    moneda: 'USD',
    badge: 'Consorcios',
    esRecomendado: false,
    caracteristicas: [
      'Todo lo del Plan Profesional SERCOP',
      'Usuarios colaborativos concurrentes ilimitados',
      'Base de rendimientos históricos de maquinaria Caterpillar',
      'Conexión API con ERPs y módulos de compras',
      'Capacitación técnica en pliegos SERCOP'
    ],
    accionTipo: 'checkout'
  }
];

export class SaraModulePlansService {
  /**
   * Obtiene la estructura completa de cotización y planes reales de un módulo
   */
  static getDetalleModulo(moduleId: string): DetalleModuloCotizacion {
    const cleanId = moduleId.toLowerCase().replace('sara-', '').trim();

    switch (cleanId) {
      // ----------------------------------------------------------------------
      // 1. TALENTO HUMANO (Modelo Success-Fee con $0 Costo Inicial)
      // ----------------------------------------------------------------------
      case 'talento': {
        const planesTalento = TalentoPlanesService.getPlanes();
        return {
          id: 'talento',
          titulo: 'SARA-TALENTO',
          tagline: 'Bolsa de Empleo Técnica & Contratación Inmediata',
          tipoModelo: 'success_fee',
          descripcion: 'El aspirante no cancela ningún valor de entrada ($0 USD inicial). Selecciona un plan según el nivel de prioridad deseado en el radar de reclutamiento de constructoras, y cancela únicamente una comisión sobre el primer mes al ser formalmente contratado.',
          explicacionModelo: '¡Cero riesgo para el profesional! No pagas nada hoy. Solo pagas si te conseguimos empleo.',
          planes: planesTalento.map((p) => ({
            id: p.id,
            codigo: p.id.toUpperCase(),
            nombre: p.nombre,
            descripcion: p.tagline,
            precioMensual: 0,
            precioFijo: 0,
            porcentajeExito: p.porcentajePrimerMes,
            esGratisInicial: true,
            moneda: 'USD',
            badge: `${p.porcentajePrimerMes}% Éxito`,
            esRecomendado: p.destacado || p.id === 'vip',
            caracteristicas: p.beneficios,
            accionTipo: 'gratis_redireccion',
            urlDestino: '/modulos/talento'
          })),
          urlModulo: '/modulos/talento',
          etiquetaBotonSecundario: 'Ver Convocatorias de Empleo'
        };
      }

      // ----------------------------------------------------------------------
      // 2. CONSTRUCTORA (SaaS Obras Civiles + Cotización de Obra NEC-15)
      // ----------------------------------------------------------------------
      case 'constructora': {
        const planesConst = ConstructoraAdminService.getPlanes();
        return {
          id: 'constructora',
          titulo: 'SARA-CONSTRUCTORA',
          tagline: 'Dirección Técnica, BIM & Fiscalización de Obra Civil',
          tipoModelo: 'saas',
          descripcion: 'Planes de suscripción para ingenieros y constructoras con gestión de Libro de Obra digital, control de planillas y fiscalización. También disponemos de cotización técnica directa por m² bajo norma NEC-15.',
          explicacionModelo: 'Elige un plan mensual o anual con 2 meses gratis para digitalizar tus proyectos civiles.',
          planes: planesConst.map((p) => ({
            id: p.id,
            codigo: p.codigo,
            nombre: p.nombre,
            descripcion: p.descripcion,
            precioMensual: p.precioMensual,
            precioAnual: p.precioAnual,
            moneda: 'USD',
            badge: p.codigo,
            esRecomendado: p.esRecomendado,
            caracteristicas: p.modulosIncluidos,
            accionTipo: 'checkout'
          })),
          urlModulo: '/constructora',
          etiquetaBotonSecundario: 'Cotizar Proyecto de Obra por m²'
        };
      }

      // ----------------------------------------------------------------------
      // 3. APU & COSTOS (SaaS de Presupuestos & Licitación SERCOP)
      // ----------------------------------------------------------------------
      case 'apu': {
        return {
          id: 'apu',
          titulo: 'SARA-APU',
          tagline: 'Presupuestos, Análisis de Precios Unitarios & SERCOP',
          tipoModelo: 'saas',
          descripcion: 'Software en la nube para análisis de precios unitarios con matriz de 5,000+ rubros oficiales ecuatorianos, Fórmula Polinómica INEC IPCO y Valor Agregado Ecuatoriano (VAE).',
          explicacionModelo: 'Suscripción mensual o anual para contratistas, fiscalizadores y licitadores públicos.',
          planes: PLANES_APU_DEFAULT,
          urlModulo: '/apu',
          etiquetaBotonSecundario: 'Ir al Generador de Rubros'
        };
      }

      // ----------------------------------------------------------------------
      // 4. MARKETPLACE / COMPRAS (Membresías Proveedor & Compras Mayoristas)
      // ----------------------------------------------------------------------
      case 'marketplace':
      case 'compras': {
        const planesMarket = MarketplacePlansService.getPlanes();
        return {
          id: 'marketplace',
          titulo: 'SARA-MARKETPLACE',
          tagline: 'Abastecimiento Mayorista & Red de Proveedores de Fábrica',
          tipoModelo: 'por_volumen',
          descripcion: 'Membresías para distribuidores y fabricantes con comisiones diferenciadas de venta y canal directo para compras mayoristas de acero, cemento y agregados a pie de obra.',
          explicacionModelo: 'Si eres proveedor, suscríbete para publicar tu catálogo. Si eres constructor, cotiza insumos por volumen.',
          planes: planesMarket.map((p) => ({
            id: p.id,
            codigo: p.codigo || p.id,
            nombre: `Membresía ${p.nombre}`,
            descripcion: p.descripcion,
            precioMensual: p.costoMensualUSD,
            precioAnual: Math.round(p.costoMensualUSD * 10), // 2 meses gratis en facturación anual
            moneda: 'USD',
            badge: `${p.porcentajeComision}% Comisión`,
            esRecomendado: p.id === 'EMPRESARIAL' || p.id === 'VIP',
            caracteristicas: p.caracteristicas,
            accionTipo: 'checkout'
          })),
          urlModulo: '/modulos/compras',
          etiquetaBotonSecundario: 'Cotizar Insumos por Volumen'
        };
      }

      // ----------------------------------------------------------------------
      // 5. SARA-PAGOS & FINANCIERO (SaaS FinTech, Factoring 24h & Dossier)
      // ----------------------------------------------------------------------
      case 'pagos':
      case 'financiero': {
        const planesFintech = SaraSaaSPlansService.getPlanes();
        return {
          id: 'pagos',
          titulo: 'SARA-PAGOS',
          tagline: 'Custodia Fiduciaria Escrow, SRI & FinTech de Construcción',
          tipoModelo: 'saas',
          descripcion: 'Suscripciones FinTech para blindaje de tesorería de proyectos, validación de comprobantes electrónicos SRI con Módulo 11, conciliación Three-Way Match y monitoreo antilavado UAFE.',
          explicacionModelo: 'Planes B2B con 2 meses gratis en facturación anual. Servicios complementarios de Factoring en 24h y Dossier Bancario.',
          planes: planesFintech.map((p) => ({
            id: p.id,
            codigo: p.slug.toUpperCase(),
            nombre: p.nombre,
            descripcion: p.tagline,
            precioMensual: p.precioMensualUSD,
            precioAnual: p.precioAnualUSD,
            moneda: 'USD',
            badge: p.badge || (p.destacado ? 'Recomendado' : undefined),
            esRecomendado: p.destacado,
            caracteristicas: p.beneficios,
            accionTipo: 'checkout'
          })),
          urlModulo: '/modulos/financiero',
          etiquetaBotonSecundario: 'Simular Factoring & Pronto Pago en 24h'
        };
      }

      // ----------------------------------------------------------------------
      // 6. SARA-FLETES (Logística Pesada & Renta Vehicular Abierta)
      // ----------------------------------------------------------------------
      case 'fletes': {
        return {
          id: 'fletes',
          titulo: 'SARA-FLETES',
          tagline: 'Logística de Carga Pesada MTOP & Renta Vehicular Abierta',
          tipoModelo: 'transaccional',
          descripcion: 'Servicio abierto para todo público: fletes locales, mudanzas, transporte pesado en volquetas y plataformas, y alquiler de camionetas o camiones por horas/días con o sin chofer.',
          explicacionModelo: 'Tarifación en tiempo real por peso, distancia vial y peajes MTOP con optimización de retorno (Backhaul).',
          planes: [
            {
              id: 'flete-urbano',
              nombre: 'Flete Urbano & Mudanza Local',
              descripcion: 'Para transporte de materiales, muebles y encomiendas en el perímetro urbano.',
              precioFijo: 3.00,
              moneda: 'USD',
              badge: 'Tarifa Base',
              esRecomendado: false,
              caracteristicas: [
                'Tarifa base de arranque desde $3.00 USD',
                'Tarifa por km adicional: $0.85 USD',
                'Vehículos ligeros: camionetas 1 Ton y furgonetas',
                'Seguimiento GPS satelital en tiempo real'
              ],
              accionTipo: 'cotizador_externo',
              urlDestino: '/modulos/fletes'
            },
            {
              id: 'flete-renta-tiempo',
              nombre: 'Renta Temporal por Horas / Días',
              descripcion: 'Alquiler de camionetas 4x4 o camiones con o sin chofer calificado (tipo Uber / Turo).',
              precioFijo: 15.00,
              moneda: 'USD',
              badge: 'Por Hora',
              esRecomendado: true,
              caracteristicas: [
                'Tarifa desde $15.00 USD / hora con chofer profesional',
                'Tarifa diaria desde $75.00 USD / día',
                'Seguro todo riesgo de carga y responsabilidad civil',
                'Disponible 24/7 con liquidación inmediata'
              ],
              accionTipo: 'cotizador_externo',
              urlDestino: '/modulos/fletes'
            },
            {
              id: 'flete-pesado-mtop',
              nombre: 'Carga Pesada & Volquetas MTOP',
              descripcion: 'Para desalojo de excavación, áridos de cantera y transporte interprovincial.',
              precioFijo: 120.00,
              moneda: 'USD',
              badge: 'Volquetas 14m³',
              esRecomendado: false,
              caracteristicas: [
                'Volquetas 14m³ (27 Ton) y plataformas 30 Ton (3S2)',
                'Cumplimiento estricto de pesos por eje MTOP',
                'Cálculo automático de peajes interprovinciales',
                'Descuento del 25% por flete de retorno (Backhaul)'
              ],
              accionTipo: 'cotizador_externo',
              urlDestino: '/modulos/fletes'
            }
          ],
          urlModulo: '/modulos/fletes',
          etiquetaBotonSecundario: 'Abrir Calculadora de Fletes en Vivo'
        };
      }

      // ----------------------------------------------------------------------
      // 7. SARA-ALOJAMIENTO / STAYS (Corporate Housing & Suites Boutique)
      // ----------------------------------------------------------------------
      case 'alojamiento':
      case 'stays': {
        return {
          id: 'alojamiento',
          titulo: 'SARA-ALOJAMIENTO',
          tagline: 'Campamentos Técnicos & Suites Corporativas Tipo Airbnb',
          tipoModelo: 'reserva',
          descripcion: 'Red de suites ejecutivas y campamentos para personal técnico de obras en Cuenca, Quito, Galápagos y Baños con cerradura inteligente y atención 24/7.',
          explicacionModelo: 'Reserva por noche con check-in autónomo vía PIN digital y tarifas corporativas para empresas contratistas.',
          planes: [
            {
              id: 'suite-ejecutiva',
              nombre: 'Suite Ejecutiva Cuenca Colonial',
              descripcion: 'Alojamiento para ingenieros residentes, supervisores y consultores foráneos.',
              precioFijo: 45.00,
              moneda: 'USD',
              badge: 'Por Noche',
              esRecomendado: true,
              caracteristicas: [
                'Cerradura inteligente con PIN autónomo 24/7',
                'Fibra óptica de alta velocidad y escritorio de trabajo',
                'Facturación electrónica con IVA diferenciado MINTUR',
                'Ubicación estratégica cerca de obras y servicios'
              ],
              accionTipo: 'cotizador_externo',
              urlDestino: '/stays'
            },
            {
              id: 'villa-campestre',
              nombre: 'Villa Campestre Baños de Agua Santa',
              descripcion: 'Descanso corporativo y retiros técnicos con capacidad para hasta 8 personas.',
              precioFijo: 85.00,
              moneda: 'USD',
              badge: 'Por Noche',
              esRecomendado: false,
              caracteristicas: [
                'Villas con acabados de primera y áreas recreativas',
                'Parqueadero privado para vehículos de obra',
                'Check-in digital sin contacto',
                'Tarifas especiales para estancias prolongadas (> 7 días)'
              ],
              accionTipo: 'cotizador_externo',
              urlDestino: '/stays'
            },
            {
              id: 'campamento-tecnico',
              nombre: 'Campamento Corporativo para Cuadrillas',
              descripcion: 'Módulos habitacionales completos para cuadrillas de construcción en proyectos viales o remotos.',
              precioFijo: 15.00,
              moneda: 'USD',
              badge: 'Por Persona/Noche',
              esRecomendado: false,
              caracteristicas: [
                'Capacidad de 10 a 50 operarios con servicios básicos',
                'Cumplimiento de normas de habitabilidad laboral IESS',
                'Alimentación y logística integrada bajo demanda',
                'Liquidación mensual por volumen de trabajadores'
              ],
              accionTipo: 'cotizador_externo',
              urlDestino: '/stays'
            }
          ],
          urlModulo: '/stays',
          etiquetaBotonSecundario: 'Ver Catálogo Completo de Suites'
        };
      }

      // ----------------------------------------------------------------------
      // 8. SARA-INMOBILIARIA (Catálogo de Bienes Raíces & Tasación IVS)
      // ----------------------------------------------------------------------
      case 'inmobiliaria': {
        return {
          id: 'inmobiliaria',
          titulo: 'SARA-INMOBILIARIA',
          tagline: 'Tasación IVS 2025, Corretaje & Precalificación BIESS',
          tipoModelo: 'reserva',
          descripcion: 'Catálogo de casas residenciales, departamentos de lujo y terrenos campestres de alta plusvalía, con custodia de reserva en fideicomiso y avalúos certificados.',
          explicacionModelo: 'Reserva formal de inmuebles en custodia Escrow y asesoría hipotecaria integral.',
          planes: [
            {
              id: 'reserva-inmueble',
              nombre: 'Reserva & Bloqueo Comercial de Inmueble',
              descripcion: 'Garantiza la separación formal del lote o propiedad por 15 días mientras se tramita el crédito.',
              precioFijo: 100.00,
              moneda: 'USD',
              badge: 'Fondos en Custodia',
              esRecomendado: true,
              caracteristicas: [
                'Monto protegido en custodia Fiduciaria Escrow SARA',
                'Reembolsable si el crédito bancario no es aprobado',
                'Bloqueo transaccional del inmueble en el catálogo',
                'Revisión jurídica gratuita de escrituras e historia de dominio'
              ],
              accionTipo: 'checkout'
            },
            {
              id: 'tasacion-ivs',
              nombre: 'Informe de Tasación Inmobiliaria Oficial (IVS 2025)',
              descripcion: 'Avalúo técnico elaborado por peritos calificados para bancos, BIESS o negociaciones comerciales.',
              precioFijo: 150.00,
              moneda: 'USD',
              badge: 'Peritaje Certificado',
              esRecomendado: false,
              caracteristicas: [
                'Inspección in situ con dron y georreferenciación GPS',
                'Modelado econométrico de absorción de mercado',
                'Informe firmado por perito valuador acreditado',
                'Aceptado por banca privada y cooperativas del Ecuador'
              ],
              accionTipo: 'checkout'
            }
          ],
          urlModulo: '/inmobiliaria',
          etiquetaBotonSecundario: 'Explorar Catálogo de Inmuebles'
        };
      }

      // ----------------------------------------------------------------------
      // 9. SARA-FACTURACIÓN & FIRMA ELECTRÓNICA SRI
      // ----------------------------------------------------------------------
      case 'facturacion':
      case 'facturacion-electronica': {
        return {
          id: 'facturacion',
          titulo: 'SARA-FACTURACIÓN & FIRMA',
          tagline: 'Facturación Electrónica SRI & Firma Digital Acreditada ARCOTEL',
          tipoModelo: 'saas',
          descripcion: 'Emisión instantánea de facturas y retenciones electrónicas autorizadas por el SRI (tarifas 5% y 15%). Pases diarios, bolsas sin caducidad, suscripciones mensuales y obtención express de firma digital .p12.',
          explicacionModelo: 'Adquiere pases diarios, bolsas prepagadas de comprobantes o planes con firma electrónica incluida.',
          planes: [
            {
              id: 'plan-pase-diario',
              codigo: 'PASE_DIARIO_24H',
              nombre: 'Pase Diario 24h',
              descripcion: 'Acceso total para emitir facturas y retenciones ilimitadas durante 24 horas continuas.',
              precioFijo: 1.50,
              moneda: 'USD',
              badge: 'On-Demand',
              esRecomendado: false,
              caracteristicas: [
                'Facturas y retenciones ilimitadas por 24 horas',
                'Cálculo automático de tarifas IVA 5% y 15%',
                'Autorización directa en el Web Service del SRI',
                'Descarga inmediata de RIDE (PDF) y XML firmado',
                'Envío automático por correo electrónico al cliente'
              ],
              accionTipo: 'checkout'
            },
            {
              id: 'plan-bolsa-15',
              codigo: 'BOLSA_15_DOCS',
              nombre: 'Bolsa Micro 15 Comprobantes',
              descripcion: 'Saldo de 15 comprobantes electrónicos prepagados que NUNCA caducan. Ideal para honorarios esporádicos.',
              precioFijo: 3.99,
              moneda: 'USD',
              badge: 'Sin Caducidad',
              esRecomendado: false,
              caracteristicas: [
                '15 comprobantes electrónicos (facturas o retenciones)',
                'Saldo sin caducidad (se consumen solo al emitir)',
                'Portal Web + PWA móvil para emitir en campo u obra',
                'Buzón de recepción y consulta de gastos deducibles',
                'Soporte técnico SRI incluido'
              ],
              accionTipo: 'checkout'
            },
            {
              id: 'plan-mensual-pro',
              codigo: 'MENSUAL_PROFESIONAL',
              nombre: 'Plan Profesional Mensual',
              descripcion: 'Comprobantes ilimitados para ingenieros, arquitectos, contratistas y negocios en crecimiento.',
              precioMensual: 7.99,
              precioAnual: 79.90,
              moneda: 'USD',
              badge: 'Más Popular',
              esRecomendado: true,
              caracteristicas: [
                'Facturas y retenciones electrónicas ILIMITADAS',
                'Proyección automática Formulario 104 SRI',
                'Multisucursal y puntos de emisión ilimitados',
                'Buzón de recepción con deducción automática de gastos',
                'Acceso al API REST para integración con ERP'
              ],
              accionTipo: 'checkout'
            },
            {
              id: 'plan-firma-1ano',
              codigo: 'FIRMA_1_ANIO',
              nombre: 'Firma Electrónica .p12 (1 Año)',
              descripcion: 'Certificado de firma electrónica para personas naturales o jurídicas emitido en 15 minutos.',
              precioFijo: 18.00,
              moneda: 'USD',
              badge: 'Acreditada ARCOTEL',
              esRecomendado: false,
              caracteristicas: [
                'Archivo .p12 con vigencia legal de 1 año',
                'Acreditación oficial por Entidad de Certificación ARCOTEL',
                'Emisión express en 15 minutos con cédula',
                'Compatible con SARA, FirmaEC, SRI y Quipux',
                'Instalación directa en la bóveda cifrada de SARA'
              ],
              accionTipo: 'checkout'
            },
            {
              id: 'plan-anual-combo',
              codigo: 'ANUAL_COMBO_FIRMA',
              nombre: 'Combo Anual Pro + Firma Gratis',
              descripcion: '1 año completo de facturación ilimitada con certificado de firma electrónica .p12 sin costo adicional.',
              precioAnual: 59.99,
              moneda: 'USD',
              badge: 'Mejor Ahorro (-40%)',
              esRecomendado: false,
              caracteristicas: [
                'Facturación ilimitada por 365 días',
                'Firma Electrónica .p12 de 1 año INCLUIDA GRATIS ($18 de ahorro)',
                'Configuración y puesta a punto asistida',
                'Reportes tributarios consolidados para contador',
                'Soporte VIP 24/7 vía WhatsApp prioritario'
              ],
              accionTipo: 'checkout'
            }
          ],
          urlModulo: '/facturacion-electronica',
          etiquetaBotonSecundario: 'Ver Landing SARA-FACTURACIÓN & FIRMA'
        };
      }

      // ----------------------------------------------------------------------
      // CASO POR DEFECTO: HOLDING GRUPO SARA
      // ----------------------------------------------------------------------
      default: {
        return {
          id: 'grupo-sara',
          titulo: 'GRUPO SARA',
          tagline: 'Holding Multisectorial de Ingeniería, Construcción & FinTech',
          tipoModelo: 'saas',
          descripcion: 'Ecosistema corporativo integrado con 8 unidades de negocio especializadas. Selecciona la unidad que deseas cotizar para consultar sus planes oficiales.',
          explicacionModelo: 'Soluciones integrales llave en mano para el sector de la construcción en Ecuador.',
          planes: [
            {
              id: 'holding-consultoria',
              nombre: 'Asesoría Integral de Proyectos',
              descripcion: 'Consultoría multidisciplinaria con ingenieros estructurales, financistas y arquitectos.',
              precioFijo: 99.00,
              moneda: 'USD',
              badge: 'Consultoría Matriz',
              esRecomendado: true,
              caracteristicas: [
                'Revisión preliminar de planos y presupuesto de obra',
                'Evaluación de viabilidad financiera y retorno TIR/VAN',
                'Estructuración del fideicomiso Escrow para la obra',
                'Informe ejecutivo para directorio o inversionistas'
              ],
              accionTipo: 'checkout'
            }
          ],
          urlModulo: '#ecosistema',
          etiquetaBotonSecundario: 'Explorar Todo el Ecosistema'
        };
      }
    }
  }
}
