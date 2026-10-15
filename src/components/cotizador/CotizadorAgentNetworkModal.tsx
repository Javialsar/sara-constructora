'use client';

import React from 'react';
import { X, Sparkles, Zap, Building2, MapPin, Calculator, ShieldCheck, Check, ArrowRight } from 'lucide-react';
import AgentNetworkChoreography from '@/components/agents/AgentNetworkChoreography';
import { SaraCoPilotAdvisor } from '@/components/agents/SaraCoPilotAdvisor';

interface CotizadorAgentNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectData: {
    nombreProyecto: string;
    nombreCliente: string;
    areaM2: number;
    estructura: string;
    acabados: string;
    pisos: string;
    costoObra: number;
    totalHonorarios: number;
    costoTotalConIva: number;
  };
}

export default function CotizadorAgentNetworkModal({
  isOpen,
  onClose,
  projectData
}: CotizadorAgentNetworkModalProps) {
  if (!isOpen) return null;

  const tipologiaLabel = projectData.estructura === 'metalica' ? 'Estructura Metálica' : 'Residencial';
  const nombreDisplay = projectData.nombreProyecto?.trim() || projectData.nombreCliente?.trim() || 'Proyecto Cotizado';
  const costoTotal = projectData.costoTotalConIva || (projectData.costoObra + projectData.totalHonorarios) || 85000;
  const volumenDesalojo = Math.max(25, Math.round(projectData.areaM2 * 0.35));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/50 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 shrink-0">
              <Zap className="w-6 h-6 fill-current text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-white tracking-tight">
                  Red de Agentes Colectivos • Memoria Histórica SARA
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  8 Agentes en Vivo
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>Proyecto: <strong className="text-amber-300">{nombreDisplay}</strong></span>
                <span>•</span>
                <span>Área: <strong className="text-white">{projectData.areaM2} m²</strong></span>
                <span>•</span>
                <span>Estructura: <strong className="text-white capitalize">{projectData.estructura}</strong></span>
                <span>•</span>
                <span>Costo Calculado: <strong className="text-emerald-400 font-mono">${costoTotal.toLocaleString()} USD</strong></span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-white rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Banner Contextual con Datos Reales */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-300/60 dark:border-amber-700/40 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
              <span>
                Los 8 agentes están sincronizados con los datos ingresados en el cotizador paramétrico: 
                <strong> {projectData.areaM2} m²</strong> en <strong>{projectData.pisos} piso(s)</strong> con acabados <strong>{projectData.acabados}</strong>.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 font-bold text-amber-800 dark:text-amber-300 font-mono">
                Desalojo Estimado: {volumenDesalojo} m³
              </span>
            </div>
          </div>

          {/* Co-Piloto Asesor Interactivo y Generador de Exportables Oficiales */}
          <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
            <SaraCoPilotAdvisor
              proyectoId="cotizador-parametrico"
              nombreProyecto={nombreDisplay}
              ubicacion="Cuenca, Azuay"
              costoDirectoTotal={costoTotal}
              volumenDesalojoM3={volumenDesalojo}
            />
          </div>

          {/* Coreografía Agéntica con las 8 Tarjetas de Alto Contraste */}
          <div className="pt-2">
            <AgentNetworkChoreography
              initialContext={{
                nombre: nombreDisplay,
                provincia: 'Azuay',
                ciudad: 'Cuenca',
                areaM2: Number(projectData.areaM2) || 100,
                tipologia: tipologiaLabel as any,
                costoReferencial: costoTotal
              }}
              autoRun={true}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            La memoria colectiva ajusta rendimientos provinciales y protege contra la inflación de acero y cemento.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Cerrar y Volver a la Cotización</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
