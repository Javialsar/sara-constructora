'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, Circle, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { CategoriaVehiculo, CATALOGO_VEHICULOS_SARA } from '@/lib/services/saraFreightPricingService';

export type MapLayerType = 'google_streets' | 'google_hybrid' | 'esri_satellite' | 'osm_streets';

export const MAP_TILE_PROVIDERS: Record<MapLayerType, { name: string; url: string; subdomains?: string[]; maxZoom: number; icon: string }> = {
  google_streets: {
    name: 'Google Maps (Calles & Tráfico)',
    url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
    icon: '🗺️'
  },
  google_hybrid: {
    name: 'Google Satélite HD (Con Calles)',
    url: 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
    icon: '🛰️'
  },
  esri_satellite: {
    name: 'Esri Satelital Mundial',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 19,
    icon: '🌍'
  },
  osm_streets: {
    name: 'OpenStreetMap Oficial',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19,
    icon: '🌐'
  }
};

export interface VehiculoMapa {
  id: string;
  nombreChofer: string;
  placa: string;
  tipoVehiculo: CategoriaVehiculo;
  lat: number;
  lng: number;
  rating: number;
  telefono?: string;
  disponible: boolean;
}

export interface SaraFletesMapProps {
  userLocation: [number, number] | null;
  origenCoords: [number, number] | null;
  destinoCoords: [number, number] | null;
  origenNombre?: string;
  destinoNombre?: string;
  rutaCoordenadas?: [number, number][];
  vehiculosCercanos?: VehiculoMapa[];
  vehiculoSeleccionado?: CategoriaVehiculo;
  tipoModalidad?: 'viajes' | 'mandaditos' | 'fletes' | 'renta';
  onMapClick?: (lat: number, lng: number) => void;
  onSelectVehiculo?: (vehiculo: VehiculoMapa) => void;
  onOriginDragEnd?: (lat: number, lng: number) => void;
  onDestinationDragEnd?: (lat: number, lng: number) => void;
  searchRadiusMeters?: number | null;
  isSearchingDriver?: boolean;
}

