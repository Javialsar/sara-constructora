'use client';

import React from 'react';
import { CheckCircle2, RefreshCw, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export interface SyncBadgeProps {
  status?: SyncStatus;
  lastSyncedAt?: Date | string | null;
  pendingCount?: number;
  className?: string;
}

export function SyncBadge({
  status = 'synced',
  lastSyncedAt,
  pendingCount = 0,
  className
}: SyncBadgeProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium transition-all duration-200 border select-none",
        status === 'synced' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        status === 'syncing' && "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse",
        status === 'offline' && "bg-amber-500/10 text-amber-400 border-amber-500/20",
        status === 'error' && "bg-rose-500/10 text-rose-400 border-rose-500/20",
        className
      )}
    >
      {status === 'synced' && (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-sans font-semibold tracking-wide">Synced</span>
          {lastSyncedAt && (
            <span className="text-[10px] opacity-70 border-l border-emerald-500/30 pl-1.5">
              0ms
            </span>
          )}
        </>
      )}

      {status === 'syncing' && (
        <>
          <RefreshCw className="w-2.5 h-2.5 animate-spin text-blue-400" />
          <span className="font-sans font-semibold">Guardando...</span>
        </>
      )}

      {status === 'offline' && (
        <>
          <WifiOff className="w-2.5 h-2.5 text-amber-400" />
          <span className="font-sans font-semibold">Offline ({pendingCount})</span>
        </>
      )}

      {status === 'error' && (
        <>
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          <span className="font-sans font-semibold">Error al sincronizar</span>
        </>
      )}
    </div>
  );
}
