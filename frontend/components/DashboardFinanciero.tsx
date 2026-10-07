import React, { useState } from 'react';

interface Invoice {
  id: string;
  providerName: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved';
}

/**
 * Agente Frontend Developer
 * Dashboard Financiero para Constructores - Grupo SARA
 */
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
    // Lógica para enviar al backend (escrowService.releaseFunds)
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: 'approved' } : inv));
    alert(`Factura ${id} aprobada. Fondos en proceso de liberación.`);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">SARA Fintech & Escrow</h1>
        <p className="text-slate-500">Panel de Control Financiero - Proyecto: "Residencias Quito Sur"</p>
      </header>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Capital Total en Escrow</p>
          <p className="text-2xl font-bold text-blue-700">${totalEscrow.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Fondos Liberados (Avance)</p>
          <p className="text-2xl font-bold text-emerald-600">${releasedFunds.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Saldo Protegido Disponible</p>
          <p className="text-2xl font-bold text-slate-700">${remainingEscrow.toLocaleString()}</p>
        </div>
      </div>

      {/* Barra de Progreso de Inversión */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Avance de Inversión vs Obra Física</h2>
        <div className="w-full bg-slate-200 rounded-full h-4 mb-2">
          <div 
            className="bg-emerald-500 h-4 rounded-full transition-all duration-500" 
            style={{ width: `${advancePercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-slate-500 text-right">{advancePercentage.toFixed(1)}% Ejecutado</p>
      </div>

      {/* Aprobación de Facturas e Hitos */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-slate-800">Facturas Pendientes de Aprobación</h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Solicitar Anticipo de Capital
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-sm text-slate-500">
                <th className="pb-3 font-medium">ID Factura</th>
                <th className="pb-3 font-medium">Proveedor / Talento</th>
                <th className="pb-3 font-medium">Fecha</th>
                <th className="pb-3 font-medium">Monto (USD)</th>
                <th className="pb-3 font-medium">Estado</th>
                <th className="pb-3 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-4 text-slate-800">{invoice.id}</td>
                  <td className="py-4 text-slate-800">{invoice.providerName}</td>
                  <td className="py-4 text-slate-500">{invoice.date}</td>
                  <td className="py-4 font-semibold text-slate-800">${invoice.amount.toLocaleString()}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {invoice.status === 'approved' ? 'Aprobado' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    {invoice.status === 'pending' && (
                      <button 
                        onClick={() => handleApproveInvoice(invoice.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Aprobar y Liberar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
