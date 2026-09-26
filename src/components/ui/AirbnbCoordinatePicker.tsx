"use client"
import React, { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapPin, Navigation, Compass, CheckCircle2 } from "lucide-react"

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

// Diccionario extendido de ciudades de Ecuador y el mundo para autogeolocalización instantánea
const CITIES_COORDINATES: Record<string, { lat: number; lng: number; displayName: string }> = {
  cariamanga: { lat: -4.3297, lng: -79.5544, displayName: "Cariamanga (Calvas)" },
  catamayo: { lat: -3.9878, lng: -79.3567, displayName: "Catamayo" },
  loja: { lat: -3.9931, lng: -79.2042, displayName: "Loja" },
  macara: { lat: -4.3828, lng: -79.9442, displayName: "Macará" },
  vilcabamba: { lat: -4.2619, lng: -79.2225, displayName: "Vilcabamba" },
  zamora: { lat: -4.0692, lng: -78.9567, displayName: "Zamora" },
  cuenca: { lat: -2.9001, lng: -79.0059, displayName: "Cuenca" },
  azogues: { lat: -2.7397, lng: -78.8475, displayName: "Azogues" },
  gualaceo: { lat: -2.8942, lng: -78.7789, displayName: "Gualaceo" },
  paute: { lat: -2.7778, lng: -78.7611, displayName: "Paute" },
  yunguilla: { lat: -3.2389, lng: -79.2889, displayName: "Valle de Yunguilla" },
  santaisabel: { lat: -3.2750, lng: -79.3130, displayName: "Santa Isabel" },
  quito: { lat: -0.1807, lng: -78.4678, displayName: "Quito" },
  guayaquil: { lat: -2.1894, lng: -79.8891, displayName: "Guayaquil" },
  samborondon: { lat: -2.0967, lng: -79.7214, displayName: "Samborondón" },
  manta: { lat: -0.9677, lng: -80.7089, displayName: "Manta" },
  portoviejo: { lat: -1.0544, lng: -80.4544, displayName: "Portoviejo" },
  salinas: { lat: -2.2223, lng: -80.9585, displayName: "Salinas" },
  ambato: { lat: -1.2491, lng: -78.6168, displayName: "Ambato" },
  riobamba: { lat: -1.6636, lng: -78.6546, displayName: "Riobamba" },
  banos: { lat: -1.3964, lng: -78.4247, displayName: "Baños de Agua Santa" },
  ibarra: { lat: 0.3517, lng: -78.1223, displayName: "Ibarra" },
  otavalo: { lat: 0.2342, lng: -78.2625, displayName: "Otavalo" },
  machala: { lat: -3.2581, lng: -79.9553, displayName: "Machala" },
  santodomingo: { lat: -0.2530, lng: -79.1754, displayName: "Santo Domingo" },
  esmeraldas: { lat: 0.9682, lng: -79.6517, displayName: "Esmeraldas" },
  puyo: { lat: -1.4889, lng: -77.9989, displayName: "Puyo" },
  tena: { lat: -0.9939, lng: -77.8128, displayName: "Tena" },
  galapagos: { lat: -0.9538, lng: -90.9656, displayName: "Islas Galápagos" },
  miami: { lat: 25.7617, lng: -80.1918, displayName: "Miami 🇺🇸" },
  madrid: { lat: 40.4168, lng: -3.7038, displayName: "Madrid 🇪🇸" },
  orlando: { lat: 28.5383, lng: -81.3792, displayName: "Orlando 🇺🇸" }
}

const PRESET_CITIES = [
  { name: "Cariamanga", lat: -4.3297, lng: -79.5544 },
  { name: "Loja", lat: -3.9931, lng: -79.2042 },
  { name: "Cuenca", lat: -2.9001, lng: -79.0059 },
  { name: "Yunguilla", lat: -3.2389, lng: -79.2889 },
  { name: "Quito", lat: -0.1807, lng: -78.4678 },
  { name: "Guayaquil", lat: -2.1894, lng: -79.8891 },
  { name: "Manta", lat: -0.9677, lng: -80.7089 },
  { name: "Miami 🇺🇸", lat: 25.7617, lng: -80.1918 }
]

