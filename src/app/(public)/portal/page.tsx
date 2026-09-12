"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Lock, Mail, Eye, EyeOff, ArrowRight, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function PortalLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push("/portal/dashboard")
      }
    }
    checkUser()
  }, [router, supabase])

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

          {/* Form */}
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm rounded"
              >
                {error}
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
  )
}

