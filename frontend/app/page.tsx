'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, Truck, Users, ShieldCheck, FileSpreadsheet } from 'lucide-react';

export default function LandingPage() {
  const modules = [
    {
      title: 'SARA Fintech & Escrow',
      description: 'Panel financiero de retenciones, anticipos y pago a proveedores.',
      icon: <ShieldCheck className="w-10 h-10 text-emerald-500 mb-4" />,
      href: '/dashboard/financiero',
      color: 'bg-emerald-50 border-emerald-100 hover:border-emerald-300'
    },
    {
      title: 'Red de Fletes (Tipo Uber)',
      description: 'Gestión logística y asignación de transporte pesado.',
      icon: <Truck className="w-10 h-10 text-blue-500 mb-4" />,
      href: '/dashboard/fletes',
      color: 'bg-blue-50 border-blue-100 hover:border-blue-300'
    },
    {
      title: 'SARA Talento',
      description: 'Job matching de ingenieros, arquitectos y maestros de obra.',
      icon: <Users className="w-10 h-10 text-amber-500 mb-4" />,
      href: '/dashboard/talento',
      color: 'bg-amber-50 border-amber-100 hover:border-amber-300'
    },
    {
      title: 'Gemelo Digital & Compras',
      description: 'Importador de cronogramas para predicción de stock.',
      icon: <FileSpreadsheet className="w-10 h-10 text-purple-500 mb-4" />,
      href: '/dashboard/importador',
      color: 'bg-purple-50 border-purple-100 hover:border-purple-300'
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-20 px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 flex justify-center items-center">
           <Building2 className="w-96 h-96" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">
            El Ecosistema Constructivo de <span className="text-blue-400">Grupo SARA</span>
          </h1>
          <p className="text-xl text-slate-300 mb-10">
            Orquestación inteligente para el mercado de la construcción en Ecuador. 
            Gestiona tus materiales, finanzas, talento y logística desde un solo lugar.
          </p>
        </div>
      </div>

      {/* Módulos (Menu Principal para Pruebas) */}
      <div className="max-w-6xl mx-auto py-16 px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Menú de Pruebas (Módulos Integrados)</h2>
          <p className="text-slate-500 mt-2">Selecciona un módulo para visualizar la interfaz desarrollada por los agentes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {modules.map((mod, idx) => (
            <Link key={idx} href={mod.href} className="block group">
              <div className={`p-8 rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer ${mod.color}`}>
                {mod.icon}
                <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-slate-900">{mod.title}</h3>
                <p className="text-slate-600">{mod.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
