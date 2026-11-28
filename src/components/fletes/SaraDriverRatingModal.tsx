'use client';

import React, { useState } from 'react';
import {
  Banknote,
  CreditCard,
  Building2,
  CheckCircle2,
  QrCode,
  Star
} from 'lucide-react';
import { SaraFletesRealtimeService } from '@/lib/services/saraFletesRealtimeService';

export interface DriverToRate {
  fleteId: string;
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
  onOpenPaymentGateway: () => void;
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
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');
  const [ratingStars, setRatingStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(0);
  const [selectedRatingTags, setSelectedRatingTags] = useState<string[]>(['⚡ Puntualidad', '📦 Carga protegida']);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  if (!isOpen || !driverToRate) return null;

  const handleSubmit = () => {
    setIsSubmittingRating(true);
    SaraFletesRealtimeService.emit({
      type: 'FLETE_CALIFICADO',
      payload: {
        fleteId: driverToRate.fleteId,
        driverName: driverToRate.driverName,
        plate: driverToRate.plate,
        rating: ratingStars,
        comentario: ratingComment,
        tags: selectedRatingTags,
        metodoPago: paymentMethod,
        montoTotal: driverToRate.price
      }
    });

    const metodoTexto = paymentMethod === 'efectivo' 
      ? 'Efectivo en mano' 
      : paymentMethod === 'tarjeta' 
      ? 'Tarjeta Digital' 
      : 'Transferencia Bancaria';

    setTimeout(() => {
      setIsSubmittingRating(false);
      onClose();
      onRatingSubmitted(`Pago de $${driverToRate.price.toFixed(2)} USD registrado (${metodoTexto}) y calificación de ${ratingStars} ⭐ enviada. ¡Gracias por viajar con GoBee!`);
      setRatingComment('');
    }, 500);
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="driver-rating-title"
      className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
      tabIndex={-1}
    >
      <div className="bg-slate-900 border-2 border-emerald-500/70 rounded-3xl p-4 sm:p-6 max-w-md w-full max-h-[94dvh] overflow-y-auto shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 my-auto text-white">
        {/* Header */}
        <div className="text-center space-y-1">
          <span className="inline-block text-[10px] font-black uppercase text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full">
            🏁 ¡Viaje Completado con Éxito!
          </span>
          <h3 id="driver-rating-title" className="font-black text-white text-lg sm:text-xl mt-1.5">Pago y Calificación del Viaje</h3>
          <p className="text-xs text-slate-400">
            Confirma tu método de pago y califica el servicio recibido.
          </p>
        </div>

        {/* Tarjeta del Conductor y Monto Total (100% responsive sin desborde en móvil) */}
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
            <span className="font-mono tabular-nums font-black text-emerald-400 text-xl">
              ${driverToRate.price.toFixed(2)} <span className="text-xs font-bold text-emerald-300">USD</span>
            </span>
          </div>
        </div>

        {/* Selector de Método de Pago */}
        <div className="space-y-1.5 text-left">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
            <span>1. Método de Pago del Viaje</span>
            <span className="text-emerald-400 font-mono text-[10px] font-bold">100% Seguro</span>
          </label>

          <div className="grid grid-cols-3 gap-2">
            {/* Opción 1: Efectivo */}
            <button
              type="button"
              onClick={() => setPaymentMethod('efectivo')}
              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                paymentMethod === 'efectivo'
                  ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md shadow-emerald-950'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Banknote className={`w-5 h-5 ${paymentMethod === 'efectivo' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="text-[11px] font-bold leading-tight">Efectivo</span>
              <span className="text-[9px] text-slate-400 font-medium">En mano</span>
            </button>

            {/* Opción 2: Tarjeta */}
            <button
              type="button"
              onClick={() => {
                setPaymentMethod('tarjeta');
                onOpenPaymentGateway();
              }}
              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                paymentMethod === 'tarjeta'
                  ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md shadow-emerald-950'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <CreditCard className={`w-5 h-5 ${paymentMethod === 'tarjeta' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="text-[11px] font-bold leading-tight">Tarjeta</span>
              <span className="text-[9px] text-slate-400 font-medium">Débito / Crédito</span>
            </button>

            {/* Opción 3: Transferencia */}
            <button
              type="button"
              onClick={() => {
                setPaymentMethod('transferencia');
                onOpenPaymentGateway();
              }}
              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                paymentMethod === 'transferencia'
                  ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md shadow-emerald-950'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Building2 className={`w-5 h-5 ${paymentMethod === 'transferencia' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="text-[11px] font-bold leading-tight">Transferencia</span>
              <span className="text-[9px] text-slate-400 font-medium">Pichincha / Deuna</span>
            </button>
          </div>

          {/* Detalle del Pago Digital Confirmado en Pasarela */}
          {paymentDetails && (
            <div className="mt-2.5 bg-emerald-950/70 border border-emerald-500/60 p-2.5 rounded-xl text-xs flex items-center justify-between animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-white text-[11px] block">{paymentDetails.methodName}</span>
                  <span className="text-[10px] text-emerald-300 font-mono">Ref: {paymentDetails.reference} (${paymentDetails.amount.toFixed(2)} USD)</span>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenPaymentGateway}
                className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
              >
                Ver Pasarela
              </button>
            </div>
          )}

          {/* Botón para Abrir Pasarela si seleccionó Tarjeta o Transferencia */}
          {!paymentDetails && paymentMethod !== 'efectivo' && (
            <div className="mt-2 text-center">
              <button
                type="button"
                onClick={onOpenPaymentGateway}
                className="w-full py-2.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-400 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <QrCode className="w-4 h-4" />
                <span>Ver Datos Bancarios y Códigos QR del Transportista</span>
              </button>
            </div>
          )}
        </div>

        {/* Estrellas Interactivas (1 a 5) */}
        <div className="space-y-1.5 text-left pt-1 border-t border-slate-800/80">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
            2. Califica el Servicio del Conductor
          </label>
          <div className="text-center space-y-1.5 bg-slate-950 border border-slate-800/80 rounded-2xl py-3">
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
                    className="p-1 text-3xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        isFilled
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                          : 'text-slate-700 hover:text-amber-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-bold text-amber-400">
              {ratingStars === 5 && '⭐⭐⭐⭐⭐ ¡Servicio Excelente!'}
              {ratingStars === 4 && '⭐⭐⭐⭐ Muy buen servicio'}
              {ratingStars === 3 && '⭐⭐⭐ Servicio estándar'}
              {ratingStars === 2 && '⭐⭐ Mejorable'}
              {ratingStars === 1 && '⭐ Mal servicio'}
            </p>
          </div>
        </div>

        {/* Chips de Cumplidos */}
        <div className="space-y-1.5 text-left">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            ¿Qué fue lo más destacable?
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              '⚡ Puntualidad',
              '📦 Carga protegida',
              '💬 Excelente comunicación',
              '🚚 Conducción segura',
              '🤝 Trato muy profesional',
              '💰 Tarifa justa'
            ].map((tag) => {
              const isSelected = selectedRatingTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSelectedRatingTags(prev =>
                      isSelected ? prev.filter(t => t !== tag) : [...prev, tag]
                    );
                  }}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-black border-amber-500 shadow-sm'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Textarea de Comentario */}
        <div>
          <textarea
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            placeholder="Escribe un comentario sobre el servicio... (opcional)"
            rows={2}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
          ></textarea>
        </div>

        {/* Botón de Confirmar Pago y Calificar */}
        <button
          type="button"
          disabled={isSubmittingRating}
          onClick={handleSubmit}
          className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmittingRating ? (
            <span>Registrando...</span>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Confirmar Pago y Calificar Viaje</span>
            </>
          )}
        </button>

        {/* Botón Omitir */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-300 underline font-medium cursor-pointer"
          >
            Omitir calificación por ahora
          </button>
        </div>
      </div>
    </div>
  );
}
