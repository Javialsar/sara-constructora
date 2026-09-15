import { notFound } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowLeft, Briefcase, MapPin, Building, ChevronRight } from "lucide-react"

const ProjectsMap = dynamic(() => import("@/components/ui/ProjectsMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[500px] bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 border border-gray-200 rounded-2xl">Cargando mapa interactivo...</div>
})

export default async function ClienteDetallePage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const cookieStore = cookies()
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

        {/* Proyectos y Mapa */}
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Lista de Proyectos */}
          <div className="w-full lg:w-1/3 space-y-6">
            <h2 className="text-2xl font-bold text-brand-dark uppercase tracking-widest mb-6 flex items-center gap-3 border-b-2 border-brand-sage/30 pb-4">
              <Briefcase className="text-brand-sage" /> Portafolio
            </h2>
            
            {!proyectos || proyectos.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-500">
                Aún no hay proyectos registrados para este cliente.
              </div>
            ) : (
              proyectos.map((p) => (
                <Link href={`/proyectos/${p.id}`} key={p.id} className="group block bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:border-brand-sage/30 transition-all">
                  <h3 className="font-bold text-brand-dark uppercase tracking-wide group-hover:text-brand-sage transition-colors mb-2">
                    {p.nombre}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="truncate">{p.ubicacion || "Ubicación no especificada"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-full uppercase tracking-wider">
                      {p.estado === "completado" ? "Finalizado" : "En Progreso"}
                    </span>
                    <span className="text-brand-sage flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                      Ver Proyecto <ChevronRight size={16} />
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Mapa */}
          <div className="w-full lg:w-2/3">
            <h2 className="text-2xl font-bold text-brand-dark uppercase tracking-widest mb-6 flex items-center gap-3 border-b-2 border-brand-sage/30 pb-4">
              <Building className="text-brand-sage" /> Mapa de Obras
            </h2>
            
            <div className="bg-white p-2 rounded-3xl shadow-lg border border-gray-100 h-[500px] md:h-[600px] overflow-hidden relative">
              {mapProjects.length > 0 ? (
                <div className="w-full h-full rounded-2xl overflow-hidden relative z-0">
                   <ProjectsMap projects={mapProjects} />
                </div>
              ) : (
                <div className="w-full h-full bg-gray-50 rounded-2xl flex flex-col items-center justify-center text-gray-400 border border-gray-100">
                  <MapPin size={48} className="mb-4 opacity-20" />
                  <p className="font-medium text-center px-6">
                    Los proyectos de este cliente aún no tienen coordenadas geográficas configuradas.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
