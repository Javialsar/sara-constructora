'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Warehouse, 
  Package, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RotateCcw, 
  AlertTriangle, 
  FileSpreadsheet, 
  FileText, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Truck, 
  HardHat, 
  Search, 
  Filter, 
  Building2, 
  Calendar, 
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Receipt,
  X,
  Printer,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  CheckSquare,
  Square,
  FileWarning,
  Eye,
  Send,
  Check,
  Star,
  UserCheck,
  DollarSign,
  Activity,
  Database
} from 'lucide-react';
import { exportarAExcel, exportarAPDF } from '@/lib/services/exportReports';
import { 
  ThreeWayMatchService, 
  OrdenDevolucionContable, 
  ItemDevolucionContable 
} from '@/lib/services/threeWayMatchService';
import { SaraFletesSyncService, FleteRecepcionBodega } from '@/lib/services/saraFletesSyncService';
import { SaraDatabaseAuditorService } from '@/lib/services/saraDatabaseAuditorService';
import { SaraDatabaseAuditorModal } from './SaraDatabaseAuditorModal';

// ============================================================================
// TIPOS E INTERFACES DEL MÓDULO DE BODEGA & KARDEX
// ============================================================================
export interface InsumoKardex {
  id: string;
  codigo: string;
  nombre: string;
  categoria: 'ACERO' | 'CEMENTO' | 'ARIDOS' | 'MAMPOSTERIA' | 'HORMIGON' | 'TUBERIA';
  unidad: string;
  stockActual: number;
  stockSeguridad: number;
  puntoReorden: number;
  cppActual: number; // Costo Promedio Ponderado en USD
  bodegaUbicacion: string;
  lote: string;
}

export interface MovimientoKardex {
  id: string;
  insumoId: string;
  fecha: string;
  hora: string;
  tipo: 'RECEPCION_OC' | 'DESPACHO_OBRA' | 'DEVOLUCION_PROVEEDOR' | 'AJUSTE_MERMA';
  documentoRef: string;
  solicitanteOProveedor: string;
  proyectoDestino?: string;
  entradaCant: number;
  entradaCostoUnit: number;
  entradaTotal: number;
  salidaCant: number;
  salidaCostoUnit: number;
  salidaTotal: number;
  saldoCant: number;
  saldoCpp: number;
  saldoTotal: number;
  observacion?: string;
}

export interface OrdenCompraItem {
  id: string;
  insumoId: string;
  codigo: string;
  insumoNombre: string;
  unidad: string;
  cantidadPedida: number;
  cantidadRecibida: number;
  cantidadFaltante: number;
  cantidadDefectuosa: number;
  motivoDefecto: string;
  costoUnitario: number;
  subtotal: number;
}

export interface OrdenCompraRecepcion {
  id: string;
  numeroOC: string;
  proveedor: string;
  rucProveedor: string;
  fechaEmision: string;
  estado: 'PENDIENTE_RECEPCION' | 'RECEPCION_PARCIAL' | 'RECEPCION_COMPLETA' | 'CON_DEVOLUCION';
  totalMontoOC: number;
  transportistaDefault: string;
  placaDefault: string;
  guiaRemisionDefault: string;
  items: OrdenCompraItem[];
}

export interface ValeDespacho {
  id: string;
  numeroVale: string;
  fecha: string;
  hora: string;
  proyectoDestino: string;
  solicitadoPor: string;
  cargoSolicitante: string;
  transportista: string;
  placaVehiculo: string;
  insumoNombre: string;
  cantidad: number;
  unidad: string;
  costoUnitarioCpp: number;
  costoTotalImputado: number;
  motivoImputacion: string;
  estadoLegalizacion: 'LEGALIZADO' | 'PENDIENTE_FIRMA';
}

export interface OrdenDevolucion {
  id: string;
  numeroDevolucion: string;
  numeroOCReferencia: string;
  proveedor: string;
  fecha: string;
  insumoNombre: string;
  cantidadDevuelta: number;
  unidad: string;
  motivo: 'MATERIAL_DEFECTUOSO' | 'CANTIDAD_INCOMPLETA' | 'HUMEDAD_FRAGUADO' | 'NO_CUMPLE_NEC';
  observacion: string;
  responsableBodega: string;
  totalDescuentoUSD?: number;
}

