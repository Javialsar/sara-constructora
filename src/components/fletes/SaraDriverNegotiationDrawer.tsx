'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Radar,
  Star,
  Clock,
  MapPin,
  Check,
  X,
  Zap,
  Award,
  Timer,
  Car,
  Phone,
  ShieldCheck,
} from 'lucide-react';

export interface NegotiationDriverOffer {
  id: string;
  driverName: string;
  vehicleName: string;
  plate: string;
  rating: number;
  tripsCount: number;
  etaMinutes: number;
  distanceMeters: number;
  offeredPrice: number;
  isCounterOffer: boolean;
  phone: string;
}

export interface SaraDriverNegotiationDrawerProps {
  offers: NegotiationDriverOffer[];
  referencePrice: number;
  onAcceptOffer: (offer: NegotiationDriverOffer) => void;
  onRejectOffer: (offerId: string) => void;
  onBoostPrice?: (deltaUSD: number) => void;
  onCancelSearch: () => void;
  onRadiusChange?: (radiusMeters: number) => void;
  vehicleLabel?: string;
}

const RADAR_STEPS_METERS = [1500, 3000, 5000] as const;
const RADAR_STEP_INTERVAL_MS = 5000;
const OFFER_TTL_MS = 30_000;

function formatDistance(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) return '0 m';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

interface RadarSearchingViewProps {
  onBoostPrice?: (deltaUSD: number) => void;
  onRadiusChange?: (radiusMeters: number) => void;
}

