'use client';

import React from 'react';
import type { MultimodalVerticalKey } from '@/lib/agents/fletes/saraFletesUXUIDesigner';

interface SaraMultimodalTabBarProps {
  activeTab: MultimodalVerticalKey;
  onChangeTab: (tab: MultimodalVerticalKey) => void;
  className?: string;
}

export const SaraMultimodalTabBar: React.FC<SaraMultimodalTabBarProps> = ({
  activeTab,
  onChangeTab,
  className = ''
}) => {
  const tabs: {
    key: MultimodalVerticalKey;
    label: string;
    sublabel: string;
    icon: string;
    badge?: string;
    activeClass: string;
  }[] = [
    {
      key: 'viajes',
      label: 'Viajes',
      sublabel: 'Pasajeros',
      icon: '🚕',
      activeClass: 'bg-amber-500 text-slate-950 shadow-amber-500/25 ring-2 ring-amber-400/50'
    },
    {
      key: 'mandaditos',
      label: 'Mandaditos',
      sublabel: 'Express',
      icon: '📦',
      badge: 'PROMO',
      activeClass: 'bg-emerald-500 text-slate-950 shadow-emerald-500/25 ring-2 ring-emerald-400/50'
    },
    {
      key: 'fletes',
      label: 'Fletes',
      sublabel: 'Carga MTOP',
      icon: '🚛',
      activeClass: 'bg-blue-500 text-slate-950 shadow-blue-500/25 ring-2 ring-blue-400/50'
    },
    {
      key: 'renta',
      label: 'Renta',
      sublabel: 'Horas / Días',
      icon: '🔑',
      activeClass: 'bg-purple-500 text-slate-950 shadow-purple-500/25 ring-2 ring-purple-400/50'
    }
  ];

  return (
    <div className={`p-1.5 bg-slate-950/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl ${className}`}>
      <div className="grid grid-cols-4 gap-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChangeTab(tab.key)}
              className={`relative py-2.5 px-1 rounded-xl transition-all duration-200 flex flex-col items-center justify-center text-center select-none active:scale-95 ${
                isActive
                  ? `${tab.activeClass} font-black shadow-lg`
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              {tab.badge && !isActive && (
                <span className="absolute -top-1.5 right-1 text-[8px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-1 py-0.2 rounded-full shadow-sm">
                  {tab.badge}
                </span>
              )}
              <span className="text-lg leading-none mb-1">{tab.icon}</span>
              <span className="text-xs font-black tracking-tight leading-none truncate max-w-full">
                {tab.label}
              </span>
              <span className={`text-[9px] font-semibold tracking-normal mt-0.5 leading-none hidden sm:inline-block ${
                isActive ? 'opacity-80' : 'text-slate-500'
              }`}>
                {tab.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SaraMultimodalTabBar;
