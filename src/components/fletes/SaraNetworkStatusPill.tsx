'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import {
  useSaraNetworkResilience,
  type OfflineSyncFn,
} from '@/lib/fletes/saraFletesOfflineBuffer';

export interface SaraNetworkStatusPillProps {
  /** Optional extra classes for positioning (e.g., map overlay or topbar slot). */
  className?: string;
  /** Optional custom sync handler for queued offline telemetry events. */
  syncFn?: OfflineSyncFn;
  /** Whether to auto-flush queued events as soon as connectivity returns. */
  autoFlushOnReconnect?: boolean;
}

function formatGpsAge(ageSec: number | null): string | null {
  if (ageSec === null) return null;
  if (ageSec < 60) return `hace ${ageSec}s`;
  const mins = Math.floor(ageSec / 60);
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  return `hace ${hrs}h`;
}

export function SaraNetworkStatusPill({
  className = '',
  syncFn,
  autoFlushOnReconnect = true,
}: SaraNetworkStatusPillProps) {
  const { isOnline, pendingCount, lastGpsAgeSec, isSyncing, flushNow } =
    useSaraNetworkResilience({
      syncFn,
      autoFlushOnReconnect,
    });

  const gpsAgeLabel = formatGpsAge(lastGpsAgeSec);

  // State 1: Offline — non-blocking amber/orange pill with Dead Reckoning notice & buffer count
  if (!isOnline) {
    return (
      <div
        role="status"
        aria-live="polite"
        title={
          gpsAgeLabel
            ? `Sin conexión celular. Usando caché satelital GPS (${gpsAgeLabel}).`
            : 'Sin conexión celular. Modo Offline activo con caché satelital.'
        }
        className={`inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs font-medium text-amber-900 shadow-sm backdrop-blur-md transition-colors dark:border-amber-400/35 dark:bg-amber-950/75 dark:text-amber-200 ${className}`.trim()}
      >
        <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
        </span>
        <span className="whitespace-nowrap">
          📡 Modo Offline • Caché Satelital Activo
        </span>
        {pendingCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-amber-600/20 px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-amber-950 dark:bg-amber-400/20 dark:text-amber-100">
            {pendingCount} en búfer
          </span>
        )}
      </div>
    );
  }

  // State 2: Back online with queued telemetry events pending synchronization
  if (pendingCount > 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/15 py-1 pl-3 pr-1.5 text-xs font-medium text-sky-900 shadow-sm backdrop-blur-md transition-colors dark:border-sky-400/35 dark:bg-sky-950/80 dark:text-sky-200 ${className}`.trim()}
      >
        <span className="whitespace-nowrap">
          🛰️ Señal Recuperada
        </span>
        <span className="font-mono text-[11px] font-semibold tabular-nums text-sky-800 dark:text-sky-300">
          ({pendingCount})
        </span>
        <button
          type="button"
          onClick={() => void flushNow()}
          disabled={isSyncing}
          aria-label={
            isSyncing
              ? 'Sincronizando eventos telemáticos pendientes'
              : `Sincronizar ${pendingCount} eventos pendientes`
          }
          className="inline-flex min-h-[28px] items-center gap-1.5 rounded-full bg-sky-600 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400/70 disabled:cursor-wait disabled:opacity-75 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
        >
          <RefreshCw
            className={`h-3 w-3 shrink-0 ${isSyncing ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          <span>{isSyncing ? 'Sincronizando…' : 'Sincronizar'}</span>
        </button>
      </div>
    );
  }

  // State 3: Online & clean queue — discreet emerald pill
  return (
    <div
      role="status"
      aria-live="polite"
      title={
        gpsAgeLabel
          ? `Red GPS satelital activa • Última posición guardada ${gpsAgeLabel}`
          : 'Red GPS satelital activa'
      }
      className={`inline-flex items-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/12 px-3 py-1.5 text-xs font-medium text-emerald-800 shadow-sm backdrop-blur-md transition-colors dark:border-emerald-400/30 dark:bg-emerald-950/70 dark:text-emerald-300 ${className}`.trim()}
    >
      <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span className="whitespace-nowrap">🛰️ Red GPS Activa</span>
    </div>
  );
}

export default SaraNetworkStatusPill;
