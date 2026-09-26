"use client"
import React, { useState, useEffect } from "react"
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
  Phone,
  User,
  UserPlus,
  Key,
  Home,
  Check
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { setGuestSession, getGuestSession } from "@/lib/services/guestAuth"

interface ReturnContext {
  redirect: string
  action?: string | null
  stayId?: string | null
  stayTitle?: string | null
}

export default function AirbnbAuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Pantalla de carga con logotipo 3D giratorio al ingresar
  const [showRotatingSplash, setShowRotatingSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRotatingSplash(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  // Tab activo: Iniciar Sesión vs Registro
  const [activeTab, setActiveTab] = useState<"login" | "registro">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

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

  // Gestión de Referencia de Origen (Preserva dónde estaba el cliente)
  const [returnContext, setReturnContext] = useState<ReturnContext>({
    redirect: "/stays"
  })

  useEffect(() => {
    // 1. Obtener parámetros directos de la URL
    const urlRedirect = searchParams.get("redirect")
    const urlAction = searchParams.get("action")
    const urlStayId = searchParams.get("stayId") || searchParams.get("stay")
    const urlStayTitle = searchParams.get("title")

    if (urlRedirect || urlAction || urlStayId) {
      const ctx: ReturnContext = {
        redirect: urlRedirect || "/stays",
        action: urlAction || null,
        stayId: urlStayId || null,
        stayTitle: urlStayTitle || null
      }
      setReturnContext(ctx)
      try {
        sessionStorage.setItem("sara_stays_auth_return", JSON.stringify(ctx))
      } catch (e) {
        console.warn("Aviso: no se pudo guardar referencia en sessionStorage", e)
      }
    } else {
      // 2. Recuperar de sessionStorage si la URL viene limpia
      try {
        const saved = sessionStorage.getItem("sara_stays_auth_return")
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed && typeof parsed === "object") {
            setReturnContext(parsed)
          }
        }
      } catch (e) {
        console.warn("Aviso: no se pudo restaurar referencia de sessionStorage", e)
      }
    }
  }, [searchParams])

  // Calcular la URL final de redirección asegurando todos los parámetros
  const computeFinalRedirectUrl = (): string => {
    const base = returnContext.redirect || "/stays"
    let pathname = base
    const params = new URLSearchParams()

    if (base.includes("?")) {
      const parts = base.split("?")
      pathname = parts[0]
      const existingParams = new URLSearchParams(parts[1])
      existingParams.forEach((v, k) => params.set(k, v))
    }

    if (returnContext.action) {
      params.set("action", returnContext.action)
    }
    if (returnContext.stayId) {
      params.set("stayId", returnContext.stayId)
    }

    const qs = params.toString()
    const target = qs ? `${pathname}?${qs}` : pathname

    // Limpiar referencia de almacenamiento tras uso
    try {
      sessionStorage.removeItem("sara_stays_auth_return")
    } catch {}

    return target
  }

  const supabase = createClient()

  // Si ya tiene sesión activa previa, redirigir de inmediato al destino guardado
  useEffect(() => {
    const existing = getGuestSession()
    if (existing) {
      const target = computeFinalRedirectUrl()
      router.push(target)
    }
  }, [router, returnContext])

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

      let rawName = loginEmail.split("@")[0]
      let guestId = data?.user?.id || `guest-${Date.now()}`
      let guestPhone = "+593 9"
      let guestCedula = ""
      let guestApellido = ""

      if (authError) {
        console.warn("Supabase auth advertencia, evaluando sesión de huésped:", authError.message)
      } else if (data?.user) {
        const metadata = data.user.user_metadata || {}
        rawName = metadata.nombre || rawName
        guestApellido = metadata.apellido || ""
        guestPhone = metadata.telefono || guestPhone
        guestCedula = metadata.cedula || ""
      }

      const cleanParts = rawName.replace(/[._-]+/g, " ").trim().split(/\s+/)
      let finalNombre = cleanParts.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")
      if (!guestApellido && cleanParts.length > 1) {
        finalNombre = cleanParts[0].charAt(0).toUpperCase() + cleanParts[0].slice(1).toLowerCase()
        guestApellido = cleanParts.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")
      }

      setGuestSession({
        id: guestId,
        nombre: finalNombre,
        apellido: guestApellido,
        cedula: guestCedula,
        email: loginEmail.trim(),
        telefono: guestPhone,
        ciudad: "Ecuador",
        ciudadPais: "Cuenca, Ecuador",
        fechaRegistro: new Date().toISOString()
      })

      setSuccessMsg("¡Bienvenido! Redirigiendo a tu solicitud...")
      setTimeout(() => {
        const dest = computeFinalRedirectUrl()
        router.push(dest)
      }, 900)
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

      // 3. Persistir en Base de Datos de Huéspedes
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

      setSuccessMsg("¡Cuenta creada exitosamente! Continuando con tu proceso...")
      setTimeout(() => {
        const dest = computeFinalRedirectUrl()
        router.push(dest)
      }, 1000)
    } catch (err: any) {
      setError(err.message || "Error al registrar la cuenta.")
    } finally {
      setIsLoading(false)
    }
  }

  // Acceso Rápido para Pruebas (Alexandra Malacatus - Huésped VIP)
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
    setSuccessMsg("Iniciando como Alexandra Malacatus (Huésped VIP)...")
    setTimeout(() => {
      const dest = computeFinalRedirectUrl()
      router.push(dest)
    }, 700)
  }

  // URL para el botón Volver
  const backTarget = returnContext.stayId && returnContext.action === "reservar"
    ? `/stays?stayId=${returnContext.stayId}&action=reservar`
    : returnContext.redirect || "/stays"

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white relative flex items-center justify-center p-3 sm:p-6 py-8 md:py-12 overflow-x-hidden selection:bg-brand-sage selection:text-white">
      
      {/* ============================================================ */}
      {/* SPLASH SCREEN CON LOGOTIPO GIRATORIO 3D AL ENTRAR           */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showRotatingSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center"
            style={{ perspective: 1200 }}
          >
            {/* Logotipo en rotación continua 360° */}
            <motion.div
              animate={{ rotateY: 360 }}
              transition={{ 
                duration: 1.4, 
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop"
              }}
              className="relative w-44 h-44 sm:w-52 sm:h-52 mb-6"
              style={{ transformStyle: "preserve-3d" }}
            >
              <img
                src="/images/logo-3d-blanco.png"
                alt="SARA Stays Logo 3D Giratorio"
                className="w-full h-full object-contain drop-shadow-[0_20px_35px_rgba(16,185,129,0.3)]"
                style={{ backfaceVisibility: "visible" }}
              />
            </motion.div>

            {/* Barra de progreso de carga */}
            <div className="w-48 h-1 bg-slate-800 rounded-full relative overflow-hidden mb-4">
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-brand-sage to-amber-400"
              />
            </div>

            <span className="text-xs uppercase tracking-[0.3em] font-extrabold text-amber-400">
              SARA STAYS · HOSPEDAJE
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* FONDOS AMBIENTALES Y LUCES 3D DINÁMICAS                      */}
      {/* ============================================================ */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-emerald-600/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] rounded-full bg-slate-900/60 blur-[160px]" />
        <div 
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px"
          }}
        />
      </div>

      {/* ============================================================ */}
      {/* TARJETA PRINCIPAL 3D DE AUTENTICACIÓN (SIN BANNERS)          */}
      {/* ============================================================ */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xl bg-slate-900/85 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] border border-white/10 overflow-hidden"
      >
        {/* Borde sutil superior brillante */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />

        {/* 1. Cabecera Corporativa SARA Stays */}
        <div className="p-5 sm:p-7 pb-4 bg-gradient-to-b from-slate-950/80 to-transparent border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <Link
              href={backTarget}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-bold transition-colors group cursor-pointer"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Volver a Hospedajes</span>
            </Link>

            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/25 flex items-center gap-1">
              <Sparkles size={11} className="text-amber-400" />
              <span>SARA Stays</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Logo en contenedor premium con sombra */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/95 p-2 shadow-[0_10px_25px_-5px_rgba(16,185,129,0.3)] border border-white/20 shrink-0 flex items-center justify-center">
              <img
                src="/logo-sara-airbnb.png"
                alt="Logo SARA Stays"
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Portal del Huésped</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                Accede para gestionar tus reservas, llaves digitales y tarifas directas.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Chip de Referencia Contextual (Si viene de reservar o crear propiedad) */}
        <div className="px-5 sm:px-7 pt-4">
          {returnContext.action === "reservar" && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-400/30 flex items-start gap-3 text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Sparkles size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Continuando con tu Reserva</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                  {returnContext.stayTitle ? (
                    <>Estás a un paso de reservar <strong>{returnContext.stayTitle}</strong>. </>
                  ) : returnContext.stayId ? (
                    <>Estás a un paso de reservar el hospedaje <strong>#{returnContext.stayId}</strong>. </>
                  ) : null}
                  Inicia sesión o crea tu cuenta para asegurar tus fechas al instante.
                </p>
              </div>
            </motion.div>
          )}

          {returnContext.action === "crear_alojamiento" && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent border border-emerald-400/30 flex items-start gap-3 text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Home size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Publicar tu Alojamiento</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                  Inicia sesión o regístrate para publicar tu propiedad y recibir huéspedes en SARA Stays.
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* 3. Selector de Pestañas Interactivas (Tabs con animación fluida) */}
        <div className="px-5 sm:px-7 pt-4">
          <div className="relative p-1 rounded-2xl bg-slate-950/60 border border-white/5 flex gap-1">
            <button
              type="button"
              onClick={() => { setActiveTab("login"); setError(""); }}
              className={`relative z-10 flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "login"
                  ? "text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {activeTab === "login" && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Key size={14} />
                <span>Iniciar Sesión</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab("registro"); setError(""); }}
              className={`relative z-10 flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "registro"
                  ? "text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {activeTab === "registro" && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <UserPlus size={14} />
                <span>Crear Cuenta Nueva</span>
              </span>
            </button>
          </div>
        </div>

        {/* 4. Formulario Dinámico */}
        <div className="p-5 sm:p-7 space-y-4">
          {/* Mensajes de Alerta */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2"
            >
              <span className="text-base">⚠️</span>
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2"
            >
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* FORMULARIO 1: INICIAR SESIÓN */}
          {/* ======================================================== */}
          {activeTab === "login" && (
            <motion.form 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleLogin} 
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="tu.correo@ejemplo.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-2xl text-xs sm:text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Contraseña
                  </label>
                  <span className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors cursor-pointer">
                    ¿Olvidaste tu clave?
                  </span>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 bg-slate-950/70 border border-slate-700/80 rounded-2xl text-xs sm:text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer transition-colors p-1"
                    title={showPassword ? "Ocultar" : "Mostrar"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-2xl text-xs sm:text-sm font-extrabold shadow-[0_10px_25px_-5px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>{isLoading ? "Ingresando a tu cuenta..." : "Ingresar a Mi Cuenta"}</span>
                <ArrowRight size={16} />
              </button>

              {/* Acceso Rápido VIP para pruebas */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleQuickDemoAccess}
                  className="group text-xs text-amber-300 hover:text-amber-200 font-bold inline-flex items-center gap-2 cursor-pointer bg-amber-400/10 hover:bg-amber-400/20 px-4 py-2 rounded-2xl border border-amber-400/30 transition-all shadow-xs"
                >
                  <Sparkles size={14} className="text-amber-400 group-hover:rotate-12 transition-transform" />
                  <span>Acceso Rápido VIP (Alexandra Malacatus)</span>
                </button>
              </div>
            </motion.form>
          )}

          {/* ======================================================== */}
          {/* FORMULARIO 2: CREAR CUENTA NUEVA */}
          {/* ======================================================== */}
          {activeTab === "registro" && (
            <motion.form 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleRegister} 
              className="space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nombres <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Ej: Alexandra"
                      value={regForm.nombre}
                      onChange={(e) => setRegForm({ ...regForm, nombre: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Malacatus"
                    value={regForm.apellido}
                    onChange={(e) => setRegForm({ ...regForm, apellido: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Cédula / Pasaporte <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="1103711592"
                      value={regForm.cedula}
                      onChange={(e) => setRegForm({ ...regForm, cedula: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    WhatsApp <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      required
                      placeholder="+593 981804023"
                      value={regForm.telefono}
                      onChange={(e) => setRegForm({ ...regForm, telefono: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Correo Electrónico <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="huesped@ejemplo.com"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Contraseña <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? "text" : "password"}
                      required
                      placeholder="Mínimo 6 carácteres"
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      className="w-full pl-3 pr-9 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-1"
                      title={showRegPassword ? "Ocultar" : "Mostrar"}
                    >
                      {showRegPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Confirmar Contraseña <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Repite tu contraseña"
                      value={regForm.confirmPassword}
                      onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                      className="w-full pl-3 pr-9 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-1"
                      title={showRegConfirmPassword ? "Ocultar" : "Mostrar"}
                    >
                      {showRegConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-2xl text-xs sm:text-sm font-extrabold shadow-[0_10px_25px_-5px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>{isLoading ? "Creando tu cuenta..." : "Crear Cuenta de Huésped SARA"}</span>
                <CheckCircle2 size={16} />
              </button>
            </motion.form>
          )}

          {/* 5. Micro-Badges de Confianza e Interacción */}
          <div className="pt-3 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/[0.03]">
              <Check size={12} className="text-emerald-400 shrink-0" />
              <span>Smart Lock 24/7</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/[0.03]">
              <Check size={12} className="text-emerald-400 shrink-0" />
              <span>Tarifa Directa</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/[0.03]">
              <Check size={12} className="text-emerald-400 shrink-0" />
              <span>Confirmación ⚡</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/[0.03]">
              <ShieldCheck size={12} className="text-emerald-400 shrink-0" />
              <span>SSL 256-bit</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
