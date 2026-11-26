'use client';

import React, { useState } from 'react';
import { Loader2, Mic, MicOff, Sparkles } from 'lucide-react';

export interface VoiceBookingParsed {
  vertical: 'viajes' | 'mandaditos' | 'fletes' | 'renta';
  origin_label: string;
  dest_label: string;
  recommended_vehicle_type: 'auto' | 'moto' | 'camioneta' | 'camion_3_5t' | 'volqueta' | 'plataforma';
  stevedores_count: number;
  rental_hours: number;
  cargo_notes: string;
}

interface VoiceBookingButtonProps {
  onBookingExtracted: (booking: VoiceBookingParsed, transcript: string) => void;
}

export function VoiceBookingButton({ onBookingExtracted }: VoiceBookingButtonProps) {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const startVoiceBooking = () => {
    if (typeof window === 'undefined') return;
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;

    if (!SpeechRec) {
      setStatusMsg('Dictado por voz no soportado en este navegador.');
      return;
    }

    const recognition = new SpeechRec();
    recognition.lang = 'es-EC';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
      setStatusMsg('Escuchando tu solicitud...');
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setStatusMsg('No se escuchó voz clara.');
    };
    recognition.onresult = async (event: any) => {
      const transcript: string = event?.results?.[0]?.[0]?.transcript || '';
      if (!transcript) return;
      setProcessing(true);
      setStatusMsg(`Interpretando: "${transcript}"`);

      try {
        const res = await fetch('/api/fletes/voice-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.success || !data.booking) {
          setStatusMsg(data?.error || 'No se pudo interpretar la solicitud por voz.');
          return;
        }
        onBookingExtracted(data.booking as VoiceBookingParsed, transcript);
        setStatusMsg('Solicitud completada automáticamente por IA.');
      } catch {
        setStatusMsg('Error conectando con Voice Booking IA.');
      } finally {
        setProcessing(false);
      }
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={startVoiceBooking}
        disabled={processing}
        className={`min-h-[44px] px-4 py-2 rounded-xl font-black text-xs inline-flex items-center gap-2 transition-all cursor-pointer ${
          listening
            ? 'bg-rose-500 text-white animate-pulse'
            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20'
        }`}
      >
        {processing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : listening ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
        <span>{listening ? 'Escuchando...' : 'Pedir por Voz IA'}</span>
        <Sparkles className="w-3.5 h-3.5" />
      </button>
      {statusMsg && <span className="text-[11px] text-amber-300/90 max-w-xs truncate">{statusMsg}</span>}
    </div>
  );
}
