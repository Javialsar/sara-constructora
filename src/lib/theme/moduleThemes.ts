/**
 * TOKENS Y CONFIGURACIÓN CROMÁTICA MODULAR DEL ECOSISTEMA GRUPO SARA
 * Administrable dinámicamente desde /admin/configuracion
 * Basado en la regla armónica de 4 colores de diseño (Canva 100 Combinaciones de Color)
 */

export type ModuloKey = 
  | 'constructora' 
  | 'apu' 
  | 'compras' 
  | 'fletes' 
  | 'talento' 
  | 'inmobiliaria' 
  | 'stays' 
  | 'financiero';

export type ColorTone = 
  | 'wine'        // 🍷 Conchovino / Borgoña
  | 'amber'       // 🛒 Ámbar Industrial
  | 'blue'        // 🏗️ Azul Cobalto
  | 'cyan'        // ⚡ Cian Eléctrico
  | 'orange'      // 🚛 Naranja Vial
  | 'emerald'     // 👷 Verde Esmeralda
  | 'purple'      // 🏢 Púrpura Real
  | 'rose'        // 🏡 Rosa Coral
  | 'teal'        // 💳 Verde Jade / Teal
  | 'indigo'      // 👔 Índigo Ejecutivo
  | 'red';        // 🔴 Rubí Dinámico

export interface ModuleThemeConfig {
  key: ModuloKey;
  name: string;
  subtitle: string;
  route: string;
  defaultTone: ColorTone;
}

export interface CanvaFourColors {
  bgBase: string;       // Color 1: Fondo / Atmósfera Base Dominante (60%)
  bgSurface: string;    // Color 2: Paneles, Cards, Sidebars (30%)
  accent: string;       // Color 3: Botones Primarios, CTAs, Badges (10%)
  accentHover: string;  // Hover de Botones
  textContrast: string; // Color 4: Texto Principal de alto contraste (WCAG AAA)
  textMuted: string;    // Texto Secundario
  border: string;       // Bordes Estructurantes
  glow: string;         // Anillos y Sombras
}

export interface ToneStyle {
  label: string;
  hex: string;
  textClass: string;
  bgLightClass: string;
  badgeClass: string;
  borderClass: string;
  gradientCta: string;
  ringClass: string;
  dotClass: string;
  canva: CanvaFourColors;
}

