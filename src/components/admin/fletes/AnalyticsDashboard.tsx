import React from 'react';
import { TrendingUp, Users, Wallet, Activity, Truck } from 'lucide-react';

export default function AnalyticsDashboard() {
  return (
    <div className="bg-slate-900 text-white min-h-screen p-6 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-emerald-400">Dashboard Analítico</h1>
        <p className="text-slate-400 mt-2">Resumen de métricas de la plataforma SARA</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Ganancias Comisiones</p>
            <p className="text-2xl font-bold">$45,231.00</p>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex items-center space-x-4">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-lg">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Recargas Billeteras</p>
            <p className="text-2xl font-bold">$128,450.00</p>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex items-center space-x-4">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Conductores Activos</p>
            <p className="text-2xl font-bold">1,245</p>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex items-center space-x-4">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-lg">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Fletes Completados</p>
            <p className="text-2xl font-bold">8,932</p>
          </div>
        </div>
      </div>

      {/* Income Chart (Simulated) */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center">
            <Activity className="mr-2 text-emerald-400" size={20} />
            Ingresos - Últimos 7 Días
          </h2>
        </div>
        
        <div className="h-64 flex items-end justify-between gap-2">
          {[
            { day: 'Lun', height: '40%', value: '$1.2k' },
            { day: 'Mar', height: '65%', value: '$1.9k' },
            { day: 'Mié', height: '50%', value: '$1.5k' },
            { day: 'Jue', height: '85%', value: '$2.5k' },
            { day: 'Vie', height: '90%', value: '$2.7k' },
            { day: 'Sáb', height: '45%', value: '$1.3k' },
            { day: 'Dom', height: '30%', value: '$0.9k' },
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1 group">
              <span className="text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                {item.value}
              </span>
              <div 
                className="w-full max-w-[40px] bg-emerald-500/60 hover:bg-emerald-400 rounded-t-md transition-all duration-300 relative"
                style={{ height: item.height }}
              >
              </div>
              <span className="text-sm text-slate-400 mt-2">{item.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
