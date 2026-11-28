"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Calculator,
  CheckCircle2,
  Eye,
  EyeOff,
  FileCheck2,
  HardHat,
  Hotel,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
  Users,
  Wallet,
} from "lucide-react"
import { adminLoginAction } from "@/app/actions/auth"
import ModuleBrandLogo from "@/components/layout/ModuleBrandLogo"

const ECOSYSTEM_MODULES = [
  { key: "constructora", label: "Constructora", sub: "BIM & Obra", icon: HardHat, dot: "#10b981" },
  { key: "apu", label: "SARA APU", sub: "Costos & SERCOP", icon: Calculator, dot: "#3b82f6" },
  { key: "marketplace", label: "Marketplace", sub: "B2B Materiales", icon: ShoppingCart, dot: "#06b6d4" },
  { key: "fletes", label: "SARA Fletes", sub: "Logística MTOP", icon: Truck, dot: "#f59e0b" },
  { key: "talento", label: "Talento", sub: "Cuadrillas & SST", icon: Users, dot: "#f97316" },
  { key: "inmobiliaria", label: "Inmobiliaria", sub: "Plusvalía & IVS", icon: Building2, dot: "#6366f1" },
  { key: "stays", label: "SARA Stays", sub: "Corporate USALI", icon: Hotel, dot: "#ec4899" },
  { key: "facturacion", label: "Firma & SRI", sub: "XAdES & .p12", icon: FileCheck2, dot: "#eab308" },
  { key: "pagos", label: "Pagos Escrow", sub: "Fideicomiso UAFE", icon: Wallet, dot: "#14b8a6" },
] as const

