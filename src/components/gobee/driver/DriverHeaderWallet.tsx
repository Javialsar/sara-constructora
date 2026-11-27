'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  Navigation,
  Plus,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Wallet,
} from 'lucide-react';
import { GOBEE_BRAND, type GobeeDriverVerificationState } from '@/lib/gobee/gobeeTypes';

export interface DriverHeaderWalletProps {
  driverName: string;
  plate: string;
  walletBalanceUSD: number;
  dailyNetEarningsUSD: number;
  tripsToday: number;
  verification: GobeeDriverVerificationState;
  onQuickTopUp: () => void;
  onToggleVerificationStep?: (step: keyof GobeeDriverVerificationState) => void;
}

const VERIFICATION_STEPS: Array<{ key: keyof GobeeDriverVerificationState; label: string }> = [
  { key: 'cedula', label: '1. Cédula' },
  { key: 'licencia', label: '2. Licencia' },
  { key: 'matricula', label: '3. Matrícula' },
  { key: 'biometria', label: '4. Biometría' },
];

export function DriverHeaderWallet({
  driverName,
  plate,
  walletBalanceUSD,
  dailyNetEarningsUSD,
  tripsToday,
  verification,
  onQuickTopUp,
  onToggleVerificationStep,
}: DriverHeaderWalletProps) {
  const completedSteps = VERIFICATION_STEPS.filter((s) => verification[s.key]).length;
  const isLowBalance = walletBalanceUSD < 5;

  return (
    <header className="w-full bg-[#0F172A] border-b border-slate-800 px-4 pt-4 pb-4 space-y-3.5">
      {/* Identidad Gobee Conductor + Sello discreto */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#FDBE3B] text-[#111827] flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <Navigation className="w-5 h-5 fill-[#111827]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-black text-base tracking-tight text-white">Gobee</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#FDBE3B]/20 text-[#FDBE3B]">
                Conductor
              </span>
              {plate && (
                <span className="font-mono tabular-nums text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                  {plate}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {driverName} · {GOBEE_BRAND.seal}
            </p>
          </div>
        </div>

        <Link
          href="/modulos/fletes"
          className="min-h-[40px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center border border-slate-700 shrink-0"
        >
          Vista Cliente
        </Link>
      </div>

      {/* Tarjetas financieras: Saldo Prepago + Ganancia Neta Diaria */}
      <div className="grid grid-cols-2 gap-2.5">
        <div
          className={`rounded-2xl p-3.5 border ${
            isLowBalance
              ? 'bg-rose-950/40 border-rose-500/50'
              : 'bg-slate-900/90 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-[#FDBE3B]" />
              Saldo Prepago
            </span>
            <button
              type="button"
              onClick={onQuickTopUp}
              aria-label="Recargar saldo prepago"
              className="min-w-[30px] min-h-[30px] rounded-lg bg-[#FDBE3B] hover:bg-[#F5B024] text-[#111827] flex items-center justify-center cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
          <div className="font-mono tabular-nums text-2xl font-black text-white mt-1">
            ${walletBalanceUSD.toFixed(2)}
          </div>
          <p className={`text-[10px] mt-0.5 font-semibold ${isLowBalance ? 'text-rose-300' : 'text-slate-400'}`}>
            {isLowBalance ? 'Recarga mínima $5.00 para efectivo' : 'Habilitado para efectivo y tarjeta'}
          </p>
        </div>

        <div className="rounded-2xl p-3.5 bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Ganancia Neta Hoy
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
              {tripsToday} viajes
            </span>
          </div>
          <div className="font-mono tabular-nums text-2xl font-black text-[#FDBE3B] mt-1">
            ${dailyNetEarningsUSD.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Libre de comisiones Gobee</p>
        </div>
      </div>

      {/* Estado de Verificación en 4 Pasos */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            {completedSteps === 4 ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <UserCheck className="w-4 h-4 text-[#FDBE3B]" />
            )}
            Verificación de Conductor
          </span>
          <span className="font-mono tabular-nums text-[11px] font-black text-[#FDBE3B]">
            {completedSteps}/4 pasos
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {VERIFICATION_STEPS.map((s) => {
            const done = verification[s.key];
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => onToggleVerificationStep?.(s.key)}
                className={`min-h-[38px] rounded-xl px-2 py-1.5 text-[10px] font-bold flex items-center justify-center gap-1 border transition-colors cursor-pointer ${
                  done
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {done ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-3 h-3 text-slate-600 shrink-0" />
                )}
                <span className="truncate">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
