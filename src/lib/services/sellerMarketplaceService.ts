/**
 * SARA MARKETPLACE & SELLER HUB SERVICE
 * Arquitectura de Doble Vía (Two-Sided Marketplace) B2B para Materiales de Construcción
 * Cumplimiento SRI Res. NAC-DGERCGC24-00000013 (IVA 5% vs 15%), RUC Módulo 11,
 * Jerarquía de Posicionamiento por Planes (VIP Fábrica -> Estándar Pro -> Básico Ferretería),
 * Ingesta Multicanal (Manual, Excel XLSX y API REST) y Conciliación Financiera Escrow.
 */

import { ComprasService } from './comprasService';

export type SellerPlanType = 'VIP_FABRICA' | 'ESTANDAR_PRO' | 'BASICO_FERRETERIA';

export interface SellerPlanConfig {
  id: SellerPlanType;
  nombre: string;
  badge: string;
  costoMensualUSD: number;
  comisionSaraPct: number;
  prioridadExhibicion: number; // 1 = Máxima prioridad (VIP)
  beneficios: string[];
  colorBadge: string;
  soportaApiSync: boolean;
  soportaExcelSync: boolean;
  maxProductos: number;
}

export const SELLER_PLANS: Record<SellerPlanType, SellerPlanConfig> = {
  VIP_FABRICA: {
    id: 'VIP_FABRICA',
    nombre: 'Plan Fábrica / Fabricante Industrial',
    badge: 'Proveedor VIP Fábrica',
    costoMensualUSD: 249,
    comisionSaraPct: 1.8,
    prioridadExhibicion: 1,
    beneficios: [
      'Comisión mínima del 1.8% sobre ventas netas',
      'Máxima prioridad en cuadrícula y vitrina del Marketplace B2B',
      'API REST dedicada y Webhooks para sincronización con SAP/Odoo/Contifico',
      'Importación masiva ilimitada por archivos Excel (.xlsx)',
      'Insignia dorada de Fabricante Verificado SRI',
      'Banner corporativo destacado y prioridad en cotizaciones de APU',
      'Dispersión y liquidación de pagos inmediata vía SARA-PAGOS'
    ],
    colorBadge: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black',
    soportaApiSync: true,
    soportaExcelSync: true,
    maxProductos: 10000
  },
  ESTANDAR_PRO: {
    id: 'ESTANDAR_PRO',
    nombre: 'Plan Distribuidor Pro / Mayorista',
    badge: 'Distribuidor Pro Verificado',
    costoMensualUSD: 79,
    comisionSaraPct: 3.5,
    prioridadExhibicion: 2,
    beneficios: [
      'Comisión competitiva del 3.5% sobre ventas netas',
      'Posicionamiento secundario preferencial en la vitrina de compras',
      'Carga masiva periódica mediante plantillas Excel (.xlsx)',
      'Insignia azul de Distribuidor Certificado SRI',
      'Historial completo de ventas desglosado por facturas y artículos',
      'Liquidación a 7 días contra entrega conforme en bodega'
    ],
    colorBadge: 'bg-sky-500 text-white font-bold',
    soportaApiSync: false,
    soportaExcelSync: true,
    maxProductos: 1500
  },
  BASICO_FERRETERIA: {
    id: 'BASICO_FERRETERIA',
    nombre: 'Plan Ferretería Local / Básico',
    badge: 'Ferretería Verificada',
    costoMensualUSD: 0,
    comisionSaraPct: 6.0,
    prioridadExhibicion: 3,
    beneficios: [
      'Sin costo mensual ($0 de suscripción fija)',
      'Comisión del 6.0% aplicable únicamente sobre ventas concretadas',
      'Carga manual e importación básica de catálogo hasta 150 insumos',
      'Acceso a solicitudes de cotización de constructoras locales',
      'Liquidación a 15 días tras confirmación de recepción'
    ],
    colorBadge: 'bg-emerald-600 text-white font-medium',
    soportaApiSync: false,
    soportaExcelSync: true,
    maxProductos: 150
  }
};

export interface SellerProfile {
  id: string;
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  email: string;
  telefono: string;
  ciudad: string;
  direccionMatriz: string;
  plan: SellerPlanType;
  comisionSaraPct: number;
  apiKey: string;
  logoUrl?: string;
  estado: 'ACTIVO' | 'EN_REVISION' | 'SUSPENDIDO';
  verificadoSri: boolean;
  totalVentasUsd: number;
  totalOrdenes: number;
  calificacionPromedio: number;
  fechaRegistro: string;
}

export interface MarketplaceProduct {
  id: string;
  sellerId: string;
  sellerNombre: string;
  sellerPlan: SellerPlanType;
  sellerRuc: string;
  nombre: string;
  descripcion: string;
  categoria: 'ACERO' | 'CEMENTO_HORMIGON' | 'ARIDOS_PETREOS' | 'ACABADOS' | 'TUBERIAS_PLOMERIA' | 'ELECTRICIDAD' | 'MAQUINARIA_EQUIPOS';
  unidad: string;
  precioSinIva: number;
  tarifaIvaPct: 5 | 15; // 5% para materiales de construcción calificados SRI
  stockDisponible: number;
  imagenUrl: string;
  especificacionesTecnicas: {
    normaInen?: string;
    resistencia?: string;
    dimensiones?: string;
    procedencia: 'NACIONAL' | 'IMPORTADO';
    presentacion: string;
  };
  descuentosVolumen?: {
    desdeCantidad: number;
    precioUnitario: number;
  }[];
  tiempoEntregaHoras: number;
  pesoUnitarioKg: number;
  ventasTotales: number;
  calificacion: number;
  esMasVendido?: boolean;
}

