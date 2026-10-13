import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Calendar, ChevronRight } from "lucide-react"
import BlogImage from "@/components/ui/BlogImage"

export const revalidate = 0; // Para que los artículos carguen rápido y frescos

export const metadata = {
  title: "Noticias y Blog | SARA Constructora",
  description: "Últimas noticias, consejos y tendencias en Arquitectura e Ingeniería Civil.",
}

export default async function NoticiasPage() {
  const supabase = await createClient()
  
  // Buscar artículos publicados
  const { data: articulos, error } = await supabase
    .from('articulos_blog')
    .select('*')
    .eq('estado', 'publicado')
    .order('fecha_publicacion', { ascending: false })

  return (
    <div className="pt-36 pb-24 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-dark tracking-tighter mb-4 uppercase">
            Noticias y Blog
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-500 font-medium">
            TENDENCIAS Y NOVEDADES EN CONSTRUCCIÓN.
          </h2>
        </header>

        {!articulos || articulos.length === 0 ? (
          <div className="text-center bg-white p-16 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-2xl text-gray-400 font-bold mb-2">Próximamente...</h3>
            <p className="text-gray-500">Estamos preparando los mejores artículos para ti. ¡Vuelve pronto!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articulos.map((art) => (
              <article key={art.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col group">
                <Link href={`/noticias/${art.slug}`} className="block h-60 overflow-hidden relative">
                  <BlogImage 
                    src={art.imagen_url} 
                    alt={art.titulo} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute top-4 left-4 bg-brand-sage text-brand-dark text-xs font-bold uppercase px-3 py-1 rounded shadow-md">
                    {art.categoria}
                  </div>
                </Link>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                    <Calendar size={14} />
                    <span>{new Date(art.fecha_publicacion || art.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <h3 className="text-xl font-bold text-brand-dark mb-3 leading-tight group-hover:text-brand-sage transition-colors">
                    <Link href={`/noticias/${art.slug}`}>{art.titulo}</Link>
                  </h3>
                  <p className="text-gray-600 mb-6 flex-1 line-clamp-3">
                    {art.resumen}
                  </p>
                  <Link href={`/noticias/${art.slug}`} className="inline-flex items-center gap-1 font-bold text-sm uppercase tracking-widest text-brand-dark hover:text-brand-sage transition-colors">
                    Leer más <ChevronRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
