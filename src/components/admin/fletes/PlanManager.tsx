import React, { useState, useEffect } from 'react';
import { Settings, Shield, Zap, CheckCircle, Save, Star, Plus, Trash2, Check } from 'lucide-react';
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
      ...getIconAndColor(p.id)
    })));

    const unsub = SaraFletesRealtimeService.subscribe((evt) => {
      if (evt.type === 'PLANES_ACTUALIZADOS') {
        setPlans(evt.payload.map(p => ({
          ...p,
          ...getIconAndColor(p.id)
        })));
      }
    });

    return () => unsub();
  }, []);

  const handlePriceChange = (id: string, value: string) => {
    setPlans(plans.map(p => p.id === id ? { ...p, monthlyPrice: parseFloat(value) || 0 } : p));
  };

  const handleCommissionChange = (id: string, value: string) => {
    setPlans(plans.map(p => p.id === id ? { ...p, commissionRate: parseFloat(value) || 0 } : p));
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
      monthlyPrice: p.monthlyPrice,
      commissionRate: p.commissionRate,
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
            Gestión de Planes de Fletes
          </h1>
          <p className="text-gray-600 mt-2">
            Configura los precios mensuales y las comisiones por viaje para cada plan de suscripción. Totalmente sincronizado con la Cabina de Transportista en tiempo real.
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                {plan.icon}
              </div>

              <div className="space-y-5 mt-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Costo Mensual ($ USD)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={plan.monthlyPrice}
                      onChange={(e) => handlePriceChange(plan.id, e.target.value)}
                      className="pl-7 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border p-2.5 font-bold font-mono text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Comisión por Flete (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={plan.commissionRate}
                      onChange={(e) => handleCommissionChange(plan.id, e.target.value)}
                      className="pr-7 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm border p-2.5 font-bold font-mono text-gray-900"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 border-t border-gray-100 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Beneficios Incluidos
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleAddBenefit(plan.id)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar
                  </button>
                </div>

                <ul className="space-y-2.5">
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

              <div className="mt-5 pt-3 border-t border-gray-200/80 text-[11px] text-gray-500 flex items-center justify-between">
                <span>Estado: <strong className="text-emerald-600 font-bold">Activo en SARA Fletes</strong></span>
                <span className="font-mono text-[10px] bg-gray-200 px-1.5 py-0.5 rounded">ID: {plan.id}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
