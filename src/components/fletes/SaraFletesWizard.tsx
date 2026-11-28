'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  MapPin,
  Plus,
  Minus,
  Truck,
  Users,
  ChevronRight,
  ChevronDown,
  Loader2,
  SlidersHorizontal
} from 'lucide-react';
import {
  CategoriaVehiculo,
  SaraFreightPricingService
} from '@/lib/services/saraFreightPricingService';
import type { SugerenciaDireccion } from '@/lib/services/saraFreightRoutingService';
import { AssignVehicleResult } from '@/lib/fletes/assignVehicleCategory';

export interface MaterialOption {
  id: string;
  name: string;
  icon: string;
  defaultUnit: 'TON' | 'M3';
  description: string;
  categoria: 'mudanza' | 'mercaderia' | 'obra';
  isBulk?: boolean;
  isLong?: boolean;
}

export const CATEGORIAS_MATERIALES = [
  { id: 'mudanza', label: 'Mudanza', icon: '🛋️', badge: 'Hogar / Muebles' },
  { id: 'mercaderia', label: 'Mercadería', icon: '📦', badge: 'Cajas / Negocios' },
  { id: 'obra', label: 'Obra', icon: '🏗️', badge: 'Materiales / Áridos' }
] as const;

export const MATERIALES_OBRA: MaterialOption[] = [
  { id: 'mudanza_muebles', name: 'Mudanza / Muebles', icon: '🛋️', defaultUnit: 'TON', description: 'Muebles, electrodomésticos, departamento o casa', categoria: 'mudanza' },
  { id: 'mercaderia_cajas', name: 'Mercadería / Cajas', icon: '📦', defaultUnit: 'TON', description: 'Cajas, pallets, entregas comerciales', categoria: 'mercaderia' },
  { id: 'arena_ripio', name: 'Arena / Ripio', icon: '🪨', defaultUnit: 'M3', description: 'Áridos lavados a granel o sacos', categoria: 'obra', isBulk: true },
  { id: 'cemento_sacos', name: 'Cemento (Sacos)', icon: '🧱', defaultUnit: 'TON', description: 'Sacos de 50kg normalizados', categoria: 'obra' },
  { id: 'bloques_ladrillos', name: 'Bloques / Ladrillos', icon: '🧱', defaultUnit: 'TON', description: 'Paletas o millares apilados', categoria: 'obra' },
  { id: 'varillas_acero', name: 'Varillas de Acero', icon: '🏗️', defaultUnit: 'TON', description: 'Barras corrugadas 6m - 12m', categoria: 'obra', isLong: true },
  { id: 'escombros', name: 'Desalojo de Escombros', icon: '🚜', defaultUnit: 'M3', description: 'Residuos de excavación y obra', categoria: 'obra', isBulk: true }
];

export const DESTINOS_FRECUENTES = [
  {
    nombre: 'Ferretería Central (Cariamanga)',
    coords: [-4.3292, -79.5548] as [number, number],
    canton: 'Cariamanga',
    provincia: 'Loja',
    tipo: 'ferreteria'
  },
  {
    nombre: 'Cantera / Mina de Pétreos (Bella María)',
    coords: [-3.9650, -79.2150] as [number, number],
    canton: 'Loja',
    provincia: 'Loja',
    tipo: 'cantera'
  },
  {
    nombre: 'Escombrera Municipal Autorizada',
    coords: [-4.3180, -79.5700] as [number, number],
    canton: 'Cariamanga',
    provincia: 'Loja',
    tipo: 'escombrera'
  },
  {
    nombre: 'Obra Norte (Zona Residencial)',
    coords: [-4.3210, -79.5620] as [number, number],
    canton: 'Cariamanga',
    provincia: 'Loja',
    tipo: 'obra'
  },
  {
    nombre: 'Terminal Contecon (Puerto GYE)',
    coords: [-2.2844, -79.9011] as [number, number],
    canton: 'Guayaquil',
    provincia: 'Guayas',
    tipo: 'puerto'
  },
  {
    nombre: 'Parque Industrial Quitumbe (UIO)',
    coords: [-0.2917, -78.5522] as [number, number],
    canton: 'Quito',
    provincia: 'Pichincha',
    tipo: 'industrial'
  }
];

type LoadCategory = 'mudanza' | 'mercaderia' | 'obra';

interface FleetCardOption {
  id: CategoriaVehiculo;
  icon: string;
  title: string;
  subtitle: string;
  defaultWeight: number;
  popularFor?: LoadCategory;
}

