'use client';

import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Activity, 
  Zap, 
  Building2, 
  Calculator, 
  ShoppingCart, 
  Truck, 
  Users, 
  Home, 
  Hotel, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Brain, 
  RefreshCw, 
  Play, 
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  Key,
  QrCode,
  DollarSign
} from 'lucide-react';

export default function AgentesEcosistemaPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [isLearning, setIsLearning] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedAgentTab, setSelectedAgentTab] = useState<string>('constructora');

  // Form State
  const [projectName, setProjectName] = useState('Residencia Campestre Paucarbamba');
  const [provincia, setProvincia] = useState('Azuay');
  const [ciudad, setCiudad] = useState('Cuenca');
  const [areaM2, setAreaM2] = useState(240);
  const [tipologia, setTipologia] = useState<'Residencial' | 'Vial' | 'Comercial' | 'Estructura Metálica'>('Residencial');

  // Response Data
  const [choreographyResult, setChoreographyResult] = useState<any>(null);
  const [knowledgeBase, setKnowledgeBase] = useState<any[]>([]);
  const [learningLog, setLearningLog] = useState<any>(null);
  const [eventsTrace, setEventsTrace] = useState<any[]>([]);

  // Fetch initial knowledge base
  useEffect(() => {
    fetchKnowledgeBase();
  }, []);

  const fetchKnowledgeBase = async () => {
    try {
      const res = await fetch('/api/agents/learning');
      const data = await res.json();
      if (data.reglas) {
        setKnowledgeBase(data.reglas);
      }
    } catch (e) {
      console.error('Error fetching knowledge:', e);
    }
  };

  const handleRunChoreography = async () => {
    setIsRunning(true);
    setActiveStep(1);
    setChoreographyResult(null);

    try {
      // Simulación visual progresiva
      const stepTimer = setInterval(() => {
        setActiveStep((prev) => (prev < 8 ? prev + 1 : prev));
      }, 350);

      const res = await fetch('/api/agents/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: projectName,
          provincia,
          ciudad,
          tipologia,
          areaM2: Number(areaM2),
          niveles: areaM2 > 180 ? 2 : 1
        })
      });

      const data = await res.json();
      clearInterval(stepTimer);
      setActiveStep(8);

      if (data.success) {
        setChoreographyResult(data);
        if (data.executionTrace) setEventsTrace(data.executionTrace);
      }
    } catch (err) {
      console.error('Error al ejecutar la coreografía:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunLearningCycle = async () => {
    setIsLearning(true);
    try {
      const res = await fetch('/api/agents/learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proyectoId: choreographyResult?.proyectoId || 'proy_cierre_2026',
          correlationId: choreographyResult?.correlationId || 'corr_demo',
          provincia,
          duracionPlanificadaDias: 120,
          duracionRealDias: 128,
          costoPlanificadoUSD: choreographyResult?.resultados?.apu?.costoTotalObra || 115000,
          costoRealUSD: (choreographyResult?.resultados?.apu?.costoTotalObra || 115000) * 1.03,
          retrasoFletesHoras: 2.0,
          desempenoCuadrillaRating: 4.95,
          precioRealMaterialesDeltaPct: 3.1
        })
      });

      const data = await res.json();
      if (data.success) {
        setLearningLog(data.resultado);
        if (data.knowledgeBaseActualizado) {
          setKnowledgeBase(data.knowledgeBaseActualizado);
        }
      }
    } catch (e) {
      console.error('Error al ejecutar aprendizaje:', e);
    } finally {
      setIsLearning(false);
    }
  };

  const agentNodes = [
    { id: 'constructora', label: '1. CONSTRUCTORA', role: 'Iniciador Técnico', icon: Building2, color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
    { id: 'apu', label: '2. APU', role: 'Cómputo & Rendimientos', icon: Calculator, color: 'text-purple-400 border-purple-500/40 bg-purple-500/10' },
    { id: 'marketplace', label: '3. MARKETPLACE', role: 'Suministros Mayoristas', icon: ShoppingCart, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' },
    { id: 'fletes', label: '4. FLETES', role: 'Logística & Rutas', icon: Truck, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
    { id: 'talento', label: '5. TALENTO HUMANO', role: 'Push-to-Work & Terna', icon: Users, color: 'text-blue-400 border-blue-500/40 bg-blue-500/10' },
    { id: 'inmobiliaria', label: '6. INMOBILIARIA', role: 'Plusvalía & Tasación', icon: Home, color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
    { id: 'alojamiento', label: '7. ALOJAMIENTO', role: 'Stays & Campamentos', icon: Hotel, color: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10' },
    { id: 'pagos', label: '8. PAGOS', role: 'Escrow & Fideicomiso', icon: ShieldCheck, color: 'text-emerald-300 border-emerald-400/40 bg-emerald-500/20' }
  ];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header Ejecutivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-amber-950/40 border border-amber-500/20 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
            <Cpu className="w-3.5 h-3.5 animate-pulse" />
            <span>Chief AI Architect Core</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Red de Agentes Coreografiados con Memoria Compartida
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Capa de Inteligencia Colectiva Asíncrona Event-Driven de GRUPO SARA. 8 agentes autónomos con aprendizaje continuo inter-proyectos y memoria transaccional en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="block text-xs text-slate-400 font-mono">Estado Red</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ONLINE (Vercel + Supabase)
            </span>
          </div>
        </div>
      </div>

      {/* Control de Lanzamiento de Simulación */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Parámetros del Proyecto</span>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs text-slate-400 font-medium">Nombre de la Obra</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 font-medium">Provincia</label>
                <select
                  value={provincia}
                  onChange={(e) => {
                    setProvincia(e.target.value);
                    if (e.target.value === 'Azuay') setCiudad('Cuenca');
                    if (e.target.value === 'Pichincha') setCiudad('Quito');
                    if (e.target.value === 'Guayas') setCiudad('Guayaquil');
                  }}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                >
                  <option value="Azuay">Azuay</option>
                  <option value="Pichincha">Pichincha</option>
                  <option value="Guayas">Guayas</option>
                  <option value="Tungurahua">Tungurahua</option>
                  <option value="Galapagos">Galápagos</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">Ciudad</label>
                <input
                  type="text"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 font-medium">Área (m²)</label>
                <input
                  type="number"
                  value={areaM2}
                  onChange={(e) => setAreaM2(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">Tipología</label>
                <select
                  value={tipologia}
                  onChange={(e) => setTipologia(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                >
                  <option value="Residencial">Residencial</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Vial">Vial</option>
                  <option value="Estructura Metálica">Estructura Metálica</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleRunChoreography}
              disabled={isRunning}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Sincronizando 8 Agentes...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-slate-950 fill-current" />
                  <span>Disparar Coreografía Agéntica Completa</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Topología y Estado de los 8 Agentes */}
        <div className="lg:col-span-2 p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Topología de la Red & Coreografía Asíncrona</span>
            </div>
            {choreographyResult && (
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Corr ID: {choreographyResult.correlationId.substring(0, 13)}...
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {agentNodes.map((node, index) => {
              const Icon = node.icon;
              const isFinished = activeStep >= index + 1;
              const isCurrent = activeStep === index + 1 && isRunning;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedAgentTab(node.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedAgentTab === node.id ? 'ring-2 ring-amber-400 scale-[1.02]' : ''
                  } ${node.color} ${isCurrent ? 'animate-pulse' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-4 h-4" />
                    {isFinished ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-700" />
                    )}
                  </div>
                  <h4 className="font-black text-xs text-white leading-tight">{node.label}</h4>
                  <p className="text-[10px] text-slate-300 mt-1 opacity-80">{node.role}</p>
                </div>
              );
            })}
          </div>

          {/* Execution Trace Bar */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Progreso de Sincronización:</span>
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
            <span className="font-bold text-amber-400">{activeStep}/8 completados</span>
          </div>
        </div>
      </div>

      {/* Resultados de la Coreografía por Agente */}
      {choreographyResult && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
            {agentNodes.map((node) => (
              <button
                key={node.id}
                onClick={() => setSelectedAgentTab(node.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedAgentTab === node.id
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {node.label}
              </button>
            ))}
          </div>

          {/* Panel Detallado según agente seleccionado */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800/80">
            {selectedAgentTab === 'constructora' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-white text-base flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-400" />
                    SARA-CONSTRUCTORA: Entidad Raíz & Sugerencia Estructural
                  </h3>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Evento: PROYECTO_CREADO
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block mb-1">Sistema Constructivo Optimizado</span>
                    <strong className="text-white text-sm">
                      {choreographyResult.resultados.constructora.sistemaConstructivo}
                    </strong>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Ajustado según historial de menor tasa de retraso en {provincia}.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block mb-1">Presupuesto Referencial Base</span>
                    <strong className="text-amber-400 text-sm">
                      ${choreographyResult.resultados.constructora.presupuestoEstimadoReferencial.toLocaleString()} USD
                    </strong>
                    <p className="text-[10px] text-slate-400 mt-1">Cálculo paramétrico de arranque por {areaM2} m²</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block mb-1">Geolocalización Obra</span>
                    <strong className="text-white text-sm">
                      {choreographyResult.resultados.constructora.coordenadas.lat.toFixed(4)}, {choreographyResult.resultados.constructora.coordenadas.lng.toFixed(4)}
                    </strong>
                    <p className="text-[10px] text-slate-400 mt-1">{ciudad}, Ecuador</p>
                  </div>
                </div>
              </div>
            )}

            {selectedAgentTab === 'apu' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-white text-base flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-purple-400" />
                    SARA-APU: Volumetría, Presupuesto & Desglose Operativo
                  </h3>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Evento: APU_CONSOLIDADO
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs mb-4">
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block">Costo Total Obra</span>
                    <strong className="text-purple-400 text-sm">
                      ${choreographyResult.resultados.apu.costoTotalObra.toLocaleString()} USD
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block">Factor Rendimiento {provincia}</span>
                    <strong className="text-white text-sm">
                      {choreographyResult.resultados.apu.factorRendimientoAplicado}x
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block">Volumen Desalojo Tierra</span>
                    <strong className="text-white text-sm">
                      {choreographyResult.resultados.apu.desalojoCarga.volumenTierraDesalojoM3} m³
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block">Carga Pesada Total</span>
                    <strong className="text-white text-sm">
                      {choreographyResult.resultados.apu.desalojoCarga.materialCargaTon} Ton
                    </strong>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-300">Explosión de Insumos Extraída:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2">Código</th>
                        <th>Material</th>
                        <th>Cantidad</th>
                        <th>Peso Est. (Kg)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-slate-300">
                      {choreographyResult.resultados.apu.materialesRequeridos.map((m: any) => (
                        <tr key={m.codigo}>
                          <td className="py-2 font-mono text-purple-400">{m.codigo}</td>
                          <td>{m.nombre}</td>
                          <td>{m.cantidad.toLocaleString()} {m.unidad}</td>
                          <td>{m.pesoEstimadoKg.toLocaleString()} kg</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedAgentTab === 'marketplace' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-white text-base flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-cyan-400" />
                    SARA-MARKETPLACE: Cruce de Proveedores & Blindaje de Precios
                  </h3>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Evento: SUMINISTROS_ASIGNADOS
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-cyan-400 block">Alerta Predictiva de Volatilidad:</span>
                    <span className="text-slate-300">
                      {choreographyResult.resultados.marketplace.prediccionAlzaPrecios.alertaCompraAnticipada
                        ? 'Riesgo de subida en acero y cemento detectado. Recomendada compra anticipada para blindar presupuesto.'
                        : 'Precios estables en el mercado nacional.'}
                    </span>
                  </div>
                  <strong className="text-cyan-300 font-mono text-sm">
                    Ahorro Proyectado: ${choreographyResult.resultados.marketplace.prediccionAlzaPrecios.ahorroProyectadoUSD.toLocaleString()} USD
                  </strong>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {choreographyResult.resultados.marketplace.proveedoresSeleccionados.map((p: any) => (
                    <div key={p.proveedorId} className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-white">{p.nombre}</strong>
                        <span className="text-emerald-400 font-mono">-${p.ahorroObtenidoUSD} USD</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2">Origen: {p.ciudadOrigen}</p>
                      <span className="text-cyan-300 font-bold block">${p.subtotalUSD.toLocaleString()} USD</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedAgentTab === 'fletes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-white text-base flex items-center gap-2">
                    <Truck className="w-5 h-5 text-emerald-400" />
                    SARA-FLETES: Rutas Óptimas & Monitoreo de Vías en Ecuador
                  </h3>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Evento: LOGISTICA_PROCESADA
                  </span>
                </div>
                <div className="space-y-2">
                  {choreographyResult.resultados.fletes.alertasViales.map((alerta: string, idx: number) => (
                    <div key={idx} className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                      ⚠️ {alerta}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {choreographyResult.resultados.fletes.despachosRequeridos.map((d: any, idx: number) => (
                    <div key={idx} className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-white text-sm">{d.tipoVehiculo}</strong>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold">
                          {d.cantidadViajes} viaje(s)
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">Ruta: {d.ruta.origen} ➔ {d.ruta.destino}</p>
                      <p className="text-slate-400 text-[11px]">Cooperativa: {d.cooperativaAliada}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                        <span className="text-slate-400">Tiempo: ~{d.ruta.tiempoEstimadoHoras}h</span>
                        <strong className="text-emerald-400 font-mono">${d.tarifaTotalUSD.toLocaleString()} USD</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedAgentTab === 'talento' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-white text-base flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    SARA-TALENTOHUMANO: Convocatoria Push-to-Work & Terna Calificada
                  </h3>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Evento: CONVOCATORIA_TALENTO_EMITIDA
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block">Vacantes Requeridas</span>
                    <strong className="text-white text-sm">
                      {choreographyResult.resultados.talento.vacantesPublicadas} puestos
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block">Alertas WhatsApp Enviadas</span>
                    <strong className="text-emerald-400 text-sm">
                      {choreographyResult.resultados.talento.perfilesContactadosWhatsApp} profesionales
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block">Personal Foráneo (Requiere Stays)</span>
                    <strong className="text-blue-400 text-sm">
                      {choreographyResult.resultados.talento.personalForaneoCount} especialista(s)
                    </strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300">Terna Seleccionada por Afinidad IA:</h4>
                  {choreographyResult.resultados.talento.ternaCalificada.map((c: any) => (
                    <div key={c.trabajadorId} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-white block">{c.nombre}</strong>
                        <span className="text-slate-400 text-[11px]">{c.rol} · Calificación: ⭐ {c.calificacionHistorica}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-blue-400 block font-mono">Índice IA: {c.indiceAfinidadIA}</span>
                        <span className="text-[11px] text-slate-400">${c.tarifaHoraUSD}/hora</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedAgentTab === 'inmobiliaria' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-white text-base flex items-center gap-2">
                    <Home className="w-5 h-5 text-rose-400" />
                    SARA-INMOBILIARIA: Análisis de Plusvalía, Terrenos y Retorno (ROI)
                  </h3>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Evento: ANALISIS_INMOBILIARIO_COMPLETO
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block">Viabilidad Comercial</span>
                    <strong className="text-emerald-400 text-sm font-black">
                      {choreographyResult.resultados.inmobiliaria.viabilidadComercial}
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block">ROI Proyectado</span>
                    <strong className="text-rose-400 text-sm font-black">
                      +{choreographyResult.resultados.inmobiliaria.roiProyectadoPct}%
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block">Tasación de Terreno</span>
                    <strong className="text-white text-sm">
                      ${choreographyResult.resultados.inmobiliaria.tasacionTerrenoUSD.toLocaleString()} USD
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block">Velocidad de Absorción</span>
                    <strong className="text-white text-sm">
                      {choreographyResult.resultados.inmobiliaria.velocidadAbsorcionMeses} meses
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {selectedAgentTab === 'alojamiento' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-white text-base flex items-center gap-2">
                    <Hotel className="w-5 h-5 text-indigo-400" />
                    SARA-ALOJAMIENTO: Stays Ejecutivos & Cerradura Inteligente
                  </h3>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Evento: ALOJAMIENTOS_LOGISTICOS_RESERVADOS
                  </span>
                </div>
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-white text-sm block">
                        {choreographyResult.resultados.alojamiento.propiedadNombre}
                      </strong>
                      <span className="text-slate-400 text-[11px]">
                        {choreographyResult.resultados.alojamiento.ubicacionAlojamiento}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Cerradura Digital PIN</span>
                      <strong className="text-indigo-400 font-mono text-sm px-2 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/20">
                        {choreographyResult.resultados.alojamiento.checkInAutonomoPIN}
                      </strong>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-slate-400 block">Fechas</span>
                      <span className="text-white font-mono">
                        {choreographyResult.resultados.alojamiento.fechaIngreso} al {choreographyResult.resultados.alojamiento.fechaSalida}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Tarifa Dinámica</span>
                      <span className="text-white font-mono">${choreographyResult.resultados.alojamiento.tarifaNocheUSD}/noche</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Total Estancia</span>
                      <span className="text-indigo-400 font-bold font-mono">
                        ${choreographyResult.resultados.alojamiento.totalAlojamientoUSD.toLocaleString()} USD
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedAgentTab === 'pagos' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-white text-base flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    SARA-PAGOS: Cuenta Escrow Blindada & Fideicomiso por Hitos
                  </h3>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Evento: ECOSISTEMA_FINANCIADO_Y_BLINDADO
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block">Monto en Custodia Escrow</span>
                    <strong className="text-emerald-400 text-base font-black">
                      ${choreographyResult.resultados.pagos.montoTotalEscrowUSD.toLocaleString()} USD
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block">Cuenta Fiduciaria Segura</span>
                    <strong className="text-white text-xs font-mono">
                      {choreographyResult.resultados.pagos.cuentaCustodiaEscrow}
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl">
                    <span className="text-slate-400 block">Riesgo de Liquidez</span>
                    <strong className="text-emerald-400 text-sm">
                      {choreographyResult.resultados.pagos.scoreRiesgoLiquidez} (BLINDADO)
                    </strong>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-300">Hitos de Liberación Condicionados a Fiscalización:</h4>
                <div className="space-y-2">
                  {choreographyResult.resultados.pagos.hitosLiberacionFondos.map((h: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-white block">{h.hito}</strong>
                        <span className="text-slate-400 text-[11px]">{h.condicionValidacion}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-400 block font-mono">${h.montoUSD.toLocaleString()} USD</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          h.estado === 'Liberado' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {h.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Panel de Aprendizaje Continuo y Knowledge Base Evolutivo */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Brain className="w-3.5 h-3.5" />
              <span>Aprendizaje Continuo Inter-Proyectos</span>
            </div>
            <h2 className="text-xl font-black text-white">
              Knowledge Base Evolutivo Compartido
            </h2>
            <p className="text-slate-400 text-xs">
              Los 8 agentes consultan y actualizan este almacén de conocimiento cada vez que una obra avanza o concluye.
            </p>
          </div>

          <button
            onClick={handleRunLearningCycle}
            disabled={isLearning}
            className="flex items-center gap-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isLearning ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" />
            )}
            <span>Simular Cierre de Obra & Auto-Mejora</span>
          </button>
        </div>

        {learningLog && (
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-purple-300 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Sesión de Entrenamiento Completada con Éxito</span>
            </div>
            <p className="text-slate-300">
              Desviación presupuestaria detectada: {learningLog.deltasDetectados.desviacionPresupuestoPct}%. Desviación en cronograma: {learningLog.deltasDetectados.desviacionCronogramaDias} días.
            </p>
            <div className="space-y-1 pt-2">
              {learningLog.aprendizajesConsolidados.map((a: any, i: number) => (
                <div key={i} className="text-slate-300">
                  <span className="font-mono text-amber-400">[{a.agente}]</span> {a.reglaActualizada} ➔ <span className="text-purple-300">{a.impactoFuturo}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {knowledgeBase.map((kb: any) => (
            <div key={`${kb.domain}:${kb.entityKey}`} className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded">
                  {kb.domain}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {kb.sampleCount} muestras · Conf: {(kb.confidenceLevel * 100).toFixed(0)}%
                </span>
              </div>
              <strong className="text-white block text-xs">{kb.entityKey}</strong>
              <pre className="p-2 bg-slate-900 rounded-lg text-[10px] text-slate-300 overflow-x-auto font-mono">
                {JSON.stringify(kb.currentValue, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
