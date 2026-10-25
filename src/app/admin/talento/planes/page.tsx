'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Sparkles, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  RotateCcw, 
  Save, 
  Loader2, 
  TrendingUp, 
  Award, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Percent,
  Sliders,
  ShieldCheck,
  Briefcase,
  Layers,
  X
} from 'lucide-react';
import { 
  TalentoPlanesService, 
  TalentoPlan, 
  PLANES_TALENTO_DEFAULT 
} from '@/lib/services/talentoPlanesService';

interface ColocacionSimulada {
  id: string;
  candidato: string;
  puesto: string;
  empresa: string;
  salario: number;
  planId: string;
  planNombre: string;
  porcentaje: number;
  comisionSara: number;
  fechaInicio: string;
  estadoCobro: 'PENDIENTE_30_DIAS' | 'FACTURADO_SRI' | 'PAGADO';
}

const COLOCACIONES_DEMO: ColocacionSimulada[] = [
  {
    id: 'col-001',
    candidato: 'Ing. Ana Gómez',
    puesto: 'Residente de Obra Civil',
    empresa: 'Constructora SARA Proyectos Cía. Ltda.',
    salario: 1800,
    planId: 'vip',
    planNombre: 'Plan VIP Obra & Fábrica',
    porcentaje: 25,
    comisionSara: 450,
    fechaInicio: '15/10/2026',
    estadoCobro: 'PENDIENTE_30_DIAS'
  },
  {
    id: 'col-002',
    candidato: 'Arq. Ricardo Sánchez',
    puesto: 'Coordinador BIM & Planos',
    empresa: 'Consorcio Vial Andes',
    salario: 1600,
    planId: 'profesional',
    planNombre: 'Plan Profesional Pro',
    porcentaje: 15,
    comisionSara: 240,
    fechaInicio: '01/10/2026',
    estadoCobro: 'FACTURADO_SRI'
  },
  {
    id: 'col-003',
    candidato: 'Mstr. Juan Pérez',
    puesto: 'Maestro Mayor de Encofrados',
    empresa: 'Constructora del Valle',
    salario: 950,
    planId: 'basico',
    planNombre: 'Plan Básico Estándar',
    porcentaje: 10,
    comisionSara: 95,
    fechaInicio: '10/09/2026',
    estadoCobro: 'PAGADO'
  }
];