const FLEET_CARDS_UNIVERSAL: FleetCardOption[] = [
  {
    id: 'PICKUP_1T',
    icon: '🛻',
    title: 'Camioneta',
    subtitle: '1–2 muebles o cajas · 1.2T',
    defaultWeight: 0.8,
    popularFor: 'mercaderia'
  },
  {
    id: 'FURGON_3T',
    icon: '🚐',
    title: 'Furgón Cerrado',
    subtitle: 'Mudanza pequeña · Protegido',
    defaultWeight: 1.5,
    popularFor: 'mudanza'
  },
  {
    id: 'CAMION_5T',
    icon: '🚚',
    title: 'Camión Mediano',
    subtitle: 'Depto. 1–2 hab. · Hasta 5T',
    defaultWeight: 3.5
  },
  {
    id: 'CAMION_10T',
    icon: '🚛',
    title: 'Camión Grande',
    subtitle: 'Casa completa · Hasta 10T',
    defaultWeight: 8.0
  }
];

const FLEET_CARDS_OBRA: FleetCardOption[] = [
  {
    id: 'PICKUP_1T',
    icon: '🛻',
    title: 'Camioneta',
    subtitle: 'Ferretería / 20 sacos · 1.2T',
    defaultWeight: 1.0
  },
  {
    id: 'CAMION_5T',
    icon: '🚚',
    title: 'Camión 5T',
    subtitle: 'Bloques / Cemento · 5T',
    defaultWeight: 4.0
  },
  {
    id: 'VOLQUETA_V3A',
    icon: '🚜',
    title: 'Volqueta Obra',
    subtitle: 'Áridos / Escombros · 14m³',
    defaultWeight: 8.0,
    popularFor: 'obra'
  },
  {
    id: 'CAMION_10T',
    icon: '🚛',
    title: 'Plataforma 10T',
    subtitle: 'Varillas / Carga larga · 10T',
    defaultWeight: 10.0
  }
];

interface SaraFletesWizardProps {
  activeStep: number;
  setActiveStep: (step: number) => void;

  // Paso 1: Ruta
  originText: string;
  destinationText: string;
  onOriginChange: (val: string) => void;
  onDestinationChange: (val: string) => void;
  onSelectDestinoFrecuente: (dest: typeof DESTINOS_FRECUENTES[0]) => void;
  onSwapRoute: () => void;
  onUseGpsOrigin: () => void;
  onMarkOriginOnMap: () => void;
  onMarkDestOnMap: () => void;
  mapClickMode: 'origen' | 'destino' | null;
  originSuggestions?: SugerenciaDireccion[];
  destinationSuggestions?: SugerenciaDireccion[];
  showOriginSuggestions?: boolean;
  showDestSuggestions?: boolean;
  isSearchingOrigin?: boolean;
  isSearchingDest?: boolean;
  onSelectOriginSuggestion?: (sug: SugerenciaDireccion) => void;
  onSelectDestinationSuggestion?: (sug: SugerenciaDireccion) => void;

  // Paso 2: Carga, Vehículo, Extras opcionales y Tarifa
  selectedMaterial: string;
  onSelectMaterial: (matName: string) => void;
  weight: number;
  onWeightChange: (val: number) => void;
  unitType: 'TON' | 'M3';
  onUnitTypeChange: (unit: 'TON' | 'M3') => void;
  sacosCementoCount: number;
  onSacosCementoChange: (val: number) => void;

  helpersCount: number;
  onHelpersChange: (count: number) => void;
  tasaBotaderoEnabled: boolean;
  onTasaBotaderoToggle: (enabled: boolean) => void;

  suggestedPrice: number;
  proposedPrice: number;
  onAdjustPrice: (delta: number) => void;
  onSetPrice?: (price: number) => void;
  acceptanceProbability: { label: string; color: string };
  isCalculatingRoute: boolean;
  onTransmitOffer: () => void;

  assignedVehicleInfo: AssignVehicleResult;
  selectedVehicleType: CategoriaVehiculo;
  onSelectVehicleType: (cat: CategoriaVehiculo) => void;
  distanciaKm?: number;
  duracionMinutos?: number;
}

