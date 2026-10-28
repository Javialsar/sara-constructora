'use client';

import * as React from 'react';
import { 
  Users, UserCheck, Calendar, CheckCircle2, 
  ArrowRight, Sparkles, Phone, DollarSign, Building 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type LeadStage = 'prospecto' | 'visita' | 'precalificado' | 'cierre';

export interface CommercialLead {
  id: string;
  name: string;
  phone: string;
  interestProperty: string;
  budget: number;
  stage: LeadStage;
  bankScoring: 'BIESS Aprobado' | 'Banca Calificada' | 'En Análisis';
}

const INITIAL_LEADS: CommercialLead[] = [
  { id: 'l-1', name: 'Dr. Fernando Vaca', phone: '+593 99 123 4567', interestProperty: 'Penthouse Mirador Panorámico', budget: 250000, stage: 'precalificado', bankScoring: 'BIESS Aprobado' },
  { id: 'l-2', name: 'Arq. Gabriela Mora', phone: '+593 98 987 6543', interestProperty: 'Suite Ejecutiva Plaza', budget: 100000, stage: 'visita', bankScoring: 'Banca Calificada' },
  { id: 'l-3', name: 'Ing. Carlos Reyes', phone: '+593 99 333 8888', interestProperty: 'Villa Campestre Algarrobos', budget: 340000, stage: 'cierre', bankScoring: 'BIESS Aprobado' },
  { id: 'l-4', name: 'Econ. Sofía Luna', phone: '+593 99 444 2211', interestProperty: 'Penthouse Mirador Panorámico', budget: 240000, stage: 'prospecto', bankScoring: 'En Análisis' },
];

export function LeadFunnelKanban() {
  const [leads, setLeads] = React.useState<CommercialLead[]>(INITIAL_LEADS);
  const [celebrationMsg, setCelebrationMsg] = React.useState<string | null>(null);

  const stages: { id: LeadStage; title: string; color: string }[] = [
    { id: 'prospecto', title: '1. Prospecto Captado', color: 'border-slate-700 text-slate-400' },
    { id: 'visita', title: '2. Visita Agendada', color: 'border-blue-500/40 text-blue-400' },
    { id: 'precalificado', title: '3. Precalificación BIESS', color: 'border-teal-500/40 text-teal-400' },
    { id: 'cierre', title: '4. Cierre & Reserva', color: 'border-emerald-500/40 text-emerald-400' },
  ];

  const handleAdvanceLead = (leadId: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id !== leadId) return l;
      let nextStage: LeadStage = 'visita';
      if (l.stage === 'prospecto') nextStage = 'visita';
      else if (l.stage === 'visita') nextStage = 'precalificado';
      else if (l.stage === 'precalificado') {
        nextStage = 'cierre';
        setCelebrationMsg(`¡Excelente! Lead ${l.name} avanzado a Cierre y Reserva.`);
        setTimeout(() => setCelebrationMsg(null), 3500);
      }
      return { ...l, stage: nextStage };
    }));
  };

  return (
    <div className="w-full bg-slate-950 rounded-xl border border-slate-800 p-4 font-sans text-slate-100">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Funnel Comercial • Pipeline de Cierre de Leads
          </h4>
        </div>
        <span className="text-[11px] font-mono text-emerald-400">Total Leads Activos: {leads.length}</span>
      </div>

      {celebrationMsg && (
        <div className="my-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{celebrationMsg}</span>
        </div>
      )}

      {/* 4 Stage Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
        {stages.map((stg) => {
          const stageLeads = leads.filter(l => l.stage === stg.id);

          return (
            <div key={stg.id} className="bg-slate-900/60 rounded-xl border border-slate-800 p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold">
                  <span className={stg.color}>{stg.title}</span>
                  <span className="font-mono text-[10px] text-slate-400">({stageLeads.length})</span>
                </div>

                <div className="mt-3 space-y-2.5">
                  {stageLeads.map((l) => (
                    <div 
                      key={l.id} 
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition-all text-xs"
                    >
                      <div className="flex justify-between items-start">
                        <strong className="text-white line-clamp-1">{l.name}</strong>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                          {l.bankScoring}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{l.interestProperty}</p>
                      <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-emerald-400 font-bold">${l.budget.toLocaleString()}</span>
                        {l.stage !== 'cierre' && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceLead(l.id)}
                            className="inline-flex items-center gap-1 text-[10px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-1.5 py-0.5 rounded transition-colors"
                          >
                            <span>Avanzar</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
