'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CheckCircle2,
  CreditCard,
  Crosshair,
  FileCheck2,
  FileText,
  Loader2,
  MapPin,
  Percent,
  QrCode,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  AlertTriangle,
} from 'lucide-react';
import ModuleBrandLogo from '@/components/layout/ModuleBrandLogo';
import { createClient } from '@/lib/supabase/client';
import {
  StepCargoSelector,
  FLETE_VEHICLE_OPTIONS,
  type FleteVehicleCategory,
} from '@/components/fletes/StepCargoSelector';
import { DigitalDeliveryAct } from '@/components/fletes/DigitalDeliveryAct';
import { LiveTranslatorChat } from '@/components/fletes/LiveTranslatorChat';
import { VoiceBookingButton, type VoiceBookingParsed } from '@/components/fletes/VoiceBookingButton';
import { HoldSosButton } from '@/components/fletes/HoldSosButton';
import {
  executeOrchestratedPayment,
  calculatePayphoneFeeUsd,
  type PaymentGatewayMethod,
  type DeferredMonths,
  type OrchestratedPaymentResult,
} from '@/lib/payments/paymentOrchestrator';
import type { AiCubingResult } from '@/app/api/fletes/ai-cubing/route';

type VerticalType = 'viajes' | 'mandaditos' | 'fletes' | 'renta';

interface BackhaulOfferItem {
  id: string;
  vehicle_type: string;
  origin_label: string;
  dest_label: string;
  discount_pct: number;
  expires_at: string;
}

const VERTICALS: Array<{ id: VerticalType; label: string; subtitle: string; steps: number }> = [
  { id: 'viajes', label: 'Viajes', subtitle: '2 pasos · Traslado urbano/intercantonal', steps: 2 },
  { id: 'mandaditos', label: 'Mandaditos', subtitle: '2 pasos · Encomiendas exprés', steps: 2 },
  { id: 'fletes', label: 'Fletes MTOP', subtitle: '4 pasos · Carga + IA Foto + e-POD', steps: 4 },
  { id: 'renta', label: 'Renta', subtitle: '4 pasos · Horas/Días + Garantía Kushki', steps: 4 },
];

