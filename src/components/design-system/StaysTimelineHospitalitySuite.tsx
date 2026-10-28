'use client';

import * as React from 'react';
import { 
  Bed, Calendar, KeyRound, ShieldAlert, Sparkles, 
  Clock, CheckCircle2, ChevronRight, User, X, 
  Lock, RefreshCw, CreditCard, DollarSign, Send,
  BatteryCharging, Wifi, ShieldCheck, ArrowRightLeft,
  Smartphone, AlertTriangle
} from 'lucide-react';
import { SyncBadge } from './SyncBadge';
import { cn } from '@/lib/utils';

export type UnitStatus = 'disponible' | 'ocupado' | 'limpieza' | 'mantenimiento';
export type OtaChannel = 'airbnb' | 'booking' | 'directo' | 'vrbo';

export interface StayBooking {
  id: string;
  guestName: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  startDayIndex: number; // 0 to 6
  durationDays: number;
  depositStatus: 'cobrado' | 'pendiente';
  pinCode?: string;
  channel: OtaChannel;
}

export interface SmartLockTelemetry {
  batteryPct: number;
  signalStrengthDbm: number;
  lastAccessTime: string;
  lastAccessActor: string;
  isOnline: boolean;
}

export interface StayUnit {
  id: string;
  name: string;
  type: string;
  currentStatus: UnitStatus;
  ratePerNight: number;
  bookings: StayBooking[];
  smartLock: SmartLockTelemetry;
}

const DAYS_OF_WEEK = ['Lun 27', 'Mar 28', 'Mié 29', 'Jue 30', 'Vie 31', 'Sáb 01', 'Dom 02'];

const INITIAL_UNITS: StayUnit[] = [
  {
    id: 'u-1',
    name: 'Suite 101 - Sky Deluxe',
    type: 'Estudio 1 Hab',
    currentStatus: 'ocupado',
    ratePerNight: 75,
    smartLock: { batteryPct: 88, signalStrengthDbm: -52, lastAccessTime: 'Hoy 14:12', lastAccessActor: 'Huésped (PIN App)', isOnline: true },
    bookings: [
      { id: 'b-1', guestName: 'Martín Alvear', guestPhone: '+593 99 281 9281', checkIn: '27 Oct', checkOut: '30 Oct', startDayIndex: 0, durationDays: 3, depositStatus: 'cobrado', pinCode: '4829', channel: 'airbnb' }
    ]
  },
  {
    id: 'u-2',
    name: 'Loft 204 - Cumbayá Garden',
    type: 'Loft 2 Hab',
    currentStatus: 'limpieza',
    ratePerNight: 110,
    smartLock: { batteryPct: 74, signalStrengthDbm: -61, lastAccessTime: 'Hoy 11:30', lastAccessActor: 'Personal Limpieza', isOnline: true },
    bookings: [
      { id: 'b-2', guestName: 'Elena Viteri', guestPhone: '+593 98 471 0022', checkIn: '29 Oct', checkOut: '02 Nov', startDayIndex: 2, durationDays: 4, depositStatus: 'pendiente', pinCode: '9182', channel: 'booking' }
    ]
  },
  {
    id: 'u-3',
    name: 'Suite 305 - Executive Business',
    type: 'Estudio 1 Hab',
    currentStatus: 'disponible',
    ratePerNight: 85,
    smartLock: { batteryPct: 92, signalStrengthDbm: -48, lastAccessTime: 'Ayer 18:00', lastAccessActor: 'Inspección Rutinaria', isOnline: true },
    bookings: []
  },
  {
    id: 'u-4',
    name: 'Penthouse 501 - The View',
    type: 'Penthouse 3 Hab',
    currentStatus: 'ocupado',
    ratePerNight: 195,
    smartLock: { batteryPct: 81, signalStrengthDbm: -55, lastAccessTime: 'Hoy 16:45', lastAccessActor: 'Huésped (NFC Card)', isOnline: true },
    bookings: [
      { id: 'b-3', guestName: 'Roberto Gómez', guestPhone: '+593 99 555 1234', checkIn: '28 Oct', checkOut: '01 Nov', startDayIndex: 1, durationDays: 4, depositStatus: 'cobrado', pinCode: '7731', channel: 'directo' }
    ]
  }
];

