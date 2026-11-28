'use client';

import React from 'react';
import {
  CheckCircle2,
  Circle,
  Navigation,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
  UserCheck,
  Wallet,
  X,
} from 'lucide-react';
import { GOBEE_BRAND, type GobeeDriverVerificationState } from '@/lib/gobee/gobeeTypes';

export interface DriverHeaderWalletProps {
  driverName: string;
  plate: string;
  walletBalanceUSD: number;
  dailyNetEarningsUSD: number;
  tripsToday: number;
  verification: GobeeDriverVerificationState;
  isOnline: boolean;
  drawerOpen: boolean;
  onToggleDrawer: () => void;
  onToggleOnline: () => void;
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
  isOnline,
  drawerOpen,
  onToggleDrawer,
  onToggleOnline,
  onQuickTopUp,
  onToggleVerificationStep,
}: DriverHeaderWalletProps) {
  const completedSteps = VERIFICATION_STEPS.filter((s) => verification[s.key]).length;
  const isLowBalance = walletBalanceUSD < 5;

  return (
    <>
      {/* Barra superior flotante y compacta sobre el mapa (sin botón Vista Cliente) */}
      <header className="pointer-events-none fixed top-3 inset-x-3 z-[450] flex items-center justify-between gap-2 max-w-3xl mx-auto">
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-[#0F172A]/92 backdrop-blur-md border border-slate-700/80 px-3 py-2 shadow-xl min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#FDBE3B] text-[#111827] flex items-center justify-center shrink-0">
            <Navigation className="w-4 h-4 fill-[#111827]" />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-white">GoBee</span>
              {plate && (
                <span className="font-mono tabular-nums text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-[#FDBE3B] border border-slate-700">
                  {plate}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums">
              <span className={isLowBalance ? 'text-rose-400 font-bold' : 'text-slate-300 font-bold'}>
                Saldo ${walletBalanceUSD.toFixed(2)}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[#FDBE3B] font-black">Hoy ${dailyNetEarningsUSD.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 shrink-0">
          {/* Switch compacto ON/OFF directo en cabecera */}
          <button
            type="button"
            onClick={onToggleOnline}
            className={`min-h-[42px] px-3 rounded-2xl font-black text-xs shadow-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
              isOnline
                ? 'bg-[#FDBE3B] text-[#111827] border-[#FDBE3B]'
                : 'bg-[#0F172A]/92 text-slate-300 border-slate-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-700 animate-pulse' : 'bg-slate-500'}`}
            />
            <span>{isOnline ? 'ON' : 'OFF'}</span>
          </button>

          {/* Botón para abrir panel organizado de Billetera, Verificación y Radar */}
          <button
            type="button"
            onClick={onToggleDrawer}
            aria-label="Abrir panel del conductor"
            className="min-w-[42px] min-h-[42px] rounded-2xl bg-[#0F172A]/92 backdrop-blur-md text-white border border-slate-700/80 shadow-xl flex items-center justify-center cursor-pointer"
          >
            {drawerOpen ? <X className="w-4 h-4 text-[#FDBE3B]" /> : <SlidersHorizontal className="w-4 h-4 text-[#FDBE3B]" />}
          </button>
        </div>
      </header>

      {/* Panel desplegable organizado (Billetera + Ganancia + Verificación 4 pasos) */}
      {drawerOpen && (
        <div className="fixed top-20 inset-x-3 z-[440] max-w-3xl mx-auto rounded-3xl bg-[#0F172A]/97 backdrop-blur-xl border border-slate-700/80 p-4 shadow-2xl space-y-3.5 max-h-[72dvh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="min-w-0">
              <p className="text-xs font-black text-white truncate">{driverName}</p>
              <p className="text-[10px] text-slate-400">{GOBEE_BRAND.seal}</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-300">
              {tripsToday} viajes hoy
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div
              className={`rounded-2xl p-3 border ${
                isLowBalance ? 'bg-rose-950/40 border-rose-500/50' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-[#FDBE3B]" />
                  Saldo
                </span>
                <button
                  type="button"
                  onClick={onQuickTopUp}
                  aria-label="Recargar saldo"
                  className="min-w-[28px] min-h-[28px] rounded-lg bg-[#FDBE3B] text-[#111827] flex items-center justify-center cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
              <div className="font-mono tabular-nums text-xl font-black text-white mt-1">
                ${walletBalanceUSD.toFixed(2)}
              </div>
              {isLowBalance && <p className="text-[10px] text-rose-300 mt-0.5">Mínimo $5.00 para efectivo</p>}
            </div>

            <div className="rounded-2xl p-3 bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Ganancia Neta
              </span>
              <div className="font-mono tabular-nums text-xl font-black text-[#FDBE3B] mt-1">
                ${dailyNetEarningsUSD.toFixed(2)}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Libre de comisiones</p>
            </div>
          </div>

          {/* Verificación en 4 pasos */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                {completedSteps === 4 ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <UserCheck className="w-4 h-4 text-[#FDBE3B]" />
                )}
                Verificación
              </span>
              <span className="font-mono tabular-nums text-[11px] font-black text-[#FDBE3B]">
                {completedSteps}/4
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {VERIFICATION_STEPS.map((s) => {
                const done = verification[s.key];
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => onToggleVerificationStep?.(s.key)}
                    className={`min-h-[36px] rounded-xl px-2 py-1 text-[11px] font-bold flex items-center justify-center gap-1 border transition-colors cursor-pointer ${
                      done
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
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
        </div>
      )}
    </>
  );
}
