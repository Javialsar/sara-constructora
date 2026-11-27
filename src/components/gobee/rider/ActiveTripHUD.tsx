'use client';

import React, { useRef, useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  MessageSquare,
  Phone,
  PhoneCall,
  Send,
  Share2,
  ShieldAlert,
  Star,
  X,
} from 'lucide-react';
import { GOBEE_BRAND, GOBEE_CATEGORY_MAP, type GobeeActiveTrip } from '@/lib/gobee/gobeeTypes';

export interface ActiveTripHUDProps {
  trip: GobeeActiveTrip;
  chatMessages: Array<{ id: string; sender: 'rider' | 'driver'; text: string; at: string }>;
  onSendChatMessage: (text: string) => void;
  onCancelTrip: () => void;
}

const SOS_HOLD_MS = 2500;

export function ActiveTripHUD({
  trip,
  chatMessages,
  onSendChatMessage,
  onCancelTrip,
}: ActiveTripHUDProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [sosProgress, setSosProgress] = useState(0);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [sosFeedback, setSosFeedback] = useState<string | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStartRef = useRef<number>(0);

  const categoryCfg = GOBEE_CATEGORY_MAP[trip.category];

  const handleShareWhatsApp = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const trackingUrl = `${baseUrl}/fletes/rastreo/${encodeURIComponent(trip.trackingToken)}`;
    const driverInfo = trip.driver
      ? `Conductor: ${trip.driver.name} · Placa: ${trip.driver.plate} (${trip.driver.vehicleLabel})`
      : `Buscando conductor ${categoryCfg.name}`;
    const msg = `Viajo seguro con Gobee (Grupo Sara).\n${driverInfo}\nRuta: ${trip.origin.label} → ${trip.destination.label}\nSigue mi viaje en vivo: ${trackingUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  const triggerSos = async () => {
    setSosTriggered(true);
    setSosFeedback(null);
    const dispatchAlert = async (lat: number, lng: number) => {
      try {
        const res = await fetch('/api/fletes/sos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: trip.orderId || undefined,
            role: 'customer',
            alertType: 'manual_sos',
            lat,
            lng,
            details: {
              tripId: trip.id,
              plate: trip.driver?.plate || null,
              source: 'gobee_active_trip_hud_2_5s',
            },
          }),
        });
        if (res.ok) {
          setSosFeedback('Central de seguridad Gobee notificada con tu GPS en vivo.');
        } else {
          setSosFeedback('Alerta local activada. Usa el botón ECU 911 si necesitas asistencia inmediata.');
        }
      } catch {
        setSosFeedback('Sin señal de datos. Llama directamente al ECU 911.');
      }
    };

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => void dispatchAlert(pos.coords.latitude, pos.coords.longitude),
        () => void dispatchAlert(trip.origin.lat, trip.origin.lng),
        { enableHighAccuracy: true, timeout: 4000 }
      );
    } else {
      void dispatchAlert(trip.origin.lat, trip.origin.lng);
    }
  };

  const handleSosDown = () => {
    if (sosTriggered) return;
    holdStartRef.current = Date.now();
    holdTimerRef.current = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - holdStartRef.current) / SOS_HOLD_MS) * 100);
      setSosProgress(pct);
      if (pct >= 100) {
        if (holdTimerRef.current) clearInterval(holdTimerRef.current);
        holdTimerRef.current = null;
        void triggerSos();
      }
    }, 45);
  };

  const handleSosUp = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (!sosTriggered) setSosProgress(0);
  };

  const submitChat = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    onSendChatMessage(trimmed);
    setChatInput('');
  };

  return (
    <div className="relative z-20 -mt-5 rounded-t-[28px] bg-[#FAFAFA] text-[#111827] shadow-[0_-10px_30px_rgba(17,24,39,0.14)] border-t border-black/5 px-4 pt-3 pb-6 max-w-2xl mx-auto w-full space-y-3.5">
      <div className="w-12 h-1.5 rounded-full bg-neutral-300 mx-auto" />

      {/* Encabezado de estado del viaje */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wide px-2.5 py-1 rounded-full bg-[#FDBE3B] text-[#111827]">
              {trip.status === 'searching' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {trip.status === 'searching'
                ? `Buscando ${categoryCfg.name}`
                : trip.status === 'accepted'
                ? 'Conductor en camino'
                : 'Viaje en curso'}
            </span>
            <span className="font-mono tabular-nums text-xs font-black px-2.5 py-1 rounded-full bg-[#111827] text-white">
              PIN {trip.pinCode}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1 truncate max-w-[260px] sm:max-w-md">
            {trip.origin.label} → {trip.destination.label}
          </p>
        </div>

        <div className="text-right">
          <div className="font-mono tabular-nums text-xl font-black text-[#111827]">
            ${trip.agreedPriceUSD.toFixed(2)}
          </div>
          <span className="text-[10px] uppercase font-bold text-neutral-500">{trip.paymentMethod}</span>
        </div>
      </div>

      {/* Tarjeta de Conductor Asignado */}
      {trip.driver ? (
        <div className="rounded-2xl bg-white border border-neutral-200 p-3.5 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#111827] text-[#FDBE3B] font-black text-lg flex items-center justify-center shrink-0">
              {trip.driver.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-black text-sm text-[#111827] truncate">{trip.driver.name}</p>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-600">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {trip.driver.rating.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-neutral-500 truncate">{trip.driver.vehicleLabel}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono tabular-nums text-xs font-black tracking-wider px-2 py-0.5 rounded-md bg-[#111827] text-[#FDBE3B]">
                  {trip.driver.plate}
                </span>
                <span className="text-[11px] font-semibold text-emerald-700">
                  Llega en ~{trip.driver.etaMin} min
                </span>
              </div>
            </div>
          </div>

          {/* Botones Chat y Voz */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setChatOpen((prev) => !prev)}
              aria-label="Abrir chat con conductor"
              className="min-w-[44px] min-h-[44px] rounded-xl bg-neutral-100 hover:bg-[#FDBE3B]/30 text-[#111827] flex items-center justify-center cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <a
              href={`tel:${trip.driver.phone}`}
              aria-label="Llamar al conductor"
              className="min-w-[44px] min-h-[44px] rounded-xl bg-[#111827] hover:bg-neutral-800 text-[#FDBE3B] flex items-center justify-center"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-neutral-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FDBE3B]/25 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-[#111827] animate-spin" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-[#111827]">Transmitiendo solicitud por Supabase Realtime</p>
            <p className="text-neutral-500">Notificando a conductores {categoryCfg.name} en tu radio GPS...</p>
          </div>
        </div>
      )}

      {/* Cajón rápido de Chat */}
      {chatOpen && (
        <div className="rounded-2xl bg-white border border-neutral-200 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#111827]">Chat cifrado con tu conductor</span>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="p-1 rounded-lg hover:bg-neutral-100 cursor-pointer"
            >
              <X className="w-4 h-4 text-neutral-500" />
            </button>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1.5 text-xs">
            {chatMessages.length === 0 ? (
              <p className="text-neutral-400 text-[11px]">Envía una indicación rápida (ej. portón, edificio).</p>
            ) : (
              chatMessages.map((m) => (
                <div
                  key={m.id}
                  className={`px-3 py-1.5 rounded-xl max-w-[85%] ${
                    m.sender === 'rider'
                      ? 'ml-auto bg-[#FDBE3B] text-[#111827] font-semibold'
                      : 'bg-neutral-100 text-[#111827]'
                  }`}
                >
                  {m.text}
                </div>
              ))
            )}
          </div>
          <form onSubmit={submitChat} className="flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 min-h-[40px] rounded-xl bg-neutral-100 px-3 text-xs font-medium outline-none"
            />
            <button
              type="submit"
              className="min-w-[40px] min-h-[40px] rounded-xl bg-[#111827] text-[#FDBE3B] flex items-center justify-center cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Alerta SOS confirmada */}
      {sosTriggered && (
        <div className="rounded-2xl bg-rose-50 border border-rose-300 p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-rose-700 font-black text-xs uppercase">
            <CheckCircle2 className="w-4 h-4" />
            Alerta SOS Activada
          </div>
          {sosFeedback && <p className="text-xs text-rose-800">{sosFeedback}</p>}
          <div className="flex gap-2">
            <a
              href="tel:911"
              className="flex-1 min-h-[44px] rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center justify-center gap-1.5"
            >
              <PhoneCall className="w-4 h-4" />
              Llamar ECU 911
            </a>
            <button
              type="button"
              onClick={() => {
                setSosTriggered(false);
                setSosProgress(0);
              }}
              className="px-3 min-h-[44px] rounded-xl bg-white border border-rose-200 text-xs font-bold text-rose-700 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Acciones de Seguridad: Compartir WhatsApp + Botón SOS 2.5s + Cancelar */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="min-h-[48px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Compartir WhatsApp</span>
        </button>

        <button
          type="button"
          onPointerDown={handleSosDown}
          onPointerUp={handleSosUp}
          onPointerLeave={handleSosUp}
          onPointerCancel={handleSosUp}
          className="relative overflow-hidden min-h-[48px] rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center justify-center gap-2 select-none touch-none shadow-sm cursor-pointer"
        >
          <span
            className="absolute inset-y-0 left-0 bg-white/35 transition-all duration-75"
            style={{ width: `${sosProgress}%` }}
          />
          <ShieldAlert className="w-4 h-4 relative z-10" />
          <span className="relative z-10">SOS (Mantén 2.5s)</span>
        </button>
      </div>

      {trip.status !== 'in_transit' && (
        <button
          type="button"
          onClick={onCancelTrip}
          className="w-full min-h-[42px] rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 text-xs font-bold text-neutral-600 cursor-pointer"
        >
          Cancelar solicitud
        </button>
      )}

      <p className="text-center text-[10px] font-medium text-neutral-400">{GOBEE_BRAND.seal}</p>
    </div>
  );
}
