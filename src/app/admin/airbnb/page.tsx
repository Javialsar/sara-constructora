"use client"
import React, { useState, useMemo } from "react"
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
  ArrowRight,
  Send,
  Building,
  Tag,
  Star,
  FileCheck2,
  AlertCircle
} from "lucide-react"

export interface AirbnbAdminListing {
  id: string
  codigo: string
  titulo: string
  tipo: "suite" | "loft" | "penthouse" | "quinta" | "studio" | "villa"
  alcance: "nacional" | "internacional"
  pais: string
  bandera: string
  ciudad: string
  sector: string
  precioNoche: number
  tarifaLimpieza: number
  rating: number
  isSuperhost: boolean
  maxHuespedes: number
  imagenUrl: string
  publicado: boolean
  // Datos del Anfitrión / Dueño
  anfitrion: {
    nombre: string
    telefono: string
    email: string
    cuentaBancaria: string
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
}

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
    precioNoche: 48,
    tarifaLimpieza: 15,
    rating: 4.98,
    isSuperhost: true,
    maxHuespedes: 2,
    imagenUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80",
    publicado: true,
    anfitrion: {
      nombre: "Patricio Carrasco",
      telefono: "+593998765432",
      email: "patricio.carrasco@gmail.com",
      cuentaBancaria: "Banco Pichincha Ahorros 2201984532"
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
    precioNoche: 95,
    tarifaLimpieza: 25,
    rating: 5.0,
    isSuperhost: true,
    maxHuespedes: 6,
    imagenUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80",
    publicado: true,
    anfitrion: {
      nombre: "Sofía Arteaga",
      telefono: "+593991122334",
      email: "sofia.arteaga@hotmail.com",
      cuentaBancaria: "Banco de Guayaquil Corriente 0012398412"
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
    precioNoche: 140,
    tarifaLimpieza: 35,
    rating: 4.96,
    isSuperhost: false,
    maxHuespedes: 10,
    imagenUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80",
    publicado: true,
    anfitrion: {
      nombre: "Dr. Roberto Morales",
      telefono: "+593987654321",
      email: "roberto.morales@clinica.ec",
      cuentaBancaria: "Produbanco Ahorros 1205098734"
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
    precioNoche: 185,
    tarifaLimpieza: 60,
    rating: 4.97,
    isSuperhost: true,
    maxHuespedes: 4,
    imagenUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
    publicado: true,
    anfitrion: {
      nombre: "David Goldstein (Rep. Miami)",
      telefono: "+13055551234",
      email: "david.miami@properties.com",
      cuentaBancaria: "Chase Bank Wire 44029104"
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
    precioNoche: 145,
    tarifaLimpieza: 40,
    rating: 4.95,
    isSuperhost: true,
    maxHuespedes: 4,
    imagenUrl: "https://images.unsplash.com/photo-1502005229762-ee1b2da92e06?auto=format&fit=crop&w=600&q=80",
    publicado: true,
    anfitrion: {
      nombre: "Elena Serrano",
      telefono: "+34612345678",
      email: "elena.serrano@madrid.es",
      cuentaBancaria: "Santander IBAN ES912100"
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
  const [formAlojamiento, setFormAlojamiento] = useState({
    codigo: "",
    titulo: "",
    tipo: "suite" as AirbnbAdminListing["tipo"],
    alcance: "nacional" as AirbnbAdminListing["alcance"],
    pais: "Ecuador",
    bandera: "🇪🇨",
    ciudad: "Cuenca",
    sector: "",
    precioNoche: 50,
    tarifaLimpieza: 15,
    isSuperhost: true,
    maxHuespedes: 2,
    imagenUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80",
    publicado: true,
    anfitrionNombre: "",
    anfitrionTelefono: "+593 9",
    anfitrionEmail: "",
    anfitrionCuenta: "",
    modeloMonetizacion: "comision_reserva" as AirbnbAdminListing["monetizacion"]["modelo"],
    porcentajeComision: 15,
    cuotaFijaMensual: 45
  })

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
    setFormAlojamiento({
      codigo: nextCode,
      titulo: "",
      tipo: "suite",
      alcance: "nacional",
      pais: "Ecuador",
      bandera: "🇪🇨",
      ciudad: "Cuenca",
      sector: "Av. Ordóñez Lasso",
      precioNoche: 55,
      tarifaLimpieza: 20,
      isSuperhost: true,
      maxHuespedes: 2,
      imagenUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80",
      publicado: true,
      anfitrionNombre: "",
      anfitrionTelefono: "+593 9",
      anfitrionEmail: "",
      anfitrionCuenta: "Banco Pichincha Ahorros...",
      modeloMonetizacion: "comision_reserva",
      porcentajeComision: 15,
      cuotaFijaMensual: 45
    })
    setIsAlojamientoModalOpen(true)
  }

  // Abrir Modal Edición Alojamiento
  const handleOpenEditAlojamiento = (alj: AirbnbAdminListing) => {
    setEditingAlojamiento(alj)
    setFormAlojamiento({
      codigo: alj.codigo,
      titulo: alj.titulo,
      tipo: alj.tipo,
      alcance: alj.alcance,
      pais: alj.pais,
      bandera: alj.bandera,
      ciudad: alj.ciudad,
      sector: alj.sector,
      precioNoche: alj.precioNoche,
      tarifaLimpieza: alj.tarifaLimpieza,
      isSuperhost: alj.isSuperhost,
      maxHuespedes: alj.maxHuespedes,
      imagenUrl: alj.imagenUrl,
      publicado: alj.publicado,
      anfitrionNombre: alj.anfitrion.nombre,
      anfitrionTelefono: alj.anfitrion.telefono,
      anfitrionEmail: alj.anfitrion.email,
      anfitrionCuenta: alj.anfitrion.cuentaBancaria,
      modeloMonetizacion: alj.monetizacion.modelo,
      porcentajeComision: alj.monetizacion.porcentajeComision,
      cuotaFijaMensual: alj.monetizacion.cuotaFijaMensual || 45
    })
    setIsAlojamientoModalOpen(true)
  }

  // Guardar Alojamiento
  const handleSaveAlojamiento = (e: React.FormEvent) => {
    e.preventDefault()

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
            precioNoche: formAlojamiento.precioNoche,
            tarifaLimpieza: formAlojamiento.tarifaLimpieza,
            isSuperhost: formAlojamiento.isSuperhost,
            maxHuespedes: formAlojamiento.maxHuespedes,
            imagenUrl: formAlojamiento.imagenUrl,
            publicado: formAlojamiento.publicado,
            anfitrion: {
              nombre: formAlojamiento.anfitrionNombre,
              telefono: formAlojamiento.anfitrionTelefono,
              email: formAlojamiento.anfitrionEmail,
              cuentaBancaria: formAlojamiento.anfitrionCuenta
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
        precioNoche: formAlojamiento.precioNoche,
        tarifaLimpieza: formAlojamiento.tarifaLimpieza,
        rating: 5.0,
        isSuperhost: formAlojamiento.isSuperhost,
        maxHuespedes: formAlojamiento.maxHuespedes,
        imagenUrl: formAlojamiento.imagenUrl,
        publicado: formAlojamiento.publicado,
        anfitrion: {
          nombre: formAlojamiento.anfitrionNombre,
          telefono: formAlojamiento.anfitrionTelefono,
          email: formAlojamiento.anfitrionEmail,
          cuentaBancaria: formAlojamiento.anfitrionCuenta
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
                      <p className="text-xs text-gray-500">{alj.anfitrion.telefono}</p>
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
                        <span className="text-xs font-mono font-bold text-brand-dark bg-gray-100 px-1.5 py-0.5 rounded">
                          {r.codigoReserva}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm mt-1">{r.huespedNombre}</h4>
                        <p className="text-xs text-gray-500">{r.huespedPais}</p>
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
      {/* MODAL: NUEVO / EDITAR ALOJAMIENTO AIRBNB */}
      {/* ========================================================= */}
      {isAlojamientoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 relative my-8">
            <button
              onClick={() => setIsAlojamientoModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
              <div className="p-3 bg-brand-sage/10 text-brand-sage rounded-xl">
                <Building size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingAlojamiento ? "Editar Alojamiento Airbnb" : "Registrar Nuevo Alojamiento Airbnb"}
                </h3>
                <p className="text-xs text-gray-500">
                  Configura tarifas por noche, datos del anfitrión y comisión de intermediación de SARA.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveAlojamiento} className="space-y-4">
              {/* Sección 1: Datos del Alojamiento */}
              <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-brand-sage" />
                  1. Datos del Alojamiento
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Código</label>
                    <input
                      type="text"
                      required
                      value={formAlojamiento.codigo}
                      onChange={(e) => setFormAlojamiento({ ...formAlojamiento, codigo: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-800"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Título del Anuncio</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Master Suite de Diseño Frente al Río"
                      value={formAlojamiento.titulo}
                      onChange={(e) => setFormAlojamiento({ ...formAlojamiento, titulo: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Alcance</label>
                    <select
                      value={formAlojamiento.alcance}
                      onChange={(e) => setFormAlojamiento({ 
                        ...formAlojamiento, 
                        alcance: e.target.value as any,
                        pais: e.target.value === "nacional" ? "Ecuador" : "Estados Unidos",
                        bandera: e.target.value === "nacional" ? "🇪🇨" : "🇺🇸"
                      })}
                      className="w-full px-2.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold"
                    >
                      <option value="nacional">🇪🇨 Nacional</option>
                      <option value="internacional">🌎 Internacional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo</label>
                    <select
                      value={formAlojamiento.tipo}
                      onChange={(e) => setFormAlojamiento({ ...formAlojamiento, tipo: e.target.value as any })}
                      className="w-full px-2.5 py-2 bg-white border border-gray-300 rounded-lg text-xs"
                    >
                      <option value="suite">Suite</option>
                      <option value="loft">Loft</option>
                      <option value="penthouse">Penthouse</option>
                      <option value="quinta">Quinta</option>
                      <option value="villa">Villa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tarifa Noche ($)</label>
                    <input
                      type="number"
                      required
                      value={formAlojamiento.precioNoche}
                      onChange={(e) => setFormAlojamiento({ ...formAlojamiento, precioNoche: Number(e.target.value) })}
                      className="w-full px-2.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tarifa Limpieza ($)</label>
                    <input
                      type="number"
                      required
                      value={formAlojamiento.tarifaLimpieza}
                      onChange={(e) => setFormAlojamiento({ ...formAlojamiento, tarifaLimpieza: Number(e.target.value) })}
                      className="w-full px-2.5 py-2 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Ciudad</label>
                    <input
                      type="text"
                      required
                      value={formAlojamiento.ciudad}
                      onChange={(e) => setFormAlojamiento({ ...formAlojamiento, ciudad: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Sector</label>
                    <input
                      type="text"
                      required
                      value={formAlojamiento.sector}
                      onChange={(e) => setFormAlojamiento({ ...formAlojamiento, sector: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">URL Foto Principal</label>
                    <input
                      type="url"
                      required
                      value={formAlojamiento.imagenUrl}
                      onChange={(e) => setFormAlojamiento({ ...formAlojamiento, imagenUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Anfitrión y Datos Bancarios */}
              <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <Users size={14} className="text-brand-sage" />
                  2. Datos del Anfitrión & Cuenta para Liquidaciones
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Patricio Carrasco"
                      value={formAlojamiento.anfitrionNombre}
                      onChange={(e) => setFormAlojamiento({ ...formAlojamiento, anfitrionNombre: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">WhatsApp de Contacto</label>
                    <input
                      type="tel"
                      required
                      placeholder="+593 99 876 5432"
                      value={formAlojamiento.anfitrionTelefono}
                      onChange={(e) => setFormAlojamiento({ ...formAlojamiento, anfitrionTelefono: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Cuenta Bancaria para Pagos</label>
                    <input
                      type="text"
                      required
                      placeholder="Banco Pichincha Ahorros 220..."
                      value={formAlojamiento.anfitrionCuenta}
                      onChange={(e) => setFormAlojamiento({ ...formAlojamiento, anfitrionCuenta: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 3: Modelo de Comisión SARA */}
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <DollarSign size={14} className="text-emerald-700" />
                  3. Modelo de Cobro SARA (Comisión por Reserva)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Modelo Comercial</label>
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
                    <label className="block text-xs font-semibold text-gray-700 mb-1">% Comisión Retenida por SARA</label>
                    <input
                      type="number"
                      required
                      value={formAlojamiento.porcentajeComision}
                      onChange={(e) => setFormAlojamiento({ ...formAlojamiento, porcentajeComision: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-xs font-extrabold text-emerald-900"
                    />
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAlojamientoModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-sage hover:bg-brand-sage/90 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check size={16} />
                  <span>{editingAlojamiento ? "Guardar Cambios" : "Registrar Alojamiento"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