function AdminLoginForm() {
  const searchParams = useSearchParams()
  const prefersReducedMotion = useReducedMotion()

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const rawRedirectTo = searchParams.get("redirectTo") || ""
  const safeRedirectTo = useMemo(() => {
    if (
      rawRedirectTo.startsWith("/admin") &&
      !rawRedirectTo.startsWith("//") &&
      !rawRedirectTo.includes("\\") &&
      !rawRedirectTo.startsWith("/admin/login")
    ) {
      return rawRedirectTo
    }
    return ""
  }, [rawRedirectTo])

  const queryNotice = useMemo(() => {
    const errParam = searchParams.get("error")
    const warnParam = searchParams.get("warning")

    if (errParam === "unauthorized" || warnParam === "sin_privilegios_admin") {
      return "Sesión sin privilegios de Comando Maestro. Ingrese con una cuenta corporativa autorizada (Administrador o Técnico) o regrese a su portal operativo."
    }
    if (errParam === "session_expired" || errParam === "timeout") {
      return "Su sesión expiró por política de seguridad Zero-Trust. Autentíquese nuevamente para continuar."
    }
    return ""
  }, [searchParams])

  useEffect(() => {
    if (queryNotice) {
      setError(queryNotice)
    }
  }, [queryNotice])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await adminLoginAction(formData)

      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      }
      // Si tiene éxito, el Server Action redirige automáticamente a /admin (o redirectTo validado)
    } catch {
      // Next.js redirect() lanza un error interno manejado por el router; si llega un error real de red lo mostramos
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#07130d] to-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Cuadrícula arquitectónica + iluminación ambiental coherente con /admin */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(60, 122, 82, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(60, 122, 82, 0.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full bg-amber-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-24 w-[480px] h-[480px] rounded-full bg-emerald-500/10 blur-3xl"
      />

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 pt-6 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 min-h-[44px] px-3 -ml-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-amber-400 hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Volver al Ecosistema</span>
        </Link>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono tabular-nums text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
          <span>ZERO-TRUST IAM • 9/9 MÓDULOS</span>
        </div>
      </header>

      {/* Main Split-Screen Command Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-5 sm:px-8 py-8 lg:py-12">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* PANEL IZQUIERDO: Identidad Holding + Matriz de los 9 Módulos (Desktop) */}
          <motion.section
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="hidden lg:flex lg:col-span-7 flex-col space-y-7 pr-4"
            aria-label="Resumen del Ecosistema GRUPO SARA"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <ModuleBrandLogo modulo="grupo_sara" size="md" showBackToHolding={false} />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider w-fit">
                <Sparkles size={13} aria-hidden="true" />
                <span>Gobernanza Corporativa • Ecuador</span>
              </div>

              <h1 className="font-display text-4xl xl:text-5xl font-black tracking-tight text-white leading-[1.08]">
                Centro de Comando{" "}
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                  Ejecutivo
                </span>
              </h1>

              <p className="text-slate-300 text-sm xl:text-base leading-relaxed max-w-xl">
                Supervisión financiera consolidada, auditoría en tiempo real, control de suscripciones y administración maestra de las 9 unidades estratégicas de <strong className="text-white font-semibold">GRUPO SARA</strong>.
              </p>
            </div>

            {/* Matriz de los 9 Módulos del Ecosistema */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <span>Acceso Maestro Unificado (9 Unidades)</span>
                <span className="text-emerald-400 font-semibold">Operativo</span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {ECOSYSTEM_MODULES.map((mod) => {
                  const Icon = mod.icon
                  return (
                    <div
                      key={mod.key}
                      className="group rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 px-3 py-2.5 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <Icon size={15} className="text-slate-300 shrink-0" aria-hidden="true" />
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: mod.dot }}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="text-xs font-bold text-slate-100 truncate">{mod.label}</div>
                      <div className="text-[11px] text-slate-400 truncate">{mod.sub}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Postura de Seguridad */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 border-t border-slate-800/80 text-xs font-mono text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" aria-hidden="true" />
                Cifrado TLS 1.3
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" aria-hidden="true" />
                Roles Verificados app_metadata
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" aria-hidden="true" />
                Auditoría Activa
              </span>
            </div>
          </motion.section>

          {/* PANEL DERECHO: Tarjeta de Autenticación Maestra */}
          <motion.section
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="w-full max-w-md mx-auto lg:col-span-5"
            aria-label="Formulario de inicio de sesión administrativo"
          >
            <div className="relative rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl overflow-hidden">
              {/* Línea luminosa superior ejecutiva */}
              <div
                aria-hidden="true"
                className="h-1 w-full bg-gradient-to-r from-emerald-500/70 via-amber-400 to-emerald-500/70"
              />

              <div className="p-7 sm:p-8 space-y-6">
                {/* Encabezado de la Tarjeta */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                      <ShieldCheck size={24} className="text-emerald-400" aria-hidden="true" />
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
                      Master Admin
                    </span>
                  </div>

                  <div>
                    <h2 className="font-display text-2xl font-extrabold text-white tracking-tight">
                      Panel Administrativo
                    </h2>
                    <p className="text-slate-300 text-sm mt-1">
                      Autenticación exclusiva para dirección y gestión del ecosistema GRUPO SARA.
                    </p>
                  </div>
                </div>

                {/* Aviso de destino si existe redirectTo válido */}
                {safeRedirectTo && (
                  <div className="rounded-xl bg-slate-950/70 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-300 flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-400 shrink-0" aria-hidden="true" />
                    <span className="truncate">
                      Tras validar su identidad continuará a{" "}
                      <code className="font-mono text-amber-300">{safeRedirectTo}</code>
                    </span>
                  </div>
                )}

                {/* Banner de Error Accesible */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      key="admin-login-error"
                      id="admin-login-error"
                      role="alert"
                      aria-live="assertive"
                      initial={prefersReducedMotion ? false : { opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                      className="rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 px-4 py-3 text-sm flex items-start gap-2.5"
                    >
                      <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="space-y-1">
                        <p className="leading-snug">{error}</p>
                        {queryNotice && (
                          <p className="text-xs text-red-300/80">
                            Al iniciar sesión con credenciales maestras se reemplazará la sesión actual.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {safeRedirectTo && (
                    <input type="hidden" name="redirectTo" value={safeRedirectTo} />
                  )}

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300"
                    >
                      Correo Corporativo
                    </label>
                    <div className="relative group">
                      <Mail
                        size={18}
                        aria-hidden="true"
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-400 transition-colors pointer-events-none"
                      />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="username"
                        inputMode="email"
                        autoCapitalize="none"
                        spellCheck={false}
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? "admin-login-error" : undefined}
                        placeholder="director@gruposara.com.ec"
                        className="w-full min-h-[48px] pl-11 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300"
                    >
                      Clave de Acceso
                    </label>
                    <div className="relative group">
                      <Lock
                        size={18}
                        aria-hidden="true"
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-400 transition-colors pointer-events-none"
                      />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? "admin-login-error" : undefined}
                        placeholder="••••••••••••"
                        className="w-full min-h-[48px] pl-11 pr-14 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        aria-pressed={showPassword}
                        className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      >
                        {showPassword ? (
                          <EyeOff size={18} aria-hidden="true" />
                        ) : (
                          <Eye size={18} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    aria-busy={isLoading}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                    className="w-full min-h-[50px] rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/20 border border-amber-400/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                        <span>Validando identidad y privilegios...</span>
                      </>
                    ) : (
                      <>
                        <span>Acceder al Panel Maestro</span>
                        <ArrowRight size={17} aria-hidden="true" />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Pie de seguridad y escape limpio para usuarios operativos */}
                <div className="pt-4 border-t border-slate-800/80 space-y-3">
                  <p className="text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
                    <ShieldCheck size={14} className="text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>
                      Acceso restringido bajo verificación Zero-Trust (<code className="font-mono text-slate-300">app_metadata</code>) con registro de auditoría.
                    </span>
                  </p>
                  <div className="text-center">
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center min-h-[36px] text-xs font-medium text-slate-400 hover:text-amber-400 transition-colors"
                    >
                      ¿Busca un portal operativo (APU, Constructora o Fletes)? Ir a acceso de usuarios →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen compacto de módulos visible en móvil */}
            <div className="mt-5 flex lg:hidden items-center justify-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              <span>Control unificado sobre los 9 módulos de GRUPO SARA</span>
            </div>
          </motion.section>
        </div>
      </main>

      {/* Footer Corporativo */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 pb-6 text-center">
        <p className="text-slate-400 text-[11px] font-mono tracking-widest uppercase">
          GRUPO SARA HOLDING © {new Date().getFullYear()} • AUDITORÍA ACTIVA DE SESIÓN
        </p>
      </footer>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
          <Loader2 size={24} className="animate-spin text-amber-400" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  )
}
