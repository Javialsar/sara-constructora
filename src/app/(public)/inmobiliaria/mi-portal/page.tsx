"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Building2,
  Plus,
  Eye,
  MessageSquare,
  Settings,
  LogOut,
  Home,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  TrendingUp,
  Bell,
  User,
  Search,
  Loader2,
  FileText,
  MapPin,
  DollarSign,
  HelpCircle,
  Phone
} from "lucide-react"
import { getOwnerSession, clearOwnerSession, OwnerProfile } from "@/lib/services/ownerAuth"

type InmuebleEstado = "en_verificacion" | "aprobado" | "publicado" | "rechazado"

interface InmuebleOwner {
  id: string
  codigo: string
  titulo: string
  tipo: string
  modalidad: string
  precio: number
  ciudad: string
  sector: string
  imagenUrl: string
  estado: InmuebleEstado
  fechaCreacion: string
  vistas: number
  consultas: number
}

interface Pregunta {
  id: string
  inmuebleId: string
  inmuebleTitulo: string
  pregunta: string
  respuesta: string
  nombreCliente: string
  fecha: string
  respondida: boolean
}

export default function MiPortalInmobiliaria() {
  const router = useRouter()
  const [owner, setOwner] = useState<OwnerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"propiedades" | "preguntas" | "config">("propiedades")
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Datos sincronizados con la BD
  const [inmuebles, setInmuebles] = useState<InmuebleOwner[]>([])
  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Verificar sesión al cargar
  useEffect(() => {
    const session = getOwnerSession()
    if (!session) {
      router.push("/inmobiliaria/auth")
      return
    }
    setOwner(session)
    setIsLoading(false)
  }, [router])

  // Cargar inmuebles del propietario desde la BD
  useEffect(() => {
    if (!owner) return

    const fetchData = async () => {
      setLoadingData(true)
      try {
        // Obtener inmuebles de este propietario
        const res = await fetch(`/api/inmobiliaria/inmuebles?propietarioEmail=${encodeURIComponent(owner.email)}`)
        if (res.ok) {
          const data = await res.json()
          const mapped: InmuebleOwner[] = (data || []).map((item: any) => ({
            id: item.id || item.codigo,
            codigo: item.codigo,
            titulo: item.titulo || "Sin título",
            tipo: item.tipo || "casa",
            modalidad: item.modalidad || "venta",
            precio: item.precio || 0,
            ciudad: item.ciudad || "",
            sector: item.sector || "",
            imagenUrl: item.imagenUrl || item.imagen_url || "",
            estado: item.estado_verificacion || (item.publicado ? "publicado" : "en_verificacion"),
            fechaCreacion: item.created_at || new Date().toISOString(),
            vistas: item.vistas || 0,
            consultas: item.consultas || 0
          }))
          setInmuebles(mapped)
        }
      } catch (err) {
        console.warn("Error cargando inmuebles del propietario:", err)
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [owner])

  const handleLogout = () => {
    clearOwnerSession()
    router.push("/inmobiliaria/auth")
  }

  const getEstadoBadge = (estado: InmuebleEstado) => {
    const map = {
      en_verificacion: { label: "En Verificación", icon: Clock, color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
      aprobado: { label: "Aprobado - Pendiente Pago", icon: CheckCircle2, color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
      publicado: { label: "Publicado", icon: CheckCircle2, color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
      rechazado: { label: "Rechazado", icon: XCircle, color: "bg-red-500/15 text-red-400 border-red-500/30" }
    }
    return map[estado] || map.en_verificacion
  }

  // Stats
  const totalInmuebles = inmuebles.length
  const totalConsultas = inmuebles.reduce((sum, i) => sum + i.consultas, 0)
  const totalVistas = inmuebles.reduce((sum, i) => sum + i.vistas, 0)
  const pendientes = inmuebles.filter(i => i.estado === "en_verificacion").length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 size={40} className="text-emerald-500 animate-spin" />
      </div>
    )
  }

  if (!owner) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">

      {/* ============================================================ */}
      {/* HEADER STICKY                                                */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/inmobiliaria" className="flex items-center gap-3 group">
            <div className="p-2 bg-emerald-500/15 rounded-xl group-hover:bg-emerald-500/25 transition-colors">
              <Building2 size={22} className="text-emerald-400" />
            </div>
            <div>
              <span className="font-black text-white text-sm tracking-wide">SARA INMOBILIARIA</span>
              <p className="text-[10px] text-gray-500">Portal del Propietario</p>
            </div>
          </Link>

          {/* Nav central */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
            <Link href="/inmobiliaria" className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-all font-medium">
              <Home size={13} className="inline mr-1.5" />
              Catálogo
            </Link>
            <Link href="/stays" className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-all font-medium">
              STAYS
            </Link>
          </nav>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xs">
                {owner.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-white block leading-tight">{owner.nombre}</span>
                <span className="text-[10px] text-gray-500">Propietario</span>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/40 p-2 z-50">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <p className="text-xs font-bold text-white">{owner.nombre} {owner.apellido}</p>
                  <p className="text-[10px] text-gray-500">{owner.email}</p>
                </div>
                <button
                  onClick={() => { setActiveTab("config"); setShowUserMenu(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                >
                  <Settings size={14} />
                  Configuración
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
                >
                  <LogOut size={14} />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* CONTENIDO PRINCIPAL                                          */}
      {/* ============================================================ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Banner de Verificación */}
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
          <ShieldCheck size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-300">Proceso de Verificación Legal</h3>
            <p className="text-xs text-amber-200/70 mt-0.5">
              Todos los inmuebles pasan por un proceso de verificación legal por SARA antes de ser publicados.
              Una vez aprobado, recibirás una notificación para seleccionar tu plan y activar la publicación.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Mis Inmuebles", value: totalInmuebles, icon: Building2, color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
            { label: "Pendientes", value: pendientes, icon: Clock, color: "text-amber-400", bgColor: "bg-amber-500/10" },
            { label: "Consultas", value: totalConsultas, icon: MessageSquare, color: "text-blue-400", bgColor: "bg-blue-500/10" },
            { label: "Visualizaciones", value: totalVistas, icon: Eye, color: "text-purple-400", bgColor: "bg-purple-500/10" }
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/[0.07] transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${stat.bgColor}`}>
                  <stat.icon size={14} className={stat.color} />
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{stat.label}</span>
              </div>
              <span className="text-2xl font-black text-white">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white/5 rounded-2xl p-1.5 border border-white/10 mb-6">
          {[
            { id: "propiedades" as const, label: "Mis Propiedades", icon: Building2 },
            { id: "preguntas" as const, label: "Preguntas", icon: MessageSquare },
            { id: "config" as const, label: "Configuración", icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <tab.icon size={15} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ============================== */}
        {/* TAB: MIS PROPIEDADES           */}
        {/* ============================== */}
        {activeTab === "propiedades" && (
          <div className="space-y-4">
            {/* Botón Publicar Nuevo */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">Mis Propiedades</h2>
              <button
                onClick={() => {
                  // TODO: Abrir modal de publicación del propietario
                  alert("Próximamente: Formulario para publicar tu propiedad. SARA verificará la documentación legal antes de activar la publicación.")
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Plus size={16} />
                <span>Publicar Nueva Propiedad</span>
              </button>
            </div>

            {loadingData ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={30} className="text-emerald-500 animate-spin" />
              </div>
            ) : inmuebles.length === 0 ? (
              /* Estado vacío */
              <div className="text-center py-16 bg-white/5 border border-white/10 rounded-3xl">
                <div className="p-4 bg-emerald-500/10 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-5">
                  <Building2 size={36} className="text-emerald-400" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Aún no tienes propiedades</h3>
                <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
                  Publica tu primera propiedad y SARA se encargará de verificar la documentación legal,
                  posicionarla en el catálogo y conectarte con compradores calificados.
                </p>
                <button
                  onClick={() => {
                    alert("Próximamente: Formulario para publicar tu propiedad.")
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Plus size={18} />
                  <span>Publicar mi Primera Propiedad</span>
                </button>
              </div>
            ) : (
              /* Grid de propiedades */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inmuebles.map((inm) => {
                  const badge = getEstadoBadge(inm.estado)
                  const BadgeIcon = badge.icon
                  return (
                    <div key={inm.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.07] transition-all group">
                      {/* Imagen */}
                      <div className="h-40 bg-slate-800 relative overflow-hidden">
                        {inm.imagenUrl ? (
                          <img src={inm.imagenUrl} alt={inm.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 size={40} className="text-gray-700" />
                          </div>
                        )}
                        {/* Badge de estado */}
                        <div className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md ${badge.color}`}>
                          <BadgeIcon size={11} />
                          {badge.label}
                        </div>
                      </div>
                      {/* Info */}
                      <div className="p-4">
                        <h4 className="font-bold text-white text-sm line-clamp-1 mb-1">{inm.titulo || inm.codigo}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                          <MapPin size={12} />
                          <span>{inm.ciudad}{inm.sector ? `, ${inm.sector}` : ""}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-black text-emerald-400">${inm.precio.toLocaleString()}</span>
                          <div className="flex items-center gap-3 text-[11px] text-gray-500">
                            <span className="flex items-center gap-1"><Eye size={12} />{inm.vistas}</span>
                            <span className="flex items-center gap-1"><MessageSquare size={12} />{inm.consultas}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================== */}
        {/* TAB: PREGUNTAS                 */}
        {/* ============================== */}
        {activeTab === "preguntas" && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white">Preguntas de Interesados</h2>

            {preguntas.length === 0 ? (
              <div className="text-center py-16 bg-white/5 border border-white/10 rounded-3xl">
                <div className="p-4 bg-blue-500/10 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-5">
                  <MessageSquare size={36} className="text-blue-400" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Sin preguntas por ahora</h3>
                <p className="text-sm text-gray-400 max-w-md mx-auto">
                  Cuando un cliente haga una pregunta sobre alguna de tus propiedades,
                  aparecerá aquí y recibirás una notificación para que puedas responderla.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {preguntas.map((p) => (
                  <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-xs font-bold text-emerald-400">{p.inmuebleTitulo}</span>
                        <p className="text-sm text-white mt-1 font-medium">&quot;{p.pregunta}&quot;</p>
                        <p className="text-[11px] text-gray-500 mt-1">— {p.nombreCliente} · {new Date(p.fecha).toLocaleDateString()}</p>
                      </div>
                      {!p.respondida && (
                        <span className="px-2 py-1 bg-amber-500/15 text-amber-400 text-[10px] font-bold rounded-full border border-amber-500/30">
                          Pendiente
                        </span>
                      )}
                    </div>
                    {p.respondida && p.respuesta && (
                      <div className="mt-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                        <p className="text-xs text-emerald-300">
                          <span className="font-bold">Tu respuesta: </span>{p.respuesta}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================== */}
        {/* TAB: CONFIGURACIÓN             */}
        {/* ============================== */}
        {activeTab === "config" && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-white">Mi Información</h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Nombre</label>
                  <div className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white">
                    {owner.nombre} {owner.apellido}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Cédula</label>
                  <div className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white">
                    {owner.cedula || "—"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Correo</label>
                  <div className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white">
                    {owner.email}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Teléfono</label>
                  <div className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white">
                    {owner.telefono || "—"}
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-white/10">
                <p className="text-[11px] text-gray-500">
                  Para modificar tus datos, comunícate con SARA al +593 98 180 4023 o envía un correo a soporte@sara-constructora.com.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
