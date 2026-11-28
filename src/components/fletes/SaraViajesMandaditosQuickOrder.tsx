'use client';

import React, { useEffect, useState } from 'react';
import { 
  Zap, 
  Users, 
  Package, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Phone,
  User,
  AlertCircle,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  MODALIDADES_SARA_FLETES, 
  PRESETS_MANDADITOS,
  VehicleOptionUI,
  MultimodalVerticalKey
} from '@/lib/agents/fletes/saraFletesUXUIDesigner';
import { SaraSmartBiddingSlider } from './SaraSmartBiddingSlider';

interface SaraViajesMandaditosQuickOrderProps {
  modalidad: 'viajes' | 'mandaditos';
  distanciaKm: number;
  duracionEstimadaMin: number;
  origenNombre: string;
  destinoNombre: string;
  memoriaInsights?: string[];
  isRequesting: boolean;
  onRequestConfirm: (params: {
    vehiculoId: string;
    vehiculoNombre: string;
    tarifaUSD: number;
    pasajerosCount?: number;
    paqueteTipo?: string;
    destinatarioNombre?: string;
    destinatarioTelefono?: string;
    esUrgente?: boolean;
  }) => void;
}

export const SaraViajesMandaditosQuickOrder: React.FC<SaraViajesMandaditosQuickOrderProps> = ({
  modalidad,
  distanciaKm,
  duracionEstimadaMin,
  origenNombre,
  destinoNombre,
  memoriaInsights = [],
  isRequesting,
  onRequestConfirm
}) => {
  const config = MODALIDADES_SARA_FLETES[modalidad];
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    config.vehiculos[0]?.id || ''
  );

  useEffect(() => {
    setSelectedVehicleId(config.vehiculos[0]?.id || '');
    setCustomOffer(null);
  }, [modalidad, config.vehiculos]);
  
  // Parámetros específicos de Viajes
  const [pasajerosCount, setPasajerosCount] = useState<number>(1);

  // Parámetros específicos de Mandaditos
  const [selectedPresetId, setSelectedPresetId] = useState<string>('doc');
  const [destinatarioNombre, setDestinatarioNombre] = useState<string>('Receptor en Obra / Oficina');
  const [destinatarioTelefono, setDestinatarioTelefono] = useState<string>('0991234567');
  const [esUrgente, setEsUrgente] = useState<boolean>(false);

  // Smart Bidding 2.0 (Modo inDrive opcional)
  const [showSmartBidding, setShowSmartBidding] = useState<boolean>(false);
  const [customOffer, setCustomOffer] = useState<{
    contextKey: string;
    price: number;
  } | null>(null);

  // Vehículo seleccionado actualmente
  const selectedVehicle = config.vehiculos.find(v => v.id === selectedVehicleId) || config.vehiculos[0];
  const offerContextKey = `${modalidad}:${selectedVehicle?.id ?? ''}`;

  // Cálculo de tarifa dinámica para la tarjeta seleccionada
  const calcularTarifaVehiculo = (v: VehicleOptionUI): number => {
    const d = Math.max(0.5, distanciaKm);
    let tarifa = v.tarifaBaseMinUSD;

    if (modalidad === 'viajes') {
      const costoKm = v.id === 'MOTO_PASS' ? 0.35 : v.id === 'AUTO_PREMIUM' ? 0.65 : v.id === 'MINIVAN_PASS' ? 0.85 : 0.50;
      const costoMin = v.id === 'MOTO_PASS' ? 0.05 : 0.10;
      const subtotal = v.tarifaBaseMinUSD + (d * costoKm) + (duracionEstimadaMin * costoMin);
      tarifa = Math.max(v.tarifaBaseMinUSD, subtotal);
    } else {
      // Mandaditos
      const costoKm = v.id === 'DELIVERY_MOTO' ? 0.40 : v.id === 'DELIVERY_CARGO_VAN' ? 0.75 : 0.55;
      const subtotal = v.tarifaBaseMinUSD + (d * costoKm) + (esUrgente ? 0.50 : 0);
      tarifa = Math.max(v.tarifaBaseMinUSD, subtotal);
    }

    return +tarifa.toFixed(2);
  };

  const tarifaCalculada = selectedVehicle ? calcularTarifaVehiculo(selectedVehicle) : 2.50;
  const customOfferPrice =
    customOffer && customOffer.contextKey === offerContextKey ? customOffer.price : null;
  const tarifaFinal = customOfferPrice ?? tarifaCalculada;

  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setCustomOffer(null);
  };

  const handleConfirmar = () => {
    if (!selectedVehicle) return;

    onRequestConfirm({
      vehiculoId: selectedVehicle.id,
      vehiculoNombre: selectedVehicle.nombre,
      tarifaUSD: tarifaFinal,
      pasajerosCount: modalidad === 'viajes' ? pasajerosCount : undefined,
      paqueteTipo: modalidad === 'mandaditos' ? selectedPresetId : undefined,
      destinatarioNombre: modalidad === 'mandaditos' ? destinatarioNombre : undefined,
      destinatarioTelefono: modalidad === 'mandaditos' ? destinatarioTelefono : undefined,
      esUrgente: modalidad === 'mandaditos' ? esUrgente : undefined
    });
  };

  return (
    <div className="space-y-3.5">
      {/* INSIGHTS DE MEMORIA REFLECTIVA EN TIEMPO REAL */}
      {memoriaInsights.length > 0 && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-2.5 flex items-start gap-2 shadow-sm">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-emerald-300 leading-snug">
            <span className="font-black text-emerald-200 uppercase tracking-wider block text-[9px]">
              Inteligencia Reflectiva SARA
            </span>
            {memoriaInsights[0]}
          </div>
        </div>
      )}

      {/* SELECTOR DE VEHÍCULOS ULTRA-TÁCTIL (ESTILO UBER / RAPPI) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span>Vehículos para {config.label}</span>
            <span className="text-[9px] font-semibold text-slate-500">
              ({distanciaKm > 0 ? `${distanciaKm} km · ~${duracionEstimadaMin} min` : 'Selecciona destino'})
            </span>
          </label>
        </div>

        <div
          className={`flex overflow-x-auto snap-x gap-2 pb-1 -mx-1 px-1 sm:grid ${
            config.vehiculos.length <= 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-4'
          } sm:overflow-visible sm:mx-0 sm:px-0 sm:pb-0`}
        >
          {config.vehiculos.map((v) => {
            const isSelected = selectedVehicleId === v.id;
            const precio = calcularTarifaVehiculo(v);

            return (
              <button
                key={v.id}
                type="button"
                onClick={() => handleSelectVehicle(v.id)}
                className={`min-w-[104px] sm:min-w-0 shrink-0 snap-start px-2.5 py-2 rounded-xl border text-left transition-all relative flex flex-col justify-between active:scale-95 cursor-pointer ${
                  isSelected
                    ? modalidad === 'viajes'
                      ? 'bg-[#FDBE3B]/15 border-2 border-[#FDBE3B] text-white shadow-md shadow-amber-500/10'
                      : 'bg-emerald-500/20 border-2 border-emerald-400 text-white shadow-md shadow-emerald-500/10'
                    : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {v.popular && (
                  <span className="absolute -top-2 right-1.5 text-[8px] font-black uppercase bg-[#FDBE3B] text-[#111827] px-1.5 py-0.5 rounded-full shadow-sm leading-none">
                    Top
                  </span>
                )}

                <div className="flex items-center justify-between w-full gap-1">
                  <span className="text-lg leading-none">{v.icono}</span>
                  <span className="text-[9px] font-bold text-slate-300 flex items-center gap-0.5 whitespace-nowrap">
                    <Zap className="w-2.5 h-2.5 text-[#FDBE3B]" />
                    {v.tiempoLlegadaMinutos}m
                  </span>
                </div>

                <div className="mt-1.5">
                  <p className="font-black text-[11px] text-white leading-tight truncate">{v.nombre}</p>
                  <p className="text-[9px] text-slate-400 truncate">{v.capacidadTexto}</p>
                </div>

                <div className="mt-1.5 pt-1 border-t border-slate-800/80 flex items-baseline justify-between">
                  <span
                    className={`text-xs font-black font-mono tabular-nums ${
                      modalidad === 'viajes' ? 'text-[#FDBE3B]' : 'text-emerald-400'
                    }`}
                  >
                    ${precio.toFixed(2)}
                  </span>
                  <span className="text-[8px] text-slate-400 font-bold">USD</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* BOTÓN DE ACCIÓN PRINCIPAL DIRECTO BAJO LOS VEHÍCULOS (SIN STICKY QUE TAPE TARJETAS) */}
      <div className="space-y-1.5">
        <button
          type="button"
          disabled={isRequesting || !selectedVehicle}
          onClick={handleConfirmar}
          className={`w-full min-h-[48px] py-3 px-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] ${
            modalidad === 'viajes'
              ? 'bg-[#FDBE3B] hover:bg-[#F5B024] text-[#111827] shadow-amber-500/20'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
          } disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
        >
          {isRequesting ? (
            <>
              <span className="animate-spin text-base">⏳</span>
              <span>Buscando conductor...</span>
            </>
          ) : (
            <>
              <span className="truncate">{modalidad === 'viajes' ? 'Solicitar Viaje' : 'Pedir Mandadito'}</span>
              {selectedVehicle && (
                <span className="text-xs opacity-85 font-bold truncate max-w-[110px]">
                  · {selectedVehicle.nombre}
                </span>
              )}
              <span className="bg-slate-950/20 px-2 py-0.5 rounded-lg font-mono font-black tabular-nums shrink-0 text-xs">
                ${tarifaFinal.toFixed(2)}
              </span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </>
          )}
        </button>

        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            Tarifa transparente
          </span>
          <span className="shrink-0">Conductor recibe 88–90%</span>
        </div>
      </div>

      {/* TOGGLE SMART BIDDING 2.0 (MODO INDRIVE) */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowSmartBidding((prev) => !prev)}
          aria-expanded={showSmartBidding}
          className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 transition-colors flex items-center justify-between gap-2"
        >
          <span className="flex items-center gap-2 min-w-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Ajustar mi oferta (Modo inDrive)</span>
            {customOfferPrice !== null && Math.abs(customOfferPrice - tarifaCalculada) >= 0.01 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono tabular-nums font-bold shrink-0">
                ${tarifaFinal.toFixed(2)}
              </span>
            )}
          </span>
          {showSmartBidding ? (
            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          )}
        </button>

        {showSmartBidding && (
          <SaraSmartBiddingSlider
            suggestedPrice={tarifaCalculada}
            currentPrice={tarifaFinal}
            onChangePrice={(newPrice) =>
              setCustomOffer({ contextKey: offerContextKey, price: newPrice })
            }
            compact
          />
        )}
      </div>

      {/* CONTROLES ESPECÍFICOS SEGÚN VERTICAL */}
      {modalidad === 'viajes' ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white leading-none">Número de Pasajeros</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Máximo según categoría de auto</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => setPasajerosCount(num)}
                className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                  pasajerosCount === num
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-1 ring-amber-400'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* MANDADITOS / DELIVERY EXPRESS */
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-3">
          {/* Presets de Paquete */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">
              ¿Qué deseas enviar? (Presiona 1 toque)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {PRESETS_MANDADITOS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPresetId(p.id)}
                  className={`px-2 py-1.5 rounded-lg text-left text-xs font-bold transition-all truncate border ${
                    selectedPresetId === p.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Datos del Receptor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Destinatario (Nombre)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={destinatarioNombre}
                  onChange={(e) => setDestinatarioNombre(e.target.value)}
                  placeholder="Ej: Ing. Juan Pérez"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Teléfono de Contacto
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={destinatarioTelefono}
                  onChange={(e) => setDestinatarioTelefono(e.target.value)}
                  placeholder="099..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Toggle de Urgencia Express */}
          <div className="pt-1 flex items-center justify-between border-t border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-slate-300">Entrega Inmediata Directa (&lt; 30 min)</span>
            </div>
            <button
              type="button"
              onClick={() => setEsUrgente(!esUrgente)}
              className={`text-[10px] font-black px-2 py-0.5 rounded-full border transition-all ${
                esUrgente
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {esUrgente ? '⚡ Prioridad Activa (+ $0.50)' : 'Estándar'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default SaraViajesMandaditosQuickOrder;