export const COLOR_TONES: Record<ColorTone, ToneStyle> = {
  wine: {
    label: 'Conchovino / Borgoña',
    hex: '#881337',
    textClass: 'text-rose-400',
    bgLightClass: 'bg-rose-950/40',
    badgeClass: 'bg-rose-950/60 text-rose-300 border-rose-800/50',
    borderClass: 'border-rose-900/50',
    gradientCta: 'bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 text-white font-bold',
    ringClass: 'ring-rose-800',
    dotClass: 'bg-rose-500',
    canva: {
      bgBase: '#120206',
      bgSurface: '#24060e',
      accent: '#881337',
      accentHover: '#9f1239',
      textContrast: '#ffffff',
      textMuted: '#fecdd3',
      border: '#4c0519',
      glow: 'rgba(159, 18, 57, 0.4)'
    }
  },
  amber: {
    label: 'Ámbar Industrial',
    hex: '#f59e0b',
    textClass: 'text-amber-400',
    bgLightClass: 'bg-amber-500/10',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    borderClass: 'border-amber-500/30',
    gradientCta: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black',
    ringClass: 'ring-amber-500',
    dotClass: 'bg-amber-400',
    canva: {
      bgBase: '#130d02',
      bgSurface: '#241a05',
      accent: '#d97706',
      accentHover: '#f59e0b',
      textContrast: '#ffffff',
      textMuted: '#fde68a',
      border: '#451a03',
      glow: 'rgba(245, 158, 11, 0.35)'
    }
  },
  blue: {
    label: 'Azul Cobalto',
    hex: '#2563eb',
    textClass: 'text-blue-400',
    bgLightClass: 'bg-blue-500/10',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    borderClass: 'border-blue-500/30',
    gradientCta: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
    ringClass: 'ring-blue-500',
    dotClass: 'bg-blue-400',
    canva: {
      bgBase: '#030b17',
      bgSurface: '#0a192f',
      accent: '#2563eb',
      accentHover: '#3b82f6',
      textContrast: '#ffffff',
      textMuted: '#bfdbfe',
      border: '#1e3a8a',
      glow: 'rgba(37, 99, 235, 0.35)'
    }
  },
  cyan: {
    label: 'Cian Eléctrico',
    hex: '#06b6d4',
    textClass: 'text-cyan-400',
    bgLightClass: 'bg-cyan-500/10',
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    borderClass: 'border-cyan-500/30',
    gradientCta: 'bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 font-black',
    ringClass: 'ring-cyan-500',
    dotClass: 'bg-cyan-400',
    canva: {
      bgBase: '#021319',
      bgSurface: '#06232e',
      accent: '#0891b2',
      accentHover: '#06b6d4',
      textContrast: '#ffffff',
      textMuted: '#a5f3fc',
      border: '#164e63',
      glow: 'rgba(6, 182, 212, 0.35)'
    }
  },
  orange: {
    label: 'Naranja Vial',
    hex: '#f97316',
    textClass: 'text-orange-400',
    bgLightClass: 'bg-orange-500/10',
    badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    borderClass: 'border-orange-500/30',
    gradientCta: 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black',
    ringClass: 'ring-orange-500',
    dotClass: 'bg-orange-400',
    canva: {
      bgBase: '#150902',
      bgSurface: '#271305',
      accent: '#ea580c',
      accentHover: '#f97316',
      textContrast: '#ffffff',
      textMuted: '#fed7aa',
      border: '#7c2d12',
      glow: 'rgba(249, 115, 22, 0.35)'
    }
  },
  emerald: {
    label: 'Verde Esmeralda',
    hex: '#10b981',
    textClass: 'text-emerald-400',
    bgLightClass: 'bg-emerald-500/10',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    borderClass: 'border-emerald-500/30',
    gradientCta: 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black',
    ringClass: 'ring-emerald-500',
    dotClass: 'bg-emerald-400',
    canva: {
      bgBase: '#02140b',
      bgSurface: '#052716',
      accent: '#059669',
      accentHover: '#10b981',
      textContrast: '#ffffff',
      textMuted: '#a7f3d0',
      border: '#064e3b',
      glow: 'rgba(16, 185, 129, 0.35)'
    }
  },
  purple: {
    label: 'Púrpura Real',
    hex: '#8b5cf6',
    textClass: 'text-purple-400',
    bgLightClass: 'bg-purple-500/10',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    borderClass: 'border-purple-500/30',
    gradientCta: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold',
    ringClass: 'ring-purple-500',
    dotClass: 'bg-purple-400',
    canva: {
      bgBase: '#0f051c',
      bgSurface: '#1c0a33',
      accent: '#7c3aed',
      accentHover: '#8b5cf6',
      textContrast: '#ffffff',
      textMuted: '#ddd6fe',
      border: '#4c1d95',
      glow: 'rgba(139, 92, 246, 0.35)'
    }
  },
  rose: {
    label: 'Rosa Coral',
    hex: '#f43f5e',
    textClass: 'text-rose-400',
    bgLightClass: 'bg-rose-500/10',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    borderClass: 'border-rose-500/30',
    gradientCta: 'bg-gradient-to-r from-rose-500 to-orange-400 text-white font-bold',
    ringClass: 'ring-rose-500',
    dotClass: 'bg-rose-400',
    canva: {
      bgBase: '#16040b',
      bgSurface: '#290715',
      accent: '#e11d48',
      accentHover: '#f43f5e',
      textContrast: '#ffffff',
      textMuted: '#fecdd3',
      border: '#881337',
      glow: 'rgba(244, 63, 94, 0.35)'
    }
  },
  teal: {
    label: 'Verde Jade / Teal',
    hex: '#14b8a6',
    textClass: 'text-teal-400',
    bgLightClass: 'bg-teal-500/10',
    badgeClass: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    borderClass: 'border-teal-500/30',
    gradientCta: 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black',
    ringClass: 'ring-teal-500',
    dotClass: 'bg-teal-400',
    canva: {
      bgBase: '#021412',
      bgSurface: '#052622',
      accent: '#0d9488',
      accentHover: '#14b8a6',
      textContrast: '#ffffff',
      textMuted: '#99f6e4',
      border: '#115e59',
      glow: 'rgba(20, 184, 166, 0.35)'
    }
  },
  indigo: {
    label: 'Índigo Ejecutivo',
    hex: '#6366f1',
    textClass: 'text-indigo-400',
    bgLightClass: 'bg-indigo-500/10',
    badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    borderClass: 'border-indigo-500/30',
    gradientCta: 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold',
    ringClass: 'ring-indigo-500',
    dotClass: 'bg-indigo-400',
    canva: {
      bgBase: '#08081a',
      bgSurface: '#111233',
      accent: '#4f46e5',
      accentHover: '#6366f1',
      textContrast: '#ffffff',
      textMuted: '#c7d2fe',
      border: '#312e81',
      glow: 'rgba(99, 102, 241, 0.35)'
    }
  },
  red: {
    label: 'Rubí Dinámico',
    hex: '#ef4444',
    textClass: 'text-red-400',
    bgLightClass: 'bg-red-500/10',
    badgeClass: 'bg-red-500/10 text-red-400 border-red-500/20',
    borderClass: 'border-red-500/30',
    gradientCta: 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold',
    ringClass: 'ring-red-500',
    dotClass: 'bg-red-400',
    canva: {
      bgBase: '#160404',
      bgSurface: '#290808',
      accent: '#dc2626',
      accentHover: '#ef4444',
      textContrast: '#ffffff',
      textMuted: '#fecaca',
      border: '#7f1d1d',
      glow: 'rgba(239, 68, 68, 0.35)'
    }
  }
};

