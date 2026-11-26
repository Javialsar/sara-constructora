'use client';

import React, { useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Loader2,
  Package,
  ShieldAlert,
  Sparkles,
  Truck,
  Users,
  Weight,
  Box,
} from 'lucide-react';
import type { AiCubingResult } from '@/app/api/fletes/ai-cubing/route';

export type FleteVehicleCategory = 'camioneta' | 'camion_3_5t' | 'volqueta' | 'plataforma';

interface VehicleOption {
  id: FleteVehicleCategory;
  name: string;
  capacityLabel: string;
  mtopSpec: string;
  baseRateUsd: number;
}

export const FLETE_VEHICLE_OPTIONS: VehicleOption[] = [
  {
    id: 'camioneta',
    name: 'Camioneta 4x2 / 4x4',
    capacityLabel: 'Hasta 1.000 kg · 2.5 m³',
    mtopSpec: 'Carga liviana urbana',
    baseRateUsd: 18,
  },
  {
    id: 'camion_3_5t',
    name: 'Camión 3.5 Toneladas',
    capacityLabel: 'Hasta 3.500 kg · 12 m³',
    mtopSpec: '2DB liviano / mudanza',
    baseRateUsd: 38,
  },
  {
    id: 'volqueta',
    name: 'Volqueta 14 m³ (V3A)',
    capacityLabel: 'Hasta 27 T PBV · Áridos',
    mtopSpec: 'MTOP V3A · Cantera / Obra',
    baseRateUsd: 75,
  },
  {
    id: 'plataforma',
    name: 'Plataforma / Cama Baja',
    capacityLabel: '30 T - 48 T · Maquinaria',
    mtopSpec: 'MTOP 3S2 / 3S3 · Pesada',
    baseRateUsd: 145,
  },
];

interface StepCargoSelectorProps {
  vertical: 'viajes' | 'mandaditos' | 'fletes' | 'renta';
  selectedVehicle: FleteVehicleCategory;
  onSelectVehicle: (vehicle: FleteVehicleCategory) => void;
  onAiCubingApplied: (report: AiCubingResult) => void;
  aiReport: AiCubingResult | null;
}

export function StepCargoSelector({
  vertical,
  selectedVehicle,
  onSelectVehicle,
  onAiCubingApplied,
  aiReport,
}: StepCargoSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const showAiCubing = vertical === 'fletes' || vertical === 'mandaditos';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setAnalyzing(true);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/fletes/ai-cubing', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success || !data.report) {
        setErrorMsg(data?.error || 'No se pudo analizar la fotografía de carga.');
        return;
      }

      const report = data.report as AiCubingResult;
      onSelectVehicle(report.recommended_vehicle_type);
      onAiCubingApplied(report);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error de conexión con Copiloto IA.');
    } finally {
      setAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-5">
      {showAiCubing && (
        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                Copiloto IA de Cubicaje · Gemini 2.5 Flash
              </div>
              <h3 className="font-display text-base font-bold text-white">
                Calcula volumen, peso y unidad exacta con una foto
              </h3>
              <p className="text-xs text-slate-300">
                Toma una foto de los bultos, sacos o materiales. Preseleccionamos el vehículo MTOP y los estibadores recomendados.
              </p>
            </div>

            <div className="shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                disabled={analyzing}
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[48px] w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-black text-sm inline-flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analizando carga...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    📸 Calcular Carga con IA (Foto)
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-950/50 px-3.5 py-2.5 text-xs text-rose-200 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {aiReport && (
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-slate-950/80 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Cubicaje IA Aplicado — Unidad preseleccionada automáticamente
                </span>
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Carga analizada"
                    className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                  />
                )}
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-lg bg-slate-900 border border-slate-800 p-2.5">
                  <div className="text-[10px] uppercase text-slate-400 flex items-center gap-1">
                    <Box className="w-3 h-3 text-amber-400" /> Volumen
                  </div>
                  <div className="font-mono tabular-nums text-sm font-black text-white mt-0.5">
                    {aiReport.estimated_volume_m3} m³
                  </div>
                </div>
                <div className="rounded-lg bg-slate-900 border border-slate-800 p-2.5">
                  <div className="text-[10px] uppercase text-slate-400 flex items-center gap-1">
                    <Weight className="w-3 h-3 text-amber-400" /> Peso Est.
                  </div>
                  <div className="font-mono tabular-nums text-sm font-black text-white mt-0.5">
                    {aiReport.estimated_weight_kg.toLocaleString('es-EC')} kg
                  </div>
                </div>
                <div className="rounded-lg bg-slate-900 border border-slate-800 p-2.5">
                  <div className="text-[10px] uppercase text-slate-400 flex items-center gap-1">
                    <Users className="w-3 h-3 text-amber-400" /> Estibadores
                  </div>
                  <div className="font-mono tabular-nums text-sm font-black text-white mt-0.5">
                    {aiReport.recommended_stevedores} sug.
                  </div>
                </div>
              </div>

              {aiReport.detected_materials.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {aiReport.detected_materials.map((mat, idx) => (
                    <span
                      key={`${mat}-${idx}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 text-[11px] font-semibold"
                    >
                      <Package className="w-3 h-3 text-amber-400" />
                      {mat}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                <strong className="font-bold">Nota operativa:</strong> {aiReport.safety_notes}
              </p>
            </div>
          )}
        </div>
      )}

      <div>
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
          Selecciona la unidad vehicular
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FLETE_VEHICLE_OPTIONS.map((v) => {
            const isSelected = selectedVehicle === v.id;
            const isAiRecommended = aiReport?.recommended_vehicle_type === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelectVehicle(v.id)}
                className={`min-h-[84px] text-left rounded-2xl border p-4 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/15 ring-1 ring-amber-400/50'
                    : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-400'
                      }`}
                    >
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-display text-sm font-bold text-white flex items-center gap-2">
                        {v.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{v.capacityLabel}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono tabular-nums text-sm font-black text-amber-400">
                      ${v.baseRateUsd.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-500">base</div>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">{v.mtopSpec}</span>
                  {isAiRecommended && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      Recomendado IA
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
