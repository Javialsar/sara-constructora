'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, ChevronDown, ChevronUp, CheckCircle2, MapPin, Navigation } from 'lucide-react';
import type { PasoNavegacionVial, TipoManiobraVial } from '@/lib/fletes/saraVoiceNavigation';

interface SaraGoogleMapsNavPanelProps {
  originName: string;
  destinationName: string;
  steps: PasoNavegacionVial[];
  activeStepIndex: number;
  remainingMetersToNextTurn: number;
  tripProgressPercent: number;
  voiceMuted: boolean;
  onToggleVoice: () => void;
  onRepeatCurrentStep: () => void;
}

function getManeuverGlyph(maniobra: TipoManiobraVial): string {
  switch (maniobra) {
    case 'turn-left':
    case 'slight-left':
      return '↰';
    case 'turn-right':
    case 'slight-right':
      return '↱';
    case 'roundabout':
      return '↻';
    case 'uturn':
      return '↶';
    case 'arrive':
      return '🏁';
    default:
      return '↑';
  }
}

export function SaraGoogleMapsNavPanel({
  originName,
  destinationName,
  steps,
  activeStepIndex,
  remainingMetersToNextTurn,
  tripProgressPercent,
  voiceMuted,
  onToggleVoice,
  onRepeatCurrentStep,
}: SaraGoogleMapsNavPanelProps) {
  const [expanded, setExpanded] = useState<boolean>(true);

  const isArrived = tripProgressPercent >= 100;
  const activeStep: PasoNavegacionVial = steps[activeStepIndex] || {
    indice: 0,
    instruccion: `Dirígete hacia ${destinationName}`,
    calle: destinationName,
    distanciaMetros: remainingMetersToNextTurn,
    duracionSegundos: 60,
    maniobra: isArrived ? 'arrive' : 'straight',
    coords: [-4.328103, -79.561129],
  };

  return (
    <div className="absolute top-3 left-3 right-3 sm:right-auto sm:w-[360px] z-[500] flex flex-col gap-2 pointer-events-auto">
      {/* CABECERA ACTIVA ESTILO GOOGLE MAPS NAVIGATION */}
      <div className="bg-emerald-950/95 backdrop-blur-xl border-2 border-emerald-400/70 rounded-2xl p-3 shadow-2xl">
        <div className="flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onRepeatCurrentStep}
            className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer group"
            title="Toca para repetir la indicación por voz"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500 text-slate-950 font-black text-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
              {isArrived ? '🏁' : getManeuverGlyph(activeStep.maniobra)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                  {isArrived
                    ? 'Destino alcanzado'
                    : remainingMetersToNextTurn > 0
                    ? `En ${remainingMetersToNextTurn} m`
                    : 'Ahora'}
                </span>
              </div>
              <p className="text-sm font-black text-white leading-tight truncate">
                {isArrived ? 'Hemos llegado con felicidad' : activeStep.instruccion}
              </p>
              <p className="text-[11px] text-emerald-200/90 truncate mt-0.5">
                Vía actual: <strong className="text-white">{activeStep.calle}</strong>
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onToggleVoice}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                voiceMuted
                  ? 'bg-slate-900 text-slate-400 border-slate-700'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 hover:bg-emerald-500/30'
              }`}
              title={voiceMuted ? 'Activar voz GPS' : 'Silenciar voz GPS'}
            >
              {voiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-emerald-200 border border-emerald-500/40 transition-colors cursor-pointer"
              title={expanded ? 'Ocultar lista de recorrido' : 'Ver recorrido paso a paso'}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* PANEL DESPLEGABLE DE RECORRIDO PASO A PASO ESTILO GOOGLE MAPS */}
      {expanded && steps.length > 0 && (
        <div className="bg-slate-950/95 backdrop-blur-xl border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Origen */}
          <div className="px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-black text-white truncate">{originName}</p>
              <p className="text-[10px] text-slate-400">Punto de partida · Sincronizado en vivo</p>
            </div>
          </div>

          {/* Lista vertical de pasos giro a giro */}
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-800/70 custom-scrollbar">
            {steps.map((step, idx) => {
              const isPast = idx < activeStepIndex || isArrived;
              const isCurrent = idx === activeStepIndex && !isArrived;
              return (
                <div
                  key={`${step.indice}_${step.calle}`}
                  className={`px-3.5 py-2.5 flex items-start gap-3 transition-colors ${
                    isCurrent
                      ? 'bg-emerald-500/15 border-l-4 border-l-emerald-400'
                      : isPast
                      ? 'opacity-55'
                      : 'hover:bg-slate-900/60'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black shrink-0 mt-0.5 ${
                      isCurrent
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : isPast
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-900 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {isPast && step.maniobra !== 'arrive' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      getManeuverGlyph(step.maniobra)
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-xs leading-snug ${
                          isCurrent ? 'font-black text-white' : 'font-semibold text-slate-200'
                        }`}
                      >
                        {step.instruccion}
                      </p>
                      {isCurrent && (
                        <span className="shrink-0 text-[9px] font-black uppercase bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded-full">
                          Ahora
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {step.maniobra === 'arrive'
                          ? 'Llegada'
                          : isCurrent && remainingMetersToNextTurn > 0
                          ? `${remainingMetersToNextTurn} m restantes`
                          : `${step.distanciaMetros} m`}
                      </span>
                      <div className="h-px flex-1 bg-slate-800" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Destino final */}
          <div className="px-3.5 py-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-black text-amber-300 truncate">{destinationName}</p>
              <p className="text-[10px] text-slate-400">
                {isArrived ? 'Hemos llegado con felicidad, que tenga un excelente día.' : 'Punto de entrega final'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
