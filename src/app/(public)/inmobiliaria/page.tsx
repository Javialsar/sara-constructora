"use client"
import React, { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { getLogosEmpresa } from "@/lib/services/logosService"
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
  HardHat,
  Sparkles,
  Award,
  Briefcase,
  PlusCircle,
  Plus,
  Star,
  Sliders
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
  videos?: string[]
  descripcion: string
  amenidades: string[]
  coordenadas?: { lat: number; lng: number }
  propietario?: {
    nombre: string
    telefono?: string
    email?: string
  }
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
    amenidades: ["Seguridad 24/7", "Área BBQ", "Cisterna y Bomba", "Gas Centralizado", "Jardín Amplio", "Acabados Importados", "Cámaras de Vigilancia"],
    coordenadas: { lat: -2.8752, lng: -78.9654 },
    propietario: {
      nombre: "Ing. Carlos Vintimilla",
      telefono: "+593981804023",
      email: "carlos.vintimilla@constructora.ec"
    }
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
    amenidades: ["Ascensor", "Generador Eléctrico 100%", "Balcón con Vista al Río", "Bodega Privada", "Cerradura Digital", "Gimnasio Comunal"],
    coordenadas: { lat: -2.9025, lng: -79.0062 },
    propietario: {
      nombre: "Dra. Mariana Cordero",
      telefono: "+593992345678",
      email: "mariana.cordero@medico.ec"
    }
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
    amenidades: ["Topografía Plana", "Obras Básicas Completas", "Vía Asfaltada", "Escrituras Inmediatas", "Sinergia Construcción SARA"],
    coordenadas: { lat: -2.8592, lng: -78.9687 },
    propietario: {
      nombre: "Arq. Marcelo Álvarez",
      telefono: "+593984567890",
      email: "marcelo.alvarez@diseno.ec"
    }
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
    amenidades: ["Totalmente Amoblada", "Internet Fibra Óptica", "Lavasecadora", "Edificio con Guardia", "Parqueadero Cubierto"],
    coordenadas: { lat: -2.9095, lng: -79.0041 },
    propietario: {
      nombre: "Lic. Elena Carrión",
      telefono: "+593995678901",
      email: "elena.carrion@empresa.ec"
    }
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
    amenidades: ["Piscina Temperada", "Clima Cálido", "Pérgola BBQ", "Árboles Frutales", "Cisterna 15.000 Lts", "Riego Tecnificado"],
    coordenadas: { lat: -3.2750, lng: -79.3160 },
    propietario: {
      nombre: "Abg. Fernando Pesántez",
      telefono: "+593991223344",
      email: "fernando.pesantez@abogados.ec"
    }
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
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80"
    ],
    descripcion: "Local comercial a pie de calle con excelente visibilidad peatonal y vehicular en una de las avenidas más concurridas de Cuenca. Vidrieras templadas, piso de porcelanato de alto tráfico, conexiones trifásicas y espacio para letrero corporativo luminoso.",
    amenidades: ["Ubicación AAA", "Vidriera Frontal", "Luz Trifásica", "Parqueo de Clientes", "2 Medios Baños"],
    coordenadas: { lat: -2.9060, lng: -79.0125 },
    propietario: {
      nombre: "Ing. Roberto Ochoa",
      telefono: "+593987654321",
      email: "roberto.ochoa@retail.ec"
    }
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
  const [mapHighlight, setMapHighlight] = useState<boolean>(false)

  // Desplazamiento automático al mapa al hacer clic en fotos con resaltado y datos del propietario
  const handlePhotoClick = (idx?: number) => {
    if (typeof idx === "number") {
      setActivePhotoIdx(idx)
    }
    const mapEl = document.getElementById("mapa-geolocalizacion")
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: "smooth", block: "center" })
      setMapHighlight(true)
      setTimeout(() => setMapHighlight(false), 3500)
    }
  }
  
  // Calculadora Hipotecaria Estado
  const [calcEntradaPct, setCalcEntradaPct] = useState<number>(20)
  const [calcPlazoAnios, setCalcPlazoAnios] = useState<number>(20)
  const [calcTasaInteres, setCalcTasaInteres] = useState<number>(4.99) // Tasa VIP / Biess

  // Formulario de Consignación
  const [isConsignarOpen, setIsConsignarOpen] = useState(false)
  const [consignarEnviado, setConsignarEnviado] = useState(false)

  // Logotipo dinámico de SARA Inmobiliaria
  const [logoInmobiliaria, setLogoInmobiliaria] = useState<string>("/sara-inmobiliaria.png")

  // Lista de inmuebles reactiva sincronizada con la base de datos Supabase
  const [inmueblesList, setInmueblesList] = useState<Inmueble[]>(INMUEBLES_DATA)

  // Cargar propiedades activas publicadas desde la base de datos
  useEffect(() => {
    fetch("/api/inmobiliaria/inmuebles")
      .then(res => res.json())
      .then(data => {
        if (data.inmuebles && Array.isArray(data.inmuebles) && data.inmuebles.length > 0) {
          const mapped: Inmueble[] = data.inmuebles
            .filter((item: any) => item.publicado)
            .map((item: any) => ({
              id: item.id,
              codigo: item.codigo,
              titulo: item.titulo,
              tipo: item.tipo,
              modalidad: item.modalidad,
              precio: item.precio,
              ciudad: item.ciudad,
              sector: item.sector,
              direccionAprox: item.direccion || item.sector,
              areaTotalM2: item.areaM2 || 120,
              areaConstruidaM2: item.areaConstruidaM2 || item.areaM2 || 100,
              habitaciones: item.habitaciones || 0,
              banos: item.banos || 0,
              parqueaderos: item.parqueaderos || 1,
              antiguedadAnios: item.antiguedad === "A estrenar" ? 0 : 2,
              aptoBiess: true,
              destacada: item.destacado || false,
              imagenes: item.galeriaImagenes && item.galeriaImagenes.length > 0 ? item.galeriaImagenes : [item.imagenUrl],
              videos: item.videos || [],
              descripcion: item.descripcion || item.titulo,
              amenidades: item.amenidades && item.amenidades.length > 0 ? item.amenidades : ["Seguridad 24/7"],
              coordenadas: item.coordenadas || { lat: -2.8974, lng: -79.0045 },
              propietario: item.propietario
            }))
          if (mapped.length > 0) {
            setInmueblesList(mapped)
          }
        }
      })
      .catch(err => console.warn("Aviso: usando inmuebles locales mientras responde la BD:", err))
  }, [])

  // Showcase Cinemático de Propiedades Destacadas (Rotación cada 2.8s)
  const propiedadesDestacadas = useMemo(() => {
    const destacadas = inmueblesList.filter(i => i.destacada)
    return destacadas.length > 0 ? destacadas : inmueblesList.slice(0, 5)
  }, [inmueblesList])
  const [heroSlideIdx, setHeroSlideIdx] = useState(0)
  const [heroPaused, setHeroPaused] = useState(false)

  useEffect(() => {
    if (propiedadesDestacadas.length <= 1 || heroPaused) return
    const interval = setInterval(() => {
      setHeroSlideIdx(prev => (prev + 1) % propiedadesDestacadas.length)
    }, 2800) // 2.8 segundos de rotación continua
    return () => clearInterval(interval)
  }, [propiedadesDestacadas.length, heroPaused])

  useEffect(() => {
    getLogosEmpresa().then(logos => {
      if (logos?.inmobiliaria) {
        setLogoInmobiliaria(logos.inmobiliaria)
      }
    })
  }, [])

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const targetSection = document.getElementById("catalogo-propiedades")
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Filtrado reactivo de propiedades
  const filteredInmuebles = useMemo(() => {
    return inmueblesList.filter((item) => {
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
              <div className="relative w-10 h-10 rounded-xl bg-slate-900 p-1 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden border border-amber-400/40 shrink-0">
                <img src={logoInmobiliaria} alt="SARA Inmobiliaria" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm sm:text-base tracking-wider text-white">SARA</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 rounded-md shadow-xs font-black">
                    INMOBILIARIA
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 font-medium hidden sm:block">
                  División Corporativa · Bienes Raíces & Arquitectura
                </span>
              </div>
            </Link>

            {/* Navegación Rápida entre Portales */}
            <nav className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs font-semibold">
              <Link 
                href="/stays" 
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
            {/* Botón Publicar Propiedad */}
            <Link
              href="/inmobiliaria/auth"
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all border border-amber-300/40 active:scale-[0.98]"
              title="Publica tu inmueble para venta o arrendamiento"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Publicar Propiedad</span>
              <span className="sm:hidden">+ Publicar</span>
            </Link>

            {/* Botón Mi Portal */}
            <Link
              href="/inmobiliaria/mi-portal"
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all shadow-sm"
              title="Mis Propiedades"
            >
              <Home size={13} className="text-emerald-400" />
              <span className="hidden sm:inline">Mi Portal</span>
              <span className="sm:hidden">Portal</span>
            </Link>

            {/* Botón WhatsApp */}
            <a
              href="https://wa.me/593981804023?text=Hola%20SARA%20Inmobiliaria,%20deseo%20asesor%C3%ADa%20sobre%20una%20propiedad"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all shadow-sm"
              title="Asesoría Inmobiliaria Directa"
            >
              <Phone size={13} className="text-amber-400" />
              <span className="hidden md:inline">+593 98 180 4023</span>
              <span className="md:hidden">WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 1. HERO SECTION: DIVISIÓN CORPORATIVA & RESIDENCIAL          */}
      {/* ============================================================ */}
      <section className="relative pt-12 pb-24 lg:pb-28 overflow-hidden bg-slate-950">
        {/* Fondo Arquitectónico Residencial Cálido y Exclusivo */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000 scale-105 filter brightness-[0.88] contrast-[1.05]"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2560&q=85')` 
          }}
        />

        {/* Gradientes y Filtros de Iluminación de Lujo Equilibrados */}
        <div className="absolute inset-0 z-10 bg-slate-950/30" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/80 via-slate-950/50 to-slate-950/25" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40" />
        <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_top_left,_rgba(245,158,11,0.18)_0%,_transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_top_right,_rgba(217,119,6,0.14)_0%,_transparent_55%)] pointer-events-none" />

        <div className="w-full max-w-[1760px] relative z-20 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Columna Principal: Mensaje de Autoridad y Respaldo Técnico */}
            <div className="lg:col-span-7 space-y-6">
              {/* Eyebrow Corporativo Cálido */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-xs font-bold shadow-lg">
                <Sparkles size={14} className="text-amber-400 animate-pulse" />
                <span className="tracking-widest uppercase text-[11px]">SARA INMOBILIARIA · DIVISIÓN CORPORATIVA & RESIDENCIAL</span>
              </div>

              {/* Titular Ejecutivo y de Alto Impacto con Degradado Dorado Cálido */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight drop-shadow-2xl">
                  Patrimonio sólido.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400">
                    Inversión con Respaldo Constructivo.
                  </span>
                </h1>
              </div>

              {/* Párrafo Descriptivo Empresarial */}
              <p className="text-sm sm:text-base lg:text-lg text-slate-200 max-w-2xl leading-relaxed font-light drop-shadow-md">
                Residencias de alta gama, departamentos de diseño, oficinas corporativas y lotes urbanizados con proyectos llave en mano. Seguridad jurídica total, estructuración crediticia preferencial (Crédito VIP 4.99% / Biess / Banca Privada) y garantía técnica certificada en Cuenca y el Austro.
              </p>

              {/* Indicadores de Confianza Empresarial */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/80 text-white border border-slate-700/70 backdrop-blur-md shadow-sm">
                  <Building2 size={13} className="text-amber-400" />
                  <span>Respaldo Directo SARA Constructora</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/80 text-amber-300 border border-slate-700/70 backdrop-blur-md shadow-sm">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>Seguridad Jurídica & Títulos Claros</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/80 text-amber-300 border border-slate-700/70 backdrop-blur-md shadow-sm">
                  <CheckCircle2 size={13} className="text-amber-400" />
                  <span>Crédito VIP (4.99%) & Biess Aprobado</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/80 text-teal-300 border border-slate-700/70 backdrop-blur-md shadow-sm">
                  <Award size={13} className="text-amber-400" />
                  <span>Plusvalía Técnica Proyectada</span>
                </span>
              </div>
            </div>

            {/* Columna Secundaria: Showcase Cinemático de Propiedades Destacadas & Tarjeta de Consignaciones */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              {/* Halo de iluminación ambiental 3D cálido */}
              <div className="absolute top-1/4 w-80 h-80 bg-gradient-to-tr from-amber-500/35 via-orange-500/25 to-yellow-300/30 rounded-full blur-3xl pointer-events-none transform -translate-y-8" />

              {/* Showcase Cinemático de Propiedades Destacadas (Rotación cada 2.8s) */}
              <div 
                className="relative z-10 w-full max-w-[460px] group select-none mb-3"
                onMouseEnter={() => setHeroPaused(true)}
                onMouseLeave={() => setHeroPaused(false)}
              >
                <div 
                  onClick={() => {
                    const currentProp = propiedadesDestacadas[heroSlideIdx]
                    if (currentProp) {
                      setSelectedInmueble(currentProp)
                      setActivePhotoIdx(0)
                    }
                  }}
                  className="relative aspect-[16/11] sm:aspect-[16/10] w-full rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-slate-900 cursor-pointer transition-all duration-500 group-hover:shadow-[0_25px_60px_-15px_rgba(245,158,11,0.35)] group-hover:border-amber-400/60 group-hover:-translate-y-1"
                >
                  {/* Carrusel con Crossfade Cinemático */}
                  {propiedadesDestacadas.map((prop, idx) => (
                    <div
                      key={prop.id}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        idx === heroSlideIdx ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 pointer-events-none z-0"
                      }`}
                    >
                      <img
                        src={prop.imagenes[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"}
                        alt={prop.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      {/* Gradiente Cinematográfico de Contraste */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/60" />
                    </div>
                  ))}

                  {/* Sello de Prestigio SARA Inmobiliaria (Top Left) */}
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 shadow-lg text-white">
                      <div className="w-5 h-5 rounded-md overflow-hidden bg-slate-900 flex items-center justify-center shrink-0 border border-amber-400/40">
                        <img src={logoInmobiliaria} alt="SARA" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                        Destacadas SARA
                      </span>
                    </div>
                  </div>

                  {/* Badge Modalidad & Tipo (Top Right) */}
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md">
                      {propiedadesDestacadas[heroSlideIdx]?.modalidad === "venta" ? "En Venta" : "En Arriendo"}
                    </span>
                  </div>

                  {/* Flechas manuales que aparecen al hacer hover */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setHeroSlideIdx(prev => (prev - 1 + propiedadesDestacadas.length) % propiedadesDestacadas.length)
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
                      setHeroSlideIdx(prev => (prev + 1) % propiedadesDestacadas.length)
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg cursor-pointer border border-white/20 active:scale-90"
                    title="Siguiente"
                  >
                    <ChevronRight size={16} />
                  </button>

                  {/* Información Dinámica del Inmueble (Bottom) */}
                  <div className="absolute bottom-0 inset-x-0 p-4 z-20">
                    <div className="bg-slate-950/85 backdrop-blur-md p-3 rounded-2xl border border-white/15 text-white shadow-xl space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider truncate flex items-center gap-1">
                          <MapPin size={11} className="shrink-0" />
                          {propiedadesDestacadas[heroSlideIdx]?.sector}, {propiedadesDestacadas[heroSlideIdx]?.ciudad}
                        </span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full shrink-0">
                          {propiedadesDestacadas[heroSlideIdx]?.tipo}
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-white leading-snug line-clamp-1 group-hover:text-amber-300 transition-colors">
                        {propiedadesDestacadas[heroSlideIdx]?.titulo}
                      </h4>

                      <div className="flex items-center justify-between pt-1 border-t border-white/10">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs text-amber-400 font-bold">$</span>
                          <span className="text-base font-black text-white font-mono tracking-tight">
                            {propiedadesDestacadas[heroSlideIdx]?.precio.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-300 font-medium">USD</span>
                        </div>

                        <span className="text-[11px] font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          <span>Ver Ficha</span>
                          <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>

                    {/* Indicadores de Barra de Progreso */}
                    <div className="flex items-center justify-center gap-1.5 pt-2">
                      {propiedadesDestacadas.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setHeroSlideIdx(idx)
                          }}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            idx === heroSlideIdx
                              ? "w-6 bg-gradient-to-r from-amber-400 to-orange-400 shadow-sm"
                              : "w-1.5 bg-white/40 hover:bg-white/70"
                          }`}
                          title={`Ver propiedad ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarjeta Corporativa de Consignaciones para Propietarios / Inversionistas */}
              <div className="w-full max-w-[430px] relative z-20 mt-2">
                <div className="relative rounded-2xl p-5 bg-gradient-to-b from-white/14 via-white/8 to-white/4 backdrop-blur-2xl border border-white/20 shadow-2xl text-white overflow-hidden group">
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/35 transition-colors" />
                  
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
                      <Briefcase size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                        División de Consignaciones
                      </span>
                      <h3 className="text-sm sm:text-base font-extrabold text-white">
                        ¿Deseas vender o rentar?
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    Tasación técnica pericial, posicionamiento digital multicanal y compradores calificados con respaldo fiduciario y legal directo de SARA.
                  </p>

                  <Link
                    href="/inmobiliaria/auth"
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all border border-amber-200/40 active:scale-[0.98]"
                  >
                    <Building2 size={15} />
                    <span>Publicar mi Inmueble</span>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. CONSOLA DE BÚSQUEDA INMOBILIARIA & FILTROS EN TIEMPO REAL */}
      {/* ============================================================ */}
      <section className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10 lg:-mt-14 relative z-30 mb-8">
        <div className="bg-white rounded-3xl p-4 sm:p-5 lg:p-6 shadow-2xl shadow-slate-950/20 border border-slate-100">
          
          {/* Modalidad de Operación (Compra / Alquiler / Terrenos / Todos) */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setModalidadTab("venta")}
                className={`px-4 py-2 rounded-lg text-xs md:text-sm font-black transition-all cursor-pointer ${
                  modalidadTab === "venta"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                En Venta (Comprar)
              </button>
              <button
                type="button"
                onClick={() => setModalidadTab("arriendo")}
                className={`px-4 py-2 rounded-lg text-xs md:text-sm font-black transition-all cursor-pointer ${
                  modalidadTab === "arriendo"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                En Alquiler (Rentar)
              </button>
              <button
                type="button"
                onClick={() => setModalidadTab("terrenos")}
                className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer ${
                  modalidadTab === "terrenos"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Terrenos & Lotes
              </button>
              <button
                type="button"
                onClick={() => setModalidadTab("todos")}
                className={`px-3 py-2 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer ${
                  modalidadTab === "todos"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Ver Todas
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
              <ShieldCheck size={15} className="text-amber-500" />
              <span>Propiedades con verificación técnica y jurídica</span>
            </div>
          </div>

          {/* Formulario de Búsqueda de 4 Columnas */}
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-end">
            {/* Tipo de Inmueble */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Building2 size={13} className="text-emerald-600" />
                <span>Tipo de Inmueble</span>
              </label>
              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-800 font-bold transition-all h-[44px] cursor-pointer"
              >
                <option value="todos">Todos los tipos de propiedad</option>
                <option value="casa">Casas Residenciales</option>
                <option value="departamento">Departamentos</option>
                <option value="terreno">Terrenos & Lotes</option>
                <option value="suite">Suites Modernas</option>
                <option value="quinta">Quintas Vacacionales</option>
                <option value="local">Locales Comerciales & Oficinas</option>
              </select>
            </div>

            {/* Ubicación */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <MapPin size={13} className="text-emerald-600" />
                <span>Ubicación / Sector</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={ubicacionInput}
                  onChange={(e) => setUbicacionInput(e.target.value)}
                  placeholder="Ciudad o sector (Ej: Challuabamba, Cuenca...)"
                  className="w-full pl-3.5 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-800 font-bold transition-all placeholder:font-normal placeholder:text-gray-400 h-[44px]"
                />
                {ubicacionInput && (
                  <button
                    type="button"
                    onClick={() => setUbicacionInput("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                    title="Limpiar ubicación"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Selector Precio Mínimo */}
            <div className="sm:col-span-1 lg:col-span-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">
                Presupuesto Mínimo ($)
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
                  className="w-full pl-8 pr-2.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-800 font-bold transition-all h-[44px]"
                />
              </div>
            </div>

            {/* Selector Precio Máximo */}
            <div className="sm:col-span-1 lg:col-span-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">
                Presupuesto Máximo ($)
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
                  className="w-full pl-8 pr-2.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-800 font-bold transition-all h-[44px]"
                />
              </div>
            </div>

            {/* Botón Buscar */}
            <div className="sm:col-span-2 lg:col-span-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer h-[44px]"
              >
                <Search size={16} className="stroke-[2.5]" />
                <span>Buscar Inmueble</span>
              </button>
            </div>
          </form>

          {/* Chips de Categorías Rápidas e Interactivas */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 shrink-0 mr-1 hidden sm:inline">
              Filtros Rápidos:
            </span>
            
            <button
              type="button"
              onClick={() => {
                setModalidadTab("todos")
                setTipoFiltro("todos")
                setUbicacionInput("")
                setPrecioMin("")
                setPrecioMax("")
              }}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                modalidadTab === "todos" && tipoFiltro === "todos" && !ubicacionInput
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              ✨ Todos ({inmueblesList.length})
            </button>

            <button
              type="button"
              onClick={() => setTipoFiltro("casa")}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                tipoFiltro === "casa"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              🏡 Casas de Lujo
            </button>

            <button
              type="button"
              onClick={() => setTipoFiltro("departamento")}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                tipoFiltro === "departamento"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              🏢 Departamentos
            </button>

            <button
              type="button"
              onClick={() => setTipoFiltro("terreno")}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                tipoFiltro === "terreno"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              🌱 Terrenos Urbanizados
            </button>

            <button
              type="button"
              onClick={() => setTipoFiltro("quinta")}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                tipoFiltro === "quinta"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              🌴 Quintas en Yunguilla
            </button>

            <button
              type="button"
              onClick={() => {
                setModalidadTab("venta")
                setPrecioMax(100000)
              }}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                precioMax === 100000
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              🏛️ Crédito VIP (&lt; $100K)
            </button>

            <button
              type="button"
              onClick={() => setTipoFiltro("local")}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                tipoFiltro === "local"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              💼 Locales & Oficinas
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. CATÁLOGO DE PROPIEDADES (GRID DE TARJETAS DE ALTA GAMA)   */}
      {/* ============================================================ */}
      <section id="catalogo-propiedades" className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 mb-6 relative z-20">
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

        {/* Grid de Propiedades con Diseño 3D de Alta Gama */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredInmuebles.map((inm) => (
            <div 
              key={inm.id}
              onClick={() => {
                setSelectedInmueble(inm)
                setActivePhotoIdx(0)
              }}
              className="relative bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.07),0_8px_10px_-6px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_45px_-12px_rgba(16,185,129,0.22),0_12px_24px_rgba(0,0,0,0.12)] hover:-translate-y-2.5 hover:border-emerald-500/40 transition-all duration-500 flex flex-col group cursor-pointer transform-gpu"
            >
              {/* Línea superior con brillo 3D */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none" />

              {/* Portada / Carrusel con zoom 3D */}
              <div className="relative aspect-[16/11] w-full overflow-hidden bg-slate-950">
                <img 
                  src={inm.imagenes[0]} 
                  alt={inm.titulo} 
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />

                {/* Sombra de viñeta 3D para contraste */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />
                
                {/* Badges superiores 3D flotantes */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-[0_4px_10px_rgba(0,0,0,0.3)] backdrop-blur-md border border-white/20 ${
                    inm.modalidad === 'venta' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600' 
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600'
                  }`}>
                    {inm.modalidad === 'venta' ? 'EN VENTA' : 'EN ARRIENDO'}
                  </span>

                  {inm.destacada && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-[0_4px_10px_rgba(245,158,11,0.4)] border border-amber-300/40">
                      ⭐ DESTACADA
                    </span>
                  )}

                  {inm.tipo === 'terreno' && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/85 text-emerald-300 border border-emerald-500/40 shadow-[0_4px_10px_rgba(0,0,0,0.4)] backdrop-blur-md">
                      + OBRA LLAVE EN MANO
                    </span>
                  )}
                </div>

                {/* Etiqueta de Precio 3D Flotante */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                  <div className="bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl font-black text-lg md:text-xl text-white shadow-[0_8px_20px_rgba(0,0,0,0.4)] border border-white/15 flex items-baseline gap-1">
                    <span>${inm.precio.toLocaleString()}</span>
                    {inm.modalidad === 'arriendo' && (
                      <span className="text-xs font-normal text-emerald-300">/mes</span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono font-bold bg-white/95 text-slate-900 px-2.5 py-1 rounded-xl shadow-md border border-slate-200/80">
                    {inm.codigo}
                  </div>
                </div>
              </div>

              {/* Información de la Tarjeta */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1.5">
                    <MapPin size={13} className="text-emerald-500 shrink-0" />
                    <span className="truncate">{inm.sector}, {inm.ciudad}</span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-emerald-600 transition-colors line-clamp-2 mb-2">
                    {inm.titulo}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                    {inm.descripcion}
                  </p>

                  {/* Panel de Métricas 3D Inset */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50/90 rounded-2xl border border-slate-200/70 text-xs text-slate-700 mb-4 shadow-inner">
                    {inm.habitaciones > 0 ? (
                      <div className="flex items-center gap-1.5 justify-center" title={`${inm.habitaciones} Dormitorios`}>
                        <Bed size={15} className="text-emerald-600 shrink-0" />
                        <span className="font-bold">{inm.habitaciones} Hab.</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 justify-center">
                        <Building2 size={15} className="text-emerald-600 shrink-0" />
                        <span className="font-bold capitalize">{inm.tipo}</span>
                      </div>
                    )}

                    {inm.banos > 0 ? (
                      <div className="flex items-center gap-1.5 justify-center" title={`${inm.banos} Baños`}>
                        <Bath size={15} className="text-emerald-600 shrink-0" />
                        <span className="font-bold">{inm.banos} Baños</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 justify-center">
                        <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                        <span className="font-bold">Verificado</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 justify-center" title="Superficie Total">
                      <Maximize2 size={15} className="text-emerald-600 shrink-0" />
                      <span className="font-bold">{inm.areaTotalM2} m²</span>
                    </div>
                  </div>
                </div>

                {/* Acciones de Conversión 3D */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedInmueble(inm)
                      setActivePhotoIdx(0)
                    }}
                    className="flex-1 py-2.5 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-200/80 shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Eye size={14} /> Ficha Completa
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      openWhatsAppInmueble(inm)
                    }}
                    className="py-2.5 px-3.5 text-xs font-black text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_16px_rgba(16,185,129,0.4)] active:scale-95 cursor-pointer"
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
        <div className="fixed inset-0 z-[100] bg-white w-screen h-screen overflow-y-auto flex flex-col animate-fadeIn">
          {/* Header Pantalla Completa Inmersiva */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3.5 border-b border-gray-200 flex items-center justify-between z-30 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSelectedInmueble(null)}
                className="p-2 -ml-2 rounded-xl text-gray-700 hover:text-gray-950 hover:bg-gray-100 transition-colors flex items-center gap-1.5 cursor-pointer font-bold text-xs shrink-0"
                title="Volver al catálogo"
              >
                <ChevronLeft size={20} className="text-gray-800" />
                <span className="hidden sm:inline">Volver a Propiedades</span>
              </button>
              <div className="border-l border-gray-200 pl-3 min-w-0">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                  {selectedInmueble.codigo} · {selectedInmueble.modalidad === 'venta' ? 'En Venta' : 'En Arriendo'}
                </span>
                <h3 className="font-black text-gray-900 text-sm sm:text-base truncate max-w-[260px] sm:max-w-md lg:max-w-2xl">
                  {selectedInmueble.titulo}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openWhatsAppInmueble(selectedInmueble)}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                <MessageCircle size={15} />
                <span>Consultar Asesor</span>
              </button>
              <button 
                onClick={() => setSelectedInmueble(null)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                title="Cerrar Ficha"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-8 space-y-6 flex-1">
              {/* Galería Principal */}
              <div>
                <div className="relative h-72 md:h-96 w-full rounded-2xl overflow-hidden bg-gray-900 mb-3 shadow-inner group">
                  <img 
                    src={selectedInmueble.imagenes[activePhotoIdx]} 
                    alt={selectedInmueble.titulo} 
                    onClick={() => handlePhotoClick(activePhotoIdx)}
                    className="w-full h-full object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                    title="Haz clic para ubicar en el mapa y ver datos del propietario"
                  />

                  {/* Botón flotante para ubicar en el mapa */}
                  <button
                    type="button"
                    onClick={() => handlePhotoClick(activePhotoIdx)}
                    className="absolute top-3 left-3 bg-slate-900/80 hover:bg-emerald-600 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full backdrop-blur-md transition-all flex items-center gap-1.5 shadow-lg cursor-pointer z-10"
                  >
                    <MapPin size={13} className="text-emerald-400 animate-pulse" />
                    <span>Ubicar en Mapa & Propietario</span>
                  </button>

                  {selectedInmueble.imagenes.length > 1 && (
                    <>
                      <button 
                        onClick={() => setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : selectedInmueble.imagenes.length - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 z-10"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button 
                        onClick={() => setActivePhotoIdx((prev) => (prev < selectedInmueble.imagenes.length - 1 ? prev + 1 : 0))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 z-10"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[11px] font-bold px-2.5 py-1 rounded-full z-10">
                    {activePhotoIdx + 1} / {selectedInmueble.imagenes.length} fotos
                  </div>
                </div>

                {/* Miniaturas */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {selectedInmueble.imagenes.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePhotoClick(idx)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        activePhotoIdx === idx ? 'border-brand-sage ring-2 ring-brand-sage/30 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      title="Haz clic para centrar en el mapa y ver propietario"
                    >
                      <img src={img} alt="Miniatura" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Barra Horizontal de Características Físicas (Estilo Imagen 3) */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders size={14} className="text-brand-sage" /> Características Principales del Inmueble
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Ficha Técnica Verificada
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {/* 1. m² tot. */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50/90 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0">
                      <Maximize2 size={18} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Área Terreno</span>
                      <strong className="text-sm font-extrabold text-gray-900 truncate block">{selectedInmueble.areaTotalM2} m² tot.</strong>
                    </div>
                  </div>

                  {/* 2. m² cub. */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50/90 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-800 flex items-center justify-center shrink-0">
                      <Home size={18} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Área Cubierta</span>
                      <strong className="text-sm font-extrabold text-gray-900 truncate block">
                        {selectedInmueble.areaConstruidaM2 || selectedInmueble.areaTotalM2} m² cub.
                      </strong>
                    </div>
                  </div>

                  {/* 3. baños */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50/90 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-cyan-100/80 text-cyan-800 flex items-center justify-center shrink-0">
                      <Bath size={18} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Baños</span>
                      <strong className="text-sm font-extrabold text-gray-900 truncate block">{selectedInmueble.banos} baños</strong>
                    </div>
                  </div>

                  {/* 4. estac. */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50/90 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center shrink-0">
                      <Car size={18} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Parqueaderos</span>
                      <strong className="text-sm font-extrabold text-gray-900 truncate block">{selectedInmueble.parqueaderos || 1} estac.</strong>
                    </div>
                  </div>

                  {/* 5. hab. */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50/90 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-purple-100/80 text-purple-800 flex items-center justify-center shrink-0">
                      <Bed size={18} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Dormitorios</span>
                      <strong className="text-sm font-extrabold text-gray-900 truncate block">{selectedInmueble.habitaciones} hab.</strong>
                    </div>
                  </div>

                  {/* 6. antigüedad */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50/90 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-rose-100/80 text-rose-800 flex items-center justify-center shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Antigüedad</span>
                      <strong className="text-sm font-extrabold text-gray-900 truncate block">
                        {selectedInmueble.antiguedadAnios === 0 ? "A estrenar" : `${selectedInmueble.antiguedadAnios} años`}
                      </strong>
                    </div>
                  </div>
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

              {/* Mapa de Geolocalización y Entorno (Imagen 2) */}
              <div 
                id="mapa-geolocalizacion" 
                className={`bg-slate-50/90 rounded-2xl p-5 border transition-all duration-500 mt-5 shadow-xs scroll-mt-24 ${
                  mapHighlight ? "border-emerald-500 ring-4 ring-emerald-400/40 bg-emerald-50/40 scale-[1.01]" : "border-gray-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                      <MapPin size={18} />
                    </span>
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-sm">Geolocalización & Entorno del Inmueble</h4>
                      <p className="text-xs text-gray-500">{selectedInmueble.sector}, {selectedInmueble.ciudad} • {selectedInmueble.direccionAprox}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedInmueble.sector}, ${selectedInmueble.ciudad}, Ecuador`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <Compass size={14} className="text-emerald-600" />
                      <span>Abrir en Google Maps</span>
                    </a>
                    <a
                      href={`https://waze.com/ul?q=${encodeURIComponent(`${selectedInmueble.sector}, ${selectedInmueble.ciudad}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <span>Waze</span>
                    </a>
                  </div>
                </div>

                {/* Mapa Interactivo Embebido OpenStreetMap con Pin y Nombre del Propietario */}
                <div className="w-full h-72 sm:h-80 rounded-xl overflow-hidden border border-gray-200 relative shadow-inner bg-slate-200">
                  <iframe
                    title={`Mapa de ${selectedInmueble.titulo}`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${(selectedInmueble.coordenadas?.lng || -79.004) - 0.012}%2C${(selectedInmueble.coordenadas?.lat || -2.897) - 0.010}%2C${(selectedInmueble.coordenadas?.lng || -79.004) + 0.012}%2C${(selectedInmueble.coordenadas?.lat || -2.897) + 0.010}&layer=mapnik&marker=${selectedInmueble.coordenadas?.lat || -2.897}%2C${selectedInmueble.coordenadas?.lng || -79.004}`}
                    className="w-full h-full"
                  />

                  {/* Pin Flotante Principal con Nombre del Propietario */}
                  <div className={`absolute top-3 left-3 right-3 sm:right-auto sm:max-w-md bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border-2 transition-all duration-500 z-10 flex items-center gap-3 ${
                    mapHighlight ? "border-emerald-500 ring-4 ring-emerald-400/30 scale-105" : "border-gray-200"
                  }`}>
                    <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <MapPin size={24} className="animate-bounce" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                          Propietario del Inmueble
                        </span>
                        {mapHighlight && (
                          <span className="text-[10px] font-bold text-emerald-600 animate-pulse">¡Ubicado!</span>
                        )}
                      </div>
                      <p className="text-xs font-black text-gray-900 truncate mt-0.5">
                        {selectedInmueble.propietario?.nombre || "Ing. Carlos Vintimilla"}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {selectedInmueble.sector}, {selectedInmueble.ciudad} • {selectedInmueble.direccionAprox}
                      </p>
                    </div>
                    {selectedInmueble.propietario?.telefono && (
                      <a
                        href={`https://wa.me/${selectedInmueble.propietario.telefono.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hola ${selectedInmueble.propietario.nombre}, le escribo por su propiedad "${selectedInmueble.titulo}" publicada en SARA Inmobiliaria.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                        title="Contactar al Propietario por WhatsApp"
                      >
                        <MessageCircle size={15} />
                      </a>
                    )}
                  </div>

                  {/* Badge en esquina inferior */}
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 shadow-md border border-gray-200 flex items-center gap-2 pointer-events-none">
                    <MapPin size={16} className="text-red-600 animate-pulse" />
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block uppercase">Propietario Registrado</span>
                      <span className="text-xs font-bold text-gray-900">{selectedInmueble.propietario?.nombre || "Ing. Carlos Vintimilla"}</span>
                      <span className="text-[11px] text-gray-500 block">{selectedInmueble.sector}, {selectedInmueble.ciudad}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-gray-200/80 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
                    <span className="text-gray-400 block text-[10px] font-semibold uppercase">Ciudad</span>
                    <strong className="text-gray-900 font-bold">{selectedInmueble.ciudad}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
                    <span className="text-gray-400 block text-[10px] font-semibold uppercase">Sector</span>
                    <strong className="text-gray-900 font-bold">{selectedInmueble.sector}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
                    <span className="text-gray-400 block text-[10px] font-semibold uppercase">Vías de Acceso</span>
                    <strong className="text-emerald-700 font-bold">Asfaltadas / Urbanas</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
                    <span className="text-gray-400 block text-[10px] font-semibold uppercase">Plusvalía</span>
                    <strong className="text-emerald-800 font-bold">Zona Consolidada</strong>
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
      )}

      {/* Dedicated Footer for Standalone Inmobiliaria */}
      <footer className="bg-slate-950 border-t border-slate-800 text-gray-400 py-12 px-4 sm:px-8 mt-20">
        <div className="w-full max-w-[1760px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-dark border border-brand-sage/40 p-1 flex items-center justify-center">
              <img src={logoInmobiliaria} alt="SARA Inmobiliaria" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-black text-white text-sm tracking-wide">SARA INMOBILIARIA</span>
              <p className="text-xs text-gray-500">Bienes Raíces, Arquitectura y Garantía Constructiva en Cuenca y el Austro</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs">
            <Link href="/stays" className="hover:text-white transition-colors">Portal SARA STAYS / Hospédate</Link>
            <Link href="/" className="hover:text-white transition-colors">Sara Constructora Principal</Link>
            <Link href="/inmobiliaria/auth" className="hover:text-emerald-400 transition-colors">Publicar Propiedad</Link>
            <Link href="/inmobiliaria/mi-portal" className="hover:text-emerald-400 transition-colors">Mi Portal</Link>
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