// Generadores de Iconos L.divIcon personalizados para evitar problemas de assets externos
const crearIconoPunto = (tipo: 'origen' | 'destino' | 'usuario', modalidad?: string) => {
  if (tipo === 'usuario') {
    return L.divIcon({
      className: 'sara-map-marker-user',
      html: `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; pointer-events: none;">
          <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(59, 130, 246, 0.35); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; pointer-events: none;"></div>
          <div style="width: 18px; height: 18px; border-radius: 50%; background: #2563eb; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); z-index: 10; pointer-events: none;"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  }

  const isPassenger = modalidad === 'viajes' || modalidad === 'mandaditos';
  const color = tipo === 'origen' ? '#10b981' : '#f59e0b';
  const texto = tipo === 'origen' ? (isPassenger ? '📍' : 'A') : (isPassenger ? '🏁' : 'B');
  const label = tipo === 'origen' ? (isPassenger ? 'RECOGIDA' : 'CARGA') : (isPassenger ? 'DESTINO' : 'DESCARGA');

  return L.divIcon({
    className: `sara-map-marker-${tipo}`,
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.45)); cursor: grab; user-select: none; -webkit-user-drag: none; pointer-events: none;">
        <div style="background: ${color}; color: #ffffff; font-weight: 900; font-size: 14px; width: 36px; height: 36px; border-radius: 50% 50% 50% 4px; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.35); pointer-events: none;">
          <span style="transform: rotate(45deg); pointer-events: none;">${texto}</span>
        </div>
        <div style="margin-top: 3px; background: #0f172a; color: ${color}; font-size: 9px; font-weight: 800; padding: 2px 7px; border-radius: 6px; border: 1.5px solid ${color}; letter-spacing: 0.5px; white-space: nowrap; box-shadow: 0 3px 6px rgba(0,0,0,0.5); pointer-events: none;">
          ${label}
        </div>
      </div>
    `,
    iconSize: [38, 52],
    iconAnchor: [19, 48],
    popupAnchor: [0, -48]
  });
};

// Calcula rumbo geográfico (bearing en grados, 0° = Norte, sentido horario)
const calcularBearing = (from: [number, number], to: [number, number]): number => {
  const [lat1, lng1] = from;
  const [lat2, lng2] = to;
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;
  if (Math.abs(dLat) < 1e-7 && Math.abs(dLng) < 1e-7) return 0;

  const latRad = ((lat1 + lat2) / 2) * (Math.PI / 180);
  const x = dLng * Math.cos(latRad);
  const y = dLat;
  const angle = (Math.atan2(x, y) * 180) / Math.PI;
  return (angle + 360) % 360;
};

const crearIconoVehiculo = (vehiculo: VehiculoMapa, isSelected: boolean, bearing = 0) => {
  const cat = CATALOGO_VEHICULOS_SARA[vehiculo.tipoVehiculo] || CATALOGO_VEHICULOS_SARA.PICKUP_1T;
  const bgColor = isSelected ? '#f59e0b' : '#0f172a';
  const borderColor = isSelected ? '#ffffff' : '#10b981';
  const arrowColor = isSelected ? '#fbbf24' : '#34d399';
  const firstName = vehiculo.nombreChofer.split(' ')[0];

  // Diseño compacto de alta visibilidad estilo Uber / inDrive con flecha direccional rotatoria
  return L.divIcon({
    className: `sara-vehicle-marker-${vehiculo.id}`,
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.45)); transform: translateZ(0);">
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: 0; transform: rotate(${bearing}deg); transition: transform 0.35s ease-out; pointer-events: none;">
            <div style="position: absolute; top: -4px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-bottom: 7px solid ${arrowColor}; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.6));"></div>
          </div>
          <div style="position: relative; background: ${bgColor}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid ${borderColor}; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 2px 6px rgba(0,0,0,0.35);">
            ${cat.icono}
            <span style="position: absolute; top: -1px; right: -1px; width: 7px; height: 7px; border-radius: 50%; background: #10b981; border: 1.5px solid #ffffff; box-shadow: 0 0 4px rgba(16,185,129,0.9);"></span>
          </div>
        </div>
        <div style="margin-top: -1px; background: rgba(15, 23, 42, 0.88); color: #f8fafc; font-size: 8px; font-weight: 800; padding: 1px 4px; border-radius: 3px; border: 0.5px solid rgba(255,255,255,0.2); white-space: nowrap; pointer-events: none; line-height: 1;">
          ${firstName}
        </div>
      </div>
    `,
    iconSize: [36, 48],
    iconAnchor: [18, 24],
    popupAnchor: [0, -24]
  });
};

// Marcador vehicular con interpolación fluida 60FPS (requestAnimationFrame Lerp ~650ms) y rotación de rumbo
function SmoothVehicleMarker({
  vehiculo,
  isSelected,
  onSelectVehiculo,
}: {
  vehiculo: VehiculoMapa;
  isSelected: boolean;
  onSelectVehiculo?: (vehiculo: VehiculoMapa) => void;
}) {
  const markerRef = useRef<L.Marker | null>(null);
  const initialPosRef = useRef<[number, number]>([vehiculo.lat, vehiculo.lng]);
  const currentPosRef = useRef<[number, number]>([vehiculo.lat, vehiculo.lng]);
  const rafIdRef = useRef<number | null>(null);
  const [bearing, setBearing] = useState<number>(0);

  useEffect(() => {
    const startPos = currentPosRef.current;
    const targetPos: [number, number] = [vehiculo.lat, vehiculo.lng];
    const dLat = targetPos[0] - startPos[0];
    const dLng = targetPos[1] - startPos[1];

    if (Math.abs(dLat) < 1e-7 && Math.abs(dLng) < 1e-7) {
      return;
    }

    const nextBearing = calcularBearing(startPos, targetPos);
    setBearing(nextBearing);

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    const durationMs = 650;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      // Ease-out cuadrático para transición suave a 60FPS
      const eased = 1 - (1 - t) * (1 - t);

      const nextLat = startPos[0] + dLat * eased;
      const nextLng = startPos[1] + dLng * eased;
      currentPosRef.current = [nextLat, nextLng];

      if (markerRef.current) {
        markerRef.current.setLatLng([nextLat, nextLng]);
      }

      if (t < 1) {
        rafIdRef.current = requestAnimationFrame(animate);
      } else {
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [vehiculo.lat, vehiculo.lng]);

  const roundedBearing = Math.round(bearing);
  const icon = useMemo(
    () => crearIconoVehiculo(vehiculo, isSelected, roundedBearing),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vehiculo.id, vehiculo.nombreChofer, vehiculo.tipoVehiculo, isSelected, roundedBearing]
  );

  const infoVehiculo = CATALOGO_VEHICULOS_SARA[vehiculo.tipoVehiculo] || CATALOGO_VEHICULOS_SARA.PICKUP_1T;

  return (
    <Marker
      ref={markerRef}
      position={initialPosRef.current}
      icon={icon}
      eventHandlers={{
        click: () => onSelectVehiculo && onSelectVehiculo(vehiculo),
      }}
    >
      {/* Tooltip visible al pasar el mouse por encima (Hover) */}
      <Tooltip direction="top" offset={[0, -36]} opacity={1} sticky={true}>
        <div className="p-2 text-slate-900 font-sans min-w-[170px] bg-white rounded-xl shadow-2xl border border-slate-200">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1 mb-1">
            <span className="font-mono font-black text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Placa: {vehiculo.placa}
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100/60 px-1.5 py-0.5 rounded">
              ★ {vehiculo.rating}
            </span>
          </div>
          <p className="text-xs font-black text-slate-900 leading-tight">
            Conductor: {vehiculo.nombreChofer}
          </p>
          <p className="text-[11px] text-slate-600 font-medium mt-0.5 flex items-center gap-1.5">
            <span>{infoVehiculo.icono}</span>
            <span>{infoVehiculo.nombre}</span>
          </p>
          <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              En Radar (Zonificado)
            </span>
            <span className="text-slate-500 font-mono font-semibold">
              Cap: {infoVehiculo.capacidadTon}T
            </span>
          </div>
        </div>
      </Tooltip>

      <Popup>
        <div className="p-2 text-slate-800 max-w-xs">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1 mb-1.5">
            <span className="font-bold text-xs text-slate-900">{vehiculo.nombreChofer}</span>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
              ★ {vehiculo.rating}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 font-medium">
            {infoVehiculo.nombre || vehiculo.tipoVehiculo}
          </p>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
            Placa: <strong>{vehiculo.placa}</strong>
          </p>
          <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span className="text-emerald-600 font-bold">● Disponible en zona</span>
            <button
              onClick={() => onSelectVehiculo && onSelectVehiculo(vehiculo)}
              className="bg-slate-900 text-white font-bold px-2 py-0.5 rounded hover:bg-amber-500 hover:text-slate-900 transition-colors"
            >
              Seleccionar
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// Radar de búsqueda incremental de conductores con pulso visual ámbar/esmeralda a 60FPS
function SearchRadarOverlay({
  center,
  radiusMeters,
  isSearchingDriver,
}: {
  center: [number, number];
  radiusMeters: number;
  isSearchingDriver: boolean;
}) {
  const pulseCircleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!isSearchingDriver) return;

    let rafId: number | null = null;
    const cycleMs = 1800;
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = ((now - startTime) % cycleMs) / cycleMs;
      const eased = 1 - Math.pow(1 - progress, 2);

      if (pulseCircleRef.current) {
        pulseCircleRef.current.setRadius(Math.max(20, radiusMeters * (0.15 + 0.85 * eased)));
        pulseCircleRef.current.setStyle({
          opacity: (1 - progress) * 0.85,
          fillOpacity: (1 - progress) * 0.24,
        });
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isSearchingDriver, radiusMeters]);

  const primaryColor = isSearchingDriver ? '#f59e0b' : '#10b981';

  return (
    <>
      <Circle
        center={center}
        radius={radiusMeters}
        pathOptions={{
          color: primaryColor,
          fillColor: primaryColor,
          fillOpacity: isSearchingDriver ? 0.1 : 0.06,
          weight: 2,
          opacity: 0.75,
          dashArray: isSearchingDriver ? '8 6' : undefined,
        }}
      />
      {isSearchingDriver && (
        <Circle
          ref={pulseCircleRef}
          center={center}
          radius={radiusMeters * 0.2}
          pathOptions={{
            color: '#10b981',
            fillColor: '#f59e0b',
            fillOpacity: 0.2,
            weight: 2,
            opacity: 0.8,
          }}
        />
      )}
    </>
  );
}

// Controlador de cámara automática que ajusta zoom y vista en tiempo real (100% reactivo)
function MapCameraController({
  userLocation,
  origenCoords,
  destinoCoords,
  rutaCoordenadas
}: {
  userLocation: [number, number] | null;
  origenCoords: [number, number] | null;
  destinoCoords: [number, number] | null;
  rutaCoordenadas?: [number, number][];
}) {
  const map = useMap();
  const lastKeyRef = useRef<string>('');

  // Asegurar dimensiones reales de Leaflet ante redimensionamientos o carga inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    // 1. Caso ruta trazada con origen y destino
    if (origenCoords && destinoCoords) {
      const routeLen = rutaCoordenadas?.length || 0;
      const key = `route_${origenCoords[0].toFixed(5)},${origenCoords[1].toFixed(5)}_${destinoCoords[0].toFixed(5)},${destinoCoords[1].toFixed(5)}_${routeLen}`;
      if (lastKeyRef.current !== key) {
        lastKeyRef.current = key;

        const bounds = L.latLngBounds([origenCoords, destinoCoords]);
        if (rutaCoordenadas && rutaCoordenadas.length > 0) {
          rutaCoordenadas.forEach(coord => bounds.extend(coord));
        }

        // Ajuste perfecto con el fitBounds nativo de Leaflet
        map.invalidateSize();
        map.fitBounds(bounds, {
          padding: [70, 70],
          maxZoom: 16,
          animate: true
        });
      }
      return;
    }

    // 2. Caso solo destino seleccionado
    if (!origenCoords && destinoCoords) {
      const key = `dest_${destinoCoords[0].toFixed(5)},${destinoCoords[1].toFixed(5)}`;
      if (lastKeyRef.current !== key) {
        lastKeyRef.current = key;
        map.flyTo(destinoCoords, 16, { animate: true, duration: 1 });
      }
      return;
    }

    // 3. Caso origen o GPS en tiempo real (seguimiento activo)
    const targetPoint = origenCoords || userLocation;
    if (targetPoint && !destinoCoords) {
      const key = `point_${targetPoint[0].toFixed(5)},${targetPoint[1].toFixed(5)}`;
      if (lastKeyRef.current !== key) {
        lastKeyRef.current = key;
        map.flyTo(targetPoint, 16, { animate: true, duration: 1.2 });
      }
    }
  }, [map, userLocation, origenCoords, destinoCoords, rutaCoordenadas]);

  return null;
}

// Controles flotantes integrados en el mapa (Capas, GPS, Recentrado de Ruta)
function MapFloatingControls({
  userLocation,
  activeLayer,
  onSelectLayer,
  origenCoords,
  destinoCoords,
  rutaCoordenadas
}: {
  userLocation: [number, number] | null;
  activeLayer: MapLayerType;
  onSelectLayer: (layer: MapLayerType) => void;
  origenCoords: [number, number] | null;
  destinoCoords: [number, number] | null;
  rutaCoordenadas?: [number, number][];
}) {
  const map = useMap();
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  return (
    <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }} className="flex flex-col items-end gap-2 pointer-events-auto">
      {/* Selector de Capas Satélite / Tráfico / Noche */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className="bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs px-3 py-2 rounded-xl border border-slate-700 shadow-2xl flex items-center gap-2 backdrop-blur-xl transition-all cursor-pointer"
        >
          <span>{MAP_TILE_PROVIDERS[activeLayer].icon}</span>
          <span className="hidden sm:inline">{MAP_TILE_PROVIDERS[activeLayer].name}</span>
          <span className="text-[10px] text-slate-400">▼</span>
        </button>

        {showLayerMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl p-1.5 backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1">Capas de Mapa</p>
            {(Object.keys(MAP_TILE_PROVIDERS) as MapLayerType[]).map((key) => {
              const prov = MAP_TILE_PROVIDERS[key];
              const isSelected = activeLayer === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onSelectLayer(key);
                    setShowLayerMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <span>{prov.icon}</span>
                  <span className="truncate">{prov.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Botón Mi Ubicación GPS en tiempo real */}
      <button
        type="button"
        onClick={() => {
          if (typeof window !== 'undefined' && 'geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const target: [number, number] = [+pos.coords.latitude.toFixed(5), +pos.coords.longitude.toFixed(5)];
                map.flyTo(target, 17, { animate: true, duration: 1.2 });
              },
              () => {
                const target = userLocation || origenCoords;
                if (target) {
                  map.flyTo(target, 17, { animate: true, duration: 1 });
                }
              },
              { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
            );
          } else {
            const target = userLocation || origenCoords;
            if (target) {
              map.flyTo(target, 17, { animate: true, duration: 1 });
            }
          }
        }}
        title="Centrar en mi ubicación GPS en tiempo real"
        className="relative bg-slate-900/95 hover:bg-slate-800 text-blue-400 hover:text-blue-300 p-2.5 rounded-xl border border-slate-700 shadow-2xl backdrop-blur-xl transition-all cursor-pointer flex items-center justify-center w-10 h-10 active:scale-95"
      >
        <span className="text-base">🎯</span>
        {userLocation && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-slate-900 animate-ping"></span>
        )}
      </button>

      {/* Botón Centrar y Zoom a la Ruta */}
      {origenCoords && destinoCoords && (
        <button
          type="button"
          onClick={() => {
            const bounds = L.latLngBounds([origenCoords, destinoCoords]);
            if (rutaCoordenadas && rutaCoordenadas.length > 0) {
              rutaCoordenadas.forEach(coord => bounds.extend(coord));
            }
            map.fitBounds(bounds, { padding: [60, 60], maxZoom: 17, animate: true });
          }}
          title="Zoom a la ruta detallada"
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3 py-2 rounded-xl shadow-2xl transition-all cursor-pointer flex items-center gap-1.5 text-xs active:scale-95 border border-amber-400"
        >
          <span className="text-sm">🔍</span>
          <span className="hidden sm:inline font-bold">Zoom Ruta</span>
        </button>
      )}
    </div>
  );
}

// Controlador de clics en el mapa
function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

export default function SaraFletesMap({
  userLocation,
  origenCoords,
  destinoCoords,
  origenNombre,
  destinoNombre,
  rutaCoordenadas,
  vehiculosCercanos = [],
  vehiculoSeleccionado,
  tipoModalidad = 'fletes',
  onMapClick,
  onSelectVehiculo,
  onOriginDragEnd,
  onDestinationDragEnd,
  searchRadiusMeters = null,
  isSearchingDriver = false
}: SaraFletesMapProps) {
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('google_streets');

  // Simulación de circulación fluida en tiempo real sincronizada (estilo Uber / inDrive)
  const [vehiculosAnimados, setVehiculosAnimados] = useState<VehiculoMapa[]>(vehiculosCercanos);

  useEffect(() => {
    setVehiculosAnimados(vehiculosCercanos);
  }, [vehiculosCercanos]);

  useEffect(() => {
    if (!vehiculosAnimados || vehiculosAnimados.length === 0) return;

    // Intervalo de desplazamiento suave continuo sobre el mapa
    const interval = setInterval(() => {
      setVehiculosAnimados((prev) =>
        prev.map((v, idx) => {
          // Pequeño desplazamiento browniano simulando movimiento vial constante
          const angle = (Date.now() / 4000 + idx * 1.5);
          const stepLat = Math.sin(angle) * 0.00015;
          const stepLng = Math.cos(angle) * 0.00018;

          return {
            ...v,
            lat: +(v.lat + stepLat).toFixed(5),
            lng: +(v.lng + stepLng).toFixed(5)
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [vehiculosAnimados.length]);

  // Centro por defecto: Si el usuario tiene GPS activo se usa su coordenada, sino Loja/Cariamanga (-4.3285, -79.5560) o Cuenca (-2.8974, -79.0044)
  const defaultCenter: [number, number] = userLocation || origenCoords || [-4.3285, -79.5560];

  return (
    <div className="relative w-full h-full min-h-[350px] bg-slate-950 overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={14}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        attributionControl={false}
      >
        <ZoomControl position="bottomright" />
        {/* Capa de Cartografía Dinámica Seleccionada (Google Maps / Google Satélite / Esri / OSM) */}
        <TileLayer
          key={activeLayer}
          url={MAP_TILE_PROVIDERS[activeLayer].url}
          subdomains={MAP_TILE_PROVIDERS[activeLayer].subdomains || ['a', 'b', 'c']}
          maxZoom={MAP_TILE_PROVIDERS[activeLayer].maxZoom}
        />

        {/* Controles Flotantes de Capas, GPS y Recentrado */}
        <MapFloatingControls
          userLocation={userLocation}
          activeLayer={activeLayer}
          onSelectLayer={setActiveLayer}
          origenCoords={origenCoords}
          destinoCoords={destinoCoords}
          rutaCoordenadas={rutaCoordenadas}
        />

        <MapCameraController
          userLocation={userLocation}
          origenCoords={origenCoords}
          destinoCoords={destinoCoords}
          rutaCoordenadas={rutaCoordenadas}
        />

        <MapClickHandler onMapClick={onMapClick} />

        {/* 1. Marcador de Mi Ubicación Actual (GPS) */}
        {userLocation && (
          <Marker position={userLocation} icon={crearIconoPunto('usuario')}>
            <Popup>
              <div className="text-xs p-1 text-slate-800">
                <p className="font-bold text-blue-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  Tu Ubicación Actual
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Lat: {userLocation[0].toFixed(5)}, Lng: {userLocation[1].toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 2. Marcador Punto de Carga/Recogida (Origen) - Con Arrastre Manual Interactivo */}
        {origenCoords && (
          <Marker
            position={origenCoords}
            icon={crearIconoPunto('origen', tipoModalidad)}
            draggable={Boolean(onOriginDragEnd)}
            autoPan={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                if (marker) {
                  const latLng = marker.getLatLng();
                  if (onOriginDragEnd) {
                    onOriginDragEnd(latLng.lat, latLng.lng);
                  }
                }
              }
            }}
          >
            <Tooltip direction="top" offset={[0, -48]} opacity={0.95} interactive={false}>
              <div className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded shadow pointer-events-none">
                {tipoModalidad === 'viajes' || tipoModalidad === 'mandaditos'
                  ? '🟢 Punto de Recogida (Arrastra a tu puerta o Onlysoft)'
                  : '🟢 Punto de Carga (Arrastra a la calle exacta)'}
              </div>
            </Tooltip>
          </Marker>
        )}

        {/* 3. Marcador Punto de Descarga/Destino - Con Arrastre Manual Interactivo */}
        {destinoCoords && (
          <Marker
            position={destinoCoords}
            icon={crearIconoPunto('destino', tipoModalidad)}
            draggable={Boolean(onDestinationDragEnd)}
            autoPan={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                if (marker) {
                  const latLng = marker.getLatLng();
                  if (onDestinationDragEnd) {
                    onDestinationDragEnd(latLng.lat, latLng.lng);
                  }
                }
              }
            }}
          >
            <Tooltip direction="top" offset={[0, -48]} opacity={0.95} interactive={false}>
              <div className="text-[11px] font-bold text-amber-800 bg-white px-2 py-0.5 rounded shadow pointer-events-none">
                🚩 Punto de Descarga (Arrastra a la calle exacta)
              </div>
            </Tooltip>
          </Marker>
        )}

        {/* 4. Polilínea de Ruta Vial Trazada */}
        {rutaCoordenadas && rutaCoordenadas.length > 0 && (
          <>
            {/* Sombra de la ruta para contraste visual */}
            <Polyline
              positions={rutaCoordenadas}
              pathOptions={{ color: '#0f172a', weight: 8, opacity: 0.4 }}
            />
            {/* Línea principal vial */}
            <Polyline
              positions={rutaCoordenadas}
              pathOptions={{ color: '#f59e0b', weight: 5, opacity: 0.95, lineJoin: 'round' }}
            />
          </>
        )}

        {/* 4.5. Radar de Búsqueda Incremental de Conductores */}
        {origenCoords && typeof searchRadiusMeters === 'number' && searchRadiusMeters > 0 && (
          <SearchRadarOverlay
            center={origenCoords}
            radiusMeters={searchRadiusMeters}
            isSearchingDriver={Boolean(isSearchingDriver)}
          />
        )}

        {/* 5. Vehículos Cercanos Zonificados Circulando en Tiempo Real (60FPS Lerp + Bearing) */}
        {vehiculosAnimados.map((vehiculo) => {
          const isSelected = !vehiculoSeleccionado || vehiculoSeleccionado === vehiculo.tipoVehiculo;
          return (
            <SmoothVehicleMarker
              key={vehiculo.id}
              vehiculo={vehiculo}
              isSelected={isSelected}
              onSelectVehiculo={onSelectVehiculo}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