export interface VentaHistorialItem {
  id: string;
  facturaNumero: string;
  ordenCompraFolio: string;
  fecha: string;
  sellerId: string;
  clienteNombre: string;
  clienteRuc: string;
  proyectoObra: string;
  subtotalUSD: number;
  ivaUSD: number;
  totalUSD: number;
  comisionSaraPct: number;
  comisionSaraUSD: number;
  netoVendedorUSD: number;
  estadoPago: 'EN_CUSTODIA_ESCROW' | 'LIBERADO_A_VENDEDOR';
  estadoDespacho: 'PENDIENTE' | 'EN_TRANSITO' | 'ENTREGADO_CONFORME';
  items: {
    productoId: string;
    sku: string;
    nombre: string;
    cantidad: number;
    unidad: string;
    precioUnitarioUSD: number;
    totalUSD: number;
  }[];
}

// ============================================================================
// BASE DE DATOS EN MEMORIA / SEMILLAS INICIALES CERTIFICADAS
// ============================================================================

let SELLERS_DB: SellerProfile[] = [
  {
    id: 'seller-adelca-01',
    ruc: '1790008594001',
    razonSocial: 'ACERÍA DEL ECUADOR C.A. ADELCA',
    nombreComercial: 'ADELCA Planta Industrial',
    email: 'ventas.corporativas@adelca.com.ec',
    telefono: '+593 2 382 7200',
    ciudad: 'Quito / Alóag',
    direccionMatriz: 'Panamericana Sur Km 38, Alóag, Pichincha',
    plan: 'VIP_FABRICA',
    comisionSaraPct: 1.8,
    apiKey: 'sk_live_adelca_sec_993817290142_prod',
    logoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=120&h=120&fit=crop',
    estado: 'ACTIVO',
    verificadoSri: true,
    totalVentasUsd: 148920.00,
    totalOrdenes: 42,
    calificacionPromedio: 4.9,
    fechaRegistro: '2026-01-15'
  },
  {
    id: 'seller-holcim-02',
    ruc: '0990004512001',
    razonSocial: 'HOLCIM ECUADOR S.A.',
    nombreComercial: 'Holcim Soluciones de Cemento & Hormigón',
    email: 'pedidos.mayoristas@holcim.com',
    telefono: '+593 4 371 9000',
    ciudad: 'Guayaquil',
    direccionMatriz: 'Av. Barcelona y Puente Portete, Complejo Industrial Holcim',
    plan: 'VIP_FABRICA',
    comisionSaraPct: 1.8,
    apiKey: 'sk_live_holcim_ec_448102948172_prod',
    logoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=120&h=120&fit=crop',
    estado: 'ACTIVO',
    verificadoSri: true,
    totalVentasUsd: 112500.00,
    totalOrdenes: 38,
    calificacionPromedio: 4.8,
    fechaRegistro: '2026-01-20'
  },
  {
    id: 'seller-novacero-03',
    ruc: '1790184279001',
    razonSocial: 'NOVACERO S.A.',
    nombreComercial: 'Novacero Soluciones en Acero',
    email: 'corporativo@novacero.com',
    telefono: '+593 2 399 2200',
    ciudad: 'Quito / Lasso',
    direccionMatriz: 'Km 23 Vía Latacunga - Quito, Lasso',
    plan: 'ESTANDAR_PRO',
    comisionSaraPct: 3.5,
    apiKey: 'sk_live_novacero_881293019283_prod',
    logoUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=120&h=120&fit=crop',
    estado: 'ACTIVO',
    verificadoSri: true,
    totalVentasUsd: 67450.00,
    totalOrdenes: 19,
    calificacionPromedio: 4.7,
    fechaRegistro: '2026-02-10'
  },
  {
    id: 'seller-kubiec-04',
    ruc: '1791244305001',
    razonSocial: 'KUBIEC CONDUIT S.A.',
    nombreComercial: 'Kubiec Cubiertas & Perfilería',
    email: 'contacto@kubiec.com',
    telefono: '+593 2 299 1800',
    ciudad: 'Quito',
    direccionMatriz: 'Parque Industrial Sur, Lote 14, Quito',
    plan: 'ESTANDAR_PRO',
    comisionSaraPct: 3.5,
    apiKey: 'sk_live_kubiec_910293847561_prod',
    logoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=120&h=120&fit=crop',
    estado: 'ACTIVO',
    verificadoSri: true,
    totalVentasUsd: 38200.00,
    totalOrdenes: 14,
    calificacionPromedio: 4.6,
    fechaRegistro: '2026-02-18'
  },
  {
    id: 'seller-disensa-05',
    ruc: '1102938475001',
    razonSocial: 'FERRETERÍA & MATERIALES DEL AUSTRO S.A.',
    nombreComercial: 'Disensa Franquicia Austral',
    email: 'ventas@disensaaustro.ec',
    telefono: '+593 7 257 1144',
    ciudad: 'Loja',
    direccionMatriz: 'Av. 8 de Diciembre y Gran Colombia, Loja',
    plan: 'BASICO_FERRETERIA',
    comisionSaraPct: 6.0,
    apiKey: 'sk_live_disensa_loja_772635182930_prod',
    logoUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=120&h=120&fit=crop',
    estado: 'ACTIVO',
    verificadoSri: true,
    totalVentasUsd: 14200.00,
    totalOrdenes: 11,
    calificacionPromedio: 4.5,
    fechaRegistro: '2026-03-01'
  }
];

