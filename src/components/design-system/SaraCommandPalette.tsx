'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Calculator, Building2, Home, Bed, 
  ArrowRight, Sparkles, X, CornerDownLeft 
} from 'lucide-react';
import { Kbd } from './Kbd';
import { cn } from '@/lib/utils';

export interface CommandItem {
  id: string;
  module: 'apu' | 'constructora' | 'inmobiliaria' | 'stays';
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
}

const DEFAULT_COMMANDS: CommandItem[] = [
  // APU
  { id: '1', module: 'apu', title: 'Hormigón Estructural f\'c=210 kg/cm²', subtitle: 'Partida APU #03.02 • $142.50/m³', href: '/dashboard/apus/presupuestos', badge: 'APU' },
  { id: '2', module: 'apu', title: 'Desglose Insumos y Rendimientos NEC-15', subtitle: 'Calibración de cuadrilla provincial', href: '/dashboard/apus/insumos', badge: 'APU' },
  // Constructora
  { id: '3', module: 'constructora', title: 'Torre Bellavista - Etapa Estructuras', subtitle: 'Avance: 68.4% • 12 trabajadores activos', href: '/constructora', badge: 'Obra' },
  { id: '4', module: 'constructora', title: 'Libro de Obra Digital & Fiscalización', subtitle: 'Registro fotográfico geolocalizado', href: '/constructora', badge: 'Obra' },
  // Inmobiliaria
  { id: '5', module: 'inmobiliaria', title: 'Penthouse Cumbayá Vista Panorámica', subtitle: '184 m² • $295,000 • BIESS Aprobado', href: '/inmobiliaria', badge: 'PropTech' },
  { id: '6', module: 'inmobiliaria', title: 'Pipeline Leads VIP & Scoring Crediticio', subtitle: '14 prospectos en cierre', href: '/inmobiliaria', badge: 'Ventas' },
  // Stays
  { id: '7', module: 'stays', title: 'Suite 402 - Edificio Sky Tower', subtitle: 'Check-in hoy 15:00 • Huésped: Carlos V.', href: '/stays', badge: 'Stays' },
  { id: '8', module: 'stays', title: 'Calendario Tarifario Dinámico & LUAF', subtitle: 'Ocupación 92% este mes', href: '/stays', badge: 'Stays' },
];

export function SaraCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Escuchar Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const filtered = DEFAULT_COMMANDS.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.subtitle.toLowerCase().includes(query.toLowerCase()) ||
    cmd.module.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (cmd: CommandItem) => {
    setIsOpen(false);
    router.push(cmd.href);
  };

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette Global"
    >
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col focus:outline-none"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDownList}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Buscar en APU, Obras, Inmuebles, Reservas o Atajos (Cmd+K)..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-sans"
          />
          <div className="flex items-center gap-1.5">
            <Kbd>ESC</Kbd>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No se encontraron resultados para &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item, index) => {
              const isSelected = index === selectedIndex;
              const moduleIcons = {
                apu: Calculator,
                constructora: Building2,
                inmobiliaria: Home,
                stays: Bed
              };
              const Icon = moduleIcons[item.module];

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-150 text-left",
                    isSelected 
                      ? "bg-slate-800/90 text-white shadow-inner" 
                      : "text-slate-300 hover:bg-slate-800/40"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "p-2 rounded-lg border",
                      item.module === 'apu' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                      item.module === 'constructora' && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                      item.module === 'inmobiliaria' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                      item.module === 'stays' && "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">{item.title}</span>
                        {item.badge && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-3 shrink-0">
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        Ir <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>Navegar <Kbd>↑</Kbd> <Kbd>↓</Kbd></span>
            <span>Seleccionar <Kbd>↵</Kbd></span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">SARA OMNI-SEARCH v2.4</span>
        </div>
      </div>
    </div>
  );
}
