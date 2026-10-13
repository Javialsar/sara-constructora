"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { ArrowRight, ChevronLeft, ChevronRight, Calendar, Building2, Eye } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"

interface HeroSlide {
  id: string
  label: string
  tag: string
  title: React.ReactNode
  description: string
  primaryBtn: {
    text: string
    href: string
    variant: "sage" | "amber" | "emerald"
    icon?: React.ReactNode
    isExternal?: boolean
  }
  secondaryBtn: {
    text: string
    href: string
    isExternal?: boolean
  }
  image: string
  accentColor: string
  pillActiveBg: string
}

export default function HeroConstructora() {
  const [projectSlides, setProjectSlides] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      // Obtener Proyectos marcados para mostrarse (destacados)
      const { data } = await supabase
        .from('proyectos')
        .select('id, nombre, ubicacion, estado, imagen_url')
        .eq('destacado', true)
        .not('imagen_url', 'is', null)

      if (data && data.length > 0) {
        setProjectSlides(data)
      } else {
        // Fallback por si aún no tienen destacados marcados
        const { data: fallbackData } = await supabase
          .from('proyectos')
          .select('id, nombre, ubicacion, estado, imagen_url')
          .not('imagen_url', 'is', null)
          .limit(4)

        if (fallbackData && fallbackData.length > 0) {
          setProjectSlides(fallbackData)
        }
      }
    }
    fetchData()
  }, [])

  // Construcción de la lista completa de slides:
  // Proyectos destacados con fotografía de alta resolución.
  const allSlides: HeroSlide[] = projectSlides.length > 0
    ? projectSlides.map((p, idx) => {
        return {
          id: `proy-${p.id}`,
          label: p.nombre,
          tag: `Proyecto Destacado · ${p.ubicacion || 'Ecuador'}`,
          title: (
            <>
              {p.nombre.toUpperCase()}
            </>
          ),
          description: `Obra arquitectónica y constructiva ejecutada con ingeniería de precisión y los más altos estándares de diseño por SARA Constructora.`,
          primaryBtn: {
            text: "Ver Detalles del Proyecto",
            href: `/proyectos/${p.id}`,
            variant: "sage" as const,
            icon: <Eye size={16} />
          },
          secondaryBtn: {
            text: "Portal Clientes",
            href: "/portal"
          },
          image: p.imagen_url,
          accentColor: "text-brand-sage",
          pillActiveBg: "bg-brand-sage text-slate-950"
        }
      })
    : [
        {
          id: "constructora",
          label: "Constructora",
          tag: "Ingeniería · Arquitectura · Construcción",
          title: (
            <>
              DISEÑAMOS <span className="font-light italic text-brand-sage">IDEAS.</span><br />
              CONSTRUIMOS FUTURO.
            </>
          ),
          description: "Transformamos visión en estructura. Integramos planificación, diseño y ejecución para proyectos de alta precisión arquitectónica y funcionalidad absoluta.",
          primaryBtn: {
            text: "Solicitar Cotización",
            href: "/constructora#cotizacion",
            variant: "sage" as const
          },
          secondaryBtn: {
            text: "Portal Clientes",
            href: "/portal"
          },
          image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
          accentColor: "text-brand-sage",
          pillActiveBg: "bg-brand-sage text-slate-950"
        }
      ]

  // Rotación suave automática cada 5 segundos
  useEffect(() => {
    if (isPaused || allSlides.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isPaused, allSlides.length])

  const safeIndex = currentIndex % (allSlides.length || 1)
  const currentSlide = allSlides[safeIndex] || allSlides[0]

  return (
    <section 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center overflow-hidden bg-brand-dark"
    >
      {/* Fondo con las imágenes de los proyectos arquitectónicos en rotación continua con máxima claridad e impacto visual */}
      {allSlides.map((slide, index) => {
        const isActive = index === safeIndex
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-all duration-[1200ms] ease-in-out z-0 bg-cover bg-center lg:bg-[position:65%_center] bg-no-repeat brightness-[1.12] contrast-[1.14] saturate-[1.20]
              ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
            style={{ 
              backgroundImage: `url('${slide.image}')` 
            }}
          >
            {/* Gradiente cinematográfico ligero y transparente: permite que la arquitectura se aprecie nítida, luminosa e imponente */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent z-10" />
          </div>
        )
      })}
      
      {/* Resplandor ambiental ultra sutil */}
      <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_left,_var(--color-brand-sage)_0%,_transparent_60%)] opacity-5 pointer-events-none" />

      <div className="container relative z-20 mx-auto px-6 md:px-12 flex flex-col justify-center min-h-[75vh]">
        <div className="max-w-3xl space-y-6 md:pl-8">
          
          {/* Tag de Categoría animado */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={`tag-${safeIndex}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-px bg-brand-sage" />
              <h2 className={`${currentSlide.accentColor} font-bold tracking-[0.2em] uppercase text-xs md:text-sm drop-shadow-md`}>
                {currentSlide.tag}
              </h2>
            </motion.div>
          </AnimatePresence>
          
          {/* Título Principal Dinámico */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`title-${safeIndex}`}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45 }}
              className="space-y-3"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.05] tracking-tight drop-shadow-2xl">
                {currentSlide.title}
              </h1>
            </motion.div>
          </AnimatePresence>
          
          {/* Descripción Dinámica */}
          <AnimatePresence mode="wait">
            <motion.p 
              key={`desc-${safeIndex}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="text-base md:text-lg text-gray-100 max-w-2xl leading-relaxed font-light border-l-2 border-brand-sage/50 pl-6 drop-shadow-lg"
            >
              {currentSlide.description}
            </motion.p>
          </AnimatePresence>

          {/* Botones de Acción Dinámicos */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={`btns-${safeIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col sm:flex-row items-center gap-4 pt-4"
            >
              <Button 
                variant="sage" 
                size="lg" 
                className="w-full sm:w-auto group relative overflow-hidden transition-all shadow-xl font-black text-xs uppercase tracking-wider bg-brand-sage text-brand-dark hover:text-white" 
                asChild
              >
                <Link href={currentSlide.primaryBtn.href}>
                  <span className="relative z-10 flex items-center gap-2">
                    {currentSlide.primaryBtn.icon}
                    {currentSlide.primaryBtn.text} 
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-brand-dark scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out z-0" />
                </Link>
              </Button>
              
              {currentSlide.secondaryBtn.isExternal ? (
                <a 
                  href={currentSlide.secondaryBtn.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group flex items-center gap-3 text-white text-sm font-bold uppercase tracking-widest hover:text-brand-sage transition-colors drop-shadow-lg"
                >
                  <span className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center group-hover:border-brand-sage bg-white/5 backdrop-blur-sm transition-colors">
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  {currentSlide.secondaryBtn.text}
                </a>
              ) : (
                <Link 
                  href={currentSlide.secondaryBtn.href} 
                  className="group flex items-center gap-3 text-white text-sm font-bold uppercase tracking-widest hover:text-brand-sage transition-colors drop-shadow-lg"
                >
                  <span className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center group-hover:border-brand-sage bg-white/5 backdrop-blur-sm transition-colors">
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  {currentSlide.secondaryBtn.text}
                </Link>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Indicadores minimalistas de slide (puntos limpios) */}
          {allSlides.length > 1 && (
            <div className="pt-6 flex items-center gap-2">
              {allSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Ir al proyecto ${idx + 1}`}
                  className={`h-1.5 transition-all duration-500 rounded-full cursor-pointer ${
                    idx === safeIndex 
                      ? "w-8 bg-brand-sage" 
                      : "w-2 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}

        </div>
      </div>
      
      {/* Indicador sutil de scroll */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-white/40 pointer-events-none"
      >
        <span className="text-[9px] uppercase tracking-[0.2em] font-bold">Explorar</span>
        <div className="w-px h-10 bg-white/20 relative overflow-hidden">
          <motion.div 
            animate={{ y: [0, 40] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-full h-1/2 bg-brand-sage absolute top-0"
          />
        </div>
      </motion.div>
    </section>
  )
}
