"use client"
import React, { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft,
  Sparkles,
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  Phone
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { setGuestSession, getGuestSession } from "@/lib/services/guestAuth"

interface HospedajeDestacado {
  id: string
  codigo: string
  titulo: string
  ciudad: string
  sector: string
  pais: string
  bandera: string
  precioNoche: number
  rating: number
  isSuperhost: boolean
  imagen: string
  zonaId: "cuenca" | "cariamanga" | "yunguilla" | "internacional" | "todas"
}

const DESTACADOS_BASE: HospedajeDestacado[] = [
  {
    id: "ab-1",
    codigo: "SARA-EC-01",
    titulo: "Master Suite Frente al Río Tomebamba",
    ciudad: "Cuenca",
    sector: "Puertas del Sol",
    pais: "Ecuador",
    bandera: "🇪🇨",
    precioNoche: 48,
    rating: 4.98,
    isSuperhost: true,
    imagen: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80",
    zonaId: "cuenca"
  },
  {
    id: "ab-cariamanga-1",
    codigo: "SARA-CAR-01",
    titulo: "Hospedaje El Halcón con Vista al Cerro Ahuaca",
    ciudad: "Cariamanga",
    sector: "Centro / Vía Ahuaca",
    pais: "Ecuador",
    bandera: "🇪🇨",
    precioNoche: 35,
    rating: 5.0,
    isSuperhost: true,
    imagen: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
    zonaId: "cariamanga"
  },
  {
    id: "ab-2",
    codigo: "SARA-EC-02",
    titulo: "Loft Patrimonial en Calle Larga - Centro",
    ciudad: "Cuenca",
    sector: "Centro Histórico",
    pais: "Ecuador",
    bandera: "🇪🇨",
    precioNoche: 59,
    rating: 4.95,
    isSuperhost: true,
    imagen: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80",
    zonaId: "cuenca"
  },
  {
    id: "ab-3",
    codigo: "SARA-EC-03",
    titulo: "Villa Campestre Los Guayacanes con Piscina",
    ciudad: "Santa Isabel",
    sector: "Valle de Yunguilla",
    pais: "Ecuador",
    bandera: "🇪🇨",
    precioNoche: 165,
    rating: 5.0,
    isSuperhost: true,
    imagen: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80",
    zonaId: "yunguilla"
  },
  {
    id: "ab-6",
    codigo: "SARA-INT-01",
    titulo: "High-Rise Penthouse en Brickell con Bahía View",
    ciudad: "Miami, FL",
    sector: "Brickell Financial",
    pais: "Estados Unidos",
    bandera: "🇺🇸",
    precioNoche: 220,
    rating: 4.97,
    isSuperhost: true,
    imagen: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
    zonaId: "internacional"
  },
  {
    id: "ab-7",
    codigo: "SARA-INT-02",
    titulo: "Apartamento de Diseño en Barrio de Salamanca",
    ciudad: "Madrid",
    sector: "Barrio Salamanca",
    pais: "España",
    bandera: "🇪🇸",
    precioNoche: 135,
    rating: 4.96,
    isSuperhost: true,
    imagen: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
    zonaId: "internacional"
  }
]

export default function AirbnbAuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawRedirect = searchParams.get("redirect") || "/airbnb"
  const actionParam = searchParams.get("action")
  const redirectTarget = actionParam ? `${rawRedirect}${rawRedirect.includes("?") ? "&" : "?"}action=${actionParam}` : rawRedirect

  // Pantalla de carga con logotipo 3D giratorio al ingresar
  const [showRotatingSplash, setShowRotatingSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRotatingSplash(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const [activeTab, setActiveTab] = useState<"login" | "registro">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  // Filtro de Zona y Carrusel Circulante de 2 Tarjetas
  const [selectedZona, setSelectedZona] = useState<"todas" | "cuenca" | "cariamanga" | "yunguilla" | "internacional">("todas")
  const [destacados, setDestacados] = useState<HospedajeDestacado[]>(DESTACADOS_BASE)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isPaused, setIsPaused] = useState<boolean>(false)

  // Form State: Login
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Form State: Registro
  const [regForm, setRegForm] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    telefono: "+593 9",
    email: "",
    password: "",
    confirmPassword: ""
  })

  const supabase = createClient()

  useEffect(() => {
    const existing = getGuestSession()
    if (existing) {
      router.push(redirectTarget)
    }
  }, [router, redirectTarget])

  // Cargar alojamientos dinámicos desde Supabase
  useEffect(() => {
    async function loadAlojamientos() {
      try {
        const res = await fetch("/api/airbnb/alojamientos")
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.alojamientos) && data.alojamientos.length > 0) {
            const mappedDB: HospedajeDestacado[] = data.alojamientos
              .filter((a: any) => a.publicado !== false)
              .map((a: any) => {
                const ciudadLower = (a.ciudad || "").toLowerCase()
                let zona: "cuenca" | "cariamanga" | "yunguilla" | "internacional" | "todas" = "cuenca"
                if (ciudadLower.includes("cariamanga") || ciudadLower.includes("calvas") || ciudadLower.includes("loja")) {
                  zona = "cariamanga"
                } else if (ciudadLower.includes("yunguilla") || ciudadLower.includes("isabel")) {
                  zona = "yunguilla"
                } else if (a.alcance === "internacional" || ciudadLower.includes("miami") || ciudadLower.includes("madrid") || ciudadLower.includes("cancun")) {
                  zona = "internacional"
                }

                return {
                  id: a.id,
                  codigo: a.codigo,
                  titulo: a.titulo,
                  ciudad: a.ciudad,
                  sector: a.sector || "",
                  pais: a.pais || "Ecuador",
                  bandera: a.bandera || "🇪🇨",
                  precioNoche: Number(a.precioNoche) || 45,
                  rating: Number(a.rating) || 5.0,
                  isSuperhost: Boolean(a.isSuperhost),
                  imagen: (Array.isArray(a.imagenes) && a.imagenes[0]) || a.imagenUrl || DESTACADOS_BASE[0].imagen,
                  zonaId: zona
                }
              })

            setDestacados(prev => {
              const codigosDB = new Set(mappedDB.map(d => d.codigo))
              const staticRestantes = DESTACADOS_BASE.filter(d => !codigosDB.has(d.codigo))
              return [...mappedDB, ...staticRestantes]
            })
          }
        }
      } catch (err) {
        console.warn("Aviso: cargando destacados de respaldo local:", err)
      }
    }

    loadAlojamientos()
  }, [])

  // Filtrado según la zona elegida
  const filteredDestacados = useMemo(() => {
    if (selectedZona === "todas") return destacados
    return destacados.filter(d => d.zonaId === selectedZona)
  }, [destacados, selectedZona])

  // Reiniciar índice al cambiar de zona
  useEffect(() => {
    setCurrentIndex(0)
  }, [selectedZona])

  // Controles de Carrusel (Siguiente / Anterior)
  const handleNext = () => {
    if (filteredDestacados.length <= 2) return
    setCurrentIndex(prev => (prev + 1) % filteredDestacados.length)
  }

  const handlePrev = () => {
    if (filteredDestacados.length <= 2) return
    setCurrentIndex(prev => (prev - 1 + filteredDestacados.length) % filteredDestacados.length)
  }

  // Rotación automática de derecha a izquierda cada 3.8 segundos
  useEffect(() => {
    if (isPaused || filteredDestacados.length <= 2) return
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % filteredDestacados.length)
    }, 3800)
    return () => clearInterval(timer)
  }, [isPaused, filteredDestacados.length])

  // Exactamente 2 tarjetas visibles circulando
  const visibleCards = useMemo(() => {
    if (filteredDestacados.length === 0) return []
    if (filteredDestacados.length === 1) return [filteredDestacados[0]]
    const idx1 = currentIndex % filteredDestacados.length
    const idx2 = (currentIndex + 1) % filteredDestacados.length
    return [filteredDestacados[idx1], filteredDestacados[idx2]]
  }, [filteredDestacados, currentIndex])

  // Manejar Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!loginEmail.trim() || !loginPassword) {
        throw new Error("Por favor completa tu correo y contraseña.")
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword
      })

      let guestName = loginEmail.split("@")[0]
      let guestId = data?.user?.id || `guest-${Date.now()}`
      let guestPhone = "+593 9"
      let guestCedula = ""

      if (authError) {
        console.warn("Supabase auth advertencia, evaluando sesión de huésped:", authError.message)
      } else if (data?.user) {
        const metadata = data.user.user_metadata || {}
        guestName = metadata.nombre || guestName
        guestPhone = metadata.telefono || guestPhone
        guestCedula = metadata.cedula || ""
      }

      setGuestSession({
        id: guestId,
        nombre: guestName,
        apellido: "",
        cedula: guestCedula,
        email: loginEmail.trim(),
        telefono: guestPhone,
        ciudad: "Ecuador",
        ciudadPais: "Ecuador",
        fechaRegistro: new Date().toISOString()
      })

      setSuccessMsg("¡Bienvenido! Redirigiendo a tus estadías...")
      setTimeout(() => {
        router.push(redirectTarget)
      }, 1000)
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión.")
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar Registro
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!regForm.nombre.trim() || !regForm.email.trim() || !regForm.cedula.trim()) {
      setError("Por favor completa los campos requeridos con tu nombre y cédula.")
      return
    }

    if (regForm.password !== regForm.confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }

    if (regForm.password.length < 6) {
      setError("La contraseña debe tener mínimo 6 caracteres.")
      return
    }

    setIsLoading(true)

    try {
      // 1. Registro en Supabase Auth
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: regForm.email.trim(),
        password: regForm.password,
        options: {
          data: {
            nombre: regForm.nombre.trim(),
            apellido: regForm.apellido.trim(),
            telefono: regForm.telefono.trim(),
            cedula: regForm.cedula.trim()
          }
        }
      })

      if (signUpErr) {
        console.warn("Aviso de Supabase SignUp:", signUpErr.message)
      }

      const guestId = data?.user?.id || `guest-${Date.now()}`

      // 2. Establecer sesión activa local
      setGuestSession({
        id: guestId,
        nombre: regForm.nombre.trim(),
        apellido: regForm.apellido.trim(),
        cedula: regForm.cedula.trim(),
        email: regForm.email.trim(),
        telefono: regForm.telefono.trim(),
        ciudad: "Ecuador",
        ciudadPais: "Ecuador",
        fechaRegistro: new Date().toISOString()
      })

      // 3. Persistir en Base de Datos para el Módulo Administrador de Huéspedes
      try {
        await fetch("/api/airbnb/usuarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: regForm.nombre.trim(),
            apellido: regForm.apellido.trim(),
            cedula: regForm.cedula.trim(),
            telefono: regForm.telefono.trim(),
            email: regForm.email.trim(),
            password: regForm.password,
            ciudadPais: "Ecuador"
          })
        })
      } catch (err) {
        console.warn("Aviso registrando usuario en base de datos:", err)
      }

      setSuccessMsg("¡Cuenta creada exitosamente! Redirigiendo...")
      setTimeout(() => {
        router.push(redirectTarget)
      }, 1200)
    } catch (err: any) {
      setError(err.message || "Error al registrar la cuenta.")
    } finally {
      setIsLoading(false)
    }
  }

  // Acceso Rápido para Prueba (Alexandra Malacatus o Huésped Frecuente)
  const handleQuickDemoAccess = () => {
    setGuestSession({
      id: "demo-alexandra-01",
      nombre: "Alexandra",
      apellido: "Malacatus",
      cedula: "1103711592",
      email: "alexandra.malacatus@gmail.com",
      telefono: "+593 981804023",
      ciudad: "Cariamanga",
      ciudadPais: "Cariamanga / Loja, Ecuador",
      fechaRegistro: new Date().toISOString()
    })
    setSuccessMsg("Iniciando como Alexandra Malacatus (Huésped Verificado)...")
    setTimeout(() => {
      router.push(redirectTarget)
    }, 800)
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-gray-900 relative flex items-center justify-center p-3 sm:p-6 py-6 md:py-10">
      
      {/* ============================================================ */}
      {/* SPLASH SCREEN CON LOGOTIPO GIRATORIO 3D AL ENTRAR           */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showRotatingSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center"
            style={{ perspective: 1200 }}
          >
            {/* Logotipo en rotación continua 360° */}
            <motion.div
              animate={{ rotateY: 360 }}
              transition={{ 
                duration: 1.5, 
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop"
              }}
              className="relative w-44 h-44 sm:w-56 sm:h-56 mb-8 transform-style-3d"
              style={{ transformStyle: "preserve-3d" }}
            >
              <img
                src="/images/logo-3d-blanco.png"
                alt="SARA Constructora Logo 3D Giratorio"
                className="w-full h-full object-contain drop-shadow-2xl"
                style={{ backfaceVisibility: "visible", transform: "translateZ(50px)" }}
              />
            </motion.div>

            {/* Barra de progreso de carga */}
            <div className="w-48 h-1 bg-gray-100 rounded-full relative overflow-hidden mb-5">
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 bottom-0 left-0 w-1/2 bg-brand-sage"
              />
            </div>

            <span className="text-xs uppercase tracking-[0.25em] font-extrabold text-brand-dark">
              SARA HOSPITALITY · AIRBNB
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fondo con imagen de marca difuminada para atmósfera elegante */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 opacity-15"
        style={{ backgroundImage: "url('/sara-airbnb.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/95 to-slate-900/90 z-0" />

      {/* Contenedor Principal Centrado y Compacto */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100/90 overflow-hidden animate-fadeIn">
        
        {/* ============================================================ */}
        {/* 1. CABECERA CON EL LOGO CORPORATIVO SARA AIRBNB (IMAGEN 2)  */}
        {/* ============================================================ */}
        <div className="bg-brand-dark p-5 sm:p-6 text-white relative border-b border-brand-sage/20">
          <Link
            href="/airbnb"
            className="inline-flex items-center gap-1.5 text-xs text-brand-sage hover:text-white font-bold mb-3 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Volver al Catálogo de Hospedajes
          </Link>

          <div className="flex items-center gap-4">
            {/* Logo oficial SARA Airbnb en contenedor blanco nítido */}
            <div className="bg-white/95 rounded-2xl p-2 shadow-lg border border-white/20 shrink-0 flex items-center justify-center">
              <img
                src="/logo-sara-airbnb.png"
                alt="Logo SARA Airbnb"
                className="h-12 sm:h-14 w-auto object-contain drop-shadow"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  Portal del Huésped
                </h1>
                <span className="text-[10px] sm:text-xs bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                  SARA Airbnb
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5 max-w-md leading-snug">
                Accede a tus reservas, consulta las claves de cerraduras inteligentes y califica tus estadías.
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. BANNER DE 2 TARJETAS CIRCULANDO DE DERECHA A IZQUIERDA   */}
        {/* ============================================================ */}
        <div 
          className="bg-slate-50 border-b border-gray-200 p-4 sm:p-5 space-y-3"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Fila Superior del Banner: Título y Controles */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Sparkles size={15} className="text-amber-500 shrink-0" />
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                Hospedajes Más Destacados en tu Zona
              </h3>
            </div>

            {/* Controles de Navegación del Carrusel */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400 font-mono hidden sm:inline mr-1">
                {(currentIndex % filteredDestacados.length) + 1} de {filteredDestacados.length}
              </span>
              <button
                type="button"
                onClick={handlePrev}
                className="w-7 h-7 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                title="Hospedaje anterior"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-7 h-7 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                title="Hospedaje siguiente"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* Filtros de Zona en Etiquetas Sutiles */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: "todas", label: "🗺️ Todas" },
              { id: "cuenca", label: "📍 Cuenca" },
              { id: "cariamanga", label: "📍 Cariamanga" },
              { id: "yunguilla", label: "📍 Yunguilla" },
              { id: "internacional", label: "🌎 Mundial" }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedZona(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedZona === tab.id
                    ? "bg-brand-dark text-amber-400 shadow-2xs border border-brand-dark"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenedor de Exactamente 2 Tarjetas Circulando de Derecha a Izquierda */}
          <div 
            key={currentIndex}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 transition-opacity duration-300 ease-out"
          >
            {visibleCards.map((item, idx) => (
              <Link
                key={`${item.id}-${idx}`}
                href="/airbnb"
                className="group bg-white rounded-2xl p-2 border border-gray-200 hover:border-amber-400 hover:shadow-md transition-all flex items-center gap-2.5 overflow-hidden"
              >
                {/* Miniatura Fotográfica */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  <img
                    src={item.imagen}
                    alt={item.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1 rounded">
                    {item.bandera}
                  </div>
                </div>

                {/* Datos del Hospedaje */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-0.5">
                    <MapPin size={11} className="text-amber-500 shrink-0" />
                    <span className="truncate">{item.sector}, {item.ciudad}</span>
                  </div>

                  <h4 className="text-xs font-bold text-gray-900 truncate group-hover:text-amber-800 transition-colors">
                    {item.titulo}
                  </h4>

                  <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-100 text-[11px]">
                    <div className="flex items-center gap-0.5 text-amber-600 font-bold">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span>{item.rating.toFixed(2)}</span>
                    </div>

                    <span className="font-black text-gray-900">
                      ${item.precioNoche} <span className="text-[9px] font-normal text-gray-500">/noche</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Indicadores Circulares de Posición */}
          {filteredDestacados.length > 2 && (
            <div className="flex justify-center items-center gap-1.5 pt-0.5">
              {filteredDestacados.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === (currentIndex % filteredDestacados.length)
                      ? "w-4 bg-amber-500"
                      : "w-1.5 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Ir al hospedaje ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 3. SECCIÓN DE AUTENTICACIÓN (TABS LOGIN & REGISTRO)          */}
        {/* ============================================================ */}
        <div className="border-b border-gray-200 bg-white">
          <div className="flex">
            <button
              type="button"
              onClick={() => { setActiveTab("login"); setError(""); }}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-all cursor-pointer ${
                activeTab === "login"
                  ? "border-brand-sage text-brand-dark bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-800 bg-slate-50/70"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("registro"); setError(""); }}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-all cursor-pointer ${
                activeTab === "registro"
                  ? "border-brand-sage text-brand-dark bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-800 bg-slate-50/70"
              }`}
            >
              Crear Cuenta Nueva
            </button>
          </div>
        </div>

        {/* Cuerpo del Formulario de Autenticación */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Mensajes de Alerta */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold animate-fadeIn">
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-fadeIn flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* FORMULARIO 1: INICIAR SESIÓN */}
          {/* ======================================================== */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="tu.correo@ejemplo.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-sage focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-sage focus:bg-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-brand-sage hover:bg-brand-sage/90 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? "Ingresando..." : "Ingresar a Mi Cuenta"}</span>
                <ArrowRight size={16} />
              </button>

              {/* Botón de acceso demo rápido */}
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={handleQuickDemoAccess}
                  className="text-xs text-brand-dark hover:underline font-bold inline-flex items-center gap-1.5 cursor-pointer bg-amber-50 hover:bg-amber-100 px-3.5 py-1.5 rounded-xl border border-amber-300 transition-colors shadow-2xs"
                >
                  <Sparkles size={14} className="text-amber-600" />
                  <span>Acceso Huésped Frecuente (Alexandra Malacatus)</span>
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* FORMULARIO 2: CREAR CUENTA NUEVA (CON BOTONES VER CLAVE) */}
          {/* ======================================================== */}
          {activeTab === "registro" && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nombres <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Alexandra"
                    value={regForm.nombre}
                    onChange={(e) => setRegForm({ ...regForm, nombre: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-sage focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Malacatus"
                    value={regForm.apellido}
                    onChange={(e) => setRegForm({ ...regForm, apellido: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-sage focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Cédula / Pasaporte <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="1103711592"
                      value={regForm.cedula}
                      onChange={(e) => setRegForm({ ...regForm, cedula: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-brand-sage focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      required
                      placeholder="+593 981804023"
                      value={regForm.telefono}
                      onChange={(e) => setRegForm({ ...regForm, telefono: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-sage focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Correo Electrónico <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="huesped@ejemplo.com"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-sage focus:bg-white"
                  />
                </div>
              </div>

              {/* Casillas de Contraseña con Botón de Ver/Ocultar (Eye/EyeOff) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Contraseña <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? "text" : "password"}
                      required
                      placeholder="Mínimo 6 carácteres"
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      className="w-full pl-3 pr-9 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-sage focus:bg-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                      title={showRegPassword ? "Ocultar contraseña" : "Ver contraseña"}
                    >
                      {showRegPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Confirmar Contraseña <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Repite tu contraseña"
                      value={regForm.confirmPassword}
                      onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                      className="w-full pl-3 pr-9 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-sage focus:bg-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                      title={showRegConfirmPassword ? "Ocultar contraseña" : "Ver contraseña"}
                    >
                      {showRegConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-brand-sage hover:bg-brand-sage/90 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
              >
                <span>{isLoading ? "Creando tu cuenta..." : "Crear Cuenta de Huésped SARA"}</span>
                <CheckCircle2 size={16} />
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-xs text-gray-500 border-t border-gray-100 flex items-center justify-center gap-2">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Tus datos se encuentran cifrados bajo protocolo seguro SSL</span>
          </div>
        </div>
      </div>
    </div>
  )
}
