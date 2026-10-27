'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  X,
  TrendingUp,
  DollarSign,
  TrendingDown,
  Layers,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  Building2,
  FileText,
  CreditCard,
  Percent,
  Download,
  AlertCircle,
  Maximize2
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { ModuloRecaudacion } from '@/app/admin/page'

export interface CentroCosto {
  nombre: string
  monto: number
  porcentaje: number
  color: string
}

export interface HistoricoFinancieroMes {
  mes: string
  ingresos: number
  gastos: number
  margen: number
}

export interface OperacionAuditoria {
  id: string
  concepto: string
  tipo: 'INGRESO' | 'GASTO'
  monto: number
  fecha: string
  referencia: string
  estado: 'CONCILIADO' | 'EN_CUSTODIA' | 'RETENIDO_SRI'
}

export interface ModuloFinancieroDetalle {
  key: string
  name: string
  shortName: string
  sector: string
  color: string
  portalUrl: string
  portalLabel: string
  ingresos: number
  gastos: number
  margenNeto: number
  margenPct: number
  roi: number
  ebitda: number
  impuestosRetenciones: number
  transacciones: number
  ticketPromedio: number
  tendencia: string
  fuentesIngresos: string[]
  centrosCosto: CentroCosto[]
  historicoMensual: HistoricoFinancieroMes[]
  operaciones: OperacionAuditoria[]
}

