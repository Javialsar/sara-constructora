"use client"
import React, { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { 
  Sparkles, 
  Search, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Phone, 
  MessageCircle, 
  ExternalLink, 
  Pencil, 
  Trash2, 
  X, 
  Filter, 
  CreditCard, 
  Receipt, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Check, 
  CheckCircle2, 
  Clock, 
  Users, 
  MapPin, 
  Globe, 
  Bed, 
  Bath,
  ArrowRight,
  Send,
  Building,
  Tag,
  Star,
  FileCheck2,
  AlertCircle,
  Lock,
  Image as ImageIcon,
  Video,
  Landmark,
  Tv,
  Wifi,
  Coffee,
  Car,
  ChevronLeft,
  ChevronRight,
  Flame,
  Layers,
  Sparkle,
  FileSpreadsheet,
  FileText,
  Upload,
  Unlock,
  RefreshCw,
  Copy,
  Key,
  Percent,
  Calculator,
  Sliders
} from "lucide-react"
import AirbnbCoordinatePickerWrapper from "@/components/ui/AirbnbCoordinatePickerWrapper"
import { exportarAExcel, exportarAPDF } from "@/lib/services/exportReports"
import { StaysPolicies, DEFAULT_STAYS_POLICIES, getStaysPolicies, saveStaysPolicies } from "@/lib/services/staysPoliciesService"

export interface AirbnbAdminListing {
  id: string
  codigo: string
  titulo: string
  tipo: "suite" | "departamento" | "penthouse" | "casa" | "villa" | "quinta" | "loft"
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
  isSuperhost: boolean
  maxHuespedes: number
  habitaciones: number
  banos: number
  camas: number
  imagenUrl: string // Foto de portada principal
  imagenes: string[] // Galería completa de fotos
  videoUrl?: string
  amenidades: string[]
  descripcion: string
  reglas: string[]
  publicado: boolean
  // Datos del Anfitrión / Dueño
  anfitrion: {
    nombre: string
    telefono: string
    email: string
    cuentaBancaria: string
    banco?: string
    tipoCuenta?: string
    numeroCuenta?: string
    cedulaRuc?: string
    titular?: string
  }
  // Modelo de Cobro SARA (Monetización)
  monetizacion: {
    modelo: "comision_reserva" | "gestion_completa" | "membresia_fija"
    porcentajeComision: number // 15% o 20%
    cuotaFijaMensual?: number // $45
    totalComisionesGeneradas: number
  }
}

export interface ReservaAdmin {
  id: string
  codigoReserva: string
  alojamientoId: string
  alojamientoTitulo: string
  alojamientoCodigo: string
  anfitrionNombre: string
  anfitrionTelefono: string
  huespedNombre: string
  huespedTelefono: string
  huespedPais: string
  fechaCheckIn: string
  fechaCheckOut: string
  noches: number
  tarifaNoche: number
  subtotalNoches: number
  tarifaLimpieza: number
  totalHuesped: number
  // Retención SARA
  porcentajeComisionSara: number
  comisionGanadaSara: number
  // Liquidación Propietario
  netoParaAnfitrion: number
  estadoLiquidacion: "pendiente" | "liquidado"
  fechaLiquidacion?: string
  metodoLiquidacion?: string
  origen?: "web" | "manual"
  emailHuesped?: string
  identificacionHuesped?: string
  metodoPago?: string
  peticionesEspeciales?: string
}

export interface UsuarioHuespedAdmin {
  id: string
  created_at: string
  nombre: string
  apellido: string
  cedula: string
  telefono: string
  email: string
  clave: string
  estado: "activo" | "bloqueado"
  ciudadPais?: string
}

export const AMENIDADES_DISPONIBLES = [
  { id: "vista_rio", label: "Vista al Río", icon: "🌊" },
  { id: "wifi", label: "Internet/Wifi", icon: "📶" },
  { id: "smart_lock", label: "Smart Lock (Self Check-in)", icon: "🔐" },
  { id: "smart_tv", label: "Smart TV", icon: "📺" },
  { id: "cafetera", label: "Cafetera Nespresso", icon: "☕" },
  { id: "parqueadero", label: "Parqueadero Subterráneo", icon: "🚗" },
  { id: "cocina", label: "Cocina Equipada", icon: "🍳" },
  { id: "sala", label: "Sala de Estar", icon: "🛋️" },
  { id: "comedor", label: "Comedor", icon: "🍽️" },
  { id: "bbq", label: "Área BBQ / Parrilla", icon: "🍖" },
  { id: "terraza", label: "Terraza / Balcón", icon: "🌅" },
  { id: "piscina", label: "Piscina", icon: "🏊‍♂️" },
  { id: "jacuzzi", label: "Jacuzzi / Hidromasaje", icon: "🛁" },
  { id: "ac", label: "Aire Acondicionado", icon: "❄️" },
  { id: "lavadora", label: "Lavadora / Secadora", icon: "🧺" },
  { id: "pet_friendly", label: "Pet Friendly", icon: "🐾" },
  { id: "gimnasio", label: "Gimnasio", icon: "🏋️" },
  { id: "seguridad", label: "Seguridad 24/7", icon: "🛡️" }
]

export const FOTO_PRESETS = [
  { name: "Fachada Moderna", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" },
  { name: "Sala Principal", url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80" },
  { name: "Dormitorio Master", url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80" },
  { name: "Cocina Gourmet", url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80" },
  { name: "Terraza Panorámica", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80" },
  { name: "Piscina / Jardín", url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80" }
]

export const BANCOS_ECUADOR = [
  "Banco Pichincha",
  "Banco de Guayaquil",
  "Banco del Pacífico",
  "Produbanco - Grupo Promerica",
  "Banco Bolivariano",
  "Banco Internacional",
  "Cooperativa JEP",
  "Cooperativa Policía Nacional",
  "Mutualista Pichincha",
  "Banco de Loja",
  "Otro Banco / Internacional"
]

const ALOJAMIENTOS_INICIALES: AirbnbAdminListing[] = [
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
    lat: -2.9001,
    lng: -79.0059,
    precioNoche: 48,
    tarifaLimpieza: 15,
    rating: 4.98,
    isSuperhost: true,
    maxHuespedes: 2,
    habitaciones: 1,
    banos: 1,
    camas: 1,
    imagenUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    imagenes: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
    ],
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    amenidades: [
      "Vista al Río",
      "Internet/Wifi",
      "Smart Lock (Self Check-in)",
      "Smart TV",
      "Cafetera Nespresso",
      "Parqueadero Subterráneo",
      "Cocina Equipada",
      "Sala de Estar",
      "Comedor"
    ],
    descripcion: "Disfruta de amaneceres únicos con el sonido del río Tomebamba. Suite contemporánea equipada con cerradura inteligente para llegada autónoma 24/7, cama King con sábanas de 600 hilos, cafetera Nespresso e internet simétrico de alta velocidad.",
    reglas: [
      "Check-in: 15:00 a 22:00",
      "Check-out: 11:00",
      "No se permiten fiestas",
      "No fumar dentro de la suite"
    ],
    publicado: true,
    anfitrion: {
      nombre: "Patricio Carrasco",
      telefono: "+593 981804023",
      email: "patricio.carrasco@gmail.com",
      cuentaBancaria: "Banco Pichincha Ahorros 2201984532",
      banco: "Banco Pichincha",
      tipoCuenta: "Ahorros",
      numeroCuenta: "2201984532",
      cedulaRuc: "0103492817",
      titular: "Patricio Carrasco"
    },
    monetizacion: {
      modelo: "comision_reserva",
      porcentajeComision: 15,
      totalComisionesGeneradas: 320
    }
  },
  {
    id: "ab-2",
    codigo: "SARA-EC-02",
    titulo: "Penthouse Exclusivo con Terraza 360° en la Solano",
    tipo: "penthouse",
    alcance: "nacional",
    pais: "Ecuador",
    bandera: "🇪🇨",
    ciudad: "Cuenca",
    sector: "Av. Solano",
    lat: -2.9095,
    lng: -79.0112,
    precioNoche: 95,
    tarifaLimpieza: 25,
    rating: 5.0,
    isSuperhost: true,
    maxHuespedes: 6,
    habitaciones: 3,
    banos: 2.5,
    camas: 3,
    imagenUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    imagenes: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
    ],
    videoUrl: "",
    amenidades: [
      "Terraza / Balcón",
      "Área BBQ / Parrilla",
      "Internet/Wifi",
      "Smart Lock (Self Check-in)",
      "Smart TV",
      "Cocina Equipada",
      "Sala de Estar",
      "Comedor",
      "Parqueadero Subterráneo"
    ],
    descripcion: "Penthouse exclusivo de dos niveles con vista panorámica a la ciudad y montañas. Terraza privada con pérgola y barbacoa, cocina equipada con isla de cuarzo y sonido envolvente.",
    reglas: [
      "Check-in: 15:00 a 22:00",
      "Check-out: 11:00",
      "No se permiten fiestas",
      "No fumar dentro"
    ],
    publicado: true,
    anfitrion: {
      nombre: "Sofía Arteaga",
      telefono: "+593 991122334",
      email: "sofia.arteaga@hotmail.com",
      cuentaBancaria: "Banco de Guayaquil Corriente 0012398412",
      banco: "Banco de Guayaquil",
      tipoCuenta: "Corriente",
      numeroCuenta: "0012398412",
      cedulaRuc: "0102983741",
      titular: "Sofía Arteaga"
    },
    monetizacion: {
      modelo: "gestion_completa",
      porcentajeComision: 20,
      totalComisionesGeneradas: 570
    }
  },
  {
    id: "ab-3",
    codigo: "SARA-EC-03",
    titulo: "Villa Campestre de Lujo con Jacuzzi en Yunguilla",
    tipo: "quinta",
    alcance: "nacional",
    pais: "Ecuador",
    bandera: "🇪🇨",
    ciudad: "Yunguilla",
    sector: "Santa Isabel",
    lat: -3.2389,
    lng: -79.2889,
    precioNoche: 140,
    tarifaLimpieza: 35,
    rating: 4.96,
    isSuperhost: false,
    maxHuespedes: 10,
    habitaciones: 4,
    banos: 3,
    camas: 6,
    imagenUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
    imagenes: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
    ],
    videoUrl: "",
    amenidades: [
      "Piscina",
      "Jacuzzi / Hidromasaje",
      "Área BBQ / Parrilla",
      "Terraza / Balcón",
      "Cocina Equipada",
      "Sala de Estar",
      "Comedor",
      "Internet/Wifi",
      "Parqueadero Privado",
      "Pet Friendly"
    ],
    descripcion: "Fabulosa villa en el clima cálido del valle de Yunguilla. Piscina privada con cascada, jacuzzi climatizado, amplios jardines y zona de barbacoa rústica.",
    reglas: [
      "Check-in: 14:00",
      "Check-out: 12:00",
      "Música moderada después de las 23:00",
      "Mascotas bienvenidas en áreas verdes"
    ],
    publicado: true,
    anfitrion: {
      nombre: "Dr. Roberto Morales",
      telefono: "+593 987654321",
      email: "roberto.morales@clinica.ec",
      cuentaBancaria: "Produbanco Ahorros 1205098734",
      banco: "Produbanco - Grupo Promerica",
      tipoCuenta: "Ahorros",
      numeroCuenta: "1205098734",
      cedulaRuc: "0101827463",
      titular: "Roberto Morales"
    },
    monetizacion: {
      modelo: "comision_reserva",
      porcentajeComision: 15,
      totalComisionesGeneradas: 420
    }
  },
  {
    id: "ab-4",
    codigo: "SARA-INT-01",
    titulo: "Luxury Condo Brickell con Vista a la Bahía de Biscayne",
    tipo: "suite",
    alcance: "internacional",
    pais: "Estados Unidos",
    bandera: "🇺🇸",
    ciudad: "Miami",
    sector: "Brickell Financial",
    lat: 25.7617,
    lng: -80.1918,
    precioNoche: 185,
    tarifaLimpieza: 60,
    rating: 4.97,
    isSuperhost: true,
    maxHuespedes: 4,
    habitaciones: 2,
    banos: 2,
    camas: 2,
    imagenUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    imagenes: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
    ],
    videoUrl: "",
    amenidades: [
      "Piscina",
      "Gimnasio",
      "Internet/Wifi",
      "Smart TV",
      "Smart Lock (Self Check-in)",
      "Cocina Equipada",
      "Aire Acondicionado",
      "Seguridad 24/7"
    ],
    descripcion: "Condominio de lujo en el corazón de Brickell, Miami. Acceso a piscina infinita en la azotea, gimnasio de última generación y vistas directas a la bahía.",
    reglas: [
      "Check-in: 16:00",
      "Check-out: 11:00",
      "No fiestas ni eventos",
      "Prohibido fumar en todo el edificio"
    ],
    publicado: true,
    anfitrion: {
      nombre: "David Goldstein (Rep. Miami)",
      telefono: "+1 305 555 1234",
      email: "david.miami@properties.com",
      cuentaBancaria: "Chase Bank Wire 44029104",
      banco: "Otro Banco / Internacional",
      tipoCuenta: "Corriente",
      numeroCuenta: "44029104",
      cedulaRuc: "US-9928172",
      titular: "David Goldstein"
    },
    monetizacion: {
      modelo: "membresia_fija",
      porcentajeComision: 10,
      cuotaFijaMensual: 45,
      totalComisionesGeneradas: 450
    }
  },
  {
    id: "ab-5",
    codigo: "SARA-INT-02",
    titulo: "Piso Señorial en Barrio de Salamanca Frente a El Retiro",
    tipo: "loft",
    alcance: "internacional",
    pais: "España",
    bandera: "🇪🇸",
    ciudad: "Madrid",
    sector: "Barrio de Salamanca",
    lat: 40.4168,
    lng: -3.7038,
    precioNoche: 145,
    tarifaLimpieza: 40,
    rating: 4.95,
    isSuperhost: true,
    maxHuespedes: 4,
    habitaciones: 2,
    banos: 2,
    camas: 2,
    imagenUrl: "https://images.unsplash.com/photo-1502005229762-ee1b2da92e06?auto=format&fit=crop&w=800&q=80",
    imagenes: [
      "https://images.unsplash.com/photo-1502005229762-ee1b2da92e06?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
    ],
    videoUrl: "",
    amenidades: [
      "Internet/Wifi",
      "Smart TV",
      "Cafetera Nespresso",
      "Cocina Equipada",
      "Sala de Estar",
      "Comedor",
      "Aire Acondicionado",
      "Lavadora / Secadora"
    ],
    descripcion: "Piso de arquitectura clásica madrileña con techos altos, molduras originales y decoración refinada junto al Parque del Buen Retiro.",
    reglas: [
      "Check-in: 15:00",
      "Check-out: 11:00",
      "Respetar horas de descanso",
      "No fumar"
    ],
    publicado: true,
    anfitrion: {
      nombre: "Elena Serrano",
      telefono: "+34 612 345 678",
      email: "elena.serrano@madrid.es",
      cuentaBancaria: "Santander IBAN ES912100",
      banco: "Otro Banco / Internacional",
      tipoCuenta: "Corriente",
      numeroCuenta: "ES912100",
      cedulaRuc: "ES-Y829104A",
      titular: "Elena Serrano"
    },
    monetizacion: {
      modelo: "comision_reserva",
      porcentajeComision: 15,
      totalComisionesGeneradas: 380
    }
  }
]

const RESERVAS_INICIALES: ReservaAdmin[] = [
  {
    id: "res-1",
    codigoReserva: "RSV-2026-081",
    alojamientoId: "ab-1",
    alojamientoTitulo: "Master Suite de Diseño Frente al Río Tomebamba",
    alojamientoCodigo: "SARA-EC-01",
    anfitrionNombre: "Patricio Carrasco",
    anfitrionTelefono: "+593998765432",
    huespedNombre: "Michael & Sarah Jenkins",
    huespedTelefono: "+1 415 789 1234",
    huespedPais: "Estados Unidos 🇺🇸",
    fechaCheckIn: "2026-09-20",
    fechaCheckOut: "2026-09-24",
    noches: 4,
    tarifaNoche: 48,
    subtotalNoches: 192,
    tarifaLimpieza: 15,
    totalHuesped: 207,
    porcentajeComisionSara: 15,
    comisionGanadaSara: 28.80,
    netoParaAnfitrion: 163.20,
    estadoLiquidacion: "liquidado",
    fechaLiquidacion: "2026-09-21",
    metodoLiquidacion: "Transferencia Banco Pichincha"
  },
  {
    id: "res-2",
    codigoReserva: "RSV-2026-082",
    alojamientoId: "ab-2",
    alojamientoTitulo: "Penthouse Exclusivo con Terraza 360° en la Solano",
    alojamientoCodigo: "SARA-EC-02",
    anfitrionNombre: "Sofía Arteaga",
    anfitrionTelefono: "+593991122334",
    huespedNombre: "Andrés Guarderas",
    huespedTelefono: "+593 99 445 6677",
    huespedPais: "Ecuador (Quito) 🇪🇨",
    fechaCheckIn: "2026-09-26",
    fechaCheckOut: "2026-09-29",
    noches: 3,
    tarifaNoche: 95,
    subtotalNoches: 285,
    tarifaLimpieza: 25,
    totalHuesped: 310,
    porcentajeComisionSara: 20,
    comisionGanadaSara: 57.00,
    netoParaAnfitrion: 228.00,
    estadoLiquidacion: "pendiente"
  },
  {
    id: "res-3",
    codigoReserva: "RSV-2026-083",
    alojamientoId: "ab-3",
    alojamientoTitulo: "Villa Campestre de Lujo con Jacuzzi en Yunguilla",
    alojamientoCodigo: "SARA-EC-03",
    anfitrionNombre: "Dr. Roberto Morales",
    anfitrionTelefono: "+593987654321",
    huespedNombre: "Familia Cárdenas Mora",
    huespedTelefono: "+593 98 123 7890",
    huespedPais: "Ecuador (Guayaquil) 🇪🇨",
    fechaCheckIn: "2026-10-02",
    fechaCheckOut: "2026-10-05",
    noches: 3,
    tarifaNoche: 140,
    subtotalNoches: 420,
    tarifaLimpieza: 35,
    totalHuesped: 455,
    porcentajeComisionSara: 15,
    comisionGanadaSara: 63.00,
    netoParaAnfitrion: 357.00,
    estadoLiquidacion: "pendiente"
  }
]

export default function AdminAirbnbPage() {
  const [alojamientos, setAlojamientos] = useState<AirbnbAdminListing[]>(ALOJAMIENTOS_INICIALES)
  const [reservas, setReservas] = useState<ReservaAdmin[]>(RESERVAS_INICIALES)
  const [isLoadingReservas, setIsLoadingReservas] = useState(false)

  // Cargar alojamientos reales almacenados en la base de datos de Supabase
  useEffect(() => {
    async function loadAlojamientosBD() {
      try {
        const res = await fetch("/api/airbnb/alojamientos")
        if (res.ok) {
          const data = await res.json()
          if (data.alojamientos && Array.isArray(data.alojamientos) && data.alojamientos.length > 0) {
            setAlojamientos(data.alojamientos)
          }
        }
      } catch (err) {
        console.warn("No se pudieron cargar alojamientos de Supabase:", err)
      }
    }
    loadAlojamientosBD()
  }, [])

  // Cargar reservas reales almacenadas en la base de datos de Supabase
  useEffect(() => {
    async function loadReservasReales() {
      setIsLoadingReservas(true)
      try {
        const res = await fetch("/api/airbnb/reserva")
        if (res.ok) {
          const data = await res.json()
          if (data.reservas && Array.isArray(data.reservas) && data.reservas.length > 0) {
            const reservasReales: ReservaAdmin[] = data.reservas.map((r: any, idx: number) => {
              const noches = Number(r.fechas?.noches) || 1
              const tarifaNoche = Number(r.totales?.precio_noche) || Number(r.alojamiento?.precio_noche) || 50
              const subtotal = tarifaNoche * noches
              const tarifaLimpieza = Number(r.totales?.tarifa_limpieza) || 20
              const totalHuesped = Number(r.totales?.gran_total) || (subtotal + tarifaLimpieza)
              const comisionSara = subtotal * 0.15
              const netoAnfitrion = (subtotal * 0.85) + tarifaLimpieza

              return {
                id: r.codigo_reserva || `res-web-${idx}`,
                codigoReserva: r.codigo_reserva || `SARA-RSV-${idx}`,
                alojamientoId: r.alojamiento?.id || "ab-2",
                alojamientoTitulo: r.alojamiento?.titulo || "Alojamiento SARA",
                alojamientoCodigo: r.alojamiento?.codigo || "SARA-EC-02",
                anfitrionNombre: "SARA Hospitality Cía.",
                anfitrionTelefono: "+593 98 180 4023",
                huespedNombre: `${r.huesped?.nombre || ""} ${r.huesped?.apellido || ""}`.trim(),
                huespedTelefono: r.huesped?.telefono || "",
                huespedPais: `${r.alojamiento?.ciudad || "Ecuador"}, ${r.alojamiento?.pais || "Ecuador"} 🇪🇨`,
                fechaCheckIn: r.fechas?.check_in || "",
                fechaCheckOut: r.fechas?.check_out || "",
                noches: noches,
                tarifaNoche: tarifaNoche,
                subtotalNoches: subtotal,
                tarifaLimpieza: tarifaLimpieza,
                totalHuesped: totalHuesped,
                porcentajeComisionSara: 15,
                comisionGanadaSara: comisionSara,
                netoParaAnfitrion: netoAnfitrion,
                estadoLiquidacion: r.estado_reserva === "confirmada_liquidada" ? "liquidado" : "pendiente",
                origen: "web",
                emailHuesped: r.huesped?.email || "",
                identificacionHuesped: r.huesped?.identificacion || "",
                metodoPago: r.metodo_pago || "transferencia",
                peticionesEspeciales: r.peticiones_especiales || ""
              }
            })

            setReservas(prev => {
              const codigosReales = new Set(reservasReales.map(r => r.codigoReserva))
              const mockFiltradas = prev.filter(m => !codigosReales.has(m.codigoReserva))
              return [...reservasReales, ...mockFiltradas]
            })
          }
        }
      } catch (err) {
        console.error("Error al cargar reservas de base de datos:", err)
      } finally {
        setIsLoadingReservas(false)
      }
    }

    loadReservasReales()
  }, [])

  // Pestaña Activa: "alojamientos", "reservas", "usuarios" o "politicas"
  const [activeTab, setActiveTab] = useState<"alojamientos" | "reservas" | "usuarios" | "politicas">("alojamientos")

  // Estados para Políticas de Reserva y Cancelación de SARA Stays
  const [politicasStays, setPoliticasStays] = useState<StaysPolicies>(DEFAULT_STAYS_POLICIES)
  const [isSavingPoliticas, setIsSavingPoliticas] = useState(false)
  const [politicasSuccessMsg, setPoliticasSuccessMsg] = useState("")
  const [simuladorMonto, setSimuladorMonto] = useState<number>(200)

  useEffect(() => {
    getStaysPolicies().then(setPoliticasStays)
  }, [])

  const handleSavePoliticas = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingPoliticas(true)
    setPoliticasSuccessMsg("")
    try {
      const ok = await saveStaysPolicies(politicasStays)
      if (ok) {
        setPoliticasSuccessMsg("¡Políticas y porcentajes de penalización actualizados exitosamente! Ya se aplican en la web de reservas.")
        setTimeout(() => setPoliticasSuccessMsg(""), 5000)
      } else {
        alert("Las políticas se guardaron localmente. Verifica la conexión con la base de datos.")
      }
    } catch (err: any) {
      alert("Error al guardar: " + err.message)
    } finally {
      setIsSavingPoliticas(false)
    }
  }

  // Estado para Huéspedes & Usuarios Registrados
  const [usuarios, setUsuarios] = useState<UsuarioHuespedAdmin[]>([])
  const [isLoadingUsuarios, setIsLoadingUsuarios] = useState(false)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({})
  const [filtroEstadoUsuario, setFiltroEstadoUsuario] = useState<string>("todos")
  const [copiedUsuarioField, setCopiedUsuarioField] = useState<string | null>(null)

  const loadUsuarios = async () => {
    setIsLoadingUsuarios(true)
    try {
      const res = await fetch("/api/airbnb/usuarios")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.usuarios)) {
          setUsuarios(data.usuarios)
        }
      }
    } catch (err) {
      console.warn("Aviso cargando usuarios:", err)
    } finally {
      setIsLoadingUsuarios(false)
    }
  }

  useEffect(() => {
    loadUsuarios()
  }, [])

  // Filtros y Búsqueda
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroAlcance, setFiltroAlcance] = useState<string>("todos")
  const [filtroLiquidacion, setFiltroLiquidacion] = useState<string>("todos")

  // Modales
  const [isAlojamientoModalOpen, setIsAlojamientoModalOpen] = useState(false)
  const [editingAlojamiento, setEditingAlojamiento] = useState<AirbnbAdminListing | null>(null)

  const [isReservaModalOpen, setIsReservaModalOpen] = useState(false)

  // Form State para Alojamiento
  // Pestaña activa dentro del Modal de Alojamiento
  const [modalTab, setModalTab] = useState<"general" | "multimedia" | "anfitrion" | "caracteristicas" | "tarifas">("general")

  // Form State para Alojamiento
  const [formAlojamiento, setFormAlojamiento] = useState({
    codigo: "",
    titulo: "",
    tipo: "suite" as AirbnbAdminListing["tipo"],
    alcance: "nacional" as AirbnbAdminListing["alcance"],
    pais: "Ecuador",
    bandera: "🇪🇨",
    ciudad: "Cuenca",
    sector: "Av. Ordóñez Lasso",
    lat: -2.9001,
    lng: -79.0059,
    precioNoche: 55,
    tarifaLimpieza: 20,
    isSuperhost: true,
    maxHuespedes: 2,
    habitaciones: 1,
    banos: 1,
    camas: 1,
    imagenUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    imagenes: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
    ],
    videoUrl: "",
    nuevaFotoUrl: "",
    amenidades: [
      "Vista al Río",
      "Internet/Wifi",
      "Smart Lock (Self Check-in)",
      "Smart TV",
      "Cafetera Nespresso",
      "Parqueadero Subterráneo",
      "Cocina Equipada",
      "Sala de Estar",
      "Comedor"
    ],
    nuevaAmenidad: "",
    descripcion: "Disfruta de amaneceres únicos con el sonido del río Tomebamba. Suite contemporánea equipada con cerradura inteligente para llegada autónoma 24/7, cama King con sábanas de 600 hilos, cafetera Nespresso e internet simétrico de alta velocidad.",
    reglasTexto: "Check-in: 15:00 a 22:00\nCheck-out: 11:00\nNo se permiten fiestas\nNo fumar dentro de la suite",
    publicado: true,
    anfitrionNombre: "Javier Sarango",
    anfitrionTelefono: "+593 981804023",
    anfitrionEmail: "javier.sarango@gmail.com",
    anfitrionCedulaRuc: "0103492817",
    anfitrionBanco: "Banco Pichincha",
    anfitrionTipoCuenta: "Ahorros",
    anfitrionNumeroCuenta: "2201984532",
    anfitrionTitular: "Javier Sarango",
    anfitrionCuenta: "Banco Pichincha Ahorros 2201984532",
    modeloMonetizacion: "comision_reserva" as AirbnbAdminListing["monetizacion"]["modelo"],
    porcentajeComision: 15,
    cuotaFijaMensual: 45
  })

  // Funciones de gestión de fotos
  const handleAddFoto = (urlToAdd?: string) => {
    const targetUrl = (urlToAdd || formAlojamiento.nuevaFotoUrl).trim()
    if (!targetUrl) return
    if (!formAlojamiento.imagenes.includes(targetUrl)) {
      setFormAlojamiento(prev => ({
        ...prev,
        imagenes: [...prev.imagenes, targetUrl],
        nuevaFotoUrl: "",
        imagenUrl: prev.imagenUrl ? prev.imagenUrl : targetUrl
      }))
    } else {
      setFormAlojamiento(prev => ({ ...prev, nuevaFotoUrl: "" }))
    }
  }

  const handleRemoveFoto = (indexToRemove: number) => {
    setFormAlojamiento(prev => {
      const remaining = prev.imagenes.filter((_, idx) => idx !== indexToRemove)
      const removedUrl = prev.imagenes[indexToRemove]
      let newCover = prev.imagenUrl
      if (removedUrl === prev.imagenUrl) {
        newCover = remaining.length > 0 ? remaining[0] : ""
      }
      return {
        ...prev,
        imagenes: remaining,
        imagenUrl: newCover
      }
    })
  }

  const handleSetPortada = (url: string) => {
    setFormAlojamiento(prev => ({ ...prev, imagenUrl: url }))
  }

  // Subida de fotos desde el dispositivo (PC, Móvil, Tablet)
  const handleDevicePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        if (base64) {
          setFormAlojamiento(prev => {
            if (!prev.imagenes.includes(base64)) {
              return {
                ...prev,
                imagenes: [...prev.imagenes, base64],
                imagenUrl: prev.imagenUrl ? prev.imagenUrl : base64
              }
            }
            return prev
          })
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ""
  }

  // Subida de video desde el dispositivo
  const handleDeviceVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      if (base64) {
        setFormAlojamiento(prev => ({ ...prev, videoUrl: base64 }))
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  // Exportar Alojamientos a Excel
  const handleExportarAlojamientosExcel = () => {
    const dataFormatted = alojamientosFiltrados.map(a => ({
      "Código": a.codigo,
      "Título del Alojamiento": a.titulo,
      "Tipo de Inmueble": a.tipo.toUpperCase(),
      "Alcance": a.alcance === "nacional" ? "Nacional (Ecuador)" : "Internacional",
      "Ciudad": a.ciudad,
      "Sector": a.sector,
      "Precio/Noche ($ USD)": a.precioNoche,
      "Tarifa Limpieza ($ USD)": a.tarifaLimpieza,
      "Huéspedes Máx.": a.maxHuespedes,
      "Habitaciones": a.habitaciones,
      "Baños": a.banos,
      "Camas": a.camas,
      "Superhost": a.isSuperhost ? "Sí" : "No",
      "Nombre Anfitrión": a.anfitrion.nombre,
      "Cédula / RUC": a.anfitrion.cedulaRuc || "N/A",
      "Teléfono Anfitrión": a.anfitrion.telefono,
      "Email Anfitrión": a.anfitrion.email,
      "Banco": a.anfitrion.banco || "N/A",
      "Tipo de Cuenta": a.anfitrion.tipoCuenta || "N/A",
      "Número de Cuenta": a.anfitrion.numeroCuenta || "N/A",
      "Modelo Comisión SARA": a.monetizacion.modelo === "gestion_completa" ? "Gestión 20%" : a.monetizacion.modelo === "comision_reserva" ? "Comisión 15%" : "Membresía $45/mes",
      "Comisiones Generadas SARA ($)": a.monetizacion.totalComisionesGeneradas,
      "Publicado": a.publicado ? "Sí (Visible en Mapa)" : "Oculto"
    }))
    exportarAExcel(dataFormatted, "Catalogo_Alojamientos_Airbnb_SARA", "Alojamientos SARA")
  }

  // Exportar Alojamientos a PDF
  const handleExportarAlojamientosPDF = () => {
    const headers = ["Código", "Alojamiento", "Ciudad", "Precio/N.", "Capacidad", "Anfitrión", "Cédula/RUC", "Banco / Cuenta", "Comisión SARA"]
    const rows = alojamientosFiltrados.map(a => [
      a.codigo,
      a.titulo.length > 22 ? a.titulo.substring(0, 22) + "..." : a.titulo,
      `${a.bandera} ${a.ciudad}`,
      `$${a.precioNoche}`,
      `${a.maxHuespedes} huéspedes`,
      a.anfitrion.nombre,
      a.anfitrion.cedulaRuc || "N/A",
      `${a.anfitrion.banco || 'Banco'} (${a.anfitrion.numeroCuenta || '---'})`,
      a.monetizacion.modelo === "gestion_completa" ? "20%" : a.monetizacion.modelo === "comision_reserva" ? "15%" : "$45/m"
    ])
    exportarAPDF(
      "CATÁLOGO DE ALOJAMIENTOS & ANFITRIONES AIRBNB SARA",
      headers,
      rows,
      "Catalogo_Alojamientos_SARA",
      `Generado: ${new Date().toLocaleDateString('es-EC')} | Total alojamientos: ${alojamientosFiltrados.length}`
    )
  }

  // Exportar Reservas a Excel
  const handleExportarReservasExcel = () => {
    const dataFormatted = reservasFiltradas.map(r => ({
      "Código Reserva": r.codigoReserva,
      "Huésped": r.huespedNombre,
      "Cédula / Pasaporte": r.identificacionHuesped || "N/A",
      "Teléfono Huésped": r.huespedTelefono,
      "Email Huésped": r.emailHuesped || "N/A",
      "Alojamiento": r.alojamientoTitulo,
      "Código Alojamiento": r.alojamientoCodigo,
      "Dueño / Anfitrión": r.anfitrionNombre,
      "Check-In": r.fechaCheckIn,
      "Check-Out": r.fechaCheckOut,
      "Noches": r.noches,
      "Tarifa/Noche ($)": r.tarifaNoche,
      "Subtotal Estadía ($)": r.subtotalNoches,
      "Tarifa Limpieza ($)": r.tarifaLimpieza,
      "Total Huésped ($)": r.totalHuesped,
      "Comisión SARA ($)": r.comisionGanadaSara,
      "% Retención SARA": `${r.porcentajeComisionSara}%`,
      "Neto para Anfitrión ($)": r.netoParaAnfitrion,
      "Estado Liquidación": r.estadoLiquidacion === "liquidado" ? "Liquidado" : "Pendiente de Transferencia",
      "Método de Pago": r.metodoPago || "Transferencia Bancaria",
      "Origen": r.origen === "web" ? "Portal Web" : "Manual"
    }))
    exportarAExcel(dataFormatted, "Reporte_Reservas_Liquidaciones_SARA", "Reservas SARA")
  }

  // Exportar Reservas a PDF
  const handleExportarReservasPDF = () => {
    const headers = ["Reserva", "Huésped", "Alojamiento", "Fechas", "Total Cobrado", "Comisión SARA", "Neto Anfitrión", "Estado"]
    const rows = reservasFiltradas.map(r => [
      r.codigoReserva,
      r.huespedNombre,
      r.alojamientoCodigo,
      `${r.fechaCheckIn} al ${r.fechaCheckOut} (${r.noches} n.)`,
      `$${r.totalHuesped}`,
      `+$${r.comisionGanadaSara.toFixed(2)} (${r.porcentajeComisionSara}%)`,
      `$${r.netoParaAnfitrion.toFixed(2)}`,
      r.estadoLiquidacion === "liquidado" ? "Liquidado" : "Pendiente"
    ])
    exportarAPDF(
      "REPORTE DE RESERVAS & LIQUIDACIONES FINANCIERAS SARA",
      headers,
      rows,
      "Reporte_Reservas_SARA",
      `Generado: ${new Date().toLocaleDateString('es-EC')} | Total reservas: ${reservasFiltradas.length}`
    )
  }

  // Filtrado de Usuarios Huéspedes
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(u => {
      if (filtroEstadoUsuario !== "todos" && u.estado !== filtroEstadoUsuario) return false
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim()
        const match = (
          u.nombre.toLowerCase().includes(q) ||
          u.apellido.toLowerCase().includes(q) ||
          u.cedula.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.telefono.toLowerCase().includes(q)
        )
        if (!match) return false
      }
      return true
    })
  }, [usuarios, filtroEstadoUsuario, searchTerm])

  // Bloquear / Activar Usuario
  const handleToggleEstadoUsuario = async (u: UsuarioHuespedAdmin) => {
    const nuevoEstado = u.estado === "activo" ? "bloqueado" : "activo"
    const confirmMsg = nuevoEstado === "bloqueado" 
      ? `¿Deseas bloquear el acceso a ${u.nombre} ${u.apellido}? No podrá ingresar al Portal de Huéspedes.`
      : `¿Deseas activar nuevamente la cuenta de ${u.nombre} ${u.apellido}?`

    if (!confirm(confirmMsg)) return

    try {
      const res = await fetch("/api/airbnb/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id, accion: nuevoEstado === "bloqueado" ? "bloquear" : "activar" })
      })

      if (res.ok) {
        setUsuarios(prev => prev.map(item => item.id === u.id ? { ...item, estado: nuevoEstado } : item))
        alert(`Cuenta de ${u.nombre} ${nuevoEstado === "bloqueado" ? "bloqueada" : "activada"} con éxito.`)
      }
    } catch {
      alert("Error al actualizar estado del usuario.")
    }
  }

  // Generar Nueva Clave
  const handleGenerarNuevaClave = async (u: UsuarioHuespedAdmin) => {
    const numRandom = Math.floor(1000 + Math.random() * 9000)
    const claveSugerida = `SARA${numRandom}*Key`
    const clavePersonalizada = prompt(`Generar nueva clave para ${u.nombre} ${u.apellido}.\n\nPuedes usar la sugerida o ingresar una personalizada:`, claveSugerida)
    
    if (!clavePersonalizada || !clavePersonalizada.trim()) return

    try {
      const res = await fetch("/api/airbnb/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id, accion: "generar_clave", nuevaClave: clavePersonalizada.trim() })
      })

      if (res.ok) {
        setUsuarios(prev => prev.map(item => item.id === u.id ? { ...item, clave: clavePersonalizada.trim(), estado: "activo" } : item))
        setVisiblePasswords(prev => ({ ...prev, [u.id]: true }))
        
        const enviarWhatsApp = confirm(`✅ Nueva clave generada con éxito:\n\nUsuario: ${u.email}\nNueva Clave: ${clavePersonalizada.trim()}\n\n¿Deseas abrir WhatsApp para enviársela directamente a ${u.telefono}?`)
        if (enviarWhatsApp) {
          const msg = encodeURIComponent(`Hola ${u.nombre}, tu nueva contraseña para ingresar al Portal de Huéspedes SARA STAYS es: ${clavePersonalizada.trim()}\n\nPuedes acceder aquí: https://sara-constructora.vercel.app/stays/auth`)
          window.open(`https://wa.me/${u.telefono.replace(/[^0-9]/g, "")}?text=${msg}`, "_blank")
        }
      }
    } catch {
      alert("Error al actualizar la contraseña del usuario.")
    }
  }

  // Eliminar Usuario
  const handleEliminarUsuario = async (u: UsuarioHuespedAdmin) => {
    if (!confirm(`¿Estás seguro de eliminar el registro de ${u.nombre} ${u.apellido} (${u.email})?`)) return
    try {
      const res = await fetch(`/api/airbnb/usuarios?id=${u.id}`, { method: "DELETE" })
      if (res.ok) {
        setUsuarios(prev => prev.filter(item => item.id !== u.id))
      }
    } catch {
      alert("Error al eliminar usuario.")
    }
  }

  // Exportar Usuarios a Excel
  const handleExportarUsuariosExcel = () => {
    const dataFormatted = usuariosFiltrados.map(u => ({
      "Fecha Creación": new Date(u.created_at).toLocaleString("es-EC"),
      "Nombre": u.nombre,
      "Apellido": u.apellido,
      "Cédula / Pasaporte": u.cedula,
      "WhatsApp / Teléfono": u.telefono,
      "Correo Electrónico": u.email,
      "Contraseña": u.clave,
      "Estado": u.estado === "activo" ? "Activo" : "Bloqueado",
      "Ubicación": u.ciudadPais || "Ecuador"
    }))
    exportarAExcel(dataFormatted, "Usuarios_Huespedes_Airbnb_SARA", "Huéspedes SARA")
  }

  // Exportar Usuarios a PDF
  const handleExportarUsuariosPDF = () => {
    const headers = ["Fecha Creación", "Huésped", "Cédula", "Teléfono", "Email", "Clave", "Estado"]
    const rows = usuariosFiltrados.map(u => [
      new Date(u.created_at).toLocaleString("es-EC"),
      `${u.nombre} ${u.apellido}`.trim(),
      u.cedula,
      u.telefono,
      u.email,
      u.clave,
      u.estado === "activo" ? "Activo" : "Bloqueado"
    ])
    exportarAPDF(
      "REPORTE DE HUÉSPEDES & USUARIOS REGISTRADOS SARA AIRBNB",
      headers,
      rows,
      "Usuarios_Huespedes_SARA",
      `Generado: ${new Date().toLocaleDateString('es-EC')} | Total usuarios: ${usuariosFiltrados.length}`
    )
  }

  // Funciones de gestión de amenidades
  const handleToggleAmenidad = (label: string) => {
    setFormAlojamiento(prev => {
      const exists = prev.amenidades.includes(label)
      const updated = exists 
        ? prev.amenidades.filter(a => a !== label)
        : [...prev.amenidades, label]
      return { ...prev, amenidades: updated }
    })
  }

  const handleAddCustomAmenidad = () => {
    const trimmed = formAlojamiento.nuevaAmenidad.trim()
    if (!trimmed) return
    if (!formAlojamiento.amenidades.includes(trimmed)) {
      setFormAlojamiento(prev => ({
        ...prev,
        amenidades: [...prev.amenidades, trimmed],
        nuevaAmenidad: ""
      }))
    } else {
      setFormAlojamiento(prev => ({ ...prev, nuevaAmenidad: "" }))
    }
  }

  // Form State para Nueva Reserva y Liquidación
  const [formReserva, setFormReserva] = useState({
    alojamientoId: "",
    huespedNombre: "",
    huespedTelefono: "+593 ",
    huespedPais: "Ecuador 🇪🇨",
    fechaCheckIn: "",
    fechaCheckOut: "",
    noches: 2,
    tarifaNoche: 50,
    tarifaLimpieza: 15,
    porcentajeComisionSara: 15
  })

  // Estadísticas Financieras en tiempo real
  const stats = useMemo(() => {
    const totalAlojamientos = alojamientos.length
    const nacionales = alojamientos.filter(a => a.alcance === "nacional").length
    const internacionales = alojamientos.filter(a => a.alcance === "internacional").length
    
    // Total de comisiones ganadas por SARA en reservas
    const comisionesGanadasSara = reservas.reduce((acc, r) => acc + r.comisionGanadaSara, 0)
    // Total por liquidar a anfitriones
    const totalPorLiquidar = reservas
      .filter(r => r.estadoLiquidacion === "pendiente")
      .reduce((acc, r) => acc + r.netoParaAnfitrion, 0)
    // Reservas activas
    const totalReservasCount = reservas.length

    return {
      totalAlojamientos,
      nacionales,
      internacionales,
      comisionesGanadasSara,
      totalPorLiquidar,
      totalReservasCount
    }
  }, [alojamientos, reservas])

  // Filtrado de Alojamientos
  const alojamientosFiltrados = useMemo(() => {
    return alojamientos.filter(item => {
      const matchSearch =
        item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.anfitrion.nombre.toLowerCase().includes(searchTerm.toLowerCase())

      const matchAlcance = filtroAlcance === "todos" || item.alcance === filtroAlcance
      return matchSearch && matchAlcance
    })
  }, [alojamientos, searchTerm, filtroAlcance])

  // Filtrado de Reservas
  const reservasFiltradas = useMemo(() => {
    return reservas.filter(r => {
      const matchSearch =
        r.codigoReserva.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.huespedNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.alojamientoTitulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.anfitrionNombre.toLowerCase().includes(searchTerm.toLowerCase())

      const matchEstado = filtroLiquidacion === "todos" || r.estadoLiquidacion === filtroLiquidacion
      return matchSearch && matchEstado
    })
  }, [reservas, searchTerm, filtroLiquidacion])

  // Abrir Modal Nuevo Alojamiento
  const handleOpenNewAlojamiento = () => {
    const nextCode = `SARA-ALJ-0${alojamientos.length + 1}`
    setEditingAlojamiento(null)
    setModalTab("general")
    setFormAlojamiento({
      codigo: nextCode,
      titulo: "",
      tipo: "suite",
      alcance: "nacional",
      pais: "Ecuador",
      bandera: "🇪🇨",
      ciudad: "Cuenca",
      sector: "Av. Ordóñez Lasso",
      lat: -2.9001,
      lng: -79.0059,
      precioNoche: 55,
      tarifaLimpieza: 20,
      isSuperhost: true,
      maxHuespedes: 2,
      habitaciones: 1,
      banos: 1,
      camas: 1,
      imagenUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
      imagenes: [
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
      ],
      videoUrl: "",
      nuevaFotoUrl: "",
      amenidades: [
        "Vista al Río",
        "Internet/Wifi",
        "Smart Lock (Self Check-in)",
        "Smart TV",
        "Cafetera Nespresso",
        "Parqueadero Subterráneo",
        "Cocina Equipada",
        "Sala de Estar",
        "Comedor"
      ],
      nuevaAmenidad: "",
      descripcion: "Disfruta de una estadía inigualable en este exclusivo inmueble gestionado por SARA, diseñado con acabados de primera calidad, conectividad total y atención personalizada.",
      reglasTexto: "Check-in: 15:00 a 22:00\nCheck-out: 11:00\nNo se permiten fiestas\nNo fumar dentro de la propiedad",
      publicado: true,
      anfitrionNombre: "Javier Sarango",
      anfitrionTelefono: "+593 981804023",
      anfitrionEmail: "javier.sarango@gmail.com",
      anfitrionCedulaRuc: "0103492817",
      anfitrionBanco: "Banco Pichincha",
      anfitrionTipoCuenta: "Ahorros",
      anfitrionNumeroCuenta: "2201984532",
      anfitrionTitular: "Javier Sarango",
      anfitrionCuenta: "Banco Pichincha Ahorros 2201984532",
      modeloMonetizacion: "comision_reserva",
      porcentajeComision: 15,
      cuotaFijaMensual: 45
    })
    setIsAlojamientoModalOpen(true)
  }

  // Abrir Modal Edición Alojamiento
  const handleOpenEditAlojamiento = (alj: AirbnbAdminListing) => {
    setEditingAlojamiento(alj)
    setModalTab("general")
    setFormAlojamiento({
      codigo: alj.codigo,
      titulo: alj.titulo,
      tipo: alj.tipo,
      alcance: alj.alcance,
      pais: alj.pais,
      bandera: alj.bandera,
      ciudad: alj.ciudad,
      sector: alj.sector,
      lat: alj.lat || -2.9001,
      lng: alj.lng || -79.0059,
      precioNoche: alj.precioNoche,
      tarifaLimpieza: alj.tarifaLimpieza,
      isSuperhost: alj.isSuperhost,
      maxHuespedes: alj.maxHuespedes,
      habitaciones: alj.habitaciones || 1,
      banos: alj.banos || 1,
      camas: alj.camas || 1,
      imagenUrl: alj.imagenUrl,
      imagenes: alj.imagenes && alj.imagenes.length > 0 ? alj.imagenes : [alj.imagenUrl],
      videoUrl: alj.videoUrl || "",
      nuevaFotoUrl: "",
      amenidades: alj.amenidades && alj.amenidades.length > 0 ? alj.amenidades : [
        "Vista al Río",
        "Internet/Wifi",
        "Smart Lock (Self Check-in)",
        "Smart TV",
        "Cocina Equipada",
        "Sala de Estar",
        "Comedor"
      ],
      nuevaAmenidad: "",
      descripcion: alj.descripcion || "Disfruta de amaneceres únicos con excelente ubicación y confort.",
      reglasTexto: alj.reglas && alj.reglas.length > 0 ? alj.reglas.join("\n") : "Check-in: 15:00 a 22:00\nCheck-out: 11:00\nNo se permiten fiestas\nNo fumar",
      publicado: alj.publicado,
      anfitrionNombre: alj.anfitrion.nombre,
      anfitrionTelefono: alj.anfitrion.telefono,
      anfitrionEmail: alj.anfitrion.email,
      anfitrionCedulaRuc: alj.anfitrion.cedulaRuc || "0103492817",
      anfitrionBanco: alj.anfitrion.banco || "Banco Pichincha",
      anfitrionTipoCuenta: alj.anfitrion.tipoCuenta || "Ahorros",
      anfitrionNumeroCuenta: alj.anfitrion.numeroCuenta || "2201984532",
      anfitrionTitular: alj.anfitrion.titular || alj.anfitrion.nombre,
      anfitrionCuenta: alj.anfitrion.cuentaBancaria || `${alj.anfitrion.banco || "Banco Pichincha"} ${alj.anfitrion.tipoCuenta || "Ahorros"} ${alj.anfitrion.numeroCuenta || ""}`,
      modeloMonetizacion: alj.monetizacion.modelo,
      porcentajeComision: alj.monetizacion.porcentajeComision,
      cuotaFijaMensual: alj.monetizacion.cuotaFijaMensual || 45
    })
    setIsAlojamientoModalOpen(true)
  }

  // Guardar Alojamiento
  const handleSaveAlojamiento = (e: React.FormEvent) => {
    e.preventDefault()

    const formattedCuenta = `${formAlojamiento.anfitrionBanco} ${formAlojamiento.anfitrionTipoCuenta} ${formAlojamiento.anfitrionNumeroCuenta}`.trim()
    const reglasArray = formAlojamiento.reglasTexto.split("\n").map(r => r.trim()).filter(Boolean)
    const imagenesFinal = formAlojamiento.imagenes.length > 0 ? formAlojamiento.imagenes : [formAlojamiento.imagenUrl]

    if (editingAlojamiento) {
      setAlojamientos(prev => prev.map(item => {
        if (item.id === editingAlojamiento.id) {
          return {
            ...item,
            codigo: formAlojamiento.codigo,
            titulo: formAlojamiento.titulo,
            tipo: formAlojamiento.tipo,
            alcance: formAlojamiento.alcance,
            pais: formAlojamiento.pais,
            bandera: formAlojamiento.bandera,
            ciudad: formAlojamiento.ciudad,
            sector: formAlojamiento.sector,
            lat: formAlojamiento.lat,
            lng: formAlojamiento.lng,
            precioNoche: formAlojamiento.precioNoche,
            tarifaLimpieza: formAlojamiento.tarifaLimpieza,
            isSuperhost: formAlojamiento.isSuperhost,
            maxHuespedes: formAlojamiento.maxHuespedes,
            habitaciones: formAlojamiento.habitaciones,
            banos: formAlojamiento.banos,
            camas: formAlojamiento.camas,
            imagenUrl: formAlojamiento.imagenUrl,
            imagenes: imagenesFinal,
            videoUrl: formAlojamiento.videoUrl,
            amenidades: formAlojamiento.amenidades,
            descripcion: formAlojamiento.descripcion,
            reglas: reglasArray,
            publicado: formAlojamiento.publicado,
            anfitrion: {
              nombre: formAlojamiento.anfitrionNombre,
              telefono: formAlojamiento.anfitrionTelefono,
              email: formAlojamiento.anfitrionEmail,
              cedulaRuc: formAlojamiento.anfitrionCedulaRuc,
              banco: formAlojamiento.anfitrionBanco,
              tipoCuenta: formAlojamiento.anfitrionTipoCuenta,
              numeroCuenta: formAlojamiento.anfitrionNumeroCuenta,
              titular: formAlojamiento.anfitrionTitular,
              cuentaBancaria: formattedCuenta
            },
            monetizacion: {
              ...item.monetizacion,
              modelo: formAlojamiento.modeloMonetizacion,
              porcentajeComision: formAlojamiento.porcentajeComision,
              cuotaFijaMensual: formAlojamiento.cuotaFijaMensual
            }
          }
        }
        return item
      }))
    } else {
      const nuevo: AirbnbAdminListing = {
        id: `ab-${Date.now()}`,
        codigo: formAlojamiento.codigo,
        titulo: formAlojamiento.titulo,
        tipo: formAlojamiento.tipo,
        alcance: formAlojamiento.alcance,
        pais: formAlojamiento.pais,
        bandera: formAlojamiento.bandera,
        ciudad: formAlojamiento.ciudad,
        sector: formAlojamiento.sector,
        lat: formAlojamiento.lat,
        lng: formAlojamiento.lng,
        precioNoche: formAlojamiento.precioNoche,
        tarifaLimpieza: formAlojamiento.tarifaLimpieza,
        rating: 5.0,
        isSuperhost: formAlojamiento.isSuperhost,
        maxHuespedes: formAlojamiento.maxHuespedes,
        habitaciones: formAlojamiento.habitaciones,
        banos: formAlojamiento.banos,
        camas: formAlojamiento.camas,
        imagenUrl: formAlojamiento.imagenUrl,
        imagenes: imagenesFinal,
        videoUrl: formAlojamiento.videoUrl,
        amenidades: formAlojamiento.amenidades,
        descripcion: formAlojamiento.descripcion,
        reglas: reglasArray,
        publicado: formAlojamiento.publicado,
        anfitrion: {
          nombre: formAlojamiento.anfitrionNombre,
          telefono: formAlojamiento.anfitrionTelefono,
          email: formAlojamiento.anfitrionEmail,
          cedulaRuc: formAlojamiento.anfitrionCedulaRuc,
          banco: formAlojamiento.anfitrionBanco,
          tipoCuenta: formAlojamiento.anfitrionTipoCuenta,
          numeroCuenta: formAlojamiento.anfitrionNumeroCuenta,
          titular: formAlojamiento.anfitrionTitular,
          cuentaBancaria: formattedCuenta
        },
        monetizacion: {
          modelo: formAlojamiento.modeloMonetizacion,
          porcentajeComision: formAlojamiento.porcentajeComision,
          cuotaFijaMensual: formAlojamiento.cuotaFijaMensual,
          totalComisionesGeneradas: 0
        }
      }
      setAlojamientos(prev => [nuevo, ...prev])
    }

    // Sincronizar de inmediato con la base de datos de Supabase
    const payloadBD = editingAlojamiento ? {
      ...editingAlojamiento,
      codigo: formAlojamiento.codigo,
      titulo: formAlojamiento.titulo,
      tipo: formAlojamiento.tipo,
      alcance: formAlojamiento.alcance,
      pais: formAlojamiento.pais,
      bandera: formAlojamiento.bandera,
      ciudad: formAlojamiento.ciudad,
      sector: formAlojamiento.sector,
      lat: formAlojamiento.lat,
      lng: formAlojamiento.lng,
      precioNoche: formAlojamiento.precioNoche,
      tarifaLimpieza: formAlojamiento.tarifaLimpieza,
      isSuperhost: formAlojamiento.isSuperhost,
      maxHuespedes: formAlojamiento.maxHuespedes,
      habitaciones: formAlojamiento.habitaciones,
      banos: formAlojamiento.banos,
      camas: formAlojamiento.camas,
      imagenUrl: formAlojamiento.imagenUrl,
      imagenes: imagenesFinal,
      videoUrl: formAlojamiento.videoUrl,
      amenidades: formAlojamiento.amenidades,
      descripcion: formAlojamiento.descripcion,
      reglas: reglasArray,
      publicado: formAlojamiento.publicado,
      anfitrion: {
        nombre: formAlojamiento.anfitrionNombre,
        telefono: formAlojamiento.anfitrionTelefono,
        email: formAlojamiento.anfitrionEmail,
        cedulaRuc: formAlojamiento.anfitrionCedulaRuc,
        banco: formAlojamiento.anfitrionBanco,
        tipoCuenta: formAlojamiento.anfitrionTipoCuenta,
        numeroCuenta: formAlojamiento.anfitrionNumeroCuenta,
        titular: formAlojamiento.anfitrionTitular,
        cuentaBancaria: formattedCuenta
      },
      monetizacion: {
        ...editingAlojamiento.monetizacion,
        modelo: formAlojamiento.modeloMonetizacion,
        porcentajeComision: formAlojamiento.porcentajeComision,
        cuotaFijaMensual: formAlojamiento.cuotaFijaMensual
      }
    } : {
      codigo: formAlojamiento.codigo,
      titulo: formAlojamiento.titulo,
      tipo: formAlojamiento.tipo,
      alcance: formAlojamiento.alcance,
      pais: formAlojamiento.pais,
      bandera: formAlojamiento.bandera,
      ciudad: formAlojamiento.ciudad,
      sector: formAlojamiento.sector,
      lat: formAlojamiento.lat,
      lng: formAlojamiento.lng,
      precioNoche: formAlojamiento.precioNoche,
      tarifaLimpieza: formAlojamiento.tarifaLimpieza,
      isSuperhost: formAlojamiento.isSuperhost,
      maxHuespedes: formAlojamiento.maxHuespedes,
      habitaciones: formAlojamiento.habitaciones,
      banos: formAlojamiento.banos,
      camas: formAlojamiento.camas,
      imagenUrl: formAlojamiento.imagenUrl,
      imagenes: imagenesFinal,
      videoUrl: formAlojamiento.videoUrl,
      amenidades: formAlojamiento.amenidades,
      descripcion: formAlojamiento.descripcion,
      reglas: reglasArray,
      publicado: formAlojamiento.publicado,
      anfitrion: {
        nombre: formAlojamiento.anfitrionNombre,
        telefono: formAlojamiento.anfitrionTelefono,
        email: formAlojamiento.anfitrionEmail,
        cedulaRuc: formAlojamiento.anfitrionCedulaRuc,
        banco: formAlojamiento.anfitrionBanco,
        tipoCuenta: formAlojamiento.anfitrionTipoCuenta,
        numeroCuenta: formAlojamiento.anfitrionNumeroCuenta,
        titular: formAlojamiento.anfitrionTitular,
        cuentaBancaria: formattedCuenta
      },
      monetizacion: {
        modelo: formAlojamiento.modeloMonetizacion,
        porcentajeComision: formAlojamiento.porcentajeComision,
        cuotaFijaMensual: formAlojamiento.cuotaFijaMensual,
        totalComisionesGeneradas: 0
      }
    }

    fetch("/api/airbnb/alojamientos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadBD)
    }).catch(err => console.warn("Error guardando alojamiento en Supabase:", err))

    setIsAlojamientoModalOpen(false)
  }

  // Abrir Modal de Nueva Reserva
  const handleOpenNewReserva = () => {
    const primerAlojamiento = alojamientos[0]
    const hoy = new Date()
    const dentroDeTresDias = new Date(hoy)
    dentroDeTresDias.setDate(dentroDeTresDias.getDate() + 3)

    setFormReserva({
      alojamientoId: primerAlojamiento?.id || "",
      huespedNombre: "",
      huespedTelefono: "+593 9",
      huespedPais: "Ecuador 🇪🇨",
      fechaCheckIn: hoy.toISOString().split("T")[0],
      fechaCheckOut: dentroDeTresDias.toISOString().split("T")[0],
      noches: 3,
      tarifaNoche: primerAlojamiento?.precioNoche || 50,
      tarifaLimpieza: primerAlojamiento?.tarifaLimpieza || 15,
      porcentajeComisionSara: primerAlojamiento?.monetizacion.porcentajeComision || 15
    })
    setIsReservaModalOpen(true)
  }

  // Guardar Nueva Reserva con Cálculo Automático de Comisión y Saldo de Anfitrión
  const handleSaveReserva = (e: React.FormEvent) => {
    e.preventDefault()

    const alj = alojamientos.find(a => a.id === formReserva.alojamientoId)
    if (!alj) return

    const subtotalNoches = formReserva.noches * formReserva.tarifaNoche
    const totalHuesped = subtotalNoches + formReserva.tarifaLimpieza
    const baseSinIva = totalHuesped / (1 + (politicasStays.ivaPorcentaje / 100))
    const comisionSara = (baseSinIva * formReserva.porcentajeComisionSara) / 100
    const gastosAdmIva = totalHuesped - baseSinIva
    const netoAnfitrion = totalHuesped - comisionSara - gastosAdmIva

    const nuevaReserva: ReservaAdmin = {
      id: `res-${Date.now()}`,
      codigoReserva: `RSV-2026-0${reservas.length + 10}`,
      alojamientoId: alj.id,
      alojamientoTitulo: alj.titulo,
      alojamientoCodigo: alj.codigo,
      anfitrionNombre: alj.anfitrion.nombre,
      anfitrionTelefono: alj.anfitrion.telefono,
      huespedNombre: formReserva.huespedNombre,
      huespedTelefono: formReserva.huespedTelefono,
      huespedPais: formReserva.huespedPais,
      fechaCheckIn: formReserva.fechaCheckIn,
      fechaCheckOut: formReserva.fechaCheckOut,
      noches: formReserva.noches,
      tarifaNoche: formReserva.tarifaNoche,
      subtotalNoches: subtotalNoches,
      tarifaLimpieza: formReserva.tarifaLimpieza,
      totalHuesped: totalHuesped,
      porcentajeComisionSara: formReserva.porcentajeComisionSara,
      comisionGanadaSara: Number(comisionSara.toFixed(2)),
      netoParaAnfitrion: Number(netoAnfitrion.toFixed(2)),
      estadoLiquidacion: "pendiente"
    }

    setReservas(prev => [nuevaReserva, ...prev])
    setIsReservaModalOpen(false)
  }

  // Marcar como Liquidado al Anfitrión
  const handleMarcarLiquidado = (reservaId: string) => {
    const hoyStr = new Date().toISOString().split("T")[0]
    setReservas(prev => prev.map(r => {
      if (r.id === reservaId) {
        return {
          ...r,
          estadoLiquidacion: "liquidado",
          fechaLiquidacion: hoyStr,
          metodoLiquidacion: "Transferencia Bancaria Directa"
        }
      }
      return r
    }))
  }

  // Generar Mensaje de Liquidación / Recibo de Pago por WhatsApp al Anfitrión
  const getWhatsAppLiquidacionLink = (r: ReservaAdmin) => {
    const rawPhone = r.anfitrionTelefono.replace(/[^0-9]/g, "")
    const phoneWithCode = rawPhone.startsWith("593") ? rawPhone : `593${rawPhone.replace(/^0/, "")}`

    // Cálculo con retención de IVA / Gastos Administrativos
    const baseSinIva = Number((r.totalHuesped / (1 + (politicasStays.ivaPorcentaje / 100))).toFixed(2))
    const gastosAdmIva = Number((r.totalHuesped - baseSinIva).toFixed(2))
    const comisionSara = Number(((baseSinIva * r.porcentajeComisionSara) / 100).toFixed(2))
    const totalRetencionSara = Number((comisionSara + gastosAdmIva).toFixed(2))
    const netoConIva = Number((r.totalHuesped - totalRetencionSara).toFixed(2))

    const msg = `Estimado(a) ${r.anfitrionNombre}, le enviamos la liquidación de su alojamiento *${r.alojamientoTitulo}* (Reserva ${r.codigoReserva}):
    
🗓 Fechas: ${r.fechaCheckIn} al ${r.fechaCheckOut} (${r.noches} noches)
👤 Huésped: ${r.huespedNombre} (${r.huespedPais})
💵 Subtotal Estancia: $${r.subtotalNoches}
🧹 Tarifa Limpieza: $${r.tarifaLimpieza}
📊 Total Recaudado en Cuenta SARA: $${r.totalHuesped} (100% cobrado con IVA)
🏷️ Base Imponible Neta: $${baseSinIva.toFixed(2)}

🏢 Retención Comisión SARA (${r.porcentajeComisionSara}% s/base neta): -$${comisionSara.toFixed(2)}
🏛️ Retención IVA / Factura SRI (${politicasStays.ivaPorcentaje}% extraído): -$${gastosAdmIva.toFixed(2)}
📦 Total Retenido por SARA: -$${totalRetencionSara.toFixed(2)}

✅ NETO A TRANSFERIR A SU CUENTA TRAS CHECK-IN: $${netoConIva.toFixed(2)}
(Total Reserva Bruta - Comisión SARA - Gastos Administrativos)

${r.estadoLiquidacion === "liquidado" ? "💰 *ESTADO: TRANSFERIDO Y LIQUIDADO CON ÉXITO TRAS CHECK-IN.*" : "⏳ *ESTADO: EN PROCESO DE TRANSFERENCIA TRAS CHECK-IN EFECTIVO DEL HUÉSPED.*"}
¡Gracias por confiar la administración y promoción de su alojamiento en SARA STAYS!`

    return `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(msg)}`
  }

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-brand-sage/10 text-brand-sage rounded-lg">
              <Sparkles size={24} />
            </span>
            <h2 className="text-2xl font-bold text-gray-800">Gestión Stays (Alojamientos) & Liquidación de Comisiones</h2>
          </div>
          <p className="text-gray-500 text-sm mt-1 max-w-3xl">
            Control de alojamientos turísticos nacionales e internacionales, políticas de reserva con anticipo del {politicasStays.porcentajeAnticipo}%, comisiones y liquidación a anfitriones.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            href="/stays"
            target="_blank"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all shadow-sm"
          >
            <ExternalLink size={16} />
            <span>Ver Portal Stays Público</span>
          </Link>

          <button
            onClick={activeTab === "alojamientos" ? handleOpenNewAlojamiento : handleOpenNewReserva}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-sage hover:bg-brand-sage/90 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg"
          >
            <Plus size={18} />
            <span>{activeTab === "alojamientos" ? "Registrar Alojamiento" : "Nueva Reserva / Liquidación"}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Ganancias de SARA y Liquidaciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Comisión SARA */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Comisiones SARA Ganadas</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">${stats.comisionesGanadasSara.toFixed(2)}</h3>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp size={14} /> 15% - 20% retenido por reservas
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Liquidaciones Pendientes a Anfitriones */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-amber-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Saldo Pendiente a Transferir</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">${stats.totalPorLiquidar.toFixed(2)}</h3>
            <p className="text-xs text-gray-500 font-semibold mt-1">
              Neto por transferir a dueños
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={24} />
          </div>
        </div>

        {/* Alojamientos Activos */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-brand-sage flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Alojamientos Registrados</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.totalAlojamientos}</h3>
            <p className="text-xs text-brand-sage font-semibold mt-1">
              {stats.nacionales} Ecuador • {stats.internacionales} Internacional
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-sage/10 text-brand-sage flex items-center justify-center">
            <Building size={24} />
          </div>
        </div>

        {/* Reservas Totales */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-blue-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Reservas Gestionadas</p>
            <h3 className="text-2xl font-black text-blue-900 mt-1">{stats.totalReservasCount}</h3>
            <p className="text-xs text-blue-600 font-semibold mt-1">
              Cuenca, Yunguilla, Miami, Madrid
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileCheck2 size={24} />
          </div>
        </div>
      </div>

      {/* Banner Informativo de Tarifas y Comisión SARA para Airbnb */}
      <div className="bg-gradient-to-r from-brand-dark to-slate-800 text-white rounded-xl p-5 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="text-yellow-400" size={20} />
            <h4 className="font-bold text-base text-yellow-300">Monetización y Cobro SARA en Servicio Airbnb</h4>
          </div>
          <p className="text-xs text-gray-300 max-w-3xl">
            SARA monetiza aplicando una comisión automática por cada reserva concretada a través del portal y mapa de precios, reteniendo el porcentaje y emitiendo la liquidación neta al anfitrión:
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 w-full lg:w-auto shrink-0 text-center">
          <div className="bg-white/10 px-3 py-2 rounded-lg border border-white/10">
            <p className="text-[10px] text-gray-300 uppercase font-semibold">Comisión Reserva</p>
            <p className="text-base font-extrabold text-white">15%</p>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded-lg border border-white/10">
            <p className="text-[10px] text-yellow-300 uppercase font-semibold">Gestión Completa</p>
            <p className="text-base font-extrabold text-white">20%</p>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded-lg border border-white/10">
            <p className="text-[10px] text-emerald-300 uppercase font-semibold">Membresía Mensual</p>
            <p className="text-base font-extrabold text-white">$45 <span className="text-[10px] font-normal text-gray-300">/mes</span></p>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas: Alojamientos vs Reservas vs Usuarios vs Políticas */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("alojamientos")}
          className={`px-5 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === "alojamientos"
              ? "border-brand-sage text-brand-dark"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Building size={16} />
          <span>Alojamientos & Anfitriones ({alojamientos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("reservas")}
          className={`px-5 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === "reservas"
              ? "border-brand-sage text-brand-dark"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Receipt size={16} />
          <span>Reservas & Liquidaciones ({reservas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("usuarios")}
          className={`px-5 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === "usuarios"
              ? "border-brand-sage text-brand-dark"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Users size={16} />
          <span>Huéspedes & Usuarios ({usuarios.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("politicas")}
          className={`px-5 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === "politicas"
              ? "border-amber-500 text-amber-800 bg-amber-50/60"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <ShieldCheck size={16} className={activeTab === "politicas" ? "text-amber-600" : ""} />
          <span>Políticas & Penalizaciones</span>
        </button>
      </div>

      {/* Filtros y Buscador (Oculto en Pestaña Políticas) */}
      {activeTab !== "politicas" && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={
                activeTab === "alojamientos"
                  ? "Buscar por código, título, ciudad, anfitrión..."
                  : activeTab === "reservas"
                  ? "Buscar por código de reserva, huésped, anfitrión..."
                  : "Buscar por nombre, apellido, cédula, email, teléfono..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {activeTab === "alojamientos" ? (
              <select
                value={filtroAlcance}
                onChange={(e) => setFiltroAlcance(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-sage"
              >
                <option value="todos">Todos los Destinos (Nacional y Mundial)</option>
                <option value="nacional">🇪🇨 Solo Nacional (Ecuador)</option>
                <option value="internacional">🌎 Solo Internacional (Miami, Madrid, etc.)</option>
              </select>
            ) : activeTab === "reservas" ? (
              <select
                value={filtroLiquidacion}
                onChange={(e) => setFiltroLiquidacion(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-sage"
              >
                <option value="todos">Todos los Estados de Liquidación</option>
                <option value="pendiente">⏳ Pendiente de Transferencia</option>
                <option value="liquidado">✅ Liquidado al Anfitrión</option>
              </select>
            ) : (
              <select
                value={filtroEstadoUsuario}
                onChange={(e) => setFiltroEstadoUsuario(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-sage"
              >
                <option value="todos">Todos los Estados (Activos y Bloqueados)</option>
                <option value="activo">✅ Solo Cuentas Activas</option>
                <option value="bloqueado">🔒 Solo Cuentas Bloqueadas</option>
              </select>
            )}

            {/* Botones Descargar Excel y PDF */}
            <button
              onClick={
                activeTab === "alojamientos"
                  ? handleExportarAlojamientosExcel
                  : activeTab === "reservas"
                  ? handleExportarReservasExcel
                  : handleExportarUsuariosExcel
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Descargar datos en Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet size={15} className="text-emerald-600" />
              <span>Descargar Excel</span>
            </button>

            <button
              onClick={
                activeTab === "alojamientos"
                  ? handleExportarAlojamientosPDF
                  : activeTab === "reservas"
                  ? handleExportarReservasPDF
                  : handleExportarUsuariosPDF
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Descargar reporte en formato PDF (.pdf)"
            >
              <FileText size={15} className="text-rose-600" />
              <span>Descargar PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* CONTENIDO PESTAÑA 1: ALOJAMIENTOS & ANFITRIONES */}
      {activeTab === "alojamientos" && (
        <div className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-base">
              Catálogo de Alojamientos ({alojamientosFiltrados.length})
            </h3>
            <span className="text-xs text-gray-500 font-medium">
              Configuración de comisión y datos bancarios de anfitriones
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 divide-y divide-gray-200">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Alojamiento / Ubicación</th>
                  <th className="px-5 py-3.5">Tarifas ($ USD)</th>
                  <th className="px-5 py-3.5">Anfitrión / Contacto</th>
                  <th className="px-5 py-3.5">Modelo Comisión SARA</th>
                  <th className="px-5 py-3.5 text-center">Estado Publicación</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {alojamientosFiltrados.map((alj) => (
                  <tr key={alj.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Thumbnail + Título + Destino */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={alj.imagenUrl}
                          alt={alj.titulo}
                          className="w-14 h-14 rounded-lg object-cover border border-gray-200 shadow-sm shrink-0"
                        />
                        <div className="max-w-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono font-bold text-brand-dark bg-gray-100 px-1.5 py-0.5 rounded">
                              {alj.codigo}
                            </span>
                            <span className="text-xs font-bold text-gray-700">
                              {alj.bandera} {alj.ciudad}
                            </span>
                            {alj.isSuperhost && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 flex items-center gap-0.5">
                                <Star size={10} className="fill-yellow-600 text-yellow-600" /> Superhost
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-gray-900 text-sm truncate mt-1" title={alj.titulo}>
                            {alj.titulo}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {alj.sector} • Capacidad: {alj.maxHuespedes} huéspedes
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Tarifas */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-extrabold text-gray-900">
                        ${alj.precioNoche} <span className="text-xs font-normal text-gray-500">/ noche</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Limpieza: ${alj.tarifaLimpieza}
                      </p>
                    </td>

                    {/* Anfitrión & Cuenta Bancaria */}
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900 text-sm">{alj.anfitrion.nombre}</p>
                      <p className="text-xs text-gray-600 font-medium">{alj.anfitrion.telefono}</p>
                      {alj.anfitrion.cedulaRuc && (
                        <p className="text-[11px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded w-fit mt-0.5 border border-blue-200/60">
                          CI/RUC: {alj.anfitrion.cedulaRuc}
                        </p>
                      )}
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5 truncate max-w-xs" title={alj.anfitrion.cuentaBancaria}>
                        {alj.anfitrion.cuentaBancaria}
                      </p>
                    </td>

                    {/* Modelo Comisión SARA */}
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                          alj.monetizacion.modelo === "gestion_completa"
                            ? "bg-purple-100 text-purple-800 border border-purple-200"
                            : alj.monetizacion.modelo === "membresia_fija"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}>
                          <Tag size={12} />
                          {alj.monetizacion.modelo === "gestion_completa" && "Gestión 20%"}
                          {alj.monetizacion.modelo === "comision_reserva" && "Comisión 15%"}
                          {alj.monetizacion.modelo === "membresia_fija" && "Membresía $45/mes"}
                        </span>
                        <p className="text-xs text-gray-600 font-semibold">
                          Generado: <strong className="text-emerald-700">${alj.monetizacion.totalComisionesGeneradas}</strong>
                        </p>
                      </div>
                    </td>

                    {/* Publicado Toggle */}
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => {
                          setAlojamientos(prev => prev.map(a => a.id === alj.id ? { ...a, publicado: !a.publicado } : a))
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                          alj.publicado 
                            ? "bg-green-100 text-green-800 border border-green-200" 
                            : "bg-gray-200 text-gray-600 border border-gray-300"
                        }`}
                      >
                        {alj.publicado ? <Eye size={13} /> : <EyeOff size={13} />}
                        <span>{alj.publicado ? "Visible en Mapa" : "Oculto"}</span>
                      </button>
                    </td>

                    {/* Acciones */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditAlojamiento(alj)}
                          className="p-1.5 text-gray-500 hover:text-brand-dark hover:bg-gray-100 rounded-lg transition-colors"
                          title="Editar alojamiento"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("¿Estás seguro de eliminar este alojamiento?")) {
                              setAlojamientos(prev => prev.filter(a => a.id !== alj.id))
                            }
                          }}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar alojamiento"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENIDO PESTAÑA 2: RESERVAS & LIQUIDACIONES DE COMISIÓN */}
      {activeTab === "reservas" && (
        <div className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-base">
              Registro de Reservas y Liquidación de Ganancias ({reservasFiltradas.length})
            </h3>
            <span className="text-xs text-gray-500 font-medium">
              Flujo oficial: Pago 100% en cuenta SARA ➔ Retención Comisión e IVA ({politicasStays.ivaPorcentaje}%) ➔ Transferencia a Anfitrión post Check-in
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 divide-y divide-gray-200">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Código / Huésped</th>
                  <th className="px-5 py-3.5">Alojamiento</th>
                  <th className="px-5 py-3.5">Estancia</th>
                  <th className="px-5 py-3.5">Cobro en SARA</th>
                  <th className="px-5 py-3.5">Retención SARA (Com. + IVA {politicasStays.ivaPorcentaje}%)</th>
                  <th className="px-5 py-3.5">Neto Anfitrión (Post Check-in)</th>
                  <th className="px-5 py-3.5 text-center">Estado Liquidación</th>
                  <th className="px-5 py-3.5 text-right">Comprobante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservasFiltradas.map((r) => {
                  const whatsappLink = getWhatsAppLiquidacionLink(r)
                  const baseSinIva = Number((r.totalHuesped / (1 + (politicasStays.ivaPorcentaje / 100))).toFixed(2))
                  const gastosAdmIva = Number((r.totalHuesped - baseSinIva).toFixed(2))
                  const totalRetencion = Number((r.comisionGanadaSara + gastosAdmIva).toFixed(2))
                  const netoPostCheckIn = Number((r.totalHuesped - totalRetencion).toFixed(2))

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Código + Huésped */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-mono font-bold text-brand-dark bg-gray-100 px-1.5 py-0.5 rounded">
                            {r.codigoReserva}
                          </span>
                          {r.origen === "web" && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Reserva Web
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm mt-1">{r.huespedNombre}</h4>
                        <p className="text-xs text-gray-600 font-medium">{r.huespedTelefono}</p>
                        {r.identificacionHuesped && (
                          <p className="text-[11px] text-gray-400">CI/RUC: {r.identificacionHuesped}</p>
                        )}
                        {r.emailHuesped && (
                          <p className="text-[11px] text-gray-400 truncate max-w-[200px]" title={r.emailHuesped}>{r.emailHuesped}</p>
                        )}
                        {r.peticionesEspeciales && (
                          <p className="text-[11px] text-amber-800 bg-amber-50 rounded p-1 mt-1 border border-amber-200/60">
                            📝 Petición: <em>{r.peticionesEspeciales}</em>
                          </p>
                        )}
                      </td>

                      {/* Alojamiento */}
                      <td className="px-5 py-4">
                        <p className="text-xs font-mono text-gray-500">{r.alojamientoCodigo}</p>
                        <h4 className="font-bold text-gray-900 text-sm truncate max-w-xs" title={r.alojamientoTitulo}>
                          {r.alojamientoTitulo}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Dueño: {r.anfitrionNombre}
                        </p>
                      </td>

                      {/* Estancia */}
                      <td className="px-5 py-4 text-xs">
                        <p className="font-bold text-gray-800">
                          {r.noches} noches (${r.tarifaNoche}/noche)
                        </p>
                        <p className="text-gray-500 mt-0.5">
                          {r.fechaCheckIn} ➜ {r.fechaCheckOut}
                        </p>
                      </td>

                      {/* Cobro en SARA */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-black text-gray-900">${r.totalHuesped}</p>
                        <p className="text-[10px] text-brand-dark/70 font-medium">
                          100% en cuenta SARA
                        </p>
                        <p className="text-[10px] text-gray-400">
                          (${r.subtotalNoches} + ${r.tarifaLimpieza} limp.)
                        </p>
                      </td>

                      {/* Retención SARA (Comisión + IVA) */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-extrabold rounded">
                          -${totalRetencion.toFixed(2)}
                        </span>
                        <div className="text-[10px] text-gray-500 mt-1 space-y-0.5">
                          <p>• Com. SARA ({r.porcentajeComisionSara}% s/base): ${r.comisionGanadaSara.toFixed(2)}</p>
                          <p>• Gastos/IVA ({politicasStays.ivaPorcentaje}%): ${gastosAdmIva.toFixed(2)}</p>
                        </div>
                      </td>

                      {/* Saldo Neto para Anfitrión */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-black text-emerald-950">${netoPostCheckIn.toFixed(2)}</p>
                        <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-0.5">
                          Post Check-in
                        </span>
                      </td>

                      {/* Estado Liquidación */}
                      <td className="px-5 py-4 text-center">
                        {r.estadoLiquidacion === "liquidado" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                            <CheckCircle2 size={13} className="text-green-600" />
                            Liquidado
                          </span>
                        ) : (
                          <button
                            onClick={() => handleMarcarLiquidado(r.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 transition-colors"
                            title="Click para marcar como transferido al anfitrión"
                          >
                            <Clock size={13} className="text-amber-600" />
                            Pendiente (Transferir)
                          </button>
                        )}
                      </td>

                      {/* Comprobante WhatsApp */}
                      <td className="px-5 py-4 text-right">
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 transition-colors"
                          title="Enviar liquidación detallada por WhatsApp al dueño"
                        >
                          <MessageCircle size={14} className="text-emerald-600" />
                          <span>Enviar Recibo</span>
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CONTENIDO PESTAÑA 3: HUÉSPEDES & USUARIOS REGISTRADOS    */}
      {/* ========================================================= */}
      {activeTab === "usuarios" && (
        <div className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage overflow-hidden animate-fadeIn">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                <Users size={18} className="text-brand-sage" />
                <span>Gestión de Huéspedes & Usuarios Registrados ({usuariosFiltrados.length})</span>
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Control de cuentas, consulta de credenciales, bloqueo/activación y generación de nuevas contraseñas
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadUsuarios}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200 transition-colors cursor-pointer"
                title="Actualizar listado de usuarios"
              >
                <RefreshCw size={13} className={isLoadingUsuarios ? "animate-spin text-brand-sage" : "text-gray-500"} />
                <span>Actualizar</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-gray-600 uppercase font-black tracking-wider text-[11px]">
                  <th className="px-4 py-3.5">Fecha y Hora</th>
                  <th className="px-4 py-3.5">Huésped / Usuario</th>
                  <th className="px-4 py-3.5">Cédula / Pasaporte</th>
                  <th className="px-4 py-3.5">Teléfono / WhatsApp</th>
                  <th className="px-4 py-3.5">Correo Electrónico</th>
                  <th className="px-4 py-3.5">Clave de Acceso</th>
                  <th className="px-4 py-3.5 text-center">Estado</th>
                  <th className="px-4 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-gray-400">
                      <Users size={36} className="mx-auto mb-2 text-gray-300" />
                      <p className="font-semibold text-sm">No se encontraron usuarios registrados</p>
                      <p className="text-xs text-gray-400 mt-1">Los nuevos huéspedes que se registren en el portal aparecerán aquí automáticamente.</p>
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((u) => {
                    const isPasswordVisible = Boolean(visiblePasswords[u.id])
                    const fechaObj = new Date(u.created_at)
                    const fechaFormateada = isNaN(fechaObj.getTime())
                      ? "25/09/2026, 21:45:10"
                      : fechaObj.toLocaleString("es-EC", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit"
                        })

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Fecha y Hora de Creación */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-700 font-semibold">
                            <Clock size={13} className="text-gray-400 shrink-0" />
                            <span>{fechaFormateada}</span>
                          </div>
                        </td>

                        {/* Nombre y Apellido */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-brand-sage/20 text-brand-sage font-black flex items-center justify-center text-xs shrink-0">
                              {u.nombre.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-xs">{u.nombre} {u.apellido}</p>
                              {u.ciudadPais && (
                                <p className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                  <MapPin size={10} /> {u.ciudadPais}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Cédula / Pasaporte */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-[11px] border border-gray-200">
                            {u.cedula || "N/A"}
                          </span>
                        </td>

                        {/* Teléfono / WhatsApp */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <a
                            href={`https://wa.me/${u.telefono.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-emerald-700 hover:text-emerald-900 font-semibold hover:underline"
                            title="Conversar por WhatsApp con el huésped"
                          >
                            <Phone size={12} className="text-emerald-600" />
                            <span>{u.telefono}</span>
                          </a>
                        </td>

                        {/* Correo Electrónico */}
                        <td className="px-4 py-3.5">
                          <span className="font-medium text-gray-700 text-xs font-mono">
                            {u.email}
                          </span>
                        </td>

                        {/* Clave / Contraseña con Botón Ver/Ocultar y Copiar */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 bg-gray-100/90 px-2 py-1 rounded-lg border border-gray-200">
                            <Key size={12} className="text-amber-600" />
                            <span className="font-mono text-xs font-bold text-gray-800 select-all">
                              {isPasswordVisible ? u.clave : "••••••••"}
                            </span>
                            <button
                              type="button"
                              onClick={() => setVisiblePasswords(prev => ({ ...prev, [u.id]: !isPasswordVisible }))}
                              className="text-gray-400 hover:text-gray-700 ml-1 p-0.5 cursor-pointer"
                              title={isPasswordVisible ? "Ocultar clave" : "Ver clave"}
                            >
                              {isPasswordVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                            {isPasswordVisible && (
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(u.clave)
                                  setCopiedUsuarioField(u.id)
                                  setTimeout(() => setCopiedUsuarioField(null), 2000)
                                }}
                                className="text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer"
                                title="Copiar clave"
                              >
                                {copiedUsuarioField === u.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              u.estado === "activo"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {u.estado === "activo" ? (
                              <>
                                <CheckCircle2 size={11} className="text-emerald-600" />
                                <span>Activo</span>
                              </>
                            ) : (
                              <>
                                <Lock size={11} className="text-rose-600" />
                                <span>Bloqueado</span>
                              </>
                            )}
                          </span>
                        </td>

                        {/* Botones de Acción: Bloquear/Activar, Generar Nueva Clave, Eliminar */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Bloquear / Activar */}
                            <button
                              type="button"
                              onClick={() => handleToggleEstadoUsuario(u)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                u.estado === "activo"
                                  ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                              }`}
                              title={u.estado === "activo" ? "Bloquear acceso a este huésped" : "Activar acceso a este huésped"}
                            >
                              {u.estado === "activo" ? <Lock size={14} /> : <Unlock size={14} />}
                            </button>

                            {/* Generar Nueva Clave */}
                            <button
                              type="button"
                              onClick={() => handleGenerarNuevaClave(u)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              title="Generar nueva clave de acceso y compartir"
                            >
                              <Key size={13} className="text-blue-600" />
                              <span className="hidden sm:inline">Nueva Clave</span>
                            </button>

                            {/* Eliminar */}
                            <button
                              type="button"
                              onClick={() => handleEliminarUsuario(u)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                              title="Eliminar usuario"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENIDO PESTAÑA 4: POLÍTICAS & PENALIZACIONES DE RESERVA */}
      {activeTab === "politicas" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Cabecera de la sección */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-amber-500 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200 shrink-0">
                <ShieldCheck size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    Políticas de Anticipo, Cancelación & Penalizaciones
                  </h3>
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    SARA Stays
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
                  Configura el porcentaje obligatorio de anticipo para bloquear fechas en el calendario y la escala progresiva de penalizaciones y devoluciones según los días de anticipación con los que cancele el cliente.
                </p>
              </div>
            </div>

            {politicasStays.actualizadoEn && (
              <div className="text-left md:text-right shrink-0">
                <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">Última Actualización</span>
                <span className="text-xs font-semibold text-gray-700">
                  {new Date(politicasStays.actualizadoEn).toLocaleDateString("es-EC", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            )}
          </div>

          {/* Mensaje de confirmación al guardar */}
          {politicasSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-3 animate-fadeIn">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{politicasSuccessMsg}</span>
            </div>
          )}

          {/* Cuadrícula Principal: Formulario de Configuración + Simulador Interactivo */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Columna Izquierda (7 Cols): Formulario de Configuración de Porcentajes */}
            <form onSubmit={handleSavePoliticas} className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
              
              {/* Sección 1: Anticipo Obligatorio */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">1</span>
                  <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                    Anticipo Requerido para Bloquear la Reserva
                  </h4>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-gray-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-800 block">
                        Porcentaje de Anticipo Inicial (%)
                      </label>
                      <p className="text-[11px] text-gray-500 max-w-sm mt-0.5">
                        Monto liquidado hoy para confirmar las fechas en el calendario. El saldo ({100 - (politicasStays.porcentajeAnticipo || 30)}%) se liquida al Check-in.
                      </p>
                    </div>

                    <div className="relative w-36 shrink-0">
                      <input
                        type="number"
                        min="5"
                        max="100"
                        step="1"
                        required
                        value={politicasStays.porcentajeAnticipo}
                        onChange={(e) => setPoliticasStays({ ...politicasStays, porcentajeAnticipo: Number(e.target.value) })}
                        className="w-full pl-3 pr-8 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-black text-amber-900 text-right focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 2: Escala de Penalizaciones y Reembolso */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">2</span>
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                      Escala de Penalizaciones por Cancelación
                    </h4>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">Sobre el total de la reserva</span>
                </div>

                {/* Banner Oficial de Distribución y Reembolso */}
                <div className="bg-amber-50 border border-amber-300/80 rounded-xl p-3 mb-3.5 text-xs text-amber-950 flex items-start gap-2.5">
                  <ShieldCheck size={18} className="text-amber-700 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    <strong>Regla de Reparto Oficial:</strong> El porcentaje de la penalización se divide el <strong>50% para la empresa SARA-STAYS</strong> y el otro <strong>50% para el anfitrión</strong>; la <strong>diferencia restante se devuelve íntegramente al huésped o cliente</strong> (salvo en cancelaciones dentro de las 24 horas, donde no existe devolución).
                  </p>
                </div>

                <div className="space-y-3.5">
                  {/* Escenario a: Más de 10 días */}
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs">
                          <span>📅 a) Cancelación con MÁS de 10 Días de Anticipación</span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5">
                          Tiempo prudente que permite volver a colocar las fechas a otros viajeros.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Penalización Total */}
                        <div className="text-right">
                          <label className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">Penalización</label>
                          <div className="relative w-28">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              required
                              value={politicasStays.penalizacionMas10Dias}
                              onChange={(e) => setPoliticasStays({ ...politicasStays, penalizacionMas10Dias: Number(e.target.value) })}
                              className="w-full pl-2 pr-7 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-black text-emerald-900 text-right focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">%</span>
                          </div>
                        </div>

                        {/* % Asignado al Anfitrión (50% de la penalización) */}
                        <div className="text-right">
                          <label className="text-[10px] font-bold text-emerald-700 uppercase block mb-0.5" title="Equivale al 50% de la penalización">
                            Al Anfitrión (50%)
                          </label>
                          <div className="relative w-28">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              required
                              value={Number(((politicasStays.penalizacionMas10Dias * (politicasStays.anfitrionSharePenalizacionMas10Dias ?? 50)) / 100).toFixed(1))}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0
                                const share = politicasStays.penalizacionMas10Dias > 0 ? (val / politicasStays.penalizacionMas10Dias) * 100 : 50
                                setPoliticasStays({ ...politicasStays, anfitrionSharePenalizacionMas10Dias: share })
                              }}
                              className="w-full pl-2 pr-7 py-1.5 bg-white border border-emerald-400 rounded-lg text-xs font-black text-emerald-900 text-right focus:ring-2 focus:ring-emerald-500 outline-none shadow-xs"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-xs">%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desglose de Distribución */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-2 border-t border-emerald-200/60 bg-white/60 p-2 rounded-lg">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-600">
                          Retención: <strong>{politicasStays.penalizacionMas10Dias}%</strong>
                        </span>
                        <span className="text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded font-bold border border-emerald-200">
                          🏠 Anfitrión (50%): {((politicasStays.penalizacionMas10Dias * (politicasStays.anfitrionSharePenalizacionMas10Dias ?? 50)) / 100).toFixed(1)}% del total
                        </span>
                        <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-medium border border-slate-200">
                          🏢 SARA (50%): {((politicasStays.penalizacionMas10Dias * (100 - (politicasStays.anfitrionSharePenalizacionMas10Dias ?? 50))) / 100).toFixed(1)}% del total
                        </span>
                      </div>
                      <span className="text-emerald-700 font-extrabold">
                        ✓ Reembolso al Huésped: {Math.max(0, 100 - politicasStays.penalizacionMas10Dias)}% de la reserva
                      </span>
                    </div>
                  </div>

                  {/* Escenario b: De 5 a 10 días */}
                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
                          <span>⏱️ b) Cancelación de 5 a 10 Días de Anticipación</span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5">
                          Ventana intermedia con impacto moderado en la ocupación del anfitrión.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Penalización Total */}
                        <div className="text-right">
                          <label className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">Penalización</label>
                          <div className="relative w-28">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              required
                              value={politicasStays.penalizacion5a10Dias}
                              onChange={(e) => setPoliticasStays({ ...politicasStays, penalizacion5a10Dias: Number(e.target.value) })}
                              className="w-full pl-2 pr-7 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-black text-amber-900 text-right focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">%</span>
                          </div>
                        </div>

                        {/* % Asignado al Anfitrión (50% de la penalización) */}
                        <div className="text-right">
                          <label className="text-[10px] font-bold text-amber-800 uppercase block mb-0.5" title="Equivale al 50% de la penalización">
                            Al Anfitrión (50%)
                          </label>
                          <div className="relative w-28">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              required
                              value={Number(((politicasStays.penalizacion5a10Dias * (politicasStays.anfitrionSharePenalizacion5a10Dias ?? 50)) / 100).toFixed(1))}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0
                                const share = politicasStays.penalizacion5a10Dias > 0 ? (val / politicasStays.penalizacion5a10Dias) * 100 : 50
                                setPoliticasStays({ ...politicasStays, anfitrionSharePenalizacion5a10Dias: share })
                              }}
                              className="w-full pl-2 pr-7 py-1.5 bg-white border border-amber-400 rounded-lg text-xs font-black text-amber-900 text-right focus:ring-2 focus:ring-amber-500 outline-none shadow-xs"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-700 font-bold text-xs">%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desglose de Distribución */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-2 border-t border-amber-200/60 bg-white/60 p-2 rounded-lg">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-600">
                          Retención: <strong>{politicasStays.penalizacion5a10Dias}%</strong>
                        </span>
                        <span className="text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded font-bold border border-amber-200">
                          🏠 Anfitrión (50%): {((politicasStays.penalizacion5a10Dias * (politicasStays.anfitrionSharePenalizacion5a10Dias ?? 50)) / 100).toFixed(1)}% del total
                        </span>
                        <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-medium border border-slate-200">
                          🏢 SARA (50%): {((politicasStays.penalizacion5a10Dias * (100 - (politicasStays.anfitrionSharePenalizacion5a10Dias ?? 50))) / 100).toFixed(1)}% del total
                        </span>
                      </div>
                      <span className="text-amber-800 font-extrabold">
                        ✓ Reembolso al Huésped: {Math.max(0, 100 - politicasStays.penalizacion5a10Dias)}% de la reserva
                      </span>
                    </div>
                  </div>

                  {/* Escenario c: De 2 a 5 días */}
                  <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-200/80 space-y-3">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-orange-950 text-xs">
                          <span>⏳ c) Cancelación de 2 a 5 Días de Anticipación (&gt; 48 Horas)</span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5">
                          Menor margen de tiempo para reubicar las fechas reservadas en la plataforma.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Penalización Total */}
                        <div className="text-right">
                          <label className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">Penalización</label>
                          <div className="relative w-28">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              required
                              value={politicasStays.penalizacion2a5Dias}
                              onChange={(e) => setPoliticasStays({ ...politicasStays, penalizacion2a5Dias: Number(e.target.value) })}
                              className="w-full pl-2 pr-7 py-1.5 bg-white border border-orange-300 rounded-lg text-xs font-black text-orange-900 text-right focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">%</span>
                          </div>
                        </div>

                        {/* % Asignado al Anfitrión (50% de la penalización) */}
                        <div className="text-right">
                          <label className="text-[10px] font-bold text-orange-800 uppercase block mb-0.5" title="Equivale al 50% de la penalización">
                            Al Anfitrión (50%)
                          </label>
                          <div className="relative w-28">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              required
                              value={Number(((politicasStays.penalizacion2a5Dias * (politicasStays.anfitrionSharePenalizacion2a5Dias ?? 50)) / 100).toFixed(1))}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0
                                const share = politicasStays.penalizacion2a5Dias > 0 ? (val / politicasStays.penalizacion2a5Dias) * 100 : 50
                                setPoliticasStays({ ...politicasStays, anfitrionSharePenalizacion2a5Dias: share })
                              }}
                              className="w-full pl-2 pr-7 py-1.5 bg-white border border-orange-400 rounded-lg text-xs font-black text-orange-900 text-right focus:ring-2 focus:ring-orange-500 outline-none shadow-xs"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-orange-700 font-bold text-xs">%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desglose de Distribución */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-2 border-t border-orange-200/60 bg-white/60 p-2 rounded-lg">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-600">
                          Retención: <strong>{politicasStays.penalizacion2a5Dias}%</strong>
                        </span>
                        <span className="text-orange-900 bg-orange-100/80 px-2 py-0.5 rounded font-bold border border-orange-200">
                          🏠 Anfitrión (50%): {((politicasStays.penalizacion2a5Dias * (politicasStays.anfitrionSharePenalizacion2a5Dias ?? 50)) / 100).toFixed(1)}% del total
                        </span>
                        <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-medium border border-slate-200">
                          🏢 SARA (50%): {((politicasStays.penalizacion2a5Dias * (100 - (politicasStays.anfitrionSharePenalizacion2a5Dias ?? 50))) / 100).toFixed(1)}% del total
                        </span>
                      </div>
                      <span className="text-orange-800 font-extrabold">
                        ✓ Reembolso al Huésped: {Math.max(0, 100 - politicasStays.penalizacion2a5Dias)}% de la reserva
                      </span>
                    </div>
                  </div>

                  {/* Escenario d: Dentro de las 24 Horas (Sin Devolución) */}
                  <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/80 space-y-3">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-rose-950 text-xs">
                          <span>🚨 d) Cancelación Dentro de las 24 Horas (Última Hora)</span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5">
                          Aviso in extremis que bloqueó las fechas sin posibilidad razonable de reocupación.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Penalización Total */}
                        <div className="text-right">
                          <label className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">Penalización</label>
                          <div className="relative w-28">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              required
                              value={politicasStays.penalizacion24Horas}
                              onChange={(e) => setPoliticasStays({ ...politicasStays, penalizacion24Horas: Number(e.target.value) })}
                              className="w-full pl-2 pr-7 py-1.5 bg-white border border-rose-300 rounded-lg text-xs font-black text-rose-900 text-right focus:ring-2 focus:ring-rose-500 outline-none"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">%</span>
                          </div>
                        </div>

                        {/* % Asignado al Anfitrión (50% de la penalización) */}
                        <div className="text-right">
                          <label className="text-[10px] font-bold text-rose-800 uppercase block mb-0.5" title="Equivale al 50% de la penalización">
                            Al Anfitrión (50%)
                          </label>
                          <div className="relative w-28">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              required
                              value={Number(((politicasStays.penalizacion24Horas * (politicasStays.anfitrionSharePenalizacion24Horas ?? 50)) / 100).toFixed(1))}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0
                                const share = politicasStays.penalizacion24Horas > 0 ? (val / politicasStays.penalizacion24Horas) * 100 : 50
                                setPoliticasStays({ ...politicasStays, anfitrionSharePenalizacion24Horas: share })
                              }}
                              className="w-full pl-2 pr-7 py-1.5 bg-white border border-rose-400 rounded-lg text-xs font-black text-rose-900 text-right focus:ring-2 focus:ring-rose-500 outline-none shadow-xs"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-rose-700 font-bold text-xs">%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desglose de Distribución */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-2 border-t border-rose-200/60 bg-white/60 p-2 rounded-lg">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-600">
                          Retención: <strong>{politicasStays.penalizacion24Horas}%</strong>
                        </span>
                        <span className="text-rose-900 bg-rose-100/80 px-2 py-0.5 rounded font-bold border border-rose-200">
                          🏠 Anfitrión (50%): {((politicasStays.penalizacion24Horas * (politicasStays.anfitrionSharePenalizacion24Horas ?? 50)) / 100).toFixed(1)}% del total
                        </span>
                        <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-medium border border-slate-200">
                          🏢 SARA (50%): {((politicasStays.penalizacion24Horas * (100 - (politicasStays.anfitrionSharePenalizacion24Horas ?? 50))) / 100).toFixed(1)}% del total
                        </span>
                      </div>
                      <span className="text-rose-700 font-extrabold flex items-center gap-1">
                        ❌ NO EXISTE DEVOLUCIÓN DE LA RESERVA (0% Reembolso al Huésped)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 3: Métodos y Plazos */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">3</span>
                  <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                    Plazos y Mecanismo de Devolución
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Plazo Estimado de Devolución
                    </label>
                    <input
                      type="text"
                      required
                      value={politicasStays.diasReembolso}
                      onChange={(e) => setPoliticasStays({ ...politicasStays, diasReembolso: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                      placeholder="Ej: 48 a 72 horas laborables"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Método Oficial de Reembolso
                    </label>
                    <input
                      type="text"
                      required
                      value={politicasStays.metodoDevolucion}
                      onChange={(e) => setPoliticasStays({ ...politicasStays, metodoDevolucion: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl text-xs font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                      placeholder="Transferencia bancaria directa / reverso de tarjeta"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 4: Configuración Tributaria y Gastos Administrativos (IVA Turístico) */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">4</span>
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                      Gastos Administrativos e IVA Turístico Gubernamental
                    </h4>
                  </div>
                  <span className="text-[10px] text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full font-bold">
                    Configurable por Decreto
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-gray-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-800 block">
                        Porcentaje de IVA / Gastos Administrativos (%)
                      </label>
                      <p className="text-[11px] text-gray-500 max-w-sm mt-0.5">
                        Se aplica sobre la comisión y gestión de SARA Stays antes de liquidar el saldo neto al anfitrión tras el Check-in.
                      </p>
                    </div>

                    <div className="relative w-36 shrink-0">
                      <input
                        type="number"
                        min="0"
                        max="30"
                        step="0.5"
                        required
                        value={politicasStays.ivaPorcentaje}
                        onChange={(e) => setPoliticasStays({ ...politicasStays, ivaPorcentaje: Number(e.target.value) })}
                        className="w-full pl-3 pr-8 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-black text-amber-900 text-right focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">%</span>
                    </div>
                  </div>

                  {/* Botones de Acceso Rápido según Decretos Gubernamentales */}
                  <div className="pt-2 border-t border-gray-200 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Ajuste rápido por decreto:</span>
                    <button
                      type="button"
                      onClick={() => setPoliticasStays({ ...politicasStays, ivaPorcentaje: 8 })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        politicasStays.ivaPorcentaje === 8
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      🏖️ Feriado Turístico (8%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPoliticasStays({ ...politicasStays, ivaPorcentaje: 12 })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        politicasStays.ivaPorcentaje === 12
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      📉 Tarifa Reducida (12%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPoliticasStays({ ...politicasStays, ivaPorcentaje: 15 })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        politicasStays.ivaPorcentaje === 15
                          ? "bg-amber-600 text-white shadow-xs"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      🏛️ Tarifa Estándar Nacional (15%)
                    </button>
                  </div>

                  <p className="text-[10px] text-gray-500 italic pt-1">
                    ℹ️ <strong>Mecanismo Financiero SARA:</strong> Los huéspedes depositan el 100% de la estadía a la cuenta de la empresa SARA (30% anticipo al reservar y 70% saldo al hacer Check-in). Tras confirmarse el ingreso del huésped, SARA liquida y transfiere el valor al anfitrión deduciendo la comisión de gestión + los gastos administrativos e IVA vigente ({politicasStays.ivaPorcentaje}%).
                  </p>
                </div>
              </div>

              {/* Botón Guardar Cambios */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSavingPoliticas}
                  className="w-full py-3.5 bg-brand-sage hover:bg-brand-sage/90 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 size={16} />
                  <span>{isSavingPoliticas ? "Guardando Políticas..." : "Guardar y Publicar Políticas en SARA Stays"}</span>
                </button>
              </div>
            </form>

            {/* Columna Derecha (5 Cols): Simulador Interactivo de Reembolsos y Liquidaciones */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Calculator size={18} className="text-amber-400" />
                    <h4 className="font-bold text-sm text-white">Simulador de Reembolso & Liquidación</h4>
                  </div>
                  <span className="text-[10px] bg-white/10 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                    Cálculo Automático
                  </span>
                </div>

                {/* Input de prueba para el simulador */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-semibold block">
                    Monto Total de Prueba para Reserva ($ USD):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input
                      type="number"
                      min="10"
                      step="5"
                      value={simuladorMonto}
                      onChange={(e) => setSimuladorMonto(Number(e.target.value) || 0)}
                      className="w-full pl-8 pr-12 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-black text-amber-300 focus:outline-none focus:border-amber-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-mono">USD</span>
                  </div>
                </div>

                {/* Resumen del Anticipo Inicial */}
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1 text-xs">
                  <div className="flex justify-between text-gray-300">
                    <span>Total Reserva (Cuenta SARA):</span>
                    <strong className="text-white">${simuladorMonto.toFixed(2)} USD</strong>
                  </div>
                  <div className="flex justify-between text-amber-300">
                    <span>Anticipo cobrado hoy ({politicasStays.porcentajeAnticipo}%):</span>
                    <strong className="text-base font-black">${(simuladorMonto * (politicasStays.porcentajeAnticipo / 100)).toFixed(2)} USD</strong>
                  </div>
                  <div className="flex justify-between text-gray-400 text-[11px]">
                    <span>Saldo a cobrar al Check-in ({100 - politicasStays.porcentajeAnticipo}%):</span>
                    <span>${(simuladorMonto * ((100 - politicasStays.porcentajeAnticipo) / 100)).toFixed(2)} USD</span>
                  </div>
                </div>

                {/* Desglose de Liquidación SARA al Anfitrión tras el Check-in */}
                {(() => {
                  const baseSinIva = simuladorMonto / (1 + (politicasStays.ivaPorcentaje / 100))
                  const gastosAdmIva = simuladorMonto - baseSinIva
                  const comisionSara = baseSinIva * 0.15
                  const netoAnfitrion = simuladorMonto - comisionSara - gastosAdmIva

                  return (
                    <div className="p-3.5 bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl border border-amber-500/30 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-amber-400 font-bold border-b border-white/10 pb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Receipt size={14} />
                          <span>Liquidación al Anfitrión (Post Check-in)</span>
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold">100% Fondos en SARA</span>
                      </div>

                      <div className="space-y-1 text-[11px] text-gray-300">
                        <div className="flex justify-between">
                          <span>Total Reserva Bruta del Huésped (con IVA):</span>
                          <strong className="text-white">${simuladorMonto.toFixed(2)} USD</strong>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Base Imponible neta (sin IVA):</span>
                          <span className="font-mono text-slate-300">${baseSinIva.toFixed(2)} USD</span>
                        </div>
                        <div className="flex justify-between text-rose-300">
                          <span>• Retención Comisión SARA (15% s/base imponible neta):</span>
                          <span>-${comisionSara.toFixed(2)} USD</span>
                        </div>
                        <div className="flex justify-between text-amber-300">
                          <span>• Gastos Adm. (IVA SRI {politicasStays.ivaPorcentaje}% extraído del total):</span>
                          <span>-${gastosAdmIva.toFixed(2)} USD</span>
                        </div>
                        <div className="flex justify-between text-gray-400 pt-0.5 border-t border-white/5">
                          <span>Total retenido por SARA:</span>
                          <strong className="text-rose-400">-${(comisionSara + gastosAdmIva).toFixed(2)} USD</strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1.5 border-t border-amber-500/30 bg-emerald-500/10 p-2 rounded-lg">
                        <div>
                          <span className="text-emerald-300 font-bold block">Valor a Transferir al Anfitrión:</span>
                          <span className="text-[9px] text-emerald-200/70 block">(Total Reserva Bruta - Comisión SARA - Gastos Administrativos)</span>
                        </div>
                        <strong className="text-base text-emerald-400 font-black">
                          ${netoAnfitrion.toFixed(2)} USD
                        </strong>
                      </div>
                    </div>
                  )
                })()}

                {/* Tabla de Resultados Simulados en los 4 Casos */}
                <div className="space-y-2 pt-1 text-xs">
                  <p className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
                    ¿Qué sucede si el huésped cancela? (4 Escalas Oficiales)
                  </p>

                  {/* Caso a: > 10 Días */}
                  {(() => {
                    const penMonto = simuladorMonto * (politicasStays.penalizacionMas10Dias / 100)
                    const hostShare = politicasStays.anfitrionSharePenalizacionMas10Dias ?? 50
                    const hostPctTotal = (politicasStays.penalizacionMas10Dias * (hostShare / 100)).toFixed(1)
                    const saraPctTotal = (politicasStays.penalizacionMas10Dias * ((100 - hostShare) / 100)).toFixed(1)
                    const hostMonto = penMonto * (hostShare / 100)
                    const saraMonto = penMonto * ((100 - hostShare) / 100)
                    const reembolso = simuladorMonto * (Math.max(0, 100 - politicasStays.penalizacionMas10Dias) / 100)

                    return (
                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1.5">
                        <div className="flex items-center justify-between text-emerald-300 font-bold">
                          <span>a) Más de 10 días</span>
                          <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                            Penalización {politicasStays.penalizacionMas10Dias}%
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-gray-300">
                          <span>Retención total por penalización:</span>
                          <span className="text-rose-400 font-bold">-${penMonto.toFixed(2)} USD</span>
                        </div>

                        {/* Reparto Anfitrión y SARA */}
                        <div className="bg-black/40 p-2 rounded-lg space-y-1 text-[10px] border border-white/5">
                          <div className="flex justify-between text-emerald-300 font-medium">
                            <span>🏠 Compensación Anfitrión ({hostPctTotal}% del total - 50% de retención):</span>
                            <strong className="font-bold">+${hostMonto.toFixed(2)} USD</strong>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>🏢 Retención Operativa SARA ({saraPctTotal}% del total - 50% de retención):</span>
                            <span>+${saraMonto.toFixed(2)} USD</span>
                          </div>
                        </div>

                        <div className="flex justify-between text-xs pt-1 border-t border-white/5">
                          <span className="text-emerald-400 font-bold">Reembolso devuelto al cliente:</span>
                          <strong className="text-emerald-400 text-sm font-black">
                            ${reembolso.toFixed(2)} USD
                          </strong>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Caso b: 5 a 10 Días */}
                  {(() => {
                    const penMonto = simuladorMonto * (politicasStays.penalizacion5a10Dias / 100)
                    const hostShare = politicasStays.anfitrionSharePenalizacion5a10Dias ?? 50
                    const hostPctTotal = (politicasStays.penalizacion5a10Dias * (hostShare / 100)).toFixed(1)
                    const saraPctTotal = (politicasStays.penalizacion5a10Dias * ((100 - hostShare) / 100)).toFixed(1)
                    const hostMonto = penMonto * (hostShare / 100)
                    const saraMonto = penMonto * ((100 - hostShare) / 100)
                    const reembolso = simuladorMonto * (Math.max(0, 100 - politicasStays.penalizacion5a10Dias) / 100)

                    return (
                      <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-1.5">
                        <div className="flex items-center justify-between text-amber-300 font-bold">
                          <span>b) De 5 a 10 días</span>
                          <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                            Penalización {politicasStays.penalizacion5a10Dias}%
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-gray-300">
                          <span>Retención total por penalización:</span>
                          <span className="text-rose-400 font-bold">-${penMonto.toFixed(2)} USD</span>
                        </div>

                        {/* Reparto Anfitrión y SARA */}
                        <div className="bg-black/40 p-2 rounded-lg space-y-1 text-[10px] border border-white/5">
                          <div className="flex justify-between text-amber-300 font-medium">
                            <span>🏠 Compensación Anfitrión ({hostPctTotal}% del total - 50% de retención):</span>
                            <strong className="font-bold">+${hostMonto.toFixed(2)} USD</strong>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>🏢 Retención Operativa SARA ({saraPctTotal}% del total - 50% de retención):</span>
                            <span>+${saraMonto.toFixed(2)} USD</span>
                          </div>
                        </div>

                        <div className="flex justify-between text-xs pt-1 border-t border-white/5">
                          <span className="text-amber-400 font-bold">Reembolso devuelto al cliente:</span>
                          <strong className="text-amber-400 text-sm font-black">
                            ${reembolso.toFixed(2)} USD
                          </strong>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Caso c: 2 a 5 Días */}
                  {(() => {
                    const penMonto = simuladorMonto * (politicasStays.penalizacion2a5Dias / 100)
                    const hostShare = politicasStays.anfitrionSharePenalizacion2a5Dias ?? 50
                    const hostPctTotal = (politicasStays.penalizacion2a5Dias * (hostShare / 100)).toFixed(1)
                    const saraPctTotal = (politicasStays.penalizacion2a5Dias * ((100 - hostShare) / 100)).toFixed(1)
                    const hostMonto = penMonto * (hostShare / 100)
                    const saraMonto = penMonto * ((100 - hostShare) / 100)
                    const reembolso = simuladorMonto * (Math.max(0, 100 - politicasStays.penalizacion2a5Dias) / 100)

                    return (
                      <div className="p-3 rounded-xl bg-orange-950/40 border border-orange-500/30 space-y-1.5">
                        <div className="flex items-center justify-between text-orange-300 font-bold">
                          <span>c) De 2 a 5 días</span>
                          <span className="text-[11px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded font-mono">
                            Penalización {politicasStays.penalizacion2a5Dias}%
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-gray-300">
                          <span>Retención total por penalización:</span>
                          <span className="text-rose-400 font-bold">-${penMonto.toFixed(2)} USD</span>
                        </div>

                        {/* Reparto Anfitrión y SARA */}
                        <div className="bg-black/40 p-2 rounded-lg space-y-1 text-[10px] border border-white/5">
                          <div className="flex justify-between text-orange-300 font-medium">
                            <span>🏠 Compensación Anfitrión ({hostPctTotal}% del total - 50% de retención):</span>
                            <strong className="font-bold">+${hostMonto.toFixed(2)} USD</strong>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>🏢 Retención Operativa SARA ({saraPctTotal}% del total - 50% de retención):</span>
                            <span>+${saraMonto.toFixed(2)} USD</span>
                          </div>
                        </div>

                        <div className="flex justify-between text-xs pt-1 border-t border-white/5">
                          <span className="text-orange-400 font-bold">Reembolso devuelto al cliente:</span>
                          <strong className="text-orange-400 text-sm font-black">
                            ${reembolso.toFixed(2)} USD
                          </strong>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Caso d: Dentro de las 24 Horas (Sin Devolución) */}
                  {(() => {
                    const penMonto = simuladorMonto * (politicasStays.penalizacion24Horas / 100)
                    const hostShare = politicasStays.anfitrionSharePenalizacion24Horas ?? 50
                    const hostPctTotal = (politicasStays.penalizacion24Horas * (hostShare / 100)).toFixed(1)
                    const saraPctTotal = (politicasStays.penalizacion24Horas * ((100 - hostShare) / 100)).toFixed(1)
                    const hostMonto = penMonto * (hostShare / 100)
                    const saraMonto = penMonto * ((100 - hostShare) / 100)
                    const reembolso = simuladorMonto * (Math.max(0, 100 - politicasStays.penalizacion24Horas) / 100)

                    return (
                      <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 space-y-1.5">
                        <div className="flex items-center justify-between text-rose-300 font-bold">
                          <span>d) Dentro de las 24 horas</span>
                          <span className="text-[11px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono">
                            Penalización {politicasStays.penalizacion24Horas}%
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-gray-300">
                          <span>Retención total por penalización:</span>
                          <span className="text-rose-400 font-bold">-${penMonto.toFixed(2)} USD</span>
                        </div>

                        {/* Reparto Anfitrión y SARA */}
                        <div className="bg-black/40 p-2 rounded-lg space-y-1 text-[10px] border border-white/5">
                          <div className="flex justify-between text-rose-300 font-medium">
                            <span>🏠 Compensación Anfitrión ({hostPctTotal}% del total - 50% de retención):</span>
                            <strong className="font-bold">+${hostMonto.toFixed(2)} USD</strong>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>🏢 Retención Operativa SARA ({saraPctTotal}% del total - 50% de retención):</span>
                            <span>+${saraMonto.toFixed(2)} USD</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                          <span className="text-rose-400 font-black flex items-center gap-1">
                            ❌ NO EXISTE DEVOLUCIÓN:
                          </span>
                          <strong className="text-rose-400 text-sm font-black">
                            ${reembolso.toFixed(2)} USD (0%)
                          </strong>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Botón para Copiar Texto para WhatsApp */}
                <div className="pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      const hostMas10Pct = ((politicasStays.penalizacionMas10Dias * (politicasStays.anfitrionSharePenalizacionMas10Dias ?? 50)) / 100).toFixed(1)
                      const host5a10Pct = ((politicasStays.penalizacion5a10Dias * (politicasStays.anfitrionSharePenalizacion5a10Dias ?? 50)) / 100).toFixed(1)
                      const host2a5Pct = ((politicasStays.penalizacion2a5Dias * (politicasStays.anfitrionSharePenalizacion2a5Dias ?? 50)) / 100).toFixed(1)
                      const host24hPct = ((politicasStays.penalizacion24Horas * (politicasStays.anfitrionSharePenalizacion24Horas ?? 50)) / 100).toFixed(1)

                      const msg = `*POLÍTICAS DE RESERVA, CANCELACIÓN & COMPENSACIÓN AL ANFITRIÓN - SARA STAYS*\n\n` +
                        `✅ *Anticipo para Confirmar:* ${politicasStays.porcentajeAnticipo}% del valor de la estadía.\n` +
                        `💵 *Saldo restante:* Se liquida al Check-in directamente a cuenta SARA.\n\n` +
                        `⚖️ *Regla Oficial de Cancelación:* El porcentaje de la penalización se divide el 50% para la empresa SARA-STAYS y el 50% para el anfitrión; la diferencia restante se devuelve al huésped o cliente.\n\n` +
                        `📋 *Escala Oficial de Penalización, Reembolso y Compensación al Anfitrión:*\n` +
                        `• *a) Más de 10 días:* Penalización ${politicasStays.penalizacionMas10Dias}% (Devolución Huésped: ${Math.max(0, 100 - politicasStays.penalizacionMas10Dias)}% | Anfitrión recibe: ${hostMas10Pct}% de la reserva [50% de la penalización]).\n` +
                        `• *b) De 5 a 10 días:* Penalización ${politicasStays.penalizacion5a10Dias}% (Devolución Huésped: ${Math.max(0, 100 - politicasStays.penalizacion5a10Dias)}% | Anfitrión recibe: ${host5a10Pct}% de la reserva [50% de la penalización]).\n` +
                        `• *c) De 2 a 5 días:* Penalización ${politicasStays.penalizacion2a5Dias}% (Devolución Huésped: ${Math.max(0, 100 - politicasStays.penalizacion2a5Dias)}% | Anfitrión recibe: ${host2a5Pct}% de la reserva [50% de la penalización]).\n` +
                        `• *d) Dentro de las 24 horas:* Penalización ${politicasStays.penalizacion24Horas}% (¡NO EXISTE DEVOLUCIÓN DE LA RESERVA - 0% Reembolso! | Anfitrión recibe: ${host24hPct}% de la reserva [50% de la penalización]).\n\n` +
                        `⏱️ *Plazo de Devolución:* ${politicasStays.diasReembolso} mediante ${politicasStays.metodoDevolucion}.\n` +
                        `🏛️ *IVA / Facturación SRI:* ${politicasStays.ivaPorcentaje}% extraído del total bruto.`

                      navigator.clipboard.writeText(msg)
                      alert("¡Texto de políticas copiado al portapapeles! Listo para enviar por WhatsApp o correo.")
                    }}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-white/10"
                  >
                    <Copy size={14} className="text-amber-400" />
                    <span>Copiar Texto Oficial para WhatsApp / Correo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: NUEVA RESERVA & CÁLCULO DE COMISIÓN AUTOMÁTICO */}
      {/* ========================================================= */}
      {isReservaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setIsReservaModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
              <div className="p-3 bg-brand-sage/10 text-brand-sage rounded-xl">
                <Receipt size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Registrar Nueva Reserva & Liquidación</h3>
                <p className="text-xs text-gray-500">Calcula la retención de comisión SARA y el neto para el anfitrión</p>
              </div>
            </div>

            <form onSubmit={handleSaveReserva} className="space-y-4">
              {/* Selección de Alojamiento */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Seleccionar Alojamiento
                </label>
                <select
                  required
                  value={formReserva.alojamientoId}
                  onChange={(e) => {
                    const sel = alojamientos.find(a => a.id === e.target.value)
                    if (sel) {
                      setFormReserva({
                        ...formReserva,
                        alojamientoId: sel.id,
                        tarifaNoche: sel.precioNoche,
                        tarifaLimpieza: sel.tarifaLimpieza,
                        porcentajeComisionSara: sel.monetizacion.porcentajeComision
                      })
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-800 focus:ring-2 focus:ring-brand-sage"
                >
                  {alojamientos.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.codigo} - {a.titulo} (${a.precioNoche}/noche)
                    </option>
                  ))}
                </select>
              </div>

              {/* Datos del Huésped */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre del Huésped</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: John Doe & Familia"
                    value={formReserva.huespedNombre}
                    onChange={(e) => setFormReserva({ ...formReserva, huespedNombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">País / Origen</label>
                  <input
                    type="text"
                    required
                    placeholder="Estados Unidos 🇺🇸"
                    value={formReserva.huespedPais}
                    onChange={(e) => setFormReserva({ ...formReserva, huespedPais: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Fechas y Noches */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Check-In</label>
                  <input
                    type="date"
                    required
                    value={formReserva.fechaCheckIn}
                    onChange={(e) => setFormReserva({ ...formReserva, fechaCheckIn: e.target.value })}
                    className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Check-Out</label>
                  <input
                    type="date"
                    required
                    value={formReserva.fechaCheckOut}
                    onChange={(e) => setFormReserva({ ...formReserva, fechaCheckOut: e.target.value })}
                    className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Número de Noches</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formReserva.noches}
                    onChange={(e) => setFormReserva({ ...formReserva, noches: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-900"
                  />
                </div>
              </div>

              {/* Desglose Financiero en Vivo */}
              <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Desglose de Liquidación y Retención SARA</h4>
                
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Subtotal Noches ({formReserva.noches} × ${formReserva.tarifaNoche}):</span>
                  <span className="font-bold text-gray-900">${formReserva.noches * formReserva.tarifaNoche}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Tarifa de Limpieza:</span>
                  <span className="font-bold text-gray-900">${formReserva.tarifaLimpieza}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-800 pt-1 border-t border-gray-200">
                  <span>Total Cobrado al Huésped:</span>
                  <span>${(formReserva.noches * formReserva.tarifaNoche) + formReserva.tarifaLimpieza}</span>
                </div>

                <div className="flex justify-between text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <span>Comisión SARA ({formReserva.porcentajeComisionSara}%):</span>
                  <span>+${(((formReserva.noches * formReserva.tarifaNoche) * formReserva.porcentajeComisionSara) / 100).toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-xs font-bold text-blue-900 bg-blue-50 p-2 rounded-lg border border-blue-200">
                  <span>Saldo Neto a Liquidar al Anfitrión:</span>
                  <span>${((formReserva.noches * formReserva.tarifaNoche) - (((formReserva.noches * formReserva.tarifaNoche) * formReserva.porcentajeComisionSara) / 100)).toFixed(2)}</span>
                </div>
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsReservaModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-sage hover:bg-brand-sage/90 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check size={16} />
                  <span>Guardar Reserva y Generar Liquidación</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: NUEVO / EDITAR ALOJAMIENTO AIRBNB (MULTI-VIÑETAS) */}
      {/* ========================================================= */}
      {isAlojamientoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-gray-100 relative my-4 sm:my-8 flex flex-col max-h-[92vh]">
            {/* Header del Modal */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-slate-50/50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-sage/10 text-brand-sage rounded-xl">
                  <Building size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black text-gray-900">
                      {editingAlojamiento ? "Editar Alojamiento Airbnb" : "Registrar Nuevo Alojamiento Airbnb"}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                      <Lock size={10} /> {formAlojamiento.codigo}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Configuración integral de ficha pública, geolocalización, multimedia, anfitrión y comisiones SARA.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAlojamientoModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Cerrar ventana"
              >
                <X size={20} />
              </button>
            </div>

            {/* Barra de Viñetas / Pestañas (Navegación Responsive) */}
            <div className="px-6 pt-2 border-b border-gray-200 bg-white shrink-0 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1 sm:gap-2 min-w-max">
                <button
                  type="button"
                  onClick={() => setModalTab("general")}
                  className={`pb-3 pt-2 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 transition-all ${
                    modalTab === "general"
                      ? "border-brand-sage text-brand-dark"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <MapPin size={15} className={modalTab === "general" ? "text-brand-sage" : ""} />
                  <span>1. Ubicación & Mapa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab("multimedia")}
                  className={`pb-3 pt-2 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 transition-all ${
                    modalTab === "multimedia"
                      ? "border-brand-sage text-brand-dark"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <ImageIcon size={15} className={modalTab === "multimedia" ? "text-brand-sage" : ""} />
                  <span>2. Fotos & Video</span>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded-full">
                    {formAlojamiento.imagenes.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab("anfitrion")}
                  className={`pb-3 pt-2 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 transition-all ${
                    modalTab === "anfitrion"
                      ? "border-brand-sage text-brand-dark"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Users size={15} className={modalTab === "anfitrion" ? "text-brand-sage" : ""} />
                  <span>3. Anfitrión & Banco</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab("caracteristicas")}
                  className={`pb-3 pt-2 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 transition-all ${
                    modalTab === "caracteristicas"
                      ? "border-brand-sage text-brand-dark"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <CheckCircle2 size={15} className={modalTab === "caracteristicas" ? "text-brand-sage" : ""} />
                  <span>4. Checklist & Amenidades</span>
                  <span className="text-[10px] bg-brand-sage/10 text-brand-sage px-1.5 py-0.2 rounded-full font-bold">
                    {formAlojamiento.amenidades.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab("tarifas")}
                  className={`pb-3 pt-2 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 transition-all ${
                    modalTab === "tarifas"
                      ? "border-brand-sage text-brand-dark"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <DollarSign size={15} className={modalTab === "tarifas" ? "text-brand-sage" : ""} />
                  <span>5. Tarifas & Comisión</span>
                </button>
              </div>
            </div>

            {/* Contenido del Formulario por Viñetas */}
            <form onSubmit={handleSaveAlojamiento} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {/* ========================================================= */}
                {/* VIÑETA 1: DATOS GENERALES & MAPA DE GEOLOCALIZACIÓN */}
                {/* ========================================================= */}
                {modalTab === "general" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <div>
                        <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                          <MapPin size={16} className="text-brand-sage" />
                          Identificación del Inmueble y Ubicación Geográfica
                        </h4>
                        <p className="text-xs text-gray-500">
                          El código del sistema es único y no modificable. Ubica la propiedad en el mapa para capturar las coordenadas exactas.
                        </p>
                      </div>
                    </div>

                    {/* Fila 1: Código no editable + Título */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                          <Lock size={12} className="text-amber-600" />
                          <span>Código (No Modificable)</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            readOnly
                            value={formAlojamiento.codigo}
                            className="w-full pl-8 pr-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-xs font-mono font-black text-slate-700 select-all cursor-not-allowed shadow-inner"
                            title="El código es generado automáticamente por el sistema y no puede ser modificado"
                          />
                          <Lock size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          🔒 Generado de forma secuencial
                        </span>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Título del Anuncio Airbnb <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Master Suite de Diseño Frente al Río Tomebamba"
                          value={formAlojamiento.titulo}
                          onChange={(e) => setFormAlojamiento({ ...formAlojamiento, titulo: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-900 focus:ring-2 focus:ring-brand-sage"
                        />
                      </div>
                    </div>

                    {/* Fila 2: Alcance + Tipo (Exactamente los 6 tipos) + Ciudad + Sector */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Alcance</label>
                        <select
                          value={formAlojamiento.alcance}
                          onChange={(e) => {
                            const val = e.target.value as any
                            setFormAlojamiento({ 
                              ...formAlojamiento, 
                              alcance: val,
                              pais: val === "nacional" ? "Ecuador" : "Estados Unidos",
                              bandera: val === "nacional" ? "🇪🇨" : "🇺🇸"
                            })
                          }}
                          className="w-full px-2.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-800"
                        >
                          <option value="nacional">🇪🇨 Nacional (Ecuador)</option>
                          <option value="internacional">🌎 Internacional</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Tipo de Inmueble <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formAlojamiento.tipo}
                          onChange={(e) => setFormAlojamiento({ ...formAlojamiento, tipo: e.target.value as any })}
                          className="w-full px-2.5 py-2 bg-white border border-brand-sage/40 rounded-lg text-xs font-bold text-brand-dark focus:ring-2 focus:ring-brand-sage"
                        >
                          <option value="suite">Suite</option>
                          <option value="departamento">Departamento</option>
                          <option value="penthouse">Penthouse</option>
                          <option value="casa">Casa</option>
                          <option value="villa">Villa</option>
                          <option value="quinta">Quinta</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Ciudad</label>
                        <input
                          type="text"
                          required
                          placeholder="Cuenca"
                          value={formAlojamiento.ciudad}
                          onChange={(e) => setFormAlojamiento({ ...formAlojamiento, ciudad: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Sector / Barrio</label>
                        <input
                          type="text"
                          required
                          placeholder="Av. Ordóñez Lasso"
                          value={formAlojamiento.sector}
                          onChange={(e) => setFormAlojamiento({ ...formAlojamiento, sector: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium"
                        />
                      </div>
                    </div>

                    {/* Fila 3: Mapa interactivo con selección de coordenadas GPS */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-rose-500" />
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-800">
                            Geolocalización en el Mapa (Clic o Arrastrar Marcador)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-gray-200">
                            <span className="text-[10px] font-bold text-gray-400">Lat:</span>
                            <input
                              type="number"
                              step="any"
                              value={formAlojamiento.lat}
                              onChange={(e) => setFormAlojamiento({ ...formAlojamiento, lat: Number(e.target.value) })}
                              className="w-20 text-xs font-mono font-bold text-gray-800 bg-transparent focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-gray-200">
                            <span className="text-[10px] font-bold text-gray-400">Lng:</span>
                            <input
                              type="number"
                              step="any"
                              value={formAlojamiento.lng}
                              onChange={(e) => setFormAlojamiento({ ...formAlojamiento, lng: Number(e.target.value) })}
                              className="w-20 text-xs font-mono font-bold text-gray-800 bg-transparent focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Componente de Mapa Leaflet */}
                      <AirbnbCoordinatePickerWrapper
                        lat={formAlojamiento.lat}
                        lng={formAlojamiento.lng}
                        ciudad={formAlojamiento.ciudad}
                        onChange={(newLat, newLng) => {
                          setFormAlojamiento(prev => ({
                            ...prev,
                            lat: newLat,
                            lng: newLng
                          }))
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* VIÑETA 2: MULTIMEDIA (FOTOS & VIDEO & PORTADA) */}
                {/* ========================================================= */}
                {modalTab === "multimedia" && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <div>
                        <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                          <ImageIcon size={16} className="text-brand-sage" />
                          Galería Fotográfica y Video de Recorrido
                        </h4>
                        <p className="text-xs text-gray-500">
                          Agrega múltiples fotos, define cuál será la foto principal que se mostrará en la tarjeta de búsqueda e inserta video tour.
                        </p>
                      </div>
                    </div>

                    {/* Agregar Foto por URL o mediante Presets de Arquitectura o Archivo Local */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                          Agregar Fotos a la Galería
                        </label>

                        {/* Botón para subir fotos desde el dispositivo (PC, Móvil, Tablet) */}
                        <label className="cursor-pointer px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
                          <Upload size={14} />
                          <span>Subir Fotos desde este Dispositivo</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            multiple 
                            onChange={handleDevicePhotoUpload} 
                            className="hidden" 
                          />
                        </label>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="O ingresa enlace web: https://images.unsplash.com/photo-..."
                          value={formAlojamiento.nuevaFotoUrl}
                          onChange={(e) => setFormAlojamiento({ ...formAlojamiento, nuevaFotoUrl: e.target.value })}
                          className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddFoto()}
                          className="px-4 py-2 bg-brand-sage hover:bg-brand-sage/90 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                        >
                          <Plus size={15} />
                          <span>Añadir Enlace</span>
                        </button>
                      </div>

                      {/* Accesos rápidos a fotos curadas */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Ejemplos Rápidos:
                        </span>
                        {FOTO_PRESETS.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => handleAddFoto(p.url)}
                            className="px-2 py-0.5 text-[10px] font-medium bg-white hover:bg-brand-sage/10 hover:text-brand-dark rounded text-gray-600 border border-gray-200 transition-colors"
                          >
                            + {p.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Grid de Fotos con Selector de Portada y Eliminar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                          Fotos del Alojamiento ({formAlojamiento.imagenes.length})
                        </span>
                        <span className="text-[11px] text-gray-500">
                          Haz clic en <span className="font-bold text-emerald-700">"Hacer Portada"</span> para elegir la foto de la tarjeta principal
                        </span>
                      </div>

                      {formAlojamiento.imagenes.length === 0 ? (
                        <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400">
                          <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-xs font-semibold">No hay fotos agregadas aún.</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Ingresa una URL o haz clic en los ejemplos rápidos arriba.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {formAlojamiento.imagenes.map((imgUrl, idx) => {
                            const isCover = imgUrl === formAlojamiento.imagenUrl
                            return (
                              <div
                                key={idx}
                                className={`group relative rounded-xl overflow-hidden border-2 transition-all bg-gray-100 ${
                                  isCover ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20" : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Foto ${idx + 1}`}
                                  className="w-full h-32 object-cover"
                                />

                                {/* Badge Portada Activa */}
                                {isCover && (
                                  <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow flex items-center gap-1 z-10">
                                    <Star size={11} className="fill-white" />
                                    <span>Portada Principal</span>
                                  </div>
                                )}

                                {/* Barra de Acciones sobre la foto */}
                                <div className="p-2 bg-white flex items-center justify-between gap-1 border-t border-gray-100">
                                  {!isCover ? (
                                    <button
                                      type="button"
                                      onClick={() => handleSetPortada(imgUrl)}
                                      className="text-[11px] font-bold text-gray-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                                    >
                                      <Star size={12} />
                                      <span>Hacer Portada</span>
                                    </button>
                                  ) : (
                                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                      <Check size={12} />
                                      <span>Portada Activa</span>
                                    </span>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFoto(idx)}
                                    className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                    title="Eliminar foto"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Sección de Video Tour */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                          <Video size={14} className="text-brand-sage" />
                          <span>Video del Recorrido Virtual</span>
                        </label>

                        {/* Botón para subir video desde el dispositivo */}
                        <label className="cursor-pointer px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
                          <Upload size={13} />
                          <span>Subir Video desde este Dispositivo</span>
                          <input 
                            type="file" 
                            accept="video/*" 
                            onChange={handleDeviceVideoUpload} 
                            className="hidden" 
                          />
                        </label>
                      </div>

                      <div className="space-y-1">
                        <input
                          type="text"
                          placeholder="O pega URL de video (YouTube, Vimeo o enlace directo .mp4)..."
                          value={formAlojamiento.videoUrl}
                          onChange={(e) => setFormAlojamiento({ ...formAlojamiento, videoUrl: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs"
                        />
                        {formAlojamiento.videoUrl && (
                          <div className="flex items-center justify-between text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 mt-1">
                            <span className="truncate max-w-md">📹 Video cargado correctamente</span>
                            <button
                              type="button"
                              onClick={() => setFormAlojamiento({ ...formAlojamiento, videoUrl: "" })}
                              className="text-rose-600 hover:underline font-bold ml-2 cursor-pointer"
                            >
                              Eliminar video
                            </button>
                          </div>
                        )}
                        <p className="text-[11px] text-gray-500">
                          Permite a los huéspedes realizar un recorrido inmersivo antes de reservar su estadía.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* VIÑETA 3: DATOS DEL ANFITRIÓN & CUENTA BANCARIA */}
                {/* ========================================================= */}
                {modalTab === "anfitrion" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <div>
                        <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                          <Users size={16} className="text-brand-sage" />
                          Datos del Anfitrión & Cuenta Bancaria para Pagos / Anticipos
                        </h4>
                        <p className="text-xs text-gray-500">
                          Información completa del dueño o anfitrión para remitir transferencias bancarias, liquidaciones netas de reservas y anticipos.
                        </p>
                      </div>
                    </div>

                    {/* Datos Personales */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                        1. Contacto del Propietario / Anfitrión
                      </h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Nombre Completo <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: Javier Sarango"
                            value={formAlojamiento.anfitrionNombre}
                            onChange={(e) => setFormAlojamiento({ ...formAlojamiento, anfitrionNombre: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            WhatsApp de Contacto <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="+593 981804023"
                            value={formAlojamiento.anfitrionTelefono}
                            onChange={(e) => setFormAlojamiento({ ...formAlojamiento, anfitrionTelefono: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Correo Electrónico
                          </label>
                          <input
                            type="email"
                            placeholder="anfitrion@correo.com"
                            value={formAlojamiento.anfitrionEmail}
                            onChange={(e) => setFormAlojamiento({ ...formAlojamiento, anfitrionEmail: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                            <span>Cédula / RUC del Propietario <span className="text-rose-500">*</span></span>
                            <span className="text-[10px] text-brand-dark font-bold bg-amber-100 px-1.5 py-0.5 rounded">Identificación Oficial</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: 0103492817 o 0190458923001"
                            value={formAlojamiento.anfitrionCedulaRuc}
                            onChange={(e) => setFormAlojamiento({ ...formAlojamiento, anfitrionCedulaRuc: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cuenta Bancaria para Pagos / Anticipos */}
                    <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-3">
                      <div className="flex items-center gap-2">
                        <Landmark size={16} className="text-blue-700" />
                        <h5 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                          2. Cuenta Bancaria para Transferencia de Liquidaciones y Anticipos
                        </h5>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Institución Bancaria <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={formAlojamiento.anfitrionBanco}
                            onChange={(e) => setFormAlojamiento({ ...formAlojamiento, anfitrionBanco: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-xs font-bold text-gray-800"
                          >
                            {BANCOS_ECUADOR.map(b => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Tipo de Cuenta <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={formAlojamiento.anfitrionTipoCuenta}
                            onChange={(e) => setFormAlojamiento({ ...formAlojamiento, anfitrionTipoCuenta: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-xs font-bold text-gray-800"
                          >
                            <option value="Ahorros">Cuenta de Ahorros</option>
                            <option value="Corriente">Cuenta Corriente</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Número de Cuenta <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: 2201984532"
                            value={formAlojamiento.anfitrionNumeroCuenta}
                            onChange={(e) => setFormAlojamiento({ ...formAlojamiento, anfitrionNumeroCuenta: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-xs font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Nombre del Titular de la Cuenta
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: Javier Sarango"
                            value={formAlojamiento.anfitrionTitular}
                            onChange={(e) => setFormAlojamiento({ ...formAlojamiento, anfitrionTitular: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-xs font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                            <span>C.I. / RUC del Titular para Transferencia</span>
                            <span className="text-[10px] text-blue-700 font-bold">Para Comprobante</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: 0103492817"
                            value={formAlojamiento.anfitrionCedulaRuc}
                            onChange={(e) => setFormAlojamiento({ ...formAlojamiento, anfitrionCedulaRuc: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-xs font-mono font-bold"
                          />
                        </div>
                      </div>

                      {/* Tarjeta resumen de liquidación bancaria */}
                      <div className="bg-white p-3.5 rounded-lg border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-blue-900 font-medium gap-2 shadow-sm">
                        <div className="flex items-center gap-2">
                          <CreditCard size={18} className="text-blue-600 shrink-0" />
                          <span>
                            Destino de Liquidación: <strong className="font-bold">{formAlojamiento.anfitrionBanco}</strong> • {formAlojamiento.anfitrionTipoCuenta} No. <strong className="font-mono">{formAlojamiento.anfitrionNumeroCuenta || "---"}</strong>
                            {formAlojamiento.anfitrionCedulaRuc && (
                              <span className="ml-2 text-blue-800 font-bold bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                                C.I./RUC: {formAlojamiento.anfitrionCedulaRuc}
                              </span>
                            )}
                          </span>
                        </div>
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-bold shrink-0">
                          Cuenta Verificada SARA
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* VIÑETA 4: CARACTERÍSTICAS & CHECKLIST DE AMENIDADES */}
                {/* ========================================================= */}
                {modalTab === "caracteristicas" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <div>
                        <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-brand-sage" />
                          Capacidad, Checklist de Amenidades y Reglas del Alojamiento
                        </h4>
                        <p className="text-xs text-gray-500">
                          Configura el número de habitaciones, baños, camas, el checklist de servicios ofrecidos y las reglas de estadía.
                        </p>
                      </div>
                    </div>

                    {/* Capacidad y Distribución */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-gray-200">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                          <Bed size={13} className="text-brand-sage" />
                          <span>Habitaciones</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={formAlojamiento.habitaciones}
                          onChange={(e) => setFormAlojamiento({ ...formAlojamiento, habitaciones: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                          <Bath size={13} className="text-brand-sage" />
                          <span>Baños</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          step={0.5}
                          value={formAlojamiento.banos}
                          onChange={(e) => setFormAlojamiento({ ...formAlojamiento, banos: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                          <Bed size={13} className="text-brand-sage" />
                          <span>Camas</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={formAlojamiento.camas}
                          onChange={(e) => setFormAlojamiento({ ...formAlojamiento, camas: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                          <Users size={13} className="text-brand-sage" />
                          <span>Huéspedes Máx.</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={formAlojamiento.maxHuespedes}
                          onChange={(e) => setFormAlojamiento({ ...formAlojamiento, maxHuespedes: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900"
                        />
                      </div>
                    </div>

                    {/* Tabla de Checklist de Lo que Ofrece el Alojamiento */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                          <Sparkles size={14} className="text-brand-sage" />
                          <span>Lo Que Ofrece Este Alojamiento (Checklist)</span>
                        </label>
                        <span className="text-[11px] text-gray-500 font-semibold">
                          {formAlojamiento.amenidades.length} seleccionadas
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {AMENIDADES_DISPONIBLES.map((item) => {
                          const isSelected = formAlojamiento.amenidades.includes(item.label)
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleToggleAmenidad(item.label)}
                              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                                isSelected
                                  ? "bg-emerald-50/70 border-emerald-400 text-emerald-950 font-bold shadow-sm"
                                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-lg">{item.icon}</span>
                                <span className="text-xs">{item.label}</span>
                              </div>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                                isSelected ? "bg-emerald-600 text-white" : "border border-gray-300 bg-gray-50"
                              }`}>
                                {isSelected && <Check size={12} strokeWidth={3} />}
                              </div>
                            </button>
                          )
                        })}
                      </div>

                      {/* Agregar amenidad extra personalizada */}
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Agregar otra amenidad personalizada (Ej: Sauna seco, Mesa de billar...)"
                          value={formAlojamiento.nuevaAmenidad}
                          onChange={(e) => setFormAlojamiento({ ...formAlojamiento, nuevaAmenidad: e.target.value })}
                          className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddCustomAmenidad()
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomAmenidad}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors"
                        >
                          + Añadir
                        </button>
                      </div>
                    </div>

                    {/* Descripción y Reglas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                          Descripción de la Estadía
                        </label>
                        <textarea
                          rows={4}
                          value={formAlojamiento.descripcion}
                          onChange={(e) => setFormAlojamiento({ ...formAlojamiento, descripcion: e.target.value })}
                          placeholder="Describe las virtudes del inmueble, vistas, acabados, cercanía a servicios..."
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                          Reglas del Alojamiento (1 por línea)
                        </label>
                        <textarea
                          rows={4}
                          value={formAlojamiento.reglasTexto}
                          onChange={(e) => setFormAlojamiento({ ...formAlojamiento, reglasTexto: e.target.value })}
                          placeholder="Check-in: 15:00 a 22:00&#10;Check-out: 11:00&#10;No se permiten fiestas&#10;No fumar"
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs leading-relaxed font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* VIÑETA 5: TARIFAS & MODELO DE COMISIÓN SARA */}
                {/* ========================================================= */}
                {modalTab === "tarifas" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <div>
                        <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                          <DollarSign size={16} className="text-brand-sage" />
                          Tarifas al Público y Modelo Comercial de Intermediación SARA
                        </h4>
                        <p className="text-xs text-gray-500">
                          Establece los precios por noche y de limpieza, y define el porcentaje de retención de SARA por reserva.
                        </p>
                      </div>
                    </div>

                    {/* Precios Base */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-gray-200">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Tarifa por Noche ($ USD) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">$</span>
                          <input
                            type="number"
                            required
                            min={10}
                            value={formAlojamiento.precioNoche}
                            onChange={(e) => setFormAlojamiento({ ...formAlojamiento, precioNoche: Number(e.target.value) })}
                            className="w-full pl-7 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-black text-gray-900 focus:ring-2 focus:ring-brand-sage"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Tarifa de Limpieza ($ USD) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">$</span>
                          <input
                            type="number"
                            required
                            min={0}
                            value={formAlojamiento.tarifaLimpieza}
                            onChange={(e) => setFormAlojamiento({ ...formAlojamiento, tarifaLimpieza: Number(e.target.value) })}
                            className="w-full pl-7 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:ring-2 focus:ring-brand-sage"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Modelo Comercial y Retención SARA */}
                    <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                        <TrendingUp size={14} className="text-emerald-700" />
                        <span>Modelo de Monetización SARA</span>
                      </h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Modelo de Cobro SARA</label>
                          <select
                            value={formAlojamiento.modeloMonetizacion}
                            onChange={(e) => {
                              const modelo = e.target.value as any
                              setFormAlojamiento({
                                ...formAlojamiento,
                                modeloMonetizacion: modelo,
                                porcentajeComision: modelo === "gestion_completa" ? 20 : 15
                              })
                            }}
                            className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-gray-800"
                          >
                            <option value="comision_reserva">Comisión por Reserva Estándar (15%)</option>
                            <option value="gestion_completa">Gestión Integral SARA (20%)</option>
                            <option value="membresia_fija">Membresía Mensual Publicidad ($45/mes)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">% Retención Comisión SARA</label>
                          <input
                            type="number"
                            required
                            min={5}
                            max={50}
                            value={formAlojamiento.porcentajeComision}
                            onChange={(e) => setFormAlojamiento({ ...formAlojamiento, porcentajeComision: Number(e.target.value) })}
                            className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-xs font-extrabold text-emerald-900"
                          />
                        </div>
                      </div>

                      {/* Simulador Financiero en Tiempo Real */}
                      <div className="bg-white p-3.5 rounded-lg border border-emerald-200 space-y-2 mt-2">
                        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">
                          Simulación Financiera para Estancia de 3 Noches:
                        </span>

                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-slate-50 p-2 rounded border border-gray-100">
                            <span className="text-[10px] text-gray-500 block">Total Huésped</span>
                            <span className="font-extrabold text-gray-900">
                              ${(formAlojamiento.precioNoche * 3) + formAlojamiento.tarifaLimpieza}
                            </span>
                          </div>

                          <div className="bg-emerald-50 p-2 rounded border border-emerald-200">
                            <span className="text-[10px] text-emerald-700 font-bold block">
                              Comisión SARA ({formAlojamiento.porcentajeComision}%)
                            </span>
                            <span className="font-extrabold text-emerald-900">
                              +${(((formAlojamiento.precioNoche * 3) * formAlojamiento.porcentajeComision) / 100).toFixed(2)}
                            </span>
                          </div>

                          <div className="bg-blue-50 p-2 rounded border border-blue-200">
                            <span className="text-[10px] text-blue-700 font-bold block">Neto Propietario</span>
                            <span className="font-black text-blue-900">
                              ${((formAlojamiento.precioNoche * 3) - (((formAlojamiento.precioNoche * 3) * formAlojamiento.porcentajeComision) / 100) + formAlojamiento.tarifaLimpieza).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Fijo con Navegación y Botón Guardar */}
              <div className="p-4 border-t border-gray-200 bg-slate-50/80 rounded-b-2xl flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAlojamientoModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>

                <div className="flex items-center gap-2">
                  {modalTab !== "general" && (
                    <button
                      type="button"
                      onClick={() => {
                        if (modalTab === "tarifas") setModalTab("caracteristicas")
                        else if (modalTab === "caracteristicas") setModalTab("anfitrion")
                        else if (modalTab === "anfitrion") setModalTab("multimedia")
                        else if (modalTab === "multimedia") setModalTab("general")
                      }}
                      className="px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-1"
                    >
                      <ChevronLeft size={14} />
                      <span>Anterior</span>
                    </button>
                  )}

                  {modalTab !== "tarifas" ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (modalTab === "general") setModalTab("multimedia")
                        else if (modalTab === "multimedia") setModalTab("anfitrion")
                        else if (modalTab === "anfitrion") setModalTab("caracteristicas")
                        else if (modalTab === "caracteristicas") setModalTab("tarifas")
                      }}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs font-bold shadow transition-colors flex items-center gap-1"
                    >
                      <span>Siguiente</span>
                      <ChevronRight size={14} />
                    </button>
                  ) : null}

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-brand-sage hover:bg-brand-sage/90 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                  >
                    <Check size={16} />
                    <span>{editingAlojamiento ? "Guardar Cambios" : "Registrar Alojamiento"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
