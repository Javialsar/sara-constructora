"use client"
import React, { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { 
  Sparkles, 
  Search, 
  MapPin, 
  Star, 
  Users, 
  Bed, 
  Bath, 
  Wifi, 
  Key, 
  Coffee, 
  Tv, 
  Car, 
  Calendar, 
  ShieldCheck, 
  MessageCircle, 
  Heart, 
  Share2, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ArrowRight, 
  Check, 
  Building,
  Palmtree,
  Laptop,
  CheckCircle2,
  DollarSign,
  Globe,
  Compass,
  Map as MapIcon,
  LayoutGrid,
  Columns,
  CreditCard,
  Lock,
  Printer,
  Download,
  User,
  Mail,
  Phone,
  FileText,
  BadgeCheck,
  Receipt,
  MessageSquareQuote,
  ThumbsUp,
  Copy,
  ChevronDown,
  Info,
  PlusCircle,
  LogOut
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import AirbnbMapWrapper from "@/components/ui/AirbnbMapWrapper"
import AirbnbDateRangePicker from "@/components/ui/AirbnbDateRangePicker"
import { getCuentasBancarias, CuentaBancariaEmpresa } from "@/lib/services/datosBancariosService"
import { getGuestSession, setGuestSession, clearGuestSession, GuestProfile } from "@/lib/services/guestAuth"
import RegistrarAlojamientoModal from "@/components/airbnb/RegistrarAlojamientoModal"

export interface ResenaHuesped {
  id: string
  autor: string
  ciudadOrigen: string
  pais: string
  bandera: string
  fecha: string
  rating: number
  comentario: string
}

export function getDefaultReviewsForListing(stay: AirbnbListing): ResenaHuesped[] {
  if (stay.ciudad === "Cuenca") {
    return [
      {
        id: "rev-1",
        autor: "Daniela Vintimilla",
        ciudadOrigen: "Guayaquil",
        pais: "Ecuador",
        bandera: "🇪🇨",
        fecha: "Hace 2 semanas",
        rating: 5,
        comentario: "Una experiencia inmejorable. La vista y el entorno son espectaculares, el departamento estuvo impecable y la cerradura inteligente facilitó el ingreso autónomo a la hora que llegamos. ¡100% recomendado!"
      },
      {
        id: "rev-2",
        autor: "Mark & Sarah Jenkins",
        ciudadOrigen: "Austin, Texas",
        pais: "Estados Unidos",
        bandera: "🇺🇸",
        fecha: "Hace 1 mes",
        rating: 5,
        comentario: "One of the best stays we've booked in South America! High-speed WiFi for our remote work, comfortable King mattress, and super safe area. The SARA Hospitality team was always available."
      },
      {
        id: "rev-3",
        autor: "Ing. Esteban Cordero",
        ciudadOrigen: "Quito",
        pais: "Ecuador",
        bandera: "🇪🇨",
        fecha: "Hace 1 mes",
        rating: 5,
        comentario: "Acabados de primera, sábanas de alta calidad y cafetera Nespresso lista con cápsulas. Todo funcionó a la perfección y el parqueadero subterráneo es amplio."
      }
    ]
  } else if (stay.ciudad === "Yunguilla") {
    return [
      {
        id: "rev-1",
        autor: "Familia Cárdenas Mora",
        ciudadOrigen: "Guayaquil",
        pais: "Ecuador",
        bandera: "🇪🇨",
        fecha: "Hace 3 semanas",
        rating: 5,
        comentario: "El clima del valle y la piscina climatizada con jacuzzi privado hicieron de nuestro descanso familiar algo inolvidable. Las áreas de BBQ y cocina están equipadas con todo."
      },
      {
        id: "rev-2",
        autor: "Dr. Marcelo Ávila",
        ciudadOrigen: "Cuenca",
        pais: "Ecuador",
        bandera: "🇪🇨",
        fecha: "Hace 1 mes",
        rating: 5,
        comentario: "Excelente propiedad vacacional. Paz absoluta, hermosas áreas verdes y mucha privacidad. La atención del personal de SARA fue de primer nivel."
      }
    ]
  } else if (stay.alcance === "internacional") {
    return [
      {
        id: "rev-1",
        autor: "Alejandro & Valeria R.",
        ciudadOrigen: "Cuenca",
        pais: "Ecuador",
        bandera: "🇪🇨",
        fecha: "Hace 3 semanas",
        rating: 5,
        comentario: "Reservamos nuestro hospedaje en el exterior a través de SARA y fue un acierto total. Ubicación estratégica, check-in digital sin demoras y tarifa transparente en dólares."
      },
      {
        id: "rev-2",
        autor: "Gabriel Montenegro",
        ciudadOrigen: "Madrid",
        pais: "España",
        bandera: "🇪🇸",
        fecha: "Hace 1 mes",
        rating: 5,
        comentario: "Alojamiento impecable con diseño de vanguardia. Cerca de todos los puntos de interés, luminoso y muy silencioso para descansar."
      }
    ]
  }
  return [
    {
      id: "rev-1",
      autor: "María Fernanda Crespo",
      ciudadOrigen: "Quito",
      pais: "Ecuador",
      bandera: "🇪🇨",
      fecha: "Hace 2 semanas",
      rating: 5,
      comentario: "Hermoso lugar, súper limpio y acogedor. Las fotos reflejan exactamente la realidad. La atención de SARA fue inmediata y muy cordial."
    },
    {
      id: "rev-2",
      autor: "David Henderson",
      ciudadOrigen: "Toronto",
      pais: "Canadá",
      bandera: "🇨🇦",
      fecha: "Hace 1 mes",
      rating: 5,
      comentario: "Fantastic location and great amenities. Fast internet, cozy bed, and smooth self-check-in with the smart lock. Would definitely stay again!"
    }
  ]
}

export interface AirbnbListing {
  id: string
  codigo: string
  titulo: string
  tipo: "suite" | "loft" | "penthouse" | "quinta" | "studio" | "villa" | "casa" | "departamento"
  alcance: "nacional" | "internacional"
  pais: string
  bandera: string
  ciudad: string
  sector: string
  lat: number
  lng: number
  precioNoche: number
  tarifaLimpieza: number
  rating: number
  reviewsCount: number
  isSuperhost: boolean
  maxHuespedes: number
  camas: number
  habitaciones: number
  banos: number
  imagenes: string[]
  descripcion: string
  amenidades: string[]
  reglas: string[]
  resenas?: ResenaHuesped[]
}

const AIRBNB_DATA: AirbnbListing[] = [
  // ==========================================
  // NACIONAL (ECUADOR)
  // ==========================================
  {
    id: "ab-1",
    codigo: "SARA-EC-01",
    titulo: "Master Suite de Diseño Frente al Río Tomebamba",
    tipo: "suite",
    alcance: "nacional",
    pais: "Ecuador",
    bandera: "🇪🇨",
    ciudad: "Cuenca",
    sector: "Puertas del Sol",
    lat: -2.8980,
    lng: -79.0180,
    precioNoche: 48,
    tarifaLimpieza: 15,
    rating: 4.98,
    reviewsCount: 54,
    isSuperhost: true,
    maxHuespedes: 2,
    camas: 1,
    habitaciones: 1,
    banos: 1,
    imagenes: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "Disfruta de amaneceres únicos con el sonido del río Tomebamba. Suite contemporánea equipada con cerradura inteligente para llegada autónoma 24/7, cama King con sábanas de 600 hilos, cafetera Nespresso e internet simétrico de alta velocidad.",
    amenidades: ["Vista al Río", "WiFi 300 Mbps Fibra", "Smart Lock (Self Check-in)", "Smart TV 55\" 4K", "Cafetera Nespresso", "Parqueadero Subterráneo", "Cocina Equipada"],
    reglas: ["Check-in: 15:00 a 22:00", "Check-out: 11:00", "No se permiten fiestas", "No fumar dentro de la suite"]
  },
  {
    id: "ab-2",
    codigo: "SARA-EC-02",
    titulo: "Loft Patrimonial en Calle Larga - Centro Histórico",
    tipo: "loft",
    alcance: "nacional",
    pais: "Ecuador",
    bandera: "🇪🇨",
    ciudad: "Cuenca",
    sector: "Centro Histórico",
    lat: -2.8974,
    lng: -79.0045,
    precioNoche: 59,
    tarifaLimpieza: 20,
    rating: 4.95,
    reviewsCount: 78,
    isSuperhost: true,
    maxHuespedes: 3,
    camas: 2,
    habitaciones: 1,
    banos: 1.5,
    imagenes: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "Una joya arquitectónica restaurada que combina muros originales de adobe visto con acabados industriales de acero y madera noble. A solo 4 minutos a pie del Parque Calderón y museos.",
    amenidades: ["Balcón Republicano", "Paredes de Adobe Visto", "Cama Queen", "Cocina Integral", "Agua Caliente Central", "WiFi Alta Velocidad", "Espacio de Trabajo"],
    reglas: ["Check-in: 14:00", "Check-out: 11:00", "Pet Friendly (Bajo petición)", "Cuidado con patrimonio"]
  },
  {
    id: "ab-3",
    codigo: "SARA-EC-03",
    titulo: "Villa Campestre Los Guayacanes con Piscina en Yunguilla",
    tipo: "quinta",
    alcance: "nacional",
    pais: "Ecuador",
    bandera: "🇪🇨",
    ciudad: "Santa Isabel",
    sector: "Valle de Yunguilla",
    lat: -3.2730,
    lng: -79.3140,
    precioNoche: 165,
    tarifaLimpieza: 35,
    rating: 5.0,
    reviewsCount: 38,
    isSuperhost: true,
    maxHuespedes: 8,
    camas: 5,
    habitaciones: 4,
    banos: 3.5,
    imagenes: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "El escape de fin de semana definitivo bajo el cálido sol de Yunguilla. Piscina temperada privada, zona de fogata nocturna, pérgola BBQ con horno de leña, billar y árboles de cítricos a tu disposición.",
    amenidades: ["Piscina Temperada Privada", "Pérgola BBQ con Horno", "Zona de Fogata", "Mesa de Billar", "Parqueo para 6 Autos", "Clima Cálido", "Sonido Envolvente"],
    reglas: ["Check-in: 13:00", "Check-out: 16:00 (Late check-out)", "Mascotas bienvenidas", "Música moderada en la noche"]
  },
  {
    id: "ab-4",
    codigo: "SARA-EC-04",
    titulo: "Suite Ejecutiva en Puerto Santa Ana con Vista al Río",
    tipo: "suite",
    alcance: "nacional",
    pais: "Ecuador",
    bandera: "🇪🇨",
    ciudad: "Guayaquil",
    sector: "Puerto Santa Ana",
    lat: -2.1810,
    lng: -79.8760,
    precioNoche: 68,
    tarifaLimpieza: 20,
    rating: 4.96,
    reviewsCount: 45,
    isSuperhost: true,
    maxHuespedes: 2,
    camas: 1,
    habitaciones: 1,
    banos: 1,
    imagenes: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "En el epicentro financiero y gastronómico más moderno de Guayaquil. Edificio The Point con piscina sinfín en la terraza, jacuzzi, gimnasio completo y seguridad privada 24 horas.",
    amenidades: ["Piscina en Rooftop", "Vista al Río Guayas", "Gimnasio y Sauna", "Aire Acondicionado Central", "WiFi Fibra 300 Mbps", "Seguridad Blindada 24/7"],
    reglas: ["Check-in: 15:00", "Check-out: 11:00", "Prohibido fiestas", "Acceso con tarjeta electrónica"]
  },
  {
    id: "ab-5",
    codigo: "SARA-EC-05",
    titulo: "Eco-Lodge Exclusivo en Puerto Ayora - Islas Galápagos",
    tipo: "villa",
    alcance: "nacional",
    pais: "Ecuador",
    bandera: "🇪🇨",
    ciudad: "Galápagos",
    sector: "Santa Cruz / Puerto Ayora",
    lat: -0.7432,
    lng: -90.3135,
    precioNoche: 185,
    tarifaLimpieza: 40,
    rating: 4.99,
    reviewsCount: 62,
    isSuperhost: true,
    maxHuespedes: 4,
    camas: 2,
    habitaciones: 2,
    banos: 2,
    imagenes: [
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "Villa ecológica sustentable rodeada de vegetación endémica y tortugas gigantes en su hábitat. Diseñada con energía solar, terrazas de bambú y aire acondicionado ecológico a pocos minutos de Tortuga Bay.",
    amenidades: ["Energía Solar", "Bicicletas de Cortesía", "Tour Assistance", "Cocina Abierta", "Agua Purificada Ilimitada", "WiFi Satelital Starlink"],
    reglas: ["Estricto respeto a fauna de Galápagos", "No plásticos de un solo uso", "Check-in: 14:00", "Check-out: 10:00"]
  },

  // ==========================================
  // INTERNACIONAL (MUNDIAL)
  // ==========================================
  {
    id: "ab-6",
    codigo: "SARA-INT-01",
    titulo: "Luxury High-Rise Penthouse en Brickell con Bahía View",
    tipo: "penthouse",
    alcance: "internacional",
    pais: "Estados Unidos",
    bandera: "🇺🇸",
    ciudad: "Miami, FL",
    sector: "Brickell Financial District",
    lat: 25.7617,
    lng: -80.1918,
    precioNoche: 220,
    tarifaLimpieza: 50,
    rating: 4.97,
    reviewsCount: 88,
    isSuperhost: true,
    maxHuespedes: 4,
    camas: 2,
    habitaciones: 2,
    banos: 2,
    imagenes: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "Viva la experiencia cosmopolita de Miami en el corazón de Brickell. Piso 42 con balcón panorámico hacia Biscayne Bay, acabados de mármol italiano, piscina infinita estilo resort y servicio de valet parking.",
    amenidades: ["Vista a Biscayne Bay", "Piscina Resort & Spa", "Valet Parking Incluido", "WiFi 500 Mbps", "Gimnasio Equinox", "Lavadora/Secadora Bosch"],
    reglas: ["Check-in: 16:00", "Check-out: 11:00", "Registro con ID obligatorio", "No fiestas en la propiedad"]
  },
  {
    id: "ab-7",
    codigo: "SARA-INT-02",
    titulo: "Apartamento de Diseño en Barrio de Salamanca",
    tipo: "loft",
    alcance: "internacional",
    pais: "España",
    bandera: "🇪🇸",
    ciudad: "Madrid",
    sector: "Barrio de Salamanca",
    lat: 40.4280,
    lng: -3.6840,
    precioNoche: 135,
    tarifaLimpieza: 30,
    rating: 4.96,
    reviewsCount: 71,
    isSuperhost: true,
    maxHuespedes: 3,
    camas: 2,
    habitaciones: 1,
    banos: 1,
    imagenes: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "Elegante departamento madrileño con techos de 3.5 metros y molduras clásicas en la exclusiva calle Serrano. Calefacción por suelo radiante, cocina de diseño Santos y walking distance al Parque del Retiro.",
    amenidades: ["Techos Altos Clásicos", "Suelo Radiante", "A 5 min del Retiro", "Cocina Santos Equipada", "Smart Lock", "Cafetera Espresso", "WiFi 600 Mbps"],
    reglas: ["Check-in: 15:00", "Check-out: 11:00", "Silencio a partir de las 22:00", "No se permite fumar"]
  },
  {
    id: "ab-8",
    codigo: "SARA-INT-03",
    titulo: "Villa Exclusiva Frente al Mar Caribe en Cancún",
    tipo: "villa",
    alcance: "internacional",
    pais: "México",
    bandera: "🇲🇽",
    ciudad: "Cancún",
    sector: "Zona Hotelera / Playa",
    lat: 21.1350,
    lng: -86.7490,
    precioNoche: 290,
    tarifaLimpieza: 60,
    rating: 5.0,
    reviewsCount: 43,
    isSuperhost: true,
    maxHuespedes: 8,
    camas: 5,
    habitaciones: 4,
    banos: 4,
    imagenes: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "Acceso directo a la arena blanca y aguas turquesa del Caribe. Piscina privada con camastros, terraza lounge con asador, servicio opcional de chef privado y kayak de cortesía.",
    amenidades: ["Acceso Directo a la Playa", "Piscina Privada Frente al Mar", "Kayaks y Paddleboards", "Asador en Terraza", "Aire Acondicionado Inverter", "Staff de Limpieza Diario"],
    reglas: ["Check-in: 15:00", "Check-out: 12:00", "Respeto a la zona de anidación de tortugas", "Eventos solo bajo autorización"]
  },
  {
    id: "ab-9",
    codigo: "SARA-INT-04",
    titulo: "Suite Panorámica con Jacuzzi en El Poblado",
    tipo: "suite",
    alcance: "internacional",
    pais: "Colombia",
    bandera: "🇨🇴",
    ciudad: "Medellín",
    sector: "El Poblado / Provenza",
    lat: 6.2085,
    lng: -75.5670,
    precioNoche: 75,
    tarifaLimpieza: 20,
    rating: 4.94,
    reviewsCount: 57,
    isSuperhost: true,
    maxHuespedes: 2,
    camas: 1,
    habitaciones: 1,
    banos: 1.5,
    imagenes: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "En el corazón de Provenza, el barrio más 'cool' del mundo según TimeOut. Balcón con jacuzzi hidromasaje privado con vista a la vegetación tropical de Medellín, sonido Bose e internet Starlink ultraveloz.",
    amenidades: ["Jacuzzi Privado en Balcón", "Ubicación en Provenza", "Sonido Bose", "Starlink WiFi 350 Mbps", "Smart Lock", "Gimnasio en Edificio", "Seguridad 24h"],
    reglas: ["Check-in: 14:00", "Check-out: 11:00", "Estricta política de convivencia", "Registro con cédula/pasaporte"]
  }
]

export default function AirbnbPage() {
  const [alojamientos, setAlojamientos] = useState<AirbnbListing[]>(AIRBNB_DATA)
  const [isLoadingAlojamientos, setIsLoadingAlojamientos] = useState<boolean>(true)
  const [destinoInput, setDestinoInput] = useState<string>("")
  const [alcanceTab, setAlcanceTab] = useState<"todos" | "nacional" | "internacional">("todos")
  const [sectorFiltro, setSectorFiltro] = useState<string>("todos")
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos")
  const [huespedesFiltro, setHuespedesFiltro] = useState<number>(1)
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Modo de visualización: 'split' (dividido lista + mapa), 'grid' (solo lista grande), 'map' (solo mapa)
  const [vistaModo, setVistaModo] = useState<"split" | "grid" | "map">("split")
  
  // Selección e interacción con el Mapa
  const [selectedMapId, setSelectedMapId] = useState<string | null>("ab-1")
  const [mapCenter, setMapCenter] = useState<[number, number]>([-2.8980, -79.0100])
  const [mapZoom, setMapZoom] = useState<number>(13)

  // Modal de Reserva
  const [selectedStay, setSelectedStay] = useState<AirbnbListing | null>(null)
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0)
  
  // Fechas de reserva estimada
  const [checkInDate, setCheckInDate] = useState<string>("2026-10-05")
  const [checkOutDate, setCheckOutDate] = useState<string>("2026-10-08")
  const [guestsCount, setGuestsCount] = useState<number>(2)

  // Cálculo de noches
  const totalNoches = useMemo(() => {
    try {
      const d1 = new Date(checkInDate).getTime()
      const d2 = new Date(checkOutDate).getTime()
      const diff = Math.ceil((d2 - d1) / (1000 * 3600 * 24))
      return diff > 0 ? diff : 1
    } catch {
      return 1
    }
  }, [checkInDate, checkOutDate])

  // Estados para el Proceso Completo de Reserva (Booking Flow)
  const [bookingStay, setBookingStay] = useState<AirbnbListing | null>(null)
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3 | 4>(1)
  const [isProcessingBooking, setIsProcessingBooking] = useState<boolean>(false)
  const [confirmedReservationCode, setConfirmedReservationCode] = useState<string>("")
  const [guestData, setGuestData] = useState({
    nombre: "",
    apellido: "",
    identificacion: "",
    email: "",
    telefono: "+593 9",
    ciudadPais: "Cuenca, Ecuador",
    horaLlegada: "15:00 - 17:00",
    peticiones: "",
    metodoPago: "transferencia", // 'transferencia' | 'tarjeta' | 'anticipo'
    numeroTarjeta: "4532 •••• •••• 8891",
    expTarjeta: "12/28",
    cvvTarjeta: "•••",
    titularTarjeta: ""
  })

  const router = useRouter()
  const searchParams = useSearchParams()

  // Sesión del Huésped Autenticado
  const [activeGuest, setActiveGuest] = useState<GuestProfile | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)

  useEffect(() => {
    setActiveGuest(getGuestSession())
    const handleSessionChange = () => {
      setActiveGuest(getGuestSession())
    }
    window.addEventListener("guest-session-change", handleSessionChange)
    return () => window.removeEventListener("guest-session-change", handleSessionChange)
  }, [])

  // Si viene con el parámetro ?action=crear_alojamiento, abrir modal automáticamente
  useEffect(() => {
    if (searchParams.get("action") === "crear_alojamiento") {
      setIsCreateModalOpen(true)
    }
  }, [searchParams])

  const handleLogout = () => {
    if (confirm("¿Deseas cerrar tu sesión de huésped en SARA Airbnb?")) {
      clearGuestSession()
      setActiveGuest(null)
    }
  }

  const handleOpenCreateModal = () => {
    if (!activeGuest) {
      router.push("/airbnb/auth?redirect=/airbnb&action=crear_alojamiento")
      return
    }
    setIsCreateModalOpen(true)
  }

  const handleAlojamientoCreado = (nuevo: AirbnbListing) => {
    setAlojamientos(prev => [nuevo, ...prev])
    setMapCenter([nuevo.lat, nuevo.lng])
    setMapZoom(14)
    setSelectedMapId(nuevo.id)
    alert("¡Alojamiento registrado exitosamente! Ya se encuentra visible en el mapa y catálogo de SARA Airbnb.")
  }

  // Estados para Cuentas Bancarias de la Empresa (Cargadas dinámicamente de Configuración)
  const [cuentasBancarias, setCuentasBancarias] = useState<CuentaBancariaEmpresa[]>([])
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    getCuentasBancarias().then(setCuentasBancarias)
  }, [])

  // Sincronizar alojamientos en tiempo real desde la Base de Datos de Supabase
  useEffect(() => {
    async function loadAlojamientosBD() {
      try {
        const res = await fetch("/api/airbnb/alojamientos")
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.alojamientos) && data.alojamientos.length > 0) {
            const listingsDB: AirbnbListing[] = data.alojamientos
              .filter((a: any) => a.publicado !== false)
              .map((a: any) => ({
                id: a.id,
                codigo: a.codigo,
                titulo: a.titulo,
                tipo: (a.tipo || "suite") as any,
                alcance: (a.alcance || "nacional") as any,
                pais: a.pais || "Ecuador",
                bandera: a.bandera || "🇪🇨",
                ciudad: a.ciudad,
                sector: a.sector,
                lat: Number(a.lat) || -2.9001,
                lng: Number(a.lng) || -79.0059,
                precioNoche: Number(a.precioNoche) || 50,
                tarifaLimpieza: Number(a.tarifaLimpieza) || 15,
                rating: Number(a.rating) || 5.0,
                reviewsCount: Math.floor(Math.random() * 20) + 12,
                isSuperhost: Boolean(a.isSuperhost),
                maxHuespedes: Number(a.maxHuespedes) || 2,
                camas: Number(a.camas) || 1,
                habitaciones: Number(a.habitaciones) || 1,
                banos: Number(a.banos) || 1,
                imagenes: Array.isArray(a.imagenes) && a.imagenes.length > 0 ? a.imagenes : [a.imagenUrl],
                videoUrl: a.videoUrl || "",
                descripcion: a.descripcion || "",
                amenidades: Array.isArray(a.amenidades) ? a.amenidades : [],
                reglas: Array.isArray(a.reglas) ? a.reglas : []
              }))

            setAlojamientos(prev => {
              const codigosDB = new Set(listingsDB.map(d => d.codigo))
              const staticUnicos = AIRBNB_DATA.filter(d => !codigosDB.has(d.codigo))
              return [...listingsDB, ...staticUnicos]
            })
          }
        }
      } catch (err) {
        console.warn("Error cargando alojamientos de base de datos:", err)
      } finally {
        setIsLoadingAlojamientos(false)
      }
    }

    loadAlojamientosBD()
  }, [])

  const handleCopyText = (text: string, id: string) => {
    try {
      navigator.clipboard.writeText(text)
      setCopiedField(id)
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      // Fallback
    }
  }

  // Estados para Reseñas y Comentarios de Usuarios (Imagen 2)
  const [userReviews, setUserReviews] = useState<Record<string, ResenaHuesped[]>>({})
  const [showAddReview, setShowAddReview] = useState<boolean>(false)
  const [newReviewAuthor, setNewReviewAuthor] = useState<string>("")
  const [newReviewCity, setNewReviewCity] = useState<string>("Cuenca, Ecuador")
  const [newReviewRating, setNewReviewRating] = useState<number>(5)
  const [newReviewComment, setNewReviewComment] = useState<string>("")

  // Cargar reseñas guardadas en la base de datos de Supabase
  useEffect(() => {
    async function loadResenasBD() {
      try {
        const res = await fetch("/api/airbnb/resenas")
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.resenas)) {
            const grouped: Record<string, ResenaHuesped[]> = {}
            for (const r of data.resenas) {
              const stayId = r.alojamientoId || "ab-1"
              if (!grouped[stayId]) grouped[stayId] = []
              grouped[stayId].push({
                id: r.id || `db-rev-${Math.random()}`,
                autor: r.huespedNombre || "Huésped Verificado",
                ciudadOrigen: r.huespedEmail ? "Huésped Registrado" : "Ecuador",
                pais: "Ecuador",
                bandera: "🇪🇨",
                fecha: r.fecha || "Reciente",
                rating: Number(r.rating) || 5,
                comentario: r.comentario || ""
              })
            }
            setUserReviews(prev => ({ ...prev, ...grouped }))
          }
        }
      } catch (err) {
        console.warn("Error cargando reseñas BD:", err)
      }
    }
    loadResenasBD()
  }, [])

  // Si hay un huésped activo, precompletar el formulario de reseña
  useEffect(() => {
    if (activeGuest) {
      setNewReviewAuthor(`${activeGuest.nombre} ${activeGuest.apellido}`.trim())
      if (activeGuest.ciudad) {
        setNewReviewCity(`${activeGuest.ciudad}, Ecuador`)
      }
    }
  }, [activeGuest])

  const handleAddReview = async (e: React.FormEvent, stayId: string) => {
    e.preventDefault()
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) {
      alert("Por favor completa tu nombre y comentario.")
      return
    }

    const nuevaResena: ResenaHuesped = {
      id: `usr-rev-${Date.now()}`,
      autor: newReviewAuthor.trim(),
      ciudadOrigen: newReviewCity.trim(),
      pais: "Ecuador",
      bandera: "🇪🇨",
      fecha: "Hace instantes (Huésped Verificado)",
      rating: newReviewRating,
      comentario: newReviewComment.trim()
    }

    setUserReviews(prev => ({
      ...prev,
      [stayId]: [nuevaResena, ...(prev[stayId] || [])]
    }))

    // Persistir en Supabase
    try {
      await fetch("/api/airbnb/resenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alojamientoId: stayId,
          alojamientoTitulo: selectedStay?.titulo,
          huespedNombre: newReviewAuthor.trim(),
          huespedEmail: activeGuest?.email || "",
          rating: newReviewRating,
          comentario: newReviewComment.trim()
        })
      })
    } catch (err) {
      console.warn("Error persistiendo reseña en Supabase:", err)
    }

    setNewReviewComment("")
    setShowAddReview(false)
    alert("¡Muchas gracias! Tu opinión y calificación han sido registradas y publicadas exitosamente.")
  }

  const handleStartBooking = (stay: AirbnbListing) => {
    setSelectedStay(null)
    setBookingStay(stay)
    setBookingStep(1)
    if (activeGuest) {
      setGuestData(prev => ({
        ...prev,
        nombre: activeGuest.nombre || prev.nombre,
        apellido: activeGuest.apellido || prev.apellido,
        email: activeGuest.email || prev.email,
        telefono: activeGuest.telefono || prev.telefono,
        identificacion: activeGuest.cedula || prev.identificacion,
        ciudadPais: activeGuest.ciudad ? `${activeGuest.ciudad}, Ecuador` : prev.ciudadPais
      }))
    }
  }

  const handleConfirmReservation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!bookingStay) return

    setIsProcessingBooking(true)
    const randomCode = `SARA-RSV-2026-${Math.floor(1000 + Math.random() * 9000)}`

    try {
      const payload = {
        codigoReserva: randomCode,
        alojamiento: {
          id: bookingStay.id,
          codigo: bookingStay.codigo,
          titulo: bookingStay.titulo,
          ciudad: bookingStay.ciudad,
          pais: bookingStay.pais,
          sector: bookingStay.sector,
          precioNoche: bookingStay.precioNoche
        },
        huesped: guestData,
        fechas: {
          checkIn: checkInDate,
          checkOut: checkOutDate,
          noches: totalNoches,
          huespedes: guestsCount
        },
        totales: {
          precioNoche: bookingStay.precioNoche,
          tarifaLimpieza: bookingStay.tarifaLimpieza,
          granTotal: (bookingStay.precioNoche * totalNoches) + bookingStay.tarifaLimpieza
        },
        metodoPago: guestData.metodoPago,
        peticionesEspeciales: guestData.peticiones
      }

      const res = await fetch("/api/airbnb/reserva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const data = await res.json()
        setConfirmedReservationCode(data.codigo || randomCode)
      } else {
        setConfirmedReservationCode(randomCode)
      }

      // Auto-iniciar sesión si no estaba autenticado para que pueda ver sus reservas
      if (!activeGuest && guestData.email) {
        setGuestSession({
          id: `guest_${Date.now()}`,
          email: guestData.email.toLowerCase().trim(),
          nombre: guestData.nombre.trim(),
          apellido: guestData.apellido.trim(),
          cedula: guestData.identificacion.trim(),
          telefono: guestData.telefono.trim(),
          ciudad: guestData.ciudadPais.split(",")[0]?.trim() || "Cuenca"
        })
      }
    } catch (err) {
      console.warn("Respaldo local de código de reserva por conectividad:", err)
      setConfirmedReservationCode(randomCode)
    } finally {
      setIsProcessingBooking(false)
      setBookingStep(4)
    }
  }

  const getWhatsAppVoucherMessage = (stay: AirbnbListing) => {
    const subtotal = stay.precioNoche * totalNoches
    const granTotal = subtotal + stay.tarifaLimpieza

    let bankDetailText = ""
    if (guestData.metodoPago === "transferencia" && cuentasBancarias.length > 0) {
      const c = cuentasBancarias[0]
      bankDetailText = `\n🏦 *Datos Bancarios para Transferencia (${c.banco}):*\n• ${c.tipoCuenta === "Corriente" ? "Cta. Corriente" : "Cta. Ahorros"} N° ${c.numeroCuenta}\n• Cédula/RUC: ${c.cedulaRuc || "0190458923001"}\n• Beneficiario: ${c.beneficiario || "SARA CONSTRUCTORA CIA. LTDA."}\n`
    }

    const msg = encodeURIComponent(
      `✅ *COMPROBANTE DE RESERVA - SARA HOSPITALITY*\n` +
      `🔖 *Código de Reserva:* ${confirmedReservationCode}\n` +
      `🏨 *Alojamiento:* ${stay.titulo} (${stay.ciudad}, ${stay.pais} ${stay.bandera})\n` +
      `👤 *Huésped Titular:* ${guestData.nombre} ${guestData.apellido}\n` +
      `🆔 *Cédula/Pasaporte:* ${guestData.identificacion || 'N/A'}\n` +
      `📞 *Contacto:* ${guestData.telefono}\n` +
      `✉️ *Email:* ${guestData.email}\n\n` +
      `🗓 *Llegada (Check-in):* ${checkInDate} (a partir de las 15:00)\n` +
      `🗓 *Salida (Check-out):* ${checkOutDate} (hasta las 11:00)\n` +
      `🌙 *Estadía:* ${totalNoches} noche(s) para ${guestsCount} huésped(es)\n` +
      `🔑 *Clave Cerradura Inteligente (Self Check-in):* *#4829#*\n\n` +
      `💰 *Desglose de Pago:*\n` +
      `• ${totalNoches} noches × $${stay.precioNoche} = $${subtotal} USD\n` +
      `• Tarifa de Limpieza = $${stay.tarifaLimpieza} USD\n` +
      `• *TOTAL:* $${granTotal} USD (${guestData.metodoPago === 'transferencia' ? 'Transferencia Bancaria' : guestData.metodoPago === 'tarjeta' ? 'Tarjeta Cifrada' : 'Anticipo 30% Garantizado'})\n` +
      bankDetailText +
      `\n📍 *Ubicación:* ${stay.sector}, ${stay.ciudad}.\n` +
      `¡Bienvenido a SARA Constructora & Hospitality!`
    )
    window.open(`https://wa.me/593981804023?text=${msg}`, "_blank")
  }

  // Filtrado de alojamientos en tiempo real desde Base de Datos
  const filteredStays = useMemo(() => {
    return alojamientos.filter((stay) => {
      // Destino libre ingresado por el usuario (sin limitaciones de ciudad ni país)
      if (destinoInput.trim()) {
        const q = destinoInput.toLowerCase().trim()
        const matchDestino = (
          stay.ciudad.toLowerCase().includes(q) ||
          stay.pais.toLowerCase().includes(q) ||
          stay.sector.toLowerCase().includes(q) ||
          stay.titulo.toLowerCase().includes(q) ||
          stay.descripcion.toLowerCase().includes(q)
        )
        if (!matchDestino) return false
      }

      // Tipo
      if (tipoFiltro !== "todos" && stay.tipo !== tipoFiltro) return false
      // Huéspedes
      if (guestsCount > 1 && stay.maxHuespedes < guestsCount) return false
      // Texto adicional
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const match = (
          stay.titulo.toLowerCase().includes(q) ||
          stay.ciudad.toLowerCase().includes(q) ||
          stay.sector.toLowerCase().includes(q) ||
          stay.pais.toLowerCase().includes(q) ||
          stay.descripcion.toLowerCase().includes(q)
        )
        if (!match) return false
      }
      return true
    })
  }, [alojamientos, destinoInput, tipoFiltro, guestsCount, searchTerm])

  // Mapeo para el componente del mapa
  const mapItems = useMemo(() => {
    return filteredStays.map(s => ({
      id: s.id,
      codigo: s.codigo,
      titulo: s.titulo,
      precioNoche: s.precioNoche,
      lat: s.lat,
      lng: s.lng,
      ciudad: s.ciudad,
      sector: s.sector,
      bandera: s.bandera,
      rating: s.rating,
      reviewsCount: s.reviewsCount,
      imagen: s.imagenes[0],
      maxHuespedes: s.maxHuespedes
    }))
  }, [filteredStays])

  // Manejar el cambio de destino dinámico e interactuar con el mapa
  const handleDestinoInputChange = (val: string) => {
    setDestinoInput(val)
    const lower = val.toLowerCase().trim()
    if (!lower) {
      setMapCenter([-2.8980, -79.0100])
      setMapZoom(12)
      return
    }

    // Centrar automáticamente si coincide con algún alojamiento en la base de datos
    const matchAlojamiento = alojamientos.find(s => 
      s.ciudad.toLowerCase().includes(lower) || 
      s.sector.toLowerCase().includes(lower) ||
      s.titulo.toLowerCase().includes(lower)
    )
    if (matchAlojamiento) {
      setMapCenter([matchAlojamiento.lat, matchAlojamiento.lng])
      setMapZoom(14)
      return
    }

    // Catálogo de ciudades frecuentes
    if (lower.includes("cariamanga") || lower.includes("ahuaca") || lower.includes("calvas")) {
      setMapCenter([-4.3297, -79.5544])
      setMapZoom(14)
    } else if (lower.includes("loja") || lower.includes("catamayo") || lower.includes("vilcabamba")) {
      setMapCenter([-3.9931, -79.2042])
      setMapZoom(13)
    } else if (lower.includes("miami") || lower.includes("florida") || lower.includes("brickell") || lower.includes("ee.uu") || lower.includes("usa")) {
      setMapCenter([25.7617, -80.1918])
      setMapZoom(13)
    } else if (lower.includes("madrid") || lower.includes("españa") || lower.includes("spain") || lower.includes("salamanca") || lower.includes("retiro")) {
      setMapCenter([40.4280, -3.6840])
      setMapZoom(13)
    } else if (lower.includes("cancun") || lower.includes("cancún") || lower.includes("mexico") || lower.includes("méxico")) {
      setMapCenter([21.1350, -86.7490])
      setMapZoom(12)
    } else if (lower.includes("medellin") || lower.includes("medellín") || lower.includes("colombia") || lower.includes("poblado") || lower.includes("provenza")) {
      setMapCenter([6.2085, -75.5670])
      setMapZoom(13)
    } else if (lower.includes("yunguilla") || lower.includes("lentag") || lower.includes("léntag") || lower.includes("santa isabel")) {
      setMapCenter([-3.2730, -79.3140])
      setMapZoom(13)
    } else if (lower.includes("guayaquil") || lower.includes("santa ana")) {
      setMapCenter([-2.1810, -79.8760])
      setMapZoom(14)
    } else if (lower.includes("galapagos") || lower.includes("galápagos") || lower.includes("ayora")) {
      setMapCenter([-0.7432, -90.3135])
      setMapZoom(12)
    } else if (lower.includes("puertas del sol")) {
      setMapCenter([-2.8980, -79.0180])
      setMapZoom(15)
    } else if (lower.includes("centro") || lower.includes("calle larga")) {
      setMapCenter([-2.8974, -79.0045])
      setMapZoom(15)
    } else if (lower.includes("cuenca") || lower.includes("tomebamba") || lower.includes("solano")) {
      setMapCenter([-2.8980, -79.0100])
      setMapZoom(13)
    }
  }

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (filteredStays.length > 0) {
      setMapCenter([filteredStays[0].lat, filteredStays[0].lng])
      setMapZoom(14)
      setSelectedMapId(filteredStays[0].id)
    }
  }

  const openWhatsAppReserva = (stay: AirbnbListing) => {
    const subtotal = stay.precioNoche * totalNoches
    const granTotal = subtotal + stay.tarifaLimpieza
    const msg = encodeURIComponent(
      `Hola SARA Hospitality / Red Airbnb.\n` +
      `Me gustaría reservar el alojamiento "${stay.titulo}" (Ref: ${stay.codigo}) en ${stay.ciudad}, ${stay.pais} ${stay.bandera}.\n` +
      `📅 Fechas: ${checkInDate} al ${checkOutDate} (${totalNoches} noches)\n` +
      `👥 Huéspedes: ${guestsCount} persona(s)\n` +
      `💰 Total estimado: $${granTotal} USD ($${stay.precioNoche}/noche + $${stay.tarifaLimpieza} limpieza).\n` +
      `¿Tienen disponibilidad para estas fechas?`
    )
    window.open(`https://wa.me/593981804023?text=${msg}`, "_blank")
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-20">
      {/* ============================================================ */}
      {/* 1. HERO SECTION: HOSPITALITY GLOBAL (NACIONAL & MUNDIAL)    */}
      {/* ============================================================ */}
      <section className="relative pt-28 pb-16 overflow-hidden bg-brand-dark">
        {/* Split Layout: Background Image on Right Side */}
        <div
          className="absolute inset-0 lg:left-[45%] lg:w-auto w-full h-full bg-cover bg-center z-0"
          style={{ backgroundImage: `url('/sara-airbnb.png')` }}
        >
          {/* Máscara de desvanecimiento para la fotografía (mezcla suave con el fondo verde) */}
          <div className="hidden lg:block absolute inset-y-0 left-0 w-64 bg-gradient-to-r from-brand-dark via-brand-dark/80 to-transparent z-10" />
          {/* Oscurecimiento sutil en móviles para asegurar lectura */}
          <div className="lg:hidden absolute inset-0 bg-brand-dark/80 z-10" />
        </div>

        {/* Gradiente sutil para mantener el texto nítido */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-brand-dark/95 via-brand-dark/65 to-transparent w-full md:w-[120%]" />

        {/* Resplandor verde de marca sutil */}
        <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_left,_var(--color-brand-sage)_0%,_transparent_60%)] opacity-20 pointer-events-none" />

        <div className="w-full max-w-[1760px] relative z-20 mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center min-h-[60vh]">
          <div className="max-w-4xl space-y-6 md:pl-4 mb-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-px bg-brand-sage" />
                <h2 className="text-brand-sage font-bold tracking-[0.2em] uppercase text-xs md:text-sm drop-shadow-md">
                  Hospitality · Suites · Alojamientos
                </h2>
              </div>

              {/* Barra de Acciones del Usuario: Crear Alojamiento, Sesión y Salir */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                {/* Botón Destacado: Crear un Nuevo Alojamiento (Abre Modal de la Imagen 3) */}
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-black shadow-lg hover:shadow-orange-500/30 transition-all cursor-pointer border border-amber-300/40 active:scale-[0.98]"
                  title="Registrar y promocionar un nuevo hospedaje en la red SARA Airbnb"
                >
                  <PlusCircle size={15} className="text-white" />
                  <span>Crear un Nuevo Alojamiento</span>
                </button>

                {activeGuest ? (
                  <>
                    {/* Saludo con Nombre del Usuario y Acceso a Mis Reservas */}
                    <Link
                      href="/airbnb/mis-reservas"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-bold backdrop-blur-md transition-all shadow-md hover:shadow-amber-500/20 cursor-pointer"
                      title="Ver mis reservas y códigos de acceso"
                    >
                      <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-[10px]">
                        {activeGuest.nombre.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate max-w-[130px] sm:max-w-none">
                        Hola, {activeGuest.nombre} {activeGuest.apellido || ""}
                      </span>
                      <span className="text-[10px] bg-amber-400/30 px-1.5 py-0.2 rounded text-amber-300 hidden md:inline">
                        Mis Reservas
                      </span>
                      <ChevronRight size={13} className="text-amber-400" />
                    </Link>

                    {/* Botón Cerrar Sesión */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-rose-500/25 hover:border-rose-400/50 border border-white/20 text-gray-200 hover:text-rose-200 text-xs font-bold backdrop-blur-md transition-all cursor-pointer"
                      title="Cerrar sesión de huésped"
                    >
                      <LogOut size={13} />
                      <span className="hidden sm:inline">Cerrar Sesión</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/airbnb/auth"
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-bold backdrop-blur-md transition-all shadow-md hover:border-amber-400/60 cursor-pointer group"
                  >
                    <User size={13} className="text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>Iniciar Sesión / Mis Reservas</span>
                    <Key size={12} className="text-brand-sage opacity-75" />
                  </Link>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.05] tracking-tight drop-shadow-2xl">
                EXPERIENCIAS <span className="font-light italic text-brand-sage">ÚNICAS.</span><br />
                HOSPEDAJE DE NIVEL.
              </h1>
            </div>

            <p className="text-base md:text-lg text-gray-100 max-w-3xl leading-relaxed font-light border-l-2 border-brand-sage/50 pl-6 drop-shadow-lg">
              Suites contemporáneas, lofts de diseño y villas vacacionales con georreferenciación y precios en tiempo real. Cobertura nacional (Ecuador) y mundial sin comisiones de intermediarios.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20 backdrop-blur-sm">
                <Globe size={14} className="text-brand-sage" /> Ecuador & Destinos Mundiales
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-amber-300 border border-white/20 backdrop-blur-sm">
                <Star size={13} className="fill-amber-400 text-amber-400" /> Categoría Superhost & Smart Lock
              </span>
              <Link
                href={activeGuest ? "/airbnb/mis-reservas" : "/airbnb/auth"}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 backdrop-blur-sm hover:bg-amber-500/30 transition-colors"
              >
                <Key size={13} className="text-amber-400" />
                <span>{activeGuest ? "Mis Claves Smart Lock (#PIN#)" : "Portal Huésped · Claves de Acceso"}</span>
              </Link>
            </div>
          </div>

          {/* Caja Flotante de Reserva Inteligente */}
          <form onSubmit={handleSearchSubmit} className="w-full max-w-[1760px] mx-auto bg-white rounded-3xl p-4 sm:p-5 md:p-6 shadow-2xl border border-gray-100 text-gray-800">
            {/* Barra de Filtros en Grid Balanceada */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-end">
              {/* Entrada Abierta de Destino (Sin limitaciones) */}
              <div className="sm:col-span-2 lg:col-span-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                  Destino / Ciudad / Zona
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text"
                    value={destinoInput}
                    onChange={(e) => handleDestinoInputChange(e.target.value)}
                    placeholder="¿A dónde quieres ir? Ej: Cuenca, Miami, Madrid, Yunguilla..."
                    className="w-full pl-10 pr-9 py-2.5 text-xs md:text-sm font-bold bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-gray-800 placeholder:font-normal placeholder:text-gray-400 transition-all h-[42px]"
                  />
                  {destinoInput && (
                    <button
                      type="button"
                      onClick={() => handleDestinoInputChange("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                      title="Borrar destino"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Selector de Rango de Fechas (Estilo Airbnb Oficial) */}
              <div className="sm:col-span-2 lg:col-span-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                  Fechas de Estadía ({totalNoches} noche{totalNoches > 1 ? "s" : ""})
                </label>
                <AirbnbDateRangePicker
                  checkIn={checkInDate}
                  checkOut={checkOutDate}
                  onChange={(inD, outD) => {
                    setCheckInDate(inD)
                    setCheckOutDate(outD)
                  }}
                />
              </div>

              {/* Selector de Huéspedes Espacioso y Responsivo */}
              <div className="sm:col-span-1 lg:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                  Huéspedes
                </label>
                <div className="relative">
                  <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select
                    value={huespedesFiltro}
                    onChange={(e) => setHuespedesFiltro(Number(e.target.value))}
                    className="w-full pl-10 pr-8 py-2.5 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-gray-800 font-bold transition-all appearance-none cursor-pointer h-[42px]"
                  >
                    <option value={1}>1 Huésped</option>
                    <option value={2}>2 Huéspedes</option>
                    <option value={3}>3 Huéspedes</option>
                    <option value={4}>4+ Huéspedes</option>
                    <option value={6}>6+ Huéspedes</option>
                    <option value={8}>8+ Huéspedes</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Botón de Búsqueda Destacado */}
              <div className="sm:col-span-1 lg:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 font-black rounded-xl text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer h-[42px]"
                >
                  <Search size={16} className="stroke-[2.5]" />
                  <span>Buscar</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. BARRA DE CONTROL Y ALTERNADOR DE VISTAS (SPLIT / GRID)    */}
      {/* ============================================================ */}
      <section className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Compass size={22} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">
                {filteredStays.length} Alojamientos Disponibles
              </h2>
              <p className="text-xs text-gray-500">
                Estadía calculada para <strong>{totalNoches} noche(s)</strong> ({checkInDate} al {checkOutDate})
              </p>
            </div>
          </div>

          {/* Selector de Modos de Vista */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setVistaModo("split")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                vistaModo === "split" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Columns size={14} />
              <span className="hidden sm:inline">Vista Dividida (Lista + Mapa)</span>
              <span className="sm:hidden">Dividida</span>
            </button>

            <button
              onClick={() => setVistaModo("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                vistaModo === "grid" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <LayoutGrid size={14} />
              <span className="hidden sm:inline">Solo Tarjetas</span>
              <span className="sm:hidden">Lista</span>
            </button>

            <button
              onClick={() => setVistaModo("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                vistaModo === "map" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <MapIcon size={14} />
              <span className="hidden sm:inline">Solo Mapa</span>
              <span className="sm:hidden">Mapa</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. LAYOUT DINÁMICO: SPLIT VIEW (LISTA 50% + MAPA 50%)       */}
        {/* ============================================================ */}
        <div className={`grid gap-6 ${
          vistaModo === "split" ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1"
        }`}>
          {/* Columna de Tarjetas */}
          {vistaModo !== "map" && (
            <div className={`${
              vistaModo === "split" 
                ? "lg:col-span-7 xl:col-span-7 max-h-[850px] overflow-y-auto pr-1" 
                : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            }`}>
              <div className={`grid gap-5 ${
                vistaModo === "split" ? "grid-cols-1 sm:grid-cols-2" : "contents"
              }`}>
                {filteredStays.length === 0 ? (
                  <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-gray-200 shadow-sm">
                    <Compass size={40} className="mx-auto text-amber-500 mb-3 opacity-80" />
                    <h3 className="text-base font-bold text-gray-800">No se encontraron alojamientos para "{destinoInput}"</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                      Verifica el nombre o limpia los filtros para explorar todo nuestro catálogo de hospedajes en Ecuador y el mundo.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setDestinoInput("")
                        setTipoFiltro("todos")
                        setHuespedesFiltro(1)
                      }}
                      className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow"
                    >
                      Ver Todos los Alojamientos
                    </button>
                  </div>
                ) : (
                  filteredStays.map((stay) => {
                    const isHoveredOrActive = selectedMapId === stay.id
                    const subtotal = stay.precioNoche * totalNoches
                    const granTotal = subtotal + stay.tarifaLimpieza

                  return (
                    <div
                      key={stay.id}
                      onClick={() => {
                        setSelectedMapId(stay.id)
                        setMapCenter([stay.lat, stay.lng])
                        setMapZoom(15)
                        if (vistaModo === "grid") {
                          setVistaModo("split")
                        }
                      }}
                      onMouseEnter={() => setSelectedMapId(stay.id)}
                      className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border flex flex-col group cursor-pointer ${
                        isHoveredOrActive ? "border-amber-500 ring-2 ring-amber-400/40" : "border-gray-200"
                      }`}
                    >
                      {/* Portada */}
                      <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                        <img
                          src={stay.imagenes[0]}
                          alt={stay.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Badges Superiores con País y Bandera */}
                        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/75 text-white shadow-md backdrop-blur-sm flex items-center gap-1">
                            <span>{stay.bandera}</span>
                            <span>{stay.ciudad}</span>
                          </span>
                          {stay.isSuperhost && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/95 text-gray-900 shadow-md backdrop-blur-sm border border-gray-200 flex items-center gap-1">
                              <Star size={10} className="fill-amber-400 text-amber-400" /> SUPERHOST
                            </span>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-md">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          <span>{stay.rating.toFixed(2)}</span>
                        </div>

                        {/* Precio por noche en el mapa y tarjeta */}
                        <div className="absolute bottom-3 left-3 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-white shadow-md">
                          <span className="text-lg font-black">${stay.precioNoche}</span>
                          <span className="text-[11px] text-gray-300 font-normal"> USD / noche</span>
                        </div>
                      </div>

                      {/* Información de la Tarjeta */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
                            <span className="font-bold text-gray-800">{stay.sector}</span>
                            <span className="text-[11px] text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1">
                              <MapPin size={12} /> Ver en mapa
                            </span>
                          </div>

                          <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-amber-600 transition-colors line-clamp-1 mb-1">
                            {stay.titulo}
                          </h3>

                          {/* Calificación con estrellitas de los usuarios */}
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="flex items-center text-amber-500">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} size={12} className="fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <span className="text-xs font-black text-gray-900">{stay.rating.toFixed(2)}</span>
                            <span className="text-[11px] text-gray-400 font-medium">({stay.reviewsCount} reseñas)</span>
                          </div>

                          {/* Cálculo de total por estadía */}
                          <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 my-2.5 flex items-center justify-between text-xs">
                            <div>
                              <span className="text-[10px] text-gray-500 block">Total por {totalNoches} noche(s):</span>
                              <span className="font-black text-amber-900 text-sm">${granTotal} USD</span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium">+${stay.tarifaLimpieza} limp.</span>
                          </div>
                        </div>

                        {/* Acciones de Reserva */}
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedStay(stay)
                              setActivePhotoIdx(0)
                            }}
                            className="flex-1 py-2 px-3 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-center cursor-pointer"
                          >
                            Detalles
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStartBooking(stay)
                            }}
                            className="flex-1 py-2 px-3 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Calendar size={13} /> Reservar
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              </div>
            </div>
          )}

          {/* Columna del Mapa Interactivo Leaflet con Pines de Precio */}
          {vistaModo !== "grid" && (
            <div className={`${
              vistaModo === "split" 
                ? "lg:col-span-5 xl:col-span-5 h-[600px] lg:h-[850px] sticky top-28" 
                : "w-full h-[650px]"
            }`}>
              <div className="w-full h-full relative">
                <AirbnbMapWrapper
                  items={mapItems}
                  selectedId={selectedMapId}
                  onSelectItem={(id) => {
                    setSelectedMapId(id)
                    const found = filteredStays.find(s => s.id === id)
                    if (found) {
                      setMapCenter([found.lat, found.lng])
                    }
                  }}
                  onOpenDetails={(item) => {
                    const fullStay = filteredStays.find(s => s.id === item.id)
                    if (fullStay) {
                      setSelectedStay(fullStay)
                      setActivePhotoIdx(0)
                    }
                  }}
                  centerCoords={mapCenter}
                  zoomLevel={mapZoom}
                />

                <div className="absolute top-4 left-4 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200 shadow-md text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  Precios por noche en tiempo real
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. MODAL DETALLE & COTIZADOR DE ESTADÍA                     */}
      {/* ============================================================ */}
      {selectedStay && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-100 relative flex flex-col">
            {/* Header del Modal */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between z-20">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                  <span>{selectedStay.bandera}</span> {selectedStay.ciudad}, {selectedStay.pais}
                </span>
                <h3 className="font-black text-gray-900 text-base md:text-lg line-clamp-1">
                  {selectedStay.titulo}
                </h3>
              </div>
              <button
                onClick={() => setSelectedStay(null)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Galería Principal */}
              <div>
                <div className="relative h-72 md:h-96 w-full rounded-2xl overflow-hidden bg-gray-900 mb-3 shadow-inner">
                  <img
                    src={selectedStay.imagenes[activePhotoIdx]}
                    alt={selectedStay.titulo}
                    className="w-full h-full object-cover"
                  />
                  {selectedStay.imagenes.length > 1 && (
                    <>
                      <button
                        onClick={() => setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : selectedStay.imagenes.length - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => setActivePhotoIdx((prev) => (prev < selectedStay.imagenes.length - 1 ? prev + 1 : 0))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                    {activePhotoIdx + 1} / {selectedStay.imagenes.length} fotos
                  </div>
                </div>

                {/* Miniaturas */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {selectedStay.imagenes.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        activePhotoIdx === idx ? 'border-amber-500 ring-2 ring-amber-400/30' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Miniatura" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Ficha y Desglose de Precios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Descripción de la Estadía</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedStay.descripcion}
                    </p>
                  </div>

                  {/* Amenidades de Confort */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Lo que ofrece este alojamiento</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedStay.amenidades.map((amenidad, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-gray-700 p-2 rounded-lg bg-gray-50 border border-gray-200">
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                          <span>{amenidad}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reglas de la Casa */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Reglas del Alojamiento</h4>
                    <ul className="space-y-1 text-xs text-gray-600">
                      {selectedStay.reglas.map((regla, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>{regla}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Caja de Reserva Directa con desglose de noches */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-gray-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-2xl font-black text-gray-900">${selectedStay.precioNoche}</span>
                        <span className="text-xs text-gray-500 font-normal"> USD / noche</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-800 bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        <span>{selectedStay.rating.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Selector de Fechas en el Modal */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white mb-4 text-xs">
                      <div className="p-2 border-b border-gray-200">
                        <AirbnbDateRangePicker
                          checkIn={checkInDate}
                          checkOut={checkOutDate}
                          onChange={(inD, outD) => {
                            setCheckInDate(inD)
                            setCheckOutDate(outD)
                          }}
                        />
                      </div>
                      <div className="p-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase block">Huéspedes</label>
                        <select 
                          value={guestsCount}
                          onChange={(e) => setGuestsCount(Number(e.target.value))}
                          className="w-full text-xs font-bold outline-none text-gray-800 bg-transparent"
                        >
                          {Array.from({ length: selectedStay.maxHuespedes }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>{n} Huésped{n > 1 ? 'es' : ''}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Desglose de Valores */}
                    <div className="space-y-2 text-xs text-gray-600 border-t border-gray-200 pt-3 mb-5">
                      <div className="flex justify-between">
                        <span>${selectedStay.precioNoche} x {totalNoches} noches:</span>
                        <strong className="text-gray-900">${(selectedStay.precioNoche * totalNoches).toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Tarifa única de limpieza:</span>
                        <strong className="text-gray-900">${selectedStay.tarifaLimpieza}</strong>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-2 text-sm">
                        <span className="font-bold text-gray-900">Total a pagar:</span>
                        <span className="font-black text-emerald-700 text-lg">
                          ${((selectedStay.precioNoche * totalNoches) + selectedStay.tarifaLimpieza).toLocaleString()} USD
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleStartBooking(selectedStay)}
                      className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <Calendar size={16} /> Continuar al Proceso de Reserva
                    </button>
                    <button
                      onClick={() => openWhatsAppReserva(selectedStay)}
                      className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <MessageCircle size={15} className="text-emerald-600" /> Consultar por WhatsApp
                    </button>
                    <p className="text-[11px] text-gray-400 text-center">
                      Confirmación y pago directo sin comisiones extras de portales
                    </p>
                  </div>
                </div>
              </div>

              {/* SECCIÓN DE RESEÑAS Y OPINIONES DE HUÉSPEDES (IMAGEN 2) */}
              <div className="pt-6 border-t border-gray-200">
                {/* Cabecera de Reseñas */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={18} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-xl font-black text-gray-900">{selectedStay.rating.toFixed(2)}</span>
                      <span className="text-sm text-gray-400 font-semibold">•</span>
                      <span className="text-sm font-bold text-gray-800">
                        {selectedStay.reviewsCount + (userReviews[selectedStay.id]?.length || 0)} evaluaciones
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <BadgeCheck size={14} className="text-emerald-600" /> Calificaciones 100% verificadas por huéspedes reales
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAddReview(!showAddReview)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                  >
                    <MessageSquareQuote size={15} className="text-amber-600" />
                    {showAddReview ? "Cancelar Reseña" : "+ Dejar mi Opinión / Calificar"}
                  </button>
                </div>

                {/* Formulario desplegable para agregar reseña */}
                {showAddReview && (
                  <form
                    onSubmit={(e) => handleAddReview(e, selectedStay.id)}
                    className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 mb-6 space-y-4 animate-fadeIn"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-extrabold text-sm text-amber-900 flex items-center gap-2">
                        <MessageSquareQuote size={16} /> Tu experiencia en {selectedStay.titulo}
                      </h5>
                      <span className="text-[11px] text-amber-700">Se publicará de forma inmediata</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Tu Nombre y Apellido</label>
                        <input
                          type="text"
                          required
                          value={newReviewAuthor}
                          onChange={(e) => setNewReviewAuthor(e.target.value)}
                          placeholder="Ej. Carmen Andrade"
                          className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Ciudad o País de Origen</label>
                        <input
                          type="text"
                          value={newReviewCity}
                          onChange={(e) => setNewReviewCity(e.target.value)}
                          placeholder="Ej. Guayaquil, Ecuador"
                          className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">Tu Calificación General</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => setNewReviewRating(s)}
                            className="p-1 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              size={22}
                              className={s <= newReviewRating ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-gray-700 ml-2">
                          {newReviewRating === 5 ? "Excelente (5/5)" : newReviewRating === 4 ? "Muy bueno (4/5)" : `${newReviewRating}/5 Estrellas`}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Comentario u Opinión</label>
                      <textarea
                        required
                        rows={3}
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        placeholder="Comparte detalles de la limpieza, llegada autónoma, comodidad o atención recibida..."
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddReview(false)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        Descartar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 shadow-sm transition-colors cursor-pointer"
                      >
                        Publicar Opinión
                      </button>
                    </div>
                  </form>
                )}

                {/* Métricas por Categoría (Estilo Airbnb Oficial) */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-gray-200/80">
                  {[
                    { label: "Limpieza", score: "4.9", pct: "98%" },
                    { label: "Precisión del anuncio", score: "5.0", pct: "100%" },
                    { label: "Llegada Smart Lock", score: "4.9", pct: "98%" },
                    { label: "Comunicación SARA", score: "5.0", pct: "100%" },
                    { label: "Ubicación & Seguridad", score: "4.9", pct: "98%" },
                    { label: "Calidad - Precio", score: "4.9", pct: "98%" }
                  ].map((cat, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-600 font-medium">{cat.label}</span>
                        <span className="font-bold text-gray-900">{cat.score}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-800 rounded-full" style={{ width: cat.pct }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Lista de Opiniones y Comentarios */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...(userReviews[selectedStay.id] || []), ...getDefaultReviewsForListing(selectedStay)].map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        {/* Cabecera del Huésped */}
                        <div className="flex items-center gap-3 mb-2.5">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                            {rev.autor.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h6 className="font-bold text-xs text-gray-900 truncate">{rev.autor}</h6>
                              <span className="text-xs">{rev.bandera}</span>
                            </div>
                            <p className="text-[11px] text-gray-400 truncate">
                              {rev.ciudadOrigen} • {rev.fecha}
                            </p>
                          </div>
                        </div>

                        {/* Estrellitas */}
                        <div className="flex items-center gap-1 text-amber-500 mb-2">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                          ))}
                        </div>

                        {/* Comentario */}
                        <p className="text-xs text-gray-700 leading-relaxed italic">
                          "{rev.comentario}"
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 size={12} /> Huésped Verificado
                        </span>
                        <span className="flex items-center gap-1 hover:text-gray-600 cursor-pointer">
                          <ThumbsUp size={11} /> Útil
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. MODAL INTERACTIVO DE PROCESO DE RESERVA (BOOKING FLOW)    */}
      {/* ============================================================ */}
      {bookingStay && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-gray-100 relative flex flex-col my-auto max-h-[94vh]">
            
            {/* Header del Proceso de Reserva */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Proceso de Reserva Segura</h3>
                  <p className="text-xs text-gray-400">
                    {bookingStay.titulo} • {bookingStay.ciudad}, {bookingStay.pais} {bookingStay.bandera}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBookingStay(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Stepper / Indicador de Pasos */}
            <div className="bg-slate-100 px-6 py-3 border-b border-gray-200 shrink-0">
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {[
                  { num: 1, label: "Fechas & Estancia" },
                  { num: 2, label: "Datos Huésped" },
                  { num: 3, label: "Pago / Garantía" },
                  { num: 4, label: "Voucher Emitido" }
                ].map((s) => {
                  const isActive = bookingStep === s.num
                  const isDone = bookingStep > s.num
                  return (
                    <div
                      key={s.num}
                      className={`flex flex-col items-center gap-1 transition-all ${
                        isActive
                          ? "text-slate-950 font-bold"
                          : isDone
                          ? "text-emerald-700 font-semibold"
                          : "text-gray-400"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                          isActive
                            ? "bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50"
                            : isDone
                            ? "bg-emerald-600 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {isDone ? <Check size={14} /> : s.num}
                      </div>
                      <span className="text-[11px] hidden sm:inline truncate max-w-full">{s.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Contenido Dinámico por Paso */}
            <div className="p-6 overflow-y-auto space-y-6">

              {/* PASO 1: FECHAS Y ESTANCIA */}
              {bookingStep === 1 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                    <img
                      src={bookingStay.imagenes[0]}
                      alt={bookingStay.titulo}
                      className="w-24 h-20 rounded-xl object-cover shadow-sm shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 text-xs text-amber-900 font-bold mb-0.5">
                        <span>{bookingStay.bandera}</span>
                        <span>{bookingStay.ciudad}, {bookingStay.sector}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-amber-700 flex items-center gap-0.5 font-bold">
                          <Star size={12} className="fill-amber-500 text-amber-500" /> {bookingStay.rating.toFixed(2)}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-gray-900 text-sm md:text-base leading-snug">
                        {bookingStay.titulo}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Capacidad máxima: <strong>{bookingStay.maxHuespedes} personas</strong> • {bookingStay.habitaciones} hab • {bookingStay.camas} cama(s)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 bg-slate-50 p-3.5 rounded-xl border border-gray-200">
                      <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                        Fechas de Estadía ({totalNoches} noche{totalNoches > 1 ? "s" : ""})
                      </label>
                      <AirbnbDateRangePicker
                        checkIn={checkInDate}
                        checkOut={checkOutDate}
                        onChange={(inD, outD) => {
                          setCheckInDate(inD)
                          setCheckOutDate(outD)
                        }}
                      />
                      <span className="text-[10px] text-gray-400 mt-1.5 block">Check-in: 15:00 a 22:00 • Check-out: hasta las 11:00</span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-200">
                      <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                        Número de Huéspedes
                      </label>
                      <select
                        value={guestsCount}
                        onChange={(e) => setGuestsCount(Number(e.target.value))}
                        className="w-full text-xs font-bold text-gray-800 bg-white p-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        {Array.from({ length: bookingStay.maxHuespedes }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n} Huésped{n > 1 ? "es" : ""}
                          </option>
                        ))}
                      </select>
                      <span className="text-[10px] text-gray-400 mt-1 block">Adultos y niños</span>
                    </div>
                  </div>

                  {/* Resumen de Tarifas Transparente */}
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2.5">
                    <h5 className="font-bold text-gray-800 text-xs uppercase tracking-wider">
                      Desglose de la Estadía ({totalNoches} Noche{totalNoches > 1 ? "s" : ""})
                    </h5>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>${bookingStay.precioNoche} USD × {totalNoches} noches:</span>
                      <strong className="text-gray-900">${(bookingStay.precioNoche * totalNoches).toLocaleString()} USD</strong>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Tarifa única de limpieza y preparación:</span>
                      <strong className="text-gray-900">${bookingStay.tarifaLimpieza} USD</strong>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Comisión de servicio SARA al huésped:</span>
                      <strong className="text-emerald-700 font-bold">GRATIS ($0 USD)</strong>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2 text-sm">
                      <span className="font-extrabold text-gray-900">Total a pagar:</span>
                      <span className="font-black text-emerald-700 text-lg">
                        ${((bookingStay.precioNoche * totalNoches) + bookingStay.tarifaLimpieza).toLocaleString()} USD
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setBookingStay(null)}
                      className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingStep(2)}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Continuar: Datos del Huésped</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 2: DATOS DEL HUÉSPED TITULAR */}
              {bookingStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-slate-50 p-4 rounded-xl border border-gray-200">
                    <h5 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <User size={15} className="text-amber-500" />
                      Información del Huésped Principal (Titular de la Reserva)
                    </h5>

                    {activeGuest ? (
                      <div className="mb-3.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          <span>Sesión de Huésped activa: <strong>{activeGuest.nombre} {activeGuest.apellido}</strong> ({activeGuest.email}). Datos completados automáticamente.</span>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-3.5 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between text-xs text-amber-900">
                        <div className="flex items-center gap-2">
                          <Info size={15} className="text-amber-600 shrink-0" />
                          <span>¿Ya tienes cuenta de Huésped SARA?</span>
                        </div>
                        <Link href="/airbnb/auth" className="text-xs font-bold text-amber-800 underline hover:text-amber-950">
                          Inicia Sesión aquí
                        </Link>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">Nombres *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Juan Carlos"
                          value={guestData.nombre}
                          onChange={(e) => setGuestData({ ...guestData, nombre: e.target.value })}
                          className="w-full text-xs font-medium text-gray-800 bg-white p-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">Apellidos *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Pérez Andrade"
                          value={guestData.apellido}
                          onChange={(e) => setGuestData({ ...guestData, apellido: e.target.value })}
                          className="w-full text-xs font-medium text-gray-800 bg-white p-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">Cédula / Pasaporte *</label>
                        <input
                          type="text"
                          required
                          placeholder="0104829104 / Pass..."
                          value={guestData.identificacion}
                          onChange={(e) => setGuestData({ ...guestData, identificacion: e.target.value })}
                          className="w-full text-xs font-mono font-bold text-gray-800 bg-white p-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">Celular / WhatsApp *</label>
                        <input
                          type="tel"
                          required
                          placeholder="+593 99 123 4567"
                          value={guestData.telefono}
                          onChange={(e) => setGuestData({ ...guestData, telefono: e.target.value })}
                          className="w-full text-xs font-mono font-bold text-gray-800 bg-white p-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">Correo Electrónico *</label>
                        <input
                          type="email"
                          required
                          placeholder="huesped@correo.com"
                          value={guestData.email}
                          onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                          className="w-full text-xs font-medium text-gray-800 bg-white p-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">Ciudad / País de Origen</label>
                        <input
                          type="text"
                          placeholder="Quito, Ecuador / Miami, USA"
                          value={guestData.ciudadPais}
                          onChange={(e) => setGuestData({ ...guestData, ciudadPais: e.target.value })}
                          className="w-full text-xs font-medium text-gray-800 bg-white p-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">Horario Estimado de Llegada</label>
                        <select
                          value={guestData.horaLlegada}
                          onChange={(e) => setGuestData({ ...guestData, horaLlegada: e.target.value })}
                          className="w-full text-xs font-medium text-gray-800 bg-white p-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="15:00 - 17:00">15:00 - 17:00 (Tarde estándar)</option>
                          <option value="17:00 - 20:00">17:00 - 20:00 (Noche temprana)</option>
                          <option value="20:00 - 23:00">20:00 - 23:00 (Llegada nocturna)</option>
                          <option value="Llegada de madrugada (Smart Lock)">Madrugada autónoma con clave</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">Peticiones o requerimientos especiales (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Ej: Requerimos parqueadero extra o llegada temprana si es posible"
                        value={guestData.peticiones}
                        onChange={(e) => setGuestData({ ...guestData, peticiones: e.target.value })}
                        className="w-full text-xs font-medium text-gray-800 bg-white p-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setBookingStep(1)}
                      className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ChevronLeft size={16} /> Volver
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!guestData.nombre || !guestData.apellido || !guestData.email) {
                          alert("Por favor completa los nombres, apellidos y correo electrónico del titular.")
                          return
                        }
                        setBookingStep(3)
                      }}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Continuar al Pago y Garantía</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 3: PAGO Y GARANTÍA */}
              {bookingStep === 3 && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <h5 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2">
                      Selecciona tu Método de Pago o Garantía
                    </h5>
                    <p className="text-xs text-gray-500 mb-4">
                      SARA ofrece canales de pago directos y garantizados sin recargos sorpresa:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          id: "transferencia",
                          title: "Transferencia Bancaria",
                          desc: "0% comisión adicional. Cuentas directas en Banco Pichincha y Guayaquil.",
                          icon: Building
                        },
                        {
                          id: "tarjeta",
                          title: "Tarjeta Crédito / Débito",
                          desc: "Pago en línea cifrado SSL 256 bits (Visa, Mastercard, PayPhone).",
                          icon: CreditCard
                        },
                        {
                          id: "anticipo",
                          title: "Anticipo Flexible (30%)",
                          desc: "Bloquea tu fecha con solo el 30% ahora y liquida el resto al check-in.",
                          icon: ShieldCheck
                        }
                      ].map((metodo) => {
                        const isSelected = guestData.metodoPago === metodo.id
                        const Icon = metodo.icon
                        return (
                          <button
                            type="button"
                            key={metodo.id}
                            onClick={() => setGuestData({ ...guestData, metodoPago: metodo.id })}
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? "border-amber-500 bg-amber-50/50 ring-2 ring-amber-400/30 shadow-sm"
                                : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`p-2 rounded-xl ${isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-gray-100 text-gray-600'}`}>
                                <Icon size={18} />
                              </span>
                              {isSelected && <Check size={16} className="text-amber-600 font-bold" />}
                            </div>
                            <h6 className="font-bold text-gray-900 text-xs mb-1">{metodo.title}</h6>
                            <p className="text-[11px] text-gray-500 leading-snug">{metodo.desc}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Detalle del Método Seleccionado */}
                  {guestData.metodoPago === "transferencia" && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 space-y-3 text-xs">
                      <div className="flex items-center justify-between font-bold text-gray-800">
                        <div className="flex items-center gap-2">
                          <Building size={16} className="text-brand-sage" />
                          <span>Cuentas Bancarias Oficiales de la Empresa:</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-normal">Depósito o Transferencia Directa</span>
                      </div>

                      {cuentasBancarias && cuentasBancarias.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {cuentasBancarias.map((cta) => (
                            <div
                              key={cta.id}
                              className="bg-white p-3 rounded-xl border border-gray-200 space-y-2 shadow-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-gray-900 text-xs">{cta.banco}</span>
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                                  {cta.tipoCuenta === "Corriente" ? "Cta. Corriente" : "Cta. Ahorros"}
                                </span>
                              </div>

                              <div className="space-y-1 font-mono text-[11px] text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                <div className="flex items-center justify-between">
                                  <span>N°: <strong>{cta.numeroCuenta}</strong></span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyText(cta.numeroCuenta, `${cta.id}_cta`)}
                                    className="text-emerald-700 hover:text-emerald-800 font-sans text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                  >
                                    {copiedField === `${cta.id}_cta` ? (
                                      <span className="text-emerald-600 font-bold flex items-center gap-0.5"><Check size={11} /> Copiado</span>
                                    ) : (
                                      <span className="flex items-center gap-0.5"><Copy size={11} /> Copiar</span>
                                    )}
                                  </button>
                                </div>
                                {cta.cedulaRuc && (
                                  <div className="flex items-center justify-between">
                                    <span>RUC/CI: <strong>{cta.cedulaRuc}</strong></span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyText(cta.cedulaRuc, `${cta.id}_ci`)}
                                      className="text-emerald-700 hover:text-emerald-800 font-sans text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                    >
                                      {copiedField === `${cta.id}_ci` ? (
                                        <span className="text-emerald-600 font-bold flex items-center gap-0.5"><Check size={11} /> Copiado</span>
                                      ) : (
                                        <span className="flex items-center gap-0.5"><Copy size={11} /> Copiar</span>
                                      )}
                                    </button>
                                  </div>
                                )}
                                {cta.beneficiario && (
                                  <p className="text-[10px] text-gray-600 pt-0.5 font-sans">
                                    Titular: <strong>{cta.beneficiario}</strong>
                                  </p>
                                )}
                              </div>

                              {cta.correoComprobantes && (
                                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-100">
                                  <span className="truncate">Email: {cta.correoComprobantes}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyText(cta.correoComprobantes!, `${cta.id}_mail`)}
                                    className="text-gray-500 hover:text-gray-800 text-[10px] font-bold ml-1 cursor-pointer"
                                  >
                                    {copiedField === `${cta.id}_mail` ? "✓ Copiado" : "Copiar"}
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1 font-mono text-[11px] text-gray-700">
                          <p><strong>Beneficiario:</strong> SARA CONSTRUCTORA CIA. LTDA.</p>
                          <p><strong>RUC:</strong> 0190458923001</p>
                          <p><strong>Banco Pichincha:</strong> Cta. Corriente No. 2100239485</p>
                          <p><strong>Banco de Guayaquil:</strong> Cta. Corriente No. 0014892301</p>
                          <p><strong>Correo para comprobantes:</strong> pagos@saraconstructora.com</p>
                        </div>
                      )}

                      <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                        <Info size={13} className="text-amber-500 shrink-0" />
                        Al emitir tu reserva, tus fechas quedan inmediatamente aseguradas en el sistema. Puedes enviar el comprobante de transferencia al WhatsApp de atención al cliente.
                      </p>
                    </div>
                  )}

                  {guestData.metodoPago === "tarjeta" && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 space-y-3 text-xs">
                      <div className="flex items-center justify-between font-bold text-gray-800">
                        <span className="flex items-center gap-1.5">
                          <Lock size={15} className="text-emerald-600" /> Pasarela Segura Cifrada SSL 256 bits
                        </span>
                        <span className="text-[10px] text-gray-400">Visa / Mastercard / Amex</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">Número de Tarjeta</label>
                          <input
                            type="text"
                            value={guestData.numeroTarjeta}
                            onChange={(e) => setGuestData({ ...guestData, numeroTarjeta: e.target.value })}
                            className="w-full text-xs font-mono font-bold text-gray-800 bg-white p-2.5 rounded-lg border border-gray-300"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">Vencimiento (MM/AA)</label>
                            <input
                              type="text"
                              value={guestData.expTarjeta}
                              onChange={(e) => setGuestData({ ...guestData, expTarjeta: e.target.value })}
                              className="w-full text-xs font-mono font-bold text-gray-800 bg-white p-2.5 rounded-lg border border-gray-300"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">CVV / CVC</label>
                            <input
                              type="text"
                              value={guestData.cvvTarjeta}
                              onChange={(e) => setGuestData({ ...guestData, cvvTarjeta: e.target.value })}
                              className="w-full text-xs font-mono font-bold text-gray-800 bg-white p-2.5 rounded-lg border border-gray-300"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {guestData.metodoPago === "anticipo" && (
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-bold text-amber-900">
                        <ShieldCheck size={16} className="text-amber-600" />
                        <span>Garantía de Anticipo Flexible (30%):</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span>Anticipo a pagar hoy:</span>
                        <strong className="text-base font-black text-amber-900">
                          ${Math.round(((bookingStay.precioNoche * totalNoches) + bookingStay.tarifaLimpieza) * 0.3)} USD
                        </strong>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500 border-t border-amber-200/60 pt-1">
                        <span>Saldo restante al Check-in:</span>
                        <strong>
                          ${Math.round(((bookingStay.precioNoche * totalNoches) + bookingStay.tarifaLimpieza) * 0.7)} USD
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* Resumen Total y Botón de Emisión */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-[11px] text-gray-400">Total liquidado a reservar:</p>
                      <p className="text-xl font-black text-emerald-700">
                        ${((bookingStay.precioNoche * totalNoches) + bookingStay.tarifaLimpieza).toLocaleString()} USD
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setBookingStep(2)}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 flex items-center gap-1.5 cursor-pointer"
                      >
                        <ChevronLeft size={16} /> Volver
                      </button>
                      <button
                        type="button"
                        disabled={isProcessingBooking}
                        onClick={handleConfirmReservation}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isProcessingBooking ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Procesando Reserva...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} />
                            <span>Confirmar y Emitir Reserva</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 4: VOUCHER EMITIDO CON ÉXITO */}
              {bookingStep === 4 && (
                <div className="space-y-6 animate-fadeIn py-2">
                  <div className="text-center space-y-1.5">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 size={36} />
                    </div>
                    <h4 className="text-2xl font-black text-gray-900">¡Tu Reserva ha sido Confirmada!</h4>
                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                      Hemos bloqueado las fechas en el calendario y emitido tu voucher oficial de estadía en SARA Hospitality.
                    </p>
                  </div>

                  {/* Tarjeta Voucher Oficial */}
                  <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-slate-800">
                    <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 mb-4 gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">Voucher Oficial de Estadía</span>
                        <h5 className="font-extrabold text-white text-base md:text-lg">SARA Hospitality & Suites</h5>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-gray-400 block">Código de Reserva</span>
                        <span className="font-mono text-base font-black text-amber-400 bg-white/10 px-2.5 py-1 rounded-lg">
                          {confirmedReservationCode}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">Alojamiento</p>
                        <p className="font-bold text-white text-sm">{bookingStay.titulo}</p>
                        <p className="text-gray-300 text-xs mt-0.5">
                          {bookingStay.sector}, {bookingStay.ciudad} ({bookingStay.pais} {bookingStay.bandera})
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">Huésped Titular</p>
                        <p className="font-bold text-white text-sm">{guestData.nombre} {guestData.apellido}</p>
                        <p className="text-gray-300 text-xs mt-0.5">ID: {guestData.identificacion} • Tel: {guestData.telefono}</p>
                      </div>

                      <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Fechas de Estadía</p>
                        <p className="font-bold text-amber-300 mt-1">
                          Entrada: {checkInDate} (15:00)
                        </p>
                        <p className="font-bold text-amber-300">
                          Salida: {checkOutDate} (11:00)
                        </p>
                        <p className="text-[11px] text-gray-300 mt-1">{totalNoches} noche(s) • {guestsCount} huésped(es)</p>
                      </div>

                      <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Acceso Autónomo (Smart Lock)</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Key size={16} className="text-amber-400 shrink-0" />
                          <span className="font-mono font-black text-base text-white tracking-widest bg-black/40 px-2 py-0.5 rounded">
                            *#4829#
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-400 font-semibold mt-1">
                          ✓ Cerradura digital habilitada para tus fechas
                        </p>
                      </div>

                      {guestData.metodoPago === "transferencia" && cuentasBancarias.length > 0 && (
                        <div className="sm:col-span-2 bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-2">
                          <p className="text-[10px] uppercase font-bold text-amber-400">
                            Cuentas Bancarias para el Depósito o Transferencia:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {cuentasBancarias.map((cta) => (
                              <div key={cta.id} className="bg-black/40 p-2.5 rounded-lg border border-white/5 font-mono text-[11px] text-gray-200">
                                <p className="font-bold text-white text-xs">{cta.banco} ({cta.tipoCuenta === "Corriente" ? "Cta. Cte." : "Cta. Ahorros"})</p>
                                <p className="mt-0.5">N° <strong>{cta.numeroCuenta}</strong></p>
                                {cta.cedulaRuc && <p className="text-[10px] text-gray-400">RUC/CI: {cta.cedulaRuc}</p>}
                                {cta.beneficiario && <p className="text-[10px] text-gray-400 truncate">Titular: {cta.beneficiario}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-xs text-gray-400">
                        Estado: <strong className="text-emerald-400 font-bold">RESERVA CONFIRMADA & GARANTIZADA</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block">Total Liquidado</span>
                        <span className="text-lg font-black text-white">
                          ${((bookingStay.precioNoche * totalNoches) + bookingStay.tarifaLimpieza).toLocaleString()} USD
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones del Voucher */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={() => getWhatsAppVoucherMessage(bookingStay)}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageCircle size={16} />
                      <span>Enviar Voucher a mi WhatsApp</span>
                    </button>

                    <Link
                      href="/airbnb/mis-reservas"
                      onClick={() => setBookingStay(null)}
                      className="w-full sm:w-auto py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                    >
                      <Key size={15} />
                      <span>Ver en Mis Reservas</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="w-full sm:w-auto py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Printer size={16} />
                      <span>Imprimir</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBookingStay(null)}
                      className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer"
                    >
                      Listo / Cerrar
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Modal: Registrar Nuevo Alojamiento Airbnb (Imagen 3) */}
      <RegistrarAlojamientoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleAlojamientoCreado}
        activeGuest={activeGuest}
        existingCount={alojamientos.length}
      />
    </div>
  )
}
