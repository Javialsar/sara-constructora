'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  MapPin,
  Loader2,
  Zap,
  Clock,
  Star,
  ArrowRight,
  CheckCircle2,
  Shield
} from 'lucide-react';
import {
  MODALIDADES_SARA_FLETES,
  PRESETS_MANDADITOS,
  type MultimodalVerticalKey,
  type VehicleOptionUI
} from '@/lib/agents/fletes/saraFletesUXUIDesigner';

interface SaraViajesMandaditosQuickOrderProps {
  modalidad: 'viajes' | 'mandaditos';
  originText: string;
  destinationText: string;
  userLocation: [number, number] | null;
  onRequestService: (params: {
    modalidad: MultimodalVerticalKey;
    vehiculoId: string;
    vehiculoNombre: string;
    tarifaEstimadaUSD: number;
    tiempoLlegadaMin: number;
    presetPaquete?: string;
    esUrgente?: boolean;
  }) => void;
}

export default function SaraViajesMandaditosQuickOrder({
  modalidad,
  originText,
  destinationText,
  userLocation,
  onRequestService
}: SaraViajesMandaditosQuickOrderProps) {
  const config = MODALIDADES_SARA_FLETES[modalidad];
  const [selectedVehicle, setSelectedVehicle] = useState<string>(config.vehiculos[0]?.id || '');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [esUrgente, setEsUrgente] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const vehiculoActivo = useMemo(
    () => config.vehiculos.find(v => v.id === selectedVehicle) || config.vehiculos[0],
    [config.vehiculos, selectedVehicle]
  );

  const puedeConfirmar = originText.trim().length > 0 && destinationText.trim().length > 0 && selectedVehicle;

  const handleConfirm = useCallback(async () => {
    if (!puedeConfirmar || !vehiculoActivo) return;
    setIsRequesting(true);
    // Simular búsqueda de conductor más cercano (~1.5s)
    await new Promise(r => setTimeout(r, 1500));
    onRequestService({
      modalidad,
      vehiculoId: vehiculoActivo.id,
      vehiculoNombre: vehiculoActivo.nombre,
      tarifaEstimadaUSD: vehiculoActivo.tarifaBaseMinUSD,
      tiempoLlegadaMin: vehiculoActivo.tiempoLlegadaMinutos,
      presetPaquete: selectedPreset || undefined,
      esUrgente: modalidad === 'mandaditos' ? esUrgente : undefined
    });
    setOrderConfirmed(true);
    setIsRequesting(false);
  }, [puedeConfirmar, vehiculoActivo, modalidad, selectedPreset, esUrgente, onRequestService]);

  if (orderConfirmed) {
    return (
      <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 text-center space-y-3 animate-in fade-in-0">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
        <h3 className="text-sm font-black text-white">
          {modalidad === 'viajes' ? '¡Conductor en camino!' : '¡Repartidor asignado!'}
        </h3>
        <p className="text-xs text-slate-400">
          {vehiculoActivo.nombre} llegará en ~{vehiculoActivo.tiempoLlegadaMinutos} min.
          Tarifa estimada: <span className="text-amber-400 font-bold">${vehiculoActivo.tarifaBaseMinUSD.toFixed(2)} USD</span>
        </p>
        <div className="flex items-center justify-center gap-2 pt-1">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
            Rastreando en tiempo real...
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOrderConfirmed(false)}
          className="mt-2 text-[10px] text-slate-500 hover:text-white transition-colors"
        >
          Solicitar otro servicio
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Descripción contextual de la modalidad */}
      <div className={`flex items-center gap-2 p-2.5 rounded-xl border bg-slate-950 ${
        modalidad === 'viajes' ? 'border-amber-500/20' : 'border-emerald-500/20'
      }`}>
        <span className="text-xl">{config.emoji}</span>
        <p className="text-[10px] text-slate-400 leading-tight">{config.descripcionCorta}</p>
      </div>

      {/* PRESETS DE PAQUETE (Solo para Mandaditos) */}
      {modalidad === 'mandaditos' && (
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-emerald-400 mb-1.5 block">
            ¿Qué envías?
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {PRESETS_MANDADITOS.map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedPreset(preset.id === selectedPreset ? '' : preset.id)}
                className={`p-2 rounded-xl text-left text-[10px] font-bold transition-all border ${
                  selectedPreset === preset.id
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {preset.label}
                <span className="block text-[9px] text-slate-500 font-normal mt-0.5">~{preset.pesoKg} kg</span>
              </button>
            ))}
          </div>
          {/* Toggle urgente */}
          <button
            type="button"
            onClick={() => setEsUrgente(!esUrgente)}
            className={`mt-2 w-full p-2 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-center gap-1.5 ${
              esUrgente
                ? 'bg-red-500/15 border-red-500/50 text-red-300'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            <Zap className="w-3 h-3" />
            {esUrgente ? 'Urgente activado (+$0.50)' : 'Marcar como urgente (< 30 min)'}
          </button>
        </div>
      )}

      {/* SELECTOR DE VEHÍCULOS */}
      <div>
        <label className={`text-[10px] font-black uppercase tracking-wider mb-1.5 block ${
          modalidad === 'viajes' ? 'text-amber-400' : 'text-emerald-400'
        }`}>
          {modalidad === 'viajes' ? 'Tu vehículo ideal' : 'Tipo de entrega'}
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {config.vehiculos.map((veh: VehicleOptionUI) => {
            const isSelected = selectedVehicle === veh.id;
            const accentColor = modalidad === 'viajes'
              ? (isSelected ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/30' : '')
              : (isSelected ? 'bg-emerald-500/15 border-emerald-500 ring-1 ring-emerald-500/30' : '');

            return (
              <button
                key={veh.id}
                type="button"
                onClick={() => setSelectedVehicle(veh.id)}
                className={`shrink-0 w-32 p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? `${accentColor} text-white shadow-lg`
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-2xl">{veh.icono}</span>
                  <div className="flex items-center gap-1">
                    {veh.popular && (
                      <span className="text-[8px] font-black bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded">
                        TOP
                      </span>
                    )}
                    <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                      <Zap className="w-2.5 h-2.5" />
                      {veh.tiempoLlegadaMinutos}m
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="font-black text-xs text-white leading-tight truncate">{veh.nombre}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{veh.capacidadTexto}</p>
                </div>
                <div className="mt-2 pt-1 border-t border-slate-800 flex items-baseline justify-between">
                  <span className={`text-sm font-black font-mono ${
                    modalidad === 'viajes' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    ${veh.tarifaBaseMinUSD.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-slate-500 font-semibold">USD</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RESUMEN RÁPIDO Y BOTÓN DE CONFIRMACIÓN */}
      {vehiculoActivo && (
        <div className={`rounded-2xl border p-3.5 space-y-2.5 ${
          modalidad === 'viajes'
            ? 'bg-amber-500/5 border-amber-500/20'
            : 'bg-emerald-500/5 border-emerald-500/20'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{vehiculoActivo.icono}</span>
              <div>
                <p className="text-xs font-black text-white">{vehiculoActivo.nombre}</p>
                <p className="text-[10px] text-slate-400">{vehiculoActivo.subtitulo}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-black font-mono ${
                modalidad === 'viajes' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                ${vehiculoActivo.tarifaBaseMinUSD.toFixed(2)}
              </p>
              <p className="text-[9px] text-slate-500">precio base</p>
            </div>
          </div>

          {/* Indicador de ETA y seguridad */}
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <Clock className="w-3 h-3" /> ~{vehiculoActivo.tiempoLlegadaMinutos} min
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Shield className="w-3 h-3" /> GPS en vivo
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="w-3 h-3" /> 4.9
            </span>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!puedeConfirmar || isRequesting}
            className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${
              modalidad === 'viajes'
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            {isRequesting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Buscando {modalidad === 'viajes' ? 'conductor' : 'repartidor'}...
              </>
            ) : (
              <>
                {modalidad === 'viajes' ? 'Solicitar Viaje' : 'Enviar Mandadito'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {!puedeConfirmar && (
            <p className="text-[10px] text-amber-400/70 text-center">
              ⚠️ Ingresa origen y destino para continuar
            </p>
          )}
        </div>
      )}
    </div>
  );
}
