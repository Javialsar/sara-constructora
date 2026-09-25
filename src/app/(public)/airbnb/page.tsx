"use client"
import React, { useState, useMemo } from "react"
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
  Columns
} from "lucide-react"
import AirbnbMapWrapper from "@/components/ui/AirbnbMapWrapper"

export interface AirbnbListing {
  id: string
  codigo: string
  titulo: string
  tipo: "suite" | "loft" | "penthouse" | "quinta" | "studio" | "villa"
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

  // Filtrado de alojamientos
  const filteredStays = useMemo(() => {
    return AIRBNB_DATA.filter((stay) => {
      // Alcance (Nacional vs Internacional)
      if (alcanceTab !== "todos" && stay.alcance !== alcanceTab) return false
      // Sector
      if (sectorFiltro !== "todos" && stay.sector.toLowerCase() !== sectorFiltro.toLowerCase() && stay.ciudad.toLowerCase() !== sectorFiltro.toLowerCase()) return false
      // Tipo
      if (tipoFiltro !== "todos" && stay.tipo !== tipoFiltro) return false
      // Huéspedes
      if (huespedesFiltro > 1 && stay.maxHuespedes < huespedesFiltro) return false
      // Texto
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
  }, [alcanceTab, sectorFiltro, tipoFiltro, huespedesFiltro, searchTerm])

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

  // Manejar el cambio de destino y centrar el mapa
  const handleDestinoChange = (destino: string) => {
    setSectorFiltro(destino)
    if (destino === "Cuenca") {
      setMapCenter([-2.8980, -79.0100])
      setMapZoom(13)
    } else if (destino === "Puertas del Sol") {
      setMapCenter([-2.8980, -79.0180])
      setMapZoom(15)
    } else if (destino === "Centro Histórico") {
      setMapCenter([-2.8974, -79.0045])
      setMapZoom(15)
    } else if (destino === "Valle de Yunguilla") {
      setMapCenter([-3.2730, -79.3140])
      setMapZoom(13)
    } else if (destino === "Guayaquil") {
      setMapCenter([-2.1810, -79.8760])
      setMapZoom(14)
    } else if (destino === "Galápagos") {
      setMapCenter([-0.7432, -90.3135])
      setMapZoom(12)
    } else if (destino === "Miami, FL") {
      setMapCenter([25.7617, -80.1918])
      setMapZoom(13)
    } else if (destino === "Madrid") {
      setMapCenter([40.4280, -3.6840])
      setMapZoom(13)
    } else if (destino === "Cancún") {
      setMapCenter([21.1350, -86.7490])
      setMapZoom(12)
    } else if (destino === "Medellín") {
      setMapCenter([6.2085, -75.5670])
      setMapZoom(13)
    } else {
      setMapCenter([-2.8980, -79.0100])
      setMapZoom(12)
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
      <section className="relative pt-32 pb-20 bg-gradient-to-b from-[#0a1b12] via-[#0d2218] to-slate-900 text-white overflow-hidden">
        {/* Grilla sutil de fondo */}
        <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black tracking-widest uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-3 backdrop-blur-md">
              <Globe size={14} /> Red Global SARA Hospitality · Nacional & Mundial
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-3 leading-tight">
              Alojamientos Exclusivos y Suites con Precios en Mapa
            </h1>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              Selecciona tu destino, fechas de viaje y número de huéspedes para explorar la disponibilidad y tarifas exactas georreferenciadas en tiempo real.
            </p>
          </div>

          {/* Caja Flotante de Reserva Inteligente */}
          <form onSubmit={handleSearchSubmit} className="max-w-5xl mx-auto bg-white rounded-2xl p-4 md:p-6 shadow-2xl border border-gray-100 text-gray-800">
            {/* Pestañas de Alcance Geográfico */}
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-4 mb-5">
              {[
                { id: "todos", label: "🌎 Todos los Destinos", count: AIRBNB_DATA.length },
                { id: "nacional", label: "🇪🇨 Ecuador (Nacional)", count: AIRBNB_DATA.filter(i => i.alcance === 'nacional').length },
                { id: "internacional", label: "✈️ Internacional (Mundial)", count: AIRBNB_DATA.filter(i => i.alcance === 'internacional').length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setAlcanceTab(tab.id as any)
                    setSectorFiltro("todos")
                    if (tab.id === 'nacional') {
                      setMapCenter([-2.8980, -79.0100])
                      setMapZoom(8)
                    } else if (tab.id === 'internacional') {
                      setMapCenter([25.0000, -40.0000])
                      setMapZoom(3)
                    } else {
                      setMapCenter([-2.8980, -79.0100])
                      setMapZoom(12)
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 ${
                    alcanceTab === tab.id
                      ? "bg-slate-900 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    alcanceTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}

              <div className="ml-auto text-xs text-gray-500 font-semibold flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-600" /> Tarifas Transparentes sin Comisiones
              </div>
            </div>

            {/* Barra de Filtros en Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Selector de Destino */}
              <div className="lg:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Destino / Zona</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select 
                    value={sectorFiltro}
                    onChange={(e) => handleDestinoChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs md:text-sm font-bold bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-gray-800"
                  >
                    <option value="todos">Cualquier destino disponible</option>
                    <optgroup label="🇪🇨 Ecuador">
                      <option value="Cuenca">Cuenca (Todas las zonas)</option>
                      <option value="Puertas del Sol">Cuenca - Puertas del Sol</option>
                      <option value="Centro Histórico">Cuenca - Centro Histórico</option>
                      <option value="Valle de Yunguilla">Valle de Yunguilla (Piscina)</option>
                      <option value="Guayaquil">Guayaquil - Puerto Santa Ana</option>
                      <option value="Galápagos">Galápagos - Puerto Ayora</option>
                    </optgroup>
                    <optgroup label="🌎 Internacional">
                      <option value="Miami, FL">Miami, FL (Brickell - EE.UU.)</option>
                      <option value="Madrid">Madrid (Barrio Salamanca - España)</option>
                      <option value="Cancún">Cancún (Zona Hotelera - México)</option>
                      <option value="Medellín">Medellín (El Poblado - Colombia)</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Check-In */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Fecha Llegada</label>
                <input 
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white text-gray-700 font-bold"
                />
              </div>

              {/* Check-Out */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Fecha Salida</label>
                <input 
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white text-gray-700 font-bold"
                />
              </div>

              {/* Huéspedes & Botón */}
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Huéspedes</label>
                  <select
                    value={huespedesFiltro}
                    onChange={(e) => setHuespedesFiltro(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white text-gray-700 font-bold"
                  >
                    <option value={1}>1 Persona</option>
                    <option value={2}>2 Personas</option>
                    <option value={4}>4+ Personas</option>
                    <option value={6}>6+ Personas</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/20 transition-all shrink-0"
                >
                  <Search size={14} /> Buscar
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. BARRA DE CONTROL Y ALTERNADOR DE VISTAS (SPLIT / GRID)    */}
      {/* ============================================================ */}
      <section className="container mx-auto px-4 md:px-8 -mt-6 relative z-20">
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
                {filteredStays.map((stay) => {
                  const isHoveredOrActive = selectedMapId === stay.id
                  const subtotal = stay.precioNoche * totalNoches
                  const granTotal = subtotal + stay.tarifaLimpieza

                  return (
                    <div
                      key={stay.id}
                      onMouseEnter={() => setSelectedMapId(stay.id)}
                      className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border flex flex-col group ${
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
                            <span>Hasta {stay.maxHuespedes} pers.</span>
                          </div>

                          <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-amber-600 transition-colors line-clamp-1 mb-1.5">
                            {stay.titulo}
                          </h3>

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
                            onClick={() => {
                              setSelectedStay(stay)
                              setActivePhotoIdx(0)
                            }}
                            className="flex-1 py-2 px-3 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-center"
                          >
                            Detalles
                          </button>

                          <button
                            onClick={() => {
                              setSelectedStay(stay)
                              setActivePhotoIdx(0)
                            }}
                            className="flex-1 py-2 px-3 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <Calendar size={13} /> Reservar
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
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
                      <div className="grid grid-cols-2 border-b border-gray-200">
                        <div className="p-2 border-r border-gray-200">
                          <label className="text-[10px] font-bold text-gray-400 uppercase block">Llegada</label>
                          <input 
                            type="date" 
                            value={checkInDate} 
                            onChange={(e) => setCheckInDate(e.target.value)}
                            className="w-full text-xs font-bold outline-none text-gray-800"
                          />
                        </div>
                        <div className="p-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase block">Salida</label>
                          <input 
                            type="date" 
                            value={checkOutDate} 
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            className="w-full text-xs font-bold outline-none text-gray-800"
                          />
                        </div>
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
                      onClick={() => openWhatsAppReserva(selectedStay)}
                      className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      <MessageCircle size={16} /> Reservar Ahora por WhatsApp
                    </button>
                    <p className="text-[11px] text-gray-400 text-center">
                      Confirmación y pago directo sin comisiones extras de portales
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
