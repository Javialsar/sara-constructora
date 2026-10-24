"use client"
import React, { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import { Star, MessageCircle, ArrowRight } from "lucide-react"

export interface AirbnbMapItem {
  id: string
  codigo: string
  titulo: string
  precioNoche: number
  lat: number
  lng: number
  ciudad: string
  sector: string
  bandera: string
  rating: number
  reviewsCount: number
  imagen: string
  maxHuespedes: number
}

interface AirbnbMapProps {
  items: AirbnbMapItem[]
  selectedId: string | null
  onSelectItem: (id: string) => void
  onOpenDetails: (item: AirbnbMapItem) => void
  centerCoords?: [number, number]
  zoomLevel?: number
}

// Subcomponente controlador de cámara para mover el mapa suavemente
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5, easeLinearity: 0.25 })
  }, [center, zoom, map])
  return null
}

export default function AirbnbMap({
  items,
  selectedId,
  onSelectItem,
  onOpenDetails,
  centerCoords = [-2.9001, -79.0059],
  zoomLevel = 13
}: AirbnbMapProps) {

  // Generador de Iconos DivIcon estilo Airbnb con precio
  const createPriceIcon = (price: number, isSelected: boolean) => {
    return L.divIcon({
      className: "custom-airbnb-marker",
      html: `
        <div class="airbnb-pill-marker ${isSelected ? 'active' : ''}">
          <span class="pill-currency">$</span>${price}
        </div>
      `,
      iconSize: [60, 32],
      iconAnchor: [30, 16],
      popupAnchor: [0, -20]
    })
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
      <style jsx global>{`
        .custom-airbnb-marker {
          background: transparent;
          border: none;
        }
        .airbnb-pill-marker {
          background-color: #ffffff;
          color: #111827;
          font-weight: 800;
          font-size: 13px;
          padding: 5px 12px;
          border-radius: 9999px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.22);
          border: 1px solid rgba(0,0,0,0.1);
          text-align: center;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 1px;
        }
        .airbnb-pill-marker .pill-currency {
          font-size: 11px;
          font-weight: 700;
          color: #6b7280;
        }
        .airbnb-pill-marker:hover {
          background-color: #0f172a;
          color: #ffffff;
          transform: scale(1.12);
          box-shadow: 0 8px 24px rgba(0,0,0,0.35);
        }
        .airbnb-pill-marker:hover .pill-currency {
          color: #cbd5e1;
        }
        .airbnb-pill-marker.active {
          background-color: #f59e0b;
          color: #0f172a;
          border-color: #d97706;
          transform: scale(1.18);
          box-shadow: 0 10px 28px rgba(245, 158, 11, 0.45);
        }
        .airbnb-pill-marker.active .pill-currency {
          color: #78350f;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 16px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 12px 30px rgba(0,0,0,0.25);
        }
        .leaflet-popup-content {
          margin: 0 !important;
          line-height: 1.4;
        }
      `}</style>

      <MapContainer
        center={centerCoords}
        zoom={zoomLevel}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[480px]"
      >
        <MapController center={centerCoords} zoom={zoomLevel} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {items.map((item) => {
          const isSelected = selectedId === item.id
          const icon = createPriceIcon(item.precioNoche, isSelected)

          return (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectItem(item.id)
              }}
            >
              <Popup>
                <div className="w-64 bg-white overflow-hidden text-gray-900">
                  <div className="relative h-32 w-full bg-gray-100">
                    <img 
                      src={item.imagen} 
                      alt={item.titulo} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {item.bandera} {item.ciudad}
                    </div>
                    <div className="absolute top-2 right-2 bg-white/95 text-gray-900 px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 shadow-sm">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      <span>{item.rating.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="p-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      {item.sector}
                    </span>
                    <h4 className="font-bold text-xs text-gray-900 line-clamp-1 mb-1">
                      {item.titulo}
                    </h4>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-base font-black text-gray-900">${item.precioNoche}</span>
                        <span className="text-[10px] text-gray-500"> / noche</span>
                      </div>

                      <button
                        onClick={() => onOpenDetails(item)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-[11px] font-black transition-colors flex items-center gap-1 shadow-sm"
                      >
                        Ver <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
