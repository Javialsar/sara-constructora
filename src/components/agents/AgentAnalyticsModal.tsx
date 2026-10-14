'use client';

import React from 'react';
import { 
  X, 
  BarChart3, 
  TrendingUp, 
  Brain, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export interface AgentAnalyticsData {
  agentId: string;
  name: string;
  role: string;
  description: string;
  confidenceScore: number;
  sampleCount: number;
  latencyMs: number;
  lastTrained: string;
  metrics: Array<{
    label: string;
    value: string | number;
    trend?: string;
    trendPositive?: boolean;
    description: string;
  }>;
  learnedRules: Array<{
    rule: string;
    impact: string;
    confidence: number;
  }>;
  recommendations: string[];
}

interface AgentAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentData: AgentAnalyticsData | null;
}

export default function AgentAnalyticsModal({ isOpen, onClose, agentData }: AgentAnalyticsModalProps) {
  if (!isOpen || !agentData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente temático */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/40 border-b border-slate-800 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider mb-2">
              <Brain className="w-3.5 h-3.5 animate-pulse" />
              <span>Analítica Predictiva de Inteligencia Artificial</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{agentData.name}</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              {agentData.role} · {agentData.description}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Modal con Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Tarjetas Principales de Desempeño */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block text-[11px] mb-1">Nivel de Confianza</span>
              <strong className="text-emerald-400 text-base font-black">
                {(agentData.confidenceScore * 100).toFixed(1)}%
              </strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">Calibrado con datos reales</span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block text-[11px] mb-1">Proyectos Evaluados</span>
              <strong className="text-amber-400 text-base font-black">
                {agentData.sampleCount} obras
              </strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">Historial en Ecuador</span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block text-[11px] mb-1">Latencia de Inferencia</span>
              <strong className="text-purple-400 text-base font-black font-mono">
                {agentData.latencyMs} ms
              </strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">Cómputo en Edge / Worker</span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block text-[11px] mb-1">Última Auto-Mejora</span>
              <strong className="text-cyan-400 text-xs font-bold font-mono">
                {agentData.lastTrained}
              </strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">Ciclo post-cierre</span>
            </div>
          </div>

          {/* Desglose de Métricas Clave de Negocio */}
          <div>
            <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>Indicadores de Precisión & Eficiencia</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {agentData.metrics.map((m, idx) => (
                <div key={idx} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/90 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">{m.label}</span>
                    {m.trend && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.trendPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {m.trend}
                      </span>
                    )}
                  </div>
                  <strong className="text-white text-base font-black block">{m.value}</strong>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{m.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Heurísticas y Reglas Aprendidas por el Agente */}
          <div>
            <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Heurísticas Evolutivas en Knowledge Base</span>
            </h3>
            <div className="space-y-2">
              {agentData.learnedRules.map((rule, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between gap-3">
                  <div>
                    <strong className="text-white block text-xs mb-0.5">{rule.rule}</strong>
                    <span className="text-[11px] text-slate-400">{rule.impact}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md shrink-0 border border-purple-500/20">
                    Conf: {(rule.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recomendaciones Estratégicas para el Cliente */}
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-2">
            <h4 className="font-bold text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Recomendaciones Estratégicas Directas al Cliente:</span>
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300 text-[11px]">
              {agentData.recommendations.map((rec, idx) => (
                <li key={idx} className="leading-relaxed">{rec}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Validado bajo el protocolo multi-agente de Grupo SARA</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
