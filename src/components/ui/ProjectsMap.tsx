"use client"
import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const customIcon = typeof window !== 'undefined' ? new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
}) : null;

interface ProjectMarker {
  id: string
  title: string
  lat: number
  lng: number
  category: string
  status: string
}

interface ProjectsMapProps {
  projects: ProjectMarker[]
  flyTo?: { lat: number; lng: number; id: string } | null
}

// Componente interno que maneja el flyTo
function FlyToHandler({ flyTo }: { flyTo: { lat: number; lng: number; id: string } | null }) {
  const map = useMap()

  useEffect(() => {
    if (flyTo) {
      map.flyTo([flyTo.lat, flyTo.lng], 15, {
        duration: 2,
      })
    }
  }, [flyTo, map])

  return null
}

export default function ProjectsMap({ projects, flyTo }: ProjectsMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !customIcon) return <div className="h-full min-h-[300px] w-full bg-gray-100 animate-pulse flex items-center justify-center">Cargando mapa...</div>

  const center: [number, number] = [-4.3276, -79.5447]

  return (
    <div className="h-full w-full z-0 relative overflow-hidden rounded">
      <MapContainer 
        center={center} 
        zoom={10} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToHandler flyTo={flyTo || null} />
        {projects.map((project) => (
          <Marker 
            key={project.id} 
            position={[project.lat, project.lng]}
            icon={customIcon}
          >
            <Popup>
              <div className="font-sans">
                <h4 className="font-bold text-brand-dark mb-1">{project.title}</h4>
                <p className="text-xs text-gray-500 mb-2">{project.category}</p>
                <span className="inline-block px-2 py-1 bg-brand-sage/20 text-brand-dark text-[10px] font-bold uppercase rounded">
                  {project.status}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
