'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Crosshair, Loader2, MapPin, Navigation, ShieldCheck } from 'lucide-react';
import type { ActiveDriverTrackingProp, VehiculoMapa } from '@/components/fletes/SaraFletesMap';
import type { CategoriaVehiculo } from '@/lib/services/saraFreightPricingService';
import { GOBEE_BRAND, type GobeeGeoPoint } from '@/lib/gobee/gobeeTypes';

const SaraFletesMap = dynamic(() => import('@/components/fletes/SaraFletesMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#FAFAFA] flex flex-col items-center justify-center text-[#111827] gap-3">
      <div className="w-12 h-12 rounded-2xl bg-[#FDBE3B] flex items-center justify-center shadow-md">
        <Loader2 className="w-6 h-6 text-[#111827] animate-spin" />
      </div>
      <span className="text-sm font-bold tracking-tight">Cargando mapa Gobee & rutas OSRM...</span>
    </div>
  ),
});

export interface GobeeMapCanvasProps {
  userLocation: [number, number] | null;
  userLocationAccuracy: number | null;
  originPoint: GobeeGeoPoint | null;
  destinationPoint: GobeeGeoPoint | null;
  routeCoords?: [number, number][];
  nearbyVehicles: VehiculoMapa[];
  selectedVehicleType: CategoriaVehiculo;
  isSearchingDriver: boolean;
  magneticPinTarget: 'origin' | 'destination' | null;
  activeDriverTracking: ActiveDriverTrackingProp | null;
  onRecenterGps: () => void;
  onMapClick: (lat: number, lng: number) => void;
  onOriginDragEnd: (lat: number, lng: number) => void;
  onDestinationDragEnd: (lat: number, lng: number) => void;
  onConfirmMagneticPin: (lat: number, lng: number) => void;
  onCancelMagneticPin: () => void;
}

export function GobeeMapCanvas({
  userLocation,
  userLocationAccuracy,
  originPoint,
  destinationPoint,
  routeCoords,
  nearbyVehicles,
  selectedVehicleType,
  isSearchingDriver,
  magneticPinTarget,
  activeDriverTracking,
  onRecenterGps,
  onMapClick,
  onOriginDragEnd,
  onDestinationDragEnd,
  onConfirmMagneticPin,
  onCancelMagneticPin,
}: GobeeMapCanvasProps) {
  return (
    <section
      aria-label="Mapa interactivo Gobee"
      className="relative w-full h-[68dvh] sm:h-[70dvh] bg-[#FAFAFA] overflow-hidden"
    >
      {/* Barra superior flotante con identidad GoBee */}
      <div className="pointer-events-none absolute top-3 inset-x-3 z-[400] flex items-center justify-between gap-2">
        <div className="pointer-events-auto flex items-center gap-2.5 rounded-2xl bg-white/95 backdrop-blur-md px-3.5 py-2 shadow-lg border border-black/5">
          <div className="w-8 h-8 rounded-xl bg-[#FDBE3B] flex items-center justify-center shadow-sm">
            <Navigation className="w-4 h-4 text-[#111827] fill-[#111827]" />
          </div>
          <div className="leading-tight">
            <span className="font-black text-base tracking-tight text-[#111827]">GoBee</span>
            <p className="text-[10px] font-medium text-neutral-500">{GOBEE_BRAND.seal}</p>
          </div>
        </div>
      </div>

      {/* Indicador de Pin Magnético activo */}
      {magneticPinTarget && (
        <div className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-2 rounded-full bg-[#111827] text-white px-4 py-2 text-xs font-bold shadow-xl border border-[#FDBE3B]/60">
          <MapPin className="w-3.5 h-3.5 text-[#FDBE3B]" />
          <span>
            Mueve el mapa para fijar {magneticPinTarget === 'origin' ? 'tu recogida' : 'tu destino'}
          </span>
        </div>
      )}

      {/* Mapa Leaflet + OSRM */}
      <SaraFletesMap
        userLocation={userLocation}
        userLocationAccuracy={userLocationAccuracy}
        origenCoords={originPoint ? [originPoint.lat, originPoint.lng] : null}
        destinoCoords={destinationPoint ? [destinationPoint.lat, destinationPoint.lng] : null}
        origenNombre={originPoint?.label}
        destinoNombre={destinationPoint?.label}
        rutaCoordenadas={routeCoords}
        vehiculosCercanos={nearbyVehicles}
        vehiculoSeleccionado={selectedVehicleType}
        tipoModalidad="viajes"
        isSearchingDriver={isSearchingDriver}
        searchRadiusMeters={isSearchingDriver ? 2500 : null}
        activeDriverTracking={activeDriverTracking}
        precisionPinMode={Boolean(magneticPinTarget)}
        onMapClick={onMapClick}
        onOriginDragEnd={onOriginDragEnd}
        onDestinationDragEnd={onDestinationDragEnd}
        onConfirmPrecisionPin={onConfirmMagneticPin}
        onCancelPrecisionPin={onCancelMagneticPin}
      />

      {/* Botón flotante de recentrado GPS y estado PostGIS */}
      <div className="absolute bottom-5 right-3 z-[400] flex flex-col items-end gap-2">
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur px-3 py-1.5 text-[11px] font-semibold text-[#111827] shadow border border-black/5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{nearbyVehicles.length} conductores en radar</span>
        </div>

        <button
          type="button"
          onClick={onRecenterGps}
          aria-label="Recentrar en mi ubicación GPS"
          className="min-w-[46px] min-h-[46px] rounded-2xl bg-white hover:bg-neutral-100 text-[#111827] shadow-lg border border-black/10 flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
        >
          <Crosshair className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
