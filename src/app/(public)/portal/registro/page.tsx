"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, UserPlus } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function PortalRegistroPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    setIsLoading(true)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nombre: formData.nombre,
            apellido: formData.apellido,
            telefono: formData.telefono,
          },
        },
      })

      if (signUpError) {
        throw new Error(signUpError.message)
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Error al conectar con la base de datos.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070')" }}
        />
        <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md mx-4"
        >
          <div className="bg-white shadow-2xl p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-brand-sage/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-brand-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-brand-dark tracking-tight mb-3">
              ¡Registro Exitoso!
            </h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Su cuenta ha sido creada. Por favor, inicie sesión. (En un entorno de producción con confirmación de email activada, tendría que verificar su correo primero).
            </p>
            <Link 
              href="/portal"
              className="inline-flex items-center gap-2 bg-brand-dark text-white px-8 py-3.5 font-bold uppercase tracking-widest text-xs hover:bg-brand-dark/90 transition-colors"
            >
              Ir al Login
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070')" }}
      />
      <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm" />
      
      {/* Registration Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg mx-4"
      >
        <div className="bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-brand-dark px-8 py-8 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-brand-sage/20 flex items-center justify-center">
                <UserPlus size={28} className="text-brand-sage" />
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">
              Crear Cuenta
            </h1>
            <p className="text-gray-400 text-sm font-light">
              Regístrese para acceder al seguimiento de su proyecto
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="p-8 space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm rounded"
              >
                {error}
              </motion.div>
            )}

            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Nombre
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Juan"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-brand-sage focus:ring-2 focus:ring-brand-sage/20 transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Apellido
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="apellido"
                    type="text"
                    value={formData.apellido}
                    onChange={handleChange}
                    placeholder="Pérez"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-brand-sage focus:ring-2 focus:ring-brand-sage/20 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Teléfono */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Número de Contacto
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="+593 98 123 4567"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-brand-sage focus:ring-2 focus:ring-brand-sage/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="juan.perez@correo.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-brand-sage focus:ring-2 focus:ring-brand-sage/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Contraseña y Confirmar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-brand-sage focus:ring-2 focus:ring-brand-sage/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-brand-sage focus:ring-2 focus:ring-brand-sage/20 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-dark hover:bg-brand-dark/90 text-white py-4 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Crear Cuenta
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 pb-8 text-center">
            <p className="text-xs text-gray-400">
              ¿Ya tiene cuenta?{" "}
              <Link href="/portal" className="text-brand-sage font-bold hover:underline">
                Iniciar Sesión
              </Link>
            </p>
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

