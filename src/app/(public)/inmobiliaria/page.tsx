"use client"
import React, { useState, useMemo } from "react"
import Link from "next/link"
import { 
  Building2, 
  Search, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  Car, 
  Phone, 
  MessageCircle, 
  Calculator, 
  CheckCircle2, 
  Compass, 
  ArrowRight, 
  Filter, 
  X, 
  Eye, 
  Tag, 
  Layers, 
  Home, 
  Calendar, 
  Share2, 
  Heart,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  HardHat
} from "lucide-react"
import { Button } from "@/components/ui/Button"

// Tipos para el modelo inmobiliario
export interface Inmueble {
  id: string
  codigo: string
  titulo: string
  tipo: "casa" | "departamento" | "terreno" | "suite" | "local" | "quinta"
  modalidad: "venta" | "arriendo"
  precio: number
  alicuota?: number
  ciudad: string
  sector: string
  direccionAprox: string
  areaTotalM2: number
  areaConstruidaM2: number
  habitaciones: number
  banos: number
  parqueaderos: number
  antiguedadAnios: number
  aptoBiess: boolean
  destacada: boolean
  imagenes: string[]
  descripcion: string
  amenidades: string[]
}

const INMUEBLES_DATA: Inmueble[] = [
  {
    id: "inm-1",
    codigo: "SARA-CAS-01",
    titulo: "Casa de Lujo en Challuabamba con Jardín Privado",
    tipo: "casa",
    modalidad: "venta",
    precio: 285000,
    ciudad: "Cuenca",
    sector: "Challuabamba",
    direccionAprox: "Sector Colegio Alemán",
    areaTotalM2: 520,
    areaConstruidaM2: 360,
    habitaciones: 4,
    banos: 4.5,
    parqueaderos: 3,
    antiguedadAnios: 0,
    aptoBiess: true,
    destacada: true,
    imagenes: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "Espectacular residencia de diseño contemporáneo construida con estándares antisísmicos de primera. Cuenta con amplias áreas sociales de doble altura, cocina abierta tipo isla con cuarzo, master suite con jacuzzi y walk-in closet, además de un porche BBQ conectado al jardín posterior.",
    amenidades: ["Seguridad 24/7", "Área BBQ", "Cisterna y Bomba", "Gas Centralizado", "Jardín Amplio", "Acabados Importados", "Cámaras de Vigilancia"]
  },
  {
    id: "inm-2",
    codigo: "SARA-DEP-02",
    titulo: "Departamento Panorámico Frente al Río Tomebamba",
    tipo: "departamento",
    modalidad: "venta",
    precio: 148000,
    alicuota: 65,
    ciudad: "Cuenca",
    sector: "Puertas del Sol",
    direccionAprox: "Av. 3 de Noviembre",
    areaTotalM2: 145,
    areaConstruidaM2: 125,
    habitaciones: 3,
    banos: 2.5,
    parqueaderos: 2,
    antiguedadAnios: 2,
    aptoBiess: true,
    destacada: true,
    imagenes: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "Hermoso departamento en piso alto con vista frontal inigualable hacia el río y ciclovía. Edificio inteligente con ascensor de última generación, generador eléctrico total y áreas comunales de lujo.",
    amenidades: ["Ascensor", "Generador Eléctrico 100%", "Balcón con Vista al Río", "Bodega Privada", "Cerradura Digital", "Gimnasio Comunal"]
  },
  {
    id: "inm-3",
    codigo: "SARA-TER-03",
    titulo: "Terreno 100% Plano Listo para Construir en Ricaurte",
    tipo: "terreno",
    modalidad: "venta",
    precio: 79000,
    ciudad: "Cuenca",
    sector: "Ricaurte",
    direccionAprox: "Vía a Sidcay a 4 min del Parque Central",
    areaTotalM2: 620,
    areaConstruidaM2: 0,
    habitaciones: 0,
    banos: 0,
    parqueaderos: 0,
    antiguedadAnios: 0,
    aptoBiess: true,
    destacada: true,
    imagenes: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "Lote residencial con topografía perfectamente plana y todos los servicios básicos soterrados: agua potable, alcantarillado, luz y fibra óptica. Incluye anteproyecto arquitectónico prediseñado por SARA Constructora.",
    amenidades: ["Topografía Plana", "Obras Básicas Completas", "Vía Asfaltada", "Escrituras Inmediatas", "Sinergia Construcción SARA"]
  },
  {
    id: "inm-4",
    codigo: "SARA-SUI-04",
    titulo: "Suite Ejecutiva Amoblada en El Vergel",
    tipo: "suite",
    modalidad: "arriendo",
    precio: 480,
    alicuota: 45,
    ciudad: "Cuenca",
    sector: "El Vergel",
    direccionAprox: "A 2 cuadras del Estadio y Av. Solano",
    areaTotalM2: 68,
    areaConstruidaM2: 68,
    habitaciones: 1,
    banos: 1.5,
    parqueaderos: 1,
    antiguedadAnios: 1,
    aptoBiess: false,
    destacada: false,
    imagenes: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502005229762-ae1b46000282?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "Suite moderna completamente amoblada y equipada para ejecutivos o parejas sin hijos. Cama King, televisión 4K, lavasecadora, cocina con inducción, vajilla completa e internet de alta velocidad incluido.",
    amenidades: ["Totalmente Amoblada", "Internet Fibra Óptica", "Lavasecadora", "Edificio con Guardia", "Parqueadero Cubierto"]
  },
  {
    id: "inm-5",
    codigo: "SARA-QUI-05",
    titulo: "Quinta Vacacional con Piscina y Huerto en Yunguilla",
    tipo: "quinta",
    modalidad: "venta",
    precio: 198000,
    ciudad: "Santa Isabel",
    sector: "Valle de Yunguilla",
    direccionAprox: "Sector La Unión",
    areaTotalM2: 1400,
    areaConstruidaM2: 240,
    habitaciones: 3,
    banos: 3,
    parqueaderos: 4,
    antiguedadAnios: 3,
    aptoBiess: true,
    destacada: true,
    imagenes: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "El refugio campestre soñado con clima subtropical privilegiado todo el año. Casa estilo rústico moderno con piscina sinfín temperada por paneles solares, pérgola BBQ para eventos y árboles frutales en producción.",
    amenidades: ["Piscina Temperada", "Clima Cálido", "Pérgola BBQ", "Árboles Frutales", "Cisterna 15.000 Lts", "Riego Tecnificado"]
  },
  {
    id: "inm-6",
    codigo: "SARA-LOC-06",
    titulo: "Local Comercial Estratégico en Av. Remigio Crespo",
    tipo: "local",
    modalidad: "arriendo",
    precio: 950,
    ciudad: "Cuenca",
    sector: "Remigio Crespo",
    direccionAprox: "Zona Bancaria y Gastronómica",
    areaTotalM2: 110,
    areaConstruidaM2: 110,
    habitaciones: 0,
    banos: 2,
    parqueaderos: 2,
    antiguedadAnios: 4,
    aptoBiess: false,
    destacada: false,
    imagenes: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "Local comercial a pie de calle con excelente visibilidad peatonal y vehicular. Vidrieras templadas, piso de porcelanato de alto tráfico, conexiones trifásicas y espacio para letrero corporativo luminoso.",
    amenidades: ["Ubicación AAA", "Vidriera Frontal", "Luz Trifásica", "Parqueo de Clientes", "2 Medios Baños"]
  }
]

