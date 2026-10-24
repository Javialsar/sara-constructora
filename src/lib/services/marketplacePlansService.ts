/**
 * SARA MARKETPLACE - SERVICIO DE GESTIÓN DE PLANES Y COMISIONES
 * Administración centralizada de planes para proveedores, fabricantes y ferreterías:
 * - VIP (15% Comisión)
 * - EMPRESARIAL (10% Comisión)
 * - BÁSICO (8% Comisión)
 * Soporta creación dinámica, edición de comisiones y características desde el panel /admin.
 */

export interface MarketplacePlan {
  id: string; // 'VIP' | 'EMPRESARIAL' | 'BASICO' | string
  codigo: string;
  nombre: string;
  porcentajeComision: number; // Porcentaje de comisión de Grupo SARA (15%, 10%, 8%, etc.)
  costoMensualUSD: number;
  badge: string;
  colorBadge: string;
  descripcion: string;
  caracteristicas: string[];
  maxProductos: number;
  soportaApi: boolean;
  soportaExcel: boolean;
  prioridadExhibicion: number; // 1 = Máxima prioridad (VIP)
  activo: boolean;
  orden: number;
  esSistema?: boolean;
}

const STORAGE_KEY_PLANES = 'sara_marketplace_plans_v2';

export const PLANES_PREDETERMINADOS: MarketplacePlan[] = [
  {
    id: 'VIP',
    codigo: 'VIP',
    nombre: 'VIP',
    porcentajeComision: 15,
    costoMensualUSD: 199,
    badge: 'VIP (15%)',
    colorBadge: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black',
    descripcion: 'Máxima exposición corporativa, prioridad #1 en cuadrícula y requisiciones automáticas de obras civiles de Grupo SARA.',
    caracteristicas: [
      'Comisión del 15% sobre ventas netas concretadas',
      'Máxima prioridad en la vitrina principal del Marketplace B2B',
      'API REST dedicada y Webhooks para sincronización en tiempo real con SAP/Odoo/Contifico',
      'Carga masiva ilimitada por archivos Excel (.xlsx)',
      'Insignia Dorada de Proveedor VIP Verificado SRI',
      'Prioridad exclusiva en cotizaciones automáticas de SARA-APU y SARA Fiscaliza',
      'Dispersión y liquidación de pagos inmediata vía Fideicomiso Escrow SARA-PAGOS'
    ],
    maxProductos: 10000,
    soportaApi: true,
    soportaExcel: true,
    prioridadExhibicion: 1,
    activo: true,
    orden: 1,
    esSistema: true
  },
  {
    id: 'EMPRESARIAL',
    codigo: 'EMPRESARIAL',
    nombre: 'EMPRESARIAL',
    porcentajeComision: 10,
    costoMensualUSD: 79,
    badge: 'Empresarial (10%)',
    colorBadge: 'bg-blue-600 text-white font-bold',
    descripcion: 'Diseñado para empresas distribuidoras mayoristas y fabricantes de mediana y gran escala con distribución regional.',
    caracteristicas: [
      'Comisión competitiva del 10% sobre ventas concretadas',
      'Posicionamiento preferencial en el buscador y cuadrícula de materiales',
      'Carga masiva periódica mediante plantillas Excel (.xlsx)',
      'Insignia azul de Empresa Distribuidora Certificada SRI',
      'Historial completo de ventas y métricas de demanda por producto',
      'Conciliación bancaria SPI y liquidación garantizada a 7 días',
      'Hasta 2,500 productos y fichas técnicas publicadas'
    ],
    maxProductos: 2500,
    soportaApi: false,
    soportaExcel: true,
    prioridadExhibicion: 2,
    activo: true,
    orden: 2,
    esSistema: true
  },
  {
    id: 'BASICO',
    codigo: 'BASICO',
    nombre: 'BÁSICO',
    porcentajeComision: 8,
    costoMensualUSD: 0,
    badge: 'Básico (8%)',
    colorBadge: 'bg-emerald-600 text-white font-medium',
    descripcion: 'Plan inicial sin costo fijo ($0/mes) para ferreterías locales y proveedores que inician en el ecosistema digital de SARA.',
    caracteristicas: [
      'Sin costo de membresía fija ($0 USD mensual)',
      'Comisión del 8% aplicable únicamente sobre ventas efectivamente realizadas',
      'Carga manual e importación estándar de catálogo hasta 250 insumos',
      'Cobro mediante Cuentas Bancarias SPI y Códigos QR (DeUna!, Payphone, Peigo)',
      'Acceso a solicitudes de cotización de constructoras y maestros de obra locales',
      'Liquidación a 15 días tras confirmación técnica de recepción en obra'
    ],
    maxProductos: 250,
    soportaApi: false,
    soportaExcel: true,
    prioridadExhibicion: 3,
    activo: true,
    orden: 3,
    esSistema: true
  }
];

