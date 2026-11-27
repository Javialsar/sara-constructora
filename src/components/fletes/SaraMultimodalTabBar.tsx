'use client';

import React, { useState } from 'react';
import type { MultimodalVerticalKey } from '@/lib/agents/fletes/saraFletesUXUIDesigner';

interface SaraMultimodalTabBarProps {
  activeTab: MultimodalVerticalKey;
  onChangeTab: (tab: MultimodalVerticalKey) => void;
  className?: string;
}

export const SaraMultimodalTabBar: React.FC<SaraMultimodalTabBarProps> = ({
  activeTab,
  onChangeTab,
  className = '',
}) => {
  const [hoveredTab, setHoveredTab] = useState<MultimodalVerticalKey | null>(null);

  const tabs: {
    key: MultimodalVerticalKey;
    label: string;
    icon: string;
    activeClass: string;
  }[] = [
    {
      key: 'viajes',
      label: 'Viajes',
      icon: '🚕',
      activeClass: 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25',
    },
    {
      key: 'mandaditos',
      label: 'Mandaditos',
      icon: '📦',
      activeClass: 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25',
    },
    {
      key: 'fletes',
      label: 'Fletes',
      icon: '🚛',
      activeClass: 'bg-blue-500 text-slate-950 shadow-lg shadow-blue-500/25',
    },
    {
      key: 'renta',
      label: 'Renta',
      icon: '🔑',
      activeClass: 'bg-purple-500 text-slate-950 shadow-lg shadow-purple-500/25',
    },
  ];

  return (
    <nav
      aria-label="Modalidades SARA Fletes"
      className={`p-1.5 bg-slate-950/95 backdrop-blur-xl rounded-full border border-slate-800/90 shadow-2xl ${className}`}
    >
      <div className="flex items-center justify-between gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const showLabel = isActive || hoveredTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              title={tab.label}
              aria-label={tab.label}
              aria-pressed={isActive}
              onClick={() => onChangeTab(tab.key)}
              onMouseEnter={() => setHoveredTab(tab.key)}
              onMouseLeave={() => setHoveredTab(null)}
              onFocus={() => setHoveredTab(tab.key)}
              onBlur={() => setHoveredTab(null)}
              className={`min-h-[44px] rounded-full transition-all duration-200 flex items-center justify-center gap-1.5 select-none active:scale-95 cursor-pointer ${
                isActive
                  ? `${tab.activeClass} px-4 font-black flex-1`
                  : showLabel
                    ? 'bg-slate-800/90 text-white px-3.5 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 px-3.5'
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              {showLabel && (
                <span className="text-xs tracking-tight leading-none whitespace-nowrap">
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default SaraMultimodalTabBar;
