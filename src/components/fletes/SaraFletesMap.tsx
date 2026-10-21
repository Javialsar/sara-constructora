'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

interface SaraFletesMapProps {
  userLocation: [number, number] | null;
  origenCoords: [number, number] | null;
  destinoCoords: [number, number] | null;
  origenNombre?: string;
  destinoNombre?: string;
  rutaCoordenadas?: [number, number][];
  vehiculosCercanos?: VehiculoMapa[];
  vehiculoSeleccionado?: CategoriaVehiculo;
  onMapClick?: (lat: number, lng: number) => void;
  onSelectVehiculo?: (vehiculo: VehiculoMapa) => void;
  onOriginDragEnd?: (lat: number, lng: number) => void;
  onDestinationDragEnd?: (lat: number, lng: number) => void;
}

// Generadores de Iconos L.divIcon personalizados para evitar problemas de assets externos
const crearIconoPunto = (tipo: 'origen' | 'destino' | 'usuario') => {
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

  const color = tipo === 'origen' ? '#10b981' : '#f59e0b';
  const texto = tipo === 'origen' ? 'A' : 'B';
  const label = tipo === 'origen' ? 'CARGA' : 'DESCARGA';

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

const crearIconoVehiculo = (vehiculo: VehiculoMapa, isSelected: boolean) => {
  const cat = CATALOGO_VEHICULOS_SARA[vehiculo.tipoVehiculo] || CATALOGO_VEHICULOS_SARA.PICKUP_1T;
  const bgColor = isSelected ? '#f59e0b' : '#0f172a';
  const borderColor = isSelected ? '#ffffff' : '#10b981';
  const scale = isSelected ? '1.15' : '1.0';
  const firstName = vehiculo.nombreChofer.split(' ')[0];

  return L.divIcon({
    className: `sara-vehicle-marker-${vehiculo.id}`,
    html: `
      <div style="transform: scale(${scale}); transition: all 0.2s ease-in-out; display: flex; flex-direction: column; align-items: center; cursor: pointer; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.55));">
        <div style="position: relative; background: ${bgColor}; width: 40px; height: 40px; border-radius: 12px; border: 2.5px solid ${borderColor}; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
          ${cat.icono}
          <span style="position: absolute; top: -3px; right: -3px; width: 10px; height: 10px; border-radius: 50%; background: #10b981; border: 2px solid #ffffff; box-shadow: 0 0 6px rgba(16,185,129,0.8);"></span>
        </div>
        <div style="margin-top: -3px; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${bgColor};"></div>
        <div style="margin-top: 2px; background: rgba(15, 23, 42, 0.92); color: #ffffff; font-size: 8px; font-weight: 800; padding: 2px 5px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.25); white-space: nowrap; backdrop-filter: blur(4px); box-shadow: 0 2px 4px rgba(0,0,0,0.4);">
          ${firstName} · ${cat.capacidadTon}T
        </div>
      </div>
    `,
    iconSize: [52, 60],
    iconAnchor: [26, 46],
    popupAnchor: [0, -46]
  });
};

// Controlador de cámara automática que ajusta zoom y vista sin movimientos bruscos al arrastrar
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
  const lastFittedCoordsRef = useRef<string>('');

  useEffect(() => {
    // Si no tenemos ambos puntos, centrar en usuario
    if (!origenCoords && !destinoCoords) {
      if (userLocation && !lastFittedCoordsRef.current) {
        map.flyTo(userLocation, 16, { animate: true, duration: 1.2 });
        lastFittedCoordsRef.current = 'user_init';
      }
      return;
    }

    if (origenCoords && destinoCoords) {
      const coordKey = `${origenCoords[0].toFixed(4)},${origenCoords[1].toFixed(4)}-${destinoCoords[0].toFixed(4)},${destinoCoords[1].toFixed(4)}`;
      if (lastFittedCoordsRef.current !== coordKey) {
        lastFittedCoordsRef.current = coordKey;

        const dLat = Math.abs(origenCoords[0] - destinoCoords[0]);
        const dLng = Math.abs(origenCoords[1] - destinoCoords[1]);
        const approxKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111;

        if (approxKm < 0.05) {
          // Si son prácticamente el mismo punto o < 50m, centrar directo a nivel de calle
          map.flyTo(origenCoords, 16, { animate: true, duration: 1 });
        } else {
          const bounds = L.latLngBounds([origenCoords, destinoCoords]);
          if (rutaCoordenadas && rutaCoordenadas.length > 0) {
            rutaCoordenadas.forEach(coord => bounds.extend(coord));
          }

          // Zoom dinámico de alta fidelidad:
          // Si es urbano / cantonal (< 4 km como Cariamanga), zoom 15 a 17 para ver perfectamente calles y esquinas
          const maxZ = approxKm < 4 ? 17 : approxKm < 25 ? 15 : 13;
          const minZ = approxKm < 4 ? 15 : approxKm < 25 ? 12 : 7;
          const calculatedZoom = map.getBoundsZoom(bounds, false, L.point(60, 60));
          const targetZoom = Math.max(minZ, Math.min(maxZ, calculatedZoom));

          map.setView(bounds.getCenter(), targetZoom, {
            animate: true
          });
        }
      }
    } else if (origenCoords && !destinoCoords) {
      map.flyTo(origenCoords, 16, { animate: true, duration: 1 });
    } else if (!origenCoords && destinoCoords) {
      map.flyTo(destinoCoords, 16, { animate: true, duration: 1 });
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

      {/* Botón Mi Ubicación GPS */}
      {userLocation && (
        <button
          type="button"
          onClick={() => map.flyTo(userLocation, 16, { animate: true, duration: 1.2 })}
          title="Centrar en mi ubicación GPS"
          className="bg-slate-900/90 hover:bg-slate-800 text-blue-400 hover:text-blue-300 p-2.5 rounded-xl border border-slate-700 shadow-2xl backdrop-blur-xl transition-all cursor-pointer flex items-center justify-center w-10 h-10"
        >
          <span className="text-base">📍</span>
        </button>
      )}

      {/* Botón Centrar y Zoom a la Ruta */}
      {origenCoords && destinoCoords && (
        <button
          type="button"
          onClick={() => {
            const bounds = L.latLngBounds([origenCoords, destinoCoords]);
            if (rutaCoordenadas && rutaCoordenadas.length > 0) {
              rutaCoordenadas.forEach(coord => bounds.extend(coord));
            }
            const dLat = Math.abs(origenCoords[0] - destinoCoords[0]);
            const dLng = Math.abs(origenCoords[1] - destinoCoords[1]);
            const approxKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
            const maxZ = approxKm < 4 ? 17 : approxKm < 25 ? 15 : 13;
            const minZ = approxKm < 4 ? 15 : approxKm < 25 ? 12 : 7;
            const calculatedZoom = map.getBoundsZoom(bounds, false, L.point(75, 75));
            const targetZoom = Math.max(minZ, Math.min(maxZ, calculatedZoom));
            map.setView(bounds.getCenter(), targetZoom, { animate: true });
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
  onMapClick,
  onSelectVehiculo,
  onOriginDragEnd,
  onDestinationDragEnd
}: SaraFletesMapProps) {
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('google_streets');

  // Centro por defecto: Si el usuario tiene GPS activo se usa su coordenada, sino Loja/Cariamanga (-4.3285, -79.5560) o Cuenca (-2.8974, -79.0044)
  const defaultCenter: [number, number] = userLocation || origenCoords || [-4.3285, -79.5560];

  return (
    <div className="relative w-full h-full min-h-[350px] bg-slate-950 overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={14}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        attributionControl={false}
      >
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

        {/* 2. Marcador Punto de Carga (Origen) - Con Arrastre Manual Interactivo */}
        {origenCoords && (
          <Marker
            position={origenCoords}
            icon={crearIconoPunto('origen')}
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
                🟢 Punto de Carga (Arrastra a la calle exacta)
              </div>
            </Tooltip>
          </Marker>
        )}

        {/* 3. Marcador Punto de Descarga (Destino) - Con Arrastre Manual Interactivo */}
        {destinoCoords && (
          <Marker
            position={destinoCoords}
            icon={crearIconoPunto('destino')}
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

        {/* 5. Vehículos Cercanos Zonificados con Tooltip al Pasar el Mouse (Hover) */}
        {vehiculosCercanos.map((vehiculo) => {
          const isSelected = !vehiculoSeleccionado || vehiculoSeleccionado === vehiculo.tipoVehiculo;
          const infoVehiculo = CATALOGO_VEHICULOS_SARA[vehiculo.tipoVehiculo] || CATALOGO_VEHICULOS_SARA.PICKUP_1T;
          return (
            <Marker
              key={vehiculo.id}
              position={[vehiculo.lat, vehiculo.lng]}
              icon={crearIconoVehiculo(vehiculo, isSelected)}
              eventHandlers={{
                click: () => onSelectVehiculo && onSelectVehiculo(vehiculo)
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
        })}
      </MapContainer>
    </div>
  );
}