export function SaraFletesWizard({
  activeStep,
  setActiveStep,
  originText,
  destinationText,
  onOriginChange,
  onDestinationChange,
  onSwapRoute,
  onUseGpsOrigin,
  onMarkOriginOnMap,
  onMarkDestOnMap,
  mapClickMode,
  originSuggestions = [],
  destinationSuggestions = [],
  showOriginSuggestions = false,
  showDestSuggestions = false,
  isSearchingOrigin = false,
  isSearchingDest = false,
  onSelectOriginSuggestion,
  onSelectDestinationSuggestion,
  selectedMaterial,
  onSelectMaterial,
  weight,
  onWeightChange,
  unitType,
  onUnitTypeChange,
  helpersCount,
  onHelpersChange,
  tasaBotaderoEnabled,
  onTasaBotaderoToggle,
  suggestedPrice,
  proposedPrice,
  onAdjustPrice,
  onSetPrice,
  acceptanceProbability,
  isCalculatingRoute,
  onTransmitOffer,
  selectedVehicleType,
  onSelectVehicleType,
  distanciaKm = 2.4,
  duracionMinutos = 8
}: SaraFletesWizardProps) {
  // Flujo global simplificado a 2 pasos (1: Ruta, 2: Qué mueves + Vehículo + Pedir)
  const currentStep = activeStep <= 1 ? 1 : 2;

  const [loadCategory, setLoadCategory] = useState<LoadCategory>(() => {
    const m = (selectedMaterial || '').toLowerCase();
    if (m.includes('mudanza') || m.includes('mueble')) return 'mudanza';
    if (m.includes('mercader') || m.includes('caja')) return 'mercaderia';
    if (m.includes('arena') || m.includes('cemento') || m.includes('escombro') || m.includes('varilla') || m.includes('bloque')) {
      return 'obra';
    }
    return 'mudanza';
  });

  const [showExtras, setShowExtras] = useState(false);
  const [showOfferEditor, setShowOfferEditor] = useState(false);

  const vehicleCards = loadCategory === 'obra' ? FLEET_CARDS_OBRA : FLEET_CARDS_UNIVERSAL;

  // Calcular precio estimado real para cada tarjeta de vehículo
  const cardPrices = useMemo(() => {
    const map: Partial<Record<CategoriaVehiculo, number>> = {};
    for (const card of vehicleCards) {
      const calcWeight = loadCategory === 'obra' ? weight : card.defaultWeight;
      const res = SaraFreightPricingService.calcularTarifa(
        distanciaKm || 2.4,
        calcWeight,
        card.id,
        selectedMaterial || 'Mudanza / Muebles'
      );
      map[card.id] = res.tarifaSugeridaUSD;
    }
    return map;
  }, [vehicleCards, distanciaKm, weight, loadCategory, selectedMaterial]);

  const extrasTotalUSD = helpersCount * 15 + (loadCategory === 'obra' && tasaBotaderoEnabled ? 12 : 0);
  const finalDisplayPrice = +((proposedPrice || suggestedPrice || 2.8) + extrasTotalUSD).toFixed(2);

  const handleSelectCategory = (cat: LoadCategory) => {
    setLoadCategory(cat);
    if (cat === 'mudanza') {
      onSelectMaterial('Mudanza / Muebles');
      onUnitTypeChange('TON');
      onWeightChange(1.5);
      onTasaBotaderoToggle(false);
      onSelectVehicleType('FURGON_3T');
    } else if (cat === 'mercaderia') {
      onSelectMaterial('Mercadería / Cajas');
      onUnitTypeChange('TON');
      onWeightChange(1.0);
      onTasaBotaderoToggle(false);
      onSelectVehicleType('PICKUP_1T');
    } else {
      onSelectMaterial('Arena / Ripio');
      onUnitTypeChange('M3');
      onWeightChange(4);
      onSelectVehicleType('VOLQUETA_V3A');
    }
  };

  return (
    <div className="space-y-3">
      {/* ===================================================================== */}
      {/* PASO 1: RUTA (ORIGEN Y DESTINO CON INTERSECCIONES EN VIVO)            */}
      {/* ===================================================================== */}
      {currentStep === 1 && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-stretch gap-3">
              {/* Línea visual verde -> ámbar */}
              <div className="flex flex-col items-center py-2 shrink-0">
                <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></span>
                <div className="w-0.5 flex-1 bg-gradient-to-b from-emerald-500 via-slate-600 to-[#FDBE3B] my-1"></div>
                <span className="w-3 h-3 rounded-full bg-[#FDBE3B] ring-4 ring-[#FDBE3B]/20"></span>
              </div>

              {/* Inputs Origen y Destino */}
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="text-[11px] font-black uppercase text-emerald-400 tracking-wider truncate">
                      Punto de Carga
                    </label>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={onMarkOriginOnMap}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          mapClickMode === 'origen'
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : 'text-emerald-300 bg-emerald-950/60 border border-emerald-500/35 hover:border-emerald-400'
                        }`}
                      >
                        📍 Mapa
                      </button>
                      <button
                        type="button"
                        onClick={onUseGpsOrigin}
                        className="text-[10px] text-sky-300 bg-sky-950/60 border border-sky-500/35 hover:border-sky-400 px-2 py-0.5 rounded-md font-bold cursor-pointer"
                      >
                        GPS
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={originText}
                      onChange={(e) => onOriginChange(e.target.value)}
                      placeholder="¿Dónde recogemos tu carga o mudanza?"
                      className="w-full min-h-[42px] bg-slate-900 border border-slate-700/80 rounded-xl pl-3 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 select-text"
                    />
                    {isSearchingOrigin ? (
                      <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
                    ) : originText ? (
                      <button
                        type="button"
                        onClick={() => onOriginChange('')}
                        aria-label="Limpiar punto de carga"
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center justify-center cursor-pointer"
                      >
                        ×
                      </button>
                    ) : null}

                    {showOriginSuggestions && originSuggestions.length > 0 && onSelectOriginSuggestion && (
                      <ul className="mt-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 shadow-2xl divide-y divide-slate-800 max-h-44 overflow-y-auto z-30">
                        {originSuggestions.map((sug, idx) => (
                          <li key={`orig-sug-${idx}`}>
                            <button
                              type="button"
                              onClick={() => onSelectOriginSuggestion(sug)}
                              className="w-full text-left px-3 py-2 hover:bg-emerald-500/15 flex items-start gap-2 transition-colors cursor-pointer"
                            >
                              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-white truncate">{sug.titulo}</p>
                                {(sug.subtitulo || sug.ciudad) && (
                                  <p className="text-[10px] text-slate-400 truncate">
                                    {sug.subtitulo || [sug.ciudad, sug.provincia].filter(Boolean).join(', ')}
                                  </p>
                                )}
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="text-[11px] font-black uppercase text-[#FDBE3B] tracking-wider truncate">
                      Punto de Entrega
                    </label>
                    <button
                      type="button"
                      onClick={onMarkDestOnMap}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer shrink-0 ${
                        mapClickMode === 'destino'
                          ? 'bg-[#FDBE3B] text-[#111827] font-black'
                          : 'text-[#FDBE3B] bg-amber-950/50 border border-[#FDBE3B]/35 hover:border-[#FDBE3B]'
                      }`}
                    >
                      📍 Mapa
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={destinationText}
                      onChange={(e) => onDestinationChange(e.target.value)}
                      placeholder="¿A dónde lo llevamos? (calle o intersección)"
                      className="w-full min-h-[42px] bg-slate-900 border border-slate-700/80 rounded-xl pl-3 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FDBE3B] select-text"
                    />
                    {isSearchingDest ? (
                      <Loader2 className="w-3.5 h-3.5 text-[#FDBE3B] animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
                    ) : destinationText ? (
                      <button
                        type="button"
                        onClick={() => onDestinationChange('')}
                        aria-label="Limpiar punto de entrega"
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center justify-center cursor-pointer"
                      >
                        ×
                      </button>
                    ) : null}

                    {showDestSuggestions && destinationSuggestions.length > 0 && onSelectDestinationSuggestion && (
                      <ul className="mt-1.5 rounded-xl bg-slate-900 border border-[#FDBE3B]/45 shadow-2xl divide-y divide-slate-800 max-h-44 overflow-y-auto z-30">
                        {destinationSuggestions.map((sug, idx) => (
                          <li key={`dest-sug-${idx}`}>
                            <button
                              type="button"
                              onClick={() => onSelectDestinationSuggestion(sug)}
                              className="w-full text-left px-3 py-2 hover:bg-[#FDBE3B]/15 flex items-start gap-2 transition-colors cursor-pointer"
                            >
                              <MapPin className="w-3.5 h-3.5 text-[#FDBE3B] shrink-0 mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-white truncate">{sug.titulo}</p>
                                {(sug.subtitulo || sug.ciudad) && (
                                  <p className="text-[10px] text-slate-400 truncate">
                                    {sug.subtitulo || [sug.ciudad, sug.provincia].filter(Boolean).join(', ')}
                                  </p>
                                )}
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón Swap vertical */}
              <div className="flex items-center justify-center shrink-0">
                <button
                  type="button"
                  onClick={onSwapRoute}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#FDBE3B] hover:text-[#111827] text-slate-300 border border-slate-700 flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
                  title="Invertir origen y destino"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveStep(2)}
            disabled={!originText.trim() || !destinationText.trim()}
            className="w-full min-h-[46px] bg-[#FDBE3B] hover:bg-[#F5B024] disabled:bg-slate-800 disabled:text-slate-600 text-[#111827] font-black py-3 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99] cursor-pointer"
          >
            <span>Elegir Vehículo y Precio</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PASO 2: QUÉ MUEVES + VEHÍCULO + EXTRAS OPCIONALES + PEDIR EN 1 TOQUE  */}
      {/* ===================================================================== */}
      {currentStep === 2 && (
        <div className="space-y-2.5 animate-in fade-in duration-200">
          {/* Resumen compacto de ruta (mismo patrón limpio de Viajes y Mandaditos) */}
          <div className="bg-slate-950/90 px-3 py-2 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
            >
              ← Cambiar
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-white truncate">
                🚩 {destinationText || 'Punto de entrega'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                Desde: {originText || 'Punto de carga'}
              </p>
            </div>
            <span className="shrink-0 text-[10px] font-mono font-bold text-[#FDBE3B] bg-[#FDBE3B]/10 border border-[#FDBE3B]/30 px-2 py-0.5 rounded-lg">
              {isCalculatingRoute
                ? '...'
                : `${(distanciaKm || 2.4).toFixed(1)} km · ${duracionMinutos || 8}m`}
            </span>
          </div>

          {/* 1. ¿Qué vas a transportar? (3 botones universales: Mudanza, Mercadería, Obra) */}
          <div className="grid grid-cols-3 gap-1.5">
            {CATEGORIAS_MATERIALES.map((cat) => {
              const active = loadCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`py-2 px-1.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 ${
                    active
                      ? 'bg-[#FDBE3B] text-[#111827] border-[#FDBE3B] shadow-md shadow-amber-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span className="text-lg leading-none">{cat.icon}</span>
                  <span className="text-[11px] font-black leading-tight">{cat.label}</span>
                  <span className={`text-[9px] leading-none truncate max-w-full ${active ? 'text-[#111827]/75 font-bold' : 'text-slate-500'}`}>
                    {cat.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sub-selector compacto SOLO si eligió Obra (sin sobrecargar Mudanza ni Mercadería) */}
          {loadCategory === 'obra' && (
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {[
                  { label: '🪨 Áridos', name: 'Arena / Ripio', unit: 'M3' as const },
                  { label: '🧱 Cemento', name: 'Cemento (Sacos)', unit: 'TON' as const },
                  { label: '🚜 Escombros', name: 'Desalojo de Escombros', unit: 'M3' as const }
                ].map((mat) => {
                  const isSel = selectedMaterial === mat.name;
                  return (
                    <button
                      key={mat.name}
                      type="button"
                      onClick={() => {
                        onSelectMaterial(mat.name);
                        onUnitTypeChange(mat.unit);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 border transition-all cursor-pointer ${
                        isSel
                          ? 'bg-amber-500/20 border-[#FDBE3B] text-[#FDBE3B]'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {mat.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Cantidad aprox.</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onWeightChange(Math.max(1, +(weight - 1).toFixed(1)))}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="min-w-[54px] text-center text-xs font-mono font-black text-[#FDBE3B]">
                    {weight} {unitType === 'M3' ? 'm³' : 'Ton'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onWeightChange(Math.min(30, +(weight + 1).toFixed(1)))}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. Selector visual de vehículo (2x2 con precio inmediato en USD) */}
          <div className="grid grid-cols-2 gap-2">
            {vehicleCards.map((card) => {
              const isSelected = selectedVehicleType === card.id;
              const estPrice = cardPrices[card.id] ?? suggestedPrice ?? 2.8;
              const isPopular = card.popularFor === loadCategory;

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    onSelectVehicleType(card.id);
                    if (loadCategory !== 'obra') {
                      onWeightChange(card.defaultWeight);
                    }
                  }}
                  className={`relative p-2.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-[0.98] ${
                    isSelected
                      ? 'bg-[#FDBE3B]/12 border-[#FDBE3B] ring-1 ring-[#FDBE3B]/50 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-2 right-2 bg-[#FDBE3B] text-[#111827] text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                      Ideal
                    </span>
                  )}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xl leading-none">{card.icon}</span>
                    <span className={`text-sm font-mono font-black ${isSelected ? 'text-[#FDBE3B]' : 'text-white'}`}>
                      ${estPrice.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs font-black text-white leading-tight truncate">{card.title}</p>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">{card.subtitle}</p>
                </button>
              );
            })}
          </div>

          {/* 3. Extras opcionales colapsables (Ayudantes de carga / Botadero en obra) */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowExtras((prev) => !prev)}
              className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-[#FDBE3B]" />
                <span>
                  {helpersCount > 0 || (loadCategory === 'obra' && tasaBotaderoEnabled)
                    ? `Extras activos: ${[
                        helpersCount > 0 ? `${helpersCount} ayudante${helpersCount > 1 ? 's' : ''}` : null,
                        loadCategory === 'obra' && tasaBotaderoEnabled ? 'Botadero' : null
                      ]
                        .filter(Boolean)
                        .join(' + ')}`
                    : '¿Necesitas ayudantes de carga? (Opcional)'}
                </span>
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showExtras ? 'rotate-180' : ''}`} />
            </button>

            {showExtras && (
              <div className="px-3 pb-3 pt-1 border-t border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-white">Ayudantes de carga y descarga</p>
                    <p className="text-[10px] text-slate-400">Ideal para mudanzas y bultos ($15 c/u)</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onHelpersChange(Math.max(0, helpersCount - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center font-mono font-black text-sm text-[#FDBE3B]">
                      {helpersCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => onHelpersChange(Math.min(4, helpersCount + 1))}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {loadCategory === 'obra' && (
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                    <div>
                      <p className="text-xs font-bold text-white">Tasa de Botadero Municipal</p>
                      <p className="text-[10px] text-slate-400">Disposición legal de escombros ($12)</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tasaBotaderoEnabled}
                        onChange={(e) => onTasaBotaderoToggle(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FDBE3B]"></div>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. CTA Principal de 1 toque */}
          <button
            type="button"
            disabled={isCalculatingRoute}
            onClick={onTransmitOffer}
            className="w-full min-h-[48px] bg-[#FDBE3B] hover:bg-[#F5B024] disabled:bg-slate-800 disabled:text-slate-500 text-[#111827] font-black py-3 px-4 rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-between gap-2 text-sm active:scale-[0.99] cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Truck className="w-4 h-4 stroke-[2.5]" />
              <span>
                {loadCategory === 'mudanza'
                  ? 'Pedir Mudanza'
                  : loadCategory === 'mercaderia'
                  ? 'Pedir Envío'
                  : 'Pedir Flete'}
              </span>
            </span>
            <span className="bg-[#111827] text-[#FDBE3B] font-mono font-black text-xs px-2.5 py-1 rounded-xl">
              ${finalDisplayPrice.toFixed(2)} →
            </span>
          </button>

          {/* 5. Acordeón opcional: Ajustar mi oferta (Modo inDrive) */}
          <div className="bg-slate-950/70 rounded-xl border border-slate-800/80 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowOfferEditor((prev) => !prev)}
              className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-bold text-slate-400 hover:text-[#FDBE3B] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Ajustar mi oferta (Modo inDrive)</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${acceptanceProbability.color}`}>
                {acceptanceProbability.label}
              </span>
            </button>

            {showOfferEditor && (
              <div className="px-3 pb-3 pt-1 border-t border-slate-800/70 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onAdjustPrice(-0.5)}
                  className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs cursor-pointer"
                >
                  -$0.50
                </button>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-mono font-black text-[#FDBE3B]">$</span>
                  <input
                    type="number"
                    step="0.50"
                    min="1.00"
                    value={proposedPrice}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && onSetPrice) onSetPrice(val);
                    }}
                    className="w-20 text-base font-mono font-black text-[#FDBE3B] bg-slate-900 border border-slate-700 focus:border-[#FDBE3B] rounded-lg px-1.5 py-1 text-center focus:outline-none select-text"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onAdjustPrice(0.5)}
                    className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs cursor-pointer"
                  >
                    +$0.50
                  </button>
                  <button
                    type="button"
                    onClick={() => onAdjustPrice(1.0)}
                    className="px-2.5 py-2 rounded-xl bg-[#FDBE3B]/20 hover:bg-[#FDBE3B]/30 text-[#FDBE3B] border border-[#FDBE3B]/40 font-black text-xs cursor-pointer"
                  >
                    +$1.00
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
