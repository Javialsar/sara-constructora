'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Sparkles, 
  Check, 
  Copy, 
  ExternalLink, 
  SlidersHorizontal,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  CANVA_100_PALETTES, 
  CANVA_CATEGORIAS, 
  CanvaPaletteItem 
} from '@/lib/theme/canva100Palettes';
import { 
  ModuloKey, 
  SARA_MODULES_LIST, 
  MODULE_ICONS 
} from '@/lib/theme/moduleThemes';

interface CanvaPalettesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPalette: (palette: CanvaPaletteItem, targetModule: ModuloKey) => void;
}

export function CanvaPalettesModal({ isOpen, onClose, onApplyPalette }: CanvaPalettesModalProps) {
  const [search, setSearch] = useState('');
  const [categoriaSel, setCategoriaSel] = useState<string>('TODAS');
  const [targetModule, setTargetModule] = useState<ModuloKey>('compras');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<number | null>(null);

  const filteredPalettes = useMemo(() => {
    return CANVA_100_PALETTES.filter(p => {
      const matchCat = categoriaSel === 'TODAS' || p.categoria.toLowerCase() === categoriaSel.toLowerCase();
      if (!matchCat) return false;
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        p.nombre.toLowerCase().includes(s) ||
        p.nombreEs.toLowerCase().includes(s) ||
        p.categoria.toLowerCase().includes(s) ||
        p.hexArray.some(h => h.toLowerCase().includes(s))
      );
    });
  }, [search, categoriaSel]);

  const handleCopy = (hex: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 2000);
    }
  };

  const handleApply = (pal: CanvaPaletteItem) => {
    setAppliedId(pal.id);
    onApplyPalette(pal, targetModule);
    setTimeout(() => setAppliedId(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Cabecera Principal */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Explorador de 100+ Paletas Armónicas Canva
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {CANVA_100_PALETTES.length} Combinaciones
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cuartetos cromáticos oficiales (60-30-10 + Texto) basados en la guía de diseño de Canva
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* Selector del Módulo Destino */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Aplicar a:</span>
              <select
                value={targetModule}
                onChange={(e) => setTargetModule(e.target.value as ModuloKey)}
                className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                {SARA_MODULES_LIST.map((m) => (
                  <option key={m.key} value={m.key} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                    {MODULE_ICONS[m.key]} {m.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Input de Búsqueda */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, tono (#ff420e) o estilo..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">
                ✕
              </button>
            )}
          </div>

          {/* Categorías */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
            {CANVA_CATEGORIAS.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSel(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  categoriaSel === cat
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cuadrícula de Paletas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/30">
          {filteredPalettes.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Layers className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No se encontraron paletas que coincidan con "{search}"
              </p>
              <button
                onClick={() => { setSearch(''); setCategoriaSel('TODAS'); }}
                className="px-4 py-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPalettes.map((pal) => {
                const isJustApplied = appliedId === pal.id;
                return (
                  <div
                    key={pal.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Cabecera de la Paleta */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-slate-400">#{pal.id}</span>
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                              {pal.nombreEs}
                            </h3>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">{pal.nombre}</span>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {pal.categoria}
                        </span>
                      </div>

                      {/* Las 4 Muestras Cromáticas de Canva */}
                      <div className="grid grid-cols-4 gap-1.5 my-3">
                        {pal.hexArray.map((hex, i) => {
                          const labels = ['Fondo 60%', 'Superficie 30%', 'Acento 10%', 'Texto'];
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleCopy(hex)}
                              title={`${labels[i]}: ${hex} (Clic para copiar)`}
                              className="group/color relative h-12 rounded-xl flex flex-col items-center justify-end p-1 transition-transform hover:scale-105 border border-black/10 shadow-xs"
                              style={{ backgroundColor: hex }}
                            >
                              <span className="text-[8px] font-mono font-bold px-1 py-0.5 rounded bg-black/40 text-white backdrop-blur-xs opacity-0 group-hover/color:opacity-100 transition-opacity">
                                {copiedHex === hex ? '✓ Copiado' : hex}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Vista Previa de Interfaz (Mini UI Box) */}
                      <div 
                        className="p-3 rounded-xl border border-black/10 mb-3 shadow-inner space-y-1.5 transition-colors"
                        style={{ backgroundColor: pal.color1 }}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <div 
                            className="px-2 py-0.5 rounded text-[9px] font-bold shadow-xs border border-white/20"
                            style={{ backgroundColor: pal.color2, color: pal.color4 }}
                          >
                            Card 30%
                          </div>
                          <span className="font-mono text-[9px] font-bold" style={{ color: pal.color4 }}>
                            {pal.color3}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <span className="text-[10px] font-medium truncate" style={{ color: pal.color4 }}>
                            Texto Armónico
                          </span>
                          <span 
                            className="px-2 py-0.5 rounded text-[10px] font-bold shadow-xs shrink-0"
                            style={{ backgroundColor: pal.color3, color: '#ffffff' }}
                          >
                            Botón CTA
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Botón Aplicar a Módulo */}
                    <button
                      onClick={() => handleApply(pal)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        isJustApplied
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-purple-600 dark:hover:bg-purple-500 dark:hover:text-white shadow-xs'
                      }`}
                    >
                      {isJustApplied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>¡Aplicado a {SARA_MODULES_LIST.find(m => m.key === targetModule)?.name}!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Aplicar a {MODULE_ICONS[targetModule]} {SARA_MODULES_LIST.find(m => m.key === targetModule)?.name.split(' ')[1] || 'Módulo'}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pie con Enlace a la Guía Oficial de Canva */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span>Fuente oficial:</span>
            <a
              href="https://www.canva.com/es_mx/aprende/100-combinaciones-colores-como-aplicarlas-disenos/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1"
            >
              <span>Canva Aprende — 100 Combinaciones Brillantes</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            Total {CANVA_100_PALETTES.length} paletas integradas en la tabla SARA
          </span>
        </div>

      </div>
    </div>
  );
}
