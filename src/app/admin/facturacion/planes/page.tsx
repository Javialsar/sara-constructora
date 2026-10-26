'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileCheck2, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Check, 
  X,
  DollarSign, 
  TrendingUp, 
  Clock, 
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  Save,
  RotateCcw
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export interface PlanFacturacion {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo_plan: 'tiempo' | 'bolsa' | 'suscripcion';
  precio_usd: number;
  duracion_dias: number;
  limite_documentos: number; // 0 = ilimitado
  beneficios: string[];
  es_destacado: boolean;
  activo: boolean;
  badge: string;
}

const PLANES_INICIALES: PlanFacturacion[] = [
  {
    id: 'plan-1',
    codigo: 'PLAN_DIARIO_24H',
    nombre: 'Plan Diario 24h',
    descripcion: 'Emisión ilimitada durante 24 horas continuas para liquidar trabajos urgentes.',
    tipo_plan: 'tiempo',
    precio_usd: 1.50,
    duracion_dias: 1,
    limite_documentos: 0,
    beneficios: [
      'Facturas y retenciones ilimitadas por 24 horas',
      'Cálculo dual IVA 15% y 5% materiales',
      'RIDE en PDF oficial y XML firmado',
      'Envío por correo electrónico automático'
    ],
    es_destacado: false,
    activo: true,
    badge: 'On-Demand'
  },
  {
    id: 'plan-2',
    codigo: 'PLAN_SEMANAL_7D',
    nombre: 'Plan Semanal (7 Días)',
    descripcion: 'Facturación ilimitada durante 7 días continuos para consultores e inspectores.',
    tipo_plan: 'tiempo',
    precio_usd: 4.50,
    duracion_dias: 7,
    limite_documentos: 0,
    beneficios: [
      '7 Días de facturación ilimitada',
      'Facturas, retenciones y guías de remisión',
      'Catálogo rápido de clientes guardados',
      'Descarga masiva de XMLs y PDFs'
    ],
    es_destacado: false,
    activo: true,
    badge: 'Sprint 7 Días'
  },
  {
    id: 'plan-3',
    codigo: 'BOLSA_15_DOCS',
    nombre: 'Bolsa Micro (15 Docs)',
    descripcion: '15 comprobantes que se consumen solo al emitir. Saldo sin caducidad.',
    tipo_plan: 'bolsa',
    precio_usd: 3.99,
    duracion_dias: 0,
    limite_documentos: 15,
    beneficios: [
      '15 Comprobantes que NUNCA caducan',
      'Portal de consulta rápida para clientes',
      'Tarifas IVA 0%, 5%, 8% y 15%',
      'Reenvío directo por WhatsApp'
    ],
    es_destacado: true,
    activo: true,
    badge: 'Sin Caducidad'
  },
  {
    id: 'plan-4',
    codigo: 'BOLSA_60_DOCS',
    nombre: 'Bolsa Estándar (60 Docs)',
    descripcion: 'Saldo de 60 comprobantes prepago para contratistas y transportistas.',
    tipo_plan: 'bolsa',
    precio_usd: 11.99,
    duracion_dias: 0,
    limite_documentos: 60,
    beneficios: [
      '60 Comprobantes prepago sin vencimiento',
      'Acceso móvil PWA Offline-First',
      'Reportes para declaración mensual SRI',
      'Soporte técnico VIP vía WhatsApp'
    ],
    es_destacado: false,
    activo: true,
    badge: 'Prepago Regular'
  },
  {
    id: 'plan-5',
    codigo: 'MENSUAL_PRO',
    nombre: 'Plan Mensual Pro Ilimitado',
    descripcion: 'Facturación ilimitada mensual, proyección Form. 104 y buzón deducible.',
    tipo_plan: 'suscripcion',
    precio_usd: 7.99,
    duracion_dias: 30,
    limite_documentos: 0,
    beneficios: [
      'Facturas y retenciones ilimitadas',
      'Buzón de compras y gastos deducibles',
      'Proyección automática Formulario 104 SRI',
      'API REST para conexión con ERP / Contable'
    ],
    es_destacado: false,
    activo: true,
    badge: 'Suscripción Mensual'
  },
  {
    id: 'plan-6',
    codigo: 'COMBO_ANUAL_VIP',
    nombre: 'Combo Anual VIP + Firma Gratis',
    descripcion: '1 año de facturación ilimitada con emisión de Firma Electrónica .p12 incluida.',
    tipo_plan: 'suscripcion',
    precio_usd: 59.99,
    duracion_dias: 365,
    limite_documentos: 0,
    beneficios: [
      '365 Días de facturación ilimitada',
      'Firma Electrónica .p12 de 1 año INCLUIDA',
      'Bóveda de llaves cifrada AES-256',
      'Acompañamiento tributario prioritario'
    ],
    es_destacado: true,
    activo: true,
    badge: 'Mejor Ahorro (-40%)'
  }
];

