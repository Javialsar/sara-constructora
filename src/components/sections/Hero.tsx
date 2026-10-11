"use client"
import { useState, useEffect } from "react"
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getLogosEmpresa, DEFAULT_LOGOS_EMPRESA, LogosEmpresa } from "@/lib/services/logosService"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

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
  // Con fotografía cinematográfica de fondo estilo Larsen & Toubro y logos libres (sin cuadro)
  const servicesSlides = [
    {
      id: "grupo-sara",
      indexNum: "01",
      tag: "Holding Corporativo · Matriz Empresarial",
      title: "GRUPO SARA",
      headline: "INGENIERÍA & ARQUITECTURA A LA VANGUARDIA",
      description: "Holding multisectorial que lidera el desarrollo y ejecución de obras civiles, gemelo digital de presupuestos, corretaje inmobiliario, suites de hospitalidad, red satelital de fletes y pagos blindados.",
      logo: logos.grupo_sara || "/logo-grupo-sara.png",
      accentColor: "text-amber-400",
      glowColor: "from-amber-500/30 via-amber-500/10 to-transparent",
      badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/40",
      label: "GRUPO SARA · HOLDING MATRIZ",
      bgImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=85",
      href: "/#ecosistema"
    },
    {
      id: "constructora",
      indexNum: "02",
      tag: "Infraestructura & Obra Civil",
      title: "SARA-CONSTRUCTORA",
      headline: "DISEÑAMOS IDEAS. CONSTRUIMOS FUTURO.",
      description: "Planificación arquitectónica, diseño estructural y dirección técnica de obras residenciales, viales y comerciales en Ecuador con ingeniería de precisión y tecnología BIM avanzada.",
      logo: logos.constructora || "/logo-hero.png",
      accentColor: "text-brand-sage",
      glowColor: "from-emerald-500/25 via-brand-sage/10 to-transparent",
      badgeColor: "bg-emerald-500/10 text-brand-sage border-brand-sage/30",
      label: "SARA CONSTRUCTORA · INFRAESTRUCTURA",
      bgImage: "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=2000&q=85",
      href: "/constructora"
    },
    {
      id: "inmobiliaria",
      indexNum: "03",
      tag: "Propiedades & Terrenos",
      title: "SARA-INMOBILIARIA",
      headline: "TU PRÓXIMO ESPACIO ESTÁ AQUÍ.",
      description: "Catálogo selecto de bienes raíces, casas campestres, departamentos urbanos y lotes de alta plusvalía con seguridad jurídica, asesoría hipotecaria y tasación técnica garantizada.",
      logo: logos.inmobiliaria || "/sara-inmobiliaria.png",
      accentColor: "text-rose-400",
      glowColor: "from-rose-500/25 via-rose-500/10 to-transparent",
      badgeColor: "bg-rose-500/10 text-rose-300 border-rose-500/30",
      label: "SARA INMOBILIARIA · BIENES RAÍCES",
      bgImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85",
      href: "/inmobiliaria"
    },
    {
      id: "alojamiento",
      indexNum: "04",
      tag: "Suites & Villas Tipo Airbnb",
      title: "SARA-ALOJAMIENTO",
      headline: "HOSPEDAJE BOUTIQUE DE ALTA GAMA.",
      description: "Alojamientos temporales en Cuenca, Quito, Galápagos y Baños con cerradura inteligente, atención 24/7 y acabados diseñados por el equipo arquitectónico de Grupo SARA.",
      logo: logos.stays || "/sara-stays.png",
      accentColor: "text-indigo-400",
      glowColor: "from-indigo-500/25 via-indigo-500/10 to-transparent",
      badgeColor: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
      label: "SARA STAYS · HOSPITALITY",
      bgImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2000&q=85",
      href: "/stays"
    },
    {
      id: "apu",
      indexNum: "05",
      tag: "Presupuestos & Gemelo Digital",
      title: "SARA-APU",
      headline: "PRESUPUESTOS DE PRECISIÓN AL INSTANTE.",
      description: "Software de análisis de precios unitarios con lectura automática de rubros, bases de insumos actualizadas y reportes de obra en tiempo real para optimizar la rentabilidad de contratistas.",
      logo: logos.apu || "/sara-apu.png",
      accentColor: "text-purple-400",
      glowColor: "from-purple-500/25 via-purple-500/10 to-transparent",
      badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/30",
      label: "SARA APU · SAAS CONSTRUCTOR",
      bgImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=2000&q=85",
      href: "/dashboard"
    },
    {
      id: "marketplace",
      indexNum: "06",
      tag: "Marketplace de Materiales",
      title: "SARA-MARKETPLACE",
      headline: "SUMINISTROS MAYORISTAS EN VIVO.",
      description: "Conexión directa entre proveedores de acero, cemento, agregados y acabados con precios mayoristas en vivo para compras por volumen sin intermediarios en todo el país.",
      logo: logos.compras || "/sara-grupo.png",
      accentColor: "text-cyan-400",
      glowColor: "from-cyan-500/25 via-cyan-500/10 to-transparent",
      badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
      label: "SARA MARKETPLACE · MATERIALES B2B",
      bgImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2000&q=85",
      href: "/modulos/compras"
    },
    {
      id: "fletes",
      indexNum: "07",
      tag: "Logística & Transporte Pesado",
      title: "SARA-FLETES",
      headline: "LOGÍSTICA PESADA EN TIEMPO REAL.",
      description: "Despacho tipo Uber de fletes con geolocalización satelital en tiempo real, validación de carga y conductores certificados con liquidación prepago blindada y seguimiento satelital 24/7.",
      logo: logos.fletes || "/sara-fletes.png",
      accentColor: "text-blue-400",
      glowColor: "from-blue-500/25 via-blue-500/10 to-transparent",
      badgeColor: "bg-blue-500/10 text-blue-300 border-blue-500/30",
      label: "SARA FLETES · RADAR SATELITAL",
      bgImage: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=2000&q=85",
      href: "/modulos/fletes"
    },
    {
      id: "talento",
      indexNum: "08",
      tag: "Bolsa de Empleo & Certificación",
      title: "SARA-TALENTO",
      headline: "RED TÉCNICA CERTIFICADA PARA OBRA.",
      description: "Matching algorítmico entre constructoras y profesionales calificados: ingenieros civiles, arquitectos colegiados, topógrafos y maestros mayores con validación de credenciales técnicas.",
      logo: logos.talento || "/sara-talento.png",
      accentColor: "text-amber-300",
      glowColor: "from-amber-400/25 via-amber-400/10 to-transparent",
      badgeColor: "bg-amber-400/10 text-amber-300 border-amber-400/30",
      label: "SARA TALENTO · RED PROFESIONAL",
      bgImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2000&q=85",
      href: "/modulos/talento"
    },
    {
      id: "pagos",
      indexNum: "09",
      tag: "Pasarela & Finanzas de Obra",
      title: "SARA-PAGOS",
      headline: "CUSTODIA Y PAGOS CONTRA AVANCE.",
      description: "Retenciones, anticipos garantizados y pago contra avance de obra con pasarela estándar, QR empresarial DeUna y cuentas bancarias directas para blindar los fondos de proyectos.",
      logo: logos.fintech || "/logo-grupo-sara.png",
      accentColor: "text-emerald-400",
      glowColor: "from-emerald-500/25 via-emerald-500/10 to-transparent",
      badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      label: "SARA PAGOS · FINTECH & CUSTODIA",
      bgImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=2000&q=85",
      href: "/modulos/financiero"
    }
  ]

  // Rotación progresiva automática cada 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % servicesSlides.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [servicesSlides.length])

  const currentSlide = servicesSlides[currentIndex] || servicesSlides[0]

  return (
    <section className="relative min-h-[88vh] lg:min-h-[94vh] flex items-center pt-28 pb-16 overflow-hidden bg-slate-950">
      
      {/* 1. Fondo Cinematográfico de Ingeniería & Arquitectura (Estilo Larsen & Toubro) */}
      {servicesSlides.map((slide, idx) => {
        const isActive = idx === currentIndex
        return (
          <div
            key={`bg-${slide.id}`}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out z-0 ${
              isActive ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <img
              src={slide.bgImage}
              alt={slide.title}
              className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-10000 ease-out"
            />
          </div>
        )
      })}

      {/* 2. Gradientes de contraste para asegurar legibilidad cinematográfica */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950 via-slate-950/90 md:via-slate-950/80 to-slate-950/40 pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60 pointer-events-none" />

      {/* Resplandor ambiental de marca */}
      <div className="absolute -top-32 -left-32 w-[35rem] h-[35rem] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none z-10" />

      {/* 3. Contenedor Principal */}
      <div className="container relative z-20 mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[64vh]">
          
          {/* Columna Izquierda: Mensaje Institucional y Contenido Editorial */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header de Posicionamiento Fuerte */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-950/80 border border-brand-sage/40 text-xs font-bold text-brand-sage shadow-2xl backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-brand-sage animate-pulse" />
                <span className="tracking-wider uppercase font-extrabold text-[11px]">GRUPO SARA</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-200 font-semibold">Ingeniería & Tecnología Integral</span>
              </div>

              <div className="text-xs sm:text-sm font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-brand-sage via-amber-300 to-white uppercase pt-1 drop-shadow-md leading-relaxed">
                GRUPO SARA — Ingeniería y Arquitectura a la Vanguardia · Tecnología Integral
              </div>
            </div>

            {/* Transición de Textos cada 4 segundos */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`service-text-${currentSlide.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-4"
              >
                {/* Tag de Categoría e Indicador de Progreso */}
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg text-xs font-mono font-black border ${currentSlide.badgeColor} shadow-md`}>
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

                {/* Sub-titular de alto impacto */}
                <h2 className="text-sm sm:text-base font-extrabold text-amber-400 tracking-wider uppercase">
                  {currentSlide.headline}
                </h2>

                {/* Descripción Exacta del Ecosistema */}
                <p className="text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed font-normal border-l-4 border-brand-sage pl-6 drop-shadow-lg bg-slate-950/40 p-2 rounded-r-xl backdrop-blur-xs">
                  {currentSlide.description}
                </p>

                {/* Enlace sutil para acceder al módulo */}
                <div className="pt-2">
                  <Link
                    href={currentSlide.href}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-amber-400 transition-colors group/link"
                  >
                    <span>Conocer más sobre {currentSlide.title}</span>
                    <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform text-brand-sage" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>

          {/* Columna Derecha: Logotipo Oficial Flotante y Libre (SIN CUADRO, estilo Larsen & Toubro) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={`logo-free-${currentSlide.id}`}
                initial={{ opacity: 0, scale: 0.88, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -15 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative w-full flex flex-col items-center justify-center py-4"
              >
                {/* Resplandor ambiental orgánico detrás del logotipo (sin marco cuadrado) */}
                <div className={`absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr ${currentSlide.glowColor} blur-3xl opacity-75 pointer-events-none`} />

                {/* Logotipo Flotante Puro: NO EN CUADRO, tamaño imponente y alta nitidez */}
                <div className="relative z-10 w-full flex items-center justify-center p-2">
                  <img
                    src={currentSlide.logo}
                    alt={currentSlide.title}
                    className="max-h-[300px] sm:max-h-[380px] md:max-h-[440px] lg:max-h-[480px] max-w-[95%] w-auto h-auto object-contain filter drop-shadow-[0_25px_45px_rgba(0,0,0,0.95)] hover:scale-105 transition-transform duration-700 select-none"
                  />
                </div>
                
                {/* Indicador de marca inferior libre */}
                <div className="mt-4 px-4 py-1.5 rounded-full bg-slate-950/70 border border-white/10 backdrop-blur-md shadow-xl">
                  <span className="text-[11px] sm:text-xs font-mono tracking-[0.25em] text-slate-200 uppercase font-bold">
                    {currentSlide.label}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Barra de progreso inferior de ciclo continuo (4 segundos) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20 overflow-hidden">
        <motion.div
          key={`bar-${currentSlide.id}`}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 4, ease: "linear" }}
          className="h-full bg-gradient-to-r from-brand-sage to-amber-400 shadow-[0_0_12px_rgba(60,122,82,0.9)]"
        />
      </div>
    </section>
  )
}
