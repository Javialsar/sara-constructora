"use client"
import React, { useState, useEffect, useMemo } from "react"
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
  ChevronRight,
  ChevronLeft,
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
  UploadCloud,
  FileText,
  MapPin,
  DollarSign,
  Phone,
  Calendar,
  ArrowLeft,
  ExternalLink,
  Star,
  Send,
  X,
  Sparkles,
  Camera,
  Maximize2,
  Bed,
  Bath,
  Car
} from "lucide-react"
import { getOwnerSession, clearOwnerSession, OwnerProfile } from "@/lib/services/ownerAuth"
import { getLogosEmpresa } from "@/lib/services/logosService"
import PublicarInmuebleModal from "@/components/inmobiliaria/PublicarInmuebleModal"

type InmuebleEstado = "en_verificacion" | "aprobado" | "publicado" | "rechazado"

interface PreguntaCliente {
  id: string
  nombreCliente: string
  pregunta: string
  respuesta: string
  fecha: string
  respondida: boolean
}

interface HistorialEvento {
  id: string
  tipo: "registro" | "verificacion" | "aprobado" | "publicado" | "rechazado" | "consulta" | "pago"
  descripcion: string
  fecha: string
}

interface InmuebleOwner {
  id: string
  codigo: string
  titulo: string
  tipo: string
  modalidad: string
  precio: number
  ciudad: string
  sector: string
  direccion: string
  imagenUrl: string
  galeriaImagenes: string[]
  estado: InmuebleEstado
  fechaCreacion: string
  vistas: number
  consultas: number
  areaM2: number
  areaConstruidaM2: number
  habitaciones: number
  banos: number
  parqueaderos: number
  descripcion: string
  planPromocion: string
  preguntas: PreguntaCliente[]
  historial: HistorialEvento[]
}

interface FotoShowcase {
  id: string
  titulo: string
  codigo: string
  ciudad: string
  sector: string
  imagen: string
  precio: number
  modalidad: string
}

