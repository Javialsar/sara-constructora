'use client';
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Wallet, Lock, CheckCircle2, ArrowRightLeft, Loader2, Plus, AlertCircle } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

interface Invoice {
  id: string;
  providerName: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved';
  invoiceNumber: string;
}

export default function DashboardFinanciero() {
  const supabase = createSupabaseBrowserClient();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totalEscrow, setTotalEscrow] = useState<number>(150000);
  const [releasedFunds, setReleasedFunds] = useState<number>(45000);
  const [escrowId, setEscrowId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [projectName, setProjectName] = useState<string>('Residencias Quito Sur');
  const [showFundModal, setShowFundModal] = useState<boolean>(false);
  const [fundAmount, setFundAmount] = useState<string>('25000');
  const [isFunding, setIsFunding] = useState<boolean>(false);

  useEffect(() => {
    fetchEscrowAndInvoices();
  }, []);

  const fetchEscrowAndInvoices = async () => {
    try {
      setLoading(true);
      // 1. Cargar o crear transacción Escrow
      let { data: escrows, error: escrowErr } = await supabase
        .from('escrow_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      let currentEscrow = escrows?.[0];

      if (!currentEscrow) {
        // Crear registro inicial real en Supabase
        const { data: newEscrow, error: insertErr } = await supabase
          .from('escrow_transactions')
          .insert({
            project_name: 'Residencias Quito Sur',
            total_locked_amount: 150000.00,
            released_amount: 45000.00,
            currency: 'USD',
            status: 'locked'
          })
          .select()
          .single();

        if (newEscrow) {
          currentEscrow = newEscrow;
        }
      }

      if (currentEscrow) {
        setEscrowId(currentEscrow.id);
        setProjectName(currentEscrow.project_name || 'Residencias Quito Sur');
        setTotalEscrow(Number(currentEscrow.total_locked_amount) || 150000);
        setReleasedFunds(Number(currentEscrow.released_amount) || 45000);

        // 2. Cargar facturas ligadas a este escrow
        const { data: invData } = await supabase
          .from('invoices')
          .select('*')
          .eq('escrow_id', currentEscrow.id)
          .order('created_at', { ascending: false });

        if (invData && invData.length > 0) {
          setInvoices(invData.map(inv => ({
            id: inv.id,
            invoiceNumber: inv.invoice_number,
            providerName: inv.invoice_number.includes('HOLCIM') ? 'Holcim Ecuador' : inv.invoice_number.includes('ADELCA') ? 'Acería del Ecuador (Adelca)' : 'Proveedor Certificado SARA',
            amount: Number(inv.amount),
            date: new Date(inv.created_at).toISOString().split('T')[0],
            status: inv.is_approved ? 'approved' : 'pending'
          })));
        } else {
          // Sembrar facturas iniciales en la base de datos
          const initialInvoices = [
            {
              escrow_id: currentEscrow.id,
              invoice_number: 'FAC-HOLCIM-001',
              amount: 15400.00,
              is_approved: false
            },
            {
              escrow_id: currentEscrow.id,
              invoice_number: 'FAC-ADELCA-002',
              amount: 8200.50,
              is_approved: true
            }
          ];

          const { data: seededInvs } = await supabase
            .from('invoices')
            .insert(initialInvoices)
            .select();

          if (seededInvs) {
            setInvoices(seededInvs.map(inv => ({
              id: inv.id,
              invoiceNumber: inv.invoice_number,
              providerName: inv.invoice_number.includes('HOLCIM') ? 'Holcim Ecuador' : 'Acería del Ecuador (Adelca)',
              amount: Number(inv.amount),
              date: new Date(inv.created_at).toISOString().split('T')[0],
              status: inv.is_approved ? 'approved' : 'pending'
            })));
          }
        }
      }
    } catch (err) {
      console.error('Error cargando datos de Supabase Escrow:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveInvoice = async (invoiceId: string, invoiceAmount: number) => {
    try {
      // 1. Actualizar estado de aprobación en Supabase
      const { error: invErr } = await supabase
        .from('invoices')
        .update({ is_approved: true })
        .eq('id', invoiceId);

      if (invErr) throw invErr;

      // 2. Incrementar monto liberado en escrow_transactions
      const newReleased = releasedFunds + invoiceAmount;
      if (escrowId) {
        await supabase
          .from('escrow_transactions')
          .update({
            released_amount: newReleased,
            updated_at: new Date().toISOString()
          })
          .eq('id', escrowId);
      }

      setReleasedFunds(newReleased);
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'approved' } : inv));
      alert(`Factura aprobada y persistida en Supabase. Fondos de $${invoiceAmount.toLocaleString()} liberados exitosamente.`);
    } catch (err: any) {
      alert('Error aprobando factura: ' + err.message);
    }
  };

  const handleFundEscrow = async () => {
    const val = parseFloat(fundAmount);
    if (isNaN(val) || val <= 0) return alert('Ingresa un monto válido.');

    try {
      setIsFunding(true);
      const newTotal = totalEscrow + val;
      if (escrowId) {
        const { error } = await supabase
          .from('escrow_transactions')
          .update({
            total_locked_amount: newTotal,
            updated_at: new Date().toISOString()
          })
          .eq('id', escrowId);

        if (error) throw error;
      }

      setTotalEscrow(newTotal);
      setShowFundModal(false);
      setFundAmount('');
      alert(`Fondos acreditados: $${val.toLocaleString()} añadidos al fideicomiso en Supabase.`);
    } catch (err: any) {
      alert('Error fondeando escrow: ' + err.message);
    } finally {
      setIsFunding(false);
    }
  };

  const remainingEscrow = Math.max(0, totalEscrow - releasedFunds);
  const advancePercentage = totalEscrow > 0 ? (releasedFunds / totalEscrow) * 100 : 0;

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto pt-16">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="text-emerald-500 w-10 h-10" />
              <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                SARA Fintech <span className="text-emerald-500 font-light">& Escrow</span>
              </h1>
            </div>
            <p className="text-slate-500 text-lg">
              Protección de capital y liberación por hitos - Proyecto: <strong>"{projectName}"</strong>
            </p>
          </div>
          <button 
            onClick={() => setShowFundModal(true)}
            className="mt-4 md:mt-0 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2"
          >
            <ArrowRightLeft size={18} />
            Fondear Cuenta Escrow
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          </div>
        ) : (
          <>
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
                  style={{ width: `${Math.min(100, advancePercentage)}%` }}
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
                <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
                  Sincronizado con Supabase
                </span>
              </div>

              <div className="overflow-x-auto p-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Factura</th>
                      <th className="p-4">Proveedor / Talento</th>
                      <th className="p-4">Fecha</th>
                      <th className="p-4">Monto (USD)</th>
                      <th className="p-4">Estado Logístico</th>
                      <th className="p-4 text-right">Acción Autorizada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(invoice => (
                      <tr key={invoice.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-0 group">
                        <td className="p-4 text-slate-600 font-mono text-sm">{invoice.invoiceNumber || invoice.id}</td>
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
                              onClick={() => handleApproveInvoice(invoice.id, invoice.amount)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow"
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
          </>
        )}

        {/* Modal de Fondear Cuenta Escrow */}
        {showFundModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Fondear Cuenta Escrow</h3>
              <p className="text-sm text-slate-500 mb-6">
                Ingresa el monto a depositar en el fideicomiso protegido de SARA Constructora.
              </p>
              
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Monto a Depositar (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                  <input 
                    type="number"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 font-black text-xl text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowFundModal(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleFundEscrow}
                  disabled={isFunding}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  {isFunding ? <Loader2 size={18} className="animate-spin" /> : 'Confirmar Depósito'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
