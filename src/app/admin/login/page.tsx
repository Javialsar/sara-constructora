"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react"
import { adminLoginAction } from "@/app/actions/auth"

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await adminLoginAction(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
    // If successful, the server action redirects automatically
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-brand-dark">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-brand-dark px-8 py-10 text-center border-b-4 border-brand-sage">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-brand-sage/20 flex items-center justify-center">
                <ShieldCheck size={32} className="text-brand-sage" />
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">
              Panel Administrativo
            </h1>
            <p className="text-gray-400 text-sm font-light">
              Acceso exclusivo para administradores
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
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
                  name="email"
                  type="email"
                  placeholder="admin@saraconstructora.com"
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
                  name="password"
                  type={showPassword ? "text" : "password"}
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
              className="w-full bg-brand-dark hover:bg-brand-dark/90 text-white py-4 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>

        <div className="text-center mt-6">
          <p className="text-white/40 text-xs font-bold tracking-widest uppercase">
            SARA CONSTRUCTORA © {new Date().getFullYear()}
          </p>
        </div>
      </motion.div>
    </div>
  )
}
