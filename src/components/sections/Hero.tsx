"use client"
import { useState, useEffect } from "react"
import { Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getLogosEmpresa, DEFAULT_LOGOS_EMPRESA, LogosEmpresa } from "@/lib/services/logosService"
import { createClient } from "@/lib/supabase/client"

interface HeroProps {
  onOpenCheckout?: (item: { title: string; amount: number; badgeText: string; isSubscription?: boolean }) => void
}

export default function Hero({ onOpenCheckout }: HeroProps) {
  const [logos, setLogos] = useState<LogosEmpresa>(DEFAULT_LOGOS_EMPRESA)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // 1. Obtener logos via servicio
    getLogosEmpresa().then((fetched) => {
      if (fetched) setLogos(fetched)
    })

    // 2. Consulta directa en tiempo real a Supabase para garantizar datos frescos de la BD
    const fetchDirectDb = async () => {
      try {
        const supabase = createClient()
        const [{ data: configData }, { data: paramData }] = await Promise.all([
          supabase.from("configuracion_empresa").select("logo_url, nombre_empresa").limit(1).single(),
          supabase.from("parametros_globales").select("indirectos_default").eq("id", 1).single()
        ])

        const dbLogos = paramData?.indirectos_default?.logos_servicios || {}
        const corporateLogo = configData?.logo_url || dbLogos.grupo_sara || "/logo-grupo-sara.png"

        setLogos(prev => ({
          ...prev,
          grupo_sara: corporateLogo,
          constructora: dbLogos.constructora || prev.constructora,
          inmobiliaria: dbLogos.inmobiliaria || prev.inmobiliaria,
          stays: dbLogos.stays || prev.stays,
          apu: dbLogos.apu || prev.apu,
          compras: dbLogos.compras || prev.compras,
          fletes: dbLogos.fletes || prev.fletes,
          talento: dbLogos.talento || prev.talento,
          fintech: dbLogos.fintech || prev.fintech,
        }))
      } catch (err) {
        console.warn("Hero DB fetch fallback:", err)
      }
    }
    fetchDirectDb()
  }, [])

  // Secuencia de slides: Primero GRUPO SARA con su descripción y luego cada uno de los 8 servicios
  const servicesSlides = [
    {
      id: "grupo-sara",
      indexNum: "01",
      tag: "Matriz Corporativa · Holding Oficial",
      title: "GRUPO SARA",
      description: "Ingeniería y arquitectura a la vanguardia con tecnología integral. Holding multisectorial que lidera el ecosistema de planificación técnica de obras, software APU, catálogo inmobiliario, suites de hospitalidad, red satelital de fletes pesados, talento técnico colegiado y pasarelas de pago blindadas.",
      logo: logos.grupo_sara || "/logo-grupo-sara.png",
      accentColor: "text-amber-400",
      borderColor: "border-amber-400/40",
      glowColor: "from-amber-500/30 via-amber-500/10 to-transparent",
      badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/40",
      label: "GRUPO SARA · HOLDING"
    },
    {
      id: "constructora",
      indexNum: "02",
      tag: "Infraestructura & Obra Civil",
      title: "SARA-CONSTRUCTORA",
      description: "Planificación arquitectónica, diseño estructural y dirección técnica de obras residenciales, viales y comerciales en Ecuador con los más altos estándares de calidad e ingeniería de precisión.",
      logo: logos.constructora || "/logo-hero.png",
      accentColor: "text-brand-sage",
      borderColor: "border-brand-sage/30",
      glowColor: "from-emerald-500/25 via-brand-sage/10 to-transparent",
      badgeColor: "bg-emerald-500/10 text-brand-sage border-brand-sage/30",
      label: "SARA CONSTRUCTORA · OBRAS"
    },
    {
      id: "inmobiliaria",
      indexNum: "03",
      tag: "Propiedades & Terrenos",
      title: "SARA-INMOBILIARIA",
      description: "Catálogo selecto de bienes raíces, casas campestres, departamentos urbanos y lotes de alta plusvalía con seguridad jurídica, asesoría hipotecaria y tasación técnica especializada.",
      logo: logos.inmobiliaria || "/sara-inmobiliaria.png",
      accentColor: "text-rose-400",
      borderColor: "border-rose-400/30",
      glowColor: "from-rose-500/25 via-rose-500/10 to-transparent",
      badgeColor: "bg-rose-500/10 text-rose-300 border-rose-500/30",
      label: "SARA INMOBILIARIA · BIENES RAÍCES"
    },
    {
      id: "alojamiento",
      indexNum: "04",
      tag: "Suites & Villas Tipo Airbnb",
      title: "SARA-ALOJAMIENTO",
      description: "Alojamientos temporales de alta gama en Cuenca, Quito, Galápagos y Baños con cerradura inteligente, atención 24/7 y acabados de lujo diseñados por el equipo arquitectónico de Grupo SARA.",
      logo: logos.stays || "/sara-stays.png",
      accentColor: "text-indigo-400",
      borderColor: "border-indigo-400/30",
      glowColor: "from-indigo-500/25 via-indigo-500/10 to-transparent",
      badgeColor: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
      label: "SARA ALOJAMIENTO · STAYS"
    },
    {
      id: "apu",
      indexNum: "05",
      tag: "Presupuestos & Gemelo Digital",
      title: "SARA-APU",
      description: "Software de análisis de precios unitarios con lectura automática de rubros, bases de insumos actualizadas y reportes de obra en tiempo real para optimizar la rentabilidad de contratistas.",
      logo: logos.apu || "/sara-apu.png",
      accentColor: "text-purple-400",
      borderColor: "border-purple-400/30",
      glowColor: "from-purple-500/25 via-purple-500/10 to-transparent",
      badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/30",
      label: "SARA APU · SOFTWARE"
    },
    {
      id: "marketplace",
      indexNum: "06",
      tag: "Marketplace de Materiales",
      title: "SARA-MARKETPLACE",
      description: "Conexión directa entre proveedores de acero, cemento, agregados y acabados con precios mayoristas en vivo para compras por volumen sin intermediarios en todo el territorio nacional.",
      logo: logos.compras || "/sara-grupo.png",
      accentColor: "text-cyan-400",
      borderColor: "border-cyan-400/30",
      glowColor: "from-cyan-500/25 via-cyan-500/10 to-transparent",
      badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
      label: "SARA COMPRAS · MARKETPLACE"
    },
    {
      id: "fletes",
      indexNum: "07",
      tag: "Logística & Transporte Pesado",
      title: "SARA-FLETES",
      description: "Despacho tipo Uber de fletes con geolocalización satelital en tiempo real, validación de carga y conductores certificados con liquidación prepago blindada y seguimiento satelital 24/7.",
      logo: logos.fletes || "/sara-fletes.png",
      accentColor: "text-blue-400",
      borderColor: "border-blue-400/30",
      glowColor: "from-blue-500/25 via-blue-500/10 to-transparent",
      badgeColor: "bg-blue-500/10 text-blue-300 border-blue-500/30",
      label: "SARA FLETES · RADAR SATELITAL"
    },
    {
      id: "talento",
      indexNum: "08",
      tag: "Bolsa de Empleo & Certificación",
      title: "SARA-TALENTO",
      description: "Matching algorítmico entre constructoras y profesionales calificados: ingenieros civiles, arquitectos colegiados, topógrafos y maestros mayores con validación de credenciales técnicas.",
      logo: logos.talento || "/sara-talento.png",
      accentColor: "text-amber-300",
      borderColor: "border-amber-300/30",
      glowColor: "from-amber-400/25 via-amber-400/10 to-transparent",
      badgeColor: "bg-amber-400/10 text-amber-300 border-amber-400/30",
      label: "SARA TALENTO · RED TÉCNICA"
    },
    {
      id: "pagos",
      indexNum: "09",
      tag: "Pasarela & Finanzas de Obra",
      title: "SARA-PAGOS",
      description: "Retenciones, anticipos garantizados y pago contra avance de obra con pasarela estándar, QR empresarial DeUna y cuentas bancarias directas para proteger los fondos de clientes y constructores.",
      logo: logos.fintech || "/logo-grupo-sara.png",
      accentColor: "text-emerald-400",
      borderColor: "border-emerald-400/30",
      glowColor: "from-emerald-500/25 via-emerald-500/10 to-transparent",
      badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      label: "SARA PAGOS · FINANZAS BLINDADAS"
    }
  ]

  // Rotación progresiva automática cada 4 segundos (entre 3 y 5 segundos exactos)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % servicesSlides.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [servicesSlides.length])

  const currentSlide = servicesSlides[currentIndex] || servicesSlides[0]

  return (
    <section className="relative min-h-[85vh] lg:min-h-[92vh] flex items-center pt-28 pb-16 overflow-hidden bg-slate-950">
      {/* Luces y texturas ambientales coherentes con toda la página */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950 to-black pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 right-10 w-[30rem] h-[30rem] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative z-20 mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center min-h-[62vh]">
          
          {/* Columna Izquierda: Mensaje Institucional de Alto Posicionamiento y Datos del Servicio */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Header de Posicionamiento Fuerte */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-brand-sage/40 text-xs font-bold text-brand-sage shadow-lg backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-brand-sage animate-pulse" />
                <span className="tracking-wider uppercase font-extrabold text-[11px]">GRUPO SARA</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-200 font-semibold">Ingeniería & Tecnología Integral</span>
              </div>

              <div className="text-xs sm:text-sm font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-brand-sage via-amber-300 to-white uppercase pt-1 drop-shadow-md leading-relaxed">
                GRUPO SARA — Ingeniería y Arquitectura a la Vanguardia · Tecnología Integral
              </div>
            </div>

            {/* Transición de Servicio cada 4 segundos */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`service-${currentSlide.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-5"
              >
                {/* Tag de Categoría e Indicador de Progreso */}
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg text-xs font-mono font-black border ${currentSlide.badgeColor}`}>
                    {currentSlide.indexNum} / 09
                  </span>
                  <div className="w-8 h-px bg-brand-sage/60" />
                  <span className={`${currentSlide.accentColor} font-bold tracking-[0.2em] uppercase text-xs sm:text-sm drop-shadow-md`}>
                    {currentSlide.tag}
                  </span>
                </div>

                {/* Título Oficial del Servicio */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.08] drop-shadow-2xl">
                  {currentSlide.title}
                </h1>

                {/* Descripción Exacta del Ecosistema */}
                <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed font-normal border-l-4 border-brand-sage pl-6 drop-shadow-lg">
                  {currentSlide.description}
                </p>
              </motion.div>
            </AnimatePresence>

          </div>

          {/* Columna Derecha: Logotipo Oficial del Servicio en Tamaño Grande y Destacado */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={`logo-card-${currentSlide.id}`}
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="relative w-full max-w-lg lg:max-w-xl aspect-square flex flex-col items-center justify-center p-6 sm:p-10 rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-slate-800 shadow-[0_25px_60px_rgba(0,0,0,0.7)] group overflow-hidden"
              >
                {/* Resplandor dinámico de fondo con el color temático del servicio */}
                <div className={`absolute inset-0 bg-gradient-to-br ${currentSlide.glowColor} pointer-events-none`} />
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand-sage/20 via-transparent to-amber-500/20 opacity-50 blur-2xl pointer-events-none" />

                {/* Contenedor del Logotipo Oficial Grande y Nítido */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-between">
                  <div className="w-full flex-1 flex items-center justify-center p-2 sm:p-4">
                    <img
                      src={currentSlide.logo}
                      alt={currentSlide.title}
                      className="max-h-[260px] sm:max-h-[320px] md:max-h-[360px] max-w-[90%] w-auto h-auto object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  {/* Etiqueta institucional inferior */}
                  <div className="mt-2 px-5 py-2 rounded-full bg-slate-950/80 border border-slate-800 backdrop-blur-md shadow-md">
                    <span className="text-xs font-mono tracking-widest text-slate-200 uppercase font-bold">
                      {currentSlide.label} · ECUADOR
                    </span>
                  </div>
                </div>

                {/* Barra indicadora del ciclo continuo (4 segundos) */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10 overflow-hidden">
                  <motion.div
                    key={`bar-${currentSlide.id}`}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 4, ease: "linear" }}
                    className="h-full bg-brand-sage shadow-[0_0_10px_rgba(60,122,82,0.8)]"
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
