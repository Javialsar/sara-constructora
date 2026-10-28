"use client"
import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ArrowRight, Building2, Home, Bed, Calculator, Truck, Users, ShoppingBag, Landmark, ShieldCheck } from "lucide-react"
import { getLogosEmpresa, DEFAULT_LOGOS_EMPRESA, LogosEmpresa } from "@/lib/services/logosService"

export type ModuloKey = 
  | "constructora" 
  | "inmobiliaria" 
  | "stays" 
  | "apu" 
  | "fletes" 
  | "talento" 
  | "compras" 
  | "fintech" 
  | "portal"

interface ModuloConfig {
  nombre: string
  subtitulo: string
  badge: string
  colorAccent: string
  gradientAccent: string
  icon: React.ReactNode
  fallbackLogo: string
}

const MODULOS_CONFIG: Record<ModuloKey, ModuloConfig> = {
  constructora: {
    nombre: "SARA CONSTRUCTORA",
    subtitulo: "Ingeniería Civil, Arquitectura & Obras Llave en Mano",
    badge: "Módulo Oficial de Construcción",
    colorAccent: "#C5A059",
    gradientAccent: "from-[#C5A059] to-amber-200",
    icon: <Building2 size={13} className="text-brand-sage" />,
    fallbackLogo: DEFAULT_LOGOS_EMPRESA.constructora
  },
  inmobiliaria: {
    nombre: "SARA INMOBILIARIA",
    subtitulo: "Bienes Raíces, Proyectos Urbanísticos & Inversiones",
    badge: "División Inmobiliaria Oficial",
    colorAccent: "#10b981",
    gradientAccent: "from-emerald-400 to-teal-200",
    icon: <Home size={13} className="text-emerald-400" />,
    fallbackLogo: DEFAULT_LOGOS_EMPRESA.inmobiliaria
  },
  stays: {
    nombre: "SARA STAYS",
    subtitulo: "Alojamientos Boutique, Suites Ejecutivas & Turismo",
    badge: "División de Hospitalidad & Rentas",
    colorAccent: "#f59e0b",
    gradientAccent: "from-amber-400 to-yellow-200",
    icon: <Bed size={13} className="text-amber-400" />,
    fallbackLogo: DEFAULT_LOGOS_EMPRESA.stays
  },
  apu: {
    nombre: "SARA APU",
    subtitulo: "Análisis de Precios Unitarios, Presupuestos & AIU",
    badge: "Plataforma de Ingeniería de Costos",
    colorAccent: "#3b82f6",
    gradientAccent: "from-blue-400 to-indigo-300",
    icon: <Calculator size={13} className="text-blue-400" />,
    fallbackLogo: DEFAULT_LOGOS_EMPRESA.apu
  },
  fletes: {
    nombre: "SARA FLETES",
    subtitulo: "Transporte Pesado, Maquinaria & Logística de Obra",
    badge: "Red Nacional de Transporte",
    colorAccent: "#f97316",
    gradientAccent: "from-orange-400 to-amber-300",
    icon: <Truck size={13} className="text-orange-400" />,
    fallbackLogo: DEFAULT_LOGOS_EMPRESA.fletes
  },
  talento: {
    nombre: "SARA TALENTO",
    subtitulo: "Gestión de Recursos Humanos, Bolsa de Empleo & Contratación",
    badge: "Talento Humano Especializado",
    colorAccent: "#8b5cf6",
    gradientAccent: "from-purple-400 to-indigo-300",
    icon: <Users size={13} className="text-purple-400" />,
    fallbackLogo: DEFAULT_LOGOS_EMPRESA.talento
  },
  compras: {
    nombre: "SARA COMPRAS",
    subtitulo: "Licitaciones, Abastecimiento & Directorio de Proveedores",
    badge: "Compras y Suministro de Materiales",
    colorAccent: "#06b6d4",
    gradientAccent: "from-cyan-400 to-sky-200",
    icon: <ShoppingBag size={13} className="text-cyan-400" />,
    fallbackLogo: DEFAULT_LOGOS_EMPRESA.compras
  },
  fintech: {
    nombre: "SARA FINANCIERO",
    subtitulo: "Gestión de Tesorería, Facturación & Pasarelas de Pago",
    badge: "Módulo Financiero Corporativo",
    colorAccent: "#6366f1",
    gradientAccent: "from-indigo-400 to-blue-300",
    icon: <Landmark size={13} className="text-indigo-400" />,
    fallbackLogo: DEFAULT_LOGOS_EMPRESA.fintech
  },
  portal: {
    nombre: "PORTAL CLIENTES",
    subtitulo: "Seguimiento en Tiempo Real, Planos y Bitácora de Obra",
    badge: "Entorno Privado Verificado",
    colorAccent: "#C5A059",
    gradientAccent: "from-[#C5A059] to-amber-200",
    icon: <ShieldCheck size={13} className="text-brand-sage" />,
    fallbackLogo: DEFAULT_LOGOS_EMPRESA.constructora
  }
}

interface ModuloIntroSplashProps {
  modulo: ModuloKey
  nombrePersonalizado?: string
  subtituloPersonalizado?: string
  forceShow?: boolean
  durationMs?: number
  onComplete?: () => void
}

