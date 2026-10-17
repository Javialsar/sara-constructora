"use client"
import ModuloIntroSplash from '@/components/ui/ModuloIntroSplash';
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Lock, Mail, Eye, EyeOff, ArrowRight, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { canAccessModule, getUserModule, getUserPortalUrl, SARA_MODULES } from "@/lib/auth/moduleGuards"

export default function PortalLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [redirectPortal, setRedirectPortal] = useState<{ url: string; name: string } | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    // Detectar si ya existe usuario sin expulsar la pantalla de autenticación
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUser(user)
      }
    }
    checkUser()
  }, [supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!email || !password) {
        throw new Error("Por favor ingrese sus credenciales.")
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw new Error(signInError.message === 'Invalid login credentials' ? 'Credenciales inválidas.' : signInError.message)
      }

      // Validar segregación de módulo estricta
      const userMeta = data.user.user_metadata || {}
      if (!canAccessModule(userMeta, 'sara_constructora')) {
        await supabase.auth.signOut()
        const userMod = getUserModule(userMeta)
        const modDef = SARA_MODULES[userMod]
        const portalUrl = getUserPortalUrl(userMeta)
        setRedirectPortal({
          url: portalUrl,
          name: modDef?.name || 'tu módulo correspondiente'
        })
        throw new Error(
          `Acceso restringido: Esta cuenta pertenece al módulo "${modDef?.name || 'otro módulo'}". Para acceder al Portal de Obras debes ingresar con una cuenta de Constructora o dirigirte a tu portal asignado.`
        )
      }

      // Check if user status is active from the clientes table
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .select('estado, es_admin')
        .eq('id', data.user.id)
        .single()

      if (clienteError) {
        console.error("No se pudo obtener perfil del cliente:", clienteError)
      }

      if (cliente?.estado === 'inactivo') {
        await supabase.auth.signOut()
        throw new Error("Su cuenta está inactiva.")
      }

      // Redirect to correct dashboard
      if (cliente?.es_admin) {
        router.push("/admin")
      } else {
        router.push("/portal/dashboard")
      }
      
    } catch (err: any) {
      setError(err.message || "Error al autenticar.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <ModuloIntroSplash modulo="portal" />
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070')" }}
      />
      <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm" />
      
      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-brand-dark px-8 py-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-brand-sage/20 flex items-center justify-center">
                <Shield size={32} className="text-brand-sage" />
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">
              Portal de Clientes
            </h1>
            <p className="text-gray-400 text-sm font-light">
              Accede al seguimiento de tu proyecto en tiempo real
            </p>
          </div>

          {/* Active Session Notice if logged in */}
          {currentUser && (
            <div className="m-6 mb-0 p-4 rounded-xl bg-brand-sage/10 border border-brand-sage/30 text-center">
              <span className="text-[11px] font-bold text-brand-dark uppercase tracking-wider block mb-0.5">
                Sesión Activa Detectada
              </span>
              <p className="text-xs text-gray-500 font-mono mb-3">
                {currentUser.email}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => router.push("/portal/dashboard")}
                  className="px-4 py-2 bg-brand-dark hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-sm"
                >
                  Entrar a mi Entorno →
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signOut()
                    setCurrentUser(null)
                  }}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors border border-gray-200"
                >
                  Cambiar Cuenta
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm rounded"
              >
                <div className="space-y-2">
                <p>{error}</p>
                {redirectPortal && (
                  <Link
                    href={redirectPortal.url}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-dark hover:bg-black text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                  >
                    Ir a {redirectPortal.name} →
                  </Link>
                )}
              </div>
              </motion.div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-gray-500">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@correo.com"
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-brand-sage focus:ring-2 focus:ring-brand-sage/20 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-gray-500">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-brand-sage focus:ring-2 focus:ring-brand-sage/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-dark hover:bg-brand-dark/90 text-white py-4 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 pb-8 space-y-4">
            <Link 
              href="/portal/registro"
              className="w-full block text-center border-2 border-brand-sage text-brand-sage hover:bg-brand-sage hover:text-white py-3.5 font-bold uppercase tracking-widest text-sm transition-all"
            >
              Registrarse
            </Link>
          </div>
        </div>

        {/* Branding */}
        <div className="text-center mt-6">
          <p className="text-white/40 text-xs font-bold tracking-widest uppercase">
            SARA CONSTRUCTORA © {new Date().getFullYear()}
          </p>
        </div>
      </motion.div>
    </div>
    </>
  )
}