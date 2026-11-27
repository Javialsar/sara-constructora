'use client';

import React from 'react';
import {
  Database,
  Power,
  Radio,
  RefreshCw,
  Route,
  Sun,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { GOBEE_CATEGORIES, type GobeeCategoryId } from '@/lib/gobee/gobeeTypes';

export interface DriverRadarSwitchProps {
  isOnline: boolean;
  wakeLockActive: boolean;
  isNetworkOnline: boolean;
  pendingOfflineGpsCount: number;
  isFlushingQueue: boolean;
  activeCategory: GobeeCategoryId;
  backhaulEnabled: boolean;
  onToggleOnline: () => void;
  onSelectCategory: (cat: GobeeCategoryId) => void;
  onToggleBackhaul: () => void;
  onFlushOfflineQueue: () => void;
}

export function DriverRadarSwitch({
  isOnline,
  wakeLockActive,
  isNetworkOnline,
  pendingOfflineGpsCount,
  isFlushingQueue,
  activeCategory,
  backhaulEnabled,
  onToggleOnline,
  onSelectCategory,
  onToggleBackhaul,
  onFlushOfflineQueue,
}: DriverRadarSwitchProps) {
  return (
    <section
      aria-label="Control de Radar del Conductor"
      className="rounded-3xl bg-slate-900/95 border border-slate-800 p-4 space-y-3.5 shadow-xl"
    >
      {/* Botón Táctil Principal En Línea / Desconectado */}
      <button
        type="button"
        onClick={onToggleOnline}
        className={`w-full min-h-[60px] rounded-2xl px-5 font-black text-base tracking-tight transition-all flex items-center justify-between shadow-lg active:scale-[0.99] cursor-pointer ${
          isOnline
            ? 'bg-[#FDBE3B] hover:bg-[#F5B024] text-[#111827] shadow-amber-500/20'
            : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isOnline ? 'bg-[#111827] text-[#FDBE3B]' : 'bg-slate-900 text-slate-400'
            }`}
          >
            {isOnline ? <Radio className="w-5 h-5 animate-pulse" /> : <Power className="w-5 h-5" />}
          </div>
          <div className="text-left leading-tight">
            <div>{isOnline ? 'EN LÍNEA · Recibiendo pedidos' : 'DESCONECTADO'}</div>
            <div className={`text-[11px] font-semibold ${isOnline ? 'text-[#111827]/75' : 'text-slate-400'}`}>
              {isOnline ? 'Toca para pausar el radar PostGIS' : 'Toca para activar radar y Wake Lock'}
            </div>
          </div>
        </div>

        <span
          className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
            isOnline ? 'bg-[#111827] text-[#FDBE3B]' : 'bg-slate-950 text-slate-400'
          }`}
        >
          {isOnline ? 'ON' : 'OFF'}
        </span>
      </button>

      {/* Indicadores técnicos: Wake Lock + Red + Cola GPS IndexedDB */}
      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <div
          className={`rounded-xl px-2.5 py-2 border flex items-center gap-1.5 ${
            wakeLockActive
              ? 'bg-amber-500/10 border-[#FDBE3B]/40 text-[#FDBE3B]'
              : 'bg-slate-950/60 border-slate-800 text-slate-400'
          }`}
        >
          <Sun className="w-3.5 h-3.5 shrink-0" />
          <span className="font-bold truncate">{wakeLockActive ? 'Wake Lock ON' : 'Wake Lock OFF'}</span>
        </div>

        <div
          className={`rounded-xl px-2.5 py-2 border flex items-center gap-1.5 ${
            isNetworkOnline
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}
        >
          {isNetworkOnline ? <Wifi className="w-3.5 h-3.5 shrink-0" /> : <WifiOff className="w-3.5 h-3.5 shrink-0" />}
          <span className="font-bold truncate">{isNetworkOnline ? 'Red Activa' : 'Sin Señal'}</span>
        </div>

        <button
          type="button"
          onClick={onFlushOfflineQueue}
          disabled={pendingOfflineGpsCount === 0 || isFlushingQueue || !isNetworkOnline}
          className="rounded-xl px-2.5 py-2 border bg-slate-950/60 border-slate-800 hover:border-slate-700 disabled:opacity-60 text-slate-200 flex items-center justify-between gap-1 cursor-pointer"
        >
          <span className="flex items-center gap-1 font-bold truncate">
            <Database className="w-3.5 h-3.5 text-[#FDBE3B] shrink-0" />
            <span className="font-mono tabular-nums">{pendingOfflineGpsCount}</span>
          </span>
          <RefreshCw className={`w-3 h-3 text-slate-400 shrink-0 ${isFlushingQueue ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Selector de categoría activa y modo Retorno Backhaul */}
      <div className="flex flex-wrap items-center gap-1.5">
        {GOBEE_CATEGORIES.map((cat) => {
          const active = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`min-h-[36px] px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                active
                  ? 'bg-[#FDBE3B] text-[#111827] border-[#FDBE3B]'
                  : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat.name}
            </button>
          );
        })}

        <button
          type="button"
          onClick={onToggleBackhaul}
          className={`ml-auto min-h-[36px] px-3 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors cursor-pointer ${
            backhaulEnabled
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
              : 'bg-slate-950/70 text-slate-400 border-slate-800'
          }`}
        >
          <Route className="w-3.5 h-3.5" />
          <span>Backhaul</span>
        </button>
      </div>
    </section>
  );
}
