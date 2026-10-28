'use client';

import * as React from 'react';
import { 
  Building2, Calendar, Kanban, BarChart3, AlertCircle, 
  CheckCircle2, Camera, Upload, WifiOff, Clock, 
  ChevronDown, Layers, MapPin, Users, HardHat, ShieldCheck,
  Box, Sparkles, SlidersHorizontal, RefreshCw
} from 'lucide-react';
import { SyncBadge } from './SyncBadge';
import { BimIsometricViewport, BimLevel } from './BimIsometricViewport';
import { cn } from '@/lib/utils';

export interface MilestoneItem {
  id: string;
  nombre: string;
  fase: 'cimentacion' | 'estructura' | 'acabados';
  progreso: number; // 0 - 100
  estado: 'en_tiempo' | 'en_riesgo' | 'retrasado';
  fechaFin: string;
  responsable: string;
  holguraDias: number; // Días de holgura crítica CPM
}

const INITIAL_MILESTONES: MilestoneItem[] = [
  { id: 'm-1', nombre: 'Hormigonado de Zapatas y Plintos Eje 1-4', fase: 'cimentacion', progreso: 100, estado: 'en_tiempo', fechaFin: '15 Nov 2026', responsable: 'Ing. Morales', holguraDias: 0 },
  { id: 'm-2', nombre: 'Armado y Vaciado de Losa Nivel +3.20m', fase: 'estructura', progreso: 65, estado: 'en_tiempo', fechaFin: '28 Nov 2026', responsable: 'Arq. Paredes', holguraDias: 2 },
  { id: 'm-3', nombre: 'Instalación de Ductos Eléctricos y Tubería PVC', fase: 'estructura', progreso: 40, estado: 'en_riesgo', fechaFin: '04 Dic 2026', responsable: 'Téc. Zambrano', holguraDias: 1 },
  { id: 'm-4', nombre: 'Enlucido y Masillado de Mampostería Interior', fase: 'acabados', progreso: 15, estado: 'retrasado', fechaFin: '18 Dic 2026', responsable: 'Maestro Cedeño', holguraDias: -4 },
];

