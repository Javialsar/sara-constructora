'use client';

import React, { useRef, useState } from 'react';
import { PhoneCall, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface HoldSosButtonProps {
  orderId?: string | null;
  role: 'customer' | 'driver';
}

const HOLD_DURATION_MS = 2500;

export function HoldSosButton({ orderId, role }: HoldSosButtonProps) {
  const [progress, setProgress] = useState(0);
  const [triggered, setTriggered] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const fireSosAlert = async () => {
    setTriggered(true);
    setErrorMsg(null);

    const sendWithCoords = async (lat: number, lng: number) => {
      try {
        const res = await fetch('/api/fletes/sos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderId || undefined,
            role,
            alertType: 'manual_sos',
            lat,
            lng,
            details: { source: 'hold_2_5s_button', timestamp: new Date().toISOString() },
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setErrorMsg(data?.error || 'Alerta local activada (inicia sesión para sincronizar en servidor).');
        }
      } catch {
        setErrorMsg('Sin conexión: utiliza el botón directo ECU 911.');
      }
    };

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => sendWithCoords(pos.coords.latitude, pos.coords.longitude),
        () => setErrorMsg('No se pudo leer GPS para SOS. Llama directo al ECU 911.'),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  const handlePressStart = () => {
    if (triggered) return;
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        fireSosAlert();
      }
    }, 50);
  };

  const handlePressEnd = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (!triggered) setProgress(0);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
      {triggered && (
        <div className="rounded-2xl border border-rose-500/60 bg-slate-950/95 p-4 shadow-2xl max-w-xs space-y-2.5">
          <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase">
            <CheckCircle2 className="w-4 h-4" />
            Alerta SOS Registrada
          </div>
          {errorMsg && <p className="text-[11px] text-amber-300">{errorMsg}</p>}
          <a
            href="tel:911"
            className="min-h-[44px] w-full rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            Llamar Directo ECU 911
          </a>
          <button
            type="button"
            onClick={() => {
              setTriggered(false);
              setProgress(0);
            }}
            className="w-full text-[11px] text-slate-400 hover:text-white cursor-pointer"
          >
            Cerrar aviso
          </button>
        </div>
      )}

      <button
        type="button"
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
        onPointerCancel={handlePressEnd}
        className="relative overflow-hidden min-h-[48px] px-4 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-xl shadow-rose-900/40 select-none touch-none cursor-pointer flex items-center gap-2"
      >
        <span
          className="absolute inset-y-0 left-0 bg-white/30 transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
        <ShieldAlert className="w-4 h-4 relative z-10" />
        <span className="relative z-10">
          <span className="hidden sm:inline">Mantén presionado 2.5s para </span>SOS
        </span>
      </button>
    </div>
  );
}
