'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Percent, 
  DollarSign, 
  Layers, 
  Sparkles, 
  Check, 
  X, 
  RotateCcw,
  ShieldCheck,
  Package,
  FileSpreadsheet,
  Code2,
  Building,
  Store,
  ArrowRight
} from 'lucide-react';
import { 
  MarketplacePlansService, 
  MarketplacePlan 
} from '@/lib/services/marketplacePlansService';

export default function AdminMarketplacePlanesPage() {
  const [planes, setPlanes] = useState<MarketplacePlan[]>([]);
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MarketplacePlan | null>(null);
  const [notificacion, setNotificacion] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<MarketplacePlan, 'id'>>({
    codigo: '',
    nombre: '',
    porcentajeComision: 10,
    costoMensualUSD: 79,
    badge: '',
    colorBadge: 'bg-blue-600 text-white font-bold',
    descripcion: '',
    caracteristicas: [
      'Comisión preferencial sobre ventas concretadas',
      'Exposición destacada en la vitrina del Marketplace B2B',
      'Carga masiva mediante plantillas Excel (.xlsx)',
      'Liquidación respaldada por Fideicomiso Escrow'
    ],
    maxProductos: 1000,
    soportaApi: false,
    soportaExcel: true,
    prioridadExhibicion: 2,
    activo: true,
    orden: 1,
    esSistema: false
  });

  const [nuevoBeneficioTexto, setNuevoBeneficioTexto] = useState('');

  useEffect(() => {
    cargarPlanes();
  }, []);

  const cargarPlanes = () => {
    setPlanes(MarketplacePlansService.getPlanes());
  };

  const mostrarNotificacion = (tipo: 'success' | 'error', texto: string) => {
    setNotificacion({ tipo, texto });
    setTimeout(() => {
      setNotificacion(null);
    }, 4000);
  };

  const handleAbrirNuevo = () => {
    setEditingPlan(null);
    setFormData({
      codigo: `PLAN_${Date.now().toString().slice(-4)}`,
      nombre: '',
      porcentajeComision: 10,
      costoMensualUSD: 50,
      badge: 'Nuevo Plan',
      colorBadge: 'bg-indigo-600 text-white font-bold',
      descripcion: '',
      caracteristicas: [
        'Comisión sobre ventas netas en Grupo SARA',
        'Exposición en vitrina de suministros de obra',
        'Carga de catálogo e insumos'
      ],
      maxProductos: 500,
      soportaApi: false,
      soportaExcel: true,
      prioridadExhibicion: planes.length + 1,
      activo: true,
      orden: planes.length + 1,
      esSistema: false
    });
    setNuevoBeneficioTexto('');
    setModalFormOpen(true);
  };

  const handleEditar = (plan: MarketplacePlan) => {
    setEditingPlan(plan);
    setFormData({
      codigo: plan.codigo,
      nombre: plan.nombre,
      porcentajeComision: plan.porcentajeComision,
      costoMensualUSD: plan.costoMensualUSD,
      badge: plan.badge,
      colorBadge: plan.colorBadge,
      descripcion: plan.descripcion,
      caracteristicas: [...plan.caracteristicas],
      maxProductos: plan.maxProductos,
      soportaApi: plan.soportaApi,
      soportaExcel: plan.soportaExcel,
      prioridadExhibicion: plan.prioridadExhibicion,
      activo: plan.activo,
      orden: plan.orden,
      esSistema: plan.esSistema
    });
    setNuevoBeneficioTexto('');
    setModalFormOpen(true);
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      mostrarNotificacion('error', 'El nombre del plan es obligatorio.');
      return;
    }

    if (formData.porcentajeComision < 0 || formData.porcentajeComision > 100) {
      mostrarNotificacion('error', 'El porcentaje de comisión debe estar entre 0% y 100%.');
      return;
    }

    try {
      if (editingPlan) {
        MarketplacePlansService.guardarPlan({
          ...formData,
          id: editingPlan.id
        });
        mostrarNotificacion('success', `Plan "${formData.nombre}" actualizado con éxito.`);
      } else {
        MarketplacePlansService.crearPlan(formData);
        mostrarNotificacion('success', `Nuevo plan "${formData.nombre}" creado exitosamente.`);
      }
      setModalFormOpen(false);
      cargarPlanes();
    } catch (err: any) {
      mostrarNotificacion('error', err.message || 'Error al guardar el plan.');
    }
  };

  const handleEliminar = (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar el plan "${nombre}"?`)) {
      MarketplacePlansService.eliminarPlan(id);
      mostrarNotificacion('success', `Plan "${nombre}" eliminado.`);
      cargarPlanes();
    }
  };

  const handleRestablecer = () => {
    if (confirm('¿Restablecer los planes predeterminados (VIP 15%, EMPRESARIAL 10%, BÁSICO 8%)?')) {
      MarketplacePlansService.restablecerPredeterminados();
      mostrarNotificacion('success', 'Planes predeterminados restablecidos exitosamente.');
      cargarPlanes();
    }
  };

  const agregarCaracteristica = () => {
    if (!nuevoBeneficioTexto.trim()) return;
    setFormData({
      ...formData,
      caracteristicas: [...formData.caracteristicas, nuevoBeneficioTexto.trim()]
    });
    setNuevoBeneficioTexto('');
  };

  const removerCaracteristica = (index: number) => {
    setFormData({
      ...formData,
      caracteristicas: formData.caracteristicas.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* NOTIFICACIONES TOAST */}
      {notificacion && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-sm font-semibold shadow-lg transition-all animate-in fade-in slide-in-from-top-4 ${
          notificacion.tipo === 'success' 
            ? 'bg-emerald-500 text-slate-950 font-bold' 
            : 'bg-rose-500 text-white font-bold'
        }`}>
          <span>{notificacion.texto}</span>
          <button onClick={() => setNotificacion(null)} className="ml-4 font-black">✕</button>
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/30">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  GESTIÓN MARKETPLACE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  Modelo B2B Materiales
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Planes de Proveedores & Fabricantes
              </h1>
            </div>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
            Configuración oficial de los planes de membresía para empresas vendedoras. Define porcentajes de comisión de Grupo SARA (VIP 15%, EMPRESARIAL 10%, BÁSICO 8%), costos de suscripción y características comerciales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRestablecer}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-slate-300 dark:border-slate-700"
            title="Restablecer a valores de fábrica"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Predeterminados</span>
          </button>

          <button
            onClick={handleAbrirNuevo}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nuevo Plan</span>
          </button>
        </div>
      </div>

      {/* TARJETAS RESUMEN KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-mono text-slate-400 block mb-1">TOTAL DE PLANES ACTIVOS</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{planes.length}</span>
            <span className="text-xs text-blue-600 font-bold">Catálogo SARA</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-amber-500/30 bg-amber-500/5 shadow-sm">
          <span className="text-xs font-mono text-amber-500 block mb-1">PLAN VIP (MÁXIMA PRIORIDAD)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-500">15.0%</span>
            <span className="text-xs font-mono text-slate-400">$199/mes</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-blue-500/30 bg-blue-500/5 shadow-sm">
          <span className="text-xs font-mono text-blue-500 block mb-1">PLAN EMPRESARIAL (DISTRIBUIDOR)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">10.0%</span>
            <span className="text-xs font-mono text-slate-400">$79/mes</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 shadow-sm">
          <span className="text-xs font-mono text-emerald-500 block mb-1">PLAN BÁSICO (FERRETERÍAS)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600">8.0%</span>
            <span className="text-xs font-mono text-slate-400">$0/mes</span>
          </div>
        </div>
      </div>

      {/* CUADRÍCULA DE PLANES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {planes.map((plan) => {
          const isVip = plan.id === 'VIP' || plan.codigo === 'VIP';
          const isEmpresarial = plan.id === 'EMPRESARIAL' || plan.codigo === 'EMPRESARIAL';
          const isBasico = plan.id === 'BASICO' || plan.codigo === 'BASICO';

          return (
            <div 
              key={plan.id}
              className={`rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                isVip 
                  ? 'bg-gradient-to-b from-amber-500/10 via-white to-white dark:from-amber-500/10 dark:via-slate-900 dark:to-slate-900 border-amber-400/50' 
                  : isEmpresarial 
                    ? 'bg-gradient-to-b from-blue-500/10 via-white to-white dark:from-blue-500/10 dark:via-slate-900 dark:to-slate-900 border-blue-400/40'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Encabezado del Plan */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${plan.colorBadge}`}>
                    {plan.badge || plan.nombre}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditar(plan)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 rounded-lg transition-colors"
                      title="Editar Plan"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {!plan.esSistema && (
                      <button
                        onClick={() => handleEliminar(plan.id, plan.nombre)}
                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 rounded-lg transition-colors"
                        title="Eliminar Plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {plan.nombre}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {plan.descripcion}
                  </p>
                </div>

                {/* Métricas clave */}
                <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                    <span className="text-[10px] font-mono text-slate-400 block">COMISIÓN GRUPO SARA</span>
                    <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                      {plan.porcentajeComision}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                    <span className="text-[10px] font-mono text-slate-400 block">COSTO MENSUAL</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      ${plan.costoMensualUSD} <span className="text-xs font-normal text-slate-400">USD</span>
                    </span>
                  </div>
                </div>

                {/* Capacidades Técnicas */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                    <Package className="w-3 h-3 text-slate-500" />
                    Hasta {plan.maxProductos} SKUs
                  </span>
                  {plan.soportaApi && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 border border-amber-500/20">
                      <Code2 className="w-3 h-3" />
                      API REST ERPs
                    </span>
                  )}
                  {plan.soportaExcel && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 border border-emerald-500/20">
                      <FileSpreadsheet className="w-3 h-3" />
                      Excel Masivo
                    </span>
                  )}
                </div>
              </div>

              {/* Lista de Características */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                    Beneficios & Características:
                  </h4>
                  <ul className="space-y-2">
                    {plan.caracteristicas.map((caract, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{caract}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleEditar(plan)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Editar Porcentajes & Beneficios</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL PARA CREAR / EDITAR PLAN */}
      {modalFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Cabecera del modal */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 uppercase">
                  {editingPlan ? 'EDITAR PLAN MARKETPLACE' : 'NUEVO PLAN MARKETPLACE'}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {editingPlan ? `Modificar Plan: ${editingPlan.nombre}` : 'Registrar Nuevo Plan de Proveedores'}
                </h3>
              </div>
              <button 
                onClick={() => setModalFormOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardar} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Nombre del Plan:</label>
                  <input 
                    type="text" 
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="VIP / EMPRESARIAL / BÁSICO"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Código Identificador:</label>
                  <input 
                    type="text" 
                    required
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="VIP / EMPRESARIAL / BASICO"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Comisión Grupo SARA (%):</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.1"
                      min="0"
                      max="100"
                      required
                      value={formData.porcentajeComision}
                      onChange={(e) => setFormData({ ...formData, porcentajeComision: Number(e.target.value) })}
                      className="w-full pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-black text-blue-600 dark:text-blue-400"
                    />
                    <Percent className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Costo Mensual ($ USD):</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      required
                      value={formData.costoMensualUSD}
                      onChange={(e) => setFormData({ ...formData, costoMensualUSD: Number(e.target.value) })}
                      className="w-full pl-7 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    />
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Capacidad Máx. Productos:</label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    value={formData.maxProductos}
                    onChange={(e) => setFormData({ ...formData, maxProductos: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Descripción General del Plan:</label>
                <textarea 
                  rows={2}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Enfocado a fabricantes industriales con cobertura a nivel nacional..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Texto de la Insignia (Badge):</label>
                  <input 
                    type="text" 
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="VIP (15%) / Empresarial (10%)"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Color / Estilo de la Insignia:</label>
                  <select
                    value={formData.colorBadge}
                    onChange={(e) => setFormData({ ...formData, colorBadge: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold"
                  >
                    <option value="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black">Dorado VIP (Gradiente Ámbar)</option>
                    <option value="bg-blue-600 text-white font-bold">Azul Empresarial Pro</option>
                    <option value="bg-emerald-600 text-white font-bold">Verde Básico Ferretería</option>
                    <option value="bg-purple-600 text-white font-bold">Púrpura Exclusivo</option>
                    <option value="bg-slate-800 text-white font-bold">Grafito Industrial</option>
                  </select>
                </div>
              </div>

              {/* Switches de Integración */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap gap-6 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.soportaApi}
                    onChange={(e) => setFormData({ ...formData, soportaApi: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Soporta API REST para ERPs</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.soportaExcel}
                    onChange={(e) => setFormData({ ...formData, soportaExcel: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Carga Masiva por Excel (.xlsx)</span>
                </label>
              </div>

              {/* Gestión de Características / Beneficios */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-mono text-slate-400">Características & Beneficios Incluidos:</label>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={nuevoBeneficioTexto}
                    onChange={(e) => setNuevoBeneficioTexto(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        agregarCaracteristica();
                      }
                    }}
                    placeholder="Ej: Prioridad exclusiva en cotizaciones de SARA Fiscaliza"
                    className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                  />
                  <button 
                    type="button" 
                    onClick={agregarCaracteristica}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                  >
                    Agregar
                  </button>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {formData.caracteristicas.map((caract, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                      <span className="truncate pr-2">{caract}</span>
                      <button 
                        type="button" 
                        onClick={() => removerCaracteristica(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalFormOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
                >
                  {editingPlan ? 'Guardar Cambios' : 'Crear Plan'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
