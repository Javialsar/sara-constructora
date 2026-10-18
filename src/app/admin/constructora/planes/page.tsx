'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  HardHat, 
  Layers, 
  Warehouse, 
  Scale, 
  Receipt, 
  Truck, 
  Building2, 
  Users, 
  Sparkles, 
  Check, 
  X,
  DollarSign,
  TrendingUp,
  Package
} from 'lucide-react';
import { 
  ConstructoraAdminService, 
  PlanConstructora 
} from '@/lib/services/constructoraAdminService';

export default function AdminConstructoraPlanesPage() {
  const [planes, setPlanes] = useState<PlanConstructora[]>([]);
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanConstructora | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<PlanConstructora>>({
    codigo: '',
    nombre: '',
    descripcion: '',
    precioMensual: 49.00,
    precioAnual: 490.00,
    limiteProyectos: 5,
    limiteUsuarios: 4,
    almacenamientoGb: 15,
    modulosIncluidos: [
      'Gestión de Obras y Fiscalización',
      'Kardex de Bodega & Método CPP',
      'Three-Way Match SRI (XML vs OC vs Bodega)',
      'Gestor Documental de Planos y Memorias'
    ],
    esRecomendado: false,
    activo: true,
    orden: 1,
    colorBadge: 'emerald'
  });

  const [nuevoBeneficioTexto, setNuevoBeneficioTexto] = useState('');

  useEffect(() => {
    cargarPlanes();
  }, []);

  const cargarPlanes = () => {
    setPlanes(ConstructoraAdminService.getPlanes());
  };

  const handleAbrirNuevo = () => {
    setEditingPlan(null);
    setFormData({
      codigo: `PLAN-CONST-${planes.length + 1}`,
      nombre: '',
      descripcion: '',
      precioMensual: 49.00,
      precioAnual: 490.00,
      limiteProyectos: 5,
      limiteUsuarios: 4,
      almacenamientoGb: 15,
      modulosIncluidos: [
        'Gestión de Obras & Cronogramas PERT/CPM',
        'Kardex Multibodega & Checklist de Recepción',
        'Three-Way Match SRI para Liquidación de Facturas',
        'Directorio Central & Subcontratistas'
      ],
      esRecomendado: false,
      activo: true,
      orden: planes.length + 1,
      colorBadge: 'emerald'
    });
    setModalFormOpen(true);
  };

  const handleEditar = (plan: PlanConstructora) => {
    setEditingPlan(plan);
    setFormData({ ...plan });
    setModalFormOpen(true);
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.precioMensual) {
      alert('Por favor complete los campos obligatorios del plan');
      return;
    }

    const planGuardar: PlanConstructora = {
      id: editingPlan?.id || `PLAN-CONST-${Date.now().toString().slice(-4)}`,
      codigo: formData.codigo || `PLAN-${Date.now().toString().slice(-4)}`,
      nombre: formData.nombre!,
      descripcion: formData.descripcion || '',
      precioMensual: Number(formData.precioMensual),
      precioAnual: Number(formData.precioAnual) || Number(formData.precioMensual) * 10,
      limiteProyectos: formData.limiteProyectos === 'ILIMITADO' ? 'ILIMITADO' : Number(formData.limiteProyectos),
      limiteUsuarios: formData.limiteUsuarios === 'ILIMITADO' ? 'ILIMITADO' : Number(formData.limiteUsuarios),
      almacenamientoGb: Number(formData.almacenamientoGb) || 10,
      modulosIncluidos: formData.modulosIncluidos || [],
      esRecomendado: Boolean(formData.esRecomendado),
      activo: Boolean(formData.activo),
      orden: Number(formData.orden) || 1,
      colorBadge: formData.colorBadge || 'emerald'
    };

    ConstructoraAdminService.savePlan(planGuardar);
    cargarPlanes();
    setModalFormOpen(false);
  };

  const handleEliminar = (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar el plan "${nombre}"? Los clientes existentes conservarán su configuración actual.`)) {
      ConstructoraAdminService.deletePlan(id);
      cargarPlanes();
    }
  };

  const handleToggleActivo = (id: string) => {
    ConstructoraAdminService.togglePlanActivo(id);
    cargarPlanes();
  };

  const handleAgregarBeneficio = () => {
    if (!nuevoBeneficioTexto.trim()) return;
    setFormData(prev => ({
      ...prev,
      modulosIncluidos: [...(prev.modulosIncluidos || []), nuevoBeneficioTexto.trim()]
    }));
    setNuevoBeneficioTexto('');
  };

  const handleQuitarBeneficio = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      modulosIncluidos: (prev.modulosIncluidos || []).filter((_, i) => i !== idx)
    }));
  };

  // KPIs
  const planesActivos = planes.filter(p => p.activo).length;
  const precioPromedio = planes.length > 0
    ? planes.reduce((acc, p) => acc + p.precioMensual, 0) / planes.length
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Header Institucional */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 border-t-4 border-t-emerald-600">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
              ADMINISTRADOR • GESTIÓN CONSTRUCTORA
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2.5">
            <CreditCard className="text-emerald-600" size={26} />
            <span>Configuración de Planes para SARA-CONSTRUCTORA</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Diseña, calibra tarifas y define las capacidades operativas (obras, cuadrillas, módulos) para cada nivel de suscripción.
          </p>
        </div>

        <button 
          onClick={handleAbrirNuevo}
          className="bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer self-start sm:self-center"
        >
          <Plus size={16} />
          <span>+ Crear Nuevo Plan</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Total Planes Creados</span>
            <Layers size={18} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{planes.length}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Estructura SaaS comercial</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Planes Activos</span>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{planesActivos}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Visibles en registro y contratación</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Ticket Promedio Mensual</span>
            <DollarSign size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
            ${precioPromedio.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">USD por suscripción</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Plan Más Popular</span>
            <Sparkles size={18} className="text-amber-500" />
          </div>
          <div className="text-base font-extrabold text-amber-600 truncate mt-1">
            {planes.find(p => p.esRecomendado)?.nombre || 'Constructora Pro'}
          </div>
          <span className="text-[11px] text-slate-400 block">Suscrito por el 65% de clientes</span>
        </div>
      </div>

      {/* Grid de Cards de Planes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planes.map((plan) => {
          return (
            <div 
              key={plan.id}
              className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-200 p-6 flex flex-col justify-between shadow-sm relative ${
                plan.esRecomendado 
                  ? 'border-2 border-emerald-500 dark:border-emerald-500 shadow-emerald-500/10 shadow-lg' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Badge Recomendado */}
              {plan.esRecomendado && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-[10px] font-mono uppercase tracking-wider shadow-md flex items-center gap-1">
                  <Sparkles size={12} />
                  <span>Recomendado & Más Popular</span>
                </div>
              )}

              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                      Código: {plan.codigo}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      {plan.nombre}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditar(plan)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Editar Plan"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleEliminar(plan.id, plan.nombre)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Eliminar Plan"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 min-h-[36px] leading-relaxed">
                  {plan.descripcion}
                </p>

                {/* Precios */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                      ${plan.precioMensual}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">/ mes (facturación mensual)</span>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center gap-1">
                    <span>O anual con descuento:</span>
                    <strong>${plan.precioAnual}/año</strong>
                    <span className="text-[10px] text-slate-400 font-sans">(Ahorra 2 meses)</span>
                  </div>
                </div>

                {/* Capacidades Técnicas */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-5 py-2 border-y border-slate-100 dark:border-slate-800 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-sans">Obras</span>
                    <strong className="text-slate-800 dark:text-slate-200">{plan.limiteProyectos}</strong>
                  </div>
                  <div className="border-x border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-sans">Usuarios</span>
                    <strong className="text-slate-800 dark:text-slate-200">{plan.limiteUsuarios}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-sans">Planos</span>
                    <strong className="text-slate-800 dark:text-slate-200">{plan.almacenamientoGb} GB</strong>
                  </div>
                </div>

                {/* Módulos y Beneficios */}
                <div className="space-y-2 mb-6">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                    Módulos y Beneficios Incluidos:
                  </span>
                  {plan.modulosIncluidos.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Card */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActivo(plan.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                    plan.activo 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {plan.activo ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  <span>{plan.activo ? 'Plan Activo' : 'Pausado (Oculto)'}</span>
                </button>

                <button
                  onClick={() => handleEditar(plan)}
                  className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 underline underline-offset-2 cursor-pointer"
                >
                  Editar Configuración &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* MODAL: CREAR / EDITAR PLAN CONSTRUCTORA                              */}
      {/* ==================================================================== */}
      {modalFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
                  <CreditCard size={20} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingPlan ? `Editar Plan: ${editingPlan.nombre}` : 'Crear Nuevo Plan para SARA-CONSTRUCTORA'}
                  </h3>
                  <p className="text-xs text-slate-400">Parámetros de tarificación y asignación de módulos operativos.</p>
                </div>
              </div>
              <button 
                onClick={() => setModalFormOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGuardar} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                    Nombre del Plan: *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                    placeholder="Ej: Plan Constructora PyME"
                  />
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                    Código Técnico: *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.codigo}
                    onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value.toUpperCase() }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                    placeholder="PRO-PYME"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                  Descripción Comercial:
                </label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="Enfocado a medianas empresas constructoras con hasta 10 obras activas..."
                />
              </div>

              {/* Tarifas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                    Precio Mensual ($ USD): *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.precioMensual}
                    onChange={(e) => {
                      const m = Number(e.target.value);
                      setFormData(prev => ({ 
                        ...prev, 
                        precioMensual: m,
                        precioAnual: +(m * 10).toFixed(2) // Sugerencia automática de 10 meses
                      }));
                    }}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-emerald-600 text-sm"
                  />
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                    Precio Anual ($ USD - Descuento):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precioAnual}
                    onChange={(e) => setFormData(prev => ({ ...prev, precioAnual: Number(e.target.value) }))}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-emerald-600 text-sm"
                  />
                </div>
              </div>

              {/* Límites Técnicos */}
              <div className="grid grid-cols-3 gap-3.5">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                    Límite Obras:
                  </label>
                  <input
                    type="text"
                    value={formData.limiteProyectos}
                    onChange={(e) => setFormData(prev => ({ ...prev, limiteProyectos: e.target.value as any }))}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-center text-slate-900 dark:text-white"
                    placeholder="10 o ILIMITADO"
                  />
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                    Límite Usuarios:
                  </label>
                  <input
                    type="text"
                    value={formData.limiteUsuarios}
                    onChange={(e) => setFormData(prev => ({ ...prev, limiteUsuarios: e.target.value as any }))}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-center text-slate-900 dark:text-white"
                    placeholder="8 o ILIMITADO"
                  />
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                    Almacenamiento:
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      value={formData.almacenamientoGb}
                      onChange={(e) => setFormData(prev => ({ ...prev, almacenamientoGb: Number(e.target.value) }))}
                      className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-center text-slate-900 dark:text-white"
                    />
                    <span className="font-mono text-slate-400 font-bold">GB</span>
                  </div>
                </div>
              </div>

              {/* Módulos & Beneficios Dinámicos */}
              <div>
                <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                  Módulos y Beneficios Incluidos:
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto mb-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {(formData.modulosIncluidos || []).map((b, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Check size={12} className="text-emerald-500" />
                        <span className="text-slate-800 dark:text-slate-200">{b}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuitarBeneficio(idx)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nuevoBeneficioTexto}
                    onChange={(e) => setNuevoBeneficioTexto(e.target.value)}
                    placeholder="Agregar nuevo módulo o beneficio..."
                    className="flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAgregarBeneficio();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAgregarBeneficio}
                    className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 cursor-pointer"
                  >
                    Agregar
                  </button>
                </div>
              </div>

              {/* Flags */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.esRecomendado}
                    onChange={(e) => setFormData(prev => ({ ...prev, esRecomendado: e.target.checked }))}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Marcar como "Recomendado / Más Popular"
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Plan Activo en Catálogo Público
                  </span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
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
