'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  ExternalLink, 
  Building2, 
  Calculator, 
  ShoppingCart, 
  Truck, 
  Users, 
  Home, 
  Hotel, 
  Wallet, 
  Info, 
  Clock, 
  Zap, 
  CheckCircle2,
  Calendar,
  FileCheck2
} from 'lucide-react';
import { 
  SaraModulePlansService, 
  DetalleModuloCotizacion, 
  PlanGenericoModulo 
} from '@/lib/services/saraModulePlansService';

export interface DynamicModuleQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: string;
  moduleLogoUrl?: string;
  onSelectPlanForCheckout: (planData: {
    title: string;
    amount: number;
    badgeText: string;
    isSubscription?: boolean;
    subscriptionInterval?: string;
  }) => void;
}

export default function DynamicModuleQuoteModal({
  isOpen,
  onClose,
  moduleId,
  moduleLogoUrl,
  onSelectPlanForCheckout
}: DynamicModuleQuoteModalProps) {
  const [esAnual, setEsAnual] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const detalle: DetalleModuloCotizacion = SaraModulePlansService.getDetalleModulo(moduleId);
  const tienePlanesAnuales = detalle.planes.some(p => p.precioAnual && p.precioAnual > 0);

  const getModuleIcon = (id: string) => {
    switch (id) {
      case 'constructora': return Building2;
      case 'apu': return Calculator;
      case 'marketplace':
      case 'compras': return ShoppingCart;
      case 'fletes': return Truck;
      case 'talento': return Users;
      case 'inmobiliaria': return Home;
      case 'alojamiento':
      case 'stays': return Hotel;
      case 'pagos':
      case 'financiero': return Wallet;
      case 'facturacion':
      case 'facturacion-electronica': return FileCheck2;
      default: return ShieldCheck;
    }
  };

  const IconoModulo = getModuleIcon(detalle.id);

  const handleSeleccionarPlan = (plan: PlanGenericoModulo) => {
    // Caso 1: Modelo de Éxito Talento ($0 Inicial)
    if (plan.accionTipo === 'gratis_redireccion' || plan.esGratisInicial) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('sara_candidato_plan', plan.id);
        localStorage.setItem('sara_candidato_plan_nombre', plan.nombre);
        localStorage.setItem('sara_candidato_comision', String(plan.porcentajeExito || 15));
      }

      setSuccessToast(`¡${plan.nombre} activado exitosamente! Comisión de éxito: ${plan.porcentajeExito}% del primer mes.`);
      
      setTimeout(() => {
        setSuccessToast(null);
        onClose();
        if (typeof window !== 'undefined') {
          window.location.href = plan.urlDestino || '/modulos/talento';
        }
      }, 1600);
      return;
    }

    // Caso 2: Cotizador externo interactivo (Fletes, Obras a medida)
    if (plan.accionTipo === 'cotizador_externo') {
      onClose();
      if (typeof window !== 'undefined') {
        window.location.href = plan.urlDestino || detalle.urlModulo;
      }
      return;
    }

    // Caso 3: Pago estándar o suscripción real
    const monto = esAnual && plan.precioAnual ? plan.precioAnual : (plan.precioMensual || plan.precioFijo || 0);
    const esSub = Boolean(plan.precioMensual || plan.precioAnual);

    onClose();
    onSelectPlanForCheckout({
      title: `${plan.nombre} - ${detalle.titulo}`,
      amount: monto,
      badgeText: detalle.titulo,
      isSubscription: esSub,
      subscriptionInterval: esSub ? (esAnual ? 'por año' : 'por mes') : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl my-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast Notificación Interna */}
        {successToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-bold px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm animate-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Cabecera del Modal */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-800/90 to-slate-900 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-950/90 border border-slate-700/60 p-2.5 flex items-center justify-center shrink-0 shadow-lg">
              {moduleLogoUrl ? (
                <img 
                  src={moduleLogoUrl} 
                  alt={detalle.titulo}
                  className="max-h-full max-w-full object-contain filter drop-shadow-md"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <IconoModulo className="w-8 h-8 text-amber-400" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {detalle.tagline}
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">
                  Planes Oficiales del Administrador
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                {detalle.titulo} — Opciones & Cotización
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
                {detalle.descripcion}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700 shrink-0"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Modelo Económico & Switch Anual */}
        <div className="px-6 py-3.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <Info className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{detalle.explicacionModelo}</span>
          </div>

          {tienePlanesAnuales && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setEsAnual(false)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  !esAnual ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Mensual
              </button>
              <button
                type="button"
                onClick={() => setEsAnual(true)}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  esAnual ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Anual</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-md font-mono">
                  -17% (2 meses gratis)
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Grilla de Planes Reales del Módulo */}
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[60vh]">
          <div className={`grid gap-5 ${
            detalle.planes.length === 1 
              ? 'grid-cols-1 max-w-lg mx-auto' 
              : detalle.planes.length === 2 
                ? 'grid-cols-1 md:grid-cols-2' 
                : 'grid-cols-1 md:grid-cols-3'
          }`}>
            {detalle.planes.map((plan) => {
              const precioMostrar = esAnual && plan.precioAnual 
                ? plan.precioAnual 
                : (plan.precioMensual ?? plan.precioFijo ?? 0);

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-200 border ${
                    plan.esRecomendado
                      ? 'bg-gradient-to-b from-amber-500/[0.08] via-slate-800/80 to-slate-900 border-amber-500/40 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/30'
                      : 'bg-slate-800/40 hover:bg-slate-800/70 border-slate-700/60'
                  }`}
                >
                  {plan.esRecomendado && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Recomendado</span>
                    </div>
                  )}

                  <div>
                    {/* Badge y Nombre */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                        {plan.nombre}
                      </h3>
                      {plan.badge && (
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-700/70 text-amber-300 border border-slate-600">
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mb-5 leading-relaxed min-h-[38px]">
                      {plan.descripcion}
                    </p>

                    {/* Precios o Porcentaje de Éxito */}
                    <div className="mb-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                      {plan.esGratisInicial ? (
                        <div>
                          <div className="flex items-baseline gap-1 text-emerald-400 font-mono">
                            <span className="text-3xl font-black">$0.00</span>
                            <span className="text-xs font-bold text-slate-400 uppercase">Costo Inicial</span>
                          </div>
                          <div className="text-xs font-bold text-amber-300 mt-1 flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Comisión: {plan.porcentajeExito}% del 1er mes al conseguir empleo</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline gap-1 font-mono text-white">
                            <span className="text-3xl font-black">${Number(precioMostrar).toFixed(2)}</span>
                            <span className="text-xs font-bold text-slate-400">
                              {plan.precioMensual || plan.precioAnual 
                                ? (esAnual ? '/ año' : '/ mes') 
                                : ' USD'}
                            </span>
                          </div>
                          {esAnual && plan.precioAnual && (
                            <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                              Equivalente a ${(plan.precioAnual / 12).toFixed(2)}/mes
                            </div>
                          )}
                          {plan.precioFijo && (
                            <div className="text-[11px] text-slate-400 font-medium mt-1">
                              Tarifa base aplicable al servicio
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Lista de Beneficios */}
                    <div className="space-y-2.5 mb-6">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Beneficios Incluidos:
                      </div>
                      {plan.caracteristicas.map((caract, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{caract}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botón de Acción Principal del Plan */}
                  <div className="pt-4 border-t border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => handleSeleccionarPlan(plan)}
                      className={`w-full min-h-[46px] rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                        plan.esGratisInicial
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                          : plan.esRecomendado
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                            : 'bg-slate-700 hover:bg-slate-600 text-white'
                      }`}
                    >
                      {plan.esGratisInicial ? (
                        <>
                          <span>Postularme con {plan.nombre}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : plan.accionTipo === 'cotizador_externo' ? (
                        <>
                          <span>Iniciar Cotización en Vivo</span>
                          <ExternalLink className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span>Suscribir Plan (${Number(precioMostrar).toFixed(2)})</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer del Modal: Acceso Completo al Módulo */}
        <div className="p-4 sm:p-6 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Precios y condiciones reguladas por la administración oficial de Grupo SARA</span>
          </div>

          <a
            href={detalle.urlModulo}
            className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold transition-colors"
          >
            <span>{detalle.etiquetaBotonSecundario || 'Explorar Módulo Completo'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
