'use client';

// Simulación rápida para renderizar TalentMatching si el agente previo lo dejó en componentes
// En un flujo real importaría desde '../../../components/TalentMatching'
import React from 'react';
import { UserCheck, Award, MapPin } from 'lucide-react';

export default function TalentoPage() {
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">SARA Talento - Búsqueda de Personal</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-slate-200 rounded-full mb-4 flex items-center justify-center">
             <UserCheck className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold">Ing. Carlos Mendoza</h2>
          <p className="text-blue-600 font-medium mb-4">Arquitecto Estructural</p>
          
          <div className="flex items-center text-slate-500 mb-2">
            <MapPin className="w-4 h-4 mr-2" /> Quito, Ecuador
          </div>
          <div className="flex items-center text-slate-500 mb-6">
            <Award className="w-4 h-4 mr-2" /> 8 años de experiencia
          </div>
          
          <button className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700">
            Contratar ($15/hr)
          </button>
        </div>
      </div>
    </div>
  );
}