const RadarSearchingView: React.FC<RadarSearchingViewProps> = ({
  onBoostPrice,
  onRadiusChange,
}) => {
  const [radarStepIndex, setRadarStepIndex] = useState<number>(0);
  const onRadiusChangeRef = useRef(onRadiusChange);

  useEffect(() => {
    onRadiusChangeRef.current = onRadiusChange;
  }, [onRadiusChange]);

  useEffect(() => {
    onRadiusChangeRef.current?.(RADAR_STEPS_METERS[0]);

    let step = 0;
    const intervalId = window.setInterval(() => {
      if (step < RADAR_STEPS_METERS.length - 1) {
        step += 1;
        setRadarStepIndex(step);
        onRadiusChangeRef.current?.(RADAR_STEPS_METERS[step]);
      }
    }, RADAR_STEP_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  const currentRadius = RADAR_STEPS_METERS[radarStepIndex] ?? 5000;

  return (
    <motion.div
      key="radar-searching"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center text-center py-4 space-y-4"
    >
      {/* Radar animado de radio incremental */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        <motion.div
          animate={{ scale: [0.55, 1.35], opacity: [0.7, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full border-2 border-emerald-400/60"
        />
        <motion.div
          animate={{ scale: [0.55, 1.35], opacity: [0.6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.75 }}
          className="absolute inset-0 rounded-full border border-amber-400/50"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500/20 via-emerald-500/5 to-transparent border border-emerald-500/40 flex items-center justify-center"
        >
          <Radar className="w-8 h-8 text-emerald-400" />
        </motion.div>
      </div>

      {/* Indicador de Radio Incremental */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono tabular-nums font-bold text-emerald-400">
          <MapPin className="w-3.5 h-3.5" />
          <span>Radio activo: {(currentRadius / 1000).toFixed(1)} km</span>
        </div>
        <p className="text-xs text-slate-400 max-w-xs">
          Transmitiendo tu solicitud a conductores verificados de GRUPO SARA. Las contraofertas aparecerán aquí en segundos.
        </p>
      </div>

      {/* Pasos de radio */}
      <div className="flex items-center gap-2">
        {RADAR_STEPS_METERS.map((stepMeters, idx) => {
          const isActive = idx <= radarStepIndex;
          return (
            <div
              key={stepMeters}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono tabular-nums font-bold border transition-all ${
                isActive
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              {(stepMeters / 1000).toFixed(1)} km
            </div>
          );
        })}
      </div>

      {/* Botón rápido de boost */}
      {onBoostPrice && (
        <button
          type="button"
          onClick={() => onBoostPrice(0.5)}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/50 text-amber-300 font-black text-xs sm:text-sm transition-all active:scale-98 flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <span>⚡ Subir oferta +$0.50 para acelerar</span>
        </button>
      )}
    </motion.div>
  );
};

interface OfferCascadeCardProps {
  offer: NegotiationDriverOffer;
  referencePrice: number;
  isFastest: boolean;
  isBestPrice: boolean;
  onAcceptOffer: (offer: NegotiationDriverOffer) => void;
  onRejectOffer: (offerId: string) => void;
}

const OfferCascadeCard: React.FC<OfferCascadeCardProps> = ({
  offer,
  referencePrice,
  isFastest,
  isBestPrice,
  onAcceptOffer,
  onRejectOffer,
}) => {
  const [remainingMs, setRemainingMs] = useState<number>(OFFER_TTL_MS);
  const onRejectOfferRef = useRef(onRejectOffer);

  useEffect(() => {
    onRejectOfferRef.current = onRejectOffer;
  }, [onRejectOffer]);

  useEffect(() => {
    const startedAt = Date.now();
    let expired = false;

    const tickId = window.setInterval(() => {
      const nextRemaining = Math.max(0, OFFER_TTL_MS - (Date.now() - startedAt));
      setRemainingMs(nextRemaining);

      if (nextRemaining <= 0 && !expired) {
        expired = true;
        window.clearInterval(tickId);
        onRejectOfferRef.current(offer.id);
      }
    }, 250);

    return () => window.clearInterval(tickId);
  }, [offer.id]);

  const remainingSec = Math.ceil(remainingMs / 1000);
  const progressPct = Math.max(0, Math.min(100, (remainingMs / OFFER_TTL_MS) * 100));
  const priceDiff = +(offer.offeredPrice - referencePrice).toFixed(2);
  const isExpiringSoon = remainingSec <= 8;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`rounded-xl bg-slate-900/95 border overflow-hidden shadow-lg ${
        isBestPrice
          ? 'border-emerald-500/50 ring-1 ring-emerald-500/20'
          : isFastest
            ? 'border-amber-500/50 ring-1 ring-amber-500/20'
            : 'border-slate-800'
      }`}
    >
      {/* Barra de vigencia (30s countdown) */}
      <div className="h-1.5 w-full bg-slate-950 overflow-hidden">
        <div
          className={`h-full transition-all duration-200 ${
            isExpiringSoon
              ? 'bg-rose-500'
              : isBestPrice
                ? 'bg-emerald-500'
                : 'bg-amber-400'
          }`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="p-3.5 space-y-3">
        {/* Etiquetas destacadas + contador */}
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {isFastest && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wide">
                <Zap className="w-3 h-3" />
                Más rápida
              </span>
            )}
            {isBestPrice && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wide">
                <Award className="w-3 h-3" />
                Mejor precio
              </span>
            )}
            {offer.isCounterOffer ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold">
                Contraoferta
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3" />
                Aceptó tu tarifa
              </span>
            )}
          </div>

          <span
            className={`inline-flex items-center gap-1 text-[11px] font-mono tabular-nums font-bold ${
              isExpiringSoon ? 'text-rose-400' : 'text-slate-400'
            }`}
          >
            <Timer className="w-3 h-3" />
            {remainingSec}s
          </span>
        </div>

        {/* Info del conductor y precio */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-black text-white truncate">
                {offer.driverName}
              </p>
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-400 font-mono tabular-nums shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {offer.rating.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold shrink-0">
                ({offer.tripsCount} viajes)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1 truncate">
                <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {offer.vehicleName}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 font-mono text-[11px] font-bold text-slate-200 tracking-wider">
                {offer.plate}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                <Clock className="w-3 h-3 text-emerald-400" />
                Llega en {offer.etaMinutes} min
              </span>
              <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                <MapPin className="w-3 h-3 text-slate-500" />
                {formatDistance(offer.distanceMeters)}
              </span>
              <span className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-500">
                <Phone className="w-3 h-3" />
                {offer.phone}
              </span>
            </div>
          </div>

          {/* Precio ofertado */}
          <div className="text-right shrink-0">
            <div className="font-mono tabular-nums text-2xl font-black text-white leading-none">
              ${offer.offeredPrice.toFixed(2)}
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
              USD
            </div>
            {Math.abs(priceDiff) >= 0.01 && (
              <div
                className={`text-[10px] font-mono tabular-nums font-bold mt-1 ${
                  priceDiff > 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {priceDiff > 0
                  ? `+$${priceDiff.toFixed(2)}`
                  : `-$${Math.abs(priceDiff).toFixed(2)}`}
              </div>
            )}
          </div>
        </div>

        {/* Botones táctiles de 1 toque */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => onRejectOffer(offer.id)}
            className="min-h-[44px] px-3 rounded-xl bg-slate-950 hover:bg-rose-500/15 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>Descartar</span>
          </button>

          <button
            type="button"
            onClick={() => onAcceptOffer(offer)}
            className="min-h-[44px] px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all active:scale-95 shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Aceptar ${offer.offeredPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const SaraDriverNegotiationDrawer: React.FC<SaraDriverNegotiationDrawerProps> = ({
  offers,
  referencePrice,
  onAcceptOffer,
  onRejectOffer,
  onBoostPrice,
  onCancelSearch,
  onRadiusChange,
  vehicleLabel,
}) => {
  const { fastestOfferId, bestPriceOfferId } = useMemo(() => {
    if (offers.length === 0) {
      return { fastestOfferId: null as string | null, bestPriceOfferId: null as string | null };
    }

    let fastest = offers[0];
    let bestPrice = offers[0];

    for (const offer of offers) {
      if (
        offer.etaMinutes < fastest.etaMinutes ||
        (offer.etaMinutes === fastest.etaMinutes && offer.distanceMeters < fastest.distanceMeters)
      ) {
        fastest = offer;
      }
      if (
        offer.offeredPrice < bestPrice.offeredPrice ||
        (offer.offeredPrice === bestPrice.offeredPrice && offer.etaMinutes < bestPrice.etaMinutes)
      ) {
        bestPrice = offer;
      }
    }

    return {
      fastestOfferId: fastest.id,
      bestPriceOfferId: bestPrice.id,
    };
  }, [offers]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl overflow-hidden"
    >
      {/* Cabecera del Drawer */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate">
              {offers.length === 0
                ? 'Buscando conductores cercanos'
                : `${offers.length} ${offers.length === 1 ? 'oferta disponible' : 'ofertas en tiempo real'}`}
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            {vehicleLabel ? `${vehicleLabel} · ` : ''}
            Tu oferta base:{' '}
            <span className="font-mono tabular-nums font-bold text-amber-400">
              ${referencePrice.toFixed(2)} USD
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={onCancelSearch}
          className="min-h-[44px] px-3 rounded-xl bg-slate-800/90 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
        >
          <X className="w-4 h-4" />
          <span>Cancelar</span>
        </button>
      </div>

      {/* Cuerpo dinámico: Radar vs Cascada de Contraofertas */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {offers.length === 0 ? (
            <RadarSearchingView
              key="radar-searching-view"
              onBoostPrice={onBoostPrice}
              onRadiusChange={onRadiusChange}
            />
          ) : (
            <motion.div
              key="offers-cascade"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <AnimatePresence initial={false}>
                {offers.map((offer) => (
                  <OfferCascadeCard
                    key={offer.id}
                    offer={offer}
                    referencePrice={referencePrice}
                    isFastest={offer.id === fastestOfferId}
                    isBestPrice={offer.id === bestPriceOfferId}
                    onAcceptOffer={onAcceptOffer}
                    onRejectOffer={onRejectOffer}
                  />
                ))}
              </AnimatePresence>

              {/* Opción de acelerar incluso con ofertas activas */}
              {onBoostPrice && (
                <button
                  type="button"
                  onClick={() => onBoostPrice(0.5)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-amber-500/15 border border-slate-800 hover:border-amber-500/40 text-amber-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>⚡ Subir oferta +$0.50 para atraer más conductores</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SaraDriverNegotiationDrawer;
