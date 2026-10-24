'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Wallet, 
  Lock, 
  CheckCircle2, 
  ArrowRightLeft, 
  Loader2, 
  Plus, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Building2, 
  FileText, 
  Download, 
  Filter, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  CreditCard, 
  Receipt, 
  RefreshCw,
  Clock,
  Briefcase,
  PieChart as PieChartIcon,
  ChevronRight,
  Landmark,
  X
} from 'lucide-react';
import { 
  SaraFinancieroService, 
  ResumenEjecutivoFinanciero, 
  CuentaTesoreria, 
  MovimientoTesoreria, 
  CuentaPorCobrar, 
  CuentaPorPagar, 
  FichaEconomicaProyecto, 
  FlujoCajaPunto,
  ResultadoConciliacion
} from '@/lib/services/saraFinancieroService';
import { exportarAExcel, exportarAPDF } from '@/lib/services/exportReports';

export default function DashboardFinanciero() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tesoreria' | 'cxc' | 'cxp' | 'flujo' | 'proyectos' | 'conciliacion'>('dashboard');
  const [loading, setLoading] = useState<boolean>(true);
  const [filtroProyecto, setFiltroProyecto] = useState<string>('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Estados de Datos
  const [resumen, setResumen] = useState<ResumenEjecutivoFinanciero | null>(null);
  const [cuentas, setCuentas] = useState<CuentaTesoreria[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoTesoreria[]>([]);
  const [cuentasCobrar, setCuentasCobrar] = useState<CuentaPorCobrar[]>([]);
  const [cuentasPagar, setCuentasPagar] = useState<CuentaPorPagar[]>([]);
  const [fichasProyectos, setFichasProyectos] = useState<FichaEconomicaProyecto[]>([]);
  const [flujoPuntos, setFlujoPuntos] = useState<FlujoCajaPunto[]>([]);
  const [escenarioFlujo, setEscenarioFlujo] = useState<'base' | 'conservador' | 'optimista'>('base');
  const [horizonteDias, setHorizonteDias] = useState<30 | 60 | 90>(30);
  const [resultadoConcil, setResultadoConcil] = useState<ResultadoConciliacion | null>(null);

  // Estados de Modales
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({ origenId: '', destinoId: '', monto: '', concepto: '', referencia: '' });

  const [showAbonoModal, setShowAbonoModal] = useState(false);
  const [selectedCxc, setSelectedCxc] = useState<CuentaPorCobrar | null>(null);
  const [abonoForm, setAbonoForm] = useState({ monto: '', cuentaId: '', referencia: '' });

  const [showPagoModal, setShowPagoModal] = useState(false);
  const [selectedCxp, setSelectedCxp] = useState<CuentaPorPagar | null>(null);
  const [pagoForm, setPagoForm] = useState({ monto: '', cuentaId: '', referencia: '' });

  const [showNewCxpModal, setShowNewCxpModal] = useState(false);
  const [newCxpForm, setNewCxpForm] = useState({
    proveedorNombre: 'Holcim Ecuador S.A.',
    proveedorRuc: '0990014523001',
    proyectoId: 'df5b6f36-3074-4403-b4ef-e5695b21c136',
    proyectoNombre: 'Urbanizacion Mangis',
    numeroFactura: '',
    descripcion: '',
    subtotal: '',
    fechaVencimiento: '',
    tipoGasto: 'materiales' as const
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 6000);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [resResumen, resCuentas, resMovs, resCxc, resCxp, resProy, resFlujo] = await Promise.all([
        SaraFinancieroService.getResumenEjecutivo(filtroProyecto || undefined),
        SaraFinancieroService.getCuentasTesoreria(),
        SaraFinancieroService.getMovimientosTesoreria(),
        SaraFinancieroService.getCuentasPorCobrar({ proyectoId: filtroProyecto || undefined }),
        SaraFinancieroService.getCuentasPorPagar({ proyectoId: filtroProyecto || undefined }),
        SaraFinancieroService.getFinanzasPorProyecto(filtroProyecto || undefined),
        SaraFinancieroService.getFlujoCajaPrevision(horizonteDias, escenarioFlujo)
      ]);

      setResumen(resResumen);
      setCuentas(resCuentas);
      setMovimientos(resMovs);
      setCuentasCobrar(resCxc);
      setCuentasPagar(resCxp);
      setFichasProyectos(resProy);
      setFlujoPuntos(resFlujo);

      if (resCuentas.length >= 2 && !transferForm.origenId) {
        setTransferForm(prev => ({
          ...prev,
          origenId: resCuentas[0].id,
          destinoId: resCuentas[1].id
        }));
      }
    } catch (err: any) {
      console.error('Error cargando SARA FINANCIERO:', err);
      showToast('error', 'Error al cargar datos financieros: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [filtroProyecto, escenarioFlujo, horizonteDias]);

  // Manejar Transferencia Interna
  const handleExecuteTransfer = async () => {
    const val = parseFloat(transferForm.monto);
    if (isNaN(val) || val <= 0) return showToast('error', 'Ingrese un monto válido.');
    if (transferForm.origenId === transferForm.destinoId) return showToast('error', 'Cuentas de origen y destino deben ser distintas.');

    try {
      const res = await SaraFinancieroService.transferirEntreCuentas(
        transferForm.origenId,
        transferForm.destinoId,
        val,
        transferForm.concepto || 'Transferencia de fondos autorizada',
        transferForm.referencia || `TRF-${Date.now().toString().slice(-6)}`
      );
      showToast('success', res.message);
      setShowTransferModal(false);
      setTransferForm(prev => ({ ...prev, monto: '', concepto: '', referencia: '' }));
      loadAllData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Manejar Abono Cliente (CxC)
  const handleExecuteAbono = async () => {
    if (!selectedCxc) return;
    const val = parseFloat(abonoForm.monto);
    if (isNaN(val) || val <= 0) return showToast('error', 'Ingrese un importe válido.');

    try {
      const res = await SaraFinancieroService.registrarAbonoCliente(
        selectedCxc.id,
        val,
        abonoForm.cuentaId || cuentas[0].id,
        'transferencia',
        abonoForm.referencia || `REC-${Date.now().toString().slice(-5)}`
      );
      showToast('success', `Abono de $${val.toLocaleString()} USD registrado. Saldo pendiente: $${res.saldoRestante.toLocaleString()}`);
      setShowAbonoModal(false);
      setSelectedCxc(null);
      loadAllData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Manejar Pago Proveedor (CxP)
  const handleExecutePago = async () => {
    if (!selectedCxp) return;
    const val = parseFloat(pagoForm.monto);
    if (isNaN(val) || val <= 0) return showToast('error', 'Ingrese un monto válido.');

    try {
      const res = await SaraFinancieroService.registrarPagoProveedor(
        selectedCxp.id,
        val,
        pagoForm.cuentaId || cuentas[0].id,
        'transferencia',
        pagoForm.referencia || `PGO-${Date.now().toString().slice(-5)}`
      );
      showToast('success', `Pago de $${val.toLocaleString()} USD aplicado. Saldo neto restante: $${res.saldoRestante.toLocaleString()}`);
      setShowPagoModal(false);
      setSelectedCxp(null);
      loadAllData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Manejar Nueva Factura Proveedor con Retenciones
  const handleCreateNewCxp = async () => {
    const sub = parseFloat(newCxpForm.subtotal);
    if (isNaN(sub) || sub <= 0) return showToast('error', 'Ingrese un subtotal válido.');
    if (!newCxpForm.numeroFactura) return showToast('error', 'Ingrese el número de comprobante/factura.');
    if (!newCxpForm.fechaVencimiento) return showToast('error', 'Seleccione la fecha de vencimiento.');

    try {
      await SaraFinancieroService.crearCuentaPorPagar({
        proveedorId: 'prov-new',
        proveedorNombre: newCxpForm.proveedorNombre,
        proveedorRuc: newCxpForm.proveedorRuc,
        proyectoId: newCxpForm.proyectoId,
        proyectoNombre: newCxpForm.proyectoNombre,
        numeroFactura: newCxpForm.numeroFactura,
        descripcion: newCxpForm.descripcion || 'Adquisición de insumos para obra',
        fechaEmision: new Date().toISOString().split('T')[0],
        fechaVencimiento: newCxpForm.fechaVencimiento,
        subtotal: sub,
        aplicaIva15: true,
        tipoGasto: newCxpForm.tipoGasto
      });
      showToast('success', `Factura ${newCxpForm.numeroFactura} registrada con cálculo oficial de retenciones SRI.`);
      setShowNewCxpModal(false);
      setNewCxpForm({
        proveedorNombre: 'Holcim Ecuador S.A.',
        proveedorRuc: '0990014523001',
        proyectoId: 'df5b6f36-3074-4403-b4ef-e5695b21c136',
        proyectoNombre: 'Urbanizacion Mangis',
        numeroFactura: '',
        descripcion: '',
        subtotal: '',
        fechaVencimiento: '',
        tipoGasto: 'materiales'
      });
      loadAllData();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Conciliación Bancaria Simulada
  const handleSimularConciliacion = async (cuentaId: string) => {
    try {
      const extractoSimulado = [
        { fecha: '2026-10-05', concepto: 'CREDITO DEPOSITO TRF 998412 MANGIS', referencia: 'TRF-BP-998412', monto: 35000.00, tipo: 'credito' as const },
        { fecha: '2026-10-08', concepto: 'DEBITO CHEQUE COBRADO 00452 HOLCIM', referencia: 'CHQ-BP-00452', monto: 12450.00, tipo: 'debito' as const },
        { fecha: '2026-10-15', concepto: 'TRANSFERENCIA DIRECTA ADELCA 88124', referencia: 'TRF-BP-88124', monto: 8200.50, tipo: 'debito' as const },
        { fecha: '2026-10-18', concepto: 'COMISION MANTENIMIENTO CUENTA BP', referencia: 'COM-BP-001', monto: 15.00, tipo: 'debito' as const }
      ];

      const res = await SaraFinancieroService.conciliarExtractoBancario(cuentaId, extractoSimulado);
      setResultadoConcil(res);
      showToast('success', `Conciliación ejecutada: ${res.partidasConciliadas} partidas cuadradas de forma exacta.`);
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Exportar a Excel
  const handleExportExcel = () => {
    if (!resumen) return;
    const datosExcel = fichasProyectos.map(p => ({
      'Proyecto': p.proyectoNombre,
      'Ubicación': p.ubicacion,
      'Avance Físico (%)': `${p.avanceFisicoPct}%`,
      'Presupuesto Vigente ($)': p.presupuestoVigente.toFixed(2),
      'Costos Devengados ($)': p.costosReconocidosDevengados.toFixed(2),
      'Comprometido OC ($)': p.costosComprometidosOC.toFixed(2),
      'Pagado Efectivo ($)': p.costosPagadosEfectivo.toFixed(2),
      'Por Pagar Proveedores ($)': p.cuentasPorPagarPendientes.toFixed(2),
      'Facturado Clientes ($)': p.ingresosFacturados.toFixed(2),
      'Cobrado ($)': p.cobrosRecibidos.toFixed(2),
      'Margen Real (%)': `${p.margenBrutoRealRegistradoPct}%`,
      'Riesgo Desviación': p.alertaRiesgo
    }));

    exportarAExcel(
      datosExcel,
      'SARA_CONTROL_FINANCIERO_PROYECTOS',
      'Finanzas Obras',
      'contabilidad',
      [
        { etiqueta: 'Saldo Disponible Cajas y Bancos', valor: `$${resumen.saldoTotalDisponible.toLocaleString()} USD` },
        { etiqueta: 'Cuentas por Cobrar Clientes', valor: `$${resumen.totalCuentasPorCobrar.toLocaleString()} USD` },
        { etiqueta: 'Cuentas por Pagar Proveedores', valor: `$${resumen.totalCuentasPorPagar.toLocaleString()} USD` },
        { etiqueta: 'Fondo de Retenciones SRI Bloqueado', valor: `$${resumen.saldoRestringidoSriRetenciones.toLocaleString()} USD` },
        { etiqueta: 'Capital de Trabajo Neto', valor: `$${resumen.capitalTrabajoNeto.toLocaleString()} USD` }
      ]
    );
  };

  // Exportar a PDF
  const handleExportPDF = () => {
    if (!resumen) return;
    const encabezados = ['Proyecto', 'Presup. Vigente', 'Costos Devengados', 'Comprometido OC', 'Pagado', 'Margen %', 'Riesgo'];
    const filas = fichasProyectos.map(p => [
      p.proyectoNombre,
      `$${p.presupuestoVigente.toLocaleString()}`,
      `$${p.costosReconocidosDevengados.toLocaleString()}`,
      `$${p.costosComprometidosOC.toLocaleString()}`,
      `$${p.costosPagadosEfectivo.toLocaleString()}`,
      `${p.margenBrutoRealRegistradoPct}%`,
      p.alertaRiesgo
    ]);

    exportarAPDF(
      'ESTADO FINANCIERO Y CONTROL ECONÓMICO DE OBRAS',
      encabezados,
      filas,
      'SARA_REPORTE_FINANCIERO_EJECUTIVO',
      'Reporte Consolidado de Tesorería, Cuentas por Cobrar, Obligaciones y Desviaciones',
      'contabilidad',
      [
        { etiqueta: 'Saldo Disponible en Bancos', valor: `$${resumen.saldoTotalDisponible.toLocaleString()} USD` },
        { etiqueta: 'Cartera por Cobrar', valor: `$${resumen.totalCuentasPorCobrar.toLocaleString()} USD` },
        { etiqueta: 'Deuda a Proveedores', valor: `$${resumen.totalCuentasPorPagar.toLocaleString()} USD` },
        { etiqueta: 'Retenciones SRI Protegidas', valor: `$${resumen.saldoRestringidoSriRetenciones.toLocaleString()} USD` }
      ]
    );
  };

  return (
    <div className="p-4 sm:p-8 bg-slate-950 text-slate-100 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto pt-4 space-y-6">

        {/* ==================================================================== */}
        {/* CABECERA PRINCIPAL Y SELECTORES */}
        {/* ==================================================================== */}
        <header className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                <ShieldCheck size={24} />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                SARA <span className="text-teal-400">FINANCIERO</span>
              </h1>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                Tesorería & Control Económico
              </span>
            </div>
            <p className="text-slate-400 text-sm">
              Fuente única de verdad: Tesorería real, Cuentas por Cobrar, Cuentas por Pagar, SRI, Flujo de Caja y Desviaciones de Obra.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro por Proyecto */}
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs">
              <Building2 size={16} className="text-teal-400 shrink-0" />
              <select 
                value={filtroProyecto}
                onChange={(e) => setFiltroProyecto(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold outline-none cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-white">Todos los Proyectos (Global)</option>
                <option value="d772496e-cce5-4465-aac5-c92f32e3ecd4" className="bg-slate-900 text-white">DUNA-DALTA (Cuenca)</option>
                <option value="df5b6f36-3074-4403-b4ef-e5695b21c136" className="bg-slate-900 text-white">Urbanización Mangis (Quito)</option>
                <option value="6177aa16-34e8-4979-b0eb-032f09df9c46" className="bg-slate-900 text-white">Ciclope (Arenillas)</option>
                <option value="fd1ddcd7-a50c-4e4d-8d0c-7eb30176401d" className="bg-slate-900 text-white">Torre Sara (Calvas)</option>
                <option value="beae414f-a211-4a9d-95b9-2b3f8c5075ba" className="bg-slate-900 text-white">El Chiquito (Loja)</option>
              </select>
            </div>

            {/* Exportaciones Oficiales */}
            <button
              onClick={handleExportExcel}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all shadow-sm"
              title="Descargar Planilla Excel con formato institucional"
            >
              <Download size={14} className="text-emerald-400" />
              Excel (.xlsx)
            </button>

            <button
              onClick={handleExportPDF}
              className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-teal-900/40 flex items-center gap-2 transition-all"
              title="Generar PDF Oficial con firmas de Gerencia y Fiscalización"
            >
              <FileText size={14} />
              Informe PDF
            </button>
          </div>
        </header>

        {/* Notificaciones */}
        {notification && (
          <div className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-bold shadow-lg transition-all animate-in fade-in duration-200 ${
            notification.type === 'success'
              ? 'bg-teal-950/80 border-teal-500/50 text-teal-200'
              : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
          }`}>
            {notification.type === 'success' ? <CheckCircle2 size={18} className="text-teal-400 shrink-0" /> : <AlertCircle size={18} className="text-rose-400 shrink-0" />}
            <span>{notification.message}</span>
          </div>
        )}

        {/* ==================================================================== */}
        {/* NAVEGACIÓN POR PESTAÑAS */}
        {/* ==================================================================== */}
        <div className="flex border-b border-slate-800 gap-1 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'dashboard', label: 'Dashboard Ejecutivo', icon: PieChartIcon },
            { id: 'tesoreria', label: 'Tesorería & Bancos', icon: Wallet },
            { id: 'cxc', label: 'Cuentas por Cobrar', icon: TrendingUp },
            { id: 'cxp', label: 'Cuentas por Pagar (SRI)', icon: TrendingDown },
            { id: 'flujo', label: 'Flujo de Caja & Previsiones', icon: Calendar },
            { id: 'proyectos', label: 'Control por Proyecto', icon: Briefcase },
            { id: 'conciliacion', label: 'Conciliación Bancaria', icon: RefreshCw },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ==================================================================== */}
        {/* CONTENIDO PRINCIPAL SEGÚN PESTAÑA */}
        {/* ==================================================================== */}
        {loading && !resumen ? (
          <div className="flex flex-col items-center justify-center py-28 text-slate-400">
            <Loader2 className="w-10 h-10 text-teal-400 animate-spin mb-3" />
            <p className="text-sm font-semibold">Cargando estado financiero y sincronizando con Supabase...</p>
          </div>
        ) : (
          <>
            {/* ------------------------------------------------------------------ */}
            {/* TAB 1: DASHBOARD EJECUTIVO */}
            {/* ------------------------------------------------------------------ */}
            {activeTab === 'dashboard' && resumen && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Alertas Financieras */}
                {resumen.alertasFinancieras.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resumen.alertasFinancieras.map((al, idx) => (
                      <div 
                        key={idx}
                        className={`p-4 rounded-2xl border flex items-start gap-3 shadow-md ${
                          al.tipo === 'critica'
                            ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                            : al.tipo === 'advertencia'
                            ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                            : 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                        }`}
                      >
                        <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-white/10">
                              {al.modulo}
                            </span>
                            <span className="text-xs font-bold">Alerta Financiera</span>
                          </div>
                          <p className="text-xs leading-relaxed">{al.mensaje}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* KPIs Maestros del Sistema */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Saldo Disponible */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dinero Disponible Real</span>
                      <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                        <Wallet size={18} />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-white font-mono">
                      ${resumen.saldoTotalDisponible.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                      <CheckCircle2 size={13} className="text-teal-400" />
                      <span>Conciliado: ${resumen.saldoConciliadoBancos.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Por Cobrar Clientes */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cuentas por Cobrar</span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <TrendingUp size={18} />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-emerald-400 font-mono">
                      ${resumen.totalCuentasPorCobrar.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-400">
                      <Clock size={13} />
                      <span>Vencidas: ${resumen.totalCuentasPorCobrarVencidas.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Por Pagar Proveedores */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cuentas por Pagar (Neto)</span>
                      <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                        <TrendingDown size={18} />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-rose-400 font-mono">
                      ${resumen.totalCuentasPorPagar.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-400">
                      <AlertCircle size={13} />
                      <span>Retenciones SRI: ${resumen.saldoRestringidoSriRetenciones.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Compromisos en Órdenes de Compra */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Comprometido en O.C.</span>
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                        <Briefcase size={18} />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-blue-400 font-mono">
                      ${resumen.totalComprometidoOrdenesCompra.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Sin duplicar con egresos devengados
                    </p>
                  </div>
                </div>

                {/* Segregación Financiera & Capital de Trabajo */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Fideicomiso Escrow y Fondos Restringidos */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                        <Lock size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">Fideicomiso Escrow & Fondos Protegidos</h3>
                        <p className="text-xs text-slate-400">Custodia bancaria liberada contra actas de fiscalización</p>
                      </div>
                    </div>

                    <div className="space-y-3 font-mono">
                      <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <span className="text-xs text-slate-400">Saldo Fideicomiso Activo</span>
                        <span className="text-lg font-bold text-teal-400">${resumen.saldoFideicomisoEscrow.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <span className="text-xs text-slate-400">Fondo Contingente Retenciones SRI</span>
                        <span className="text-sm font-bold text-rose-400">-${resumen.saldoRestringidoSriRetenciones.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-xl bg-teal-950/30 border border-teal-500/20">
                        <span className="text-xs text-teal-200">Capital de Trabajo Neto Operativo</span>
                        <span className="text-lg font-bold text-white">${resumen.capitalTrabajoNeto.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Flujo del Período Realizado */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-bold text-white text-base">Rendimiento Operativo Realizado del Período</h3>
                        <p className="text-xs text-slate-400">Entradas y salidas registradas fehacientemente en tesorería</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        resumen.flujoNetoPeriodo >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        Flujo Neto: ${resumen.flujoNetoPeriodo.toLocaleString()} USD
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 font-mono text-center mb-4">
                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                        <span className="text-[11px] text-slate-400 block mb-1">Ingresos Efectivos</span>
                        <span className="text-xl font-black text-emerald-400">+${resumen.ingresosPeriodoEfectivo.toLocaleString()}</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                        <span className="text-[11px] text-slate-400 block mb-1">Egresos Pagados</span>
                        <span className="text-xl font-black text-rose-400">-${resumen.egresosPeriodoEfectivo.toLocaleString()}</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                        <span className="text-[11px] text-slate-400 block mb-1">Margen Promedio Obras</span>
                        <span className="text-xl font-black text-teal-400">{resumen.margenPromedioObrasPct}%</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span>Presupuesto total vigente de obras: <strong>${resumen.totalPresupuestoObrasVigente.toLocaleString()}</strong></span>
                      <span>Costos registrados a la fecha: <strong>${resumen.totalCostosRegistradosObras.toLocaleString()}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------------ */}
            {/* TAB 2: TESORERÍA & CUENTAS BANCARIAS */}
            {/* ------------------------------------------------------------------ */}
            {activeTab === 'tesoreria' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white">Cuentas Financieras y Cajas de Obra</h2>
                    <p className="text-xs text-slate-400">Control de saldos en moneda de curso legal (USD) sin operaciones ficticias</p>
                  </div>
                  <button
                    onClick={() => setShowTransferModal(true)}
                    className="bg-slate-900 hover:bg-slate-800 text-teal-400 border border-teal-500/30 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md"
                  >
                    <ArrowRightLeft size={16} />
                    Transferencia Interna entre Cuentas
                  </button>
                </div>

                {/* Tarjetas de Cuentas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {cuentas.map(cta => (
                    <div key={cta.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm hover:border-slate-700 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-teal-400">
                          {cta.tipo === 'banco' ? <Landmark size={20} /> : cta.tipo === 'fideicomiso_escrow' ? <Lock size={20} /> : <Wallet size={20} />}
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                          {cta.tipo.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-white line-clamp-1">{cta.nombre}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{cta.numeroCuenta}</p>
                      
                      <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-end">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Saldo Disponible</span>
                          <span className="text-2xl font-black text-white font-mono">${cta.saldoActual.toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Conciliado</span>
                          <span className="text-xs font-bold text-teal-400 font-mono">${cta.saldoConciliado.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Libro Mayor de Movimientos de Tesorería */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-white text-base">Libro Diario de Tesorería</h3>
                      <p className="text-xs text-slate-400">Trazabilidad completa con referencia bancaria y estado de conciliación</p>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{movimientos.length} movimientos registrados</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950/60 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                          <th className="p-4 font-bold">Fecha</th>
                          <th className="p-4 font-bold">Cuenta</th>
                          <th className="p-4 font-bold">Tipo</th>
                          <th className="p-4 font-bold">Concepto / Proyecto</th>
                          <th className="p-4 font-bold">Referencia</th>
                          <th className="p-4 font-bold text-right">Importe</th>
                          <th className="p-4 font-bold text-center">Conciliado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {movimientos.map(m => (
                          <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-4 text-slate-300">{m.fechaOperacion}</td>
                            <td className="p-4 text-slate-200 font-sans font-bold">{m.cuentaNombre}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                m.tipo === 'ingreso_operativo'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : m.tipo === 'egreso_operativo'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              }`}>
                                {m.tipo.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="p-4 font-sans text-slate-200">
                              <div>{m.concepto}</div>
                              {m.proyectoNombre && <div className="text-[11px] text-teal-400 font-semibold mt-0.5">🏗️ {m.proyectoNombre}</div>}
                            </td>
                            <td className="p-4 text-slate-400">{m.referenciaBancaria}</td>
                            <td className={`p-4 text-right font-black text-sm ${
                              m.tipo.includes('ingreso') ? 'text-emerald-400' : m.tipo.includes('egreso') ? 'text-rose-400' : 'text-slate-200'
                            }`}>
                              {m.tipo.includes('egreso') ? '-' : '+'}${m.monto.toLocaleString()}
                            </td>
                            <td className="p-4 text-center">
                              {m.conciliado ? (
                                <span className="inline-flex items-center gap-1 text-teal-400 text-xs font-bold">
                                  <CheckCircle2 size={14} /> Cuadrado
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
                                  <Clock size={14} /> Pendiente
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------------ */}
            {/* TAB 3: CUENTAS POR COBRAR */}
            {/* ------------------------------------------------------------------ */}
            {activeTab === 'cxc' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white">Cartera de Clientes & Planillas de Obra</h2>
                    <p className="text-xs text-slate-400">Seguimiento de cobros de contratos, hitos certificados y abonos parciales</p>
                  </div>
                </div>

                {/* Listado de Obligaciones por Cobrar */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950/60 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                          <th className="p-4 font-bold">Cliente / Proyecto</th>
                          <th className="p-4 font-bold">Documento / Concepto</th>
                          <th className="p-4 font-bold">Vencimiento</th>
                          <th className="p-4 font-bold text-right">Total Facturado</th>
                          <th className="p-4 font-bold text-right">Cobrado</th>
                          <th className="p-4 font-bold text-right">Saldo Pendiente</th>
                          <th className="p-4 font-bold text-center">Estado / Antigüedad</th>
                          <th className="p-4 font-bold text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {cuentasCobrar.map(c => (
                          <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-4 font-sans">
                              <div className="font-bold text-white">{c.clienteNombre}</div>
                              <div className="text-[11px] text-teal-400 font-semibold mt-0.5">{c.proyectoNombre}</div>
                            </td>
                            <td className="p-4 font-sans">
                              <div className="font-bold text-slate-200">{c.numeroDocumento}</div>
                              <div className="text-[11px] text-slate-400">{c.concepto}</div>
                            </td>
                            <td className="p-4 text-slate-300">{c.fechaVencimiento}</td>
                            <td className="p-4 text-right font-bold text-white">${c.montoTotal.toLocaleString()}</td>
                            <td className="p-4 text-right text-emerald-400 font-bold">${c.montoCobrado.toLocaleString()}</td>
                            <td className="p-4 text-right text-rose-400 font-black text-sm">${c.saldoPendiente.toLocaleString()}</td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                c.estado === 'cobrado'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : c.estado === 'vencido'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {c.estado.toUpperCase()} {c.diasVencido > 0 ? `(${c.diasVencido}d)` : ''}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              {c.saldoPendiente > 0 && (
                                <button
                                  onClick={() => {
                                    setSelectedCxc(c);
                                    setAbonoForm({ monto: c.saldoPendiente.toString(), cuentaId: cuentas[0]?.id || '', referencia: '' });
                                    setShowAbonoModal(true);
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                                >
                                  Registrar Cobro
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------------ */}
            {/* TAB 4: CUENTAS POR PAGAR (SRI) */}
            {/* ------------------------------------------------------------------ */}
            {activeTab === 'cxp' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white">Obligaciones de Proveedores & Retenciones SRI</h2>
                    <p className="text-xs text-slate-400">Desglose legal de retención de Impuesto a la Renta (1.75%/2%) e IVA (30%/70%) con prevención de duplicados</p>
                  </div>
                  <button
                    onClick={() => setShowNewCxpModal(true)}
                    className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all"
                  >
                    <Plus size={16} />
                    Ingresar Factura Proveedor
                  </button>
                </div>

                {/* Listado de Cuentas por Pagar */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950/60 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                          <th className="p-4 font-bold">Proveedor / RUC</th>
                          <th className="p-4 font-bold">Factura / Proyecto</th>
                          <th className="p-4 font-bold text-right">Subtotal</th>
                          <th className="p-4 font-bold text-right">IVA (15%)</th>
                          <th className="p-4 font-bold text-right">Retenciones SRI</th>
                          <th className="p-4 font-bold text-right">Líquido a Pagar</th>
                          <th className="p-4 font-bold text-right">Saldo Restante</th>
                          <th className="p-4 font-bold text-center">Estado</th>
                          <th className="p-4 font-bold text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {cuentasPagar.map(p => (
                          <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-4 font-sans">
                              <div className="font-bold text-white">{p.proveedorNombre}</div>
                              <div className="text-[11px] text-slate-400 font-mono">RUC: {p.proveedorRuc}</div>
                            </td>
                            <td className="p-4 font-sans">
                              <div className="font-bold text-slate-200">{p.numeroFactura}</div>
                              <div className="text-[11px] text-teal-400 font-semibold">{p.proyectoNombre}</div>
                            </td>
                            <td className="p-4 text-right text-slate-300">${p.subtotal.toLocaleString()}</td>
                            <td className="p-4 text-right text-slate-300">${p.montoIva.toLocaleString()}</td>
                            <td className="p-4 text-right text-rose-400 font-bold">-${p.totalRetenciones.toLocaleString()}</td>
                            <td className="p-4 text-right font-bold text-white">${p.montoNetoPagar.toLocaleString()}</td>
                            <td className="p-4 text-right text-rose-400 font-black text-sm">${p.saldoPendiente.toLocaleString()}</td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                p.estado === 'pagada'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : p.estado === 'vencida'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {p.estado.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              {p.saldoPendiente > 0 && (
                                <button
                                  onClick={() => {
                                    setSelectedCxp(p);
                                    setPagoForm({ monto: p.saldoPendiente.toString(), cuentaId: cuentas[0]?.id || '', referencia: '' });
                                    setShowPagoModal(true);
                                  }}
                                  className="bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                                >
                                  Pagar
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------------ */}
            {/* TAB 5: FLUJO DE CAJA & PREVISIONES */}
            {/* ------------------------------------------------------------------ */}
            {activeTab === 'flujo' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Previsión de Flujo de Caja y Alertas de Liquidez</h2>
                    <p className="text-xs text-slate-400">Proyección a 30, 60 y 90 días con modelado de escenarios probabilísticos</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-bold">
                      {(['base', 'conservador', 'optimista'] as const).map(sc => (
                        <button
                          key={sc}
                          onClick={() => setEscenarioFlujo(sc)}
                          className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                            escenarioFlujo === sc ? 'bg-teal-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {sc}
                        </button>
                      ))}
                    </div>

                    <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-bold">
                      {([30, 60, 90] as const).map(d => (
                        <button
                          key={d}
                          onClick={() => setHorizonteDias(d)}
                          className={`px-3 py-1.5 rounded-lg transition-all ${
                            horizonteDias === d ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {d}d
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tabla Proyectada */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950/60 text-slate-400 uppercase tracking-wider border-b border-slate-800 font-sans">
                          <th className="p-4 font-bold">Período Proyectado</th>
                          <th className="p-4 font-bold text-right">Cobros Esperados</th>
                          <th className="p-4 font-bold text-right">Pagos + Compromisos</th>
                          <th className="p-4 font-bold text-right">Flujo Neto</th>
                          <th className="p-4 font-bold text-right">Saldo Proyectado</th>
                          <th className="p-4 font-bold text-center">Diagnóstico Liquidez</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {flujoPuntos.map((pt, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-4 font-sans font-bold text-slate-200">{pt.fecha}</td>
                            <td className="p-4 text-right text-emerald-400 font-bold">+${pt.ingresosPrevistos.toLocaleString()}</td>
                            <td className="p-4 text-right text-rose-400 font-bold">-${pt.egresosPrevistos.toLocaleString()}</td>
                            <td className={`p-4 text-right font-black ${pt.flujoNetoPrevisto >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                              ${pt.flujoNetoPrevisto.toLocaleString()}
                            </td>
                            <td className="p-4 text-right text-white font-black text-sm">${pt.saldoProyectado.toLocaleString()}</td>
                            <td className="p-4 text-center">
                              {pt.alertaLiquidez ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                  <AlertTriangle size={12} /> Déficit Previsto
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                  <CheckCircle2 size={12} /> Solvente
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------------ */}
            {/* TAB 6: CONTROL FINANCIERO POR PROYECTO */}
            {/* ------------------------------------------------------------------ */}
            {activeTab === 'proyectos' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-white">Ficha Económica y Desviación por Proyecto</h2>
                  <p className="text-xs text-slate-400">Comparativa del presupuesto vigente contra costos devengados, órdenes comprometidas y margen real registrado</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {fichasProyectos.map(p => (
                    <div key={p.proyectoId} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 pb-4 border-b border-slate-800">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-black text-white">{p.proyectoNombre}</span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              {p.ubicacion}
                            </span>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                              p.alertaRiesgo === 'NORMAL' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {p.alertaRiesgo}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            Avance Físico Fiscalizado: <strong>{p.avanceFisicoPct}%</strong> | Presupuesto Original: <strong>${p.presupuestoOriginal.toLocaleString()}</strong>
                          </p>
                        </div>

                        <div className="text-right font-mono">
                          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Presupuesto Vigente Aprobado</span>
                          <span className="text-2xl font-black text-teal-400">${p.presupuestoVigente.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Grilla de Métricas de Obra */}
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 font-mono text-center">
                        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                          <span className="text-[10px] text-slate-500 block mb-1">Facturado Cliente</span>
                          <span className="text-sm font-bold text-white">${p.ingresosFacturados.toLocaleString()}</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                          <span className="text-[10px] text-slate-500 block mb-1">Cobrado Efectivo</span>
                          <span className="text-sm font-bold text-emerald-400">${p.cobrosRecibidos.toLocaleString()}</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                          <span className="text-[10px] text-slate-500 block mb-1">Comprometido O.C.</span>
                          <span className="text-sm font-bold text-blue-400">${p.costosComprometidosOC.toLocaleString()}</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                          <span className="text-[10px] text-slate-500 block mb-1">Costo Devengado</span>
                          <span className="text-sm font-bold text-rose-400">${p.costosReconocidosDevengados.toLocaleString()}</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                          <span className="text-[10px] text-slate-500 block mb-1">Por Pagar Prov.</span>
                          <span className="text-sm font-bold text-amber-400">${p.cuentasPorPagarPendientes.toLocaleString()}</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                          <span className="text-[10px] text-slate-500 block mb-1">Margen Real</span>
                          <span className="text-sm font-black text-teal-400">{p.margenBrutoRealRegistradoPct}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------------ */}
            {/* TAB 7: CONCILIACIÓN BANCARIA */}
            {/* ------------------------------------------------------------------ */}
            {activeTab === 'conciliacion' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white">Conciliación Bancaria Automática</h2>
                    <p className="text-xs text-slate-400">Importación de extractos de bancos ecuatorianos y matching matemático por monto, fecha y referencia</p>
                  </div>
                  <button
                    onClick={() => handleSimularConciliacion(cuentas[0]?.id || 'cta-banco-pichincha')}
                    className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all"
                  >
                    <RefreshCw size={16} />
                    Ejecutar Conciliación Banco Pichincha
                  </button>
                </div>

                {resultadoConcil && (
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-center">
                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                        <span className="text-xs text-slate-500 block mb-1">Saldo Según Banco</span>
                        <span className="text-xl font-black text-white">${resultadoConcil.saldoSegunBanco.toLocaleString()}</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                        <span className="text-xs text-slate-500 block mb-1">Saldo Según Libros</span>
                        <span className="text-xl font-black text-teal-400">${resultadoConcil.saldoSegunLibros.toLocaleString()}</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                        <span className="text-xs text-slate-500 block mb-1">Diferencia Neta</span>
                        <span className="text-xl font-black text-rose-400">${resultadoConcil.diferencia.toLocaleString()}</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                        <span className="text-xs text-slate-500 block mb-1">Partidas Cuadradas</span>
                        <span className="text-xl font-black text-emerald-400">{resultadoConcil.partidasConciliadas}</span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-950/60 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                            <th className="p-4 font-bold">Fecha Banco</th>
                            <th className="p-4 font-bold">Concepto en Extracto</th>
                            <th className="p-4 font-bold">Referencia</th>
                            <th className="p-4 font-bold text-right">Importe</th>
                            <th className="p-4 font-bold text-center">Resultado Cotejo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono">
                          {resultadoConcil.detalles.map((d, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                              <td className="p-4 text-slate-300">{d.itemBanco.fecha}</td>
                              <td className="p-4 font-sans text-slate-200">{d.itemBanco.concepto}</td>
                              <td className="p-4 text-slate-400">{d.itemBanco.referencia}</td>
                              <td className="p-4 text-right font-bold text-white">${d.itemBanco.monto.toLocaleString()}</td>
                              <td className="p-4 text-center">
                                {d.estado === 'conciliado_exacto' ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                                    <CheckCircle2 size={14} /> Conciliado Exacto
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                                    <Clock size={14} /> Pendiente en Libros
                                  </span>
                                )}
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
          </>
        )}

        {/* ==================================================================== */}
        {/* MODAL: TRANSFERENCIA ENTRE CUENTAS DE TESORERÍA */}
        {/* ==================================================================== */}
        {showTransferModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ArrowRightLeft className="text-teal-400" size={20} />
                  Transferencia Interna entre Cuentas
                </h3>
                <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Cuenta de Origen (Débito)</label>
                  <select 
                    value={transferForm.origenId} 
                    onChange={e => setTransferForm({ ...transferForm, origenId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    {cuentas.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre} (Saldo: ${c.saldoActual.toLocaleString()})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Cuenta de Destino (Crédito)</label>
                  <select 
                    value={transferForm.destinoId} 
                    onChange={e => setTransferForm({ ...transferForm, destinoId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    {cuentas.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre} (Saldo: ${c.saldoActual.toLocaleString()})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Monto a Transferir (USD)</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={transferForm.monto} 
                    onChange={e => setTransferForm({ ...transferForm, monto: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Concepto / Motivo</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Fondeo de caja chica de obra" 
                    value={transferForm.concepto} 
                    onChange={e => setTransferForm({ ...transferForm, concepto: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Referencia Bancaria</label>
                  <input 
                    type="text" 
                    placeholder="TRF-00124" 
                    value={transferForm.referencia} 
                    onChange={e => setTransferForm({ ...transferForm, referencia: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button onClick={() => setShowTransferModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white">
                  Cancelar
                </button>
                <button onClick={handleExecuteTransfer} className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md">
                  Confirmar Transferencia
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODAL: REGISTRAR COBRO / ABONO (CXC) */}
        {/* ==================================================================== */}
        {showAbonoModal && selectedCxc && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="text-emerald-400" size={20} />
                  Registrar Cobro a Cliente
                </h3>
                <button onClick={() => setShowAbonoModal(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs">
                <p className="font-bold text-white">{selectedCxc.clienteNombre}</p>
                <p className="text-slate-400 font-mono">{selectedCxc.numeroDocumento}</p>
                <p className="text-emerald-400 font-bold mt-1">Saldo pendiente: ${selectedCxc.saldoPendiente.toLocaleString()} USD</p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Monto del Cobro (USD)</label>
                  <input 
                    type="number" 
                    value={abonoForm.monto} 
                    onChange={e => setAbonoForm({ ...abonoForm, monto: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Cuenta Receptora</label>
                  <select 
                    value={abonoForm.cuentaId} 
                    onChange={e => setAbonoForm({ ...abonoForm, cuentaId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    {cuentas.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Referencia Bancaria / Depósito</label>
                  <input 
                    type="text" 
                    placeholder="TRF-CLI-0012" 
                    value={abonoForm.referencia} 
                    onChange={e => setAbonoForm({ ...abonoForm, referencia: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button onClick={() => setShowAbonoModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white">
                  Cancelar
                </button>
                <button onClick={handleExecuteAbono} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md">
                  Confirmar Cobro
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODAL: REGISTRAR PAGO A PROVEEDOR (CXP) */}
        {/* ==================================================================== */}
        {showPagoModal && selectedCxp && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingDown className="text-rose-400" size={20} />
                  Emitir Pago a Proveedor
                </h3>
                <button onClick={() => setShowPagoModal(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs">
                <p className="font-bold text-white">{selectedCxp.proveedorNombre}</p>
                <p className="text-slate-400 font-mono">Factura: {selectedCxp.numeroFactura}</p>
                <p className="text-rose-400 font-bold mt-1">Saldo neto pendiente: ${selectedCxp.saldoPendiente.toLocaleString()} USD</p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Monto a Pagar (USD)</label>
                  <input 
                    type="number" 
                    value={pagoForm.monto} 
                    onChange={e => setPagoForm({ ...pagoForm, monto: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Cuenta Pagadora</label>
                  <select 
                    value={pagoForm.cuentaId} 
                    onChange={e => setPagoForm({ ...pagoForm, cuentaId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    {cuentas.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre} (Saldo: ${c.saldoActual.toLocaleString()})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Referencia Bancaria / Cheque</label>
                  <input 
                    type="text" 
                    placeholder="TRF-BP-9988" 
                    value={pagoForm.referencia} 
                    onChange={e => setPagoForm({ ...pagoForm, referencia: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button onClick={() => setShowPagoModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white">
                  Cancelar
                </button>
                <button onClick={handleExecutePago} className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md">
                  Confirmar Pago
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODAL: NUEVA FACTURA PROVEEDOR (CXP CON RETENCIONES SRI) */}
        {/* ==================================================================== */}
        {showNewCxpModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Receipt className="text-teal-400" size={20} />
                  Ingreso de Factura Proveedor con Retención SRI
                </h3>
                <button onClick={() => setShowNewCxpModal(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Razón Social del Proveedor</label>
                  <input 
                    type="text" 
                    value={newCxpForm.proveedorNombre} 
                    onChange={e => setNewCxpForm({ ...newCxpForm, proveedorNombre: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">RUC Proveedor (13 dígitos)</label>
                    <input 
                      type="text" 
                      value={newCxpForm.proveedorRuc} 
                      onChange={e => setNewCxpForm({ ...newCxpForm, proveedorRuc: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">N° Comprobante SRI</label>
                    <input 
                      type="text" 
                      placeholder="001-002-00045612" 
                      value={newCxpForm.numeroFactura} 
                      onChange={e => setNewCxpForm({ ...newCxpForm, numeroFactura: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Subtotal Bienes/Servicios ($)</label>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={newCxpForm.subtotal} 
                      onChange={e => setNewCxpForm({ ...newCxpForm, subtotal: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Fecha de Vencimiento</label>
                    <input 
                      type="date" 
                      value={newCxpForm.fechaVencimiento} 
                      onChange={e => setNewCxpForm({ ...newCxpForm, fechaVencimiento: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Tipo de Gasto & Régimen Tributario SRI</label>
                  <select 
                    value={newCxpForm.tipoGasto} 
                    onChange={e => setNewCxpForm({ ...newCxpForm, tipoGasto: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="materiales">Materiales de Construcción (1.75% IR - Cód 312 / 30% IVA)</option>
                    <option value="obra_civil_contrato">Contratos de Obra Civil (2.00% IR - Cód 344 / 70% IVA)</option>
                    <option value="transporte_fletes">Transporte Pesado y Fletes (1.00% IR / 0% IVA)</option>
                    <option value="honorarios_profesionales">Honorarios Profesionales (10.00% IR - Cód 303 / 100% IVA)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button onClick={() => setShowNewCxpModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white">
                  Cancelar
                </button>
                <button onClick={handleCreateNewCxp} className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md">
                  Guardar Factura
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