let PRODUCTS_DB: MarketplaceProduct[] = [
  // --- PRODUCTOS PLAN VIP (ADELCA) ---
  {
    id: 'prod-adelca-varilla-12',
    sellerId: 'seller-adelca-01',
    sellerNombre: 'ADELCA Planta Industrial',
    sellerPlan: 'VIP_FABRICA',
    sellerRuc: '1790008594001',
    nombre: 'Varilla de Acero Corrugado fy=4200 Ø12mm x 12m',
    descripcion: 'Acero de refuerzo sismo-resistente de alta ductilidad bajo norma INEN 2167 Grado 60. Certificado de calidad de colada incluido.',
    categoria: 'ACERO',
    unidad: 'quintal (qq)',
    precioSinIva: 44.00,
    tarifaIvaPct: 5,
    stockDisponible: 3500,
    imagenUrl: 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=600&h=400&fit=crop',
    especificacionesTecnicas: {
      normaInen: 'NTE INEN 2167 (Grado 60)',
      resistencia: 'Fluencia fy = 420 MPa (60,000 PSI), Rotura fs = 620 MPa',
      dimensiones: 'Diámetro 12 mm x 12.00 m longitud',
      procedencia: 'NACIONAL',
      presentacion: 'Atados de 1 quintal (~4.17 varillas de 12m)'
    },
    descuentosVolumen: [
      { desdeCantidad: 50, precioUnitario: 43.20 },
      { desdeCantidad: 200, precioUnitario: 42.00 },
      { desdeCantidad: 500, precioUnitario: 40.50 }
    ],
    tiempoEntregaHoras: 24,
    pesoUnitarioKg: 45.36,
    ventasTotales: 1840,
    calificacion: 4.9,
    esMasVendido: true
  },
  {
    id: 'prod-adelca-malla-electrosoldada',
    sellerId: 'seller-adelca-01',
    sellerNombre: 'ADELCA Planta Industrial',
    sellerPlan: 'VIP_FABRICA',
    sellerRuc: '1790008594001',
    nombre: 'Malla Electrosoldada R-100 (10x10 cm, Ø4.5mm)',
    descripcion: 'Malla para losas de contrapiso, entrepisos y muros de hormigón armado con anclaje continuo.',
    categoria: 'ACERO',
    unidad: 'panel (6.00 x 2.40 m)',
    precioSinIva: 28.50,
    tarifaIvaPct: 5,
    stockDisponible: 1200,
    imagenUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop',
    especificacionesTecnicas: {
      normaInen: 'NTE INEN 2209',
      resistencia: 'fy = 500 MPa',
      dimensiones: 'Panel 6.00 m x 2.40 m (Área 14.40 m2)',
      procedencia: 'NACIONAL',
      presentacion: 'Panel rígido plano sin enrollar'
    },
    tiempoEntregaHoras: 24,
    pesoUnitarioKg: 32.50,
    ventasTotales: 890,
    calificacion: 4.8,
    esMasVendido: true
  },

  // --- PRODUCTOS PLAN VIP (HOLCIM) ---
  {
    id: 'prod-holcim-fuerte-50kg',
    sellerId: 'seller-holcim-02',
    sellerNombre: 'Holcim Soluciones de Cemento & Hormigón',
    sellerPlan: 'VIP_FABRICA',
    sellerRuc: '0990004512001',
    nombre: 'Cemento Holcim Fuerte Tipo GU 50 kg',
    descripcion: 'Cemento hidráulico para uso general en estructuras de hormigón armado, pavimentos y morteros de alta trabajabilidad.',
    categoria: 'CEMENTO_HORMIGON',
    unidad: 'saco (50 kg)',
    precioSinIva: 7.90,
    tarifaIvaPct: 5,
    stockDisponible: 8000,
    imagenUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=600&h=400&fit=crop',
    especificacionesTecnicas: {
      normaInen: 'NTE INEN 2380 / ASTM C1157',
      resistencia: '28 días: > 28 MPa (> 4000 PSI)',
      dimensiones: 'Saco tricapa kraft valvulado de 50 kg',
      procedencia: 'NACIONAL',
      presentacion: 'Paletizado de 40 sacos (2.0 Toneladas)'
    },
    descuentosVolumen: [
      { desdeCantidad: 100, precioUnitario: 7.65 },
      { desdeCantidad: 300, precioUnitario: 7.45 },
      { desdeCantidad: 800, precioUnitario: 7.20 }
    ],
    tiempoEntregaHoras: 12,
    pesoUnitarioKg: 50.00,
    ventasTotales: 4200,
    calificacion: 4.9,
    esMasVendido: true
  },
  {
    id: 'prod-holcim-hormigon-premezclado',
    sellerId: 'seller-holcim-02',
    sellerNombre: 'Holcim Soluciones de Cemento & Hormigón',
    sellerPlan: 'VIP_FABRICA',
    sellerRuc: '0990004512001',
    nombre: 'Hormigón Premezclado Bombeable f\'c=210 kg/cm2 (Asentamiento 12cm)',
    descripcion: 'Hormigón estructural premezclado en planta dosificadora con control de calidad de probetas y entrega directa en mixer.',
    categoria: 'CEMENTO_HORMIGON',
    unidad: 'metro cúbico (m3)',
    precioSinIva: 98.00,
    tarifaIvaPct: 5,
    stockDisponible: 950,
    imagenUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&h=400&fit=crop',
    especificacionesTecnicas: {
      normaInen: 'NTE INEN 1855 / ACI 318-19',
      resistencia: 'f\'c = 210 kg/cm2 (21 MPa)',
      dimensiones: 'Árido máximo 3/4", revenimiento 12 ± 2 cm',
      procedencia: 'NACIONAL',
      presentacion: 'Descarga en camión hormigonero mixer (capacidad 8 m3)'
    },
    tiempoEntregaHoras: 6,
    pesoUnitarioKg: 2400.00,
    ventasTotales: 1560,
    calificacion: 4.8,
    esMasVendido: true
  },

  // --- PRODUCTOS PLAN ESTÁNDAR (NOVACERO) ---
  {
    id: 'prod-novacero-viga-ipe',
    sellerId: 'seller-novacero-03',
    sellerNombre: 'Novacero Soluciones en Acero',
    sellerPlan: 'ESTANDAR_PRO',
    sellerRuc: '1790184279001',
    nombre: 'Viga Estructural IPE 200 x 6.00m (ASTM A36)',
    descripcion: 'Perfil estructural de acero laminado para pórticos, dinteles y entrepisos de edificaciones industriales.',
    categoria: 'ACERO',
    unidad: 'pieza (6m)',
    precioSinIva: 175.00,
    tarifaIvaPct: 5,
    stockDisponible: 280,
    imagenUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=400&fit=crop',
    especificacionesTecnicas: {
      normaInen: 'NTE INEN 2215 / ASTM A36',
      resistencia: 'Fluencia fy = 250 MPa (36,000 PSI)',
      dimensiones: 'Peralte 200 mm, Base 100 mm, Espesor alma 5.6 mm, ala 8.5 mm',
      procedencia: 'NACIONAL',
      presentacion: 'Longitud comercial 6.00 m'
    },
    tiempoEntregaHoras: 48,
    pesoUnitarioKg: 134.40,
    ventasTotales: 340,
    calificacion: 4.7
  },

  // --- PRODUCTOS PLAN ESTÁNDAR (KUBIEC) ---
  {
    id: 'prod-kubiec-panel-sandwich',
    sellerId: 'seller-kubiec-04',
    sellerNombre: 'Kubiec Cubiertas & Perfilería',
    sellerPlan: 'ESTANDAR_PRO',
    sellerRuc: '1791244305001',
    nombre: 'Panel Aislante Termoacústico Techomet 30mm (Acero-Poliuretano)',
    descripcion: 'Panel sándwich con núcleo de poliuretano inyectado de alta densidad para cubiertas industriales y residenciales.',
    categoria: 'ACABADOS',
    unidad: 'metro cuadrado (m2)',
    precioSinIva: 24.80,
    tarifaIvaPct: 15,
    stockDisponible: 650,
    imagenUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&h=400&fit=crop',
    especificacionesTecnicas: {
      normaInen: 'NTE INEN 2005',
      resistencia: 'Conductividad térmica k = 0.022 W/mK',
      dimensiones: 'Ancho útil 1.00 m, espesor de chapa 0.40 mm',
      procedencia: 'NACIONAL',
      presentacion: 'Láminas cortadas a medida hasta 12.00 m'
    },
    tiempoEntregaHoras: 48,
    pesoUnitarioKg: 8.50,
    ventasTotales: 490,
    calificacion: 4.6
  },

  // --- PRODUCTOS PLAN BÁSICO (DISENSA) ---
  {
    id: 'prod-disensa-tubo-pvc-110',
    sellerId: 'seller-disensa-05',
    sellerNombre: 'Disensa Franquicia Austral',
    sellerPlan: 'BASICO_FERRETERIA',
    sellerRuc: '1102938475001',
    nombre: 'Tubo de PVC Desagüe Sanitario 110mm x 3.00m',
    descripcion: 'Tubería de PVC rígido para instalaciones sanitarias hidrosanitarias domiciliarias con campana de unión por cementado.',
    categoria: 'TUBERIAS_PLOMERIA',
    unidad: 'tubo (3.00m)',
    precioSinIva: 8.75,
    tarifaIvaPct: 15,
    stockDisponible: 450,
    imagenUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=400&fit=crop',
    especificacionesTecnicas: {
      normaInen: 'NTE INEN 1374',
      resistencia: 'Presión no presurizada para descarga por gravedad',
      dimensiones: 'Diámetro exterior 110 mm x 3.00 m longitud',
      procedencia: 'NACIONAL',
      presentacion: 'Tramos de 3 metros'
    },
    tiempoEntregaHoras: 24,
    pesoUnitarioKg: 3.20,
    ventasTotales: 210,
    calificacion: 4.5
  },
  {
    id: 'prod-disensa-bloque-15',
    sellerId: 'seller-disensa-05',
    sellerNombre: 'Disensa Franquicia Austral',
    sellerPlan: 'BASICO_FERRETERIA',
    sellerRuc: '1102938475001',
    nombre: 'Bloque de Hormigón Liviano Prensado 15x20x40 cm',
    descripcion: 'Bloque vibro-prensado para mampostería de paredes interiores y cerramientos perimetrales.',
    categoria: 'CEMENTO_HORMIGON',
    unidad: 'unidad (u)',
    precioSinIva: 0.52,
    tarifaIvaPct: 5,
    stockDisponible: 6000,
    imagenUrl: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600&h=400&fit=crop',
    especificacionesTecnicas: {
      normaInen: 'NTE INEN 643 Tipo B',
      resistencia: 'Resistencia a compresión > 4.0 MPa',
      dimensiones: '15 cm x 20 cm x 40 cm',
      procedencia: 'NACIONAL',
      presentacion: 'Descarga a pie de obra'
    },
    tiempoEntregaHoras: 12,
    pesoUnitarioKg: 11.50,
    ventasTotales: 3800,
    calificacion: 4.4,
    esMasVendido: true
  }
];

