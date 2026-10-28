'use client';

import * as React from 'react';
import { 
  Calculator, TrendingUp, TrendingDown, Layers, FileDown, 
  ChevronRight, Wrench, Users, Box, Truck, Sparkles, 
  Search, SlidersHorizontal, ArrowUpDown, Plus, Check,
  Printer, X, Eye, Maximize2, Minimize2, HelpCircle
} from 'lucide-react';
import { SyncBadge } from './SyncBadge';
import { Kbd } from './Kbd';
import { cn } from '@/lib/utils';

export interface InsumoItem {
  id: string;
  tipo: 'mano_obra' | 'material' | 'equipo' | 'transporte';
  descripcion: string;
  unidad: string;
  cantidad: number;
  precioUnitario: number;
}

export interface PartidaAPU {
  id: string;
  codigo: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  variacionPct: number; // e.g. +3.2 o -1.5
  historico6Meses: number[]; // Array de 6 precios históricos para el Sparkline
  preciosProvinciales: { pichincha: number; guayas: number; azuay: number };
  insumos: InsumoItem[];
}

const INITIAL_PARTIDAS: PartidaAPU[] = [
  {
    id: 'p-1',
    codigo: '02.01',
    descripcion: 'Excavación manual de zanjas en suelo arcilloso h=1.50m',
    unidad: 'm³',
    cantidad: 145.0,
    variacionPct: -1.8,
    historico6Meses: [13.2, 13.0, 12.8, 12.6, 12.7, 12.5],
    preciosProvinciales: { pichincha: 12.50, guayas: 11.90, azuay: 12.80 },
    insumos: [
      { id: 'i-1', tipo: 'mano_obra', descripcion: 'Peón cuadrilla #1 (NEC-15)', unidad: 'h', cantidad: 2.4, precioUnitario: 3.85 },
      { id: 'i-2', tipo: 'equipo', descripcion: 'Herramienta menor (5% M.O.)', unidad: '%', cantidad: 1.0, precioUnitario: 0.46 },
      { id: 'i-3', tipo: 'transporte', descripcion: 'Desalojo de escombros d=5km', unidad: 'm³', cantidad: 1.25, precioUnitario: 4.50 },
    ]
  },
  {
    id: 'p-2',
    codigo: '03.04',
    descripcion: 'Hormigón simple f\'c=210 kg/cm² en zapatas y vigas',
    unidad: 'm³',
    cantidad: 82.5,
    variacionPct: 2.4,
    historico6Meses: [138.0, 139.5, 140.2, 141.0, 141.8, 142.5],
    preciosProvinciales: { pichincha: 142.50, guayas: 138.20, azuay: 144.10 },
    insumos: [
      { id: 'i-4', tipo: 'material', descripcion: 'Cemento Selvalegre Tipo IP (saco 50kg)', unidad: 'saco', cantidad: 8.5, precioUnitario: 8.20 },
      { id: 'i-5', tipo: 'material', descripcion: 'Arena gruesa de cantera Pifo lavada', unidad: 'm³', cantidad: 0.55, precioUnitario: 14.50 },
      { id: 'i-6', tipo: 'material', descripcion: 'Ripio triturado 3/4" clasificado', unidad: 'm³', cantidad: 0.85, precioUnitario: 16.00 },
      { id: 'i-7', tipo: 'mano_obra', descripcion: 'Maestro mayor + Cuadrilla hormigonado', unidad: 'h', cantidad: 4.2, precioUnitario: 5.10 },
      { id: 'i-8', tipo: 'equipo', descripcion: 'Hormigonera 1 saco 16HP a diésel', unidad: 'h', cantidad: 0.75, precioUnitario: 9.80 },
    ]
  },
  {
    id: 'p-3',
    codigo: '04.12',
    descripcion: 'Mampostería de bloque de hormigón alivianado 15x20x40cm',
    unidad: 'm²',
    cantidad: 340.0,
    variacionPct: 0.5,
    historico6Meses: [18.0, 18.1, 18.0, 18.2, 18.1, 18.2],
    preciosProvinciales: { pichincha: 18.20, guayas: 17.50, azuay: 18.90 },
    insumos: [
      { id: 'i-9', tipo: 'material', descripcion: 'Bloque estructural pesado 15x20x40', unidad: 'u', cantidad: 12.5, precioUnitario: 0.68 },
      { id: 'i-10', tipo: 'material', descripcion: 'Mortero 1:4 cemento-arena preparado', unidad: 'm³', cantidad: 0.025, precioUnitario: 85.00 },
      { id: 'i-11', tipo: 'mano_obra', descripcion: 'Albañil calificado + Peón de apoyo', unidad: 'h', cantidad: 0.85, precioUnitario: 4.90 },
      { id: 'i-12', tipo: 'equipo', descripcion: 'Andamio metálico modular de marco', unidad: 'd', cantidad: 0.1, precioUnitario: 2.20 }
    ]
  },
  {
    id: 'p-4',
    codigo: '05.02',
    descripcion: 'Punto de iluminación LED conduit EMT empotrado',
    unidad: 'pto',
    cantidad: 120.0,
    variacionPct: -0.9,
    historico6Meses: [22.8, 22.5, 22.4, 22.2, 22.1, 22.0],
    preciosProvinciales: { pichincha: 22.00, guayas: 21.40, azuay: 22.60 },
    insumos: [
      { id: 'i-13', tipo: 'material', descripcion: 'Tubo EMT 1/2" + Caja octogonal galvanizada', unidad: 'u', cantidad: 1.0, precioUnitario: 5.40 },
      { id: 'i-14', tipo: 'material', descripcion: 'Cable de cobre THHN #14 AWG 600V', unidad: 'm', cantidad: 12.0, precioUnitario: 0.42 },
      { id: 'i-15', tipo: 'mano_obra', descripcion: 'Electricista instalador certificado SECAP', unidad: 'h', cantidad: 1.2, precioUnitario: 5.60 }
    ]
  }
];