export const MODULOS_FINANCIEROS_BASE: Record<string, ModuloFinancieroDetalle> = {
  constructora: {
    key: 'constructora',
    name: 'SARA Constructora',
    shortName: 'Constructora',
    sector: 'Dirección Técnica, Obras Civiles & Fiscalización BIM',
    color: '#059669',
    portalUrl: '/proyectos',
    portalLabel: 'Abrir Portal Constructora',
    ingresos: 42850,
    gastos: 27400,
    margenNeto: 15450,
    margenPct: 36.1,
    roi: 56.4,
    ebitda: 16800,
    impuestosRetenciones: 2140,
    transacciones: 38,
    ticketPromedio: 1127.63,
    tendencia: '+14.2%',
    fuentesIngresos: [
      'Planillas de avance de obra civil (Hormigón & Estructuras)',
      'Honorarios de fiscalización técnica y Libro de Obra GPS',
      'Certificaciones de calidad de materiales bajo NEC-15',
      'Contenedores BIM CDE bajo estándar ISO 19650'
    ],
    centrosCosto: [
      { nombre: 'Mano de Obra & Cuadrillas', monto: 12300, porcentaje: 44.9, color: '#059669' },
      { nombre: 'Materiales & Hormigones', monto: 9100, porcentaje: 33.2, color: '#10b981' },
      { nombre: 'Fiscalización & Equipos GPS', monto: 3800, porcentaje: 13.9, color: '#34d399' },
      { nombre: 'Seguridad SST (Resol. CD 513)', monto: 2200, porcentaje: 8.0, color: '#6ee7b7' }
    ],
    historicoMensual: [
      { mes: 'May', ingresos: 28000, gastos: 18500, margen: 9500 },
      { mes: 'Jun', ingresos: 32000, gastos: 21100, margen: 10900 },
      { mes: 'Jul', ingresos: 34500, gastos: 22800, margen: 11700 },
      { mes: 'Ago', ingresos: 37200, gastos: 24300, margen: 12900 },
      { mes: 'Sep', ingresos: 39900, gastos: 25800, margen: 14100 },
      { mes: 'Oct', ingresos: 42850, gastos: 27400, margen: 15450 }
    ],
    operaciones: [
      { id: 'TX-C01', concepto: 'Planilla Hito 3 Hormigón Torre Bellavista', tipo: 'INGRESO', monto: 12500, fecha: '25/10/2026', referencia: 'PLN-2026-084', estado: 'CONCILIADO' },
      { id: 'TX-C02', concepto: 'Adquisición Áridos y Hormigón Premezclado', tipo: 'GASTO', monto: 4200, fecha: '24/10/2026', referencia: 'FCT-HORM-991', estado: 'CONCILIADO' },
      { id: 'TX-C03', concepto: 'Fiscalización Topográfica y Georreferenciación GPS', tipo: 'GASTO', monto: 1450, fecha: '22/10/2026', referencia: 'HON-GEO-102', estado: 'CONCILIADO' }
    ]
  },
  marketplace: {
    key: 'marketplace',
    name: 'SARA Marketplace B2B',
    shortName: 'Compras B2B',
    sector: 'Abastecimiento Mayorista & Ferreterías',
    color: '#0891b2',
    portalUrl: '/modulos/compras',
    portalLabel: 'Abrir Portal Marketplace B2B',
    ingresos: 31450,
    gastos: 16800,
    margenNeto: 14650,
    margenPct: 46.6,
    roi: 87.2,
    ebitda: 15200,
    impuestosRetenciones: 1570,
    transacciones: 84,
    ticketPromedio: 374.40,
    tendencia: '+18.5%',
    fuentesIngresos: [
      'Membresías VIP Fábrica (1.8%) y Distribuidor Pro (3.5%)',
      'Comisión por intermediación de materiales con IVA 5%',
      'Servicio de dispersión fiduciaria de pagos a proveedores',
      'Ingesta API REST de catálogos ERP automatizados'
    ],
    centrosCosto: [
      { nombre: 'Logística de Distribución Landed Cost', monto: 7500, porcentaje: 44.6, color: '#0891b2' },
      { nombre: 'Pasarela Transaccional SRI Módulo 11', monto: 4200, porcentaje: 25.0, color: '#06b6d4' },
      { nombre: 'Servidores & Sincronización ERP', monto: 2900, porcentaje: 17.3, color: '#22d3ee' },
      { nombre: 'Soporte y Garantías de Insumos', monto: 2200, porcentaje: 13.1, color: '#67e8f9' }
    ],
    historicoMensual: [
      { mes: 'May', ingresos: 19500, gastos: 11200, margen: 8300 },
      { mes: 'Jun', ingresos: 22100, gastos: 12500, margen: 9600 },
      { mes: 'Jul', ingresos: 24800, gastos: 13800, margen: 11000 },
      { mes: 'Ago', ingresos: 27600, gastos: 15100, margen: 12500 },
      { mes: 'Sep', ingresos: 29800, gastos: 16000, margen: 13800 },
      { mes: 'Oct', ingresos: 31450, gastos: 16800, margen: 14650 }
    ],
    operaciones: [
      { id: 'TX-M01', concepto: 'Despacho Mayorista Acero Adelca 12mm (IVA 5%)', tipo: 'INGRESO', monto: 8900, fecha: '25/10/2026', referencia: 'ORD-MKP-552', estado: 'CONCILIADO' },
      { id: 'TX-M02', concepto: 'Dispersión Fideicomiso Proveedor Holcim', tipo: 'GASTO', monto: 5400, fecha: '23/10/2026', referencia: 'DSP-FDI-331', estado: 'CONCILIADO' },
      { id: 'TX-M03', concepto: 'Comisión Membresía VIP Fábrica Trimestral', tipo: 'INGRESO', monto: 1850, fecha: '20/10/2026', referencia: 'MEM-VIP-099', estado: 'CONCILIADO' }
    ]
  },
  inmobiliaria: {
    key: 'inmobiliaria',
    name: 'SARA Inmobiliaria',
    shortName: 'Inmobiliaria',
    sector: 'Plusvalía, Tasación IVS & Corretaje VIP',
    color: '#4f46e5',
    portalUrl: '/inmobiliaria',
    portalLabel: 'Abrir Portal Inmobiliaria',
    ingresos: 26300,
    gastos: 9650,
    margenNeto: 16650,
    margenPct: 63.3,
    roi: 172.5,
    ebitda: 17100,
    impuestosRetenciones: 1315,
    transacciones: 19,
    ticketPromedio: 1384.21,
    tendencia: '+9.4%',
    fuentesIngresos: [
      'Comisión de corretaje sobre activos comerciales y suites',
      'Honorarios por informe pericial de tasación IVS 2025',
      'Precalificación hipotecaria BIESS Premier 2.99% / VIS 4.99%',
      'Bloqueo transaccional de reservas inmobiliarias en línea'
    ],
    centrosCosto: [
      { nombre: 'Comisiones Red de Brokers Certificados', monto: 5100, porcentaje: 52.8, color: '#4f46e5' },
      { nombre: 'Pauta & Marketing de Absorción', monto: 2450, porcentaje: 25.4, color: '#6366f1' },
      { nombre: 'Peritajes Tasación Econométrica IVS', monto: 1300, porcentaje: 13.5, color: '#818cf8' },
      { nombre: 'Gasto Notarial & Trámites Municipales', monto: 800, porcentaje: 8.3, color: '#a5b4fc' }
    ],
    historicoMensual: [
      { mes: 'May', ingresos: 16800, gastos: 6800, margen: 10000 },
      { mes: 'Jun', ingresos: 18500, gastos: 7400, margen: 11100 },
      { mes: 'Jul', ingresos: 20900, gastos: 8100, margen: 12800 },
      { mes: 'Ago', ingresos: 22800, gastos: 8700, margen: 14100 },
      { mes: 'Sep', ingresos: 24600, gastos: 9100, margen: 15500 },
      { mes: 'Oct', ingresos: 26300, gastos: 9650, margen: 16650 }
    ],
    operaciones: [
      { id: 'TX-I01', concepto: 'Cierre Corretaje Suite Platinum Penthouse', tipo: 'INGRESO', monto: 14200, fecha: '25/10/2026', referencia: 'VNT-STE-401', estado: 'CONCILIADO' },
      { id: 'TX-I02', concepto: 'Liquidación Honorarios Broker Certificado', tipo: 'GASTO', monto: 3550, fecha: '24/10/2026', referencia: 'BRK-LQ-105', estado: 'CONCILIADO' },
      { id: 'TX-I03', concepto: 'Dictamen Pericial Suelo Urbano Valle Cumbayá', tipo: 'INGRESO', monto: 2400, fecha: '21/10/2026', referencia: 'PER-IVS-072', estado: 'CONCILIADO' }
    ]
  },
  fletes: {
    key: 'fletes',
    name: 'SARA Fletes & Logística Pesada',
    shortName: 'Fletes',
    sector: 'Logística MTOP, Volquetas & Renta Vehicular',
    color: '#d97706',
    portalUrl: '/modulos/fletes',
    portalLabel: 'Abrir Portal SARA Fletes',
    ingresos: 18920,
    gastos: 12400,
    margenNeto: 6520,
    margenPct: 34.5,
    roi: 52.6,
    ebitda: 7100,
    impuestosRetenciones: 945,
    transacciones: 52,
    ticketPromedio: 363.85,
    tendencia: '+21.0%',
    fuentesIngresos: [
      'Fletes pesados interprovinciales (Plataformas 30T, Volquetas 14m³)',
      'Optimización Backhaul (eliminación de viajes en vacío)',
      'Renta de maquinaria pesada por horas y días con operador',
      'Comisión sobre fletes urbanos negociados P2P'
    ],
    centrosCosto: [
      { nombre: 'Combustible Diésel Flota', monto: 6200, porcentaje: 50.0, color: '#d97706' },
      { nombre: 'Peajes MTOP Interprovinciales', monto: 2900, porcentaje: 23.4, color: '#f59e0b' },
      { nombre: 'Mantenimiento Preventivo de Volquetas', monto: 2100, porcentaje: 16.9, color: '#fbbf24' },
      { nombre: 'Pólizas de Seguro de Carga y Ejes', monto: 1200, porcentaje: 9.7, color: '#fcd34d' }
    ],
    historicoMensual: [
      { mes: 'May', ingresos: 11400, gastos: 8100, margen: 3300 },
      { mes: 'Jun', ingresos: 13200, gastos: 9100, margen: 4100 },
      { mes: 'Jul', ingresos: 14800, gastos: 10000, margen: 4800 },
      { mes: 'Ago', ingresos: 16100, gastos: 10800, margen: 5300 },
      { mes: 'Sep', ingresos: 17500, gastos: 11600, margen: 5900 },
      { mes: 'Oct', ingresos: 18920, gastos: 12400, margen: 6520 }
    ],
    operaciones: [
      { id: 'TX-F01', concepto: 'Desalojo Masivo Excavación & Acarreo 140m³', tipo: 'INGRESO', monto: 3850, fecha: '25/10/2026', referencia: 'FLT-DES-140', estado: 'CONCILIADO' },
      { id: 'TX-F02', concepto: 'Combustible Estación Petroecuador Pifo', tipo: 'GASTO', monto: 1200, fecha: '24/10/2026', referencia: 'DSL-PET-882', estado: 'CONCILIADO' },
      { id: 'TX-F03', concepto: 'Retorno Backhaul Cantera San Antonio - Cumbayá', tipo: 'INGRESO', monto: 1950, fecha: '23/10/2026', referencia: 'BKH-LOG-041', estado: 'CONCILIADO' }
    ]
  },
  apu: {
    key: 'apu',
    name: 'SARA APU & Costos',
    shortName: 'APU SaaS',
    sector: 'Ingeniería de Costos, Presupuestos & Licitación SERCOP',
    color: '#2563eb',
    portalUrl: '/apu',
    portalLabel: 'Abrir Portal SARA APU',
    ingresos: 14620,
    gastos: 4200,
    margenNeto: 10420,
    margenPct: 71.3,
    roi: 248.1,
    ebitda: 10800,
    impuestosRetenciones: 730,
    transacciones: 46,
    ticketPromedio: 317.83,
    tendencia: '+11.8%',
    fuentesIngresos: [
      'Suscripciones SaaS Profesionales y Corporativas',
      'Cálculo y certificación de Fórmula Polinómica e Índices INEC',
      'Auditoría y desglose de Valor Agregado Ecuatoriano (VAE)',
      'Inteligencia de pliegos y precalificación SERCOP'
    ],
    centrosCosto: [
      { nombre: 'Infraestructura Cloud Compute & Base APU', monto: 1800, porcentaje: 42.9, color: '#2563eb' },
      { nombre: 'Scrapers Automatizados SERCOP & Índices IPCO', monto: 1100, porcentaje: 26.2, color: '#3b82f6' },
      { nombre: 'Modelos de Optimización Rendimientos AI', monto: 850, porcentaje: 20.2, color: '#60a5fa' },
      { nombre: 'Soporte Técnico de Ingeniería Civil', monto: 450, porcentaje: 10.7, color: '#93c5fd' }
    ],
    historicoMensual: [
      { mes: 'May', ingresos: 9200, gastos: 3100, margen: 6100 },
      { mes: 'Jun', ingresos: 10400, gastos: 3300, margen: 7100 },
      { mes: 'Jul', ingresos: 11800, gastos: 3600, margen: 8200 },
      { mes: 'Ago', ingresos: 12900, gastos: 3800, margen: 9100 },
      { mes: 'Sep', ingresos: 13800, gastos: 4000, margen: 9800 },
      { mes: 'Oct', ingresos: 14620, gastos: 4200, margen: 10420 }
    ],
    operaciones: [
      { id: 'TX-A01', concepto: 'Plan Anual Corporativo Empresa Constructora', tipo: 'INGRESO', monto: 1800, fecha: '25/10/2026', referencia: 'SUB-APU-012', estado: 'CONCILIADO' },
      { id: 'TX-A02', concepto: 'Servidores Procesamiento Cómputos AWS', tipo: 'GASTO', monto: 450, fecha: '23/10/2026', referencia: 'AWS-CMP-810', estado: 'CONCILIADO' },
      { id: 'TX-A03', concepto: 'Auditoría VAE Licitación Hospitalaria SERCOP', tipo: 'INGRESO', monto: 950, fecha: '21/10/2026', referencia: 'VAE-AUD-303', estado: 'CONCILIADO' }
    ]
  },
  talento: {
    key: 'talento',
    name: 'SARA Talento Humano',
    shortName: 'Talento Humano',
    sector: 'Cuadrillas Push-to-Work, Nómina & Seguridad SST',
    color: '#ea580c',
    portalUrl: '/modulos/talento',
    portalLabel: 'Abrir Portal SARA Talento',
    ingresos: 9750,
    gastos: 3600,
    margenNeto: 6150,
    margenPct: 63.1,
    roi: 170.8,
    ebitda: 6400,
    impuestosRetenciones: 485,
    transacciones: 27,
    ticketPromedio: 361.11,
    tendencia: '+6.5%',
    fuentesIngresos: [
      'Comisión sobre contratación Push-to-Work de cuadrillas',
      'Validación de certificaciones laborales SECAP',
      'Auditoría y cálculo de nómina con cargas IESS y fondos de reserva',
      'Protocolos de inducción y auditoría de campo SST'
    ],
    centrosCosto: [
      { nombre: 'Validaciones SECAP & Antecedentes', monto: 1400, porcentaje: 38.9, color: '#ea580c' },
      { nombre: 'Pasarela SMS / WhatsApp Notificaciones', monto: 1100, porcentaje: 30.6, color: '#f97316' },
      { nombre: 'Chequeos Ocupacionales Prevención IESS', monto: 750, porcentaje: 20.8, color: '#fb923c' },
      { nombre: 'Administración de Contratos de Obra', monto: 350, porcentaje: 9.7, color: '#fdba74' }
    ],
    historicoMensual: [
      { mes: 'May', ingresos: 6800, gastos: 2800, margen: 4000 },
      { mes: 'Jun', ingresos: 7400, gastos: 2900, margen: 4500 },
      { mes: 'Jul', ingresos: 8100, gastos: 3100, margen: 5000 },
      { mes: 'Ago', ingresos: 8700, gastos: 3300, margen: 5400 },
      { mes: 'Sep', ingresos: 9200, gastos: 3450, margen: 5750 },
      { mes: 'Oct', ingresos: 9750, gastos: 3600, margen: 6150 }
    ],
    operaciones: [
      { id: 'TX-T01', concepto: 'Colocación Cuadrilla Fierreros Obra Cumbayá', tipo: 'INGRESO', monto: 1650, fecha: '25/10/2026', referencia: 'ASG-TAL-088', estado: 'CONCILIADO' },
      { id: 'TX-T02', concepto: 'Certificación Competencias SECAP Cuadrilla 4', tipo: 'GASTO', monto: 480, fecha: '24/10/2026', referencia: 'SCP-VAL-119', estado: 'CONCILIADO' },
      { id: 'TX-T03', concepto: 'Nómina Quincenal & Retenciones Patronales IESS', tipo: 'INGRESO', monto: 2100, fecha: '22/10/2026', referencia: 'NOM-IES-501', estado: 'CONCILIADO' }
    ]
  },
  stays: {
    key: 'stays',
    name: 'SARA Stays Corporate',
    shortName: 'SARA Stays',
    sector: 'Campamentos Técnicos & Alojamientos Turísticos',
    color: '#db2777',
    portalUrl: '/stays',
    portalLabel: 'Abrir Portal SARA Stays',
    ingresos: 7840,
    gastos: 3100,
    margenNeto: 4740,
    margenPct: 60.5,
    roi: 152.9,
    ebitda: 4900,
    impuestosRetenciones: 390,
    transacciones: 34,
    ticketPromedio: 230.59,
    tendencia: '+8.3%',
    fuentesIngresos: [
      'Alojamientos de estancia corporativa para técnicos e ingenieros',
      'Tarifas dinámicas en feriados turísticos (IVA 8% MINTUR)',
      'Métricas USALI de rentabilidad y Revenue Management',
      'Pases ejecutivos para suites totalmente equipadas'
    ],
    centrosCosto: [
      { nombre: 'Servicio Limpieza, Blancos & Lavandería', monto: 1350, porcentaje: 43.5, color: '#db2777' },
      { nombre: 'Cerraduras Inteligentes IoT & Conectividad', monto: 750, porcentaje: 24.2, color: '#ec4899' },
      { nombre: 'Insumos de Cortesía & Menaje', monto: 600, porcentaje: 19.4, color: '#f472b6' },
      { nombre: 'Seguro de Hospitalidad & LUAF Municipal', monto: 400, porcentaje: 12.9, color: '#fbcfe8' }
    ],
    historicoMensual: [
      { mes: 'May', ingresos: 5100, gastos: 2200, margen: 2900 },
      { mes: 'Jun', ingresos: 5800, gastos: 2400, margen: 3400 },
      { mes: 'Jul', ingresos: 6400, gastos: 2650, margen: 3750 },
      { mes: 'Ago', ingresos: 6900, gastos: 2800, margen: 4100 },
      { mes: 'Sep', ingresos: 7350, gastos: 2950, margen: 4400 },
      { mes: 'Oct', ingresos: 7840, gastos: 3100, margen: 4740 }
    ],
    operaciones: [
      { id: 'TX-S01', concepto: 'Estancia Corporativa 14 Noches Ingenieros Obra', tipo: 'INGRESO', monto: 1450, fecha: '25/10/2026', referencia: 'RES-CORP-22', estado: 'CONCILIADO' },
      { id: 'TX-S02', concepto: 'Mantenimiento Cerraduras IoT y Puertas PIN', tipo: 'GASTO', monto: 280, fecha: '23/10/2026', referencia: 'IOT-MNT-091', estado: 'CONCILIADO' },
      { id: 'TX-S03', concepto: 'Reserva Fin de Semana Feriado (IVA 8% MINTUR)', tipo: 'INGRESO', monto: 680, fecha: '22/10/2026', referencia: 'MNT-RES-054', estado: 'CONCILIADO' }
    ]
  },
  fintech: {
    key: 'fintech',
    name: 'SARA Fintech & Pagos Escrow',
    shortName: 'Fideicomiso Escrow',
    sector: 'Custodia Fiduciaria, UAFE & Blindaje Financiero',
    color: '#10b981',
    portalUrl: '/modulos/financiero',
    portalLabel: 'Abrir Portal Fideicomiso Escrow',
    ingresos: 6230,
    gastos: 1450,
    margenNeto: 4780,
    margenPct: 76.7,
    roi: 329.7,
    ebitda: 4950,
    impuestosRetenciones: 310,
    transacciones: 29,
    ticketPromedio: 214.83,
    tendencia: '+15.7%',
    fuentesIngresos: [
      'Comisión de custodia en cuentas Escrow segregadas',
      'Monitoreo y reporte preventivo antilavado UAFE (RESU)',
      'Conciliación Three-Way Match para desembolsos de obra',
      'Pruebas de estrés de liquidez de flujo de caja (CFCR)'
    ],
    centrosCosto: [
      { nombre: 'Auditoría Legal UAFE & Oficial de Cumplimiento', monto: 700, porcentaje: 48.3, color: '#10b981' },
      { nombre: 'Conexión Switch Redeban / Banco Central', monto: 450, porcentaje: 31.0, color: '#34d399' },
      { nombre: 'Cifrado XAdES-BES & Firmas Fiduciarias', monto: 300, porcentaje: 20.7, color: '#6ee7b7' }
    ],
    historicoMensual: [
      { mes: 'May', ingresos: 3900, gastos: 1100, margen: 2800 },
      { mes: 'Jun', ingresos: 4400, gastos: 1180, margen: 3220 },
      { mes: 'Jul', ingresos: 4900, gastos: 1250, margen: 3650 },
      { mes: 'Ago', ingresos: 5350, gastos: 1320, margen: 4030 },
      { mes: 'Sep', ingresos: 5800, gastos: 1380, margen: 4420 },
      { mes: 'Oct', ingresos: 6230, gastos: 1450, margen: 4780 }
    ],
    operaciones: [
      { id: 'TX-P01', concepto: 'Custodia Escrow Hito 4 Urbanización San Pedro', tipo: 'INGRESO', monto: 1950, fecha: '25/10/2026', referencia: 'ESC-FED-104', estado: 'EN_CUSTODIA' },
      { id: 'TX-P02', concepto: 'Honorarios Peritaje Cumplimiento UAFE', tipo: 'GASTO', monto: 350, fecha: '24/10/2026', referencia: 'UAF-AUD-009', estado: 'CONCILIADO' },
      { id: 'TX-P03', concepto: 'Comisión Dispersión Hito Fiscalizado', tipo: 'INGRESO', monto: 850, fecha: '21/10/2026', referencia: 'DSP-HST-082', estado: 'CONCILIADO' }
    ]
  },
  facturacion: {
    key: 'facturacion',
    name: 'SARA Firma y Facturación Electrónica SRI',
    shortName: 'Firma & SRI',
    sector: 'Comprobantes Electrónicos SRI & Firma Digital .p12',
    color: '#f59e0b',
    portalUrl: '/modulos/facturacion',
    portalLabel: 'Abrir Portal Facturación SRI',
    ingresos: 4580,
    gastos: 1150,
    margenNeto: 3430,
    margenPct: 74.9,
    roi: 298.3,
    ebitda: 3550,
    impuestosRetenciones: 229,
    transacciones: 65,
    ticketPromedio: 70.46,
    tendencia: '+24.6%',
    fuentesIngresos: [
      'Venta de Bolsas Prepago sin caducidad ($3.99 / 15 docs)',
      'Pases Diarios de emisión ilimitada ($1.50)',
      'Emisión y renovación express de Firma Electrónica .p12 ($18)',
      'Integración Web Service SRI Módulo 11 con validación XAdES-BES'
    ],
    centrosCosto: [
      { nombre: 'Bóveda HSM Cifrada Certificados .p12', monto: 520, porcentaje: 45.2, color: '#f59e0b' },
      { nombre: 'Aranceles Certificadora ARCOTEL Security Data', monto: 380, porcentaje: 33.0, color: '#fbbf24' },
      { nombre: 'Consumo Servidores Web Service SRI', monto: 250, porcentaje: 21.8, color: '#fde047' }
    ],
    historicoMensual: [
      { mes: 'May', ingresos: 2100, gastos: 650, margen: 1450 },
      { mes: 'Jun', ingresos: 2600, gastos: 750, margen: 1850 },
      { mes: 'Jul', ingresos: 3100, gastos: 880, margen: 2220 },
      { mes: 'Ago', ingresos: 3600, gastos: 980, margen: 2620 },
      { mes: 'Sep', ingresos: 4100, gastos: 1080, margen: 3020 },
      { mes: 'Oct', ingresos: 4580, gastos: 1150, margen: 3430 }
    ],
    operaciones: [
      { id: 'TX-E01', concepto: 'Bolsa Prepago 150 Comprobantes Constructora Andrade', tipo: 'INGRESO', monto: 29.90, fecha: '25/10/2026', referencia: 'BLS-SRI-901', estado: 'CONCILIADO' },
      { id: 'TX-E02', concepto: 'Emisión Certificado Firma Digital .p12 (1 Año)', tipo: 'INGRESO', monto: 18.00, fecha: '25/10/2026', referencia: 'FRM-P12-441', estado: 'CONCILIADO' },
      { id: 'TX-E03', concepto: 'Canon Bóveda Criptográfica HSM Trimestral', tipo: 'GASTO', monto: 175.00, fecha: '23/10/2026', referencia: 'HSM-BVD-012', estado: 'CONCILIADO' }
    ]
  }
}

