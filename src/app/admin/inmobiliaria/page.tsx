"use client"
import React, { useState, useMemo } from "react"
import Link from "next/link"
import { 
  Building2, 
  Search, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
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
  Sparkles, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Download,
  Tag,
  Home,
  MapPin,
  Check,
  ChevronDown,
  FileSpreadsheet,
  FileText
} from "lucide-react"
import { exportarAExcel, exportarAPDF } from "@/lib/services/exportReports"

export interface InmuebleAdmin {
  id: string
  codigo: string
  titulo: string
  tipo: "casa" | "departamento" | "terreno" | "suite" | "local" | "quinta"
  modalidad: "venta" | "arriendo"
  precio: number
  ciudad: string
  sector: string
  areaM2: number
  habitaciones: number
  banos: number
  imagenUrl: string
  publicado: boolean
  destacado: boolean
  // Información del Propietario
  propietario: {
    nombre: string
    telefono: string
    email: string
  }
  // Monetización y Promoción SARA
  promocion: {
    plan: "basico" | "destacado" | "premium" | "comision"
    nombrePlan: string
    tarifaMensual: number
    porcentajeComision?: number
    fechaInicio: string
    fechaVencimiento: string
    estadoPago: "al_dia" | "por_vencer" | "vencido"
    ultimoMontoPagado: number
    metodoPago: string
    totalRecaudado: number
  }
}

const INMUEBLES_INICIALES: InmuebleAdmin[] = [
  {
    id: "inm-1",
    codigo: "SARA-CAS-01",
    titulo: "Casa de Lujo en Challuabamba con Jardín Privado",
    tipo: "casa",
    modalidad: "venta",
    precio: 285000,
    ciudad: "Cuenca",
    sector: "Challuabamba",
    areaM2: 520,
    habitaciones: 4,
    banos: 4.5,
    imagenUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    publicado: true,
    destacado: true,
    propietario: {
      nombre: "Ing. Carlos Vintimilla",
      telefono: "+593998123456",
      email: "carlos.vintimilla@email.com"
    },
    promocion: {
      plan: "premium",
      nombrePlan: "Plan Premium Exclusiva",
      tarifaMensual: 120,
      porcentajeComision: 3,
      fechaInicio: "2026-08-01",
      fechaVencimiento: "2026-10-01",
      estadoPago: "al_dia",
      ultimoMontoPagado: 120,
      metodoPago: "Transferencia Banco Pichincha",
      totalRecaudado: 240
    }
  },
  {
    id: "inm-2",
    codigo: "SARA-DEP-02",
    titulo: "Departamento Panorámico Frente al Río Tomebamba",
    tipo: "departamento",
    modalidad: "venta",
    precio: 148000,
    ciudad: "Cuenca",
    sector: "Puertas del Sol",
    areaM2: 145,
    habitaciones: 3,
    banos: 2.5,
    imagenUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    publicado: true,
    destacado: true,
    propietario: {
      nombre: "Dra. Mariana Cordero",
      telefono: "+593997654321",
      email: "mariana.cordero@medico.ec"
    },
    promocion: {
      plan: "destacado",
      nombrePlan: "Plan Destacado",
      tarifaMensual: 65,
      porcentajeComision: 3.5,
      fechaInicio: "2026-08-15",
      fechaVencimiento: "2026-09-30",
      estadoPago: "por_vencer",
      ultimoMontoPagado: 65,
      metodoPago: "Transferencia Banco Guayaquil",
      totalRecaudado: 130
    }
  },
  {
    id: "inm-3",
    codigo: "SARA-TER-03",
    titulo: "Lote Urbanizado Residencial con Vista a la Ciudad",
    tipo: "terreno",
    modalidad: "venta",
    precio: 92000,
    ciudad: "Cuenca",
    sector: "Turi",
    areaM2: 480,
    habitaciones: 0,
    banos: 0,
    imagenUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80",
    publicado: true,
    destacado: false,
    propietario: {
      nombre: "Arq. Marcelo Álvarez",
      telefono: "+593984567890",
      email: "marcelo.alvarez@diseno.ec"
    },
    promocion: {
      plan: "basico",
      nombrePlan: "Plan Básico",
      tarifaMensual: 35,
      porcentajeComision: 4,
      fechaInicio: "2026-07-10",
      fechaVencimiento: "2026-09-10",
      estadoPago: "vencido",
      ultimoMontoPagado: 35,
      metodoPago: "Efectivo",
      totalRecaudado: 70
    }
  },
  {
    id: "inm-4",
    codigo: "SARA-CAS-04",
    titulo: "Quinta Campestre Moderna con Piscina Climatizada",
    tipo: "quinta",
    modalidad: "venta",
    precio: 340000,
    ciudad: "Yunguilla",
    sector: "Léntag",
    areaM2: 1200,
    habitaciones: 5,
    banos: 5,
    imagenUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80",
    publicado: true,
    destacado: true,
    propietario: {
      nombre: "Abg. Fernando Pesántez",
      telefono: "+593991223344",
      email: "fernando.pesantez@abogados.ec"
    },
    promocion: {
      plan: "premium",
      nombrePlan: "Plan Premium Exclusiva",
      tarifaMensual: 120,
      porcentajeComision: 3,
      fechaInicio: "2026-09-01",
      fechaVencimiento: "2026-11-01",
      estadoPago: "al_dia",
      ultimoMontoPagado: 240,
      metodoPago: "Tarjeta de Crédito",
      totalRecaudado: 240
    }
  },
  {
    id: "inm-5",
    codigo: "SARA-ARR-05",
    titulo: "Suite Amoblada de Alta Gama en el Centro Histórico",
    tipo: "suite",
    modalidad: "arriendo",
    precio: 650,
    ciudad: "Cuenca",
    sector: "San Blas",
    areaM2: 75,
    habitaciones: 1,
    banos: 1.5,
    imagenUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
    publicado: true,
    destacado: false,
    propietario: {
      nombre: "Lic. Lucía Carrión",
      telefono: "+593983344556",
      email: "lucia.carrion@email.com"
    },
    promocion: {
      plan: "destacado",
      nombrePlan: "Plan Destacado",
      tarifaMensual: 45,
      fechaInicio: "2026-08-20",
      fechaVencimiento: "2026-10-20",
      estadoPago: "al_dia",
      ultimoMontoPagado: 45,
      metodoPago: "Transferencia Banco Pichincha",
      totalRecaudado: 90
    }
  }
]

