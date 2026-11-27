'use client';

import React, { useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  Share2, 
  PhoneCall, 
  MessageSquare,
  AlertTriangle,
  Camera,
  Volume2,
  VolumeX,
  RotateCw
} from 'lucide-react';
import { SaraMaskedCommModal } from './SaraMaskedCommModal';
import { SaraSafetyCenterModal } from './SaraSafetyCenterModal';
export interface TripDriverOffer {
  id: string;
  driverName: string;
  vehicleName: string;
  plate: string;
  rating: number;
  tripsCount?: number;
  etaMinutes?: number;
  distanceMeters?: number;
  offeredPrice?: number;
  isCounterOffer?: boolean;
  phone?: string;
}

interface SaraActiveTripCardProps {
  activeFreight: {
    id: string;
    origin: string;
    destination: string;
    material: string;
    weight: number;
    referencePrice: number;
    accessCode?: string;
    status: 'searching' | 'accepted' | 'in_transit' | 'delivered' | 'negotiating';
    etaMinutes?: number;
    distanciaKm?: number;
  };
  assignedDriver: TripDriverOffer | null;
  onOpenDriverProfile: () => void;
  onShareWhatsApp: () => void;
  onFinishOrCancel: () => void;
  currentCoords?: [number, number] | null;
  liveTracking?: {
    etaMinutes: number | null;
    distanceMeters: number | null;
    speedKmh: number | null;
    hasArrivedPickup: boolean;
    voiceEnabled: boolean;
    lastAnnouncement: string | null;
    onToggleVoice: () => void;
    onReplayVoice: () => void;
  } | null;
}

