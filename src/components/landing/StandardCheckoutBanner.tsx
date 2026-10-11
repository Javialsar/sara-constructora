'use client';

import React from 'react';
import { 
  CreditCard, 
  QrCode, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  Lock,
  Smartphone
} from 'lucide-react';

interface StandardCheckoutBannerProps {
  onOpenCheckout: (item: { title: string; amount: number; badgeText: string; isSubscription?: boolean }) => void;
}

export default function StandardCheckoutBanner({ onOpenCheckout }: StandardCheckoutBannerProps) {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative">
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Left Column: Description & Value Proposition */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
                <ShieldCheck className="w-4 h-4" />
                <span>Estándar Universal de Cobros SARA</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-6 leading-tight">
                Transparencia Total:{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400">
                  Desglose a la Izquierda, Métodos a la Derecha
                </span>
              </h2>

              <p className="text-slate-300 text-base leading-relaxed mb-8">
                Diseñado bajo el estándar de pasarelas internacionales de última generación. Cada cobro en Grupo SARA ofrece desglose detallado de ítems, cupones, tarjetas de crédito/débito tokenizadas, cobro rápido por <strong>código QR empresarial (DeUna/Pichincha)</strong> y <strong>transferencias bancarias directas</strong> con validación de comprobante.
              </p>

              {/* 3 Pill highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <CreditCard className="w-6 h-6 text-indigo-400 mb-2" />
                  <div className="font-bold text-sm text-white">Tarjetas Globales</div>
                  <div className="text-xs text-slate-400 mt-1">Visa, Mastercard, Amex con token seguro.</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <QrCode className="w-6 h-6 text-amber-400 mb-2" />
                  <div className="font-bold text-sm text-white">QR Empresarial</div>
                  <div className="text-xs text-slate-400 mt-1">Pago directo vía DeUna & Billetera SARA.</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <Building2 className="w-6 h-6 text-emerald-400 mb-2" />
                  <div className="font-bold text-sm text-white">Transferencias</div>
                  <div className="text-xs text-slate-400 mt-1">Cuentas Pichincha, Guayaquil & Produbanco.</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onOpenCheckout({
                    title: "Suscripción Plan Constructor Pro",
                    amount: 19.99,
                    badgeText: "SARA Ecosistema",
                    isSubscription: true
                  })}
                  className="px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02]"
                >
                  <span>Abrir Pasarela Estándar Ahora</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cifrado SSL 256-bit & PCI-DSS Nivel 1</span>
                </div>
              </div>
            </div>

            {/* Right Column: Mini Interactive Preview of the Split Layout */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-6 relative">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 font-mono">checkout.gruposara.com</span>
                </div>

                {/* Simulated Split View Preview */}
                <div className="grid grid-cols-2 gap-3 text-[11px] mb-4">
                  {/* Left Column Preview */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="text-[10px] font-bold text-amber-400 uppercase">Detalle del Pago</div>
                    <div className="text-white font-bold">Plan Constructor</div>
                    <div className="text-xl font-black text-emerald-400">$19.99 <span className="text-[10px] text-slate-400 font-normal">/mes</span></div>
                    <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                      <div>Subtotal: $19.99</div>
                      <div>Total hoy: $19.99</div>
                    </div>
                  </div>

                  {/* Right Column Preview */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Formas de Pago</div>
                    <div className="p-1.5 rounded-lg bg-slate-950 border border-emerald-500/40 text-[10px] text-white flex items-center justify-between font-bold">
                      <span>💳 Tarjeta</span>
                      <span className="text-emerald-400">●</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-300 flex items-center justify-between">
                      <span>📱 QR DeUna</span>
                      <span className="text-slate-500">○</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-300 flex items-center justify-between">
                      <span>🏛️ Transferencia</span>
                      <span className="text-slate-500">○</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onOpenCheckout({
                    title: "Demostración de Pasarela Estándar",
                    amount: 19.99,
                    badgeText: "Grupo SARA",
                    isSubscription: false
                  })}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20"
                >
                  Probar Interacción en Vivo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
