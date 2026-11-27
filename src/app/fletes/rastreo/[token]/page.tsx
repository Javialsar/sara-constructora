'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Truck,
  Phone,
  MessageCircle,
  Share2,
  Clock,
  Navigation,
  ChevronUp,
  ChevronDown,
  Copy,
  Check
} from 'lucide-react';
import { SaraFletesRealtimeService, ConductorEstadoRealtime, SolicitudFleteRealtime } from '@/lib/services/saraFletesRealtimeService';
import { SaraFreightRoutingService } from '@/lib/services/saraFreightRoutingService';
import { SaraGoogleMapsNavPanel } from '@/components/fletes/SaraGoogleMapsNavPanel';
import { saraVoiceNavigation, type PasoNavegacionVial } from '@/lib/fletes/saraVoiceNavigation';
import { snapToRoutePolyline } from '@/lib/fletes/saraGpsTelemetryEngine';
import type { VehiculoMapa } from '@/components/fletes/SaraFletesMap';

// Importar mapa Leaflet dinámicamente sin SSR
const SaraFletesMap = dynamic(() => import('@/components/fletes/SaraFletesMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] bg-neutral-900 flex items-center justify-center text-neutral-400">
      <div className="flex flex-col items-center gap-2">
        <Truck className="w-8 h-8 animate-bounce text-emerald-400" />
        <span className="text-xs font-mono">Conectando telemetría satelital...</span>
      </div>
    </div>
  )
});

interface PublicTrackingPageProps {
  params: Promise<{ token: string }>;
}

