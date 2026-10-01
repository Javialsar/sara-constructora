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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-[1000px] bg-white rounded-3xl shadow-2xl flex overflow-hidden min-h-[600px]">
        
        {/* Lado del Formulario */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center relative">
          
          <Link
            href="/inmobiliaria"
            className="inline-flex items-center gap-2 mb-6 text-sm text-slate-500 hover:text-slate-900 transition-colors group absolute top-8 left-8"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Volver</span>
          </Link>

          <div className="mt-8 mb-8 flex items-center gap-3">
             <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="text-white" size={24} />
             </div>
             <div>
               <h1 className="text-2xl font-bold text-slate-900 leading-tight">SARA Inmobiliaria</h1>
               <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Portal exclusivo para Propietarios</p>
             </div>
          </div>

          <div className="flex bg-slate-100 rounded-2xl p-1 mb-6">
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
              Registrarse
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 border border-red-100">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm font-medium mb-6 border border-emerald-100 flex items-center gap-2">
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
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none text-slate-700"
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
                    placeholder="••••••"
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none text-slate-700"
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
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <span>Ingresar al Portal</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
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
                      placeholder="Ej: Carlos"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none text-slate-700"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Cédula / RUC *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={regForm.cedula}
                      onChange={(e) => setRegForm({ ...regForm, cedula: e.target.value })}
                      placeholder="0102030405"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none text-slate-700"
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
                    placeholder="tu@correo.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Teléfono / WhatsApp</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    value={regForm.telefono}
                    onChange={(e) => setRegForm({ ...regForm, telefono: e.target.value })}
                    placeholder="+593 9XXXXXXXX"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Contraseña *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      placeholder="Mín. 6 caracteres"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none text-slate-700"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Confirmar Contraseña *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={regForm.confirmPassword}
                      onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                      placeholder="Repite tu contraseña"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none text-slate-700"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-slate-500 hover:text-emerald-600 cursor-pointer transition-colors"
              >
                {showPassword ? "🔒 Ocultar contraseñas" : "👁 Mostrar contraseñas"}
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <span>Crear Cuenta de Propietario</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500">
              Al registrarte, aceptas los términos y condiciones de SARA Inmobiliaria.
            </p>
          </div>
        </div>

        {/* Lado Informativo / Visual */}
        <div className="hidden lg:flex w-1/2 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden">
          {/* Fondo decorativo */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>
          
          {/* Imagen de fondo adicional como estaba en inmobiliaria */}
          <div className="absolute inset-0 opacity-20">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
              alt="Propiedad Premium"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

          <div className="relative z-10 h-full flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/20 rounded-full mb-6 w-fit">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Portal Verificado</span>
            </div>

            <h3 className="text-3xl font-black text-white mb-6 leading-tight">
              Gestiona tus propiedades con respaldo legal
            </h3>
            
            <p className="text-slate-300 text-sm mb-8 leading-relaxed">
              Publica, administra y monitorea tus inmuebles con la seguridad de una verificación legal completa por parte de SARA.
            </p>

            <ul className="space-y-6">
              {[
                { icon: ShieldCheck, title: "Verificación Legal", desc: "Verificación legal de tu propiedad" },
                { icon: Building2, title: "Publicación Premium", desc: "Publicación profesional con máxima visibilidad" },
                { icon: CheckCircle2, title: "Interesados", desc: "Historial de interesados en tiempo real" },
                { icon: Home, title: "Comunicación", desc: "Preguntas y respuestas directas con compradores" }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/5">
                    <item.icon className="text-emerald-400" />
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
