'use client';

import React from 'react';
import {
  MODALIDADES_SARA_FLETES,
  type MultimodalVerticalKey
} from '@/lib/agents/fletes/saraFletesUXUIDesigner';

interface SaraMultimodalTabBarProps {
  activeTab: MultimodalVerticalKey;
  onTabChange: (tab: MultimodalVerticalKey) => void;
}

const TAB_ORDER: MultimodalVerticalKey[] = ['viajes', 'mandaditos', 'fletes', 'renta'];

export default function SaraMultimodalTabBar({ activeTab, onTabChange }: SaraMultimodalTabBarProps) {
  return (
    <div className="grid grid-cols-4 p-1 bg-slate-950 rounded-xl border border-slate-800 text-[10px] sm:text-xs font-bold">
      {TAB_ORDER.map((key) => {
        const mod = MODALIDADES_SARA_FLETES[key];
        const isActive = activeTab === key;

        // Color mapping per vertical
        const activeColors: Record<MultimodalVerticalKey, string> = {
          viajes: 'bg-amber-500 text-slate-950',
          mandaditos: 'bg-emerald-500 text-slate-950',
          fletes: 'bg-blue-500 text-white',
          renta: 'bg-purple-500 text-white'
        };

        return (
          <button
            key={key}
            type="button"
            onClick={() => onTabChange(key)}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
              isActive
                ? `${activeColors[key]} font-black shadow-md`
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-sm sm:text-base leading-none">{mod.emoji}</span>
            <span className="hidden sm:inline">{mod.label}</span>
          </button>
        );
      })}
    </div>
  );
}