export default function AdminFacturacionPlanesPage() {
  const [planes, setPlanes] = useState<PlanFacturacion[]>(PLANES_INICIALES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanFacturacion | null>(null);
  const [formData, setFormData] = useState<Partial<PlanFacturacion>>({
    codigo: '',
    nombre: '',
    descripcion: '',
    tipo_plan: 'bolsa',
    precio_usd: 4.99,
    duracion_dias: 0,
    limite_documentos: 20,
    beneficios: [],
    es_destacado: false,
    activo: true,
    badge: 'Estándar'
  });
  const [nuevoBeneficio, setNuevoBeneficio] = useState('');
  const [guardadoExito, setGuardadoExito] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sara_admin_planes_facturacion');
    if (saved) {
      try {
        setPlanes(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const persistirPlanes = (nuevos: PlanFacturacion[]) => {
    setPlanes(nuevos);
    localStorage.setItem('sara_admin_planes_facturacion', JSON.stringify(nuevos));
    setGuardadoExito(true);
    setTimeout(() => setGuardadoExito(false), 3000);
  };

  const abrirModalCrear = () => {
    setEditingPlan(null);
    setFormData({
      codigo: `PLAN_${Date.now().toString().slice(-4)}`,
      nombre: '',
      descripcion: '',
      tipo_plan: 'bolsa',
      precio_usd: 4.99,
      duracion_dias: 0,
      limite_documentos: 20,
      beneficios: [
        'Facturas y retenciones electrónicas SRI',
        'Cálculo dual tarifa 15% y 5% construcción',
        'Descarga RIDE (PDF) y XML homologado'
      ],
      es_destacado: false,
      activo: true,
      badge: 'Nuevo Plan'
    });
    setModalOpen(true);
  };

  const abrirModalEditar = (plan: PlanFacturacion) => {
    setEditingPlan(plan);
    setFormData({ ...plan });
    setModalOpen(true);
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.precio_usd) return;

    if (editingPlan) {
      const actualizados = planes.map(p => 
        p.id === editingPlan.id ? { ...p, ...formData } as PlanFacturacion : p
      );
      persistirPlanes(actualizados);
    } else {
      const nuevo: PlanFacturacion = {
        id: `plan-${Date.now()}`,
        codigo: formData.codigo || `PLAN_${Date.now().toString().slice(-4)}`,
        nombre: formData.nombre || 'Nuevo Plan',
        descripcion: formData.descripcion || '',
        tipo_plan: formData.tipo_plan || 'bolsa',
        precio_usd: Number(formData.precio_usd) || 0,
        duracion_dias: Number(formData.duracion_dias) || 0,
        limite_documentos: Number(formData.limite_documentos) || 0,
        beneficios: formData.beneficios || [],
        es_destacado: !!formData.es_destacado,
        activo: formData.activo ?? true,
        badge: formData.badge || 'Oficial'
      };
      persistirPlanes([...planes, nuevo]);
    }
    setModalOpen(false);
  };

  const handleEliminar = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este plan tarifario?')) {
      const filtrados = planes.filter(p => p.id !== id);
      persistirPlanes(filtrados);
    }
  };

  const handleToggleActivo = (id: string) => {
    const actualizados = planes.map(p => 
      p.id === id ? { ...p, activo: !p.activo } : p
    );
    persistirPlanes(actualizados);
  };

  const agregarBeneficio = () => {
    if (!nuevoBeneficio.trim()) return;
    setFormData(prev => ({
      ...prev,
      beneficios: [...(prev.beneficios || []), nuevoBeneficio.trim()]
    }));
    setNuevoBeneficio('');
  };

  const removerBeneficio = (index: number) => {
    setFormData(prev => ({
      ...prev,
      beneficios: (prev.beneficios || []).filter((_, i) => i !== index)
    }));
  };

  const totalActivos = planes.filter(p => p.activo).length;
  const precioMinimo = Math.min(...planes.map(p => p.precio_usd));
  const bolsasTotal = planes.filter(p => p.tipo_plan === 'bolsa').length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Alerta de Éxito Flotante */}
      {guardadoExito && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5" />
          <span>Configuración de planes sincronizada y guardada exitosamente</span>
        </div>
      )}

      {/* Header Superior */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase tracking-wide">
              Módulo SARA-FACTURACIÓN
            </span>
            <span className="text-xs text-slate-500 font-medium">SRI Homologado 2026</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <FileCheck2 className="w-8 h-8 text-amber-600" />
            Planes de Facturación Electrónica SRI
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Administra los planes diarios, bolsas prepago sin caducidad y suscripciones que se ofertan en la landing y cotizadores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/facturacion-electronica#planes"
            target="_blank"
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <span>Ver Landing Pública</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={abrirModalCrear}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nuevo Plan</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas de Planes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total de Planes</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{planes.length}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              {totalActivos} activos en catálogo
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Precio Mínimo Entrada</div>
            <div className="text-3xl font-black text-emerald-600 mt-1">${precioMinimo.toFixed(2)}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Pase Diario 24 horas</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Bolsas Prepago</div>
            <div className="text-3xl font-black text-blue-600 mt-1">{bolsasTotal}</div>
            <div className="text-[11px] text-blue-600 font-semibold mt-1">Sin vencimiento de saldo</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Cumplimiento SRI</div>
            <div className="text-3xl font-black text-indigo-600 mt-1">100%</div>
            <div className="text-[11px] text-indigo-600 font-semibold mt-1">IVA 15% & 5% Construcción</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid de Tarjetas de Planes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {planes.map((plan) => (
          <div 
            key={plan.id}
            className={`rounded-2xl border transition-all flex flex-col justify-between ${
              plan.activo ? 'bg-white border-slate-200 hover:shadow-lg hover:border-amber-400' : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start gap-2 mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  plan.es_destacado ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-700'
                }`}>
                  {plan.badge}
                </span>
                <button
                  onClick={() => handleToggleActivo(plan.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    plan.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {plan.activo ? '● Activo' : '○ Pausado'}
                </button>
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-1">{plan.nombre}</h3>
              <p className="text-xs text-slate-500 min-h-[36px] line-clamp-2 mb-4">{plan.descripcion}</p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 font-mono">
                    ${plan.precio_usd.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {plan.tipo_plan === 'tiempo' ? (plan.duracion_dias === 1 ? '/ 24 horas' : `/ ${plan.duracion_dias} días`) : 
                     plan.tipo_plan === 'bolsa' ? 'pago único' : 
                     plan.duracion_dias === 365 ? '/ año' : '/ mes'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                  <span>Código: <strong className="font-mono text-slate-700">{plan.codigo}</strong></span>
                  <span>•</span>
                  <span>{plan.limite_documentos > 0 ? `${plan.limite_documentos} docs` : 'Ilimitado'}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 mb-4">
                {plan.beneficios.map((b, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-tight">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">ID: {plan.id}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => abrirModalEditar(plan)}
                  className="p-2 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-white transition-colors"
                  title="Editar Plan"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEliminar(plan.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
                  title="Eliminar Plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Crear / Editar Plan */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {editingPlan ? 'Editar Plan de Facturación' : 'Crear Nuevo Plan de Facturación'}
                  </h3>
                  <p className="text-xs text-slate-500">Configura precios, límites y características para el portal</p>
                </div>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardar} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre del Plan *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre || ''}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej. Bolsa 30 Comprobantes"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Código Único *</label>
                  <input
                    type="text"
                    required
                    value={formData.codigo || ''}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                    placeholder="BOLSA_30_DOCS"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Descripción Corta</label>
                <input
                  type="text"
                  value={formData.descripcion || ''}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción concisa para la tarjeta"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Precio (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.50"
                      required
                      value={formData.precio_usd || ''}
                      onChange={(e) => setFormData({ ...formData, precio_usd: parseFloat(e.target.value) })}
                      className="w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tipo de Plan</label>
                  <select
                    value={formData.tipo_plan || 'bolsa'}
                    onChange={(e) => setFormData({ ...formData, tipo_plan: e.target.value as any })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="bolsa">Bolsa Prepago (Docs)</option>
                    <option value="tiempo">Plan por Tiempo (Días)</option>
                    <option value="suscripcion">Suscripción Periódica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Límite Comprobantes</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.limite_documentos || 0}
                    onChange={(e) => setFormData({ ...formData, limite_documentos: parseInt(e.target.value) || 0 })}
                    placeholder="0 = ilimitado"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-slate-400">0 para ilimitados</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duración (Días)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.duracion_dias || 0}
                    onChange={(e) => setFormData({ ...formData, duracion_dias: parseInt(e.target.value) || 0 })}
                    placeholder="0 = sin caducidad"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-slate-400">0 para saldo prepago sin vencimiento</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Etiqueta Badge</label>
                  <input
                    type="text"
                    value={formData.badge || ''}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="Ej. Más Popular"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Beneficios */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Beneficios Incluidos</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={nuevoBeneficio}
                    onChange={(e) => setNuevoBeneficio(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarBeneficio(); } }}
                    placeholder="Escribe un beneficio y presiona Agregar"
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={agregarBeneficio}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                  >
                    Agregar
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {(formData.beneficios || []).map((b, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                      <span className="text-slate-800">{b}</span>
                      <button
                        type="button"
                        onClick={() => removerBeneficio(idx)}
                        className="text-rose-500 hover:text-rose-700 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.es_destacado || false}
                    onChange={(e) => setFormData({ ...formData, es_destacado: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span>Destacar como "Más Popular"</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.activo ?? true}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Plan Habilitado en Catálogo</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md"
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