/**
 * CATÁLOGO Y GOBERNANZA DE PLANES SAAS B2B PARA CONSTRUCTORAS (SARA-SAAS-TIERS)
 * Control de suscripciones de gobernanza tributaria SRI, Three-Way Match,
 * nómina sectorial IESS y Fideicomiso Escrow.
 */

export interface SaaSSubscriptionPlan {
  id: string;
  nombre: string;
  slug: 'starter' | 'pro' | 'enterprise';
  tagline: string;
  precioMensualUSD: number;
  precioAnualUSD: number; // Ahorro de 2 meses
  proyectosActivosMax: number;
  comprobantesSriMensuales: number;
  limiteUsuarios: number;
  destacado: boolean;
  badge: string;
  beneficios: string[];
  permiteFactoring: boolean;
  permiteDossierUAFE: boolean;
  soportePrioritario: boolean;
}

export const PLANES_SAAS_FINTECH: SaaSSubscriptionPlan[] = [
  {
    id: 'plan-starter',
    nombre: 'Plan Starter Obra',
    slug: 'starter',
    tagline: 'Ideal para contratistas individuales, fiscalizadores y pequeñas constructoras',
    precioMensualUSD: 49.00,
    precioAnualUSD: 490.00,
    proyectosActivosMax: 2,
    comprobantesSriMensuales: 100,
    limiteUsuarios: 1,
    destacado: false,
    badge: 'CONTRATISTAS',
    beneficios: [
      'Hasta 2 proyectos u obras civiles en paralelo',
      'Ingesta de 100 facturas electrónicas SRI al mes',
      'Three-Way Match automatizado (tolerancia 1%)',
      'Conciliación bancaria básica y libro de caja',
      'Soporte técnico por correo electrónico'
    ],
    permiteFactoring: true,
    permiteDossierUAFE: false,
    soportePrioritario: false
  },
  {
    id: 'plan-pro',
    nombre: 'Plan Pro Constructora',
    slug: 'pro',
    tagline: 'Para constructoras medianas que requieren control de tesorería y nómina de obra',
    precioMensualUSD: 149.00,
    precioAnualUSD: 1490.00,
    proyectosActivosMax: 10,
    comprobantesSriMensuales: 1000,
    limiteUsuarios: 5,
    destacado: true,
    badge: 'RECOMENDADO',
    beneficios: [
      'Hasta 10 proyectos con sub-fideicomisos Escrow',
      'Ingesta de 1,000 comprobantes electrónicos SRI/mes',
      'Liquidación de nómina de cuadrillas con tareo IESS',
      'Simulador de estrés de liquidez (CFCR a 30 y 60 días)',
      'Acceso a cupo de Factoring Digital y Pronto Pago 24h',
      '5 usuarios (Ingeniero Residente, Contador, Bodega)'
    ],
    permiteFactoring: true,
    permiteDossierUAFE: true,
    soportePrioritario: true
  },
  {
    id: 'plan-enterprise',
    nombre: 'Plan Enterprise Holding',
    slug: 'enterprise',
    tagline: 'Para grandes promotores inmobiliarios, consorcios viales y grupos corporativos',
    precioMensualUSD: 399.00,
    precioAnualUSD: 3990.00,
    proyectosActivosMax: 999, // Ilimitado
    comprobantesSriMensuales: 999999,
    limiteUsuarios: 999,
    destacado: false,
    badge: 'HOLDING & CONSORCIOS',
    beneficios: [
      'Proyectos y sub-fideicomisos ilimitados a nivel nacional',
      'Comprobantes XML/XAdES-BES ilimitados con anti-XXE',
      'Generador oficial de Dossier Bancario y reportes UAFE (RESU)',
      'Estrés de liquidez cuantitativo a 90 días con simulación Monte Carlo',
      'Integración ERP completa vía API REST y Webhooks',
      'Oficial de cumplimiento fiduciario y gestor bancario dedicado'
    ],
    permiteFactoring: true,
    permiteDossierUAFE: true,
    soportePrioritario: true
  }
];

export class SaraSaaSPlansService {
  static getPlanes(): SaaSSubscriptionPlan[] {
    return PLANES_SAAS_FINTECH;
  }

  static getPlanBySlug(slug: string): SaaSSubscriptionPlan | undefined {
    return PLANES_SAAS_FINTECH.find(p => p.slug === slug);
  }
}
