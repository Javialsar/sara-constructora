import ProjectsMapClient from "@/components/ui/ProjectsMapClient"
import { supabase } from "@/lib/supabase"

export const revalidate = 0; // Para que siempre busque los últimos proyectos en Vercel

export default async function ProyectosPage() {
  // Fetch from Supabase
  const { data: proyectos } = await supabase
    .from("proyectos")
    .select("*")
    .order("created_at", { ascending: false })

  // Filtramos solo los que tienen coordenadas para el mapa
  const proyectosConMapa = proyectos?.filter(p => p.latitud && p.longitud).map(p => ({
    id: p.id,
    title: p.nombre,
    category: p.estado, // temporary
    status: p.estado,
    lat: p.latitud,
    lng: p.longitud
  })) || []

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container mx-auto px-4 md:px-8">
        <header className="mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-brand-dark tracking-tight mb-4 uppercase">
            Nuestros Proyectos
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-500 font-medium">
            IDEAS QUE SE CONVIERTEN EN REALIDAD.
          </h2>
        </header>

        {/* Map Section */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-brand-black">Mapa de Proyectos</h3>
            <span className="text-sm font-bold bg-brand-sage text-brand-dark px-3 py-1 rounded">Visualización Global</span>
          </div>
          <div className="border border-gray-200 shadow-sm overflow-hidden bg-white">
            <ProjectsMapClient projects={proyectosConMapa} />
          </div>
        </section>

        {/* Projects Grid */}
        <section>
          <div className="flex gap-4 mb-8 overflow-x-auto pb-4 hide-scrollbar">
            {["TODOS", "DISEÑO", "CONSTRUCCIÓN", "FINALIZADOS"].map(filter => (
              <button key={filter} className="whitespace-nowrap px-4 py-2 border border-gray-200 text-sm font-bold uppercase tracking-wider hover:bg-brand-dark hover:text-white transition-colors">
                {filter}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {proyectos && proyectos.length > 0 ? (
              proyectos.map(project => (
                <div key={project.id} className="group border border-gray-200 overflow-hidden bg-white hover:shadow-lg transition-shadow">
                  <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                     <div className="absolute inset-0 bg-brand-dark/5 group-hover:bg-transparent transition-colors z-10" />
                     {project.imagen_url ? (
                       <img src={project.imagen_url} alt={project.nombre} className="w-full h-full object-cover" />
                     ) : (
                       <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium">Sin imagen</div>
                     )}
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-bold text-brand-sage uppercase tracking-wider mb-2 block">{project.estado.replace('_', ' ')}</span>
                    <h4 className="text-xl font-bold text-brand-dark mb-4">{project.nombre}</h4>
                    <div className="flex items-center justify-between text-sm font-medium text-gray-500">
                      <span className="truncate">{project.ubicacion}</span>
                      <span>2026</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-400">
                Aún no hay proyectos públicos cargados.
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
