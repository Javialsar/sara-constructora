'use client';

import React from 'react';
import { 
  ArrowUpDown, 
  MapPin, 
  Sparkles, 
  Plus, 
  Minus, 
  Truck, 
  Users, 
  Trash2, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Info,
  Loader2
} from 'lucide-react';
import { CategoriaVehiculo, CATALOGO_VEHICULOS_SARA } from '@/lib/services/saraFreightPricingService';
import type { SugerenciaDireccion } from '@/lib/services/saraFreightRoutingService';
import { AssignVehicleResult } from '@/lib/fletes/assignVehicleCategory';

export interface MaterialOption {
  id: string;
  name: string;
  icon: string;
  defaultUnit: 'TON' | 'M3';
  description: string;
  categoria: 'aridos' | 'construccion' | 'varios';
  isBulk?: boolean;
  isLong?: boolean;
}

export const CATEGORIAS_MATERIALES = [
  { id: 'aridos', label: 'Áridos y Pétreos', icon: '🪨', badge: 'Cantera / Granel' },
  { id: 'construccion', label: 'Mat. Construcción', icon: '🏗️', badge: 'Obra y Acabados' },
  { id: 'varios', label: 'Varios / Desalojo', icon: '🚜', badge: 'Escombros / Carga' }
] as const;