export default function PublicTrackingPage({ params }: PublicTrackingPageProps) {
  const [token, setToken] = useState<string>('');
  const [driverName, setDriverName] = useState('Conductor SARA');
  const [plate, setPlate] = useState('');
  const [vehicleType, setVehicleType] = useState('Vehículo Verificado SARA');
  const [driverPhone, setDriverPhone] = useState('');
  const [rating, setRating] = useState(4.9);
  const [tripStatus, setTripStatus] = useState<'heading_to_pickup' | 'in_transit' | 'completed'>('heading_to_pickup');
  const [origin, setOrigin] = useState('Punto de recogida');
  const [destination, setDestination] = useState('Destino');
  const [originCoords, setOriginCoords] = useState<[number, number]>([-4.328103, -79.561129]);
  const [destinationCoords, setDestinationCoords] = useState<[number, number]>([-4.331405, -79.553528]);
  const [vehicleCoords, setVehicleCoords] = useState<[number, number]>([-4.328103, -79.561129]);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [etaMinutes, setEtaMinutes] = useState(3);
  const [distanceKm, setDistanceKm] = useState(0.9);
  const [material, setMaterial] = useState('Viaje SARA');
  const [lastGpsUpdate, setLastGpsUpdate] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [phoneUnlocked, setPhoneUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  // Recorrido calle por calle en tiempo real (sincronizado con la posición GPS viva del vehículo)
  const [navSteps, setNavSteps] = useState<PasoNavegacionVial[]>([]);
  const [activeNavStepIndex, setActiveNavStepIndex] = useState<number>(0);
  const [remainingMetersToTurn, setRemainingMetersToTurn] = useState<number>(0);
  const [tripProgressPercent, setTripProgressPercent] = useState<number>(0);
  const [voiceMuted, setVoiceMuted] = useState<boolean>(true);

  useEffect(() => {
    let resolvedOrig: [number, number] | null = null;
    let resolvedDest: [number, number] | null = null;
    let resolvedPlate = '';
    let hasRouteFromSnapshot = false;
    let activeToken = '';
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    params.then(async (p) => {
      activeToken = p.token;
      setToken(p.token);

      // 0. Consultar fuente autoritativa en PostgreSQL (/api/fletes/tracking/[token])
      try {
        const apiRes = await fetch(`/api/fletes/tracking/${encodeURIComponent(p.token)}`, { cache: 'no-store' });
        if (apiRes.ok) {
          const data = await apiRes.json();
          if (data?.found && data.tracking) {
            const tr = data.tracking;
            if (tr.driverName) setDriverName(tr.driverName);
            if (tr.plate) {
              resolvedPlate = tr.plate;
              setPlate(tr.plate);
            }
            if (tr.vehicleName) setVehicleType(tr.vehicleName);
            if (tr.maskedPhone) setDriverPhone(tr.maskedPhone);
            if (tr.status) setTripStatus(tr.status);
            if (tr.origin) setOrigin(tr.origin);
            if (tr.destination) setDestination(tr.destination);
            if (tr.originCoords) {
              resolvedOrig = tr.originCoords;
              setOriginCoords(tr.originCoords);
              setVehicleCoords(tr.originCoords);
            }
            if (tr.destinationCoords) {
              resolvedDest = tr.destinationCoords;
              setDestinationCoords(tr.destinationCoords);
            }
            if (tr.liveLocation && typeof tr.liveLocation.lat === 'number' && typeof tr.liveLocation.lng === 'number') {
              setVehicleCoords([tr.liveLocation.lat, tr.liveLocation.lng]);
              setLastGpsUpdate(new Date(tr.liveLocation.updated_at).getTime() || Date.now());
            }
            if (tr.material) setMaterial(tr.material);
            if (tr.distanceKm) setDistanceKm(tr.distanceKm);
            if (tr.duracionMinutos) setEtaMinutes(Math.max(1, tr.duracionMinutos));
            if (Array.isArray(tr.coordenadasRuta) && tr.coordenadasRuta.length > 2) {
              setRouteCoords(tr.coordenadasRuta);
              hasRouteFromSnapshot = true;
            }
          }
        }
      } catch {
        // Fallback a URL params / bus local si no existe registro en BD aún
      }

      // 1. Leer parámetros de URL si se abrió en otro dispositivo (WhatsApp cross-device)
      if (typeof window !== 'undefined') {
        const sp = new URLSearchParams(window.location.search);
        const oParam = sp.get('o');
        const dParam = sp.get('d');
        if (oParam && !resolvedOrig) {
          const [lat, lng] = oParam.split(',').map(Number);
          if (!isNaN(lat) && !isNaN(lng)) {
            resolvedOrig = [lat, lng];
            setOriginCoords(resolvedOrig);
            setVehicleCoords(resolvedOrig);
          }
        }
        if (dParam && !resolvedDest) {
          const [lat, lng] = dParam.split(',').map(Number);
          if (!isNaN(lat) && !isNaN(lng)) {
            resolvedDest = [lat, lng];
            setDestinationCoords(resolvedDest);
          }
        }
        if (sp.get('on')) setOrigin(sp.get('on')!);
        if (sp.get('dn')) setDestination(sp.get('dn')!);
        if (sp.get('dr')) setDriverName(sp.get('dr')!);
        if (sp.get('pl') && !resolvedPlate) {
          resolvedPlate = sp.get('pl')!;
          setPlate(resolvedPlate);
        }
        if (sp.get('v')) setVehicleType(sp.get('v')!);
        if (sp.get('m')) setMaterial(sp.get('m')!);
        if (sp.get('km') && !isNaN(Number(sp.get('km')))) setDistanceKm(Number(sp.get('km')));
        if (sp.get('min') && !isNaN(Number(sp.get('min')))) setEtaMinutes(Math.max(1, Number(sp.get('min'))));
      }

      // 2. Cargar snapshot local guardado o estado activo del bus en tiempo real
      const snapshot = SaraFletesRealtimeService.getPublicTrackingSnapshot(p.token);
      const activeReq = SaraFletesRealtimeService.getActiveRequest();
      const acceptedDispatch = SaraFletesRealtimeService.getAcceptedDispatch();
      const tripInProgress = SaraFletesRealtimeService.getTripInProgress();

      if (snapshot) {
        if (snapshot.driverName) setDriverName(snapshot.driverName);
        if (snapshot.plate && !resolvedPlate) {
          resolvedPlate = snapshot.plate;
          setPlate(snapshot.plate);
        }
        if (snapshot.vehicleName) setVehicleType(snapshot.vehicleName);
        if (snapshot.origin) setOrigin(snapshot.origin);
        if (snapshot.destination) setDestination(snapshot.destination);
        if (snapshot.originCoords && !resolvedOrig) {
          const orig: [number, number] = snapshot.originCoords;
          resolvedOrig = orig;
          setOriginCoords(orig);
          setVehicleCoords(orig);
        }
        if (snapshot.destinationCoords && !resolvedDest) {
          const dest: [number, number] = snapshot.destinationCoords;
          resolvedDest = dest;
          setDestinationCoords(dest);
        }
        if (snapshot.material) setMaterial(snapshot.material);
        if (snapshot.distanceKm) setDistanceKm(snapshot.distanceKm);
        if (snapshot.duracionMinutos) setEtaMinutes(Math.max(1, snapshot.duracionMinutos));
        if (!hasRouteFromSnapshot && Array.isArray(snapshot.coordenadasRuta) && snapshot.coordenadasRuta.length > 2) {
          setRouteCoords(snapshot.coordenadasRuta);
          hasRouteFromSnapshot = true;
        }
      } else if (activeReq || acceptedDispatch) {
        const src: any = activeReq || acceptedDispatch;
        if (src.assignedDriverName || acceptedDispatch?.driverName) setDriverName(src.assignedDriverName || acceptedDispatch?.driverName);
        if ((src.assignedPlate || acceptedDispatch?.plate) && !resolvedPlate) {
          resolvedPlate = src.assignedPlate || acceptedDispatch?.plate;
          setPlate(resolvedPlate);
        }
        if (src.origen) setOrigin(src.origen);
        if (src.destino) setDestination(src.destino);
        if (src.coordsOrigen && !resolvedOrig) {
          const orig: [number, number] = src.coordsOrigen;
          resolvedOrig = orig;
          setOriginCoords(orig);
          setVehicleCoords(orig);
        }
        if (src.coordsDestino && !resolvedDest) {
          const dest: [number, number] = src.coordsDestino;
          resolvedDest = dest;
          setDestinationCoords(dest);
        }
        if (src.material) setMaterial(src.material);
        if (src.distanciaKm) setDistanceKm(src.distanciaKm);
        if (src.duracionMinutos) setEtaMinutes(Math.max(1, src.duracionMinutos));
        if (!hasRouteFromSnapshot && Array.isArray(src.coordenadasRuta) && src.coordenadasRuta.length > 2) {
          setRouteCoords(src.coordenadasRuta);
          hasRouteFromSnapshot = true;
        }
      }

      if (tripInProgress) {
        setTripStatus('in_transit');
      }

      // 3. Sincronizar posición GPS real del conductor activo si existe en el radar local
      if (typeof window !== 'undefined' && resolvedPlate && resolvedOrig) {
        try {
          const rawDriver = localStorage.getItem(`sara_fletes_rt_driver_${resolvedPlate}`);
          if (rawDriver) {
            const matchedDriver = JSON.parse(rawDriver) as ConductorEstadoRealtime;
            if (typeof matchedDriver.lat === 'number' && typeof matchedDriver.lng === 'number') {
              const distFromOrigKm = Math.hypot(matchedDriver.lat - resolvedOrig[0], matchedDriver.lng - resolvedOrig[1]) * 111;
              if (distFromOrigKm < 50) {
                setVehicleCoords([matchedDriver.lat, matchedDriver.lng]);
                setLastGpsUpdate(Date.now());
              }
            }
          }
        } catch {}
      }

      // 4. Calcular ruta vial real calle por calle + pasos de navegación (OSRM steps)
      if (resolvedOrig && resolvedDest) {
        try {
          const ruta = await SaraFreightRoutingService.calcularRutaMasCorta(
            { nombre: origin, lat: resolvedOrig[0], lng: resolvedOrig[1] },
            { nombre: destination, lat: resolvedDest[0], lng: resolvedDest[1] }
          );
          if (ruta) {
            if (!hasRouteFromSnapshot && ruta.coordenadasRuta.length > 0) {
              setRouteCoords(ruta.coordenadasRuta);
              setDistanceKm(ruta.distanciaKm);
              setEtaMinutes(Math.max(1, ruta.duracionMinutos));
            }
            if (Array.isArray(ruta.pasosNavegacion) && ruta.pasosNavegacion.length > 0) {
              setNavSteps(ruta.pasosNavegacion);
              setActiveNavStepIndex(0);
              setRemainingMetersToTurn(ruta.pasosNavegacion[0].distanciaMetros || 0);
            }
          }
        } catch {
          if (!hasRouteFromSnapshot) {
            setRouteCoords([resolvedOrig, resolvedDest]);
          }
        }
      }

      // 4b. Polling en vivo cada 2.5s contra /api/fletes/dispatch (si hay PIN) y /api/fletes/tracking/[token]
      const urlPin = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('pin')?.trim() : null;
      const pollLive = async () => {
        if (urlPin) {
          try {
            const dr = await fetch(`/api/fletes/dispatch?codigoAcceso=${encodeURIComponent(urlPin)}`, { cache: 'no-store' });
            if (dr.ok) {
              const dj = await dr.json();
              const req = dj?.request;
              const tel = dj?.driverTelemetry;
              if (req) {
                const st = String(req.status || '').toLowerCase();
                if (st === 'en_curso') setTripStatus('in_transit');
                else if (st === 'completada') setTripStatus('completed');
                else if (st === 'aceptada') setTripStatus('heading_to_pickup');
                if (req.conductor_nombre) setDriverName(req.conductor_nombre);
                if (req.conductor_placa) setPlate(req.conductor_placa);
                if (req.vehiculo_nombre) setVehicleType(req.vehiculo_nombre);
              }
              if (tel && typeof tel.lat === 'number' && typeof tel.lng === 'number') {
                setVehicleCoords([tel.lat, tel.lng]);
                setLastGpsUpdate(tel.updatedAt || Date.now());
              }
            }
          } catch {}
        }
        if (!activeToken) return;
        try {
          const r = await fetch(`/api/fletes/tracking/${encodeURIComponent(activeToken)}`, { cache: 'no-store' });
          if (!r.ok) return;
          const j = await r.json();
          if (j?.found && j.tracking) {
            if (j.tracking.status) setTripStatus(j.tracking.status);
            if (j.tracking.liveLocation && typeof j.tracking.liveLocation.lat === 'number') {
              setVehicleCoords([j.tracking.liveLocation.lat, j.tracking.liveLocation.lng]);
              setLastGpsUpdate(new Date(j.tracking.liveLocation.updated_at).getTime() || Date.now());
            }
            if (Array.isArray(j.tracking.coordenadasRuta) && j.tracking.coordenadasRuta.length > 2) {
              setRouteCoords(j.tracking.coordenadasRuta);
            }
          }
        } catch {}
      };
      pollLive();
      pollInterval = setInterval(pollLive, 2500);
    });

    // 5. Escuchar telemetría en vivo (BroadcastChannel + localStorage + Supabase Realtime)
    const unsubscribe = SaraFletesRealtimeService.subscribe((event) => {
      if (event.type === 'ACTUALIZAR_GPS_CONDUCTOR') {
        if (!resolvedPlate || event.payload.plate === resolvedPlate) {
          setVehicleCoords([event.payload.lat, event.payload.lng]);
          setLastGpsUpdate(Date.now());
        }
      } else if (event.type === 'CHOFER_ACEPTO_FLETE') {
        setTripStatus('heading_to_pickup');
        setDriverName(event.payload.driverName);
        setPlate(event.payload.plate);
        if (event.payload.vehicleName) setVehicleType(event.payload.vehicleName);
        if (event.payload.coords) {
          setVehicleCoords(event.payload.coords);
          setLastGpsUpdate(Date.now());
        }
      } else if (event.type === 'FLETE_INICIADO') {
        setTripStatus('in_transit');
        setDriverName(event.payload.driverName);
        setPlate(event.payload.plate);
        setLastGpsUpdate(Date.now());
      } else if (event.type === 'FLETE_COMPLETADO') {
        setTripStatus('completed');
        if (resolvedDest) setVehicleCoords(resolvedDest);
        setLastGpsUpdate(Date.now());
      }
    });

    return () => {
      unsubscribe();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [params]);

  // Sincronizar en tiempo real la calle activa y el progreso conforme avanza el vehículo por la ruta
  useEffect(() => {
    if (tripStatus === 'completed') {
      setTripProgressPercent(100);
      if (navSteps.length > 0) {
        setActiveNavStepIndex(navSteps.length - 1);
        setRemainingMetersToTurn(0);
      }
      return;
    }

    const activeRoute = routeCoords.length >= 2 ? routeCoords : [originCoords, destinationCoords];
    const snap = snapToRoutePolyline(vehicleCoords, activeRoute);
    setTripProgressPercent(snap.progressPercent);

    if (navSteps.length > 0) {
      const rawStepsTotalM = navSteps.reduce((sum, s) => sum + (s.distanciaMetros || 0), 0) || snap.totalRouteMeters;
      const scaleFactor = snap.totalRouteMeters / Math.max(1, rawStepsTotalM);
      let accStepM = 0;
      let matchedIdx = navSteps.length - 1;
      let remM = 0;

      for (let k = 0; k < navSteps.length; k++) {
        accStepM += (navSteps[k].distanciaMetros || 0) * scaleFactor;
        if (snap.traveledMeters < accStepM || k === navSteps.length - 1) {
          matchedIdx = k;
          remM = Math.max(0, Math.round(accStepM - snap.traveledMeters));
          break;
        }
      }

      setActiveNavStepIndex(matchedIdx);
      setRemainingMetersToTurn(remM);
    }
  }, [vehicleCoords, routeCoords, originCoords, destinationCoords, navSteps, tripStatus]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🚚 *SARA-FLETES: Seguimiento Satelital en Vivo*\n\n` +
      `• Unidad: ${driverName} (${plate})\n` +
      `• Carga: ${material}\n` +
      `• Ruta: ${origin} ➔ ${destination}\n` +
      `• Estado: ${tripStatus === 'in_transit' ? 'En Tránsito a Obra' : 'En Ruta'}\n\n` +
      `👉 Sigue la ubicación del camión en tiempo real aquí:\n${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const isPassengerTrip = material.toLowerCase().includes('viaje') || material.toLowerCase().includes('pasajero');
  const statusLabel =
    tripStatus === 'in_transit'
      ? isPassengerTrip ? 'En ruta al destino' : 'En recorrido hacia obra'
      : tripStatus === 'completed'
        ? isPassengerTrip ? 'Viaje finalizado' : 'Entrega finalizada'
        : isPassengerTrip ? 'Conductor en camino' : 'En camino al punto de carga';

  return (
    <div className="h-[100dvh] w-screen bg-slate-950 text-white flex flex-col font-sans overflow-hidden">
      {/* BARRA SUPERIOR COMPACTA DE 1 FILA */}
      <header className="h-12 bg-slate-900/95 border-b border-slate-800 px-3 sm:px-4 shrink-0 z-30 backdrop-blur-md flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-black text-sm tracking-tight text-white truncate">SARA Fletes</span>
            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 font-black px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              EN VIVO
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className="min-w-[36px] min-h-[36px] px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
            title="Copiar enlace de rastreo"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? 'Copiado' : 'Copiar'}</span>
          </button>
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="min-h-[36px] bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold px-3 rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartir</span>
          </button>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL: MAPA A PANTALLA COMPLETA + HOJA INFERIOR EXPANDIBLE EN MÓVIL / PANEL LATERAL EN DESKTOP */}
      <main className="flex-1 min-h-0 flex flex-col lg:flex-row relative overflow-hidden">
        {/* MAPA SATELITAL SIEMPRE VISIBLE (absolute inset-0 garantiza alto real en Leaflet móvil) */}
        <div className="flex-1 min-h-0 relative bg-slate-900">
          <div className="absolute inset-0 z-0">
            <SaraFletesMap
              userLocation={vehicleCoords}
              origenCoords={originCoords}
              destinoCoords={destinationCoords}
              origenNombre={origin}
              destinoNombre={destination}
              rutaCoordenadas={routeCoords.length > 0 ? routeCoords : [originCoords, destinationCoords]}
              vehiculosCercanos={[
                {
                  id: `live_${plate || 'sara'}`,
                  nombreChofer: driverName,
                  placa: plate,
                  tipoVehiculo: isPassengerTrip ? 'AUTO_SEDAN' : 'PICKUP_1T',
                  lat: vehicleCoords[0],
                  lng: vehicleCoords[1],
                  rating: rating,
                  disponible: false
                } as VehiculoMapa
              ]}
            />
          </div>

          {/* PANEL FLOTANTE DE RECORRIDO CALLE POR CALLE */}
          {navSteps.length > 0 && tripStatus !== 'completed' ? (
            <SaraGoogleMapsNavPanel
              originName={origin}
              destinationName={destination}
              steps={navSteps}
              activeStepIndex={activeNavStepIndex}
              remainingMetersToNextTurn={remainingMetersToTurn}
              tripProgressPercent={tripProgressPercent}
              voiceMuted={voiceMuted}
              onToggleVoice={() => {
                const next = !voiceMuted;
                setVoiceMuted(next);
                saraVoiceNavigation.setMuted(next);
              }}
              onRepeatCurrentStep={() => {
                if (voiceMuted) {
                  setVoiceMuted(false);
                  saraVoiceNavigation.setMuted(false);
                }
                const current = navSteps[activeNavStepIndex];
                if (current) saraVoiceNavigation.anunciarPaso(current);
              }}
            />
          ) : (
            <div className="absolute top-3 left-3 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl px-3 py-2 flex items-center gap-2 shadow-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-black text-emerald-300">{statusLabel}</span>
            </div>
          )}
        </div>

        {/* HOJA INFERIOR MÓVIL (COMPACTA POR DEFECTO PARA VER EL MAPA, EXPANDIBLE AL TOCAR) / SIDEBAR DESKTOP */}
        <section
          className={`fixed bottom-0 inset-x-0 z-30 lg:static lg:w-96 lg:h-full bg-slate-950/98 lg:bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 rounded-t-3xl lg:rounded-none shadow-2xl transition-all duration-200 flex flex-col ${
            sheetExpanded ? 'max-h-[75dvh]' : 'max-h-[210px]'
          } lg:max-h-none`}
        >
          {/* Barra táctil para expandir/contraer en móvil */}
          <button
            type="button"
            onClick={() => setSheetExpanded((v) => !v)}
            className="lg:hidden w-full pt-2 pb-1.5 px-4 flex flex-col items-center gap-1 cursor-pointer shrink-0"
          >
            <span className="w-10 h-1 rounded-full bg-slate-700" />
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              {sheetExpanded ? (
                <>Ocultar detalles <ChevronDown className="w-3 h-3" /></>
              ) : (
                <>Ver ruta y contacto <ChevronUp className="w-3 h-3" /></>
              )}
            </span>
          </button>

          <div className="px-4 pb-4 lg:p-4 overflow-y-auto space-y-3 flex-1">
            {/* FILA PRINCIPAL SIEMPRE VISIBLE: ESTADO + ETA + DISTANCIA */}
            <div className="flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-800 rounded-2xl px-3 py-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="text-xs font-black text-emerald-400 truncate">{statusLabel}</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {origin} ➔ {destination}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 text-right">
                <div className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-xl">
                  <p className="text-xs font-mono font-black text-white leading-none">~{etaMinutes} min</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">{distanceKm} km</p>
                </div>
              </div>
            </div>

            {/* CONDUCTOR COMPACTO */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-sm shrink-0">
                    {driverName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-black text-white truncate">{driverName}</h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                      <span className="truncate">{vehicleType}</span>
                      {plate && (
                        <>
                          <span>•</span>
                          <span className="font-mono font-bold text-amber-400 shrink-0">{plate}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="text-emerald-400 font-bold shrink-0">★ {rating}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-blue-500/15 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-500/25 shrink-0">
                  Verificado
                </span>
              </div>

              {/* Contacto Seguro con PIN */}
              <div className="pt-1">
                {phoneUnlocked ? (
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${driverPhone}`}
                      className="min-h-[40px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{driverPhone}</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="min-h-[40px] bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 text-xs transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        Contacto conductor:
                      </span>
                      <span className="font-mono text-slate-400 font-bold">
                        {driverPhone ? `${driverPhone.slice(0, 4)} *** **${driverPhone.slice(-2)}` : 'Protegido'}
                      </span>
                    </div>

                    {showPinDialog ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="PIN de 4 dígitos"
                            value={pinInput}
                            onChange={(e) => {
                              setPinInput(e.target.value);
                              setPinError(null);
                            }}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono w-full focus:outline-none focus:border-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              const pin = pinInput.trim();
                              if (!/^\d{4,6}$/.test(pin)) {
                                setPinError('Ingresa un PIN numérico de 4 dígitos');
                                return;
                              }
                              try {
                                const res = await fetch(`/api/fletes/tracking/${encodeURIComponent(token)}`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ pin })
                                });
                                const data = await res.json();
                                if (res.ok && data?.valid) {
                                  if (data.phone) setDriverPhone(data.phone);
                                  setPhoneUnlocked(true);
                                  setPinError(null);
                                } else {
                                  setPinError(data?.error || 'Código PIN incorrecto');
                                }
                              } catch {
                                setPinError('No se pudo validar el PIN');
                              }
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 cursor-pointer"
                          >
                            Ver
                          </button>
                        </div>
                        {pinError && <p className="text-[10px] text-rose-400 font-semibold">{pinError}</p>}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowPinDialog(true)}
                        className="w-full text-center text-[11px] text-emerald-400 hover:text-emerald-300 font-bold py-0.5 hover:underline cursor-pointer"
                      >
                        Desbloquear contacto con PIN
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* DETALLES DE RUTA */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3">
              <div className="space-y-2.5 relative pl-4 border-l-2 border-dashed border-slate-700 ml-1.5">
                <div>
                  <div className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-slate-900" />
                  <p className="text-[10px] text-emerald-400 font-bold uppercase">
                    {isPassengerTrip ? 'Recogida' : 'Punto de Carga'}
                  </p>
                  <p className="text-xs text-white font-medium">{origin}</p>
                </div>

                <div>
                  <div className="absolute -left-1.5 bottom-0.5 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-slate-900" />
                  <p className="text-[10px] text-amber-400 font-bold uppercase">
                    {isPassengerTrip ? 'Destino' : 'Punto de Descarga'}
                  </p>
                  <p className="text-xs text-white font-medium">{destination}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" /> Llegada est.
                  </span>
                  <p className="text-sm font-black font-mono text-white mt-0.5">~{etaMinutes} min</p>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-sky-400" /> Distancia
                  </span>
                  <p className="text-sm font-black font-mono text-white mt-0.5">{distanceKm} km</p>
                </div>
              </div>

              <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">{isPassengerTrip ? 'Servicio' : 'Carga'}</span>
                <span className="font-bold text-amber-300 truncate ml-2">{material}</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
