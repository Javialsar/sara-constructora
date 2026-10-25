/**
 * TOKENS Y CONFIGURACIÓN CROMÁTICA MODULAR DEL ECOSISTEMA GRUPO SARA
 * Administrable dinámicamente desde /admin/configuracion
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
  | 'blue' 
  | 'cyan' 
  | 'amber' 
  | 'orange' 
  | 'emerald' 
  | 'purple' 
  | 'rose' 
  | 'teal' 
  | 'indigo' 
  | 'red';

export interface ModuleThemeConfig {
  key: ModuloKey;
  name: string;
  subtitle: string;
  route: string;
  defaultTone: ColorTone;
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
}

export const COLOR_TONES: Record<ColorTone, ToneStyle> = {
  blue: {
    label: 'Azul Cobalto',
    hex: '#2563eb',
    textClass: 'text-blue-400',
    bgLightClass: 'bg-blue-500/10',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    borderClass: 'border-blue-500/30',
    gradientCta: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
    ringClass: 'ring-blue-500',
    dotClass: 'bg-blue-400'
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
    dotClass: 'bg-cyan-400'
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
    dotClass: 'bg-amber-400'
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
    dotClass: 'bg-orange-400'
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
    dotClass: 'bg-emerald-400'
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
    dotClass: 'bg-purple-400'
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
    dotClass: 'bg-rose-400'
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
    dotClass: 'bg-teal-400'
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
    dotClass: 'bg-indigo-400'
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
    dotClass: 'bg-red-400'
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
 * Guarda la configuración de temas en localStorage y emite el evento global
 */
export function saveModuleThemes(config: Record<ModuloKey, ColorTone>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_MODULE_THEMES, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('sara_module_themes_change', { detail: config }));
  } catch (e) {}
}
