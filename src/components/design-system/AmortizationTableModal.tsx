'use client';

import * as React from 'react';
import { 
  FileText, Download, X, DollarSign, Calculator, 
  Printer, TrendingDown, CheckCircle2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AmortizationRow {
  year: number;
  cuotaAnual: number;
  capitalPagado: number;
  interesPagado: number;
  saldoRestante: number;
}

export function AmortizationTableModal({
  isOpen,
  onClose,
  loanAmount,
  annualRatePct,
  termYears,
  propertyTitle
}: {
  isOpen: boolean;
  onClose: () => void;
  loanAmount: number;
  annualRatePct: number;
  termYears: number;
  propertyTitle: string;
}) {
  if (!isOpen) return null;

  // Cálculo de tabla de amortización anual resumida (Método Francés)
  const monthlyRate = (annualRatePct / 100) / 12;
  const totalMonths = termYears * 12;
  const monthlyPayment = (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) / 
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  const rows: AmortizationRow[] = [];
  let currentBalance = loanAmount;

  for (let year = 1; year <= termYears; year++) {
    let yearCapital = 0;
    let yearInterest = 0;

    for (let month = 1; month <= 12; month++) {
      const interest = currentBalance * monthlyRate;
      const principal = monthlyPayment - interest;
      yearInterest += interest;
      yearCapital += principal;
      currentBalance = Math.max(0, currentBalance - principal);
    }

    rows.push({
      year,
      cuotaAnual: monthlyPayment * 12,
      capitalPagado: yearCapital,
      interesPagado: yearInterest,
      saldoRestante: currentBalance
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-150 font-sans text-slate-100">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Tabla de Amortización Francesa • {propertyTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Monto Financiado</span>
              <strong className="text-white text-base">${loanAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Tasa Anual Efectiva</span>
              <strong className="text-emerald-400 text-base">{annualRatePct}% Tasa Fija</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Cuota Mensual Neta</span>
              <strong className="text-emerald-400 text-base">${Math.round(monthlyPayment).toLocaleString()}/mes</strong>
            </div>
          </div>

          {/* Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Año</th>
                  <th className="p-2.5 text-right">Cuota Anual</th>
                  <th className="p-2.5 text-right">Capital</th>
                  <th className="p-2.5 text-right">Intereses</th>
                  <th className="p-2.5 text-right">Saldo Restante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {rows.map((r) => (
                  <tr key={r.year} className="hover:bg-slate-800/40">
                    <td className="p-2.5 text-white font-bold">Año {r.year}</td>
                    <td className="p-2.5 text-right text-slate-300">${Math.round(r.cuotaAnual).toLocaleString()}</td>
                    <td className="p-2.5 text-right text-emerald-400 font-bold">${Math.round(r.capitalPagado).toLocaleString()}</td>
                    <td className="p-2.5 text-right text-rose-400">${Math.round(r.interesPagado).toLocaleString()}</td>
                    <td className="p-2.5 text-right text-slate-400">${Math.round(r.saldoRestante).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Tabla de Amortización</span>
          </button>
        </div>
      </div>
    </div>
  );
}