export default function InmobiliariaPage() {
  const [modalidadTab, setModalidadTab] = useState<"todos" | "venta" | "arriendo" | "terrenos">("todos")
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos")
  const [ubicacionInput, setUbicacionInput] = useState<string>("")
  const [precioMin, setPrecioMin] = useState<number | "">("")
  const [precioMax, setPrecioMax] = useState<number | "">("")
  const [habFiltro, setHabFiltro] = useState<number>(0)
  const [searchTerm, setSearchTerm] = useState<string>("")
  
  // Modal de detalle
  const [selectedInmueble, setSelectedInmueble] = useState<Inmueble | null>(null)
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0)
  
  // Calculadora Hipotecaria Estado
  const [calcEntradaPct, setCalcEntradaPct] = useState<number>(20)
  const [calcPlazoAnios, setCalcPlazoAnios] = useState<number>(20)
  const [calcTasaInteres, setCalcTasaInteres] = useState<number>(4.99) // Tasa VIP / Biess

  // Formulario de Consignación
  const [isConsignarOpen, setIsConsignarOpen] = useState(false)
  const [consignarEnviado, setConsignarEnviado] = useState(false)

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const targetSection = document.getElementById("catalogo-propiedades")
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Filtrado reactivo de propiedades
  const filteredInmuebles = useMemo(() => {
    return INMUEBLES_DATA.filter((item) => {
      // Filtro Modalidad (Compra / Alquiler / Terrenos / Todos)
      if (modalidadTab === "venta" && item.modalidad !== "venta") return false
      if (modalidadTab === "arriendo" && item.modalidad !== "arriendo") return false
      if (modalidadTab === "terrenos" && item.tipo !== "terreno") return false

      // Filtro Tipo de Inmueble (imagen 2)
      if (tipoFiltro !== "todos" && item.tipo !== tipoFiltro) return false

      // Filtro Ubicación (Cuadro de texto libre)
      if (ubicacionInput.trim()) {
        const q = ubicacionInput.toLowerCase().trim()
        const matchUbicacion = (
          item.ciudad.toLowerCase().includes(q) ||
          item.sector.toLowerCase().includes(q) ||
          item.direccionAprox.toLowerCase().includes(q) ||
          item.titulo.toLowerCase().includes(q)
        )
        if (!matchUbicacion) return false
      }

      // Filtro Precio Mínimo
      if (precioMin !== "" && Number(precioMin) > 0) {
        if (item.precio < Number(precioMin)) return false
      }

      // Filtro Precio Máximo
      if (precioMax !== "" && Number(precioMax) > 0) {
        if (item.precio > Number(precioMax)) return false
      }

      // Filtro Habitaciones
      if (habFiltro > 0 && item.habitaciones < habFiltro) return false

      // Filtro Búsqueda Texto
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim()
        const matchText = (
          item.titulo.toLowerCase().includes(q) ||
          item.sector.toLowerCase().includes(q) ||
          item.codigo.toLowerCase().includes(q) ||
          item.descripcion.toLowerCase().includes(q)
        )
        if (!matchText) return false
      }

      return true
    })
  }, [modalidadTab, tipoFiltro, ubicacionInput, precioMin, precioMax, habFiltro, searchTerm])

  // Cálculo de cuota hipotecaria mensual
  const cuotaMensualEstimada = useMemo(() => {
    if (!selectedInmueble || selectedInmueble.modalidad === "arriendo") return 0
    const montoFinanciar = selectedInmueble.precio * (1 - calcEntradaPct / 100)
    const tasaMensual = (calcTasaInteres / 100) / 12
    const totalMeses = calcPlazoAnios * 12
    if (tasaMensual === 0) return montoFinanciar / totalMeses
    const cuota = (montoFinanciar * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -totalMeses))
    return isNaN(cuota) ? 0 : cuota
  }, [selectedInmueble, calcEntradaPct, calcPlazoAnios, calcTasaInteres])

  const openWhatsAppInmueble = (item: Inmueble) => {
    const msg = encodeURIComponent(
      `Hola SARA Inmobiliaria. Me interesa la propiedad "${item.titulo}" (Ref: ${item.codigo}) con valor de $${item.precio.toLocaleString()}. ¿Podrían brindarme más información o coordinar una visita?`
    )
    window.open(`https://wa.me/593981804023?text=${msg}`, "_blank")
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-20">
      {/* ============================================================ */}
      {/* 0. APP HEADER EXCLUSIVO: SARA INMOBILIARIA (STANDALONE)     */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3 transition-all">
        <div className="w-full max-w-[1760px] mx-auto flex items-center justify-between gap-4">
          {/* Logo y Marca SARA Inmobiliaria */}
          <div className="flex items-center gap-6">
            <Link href="/inmobiliaria" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl bg-brand-dark p-1.5 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden border border-brand-sage/40 shrink-0">
                <img src="/logo-3d-white.png" alt="SARA Inmobiliaria" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm sm:text-base tracking-wider text-white">SARA</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-md shadow-xs">
                    INMOBILIARIA
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 font-medium hidden sm:block">
                  Bienes Raíces · Arquitectura · Plusvalía
                </span>
              </div>
            </Link>

            {/* Navegación Rápida entre Portales */}
            <nav className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs font-semibold">
              <Link 
                href="/airbnb" 
                className="px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
              >
                <Compass size={14} className="text-amber-400" />
                <span>SARA STAYS / Hospédate</span>
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

          {/* Acciones */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botón Consignar Propiedad */}
            <button
              type="button"
              onClick={() => setIsConsignarOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg transition-all cursor-pointer border border-emerald-400/40 active:scale-[0.98]"
            >
              <Building2 size={15} />
              <span className="hidden sm:inline">Consignar Propiedad</span>
              <span className="sm:hidden">Consignar</span>
            </button>

            {/* Botón WhatsApp */}
            <a
              href="https://wa.me/593981804023?text=Hola%20SARA%20Inmobiliaria,%20deseo%20asesor%C3%ADa%20sobre%20una%20propiedad"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Phone size={13} className="text-emerald-400" />
              <span className="hidden md:inline">+593 98 180 4023</span>
              <span className="md:hidden">WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 1. HERO SECTION & BUSCADOR INTELIGENTE                       */}
      {/* ============================================================ */}
      <section className="relative pt-8 pb-16 overflow-hidden bg-brand-dark">
        {/* Split Layout: Background Image on Right Side */}
        <div
          className="absolute inset-0 lg:left-[45%] lg:w-auto w-full h-full bg-cover bg-center z-0"
          style={{ backgroundImage: `url('/sara-inmobiliaria.png')` }}
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

        <div className="container relative z-20 mx-auto px-6 md:px-12 flex flex-col justify-center min-h-[60vh]">
          <div className="max-w-3xl space-y-6 md:pl-8 mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-px bg-brand-sage" />
              <h2 className="text-brand-sage font-bold tracking-[0.2em] uppercase text-xs md:text-sm drop-shadow-md">
                Ingeniería · Arquitectura · Bienes Raíces
              </h2>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.05] tracking-tight drop-shadow-2xl">
                DISEÑAMOS <span className="font-light italic text-brand-sage">HOGARES.</span><br />
                CONSTRUIMOS PLUSVALÍA.
              </h1>
            </div>

            <p className="text-base md:text-lg text-gray-100 max-w-2xl leading-relaxed font-light border-l-2 border-brand-sage/50 pl-6 drop-shadow-lg">
              Casas de alta gama, departamentos panorámicos y lotes urbanizados con proyectos arquitectónicos llave en mano y garantía estructural en Cuenca y el Austro.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20 backdrop-blur-sm">
                <Building2 size={14} className="text-brand-sage" /> Respaldo Constructivo Directo
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/20 backdrop-blur-sm">
                <CheckCircle2 size={13} className="text-brand-sage" /> Calificadas para Crédito VIP / Biess
              </span>
            </div>
          </div>

          {/* Caja del Buscador Principal tipo Portal */}
          <div className="w-full max-w-6xl mx-auto lg:mx-0 lg:ml-8 bg-white rounded-3xl p-4 sm:p-5 md:p-6 shadow-2xl border border-gray-100 text-gray-800">
            {/* 1. Botones de Selección (Alquiler, Compra) */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 mb-5">
              <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setModalidadTab("venta")}
                  className={`px-4 py-2 rounded-lg text-xs md:text-sm font-black transition-all cursor-pointer ${
                    modalidadTab === "venta"
                      ? "bg-brand-sage text-white shadow-md shadow-emerald-950/20"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Compra
                </button>
                <button
                  type="button"
                  onClick={() => setModalidadTab("arriendo")}
                  className={`px-4 py-2 rounded-lg text-xs md:text-sm font-black transition-all cursor-pointer ${
                    modalidadTab === "arriendo"
                      ? "bg-brand-sage text-white shadow-md shadow-emerald-950/20"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Alquiler
                </button>
                <button
                  type="button"
                  onClick={() => setModalidadTab("terrenos")}
                  className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer ${
                    modalidadTab === "terrenos"
                      ? "bg-brand-sage text-white shadow-md shadow-emerald-950/20"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Terrenos & Lotes
                </button>
                <button
                  type="button"
                  onClick={() => setModalidadTab("todos")}
                  className={`px-3 py-2 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer ${
                    modalidadTab === "todos"
                      ? "bg-brand-sage text-white shadow-md shadow-emerald-950/20"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Ver Todos
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsConsignarOpen(true)}
                className="text-xs font-bold text-brand-sage hover:underline flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-brand-sage/30 bg-emerald-50 shadow-xs cursor-pointer ml-auto"
              >
                <Tag size={13} /> Consigna tu Inmueble
              </button>
            </div>

            {/* 2. Barra de Filtros en Grid (Tipo, Ubicación, Precio Min/Max, Buscar) */}
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-end">
              {/* Tipo de Inmueble (imagen 2) */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                  Tipo de Inmueble
                </label>
                <select
                  value={tipoFiltro}
                  onChange={(e) => setTipoFiltro(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-sage focus:bg-white text-gray-800 font-bold transition-all h-[42px] cursor-pointer"
                >
                  <option value="todos">Todos los tipos</option>
                  <option value="casa">Casas Residenciales</option>
                  <option value="departamento">Departamentos</option>
                  <option value="terreno">Terrenos / Lotes</option>
                  <option value="suite">Suites Modernas</option>
                  <option value="quinta">Quintas Vacacionales</option>
                  <option value="local">Locales Comerciales</option>
                </select>
              </div>

              {/* Ubicación (cuadro de texto libre) */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                  Ubicación
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={ubicacionInput}
                    onChange={(e) => setUbicacionInput(e.target.value)}
                    placeholder="¿Dónde buscas? Ej: Challuabamba, Cuenca..."
                    className="w-full pl-10 pr-8 py-2.5 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-sage focus:bg-white text-gray-800 font-bold transition-all placeholder:font-normal placeholder:text-gray-400 h-[42px]"
                  />
                  {ubicacionInput && (
                    <button
                      type="button"
                      onClick={() => setUbicacionInput("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                      title="Borrar ubicación"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Selector Precio Mínimo */}
              <div className="sm:col-span-1 lg:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                  Precio Mínimo
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
                  <input
                    type="number"
                    min="0"
                    step={modalidadTab === "arriendo" ? "50" : "5000"}
                    value={precioMin}
                    onChange={(e) => setPrecioMin(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Mínimo"
                    className="w-full pl-8 pr-2.5 py-2.5 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-sage focus:bg-white text-gray-800 font-bold transition-all h-[42px]"
                  />
                </div>
              </div>

              {/* Selector Precio Máximo */}
              <div className="sm:col-span-1 lg:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                  Precio Máximo
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
                  <input
                    type="number"
                    min="0"
                    step={modalidadTab === "arriendo" ? "50" : "5000"}
                    value={precioMax}
                    onChange={(e) => setPrecioMax(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Máximo"
                    className="w-full pl-8 pr-2.5 py-2.5 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-sage focus:bg-white text-gray-800 font-bold transition-all h-[42px]"
                  />
                </div>
              </div>

              {/* Botón Buscar */}
              <div className="sm:col-span-2 lg:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-brand-sage hover:bg-emerald-700 active:scale-[0.98] text-white font-black rounded-xl text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 transition-all cursor-pointer h-[42px]"
                >
                  <Search size={16} className="stroke-[2.5]" />
                  <span>Buscar</span>
                </button>
              </div>
            </form>

            {/* Resumen de filtros activos */}
            {(ubicacionInput || tipoFiltro !== "todos" || precioMin !== "" || precioMax !== "" || modalidadTab !== "todos") && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-gray-100 text-xs">
                <div className="flex items-center gap-1.5 text-gray-500 text-[11px] flex-wrap">
                  <span className="font-semibold text-gray-400">Filtros aplicados:</span>
                  {modalidadTab !== "todos" && (
                    <span className="bg-emerald-50 text-brand-sage px-2 py-0.5 rounded-md font-bold border border-emerald-100">
                      {modalidadTab === "venta" ? "En Venta" : modalidadTab === "arriendo" ? "En Alquiler" : "Terrenos"}
                    </span>
                  )}
                  {tipoFiltro !== "todos" && (
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-bold">
                      {tipoFiltro === "casa" ? "Casas" : tipoFiltro === "departamento" ? "Departamentos" : tipoFiltro === "terreno" ? "Terrenos" : tipoFiltro === "suite" ? "Suites" : tipoFiltro === "quinta" ? "Quintas" : "Locales"}
                    </span>
                  )}
                  {ubicacionInput && (
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                      <MapPin size={11} className="text-brand-sage" /> {ubicacionInput}
                    </span>
                  )}
                  {(precioMin !== "" || precioMax !== "") && (
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-bold">
                      ${precioMin || "0"} - ${precioMax || "Sin tope"}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setModalidadTab("todos")
                    setTipoFiltro("todos")
                    setUbicacionInput("")
                    setPrecioMin("")
                    setPrecioMax("")
                    setSearchTerm("")
                  }}
                  className="text-xs text-gray-500 hover:text-red-600 font-bold transition-colors cursor-pointer ml-auto"
                >
                  Restablecer
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. CATÁLOGO DE PROPIEDADES (GRID DE TARJETAS DE ALTA GAMA)   */}
      {/* ============================================================ */}
      <section id="catalogo-propiedades" className="container mx-auto px-4 md:px-8 -mt-6 relative z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Compass className="text-brand-sage" size={24} /> Oportunidades Disponibles ({filteredInmuebles.length})
            </h2>
            <p className="text-xs text-gray-500">
              Propiedades verificadas técnica y jurídicamente por el equipo legal y constructivo de SARA
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Ordenar por:</span>
            <span className="text-xs font-bold bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 shadow-sm">
              Recomendadas primero
            </span>
          </div>
        </div>

        {/* Grid de Propiedades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInmuebles.map((inm) => (
            <div 
              key={inm.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col group"
            >
              {/* Portada / Carrusel */}
              <div className="relative h-64 w-full overflow-hidden bg-gray-100">
                <img 
                  src={inm.imagenes[0]} 
                  alt={inm.titulo} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Badges superiores */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-md ${
                    inm.modalidad === 'venta' ? 'bg-blue-600' : 'bg-emerald-600'
                  }`}>
                    {inm.modalidad === 'venta' ? 'EN VENTA' : 'EN ARRIENDO'}
                  </span>
                  {inm.destacada && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-md">
                      DESTACADA
                    </span>
                  )}
                  {inm.tipo === 'terreno' && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-dark text-emerald-400 border border-emerald-400/30 shadow-md">
                      + OBRA LLAVE EN MANO
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white pointer-events-none">
                  <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl font-black text-lg md:text-xl text-white shadow-md">
                    ${inm.precio.toLocaleString()} {inm.modalidad === 'arriendo' && <span className="text-xs font-normal text-gray-300">/mes</span>}
                  </div>
                  <div className="text-[10px] font-bold bg-white/90 text-gray-800 px-2 py-1 rounded-md shadow-sm">
                    {inm.codigo}
                  </div>
                </div>
              </div>

              {/* Información de la Tarjeta */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-brand-sage font-bold uppercase tracking-wider mb-1.5">
                    <MapPin size={14} /> {inm.sector}, {inm.ciudad}
                  </div>

                  <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-brand-sage transition-colors line-clamp-2 mb-2">
                    {inm.titulo}
                  </h3>

                  <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                    {inm.descripcion}
                  </p>

                  {/* Iconos de Características */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 text-xs text-gray-600 mb-4">
                    {inm.habitaciones > 0 && (
                      <div className="flex items-center gap-1.5" title={`${inm.habitaciones} Dormitorios`}>
                        <Bed size={15} className="text-brand-sage shrink-0" />
                        <span className="font-semibold">{inm.habitaciones} Hab.</span>
                      </div>
                    )}
                    {inm.banos > 0 && (
                      <div className="flex items-center gap-1.5" title={`${inm.banos} Baños`}>
                        <Bath size={15} className="text-brand-sage shrink-0" />
                        <span className="font-semibold">{inm.banos} Baños</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5" title="Superficie Total">
                      <Maximize2 size={15} className="text-brand-sage shrink-0" />
                      <span className="font-semibold">{inm.areaTotalM2} m²</span>
                    </div>
                  </div>
                </div>

                {/* Acciones de Conversión */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedInmueble(inm)
                      setActivePhotoIdx(0)
                    }}
                    className="flex-1 py-2 px-3 text-xs font-bold text-brand-dark bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye size={14} /> Ficha Completa
                  </button>

                  <button
                    onClick={() => openWhatsAppInmueble(inm)}
                    className="py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    title="Consultar por WhatsApp"
                  >
                    <MessageCircle size={15} /> WhatsApp
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredInmuebles.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 max-w-md mx-auto my-12">
            <Building2 className="mx-auto text-gray-300 mb-3" size={48} />
            <h3 className="font-bold text-gray-800 text-lg">No hay propiedades con estos filtros</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Prueba cambiando el rango de precio, sector o modalidad de búsqueda.
            </p>
            <button
              onClick={() => {
                setModalidadTab("todos")
                setTipoFiltro("todos")
                setUbicacionInput("")
                setPrecioMin("")
                setPrecioMax("")
                setSearchTerm("")
              }}
              className="text-xs font-bold text-brand-sage bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg border border-brand-sage/20 transition-colors cursor-pointer"
            >
              Restablecer Filtros
            </button>
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* 3. BANNER DE SINERGIA: "TERRENO + CONSTRUCCIÓN LLAVE EN MANO" */}
      {/* ============================================================ */}
      <section className="container mx-auto px-4 md:px-8 mt-20">
        <div className="bg-gradient-to-r from-[#07130d] via-[#10291d] to-[#07130d] rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden border border-emerald-900/40">
          <div className="max-w-2xl relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-4">
              <HardHat size={14} /> Sinergia Exclusiva SARA
            </span>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-4 leading-tight">
              ¿Compraste tu terreno con nosotros? Te construimos tu casa a tu medida.
            </h2>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">
              A diferencia de las agencias tradicionales, en SARA no solo te entregamos las escrituras de tu lote: nuestro equipo de ingeniería y arquitectura diseña los planos, calcula el presupuesto exacto sin sobrecostos y construye tu residencia llave en mano.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link 
                href="/contacto" 
                className="px-5 py-3 rounded-xl bg-brand-sage text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-950/40 inline-flex items-center gap-2"
              >
                Solicitar Cotización de Construcción <ArrowRight size={15} />
              </Link>
              <Link 
                href="/proyectos" 
                className="px-5 py-3 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-all border border-white/20"
              >
                Ver Obras Entregadas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. MODAL DETALLE DE LA PROPIEDAD & CALCULADORA HIPOTECARIA  */}
      {/* ============================================================ */}
      {selectedInmueble && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-100 relative flex flex-col">
            {/* Header del Modal */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between z-20">
              <div>
                <span className="text-[11px] font-bold text-brand-sage uppercase tracking-wider">
                  {selectedInmueble.codigo} · {selectedInmueble.modalidad === 'venta' ? 'En Venta' : 'En Arriendo'}
                </span>
                <h3 className="font-black text-gray-900 text-lg md:text-xl line-clamp-1">
                  {selectedInmueble.titulo}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedInmueble(null)}
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
                    src={selectedInmueble.imagenes[activePhotoIdx]} 
                    alt={selectedInmueble.titulo} 
                    className="w-full h-full object-cover"
                  />
                  {selectedInmueble.imagenes.length > 1 && (
                    <>
                      <button 
                        onClick={() => setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : selectedInmueble.imagenes.length - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button 
                        onClick={() => setActivePhotoIdx((prev) => (prev < selectedInmueble.imagenes.length - 1 ? prev + 1 : 0))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                    {activePhotoIdx + 1} / {selectedInmueble.imagenes.length} fotos
                  </div>
                </div>

                {/* Miniaturas */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {selectedInmueble.imagenes.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        activePhotoIdx === idx ? 'border-brand-sage ring-2 ring-brand-sage/30' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Miniatura" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Ficha Técnica y Precio */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Descripción del Inmueble</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedInmueble.descripcion}
                    </p>
                  </div>

                  {/* Amenidades */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Comodidades y Acabados</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedInmueble.amenidades.map((amenidad, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                          <CheckCircle2 size={13} className="text-brand-sage" /> {amenidad}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Caja de Precio y Conversión */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-gray-200 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-gray-500 font-bold block mb-1">Precio Solicitado</span>
                    <p className="text-3xl font-black text-brand-dark mb-4">
                      ${selectedInmueble.precio.toLocaleString()}
                      {selectedInmueble.modalidad === 'arriendo' && <span className="text-xs font-normal text-gray-500"> /mes</span>}
                    </p>

                    <div className="space-y-2 text-xs text-gray-600 border-t border-gray-200 pt-3 mb-5">
                      <div className="flex justify-between">
                        <span>Área Total:</span>
                        <strong className="text-gray-900">{selectedInmueble.areaTotalM2} m²</strong>
                      </div>
                      {selectedInmueble.areaConstruidaM2 > 0 && (
                        <div className="flex justify-between">
                          <span>Área Construida:</span>
                          <strong className="text-gray-900">{selectedInmueble.areaConstruidaM2} m²</strong>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Sector:</span>
                        <strong className="text-gray-900">{selectedInmueble.sector}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Apto Crédito:</span>
                        <strong className={selectedInmueble.aptoBiess ? "text-emerald-600" : "text-gray-500"}>
                          {selectedInmueble.aptoBiess ? "Sí (Biess / Bancos)" : "Solo Contado"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => openWhatsAppInmueble(selectedInmueble)}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      <MessageCircle size={16} /> Agendar Visita por WhatsApp
                    </button>
                    <a
                      href="tel:0981804023"
                      className="w-full py-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                    >
                      <Phone size={14} /> Llamar al Asesor SARA
                    </a>
                  </div>
                </div>
              </div>

              {/* Calculadora Hipotecaria (Solo para ventas) */}
              {selectedInmueble.modalidad === "venta" && (
                <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-200/60 mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="text-brand-sage" size={18} />
                    <h4 className="font-bold text-gray-900 text-sm">Calculadora de Cuota Hipotecaria Estimada</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">Entrada ({calcEntradaPct}%):</label>
                      <input 
                        type="number"
                        min="10"
                        max="80"
                        value={calcEntradaPct}
                        onChange={(e) => setCalcEntradaPct(Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-emerald-200 rounded-lg outline-none"
                      />
                      <span className="text-[10px] text-gray-500 mt-1 block">
                        Equivale a ${(selectedInmueble.precio * (calcEntradaPct / 100)).toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">Plazo de Pago (Años):</label>
                      <select 
                        value={calcPlazoAnios}
                        onChange={(e) => setCalcPlazoAnios(Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-emerald-200 rounded-lg outline-none"
                      >
                        <option value="15">15 Años (180 meses)</option>
                        <option value="20">20 Años (240 meses)</option>
                        <option value="25">25 Años (300 meses)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-600 block mb-1">Tasa de Interés:</label>
                      <select 
                        value={calcTasaInteres}
                        onChange={(e) => setCalcTasaInteres(Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-emerald-200 rounded-lg outline-none"
                      >
                        <option value="4.99">4.99% (Crédito VIP / Vivienda Primer Hogar)</option>
                        <option value="6.5">6.5% (Tasa Preferencial Biess)</option>
                        <option value="8.9">8.9% (Banca Privada Estándar)</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-emerald-200 flex items-center justify-between">
                    <span className="text-xs text-gray-600 font-medium">Cuota mensual referencial estimada:</span>
                    <span className="text-xl font-black text-emerald-700">
                      ${cuotaMensualEstimada.toFixed(2)} / mes
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Footer for Standalone Inmobiliaria */}
      <footer className="bg-slate-950 border-t border-slate-800 text-gray-400 py-12 px-4 sm:px-8 mt-20">
        <div className="w-full max-w-[1760px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-dark border border-brand-sage/40 p-1 flex items-center justify-center">
              <img src="/logo-3d-white.png" alt="SARA Inmobiliaria" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-black text-white text-sm tracking-wide">SARA INMOBILIARIA</span>
              <p className="text-xs text-gray-500">Bienes Raíces, Arquitectura y Garantía Constructiva en Cuenca y el Austro</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs">
            <Link href="/airbnb" className="hover:text-white transition-colors">Portal SARA STAYS / Hospédate</Link>
            <Link href="/" className="hover:text-white transition-colors">Sara Constructora Principal</Link>
            <button onClick={() => setIsConsignarOpen(true)} className="hover:text-emerald-400 transition-colors cursor-pointer">Consignar Propiedad</button>
            <a href="https://wa.me/593981804023" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">Asesoría Inmobiliaria: +593 98 180 4023</a>
          </div>
          <div className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} SARA Constructora & Inmobiliaria. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* 5. MODAL FORMULARIO: "CONSIGNA TU PROPIEDAD"                */}
      {/* ============================================================ */}
      {isConsignarOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-gray-100 relative">
            <button 
              onClick={() => setIsConsignarOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
            >
              <X size={16} />
            </button>

            {!consignarEnviado ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-sage/10 text-brand-sage flex items-center justify-center">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Consigna tu Inmueble con SARA</h3>
                    <p className="text-xs text-gray-500">Te ayudamos a vender o arrendar con asesoría legal y técnica</p>
                  </div>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault()
                    setConsignarEnviado(true)
                  }}
                  className="space-y-3 mt-4"
                >
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Nombre Completo *</label>
                    <input required type="text" placeholder="Ej. Carlos Andrade" className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-sage" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Teléfono / WhatsApp *</label>
                      <input required type="tel" placeholder="099..." className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-sage" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Modalidad</label>
                      <select className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg outline-none">
                        <option>Deseo Vender</option>
                        <option>Deseo Arrendar</option>
                        <option>Tengo Terreno para Proyecto</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Tipo y Ubicación del Inmueble</label>
                    <input required type="text" placeholder="Ej. Casa en Challuabamba, 300 m²" className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-sage" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Precio Estimado Pretendido ($)</label>
                    <input type="number" placeholder="Ej. 120000" className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-sage" />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-brand-sage hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all"
                    >
                      Enviar Datos para Contacto
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-3" />
                <h4 className="font-bold text-gray-900 text-lg">¡Solicitud Recibida con Éxito!</h4>
                <p className="text-xs text-gray-500 mt-1 mb-6">
                  Un asesor de SARA Inmobiliaria se comunicará contigo vía WhatsApp en menos de 24 horas para coordinar la inspección y sesión de fotos.
                </p>
                <button
                  onClick={() => {
                    setIsConsignarOpen(false)
                    setConsignarEnviado(false)
                  }}
                  className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
