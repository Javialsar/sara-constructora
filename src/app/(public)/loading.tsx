import React from 'react';

export default function Loading() {
  return (
    <div
      aria-hidden="true"
      className="min-h-[75vh] w-full bg-slate-950 flex flex-col items-center justify-center px-4 py-20 text-slate-100 select-none"
    >
      <div className="relative flex flex-col items-center max-w-sm w-full mx-auto text-center space-y-6">
        {/* Glow ambient background */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Corporate Loading Emblem */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-brand-sage/40 flex items-center justify-center shadow-[0_0_25px_rgba(60,122,82,0.25)]">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-brand-sage animate-pulse" />
          </div>
          <div className="absolute -inset-1.5 rounded-2xl border border-amber-500/20 animate-ping pointer-events-none opacity-50" />
        </div>

        {/* Brand Labels */}
        <div className="space-y-1.5">
          <h2 className="font-display text-base font-extrabold uppercase tracking-wider text-white">
            GRUPO SARA
          </h2>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-sage">
            Ingeniería &middot; Construcción &middot; Tecnología
          </p>
        </div>

        {/* Smooth indeterminate progress bar */}
        <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden border border-white/[0.06]">
          <div className="h-full w-full bg-gradient-to-r from-amber-500 via-brand-sage to-emerald-400 animate-pulse rounded-full" />
        </div>

        <p className="font-mono text-xs text-slate-400">
          Cargando ecosistema...
        </p>
      </div>
    </div>
  );
}
