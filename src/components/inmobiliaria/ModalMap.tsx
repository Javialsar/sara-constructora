"use client"

import React, { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import L from "leaflet"

// Fix para el icono de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

function ClickAndDragHandler({ lat, lng, onChange }: { lat: number, lng: number, onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)))
    }
  })

  return (
    <Marker 
      position={[lat, lng]} 
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target
          const position = marker.getLatLng()
          onChange(Number(position.lat.toFixed(6)), Number(position.lng.toFixed(6)))
        }
      }}
    />
  )
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMapEvents({})
  useEffect(() => {
    const targetZoom = zoom || Math.max(map.getZoom(), 16);
    map.flyTo(center, targetZoom, { duration: 0.5 });
  }, [center[0], center[1], zoom, map])
  return null
}

interface ModalMapProps {
  lat: number
  lng: number
  zoom?: number
  onChange: (lat: number, lng: number) => void
}

export default function ModalMap({ lat, lng, zoom = 16, onChange }: ModalMapProps) {
  const currentCoords: [number, number] = [
    typeof lat === "number" && !isNaN(lat) ? lat : -2.9001,
    typeof lng === "number" && !isNaN(lng) ? lng : -79.0059
  ]

  return (
    <div 
      className="w-full h-full relative"
      onWheel={(e) => e.stopPropagation()}
    >
      <MapContainer
        center={currentCoords}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={currentCoords} zoom={zoom} />
        <ClickAndDragHandler lat={currentCoords[0]} lng={currentCoords[1]} onChange={onChange} />
      </MapContainer>
    </div>
  )
}
