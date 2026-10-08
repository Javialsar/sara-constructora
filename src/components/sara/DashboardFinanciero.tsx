import React, { useState } from 'react';
import { ShieldCheck, Wallet, Lock, CheckCircle2, ArrowRightLeft } from 'lucide-react';

interface Invoice {
  id: string;
  providerName: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved';
}

export default function DashboardFinanciero() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'F001', providerName: 'Holcim Ecuador', amount: 15400.00, date: '2026-10-01', status: 'pending' },
    { id: 'F002', providerName: 'Acería del Ecuador (Adelca)', amount: 8200.50, date: '2026-10-05', status: 'approved' }
  ]);

  const totalEscrow = 150000.00;
  const releasedFunds = 45000.00;
  const remainingEscrow = totalEscrow - releasedFunds;
  
  const advancePercentage = (releasedFunds / totalEscrow) * 100;

  const handleApproveInvoice = (id: string) => {
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: 'approved' } : inv));
    alert(`Factura ${id} aprobada. Fondos en proceso de liberación.`);
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto pt-16">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="text-emerald-500 w-10 h-10" />
              <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">SARA Fintech <span className="text-emerald-500 font-light">& Escrow</span></h1>
            </div>
            <p className="text-slate-500 text-lg">Protección de capital y liberación por hitos - Proyecto: <strong>"Residencias Quito Sur"</strong></p>
          </div>
          <button className="mt-4 md:mt-0 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2">
            <ArrowRightLeft size={18} />
            Fondear Cuenta Escrow
          </button>
        </header>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600">
              <Wallet size={24} />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Capital Total Fideicomiso</p>
            <p className="text-4xl font-black text-slate-800">${totalEscrow.toLocaleString()}</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Fondos Liberados</p>
            <p className="text-4xl font-black text-emerald-500">${releasedFunds.toLocaleString()}</p>
          </div>
          
          <div className="bg-slate-900 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10">
              <Lock size={150} />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 text-white">
                <ShieldCheck size={24} />
              </div>
              <p className="text-sm font-bold text-white/60 uppercase tracking-wider mb-2">Saldo Protegido SARA</p>
              <p className="text-4xl font-black text-white">${remainingEscrow.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Barra de Progreso de Inversión */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-10">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Avance Financiero vs Obra Física</h2>
              <p className="text-slate-500 text-sm mt-1">El progreso de los pagos debe ir acorde al avance reportado por fiscalización.</p>
            </div>
            <p className="text-2xl font-black text-emerald-500">{advancePercentage.toFixed(1)}%</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${advancePercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Aprobación de Facturas e Hitos */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Liberación de Pagos (Hitos)</h2>
              <p className="text-sm text-slate-500 mt-1">Autoriza los pagos a proveedores que ya entregaron el material (SARA Fletes).</p>
            </div>
          </div>

          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">ID Factura</th>
                  <th className="p-4">Proveedor / Talento</th>
                  <th className="p-4">Fecha Emisión</th>
                  <th className="p-4">Monto (USD)</th>
                  <th className="p-4">Estado Logístico</th>
                  <th className="p-4 text-right">Acción Autorizada</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(invoice => (
                  <tr key={invoice.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-0 group">
                    <td className="p-4 text-slate-600 font-medium">{invoice.id}</td>
                    <td className="p-4 text-slate-900 font-bold">{invoice.providerName}</td>
                    <td className="p-4 text-slate-500">{invoice.date}</td>
                    <td className="p-4 font-black text-slate-800 text-lg">${invoice.amount.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                        invoice.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {invoice.status === 'approved' ? 'Entregado en Obra' : 'En Tránsito'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {invoice.status === 'pending' ? (
                        <button 
                          onClick={() => handleApproveInvoice(invoice.id)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow opacity-0 group-hover:opacity-100"
                        >
                          Liberar Pago
                        </button>
                      ) : (
                        <span className="text-slate-400 text-sm font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 size={16} /> Fondos Transferidos
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