let VENTAS_HISTORIAL_DB: VentaHistorialItem[] = [
  {
    id: 'vt-2026-001',
    facturaNumero: 'FAC-001-002-00084920',
    ordenCompraFolio: 'OC-2026-0891',
    fecha: '2026-10-22T10:30:00Z',
    sellerId: 'seller-adelca-01',
    clienteNombre: 'CONSTRUCTORA URBINA ASOCIADOS CÍA. LTDA.',
    clienteRuc: '1792019482001',
    proyectoObra: 'Torres del Mirador Residencial - Loja',
    subtotalUSD: 8800.00,
    ivaUSD: 440.00, // 5% IVA
    totalUSD: 9240.00,
    comisionSaraPct: 1.8,
    comisionSaraUSD: 158.40,
    netoVendedorUSD: 9081.60,
    estadoPago: 'LIBERADO_A_VENDEDOR',
    estadoDespacho: 'ENTREGADO_CONFORME',
    items: [
      {
        productoId: 'prod-adelca-varilla-12',
        sku: 'ADE-VAR-12-001',
        nombre: 'Varilla de Acero Corrugado fy=4200 Ø12mm x 12m',
        cantidad: 200,
        unidad: 'quintal (qq)',
        precioUnitarioUSD: 44.00,
        totalUSD: 8800.00
      }
    ]
  },
  {
    id: 'vt-2026-002',
    facturaNumero: 'FAC-002-005-00192841',
    ordenCompraFolio: 'OC-2026-0892',
    fecha: '2026-10-23T14:15:00Z',
    sellerId: 'seller-adelca-01',
    clienteNombre: 'CONSORCIO VIAL DEL SUR (CONVISUR)',
    clienteRuc: '1190048291001',
    proyectoObra: 'Paso Lateral Vilcabamba - Fase 2',
    subtotalUSD: 4275.00,
    ivaUSD: 213.75, // 5% IVA
    totalUSD: 4488.75,
    comisionSaraPct: 1.8,
    comisionSaraUSD: 76.95,
    netoVendedorUSD: 4411.80,
    estadoPago: 'EN_CUSTODIA_ESCROW',
    estadoDespacho: 'EN_TRANSITO',
    items: [
      {
        productoId: 'prod-adelca-malla-electrosoldada',
        sku: 'ADE-MAL-R100',
        nombre: 'Malla Electrosoldada R-100 (10x10 cm, Ø4.5mm)',
        cantidad: 150,
        unidad: 'panel (6.00 x 2.40 m)',
        precioUnitarioUSD: 28.50,
        totalUSD: 4275.00
      }
    ]
  },
  {
    id: 'vt-2026-003',
    facturaNumero: 'FAC-010-001-00049182',
    ordenCompraFolio: 'OC-2026-0895',
    fecha: '2026-10-24T09:00:00Z',
    sellerId: 'seller-holcim-02',
    clienteNombre: 'METRÓPOLIS EDIFICACIONES S.A.',
    clienteRuc: '1791829304001',
    proyectoObra: 'Edificio Titanium Business Park - Quito',
    subtotalUSD: 9800.00,
    ivaUSD: 490.00, // 5% IVA
    totalUSD: 10290.00,
    comisionSaraPct: 1.8,
    comisionSaraUSD: 176.40,
    netoVendedorUSD: 10113.60,
    estadoPago: 'EN_CUSTODIA_ESCROW',
    estadoDespacho: 'PENDIENTE',
    items: [
      {
        productoId: 'prod-holcim-hormigon-premezclado',
        sku: 'HOL-HOR-210',
        nombre: 'Hormigón Premezclado Bombeable f\'c=210 kg/cm2',
        cantidad: 100,
        unidad: 'metro cúbico (m3)',
        precioUnitarioUSD: 98.00,
        totalUSD: 9800.00
      }
    ]
  }
];

