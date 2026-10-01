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
  Home,
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
  LogOut,
  Camera,
  UploadCloud,
  Loader2
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import AirbnbMapWrapper from "@/components/ui/AirbnbMapWrapper"
import AirbnbDateRangePicker from "@/components/ui/AirbnbDateRangePicker"
import { getCuentasBancarias, CuentaBancariaEmpresa } from "@/lib/services/datosBancariosService"
import { getGuestSession, setGuestSession, clearGuestSession, GuestProfile } from "@/lib/services/guestAuth"
import { getStaysPolicies, StaysPolicies, DEFAULT_STAYS_POLICIES } from "@/lib/services/staysPoliciesService"
import { getLogosEmpresa } from "@/lib/services/logosService"
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
  verificado?: boolean
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
  const [ordenPrecio, setOrdenPrecio] = useState<"defecto" | "alto" | "bajo">("defecto")
  const [cardPhotoIdx, setCardPhotoIdx] = useState<Record<string, number>>({})
  const [favoritos, setFavoritos] = useState<Record<string, boolean>>({})
  const [huespedesFiltro, setHuespedesFiltro] = useState<number>(1)
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Navegación rápida de fotos dentro de las tarjetas
  const handleNextPhoto = (e: React.MouseEvent, stayId: string, total: number) => {
    e.stopPropagation()
    setCardPhotoIdx(prev => ({
      ...prev,
      [stayId]: ((prev[stayId] || 0) + 1) % total
    }))
  }

  const handlePrevPhoto = (e: React.MouseEvent, stayId: string, total: number) => {
    e.stopPropagation()
    setCardPhotoIdx(prev => ({
      ...prev,
      [stayId]: ((prev[stayId] || 0) - 1 + total) % total
    }))
  }

  const toggleFavorito = (e: React.MouseEvent, stayId: string) => {
    e.stopPropagation()
    setFavoritos(prev => ({
      ...prev,
      [stayId]: !prev[stayId]
    }))
  }

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
    const [receiptFile, setReceiptFile] = useState<File | null>(null)
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

  // Logotipo dinámico de SARA Stays
  const [logoStays, setLogoStays] = useState<string>("/sara-stays.png")

  useEffect(() => {
    getLogosEmpresa().then(logos => {
      if (logos?.stays) {
        setLogoStays(logos.stays)
      }
    })
  }, [])

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
    if (confirm("¿Deseas cerrar tu sesión de huésped en SARA Stays?")) {
      clearGuestSession()
      setActiveGuest(null)
    }
  }

  const handleOpenCreateModal = () => {
    if (!activeGuest) {
      router.push("/stays/auth?redirect=/stays&action=crear_alojamiento")
      return
    }
    setIsCreateModalOpen(true)
  }

  const handleAlojamientoCreado = (nuevo: AirbnbListing) => {
    setAlojamientos(prev => [nuevo, ...prev])
    setMapCenter([nuevo.lat, nuevo.lng])
    setMapZoom(14)
    setSelectedMapId(nuevo.id)
    alert("¡Alojamiento registrado exitosamente! Ya se encuentra visible en el mapa y catálogo de SARA Stays.")
  }

  // Estados para Cuentas Bancarias de la Empresa (Cargadas dinámicamente de Configuración)
  const [cuentasBancarias, setCuentasBancarias] = useState<CuentaBancariaEmpresa[]>([])
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    getCuentasBancarias().then(setCuentasBancarias)
  }, [])

  // Estados para Políticas de Reserva y Cancelación de SARA Stays
  const [politicas, setPoliticas] = useState<StaysPolicies>(DEFAULT_STAYS_POLICIES)

  useEffect(() => {
    getStaysPolicies().then(setPoliticas)
    const handlePolicyUpdate = (e: any) => {
      if (e.detail) setPoliticas(e.detail)
    }
    window.addEventListener("sara_stays_policies_updated", handlePolicyUpdate)
    return () => window.removeEventListener("sara_stays_policies_updated", handlePolicyUpdate)
  }, [])

  // Showcase Cinemático de Alojamientos Destacados (Rotación cada 2.8s)
  const alojamientosDestacados = useMemo(() => {
    const destacados = alojamientos.filter(a => a.isSuperhost || a.rating >= 4.95)
    return destacados.length > 0 ? destacados : alojamientos.slice(0, 5)
  }, [alojamientos])
  const [heroStaysIdx, setHeroStaysIdx] = useState(0)
  const [heroStaysPaused, setHeroStaysPaused] = useState(false)

  useEffect(() => {
    if (alojamientosDestacados.length <= 1 || heroStaysPaused) return
    const interval = setInterval(() => {
      setHeroStaysIdx(prev => (prev + 1) % alojamientosDestacados.length)
    }, 2800) // 2.8 segundos de rotación continua
    return () => clearInterval(interval)
  }, [alojamientosDestacados.length, heroStaysPaused])

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
                reviewsCount: Number(a.reviewsCount) || (AIRBNB_DATA.find(s => s.codigo === a.codigo)?.reviewsCount || 26),
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

  // Formateador de nombre del huésped
  const formatGuestName = (raw?: string, fallback = "Clarisa Paredes"): string => {
    if (!raw) return fallback
    const clean = raw.replace(/[._-]+/g, " ").trim()
    if (!clean || clean.toLowerCase() === "huesped verificado" || clean.toLowerCase() === "huesped") {
      return fallback
    }
    return clean
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ")
  }

  // Estados para Reseñas y Comentarios de Usuarios (Sincronización en tiempo real)
  const [userReviews, setUserReviews] = useState<Record<string, ResenaHuesped[]>>({})
  const [showAddReview, setShowAddReview] = useState<boolean>(false)
  const [newReviewAuthor, setNewReviewAuthor] = useState<string>("")
  const [newReviewCity, setNewReviewCity] = useState<string>("Cuenca, Ecuador")
  const [newReviewRating, setNewReviewRating] = useState<number>(5)
  const [newReviewComment, setNewReviewComment] = useState<string>("")

  // Cálculo reactivo de métricas reales (rating promedio ponderado y conteo consolidado)
  const getStayStats = (
    stay: AirbnbListing | null | undefined
  ): { rating: number; reviewsCount: number; reviews: ResenaHuesped[] } => {
    if (!stay) return { rating: 5.0, reviewsCount: 20, reviews: [] }
    const byId = userReviews[stay.id] || []
    const byCode = (stay.codigo && stay.codigo !== stay.id) ? (userReviews[stay.codigo] || []) : []

    // Deduplicar reseñas por ID
    const map = new Map<string, ResenaHuesped>()
    byId.forEach(r => map.set(r.id, r))
    byCode.forEach(r => map.set(r.id, r))
    const extraReviews = Array.from(map.values())

    const baseCount = stay.reviewsCount || 26
    const baseRating = stay.rating || 5.0

    if (extraReviews.length === 0) {
      return {
        rating: baseRating,
        reviewsCount: baseCount,
        reviews: extraReviews
      }
    }

    const extraTotalScore = extraReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0)
    const totalCount = baseCount + extraReviews.length
    const weighted = ((baseRating * baseCount) + extraTotalScore) / totalCount

    return {
      rating: Number(weighted.toFixed(2)),
      reviewsCount: totalCount,
      reviews: extraReviews
    }
  }

  // Cargar reseñas guardadas en la base de datos de Supabase en tiempo real
  const loadResenasBD = async () => {
    try {
      const res = await fetch(`/api/airbnb/resenas?t=${Date.now()}`, { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.resenas)) {
          const grouped: Record<string, ResenaHuesped[]> = {}
          for (const r of data.resenas) {
            const stayId = r.alojamientoId || "ab-1"
            const stayCode = r.alojamientoCodigo || ""
            const displayName = formatGuestName(r.autor || r.huespedNombre || r.nombre, "Clarisa Paredes")

            const item: ResenaHuesped = {
              id: r.id || `db-rev-${Math.random()}`,
              autor: displayName,
              ciudadOrigen: r.ciudadOrigen || "Cuenca, Ecuador",
              pais: r.pais || "Ecuador",
              bandera: r.bandera || "🇪🇨",
              fecha: r.fecha || "Reciente",
              rating: Number(r.rating) || 5,
              comentario: r.comentario || "",
              verificado: true
            }

            if (!grouped[stayId]) grouped[stayId] = []
            grouped[stayId].push(item)

            if (stayCode && stayCode !== stayId) {
              if (!grouped[stayCode]) grouped[stayCode] = []
              grouped[stayCode].push(item)
            }
          }
          setUserReviews(grouped)
        }
      }
    } catch (err) {
      console.warn("Error cargando reseñas BD:", err)
    }
  }

  useEffect(() => {
    loadResenasBD()

    const handleSync = () => {
      loadResenasBD()
    }

    window.addEventListener("sara_airbnb_new_review", handleSync)
    window.addEventListener("storage", handleSync)
    window.addEventListener("focus", handleSync)

    // Intervalo de sondeo en segundo plano (cada 6 segundos) para sincronizar sin recargar
    const interval = setInterval(loadResenasBD, 6000)

    return () => {
      window.removeEventListener("sara_airbnb_new_review", handleSync)
      window.removeEventListener("storage", handleSync)
      window.removeEventListener("focus", handleSync)
      clearInterval(interval)
    }
  }, [])

  // Si hay un huésped activo, precompletar el formulario de reseña
  useEffect(() => {
    if (activeGuest) {
      const formatted = formatGuestName(`${activeGuest.nombre} ${activeGuest.apellido || ""}`, "Clarisa Paredes")
      setNewReviewAuthor(formatted)
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

    const formattedAuthor = formatGuestName(newReviewAuthor.trim(), "Clarisa Paredes")

    const nuevaResena: ResenaHuesped = {
      id: `usr-rev-${Date.now()}`,
      autor: formattedAuthor,
      ciudadOrigen: newReviewCity.trim(),
      pais: "Ecuador",
      bandera: "🇪🇨",
      fecha: new Date().toLocaleDateString("es-EC", { day: "numeric", month: "long", year: "numeric" }),
      rating: newReviewRating,
      comentario: newReviewComment.trim(),
      verificado: true
    }

    setUserReviews(prev => {
      const codeKey = selectedStay?.codigo
      const nextMap = {
        ...prev,
        [stayId]: [nuevaResena, ...(prev[stayId] || [])]
      }
      if (codeKey && codeKey !== stayId) {
        nextMap[codeKey] = [nuevaResena, ...(prev[codeKey] || [])]
      }
      return nextMap
    })

    // Persistir en Supabase
    try {
      await fetch("/api/airbnb/resenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alojamientoId: stayId,
          alojamientoCodigo: selectedStay?.codigo,
          alojamientoTitulo: selectedStay?.titulo,
          autor: formattedAuthor,
          huespedNombre: formattedAuthor,
          huespedEmail: activeGuest?.email || "",
          ciudadOrigen: newReviewCity.trim(),
          rating: newReviewRating,
          comentario: newReviewComment.trim()
        })
      })
      await loadResenasBD()
    } catch (err) {
      console.warn("Error persistiendo reseña en Supabase:", err)
    }

    setNewReviewComment("")
    setShowAddReview(false)
    alert("¡Muchas gracias! Tu opinión y calificación han sido registradas y sincronizadas exitosamente.")
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

  // Sincronizar automáticamente los datos del huésped activo si la ventana de reserva está abierta
  useEffect(() => {
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
  }, [activeGuest])

  // Reanudar la reserva o abrir alojamiento automáticamente si el usuario regresa tras autenticarse
  useEffect(() => {
    const action = searchParams.get("action")
    const targetStayId = searchParams.get("stayId") || searchParams.get("stay")
    if (targetStayId && alojamientos.length > 0) {
      const match = alojamientos.find(a => a.id === targetStayId || a.codigo === targetStayId)
      if (match) {
        if (action === "reservar") {
          handleStartBooking(match)
        } else if (!action) {
          setSelectedStay(match)
        }
      }
    }
  }, [searchParams, alojamientos])

  const handleConfirmReservation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!bookingStay) return

    if (guestData.metodoPago === 'transferencia' && !receiptFile) {
      alert("Por favor adjunta el comprobante de pago de tu transferencia.")
      return
    }

    setIsProcessingBooking(true)
    const randomCode = `SARA-RSV-2026-${Math.floor(1000 + Math.random() * 9000)}`

    try {
      let finalReceiptUrl = ""
      if (receiptFile) {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        const fileExt = receiptFile.name.split('.').pop()
        const fileName = `comprobante-stays-${Date.now()}.${fileExt}`
        const { error: uploadErr } = await supabase.storage.from('sara-assets').upload(`comprobantes/${fileName}`, receiptFile)
        if (uploadErr) {
          console.error(uploadErr)
          alert("Error al subir el comprobante. Inténtalo nuevamente.")
          setIsProcessingBooking(false)
          return
        }
        const { data: urlData } = supabase.storage.from('sara-assets').getPublicUrl(`comprobantes/${fileName}`)
        finalReceiptUrl = urlData.publicUrl
      }

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
        peticionesEspeciales: guestData.peticiones,
        comprobanteUrl: typeof finalReceiptUrl !== 'undefined' ? finalReceiptUrl : "" 
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
      `• *TOTAL:* $${granTotal} USD (${guestData.metodoPago === 'transferencia' ? 'Transferencia Bancaria' : guestData.metodoPago === 'tarjeta' ? 'Tarjeta Cifrada' : `Anticipo Flexible (${politicas.porcentajeAnticipo}%)`})\n` +
      `\n📋 *POLÍTICA DE CANCELACIÓN Y REEMBOLSO:*\n` +
      `• a) Más de 10 días: Penalización ${politicas.penalizacionMas10Dias}% (Devolución ${Math.max(0, 100 - politicas.penalizacionMas10Dias)}% del total)\n` +
      `• b) De 5 a 10 días: Penalización ${politicas.penalizacion5a10Dias}% (Devolución ${Math.max(0, 100 - politicas.penalizacion5a10Dias)}% del total)\n` +
      `• c) De 2 a 5 días: Penalización ${politicas.penalizacion2a5Dias}% (Devolución ${Math.max(0, 100 - politicas.penalizacion2a5Dias)}% del total)\n` +
      `• d) Dentro de las 24 horas: Penalización ${politicas.penalizacion24Horas}% (¡Sin devolución de reserva - 0% de reembolso!)\n` +
      `• Reembolsos en ${politicas.diasReembolso} mediante ${politicas.metodoDevolucion}\n` +
      bankDetailText +
      `\n📍 *Ubicación:* ${stay.sector}, ${stay.ciudad}.\n` +
      `¡Bienvenido a SARA Constructora & Hospitality!`
    )
    window.open(`https://wa.me/593981804023?text=${msg}`, "_blank")
  }

  // Filtrado y ordenamiento de alojamientos en tiempo real desde Base de Datos
  const filteredStays = useMemo(() => {
    let result = alojamientos.filter((stay) => {
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

      // Alcance
      if (alcanceTab !== "todos" && stay.alcance !== alcanceTab) return false

      // Tipo de Alojamiento (Soporta Departamento, Suite, Penthouse, Villa, Quinta)
      if (tipoFiltro !== "todos") {
        if (tipoFiltro === "departamento") {
          if (stay.tipo !== "departamento" && stay.tipo !== "loft" && stay.tipo !== "studio") return false
        } else if (tipoFiltro === "villa") {
          if (stay.tipo !== "villa" && stay.tipo !== "casa") return false
        } else if (stay.tipo !== tipoFiltro) {
          return false
        }
      }

      // Huéspedes
      if (huespedesFiltro > 1 && stay.maxHuespedes < huespedesFiltro) return false

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

    // Ordenamiento por precio: alto o bajo
    if (ordenPrecio === "alto") {
      result = [...result].sort((a, b) => b.precioNoche - a.precioNoche)
    } else if (ordenPrecio === "bajo") {
      result = [...result].sort((a, b) => a.precioNoche - b.precioNoche)
    }

    return result
  }, [alojamientos, destinoInput, alcanceTab, tipoFiltro, huespedesFiltro, searchTerm, ordenPrecio])

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
      `Hola SARA Stays / Hospedaje.\n` +
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
      {/* 0. APP HEADER EXCLUSIVO: SARA STAYS (STANDALONE)             */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3 transition-all">
        <div className="w-full max-w-[1760px] mx-auto flex items-center justify-between gap-4">
          {/* Logo y Marca SARA STAYS */}
          <div className="flex items-center gap-6">
            <Link href="/stays" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden border border-amber-400/40 shrink-0">
                <img src={logoStays} alt="SARA Stays" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm sm:text-base tracking-wider text-white">SARA</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 rounded-md shadow-xs">
                    STAYS
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 font-medium hidden sm:block">
                  Hospédate · Suites & Alojamientos
                </span>
              </div>
            </Link>

            {/* Navegación Rápida entre Portales */}
            <nav className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs font-semibold">
              <Link 
                href="/inmobiliaria" 
                className="px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
              >
                <Building size={14} className="text-emerald-400" />
                <span>Portal Inmobiliario</span>
              </Link>
              <Link 
                href="/" 
                className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
              >
                <Home size={13} />
                <span>Sara Constructora</span>
              </Link>
            </nav>
          </div>

          {/* Acciones Principales */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botón Anfitrión: Publicar Alojamiento */}
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer border border-amber-300/40 active:scale-[0.98]"
              title="Registrar y promocionar un nuevo hospedaje en SARA Stays"
            >
              <PlusCircle size={15} />
              <span className="hidden sm:inline">Publicar Propiedad</span>
              <span className="sm:hidden">+ Publicar</span>
            </button>

            {/* Acceso Huésped / Mis Reservas */}
            {activeGuest ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/stays/mis-reservas"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-bold transition-all shadow-sm"
                >
                  <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-[10px]">
                    {activeGuest.nombre.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline truncate max-w-[120px]">
                    {activeGuest.nombre}
                  </span>
                  <span className="text-[10px] bg-amber-400/30 px-1.5 py-0.5 rounded text-amber-300 font-extrabold">
                    Mis Reservas
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/20 text-gray-300 hover:text-rose-200 border border-white/10 transition-colors cursor-pointer"
                  title="Cerrar Sesión"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <Link
                href="/stays/auth?redirect=/stays/mis-reservas"
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Key size={13} className="text-amber-400" />
                <span>Mis Reservas</span>
              </Link>
            )}

            {/* Concierge WhatsApp */}
            <a
              href="https://wa.me/593981804023?text=Hola%20SARA%20Stays,%20deseo%20asistencia%20con%20un%20alojamiento"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors"
              title="Concierge y Atención 24/7"
            >
              <Phone size={13} />
              <span className="hidden md:inline">Concierge</span>
            </a>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 1. HERO SECTION: HOSPITALITY DE NIVEL & RESIDENCIAS DE AUTOR */}
      {/* ============================================================ */}
      <section className="relative pt-12 pb-24 lg:pb-28 overflow-hidden bg-slate-950">
        {/* Fondo Cinematográfico Arquitectónico de Alta Definición */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000 scale-105 filter brightness-[0.88] contrast-[1.05]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2560&q=85')`
          }}
        />

        {/* Gradientes y Filtros de Iluminación de Lujo Equilibrados */}
        <div className="absolute inset-0 z-10 bg-slate-950/30" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/80 via-slate-950/50 to-slate-950/25" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40" />
        <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_top_left,_rgba(245,158,11,0.12)_0%,_transparent_60%)] pointer-events-none" />

        <div className="w-full max-w-[1760px] relative z-20 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Columna Principal: Mensaje de Marca y Filosofía */}
            <div className="lg:col-span-7 space-y-6">
              {/* Eyebrow de Prestigio */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-xs font-bold shadow-lg">
                <Sparkles size={14} className="text-amber-400 animate-pulse" />
                <span className="tracking-widest uppercase text-[11px]">SARA STAYS · HOSPITALITY & RESIDENCIAS DE AUTOR</span>
              </div>

              {/* Titular Emocional y Directo (Sin redundancias) */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight drop-shadow-2xl">
                  Lugares inolvidables.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400">
                    Diseñados para inspirar.
                  </span>
                </h1>
              </div>

              {/* Párrafo Descriptivo Limpio */}
              <p className="text-sm sm:text-base lg:text-lg text-slate-200 max-w-2xl leading-relaxed font-light drop-shadow-md">
                Suites contemporáneas, lofts de arquitectura y villas vacacionales con georreferenciación en tiempo real. Disfruta de llegada autónoma inteligente 24/7 y reserva directa sin sobreprecios de intermediarios.
              </p>

              {/* Pilares de Confianza y Calidad (Micro-badges de Lujo) */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/80 text-white border border-slate-700/70 backdrop-blur-md shadow-sm">
                  <Key size={13} className="text-amber-400" />
                  <span>Check-in Autónomo 24/7 (Smart Lock)</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/80 text-amber-300 border border-slate-700/70 backdrop-blur-md shadow-sm">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span>Superhosts Verificados</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/80 text-white border border-slate-700/70 backdrop-blur-md shadow-sm">
                  <Globe size={13} className="text-emerald-400" />
                  <span>Ecuador & Destinos Globales</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/80 text-emerald-300 border border-slate-700/70 backdrop-blur-md shadow-sm">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>Tarifa Directa Sin Comisiones</span>
                </span>
              </div>
            </div>

            {/* Columna Secundaria: Showcase Cinemático de Alojamientos Destacados & Tarjeta de Anfitriones */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              {/* Halo de iluminación ambiental 3D cálido */}
              <div className="absolute top-1/4 w-80 h-80 bg-gradient-to-tr from-amber-500/35 via-orange-500/25 to-yellow-300/30 rounded-full blur-3xl pointer-events-none transform -translate-y-8" />

              {/* Showcase Cinemático de Alojamientos Destacados (Rotación cada 2.8s) */}
              <div 
                className="relative z-10 w-full max-w-[460px] group select-none mb-3"
                onMouseEnter={() => setHeroStaysPaused(true)}
                onMouseLeave={() => setHeroStaysPaused(false)}
              >
                <div 
                  onClick={() => {
                    const currentStay = alojamientosDestacados[heroStaysIdx]
                    if (currentStay) {
                      setSelectedStay(currentStay)
                      setActivePhotoIdx(0)
                    }
                  }}
                  className="relative aspect-[16/11] sm:aspect-[16/10] w-full rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-slate-900 cursor-pointer transition-all duration-500 group-hover:shadow-[0_25px_60px_-15px_rgba(245,158,11,0.35)] group-hover:border-amber-400/60 group-hover:-translate-y-1"
                >
                  {/* Carrusel con Crossfade Cinemático */}
                  {alojamientosDestacados.map((stay, idx) => (
                    <div
                      key={stay.id}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        idx === heroStaysIdx ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 pointer-events-none z-0"
                      }`}
                    >
                      <img
                        src={stay.imagenes[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"}
                        alt={stay.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      {/* Gradiente Cinematográfico de Contraste */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/60" />
                    </div>
                  ))}

                  {/* Sello de Autor SARA Stays (Top Left) */}
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 shadow-lg text-white">
                      <div className="w-5 h-5 rounded-md overflow-hidden bg-slate-900 flex items-center justify-center shrink-0 border border-amber-400/40">
                        <img src={logoStays} alt="SARA Stays" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                        Colección de Autor
                      </span>
                    </div>
                  </div>

                  {/* Badge Superhost / Rating (Top Right) */}
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md flex items-center gap-1">
                      <Star size={11} className="fill-slate-950 text-slate-950" />
                      <span>SUPERHOST</span>
                    </span>
                  </div>

                  {/* Flechas manuales que aparecen al hacer hover */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setHeroStaysIdx(prev => (prev - 1 + alojamientosDestacados.length) % alojamientosDestacados.length)
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg cursor-pointer border border-white/20 active:scale-90"
                    title="Anterior"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setHeroStaysIdx(prev => (prev + 1) % alojamientosDestacados.length)
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg cursor-pointer border border-white/20 active:scale-90"
                    title="Siguiente"
                  >
                    <ChevronRight size={16} />
                  </button>

                  {/* Información Dinámica del Alojamiento (Bottom) */}
                  <div className="absolute bottom-0 inset-x-0 p-4 z-20">
                    <div className="bg-slate-950/85 backdrop-blur-md p-3 rounded-2xl border border-white/15 text-white shadow-xl space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider truncate flex items-center gap-1">
                          <MapPin size={11} className="shrink-0" />
                          {alojamientosDestacados[heroStaysIdx]?.sector}, {alojamientosDestacados[heroStaysIdx]?.ciudad}
                        </span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full shrink-0">
                          {alojamientosDestacados[heroStaysIdx]?.tipo}
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-white leading-snug line-clamp-1 group-hover:text-amber-300 transition-colors">
                        {alojamientosDestacados[heroStaysIdx]?.titulo}
                      </h4>

                      <div className="flex items-center justify-between pt-1 border-t border-white/10">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs text-amber-400 font-bold">$</span>
                          <span className="text-base font-black text-white font-mono tracking-tight">
                            {alojamientosDestacados[heroStaysIdx]?.precioNoche}
                          </span>
                          <span className="text-[10px] text-slate-300 font-medium">USD / noche</span>
                        </div>

                        <span className="text-[11px] font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          <span>Ver Estancia</span>
                          <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>

                    {/* Indicadores de Barra de Progreso */}
                    <div className="flex items-center justify-center gap-1.5 pt-2">
                      {alojamientosDestacados.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setHeroStaysIdx(idx)
                          }}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            idx === heroStaysIdx
                              ? "w-6 bg-gradient-to-r from-amber-400 to-orange-400 shadow-sm"
                              : "w-1.5 bg-white/40 hover:bg-white/70"
                          }`}
                          title={`Ver alojamiento ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarjeta Exclusiva para Propietarios / Anfitriones */}
              <div className="w-full max-w-[430px] relative z-20 mt-2">
                <div className="relative rounded-2xl p-5 bg-gradient-to-b from-white/14 via-white/8 to-white/4 backdrop-blur-2xl border border-white/20 shadow-2xl text-white overflow-hidden group">
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/35 transition-colors" />
                  
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
                      <Building size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                        Red de Anfitriones
                      </span>
                      <h3 className="text-sm sm:text-base font-extrabold text-white">
                        ¿Tienes una propiedad?
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    Convierte tu suite, casa o villa en una fuente de ingresos con el respaldo de SARA. Gestión integral de reservas, cerraduras inteligentes y huéspedes calificados.
                  </p>

                  <button
                    type="button"
                    onClick={handleOpenCreateModal}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer border border-amber-200/40 active:scale-[0.98]"
                  >
                    <PlusCircle size={15} />
                    <span>Publicar mi Alojamiento</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. CONSOLA DE BÚSQUEDA FLOTANTE & CATEGORÍAS EN TIEMPO REAL  */}
      {/* ============================================================ */}
      <section className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10 lg:-mt-14 relative z-30 mb-8">
        <div className="bg-white rounded-3xl p-4 sm:p-5 lg:p-6 shadow-2xl shadow-slate-950/20 border border-slate-100">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-end">
            
            {/* Destino */}
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <MapPin size={13} className="text-amber-500" />
                <span>¿A dónde quieres ir?</span>
              </label>
              <div className="relative">
                <input 
                  type="text"
                  value={destinoInput}
                  onChange={(e) => handleDestinoInputChange(e.target.value)}
                  placeholder="Ciudad, sector o país (Ej: Cuenca, Yunguilla, Miami, Madrid...)"
                  className="w-full pl-3.5 pr-9 py-2.5 text-xs sm:text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-gray-800 placeholder:font-normal placeholder:text-gray-400 transition-all h-[44px]"
                />
                {destinoInput && (
                  <button
                    type="button"
                    onClick={() => handleDestinoInputChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                    title="Limpiar destino"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Fechas de Estadía */}
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-amber-500" />
                  <span>Fechas de Estadía</span>
                </span>
                <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md text-[10px]">
                  {totalNoches} noche{totalNoches > 1 ? "s" : ""}
                </span>
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

            {/* Huéspedes */}
            <div className="sm:col-span-1 lg:col-span-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Users size={13} className="text-amber-500" />
                <span>Huéspedes</span>
              </label>
              <div className="relative">
                <select
                  value={huespedesFiltro}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    setHuespedesFiltro(val)
                    setGuestsCount(val)
                  }}
                  className="w-full pl-3.5 pr-8 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-gray-800 font-bold transition-all appearance-none cursor-pointer h-[44px]"
                >
                  <option value={1}>1 Huésped</option>
                  <option value={2}>2 Huéspedes</option>
                  <option value={3}>3 Huéspedes</option>
                  <option value={4}>4 Huéspedes</option>
                  <option value={6}>6+ Huéspedes</option>
                  <option value={8}>8+ Huéspedes</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Botón Buscar */}
            <div className="sm:col-span-1 lg:col-span-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer h-[44px]"
              >
                <Search size={16} className="stroke-[2.5]" />
                <span>Buscar Estadía</span>
              </button>
            </div>
          </form>

          {/* Chips de Categorías Rápidas e Interactivas */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 shrink-0 mr-1 hidden sm:inline">
              Filtros:
            </span>
            
            {/* 1. Todos */}
            <button
              type="button"
              onClick={() => {
                setDestinoInput("")
                setTipoFiltro("todos")
                setOrdenPrecio("defecto")
                setAlcanceTab("todos")
                setMapCenter([-2.8980, -79.0100])
                setMapZoom(13)
              }}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                !destinoInput && tipoFiltro === "todos" && alcanceTab === "todos" && ordenPrecio === "defecto"
                  ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              ✨ Todos ({alojamientos.length})
            </button>

            {/* 2. Suite */}
            <button
              type="button"
              onClick={() => {
                setTipoFiltro("suite")
              }}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                tipoFiltro === "suite"
                  ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              🏙️ Suite
            </button>

            {/* 3. Penthouse */}
            <button
              type="button"
              onClick={() => {
                setTipoFiltro("penthouse")
              }}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                tipoFiltro === "penthouse"
                  ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              💎 Penthouse
            </button>

            {/* 4. Departamento */}
            <button
              type="button"
              onClick={() => {
                setTipoFiltro("departamento")
              }}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                tipoFiltro === "departamento"
                  ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              🏢 Departamento
            </button>

            {/* 5. Villa */}
            <button
              type="button"
              onClick={() => {
                setTipoFiltro("villa")
              }}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                tipoFiltro === "villa"
                  ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              🏖️ Villa
            </button>

            {/* 6. Quinta */}
            <button
              type="button"
              onClick={() => {
                setTipoFiltro("quinta")
              }}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                tipoFiltro === "quinta"
                  ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              🌿 Quinta
            </button>

            {/* 7. Precio alto */}
            <button
              type="button"
              onClick={() => {
                setOrdenPrecio(prev => prev === "alto" ? "defecto" : "alto")
              }}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                ordenPrecio === "alto"
                  ? "bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-400/40"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              📈 Precio alto
            </button>

            {/* 8. Precio bajo */}
            <button
              type="button"
              onClick={() => {
                setOrdenPrecio(prev => prev === "bajo" ? "defecto" : "bajo")
              }}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                ordenPrecio === "bajo"
                  ? "bg-amber-500 text-slate-950 shadow-sm ring-2 ring-amber-400/40"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              📉 Precio bajo
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. BARRA DE CONTROL Y ALTERNADOR DE VISTAS (SPLIT / GRID)    */}
      {/* ============================================================ */}
      <section className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
              <Compass size={22} className="text-amber-600" />
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
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setVistaModo("split")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
        {/* 3. LAYOUT DINÁMICO: SPLIT VIEW (LISTA 50% + MAPA 50%) / SOLO TARJETAS (100% ANCHO) */}
        {/* ============================================================ */}
        <div className={`w-full ${
          vistaModo === "split" ? "grid grid-cols-1 lg:grid-cols-12 gap-6" : "w-full"
        }`}>
          {/* Columna de Tarjetas */}
          {vistaModo !== "map" && (
            <div className={`w-full ${
              vistaModo === "split" 
                ? "lg:col-span-7 xl:col-span-7 max-h-[850px] overflow-y-auto pr-1" 
                : "w-full"
            }`}>
              <div className={`w-full ${
                vistaModo === "split" 
                  ? "grid grid-cols-1 sm:grid-cols-2 gap-5" 
                  : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              }`}>
                {filteredStays.length === 0 ? (
                  <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-gray-200 shadow-sm">
                    <Compass size={40} className="mx-auto text-amber-500 mb-3 opacity-80" />
                    <h3 className="text-base font-bold text-gray-800">No se encontraron alojamientos</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                      Verifica el término de búsqueda o limpia los filtros para explorar todo nuestro catálogo de hospedajes en Ecuador y el mundo.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setDestinoInput("")
                        setTipoFiltro("todos")
                        setOrdenPrecio("defecto")
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
                    const curImgIdx = cardPhotoIdx[stay.id] || 0
                    const totalImgs = stay.imagenes?.length || 1
                    const currentImg = stay.imagenes?.[curImgIdx] || stay.imagenes?.[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                    const stats = getStayStats(stay)
                    const isFav = Boolean(favoritos[stay.id])

                    return (
                      <div
                        key={stay.id}
                        onClick={() => {
                          if (vistaModo === "split") {
                            setSelectedMapId(stay.id)
                            setMapCenter([stay.lat, stay.lng])
                            setMapZoom(15)
                          } else {
                            setSelectedStay(stay)
                            setActivePhotoIdx(0)
                          }
                        }}
                        onMouseEnter={() => {
                          if (vistaModo === "split") setSelectedMapId(stay.id)
                        }}
                        className={`bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border flex flex-col group cursor-pointer hover:-translate-y-1 relative ${
                          isHoveredOrActive && vistaModo === "split"
                            ? "border-amber-500 ring-4 ring-amber-400/25 shadow-xl -translate-y-1" 
                            : "border-slate-200/80 hover:border-amber-400/70"
                        }`}
                      >
                        {/* Portada con Carousel Inteligente y Aspect Ratio Expansivo */}
                        <div className="relative aspect-[16/11] w-full overflow-hidden bg-slate-950 select-none">
                          <img
                            src={currentImg}
                            alt={stay.titulo}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          />

                          {/* Gradiente Cinematográfico Sutil */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/30 pointer-events-none" />

                          {/* Flechas de Navegación de Fotos */}
                          {totalImgs > 1 && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => handlePrevPhoto(e, stay.id, totalImgs)}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all z-20 cursor-pointer active:scale-90 hover:scale-105"
                                title="Foto anterior"
                              >
                                <ChevronLeft size={16} className="stroke-[2.5]" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleNextPhoto(e, stay.id, totalImgs)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all z-20 cursor-pointer active:scale-90 hover:scale-105"
                                title="Foto siguiente"
                              >
                                <ChevronRight size={16} className="stroke-[2.5]" />
                              </button>
                            </>
                          )}

                          {/* Badges Superiores: Ubicación + Superhost */}
                          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10 pointer-events-none">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/75 text-white shadow-md backdrop-blur-md border border-white/15 flex items-center gap-1">
                              <span>{stay.bandera}</span>
                              <span>{stay.ciudad}</span>
                            </span>
                            {stay.isSuperhost && (
                              <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md backdrop-blur-sm border border-amber-300/50 flex items-center gap-1">
                                <Star size={10} className="fill-slate-950 text-slate-950" /> SUPERHOST
                              </span>
                            )}
                          </div>

                          {/* Botón Favorito (Top Right) */}
                          <button
                            type="button"
                            onClick={(e) => toggleFavorito(e, stay.id)}
                            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-md z-20 cursor-pointer active:scale-90 hover:scale-110 ${
                              isFav
                                ? "bg-rose-500 text-white shadow-rose-500/40 ring-2 ring-white/70"
                                : "bg-slate-950/45 hover:bg-slate-950/80 text-white border border-white/20"
                            }`}
                            title="Guardar en favoritos"
                          >
                            <Heart size={14} className={isFav ? "fill-white text-white" : "text-white"} />
                          </button>

                          {/* Indicadores de Puntos de Fotos (Bottom Right) */}
                          {totalImgs > 1 && (
                            <div className="absolute bottom-3 right-3 flex items-center gap-1 z-10 bg-slate-950/65 backdrop-blur-md px-2 py-1 rounded-full border border-white/15 shadow-sm">
                              {stay.imagenes.slice(0, 5).map((_, idx) => (
                                <span
                                  key={idx}
                                  className={`h-1.5 rounded-full transition-all ${
                                    curImgIdx === idx ? "w-3 bg-amber-400" : "w-1.5 bg-white/60"
                                  }`}
                                />
                              ))}
                            </div>
                          )}

                          {/* Precio por noche con Glassmorphism Boutique (Bottom Left) */}
                          <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-2xl text-white border border-white/15 shadow-xl z-10 flex items-baseline gap-1">
                            <span className="text-xs text-amber-400 font-extrabold">$</span>
                            <span className="text-base font-black text-white font-mono tracking-tight">{stay.precioNoche}</span>
                            <span className="text-[10px] text-slate-300 font-medium">USD/noche</span>
                          </div>
                        </div>

                        {/* Información de la Tarjeta */}
                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-2">
                            {/* Sector, Tipo y Calificación */}
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-600 uppercase tracking-wider truncate max-w-[65%]">
                                <MapPin size={12} className="text-amber-500 shrink-0" />
                                <span className="truncate">{stay.sector} • {stay.tipo}</span>
                              </div>
                              <div className="inline-flex items-center gap-1 text-xs font-black text-slate-900 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/25 shrink-0">
                                <Star size={11} className="fill-amber-400 text-amber-500" />
                                <span>{stats.rating.toFixed(2)}</span>
                                <span className="text-[10px] text-slate-400 font-normal">({stats.reviewsCount})</span>
                              </div>
                            </div>

                            {/* Título de la Residencia */}
                            <h3 className="font-black text-slate-900 text-sm sm:text-base leading-snug group-hover:text-amber-600 transition-colors line-clamp-1">
                              {stay.titulo}
                            </h3>

                            {/* Capacidad y Distribución */}
                            <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                              <span className="inline-flex items-center gap-1 text-[11px]">
                                <Bed size={13} className="text-slate-400" /> {stay.camas} cama{stay.camas > 1 ? "s" : ""}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="inline-flex items-center gap-1 text-[11px]">
                                <Bath size={13} className="text-slate-400" /> {stay.banos} baño{stay.banos > 1 ? "s" : ""}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="inline-flex items-center gap-1 text-[11px]">
                                <Users size={13} className="text-slate-400" /> {stay.maxHuespedes} huésp.
                              </span>
                            </div>

                            {/* Badge de Seguridad y Autonomía */}
                            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/70 w-fit">
                              <Key size={12} className="text-emerald-600 shrink-0" />
                              <span>Llegada autónoma 24/7 (Smart Lock)</span>
                            </div>

                            {/* Desglose de Estadía */}
                            <div className="bg-gradient-to-r from-slate-50 to-amber-50/40 border border-slate-200/80 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between text-xs">
                              <div>
                                <span className="text-[10px] text-slate-500 font-medium block">
                                  Total por {totalNoches} noche{totalNoches > 1 ? "s" : ""}:
                                </span>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                  <span className="font-black text-slate-950 text-sm sm:text-base font-mono tracking-tight">${granTotal}</span>
                                  <span className="text-[10px] text-slate-500 font-bold uppercase">USD</span>
                                  <span className="text-[9px] text-emerald-700 font-bold bg-emerald-100/80 px-1.5 py-0.2 rounded ml-1">IVA inc.</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 block font-medium">Limpieza</span>
                                <span className="text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-lg border border-slate-200/80 shadow-2xs inline-block mt-0.5 font-mono">
                                  +${stay.tarifaLimpieza} USD
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Acciones de la Tarjeta */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedStay(stay)
                                setActivePhotoIdx(0)
                              }}
                              className="flex-1 py-2.5 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all text-center cursor-pointer active:scale-95 border border-slate-200/60"
                            >
                              Detalles
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStartBooking(stay)
                              }}
                              className="flex-1 py-2.5 px-3 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-xl transition-all shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border border-amber-300/40"
                            >
                              <Calendar size={13} className="text-slate-950" />
                              <span>Reservar</span>
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
        <div className="fixed inset-0 z-[100] bg-white w-screen h-screen overflow-y-auto flex flex-col animate-fadeIn">
          {/* Header Pantalla Completa Inmersiva */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3.5 border-b border-gray-200 flex items-center justify-between z-30 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSelectedStay(null)}
                className="p-2 -ml-2 rounded-xl text-gray-700 hover:text-gray-950 hover:bg-gray-100 transition-colors flex items-center gap-1.5 cursor-pointer font-bold text-xs shrink-0"
                title="Volver a los alojamientos"
              >
                <ChevronLeft size={20} className="text-gray-800" />
                <span className="hidden sm:inline">Volver a los Alojamientos</span>
              </button>
              <div className="h-5 w-px bg-gray-200 hidden sm:block shrink-0" />
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 flex items-center gap-1 shrink-0">
                <span>{selectedStay.bandera}</span> {selectedStay.ciudad}, {selectedStay.pais}
              </span>
              <h3 className="font-black text-gray-900 text-sm sm:text-base md:text-lg truncate">
                {selectedStay.titulo}
              </h3>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden md:flex items-center gap-1.5 text-xs font-bold text-gray-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                <Star size={14} className="fill-amber-400 text-amber-500" />
                <span className="font-black text-gray-900">{getStayStats(selectedStay).rating.toFixed(2)}</span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-600">{getStayStats(selectedStay).reviewsCount} evaluaciones</span>
              </div>
              <button
                onClick={() => setSelectedStay(null)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 hover:text-gray-950 transition-colors cursor-pointer shadow-xs"
                aria-label="Cerrar pantalla completa"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 space-y-8 flex-1">
            {/* Galería Principal a Pantalla Completa */}
            <div>
              <div className="relative h-80 sm:h-[450px] md:h-[540px] w-full rounded-3xl overflow-hidden bg-gray-950 mb-3 shadow-lg">
                <img
                  src={selectedStay.imagenes[activePhotoIdx]}
                  alt={selectedStay.titulo}
                  className="w-full h-full object-cover"
                />
                {selectedStay.imagenes.length > 1 && (
                  <>
                    <button
                      onClick={() => setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : selectedStay.imagenes.length - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg backdrop-blur-sm"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={() => setActivePhotoIdx((prev) => (prev < selectedStay.imagenes.length - 1 ? prev + 1 : 0))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg backdrop-blur-sm"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
                <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                  <Camera size={14} />
                  <span>{activePhotoIdx + 1} / {selectedStay.imagenes.length} fotos</span>
                </div>
              </div>

              {/* Miniaturas de la Galería */}
              <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
                {selectedStay.imagenes.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative w-24 sm:w-28 h-16 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activePhotoIdx === idx ? 'border-amber-500 ring-2 ring-amber-400/40 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Miniatura" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Ficha y Desglose de Precios */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2 items-start">
              <div className="lg:col-span-2 space-y-6">
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
                <div className="bg-slate-50 rounded-3xl p-6 border border-gray-200/90 shadow-lg sticky top-24 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-2xl font-black text-gray-900">${selectedStay.precioNoche}</span>
                        <span className="text-xs text-gray-500 font-normal"> USD / noche</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-800 bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        <span>{getStayStats(selectedStay).rating.toFixed(2)}</span>
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
                      <span className="text-xl font-black text-gray-900">{getStayStats(selectedStay).rating.toFixed(2)}</span>
                      <span className="text-sm text-gray-400 font-semibold">•</span>
                      <span className="text-sm font-bold text-gray-800">
                        {getStayStats(selectedStay).reviewsCount} evaluaciones
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
                  {[...getStayStats(selectedStay).reviews, ...getDefaultReviewsForListing(selectedStay)].map((rev) => (
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
                          <Star size={12} className="fill-amber-500 text-amber-500" /> {getStayStats(bookingStay).rating.toFixed(2)}
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
                        <Link 
                          href={`/stays/auth?redirect=/stays&stayId=${bookingStay.id}&action=reservar&title=${encodeURIComponent(bookingStay.titulo)}`} 
                          className="text-xs font-bold text-amber-800 underline hover:text-amber-950"
                        >
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
                  {/* Banner de Seguridad y Transparencia Corporativa SARA */}
                  <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-slate-50 to-amber-50 rounded-2xl border border-emerald-200/80 flex items-start gap-3">
                    <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-900">Reserva Segura con SARA Constructora Cía. Ltda.</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Garantía 100% Corporativa
                        </span>
                      </div>
                      <p className="text-gray-600 text-[11px] leading-relaxed">
                        Todos los pagos (el anticipo del <strong>{politicas.porcentajeAnticipo}%</strong> al reservar y el saldo del <strong>{100 - politicas.porcentajeAnticipo}%</strong> al hacer check-in) se realizan directamente a las cuentas oficiales de la empresa <strong>SARA</strong>. El pago neto es transferido al anfitrión <strong>únicamente una vez realizado tu check-in satisfactorio</strong>, protegiendo tu inversión y respaldando el cumplimiento total del servicio.
                      </p>
                    </div>
                  </div>

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
                          title: `Anticipo Flexible (${politicas.porcentajeAnticipo}%)`,
                          desc: `Bloquea tu fecha con solo el ${politicas.porcentajeAnticipo}% ahora y liquida el resto al check-in.`,
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
                        Al emitir tu reserva, tus fechas quedan inmediatamente aseguradas en el sistema.
                      </p>

                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <label className="text-[11px] font-bold text-gray-700 uppercase block mb-2">
                          Adjuntar Comprobante (Obligatorio)
                        </label>
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*,.pdf" 
                            onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className={`p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${receiptFile ? 'border-amber-500 bg-amber-50' : 'border-gray-300 hover:border-amber-400 bg-white'}`}>
                            {receiptFile ? (
                              <>
                                <CheckCircle2 className="text-amber-600" size={24} />
                                <span className="font-bold text-amber-900 text-xs text-center">{receiptFile.name}</span>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="text-gray-400" size={24} />
                                <span className="font-bold text-gray-600 text-xs text-center">Haz clic para subir o arrastra tu comprobante</span>
                                <span className="text-[10px] text-gray-400 text-center">Formatos: JPG, PNG, PDF (Máx. 5MB)</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
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
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-bold text-amber-900">
                        <ShieldCheck size={16} className="text-amber-600" />
                        <span>Garantía de Anticipo Flexible ({politicas.porcentajeAnticipo}%):</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span>Anticipo a pagar hoy ({politicas.porcentajeAnticipo}%):</span>
                        <strong className="text-base font-black text-amber-900">
                          ${Math.round(((bookingStay.precioNoche * totalNoches) + bookingStay.tarifaLimpieza) * (politicas.porcentajeAnticipo / 100))} USD
                        </strong>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500 border-t border-amber-200/60 pt-1">
                        <span>Saldo restante al Check-in ({100 - politicas.porcentajeAnticipo}%):</span>
                        <strong>
                          ${Math.round(((bookingStay.precioNoche * totalNoches) + bookingStay.tarifaLimpieza) * ((100 - politicas.porcentajeAnticipo) / 100))} USD
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* Política Oficial de Cancelación y Reembolso Transparente - SIEMPRE VISIBLE */}
                  {(() => {
                    const totalEstadia = (bookingStay.precioNoche * totalNoches) + bookingStay.tarifaLimpieza
                    const retMas10 = Math.round(totalEstadia * (politicas.penalizacionMas10Dias / 100))
                    const devMas10 = Math.round(totalEstadia * (Math.max(0, 100 - politicas.penalizacionMas10Dias) / 100))
                    
                    const ret5a10 = Math.round(totalEstadia * (politicas.penalizacion5a10Dias / 100))
                    const dev5a10 = Math.round(totalEstadia * (Math.max(0, 100 - politicas.penalizacion5a10Dias) / 100))
                    
                    const ret2a5 = Math.round(totalEstadia * (politicas.penalizacion2a5Dias / 100))
                    const dev2a5 = Math.round(totalEstadia * (Math.max(0, 100 - politicas.penalizacion2a5Dias) / 100))
                    
                    const ret24h = Math.round(totalEstadia * (politicas.penalizacion24Horas / 100))
                    const dev24h = Math.round(totalEstadia * (Math.max(0, 100 - politicas.penalizacion24Horas) / 100))

                    return (
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white border border-slate-800 space-y-3 text-xs shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-amber-400">
                            <ShieldCheck size={17} />
                            <span className="text-xs uppercase tracking-wide">Política Oficial de Cancelación & Reembolso</span>
                          </div>
                          <span className="text-[10px] bg-white/10 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                            Transparencia SARA STAYS
                          </span>
                        </div>
                        
                        <p className="text-[11px] text-gray-300 leading-snug">
                          Aseguras tus fechas con el <strong>{politicas.porcentajeAnticipo}% de anticipo</strong> (o pago total). Si necesitas cancelar tu reservación, se aplican los siguientes porcentajes de penalización sobre el total de tu estancia (${totalEstadia.toLocaleString()} USD) y te reembolsamos la diferencia restante:
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 text-[11px]">
                          {/* a) Más de 10 días */}
                          <div className="bg-white/5 p-2.5 rounded-xl border border-emerald-500/20 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-[10px]">📅 a) &gt; 10 días</span>
                              <span className="text-[9px] font-bold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                                {politicas.penalizacionMas10Dias}%
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400">
                              Retención: -${retMas10} USD
                            </p>
                            <div className="pt-1 border-t border-white/10 space-y-0.5">
                              <span className="text-emerald-400 font-extrabold block text-[11px]">
                                ✓ Reembolso: {Math.max(0, 100 - politicas.penalizacionMas10Dias)}%
                              </span>
                              <span className="text-[9px] text-gray-300 block">
                                (${devMas10} USD devuelto)
                              </span>
                            </div>
                          </div>

                          {/* b) De 5 a 10 días */}
                          <div className="bg-white/5 p-2.5 rounded-xl border border-amber-500/20 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-[10px]">⏱️ b) 5 a 10 días</span>
                              <span className="text-[9px] font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40">
                                {politicas.penalizacion5a10Dias}%
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400">
                              Retención: -${ret5a10} USD
                            </p>
                            <div className="pt-1 border-t border-white/10 space-y-0.5">
                              <span className="text-amber-400 font-extrabold block text-[11px]">
                                ✓ Reembolso: {Math.max(0, 100 - politicas.penalizacion5a10Dias)}%
                              </span>
                              <span className="text-[9px] text-gray-300 block">
                                (${dev5a10} USD devuelto)
                              </span>
                            </div>
                          </div>

                          {/* c) De 2 a 5 días */}
                          <div className="bg-white/5 p-2.5 rounded-xl border border-orange-500/20 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-[10px]">⏳ c) 2 a 5 días</span>
                              <span className="text-[9px] font-bold text-orange-300 bg-orange-950/80 px-1.5 py-0.5 rounded border border-orange-500/40">
                                {politicas.penalizacion2a5Dias}%
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400">
                              Retención: -${ret2a5} USD
                            </p>
                            <div className="pt-1 border-t border-white/10 space-y-0.5">
                              <span className="text-orange-400 font-extrabold block text-[11px]">
                                ✓ Reembolso: {Math.max(0, 100 - politicas.penalizacion2a5Dias)}%
                              </span>
                              <span className="text-[9px] text-gray-300 block">
                                (${dev2a5} USD devuelto)
                              </span>
                            </div>
                          </div>

                          {/* d) Dentro de 24 Horas (Sin Devolución) */}
                          <div className="bg-white/5 p-2.5 rounded-xl border border-rose-500/20 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-[10px]">🚨 d) &lt; 24h</span>
                              <span className="text-[9px] font-bold text-rose-300 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/40">
                                {politicas.penalizacion24Horas}%
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400">
                              Retención: -${ret24h} USD
                            </p>
                            <div className="pt-1 border-t border-white/10 space-y-0.5">
                              <span className="text-rose-400 font-extrabold block text-[11px]">
                                ❌ Sin devolución
                              </span>
                              <span className="text-[9px] text-rose-300 block">
                                ($0 USD reembolsable)
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-[10px] text-gray-400 italic pt-1 border-t border-white/10">
                          * Regla Oficial: El porcentaje de la penalización se divide el 50% para la empresa SARA-STAYS y el 50% para el anfitrión; la diferencia restante se devuelve al huésped o cliente (salvo dentro de las 24 horas, donde no existe devolución). Reembolsos procesados en {politicas.diasReembolso} mediante {politicas.metodoDevolucion}.
                        </p>
                      </div>
                    )
                  })()}

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

                      {/* Políticas de Cancelación y Reembolso en el Voucher */}
                      <div className="sm:col-span-2 bg-white/5 p-3.5 rounded-xl border border-white/10 text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[10px] uppercase tracking-wider">
                          <ShieldCheck size={14} />
                          <span>Garantía & Política de Cancelación y Reembolso</span>
                        </div>
                        <p className="text-[11px] text-gray-300 leading-snug">
                          Reserva garantizada con anticipo del <strong>{politicas.porcentajeAnticipo}%</strong>. En caso de cancelación voluntaria:
                          <br />• <strong>a) Más de 10 días:</strong> Penalización {politicas.penalizacionMas10Dias}% (Devolución del {Math.max(0, 100 - politicas.penalizacionMas10Dias)}% del total).
                          <br />• <strong>b) De 5 a 10 días:</strong> Penalización {politicas.penalizacion5a10Dias}% (Devolución del {Math.max(0, 100 - politicas.penalizacion5a10Dias)}% del total).
                          <br />• <strong>c) De 2 a 5 días:</strong> Penalización {politicas.penalizacion2a5Dias}% (Devolución del {Math.max(0, 100 - politicas.penalizacion2a5Dias)}% del total).
                          <br />• <strong>d) Dentro de las 24 horas:</strong> Penalización {politicas.penalizacion24Horas}% (¡No existe devolución de la reserva - 0% de reembolso!).
                          <br />• <em>Regla Oficial:</em> El porcentaje de la penalización retenida se divide el 50% para la empresa SARA-STAYS y el 50% para el anfitrión; la diferencia restante se devuelve al huésped o cliente.
                          <br />• Reembolsos liquidados en {politicas.diasReembolso} mediante {politicas.metodoDevolucion}.
                        </p>
                      </div>
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
                      href="/stays/mis-reservas"
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

      {/* Dedicated Footer for Standalone Airbnb */}
      <footer className="bg-slate-950 border-t border-slate-800 text-gray-400 py-12 px-4 sm:px-8 mt-20">
        <div className="w-full max-w-[1760px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logoStays} alt="SARA Stays" className="w-8 h-8 rounded-lg object-contain bg-white p-0.5" />
            <div>
              <span className="font-black text-white text-sm tracking-wide">SARA STAYS</span>
              <p className="text-xs text-gray-500">Hospédate · Red Global de Alojamientos, Suites & Hospedaje Inteligente</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs">
            <Link href="/inmobiliaria" className="hover:text-white transition-colors">Portal Inmobiliario</Link>
            <Link href="/stays/mis-reservas" className="hover:text-white transition-colors">Mis Reservas & Anfitrión</Link>
            <Link href="/" className="hover:text-white transition-colors">Sara Constructora</Link>
            <a href="https://wa.me/593981804023" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">Soporte WhatsApp: +593 98 180 4023</a>
          </div>
          <div className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} SARA Constructora & Hospitality. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* Modal: Registrar Nuevo Alojamiento Airbnb (Imagen 3) */}
      <RegistrarAlojamientoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleAlojamientoCreado}
        activeGuest={activeGuest}
        existingCount={alojamientos.length}
        initialPolicies={politicas}
      />
    </div>
  )
}
