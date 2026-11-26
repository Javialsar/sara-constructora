'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  CreditCard,
  FileCheck2,
  Loader2,
  Percent,
  QrCode,
  Radio,
  ShieldAlert,
  Wallet,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { LiveTranslatorChat } from '@/components/fletes/LiveTranslatorChat';
import { DigitalDeliveryAct } from '@/components/fletes/DigitalDeliveryAct';
import { HoldSosButton } from '@/components/fletes/HoldSosButton';
import { useSaraTelemetry, type OrderTripState } from '@/hooks/useSaraTelemetry';
import { executeOrchestratedPayment } from '@/lib/payments/paymentOrchestrator';

interface DriverWalletState {
  balance_usd: number;
  cash_orders_blocked: boolean;
  backhaul_enabled: boolean;
}

interface DriverOrderBreakdown {
  id: string;
  origin_label: string;
  dest_label: string;
  quoted_price_usd: number;
  commission_rate: number;
  stevedores_fee_usd: number;
  payment_method: string;
  status: string;
  receiver_name: string | null;
  receiver_qr_token: string | null;
  created_at: string;
}

interface DriverV2OperationsPanelProps {
  driverId: string;
}

export function DriverV2OperationsPanel({ driverId }: DriverV2OperationsPanelProps) {
  const supabase = useMemo(() => createClient(), []);
  const [wallet, setWallet] = useState<DriverWalletState>({
    balance_usd: 0,
    cash_orders_blocked: true,
    backhaul_enabled: true,
  });
  const [orders, setOrders] = useState<DriverOrderBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState<number>(20);
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupFeedback, setTopupFeedback] = useState<string | null>(null);
  const [backhaulBusy, setBackhaulBusy] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [tripState, setTripState] = useState<OrderTripState>('IN_TRANSIT');
  const [epodOpen, setEpodOpen] = useState(false);
  const [geofenceNotice, setGeofenceNotice] = useState<string | null>(null);

  const loadDriverData = async () => {
    setLoading(true);
    try {
      const [{ data: walletRow }, { data: orderRows }] = await Promise.all([
        supabase
          .from('fletes_driver_wallets')
          .select('balance_usd, cash_orders_blocked, backhaul_enabled')
          .eq('driver_id', driverId)
          .maybeSingle(),
        supabase
          .from('fletes_orders')
          .select(
            'id, origin_label, dest_label, quoted_price_usd, commission_rate, stevedores_fee_usd, payment_method, status, receiver_name, receiver_qr_token, created_at'
          )
          .eq('driver_id', driverId)
          .order('created_at', { ascending: false })
          .limit(15),
      ]);

      if (walletRow) {
        const bal = Number(walletRow.balance_usd) || 0;
        setWallet({
          balance_usd: bal,
          cash_orders_blocked: bal < 5.0,
          backhaul_enabled: Boolean(walletRow.backhaul_enabled),
        });
      }
      if (orderRows) {
        const list = orderRows as DriverOrderBreakdown[];
        setOrders(list);
        const active = list.find((o) =>
          ['ACCEPTED', 'EN_ROUTE_PICKUP', 'ARRIVED_PICKUP', 'LOADING_OR_BOARDING', 'IN_TRANSIT', 'ARRIVED_DROPOFF'].includes(
            o.status
          )
        );
        if (active) setActiveOrderId(active.id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (driverId) loadDriverData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverId]);

  const telemetry = useSaraTelemetry({
    orderId: activeOrderId,
    tripState,
    enabled: Boolean(activeOrderId),
    onGeofenceTransition: (nextState, distM) => {
      setTripState(nextState);
      setGeofenceNotice(`Geocerca alcanzada (${Math.round(distM)}m) ➔ ${nextState}`);
      if (nextState === 'ARRIVED_DROPOFF') {
        setEpodOpen(true);
      }
    },
  });

  const handleInstantTopup = async (gateway: 'deuna' | 'payphone') => {
    setTopupLoading(true);
    setTopupFeedback(null);
    try {
      const res = await executeOrchestratedPayment({
        orderId: `TOPUP-${driverId.slice(0, 8)}`,
        amountUsd: topupAmount,
        method: gateway,
        intentType: 'topup',
        description: `Recarga Billetera SARA Conductor ($${topupAmount.toFixed(2)})`,
      });
      if (!res.success) {
        setTopupFeedback(res.error || 'No se pudo iniciar la recarga.');
        return;
      }
      if (res.payphonePayUrl) {
        window.open(res.payphonePayUrl, '_blank', 'noopener,noreferrer');
        setTopupFeedback('Cajita PayPhone abierta. Tu saldo se acreditará automáticamente vía webhook.');
      } else if (res.deunaQrPayload) {
        setTopupFeedback(`QR Deuna! generado (Ref: ${res.gatewayRef}). Escanea para acreditación instantánea.`);
      }
    } finally {
      setTopupLoading(false);
    }
  };

  const handleToggleBackhaul = async () => {
    setBackhaulBusy(true);
    const nextVal = !wallet.backhaul_enabled;
    try {
      await supabase
        .from('fletes_driver_wallets')
        .upsert({ driver_id: driverId, backhaul_enabled: nextVal }, { onConflict: 'driver_id' });
      setWallet((prev) => ({ ...prev, backhaul_enabled: nextVal }));
    } finally {
      setBackhaulBusy(false);
    }
  };

  const activeOrder = orders.find((o) => o.id === activeOrderId) || null;

  return (
    <section className="rounded-3xl border border-amber-500/30 bg-slate-900/90 p-5 sm:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
            SARA FLETES v2.0 · Consola Operativa Real
          </span>
          <h2 className="font-display text-xl font-black text-white mt-0.5">
            Billetera Prepaga, Backhaul, Telemetría RideCheck e Intérprete
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={`px-3 py-1.5 rounded-full font-bold inline-flex items-center gap-1.5 ${
              telemetry.isOnline
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
            }`}
          >
            {telemetry.isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {telemetry.isOnline ? 'Red 4G Activa' : `Offline (${telemetry.offlinePendingCount} en cola IDB)`}
          </span>
          {telemetry.wakeLockActive && (
            <span className="px-3 py-1.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 font-bold inline-flex items-center gap-1">
              <Radio className="w-3.5 h-3.5" /> Wake Lock ON
            </span>
          )}
        </div>
      </div>

      {/* Bloqueo automático si Saldo < $5.00 USD */}
      {wallet.cash_orders_blocked && (
        <div className="rounded-2xl border border-rose-500/50 bg-rose-950/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display text-sm font-black text-rose-200">
                Pedidos en Efectivo Bloqueados (Saldo &lt; $5.00 USD)
              </h3>
              <p className="text-xs text-rose-200/80 mt-0.5">
                Recarga tu Saldo Operativo con QR Deuna! o Tarjeta para desbloquear solicitudes en efectivo al instante.
              </p>
            </div>
          </div>
          <span className="font-mono tabular-nums text-lg font-black text-rose-300 shrink-0">
            ${wallet.balance_usd.toFixed(2)} USD
          </span>
        </div>
      )}

      {geofenceNotice && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-2.5 text-xs text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {geofenceNotice}
        </div>
      )}

      {telemetry.lastAnomaly && (
        <div className="rounded-xl border border-amber-500/50 bg-amber-950/40 px-4 py-3 text-xs text-amber-200 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>RideCheck:</strong> {telemetry.lastAnomaly.message}
          </span>
        </div>
      )}

      {/* Grid Principal: Saldo + Recarga + Backhaul */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Saldo Operativo Real */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
          <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-amber-400" /> Saldo Operativo Real
          </div>
          <div className="font-mono tabular-nums text-3xl font-black text-white">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-amber-400" /> : `$${wallet.balance_usd.toFixed(2)}`}
          </div>
          <p className="text-[11px] text-slate-400">
            Mínimo para aceptar viajes en efectivo: <span className="font-mono text-amber-300">$5.00 USD</span>
          </p>
        </div>

        {/* Recarga Instantánea QR Deuna! / Tarjeta */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Recarga Instantánea</span>
            <select
              value={topupAmount}
              onChange={(e) => setTopupAmount(Number(e.target.value))}
              className="rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 font-mono text-xs text-white"
            >
              {[10, 20, 35, 50, 100].map((v) => (
                <option key={v} value={v}>
                  ${v}.00 USD
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={topupLoading}
              onClick={() => handleInstantTopup('deuna')}
              className="min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4" /> QR Deuna!
            </button>
            <button
              type="button"
              disabled={topupLoading}
              onClick={() => handleInstantTopup('payphone')}
              className="min-h-[44px] rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-sky-400" /> Tarjeta
            </button>
          </div>
          {topupFeedback && <p className="text-[11px] text-amber-300">{topupFeedback}</p>}
        </div>

        {/* Interruptor Flete de Retorno (Backhaul) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Percent className="w-4 h-4" /> Flete de Retorno (Backhaul)
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Publica automáticamente ventana de retorno de 2h (hasta 30% dto.) al aceptar fletes largos.
              </p>
            </div>
            <button
              type="button"
              disabled={backhaulBusy}
              onClick={handleToggleBackhaul}
              className={`min-w-[56px] min-h-[32px] rounded-full px-2 font-black text-[11px] transition-colors cursor-pointer ${
                wallet.backhaul_enabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {wallet.backhaul_enabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {activeOrder && (
            <button
              type="button"
              onClick={() => setEpodOpen(true)}
              className="min-h-[44px] w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" /> Cerrar Viaje con Acta e-POD
            </button>
          )}
        </div>
      </div>

      {/* Intérprete de Voz en Cabina + Desglose Financiero por Viaje */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <LiveTranslatorChat orderId={activeOrderId} role="driver" />

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
          <h3 className="font-display text-sm font-black text-white">
            Desglose Financiero Real por Viaje
          </h3>
          {orders.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Aún no registras órdenes asignadas en <code className="text-amber-300">fletes_orders</code>.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-800">
                  <tr>
                    <th className="py-2 pr-2">Ruta</th>
                    <th className="py-2 px-2 text-right">Cobrado</th>
                    <th className="py-2 px-2 text-right">Comisión SARA</th>
                    <th className="py-2 pl-2 text-right">Ganancia Neta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {orders.map((o) => {
                    const cobrado = Number(o.quoted_price_usd) || 0;
                    const comision = Number((cobrado * (Number(o.commission_rate) || 0.1)).toFixed(2));
                    const neta = Number((cobrado - comision + (Number(o.stevedores_fee_usd) || 0)).toFixed(2));
                    return (
                      <tr key={o.id}>
                        <td className="py-2.5 pr-2">
                          <div className="font-bold text-slate-200 truncate max-w-[180px]">
                            {o.origin_label} ➔ {o.dest_label}
                          </div>
                          <div className="text-[10px] text-slate-500 uppercase">
                            {o.payment_method} · {o.status}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-200">
                          ${cobrado.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums text-rose-400">
                          -${comision.toFixed(2)}
                        </td>
                        <td className="py-2.5 pl-2 text-right font-mono tabular-nums font-bold text-emerald-400">
                          ${neta.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {activeOrder && (
        <DigitalDeliveryAct
          isOpen={epodOpen}
          onClose={() => setEpodOpen(false)}
          orderId={activeOrder.id}
          defaultReceiverName={activeOrder.receiver_name || ''}
          expectedQrToken={activeOrder.receiver_qr_token || undefined}
          onVerified={() => {
            setEpodOpen(false);
            loadDriverData();
          }}
        />
      )}

      <HoldSosButton orderId={activeOrderId} role="driver" />
    </section>
  );
}
