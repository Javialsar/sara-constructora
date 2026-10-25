'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Building2, 
  AlertCircle,
  HelpCircle,
  Check,
  X
} from 'lucide-react';
import { 
  SaraFactoringService, 
  SolicitudFactoring 
} from '@/lib/services/saraFactoringService';

interface FactoringTabProps {
  onNotify: (type: 'success' | 'error', message: string) => void;
}

export default function FactoringProntoPagoTab({ onNotify }: FactoringTabProps) {
  const [solicitudes, setSolicitudes] = useState<SolicitudFactoring[]>([]);
  const [metricas, setMetricas] = useState(() => SaraFactoringService.getMetricasCartera());

  // Estado del Simulador
  const [montoFactura, setMontoFactura] = useState<number>(35000);
  const [plazoDias, setPlazoDias] = useState<number>(30);
  const [tipoBeneficiario, setTipoBeneficiario] = useState<SolicitudFactoring['tipoBeneficiario']>('CONTRATISTA_OBRA');

  // Estado de Modal de Solicitud
  const [showSolicitudModal, setShowSolicitudModal] = useState(false);
  const [formSolicitud, setFormSolicitud] = useState({
    codigoFactura: '',
    razonSocialEmisor: 'CONSTRUCTORA SARA ASOCIADOS S.A.S.',
    rucEmisor: '1191782341001',
    empresaDeudora: 'MINISTERIO DE TRANSPORTE Y OBRAS PÚBLICAS (MTOP)',
    obraDestino: 'Pavimentación Vía Interoceánica Tramo 4',
    banco: 'Banco Pichincha',
    tipoCuenta: 'Corriente' as const,
    numeroCuenta: '2100847291',
    titular: 'Constructora Sara Asociados'
  });

  const [simulacion, setSimulacion] = useState(() => 
    SaraFactoringService.simularFactoring(35000, 30, 'CONTRATISTA_OBRA')
  );

  useEffect(() => {
    const cargar = () => {
      setSolicitudes(SaraFactoringService.getSolicitudes());
      setMetricas(SaraFactoringService.getMetricasCartera());
    };
    cargar();
    window.addEventListener('sara_factoring_updated', cargar);
    return () => window.removeEventListener('sara_factoring_updated', cargar);
  }, []);

  // Recalcular simulación en tiempo real
  useEffect(() => {
    const val = Number(montoFactura) || 1000;
    setSimulacion(SaraFactoringService.simularFactoring(val, plazoDias, tipoBeneficiario));
  }, [montoFactura, plazoDias, tipoBeneficiario]);

  const handleCrearSolicitud = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSolicitud.codigoFactura.trim()) {
      onNotify('error', 'Por favor ingresa el número de factura o planilla aprobada.');
      return;
    }

    try {
      SaraFactoringService.solicitarFactoring({
        codigoFactura: formSolicitud.codigoFactura,
        razonSocialEmisor: formSolicitud.razonSocialEmisor,
        rucEmisor: formSolicitud.rucEmisor,
        tipoBeneficiario,
        empresaDeudora: formSolicitud.empresaDeudora,
        obraDestino: formSolicitud.obraDestino,
        montoNominalUSD: simulacion.montoNominalUSD,
        plazoDiasAnticipo: simulacion.plazoDias,
        tasaDescuentoMensual: simulacion.tasaMensual,
        descuentoFinancieroUSD: simulacion.descuentoFinancieroUSD,
        comisionServicioSaraUSD: simulacion.comisionSaraUSD,
        montoNetoDesembolsoUSD: simulacion.montoNetoDesembolsoUSD,
        cuentaBancariaDestino: {
          banco: formSolicitud.banco,
          tipoCuenta: formSolicitud.tipoCuenta,
          numeroCuenta: formSolicitud.numeroCuenta,
          titular: formSolicitud.titular
        },
        observaciones: 'Solicitud ingresada vía Portal Financiero con verificación Three-Way Match.'
      });

      setShowSolicitudModal(false);
      onNotify('success', `¡Solicitud de Factoring registrada! Se desembolsará $${simulacion.montoNetoDesembolsoUSD.toLocaleString()} USD en su cuenta en 24h hábiles.`);
    } catch (err: any) {
      onNotify('error', `Error al procesar factoring: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ==================================================================== */}
      {/* BANNER PRINCIPAL Y KPIS DE MONETIZACIÓN */}
      {/* ==================================================================== */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/60 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>SARA Factoring & Pronto Pago Digital • Desembolso en 24 Horas</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Anticipo de Liquidez para Planillas y Facturas de Construcción
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              No esperes 45 o 60 días para cobrar tus planillas de obra civil o facturas de materiales. Descuenta tus cuentas por cobrar autorizadas con tasas reguladas por el BCE y fondeo fiduciario inmediato.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowSolicitudModal(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <Zap size={16} className="fill-slate-950" />
              <span>Solicitar Anticipo en 24h</span>
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800 font-mono">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-sans block">Cupo Disponible Global</span>
            <span className="text-xl sm:text-2xl font-black text-white">$500,000.00</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">● Fideicomiso Activo</span>
          </div>
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-sans block">Volumen Financiado</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400">${metricas.volumenTotalFinanciadoUSD.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{metricas.operacionesActivas} operaciones activas</span>
          </div>
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-sans block">Liquidez Desembolsada</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400">${metricas.liquidezDesembolsadaUSD.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-300 block mt-0.5">Vía SPI Banco Central</span>
          </div>
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-sans block">Ahorro Promedio en Cobro</span>
            <span className="text-xl sm:text-2xl font-black text-purple-400">{metricas.diasAhorroPromedio} Días</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Capital de trabajo inmediato</span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SIMULADOR INTERACTIVO DE FACTORING */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Parámetros de Simulación */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="text-amber-400" size={20} />
              Simulador de Descuento & Pronto Pago
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Tasa Mensual: <strong>{simulacion.tasaMensual}%</strong> (TEA {simulacion.tasaEfectivaAnualizada}%)
            </span>
          </div>

          <div className="space-y-4">
            {/* Monto de la Factura */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                <span>Monto Nominal de la Factura / Planilla (USD)</span>
                <span className="text-amber-400 font-mono">${montoFactura.toLocaleString()} USD</span>
              </div>
              <input
                type="number"
                min={1000}
                max={500000}
                step={500}
                value={montoFactura}
                onChange={(e) => setMontoFactura(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-lg font-mono font-bold text-white outline-none focus:border-amber-400"
              />
            </div>

            {/* Selector de Plazo en Días */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Plazo Estimado para el Cobro Original
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 45, 60].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setPlazoDias(d)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      plazoDias === d
                        ? 'bg-amber-500 border-amber-400 text-slate-950 font-black shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {d} Días {d === 30 ? '(1 mes)' : d === 60 ? '(2 meses)' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo de Beneficiario */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Categoría del Solicitante en el Ecosistema SARA
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'CONTRATISTA_OBRA', label: 'Contratista de Obra', desc: 'Planillas aprobadas (1.80%)' },
                  { id: 'PROVEEDOR_MATERIALES', label: 'Proveedor Materiales', desc: 'Three-Way Match (1.70%)' },
                  { id: 'TRANSPORTISTA_FLETES', label: 'Transporte Pesado', desc: 'Geocerca GPS (2.00%)' }
                ].map((tipo) => (
                  <div
                    key={tipo.id}
                    onClick={() => setTipoBeneficiario(tipo.id as any)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      tipoBeneficiario === tipo.id
                        ? 'bg-amber-500/10 border-amber-400 text-amber-200 ring-1 ring-amber-400/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-white block">{tipo.label}</span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">{tipo.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta de Liquidación de Desembolso */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Desglose de Liquidación</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Aprobación Inmediata
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Valor Nominal Factura:</span>
                <span className="font-bold text-white">${simulacion.montoNominalUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Descuento Financiero ({simulacion.plazoDias}d al {simulacion.tasaMensual}%/mes):</span>
                <span className="text-rose-400 font-bold">-${simulacion.descuentoFinancieroUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Fee Tecnológico de Originación (0.5%):</span>
                <span className="text-rose-400 font-bold">-${simulacion.comisionSaraUSD.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-slate-800 mt-2">
                <span className="text-[11px] font-sans font-bold text-slate-400 block mb-1">
                  Monto Neto a Recibir en tu Cuenta (24h):
                </span>
                <div className="text-3xl font-black text-emerald-400">
                  ${simulacion.montoNetoDesembolsoUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-sm font-sans text-slate-400 font-normal ml-1">USD</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                <ShieldCheck size={14} className="text-amber-400" />
                <span>Garantía de Cesión Notificada</span>
              </div>
              <p>
                La empresa deudora cancelará la totalidad de la factura directamente a la cuenta fiduciaria de GRUPO SARA al cumplirse los {simulacion.plazoDias} días.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSolicitudModal(true)}
            className="w-full mt-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Zap size={16} className="fill-slate-950" />
            <span>Confirmar y Desembolsar en 24h</span>
          </button>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* TABLA DE OPERACIONES Y TRAZABILIDAD */}
      {/* ==================================================================== */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="text-purple-400" size={18} />
            Historial de Facturas y Planillas Anticipadas
          </h3>
          <span className="text-xs text-slate-400">Total: {solicitudes.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">ID / Factura</th>
                <th className="p-3">Emisor / Beneficiario</th>
                <th className="p-3">Empresa Deudora / Obra</th>
                <th className="p-3 text-right">Monto Nominal</th>
                <th className="p-3 text-center">Plazo</th>
                <th className="p-3 text-right">Desembolso Neto</th>
                <th className="p-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {solicitudes.map((sol) => (
                <tr key={sol.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 font-mono">
                    <span className="font-bold text-white block">{sol.id}</span>
                    <span className="text-[10px] text-slate-500">{sol.codigoFactura}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-slate-200 block truncate max-w-xs">{sol.razonSocialEmisor}</span>
                    <span className="text-[10px] text-slate-400 font-mono">RUC: {sol.rucEmisor}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-medium text-slate-300 block">{sol.empresaDeudora}</span>
                    <span className="text-[10px] text-purple-400 block truncate max-w-xs">{sol.obraDestino}</span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-white">
                    ${sol.montoNominalUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-center font-mono">
                    {sol.plazoDiasAnticipo} días
                  </td>
                  <td className="p-3 text-right font-mono font-black text-emerald-400">
                    ${sol.montoNetoDesembolsoUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-center">
                    {sol.estado === 'LIQUIDADA_EN_24H' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1">
                        <CheckCircle2 size={12} /> Liquidada 24h
                      </span>
                    )}
                    {sol.estado === 'APROBADA_EN_CUSTODIA' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1">
                        <Clock size={12} /> En Custodia Escrow
                      </span>
                    )}
                    {sol.estado === 'PENDIENTE_ANALISIS' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center gap-1">
                        <AlertCircle size={12} /> Análisis de Riesgo
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL: REGISTRAR NUEVA SOLICITUD DE FACTORING */}
      {/* ==================================================================== */}
      {showSolicitudModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="text-amber-400" size={20} />
                Solicitud Oficial de Anticipo de Liquidez (24 Horas)
              </h3>
              <button onClick={() => setShowSolicitudModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCrearSolicitud} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] block">Monto a Anticipar:</span>
                  <span className="text-base font-bold text-white">${simulacion.montoNominalUSD.toLocaleString()} USD</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">Neto a Recibir en 24h:</span>
                  <span className="text-base font-black text-emerald-400">${simulacion.montoNetoDesembolsoUSD.toLocaleString()} USD</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">N° Comprobante / Factura SRI *</label>
                  <input
                    type="text"
                    required
                    placeholder="001-002-00098412"
                    value={formSolicitud.codigoFactura}
                    onChange={(e) => setFormSolicitud({ ...formSolicitud, codigoFactura: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">RUC Emisor *</label>
                  <input
                    type="text"
                    required
                    value={formSolicitud.rucEmisor}
                    onChange={(e) => setFormSolicitud({ ...formSolicitud, rucEmisor: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Empresa Deudora (Cliente de la Obra) *</label>
                <input
                  type="text"
                  required
                  value={formSolicitud.empresaDeudora}
                  onChange={(e) => setFormSolicitud({ ...formSolicitud, empresaDeudora: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Nombre de la Obra o Proyecto Civil *</label>
                <input
                  type="text"
                  required
                  value={formSolicitud.obraDestino}
                  onChange={(e) => setFormSolicitud({ ...formSolicitud, obraDestino: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              {/* Cuenta Bancaria de Desembolso */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <span className="text-[11px] font-bold text-amber-400 block uppercase">
                  Cuenta Bancaria para Transferencia SPI Inmediata
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 text-[10px] block mb-0.5">Institución Financiera</label>
                    <select
                      value={formSolicitud.banco}
                      onChange={(e) => setFormSolicitud({ ...formSolicitud, banco: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                    >
                      <option value="Banco Pichincha">Banco Pichincha</option>
                      <option value="Banco de Guayaquil">Banco de Guayaquil</option>
                      <option value="Banco del Austro">Banco del Austro</option>
                      <option value="Produbanco">Produbanco</option>
                      <option value="Banco Bolivariano">Banco Bolivariano</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] block mb-0.5">N° Cuenta Bancaria</label>
                    <input
                      type="text"
                      required
                      value={formSolicitud.numeroCuenta}
                      onChange={(e) => setFormSolicitud({ ...formSolicitud, numeroCuenta: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSolicitudModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-black shadow-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Zap size={14} className="fill-slate-950" />
                  <span>Ingresar Solicitud a Fideicomiso</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
