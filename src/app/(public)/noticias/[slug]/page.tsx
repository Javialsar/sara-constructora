import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ArrowLeft, Calendar, User } from "lucide-react"
import BlogImage from "@/components/ui/BlogImage"

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient()
  
  const { data: articulo } = await supabase
    .from('articulos_blog')
    .select('titulo, resumen, imagen_url')
    .eq('slug', slug)
    .single()

  const { data: config } = await supabase.from('configuracion_empresa').select('logo_url').limit(1).single()
  
  const title = articulo?.titulo ? `${articulo.titulo} | Blog de SARA Constructora` : 'Artículo | SARA Constructora'
  const description = articulo?.resumen || 'Noticias de SARA Constructora'
  const ogImage = articulo?.imagen_url || config?.logo_url || '/images/logo-sara-transparent.png'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    }
  }
}

export default async function ArticuloPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient()
  
  const { data: articulo, error } = await supabase
    .from('articulos_blog')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !articulo) {
    notFound()
  }

  // Prevenir que se vea un borrador públicamente si alguien adivina el slug
  if (articulo.estado !== 'publicado') {
    notFound()
  }

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Article Hero */}
      <div className="relative pt-36 pb-20 md:pt-48 md:pb-32 bg-brand-dark overflow-hidden">
        {articulo.imagen_url ? (
          <div className="absolute inset-0 z-0">
            <BlogImage src={articulo.imagen_url} alt={articulo.titulo} className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        )}
        
        <div className="container relative z-10 mx-auto px-4 md:px-8 max-w-4xl text-center">
          <div className="inline-block bg-brand-sage text-brand-dark text-xs font-bold uppercase tracking-widest px-3 py-1 rounded mb-6">
            {articulo.categoria}
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            {articulo.titulo}
          </h1>
          <div className="flex items-center justify-center gap-6 text-gray-300 text-sm">
            <span className="flex items-center gap-2"><User size={16} /> {articulo.autor}</span>
            <span className="flex items-center gap-2"><Calendar size={16} /> {new Date(articulo.fecha_publicacion || articulo.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-8 max-w-3xl -mt-10 relative z-20">
        <Link href="/noticias" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-brand-sage transition-colors mb-10 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
          <ArrowLeft size={16} /> Volver a Noticias
        </Link>
        
        {articulo.resumen && (
          <p className="text-xl md:text-2xl text-gray-500 font-light leading-relaxed mb-10 italic border-l-4 border-brand-sage pl-6">
            {articulo.resumen}
          </p>
        )}

        <div 
          className="prose prose-lg prose-headings:font-bold prose-headings:text-brand-dark prose-a:text-brand-sage prose-img:rounded-xl max-w-none text-gray-600 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: String(articulo.contenido || '')
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/<(iframe|object|embed|form)\b[^>]*>/gi, '')
              .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
              .replace(/javascript\s*:/gi, '')
          }}
        />
      </div>
    </div>
  )
}
