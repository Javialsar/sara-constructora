'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse flex items-center gap-4 py-3 px-4 border-b border-slate-800/60", className)}>
      <div className="h-4 w-12 bg-slate-800 rounded" />
      <div className="h-4 flex-1 bg-slate-800/80 rounded" />
      <div className="h-4 w-16 bg-slate-800/60 rounded" />
      <div className="h-4 w-20 bg-slate-800 rounded font-mono" />
      <div className="h-6 w-16 bg-slate-800/50 rounded-full" />
    </div>
  );
}

export function SkeletonHeroMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="h-3 w-28 bg-slate-800 rounded" />
            <div className="h-6 w-6 bg-slate-800 rounded-lg" />
          </div>
          <div className="h-7 w-32 bg-slate-700/80 rounded mb-2" />
          <div className="h-3 w-20 bg-slate-800/50 rounded" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="w-full rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
      <div className="h-10 bg-slate-900/80 border-b border-slate-800 flex items-center px-4 gap-4">
        <div className="h-3 w-16 bg-slate-800 rounded" />
        <div className="h-3 w-40 bg-slate-800 rounded" />
        <div className="h-3 w-20 bg-slate-800 rounded ml-auto" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

export function SkeletonCardGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="h-36 w-full bg-slate-800/80 rounded-lg mb-3" />
          <div className="h-4 w-3/4 bg-slate-700 rounded mb-2" />
          <div className="h-3 w-1/2 bg-slate-800 rounded mb-4" />
          <div className="flex justify-between items-center pt-2 border-t border-slate-800/60">
            <div className="h-4 w-20 bg-slate-800 rounded" />
            <div className="h-6 w-16 bg-slate-800/60 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
