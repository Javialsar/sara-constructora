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
  DollarSign
} from "lucide-react"

export interface AirbnbListing {
  id: string
  codigo: string
  titulo: string
  tipo: "suite" | "loft" | "penthouse" | "quinta" | "studio"
  precioNoche: number
  tarifaLimpieza: number
  rating: number
  reviewsCount: number
  isSuperhost: boolean
  maxHuespedes: number
  camas: number
  habitaciones: number
  banos: number
  sector: string
  ciudad: string
  imagenes: string[]
  descripcion: string
  amenidades: string[]
  reglas: string[]
}

const AIRBNB_DATA: AirbnbListing[] = [
  {
    id: "ab-1",
    codigo: "SARA-AIR-01",
    titulo: "Master Suite de Diseño Frente al Río Tomebamba",
    tipo: "suite",
    precioNoche: 48,
    tarifaLimpieza: 15,
    rating: 4.98,
    reviewsCount: 54,
    isSuperhost: true,
    maxHuespedes: 2,
    camas: 1,
    habitaciones: 1,
    banos: 1,
    sector: "Puertas del Sol",
    ciudad: "Cuenca",
    imagenes: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "Disfruta de amaneceres únicos con el sonido del río Tomebamba. Suite contemporánea equipada con cerradura inteligente para llegada autónoma 24/7, cama King con sábanas de 600 hilos, cafetera Nespresso e internet simétrico de alta velocidad.",
    amenidades: ["Vista al Río", "WiFi 300 Mbps Fibra", "Smart Lock (Self Check-in)", "Smart TV 55\" 4K", "Cafetera Nespresso", "Parqueadero Subterráneo Privado", "Cocina Equipada"],
    reglas: ["Check-in: 15:00 a 22:00", "Check-out: 11:00", "No se permiten fiestas", "No fumar dentro de la suite"]
  },
  {
    id: "ab-2",
    codigo: "SARA-AIR-02",
    titulo: "Loft Patrimonial en Calle Larga - Centro Histórico",
    tipo: "loft",
    precioNoche: 59,
    tarifaLimpieza: 20,
    rating: 4.95,
    reviewsCount: 78,
    isSuperhost: true,
    maxHuespedes: 3,
    camas: 2,
    habitaciones: 1,
    banos: 1.5,
    sector: "Centro Histórico",
    ciudad: "Cuenca",
    imagenes: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "Una joya arquitectónica restaurada que combina muros originales de adobe visto con acabados industriales de acero y madera noble. A solo 4 minutos a pie del Parque Calderón y los mejores restaurantes de la ciudad.",
    amenidades: ["Balcón Republicano", "Paredes de Adobe Visto", "Cama Queen", "Cocina Integral", "Agua Caliente Centralizada", "WiFi Alta Velocidad", "Espacio de Trabajo"],
    reglas: ["Check-in: 14:00", "Check-out: 11:00", "Pet Friendly (Bajo petición)", "Cuidado con patrimonio arquitectónico"]
  },
  {
    id: "ab-3",
    codigo: "SARA-AIR-03",
    titulo: "Villa Campestre Los Guayacanes con Piscina en Yunguilla",
    tipo: "quinta",
    precioNoche: 165,
    tarifaLimpieza: 35,
    rating: 5.0,
    reviewsCount: 38,
    isSuperhost: true,
    maxHuespedes: 8,
    camas: 5,
    habitaciones: 4,
    banos: 3.5,
    sector: "Valle de Yunguilla",
    ciudad: "Santa Isabel",
    imagenes: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "El escape de fin de semana definitivo bajo el cálido sol de Yunguilla. Piscina temperada privada, zona de fogata nocturna, pérgola BBQ con horno de leña, billar y árboles de cítricos a tu disposición.",
    amenidades: ["Piscina Temperada Privada", "Pérgola BBQ con Horno de Leña", "Zona de Fogata", "Mesa de Billar", "Parqueo para 6 Autos", "Clima Cálido", "Sonido Envolvente"],
    reglas: ["Check-in: 13:00", "Check-out: 16:00 (Late check-out)", "Mascotas bienvenidas", "Música moderada después de medianoche"]
  },
  {
    id: "ab-4",
    codigo: "SARA-AIR-04",
    titulo: "Studio Workation El Vergel - Diseñado para Nómadas",
    tipo: "studio",
    precioNoche: 39,
    tarifaLimpieza: 12,
    rating: 4.92,
    reviewsCount: 42,
    isSuperhost: false,
    maxHuespedes: 2,
    camas: 1,
    habitaciones: 1,
    banos: 1,
    sector: "El Vergel / Estadio",
    ciudad: "Cuenca",
    imagenes: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502005229762-ae1b46000282?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "Estación de trabajo ergonómica con monitor dual de 27\", silla Herman Miller, internet fibra de 400 Mbps y generador de respaldo en el edificio. Ideal para estadías de teletrabajo de 1 semana a varios meses.",
    amenidades: ["Estación de Trabajo Dual", "WiFi 400 Mbps Simétrico", "Lavasecadora en Suite", "Gimnasio en Edificio", "Cama Queen", "Generador Eléctrico 100%"],
    reglas: ["Check-in autónomo 24h", "Check-out: 11:00", "Estricto no fumar", "Silencio laboral en áreas comunes"]
  },
  {
    id: "ab-5",
    codigo: "SARA-AIR-05",
    titulo: "Penthouse Dúplex con Terraza y Jacuzzi en Ordóñez Lasso",
    tipo: "penthouse",
    precioNoche: 98,
    tarifaLimpieza: 25,
    rating: 4.97,
    reviewsCount: 31,
    isSuperhost: true,
    maxHuespedes: 5,
    camas: 3,
    habitaciones: 2,
    banos: 2.5,
    sector: "Ordóñez Lasso",
    ciudad: "Cuenca",
    imagenes: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "El punto más alto y exclusivo del sector oeste de Cuenca. Terraza panorámica privada de 45 m² con jacuzzi al aire libre, chimenea de bioetanol y vistas de 360 grados hacia las montañas y la ciudad.",
    amenidades: ["Jacuzzi Privado en Terraza", "Chimenea de Bioetanol", "Vista 360° a Cuenca", "Ascensor Directo al Penthouse", "2 Parqueaderos Cubiertos", "Cama King + Queen"],
    reglas: ["Check-in: 15:00", "Check-out: 12:00", "Uso prudente del jacuzzi", "Capacidad estricta a 5 personas"]
  }
]

