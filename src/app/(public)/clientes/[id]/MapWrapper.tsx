"use client"
import dynamic from "next/dynamic"

const ProjectsMap = dynamic(() => import("@/components/ui/ProjectsMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[500px] bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 border border-gray-200 rounded-2xl">Cargando mapa interactivo...</div>
})

export default function MapWrapper({ projects, flyTo }: { projects: any[], flyTo?: any }) {
  return <ProjectsMap projects={projects} flyTo={flyTo} />
}
