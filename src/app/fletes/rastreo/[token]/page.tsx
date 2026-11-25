'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Truck,
  Phone,
  MessageCircle,
  Share2,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  ExternalLink,
  ChevronRight,
  AlertCircle
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
  const [plate, setPlate] = useState('PBA-1234');
  const [vehicleType, setVehicleType] = useState('Vehículo Asignado SARA');
  const [driverPhone, setDriverPhone] = useState('+593987654321');
  const [rating, setRating] = useState(4.9);
  const [tripStatus, setTripStatus] = useState<'heading_to_pickup' | 'in_transit' | 'completed'>('heading_to_pickup');
  const [origin, setOrigin] = useState('Casa (Onlysoft), Cariamanga');
  const [destination, setDestination] = useState('Destino en Cariamanga');
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
        if (sp.get('on') && origin === 'Casa (Onlysoft), Cariamanga') setOrigin(sp.get('on')!);
        if (sp.get('dn') && destination === 'Destino en Cariamanga') setDestination(sp.get('dn')!);
        if (sp.get('dr') && !resolvedPlate) setDriverName(sp.get('dr')!);
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

      // 4b. Polling de respaldo cada 6s contra PostgreSQL para sincronización multi-dispositivo garantizada
      pollInterval = setInterval(async () => {
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
      }, 6000);
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

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans overflow-x-hidden">
      {/* Top Navbar */}
      <header className="bg-neutral-900/90 border-b border-neutral-800 px-4 py-3 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Truck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-white">SARA-FLETES</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                  EN VIVO
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">Rastreo Satelital Público (Zero-Login)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compartir por WhatsApp</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full p-4 flex-1 flex flex-col lg:flex-row gap-4">
        {/* Left Side: Map-as-Canvas */}
        <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden min-h-[420px] lg:min-h-[580px] relative shadow-2xl flex flex-col">
          {/* Panel flotante de Recorrido Calle por Calle estilo Google Maps (resalta la calle activa en vivo) */}
          {navSteps.length > 0 ? (
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
            <div className="absolute top-4 left-4 z-20 bg-neutral-900/90 backdrop-blur-md border border-neutral-700 rounded-2xl px-3.5 py-2 flex items-center space-x-2.5 shadow-xl">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <div>
                <p className="text-[10px] text-neutral-400 font-medium">ESTADO DEL FLETE</p>
                <p className="text-xs font-black text-emerald-400">
                  {tripStatus === 'in_transit'
                    ? 'EN RECORRIDO HACIA OBRA'
                    : tripStatus === 'completed'
                    ? 'ENTREGA FINALIZADA'
                    : 'EN CAMINO A CARGA'}
                </p>
              </div>
            </div>
          )}

          <div className="flex-1 w-full h-full">
            <SaraFletesMap
              userLocation={vehicleCoords}
              origenCoords={originCoords}
              destinoCoords={destinationCoords}
              origenNombre={origin}
              destinoNombre={destination}
              rutaCoordenadas={routeCoords.length > 0 ? routeCoords : [originCoords, destinationCoords]}
              vehiculosCercanos={[
                {
                  id: `live_${plate}`,
                  nombreChofer: driverName,
                  placa: plate,
                  tipoVehiculo: 'PICKUP_1T',
                  lat: vehicleCoords[0],
                  lng: vehicleCoords[1],
                  rating: rating,
                  disponible: false
                } as VehiculoMapa
              ]}
            />
          </div>
        </div>

        {/* Right Side: Driver & Journey Details Card */}
        <div className="w-full lg:w-96 flex flex-col gap-4">
          {/* Driver Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 font-black text-lg">
                  {driverName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{driverName}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <span className="font-mono font-bold text-amber-400">{plate}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold flex items-center">
                      ★ {rating}
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] bg-blue-500/10 text-blue-300 font-bold px-2 py-1 rounded-full border border-blue-500/20">
                Verificado
              </span>
            </div>

            <div className="text-xs space-y-1 text-neutral-300">
              <p className="text-neutral-400 text-[11px]">Vehículo Asignado:</p>
              <p className="font-semibold text-white">{vehicleType}</p>
            </div>

            {/* Contacto Seguro con Protección de Privacidad LOPDP */}
            <div className="pt-1 space-y-2">
              {phoneUnlocked ? (
                <div className="grid grid-cols-2 gap-2 animate-in fade-in">
                  <a
                    href={`tel:${driverPhone}`}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs transition-colors shadow"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{driverPhone}</span>
                  </a>
                  <button
                    onClick={handleShareWhatsApp}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 border border-neutral-700 text-xs transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              ) : (
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-neutral-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-neutral-500" />
                      Teléfono Conductor:
                    </span>
                    <span className="font-mono text-neutral-400 font-bold">
                      {driverPhone ? `${driverPhone.slice(0, 4)} *** **${driverPhone.slice(-2)}` : 'Protegido'}
                    </span>
                  </div>

                  {showPinDialog ? (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="PIN de 4 dígitos"
                          value={pinInput}
                          onChange={(e) => {
                            setPinInput(e.target.value);
                            setPinError(null);
                          }}
                          className="bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono w-full focus:outline-none focus:border-emerald-500"
                        />
                        <button
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
                              setPinError('No se pudo validar el PIN con el servidor');
                            }
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-lg shrink-0"
                        >
                          Ver
                        </button>
                      </div>
                      {pinError && <p className="text-[10px] text-rose-400 font-semibold">{pinError}</p>}
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowPinDialog(true)}
                      className="w-full text-center text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold py-1 hover:underline"
                    >
                      Desbloquear Contacto Directo con PIN
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Route Progression Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-xl space-y-4">
            <h4 className="text-xs font-black tracking-wider uppercase text-neutral-400">
              Detalles del Traslado
            </h4>

            {/* Origin & Destination timeline */}
            <div className="space-y-3 relative pl-4 border-l-2 border-dashed border-neutral-700 ml-2">
              <div>
                <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-neutral-900" />
                <p className="text-[10px] text-emerald-400 font-bold uppercase">Punto de Carga</p>
                <p className="text-xs text-white font-medium">{origin}</p>
              </div>

              <div>
                <div className="absolute -left-1.5 bottom-0 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-neutral-900" />
                <p className="text-[10px] text-amber-400 font-bold uppercase">Punto de Descarga (Obra)</p>
                <p className="text-xs text-white font-medium">{destination}</p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-800">
              <div className="bg-neutral-800/60 p-2.5 rounded-xl border border-neutral-700/60">
                <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" /> Tiempo Estimado
                </span>
                <p className="text-sm font-black text-white mt-0.5">~{etaMinutes} min</p>
              </div>

              <div className="bg-neutral-800/60 p-2.5 rounded-xl border border-neutral-700/60">
                <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-blue-400" /> Distancia Total
                </span>
                <p className="text-sm font-black text-white mt-0.5">{distanceKm} km</p>
              </div>
            </div>

            <div className="bg-neutral-800/40 p-3 rounded-xl border border-neutral-700/40 text-xs">
              <span className="text-neutral-400 text-[10px] block">Material Declarado:</span>
              <span className="font-bold text-amber-300">{material}</span>
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-neutral-700 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? '¡Enlace Copiado al Portapapeles!' : 'Copiar Enlace de Rastreo'}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
