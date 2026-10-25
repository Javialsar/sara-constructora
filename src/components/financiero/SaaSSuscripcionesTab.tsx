'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Building2, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  Lock,
  Layers,
  FileCheck2,
  HelpCircle
} from 'lucide-react';
import { 
  SaraSaaSPlansService, 
  SaaSSubscriptionPlan 
} from '@/lib/services/saraSaaSPlansService';
import StandardCheckoutModal from '@/components/checkout/StandardCheckoutModal';

interface SaasTabProps {
  onNotify: (type: 'success' | 'error', message: string) => void;
}

export default function SaaSSuscripcionesTab({ onNotify }: SaasTabProps) {
  const planes = SaraSaaSPlansService.getPlanes();
  const [esAnual, setEsAnual] = useState<boolean>(true);
  const [planSeleccionado, setPlanSeleccionado] = useState<SaaSSubscriptionPlan | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [planActivoId, setPlanActivoId] = useState<string>('plan-pro');

  const handleIniciarSuscripcion = (plan: SaaSSubscriptionPlan) => {
    setPlanSeleccionado(plan);
    setShowCheckoutModal(true);
  };

  const handleCheckoutSuccess = (txId: string) => {
    if (planSeleccionado) {
      setPlanActivoId(planSeleccionado.id);
      onNotify('success', `¡Suscripción al ${planSeleccionado.nombre} activada exitosamente! Transacción N° ${txId}. Disfruta de la suite financiera y tributaria.`);
    }
    setShowCheckoutModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ==================================================================== */}
      {/* HEADER DE SUSCRIPCIONES SAAS */}
      {/* ==================================================================== */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-teal-500/20 text-teal-400 border border-teal-500/30">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Planes SaaS B2B • Software Financiero & Tributario de Obra</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Gobernanza Tributaria SRI, Fideicomiso Escrow & ERP de Obra
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Controla tus obras civiles con Three-Way Match automático, liquidación de cuadrillas con tareo IESS y custodia fiduciaria para contratistas y constructoras del Ecuador.
        </p>

        {/* Selector Mensual / Anual */}
        <div className="inline-flex items-center gap-3 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold mt-2">
          <button
            type="button"
            onClick={() => setEsAnual(false)}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              !esAnual ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Facturación Mensual
          </button>
          <button
            type="button"
            onClick={() => setEsAnual(true)}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              esAnual ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Facturación Anual</span>
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
              AHORRA 2 MESES
            </span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* GRID DE PLANES SAAS */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
        {planes.map((plan) => {
          const precio = esAnual ? Math.round(plan.precioAnualUSD / 12) : plan.precioMensualUSD;
          const esDestacado = plan.destacado;
          const esActivo = plan.id === planActivoId;

          return (
            <div
              key={plan.id}
              className={`rounded-3xl border transition-all flex flex-col justify-between relative overflow-hidden backdrop-blur-sm ${
                esDestacado
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-teal-950/40 border-teal-500/50 shadow-2xl shadow-teal-950/30 ring-2 ring-teal-500/30'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-xl'
              }`}
            >
              {esDestacado && (
                <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider py-1.5 text-center shadow">
                  ★ MÁS POPULAR PARA CONSTRUCTORAS
                </div>
              )}

              <div className="p-6 sm:p-8 flex-grow">
                {/* Header de Tarjeta */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.nombre}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-snug">{plan.tagline}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    esDestacado ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {plan.badge}
                  </span>
                </div>

                {/* Precio */}
                <div className="my-6 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 font-mono">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">${precio}</span>
                    <span className="text-xs text-slate-400 font-sans">USD / mes</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1 font-sans">
                    {esAnual ? `Facturado anualmente ($${plan.precioAnualUSD} USD/año)` : 'Facturado mes a mes'}
                  </span>
                </div>

                {/* Métricas del Plan */}
                <div className="space-y-2 mb-6 text-xs text-slate-300 font-medium">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Proyectos / Obras Civiles:</span>
                    <strong className="text-white font-mono">{plan.proyectosActivosMax === 999 ? 'Ilimitados' : plan.proyectosActivosMax}</strong>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Comprobantes SRI / mes:</span>
                    <strong className="text-white font-mono">{plan.comprobantesSriMensuales === 999999 ? 'Ilimitados' : plan.comprobantesSriMensuales.toLocaleString()}</strong>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Usuarios en Sistema:</span>
                    <strong className="text-white font-mono">{plan.limiteUsuarios === 999 ? 'Ilimitados' : plan.limiteUsuarios}</strong>
                  </div>
                </div>

                {/* Lista de Beneficios */}
                <div className="space-y-2.5 mb-6 text-xs text-slate-300">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    CARACTERÍSTICAS INCLUIDAS:
                  </span>
                  {plan.beneficios.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2 leading-relaxed">
                      <CheckCircle2 size={14} className="text-teal-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón de Acción */}
              <div className="p-6 sm:p-8 pt-0">
                {esActivo ? (
                  <div className="w-full py-3 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-300 font-bold text-xs flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} /> Plan Actualmente Activo
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleIniciarSuscripcion(plan)}
                    className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                      esDestacado
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    <span>Suscribir a {plan.nombre}</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Checkout Estándar */}
      {planSeleccionado && (
        <StandardCheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          onSuccess={handleCheckoutSuccess}
          title={`Suscripción ${planSeleccionado.nombre}`}
          badgeText="SARA Fintech SaaS"
          amount={esAnual ? planSeleccionado.precioAnualUSD : planSeleccionado.precioMensualUSD}
          isSubscription={true}
          subscriptionInterval={esAnual ? 'por año' : 'por mes'}
          items={[
            {
              label: `${planSeleccionado.nombre} (${esAnual ? 'Anual con 2 meses gratis' : 'Mensual'})`,
              amount: esAnual ? planSeleccionado.precioAnualUSD : planSeleccionado.precioMensualUSD
            }
          ]}
        />
      )}

    </div>
  );
}