export function BodegaKardexSection({ user }: { user: any }) {
  const [activeSubTab, setActiveSubTab] = useState<'kardex' | 'recepcion' | 'despacho' | 'stock_critico' | 'mermas'>('kardex');
  const [selectedInsumoId, setSelectedInsumoId] = useState<string>('cemento_holcim');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para Filtros Avanzados de Kardex (Imagen 3: Todos, Por Categorías, Por Proveedores, Por Proyecto)
  type FiltroKardexTipo = 'todos' | 'categoria' | 'proveedor' | 'proyecto';
  const [modoFiltroKardex, setModoFiltroKardex] = useState<FiltroKardexTipo>('todos');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('TODAS');
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<string>('TODOS');
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<string>('TODOS');
  const [vistaKardexConsolidada, setVistaKardexConsolidada] = useState<boolean>(false);

  // Sub-vista dentro de Recepción
  const [subVistaRecepcion, setSubVistaRecepcion] = useState<'ordenes' | 'devoluciones'>('ordenes');
  const [expandedOcId, setExpandedOcId] = useState<string | null>('OC-2026-092');

  // Modales
  const [modalNuevoDespacho, setModalNuevoDespacho] = useState(false);
  const [modalRecepcionChecklist, setModalRecepcionChecklist] = useState(false);
  const [modalDevolucion, setModalDevolucion] = useState(false);
  const [modalDetalleDevolucion, setModalDetalleDevolucion] = useState<OrdenDevolucionContable | null>(null);

  // OC seleccionada para el Checklist de Recepción
  const [selectedOCForRecepcion, setSelectedOCForRecepcion] = useState<OrdenCompraRecepcion | null>(null);

  // Borrador del Checklist de Recepción (ítem por ítem)
  const [checklistDraft, setChecklistDraft] = useState<Record<string, {
    verificado: boolean;
    cantRecibida: number;
    cantFaltante: number;
    cantDefectuosa: number;
    motivoDefecto: string;
  }>>({});

  // Modal del Agente Auditor de Base de Datos
  const [auditorModalOpen, setAuditorModalOpen] = useState(false);

  // Datos del Transportista, Vehículo y Calificación en el Checklist (Sincronizado con SARA Fletes)
  const [transportistaChecklist, setTransportistaChecklist] = useState<{
    chofer: string;
    cedulaLicencia: string;
    telefono: string;
    placa: string;
    tipoVehiculo: string;
    empresaTransporte: string;
    guiaRemision: string;
    calificacionEstrellas: number;
    evaluacionPuntualidad: 'EXCELENTE_A_TIEMPO' | 'DEMORA_JUSTIFICADA' | 'RETRASO_CRITICO';
    evaluacionCarga: 'IMPECABLE' | 'CON_AVERIA_LEVE' | 'DANADA_EN_TRANSITO';
    autorizacionPagoFlete: 'APROBADO_PAGO_INMEDIATO' | 'RETENCION_PARCIAL' | 'BLOQUEADO_POR_DISCREPANCIA';
    tarifaFleteUSD: number;
    observacionesFlete: string;
    observaciones?: string;
  }>({
    chofer: 'Klever Mora Carrión',
    cedulaLicencia: '1103849182 (Licencia Tipo E - Pesado)',
    telefono: '+593 99 384 1928',
    placa: 'LAA-3021',
    tipoVehiculo: 'Camión Plataforma 18T',
    empresaTransporte: 'Transportes Pesados del Austro Cía. Ltda.',
    guiaRemision: 'GR-002-001-00045892',
    calificacionEstrellas: 5,
    evaluacionPuntualidad: 'EXCELENTE_A_TIEMPO',
    evaluacionCarga: 'IMPECABLE',
    autorizacionPagoFlete: 'APROBADO_PAGO_INMEDIATO',
    tarifaFleteUSD: 280.00,
    observacionesFlete: 'Conductor entregó carga con precinto intacto y estibado correcto. Aprobado para cancelar flete.',
    observaciones: '',
  });

  // Notificación / Banner de feedback en bodega
  const [feedbackBanner, setFeedbackBanner] = useState<{
    tipo: 'EXITO' | 'DISCREPANCIA';
    mensaje: string;
    devolucionId?: string;
  } | null>(null);

  // Form states para nuevo despacho
  const [despachoForm, setDespachoForm] = useState({
    insumoId: 'cemento_holcim',
    cantidad: 150,
    proyectoDestino: 'Torre SARA Loja (Pisos 4-8)',
    solicitadoPor: 'Ing. David Sarango (Residente de Obra)',
    transportista: 'Manuel Carrión (Volqueta Hino H-14)',
    placaVehiculo: 'LBA-4589',
    motivoImputacion: 'Vaciado de losa Nivel 4',
  });

  // Form states para devolución manual
  const [devolucionForm, setDevolucionForm] = useState({
    numeroOC: 'OC-2026-084',
    proveedor: 'ADELCA ACEROS DEL ECUADOR C.A.',
    insumoNombre: 'Varilla Acero Adelca 12mm x 12m',
    cantidadDevuelta: 450,
    motivo: 'MATERIAL_DEFECTUOSO' as const,
    observacion: 'Varillas con torsión excesiva y oxidación superficial fuera de norma NEC-SE-HM.',
  });

  // ============================================================================
  // CATÁLOGO DE INSUMOS DE BODEGA CENTRAL
  // ============================================================================
  const [insumos, setInsumos] = useState<InsumoKardex[]>([
    {
      id: 'cemento_holcim',
      codigo: 'INS-CEM-001',
      nombre: 'Cemento Holcim Fuerte 50kg',
      categoria: 'CEMENTO',
      unidad: 'Saco',
      stockActual: 85, // CRÍTICO: ROP = 300
      stockSeguridad: 150,
      puntoReorden: 300,
      cppActual: 7.45,
      bodegaUbicacion: 'Bodega Matriz - Nave A (Pallet 1-4)',
      lote: 'LOT-HOLCIM-2026-B8',
    },
    {
      id: 'acero_adelca_12',
      codigo: 'INS-ACE-012',
      nombre: 'Varilla Acero Corrugado Adelca 12mm x 12m',
      categoria: 'ACERO',
      unidad: 'kg',
      stockActual: 24500,
      stockSeguridad: 5000,
      puntoReorden: 8500,
      cppActual: 1.18,
      bodegaUbicacion: 'Bodega Matriz - Patio de Metales Patio 2',
      lote: 'LOT-ADELCA-2026-X1',
    },
    {
      id: 'arena_gruesa',
      codigo: 'INS-ARI-003',
      nombre: 'Arena Gruesa de Mina Lavada',
      categoria: 'ARIDOS',
      unidad: 'm³',
      stockActual: 18, // CRÍTICO: ROP = 40
      stockSeguridad: 20,
      puntoReorden: 40,
      cppActual: 14.50,
      bodegaUbicacion: 'Acopio Exterior - Silo Áridos 1',
      lote: 'MINA-CATAMAYO-2026',
    },
    {
      id: 'bloque_15',
      codigo: 'INS-MAM-015',
      nombre: 'Bloque Alivianado Prensado 15x20x40',
      categoria: 'MAMPOSTERIA',
      unidad: 'Unidad',
      stockActual: 6200,
      stockSeguridad: 1500,
      puntoReorden: 3000,
      cppActual: 0.48,
      bodegaUbicacion: 'Bodega Matriz - Nave B (Pilas 1-8)',
      lote: 'BLOQUERA-LOJA-LOT-3',
    },
    {
      id: 'hormigon_210',
      codigo: 'INS-HOR-210',
      nombre: 'Hormigón Premezclado f\'c=210 kg/cm²',
      categoria: 'HORMIGON',
      unidad: 'm³',
      stockActual: 65,
      stockSeguridad: 20,
      puntoReorden: 45,
      cppActual: 94.50,
      bodegaUbicacion: 'Despacho Directo Planta Mixer',
      lote: 'MIX-210-BATCH-12',
    },
    {
      id: 'tuberia_pvc_110',
      codigo: 'INS-TUB-110',
      nombre: 'Tubo PVC Sanitario Reforzado 110mm x 3m',
      categoria: 'TUBERIA',
      unidad: 'Tubo',
      stockActual: 120,
      stockSeguridad: 40,
      puntoReorden: 80,
      cppActual: 11.20,
      bodegaUbicacion: 'Bodega Matriz - Nave A (Estantería E-3)',
      lote: 'PLASTIGAMA-2026-Q1',
    },
  ]);

  // ============================================================================
  // MOVIMIENTOS HISTÓRICOS DE KARDEX
  // ============================================================================
  const [movimientos, setMovimientos] = useState<MovimientoKardex[]>([
    {
      id: 'MOV-001',
      insumoId: 'cemento_holcim',
      fecha: '2026-10-14',
      hora: '08:30',
      tipo: 'RECEPCION_OC',
      documentoRef: 'OC-2026-079 / Fact. 001-002-000849301',
      solicitanteOProveedor: 'HOLCIM DISTRIBUCION INDUSTRIAL',
      entradaCant: 1000,
      entradaCostoUnit: 7.40,
      entradaTotal: 7400.00,
      salidaCant: 0,
      salidaCostoUnit: 0,
      salidaTotal: 0,
      saldoCant: 1000,
      saldoCpp: 7.40,
      saldoTotal: 7400.00,
      observacion: 'Ingreso inicial por orden de compra programada',
    },
    {
      id: 'MOV-002',
      insumoId: 'cemento_holcim',
      fecha: '2026-10-15',
      hora: '11:15',
      tipo: 'DESPACHO_OBRA',
      documentoRef: 'VALE-OBRA-2026-112',
      solicitanteOProveedor: 'Ing. David Sarango',
      proyectoDestino: 'Torre SARA Loja (Pisos 1-3)',
      entradaCant: 0,
      entradaCostoUnit: 0,
      entradaTotal: 0,
      salidaCant: 450,
      salidaCostoUnit: 7.40,
      salidaTotal: 3330.00,
      saldoCant: 550,
      saldoCpp: 7.40,
      saldoTotal: 4070.00,
      observacion: 'Despacho para cimentación y zapatas aisladas',
    },
    {
      id: 'MOV-003',
      insumoId: 'cemento_holcim',
      fecha: '2026-10-16',
      hora: '14:20',
      tipo: 'RECEPCION_OC',
      documentoRef: 'OC-2026-088 / Fact. 001-002-000851120',
      solicitanteOProveedor: 'HOLCIM DISTRIBUCION INDUSTRIAL',
      entradaCant: 300,
      entradaCostoUnit: 7.55,
      entradaTotal: 2265.00,
      salidaCant: 0,
      salidaCostoUnit: 0,
      salidaTotal: 0,
      saldoCant: 850,
      saldoCpp: 7.4529, // Recálculo CPP en vivo
      saldoTotal: 6335.00,
      observacion: 'Incremento de precio facturado por alza de flete',
    },
    {
      id: 'MOV-004',
      insumoId: 'cemento_holcim',
      fecha: '2026-10-17',
      hora: '09:40',
      tipo: 'DESPACHO_OBRA',
      documentoRef: 'VALE-OBRA-2026-121',
      solicitanteOProveedor: 'Mtro. Carlos Guamán',
      proyectoDestino: 'Residencial Cariamanga Plaza',
      entradaCant: 0,
      entradaCostoUnit: 0,
      entradaTotal: 0,
      salidaCant: 750,
      salidaCostoUnit: 7.45,
      salidaTotal: 5587.50,
      saldoCant: 100,
      saldoCpp: 7.45,
      saldoTotal: 745.00,
      observacion: 'Despacho masivo para losa de entrepiso bloque A',
    },
    {
      id: 'MOV-005',
      insumoId: 'cemento_holcim',
      fecha: '2026-10-18',
      hora: '10:00',
      tipo: 'AJUSTE_MERMA',
      documentoRef: 'MERMA-FISCALIZA-004',
      solicitanteOProveedor: 'Auditoría Fiscalización Obra',
      entradaCant: 0,
      entradaCostoUnit: 0,
      entradaTotal: 0,
      salidaCant: 15,
      salidaCostoUnit: 7.45,
      salidaTotal: 111.75,
      saldoCant: 85,
      saldoCpp: 7.45,
      saldoTotal: 633.25,
      observacion: 'Rotura de sacos por manipulación de estiba (Merma 1.5% dentro de tolerancia)',
    },
    // Movimiento para Acero
    {
      id: 'MOV-006',
      insumoId: 'acero_adelca_12',
      fecha: '2026-10-16',
      hora: '08:00',
      tipo: 'RECEPCION_OC',
      documentoRef: 'OC-2026-084 / Fact. 001-001-000045892',
      solicitanteOProveedor: 'ADELCA ACEROS DEL ECUADOR C.A.',
      entradaCant: 27000,
      entradaCostoUnit: 1.18,
      entradaTotal: 31860.00,
      salidaCant: 0,
      salidaCostoUnit: 0,
      salidaTotal: 0,
      saldoCant: 27000,
      saldoCpp: 1.18,
      saldoTotal: 31860.00,
      observacion: 'Recepción completa de 2,250 barras de 12m',
    },
    {
      id: 'MOV-007',
      insumoId: 'acero_adelca_12',
      fecha: '2026-10-17',
      hora: '15:30',
      tipo: 'DESPACHO_OBRA',
      documentoRef: 'VALE-OBRA-2026-125',
      solicitanteOProveedor: 'Ing. David Sarango',
      proyectoDestino: 'Residencial Cariamanga Plaza',
      entradaCant: 0,
      entradaCostoUnit: 0,
      entradaTotal: 0,
      salidaCant: 2500,
      salidaCostoUnit: 1.18,
      salidaTotal: 2950.00,
      saldoCant: 24500,
      saldoCpp: 1.18,
      saldoTotal: 28910.00,
      observacion: 'Despacho de varilla para armado de columnas C1-C6',
    },
  ]);

  // ============================================================================
  // ÓRDENES DE COMPRA EN BODEGA PARA RECEPCIÓN (CON MÚLTIPLES PRODUCTOS)
  // ============================================================================
  const [ordenesCompra, setOrdenesCompra] = useState<OrdenCompraRecepcion[]>([
    {
      id: 'OC-2026-092',
      numeroOC: 'OC-2026-092',
      proveedor: 'HOLCIM ECUADOR S.A.',
      rucProveedor: '0990004589001',
      fechaEmision: '2026-10-18',
      estado: 'PENDIENTE_RECEPCION',
      totalMontoOC: 9820.00,
      transportistaDefault: 'Manuel Carrión (Transportes del Austro Cía. Ltda.)',
      placaDefault: 'LBA-4589',
      guiaRemisionDefault: 'GR-001-002-00054812',
      items: [
        {
          id: 'IT-092-1',
          insumoId: 'cemento_holcim',
          codigo: 'INS-CEM-001',
          insumoNombre: 'Cemento Holcim Fuerte 50kg',
          unidad: 'Saco',
          cantidadPedida: 800,
          cantidadRecibida: 0,
          cantidadFaltante: 0,
          cantidadDefectuosa: 0,
          motivoDefecto: '',
          costoUnitario: 7.45,
          subtotal: 5960.00,
        },
        {
          id: 'IT-092-2',
          insumoId: 'cemento_holcim',
          codigo: 'INS-CEM-002',
          insumoNombre: 'Cemento Holcim Extraval 50kg Especial',
          unidad: 'Saco',
          cantidadPedida: 250,
          cantidadRecibida: 0,
          cantidadFaltante: 0,
          cantidadDefectuosa: 0,
          motivoDefecto: '',
          costoUnitario: 7.80,
          subtotal: 1950.00,
        },
        {
          id: 'IT-092-3',
          insumoId: 'cemento_holcim',
          codigo: 'INS-ADI-004',
          insumoNombre: 'Aditivo Plastificante Plastocrete DM Sika/Holcim',
          unidad: 'Galón',
          cantidadPedida: 40,
          cantidadRecibida: 0,
          cantidadFaltante: 0,
          cantidadDefectuosa: 0,
          motivoDefecto: '',
          costoUnitario: 18.50,
          subtotal: 740.00,
        },
        {
          id: 'IT-092-4',
          insumoId: 'cemento_holcim',
          codigo: 'INS-MOR-001',
          insumoNombre: 'Mortero Seco Listo Albañilería 40kg',
          unidad: 'Saco',
          cantidadPedida: 250,
          cantidadRecibida: 0,
          cantidadFaltante: 0,
          cantidadDefectuosa: 0,
          motivoDefecto: '',
          costoUnitario: 4.68,
          subtotal: 1170.00,
        }
      ]
    },
    {
      id: 'OC-2026-084',
      numeroOC: 'OC-2026-084',
      proveedor: 'ADELCA ACEROS DEL ECUADOR C.A.',
      rucProveedor: '1790012345001',
      fechaEmision: '2026-10-16',
      estado: 'RECEPCION_COMPLETA',
      totalMontoOC: 57970.00,
      transportistaDefault: 'Klever Mora (Camión Plataforma 18T)',
      placaDefault: 'LAA-3021',
      guiaRemisionDefault: 'GR-002-001-00045892',
      items: [
        {
          id: 'IT-084-1',
          insumoId: 'acero_adelca_12',
          codigo: 'INS-ACE-012',
          insumoNombre: 'Varilla Acero Adelca Corrugado 12mm x 12m',
          unidad: 'kg',
          cantidadPedida: 27000,
          cantidadRecibida: 27000,
          cantidadFaltante: 0,
          cantidadDefectuosa: 0,
          motivoDefecto: '',
          costoUnitario: 1.18,
          subtotal: 31860.00,
        },
        {
          id: 'IT-084-2',
          insumoId: 'acero_adelca_12',
          codigo: 'INS-ACE-010',
          insumoNombre: 'Varilla Acero Adelca Corrugado 10mm x 12m',
          unidad: 'kg',
          cantidadPedida: 15000,
          cantidadRecibida: 15000,
          cantidadFaltante: 0,
          cantidadDefectuosa: 0,
          motivoDefecto: '',
          costoUnitario: 1.20,
          subtotal: 18000.00,
        },
        {
          id: 'IT-084-3',
          insumoId: 'acero_adelca_12',
          codigo: 'INS-ALA-018',
          insumoNombre: 'Alambre Recocido #18 para Amarre de Hierro',
          unidad: 'kg',
          cantidadPedida: 1200,
          cantidadRecibida: 1200,
          cantidadFaltante: 0,
          cantidadDefectuosa: 0,
          motivoDefecto: '',
          costoUnitario: 1.45,
          subtotal: 1740.00,
        },
        {
          id: 'IT-084-4',
          insumoId: 'acero_adelca_12',
          codigo: 'INS-MAL-188',
          insumoNombre: 'Malla Electrosoldada R-188 6x2.40m para Losa',
          unidad: 'Plancha',
          cantidadPedida: 260,
          cantidadRecibida: 260,
          cantidadFaltante: 0,
          cantidadDefectuosa: 0,
          motivoDefecto: '',
          costoUnitario: 24.50,
          subtotal: 6370.00,
        }
      ]
    },
    {
      id: 'OC-2026-105',
      numeroOC: 'OC-2026-105',
      proveedor: 'CANTERA & MATERIALES SUR LOJA CÍA. LTDA.',
      rucProveedor: '1190045612001',
      fechaEmision: '2026-10-18',
      estado: 'PENDIENTE_RECEPCION',
      totalMontoOC: 2977.00,
      transportistaDefault: 'Hernán Poma (Volqueta 14m³)',
      placaDefault: 'LBA-5510',
      guiaRemisionDefault: 'GR-003-001-00018471',
      items: [
        {
          id: 'IT-105-1',
          insumoId: 'arena_gruesa',
          codigo: 'INS-ARI-003',
          insumoNombre: 'Arena Gruesa de Mina Lavada para Hormigón',
          unidad: 'm³',
          cantidadPedida: 50,
          cantidadRecibida: 0,
          cantidadFaltante: 0,
          cantidadDefectuosa: 0,
          motivoDefecto: '',
          costoUnitario: 14.50,
          subtotal: 725.00,
        },
        {
          id: 'IT-105-2',
          insumoId: 'arena_gruesa',
          codigo: 'INS-ARI-004',
          insumoNombre: 'Ripio Triturado de Cantera 3/4"',
          unidad: 'm³',
          cantidadPedida: 45,
          cantidadRecibida: 0,
          cantidadFaltante: 0,
          cantidadDefectuosa: 0,
          motivoDefecto: '',
          costoUnitario: 16.00,
          subtotal: 720.00,
        },
        {
          id: 'IT-105-3',
          insumoId: 'acero_adelca_12',
          codigo: 'INS-CLA-025',
          insumoNombre: 'Clavos de Acero 2.5" con Cabeza (Encofrado)',
          unidad: 'kg',
          cantidadPedida: 120,
          cantidadRecibida: 0,
          cantidadFaltante: 0,
          cantidadDefectuosa: 0,
          motivoDefecto: '',
          costoUnitario: 1.85,
          subtotal: 222.00,
        },
        {
          id: 'IT-105-4',
          insumoId: 'tuberia_pvc_110',
          codigo: 'INS-TUB-110',
          insumoNombre: 'Tubo PVC Sanitario Reforzado 110mm x 3m',
          unidad: 'Tubo',
          cantidadPedida: 100,
          cantidadRecibida: 0,
          cantidadFaltante: 0,
          cantidadDefectuosa: 0,
          motivoDefecto: '',
          costoUnitario: 11.20,
          subtotal: 1120.00,
        },
        {
          id: 'IT-105-5',
          insumoId: 'tuberia_pvc_110',
          codigo: 'INS-PEG-025',
          insumoNombre: 'Pegamento PVC Soldadura Líquida 1/4 Galón',
          unidad: 'Tarro',
          cantidadPedida: 20,
          cantidadRecibida: 0,
          cantidadFaltante: 0,
          cantidadDefectuosa: 0,
          motivoDefecto: '',
          costoUnitario: 9.50,
          subtotal: 190.00,
        }
      ]
    }
  ]);

  // ============================================================================
  // VALES DE SALIDA / DESPACHOS A FRENTES DE OBRA
  // ============================================================================
  const [valesDespacho, setValesDespacho] = useState<ValeDespacho[]>([
    {
      id: 'VALE-001',
      numeroVale: 'VALE-OBRA-2026-125',
      fecha: '2026-10-17',
      hora: '15:30',
      proyectoDestino: 'Residencial Cariamanga Plaza',
      solicitadoPor: 'Ing. David Sarango (Residente)',
      cargoSolicitante: 'Director de Obra',
      transportista: 'Klever Mora (Camión Plataforma 18T)',
      placaVehiculo: 'LAA-3021',
      insumoNombre: 'Varilla Acero Adelca 12mm x 12m',
      cantidad: 2500,
      unidad: 'kg',
      costoUnitarioCpp: 1.18,
      costoTotalImputado: 2950.00,
      motivoImputacion: 'Armado de canastillas y columnas Nivel 2',
      estadoLegalizacion: 'LEGALIZADO',
    },
    {
      id: 'VALE-002',
      numeroVale: 'VALE-OBRA-2026-121',
      fecha: '2026-10-17',
      hora: '09:40',
      proyectoDestino: 'Residencial Cariamanga Plaza',
      solicitadoPor: 'Mtro. Carlos Guamán (Maestro Mayor)',
      cargoSolicitante: 'Maestro General de Obra',
      transportista: 'Hernán Poma (Volqueta 14m³)',
      placaVehiculo: 'LBA-5510',
      insumoNombre: 'Cemento Holcim Fuerte 50kg',
      cantidad: 750,
      unidad: 'Sacos',
      costoUnitarioCpp: 7.45,
      costoTotalImputado: 5587.50,
      motivoImputacion: 'Fundición losa de entrepiso Bloque A',
      estadoLegalizacion: 'LEGALIZADO',
    },
    {
      id: 'VALE-003',
      numeroVale: 'VALE-OBRA-2026-112',
      fecha: '2026-10-15',
      hora: '11:15',
      proyectoDestino: 'Torre SARA Loja (Pisos 1-3)',
      solicitadoPor: 'Ing. David Sarango (Residente)',
      cargoSolicitante: 'Director de Obra',
      transportista: 'Manuel Carrión (Volqueta Hino)',
      placaVehiculo: 'LBA-4589',
      insumoNombre: 'Cemento Holcim Fuerte 50kg',
      cantidad: 450,
      unidad: 'Sacos',
      costoUnitarioCpp: 7.40,
      costoTotalImputado: 3330.00,
      motivoImputacion: 'Zapatas aisladas y vigas de amarre',
      estadoLegalizacion: 'LEGALIZADO',
    }
  ]);

  // ============================================================================
  // ÓRDENES DE DEVOLUCIÓN A PROVEEDOR (SINCRONIZADAS CON CONTABILIDAD)
  // ============================================================================
  const [ordenesDevolucion, setOrdenesDevolucion] = useState<OrdenDevolucionContable[]>([]);

  useEffect(() => {
    // Sincronizar devoluciones con el servicio contable
    setOrdenesDevolucion(ThreeWayMatchService.getDevoluciones());
  }, []);

  // ----------------------------------------------------------------------------
  // LISTAS DE FILTRADO PARA KARDEX (IMAGEN 3)
  // ----------------------------------------------------------------------------
  const categoriasKardex = [
    { id: 'TODAS', label: 'Todas las Familias', icon: '📦' },
    { id: 'CEMENTO', label: 'Cementos & Aglomerantes', icon: '🧱' },
    { id: 'ACERO', label: 'Aceros & Mallas', icon: '🔩' },
    { id: 'ARIDOS', label: 'Áridos & Minas', icon: '🏔️' },
    { id: 'MAMPOSTERIA', label: 'Mampostería & Bloques', icon: '🧱' },
    { id: 'HORMIGON', label: 'Hormigones & Mixers', icon: '🚛' },
    { id: 'TUBERIA', label: 'Tuberías & Accesorios', icon: '🔧' },
  ];

  const proveedoresKardex: { id: string; nombre: string; ruc?: string }[] = [
    { id: 'TODOS', nombre: 'Todos los Proveedores' },
    { id: 'HOLCIM ECUADOR S.A.', nombre: 'HOLCIM ECUADOR S.A.', ruc: '0990004589001' },
    { id: 'ADELCA ACEROS DEL ECUADOR C.A.', nombre: 'ADELCA ACEROS DEL ECUADOR C.A.', ruc: '1790012345001' },
    { id: 'CANTERA & MATERIALES SUR LOJA CÍA. LTDA.', nombre: 'CANTERA & MATERIALES SUR LOJA', ruc: '1190045612001' },
    { id: 'INDUSTRIA BLOQUERA LOJANA CÍA. LTDA.', nombre: 'INDUSTRIA BLOQUERA LOJANA', ruc: '1190054321001' },
    { id: 'HORMIGONERA SUR ECUADOR HORMISUR', nombre: 'HORMIGONERA SUR ECUADOR', ruc: '1190088990001' },
    { id: 'RIVAL TUBERÍAS & PLASTIGAMA', nombre: 'RIVAL TUBERÍAS & PLASTIGAMA', ruc: '0190022334001' },
  ];

  const proyectosKardex = [
    { id: 'TODOS', nombre: 'Todos los Proyectos / Obras' },
    { id: 'Torre SARA Loja (Pisos 1-3)', nombre: 'Torre SARA Loja (Pisos 1-3)' },
    { id: 'Torre SARA Loja (Pisos 4-8)', nombre: 'Torre SARA Loja (Pisos 4-8)' },
    { id: 'Residencial Cariamanga Plaza', nombre: 'Residencial Cariamanga Plaza' },
    { id: 'Edificio Residencial El Mirador', nombre: 'Edificio Residencial El Mirador' },
    { id: 'Conjunto Habitacional Las Acacias', nombre: 'Conjunto Habitacional Las Acacias' },
  ];

  // Insumos filtrados dinámicamente según la opción elegida (Imagen 3)
  const insumosFiltrados = useMemo(() => {
    return insumos.filter(ins => {
      if (modoFiltroKardex === 'categoria') {
        if (categoriaSeleccionada !== 'TODAS' && ins.categoria !== categoriaSeleccionada) {
          return false;
        }
      } else if (modoFiltroKardex === 'proveedor') {
        if (proveedorSeleccionado !== 'TODOS') {
          const provUpper = proveedorSeleccionado.toUpperCase();
          const tieneOC = ordenesCompra.some(oc => 
            oc.proveedor.toUpperCase().includes(provUpper) &&
            oc.items.some(it => it.insumoId === ins.id)
          );
          const tieneMov = movimientos.some(m => 
            m.insumoId === ins.id && 
            m.solicitanteOProveedor.toUpperCase().includes(provUpper)
          );
          const esProvHolcim = provUpper.includes('HOLCIM') && ins.id === 'cemento_holcim';
          const esProvAdelca = provUpper.includes('ADELCA') && ins.id === 'acero_adelca_12';
          const esProvCantera = provUpper.includes('CANTERA') && ins.id === 'arena_gruesa';
          const esProvBloque = provUpper.includes('BLOQUERA') && ins.id === 'bloque_15';
          const esProvHormigon = provUpper.includes('HORMIGONERA') && ins.id === 'hormigon_210';
          const esProvTuberia = provUpper.includes('RIVAL') && ins.id === 'tuberia_pvc_110';
          if (!tieneOC && !tieneMov && !esProvHolcim && !esProvAdelca && !esProvCantera && !esProvBloque && !esProvHormigon && !esProvTuberia) {
            return false;
          }
        }
      } else if (modoFiltroKardex === 'proyecto') {
        if (proyectoSeleccionado !== 'TODOS') {
          const proyUpper = proyectoSeleccionado.toUpperCase();
          const tieneSalidaAProyecto = movimientos.some(m => 
            m.insumoId === ins.id && 
            m.proyectoDestino && 
            m.proyectoDestino.toUpperCase().includes(proyUpper)
          );
          if (!tieneSalidaAProyecto) {
            return false;
          }
        }
      }
      return true;
    });
  }, [insumos, modoFiltroKardex, categoriaSeleccionada, proveedorSeleccionado, proyectoSeleccionado, ordenesCompra, movimientos]);

  // Si el insumo seleccionado ya no está en la lista filtrada, seleccionar el primero disponible
  useEffect(() => {
    if (insumosFiltrados.length > 0 && !insumosFiltrados.some(i => i.id === selectedInsumoId)) {
      setSelectedInsumoId(insumosFiltrados[0].id);
    }
  }, [insumosFiltrados, selectedInsumoId]);

  // Insumo actualmente seleccionado en el Kardex
  const currentInsumo = insumos.find(i => i.id === selectedInsumoId) || insumosFiltrados[0] || insumos[0];
  const currentMovimientos = movimientos.filter(m => m.insumoId === currentInsumo.id);

  // Insumos que están por agotarse
  const insumosCriticos = insumos.filter(i => i.stockActual <= i.puntoReorden);

  // Valor total valorizado en Bodega Central
  const valorTotalBodega = insumos.reduce((acc, i) => acc + (i.stockActual * i.cppActual), 0);

  // ============================================================================
  // HANDLERS DE OPERACIONES DE BODEGA
  // ============================================================================
  
  // 1. Despachar mercadería a frentes de obra
  const handleCrearDespacho = (e: React.FormEvent) => {
    e.preventDefault();
    if (despachoForm.cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }

    const targetInsumo = insumos.find(i => i.id === despachoForm.insumoId);
    if (!targetInsumo) return;

    if (despachoForm.cantidad > targetInsumo.stockActual) {
      alert(`Stock insuficiente en Bodega Central. Disponible: ${targetInsumo.stockActual} ${targetInsumo.unidad}`);
      return;
    }

    const nuevoValeNumero = `VALE-OBRA-2026-${valesDespacho.length + 128}`;
    const costoImputado = despachoForm.cantidad * targetInsumo.cppActual;

    const nuevoVale: ValeDespacho = {
      id: `VALE-${Date.now()}`,
      numeroVale: nuevoValeNumero,
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
      proyectoDestino: despachoForm.proyectoDestino,
      solicitadoPor: despachoForm.solicitadoPor,
      cargoSolicitante: 'Ingeniero Residente Legalizado',
      transportista: despachoForm.transportista,
      placaVehiculo: despachoForm.placaVehiculo,
      insumoNombre: targetInsumo.nombre,
      cantidad: despachoForm.cantidad,
      unidad: targetInsumo.unidad,
      costoUnitarioCpp: targetInsumo.cppActual,
      costoTotalImputado: costoImputado,
      motivoImputacion: despachoForm.motivoImputacion,
      estadoLegalizacion: 'LEGALIZADO',
    };

    // Actualizar Saldo en Insumos
    setInsumos(prev => prev.map(i => {
      if (i.id === targetInsumo.id) {
        return { ...i, stockActual: i.stockActual - despachoForm.cantidad };
      }
      return i;
    }));

    // Registrar Movimiento de Salida en Kardex
    const nuevoMov: MovimientoKardex = {
      id: `MOV-${Date.now()}`,
      insumoId: targetInsumo.id,
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
      tipo: 'DESPACHO_OBRA',
      documentoRef: nuevoValeNumero,
      solicitanteOProveedor: despachoForm.solicitadoPor,
      proyectoDestino: despachoForm.proyectoDestino,
      entradaCant: 0,
      entradaCostoUnit: 0,
      entradaTotal: 0,
      salidaCant: despachoForm.cantidad,
      salidaCostoUnit: targetInsumo.cppActual,
      salidaTotal: costoImputado,
      saldoCant: targetInsumo.stockActual - despachoForm.cantidad,
      saldoCpp: targetInsumo.cppActual,
      saldoTotal: (targetInsumo.stockActual - despachoForm.cantidad) * targetInsumo.cppActual,
      observacion: `Despacho a ${despachoForm.proyectoDestino}: ${despachoForm.motivoImputacion}`,
    };

    setMovimientos(prev => [nuevoMov, ...prev]);
    setValesDespacho(prev => [nuevoVale, ...prev]);
    setModalNuevoDespacho(false);
    alert(`¡Vale ${nuevoValeNumero} generado y legalizado exitosamente!`);
  };

  // 2. Generar Orden de Devolución por Material Defectuoso o Faltante
  const handleCrearDevolucion = (e: React.FormEvent) => {
    e.preventDefault();
    if (devolucionForm.cantidadDevuelta <= 0) {
      alert('La cantidad devuelta debe ser mayor a 0');
      return;
    }

    const numDevolucion = `DEV-PROV-2026-${ordenesDevolucion.length + 15}`;
    const nuevaDev: OrdenDevolucion = {
      id: `DEV-${Date.now()}`,
      numeroDevolucion: numDevolucion,
      numeroOCReferencia: devolucionForm.numeroOC,
      proveedor: devolucionForm.proveedor,
      fecha: new Date().toISOString().split('T')[0],
      insumoNombre: devolucionForm.insumoNombre,
      cantidadDevuelta: devolucionForm.cantidadDevuelta,
      unidad: 'Unidades',
      motivo: devolucionForm.motivo,
      observacion: devolucionForm.observacion,
      responsableBodega: user?.nombre || 'Jefe de Bodega SARA',
    };

    setOrdenesDevolucion(prev => [nuevaDev as any, ...prev]);
    setModalDevolucion(false);
    alert(`¡Orden de Devolución ${numDevolucion} emitida al proveedor exitosamente! Se adjuntó al expediente de compra.`);
  };

  // 2.1 Abrir Modal de Checklist de Recepción
  const handleAbrirChecklist = (oc: OrdenCompraRecepcion) => {
    setSelectedOCForRecepcion(oc);
    const draft: Record<string, any> = {};
    oc.items.forEach(it => {
      const yaRecibido = it.cantidadRecibida > 0;
      draft[it.id] = {
        verificado: yaRecibido || oc.estado === 'RECEPCION_COMPLETA',
        cantRecibida: yaRecibido ? it.cantidadRecibida : it.cantidadPedida,
        cantFaltante: it.cantidadFaltante || 0,
        cantDefectuosa: it.cantidadDefectuosa || 0,
        motivoDefecto: it.motivoDefecto || 'Material Defectuoso / Roto en Descargue',
      };
    });
    setChecklistDraft(draft);
    setTransportistaChecklist({
      chofer: oc.transportistaDefault || 'Manuel Carrión (Transportes del Austro Cía. Ltda.)',
      cedulaLicencia: '0104892341 - Tipo E Profesional',
      telefono: '0987654321',
      placa: oc.placaDefault || 'LBA-4589',
      tipoVehiculo: 'Camión Hino 10 Toneladas',
      empresaTransporte: 'Transportes del Austro Cía. Ltda.',
      guiaRemision: oc.guiaRemisionDefault || `GR-001-${String(Math.floor(Math.random() * 89999 + 10000))}`,
      calificacionEstrellas: 5,
      evaluacionPuntualidad: 'EXCELENTE_A_TIEMPO',
      evaluacionCarga: 'IMPECABLE',
      autorizacionPagoFlete: 'APROBADO_PAGO_INMEDIATO',
      tarifaFleteUSD: 145.00,
      observacionesFlete: 'Descargue ágil en Bodega Central. Documentación y precintos en orden.',
      observaciones: '',
    });
    setModalRecepcionChecklist(true);
  };

  // 2.2 Marcar todos los ítems como 100% conformes
  const handleMarcarTodosConformes = () => {
    if (!selectedOCForRecepcion) return;
    const nuevoDraft: Record<string, any> = {};
    selectedOCForRecepcion.items.forEach(it => {
      nuevoDraft[it.id] = {
        verificado: true,
        cantRecibida: it.cantidadPedida,
        cantFaltante: 0,
        cantDefectuosa: 0,
        motivoDefecto: '',
      };
    });
    setChecklistDraft(nuevoDraft);
  };

  // 2.3 Manejar cambios en un ítem del checklist
  const handleItemDraftChange = (itemId: string, field: string, value: any) => {
    setChecklistDraft(prev => {
      const actual = prev[itemId] || {
        verificado: false,
        cantRecibida: 0,
        cantFaltante: 0,
        cantDefectuosa: 0,
        motivoDefecto: '',
      };
      return {
        ...prev,
        [itemId]: {
          ...actual,
          [field]: value,
        }
      };
    });
  };

  // 2.4 Confirmar la recepción desde el Checklist
  const handleConfirmarRecepcionChecklist = () => {
    if (!selectedOCForRecepcion) return;

    let hayDiscrepancia = false;
    let totalSubtotalAceptadoUSD = 0;
    let totalDescuentoUSD = 0;
    const itemsDiscrepancia: ItemDevolucionContable[] = [];

    const itemsActualizados = selectedOCForRecepcion.items.map(it => {
      const d = checklistDraft[it.id] || {
        verificado: false,
        cantRecibida: 0,
        cantFaltante: 0,
        cantDefectuosa: 0,
        motivoDefecto: '',
      };

      const cantRec = Math.max(0, Number(d.cantRecibida) || 0);
      const cantFalt = Math.max(0, Number(d.cantFaltante) || 0);
      const cantDef = Math.max(0, Number(d.cantDefectuosa) || 0);
      const motivo = d.motivoDefecto || 'Discrepancia detectada en descargue de mercadería';

      const subAceptado = cantRec * it.costoUnitario;
      const subDescuento = (cantFalt + cantDef) * it.costoUnitario;

      totalSubtotalAceptadoUSD += subAceptado;
      totalDescuentoUSD += subDescuento;

      if (cantFalt > 0 || cantDef > 0) {
        hayDiscrepancia = true;
        itemsDiscrepancia.push({
          insumoCodigo: it.codigo,
          insumoNombre: it.insumoNombre,
          unidad: it.unidad,
          cantidadPedida: it.cantidadPedida,
          cantidadIngresada: cantRec,
          cantidadFaltante: cantFalt,
          cantidadDefectuosa: cantDef,
          motivo: motivo,
          costoUnitario: it.costoUnitario,
          subtotalDescuento: subDescuento,
        });
      }

      // Si ingresó físicamente material conforme a bodega, asentar en Kardex
      if (cantRec > 0) {
        setInsumos(prevInsumos => prevInsumos.map(ins => {
          if (ins.id === it.insumoId || ins.codigo === it.codigo) {
            const nuevoStock = ins.stockActual + cantRec;
            const nuevoCpp = Number(((ins.stockActual * ins.cppActual + cantRec * it.costoUnitario) / nuevoStock).toFixed(4));
            return {
              ...ins,
              stockActual: nuevoStock,
              cppActual: nuevoCpp,
            };
          }
          return ins;
        }));

        const nuevoMov: MovimientoKardex = {
          id: `MOV-${Date.now()}-${it.id}`,
          insumoId: it.insumoId,
          fecha: new Date().toISOString().split('T')[0],
          hora: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
          tipo: 'RECEPCION_OC',
          documentoRef: `${selectedOCForRecepcion.numeroOC} / ${transportistaChecklist.guiaRemision}`,
          solicitanteOProveedor: selectedOCForRecepcion.proveedor,
          entradaCant: cantRec,
          entradaCostoUnit: it.costoUnitario,
          entradaTotal: subAceptado,
          salidaCant: 0,
          salidaCostoUnit: 0,
          salidaTotal: 0,
          saldoCant: cantRec,
          saldoCpp: it.costoUnitario,
          saldoTotal: subAceptado,
          observacion: `Ingreso conforme por transportista ${transportistaChecklist.chofer} (Placa ${transportistaChecklist.placa})`,
        };
        setMovimientos(prev => [nuevoMov, ...prev]);
      }

      return {
        ...it,
        cantidadRecibida: cantRec,
        cantidadFaltante: cantFalt,
        cantidadDefectuosa: cantDef,
        motivoDefecto: motivo,
      };
    });

    const nuevoEstado = hayDiscrepancia ? 'CON_DEVOLUCION' : 'RECEPCION_COMPLETA';

    setOrdenesCompra(prev => prev.map(oc => {
      if (oc.id === selectedOCForRecepcion.id) {
        return {
          ...oc,
          estado: nuevoEstado,
          items: itemsActualizados,
        };
      }
      return oc;
    }));

    if (hayDiscrepancia && itemsDiscrepancia.length > 0) {
      const devNumero = `DEV-PROV-2026-${String(ordenesDevolucion.length + 15).padStart(3, '0')}`;
      const nuevaDev: OrdenDevolucionContable = {
        id: `DEV-${Date.now()}`,
        numeroDevolucion: devNumero,
        numeroOCReferencia: selectedOCForRecepcion.numeroOC,
        numeroFacturaSRI: selectedOCForRecepcion.id === 'OC-2026-092' ? '001-002-000849301' : '001-001-000045892',
        proveedor: selectedOCForRecepcion.proveedor,
        rucProveedor: selectedOCForRecepcion.rucProveedor,
        guiaRemision: transportistaChecklist.guiaRemision,
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
        responsableBodega: user?.nombre || 'Jefe de Bodega SARA',
        transportista: transportistaChecklist.chofer,
        placaVehiculo: transportistaChecklist.placa,
        items: itemsDiscrepancia,
        totalDescuentoUSD: Number(totalDescuentoUSD.toFixed(2)),
        totalSubtotalAceptadoUSD: Number(totalSubtotalAceptadoUSD.toFixed(2)),
        estado: 'PENDIENTE_NOTIFICACION',
      };

      ThreeWayMatchService.registrarDevolucion(nuevaDev);
      setOrdenesDevolucion(ThreeWayMatchService.getDevoluciones());

      // Sincronización con SARA-Fletes (Calificación y Autorización de Pago de Flete)
      const resFleteId = `FLT-${Date.now()}`;
      SaraFletesSyncService.registrarRecepcionYCalificacion({
        id: resFleteId,
        ordenCompraNumero: selectedOCForRecepcion.numeroOC,
        proveedor: selectedOCForRecepcion.proveedor,
        choferNombre: transportistaChecklist.chofer,
        choferCedulaLicencia: transportistaChecklist.cedulaLicencia,
        choferTelefono: transportistaChecklist.telefono,
        vehiculoPlaca: transportistaChecklist.placa,
        vehiculoTipo: transportistaChecklist.tipoVehiculo,
        empresaTransporte: transportistaChecklist.empresaTransporte,
        guiaRemision: transportistaChecklist.guiaRemision,
        fechaRecepcion: new Date().toISOString().split('T')[0],
        horaRecepcion: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
        calificacionEstrellas: transportistaChecklist.calificacionEstrellas,
        evaluacionPuntualidad: transportistaChecklist.evaluacionPuntualidad,
        evaluacionCarga: transportistaChecklist.evaluacionCarga,
        autorizacionPagoFlete: transportistaChecklist.autorizacionPagoFlete,
        tarifaFleteUSD: transportistaChecklist.tarifaFleteUSD,
        observacionesBodeguero: transportistaChecklist.observacionesFlete,
        bodegueroNombre: user?.nombre || 'Jefe de Bodega SARA',
        estadoLiquidacion: transportistaChecklist.autorizacionPagoFlete === 'APROBADO_PAGO_INMEDIATO' ? 'AUTORIZADO_PARA_CANCELAR' : 'PENDIENTE_REVISION',
      });

      // Auditoría DB reactiva
      SaraDatabaseAuditorService.registrarLog({
        modulo: 'BODEGA_KARDEX',
        operacion: 'INSERT',
        entidadId: devNumero,
        descripcion: `Generada orden de devolución contable por $${totalDescuentoUSD.toFixed(2)} USD`,
        estadoPersistencia: 'SUPABASE_Y_LOCAL',
      });

      SaraDatabaseAuditorService.registrarLog({
        modulo: 'FLETES',
        operacion: 'UPDATE',
        entidadId: resFleteId,
        descripcion: `Calificado transportista ${transportistaChecklist.chofer} (${transportistaChecklist.calificacionEstrellas}⭐) - Estado de pago: ${transportistaChecklist.autorizacionPagoFlete}`,
        estadoPersistencia: 'SUPABASE_Y_LOCAL',
      });

      setFeedbackBanner({
        tipo: 'DISCREPANCIA',
        mensaje: `¡Recepción procesada con Discrepancia! Se asentaron $${totalSubtotalAceptadoUSD.toFixed(2)} en Bodega y se generó la Devolución ${devNumero} por $${totalDescuentoUSD.toFixed(2)} USD para Contabilidad. Además, se calificó a ${transportistaChecklist.chofer} con ${transportistaChecklist.calificacionEstrellas}⭐ en SARA-Fletes (Estado Pago: ${transportistaChecklist.autorizacionPagoFlete}).`,
        devolucionId: devNumero,
      });
    } else {
      // Sincronización con SARA-Fletes (Recepción Conforme 100%)
      const resFleteId = `FLT-${Date.now()}`;
      SaraFletesSyncService.registrarRecepcionYCalificacion({
        id: resFleteId,
        ordenCompraNumero: selectedOCForRecepcion.numeroOC,
        proveedor: selectedOCForRecepcion.proveedor,
        choferNombre: transportistaChecklist.chofer,
        choferCedulaLicencia: transportistaChecklist.cedulaLicencia,
        choferTelefono: transportistaChecklist.telefono,
        vehiculoPlaca: transportistaChecklist.placa,
        vehiculoTipo: transportistaChecklist.tipoVehiculo,
        empresaTransporte: transportistaChecklist.empresaTransporte,
        guiaRemision: transportistaChecklist.guiaRemision,
        fechaRecepcion: new Date().toISOString().split('T')[0],
        horaRecepcion: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
        calificacionEstrellas: transportistaChecklist.calificacionEstrellas,
        evaluacionPuntualidad: transportistaChecklist.evaluacionPuntualidad,
        evaluacionCarga: transportistaChecklist.evaluacionCarga,
        autorizacionPagoFlete: transportistaChecklist.autorizacionPagoFlete,
        tarifaFleteUSD: transportistaChecklist.tarifaFleteUSD,
        observacionesBodeguero: transportistaChecklist.observacionesFlete,
        bodegueroNombre: user?.nombre || 'Jefe de Bodega SARA',
        estadoLiquidacion: transportistaChecklist.autorizacionPagoFlete === 'APROBADO_PAGO_INMEDIATO' ? 'AUTORIZADO_PARA_CANCELAR' : 'PENDIENTE_REVISION',
      });

      // Auditoría DB reactiva
      SaraDatabaseAuditorService.registrarLog({
        modulo: 'BODEGA_KARDEX',
        operacion: 'INSERT',
        entidadId: selectedOCForRecepcion.numeroOC,
        descripcion: `Ingreso conforme de ${selectedOCForRecepcion.items.length} ítems a Bodega Central`,
        estadoPersistencia: 'SUPABASE_Y_LOCAL',
      });

      SaraDatabaseAuditorService.registrarLog({
        modulo: 'FLETES',
        operacion: 'UPDATE',
        entidadId: resFleteId,
        descripcion: `Transportista ${transportistaChecklist.chofer} calificado con éxito (${transportistaChecklist.calificacionEstrellas}⭐) - Pago ${transportistaChecklist.autorizacionPagoFlete} listo para liquidar`,
        estadoPersistencia: 'SUPABASE_Y_LOCAL',
      });

      setFeedbackBanner({
        tipo: 'EXITO',
        mensaje: `¡Recepción 100% Conforme! Insumos de la orden ${selectedOCForRecepcion.numeroOC} ingresados al Kardex. SARA-Fletes sincronizado: Chofer ${transportistaChecklist.chofer} calificado con ${transportistaChecklist.calificacionEstrellas}⭐ y liquidación de $${transportistaChecklist.tarifaFleteUSD.toFixed(2)} USD habilitada.`,
      });
    }

    setModalRecepcionChecklist(false);
  };

  // 2.5 Exportar Devolución a PDF
  const handleExportarDevolucionPDF = (dev: OrdenDevolucionContable) => {
    const encabezados = [
      'Código',
      'Insumo / Descripción',
      'Unidad',
      'Cant. Pedida',
      'Cant. Ingresada',
      'Faltante / Dañada',
      'Motivo Rechazo',
      'C. Unit ($)',
      'Total Descuento ($)'
    ];

    const filas = dev.items.map(it => [
      it.insumoCodigo,
      it.insumoNombre,
      it.unidad,
      it.cantidadPedida,
      it.cantidadIngresada,
      it.cantidadFaltante + it.cantidadDefectuosa,
      it.motivo,
      `$${it.costoUnitario.toFixed(2)}`,
      `$${it.subtotalDescuento.toFixed(2)}`
    ]);

    exportarAPDF(
      `ACTA OFICIAL DE DEVOLUCIÓN & DISCREPANCIA: ${dev.numeroDevolucion}`,
      encabezados,
      filas,
      `Acta_Devolucion_${dev.numeroDevolucion}`,
      `Proveedor: ${dev.proveedor} (RUC: ${dev.rucProveedor}) • OC Ref: ${dev.numeroOCReferencia} • Guía: ${dev.guiaRemision} • Total a Descontar: $${dev.totalDescuentoUSD.toFixed(2)} USD`
    );
  };

  // 2.6 Exportar Devolución a Excel
  const handleExportarDevolucionExcel = (dev: OrdenDevolucionContable) => {
    const datos = dev.items.map(it => ({
      'N° Devolución': dev.numeroDevolucion,
      'OC Referencia': dev.numeroOCReferencia,
      'Proveedor': dev.proveedor,
      'RUC': dev.rucProveedor,
      'Guía Remisión': dev.guiaRemision,
      'Fecha': dev.fecha,
      'Código Insumo': it.insumoCodigo,
      'Insumo': it.insumoNombre,
      'Unidad': it.unidad,
      'Cantidad Pedida': it.cantidadPedida,
      'Cantidad Ingresada Conforme': it.cantidadIngresada,
      'Cantidad Faltante': it.cantidadFaltante,
      'Cantidad Defectuosa': it.cantidadDefectuosa,
      'Motivo': it.motivo,
      'Costo Unitario USD': it.costoUnitario,
      'Total a Descontar USD': it.subtotalDescuento,
      'Responsable Bodega': dev.responsableBodega,
      'Transportista': dev.transportista,
      'Placa': dev.placaVehiculo
    }));

    exportarAExcel(datos, `Devolucion_${dev.numeroDevolucion}_${dev.proveedor.replace(/ /g, '_')}`, 'Acta Devolucion');
  };

  // 3. Exportar Kardex a Excel con Bloque de KPIs Oficiales (Imagen 2)
  const handleExportExcelKardex = () => {
    const esCritico = currentInsumo.stockActual <= currentInsumo.stockSeguridad;
    const esAlerta = currentInsumo.stockActual <= currentInsumo.puntoReorden;
    const estadoTexto = esCritico ? 'CRÍTICO / AGOTÁNDOSE' : esAlerta ? 'REORDENAR INMEDIATO' : 'ÓPTIMO';

    const kpisExcel = [
      { etiqueta: 'Stock Actual en Bodega', valor: `${currentInsumo.stockActual.toLocaleString()} ${currentInsumo.unidad}` },
      { etiqueta: 'Costo Promedio (CPP)', valor: `$${currentInsumo.cppActual.toFixed(4)} USD` },
      { etiqueta: 'Punto de Reorden (ROP)', valor: `${currentInsumo.puntoReorden} ${currentInsumo.unidad}` },
      { etiqueta: 'Stock de Seguridad', valor: `${currentInsumo.stockSeguridad} ${currentInsumo.unidad}` },
      { etiqueta: 'Estado de Abastecimiento', valor: estadoTexto },
      { etiqueta: 'Ubicación en Bodega', valor: currentInsumo.bodegaUbicacion },
      { etiqueta: 'Lote Activo', valor: currentInsumo.lote }
    ];

    const dataExport = currentMovimientos.map(m => ({
      'Fecha': m.fecha,
      'Hora': m.hora,
      'Insumo': currentInsumo.nombre,
      'Tipo Movimiento': m.tipo,
      'Documento Respaldo': m.documentoRef,
      'Destino / Proveedor': m.proyectoDestino || m.solicitanteOProveedor,
      'Entrada Cantidad': m.entradaCant || '',
      'Entrada Costo Unitario USD': m.entradaCostoUnit ? `$${m.entradaCostoUnit.toFixed(4)}` : '',
      'Entrada Total USD': m.entradaTotal ? `$${m.entradaTotal.toFixed(2)}` : '',
      'Salida Cantidad': m.salidaCant || '',
      'Salida Costo Unitario USD': m.salidaCostoUnit ? `$${m.salidaCostoUnit.toFixed(4)}` : '',
      'Salida Total USD': m.salidaTotal ? `$${m.salidaTotal.toFixed(2)}` : '',
      'Saldo Cantidad': m.saldoCant,
      'Saldo Costo Promedio (CPP)': `$${m.saldoCpp.toFixed(4)}`,
      'Saldo Valorizado USD': `$${m.saldoTotal.toFixed(2)}`,
      'Observaciones': m.observacion || ''
    }));

    exportarAExcel(
      dataExport, 
      `Kardex_${currentInsumo.codigo}_${currentInsumo.nombre.replace(/ /g, '_')}`, 
      'Kardex Oficial',
      'bodega',
      kpisExcel
    );
  };

  // 4. Exportar Kardex a PDF con Bloque de KPIs Oficiales (Imagen 2)
  const handleExportPdfKardex = () => {
    const encabezados = [
      'Fecha',
      'Tipo',
      'Documento Ref.',
      'Destino / Proveedor',
      'Ent. Cant',
      'Ent. Total',
      'Sal. Cant',
      'Sal. Total',
      'Saldo Cant',
      'CPP ($)',
      'Saldo Total ($)'
    ];

    const filas = currentMovimientos.map(m => [
      m.fecha,
      m.tipo.replace('_', ' '),
      m.documentoRef,
      (m.proyectoDestino || m.solicitanteOProveedor).substring(0, 22),
      m.entradaCant || '-',
      m.entradaTotal ? `$${m.entradaTotal.toFixed(2)}` : '-',
      m.salidaCant || '-',
      m.salidaTotal ? `$${m.salidaTotal.toFixed(2)}` : '-',
      m.saldoCant,
      `$${m.saldoCpp.toFixed(2)}`,
      `$${m.saldoTotal.toFixed(2)}`
    ]);

    const esCritico = currentInsumo.stockActual <= currentInsumo.stockSeguridad;
    const esAlerta = currentInsumo.stockActual <= currentInsumo.puntoReorden;
    const estadoTexto = esCritico ? '🔴 CRÍTICO / AGOTÁNDOSE' : esAlerta ? '🟡 REORDENAR' : '🟢 ÓPTIMO';

    const kpisPdf = [
      {
        etiqueta: 'Stock Actual en Bodega',
        valor: `${currentInsumo.stockActual.toLocaleString()} ${currentInsumo.unidad}`,
        color: esCritico ? ('danger' as const) : esAlerta ? ('warning' as const) : ('success' as const)
      },
      {
        etiqueta: 'Costo Promedio (CPP)',
        valor: `$${currentInsumo.cppActual.toFixed(4)} USD`,
        color: 'default' as const
      },
      {
        etiqueta: 'Punto de Reorden (ROP)',
        valor: `${currentInsumo.puntoReorden} ${currentInsumo.unidad}`,
        color: 'default' as const
      },
      {
        etiqueta: 'Stock de Seguridad',
        valor: `${currentInsumo.stockSeguridad} ${currentInsumo.unidad}`,
        color: 'default' as const
      },
      {
        etiqueta: 'Estado de Abastecimiento',
        valor: estadoTexto,
        color: esCritico ? ('danger' as const) : esAlerta ? ('warning' as const) : ('success' as const)
      }
    ];

    exportarAPDF(
      `TARJETA OFICIAL DE KARDEX: ${currentInsumo.nombre.toUpperCase()}`,
      encabezados,
      filas,
      `Kardex_Oficial_${currentInsumo.codigo}`,
      `Código: ${currentInsumo.codigo} • Unidad: ${currentInsumo.unidad} • Bodega Matriz SARA • Ubicación: ${currentInsumo.bodegaUbicacion} • Lote: ${currentInsumo.lote}`,
      'bodega',
      kpisPdf
    );
  };

  // 4.1 Exportar Consumos por Proyecto de Obra
  const handleExportarConsumoProyecto = (formato: 'excel' | 'pdf') => {
    const despachosProyecto = movimientos.filter(m => 
      m.tipo === 'DESPACHO_OBRA' && 
      m.proyectoDestino && 
      (proyectoSeleccionado === 'TODOS' || m.proyectoDestino.toUpperCase().includes(proyectoSeleccionado.toUpperCase()))
    );

    const totalCostoDespachado = despachosProyecto.reduce((acc, m) => acc + (m.salidaTotal || 0), 0);

    if (formato === 'excel') {
      const datosExcel = despachosProyecto.map(m => {
        const mat = insumos.find(i => i.id === m.insumoId);
        return {
          'Fecha': m.fecha,
          'Hora': m.hora,
          'Proyecto Destino': m.proyectoDestino,
          'Vale de Salida': m.documentoRef,
          'Material / Insumo': mat?.nombre || m.insumoId,
          'Código': mat?.codigo || '',
          'Unidad': mat?.unidad || '',
          'Cantidad Despachada': m.salidaCant,
          'Costo Unitario CPP ($)': m.salidaCostoUnit.toFixed(4),
          'Costo Total Despacho ($)': m.salidaTotal.toFixed(2),
          'Solicitado Por': m.solicitanteOProveedor,
          'Observaciones': m.observacion || ''
        };
      });

      const kpisExcel = [
        { etiqueta: 'Proyecto de Obra', valor: proyectoSeleccionado },
        { etiqueta: 'Vales Despachados', valor: `${despachosProyecto.length} vales` },
        { etiqueta: 'Costo Total Despachado', valor: `$${totalCostoDespachado.toLocaleString('es-EC', { minimumFractionDigits: 2 })} USD` }
      ];

      exportarAExcel(
        datosExcel, 
        `Consumo_Obra_${proyectoSeleccionado.replace(/ /g, '_')}`, 
        'Consumos Obra', 
        'bodega', 
        kpisExcel
      );
    } else {
      const encabezados = ['Fecha', 'Vale Respaldo', 'Material / Insumo', 'Cant.', 'Unid.', 'CPP ($)', 'Total USD', 'Solicitante'];
      const filas = despachosProyecto.map(m => {
        const mat = insumos.find(i => i.id === m.insumoId);
        return [
          m.fecha,
          m.documentoRef.split('/')[0].trim(),
          (mat?.nombre || m.insumoId).substring(0, 22),
          m.salidaCant.toLocaleString(),
          mat?.unidad || '',
          `$${m.salidaCostoUnit.toFixed(2)}`,
          `$${m.salidaTotal.toFixed(2)}`,
          m.solicitanteOProveedor.substring(0, 18)
        ];
      });

      const kpisPdf = [
        { etiqueta: 'Proyecto Destino', valor: proyectoSeleccionado.substring(0, 24), color: 'default' as const },
        { etiqueta: 'Vales de Salida', valor: `${despachosProyecto.length} vales`, color: 'default' as const },
        { etiqueta: 'Costo Total Obra', valor: `$${totalCostoDespachado.toLocaleString('es-EC', { minimumFractionDigits: 2 })} USD`, color: 'success' as const }
      ];

      exportarAPDF(
        `INFORME OFICIAL DE CONSUMOS Y DESPACHOS: ${proyectoSeleccionado.toUpperCase()}`,
        encabezados,
        filas,
        `Consumo_Obra_${proyectoSeleccionado.replace(/ /g, '_')}`,
        `Imputación presupuestaria a centro de costo de obra • Bodega & Logística SARA`,
        'bodega',
        kpisPdf
      );
    }
  };

  const handleExportarInventarioCompleto = (formato: 'excel' | 'pdf') => {
    if (formato === 'excel') {
      const datosExcel = insumos.map(i => ({
        'Código Insumo': i.codigo,
        'Descripción del Material': i.nombre,
        'Categoría': i.categoria,
        'Unidad': i.unidad,
        'Stock Actual': i.stockActual,
        'Stock Seguridad': i.stockSeguridad,
        'Costo Promedio Unitario ($)': i.cppActual.toFixed(4),
        'Valor Total en Bodega ($)': (i.stockActual * i.cppActual).toFixed(2),
        'Ubicación en Bodega': i.bodegaUbicacion,
        'Estado': i.stockActual <= i.puntoReorden ? 'CRÍTICO / REORDEN' : 'NORMAL'
      }));
      exportarAExcel(datosExcel, 'Inventario_General_Bodega_SARA', 'Inventario_Bodega', 'bodega');
    } else {
      const encabezados = ['Código', 'Material / Insumo', 'Unidad', 'Stock', 'Costo Prom ($)', 'Valor Total ($)', 'Ubicación', 'Estado'];
      const filas = insumos.map(i => [
        i.codigo,
        i.nombre,
        i.unidad,
        i.stockActual.toLocaleString(),
        `$${i.cppActual.toFixed(2)}`,
        `$${(i.stockActual * i.cppActual).toLocaleString('es-EC', { minimumFractionDigits: 2 })}`,
        i.bodegaUbicacion,
        i.stockActual <= i.puntoReorden ? 'CRÍTICO' : 'NORMAL'
      ]);
      exportarAPDF(
        'INVENTARIO VALORADO GENERAL DE BODEGA & KARDEX',
        encabezados,
        filas,
        'Inventario_General_Bodega_SARA',
        'Consolidado de Existencias Físicas y Valorización CPP en Almacén Central',
        'bodega'
      );
    }
  };

  return (
    <div className="space-y-6">

      {/* ==================================================================== */}
      {/* 1. ENCABEZADO PRINCIPAL DE BODEGA & ACCIONES CLAVE                    */}
      {/* ==================================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                <Warehouse size={18} />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                Logística de Obra & Almacén
              </span>
              <span className="text-xs text-slate-400">• Bodega Matriz Loja & Sub-Bodegas</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Control Integral de Bodega, Kardex & Suministros
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Recepción con verificación de OC, despacho legalizado hacia frentes de obra, generación de órdenes de devolución y kardex valorizado bajo método Costo Promedio Ponderado (CPP).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Botones Oficiales de Descarga Excel y PDF */}
            <button
              onClick={() => handleExportarInventarioCompleto('excel')}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              title="Descargar inventario valorado general en Excel"
            >
              <FileSpreadsheet size={15} />
              <span>Descargar Excel</span>
            </button>
            <button
              onClick={() => handleExportarInventarioCompleto('pdf')}
              className="px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              title="Descargar informe valorado de bodega en PDF con firmas oficiales"
            >
              <FileText size={15} />
              <span>Descargar PDF</span>
            </button>

            <button
              onClick={() => setModalNuevoDespacho(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowUpRight size={16} />
              <span>Despachar a Obra (Vale)</span>
            </button>

            <button
              onClick={() => {
                setActiveSubTab('recepcion');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowDownLeft size={16} className="text-emerald-400" />
              <span>Recibir Orden de Compra</span>
            </button>

            <button
              onClick={() => setModalDevolucion(true)}
              className="px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-semibold text-xs border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={15} />
              <span>Devolución Proveedor</span>
            </button>
          </div>
        </div>

        {/* 4 KPIs de Bodega con los colores oficiales de Constructora */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80 mt-6 font-mono">
          <div className="p-3 bg-slate-850/60 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Valorización en Bodega:</span>
            <span className="text-lg font-bold text-amber-400 tabular-nums">
              ${valorTotalBodega.toLocaleString('es-EC', { minimumFractionDigits: 2 })} USD
            </span>
          </div>

          <div className="p-3 bg-slate-850/60 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Insumos Críticos (Agotándose):</span>
            <span className="text-lg font-bold text-rose-400 tabular-nums flex items-center gap-1.5">
              <span>{insumosCriticos.length} Insumos</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </span>
          </div>

          <div className="p-3 bg-slate-850/60 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Órdenes de Compra por Recibir:</span>
            <span className="text-lg font-bold text-sky-400 tabular-nums">
              {ordenesCompra.filter(o => o.estado === 'PENDIENTE_RECEPCION').length} Pendientes
            </span>
          </div>

          <div className="p-3 bg-slate-850/60 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Vales Legalizados Hoy:</span>
            <span className="text-lg font-bold text-emerald-400 tabular-nums">
              {valesDespacho.length} Emitidos
            </span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. PESTAÑAS OPERATIVAS INTERNAS DEL MÓDULO                           */}
      {/* ==================================================================== */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveSubTab('kardex')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'kardex'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Package size={16} />
          <span>Kardex Exclusivo & Evolución</span>
        </button>

        <button
          onClick={() => setActiveSubTab('recepcion')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'recepcion'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ArrowDownLeft size={16} />
          <span>Recepción de Mercadería (OC)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('despacho')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'despacho'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ArrowUpRight size={16} />
          <span>Despacho a Frentes & Vales</span>
        </button>

        <button
          onClick={() => setActiveSubTab('stock_critico')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'stock_critico'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <AlertTriangle size={16} className={insumosCriticos.length > 0 ? 'text-rose-500' : ''} />
          <span>Stock Crítico ({insumosCriticos.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('mermas')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'mermas'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck size={16} />
          <span>Mermas Técnicas & Trazabilidad</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* 3. SUBTAB 1: KARDEX EXCLUSIVO POR INSUMO                             */}
      {/* ==================================================================== */}
      {activeSubTab === 'kardex' && (
        <div className="space-y-6">
          
          {/* Barra de Filtros & Selector de Insumos (Imagen 3: Todos | Por Categorías | Por Proveedores | Por Proyecto) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            
            {/* 1. Selector Superior de Modo de Vista (Imagen 3) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setModoFiltroKardex('todos'); setVistaKardexConsolidada(false); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    modoFiltroKardex === 'todos'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Warehouse size={14} />
                  <span>Todos</span>
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {insumos.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => { setModoFiltroKardex('categoria'); setVistaKardexConsolidada(false); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    modoFiltroKardex === 'categoria'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Package size={14} />
                  <span>Por Categorías</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setModoFiltroKardex('proveedor'); setVistaKardexConsolidada(false); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    modoFiltroKardex === 'proveedor'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Truck size={14} />
                  <span>Por Proveedores</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setModoFiltroKardex('proyecto'); setVistaKardexConsolidada(false); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    modoFiltroKardex === 'proyecto'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Building2 size={14} />
                  <span>Por Proyecto</span>
                </button>
              </div>

              {/* Botón Alternar Matriz Consolidada en modo 'todos' */}
              {modoFiltroKardex === 'todos' && (
                <button
                  type="button"
                  onClick={() => setVistaKardexConsolidada(!vistaKardexConsolidada)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                    vistaKardexConsolidada
                      ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Activity size={14} />
                  <span>{vistaKardexConsolidada ? 'Ver Ficha Kardex Individual' : '📊 Ver Matriz Consolidada Multibodega'}</span>
                </button>
              )}
            </div>

            {/* 2. Filtros Específicos según el Modo Seleccionado */}
            {modoFiltroKardex === 'categoria' && (
              <div className="p-3.5 bg-amber-500/10 rounded-xl border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Filter size={13} />
                    <span>Familia de Insumo:</span>
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {categoriasKardex.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoriaSeleccionada(cat.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          categoriaSeleccionada === cat.id
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="font-mono text-[11px] text-amber-900 dark:text-amber-300 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/60 shrink-0">
                  <span>{insumosFiltrados.length} Insumos</span> • Valorizado: <span className="font-bold">${insumosFiltrados.reduce((acc, i) => acc + (i.stockActual * i.cppActual), 0).toLocaleString('es-EC', { minimumFractionDigits: 2 })} USD</span>
                </div>
              </div>
            )}

            {modoFiltroKardex === 'proveedor' && (
              <div className="p-3.5 bg-sky-500/10 rounded-xl border border-sky-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="flex-1 max-w-md">
                  <label className="font-bold text-sky-900 dark:text-sky-300 block mb-1 flex items-center gap-1.5">
                    <Truck size={13} />
                    <span>Seleccionar Proveedor Calificado:</span>
                  </label>
                  <select
                    value={proveedorSeleccionado}
                    onChange={(e) => setProveedorSeleccionado(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-sky-300 dark:border-sky-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {proveedoresKardex.map(prov => (
                      <option key={prov.id} value={prov.id}>
                        {prov.nombre} {prov.ruc !== 'TODOS' ? `(RUC: ${prov.ruc})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="font-mono text-[11px] text-sky-900 dark:text-sky-300 bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-sky-200 dark:border-sky-900/60 shrink-0">
                  <div>Insumos Suministrados: <span className="font-bold">{insumosFiltrados.length}</span></div>
                  <div>Recepciones registradas en Kardex</div>
                </div>
              </div>
            )}

            {modoFiltroKardex === 'proyecto' && (
              <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="flex-1 max-w-md">
                  <label className="font-bold text-emerald-900 dark:text-emerald-300 block mb-1 flex items-center gap-1.5">
                    <Building2 size={13} />
                    <span>Seleccionar Frente / Proyecto de Obra:</span>
                  </label>
                  <select
                    value={proyectoSeleccionado}
                    onChange={(e) => setProyectoSeleccionado(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {proyectosKardex.map(proy => (
                      <option key={proy.id} value={proy.id}>
                        {proy.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Resumen de Consumo de la Obra y Descargas */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-mono text-[11px] text-emerald-900 dark:text-emerald-300 bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-900/60">
                    <div>Vales a Obra: <span className="font-bold">{movimientos.filter(m => m.tipo === 'DESPACHO_OBRA' && (proyectoSeleccionado === 'TODOS' || (m.proyectoDestino && m.proyectoDestino.toUpperCase().includes(proyectoSeleccionado.toUpperCase())))).length}</span></div>
                    <div>Costo Despachado: <span className="font-bold text-emerald-600 dark:text-emerald-400">${movimientos.filter(m => m.tipo === 'DESPACHO_OBRA' && (proyectoSeleccionado === 'TODOS' || (m.proyectoDestino && m.proyectoDestino.toUpperCase().includes(proyectoSeleccionado.toUpperCase())))).reduce((acc, m) => acc + (m.salidaTotal || 0), 0).toLocaleString('es-EC', { minimumFractionDigits: 2 })} USD</span></div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExportarConsumoProyecto('excel')}
                    title="Exportar consumos de la obra a Excel"
                    className="px-2.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <FileSpreadsheet size={13} />
                    <span>Excel Obra</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportarConsumoProyecto('pdf')}
                    title="Exportar informe de consumos de la obra a PDF"
                    className="px-2.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center gap-1 cursor-pointer border border-slate-700"
                  >
                    <FileText size={13} className="text-amber-400" />
                    <span>PDF Obra</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. Selector de Insumos & Botones de Exportación Oficiales (Excel / PDF) */}
            {!vistaKardexConsolidada && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
                <div className="flex-1 max-w-md">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Seleccionar Insumo para Tarjeta de Kardex:
                  </label>
                  <div className="relative">
                    <select
                      value={selectedInsumoId}
                      onChange={(e) => setSelectedInsumoId(e.target.value)}
                      className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {insumosFiltrados.length === 0 ? (
                        <option value="">No hay insumos para este filtro</option>
                      ) : (
                        insumosFiltrados.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.codigo} - {i.nombre} ({i.stockActual} {i.unidad} en stock)
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* Botones de Exportación Oficiales (Excel / PDF) & Agente Auditor DB */}
                <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-4">
                  <button
                    onClick={() => setAuditorModalOpen(true)}
                    title="Auditar persistencia e integridad de datos en Base de Datos (Supabase + Local)"
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck size={15} className="text-purple-200" />
                    <span>🛡️ Agente Auditor DB (100% OK)</span>
                  </button>

                  <button
                    onClick={handleExportExcelKardex}
                    title="Exportar a Excel nativo (.xlsx) con los KPIs oficiales de la Ficha"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet size={15} />
                    <span>Exportar a Excel</span>
                  </button>

                  <button
                    onClick={handleExportPdfKardex}
                    title="Descargar Ficha Oficial en PDF con los KPIs y firmas corporativas"
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText size={15} className="text-amber-400" />
                    <span>Descargar PDF</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. Ficha Resumen del Insumo Seleccionado (Imagen 2: KPIs Oficiales) */}
            {!vistaKardexConsolidada && currentInsumo && (
              <div className="mt-3 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Stock Actual en Bodega:</span>
                  <span className={`text-base font-bold tabular-nums ${currentInsumo.stockActual <= currentInsumo.puntoReorden ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                    {currentInsumo.stockActual.toLocaleString()} {currentInsumo.unidad}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Costo Promedio (CPP):</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                    ${currentInsumo.cppActual.toFixed(4)} USD
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Punto de Reorden (ROP):</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                    {currentInsumo.puntoReorden} {currentInsumo.unidad}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Stock de Seguridad:</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                    {currentInsumo.stockSeguridad} {currentInsumo.unidad}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Estado de Abastecimiento:</span>
                  {currentInsumo.stockActual <= currentInsumo.stockSeguridad ? (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-300">
                      🔴 Crítico / Agotándose
                    </span>
                  ) : currentInsumo.stockActual <= currentInsumo.puntoReorden ? (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300">
                      🟡 Reordenar Inmediato
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300">
                      🟢 Óptimo
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* VISTA A: MATRIZ CONSOLIDADA DE TODO EL INVENTARIO MULTIBODEGA */}
          {vistaKardexConsolidada ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity size={16} className="text-amber-500" />
                    <span>Matriz Consolidada de Todo el Inventario Multibodega Valorado</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Corte valorizado oficial de existencias bajo Costo Promedio Ponderado (CPP) según NIIF / SRI Ecuador.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportarInventarioCompleto('excel')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet size={14} />
                    <span>Descargar Matriz Excel</span>
                  </button>
                  <button
                    onClick={() => handleExportarInventarioCompleto('pdf')}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText size={14} className="text-amber-400" />
                    <span>Descargar Matriz PDF</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                      <th className="py-3 px-3 font-bold">Código</th>
                      <th className="py-3 px-3 font-bold">Material / Insumo</th>
                      <th className="py-3 px-2 font-bold">Categoría</th>
                      <th className="py-3 px-2 font-bold">Unidad</th>
                      <th className="py-3 px-3 font-bold text-right">Stock Actual</th>
                      <th className="py-3 px-3 font-bold text-right">CPP Unitario ($)</th>
                      <th className="py-3 px-3 font-bold text-right text-amber-600 dark:text-amber-400">Valor Total ($)</th>
                      <th className="py-3 px-3 font-bold text-right">ROP</th>
                      <th className="py-3 px-3 font-bold text-right">Seguridad</th>
                      <th className="py-3 px-3 font-bold text-center">Estado</th>
                      <th className="py-3 px-2 font-bold text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 tabular-nums">
                    {insumos.map((i) => {
                      const esCritico = i.stockActual <= i.stockSeguridad;
                      const esAlerta = i.stockActual <= i.puntoReorden;
                      const totalVal = i.stockActual * i.cppActual;
                      return (
                        <tr key={i.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{i.codigo}</td>
                          <td className="py-3 px-3 font-sans font-semibold text-slate-800 dark:text-slate-200">
                            <div>{i.nombre}</div>
                            <span className="text-[10px] text-slate-400 block font-mono">{i.bodegaUbicacion}</span>
                          </td>
                          <td className="py-3 px-2 font-sans text-slate-600 dark:text-slate-400">{i.categoria}</td>
                          <td className="py-3 px-2 text-slate-600 dark:text-slate-400">{i.unidad}</td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                            {i.stockActual.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-400">
                            ${i.cppActual.toFixed(4)}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-amber-600 dark:text-amber-400">
                            ${totalVal.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-500">{i.puntoReorden}</td>
                          <td className="py-3 px-3 text-right text-slate-500">{i.stockSeguridad}</td>
                          <td className="py-3 px-3 text-center">
                            {esCritico ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-300">
                                🔴 Crítico
                              </span>
                            ) : esAlerta ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-300">
                                🟡 Reorden
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300">
                                🟢 Normal
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedInsumoId(i.id);
                                setVistaKardexConsolidada(false);
                              }}
                              className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] transition-all cursor-pointer"
                              title="Ver ficha individual de Kardex"
                            >
                              Ver Ficha
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100/80 dark:bg-slate-800/70 font-bold border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                      <td colSpan={6} className="py-3 px-4 text-right">
                        TOTAL GENERAL INVENTARIO VALORIZADO BODEGA MATRIZ SARA:
                      </td>
                      <td className="py-3 px-3 text-right text-amber-600 dark:text-amber-400 font-bold text-sm">
                        ${valorTotalBodega.toLocaleString('es-EC', { minimumFractionDigits: 2 })} USD
                      </td>
                      <td colSpan={4} className="py-3 px-3 text-right text-xs text-slate-500">
                        {insumos.length} Ítems Activos
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            /* VISTA B: TABLA DE MOVIMIENTOS INDIVIDUALES DEL KARDEX */
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Historial de Transacciones de Kardex: {currentInsumo.nombre}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Trazabilidad cronológica de entradas por OC, salidas por vale a obra y saldos valorizados.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {currentMovimientos.length} Movimientos Registrados
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 tracking-wider">
                      <th className="py-3 px-3.5 font-bold" rowSpan={2}>Fecha / Hora</th>
                      <th className="py-3 px-3 font-bold" rowSpan={2}>Tipo & Referencia</th>
                      <th className="py-3 px-3 font-bold" rowSpan={2}>Destino / Proveedor</th>
                      <th className="py-2 px-3 font-bold text-center border-l border-r border-slate-200 dark:border-slate-700 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400" colSpan={3}>
                        ENTRADAS
                      </th>
                      <th className="py-2 px-3 font-bold text-center border-r border-slate-200 dark:border-slate-700 bg-sky-50/50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400" colSpan={3}>
                        SALIDAS (DESPACHOS)
                      </th>
                      <th className="py-2 px-3 font-bold text-center bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400" colSpan={3}>
                        SALDO EN BODEGA
                      </th>
                    </tr>
                    <tr className="bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-[9px] uppercase font-mono text-slate-500">
                      <th className="py-1.5 px-2 text-right border-l border-slate-200 dark:border-slate-700">Cant.</th>
                      <th className="py-1.5 px-2 text-right">C. Unit</th>
                      <th className="py-1.5 px-2.5 text-right border-r border-slate-200 dark:border-slate-700">Total $</th>
                      <th className="py-1.5 px-2 text-right">Cant.</th>
                      <th className="py-1.5 px-2 text-right">C. Unit</th>
                      <th className="py-1.5 px-2.5 text-right border-r border-slate-200 dark:border-slate-700">Total $</th>
                      <th className="py-1.5 px-2 text-right">Cant.</th>
                      <th className="py-1.5 px-2 text-right">CPP ($)</th>
                      <th className="py-1.5 px-2.5 text-right font-bold text-slate-900 dark:text-white">Total $</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-xs tabular-nums">
                    {currentMovimientos.map((m) => {
                      const esEntrada = m.entradaCant > 0;
                      const esSalida = m.salidaCant > 0;
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                            <div>{m.fecha}</div>
                            <span className="text-[10px] text-slate-400">{m.hora}</span>
                          </td>

                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mb-0.5 ${
                              m.tipo === 'RECEPCION_OC' 
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : m.tipo === 'DESPACHO_OBRA'
                                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                                  : m.tipo === 'DEVOLUCION_PROVEEDOR'
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {m.tipo.replace('_', ' ')}
                            </span>
                            <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[170px]" title={m.documentoRef}>
                              {m.documentoRef}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-sans text-xs max-w-[180px] truncate" title={m.proyectoDestino || m.solicitanteOProveedor}>
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {m.proyectoDestino || m.solicitanteOProveedor}
                            </div>
                            {m.observacion && (
                              <span className="text-[10px] text-slate-400 block truncate" title={m.observacion}>
                                {m.observacion}
                              </span>
                            )}
                          </td>

                          {/* Entradas */}
                          <td className="py-3 px-2 text-right border-l border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 font-bold">
                            {esEntrada ? m.entradaCant.toLocaleString() : '-'}
                          </td>
                          <td className="py-3 px-2 text-right text-slate-600 dark:text-slate-400">
                            {esEntrada ? `$${m.entradaCostoUnit.toFixed(2)}` : '-'}
                          </td>
                          <td className="py-3 px-2.5 text-right border-r border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 font-bold">
                            {esEntrada ? `$${m.entradaTotal.toFixed(2)}` : '-'}
                          </td>

                          {/* Salidas */}
                          <td className="py-3 px-2 text-right text-sky-600 dark:text-sky-400 font-bold">
                            {esSalida ? m.salidaCant.toLocaleString() : '-'}
                          </td>
                          <td className="py-3 px-2 text-right text-slate-600 dark:text-slate-400">
                            {esSalida ? `$${m.salidaCostoUnit.toFixed(2)}` : '-'}
                          </td>
                          <td className="py-3 px-2.5 text-right border-r border-slate-200 dark:border-slate-800 text-sky-600 dark:text-sky-400 font-bold">
                            {esSalida ? `$${m.salidaTotal.toFixed(2)}` : '-'}
                          </td>

                          {/* Saldos */}
                          <td className="py-3 px-2 text-right font-bold text-slate-900 dark:text-white">
                            {m.saldoCant.toLocaleString()}
                          </td>
                          <td className="py-3 px-2 text-right text-amber-600 dark:text-amber-400 font-semibold">
                            ${m.saldoCpp.toFixed(2)}
                          </td>
                          <td className="py-3 px-2.5 text-right font-bold text-amber-600 dark:text-amber-400">
                            ${m.saldoTotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-sans">
                <span>Método Oficial: Costo Promedio Ponderado (CPP) según NIIF / SRI Ecuador.</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  Saldo Valorizado Actual: ${currentInsumo.stockActual * currentInsumo.cppActual} USD
                </span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. SUBTAB 2: RECEPCIÓN DE MERCADERÍA (POR ORDEN DE COMPRA)          */}
      {/* ==================================================================== */}
      {activeSubTab === 'recepcion' && (
        <div className="space-y-6">

          {/* Banner de Feedback en Tiempo Real */}
          {feedbackBanner && (
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300 shadow-md ${
              feedbackBanner.tipo === 'DISCREPANCIA'
                ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-500/40 text-rose-950 dark:text-rose-200'
                : 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500/40 text-emerald-950 dark:text-emerald-200'
            }`}>
              <div className="flex items-start gap-3">
                <span className={`p-2 rounded-xl shrink-0 ${
                  feedbackBanner.tipo === 'DISCREPANCIA' 
                    ? 'bg-rose-500 text-white' 
                    : 'bg-emerald-500 text-white'
                }`}>
                  {feedbackBanner.tipo === 'DISCREPANCIA' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                </span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    {feedbackBanner.tipo === 'DISCREPANCIA' 
                      ? 'Recepción con Discrepancia & Orden de Devolución Generada' 
                      : 'Ingreso Conforme Registrado en Kardex'}
                  </h4>
                  <p className="text-xs mt-0.5 leading-relaxed">
                    {feedbackBanner.mensaje}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                {feedbackBanner.devolucionId && (
                  <button
                    onClick={() => setSubVistaRecepcion('devoluciones')}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-50 transition-all cursor-pointer shadow-sm"
                  >
                    Ver en Devoluciones
                  </button>
                )}
                <button
                  onClick={() => setFeedbackBanner(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Barra Superior con Selector de Sub-vistas (Órdenes vs Devoluciones) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSubVistaRecepcion('ordenes')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  subVistaRecepcion === 'ordenes'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <ClipboardCheck size={16} />
                <span>Órdenes de Compra por Recibir</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-950/10 dark:bg-white/10 font-extrabold">
                  {ordenesCompra.length}
                </span>
              </button>

              <button
                onClick={() => setSubVistaRecepcion('devoluciones')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  subVistaRecepcion === 'devoluciones'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <RotateCcw size={16} />
                <span>Órdenes de Devolución & Discrepancias</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/20 font-extrabold">
                  {ordenesDevolucion.length}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setModalDevolucion(true)}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <Plus size={14} />
                <span>Devolución Manual</span>
              </button>
            </div>
          </div>

          {/* VISTA A: LISTADO DE ÓRDENES DE COMPRA (CON DESPLIEGUE COMPLETO DE PRODUCTOS) */}
          {subVistaRecepcion === 'ordenes' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Truck size={17} className="text-amber-500" />
                      <span>Recepción de Mercadería por Orden de Compra & Guía de Remisión</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Haz clic en cualquier Orden de Compra para desplegar todos sus productos. Inicia el Checklist para cotejar físicamente lo pedido vs lo recibido.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {ordenesCompra.map((oc) => {
                    const isExpanded = expandedOcId === oc.id;
                    const totalPedidaCount = oc.items.reduce((acc, it) => acc + it.cantidadPedida, 0);
                    const totalRecibidaCount = oc.items.reduce((acc, it) => acc + it.cantidadRecibida, 0);
                    const totalFaltanteCount = oc.items.reduce((acc, it) => acc + it.cantidadFaltante + it.cantidadDefectuosa, 0);

                    return (
                      <div 
                        key={oc.id} 
                        className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                          isExpanded 
                            ? 'border-amber-500/50 dark:border-amber-500/40 shadow-lg bg-slate-50/30 dark:bg-slate-850/30' 
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                        }`}
                      >
                        {/* Cabecera de la Orden de Compra */}
                        <div 
                          onClick={() => setExpandedOcId(prev => prev === oc.id ? null : oc.id)}
                          className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <div className="flex items-start sm:items-center gap-3.5">
                            <button
                              type="button"
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0 mt-0.5 sm:mt-0"
                            >
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                                  {oc.numeroOC}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                                  oc.estado === 'RECEPCION_COMPLETA'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                                    : oc.estado === 'CON_DEVOLUCION'
                                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                                }`}>
                                  {oc.estado.replace('_', ' ')}
                                </span>
                                <span className="text-xs text-slate-400 font-mono">
                                  Emitida: {oc.fechaEmision}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {oc.proveedor}
                                </span>
                                <span className="text-slate-400 font-mono text-[11px]">
                                  RUC: {oc.rucProveedor}
                                </span>
                                <span className="text-slate-300 dark:text-slate-600">•</span>
                                <span className="text-slate-500 font-medium">
                                  {oc.items.length} {oc.items.length === 1 ? 'producto' : 'productos'} en la orden
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                            <div className="text-left sm:text-right font-mono">
                              <span className="text-[10px] text-slate-400 uppercase block font-sans font-semibold">Total Orden de Compra:</span>
                              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tabular-nums">
                                ${oc.totalMontoOC.toLocaleString('es-EC', { minimumFractionDigits: 2 })} USD
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAbrirChecklist(oc);
                              }}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer ${
                                oc.estado === 'RECEPCION_COMPLETA'
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                              }`}
                            >
                              <ClipboardCheck size={16} />
                              <span>{oc.estado === 'RECEPCION_COMPLETA' ? 'Revisar Checklist' : 'Procesar Ingreso & Checklist'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Despliegue de los productos de la Orden de Compra (Acordeón) */}
                        {isExpanded && (
                          <div className="border-t border-slate-200 dark:border-slate-800 p-4 sm:p-5 bg-white dark:bg-slate-900/80 space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <Package size={14} className="text-amber-500" />
                                <span>Detalle de Productos Pedidos en {oc.numeroOC} ({oc.items.length} Ítems)</span>
                              </h4>

                              <div className="text-xs font-mono text-slate-500">
                                Guía Referencia: <span className="font-bold text-slate-700 dark:text-slate-300">{oc.guiaRemisionDefault}</span>
                              </div>
                            </div>

                            <div className="overflow-x-auto border rounded-xl border-slate-200 dark:border-slate-800">
                              <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                  <tr>
                                    <th className="py-2 px-3 font-semibold">Código</th>
                                    <th className="py-2 px-3 font-semibold">Producto / Descripción</th>
                                    <th className="py-2 px-3 font-semibold text-right">Cant. Pedida</th>
                                    <th className="py-2 px-3 font-semibold text-right">Cant. Recibida</th>
                                    <th className="py-2 px-3 font-semibold text-right">Faltante / Dañada</th>
                                    <th className="py-2 px-3 font-semibold text-right">Costo Unit.</th>
                                    <th className="py-2 px-3 font-semibold text-right">Subtotal OC</th>
                                    <th className="py-2 px-3 font-semibold text-center">Estado Ítem</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs tabular-nums">
                                  {oc.items.map((it) => {
                                    const tieneDiscrepancia = it.cantidadFaltante > 0 || it.cantidadDefectuosa > 0;
                                    const esCompleto = it.cantidadRecibida >= it.cantidadPedida;

                                    return (
                                      <tr key={it.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                                        <td className="py-2.5 px-3 font-bold text-slate-600 dark:text-slate-300">
                                          {it.codigo}
                                        </td>
                                        <td className="py-2.5 px-3 font-sans font-semibold text-slate-900 dark:text-white">
                                          <div>{it.insumoNombre}</div>
                                          {tieneDiscrepancia && it.motivoDefecto && (
                                            <span className="text-[10px] text-rose-500 font-mono block">
                                              Motivo: {it.motivoDefecto}
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300 font-bold">
                                          {it.cantidadPedida.toLocaleString()} {it.unidad}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                          {it.cantidadRecibida.toLocaleString()} {it.unidad}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-bold text-rose-600 dark:text-rose-400">
                                          {tieneDiscrepancia 
                                            ? `${(it.cantidadFaltante + it.cantidadDefectuosa).toLocaleString()} ${it.unidad}` 
                                            : '-'}
                                        </td>
                                        <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                                          ${it.costoUnitario.toFixed(2)}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                                          ${it.subtotal.toFixed(2)}
                                        </td>
                                        <td className="py-2.5 px-3 text-center">
                                          {esCompleto ? (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                              100% Conforme
                                            </span>
                                          ) : tieneDiscrepancia ? (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                                              Con Discrepancia
                                            </span>
                                          ) : (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                                              Por Recibir
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* VISTA B: HISTORIAL DE ÓRDENES DE DEVOLUCIÓN & DISCREPANCIAS EMITIDAS */}
          {subVistaRecepcion === 'devoluciones' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <RotateCcw size={16} className="text-rose-500" />
                    <span>Órdenes de Devolución & Actas de Discrepancia Emitidas</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Estas actas descuentan formalmente de la factura del proveedor los productos que no ingresaron o llegaron dañados.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 self-start sm:self-auto">
                  {ordenesDevolucion.length} Devoluciones Emitidas
                </span>
              </div>

              <div className="overflow-x-auto border rounded-xl border-slate-200 dark:border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <th className="py-2.5 px-3 font-semibold">N° Devolución</th>
                      <th className="py-2.5 px-3 font-semibold">Fecha / Hora</th>
                      <th className="py-2.5 px-3 font-semibold">OC Ref.</th>
                      <th className="py-2.5 px-3 font-semibold">Proveedor</th>
                      <th className="py-2.5 px-3 font-semibold">Productos Afectados</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Monto a Descontar</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Estado Contable</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans text-xs">
                    {ordenesDevolucion.map((dev) => (
                      <tr key={dev.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                        <td className="py-3 px-3 font-mono font-bold text-rose-600 dark:text-rose-400">
                          {dev.numeroDevolucion}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400">
                          <div>{dev.fecha}</div>
                          <span className="text-[10px] text-slate-400">{dev.hora}</span>
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {dev.numeroOCReferencia}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 dark:text-white">{dev.proveedor}</div>
                          <span className="text-[10px] font-mono text-slate-400">RUC: {dev.rucProveedor}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                          {dev.items?.map((it, i) => (
                            <div key={i} className="truncate max-w-[200px]" title={`${it.cantidadFaltante + it.cantidadDefectuosa} ${it.unidad} de ${it.insumoNombre}: ${it.motivo}`}>
                              • {it.cantidadFaltante + it.cantidadDefectuosa} {it.unidad} de {it.insumoNombre}
                            </div>
                          ))}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums text-sm">
                          ${dev.totalDescuentoUSD?.toFixed(2)} USD
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                            dev.estado === 'DESCUENTO_APLICADO_FACTURA'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                              : dev.estado === 'NOTIFICADO_PROVEEDOR'
                                ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                          }`}>
                            {dev.estado === 'DESCUENTO_APLICADO_FACTURA'
                              ? 'Descuento Aplicado'
                              : dev.estado === 'NOTIFICADO_PROVEEDOR'
                                ? 'Notificado al Proveedor'
                                : 'Pendiente en Contabilidad'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setModalDetalleDevolucion(dev)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                            title="Ver Acta Completa de Devolución"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleExportarDevolucionPDF(dev)}
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 cursor-pointer"
                            title="Descargar Acta en PDF"
                          >
                            <FileText size={14} />
                          </button>
                          <button
                            onClick={() => handleExportarDevolucionExcel(dev)}
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                            title="Descargar en Excel"
                          >
                            <FileSpreadsheet size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. SUBTAB 3: DESPACHOS A FRENTES DE OBRA & VALES LEGALIZADOS        */}
      {/* ==================================================================== */}
      {activeSubTab === 'despacho' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Vales de Despacho y Entrega a Frentes de Obra
                </h3>
                <p className="text-xs text-slate-400">
                  Legalización con firma del residente, frente de obra receptor, transportista y código de imputación presupuestaria.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModalNuevoDespacho(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Emitir Vale de Salida</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/40 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-3 font-semibold">N° Vale</th>
                    <th className="py-3 px-3 font-semibold">Fecha / Hora</th>
                    <th className="py-3 px-3 font-semibold">Frente de Obra Destino</th>
                    <th className="py-3 px-3 font-semibold">Legalizado Por (Solicitante)</th>
                    <th className="py-3 px-3 font-semibold">Material & Cantidad</th>
                    <th className="py-3 px-3 font-semibold text-right">Costo Imputado ($)</th>
                    <th className="py-3 px-3 font-semibold">Transportista / Placa</th>
                    <th className="py-3 px-3 font-semibold text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans text-xs">
                  {valesDespacho.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                        {v.numeroVale}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                        <div>{v.fecha}</div>
                        <span className="text-[10px] text-slate-400">{v.hora}</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={13} className="text-amber-500 shrink-0" />
                          <span>{v.proyectoDestino}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-normal">{v.motivoImputacion}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        <div className="font-semibold">{v.solicitadoPor}</div>
                        <span className="text-[10px] text-slate-400 font-mono block">{v.cargoSolicitante}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {v.cantidad.toLocaleString()} {v.unidad}
                        <span className="text-[10px] text-slate-400 block font-normal font-sans">{v.insumoNombre}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                        ${v.costoTotalImputado.toFixed(2)} USD
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 text-xs">
                        <div>{v.transportista}</div>
                        <span className="font-mono text-[10px] text-slate-400 font-bold">{v.placaVehiculo}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                          <CheckCircle2 size={10} />
                          Legalizado
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. SUBTAB 4: MATERIALES POR AGOTARSE EN TIEMPO REAL                 */}
      {/* ==================================================================== */}
      {activeSubTab === 'stock_critico' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle size={18} className="text-rose-500" />
                  <span>Semáforo de Abastecimiento Crítico en Obra</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Monitoreo continuo de stock actual vs Punto de Reorden (ROP) y Stock de Seguridad
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-rose-500 px-2.5 py-1 rounded bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900">
                {insumosCriticos.length} Insumos Requieren Compra Inmediata
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insumos.map((i) => {
                const esCritico = i.stockActual <= i.stockSeguridad;
                const esAlerta = i.stockActual <= i.puntoReorden && !esCritico;
                return (
                  <div
                    key={i.id}
                    className={`p-4 rounded-xl border relative transition-all ${
                      esCritico
                        ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-500/30'
                        : esAlerta
                          ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60 ring-1 ring-amber-500/30'
                          : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                        {i.codigo}
                      </span>
                      {esCritico ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white uppercase tracking-wider animate-pulse">
                          Agotándose
                        </span>
                      ) : esAlerta ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 uppercase tracking-wider">
                          Reorden
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
                          Abastecido
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug mb-3">
                      {i.nombre}
                    </h4>

                    {/* Barra de progreso de stock */}
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-slate-400">Stock Actual:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{i.stockActual} / {i.puntoReorden * 1.5} {i.unidad}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            esCritico ? 'bg-rose-500' : esAlerta ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, (i.stockActual / (i.puntoReorden * 1.5)) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t border-slate-100 dark:border-slate-700/50 mb-3 text-slate-500">
                      <div>
                        <span>Punto Reorden (ROP):</span>
                        <span className="font-bold block text-slate-700 dark:text-slate-300">{i.puntoReorden} {i.unidad}</span>
                      </div>
                      <div>
                        <span>Stock Seguridad:</span>
                        <span className="font-bold block text-slate-700 dark:text-slate-300">{i.stockSeguridad} {i.unidad}</span>
                      </div>
                    </div>

                    {(esCritico || esAlerta) && (
                      <button
                        onClick={() => {
                          alert(`Se ha generado un requerimiento urgente al área de Compras para reabastecer ${i.nombre}.`);
                        }}
                        className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus size={13} />
                        <span>Solicitar Compra Inmediata</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 7. SUBTAB 5: MERMAS TÉCNICAS & TRAZABILIDAD INVERSA                  */}
      {/* ==================================================================== */}
      {activeSubTab === 'mermas' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div>
              <span className="text-[11px] font-mono uppercase font-bold text-amber-500 tracking-wider">
                Auditoría Técnica de Construcción
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Control de Despuntes y Mermas según Normativa NEC & CICS
              </h3>
              <p className="text-xs text-slate-400">
                Límites máximos de tolerancia por categoría de material para prevenir pérdidas ocultas o desvío de insumos en obra.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Acero Corrugado</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    Tolerancia: ≤ 6.0%
                  </span>
                </div>
                <div className="text-xs font-mono space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Merma Real Registrada:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">4.2% (Dentro de norma)</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Despunte en Obra Cariamanga:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">105 kg</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Cemento Portland</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    Tolerancia: ≤ 4.0%
                  </span>
                </div>
                <div className="text-xs font-mono space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Merma Real Registrada:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">1.8% (Dentro de norma)</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Rotura / Fraguado Estiba:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">15 sacos</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Bloque & Mampostería</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    Tolerancia: ≤ 4.5%
                  </span>
                </div>
                <div className="text-xs font-mono space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Merma Real Registrada:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">2.6% (Dentro de norma)</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Rotura en Descargue:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">160 unidades</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificado de Trazabilidad Inversa */}
            <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-[11px] uppercase tracking-wider font-sans">
                <ShieldCheck size={16} />
                <span>Trazabilidad Inversa Certificada (Cadena de Custodia Legal)</span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                Cada insumo consumido en la obra cuenta con un hash único que lo enlaza con su guía de remisión, la factura electrónica autorizada por el SRI y la orden de compra aprobada.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-slate-300 text-[11px]">
                <div className="p-2 bg-slate-800/80 rounded">
                  <span className="text-slate-500 block text-[10px]">Factura SRI Vinculada:</span>
                  <span className="font-bold text-white">001-001-000045892</span>
                </div>
                <div className="p-2 bg-slate-800/80 rounded">
                  <span className="text-slate-500 block text-[10px]">RUC Emisor:</span>
                  <span className="font-bold text-white">1790012345001 (ADELCA)</span>
                </div>
                <div className="p-2 bg-slate-800/80 rounded">
                  <span className="text-slate-500 block text-[10px]">Cadena SHA-256:</span>
                  <span className="text-emerald-400 truncate block">a7f9c2...4e19</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 1: EMITIR VALE DE DESPACHO A FRENTE DE OBRA                    */}
      {/* ==================================================================== */}
      {modalNuevoDespacho && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                  <ArrowUpRight size={18} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Emitir Vale de Salida / Despacho a Obra
                  </h3>
                  <p className="text-[11px] text-slate-400">Legalización formal de salida de materiales</p>
                </div>
              </div>
              <button 
                onClick={() => setModalNuevoDespacho(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCrearDespacho} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold">Insumo a Despachar:</label>
                <select
                  value={despachoForm.insumoId}
                  onChange={(e) => setDespachoForm(prev => ({ ...prev, insumoId: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                >
                  {insumos.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nombre} (Disponible: {i.stockActual} {i.unidad} - CPP: ${i.cppActual})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold">Cantidad:</label>
                  <input
                    type="number"
                    min="1"
                    value={despachoForm.cantidad}
                    onChange={(e) => setDespachoForm(prev => ({ ...prev, cantidad: Number(e.target.value) }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold">Frente / Proyecto:</label>
                  <select
                    value={despachoForm.proyectoDestino}
                    onChange={(e) => setDespachoForm(prev => ({ ...prev, proyectoDestino: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="Torre SARA Loja (Pisos 4-8)">Torre SARA Loja</option>
                    <option value="Residencial Cariamanga Plaza">Residencial Cariamanga Plaza</option>
                    <option value="Vía de Acceso Catamayo">Vía de Acceso Catamayo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold">Legalizado Por (Solicitante):</label>
                <input
                  type="text"
                  value={despachoForm.solicitadoPor}
                  onChange={(e) => setDespachoForm(prev => ({ ...prev, solicitadoPor: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  placeholder="Ej. Ing. David Sarango (Residente de Obra)"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold">Transportista / Chofer:</label>
                  <input
                    type="text"
                    value={despachoForm.transportista}
                    onChange={(e) => setDespachoForm(prev => ({ ...prev, transportista: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    placeholder="Manuel Carrión"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold">Placa Vehículo:</label>
                  <input
                    type="text"
                    value={despachoForm.placaVehiculo}
                    onChange={(e) => setDespachoForm(prev => ({ ...prev, placaVehiculo: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                    placeholder="LBA-4589"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold">Motivo / Destino de Imputación:</label>
                <input
                  type="text"
                  value={despachoForm.motivoImputacion}
                  onChange={(e) => setDespachoForm(prev => ({ ...prev, motivoImputacion: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  placeholder="Ej. Vaciado de losa Nivel 4"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNuevoDespacho(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Confirmar & Legalizar Despacho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: ORDEN DE DEVOLUCIÓN A PROVEEDOR                             */}
      {/* ==================================================================== */}
      {modalDevolucion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-500 flex items-center justify-center font-bold">
                  <RotateCcw size={18} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Generar Orden de Devolución a Proveedor
                  </h3>
                  <p className="text-[11px] text-slate-400">Rechazo por material defectuoso, roto o incompleto</p>
                </div>
              </div>
              <button 
                onClick={() => setModalDevolucion(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCrearDevolucion} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold">Orden de Compra Ref.:</label>
                  <input
                    type="text"
                    value={devolucionForm.numeroOC}
                    onChange={(e) => setDevolucionForm(prev => ({ ...prev, numeroOC: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold">Proveedor:</label>
                  <input
                    type="text"
                    value={devolucionForm.proveedor}
                    onChange={(e) => setDevolucionForm(prev => ({ ...prev, proveedor: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold">Insumo:</label>
                  <input
                    type="text"
                    value={devolucionForm.insumoNombre}
                    onChange={(e) => setDevolucionForm(prev => ({ ...prev, insumoNombre: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold">Cantidad Devuelta:</label>
                  <input
                    type="number"
                    min="1"
                    value={devolucionForm.cantidadDevuelta}
                    onChange={(e) => setDevolucionForm(prev => ({ ...prev, cantidadDevuelta: Number(e.target.value) }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold">Motivo del Rechazo / Devolución:</label>
                <select
                  value={devolucionForm.motivo}
                  onChange={(e: any) => setDevolucionForm(prev => ({ ...prev, motivo: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="MATERIAL_DEFECTUOSO">Material Defectuoso / Roto en Descargue</option>
                  <option value="CANTIDAD_INCOMPLETA">Cantidad Incompleta respecto a Guía de Remisión</option>
                  <option value="HUMEDAD_FRAGUADO">Humedad / Fraguado Previo (Cemento)</option>
                  <option value="NO_CUMPLE_NEC">No Cumple Especificaciones Técnicas NEC</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold">Observaciones Detalladas:</label>
                <textarea
                  rows={3}
                  value={devolucionForm.observacion}
                  onChange={(e) => setDevolucionForm(prev => ({ ...prev, observacion: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  placeholder="Detalla el defecto, lote y número de guía de remisión..."
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalDevolucion(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer"
                >
                  Generar Orden de Devolución
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: CHECKLIST DE RECEPCIÓN & DESCARGUE DE ORDEN DE COMPRA       */}
      {/* ==================================================================== */}
      {modalRecepcionChecklist && selectedOCForRecepcion && (() => {
        const draftTotalAceptado = selectedOCForRecepcion.items.reduce((acc, it) => {
          const d = checklistDraft[it.id];
          const cantRec = d ? Math.max(0, Number(d.cantRecibida) || 0) : it.cantidadPedida;
          return acc + (cantRec * it.costoUnitario);
        }, 0);
        const draftTotalDescuento = selectedOCForRecepcion.items.reduce((acc, it) => {
          const d = checklistDraft[it.id];
          const cantFalt = d ? Math.max(0, Number(d.cantFaltante) || 0) : 0;
          const cantDef = d ? Math.max(0, Number(d.cantDefectuosa) || 0) : 0;
          return acc + ((cantFalt + cantDef) * it.costoUnitario);
        }, 0);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
            <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
              {/* Header Modal */}
              <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/30">
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold shrink-0">
                    <ClipboardCheck size={22} />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-slate-950">
                        {selectedOCForRecepcion.numeroOC}
                      </span>
                      <span className="text-[11px] font-mono text-amber-200">
                        Emisión: {selectedOCForRecepcion.fechaEmision}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      Checklist de Inspección Física & Recepción en Bodega Central
                    </h3>
                    <p className="text-xs text-slate-300">
                      Proveedor: <strong className="text-amber-400">{selectedOCForRecepcion.proveedor}</strong> (RUC: {selectedOCForRecepcion.rucProveedor})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={handleMarcarTodosConformes}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Asignar automáticamente el 100% de la cantidad pedida como recibida conforme"
                  >
                    <CheckCircle2 size={14} />
                    <span>Marcar Todos Conformes (100%)</span>
                  </button>
                  <button 
                    onClick={() => setModalRecepcionChecklist(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Guía de Remisión, Datos Ampliados del Chofer/Vehículo & Calificación SARA-Fletes */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                {/* Fila 1: Selección Rápida de Red SARA Fletes & Guía SRI */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                        <Truck size={14} /> Red de Choferes SARA Fletes:
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Sincronizado</span>
                    </label>
                    <select
                      onChange={(e) => {
                        const cond = SaraFletesSyncService.getConductoresSugeridos().find(c => c.nombre === e.target.value);
                        if (cond) {
                          setTransportistaChecklist(prev => ({
                            ...prev,
                            chofer: cond.nombre,
                            cedulaLicencia: cond.cedulaLicencia,
                            telefono: cond.telefono,
                            placa: cond.placa,
                            tipoVehiculo: cond.tipoVehiculo,
                            empresaTransporte: cond.empresa,
                            calificacionEstrellas: Math.round(cond.ratingHistorico),
                            tarifaFleteUSD: 280.00,
                          }));
                        }
                      }}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white"
                    >
                      <option value="">-- Seleccionar de la Red Certificada de Choferes --</option>
                      {SaraFletesSyncService.getConductoresSugeridos().map(c => (
                        <option key={c.placa} value={c.nombre}>
                          {c.nombre} • {c.placa} ({c.tipoVehiculo}) - ⭐ {c.ratingHistorico}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                      N° Guía de Remisión Física SRI:
                    </label>
                    <input
                      type="text"
                      value={transportistaChecklist.guiaRemision}
                      onChange={(e) => setTransportistaChecklist(prev => ({ ...prev, guiaRemision: e.target.value }))}
                      placeholder="001-001-000000000"
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-amber-600 dark:text-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                      Empresa de Transporte:
                    </label>
                    <input
                      type="text"
                      value={transportistaChecklist.empresaTransporte}
                      onChange={(e) => setTransportistaChecklist(prev => ({ ...prev, empresaTransporte: e.target.value }))}
                      placeholder="Transportes y Logística..."
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Fila 2: Identidad del Chofer y Datos Técnicos del Vehículo */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                      Nombre Completo Chofer:
                    </label>
                    <input
                      type="text"
                      value={transportistaChecklist.chofer}
                      onChange={(e) => setTransportistaChecklist(prev => ({ ...prev, chofer: e.target.value }))}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                      Cédula / Tipo Licencia:
                    </label>
                    <input
                      type="text"
                      value={transportistaChecklist.cedulaLicencia}
                      onChange={(e) => setTransportistaChecklist(prev => ({ ...prev, cedulaLicencia: e.target.value }))}
                      placeholder="010... - Tipo E"
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                      Placa Vehicular:
                    </label>
                    <input
                      type="text"
                      value={transportistaChecklist.placa}
                      onChange={(e) => setTransportistaChecklist(prev => ({ ...prev, placa: e.target.value }))}
                      placeholder="ABC-1234"
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                      Tipo de Vehículo de Carga:
                    </label>
                    <input
                      type="text"
                      value={transportistaChecklist.tipoVehiculo}
                      onChange={(e) => setTransportistaChecklist(prev => ({ ...prev, tipoVehiculo: e.target.value }))}
                      placeholder="Volqueta 14m³ / Plataforma"
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Fila 3: Calificación del Bodeguero para Proceder a Cancelar (Sincronizado con SARA-Fletes y Contabilidad) */}
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-3">
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block mb-1 flex items-center gap-1">
                      <Star size={13} className="fill-amber-400 text-amber-400" /> Calificación del Chofer (Bodeguero):
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setTransportistaChecklist(prev => ({ ...prev, calificacionEstrellas: star }))}
                          className="p-1 hover:scale-125 transition-transform cursor-pointer"
                        >
                          <Star
                            size={18}
                            className={star <= transportistaChecklist.calificacionEstrellas ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}
                          />
                        </button>
                      ))}
                      <span className="ml-2 font-mono font-bold text-amber-600 dark:text-amber-400">
                        {transportistaChecklist.calificacionEstrellas}/5
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                      Puntualidad en Obra:
                    </label>
                    <select
                      value={transportistaChecklist.evaluacionPuntualidad}
                      onChange={(e) => setTransportistaChecklist(prev => ({ ...prev, evaluacionPuntualidad: e.target.value as any }))}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white"
                    >
                      <option value="EXCELENTE_A_TIEMPO">A Tiempo / Adelantado</option>
                      <option value="DEMORA_JUSTIFICADA">Demora Justificada (&lt; 1h)</option>
                      <option value="RETRASO_CRITICO">Retraso Crítico (&gt; 2h)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                      Estado Físico Carga:
                    </label>
                    <select
                      value={transportistaChecklist.evaluacionCarga}
                      onChange={(e) => setTransportistaChecklist(prev => ({ ...prev, evaluacionCarga: e.target.value as any }))}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white"
                    >
                      <option value="IMPECABLE">Impecable / Sin Novedad</option>
                      <option value="CON_AVERIA_LEVE">Con Avería Leve</option>
                      <option value="DANADA_EN_TRANSITO">Dañada en Tránsito</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                      Autorización de Pago Flete (Contabilidad):
                    </label>
                    <select
                      value={transportistaChecklist.autorizacionPagoFlete}
                      onChange={(e) => setTransportistaChecklist(prev => ({ ...prev, autorizacionPagoFlete: e.target.value as any }))}
                      className={`w-full p-2 rounded-xl font-bold border ${
                        transportistaChecklist.autorizacionPagoFlete === 'APROBADO_PAGO_INMEDIATO'
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                          : transportistaChecklist.autorizacionPagoFlete === 'RETENCION_PARCIAL'
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      <option value="APROBADO_PAGO_INMEDIATO">✅ Aprobado Pago Inmediato</option>
                      <option value="RETENCION_PARCIAL">⚠️ Retención Parcial por Novedad</option>
                      <option value="BLOQUEADO_POR_DISCREPANCIA">⛔ Bloquear Liquidación</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                      Monto a Liquidar (USD):
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 font-mono font-bold text-slate-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={transportistaChecklist.tarifaFleteUSD}
                        onChange={(e) => setTransportistaChecklist(prev => ({ ...prev, tarifaFleteUSD: Number(e.target.value) || 0 }))}
                        className="w-full pl-7 pr-3 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-emerald-600 dark:text-emerald-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabla Interactiva de Ítems */}
              <div className="p-4 overflow-x-auto max-h-[46vh] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/80 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-200 dark:border-slate-700">
                      <th className="py-2.5 px-3 font-semibold">Estado</th>
                      <th className="py-2.5 px-3 font-semibold">Insumo / Descripción</th>
                      <th className="py-2.5 px-2 font-semibold text-center">Pedida</th>
                      <th className="py-2.5 px-2 font-semibold text-center text-emerald-600 dark:text-emerald-400">Recibida Conforme</th>
                      <th className="py-2.5 px-2 font-semibold text-center text-amber-600 dark:text-amber-400">Faltante</th>
                      <th className="py-2.5 px-2 font-semibold text-center text-rose-600 dark:text-rose-400">Defectuosa/Rota</th>
                      <th className="py-2.5 px-3 font-semibold">Motivo de Rechazo / Observación</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Subtotal Conforme</th>
                      <th className="py-2.5 px-3 font-semibold text-right text-rose-500">Descuento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                    {selectedOCForRecepcion.items.map((it) => {
                      const d = checklistDraft[it.id] || {
                        verificado: false,
                        cantRecibida: it.cantidadPedida,
                        cantFaltante: 0,
                        cantDefectuosa: 0,
                        motivoDefecto: '',
                      };
                      const cantRec = Number(d.cantRecibida) || 0;
                      const cantFalt = Number(d.cantFaltante) || 0;
                      const cantDef = Number(d.cantDefectuosa) || 0;
                      const esConforme = cantFalt === 0 && cantDef === 0 && cantRec === it.cantidadPedida;
                      const subAceptado = cantRec * it.costoUnitario;
                      const subDesc = (cantFalt + cantDef) * it.costoUnitario;

                      return (
                        <tr 
                          key={it.id} 
                          className={`transition-colors ${
                            !esConforme 
                              ? 'bg-rose-50/40 dark:bg-rose-950/20' 
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {esConforme ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                                <Check size={12} />
                                100% OK
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-100/80 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-300 dark:border-rose-800">
                                <AlertTriangle size={12} />
                                Discrepancia
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {it.insumoNombre}
                            </div>
                            <span className="font-mono text-[10px] text-slate-400">
                              {it.codigo} • ${it.costoUnitario.toFixed(2)}/{it.unidad}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                            {it.cantidadPedida.toLocaleString()} <span className="text-[10px] text-slate-400 font-sans">{it.unidad}</span>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <input
                              type="number"
                              min="0"
                              max={it.cantidadPedida}
                              value={d.cantRecibida}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                handleItemDraftChange(it.id, 'cantRecibida', val);
                                // Si se reduce, calcular sugerencia de faltante
                                const diferencia = it.cantidadPedida - val - (Number(d.cantDefectuosa) || 0);
                                if (diferencia >= 0) {
                                  handleItemDraftChange(it.id, 'cantFaltante', diferencia);
                                }
                              }}
                              className="w-20 p-1.5 text-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 font-mono font-bold text-emerald-700 dark:text-emerald-300"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <input
                              type="number"
                              min="0"
                              value={d.cantFaltante}
                              onChange={(e) => handleItemDraftChange(it.id, 'cantFaltante', Number(e.target.value))}
                              className="w-16 p-1.5 text-center rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 font-mono font-bold text-amber-700 dark:text-amber-300"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <input
                              type="number"
                              min="0"
                              value={d.cantDefectuosa}
                              onChange={(e) => handleItemDraftChange(it.id, 'cantDefectuosa', Number(e.target.value))}
                              className="w-16 p-1.5 text-center rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 font-mono font-bold text-rose-700 dark:text-rose-300"
                            />
                          </td>
                          <td className="py-2.5 px-3 min-w-[220px]">
                            {cantFalt > 0 || cantDef > 0 ? (
                              <select
                                value={d.motivoDefecto || 'Material Defectuoso / Roto en Descargue'}
                                onChange={(e) => handleItemDraftChange(it.id, 'motivoDefecto', e.target.value)}
                                className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-[11px] font-medium text-rose-700 dark:text-rose-300"
                              >
                                <option value="Material Defectuoso / Roto en Descargue">Material Defectuoso / Roto en Descargue</option>
                                <option value="Cantidad Incompleta respecto a Guía">Cantidad Incompleta respecto a Guía</option>
                                <option value="Humedad / Fraguado Previo (Cemento)">Humedad / Fraguado Previo (Cemento)</option>
                                <option value="No Cumple Especificaciones NEC">No Cumple Especificaciones NEC</option>
                                <option value="Envase / Empaque Averiado">Envase / Empaque Averiado</option>
                              </select>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Conforme según catálogo</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ${subAceptado.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                            {subDesc > 0 ? `-$${subDesc.toFixed(2)}` : '$0.00'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Barra de Totales y Discrepancias */}
              <div className="p-4 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="grid grid-cols-3 gap-3 text-center sm:text-left">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Orden Compra</span>
                    <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                      ${selectedOCForRecepcion.totalMontoOC.toFixed(2)} USD
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-mono block">Conforme a Kardex</span>
                    <span className="text-sm font-mono font-bold text-emerald-700 dark:text-emerald-300">
                      ${draftTotalAceptado.toFixed(2)} USD
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${
                    draftTotalDescuento > 0 
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}>
                    <span className="text-[10px] uppercase font-mono block">Total a Descontar</span>
                    <span className="text-sm font-mono font-bold">
                      ${draftTotalDescuento.toFixed(2)} USD
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end">
                  <button
                    onClick={() => setModalRecepcionChecklist(false)}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmarRecepcionChecklist}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <ClipboardCheck size={16} />
                    <span>Confirmar Asentamiento en Kardex</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ==================================================================== */}
      {/* MODAL 4: DETALLE & ACTA OFICIAL DE DEVOLUCIÓN A PROVEEDOR             */}
      {/* ==================================================================== */}
      {modalDetalleDevolucion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto p-6 sm:p-8 space-y-6">
            
            {/* Membrete Oficial GRUPO SARA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-4 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
                    GRUPO SARA • DEPARTAMENTO DE LOGÍSTICA & BODEGA CENTRAL
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  Acta Oficial de Devolución & Discrepancia Física
                </h2>
                <p className="text-xs text-slate-500">
                  Emitida de acuerdo a la Ley de Contratación / Código de Comercio y Normas Contables NIIF para el SRI.
                </p>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                  {modalDetalleDevolucion.numeroDevolucion}
                </span>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  Fecha: {modalDetalleDevolucion.fecha} • {modalDetalleDevolucion.hora}
                </div>
              </div>
            </div>

            {/* Metadatos del Proveedor y Despacho */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Proveedor</span>
                <span className="font-bold text-slate-900 dark:text-white">{modalDetalleDevolucion.proveedor}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">RUC Proveedor</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{modalDetalleDevolucion.rucProveedor}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">OC de Referencia</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{modalDetalleDevolucion.numeroOCReferencia}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Guía de Remisión</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{modalDetalleDevolucion.guiaRemision}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Factura SRI</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{modalDetalleDevolucion.numeroFacturaSRI}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Transportista</span>
                <span className="text-slate-700 dark:text-slate-300">{modalDetalleDevolucion.transportista}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Placa Vehículo</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{modalDetalleDevolucion.placaVehiculo}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Responsable Bodega</span>
                <span className="text-slate-700 dark:text-slate-300">{modalDetalleDevolucion.responsableBodega}</span>
              </div>
            </div>

            {/* Tabla de Productos Rechazados */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-[10px] font-mono uppercase text-slate-500">
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Insumo Rechazado</th>
                    <th className="py-2.5 px-2 text-center">Unidad</th>
                    <th className="py-2.5 px-2 text-center">Cant. Pedida</th>
                    <th className="py-2.5 px-2 text-center text-emerald-600">Ingresada</th>
                    <th className="py-2.5 px-2 text-center text-rose-600 font-bold">Faltante/Dañada</th>
                    <th className="py-2.5 px-3">Motivo Legal del Rechazo</th>
                    <th className="py-2.5 px-2 text-right">C. Unit ($)</th>
                    <th className="py-2.5 px-3 text-right text-rose-600 font-bold">Total a Descontar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {modalDetalleDevolucion.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">{it.insumoCodigo}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{it.insumoNombre}</td>
                      <td className="py-2.5 px-2 text-center text-slate-500">{it.unidad}</td>
                      <td className="py-2.5 px-2 text-center font-mono">{it.cantidadPedida}</td>
                      <td className="py-2.5 px-2 text-center font-mono text-emerald-600 font-bold">{it.cantidadIngresada}</td>
                      <td className="py-2.5 px-2 text-center font-mono text-rose-600 font-bold">{it.cantidadFaltante + it.cantidadDefectuosa}</td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{it.motivo}</td>
                      <td className="py-2.5 px-2 text-right font-mono">${it.costoUnitario.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">-${it.subtotalDescuento.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Banner de Valor Total Retenido / Descontado */}
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 flex items-center justify-between text-rose-950 dark:text-rose-200">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-rose-500 text-white">
                  <Receipt size={20} />
                </span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Total a Deducir en Liquidación Contable de Factura
                  </h4>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300">
                    Este valor no debe ser cancelado al proveedor y se descuenta directamente en el Three-Way Match.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-mono font-extrabold text-rose-600 dark:text-rose-400">
                  -${modalDetalleDevolucion.totalDescuentoUSD.toFixed(2)} USD
                </span>
              </div>
            </div>

            {/* Cuadro de Firmas Legales */}
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
                <div className="h-12 border-b border-slate-300 dark:border-slate-700"></div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    {modalDetalleDevolucion.responsableBodega}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Jefe de Bodega Central • GRUPO SARA
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
                <div className="h-12 border-b border-slate-300 dark:border-slate-700"></div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    {modalDetalleDevolucion.transportista}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Transportista / Conductor (Aceptación de Carga Devuelta)
                  </span>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportarDevolucionPDF(modalDetalleDevolucion)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText size={16} />
                  <span>Descargar Acta en PDF</span>
                </button>
                <button
                  onClick={() => handleExportarDevolucionExcel(modalDetalleDevolucion)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet size={16} />
                  <span>Exportar a Excel</span>
                </button>
              </div>

              <button
                onClick={() => setModalDetalleDevolucion(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal del Agente Especializado Auditor de Base de Datos */}
      <SaraDatabaseAuditorModal
        isOpen={auditorModalOpen}
        onClose={() => setAuditorModalOpen(false)}
      />

    </div>
  );
}

