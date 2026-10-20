'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Grid,
  ChevronDown,
  Building2,
  Calculator,
  ShoppingCart,
  Truck,
  Users,
  Home,
  Bed,
  ShieldCheck,
  LayoutDashboard,
  FileSpreadsheet
} from 'lucide-react';

const ECOSYSTEM_MODULES = [
  {
    name: 'SARA Constructora',
    subtitle: 'Obras Civiles, BIM & Fiscalización',
    href: '/constructora',
    icon: Building2,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20'
  },
  {
    name: 'SARA APU & Costos',
    subtitle: 'Presupuestos, IA & Licitación SERCOP',
    href: '/apu',
    icon: Calculator,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20'
  },
  {
    name: 'SARA Marketplace',
    subtitle: 'Abastecimiento Mayorista & Kardex',
    href: '/modulos/compras',
    icon: ShoppingCart,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20'
  },
  {
    name: 'SARA Fletes',
    subtitle: 'Logística Pesada MTOP & Backhaul',
    href: '/modulos/fletes',
    icon: Truck,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20'
  },
  {
    name: 'SARA Talento Humano',
    subtitle: 'Reclutamiento SECAP & Nómina IESS',
    href: '/modulos/talento',
    icon: Users,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20'
  },
  {
    name: 'SARA Inmobiliaria',
    subtitle: 'Tasación IVS, Plusvalía & BIESS',
    href: '/inmobiliaria',
    icon: Home,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20'
  },
  {
    name: 'SARA Stays',
    subtitle: 'Corporate Housing & Revenue USALI',
    href: '/stays',
    icon: Bed,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20'
  },
  {
    name: 'SARA Pagos & Escrow',
    subtitle: 'Fideicomiso, SRI & Gobernanza UAFE',
    href: '/modulos/financiero',
    icon: ShieldCheck,
    color: 'text-teal-400',
    bg: 'bg-teal-500/10 border-teal-500/20'
  }
];

function getModuleBadge(pathname: string) {
  if (pathname.startsWith('/modulos/compras')) {
    return { label: 'SARA Marketplace & Compras', dotColor: 'bg-amber-400', badgeStyle: 'bg-amber-500/10 text-amber-300 border-amber-500/20' };
  }
  if (pathname.startsWith('/modulos/fletes')) {
    return { label: 'SARA Fletes & Carga Pesada', dotColor: 'bg-orange-400', badgeStyle: 'bg-orange-500/10 text-orange-300 border-orange-500/20' };
  }
  if (pathname.startsWith('/modulos/talento')) {
    return { label: 'SARA Talento Humano', dotColor: 'bg-emerald-400', badgeStyle: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' };
  }
  if (pathname.startsWith('/modulos/financiero')) {
    return { label: 'SARA Pagos & Escrow', dotColor: 'bg-teal-400', badgeStyle: 'bg-teal-500/10 text-teal-300 border-teal-500/20' };
  }
  if (pathname.startsWith('/modulos/importador')) {
    return { label: 'SARA Importador Excel/CSV', dotColor: 'bg-cyan-400', badgeStyle: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' };
  }
  return { label: 'Ecosistema SARA', dotColor: 'bg-blue-400', badgeStyle: 'bg-blue-500/10 text-blue-300 border-blue-500/20' };
}

export default function ModuleTopBar() {
  const pathname = usePathname() || '';
  const [launcherOpen, setLauncherOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const currentModule = getModuleBadge(pathname);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setLauncherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setLauncherOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-white/[0.08] text-white">
      <div className="max-w-7xl mx-auto min-h-[60px] px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: Back to Holding + Current Module Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="min-h-[44px] inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft size={16} className="text-emerald-400" />
            <span>Grupo SARA</span>
          </Link>

          <span className="text-white/15 select-none">|</span>

          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-wide truncate ${currentModule.badgeStyle}`}>
            <span className={`w-2 h-2 rounded-full ${currentModule.dotColor} animate-pulse shrink-0`} />
            <span className="truncate">{currentModule.label}</span>
          </div>
        </div>

        {/* Right: App Launcher (8 Modules) + Dashboard CTA */}
        <div className="flex items-center gap-2 sm:gap-3" ref={menuRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setLauncherOpen((prev) => !prev)}
              className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs sm:text-sm font-bold text-slate-200 hover:text-white transition-all"
              aria-expanded={launcherOpen}
            >
              <Grid size={16} className="text-cyan-400" />
              <span className="hidden sm:inline">Ecosistema (8 Módulos)</span>
              <span className="sm:hidden">Módulos</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${launcherOpen ? 'rotate-180' : ''}`} />
            </button>

            {launcherOpen && (
              <div className="absolute right-0 mt-2 w-[320px] sm:w-[480px] rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-white">Red Empresarial Grupo SARA</p>
                    <p className="text-[11px] text-slate-400">Salto directo entre las 8 unidades de negocio</p>
                  </div>
                  <Link
                    href="/modulos/importador"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300"
                  >
                    <FileSpreadsheet size={13} />
                    Importador
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ECOSYSTEM_MODULES.map((mod) => {
                    const Icon = mod.icon;
                    const isActive = pathname.startsWith(mod.href);
                    return (
                      <Link
                        key={mod.href}
                        href={mod.href}
                        className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all ${
                          isActive
                            ? 'bg-white/10 border-white/25 text-white'
                            : 'bg-slate-950/60 hover:bg-white/[0.06] border-white/[0.06] text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${mod.bg} ${mod.color}`}>
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{mod.name}</p>
                          <p className="text-[11px] text-slate-400 leading-tight line-clamp-1">{mod.subtitle}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <Link
                    href="/dashboard"
                    className="w-full min-h-[42px] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md"
                  >
                    <LayoutDashboard size={15} />
                    <span>Ir al Panel Central / APU Dashboard</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
