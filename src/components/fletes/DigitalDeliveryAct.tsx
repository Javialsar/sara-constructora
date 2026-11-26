'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Eraser,
  FileCheck2,
  Loader2,
  MapPin,
  QrCode,
  ShieldCheck,
  X,
  AlertTriangle,
} from 'lucide-react';

interface DigitalDeliveryActProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  defaultReceiverName?: string;
  expectedQrToken?: string;
  distanceToDropoffM?: number;
  onVerified: (result: {
    photoSha256: string;
    kushkiCaptureRef: string | null;
    sriInvoiceReady: boolean;
  }) => void;
}

async function computeFileSha256(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Error leyendo imagen'));
    reader.readAsDataURL(file);
  });
}

export function DigitalDeliveryAct({
  isOpen,
  onClose,
  orderId,
  defaultReceiverName = '',
  expectedQrToken,
  distanceToDropoffM,
  onVerified,
}: DigitalDeliveryActProps) {
  const [receiverName, setReceiverName] = useState(defaultReceiverName);
  const [validationMode, setValidationMode] = useState<'SIGNATURE' | 'QR_SCAN'>('SIGNATURE');
  const [qrTokenInput, setQrTokenInput] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoMimeType, setPhotoMimeType] = useState('image/jpeg');
  const [photoSha256, setPhotoSha256] = useState<string | null>(null);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verifiedData, setVerifiedData] = useState<{
    photoSha256: string;
    kushkiCaptureRef: string | null;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const strokesRef = useRef<string[]>([]);
  const currentPathRef = useRef<string>('');
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setGpsLoading(true);
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsLoading(false);
        },
        () => {
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setGpsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * canvas.width) / rect.width,
      y: ((e.clientY - rect.top) * canvas.height) / rect.height,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    canvas.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const pt = getPoint(e);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    currentPathRef.current = `M${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const pt = getPoint(e);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    currentPathRef.current += ` L${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    setHasSignature(true);
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (currentPathRef.current) {
      strokesRef.current.push(currentPathRef.current);
      currentPathRef.current = '';
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    strokesRef.current = [];
    currentPathRef.current = '';
    setHasSignature(false);
  };

  const buildSignatureSvg = (): string | null => {
    if (strokesRef.current.length === 0) return null;
    const paths = strokesRef.current
      .map((d) => `<path d="${d}" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>`)
      .join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 150">${paths}</svg>`;
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    try {
      const [sha, dataUrl] = await Promise.all([computeFileSha256(file), fileToDataUrl(file)]);
      setPhotoSha256(sha);
      setPhotoBase64(dataUrl);
      setPhotoMimeType(file.type || 'image/jpeg');
      setPhotoPreview(URL.createObjectURL(file));
    } catch {
      setErrorMsg('No se pudo procesar la fotografía de entrega.');
    }
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    if (!receiverName.trim()) {
      setErrorMsg('Ingresa el nombre completo del receptor autorizado en obra/destino.');
      return;
    }
    if (!photoBase64 || !photoSha256) {
      setErrorMsg('Debes capturar la fotografía obligatoria de la mercancía entregada.');
      return;
    }
    if (!gpsCoords) {
      setErrorMsg('Se requieren coordenadas GPS reales del dispositivo para sellar el acta e-POD.');
      return;
    }

    const signatureSvg = validationMode === 'SIGNATURE' ? buildSignatureSvg() : null;
    if (validationMode === 'SIGNATURE' && !signatureSvg) {
      setErrorMsg('El receptor debe firmar en pantalla táctil antes de certificar.');
      return;
    }
    if (validationMode === 'QR_SCAN' && qrTokenInput.trim().length < 8) {
      setErrorMsg('Escanea o ingresa el código QR único de la orden del cliente.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/fletes/epod/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          receiverName: receiverName.trim(),
          photoBase64,
          photoMimeType,
          clientPhotoSha256: photoSha256,
          signatureSvg,
          receiverQrToken: validationMode === 'QR_SCAN' ? qrTokenInput.trim() : undefined,
          gpsLat: gpsCoords.lat,
          gpsLng: gpsCoords.lng,
          distanceToDropoffM,
          triggerSettlement: true,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setErrorMsg(data?.error || 'Error certificando el Acta de Entrega Digital (e-POD).');
        return;
      }

      setVerifiedData({
        photoSha256: data.photoSha256,
        kushkiCaptureRef: data.kushkiCaptureRef || null,
      });
      onVerified({
        photoSha256: data.photoSha256,
        kushkiCaptureRef: data.kushkiCaptureRef || null,
        sriInvoiceReady: Boolean(data.sriInvoiceReady),
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error de red enviando e-POD.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-auto">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              Acta de Entrega Digital Criptográfica (e-POD)
            </div>
            <h2 className="font-display text-lg font-black text-white mt-0.5">
              Certificación de Recepción en Obra / Destino
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {verifiedData ? (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-5 space-y-3 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="font-display text-xl font-black text-white">e-POD VERIFICADO Y SELLADO</h3>
              <p className="text-xs text-slate-300">
                La liquidación del flete y la emisión de la Factura Electrónica SRI han sido habilitadas.
              </p>
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 text-left font-mono text-[11px] text-slate-300 break-all">
                <div className="text-slate-500 uppercase text-[10px]">SHA-256 Evidencia Fotográfica</div>
                <div>{verifiedData.photoSha256}</div>
                {verifiedData.kushkiCaptureRef && (
                  <div className="mt-2 text-emerald-400">
                    Kushki Capture Ref: {verifiedData.kushkiCaptureRef}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="min-h-[46px] w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm cursor-pointer"
              >
                Continuar al Resumen y Factura SRI
              </button>
            </div>
          ) : (
            <>
              {/* Estado GPS y Geocerca */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  {gpsLoading ? (
                    <span>Obteniendo coordenadas GPS reales...</span>
                  ) : gpsCoords ? (
                    <span className="font-mono tabular-nums">
                      {gpsCoords.lat.toFixed(6)}, {gpsCoords.lng.toFixed(6)}
                    </span>
                  ) : (
                    <span className="text-rose-400">GPS no disponible — habilita ubicación</span>
                  )}
                </div>
                {typeof distanceToDropoffM === 'number' && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold">
                    Geocerca: {Math.round(distanceToDropoffM)}m
                  </span>
                )}
              </div>

              {/* Receptor */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Receptor Autorizado en Obra / Destino
                </label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="Ej. Ing. Carlos Mendoza (Residente de Obra)"
                  className="w-full min-h-[46px] rounded-xl border border-slate-700 bg-slate-950 px-3.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* 1. Foto obligatoria */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  1. Evidencia Fotográfica Sellada (GPS + UTC + SHA-256)
                </label>
                <label className="min-h-[52px] w-full rounded-xl border border-dashed border-amber-500/50 bg-amber-500/5 hover:bg-amber-500/10 px-4 py-3 flex items-center justify-center gap-2 text-sm font-bold text-amber-300 cursor-pointer transition-colors">
                  <Camera className="w-4 h-4" />
                  {photoPreview ? 'Cambiar foto de entrega' : 'Capturar foto de mercancía entregada'}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
                {photoPreview && photoSha256 && (
                  <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                    <img
                      src={photoPreview}
                      alt="Evidencia e-POD"
                      className="w-16 h-16 rounded-lg object-cover border border-slate-700"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-emerald-400">Hash SHA-256 calculado</div>
                      <div className="font-mono text-[10px] text-slate-400 truncate">{photoSha256}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Validación Dual: Firma o QR */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  2. Validación Dual del Receptor
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setValidationMode('SIGNATURE')}
                    className={`min-h-[44px] rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      validationMode === 'SIGNATURE'
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    ✍️ Firma Táctil en Pantalla
                  </button>
                  <button
                    type="button"
                    onClick={() => setValidationMode('QR_SCAN')}
                    className={`min-h-[44px] rounded-xl text-xs font-bold border transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                      validationMode === 'QR_SCAN'
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    Código QR Único
                  </button>
                </div>

                {validationMode === 'SIGNATURE' ? (
                  <div className="space-y-2">
                    <div className="rounded-xl border border-slate-700 bg-slate-950 overflow-hidden touch-none">
                      <canvas
                        ref={canvasRef}
                        width={420}
                        height={150}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        className="w-full h-[150px] block cursor-crosshair"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{hasSignature ? 'Firma capturada' : 'Firma con el dedo o puntero arriba'}</span>
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="inline-flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer"
                      >
                        <Eraser className="w-3.5 h-3.5" /> Limpiar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={qrTokenInput}
                      onChange={(e) => setQrTokenInput(e.target.value)}
                      placeholder="Escanea o ingresa el token QR de la orden"
                      className="w-full min-h-[46px] rounded-xl border border-slate-700 bg-slate-950 px-3.5 font-mono text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                    {expectedQrToken && (
                      <p className="text-[11px] text-slate-400">
                        Token asignado al cliente: <span className="font-mono text-amber-300">{expectedQrToken.slice(0, 8)}…</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-950/50 p-3 text-xs text-rose-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="min-h-[50px] w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-black text-sm inline-flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sellando e-POD y liquidando...
                  </>
                ) : (
                  <>
                    <FileCheck2 className="w-4 h-4" />
                    Certificar e-POD y Liberar Pago + Factura SRI
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