function normalizeCityName(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim()
}

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
  const [autoGeoMessage, setAutoGeoMessage] = useState<string | null>(null)
  const lastGeocodedCityRef = useRef<string>("")

  // Autogeolocalización reactiva cuando el usuario escribe en el campo 'Ciudad'
  useEffect(() => {
    if (!ciudad || ciudad.trim().length < 3) return

    const normalized = normalizeCityName(ciudad)
    if (normalized === lastGeocodedCityRef.current) return

    const timer = setTimeout(async () => {
      // 1. Búsqueda instantánea en catálogo local
      const directMatch = CITIES_COORDINATES[normalized]
      if (directMatch) {
        lastGeocodedCityRef.current = normalized
        setMapCenter([directMatch.lat, directMatch.lng])
        onChange(directMatch.lat, directMatch.lng)
        setAutoGeoMessage(`Ubicado automáticamente: ${directMatch.displayName}`)
        setTimeout(() => setAutoGeoMessage(null), 4000)
        return
      }

      // Buscar por coincidencia parcial (ej: "cariamanga loha" -> "cariamanga")
      for (const [key, val] of Object.entries(CITIES_COORDINATES)) {
        if (normalized.includes(key) || key.includes(normalized)) {
          lastGeocodedCityRef.current = normalized
          setMapCenter([val.lat, val.lng])
          onChange(val.lat, val.lng)
          setAutoGeoMessage(`Ubicado automáticamente: ${val.displayName}`)
          setTimeout(() => setAutoGeoMessage(null), 4000)
          return
        }
      }

      // 2. Fallback a geocodificador OpenStreetMap Nominatim
      try {
        const query = encodeURIComponent(`${ciudad}, Ecuador`)
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
          headers: { "Accept-Language": "es" }
        })
        if (res.ok) {
          const results = await res.json()
          if (Array.isArray(results) && results.length > 0) {
            const fLat = Number(Number(results[0].lat).toFixed(6))
            const fLng = Number(Number(results[0].lon).toFixed(6))
            lastGeocodedCityRef.current = normalized
            setMapCenter([fLat, fLng])
            onChange(fLat, fLng)
            setAutoGeoMessage(`Ubicado en el mapa: ${results[0].display_name.split(",")[0]}`)
            setTimeout(() => setAutoGeoMessage(null), 4000)
          }
        }
      } catch (err) {
        // Fallback silencioso
      }
    }, 450)

    return () => clearTimeout(timer)
  }, [ciudad, onChange])

  const handleSelectCity = (cLat: number, cLng: number, cName?: string) => {
    setMapCenter([cLat, cLng])
    onChange(cLat, cLng)
    if (cName) {
      setAutoGeoMessage(`Centrado en: ${cName}`)
      setTimeout(() => setAutoGeoMessage(null), 3000)
    }
  }

  const handleGetCurrentLocation = () => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const uLat = Number(pos.coords.latitude.toFixed(6))
          const uLng = Number(pos.coords.longitude.toFixed(6))
          setMapCenter([uLat, uLng])
          onChange(uLat, uLng)
          setAutoGeoMessage("Centrado en tu ubicación actual GPS")
          setTimeout(() => setAutoGeoMessage(null), 3000)
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
      {/* Barra de accesos rápidos a ciudades y estado de geocodificación */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <Compass size={12} className="text-brand-sage" /> Centrar:
          </span>
          {PRESET_CITIES.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => handleSelectCity(c.lat, c.lng, c.name)}
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

      {/* Notificación de Geocodificación Automática */}
      {autoGeoMessage && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={14} className="text-emerald-600" />
          <span>{autoGeoMessage}</span>
        </div>
      )}

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
          <span>Haz clic en el mapa o arrastra el marcador para ajustar la ubicación</span>
        </div>
      </div>
    </div>
  )
}
