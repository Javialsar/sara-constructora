'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Activity, 
  Truck, 
  Home, 
  HardHat, 
  CreditCard,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface HeroUltraProps {
  onOpenCheckout: (item: { title: string; amount: number; badgeText: string; isSubscription?: boolean }) => void;
  projectCount: number;
}

export default function HeroUltra({ onOpenCheckout, projectCount }: HeroUltraProps) {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white pt-24 pb-20 md:pt-32 md:pb-28 border-b border-slate-800">
      {/* Background Gradients & Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-amber-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-sage/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Top Live Badge */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-300 shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="h-2 w-2 rounded-full bg-emerald-400 -ml-4" />
            <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">Ecosistema SARA 2026</span>
            <span className="text-slate-600">|</span>
            <span>Sincronización en Tiempo Real</span>
          </div>
          
          <button
            onClick={() => onOpenCheckout({
              title: "Suscripción Plan Constructor Pro",
              amount: 19.99,
              badgeText: "SARA APU & Ecosistema",
              isSubscription: true
            })}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pasarela Estándar Activa (Kushki, Tarjeta, QR & Transferencias)</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-6">
            Ingeniería de Vanguardia y{' '}
            <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Tecnología Integral
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            El holding líder en construcción, presupuesto inteligente, logística pesada, bienes raíces y hospedaje corporativo en el Ecuador.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a
            href="#ecosistema"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Explorar los 8 Módulos</span>
            <ArrowRight className="w-5 h-5" />
          </a>

          <button
            onClick={() => onOpenCheckout({
              title: "Anticipo de Consultoría Técnica de Obra",
              amount: 49.99,
              badgeText: "SARA Constructora Oficial",
              isSubscription: false
            })}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base border border-slate-700/80 shadow-lg transition-all hover:border-slate-600"
          >
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <span>Probar Pasarela de Pago Estándar</span>
          </button>

          <Link
            href="/constructora"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-slate-400 hover:text-white font-semibold text-sm transition-colors"
          >
            <span>Ver Obras Civiles</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Real-time KPI Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-2xl">
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{projectCount > 0 ? `${projectCount}+` : '5+'}</div>
              <div className="text-xs text-slate-400 font-medium">Proyectos Activos en BD</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">6+ Ciudades</div>
              <div className="text-xs text-slate-400 font-medium">Inmobiliaria & Stays</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">GPS 24/7</div>
              <div className="text-xs text-slate-400 font-medium">Red Fletes Conectada</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">100% Blindado</div>
              <div className="text-xs text-slate-400 font-medium">Kushki, Tarjetas & QR</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