export const MATERIALES_OBRA: MaterialOption[] = [
  // 1. Áridos y Pétreos
  { id: 'arena_ripio', name: 'Arena / Ripio', icon: '🪨', defaultUnit: 'M3', description: 'Áridos lavados a granel o sacos', categoria: 'aridos', isBulk: true },
  { id: 'piedra_base', name: 'Piedra Base / Bola', icon: '⛰️', defaultUnit: 'M3', description: 'Muros, cimentación y gaviones', categoria: 'aridos', isBulk: true },
  { id: 'lastre_cantera', name: 'Lastre de Cantera', icon: '🚜', defaultUnit: 'M3', description: 'Mejoramiento de subrasante y vías', categoria: 'aridos', isBulk: true },

  // 2. Materiales de Construcción
  { id: 'cemento_sacos', name: 'Cemento (Sacos)', icon: '🧱', defaultUnit: 'TON', description: 'Sacos de 50kg normalizados', categoria: 'construccion' },
  { id: 'bloques_ladrillos', name: 'Bloques / Ladrillos', icon: '🧱', defaultUnit: 'TON', description: 'Paletas o millares apilados', categoria: 'construccion' },
  { id: 'varillas_acero', name: 'Varillas de Acero', icon: '🏗️', defaultUnit: 'TON', description: 'Barras corrugadas 6m - 12m', categoria: 'construccion', isLong: true },
  { id: 'ceramica_acabados', name: 'Acabados / Cerámica', icon: '📦', defaultUnit: 'TON', description: 'Cajas delicadas sobre palet', categoria: 'construccion' },

  // 3. Varios / Desalojo
  { id: 'escombros', name: 'Desalojo de Escombros', icon: '🚜', defaultUnit: 'M3', description: 'Residuos de excavación y derroche', categoria: 'varios', isBulk: true },
  { id: 'varios_materiales', name: 'Varios Materiales', icon: '📦', defaultUnit: 'TON', description: 'Carga miscelánea o mudanza liviana', categoria: 'varios' }
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

interface SaraFletesWizardProps {
  // Estado del Wizard
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

  // Paso 2: Material y Volumen / Peso
  selectedMaterial: string;
  onSelectMaterial: (matName: string) => void;
  weight: number;
  onWeightChange: (val: number) => void;
  unitType: 'TON' | 'M3';
  onUnitTypeChange: (unit: 'TON' | 'M3') => void;
  sacosCementoCount: number;
  onSacosCementoChange: (val: number) => void;

  // Paso 3: Servicios Adicionales
  helpersCount: number;
  onHelpersChange: (count: number) => void;
  tasaBotaderoEnabled: boolean;
  onTasaBotaderoToggle: (enabled: boolean) => void;

  // Paso 4: Tarifa y Negociación InDrive
  suggestedPrice: number;
  proposedPrice: number;
  onAdjustPrice: (delta: number) => void;
  onSetPrice?: (price: number) => void;
  acceptanceProbability: { label: string; color: string };
  isCalculatingRoute: boolean;
  onTransmitOffer: () => void;

  // Motor de asignación de vehículo
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
  onSelectDestinoFrecuente,
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
  sacosCementoCount,
  onSacosCementoChange,
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
  assignedVehicleInfo,
  selectedVehicleType,
  onSelectVehicleType,
  distanciaKm = 2.4,
  duracionMinutos = 8
}: SaraFletesWizardProps) {
  const isEscombros = selectedMaterial === 'Desalojo de Escombros';
  const isVarillas = selectedMaterial === 'Varillas de Acero';
  const isCemento = selectedMaterial === 'Cemento (Sacos)';

  // Determinar la categoría inicial activa basada en el material seleccionado
  const [activeMaterialCategory, setActiveMaterialCategory] = React.useState<'aridos' | 'construccion' | 'varios'>(() => {
    const found = MATERIALES_OBRA.find((m) => m.name === selectedMaterial);
    return found ? found.categoria : 'aridos';
  });

  // Mantener la categoría sincronizada si el material externo cambia
  React.useEffect(() => {
    const found = MATERIALES_OBRA.find((m) => m.name === selectedMaterial);
    if (found && found.categoria !== activeMaterialCategory) {
      setActiveMaterialCategory(found.categoria);
    }
  }, [selectedMaterial]);

  return (
    <div className="space-y-4">
      {/* NAVEGACIÓN PASO A PASO (WIZARD VISUAL) */}
      <div className="bg-slate-950 p-2 rounded-2xl border border-slate-800 flex items-center justify-between">
        {[
          { num: 1, label: 'Ruta' },
          { num: 2, label: 'Carga' },
          { num: 3, label: 'Extras' },
          { num: 4, label: 'Tarifa' }
        ].map((s) => {
          const isActive = activeStep === s.num;
          const isDone = activeStep > s.num;

          return (
            <button
              key={s.num}
              type="button"
              onClick={() => setActiveStep(s.num)}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : isDone
                  ? 'bg-slate-900 text-emerald-400 hover:bg-slate-850'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                isActive ? 'bg-slate-950 text-amber-400' : isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
              }`}>
                {isDone ? '✓' : s.num}
              </span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* PASO 1: RUTA Y DESTINOS RÁPIDOS */}
      {/* ===================================================================== */}
      {activeStep === 1 && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-stretch gap-3">
              {/* Indicador visual de línea continua */}
              <div className="flex flex-col items-center py-2 shrink-0">
                <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></span>
                <div className="w-0.5 flex-1 bg-gradient-to-b from-emerald-500 via-slate-600 to-amber-500 my-1"></div>
                <span className="w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-500/20"></span>
              </div>

              {/* Campos de texto de Origen y Destino */}
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
                      placeholder="Escribe calle principal o intersección..."
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
                      Punto de Descarga
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
                      placeholder="Escribe calle principal o intersección..."
                      className="w-full min-h-[42px] bg-slate-900 border border-slate-700/80 rounded-xl pl-3 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FDBE3B] select-text"
                    />
                    {isSearchingDest ? (
                      <Loader2 className="w-3.5 h-3.5 text-[#FDBE3B] animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
                    ) : destinationText ? (
                      <button
                        type="button"
                        onClick={() => onDestinationChange('')}
                        aria-label="Limpiar punto de descarga"
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
            disabled={!originText || !destinationText}
            className="w-full min-h-[46px] bg-[#FDBE3B] hover:bg-[#F5B024] disabled:bg-slate-800 disabled:text-slate-600 text-[#111827] font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <span>Continuar a Carga</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PASO 2: MATERIAL Y VOLUMEN / PESO INTELIGENTE */}
      {/* ===================================================================== */}
      {activeStep === 2 && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                Selecciona el Material a Transportar
              </label>
              <span className="text-[10px] font-mono text-slate-400">Paso 2 de 4</span>
            </div>

            {/* TABS DE LAS 3 CATEGORÍAS PRINCIPALES DE CARGA (DIRECTAS E INTUITIVAS) */}
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIAS_MATERIALES.map((cat) => {
                const isCatActive = activeMaterialCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveMaterialCategory(cat.id as any);
                      // Asignar directamente el material y unidad representativa de la categoría
                      if (cat.id === 'aridos') {
                        onSelectMaterial('Arena / Ripio');
                        onUnitTypeChange('M3');
                      } else if (cat.id === 'construccion') {
                        onSelectMaterial('Cemento (Sacos)');
                        onUnitTypeChange('TON');
                      } else {
                        onSelectMaterial('Desalojo de Escombros');
                        onUnitTypeChange('M3');
                      }
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 active:scale-95 ${
                      isCatActive
                        ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/25 border-amber-400 ring-2 ring-amber-400/50'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-xs leading-tight font-black">{cat.label}</span>
                    <span className={`text-[9px] leading-none px-1.5 py-0.5 rounded ${isCatActive ? 'bg-slate-950/20 text-slate-950 font-bold' : 'text-slate-500'}`}>
                      {cat.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* CONTROL DESLIZANTE + BOTONES [-] [+] GRANDES PARA PESO O M3 */}
            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">
                    Cantidad a Transportar
                  </span>
                  <p className="text-xl font-black font-mono text-amber-400 mt-0.5">
                    {weight} <span className="text-xs text-slate-300 font-sans">{unitType === 'TON' ? 'Toneladas (T)' : 'Metros Cúbicos (m³)'}</span>
                  </p>
                </div>

                {/* Switch Ton vs m3 */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => onUnitTypeChange('TON')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      unitType === 'TON' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    Ton
                  </button>
                  <button
                    type="button"
                    onClick={() => onUnitTypeChange('M3')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      unitType === 'M3' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    m³
                  </button>
                </div>
              </div>

              {/* Botones Grandes [-] [+] y slider */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onWeightChange(Math.max(0.5, +(weight - 0.5).toFixed(1)))}
                  className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-90 text-white font-black text-lg flex items-center justify-center transition-all shadow-md shrink-0 border border-slate-700"
                  title="Disminuir 0.5"
                >
                  <Minus className="w-5 h-5 stroke-[3]" />
                </button>

                <input
                  type="range"
                  min="0.5"
                  max="30"
                  step="0.5"
                  value={weight}
                  onChange={(e) => onWeightChange(Number(e.target.value))}
                  className="flex-1 accent-amber-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                />

                <button
                  type="button"
                  onClick={() => onWeightChange(Math.min(32, +(weight + 0.5).toFixed(1)))}
                  className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-90 text-white font-black text-lg flex items-center justify-center transition-all shadow-md shrink-0 border border-slate-700"
                  title="Aumentar 0.5"
                >
                  <Plus className="w-5 h-5 stroke-[3]" />
                </button>
              </div>

              {/* Calculadora de Sacos si es cemento */}
              {isCemento && (
                <div className="bg-slate-950 p-2.5 rounded-xl border border-amber-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🏗️</span>
                    <div>
                      <span className="font-bold text-slate-200 block text-[11px]">Sacos de Cemento (50kg c/u)</span>
                      <span className="text-[9px] text-slate-400">20 sacos = 1.0 Tonelada</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      value={sacosCementoCount}
                      onChange={(e) => {
                        const count = Math.max(1, Number(e.target.value));
                        onSacosCementoChange(count);
                        onWeightChange(+(count * 0.05).toFixed(2));
                      }}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-amber-400"
                    />
                    <span className="text-[10px] text-slate-400">sacos</span>
                  </div>
                </div>
              )}
            </div>

            {/* BADGE DEL MOTOR DE REGLAS DE VEHÍCULO */}
            <div className={`p-3 rounded-2xl border flex items-start gap-2.5 ${
              assignedVehicleInfo.isEscalatedByLength
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
            }`}>
              <Truck className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div className="text-xs">
                <p className="font-black text-white">{assignedVehicleInfo.badge || 'Vehículo asignado automáticamente'}</p>
                <p className="text-[10px] text-slate-300 mt-0.5">{assignedVehicleInfo.reason}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-2xl text-xs transition-colors flex items-center justify-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Atrás
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <span>Continuar a Servicios Adicionales</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PASO 3: SERVICIOS ADICIONALES DE OBRA */}
      {/* ===================================================================== */}
      {activeStep === 3 && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                Servicios Adicionales en Obra
              </label>
              <span className="text-[10px] font-mono text-slate-400">Paso 3 de 4</span>
            </div>

            {/* COUNTER DE ESTIBADORES / AYUDANTES (0 A 4 PERSONAS) */}
            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-xs text-white">Estibadores / Ayudantes</h4>
                  <p className="text-[10px] text-slate-400">Carga y descarga manual ($15.00 c/u)</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onHelpersChange(Math.max(0, helpersCount - 1))}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-90 text-white font-bold flex items-center justify-center border border-slate-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center font-mono font-black text-base text-amber-400">
                  {helpersCount}
                </span>
                <button
                  type="button"
                  onClick={() => onHelpersChange(Math.min(4, helpersCount + 1))}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-90 text-white font-bold flex items-center justify-center border border-slate-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* SWITCH AUTOMÁTICO PARA TASA DE BOTADERO SI ES ESCOMBROS */}
            <div className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
              isEscombros 
                ? 'bg-amber-950/20 border-amber-500/40 text-amber-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg">
                  🗑️
                </div>
                <div>
                  <h4 className="font-black text-xs text-white flex items-center gap-1.5">
                    <span>Tasa de Botadero Autorizado</span>
                    {isEscombros && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-bold">
                        Recomendado
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-slate-400">Disposición legal municipal con certificado ($12.00)</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tasaBotaderoEnabled}
                  onChange={(e) => onTasaBotaderoToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-2xl text-xs transition-colors flex items-center justify-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Atrás
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <span>Ver Tarifa y Negociación</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PASO 4: TARIFA HÍBRIDA (INMEDIATA VS. CONSTRAOFERTA INDRIVE) */}
      {/* ===================================================================== */}
      {activeStep === 4 && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 border-2 border-amber-500/50 p-4 rounded-3xl shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Tarifa Sugerida por Algoritmo MTOP
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${acceptanceProbability.color}`}>
                Aceptación: {acceptanceProbability.label}
              </span>
            </div>

            {/* PRECIO Y CONTROLES INDRIVE (-$0.50, +$0.50, +$1.00) */}
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2.5 rounded-2xl">
              <button
                type="button"
                onClick={() => onAdjustPrice(-0.50)}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs flex items-center justify-center transition-all active:scale-95"
                title="Reducir $0.50 USD"
              >
                -$0.50
              </button>

              <div className="text-center flex-1 px-2">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-black text-amber-400 font-mono">$</span>
                  <input
                    type="number"
                    step="0.50"
                    min="1.00"
                    value={proposedPrice}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && onSetPrice) {
                        onSetPrice(val);
                      }
                    }}
                    className="w-28 text-3xl font-black font-mono text-amber-400 bg-slate-950/80 border border-slate-700 focus:border-amber-400 rounded-xl px-1.5 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-amber-400 shadow-inner"
                    title="Escribe directamente el valor que deseas ofertar"
                  />
                  <span className="text-xs text-slate-400 font-sans font-bold">USD</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Tarifa base sugerida: ${suggestedPrice.toFixed(2)} USD
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onAdjustPrice(0.50)}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs flex items-center justify-center transition-all active:scale-95"
                  title="Aumentar $0.50 USD"
                >
                  +$0.50
                </button>
                <button
                  type="button"
                  onClick={() => onAdjustPrice(1.00)}
                  className="w-10 h-10 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-black text-xs flex items-center justify-center transition-all active:scale-95"
                  title="Aumentar $1.00 USD"
                >
                  +$1.00
                </button>
              </div>
            </div>

            {/* RESUMEN DE EXTRAS INCLUIDOS */}
            {(helpersCount > 0 || tasaBotaderoEnabled) && (
              <div className="bg-slate-900/60 p-2 rounded-xl text-[11px] text-slate-400 space-y-1">
                {helpersCount > 0 && (
                  <div className="flex justify-between">
                    <span>{helpersCount} Estibador(es):</span>
                    <span className="font-mono text-slate-200">+ ${(helpersCount * 15).toFixed(2)} USD</span>
                  </div>
                )}
                {tasaBotaderoEnabled && (
                  <div className="flex justify-between">
                    <span>Tasa de Botadero Municipal:</span>
                    <span className="font-mono text-slate-200">+ $12.00 USD</span>
                  </div>
                )}
              </div>
            )}

            {/* BOTÓN PRIMARIO DE TRANSMISIÓN */}
            <button
              type="button"
              disabled={isCalculatingRoute}
              onClick={onTransmitOffer}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-2xl shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 text-sm active:scale-95"
            >
              <Truck className="w-4 h-4 stroke-[2.5]" />
              <span>Transmitir Oferta (${proposedPrice.toFixed(2)} USD) al Radar</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-2xl text-xs transition-colors flex items-center justify-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Atrás
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
