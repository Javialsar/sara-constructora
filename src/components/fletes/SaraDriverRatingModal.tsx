'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Banknote,
  CreditCard,
  Building2,
  CheckCircle2,
  QrCode,
  Star,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { SaraFletesRealtimeService } from '@/lib/services/saraFletesRealtimeService';

export interface DriverToRate {
  fleteId: string;
  codigoAcceso?: string;
  driverName: string;
  plate: string;
  vehicleName: string;
  price: number;
}

export interface SaraDriverRatingModalProps {
  isOpen: boolean;
  driverToRate: DriverToRate | null;
  paymentDetails: {
    method: string;
    methodName: string;
    reference: string;
    amount: number;
  } | null;
  onClose: () => void;
  onOpenPaymentGateway: (method?: 'tarjeta' | 'transferencia') => void;
  onRatingSubmitted: (msg: string) => void;
}

export function SaraDriverRatingModal({
  isOpen,
  driverToRate,
  paymentDetails,
  onClose,
  onOpenPaymentGateway,
  onRatingSubmitted
}: SaraDriverRatingModalProps) {
  const [step, setStep] = useState<'pago' | 'calificacion'>('pago');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');
  const [ratingStars, setRatingStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(0);
  const [selectedRatingTags, setSelectedRatingTags] = useState<string[]>(['⚡ Puntualidad', '🤝 Trato muy profesional']);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const paymentDispatchedRef = useRef(false);

  // Reiniciar el asistente cada vez que se abre un nuevo viaje por pagar
  useEffect(() => {
    if (isOpen && driverToRate) {
      setStep(paymentDetails ? 'calificacion' : 'pago');
      setPaymentMethod('efectivo');
      setRatingStars(5);
      setRatingComment('');
      paymentDispatchedRef.current = false;
    }
  }, [isOpen, driverToRate?.fleteId]);

  const dispatchPaymentToDriver = (methodUsed: 'efectivo' | 'tarjeta' | 'transferencia', withRating: boolean) => {
    if (!driverToRate) return;

    SaraFletesRealtimeService.emit({
      type: 'FLETE_CALIFICADO',
      payload: {
        fleteId: driverToRate.fleteId,
        driverName: driverToRate.driverName,
        plate: driverToRate.plate,
        rating: withRating ? ratingStars : 5,
        comentario: withRating ? ratingComment : '',
        tags: withRating ? selectedRatingTags : [],
        metodoPago: methodUsed,
        montoTotal: driverToRate.price
      }
    });

    if (!paymentDispatchedRef.current) {
      paymentDispatchedRef.current = true;
      fetch('/api/fletes/dispatch', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: driverToRate.fleteId,
          codigoAcceso: driverToRate.codigoAcceso || undefined,
          status: 'pagada',
        }),
      }).catch(() => {});
    }
  };

  // Cuando la pasarela confirma pago con Tarjeta o Transferencia, notificar al conductor y avanzar a Paso 2
  useEffect(() => {
    if (isOpen && driverToRate && paymentDetails && step === 'pago') {
      const resolvedMethod: 'tarjeta' | 'transferencia' =
        paymentDetails.method === 'transferencia' || paymentDetails.method === 'deuna_qr'
          ? 'transferencia'
          : 'tarjeta';
      setPaymentMethod(resolvedMethod);
      dispatchPaymentToDriver(resolvedMethod, false);
      setStep('calificacion');
    }
  }, [paymentDetails, isOpen, driverToRate?.fleteId]);

  if (!isOpen || !driverToRate) return null;

  const metodoTexto =
    paymentMethod === 'efectivo'
      ? 'Efectivo'
      : paymentMethod === 'tarjeta'
      ? paymentDetails?.methodName || 'Tarjeta Digital'
      : paymentDetails?.methodName || 'Transferencia Bancaria';

  const handleConfirmPaymentStep = () => {
    if (paymentMethod === 'efectivo') {
      dispatchPaymentToDriver('efectivo', false);
      setStep('calificacion');
      return;
    }
    if (paymentDetails) {
      dispatchPaymentToDriver(paymentMethod, false);
      setStep('calificacion');
      return;
    }
    onOpenPaymentGateway(paymentMethod);
  };

  const handleSubmitRating = () => {
    setIsSubmittingRating(true);
    dispatchPaymentToDriver(paymentMethod, true);

    setTimeout(() => {
      setIsSubmittingRating(false);
      onClose();
      onRatingSubmitted(
        `Pago de $${driverToRate.price.toFixed(2)} USD confirmado (${metodoTexto}) y calificación de ${ratingStars} ⭐ enviada. ¡Gracias por usar GoBee!`
      );
      setRatingComment('');
    }, 350);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="driver-rating-title"
      className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      tabIndex={-1}
    >
      <div className="bg-slate-900 border-2 border-emerald-500/70 rounded-3xl p-4 sm:p-6 max-w-md w-full max-h-[94dvh] overflow-y-auto shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 my-auto text-white">
        {/* Indicador limpio de 2 pasos */}
        <div className="flex items-center justify-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
              step === 'pago'
                ? 'bg-[#FDBE3B] text-[#111827] border-[#FDBE3B]'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {step === 'pago' ? '1. Pago' : '✓ 1. Pagado'}
          </span>
          <span className="w-5 h-0.5 bg-slate-700 rounded-full" />
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
              step === 'calificacion'
                ? 'bg-[#FDBE3B] text-[#111827] border-[#FDBE3B]'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            2. Calificar
          </span>
        </div>

        {/* ================================================================= */}
        {/* PASO 1: PAGO DEL SERVICIO                                         */}
        {/* ================================================================= */}
        {step === 'pago' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="text-center space-y-1">
              <span className="inline-block text-[10px] font-black uppercase text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full">
                🏁 ¡Servicio Completado!
              </span>
              <h3 id="driver-rating-title" className="font-black text-white text-lg sm:text-xl mt-1">
                ¿Cómo deseas pagar?
              </h3>
              <p className="text-xs text-slate-400">
                Selecciona tu método de pago para finalizar el cobro.
              </p>
            </div>

            {/* Tarjeta del Conductor y Monto Total */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-[#FDBE3B]/20 text-[#FDBE3B] border border-[#FDBE3B]/40 flex items-center justify-center font-black text-base shadow-inner shrink-0">
                  {driverToRate.driverName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-white text-sm truncate">{driverToRate.driverName}</h4>
                  <p className="text-xs text-slate-400 truncate">
                    {driverToRate.vehicleName.replace(/SARA/gi, 'GoBee')}
                  </p>
                  {driverToRate.plate && driverToRate.plate.trim().length > 0 && (
                    <span className="inline-block mt-1 text-[10px] font-mono font-bold text-[#FDBE3B] bg-[#FDBE3B]/10 px-2 py-0.5 rounded border border-[#FDBE3B]/30">
                      Placa: {driverToRate.plate}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-800/90 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                  Total a Pagar
                </span>
                <span className="font-mono tabular-nums font-black text-emerald-400 text-2xl">
                  ${driverToRate.price.toFixed(2)} <span className="text-xs font-bold text-emerald-300">USD</span>
                </span>
              </div>
            </div>

            {/* 3 Métodos de Pago */}
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
                <span>Elige tu método de pago</span>
                <span className="text-emerald-400 font-mono text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> 100% Seguro
                </span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('efectivo')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                    paymentMethod === 'efectivo'
                      ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md shadow-emerald-950'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Banknote className={`w-5 h-5 ${paymentMethod === 'efectivo' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="text-[11px] font-bold leading-tight">Efectivo</span>
                  <span className="text-[9px] text-slate-400">En mano</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('tarjeta');
                    onOpenPaymentGateway('tarjeta');
                  }}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                    paymentMethod === 'tarjeta'
                      ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md shadow-emerald-950'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className={`w-5 h-5 ${paymentMethod === 'tarjeta' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="text-[11px] font-bold leading-tight">Tarjeta</span>
                  <span className="text-[9px] text-slate-400">Débito / Crédito</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('transferencia');
                    onOpenPaymentGateway('transferencia');
                  }}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                    paymentMethod === 'transferencia'
                      ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md shadow-emerald-950'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Building2 className={`w-5 h-5 ${paymentMethod === 'transferencia' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="text-[11px] font-bold leading-tight">Transferencia</span>
                  <span className="text-[9px] text-slate-400">Banco / QR</span>
                </button>
              </div>
            </div>

            {/* Botón Principal del Paso 1 */}
            <button
              type="button"
              onClick={handleConfirmPaymentStep}
              className="w-full min-h-[48px] py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              {paymentMethod === 'efectivo' ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirmar Pago en Efectivo · ${driverToRate.price.toFixed(2)}</span>
                </>
              ) : paymentMethod === 'tarjeta' ? (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Pagar con Tarjeta · ${driverToRate.price.toFixed(2)}</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <QrCode className="w-5 h-5" />
                  <span>Pagar con Transferencia / QR · ${driverToRate.price.toFixed(2)}</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* PASO 2: CALIFICACIÓN DEL CONDUCTOR                                */}
        {/* ================================================================= */}
        {step === 'calificacion' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Pago confirmado · ${driverToRate.price.toFixed(2)} ({metodoTexto})
                </span>
              </div>
              {paymentDetails?.reference && (
                <p className="text-[10px] font-mono text-emerald-400/90">
                  Comprobante Ref: {paymentDetails.reference}
                </p>
              )}
              <h3 id="driver-rating-title" className="font-black text-white text-lg sm:text-xl pt-1">
                ¿Cómo estuvo tu viaje con {driverToRate.driverName.split(' ')[0]}?
              </h3>
            </div>

            {/* Estrellas Interactivas */}
            <div className="text-center space-y-1.5 bg-slate-950 border border-slate-800/80 rounded-2xl py-3.5">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= (hoverStars || ratingStars);
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverStars(star)}
                      onMouseLeave={() => setHoverStars(0)}
                      onClick={() => setRatingStars(star)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          isFilled
                            ? 'fill-[#FDBE3B] text-[#FDBE3B] drop-shadow-[0_0_8px_rgba(253,190,59,0.55)]'
                            : 'text-slate-700 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="text-xs font-bold text-[#FDBE3B]">
                {ratingStars === 5 && '¡Servicio Excelente!'}
                {ratingStars === 4 && 'Muy buen servicio'}
                {ratingStars === 3 && 'Servicio estándar'}
                {ratingStars === 2 && 'Mejorable'}
                {ratingStars === 1 && 'Mal servicio'}
              </p>
            </div>

            {/* Chips rápidos */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                ¿Qué destacarías? (Opcional)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '⚡ Puntualidad',
                  '🤝 Trato muy profesional',
                  '💬 Excelente comunicación',
                  '🚚 Conducción segura',
                  '📦 Carga protegida',
                  '💰 Tarifa justa'
                ].map((tag) => {
                  const isSelected = selectedRatingTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSelectedRatingTags((prev) =>
                          isSelected ? prev.filter((t) => t !== tag) : [...prev, tag]
                        );
                      }}
                      className={`text-xs px-2.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FDBE3B] text-[#111827] font-black border-[#FDBE3B] shadow-sm'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comentario opcional */}
            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Escribe un comentario breve... (opcional)"
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FDBE3B] resize-none select-text"
            />

            {/* Botón Enviar Calificación */}
            <button
              type="button"
              disabled={isSubmittingRating}
              onClick={handleSubmitRating}
              className="w-full min-h-[48px] py-3.5 px-4 bg-[#FDBE3B] hover:bg-[#F5B024] disabled:bg-slate-800 text-[#111827] font-black rounded-2xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmittingRating ? (
                <span>Enviando...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Enviar Calificación y Finalizar</span>
                </>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRatingSubmitted(`Pago de $${driverToRate.price.toFixed(2)} USD confirmado (${metodoTexto}). ¡Gracias por usar GoBee!`);
                }}
                className="text-xs text-slate-400 hover:text-slate-200 underline font-medium cursor-pointer"
              >
                Omitir calificación
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
