'use client';
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
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
const createCustomIcon = (color: string) => {
  return new L.DivIcon({
    className: 'bg-transparent',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const iconVIP = createCustomIcon('#eab308'); // amber-500
const iconEstandar = createCustomIcon('#3b82f6'); // blue-500
const iconBasico = createCustomIcon('#64748b'); // slate-500

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

export default function MapLeaflet({ drivers }: { drivers: any[] }) {
  // Center of Ecuador roughly
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
          let currentIcon = iconBasico;
          if (driver.plan === 'VIP') currentIcon = iconVIP;
          if (driver.plan === 'Estándar') currentIcon = iconEstandar;

          return (
            <Marker key={driver.id} position={[driver.latitud, driver.longitud]} icon={currentIcon}>
              <Popup className="custom-popup" minWidth={250}>
                <div className="p-1">
                  <div className="flex items-center gap-2 mb-2 border-b pb-2">
                    {driver.plan === 'VIP' ? <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> : <User className="w-5 h-5 text-slate-500" />}
                    <h3 className="font-bold text-slate-800 text-base m-0 leading-none">{driver.name}</h3>
                    <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${driver.plan === 'VIP' ? 'bg-amber-100 text-amber-700' : driver.plan === 'Estándar' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                      {driver.plan}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center text-xs text-slate-600">
                      <Truck className="w-4 h-4 mr-2 text-slate-400" />
                      <span className="font-medium mr-1">Vehículo:</span> {driver.vehicle}
                    </div>
                    <div className="flex items-center text-xs text-slate-600">
                      <Hash className="w-4 h-4 mr-2 text-slate-400" />
                      <span className="font-medium mr-1">Placa:</span> {driver.plate}
                    </div>
                    <div className="flex items-start text-xs text-slate-600">
                      <MapPin className="w-4 h-4 mr-2 mt-0.5 text-blue-500" />
                      <div>
                        <p><span className="font-medium">Origen:</span> {driver.origen}</p>
                        <p className="mt-0.5"><span className="font-medium">Destino:</span> {driver.destino}</p>
                      </div>
                    </div>
                    {driver.cliente && (
                      <div className="mt-2 pt-2 border-t text-xs text-slate-500 italic">
                        Servicio para: {driver.cliente}
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        {drivers.length > 0 && <SetBounds drivers={drivers} />}
      </MapContainer>
    </div>
  );
}