export const DEFAULT_MODULE_THEMES: Record<ModuloKey, ColorTone> = {
  constructora: 'blue',
  apu: 'cyan',
  compras: 'amber',
  fletes: 'orange',
  talento: 'emerald',
  inmobiliaria: 'purple',
  stays: 'rose',
  financiero: 'teal'
};

export const SARA_MODULES_LIST: ModuleThemeConfig[] = [
  {
    key: 'constructora',
    name: 'SARA Constructora',
    subtitle: 'Obras Civiles, BIM & Fiscalización',
    route: '/constructora',
    defaultTone: 'blue'
  },
  {
    key: 'apu',
    name: 'SARA APU & Costos',
    subtitle: 'Presupuestos, IA & SERCOP',
    route: '/apu',
    defaultTone: 'cyan'
  },
  {
    key: 'compras',
    name: 'SARA Marketplace',
    subtitle: 'Abastecimiento Mayorista & Kardex',
    route: '/modulos/compras',
    defaultTone: 'amber'
  },
  {
    key: 'fletes',
    name: 'SARA Fletes',
    subtitle: 'Logística Pesada MTOP & Renta',
    route: '/modulos/fletes',
    defaultTone: 'orange'
  },
  {
    key: 'talento',
    name: 'SARA Talento Humano',
    subtitle: 'Reclutamiento SECAP & Nómina IESS',
    route: '/modulos/talento',
    defaultTone: 'emerald'
  },
  {
    key: 'inmobiliaria',
    name: 'SARA Inmobiliaria',
    subtitle: 'Tasación IVS, Plusvalía & BIESS',
    route: '/inmobiliaria',
    defaultTone: 'purple'
  },
  {
    key: 'stays',
    name: 'SARA Stays',
    subtitle: 'Corporate Housing & Alojamientos',
    route: '/stays',
    defaultTone: 'rose'
  },
  {
    key: 'financiero',
    name: 'SARA Pagos & Escrow',
    subtitle: 'Fideicomiso, SRI & UAFE',
    route: '/modulos/financiero',
    defaultTone: 'teal'
  }
];

export const MODULE_ICONS: Record<ModuloKey, string> = {
  constructora: '🏗️',
  apu: '⚡',
  compras: '🛒',
  fletes: '🚛',
  talento: '👷',
  inmobiliaria: '🏢',
  stays: '🏡',
  financiero: '💳'
};

export const STORAGE_KEY_MODULE_THEMES = 'sara_module_themes_config';

/**
 * Obtiene la configuración de temas modulares guardada o por defecto
 */
export function getSavedModuleThemes(): Record<ModuloKey, ColorTone> {
  if (typeof window === 'undefined') return DEFAULT_MODULE_THEMES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MODULE_THEMES);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_MODULE_THEMES, ...parsed };
    }
  } catch (e) {}
  return DEFAULT_MODULE_THEMES;
}

/**
 * Obtiene el cuarteto cromático Canva para un módulo dado
 */
export function getModuleCanvaPalette(modKey: ModuloKey): CanvaFourColors {
  const themes = getSavedModuleThemes();
  const toneKey = themes[modKey] || DEFAULT_MODULE_THEMES[modKey] || 'amber';
  const tone = COLOR_TONES[toneKey] || COLOR_TONES.amber;
  return tone.canva;
}

/**
 * Guarda la configuración de temas en localStorage y emite el evento global
 */
export function saveModuleThemes(config: Record<ModuloKey, ColorTone>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_MODULE_THEMES, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('sara_module_themes_change', { detail: config }));
  } catch (e) {}
}
