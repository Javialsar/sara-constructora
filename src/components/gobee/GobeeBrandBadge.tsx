'use client';

import React from 'react';
import { Navigation } from 'lucide-react';

export interface GobeeBrandBadgeProps {
  role: 'Cliente' | 'Conductor';
  theme?: 'dark' | 'light';
}

export function GobeeBrandBadge({ role, theme = 'dark' }: GobeeBrandBadgeProps) {
  const isLight = theme === 'light';

  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-2xl px-2.5 py-1.5 min-w-0 ${
        isLight
          ? 'bg-white/95 border border-black/10 shadow-sm'
          : 'bg-slate-950/70 border border-slate-800/90'
      }`}
    >
      <div className="w-8 h-8 rounded-xl bg-[#FDBE3B] text-[#111827] flex items-center justify-center shadow-sm shrink-0">
        <Navigation className="w-4 h-4 fill-[#111827]" />
      </div>
      <div className="leading-tight min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black text-sm sm:text-base tracking-tight ${
              isLight ? 'text-[#111827]' : 'text-white'
            }`}
          >
            Go<span className="text-[#FDBE3B]">Bee</span>
          </span>
          <span
            className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md whitespace-nowrap ${
              isLight
                ? 'bg-[#FDBE3B]/25 text-[#111827]'
                : 'bg-[#FDBE3B]/20 text-[#FDBE3B] border border-[#FDBE3B]/30'
            }`}
          >
            {role}
          </span>
        </div>
        <p
          className={`text-[10px] font-medium truncate ${
            isLight ? 'text-neutral-500' : 'text-slate-400'
          }`}
        >
          Un servicio de Grupo Sara
        </p>
      </div>
    </div>
  );
}