// ============================================================================
// SERVICIO PRINCIPAL EXPORTADO
// ============================================================================

export class SellerMarketplaceService {

  /**
   * Obtiene todos los productos del Marketplace ordenados estrictamente por:
   * 1. Prioridad del Plan (VIP Fábrica -> Estándar Pro -> Básico Ferretería)
   * 2. Volumen de Ventas (Los Más Vendidos)
   * 3. Filtros opcionales aplicados
   */
  static getMarketplaceProducts(filters?: {
    search?: string;
    categoria?: string;
    sellerId?: string;
    plan?: SellerPlanType;
    masVendidos?: boolean;
    tarifaIva?: number;
    precioMin?: number;
    precioMax?: number;
  }): MarketplaceProduct[] {
    let list = [...PRODUCTS_DB];

    if (filters) {
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        list = list.filter(p => 
          p.nombre.toLowerCase().includes(q) ||
          p.descripcion.toLowerCase().includes(q) ||
          p.sellerNombre.toLowerCase().includes(q) ||
          p.categoria.toLowerCase().includes(q)
        );
      }

      if (filters.categoria && filters.categoria !== 'TODAS') {
        list = list.filter(p => p.categoria === filters.categoria);
      }

      if (filters.sellerId && filters.sellerId !== 'TODOS') {
        list = list.filter(p => p.sellerId === filters.sellerId);
      }

      if (filters.plan && filters.plan !== ('TODOS' as any)) {
        list = list.filter(p => p.sellerPlan === filters.plan);
      }

      if (filters.masVendidos) {
        list = list.filter(p => p.esMasVendido);
      }

      if (filters.tarifaIva) {
        list = list.filter(p => p.tarifaIvaPct === filters.tarifaIva);
      }

      if (filters.precioMin !== undefined) {
        list = list.filter(p => p.precioSinIva >= filters.precioMin!);
      }

      if (filters.precioMax !== undefined) {
        list = list.filter(p => p.precioSinIva <= filters.precioMax!);
      }
    }

