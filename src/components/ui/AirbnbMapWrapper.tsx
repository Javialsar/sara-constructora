"use client"
import React from "react"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import type { AirbnbMapItem } from "./AirbnbMap"

const AirbnbMap = dynamic(() => import("./AirbnbMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[480px] bg-slate-100 animate-pulse flex flex-col items-center justify-center text-gray-400 border border-gray-200 rounded-2xl p-6">
      <Loader2 className="animate-spin text-amber-500 mb-2" size={32} />
      <span className="text-xs font-bold text-gray-500">Cargando mapa interactivo de alojamientos...</span>
    </div>
  )
})

interface AirbnbMapWrapperProps {
  items: AirbnbMapItem[]
  selectedId: string | null
  onSelectItem: (id: string) => void
  onOpenDetails: (item: any) => void
  centerCoords?: [number, number]
  zoomLevel?: number
}

export default function AirbnbMapWrapper(props: AirbnbMapWrapperProps) {
  return <AirbnbMap {...props} />
}
