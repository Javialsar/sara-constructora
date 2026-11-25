'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, ChevronDown, ChevronUp, CheckCircle2, MapPin, Navigation } from 'lucide-react';
import type { PasoNavegacionVial, TipoManiobraVial } from '@/lib/fletes/saraVoiceNavigation';

interface SaraGoogleMapsNavPanelProps {
  originName: string;
  destinationName: string;
  steps: PasoNavegacionVial[];
  activeStepIndex: number;
  remainingMetersToNextTurn: number;
  tripProgressPercent: number;
  voiceMuted?: boolean;
  onToggleVoice?: () => void;
  onRepeatCurrentStep?: () => void;
  topOffsetClass?: string;
}

/**
 * Resalta visualmente las letras del nombre de la calle dentro de la instrucción
 * cuando el vehículo está circulando por esa calle en tiempo real.
 */
function renderHighlightedInstruction(
  instruccion: string,
  calle: string,
  isCurrent: boolean,
  isPast: boolean
) {
  if (!calle || calle.trim().length < 2) {
    return (
      <span className={isCurrent ? 'text-white font-black' : isPast ? 'line-through text-slate-400' : 'text-slate-200'}>
        {instruccion}
      </span>
    );
  }

  const cleanStreet = calle.trim();
  const idx = instruccion.toLowerCase().indexOf(cleanStreet.toLowerCase());
  if (idx === -1) {
    return (
      <span className={isCurrent ? 'text-white font-black' : isPast ? 'line-through text-slate-400' : 'text-slate-200'}>
        {instruccion}{' '}
        {isCurrent && (
          <span className="inline-block text-emerald-300 bg-emerald-400/20 px-1.5 py-0.5 rounded-md ring-1 ring-emerald-400/50 font-black drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]">
            {cleanStreet}
          </span>
        )}
      </span>
    );
  }

  const before = instruccion.slice(0, idx);
  const matched = instruccion.slice(idx, idx + cleanStreet.length);
  const after = instruccion.slice(idx + cleanStreet.length);

  if (isCurrent) {
    return (
      <span className="text-white font-black">
        {before}
        <span className="inline-block text-emerald-300 bg-emerald-400/25 px-1.5 py-0.5 rounded-md ring-1 ring-emerald-400/60 font-black tracking-wide drop-shadow-[0_0_10px_rgba(52,211,153,0.75)] transition-all duration-300">
          {matched}
        </span>
        {after}
      </span>
    );
  }

  if (isPast) {
    return (
      <span className="line-through text-slate-400">
        {before}
        <span className="text-emerald-400/60 font-semibold">{matched}</span>
        {after}
      </span>
    );
  }

  return (
    <span className="text-slate-300">
      {before}
      <span className="text-white font-bold">{matched}</span>
      {after}
    </span>
  );
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
  voiceMuted = false,
  onToggleVoice,
  onRepeatCurrentStep,
  topOffsetClass = 'top-3',
}: SaraGoogleMapsNavPanelProps) {
  const [expanded, setExpanded] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 640 : true
  );
  const activeStepItemRef = useRef<HTMLDivElement | null>(null);

  // Desplazar automáticamente la lista hacia la calle activa conforme avanza el viaje
  useEffect(() => {
    if (expanded && activeStepItemRef.current) {
      try {
        activeStepItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch {}
    }
  }, [activeStepIndex, expanded]);

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
    <div className={`absolute ${topOffsetClass} left-3 right-3 sm:right-auto sm:w-[360px] z-[500] flex flex-col gap-2 pointer-events-auto`}>
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
                Vía actual:{' '}
                <strong className="text-emerald-300 bg-emerald-400/20 px-1.5 py-0.5 rounded ring-1 ring-emerald-400/50 drop-shadow-[0_0_8px_rgba(52,211,153,0.65)]">
                  {activeStep.calle}
                </strong>
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            {onToggleVoice && (
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
            )}
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

          {/* Lista vertical de pasos giro a giro con resaltado dinámico de la calle actual */}
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-800/70 custom-scrollbar">
            {steps.map((step, idx) => {
              const isPast = idx < activeStepIndex || isArrived;
              const isCurrent = idx === activeStepIndex && !isArrived;
              const stepTotalM = Math.max(1, step.distanciaMetros || 1);
              const stepPct = isCurrent
                ? Math.min(100, Math.max(8, Math.round(((stepTotalM - Math.min(stepTotalM, remainingMetersToNextTurn)) / stepTotalM) * 100)))
                : isPast
                ? 100
                : 0;
              return (
                <div
                  key={`${step.indice}_${step.calle}_${idx}`}
                  ref={isCurrent ? activeStepItemRef : null}
                  className={`px-3.5 py-2.5 flex items-start gap-3 transition-all duration-300 ${
                    isCurrent
                      ? 'bg-emerald-500/20 border-l-4 border-l-emerald-400 shadow-inner'
                      : isPast
                      ? 'opacity-55'
                      : 'hover:bg-slate-900/60'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black shrink-0 mt-0.5 transition-all ${
                      isCurrent
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/40 scale-105'
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
                      <p className="text-xs leading-snug">
                        {renderHighlightedInstruction(step.instruccion, step.calle, isCurrent, isPast)}
                      </p>
                      {isCurrent && (
                        <span className="shrink-0 text-[9px] font-black uppercase bg-emerald-400 text-slate-950 px-1.5 py-0.5 rounded-full animate-pulse">
                          Ahora
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-mono font-bold ${isCurrent ? 'text-emerald-300' : 'text-slate-400'}`}>
                        {step.maniobra === 'arrive'
                          ? 'Llegada'
                          : isCurrent && remainingMetersToNextTurn > 0
                          ? `${remainingMetersToNextTurn} m restantes`
                          : `${step.distanciaMetros} m`}
                      </span>
                      <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${isCurrent ? 'bg-emerald-400' : isPast ? 'bg-emerald-600/60' : 'bg-transparent'}`}
                          style={{ width: `${stepPct}%` }}
                        />
                      </div>
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
