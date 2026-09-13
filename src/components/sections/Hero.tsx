"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { MapPin, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"

export default function Hero() {
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"
  ])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const fetchProjects = async () => {
      const supabase = createClient()
      
      // Intentar traer primero solo los proyectos destacados
      const { data, error } = await supabase
        .from('proyectos')
        .select('imagen_url')
        .eq('destacado', true)
        .not('imagen_url', 'is', null)
      
      let urls = data?.map((p: any) => p.imagen_url).filter(Boolean) || []

      // Si no hay destacados (o si da error porque aún no existe la columna), traer cualquiera
      if (urls.length === 0) {
        const { data: fallbackData } = await supabase
          .from('proyectos')
          .select('imagen_url')
          .not('imagen_url', 'is', null)
          .limit(5)
        
        urls = fallbackData?.map((p: any) => p.imagen_url).filter(Boolean) || []
      }

      urls = ['/logo-hero.png', ...urls]

      setImages(urls)
    }
    fetchProjects()
  }, [])

  useEffect(() => {
    if (images.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [images])

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-brand-dark">
      
      {/* High-quality background image carousel */}
      {images.map((img, index) => (
        <div
          key={img}
          className={`absolute inset-0 w-full h-full bg-center transition-opacity duration-[1500ms] ease-in-out z-0 ${img === '/logo-hero.png' ? 'bg-contain md:bg-auto bg-no-repeat' : 'bg-cover'} ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url('${img}')`, opacity: index === currentIndex ? (img === '/logo-hero.png' ? 0.2 : 1) : 0 }}
        />
      ))}
      
      {/* Very subtle gradient (20% intensity) just to keep text crisp */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-brand-dark/60 via-brand-dark/30 to-transparent w-full md:w-[120%]" />

      <div className="container relative z-20 mx-auto px-6 md:px-12 flex flex-col justify-center min-h-[80vh]">

        <div className="max-w-3xl space-y-8 md:pl-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-start gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-px bg-brand-sage" />
              <h2 className="text-brand-sage font-bold tracking-[0.2em] uppercase text-xs md:text-sm drop-shadow-md">
                Ingeniería · Arquitectura · Construcción
              </h2>
            </div>
          </motion.div>
          
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.05] tracking-tight drop-shadow-2xl"
            >
              DISEÑAMOS <span className="font-light italic text-brand-sage">IDEAS.</span><br />
              CONSTRUIMOS FUTURO.
            </motion.h1>
          </div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-base md:text-lg text-gray-100 max-w-2xl leading-relaxed font-light border-l-2 border-brand-sage/50 pl-6 drop-shadow-lg"
          >
            Transformamos visión en estructura. Integramos planificación, diseño y ejecución para proyectos de alta precisión arquitectónica y funcionalidad absoluta.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center gap-6 pt-6"
          >
            <Button variant="sage" size="lg" className="w-full sm:w-auto group relative overflow-hidden bg-brand-sage text-brand-dark hover:text-white transition-colors shadow-xl" asChild>
              <Link href="/contacto">
                <span className="relative z-10 flex items-center gap-2">
                  Solicitar Cotización <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-brand-dark scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out z-0" />
              </Link>
            </Button>
            
            <Link href="/proyectos" className="group flex items-center gap-3 text-white text-sm font-bold uppercase tracking-widest hover:text-brand-sage transition-colors drop-shadow-lg">
              <span className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center group-hover:border-brand-sage bg-white/5 backdrop-blur-sm transition-colors">
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
              Conocer Proyectos
            </Link>
          </motion.div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold rotate-90 mb-6">Scroll</span>
        <div className="w-px h-16 bg-white/20 relative overflow-hidden">
          <motion.div 
            animate={{ y: [0, 64] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-full h-1/2 bg-brand-sage absolute top-0"
          />
        </div>
      </motion.div>

    </section>
  )
}
