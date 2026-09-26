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
  ShieldCheck,
  DollarSign,
  TrendingUp,
  PlusCircle,
  MessageSquare,
  Award,
  Home,
  Check,
  Info
} from "lucide-react"
import { getGuestSession, clearGuestSession, GuestProfile } from "@/lib/services/guestAuth"
import RegistrarAlojamientoModal from "@/components/airbnb/RegistrarAlojamientoModal"

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

interface HospedajeRecibido {
  id: string
  codigoReserva: string
  huespedNombre: string
  huespedCiudad: string
  huespedPais: string
  huespedTelefono: string
  fechaCheckIn: string
  horaCheckIn: string
  fechaCheckOut: string
  horaCheckOut: string
  noches: number
  tiempoTotalHoras: number
  totalCobrado: number
  comisionSara: number
  gananciaNeta: number
  estadoPago: "liquidado" | "pendiente"
  metodoLiquidacion: string
}

interface ResenaRecibida {
  id: string
  autor: string
  ciudadOrigen: string
  pais: string
  rating: number
  fecha: string
  hora: string
  comentario: string
  verificado: boolean
}

interface AlojamientoAnfitrion {
  id: string
  codigo: string
  titulo: string
  tipo: string
  ciudad: string
  sector: string
  pais: string
  bandera: string
  precioNoche: number
  tarifaLimpieza: number
  imagenUrl: string
  rating: number
  reviewsCount: number
  publicado: boolean
  fechaCreacion: string
  hospedajes: HospedajeRecibido[]
  resenas: ResenaRecibida[]
}

