'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Navigation, Search, Users, HardHat, Building2, Briefcase, Clock } from 'lucide-react';

interface SubNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  badge?: string;
  badgeColor?: string;
}

const NAV_ITEMS: SubNavItem[] = [
  {
    href: '/modulos/talento',
    label: '1. Radar Geográfico',
    icon: Navigation
  },
  {
    href: '/modulos/talento/vacantes',
    label: '2. Bolsa de Empleo Civil',
    icon: Search,
    badge: 'Ofertas Activas',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  },
  {
    href: '/modulos/talento/reclutamiento',
    label: '3. Reclutamiento & Kanban',
    icon: Users,
    badge: 'Empresas',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  },
  {
    href: '/modulos/talento/asistencia',
    label: '4. Tareo & Cuadrillas APU',
    icon: Clock,
    badge: 'Obra Civil',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  },
  {
    href: '/modulos/talento/mi-perfil',
    label: '5. Mi Expediente & Bóveda',
    icon: HardHat
  },
  {
    href: '/admin/talento',
    label: '6. Fiscalización & SST',
    icon: Building2
  }
];

export default function TalentoSubNav({ activeRoute }: { activeRoute?: string }) {
  const pathname = usePathname();
  const currentPath = activeRoute || pathname;

  return (
    <div className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs font-semibold">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/modulos/talento'
                  ? currentPath === '/modulos/talento'
                  : currentPath.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-xl flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-500/20 ring-1 ring-purple-400/50'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-white' : 'text-purple-400'} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-white/20 text-white border-white/30'
                          : item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono">SBU 2026: $482.00 | IESS CD 513</span>
          </div>
        </div>
      </div>
    </div>
  );
}
