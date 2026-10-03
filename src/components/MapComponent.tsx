"use client"
import React from "react"
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function LocationMarker({ position, setPosition }: { position: [number, number], setPosition: (p: [number, number]) => void }) {
  const map = useMapEvents({
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