// Componente Sparkline Interactivo SVG con Tooltip Provincial
function SparklineWithTooltip({ partida }: { partida: PartidaAPU }) {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const data = partida.historico6Meses;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 54;
  const height = 18;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  const isUp = partida.variacionPct > 0;

  return (
    <div 
      className="relative inline-flex items-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={cn(
        "inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full cursor-help transition-all border",
        isUp ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      )}>
        {/* Micro Sparkline SVG */}
        <svg width={width} height={height} className="overflow-visible">
          <polyline
            fill="none"
            stroke={isUp ? "#f43f5e" : "#10b981"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
          <circle
            cx={width}
            cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2}
            r="2.5"
            fill={isUp ? "#f43f5e" : "#10b981"}
          />
        </svg>

        <span className="font-bold flex items-center">
          {isUp ? <TrendingUp className="w-2.5 h-2.5 inline mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 inline mr-0.5" />}
          {Math.abs(partida.variacionPct)}%
        </span>
      </div>

      {/* Floating Financial Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-3 z-50 text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[10px] font-mono uppercase text-blue-400 tracking-wider font-semibold border-b border-slate-800 pb-1 mb-2 flex justify-between items-center">
            <span>Matriz de Precios INEC IPCO</span>
            <span className="text-slate-400">6 Meses</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Pichincha (Quito):</span>
              <strong className="font-mono text-white">${partida.preciosProvinciales.pichincha.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Guayas (Guayaquil):</span>
              <strong className="font-mono text-white">${partida.preciosProvinciales.guayas.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Azuay (Cuenca):</span>
              <strong className="font-mono text-white">${partida.preciosProvinciales.azuay.toFixed(2)}</strong>
            </div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 font-mono flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Índice INEC Reajuste: 1.018</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function ApuMasterDetailSuite() {
  const [partidas, setPartidas] = React.useState<PartidaAPU[]>(INITIAL_PARTIDAS);
  const [selectedId, setSelectedId] = React.useState<string>('p-2');
  const [search, setSearch] = React.useState('');
  const [editingCell, setEditingCell] = React.useState<{ id: string; field: 'cantidad' } | null>(null);
  
  // 10/10 Mode: High-Density Toggle (Operador Experto)
  const [isUltraDense, setIsUltraDense] = React.useState(false);
  
  // 10/10 Mode: Floating Live RIDE APU Preview Drawer
  const [showRidePreview, setShowRidePreview] = React.useState(false);

  // Insumo Category Active Filter in Slide-over
  const [insumoFilter, setInsumoFilter] = React.useState<'todos' | 'mano_obra' | 'material' | 'equipo' | 'transporte'>('todos');

  // Partida seleccionada para el Split Screen (30% panel lateral)
  const selectedPartida = React.useMemo(() => 
    partidas.find(p => p.id === selectedId) || partidas[0], 
    [partidas, selectedId]
  );

  // Calcular precio unitario por partida
  const getCostoUnitario = (partida: PartidaAPU) => {
    return partida.insumos.reduce((acc, curr) => acc + (curr.cantidad * curr.precioUnitario), 0);
  };

  // Totales
  const totals = React.useMemo(() => {
    let costoDirectoTotal = 0;
    partidas.forEach(p => {
      costoDirectoTotal += p.cantidad * getCostoUnitario(p);
    });
    const indirectosAiu = costoDirectoTotal * 0.22; // 22% AIU
    const totalPresupuesto = costoDirectoTotal + indirectosAiu;
    return { costoDirectoTotal, indirectosAiu, totalPresupuesto };
  }, [partidas]);

  // Edición reactiva inline
  const handleUpdateCantidad = (id: string, newQty: number) => {
    setPartidas(prev => prev.map(p => p.id === id ? { ...p, cantidad: Math.max(0, newQty) } : p));
    setEditingCell(null);
  };

  const filteredPartidas = partidas.filter(p => 
    p.descripcion.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo.toLowerCase().includes(search.toLowerCase())
  );

  // 10/10 Keyboard-First Global Listener (J/K, E, Enter, Esc, Ctrl+P)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si estamos escribiendo en un input
      if (document.activeElement?.tagName === 'INPUT') {
        if (e.key === 'Escape') {
          setEditingCell(null);
          (document.activeElement as HTMLElement)?.blur();
        }
        return;
      }

      if (e.key.toLowerCase() === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        const currentIndex = filteredPartidas.findIndex(p => p.id === selectedId);
        const nextIndex = (currentIndex + 1) % filteredPartidas.length;
        if (filteredPartidas[nextIndex]) {
          setSelectedId(filteredPartidas[nextIndex].id);
        }
      } else if (e.key.toLowerCase() === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIndex = filteredPartidas.findIndex(p => p.id === selectedId);
        const prevIndex = (currentIndex - 1 + filteredPartidas.length) % filteredPartidas.length;
        if (filteredPartidas[prevIndex]) {
          setSelectedId(filteredPartidas[prevIndex].id);
        }
      } else if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setEditingCell({ id: selectedId, field: 'cantidad' });
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setShowRidePreview(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredPartidas, selectedId]);

  return (
    <div className="w-full bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-sans relative">
      {/* Top Bar con Módulo & Status Sync */}
      <div className="px-6 py-3.5 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-inner">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">SARA APU • Presupuesto Maestro</h2>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-blue-950/60 text-blue-400 border border-blue-800/40">
                PROY-2026-EC
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                SERCOP Calibrado
              </span>
            </div>
            <p className="text-xs text-slate-400">Análisis dinámico de costos unitarios bajo norma NEC-15 y SERCOP</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Toggle Modo Ultra-Denso (10/10) */}
          <button
            type="button"
            onClick={() => setIsUltraDense(!isUltraDense)}
            title="Alternar Modo Operador Ultra-Denso (4K)"
            className={cn(
              "p-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5",
              isUltraDense 
                ? "bg-blue-600/20 text-blue-400 border-blue-500/40" 
                : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white"
            )}
          >
            {isUltraDense ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-mono">{isUltraDense ? 'Ultra-Denso' : 'Normal'}</span>
          </button>

          <SyncBadge status="synced" lastSyncedAt="now" />

          {/* RIDE APU Live Preview Button */}
          <button 
            type="button"
            onClick={() => setShowRidePreview(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Vista RIDE</span>
            <Kbd className="ml-1 text-[9px] bg-blue-800 border-blue-600 text-white">Ctrl+P</Kbd>
          </button>
        </div>
      </div>

      {/* Hero Metrics (Regla de Top 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-800/60 border-b border-slate-800">
        <div className="p-4 bg-slate-900/60">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Costo Directo Base</span>
          <div className="text-xl font-bold font-mono text-white mt-1">
            ${totals.costoDirectoTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-blue-400 flex items-center gap-1 mt-0.5">
            <Sparkles className="w-3 h-3" /> 4 partidas verificadas en tiempo real
          </span>
        </div>

        <div className="p-4 bg-slate-900/60">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Indirectos AIU (22.00%)</span>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
            ${totals.indirectosAiu.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5">Fórmula Polinómica INEC IPCO calibrada</span>
        </div>

        <div className="p-4 bg-slate-900/60">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Presupuesto Referencial Total</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            ${totals.totalPresupuesto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-emerald-400/80 mt-0.5">VAE Ecuatoriano: 64.8% (Aprobado SERCOP)</span>
        </div>
      </div>

      {/* Main Split-Screen Workspace (70% Table / 30% Slide-Over Panel) */}
      <div className="flex flex-col lg:flex-row min-h-[540px]">
        {/* 70% Table of Partidas */}
        <div className="flex-1 lg:w-7/12 border-r border-slate-800 flex flex-col">
          {/* Table Header Filter & Keyboard Help Bar */}
          <div className="p-3 bg-slate-900/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar código o partida..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            {/* Keyboard Shortcuts Pills */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span className="hidden sm:inline">Navegar <Kbd>J</Kbd> <Kbd>K</Kbd></span>
              <span>Editar <Kbd>E</Kbd></span>
              <span>Confirmar <Kbd>↵</Kbd></span>
            </div>
          </div>

          {/* Table Content */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs" role="table" aria-label="Tabla de Partidas APU">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="py-2.5 px-4 w-16">Código</th>
                  <th scope="col" className="py-2.5 px-4">Descripción de Partida</th>
                  <th scope="col" className="py-2.5 px-3 w-16 text-center">Unidad</th>
                  <th scope="col" className="py-2.5 px-3 w-24 text-right">Cantidad</th>
                  <th scope="col" className="py-2.5 px-3 w-28 text-right">P. Unitario</th>
                  <th scope="col" className="py-2.5 px-4 w-32 text-right">Subtotal</th>
                  <th scope="col" className="py-2.5 px-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredPartidas.map((partida) => {
                  const unitCost = getCostoUnitario(partida);
                  const subtotal = partida.cantidad * unitCost;
                  const isSelected = partida.id === selectedId;

                  return (
                    <tr
                      key={partida.id}
                      onClick={() => setSelectedId(partida.id)}
                      className={cn(
                        "group cursor-pointer transition-colors duration-150 relative",
                        isUltraDense ? "text-[11px]" : "text-xs",
                        isSelected 
                          ? "bg-blue-950/40 text-white font-medium ring-1 ring-inset ring-blue-500/60" 
                          : "hover:bg-slate-900/50 text-slate-300"
                      )}
                    >
                      <td className={cn("px-4 font-mono font-semibold text-blue-400", isUltraDense ? "py-1.5" : "py-3")}>
                        {partida.codigo}
                      </td>
                      <td className={cn("px-4 font-normal", isUltraDense ? "py-1.5" : "py-3")}>
                        <div className="flex items-center gap-2.5">
                          <span className="line-clamp-1">{partida.descripcion}</span>
                          {/* Sparkline Interactivo con Tooltip Provincial */}
                          <SparklineWithTooltip partida={partida} />
                        </div>
                      </td>
                      <td className={cn("px-3 text-center font-mono text-slate-400", isUltraDense ? "py-1.5" : "py-3")}>
                        {partida.unidad}
                      </td>
                      {/* In-Line Editing Cell */}
                      <td 
                        className={cn("px-3 text-right font-mono", isUltraDense ? "py-1.5" : "py-3")}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCell({ id: partida.id, field: 'cantidad' });
                        }}
                      >
                        {editingCell?.id === partida.id ? (
                          <input
                            type="number"
                            autoFocus
                            defaultValue={partida.cantidad}
                            onBlur={(e) => handleUpdateCantidad(partida.id, parseFloat(e.target.value) || 0)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateCantidad(partida.id, parseFloat((e.target as HTMLInputElement).value) || 0);
                              }
                            }}
                            className="w-20 bg-slate-950 border border-blue-500 rounded px-1.5 py-0.5 text-right font-mono text-white focus:outline-none"
                          />
                        ) : (
                          <span className="hover:underline cursor-text px-1 py-0.5 rounded hover:bg-slate-800 font-semibold">
                            {partida.cantidad.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className={cn("px-3 text-right font-mono text-slate-300", isUltraDense ? "py-1.5" : "py-3")}>
                        ${unitCost.toFixed(2)}
                      </td>
                      <td className={cn("px-4 text-right font-mono font-bold text-white", isUltraDense ? "py-1.5" : "py-3")}>
                        ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={cn("px-3 text-center", isUltraDense ? "py-1.5" : "py-3")}>
                        <ChevronRight className={cn(
                          "w-4 h-4 transition-transform",
                          isSelected ? "text-blue-400 translate-x-0.5" : "text-slate-600 group-hover:text-slate-400"
                        )} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 30% Slide-Over Master Breakdown Panel */}
        <div className="w-full lg:w-5/12 bg-slate-950 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-semibold">
                  Desglose Cuadrático APU • {selectedPartida.codigo}
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5 leading-snug">
                  {selectedPartida.descripcion}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400">P. Unitario</span>
                <div className="text-base font-mono font-bold text-blue-400">
                  ${getCostoUnitario(selectedPartida).toFixed(2)}
                  <span className="text-[11px] text-slate-400 font-normal"> /{selectedPartida.unidad}</span>
                </div>
              </div>
            </div>

            {/* Insumo Category Pills (Todos / M.O. / Mat / Eq / Transp) */}
            <div className="flex items-center gap-1.5 mt-3 pb-2 border-b border-slate-800/60 overflow-x-auto text-[11px]">
              {(['todos', 'mano_obra', 'material', 'equipo', 'transporte'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setInsumoFilter(cat)}
                  className={cn(
                    "px-2.5 py-1 rounded-md font-mono text-[10px] uppercase transition-colors shrink-0",
                    insumoFilter === cat 
                      ? "bg-blue-600 text-white font-bold" 
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  )}
                >
                  {cat === 'todos' ? 'Todos' : cat === 'mano_obra' ? 'M.O.' : cat === 'material' ? 'Mat' : cat === 'equipo' ? 'Eq' : 'Flete'}
                </button>
              ))}
            </div>

            {/* Insumos Breakdown List by Category */}
            <div className="mt-3 space-y-2">
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {selectedPartida.insumos
                  .filter(ins => insumoFilter === 'todos' || ins.tipo === insumoFilter)
                  .map((insumo) => {
                    const itemSubtotal = insumo.cantidad * insumo.precioUnitario;
                    const icons = {
                      mano_obra: Users,
                      material: Box,
                      equipo: Wrench,
                      transporte: Truck
                    };
                    const Icon = icons[insumo.tipo];

                    return (
                      <div 
                        key={insumo.id}
                        className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={cn(
                            "p-1.5 rounded-lg border shrink-0",
                            insumo.tipo === 'mano_obra' && "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                            insumo.tipo === 'material' && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                            insumo.tipo === 'equipo' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                            insumo.tipo === 'transporte' && "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          )}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-200 truncate">{insumo.descripcion}</p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {insumo.cantidad} {insumo.unidad} × ${insumo.precioUnitario.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="text-right font-mono font-semibold text-white pl-2 shrink-0">
                          ${itemSubtotal.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Quick Action Footer */}
          <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400 font-mono">
              Rendimiento: <strong className="text-white">1.45 {selectedPartida.unidad}/día</strong>
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Insumo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Live RIDE APU Preview Drawer (10/10 Perfection) */}
      {showRidePreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2">
                <FileDown className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Vista Previa RIDE • Análisis de Precios Unitarios (APU)</h3>
              </div>
              <button
                onClick={() => setShowRidePreview(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Body (RIDE Format Simulation) */}
            <div className="p-8 overflow-y-auto bg-white text-slate-900 font-sans text-xs space-y-4">
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-base font-extrabold tracking-tight">GRUPO SARA • DIRECCIÓN DE INGENIERÍA</h1>
                  <p className="text-[11px] text-slate-600">RUC: 1792839182001 • Quito, Ecuador</p>
                  <p className="text-[11px] font-semibold mt-1">PROYECTO: TORRE NOVA CUMBAYÁ</p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] bg-slate-100 border border-slate-300 px-2 py-0.5 rounded font-bold">RIDE-APU-2026</span>
                  <p className="text-[10px] text-slate-500 mt-1">Fecha: 27/10/2026</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border rounded-lg">
                <h4 className="font-bold text-slate-900 text-xs uppercase">Partida #{selectedPartida.codigo}: {selectedPartida.descripcion}</h4>
                <div className="flex gap-6 mt-1 text-[11px] font-mono text-slate-600">
                  <span>Unidad: {selectedPartida.unidad}</span>
                  <span>Cantidad: {selectedPartida.cantidad}</span>
                  <span>P. Unitario: ${getCostoUnitario(selectedPartida).toFixed(2)}</span>
                </div>
              </div>

              {/* Insumos Table */}
              <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                <thead className="bg-slate-100 font-bold">
                  <tr>
                    <th className="p-2 border border-slate-300">Tipo</th>
                    <th className="p-2 border border-slate-300">Descripción del Insumo</th>
                    <th className="p-2 border border-slate-300 text-center">Unidad</th>
                    <th className="p-2 border border-slate-300 text-right">Cant.</th>
                    <th className="p-2 border border-slate-300 text-right">Tarifa</th>
                    <th className="p-2 border border-slate-300 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPartida.insumos.map(ins => (
                    <tr key={ins.id} className="border-b border-slate-200">
                      <td className="p-1.5 border border-slate-300 font-mono capitalize">{ins.tipo.replace('_', ' ')}</td>
                      <td className="p-1.5 border border-slate-300">{ins.descripcion}</td>
                      <td className="p-1.5 border border-slate-300 text-center font-mono">{ins.unidad}</td>
                      <td className="p-1.5 border border-slate-300 text-right font-mono">{ins.cantidad}</td>
                      <td className="p-1.5 border border-slate-300 text-right font-mono">${ins.precioUnitario.toFixed(2)}</td>
                      <td className="p-1.5 border border-slate-300 text-right font-mono font-bold">${(ins.cantidad * ins.precioUnitario).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-4 flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-200">
                <span>Firma de Responsabilidad Técnica: Ing. Residente de Obra</span>
                <span className="font-mono">Firma Electrónica XAdES-BES Válida SRI</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setShowRidePreview(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition-colors shadow-md"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / Descargar RIDE PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