export function SaraActiveTripCard({
  activeFreight,
  assignedDriver,
  onOpenDriverProfile,
  onShareWhatsApp,
  onFinishOrCancel,
  currentCoords = null,
  liveTracking = null
}: SaraActiveTripCardProps) {
  const [isCommOpen, setIsCommOpen] = useState(false);
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);

  // Pasos de progreso de viaje
  const currentStep = activeFreight.status === 'delivered' ? 4 : activeFreight.status === 'in_transit' ? 3 : 2;

  const steps = [
    { num: 1, label: 'Asignado', desc: 'Chofer confirmado' },
    { num: 2, label: 'En camino', desc: 'Hacia punto de carga' },
    { num: 3, label: 'Cargando / Ruta', desc: 'Foto origen & tránsito' },
    { num: 4, label: 'Entregado', desc: 'Foto entrega en obra' }
  ];

  return (
    <div className="bg-slate-950 border border-amber-500/50 p-4 rounded-3xl space-y-4 shadow-2xl animate-in fade-in">
      {/* Cabecera con Conductor Asignado */}
      <div className="flex items-center justify-between">
        <div 
          onClick={onOpenDriverProfile}
          className="flex items-center gap-3 cursor-pointer group"
          title="Ver ficha de seguridad del conductor"
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black text-lg shadow-inner group-hover:scale-105 transition-transform">
              {assignedDriver?.driverName?.charAt(0) || 'C'}
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-white text-sm group-hover:text-amber-400 transition-colors">
                {assignedDriver?.driverName || 'David Sarango'}
              </h3>
              <span className="text-[10px] font-bold text-amber-400">★ {assignedDriver?.rating || 4.9}</span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>{assignedDriver?.vehicleName || 'Vehículo Verificado SARA'}</span>
              {assignedDriver?.plate && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="font-mono text-slate-200 font-bold bg-slate-900 px-1 rounded border border-slate-800">
                    {assignedDriver.plate}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenDriverProfile}
          className="text-[10px] text-amber-400 font-bold bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded-lg border border-amber-500/30 transition-colors"
        >
          Ver Ficha ANT
        </button>
      </div>

      {/* PIN DE SEGURIDAD DESTACADO (4 DÍGITOS) */}
      <div
        className={`border-2 p-3.5 rounded-2xl text-center space-y-1 transition-all ${
          liveTracking?.hasArrivedPickup || (liveTracking?.etaMinutes !== null && liveTracking?.etaMinutes !== undefined && liveTracking.etaMinutes <= 1)
            ? 'bg-gradient-to-r from-emerald-500/20 via-slate-900 to-amber-500/20 border-emerald-400 shadow-lg shadow-emerald-500/20'
            : 'bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/15 border-amber-500/50'
        }`}
      >
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          {liveTracking?.hasArrivedPickup
            ? '¡Vehículo en el punto! Muestra tu PIN'
            : 'PIN de Seguridad de Embarque y Entrega'}
        </span>
        <p className="text-3xl font-black font-mono text-white tracking-[0.25em]">
          {activeFreight.accessCode || '—'}
        </p>
        <p className="text-[10px] text-slate-300">
          Entrega este código de 4 dígitos al conductor al iniciar la carga para validar el viaje.
        </p>
      </div>

      {/* CHECKLIST VISUAL DE ESTADOS EN VIVO */}
      <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 mb-2">
          <span>Progreso del Viaje</span>
          <span className="text-emerald-400 font-mono">Paso {currentStep} de 4</span>
        </div>

        <div className="relative flex justify-between">
          <div className="absolute top-3 left-4 right-4 h-0.5 bg-slate-800 -z-0" />
          <div 
            className="absolute top-3 left-4 h-0.5 bg-amber-500 -z-0 transition-all duration-500" 
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          />

          {steps.map((st) => {
            const isDone = st.num < currentStep;
            const isCurrent = st.num === currentStep;

            return (
              <div key={st.num} className="relative z-10 flex flex-col items-center text-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                  isDone 
                    ? 'bg-emerald-500 text-slate-950 font-bold' 
                    : isCurrent 
                    ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 animate-pulse' 
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {isDone ? '✓' : st.num}
                </div>
                <span className={`text-[10px] mt-1.5 font-bold leading-tight ${isCurrent ? 'text-amber-400' : isDone ? 'text-slate-300' : 'text-slate-600'}`}>
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETALLES DE TARIFA Y RUTA */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Tarifa pactada:</span>
          <p className="text-lg font-black font-mono text-emerald-400 mt-0.5">
            ${activeFreight.referencePrice.toFixed(2)} USD
          </p>
          <span className="text-[9px] text-slate-500">Sin cargos ocultos</span>
        </div>

        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] text-slate-400 block">Llegada en vivo:</span>
            {liveTracking && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={liveTracking.onReplayVoice}
                  title="Escuchar tiempo de llegada"
                  className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-300 cursor-pointer"
                >
                  <RotateCw className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={liveTracking.onToggleVoice}
                  title={liveTracking.voiceEnabled ? 'Silenciar avisos de voz' : 'Activar avisos de voz'}
                  className={`p-1 rounded-md cursor-pointer ${
                    liveTracking.voiceEnabled
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {liveTracking.voiceEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                </button>
              </div>
            )}
          </div>
          <p className="text-sm font-black font-mono tabular-nums text-white mt-1 flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                liveTracking?.hasArrivedPickup ? 'bg-emerald-400' : 'bg-cyan-400 animate-ping'
              }`}
            ></span>
            {liveTracking?.hasArrivedPickup
              ? '¡En el punto!'
              : `~${liveTracking?.etaMinutes ?? assignedDriver?.etaMinutes ?? 3} min`}
          </p>
          <span className="text-[9px] text-slate-400 truncate block mt-0.5">
            {liveTracking?.distanceMeters != null
              ? liveTracking.distanceMeters >= 1000
                ? `${(liveTracking.distanceMeters / 1000).toFixed(1)} km restantes`
                : `${Math.round(liveTracking.distanceMeters)} m restantes`
              : activeFreight.material}
          </span>
        </div>
      </div>

      {/* BARRA DE AUDIO ETA EN VIVO */}
      {liveTracking && (
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/25 px-3 py-2 flex items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2 min-w-0">
            <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-cyan-100 truncate">
              {liveTracking.lastAnnouncement || 'Avisos de llegada por voz activos'}
            </span>
          </div>
          <button
            type="button"
            onClick={liveTracking.onReplayVoice}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 font-bold cursor-pointer"
          >
            Escuchar
          </button>
        </div>
      )}

      {/* BOTÓN VERDE DIRECTO: COMPARTIR POR WHATSAPP */}
      <button
        type="button"
        onClick={onShareWhatsApp}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/25 active:scale-95"
      >
        <Share2 className="w-4 h-4 stroke-[2.5]" />
        <span>Compartir viaje por WhatsApp con Obra / Cliente</span>
      </button>

      {/* BOTÓN DE ESCUDO DE SEGURIDAD */}
      <button
        type="button"
        onClick={() => setIsSafetyOpen(true)}
        className="w-full min-h-[44px] bg-slate-900 hover:bg-emerald-950/50 text-emerald-300 border border-emerald-500/40 font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Escudo de Seguridad</span>
      </button>

      {/* ACCIONES DE CONTACTO SEGURO Y FINALIZACIÓN */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => setIsCommOpen(true)}
          className="flex-1 min-h-[44px] bg-slate-900 hover:bg-slate-800 text-slate-200 border border-amber-500/40 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
          <span>Chat / VoIP Seguro</span>
        </button>

        <button
          type="button"
          onClick={onFinishOrCancel}
          className="flex-1 min-h-[44px] bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 font-bold py-2.5 rounded-xl text-xs transition-colors"
        >
          Finalizar / Salir
        </button>
      </div>

      {/* Modal de Comunicación Enmascarada (Chat Efímero + VoIP Proxy) */}
      <SaraMaskedCommModal
        isOpen={isCommOpen}
        onClose={() => setIsCommOpen(false)}
        driverName={assignedDriver?.driverName || 'David Sarango'}
        vehicleName={assignedDriver?.vehicleName || 'Camioneta Pickup'}
        plate={assignedDriver?.plate || 'LBA-4590'}
        tripId={activeFreight.id}
      />

      {/* Modal de Centro de Seguridad (Contactos de Confianza + Audio en Cabina + ECU 911) */}
      <SaraSafetyCenterModal
        isOpen={isSafetyOpen}
        onClose={() => setIsSafetyOpen(false)}
        tripId={activeFreight.id}
        driverName={assignedDriver?.driverName || 'David Sarango'}
        plate={assignedDriver?.plate || 'LBA-4590'}
        currentCoords={currentCoords}
        onShareRouteWithContacts={onShareWhatsApp}
      />
    </div>
  );
}
