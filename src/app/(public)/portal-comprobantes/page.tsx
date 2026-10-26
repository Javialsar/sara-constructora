'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Download, FileText, CheckCircle2, ArrowLeft, ShieldCheck, Receipt } from 'lucide-react';

export default function PortalComprobantesPublico() {
  const [identificacion, setIdentificacion] = useState('');
  const [buscado, setBuscado] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 5000);
  };

  const comprobantesSimulados = [
    {
      id: 'cmp-01',
      tipo: 'Factura Electrónica (01)',
      numero: '001-001-000000142',
      emisor: 'GRUPO SARA CONSTRUCTORA CIA. LTDA.',
      rucEmisor: '1792345678001',
      fecha: '24/10/2026',
      total: 145.00,
      claveAcceso: '2410202601179234567800120010010000001421234567819'
    },
    {
      id: 'cmp-02',
      tipo: 'Factura Electrónica (01)',
      numero: '001-001-000000098',
      emisor: 'SARA FLETES PESADOS & RENTA',
      rucEmisor: '1792345678001',
      fecha: '15/10/2026',
      total: 35.00,
      claveAcceso: '1510202601179234567800120010010000000981234567814'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 pt-24 pb-16 px-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-slate-950 font-bold shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-6 h-6" />
          <div className="text-sm">{toast}</div>
        </div>
      )}

      <div className="max-w-3xl mx-auto w-full space-y-8">
        <div>
          <Link
            href="/facturacion-electronica"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-amber-400 uppercase tracking-wider mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a Facturación & Firma
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest mb-2">
            <Receipt className="w-4 h-4" /> Portal de Consulta Cero-Registro
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Descarga de Comprobantes Electrónicos
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Ingresa tu número de Cédula o RUC para consultar todas las facturas y retenciones emitidas a tu nombre por cualquier profesional o empresa de GRUPO SARA.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-white/[0.08] flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Ingresa Cédula o RUC (ej: 0104567890)..."
            value={identificacion}
            onChange={(e) => setIdentificacion(e.target.value)}
            className="flex-1 min-h-[50px] px-4 rounded-2xl bg-slate-950 border border-white/[0.12] focus:border-amber-400 text-white font-mono text-sm outline-none"
          />
          <button
            onClick={() => {
              if (identificacion.length < 10) {
                showToast('Ingresa una identificación válida (mínimo 10 dígitos).');
                return;
              }
              setBuscado(true);
            }}
            className="min-h-[50px] px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shrink-0"
          >
            <Search className="w-4 h-4" /> Consultar
          </button>
        </div>

        {buscado && (
          <div className="space-y-4 animate-in fade-in-50">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Comprobantes encontrados para: <strong className="text-white">{identificacion}</strong>
            </h2>

            {comprobantesSimulados.map((c) => (
              <div key={c.id} className="p-6 rounded-3xl bg-slate-900 border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      AUTORIZADA SRI
                    </span>
                    <span className="font-mono text-xs font-bold text-white">{c.numero}</span>
                  </div>
                  <div className="text-xs text-slate-300 font-bold mt-1.5">{c.emisor}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">RUC Emisor: {c.rucEmisor} · Fecha: {c.fecha}</div>
                  <div className="font-mono text-xs text-amber-400 font-bold mt-1.5">Total: \${c.total.toFixed(2)} USD</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => showToast(`Descargando RIDE (PDF) con código QR oficial para ${c.numero}...`)}
                    className="min-h-[42px] px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-white border border-white/[0.08] flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-4 h-4 text-red-400" /> RIDE (PDF)
                  </button>
                  <button
                    onClick={() => showToast(`Descargando XML firmado oficial para ${c.numero}...`)}
                    className="min-h-[42px] px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-white border border-white/[0.08] flex items-center gap-1.5 transition-all"
                  >
                    <FileText className="w-4 h-4 text-blue-400" /> XML
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}