    // Ordenamiento por Jerarquía de Plan VIP -> Estándar -> Básico y luego por ventas
    const planWeights: Record<SellerPlanType, number> = {
      VIP_FABRICA: 3000,
      ESTANDAR_PRO: 2000,
      BASICO_FERRETERIA: 1000
    };

    return list.sort((a, b) => {
      const weightA = planWeights[a.sellerPlan] + (a.esMasVendido ? 500 : 0) + (a.ventasTotales / 10);
      const weightB = planWeights[b.sellerPlan] + (b.esMasVendido ? 500 : 0) + (b.ventasTotales / 10);
      return weightB - weightA;
    });
  }

  /**
   * Obtiene producto individual con detalles exhaustivos para modal de compra
   */
  static getProductById(id: string): MarketplaceProduct | undefined {
    return PRODUCTS_DB.find(p => p.id === id);
  }

  /**
   * Obtiene todos los proveedores registrados para filtros
   */
  static getSellersList(): SellerProfile[] {
    return [...SELLERS_DB];
  }

  /**
   * Obtiene perfil de proveedor por ID o API Key
   */
  static getSellerById(id: string): SellerProfile | undefined {
    return SELLERS_DB.find(s => s.id === id);
  }

  static getSellerByApiKey(apiKey: string): SellerProfile | undefined {
    return SELLERS_DB.find(s => s.apiKey === apiKey);
  }

  /**
   * Registro de nueva Empresa Proveedora con selección de Plan y RUC SRI
   */
  static registerSeller(payload: {
    ruc: string;
    razonSocial: string;
    nombreComercial: string;
    email: string;
    telefono: string;
    ciudad: string;
    direccionMatriz: string;
    plan: SellerPlanType;
  }): SellerProfile {
    // 1. Validar RUC con algoritmo Módulo 11 oficial
    const rucCheck = ComprasService.validarRucEcuador(payload.ruc);
    if (!rucCheck.valido) {
      throw new Error(`El RUC ${payload.ruc} no cumple con la regla de validación del SRI del Ecuador: ${rucCheck.error}`);
    }

    // 2. Verificar duplicados
    const existente = SELLERS_DB.find(s => s.ruc === payload.ruc);
    if (existente) {
      throw new Error(`Ya existe una empresa proveedora registrada con el RUC ${payload.ruc} (${existente.razonSocial}).`);
    }

    const planConfig = SELLER_PLANS[payload.plan];
    const newId = `seller-${payload.ruc.substring(0, 8)}-${Date.now().toString().slice(-4)}`;
    const apiKey = `sk_live_${payload.ruc}_${Math.random().toString(36).substring(2, 12)}_sara`;

    const newSeller: SellerProfile = {
      id: newId,
      ruc: payload.ruc,
      razonSocial: payload.razonSocial.toUpperCase(),
      nombreComercial: payload.nombreComercial,
      email: payload.email.toLowerCase(),
      telefono: payload.telefono,
      ciudad: payload.ciudad,
      direccionMatriz: payload.direccionMatriz,
      plan: payload.plan,
      comisionSaraPct: planConfig.comisionSaraPct,
      apiKey: apiKey,
      estado: 'ACTIVO',
      verificadoSri: true,
      totalVentasUsd: 0,
      totalOrdenes: 0,
      calificacionPromedio: 5.0,
      fechaRegistro: new Date().toISOString().split('T')[0]
    };

    SELLERS_DB.unshift(newSeller);
    return newSeller;
  }

  /**
   * Autenticación simple de empresa proveedora para entrar a su Seller Hub
   */
  static authenticateSeller(emailOrRuc: string): SellerProfile {
    const term = emailOrRuc.trim().toLowerCase();
    const seller = SELLERS_DB.find(s => s.email.toLowerCase() === term || s.ruc === term || s.id === term);
    if (!seller) {
      throw new Error('No se encontró una empresa proveedora registrada con ese RUC o correo corporativo.');
    }
    return seller;
  }

  /**
   * Agrega un nuevo producto manualmente al catálogo del proveedor
   */
  static addProductManual(sellerId: string, producto: Omit<MarketplaceProduct, 'id' | 'sellerId' | 'sellerNombre' | 'sellerPlan' | 'sellerRuc' | 'ventasTotales' | 'calificacion'>): MarketplaceProduct {
    const seller = this.getSellerById(sellerId);
    if (!seller) {
      throw new Error('Proveedor no autorizado o inexistente.');
    }

    const planConfig = SELLER_PLANS[seller.plan];
    const productosActuales = PRODUCTS_DB.filter(p => p.sellerId === sellerId).length;
    if (productosActuales >= planConfig.maxProductos) {
      throw new Error(`Ha alcanzado el límite máximo de ${planConfig.maxProductos} productos de su ${planConfig.nombre}. Actualice a un plan superior.`);
    }

    const nuevo: MarketplaceProduct = {
      ...producto,
      id: `prod-${seller.id}-${Date.now().toString().slice(-6)}`,
      sellerId: seller.id,
      sellerNombre: seller.nombreComercial,
      sellerPlan: seller.plan,
      sellerRuc: seller.ruc,
      ventasTotales: 0,
      calificacion: 5.0
    };

    PRODUCTS_DB.unshift(nuevo);
    return nuevo;
  }

  /**
   * Ingesta Masiva desde Archivo Excel / CSV (.xlsx)
   */
  static importProductsFromExcel(sellerId: string, filasExcel: any[]): { exitosos: number; errores: string[] } {
    const seller = this.getSellerById(sellerId);
    if (!seller) throw new Error('Vendedor no encontrado.');

    const errores: string[] = [];
    let exitosos = 0;

    filasExcel.forEach((fila, idx) => {
      try {
        const numLinea = idx + 2;
        if (!fila.nombre || String(fila.nombre).trim().length < 3) {
          throw new Error(`Línea ${numLinea}: Nombre de producto inválido o muy corto.`);
        }
        const precio = Number(fila.precioSinIva);
        if (isNaN(precio) || precio <= 0) {
          throw new Error(`Línea ${numLinea}: Precio unitario debe ser un número positivo.`);
        }

        const tarifa = Number(fila.tarifaIvaPct) === 15 ? 15 : 5;

        this.addProductManual(sellerId, {
          nombre: String(fila.nombre).trim(),
          descripcion: String(fila.descripcion || 'Insumo de construcción certificado.').trim(),
          categoria: (fila.categoria || 'ACERO') as MarketplaceProduct['categoria'],
          unidad: String(fila.unidad || 'unidad').trim(),
          precioSinIva: precio,
          tarifaIvaPct: tarifa as 5 | 15,
          stockDisponible: Number(fila.stockDisponible) || 100,
          imagenUrl: fila.imagenUrl || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop',
          especificacionesTecnicas: {
            normaInen: fila.normaInen || 'NTE INEN',
            resistencia: fila.resistencia || 'Estándar de Obra',
            dimensiones: fila.dimensiones || 'Dimensiones nominales',
            procedencia: 'NACIONAL',
            presentacion: fila.presentacion || 'A granel / paletizado'
          },
          tiempoEntregaHoras: Number(fila.tiempoEntregaHoras) || 24,
          pesoUnitarioKg: Number(fila.pesoUnitarioKg) || 10
        });

        exitosos++;
      } catch (err: any) {
        errores.push(err.message);
      }
    });

    return { exitosos, errores };
  }

  /**
   * Sincronización por API REST (Payload JSON desde SAP, Odoo o Contifico)
   */
  static syncProductsFromApi(apiKey: string, productosApi: any[]): { success: boolean; procesados: number; errores: string[] } {
    const seller = this.getSellerByApiKey(apiKey);
    if (!seller) {
      throw new Error('API Key no válida o no autorizada para el entorno de producción.');
    }

    if (!SELLER_PLANS[seller.plan].soportaApiSync) {
      throw new Error(`El ${SELLER_PLANS[seller.plan].nombre} no dispone de integración por API REST. Requiere Plan VIP Fábrica.`);
    }

    const { exitosos, errores } = this.importProductsFromExcel(seller.id, productosApi);
    return { success: true, procesados: exitosos, errores };
  }

  /**
   * Obtiene Métricas y Estadísticas para el Dashboard del Proveedor
   */
  static getSellerDashboardMetrics(sellerId: string) {
    const seller = this.getSellerById(sellerId);
    if (!seller) throw new Error('Vendedor no encontrado.');

    const ventas = VENTAS_HISTORIAL_DB.filter(v => v.sellerId === sellerId);
    const productos = PRODUCTS_DB.filter(p => p.sellerId === sellerId);

    const gmvVentasBrutasUSD = ventas.reduce((acc, v) => acc + v.totalUSD, 0);
    const comisionSaraTotalUSD = ventas.reduce((acc, v) => acc + v.comisionSaraUSD, 0);
    const netoVendedorTotalUSD = ventas.reduce((acc, v) => acc + v.netoVendedorUSD, 0);
    const enCustodiaEscrowUSD = ventas.filter(v => v.estadoPago === 'EN_CUSTODIA_ESCROW').reduce((acc, v) => acc + v.netoVendedorUSD, 0);
    const disponibleRetiroUSD = ventas.filter(v => v.estadoPago === 'LIBERADO_A_VENDEDOR').reduce((acc, v) => acc + v.netoVendedorUSD, 0);

    const ordenesPendientes = ventas.filter(v => v.estadoDespacho !== 'ENTREGADO_CONFORME').length;

    // Distribución por categorías
    const categoriasMap: Record<string, number> = {};
    productos.forEach(p => {
      categoriasMap[p.categoria] = (categoriasMap[p.categoria] || 0) + 1;
    });

    // Top productos más vendidos
    const topProductos = [...productos].sort((a, b) => b.ventasTotales - a.ventasTotales).slice(0, 5);

    // Serie temporal para gráfico (últimos 7 días)
    const serieVentasDias = [
      { dia: 'Lun 19', total: 1850 },
      { dia: 'Mar 20', total: 2400 },
      { dia: 'Mié 21', total: 3100 },
      { dia: 'Jue 22', total: 9240 },
      { dia: 'Vie 23', total: 4488 },
      { dia: 'Sáb 24', total: 3900 },
      { dia: 'Dom 25 (Hoy)', total: 1200 }
    ];

    return {
      seller,
      planConfig: SELLER_PLANS[seller.plan],
      kpis: {
        gmvVentasBrutasUSD,
        comisionSaraTotalUSD,
        netoVendedorTotalUSD,
        enCustodiaEscrowUSD,
        disponibleRetiroUSD,
        totalOrdenes: ventas.length,
        ordenesPendientes,
        totalProductosCatalogados: productos.length
      },
      serieVentasDias,
      categoriasMap,
      topProductos
    };
  }

  /**
   * Historial de Ventas desglosado por Facturas y por Artículos
   */
  static getSellerVentasHistorial(sellerId: string, filters?: {
    search?: string;
    fechaInicio?: string;
    fechaFin?: string;
    estadoPago?: string;
    estadoDespacho?: string;
  }) {
    let list = VENTAS_HISTORIAL_DB.filter(v => v.sellerId === sellerId);

    if (filters) {
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        list = list.filter(v => 
          v.facturaNumero.toLowerCase().includes(q) ||
          v.ordenCompraFolio.toLowerCase().includes(q) ||
          v.clienteNombre.toLowerCase().includes(q) ||
          v.proyectoObra.toLowerCase().includes(q) ||
          v.items.some(it => it.nombre.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q))
        );
      }

      if (filters.estadoPago && filters.estadoPago !== 'TODOS') {
        list = list.filter(v => v.estadoPago === filters.estadoPago);
      }

      if (filters.estadoDespacho && filters.estadoDespacho !== 'TODOS') {
        list = list.filter(v => v.estadoDespacho === filters.estadoDespacho);
      }
    }

    // 1. Vista por Facturas / Órdenes
    const porFacturas = [...list].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    // 2. Vista agregada por Artículos / SKUs
    const articulosMap: Record<string, {
      sku: string;
      nombre: string;
      unidad: string;
      cantidadTotalVendida: number;
      ingresoTotalUSD: number;
      numeroFacturas: number;
    }> = {};

    list.forEach(v => {
      v.items.forEach(it => {
        if (!articulosMap[it.productoId]) {
          articulosMap[it.productoId] = {
            sku: it.sku,
            nombre: it.nombre,
            unidad: it.unidad,
            cantidadTotalVendida: 0,
            ingresoTotalUSD: 0,
            numeroFacturas: 0
          };
        }
        articulosMap[it.productoId].cantidadTotalVendida += it.cantidad;
        articulosMap[it.productoId].ingresoTotalUSD += it.totalUSD;
        articulosMap[it.productoId].numeroFacturas += 1;
      });
    });

    const porArticulos = Object.values(articulosMap).sort((a, b) => b.ingresoTotalUSD - a.ingresoTotalUSD);

    return {
      porFacturas,
      porArticulos,
      totales: {
        montoTotalUSD: list.reduce((acc, v) => acc + v.totalUSD, 0),
        comisionSaraUSD: list.reduce((acc, v) => acc + v.comisionSaraUSD, 0),
        netoVendedorUSD: list.reduce((acc, v) => acc + v.netoVendedorUSD, 0)
      }
    };
  }
}
