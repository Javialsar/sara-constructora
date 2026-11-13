'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AlertOctagon, PhoneCall, ShieldAlert, X, Volume2, VolumeX, CheckCircle2 } from 'lucide-react';
import { SaraFletesRealtimeService, SOSAlertData } from '@/lib/services/saraFletesRealtimeService';
import { dispatchSosAlertAction } from '@/app/actions/saraFletesWalletActions';

interface SaraFloatingSosButtonProps {
  plate?: string;
  driverName?: string;
  currentCoords?: [number, number];
  fleteId?: string;
  userType?: 'conductor' | 'cliente';
}

export function SaraFloatingSosButton({
  plate = 'PCX-4590',
  driverName = 'David Sarango',
  currentCoords = [-4.3248, -79.5562],
  fleteId,
  userType = 'conductor',
  className
}: SaraFloatingSosButtonProps & { className?: string }) {
  const [isPressing, setIsPressing] = useState(false);
  const [pressProgress, setPressProgress] = useState(0); // 0 to 100
  const [sosActive, setSosActive] = useState(false);
  const [activeAlertData, setActiveAlertData] = useState<SOSAlertData | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sirenOscillatorRef = useRef<OscillatorNode | null>(null);

  // Escuchar eventos en tiempo real para sincronizar SOS
  useEffect(() => {
    // Verificar si ya existe alerta activa
    const existing = SaraFletesRealtimeService.getActiveSos();
    if (existing && existing.activa) {
      setSosActive(true);
      setActiveAlertData(existing);
    }

    const unsubscribe = SaraFletesRealtimeService.subscribe((event) => {
      if (event.type === 'SOS_DISPARADO') {
        setSosActive(true);
        setActiveAlertData(event.payload);
      } else if (event.type === 'SOS_CANCELADO') {
        setSosActive(false);
        setActiveAlertData(null);
        stopSiren();
      }
    });

    return () => {
      unsubscribe();
      stopSiren();
    };
  }, []);

  // Manejo de sonido de sirena con Web Audio API
  const playSiren = () => {
    if (!audioEnabled || typeof window === 'undefined') return;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(950, ctx.currentTime + 0.3);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // Audio no permitido por política del navegador
    }
  };

  const stopSiren = () => {
    try {
      if (sirenOscillatorRef.current) {
        sirenOscillatorRef.current.stop();
        sirenOscillatorRef.current.disconnect();
        sirenOscillatorRef.current = null;
      }
    } catch {}
  };

  // Mantener presionado 2.5 segundos para disparar SOS
  const handleTouchStart = () => {
    setIsPressing(true);
    setPressProgress(0);
    const startTime = Date.now();
    const duration = 2500; // 2.5s

    pressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setPressProgress(progress);

      if (progress >= 100) {
        if (pressTimerRef.current) clearInterval(pressTimerRef.current);
        triggerSos();
      }
    }, 50);
  };

  const handleTouchEnd = () => {
    setIsPressing(false);
    setPressProgress(0);
    if (pressTimerRef.current) {
      clearInterval(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const triggerSos = () => {
    const sosData: SOSAlertData = {
      id: `SOS-${Date.now().toString().slice(-6)}`,
      fleteId,
      driverName,
      plate,
      lat: currentCoords[0],
      lng: currentCoords[1],
      timestamp: Date.now(),
      motivo: `Emergencia disparada por ${userType.toUpperCase()} en ruta`,
      activa: true
    };

    SaraFletesRealtimeService.emitSos(sosData);
    setSosActive(true);
    setActiveAlertData(sosData);
    playSiren();

    // Persistencia Zero-Trust en Backend para Central de Monitoreo 24/7 y ECU-911
    dispatchSosAlertAction({
      fleteId,
      userType,
      driverName,
      plate,
      lat: currentCoords[0],
      lng: currentCoords[1]
    }).catch((err) => console.warn('[SOS DISPATCH WARN]:', err));
  };

  const cancelSos = () => {
    SaraFletesRealtimeService.cancelSos(plate, fleteId);
    setSosActive(false);
    setActiveAlertData(null);
    stopSiren();
  };

  return (
    <>
      {/* Botón Flotante con Progress Ring SVG */}
      <div className={`fixed z-40 flex flex-col items-center select-none pointer-events-none ${className || 'bottom-6 right-6'}`}>
        <div className="relative group pointer-events-auto">
          {/* Anillo de progreso SVG */}
          {isPressing && (
            <svg className="absolute -top-2 -left-2 w-[76px] h-[76px] transform -rotate-90 pointer-events-none z-10">
              <circle
                cx="38"
                cy="38"
                r="34"
                stroke="rgba(239, 68, 68, 0.3)"
                strokeWidth="5"
                fill="none"
              />
              <circle
                cx="38"
                cy="38"
                r="34"
                stroke="#EF4444"
                strokeWidth="5"
                strokeDasharray="213.6"
                strokeDashoffset={213.6 - (213.6 * pressProgress) / 100}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-75"
              />
            </svg>
          )}

          {/* Botón principal SOS */}
          <button
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={() => {
              if (sosActive) {
                // Si ya está activo, abrir el modal de estado
              }
            }}
            aria-label="Botón de Pánico SOS 24/7"
            className={`w-15 h-15 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-200 active:scale-95 ${
              sosActive
                ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-400/80 shadow-red-500/50'
                : isPressing
                ? 'bg-red-700 text-white scale-105'
                : 'bg-gradient-to-br from-red-500 to-rose-700 hover:from-red-600 hover:to-rose-800 text-white shadow-red-900/40 ring-2 ring-red-300/40'
            }`}
          >
            <AlertOctagon className={`w-7 h-7 ${isPressing ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-black tracking-widest uppercase">SOS</span>
          </button>

          {/* Tooltip instructivo */}
          {!sosActive && !isPressing && (
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 text-neutral-200 text-xs py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap border border-neutral-700 pointer-events-none">
              Mantén presionado 2.5s para SOS
            </div>
          )}
        </div>

        {isPressing && (
          <span className="text-[11px] font-bold text-red-500 mt-1 bg-white dark:bg-neutral-900 px-2 py-0.5 rounded shadow border border-red-200">
            {pressProgress}% Activando...
          </span>
        )}
      </div>

      {/* Modal de Alerta Activa SOS */}
      {sosActive && activeAlertData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-neutral-900 border-2 border-red-500 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl shadow-red-500/40 relative overflow-hidden">
            {/* Cabecera de Sirena */}
            <div className="flex items-center justify-between border-b border-red-500/30 pb-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-red-600/30 border border-red-500 flex items-center justify-center animate-pulse">
                  <ShieldAlert className="w-7 h-7 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-red-400 tracking-tight flex items-center gap-2">
                    ALERTA SOS 24/7
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                  </h3>
                  <p className="text-xs text-neutral-400">Registro en Central SARA · Conexión Telefónica al ECU-911</p>
                </div>
              </div>
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className="text-neutral-400 hover:text-white p-2"
                title={audioEnabled ? 'Silenciar sirena' : 'Activar sonido'}
              >
                {audioEnabled ? <Volume2 className="w-5 h-5 text-red-400" /> : <VolumeX className="w-5 h-5 text-neutral-500" />}
              </button>
            </div>

            {/* Datos de Telemetría Transmitidos */}
            <div className="bg-neutral-800/80 rounded-2xl p-4 border border-neutral-700 space-y-2 mb-5">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Código de Incidente:</span>
                <span className="font-mono font-bold text-red-300">{activeAlertData.id}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Unidad / Placa:</span>
                <span className="font-mono font-bold text-amber-300">{activeAlertData.plate}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Responsable:</span>
                <span className="font-semibold text-neutral-200">{activeAlertData.driverName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Coordenadas GPS:</span>
                <span className="font-mono text-emerald-400 text-[11px]">
                  {activeAlertData.lat.toFixed(5)}, {activeAlertData.lng.toFixed(5)}
                </span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t border-neutral-700/60">
                <span className="text-neutral-400">Estado de Transmisión:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Transmitiendo cada 3s
                </span>
              </div>
            </div>

            {/* Acciones de Emergencia Inmediata */}
            <div className="space-y-3">
              <p className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 leading-snug">
                Coordenadas telemáticas registradas en la central de seguridad SARA. Para despacho policial o médico, presione el botón para iniciar la llamada con el operador del ECU-911.
              </p>

              <a
                href="tel:911"
                className="w-full bg-red-600 hover:bg-red-700 active:scale-98 text-white font-black py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-red-600/40 transition-all text-sm tracking-wide"
              >
                <PhoneCall className="w-5 h-5" />
                <span>LLAMAR DIRECTO AL ECU-911</span>
              </a>

              <a
                href="tel:+593999999999"
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 border border-neutral-700 text-xs transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-amber-400" />
                <span>CENTRAL DE MONITOREO SARA (24/7)</span>
              </a>

              <button
                onClick={cancelSos}
                className="w-full mt-2 py-2.5 text-xs text-neutral-400 hover:text-white font-medium hover:bg-neutral-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" /> Desactivar Alerta (Falsa Alarma / Emergencia Superada)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
