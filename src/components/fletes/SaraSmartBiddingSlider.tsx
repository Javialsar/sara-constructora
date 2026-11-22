'use client';

import React, { useMemo } from 'react';
import { Minus, Plus, ShieldCheck, Zap, Clock, RotateCcw, TrendingUp } from 'lucide-react';

export interface SaraSmartBiddingSliderProps {
  suggestedPrice: number;
  currentPrice: number;
  minFloorPrice?: number;
  maxCeilingPrice?: number;
  step?: number;
  driverSharePct?: number;
  onChangePrice: (newPrice: number) => void;
  compact?: boolean;
}

type ProbabilityTier = 'low' | 'sweet' | 'express';

interface SemaphoreMeta {
  tier: ProbabilityTier;
  badgeText: string;
  etaText: string;
  probabilityPct: number;
  dotColorClass: string;
  barColorClass: string;
  textColorClass: string;
  badgeBgClass: string;
  borderGlowClass: string;
  sliderAccentClass: string;
}

export const SaraSmartBiddingSlider: React.FC<SaraSmartBiddingSliderProps> = ({
  suggestedPrice,
  currentPrice,
  minFloorPrice,
  maxCeilingPrice,
  step = 0.25,
  driverSharePct = 88,
  onChangePrice,
  compact = false,
}) => {
  const safeSuggested = Math.max(1.25, +suggestedPrice.toFixed(2));
  const safeStep = step > 0 ? step : 0.25;

  const effectiveMin = useMemo(() => {
    const computed =
      typeof minFloorPrice === 'number' && Number.isFinite(minFloorPrice)
        ? minFloorPrice
        : Math.max(1.25, +(safeSuggested * 0.75).toFixed(2));
    return Math.max(0.5, +computed.toFixed(2));
  }, [minFloorPrice, safeSuggested]);

  const effectiveMax = useMemo(() => {
    const computed =
      typeof maxCeilingPrice === 'number' && Number.isFinite(maxCeilingPrice)
        ? maxCeilingPrice
        : +(safeSuggested * 1.6).toFixed(2);
    return Math.max(+(effectiveMin + safeStep).toFixed(2), +computed.toFixed(2));
  }, [maxCeilingPrice, safeSuggested, effectiveMin, safeStep]);

  const clampedPrice = useMemo(() => {
    const raw = Number.isFinite(currentPrice) ? currentPrice : safeSuggested;
    return +Math.min(effectiveMax, Math.max(effectiveMin, raw)).toFixed(2);
  }, [currentPrice, safeSuggested, effectiveMin, effectiveMax]);

  const semaphore: SemaphoreMeta = useMemo(() => {
    const ratio = safeSuggested > 0 ? clampedPrice / safeSuggested : 1;

    if (ratio < 0.9) {
      const normalized = Math.max(0, Math.min(1, (ratio - 0.75) / 0.15));
      const pct = Math.round(45 + normalized * 20);
      return {
        tier: 'low',
        badgeText: 'Baja probabilidad (~45%-65%)',
        etaText: 'Espera estimada: 5-8 min',
        probabilityPct: pct,
        dotColorClass: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
        barColorClass: 'bg-gradient-to-r from-rose-600 to-rose-400',
        textColorClass: 'text-rose-400',
        badgeBgClass: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
        borderGlowClass: 'border-rose-500/35',
        sliderAccentClass: 'accent-rose-500',
      };
    }

    if (ratio <= 1.15) {
      return {
        tier: 'sweet',
        badgeText: 'Punto Dulce Win-Win (~92%)',
        etaText: 'Aceptación estimada: < 30 seg',
        probabilityPct: 92,
        dotColorClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
        barColorClass: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
        textColorClass: 'text-emerald-400',
        badgeBgClass: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
        borderGlowClass: 'border-emerald-500/35',
        sliderAccentClass: 'accent-emerald-500',
      };
    }

    return {
      tier: 'express',
      badgeText: 'Prioridad Express (~99%)',
      etaText: 'Asignación inmediata garantizada',
      probabilityPct: 99,
      dotColorClass: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.85)]',
      barColorClass: 'bg-gradient-to-r from-amber-500 to-yellow-300',
      textColorClass: 'text-amber-400',
      badgeBgClass: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
      borderGlowClass: 'border-amber-500/40',
      sliderAccentClass: 'accent-amber-400',
    };
  }, [clampedPrice, safeSuggested]);

  const driverShareAmount = useMemo(
    () => ((clampedPrice * driverSharePct) / 100).toFixed(2),
    [clampedPrice, driverSharePct]
  );

  const isAtFloor = clampedPrice <= effectiveMin + 0.001;
  const isAtCeiling = clampedPrice >= effectiveMax - 0.001;
  const diffFromSuggested = +(clampedPrice - safeSuggested).toFixed(2);
  const isCustomized = Math.abs(diffFromSuggested) >= 0.01;

  const commitPrice = (candidate: number) => {
    const bounded = Math.min(effectiveMax, Math.max(effectiveMin, candidate));
    onChangePrice(+bounded.toFixed(2));
  };

  const handleDecrement = () => {
    commitPrice(clampedPrice - safeStep);
  };

  const handleIncrement = () => {
    commitPrice(clampedPrice + safeStep);
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseFloat(e.target.value);
    if (Number.isFinite(parsed)) {
      commitPrice(parsed);
    }
  };

  const handleResetSuggested = () => {
    commitPrice(safeSuggested);
  };

  return (
    <div
      className={`rounded-xl bg-slate-950/90 border transition-colors ${semaphore.borderGlowClass} ${
        compact ? 'p-3 space-y-2.5' : 'p-4 space-y-3.5'
      }`}
    >
      {/* Cabecera: Semáforo de Probabilidad */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${semaphore.badgeBgClass}`}
        >
          {semaphore.tier === 'express' ? (
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          ) : (
            <span className={`w-2 h-2 rounded-full shrink-0 ${semaphore.dotColorClass}`} />
          )}
          <span>{semaphore.badgeText}</span>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
          <Clock className="w-3 h-3 text-slate-500 shrink-0" />
          {semaphore.etaText}
        </span>
      </div>

      {/* Controles principales: Botón -, Precio Central, Botón + */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={isAtFloor}
          aria-label={`Disminuir oferta en $${safeStep.toFixed(2)}`}
          className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed shrink-0"
        >
          <Minus className="w-5 h-5" />
        </button>

        <div className="flex-1 text-center min-w-0">
          <div className="flex items-baseline justify-center gap-1">
            <span
              className={`font-mono tabular-nums font-black tracking-tight ${
                compact ? 'text-2xl' : 'text-3xl'
              } ${semaphore.textColorClass}`}
            >
              ${clampedPrice.toFixed(2)}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">USD</span>
          </div>

          <div className="mt-0.5 flex items-center justify-center gap-2 text-[10px] text-slate-400">
            <span className="font-mono tabular-nums">
              Sugerido: ${safeSuggested.toFixed(2)}
            </span>
            {isCustomized && (
              <button
                type="button"
                onClick={handleResetSuggested}
                className="inline-flex items-center gap-0.5 text-slate-300 hover:text-white underline underline-offset-2 font-semibold"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Restablecer
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={isAtCeiling}
          aria-label={`Aumentar oferta en $${safeStep.toFixed(2)}`}
          className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed shrink-0"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Slider estilizado */}
      <div className="space-y-1">
        <input
          type="range"
          min={effectiveMin}
          max={effectiveMax}
          step={safeStep}
          value={clampedPrice}
          onChange={handleRangeChange}
          aria-label="Ajustar oferta de tarifa en USD"
          className={`w-full h-2 rounded-lg bg-slate-800 cursor-pointer appearance-none ${semaphore.sliderAccentClass}`}
        />
        <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-slate-500">
          <span className={isAtFloor ? 'text-rose-400 font-bold' : ''}>
            Piso: ${effectiveMin.toFixed(2)}
          </span>
          <span className="text-slate-400">
            Paso: ±${safeStep.toFixed(2)}
          </span>
          <span>Máx: ${effectiveMax.toFixed(2)}</span>
        </div>
      </div>

      {/* Barra de progreso del Semáforo de Probabilidad */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] font-semibold">
          <span className="text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-slate-500" />
            Probabilidad de aceptación
          </span>
          <span className={`font-mono tabular-nums font-bold ${semaphore.textColorClass}`}>
            ~{semaphore.probabilityPct}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${semaphore.barColorClass}`}
            style={{ width: `${semaphore.probabilityPct}%` }}
          />
        </div>
      </div>

      {/* Nota transparente Win-Win */}
      <div className="pt-1.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <span className="inline-flex items-center gap-1.5 text-slate-300 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-mono tabular-nums">
            Conductor recibe ${driverShareAmount} ({driverSharePct}%)
          </span>
        </span>
        {isAtFloor && (
          <span className="text-[10px] font-bold text-rose-400">
            Piso mínimo protegido
          </span>
        )}
      </div>
    </div>
  );
};

export default SaraSmartBiddingSlider;
