'use client';

import { useState, useEffect } from 'react';
import { 
  ModuloKey, 
  ColorTone, 
  CanvaFourColors, 
  ToneStyle, 
  COLOR_TONES, 
  DEFAULT_MODULE_THEMES, 
  getSavedModuleThemes,
  getCustomCanvaPalettes 
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

  const [customPalette, setCustomPalette] = useState<CanvaFourColors | null>(() => {
    const customs = getCustomCanvaPalettes();
    return customs[modKey] || null;
  });

  useEffect(() => {
    const syncTheme = () => {
      const saved = getSavedModuleThemes();
      const current = saved[modKey] || DEFAULT_MODULE_THEMES[modKey] || 'amber';
      setToneKey(current);
      const customs = getCustomCanvaPalettes();
      setCustomPalette(customs[modKey] || null);
    };

    syncTheme();

    const handler = (e: any) => {
      if (e?.detail && typeof e.detail === 'object') {
        if (e.detail[modKey]) {
          const newTone = e.detail[modKey] as ColorTone;
          if (newTone && COLOR_TONES[newTone]) {
            setToneKey(newTone);
            setCustomPalette(null);
          }
        }
        if (e.detail.canva_palettes) {
          const pal = e.detail.canva_palettes[modKey];
          if (pal) {
            setCustomPalette(pal);
          }
        }
      }
    };

    window.addEventListener('sara_module_themes_change', handler);
    return () => window.removeEventListener('sara_module_themes_change', handler);
  }, [modKey]);

  const style = COLOR_TONES[toneKey] || COLOR_TONES.amber;
  const palette = customPalette || style.canva;

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
