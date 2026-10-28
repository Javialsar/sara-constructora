"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { canAccessModule, getUserModule, SARA_MODULES, getUserPortalUrl } from "@/lib/auth/moduleGuards"
import ModuleBrandLogo from "@/components/layout/ModuleBrandLogo"
import { Calculator, ArrowRight, Loader2, ArrowLeft, HardHat, Mail, Lock, User as UserIcon, Phone, Eye, EyeOff, AlertTriangle, ExternalLink } from "lucide-react"

export default function SaaSLogin() {
  const router = useRouter()
  const supabase = createClient()
  
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [redirectPortal, setRedirectPortal] = useState<{ url: string; name: string } | null>(null)
  
  // Form fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // UI States
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const redirectTo = params.get("redirectTo") || ""
      if (redirectTo.startsWith("/modulos/financiero")) {
        router.replace("/modulos/financiero")
      }
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setRedirectPortal(null)

    try {
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (signInError) throw signInError

        const user = data?.user
        const meta = user?.user_metadata || {}

        // VALIDACIÓN DE SEGREGACIÓN POR MÓDULO
        if (!canAccessModule(meta, 'sara_apu')) {
          await supabase.auth.signOut()
          const userMod = getUserModule(meta)
          const modDef = SARA_MODULES[userMod]
          const portalUrl = getUserPortalUrl(meta)
          
          setRedirectPortal({
            url: portalUrl,
            name: modDef?.name || "tu módulo correspondiente"
          })

          throw new Error(
            `Acceso restringido: Esta cuenta está registrada en "${modDef?.name || 'otro módulo'}". Para acceder a SARA APU debes usar una cuenta de Presupuestos o ingresar en tu portal correspondiente.`
          )
        }

        router.push('/dashboard')
      } else {
        if (password !== confirmPassword) {
          throw new Error("Las contraseñas no coinciden")
        }
        if (password.length < 6) {
          throw new Error("La contraseña debe tener al menos 6 caracteres")
        }
        
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
              role: 'profesional',
              modulo_origen: 'sara_apu',
              modulos_autorizados: ['sara_apu']
            }
          }
        })
        if (signUpError) throw signUpError
        
        // Autologueo después del registro
        await supabase.auth.signInWithPassword({ email, password })
        router.push('/dashboard/planes')
      }
    } catch (err: any) {
      setError(err.message || "Error de autenticación")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans">
      <div className="w-full max-w-[1000px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex overflow-hidden min-h-[600px] relative">
        {/* Boton Volver */}
        <Link href="/apu" className="absolute top-6 left-6 flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-400 transition-colors z-20">
          <ArrowLeft size={15} />
          Volver a SARA APU
        </Link>
        
        {/* Lado del Formulario */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center relative pt-16">
          <div className="mb-8">
            <ModuleBrandLogo modulo="apu" size="md" showBackToHolding={false} />
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">
            {isLogin ? "Bienvenido de vuelta" : "Crea tu cuenta"}
          </h2>
          <p className="text-slate-400 mb-8 text-sm">
            {isLogin 
              ? "Ingresa tus credenciales para acceder a tus presupuestos APU y SERCOP." 
              : "Únete y revoluciona la ingeniería de costos y presupuestos."}
          </p>

          {error && (
            <div className="bg-amber-950/70 text-amber-200 p-4 rounded-xl text-sm font-medium mb-6 border border-amber-500/40 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-snug">{error}</p>
              </div>
              {redirectPortal && (
                <div className="pt-1">
                  <Link
                    href={redirectPortal.url}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <span>Ir al portal de {redirectPortal.name}</span>
                    <ExternalLink size={13} />
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-300">Nombre Completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon size={18} className="text-slate-500" />
                  </div>
                  <input 
                    type="text" 
                    required 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-white" 
                    placeholder="Juan Pérez"
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-300">Número de Contacto</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={18} className="text-slate-500" />
                  </div>
                  <input 
                    type="tel" 
                    required 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-white" 
                    placeholder="+593 99 999 9999"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-300">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-500" />
                </div>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-white" 
                  placeholder="tu@correo.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-300">Contraseña</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-500" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-white" 
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-300">Confirmar Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-500" />
                  </div>
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    required 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-white" 
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6 font-medium">
            {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}{" "}
            <button onClick={() => { setIsLogin(!isLogin); setError(""); }} className="text-blue-400 font-bold hover:underline">
              {isLogin ? "Regístrate gratis" : "Inicia Sesión"}
            </button>
          </p>
        </div>

        {/* Lado Informativo / Visual */}
        <div className="hidden lg:flex w-1/2 bg-slate-950 border-l border-slate-800 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>
          
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-white mb-6 leading-tight">
              Diseñado para ingenieros y arquitectos modernos.
            </h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/5">
                  <Calculator className="text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold">Análisis Precisos</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">Cotiza proyectos en minutos con nuestra base de datos de precios de mercado actualizada.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/5">
                  <HardHat className="text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold">Gestión de Obra</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">Exporta a Excel y PDF al instante con tu propio logo corporativo.</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="relative z-10 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => <span key={s} className="text-yellow-400 text-lg">★</span>)}
            </div>
            <p className="text-white font-medium mb-4">"Redujo mi tiempo de presupuesto de días a un par de horas. Totalmente indispensable para nuestra constructora."</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full"></div>
              <div>
                <h5 className="text-white font-bold text-sm">Arq. Ricardo Sánchez</h5>
                <p className="text-slate-400 text-xs">Director de Proyectos</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