export default function ModuloIntroSplash({
  modulo,
  nombrePersonalizado,
  subtituloPersonalizado,
  forceShow = false,
  durationMs = 1600,
  onComplete
}: ModuloIntroSplashProps) {
  const config = MODULOS_CONFIG[modulo] || MODULOS_CONFIG.constructora
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)
  const [logoUrl, setLogoUrl] = useState<string>(config.fallbackLogo)

  // Solo activar splash si se solicita explícitamente mediante forceShow en cliente
  useEffect(() => {
    if (forceShow && typeof window !== 'undefined') {
      setIsVisible(true)
      setProgress(15)
    } else if (onComplete) {
      onComplete()
    }
  }, [forceShow, onComplete]);

  // 1. Obtener el logotipo oficial de la base de datos (configuración) con timeout
  useEffect(() => {
    let isMounted = true
    const fetchDbLogo = async () => {
      try {
        const logoPromise = getLogosEmpresa()
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200))
        const logos = (await Promise.race([logoPromise, timeoutPromise])) as LogosEmpresa | null
        if (!isMounted || !logos) return
        
        let targetUrl = ""
        switch (modulo) {
          case "constructora":
          case "portal":
            targetUrl = logos.constructora
            break
          case "inmobiliaria":
            targetUrl = logos.inmobiliaria
            break
          case "stays":
            targetUrl = logos.stays
            break
          case "apu":
            targetUrl = logos.apu
            break
          case "fletes":
            targetUrl = logos.fletes
            break
          case "talento":
            targetUrl = logos.talento
            break
          case "compras":
            targetUrl = logos.compras
            break
          case "fintech":
            targetUrl = logos.fintech
            break
          default:
            targetUrl = logos.constructora
        }

        if (targetUrl && targetUrl.trim() !== "") {
          setLogoUrl(targetUrl)
        }
      } catch (err) {
        console.warn("Error cargando logo de base de datos para intro:", err)
      }
    }

    if (isVisible) {
      fetchDbLogo()
    }
    return () => { isMounted = false }
  }, [modulo, isVisible])

  // 2. Control del ciclo de animación de progreso y finalización
  useEffect(() => {
    if (!isVisible) return

    const stepIntervalMs = 35
    const stepIncrement = (85 / (durationMs / stepIntervalMs))

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return Math.min(100, prev + stepIncrement)
      })
    }, stepIntervalMs)

    const timer = setTimeout(() => {
      handleFinish()
    }, durationMs + 100)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [durationMs, isVisible])

  const handleFinish = () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`sara_splash_seen_${modulo}`, 'true')
      }
    } catch {
      // Ignorar error de storage
    }
    setIsVisible(false)
    if (onComplete) onComplete()
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={`intro-splash-${modulo}`}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#070b0e] text-white overflow-hidden select-none"
        >
          {/* Fondo arquitectónico con resplandor cromático según el módulo */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              background: `radial-gradient(circle 500px at 50% 45%, ${config.colorAccent}, transparent 70%)`
            }}
          />
          
          {/* Rejilla arquitectónica sutil */}
          <div 
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
              backgroundSize: "44px 44px"
            }}
          />

          {/* Contenedor Central 3D del Logo Giratorio */}
          <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-lg">
            
            {/* Escena 3D con perspectiva para el giro del logo */}
            <div style={{ perspective: 1200 }} className="mb-6 relative flex items-center justify-center">
              
              {/* Halo circular animado detrás del logo */}
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.08, 1]
                }}
                transition={{
                  rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute w-36 h-36 md:w-44 md:h-44 rounded-full border border-dashed pointer-events-none opacity-40"
                style={{ borderColor: config.colorAccent }}
              />

              {/* Logotipo oficial de la Base de Datos con rotación continua en 3D (eje Y) */}
              <motion.div
                initial={{ rotateY: 0, scale: 0.3, opacity: 0 }}
                animate={{
                  rotateY: [0, 360, 720],
                  scale: [0.7, 1.06, 1],
                  opacity: 1
                }}
                transition={{
                  rotateY: { duration: durationMs / 1000, ease: [0.25, 0.1, 0.25, 1] },
                  scale: { duration: 1.1, ease: "easeOut" },
                  opacity: { duration: 0.4 }
                }}
                className="relative w-36 h-36 md:w-44 md:h-44 flex items-center justify-center drop-shadow-[0_15px_35px_rgba(0,0,0,0.6)]"
                style={{ transformStyle: "preserve-3d" }}
              >
                <img
                  src={logoUrl}
                  alt={config.nombre}
                  className="object-contain w-auto h-full max-h-36 md:max-h-40 drop-shadow-2xl"
                  onError={(e) => {
                    // Fallback al logo por defecto si la URL de la base de datos tuviera algún error
                    const target = e.target as HTMLImageElement
                    if (target.src !== config.fallbackLogo) {
                      target.src = config.fallbackLogo
                    }
                  }}
                />
              </motion.div>
            </div>

            {/* Identidad del Módulo y Tipografía Oficial */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-2.5"
            >
              <div 
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-[0.25em] border backdrop-blur-md"
                style={{
                  backgroundColor: `${config.colorAccent}15`,
                  borderColor: `${config.colorAccent}35`,
                  color: config.colorAccent
                }}
              >
                {config.icon}
                <span>{config.badge}</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-wider text-white drop-shadow">
                {nombrePersonalizado || config.nombre}
              </h1>

              <p className="text-xs md:text-sm text-slate-400 font-medium tracking-wide max-w-sm mx-auto">
                {subtituloPersonalizado || config.subtitulo}
              </p>
            </motion.div>

            {/* Barra de progreso de carga estilizada */}
            <div className="w-56 mt-7 space-y-2">
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden p-[1px]">
                <motion.div
                  className={`h-full bg-gradient-to-r ${config.gradientAccent} rounded-full`}
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono font-medium">
                <span className="uppercase tracking-widest text-[9px]">Iniciando Entorno</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>

            {/* Botón para saltar intro inmediatamente */}
            <button
              onClick={handleFinish}
              type="button"
              className="mt-5 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors uppercase tracking-wider font-bold py-1.5 px-3 rounded hover:bg-white/5 cursor-pointer"
            >
              <span>Ingresar Directamente</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
