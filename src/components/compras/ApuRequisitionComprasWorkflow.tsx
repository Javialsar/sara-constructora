'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  Layers, 
  HardHat, 
  Truck, 
  ShoppingCart, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  Download, 
  ArrowRight, 
  Boxes, 
  ShieldCheck, 
  AlertCircle, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  Send, 
  ChevronRight,
  Warehouse,
  Check,
  RefreshCw,
  Search,
  CheckCircle
} from 'lucide-react';
import { 
  PROYECTOS_OBRA_MOCK, 
  ProyectoObraActivo, 
  FaseCronogramaObra, 
  RequisicionObra, 
  AnalisisAgenteComprasResult, 
  EscenarioOpcionCompra, 
  OrdenCompraGenerada, 
  ApuRequisitionWorkflowService 
} from '@/lib/services/apuRequisitionWorkflowService';

export function ApuRequisitionComprasWorkflow() {
  // 1. Estados de Selección de Proyecto y Fase
  const [proyectos] = useState<ProyectoObraActivo[]>(PROYECTOS_OBRA_MOCK);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<ProyectoObraActivo>(PROYECTOS_OBRA_MOCK[0]);
  const [faseSeleccionada, setFaseSeleccionada] = useState<FaseCronogramaObra>(PROYECTOS_OBRA_MOCK[0].fasesCronograma[1] || PROYECTOS_OBRA_MOCK[0].fasesCronograma[0]);
  
  // Sub-pestaña de la Requisición (Materiales, Equipos, Cuadrilla)
  const [tabRequisicion, setTabRequisicion] = useState<'materiales' | 'equipos' | 'cuadrilla'>('materiales');

  // 2. Estado de la Requisición Generada
  const [requisicionActual, setRequisicionActual] = useState<RequisicionObra>(() => {
    return ApuRequisitionWorkflowService.generarRequisicionDesdeFase(
      PROYECTOS_OBRA_MOCK[0],
      PROYECTOS_OBRA_MOCK[0].fasesCronograma[1] || PROYECTOS_OBRA_MOCK[0].fasesCronograma[0]
    );
  });

  // 3. Estados del Análisis Agéntico
  const [analizandoConAgente, setAnalizandoConAgente] = useState(false);
  const [resultadoAnalisis, setResultadoAnalisis] = useState<AnalisisAgenteComprasResult | null>(null);
  const [opcionElegida, setOpcionElegida] = useState<'OPCION_A_AHORRO' | 'OPCION_B_INMEDIATEZ'>('OPCION_A_AHORRO');

  // 4. Estados de las Órdenes de Compra Fragmentadas
  const [despachandoOC, setDespachandoOC] = useState(false);
  const [ordenesGeneradas, setOrdenesGeneradas] = useState<OrdenCompraGenerada[] | null>(null);
  const [ocSeleccionadaParaVer, setOcSeleccionadaParaVer] = useState<OrdenCompraGenerada | null>(null);

  // Notificación del Agente Orquestador
  const [agentNotice, setAgentNotice] = useState<string | null>(null);

  // Manejar cambio de proyecto
  const handleCambiarProyecto = (proyId: string) => {
    const proy = proyectos.find(p => p.id === proyId) || proyectos[0];
    setProyectoSeleccionado(proy);
    const fase = proy.fasesCronograma[0];
    setFaseSeleccionada(fase);
    const nuevaReq = ApuRequisitionWorkflowService.generarRequisicionDesdeFase(proy, fase);
    setRequisicionActual(nuevaReq);
    setResultadoAnalisis(null);
    setOrdenesGeneradas(null);
    setOcSeleccionadaParaVer(null);
  };

  // Manejar cambio de fase del cronograma
  const handleCambiarFase = (faseId: string) => {
    const fase = proyectoSeleccionado.fasesCronograma.find(f => f.id === faseId) || proyectoSeleccionado.fasesCronograma[0];
    setFaseSeleccionada(fase);
    const nuevaReq = ApuRequisitionWorkflowService.generarRequisicionDesdeFase(proyectoSeleccionado, fase);
    setRequisicionActual(nuevaReq);
    setResultadoAnalisis(null);
    setOrdenesGeneradas(null);
    setOcSeleccionadaParaVer(null);
  };

  // Ejecutar el Análisis del Agente SARA_PREDICTIVE_PURCHASE
  const handleEjecutarAnalisisAgente = () => {
    setAnalizandoConAgente(true);
    setAgentNotice(`🤖 SARA_PREDICTIVE_PURCHASE: Analizando Landed Cost, distancia vial a ${proyectoSeleccionado.canton} y fletes pesados MTOP para ${requisicionActual.pesoTotalCargaToneladas} Toneladas...`);

    setTimeout(() => {
      const resultado = ApuRequisitionWorkflowService.analizarRequisicionConAgente(requisicionActual);
      setResultadoAnalisis(resultado);
      setAnalizandoConAgente(false);
      setAgentNotice(`✅ Análisis Agéntico completado: 2 Opciones Estratégicas generadas para ${proyectoSeleccionado.nombre}.`);
      
      // Auto-scroll al resultado
      const el = document.getElementById('seccion-opciones-agente');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 1200);
  };

  // Generar y Fragmentar las Órdenes de Compra por Proveedor
  const handleDespacharOrdenesCompra = () => {
    if (!resultadoAnalisis) return;

    setDespachandoOC(true);
    setAgentNotice(`⚙️ SARA_ORDER_DISPATCHER: Fragmentando Requisición en Órdenes de Compra por Proveedor y emitiendo documentos oficiales...`);

    setTimeout(() => {
      const opcion = opcionElegida === 'OPCION_A_AHORRO' ? resultadoAnalisis.opcionA : resultadoAnalisis.opcionB;
      const ocs = ApuRequisitionWorkflowService.generarOrdenesDeCompraFragmentadas(requisicionActual, opcion);
      setOrdenesGeneradas(ocs);
      setOcSeleccionadaParaVer(ocs[0]);
      setDespachandoOC(false);
      setAgentNotice(`🚀 ¡Órdenes de Compra emitidas con éxito! Notificación enviada a proveedores, Bodega y Contabilidad para 3-Way Match.`);

      // Auto-scroll a la sección de OCs
      const el = document.getElementById('seccion-ordenes-generadas');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 1400);
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------- */}
      {/* CABECERA & EXPLICACIÓN DEL FLUJO AUTOMATIZADO                      */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 rounded-3xl border border-amber-500/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Flujo Agéntico Autónomo • Grupo SARA
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-0.5">
            <ShoppingCart className="w-5 h-5 text-amber-500" />
            Requisiciones APU & Procuramiento Predictivo Georreferenciado
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            El sistema toma el <strong>Cronograma Valorado</strong> y los <strong>APUs de la Obra</strong> para saber con precisión matemática qué insumos, equipos y personal se requieren en cada fase. El agente <strong>SARA_PREDICTIVE_PURCHASE</strong> calcula el flete por Ton-Km y le ofrece 2 opciones estratégicas para fragmentar y enviar las Órdenes de Compra automáticamente.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Normativa NEC / MTOP 2026
          </span>
        </div>
      </div>

      {/* Banner de Notificación del Agente */}
      {agentNotice && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400 animate-spin" />
            <span>{agentNotice}</span>
          </div>
          <button 
            onClick={() => setAgentNotice(null)}
            className="text-amber-400/70 hover:text-amber-300 text-xs px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* PASO 1: SELECTOR DE PROYECTO & FASE DEL CRONOGRAMA                 */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-500" />
            1. Selección de Obra en Ejecución & Hito del Cronograma
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Residente a Cargo: <strong className="text-slate-700 dark:text-slate-200">{proyectoSeleccionado.residenteObra}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-slate-500 dark:text-slate-400 text-xs font-mono block mb-1.5">
              Proyecto de Construcción Civil:
            </label>
            <select
              value={proyectoSeleccionado.id}
              onChange={(e) => handleCambiarProyecto(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
            >
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} — {p.canton}, {p.provincia}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-500 dark:text-slate-400 text-xs font-mono block mb-1.5">
              Fase del Cronograma Valorado Activa:
            </label>
            <select
              value={faseSeleccionada.id}
              onChange={(e) => handleCambiarFase(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
            >
              {proyectoSeleccionado.fasesCronograma.map((f) => (
                <option key={f.id} value={f.id}>
                  Fase {f.numeroFase}: {f.nombreFase} ({f.semanasEstimadas})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumen de la Requisición Pre-Calculada */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Requisición ID:</span>
            <span className="font-bold text-amber-500">{requisicionActual.numeroRequisicion}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Destino de Carga:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{proyectoSeleccionado.canton}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Peso Total Estimado:</span>
            <span className="font-bold text-sky-400">{requisicionActual.pesoTotalCargaToneladas} Toneladas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Emisor:</span>
            <span className="text-slate-700 dark:text-slate-300">{requisicionActual.residenteEmisor}</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* PASO 2: DETALLE DE LA REQUISICIÓN EXPLOTADA POR EL APU             */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Cabecera y Selector de Viñetas de Requisición */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono">
              2. Explosión del APU para la Fase: {faseSeleccionada.nombreFase}
            </h3>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTabRequisicion('materiales')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                tabRequisicion === 'materiales'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Materiales ({requisicionActual.materiales.length})</span>
            </button>
            <button
              onClick={() => setTabRequisicion('equipos')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                tabRequisicion === 'equipos'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Equipos ({requisicionActual.equipos.length})</span>
            </button>
            <button
              onClick={() => setTabRequisicion('cuadrilla')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                tabRequisicion === 'cuadrilla'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Mano de Obra ({requisicionActual.cuadrilla.length})</span>
            </button>
          </div>
        </div>

        {/* Contenido de Materiales Requeridos */}
        {tabRequisicion === 'materiales' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">CÓDIGO</th>
                  <th className="px-4 py-3 font-semibold">DESCRIPCIÓN DEL INSUMO (APU)</th>
                  <th className="px-4 py-3 font-semibold">RUBRO ASOCIADO</th>
                  <th className="px-4 py-3 font-semibold text-center">UNIDAD</th>
                  <th className="px-4 py-3 font-semibold text-right">CANT. NETA</th>
                  <th className="px-4 py-3 font-semibold text-center">% DESPERDICIO</th>
                  <th className="px-4 py-3 font-semibold text-right text-amber-500">CANT. PEDIDA</th>
                  <th className="px-4 py-3 font-semibold text-right">PESO EST.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {requisicionActual.materiales.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50">
                    <td className="px-4 py-3 font-bold text-amber-500">{m.codigo}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{m.descripcion}</td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">{m.rubroOrigen}</td>
                    <td className="px-4 py-3 text-center text-slate-500">{m.unidad}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{m.cantidadNeta}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                        +{m.desperdicioNormativoPct}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-slate-900 dark:text-white tabular-nums">
                      {m.cantidadRequerida}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-400">
                      {m.pesoTotalToneladas} T
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Contenido de Equipos */}
        {tabRequisicion === 'equipos' && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {requisicionActual.equipos.map((eq) => (
              <div key={eq.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-mono space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-amber-500 block">{eq.codigo}</span>
                    <strong className="text-slate-900 dark:text-white text-sm">{eq.descripcion}</strong>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-bold text-[10px]">
                    {eq.horasRequeridas} Horas
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>Costo Estimado:</span>
                  <strong className="text-slate-800 dark:text-slate-200">${eq.costoHoraUSD.toFixed(2)} USD/h</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Proveedor Homologado:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{eq.proveedorSugerido}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contenido de Mano de Obra */}
        {tabRequisicion === 'cuadrilla' && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {requisicionActual.cuadrilla.map((cu) => (
              <div key={cu.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-mono space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-900 dark:text-white">{cu.categoriaOcupacional}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">
                    {cu.cantidadPersonas} Obreros
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{cu.especialidad}</p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jornadas:</span>
                    <strong>{cu.jornadasEstimadas} días</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Certificación:</span>
                    <span className="text-amber-500 font-bold">{cu.certificacionRequerida}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pie con el Botón del Agente */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850/60 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            La Requisición ha sido validada por el Residente de Obra. Lista para optimización de compras y ruteo MTOP.
          </div>

          <button
            onClick={handleEjecutarAnalisisAgente}
            disabled={analizandoConAgente}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 shrink-0"
          >
            {analizandoConAgente ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analizando Landed Cost & Fletes...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Adquirir Productos / Optimizar con Agente IA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* PASO 3: PRESENTACIÓN DE LAS 2 OPCIONES ESTRATÉGICAS DE COMPRA      */}
      {/* ------------------------------------------------------------------- */}
      {resultadoAnalisis && (
        <div id="seccion-opciones-agente" className="space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Dictamen Agéntico Generado • SARA_PREDICTIVE_PURCHASE
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                3. Selección de Estrategia de Compra para {proyectoSeleccionado.nombre}
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Evaluación para {resultadoAnalisis.toneladasEvaluadas} T en {resultadoAnalisis.cantonObra}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Tarjeta Opción A: Máximo Ahorro Corporativo */}
            <div 
              onClick={() => setOpcionElegida('OPCION_A_AHORRO')}
              className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                opcionElegida === 'OPCION_A_AHORRO'
                  ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 shadow-lg'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-slate-950 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    RECOMENDADA POR PRECIO
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-500 flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    Ahorro: ${resultadoAnalisis.opcionA.ahorroRespectoPrecioListaUSD.toFixed(2)} USD
                  </span>
                </div>

                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {resultadoAnalisis.opcionA.titulo}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 mb-3">
                  {resultadoAnalisis.opcionA.estrategia}
                </p>

                {/* Desglose Económico */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal Insumos Netos:</span>
                    <strong className="text-slate-800 dark:text-slate-200">${resultadoAnalisis.opcionA.costoMaterialesNetoUSD.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between text-emerald-500">
                    <span>Descuento Escala Mayorista:</span>
                    <strong>-${resultadoAnalisis.opcionA.descuentoGlobalAlcanzadoUSD.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Flete Pesado MTOP Consolidado:</span>
                    <strong>${resultadoAnalisis.opcionA.costoFletePesadoUSD.toFixed(2)}</strong>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm">
                    <span className="font-bold text-slate-900 dark:text-white">Costo Total Puesto en Obra:</span>
                    <span className="font-extrabold text-amber-500">${resultadoAnalisis.opcionA.costoTotalLandedUSD.toFixed(2)} USD</span>
                  </div>
                </div>

                {/* Proveedores Involucrados */}
                <div className="mt-3 space-y-1.5 text-xs font-mono">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Proveedores a Contratar:</span>
                  {resultadoAnalisis.opcionA.proveedoresInvolucrados.map((prov, i) => (
                    <div key={i} className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300">
                      <span>• {prov.razonSocial}</span>
                      <strong className="text-slate-800 dark:text-slate-200">${prov.totalPuestoEnObraUSD.toFixed(2)}</strong>
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-mono flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>Tiempo de entrega estimado: <strong>{resultadoAnalisis.opcionA.tiempoEstimadoHoras} horas</strong></span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-500">
                  {opcionElegida === 'OPCION_A_AHORRO' ? '✓ Seleccionada' : 'Clic para seleccionar'}
                </span>
                <input
                  type="radio"
                  name="opcionCompra"
                  checked={opcionElegida === 'OPCION_A_AHORRO'}
                  onChange={() => setOpcionElegida('OPCION_A_AHORRO')}
                  className="w-4 h-4 text-amber-500 focus:ring-amber-400"
                />
              </div>
            </div>

            {/* Tarjeta Opción B: Máxima Velocidad Local */}
            <div 
              onClick={() => setOpcionElegida('OPCION_B_INMEDIATEZ')}
              className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                opcionElegida === 'OPCION_B_INMEDIATEZ'
                  ? 'border-sky-500 bg-sky-500/5 dark:bg-sky-500/10 shadow-lg'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-sky-500 text-white flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    RECOMENDADA POR VELOCIDAD
                  </span>
                  <span className="text-xs font-mono font-bold text-sky-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Entrega en 3 Horas
                  </span>
                </div>

                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {resultadoAnalisis.opcionB.titulo}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 mb-3">
                  {resultadoAnalisis.opcionB.estrategia}
                </p>

                {/* Desglose Económico */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal Insumos de Mostrador:</span>
                    <strong className="text-slate-800 dark:text-slate-200">${resultadoAnalisis.opcionB.costoMaterialesNetoUSD.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Descuento Comercial Red:</span>
                    <strong>-${resultadoAnalisis.opcionB.descuentoGlobalAlcanzadoUSD.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Flete Local Patio (Volqueta):</span>
                    <strong>${resultadoAnalisis.opcionB.costoFletePesadoUSD.toFixed(2)}</strong>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm">
                    <span className="font-bold text-slate-900 dark:text-white">Costo Total Puesto en Obra:</span>
                    <span className="font-extrabold text-sky-400">${resultadoAnalisis.opcionB.costoTotalLandedUSD.toFixed(2)} USD</span>
                  </div>
                </div>

                {/* Proveedores Involucrados */}
                <div className="mt-3 space-y-1.5 text-xs font-mono">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Proveedores a Contratar:</span>
                  {resultadoAnalisis.opcionB.proveedoresInvolucrados.map((prov, i) => (
                    <div key={i} className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300">
                      <span>• {prov.razonSocial}</span>
                      <strong className="text-slate-800 dark:text-slate-200">${prov.totalPuestoEnObraUSD.toFixed(2)}</strong>
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[11px] font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Despacho inmediato a pie de obra: <strong>3 horas</strong></span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-500">
                  {opcionElegida === 'OPCION_B_INMEDIATEZ' ? '✓ Seleccionada' : 'Clic para seleccionar'}
                </span>
                <input
                  type="radio"
                  name="opcionCompra"
                  checked={opcionElegida === 'OPCION_B_INMEDIATEZ'}
                  onChange={() => setOpcionElegida('OPCION_B_INMEDIATEZ')}
                  className="w-4 h-4 text-sky-500 focus:ring-sky-400"
                />
              </div>
            </div>
          </div>

          {/* Botón de Confirmación y Fragmentación */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold font-mono text-slate-800 dark:text-white block">
                Estrategia seleccionada: {opcionElegida === 'OPCION_A_AHORRO' ? 'Opción A (Máximo Ahorro Corporativo)' : 'Opción B (Máxima Inmediatez Local)'}
              </span>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Al confirmar, el sistema generará automáticamente las Órdenes de Compra por separado para cada fabricante y las despachará por correo/API.
              </p>
            </div>

            <button
              onClick={handleDespacharOrdenesCompra}
              disabled={despachandoOC}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold font-mono text-xs shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 shrink-0"
            >
              {despachandoOC ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generando & Fragmentando Órdenes...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Generar Órdenes de Compra & Despachar</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* PASO 4: ÓRDENES DE COMPRA FRAGMENTADAS & TRAZABILIDAD              */}
      {/* ------------------------------------------------------------------- */}
      {ordenesGeneradas && (
        <div id="seccion-ordenes-generadas" className="space-y-5 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                Órdenes de Compra Emitidas • SARA_ORDER_DISPATCHER
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                4. Órdenes de Compra Fragmentadas por Proveedor ({ordenesGeneradas.length})
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-500 font-bold">
              Despachadas Automáticamente a Proveedores
            </span>
          </div>

          {/* Selector de Órdenes Generadas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ordenesGeneradas.map((oc) => (
              <div 
                key={oc.id}
                onClick={() => setOcSeleccionadaParaVer(oc)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  ocSeleccionadaParaVer?.id === oc.id
                    ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-extrabold text-amber-500 font-mono text-xs">{oc.numeroOC}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                    Enviado a Proveedor
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {oc.razonSocial}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">RUC: {oc.ruc}</p>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">{oc.items.length} Insumos</span>
                  <strong className="text-sm font-extrabold text-slate-900 dark:text-white">
                    ${oc.totalAPagar.toFixed(2)} USD
                  </strong>
                </div>
              </div>
            ))}
          </div>

          {/* Visor Detallado de la Orden Seleccionada */}
          {ocSeleccionadaParaVer && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Vista Oficial de la Orden de Compra</span>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {ocSeleccionadaParaVer.numeroOC} ➔ {ocSeleccionadaParaVer.razonSocial}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Despacho con destino a: <strong className="text-amber-500">{ocSeleccionadaParaVer.obraDestino}</strong>
                  </p>
                </div>

                <button
                  onClick={() => alert(`Descargando documento digital oficial: ${ocSeleccionadaParaVer.numeroOC}.pdf con firma de compras y código QR de auditoría.`)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar PDF Oficial</span>
                </button>
              </div>

              {/* Tabla de Insumos de la OC */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">CÓDIGO</th>
                      <th className="px-4 py-2.5 font-semibold">DESCRIPCIÓN</th>
                      <th className="px-4 py-2.5 font-semibold text-center">UNIDAD</th>
                      <th className="px-4 py-2.5 font-semibold text-right">CANTIDAD</th>
                      <th className="px-4 py-2.5 font-semibold text-right">PRECIO UNIT.</th>
                      <th className="px-4 py-2.5 font-semibold text-right">SUBTOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {ocSeleccionadaParaVer.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2.5 font-bold text-amber-500">{it.codigo}</td>
                        <td className="px-4 py-2.5 text-slate-900 dark:text-white">{it.descripcion}</td>
                        <td className="px-4 py-2.5 text-center text-slate-400">{it.unidad}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-900 dark:text-white tabular-nums">{it.cantidad}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums">${it.precioUnitario.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-900 dark:text-white tabular-nums">${it.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totales de la OC */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="text-[11px] text-slate-400 space-y-1">
                  <div>• Condición Comercial: <strong>{ocSeleccionadaParaVer.condicionPago}</strong></div>
                  <div>• Tiempo de Entrega: <strong>{ocSeleccionadaParaVer.fechaEntregaEstimada}</strong></div>
                  <div>• Procedimiento: <strong>3-Way Match obligatorio contra Acta de Bodega</strong></div>
                </div>

                <div className="w-full sm:w-64 space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal Materiales:</span>
                    <strong>${ocSeleccionadaParaVer.subtotal.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Flete Pesado:</span>
                    <strong>${ocSeleccionadaParaVer.flete.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">IVA (15% Ecuador):</span>
                    <strong>${ocSeleccionadaParaVer.iva15.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-slate-200 dark:border-slate-700 font-extrabold text-sm text-slate-900 dark:text-white">
                    <span>Total Orden:</span>
                    <span className="text-amber-500">${ocSeleccionadaParaVer.totalAPagar.toFixed(2)} USD</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* TRAZABILIDAD EN CADENA (BODEGA, CONTABILIDAD, TALENTO)          */}
          {/* --------------------------------------------------------------- */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white border border-slate-800 space-y-4 font-mono text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-sm text-emerald-400">
                Sincronización Inmediata con la Red de Agentes de Obra
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                  <Warehouse className="w-3.5 h-3.5" />
                  <span>Terminal de Bodega</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Las {ordenesGeneradas.length} Órdenes de Compra ya están en la tableta del Bodeguero en estado <em>"Pendiente de Recepción"</em> para cotejar cuando llegue la volqueta.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Contabilidad (3-Way Match)</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Creada la provisión del pasivo. Al ingresar el XML de la factura SRI, el agente validará automáticamente contra esta OC y el acta del bodeguero.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <HardHat className="w-3.5 h-3.5" />
                  <span>SARA Talento Humano</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Las cuadrillas requeridas para la fase ({requisicionActual.cuadrilla.length} categorías) fueron notificadas con antelación para asegurar personal SECAP/IESS en obra.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
