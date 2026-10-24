'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ModuloIntroSplash from '@/components/ui/ModuloIntroSplash';
import { 
  Building2, 
  ShoppingCart, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  Truck, 
  ShieldCheck, 
  PackageCheck, 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  Layers, 
  Printer, 
  Download, 
  Eye, 
  Check, 
  X, 
  Sparkles, 
  ArrowRight, 
  Boxes, 
  Warehouse, 
  FileSpreadsheet, 
  Star, 
  Send,
  AlertTriangle,
  RotateCcw,
  Percent
} from 'lucide-react';
import { 
  ComprasService, 
  RequisicionCompra, 
  CotizacionProveedor, 
  OrdenCompraOficial, 
  RecepcionMaterial, 
  VarianzaApuItem, 
  ProveedorDirectorio,
  PrioridadCompra,
  ItemRequisicion
} from '@/lib/services/comprasService';
import { OrdenCompraVoucherModal } from '@/components/compras/OrdenCompraVoucherModal';
import { ApuRequisitionComprasWorkflow } from '@/components/compras/ApuRequisitionComprasWorkflow';
import { 
  SellerMarketplaceService, 
  MarketplaceProduct, 
  SellerProfile, 
  SELLER_PLANS 
} from '@/lib/services/sellerMarketplaceService';
import { MarketplaceProductDetailModal } from '@/components/compras/MarketplaceProductDetailModal';
import { SellerHubModal } from '@/components/compras/SellerHubModal';
import { MarketplaceVitrinaSection } from '@/components/compras/MarketplaceVitrinaSection';

type ComprasTab = 
  | 'tablero'
  | 'requisiciones'
  | 'cotizaciones'
  | 'ordenes'
  | 'recepciones'
  | 'sri_match'
  | 'varianza_apu'
  | 'proveedores'
  | 'flujo_agentico';