export default function AdminInmobiliariaPage() {
  const [inmuebles, setInmuebles] = useState<InmuebleAdmin[]>(INMUEBLES_INICIALES)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
  const [filtroModalidad, setFiltroModalidad] = useState<string>("todos")
  const [filtroPago, setFiltroPago] = useState<string>("todos")

  // Modal para Nuevo/Editar Inmueble
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInmueble, setEditingInmueble] = useState<InmuebleAdmin | null>(null)

  // Modal para Registrar Cobro / Renovar Plan de Promoción
  const [isCobroModalOpen, setIsCobroModalOpen] = useState(false)
  const [selectedInmuebleForCobro, setSelectedInmuebleForCobro] = useState<InmuebleAdmin | null>(null)
  const [mesesRenovacion, setMesesRenovacion] = useState<number>(1)
  const [metodoPagoCobro, setMetodoPagoCobro] = useState<string>("Transferencia Banco Pichincha")
  const [montoCobradoInput, setMontoCobradoInput] = useState<number>(65)

  // Form State para Inmueble
  const [formInmueble, setFormInmueble] = useState({
    codigo: "",
    titulo: "",
    tipo: "casa" as InmuebleAdmin["tipo"],
    modalidad: "venta" as InmuebleAdmin["modalidad"],
    precio: 150000,
    ciudad: "Cuenca",
    sector: "",
    areaM2: 120,
    habitaciones: 3,
    banos: 2,
    imagenUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    destacado: false,
    publicado: true,
    propietarioNombre: "",
    propietarioTelefono: "+593",
    propietarioEmail: "",
    planPromocion: "destacado" as InmuebleAdmin["promocion"]["plan"],
    tarifaMensual: 65,
    porcentajeComision: 3
  })

  // Cálculos Financieros y Estadísticas en tiempo real
  const stats = useMemo(() => {
    const totalInmuebles = inmuebles.length
    const activos = inmuebles.filter(i => i.publicado).length
    const alDia = inmuebles.filter(i => i.promocion.estadoPago === "al_dia").length
    const porVencer = inmuebles.filter(i => i.promocion.estadoPago === "por_vencer").length
    const vencidos = inmuebles.filter(i => i.promocion.estadoPago === "vencido").length

    // Total recaudado acumulado por SARA
    const totalRecaudadoAcumulado = inmuebles.reduce((acc, curr) => acc + curr.promocion.totalRecaudado, 0)
    // Ingresos mensuales proyectados por los planes vigentes
    const facturacionMensualProyectada = inmuebles
      .filter(i => i.publicado && i.promocion.estadoPago !== "vencido")
      .reduce((acc, curr) => acc + curr.promocion.tarifaMensual, 0)

    return {
      totalInmuebles,
      activos,
      alDia,
      porVencer,
      vencidos,
      totalRecaudadoAcumulado,
      facturacionMensualProyectada
    }
  }, [inmuebles])

  // Filtrado de la tabla
  const inmueblesFiltrados = useMemo(() => {
    return inmuebles.filter(inm => {
      const matchSearch = 
        inm.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inm.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inm.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inm.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inm.propietario.nombre.toLowerCase().includes(searchTerm.toLowerCase())

      const matchTipo = filtroTipo === "todos" || inm.tipo === filtroTipo
      const matchModalidad = filtroModalidad === "todos" || inm.modalidad === filtroModalidad
      const matchPago = filtroPago === "todos" || inm.promocion.estadoPago === filtroPago

      return matchSearch && matchTipo && matchModalidad && matchPago
    })
  }, [inmuebles, searchTerm, filtroTipo, filtroModalidad, filtroPago])

  // Abrir Modal de Nuevo Inmueble
  const handleOpenNewModal = () => {
    const nextNum = inmuebles.length + 1
    const nextCode = `SARA-INM-0${nextNum}`
    setEditingInmueble(null)
    setFormInmueble({
      codigo: nextCode,
      titulo: "",
      tipo: "casa",
      modalidad: "venta",
      precio: 180000,
      ciudad: "Cuenca",
      sector: "Av. Solano",
      areaM2: 180,
      habitaciones: 3,
      banos: 2.5,
      imagenUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
      destacado: true,
      publicado: true,
      propietarioNombre: "",
      propietarioTelefono: "+593 9",
      propietarioEmail: "",
      planPromocion: "destacado",
      tarifaMensual: 65,
      porcentajeComision: 3
    })
    setIsModalOpen(true)
  }

  // Abrir Modal de Edición
  const handleOpenEditModal = (inm: InmuebleAdmin) => {
    setEditingInmueble(inm)
    setFormInmueble({
      codigo: inm.codigo,
      titulo: inm.titulo,
      tipo: inm.tipo,
      modalidad: inm.modalidad,
      precio: inm.precio,
      ciudad: inm.ciudad,
      sector: inm.sector,
      areaM2: inm.areaM2,
      habitaciones: inm.habitaciones,
      banos: inm.banos,
      imagenUrl: inm.imagenUrl,
      destacado: inm.destacado,
      publicado: inm.publicado,
      propietarioNombre: inm.propietario.nombre,
      propietarioTelefono: inm.propietario.telefono,
      propietarioEmail: inm.propietario.email,
      planPromocion: inm.promocion.plan,
      tarifaMensual: inm.promocion.tarifaMensual,
      porcentajeComision: inm.promocion.porcentajeComision || 3
    })
    setIsModalOpen(true)
  }

  // Guardar Inmueble (Crear o Actualizar)
  const handleSaveInmueble = (e: React.FormEvent) => {
    e.preventDefault()

    const nombrePlanMap = {
      basico: "Plan Básico ($35/mes)",
      destacado: "Plan Destacado ($65/mes)",
      premium: "Plan Premium Exclusiva ($120/mes)",
      comision: "Sólo Comisión de Éxito (3%)"
    }

    if (editingInmueble) {
      // Actualizar existente
      setInmuebles(prev => prev.map(item => {
        if (item.id === editingInmueble.id) {
          return {
            ...item,
            codigo: formInmueble.codigo,
            titulo: formInmueble.titulo,
            tipo: formInmueble.tipo,
            modalidad: formInmueble.modalidad,
            precio: formInmueble.precio,
            ciudad: formInmueble.ciudad,
            sector: formInmueble.sector,
            areaM2: formInmueble.areaM2,
            habitaciones: formInmueble.habitaciones,
            banos: formInmueble.banos,
            imagenUrl: formInmueble.imagenUrl,
            destacado: formInmueble.destacado,
            publicado: formInmueble.publicado,
            propietario: {
              nombre: formInmueble.propietarioNombre,
              telefono: formInmueble.propietarioTelefono,
              email: formInmueble.propietarioEmail
            },
            promocion: {
              ...item.promocion,
              plan: formInmueble.planPromocion,
              nombrePlan: nombrePlanMap[formInmueble.planPromocion],
              tarifaMensual: formInmueble.tarifaMensual,
              porcentajeComision: formInmueble.porcentajeComision
            }
          }
        }
        return item
      }))
    } else {
      // Crear nuevo
      const hoy = new Date()
      const fechaVenc = new Date(hoy)
      fechaVenc.setDate(fechaVenc.getDate() + 30)

      const nuevo: InmuebleAdmin = {
        id: `inm-${Date.now()}`,
        codigo: formInmueble.codigo,
        titulo: formInmueble.titulo,
        tipo: formInmueble.tipo,
        modalidad: formInmueble.modalidad,
        precio: formInmueble.precio,
        ciudad: formInmueble.ciudad,
        sector: formInmueble.sector,
        areaM2: formInmueble.areaM2,
        habitaciones: formInmueble.habitaciones,
        banos: formInmueble.banos,
        imagenUrl: formInmueble.imagenUrl,
        destacado: formInmueble.destacado,
        publicado: formInmueble.publicado,
        propietario: {
          nombre: formInmueble.propietarioNombre,
          telefono: formInmueble.propietarioTelefono,
          email: formInmueble.propietarioEmail
        },
        promocion: {
          plan: formInmueble.planPromocion,
          nombrePlan: nombrePlanMap[formInmueble.planPromocion],
          tarifaMensual: formInmueble.tarifaMensual,
          porcentajeComision: formInmueble.porcentajeComision,
          fechaInicio: hoy.toISOString().split("T")[0],
          fechaVencimiento: fechaVenc.toISOString().split("T")[0],
          estadoPago: "al_dia",
          ultimoMontoPagado: formInmueble.tarifaMensual,
          metodoPago: "Transferencia Inicial",
          totalRecaudado: formInmueble.tarifaMensual
        }
      }
      setInmuebles(prev => [nuevo, ...prev])
    }

    setIsModalOpen(false)
  }

  // Eliminar Inmueble
  const handleDeleteInmueble = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este inmueble y su registro de promoción publicitaria?")) {
      setInmuebles(prev => prev.filter(i => i.id !== id))
    }
  }

  // Toggle Publicado / Pausado (por ejemplo, suspensión por falta de pago)
  const handleTogglePublicado = (id: string) => {
    setInmuebles(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, publicado: !item.publicado }
      }
      return item
    }))
  }

  // Abrir Modal para Registrar Cobro de Cuota de Promoción
  const handleOpenCobroModal = (inm: InmuebleAdmin) => {
    setSelectedInmuebleForCobro(inm)
    setMesesRenovacion(1)
    setMontoCobradoInput(inm.promocion.tarifaMensual)
    setMetodoPagoCobro("Transferencia Banco Pichincha")
    setIsCobroModalOpen(true)
  }

  // Confirmar Cobro y Extender Fecha de Promoción
  const handleConfirmarCobro = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInmuebleForCobro) return

    const diasAdicionales = mesesRenovacion * 30
    const fechaActual = new Date()
    const nuevaFechaVencimiento = new Date(fechaActual)
    nuevaFechaVencimiento.setDate(nuevaFechaVencimiento.getDate() + diasAdicionales)
    const fechaVencString = nuevaFechaVencimiento.toISOString().split("T")[0]

    setInmuebles(prev => prev.map(item => {
      if (item.id === selectedInmuebleForCobro.id) {
        return {
          ...item,
          publicado: true, // Si estaba pausado, se reactiva de inmediato al pagar
          promocion: {
            ...item.promocion,
            fechaVencimiento: fechaVencString,
            estadoPago: "al_dia",
            ultimoMontoPagado: montoCobradoInput,
            metodoPago: metodoPagoCobro,
            totalRecaudado: item.promocion.totalRecaudado + montoCobradoInput
          }
        }
      }
      return item
    }))

    setIsCobroModalOpen(false)
    alert(`¡Cobro de $${montoCobradoInput} registrado con éxito! La promoción de "${selectedInmuebleForCobro.titulo}" ha sido extendida por ${mesesRenovacion} mes(es) hasta el ${fechaVencString}.`)
  }

  // Generador de Enlace WhatsApp para Cobranza / Comprobante
  const getWhatsAppCobroLink = (inm: InmuebleAdmin) => {
    const rawPhone = inm.propietario.telefono.replace(/[^0-9]/g, "")
    const phoneWithCode = rawPhone.startsWith("593") ? rawPhone : `593${rawPhone.replace(/^0/, "")}`
    
    let msg = ""
    if (inm.promocion.estadoPago === "vencido") {
      msg = `Estimado(a) ${inm.propietario.nombre}, le saludamos cordialmente desde SARA Constructora e Inmobiliaria. Le recordamos que la cuota de promoción y difusión de su propiedad *${inm.titulo}* (Cód. ${inm.codigo}) por valor de $${inm.promocion.tarifaMensual} ha vencido el ${inm.promocion.fechaVencimiento}. Para mantener activa la difusión en nuestro portal, campañas de redes sociales y catálogo de inversionistas, por favor facilítenos el comprobante de renovación. ¡Estamos atentos para servirle!`
    } else if (inm.promocion.estadoPago === "por_vencer") {
      msg = `Hola ${inm.propietario.nombre}, un cordial saludo de SARA Inmobiliaria. Le informamos que su plan de promoción activa para el inmueble *${inm.titulo}* está próximo a vencer el ${inm.promocion.fechaVencimiento}. El valor de renovación por 30 días es de $${inm.promocion.tarifaMensual}. ¿Desea mantenerlo destacado?`
    } else {
      msg = `Hola ${inm.propietario.nombre}, desde SARA Inmobiliaria le compartimos que su propiedad *${inm.titulo}* (Cód. ${inm.codigo}) se encuentra con promoción activa y al día hasta el ${inm.promocion.fechaVencimiento}. Hemos tenido excelente tráfico de clientes interesados en su sector.`
    }

    return `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(msg)}`
  }

  // Exportar Reporte Inmobiliario a Excel
  const handleExportarExcel = () => {
    const dataFormatted = inmueblesFiltrados.map(inm => ({
      "Código": inm.codigo,
      "Título de la Propiedad": inm.titulo,
      "Tipo": inm.tipo.toUpperCase(),
      "Modalidad": inm.modalidad.toUpperCase(),
      "Precio ($ USD)": inm.precio,
      "Ciudad": inm.ciudad,
      "Sector": inm.sector,
      "Área (m²)": inm.areaM2,
      "Habitaciones": inm.habitaciones,
      "Baños": inm.banos,
      "Propietario": inm.propietario.nombre,
      "Contacto Propietario": inm.propietario.telefono,
      "Email Propietario": inm.propietario.email,
      "Plan de Promoción": inm.promocion.nombrePlan,
      "Cuota Mensual ($)": inm.promocion.tarifaMensual,
      "Estado de Pago": inm.promocion.estadoPago === "al_dia" ? "Al Día" : inm.promocion.estadoPago === "por_vencer" ? "Por Vencer" : "Vencido",
      "Total Recaudado ($)": inm.promocion.totalRecaudado,
      "Publicado": inm.publicado ? "Sí" : "No"
    }))
    exportarAExcel(dataFormatted, "Reporte_Inventario_Inmobiliario_SARA", "Inmuebles SARA")
  }

  // Exportar Reporte Inmobiliario a PDF
  const handleExportarPDF = () => {
    const headers = ["Código", "Propiedad", "Tipo/Mod.", "Precio", "Ubicación", "Propietario", "Plan Promoción", "Estado Pago"]
    const rows = inmueblesFiltrados.map(inm => [
      inm.codigo,
      inm.titulo.length > 25 ? inm.titulo.substring(0, 25) + "..." : inm.titulo,
      `${inm.tipo.toUpperCase()} (${inm.modalidad.toUpperCase()})`,
      `$${inm.precio.toLocaleString()}`,
      `${inm.ciudad} - ${inm.sector}`,
      inm.propietario.nombre,
      `$${inm.promocion.tarifaMensual}/mes`,
      inm.promocion.estadoPago === "al_dia" ? "Al Día" : inm.promocion.estadoPago === "por_vencer" ? "Por Vencer" : "Vencido"
    ])
    exportarAPDF(
      "REPORTE DE INVENTARIO INMOBILIARIO & PROPIEDADES SARA",
      headers,
      rows,
      "Reporte_Inmuebles_SARA",
      `Generado: ${new Date().toLocaleDateString('es-EC')} | Total propiedades listadas: ${inmueblesFiltrados.length}`
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Principal con Botón de Creación */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-brand-sage/10 text-brand-sage rounded-lg">
              <Building2 size={24} />
            </span>
            <h2 className="text-2xl font-bold text-gray-800">Gestión Inmobiliaria & Cobros de Promoción</h2>
          </div>
          <p className="text-gray-500 text-sm mt-1 max-w-3xl">
            Administra el portafolio de inmuebles en venta y arriendo, supervisa las cuotas publicitarias cobradas a los propietarios y gestiona la activación comercial de cada propiedad.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            href="/inmobiliaria"
            target="_blank"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all shadow-sm"
          >
            <ExternalLink size={16} />
            <span>Ver Portal Público</span>
          </Link>

          <button
            onClick={handleOpenNewModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-sage hover:bg-brand-sage/90 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg"
          >
            <Plus size={18} />
            <span>Publicar Inmueble y Asignar Cobro</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Métricas Financieras de Promoción SARA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recaudación Total */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Recaudado en Promociones</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">${stats.totalRecaudadoAcumulado.toLocaleString()}</h3>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp size={14} /> Facturación cobrada por planes
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Facturación Mensual Proyectada */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-blue-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Ingresos Mensuales Activos</p>
            <h3 className="text-2xl font-black text-blue-900 mt-1">${stats.facturacionMensualProyectada.toLocaleString()} <span className="text-xs font-normal text-gray-400">/ mes</span></h3>
            <p className="text-xs text-blue-600 font-semibold mt-1">
              {stats.alDia} propietarios al día
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Receipt size={24} />
          </div>
        </div>

        {/* Inmuebles Activos */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-brand-sage flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Inmuebles en Catálogo</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.activos} <span className="text-xs font-normal text-gray-400">de {stats.totalInmuebles}</span></h3>
            <p className="text-xs text-brand-sage font-semibold mt-1">
              {stats.totalInmuebles - stats.activos} pausados por falta de pago
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-sage/10 text-brand-sage flex items-center justify-center">
            <Home size={24} />
          </div>
        </div>

        {/* Cobros Pendientes y Vencidos */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-amber-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Cobros por Vencer / Vencidos</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{stats.porVencer + stats.vencidos}</h3>
            <p className="text-xs text-red-500 font-semibold mt-1">
              {stats.vencidos} vencidos ({stats.porVencer} en alerta)
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Banner Informativo de Tarifas de Promoción SARA */}
      <div className="bg-gradient-to-r from-brand-dark to-slate-800 text-white rounded-xl p-5 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="text-yellow-400" size={20} />
            <h4 className="font-bold text-base text-yellow-300">Modelo de Cobro por Promoción Inmobiliaria SARA</h4>
          </div>
          <p className="text-xs text-gray-300 max-w-3xl">
            SARA monetiza cobrando una cuota fija de pauta mensual a los propietarios para mantener sus propiedades visibles con prioridad y campañas digitales, más una comisión de éxito del 3% al 4% al concretar la venta:
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto shrink-0 text-center">
          <div className="bg-white/10 px-3 py-2 rounded-lg border border-white/10">
            <p className="text-[10px] text-gray-300 uppercase font-semibold">Plan Básico</p>
            <p className="text-base font-extrabold text-white">$35 <span className="text-[10px] font-normal text-gray-300">/mes</span></p>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded-lg border border-white/10">
            <p className="text-[10px] text-yellow-300 uppercase font-semibold">Plan Destacado</p>
            <p className="text-base font-extrabold text-white">$65 <span className="text-[10px] font-normal text-gray-300">/mes</span></p>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded-lg border border-white/10">
            <p className="text-[10px] text-emerald-300 uppercase font-semibold">Plan Premium</p>
            <p className="text-base font-extrabold text-white">$120 <span className="text-[10px] font-normal text-gray-300">/mes</span></p>
          </div>
          <div className="bg-white/10 px-3 py-2 rounded-lg border border-white/10">
            <p className="text-[10px] text-indigo-300 uppercase font-semibold">Comisión Éxito</p>
            <p className="text-base font-extrabold text-white">3% - 4%</p>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Buscador */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por código, título, propietario, ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage focus:bg-white transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Selectores de Filtro */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Filtro Estado de Pago de Promoción */}
            <select
              value={filtroPago}
              onChange={(e) => setFiltroPago(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-sage"
            >
              <option value="todos">Todos los Estados de Pago</option>
              <option value="al_dia">🟢 Al Día</option>
              <option value="por_vencer">🟡 Por Vencer (&lt; 7 días)</option>
              <option value="vencido">🔴 Vencido / Cuota Pendiente</option>
            </select>

            {/* Filtro Modalidad */}
            <select
              value={filtroModalidad}
              onChange={(e) => setFiltroModalidad(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-sage"
            >
              <option value="todos">Venta y Arriendo</option>
              <option value="venta">Solo Venta</option>
              <option value="arriendo">Solo Arriendo</option>
            </select>

            {/* Filtro Tipo */}
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-sage"
            >
              <option value="todos">Todos los Tipos</option>
              <option value="casa">Casas</option>
              <option value="departamento">Departamentos</option>
              <option value="terreno">Terrenos</option>
              <option value="quinta">Quintas</option>
              <option value="suite">Suites</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Inmuebles & Monitoreo de Cobros */}
      <div className="bg-white rounded-xl shadow border border-gray-200 border-t-4 border-t-brand-sage overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
              <span>Listado de Inmuebles ({inmueblesFiltrados.length})</span>
            </h3>
            <span className="text-xs text-gray-500 font-medium">
              Control de cobranzas, vigencia publicitaria y datos de propietarios
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportarExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Descargar listado en Excel (.xlsx)"
            >
              <FileSpreadsheet size={15} className="text-emerald-600" />
              <span>Descargar Excel</span>
            </button>

            <button
              onClick={handleExportarPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Descargar listado en PDF (.pdf)"
            >
              <FileText size={15} className="text-rose-600" />
              <span>Descargar PDF</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 divide-y divide-gray-200">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Inmueble / Código</th>
                <th className="px-5 py-3.5">Propietario / Contacto</th>
                <th className="px-5 py-3.5">Plan de Promoción</th>
                <th className="px-5 py-3.5 text-center">Estado de Pago</th>
                <th className="px-5 py-3.5">Vencimiento</th>
                <th className="px-5 py-3.5 text-center">Publicación</th>
                <th className="px-5 py-3.5 text-right">Acciones de Cobro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inmueblesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-600">No se encontraron inmuebles registrados</p>
                    <p className="text-xs mt-1">Prueba cambiando los filtros o publica una nueva propiedad.</p>
                  </td>
                </tr>
              ) : (
                inmueblesFiltrados.map((inm) => {
                  const whatsappLink = getWhatsAppCobroLink(inm)

                  return (
                    <tr key={inm.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Inmueble Thumbnail + Título + Precio */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={inm.imagenUrl}
                            alt={inm.titulo}
                            className="w-14 h-14 rounded-lg object-cover border border-gray-200 shadow-sm shrink-0"
                          />
                          <div className="max-w-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-brand-dark bg-gray-100 px-1.5 py-0.5 rounded">
                                {inm.codigo}
                              </span>
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                {inm.modalidad}
                              </span>
                              {inm.destacado && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                                  ★ Destacado
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-gray-900 text-sm truncate mt-1" title={inm.titulo}>
                              {inm.titulo}
                            </h4>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin size={12} className="text-gray-400 shrink-0" />
                              {inm.sector}, {inm.ciudad} • <strong className="text-brand-dark">${inm.precio.toLocaleString()}</strong>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Propietario / Contacto */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{inm.propietario.nombre}</p>
                          <p className="text-xs text-gray-500">{inm.propietario.email}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <a
                              href={whatsappLink}
                              target="_blank"
                              rel="noreferrer"
                              title="Contactar al propietario por WhatsApp con recordatorio"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors"
                            >
                              <MessageCircle size={14} className="text-emerald-600" />
                              <span>{inm.propietario.telefono}</span>
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Plan de Promoción SARA */}
                      <td className="px-5 py-4">
                        <div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                            inm.promocion.plan === "premium" 
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : inm.promocion.plan === "destacado"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : "bg-gray-100 text-gray-800 border border-gray-200"
                          }`}>
                            <Tag size={12} />
                            {inm.promocion.nombrePlan}
                          </span>
                          <p className="text-xs text-gray-500 font-semibold mt-1">
                            Tarifa: <strong className="text-gray-900">${inm.promocion.tarifaMensual}</strong> / mes
                          </p>
                          {inm.promocion.porcentajeComision && (
                            <p className="text-[11px] text-gray-400">
                              + {inm.promocion.porcentajeComision}% comisión cierre
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Estado de Pago */}
                      <td className="px-5 py-4 text-center">
                        {inm.promocion.estadoPago === "al_dia" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 size={13} className="text-emerald-600" />
                            Al Día
                          </span>
                        )}
                        {inm.promocion.estadoPago === "por_vencer" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                            <Clock size={13} className="text-amber-600" />
                            Por Vencer
                          </span>
                        )}
                        {inm.promocion.estadoPago === "vencido" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                            <AlertTriangle size={13} className="text-red-600" />
                            Cuota Vencida
                          </span>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1">
                          Total Pagado: ${inm.promocion.totalRecaudado}
                        </p>
                      </td>

                      {/* Vencimiento */}
                      <td className="px-5 py-4 text-xs font-medium">
                        <div className="flex items-center gap-1 text-gray-700">
                          <Calendar size={14} className="text-gray-400" />
                          <span>{inm.promocion.fechaVencimiento}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Inicio: {inm.promocion.fechaInicio}
                        </p>
                      </td>

                      {/* Switch Publicado / Pausado */}
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleTogglePublicado(inm.id)}
                          title={inm.publicado ? "Click para pausar publicación" : "Click para reactivar en la web"}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                            inm.publicado 
                              ? "bg-green-100 text-green-800 hover:bg-green-200 border border-green-200" 
                              : "bg-gray-200 text-gray-600 hover:bg-gray-300 border border-gray-300"
                          }`}
                        >
                          {inm.publicado ? (
                            <>
                              <Eye size={13} />
                              <span>Activo</span>
                            </>
                          ) : (
                            <>
                              <EyeOff size={13} />
                              <span>Pausado</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Botón Cobrar / Renovar */}
                          <button
                            onClick={() => handleOpenCobroModal(inm)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-sage hover:bg-brand-sage/90 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                            title="Registrar cobro de mensualidad o renovar promoción"
                          >
                            <CreditCard size={14} />
                            <span>Cobrar / Renovar</span>
                          </button>

                          {/* Botón Editar */}
                          <button
                            onClick={() => handleOpenEditModal(inm)}
                            className="p-1.5 text-gray-500 hover:text-brand-dark hover:bg-gray-100 rounded-lg transition-colors"
                            title="Editar datos de la propiedad"
                          >
                            <Pencil size={16} />
                          </button>

                          {/* Botón Eliminar */}
                          <button
                            onClick={() => handleDeleteInmueble(inm.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar inmueble"
                          >
                            <Trash2 size={16} />
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

      {/* ========================================================= */}
      {/* MODAL: REGISTRAR COBRO / RENOVAR PLAN DE PROMOCIÓN SARA */}
      {/* ========================================================= */}
      {isCobroModalOpen && selectedInmuebleForCobro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setIsCobroModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Receipt size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Registrar Cobro de Promoción</h3>
                <p className="text-xs text-gray-500">Renovación de publicidad y extensión de vigencia en SARA</p>
              </div>
            </div>

            <form onSubmit={handleConfirmarCobro} className="space-y-4">
              {/* Resumen del Inmueble y Propietario */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-200 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-700">{selectedInmuebleForCobro.codigo}</span>
                  <span className="text-gray-500">Vencimiento actual: {selectedInmuebleForCobro.promocion.fechaVencimiento}</span>
                </div>
                <h4 className="font-bold text-gray-900 text-sm truncate">{selectedInmuebleForCobro.titulo}</h4>
                <p className="text-xs text-gray-600">
                  Propietario: <strong>{selectedInmuebleForCobro.propietario.nombre}</strong> ({selectedInmuebleForCobro.propietario.telefono})
                </p>
              </div>

              {/* Selector de Meses de Renovación */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Periodo a Renovar
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { meses: 1, label: "1 Mes (30 días)", factor: 1 },
                    { meses: 3, label: "3 Meses (Trimestral)", factor: 2.8 },
                    { meses: 6, label: "6 Meses (Semestral)", factor: 5.2 }
                  ].map((p) => {
                    const isSelected = mesesRenovacion === p.meses
                    const valorCalculado = Math.round(selectedInmuebleForCobro.promocion.tarifaMensual * p.factor)

                    return (
                      <button
                        type="button"
                        key={p.meses}
                        onClick={() => {
                          setMesesRenovacion(p.meses)
                          setMontoCobradoInput(valorCalculado)
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "border-brand-sage bg-brand-sage/10 text-brand-dark font-bold shadow-sm ring-1 ring-brand-sage"
                            : "border-gray-200 hover:border-gray-300 text-gray-700 text-xs"
                        }`}
                      >
                        <p className="text-xs font-bold">{p.label}</p>
                        <p className="text-sm font-extrabold text-brand-sage mt-1">${valorCalculado}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Valor a Cobrar */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Monto a Cobrar ($ USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="number"
                      min="10"
                      step="5"
                      required
                      value={montoCobradoInput}
                      onChange={(e) => setMontoCobradoInput(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-900 focus:ring-2 focus:ring-brand-sage"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={metodoPagoCobro}
                    onChange={(e) => setMetodoPagoCobro(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-brand-sage"
                  >
                    <option value="Transferencia Banco Pichincha">Banco Pichincha</option>
                    <option value="Transferencia Banco Guayaquil">Banco Guayaquil</option>
                    <option value="Transferencia Produbanco">Produbanco</option>
                    <option value="Efectivo en Oficina">Efectivo en Oficina</option>
                    <option value="Tarjeta de Crédito/Débito">Tarjeta de Crédito/Débito</option>
                  </select>
                </div>
              </div>

              {/* Notificación al Propietario */}
              <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 flex items-start gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900">
                  <p className="font-bold">Emisión de Comprobante Inmediata</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Al confirmar el cobro, el inmueble se mantiene 100% activo en el catálogo y podrás enviarle el recibo por WhatsApp al propietario con 1 clic.
                  </p>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCobroModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-sage hover:bg-brand-sage/90 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check size={16} />
                  <span>Confirmar Cobro y Extender</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PUBLICAR NUEVO / EDITAR INMUEBLE CON PLAN DE COBRO */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
              <div className="p-3 bg-brand-sage/10 text-brand-sage rounded-xl">
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingInmueble ? "Editar Inmueble y Plan de Cobro" : "Publicar Inmueble & Configurar Cobro"}
                </h3>
                <p className="text-xs text-gray-500">
                  Registra los datos de la propiedad, la información del propietario y la tarifa publicitaria mensual de SARA.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveInmueble} className="space-y-4">
              {/* Sección 1: Datos de la Propiedad */}
              <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <Home size={14} className="text-brand-sage" />
                  1. Datos del Inmueble
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Código</label>
                    <input
                      type="text"
                      required
                      value={formInmueble.codigo}
                      onChange={(e) => setFormInmueble({ ...formInmueble, codigo: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-800"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Título de la Publicación</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Casa Moderna en Challuabamba con Jardín"
                      value={formInmueble.titulo}
                      onChange={(e) => setFormInmueble({ ...formInmueble, titulo: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo</label>
                    <select
                      value={formInmueble.tipo}
                      onChange={(e) => setFormInmueble({ ...formInmueble, tipo: e.target.value as any })}
                      className="w-full px-2.5 py-2 bg-white border border-gray-300 rounded-lg text-xs"
                    >
                      <option value="casa">Casa</option>
                      <option value="departamento">Departamento</option>
                      <option value="terreno">Terreno</option>
                      <option value="quinta">Quinta</option>
                      <option value="suite">Suite</option>
                      <option value="local">Local</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Modalidad</label>
                    <select
                      value={formInmueble.modalidad}
                      onChange={(e) => setFormInmueble({ ...formInmueble, modalidad: e.target.value as any })}
                      className="w-full px-2.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold"
                    >
                      <option value="venta">Venta</option>
                      <option value="arriendo">Arriendo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Precio ($ USD)</label>
                    <input
                      type="number"
                      required
                      value={formInmueble.precio}
                      onChange={(e) => setFormInmueble({ ...formInmueble, precio: Number(e.target.value) })}
                      className="w-full px-2.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Área Total m²</label>
                    <input
                      type="number"
                      required
                      value={formInmueble.areaM2}
                      onChange={(e) => setFormInmueble({ ...formInmueble, areaM2: Number(e.target.value) })}
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
                      value={formInmueble.ciudad}
                      onChange={(e) => setFormInmueble({ ...formInmueble, ciudad: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Sector</label>
                    <input
                      type="text"
                      required
                      value={formInmueble.sector}
                      onChange={(e) => setFormInmueble({ ...formInmueble, sector: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">URL Foto Principal</label>
                    <input
                      type="url"
                      required
                      value={formInmueble.imagenUrl}
                      onChange={(e) => setFormInmueble({ ...formInmueble, imagenUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Datos del Propietario */}
              <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <Phone size={14} className="text-brand-sage" />
                  2. Datos del Propietario / Contacto
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Ing. Carlos Vintimilla"
                      value={formInmueble.propietarioNombre}
                      onChange={(e) => setFormInmueble({ ...formInmueble, propietarioNombre: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">WhatsApp / Teléfono</label>
                    <input
                      type="tel"
                      required
                      placeholder="+593 99 123 4567"
                      value={formInmueble.propietarioTelefono}
                      onChange={(e) => setFormInmueble({ ...formInmueble, propietarioTelefono: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="propietario@email.com"
                      value={formInmueble.propietarioEmail}
                      onChange={(e) => setFormInmueble({ ...formInmueble, propietarioEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 3: Configuración de Cobro y Promoción SARA */}
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <DollarSign size={14} className="text-amber-700" />
                  3. Plan de Promoción & Cobro SARA (Monetización)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Plan Publicitario</label>
                    <select
                      value={formInmueble.planPromocion}
                      onChange={(e) => {
                        const plan = e.target.value as InmuebleAdmin["promocion"]["plan"]
                        const tarifas = { basico: 35, destacado: 65, premium: 120, comision: 0 }
                        setFormInmueble({
                          ...formInmueble,
                          planPromocion: plan,
                          tarifaMensual: tarifas[plan],
                          destacado: plan === "destacado" || plan === "premium"
                        })
                      }}
                      className="w-full px-2.5 py-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-gray-800"
                    >
                      <option value="basico">Plan Básico ($35/mes)</option>
                      <option value="destacado">Plan Destacado ($65/mes)</option>
                      <option value="premium">Plan Premium Exclusiva ($120/mes)</option>
                      <option value="comision">Solo Comisión por Éxito</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Tarifa Mensual ($ USD)</label>
                    <input
                      type="number"
                      required
                      value={formInmueble.tarifaMensual}
                      onChange={(e) => setFormInmueble({ ...formInmueble, tarifaMensual: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-extrabold text-amber-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">% Comisión por Cierre</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formInmueble.porcentajeComision}
                      onChange={(e) => setFormInmueble({ ...formInmueble, porcentajeComision: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-gray-800"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formInmueble.destacado}
                      onChange={(e) => setFormInmueble({ ...formInmueble, destacado: e.target.checked })}
                      className="rounded text-brand-sage focus:ring-brand-sage h-4 w-4"
                    />
                    <span className="text-xs font-bold text-gray-800">Inmueble Destacado (Insignia Dorada)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formInmueble.publicado}
                      onChange={(e) => setFormInmueble({ ...formInmueble, publicado: e.target.checked })}
                      className="rounded text-brand-sage focus:ring-brand-sage h-4 w-4"
                    />
                    <span className="text-xs font-bold text-gray-800">Publicado Inmediatamente en la Web</span>
                  </label>
                </div>
              </div>

              {/* Botones de Envío */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-sage hover:bg-brand-sage/90 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check size={16} />
                  <span>{editingInmueble ? "Guardar Cambios" : "Publicar y Activar Cobro"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
