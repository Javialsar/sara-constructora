import React, { useState } from 'react';
import { Settings, Shield, Zap, CheckCircle, Save, Star } from 'lucide-react';

interface PlanConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  monthlyPrice: number;
  commissionRate: number;
  color: string;
  benefits: string[];
}

export default function PlanManager() {
  const [plans, setPlans] = useState<PlanConfig[]>([
    {
      id: 'vip',
      name: 'Plan VIP',
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      monthlyPrice: 29.99,
      commissionRate: 5,
      color: 'border-yellow-500',
      benefits: ['Soporte 24/7 prioritario', 'Rutas ilimitadas', 'Sin límites de vehículos']
    },
    {
      id: 'standard',
      name: 'Plan Estándar',
      icon: <Shield className="w-6 h-6 text-blue-500" />,
      monthlyPrice: 15.00,
      commissionRate: 10,
      color: 'border-blue-500',
      benefits: ['Soporte horario hábil', 'Hasta 50 rutas/mes', 'Hasta 10 vehículos']
    },
    {
      id: 'basic',
      name: 'Plan Básico',
      icon: <Zap className="w-6 h-6 text-gray-500" />,
      monthlyPrice: 0.00,
      commissionRate: 20,
      color: 'border-gray-300',
      benefits: ['Soporte comunitario', 'Hasta 10 rutas/mes', 'Hasta 2 vehículos']
    }
  ]);

  const handlePriceChange = (id: string, value: string) => {
    setPlans(plans.map(p => p.id === id ? { ...p, monthlyPrice: parseFloat(value) || 0 } : p));
  };

  const handleCommissionChange = (id: string, value: string) => {
    setPlans(plans.map(p => p.id === id ? { ...p, commissionRate: parseFloat(value) || 0 } : p));
  };

  const handleSave = () => {
    console.log('Guardando configuraciones:', plans);
    alert('Configuraciones guardadas exitosamente!');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-8 h-8 text-indigo-600" />
            Gestión de Planes de Fletes
          </h1>
          <p className="text-gray-600 mt-2">
            Configura los precios mensuales y las comisiones por viaje para cada plan de suscripción.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Save className="w-5 h-5" />
          Guardar Configuraciones
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl shadow-md overflow-hidden border-t-4 ${plan.color} hover:shadow-lg transition-shadow`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                {plan.icon}
              </div>

              <div className="space-y-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Costo Mensual ($)
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
                      className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="pr-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2.5"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Beneficios Incluidos
              </h4>
              <ul className="space-y-3">
                {plan.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}