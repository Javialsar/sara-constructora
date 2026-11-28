'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, CheckCircle2, KeyRound, Loader2, Unlock } from 'lucide-react';

interface OwnerReservation {
  id: string;
  placa: string;
  vehiculo_nombre: string;
  cliente_nombre: string;
  cliente_telefono: string;
  modalidad_renta: string;
  duracion_tipo: string;
  duracion_valor: number;
  fecha_inicio: string;
  fecha_fin: string;
  tarifa_total: number;
  pin_desbloqueo: string;
  estado: 'SOLICITADA' | 'CONFIRMADA' | 'EN_CURSO' | 'COMPLETADA' | 'CANCELADA';
}

interface GobeeOwnerRentaCardProps {
  ownerPlate?: string;
  ownerId?: string;
  rentaEnabled: boolean;
  onNotify?: (msg: string) => void;
}

export default function GobeeOwnerRentaCard({
  ownerPlate,
  ownerId,
  rentaEnabled,
  onNotify,
}: GobeeOwnerRentaCardProps) {
  const [reservations, setReservations] = useState<OwnerReservation[]>([]);
  const [codeInputs, setCodeInputs] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadReservations = useCallback(async () => {
    if (!ownerPlate && !ownerId) return;
    try {
      const qs = new URLSearchParams();
      if (ownerPlate) qs.set('ownerPlate', ownerPlate);
      else if (ownerId) qs.set('ownerId', ownerId);
      const res = await fetch(`/api/fletes/renta?${qs.toString()}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setReservations(Array.isArray(data?.reservations) ? data.reservations : []);
    } catch {
      // silencioso
    }
  }, [ownerPlate, ownerId]);

  useEffect(() => {
    if (!rentaEnabled && !ownerPlate) return;
    void loadReservations();
    const timer = setInterval(loadReservations, 15000);
    return () => clearInterval(timer);
  }, [rentaEnabled, ownerPlate, loadReservations]);

  if (reservations.length === 0) return null;

  const handleDeliver = async (r: OwnerReservation) => {
    const code = (codeInputs[r.id] || '').trim().toUpperCase();
    if (!code) {
      onNotify?.('⚠️ Ingresa el código de reserva que te muestra el cliente.');
      return;
    }
    setBusyId(r.id);
    try {
      const res = await fetch('/api/fletes/renta', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'entregar', reservaId: r.id, codigo: code }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        onNotify?.(`⚠️ ${data?.error || 'Código incorrecto.'}`);
        return;
      }
      onNotify?.(`✅ Código ${code} validado. Vehículo entregado en renta.`);
      await loadReservations();
    } finally {
      setBusyId(null);
    }
  };

  const handleFinish = async (r: OwnerReservation) => {
    setBusyId(r.id);
    try {
      const res = await fetch('/api/fletes/renta', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'finalizar', reservaId: r.id }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        onNotify?.(`⚠️ ${data?.error || 'No se pudo liberar el vehículo.'}`);
        return;
      }
      onNotify?.('✅ Renta finalizada. Tu vehículo volvió a quedar disponible para nuevos clientes.');
      await loadReservations();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-slate-900/95 border border-[#FDBE3B]/50 rounded-2xl p-3 space-y-2.5 shadow-xl">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-black uppercase text-[#FDBE3B] tracking-wider flex items-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5" />
          Reservas de Renta ({reservations.length})
        </span>
        <span className="text-[10px] text-slate-400 font-mono">{ownerPlate}</span>
      </div>

      {reservations.map((r) => {
        const isInCourse = r.estado === 'EN_CURSO';
        const abono = +(Number(r.tarifa_total || 0) * 0.2).toFixed(2);
        const saldo = +(Number(r.tarifa_total || 0) - abono).toFixed(2);
        const startLabel = new Date(r.fecha_inicio).toLocaleDateString('es-EC', {
          day: '2-digit',
          month: 'short',
        });
        const endLabel = new Date(r.fecha_fin).toLocaleDateString('es-EC', {
          day: '2-digit',
          month: 'short',
        });

        return (
          <div
            key={r.id}
            className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-2 text-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-black text-white truncate">{r.cliente_nombre}</p>
              <span
                className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                  isInCourse
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-[#FDBE3B]/20 text-[#FDBE3B] border border-[#FDBE3B]/40'
                }`}
              >
                {isInCourse ? 'En Renta' : 'Reservado'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#FDBE3B]" />
                {startLabel} → {endLabel} ({r.duracion_valor} {r.duracion_tipo.toLowerCase()})
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                Saldo: ${saldo.toFixed(2)}
              </span>
            </div>

            {!isInCourse ? (
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  value={codeInputs[r.id] || ''}
                  onChange={(e) =>
                    setCodeInputs((prev) => ({ ...prev, [r.id]: e.target.value.toUpperCase() }))
                  }
                  placeholder="Código GB-XXXX"
                  className="flex-1 min-w-0 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#FDBE3B]"
                />
                <button
                  type="button"
                  disabled={busyId === r.id}
                  onClick={() => handleDeliver(r)}
                  className="shrink-0 bg-[#FDBE3B] hover:bg-[#F5B024] text-[#111827] font-black text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  {busyId === r.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Entregar</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={busyId === r.id}
                onClick={() => handleFinish(r)}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {busyId === r.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Unlock className="w-3.5 h-3.5" />
                )}
                <span>Finalizar Renta y Liberar Vehículo</span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
