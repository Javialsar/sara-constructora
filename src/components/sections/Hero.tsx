"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getLogosEmpresa, DEFAULT_LOGOS_EMPRESA, LogosEmpresa } from "@/lib/services/logosService"
import { createClient } from "@/lib/supabase/client"

interface HeroProps {
  onOpenCheckout?: (item: { title: string; amount: number; badgeText: string; isSubscription?: boolean }) => void
  onOpenQuoteModal?: (moduleData: { id: string; title: string; logoUrl?: string }) => void
}

export default function Hero({ onOpenCheckout, onOpenQuoteModal }: HeroProps) {
  const [logos, setLogos] = useState<LogosEmpresa>(DEFAULT_LOGOS_EMPRESA)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // 1. Obtener logos via servicio
    getLogosEmpresa().then((fetched) => {
      if (fetched) setLogos(fetched)
    })

    // 2. Consulta directa en tiempo real a Supabase para sincronizar URLs actualizadas
    const fetchDirectDb = async () => {
      try {
        const supabase = createClient()
        const [{ data: configData }, { data: paramData }] = await Promise.all([
          supabase.from("configuracion_empresa").select("logo_url, nombre_empresa").limit(1).single(),
          supabase.from("parametros_globales").select("indirectos_default").eq("id", 1).single()
        ])

        const dbLogos = paramData?.indirectos_default?.logos_servicios || {}
        const corporateLogo = configData?.logo_url && !configData.logo_url.includes("supabase.co/storage")
          ? configData.logo_url 
          : (dbLogos.grupo_sara || "/logo-hero.png")

        setLogos(prev => ({
          ...prev,
          grupo_sara: corporateLogo,
          constructora: dbLogos.constructora && !dbLogos.constructora.includes("supabase.co/storage") ? dbLogos.constructora : prev.constructora,
          inmobiliaria: dbLogos.inmobiliaria && !dbLogos.inmobiliaria.includes("supabase.co/storage") ? dbLogos.inmobiliaria : prev.inmobiliaria,
          stays: dbLogos.stays && !dbLogos.stays.includes("supabase.co/storage") ? dbLogos.stays : prev.stays,
          apu: dbLogos.apu && !dbLogos.apu.includes("supabase.co/storage") ? dbLogos.apu : prev.apu,
          compras: dbLogos.compras && !dbLogos.compras.includes("supabase.co/storage") ? dbLogos.compras : prev.compras,
          fletes: dbLogos.fletes && !dbLogos.fletes.includes("supabase.co/storage") ? dbLogos.fletes : prev.fletes,
          talento: dbLogos.talento && !dbLogos.talento.includes("supabase.co/storage") ? dbLogos.talento : prev.talento,
          fintech: dbLogos.fintech && !dbLogos.fintech.includes("supabase.co/storage") ? dbLogos.fintech : prev.fintech,
        }))
      } catch (err) {
        console.warn("Hero DB fetch fallback:", err)
      }
    }
    fetchDirectDb()
  }, [])

  // Secuencia de slides: Primero GRUPO SARA y luego cada una de las 8 unidades
  const servicesSlides = [
    {
      id: "grupo-sara",
      indexNum: "01",
      tag: "Matriz Corporativa · Holding Oficial",
      title: "GRUPO SARA",
      description: "Ingeniería y arquitectura a la vanguardia con tecnología integral. Holding multisectorial que lidera el ecosistema de planificación de obras, software APU, catálogo inmobiliario, suites tipo Airbnb, fletes pesados satelitales, talento técnico colegiado y finanzas blindadas en todo el Ecuador.",
      logo: logos.grupo_sara || "/logo-hero.png",
      accentColor: "text-amber-400",
      glowColor: "from-amber-500/30 via-amber-500/10 to-transparent",
      badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      label: "GRUPO SARA · HOLDING",
      href: "#ecosistema"
    },
    {
      id: "constructora",
      indexNum: "02",
      tag: "Infraestructura & Obra Civil",
      title: "SARA-CONSTRUCTORA",
      description: "Planificación arquitectónica, diseño estructural y dirección técnica de obras civiles, residenciales y comerciales en Ecuador con los más altos estándares de calidad e ingeniería de precisión bajo norma NEC.",
      logo: logos.constructora || "/images/sara-constructora.png",
      accentColor: "text-brand-sage",
      glowColor: "from-emerald-500/30 via-brand-sage/10 to-transparent",
      badgeColor: "bg-emerald-500/10 text-brand-sage border-brand-sage/30",
      label: "SARA CONSTRUCTORA · OBRAS",
      href: "/constructora"
    },
    {
      id: "inmobiliaria",
      indexNum: "03",
      tag: "Propiedades & Terrenos",
      title: "SARA-INMOBILIARIA",
      description: "Catálogo selecto de bienes raíces, casas campestres, departamentos urbanos y lotes de alta plusvalía con seguridad jurídica, asesoría hipotecaria y tasación técnica especializada.",
      logo: logos.inmobiliaria || "/images/sara-inmobiliaria.png",
      accentColor: "text-rose-400",
      glowColor: "from-rose-500/30 via-rose-500/10 to-transparent",
      badgeColor: "bg-rose-500/10 text-rose-300 border-rose-500/30",
      label: "SARA INMOBILIARIA · BIENES RAÍCES",
      href: "/inmobiliaria"
    },
    {
      id: "alojamiento",
      indexNum: "04",
      tag: "Suites & Villas Tipo Airbnb",
      title: "SARA-ALOJAMIENTO",
      description: "Alojamientos temporales de alta gama en Cuenca, Quito, Galápagos y Baños con cerradura inteligente, atención 24/7 y acabados de lujo diseñados por el equipo arquitectónico de Grupo SARA.",
      logo: logos.stays || "/images/sara-stays.png",
      accentColor: "text-indigo-400",
      glowColor: "from-indigo-500/30 via-indigo-500/10 to-transparent",
      badgeColor: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
      label: "SARA ALOJAMIENTO · STAYS",
      href: "/stays"
    },
    {
      id: "apu",
      indexNum: "05",
      tag: "Presupuestos & Gemelo Digital",
      title: "SARA-APU",
      description: "Software de análisis de precios unitarios con lectura automática de rubros, bases de insumos actualizadas y reportes de obra en tiempo real para optimizar la rentabilidad de contratistas.",
      logo: logos.apu || "/images/sara-apu.png",
      accentColor: "text-emerald-400",
      glowColor: "from-emerald-500/30 via-emerald-500/10 to-transparent",
      badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      label: "SARA APU · SOFTWARE",
      href: "/apu"
    },
    {
      id: "marketplace",
      indexNum: "06",
      tag: "Suministros Directos de Fábrica",
      title: "SARA-MARKETPLACE",
      description: "Suministro directo de acero, cemento, agregados y materiales certificados sin intermediarios. Cotización inmediata por volumen y despacho garantizado a pie de obra.",
      logo: logos.compras || "/images/sara-grupo.png",
      accentColor: "text-amber-400",
      glowColor: "from-amber-500/30 via-amber-500/10 to-transparent",
      badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      label: "SARA MARKETPLACE · COMPRAS",
      href: "/modulos/compras"
    },
    {
      id: "fletes",
      indexNum: "07",
      tag: "Transporte Pesado Satelital",
      title: "SARA-FLETES",
      description: "Flota de volquetas, plataformas y camiones pesados con despacho satelital 24/7 y monitoreo GPS en tiempo real para abastecimiento continuo en proyectos de construcción.",
      logo: logos.fletes || "/images/sara-fletes.png",
      accentColor: "text-cyan-400",
      glowColor: "from-cyan-500/30 via-cyan-500/10 to-transparent",
      badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
      label: "SARA FLETES · LOGÍSTICA",
      href: "/modulos/fletes"
    },
    {
      id: "talento",
      indexNum: "08",
      tag: "Especialistas Colegiados",
      title: "SARA-TALENTO",
      description: "Red certificada de ingenieros civiles, arquitectos colegiados, topógrafos y maestros mayores calificados para consultoría, diseño o ejecución directa de obras.",
      logo: logos.talento || "/images/sara-talento.png",
      accentColor: "text-amber-300",
      glowColor: "from-amber-400/30 via-amber-400/10 to-transparent",
      badgeColor: "bg-amber-400/10 text-amber-300 border-amber-400/30",
      label: "SARA TALENTO · RED TÉCNICA",
      href: "/modulos/talento"
    },
    {
      id: "pagos",
      indexNum: "09",
      tag: "Pasarela & Finanzas de Obra",
      title: "SARA-PAGOS",
      description: "Retenciones, anticipos garantizados y pago contra avance de obra con pasarela estándar, QR empresarial DeUna y cuentas bancarias directas para proteger los fondos de clientes y constructores.",
      logo: logos.fintech || "/logo-hero.png",
      accentColor: "text-emerald-400",
      glowColor: "from-emerald-500/30 via-emerald-500/10 to-transparent",
      badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      label: "SARA PAGOS · FINANZAS BLINDADAS",
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
    <section className="relative min-h-[85vh] lg:min-h-[92vh] flex items-center pt-28 pb-16 overflow-hidden bg-slate-950">
      {/* Luces y texturas ambientales coherentes */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950 to-black pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 right-10 w-[30rem] h-[30rem] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative z-20 mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center min-h-[62vh]">
          
          {/* Columna Izquierda: Mensaje Institucional de Alto Posicionamiento y Datos del Servicio */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Header de Posicionamiento */}
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
            {/* Transición de Servicio cada 4 segundos */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`service-${currentSlide.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-6"
              >
                {/* Tag de Categoría e Indicador de Progreso */}
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold tabular-nums border ${currentSlide.badgeColor}`}>
                    {currentSlide.indexNum} / 09
                  </span>
                  <div className="w-8 h-px bg-brand-sage/60" />
                  <span className={`${currentSlide.accentColor} font-mono font-bold tracking-[0.2em] uppercase text-xs sm:text-sm drop-shadow-md`}>
                    {currentSlide.tag}
                  </span>
                </div>

                {/* Título Oficial del Servicio con font-display */}
                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.05] drop-shadow-2xl">
                  {currentSlide.title}
                </h1>

                {/* Descripción Exacta del Ecosistema */}
                <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed font-normal border-l-2 border-brand-sage/80 pl-6 drop-shadow-lg">
                  {currentSlide.description}
                </p>

                {/* Botón de Exploración Rápida con ergonomía móvil */}
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <a
                    href={currentSlide.href}
                    className="min-h-[48px] inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm ring-1 ring-amber-400/40 hover:shadow-md hover:shadow-amber-500/20 active:scale-[0.98] transition-all duration-200 ease-out cursor-pointer"
                  >
                    <span>Explorar {currentSlide.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  {(onOpenQuoteModal || onOpenCheckout) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenQuoteModal) {
                          onOpenQuoteModal({
                            id: currentSlide.id,
                            title: currentSlide.title,
                            logoUrl: currentSlide.logo
                          });
                        } else if (onOpenCheckout) {
                          onOpenCheckout({
                            title: `Consulta Técnica - ${currentSlide.title}`,
                            amount: 49.99,
                            badgeText: "Grupo SARA Oficial",
                            isSubscription: false
                          });
                        }
                      }}
                      className="min-h-[48px] px-5 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all duration-200 ease-out hover:border-brand-sage active:scale-[0.98] ring-1 ring-black/[0.05]"
                      title={`Ver planes y cotización de ${currentSlide.title}`}
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Cotizar Servicio</span>
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

          </div>

          {/* Columna Derecha: Logotipo Oficial Flotante Libre SIN CUADRO */}
          <div className="lg:col-span-6 flex items-center justify-center p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={`logo-${currentSlide.id}`}
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative flex items-center justify-center w-full max-w-lg"
              >
                {/* Resplandor ambiental suave difuso detrás del logotipo */}
                <div className={`absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr ${currentSlide.glowColor} blur-3xl opacity-70 pointer-events-none`} />

                {/* Logotipo oficial 3D transparente flotando libremente */}
                <img
                  src={currentSlide.logo}
                  alt={currentSlide.title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/logo-hero.png"
                  }}
                  className="relative z-10 max-h-[300px] sm:max-h-[380px] md:max-h-[440px] w-auto h-auto object-contain filter drop-shadow-[0_20px_45px_rgba(0,0,0,0.95)] hover:scale-105 transition-transform duration-500 ease-out"
                />
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* Indicador de progreso sutil y selector de servicios */}
        <div className="mt-10 pt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08]">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {servicesSlides.map((s, idx) => {
              const isSelected = idx === currentIndex
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold tabular-nums transition-all duration-200 ease-out cursor-pointer active:scale-[0.98] ${
                    isSelected 
                      ? "bg-amber-500 text-slate-950 shadow-sm font-black ring-1 ring-amber-400" 
                      : "text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06]"
                  }`}
                >
                  {s.indexNum} {s.title.replace('SARA-', '')}
                </button>
              )
            })}
          </div>

          <div className="text-xs font-mono tabular-nums text-slate-400 uppercase tracking-widest hidden sm:block">
            {currentIndex + 1} de {servicesSlides.length} Módulos Activos
          </div>
        </div>

      </div>
    </section>
  )
}