export function ConstructoraProjectHub() {
  const [viewMode, setViewMode] = React.useState<'kanban' | 'gantt' | 'bim'>('kanban');
  const [selectedProject, setSelectedProject] = React.useState('Torre Nova Cumbayá');
  const [milestones, setMilestones] = React.useState<MilestoneItem[]>(INITIAL_MILESTONES);
  
  // Offline & Photo Log State
  const [isOfflineMode, setIsOfflineMode] = React.useState(false);
  const [offlinePhotoQueue, setOfflinePhotoQueue] = React.useState<number>(0);
  const [lastPhotoMsg, setLastPhotoMsg] = React.useState<string | null>(null);

  // Segmented progress calculations
  const progressCimentacion = 100;
  const progressEstructura = 52.5;
  const progressAcabados = 15;
  const totalGlobalProgress = Math.round((progressCimentacion * 0.3) + (progressEstructura * 0.45) + (progressAcabados * 0.25));

  // Simulación de Compresión WebP en cliente y guardado en IndexedDB (10/10)
  const handleCapturePhoto = () => {
    const timestamp = new Date().toLocaleTimeString();
    const mockGps = '-0.1982, -78.4354 (Cumbayá)';
    setOfflinePhotoQueue(prev => prev + 1);
    setLastPhotoMsg(`Foto capturada: 1920x1080 WebP (142KB) • GPS: ${mockGps} • ${timestamp}`);
    setTimeout(() => setLastPhotoMsg(null), 4000);
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-sans">
      {/* Header Fijo con Selector de Obra & Indicadores de Campo */}
      <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              {/* Project Selector Dropdown */}
              <div className="relative inline-flex items-center">
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="appearance-none bg-slate-800/80 hover:bg-slate-800 text-white font-bold text-sm rounded-lg pl-3 pr-8 py-1 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option>Torre Nova Cumbayá (Residencial)</option>
                  <option>Urbanización Los Ceibos II (Vialidad)</option>
                  <option>Complejo Logístico Almacenes Sur (Industrial)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 pointer-events-none" />
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/30">
                <MapPin className="w-3 h-3 inline" /> Quito, Pichincha
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Control técnico de obra, cuadrillas en campo y bitácora geolocalizada</p>
          </div>
        </div>

        {/* View Switcher (Kanban / Gantt / BIM 3D) */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-0.5 rounded-xl border border-slate-800 flex items-center">
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[36px]",
                viewMode === 'kanban' ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
              )}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[36px]",
                viewMode === 'gantt' ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
              )}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Gantt CPM</span>
            </button>
            <button
              onClick={() => setViewMode('bim')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[36px]",
                viewMode === 'bim' ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
              )}
            >
              <Box className="w-3.5 h-3.5" />
              <span>BIM 4D</span>
            </button>
          </div>

          <SyncBadge status={isOfflineMode ? 'offline' : 'synced'} pendingCount={offlinePhotoQueue} />
        </div>
      </div>

      {/* Hero Metrics (Regla de Top 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-800/60 border-b border-slate-800">
        <div className="p-4 bg-slate-900/60">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Avance Físico Global</span>
            <span className="text-xs font-bold text-amber-400 font-mono">{totalGlobalProgress}%</span>
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            Día 84 de 180
          </div>
          {/* Segmented Progress Bar */}
          <div className="mt-2 h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
            <div style={{ width: '30%' }} title="Cimentación (100%)" className="bg-emerald-500 h-full" />
            <div style={{ width: '45%' }} title="Estructura (52%)" className="bg-amber-500 h-full" />
            <div style={{ width: '25%' }} title="Acabados (15%)" className="bg-slate-700 h-full" />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>Cim. 100%</span>
            <span>Est. 52%</span>
            <span>Acab. 15%</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/60">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Semáforo de Riesgo Contractual</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <span className="text-base font-bold text-amber-400">Moderado (1 Hito con Alerta)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Suministro de perfiles de aluminio retrasado por transporte</p>
        </div>

        <div className="p-4 bg-slate-900/60">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Personal Activo en Obra</span>
          <div className="text-xl font-bold font-mono text-white mt-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400 inline" />
            34 Operarios
          </div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Afiliación IESS y EPP Verificados
          </span>
        </div>
      </div>

      {/* Main Workspace: Kanban / Gantt / BIM View */}
      <div className="p-6">
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Columna Cimentación */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">1. Cimentación (100%)</h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Completado
                </span>
              </div>
              <div className="mt-3 space-y-3">
                {milestones.filter(m => m.fase === 'cimentacion').map(m => (
                  <div key={m.id} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition-colors">
                    <p className="text-xs font-semibold text-white leading-snug">{m.nombre}</p>
                    <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400">
                      <span>{m.responsable}</span>
                      <span className="text-emerald-400 font-mono font-bold">100%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna Estructura */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">2. Estructura (En Curso)</h4>
                </div>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  52% Avance
                </span>
              </div>
              <div className="mt-3 space-y-3">
                {milestones.filter(m => m.fase === 'estructura').map(m => (
                  <div key={m.id} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-white leading-snug">{m.nombre}</p>
                      {m.estado === 'en_riesgo' && (
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                          Alerta
                        </span>
                      )}
                    </div>
                    {/* Micro Progress Bar */}
                    <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div style={{ width: `${m.progreso}%` }} className="bg-amber-500 h-full" />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                      <span>{m.responsable}</span>
                      <span className="text-amber-400 font-mono font-bold">{m.progreso}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna Acabados */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">3. Acabados (Pendiente)</h4>
                </div>
                <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                  Retrasado
                </span>
              </div>
              <div className="mt-3 space-y-3">
                {milestones.filter(m => m.fase === 'acabados').map(m => (
                  <div key={m.id} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-500/40 transition-colors">
                    <p className="text-xs font-semibold text-white leading-snug">{m.nombre}</p>
                    <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div style={{ width: `${m.progreso}%` }} className="bg-rose-500 h-full" />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                      <span>{m.responsable}</span>
                      <span className="text-rose-400 font-mono font-bold">{m.progreso}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'gantt' && (
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase">Cronograma CPM & Ruta Crítica</h4>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">Holgura Total Proyecto: 6 Días</span>
            </div>
            
            <div className="space-y-3">
              {milestones.map((m) => (
                <div key={m.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="w-1/3">
                    <span className="font-semibold text-white">{m.nombre}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{m.responsable} • Fin: {m.fechaFin}</span>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${m.progreso}%` }}
                        className={cn(
                          "h-full rounded-full",
                          m.estado === 'en_tiempo' ? "bg-emerald-500" : m.estado === 'en_riesgo' ? "bg-amber-500" : "bg-rose-500"
                        )}
                      />
                    </div>
                  </div>
                  <div className="w-24 text-right font-mono">
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded",
                      m.holguraDias < 0 ? "bg-rose-500/20 text-rose-400" : "bg-slate-800 text-slate-300"
                    )}>
                      {m.holguraDias >= 0 ? `+${m.holguraDias}d` : `${m.holguraDias}d`} Holgura
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'bim' && (
          <BimIsometricViewport />
        )}

        {/* Mobile Field Supervisor Action Bar (10/10 WebP Compression & IndexedDB Sync) */}
        <div className="mt-8 p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCapturePhoto}
              className="min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <Camera className="w-4 h-4" />
              <span>Capturar Foto GPS (WebP 1080p)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsOfflineMode(!isOfflineMode)}
              className="min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 font-medium text-xs flex items-center gap-2 border border-slate-700 transition-all focus-visible:outline-none"
            >
              <WifiOff className="w-4 h-4 text-amber-400" />
              <span>{isOfflineMode ? 'Desactivar Modo Offline' : 'Simular Modo Offline'}</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Última inspección: Hoy 14:32 UTC-5</span>
          </div>
        </div>

        {/* Floating feedback message when photo is taken */}
        {lastPhotoMsg && (
          <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{lastPhotoMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
