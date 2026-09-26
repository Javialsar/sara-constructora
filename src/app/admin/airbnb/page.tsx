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
  Upload
} from "lucide-react"
import AirbnbCoordinatePickerWrapper from "@/components/ui/AirbnbCoordinatePickerWrapper"
import { exportarAExcel, exportarAPDF } from "@/lib/services/exportReports"

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

  // Pestaña Activa: "alojamientos" o "reservas"
  const [activeTab, setActiveTab] = useState<"alojamientos" | "reservas">("alojamientos")

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
    const comisionSara = (subtotalNoches * formReserva.porcentajeComisionSara) / 100
    const netoAnfitrion = totalHuesped - comisionSara - formReserva.tarifaLimpieza // El anfitrión recibe el subtotal de noches menos la comisión de gestión

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

    const msg = `Estimado(a) ${r.anfitrionNombre}, le enviamos la liquidación de su alojamiento *${r.alojamientoTitulo}* (Reserva ${r.codigoReserva}):
    
🗓 Fechas: ${r.fechaCheckIn} al ${r.fechaCheckOut} (${r.noches} noches)
👤 Huésped: ${r.huespedNombre} (${r.huespedPais})
💵 Subtotal Estancia: $${r.subtotalNoches}
🧹 Tarifa Limpieza: $${r.tarifaLimpieza}
📊 Total Cobrado Huésped: $${r.totalHuesped}

🏢 Retención Comisión SARA (${r.porcentajeComisionSara}%): -$${r.comisionGanadaSara}
✅ NETO A TRANSFERIR A SU CUENTA: $${r.netoParaAnfitrion}

${r.estadoLiquidacion === "liquidado" ? "💰 *ESTADO: TRANSFERIDO Y LIQUIDADO CON ÉXITO.*" : "⏳ *ESTADO: EN PROCESO DE TRANSFERENCIA BANCARIA.*"}
¡Gracias por confiar la administración y promoción de su alojamiento en SARA!`

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
            <h2 className="text-2xl font-bold text-gray-800">Gestión Airbnb & Liquidación de Comisiones</h2>
          </div>
          <p className="text-gray-500 text-sm mt-1 max-w-3xl">
            Control de alojamientos turísticos nacionales e internacionales, cobro de comisiones por reserva (15%-20%), membresías de promoción y liquidación a anfitriones.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            href="/airbnb"
            target="_blank"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all shadow-sm"
          >
            <ExternalLink size={16} />
            <span>Ver Portal Airbnb Público</span>
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

      {/* Selector de Pestañas: Alojamientos vs Reservas y Liquidaciones */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("alojamientos")}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
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
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "reservas"
              ? "border-brand-sage text-brand-dark"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Receipt size={16} />
          <span>Reservas & Liquidaciones de Comisión ({reservas.length})</span>
        </button>
      </div>

      {/* Filtros y Buscador */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={activeTab === "alojamientos" ? "Buscar por código, título, ciudad, anfitrión..." : "Buscar por código de reserva, huésped, anfitrión..."}
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
          ) : (
            <select
              value={filtroLiquidacion}
              onChange={(e) => setFiltroLiquidacion(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-sage"
            >
              <option value="todos">Todos los Estados de Liquidación</option>
              <option value="pendiente">⏳ Pendiente de Transferencia</option>
              <option value="liquidado">✅ Liquidado al Anfitrión</option>
            </select>
          )}

          {/* Botones Descargar Excel y PDF */}
          <button
            onClick={activeTab === "alojamientos" ? handleExportarAlojamientosExcel : handleExportarReservasExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Descargar datos en Microsoft Excel (.xlsx)"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" />
            <span>Descargar Excel</span>
          </button>

          <button
            onClick={activeTab === "alojamientos" ? handleExportarAlojamientosPDF : handleExportarReservasPDF}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Descargar reporte en formato PDF (.pdf)"
          >
            <FileText size={15} className="text-rose-600" />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>

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
              Cálculo automático: Cobro Huésped - Comisión SARA = Saldo Anfitrión
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 divide-y divide-gray-200">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Código / Huésped</th>
                  <th className="px-5 py-3.5">Alojamiento</th>
                  <th className="px-5 py-3.5">Estancia</th>
                  <th className="px-5 py-3.5">Total Huésped</th>
                  <th className="px-5 py-3.5">Comisión SARA</th>
                  <th className="px-5 py-3.5">Neto Anfitrión</th>
                  <th className="px-5 py-3.5 text-center">Estado Liquidación</th>
                  <th className="px-5 py-3.5 text-right">Comprobante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservasFiltradas.map((r) => {
                  const whatsappLink = getWhatsAppLiquidacionLink(r)

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

                      {/* Total Huésped */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-extrabold text-gray-900">${r.totalHuesped}</p>
                        <p className="text-[10px] text-gray-400">
                          (${r.subtotalNoches} + ${r.tarifaLimpieza} limp.)
                        </p>
                      </td>

                      {/* Comisión Ganada por SARA */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded">
                          +${r.comisionGanadaSara.toFixed(2)}
                        </span>
                        <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                          ({r.porcentajeComisionSara}% retenido)
                        </p>
                      </td>

                      {/* Saldo Neto para Anfitrión */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-black text-gray-900">${r.netoParaAnfitrion.toFixed(2)}</p>
                        <p className="text-[10px] text-gray-400">Por transferir</p>
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
