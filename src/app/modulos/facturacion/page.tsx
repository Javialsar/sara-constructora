'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  PlusCircle, 
  Download, 
  Send, 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  TrendingUp, 
  DollarSign, 
  Receipt, 
  Trash2, 
  Eye, 
  Share2, 
  Users, 
  Package, 
  Upload, 
  Calendar,
  Sparkles,
  ArrowUpRight,
  Filter,
  Percent
} from 'lucide-react';

interface FacturaItem {
  id: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  tarifaIvaPct: number; // 0, 5, 8, 15
}

interface ComprobanteEmitido {
  id: string;
  tipo: '01' | '07' | '04' | '06';
  numero: string;
  cliente: string;
  identificacion: string;
  fecha: string;
  total: number;
  estado: 'AUTORIZADO' | 'EN_PROCESO' | 'DEVUELTA';
  claveAcceso: string;
}

export default function FacturacionDashboardPage() {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'EMITIR' | 'BUZON' | 'HISTORIAL' | 'CATALOGOS' | 'FIRMA'>('DASHBOARD');

  // Datos del Tenant / Usuario simulado
  const tenantInfo = {
    ruc: '1792345678001',
    razonSocial: 'ING. CARLOS MENDOZA ARQUITECTURA & CONSTRUCCIÓN',
    ambiente: 'PRODUCCIÓN (2)',
    planActivo: 'Bolsa Prepago Micro',
    creditosRestantes: 12,
    creditosTotales: 15,
    firmaEstado: 'ACTIVA',
    firmaVenceDias: 284,
    firmaEmisor: 'SECURITY DATA (ARCOTEL)'
  };

  // Estado para el emisor de facturas
  const [tipoComprobante, setTipoComprobante] = useState<'01' | '07' | '04'>('01');
  const [clienteTipoId, setClienteTipoId] = useState<'04' | '05' | '07'>('05');
  const [clienteId, setClienteId] = useState<string>('0104567890');
  const [clienteNombre, setClienteNombre] = useState<string>('JUAN PÉREZ VINTIMILLA');
  const [clienteEmail, setClienteEmail] = useState<string>('juan.perez@constructora.ec');
  const [clienteDireccion, setClienteDireccion] = useState<string>('Av. Solano y Doce de Abril, Cuenca');

  // Ítems de la factura
  const [items, setItems] = useState<FacturaItem[]>([
    {
      id: 'item-1',
      codigo: 'SRV-001',
      descripcion: 'Servicios de Fiscalización Técnica de Estructura de Hormigón',
      cantidad: 1,
      precioUnitario: 450.00,
      tarifaIvaPct: 15.00
    },
    {
      id: 'item-2',
      codigo: 'MAT-002',
      descripcion: 'Suministro de Varilla de Acero Corrugado 12mm (Tarifa Reducida Ley Construcción)',
      cantidad: 20,
      precioUnitario: 12.50,
      tarifaIvaPct: 5.00
    }
  ]);

  // Historial de comprobantes
  const [comprobantes, setComprobantes] = useState<ComprobanteEmitido[]>([
    {
      id: 'cmp-101',
      tipo: '01',
      numero: '001-001-000000142',
      cliente: 'HORMIGONES DEL AUSTRO S.A.',
      identificacion: '0190123456001',
      fecha: '24/10/2026',
      total: 712.50,
      estado: 'AUTORIZADO',
      claveAcceso: '2410202601179234567800120010010000001421234567819'
    },
    {
      id: 'cmp-102',
      tipo: '07',
      numero: '001-001-000000085',
      cliente: 'ING. MARCO TOLEDO (TOPOGRAFÍA)',
      identificacion: '0103456789',
      fecha: '22/10/2026',
      total: 80.00,
      estado: 'AUTORIZADO',
      claveAcceso: '2210202607179234567800120010010000000851234567812'
    },
    {
      id: 'cmp-103',
      tipo: '01',
      numero: '001-001-000000141',
      cliente: 'PROMOTORA INMOBILIARIA URBANA',
      identificacion: '1791827364001',
      fecha: '20/10/2026',
      total: 1250.00,
      estado: 'AUTORIZADO',
      claveAcceso: '2010202601179234567800120010010000001411234567815'
    }
  ]);

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 5000);
  };

  // Cálculos de la factura
  const subtotal15 = items.filter(i => i.tarifaIvaPct === 15).reduce((sum, i) => sum + (i.cantidad * i.precioUnitario), 0);
  const subtotal5 = items.filter(i => i.tarifaIvaPct === 5).reduce((sum, i) => sum + (i.cantidad * i.precioUnitario), 0);
  const subtotal0 = items.filter(i => i.tarifaIvaPct === 0).reduce((sum, i) => sum + (i.cantidad * i.precioUnitario), 0);
  const iva15 = subtotal15 * 0.15;
  const iva5 = subtotal5 * 0.05;
  const totalIva = iva15 + iva5;
  const subtotalGeneral = subtotal15 + subtotal5 + subtotal0;
  const totalFactura = subtotalGeneral + totalIva;

  const agregarItem = () => {
    const nuevo: FacturaItem = {
      id: `item-${Date.now()}`,
      codigo: 'SRV-NEW',
      descripcion: 'Nuevo Servicio o Rubro',
      cantidad: 1,
      precioUnitario: 100.00,
      tarifaIvaPct: 15.00
    };
    setItems([...items, nuevo]);
  };

  const eliminarItem = (id: string) => {
    if (items.length <= 1) {
      showToast('Debe existir al menos un ítem en la factura.');
      return;
    }
    setItems(items.filter(i => i.id !== id));
  };

  const emitirFacturaSRI = () => {
    if (tenantInfo.creditosRestantes <= 0) {
      showToast('No tienes créditos disponibles en tu plan. Por favor recarga o activa un Pase Diario.');
      return;
    }

    const nuevaFac: ComprobanteEmitido = {
      id: `cmp-${Date.now()}`,
      tipo: tipoComprobante,
      numero: `001-001-000000${143 + comprobantes.length}`,
      cliente: clienteNombre,
      identificacion: clienteId,
      fecha: new Date().toLocaleDateString('es-EC'),
      total: totalFactura,
      estado: 'AUTORIZADO',
      claveAcceso: `25102026${tipoComprobante}${tenantInfo.ruc}20010010000001431234567811`
    };

    setComprobantes([nuevaFac, ...comprobantes]);
    tenantInfo.creditosRestantes -= 1;
    showToast(`¡Factura Nº ${nuevaFac.numero} firmada con XAdES-BES y AUTORIZADA por el SRI con éxito!`);
    setActiveTab('HISTORIAL');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 pt-20 pb-16">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-slate-950 font-bold shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-6 h-6" />
          <div className="text-sm">{toast}</div>
        </div>
      )}

      {/* TOP BAR / ESTADO FISCAL DEL TENANT */}
      <div className="bg-slate-900 border-b border-white/[0.08] px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
                SRI {tenantInfo.ambiente}
              </span>
              <span className="text-xs text-slate-500 font-mono">|</span>
              <span className="font-mono text-xs text-slate-400">RUC: {tenantInfo.ruc}</span>
            </div>
            <h1 className="font-display text-lg font-extrabold text-white tracking-tight uppercase mt-0.5">
              {tenantInfo.razonSocial}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Badge Plan Activo */}
            <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-xs font-mono flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-slate-400 text-[10px] block uppercase">Plan Activo</span>
                <strong className="text-white">{tenantInfo.planActivo}: {tenantInfo.creditosRestantes} docs rest.</strong>
              </div>
            </div>

            {/* Badge Semáforo Firma */}
            <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-white/[0.08] text-xs font-mono flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-slate-400 text-[10px] block uppercase">Firma Digital .p12</span>
                <strong className="text-emerald-400">Válida ({tenantInfo.firmaVenceDias} días)</strong>
              </div>
            </div>

            <Link
              href="/facturacion-electronica#planes"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
            >
              <PlusCircle className="w-4 h-4" /> Recargar Créditos
            </Link>
          </div>
        </div>
      </div>

      {/* NAVEGACIÓN POR SUBMÓDULOS */}
      <div className="bg-slate-950/80 border-b border-white/[0.08] px-6 sticky top-20 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'DASHBOARD' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Resumen & Balance SRI
          </button>
          <button
            onClick={() => setActiveTab('EMITIR')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'EMITIR' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <PlusCircle className="w-4 h-4" /> Nueva Factura / Retención
          </button>
          <button
            onClick={() => setActiveTab('HISTORIAL')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'HISTORIAL' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <FileText className="w-4 h-4" /> Comprobantes Emitidos
          </button>
          <button
            onClick={() => setActiveTab('BUZON')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'BUZON' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Upload className="w-4 h-4" /> Buzón & Gastos Deducibles
          </button>
          <button
            onClick={() => setActiveTab('CATALOGOS')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'CATALOGOS' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Users className="w-4 h-4" /> Clientes & Rubros
          </button>
          <button
            onClick={() => setActiveTab('FIRMA')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'FIRMA' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <KeyRound className="w-4 h-4" /> Bóveda de Firma (.p12)
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL SEGÚN TAB ACTIVA */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD & BALANCE FISCAL                         */}
        {/* ========================================================= */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-8 animate-in fade-in-50">
            {/* Tarjetas Métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 rounded-3xl bg-slate-900 border border-white/[0.08]">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
                  <span>Facturado Mes (Ventas)</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="font-display text-3xl font-extrabold text-white mt-2 font-mono">\$ 2,412.50</div>
                <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" /> +18% frente al mes anterior
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-white/[0.08]">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
                  <span>IVA Cobrado en Ventas</span>
                  <Percent className="w-4 h-4 text-blue-400" />
                </div>
                <div className="font-display text-3xl font-extrabold text-blue-400 mt-2 font-mono">\$ 278.40</div>
                <div className="text-[11px] text-slate-400 mt-2">
                  Desglose dual: IVA 15% (\$262) e IVA 5% (\$16.40)
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-white/[0.08]">
                <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
                  <span>IVA Soportado (Compras)</span>
                  <Receipt className="w-4 h-4 text-purple-400" />
                </div>
                <div className="font-display text-3xl font-extrabold text-purple-400 mt-2 font-mono">\$ 142.00</div>
                <div className="text-[11px] text-slate-400 mt-2">
                  Crédito tributario de facturas registradas
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-amber-400/30 bg-gradient-to-br from-slate-900 to-amber-950/20">
                <div className="flex items-center justify-between text-amber-400 text-xs font-mono uppercase font-bold">
                  <span>Proyección IVA SRI (Form. 104)</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div className="font-display text-3xl font-extrabold text-amber-400 mt-2 font-mono">\$ 136.40</div>
                <div className="text-[11px] text-slate-300 mt-2 font-medium">
                  Estimado neto a pagar en próxima declaración
                </div>
              </div>
            </div>

            {/* Accesos rápidos & Comprobantes Recientes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-white/[0.08] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-base font-bold text-white uppercase tracking-tight">
                    Últimas Facturas Emitidas
                  </h3>
                  <button 
                    onClick={() => setActiveTab('HISTORIAL')}
                    className="text-xs font-bold text-amber-400 hover:underline uppercase flex items-center gap-1"
                  >
                    Ver todas <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {comprobantes.map((c) => (
                    <div key={c.id} className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.06] flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {c.estado}
                          </span>
                          <span className="font-mono text-xs font-bold text-white">{c.numero}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{c.cliente}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-extrabold text-amber-400 font-bold">\${c.total.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{c.fecha}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guía Rápida de Emisión */}
              <div className="rounded-3xl bg-slate-900 border border-white/[0.08] p-6 space-y-4">
                <h3 className="font-display text-base font-bold text-white uppercase tracking-tight">
                  Herramientas Fiscales SARA
                </h3>
                
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase">
                    <Percent className="w-4 h-4" /> Tarifa 5% Materiales
                  </div>
                  <p className="text-xs text-slate-400">
                    Aplica automáticamente el 5% en varillas, cemento, bloques y áridos bajo Res. NAC-DGERCGC24-00000013.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase">
                    <Receipt className="w-4 h-4" /> Retenciones Automáticas
                  </div>
                  <p className="text-xs text-slate-400">
                    Genera el XML de retención 07 aplicando códigos Cód. 312 (1.75%), Cód. 344 (1.75%) y Cód. 303 (10%).
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('EMITIR')}
                  className="w-full min-h-[46px] rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20"
                >
                  <PlusCircle className="w-4 h-4" /> Crear Factura Ahora
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: EMISOR MULTI-COMPROBANTE                           */}
        {/* ========================================================= */}
        {activeTab === 'EMITIR' && (
          <div className="max-w-4xl mx-auto rounded-3xl bg-slate-900 border border-white/[0.08] p-6 md:p-8 space-y-8 animate-in fade-in-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">Punto de Emisión 001-001</span>
                <h2 className="font-display text-2xl font-extrabold text-white mt-1">Emisión de Comprobante Electrónico</h2>
              </div>
              
              {/* Selector de Comprobante */}
              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-white/[0.08]">
                <button
                  onClick={() => setTipoComprobante('01')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    tipoComprobante === '01' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Factura (01)
                </button>
                <button
                  onClick={() => setTipoComprobante('07')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    tipoComprobante === '07' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Retención (07)
                </button>
                <button
                  onClick={() => setTipoComprobante('04')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    tipoComprobante === '04' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  N. Crédito (04)
                </button>
              </div>
            </div>

            {/* Datos del Cliente */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider">1. Datos del Cliente / Receptor</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-medium">Tipo Identificación</label>
                  <select
                    value={clienteTipoId}
                    onChange={(e) => setClienteTipoId(e.target.value as any)}
                    className="w-full min-h-[44px] px-3 rounded-xl bg-slate-950 border border-white/[0.12] text-xs text-white outline-none focus:border-amber-400"
                  >
                    <option value="05">Cédula de Identidad</option>
                    <option value="04">RUC</option>
                    <option value="07">Consumidor Final</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-medium">Número Cédula / RUC</label>
                  <input
                    type="text"
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    className="w-full min-h-[44px] px-3 rounded-xl bg-slate-950 border border-white/[0.12] text-xs text-white font-mono outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-medium">Razón Social / Nombre</label>
                  <input
                    type="text"
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    className="w-full min-h-[44px] px-3 rounded-xl bg-slate-950 border border-white/[0.12] text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-medium">Correo Electrónico (para envío de XML y RIDE)</label>
                  <input
                    type="email"
                    value={clienteEmail}
                    onChange={(e) => setClienteEmail(e.target.value)}
                    className="w-full min-h-[44px] px-3 rounded-xl bg-slate-950 border border-white/[0.12] text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-medium">Dirección</label>
                  <input
                    type="text"
                    value={clienteDireccion}
                    onChange={(e) => setClienteDireccion(e.target.value)}
                    className="w-full min-h-[44px] px-3 rounded-xl bg-slate-950 border border-white/[0.12] text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Ítems y Rubros */}
            <div className="space-y-4 pt-4 border-t border-white/[0.08]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider">2. Detalle de Bienes y Servicios</h3>
                <button
                  onClick={agregarItem}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-amber-400 flex items-center gap-1.5 transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Agregar Ítem
                </button>
              </div>

              <div className="space-y-3">
                {items.map((it, idx) => (
                  <div key={it.id} className="p-4 rounded-2xl bg-slate-950 border border-white/[0.08] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-5">
                      <label className="text-[10px] text-slate-500 uppercase block mb-1">Descripción</label>
                      <input
                        type="text"
                        value={it.descripcion}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].descripcion = e.target.value;
                          setItems(updated);
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/[0.08] text-xs text-white outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-500 uppercase block mb-1">Cant.</label>
                      <input
                        type="number"
                        min="1"
                        value={it.cantidad}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].cantidad = parseFloat(e.target.value) || 1;
                          setItems(updated);
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/[0.08] text-xs text-white font-mono outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-500 uppercase block mb-1">Precio U.</label>
                      <input
                        type="number"
                        step="0.01"
                        value={it.precioUnitario}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].precioUnitario = parseFloat(e.target.value) || 0;
                          setItems(updated);
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/[0.08] text-xs text-white font-mono outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-500 uppercase block mb-1">IVA SRI</label>
                      <select
                        value={it.tarifaIvaPct}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].tarifaIvaPct = parseFloat(e.target.value);
                          setItems(updated);
                        }}
                        className="w-full px-2 py-2 rounded-lg bg-slate-900 border border-white/[0.08] text-xs text-white outline-none focus:border-amber-400"
                      >
                        <option value="15">15% General</option>
                        <option value="5">5% Construcción</option>
                        <option value="8">8% Turismo</option>
                        <option value="0">0% Exento</option>
                      </select>
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        onClick={() => eliminarItem(it.id)}
                        className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                        title="Eliminar ítem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen de Totales y Botón de Firma */}
            <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1.5 text-xs text-slate-400 font-mono">
                <div>Subtotal 15%: <strong className="text-white">\${subtotal15.toFixed(2)}</strong> (IVA: \${iva15.toFixed(2)})</div>
                <div>Subtotal 5% (Construcción): <strong className="text-white">\${subtotal5.toFixed(2)}</strong> (IVA: \${iva5.toFixed(2)})</div>
                <div>Subtotal 0%: <strong className="text-white">\${subtotal0.toFixed(2)}</strong></div>
                <div className="text-sm font-bold text-amber-400 pt-2 border-t border-white/[0.08]">
                  TOTAL A PAGAR: \${totalFactura.toFixed(2)} USD
                </div>
              </div>

              <button
                onClick={emitirFacturaSRI}
                className="w-full sm:w-auto min-h-[50px] px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
              >
                <KeyRound className="w-4 h-4" /> Firmar XAdES-BES y Enviar al SRI
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: HISTORIAL DE COMPROBANTES EMITIDOS                 */}
        {/* ========================================================= */}
        {activeTab === 'HISTORIAL' && (
          <div className="space-y-6 animate-in fade-in-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-white">Historial de Comprobantes SRI</h2>
                <p className="text-xs text-slate-400">Descarga RIDE (PDF) con código QR oficial y XML firmado en cualquier momento.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('EMITIR')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all"
                >
                  <PlusCircle className="w-4 h-4" /> Nueva Factura
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900 border border-white/[0.08] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] border-b border-white/[0.08]">
                    <tr>
                      <th className="px-6 py-4">Tipo & Secuencial</th>
                      <th className="px-6 py-4">Cliente / Identificación</th>
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4">Total USD</th>
                      <th className="px-6 py-4">Estado SRI</th>
                      <th className="px-6 py-4 text-right">Descargas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {comprobantes.map((c) => (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono font-bold text-white block">{c.numero}</span>
                          <span className="text-[10px] text-slate-500 uppercase">{c.tipo === '01' ? 'Factura' : c.tipo === '07' ? 'Retención' : 'N. Crédito'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white font-medium block">{c.cliente}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{c.identificacion}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-mono">{c.fecha}</td>
                        <td className="px-6 py-4 font-mono font-bold text-amber-400">\${c.total.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {c.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => showToast(`Descargando RIDE (PDF) con QR para ${c.numero}...`)}
                            className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white transition-all"
                            title="Descargar RIDE PDF"
                          >
                            <Download className="w-4 h-4 text-red-400" />
                          </button>
                          <button
                            onClick={() => showToast(`Descargando XML firmado para ${c.numero}...`)}
                            className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white transition-all"
                            title="Descargar XML Firmado"
                          >
                            <FileText className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => showToast(`Comprobante ${c.numero} reenviado por correo al cliente.`)}
                            className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white transition-all"
                            title="Reenviar por Email"
                          >
                            <Send className="w-4 h-4 text-emerald-400" />
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

        {/* ========================================================= */}
        {/* TAB 4: BUZÓN DE GASTOS DEDUCIBLES                         */}
        {/* ========================================================= */}
        {activeTab === 'BUZON' && (
          <div className="space-y-6 animate-in fade-in-50">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-white">Buzón Inteligente de Gastos Deducibles</h2>
              <p className="text-xs text-slate-400">Carga los XMLs de tus compras para calcular tu crédito tributario y deducir gastos en tu Impuesto a la Renta.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Zona de Subida */}
              <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-white/[0.08] p-8 text-center border-dashed border-white/[0.2] hover:border-amber-400/50 transition-all flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-white">Arrastra tus facturas electrónicas (.XML o .PDF)</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    El agente clasificará automáticamente tus compras en Salud, Alimentación, Educación, Vivienda, Vestimenta o Turismo.
                  </p>
                </div>
                <button
                  onClick={() => showToast('Selecciona los archivos XML emitidos por tus proveedores.')}
                  className="px-6 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-xs font-bold uppercase tracking-wider text-white"
                >
                  Examinar Archivos
                </button>
              </div>

              {/* Clasificador de Gastos SRI */}
              <div className="rounded-3xl bg-slate-900 border border-white/[0.08] p-6 space-y-4">
                <h3 className="font-display text-sm font-bold text-white uppercase tracking-tight">
                  Acumulado Gastos Personales 2026
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>🥗 Alimentación:</span>
                    <span className="font-mono font-bold text-white">\$ 450.00</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>🏥 Salud:</span>
                    <span className="font-mono font-bold text-white">\$ 180.00</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>🏠 Vivienda:</span>
                    <span className="font-mono font-bold text-white">\$ 320.00</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>🎓 Educación:</span>
                    <span className="font-mono font-bold text-white">\$ 95.00</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>🏖️ Turismo Nacional:</span>
                    <span className="font-mono font-bold text-white">\$ 140.00</span>
                  </div>
                  <div className="pt-3 border-t border-white/[0.08] flex justify-between font-bold text-amber-400">
                    <span>TOTAL DEDUCIBLE:</span>
                    <span className="font-mono">\$ 1,185.00 USD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: BÓVEDA DE FIRMA ELECTRÓNICA                        */}
        {/* ========================================================= */}
        {activeTab === 'FIRMA' && (
          <div className="max-w-3xl mx-auto rounded-3xl bg-slate-900 border border-white/[0.08] p-8 space-y-6 animate-in fade-in-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-display text-xl font-extrabold text-white">Bóveda Criptográfica de Firma Digital</h2>
                <p className="text-xs text-slate-400">Certificados almacenados bajo cifrado bancario AES-256 en Supabase Vault.</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> CERTIFICADO ACTIVO & HOMOLOGADO
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300">
                  ARCOTEL Validado
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase">Emisor Autorizado:</span>
                  <span className="text-white font-bold">{tenantInfo.firmaEmisor}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase">Días Restantes de Validez:</span>
                  <span className="text-emerald-400 font-bold">{tenantInfo.firmaVenceDias} días</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-400">
                ¿Necesitas actualizar o renovar tu certificado antes de que caduque?
              </p>
              <Link
                href="/facturacion-electronica#firma-electronica"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shrink-0"
              >
                Renovar Firma (\$18)
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: CATÁLOGOS DE CLIENTES & RUBROS                     */}
        {/* ========================================================= */}
        {activeTab === 'CATALOGOS' && (
          <div className="space-y-6 animate-in fade-in-50">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-white">Catálogo de Clientes & Servicios</h2>
              <p className="text-xs text-slate-400">Administra tus contactos frecuentes para emitir facturas en menos de 10 segundos.</p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900 border border-white/[0.08] text-center space-y-3">
              <Users className="w-10 h-10 text-amber-400 mx-auto opacity-70" />
              <h3 className="font-display text-base font-bold text-white">Directorio Centralizado SARA</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Tus clientes quedan guardados automáticamente cada vez que emites una factura, permitiendo autocompletado instantáneo por Cédula o RUC.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}