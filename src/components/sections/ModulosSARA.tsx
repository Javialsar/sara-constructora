import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, Users, FileSpreadsheet, Building, Home, HardHat } from 'lucide-react';

export default function ModulosSARA() {
  const modules = [
    {
      title: 'SARA Constructora',
      description: 'Gestión central de obras, presupuestos y control de proyectos.',
      icon: <HardHat className="w-10 h-10 text-brand-sage mb-4" />,
      href: '/portal',
      color: 'bg-brand-sage/10 border-brand-sage/20 hover:border-brand-sage/40'
    },
    {
      title: 'SARA APU & Compras',
      description: 'Gemelo digital, lectura de presupuestos y precios unitarios automáticos.',
      icon: <FileSpreadsheet className="w-10 h-10 text-purple-500 mb-4" />,
      href: '/dashboard',
      color: 'bg-purple-50 border-purple-100 hover:border-purple-300'
    },
    {
      title: 'SARA Inmobiliaria',
      description: 'Portal de compra, venta y arrendamiento de bienes raíces.',
      icon: <Building className="w-10 h-10 text-rose-500 mb-4" />,
      href: '/inmobiliaria',
      color: 'bg-rose-50 border-rose-100 hover:border-rose-300'
    },
    {
      title: 'SARA Stays (Alojamiento)',
      description: 'Gestión de alquiler vacacional y temporal tipo Airbnb.',
      icon: <Home className="w-10 h-10 text-indigo-500 mb-4" />,
      href: '/stays',
      color: 'bg-indigo-50 border-indigo-100 hover:border-indigo-300'
    },
    {
      title: 'Red de Fletes',
      description: 'Gestión logística y asignación de transporte pesado tipo Uber.',
      icon: <Truck className="w-10 h-10 text-blue-500 mb-4" />,
      href: '/modulos/fletes',
      color: 'bg-blue-50 border-blue-100 hover:border-blue-300'
    },
    {
      title: 'SARA Talento',
      description: 'Job matching de ingenieros, arquitectos y maestros de obra.',
      icon: <Users className="w-10 h-10 text-amber-500 mb-4" />,
      href: '/modulos/talento',
      color: 'bg-amber-50 border-amber-100 hover:border-amber-300'
    },
    {
      title: 'SARA Fintech & Escrow',
      description: 'Panel financiero de retenciones, anticipos y pago seguro a proveedores.',
      icon: <ShieldCheck className="w-10 h-10 text-emerald-500 mb-4" />,
      href: '/modulos/financiero',
      color: 'bg-emerald-50 border-emerald-100 hover:border-emerald-300'
    }
  ];

  return (
    <section className="max-w-6xl mx-auto py-16 px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900">Módulos del Ecosistema SARA</h2>
        <p className="text-slate-500 mt-2">Nuevos módulos integrados para la gestión constructiva en Ecuador.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((mod, idx) => (
          <Link key={idx} href={mod.href} className="block group">
            <div className={`p-6 rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer ${mod.color} h-full`}>
              {mod.icon}
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-slate-900">{mod.title}</h3>
              <p className="text-sm text-slate-600">{mod.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
