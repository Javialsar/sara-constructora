import React, { useState, useEffect } from 'react';
import { Settings, Shield, Zap, CheckCircle, Save, Star, Plus, Trash2, Check, Clock, BellRing, Sparkles } from 'lucide-react';
import { saveFletesPlanes } from '@/lib/fletes-data';
import { SaraFletesRealtimeService, PlanConfigItem } from '@/lib/services/saraFletesRealtimeService';

interface PlanConfigUI extends PlanConfigItem {
  icon: React.ReactNode;
  color: string;
}

export default function PlanManager() {
  const [plans, setPlans] = useState<PlanConfigUI[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const getIconAndColor = (id: string) => {
    if (id === 'vip') return { icon: <Star className="w-6 h-6 text-amber-500 fill-amber-500" />, color: 'border-amber-500' };
    if (id === 'standard') return { icon: <Shield className="w-6 h-6 text-blue-500" />, color: 'border-blue-500' };
    return { icon: <Zap className="w-6 h-6 text-slate-500" />, color: 'border-slate-300' };
  };

  useEffect(() => {
    const loaded = SaraFletesRealtimeService.getPlanesConfig();
    setPlans(loaded.map(p => ({
      ...p,
      monthlyPrice: 0.00, // Modelo 100% por comisión sin costo mensual
      ...getIconAndColor(p.id)
    })));

    const unsub = SaraFletesRealtimeService.subscribe((evt) => {
      if (evt.type === 'PLANES_ACTUALIZADOS') {
        setPlans(evt.payload.map(p => ({
          ...p,
          monthlyPrice: 0.00,
          ...getIconAndColor(p.id)
        })));
      }
    });

    return () => unsub();
  }, []);

  const handleCommissionChange = (id: string, value: string) => {
    setPlans(plans.map(p => p.id === id ? { ...p, commissionRate: parseFloat(value) || 0 } : p));
  };

  const handlePriorityChange = (id: string, priority: 'ALTA' | 'MEDIA' | 'BAJA') => {
    const delay = priority === 'ALTA' ? 0 : priority === 'MEDIA' ? 4 : 8;
    setPlans(plans.map(p => p.id === id ? { ...p, priority, dispatchDelaySeconds: delay } : p));
  };

  const handleBenefitChange = (planId: string, index: number, value: string) => {
    setPlans(plans.map(p => {
      if (p.id === planId) {
        const nextBenefits = [...p.benefits];
        nextBenefits[index] = value;
        return { ...p, benefits: nextBenefits };
      }
      return p;
    }));
  };

  const handleAddBenefit = (planId: string) => {
    setPlans(plans.map(p => {
      if (p.id === planId) {
        return { ...p, benefits: [...p.benefits, 'Nuevo beneficio de fletes'] };
      }
      return p;
    }));
  };

  const handleRemoveBenefit = (planId: string, index: number) => {
    setPlans(plans.map(p => {
      if (p.id === planId) {
        return { ...p, benefits: p.benefits.filter((_, i) => i !== index) };
      }
      return p;
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const cleanPlans: PlanConfigItem[] = plans.map(p => ({
      id: p.id,
      name: p.name,
      monthlyPrice: 0.00, // Modelo sin costo mensual
      commissionRate: p.commissionRate,
      priority: p.priority || (p.id === 'vip' ? 'ALTA' : p.id === 'standard' ? 'MEDIA' : 'BAJA'),
      dispatchDelaySeconds: p.dispatchDelaySeconds !== undefined ? p.dispatchDelaySeconds : (p.id === 'vip' ? 0 : p.id === 'standard' ? 4 : 8),
      benefits: p.benefits
    }));

    await saveFletesPlanes(cleanPlans);
    setIsSaving(false);
    setToastMessage('¡Configuraciones guardadas y sincronizadas en tiempo real con SARA Fletes!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in border border-emerald-400">
          <Check className="w-5 h-5 text-white" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-8 h-8 text-indigo-600" />
            Gestión de Planes de Fletes (Modelo por Comisión)
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            Configuración 100% basada en porcentaje de comisión por viaje ganado y jerarquía de notificación en radar (Alta, Media, Baja). Todos los planes cuentan con rutas ilimitadas y atención 24/7 sin costos fijos mensuales.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Guardando...' : 'Guardar Configuraciones'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl shadow-md overflow-hidden border-t-4 ${plan.color} hover:shadow-lg transition-shadow flex flex-col justify-between`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                {plan.icon}
              </div>

              {/* Modalidad de Cobro: 100% Comisión (Sin costo mensual) */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4">
                <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block">
                  Modalidad de Cobro
                </span>
                <p className="font-black text-emerald-700 text-sm mt-0.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  100% Prepago por Carrera Ganada
                </p>
                <p className="text-[11px] text-emerald-600 mt-0.5">
                  Costo mensual: <strong>$0.00 USD / mes (Gratis)</strong>
                </p>
              </div>

              <div className="space-y-4">
                {/* 1. Comisión por Flete */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Comisión por Flete Ganado (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      step="0.5"
                      value={plan.commissionRate}
                      onChange={(e) => handleCommissionChange(plan.id, e.target.value)}
                      className="pr-7 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base border p-2.5 font-black font-mono text-gray-900"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-bold sm:text-sm">%</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Ej: Si la carrera es de $10.00, se debitan ${(10 * plan.commissionRate / 100).toFixed(2)} de su recarga al aceptar.
                  </p>
                </div>

                {/* 2. Jerarquía de Notificación en Radar */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Nivel de Jerarquía de Notificación
                  </label>
                  <select
                    value={plan.priority || (plan.id === 'vip' ? 'ALTA' : plan.id === 'standard' ? 'MEDIA' : 'BAJA')}
                    onChange={(e) => handlePriorityChange(plan.id, e.target.value as any)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs font-bold border p-2 text-gray-900 bg-white"
                  >
                    <option value="ALTA">Prioridad Alta (Despacho Inmediato Nivel 1: 0s a 4s)</option>
                    <option value="MEDIA">Prioridad Media (Despacho Nivel 2 tras 4s)</option>
                    <option value="BAJA">Prioridad Baja (Despacho Nivel 3 tras 8s)</option>
                  </select>
                  <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>
                      Retardo de despacho en radar: <strong>{plan.dispatchDelaySeconds || (plan.id === 'vip' ? 0 : plan.id === 'standard' ? 4 : 8)} segundos</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 border-t border-gray-100 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Beneficios del Plan
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleAddBenefit(plan.id)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar
                  </button>
                </div>

                <ul className="space-y-2">
                  {plan.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => handleBenefitChange(plan.id, idx, e.target.value)}
                        className="flex-1 text-xs text-gray-700 bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-400"
                      />
                      {plan.benefits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBenefit(plan.id, idx)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
                          title="Eliminar beneficio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-200 text-[11px] text-gray-500 flex items-center justify-between">
                <span className="flex items-center gap-1 font-semibold text-emerald-700">
                  <BellRing className="w-3.5 h-3.5" />
                  Jerarquía: <strong>{plan.priority || (plan.id === 'vip' ? 'ALTA' : plan.id === 'standard' ? 'MEDIA' : 'BAJA')}</strong>
                </span>
                <span className="font-mono text-[10px] bg-gray-200 px-1.5 py-0.5 rounded font-bold">
                  {plan.commissionRate}% Comisión
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
