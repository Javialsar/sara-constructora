'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
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
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { 
  getSavedModuleThemes, 
  COLOR_TONES, 
  ModuloKey, 
  ColorTone,
  DEFAULT_MODULE_THEMES 
} from '@/lib/theme/moduleThemes';
import { getLogosEmpresa, DEFAULT_LOGOS_EMPRESA, LogosEmpresa } from '@/lib/services/logosService';
import ModuleBrandLogo, { ModuloBrandKey } from './ModuleBrandLogo';

const ECOSYSTEM_MODULES: {
  key: keyof LogosEmpresa;
  themeKey: ModuloKey;
  name: string;
  subtitle: string;
  href: string;
  icon: any;
}[] = [
  {
    key: 'constructora',
    themeKey: 'constructora',
    name: 'SARA Constructora',
    subtitle: 'Obras Civiles, BIM & Fiscalización',
    href: '/constructora',
    icon: Building2,
  },
  {
    key: 'apu',
    themeKey: 'apu',
    name: 'SARA APU & Costos',
    subtitle: 'Presupuestos, IA & Licitación SERCOP',
    href: '/apu',
    icon: Calculator,
  },
  {
    key: 'compras',
    themeKey: 'compras',
    name: 'SARA Marketplace',
    subtitle: 'Abastecimiento Mayorista & Kardex',
    href: '/modulos/compras',
    icon: ShoppingCart,
  },
  {
    key: 'fletes',
    themeKey: 'fletes',
    name: 'SARA Fletes',
    subtitle: 'Logística Pesada MTOP & Backhaul',
    href: '/modulos/fletes',
    icon: Truck,
  },
  {
    key: 'talento',
    themeKey: 'talento',
    name: 'SARA Talento Humano',
    subtitle: 'Reclutamiento SECAP & Nómina IESS',
    href: '/modulos/talento',
    icon: Users,
  },
  {
    key: 'inmobiliaria',
    themeKey: 'inmobiliaria',
    name: 'SARA Inmobiliaria',
    subtitle: 'Tasación IVS, Plusvalía & BIESS',
    href: '/inmobiliaria',
    icon: Home,
  },
  {
    key: 'stays',
    themeKey: 'stays',
    name: 'SARA Stays',
    subtitle: 'Corporate Housing & Revenue USALI',
    href: '/stays',
    icon: Bed,
  },
  {
    key: 'fintech',
    themeKey: 'financiero',
    name: 'SARA Pagos & Escrow',
    subtitle: 'Fideicomiso, SRI & Gobernanza UAFE',
    href: '/modulos/financiero',
    icon: ShieldCheck,
  }
];

function resolveBrandModulo(pathname: string): ModuloBrandKey {
  if (pathname.startsWith('/modulos/compras') || pathname.startsWith('/compras')) return 'compras';
  if (pathname.startsWith('/modulos/fletes') || pathname.startsWith('/fletes')) return 'fletes';
  if (pathname.startsWith('/modulos/talento')) return 'talento';
  if (pathname.startsWith('/modulos/financiero')) return 'fintech';
  if (pathname.startsWith('/modulos/facturacion') || pathname.startsWith('/facturacion-electronica')) return 'facturacion';
  if (pathname.startsWith('/apu') || pathname.startsWith('/modulos/importador')) return 'apu';
  if (pathname.startsWith('/inmobiliaria')) return 'inmobiliaria';
  if (pathname.startsWith('/stays')) return 'stays';
  if (pathname.startsWith('/constructora')) return 'constructora';
  return 'grupo_sara';
}

export default function ModuleTopBar() {
  const pathname = usePathname() || '';
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [moduleThemes, setModuleThemes] = useState(DEFAULT_MODULE_THEMES);
  const [logos, setLogos] = useState<LogosEmpresa>(DEFAULT_LOGOS_EMPRESA);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setModuleThemes(getSavedModuleThemes());
    getLogosEmpresa().then((fetched) => {
      if (fetched) setLogos(fetched);
    });

    const handleThemeChange = (e: any) => {
      if (e.detail && typeof e.detail === 'object') {
        setModuleThemes(e.detail);
      }
    };
    window.addEventListener('sara_module_themes_change', handleThemeChange);
    return () => window.removeEventListener('sara_module_themes_change', handleThemeChange);
  }, []);

  const currentBrandKey = resolveBrandModulo(pathname);

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

  if (pathname.startsWith('/modulos/financiero') || pathname.endsWith('/auth')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-white/[0.08] text-white">
      <div className="max-w-7xl mx-auto min-h-[64px] px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: Official Module Logo from Database Configuration + Brand Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <ModuleBrandLogo
            modulo={currentBrandKey}
            size="sm"
            showBackToHolding={true}
          />
        </div>

        {/* Right: App Launcher (8 Modules) + Dashboard CTA */}
        <div className="flex items-center gap-2 sm:gap-3" ref={menuRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setLauncherOpen((prev) => !prev)}
              className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs sm:text-sm font-bold text-slate-200 hover:text-white transition-all cursor-pointer"
              aria-expanded={launcherOpen}
            >
              <Grid size={16} className="text-cyan-400" />
              <span className="hidden sm:inline">Ecosistema (8 Módulos)</span>
              <span className="sm:hidden">Módulos</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${launcherOpen ? 'rotate-180' : ''}`} />
            </button>

            {launcherOpen && (
              <div className="absolute right-0 mt-2 w-[320px] sm:w-[500px] rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-white">Red Empresarial Grupo SARA</p>
                    <p className="text-[11px] text-slate-400">Salto directo entre las unidades de negocio</p>
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
                    const isActive = pathname.startsWith(mod.href);
                    const currentTone = COLOR_TONES[moduleThemes[mod.themeKey]] || COLOR_TONES.blue;
                    const fallbackModLogo = DEFAULT_LOGOS_EMPRESA[mod.key] || '/logo-hero.png';
                    const modLogo = logos[mod.key] || fallbackModLogo;

                    return (
                      <Link
                        key={mod.href}
                        href={mod.href}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                          isActive
                            ? 'bg-white/10 border-white/25 text-white'
                            : 'bg-slate-950/60 hover:bg-white/[0.06] border-white/[0.06] text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 p-1 bg-slate-950 ${currentTone.borderClass}`}>
                          <img
                            src={modLogo}
                            alt={mod.name}
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              if (!target.src.endsWith(fallbackModLogo)) {
                                target.src = fallbackModLogo;
                              }
                            }}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{mod.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{mod.subtitle}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/dashboard"
            className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/20 transition-all shrink-0"
          >
            <LayoutDashboard size={15} />
            <span className="hidden md:inline">Panel Central</span>
            <span className="md:hidden">Panel</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