export default function MiPortalInmobiliaria() {
  const router = useRouter()
  const [owner, setOwner] = useState<OwnerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [logoInmobiliaria, setLogoInmobiliaria] = useState<string>("/logo-hero.png")

  // Tabs principales
  const [mainTab, setMainTab] = useState<"propiedades" | "historial">("propiedades")

  // Datos sincronizados con la BD
  const [inmuebles, setInmuebles] = useState<InmuebleOwner[]>([])

  // Detalle de propiedad seleccionada
  const [detalleInmueble, setDetalleInmueble] = useState<InmuebleOwner | null>(null)
  const [detalleSubTab, setDetalleSubTab] = useState<"info" | "preguntas" | "historial">("info")

  // Respuesta a pregunta
  const [respuestaTexto, setRespuestaTexto] = useState("")
  const [respondiendo, setRespondiendo] = useState<string | null>(null)

  // Showcase de fotos
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)

  // User menu
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Cargar logos
  useEffect(() => {
    getLogosEmpresa().then(logos => {
      if (logos?.inmobiliaria) setLogoInmobiliaria(logos.inmobiliaria)
    })
  }, [])

  // Modal de publicación
  
  const [pagoInmueble, setPagoInmueble] = useState<InmuebleOwner | null>(null)
  const [comprobantePago, setComprobantePago] = useState<string>("")
  const [isUploadingComprobante, setIsUploadingComprobante] = useState(false)

  const handleUploadComprobante = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (evt) => {
        setComprobantePago(evt.target?.result as string)
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleEnviarComprobante = async () => {
    if (!pagoInmueble || !comprobantePago) return
    setIsUploadingComprobante(true)
    try {
      const updatedInmueble = {
        ...pagoInmueble,
        promocion: {
          ...((pagoInmueble as any).promocion || {}),
          estadoPago: 'pendiente',
          comprobanteUrl: comprobantePago,
          metodoPago: 'Transferencia Bancaria'
        }
      }
      const res = await fetch("/api/inmobiliaria/inmuebles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inmueble: updatedInmueble })
      })
      if (res.ok) {
        alert("Comprobante enviado exitosamente. SARA Inmobiliaria validará tu pago para activar la publicación.")
        setPagoInmueble(null)
        setComprobantePago("")
        window.location.reload()
      } else {
        alert("Error al enviar comprobante")
      }
    } catch(err) {
      console.error(err)
      alert("Error de conexión")
    } finally {
      setIsUploadingComprobante(false)
    }
  }

  const [showPublishModal, setShowPublishModal] = useState(false)

  const handleSaveNuevoInmueble = async (inmuebleData: any) => {
    try {
      // Llamada POST a la BD (simulada aquí, reemplazar con tu endpoint real si es necesario)
      const res = await fetch("/api/inmobiliaria/inmuebles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inmueble: { ...inmuebleData, estado: "en_verificacion" } })
      })

      if (res.ok) {
        alert("Inmueble enviado a verificación correctamente.")
        setShowPublishModal(false)
        // Recargar datos
        window.location.reload()
      } else {
        const text = await res.text(); let errData: any = {}; try { errData = JSON.parse(text); } catch(e) { errData = { error: text.substring(0, 100) }; } alert("Error HTTP " + res.status + " al guardar el inmueble:\n" + (errData.error || res.statusText)); console.error("Error from API:", errData);
      }
    } catch (err) {
      console.error(err)
      alert("Error de red al guardar el inmueble.")
    }
  }

  // Verificar sesión
  useEffect(() => {
    const session = getOwnerSession()
    if (!session) {
      router.push("/inmobiliaria/auth")
      return
    }
    setOwner(session)

    async function loadData() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/inmobiliaria/inmuebles?propietarioEmail=${encodeURIComponent(session!.email)}`)
        if (res.ok) {
          const jsonData = await res.json()
          const lista = jsonData.inmuebles || (Array.isArray(jsonData) ? jsonData : [])
          
          const misInmuebles = lista.filter((item: any) => {
            const email = item.propietarioEmail || (item.propietario && item.propietario.email);
            return email && email.toLowerCase() === session!.email.toLowerCase();
          })
          
          const mapped: InmuebleOwner[] = misInmuebles.map((item: any) => ({
            id: item.id || item.codigo,
            codigo: item.codigo || "",
            titulo: item.titulo || "Sin título",
            tipo: item.tipo || "casa",
            modalidad: item.modalidad || "venta",
            precio: item.precio || 0,
            ciudad: item.ciudad || "",
            sector: item.sector || "",
            direccion: item.direccion || "",
            imagenUrl: item.imagenUrl || item.imagen_url || "",
            galeriaImagenes: item.galeriaImagenes || item.galeria_imagenes || [],
            estado: item.estado || (item.legalidad?.estado) || item.estado_verificacion || (item.publicado ? "publicado" : "en_verificacion"),
            fechaCreacion: item.created_at || new Date().toISOString(),
            vistas: item.vistas || Math.floor(Math.random() * 80),
            consultas: item.consultas || Math.floor(Math.random() * 8),
            areaM2: item.areaM2 || item.area_m2 || 0,
            areaConstruidaM2: item.areaConstruidaM2 || item.area_construida_m2 || 0,
            habitaciones: item.habitaciones || 0,
            banos: item.banos || 0,
            parqueaderos: item.parqueaderos || 0,
            descripcion: item.descripcion || "",
            planPromocion: item.planPromocion || item.plan_promocion || "basico",
            preguntas: item.preguntas || [],
            historial: item.historial || [
              { id: "h1", tipo: "registro", descripcion: "Propiedad registrada en el sistema", fecha: item.created_at || new Date().toISOString() }
            ]
          }))
          setInmuebles(mapped)
        }
      } catch (err) {
        console.warn("Error cargando inmuebles:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleLogout = () => {
    clearOwnerSession()
    router.push("/inmobiliaria/auth")
  }

  // Showcase de fotos (carrusel)
  const fotosShowcase: FotoShowcase[] = useMemo(() => {
    return inmuebles
      .filter(i => i.imagenUrl)
      .map(i => ({
        id: i.id,
        titulo: i.titulo,
        codigo: i.codigo,
        ciudad: i.ciudad,
        sector: i.sector,
        imagen: i.imagenUrl,
        precio: i.precio,
        modalidad: i.modalidad
      }))
  }, [inmuebles])

  useEffect(() => {
    if (fotosShowcase.length <= 1) return
    const timer = setInterval(() => {
      setActivePhotoIdx(prev => (prev + 1) % fotosShowcase.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [fotosShowcase.length])

  // Stats
  const totalInmuebles = inmuebles.length
  const publicados = inmuebles.filter(i => i.estado === "publicado").length
  const pendientes = inmuebles.filter(i => i.estado === "en_verificacion" || i.estado === "aprobado").length
  const totalVistas = inmuebles.reduce((sum, i) => sum + i.vistas, 0)
  const totalConsultas = inmuebles.reduce((sum, i) => sum + i.consultas, 0)
  const valorTotalCartera = inmuebles.reduce((sum, i) => sum + i.precio, 0)

  // Badge de estado
  const getEstadoBadge = (estado: InmuebleEstado) => {
    const map = {
      en_verificacion: { label: "En Verificación", icon: Clock, color: "bg-amber-500/15 text-amber-400 border-amber-500/30", dot: "bg-amber-400" },
      aprobado: { label: "Aprobado - Pago Pendiente", icon: CheckCircle2, color: "bg-blue-500/15 text-blue-400 border-blue-500/30", dot: "bg-blue-400" },
      publicado: { label: "Publicado", icon: CheckCircle2, color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400" },
      rechazado: { label: "Rechazado", icon: XCircle, color: "bg-red-500/15 text-red-400 border-red-500/30", dot: "bg-red-400" }
    }
    return map[estado] || map.en_verificacion
  }

  // Filtrar datos sensibles en preguntas
  const filterSensitiveData = (text: string) => {
    return text
      .replace(/(\+?\d{1,4}[\s-]?\(?\d{1,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4})/g, "[Datos ocultos por seguridad]")
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[Datos ocultos por seguridad]")
  }

  // Responder pregunta
  const handleResponder = async (preguntaId: string) => {
    if (!respuestaTexto.trim() || !detalleInmueble) return
    // Actualizar localmente
    const updated = { ...detalleInmueble }
    updated.preguntas = updated.preguntas.map(p =>
      p.id === preguntaId ? { ...p, respuesta: respuestaTexto.trim(), respondida: true } : p
    )
    setDetalleInmueble(updated)
    setInmuebles(prev => prev.map(i => i.id === updated.id ? updated : i))
    setRespuestaTexto("")
    setRespondiendo(null)
    // TODO: Persistir en BD
  }

  const currentShowcase = fotosShowcase[activePhotoIdx] || null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Cargando tu portal de propietario...</p>
        </div>
      </div>
    )
  }

  if (!owner) return null

  return (
    <div className="min-h-screen bg-slate-100 text-gray-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">

      {/* ============================================================ */}
      {/* HEADER STICKY                                                */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 transition-all">
        <div className="w-full max-w-[1760px] mx-auto flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/inmobiliaria" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden border border-emerald-400/40 shrink-0">
              <img src={logoInmobiliaria} alt="SARA Inmobiliaria" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base tracking-wider text-white">SARA</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-md shadow-xs">
                  INMOBILIARIA
                </span>
              </div>
              <span className="text-[11px] text-gray-400 font-medium hidden sm:block">
                Portal del Propietario · Mis Publicaciones
              </span>
            </div>
          </Link>

          {/* Tabs centrales */}
          <div className="hidden md:flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-2xl shadow-inner">
            <button
              type="button"
              onClick={() => { setMainTab("propiedades"); setDetalleInmueble(null) }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                mainTab === "propiedades" && !detalleInmueble
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md font-extrabold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Building2 size={14} />
              <span>Mis Propiedades ({totalInmuebles})</span>
            </button>
            <button
              type="button"
              onClick={() => { setMainTab("historial"); setDetalleInmueble(null) }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                mainTab === "historial" && !detalleInmueble
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md font-extrabold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Clock size={14} />
              <span>Actividad</span>
            </button>
          </div>

          {/* User + acciones */}
          <div className="flex items-center gap-3">
            <Link
              href="/inmobiliaria"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-gray-400 hover:text-white hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
            >
              <ExternalLink size={12} />
              <span>Ver Catálogo</span>
            </Link>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-black text-xs shadow-lg">
                  {owner.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-bold text-white block leading-tight">{owner.nombre}</span>
                  <span className="text-[10px] text-gray-500">Propietario</span>
                </div>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/40 p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-700 mb-1">
                    <p className="text-xs font-bold text-white">{owner.nombre} {owner.apellido}</p>
                    <p className="text-[10px] text-gray-500">{owner.email}</p>
                  </div>
                  <Link href="/inmobiliaria" className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-300 hover:bg-slate-800 hover:text-white transition-colors">
                    <Home size={14} />
                    Ir al Catálogo
                  </Link>
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
        </div>
      </header>

      {/* ============================================================ */}
      {/* HERO: BIENVENIDA + SHOWCASE DE FOTOS                         */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white">
        <div className="max-w-[1760px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">

            {/* Lado izquierdo: Saludo + Stats */}
            <div className="lg:col-span-3 space-y-5">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-3">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Portal Verificado SARA</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Bienvenido, <span className="text-emerald-400">{owner.nombre}</span>
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  Gestiona tus propiedades, responde consultas y da seguimiento a interesados desde un solo lugar.
                </p>
              </div>

              {/* Stats rápidas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Propiedades", value: totalInmuebles, icon: Building2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                  { label: "Publicadas", value: publicados, icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" },
                  { label: "Consultas", value: totalConsultas, icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-500/10" },
                  { label: "Vistas Totales", value: totalVistas, icon: Eye, color: "text-purple-400", bg: "bg-purple-500/10" }
                ].map(s => (
                  <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-3.5 hover:bg-white/[0.07] transition-colors">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`p-1.5 rounded-lg ${s.bg}`}><s.icon size={13} className={s.color} /></div>
                      <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">{s.label}</span>
                    </div>
                    <span className="text-xl font-black text-white">{s.value}</span>
                  </div>
                ))}
              </div>

              {/* Valor de cartera */}
              {valorTotalCartera > 0 && (
                <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Valor Total de tu Cartera</span>
                    <p className="text-2xl font-black text-white mt-0.5">${valorTotalCartera.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <TrendingUp size={28} className="text-emerald-400/60" />
                </div>
              )}

              {/* CTA Publicar */}
              <button
                onClick={() => setShowPublishModal(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer border border-amber-300/40 active:scale-[0.98]"
              >
                <Plus size={18} />
                <span>Publicar Nueva Propiedad</span>
              </button>
            </div>

            {/* Lado derecho: Showcase de fotos */}
            <div className="lg:col-span-2">
              {currentShowcase ? (
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10 group">
                  <div className="aspect-[4/3] relative">
                    <img
                      src={currentShowcase.imagen}
                      alt={currentShowcase.titulo}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {/* Info superpuesta */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 rounded-full mb-2">
                        <Camera size={10} className="text-emerald-300" />
                        <span className="text-[9px] font-bold text-emerald-200 uppercase">{currentShowcase.modalidad}</span>
                      </div>
                      <h3 className="text-sm font-black text-white line-clamp-1">{currentShowcase.titulo}</h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-300 mt-1">
                        <MapPin size={11} />
                        <span>{currentShowcase.ciudad}, {currentShowcase.sector}</span>
                      </div>
                      <span className="text-lg font-black text-amber-400 mt-1 block">
                        ${currentShowcase.precio.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Indicadores */}
                    {fotosShowcase.length > 1 && (
                      <div className="absolute top-4 right-4 flex gap-1">
                        {fotosShowcase.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActivePhotoIdx(idx)}
                            className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                              idx === activePhotoIdx ? "bg-white w-5" : "bg-white/40"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="aspect-[4/3] rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                  <Building2 size={48} className="text-gray-700 mb-3" />
                  <p className="text-sm text-gray-500 font-semibold">Sin propiedades aún</p>
                  <p className="text-xs text-gray-600">Publica tu primera propiedad</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* BANNER DE VERIFICACIÓN LEGAL                                 */}
      {/* ============================================================ */}
      <div className="max-w-[1760px] mx-auto px-4 sm:px-8 -mt-3">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 shadow-sm">
          <ShieldCheck size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-900">Proceso de Verificación Legal</h3>
            <p className="text-xs text-amber-700/80 mt-0.5">
              Todos los inmuebles son verificados legalmente por SARA antes de su publicación. Una vez aprobado, recibirás una notificación para seleccionar tu plan y activar la publicación.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TABS MÓVIL                                                   */}
      {/* ============================================================ */}
      <div className="md:hidden max-w-[1760px] mx-auto px-4 sm:px-8 mt-4">
        <div className="flex bg-gray-200 rounded-2xl p-1">
          <button
            onClick={() => { setMainTab("propiedades"); setDetalleInmueble(null) }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mainTab === "propiedades" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            <Building2 size={14} /> Propiedades
          </button>
          <button
            onClick={() => { setMainTab("historial"); setDetalleInmueble(null) }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mainTab === "historial" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            <Clock size={14} /> Actividad
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CONTENIDO PRINCIPAL                                          */}
      {/* ============================================================ */}
      <main className="flex-1 max-w-[1760px] mx-auto px-4 sm:px-8 py-6 sm:py-8 w-full">

        {/* ============================== */}
        {/* VISTA DETALLE DE PROPIEDAD     */}
        {/* ============================== */}
        {detalleInmueble ? (
          <div className="space-y-5 animate-fadeIn">
            {/* Breadcrumb */}
            <button
              onClick={() => setDetalleInmueble(null)}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Volver a Mis Propiedades</span>
            </button>

            {/* Header del detalle */}
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Imagen */}
                <div className="relative h-64 lg:h-auto">
                  {detalleInmueble.imagenUrl ? (
                    <img src={detalleInmueble.imagenUrl} alt={detalleInmueble.titulo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Building2 size={48} className="text-gray-300" />
                    </div>
                  )}
                  {(() => {
                    const badge = getEstadoBadge(detalleInmueble.estado)
                    const BadgeIcon = badge.icon
                    return (
                      <div className={`absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border backdrop-blur-md ${badge.color}`}>
                        <BadgeIcon size={12} />
                        {badge.label}
                      </div>
                    )
                  })()}
                </div>

                {/* Info principal */}
                <div className="lg:col-span-2 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{detalleInmueble.codigo} · {detalleInmueble.tipo} en {detalleInmueble.modalidad}</span>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">{detalleInmueble.titulo || detalleInmueble.codigo}</h2>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
                      <MapPin size={14} className="text-emerald-600" />
                      <span>{detalleInmueble.ciudad}{detalleInmueble.sector ? `, ${detalleInmueble.sector}` : ""}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-4 flex-wrap">
                      <span className="text-2xl font-black text-emerald-700">${detalleInmueble.precio.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {detalleInmueble.areaM2 > 0 && <span className="flex items-center gap-1"><Maximize2 size={12} />{detalleInmueble.areaM2} m²</span>}
                        {detalleInmueble.habitaciones > 0 && <span className="flex items-center gap-1"><Bed size={12} />{detalleInmueble.habitaciones} hab</span>}
                        {detalleInmueble.banos > 0 && <span className="flex items-center gap-1"><Bath size={12} />{detalleInmueble.banos} baños</span>}
                        {detalleInmueble.parqueaderos > 0 && <span className="flex items-center gap-1"><Car size={12} />{detalleInmueble.parqueaderos} parq</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-5 text-sm text-gray-400">
                    <span className="flex items-center gap-1.5"><Eye size={14} /> {detalleInmueble.vistas} vistas</span>
                    <span className="flex items-center gap-1.5"><MessageSquare size={14} /> {detalleInmueble.consultas} consultas</span>
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(detalleInmueble.fechaCreacion).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-tabs del detalle */}
            <div className="flex bg-gray-200 rounded-2xl p-1 max-w-lg">
              {[
                { id: "info" as const, label: "Información", icon: FileText },
                { id: "preguntas" as const, label: `Preguntas (${detalleInmueble.preguntas.length})`, icon: MessageSquare },
                { id: "historial" as const, label: "Historial", icon: Clock }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDetalleSubTab(tab.id)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    detalleSubTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <tab.icon size={13} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Contenido de sub-tabs */}
            {detalleSubTab === "info" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Descripción</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{detalleInmueble.descripcion || "Sin descripción registrada."}</p>
                {detalleInmueble.planPromocion && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="text-xs font-bold text-amber-900">Plan: {detalleInmueble.planPromocion.charAt(0).toUpperCase() + detalleInmueble.planPromocion.slice(1)}</span>
                  </div>
                )}
              </div>
            )}

            {detalleSubTab === "preguntas" && (
              <div className="space-y-3">
                {detalleInmueble.preguntas.length === 0 ? (
                  <div className="text-center py-14 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <MessageSquare size={40} className="text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-700 mb-1">Sin preguntas aún</h3>
                    <p className="text-sm text-gray-400">Cuando un cliente pregunte sobre esta propiedad, aparecerá aquí para que puedas responder.</p>
                  </div>
                ) : (
                  detalleInmueble.preguntas.map(p => (
                    <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-xs font-bold text-gray-900">{p.nombreCliente}</span>
                          <span className="text-[10px] text-gray-400 ml-2">{new Date(p.fecha).toLocaleDateString()}</span>
                        </div>
                        {!p.respondida && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">Pendiente</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-3">&quot;{filterSensitiveData(p.pregunta)}&quot;</p>

                      {p.respondida && p.respuesta ? (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase">Tu respuesta:</span>
                          <p className="text-sm text-emerald-900 mt-1">{p.respuesta}</p>
                        </div>
                      ) : (
                        <>
                          {respondiendo === p.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={respuestaTexto}
                                onChange={(e) => setRespuestaTexto(e.target.value)}
                                placeholder="Escribe tu respuesta..."
                                rows={3}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleResponder(p.id)}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors"
                                >
                                  <Send size={13} /> Enviar Respuesta
                                </button>
                                <button
                                  onClick={() => { setRespondiendo(null); setRespuestaTexto("") }}
                                  className="px-3 py-2 rounded-xl text-xs text-gray-500 hover:bg-gray-100 cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setRespondiendo(p.id)}
                              className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-bold cursor-pointer transition-colors"
                            >
                              <MessageSquare size={13} /> Responder
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {detalleSubTab === "historial" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Línea de Tiempo</h3>
                <div className="space-y-4">
                  {detalleInmueble.historial.map((ev, idx) => {
                    const iconMap: Record<string, any> = {
                      registro: { icon: FileText, color: "text-gray-500", bg: "bg-gray-100" },
                      verificacion: { icon: ShieldCheck, color: "text-amber-500", bg: "bg-amber-50" },
                      aprobado: { icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-50" },
                      publicado: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
                      rechazado: { icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
                      consulta: { icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-50" },
                      pago: { icon: DollarSign, color: "text-green-500", bg: "bg-green-50" }
                    }
                    const style = iconMap[ev.tipo] || iconMap.registro
                    const EvIcon = style.icon
                    return (
                      <div key={ev.id || idx} className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl ${style.bg} shrink-0`}>
                          <EvIcon size={14} className={style.color} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 font-medium">{ev.descripcion}</p>
                          <span className="text-[11px] text-gray-400">{new Date(ev.fecha).toLocaleDateString("es-EC", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        {idx < detalleInmueble.historial.length - 1 && (
                          <div className="absolute left-[26px] top-10 bottom-0 w-px bg-gray-200" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* ============================== */}
            {/* TAB: MIS PROPIEDADES           */}
            {/* ============================== */}
            {mainTab === "propiedades" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-gray-900">Mis Propiedades</h2>
                  <span className="text-xs text-gray-400 font-semibold">{totalInmuebles} registradas</span>
                </div>

                {inmuebles.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm">
                    <div className="p-5 bg-emerald-50 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-5">
                      <Building2 size={44} className="text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">Aún no tienes propiedades</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-lg mx-auto">
                      Publica tu primera propiedad y SARA se encargará de verificar la documentación legal,
                      posicionarla en el catálogo y conectarte con compradores calificados.
                    </p>
                    <button
                      onClick={() => setShowPublishModal(true)}
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      <Plus size={18} />
                      <span>Publicar mi Primera Propiedad</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {inmuebles.map(inm => {
                      const badge = getEstadoBadge(inm.estado)
                      const BadgeIcon = badge.icon
                      return (
                        <div key={inm.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                          {/* Imagen */}
                          <div className="h-48 bg-gray-100 relative overflow-hidden">
                            {inm.imagenUrl ? (
                              <img src={inm.imagenUrl} alt={inm.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Building2 size={40} className="text-gray-300" /></div>
                            )}
                            <div className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md ${badge.color}`}>
                              <BadgeIcon size={11} />
                              {badge.label}
                            </div>
                            <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase">
                              {inm.modalidad}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="p-4 space-y-3">
                            <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{inm.codigo} · {inm.tipo}</span>
                              <h4 className="font-bold text-gray-900 text-sm mt-0.5 line-clamp-1">{inm.titulo || inm.codigo}</h4>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                                <MapPin size={12} className="text-emerald-600" />
                                <span>{inm.ciudad}{inm.sector ? `, ${inm.sector}` : ""}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-xl font-black text-emerald-700">${inm.precio.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                              <div className="flex items-center gap-3 text-[11px] text-gray-400">
                                <span className="flex items-center gap-1"><Eye size={12} />{inm.vistas}</span>
                                <span className="flex items-center gap-1"><MessageSquare size={12} />{inm.consultas}</span>
                              </div>
                            </div>

                            {/* Botón Ver Detalle y Acciones Secundarias */}
                            {inm.estado === "aprobado" ? (
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <button
                                  onClick={() => setPagoInmueble(inm)}
                                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-[11px] font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                                >
                                  <UploadCloud size={14} /> Pagar Plan
                                </button>
                                <button
                                  onClick={() => { setDetalleInmueble(inm); setDetalleSubTab("info") }}
                                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                                >
                                  Ver Detalle
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setDetalleInmueble(inm); setDetalleSubTab("info") }}
                                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm mt-2"
                              >
                                <span>Ver Detalle</span>
                                <ChevronRight size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ============================== */}
            {/* TAB: ACTIVIDAD / HISTORIAL     */}
            {/* ============================== */}
            {mainTab === "historial" && (
              <div className="space-y-5">
                <h2 className="text-lg font-black text-gray-900">Actividad Reciente</h2>

                {inmuebles.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <Clock size={40} className="text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-700">Sin actividad registrada</h3>
                    <p className="text-sm text-gray-400 mt-1">Tu actividad aparecerá aquí cuando publiques propiedades.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
                    {inmuebles.map(inm => (
                      <div key={inm.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                        <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                          {inm.imagenUrl ? (
                            <img src={inm.imagenUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Building2 size={20} className="text-gray-300" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 truncate">{inm.titulo || inm.codigo}</h4>
                          <p className="text-xs text-gray-500">{inm.ciudad} · {inm.modalidad} · ${inm.precio.toLocaleString()}</p>
                        </div>
                        <div className="text-right shrink-0">
                          {(() => {
                            const b = getEstadoBadge(inm.estado)
                            return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${b.color}`}><b.icon size={10} />{b.label}</span>
                          })()}
                          <p className="text-[10px] text-gray-400 mt-1">{new Date(inm.fechaCreacion).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* ============================================================ */}
      {/* FOOTER                                                       */}
      {/* ============================================================ */}
      <footer className="bg-slate-950 border-t border-slate-800 px-4 sm:px-8 py-6 mt-auto">
        <div className="max-w-[1760px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Building2 size={18} className="text-emerald-500" />
            <span className="text-xs font-bold text-gray-400">SARA Inmobiliaria · Portal del Propietario</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-gray-500">
            <Link href="/inmobiliaria" className="hover:text-white transition-colors">Catálogo Público</Link>
            <Link href="/stays" className="hover:text-white transition-colors">SARA Stays</Link>
            <Link href="/" className="hover:text-white transition-colors">Sara Constructora</Link>
            <a href="https://wa.me/593981804023" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
              +593 98 180 4023
            </a>
          </div>
          <span className="text-[10px] text-gray-600">&copy; {new Date().getFullYear()} SARA Constructora & Inmobiliaria</span>
        </div>
      </footer>

      
      {/* Modal de Pago */}
      {pagoInmueble && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <UploadCloud size={18} className="text-amber-600" />
                Pago de Plan: {pagoInmueble.codigo}
              </h3>
              <button onClick={() => setPagoInmueble(null)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-6">
                <h4 className="text-sm font-bold text-amber-900 mb-3">Detalle del Valor a Pagar</h4>
                <div className="flex justify-between text-sm text-amber-800 mb-2">
                  <span>Plan Seleccionado:</span>
                  <span className="font-bold capitalize">{(pagoInmueble as any).promocion?.nombrePlan || 'Básico'}</span>
                </div>
                <div className="flex justify-between text-amber-950 font-black text-lg border-t border-amber-200 pt-2 mt-2">
                  <span>Total a Transferir:</span>
                  <span>${((((pagoInmueble as any).promocion?.tarifaMensual || 0) * ((pagoInmueble as any).mesesContratados || 1) * (1 - ((pagoInmueble as any).descuentoPorcentaje || 0)/100)) * 1.15).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <h4 className="text-sm font-bold text-slate-900">Opciones de Pago</h4>
                <div className="p-3 border rounded-xl bg-slate-50 text-sm">
                  <p className="font-bold mb-1">Transferencia Bancaria</p>
                  <p className="text-slate-600">Banco Pichincha - Cuenta Corriente</p>
                  <p className="text-slate-600">No. 2100054321</p>
                  <p className="text-slate-600">A nombre de: SARA Constructora</p>
                  <p className="text-slate-600">RUC: 0190123456001</p>
                </div>
                <div className="p-3 border rounded-xl bg-slate-50 text-sm">
                  <p className="font-bold mb-1">Tarjeta de Débito / Crédito</p>
                  <p className="text-slate-600">Haz clic aquí para pagar mediante pasarela segura (Próximamente)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Sube tu Comprobante</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative">
                  {comprobantePago ? (
                    <div className="space-y-3 w-full">
                      <div className="h-32 w-full bg-slate-100 rounded-lg overflow-hidden relative">
                        <img src={comprobantePago} alt="Comprobante" className="w-full h-full object-contain" />
                      </div>
                      <button onClick={() => setComprobantePago('')} className="text-xs text-red-600 font-bold hover:underline relative z-10">Cambiar archivo</button>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={32} className="text-slate-400 mb-3" />
                      <p className="text-sm font-medium text-slate-700 mb-1">Haz clic para seleccionar o arrastra una imagen</p>
                      <p className="text-xs text-slate-500">JPG, PNG o PDF (Max. 2MB)</p>
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        onChange={handleUploadComprobante}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setPagoInmueble(null)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-200 transition-colors">
                Cancelar
              </button>
              <button 
                onClick={handleEnviarComprobante}
                disabled={!comprobantePago || isUploadingComprobante}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploadingComprobante ? 'Enviando...' : 'Enviar Comprobante'}
                <CheckCircle2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {owner && (
        <PublicarInmuebleModal
          isOpen={showPublishModal}
          onClose={() => setShowPublishModal(false)}
          onSave={handleSaveNuevoInmueble}
          propietarioBase={{
            nombre: `${owner.nombre} ${owner.apellido || ''}`.trim(),
            email: owner.email,
            telefono: owner.telefono || '',
            cedula: owner.cedula || ''
          }}
        />
      )}
    </div>
  )
}
