'use client';
import React, { useState } from 'react';
import { ShieldCheck, XCircle, Crown, Search } from 'lucide-react';

export default function AdminTalento() {
  const [candidates, setCandidates] = useState([
    { id: '1', name: 'Ing. Ana Gómez', role: 'Ingeniera Civil', plan: 'VIP', status: 'pending' },
    { id: '2', name: 'Mstr. Juan Pérez', role: 'Maestro Mayor de Obra', plan: 'Basico', status: 'approved' },
    { id: '3', name: 'Arq. Luis Silva', role: 'Arquitecto', plan: 'Estandar', status: 'pending' }
  ]);

  const handleAction = (id: string, newStatus: string) => {
    setCandidates(candidates.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  return (
    <div className="p-8 font-sans text-slate-800 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Administración: SARA Talento</h1>
        <p className="text-slate-500">Aprueba profesionales y gestiona la visibilidad según los planes contratados.</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold">Solicitudes de Ingreso a la Red</h2>
          <div className="relative">
             <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
             <input type="text" placeholder="Buscar profesional..." className="pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500" />
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
              <th className="p-4 font-medium">Profesional</th>
              <th className="p-4 font-medium">Especialidad</th>
              <th className="p-4 font-medium">Plan (Comisión)</th>
              <th className="p-4 font-medium">Estado</th>
              <th className="p-4 font-medium text-right">Acciones Administrativas</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map(candidate => (
              <tr key={candidate.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold">{candidate.name}</td>
                <td className="p-4 text-slate-600">{candidate.role}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center w-max ${
                    candidate.plan === 'VIP' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    candidate.plan === 'Estandar' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {candidate.plan === 'VIP' && <Crown className="w-3 h-3 mr-1" />}
                    {candidate.plan} 
                    <span className="font-normal opacity-70 ml-1">
                      ({candidate.plan === 'VIP' ? '50%' : candidate.plan === 'Estandar' ? '20%' : '10%'})
                    </span>
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    candidate.status === 'approved' ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'
                  }`}>
                    {candidate.status === 'approved' ? 'Aprobado (Visible)' : 'En Revisión'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  {candidate.status === 'pending' && (
                    <button onClick={() => handleAction(candidate.id, 'approved')} className="text-emerald-600 hover:bg-emerald-50 px-3 py-1 rounded border border-emerald-200 text-sm font-medium transition-colors">
                       Aprobar Perfil
                    </button>
                  )}
                  {candidate.status === 'approved' && (
                    <button onClick={() => handleAction(candidate.id, 'pending')} className="text-amber-600 hover:bg-amber-50 px-3 py-1 rounded border border-amber-200 text-sm font-medium transition-colors">
                       Revocar Visibilidad
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