export function FletesSmartWorkspace() {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  const [vertical, setVertical] = useState<VerticalType>('fletes');
  const [step, setStep] = useState<number>(1);

  // Paso 1: Ruta / Nodo
  const [originLabel, setOriginLabel] = useState('');
  const [destLabel, setDestLabel] = useState('');
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locatingGps, setLocatingGps] = useState(false);

  // Paso 2: Unidad + Copiloto IA Foto
  const [selectedVehicle, setSelectedVehicle] = useState<FleteVehicleCategory>('camioneta');
  const [aiReport, setAiReport] = useState<AiCubingResult | null>(null);

  // Paso 3: Extras / Estibadores / Renta
  const [stevedoresCount, setStevedoresCount] = useState<number>(0);
  const [rentalHours, setRentalHours] = useState<number>(4);
  const [withDriver, setWithDriver] = useState<boolean>(true);
  const [cargoNotes, setCargoNotes] = useState('');

  // Paso 4: Receptor, Pasarela, e-POD, SRI
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentGatewayMethod>('kushki');
  const [kushkiToken, setKushkiToken] = useState('');
  const [deferredMonths, setDeferredMonths] = useState<DeferredMonths>(0);

  // Backhaul
  const [backhaulOffers, setBackhaulOffers] = useState<BackhaulOfferItem[]>([]);
  const [selectedBackhaul, setSelectedBackhaul] = useState<BackhaulOfferItem | null>(null);

  // Estado transaccional real
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [createdQrToken, setCreatedQrToken] = useState<string | undefined>(undefined);
  const [paymentResult, setPaymentResult] = useState<OrchestratedPaymentResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [epodModalOpen, setEpodModalOpen] = useState(false);
  const [epodVerified, setEpodVerified] = useState(false);

  const isFourStepFlow = vertical === 'fletes' || vertical === 'renta';
  const totalSteps = isFourStepFlow ? 4 : 2;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUserId(data.user.id);
        setUserEmail(data.user.email || '');
        fetch('/api/fletes/backhaul')
          .then((r) => (r.ok ? r.json() : null))
          .then((res) => {
            if (res?.offers) setBackhaulOffers(res.offers);
          })
          .catch(() => {});
      }
    });
  }, [supabase]);

  const handleSelectVertical = (next: VerticalType) => {
    setVertical(next);
    setStep(1);
    setErrorMsg(null);
  };

  const captureCurrentGps = (target: 'origin' | 'dest') => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setErrorMsg('Geolocalización no disponible en este navegador.');
      return;
    }
    setLocatingGps(true);
    setErrorMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (target === 'origin') {
          setOriginCoords(coords);
          if (!originLabel) {
            setOriginLabel(`Ubicación GPS (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})`);
          }
        } else {
          setDestCoords(coords);
          if (!destLabel) {
            setDestLabel(`Destino GPS (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})`);
          }
        }
        setLocatingGps(false);
      },
      (err) => {
        setErrorMsg(`No se pudo obtener GPS real: ${err.message}`);
        setLocatingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleVoiceBooking = (booking: VoiceBookingParsed) => {
    setVertical(booking.vertical);
    if (booking.origin_label) setOriginLabel(booking.origin_label);
    if (booking.dest_label) setDestLabel(booking.dest_label);
    if (
      booking.recommended_vehicle_type === 'camioneta' ||
      booking.recommended_vehicle_type === 'camion_3_5t' ||
      booking.recommended_vehicle_type === 'volqueta' ||
      booking.recommended_vehicle_type === 'plataforma'
    ) {
      setSelectedVehicle(booking.recommended_vehicle_type);
    }
    setStevedoresCount(booking.stevedores_count || 0);
    if (booking.rental_hours > 0) setRentalHours(booking.rental_hours);
    if (booking.cargo_notes) setCargoNotes(booking.cargo_notes);
    setStep(booking.vertical === 'fletes' || booking.vertical === 'renta' ? 2 : 1);
  };

  const quotedPriceUsd = useMemo(() => {
    const vehicleSpec =
      FLETE_VEHICLE_OPTIONS.find((v) => v.id === selectedVehicle) || FLETE_VEHICLE_OPTIONS[0];
    let base =
      vertical === 'viajes'
        ? 6.5
        : vertical === 'mandaditos'
          ? 4.5
          : vertical === 'renta'
            ? vehicleSpec.baseRateUsd * Math.max(1, rentalHours) * (withDriver ? 1.15 : 1.0)
            : vehicleSpec.baseRateUsd;

    const stevedoresFee = vertical === 'fletes' ? stevedoresCount * 12 : 0;
    const subtotal = base + stevedoresFee;
    const discountPct = selectedBackhaul ? selectedBackhaul.discount_pct : 0;
    const discounted = subtotal * (1 - discountPct / 100);
    return Number(discounted.toFixed(2));
  }, [vertical, selectedVehicle, rentalHours, withDriver, stevedoresCount, selectedBackhaul]);

  const guaranteeDepositUsd = useMemo(() => {
    if (vertical !== 'renta') return 0;
    return Number((quotedPriceUsd * 0.5).toFixed(2));
  }, [vertical, quotedPriceUsd]);

  const handleCreateOrderAndPay = async () => {
    setErrorMsg(null);
    if (!userId) {
      setErrorMsg('Debes iniciar sesión en SARA-FLETES para crear una orden real y procesar pagos.');
      return;
    }
    if (!originLabel.trim() || !destLabel.trim()) {
      setErrorMsg('Ingresa el origen y el destino de la operación.');
      return;
    }
    if (!originCoords || !destCoords) {
      setErrorMsg(
        'Captura o selecciona coordenadas GPS reales de origen y destino (cero coordenadas simuladas).'
      );
      return;
    }
    if (paymentMethod === 'kushki' && kushkiToken.trim().length < 8) {
      setErrorMsg('Ingresa el token generado por Kushki.js antes de ejecutar el cobro o pre-autorización.');
      return;
    }

    setSubmitting(true);
    try {
      const dbVehicleType =
        vertical === 'viajes' ? 'auto' : vertical === 'mandaditos' ? 'moto' : selectedVehicle;

      // 1. Insertar orden real en Supabase fletes_orders (PostGIS)
      const { data: orderRow, error: orderErr } = await supabase
        .from('fletes_orders')
        .insert({
          customer_id: userId,
          vertical,
          vehicle_type: dbVehicleType,
          origin_label: originLabel.trim(),
          dest_label: destLabel.trim(),
          origin_geog: `SRID=4326;POINT(${originCoords.lng} ${originCoords.lat})`,
          dest_geog: `SRID=4326;POINT(${destCoords.lng} ${destCoords.lat})`,
          stevedores_count: vertical === 'fletes' ? stevedoresCount : 0,
          stevedores_fee_usd: vertical === 'fletes' ? stevedoresCount * 12 : 0,
          rental_hours: vertical === 'renta' ? rentalHours : 0,
          with_driver: withDriver,
          guarantee_deposit_usd: guaranteeDepositUsd,
          quoted_price_usd: quotedPriceUsd,
          backhaul_discount_pct: selectedBackhaul?.discount_pct || 0,
          ai_cubing_report: aiReport || null,
          receiver_name: receiverName.trim() || null,
          receiver_phone: receiverPhone.trim() || null,
          payment_method: paymentMethod,
        })
        .select('id, receiver_qr_token')
        .single();

      if (orderErr || !orderRow) {
        setErrorMsg(orderErr?.message || 'Error creando orden en Supabase.');
        return;
      }

      setCreatedOrderId(orderRow.id);
      setCreatedQrToken(orderRow.receiver_qr_token || undefined);

      // 2. Orquestación multi-pasarela real
      const intentType = vertical === 'renta' && paymentMethod === 'kushki' ? 'preauth' : 'charge';
      const chargeAmount = intentType === 'preauth' ? guaranteeDepositUsd : quotedPriceUsd;

      const payRes = await executeOrchestratedPayment({
        orderId: orderRow.id,
        amountUsd: chargeAmount,
        method: paymentMethod,
        intentType,
        kushkiToken: paymentMethod === 'kushki' ? kushkiToken.trim() : undefined,
        deferredMonths,
        customerEmail: userEmail,
        description: `SARA FLETES (${vertical.toUpperCase()}) ${originLabel} -> ${destLabel}`,
      });

      setPaymentResult(payRes);
      if (!payRes.success) {
        setErrorMsg(payRes.error || 'La pasarela no pudo completar la operación.');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error procesando orden.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Cabecera Corporativa GRUPO SARA + Zero-UI Voice Booking */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <ModuleBrandLogo modulo="fletes" size="sm" showBackToHolding={false} />
          <div className="hidden md:flex items-center gap-2 text-xs">
            <Link
              href="/modulos/fletes"
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              Mapa Radar
            </Link>
            <Link
              href="/modulos/fletes/conductores"
              className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 font-bold transition-colors"
            >
              Panel Conductor
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <VoiceBookingButton onBookingExtracted={handleVoiceBooking} />
          <Link
            href="/"
            className="min-h-[44px] inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white px-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Grupo SARA</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        {/* Selector de Verticales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {VERTICALS.map((v) => {
            const active = vertical === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => handleSelectVertical(v.id)}
                className={`min-h-[68px] text-left rounded-2xl border p-3.5 transition-all cursor-pointer ${
                  active
                    ? 'border-amber-400 bg-amber-500/15 shadow-lg shadow-amber-500/10'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-black text-white">{v.label}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300">
                    {v.steps} pasos
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{v.subtitle}</p>
              </button>
            );
          })}
        </div>

        {/* Ventana de Fletes de Retorno (Backhaul Matching — hasta 30% descuento) */}
        {backhaulOffers.length > 0 && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
                <Percent className="w-4 h-4" />
                Fletes de Retorno Disponibles (Backhaul — Cero Km en Vacío)
              </div>
              <span className="text-[11px] text-slate-400">Ventana activa 2h</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {backhaulOffers.slice(0, 4).map((offer) => {
                const chosen = selectedBackhaul?.id === offer.id;
                return (
                  <button
                    key={offer.id}
                    type="button"
                    onClick={() => {
                      setSelectedBackhaul(chosen ? null : offer);
                      if (!chosen) {
                        setOriginLabel(offer.origin_label);
                        setDestLabel(offer.dest_label);
                      }
                    }}
                    className={`min-h-[54px] text-left rounded-xl border px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer ${
                      chosen
                        ? 'border-emerald-400 bg-emerald-500/20'
                        : 'border-slate-800 bg-slate-900/80 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {offer.origin_label} ➔ {offer.dest_label}
                      </div>
                      <div className="text-[11px] text-slate-400 uppercase">{offer.vehicle_type}</div>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-mono font-black text-xs">
                      -{offer.discount_pct}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Smart Stepper Contextual */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 space-y-6">
            {/* Indicador de pasos */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                  Paso {step} de {totalSteps}
                </div>
                <h1 className="font-display text-xl font-black text-white mt-0.5">
                  {step === 1 && 'Ruta y Coordenadas Reales'}
                  {step === 2 && (isFourStepFlow ? 'Unidad + Copiloto IA de Cubicaje' : 'Tarifa y Pago')}
                  {step === 3 && 'Extras, Estibadores y Condiciones'}
                  {step === 4 && 'Tarifa, Garantía Kushki, e-POD y Factura SRI'}
                </h1>
              </div>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalSteps }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all ${
                      idx + 1 <= step ? 'w-7 bg-amber-400' : 'w-2 bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* PASO 1: RUTA */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Origen / Punto de Carga</span>
                    <button
                      type="button"
                      disabled={locatingGps}
                      onClick={() => captureCurrentGps('origin')}
                      className="text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Crosshair className="w-3.5 h-3.5" /> Usar mi GPS real
                    </button>
                  </label>
                  <input
                    type="text"
                    value={originLabel}
                    onChange={(e) => setOriginLabel(e.target.value)}
                    placeholder="Ej. Cantera Bella María, Km 12 Vía a Daule"
                    className="w-full min-h-[46px] rounded-xl border border-slate-700 bg-slate-950 px-3.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                  {originCoords && (
                    <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      GPS verificado: {originCoords.lat.toFixed(6)}, {originCoords.lng.toFixed(6)}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Destino / Obra de Descarga</span>
                    <button
                      type="button"
                      disabled={locatingGps}
                      onClick={() => captureCurrentGps('dest')}
                      className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Crosshair className="w-3.5 h-3.5" /> Fijar GPS actual
                    </button>
                  </label>
                  <input
                    type="text"
                    value={destLabel}
                    onChange={(e) => setDestLabel(e.target.value)}
                    placeholder="Ej. Obra Norte, Av. Eloy Alfaro y Granados"
                    className="w-full min-h-[46px] rounded-xl border border-slate-700 bg-slate-950 px-3.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                  {destCoords && (
                    <div className="text-[11px] font-mono text-sky-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      GPS verificado: {destCoords.lat.toFixed(6)}, {destCoords.lng.toFixed(6)}
                    </div>
                  )}
                </div>

                {cargoNotes && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Nota capturada por Voz IA: {cargoNotes}</span>
                  </div>
                )}
              </div>
            )}

            {/* PASO 2 (SOLO 4 PASOS): UNIDAD + COPILOTO IA FOTO */}
            {step === 2 && isFourStepFlow && (
              <StepCargoSelector
                vertical={vertical}
                selectedVehicle={selectedVehicle}
                onSelectVehicle={setSelectedVehicle}
                aiReport={aiReport}
                onAiCubingApplied={(report) => {
                  setAiReport(report);
                  setStevedoresCount(report.recommended_stevedores);
                }}
              />
            )}

            {/* PASO 3 (SOLO 4 PASOS): EXTRAS / ESTIBADORES / RENTA */}
            {step === 3 && isFourStepFlow && (
              <div className="space-y-5">
                {vertical === 'fletes' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-400" />
                        Estibadores Auxiliares ($12.00 c/u)
                      </label>
                      {aiReport && (
                        <span className="text-[11px] text-emerald-400 font-semibold">
                          IA sugirió {aiReport.recommended_stevedores} estibador(es)
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setStevedoresCount(n)}
                          className={`min-h-[48px] rounded-xl font-mono font-black text-sm border cursor-pointer ${
                            stevedoresCount === n
                              ? 'border-amber-400 bg-amber-500 text-slate-950'
                              : 'border-slate-800 bg-slate-950 text-slate-300'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-2">
                        Duración de Renta (Horas)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={240}
                        value={rentalHours}
                        onChange={(e) => setRentalHours(Math.max(1, Number(e.target.value) || 1))}
                        className="w-full min-h-[46px] rounded-xl border border-slate-700 bg-slate-950 px-3.5 font-mono text-sm text-white"
                      />
                    </div>
                    <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={withDriver}
                        onChange={(e) => setWithDriver(e.target.checked)}
                        className="w-4 h-4 accent-amber-500"
                      />
                      <span className="text-xs font-bold text-slate-200">
                        Incluir chofer profesional SARA (licencia profesional ANT)
                      </span>
                    </label>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Instrucciones de carga / acceso a obra
                  </label>
                  <textarea
                    rows={3}
                    value={cargoNotes}
                    onChange={(e) => setCargoNotes(e.target.value)}
                    placeholder="Ej. Ingreso por portón sur, requiere casco y botas punta de acero."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* PASO FINAL (Paso 2 en 2-step, Paso 4 en 4-step): TARIFA, GARANTÍA, e-POD, PAGO */}
            {step === totalSteps && (
              <div className="space-y-5">
                {isFourStepFlow && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Receptor Autorizado en Obra (e-POD)
                      </label>
                      <input
                        type="text"
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        placeholder="Nombre del residente / bodeguero"
                        className="w-full min-h-[44px] rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Teléfono del Receptor
                      </label>
                      <input
                        type="tel"
                        value={receiverPhone}
                        onChange={(e) => setReceiverPhone(e.target.value)}
                        placeholder="09XXXXXXXX"
                        className="w-full min-h-[44px] rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Selector Multi-Pasarela Ecuador */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                    Método de Pago Real (Ecuador)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'kushki' as const, label: 'Kushki 1-Clic', icon: CreditCard },
                      { id: 'payphone' as const, label: 'PayPhone', icon: ShieldCheck },
                      { id: 'deuna' as const, label: 'Deuna! QR', icon: QrCode },
                      { id: 'cash' as const, label: 'Efectivo', icon: Banknote },
                    ].map((gw) => {
                      const Icon = gw.icon;
                      const active = paymentMethod === gw.id;
                      return (
                        <button
                          key={gw.id}
                          type="button"
                          onClick={() => setPaymentMethod(gw.id)}
                          className={`min-h-[54px] rounded-xl border p-2.5 flex flex-col items-center justify-center gap-1 text-xs font-bold cursor-pointer ${
                            active
                              ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                              : 'border-slate-800 bg-slate-950 text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{gw.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {paymentMethod === 'kushki' && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Token Kushki.js (PCI DSS — nunca ingreses PAN en texto claro)
                      </label>
                      <input
                        type="text"
                        value={kushkiToken}
                        onChange={(e) => setKushkiToken(e.target.value)}
                        placeholder="Token generado por Kushki.js en cliente"
                        className="w-full min-h-[44px] rounded-xl border border-slate-700 bg-slate-900 px-3 font-mono text-xs text-white"
                      />
                    </div>
                    {vertical !== 'renta' ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-slate-400">Diferido:</span>
                        {([0, 3, 6, 9, 12] as DeferredMonths[]).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setDeferredMonths(m)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border cursor-pointer ${
                              deferredMonths === m
                                ? 'border-amber-400 bg-amber-500 text-slate-950'
                                : 'border-slate-700 bg-slate-900 text-slate-300'
                            }`}
                          >
                            {m === 0 ? 'Corriente' : `${m}m`}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-amber-300">
                        Se ejecutará una <strong>Pre-autorización Kushki</strong> de garantía por{' '}
                        <span className="font-mono font-bold">${guaranteeDepositUsd.toFixed(2)} USD</span> (vigente hasta 7 días calendario), liberada o capturada al cerrar el e-POD.
                      </p>
                    )}
                  </div>
                )}

                {paymentMethod === 'payphone' && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300">
                    PayPhone (sin mensualidad · comisión referencial 5% + IVA:{' '}
                    <span className="font-mono font-bold text-amber-300">
                      ${calculatePayphoneFeeUsd(quotedPriceUsd).totalFeeUsd.toFixed(2)} USD
                    </span>
                    ). Al confirmar serás redirigido a la cajita oficial de PayPhone.
                  </div>
                )}

                {errorMsg && (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-950/50 p-3 text-xs text-rose-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {paymentResult?.success && (
                  <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      Orden creada ({paymentResult.gatewayUsed.toUpperCase()} · {paymentResult.status})
                    </div>
                    {paymentResult.fallbackTriggered && (
                      <p className="text-xs text-amber-300">
                        Fallback automático activado silenciosamente hacia PayPhone.
                      </p>
                    )}
                    {paymentResult.payphonePayUrl && (
                      <a
                        href={paymentResult.payphonePayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[44px] w-full rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center"
                      >
                        Abrir Cajita Oficial PayPhone
                      </a>
                    )}
                    {paymentResult.deunaQrPayload && (
                      <div className="rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-slate-200 break-all">
                        QR Deuna! Ref: {paymentResult.gatewayRef}
                      </div>
                    )}
                    {createdOrderId && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEpodModalOpen(true)}
                          className="min-h-[44px] flex-1 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <FileCheck2 className="w-4 h-4" />
                          {epodVerified ? 'e-POD Certificado ✅' : 'Abrir Acta e-POD'}
                        </button>
                        {epodVerified && (
                          <Link
                            href="/modulos/facturacion"
                            className="min-h-[44px] px-4 rounded-xl border border-amber-400/50 text-amber-300 font-bold text-xs inline-flex items-center gap-1.5"
                          >
                            <FileText className="w-4 h-4" /> Factura Electrónica SRI
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Navegación del Stepper */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                disabled={step === 1}
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                className="min-h-[46px] px-4 rounded-xl border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Anterior
              </button>

              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(totalSteps, s + 1))}
                  className="min-h-[46px] px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Siguiente <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleCreateOrderAndPay}
                  className="min-h-[46px] px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-black text-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Procesando...
                    </>
                  ) : (
                    <>
                      Confirmar y Pagar{' '}
                      <span className="font-mono tabular-nums">${quotedPriceUsd.toFixed(2)}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Columna Lateral: Resumen Financiero + Intérprete Simultáneo */}
          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                <Truck className="w-4 h-4" /> Resumen de Operación
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Vertical</span>
                  <span className="font-bold text-white uppercase">{vertical}</span>
                </div>
                {isFourStepFlow && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Unidad</span>
                    <span className="font-bold text-white">{selectedVehicle}</span>
                  </div>
                )}
                {vertical === 'fletes' && stevedoresCount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estibadores ({stevedoresCount})</span>
                    <span className="font-mono text-white">${(stevedoresCount * 12).toFixed(2)}</span>
                  </div>
                )}
                {selectedBackhaul && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Descuento Backhaul</span>
                    <span className="font-mono font-bold">-{selectedBackhaul.discount_pct}%</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                  <span className="font-bold text-slate-300">Total Estimado</span>
                  <span className="font-mono tabular-nums text-2xl font-black text-amber-400">
                    ${quotedPriceUsd.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <LiveTranslatorChat orderId={createdOrderId} role="customer" />
          </div>
        </div>
      </div>

      {createdOrderId && (
        <DigitalDeliveryAct
          isOpen={epodModalOpen}
          onClose={() => setEpodModalOpen(false)}
          orderId={createdOrderId}
          defaultReceiverName={receiverName}
          expectedQrToken={createdQrToken}
          onVerified={() => setEpodVerified(true)}
        />
      )}

      <HoldSosButton orderId={createdOrderId} role="customer" />
    </main>
  );
}
