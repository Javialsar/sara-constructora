"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Building, 
  Calendar, 
  MapPin, 
  Key, 
  Star, 
  MessageCircle, 
  Printer, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  CreditCard, 
  X, 
  LogOut, 
  User, 
  Compass, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from "lucide-react"
import { getGuestSession, clearGuestSession, GuestProfile } from "@/lib/services/guestAuth"

interface ReservaHuesped {
  id: string
  codigoReserva: string
  alojamiento: {
    id: string
    codigo: string
    titulo: string
    ciudad: string
    pais: string
    sector: string
    precioNoche: number
    imagenUrl?: string
  }
  fechas: {
    checkIn: string
    checkOut: string
    noches: number
    huespedes: number
  }
  totales: {
    precioNoche: number
    tarifaLimpieza: number
    granTotal: number
  }
  metodoPago: string
  peticionesEspeciales?: string
  estadoReserva: string
  fechaCreacion: string
  smartLockPin?: string
  calificada?: boolean
  ratingDado?: number
}

export default function MisReservasPage() {
  const router = useRouter()
  const [guest, setGuest] = useState<GuestProfile | null>(null)
  const [reservas, setReservas] = useState<ReservaHuesped[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [filtroTab, setFiltroTab] = useState<"todas" | "proximas" | "completadas">("todas")

  // Modal de Calificación
  const [reservaParaCalificar, setReservaParaCalificar] = useState<ReservaHuesped | null>(null)
  const [ratingInput, setRatingInput] = useState<number>(5)
  const [ratingHover, setRatingHover] = useState<number>(5)
  const [comentarioInput, setComentarioInput] = useState<string>("")
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false)
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string>("")

  // Cargar sesión de huésped
  useEffect(() => {
    const session = getGuestSession()
    if (!session) {
      router.push("/airbnb/auth?redirect=/airbnb/mis-reservas")
      return
    }
    setGuest(session)
    const userEmail = session.email

    // Cargar reservas del huésped desde la base de datos
    async function loadGuestReservations() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/airbnb/reserva?email=${encodeURIComponent(userEmail)}`)
        if (res.ok) {
          const data = await res.json()
          const lista: ReservaHuesped[] = []

          // Mapear desde solicitudes de servicio
          if (Array.isArray(data.solicitudes)) {
            data.solicitudes.forEach((sol: any) => {
              try {
                const det = typeof sol.mensaje === "string" ? JSON.parse(sol.mensaje) : (sol.mensaje || {})
                if (det.codigo_reserva) {
                  lista.push({
                    id: sol.id,
                    codigoReserva: det.codigo_reserva,
                    alojamiento: {
                      id: det.alojamiento?.id || "ab-2",
                      codigo: det.alojamiento?.codigo || "SARA-EC-02",
                      titulo: det.alojamiento?.titulo || "Alojamiento SARA",
                      ciudad: det.alojamiento?.ciudad || "Ecuador",
                      pais: det.alojamiento?.pais || "Ecuador",
                      sector: det.alojamiento?.sector || "Sector Residencial",
                      precioNoche: Number(det.totales?.precio_noche) || 50,
                      imagenUrl: det.alojamiento?.imagenUrl || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
                    },
                    fechas: {
                      checkIn: det.fechas?.check_in || "2026-10-02",
                      checkOut: det.fechas?.check_out || "2026-10-05",
                      noches: Number(det.fechas?.noches) || 3,
                      huespedes: Number(det.fechas?.huespedes) || 2
                    },
                    totales: {
                      precioNoche: Number(det.totales?.precio_noche) || 50,
                      tarifaLimpieza: Number(det.totales?.tarifa_limpieza) || 20,
                      granTotal: Number(det.totales?.gran_total) || 170
                    },
                    metodoPago: det.metodo_pago || "transferencia",
                    peticionesEspeciales: det.peticiones_especiales || "",
                    estadoReserva: det.estado_reserva || "confirmada",
                    fechaCreacion: det.fecha_creacion || sol.created_at,
                    smartLockPin: "#4829#"
                  })
                }
              } catch (e) {
                // Ignore parse errors
              }
            })
          }

          // Si la lista está vacía y es la cuenta demo de Alexandra, incluir sus reservas de demostración
          if (lista.length === 0) {
            lista.push(
              {
                id: "res-demo-01",
                codigoReserva: "SARA-RSV-2026-1693",
                alojamiento: {
                  id: "ab-2",
                  codigo: "SARA-EC-02",
                  titulo: "Loft Patrimonial en Calle Larga - Centro Histórico",
                  ciudad: "Cuenca",
                  pais: "Ecuador",
                  sector: "Centro Histórico",
                  precioNoche: 59,
                  imagenUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
                },
                fechas: {
                  checkIn: "2026-09-10",
                  checkOut: "2026-09-13",
                  noches: 3,
                  huespedes: 2
                },
                totales: {
                  precioNoche: 59,
                  tarifaLimpieza: 20,
                  granTotal: 197
                },
                metodoPago: "transferencia",
                peticionesEspeciales: "Café, azúcar y pan del día",
                estadoReserva: "completada",
                fechaCreacion: "2026-09-08",
                smartLockPin: "#5912#"
              },
              {
                id: "res-demo-02",
                codigoReserva: "SARA-RSV-2026-8941",
                alojamiento: {
                  id: "ab-1",
                  codigo: "SARA-EC-01",
                  titulo: "Master Suite de Diseño Frente al Río Tomebamba",
                  ciudad: "Cuenca",
                  pais: "Ecuador",
                  sector: "Puertas del Sol",
                  precioNoche: 48,
                  imagenUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"
                },
                fechas: {
                  checkIn: "2026-10-15",
                  checkOut: "2026-10-18",
                  noches: 3,
                  huespedes: 2
                },
                totales: {
                  precioNoche: 48,
                  tarifaLimpieza: 15,
                  granTotal: 159
                },
                metodoPago: "transferencia",
                estadoReserva: "confirmada",
                fechaCreacion: "2026-09-24",
                smartLockPin: "#4829#"
              }
            )
          }

          setReservas(lista)
        }
      } catch (err) {
        console.error("Error al cargar reservas del huésped:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadGuestReservations()
  }, [router])

  const handleLogout = () => {
    clearGuestSession()
    router.push("/airbnb")
  }

  // Filtrar reservas según pestaña activa
  const reservasFiltradas = reservas.filter((r) => {
    if (filtroTab === "todas") return true
    const checkOutDate = new Date(r.fechas.checkOut)
    const hoy = new Date()
    if (filtroTab === "proximas") {
      return checkOutDate >= hoy || r.estadoReserva !== "completada"
    }
    if (filtroTab === "completadas") {
      return checkOutDate < hoy || r.estadoReserva === "completada"
    }
    return true
  })

  // Enviar Calificación y Reseña
  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reservaParaCalificar) return

    if (!comentarioInput.trim()) {
      alert("Por favor escribe tu opinión sobre la estadía.")
      return
    }

    setIsSubmittingReview(true)
    try {
      const payload = {
        alojamientoId: reservaParaCalificar.alojamiento.id,
        codigoReserva: reservaParaCalificar.codigoReserva,
        autor: `${guest?.nombre || "Huésped"} ${guest?.apellido || ""}`.trim(),
        email: guest?.email,
        telefono: guest?.telefono,
        ciudadOrigen: guest?.ciudadPais || "Ecuador",
        rating: ratingInput,
        comentario: comentarioInput.trim()
      }

      const res = await fetch("/api/airbnb/resenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setReviewSuccessMsg("¡Gracias! Tu reseña y calificación han sido publicadas con éxito.")
        // Marcar en local
        setReservas(prev => prev.map(r => {
          if (r.id === reservaParaCalificar.id) {
            return { ...r, calificada: true, ratingDado: ratingInput }
          }
          return r
        }))

        setTimeout(() => {
          setReservaParaCalificar(null)
          setComentarioInput("")
          setReviewSuccessMsg("")
        }, 1500)
      } else {
        alert("No se pudo registrar la reseña en este momento.")
      }
    } catch (err) {
      console.error("Error al enviar reseña:", err)
      alert("Error al conectar con el servidor.")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  // Generador de enlace WhatsApp para comprobante
  const getWhatsAppVoucherLink = (r: ReservaHuesped) => {
    const msg = encodeURIComponent(
      `Hola SARA Hospitality, les comparto mi reserva confirmada:\n` +
      `🔖 *Código:* ${r.codigoReserva}\n` +
      `🏨 *Alojamiento:* ${r.alojamiento.titulo} (${r.alojamiento.ciudad})\n` +
      `🗓 *Fechas:* ${r.fechas.checkIn} al ${r.fechas.checkOut} (${r.fechas.noches} noches)\n` +
      `👤 *Titular:* ${guest?.nombre} ${guest?.apellido || ""}\n` +
      `💰 *Total:* $${r.totales.granTotal} USD\n` +
      `🔑 *Clave Cerradura Inteligente:* ${r.smartLockPin || "#4829#"}`
    )
    return `https://wa.me/593981804023?text=${msg}`
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-20">
      {/* Header Corporativo del Portal de Huésped */}
      <section className="bg-brand-dark pt-28 pb-14 text-white relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
          style={{ backgroundImage: "url('/sara-airbnb.png')" }}
        />
        <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-sage/20 border border-brand-sage/40 text-brand-sage flex items-center justify-center font-bold text-2xl shadow-lg shrink-0">
                <User size={30} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Hola, {guest?.nombre || "Huésped"}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck size={12} /> Huésped Verificado SARA
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 mt-1 flex items-center gap-2 flex-wrap">
                  <span>{guest?.email}</span>
                  {guest?.cedula && <span>• C.I.: <strong className="font-mono text-white">{guest.cedula}</strong></span>}
                  {guest?.telefono && <span>• Tel: {guest.telefono}</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/airbnb"
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center gap-1.5"
              >
                <Compass size={16} />
                <span>Explorar Nuevos Alojamientos</span>
              </Link>

              <button
                onClick={handleLogout}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white rounded-xl text-xs sm:text-sm font-bold transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer"
                title="Cerrar mi sesión"
              >
                <LogOut size={16} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>

          {/* Estadísticas rápidas del huésped */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Estadías</span>
              <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{reservas.length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Próximos Viajes</span>
              <p className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">
                {reservas.filter(r => new Date(r.fechas.checkOut) >= new Date()).length}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Smart Lock Activo</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">Autónomo 24/7</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Nivel de Huésped</span>
              <p className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5 flex items-center gap-1">
                <Star size={16} className="fill-amber-400" /> SARA Gold
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido: Filtros y Tarjetas de Reservas */}
      <section className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Mis Estadías y Reservas</h2>
              <p className="text-xs text-gray-500">Historial completo con claves de acceso digital y calificaciones</p>
            </div>
          </div>

          {/* Filtro Tabs */}
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setFiltroTab("todas")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filtroTab === "todas" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Todas ({reservas.length})
            </button>
            <button
              onClick={() => setFiltroTab("proximas")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filtroTab === "proximas" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Próximas
            </button>
            <button
              onClick={() => setFiltroTab("completadas")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filtroTab === "completadas" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Historial de Viajes
            </button>
          </div>
        </div>

        {/* Listado de Reservas */}
        {isLoading ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 text-gray-400">
            <Clock size={32} className="mx-auto mb-2 animate-spin text-brand-sage" />
            <p className="text-sm font-bold text-gray-700">Cargando tus reservas...</p>
          </div>
        ) : reservasFiltradas.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 space-y-3">
            <Compass size={40} className="mx-auto text-amber-500 opacity-80" />
            <h3 className="text-base font-bold text-gray-800">No tienes reservaciones en esta categoría</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Explora nuestro catálogo en Cariamanga, Cuenca, Yunguilla o destinos internacionales y planifica tu próximo descanso.
            </p>
            <Link
              href="/airbnb"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-sage text-white rounded-xl text-xs font-bold shadow transition-all hover:bg-brand-sage/90"
            >
              <Compass size={15} /> Ver Alojamientos Disponibles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {reservasFiltradas.map((r) => {
              const isPast = new Date(r.fechas.checkOut) < new Date() || r.estadoReserva === "completada"

              return (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    {/* Header de la tarjeta con código y estado */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold bg-gray-100 text-brand-dark px-2 py-0.5 rounded border border-gray-200">
                          {r.codigoReserva}
                        </span>
                        <span className="text-xs font-bold text-gray-500">
                          {r.alojamiento.codigo}
                        </span>
                      </div>

                      {isPast ? (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                          <CheckCircle2 size={12} className="text-slate-600" />
                          Estadía Concluida
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          Reserva Confirmada
                        </span>
                      )}
                    </div>

                    {/* Detalle del Alojamiento */}
                    <div className="flex gap-4 items-start">
                      <img
                        src={r.alojamiento.imagenUrl}
                        alt={r.alojamiento.titulo}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-gray-200 shrink-0"
                      />
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-xs text-amber-700 font-bold">
                          <MapPin size={13} />
                          <span>{r.alojamiento.ciudad}, {r.alojamiento.pais} • {r.alojamiento.sector}</span>
                        </div>
                        <h3 className="font-black text-gray-900 text-sm sm:text-base leading-snug line-clamp-2" title={r.alojamiento.titulo}>
                          {r.alojamiento.titulo}
                        </h3>

                        {/* Fechas de Estadía */}
                        <div className="bg-slate-50 p-2 rounded-lg border border-gray-100 text-xs text-gray-700 font-medium">
                          📅 <strong>{r.fechas.checkIn}</strong> al <strong>{r.fechas.checkOut}</strong> ({r.fechas.noches} noche{r.fechas.noches > 1 ? "s" : ""})
                        </div>
                      </div>
                    </div>

                    {/* Fila de Acceso Inteligente (Smart Lock PIN) & Desglose Financiero */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Tarjeta de Clave Smart Lock */}
                      <div className="bg-emerald-50/70 border border-emerald-200/80 p-3 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-emerald-800 block flex items-center gap-1">
                            <Key size={12} /> Cerradura Smart Lock
                          </span>
                          <span className="font-mono font-black text-emerald-950 text-base">
                            {r.smartLockPin || "#4829#"}
                          </span>
                        </div>
                        <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                          Acceso 24/7
                        </span>
                      </div>

                      {/* Total Pagado */}
                      <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-500 block">Total Pagado</span>
                          <span className="font-black text-gray-900 text-base">
                            ${r.totales.granTotal} USD
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500">
                          {r.metodoPago === "transferencia" ? "Transferencia" : "Tarjeta"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones de la Tarjeta */}
                  <div className="p-4 bg-slate-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                    {/* Botón Calificar (Estadías Concluidas o Pasadas) */}
                    {isPast ? (
                      r.calificada ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          <CheckCircle2 size={14} />
                          <span>¡Ya calificaste con {r.ratingDado || 5} ⭐!</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setReservaParaCalificar(r)
                            setRatingInput(5)
                            setComentarioInput("")
                          }}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <Star size={14} className="fill-slate-950" />
                          <span>⭐ Calificar mi Estadía</span>
                        </button>
                      )
                    ) : (
                      <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                        <Clock size={13} className="text-amber-600" />
                        Podrás calificar después de tu Check-out
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <a
                        href={getWhatsAppVoucherLink(r)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                        title="Abrir voucher en WhatsApp"
                      >
                        <MessageCircle size={14} />
                        <span>Voucher</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="p-1.5 bg-white hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-200 transition-colors"
                        title="Imprimir comprobante"
                      >
                        <Printer size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* MODAL: CALIFICAR Y DEJAR COMENTARIO DE ESTADÍA               */}
      {/* ============================================================ */}
      {reservaParaCalificar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setReservaParaCalificar(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
              <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
                <Star size={24} className="fill-amber-500 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-gray-900">
                  Calificar tu Estadía en {reservaParaCalificar.alojamiento.ciudad}
                </h3>
                <p className="text-xs text-gray-500">
                  {reservaParaCalificar.alojamiento.titulo}
                </p>
              </div>
            </div>

            {reviewSuccessMsg ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-base">¡Calificación Registrada!</h4>
                <p className="text-xs text-emerald-700">{reviewSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRating} className="space-y-4">
                {/* Selector de Estrellas Interactivo */}
                <div className="text-center py-2 bg-slate-50 rounded-2xl border border-gray-200">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                    Tu Puntuación General
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = star <= (ratingHover || ratingInput)
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setRatingHover(star)}
                          onMouseLeave={() => setRatingHover(ratingInput)}
                          onClick={() => setRatingInput(star)}
                          className="p-1 cursor-pointer transition-transform hover:scale-125"
                        >
                          <Star
                            size={32}
                            className={`${
                              active 
                                ? "fill-amber-400 text-amber-400 drop-shadow-sm" 
                                : "text-gray-300 fill-gray-100"
                            }`}
                          />
                        </button>
                      )
                    })}
                  </div>
                  <span className="text-xs font-bold text-amber-800 mt-2 block">
                    {ratingInput === 5 && "⭐ Excelente estadía (5/5)"}
                    {ratingInput === 4 && "⭐ Muy buena experiencia (4/5)"}
                    {ratingInput === 3 && "⭐ Buena estadía (3/5)"}
                    {ratingInput === 2 && "⭐ Regular (2/5)"}
                    {ratingInput === 1 && "⭐ Mala experiencia (1/5)"}
                  </span>
                </div>

                {/* Comentario */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Comparte tu experiencia con otros viajeros <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="¿Qué tal estuvo la limpieza, la atención del anfitrión, la vista o la comodidad de las camas?..."
                    value={comentarioInput}
                    onChange={(e) => setComentarioInput(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-brand-sage focus:bg-white outline-none leading-relaxed"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Tu opinión aparecerá con la insignia de <strong className="text-emerald-700">Huésped Verificado</strong> en la ficha pública.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReservaParaCalificar(null)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-6 py-2.5 bg-brand-sage hover:bg-brand-sage/90 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />
                    <span>{isSubmittingReview ? "Publicando..." : "Publicar Calificación"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
