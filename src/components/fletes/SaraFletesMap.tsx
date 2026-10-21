'use client';

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CategoriaVehiculo, CATALOGO_VEHICULOS_SARA } from '@/lib/services/saraFreightPricingService';

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
}

// Generadores de Iconos L.divIcon personalizados para evitar problemas de assets externos
const crearIconoPunto = (tipo: 'origen' | 'destino' | 'usuario') => {
  if (tipo === 'usuario') {
    return L.divIcon({
      className: 'sara-map-marker-user',
      html: `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(59, 130, 246, 0.35); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 18px; height: 18px; border-radius: 50%; background: #2563eb; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); z-index: 10;"></div>
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
      <div style="display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.35));">
        <div style="background: ${color}; color: #ffffff; font-weight: 900; font-size: 14px; width: 34px; height: 34px; border-radius: 50% 50% 50% 4px; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff;">
          <span style="transform: rotate(45deg);">${texto}</span>
        </div>
        <div style="margin-top: 2px; background: #0f172a; color: ${color}; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; border: 1px solid ${color}80; letter-spacing: 0.5px; white-space: nowrap;">
          ${label}
        </div>
      </div>
    `,
    iconSize: [36, 48],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44]
  });
};

const crearIconoVehiculo = (tipoVehiculo: CategoriaVehiculo, isFiltered: boolean) => {
  const vehiculo = CATALOGO_VEHICULOS_SARA[tipoVehiculo] || CATALOGO_VEHICULOS_SARA.PICKUP_1T;
  const bgColor = isFiltered ? '#f59e0b' : '#334155';
  const borderColor = isFiltered ? '#ffffff' : '#64748b';
  const scale = isFiltered ? '1.15' : '0.95';

  return L.divIcon({
    className: `sara-vehicle-marker-${tipoVehiculo}`,
    html: `
      <div style="transform: scale(${scale}); transition: all 0.2s ease-in-out; display: flex; flex-direction: column; align-items: center; cursor: pointer; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4));">
        <div style="background: ${bgColor}; width: 38px; height: 38px; border-radius: 12px; border: 2.5px solid ${borderColor}; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
          ${vehiculo.icono}
        </div>
        <div style="margin-top: -4px; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${bgColor};"></div>
      </div>
    `,
    iconSize: [40, 46],
    iconAnchor: [20, 42],
    popupAnchor: [0, -42]
  });
};

// Controlador de cámara automática que ajusta zoom y vista según los puntos activos
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
  const initialCenteredRef = useRef(false);

  // 1. Ajustar límites si existen origen y destino
  useEffect(() => {
    if (origenCoords && destinoCoords) {
      const bounds = L.latLngBounds([origenCoords, destinoCoords]);
      if (rutaCoordenadas && rutaCoordenadas.length > 0) {
        rutaCoordenadas.forEach(coord => bounds.extend(coord));
      }
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16, animate: true });
      return;
    }

    if (origenCoords) {
      map.flyTo(origenCoords, 15, { animate: true, duration: 1 });
      return;
    }

    // Centrar en ubicación del usuario la primera vez
    if (userLocation && !initialCenteredRef.current) {
      map.flyTo(userLocation, 14, { animate: true, duration: 1.2 });
      initialCenteredRef.current = true;
    }
  }, [map, userLocation, origenCoords, destinoCoords, rutaCoordenadas]);

  return null;
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
  onSelectVehiculo
}: SaraFletesMapProps) {
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
        {/* Capa de OpenStreetMap estándar de alta resolución y libre de marcas de agua */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
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

        {/* 2. Marcador Punto de Carga (Origen) */}
        {origenCoords && (
          <Marker position={origenCoords} icon={crearIconoPunto('origen')}>
            <Popup>
              <div className="text-xs p-1 text-slate-800">
                <p className="font-bold text-emerald-700">🟢 Punto de Carga (Origen)</p>
                <p className="font-semibold text-slate-700 text-xs mt-1">
                  {origenNombre || 'Origen Seleccionado'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Coord: {origenCoords[0].toFixed(5)}, {origenCoords[1].toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 3. Marcador Punto de Descarga (Destino) */}
        {destinoCoords && (
          <Marker position={destinoCoords} icon={crearIconoPunto('destino')}>
            <Popup>
              <div className="text-xs p-1 text-slate-800">
                <p className="font-bold text-amber-700">🚩 Punto de Descarga (Destino)</p>
                <p className="font-semibold text-slate-700 text-xs mt-1">
                  {destinoNombre || 'Destino Seleccionado'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Coord: {destinoCoords[0].toFixed(5)}, {destinoCoords[1].toFixed(5)}
                </p>
              </div>
            </Popup>
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

        {/* 5. Vehículos Cercanos Zonificados */}
        {vehiculosCercanos.map((vehiculo) => {
          const isSelected = !vehiculoSeleccionado || vehiculoSeleccionado === vehiculo.tipoVehiculo;
          return (
            <Marker
              key={vehiculo.id}
              position={[vehiculo.lat, vehiculo.lng]}
              icon={crearIconoVehiculo(vehiculo.tipoVehiculo, isSelected)}
              eventHandlers={{
                click: () => onSelectVehiculo && onSelectVehiculo(vehiculo)
              }}
            >
              <Popup>
                <div className="p-2 text-slate-800 max-w-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1 mb-1.5">
                    <span className="font-bold text-xs text-slate-900">{vehiculo.nombreChofer}</span>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      ★ {vehiculo.rating}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {CATALOGO_VEHICULOS_SARA[vehiculo.tipoVehiculo]?.nombre || vehiculo.tipoVehiculo}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Placa: {vehiculo.placa}
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