export default function AirbnbPage() {
  const [categoriaTab, setCategoriaTab] = useState<string>("todos")
  const [sectorFiltro, setSectorFiltro] = useState<string>("todos")
  const [huespedesFiltro, setHuespedesFiltro] = useState<number>(1)
  const [searchTerm, setSearchTerm] = useState<string>("")
  
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
      // Categoría
      if (categoriaTab !== "todos" && stay.tipo !== categoriaTab) return false
      // Sector
      if (sectorFiltro !== "todos" && stay.sector.toLowerCase() !== sectorFiltro.toLowerCase()) return false
      // Huéspedes
      if (huespedesFiltro > 1 && stay.maxHuespedes < huespedesFiltro) return false
      // Texto
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const match = (
          stay.titulo.toLowerCase().includes(q) ||
          stay.sector.toLowerCase().includes(q) ||
          stay.descripcion.toLowerCase().includes(q)
        )
        if (!match) return false
      }
      return true
    })
  }, [categoriaTab, sectorFiltro, huespedesFiltro, searchTerm])

  const openWhatsAppReserva = (stay: AirbnbListing) => {
    const subtotal = stay.precioNoche * totalNoches
    const granTotal = subtotal + stay.tarifaLimpieza
    const msg = encodeURIComponent(
      `Hola SARA Hospitality / Airbnb. Me gustaría reservar el alojamiento "${stay.titulo}" (Ref: ${stay.codigo}).\n` +
      `📅 Fechas: ${checkInDate} al ${checkOutDate} (${totalNoches} noches)\n` +
      `👥 Huéspedes: ${guestsCount} persona(s)\n` +
      `💰 Total estimado: $${granTotal} USD ($${stay.precioNoche}/noche + $${stay.tarifaLimpieza} limpieza).\n` +
      `¿Tienen disponibilidad en estas fechas?`
    )
    window.open(`https://wa.me/593981804023?text=${msg}`, "_blank")
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-20">
      {/* ============================================================ */}
      {/* 1. HERO SECTION ESTILO HOSPITALITY / AIRBNB LUXURY           */}
      {/* ============================================================ */}
      <section className="relative pt-32 pb-24 bg-gradient-to-b from-[#0a1b12] via-[#0d2218] to-slate-900 text-white overflow-hidden">
        {/* Grilla sutil de fondo */}
        <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black tracking-widest uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-4 backdrop-blur-md">
              <Sparkles size={14} /> SARA Suites & Alojamientos Temporales
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
              Hospédate en Cuenca con el Estilo y Confort de SARA
            </h1>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              Suites ejecutivas, lofts en el Centro Histórico y villas vacacionales con piscina en Yunguilla. Reserva por noche con atención personalizada 24/7.
            </p>
          </div>

          {/* Barra Flotante de Reserva Rápida tipo Airbnb */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-4 md:p-5 shadow-2xl border border-gray-100 text-gray-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Destino / Sector */}
              <div className="border-b sm:border-b-0 sm:border-r border-gray-100 pb-2 sm:pb-0 sm:pr-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Destino / Zona</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select 
                    value={sectorFiltro}
                    onChange={(e) => setSectorFiltro(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white"
                  >
                    <option value="todos">Cualquier zona</option>
                    <option value="Puertas del Sol">Puertas del Sol (Río)</option>
                    <option value="Centro Histórico">Centro Histórico</option>
                    <option value="Valle de Yunguilla">Valle de Yunguilla</option>
                    <option value="El Vergel / Estadio">El Vergel</option>
                    <option value="Ordóñez Lasso">Ordóñez Lasso</option>
                  </select>
                </div>
              </div>

              {/* Check-In */}
              <div className="border-b sm:border-b-0 sm:border-r border-gray-100 pb-2 sm:pb-0 sm:pr-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Fecha Llegada</label>
                <input 
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white text-gray-700"
                />
              </div>

              {/* Check-Out */}
              <div className="border-b sm:border-b-0 lg:border-r border-gray-100 pb-2 sm:pb-0 lg:pr-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Fecha Salida</label>
                <input 
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white text-gray-700"
                />
              </div>

              {/* Huéspedes & Botón */}
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Huéspedes</label>
                  <select
                    value={huespedesFiltro}
                    onChange={(e) => setHuespedesFiltro(Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white text-gray-700"
                  >
                    <option value={1}>1 Persona</option>
                    <option value={2}>2 Personas</option>
                    <option value={4}>4+ Personas</option>
                    <option value={6}>6+ Personas</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="px-4 py-2 bg-brand-sage hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/20 transition-all shrink-0"
                >
                  <Search size={14} /> Buscar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. CATEGORÍAS TIPO PILL & LISTADO AIRBNB                     */}
      {/* ============================================================ */}
      <section className="container mx-auto px-4 md:px-8 -mt-6 relative z-20">
        {/* Pills de Categorías */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
          {[
            { id: "todos", label: "Todos los Alojamientos", icon: Building },
            { id: "suite", label: "Suites Ejecutivas", icon: Laptop },
            { id: "loft", label: "Lofts Patrimoniales", icon: Key },
            { id: "quinta", label: "Villas con Piscina", icon: Palmtree },
            { id: "studio", label: "Workation & Nómadas", icon: Wifi },
            { id: "penthouse", label: "Penthouses Panorámicos", icon: Sparkles }
          ].map((cat) => {
            const Icon = cat.icon
            const isActive = categoriaTab === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setCategoriaTab(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isActive
                    ? "bg-gray-900 text-white border-gray-900 shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={14} className={isActive ? "text-amber-400" : "text-gray-400"} />
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Grid de Alojamientos tipo Airbnb */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStays.map((stay) => (
            <div
              key={stay.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col group"
            >
              {/* Carrusel de Fotos con proporción áurea */}
              <div className="relative h-64 w-full overflow-hidden bg-gray-100">
                <img
                  src={stay.imagenes[0]}
                  alt={stay.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Badges Superiores */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  {stay.isSuperhost && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/95 text-gray-900 shadow-md backdrop-blur-sm border border-gray-200 flex items-center gap-1">
                      <Star size={11} className="fill-amber-400 text-amber-400" /> SUPERHOST
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-700/90 text-white shadow-md">
                    {stay.sector}
                  </span>
                </div>

                {/* Rating en la esquina derecha */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span>{stay.rating.toFixed(2)}</span>
                  <span className="text-[10px] text-gray-300">({stay.reviewsCount})</span>
                </div>

                {/* Precio por noche flotante */}
                <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl text-white shadow-md">
                  <span className="text-xl font-black">${stay.precioNoche}</span>
                  <span className="text-xs text-gray-300 font-normal"> / noche</span>
                </div>
              </div>

              {/* Información del Alojamiento */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold mb-1">
                    <span>Hasta {stay.maxHuespedes} huéspedes</span>
                    <span>·</span>
                    <span>{stay.habitaciones} hab.</span>
                    <span>·</span>
                    <span>{stay.camas} cama(s)</span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-brand-sage transition-colors line-clamp-1 mb-2">
                    {stay.titulo}
                  </h3>

                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                    {stay.descripcion}
                  </p>

                  {/* Amenidades destacadas */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {stay.amenidades.slice(0, 3).map((amenidad, idx) => (
                      <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                        {amenidad}
                      </span>
                    ))}
                    {stay.amenidades.length > 3 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-50 text-gray-400">
                        +{stay.amenidades.length - 3} más
                      </span>
                    )}
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
                    Ver Detalles
                  </button>

                  <button
                    onClick={() => {
                      setSelectedStay(stay)
                      setActivePhotoIdx(0)
                    }}
                    className="flex-1 py-2 px-3 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Calendar size={13} /> Reservar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. BANNER PARA INVERSIONISTAS (PROPERTY MANAGEMENT AIRBNB)   */}
      {/* ============================================================ */}
      <section className="container mx-auto px-4 md:px-8 mt-20">
        <div className="bg-gradient-to-r from-slate-900 via-[#10241b] to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden border border-amber-500/20">
          <div className="max-w-2xl relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-4">
              <Sparkles size={14} /> Inversiones de Alta Rentabilidad SARA
            </span>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-4 leading-tight">
              ¿Quieres ganar entre el 10% y el 15% anual con tu propiedad en Airbnb?
            </h2>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">
              Nosotros nos encargamos de absolutamente todo: te construimos las suites turísticas o remodelamos tu departamento, lo amueblamos con estilo de diseño, lo publicamos en Airbnb y Booking, gestionamos a los huéspedes y el aseo, y tú recibes tus utilidades mensuales garantizadas.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://wa.me/593981804023?text=Hola%20SARA%20Constructora%2C%20tengo%20inter%C3%A9s%20en%20el%20servicio%20de%20gesti%C3%B3n%20e%20inversi%C3%B3n%20para%20Airbnb."
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-950/40 inline-flex items-center gap-2"
              >
                Conversar con un Asesor de Inversión <ArrowRight size={15} />
              </a>
              <Link
                href="/contacto"
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/20"
              >
                Agendar Reunión en Oficina
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. MODAL DETALLE DE ALOJAMIENTO & COTIZADOR DE ESTADÍA      */}
      {/* ============================================================ */}
      {selectedStay && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-100 relative flex flex-col">
            {/* Header del Modal */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between z-20">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Ref: {selectedStay.codigo}
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
                        <span className="text-xs text-gray-500 font-normal"> / noche</span>
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
                          ${((selectedStay.precioNoche * totalNoches) + selectedStay.tarifaLimpieza).toLocaleString()}
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
