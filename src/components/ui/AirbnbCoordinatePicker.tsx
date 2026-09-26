"use client"
import React, { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapPin, Navigation, Compass } from "lucide-react"

interface AirbnbCoordinatePickerProps {
  lat: number
  lng: number
  onChange: (lat: number, lng: number) => void
  ciudad?: string
}

// Marcador personalizado con animación
const pinIcon = L.divIcon({
  className: "custom-pin-marker",
  html: `
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 32px; height: 32px; background: #e11d48; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 14px rgba(225, 29, 72, 0.45); border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center;">
        <div style="width: 10px; height: 10px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
})

// Controlador de clics y arrastre en el mapa
function ClickAndDragHandler({
  lat,
  lng,
  onChange
}: {
  lat: number
  lng: number
  onChange: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onChange(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)))
    }
  })

  return (
    <Marker
      position={[lat, lng]}
      icon={pinIcon}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const marker = e.target
          const position = marker.getLatLng()
          onChange(Number(position.lat.toFixed(6)), Number(position.lng.toFixed(6)))
        }
      }}
    >
      <Popup>
        <div className="p-1 text-center font-sans">
          <p className="font-bold text-xs text-gray-900">Ubicación del Alojamiento</p>
          <p className="text-[10px] text-gray-500 font-mono mt-0.5">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </p>
          <span className="text-[9px] text-emerald-600 font-bold block mt-1">
            Arrastra o haz clic para reubicar
          </span>
        </div>
      </Popup>
    </Marker>
  )
}

// Controlador de cámara para vuelos suaves
function MapCamera({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, map.getZoom() < 13 ? 14 : map.getZoom(), { duration: 1 })
  }, [center, map])
  return null
}

const PRESET_CITIES = [
  { name: "Cuenca", lat: -2.9001, lng: -79.0059 },
  { name: "Loja", lat: -3.9931, lng: -79.2042 },
  { name: "Yunguilla", lat: -3.2389, lng: -79.2889 },
  { name: "Quito", lat: -0.1807, lng: -78.4678 },
  { name: "Guayaquil", lat: -2.1894, lng: -79.8891 },
  { name: "Manta", lat: -0.9677, lng: -80.7089 },
  { name: "Miami 🇺🇸", lat: 25.7617, lng: -80.1918 },
  { name: "Madrid 🇪🇸", lat: 40.4168, lng: -3.7038 }
]

export default function AirbnbCoordinatePicker({
  lat,
  lng,
  onChange,
  ciudad
}: AirbnbCoordinatePickerProps) {
  const currentCoords: [number, number] = [
    typeof lat === "number" && !isNaN(lat) ? lat : -2.9001,
    typeof lng === "number" && !isNaN(lng) ? lng : -79.0059
  ]

  const [mapCenter, setMapCenter] = useState<[number, number]>(currentCoords)

  const handleSelectCity = (cLat: number, cLng: number) => {
    setMapCenter([cLat, cLng])
    onChange(cLat, cLng)
  }

  const handleGetCurrentLocation = () => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const uLat = Number(pos.coords.latitude.toFixed(6))
          const uLng = Number(pos.coords.longitude.toFixed(6))
          setMapCenter([uLat, uLng])
          onChange(uLat, uLng)
        },
        (err) => {
          console.warn("Geolocalización no disponible:", err.message)
        },
        { enableHighAccuracy: true, timeout: 6000 }
      )
    }
  }

  return (
    <div className="space-y-2">
      {/* Barra de accesos rápidos a ciudades */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <Compass size={12} className="text-brand-sage" /> Centrar:
          </span>
          {PRESET_CITIES.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => handleSelectCity(c.lat, c.lng)}
              className="px-2 py-0.5 text-[11px] font-semibold bg-gray-100 hover:bg-brand-sage/10 hover:text-brand-dark rounded-md text-gray-700 transition-colors border border-gray-200"
            >
              {c.name}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md border border-blue-200 flex items-center gap-1 transition-colors"
          title="Detectar mi ubicación actual"
        >
          <Navigation size={12} />
          <span>Mi Ubicación</span>
        </button>
      </div>

      {/* Contenedor del Mapa Leaflet */}
      <div className="relative w-full h-56 rounded-xl overflow-hidden border border-gray-300 shadow-inner">
        <MapContainer
          center={currentCoords}
          zoom={14}
          scrollWheelZoom={false}
          className="w-full h-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickAndDragHandler
            lat={currentCoords[0]}
            lng={currentCoords[1]}
            onChange={(newLat, newLng) => {
              setMapCenter([newLat, newLng])
              onChange(newLat, newLng)
            }}
          />
          <MapCamera center={mapCenter} />
        </MapContainer>

        {/* Guía visual en esquina inferior */}
        <div className="absolute bottom-2 left-2 z-[400] bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-gray-200 shadow-sm text-[10px] text-gray-700 font-medium flex items-center gap-1.5 pointer-events-none">
          <MapPin size={12} className="text-rose-600 animate-bounce" />
          <span>Haz clic en el mapa o arrastra el marcador para fijar la ubicación exacta</span>
        </div>
      </div>
    </div>
  )
}
