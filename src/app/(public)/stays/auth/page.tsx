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
  Check,
  Loader2
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { setGuestSession, getGuestSession } from "@/lib/services/guestAuth"
import { getLogosEmpresa } from "@/lib/services/logosService"
import { canAccessModule, getUserModule, SARA_MODULES, getUserPortalUrl } from "@/lib/auth/moduleGuards"

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
  const [logoStays, setLogoStays] = useState<string>("/sara-stays.png")

  useEffect(() => {
    getLogosEmpresa().then(logos => {
      if (logos?.stays) {
        setLogoStays(logos.stays)
      }
    })
  }, [])

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
  const [redirectPortal, setRedirectPortal] = useState<{ url: string; name: string } | null>(null)
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

        // VALIDACIÓN DE SEGREGACIÓN POR MÓDULO
        if (!canAccessModule(metadata, 'sara_stays')) {
          await supabase.auth.signOut()
          const userMod = getUserModule(metadata)
          const modDef = SARA_MODULES[userMod]
          const portalUrl = getUserPortalUrl(metadata)

          setRedirectPortal({
            url: portalUrl,
            name: modDef?.name || "tu módulo correspondiente"
          })

          throw new Error(
            `Acceso restringido: Esta cuenta está registrada en "${modDef?.name || 'otro módulo'}". Para ingresar al Portal de Alojamientos SARA Stays debes usar una cuenta de Huésped o dirigirte a tu portal.`
          )
        }

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
      // 1. Registro en Supabase Auth con etiquetado de módulo
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: regForm.email.trim(),
        password: regForm.password,
        options: {
          data: {
            nombre: regForm.nombre.trim(),
            apellido: regForm.apellido.trim(),
            telefono: regForm.telefono.trim(),
            cedula: regForm.cedula.trim(),
            role: "huesped",
            rol: "huesped",
            modulo_origen: "sara_stays",
            modulos_autorizados: ["sara_stays"]
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
    : "/stays"

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans relative">
      
      {/* SPLASH SCREEN CON LOGOTIPO GIRATORIO 3D AL ENTRAR */}
      <AnimatePresence>
        {showRotatingSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center"
            style={{ perspective: 1200 }}
          >
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
                className="w-full h-full object-contain drop-shadow-[0_20px_35px_rgba(20,184,166,0.3)]"
                style={{ backfaceVisibility: "visible" }}
              />
            </motion.div>

            <div className="w-48 h-1 bg-slate-800 rounded-full relative overflow-hidden mb-4">
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-teal-400 to-teal-600"
              />
            </div>

            <span className="text-xs uppercase tracking-[0.3em] font-extrabold text-teal-400">
              SARA STAYS · HOSPEDAJE
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-[1000px] bg-white rounded-3xl shadow-2xl flex overflow-hidden min-h-[600px] relative z-10">
        
        {/* Lado del Formulario */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center relative">
          
          <Link
            href={backTarget}
            className="inline-flex items-center gap-2 mb-6 text-sm text-slate-500 hover:text-slate-900 transition-colors group absolute top-8 left-8"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Volver a Hospedajes</span>
          </Link>

          <div className="mt-8 mb-4 flex items-center gap-3">
             <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-slate-200">
                <img
                  src={logoStays}
                  alt="Logo SARA Stays"
                  className="w-8 h-8 object-contain"
                />
             </div>
             <div>
               <h1 className="text-2xl font-bold text-slate-900 leading-tight">Portal del Huésped</h1>
               <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Gestión y Reservas</p>
             </div>
          </div>

          {returnContext.action === "reservar" && (
            <div className="mb-4 p-3.5 rounded-2xl bg-teal-50 border border-teal-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                <Sparkles size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                  Continuando con tu Reserva
                </div>
                <p className="text-xs text-teal-600/80 mt-0.5">
                  {returnContext.stayTitle ? (
                    <>Estás a un paso de reservar <strong>{returnContext.stayTitle}</strong>. </>
                  ) : returnContext.stayId ? (
                    <>Estás a un paso de reservar el hospedaje <strong>#{returnContext.stayId}</strong>. </>
                  ) : null}
                  Inicia sesión o crea tu cuenta.
                </p>
              </div>
            </div>
          )}

          {returnContext.action === "crear_alojamiento" && (
            <div className="mb-4 p-3.5 rounded-2xl bg-teal-50 border border-teal-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                <Home size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                  Publicar tu Alojamiento
                </div>
                <p className="text-xs text-teal-600/80 mt-0.5">
                  Inicia sesión o regístrate para publicar tu propiedad.
                </p>
              </div>
            </div>
          )}

          <div className="flex bg-slate-100 rounded-2xl p-1 mb-6 mt-2">
            <button
              type="button"
              onClick={() => { setActiveTab("login"); setError(""); setSuccessMsg("") }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === "login"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("registro"); setError(""); setSuccessMsg("") }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === "registro"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {error && (
            <div className="bg-amber-50 text-amber-900 p-4 rounded-xl text-sm font-medium mb-6 border border-amber-200 space-y-2">
              <div className="flex gap-2 items-start">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <p className="leading-snug">{error}</p>
              </div>
              {redirectPortal && (
                <div className="pt-1">
                  <Link
                    href={redirectPortal.url}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <span>Ir al portal de {redirectPortal.name}</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              )}
            </div>
          )}
          {successMsg && (
            <div className="bg-teal-50 text-teal-600 p-4 rounded-xl text-sm font-medium mb-6 border border-teal-100 flex gap-2 items-center">
              <CheckCircle2 size={16} />
              {successMsg}
            </div>
          )}

          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Correo Electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none text-slate-700"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <span>Ingresar a Mi Cuenta</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleQuickDemoAccess}
                  className="group text-xs text-amber-600 hover:text-amber-700 font-bold inline-flex items-center gap-2 cursor-pointer bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-2xl border border-amber-200 transition-all shadow-xs"
                >
                  <Sparkles size={14} className="text-amber-500 group-hover:rotate-12 transition-transform" />
                  <span>Acceso Rápido VIP (Alexandra Malacatus)</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === "registro" && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Nombres *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={regForm.nombre}
                      onChange={(e) => setRegForm({ ...regForm, nombre: e.target.value })}
                      placeholder="Ej: Alexandra"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none text-slate-700"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Apellidos</label>
                  <input
                    type="text"
                    value={regForm.apellido}
                    onChange={(e) => setRegForm({ ...regForm, apellido: e.target.value })}
                    placeholder="Ej: Malacatus"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Cédula / Pasaporte *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={regForm.cedula}
                      onChange={(e) => setRegForm({ ...regForm, cedula: e.target.value })}
                      placeholder="1103711592"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none text-slate-700"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">WhatsApp *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={regForm.telefono}
                      onChange={(e) => setRegForm({ ...regForm, telefono: e.target.value })}
                      placeholder="+593 981804023"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none text-slate-700"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Correo Electrónico *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="huesped@ejemplo.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Contraseña *</label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? "text" : "password"}
                      required
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      placeholder="Mínimo 6 carácteres"
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Confirmar Contraseña *</label>
                  <div className="relative">
                    <input
                      type={showRegConfirmPassword ? "text" : "password"}
                      required
                      value={regForm.confirmPassword}
                      onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                      placeholder="Repite tu contraseña"
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showRegConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <span>Crear Cuenta de Huésped</span>
                    <CheckCircle2 size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Micro-Badges de Confianza */}
          <div className="pt-4 mt-6 border-t border-slate-100 flex flex-wrap justify-center gap-3 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Check size={14} className="text-teal-500" />
              <span>Smart Lock 24/7</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check size={14} className="text-teal-500" />
              <span>Tarifa Directa</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check size={14} className="text-teal-500" />
              <span>Confirmación ⚡</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-teal-500" />
              <span>Seguridad SSL</span>
            </div>
          </div>
        </div>

        {/* Lado Informativo / Visual */}
        <div className="hidden lg:flex w-1/2 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden">
          {/* Fondo decorativo */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-center">
            <h3 className="text-3xl font-black text-white mb-6 leading-tight">
              Vive la experiencia SARA Stays
            </h3>
            
            <p className="text-slate-300 text-sm mb-8 leading-relaxed">
              Descubre lugares increíbles para hospedarte con la comodidad, diseño y tecnología que mereces.
            </p>

            <ul className="space-y-6">
              {[
                { icon: Sparkles, title: "Diseño Exclusivo", desc: "Espacios pensados para tu máximo confort" },
                { icon: Key, title: "Llave Digital", desc: "Accede sin contacto con tu celular" },
                { icon: ShieldCheck, title: "Seguridad 24/7", desc: "Soporte y monitoreo continuo" }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/5">
                    <item.icon className="text-teal-400" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="text-white font-bold">{item.title}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}
