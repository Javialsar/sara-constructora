"use client"
import React, { useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function LocationMarker({ position, setPosition }: { position: [number, number], setPosition: (p: [number, number]) => void }) {
  const map = useMap()
  
  // Update map view when position changes externally
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom())
    }
  }, [position, map])

  useMapEvents({
    click(e: any) {
      setPosition([e.latlng.lat, e.latlng.lng])
    },
  })
  
  return position === null ? null : <Marker position={position} icon={DefaultIcon} />
}

export default function MapComponent({ position, setPosition }: { position: [number, number], setPosition: (p: [number, number]) => void }) {
  return (
    <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker position={position} setPosition={setPosition} />
    </MapContainer>
  )
}
