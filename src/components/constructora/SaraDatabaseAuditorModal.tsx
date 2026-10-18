'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Server, 
  HardDrive, 
  X,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SaraDatabaseAuditorService, AuditTableStatus, AuditLogEntry } from '@/lib/services/saraDatabaseAuditorService';

export function SaraDatabaseAuditorModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [tablas, setTablas] = useState<AuditTableStatus[]>([]);
  const [tasa, setTasa] = useState(100);
  const [mensajes, setMensajes] = useState<string[]>([]);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'tablas' | 'logs'>('tablas');

  useEffect(() => {
    if (isOpen) {
      ejecutarAuditoria();
    }
  }, [isOpen]);

  const ejecutarAuditoria = async () => {
    setLoading(true);
    const resultado = await SaraDatabaseAuditorService.verificarPersistenciaEcosistema();
    setTablas(resultado.tablas);
    setTasa(resultado.tasaPersistencia);
    setMensajes(resultado.mensajesAgente);
    setLogs(SaraDatabaseAuditorService.getLogs());
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto p-6 sm:p-7 space-y-5">
        
        {/* Cabecera del Agente */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <Database size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  Advanced Database Sentinel Agent
                </span>
                <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                  <Activity size={12} className="text-emerald-500 animate-pulse" />
                  <span>En Línea</span>
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                Auditor de Persistencia & Base de Datos Supabase
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verifica que el 100% de los datos ingresados en todas las pantallas del ecosistema se guarden sin pérdidas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={ejecutarAuditoria}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-emerald-500' : ''} />
              <span>Verificar Ahora</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Métricas Globales del Agente */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-center sm:text-left">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-emerald-700 dark:text-emerald-300 font-bold mb-1">
              <span>Integridad de Persistencia</span>
              <CheckCircle2 size={16} />
            </div>
            <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {tasa}%
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5 block">
              Todos los módulos sincronizados
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center sm:text-left">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 font-bold mb-1">
              <span>Capa Principal</span>
              <Server size={16} className="text-amber-500" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              Supabase PostgreSQL
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Esquemas relacionales activos
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center sm:text-left">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 font-bold mb-1">
              <span>Capa de Respaldo Resiliente</span>
              <HardDrive size={16} className="text-blue-500" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              Offline-First Cache
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Tolerancia a caídas de red
            </span>
          </div>
        </div>

        {/* Tabs: Tablas Auditadas vs Bitácora de Transacciones */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('tablas')}
            className={`pb-2 px-3 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'tablas'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Tablas & Módulos Monitoreados ({tablas.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-2 px-3 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Bitácora de Transacciones Recientes ({logs.length})
          </button>
        </div>

        {/* Vista: Tablas Monitoreadas */}
        {activeTab === 'tablas' && (
          <div className="space-y-3">
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl">
              {tablas.map((t, i) => (
                <div key={i} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900 dark:text-white text-xs">{t.modulo}</strong>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        tabla: {t.tablaSupabase}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.detalles}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900 dark:text-white block">
                        {t.registrosRemotos} registros
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Última sync: {t.ultimaSincronizacion}
                      </span>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 size={11} />
                      <span>{t.estado}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vista: Bitácora de Transacciones */}
        {activeTab === 'logs' && (
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1 text-xs">
            {logs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      {log.operacion}
                    </span>
                    <strong className="text-slate-900 dark:text-white text-xs">{log.modulo}</strong>
                    <span className="text-slate-400 font-mono text-[10px]">• Ref: {log.entidadId}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">{log.descripcion}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock size={10} /> {log.timestamp}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block">
                    {log.estadoPersistencia}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pie del Modal con Mensajes del Agente */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            {mensajes.map((m, i) => (
              <div key={i} className="text-[11px] font-mono text-slate-600 dark:text-slate-300">
                {m}
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-md cursor-pointer shrink-0 self-end sm:self-center"
          >
            Entendido & Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
