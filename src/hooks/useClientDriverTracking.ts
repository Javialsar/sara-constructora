'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { haversineDistanceMeters, GEOFENCE_RADIUS_METERS } from '@/lib/telemetry/geofencing';
import { computeBearingDegrees } from '@/lib/telemetry/kalmanFilter';

export interface LiveDriverPosition {
  lat: number;
  lng: number;
  heading: number;
  speedKmh: number;
  roadName?: string | null;
  updatedAt: string;
}

export interface ClientDriverTrackingState {
  driverPosition: LiveDriverPosition | null;
  approachRouteCoords: [number, number][];
  distanceMeters: number | null;
  etaMinutes: number | null;
  hasArrivedPickup: boolean;
  voiceEnabled: boolean;
  lastAnnouncement: string | null;
  setVoiceEnabled: (enabled: boolean) => void;
  toggleVoice: () => void;
  replayVoiceEta: () => void;
}

interface UseClientDriverTrackingOptions {
  orderId: string | null;
  isActive: boolean;
  tripPhase: 'accepted' | 'in_transit' | 'other';
  driverName?: string;
  vehicleName?: string;
  plate?: string;
  accessCode?: string;
  pickupCoords: [number, number] | null;
  destinationCoords?: [number, number] | null;
  /** Coordenadas reales observadas en el radar de conductores asignado (fallback si aún no emite por canal v2) */
  radarDriverCoords?: { lat: number; lng: number } | null;
  initialEtaMinutes?: number | null;
}

type VoiceMilestone = 'ACCEPTED' | 'TWO_MIN' | 'UNDER_ONE_MIN' | 'ARRIVED';

function playArrivalChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes = [587.33, 880.0]; // D5 -> A5 (tono limpio de llegada)
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);
      gain.gain.setValueAtTime(0.001, now + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.14 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 0.38);
    });
  } catch {
    // El navegador bloqueó audio antes de interacción
  }
}

function speakAnnouncement(text: string, lang: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 1.02;
    utter.pitch = 1.0;
    window.speechSynthesis.speak(utter);
  } catch {
    // Sin síntesis de voz disponible
  }
}

