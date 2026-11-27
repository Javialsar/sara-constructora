'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Clock,
  FileCheck2,
  MapPin,
  Navigation,
  RotateCcw,
  Route,
  X,
} from 'lucide-react';
import { GOBEE_CATEGORY_MAP, type GobeeIncomingRequest } from '@/lib/gobee/gobeeTypes';

export interface EpodSubmissionPayload {
  requestId: string;
  receiverName: string;
  photoDataUrl: string;
  signatureDataUrl: string;
  sha256: string;
}

export interface IncomingRequestCardProps {
  request: GobeeIncomingRequest;
  tripPhase: 'incoming' | 'accepted' | 'in_transit';
  onAccept: (req: GobeeIncomingRequest) => void;
  onDecline: (reqId: string) => void;
  onStartTripWithPin: (pin: string) => void;
  onCompleteWithEpod: (payload: EpodSubmissionPayload) => Promise<void>;
}

const ALERT_WINDOW_SECONDS = 15;

async function computeSha256Hex(input: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoded = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return Array(64).fill('0').join('');
}

export function IncomingRequestCard({
  request,
  tripPhase,
  onAccept,
  onDecline,
  onStartTripWithPin,
  onCompleteWithEpod,
}: IncomingRequestCardProps) {
  const [secondsLeft, setSecondsLeft] = useState(ALERT_WINDOW_SECONDS);
  const [pinInput, setPinInput] = useState('');
  const [showEpod, setShowEpod] = useState(false);
  const [receiverName, setReceiverName] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSubmittingEpod, setIsSubmittingEpod] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const catConfig = GOBEE_CATEGORY_MAP[request.category];

  // Temporizador de 15 segundos para solicitudes entrantes
  useEffect(() => {
    if (tripPhase !== 'incoming') return;
    setSecondsLeft(ALERT_WINDOW_SECONDS);
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDecline(request.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [request.id, tripPhase, onDecline]);

  // Inicializar canvas de firma e-POD
  useEffect(() => {
    if (showEpod && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [showEpod]);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pt = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pt = getPoint(e);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handleSubmitEpod = async () => {
    if (!receiverName.trim() || !photoDataUrl || !hasSignature || !canvasRef.current) return;
    setIsSubmittingEpod(true);
    try {
      const signatureDataUrl = canvasRef.current.toDataURL('image/png');
      const sha256 = await computeSha256Hex(
        `${request.id}|${receiverName.trim()}|${photoDataUrl.slice(0, 128)}|${new Date().toISOString()}`
      );
      await onCompleteWithEpod({
        requestId: request.id,
        receiverName: receiverName.trim(),
        photoDataUrl,
        signatureDataUrl,
        sha256,
      });
      setShowEpod(false);
    } finally {
      setIsSubmittingEpod(false);
    }
  };

  const progressPct = (secondsLeft / ALERT_WINDOW_SECONDS) * 100;

  return (
    <section
      aria-label="Tarjeta de viaje Gobee Conductor"
      className="rounded-3xl bg-slate-900 border-2 border-[#FDBE3B] p-4 shadow-2xl shadow-amber-500/15 space-y-3.5 text-white"
    >
      {/* Barra de cuenta regresiva 15s (solo en fase incoming) */}
      {tripPhase === 'incoming' && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black uppercase tracking-wider text-[#FDBE3B] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Nueva solicitud {catConfig.name}
            </span>
            <span className="font-mono tabular-nums font-black text-white bg-slate-800 px-2.5 py-0.5 rounded-full">
              {secondsLeft}s
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-[#FDBE3B] transition-all duration-1000 ease-linear"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Ganancia Neta + Distancia Recogida + Badge Backhaul */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Tu ganancia neta estimada
          </span>
          <div className="font-mono tabular-nums text-3xl font-black text-[#FDBE3B] leading-none mt-1">
            ${request.netEarningsUSD.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Tarifa ${request.grossFareUSD.toFixed(2)} · Comisión {request.commissionPct}%
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 font-mono tabular-nums">
            Recogida a {request.pickupDistanceKm.toFixed(1)} km
          </span>
          <span className="text-[11px] text-slate-400 font-mono tabular-nums">
            Viaje {request.distanceKm.toFixed(1)} km · ~{request.durationMin} min
          </span>
          {request.isBackhaul && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50">
              <Route className="w-3 h-3" />
              {request.backhaulBonusLabel || 'Retorno Backhaul'}
            </span>
          )}
        </div>
      </div>

      {/* Ruta Origen -> Destino */}
      <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-3 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-slate-400">Recogida</span>
            <p className="font-semibold text-white truncate">{request.originLabel}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Navigation className="w-4 h-4 text-[#FDBE3B] shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase text-slate-400">Destino</span>
            <p className="font-semibold text-white truncate">{request.destLabel}</p>
          </div>
        </div>
        {request.material && (
          <div className="pt-1 border-t border-slate-800 text-[11px] text-amber-300 font-semibold">
            Carga: {request.material} {request.weightTon ? `· ${request.weightTon}T` : ''}
          </div>
        )}
      </div>

      {/* Fase 1: Aceptar o Rechazar */}
      {tripPhase === 'incoming' && (
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onDecline(request.id)}
            className="min-h-[52px] rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
            Omitir
          </button>
          <button
            type="button"
            onClick={() => onAccept(request)}
            className="col-span-2 min-h-[52px] rounded-2xl bg-[#FDBE3B] hover:bg-[#F5B024] text-[#111827] font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            Aceptar por ${request.netEarningsUSD.toFixed(2)}
          </button>
        </div>
      )}

      {/* Fase 2: Camino a recogida -> Validar PIN para iniciar */}
      {tripPhase === 'accepted' && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              placeholder="PIN 4 dígitos del cliente"
              className="flex-1 min-h-[48px] rounded-2xl bg-slate-950 border border-slate-700 px-3.5 text-sm font-mono tabular-nums font-bold text-white outline-none focus:border-[#FDBE3B]"
            />
            <button
              type="button"
              onClick={() => onStartTripWithPin(pinInput)}
              disabled={pinInput.length < 4}
              className="min-h-[48px] px-5 rounded-2xl bg-[#FDBE3B] hover:bg-[#F5B024] disabled:opacity-40 text-[#111827] font-black text-xs cursor-pointer"
            >
              Iniciar Viaje
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Solicita el PIN de seguridad al cliente al momento del abordaje o carga.
          </p>
        </div>
      )}

      {/* Fase 3: En tránsito -> Cierre e-POD con Foto + Firma */}
      {tripPhase === 'in_transit' && !showEpod && (
        <button
          type="button"
          onClick={() => setShowEpod(true)}
          className="w-full min-h-[52px] rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#0F172A] font-black text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <FileCheck2 className="w-5 h-5" />
          Finalizar y Cerrar e-POD (Foto + Firma)
        </button>
      )}

      {tripPhase === 'in_transit' && showEpod && (
        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#FDBE3B] uppercase">Acta Digital e-POD</span>
            <button
              type="button"
              onClick={() => setShowEpod(false)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value)}
            placeholder="Nombre de quien recibe"
            className="w-full min-h-[44px] rounded-xl bg-slate-900 border border-slate-700 px-3 text-xs font-semibold text-white outline-none focus:border-[#FDBE3B]"
          />

          {/* Captura de foto e-POD */}
          <label className="min-h-[46px] rounded-xl bg-slate-900 border border-dashed border-slate-600 hover:border-[#FDBE3B] px-3 py-2 flex items-center justify-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
            <Camera className="w-4 h-4 text-[#FDBE3B]" />
            <span>{photoDataUrl ? 'Foto capturada (toca para cambiar)' : 'Tomar foto de entrega'}</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
          {photoDataUrl && (
            <img
              src={photoDataUrl}
              alt="Evidencia e-POD"
              className="w-full h-28 object-cover rounded-xl border border-slate-700"
            />
          )}

          {/* Firma táctil */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Firma del receptor</span>
              <button
                type="button"
                onClick={clearCanvas}
                className="flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Limpiar
              </button>
            </div>
            <canvas
              ref={canvasRef}
              width={320}
              height={110}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={() => setIsDrawing(false)}
              onPointerLeave={() => setIsDrawing(false)}
              className="w-full h-[110px] rounded-xl bg-white touch-none cursor-crosshair"
            />
          </div>

          <button
            type="button"
            disabled={!receiverName.trim() || !photoDataUrl || !hasSignature || isSubmittingEpod}
            onClick={() => void handleSubmitEpod()}
            className="w-full min-h-[50px] rounded-2xl bg-[#FDBE3B] hover:bg-[#F5B024] disabled:opacity-40 text-[#111827] font-black text-xs cursor-pointer"
          >
            {isSubmittingEpod ? 'Verificando hash SHA-256...' : 'Confirmar Entrega e-POD'}
          </button>
        </div>
      )}
    </section>
  );
}
