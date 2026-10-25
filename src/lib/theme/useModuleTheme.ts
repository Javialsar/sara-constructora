'use client';

import { useState, useEffect } from 'react';
import { 
  ModuloKey, 
  ColorTone, 
  CanvaFourColors, 
  ToneStyle, 
  COLOR_TONES, 
  DEFAULT_MODULE_THEMES, 
  getSavedModuleThemes 
} from './moduleThemes';

export interface UseModuleThemeReturn {
  toneKey: ColorTone;
  palette: CanvaFourColors;
  style: ToneStyle;
  cssVariables: React.CSSProperties;
}

export function useModuleTheme(modKey: ModuloKey): UseModuleThemeReturn {
  const [toneKey, setToneKey] = useState<ColorTone>(() => {
    const saved = getSavedModuleThemes();
    return saved[modKey] || DEFAULT_MODULE_THEMES[modKey] || 'amber';
  });

  useEffect(() => {
    const syncTheme = () => {
      const saved = getSavedModuleThemes();
      const current = saved[modKey] || DEFAULT_MODULE_THEMES[modKey] || 'amber';
      setToneKey(current);
    };

    syncTheme();

    const handler = (e: any) => {
      if (e?.detail && typeof e.detail === 'object') {
        const newTone = e.detail[modKey] as ColorTone;
        if (newTone && COLOR_TONES[newTone]) {
          setToneKey(newTone);
        }
      }
    };

    window.addEventListener('sara_module_themes_change', handler);
    return () => window.removeEventListener('sara_module_themes_change', handler);
  }, [modKey]);

  const style = COLOR_TONES[toneKey] || COLOR_TONES.amber;
  const palette = style.canva;

  const cssVariables = {
    '--mod-bg': palette.bgBase,
    '--mod-surface': palette.bgSurface,
    '--mod-accent': palette.accent,
    '--mod-accent-hover': palette.accentHover,
    '--mod-text': palette.textContrast,
    '--mod-text-muted': palette.textMuted,
    '--mod-border': palette.border,
    '--mod-glow': palette.glow,
  } as React.CSSProperties;

  return {
    toneKey,
    palette,
    style,
    cssVariables
  };
}
