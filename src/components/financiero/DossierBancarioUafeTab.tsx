'use client';

import React, { useState, useEffect } from 'react';
import { 
  Award, 
  ShieldCheck, 
  FileText, 
  Building2, 
  CheckCircle2, 
  Download, 
  Printer, 
  Lock, 
  ExternalLink, 
  DollarSign, 
  AlertTriangle,
  Scale,
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react';
import { 
  SaraDossierBancarioService, 
  DossierBancarioProyecto 
} from '@/lib/services/saraDossierBancarioService';

interface DossierTabProps {
  onNotify: (type: 'success' | 'error', message: string) => void;
}

export default function DossierBancarioUafeTab({ onNotify }: DossierTabProps) {
  const [dossieres, setDossieres] = useState<DossierBancarioProyecto[]>([]);
  const [selectedDossier, setSelectedDossier] = useState<DossierBancarioProyecto | null>(null);
  const [showEmisionModal, setShowEmisionModal] = useState(false);

  const [formEmision, setFormEmision] = useState({
    proyectoNombre: 'Conjunto Residencial Las Acacias',
    constructora: 'GRUPO SARA CONSTRUCTORA S.A.',
    ruc: '1191782341001',
    presupuestoUSD: 380000
  });

  useEffect(() => {
    const cargar = () => {
      const data = SaraDossierBancarioService.getDossieres();
      setDossieres(data);
      if (data.length > 0 && !selectedDossier) {
        setSelectedDossier(data[0]);
      }
    };
    cargar();
    window.addEventListener('sara_dossieres_updated', cargar);
    return () => window.removeEventListener('sara_dossieres_updated', cargar);
  }, []);

  const handleEmitirNuevo = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const nuevo = SaraDossierBancarioService.emitirCertificado(
        formEmision.proyectoNombre,
        formEmision.constructora,
        formEmision.ruc,
        formEmision.presupuestoUSD
      );
      setSelectedDossier(nuevo);
      setShowEmisionModal(false);
      onNotify('success', `¡Dossier Bancario ${nuevo.idExpediente} emitido con éxito con firma criptográfica SARA! Fee de emisión: $250.00 USD.`);
    } catch (err: any) {
      onNotify('error', `Error al emitir expediente: ${err.message}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!selectedDossier && dossieres.length > 0) {
    setSelectedDossier(dossieres[0]);
  }

  const dos = selectedDossier || dossieres[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ==================================================================== */}
      {/* HEADER Y PROPUESTA DE VALOR FINANCIERA */}
      {/* ==================================================================== */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-teal-950/60 border border-blue-500/30 shadow-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Award className="w-3.5 h-3.5 text-blue-400" />
            <span>Certificación Oficial para Créditos Constructores & BIESS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Dossier Fiduciario, Fiscal SRI & Cumplimiento UAFE
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Genera en segundos el expediente de auditoría fiduciaria y antilavado exigido por bancos (Pichincha, Guayaquil, BIESS) y mutualistas. Reduce el tiempo de aprobación crediticia de meses a semanas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowEmisionModal(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-900/30 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Sparkles size={16} />
            <span>Emitir Nueva Certificación ($250 USD)</span>
          </button>
        </div>
      </div>

      {dos && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Selector de Expedientes Lateral */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-2">
              Expedientes Auditados ({dossieres.length})
            </span>
            <div className="space-y-2">
              {dossieres.map((d) => (
                <div
                  key={d.idExpediente}
                  onClick={() => setSelectedDossier(d)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    dos.idExpediente === d.idExpediente
                      ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                    <span>{d.idExpediente}</span>
                    <span className="text-emerald-400 font-bold">{d.viabilidadFinanciera.calificacionBancariaSugerida}</span>
                  </div>
                  <p className="font-bold text-xs text-white leading-snug">{d.nombreProyecto}</p>
                  <p className="text-[11px] text-slate-400 mt-1 truncate">{d.razonSocialConstructora}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Vista Principal del Dossier Auditado */}
          <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            
            {/* Header del Expediente */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    CERTIFICADO VIGENTE
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: <strong>{dos.idExpediente}</strong>
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {dos.nombreProyecto}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Promotor / Titular: <strong className="text-slate-200">{dos.razonSocialConstructora}</strong> (RUC: {dos.rucConstructora})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer size={14} /> Imprimir / PDF
                </button>
              </div>
            </div>

            {/* Los 4 Pilares de la Auditoría */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* 1. Pilar Fideicomiso Escrow */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-teal-400 flex items-center gap-1.5">
                    <ShieldCheck size={16} /> 1. Fideicomiso Escrow
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    {dos.fideicomiso.porcentajeEjecucionFisica}% Físico
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                  <div className="flex justify-between">
                    <span>Monto Presupuestado:</span>
                    <span className="text-white font-bold">${dos.fideicomiso.montoTotalPresupuestadoUSD.toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fondos Liberados por Hito:</span>
                    <span className="text-emerald-400 font-bold">${dos.fideicomiso.fondosLiberadosPorHitosUSD.toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>En Custodia de Garantía:</span>
                    <span className="text-amber-400 font-bold">${dos.fideicomiso.fondosInmovilizadosEscrowUSD.toLocaleString()} USD</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  Fiscalizador Colegiado: <strong className="text-slate-200">{dos.fideicomiso.hitosValidados[0]?.fiscalizador || 'Acreditado'}</strong>
                </div>
              </div>

              {/* 2. Pilar Auditoría Tributaria SRI */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-blue-400 flex items-center gap-1.5">
                    <Scale size={16} /> 2. Three-Way Match & SRI
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {dos.auditoriaTributaria.porcentajeConformidadMatch}% Match
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                  <div className="flex justify-between">
                    <span>Facturas SRI Validadas:</span>
                    <span className="text-white font-bold">{dos.auditoriaTributaria.totalComprobantesSRIValidados} Comprobantes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monto Total Auditado:</span>
                    <span className="text-white font-bold">${dos.auditoriaTributaria.montoFacturadoAuditadoUSD.toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retenciones Cód 312 / 344:</span>
                    <span className="text-purple-400 font-bold">
                      ${(dos.auditoriaTributaria.retencionesEfectuadas.codigo312MaterialesUSD + dos.auditoriaTributaria.retencionesEfectuadas.codigo344ObraCivilUSD).toLocaleString()} USD
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 size={13} /> Firma XAdES-BES & Módulo 11 verificados sin glosas
                </div>
              </div>

              {/* 3. Pilar Antilavado UAFE */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
                    <Lock size={16} /> 3. Protocolo Antilavado UAFE
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Riesgo {dos.cumplimientoUAFE.nivelRiesgoLA_FT}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                  <div className="flex justify-between">
                    <span>Umbral RESU (≥ $10k):</span>
                    <span className="text-white font-bold">Aplica ({dos.cumplimientoUAFE.totalTransaccionesRESU} ops)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Origen de Fondos:</span>
                    <span className="text-emerald-400 font-bold">Declaración Lícita OK</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Código Reporte UAFE:</span>
                    <span className="text-slate-400 text-[10px]">{dos.cumplimientoUAFE.codigoReporteUAFE}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  Conformidad Ley Orgánica de Prevención de Lavado de Activos
                </div>
              </div>

              {/* 4. Pilar Viabilidad Bancaria & CFCR */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-purple-400 flex items-center gap-1.5">
                    <Building2 size={16} /> 4. Calificación Bancaria
                  </span>
                  <span className="text-base font-mono font-black text-amber-400">
                    {dos.viabilidadFinanciera.calificacionBancariaSugerida}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                  <div className="flex justify-between">
                    <span>Scoring Crediticio:</span>
                    <span className="text-white font-bold">{dos.viabilidadFinanciera.scoringCrediticioInterno} / 100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cobertura CFCR (30d):</span>
                    <span className="text-emerald-400 font-bold">{dos.viabilidadFinanciera.cfcr30Dias}x (&gt;1.20)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Línea Crédito Sugerida:</span>
                    <span className="text-purple-300 font-bold">${dos.viabilidadFinanciera.montoCreditoPuenteRecomendadoUSD.toLocaleString()} USD</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  Apto para Crédito Constructor BIESS Premier / Banca Privada
                </div>
              </div>

            </div>

            {/* Sello y Firma Criptográfica */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-500 text-[10px] block">Firma Criptográfica SHA-256 (Inviolabilidad Fiduciaria):</span>
                <span className="text-slate-300 text-[10px] break-all">{dos.firmaDigitalSARA}</span>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-emerald-400 text-[10px] font-bold block">✓ AUDITORÍA SARA APROBADA</span>
                <span className="text-slate-500 text-[10px]">Emisión: {dos.fechaEmisionUTC.split('T')[0]}</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: EMITIR NUEVO DOSSIER CERTIFICADO */}
      {/* ==================================================================== */}
      {showEmisionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="text-blue-400" size={20} />
                Emisión de Dossier Fiduciario Bancario
              </h3>
              <button onClick={() => setShowEmisionModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEmitirNuevo} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-blue-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles size={14} className="text-blue-300" />
                  Tarifa de Certificación Oficial SARA-PAGOS: $250.00 USD
                </p>
                <p className="text-[11px] text-blue-300/80">
                  Incluye validación Three-Way Match, cruce con facturas del SRI, declaración de origen lícito UAFE y análisis de estrés de liquidez para entrega directa a la entidad bancaria.
                </p>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Nombre del Proyecto o Edificación *</label>
                <input
                  type="text"
                  required
                  value={formEmision.proyectoNombre}
                  onChange={(e) => setFormEmision({ ...formEmision, proyectoNombre: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Razón Social Constructora *</label>
                  <input
                    type="text"
                    required
                    value={formEmision.constructora}
                    onChange={(e) => setFormEmision({ ...formEmision, constructora: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">RUC Titular *</label>
                  <input
                    type="text"
                    required
                    value={formEmision.ruc}
                    onChange={(e) => setFormEmision({ ...formEmision, ruc: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Presupuesto Contractual de Obra (USD) *</label>
                <input
                  type="number"
                  min={10000}
                  step={1000}
                  required
                  value={formEmision.presupuestoUSD}
                  onChange={(e) => setFormEmision({ ...formEmision, presupuestoUSD: Number(e.target.value) || 10000 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEmisionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Award size={14} />
                  <span>Emitir Certificación Oficial</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
