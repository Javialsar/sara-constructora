'use client';
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { User, Truck, MapPin, Hash, Star } from 'lucide-react';

// Solución para iconos faltantes en Leaflet con Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons por plan
const createCustomIcon = (color: string, isMoving: boolean = false) => {
  return new L.DivIcon({
    className: 'bg-transparent',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        ${isMoving ? `<span style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: ${color}; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>` : ''}
        <div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 2;">
          <div style="width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

const iconVIP = createCustomIcon('#eab308'); // amber-500
const iconVIPMoving = createCustomIcon('#eab308', true);
const iconEstandar = createCustomIcon('#3b82f6'); // blue-500
const iconEstandarMoving = createCustomIcon('#3b82f6', true);
const iconBasico = createCustomIcon('#64748b'); // slate-500
const iconBasicoMoving = createCustomIcon('#64748b', true);

function SetBounds({ drivers }: { drivers: any[] }) {
  const map = useMap();
  useEffect(() => {
    if (drivers.length > 0) {
      const bounds = L.latLngBounds(drivers.map(d => [d.latitud, d.longitud]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [drivers, map]);
  return null;
}

function PanToDriver({ driver }: { driver: any }) {
  const map = useMap();
  useEffect(() => {
    if (driver && driver.latitud && driver.longitud) {
      map.flyTo([driver.latitud, driver.longitud], 15, { duration: 1.2 });
    }
  }, [driver, map]);
  return null;
}

export default function MapLeaflet({ 
  drivers, 
  selectedDriver 
}: { 
  drivers: any[];
  selectedDriver?: any;
}) {
  // Centro referencial del Ecuador
  const defaultCenter: [number, number] = [-1.8312, -78.1834];

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative', zIndex: 1 }}>
      <MapContainer 
        center={defaultCenter} 
        zoom={7} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {drivers.map(driver => {
          const isMoving = driver.status === 'En Viaje';
          let currentIcon = isMoving ? iconBasicoMoving : iconBasico;
          if (driver.plan === 'VIP') currentIcon = isMoving ? iconVIPMoving : iconVIP;
          if (driver.plan === 'Estándar' || driver.plan === 'Estandar') currentIcon = isMoving ? iconEstandarMoving : iconEstandar;

          return (
            <Marker key={driver.id} position={[driver.latitud, driver.longitud]} icon={currentIcon}>
              <Tooltip direction="top" offset={[0, -18]} opacity={1}>
                <span className="font-bold text-xs text-slate-900">
                  {driver.name} · <span className="font-mono text-amber-700">{driver.plate}</span>
                </span>
              </Tooltip>
              <Popup className="custom-popup" minWidth={260}>
                <div className="p-1">
                  <div className="flex items-center gap-2 mb-2 border-b pb-2">
                    {driver.plan === 'VIP' ? <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> : <User className="w-5 h-5 text-slate-500" />}
                    <h3 className="font-bold text-slate-800 text-base m-0 leading-none">{driver.name}</h3>
                    <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${driver.plan === 'VIP' ? 'bg-amber-100 text-amber-700' : (driver.plan === 'Estándar' || driver.plan === 'Estandar') ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                      {driver.plan}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 mt-2">
                    <div className="flex items-center text-xs text-slate-600">
                      <Truck className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                      <span className="font-medium mr-1">Vehículo:</span> {driver.vehicle}
                    </div>
                    <div className="flex items-center text-xs text-slate-600">
                      <Hash className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                      <span className="font-medium mr-1">Placa:</span> <strong className="font-mono text-slate-900">{driver.plate}</strong>
                    </div>
                    <div className="flex items-start text-xs text-slate-600">
                      <MapPin className="w-4 h-4 mr-2 mt-0.5 text-blue-500 shrink-0" />
                      <div>
                        <p><span className="font-medium">Ubicación:</span> {driver.ciudad || driver.canton}, {driver.provincia}</p>
                        {driver.origen && driver.origen !== 'N/A' && (
                          <p className="mt-0.5 text-emerald-600 font-semibold">
                            Ruta: {driver.origen} → {driver.destino}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t flex items-center justify-between text-xs">
                      <span className="text-slate-500">Estado operativo:</span>
                      <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${driver.status === 'En Viaje' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {driver.status}
                      </span>
                    </div>
                    {driver.cliente && (
                      <div className="pt-1 text-[11px] text-slate-500 italic">
                        Servicio para: {driver.cliente}
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        {selectedDriver && <PanToDriver driver={selectedDriver} />}
        {!selectedDriver && drivers.length > 0 && <SetBounds drivers={drivers} />}
      </MapContainer>
    </div>
  );
}
