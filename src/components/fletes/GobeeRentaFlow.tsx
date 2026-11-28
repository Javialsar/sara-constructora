'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  MapPin,
  KeyRound,
  UserCheck,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Navigation,
  ChevronRight,
  Camera,
  Clock,
  Star,
  AlertCircle
} from 'lucide-react';
import SaraFreightPaymentGatewayModal from './SaraFreightPaymentGatewayModal';

export interface RentaVehicleItem {
  id: string;
  placa: string;
  conductorId?: string | null;
  nombrePropietario: string;
  telefonoPropietario: string;
  marca: string;
  modelo: string;
  anio: number;
  categoria: string;
  tipoVehiculoLabel: string;
  icono: string;
  tarifaHora: number;
  tarifaDia: number;
  depositoGarantia: number;
  permiteSinChofer: boolean;
  calificacion: number;
  ciudad: string;
  sectorAproximado: string;
  lat: number;
  lng: number;
}

export interface RentaVoucherData {
  id: string;
  codigoReserva: string;
  placa: string;
  vehiculoNombre: string;
  propietarioNombre: string;
  propietarioTelefono: string;
  ciudad: string;
  lugarEntrega: string;
  lat: number;
  lng: number;
  fechaInicio: string;
  fechaFin: string;
  duracionTexto: string;
  conChofer: boolean;
  tarifaTotal: number;
  abonoPagadoUSD: number;
  saldoRetiroUSD: number;
  depositoGarantia: number;
  referenciaAbono?: string;
}

interface GobeeRentaFlowProps {
  defaultCity?: string;
  clientName?: string;
  clientPhone?: string;
  onFocusPickupOnMap: (lat: number, lng: number, label: string) => void;
}

const POPULAR_CITIES = ['Quito', 'Guayaquil', 'Cuenca', 'Loja', 'Cariamanga', 'Manta'];

