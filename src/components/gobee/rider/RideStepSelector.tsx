'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowUpDown,
  Banknote,
  Bike,
  Car,
  CreditCard,
  Loader2,
  MapPin,
  Minus,
  Package,
  Plus,
  QrCode,
  Search,
  Sparkles,
  Truck,
} from 'lucide-react';
import type { SugerenciaDireccion } from '@/lib/services/saraFreightRoutingService';
import {
  GOBEE_BRAND,
  GOBEE_CATEGORIES,
  GOBEE_CATEGORY_MAP,
  type GobeeCategoryId,
  type GobeeServerQuote,
} from '@/lib/gobee/gobeeTypes';

export interface RideStepSelectorProps {
  step: 1 | 2;
  onStepChange: (step: 1 | 2) => void;
  originText: string;
  destinationText: string;
  originSuggestions: SugerenciaDireccion[];
  destinationSuggestions: SugerenciaDireccion[];
  isSearchingOrigin: boolean;
  isSearchingDest: boolean;
  isCalculatingRoute: boolean;
  onOriginTextChange: (val: string) => void;
  onDestinationTextChange: (val: string) => void;
  onSelectOriginSuggestion: (sug: SugerenciaDireccion) => void;
  onSelectDestinationSuggestion: (sug: SugerenciaDireccion) => void;
  onSwapPoints: () => void;
  onActivateMagneticPin: (target: 'origin' | 'destination') => void;
  selectedCategory: GobeeCategoryId;
  onSelectCategory: (cat: GobeeCategoryId) => void;
  quotesByCategory: Partial<Record<GobeeCategoryId, GobeeServerQuote>>;
  pricingMode: 'fixed' | 'offer';
  onPricingModeChange: (mode: 'fixed' | 'offer') => void;
  offerPriceUSD: number;
  onOfferPriceChange: (price: number) => void;
  paymentMethod: 'efectivo' | 'kushki' | 'deuna';
  onPaymentMethodChange: (method: 'efectivo' | 'kushki' | 'deuna') => void;
  cargoMaterial: string;
  cargoWeightTon: number;
  onCargoMaterialChange: (mat: string) => void;
  onCargoWeightChange: (ton: number) => void;
  canProceedToStep2: boolean;
  isSubmitting: boolean;
  onRequestRide: () => void;
}

const CATEGORY_ICONS: Record<GobeeCategoryId, React.ReactNode> = {
  gobee_go: <Car className="w-5 h-5" />,
  gobee_xl: <Car className="w-5 h-5 stroke-[2.4]" />,
  gobee_express: <Bike className="w-5 h-5" />,
  gobee_cargo: <Truck className="w-5 h-5" />,
};

const CARGO_MATERIALS = [
  'Cemento (Sacos)',
  'Arena / Ripio',
  'Varillas de Acero',
  'Bloques / Ladrillos',
  'Acabados / Cerámica',
  'Otros Materiales',
];