export class MarketplacePlansService {
  /**
   * Obtener todos los planes disponibles (persistidos en localStorage o predeterminados)
   */
  static getPlanes(): MarketplacePlan[] {
    if (typeof window === 'undefined') {
      return PLANES_PREDETERMINADOS;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY_PLANES);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_PLANES, JSON.stringify(PLANES_PREDETERMINADOS));
        return PLANES_PREDETERMINADOS;
      }
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => a.orden - b.orden);
      }
      return PLANES_PREDETERMINADOS;
    } catch (err) {
      console.warn('Error al leer planes de marketplace de localStorage:', err);
      return PLANES_PREDETERMINADOS;
    }
  }

  /**
   * Obtener un plan específico por ID o Código
   */
  static getPlanById(id: string): MarketplacePlan | undefined {
    const planes = this.getPlanes();
    // Mapeo retrocompatible con keys antiguas
    const normalId = id.toUpperCase();
    if (normalId === 'VIP_FABRICA') return planes.find(p => p.id === 'VIP') || planes[0];
    if (normalId === 'ESTANDAR_PRO') return planes.find(p => p.id === 'EMPRESARIAL') || planes[1];
    if (normalId === 'BASICO_FERRETERIA') return planes.find(p => p.id === 'BASICO') || planes[2];

    return planes.find(p => p.id.toUpperCase() === normalId || p.codigo.toUpperCase() === normalId);
  }

  /**
   * Guardar o actualizar un plan existente
   */
  static guardarPlan(plan: MarketplacePlan): MarketplacePlan {
    const planes = this.getPlanes();
    const index = planes.findIndex(p => p.id === plan.id);

    if (index >= 0) {
      planes[index] = { ...plan };
    } else {
      planes.push({ ...plan });
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_PLANES, JSON.stringify(planes));
    }
    return plan;
  }

  /**
   * Crear un nuevo plan con ID autogenerado
   */
  static crearPlan(planData: Omit<MarketplacePlan, 'id'>): MarketplacePlan {
    const planes = this.getPlanes();
    const cleanId = planData.codigo.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_') || `PLAN_${Date.now()}`;
    
    const nuevoPlan: MarketplacePlan = {
      ...planData,
      id: cleanId,
      orden: planData.orden || planes.length + 1,
      activo: planData.activo ?? true
    };

    planes.push(nuevoPlan);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_PLANES, JSON.stringify(planes));
    }
    return nuevoPlan;
  }

  /**
   * Eliminar un plan por ID
   */
  static eliminarPlan(id: string): boolean {
    const planes = this.getPlanes();
    const filtrados = planes.filter(p => p.id !== id);
    if (filtrados.length === planes.length) return false;

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_PLANES, JSON.stringify(filtrados));
    }
    return true;
  }

  /**
   * Restablecer los planes predeterminados (VIP 15%, EMPRESARIAL 10%, BÁSICO 8%)
   */
  static restablecerPredeterminados(): MarketplacePlan[] {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_PLANES, JSON.stringify(PLANES_PREDETERMINADOS));
    }
    return PLANES_PREDETERMINADOS;
  }
}
