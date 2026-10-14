'use client';

import React, { useState, useEffect } from 'react';
import {
  SaraAdvisoryLog,
  CuadroComparativoDocumentData,
  ReporteConsolidadoDocumentData,
  SaraDecisionTecnico
} from '@/lib/agents/advisory-types';
import { AdvisoryDocumentModal } from './AdvisoryDocumentModal';
import {
  Sparkles,
  CheckCircle,
  XCircle,
  Download,
  FileSpreadsheet,
  Truck,
  TrendingUp,
  DollarSign,
  Send,
  Bot,
  User,
  ShieldCheck,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';

interface SaraCoPilotAdvisorProps {
  proyectoId?: string;
  nombreProyecto?: string;
  ubicacion?: string;
  costoDirectoTotal?: number;
  volumenDesalojoM3?: number;
  onAdvisoryUpdated?: (ahorroTotalUSD: number) => void;
  className?: string;
}

export const SaraCoPilotAdvisor: React.FC<SaraCoPilotAdvisorProps> = ({
  proyectoId = 'default-project-id',
  nombreProyecto = 'Proyecto Constructivo SARA',
  ubicacion = 'Cuenca, Azuay',
  costoDirectoTotal = 45200,
  volumenDesalojoM3 = 45,
  onAdvisoryUpdated,
  className = ''
}) => {
  const [logs, setLogs] = useState<SaraAdvisoryLog[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

  // Estados del Chat Interactivo
  const [chatInput, setChatInput] = useState<string>('');
  const [enviandoMensaje, setEnviandoMensaje] = useState<boolean>(false);
  const [mensajesChat, setMensajesChat] = useState<
    Array<{ remitente: 'usuario' | 'agente'; texto: string; agenteId?: string; ahorroUSD?: number }>
  >([]);

  // Estados de Documentos Exportables
  const [modalDocumentoAbierto, setModalDocumentoAbierto] = useState<boolean>(false);
  const [tipoDocumentoActivo, setTipoDocumentoActivo] = useState<
    'cuadro_comparativo_proveedores' | 'reporte_consolidado_insumos_logistica'
  >('cuadro_comparativo_proveedores');
  const [dataCuadro, setDataCuadro] = useState<CuadroComparativoDocumentData | null>(null);
  const [dataReporte, setDataReporte] = useState<ReporteConsolidadoDocumentData | null>(null);
  const [generandoDoc, setGenerandoDoc] = useState<boolean>(false);

  // Cargar asesorías iniciales
  useEffect(() => {
    cargarAsesorias();
  }, [proyectoId, nombreProyecto]);

  const cargarAsesorias = async () => {
    setCargando(true);
    try {
      const res = await fetch(`/api/agents/advisory?proyectoId=${encodeURIComponent(proyectoId)}`);
      const data = await res.json();
      if (data.success && data.logs) {
        setLogs(data.logs);
        const ahorro = data.resumen?.ahorroAceptadoUSD || 0;
        if (onAdvisoryUpdated) onAdvisoryUpdated(ahorro);
      }
    } catch (err) {
      console.warn('Error cargando asesorías:', err);
    } finally {
      setCargando(false);
    }
  };

  const handleDecision = async (logId: string, decision: SaraDecisionTecnico) => {
    setProcesandoId(logId);
    try {
      const res = await fetch('/api/agents/advisory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId, decision, proyectoId })
      });
      const data = await res.json();
      if (data.success && data.log) {
        setLogs((prev) =>
          prev.map((item) => (item.id === logId ? { ...item, decision_tecnico: decision } : item))
        );

        // Recalcular ahorro aceptado
        const nuevoAhorro = logs.reduce((acc, curr) => {
          if (curr.id === logId) {
            return decision === 'aceptada' ? acc + curr.ahorro_estimado_usd : acc;
          }
          return curr.decision_tecnico === 'aceptada' ? acc + curr.ahorro_estimado_usd : acc;
        }, 0);

        if (onAdvisoryUpdated) onAdvisoryUpdated(nuevoAhorro);
      }
    } catch (error) {
      console.error('Error actualizando decisión:', error);
    } finally {
      setProcesandoId(null);
    }
  };

  const handleEnviarConsulta = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || enviandoMensaje) return;

    const textoUsuario = chatInput.trim();
    setChatInput('');
    setMensajesChat((prev) => [...prev, { remitente: 'usuario', texto: textoUsuario }]);
    setEnviandoMensaje(true);

    try {
      const res = await fetch('/api/agents/advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: textoUsuario,
          contexto: {
            proyectoId,
            nombreProyecto,
            ubicacion,
            costoDirectoTotal,
            volumenDesalojoM3
          }
        })
      });
      const data = await res.json();
      if (data.success && data.respuesta) {
        setMensajesChat((prev) => [
          ...prev,
          {
            remitente: 'agente',
            texto: data.respuesta,
            agenteId: data.agentId,
            ahorroUSD: data.ahorroSugeridoUSD
          }
        ]);
      }
    } catch (err) {
      console.error('Error al consultar asesor:', err);
      setMensajesChat((prev) => [
        ...prev,
        {
          remitente: 'agente',
          texto:
            'Ingeniero, le confirmo que el equipo técnico está sincronizando las mejores opciones de crédito y transporte pesado para esta zona.'
        }
      ]);
    } finally {
      setEnviandoMensaje(false);
    }
  };

  const abrirDocumento = async (
    tipo: 'cuadro_comparativo_proveedores' | 'reporte_consolidado_insumos_logistica'
  ) => {
    setTipoDocumentoActivo(tipo);
    setGenerandoDoc(true);

    try {
      const res = await fetch('/api/agents/advisory/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoDocumento: tipo,
          proyectoId,
          nombreProyecto,
          ubicacion
        })
      });

      const data = await res.json();
      if (data.success && data.documento) {
        if (tipo === 'cuadro_comparativo_proveedores') {
          setDataCuadro(data.documento);
        } else {
          setDataReporte(data.documento);
        }
        setModalDocumentoAbierto(true);
      }
    } catch (e) {
      console.error('Error compilando documento:', e);
    } finally {
      setGenerandoDoc(false);
    }
  };

  const totalAhorroAceptado = logs
    .filter((l) => l.decision_tecnico === 'aceptada')
    .reduce((acc, curr) => acc + (curr.ahorro_estimado_usd || 0), 0);

  const totalAhorroPotencial = logs.reduce((acc, curr) => acc + (curr.ahorro_estimado_usd || 0), 0);

  return (
    <div
      className={`bg-slate-900 text-slate-100 rounded-2xl border border-blue-500/30 p-5 sm:p-6 shadow-xl ${className}`}
    >
      {/* Cabecera del Co-Piloto */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 flex-shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-1">
              <ShieldCheck className="w-3 h-3" />
              CONSULTORÍA SENIOR EN VIVO · GRUPO SARA
            </div>
            <h3 className="text-lg font-black text-white tracking-tight">
              Co-Piloto Asesor de Negocio & Compras
            </h3>
            <p className="text-xs text-slate-400">
              Evaluación de líneas de crédito, logística vial integrada y plusvalía en tiempo real para{' '}
              <span className="text-slate-200 font-medium">{nombreProyecto}</span>.
            </p>
          </div>
        </div>

        {/* Contador de Impacto Financiero en USD */}
        <div className="flex items-center gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Ahorro Aceptado
            </div>
            <div className="text-xl font-black text-emerald-400 flex items-center gap-1">
              <DollarSign className="w-5 h-5 -mr-1" />
              {totalAhorroAceptado.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-500">
              De ${totalAhorroPotencial.toLocaleString()} USD potencial
            </div>
          </div>
          <button
            onClick={cargarAsesorias}
            title="Recalibrar sugerencias"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Botones de Generación de Exportables Obligatorios */}
      <div className="mt-4 pt-1 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <span>Exportables Oficiales para el Director de Obra:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => abrirDocumento('cuadro_comparativo_proveedores')}
            disabled={generandoDoc}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white shadow-sm transition border border-blue-500/30"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            1. Cuadro Comparativo Proveedores (PDF)
          </button>
          <button
            onClick={() => abrirDocumento('reporte_consolidado_insumos_logistica')}
            disabled={generandoDoc}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white shadow-sm transition border border-emerald-500/30"
          >
            <Truck className="w-3.5 h-3.5" />
            2. Reporte Consolidado Logística (PDF)
          </button>
        </div>
      </div>

      {/* Feed de Recomendaciones Proactivas de los Agentes */}
      <div className="mt-5 space-y-3.5">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <span>Directrices Estratégicas Activas ({logs.length})</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        </div>

        {cargando ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
            Sincronizando agentes de APU, Marketplace, Fletes e Inmobiliaria...
          </div>
        ) : (
          logs.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                item.decision_tecnico === 'aceptada'
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : item.decision_tecnico === 'rechazada'
                  ? 'bg-slate-900/50 border-slate-800 opacity-60'
                  : 'bg-slate-950/60 border-blue-500/30 hover:border-blue-400/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {item.agent_id}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {item.tipo_asesoria === 'compras_suministros'
                      ? 'Compras & Crédito'
                      : item.tipo_asesoria === 'coordinacion_carga'
                      ? 'Logística Vial & Carga'
                      : 'Rentabilidad & Campamentos'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-0.5">
                    +${item.ahorro_estimado_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </span>
                  <span className="text-[10px] text-slate-500">
                    ({item.decision_tecnico.toUpperCase()})
                  </span>
                </div>
              </div>

              {/* Mensaje Contextual con Terminología Ecuatoriana */}
              <p className="mt-3 text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                "{item.mensaje_sugerencia}"
              </p>

              {/* Botones de Decisión del Técnico */}
              <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

                <div className="flex items-center gap-2">
                  {item.decision_tecnico === 'pendiente' ? (
                    <>
                      <button
                        onClick={() => handleDecision(item.id, 'aceptada')}
                        disabled={procesandoId === item.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Aceptar Recomendación
                      </button>
                      <button
                        onClick={() => handleDecision(item.id, 'rechazada')}
                        disabled={procesandoId === item.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Descartar
                      </button>
                    </>
                  ) : item.decision_tecnico === 'aceptada' ? (
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                      Recomendación Aceptada e Integrada al Presupuesto
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <XCircle className="w-4 h-4" />
                      Descartada por el Técnico
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Historial de Diálogo del Chat con el Técnico */}
      {mensajesChat.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Interacción en Vivo con el Consultor Senior
          </div>
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {mensajesChat.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl text-xs sm:text-sm leading-relaxed flex gap-2.5 ${
                  m.remitente === 'usuario'
                    ? 'bg-blue-900/30 border border-blue-500/20 text-blue-100 ml-4'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 mr-4'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {m.remitente === 'usuario' ? (
                    <User className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Bot className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  {m.agenteId && (
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      {m.agenteId}
                    </div>
                  )}
                  <div>{m.texto}</div>
                  {m.ahorroUSD && (
                    <div className="text-[11px] font-semibold text-emerald-400 pt-1">
                      Ahorro estimado en esta optimización: +${m.ahorroUSD.toFixed(2)} USD
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barra de Entrada de Chat Directo con el Consultor Senior */}
      <form onSubmit={handleEnviarConsulta} className="mt-5 pt-4 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Consulte al Consultor Senior (ej: '¿Cómo optimizo el acero?', '¿Qué flete pesado conviene?', '¿Cómo maximizo el ROI?')..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
        />
        <button
          type="submit"
          disabled={enviandoMensaje || !chatInput.trim()}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
        >
          {enviandoMensaje ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Consultar</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Modal de Previsualización e Impresión de Documentos */}
      <AdvisoryDocumentModal
        isOpen={modalDocumentoAbierto}
        onClose={() => setModalDocumentoAbierto(false)}
        tipoDocumento={tipoDocumentoActivo}
        dataCuadro={dataCuadro}
        dataReporte={dataReporte}
      />
    </div>
  );
};