function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function GobeeRentaFlow({
  defaultCity = 'Loja',
  clientName = 'Cliente GoBee',
  clientPhone = '',
  onFocusPickupOnMap,
}: GobeeRentaFlowProps) {
  const todayStr = useMemo(() => toDateInputValue(new Date()), []);
  const tomorrowStr = useMemo(() => toDateInputValue(new Date(Date.now() + 86400000)), []);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [ciudad, setCiudad] = useState(defaultCity || 'Loja');
  const [modoDuracion, setModoDuracion] = useState<'DIAS' | 'HORAS'>('DIAS');
  const [fechaInicio, setFechaInicio] = useState(todayStr);
  const [fechaFin, setFechaFin] = useState(tomorrowStr);
  const [horasSeleccionadas, setHorasSeleccionadas] = useState<number>(4);
  const [conChofer, setConChofer] = useState<boolean>(false);

  const [vehicles, setVehicles] = useState<RentaVehicleItem[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<RentaVehicleItem | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);
  const [voucher, setVoucher] = useState<RentaVoucherData | null>(null);

  useEffect(() => {
    if (defaultCity && !ciudad) setCiudad(defaultCity);
  }, [defaultCity]);

  // Calcular días/horas y fechas ISO exactas
  const dateRange = useMemo(() => {
    if (modoDuracion === 'HORAS') {
      const start = new Date();
      const end = new Date(start.getTime() + horasSeleccionadas * 3600000);
      return {
        startIso: start.toISOString(),
        endIso: end.toISOString(),
        duracionValor: horasSeleccionadas,
        duracionLabel: `${horasSeleccionadas} horas (Hoy)`,
      };
    }
    const start = new Date(`${fechaInicio}T09:00:00`);
    let end = new Date(`${fechaFin}T09:00:00`);
    if (isNaN(end.getTime()) || end.getTime() <= start.getTime()) {
      end = new Date(start.getTime() + 86400000);
    }
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
    return {
      startIso: start.toISOString(),
      endIso: end.toISOString(),
      duracionValor: days,
      duracionLabel: `${days} ${days === 1 ? 'día' : 'días'}`,
    };
  }, [modoDuracion, horasSeleccionadas, fechaInicio, fechaFin]);

  // Calcular tarifa total, abono obligatorio 20% y saldo 80%
  const pricing = useMemo(() => {
    if (!selectedVehicle) return null;
    const base =
      modoDuracion === 'HORAS'
        ? selectedVehicle.tarifaHora * dateRange.duracionValor
        : selectedVehicle.tarifaDia * dateRange.duracionValor;
    const descuentoSemana = modoDuracion === 'DIAS' && dateRange.duracionValor >= 7 ? base * 0.15 : 0;
    const suplementoChofer = conChofer
      ? modoDuracion === 'HORAS'
        ? 6 * dateRange.duracionValor
        : 25 * dateRange.duracionValor
      : 0;
    const tarifaTotal = +(base - descuentoSemana + suplementoChofer).toFixed(2);
    const abono20 = +(tarifaTotal * 0.2).toFixed(2);
    const saldo80 = +(tarifaTotal - abono20).toFixed(2);
    return {
      tarifaTotal,
      abono20,
      saldo80,
      depositoGarantia: conChofer ? 0 : selectedVehicle.depositoGarantia,
    };
  }, [selectedVehicle, modoDuracion, dateRange.duracionValor, conChofer]);

  const handleSearchVehicles = async () => {
    setErrorMsg(null);
    setLoadingVehicles(true);
    try {
      const qs = new URLSearchParams({
        ciudad: ciudad.trim() || 'Todas',
        fechaInicio: dateRange.startIso,
        fechaFin: dateRange.endIso,
      });
      const res = await fetch(`/api/fletes/renta?${qs.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      const list: RentaVehicleItem[] = Array.isArray(data?.vehicles) ? data.vehicles : [];
      setVehicles(list);
      setSelectedVehicle(list[0] || null);
      setStep(2);
    } catch {
      setErrorMsg('No pudimos consultar la disponibilidad. Intenta nuevamente.');
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleFinalizeAfterDeposit = async (paymentRef: string) => {
    if (!selectedVehicle || !pricing) return;
    setIsCreatingReservation(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/fletes/renta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placa: selectedVehicle.placa,
          conductorId: selectedVehicle.conductorId,
          nombrePropietario: selectedVehicle.nombrePropietario,
          telefonoPropietario: selectedVehicle.telefonoPropietario,
          marca: selectedVehicle.marca,
          modelo: selectedVehicle.modelo,
          anio: selectedVehicle.anio,
          categoria: selectedVehicle.categoria,
          vehiculoNombre: selectedVehicle.tipoVehiculoLabel,
          tarifaHora: selectedVehicle.tarifaHora,
          tarifaDia: selectedVehicle.tarifaDia,
          ciudad: selectedVehicle.ciudad || ciudad,
          lat: selectedVehicle.lat,
          lng: selectedVehicle.lng,
          lugarEntrega: `${selectedVehicle.sectorAproximado} (${selectedVehicle.ciudad})`,
          modalidadRenta: conChofer ? 'CON_CHOFER' : 'SIN_CHOFER',
          duracionTipo: modoDuracion,
          duracionValor: dateRange.duracionValor,
          fechaInicio: dateRange.startIso,
          fechaFin: dateRange.endIso,
          tarifaTotal: pricing.tarifaTotal,
          depositoGarantia: pricing.depositoGarantia,
          clienteNombre: clientName,
          clienteTelefono: clientPhone,
          referenciaAbono: paymentRef,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setErrorMsg(data?.error || 'No se pudo confirmar la reserva. Intenta nuevamente.');
        return;
      }
      setVoucher(data.reservation);
    } catch {
      setErrorMsg('Error de conexión confirmando tu reserva.');
    } finally {
      setIsCreatingReservation(false);
    }
  };

  // =========================================================================
  // VISTA FINAL: PASE DIGITAL DE RESERVA (eVOUCHER + VER EN EL MAPA)
  // =========================================================================
  if (voucher) {
    return (
      <div className="bg-slate-950 border-2 border-emerald-500/60 p-4 rounded-2xl space-y-3 animate-in fade-in duration-200">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Reserva Confirmada
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-400">
            Placa: {voucher.placa}
          </span>
        </div>

        <div className="bg-emerald-950/35 border border-emerald-500/40 p-3 rounded-xl text-center">
          <p className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
            Código Único de Retiro Presencial
          </p>
          <p className="text-2xl font-black text-emerald-300 font-mono tracking-widest mt-0.5">
            {voucher.codigoReserva}
          </p>
          <p className="text-[10px] text-slate-300 mt-1">
            Presenta este código al propietario para retirar tu vehículo
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-1.5 text-xs">
          <p className="font-black text-white">{voucher.vehiculoNombre}</p>
          <p className="text-[11px] text-slate-300">
            📍 <strong className="text-white">Punto de retiro:</strong> {voucher.lugarEntrega}
          </p>
          <p className="text-[11px] text-slate-300">
            🗓️ <strong className="text-white">Duración:</strong> {voucher.duracionTexto} ·{' '}
            {voucher.conChofer ? 'Con Chofer' : 'Sin Chofer'}
          </p>
          <p className="text-[11px] text-slate-300">
            👤 <strong className="text-white">Propietario:</strong> {voucher.propietarioNombre}
            {voucher.propietarioTelefono ? ` · ${voucher.propietarioTelefono}` : ''}
          </p>
          <div className="pt-2 mt-1 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 block">Abono pagado (20%)</span>
              <span className="font-mono font-black text-emerald-400">${voucher.abonoPagadoUSD.toFixed(2)} USD</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block">Saldo al retirar (80%)</span>
              <span className="font-mono font-black text-[#FDBE3B]">${voucher.saldoRetiroUSD.toFixed(2)} USD</span>
            </div>
          </div>
        </div>

        {/* Botones de Ubicación Exacta en el Mapa + Google Maps */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              onFocusPickupOnMap(
                voucher.lat,
                voucher.lng,
                `Retiro ${voucher.codigoReserva} · ${voucher.vehiculoNombre}`
              )
            }
            className="min-h-[42px] bg-[#FDBE3B] hover:bg-[#F5B024] text-[#111827] font-black text-xs rounded-xl px-3 py-2 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <MapPin className="w-4 h-4" />
            <span>Ver en el Mapa</span>
          </button>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${voucher.lat},${voucher.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[42px] bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl px-3 py-2 flex items-center justify-center gap-1.5 border border-slate-700"
          >
            <Navigation className="w-3.5 h-3.5 text-sky-400" />
            <span>Cómo llegar</span>
          </a>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 flex items-start gap-2 text-[10px] text-slate-400">
          <Camera className="w-4 h-4 text-[#FDBE3B] shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-200">Tip GoBee (estándar Turo):</strong> al retirar el vehículo, toma fotos del exterior, odómetro y combustible. Cancelación gratuita hasta 48h antes.
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setVoucher(null);
            setStep(1);
          }}
          className="w-full text-center text-xs text-[#FDBE3B] hover:underline font-bold pt-1 cursor-pointer"
        >
          Hacer otra reserva
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {errorMsg && (
        <div className="bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs rounded-xl p-2.5 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PASO 1: ¿EN QUÉ CIUDAD Y FECHAS NECESITAS EL VEHÍCULO?                */}
      {/* ===================================================================== */}
      {step === 1 && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2.5">
            <label className="text-[10px] font-black uppercase text-[#FDBE3B] tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              ¿En qué ciudad vas a rentar?
            </label>

            <input
              type="text"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              placeholder="Ej. Quito, Loja, Guayaquil, Cuenca..."
              className="w-full min-h-[42px] bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FDBE3B] select-text"
            />

            <div className="flex flex-wrap gap-1.5">
              {POPULAR_CITIES.map((c) => {
                const active = ciudad.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCiudad(c)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      active
                        ? 'bg-[#FDBE3B] text-[#111827] border-[#FDBE3B]'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calendario de Fechas o Por Horas */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#FDBE3B]" />
                Fechas de Renta
              </label>
              <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setModoDuracion('DIAS')}
                  className={`px-2.5 py-1 rounded-md cursor-pointer ${
                    modoDuracion === 'DIAS' ? 'bg-[#FDBE3B] text-[#111827] font-black' : 'text-slate-400'
                  }`}
                >
                  Por Días
                </button>
                <button
                  type="button"
                  onClick={() => setModoDuracion('HORAS')}
                  className={`px-2.5 py-1 rounded-md cursor-pointer ${
                    modoDuracion === 'HORAS' ? 'bg-[#FDBE3B] text-[#111827] font-black' : 'text-slate-400'
                  }`}
                >
                  Por Horas
                </button>
              </div>
            </div>

            {modoDuracion === 'DIAS' ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Recogida</span>
                  <input
                    type="date"
                    min={todayStr}
                    value={fechaInicio}
                    onChange={(e) => {
                      setFechaInicio(e.target.value);
                      if (e.target.value >= fechaFin) {
                        const next = new Date(`${e.target.value}T09:00:00`);
                        next.setDate(next.getDate() + 1);
                        setFechaFin(toDateInputValue(next));
                      }
                    }}
                    className="w-full min-h-[40px] bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FDBE3B]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Devolución</span>
                  <input
                    type="date"
                    min={fechaInicio || todayStr}
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full min-h-[40px] bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FDBE3B]"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {[2, 4, 8].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHorasSeleccionadas(h)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      horasSeleccionadas === h
                        ? 'bg-[#FDBE3B]/20 border-[#FDBE3B] text-[#FDBE3B] font-black'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-3 h-3 inline mr-1" />
                    {h}h hoy
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={loadingVehicles || !ciudad.trim()}
            onClick={handleSearchVehicles}
            className="w-full min-h-[46px] bg-[#FDBE3B] hover:bg-[#F5B024] disabled:bg-slate-800 disabled:text-slate-500 text-[#111827] font-black py-3 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] cursor-pointer"
          >
            {loadingVehicles ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Buscando vehículos libres...</span>
              </>
            ) : (
              <>
                <span>Ver Vehículos Disponibles</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PASO 2: VEHÍCULOS REALES DISPONIBLES EN ESA CIUDAD Y FECHAS           */}
      {/* ===================================================================== */}
      {step === 2 && (
        <div className="space-y-2.5 animate-in fade-in duration-200">
          <div className="bg-slate-950/90 px-3 py-2 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 cursor-pointer"
            >
              ← Cambiar
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-white truncate">📍 {ciudad}</p>
              <p className="text-[10px] text-slate-400 truncate">
                {modoDuracion === 'DIAS' ? `${fechaInicio} → ${fechaFin}` : 'Hoy'} · {dateRange.duracionLabel}
              </p>
            </div>
            <span className="shrink-0 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
              {vehicles.length} libre{vehicles.length === 1 ? '' : 's'}
            </span>
          </div>

          {vehicles.length === 0 ? (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
              <p className="text-sm font-black text-white">Sin vehículos disponibles en {ciudad}</p>
              <p className="text-xs text-slate-400">
                No encontramos unidades con el servicio de <strong>Renta</strong> activo y libres para esas fechas. Prueba otra ciudad o fecha.
              </p>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-1 px-4 py-2 rounded-xl bg-[#FDBE3B] text-[#111827] font-black text-xs cursor-pointer"
              >
                Cambiar ciudad o fechas
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
                {vehicles.map((v) => {
                  const isSel = selectedVehicle?.placa === v.placa;
                  return (
                    <button
                      key={v.placa}
                      type="button"
                      onClick={() => setSelectedVehicle(v)}
                      className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSel
                          ? 'bg-[#FDBE3B]/12 border-[#FDBE3B] ring-1 ring-[#FDBE3B]/50'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl shrink-0">{v.icono}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-white truncate">{v.tipoVehiculoLabel}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {v.nombrePropietario} · <span className="font-mono text-slate-300">{v.placa}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                            <span className="text-amber-400 font-bold flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400" /> {v.calificacion.toFixed(1)}
                            </span>
                            <span className="text-emerald-400 font-bold">✓ Cancelación 48h</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-mono font-black text-[#FDBE3B]">
                          ${(modoDuracion === 'HORAS' ? v.tarifaHora : v.tarifaDia).toFixed(0)}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          /{modoDuracion === 'HORAS' ? 'hora' : 'día'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Switch Con/Sin Chofer */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#FDBE3B]" />
                    ¿Con Chofer Profesional?
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {conChofer ? 'Incluye conductor certificado (sin garantía).' : 'Conducción libre (requiere garantía al retirar).'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConChofer(!conChofer)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center cursor-pointer ${
                    conChofer ? 'bg-[#FDBE3B] justify-end' : 'bg-slate-800 justify-start'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-950 shadow-md" />
                </button>
              </div>

              <button
                type="button"
                disabled={!selectedVehicle}
                onClick={() => setStep(3)}
                className="w-full min-h-[46px] bg-[#FDBE3B] hover:bg-[#F5B024] text-[#111827] font-black py-3 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <span>Continuar al Abono (20%)</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* PASO 3: ABONO OBLIGATORIO (20%) Y RESERVA EN FIRME                    */}
      {/* ===================================================================== */}
      {step === 3 && selectedVehicle && pricing && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
              >
                ← Cambiar vehículo
              </button>
              <span className="text-[10px] font-mono font-bold text-[#FDBE3B] bg-[#FDBE3B]/10 px-2 py-0.5 rounded-lg">
                {dateRange.duracionLabel}
              </span>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <span className="text-2xl">{selectedVehicle.icono}</span>
              <div className="min-w-0">
                <p className="text-sm font-black text-white truncate">{selectedVehicle.tipoVehiculoLabel}</p>
                <p className="text-[11px] text-slate-400 truncate">
                  {selectedVehicle.ciudad} · {selectedVehicle.placa} · {conChofer ? 'Con Chofer' : 'Sin Chofer'}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-2.5 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Total de la renta</span>
                <span className="font-mono font-bold text-white">${pricing.tarifaTotal.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-black">
                <span>Abono para reservar ahora (20%)</span>
                <span className="font-mono">${pricing.abono20.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Saldo a pagar al retirar (80%)</span>
                <span className="font-mono">${pricing.saldo80.toFixed(2)} USD</span>
              </div>
              {pricing.depositoGarantia > 0 && (
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Garantía reembolsable (al retirar)</span>
                  <span className="font-mono">${pricing.depositoGarantia.toFixed(2)} USD</span>
                </div>
              )}
            </div>

            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-2 text-[10px] text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                Bloqueo inmediato en calendario + ubicación exacta en mapa al confirmar tu abono. Cancelación gratis 48h antes.
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={isCreatingReservation}
            onClick={() => setIsGatewayOpen(true)}
            className="w-full min-h-[48px] bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 font-black py-3 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-[0.99] cursor-pointer"
          >
            {isCreatingReservation ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generando Código y Bloqueando Unidad...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Pagar Abono (${pricing.abono20.toFixed(2)}) y Reservar</span>
              </>
            )}
          </button>

          {isGatewayOpen && (
            <SaraFreightPaymentGatewayModal
              isOpen={isGatewayOpen}
              initialMethod="tarjeta"
              onClose={() => setIsGatewayOpen(false)}
              onPaymentSuccess={(details) => {
                setIsGatewayOpen(false);
                void handleFinalizeAfterDeposit(details.reference);
              }}
              amount={pricing.abono20}
              driverName={selectedVehicle.nombrePropietario}
              driverPlate={selectedVehicle.placa}
              driverVehicle={`Abono 20% Renta · ${selectedVehicle.tipoVehiculoLabel}`}
              fleteId={`RNT-${selectedVehicle.placa}`}
            />
          )}
        </div>
      )}
    </div>
  );
}
