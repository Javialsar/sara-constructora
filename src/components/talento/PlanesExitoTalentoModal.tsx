'use client';

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Award, 
  Users, 
  Zap, 
  ArrowRight,
  Briefcase,
  DollarSign,
  Lock,
  FileCheck2,
  CheckCircle2
} from 'lucide-react';
import { 
  TalentoPlanesService, 
  TalentoPlan, 
  PLANES_TALENTO_DEFAULT 
} from '@/lib/services/talentoPlanesService';

interface PlanesExitoTalentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanSelected?: (planId: string) => void;
}

export function PlanesExitoTalentoModal({ isOpen, onClose, onPlanSelected }: PlanesExitoTalentoModalProps) {
  const [planes] = useState<TalentoPlan[]>(() => TalentoPlanesService.getPlanes());
  const [planSeleccionado, setPlanSeleccionado] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sara_candidato_plan') || 'vip';
    }
    return 'vip';
  });
  const [confirmado, setConfirmado] = useState(false);
  const [nombreCandidato, setNombreCandidato] = useState('');
  const [cedula, setCedula] = useState('');

  if (!isOpen) return null;

  const handleElegirPlan = (id: string) => {
    setPlanSeleccionado(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sara_candidato_plan', id);
    }
    if (onPlanSelected) {
      onPlanSelected(id);
    }
    setConfirmado(true);
    setTimeout(() => {
      setConfirmado(false);
      onClose();
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-white">
        
        {/* Cabecera */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/50">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Planes de Colocación Laboral en Obras Civiles
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  $0.00 Costo Inicial
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Modelo de Éxito de GRUPO SARA: Solo cancelas el porcentaje acordado una vez que cobras tu primer mes de trabajo.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notificación de Éxito */}
        {confirmado && (
          <div className="m-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 animate-in fade-in">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <div className="text-xs">
              <h4 className="font-bold text-sm">¡Plan activado con éxito en tu perfil!</h4>
              <p className="text-emerald-300">
                Tu perfil ahora tiene prioridad {planes.find(p => p.id === planSeleccionado)?.prioridadMultiplicador}x en el Radar Geográfico y la Cuadrilla de IA comenzará el matching inmediato.
              </p>
            </div>
          </div>
        )}

        {/* Banner de Garantía y Cero Riesgo */}
        <div className="px-6 pt-6">
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 rounded-2xl p-4 border border-indigo-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Sin Pagos por Adelantado • Cero Fricción</span>
                <span className="text-slate-300">
                  No pagas suscripciones ni matrículas. Te ayudamos a vincularte a constructoras y licitaciones SERCOP; nuestro honorario se liquida a los 30 días de trabajo formal.
                </span>
              </div>
            </div>
            <div className="text-[11px] font-mono text-emerald-300 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800 shrink-0">
              ✓ Avalado por Código del Trabajo & SRI
            </div>
          </div>
        </div>

        {/* Cuadrícula de los 3 Planes */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {planes.map((plan) => {
            const isSelected = planSeleccionado === plan.id;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 bg-slate-950/70 border-2 transition-all flex flex-col justify-between relative shadow-lg ${
                  plan.destacado
                    ? 'border-amber-500 shadow-amber-500/10'
                    : isSelected
                    ? 'border-emerald-500 shadow-emerald-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {plan.destacado && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Más Elegido en Obra Civil</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2 pt-1">
                    <div>
                      <h3 className="text-base font-black text-white leading-tight">
                        {plan.nombre}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {plan.tagline}
                      </p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 shadow-xs ${plan.badgeColor}`}>
                      {plan.slug.toUpperCase()}
                    </span>
                  </div>

                  {/* Porcentaje de Éxito */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-3xl font-black font-mono text-white">
                          {plan.porcentajePrimerMes}%
                        </span>
                        <span className="text-xs font-bold text-slate-400 ml-1.5">del primer mes</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-800">
                        $0 Inicial
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
                      <span>Prioridad en Radar GPS:</span>
                      <span className="font-bold text-white font-mono">{plan.prioridadMultiplicador}x Exposición</span>
                    </div>
                  </div>

                  {/* Beneficios */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Qué incluye:
                    </span>
                    <ul className="space-y-2">
                      {plan.beneficios.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-snug">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Botón de Selección */}
                <button
                  onClick={() => handleElegirPlan(plan.id)}
                  className={`w-full mt-6 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md ${
                    isSelected
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                      : plan.destacado
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-amber-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Plan Actual Activo</span>
                    </>
                  ) : (
                    <>
                      <span>Elegir {plan.slug.toUpperCase()} ({plan.porcentajePrimerMes}%)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Pie Informativo Legal */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            <span>Factura electrónica oficial emitida por GRUPO SARA al finalizar el día 30 de labores.</span>
          </div>
          <span className="font-mono text-slate-500">
            Normativa Ministerial MDT & Decreto 255
          </span>
        </div>

      </div>
    </div>
  );
}
