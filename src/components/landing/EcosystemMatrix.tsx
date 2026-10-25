'use client';

import React, { useState, useEffect } from 'react';
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
import { getLogosEmpresa, LogosEmpresa, DEFAULT_LOGOS_EMPRESA } from '@/lib/services/logosService';

interface EcosystemMatrixProps {
  onOpenCheckout: (item: { title: string; amount: number; badgeText: string; isSubscription?: boolean }) => void;
  onOpenQuoteModal?: (moduleData: { id: string; title: string; logoUrl?: string }) => void;
  initialLogos?: LogosEmpresa;
}

export default function EcosystemMatrix({ onOpenCheckout, onOpenQuoteModal, initialLogos }: EcosystemMatrixProps) {
  const [logos, setLogos] = useState<LogosEmpresa>(initialLogos || DEFAULT_LOGOS_EMPRESA);

  useEffect(() => {
    getLogosEmpresa().then((fetched) => {
      if (fetched) setLogos(fetched);
    });
  }, []);

  const modules = [
    {
      id: 'constructora',
      title: 'SARA-CONSTRUCTORA',
      tagline: 'Infraestructura & Obra Civil',
      desc: 'Planificación arquitectónica, diseño estructural y dirección técnica de obras residenciales, viales y comerciales en Ecuador.',
      logoUrl: logos.constructora,
      iconFallback: Building2,
      href: '/constructora',
      accentColor: 'from-amber-500 to-amber-700',
      badge: 'División Matriz',
      stats: 'Obras Llave en Mano',
      pricePreview: { title: 'Consulta Técnica de Obra', amount: 49.99, isSub: false }
    },
    {
      id: 'apu',
      title: 'SARA-APU',
      tagline: 'Presupuestos & Gemelo Digital',
      desc: 'Software de análisis de precios unitarios con lectura automática de rubros, bases de insumos actualizadas y reportes de obra.',
      logoUrl: logos.apu,
      iconFallback: Calculator,
      href: '/dashboard',
      accentColor: 'from-purple-500 to-purple-700',
      badge: 'SaaS Constructor',
      stats: 'Cálculo al Instante',
      pricePreview: { title: 'Suscripción APU Constructor Pro', amount: 19.99, isSub: true }
    },
    {
      id: 'marketplace',
      title: 'SARA-MARKETPLACE',
      tagline: 'Marketplace de Materiales',
      desc: 'Conexión directa entre proveedores de acero, cemento, agregados y acabados con precios mayoristas en vivo.',
      logoUrl: logos.compras,
      iconFallback: ShoppingCart,
      href: '/modulos/compras',
      accentColor: 'from-cyan-500 to-cyan-700',
      badge: 'E-commerce Mayorista',
      stats: 'Precios en Vivo',
      pricePreview: { title: 'Membresía Proveedor Verificado', amount: 29.99, isSub: true }
    },
    {
      id: 'inmobiliaria',
      title: 'SARA-INMOBILIARIA',
      tagline: 'Propiedades & Terrenos',
      desc: 'Catálogo selecto de bienes raíces, casas campestres, departamentos urbanos y lotes de alta plusvalía.',
      logoUrl: logos.inmobiliaria,
      iconFallback: Home,
      href: '/inmobiliaria',
      accentColor: 'from-rose-500 to-rose-700',
      badge: 'Plusvalía Asegurada',
      stats: 'Venta & Renta',
      pricePreview: { title: 'Reserva de Propiedad Inmobiliaria', amount: 100.00, isSub: false }
    },
    {
      id: 'alojamiento',
      title: 'SARA-ALOJAMIENTO',
      tagline: 'Suites & Villas Tipo Airbnb',
      desc: 'Alojamientos temporales de alta gama en Cuenca, Quito, Galápagos y Baños con cerradura inteligente y atención 24/7.',
      logoUrl: logos.stays,
      iconFallback: Hotel,
      href: '/stays',
      accentColor: 'from-indigo-500 to-indigo-700',
      badge: 'Experiencia Superhost',
      stats: 'Check-in Autónomo',
      pricePreview: { title: 'Reserva Suite Cuenca Colonial', amount: 85.00, isSub: false }
    },
    {
      id: 'fletes',
      title: 'SARA-FLETES',
      tagline: 'Fletes & Renta Vehicular Abierta',
      desc: 'Plataforma para todo público: fletes locales, mudanzas, transporte pesado y alquiler de camionetas/camiones por horas o días (tipo Uber, inDrive y DiDi).',
      logoUrl: logos.fletes,
      iconFallback: Truck,
      href: '/modulos/fletes',
      accentColor: 'from-amber-500 to-amber-700',
      badge: 'Abierto a Todo Público',
      stats: 'Carga & Renta 24/7',
      pricePreview: { title: 'Flete Local Inmediato', amount: 3.00, isSub: false }
    },
    {
      id: 'talento',
      title: 'SARA-TALENTO',
      tagline: 'Bolsa de Empleo & Certificación',
      desc: 'Matching algorítmico entre constructoras y profesionales: ingenieros civiles, arquitectos, topógrafos y maestros mayores.',
      logoUrl: logos.talento,
      iconFallback: Users,
      href: '/modulos/talento',
      accentColor: 'from-amber-500 to-emerald-600',
      badge: 'Red de Especialistas',
      stats: 'Perfiles Validados',
      pricePreview: { title: 'Certificación Profesional SARA', amount: 15.00, isSub: false }
    },
    {
      id: 'pagos',
      title: 'SARA-PAGOS',
      tagline: 'Pagos Seguros & Custodia',
      desc: 'Retenciones, anticipos garantizados y pago contra avance de obra con pasarela estándar, QR empresarial y cuentas bancarias.',
      logoUrl: logos.fintech,
      iconFallback: Wallet,
      href: '/modulos/financiero',
      accentColor: 'from-emerald-500 to-teal-700',
      badge: 'Pasarela Estándar',
      stats: 'Fondos Protegidos',
      pricePreview: { title: 'Apertura Cuenta Escrow', amount: 50.00, isSub: false }
    }
  ];

  return (
    <section id="ecosistema" className="py-24 md:py-32 bg-slate-900/95 text-white relative overflow-hidden">
      {/* Luz ambiental sutil */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-500/[0.03] blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Los 8 Servicios de Grupo SARA</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Ecosistema de Módulos SARA
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Plataformas y servicios integrados con sincronización directa en tiempo real y arquitectura de clase mundial.
          </p>
        </div>

        {/* 8 Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
          {modules.map((m) => {
            const Icon = m.iconFallback;
            return (
              <div 
                key={m.id}
                className="group relative rounded-3xl bg-slate-950/80 backdrop-blur-xl border border-white/[0.08] hover:border-amber-400/40 ring-1 ring-black/[0.05] p-6 md:p-7 flex flex-col justify-between transition-all duration-300 ease-out hover:shadow-2xl hover:shadow-black/60 hover:-translate-y-1.5"
              >
                <div>
                  {/* Top line with Official Logo & Badge */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-20 h-20 rounded-2xl bg-slate-900/90 p-2.5 flex items-center justify-center shadow-lg border border-white/[0.08] group-hover:scale-105 group-hover:border-amber-400/40 transition-all duration-300 ease-out">
                      {m.logoUrl ? (
                        <img 
                          src={m.logoUrl} 
                          alt={m.title} 
                          className="max-w-full max-h-full object-contain filter drop-shadow-md"
                          onError={(e) => {
                            (e.target as any).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Icon className="w-9 h-9 text-slate-300" />
                      )}
                    </div>
                    <span className="text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-300 uppercase">
                      {m.badge}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="font-display text-lg font-extrabold text-white mb-1 tracking-tight group-hover:text-amber-400 transition-colors duration-200 uppercase">
                    {m.title}
                  </h3>
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400/90 mb-3">
                    {m.tagline}
                  </p>
                  
                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed mb-6 font-normal">
                    {m.desc}
                  </p>
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-4 border-t border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{m.stats}</span>
                    </span>
                    
                    <button
                      onClick={() => {
                        if (onOpenQuoteModal) {
                          onOpenQuoteModal({
                            id: m.id,
                            title: m.title,
                            logoUrl: m.logoUrl
                          });
                        } else {
                          onOpenCheckout({
                            title: m.pricePreview.title,
                            amount: m.pricePreview.amount,
                            badgeText: m.title,
                            isSubscription: m.pricePreview.isSub
                          });
                        }
                      }}
                      className="min-h-[36px] inline-flex items-center gap-1.5 text-[11px] font-mono font-bold tabular-nums text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-1.5 rounded-xl transition-all duration-200 ease-out active:scale-[0.97]"
                      title={`Ver planes y cotización de ${m.title}`}
                    >
                      <CreditCard className="w-3.5 h-3.5 shrink-0" />
                      <span>{m.id === 'talento' ? 'Planes $0 Inicial' : 'Ver Planes'}</span>
                    </button>
                  </div>

                  <Link
                    href={m.href}
                    className="w-full min-h-[44px] inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-white transition-all duration-200 ease-out group-hover:border-amber-400/40 active:scale-[0.98]"
                  >
                    <span>Ingresar al Portal</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 ease-out" />
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