export function RideStepSelector({
  step,
  onStepChange,
  originText,
  destinationText,
  originSuggestions,
  destinationSuggestions,
  isSearchingOrigin,
  isSearchingDest,
  isCalculatingRoute,
  onOriginTextChange,
  onDestinationTextChange,
  onSelectOriginSuggestion,
  onSelectDestinationSuggestion,
  onSwapPoints,
  onActivateMagneticPin,
  selectedCategory,
  onSelectCategory,
  quotesByCategory,
  pricingMode,
  onPricingModeChange,
  offerPriceUSD,
  onOfferPriceChange,
  paymentMethod,
  onPaymentMethodChange,
  cargoMaterial,
  cargoWeightTon,
  onCargoMaterialChange,
  onCargoWeightChange,
  canProceedToStep2,
  isSubmitting,
  onRequestRide,
}: RideStepSelectorProps) {
  const [focusedField, setFocusedField] = useState<'origin' | 'dest' | null>(null);
  const activeQuote = quotesByCategory[selectedCategory];
  const activeCatConfig = GOBEE_CATEGORY_MAP[selectedCategory];

  const finalPrice =
    pricingMode === 'offer' && offerPriceUSD > 0
      ? offerPriceUSD
      : activeQuote?.fixedFareUSD ?? activeCatConfig.minFareUSD;

  return (
    <div className="relative z-20 -mt-5 rounded-t-[28px] bg-[#FAFAFA] text-[#111827] shadow-[0_-10px_30px_rgba(17,24,39,0.12)] border-t border-black/5 px-4 pt-3 pb-6 max-w-2xl mx-auto w-full">
      {/* Manija táctil del Bottom Sheet */}
      <div className="w-12 h-1.5 rounded-full bg-neutral-300 mx-auto mb-3" />

      {/* Indicador de pasos */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {step === 2 && (
            <button
              type="button"
              onClick={() => onStepChange(1)}
              aria-label="Volver a origen y destino"
              className="min-w-[36px] min-h-[36px] rounded-xl bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#111827]" />
            </button>
          )}
          <div>
            <h1 className="text-base font-black tracking-tight text-[#111827]">
              {step === 1 ? '¿A dónde vamos hoy?' : 'Elige tu Gobee'}
            </h1>
            <p className="text-[11px] text-neutral-500 font-medium">
              {step === 1
                ? 'Paso 1 de 2 · Define recogida y destino'
                : `Paso 2 de 2 · ${activeQuote ? `${activeQuote.distanceKm.toFixed(1)} km · ~${activeQuote.durationMin} min` : 'Calculando ruta...'}`}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#111827] text-[#FDBE3B]">
          Paso {step}/2
        </span>
      </div>

      {step === 1 ? (
        <div className="space-y-3">
          {/* Caja unificada Origen / Destino */}
          <div className="relative rounded-2xl bg-white border border-neutral-200 shadow-sm p-3 space-y-2.5">
            {/* Origen */}
            <div className="relative flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 shrink-0" />
              <input
                type="text"
                value={originText}
                onFocus={() => setFocusedField('origin')}
                onChange={(e) => onOriginTextChange(e.target.value)}
                placeholder="Punto de recogida"
                className="w-full min-h-[44px] bg-transparent text-sm font-semibold text-[#111827] placeholder:text-neutral-400 outline-none"
              />
              {isSearchingOrigin && <Loader2 className="w-4 h-4 animate-spin text-neutral-400 shrink-0" />}
              <button
                type="button"
                onClick={() => onActivateMagneticPin('origin')}
                title="Fijar origen con pin magnético"
                className="min-w-[36px] min-h-[36px] rounded-xl bg-neutral-100 hover:bg-[#FDBE3B]/30 flex items-center justify-center text-[#111827] shrink-0 cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 pl-1">
              <div className="h-px flex-1 bg-neutral-200" />
              <button
                type="button"
                onClick={onSwapPoints}
                aria-label="Intercambiar origen y destino"
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Destino */}
            <div className="relative flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-sm bg-[#FDBE3B] ring-4 ring-[#FDBE3B]/30 shrink-0" />
              <input
                type="text"
                value={destinationText}
                onFocus={() => setFocusedField('dest')}
                onChange={(e) => onDestinationTextChange(e.target.value)}
                placeholder="¿A dónde quieres ir o enviar?"
                className="w-full min-h-[44px] bg-transparent text-sm font-semibold text-[#111827] placeholder:text-neutral-400 outline-none"
              />
              {isSearchingDest && <Loader2 className="w-4 h-4 animate-spin text-neutral-400 shrink-0" />}
              <button
                type="button"
                onClick={() => onActivateMagneticPin('destination')}
                title="Fijar destino con pin magnético"
                className="min-w-[36px] min-h-[36px] rounded-xl bg-neutral-100 hover:bg-[#FDBE3B]/30 flex items-center justify-center text-[#111827] shrink-0 cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lista de sugerencias predictivas */}
          {focusedField === 'origin' && originSuggestions.length > 0 && (
            <ul className="rounded-2xl bg-white border border-neutral-200 shadow-lg divide-y divide-neutral-100 max-h-48 overflow-y-auto">
              {originSuggestions.map((sug, idx) => (
                <li key={`${sug.titulo}-${idx}`}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectOriginSuggestion(sug);
                      setFocusedField(null);
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-[#FDBE3B]/15 flex items-start gap-2.5 cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#111827] truncate">{sug.titulo}</p>
                      <p className="text-[11px] text-neutral-500 truncate">
                        {[sug.ciudad, sug.provincia].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {focusedField === 'dest' && destinationSuggestions.length > 0 && (
            <ul className="rounded-2xl bg-white border border-neutral-200 shadow-lg divide-y divide-neutral-100 max-h-48 overflow-y-auto">
              {destinationSuggestions.map((sug, idx) => (
                <li key={`${sug.titulo}-${idx}`}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectDestinationSuggestion(sug);
                      setFocusedField(null);
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-[#FDBE3B]/15 flex items-start gap-2.5 cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-[#FDBE3B] mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#111827] truncate">{sug.titulo}</p>
                      <p className="text-[11px] text-neutral-500 truncate">
                        {[sug.ciudad, sug.provincia].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            disabled={!canProceedToStep2 || isCalculatingRoute}
            onClick={() => onStepChange(2)}
            className="w-full min-h-[52px] rounded-2xl bg-[#FDBE3B] hover:bg-[#F5B024] disabled:opacity-45 text-[#111827] font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isCalculatingRoute ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Calculando ruta y tarifas...</span>
              </>
            ) : (
              <span>Ver categorías Gobee</span>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {/* Selector de las 4 categorías oficiales Gobee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {GOBEE_CATEGORIES.map((cat) => {
              const quote = quotesByCategory[cat.id];
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className={`min-h-[68px] text-left rounded-2xl p-3 border-2 transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#111827] text-white border-[#FDBE3B] shadow-md'
                      : 'bg-white text-[#111827] border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#FDBE3B] text-[#111827]' : 'bg-neutral-100 text-[#111827]'
                      }`}
                    >
                      {CATEGORY_ICONS[cat.id]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm truncate">{cat.name}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-white/15 text-[#FDBE3B]' : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {cat.etaBaseMin} min
                        </span>
                      </div>
                      <p className={`text-[11px] truncate ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        {cat.tagline} · {cat.capacityLabel}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-mono tabular-nums font-black text-base ${isSelected ? 'text-[#FDBE3B]' : 'text-[#111827]'}`}>
                      ${(quote?.fixedFareUSD ?? cat.minFareUSD).toFixed(2)}
                    </p>
                    <p className={`text-[10px] ${isSelected ? 'text-neutral-400' : 'text-neutral-400'}`}>USD</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Parámetros de carga solo cuando se selecciona Gobee Cargo */}
          {selectedCategory === 'gobee_cargo' && (
            <div className="rounded-2xl bg-amber-50/80 border border-[#FDBE3B]/60 p-3 grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-600 flex items-center gap-1 mb-1">
                  <Package className="w-3 h-3" /> Material de obra
                </label>
                <select
                  value={cargoMaterial}
                  onChange={(e) => onCargoMaterialChange(e.target.value)}
                  className="w-full min-h-[40px] rounded-xl bg-white border border-neutral-200 px-2.5 text-xs font-semibold text-[#111827]"
                >
                  {CARGO_MATERIALS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-600 mb-1 block">
                  Peso estimado (Ton)
                </label>
                <input
                  type="number"
                  min={0.5}
                  max={32}
                  step={0.5}
                  value={cargoWeightTon}
                  onChange={(e) => onCargoWeightChange(Math.max(0.5, Number(e.target.value) || 1))}
                  className="w-full min-h-[40px] rounded-xl bg-white border border-neutral-200 px-3 text-xs font-mono tabular-nums font-bold text-[#111827]"
                />
              </div>
            </div>
          )}

          {/* Tarifa Fija vs Propuesta de Oferta */}
          <div className="rounded-2xl bg-white border border-neutral-200 p-3 space-y-2.5">
            <div className="grid grid-cols-2 gap-1.5 bg-neutral-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => onPricingModeChange('fixed')}
                className={`min-h-[38px] rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  pricingMode === 'fixed' ? 'bg-[#111827] text-white shadow' : 'text-neutral-600'
                }`}
              >
                Tarifa Fija Oficial
              </button>
              <button
                type="button"
                onClick={() => onPricingModeChange('offer')}
                className={`min-h-[38px] rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  pricingMode === 'offer' ? 'bg-[#111827] text-[#FDBE3B] shadow' : 'text-neutral-600'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Proponer Oferta
              </button>
            </div>

            {pricingMode === 'offer' && (
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    onOfferPriceChange(
                      Math.max(activeQuote?.minBidUSD ?? activeCatConfig.minFareUSD, Number((offerPriceUSD - 0.5).toFixed(2)))
                    )
                  }
                  className="min-w-[44px] min-h-[44px] rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-[#111827] cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <div className="font-mono tabular-nums text-2xl font-black text-[#111827]">
                    ${offerPriceUSD.toFixed(2)}
                  </div>
                  <p className="text-[10px] text-neutral-500">
                    Rango sugerido: ${(activeQuote?.minBidUSD ?? activeCatConfig.minFareUSD).toFixed(2)} – $
                    {(activeQuote?.maxBidUSD ?? activeCatConfig.minFareUSD * 1.35).toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onOfferPriceChange(
                      Math.min(activeQuote?.maxBidUSD ?? 500, Number((offerPriceUSD + 0.5).toFixed(2)))
                    )
                  }
                  className="min-w-[44px] min-h-[44px] rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-[#111827] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Método de pago */}
            <div className="flex items-center gap-1.5 pt-1">
              {(
                [
                  { id: 'efectivo', label: 'Efectivo', icon: <Banknote className="w-3.5 h-3.5" /> },
                  { id: 'kushki', label: 'Tarjeta', icon: <CreditCard className="w-3.5 h-3.5" /> },
                  { id: 'deuna', label: 'Deuna!', icon: <QrCode className="w-3.5 h-3.5" /> },
                ] as const
              ).map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => onPaymentMethodChange(pm.id)}
                  className={`flex-1 min-h-[40px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                    paymentMethod === pm.id
                      ? 'bg-[#FDBE3B]/20 border-[#FDBE3B] text-[#111827]'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                  }`}
                >
                  {pm.icon}
                  <span>{pm.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Botón Primario Ámbar Miel */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onRequestRide}
            className="w-full min-h-[54px] rounded-2xl bg-[#FDBE3B] hover:bg-[#F5B024] disabled:opacity-50 text-[#111827] font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Buscando conductor Gobee...</span>
              </>
            ) : (
              <span>
                Pedir {activeCatConfig.name} · ${finalPrice.toFixed(2)} USD
              </span>
            )}
          </button>

          <p className="text-center text-[10px] font-medium text-neutral-400">{GOBEE_BRAND.seal}</p>
        </div>
      )}
    </div>
  );
}
