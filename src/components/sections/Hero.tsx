"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { ArrowRight, ChevronLeft, ChevronRight, Calendar, Building2, Eye, ShieldCheck, Sparkles, Truck, Calculator, ShoppingCart, Users, Wallet } from "lucide-react"
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
  isLogo: boolean
  accentColor: string
  pillActiveBg: string
}

interface HeroProps {
  onOpenCheckout?: (item: { title: string; amount: number; badgeText: string; isSubscription?: boolean }) => void
}

export default function Hero({ onOpenCheckout }: HeroProps) {
  const [logoUrl, setLogoUrl] = useState<string>('/logo-grupo-sara.png')
  const [projectSlides, setProjectSlides] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      // 1. Obtener Logo Oficial
      const { data: config } = await supabase.from('configuracion_empresa').select('logo_url').limit(1).single()
      if (config?.logo_url) {
        setLogoUrl(config.logo_url)
      }

      // 2. Obtener Proyectos marcados para mostrarse (destacados)
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

  // Construcción de la lista completa de slides en el orden progresivo con todos los servicios y logos:
  const allSlides: HeroSlide[] = [
    {
      id: "constructora",
      label: "01 · Constructora",
      tag: "Ingeniería · Arquitectura · Construcción",
      title: (
        <>
          DISEÑAMOS <span className="font-light italic text-brand-sage">IDEAS.</span><br />
          CONSTRUIMOS FUTURO.
        </>
      ),
      description: "Transformamos visión en estructura. Integramos planificación, diseño y ejecución para proyectos de alta precisión arquitectónica y funcionalidad absoluta con ingeniería y tecnología de vanguardia.",
      primaryBtn: {
        text: "Solicitar Cotización",
        href: "/contacto",
        variant: "sage"
      },
      secondaryBtn: {
        text: "Conocer Proyectos",
        href: "/proyectos"
      },
      image: logoUrl,
      isLogo: true,
      accentColor: "text-brand-sage",
      pillActiveBg: "bg-brand-sage text-slate-950"
    },
    {
      id: "airbnb",
      label: "02 · SARA Stays",
      tag: "Hospitality · Suites · Renta Vacacional & Corporativa",
      title: (
        <>
          TU PROPIEDAD, <span className="font-light italic text-amber-400">UNA GRAN</span><br />
          OPORTUNIDAD.
        </>
      ),
      description: "Convierte tu casa, departamento o propiedad en una fuente de ingresos con el respaldo de SARA Constructora. Reserva y hospédate en suites de primer nivel nacional y mundial con cerradura inteligente y atención 24/7.",
      primaryBtn: {
        text: "Ver Alojamientos Stays",
        href: "/stays",
        variant: "amber",
        icon: <Calendar size={16} />
      },
      secondaryBtn: {
        text: "Publicar Mi Propiedad",
        href: "https://wa.me/593981804023?text=Hola%20SARA%20Constructora,%20deseo%20m%C3%A1s%20informaci%C3%B3n%20para%20publicar%20mi%20propiedad%20en%20Airbnb",
        isExternal: true
      },
      image: "/sara-airbnb.png",
      isLogo: false,
      accentColor: "text-amber-400",
      pillActiveBg: "bg-amber-400 text-slate-950"
    },
    {
      id: "inmobiliaria",
      label: "03 · Inmobiliaria",
      tag: "Bienes Raíces · Compra · Venta · Arriendo · Terrenos",
      title: (
        <>
          TU PRÓXIMO <span className="font-light italic text-emerald-400">ESPACIO</span><br />
          ESTÁ AQUÍ.
        </>
      ),
      description: "Compra, venta y arriendo de casas, departamentos y terrenos con confianza, seguridad jurídica, asesoría hipotecaria y acompañamiento profesional de SARA Constructora.",
      primaryBtn: {
        text: "Explorar Inmobiliaria",
        href: "/inmobiliaria",
        variant: "emerald",
        icon: <Building2 size={16} />
      },
      secondaryBtn: {
        text: "Consignar Propiedad",
        href: "https://wa.me/593981804023?text=Hola%20SARA%20Inmobiliaria,%20deseo%20asesor%C3%ADa%20para%20comprar,%20vender%20o%20consignar%20una%20propiedad",
        isExternal: true
      },
      image: "/sara-inmobiliaria.png",
      isLogo: false,
      accentColor: "text-emerald-400",
      pillActiveBg: "bg-emerald-400 text-slate-950"
    },
    {
      id: "fletes",
      label: "04 · Red de Fletes",
      tag: "Logística Pesada · Despacho 24/7 · Monitoreo GPS",
      title: (
        <>
          LOGÍSTICA PESADA <span className="font-light italic text-blue-400">EN TIEMPO</span><br />
          REAL.
        </>
      ),
      description: "Red de transporte pesado y fletes con despacho inteligente tipo Uber, geolocalización satelital en vivo, verificación vehicular y liquidación prepago blindada.",
      primaryBtn: {
        text: "Consola de Fletes",
        href: "/modulos/fletes",
        variant: "amber",
        icon: <Truck size={16} />
      },
      secondaryBtn: {
        text: "Registrar Vehículo",
        href: "/modulos/fletes/auth"
      },
      image: "/sara-fletes.png",
      isLogo: false,
      accentColor: "text-blue-400",
      pillActiveBg: "bg-blue-400 text-slate-950"
    },
    {
      id: "apu",
      label: "05 · APU & SaaS",
      tag: "Gemelo Digital · Presupuestos Inteligentes · Precios Unitarios",
      title: (
        <>
          PRESUPUESTOS <span className="font-light italic text-purple-400">DE PRECISIÓN</span><br />
          AL INSTANTE.
        </>
      ),
      description: "Generación de gemelos digitales y lectura automática de presupuestos en Excel y CSV con la base de datos de análisis de precios unitarios (APU) más moderna del país.",
      primaryBtn: {
        text: "Probar APU SARA",
        href: "/dashboard",
        variant: "sage",
        icon: <Calculator size={16} />
      },
      secondaryBtn: {
        text: "Ver Planes de Software",
        href: "/dashboard/planes"
      },
      image: "/sara-apu.png",
      isLogo: false,
      accentColor: "text-purple-400",
      pillActiveBg: "bg-purple-400 text-slate-950"
    },
    {
      id: "talento",
      label: "06 · SARA Talento",
      tag: "Red Profesional · Ingenieros & Arquitectos Certificados",
      title: (
        <>
          TALENTO TÉCNICO <span className="font-light italic text-amber-300">CERTIFICADO</span><br />
          PARA TU OBRA.
        </>
      ),
      description: "Conexión directa con ingenieros civiles, arquitectos colegiados, topógrafos y maestros mayores calificados con validación documental y antecedentes verificados.",
      primaryBtn: {
        text: "Buscar Profesionales",
        href: "/modulos/talento",
        variant: "amber",
        icon: <Users size={16} />
      },
      secondaryBtn: {
        text: "Unirme como Profesional",
        href: "/modulos/talento/registro"
      },
      image: "/sara-talento.png",
      isLogo: false,
      accentColor: "text-amber-300",
      pillActiveBg: "bg-amber-300 text-slate-950"
    },
    ...projectSlides.map((p, idx) => {
      const slideNum = String(idx + 7).padStart(2, '0')
      return {
        id: `proy-${p.id}`,
        label: `${slideNum} · ${p.nombre}`,
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
          text: "Ver Todo el Portafolio",
          href: "/proyectos"
        },
        image: p.imagen_url,
        isLogo: false,
        accentColor: "text-brand-sage",
        pillActiveBg: "bg-brand-sage text-slate-950"
      }
    })
  ]

  // Rotación automática cada 6 segundos
  useEffect(() => {
    if (isPaused || allSlides.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allSlides.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [isPaused, allSlides.length])

  const safeIndex = currentIndex % (allSlides.length || 1)
  const currentSlide = allSlides[safeIndex] || allSlides[0]

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : allSlides.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allSlides.length)
  }

  return (
    <section 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative min-h-[90vh] lg:min-h-screen flex items-center pt-24 pb-16 overflow-hidden bg-brand-dark"
    >
      {/* Fondo Split con las imágenes y logos en rotación progresiva */}
      {allSlides.map((slide, index) => {
        const isActive = index === safeIndex
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 lg:left-[45%] lg:w-auto w-full h-full transition-opacity duration-[1200ms] ease-in-out z-0 
              ${slide.isLogo 
                ? 'bg-[length:auto_60%] md:bg-[length:auto_75%] bg-center lg:bg-[position:80%_center] bg-no-repeat' 
                : 'bg-cover bg-center lg:bg-[position:center_center] bg-no-repeat'
              } 
              ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            style={{ 
              backgroundImage: `url('${slide.image}')`, 
              opacity: isActive ? (slide.isLogo ? 0.92 : 1) : 0 
            }}
          >
            {/* Máscara de desvanecimiento suave para fundir la fotografía con el fondo oscuro */}
            {!slide.isLogo && (
              <div className="hidden lg:block absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-brand-dark via-brand-dark/85 to-transparent z-10" />
            )}
            
            {/* Oscurecimiento en pantallas móviles para asegurar legibilidad */}
            {!slide.isLogo && (
              <div className="lg:hidden absolute inset-0 bg-brand-dark/80 z-10" />
            )}
          </div>
        )
      })}
      
      {/* Gradiente sutil para mantener los textos nítidos */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-brand-dark/95 via-brand-dark/65 to-transparent w-full md:w-[120%]" />
      
      {/* Resplandor verde de marca de fondo */}
      <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_left,_var(--color-brand-sage)_0%,_transparent_60%)] opacity-25 pointer-events-none" />

      {/* Contenido Principal a la Izquierda: Mensaje de Alto Posicionamiento */}
      <div className="container relative z-20 mx-auto px-6 md:px-12 flex flex-col justify-center min-h-[75vh]">
        <div className="max-w-3xl space-y-6 md:pl-8">
          
          {/* Header de Posicionamiento Fuerte */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-brand-sage/40 text-xs font-bold text-brand-sage shadow-lg backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-brand-sage" />
              <span className="tracking-wider uppercase font-extrabold text-[11px]">GRUPO SARA</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-200">Ingeniería & Tecnología</span>
            </div>

            <div className="text-xs sm:text-sm font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-brand-sage via-amber-300 to-white uppercase pt-1 drop-shadow-md">
              GRUPO SARA — Ingeniería y Arquitectura a la Vanguardia · Tecnología Integral
            </div>
          </div>
          
          {/* Tag de Categoría animado del slide actual */}
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
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight drop-shadow-2xl max-w-3xl">
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
              className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl leading-relaxed font-normal border-l-4 border-brand-sage pl-6 drop-shadow-lg"
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
                className={`w-full sm:w-auto group relative overflow-hidden transition-all shadow-xl font-black text-xs uppercase tracking-wider ${
                  currentSlide.primaryBtn.variant === "amber"
                    ? "bg-amber-500 hover:bg-amber-400 text-slate-950"
                    : currentSlide.primaryBtn.variant === "emerald"
                    ? "bg-brand-sage hover:bg-emerald-500 text-slate-950"
                    : "bg-brand-sage text-brand-dark hover:text-white"
                }`} 
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

              {onOpenCheckout && (
                <button
                  type="button"
                  onClick={() => onOpenCheckout({
                    title: `Consulta Técnica & Contratación - ${currentSlide.label}`,
                    amount: 49.99,
                    badgeText: "Grupo SARA Oficial",
                    isSubscription: false
                  })}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:border-brand-sage shadow-lg"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Pasarela de Pago Estándar</span>
                </button>
              )}
              
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

          {/* Navegador de Slides: Logos e Indicadores de cada Servicio */}
          <div className="pt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 max-w-full overflow-x-auto">
              {allSlides.map((s, idx) => {
                const isSelected = idx === safeIndex
                return (
                  <button
                    key={s.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      isSelected 
                        ? s.pillActiveBg + " shadow-md scale-105" 
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>{s.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Flechas manuales */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                aria-label="Slide anterior"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/15"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                aria-label="Slide siguiente"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/15"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

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