interface ModalControlFinancieroModuloProps {
  isOpen: boolean
  onClose: () => void
  initialModuleKey?: string
  recaudacionModulos?: (ModuloRecaudacion & { montoAjustado?: number })[]
  periodoLabel?: string
}

export default function ModalControlFinancieroModulo({
  isOpen,
  onClose,
  initialModuleKey = 'constructora',
  recaudacionModulos,
  periodoLabel = 'Histórico Total'
}: ModalControlFinancieroModuloProps) {
  // Clave del módulo seleccionado actualmente
  const [selectedKey, setSelectedKey] = useState<string>(initialModuleKey)
  const [activeTab, setActiveTab] = useState<'detalle' | 'comparativo'>('detalle')

  // SINCRONIZACIÓN REACTIVA: Cada vez que el modal se abre o cambia la prop initialModuleKey,
  // se fuerza el estado al módulo exacto cliqueado por el usuario (resuelve la discrepancia visual)
  useEffect(() => {
    if (initialModuleKey) {
      setSelectedKey(initialModuleKey)
      setActiveTab('detalle')
    }
  }, [initialModuleKey, isOpen])

  if (!isOpen) return null

  // Módulo base
  const modBase = MODULOS_FINANCIEROS_BASE[selectedKey] || MODULOS_FINANCIEROS_BASE.constructora

  // Módulo live sincronizado con la tarjeta del dashboard
  const modLive = recaudacionModulos?.find(m => m.key === selectedKey)

  // 100% Sincronizado en tiempo real con el valor de la tarjeta
  const liveIngresos = modLive?.montoAjustado !== undefined ? modLive.montoAjustado : (modLive?.monto ?? modBase.ingresos)
  const ratioGastos = modBase.gastos / modBase.ingresos
  const liveGastos = Math.round(liveIngresos * ratioGastos)
  const liveMargen = liveIngresos - liveGastos
  const liveMargenPct = liveIngresos > 0 ? Number(((liveMargen / liveIngresos) * 100).toFixed(1)) : modBase.margenPct
  const liveEbitda = Math.round(liveMargen * 1.087)
  const liveRetenciones = Math.round(liveIngresos * 0.05)
  const liveTransacciones = modLive?.transacciones ?? modBase.transacciones
  const liveTendencia = modLive?.tendencia ?? modBase.tendencia

  // Centros de costos recalculados para sumar exactamente liveGastos
  const centrosCostoSincronizados = modBase.centrosCosto.map(c => ({
    ...c,
    monto: Math.round(liveGastos * (c.porcentaje / 100))
  }))

  // Histórico mensual ajustado para que el último mes (Oct) coincida con liveIngresos
  const historicoMensualSincronizado = modBase.historicoMensual.map((h, i, arr) => {
    if (i === arr.length - 1) {
      return {
        ...h,
        ingresos: liveIngresos,
        gastos: liveGastos,
        margen: liveMargen
      }
    }
    const factor = liveIngresos / modBase.ingresos
    const ingr = Math.round(h.ingresos * factor)
    const gast = Math.round(h.gastos * factor)
    return {
      ...h,
      ingresos: ingr,
      gastos: gast,
      margen: ingr - gast
    }
  })

  // Módulo final enriquecido y sincronizado
  const mod: ModuloFinancieroDetalle = {
    ...modBase,
    ingresos: liveIngresos,
    gastos: liveGastos,
    margenNeto: liveMargen,
    margenPct: liveMargenPct,
    ebitda: liveEbitda,
    impuestosRetenciones: liveRetenciones,
    transacciones: liveTransacciones,
    tendencia: liveTendencia,
    centrosCosto: centrosCostoSincronizados,
    historicoMensual: historicoMensualSincronizado
  }

  // Lista de todos los 9 módulos sincronizados para la pestaña comparativa
  const listaModulos = Object.values(MODULOS_FINANCIEROS_BASE).map(base => {
    const live = recaudacionModulos?.find(m => m.key === base.key)
    const ing = live?.montoAjustado !== undefined ? live.montoAjustado : (live?.monto ?? base.ingresos)
    const gst = Math.round(ing * (base.gastos / base.ingresos))
    const mrg = ing - gst
    const pct = ing > 0 ? Number(((mrg / ing) * 100).toFixed(1)) : base.margenPct
    return {
      ...base,
      ingresos: ing,
      gastos: gst,
      margenNeto: mrg,
      margenPct: pct,
      transacciones: live?.transacciones ?? base.transacciones
    }
  })

  const totalIngresos = listaModulos.reduce((acc, m) => acc + m.ingresos, 0)
  const totalGastos = listaModulos.reduce((acc, m) => acc + m.gastos, 0)
  const totalMargen = totalIngresos - totalGastos
  const totalMargenPct = totalIngresos > 0 ? Number(((totalMargen / totalIngresos) * 100).toFixed(1)) : 0

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* CONTENEDOR AMPLIADO: Tamaño extra grande (max-w-[1550px], w-[96vw], h-[92vh]) para máxima visibilidad */}
      <div 
        className="w-full max-w-[96vw] xl:max-w-7xl 2xl:max-w-[1550px] max-h-[95vh] h-[92vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 ring-1 ring-white/10"
        role="dialog"
        aria-modal="true"
      >
        
        {/* =================================================================== */}
        {/* HEADER DEL MODAL EJECUTIVO                                           */}
        {/* =================================================================== */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg text-white font-black text-xl shrink-0"
              style={{ backgroundColor: mod.color }}
            >
              <DollarSign size={26} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-amber-400">
                  Control Financiero Ejecutivo GRUPO SARA
                </span>
                <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck size={13} /> Sincronizado en Tiempo Real
                </span>
                <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                  Periodo: <strong className="text-amber-300 font-bold">{periodoLabel}</strong>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5 mt-1">
                <span>{mod.name}</span>
                <span className="text-xs font-normal text-slate-400 hidden sm:inline">— {mod.sector}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* BOTÓN DE ACCESO DIRECTO AL PORTAL DEL MÓDULO */}
            <Link
              href={mod.portalUrl}
              target="_blank"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20"
              title={`Ir al portal oficial de ${mod.name}`}
            >
              <span>{mod.portalLabel}</span>
              <ArrowUpRight size={16} />
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-700 cursor-pointer"
              title="Cerrar modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* SUBHEADER: SELECTOR RÁPIDO DE LOS 9 MÓDULOS + CONSOLIDADO           */}
        {/* =================================================================== */}
        <div className="px-6 py-2.5 bg-slate-950/90 border-b border-slate-800 overflow-x-auto flex items-center gap-2 shrink-0 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Layers size={13} className="text-amber-400" /> Unidad:
          </span>
          {listaModulos.map((item) => {
            const isSelected = selectedKey === item.key && activeTab === 'detalle'
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setSelectedKey(item.key)
                  setActiveTab('detalle')
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer border ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg font-black scale-102'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 hover:text-white'
                }`}
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: isSelected ? '#020617' : item.color }} 
                />
                <span>{item.shortName}</span>
                <span className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded ${isSelected ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                  ${(item.ingresos / 1000).toFixed(1)}k
                </span>
              </button>
            )
          })}

          <button
            type="button"
            onClick={() => setActiveTab('comparativo')}
            className={`ml-auto px-4 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer border ${
              activeTab === 'comparativo'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg font-black'
                : 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border-emerald-500/40'
            }`}
          >
            <Sparkles size={14} />
            <span>Matriz Consolidada (9 Módulos)</span>
          </button>
        </div>

        {/* =================================================================== */}
        {/* CUERPO DEL MODAL CON CONTENIDO DINÁMICO & EXPANDIDO                 */}
        {/* =================================================================== */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-7">

          {activeTab === 'detalle' ? (
            <>
              {/* ALERTA DE SINCRONIZACIÓN CLARA DE LECTURA */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>
                    Detalle financiero sincronizado con la tarjeta: <strong className="text-white font-bold">{mod.name}</strong>. Valor recaudado en dashboard: <strong className="text-emerald-400 font-mono font-bold">${mod.ingresos.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</strong>.
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  Conciliación 100% Three-Way Match con Fideicomiso Escrow
                </span>
              </div>

              {/* 1. FILA DE 4 TARJETAS KPI FINANCIERAS DEL MÓDULO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
                
                {/* Ingresos Brutos (Coincide exactamente con la tarjeta del dashboard) */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Ingresos Brutos Recaudados</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                      {mod.tendencia}
                    </span>
                  </div>
                  <div className="text-3xl font-black text-white font-mono tabular-nums">
                    ${mod.ingresos.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                    <TrendingUp size={13} className="text-emerald-400" />
                    <span>{mod.transacciones} operaciones procesadas</span>
                  </div>
                </div>

                {/* Gastos y Costos Directos */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Costos & Gastos Operativos</span>
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 font-mono">
                      {Math.round((mod.gastos / mod.ingresos) * 100)}% de ventas
                    </span>
                  </div>
                  <div className="text-3xl font-black text-rose-300 font-mono tabular-nums">
                    ${mod.gastos.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                    <TrendingDown size={13} className="text-rose-400" />
                    <span>Costos directos, insumos y AIU</span>
                  </div>
                </div>

                {/* Margen Operativo Neto */}
                <div className="bg-slate-950/70 border border-emerald-500/40 rounded-2xl p-5 bg-gradient-to-br from-emerald-950/25 to-slate-950/80 shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Margen Neto (Utilidad)</span>
                    <span className="text-[11px] font-black text-emerald-950 bg-emerald-400 px-2.5 py-0.5 rounded-full font-mono">
                      {mod.margenPct}%
                    </span>
                  </div>
                  <div className="text-3xl font-black text-emerald-300 font-mono tabular-nums">
                    ${mod.margenNeto.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-emerald-400/90 mt-2 flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    <span>ROI del {mod.roi}% sobre inversión</span>
                  </div>
                </div>

                {/* EBITDA & Retenciones SRI */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">EBITDA Estimado</span>
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      SRI 2026
                    </span>
                  </div>
                  <div className="text-3xl font-black text-amber-400 font-mono tabular-nums">
                    ${mod.ebitda.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                    <span>Retenciones IR/IVA:</span>
                    <strong className="text-slate-300 font-mono">${mod.impuestosRetenciones.toLocaleString('en-US')}</strong>
                  </div>
                </div>

              </div>

              {/* 2. FILA DE GRÁFICAS DEL MÓDULO (BARRAS Y DONUT) CON TAMAÑO EXPANDIDO */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Gráfica A: Evolución Histórica Ingresos vs Gastos */}
                <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                        <BarChart3 size={18} className="text-amber-400" />
                        Evolución Mensual: Ingresos vs. Costos (USD)
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">Histórico semestral comparando ingresos brutos y gastos directos</p>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">
                      Mayo - Octubre 2026
                    </span>
                  </div>

                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={mod.historicoMensual}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                        <YAxis 
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                          formatter={(value: any, name: any) => [
                            `$${Number(value).toLocaleString('en-US')} USD`,
                            name === 'ingresos' ? 'Ingresos Brutos' : name === 'gastos' ? 'Gastos & Costos' : 'Margen Neto'
                          ]}
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderRadius: '10px',
                            border: '1px solid #334155',
                            color: '#ffffff',
                            fontSize: '12px'
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                          formatter={(value) => value === 'ingresos' ? 'Ingresos Brutos' : value === 'gastos' ? 'Costos & Gastos' : 'Margen Neto'}
                        />
                        <Bar dataKey="ingresos" fill={mod.color} radius={[5, 5, 0, 0]} name="ingresos" />
                        <Bar dataKey="gastos" fill="#f43f5e" radius={[5, 5, 0, 0]} name="gastos" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Gráfica B: Centros de Costo y Distribución de Gastos */}
                <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                          <PieIcon size={18} className="text-rose-400" />
                          Desglose de Centros de Costos
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">Distribución total de los ${mod.gastos.toLocaleString('en-US')} en egresos</p>
                      </div>
                    </div>

                    <div className="h-48 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={mod.centrosCosto}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={78}
                            paddingAngle={3}
                            dataKey="monto"
                          >
                            {mod.centrosCosto.map((entry, index) => (
                              <Cell key={`pie-costo-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: any, name: any, item: any) => [
                              `$${Number(value).toLocaleString('en-US')} (${item?.payload?.porcentaje}%)`,
                              item?.payload?.nombre
                            ]}
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              borderRadius: '8px',
                              border: '1px solid #334155',
                              color: '#ffffff',
                              fontSize: '12px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Lista de Centros de Costo */}
                  <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
                    {mod.centrosCosto.map((costo, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: costo.color }} />
                          <span className="text-slate-300 truncate">{costo.nombre}</span>
                        </div>
                        <div className="text-right font-mono ml-2 shrink-0">
                          <span className="text-white font-bold">${costo.monto.toLocaleString('en-US')}</span>
                          <span className="text-slate-500 ml-1">({costo.porcentaje}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>

              {/* 3. FILA DE INFORMACIÓN CUALITATIVA & OPERACIONES AUDITADAS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Fuentes de Ingreso Clave */}
                <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-2xl p-6 shadow-lg">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2">
                    <Sparkles size={15} /> Fuentes de Monetización & Captura de Valor
                  </h4>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {mod.fuentesIngresos.map((fuente, i) => (
                      <li key={i} className="flex items-start gap-2.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                        <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{fuente}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Últimas Transacciones Conciliadas */}
                <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <CreditCard size={15} className="text-cyan-400" /> Registro de Operaciones y Conciliación Reciente
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">Últimas 72 Horas</span>
                  </div>

                  <div className="space-y-2.5 overflow-x-auto">
                    {mod.operaciones.map((op) => (
                      <div 
                        key={op.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black font-mono ${
                            op.tipo === 'INGRESO' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {op.tipo === 'INGRESO' ? '+ INGRESO' : '- GASTO'}
                          </span>
                          <div>
                            <div className="font-bold text-white leading-tight">{op.concepto}</div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">Ref: {op.referencia} • {op.fecha}</div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className={`font-black font-mono text-base ${op.tipo === 'INGRESO' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {op.tipo === 'INGRESO' ? '+' : '-'}${op.monto.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                          <span className="inline-block text-[10px] uppercase font-bold text-cyan-400 font-mono bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
                            {op.estado}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </>
          ) : (
            /* =============================================================== */
            /* PESTAÑA COMPARATIVA DE LOS 9 MÓDULOS (MATRIZ GENERAL)          */
            /* =============================================================== */
            <div className="space-y-6">
              {/* Tarjetas de Totales del Ecosistema */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-lg">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ingresos Totales (9 Módulos)</div>
                  <div className="text-3xl font-black text-white font-mono">${totalIngresos.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <div className="text-xs text-emerald-400 mt-1.5 font-semibold">+18.2% vs periodo anterior</div>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-lg">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Gastos Operativos Totales</div>
                  <div className="text-3xl font-black text-rose-400 font-mono">${totalGastos.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <div className="text-xs text-slate-400 mt-1.5 font-semibold">{Math.round((totalGastos / (totalIngresos || 1)) * 100)}% de absorción de ingresos</div>
                </div>
                <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-6 bg-emerald-950/15 shadow-lg">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5">Utilidad Neta Consolidada</div>
                  <div className="text-3xl font-black text-emerald-300 font-mono">${totalMargen.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <div className="text-xs text-emerald-400 mt-1.5 font-bold">Margen Global {totalMargenPct}% EBITDA</div>
                </div>
              </div>

              {/* Matriz Comparativa Detallada */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 shadow-lg overflow-x-auto">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Layers size={16} className="text-amber-400" /> Matriz Financiera por Unidad de Negocio (9 Módulos)
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">Valores en USD con retenciones SRI</span>
                </div>

                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-3">Unidad de Negocio</th>
                      <th className="py-3.5 px-3 text-right">Ingresos</th>
                      <th className="py-3.5 px-3 text-right">Gastos</th>
                      <th className="py-3.5 px-3 text-right">Margen Neto</th>
                      <th className="py-3.5 px-3 text-right">Rentabilidad</th>
                      <th className="py-3.5 px-3 text-right">Ops</th>
                      <th className="py-3.5 px-3 text-center">Acción Directa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {listaModulos.map((m) => (
                      <tr key={m.key} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-3.5 px-3 font-sans font-bold text-white flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                          <span>{m.name}</span>
                        </td>
                        <td className="py-3.5 px-3 text-right text-white font-bold">
                          ${m.ingresos.toLocaleString('en-US')}
                        </td>
                        <td className="py-3.5 px-3 text-right text-rose-300">
                          ${m.gastos.toLocaleString('en-US')}
                        </td>
                        <td className="py-3.5 px-3 text-right text-emerald-400 font-bold">
                          ${m.margenNeto.toLocaleString('en-US')}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                            {m.margenPct}%
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right text-slate-300">
                          {m.transacciones}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedKey(m.key)
                                setActiveTab('detalle')
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-400 text-[11px] font-sans font-bold transition-all border border-amber-500/30 cursor-pointer"
                            >
                              Ver Detalle
                            </button>
                            <Link
                              href={m.portalUrl}
                              target="_blank"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-sans font-bold transition-all border border-slate-700"
                              title={`Abrir portal de ${m.name}`}
                            >
                              <span>Portal</span>
                              <ArrowUpRight size={12} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* =================================================================== */}
        {/* FOOTER DEL MODAL EJECUTIVO                                           */}
        {/* =================================================================== */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
            <span>Gobernanza GRUPO SARA • Cuentas Escrow segregadas bajo supervisión UAFE y SRI Ecuador</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Link
              href={mod.portalUrl}
              target="_blank"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
            >
              <span>{mod.portalLabel}</span>
              <ExternalLink size={14} />
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer border border-slate-700"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
