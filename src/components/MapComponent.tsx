"use client"
import React, { useEffect, useMemo, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

function LocationMarker({ 
  position, 
  setPosition 
}: { 
  position: [number, number], 
  setPosition: (p: [number, number]) => void 
}) {
  const map = useMap()
  const markerRef = useRef<any>(null)
  
  // Mover el mapa suavemente al cambiar las coordenadas
  useEffect(() => {
    if (position && !isNaN(position[0]) && !isNaN(position[1])) {
      map.flyTo(position, Math.max(map.getZoom(), 15), { duration: 1.2 })
    }
  }, [position, map])

  useMapEvents({
    click(e: any) {
      setPosition([e.latlng.lat, e.latlng.lng])
    },
  })

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          const latLng = marker.getLatLng()
          setPosition([latLng.lat, latLng.lng])
        }
      },
    }),
    [setPosition],
  )
  
  if (!position || isNaN(position[0]) || isNaN(position[1])) return null

  return (
    <Marker 
      draggable={true}
      eventHandlers={eventHandlers}
      position={position} 
      icon={DefaultIcon}
      ref={markerRef}
    >
      <Popup>
        <div className="text-xs p-1 text-slate-800">
          <p className="font-bold text-blue-700">📍 Ubicación Georreferenciada</p>
          <p className="font-mono text-[10px] text-slate-600 mt-0.5">
            {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            * Puedes arrastrar este marcador para ajustar la posición exacta.
          </p>
        </div>
      </Popup>
    </Marker>
  )
}

export default function MapComponent({ 
  position, 
  setPosition 
}: { 
  position: [number, number], 
  setPosition: (p: [number, number]) => void 
}) {
  const validPosition: [number, number] = (position && !isNaN(position[0]) && !isNaN(position[1]))
    ? position 
    : [-2.9001285, -79.0058965]

  return (
    <MapContainer 
      center={validPosition} 
      zoom={14} 
      style={{ height: '100%', width: '100%', zIndex: 1 }}
      scrollWheelZoom={true}
    >
      <TileLayer 
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
      />
      <LocationMarker position={validPosition} setPosition={setPosition} />
    </MapContainer>
  )
}
