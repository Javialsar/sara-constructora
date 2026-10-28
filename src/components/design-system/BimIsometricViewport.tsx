'use client';

import * as React from 'react';
import { 
  Box, Layers, Eye, RotateCw, ZoomIn, ZoomOut, 
  CheckCircle2, Clock, AlertTriangle, Sparkles 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BimLevel {
  id: string;
  name: string;
  elevation: string;
  phase: 'cimentacion' | 'estructura' | 'acabados';
  progress: number;
  elementsCount: number;
}

const BIM_LEVELS: BimLevel[] = [
  { id: 'lvl-4', name: 'Nivel +9.60m • Cubierta y Acabados', elevation: '+9.60m', phase: 'acabados', progress: 15, elementsCount: 42 },
  { id: 'lvl-3', name: 'Nivel +6.40m • Losa Tipo Piso 2', elevation: '+6.40m', phase: 'estructura', progress: 50, elementsCount: 78 },
  { id: 'lvl-2', name: 'Nivel +3.20m • Losa Nivel 1 & Vigas', elevation: '+3.20m', phase: 'estructura', progress: 75, elementsCount: 84 },
  { id: 'lvl-1', name: 'Nivel ±0.00m • Plintos, Zapatas & Cimentación', elevation: '±0.00m', phase: 'cimentacion', progress: 100, elementsCount: 56 },
];

export function BimIsometricViewport({
  onSelectLevel,
  selectedLevelId = 'lvl-2'
}: {
  onSelectLevel?: (level: BimLevel) => void;
  selectedLevelId?: string;
}) {
  const [activeLevel, setActiveLevel] = React.useState<string>(selectedLevelId);
  const [perspectiveAngle, setPerspectiveAngle] = React.useState<number>(45);

  const handleLevelClick = (lvl: BimLevel) => {
    setActiveLevel(lvl.id);
    onSelectLevel?.(lvl);
  };

  return (
    <div className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 font-sans text-slate-100">
      {/* Header Viewport */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Mini-Viewport BIM 4D • Modelo Isométrico IFC4
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400">Rotación: {perspectiveAngle}°</span>
          <button
            type="button"
            onClick={() => setPerspectiveAngle((prev) => (prev + 45) % 360)}
            className="p-1 rounded bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Isometric Schematic Stack */}
      <div className="py-6 flex flex-col items-center justify-center relative min-h-[220px]">
        <div className="w-full max-w-sm space-y-2.5">
          {BIM_LEVELS.map((lvl) => {
            const isSelected = lvl.id === activeLevel;
            return (
              <div
                key={lvl.id}
                onClick={() => handleLevelClick(lvl)}
                className={cn(
                  "p-3 rounded-xl border cursor-pointer transition-all duration-200 transform hover:-translate-y-0.5",
                  isSelected
                    ? "bg-slate-900 border-amber-500 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500"
                    : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-2.5 h-2.5 rounded-full shrink-0",
                      lvl.phase === 'cimentacion' && "bg-emerald-500",
                      lvl.phase === 'estructura' && "bg-amber-500 animate-pulse",
                      lvl.phase === 'acabados' && "bg-slate-600"
                    )} />
                    <span className="text-xs font-semibold text-white">{lvl.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-400">
                    {lvl.progress}%
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Elevación: {lvl.elevation}</span>
                  <span>{lvl.elementsCount} Elementos IFC</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span>ISO 19650 Common Data Environment (CDE)</span>
        <span className="text-amber-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Nivel Seleccionado Sincronizado
        </span>
      </div>
    </div>
  );
}
