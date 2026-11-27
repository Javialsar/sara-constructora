'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GobeeMapCanvas } from '@/components/gobee/rider/GobeeMapCanvas';
import { RideStepSelector } from '@/components/gobee/rider/RideStepSelector';
import { ActiveTripHUD } from '@/components/gobee/rider/ActiveTripHUD';
import type { ActiveDriverTrackingProp, VehiculoMapa } from '@/components/fletes/SaraFletesMap';
import {
  SaraFreightRoutingService,
  type RutaVialCalculada,
  type SugerenciaDireccion,
} from '@/lib/services/saraFreightRoutingService';
import { UberFreightService } from '@/lib/services/uberFreightService';
import { startRealGpsWatcher } from '@/lib/fletes/saraGpsTelemetryEngine';
import {
  GOBEE_CATEGORIES,
  GOBEE_CATEGORY_MAP,
  type GobeeActiveTrip,
  type GobeeCategoryId,
  type GobeeGeoPoint,
  type GobeeServerQuote,
} from '@/lib/gobee/gobeeTypes';

export default function GobeeRiderPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [userLocationAccuracy, setUserLocationAccuracy] = useState<number | null>(null);

  const [originText, setOriginText] = useState('Detectando ubicación GPS...');
  const [destinationText, setDestinationText] = useState('');
  const [originPoint, setOriginPoint] = useState<GobeeGeoPoint | null>(null);
  const [destinationPoint, setDestinationPoint] = useState<GobeeGeoPoint | null>(null);

  const [originSuggestions, setOriginSuggestions] = useState<SugerenciaDireccion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<SugerenciaDireccion[]>([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);

  const [rutaCalculada, setRutaCalculada] = useState<RutaVialCalculada | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [magneticPinTarget, setMagneticPinTarget] = useState<'origin' | 'destination' | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<GobeeCategoryId>('gobee_go');
  const [quotesByCategory, setQuotesByCategory] = useState<Partial<Record<GobeeCategoryId, GobeeServerQuote>>>({});
  const [pricingMode, setPricingMode] = useState<'fixed' | 'offer'>('fixed');
  const [offerPriceUSD, setOfferPriceUSD] = useState<number>(2.5);
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'kushki' | 'deuna'>('efectivo');
  const [cargoMaterial, setCargoMaterial] = useState('Arena / Ripio');
  const [cargoWeightTon, setCargoWeightTon] = useState<number>(1.5);

  const [nearbyVehicles, setNearbyVehicles] = useState<VehiculoMapa[]>([]);
  const [activeTrip, setActiveTrip] = useState<GobeeActiveTrip | null>(null);
  const [activeDriverTracking, setActiveDriverTracking] = useState<ActiveDriverTrackingProp | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'rider' | 'driver'; text: string; at: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const originLockedRef = useRef(false);
  const originDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  // 1. GPS real continuo para posicionar origen inicial y consultar conductores PostGIS
  useEffect(() => {
    const stop = startRealGpsWatcher({
      onFix: (fix) => {
        const coords: [number, number] = [Number(fix.lat.toFixed(6)), Number(fix.lng.toFixed(6))];
        setUserLocation(coords);
        setUserLocationAccuracy(fix.accuracyM);

        if (!originLockedRef.current) {
          originLockedRef.current = true;
          setOriginPoint({ label: 'Mi ubicación actual (GPS)', lat: coords[0], lng: coords[1] });
          setOriginText('Mi ubicación actual (GPS)');
        }
      },
    });
    return () => stop();
  }, []);

  // 2. Consultar conductores cercanos en PostGIS (ST_DWithin)
  useEffect(() => {
    if (!userLocation) return;
    let cancelled = false;

    const loadNearby = async () => {
      const drivers = await UberFreightService.findNearbyDrivers(userLocation[0], userLocation[1], 6000);
      if (cancelled) return;
      setNearbyVehicles(
        drivers.map((d) => ({
          id: d.driverId,
          nombreChofer: d.driverName,
          placa: d.plate,
          tipoVehiculo: GOBEE_CATEGORY_MAP[d.category]?.legacyVehicleType || 'PICKUP_1T',
          lat: d.lat,
          lng: d.lng,
          rating: d.rating,
          disponible: true,
        }))
      );
    };

    void loadNearby();
    const timer = setInterval(() => void loadNearby(), 12000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [userLocation]);

  // 3. Calcular ruta OSRM + cotizaciones oficiales en servidor (RPC PostGIS) para las 4 categorías
  const computeRouteAndQuotes = useCallback(
    async (orig: GobeeGeoPoint, dest: GobeeGeoPoint, weightTon = cargoWeightTon) => {
      setIsCalculatingRoute(true);
      try {
        const ruta = await SaraFreightRoutingService.calcularRutaMasCorta(
          { nombre: orig.label, lat: orig.lat, lng: orig.lng, ciudad: orig.city, provincia: orig.province },
          { nombre: dest.label, lat: dest.lat, lng: dest.lng, ciudad: dest.city, provincia: dest.province }
        );
        setRutaCalculada(ruta);

        const quotesEntries = await Promise.all(
          GOBEE_CATEGORIES.map(async (cat) => {
            const q = await UberFreightService.quoteFareServer({
              category: cat.id,
              originLat: orig.lat,
              originLng: orig.lng,
              destLat: dest.lat,
              destLng: dest.lng,
              distanceKm: ruta.distanciaKm,
              weightTon: cat.id === 'gobee_cargo' ? weightTon : 0,
            });
            return [cat.id, q] as const;
          })
        );

        const nextQuotes: Partial<Record<GobeeCategoryId, GobeeServerQuote>> = {};
        for (const [id, q] of quotesEntries) {
          nextQuotes[id] = q;
        }
        setQuotesByCategory(nextQuotes);

        const selectedQuote = nextQuotes[selectedCategory];
        if (selectedQuote) {
          setOfferPriceUSD(selectedQuote.fixedFareUSD);
        }
      } catch {
        showToast('No se pudo calcular la ruta OSRM. Verifica tu conexión.');
      } finally {
        setIsCalculatingRoute(false);
      }
    },
    [cargoWeightTon, selectedCategory, showToast]
  );

  // Recotizar Gobee Cargo si cambia el peso
  useEffect(() => {
    if (originPoint && destinationPoint && selectedCategory === 'gobee_cargo') {
      void UberFreightService.quoteFareServer({
        category: 'gobee_cargo',
        originLat: originPoint.lat,
        originLng: originPoint.lng,
        destLat: destinationPoint.lat,
        destLng: destinationPoint.lng,
        distanceKm: rutaCalculada?.distanciaKm,
        weightTon: cargoWeightTon,
      }).then((q) => {
        setQuotesByCategory((prev) => ({ ...prev, gobee_cargo: q }));
        if (pricingMode === 'fixed') setOfferPriceUSD(q.fixedFareUSD);
      });
    }
  }, [cargoWeightTon, destinationPoint, originPoint, pricingMode, rutaCalculada?.distanciaKm, selectedCategory]);

  // 4. Suscripción a Supabase Realtime Broadcast del viaje activo (cero estado en memoria)
  useEffect(() => {
    if (!activeTrip) return;

    const unsubTracking = UberFreightService.subscribeTripTracking(activeTrip.id, (evt) => {
      if (evt.type === 'TRIP_ACCEPTED') {
        setActiveTrip((prev) =>
          prev
            ? {
                ...prev,
                status: 'accepted',
                agreedPriceUSD: Number(evt.payload.agreedPriceUSD) || prev.agreedPriceUSD,
                driver: {
                  id: String(evt.payload.driverId || ''),
                  name: String(evt.payload.driverName || 'Conductor Gobee'),
                  plate: String(evt.payload.plate || ''),
                  vehicleLabel: String(evt.payload.vehicleLabel || GOBEE_CATEGORY_MAP[prev.category].name),
                  rating: Number(evt.payload.rating || 4.9),
                  tripsCount: Number(evt.payload.tripsCount || 120),
                  phone: String(evt.payload.phone || ''),
                  etaMin: Number(evt.payload.etaMin || 4),
                },
              }
            : null
        );
        showToast('¡Conductor Gobee asignado! Viene en camino.');
      } else if (evt.type === 'TRIP_STARTED') {
        setActiveTrip((prev) => (prev ? { ...prev, status: 'in_transit' } : null));
        showToast('Tu viaje Gobee ha iniciado.');
      } else if (evt.type === 'TRIP_COMPLETED') {
        showToast('¡Viaje completado con éxito! Gracias por viajar con Gobee.');
        setActiveTrip(null);
        setActiveDriverTracking(null);
        setStep(1);
      } else if (evt.type === 'DRIVER_GPS') {
        const lat = Number(evt.payload.lat);
        const lng = Number(evt.payload.lng);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          setActiveDriverTracking({
            driverName: String(evt.payload.driverName || activeTrip.driver?.name || 'Conductor Gobee'),
            plate: String(evt.payload.plate || activeTrip.driver?.plate || ''),
            vehicleType: GOBEE_CATEGORY_MAP[activeTrip.category].legacyVehicleType,
            lat,
            lng,
            heading: Number(evt.payload.heading || 0),
            speedKmh: Number(evt.payload.speedKmh || 0),
            etaMinutes: activeTrip.driver?.etaMin ?? 3,
            distanceMeters: null,
            hasArrivedPickup: false,
          });
        }
      } else if (evt.type === 'CHAT_MESSAGE') {
        const text = String(evt.payload.text || '');
        if (text && evt.payload.sender === 'driver') {
          setChatMessages((prev) => [
            ...prev,
            { id: `msg-${Date.now()}`, sender: 'driver', text, at: new Date().toISOString() },
          ]);
        }
      }
    });

    // Sondeo de respaldo contra PostgreSQL /api/fletes/dispatch
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/fletes/dispatch?codigoAcceso=${encodeURIComponent(activeTrip.pinCode)}`, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = await res.json();
        const row = data?.request;
        if (row && (row.status === 'aceptada' || row.status === 'en_curso') && !activeTrip.driver && row.conductor_placa) {
          setActiveTrip((prev) =>
            prev
              ? {
                  ...prev,
                  status: row.status === 'en_curso' ? 'in_transit' : 'accepted',
                  driver: {
                    id: String(row.id),
                    name: String(row.conductor_nombre || 'Conductor Gobee'),
                    plate: String(row.conductor_placa),
                    vehicleLabel: String(row.vehiculo_nombre || GOBEE_CATEGORY_MAP[prev.category].name),
                    rating: 4.9,
                    tripsCount: 140,
                    phone: String(row.conductor_telefono || ''),
                    etaMin: 3,
                  },
                }
              : null
          );
        }
        if (data?.driverTelemetry && row?.conductor_placa) {
          setActiveDriverTracking({
            driverName: String(row.conductor_nombre || 'Conductor Gobee'),
            plate: String(row.conductor_placa),
            vehicleType: GOBEE_CATEGORY_MAP[activeTrip.category].legacyVehicleType,
            lat: data.driverTelemetry.lat,
            lng: data.driverTelemetry.lng,
            heading: data.driverTelemetry.heading,
            speedKmh: data.driverTelemetry.speedKmh,
            etaMinutes: 3,
            distanceMeters: null,
            hasArrivedPickup: false,
          });
        }
      } catch {
        // Silenciar error transitorio
      }
    }, 3500);

    return () => {
      unsubTracking();
      clearInterval(poll);
    };
  }, [activeTrip, showToast]);

  const handleOriginTextChange = (val: string) => {
    setOriginText(val);
    if (originDebounceRef.current) clearTimeout(originDebounceRef.current);
    if (val.trim().length < 2) {
      setOriginSuggestions([]);
      return;
    }
    setIsSearchingOrigin(true);
    originDebounceRef.current = setTimeout(async () => {
      try {
        const sugs = await SaraFreightRoutingService.buscarSugerenciasDireccion(val, userLocation || undefined);
        setOriginSuggestions(sugs);
      } finally {
        setIsSearchingOrigin(false);
      }
    }, 200);
  };

  const handleDestinationTextChange = (val: string) => {
    setDestinationText(val);
    if (destDebounceRef.current) clearTimeout(destDebounceRef.current);
    if (val.trim().length < 2) {
      setDestinationSuggestions([]);
      return;
    }
    setIsSearchingDest(true);
    destDebounceRef.current = setTimeout(async () => {
      try {
        const bias: [number, number] | undefined = originPoint
          ? [originPoint.lat, originPoint.lng]
          : userLocation || undefined;
        const sugs = await SaraFreightRoutingService.buscarSugerenciasDireccion(val, bias);
        setDestinationSuggestions(sugs);
      } finally {
        setIsSearchingDest(false);
      }
    }, 200);
  };

  const handleSelectOriginSuggestion = (sug: SugerenciaDireccion) => {
    originLockedRef.current = true;
    const pt: GobeeGeoPoint = {
      label: sug.titulo,
      lat: sug.lat,
      lng: sug.lng,
      city: sug.ciudad,
      province: sug.provincia,
    };
    setOriginPoint(pt);
    setOriginText(sug.titulo);
    setOriginSuggestions([]);
    if (destinationPoint) {
      void computeRouteAndQuotes(pt, destinationPoint);
    }
  };

  const handleSelectDestinationSuggestion = (sug: SugerenciaDireccion) => {
    const pt: GobeeGeoPoint = {
      label: sug.titulo,
      lat: sug.lat,
      lng: sug.lng,
      city: sug.ciudad,
      province: sug.provincia,
    };
    setDestinationPoint(pt);
    setDestinationText(sug.titulo);
    setDestinationSuggestions([]);
    if (originPoint) {
      void computeRouteAndQuotes(originPoint, pt);
    }
  };

  const handleConfirmMagneticPin = (lat: number, lng: number) => {
    const label = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    const pt: GobeeGeoPoint = { label, lat, lng };
    if (magneticPinTarget === 'origin') {
      originLockedRef.current = true;
      setOriginPoint(pt);
      setOriginText(label);
      if (destinationPoint) void computeRouteAndQuotes(pt, destinationPoint);
    } else if (magneticPinTarget === 'destination') {
      setDestinationPoint(pt);
      setDestinationText(label);
      if (originPoint) void computeRouteAndQuotes(originPoint, pt);
    }
    setMagneticPinTarget(null);
  };

  const handleSwapPoints = () => {
    if (!originPoint || !destinationPoint) return;
    const prevOrig = originPoint;
    const prevDest = destinationPoint;
    setOriginPoint(prevDest);
    setDestinationPoint(prevOrig);
    setOriginText(prevDest.label);
    setDestinationText(prevOrig.label);
    void computeRouteAndQuotes(prevDest, prevOrig);
  };

  const handleSelectCategory = (cat: GobeeCategoryId) => {
    setSelectedCategory(cat);
    const q = quotesByCategory[cat];
    if (q) setOfferPriceUSD(q.fixedFareUSD);
  };

  const handleRequestRide = async () => {
    if (!originPoint || !destinationPoint) return;
    setIsSubmitting(true);
    try {
      const quote = quotesByCategory[selectedCategory];
      const agreedPrice =
        pricingMode === 'offer'
          ? offerPriceUSD
          : quote?.fixedFareUSD ?? GOBEE_CATEGORY_MAP[selectedCategory].minFareUSD;
      const pinCode = String(Math.floor(1000 + Math.random() * 9000));
      const trackingToken = `gobee-${Date.now().toString(36)}-${pinCode}`;

      // 1. Persistir solicitud en PostgreSQL (/api/fletes/dispatch)
      const res = await fetch('/api/fletes/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origen: originPoint.label,
          destino: destinationPoint.label,
          coordsOrigen: [originPoint.lat, originPoint.lng],
          coordsDestino: [destinationPoint.lat, destinationPoint.lng],
          distanciaKm: quote?.distanceKm ?? rutaCalculada?.distanciaKm ?? 2.0,
          duracionMinutos: quote?.durationMin ?? rutaCalculada?.duracionMinutos ?? 8,
          tarifa: agreedPrice,
          codigoAcceso: pinCode,
          tipoVehiculo: selectedCategory,
          material: selectedCategory === 'gobee_cargo' ? `${cargoMaterial} (${cargoWeightTon}T)` : GOBEE_CATEGORY_MAP[selectedCategory].name,
        }),
      });

      const data = await res.json().catch(() => null);
      const tripId = String(data?.request?.id || `GOBEE-${Date.now()}`);

      const newTrip: GobeeActiveTrip = {
        id: tripId,
        orderId: data?.request?.id,
        category: selectedCategory,
        origin: originPoint,
        destination: destinationPoint,
        distanceKm: quote?.distanceKm ?? rutaCalculada?.distanciaKm ?? 2.0,
        durationMin: quote?.durationMin ?? rutaCalculada?.duracionMinutos ?? 8,
        pricingMode,
        agreedPriceUSD: agreedPrice,
        status: 'searching',
        pinCode,
        trackingToken,
        paymentMethod,
        material: selectedCategory === 'gobee_cargo' ? cargoMaterial : undefined,
        weightTon: selectedCategory === 'gobee_cargo' ? cargoWeightTon : undefined,
      };

      setActiveTrip(newTrip);

      // 2. Emitir solicitud en vivo a conductores vía Supabase Realtime Broadcast
      await UberFreightService.broadcastEvent(
        {
          type: 'TRIP_REQUESTED',
          orderId: tripId,
          payload: {
            id: tripId,
            category: selectedCategory,
            originLabel: originPoint.label,
            destLabel: destinationPoint.label,
            originCoords: [originPoint.lat, originPoint.lng],
            destCoords: [destinationPoint.lat, destinationPoint.lng],
            distanceKm: newTrip.distanceKm,
            durationMin: newTrip.durationMin,
            grossFareUSD: agreedPrice,
            pinCode,
            material: newTrip.material,
            weightTon: newTrip.weightTon,
          },
        },
        'dispatch'
      );

      showToast(`Solicitud ${GOBEE_CATEGORY_MAP[selectedCategory].name} enviada a conductores cercanos.`);
    } catch {
      showToast('Error enviando la solicitud. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelTrip = async () => {
    if (!activeTrip) return;
    await fetch('/api/fletes/dispatch', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigoAcceso: activeTrip.pinCode, status: 'cancelada' }),
    }).catch(() => {});

    await UberFreightService.broadcastEvent(
      { type: 'TRIP_CANCELLED', orderId: activeTrip.id, payload: { pinCode: activeTrip.pinCode } },
      'dispatch'
    );

    setActiveTrip(null);
    setActiveDriverTracking(null);
    setChatMessages([]);
    showToast('Solicitud cancelada.');
  };

  const handleSendChat = (text: string) => {
    if (!activeTrip) return;
    setChatMessages((prev) => [
      ...prev,
      { id: `msg-${Date.now()}`, sender: 'rider', text, at: new Date().toISOString() },
    ]);
    void UberFreightService.broadcastEvent(
      {
        type: 'CHAT_MESSAGE',
        orderId: activeTrip.id,
        payload: { sender: 'rider', text },
      },
      'tracking'
    );
  };

  return (
    <main className="min-h-dvh bg-[#FAFAFA] text-[#111827] flex flex-col">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[600] rounded-2xl bg-[#111827] text-white px-4 py-2.5 text-xs font-bold shadow-xl border border-[#FDBE3B]/50">
          {toast}
        </div>
      )}

      <GobeeMapCanvas
        userLocation={userLocation}
        userLocationAccuracy={userLocationAccuracy}
        originPoint={originPoint}
        destinationPoint={destinationPoint}
        routeCoords={rutaCalculada?.coordenadasRuta}
        nearbyVehicles={nearbyVehicles}
        selectedVehicleType={GOBEE_CATEGORY_MAP[selectedCategory].legacyVehicleType}
        isSearchingDriver={activeTrip?.status === 'searching'}
        magneticPinTarget={magneticPinTarget}
        activeDriverTracking={activeDriverTracking}
        onRecenterGps={() => {
          if (userLocation) {
            setOriginPoint({ label: 'Mi ubicación actual (GPS)', lat: userLocation[0], lng: userLocation[1] });
            setOriginText('Mi ubicación actual (GPS)');
          }
        }}
        onMapClick={(lat, lng) => {
          if (magneticPinTarget) {
            handleConfirmMagneticPin(lat, lng);
          }
        }}
        onOriginDragEnd={(lat, lng) => {
          const pt: GobeeGeoPoint = { label: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng };
          setOriginPoint(pt);
          setOriginText(pt.label);
          if (destinationPoint) void computeRouteAndQuotes(pt, destinationPoint);
        }}
        onDestinationDragEnd={(lat, lng) => {
          const pt: GobeeGeoPoint = { label: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng };
          setDestinationPoint(pt);
          setDestinationText(pt.label);
          if (originPoint) void computeRouteAndQuotes(originPoint, pt);
        }}
        onConfirmMagneticPin={handleConfirmMagneticPin}
        onCancelMagneticPin={() => setMagneticPinTarget(null)}
      />

      {activeTrip ? (
        <ActiveTripHUD
          trip={activeTrip}
          chatMessages={chatMessages}
          onSendChatMessage={handleSendChat}
          onCancelTrip={() => void handleCancelTrip()}
        />
      ) : (
        <RideStepSelector
          step={step}
          onStepChange={setStep}
          originText={originText}
          destinationText={destinationText}
          originSuggestions={originSuggestions}
          destinationSuggestions={destinationSuggestions}
          isSearchingOrigin={isSearchingOrigin}
          isSearchingDest={isSearchingDest}
          isCalculatingRoute={isCalculatingRoute}
          onOriginTextChange={handleOriginTextChange}
          onDestinationTextChange={handleDestinationTextChange}
          onSelectOriginSuggestion={handleSelectOriginSuggestion}
          onSelectDestinationSuggestion={handleSelectDestinationSuggestion}
          onSwapPoints={handleSwapPoints}
          onActivateMagneticPin={setMagneticPinTarget}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          quotesByCategory={quotesByCategory}
          pricingMode={pricingMode}
          onPricingModeChange={setPricingMode}
          offerPriceUSD={offerPriceUSD}
          onOfferPriceChange={setOfferPriceUSD}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          cargoMaterial={cargoMaterial}
          cargoWeightTon={cargoWeightTon}
          onCargoMaterialChange={setCargoMaterial}
          onCargoWeightChange={setCargoWeightTon}
          canProceedToStep2={Boolean(originPoint && destinationPoint)}
          isSubmitting={isSubmitting}
          onRequestRide={() => void handleRequestRide()}
        />
      )}
    </main>
  );
}
