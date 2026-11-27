'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { DriverHeaderWallet } from '@/components/gobee/driver/DriverHeaderWallet';
import { DriverRadarSwitch } from '@/components/gobee/driver/DriverRadarSwitch';
import {
  IncomingRequestCard,
  type EpodSubmissionPayload,
} from '@/components/gobee/driver/IncomingRequestCard';
import { UberFreightService } from '@/lib/services/uberFreightService';
import { startRealGpsWatcher, haversineMeters } from '@/lib/fletes/saraGpsTelemetryEngine';
import {
  createGobeeWakeLock,
  enqueueOfflineGpsSample,
  flushOfflineGpsQueue,
  getOfflineGpsQueueCount,
} from '@/lib/gobee/gobeeIndexedDbQueue';
import {
  GOBEE_CATEGORY_MAP,
  type GobeeCategoryId,
  type GobeeDriverVerificationState,
  type GobeeIncomingRequest,
} from '@/lib/gobee/gobeeTypes';
import { getDriverWalletStateAction } from '@/app/actions/saraFletesWalletActions';

const SaraFletesMap = dynamic(() => import('@/components/fletes/SaraFletesMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0F172A] flex flex-col items-center justify-center text-slate-400 gap-2">
      <Loader2 className="w-7 h-7 text-[#FDBE3B] animate-spin" />
      <span className="text-xs font-bold">Cargando radar satelital Gobee...</span>
    </div>
  ),
});

