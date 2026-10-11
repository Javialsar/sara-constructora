'use client';

import React, { useState } from 'react';
import { Calculator, ArrowRight, CheckCircle2, Sparkles, Building, Layers, Ruler } from 'lucide-react';

interface InteractiveCostCalculatorProps {
  onOpenCheckout: (item: { title: string; amount: number; badgeText: string; isSubscription?: boolean }) => void;
}

export default function InteractiveCostCalculator({ onOpenCheckout }: InteractiveCostCalculatorProps) {
  const [areaM2, setAreaM2] = useState<number>(120);
  const [projectType, setProjectType] = useState<'residencial' | 'comercial' | 'industrial'>('residencial');
  const [finishQuality, setFinishQuality] = useState<'estandar' | 'superior' | 'premium'>('superior');

  // Pricing rates per m2 in Ecuador
  const baseRates: Record<string, number> = {
    residencial: 450,
    comercial: 520,
    industrial: 380
  };

  const finishMultipliers: Record<string, number> = {
    estandar: 1.0,
    superior: 1.25,
    premium: 1.55
  };

  const estimatedCost = Math.round(areaM2 * baseRates[projectType] * finishMultipliers[finishQuality]);
  const initialStudyFee = 49.99; // Booking fee for the technical study

  return (
    <section className="py-24 bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & Explanation */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Calculator className="w-4 h-4" />
              <span>Simulador de Presupuesto</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-4">
              Estima el Costo de tu Proyecto en Segundos
            </h2>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
              Ajusta los metros cuadrados y la tipología de construcción. Nuestro algoritmo basado en precios unitarios APU reales te proporciona un valor de referencia técnico inmediato.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Costos calculados con la base de datos oficial APU SARA.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Incluye mano de obra, materiales y dirección técnica.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Reserva tu visita o levantamiento topográfico con pago protegido.</span>
              </li>
            </ul>
          </div>

          {/* Right Column: Interactive Controls & Result Card */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-slate-950 border border-slate-800 p-8 shadow-2xl">
              {/* Range Slider for M2 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-amber-500" />
                    Área Estimada de Construcción
                  </label>
                  <span className="text-xl font-black text-amber-400 font-mono">{areaM2} m²</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="600"
                  step="10"
                  value={areaM2}
                  onChange={(e) => setAreaM2(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>50 m²</span>
                  <span>300 m²</span>
                  <span>600 m²</span>
                </div>
              </div>

              {/* Project Type Selectors */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Tipo de Proyecto
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'residencial', label: 'Residencial', desc: 'Vivienda / Villa' },
                    { id: 'comercial', label: 'Comercial', desc: 'Locales / Oficinas' },
                    { id: 'industrial', label: 'Industrial', desc: 'Galpones / Bodegas' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setProjectType(t.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        projectType === t.id
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs">{t.label}</div>
                      <div className="text-[10px] text-slate-500">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Finishes Quality Selectors */}
              <div className="mb-8">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Nivel de Acabados
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'estandar', label: 'Estándar', desc: 'Calidad económica' },
                    { id: 'superior', label: 'Superior', desc: 'Importados & Porcelanato' },
                    { id: 'premium', label: 'Lujo / Premium', desc: 'Automatizado / Smart' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFinishQuality(f.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        finishQuality === f.id
                          ? 'bg-emerald-500/10 border-emerald-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs">{f.label}</div>
                      <div className="text-[10px] text-slate-500">{f.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculation Summary Bar */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Presupuesto Referencial de Obra</div>
                  <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                    ${estimatedCost.toLocaleString()} <span className="text-xs text-slate-500 font-sans">USD</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenCheckout({
                    title: `Estudio de Factibilidad (${areaM2}m² ${projectType})`,
                    amount: initialStudyFee,
                    badgeText: "SARA Constructora",
                    isSubscription: false
                  })}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all"
                >
                  <span>Reservar Levantamiento (${initialStudyFee})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
