"use client"
import React from "react"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

const AirbnbCoordinatePicker = dynamic(() => import("./AirbnbCoordinatePicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-56 bg-slate-100 animate-pulse flex flex-col items-center justify-center text-gray-400 border border-gray-200 rounded-xl p-4">
      <Loader2 className="animate-spin text-brand-sage mb-2" size={24} />
      <span className="text-xs font-semibold text-gray-500">Cargando mapa de geolocalización...</span>
    </div>
  )
})

interface AirbnbCoordinatePickerWrapperProps {
  lat: number
  lng: number
  onChange: (lat: number, lng: number) => void
  ciudad?: string
}

export default function AirbnbCoordinatePickerWrapper(props: AirbnbCoordinatePickerWrapperProps) {
  return <AirbnbCoordinatePicker {...props} />
}