export default function GobeeDriverPage() {
  const router = useRouter();
  const supabase = createClient();

  const [authLoading, setAuthLoading] = useState(true);
  const [driverId, setDriverId] = useState<string>('');
  const [driverName, setDriverName] = useState<string>('Conductor Gobee');
  const [driverPlate, setDriverPlate] = useState<string>('');

  const [walletBalanceUSD, setWalletBalanceUSD] = useState<number>(0);
  const [dailyNetEarningsUSD, setDailyNetEarningsUSD] = useState<number>(0);
  const [tripsToday, setTripsToday] = useState<number>(0);
  const [verification, setVerification] = useState<GobeeDriverVerificationState>({
    cedula: true,
    licencia: true,
    matricula: false,
    biometria: false,
  });

  const [isOnline, setIsOnline] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [isNetworkOnline, setIsNetworkOnline] = useState(true);
  const [pendingOfflineGpsCount, setPendingOfflineGpsCount] = useState(0);
  const [isFlushingQueue, setIsFlushingQueue] = useState(false);
  const [activeCategory, setActiveCategory] = useState<GobeeCategoryId>('gobee_go');
  const [backhaulEnabled, setBackhaulEnabled] = useState(true);

  const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null);
  const [driverHeading, setDriverHeading] = useState(0);
  const [driverSpeedKmh, setDriverSpeedKmh] = useState(0);
  const [driverAccuracyM, setDriverAccuracyM] = useState(15);

  const [activeRequest, setActiveRequest] = useState<GobeeIncomingRequest | null>(null);
  const [tripPhase, setTripPhase] = useState<'incoming' | 'accepted' | 'in_transit'>('incoming');
  const [toast, setToast] = useState<string | null>(null);

  const wakeLockRef = useRef(createGobeeWakeLock());
  const dismissedIdsRef = useRef<Set<string>>(new Set());
  const lastGpsPushRef = useRef<number>(0);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  // 1. Autenticación obligatoria del conductor vía supabase.auth.getUser()
  useEffect(() => {
    let cancelled = false;
    async function verifyDriver() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (cancelled) return;
      if (error || !user) {
        router.replace('/modulos/fletes/auth?rol=conductor&redirectTo=/modulos/fletes/conductores');
        return;
      }

      const plate = String(user.user_metadata?.placa || '').trim().toUpperCase();
      const name = String(user.user_metadata?.full_name || user.email || 'Conductor Gobee');
      setDriverId(user.id);
      setDriverName(name);
      setDriverPlate(plate);
      setAuthLoading(false);

      if (plate) {
        getDriverWalletStateAction(plate)
          .then((res) => {
            if (!cancelled && typeof res?.saldo === 'number') {
              setWalletBalanceUSD(res.saldo);
            }
          })
          .catch(() => {});
      }
    }
    void verifyDriver();
    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  // 2. Monitoreo de red y conteo inicial de cola GPS IndexedDB
  const handleFlushOfflineQueue = useCallback(async () => {
    if (isFlushingQueue) return;
    setIsFlushingQueue(true);
    try {
      const res = await flushOfflineGpsQueue(async (batch) => {
        const last = batch[batch.length - 1];
        if (!last) return true;
        return UberFreightService.upsertDriverPresence({
          driverId: last.driverId,
          driverName,
          plate: last.plate || 'SIN-PLACA',
          category: (last.category as GobeeCategoryId) || activeCategory,
          isOnline,
          lat: last.lat,
          lng: last.lng,
          heading: last.heading,
          speedKmh: last.speedKmh,
          accuracyM: last.accuracyM,
          activeOrderId: last.orderId || null,
        });
      });
      setPendingOfflineGpsCount(res.remaining);
      if (res.synced > 0) {
        showToast(`Sincronizados ${res.synced} puntos GPS desde IndexedDB.`);
      }
    } finally {
      setIsFlushingQueue(false);
    }
  }, [activeCategory, driverName, isFlushingQueue, isOnline, showToast]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsNetworkOnline(navigator.onLine);
    void getOfflineGpsQueueCount().then(setPendingOfflineGpsCount);

    const onOnline = () => {
      setIsNetworkOnline(true);
      void handleFlushOfflineQueue();
    };
    const onOffline = () => setIsNetworkOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [handleFlushOfflineQueue]);

  // 3. Control de Screen Wake Lock mientras el conductor está En Línea
  useEffect(() => {
    const wl = wakeLockRef.current;
    if (isOnline) {
      void wl.acquire().then(setWakeLockActive);
    } else {
      void wl.release().then(() => setWakeLockActive(false));
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && isOnline) {
        void wl.acquire().then(setWakeLockActive);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [isOnline]);

  // 4. Watcher GPS real + publicación PostGIS o cola offline IndexedDB
  useEffect(() => {
    if (authLoading || !driverId) return;
    const stop = startRealGpsWatcher({
      onFix: (fix) => {
        const coords: [number, number] = [Number(fix.lat.toFixed(6)), Number(fix.lng.toFixed(6))];
        setDriverLocation(coords);
        setDriverHeading(fix.heading);
        setDriverSpeedKmh(fix.speedKmh);
        setDriverAccuracyM(fix.accuracyM);

        if (!isOnline) return;
        const now = Date.now();
        if (now - lastGpsPushRef.current < 3000) return;
        lastGpsPushRef.current = now;

        const plateSafe = driverPlate || driverId.slice(0, 8).toUpperCase();

        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          void enqueueOfflineGpsSample({
            driverId,
            plate: plateSafe,
            category: activeCategory,
            lat: coords[0],
            lng: coords[1],
            heading: fix.heading,
            speedKmh: fix.speedKmh,
            accuracyM: fix.accuracyM,
            orderId: activeRequest?.id || null,
            recordedAt: new Date().toISOString(),
          }).then(setPendingOfflineGpsCount);
          return;
        }

        // Persistir presencia en PostGIS
        void UberFreightService.upsertDriverPresence({
          driverId,
          driverName,
          plate: plateSafe,
          category: activeCategory,
          isOnline: true,
          lat: coords[0],
          lng: coords[1],
          heading: fix.heading,
          speedKmh: fix.speedKmh,
          accuracyM: fix.accuracyM,
        });

        // Si hay viaje activo, emitir GPS por Supabase Realtime Broadcast
        if (activeRequest && (tripPhase === 'accepted' || tripPhase === 'in_transit')) {
          void UberFreightService.broadcastEvent(
            {
              type: 'DRIVER_GPS',
              orderId: activeRequest.id,
              payload: {
                driverId,
                driverName,
                plate: plateSafe,
                lat: coords[0],
                lng: coords[1],
                heading: fix.heading,
                speedKmh: fix.speedKmh,
              },
            },
            'tracking'
          );
        }
      },
    });
    return () => stop();
  }, [activeCategory, activeRequest, authLoading, driverId, driverName, driverPlate, isOnline, tripPhase]);

  // 5. Suscripción a Supabase Realtime Broadcast para recibir pedidos en vivo
  useEffect(() => {
    if (!isOnline || authLoading) return;

    const unsub = UberFreightService.subscribeDispatch((evt) => {
      if (evt.type === 'TRIP_REQUESTED' && !activeRequest) {
        const reqId = String(evt.payload.id || evt.orderId);
        if (dismissedIdsRef.current.has(reqId)) return;

        const cat = (evt.payload.category as GobeeCategoryId) || 'gobee_go';
        const catCfg = GOBEE_CATEGORY_MAP[cat] || GOBEE_CATEGORY_MAP.gobee_go;
        const gross = Number(evt.payload.grossFareUSD || catCfg.minFareUSD);
        const commPct = Math.round(catCfg.commissionRate * 100);
        const net = Number((gross * (1 - catCfg.commissionRate)).toFixed(2));
        const origCoords = (evt.payload.originCoords as [number, number]) || [0, 0];
        const destCoords = (evt.payload.destCoords as [number, number]) || [0, 0];

        const pickupKm =
          driverLocation && origCoords[0] !== 0
            ? Number((haversineMeters(driverLocation, origCoords) / 1000).toFixed(1))
            : 1.2;

        setActiveRequest({
          id: reqId,
          category: cat,
          originLabel: String(evt.payload.originLabel || 'Origen GPS'),
          destLabel: String(evt.payload.destLabel || 'Destino'),
          originCoords: origCoords,
          destCoords: destCoords,
          distanceKm: Number(evt.payload.distanceKm || 2.5),
          pickupDistanceKm: pickupKm,
          durationMin: Number(evt.payload.durationMin || 8),
          grossFareUSD: gross,
          commissionPct: commPct,
          netEarningsUSD: net,
          isBackhaul: backhaulEnabled && cat === 'gobee_cargo',
          backhaulBonusLabel: backhaulEnabled && cat === 'gobee_cargo' ? 'Retorno Backhaul +25%' : undefined,
          material: evt.payload.material ? String(evt.payload.material) : undefined,
          weightTon: evt.payload.weightTon ? Number(evt.payload.weightTon) : undefined,
          pinCode: String(evt.payload.pinCode || '0000'),
          customerName: 'Cliente Gobee',
          receivedAt: Date.now(),
        });
        setTripPhase('incoming');
      } else if (evt.type === 'TRIP_CANCELLED' && activeRequest && evt.orderId === activeRequest.id) {
        setActiveRequest(null);
        setTripPhase('incoming');
        showToast('El cliente canceló la solicitud.');
      }
    });

    return () => unsub();
  }, [activeRequest, authLoading, backhaulEnabled, driverLocation, isOnline, showToast]);

  const handleToggleOnline = async () => {
    const nextOnline = !isOnline;
    setIsOnline(nextOnline);
    if (driverLocation && driverId) {
      await UberFreightService.upsertDriverPresence({
        driverId,
        driverName,
        plate: driverPlate || driverId.slice(0, 8).toUpperCase(),
        category: activeCategory,
        isOnline: nextOnline,
        lat: driverLocation[0],
        lng: driverLocation[1],
        heading: driverHeading,
        speedKmh: driverSpeedKmh,
        accuracyM: driverAccuracyM,
      });
    }
    showToast(nextOnline ? 'Radar Gobee En Línea · Wake Lock activo.' : 'Radar pausado · Desconectado.');
  };

  const handleAcceptRequest = async (req: GobeeIncomingRequest) => {
    const plateSafe = driverPlate || driverId.slice(0, 8).toUpperCase();
    setTripPhase('accepted');

    await fetch('/api/fletes/dispatch', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigoAcceso: req.pinCode,
        status: 'aceptada',
        conductorNombre: driverName,
        conductorPlaca: plateSafe,
        vehiculoNombre: GOBEE_CATEGORY_MAP[req.category].name,
        tarifaAcordada: req.grossFareUSD,
      }),
    }).catch(() => {});

    await UberFreightService.broadcastEvent(
      {
        type: 'TRIP_ACCEPTED',
        orderId: req.id,
        payload: {
          driverId,
          driverName,
          plate: plateSafe,
          vehicleLabel: GOBEE_CATEGORY_MAP[req.category].name,
          rating: 4.9,
          tripsCount: 140 + tripsToday,
          etaMin: Math.max(2, Math.ceil(req.pickupDistanceKm * 2)),
          agreedPriceUSD: req.grossFareUSD,
        },
      },
      'tracking'
    );

    showToast('Viaje aceptado. Dirígete al punto de recogida.');
  };

  const handleDeclineRequest = useCallback((reqId: string) => {
    dismissedIdsRef.current.add(reqId);
    setActiveRequest(null);
    setTripPhase('incoming');
  }, []);

  const handleStartTripWithPin = async (pin: string) => {
    if (!activeRequest) return;
    if (activeRequest.pinCode && pin !== activeRequest.pinCode) {
      showToast('PIN incorrecto. Verifica el código con el cliente.');
      return;
    }
    setTripPhase('in_transit');

    await fetch('/api/fletes/dispatch', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigoAcceso: activeRequest.pinCode, status: 'en_curso' }),
    }).catch(() => {});

    await UberFreightService.broadcastEvent(
      { type: 'TRIP_STARTED', orderId: activeRequest.id, payload: { startedAt: Date.now() } },
      'tracking'
    );
    showToast('Viaje iniciado. Al llegar, cierra con e-POD.');
  };

  const handleCompleteWithEpod = async (epod: EpodSubmissionPayload) => {
    if (!activeRequest) return;

    await fetch('/api/fletes/dispatch', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigoAcceso: activeRequest.pinCode, status: 'completada' }),
    }).catch(() => {});

    await UberFreightService.broadcastEvent(
      {
        type: 'TRIP_COMPLETED',
        orderId: activeRequest.id,
        payload: {
          receiverName: epod.receiverName,
          sha256: epod.sha256,
          completedAt: Date.now(),
        },
      },
      'tracking'
    );

    setDailyNetEarningsUSD((prev) => Number((prev + activeRequest.netEarningsUSD).toFixed(2)));
    setTripsToday((prev) => prev + 1);
    setActiveRequest(null);
    setTripPhase('incoming');
    showToast(`Entrega e-POD cerrada (SHA-256). +$${activeRequest.netEarningsUSD.toFixed(2)} netos.`);
  };

  if (authLoading) {
    return (
      <main className="min-h-dvh bg-[#0F172A] text-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#FDBE3B] animate-spin" />
        <p className="text-xs font-bold text-slate-300">Verificando credenciales de conductor Gobee...</p>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#0F172A] text-white flex flex-col">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[600] rounded-2xl bg-[#FDBE3B] text-[#111827] px-4 py-2.5 text-xs font-black shadow-2xl">
          {toast}
        </div>
      )}

      <DriverHeaderWallet
        driverName={driverName}
        plate={driverPlate}
        walletBalanceUSD={walletBalanceUSD}
        dailyNetEarningsUSD={dailyNetEarningsUSD}
        tripsToday={tripsToday}
        verification={verification}
        onQuickTopUp={() => showToast('Recargas prepago disponibles vía Kushki, Deuna! o PayPhone.')}
        onToggleVerificationStep={(key) =>
          setVerification((prev) => ({ ...prev, [key]: !prev[key] }))
        }
      />

      <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-4 space-y-4">
        <DriverRadarSwitch
          isOnline={isOnline}
          wakeLockActive={wakeLockActive}
          isNetworkOnline={isNetworkOnline}
          pendingOfflineGpsCount={pendingOfflineGpsCount}
          isFlushingQueue={isFlushingQueue}
          activeCategory={activeCategory}
          backhaulEnabled={backhaulEnabled}
          onToggleOnline={() => void handleToggleOnline()}
          onSelectCategory={setActiveCategory}
          onToggleBackhaul={() => setBackhaulEnabled((v) => !v)}
          onFlushOfflineQueue={() => void handleFlushOfflineQueue()}
        />

        {activeRequest ? (
          <IncomingRequestCard
            request={activeRequest}
            tripPhase={tripPhase}
            onAccept={(req) => void handleAcceptRequest(req)}
            onDecline={handleDeclineRequest}
            onStartTripWithPin={(pin) => void handleStartTripWithPin(pin)}
            onCompleteWithEpod={handleCompleteWithEpod}
          />
        ) : (
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-4 flex items-center justify-between gap-3">
            <div className="text-xs">
              <p className="font-bold text-slate-200">
                {isOnline ? 'Escuchando canal Supabase Realtime Broadcast...' : 'Activa En Línea para recibir viajes'}
              </p>
              <p className="text-slate-400 mt-0.5">
                Categoría activa: {GOBEE_CATEGORY_MAP[activeCategory].name} · Cobertura PostGIS
              </p>
            </div>
            {walletBalanceUSD < 5 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
                <ShieldAlert className="w-3.5 h-3.5" />
                Saldo bajo
              </span>
            )}
          </div>
        )}

        {/* Mapa de Radar del Conductor */}
        <div className="w-full h-[42dvh] min-h-[280px] rounded-3xl overflow-hidden border border-slate-800 shadow-xl">
          <SaraFletesMap
            userLocation={driverLocation}
            userLocationAccuracy={driverAccuracyM}
            origenCoords={activeRequest?.originCoords || null}
            destinoCoords={activeRequest?.destCoords || null}
            origenNombre={activeRequest?.originLabel}
            destinoNombre={activeRequest?.destLabel}
            vehiculoSeleccionado={GOBEE_CATEGORY_MAP[activeCategory].legacyVehicleType}
            tipoModalidad="fletes"
            isSearchingDriver={isOnline && !activeRequest}
          />
        </div>
      </div>
    </main>
  );
}