export default function AdminTalentoPlanesPage() {
  const [planes, setPlanes] = useState<TalentoPlan[]>(PLANES_TALENTO_DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Modal de Crear / Editar
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TalentoPlan | null>(null);
  const [formNombre, setFormNombre] = useState('');
  const [formPorcentaje, setFormPorcentaje] = useState(15);
  const [formTagline, setFormTagline] = useState('');
  const [formMultiplicador, setFormMultiplicador] = useState(2.5);
  const [formBeneficios, setFormBeneficios] = useState<string[]>(['']);
  const [formActivo, setFormActivo] = useState(true);
  const [formColor, setFormColor] = useState('blue');

  useEffect(() => {
    cargarPlanes();
  }, []);

  const cargarPlanes = async () => {
    setLoading(true);
    try {
      const locales = TalentoPlanesService.getPlanes();
      setPlanes(locales);

      const res = await fetch('/api/v1/talento/planes');
      if (res.ok) {
        const data = await res.json();
        if (data?.planes && Array.isArray(data.planes)) {
          setPlanes(data.planes);
          TalentoPlanesService.savePlanes(data.planes);
        }
      }
    } catch (e) {
      console.warn('Usando planes locales de fallback:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSincronizarSupabase = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/talento/planes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planes })
      });
      if (res.ok) {
        TalentoPlanesService.savePlanes(planes);
        setToastMsg({ tipo: 'success', texto: '¡Planes sincronizados y guardados en Supabase!' });
      } else {
        throw new Error('Error al guardar en el servidor');
      }
    } catch (err: any) {
      setToastMsg({ tipo: 'error', texto: err.message || 'Error de sincronización' });
    } finally {
      setSaving(false);
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  const handleRestablecerOficiales = () => {
    const oficiales = TalentoPlanesService.resetToDefault();
    setPlanes(oficiales);
    setToastMsg({ tipo: 'success', texto: 'Se han restablecido los 3 planes oficiales de Grupo SARA (VIP 25%, Profesional 15%, Básico 10%).' });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleAbrirCrear = () => {
    setEditingPlan(null);
    setFormNombre('');
    setFormPorcentaje(15);
    setFormTagline('');
    setFormMultiplicador(2.0);
    setFormBeneficios(['Posicionamiento en radar de obras', 'Notificaciones de vacantes']);
    setFormActivo(true);
    setFormColor('blue');
    setModalOpen(true);
  };

  const handleAbrirEditar = (p: TalentoPlan) => {
    setEditingPlan(p);
    setFormNombre(p.nombre);
    setFormPorcentaje(p.porcentajePrimerMes);
    setFormTagline(p.tagline);
    setFormMultiplicador(p.prioridadMultiplicador);
    setFormBeneficios([...p.beneficios]);
    setFormActivo(p.activo);
    setFormColor(p.badgeColor.includes('amber') ? 'amber' : p.badgeColor.includes('blue') ? 'blue' : 'slate');
    setModalOpen(true);
  };

  const handleGuardarModal = () => {
    if (!formNombre.trim()) {
      alert('Ingresa el nombre del plan');
      return;
    }

    const colorConfig = {
      amber: {
        badgeColor: 'bg-amber-500 text-slate-950 font-black',
        textColor: 'text-amber-400',
        borderColor: 'border-amber-500/50',
        ringColor: 'ring-amber-500'
      },
      blue: {
        badgeColor: 'bg-blue-600 text-white font-bold',
        textColor: 'text-blue-400',
        borderColor: 'border-blue-500/40',
        ringColor: 'ring-blue-500'
      },
      emerald: {
        badgeColor: 'bg-emerald-600 text-white font-bold',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/40',
        ringColor: 'ring-emerald-500'
      },
      slate: {
        badgeColor: 'bg-slate-700 text-slate-200 font-medium',
        textColor: 'text-slate-400',
        borderColor: 'border-slate-700',
        ringColor: 'ring-slate-500'
      }
    }[formColor] || {
      badgeColor: 'bg-indigo-600 text-white font-bold',
      textColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/40',
      ringColor: 'ring-indigo-500'
    };

    const filtradosBeneficios = formBeneficios.filter(b => b.trim().length > 0);

    if (editingPlan) {
      const actualizados = planes.map(p => {
        if (p.id === editingPlan.id) {
          return {
            ...p,
            nombre: formNombre,
            porcentajePrimerMes: formPorcentaje,
            tagline: formTagline,
            prioridadMultiplicador: formMultiplicador,
            beneficios: filtradosBeneficios,
            activo: formActivo,
            ...colorConfig
          };
        }
        return p;
      });
      setPlanes(actualizados);
      TalentoPlanesService.savePlanes(actualizados);
    } else {
      const nuevo = TalentoPlanesService.createPlan({
        nombre: formNombre,
        slug: formNombre.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        porcentajePrimerMes: formPorcentaje,
        costoInicial: 0,
        tagline: formTagline,
        prioridadMultiplicador: formMultiplicador,
        destacado: formPorcentaje >= 20,
        activo: formActivo,
        beneficios: filtradosBeneficios,
        ordenVisual: planes.length + 1,
        ...colorConfig
      });
      setPlanes([...planes, nuevo]);
    }

    setModalOpen(false);
    setToastMsg({ tipo: 'success', texto: '¡Plan guardado exitosamente!' });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleEliminarPlan = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este plan de colocación?')) {
      TalentoPlanesService.deletePlan(id);
      setPlanes(prev => prev.filter(p => p.id !== id));
      setToastMsg({ tipo: 'success', texto: 'Plan eliminado.' });
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  const totalCandidatos = planes.reduce((acc, p) => acc + (p.candidatosInscritos || 0), 0);
  const totalColocaciones = planes.reduce((acc, p) => acc + (p.colocacionesExitosas || 0), 0);
  const facturacionProyectada = COLOCACIONES_DEMO.reduce((acc, c) => acc + c.comisionSara, 0);

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in">
      
      {/* Toast Notificación */}
      {toastMsg && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-lg ${
          toastMsg.tipo === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
        }`}>
          <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold">
            {toastMsg.tipo === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
            <span>{toastMsg.texto}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-xs font-bold px-2 py-1">✕</button>
        </div>
      )}

      {/* Cabecera Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link 
              href="/admin/talento" 
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a SARA Talento</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Modelo Success-Fee
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span>Planes de Colocación Laboral</span>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {planes.length} Planes
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Configuración de los porcentajes del primer mes de sueldo (VIP 25%, Profesional 15%, Básico 10%) que los profesionales cancelan a GRUPO SARA solo contra empleo conseguido. Costo inicial $0.00.
          </p>
        </div>

        {/* Acciones de la Cabecera */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
          <button
            onClick={handleRestablecerOficiales}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center gap-1.5"
            title="Restablecer valores recomendados por Grupo SARA"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer</span>
          </button>
          
          <button
            onClick={handleAbrirCrear}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Plan</span>
          </button>

          <button
            onClick={handleSincronizarSupabase}
            disabled={saving}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar en Supabase</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas Globales (KPIs) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Planes Activos</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{planes.filter(p => p.activo).length}</h3>
            <span className="text-[10px] text-slate-400">En vitrina pública</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Candidatos en Red</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalCandidatos}</h3>
            <span className="text-[10px] text-emerald-600 font-bold">+18 este mes</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Colocaciones Éxito</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalColocaciones}</h3>
            <span className="text-[10px] text-slate-400">Trabajando en obra</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Honorarios 1er Mes</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">${facturacionProyectada.toFixed(2)}</h3>
            <span className="text-[10px] text-slate-400">Proyección activa SRI</span>
          </div>
        </div>
      </div>

      {/* Parrilla de Planes de Colocación (Tarjetas Interactivas) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Tarifas y Jerarquía de Colocación</span>
            </h2>
            <p className="text-xs text-slate-500">
              A mayor porcentaje, los agentes IA de SARA otorgan prioridad en búsquedas GPS, SERCOP y constructoras.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Modelo: Comisión única cobrada al finalizar el día 30 de trabajo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planes.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 bg-white dark:bg-slate-900 border-2 transition-all flex flex-col justify-between relative shadow-sm hover:shadow-xl ${
                plan.destacado
                  ? 'border-amber-500 shadow-amber-500/10'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {plan.destacado && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Recomendado Grupo SARA</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Cabecera del Plan */}
                <div className="flex items-start justify-between gap-2 pt-1">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                      {plan.nombre}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {plan.tagline}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 shadow-xs ${plan.badgeColor}`}>
                    {plan.slug.toUpperCase()}
                  </span>
                </div>

                {/* Porcentaje y Costo Inicial $0 */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                        {plan.porcentajePrimerMes}%
                      </span>
                      <span className="text-xs font-bold text-slate-500 ml-1.5">del primer mes</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      $0.00 Inicial
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-850">
                    <span>Prioridad Algorítmica:</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                      {plan.prioridadMultiplicador}x Exposición
                    </span>
                  </div>
                </div>

                {/* Métricas de Candidatos en este Plan */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-medium">Inscritos</span>
                    <span className="font-bold font-mono text-slate-800 dark:text-slate-200 text-sm">
                      {plan.candidatosInscritos || 0}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60">
                    <span className="text-[10px] text-slate-400 block font-medium">Colocados en Obra</span>
                    <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                      {plan.colocacionesExitosas || 0}
                    </span>
                  </div>
                </div>

                {/* Lista de Beneficios */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Beneficios del Plan:
                  </span>
                  <ul className="space-y-2">
                    {plan.beneficios.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 leading-snug">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleAbrirEditar(plan)}
                  className="flex-1 py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Tarifa</span>
                </button>

                {!['vip', 'profesional', 'basico'].includes(plan.id) && (
                  <button
                    onClick={() => handleEliminarPlan(plan.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                    title="Eliminar este plan personalizado"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de Colocaciones Recientes & Seguimiento SRI */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>Colocaciones Confirmadas & Facturación de Honorarios</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Trazabilidad de contratos en obra civil. El cobro del porcentaje se liquida a los 30 días de inicio.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            3 Registros Recientes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Candidato / Especialidad</th>
                <th className="px-6 py-3.5">Empresa Contratante</th>
                <th className="px-6 py-3.5">Plan Seleccionado</th>
                <th className="px-6 py-3.5">Sueldo Mensual</th>
                <th className="px-6 py-3.5">Comisión SARA</th>
                <th className="px-6 py-3.5">Fecha Inicio</th>
                <th className="px-6 py-3.5">Estado Cobro SRI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
              {COLOCACIONES_DEMO.map((col) => (
                <tr key={col.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                    <div>{col.candidato}</div>
                    <span className="text-[10px] text-slate-400 font-normal">{col.puesto}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {col.empresa}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      col.planId === 'vip' 
                        ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' 
                        : col.planId === 'profesional' 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                        : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {col.planNombre.split(' ')[1] || col.planNombre} ({col.porcentaje}%)
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                    ${col.salario.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 font-mono font-black text-emerald-600 dark:text-emerald-400">
                    ${col.comisionSara.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono">
                    {col.fechaInicio}
                  </td>
                  <td className="px-6 py-4">
                    {col.estadoCobro === 'PENDIENTE_30_DIAS' && (
                      <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        ⏳ En Curso (30 Días)
                      </span>
                    )}
                    {col.estadoCobro === 'FACTURADO_SRI' && (
                      <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        📄 Factura SRI Emitida
                      </span>
                    )}
                    {col.estadoCobro === 'PAGADO' && (
                      <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        ✓ Cobrado / Liquidado
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Crear o Editar Plan */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingPlan ? 'Editar Plan de Colocación' : 'Crear Nuevo Plan de Colocación'}
                </h3>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nombre del Plan:
                </label>
                <input
                  type="text"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  placeholder="Ej: Plan Cuadrillas VIP"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Porcentaje 1er Mes (%):
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={formPorcentaje}
                    onChange={(e) => setFormPorcentaje(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Del sueldo mensual ganado</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Prioridad Algorítmica:
                  </label>
                  <select
                    value={formMultiplicador}
                    onChange={(e) => setFormMultiplicador(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    <option value={1.0}>1.0x (Estándar)</option>
                    <option value={2.5}>2.5x (Alta)</option>
                    <option value={5.0}>5.0x (Máxima VIP)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tagline / Eslogan del Plan:
                </label>
                <input
                  type="text"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  placeholder="Ej: Acceso preferencial a obras civiles y SERCOP"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Color Distintivo del Badge:
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'amber', label: 'Dorado VIP', bg: 'bg-amber-500' },
                    { id: 'blue', label: 'Azul Pro', bg: 'bg-blue-600' },
                    { id: 'emerald', label: 'Verde Éxito', bg: 'bg-emerald-600' },
                    { id: 'slate', label: 'Gris Estándar', bg: 'bg-slate-700' }
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setFormColor(c.id)}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        formColor === c.id
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20 text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${c.bg}`} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Beneficios del Plan:
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {formBeneficios.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={b}
                        onChange={(e) => {
                          const copia = [...formBeneficios];
                          copia[idx] = e.target.value;
                          setFormBeneficios(copia);
                        }}
                        placeholder={`Beneficio #${idx + 1}`}
                        className="flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
                      />
                      {formBeneficios.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setFormBeneficios(formBeneficios.filter((_, i) => i !== idx))}
                          className="p-1.5 text-slate-400 hover:text-rose-500 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setFormBeneficios([...formBeneficios, ''])}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-2 hover:underline"
                >
                  + Agregar otro beneficio
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGuardarModal}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md"
              >
                Guardar Plan
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