export default function ModuloComprasMasterPage() {
  // 1. Estados Principales
  const [primaryMode, setPrimaryMode] = useState<'marketplace' | 'gestion_constructora'>('marketplace');
  const [activeTab, setActiveTab] = useState<ComprasTab>('tablero');
  const [proyectoFiltro, setProyectoFiltro] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  // Estados del Marketplace B2B y Catálogo de Fabricantes
  const [marketplaceSearch, setMarketplaceSearch] = useState('');
  const [marketplaceCategoria, setMarketplaceCategoria] = useState<string>('TODAS');
  const [marketplaceSellerId, setMarketplaceSellerId] = useState<string>('TODOS');
  const [marketplacePlanFiltro, setMarketplacePlanFiltro] = useState<string>('TODOS');
  const [marketplaceSoloMasVendidos, setMarketplaceSoloMasVendidos] = useState(false);
  const [marketplaceTarifaIva, setMarketplaceTarifaIva] = useState<number | undefined>(undefined);

  // Modales del Marketplace y Seller Hub
  const [productoParaVerDetalle, setProductoParaVerDetalle] = useState<MarketplaceProduct | null>(null);
  const [sellerHubModalOpen, setSellerHubModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<{ product: MarketplaceProduct; cantidad: number }[]>([]);
  const [sellerRefreshCounter, setSellerRefreshCounter] = useState(0);

  // Productos del marketplace ordenados por jerarquía de Plan VIP -> Estándar -> Básico
  const marketplaceProductos = useMemo(() => {
    return SellerMarketplaceService.getMarketplaceProducts({
      search: marketplaceSearch,
      categoria: marketplaceCategoria === 'TODAS' ? undefined : marketplaceCategoria,
      sellerId: marketplaceSellerId === 'TODOS' ? undefined : marketplaceSellerId,
      plan: marketplacePlanFiltro === 'TODOS' ? undefined : (marketplacePlanFiltro as any),
      masVendidos: marketplaceSoloMasVendidos ? true : undefined,
      tarifaIva: marketplaceTarifaIva
    });
  }, [marketplaceSearch, marketplaceCategoria, marketplaceSellerId, marketplacePlanFiltro, marketplaceSoloMasVendidos, marketplaceTarifaIva, sellerRefreshCounter]);

  const sellersList = useMemo(() => {
    return SellerMarketplaceService.getSellersList();
  }, [sellerRefreshCounter]);
  
  // Datos reactivos del Servicio de Compras
  const [requisiciones, setRequisiciones] = useState<RequisicionCompra[]>([]);
  const [cotizaciones, setCotizaciones] = useState<CotizacionProveedor[]>([]);
  const [ordenes, setOrdenes] = useState<OrdenCompraOficial[]>([]);
  const [recepciones, setRecepciones] = useState<RecepcionMaterial[]>([]);
  const [proveedores, setProveedores] = useState<ProveedorDirectorio[]>([]);
  const [varianzasApu, setVarianzasApu] = useState<VarianzaApuItem[]>([]);
  
  // Proyectos disponibles
  const proyectos = useMemo(() => ComprasService.getProyectos(), []);

  // Modal de Orden de Compra Oficial (Voucher / Impresión)
  const [ocParaVer, setOcParaVer] = useState<OrdenCompraOficial | null>(null);

  // Mensaje de éxito / notificación temporal
  const [feedbackNotice, setFeedbackNotice] = useState<{ tipo: 'success' | 'error' | 'info'; texto: string } | null>(null);

  // Estados de Modales y Formularios
  const [modalNuevaReq, setModalNuevaReq] = useState(false);
  const [modalRecepcion, setModalRecepcion] = useState(false);
  const [ocSeleccionadaParaRecepcion, setOcSeleccionadaParaRecepcion] = useState<OrdenCompraOficial | null>(null);
  const [modalAdjudicacion, setModalAdjudicacion] = useState<{ cotizacion: CotizacionProveedor } | null>(null);
  const [justificacionAdjudicacion, setJustificacionAdjudicacion] = useState('');

  // Formulario de Nueva Requisición
  const [formReq, setFormReq] = useState({
    proyectoId: proyectos[0]?.id || 'proy-uio-01',
    frenteTrabajo: '',
    solicitanteNombre: 'Ing. Residente de Obra',
    solicitanteCargo: 'Residente Técnico',
    fechaRequeridaObra: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    prioridad: 'NORMAL_PROGRAMADA' as PrioridadCompra,
    justificacion: '',
    items: [
      {
        codigoInsumo: 'INS-MAT-012',
        descripcion: 'Varilla Corrugada fy=4200 Ø12mm x 12m',
        categoria: 'ACERO' as ItemRequisicion['categoria'],
        unidad: 'quintal (qq)',
        cantidadRequerida: 50,
        desperdicioNormativoPct: 6.0,
        costoUnitarioReferencialApuUSD: 46.50,
        rubroApuCodigo: 'EST-HARM-004',
        proveedorSugerido: 'ADELCA'
      }
    ]
  });

  // Formulario de Recepción en Bodega
  const [formRecepcion, setFormRecepcion] = useState({
    guiaRemisionNumero: '',
    responsableBodeguero: 'Bodeguero de Turno',
    observaciones: '',
    cantidadesRecibidas: {} as Record<string, number>,
    estadosInspeccion: {} as Record<string, 'CONFORME' | 'DANADO' | 'RECHAZADO'>
  });

  // Carga inicial y reactiva de datos
  const refrescarDatos = () => {
    const proyId = proyectoFiltro === 'TODOS' ? undefined : proyectoFiltro;
    setRequisiciones(ComprasService.getRequisiciones(proyId));
    setCotizaciones(ComprasService.getCotizaciones());
    setOrdenes(ComprasService.getOrdenesCompra(proyId));
    setRecepciones(ComprasService.getRecepciones());
    setProveedores(ComprasService.getProveedores());
    setVarianzasApu(ComprasService.getVarianzaPresupuestariaApu(proyId));
  };

  useEffect(() => {
    refrescarDatos();
  }, [proyectoFiltro]);

  const kpis = useMemo(() => {
    return ComprasService.getKpisCompras(proyectoFiltro === 'TODOS' ? undefined : proyectoFiltro);
  }, [requisiciones, ordenes, recepciones, varianzasApu, proyectoFiltro]);

  // Manejador: Crear Requisición
  const handleCrearRequisicion = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formReq.frenteTrabajo.trim()) {
        throw new Error('Debe especificar el Frente de Trabajo o Ubicación de Obra.');
      }
      if (!formReq.justificacion.trim()) {
        throw new Error('Debe ingresar la Justificación Técnica de la Requisición.');
      }
      const nueva = ComprasService.crearRequisicion({
        proyectoId: formReq.proyectoId,
        frenteTrabajo: formReq.frenteTrabajo,
        solicitanteNombre: formReq.solicitanteNombre,
        solicitanteCargo: formReq.solicitanteCargo,
        fechaRequeridaObra: formReq.fechaRequeridaObra,
        prioridad: formReq.prioridad,
        justificacion: formReq.justificacion,
        items: formReq.items
      });
      setModalNuevaReq(false);
      refrescarDatos();
      setFeedbackNotice({
        tipo: 'success',
        texto: `Requisición ${nueva.folio} creada en Borrador exitosamente.`
      });
    } catch (err: any) {
      setFeedbackNotice({ tipo: 'error', texto: err.message });
    }
  };

  // Manejador: Cambiar estado requisición (Enviar / Aprobar / Rechazar)
  const handleAccionRequisicion = (id: string, nuevoEstado: any, aprobador?: string) => {
    try {
      ComprasService.cambiarEstadoRequisicion(id, nuevoEstado, {
        aprobador: aprobador || 'Ing. Fiscalizador Residente'
      });
      refrescarDatos();
      setFeedbackNotice({
        tipo: 'success',
        texto: `Requisición actualizada a estado: ${nuevoEstado}.`
      });
    } catch (err: any) {
      setFeedbackNotice({ tipo: 'error', texto: err.message });
    }
  };

  // Manejador: Adjudicar Cotización y Generar Orden de Compra
  const handleConfirmarAdjudicacion = () => {
    if (!modalAdjudicacion) return;
    try {
      if (!justificacionAdjudicacion.trim()) {
        throw new Error('Debe proporcionar la Justificación Técnica/Económica de la Adjudicación.');
      }
      // 1. Adjudicar la cotización
      ComprasService.adjudicarCotizacion(modalAdjudicacion.cotizacion.id, justificacionAdjudicacion);

      // 2. Emitir Orden de Compra automáticamente
      const nuevaOC = ComprasService.emitirOrdenCompraDesdeCotizacion({
        cotizacionId: modalAdjudicacion.cotizacion.id,
        responsableEmision: 'Jefatura de Compras Grupo SARA',
        responsableAprobacion: 'Dirección Técnica de Fiscalización'
      });

      setModalAdjudicacion(null);
      setJustificacionAdjudicacion('');
      refrescarDatos();
      setOcParaVer(nuevaOC);
      setFeedbackNotice({
        tipo: 'success',
        texto: `¡Cotización adjudicada! Se ha emitido la Orden de Compra ${nuevaOC.folio} con precios y condiciones congeladas.`
      });
    } catch (err: any) {
      setFeedbackNotice({ tipo: 'error', texto: err.message });
    }
  };

  // Abrir Modal de Recepción
  const handleAbrirRecepcion = (oc: OrdenCompraOficial) => {
    setOcSeleccionadaParaRecepcion(oc);
    const initialCantidades: Record<string, number> = {};
    const initialEstados: Record<string, 'CONFORME' | 'DANADO' | 'RECHAZADO'> = {};
    oc.items.forEach(it => {
      initialCantidades[it.id] = it.cantidadPendiente;
      initialEstados[it.id] = 'CONFORME';
    });
    setFormRecepcion({
      guiaRemisionNumero: `GR-MTOP-${Math.floor(10000 + Math.random() * 90000)}`,
      responsableBodeguero: 'Manuel Guachamín (Bodeguero)',
      observaciones: 'Ingreso conforme en bodega de obra.',
      cantidadesRecibidas: initialCantidades,
      estadosInspeccion: initialEstados
    });
    setModalRecepcion(true);
  };

  // Manejador: Confirmar Recepción en Bodega
  const handleConfirmarRecepcion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ocSeleccionadaParaRecepcion) return;
    try {
      const itemsPayload = ocSeleccionadaParaRecepcion.items.map(it => {
        const cant = Number(formRecepcion.cantidadesRecibidas[it.id]) || 0;
        const estado = formRecepcion.estadosInspeccion[it.id] || 'CONFORME';
        return {
          itemOrdenId: it.id,
          cantidadEntregada: cant,
          cantidadAceptadaConforme: estado === 'CONFORME' ? cant : 0,
          cantidadDanadaRechazada: estado !== 'CONFORME' ? cant : 0,
          estadoInspeccion: estado,
          motivoObservacion: estado !== 'CONFORME' ? 'Material reportado dañado o no conforme con especificaciones INEN' : undefined
        };
      }).filter(it => it.cantidadEntregada > 0);

      if (itemsPayload.length === 0) {
        throw new Error('Debe ingresar una cantidad recibida mayor a cero en al menos un ítem.');
      }

      const rec = ComprasService.registrarRecepcionMaterial({
        ordenCompraId: ocSeleccionadaParaRecepcion.id,
        guiaRemisionNumero: formRecepcion.guiaRemisionNumero,
        responsableBodeguero: formRecepcion.responsableBodeguero,
        observaciones: formRecepcion.observaciones,
        itemsRecepcion: itemsPayload
      });

      setModalRecepcion(false);
      setOcSeleccionadaParaRecepcion(null);
      refrescarDatos();
      setFeedbackNotice({
        tipo: 'success',
        texto: `Recepción ${rec.folioRecepcion} registrada exitosamente. Saldo de OC actualizado y asiento Kardex generado.`
      });
    } catch (err: any) {
      setFeedbackNotice({ tipo: 'error', texto: err.message });
    }
  };

  return (
    <>
      <ModuloIntroSplash modulo="compras" />
      
      {/* VOUCHER MODAL DE ORDEN DE COMPRA (IMPRIMIBLE / PDF) */}
      <OrdenCompraVoucherModal 
        orden={ocParaVer} 
        onClose={() => setOcParaVer(null)} 
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-20 text-slate-900 dark:text-slate-100">
        
        {/* BANNER CORPORATIVO & HEADER */}
        <div className="bg-slate-900 text-white border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg">
                    SARA COMPRAS & APU
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Control de Adquisiciones • Normativa NEC-15 / SRI 2026
                  </span>
                </div>
                <h1 className="text-3xl font-black tracking-tight mt-2 flex items-center gap-3">
                  <ShoppingCart className="w-8 h-8 text-amber-500" />
                  Módulo de Compras & Abastecimiento de Obra
                </h1>
                <p className="text-sm text-slate-400 max-w-2xl mt-1">
                  Gestión integral del ciclo de adquisiciones: Requisición con techo APU, cotización multicriterio con flete MTOP, emisión de OC congelada, recepción en bodega e integración 3-Way Match con SRI.
                </p>
              </div>

              {/* Selector de Proyecto Global */}
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 min-w-[280px]">
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Filtrar por Obra / Proyecto Civil:
                </label>
                <select
                  value={proyectoFiltro}
                  onChange={(e) => setProyectoFiltro(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="TODOS">Todas las Obras de la Empresa</option>
                  {proyectos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.canton})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* BARRA DE NAVEGACIÓN DE PESTAÑAS (8 CAPACIDADES DEL PROMPT MAESTRO) */}
            <div className="flex items-center gap-2 overflow-x-auto pt-6 border-t border-slate-800/80 mt-6 scrollbar-none">
              {[
                { id: 'tablero', label: 'Tablero Operativo & KPIs', icon: Boxes },
                { id: 'requisiciones', label: 'Requisiciones de Obra', icon: FileText, badge: kpis.requisicionesPendientes },
                { id: 'cotizaciones', label: 'Cotizaciones & Comparativo', icon: DollarSign },
                { id: 'ordenes', label: 'Órdenes de Compra (OC)', icon: ShoppingCart, badge: kpis.ordenesActivas },
                { id: 'recepciones', label: 'Recepciones en Bodega', icon: Warehouse },
                { id: 'varianza_apu', label: 'Control Varianza APU', icon: TrendingDown },
                { id: 'sri_match', label: '3-Way Match & Facturas SRI', icon: ShieldCheck },
                { id: 'proveedores', label: 'Directorio Proveedores', icon: Building2 },
                { id: 'flujo_agentico', label: 'Procuramiento Autónomo IA', icon: Sparkles },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as ComprasTab)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap flex items-center gap-2 transition-all ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-slate-950 text-amber-500' : 'bg-amber-500 text-slate-950'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* NOTIFICACIÓN / FEEDBACK TEMPORAL */}
        {feedbackNotice && (
          <div className="max-w-7xl mx-auto px-6 mt-4">
            <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-mono ${
              feedbackNotice.tipo === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' :
              feedbackNotice.tipo === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400' :
              'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
            }`}>
              <div className="flex items-center gap-2">
                {feedbackNotice.tipo === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{feedbackNotice.texto}</span>
              </div>
              <button onClick={() => setFeedbackNotice(null)} className="opacity-70 hover:opacity-100">✕</button>
            </div>
          </div>
        )}

        {/* CONTENEDOR PRINCIPAL */}
        <div className="max-w-7xl mx-auto px-6 mt-8">

          {/* ========================================================================= */}
          {/* TAB 1: TABLERO OPERATIVO & KPIS                                           */}
          {/* ========================================================================= */}
          {activeTab === 'tablero' && (
            <div className="space-y-8">
              {/* KPIS CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-slate-400">Requisiciones</span>
                    <span className="p-2 bg-blue-500/10 text-blue-500 rounded-xl"><FileText className="w-4 h-4" /></span>
                  </div>
                  <div className="text-2xl font-black mt-2 font-mono">{kpis.totalRequisiciones}</div>
                  <p className="text-xs text-amber-500 font-bold mt-1">
                    {kpis.requisicionesPendientes} pendientes de revisión / cotización
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-slate-400">Órdenes Activas</span>
                    <span className="p-2 bg-amber-500/10 text-amber-500 rounded-xl"><ShoppingCart className="w-4 h-4" /></span>
                  </div>
                  <div className="text-2xl font-black mt-2 font-mono">{kpis.ordenesActivas}</div>
                  <p className="text-xs text-slate-500 mt-1">
                    De {kpis.totalOrdenesEmitidas} OCs emitidas oficialmente
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-slate-400">Volumen Comprometido</span>
                    <span className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl"><DollarSign className="w-4 h-4" /></span>
                  </div>
                  <div className="text-2xl font-black mt-2 font-mono text-emerald-500">
                    ${kpis.volumenTotalOrdenadoUSD.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Total ordenado con IVA 5%/15% y fletes</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-slate-400">Ahorro Conseguido vs APU</span>
                    <span className="p-2 bg-purple-500/10 text-purple-500 rounded-xl"><TrendingDown className="w-4 h-4" /></span>
                  </div>
                  <div className="text-2xl font-black mt-2 font-mono text-purple-500">
                    +${kpis.ahorroTotalUSD.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Negociación mayorista y Landed Cost</p>
                </div>
              </div>

              {/* MAPA DEL FLUJO TRANSACCIONAL DEL CICLO DE COMPRAS */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="font-extrabold text-base flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-amber-500" />
                      Ciclo Transaccional de Compras Normado
                    </h3>
                    <p className="text-xs text-slate-500">
                      Trazabilidad auditable desde la necesidad en obra civil hasta el cierre documental contable
                    </p>
                  </div>
                  <button
                    onClick={() => setModalNuevaReq(true)}
                    className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-amber-400 shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crear Requisición de Obra</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2 text-xs font-mono">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-amber-500 font-bold">FASE 1</span>
                    <h4 className="font-bold text-slate-900 dark:text-white">1. Requisición APU</h4>
                    <p className="text-[11px] text-slate-500 font-sans">
                      El Residente solicita materiales vinculados al rubro APU y techo presupuestario.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-blue-500 font-bold">FASE 2</span>
                    <h4 className="font-bold text-slate-900 dark:text-white">2. Cotizaciones</h4>
                    <p className="text-[11px] text-slate-500 font-sans">
                      Evaluación de 2 a 4 proveedores, fletes MTOP por Ton-Km e IVA 5% vs 15%.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-purple-500 font-bold">FASE 3</span>
                    <h4 className="font-bold text-slate-900 dark:text-white">3. Orden de Compra</h4>
                    <p className="text-[11px] text-slate-500 font-sans">
                      Adjudicación oficial con folio persistente, condiciones congeladas y voucher PDF.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-emerald-500 font-bold">FASE 4</span>
                    <h4 className="font-bold text-slate-900 dark:text-white">4. Recepción Bodega</h4>
                    <p className="text-[11px] text-slate-500 font-sans">
                      Entregas totales o parciales, control de saldo pendiente y asiento automático en Kardex.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-amber-500 font-bold">FASE 5</span>
                    <h4 className="font-bold text-slate-900 dark:text-white">5. 3-Way Match SRI</h4>
                    <p className="text-[11px] text-slate-500 font-sans">
                      Cotejo de factura electrónica XML con la OC y la recepción para retención (312/344).
                    </p>
                  </div>
                </div>
              </div>

              {/* LISTA RÁPIDA: ÚLTIMAS ÓRDENES EMITIDAS */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-amber-500" />
                    Órdenes de Compra Recientes
                  </h3>
                  <button 
                    onClick={() => setActiveTab('ordenes')}
                    className="text-xs text-amber-500 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Ver todas las órdenes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                      <tr>
                        <th className="p-3">Folio</th>
                        <th className="p-3">Obra / Proyecto</th>
                        <th className="p-3">Proveedor</th>
                        <th className="p-3">Fecha Emisión</th>
                        <th className="p-3 text-right">Total ($)</th>
                        <th className="p-3 text-center">Estado</th>
                        <th className="p-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                      {ordenes.slice(0, 5).map(oc => (
                        <tr key={oc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-amber-500">{oc.folio}</td>
                          <td className="p-3 font-sans text-slate-900 dark:text-white font-medium">{oc.proyectoNombre}</td>
                          <td className="p-3 font-sans">{oc.proveedorRazonSocial}</td>
                          <td className="p-3 text-slate-500">{oc.fechaEmision}</td>
                          <td className="p-3 text-right font-bold text-slate-900 dark:text-white">${oc.totalPagarUSD.toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              oc.estado === 'RECIBIDA_TOTAL' ? 'bg-emerald-500/20 text-emerald-500' :
                              oc.estado === 'RECIBIDA_PARCIAL' ? 'bg-blue-500/20 text-blue-500' :
                              oc.estado === 'EMITIDA' ? 'bg-amber-500/20 text-amber-500' :
                              'bg-slate-500/20 text-slate-400'
                            }`}>
                              {oc.estado.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => setOcParaVer(oc)}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ver Documento</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: REQUISICIONES DE COMPRA (OBRA & APU)                               */}
          {/* ========================================================================= */}
          {activeTab === 'requisiciones' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-500" />
                    Requisiciones de Compra de Obra
                  </h2>
                  <p className="text-xs text-slate-500">
                    Solicitudes de insumos con control de techo presupuestario y desperdicio normativo NEC-15
                  </p>
                </div>
                <button
                  onClick={() => setModalNuevaReq(true)}
                  className="px-4 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-amber-400 shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nueva Requisición de Obra</span>
                </button>
              </div>

              {/* LISTA DE REQUISICIONES */}
              <div className="grid grid-cols-1 gap-4">
                {requisiciones.map(req => (
                  <div key={req.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="p-2.5 bg-amber-500/10 text-amber-500 font-mono font-black text-sm rounded-xl">
                          {req.folio}
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{req.proyectoNombre}</h4>
                          <p className="text-xs text-slate-500">
                            Frente: <strong>{req.frenteTrabajo}</strong> • Emisión: {req.fechaEmision} • Entrega requerida: <strong>{req.fechaRequeridaObra}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase ${
                          req.prioridad === 'EMERGENCIA_CRITICA' ? 'bg-red-500/20 text-red-500' :
                          req.prioridad === 'URGENTE_24H' ? 'bg-amber-500/20 text-amber-500' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {req.prioridad.replace('_', ' ')}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase ${
                          req.estado === 'APROBADA' || req.estado === 'OC_EMITIDA' ? 'bg-emerald-500/20 text-emerald-500' :
                          req.estado === 'EN_COTIZACION' ? 'bg-blue-500/20 text-blue-500' :
                          req.estado === 'RECHAZADA' ? 'bg-red-500/20 text-red-500' :
                          'bg-amber-500/20 text-amber-500'
                        }`}>
                          {req.estado.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                      "{req.justificacion}"
                    </p>

                    {/* Partidas de la Requisición */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-[10px]">
                          <tr>
                            <th className="p-2.5">Código Insumo</th>
                            <th className="p-2.5">Descripción</th>
                            <th className="p-2.5 text-center">Unidad</th>
                            <th className="p-2.5 text-right">Cant. Neta</th>
                            <th className="p-2.5 text-right">Desp. NEC %</th>
                            <th className="p-2.5 text-right">Cant. Total</th>
                            <th className="p-2.5 text-right">Ref. APU ($)</th>
                            <th className="p-2.5 text-right">Subtotal ($)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                          {req.items.map(it => (
                            <tr key={it.id}>
                              <td className="p-2.5 font-bold text-slate-500">{it.codigoInsumo}</td>
                              <td className="p-2.5 font-sans font-medium text-slate-900 dark:text-white">
                                {it.descripcion}
                                {it.rubroApuCodigo && (
                                  <span className="block text-[10px] text-amber-500 font-mono">
                                    Rubro APU: {it.rubroApuCodigo}
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5 text-center">{it.unidad}</td>
                              <td className="p-2.5 text-right">{it.cantidadRequerida.toFixed(2)}</td>
                              <td className="p-2.5 text-right text-slate-400">+{it.desperdicioNormativoPct}%</td>
                              <td className="p-2.5 text-right font-bold">{it.cantidadTotalConDesperdicio.toFixed(2)}</td>
                              <td className="p-2.5 text-right">${it.costoUnitarioReferencialApuUSD.toFixed(2)}</td>
                              <td className="p-2.5 text-right font-bold">${it.subtotalReferencialUSD.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Resumen inferior y acciones */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                      <div className="text-slate-500 font-mono text-[11px]">
                        <span>Peso Estimado Carga: <strong>{req.pesoTotalEstimadoToneladas} Ton</strong></span> • 
                        <span className="ml-2">Techo Presupuestario APU: <strong>${req.presupuestoTechoUSD.toFixed(2)} USD</strong></span>
                        {req.aprobadoPor && (
                          <span className="ml-2 text-emerald-500 block sm:inline">
                            • Aprobado por: {req.aprobadoPor}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {req.estado === 'BORRADOR' && (
                          <button
                            onClick={() => handleAccionRequisicion(req.id, 'EN_REVISION')}
                            className="px-3 py-1.5 bg-blue-500 text-white font-bold rounded-xl text-xs hover:bg-blue-600 transition-colors flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Enviar a Aprobación</span>
                          </button>
                        )}
                        {req.estado === 'EN_REVISION' && (
                          <>
                            <button
                              onClick={() => handleAccionRequisicion(req.id, 'APROBADA')}
                              className="px-3 py-1.5 bg-emerald-500 text-white font-bold rounded-xl text-xs hover:bg-emerald-600 transition-colors flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Aprobar Requisición</span>
                            </button>
                            <button
                              onClick={() => handleAccionRequisicion(req.id, 'RECHAZADA')}
                              className="px-3 py-1.5 bg-red-500 text-white font-bold rounded-xl text-xs hover:bg-red-600 transition-colors flex items-center gap-1.5"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Rechazar</span>
                            </button>
                          </>
                        )}
                        {(req.estado === 'APROBADA' || req.estado === 'EN_COTIZACION') && (
                          <button
                            onClick={() => setActiveTab('cotizaciones')}
                            className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition-colors flex items-center gap-1.5"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Evaluar Cotizaciones</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: COTIZACIONES & COMPARATIVO MULTICRITERIO                           */}
          {/* ========================================================================= */}
          {activeTab === 'cotizaciones' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-500" />
                    Comparativo Multicriterio de Ofertas (Landed Cost)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Evaluación simultánea de proveedores: Precio de fábrica, flete MTOP por distancia vial, IVA diferenciado (5% vs 15%) y días de entrega
                  </p>
                </div>
              </div>

              {/* MATRIZ COMPARATIVA LADO A LADO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cotizaciones.map(cot => (
                  <div 
                    key={cot.id}
                    className={`bg-white dark:bg-slate-900 rounded-3xl border p-6 space-y-4 shadow-sm relative overflow-hidden transition-all ${
                      cot.esSeleccionada
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {cot.esSeleccionada && (
                      <span className="absolute top-4 right-4 px-3 py-1 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-full uppercase flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Oferta Adjudicada
                      </span>
                    )}

                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                        Cotización: {cot.numeroCotizacion}
                      </span>
                      <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mt-1">
                        {cot.razonSocial}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">
                        RUC: {cot.ruc} • Despacho: <strong>{cot.ciudadDespacho}</strong>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Plazo de Entrega:</span>
                        <strong className="text-slate-900 dark:text-white">{cot.diasEntregaPrometidos} días hábiles</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Condición de Pago:</span>
                        <strong className="text-slate-900 dark:text-white">{cot.condicionesPago}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Flete MTOP a Obra:</span>
                        <strong className="text-slate-900 dark:text-white">${cot.costoFleteEstimadoUSD.toFixed(2)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Landed Cost Total:</span>
                        <strong className="text-amber-500 text-sm font-black">${cot.landedCostTotalUSD.toFixed(2)}</strong>
                      </div>
                    </div>

                    {/* Partidas Cotizadas */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono font-bold text-slate-400 uppercase block">
                        Partidas y Descuentos Ofertados:
                      </span>
                      <div className="space-y-1 text-xs">
                        {cot.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300">
                            <div>
                              <span className="font-bold">{it.descripcion}</span>
                              <span className="block text-[10px] text-slate-500">
                                {it.cantidadOfertada} {it.unidad} a ${it.precioUnitarioNetoUSD}/u (Desc: {it.descuentoPorcentaje}%)
                              </span>
                            </div>
                            <span className="font-mono font-bold">${it.subtotalNetoUSD.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {cot.justificacionSeleccion && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400">
                        <strong>Dictamen de Adjudicación:</strong> {cot.justificacionSeleccion}
                      </div>
                    )}

                    {!cot.esSeleccionada && (
                      <button
                        onClick={() => {
                          setModalAdjudicacion({ cotizacion: cot });
                          setJustificacionAdjudicacion(`Adjudicado por mejor Landed Cost ($${cot.landedCostTotalUSD.toFixed(2)}), entrega en ${cot.diasEntregaPrometidos} días y cumplimiento INEN.`);
                        }}
                        className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Adjudicar y Emitir Orden de Compra</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: ÓRDENES DE COMPRA (OCs)                                            */}
          {/* ========================================================================= */}
          {activeTab === 'ordenes' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-amber-500" />
                    Órdenes de Compra Oficiales (OC)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Contratos de suministro con precios, fletes y cantidades congeladas para control de fiscalización
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {ordenes.map(oc => (
                  <div key={oc.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-amber-500 text-base">{oc.folio}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                            oc.estado === 'RECIBIDA_TOTAL' ? 'bg-emerald-500/20 text-emerald-500' :
                            oc.estado === 'RECIBIDA_PARCIAL' ? 'bg-blue-500/20 text-blue-500' :
                            oc.estado === 'EMITIDA' ? 'bg-amber-500/20 text-amber-500' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            {oc.estado.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                          {oc.proveedorRazonSocial}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Obra: <strong>{oc.proyectoNombre}</strong> ({oc.cantonDestino}) • Emisión: {oc.fechaEmision} • Entrega: {oc.fechaEstimadaEntrega}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setOcParaVer(oc)}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Imprimir Voucher Oficial</span>
                        </button>
                        {oc.estado !== 'RECIBIDA_TOTAL' && oc.estado !== 'ANULADA' && (
                          <button
                            onClick={() => handleAbrirRecepcion(oc)}
                            className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition-colors flex items-center gap-1.5"
                          >
                            <Warehouse className="w-4 h-4" />
                            <span>Registrar Recepción</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Partidas y Saldos Pendientes */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-[10px]">
                          <tr>
                            <th className="p-3">Código</th>
                            <th className="p-3">Descripción</th>
                            <th className="p-3 text-center">Unidad</th>
                            <th className="p-3 text-right">Cant. Pedida</th>
                            <th className="p-3 text-right">Recibida</th>
                            <th className="p-3 text-right">Pendiente</th>
                            <th className="p-3 text-right">P. Unitario ($)</th>
                            <th className="p-3 text-center">IVA %</th>
                            <th className="p-3 text-right">Subtotal ($)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                          {oc.items.map(it => (
                            <tr key={it.id}>
                              <td className="p-3 font-bold text-slate-500">{it.codigoInsumo}</td>
                              <td className="p-3 font-sans font-medium text-slate-900 dark:text-white">{it.descripcion}</td>
                              <td className="p-3 text-center">{it.unidad}</td>
                              <td className="p-3 text-right font-bold">{it.cantidadPedida.toFixed(2)}</td>
                              <td className="p-3 text-right text-emerald-500 font-bold">{it.cantidadRecibidaConforme.toFixed(2)}</td>
                              <td className="p-3 text-right text-amber-500 font-bold">{it.cantidadPendiente.toFixed(2)}</td>
                              <td className="p-3 text-right">${it.precioUnitarioCongeladoUSD.toFixed(2)}</td>
                              <td className="p-3 text-center">{it.tarifaIvaPct}%</td>
                              <td className="p-3 text-right font-bold">${it.subtotalUSD.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totales y Liquidación SRI */}
                    <div className="flex flex-col sm:flex-row justify-between items-center text-xs font-mono pt-2">
                      <div className="text-slate-500">
                        <span>Flete: <strong>${oc.fleteTotalUSD.toFixed(2)}</strong></span> • 
                        <span className="ml-2">IVA 5%: <strong>${oc.iva5PctUSD.toFixed(2)}</strong></span> • 
                        <span className="ml-2">IVA 15%: <strong>${oc.iva15PctUSD.toFixed(2)}</strong></span>
                      </div>
                      <div className="text-sm font-sans">
                        <span className="text-slate-500">Total Liquidado: </span>
                        <span className="font-black text-amber-500 text-base font-mono">
                          ${oc.totalPagarUSD.toFixed(2)} USD
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: RECEPCIONES EN BODEGA                                              */}
          {/* ========================================================================= */}
          {activeTab === 'recepciones' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold flex items-center gap-2">
                    <Warehouse className="w-5 h-5 text-amber-500" />
                    Recepciones Físicas en Bodega & Control de Mermas
                  </h2>
                  <p className="text-xs text-slate-500">
                    Historial de despachos recibidos a pie de obra con Guía de Remisión MTOP e integración directa con Kardex
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {recepciones.map(rec => (
                  <div key={rec.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <span className="text-xs font-mono font-bold text-amber-500">{rec.folioRecepcion}</span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                          {rec.proveedorRazonSocial} • {rec.proyectoNombre}
                        </h4>
                        <p className="text-xs text-slate-500 font-mono">
                          Guía MTOP: <strong>{rec.guiaRemisionNumero}</strong> • Bodega: {rec.bodegaNombre} • Fecha: {rec.fechaRecepcion}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          rec.tipoRecepcion === 'TOTAL' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-500/20 text-blue-500'
                        }`}>
                          Recepción {rec.tipoRecepcion}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {rec.kardexMovimientoGeneradoId}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      <strong>Observaciones de Bodega:</strong> {rec.observacionesGenerales}
                    </p>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-[10px]">
                          <tr>
                            <th className="p-2.5">Insumo</th>
                            <th className="p-2.5 text-center">Unidad</th>
                            <th className="p-2.5 text-right">Cant. Entregada</th>
                            <th className="p-2.5 text-right">Aceptada Conforme</th>
                            <th className="p-2.5 text-right">Dañada / Rechazada</th>
                            <th className="p-2.5 text-center">Inspección</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                          {rec.items.map((it, idx) => (
                            <tr key={idx}>
                              <td className="p-2.5 font-sans font-medium text-slate-900 dark:text-white">{it.descripcion}</td>
                              <td className="p-2.5 text-center">{it.unidad}</td>
                              <td className="p-2.5 text-right font-bold">{it.cantidadEntregada.toFixed(2)}</td>
                              <td className="p-2.5 text-right text-emerald-500 font-bold">{it.cantidadAceptadaConforme.toFixed(2)}</td>
                              <td className="p-2.5 text-right text-red-500 font-bold">{it.cantidadDanadaRechazada.toFixed(2)}</td>
                              <td className="p-2.5 text-center">
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-500 rounded text-[10px] font-bold">
                                  {it.estadoInspeccion}
                                </span>
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
          )}

          {/* ========================================================================= */}
          {/* TAB 6: 3-WAY MATCH & FACTURAS SRI                                         */}
          {/* ========================================================================= */}
          {activeTab === 'sri_match' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                  Auditoría Three-Way Match & Comprobantes SRI
                </h2>
                <p className="text-xs text-slate-500">
                  Conciliación tridimensional matemática: Factura SRI vs Orden de Compra vs Acta de Recepción en Bodega (Tolerancia estricta &le; 1.0%)
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Cargar y Validar Factura Electrónica XML del SRI (XAdES-BES)
                </h3>
                <p className="text-xs text-slate-500">
                  Arrastre o seleccione el archivo XML oficial emitido por el SRI. El sistema extraerá las bases imponibles, validará la firma criptográfica y calculará la retención en la fuente (Códigos 312: 1.75% materiales, 344: 1.75% obra civil, IVA 30%/70%).
                </p>

                <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center space-y-3 bg-slate-50 dark:bg-slate-800/30">
                  <FileSpreadsheet className="w-10 h-10 text-amber-500 mx-auto" />
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      Arrastre aquí el XML de la Factura Electrónica
                    </span>
                    <span className="text-[11px] text-slate-500 block">o haga clic para seleccionar archivo</span>
                  </div>
                  <input
                    type="file"
                    accept=".xml"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const text = await file.text();
                      try {
                        const res = await fetch('/api/v1/compras/parse-xml', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/xml' },
                          body: text
                        });
                        const data = await res.json();
                        if (data.success) {
                          setFeedbackNotice({
                            tipo: 'success',
                            texto: `Factura ${data.factura?.numeroComprobante} procesada con éxito. Firma XAdES válida.`
                          });
                        } else {
                          setFeedbackNotice({ tipo: 'error', texto: data.error || 'Error procesando XML' });
                        }
                      } catch (err: any) {
                        setFeedbackNotice({ tipo: 'error', texto: err.message });
                      }
                    }}
                    className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: CONTROL PRESUPUESTARIO APU & VARIANZA                              */}
          {/* ========================================================================= */}
          {activeTab === 'varianza_apu' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-amber-500" />
                  Control de Varianza Presupuestaria APU vs Compras
                </h2>
                <p className="text-xs text-slate-500">
                  Monitoreo de desvíos económicos en tiempo real entre los análisis de precios unitarios aprobados y las compras adjudicadas
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]">
                      <tr>
                        <th className="p-3">Insumo</th>
                        <th className="p-3">Rubro APU</th>
                        <th className="p-3 text-right">Cant. Comprada</th>
                        <th className="p-3 text-right">Costo APU ($)</th>
                        <th className="p-3 text-right">Costo Comprado ($)</th>
                        <th className="p-3 text-right">Varianza Unitaria ($)</th>
                        <th className="p-3 text-right">Varianza %</th>
                        <th className="p-3 text-right">Impacto Total ($)</th>
                        <th className="p-3 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                      {varianzasApu.map((v, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-sans font-bold text-slate-900 dark:text-white">
                            {v.descripcion}
                            <span className="block text-[10px] text-slate-400 font-mono">{v.codigoInsumo}</span>
                          </td>
                          <td className="p-3 font-mono text-slate-500">{v.rubroApu}</td>
                          <td className="p-3 text-right">{v.cantidadComprada.toFixed(2)} {v.unidad}</td>
                          <td className="p-3 text-right text-slate-500">${v.costoUnitarioApuTeoricoUSD.toFixed(2)}</td>
                          <td className="p-3 text-right font-bold text-slate-900 dark:text-white">${v.costoUnitarioRealCompradoUSD.toFixed(2)}</td>
                          <td className={`p-3 text-right font-bold ${v.varianzaUnitariaUSD < 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {v.varianzaUnitariaUSD > 0 ? `+${v.varianzaUnitariaUSD.toFixed(2)}` : v.varianzaUnitariaUSD.toFixed(2)}
                          </td>
                          <td className={`p-3 text-right font-bold ${v.varianzaPorcentaje < 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {v.varianzaPorcentaje > 0 ? `+${v.varianzaPorcentaje.toFixed(2)}%` : `${v.varianzaPorcentaje.toFixed(2)}%`}
                          </td>
                          <td className={`p-3 text-right font-black ${v.impactoTotalUSD < 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {v.impactoTotalUSD < 0 ? `-$${Math.abs(v.impactoTotalUSD).toFixed(2)}` : `+$${v.impactoTotalUSD.toFixed(2)}`}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              v.estadoSemaforo === 'AHORRO' ? 'bg-emerald-500/20 text-emerald-500' :
                              v.estadoSemaforo === 'EN_PRESUPUESTO' ? 'bg-blue-500/20 text-blue-500' :
                              'bg-amber-500/20 text-amber-500'
                            }`}>
                              {v.estadoSemaforo.replace('_', ' ')}
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

          {/* ========================================================================= */}
          {/* TAB 8: DIRECTORIO DE PROVEEDORES                                          */}
          {/* ========================================================================= */}
          {activeTab === 'proveedores' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-500" />
                    Directorio de Proveedores Calificados
                  </h2>
                  <p className="text-xs text-slate-500">
                    Catálogo verificado con RUC ecuatoriano (Módulo 11), condiciones comerciales y evaluación de cumplimiento
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {proveedores.map(p => (
                  <div key={p.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block">{p.nombreComercial}</span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p.razonSocial}</h4>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">RUC: {p.ruc}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-500 text-[10px] font-bold rounded-full">
                        {p.estado}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      <p>Ciudad: <strong>{p.ciudad}</strong></p>
                      <p>Crédito: <strong>{p.diasCredito} días</strong></p>
                      <p>Contacto: {p.contacto} ({p.telefono})</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        {p.calificacionEstrellas} / 5.0
                      </span>
                      <span className="text-slate-400">
                        Entrega: ~{p.tiempoEntregaPromedioDias}d ({p.cumplimientoPlazosPct}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 9: FLUJO AGÉNTICO AUTÓNOMO IA (APU EXPLOSION)                         */}
          {/* ========================================================================= */}
          {activeTab === 'flujo_agentico' && (
            <div className="space-y-6">
              <ApuRequisitionComprasWorkflow />
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* MODAL: NUEVA REQUISICIÓN DE OBRA                                          */}
        {/* ========================================================================= */}
        {modalNuevaReq && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  Nueva Requisición de Materiales de Obra
                </h3>
                <button onClick={() => setModalNuevaReq(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleCrearRequisicion} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="text-slate-500 block mb-1">Obra / Proyecto Civil:</label>
                  <select
                    value={formReq.proyectoId}
                    onChange={(e) => setFormReq({ ...formReq, proyectoId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    {proyectos.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} ({p.canton})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-500 block mb-1">Frente de Trabajo / Ubicación:</label>
                    <input
                      type="text"
                      placeholder="Ej: Losa Nivel 3 y Muros"
                      value={formReq.frenteTrabajo}
                      onChange={(e) => setFormReq({ ...formReq, frenteTrabajo: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Prioridad:</label>
                    <select
                      value={formReq.prioridad}
                      onChange={(e) => setFormReq({ ...formReq, prioridad: e.target.value as PrioridadCompra })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    >
                      <option value="NORMAL_PROGRAMADA">Normal Programada</option>
                      <option value="URGENTE_24H">Urgente 24h</option>
                      <option value="EMERGENCIA_CRITICA">Emergencia Crítica</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">Justificación Técnica de la Requisición:</label>
                  <textarea
                    rows={2}
                    placeholder="Justifique el requerimiento conforme al cronograma valorado de obra..."
                    value={formReq.justificacion}
                    onChange={(e) => setFormReq({ ...formReq, justificacion: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    required
                  />
                </div>

                {/* Ítem de Demostración */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">Partida Inicial:</span>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Insumo:</span>
                      <strong>{formReq.items[0].descripcion}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Cantidad Requerida:</span>
                      <input
                        type="number"
                        min="1"
                        value={formReq.items[0].cantidadRequerida}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const updated = [...formReq.items];
                          updated[0].cantidadRequerida = val;
                          setFormReq({ ...formReq, items: updated });
                        }}
                        className="w-full p-1 bg-white dark:bg-slate-900 border rounded font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block">Ref. APU ($/u):</span>
                      <strong>${formReq.items[0].costoUnitarioReferencialApuUSD.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModalNuevaReq(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400"
                  >
                    Guardar Requisición
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: ADJUDICACIÓN DE COTIZACIÓN                                         */}
        {/* ========================================================================= */}
        {modalAdjudicacion && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 text-xs font-mono">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Adjudicación Formal de Oferta
              </h3>
              <p className="text-slate-500 font-sans">
                Está a punto de adjudicar la cotización <strong>{modalAdjudicacion.cotizacion.numeroCotizacion}</strong> de <strong>{modalAdjudicacion.cotizacion.razonSocial}</strong> por un Landed Cost de <strong>${modalAdjudicacion.cotizacion.landedCostTotalUSD.toFixed(2)} USD</strong>.
              </p>

              <div>
                <label className="text-slate-500 block mb-1">Justificación Técnica / Económica de la Elección:</label>
                <textarea
                  rows={3}
                  value={justificacionAdjudicacion}
                  onChange={(e) => setJustificacionAdjudicacion(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setModalAdjudicacion(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarAdjudicacion}
                  className="px-5 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600"
                >
                  Confirmar y Emitir OC
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: REGISTRO DE RECEPCIÓN FÍSICA EN BODEGA                             */}
        {/* ========================================================================= */}
        {modalRecepcion && ocSeleccionadaParaRecepcion && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Recepción Física de Material en Bodega
                  </h3>
                  <p className="text-slate-500 text-[11px]">
                    Orden: <strong>{ocSeleccionadaParaRecepcion.folio}</strong> • Proveedor: {ocSeleccionadaParaRecepcion.proveedorRazonSocial}
                  </p>
                </div>
                <button onClick={() => setModalRecepcion(false)} className="text-slate-400">✕</button>
              </div>

              <form onSubmit={handleConfirmarRecepcion} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-500 block mb-1">Número Guía de Remisión MTOP:</label>
                    <input
                      type="text"
                      value={formRecepcion.guiaRemisionNumero}
                      onChange={(e) => setFormRecepcion({ ...formRecepcion, guiaRemisionNumero: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Responsable Bodeguero:</label>
                    <input
                      type="text"
                      value={formRecepcion.responsableBodeguero}
                      onChange={(e) => setFormRecepcion({ ...formRecepcion, responsableBodeguero: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">Observaciones Generales de Descarga:</label>
                  <input
                    type="text"
                    value={formRecepcion.observaciones}
                    onChange={(e) => setFormRecepcion({ ...formRecepcion, observaciones: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                {/* Lista de Partidas a Recibir */}
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">Cantidades e Inspección Física:</span>
                  {ocSeleccionadaParaRecepcion.items.map(it => (
                    <div key={it.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <strong className="block font-sans text-slate-900 dark:text-white">{it.descripcion}</strong>
                        <span className="text-[10px] text-slate-400">
                          Pedida: {it.cantidadPedida} | Recibida previa: {it.cantidadRecibidaConforme} | Pendiente: {it.cantidadPendiente} {it.unidad}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block">Recibir:</label>
                          <input
                            type="number"
                            step="any"
                            max={it.cantidadPendiente}
                            value={formRecepcion.cantidadesRecibidas[it.id] ?? it.cantidadPendiente}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setFormRecepcion({
                                ...formRecepcion,
                                cantidadesRecibidas: {
                                  ...formRecepcion.cantidadesRecibidas,
                                  [it.id]: isNaN(val) ? 0 : val
                                }
                              });
                            }}
                            className="w-24 p-1.5 bg-white dark:bg-slate-900 border rounded-lg font-bold text-right"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Inspección:</label>
                          <select
                            value={formRecepcion.estadosInspeccion[it.id] || 'CONFORME'}
                            onChange={(e) => {
                              setFormRecepcion({
                                ...formRecepcion,
                                estadosInspeccion: {
                                  ...formRecepcion.estadosInspeccion,
                                  [it.id]: e.target.value as any
                                }
                              });
                            }}
                            className="p-1.5 bg-white dark:bg-slate-900 border rounded-lg"
                          >
                            <option value="CONFORME">Conforme</option>
                            <option value="DANADO">Dañado</option>
                            <option value="RECHAZADO">Rechazado</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModalRecepcion(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400"
                  >
                    Confirmar Ingreso en Kardex
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
