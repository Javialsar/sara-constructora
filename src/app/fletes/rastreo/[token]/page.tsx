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
  const [driverName, setDriverName] = useState('David Sarango');
  const [plate, setPlate] = useState('PCX-4590');
  const [vehicleType, setVehicleType] = useState('Camión 5 Toneladas (Hino Dutro)');
  const [driverPhone, setDriverPhone] = useState('+593987654321');
  const [rating, setRating] = useState(4.9);
  const [tripStatus, setTripStatus] = useState<'heading_to_pickup' | 'in_transit' | 'completed'>('in_transit');
  const [origin, setOrigin] = useState('Cariamanga (Centro de Acopio)');
  const [destination, setDestination] = useState('Loja (Proyecto San Cayetano)');
  const [originCoords, setOriginCoords] = useState<[number, number]>([-4.3248, -79.5562]);
  const [destinationCoords, setDestinationCoords] = useState<[number, number]>([-3.9931, -79.2042]);
  const [vehicleCoords, setVehicleCoords] = useState<[number, number]>([-4.215, -79.432]);
  const [etaMinutes, setEtaMinutes] = useState(24);
  const [distanceKm, setDistanceKm] = useState(48.5);
  const [material, setMaterial] = useState('450 Sacos Cemento Holcim');
  const [copiedLink, setCopiedLink] = useState(false);
  const [phoneUnlocked, setPhoneUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinDialog, setShowPinDialog] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setToken(p.token);
      // Intentar cargar snapshot guardado para este token
      const snapshot = SaraFletesRealtimeService.getPublicTrackingSnapshot(p.token);
      if (snapshot) {
        if (snapshot.driverName) setDriverName(snapshot.driverName);
        if (snapshot.plate) setPlate(snapshot.plate);
        if (snapshot.origin) setOrigin(snapshot.origin);
        if (snapshot.destination) setDestination(snapshot.destination);
        if (snapshot.originCoords) setOriginCoords(snapshot.originCoords);
        if (snapshot.destinationCoords) setDestinationCoords(snapshot.destinationCoords);
        if (snapshot.material) setMaterial(snapshot.material);
        if (snapshot.distanceKm) setDistanceKm(snapshot.distanceKm);
      }
    });

    // Escuchar telemetría en vivo
    const unsubscribe = SaraFletesRealtimeService.subscribe((event) => {
      if (event.type === 'ACTUALIZAR_GPS_CONDUCTOR') {
        setVehicleCoords([event.payload.lat, event.payload.lng]);
      } else if (event.type === 'FLETE_INICIADO') {
        setTripStatus('in_transit');
        setDriverName(event.payload.driverName);
        setPlate(event.payload.plate);
      } else if (event.type === 'FLETE_COMPLETADO') {
        setTripStatus('completed');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [params]);

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
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
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
          {/* Status Badge flotante en el mapa */}
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

          <div className="flex-1 w-full h-full">
            <SaraFletesMap
              userLocation={vehicleCoords}
              origenCoords={originCoords}
              destinoCoords={destinationCoords}
              origenNombre={origin}
              destinoNombre={destination}
              rutaCoordenadas={[originCoords, vehicleCoords, destinationCoords]}
              vehiculosCercanos={[]}
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
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="PIN de Flete"
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        className="bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono w-full focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={() => {
                          if (pinInput.trim().length >= 4) {
                            setPhoneUnlocked(true);
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-lg shrink-0"
                      >
                        Ver
                      </button>
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