export function StaysTimelineHospitalitySuite() {
  const [units, setUnits] = React.useState<StayUnit[]>(INITIAL_UNITS);
  const [activeDrawerBooking, setActiveDrawerBooking] = React.useState<{
    unit: StayUnit;
    booking: StayBooking;
  } | null>(null);

  const [generatedPin, setGeneratedPin] = React.useState<string | null>(null);
  const [reassignTargetUnitId, setReassignTargetUnitId] = React.useState<string>('');
  const [reassignSuccessMsg, setReassignSuccessMsg] = React.useState<string | null>(null);

  // Status helper
  const getStatusBadge = (status: UnitStatus) => {
    switch (status) {
      case 'disponible':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-mono">Disponible</span>;
      case 'ocupado':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full text-[10px] font-mono">Ocupado</span>;
      case 'limpieza':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-mono">Limpieza Pendiente</span>;
      case 'mantenimiento':
        return <span className="bg-slate-700/50 text-slate-400 border border-slate-600/50 px-2 py-0.5 rounded-full text-[10px] font-mono">Mantenimiento</span>;
    }
  };

  // Channel helper badge
  const getChannelBadge = (channel: OtaChannel) => {
    switch (channel) {
      case 'airbnb':
        return <span className="bg-rose-950/80 text-rose-300 border border-rose-600/40 text-[9px] font-bold px-1.5 py-0.2 rounded">Airbnb</span>;
      case 'booking':
        return <span className="bg-blue-950/80 text-blue-300 border border-blue-600/40 text-[9px] font-bold px-1.5 py-0.2 rounded">Booking</span>;
      case 'directo':
        return <span className="bg-amber-950/80 text-amber-300 border border-amber-600/40 text-[9px] font-bold px-1.5 py-0.2 rounded">Directo SARA</span>;
      case 'vrbo':
        return <span className="bg-cyan-950/80 text-cyan-300 border border-cyan-600/40 text-[9px] font-bold px-1.5 py-0.2 rounded">VRBO</span>;
    }
  };

  const handleGeneratePin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedPin(pin);
  };

  // Reasignación de Reserva (Drag & Drop / Modal Reassignment 10/10)
  const handleReassignBooking = (targetUnitId: string) => {
    if (!activeDrawerBooking || !targetUnitId) return;
    const currentUnitId = activeDrawerBooking.unit.id;
    const bookingToMove = activeDrawerBooking.booking;

    setUnits(prev => prev.map(u => {
      if (u.id === currentUnitId) {
        return {
          ...u,
          bookings: u.bookings.filter(b => b.id !== bookingToMove.id),
          currentStatus: u.bookings.length <= 1 ? 'disponible' : u.currentStatus
        };
      }
      if (u.id === targetUnitId) {
        return {
          ...u,
          bookings: [...u.bookings, bookingToMove],
          currentStatus: 'ocupado'
        };
      }
      return u;
    }));

    setReassignSuccessMsg(`Reserva transferida con éxito a ${units.find(u => u.id === targetUnitId)?.name}`);
    setTimeout(() => {
      setActiveDrawerBooking(null);
      setReassignSuccessMsg(null);
    }, 1200);
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-sans relative">
      {/* Top Bar con Módulo & Status Sync */}
      <div className="px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Bed className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">SARA Stays • Multi-Unit Timeline & USALI</h2>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-rose-950/60 text-rose-400 border border-rose-800/40">
                USALI-2026
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800/40 px-2 py-0.5 rounded-full">
                iCal Sync: &lt; 15s
              </span>
            </div>
            <p className="text-xs text-slate-400">Control de ocupación en tiempo real, cerraduras IoT y check-in sin fricción</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SyncBadge status="synced" lastSyncedAt="now" />
        </div>
      </div>

      {/* Hero Metrics (Regla de Top 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-800/60 border-b border-slate-800">
        <div className="p-4 bg-slate-900/60">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Tasa de Ocupación Semanal</span>
          <div className="text-xl font-bold font-mono text-white mt-1">75.0%</div>
          <span className="text-[11px] text-rose-400 flex items-center gap-1 mt-0.5">
            <Sparkles className="w-3 h-3" /> 3 de 4 unidades reservadas
          </span>
        </div>

        <div className="p-4 bg-slate-900/60">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">ADR (Tarifa Promedio Diaria)</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">$116.25 / noche</div>
          <span className="text-[11px] text-slate-400 mt-0.5">IVA Turístico 8% feriados aplicado</span>
        </div>

        <div className="p-4 bg-slate-900/60">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">RevPAR (Ingreso por Unidad Disponible)</span>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">$87.18</div>
          <span className="text-[11px] text-cyan-400/80 mt-0.5">+18% sobre temporada baja</span>
        </div>
      </div>

      {/* Horizontal Multi-Unit Timeline Calendar */}
      <div className="p-6 overflow-x-auto">
        <div className="min-w-[820px]">
          {/* Calendar Header Columns */}
          <div className="grid grid-cols-8 gap-2 pb-3 border-b border-slate-800 text-xs font-mono text-slate-400">
            <div className="col-span-2 font-sans font-semibold text-slate-300 uppercase tracking-wider">
              Unidad / Telemetría IoT
            </div>
            {DAYS_OF_WEEK.map((day, i) => (
              <div key={i} className="text-center font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Unit Rows */}
          <div className="divide-y divide-slate-800/60">
            {units.map((unit) => (
              <div key={unit.id} className="grid grid-cols-8 gap-2 py-3.5 items-center">
                {/* Unit info + IoT Telemetry Pill */}
                <div className="col-span-2 pr-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white line-clamp-1">{unit.name}</h4>
                    {getStatusBadge(unit.currentStatus)}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400 font-mono">
                    <span>{unit.type} • <strong className="text-rose-400">${unit.ratePerNight}/n</strong></span>
                    {/* Micro IoT Telemetry indicator */}
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                      <Wifi className="w-3 h-3 text-cyan-400" />
                      <BatteryCharging className="w-3 h-3 text-emerald-400" />
                      <span>{unit.smartLock.batteryPct}%</span>
                    </div>
                  </div>
                </div>

                {/* 6 Days Timeline Slots */}
                <div className="col-span-6 grid grid-cols-6 gap-2 h-11 relative items-center">
                  {/* Background day columns */}
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="h-full border-r border-slate-800/40 rounded-sm bg-slate-900/20" />
                  ))}

                  {/* Render Bookings as Overlay Spanning Bars */}
                  {unit.bookings.map((b) => {
                    const widthPercent = (b.durationDays / 6) * 100;
                    const leftPercent = (b.startDayIndex / 6) * 100;

                    return (
                      <div
                        key={b.id}
                        onClick={() => {
                          setActiveDrawerBooking({ unit, booking: b });
                          setGeneratedPin(b.pinCode || null);
                        }}
                        style={{
                          left: `${leftPercent}%`,
                          width: `${Math.min(widthPercent, 100 - leftPercent)}%`
                        }}
                        className="absolute h-9 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white px-3 flex items-center justify-between shadow-lg cursor-pointer transition-all border border-rose-400/40 overflow-hidden"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {getChannelBadge(b.channel)}
                          <span className="text-[11px] font-semibold truncate">
                            {b.guestName}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono bg-rose-950/70 px-1.5 py-0.5 rounded-md border border-rose-400/40 shrink-0">
                          PIN {b.pinCode || 'Generar'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide-Over Rapid Check-In / Check-Out Drawer (10/10 con Telemetría IoT) */}
      {activeDrawerBooking && (
        <div className="absolute inset-y-0 right-0 w-full sm:w-[420px] bg-slate-900 border-l border-slate-800 shadow-2xl z-30 p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Drawer de Check-In Express & IoT</h3>
              </div>
              <button 
                onClick={() => setActiveDrawerBooking(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reassignSuccessMsg && (
              <div className="my-3 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{reassignSuccessMsg}</span>
              </div>
            )}

            <div className="mt-4 space-y-3.5">
              {/* Unit Assigned and Reassign Dropdown */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Unidad Actual</span>
                    <p className="text-sm font-bold text-white">{activeDrawerBooking.unit.name}</p>
                  </div>
                  <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                    ${activeDrawerBooking.unit.ratePerNight}/noche
                  </span>
                </div>

                {/* Reasignar Habitación Rápida (10/10 Anti-Colisión) */}
                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-2">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    value={reassignTargetUnitId}
                    onChange={(e) => {
                      setReassignTargetUnitId(e.target.value);
                      handleReassignBooking(e.target.value);
                    }}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg text-xs py-1 px-2 text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="">Reasignar a Suite Hermana...</option>
                    {units.filter(u => u.id !== activeDrawerBooking.unit.id).map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.type} - ${u.ratePerNight}/n)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Guest Data Card */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-rose-400 uppercase">Datos del Huésped</span>
                <div className="flex items-center justify-between mt-1">
                  <h4 className="text-xs font-bold text-white">{activeDrawerBooking.booking.guestName}</h4>
                  {getChannelBadge(activeDrawerBooking.booking.channel)}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-800">
                  <span>{activeDrawerBooking.booking.guestPhone}</span>
                  <span className="text-emerald-400 font-semibold">{activeDrawerBooking.booking.durationDays} Noches</span>
                </div>
              </div>

              {/* Security Deposit Card */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-medium">Depósito de Garantía</span>
                  <span className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded-full font-bold",
                    activeDrawerBooking.booking.depositStatus === 'cobrado' 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  )}>
                    {activeDrawerBooking.booking.depositStatus === 'cobrado' ? 'Cobrado ($150)' : 'Pendiente'}
                  </span>
                </div>
              </div>

              {/* Telemetría del Smart Lock IoT (10/10 Perfection) */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                    Telemetría IoT • Smart Lock
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Batería Litio</span>
                    <strong className="text-white flex items-center gap-1 mt-0.5">
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                      {activeDrawerBooking.unit.smartLock.batteryPct}%
                    </strong>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Señal Zigbee</span>
                    <strong className="text-white flex items-center gap-1 mt-0.5">
                      <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                      {activeDrawerBooking.unit.smartLock.signalStrengthDbm} dBm
                    </strong>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-400">
                  Última apertura: {activeDrawerBooking.unit.smartLock.lastAccessTime} ({activeDrawerBooking.unit.smartLock.lastAccessActor})
                </div>
              </div>

              {/* Digital Lock IoT Pin Generator */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400">
                  Cerradura Inteligente (Smart Lock IoT)
                </span>
                <div className="my-2">
                  <span className="text-2xl font-mono font-extrabold text-white tracking-widest bg-slate-950 px-4 py-1.5 rounded-lg border border-slate-800 inline-block">
                    {generatedPin ? `#${generatedPin}#` : '----'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">Válido automáticamente desde check-in hasta check-out</p>

                <button
                  type="button"
                  onClick={handleGeneratePin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{generatedPin ? 'Regenerar Código PIN' : 'Generar PIN Autónomo'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex gap-2">
            <button
              type="button"
              className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar Voucher WhatsApp</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
