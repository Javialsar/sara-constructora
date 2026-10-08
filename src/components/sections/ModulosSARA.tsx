import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, Users, FileSpreadsheet, Building, Home, HardHat } from 'lucide-react';

export default function ModulosSARA() {
  const modules = [
    {
      title: 'SARA Constructora',
      description: 'Gestión central de obras, presupuestos y control de proyectos.',
      icon: <HardHat className="w-10 h-10 text-brand-sage" />,
      href: '/constructora',
      color: 'bg-brand-sage/10 border-brand-sage/20 hover:border-brand-sage/40'
    },
    {
      title: 'SARA APU',
      description: 'Gemelo digital y lectura automática de presupuestos en Excel/CSV.',
      icon: <FileSpreadsheet className="w-10 h-10 text-purple-600" />,
      href: '/dashboard',
      color: 'bg-purple-50 border-purple-100 hover:border-purple-300'
    },
    {
      title: 'SARA Compras (Marketplace)',
      description: 'E-commerce B2B de materiales de construcción con precios en vivo.',
      icon: <Truck className="w-10 h-10 text-cyan-600" />,
      href: '/modulos/compras',
      color: 'bg-cyan-50 border-cyan-100 hover:border-cyan-300'
    },
    {
      title: 'SARA Inmobiliaria',
      description: 'Portal de compra, venta y arrendamiento de bienes raíces.',
      icon: <Building className="w-10 h-10 text-rose-600" />,
      href: '/inmobiliaria',
      color: 'bg-rose-50 border-rose-100 hover:border-rose-300'
    },
    {
      title: 'SARA Stays (Alojamiento)',
      description: 'Gestión de alquiler vacacional y temporal tipo Airbnb.',
      icon: <Home className="w-10 h-10 text-indigo-600" />,
      href: '/stays',
      color: 'bg-indigo-50 border-indigo-100 hover:border-indigo-300'
    },
    {
      title: 'Red de Fletes',
      description: 'Gestión logística y asignación de transporte pesado tipo Uber.',
      icon: <Truck className="w-10 h-10 text-blue-600" />,
      href: '/modulos/fletes',
      color: 'bg-blue-50 border-blue-100 hover:border-blue-300'
    },
    {
      title: 'SARA Talento',
      description: 'Job matching de ingenieros, arquitectos y maestros de obra.',
      icon: <Users className="w-10 h-10 text-amber-600" />,
      href: '/modulos/talento',
      color: 'bg-amber-50 border-amber-100 hover:border-amber-300'
    },
    {
      title: 'SARA Fintech & Escrow',
      description: 'Panel financiero de retenciones, anticipos y pago seguro a proveedores.',
      icon: <ShieldCheck className="w-10 h-10 text-emerald-600" />,
      href: '/modulos/financiero',
      color: 'bg-emerald-50 border-emerald-100 hover:border-emerald-300'
    }
  ];

  return (
    <section className="max-w-7xl mx-auto py-20 px-6 sm:px-8 lg:px-12">
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full bg-brand-sage/10 text-brand-sage font-bold text-sm tracking-widest uppercase mb-4">
          Ecosistema
        </span>
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Módulos SARA</h2>
        <p className="text-slate-500 mt-4 text-lg max-w-2xl mx-auto">Nuevos módulos integrados para la gestión constructiva en Ecuador, diseñados para optimizar cada fase de tu proyecto.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {modules.map((mod, idx) => (
          <Link key={idx} href={mod.href} className="block group h-full">
            <div className={`p-8 rounded-3xl border-2 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-white ${mod.color.replace('bg-', 'hover:bg-').replace('border-', 'border-slate-100 hover:border-')} h-full flex flex-col items-start`}>
              <div className={`p-4 rounded-2xl mb-6 ${mod.color.split(' ')[0]} transition-transform duration-300 group-hover:scale-110`}>
                {mod.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{mod.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{mod.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
