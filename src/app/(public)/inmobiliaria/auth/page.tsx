"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Phone,
  User,
  CreditCard,
  Building2,
  Loader2,
  Home
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { setOwnerSession, getOwnerSession } from "@/lib/services/ownerAuth"

export default function InmobiliariaAuthPage() {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<"login" | "registro">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  // Login
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Registro
  const [regForm, setRegForm] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    email: "",
    telefono: "+593 9",
    password: "",
    confirmPassword: ""
  })

  const supabase = createClient()

  // Si ya tiene sesión, redirigir al portal
  useEffect(() => {
    const existing = getOwnerSession()
    if (existing) {
      router.push("/inmobiliaria/mi-portal")
    }
  }, [router])

  // Login con Supabase
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
      let ownerId = data?.user?.id || `owner-${Date.now()}`
      let ownerPhone = "+593 9"
      let ownerCedula = ""
      let ownerApellido = ""

      if (authError) {
        console.warn("Supabase auth advertencia:", authError.message)
      } else if (data?.user) {
        const metadata = data.user.user_metadata || {}
        rawName = metadata.nombre || rawName
        ownerApellido = metadata.apellido || ""
        ownerPhone = metadata.telefono || ownerPhone
        ownerCedula = metadata.cedula || ""
      }

      const cleanParts = rawName.replace(/[._-]+/g, " ").trim().split(/\s+/)
      let finalNombre = cleanParts.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")
      if (!ownerApellido && cleanParts.length > 1) {
        finalNombre = cleanParts[0].charAt(0).toUpperCase() + cleanParts[0].slice(1).toLowerCase()
        ownerApellido = cleanParts.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")
      }

      setOwnerSession({
        id: ownerId,
        nombre: finalNombre,
        apellido: ownerApellido,
        cedula: ownerCedula,
        email: loginEmail.trim(),
        telefono: ownerPhone,
        ciudad: "Ecuador",
        fechaRegistro: new Date().toISOString()
      })

      setSuccessMsg("¡Bienvenido! Ingresando a tu portal...")
      setTimeout(() => {
        router.push("/inmobiliaria/mi-portal")
      }, 900)
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión.")
    } finally {
      setIsLoading(false)
    }
  }

  // Registro con Supabase
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!regForm.nombre.trim() || !regForm.email.trim() || !regForm.cedula.trim()) {
      setError("Por favor completa los campos requeridos: nombre, cédula y correo.")
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
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: regForm.email.trim(),
        password: regForm.password,
        options: {
          data: {
            nombre: regForm.nombre.trim(),
            apellido: regForm.apellido.trim(),
            telefono: regForm.telefono.trim(),
            cedula: regForm.cedula.trim(),
            rol: "propietario_inmobiliaria"
          }
        }
      })

      if (signUpErr) {
        console.warn("Aviso de Supabase SignUp:", signUpErr.message)
      }

      const ownerId = data?.user?.id || `owner-${Date.now()}`

      setOwnerSession({
        id: ownerId,
        nombre: regForm.nombre.trim(),
        apellido: regForm.apellido.trim(),
        cedula: regForm.cedula.trim(),
        email: regForm.email.trim(),
        telefono: regForm.telefono.trim(),
        ciudad: "Ecuador",
        fechaRegistro: new Date().toISOString()
      })

      // Persistir en BD de propietarios
      try {
        await fetch("/api/inmobiliaria/propietarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: regForm.nombre.trim(),
            apellido: regForm.apellido.trim(),
            cedula: regForm.cedula.trim(),
            telefono: regForm.telefono.trim(),
            email: regForm.email.trim(),
            password: regForm.password,
          })
        })
      } catch (err) {
        console.warn("Aviso registrando propietario en BD:", err)
      }

      setSuccessMsg("¡Cuenta creada exitosamente! Redirigiendo a tu portal...")
      setTimeout(() => {
        router.push("/inmobiliaria/mi-portal")
      }, 1000)
    } catch (err: any) {
      setError(err.message || "Error al registrar la cuenta.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white relative flex items-center justify-center p-3 sm:p-6 py-8 md:py-12 overflow-x-hidden selection:bg-brand-sage selection:text-white">

      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-5xl mx-auto">
        {/* Botón Volver */}
        <Link
          href="/inmobiliaria"
          className="inline-flex items-center gap-2 mb-6 text-sm text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Volver a SARA Inmobiliaria</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl shadow-black/30">

          {/* Panel Izquierdo: Formulario */}
          <div className="p-6 sm:p-10 flex flex-col justify-center">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-emerald-500/15 rounded-2xl">
                <Building2 size={28} className="text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white">SARA Inmobiliaria</h1>
                <p className="text-xs text-gray-400">Portal exclusivo para Propietarios</p>
              </div>
            </div>

            {/* Tabs Login / Registro */}
            <div className="flex bg-white/5 rounded-2xl p-1 mb-6 border border-white/10">
              <button
                type="button"
                onClick={() => { setActiveTab("login"); setError(""); setSuccessMsg("") }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "login"
                    ? "bg-white text-slate-900 shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab("registro"); setError(""); setSuccessMsg("") }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "registro"
                    ? "bg-white text-slate-900 shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Registrarse
              </button>
            </div>

            {/* Mensajes de Error / Éxito */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs font-semibold">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} />
                {successMsg}
              </div>
            )}

            {/* Formulario Login */}
            {activeTab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Correo Electrónico</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Contraseña</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <span>Ingresar al Portal</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Formulario Registro */}
            {activeTab === "registro" && (
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Nombre Completo *</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        required
                        value={regForm.nombre}
                        onChange={(e) => setRegForm({ ...regForm, nombre: e.target.value })}
                        placeholder="Ej: Carlos Pérez"
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Cédula / RUC *</label>
                    <div className="relative">
                      <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        required
                        value={regForm.cedula}
                        onChange={(e) => setRegForm({ ...regForm, cedula: e.target.value })}
                        placeholder="0102030405"
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Correo Electrónico *</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      required
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      placeholder="tu@correo.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Teléfono / WhatsApp</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="tel"
                      value={regForm.telefono}
                      onChange={(e) => setRegForm({ ...regForm, telefono: e.target.value })}
                      placeholder="+593 9XXXXXXXX"
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Contraseña *</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        placeholder="Mín. 6 caracteres"
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Confirmar Contraseña *</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={regForm.confirmPassword}
                        onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                        placeholder="Repite tu contraseña"
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-gray-400 hover:text-emerald-400 cursor-pointer transition-colors"
                >
                  {showPassword ? "🔒 Ocultar contraseñas" : "👁 Mostrar contraseñas"}
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <span>Crear Cuenta de Propietario</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Separador */}
            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <p className="text-[11px] text-gray-500">
                Al registrarte, aceptas los términos y condiciones de SARA Inmobiliaria.
              </p>
            </div>
          </div>

          {/* Panel Derecho: Imagen y Beneficios */}
          <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-emerald-900/40 to-slate-900/60 p-10 border-l border-white/10 relative overflow-hidden">
            {/* Imagen de fondo */}
            <div className="absolute inset-0 opacity-20">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                alt="Propiedad Premium"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/20 rounded-full mb-6">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Portal Verificado</span>
              </div>

              <h2 className="text-3xl font-black text-white mb-4 leading-tight">
                Gestiona tus propiedades<br />
                <span className="text-emerald-400">con respaldo legal</span>
              </h2>

              <p className="text-sm text-gray-300 mb-8 leading-relaxed">
                Publica, administra y monitorea tus inmuebles con la seguridad de una verificación legal completa por parte de SARA.
              </p>

              <div className="space-y-4">
                {[
                  { icon: ShieldCheck, text: "Verificación legal de tu propiedad" },
                  { icon: Building2, text: "Publicación profesional con máxima visibilidad" },
                  { icon: CheckCircle2, text: "Historial de interesados en tiempo real" },
                  { icon: Home, text: "Preguntas y respuestas directas con compradores" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/15 rounded-xl shrink-0">
                      <item.icon size={16} className="text-emerald-400" />
                    </div>
                    <span className="text-sm text-gray-200 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
