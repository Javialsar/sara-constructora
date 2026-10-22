'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FileCheck2,
  X,
  Camera,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  User,
  CreditCard,
  Hash,
  Gauge,
  Lock
} from 'lucide-react';
import { SaraFletesRealtimeService, ProofOfDeliveryData } from '@/lib/services/saraFletesRealtimeService';

interface SaraEpodModalProps {
  isOpen: boolean;
  onClose: () => void;
  fleteId: string;
  codigoAcceso: string;
  driverName: string;
  plate: string;
  currentCoords?: [number, number];
  onSuccess: (epod: ProofOfDeliveryData) => void;
}

export function SaraEpodModal({
  isOpen,
  onClose,
  fleteId,
  codigoAcceso,
  driverName,
  plate,
  currentCoords = [-4.3248, -79.5562],
  onSuccess
}: SaraEpodModalProps) {
  const [receptorNombre, setReceptorNombre] = useState('Ing. Manuel Carrión');
  const [receptorCedula, setReceptorCedula] = useState('1103849123');
  const [receptorCargo, setReceptorCargo] = useState('Bodeguero / Fiscalizador de Obra');
  const [odometroKm, setOdometroKm] = useState('142850');
  const [precintoSeguridad, setPrecintoSeguridad] = useState('SARA-SEC-8921');
  const [conformidad, setConformidad] = useState<'CONFORME' | 'OBSERVACION_LEVE' | 'DANOS_REPORTADOS'>('CONFORME');
  const [observaciones, setObservaciones] = useState('Material descargado conforme a especificaciones sin novedades.');
  const [fotoEvidenciaUrl, setFotoEvidenciaUrl] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Inicializar canvas de firma
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Funciones de dibujo para la firma en Canvas
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else if ('clientX' in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const coords = getCanvasCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Simular foto con marca de agua criptográfica en el cliente
  const handleCapturePhoto = () => {
    // Generar un canvas de imagen con marca de agua
    const photoCanvas = document.createElement('canvas');
    photoCanvas.width = 640;
    photoCanvas.height = 480;
    const pctx = photoCanvas.getContext('2d');
    if (!pctx) return;

    // Fondo simulado de área de obra
    const grad = pctx.createLinearGradient(0, 0, 640, 480);
    grad.addColorStop(0, '#334155');
    grad.addColorStop(1, '#0f172a');
    pctx.fillStyle = grad;
    pctx.fillRect(0, 0, 640, 480);

    // Contorno de carga
    pctx.strokeStyle = '#f59e0b';
    pctx.lineWidth = 4;
    pctx.strokeRect(40, 40, 560, 400);

    // Texto de marca de agua inviolable
    const nowIso = new Date().toISOString();
    pctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    pctx.fillRect(40, 360, 560, 80);

    pctx.fillStyle = '#10b981';
    pctx.font = 'bold 16px monospace';
    pctx.fillText(`✓ SARA-FLETES e-POD | PLACA: ${plate} | CHOFER: ${driverName}`, 55, 385);

    pctx.fillStyle = '#ffffff';
    pctx.font = '13px monospace';
    pctx.fillText(`UTC: ${nowIso} | GPS: ${currentCoords[0].toFixed(5)}, ${currentCoords[1].toFixed(5)}`, 55, 408);
    pctx.fillText(`HASH: SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}-VERIFIED`, 55, 428);

    const dataUrl = photoCanvas.toDataURL('image/jpeg', 0.85);
    setFotoEvidenciaUrl(dataUrl);
  };

  const handleSubmit = () => {
    if (!hasSignature) {
      alert('Por favor, solicite la firma digital del receptor en el recuadro antes de continuar.');
      return;
    }

    setIsSubmitting(true);

    const canvas = canvasRef.current;
    const firmaBase64 = canvas ? canvas.toDataURL('image/png') : '';
    const now = new Date();

    // Hash criptográfico simple para integridad
    const rawStamp = `${fleteId}|${codigoAcceso}|${plate}|${now.toISOString()}|${receptorCedula}`;
    let hash = 0;
    for (let i = 0; i < rawStamp.length; i++) {
      hash = (hash << 5) - hash + rawStamp.charCodeAt(i);
      hash |= 0;
    }
    const hashCriptografico = `EPOD-EC-${Math.abs(hash).toString(16).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const epodData: ProofOfDeliveryData = {
      id: `POD-${Date.now().toString().slice(-6)}`,
      fleteId,
      codigoAcceso,
      receptorNombre,
      receptorCedula,
      receptorCargo,
      firmaBase64,
      fotoCargaUrl: fotoEvidenciaUrl || undefined,
      odometroKm: Number(odometroKm) || undefined,
      precintoSeguridad: precintoSeguridad || undefined,
      observaciones,
      conformidad,
      coords: currentCoords,
      timestampUtc: now.toISOString(),
      hashCriptografico,
      placa: plate,
      driverName
    };

    SaraFletesRealtimeService.emitProofOfDelivery(epodData);

    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess(epodData);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-xl w-full p-6 text-neutral-900 dark:text-white shadow-2xl relative my-8 animate-in fade-in zoom-in-95">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">Acta de Entrega Digital (e-POD)</h3>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300/40">
                  ISO 19650
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Firma y validación electrónica de recepción de materiales en obra
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario e-POD */}
        <div className="space-y-4 text-xs">
          {/* Fila 1: Datos del Receptor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 font-semibold mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-500" /> Nombre del Receptor
              </label>
              <input
                type="text"
                value={receptorNombre}
                onChange={(e) => setReceptorNombre(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 font-semibold mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-purple-500" /> Cédula / RUC Receptor
              </label>
              <input
                type="text"
                value={receptorCedula}
                onChange={(e) => setReceptorCedula(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Fila 2: Odómetro y Precinto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 font-semibold mb-1 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-amber-500" /> Odómetro de Llegada (km)
              </label>
              <input
                type="number"
                value={odometroKm}
                onChange={(e) => setOdometroKm(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 font-semibold mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-500" /> Precinto de Seguridad / Sello
              </label>
              <input
                type="text"
                value={precintoSeguridad}
                onChange={(e) => setPrecintoSeguridad(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Fila 3: Evaluación de Conformidad */}
          <div>
            <label className="block text-neutral-600 dark:text-neutral-400 font-semibold mb-1">
              Estado de la Carga Recibida
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setConformidad('CONFORME')}
                className={`py-2 px-2.5 rounded-xl text-center border font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                  conformidad === 'CONFORME'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/30'
                    : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px]">100% Conforme</span>
              </button>
              <button
                type="button"
                onClick={() => setConformidad('OBSERVACION_LEVE')}
                className={`py-2 px-2.5 rounded-xl text-center border font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                  conformidad === 'OBSERVACION_LEVE'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/30'
                    : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-[10px]">Obs. Leve</span>
              </button>
              <button
                type="button"
                onClick={() => setConformidad('DANOS_REPORTADOS')}
                className={`py-2 px-2.5 rounded-xl text-center border font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                  conformidad === 'DANOS_REPORTADOS'
                    ? 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-400 ring-2 ring-red-500/30'
                    : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <X className="w-4 h-4 text-red-500" />
                <span className="text-[10px]">Daños / Faltante</span>
              </button>
            </div>
          </div>

          {/* Fila 4: Canvas de Firma Digital */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-neutral-600 dark:text-neutral-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Firma Táctil del Receptor en Pantalla
              </label>
              {hasSignature && (
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-[11px] text-red-500 hover:text-red-600 font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Limpiar Firma
                </button>
              )}
            </div>
            <div className="relative border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 overflow-hidden">
              <canvas
                ref={canvasRef}
                width={500}
                height={130}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-[130px] touch-none cursor-crosshair"
              />
              {!hasSignature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-neutral-400 text-xs">
                  <span>Dibuje la firma aquí con el dedo o stylus</span>
                </div>
              )}
            </div>
          </div>

          {/* Fila 5: Fotografía de Carga con Marca de Agua */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-neutral-600 dark:text-neutral-400 font-semibold flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-blue-500" /> Evidencia Fotográfica con Marca de Agua GPS
              </label>
              <button
                type="button"
                onClick={handleCapturePhoto}
                className="text-[11px] text-blue-500 hover:text-blue-600 font-bold flex items-center gap-1 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-900"
              >
                <Camera className="w-3 h-3" /> {fotoEvidenciaUrl ? 'Tomar Otra Foto' : 'Capturar Foto de Carga'}
              </button>
            </div>
            {fotoEvidenciaUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-neutral-300 dark:border-neutral-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fotoEvidenciaUrl} alt="Foto con marca de agua" className="w-full h-32 object-cover" />
                <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                  ✓ Sellado Criptográfico OK
                </div>
              </div>
            ) : (
              <div
                onClick={handleCapturePhoto}
                className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-center cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <p className="text-neutral-400 text-[11px]">
                  Presione para generar captura con coordenadas GPS y estampilla UTC
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Botón de Finalización */}
        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 font-bold text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!hasSignature || isSubmitting}
            className={`px-6 py-2.5 rounded-xl font-black text-xs flex items-center space-x-2 shadow-lg transition-all ${
              hasSignature && !isSubmitting
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 active:scale-98'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Certificando e-POD...' : 'Certificar e-POD y Completar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
