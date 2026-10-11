'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Calculator, 
  ShoppingCart, 
  Home, 
  Hotel, 
  Truck, 
  Users, 
  Wallet, 
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  CreditCard
} from 'lucide-react';

interface EcosystemMatrixProps {
  onOpenCheckout: (item: { title: string; amount: number; badgeText: string; isSubscription?: boolean }) => void;
}

export default function EcosystemMatrix({ onOpenCheckout }: EcosystemMatrixProps) {
  const modules = [
    {
      id: 'constructora',
      title: 'SARA Constructora',
      tagline: 'Infraestructura & Obra Civil',
      desc: 'Planificación arquitectónica, diseño estructural y dirección técnica de obras residenciales, viales y comerciales en Ecuador.',
      icon: Building2,
      href: '/constructora',
      accentColor: 'from-amber-500 to-amber-700',
      badge: 'División Matriz',
      stats: 'Obras Llave en Mano',
      pricePreview: { title: 'Consulta Técnica de Obra', amount: 49.99, isSub: false }
    },
    {
      id: 'apu',
      title: 'SARA APU Inteligente',
      tagline: 'Presupuestos & Gemelo Digital',
      desc: 'Software de análisis de precios unitarios con lectura automática de rubros, bases de insumos actualizadas y reportes de obra.',
      icon: Calculator,
      href: '/dashboard',
      accentColor: 'from-purple-500 to-purple-700',
      badge: 'SaaS Constructor',
      stats: 'Cálculo al Instante',
      pricePreview: { title: 'Suscripción APU Constructor Pro', amount: 19.99, isSub: true }
    },
    {
      id: 'compras',
      title: 'SARA Compras B2B',
      tagline: 'Marketplace de Materiales',
      desc: 'Conexión directa entre proveedores de acero, cemento, agregados y acabados con precios mayoristas en vivo.',
      icon: ShoppingCart,
      href: '/modulos/compras',
      accentColor: 'from-cyan-500 to-cyan-700',
      badge: 'E-commerce Mayorista',
      stats: 'Precios en Vivo',
      pricePreview: { title: 'Membresía Proveedor Verificado', amount: 29.99, isSub: true }
    },
    {
      id: 'inmobiliaria',
      title: 'SARA Inmobiliaria',
      tagline: 'Propiedades & Terrenos',
      desc: 'Catálogo selecto de bienes raíces, casas campestres, departamentos urbanos y lotes de alta plusvalía.',
      icon: Home,
      href: '/inmobiliaria',
      accentColor: 'from-rose-500 to-rose-700',
      badge: 'Plusvalía Asegurada',
      stats: 'Venta & Renta',
      pricePreview: { title: 'Reserva de Propiedad Inmobiliaria', amount: 100.00, isSub: false }
    },
    {
      id: 'stays',
      title: 'SARA Stays (Hospedaje)',
      tagline: 'Suites & Villas Tipo Airbnb',
      desc: 'Alojamientos temporales de alta gama en Cuenca, Quito, Galápagos y Baños con cerradura inteligente y atención 24/7.',
      icon: Hotel,
      href: '/stays',
      accentColor: 'from-indigo-500 to-indigo-700',
      badge: 'Experiencia Superhost',
      stats: 'Check-in Autónomo',
      pricePreview: { title: 'Reserva Suite Cuenca Colonial', amount: 85.00, isSub: false }
    },
    {
      id: 'fletes',
      title: 'Red de Fletes SARA',
      tagline: 'Logística & Transporte Pesado',
      desc: 'Despacho tipo Uber de fletes con geolocalización satelital en tiempo real, validación de carga y conductores certificados.',
      icon: Truck,
      href: '/modulos/fletes',
      accentColor: 'from-blue-500 to-blue-700',
      badge: 'Radar Satelital 24/7',
      stats: 'Monitoreo en Ruta',
      pricePreview: { title: 'Recarga Prepago Conductor', amount: 20.00, isSub: false }
    },
    {
      id: 'talento',
      title: 'SARA Talento Pro',
      tagline: 'Bolsa de Empleo & Certificación',
      desc: 'Matching algorítmico entre constructoras y profesionales: ingenieros civiles, arquitectos, topógrafos y maestros mayores.',
      icon: Users,
      href: '/modulos/talento',
      accentColor: 'from-amber-500 to-emerald-600',
      badge: 'Red de Especialistas',
      stats: 'Perfiles Validados',
      pricePreview: { title: 'Certificación Profesional SARA', amount: 15.00, isSub: false }
    },
    {
      id: 'fintech',
      title: 'SARA Fintech & Escrow',
      tagline: 'Pagos Seguros & Custodia',
      desc: 'Retenciones, anticipos garantizados y pago contra avance de obra para eliminar riesgos contractuales entre partes.',
      icon: Wallet,
      href: '/modulos/financiero',
      accentColor: 'from-emerald-500 to-teal-700',
      badge: 'Pasarela Estándar',
      stats: 'Fondos Protegidos',
      pricePreview: { title: 'Apertura Cuenta Escrow', amount: 50.00, isSub: false }
    }
  ];

  return (
    <section id="ecosistema" className="py-24 bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Los 8 Módulos de Grupo SARA</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-white">
            Un Ecosistema Conectado en Tiempo Real
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Cada división opera de forma autónoma pero sincronizada con la misma base de datos empresarial y el mismo estándar bancario de cobro.
          </p>
        </div>

        {/* 8 Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div 
                key={m.id}
                className="group relative rounded-3xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                <div>
                  {/* Top line with Icon & Badge */}
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.accentColor} flex items-center justify-center text-white shadow-lg shadow-black/40`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300">
                      {m.badge}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-xl font-bold text-white mb-1 tracking-tight group-hover:text-amber-400 transition-colors">
                    {m.title}
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-500/90 mb-3">
                    {m.tagline}
                  </p>
                  
                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed mb-5">
                    {m.desc}
                  </p>
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {m.stats}
                    </span>
                    
                    <button
                      onClick={() => onOpenCheckout({
                        title: m.pricePreview.title,
                        amount: m.pricePreview.amount,
                        badgeText: m.title,
                        isSubscription: m.pricePreview.isSub
                      })}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-md transition-colors"
                      title="Probar cobro estándar para este servicio"
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>${m.pricePreview.amount}</span>
                    </button>
                  </div>

                  <Link
                    href={m.href}
                    className="w-full inline-flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-white transition-all group-hover:border-amber-500/40"
                  >
                    <span>Ingresar al Portal</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