export function useClientDriverTracking(
  options: UseClientDriverTrackingOptions
): ClientDriverTrackingState {
  const {
    orderId,
    isActive,
    tripPhase,
    driverName,
    vehicleName,
    plate,
    accessCode,
    pickupCoords,
    destinationCoords,
    radarDriverCoords,
    initialEtaMinutes = null,
  } = options;

  const [driverPosition, setDriverPosition] = useState<LiveDriverPosition | null>(null);
  const [approachRouteCoords, setApproachRouteCoords] = useState<[number, number][]>([]);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [etaMinutes, setEtaMinutes] = useState<number | null>(initialEtaMinutes);
  const [hasArrivedPickup, setHasArrivedPickup] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [lastAnnouncement, setLastAnnouncement] = useState<string | null>(null);

  const prevPosRef = useRef<{ lat: number; lng: number } | null>(null);
  const lastRouteFetchRef = useRef<{ ts: number; lat: number; lng: number } | null>(null);
  const announcedMilestonesRef = useRef<Set<VoiceMilestone>>(new Set());

  const isEnglish =
    typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('en');
  const speechLang = isEnglish ? 'en-US' : 'es-EC';

  const targetCoords =
    tripPhase === 'in_transit' && destinationCoords ? destinationCoords : pickupCoords;

  const buildMilestoneText = useCallback(
    (milestone: VoiceMilestone, etaMin: number): string => {
      const drv = driverName || (isEnglish ? 'your driver' : 'tu conductor');
      const veh = vehicleName || (isEnglish ? 'vehicle' : 'vehículo');
      const plt = plate ? (isEnglish ? `, plate ${plate}` : `, placa ${plate}`) : '';
      const pinText = accessCode
        ? isEnglish
          ? ` Please have your security PIN ${accessCode.split('').join(' ')} ready.`
          : ` Ten listo tu PIN de seguridad ${accessCode.split('').join(' ')}.`
        : '';

      if (isEnglish) {
        switch (milestone) {
          case 'ACCEPTED':
            return `${drv} is on the way in a ${veh}${plt}. Estimated arrival in ${Math.max(1, etaMin)} minutes.`;
          case 'TWO_MIN':
            return `Your vehicle is ${Math.max(1, etaMin)} minutes away from the pickup point.${pinText}`;
          case 'UNDER_ONE_MIN':
            return `Your driver is arriving in less than one minute.${pinText}`;
          case 'ARRIVED':
            return `Your vehicle has arrived at the pickup point.${pinText}`;
        }
      }

      switch (milestone) {
        case 'ACCEPTED':
          return `Tu conductor ${drv} está en camino en ${veh}${plt}. Llegará en aproximadamente ${Math.max(1, etaMin)} minutos.`;
        case 'TWO_MIN':
          return `Tu vehículo está a ${Math.max(1, etaMin)} minutos del punto de encuentro.${pinText}`;
        case 'UNDER_ONE_MIN':
          return `Tu conductor está por llegar en menos de un minuto.${pinText}`;
        case 'ARRIVED':
          return `¡Tu vehículo ha llegado al punto de encuentro!${pinText}`;
      }
    },
    [driverName, vehicleName, plate, accessCode, isEnglish]
  );

  const emitVoiceMilestone = useCallback(
    (milestone: VoiceMilestone, etaMin: number, force = false) => {
      if (!force && announcedMilestonesRef.current.has(milestone)) return;
      announcedMilestonesRef.current.add(milestone);

      const text = buildMilestoneText(milestone, etaMin);
      setLastAnnouncement(text);

      if (!voiceEnabled) return;

      if (milestone === 'ARRIVED') {
        playArrivalChime();
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
      }
      speakAnnouncement(text, speechLang);
    },
    [buildMilestoneText, voiceEnabled, speechLang]
  );

  // Reiniciar hitos cuando cambia el orderId
  useEffect(() => {
    announcedMilestonesRef.current = new Set();
    setHasArrivedPickup(false);
    setApproachRouteCoords([]);
    setLastAnnouncement(null);
    if (isActive && orderId && tripPhase === 'accepted') {
      const startEta = Math.max(1, Math.round(initialEtaMinutes || 3));
      setEtaMinutes(startEta);
      emitVoiceMilestone('ACCEPTED', startEta);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, isActive]);

  // Calcular ruta real de acercamiento (OSRM) + ETA real cada vez que llega una coordenada real del conductor
  const processIncomingDriverCoords = useCallback(
    async (lat: number, lng: number, incomingHeading?: number, incomingSpeedKmh?: number, roadName?: string | null) => {
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const prev = prevPosRef.current;
      const computedHeading =
        typeof incomingHeading === 'number' && Number.isFinite(incomingHeading) && incomingHeading > 0
          ? incomingHeading
          : prev
            ? computeBearingDegrees(prev.lat, prev.lng, lat, lng)
            : 0;

      prevPosRef.current = { lat, lng };

      setDriverPosition({
        lat,
        lng,
        heading: Number(computedHeading.toFixed(1)),
        speedKmh: typeof incomingSpeedKmh === 'number' && incomingSpeedKmh >= 0 ? incomingSpeedKmh : 0,
        roadName: roadName ?? null,
        updatedAt: new Date().toISOString(),
      });

      if (!targetCoords) return;

      const distMeters = Math.round(
        haversineDistanceMeters({ lat, lng }, { lat: targetCoords[0], lng: targetCoords[1] })
      );
      setDistanceMeters(distMeters);

      // Recalcular ruta vial real (OSRM) máximo cada 12s o >70m recorridos
      const now = Date.now();
      const lastFetch = lastRouteFetchRef.current;
      const movedSinceFetch = lastFetch
        ? haversineDistanceMeters({ lat, lng }, { lat: lastFetch.lat, lng: lastFetch.lng })
        : Infinity;

      let computedEtaMin: number | null = null;

      if (!lastFetch || now - lastFetch.ts >= 12000 || movedSinceFetch >= 70) {
        lastRouteFetchRef.current = { ts: now, lat, lng };
        try {
          const url = `/api/fletes/route?oLat=${lat}&oLng=${lng}&dLat=${targetCoords[0]}&dLng=${targetCoords[1]}`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data?.coordenadasRuta) && data.coordenadasRuta.length >= 2) {
              setApproachRouteCoords(data.coordenadasRuta);
            } else {
              setApproachRouteCoords([
                [lat, lng],
                [targetCoords[0], targetCoords[1]],
              ]);
            }
            if (typeof data?.duracionMinutos === 'number' && data.duracionMinutos > 0) {
              computedEtaMin = Math.max(1, Math.round(data.duracionMinutos));
            }
          }
        } catch {
          setApproachRouteCoords([
            [lat, lng],
            [targetCoords[0], targetCoords[1]],
          ]);
        }
      }

      if (computedEtaMin === null) {
        // Fallback realista con velocidad real del conductor (piso 22 km/h urbano)
        const effectiveKmh = Math.max(22, incomingSpeedKmh || 26);
        computedEtaMin = Math.max(1, Math.ceil((distMeters / 1000 / effectiveKmh) * 60));
      }

      setEtaMinutes(distMeters <= GEOFENCE_RADIUS_METERS ? 0 : computedEtaMin);

      // Evaluación de hitos de voz solo en fase de acercamiento al punto de recogida
      if (tripPhase === 'accepted') {
        if (distMeters <= GEOFENCE_RADIUS_METERS) {
          setHasArrivedPickup(true);
          emitVoiceMilestone('ARRIVED', 0);
        } else if (distMeters <= 150 || computedEtaMin <= 1) {
          emitVoiceMilestone('UNDER_ONE_MIN', 1);
        } else if (computedEtaMin <= 2) {
          emitVoiceMilestone('TWO_MIN', computedEtaMin);
        }
      }
    },
    [targetCoords, tripPhase, emitVoiceMilestone]
  );

  // 1. Suscripción al canal privado Supabase Realtime Broadcast `tracking:${orderId}`
  useEffect(() => {
    if (!isActive || !orderId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`tracking:${orderId}`, { config: { private: true } })
      .on('broadcast', { event: 'driver_location' }, (msg) => {
        const p = msg?.payload;
        if (p && typeof p.lat === 'number' && typeof p.lng === 'number') {
          processIncomingDriverCoords(p.lat, p.lng, p.heading, p.speedKmh, p.roadName);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isActive, orderId, processIncomingDriverCoords]);

  // 2. Sincronización desde posición real del radar de conductores (cuando el chofer emite desde /conductores)
  useEffect(() => {
    if (!isActive || !radarDriverCoords) return;
    processIncomingDriverCoords(radarDriverCoords.lat, radarDriverCoords.lng);
  }, [isActive, radarDriverCoords?.lat, radarDriverCoords?.lng, processIncomingDriverCoords]);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return next;
    });
  }, []);

  const replayVoiceEta = useCallback(() => {
    const currentEta = etaMinutes ?? Math.max(1, Math.round(initialEtaMinutes || 2));
    const milestone: VoiceMilestone = hasArrivedPickup
      ? 'ARRIVED'
      : currentEta <= 1
        ? 'UNDER_ONE_MIN'
        : 'ACCEPTED';
    const text = buildMilestoneText(milestone, currentEta);
    setLastAnnouncement(text);
    speakAnnouncement(text, speechLang);
  }, [etaMinutes, initialEtaMinutes, hasArrivedPickup, buildMilestoneText, speechLang]);

  return {
    driverPosition,
    approachRouteCoords,
    distanceMeters,
    etaMinutes,
    hasArrivedPickup,
    voiceEnabled,
    lastAnnouncement,
    setVoiceEnabled,
    toggleVoice,
    replayVoiceEta,
  };
}
