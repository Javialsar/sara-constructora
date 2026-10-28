/**
 * SARA CORE DESIGN SYSTEM - MASTER SEMANTIC TOKENS
 * Design System Specification & CSS Variables
 * Compliant with Linear-grade aesthetics, Tailwind CSS v4, and WCAG AA Contrast.
 */

export const SARA_CORE_TOKENS = {
  neutrals: {
    dark: {
      background: 'hsl(222, 47%, 7%)',     // #0a0f1d
      surface: 'hsl(217, 33%, 12%)',       // #141c2b
      surfaceElevated: 'hsl(217, 30%, 16%)', // #1d283c
      border: 'hsl(215, 20%, 20%)',         // #293241
      borderSubtle: 'hsl(215, 18%, 15%)',   // #1f2734
      textPrimary: 'hsl(210, 40%, 98%)',    // #f8fafc
      textSecondary: 'hsl(215, 20%, 65%)',  // #94a3b8
      textMuted: 'hsl(215, 16%, 47%)',      // #64748b
    },
    light: {
      background: 'hsl(0, 0%, 98%)',        // #fafafa
      surface: 'hsl(0, 0%, 100%)',          // #ffffff
      surfaceElevated: 'hsl(210, 20%, 97%)', // #f1f5f9
      border: 'hsl(220, 13%, 91%)',         // #e2e8f0
      borderSubtle: 'hsl(220, 13%, 95%)',   // #f1f5f9
      textPrimary: 'hsl(222, 47%, 11%)',    // #0f172a
      textSecondary: 'hsl(215, 16%, 47%)',  // #64748b
      textMuted: 'hsl(215, 14%, 60%)',      // #94a3b8
    }
  },
  modules: {
    apu: {
      id: 'apu',
      name: 'SARA APU & Costos',
      label: 'Ingeniería de Costos y Licitaciones SERCOP',
      accent: 'hsl(217, 91%, 60%)',         // Cobalt Blue
      accentHex: '#3b82f6',
      accentMuted: 'hsla(217, 91%, 60%, 0.12)',
      borderAccent: 'hsla(217, 91%, 60%, 0.35)',
      tailwind: {
        text: 'text-blue-500 dark:text-blue-400',
        bgSubtle: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        ring: 'focus-visible:ring-blue-500',
        badge: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
        gradient: 'from-blue-600 to-indigo-600',
      }
    },
    constructora: {
      id: 'constructora',
      name: 'SARA Constructora',
      label: 'Dirección Técnica, BIM y Fiscalización de Obra',
      accent: 'hsl(38, 92%, 50%)',          // Amber Industrial
      accentHex: '#f59e0b',
      accentMuted: 'hsla(38, 92%, 50%, 0.12)',
      borderAccent: 'hsla(38, 92%, 50%, 0.35)',
      tailwind: {
        text: 'text-amber-500 dark:text-amber-400',
        bgSubtle: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        ring: 'focus-visible:ring-amber-500',
        badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
        gradient: 'from-amber-500 to-yellow-500',
      }
    },
    inmobiliaria: {
      id: 'inmobiliaria',
      name: 'SARA Inmobiliaria',
      label: 'Ventas, Tasación Econométrica y Leads',
      accent: 'hsl(160, 84%, 39%)',         // Emerald Slate
      accentHex: '#10b981',
      accentMuted: 'hsla(160, 84%, 39%, 0.12)',
      borderAccent: 'hsla(160, 84%, 39%, 0.35)',
      tailwind: {
        text: 'text-emerald-500 dark:text-emerald-400',
        bgSubtle: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        ring: 'focus-visible:ring-emerald-500',
        badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        gradient: 'from-emerald-500 to-teal-600',
      }
    },
    stays: {
      id: 'stays',
      name: 'SARA Stays',
      label: 'Corporate Housing y Revenue Management USALI',
      accent: 'hsl(350, 89%, 60%)',         // Coral Rose
      accentHex: '#f43f5e',
      accentMuted: 'hsla(350, 89%, 60%, 0.12)',
      borderAccent: 'hsla(350, 89%, 60%, 0.35)',
      tailwind: {
        text: 'text-rose-500 dark:text-rose-400',
        bgSubtle: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        ring: 'focus-visible:ring-rose-500',
        badge: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
        gradient: 'from-rose-500 to-pink-600',
      }
    }
  },
  typography: {
    sans: 'var(--font-sans, "Geist", "Inter", -apple-system, sans-serif)',
    mono: 'var(--font-mono, "Geist Mono", "JetBrains Mono", monospace)',
    featureSettings: '"cv02", "cv03", "cv04", "cv11"',
  },
  spacing: {
    touchTargetMin: '44px',
    gridBase: '4px',
  }
} as const;

export type SaraModuleKey = keyof typeof SARA_CORE_TOKENS.modules;
