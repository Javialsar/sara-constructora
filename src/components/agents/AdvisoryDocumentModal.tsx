'use client';

import React from 'react';
import {
  CuadroComparativoDocumentData,
  ReporteConsolidadoDocumentData
} from '@/lib/agents/advisory-types';
import {
  descargarCuadroComparativoPDF,
  descargarReporteConsolidadoPDF
} from '@/lib/agents/advisory-pdf-generator';
import { Download, Printer, X, CheckCircle2, ShieldCheck, FileSpreadsheet, Truck, Building2 } from 'lucide-react';

interface AdvisoryDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipoDocumento: 'cuadro_comparativo_proveedores' | 'reporte_consolidado_insumos_logistica';
  dataCuadro?: CuadroComparativoDocumentData | null;
  dataReporte?: ReporteConsolidadoDocumentData | null;
}

export const AdvisoryDocumentModal: React.FC<AdvisoryDocumentModalProps> = ({
  isOpen,
  onClose,
  tipoDocumento,
  dataCuadro,
  dataReporte
}) => {
  if (!isOpen) return null;

  const handleDescargar = () => {
    if (tipoDocumento === 'cuadro_comparativo_proveedores' && dataCuadro) {
      descargarCuadroComparativoPDF(dataCuadro);
    } else if (tipoDocumento === 'reporte_consolidado_insumos_logistica' && dataReporte) {
      descargarReporteConsolidadoPDF(dataReporte);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Barra Superior de Control */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              {tipoDocumento === 'cuadro_comparativo_proveedores' ? (
                <FileSpreadsheet className="w-5 h-5" />
              ) : (
                <Truck className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-blue-400 font-semibold">
                Exportable Oficial · Grupo SARA Ecosistema
              </div>
              <h2 className="text-base sm:text-lg font-bold">
                {tipoDocumento === 'cuadro_comparativo_proveedores'
                  ? 'Cuadro Comparativo Técnico de Proveedores'
                  : 'Reporte Consolidado de Insumos y Logística'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleImprimir}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700"
              title="Imprimir documento en formato A4"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button
              onClick={handleDescargar}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenedor Imprimible del Documento */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50 print:p-0 print:bg-white text-slate-800 text-sm">
          {/* 1. VISTA: CUADRO COMPARATIVO DE PROVEEDORES */}
          {tipoDocumento === 'cuadro_comparativo_proveedores' && dataCuadro && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6 max-w-4xl mx-auto">
              {/* Encabezado Corporativo */}
              <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <div className="text-blue-700 font-extrabold tracking-wide text-xs">
                    GRUPO SARA · INGENIERÍA, APU & MARKETPLACE
                  </div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    {dataCuadro.titulo}
                  </h1>
                  <p className="text-xs text-slate-500">
                    Resolución técnica fundamentada en plazos de crédito, bonificación de flete y puntuación de confianza IA.
                  </p>
                </div>
                <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4 text-xs space-y-0.5">
                  <div className="font-bold text-slate-700">{dataCuadro.codigoDocumento}</div>
                  <div className="text-slate-500">{dataCuadro.fechaEmision}</div>
                  <div className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    DICTAMEN VALIDADO
                  </div>
                </div>
              </div>

              {/* Ficha Técnica */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-slate-600">Proyecto: </span>
                  <span className="font-semibold text-slate-900">{dataCuadro.proyectoNombre}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600">Ubicación Obra: </span>
                  <span className="text-slate-800">{dataCuadro.ubicacion}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600">Técnico Evaluador: </span>
                  <span className="text-slate-800">{dataCuadro.tecnicoResponsable}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600">Director de Obra: </span>
                  <span className="text-slate-800">{dataCuadro.directorObra}</span>
                </div>
              </div>

              {/* Tabla Comparativa de Proveedores */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-semibold">
                      <th className="py-2.5 px-3">Insumo / Especificación</th>
                      <th className="py-2.5 px-3">Proveedor</th>
                      <th className="py-2.5 px-3">Origen</th>
                      <th className="py-2.5 px-3 text-right">P. Unitario</th>
                      <th className="py-2.5 px-3 text-center">Flete Incluido</th>
                      <th className="py-2.5 px-3 text-center">Línea Crédito</th>
                      <th className="py-2.5 px-3 text-center">Score IA</th>
                      <th className="py-2.5 px-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {dataCuadro.items.map((item) => (
                      <tr
                        key={item.id}
                        className={item.recomendado ? 'bg-blue-50/60 font-medium' : 'hover:bg-slate-50'}
                      >
                        <td className="py-2 px-3 font-medium text-slate-900 max-w-[200px] truncate" title={item.insumo}>
                          {item.insumo}
                        </td>
                        <td className="py-2 px-3 text-slate-700">{item.proveedor}</td>
                        <td className="py-2 px-3 text-slate-500">{item.ciudadOrigen}</td>
                        <td className="py-2 px-3 text-right font-semibold text-slate-900">
                          ${item.precioUnitario.toFixed(2)} <span className="text-[10px] text-slate-500">/{item.unidad}</span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          {item.fleteIncluido ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                              ✓ Sí
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">No</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center font-semibold text-slate-700">
                          {item.diasCredito > 0 ? `${item.diasCredito} días` : 'Contado'}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 font-bold text-slate-700">
                            {item.puntuacionConfianzaIA}%
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          {item.recomendado ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-600 text-white font-bold shadow-sm">
                              ★ Adjudicar
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Alternativa</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Dictamen IA y Balance Financiero */}
              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  DICTAMEN TÉCNICO Y FINANCIERO DE LA RED AGÉNTICA SARA
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {dataCuadro.dictamenIA}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-blue-200/60 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Ahorro Proyectado</div>
                    <div className="text-base font-extrabold text-emerald-700">
                      ${dataCuadro.resumenFinanciero.ahorroTotalProyectadoUSD.toFixed(2)} USD
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Flujo de Caja</div>
                    <div className="text-base font-extrabold text-blue-700">
                      +{dataCuadro.resumenFinanciero.optimizacionFlujoCajaPct}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Crédito Promedio</div>
                    <div className="text-base font-extrabold text-slate-800">
                      {dataCuadro.resumenFinanciero.diasCreditoPromedio} días
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Proveedores Evaluados</div>
                    <div className="text-base font-extrabold text-slate-800">
                      {dataCuadro.resumenFinanciero.totalOpcionesAnalizadas} opciones
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloque de Firmas */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="border-t border-slate-400 w-3/4 mx-auto mb-1"></div>
                  <div className="font-bold text-slate-800">EVALUADO POR (IA & TÉCNICO)</div>
                  <div className="text-slate-500">{dataCuadro.tecnicoResponsable}</div>
                </div>
                <div>
                  <div className="border-t border-slate-400 w-3/4 mx-auto mb-1"></div>
                  <div className="font-bold text-slate-800">APROBADO (DIRECTOR DE OBRA)</div>
                  <div className="text-slate-500">{dataCuadro.directorObra}</div>
                </div>
              </div>
            </div>
          )}

          {/* 2. VISTA: REPORTE CONSOLIDADO DE INSUMOS Y LOGÍSTICA */}
          {tipoDocumento === 'reporte_consolidado_insumos_logistica' && dataReporte && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6 max-w-4xl mx-auto">
              {/* Encabezado Corporativo */}
              <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <div className="text-blue-700 font-extrabold tracking-wide text-xs">
                    GRUPO SARA · LOGÍSTICA PESADA & CONTROL OPERATIVO
                  </div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    {dataReporte.titulo}
                  </h1>
                  <p className="text-xs text-slate-500">
                    Cubicación métrica de insumos, asignación de cooperativas aliadas y ahorro logístico formalizado.
                  </p>
                </div>
                <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4 text-xs space-y-0.5">
                  <div className="font-bold text-slate-700">{dataReporte.codigoDocumento}</div>
                  <div className="text-slate-500">{dataReporte.fechaEmision}</div>
                  <div className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                    PARA FIRMA DE OBRA
                  </div>
                </div>
              </div>

              {/* Ficha Técnica */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-slate-600">Proyecto: </span>
                  <span className="font-semibold text-slate-900">{dataReporte.proyectoNombre}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600">Ubicación: </span>
                  <span className="text-slate-800">{dataReporte.ubicacionObra}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600">Volumen Desalojo: </span>
                  <span className="font-bold text-blue-700">{dataReporte.volumenDesalojoTotalM3} m³</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600">Director de Obra: </span>
                  <span className="text-slate-800">{dataReporte.directorObra}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600">Fiscalizador: </span>
                  <span className="text-slate-800">{dataReporte.fiscalizadorColegiado}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600">Peso Total Carga: </span>
                  <span className="font-bold text-slate-900">{dataReporte.pesoTotalCargaTon} Toneladas</span>
                </div>
              </div>

              {/* Tabla de Materiales y Logística */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-semibold">
                      <th className="py-2.5 px-3">Material / Especificación</th>
                      <th className="py-2.5 px-3">Cantidad</th>
                      <th className="py-2.5 px-3">Despacho / Proveedor</th>
                      <th className="py-2.5 px-3">Transporte & Cooperativa</th>
                      <th className="py-2.5 px-3 text-right">Costo Base</th>
                      <th className="py-2.5 px-3 text-right">Optimizado</th>
                      <th className="py-2.5 px-3 text-right">Ahorro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {dataReporte.materiales.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-medium text-slate-900 max-w-[180px] truncate" title={m.material}>
                          {m.material}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-700">
                          {m.cantidad} {m.unidad}
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          <div>{m.ubicacionDespacho}</div>
                          <div className="text-[10px] text-blue-700 font-semibold">{m.proveedorAsignado}</div>
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          <div>{m.tipoTransporteSugerido}</div>
                          <div className="text-[10px] text-slate-500 font-medium">({m.cooperativaAliada})</div>
                        </td>
                        <td className="py-2 px-3 text-right text-slate-500">
                          ${m.costoBaseUSD.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-slate-800">
                          ${m.costoOptimizadoUSD.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-700">
                          +${m.ahorroEstimadoUSD.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Balance Consolidado e Impacto Económico */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  IMPACTO ECONÓMICO Y AHORRO CONSOLIDADO LOGRADO POR GRUPO SARA
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-emerald-100">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Costo Tradicional Mercado</div>
                    <div className="text-base font-bold text-slate-700">
                      ${dataReporte.balanceFinanciero.costoLogisticoTradicionalUSD.toFixed(2)} USD
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-emerald-100">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Costo Optimizado Red SARA</div>
                    <div className="text-base font-bold text-blue-700">
                      ${dataReporte.balanceFinanciero.costoLogisticoOptimizadoUSD.toFixed(2)} USD
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-emerald-200 shadow-sm">
                    <div className="text-[10px] text-emerald-700 font-bold uppercase">Ahorro Neto en Obra</div>
                    <div className="text-lg font-black text-emerald-700">
                      ${dataReporte.balanceFinanciero.ahorroNetoLogisticaUSD.toFixed(2)} USD
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-600">
                      ({dataReporte.balanceFinanciero.porcentajeAhorroGlobal}% de reducción)
                    </div>
                  </div>
                </div>
              </div>

              {/* Declaración Técnica */}
              <p className="text-[11px] text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                "{dataReporte.declaracionResponsabilidad}"
              </p>

              {/* Bloque de Firmas Oficiales */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="border-t border-slate-400 w-3/4 mx-auto mb-1"></div>
                  <div className="font-bold text-slate-800">DIRECTOR DE OBRA RESPONSABLE</div>
                  <div className="text-slate-500">{dataReporte.directorObra}</div>
                  <div className="text-[10px] text-slate-400">Colegio de Ingenieros Civiles</div>
                </div>
                <div>
                  <div className="border-t border-slate-400 w-3/4 mx-auto mb-1"></div>
                  <div className="font-bold text-slate-800">FISCALIZADOR TÉCNICO COLEGIADO</div>
                  <div className="text-slate-500">{dataReporte.fiscalizadorColegiado}</div>
                  <div className="text-[10px] text-slate-400">Fiscalización Independiente</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
