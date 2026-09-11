"use client"
import dynamic from "next/dynamic"

const Map = dynamic(() => import("./ProjectsMap"), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse flex items-center justify-center">Cargando mapa...</div>
})

export default function ProjectsMapClient({ projects, flyTo }: { projects: any[], flyTo?: { lat: number; lng: number; id: string } | null }) {
  return <Map projects={projects} flyTo={flyTo} />
}
