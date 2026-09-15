import { notFound } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowLeft, Briefcase, MapPin, Building, ChevronRight } from "lucide-react"

import InteractivePortfolio from "./InteractivePortfolio"

import MapWrapper from "./MapWrapper"

export default async function ClienteDetallePage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: cliente } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", resolvedParams.id)
    .single()

  if (!cliente) {
    notFound()
  }

  const { data: proyectos } = await supabase
    .from("proyectos")
    .select("*")
    .eq("cliente_id", resolvedParams.id)
    .order("created_at", { ascending: false })

  const mapProjects = (proyectos || []).filter(p => p.latitud && p.longitud).map(p => ({
    id: p.id,
    title: p.nombre,
    lat: p.latitud,
    lng: p.longitud,
    category: p.tipo_proyecto || "Construcción",
    status: p.estado || "En progreso"
  }))

  return (
    <div className="min-h-screen pt-36 pb-24 bg-white relative">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        
        <Link href="/clientes" className="inline-flex items-center gap-2 text-brand-sage hover:text-brand-dark font-medium transition-colors mb-8">
          <ArrowLeft size={16} /> Volver a Nuestros Clientes
        </Link>

        {/* Hero del Cliente */}
        <div className="bg-brand-dark rounded-3xl p-8 md:p-12 text-white mb-16 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-sage/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          
          <div className="w-32 h-32 md:w-48 md:h-48 flex-shrink-0 bg-white rounded-full p-2 shadow-inner z-10 flex items-center justify-center">
            {cliente.imagen_url ? (
              <img src={cliente.imagen_url} alt={`${cliente.nombre} ${cliente.apellido}`} className="w-full h-full object-contain rounded-full" />
            ) : (
              <span className="text-4xl md:text-6xl font-bold text-brand-dark uppercase tracking-widest">
                {cliente.nombre?.charAt(0)}{cliente.apellido?.charAt(0)}
              </span>
            )}
          </div>
          
          <div className="text-center md:text-left z-10">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter mb-4 uppercase text-white drop-shadow-sm">
              {cliente.nombre} {cliente.apellido}
            </h1>
            <p className="text-brand-sage text-lg md:text-xl uppercase tracking-widest font-bold">
              {proyectos?.length || 0} {(proyectos?.length === 1) ? "Proyecto Confiado" : "Proyectos Confiados"}
            </p>
          </div>
        </div>

        {/* Proyectos y Mapa interactivo */}
        <InteractivePortfolio proyectos={proyectos || []} mapProjects={mapProjects} />
      </div>
    </div>
  )
}
