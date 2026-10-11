"use client"
import { useState, useEffect } from "react"
import { Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getLogosEmpresa, DEFAULT_LOGOS_EMPRESA, LogosEmpresa } from "@/lib/services/logosService"

interface HeroProps {
  onOpenCheckout?: (item: { title: string; amount: number; badgeText: string; isSubscription?: boolean }) => void
}

export default function Hero({ onOpenCheckout }: HeroProps) {
  const [logos, setLogos] = useState<LogosEmpresa>(DEFAULT_LOGOS_EMPRESA)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    getLogosEmpresa().then((fetched) => {
      if (fetched) setLogos(fetched)
    })
  }, [])

  const servicesSlides = [
    {
      id: "constructora",
      indexNum: "01",
      tag: "Infraestructura & Obra Civil",
      title: "SARA-CONSTRUCTORA",
      description: "Planificación arquitectónica, diseño estructural y dirección técnica de obras residenciales, viales y comerciales en Ecuador.",
      logo: logos.constructora || "/logo-hero.png",
      accentColor: "text-amber-400",
      borderColor: "border-amber-400/30",
      glowColor: "from-amber-500/20 via-amber-500/5 to-transparent",
      badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/30"
    },
    {
      id: "apu",
      indexNum: "02",
      tag: "Presupuestos & Gemelo Digital",
      title: "SARA-APU",
      description: "Software de análisis de precios unitarios con lectura automática de rubros, bases de insumos actualizadas y reportes de obra.",
      logo: logos.apu || "/sara-apu.png",
      accentColor: "text-purple-400",
      borderColor: "border-purple-400/30",
      glowColor: "from-purple-500/20 via-purple-500/5 to-transparent",
      badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/30"
    },
    {
      id: "marketplace",
      indexNum: "03",
      tag: "Marketplace de Materiales",
      title: "SARA-MARKETPLACE",
      description: "Conexión directa entre proveedores de acero, cemento, agregados y acabados con precios mayoristas en vivo.",
      logo: logos.compras || "/sara-grupo.png",
      accentColor: "text-cyan-400",
      borderColor: "border-cyan-400/30",
      glowColor: "from-cyan-500/20 via-cyan-500/5 to-transparent",
      badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
    },
    {
      id: "inmobiliaria",
      indexNum: "04",
      tag: "Propiedades & Terrenos",
      title: "SARA-INMOBILIARIA",
      description: "Catálogo selecto de bienes raíces, casas campestres, departamentos urbanos y lotes de alta plusvalía.",
      logo: logos.inmobiliaria || "/sara-inmobiliaria.png",
      accentColor: "text-rose-400",
      borderColor: "border-rose-400/30",
      glowColor: "from-rose-500/20 via-rose-500/5 to-transparent",
      badgeColor: "bg-rose-500/10 text-rose-300 border-rose-500/30"
    },
    {
      id: "alojamiento",
      indexNum: "05",
      tag: "Suites & Villas Tipo Airbnb",
      title: "SARA-ALOJAMIENTO",
      description: "Alojamientos temporales de alta gama en Cuenca, Quito, Galápagos y Baños con cerradura inteligente y atención 24/7.",
      logo: logos.stays || "/sara-stays.png",
      accentColor: "text-indigo-400",
      borderColor: "border-indigo-400/30",
      glowColor: "from-indigo-500/20 via-indigo-500/5 to-transparent",
      badgeColor: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30"
    },
    {
      id: "fletes",
      indexNum: "06",
      tag: "Logística & Transporte Pesado",
      title: "SARA-FLETES",
      description: "Despacho tipo Uber de fletes con geolocalización satelital en tiempo real, validación de carga y conductores certificados.",
      logo: logos.fletes || "/sara-fletes.png",
      accentColor: "text-blue-400",
      borderColor: "border-blue-400/30",
      glowColor: "from-blue-500/20 via-blue-500/5 to-transparent",
      badgeColor: "bg-blue-500/10 text-blue-300 border-blue-500/30"
    },
    {
      id: "talento",
      indexNum: "07",
      tag: "Bolsa de Empleo & Certificación",
      title: "SARA-TALENTO",
      description: "Matching algorítmico entre constructoras y profesionales: ingenieros civiles, arquitectos, topógrafos y maestros mayores.",
      logo: logos.talento || "/sara-talento.png",
      accentColor: "text-amber-300",
      borderColor: "border-amber-300/30",
      glowColor: "from-amber-400/20 via-amber-400/5 to-transparent",
      badgeColor: "bg-amber-400/10 text-amber-300 border-amber-400/30"
    },
    {
      id: "pagos",
      indexNum: "08",
      tag: "Pasarela & Finanzas de Obra",
      title: "SARA-PAGOS",
      description: "Retenciones, anticipos garantizados y pago contra avance de obra con pasarela estándar, QR empresarial y cuentas bancarias.",
      logo: logos.fintech || "/logo-grupo-sara.png",
      accentColor: "text-emerald-400",
      borderColor: "border-emerald-400/30",
      glowColor: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
    }
  ]

  // Rotación progresiva automática cada 2 segundos exactamente
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % servicesSlides.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [servicesSlides.length])

  const currentSlide = servicesSlides[currentIndex] || servicesSlides[0]

  return (
    <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden bg-brand-dark">
      {/* Luces y texturas de fondo ambiental */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900/40 via-brand-dark to-slate-950 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-sage/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative z-20 mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[65vh]">
          
          {/* Columna Izquierda: Mensaje Institucional de Alto Posicionamiento y Datos del Servicio */}
          <div className="lg:col-span-7 space-y-7">
            
            {/* Header de Posicionamiento Fuerte */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-brand-sage/40 text-xs font-bold text-brand-sage shadow-lg backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-brand-sage animate-pulse" />
                <span className="tracking-wider uppercase font-extrabold text-[11px]">GRUPO SARA</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-200 font-semibold">Ingeniería & Tecnología</span>
              </div>

              <div className="text-xs sm:text-sm font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-brand-sage via-amber-300 to-white uppercase pt-1 drop-shadow-md leading-relaxed">
                GRUPO SARA — Ingeniería y Arquitectura a la Vanguardia · Tecnología Integral
              </div>
            </div>

            {/* Transición de Servicio cada 2 segundos */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`service-${currentSlide.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-5"
              >
                {/* Tag de Categoría e Indicador de Progreso */}
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold border ${currentSlide.badgeColor}`}>
                    {currentSlide.indexNum} / 08
                  </span>
                  <div className="w-8 h-px bg-brand-sage/60" />
                  <span className={`${currentSlide.accentColor} font-bold tracking-[0.2em] uppercase text-xs sm:text-sm drop-shadow-md`}>
                    {currentSlide.tag}
                  </span>
                </div>

                {/* Título Oficial del Servicio */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] drop-shadow-2xl">
                  {currentSlide.title}
                </h1>

                {/* Descripción Exacta del Ecosistema */}
                <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl leading-relaxed font-normal border-l-4 border-brand-sage pl-6 drop-shadow-lg">
                  {currentSlide.description}
                </p>
              </motion.div>
            </AnimatePresence>

          </div>

          {/* Columna Derecha: Logotipo Oficial del Servicio Destacado en Rotación cada 2 Segundos */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={`logo-card-${currentSlide.id}`}
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative w-full max-w-md aspect-square flex flex-col items-center justify-center p-8 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group overflow-hidden"
              >
                {/* Resplandor dinámico de fondo con el color del servicio */}
                <div className={`absolute inset-0 bg-gradient-to-br ${currentSlide.glowColor} pointer-events-none`} />
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand-sage/20 via-transparent to-amber-500/20 opacity-50 blur-xl pointer-events-none" />

                {/* Contenedor del Logotipo Oficial */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 flex items-center justify-center p-4">
                    <img
                      src={currentSlide.logo}
                      alt={currentSlide.title}
                      className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)] transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  {/* Etiqueta institucional inferior */}
                  <div className="mt-4 px-4 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
                    <span className="text-[11px] font-mono tracking-widest text-slate-300 uppercase font-semibold">
                      {currentSlide.title} · ECUADOR
                    </span>
                  </div>
                </div>

                {/* Pequeña barra indicadora de ciclo continuo (2s) */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
                  <motion.div
                    key={`bar-${currentSlide.id}`}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "linear" }}
                    className="h-full bg-brand-sage"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  )
}
