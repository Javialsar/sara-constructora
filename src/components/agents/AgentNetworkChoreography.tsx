'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calculator, 
  ShoppingCart, 
  Truck, 
  Users, 
  Home, 
  Hotel, 
  ShieldCheck, 
  BarChart3, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles, 
  Activity, 
  Zap, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Key,
  DollarSign
} from 'lucide-react';
import AgentAnalyticsModal, { AgentAnalyticsData } from './AgentAnalyticsModal';
import { getAgentAnalytics } from './AgentAnalyticsCatalog';

export interface ProjectContextInput {
  nombre: string;
  provincia: string;
  ciudad: string;
  areaM2: number;
  tipologia?: 'Residencial' | 'Vial' | 'Comercial' | 'Estructura Metálica';
  costoReferencial?: number;
  rubros?: Array<{
    codigo?: string;
    nombre: string;
    unidad?: string;
    cantidad?: number;
    subtotal?: number;
  }>;
}

interface AgentNetworkChoreographyProps {
  initialContext?: ProjectContextInput;
  autoRun?: boolean;
  compactMode?: boolean;
  onExecuted?: (result: any) => void;
}

export default function AgentNetworkChoreography({
  initialContext,
  autoRun = false,
  compactMode = false,
  onExecuted
}: AgentNetworkChoreographyProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedAgentTab, setSelectedAgentTab] = useState<string>('constructora');
  const [choreographyResult, setChoreographyResult] = useState<any>(null);

  // Modal de Analítica Detallada
  const [selectedAnalytics, setSelectedAnalytics] = useState<AgentAnalyticsData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Parámetros de proyecto activos
  const [projectData, setProjectData] = useState<ProjectContextInput>(
    initialContext || {
      nombre: 'Residencia Campestre Paucarbamba',
      provincia: 'Azuay',
      ciudad: 'Cuenca',
      areaM2: 240,
      tipologia: 'Residencial',
      costoReferencial: 95000
    }
  );

  useEffect(() => {
    if (initialContext) {
      setProjectData(initialContext);
    }
  }, [initialContext]);

  useEffect(() => {
    if (autoRun && !choreographyResult && !isRunning) {
      handleRunChoreography();
    }
  }, [autoRun]);

  const handleOpenAnalytics = (agentKey: string) => {
    const analytics = getAgentAnalytics(agentKey, {
      proyectoNombre: projectData.nombre,
      provincia: projectData.provincia,
      costoObra: choreographyResult?.resultados?.apu?.costoTotalObra || projectData.costoReferencial || 95000,
      areaM2: projectData.areaM2
    });
    setSelectedAnalytics(analytics);
    setIsModalOpen(true);
  };

  const handleRunChoreography = async () => {
    setIsRunning(true);
    setActiveStep(1);

    try {
      const stepTimer = setInterval(() => {
        setActiveStep((prev) => (prev < 8 ? prev + 1 : prev));
      }, 350);

      const res = await fetch('/api/agents/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: projectData.nombre,
          provincia: projectData.provincia,
          ciudad: projectData.ciudad,
          tipologia: projectData.tipologia || 'Residencial',
          areaM2: Number(projectData.areaM2) || 200,
          niveles: projectData.areaM2 > 180 ? 2 : 1
        })
      });

      const data = await res.json();
      clearInterval(stepTimer);
      setActiveStep(8);

      if (data.success) {
        setChoreographyResult(data);
        if (onExecuted) onExecuted(data);
      }
    } catch (err) {
      console.error('Error al ejecutar la red agéntica:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const agentNodes = [
    { id: 'constructora', label: '1. CONSTRUCTORA', role: 'Iniciador Técnico', icon: Building2, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10 hover:border-amber-400' },
    { id: 'apu', label: '2. APU', role: 'Cómputo & Rendimientos', icon: Calculator, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10 hover:border-purple-400' },
    { id: 'marketplace', label: '3. MARKETPLACE', role: 'Suministros Mayoristas', icon: ShoppingCart, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10 hover:border-cyan-400' },
    { id: 'fletes', label: '4. FLETES', role: 'Logística & Rutas', icon: Truck, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-400' },
    { id: 'talento', label: '5. TALENTO HUMANO', role: 'Push-to-Work & Terna', icon: Users, color: 'text-blue-400 border-blue-500/30 bg-blue-500/10 hover:border-blue-400' },
    { id: 'inmobiliaria', label: '6. INMOBILIARIA', role: 'Plusvalía & Tasación', icon: Home, color: 'text-rose-400 border-rose-500/30 bg-rose-500/10 hover:border-rose-400' },
    { id: 'alojamiento', label: '7. ALOJAMIENTO', role: 'Stays & Campamentos', icon: Hotel, color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10 hover:border-indigo-400' },
    { id: 'pagos', label: '8. PAGOS', role: 'Escrow & Fideicomiso', icon: ShieldCheck, color: 'text-emerald-300 border-emerald-400/40 bg-emerald-500/20 hover:border-emerald-300' }
  ];

  return (
    <div className="space-y-6">
      {/* Barra de Control y Disparador de la Red */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-amber-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-1">
            <Zap className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>Malla Agéntica Conectada en Vivo</span>
          </div>
          <h3 className="text-lg font-black text-white tracking-tight">
            Proyecto: <span className="text-amber-400">{projectData.nombre}</span> ({projectData.ciudad}, {projectData.provincia})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Área: {projectData.areaM2} m² · Presupuesto base estimado: ${Number(projectData.costoReferencial || 0).toLocaleString()} USD
          </p>
        </div>

        <button
          onClick={handleRunChoreography}
          disabled={isRunning}
          className="flex items-center justify-center gap-2 py-3 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl shadow-lg transition-all disabled:opacity-50 cursor-pointer text-xs"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              <span>Sincronizando los 8 Agentes...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-slate-950 fill-current" />
              <span>Disparar Coreografía Agéntica (8 Agentes)</span>
            </>
          )}
        </button>
      </div>

      {/* Grid de las 8 Tarjetas de Agentes con Botón de Analítica Detallada */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {agentNodes.map((node, index) => {
          const Icon = node.icon;
          const isFinished = activeStep >= index + 1;
          const isCurrent = activeStep === index + 1 && isRunning;

          return (
            <div
              key={node.id}
              className={`p-4 rounded-3xl border transition-all flex flex-col justify-between ${
                selectedAgentTab === node.id ? 'ring-2 ring-amber-400 scale-[1.01]' : ''
              } ${node.color} ${isCurrent ? 'animate-pulse' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
                    <Icon className="w-4 h-4" />
                  </div>
                  {isFinished ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      Activo
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">Pendiente</span>
                  )}
                </div>

                <h4 className="font-black text-xs text-white leading-tight mb-1">{node.label}</h4>
                <p className="text-[11px] text-slate-300 opacity-80 mb-3">{node.role}</p>

                {/* Resumen dinámico si ya corrió la coreografía */}
                {choreographyResult?.resultados && (
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-white/5 text-[10px] text-slate-300 space-y-1 mb-3">
                    {node.id === 'constructora' && (
                      <div>
                        <span className="text-slate-400">Sistema:</span> <strong className="text-white">{choreographyResult.resultados.constructora.sistemaConstructivo}</strong>
                      </div>
                    )}
                    {node.id === 'apu' && (
                      <div>
                        <span className="text-slate-400">Costo Obra:</span> <strong className="text-purple-400">${choreographyResult.resultados.apu.costoTotalObra.toLocaleString()} USD</strong>
                      </div>
                    )}
                    {node.id === 'marketplace' && (
                      <div>
                        <span className="text-slate-400">Suministros:</span> <strong className="text-cyan-400">${choreographyResult.resultados.marketplace.costoTotalSuministros.toLocaleString()} USD</strong>
                      </div>
                    )}
                    {node.id === 'fletes' && (
                      <div>
                        <span className="text-slate-400">Carga:</span> <strong className="text-emerald-400">{choreographyResult.resultados.fletes.pesoTotalCargaTon} Ton</strong>
                      </div>
                    )}
                    {node.id === 'talento' && (
                      <div>
                        <span className="text-slate-400">Terna IA:</span> <strong className="text-blue-400">{choreographyResult.resultados.talento.ternaCalificada.length} especialistas</strong>
                      </div>
                    )}
                    {node.id === 'inmobiliaria' && (
                      <div>
                        <span className="text-slate-400">ROI:</span> <strong className="text-rose-400">+{choreographyResult.resultados.inmobiliaria.roiProyectadoPct}%</strong>
                      </div>
                    )}
                    {node.id === 'alojamiento' && (
                      <div>
                        <span className="text-slate-400">PIN Stays:</span> <strong className="text-indigo-400 font-mono">{choreographyResult.resultados.alojamiento.checkInAutonomoPIN}</strong>
                      </div>
                    )}
                    {node.id === 'pagos' && (
                      <div>
                        <span className="text-slate-400">Escrow:</span> <strong className="text-emerald-300">${choreographyResult.resultados.pagos.montoTotalEscrowUSD.toLocaleString()} USD</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botón de Analítica Detallada Exigido por el Usuario */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAgentTab(node.id)}
                  className="text-[11px] font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Ver Datos
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAnalytics(node.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-bold transition-all shadow-xs cursor-pointer border border-white/10"
                >
                  <BarChart3 className="w-3 h-3 text-amber-400" />
                  <span>Analítica Detallada</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Barra de Progreso y Sincronización */}
      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 text-xs flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span>Sincronización en Memoria Compartida:</span>
        </span>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <div
              key={s}
              className={`w-6 h-1.5 rounded-full transition-all ${
                activeStep >= s ? 'bg-amber-400' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
        <span className="font-bold text-amber-400 font-mono text-xs">{activeStep}/8 Agentes sincronizados</span>
      </div>

      {/* Modal de Analítica Detallada */}
      <AgentAnalyticsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        agentData={selectedAnalytics}
      />
    </div>
  );
}
