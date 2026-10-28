"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { ArrowRight, Eye } from "lucide-react"
import { motion } from "framer-motion"
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

      const { data } = await supabase
        .from("proyectos")
        .select("id, nombre, ubicacion, estado, imagen_url")
        .eq("destacado", true)
        .not("imagen_url", "is", null)

      if (data && data.length > 0) {
        setProjectSlides(data)
      } else {
        const { data: fallbackData } = await supabase
          .from("proyectos")
          .select("id, nombre, ubicacion, estado, imagen_url")
          .not("imagen_url", "is", null)
          .limit(4)

        if (fallbackData && fallbackData.length > 0) {
          setProjectSlides(fallbackData)
        }
      }
    }
    fetchData()
  }, [])

  const allSlides: HeroSlide[] =
    projectSlides.length > 0
      ? projectSlides.map((p) => ({
          id: `proy-${p.id}`,
          label: p.nombre,
          tag: `Proyecto Destacado · ${p.ubicacion || "Ecuador"}`,
          title: <>{p.nombre.toUpperCase()}</>,
          description:
            "Obra arquitectónica y constructiva ejecutada con ingeniería de precisión y los más altos estándares de diseño bajo normativa NEC-15 por SARA Constructora.",
          primaryBtn: {
            text: "Ver Detalles del Proyecto",
            href: `/proyectos/${p.id}`,
            variant: "sage" as const,
            icon: <Eye size={16} />,
          },
          secondaryBtn: {
            text: "Portal Clientes",
            href: "/portal",
          },
          image: p.imagen_url,
          accentColor: "text-brand-sage",
          pillActiveBg: "bg-brand-sage text-slate-950",
        }))
      : [
          {
            id: "constructora",
            label: "Constructora",
            tag: "Ingeniería · Arquitectura · Construcción",
            title: (
              <>
                DISEÑAMOS <span className="font-light italic text-brand-sage">IDEAS.</span>
                <br />
                CONSTRUIMOS FUTURO.
              </>
            ),
            description:
              "Transformamos visión en estructura. Integramos planificación BIM ISO 19650, diseño sismorresistente NEC-15 y ejecución fiscalizada para proyectos de alta precisión arquitectónica.",
            primaryBtn: {
              text: "Solicitar Cotización",
              href: "/constructora#cotizacion",
              variant: "sage" as const,
            },
            secondaryBtn: {
              text: "Portal Clientes",
              href: "/portal",
            },
            image:
              "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
            accentColor: "text-brand-sage",
            pillActiveBg: "bg-brand-sage text-slate-950",
          },
        ]

  useEffect(() => {
    if (isPaused || allSlides.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allSlides.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [isPaused, allSlides.length])

  const safeIndex = currentIndex % (allSlides.length || 1)
  const currentSlide = allSlides[safeIndex] || allSlides[0]

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center overflow-hidden bg-slate-950"
    >
      {/* Fotografía arquitectónica con gradiente ejecutivo de alto contraste */}
      {allSlides.map((slide, index) => {
        const isActive = index === safeIndex
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-all duration-[1200ms] ease-in-out z-0 bg-cover bg-center lg:bg-[position:65%_center] bg-no-repeat brightness-[0.82] contrast-[1.08]
              ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"}`}
            style={{
              backgroundImage: `url('${slide.image}')`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/30 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-slate-950/50 z-10" />
          </div>
        )
      })}

      <div className="container relative z-20 mx-auto px-5 sm:px-8 md:px-12 flex flex-col justify-center min-h-[80vh] md:min-h-[85vh] py-20 md:py-24">
        <div className="max-w-4xl space-y-6 md:space-y-8 md:pl-6 lg:pl-10">
          {/* Kicker de Categoría */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-[2px] bg-emerald-400 rounded-full" />
            <span className="font-mono text-xs uppercase tracking-[0.22em] font-bold text-emerald-300 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-500/30 shadow-lg">
              {currentSlide.tag}
            </span>
          </div>

          {/* Título Principal de Alto Contraste */}
          <div className="space-y-3">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.04] tracking-[-0.03em] drop-shadow-[0_8px_24px_rgba(0,0,0,0.9)]">
              {currentSlide.title}
            </h1>
          </div>

          {/* Descripción Ejecutiva con Fondo Translúcido Sutil para Legibilidad Total */}
          <p className="text-base sm:text-lg md:text-xl text-white/95 max-w-2xl leading-relaxed font-normal border-l-2 border-emerald-400 pl-5 md:pl-6 drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]">
            {currentSlide.description}
          </p>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-3 pb-2">
            <Button
              variant="sage"
              size="lg"
              className="w-full sm:w-auto min-h-[50px] px-8 group relative overflow-hidden transition-all shadow-[0_12px_30px_rgba(16,185,129,0.3)] font-bold text-xs uppercase tracking-widest bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-xl active:scale-[0.98]"
              asChild
            >
              <Link href={currentSlide.primaryBtn.href}>
                <span className="relative z-10 flex items-center justify-center gap-2.5 font-black">
                  {currentSlide.primaryBtn.icon}
                  {currentSlide.primaryBtn.text}
                  <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </Button>

            <Link
              href={currentSlide.secondaryBtn.href}
              className="min-h-[50px] px-6 rounded-xl border border-white/25 bg-slate-900/80 backdrop-blur-md hover:bg-slate-800 group flex items-center justify-center gap-3 text-white text-xs font-bold uppercase tracking-widest hover:border-emerald-400/60 transition-all shadow-lg active:scale-[0.98]"
            >
              <span className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center group-hover:border-emerald-400 bg-black/40 transition-colors">
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform text-white group-hover:text-emerald-400" />
              </span>
              {currentSlide.secondaryBtn.text}
            </Link>
          </div>

          {/* Indicadores táctiles */}
          {allSlides.length > 1 && (
            <div className="pt-4 flex items-center gap-3">
              {allSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Ir al proyecto ${idx + 1}`}
                  className="py-3 px-1 -my-3 cursor-pointer group focus:outline-none"
                >
                  <span
                    className={`block h-1.5 transition-all duration-500 rounded-full ${
                      idx === safeIndex
                        ? "w-10 bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                        : "w-2.5 bg-white/40 group-hover:bg-white/70"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Indicador sutil de scroll */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-white/50 pointer-events-none z-20">
        <span className="text-[9px] uppercase tracking-[0.2em] font-bold">Explorar</span>
        <div className="w-px h-10 bg-white/20 relative overflow-hidden">
          <motion.div
            animate={{ y: [0, 40] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-full h-1/2 bg-emerald-400 absolute top-0"
          />
        </div>
      </div>
    </section>
  )
}
