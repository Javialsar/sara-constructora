'use client';

import React, { useState } from 'react';
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
  Printer
} from 'lucide-react';
import { exportarAExcel, exportarAPDF } from '@/lib/services/exportReports';

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

export interface OrdenCompraRecepcion {
  id: string;
  numeroOC: string;
  proveedor: string;
  rucProveedor: string;
  fechaEmision: string;
  estado: 'PENDIENTE_RECEPCION' | 'RECEPCION_PARCIAL' | 'RECEPCION_COMPLETA' | 'CON_DEVOLUCION';
  items: {
    insumoId: string;
    insumoNombre: string;
    unidad: string;
    cantidadPedida: number;
    cantidadRecibida: number;
    costoUnitario: number;
    subtotal: number;
  }[];
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
}

export function BodegaKardexSection({ user }: { user: any }) {
  const [activeSubTab, setActiveSubTab] = useState<'kardex' | 'recepcion' | 'despacho' | 'stock_critico' | 'mermas'>('kardex');
  const [selectedInsumoId, setSelectedInsumoId] = useState<string>('cemento_holcim');
  const [searchTerm, setSearchTerm] = useState('');

  // Modales
  const [modalNuevoDespacho, setModalNuevoDespacho] = useState(false);
  const [modalRecepcionOC, setModalRecepcionOC] = useState(false);
  const [modalDevolucion, setModalDevolucion] = useState(false);
  const [selectedOCForRecepcion, setSelectedOCForRecepcion] = useState<OrdenCompraRecepcion | null>(null);

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

  // Form states para devolución
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
  // ÓRDENES DE COMPRA EN BODEGA PARA RECEPCIÓN
  // ============================================================================
  const [ordenesCompra, setOrdenesCompra] = useState<OrdenCompraRecepcion[]>([
    {
      id: 'OC-2026-084',
      numeroOC: 'OC-2026-084',
      proveedor: 'ADELCA ACEROS DEL ECUADOR C.A.',
      rucProveedor: '1790012345001',
      fechaEmision: '2026-10-16',
      estado: 'RECEPCION_COMPLETA',
      items: [
        {
          insumoId: 'acero_adelca_12',
          insumoNombre: 'Varilla Acero Adelca 12mm x 12m',
          unidad: 'kg',
          cantidadPedida: 27000,
          cantidadRecibida: 27000,
          costoUnitario: 1.18,
          subtotal: 31860.00,
        }
      ]
    },
    {
      id: 'OC-2026-092',
      numeroOC: 'OC-2026-092',
      proveedor: 'HOLCIM ECUADOR S.A.',
      rucProveedor: '0990004589001',
      fechaEmision: '2026-10-18',
      estado: 'PENDIENTE_RECEPCION',
      items: [
        {
          insumoId: 'cemento_holcim',
          insumoNombre: 'Cemento Holcim Fuerte 50kg',
          unidad: 'Saco',
          cantidadPedida: 800,
          cantidadRecibida: 0,
          costoUnitario: 7.45,
          subtotal: 5960.00,
        }
      ]
    },
    {
      id: 'OC-2026-105',
      numeroOC: 'OC-2026-105',
      proveedor: 'CANTERA & MINAS CATAMAYO CIA. LTDA.',
      rucProveedor: '1190045612001',
      fechaEmision: '2026-10-18',
      estado: 'PENDIENTE_RECEPCION',
      items: [
        {
          insumoId: 'arena_gruesa',
          insumoNombre: 'Arena Gruesa de Mina Lavada',
          unidad: 'm³',
          cantidadPedida: 50,
          cantidadRecibida: 0,
          costoUnitario: 14.50,
          subtotal: 725.00,
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
  // ÓRDENES DE DEVOLUCIÓN A PROVEEDOR
  // ============================================================================
  const [ordenesDevolucion, setOrdenesDevolucion] = useState<OrdenDevolucion[]>([
    {
      id: 'DEV-001',
      numeroDevolucion: 'DEV-PROV-2026-004',
      numeroOCReferencia: 'OC-2026-068',
      proveedor: 'HOLCIM ECUADOR S.A.',
      fecha: '2026-10-12',
      insumoNombre: 'Cemento Holcim Fuerte 50kg',
      cantidadDevuelta: 60,
      unidad: 'Sacos',
      motivo: 'HUMEDAD_FRAGUADO',
      observacion: 'Sacos compactados con endurecimiento temprano por lluvia durante traslado del transportista.',
      responsableBodega: user?.nombre || 'Jefe de Bodega SARA',
    }
  ]);

  // Insumo actualmente seleccionado en el Kardex
  const currentInsumo = insumos.find(i => i.id === selectedInsumoId) || insumos[0];
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

    setOrdenesDevolucion(prev => [nuevaDev, ...prev]);
    setModalDevolucion(false);
    alert(`¡Orden de Devolución ${numDevolucion} emitida al proveedor exitosamente! Se adjuntó al expediente de compra.`);
  };

  // 3. Exportar Kardex a Excel
  const handleExportExcelKardex = () => {
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

    exportarAExcel(dataExport, `Kardex_${currentInsumo.codigo}_${currentInsumo.nombre.replace(/ /g, '_')}`, 'Kardex Oficial');
  };

  // 4. Exportar Kardex a PDF
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

    exportarAPDF(
      `TARJETA OFICIAL DE KARDEX: ${currentInsumo.nombre.toUpperCase()}`,
      encabezados,
      filas,
      `Kardex_Oficial_${currentInsumo.codigo}`,
      `Código: ${currentInsumo.codigo} • Unidad: ${currentInsumo.unidad} • Bodega Matriz SARA • Método: Costo Promedio Ponderado (CPP)`
    );
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
          
          {/* Barra de Filtros & Selector de Insumos */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                    {insumos.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.codigo} - {i.nombre} ({i.stockActual} {i.unidad} en stock)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Botones de Exportación Oficiales (Excel / PDF) */}
              <div className="flex items-center gap-2 pt-2 md:pt-4">
                <button
                  onClick={handleExportExcelKardex}
                  title="Exportar a Excel nativo (.xlsx)"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet size={15} />
                  <span>Exportar a Excel</span>
                </button>

                <button
                  onClick={handleExportPdfKardex}
                  title="Descargar Ficha Oficial en PDF"
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText size={15} className="text-amber-400" />
                  <span>Descargar PDF</span>
                </button>
              </div>
            </div>

            {/* Ficha Resumen del Insumo Seleccionado */}
            <div className="mt-5 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
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
          </div>

          {/* Tabla de Movimientos del Kardex (Formato Normativo) */}
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

        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. SUBTAB 2: RECEPCIÓN DE MERCADERÍA (POR ORDEN DE COMPRA)          */}
      {/* ==================================================================== */}
      {activeSubTab === 'recepcion' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Órdenes de Compra Emitidas para Ingreso en Bodega
                </h3>
                <p className="text-xs text-slate-400">
                  Cotejo de cantidades pedidas vs recibidas por transportista. En caso de fallas o faltantes, emite la Orden de Devolución.
                </p>
              </div>

              <button
                onClick={() => setModalDevolucion(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <RotateCcw size={15} />
                <span>Emitir Orden de Devolución</span>
              </button>
            </div>

            <div className="space-y-4">
              {ordenesCompra.map((oc) => (
                <div key={oc.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">{oc.numeroOC}</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{oc.proveedor}</span>
                      <span className="text-[10px] font-mono text-slate-400">RUC: {oc.rucProveedor}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                        oc.estado === 'RECEPCION_COMPLETA'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {oc.estado.replace('_', ' ')}
                      </span>

                      {oc.estado !== 'RECEPCION_COMPLETA' && (
                        <button
                          onClick={() => {
                            setSelectedOCForRecepcion(oc);
                            setModalRecepcionOC(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 size={13} />
                          <span>Procesar Ingreso</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Detalle de ítems de la OC */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="text-[10px] font-mono uppercase text-slate-400 border-b border-slate-200 dark:border-slate-700/40">
                          <th className="py-1.5 font-semibold">Insumo</th>
                          <th className="py-1.5 font-semibold text-right">Cant. Pedida</th>
                          <th className="py-1.5 font-semibold text-right">Cant. Recibida</th>
                          <th className="py-1.5 font-semibold text-right">Costo Unit.</th>
                          <th className="py-1.5 font-semibold text-right">Total OC</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700/30 font-mono text-xs tabular-nums">
                        {oc.items.map((it, idx) => (
                          <tr key={idx}>
                            <td className="py-2 font-sans font-medium text-slate-900 dark:text-white">
                              {it.insumoNombre}
                            </td>
                            <td className="py-2 text-right text-slate-600 dark:text-slate-300">
                              {it.cantidadPedida.toLocaleString()} {it.unidad}
                            </td>
                            <td className="py-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                              {it.cantidadRecibida.toLocaleString()} {it.unidad}
                            </td>
                            <td className="py-2 text-right text-slate-600 dark:text-slate-300">
                              ${it.costoUnitario.toFixed(2)}
                            </td>
                            <td className="py-2 text-right font-bold text-slate-900 dark:text-white">
                              ${it.subtotal.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Historial de Órdenes de Devolución Emitidas */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <RotateCcw size={16} className="text-rose-500" />
                  <span>Historial de Órdenes de Devolución a Proveedores</span>
                </h3>
                <p className="text-xs text-slate-400">Materiales rechazados por avería, humedad o faltantes en flete</p>
              </div>
              <span className="text-xs font-mono font-bold text-rose-500">
                {ordenesDevolucion.length} Devoluciones Registradas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/40 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2.5 px-3 font-semibold">N° Devolución</th>
                    <th className="py-2.5 px-3 font-semibold">Fecha</th>
                    <th className="py-2.5 px-3 font-semibold">OC Origen</th>
                    <th className="py-2.5 px-3 font-semibold">Proveedor</th>
                    <th className="py-2.5 px-3 font-semibold">Insumo & Cantidad</th>
                    <th className="py-2.5 px-3 font-semibold">Motivo Rechazo</th>
                    <th className="py-2.5 px-3 font-semibold">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans text-xs">
                  {ordenesDevolucion.map((dev) => (
                    <tr key={dev.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                      <td className="py-2.5 px-3 font-mono font-bold text-rose-600 dark:text-rose-400">{dev.numeroDevolucion}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{dev.fecha}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">{dev.numeroOCReferencia}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{dev.proveedor}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {dev.cantidadDevuelta} {dev.unidad} de {dev.insumoNombre}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300">
                          {dev.motivo.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-xs truncate" title={dev.observacion}>
                        {dev.observacion}
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

    </div>
  );
}
