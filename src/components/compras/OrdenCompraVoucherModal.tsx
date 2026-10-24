'use client';

import React from 'react';
import { OrdenCompraOficial } from '@/lib/services/comprasService';
import { 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Download, 
  FileText, 
  Printer, 
  ShieldCheck, 
  Truck, 
  X,
  CreditCard,
  MapPin,
  AlertCircle
} from 'lucide-react';

interface Props {
  orden: OrdenCompraOficial | null;
  onClose: () => void;
}

export function OrdenCompraVoucherModal({ orden, onClose }: Props) {
  if (!orden) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none">
        
        {/* BARRA SUPERIOR DE ACCIONES (OCULTA EN IMPRESIÓN) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 print:hidden">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Orden de Compra Oficial • {orden.folio}
              </h3>
              <p className="text-xs text-slate-500">Documento contractual y fiscal congelado para obra civil</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Exportar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENIDO DEL DOCUMENTO VOUCHER OFICIAL */}
        <div className="overflow-y-auto p-8 space-y-6 text-slate-800 dark:text-slate-200 print:p-6 print:text-black" id="printable-voucher">
          
          {/* CABECERA MEMBRETADA */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b-2 border-slate-900 dark:border-slate-700 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-sm tracking-wider rounded-lg">
                  GRUPO SARA
                </span>
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                  SARA-CONSTRUCTORA S.A.S.
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight mt-2 text-slate-900 dark:text-white">
                ORDEN DE COMPRA MERCANTIL
              </h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                R.U.C. 1792345678001 • Autorización SRI & Control de Obras Civiles NEC-15
              </p>
              <p className="text-xs text-slate-500">
                Matriz: Av. República del Salvador N36-84 y Naciones Unidas, Edificio SARA Corporate • Quito, Ecuador
              </p>
            </div>

            <div className="text-right flex flex-col items-end">
              <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 min-w-[200px]">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Número de Documento</span>
                <span className="text-xl font-black font-mono text-amber-500">{orden.folio}</span>
                <div className="mt-1 flex items-center justify-end gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    orden.estado === 'RECIBIDA_TOTAL' ? 'bg-emerald-500/20 text-emerald-500' :
                    orden.estado === 'RECIBIDA_PARCIAL' ? 'bg-blue-500/20 text-blue-500' :
                    orden.estado === 'EMITIDA' ? 'bg-amber-500/20 text-amber-500' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {orden.estado.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-400 mt-2">
                Fecha Emisión: <strong>{orden.fechaEmision}</strong>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Entrega Programada: <strong>{orden.fechaEstimadaEntrega}</strong>
              </span>
            </div>
          </div>

          {/* DATOS DE LA OBRA Y DEL PROVEEDOR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* DESTINO / OBRA */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <span className="text-[11px] font-mono font-bold text-amber-500 uppercase flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Datos de Destino y Obra en Construcción
              </span>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">{orden.proyectoNombre}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                <span>{orden.direccionEntrega} ({orden.cantonDestino}, {orden.provinciaDestino})</span>
              </p>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700/50 flex justify-between">
                <span>Requisición Origen: <strong>{orden.requisicionId}</strong></span>
                <span>Moneda: <strong>USD ($)</strong></span>
              </div>
            </div>

            {/* PROVEEDOR ADJUDICADO */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <span className="text-[11px] font-mono font-bold text-blue-500 uppercase flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                Proveedor Adjudicado & Condiciones
              </span>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">{orden.proveedorRazonSocial}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                R.U.C.: <strong>{orden.proveedorRuc}</strong>
              </p>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700/50 flex justify-between">
                <span>Condición de Pago: <strong>{orden.condicionPago}</strong></span>
              </div>
            </div>

          </div>

          {/* TABLA DE PARTIDAS CONGELADAS */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Detalle de Partidas, Cantidades y Precios Unitarios Congelados
              </h4>
              <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                Precios Fijos e Inalterables
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                  <tr>
                    <th className="p-3">Código</th>
                    <th className="p-3">Descripción Técnica</th>
                    <th className="p-3 text-center">Unidad</th>
                    <th className="p-3 text-right">Cant. Pedida</th>
                    <th className="p-3 text-right">Recibida</th>
                    <th className="p-3 text-right">Pendiente</th>
                    <th className="p-3 text-right">P. Unitario ($)</th>
                    <th className="p-3 text-center">IVA %</th>
                    <th className="p-3 text-right">Subtotal ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px]">
                  {orden.items.map((it, idx) => (
                    <tr key={it.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-500">{it.codigoInsumo}</td>
                      <td className="p-3 font-sans font-medium text-slate-900 dark:text-white">
                        {it.descripcion}
                        {it.rubroApuCodigo && (
                          <span className="block text-[10px] text-amber-500 font-mono">
                            Rubro APU: {it.rubroApuCodigo}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">{it.unidad}</td>
                      <td className="p-3 text-right font-bold">{it.cantidadPedida.toFixed(2)}</td>
                      <td className="p-3 text-right text-emerald-500 font-bold">{it.cantidadRecibidaConforme.toFixed(2)}</td>
                      <td className="p-3 text-right text-amber-500 font-bold">{it.cantidadPendiente.toFixed(2)}</td>
                      <td className="p-3 text-right">${it.precioUnitarioCongeladoUSD.toFixed(2)}</td>
                      <td className="p-3 text-center font-bold">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${it.tarifaIvaPct === 5 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                          {it.tarifaIvaPct}%
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                        ${it.subtotalUSD.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* LIQUIDACIÓN TRIBUTARIA SRI (5% vs 15%) Y TOTALES */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-2">
            
            <div className="max-w-md space-y-2 text-xs text-slate-500">
              <span className="font-bold text-slate-700 dark:text-slate-300 font-mono block">
                Notas y Términos Comerciales:
              </span>
              <p className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] leading-relaxed">
                {orden.notasTerminosCondiciones}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-500">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Tarifa IVA 5% aplicada bajo Res. SRI NAC-DGERCGC24-00000013 para materiales de construcción calificados.</span>
              </div>
            </div>

            <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal Materiales:</span>
                <span className="font-bold text-slate-900 dark:text-white">${orden.subtotalUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Flete MTOP Puesto en Obra:</span>
                <span className="font-bold text-slate-900 dark:text-white">${orden.fleteTotalUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>IVA 5% (Base ${orden.baseIva5PctUSD.toFixed(2)}):</span>
                <span className="font-bold">+${orden.iva5PctUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>IVA 15% (Base ${orden.baseIva15PctUSD.toFixed(2)}):</span>
                <span className="font-bold">+${orden.iva15PctUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t-2 border-slate-900 dark:border-slate-600 font-sans">
                <span className="font-black text-slate-900 dark:text-white">TOTAL ORDEN COMPRA:</span>
                <span className="font-black text-amber-500 text-base font-mono">
                  ${orden.totalPagarUSD.toFixed(2)} USD
                </span>
              </div>
            </div>

          </div>

          {/* FIRMAS DE RESPONSABILIDAD */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-slate-200 dark:border-slate-800 text-center text-xs">
            <div className="space-y-1">
              <div className="h-14 border-b border-dashed border-slate-400 mx-6"></div>
              <p className="font-bold text-slate-900 dark:text-white">{orden.responsableEmision}</p>
              <p className="text-[11px] text-slate-400">Jefatura de Compras & Procuramiento</p>
            </div>
            <div className="space-y-1">
              <div className="h-14 border-b border-dashed border-slate-400 mx-6"></div>
              <p className="font-bold text-slate-900 dark:text-white">{orden.responsableAprobacion}</p>
              <p className="text-[11px] text-slate-400">Fiscalización / Dirección Técnica de Obra</p>
            </div>
            <div className="space-y-1">
              <div className="h-14 border-b border-dashed border-slate-400 mx-6"></div>
              <p className="font-bold text-slate-900 dark:text-white">{orden.proveedorRazonSocial}</p>
              <p className="text-[11px] text-slate-400">Aceptación de Proveedor & Despacho</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