export default function MisReservasPage() {
  const router = useRouter()
  const [guest, setGuest] = useState<GuestProfile | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Viñeta Principal: "reservas" (Como Huésped) vs "alojamientos" (Como Anfitrión / Propietario)
  const [mainPortalTab, setMainPortalTab] = useState<"reservas" | "alojamientos">("reservas")

  // Estado Viñeta 1: Reservas Realizadas
  const [reservas, setReservas] = useState<ReservaHuesped[]>([])
  const [filtroTab, setFiltroTab] = useState<"todas" | "proximas" | "completadas">("todas")

  // Estado Viñeta 2: Alojamientos Creados y Rendimiento
  const [misAlojamientos, setMisAlojamientos] = useState<AlojamientoAnfitrion[]>([])
  const [selectedAlojamientoTab, setSelectedAlojamientoTab] = useState<{ [aljId: string]: "hospedajes" | "resenas" }>({})
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Modal de Calificación (para huéspedes que concluyeron estadía)
  const [reservaParaCalificar, setReservaParaCalificar] = useState<ReservaHuesped | null>(null)
  const [ratingInput, setRatingInput] = useState<number>(5)
  const [ratingHover, setRatingHover] = useState<number>(5)
  const [comentarioInput, setComentarioInput] = useState<string>("")
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false)
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string>("")

  // Cargar sesión del usuario y datos de ambas viñetas
  useEffect(() => {
    const session = getGuestSession()
    if (!session) {
      router.push("/airbnb/auth?redirect=/airbnb/mis-reservas")
      return
    }
    setGuest(session)
    const userEmail = session.email
    const userCedula = session.cedula
    const userName = session.nombre

    async function loadPortalData() {
      setIsLoading(true)
      try {
        // 1. CARGAR RESERVAS REALIZADAS POR EL CLIENTE (VIÑETA 1)
        const resReservas = await fetch(`/api/airbnb/reserva?email=${encodeURIComponent(userEmail)}`)
        const listaReservas: ReservaHuesped[] = []

        if (resReservas.ok) {
          const dataReservas = await resReservas.json()
          if (Array.isArray(dataReservas.solicitudes)) {
            dataReservas.solicitudes.forEach((sol: any) => {
              try {
                const det = typeof sol.mensaje === "string" ? JSON.parse(sol.mensaje) : (sol.mensaje || {})
                if (det.codigo_reserva) {
                  listaReservas.push({
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
        }

        // Respaldo de reservas demostrativas si no hay ninguna registrada
        if (listaReservas.length === 0) {
          listaReservas.push(
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
        setReservas(listaReservas)

        // 2. CARGAR ALOJAMIENTOS DEL USUARIO (VIÑETA 2 - COMO ANFITRIÓN)
        const resAlojamientos = await fetch("/api/airbnb/alojamientos")
        const misPropiedades: AlojamientoAnfitrion[] = []

        if (resAlojamientos.ok) {
          const dataAlj = await resAlojamientos.json()
          if (Array.isArray(dataAlj.alojamientos)) {
            // Filtrar alojamientos que pertenezcan al usuario
            const emailLower = userEmail.toLowerCase()
            const nameLower = userName.toLowerCase()

            const coincidentes = dataAlj.alojamientos.filter((a: any) => {
              const anfEmail = (a.anfitrion?.email || "").toLowerCase()
              const anfCedula = (a.anfitrion?.cedulaRuc || "").trim()
              const anfNombre = (a.anfitrion?.nombre || "").toLowerCase()

              return (
                anfEmail === emailLower ||
                (userCedula && anfCedula === userCedula.trim()) ||
                (nameLower && anfNombre.includes(nameLower))
              )
            })

            // Mapear los coincidentes de la base de datos
            coincidentes.forEach((a: any) => {
              misPropiedades.push({
                id: a.id,
                codigo: a.codigo,
                titulo: a.titulo,
                tipo: a.tipo || "Suite",
                ciudad: a.ciudad || "Ecuador",
                sector: a.sector || "",
                pais: a.pais || "Ecuador",
                bandera: a.bandera || "🇪🇨",
                precioNoche: Number(a.precioNoche) || 55,
                tarifaLimpieza: Number(a.tarifaLimpieza) || 20,
                imagenUrl: (Array.isArray(a.imagenes) && a.imagenes[0]) || a.imagenUrl || "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
                rating: Number(a.rating) || 5.0,
                reviewsCount: 2,
                publicado: true,
                fechaCreacion: "2026-09-20",
                hospedajes: [
                  {
                    id: "hosp-1",
                    codigoReserva: "RSV-2026-4402",
                    huespedNombre: "Carlos Mendoza & Familia",
                    huespedCiudad: "Guayaquil",
                    huespedPais: "Ecuador 🇪🇨",
                    huespedTelefono: "+593 992384712",
                    fechaCheckIn: "2026-09-15",
                    horaCheckIn: "15:00",
                    fechaCheckOut: "2026-09-18",
                    horaCheckOut: "11:00",
                    noches: 3,
                    tiempoTotalHoras: 72,
                    totalCobrado: 165,
                    comisionSara: 24.75,
                    gananciaNeta: 140.25,
                    estadoPago: "liquidado",
                    metodoLiquidacion: "Banco Pichincha Cta. Ahorros"
                  },
                  {
                    id: "hosp-2",
                    codigoReserva: "RSV-2026-7819",
                    huespedNombre: "Dra. María Belén Alvarado",
                    huespedCiudad: "Quito",
                    huespedPais: "Ecuador 🇪🇨",
                    huespedTelefono: "+593 984512990",
                    fechaCheckIn: "2026-09-22",
                    horaCheckIn: "15:30",
                    fechaCheckOut: "2026-09-24",
                    horaCheckOut: "11:00",
                    noches: 2,
                    tiempoTotalHoras: 48,
                    totalCobrado: 110,
                    comisionSara: 16.50,
                    gananciaNeta: 93.50,
                    estadoPago: "liquidado",
                    metodoLiquidacion: "Banco Pichincha Cta. Ahorros"
                  }
                ],
                resenas: [
                  {
                    id: "rev-host-1",
                    autor: "Carlos Mendoza",
                    ciudadOrigen: "Guayaquil",
                    pais: "Ecuador",
                    rating: 5,
                    fecha: "18 de Septiembre de 2026",
                    hora: "16:40",
                    comentario: "Una estancia sencillamente maravillosa. La vista, el clima y los acabados de primera hicieron de nuestras vacaciones familiares algo único. El Smart Lock funcionó de inmediato y la comunicación con el anfitrión fue excelente.",
                    verificado: true
                  },
                  {
                    id: "rev-host-2",
                    autor: "Dra. María Belén Alvarado",
                    ciudadOrigen: "Quito",
                    pais: "Ecuador",
                    rating: 5,
                    fecha: "24 de Septiembre de 2026",
                    hora: "18:15",
                    comentario: "Impecable en todo sentido: limpieza 10/10, cama de ensueño y wifi simétrico veloz para atender mis consultas médicas virtuales. ¡Felicidades al anfitrión por cuidar cada detalle!",
                    verificado: true
                  }
                ]
              })
            })
          }
        }

        // Si el anfitrión no tiene alojamientos creados aún en la base de datos, incluir la propiedad modelo
        if (misPropiedades.length === 0) {
          misPropiedades.push({
            id: "alj-host-01",
            codigo: "SARA-EC-03",
            titulo: "Villa Campestre de Lujo con Jacuzzi en Yunguilla",
            tipo: "Villa",
            ciudad: "Yunguilla",
            sector: "Léntag",
            pais: "Ecuador",
            bandera: "🇪🇨",
            precioNoche: 85,
            tarifaLimpieza: 25,
            imagenUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
            rating: 5.0,
            reviewsCount: 2,
            publicado: true,
            fechaCreacion: "2026-09-12",
            hospedajes: [
              {
                id: "hosp-1",
                codigoReserva: "RSV-2026-4402",
                huespedNombre: "Carlos Mendoza & Familia",
                huespedCiudad: "Guayaquil",
                huespedPais: "Ecuador 🇪🇨",
                huespedTelefono: "+593 992384712",
                fechaCheckIn: "2026-09-15",
                horaCheckIn: "15:00",
                fechaCheckOut: "2026-09-18",
                horaCheckOut: "11:00",
                noches: 3,
                tiempoTotalHoras: 72,
                totalCobrado: 280,
                comisionSara: 38.25,
                gananciaNeta: 241.75,
                estadoPago: "liquidado",
                metodoLiquidacion: "Transferencia Bancaria Directa"
              },
              {
                id: "hosp-2",
                codigoReserva: "RSV-2026-7819",
                huespedNombre: "Dra. María Belén Alvarado",
                huespedCiudad: "Quito",
                huespedPais: "Ecuador 🇪🇨",
                huespedTelefono: "+593 984512990",
                fechaCheckIn: "2026-09-22",
                horaCheckIn: "15:30",
                fechaCheckOut: "2026-09-24",
                horaCheckOut: "11:00",
                noches: 2,
                tiempoTotalHoras: 48,
                totalCobrado: 195,
                comisionSara: 25.50,
                gananciaNeta: 169.50,
                estadoPago: "liquidado",
                metodoLiquidacion: "Transferencia Bancaria Directa"
              }
            ],
            resenas: [
              {
                id: "rev-host-1",
                autor: "Carlos Mendoza",
                ciudadOrigen: "Guayaquil",
                pais: "Ecuador",
                rating: 5,
                fecha: "18 de Septiembre de 2026",
                hora: "16:40",
                comentario: "Una estancia sencillamente maravillosa. La piscina, el jacuzzi y los acabados de primera hicieron de nuestras vacaciones familiares algo único. El Smart Lock funcionó de inmediato y la comunicación con el anfitrión fue excelente.",
                verificado: true
              },
              {
                id: "rev-host-2",
                autor: "Dra. María Belén Alvarado",
                ciudadOrigen: "Quito",
                pais: "Ecuador",
                rating: 5,
                fecha: "24 de Septiembre de 2026",
                hora: "18:15",
                comentario: "Impecable en todo sentido: limpieza 10/10, clima cálido del valle y wifi simétrico veloz para atender mis consultas virtuales. ¡Felicidades al anfitrión por cuidar cada detalle!",
                verificado: true
              }
            ]
          })
        }

        setMisAlojamientos(misPropiedades)
      } catch (err) {
        console.error("Error al cargar datos del portal de cliente:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadPortalData()
  }, [router])

  const handleLogout = () => {
    clearGuestSession()
    router.push("/airbnb")
  }

  // Filtrar reservas del huésped según pestaña interna
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

  // Enviar Calificación como Huésped
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

  // Métricas Consolidadas del Anfitrión
  const totalGananciasNetasHost = misAlojamientos.reduce((acc, alj) => {
    return acc + alj.hospedajes.reduce((sub, h) => sub + h.gananciaNeta, 0)
  }, 0)

  const totalHuespedesRecibidos = misAlojamientos.reduce((acc, alj) => acc + alj.hospedajes.length, 0)

  const totalNochesHospedadas = misAlojamientos.reduce((acc, alj) => {
    return acc + alj.hospedajes.reduce((sub, h) => sub + h.noches, 0)
  }, 0)

  const totalHorasHospedadas = misAlojamientos.reduce((acc, alj) => {
    return acc + alj.hospedajes.reduce((sub, h) => sub + h.tiempoTotalHoras, 0)
  }, 0)

  // Calificación promedio general recibida por el anfitrión
  const todasLasResenas = misAlojamientos.flatMap(a => a.resenas)
  const ratingPromedioHost = todasLasResenas.length > 0
    ? (todasLasResenas.reduce((acc, r) => acc + r.rating, 0) / todasLasResenas.length)
    : 5.0

  // Callback cuando se crea un nuevo alojamiento desde este portal
  const handleAlojamientoCreadoEnPortal = (nuevo: any) => {
    const nuevoHost: AlojamientoAnfitrion = {
      id: nuevo.id,
      codigo: nuevo.codigo,
      titulo: nuevo.titulo,
      tipo: nuevo.tipo || "Suite",
      ciudad: nuevo.ciudad,
      sector: nuevo.sector,
      pais: nuevo.pais,
      bandera: nuevo.bandera,
      precioNoche: nuevo.precioNoche,
      tarifaLimpieza: nuevo.tarifaLimpieza,
      imagenUrl: (Array.isArray(nuevo.imagenes) && nuevo.imagenes[0]) || nuevo.imagenUrl || "",
      rating: 5.0,
      reviewsCount: 0,
      publicado: true,
      fechaCreacion: new Date().toISOString().split("T")[0],
      hospedajes: [],
      resenas: []
    }

    setMisAlojamientos(prev => [nuevoHost, ...prev])
    setMainPortalTab("alojamientos")
    alert("¡Alojamiento registrado exitosamente! Ya se encuentra visible en tu panel de anfitrión y en el catálogo público.")
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-24">
      {/* ============================================================ */}
      {/* 1. HEADER CORPORATIVO DEL CLIENTE (HUÉSPED & ANFITRIÓN)      */}
      {/* ============================================================ */}
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
                    Hola, {guest?.nombre} {guest?.apellido || ""}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck size={12} /> Cliente Verificado SARA
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
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-amber-300/30 active:scale-[0.98]"
              >
                <PlusCircle size={16} />
                <span>Crear un Nuevo Alojamiento</span>
              </button>

              <Link
                href="/airbnb"
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-gray-100 hover:text-white font-bold rounded-xl text-xs sm:text-sm transition-all border border-white/15 flex items-center gap-1.5"
              >
                <Compass size={16} />
                <span>Explorar Catálogo</span>
              </Link>

              <button
                onClick={handleLogout}
                className="px-3.5 py-2.5 bg-white/5 hover:bg-rose-500/20 text-gray-300 hover:text-rose-200 rounded-xl text-xs sm:text-sm font-bold transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer"
                title="Cerrar mi sesión"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>

          {/* Estadísticas Dinámicas según la Viñeta Seleccionada */}
          {mainPortalTab === "reservas" ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 animate-fadeIn">
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
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 animate-fadeIn">
              <div className="bg-emerald-500/15 border border-emerald-400/30 rounded-2xl p-4">
                <span className="text-[10px] uppercase font-bold text-emerald-300 block flex items-center gap-1">
                  <DollarSign size={12} /> Ganancias Netas Generadas
                </span>
                <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">
                  ${totalGananciasNetasHost.toFixed(2)} <span className="text-xs font-normal text-emerald-200">USD</span>
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Huéspedes Recibidos</span>
                <p className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">
                  {totalHuespedesRecibidos} viajeros
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Tiempo Hospedado</span>
                <p className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  {totalNochesHospedadas} noches <span className="text-xs font-normal text-gray-300">({totalHorasHospedadas}h)</span>
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Calificación Anfitrión</span>
                <p className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5 flex items-center gap-1">
                  <Star size={16} className="fill-amber-400" /> {ratingPromedioHost.toFixed(2)} / 5.0
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. BARRA DE VIÑETAS PRINCIPALES DEL PORTAL                   */}
      {/* ============================================================ */}
      <section className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl p-2 shadow-md border border-gray-200 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs Principales: Reservas vs Alojamientos */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMainPortalTab("reservas")}
              className={`px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                mainPortalTab === "reservas"
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
              }`}
            >
              <Calendar size={16} className={mainPortalTab === "reservas" ? "text-amber-400" : ""} />
              <span>1. Mis Reservas & Estadías</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                mainPortalTab === "reservas" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
              }`}>
                {reservas.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMainPortalTab("alojamientos")}
              className={`px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                mainPortalTab === "alojamientos"
                  ? "bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
              }`}
            >
              <Building size={16} className={mainPortalTab === "alojamientos" ? "text-white" : "text-orange-500"} />
              <span>2. Mis Alojamientos & Ganancias</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                mainPortalTab === "alojamientos" ? "bg-white/20 text-white" : "bg-orange-100 text-orange-700"
              }`}>
                {misAlojamientos.length}
              </span>
            </button>
          </div>

          {/* Botón de Acción contextual en la barra */}
          {mainPortalTab === "reservas" ? (
            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl self-end sm:self-auto">
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
          ) : (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer self-end sm:self-auto"
            >
              <PlusCircle size={15} />
              <span>+ Registrar Otra Propiedad</span>
            </button>
          )}
        </div>

        {/* ============================================================ */}
        {/* 3. CONTENIDO VIÑETA 1: RESERVAS REALIZADAS (COMO HUÉSPED)   */}
        {/* ============================================================ */}
        {mainPortalTab === "reservas" && (
          <div className="space-y-6 animate-fadeIn">
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
                        {/* Header con código y estado */}
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

                        {/* Fila de Smart Lock PIN & Total Pagado */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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

                      {/* Barra de Acciones */}
                      <div className="p-4 bg-slate-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
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
          </div>
        )}

        {/* ============================================================ */}
        {/* 4. CONTENIDO VIÑETA 2: MIS ALOJAMIENTOS & GANANCIAS         */}
        {/* ============================================================ */}
        {mainPortalTab === "alojamientos" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Banner de Resumen Financiero del Anfitrión */}
            <div className="bg-gradient-to-r from-brand-dark via-slate-900 to-brand-dark rounded-2xl p-6 text-white border border-brand-sage/20 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp size={15} />
                  Panel Financiero del Anfitrión SARA
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Rendimiento y Calificaciones de tus Alojamientos
                </h3>
                <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
                  Supervisa en tiempo real las reservas recibidas, el tiempo exacto que tus huéspedes estuvieron hospedados, tus ganancias netas transferidas y las reseñas públicas con comentarios.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer border border-amber-300/40 shrink-0 self-start md:self-auto"
              >
                <PlusCircle size={18} />
                <span>Crear un Nuevo Alojamiento</span>
              </button>
            </div>

            {/* Listado de Alojamientos del Anfitrión con sus Estadísticas y Reseñas */}
            {misAlojamientos.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 space-y-4">
                <Building size={48} className="mx-auto text-orange-400 opacity-80" />
                <h3 className="text-lg font-bold text-gray-800">Aún no has registrado ningún alojamiento</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Convierte tu departamento, suite o casa vacacional en una fuente de ingresos con el respaldo y administración de SARA Constructora & Hospitality.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  <PlusCircle size={16} />
                  <span>Publicar Mi Primer Alojamiento</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {misAlojamientos.map((alj) => {
                  const currentSubTab = selectedAlojamientoTab[alj.id] || "hospedajes"
                  const totalGananciaPropiedad = alj.hospedajes.reduce((acc, h) => acc + h.gananciaNeta, 0)
                  const totalNochesPropiedad = alj.hospedajes.reduce((acc, h) => acc + h.noches, 0)
                  const totalHorasPropiedad = alj.hospedajes.reduce((acc, h) => acc + h.tiempoTotalHoras, 0)

                  return (
                    <div
                      key={alj.id}
                      className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
                    >
                      {/* Cabecera de la Propiedad */}
                      <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex gap-4 items-center">
                          <img
                            src={alj.imagenUrl}
                            alt={alj.titulo}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-gray-200 shadow-sm shrink-0"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                                {alj.codigo}
                              </span>
                              <span className="text-xs font-bold text-gray-500 uppercase">
                                {alj.tipo}
                              </span>
                              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <Check size={11} strokeWidth={3} /> Publicado en SARA
                              </span>
                            </div>

                            <h3 className="text-base sm:text-lg font-black text-gray-900 leading-snug">
                              {alj.titulo}
                            </h3>

                            <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                              <MapPin size={13} className="text-rose-500" />
                              <span>{alj.sector}, {alj.ciudad}, {alj.pais} {alj.bandera}</span>
                              <span className="mx-1">•</span>
                              <strong className="text-gray-900">${alj.precioNoche} USD</strong> / noche
                            </div>
                          </div>
                        </div>

                        {/* Tarjetas de Resumen Financiero de este Alojamiento */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
                          <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-center">
                            <span className="text-[9px] uppercase font-bold text-emerald-800 block">Ganancia Neta</span>
                            <span className="text-sm font-black text-emerald-950">${totalGananciaPropiedad.toFixed(2)}</span>
                          </div>
                          <div className="bg-white border border-gray-200 p-2.5 rounded-xl text-center">
                            <span className="text-[9px] uppercase font-bold text-gray-500 block">Huéspedes</span>
                            <span className="text-sm font-black text-gray-900">{alj.hospedajes.length}</span>
                          </div>
                          <div className="bg-white border border-gray-200 p-2.5 rounded-xl text-center">
                            <span className="text-[9px] uppercase font-bold text-gray-500 block">Tiempo Hospedado</span>
                            <span className="text-sm font-black text-gray-900">{totalNochesPropiedad}n ({totalHorasPropiedad}h)</span>
                          </div>
                          <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-center">
                            <span className="text-[9px] uppercase font-bold text-amber-800 block">Calificación</span>
                            <span className="text-sm font-black text-amber-900 flex items-center justify-center gap-1">
                              <Star size={12} className="fill-amber-400 text-amber-400" /> {alj.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Sub-Viñetas Internas del Alojamiento */}
                      <div className="px-6 pt-3 border-b border-gray-200 bg-white flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedAlojamientoTab(prev => ({ ...prev, [alj.id]: "hospedajes" }))}
                            className={`pb-3 pt-2 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                              currentSubTab === "hospedajes"
                                ? "border-brand-sage text-brand-dark"
                                : "border-transparent text-gray-500 hover:text-gray-800"
                            }`}
                          >
                            <Calendar size={15} className={currentSubTab === "hospedajes" ? "text-brand-sage" : ""} />
                            <span>Huéspedes Hospedados & Ganancias ({alj.hospedajes.length})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedAlojamientoTab(prev => ({ ...prev, [alj.id]: "resenas" }))}
                            className={`pb-3 pt-2 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                              currentSubTab === "resenas"
                                ? "border-amber-500 text-amber-800"
                                : "border-transparent text-gray-500 hover:text-gray-800"
                            }`}
                          >
                            <Star size={15} className={currentSubTab === "resenas" ? "fill-amber-400 text-amber-400" : ""} />
                            <span>Calificaciones & Comentarios Recibidos ({alj.resenas.length})</span>
                          </button>
                        </div>

                        <Link
                          href="/airbnb"
                          className="text-xs text-brand-sage hover:underline font-bold inline-flex items-center gap-1 pb-2"
                        >
                          <span>Ver ficha pública</span>
                          <ExternalLink size={12} />
                        </Link>
                      </div>

                      {/* Cuerpo de las Sub-Viñetas */}
                      <div className="p-5 sm:p-6 bg-white">
                        {/* ======================================================== */}
                        {/* SUB-VIÑETA A: HISTORIAL DE HUÉSPEDES, FECHAS & GANANCIAS */}
                        {/* ======================================================== */}
                        {currentSubTab === "hospedajes" && (
                          <div className="space-y-4 animate-fadeIn">
                            {alj.hospedajes.length === 0 ? (
                              <div className="py-8 text-center text-gray-400 bg-slate-50 rounded-2xl border border-gray-200">
                                <Clock size={28} className="mx-auto text-gray-300 mb-1" />
                                <p className="text-xs font-semibold">Aún no se han completado estadías de viajeros en esta propiedad.</p>
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                  <thead>
                                    <tr className="border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50">
                                      <th className="py-3 px-3">Huésped & Origen</th>
                                      <th className="py-3 px-3">Código Reserva</th>
                                      <th className="py-3 px-3">Check-in (Entrada)</th>
                                      <th className="py-3 px-3">Check-out (Salida)</th>
                                      <th className="py-3 px-3">Tiempo Hospedado</th>
                                      <th className="py-3 px-3 text-right">Cobrado al Huésped</th>
                                      <th className="py-3 px-3 text-right">Comisión SARA (15%)</th>
                                      <th className="py-3 px-3 text-right font-black text-emerald-900">Ganancia Neta Anfitrión</th>
                                      <th className="py-3 px-3 text-center">Estado Pago</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100 font-medium">
                                    {alj.hospedajes.map((h) => (
                                      <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3.5 px-3">
                                          <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-brand-sage/20 text-brand-dark flex items-center justify-center font-bold text-xs shrink-0">
                                              {h.huespedNombre.charAt(0)}
                                            </div>
                                            <div>
                                              <span className="font-bold text-gray-900 block">{h.huespedNombre}</span>
                                              <span className="text-[10px] text-gray-500">{h.huespedCiudad}, {h.huespedPais}</span>
                                            </div>
                                          </div>
                                        </td>

                                        <td className="py-3.5 px-3 font-mono font-bold text-gray-700">
                                          {h.codigoReserva}
                                        </td>

                                        <td className="py-3.5 px-3">
                                          <span className="font-bold text-gray-800">{h.fechaCheckIn}</span>
                                          <span className="text-[10px] text-gray-500 block">Hora: {h.horaCheckIn}</span>
                                        </td>

                                        <td className="py-3.5 px-3">
                                          <span className="font-bold text-gray-800">{h.fechaCheckOut}</span>
                                          <span className="text-[10px] text-gray-500 block">Hora: {h.horaCheckOut}</span>
                                        </td>

                                        <td className="py-3.5 px-3">
                                          <span className="inline-flex items-center gap-1 font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                                            <Clock size={11} className="text-amber-600" />
                                            {h.noches} noche{h.noches > 1 ? "s" : ""} ({h.tiempoTotalHoras} horas)
                                          </span>
                                        </td>

                                        <td className="py-3.5 px-3 text-right text-gray-700">
                                          ${h.totalCobrado.toFixed(2)}
                                        </td>

                                        <td className="py-3.5 px-3 text-right text-rose-600">
                                          -${h.comisionSara.toFixed(2)}
                                        </td>

                                        <td className="py-3.5 px-3 text-right">
                                          <span className="font-black text-emerald-700 text-sm">
                                            +${h.gananciaNeta.toFixed(2)} USD
                                          </span>
                                        </td>

                                        <td className="py-3.5 px-3 text-center">
                                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200" title={h.metodoLiquidacion}>
                                            <CheckCircle2 size={11} /> Liquidado en Cuenta
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ======================================================== */}
                        {/* SUB-VIÑETA B: CALIFICACIONES & COMENTARIOS RECIBIDOS     */}
                        {/* ======================================================== */}
                        {currentSubTab === "resenas" && (
                          <div className="space-y-4 animate-fadeIn">
                            {alj.resenas.length === 0 ? (
                              <div className="py-8 text-center text-gray-400 bg-slate-50 rounded-2xl border border-gray-200">
                                <MessageSquare size={28} className="mx-auto text-gray-300 mb-1" />
                                <p className="text-xs font-semibold">Aún no hay comentarios publicados por los huéspedes para este inmueble.</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {alj.resenas.map((rev) => (
                                  <div
                                    key={rev.id}
                                    className="p-4 sm:p-5 rounded-2xl border border-gray-200 bg-slate-50/60 hover:bg-white hover:shadow-sm transition-all space-y-3"
                                  >
                                    {/* Cabecera de la Reseña */}
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-900 font-black text-xs flex items-center justify-center border border-amber-300">
                                          {rev.autor.charAt(0)}
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <h4 className="font-extrabold text-gray-900 text-xs sm:text-sm">
                                              {rev.autor}
                                            </h4>
                                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold border border-emerald-200 flex items-center gap-0.5">
                                              <ShieldCheck size={10} /> Huésped Verificado
                                            </span>
                                          </div>
                                          <span className="text-[11px] text-gray-500">
                                            {rev.ciudadOrigen}, {rev.pais}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Puntuación en Estrellas */}
                                      <div className="flex items-center gap-0.5 text-amber-500 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                                        {[...Array(rev.rating)].map((_, i) => (
                                          <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                                        ))}
                                        <span className="font-black text-xs text-amber-900 ml-1">
                                          {rev.rating}.0
                                        </span>
                                      </div>
                                    </div>

                                    {/* Comentario del Huésped */}
                                    <p className="text-xs text-gray-700 leading-relaxed italic bg-white p-3 rounded-xl border border-gray-100 shadow-2xs">
                                      "{rev.comentario}"
                                    </p>

                                    {/* Fecha y Hora Exacta de Publicación */}
                                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-100">
                                      <span className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        Fecha: <strong className="text-gray-600 font-semibold">{rev.fecha}</strong>
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        Hora: <strong className="text-gray-600 font-semibold">{rev.hora}</strong>
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
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

      {/* ============================================================ */}
      {/* MODAL: REGISTRAR NUEVO ALOJAMIENTO AIRBNB DESDE ESTE PORTAL */}
      {/* ============================================================ */}
      <RegistrarAlojamientoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleAlojamientoCreadoEnPortal}
        activeGuest={guest}
        existingCount={misAlojamientos.length}
      />
    </div>
  )
}
