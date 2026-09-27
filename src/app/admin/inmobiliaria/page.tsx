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
  FileText,
  Settings,
  Percent,
  Sliders,
  Save,
  Info,
  Award,
  HelpCircle,
  Briefcase
} from "lucide-react"
import { exportarAExcel, exportarAPDF } from "@/lib/services/exportReports"
import { 
  getInmobiliariaConfig, 
  saveInmobiliariaConfig, 
  InmobiliariaConfigCompleta, 
  DEFAULT_INMOBILIARIA_CONFIG 
} from "@/lib/services/inmobiliariaPlanesService"

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

  // Viñetas / Pestañas de Gestión: "inmuebles" | "planes"
  const [activeTab, setActiveTab] = useState<"inmuebles" | "planes">("inmuebles")

  // Configuración de Planes de Promoción & Comisiones SARA Inmobiliaria
  const [planesConfig, setPlanesConfig] = useState<InmobiliariaConfigCompleta>(DEFAULT_INMOBILIARIA_CONFIG)
  const [isSavingPlanes, setIsSavingPlanes] = useState(false)
  const [planesSaveSuccess, setPlanesSaveSuccess] = useState(false)
  const [simuladorPrecioVenta, setSimuladorPrecioVenta] = useState<number>(180000)

  // Cargar configuración de planes desde API / Supabase
  React.useEffect(() => {
    getInmobiliariaConfig().then(setPlanesConfig)
    const handleSync = (e: any) => {
      if (e.detail) setPlanesConfig(e.detail)
    }
    window.addEventListener("sara_inmobiliaria_config_updated", handleSync)
    return () => window.removeEventListener("sara_inmobiliaria_config_updated", handleSync)
  }, [])

  // Guardar configuración de planes en base de datos
  const handleGuardarPlanes = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsSavingPlanes(true)
    try {
      const res = await saveInmobiliariaConfig(planesConfig)
      if (res.success) {
        setPlanesSaveSuccess(true)
        setTimeout(() => setPlanesSaveSuccess(false), 3500)
      } else {
        alert("Aviso al guardar: " + (res.error || "No se pudo sincronizar en base de datos"))
      }
    } catch (err: any) {
      alert("Error al guardar: " + err.message)
    } finally {
      setIsSavingPlanes(false)
    }
  }

  // Modificar campo de plan
  const updatePlanField = (planKey: "basico" | "destacado" | "premium", field: string, value: any) => {
    setPlanesConfig(prev => ({
      ...prev,
      planes: {
        ...prev.planes,
        [planKey]: {
          ...prev.planes[planKey],
          [field]: value
        }
      }
    }))
  }

  // Modificar beneficio específico de un plan
  const updatePlanBeneficio = (planKey: "basico" | "destacado" | "premium", index: number, value: string) => {
    setPlanesConfig(prev => {
      const newBeneficios = [...prev.planes[planKey].beneficios]
      newBeneficios[index] = value
      return {
        ...prev,
        planes: {
          ...prev.planes,
          [planKey]: {
            ...prev.planes[planKey],
            beneficios: newBeneficios
          }
        }
      }
    })
  }

  // Agregar beneficio a un plan
  const handleAddBeneficio = (planKey: "basico" | "destacado" | "premium") => {
    setPlanesConfig(prev => ({
      ...prev,
      planes: {
        ...prev.planes,
        [planKey]: {
          ...prev.planes[planKey],
          beneficios: [...prev.planes[planKey].beneficios, "Nuevo beneficio publicitario"]
        }
      }
    }))
  }

  // Eliminar beneficio de un plan
  const handleRemoveBeneficio = (planKey: "basico" | "destacado" | "premium", index: number) => {
    setPlanesConfig(prev => ({
      ...prev,
      planes: {
        ...prev.planes,
        [planKey]: {
          ...prev.planes[planKey],
          beneficios: prev.planes[planKey].beneficios.filter((_, i) => i !== index)
        }
      }
    }))
  }

  // Modificar campo de comisiones
  const updateComisionField = (field: string, value: any) => {
    setPlanesConfig(prev => ({
      ...prev,
      comisiones: {
        ...prev.comisiones,
        [field]: value
      }
    }))
  }

  // Restablecer valores predeterminados
  const handleResetPlanesDefaults = () => {
    if (confirm("¿Estás seguro de restablecer los planes y comisiones a sus valores recomendados por defecto?")) {
      setPlanesConfig(DEFAULT_INMOBILIARIA_CONFIG)
    }
  }

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

      {/* PESTAÑAS / VIÑETAS DE GESTIÓN */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 pt-2 rounded-2xl shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab("inmuebles")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all cursor-pointer ${
            activeTab === "inmuebles"
              ? "border-brand-sage text-brand-sage bg-brand-sage/5 rounded-t-xl"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Building2 size={17} />
          <span>Portafolio de Inmuebles & Cobros</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-mono">
            {inmuebles.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("planes")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all cursor-pointer ${
            activeTab === "planes"
              ? "border-amber-500 text-amber-700 bg-amber-500/10 rounded-t-xl"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Settings size={17} />
          <span>Configuración de Planes & Comisiones SARA</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black">
            Comisiones & Pauta
          </span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* VIÑETA 1: PORTAFOLIO DE INMUEBLES & COBROS DE PROMOCIÓN   */}
      {/* ========================================================= */}
      {activeTab === "inmuebles" && (
        <div className="space-y-6 animate-fadeIn">
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

          {/* Banner Informativo de Tarifas de Promoción SARA (Valores Reactivos & Enlace a Configuración) */}
          <div className="bg-gradient-to-r from-brand-dark to-slate-800 text-white rounded-xl p-5 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="text-yellow-400" size={20} />
                <h4 className="font-bold text-base text-yellow-300">Modelo de Cobro por Promoción Inmobiliaria SARA</h4>
              </div>
              <p className="text-xs text-gray-300 max-w-3xl">
                SARA monetiza cobrando una cuota fija de pauta mensual a los propietarios para mantener sus propiedades visibles con prioridad y campañas digitales, más una comisión de éxito del {planesConfig.comisiones.comisionVentaMin}% al {planesConfig.comisiones.comisionVentaMax}% al concretar la venta:
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto shrink-0 text-center">
                <div className="bg-white/10 px-3 py-2 rounded-lg border border-white/10">
                  <p className="text-[10px] text-gray-300 uppercase font-semibold">{planesConfig.planes.basico.nombre}</p>
                  <p className="text-base font-extrabold text-white">${planesConfig.planes.basico.precioMensual} <span className="text-[10px] font-normal text-gray-300">/mes</span></p>
                </div>
                <div className="bg-white/10 px-3 py-2 rounded-lg border border-white/10">
                  <p className="text-[10px] text-yellow-300 uppercase font-semibold">{planesConfig.planes.destacado.nombre}</p>
                  <p className="text-base font-extrabold text-white">${planesConfig.planes.destacado.precioMensual} <span className="text-[10px] font-normal text-gray-300">/mes</span></p>
                </div>
                <div className="bg-white/10 px-3 py-2 rounded-lg border border-white/10">
                  <p className="text-[10px] text-emerald-300 uppercase font-semibold">{planesConfig.planes.premium.nombre}</p>
                  <p className="text-base font-extrabold text-white">${planesConfig.planes.premium.precioMensual} <span className="text-[10px] font-normal text-gray-300">/mes</span></p>
                </div>
                <div className="bg-white/10 px-3 py-2 rounded-lg border border-white/10">
                  <p className="text-[10px] text-indigo-300 uppercase font-semibold">Comisión Éxito</p>
                  <p className="text-base font-extrabold text-white">{planesConfig.comisiones.comisionVentaMin}% - {planesConfig.comisiones.comisionVentaMax}%</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("planes")}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-sm active:scale-95"
                title="Configurar Tarifas y Comisiones"
              >
                <Settings size={14} />
                <span>Configurar Tarifas</span>
              </button>
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
    </div>
  )}

  {/* ========================================================= */}
  {/* VIÑETA 2: CONFIGURACIÓN DE PLANES & COMISIONES SARA       */}
  {/* ========================================================= */}
  {activeTab === "planes" && (
    <div className="space-y-8 animate-fadeIn">
      {/* Header de la Viñeta con Acciones Rápidas */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-slate text-white p-6 md:p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-brand-gold/20 text-brand-gold rounded-xl border border-brand-gold/30">
                <Sliders size={26} />
              </span>
              <div>
                <span className="text-brand-gold text-xs font-bold tracking-wider uppercase">Políticas Comerciales & Honorarios</span>
                <h3 className="text-2xl font-black text-white">Configuración de Planes & Comisiones SARA</h3>
              </div>
            </div>
            <p className="text-gray-300 text-sm mt-3 max-w-3xl leading-relaxed">
              Define los valores oficiales que se aplican a los propietarios por el servicio de difusión, fotografía y pauta digital, así como los porcentajes de honorarios por éxito en compraventa, alquiler y comisiones compartidas con la red de corredores aliados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={handleResetPlanesDefaults}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-gray-300 hover:text-white rounded-xl text-sm font-semibold transition-all border border-slate-700 cursor-pointer"
            >
              <RefreshCw size={16} />
              <span>Restablecer Defecto</span>
            </button>

            <button
              type="button"
              disabled={isSavingPlanes}
              onClick={() => handleGuardarPlanes()}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {isSavingPlanes ? (
                <>
                  <RefreshCw size={17} className="animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save size={17} />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notificación de Guardado Exitoso */}
        {planesSaveSuccess && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-300 text-sm flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span><strong>¡Configuración guardada!</strong> Los nuevos planes y porcentajes de comisión fueron actualizados en la base de datos de SARA Inmobiliaria.</span>
          </div>
        )}
      </div>

      {/* ======================================================= */}
      {/* SECCIÓN 1: PLANES DE PROMOCIÓN (COBRO MENSUAL A PROPIETARIOS) */}
      {/* ======================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pb-2 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-amber-600" />
              <h4 className="text-lg font-bold text-gray-800">1. Planes de Promoción y Difusión Publicitaria</h4>
            </div>
            <p className="text-gray-500 text-xs mt-0.5">
              Cuotas periódicas facturadas a los propietarios para costear pauta en Meta Ads, fotografía, video drone y posicionamiento preferencial.
            </p>
          </div>
          <span className="text-xs px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full font-semibold">
            Cobro Mensual / 30 Días
          </span>
        </div>

        {/* Grid de 3 Planes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plan Básico */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-200 hover:border-gray-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold uppercase rounded-full">
                  Plan Estándar
                </span>
                <span className="text-xs text-gray-400 font-medium">Básico</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Nombre Comercial del Plan</label>
                  <input
                    type="text"
                    value={planesConfig.planes.basico.nombre}
                    onChange={(e) => updatePlanField("basico", "nombre", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:bg-white focus:ring-2 focus:ring-brand-sage outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Tarifa Mensual ($ USD)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={planesConfig.planes.basico.precioMensual}
                        onChange={(e) => updatePlanField("basico", "precioMensual", Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-lg font-black text-gray-900 focus:bg-white focus:ring-2 focus:ring-brand-sage outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Vigencia (Días)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={planesConfig.planes.basico.diasDuracion}
                        onChange={(e) => updatePlanField("basico", "diasDuracion", Number(e.target.value))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-lg font-black text-gray-900 focus:bg-white focus:ring-2 focus:ring-brand-sage outline-hidden text-right"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Descripción Breve</label>
                  <textarea
                    rows={2}
                    value={planesConfig.planes.basico.descripcion}
                    onChange={(e) => updatePlanField("basico", "descripcion", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:bg-white focus:ring-2 focus:ring-brand-sage outline-hidden"
                  />
                </div>

                {/* Lista de Beneficios */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-gray-600">Beneficios Incluidos</label>
                    <button
                      type="button"
                      onClick={() => handleAddBeneficio("basico")}
                      className="text-[11px] font-bold text-brand-sage hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Plus size={12} /> Agregar
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {planesConfig.planes.basico.beneficios.map((ben, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                        <input
                          type="text"
                          value={ben}
                          onChange={(e) => updatePlanBeneficio("basico", idx, e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:bg-white focus:ring-1 focus:ring-brand-sage outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveBeneficio("basico", idx)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded cursor-pointer"
                          title="Eliminar beneficio"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Costo por día: <strong>${(planesConfig.planes.basico.precioMensual / (planesConfig.planes.basico.diasDuracion || 30)).toFixed(2)}</strong></span>
              <span className="font-semibold text-gray-600">Recomendado para arriendos</span>
            </div>
          </div>

          {/* Plan Destacado */}
          <div className="bg-amber-50/40 rounded-2xl p-6 shadow-md border-2 border-amber-400 hover:border-amber-500 transition-all flex flex-col justify-between relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-black uppercase tracking-wider rounded-full shadow-md">
                ★ Más Popular / Recomendado
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-4 mt-2">
                <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold uppercase rounded-full">
                  Prioridad Catálogo
                </span>
                <span className="text-xs text-amber-700 font-bold">Destacado</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1">Nombre Comercial del Plan</label>
                  <input
                    type="text"
                    value={planesConfig.planes.destacado.nombre}
                    onChange={(e) => updatePlanField("destacado", "nombre", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm font-bold text-amber-950 focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-amber-950 mb-1">Tarifa Mensual ($ USD)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-amber-700 font-bold text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={planesConfig.planes.destacado.precioMensual}
                        onChange={(e) => updatePlanField("destacado", "precioMensual", Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-amber-300 rounded-xl text-lg font-black text-amber-900 focus:ring-2 focus:ring-amber-500 outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-950 mb-1">Vigencia (Días)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={planesConfig.planes.destacado.diasDuracion}
                        onChange={(e) => updatePlanField("destacado", "diasDuracion", Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-lg font-black text-amber-900 focus:ring-2 focus:ring-amber-500 outline-hidden text-right"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1">Descripción Breve</label>
                  <textarea
                    rows={2}
                    value={planesConfig.planes.destacado.descripcion}
                    onChange={(e) => updatePlanField("destacado", "descripcion", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-amber-900 focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>

                {/* Lista de Beneficios */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-amber-950">Beneficios Incluidos</label>
                    <button
                      type="button"
                      onClick={() => handleAddBeneficio("destacado")}
                      className="text-[11px] font-bold text-amber-700 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Plus size={12} /> Agregar
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {planesConfig.planes.destacado.beneficios.map((ben, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        <input
                          type="text"
                          value={ben}
                          onChange={(e) => updatePlanBeneficio("destacado", idx, e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs bg-white border border-amber-200 rounded-lg text-amber-950 focus:ring-1 focus:ring-amber-500 outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveBeneficio("destacado", idx)}
                          className="p-1 text-amber-600 hover:text-red-500 rounded cursor-pointer"
                          title="Eliminar beneficio"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-200 flex items-center justify-between text-xs text-amber-800">
              <span>Costo por día: <strong>${(planesConfig.planes.destacado.precioMensual / (planesConfig.planes.destacado.diasDuracion || 30)).toFixed(2)}</strong></span>
              <span className="font-bold text-amber-900">Incluye pauta en redes</span>
            </div>
          </div>

          {/* Plan Premium */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-emerald-300 hover:border-emerald-400 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold uppercase rounded-full">
                  VIP & Showcase Portada
                </span>
                <span className="text-xs text-emerald-600 font-bold">Premium</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Comercial del Plan</label>
                  <input
                    type="text"
                    value={planesConfig.planes.premium.nombre}
                    onChange={(e) => updatePlanField("premium", "nombre", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Tarifa Mensual ($ USD)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-emerald-700 font-bold text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={planesConfig.planes.premium.precioMensual}
                        onChange={(e) => updatePlanField("premium", "precioMensual", Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-lg font-black text-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Vigencia (Días)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={planesConfig.planes.premium.diasDuracion}
                        onChange={(e) => updatePlanField("premium", "diasDuracion", Number(e.target.value))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-lg font-black text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden text-right"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Descripción Breve</label>
                  <textarea
                    rows={2}
                    value={planesConfig.planes.premium.descripcion}
                    onChange={(e) => updatePlanField("premium", "descripcion", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                {/* Lista de Beneficios */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-gray-700">Beneficios Incluidos</label>
                    <button
                      type="button"
                      onClick={() => handleAddBeneficio("premium")}
                      className="text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Plus size={12} /> Agregar
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {planesConfig.planes.premium.beneficios.map((ben, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <input
                          type="text"
                          value={ben}
                          onChange={(e) => updatePlanBeneficio("premium", idx, e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveBeneficio("premium", idx)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded cursor-pointer"
                          title="Eliminar beneficio"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Costo por día: <strong>${(planesConfig.planes.premium.precioMensual / (planesConfig.planes.premium.diasDuracion || 30)).toFixed(2)}</strong></span>
              <span className="font-bold text-emerald-700">Video Drone 4K + Pauta Google</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* SECCIÓN 2: ESQUEMA DE COMISIONES SARA INMOBILIARIA      */}
      {/* ======================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pb-2 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <Percent size={20} className="text-brand-sage" />
              <h4 className="text-lg font-bold text-gray-800">2. Porcentajes de Comisión SARA Inmobiliaria (Éxito al Cierre)</h4>
            </div>
            <p className="text-gray-500 text-xs mt-0.5">
              Honorarios de intermediación devengados en el momento de la firma de escritura de compraventa o contrato de arrendamiento.
            </p>
          </div>
          <span className="text-xs px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full font-semibold">
            Honorarios por Cierre Exitoso
          </span>
        </div>

        {/* 3 Columnas de Comisiones */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card A: Comisiones por Venta */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Building2 size={22} />
              </div>
              <div>
                <h5 className="font-bold text-gray-900 text-base">Comisión por Venta</h5>
                <span className="text-xs text-gray-500">Porcentaje sobre valor de escritura</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Comisión Mínima (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="15"
                      step="0.5"
                      value={planesConfig.comisiones.comisionVentaMin}
                      onChange={(e) => updateComisionField("comisionVentaMin", Number(e.target.value))}
                      className="w-full pr-8 pl-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-400 font-bold text-xs">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Comisión Máxima (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="15"
                      step="0.5"
                      value={planesConfig.comisiones.comisionVentaMax}
                      onChange={(e) => updateComisionField("comisionVentaMax", Number(e.target.value))}
                      className="w-full pr-8 pl-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-400 font-bold text-xs">%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Sugerida Estándar (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="15"
                      step="0.5"
                      value={planesConfig.comisiones.comisionVentaDefault}
                      onChange={(e) => updateComisionField("comisionVentaDefault", Number(e.target.value))}
                      className="w-full pr-8 pl-3 py-2 bg-blue-50/50 border border-blue-200 rounded-xl text-base font-black text-blue-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                    <span className="absolute right-3 top-2.5 text-blue-500 font-bold text-xs">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Exclusiva SARA (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="15"
                      step="0.5"
                      value={planesConfig.comisiones.comisionVentaExclusiva}
                      onChange={(e) => updateComisionField("comisionVentaExclusiva", Number(e.target.value))}
                      className="w-full pr-8 pl-3 py-2 bg-emerald-50/50 border border-emerald-200 rounded-xl text-base font-black text-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                    <span className="absolute right-3 top-2.5 text-emerald-500 font-bold text-xs">%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Vigencia Contrato Corretaje (Días)</label>
                <input
                  type="number"
                  min="30"
                  step="30"
                  value={planesConfig.comisiones.diasVigenciaContrato}
                  onChange={(e) => updateComisionField("diasVigenciaContrato", Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">Típicamente 180 días (6 meses de exclusividad)</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Política de Cobro por Venta</label>
                <textarea
                  rows={2}
                  value={planesConfig.comisiones.descripcionVenta}
                  onChange={(e) => updateComisionField("descripcionVenta", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Card B: Comisiones por Arriendo */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <Home size={22} />
              </div>
              <div>
                <h5 className="font-bold text-gray-900 text-base">Comisión por Arriendo</h5>
                <span className="text-xs text-gray-500">Colocación & Administración mensual</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Comisión Primer Mes (% del Canon)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    max="150"
                    step="10"
                    value={planesConfig.comisiones.porcentajePrimerMes}
                    onChange={(e) => updateComisionField("porcentajePrimerMes", Number(e.target.value))}
                    className="w-full pr-8 pl-3 py-2 bg-purple-50/50 border border-purple-200 rounded-xl text-base font-black text-purple-700 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-hidden"
                  />
                  <span className="absolute right-3 top-2.5 text-purple-500 font-bold text-xs">%</span>
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">Estándar ecuatoriano: 100% (1 canon de arriendo)</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Gestión Mensual de Cobranza (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="1"
                    value={planesConfig.comisiones.comisionArriendoPorcentaje}
                    onChange={(e) => updateComisionField("comisionArriendoPorcentaje", Number(e.target.value))}
                    className="w-full pr-8 pl-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-hidden"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400 font-bold text-xs">%</span>
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">Aplica si SARA administra pagos y mantenimiento (8% - 10%)</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">IVA sobre Honorarios (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="25"
                    step="1"
                    value={planesConfig.comisiones.ivaComisionPorcentaje}
                    onChange={(e) => updateComisionField("ivaComisionPorcentaje", Number(e.target.value))}
                    className="w-full pr-8 pl-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-hidden"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400 font-bold text-xs">%</span>
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">Tarifa SRI vigente en Ecuador: 15%</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Política de Cobro por Arriendo</label>
                <textarea
                  rows={2}
                  value={planesConfig.comisiones.descripcionArriendo}
                  onChange={(e) => updateComisionField("descripcionArriendo", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Card C: Alianzas Compartidas */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <Briefcase size={22} />
              </div>
              <div>
                <h5 className="font-bold text-gray-900 text-base">Alianzas de Red Inmobiliaria</h5>
                <span className="text-xs text-gray-500">Comisión compartida (Co-Brokering)</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs text-amber-900">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Award size={16} className="text-amber-600" />
                  <span>Esquema de Alianza 50% / 50%</span>
                </div>
                <p className="leading-relaxed">
                  Cuando otra inmobiliaria o corredor matriculado aporta el cliente comprador o arrendatario calificado, los honorarios totales se distribuyen equitativamente:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Participación SARA (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="99"
                      step="1"
                      value={planesConfig.comisiones.porcentajeCompartidoSara}
                      onChange={(e) => {
                        const val = Number(e.target.value)
                        updateComisionField("porcentajeCompartidoSara", val)
                        updateComisionField("porcentajeCompartidoExterno", 100 - val)
                      }}
                      className="w-full pr-8 pl-3 py-2 bg-amber-50/40 border border-amber-300 rounded-xl text-base font-black text-amber-800 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                    />
                    <span className="absolute right-3 top-2.5 text-amber-600 font-bold text-xs">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Corredor Aliado (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="99"
                      step="1"
                      value={planesConfig.comisiones.porcentajeCompartidoExterno}
                      onChange={(e) => {
                        const val = Number(e.target.value)
                        updateComisionField("porcentajeCompartidoExterno", val)
                        updateComisionField("porcentajeCompartidoSara", 100 - val)
                      }}
                      className="w-full pr-8 pl-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-base font-black text-gray-700 focus:bg-white focus:ring-2 focus:ring-gray-500 outline-hidden"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-400 font-bold text-xs">%</span>
                  </div>
                </div>
              </div>

              {/* Barra Visual de Distribución */}
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-600 mb-1.5">
                  <span className="text-amber-700">SARA: {planesConfig.comisiones.porcentajeCompartidoSara}%</span>
                  <span className="text-slate-600">Aliado: {planesConfig.comisiones.porcentajeCompartidoExterno}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-amber-500 h-full transition-all duration-300" 
                    style={{ width: `${planesConfig.comisiones.porcentajeCompartidoSara}%` }} 
                  />
                  <div 
                    className="bg-slate-400 h-full transition-all duration-300" 
                    style={{ width: `${planesConfig.comisiones.porcentajeCompartidoExterno}%` }} 
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600">
                <span className="font-bold text-gray-800">Nota Legal:</span> Se suscribe Hoja de Visita y Acuerdo de Comisión Compartida previo a la presentación de la oferta económica.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* SECCIÓN 3: SIMULADOR INTERACTIVO DE COMISIONES EN VIVO   */}
      {/* ======================================================= */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <TrendingUp size={22} />
                </span>
                <h4 className="text-xl font-bold text-white">Simulador Financiero de Honorarios & Rendimiento SARA</h4>
              </div>
              <p className="text-slate-400 text-xs mt-1">
                Calcula al instante los ingresos proyectados para SARA Inmobiliaria según el precio de venta acordado y los planes de promoción aplicados.
              </p>
            </div>

            {/* Input de Precio Simulado */}
            <div className="w-full md:w-auto">
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Precio de Venta del Inmueble ($ USD)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-black text-base">$</span>
                <input
                  type="number"
                  step="5000"
                  min="10000"
                  value={simuladorPrecioVenta}
                  onChange={(e) => setSimuladorPrecioVenta(Number(e.target.value))}
                  className="w-full md:w-56 pl-8 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-black text-lg focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Botones de Precios Rápidos */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold mr-1">Valores Rápidos:</span>
            {[65000, 110000, 160000, 220000, 350000, 500000].map((monto) => (
              <button
                key={monto}
                type="button"
                onClick={() => setSimuladorPrecioVenta(monto)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  simuladorPrecioVenta === monto
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                ${monto.toLocaleString()}
              </button>
            ))}
          </div>

          {/* 4 Cards de Escenarios Simulados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Escenario 1: Comisión Estándar */}
            <div className="bg-slate-800/90 rounded-xl p-5 border border-slate-700/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Comisión Estándar</span>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full font-bold">
                  {planesConfig.comisiones.comisionVentaDefault}%
                </span>
              </div>
              <div className="text-2xl font-black text-white">
                ${((simuladorPrecioVenta * planesConfig.comisiones.comisionVentaDefault) / 100).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-700">
                + IVA ({planesConfig.comisiones.ivaComisionPorcentaje}%): <strong>${((simuladorPrecioVenta * planesConfig.comisiones.comisionVentaDefault * planesConfig.comisiones.ivaComisionPorcentaje) / 10000).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
            </div>

            {/* Escenario 2: Comisión Exclusiva */}
            <div className="bg-slate-800/90 rounded-xl p-5 border border-emerald-500/40 relative">
              <div className="flex items-center justify-between text-xs text-emerald-400 mb-2 font-bold">
                <span>Comisión Exclusiva</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-bold">
                  {planesConfig.comisiones.comisionVentaExclusiva}%
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-400">
                ${((simuladorPrecioVenta * planesConfig.comisiones.comisionVentaExclusiva) / 100).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-700">
                Margen adicional: <strong>+${(((simuladorPrecioVenta * planesConfig.comisiones.comisionVentaExclusiva) / 100) - ((simuladorPrecioVenta * planesConfig.comisiones.comisionVentaDefault) / 100)).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
            </div>

            {/* Escenario 3: Alianza Compartida 50/50 */}
            <div className="bg-slate-800/90 rounded-xl p-5 border border-slate-700/80">
              <div className="flex items-center justify-between text-xs text-amber-400 mb-2 font-bold">
                <span>Alianza Colegas</span>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full font-bold">
                  {planesConfig.comisiones.porcentajeCompartidoSara}% SARA
                </span>
              </div>
              <div className="text-2xl font-black text-amber-300">
                ${((simuladorPrecioVenta * planesConfig.comisiones.comisionVentaDefault * (planesConfig.comisiones.porcentajeCompartidoSara / 100)) / 100).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-700">
                Aliado recibe idéntico: <strong>${((simuladorPrecioVenta * planesConfig.comisiones.comisionVentaDefault * (planesConfig.comisiones.porcentajeCompartidoExterno / 100)) / 100).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
            </div>

            {/* Escenario 4: Modelo Total SARA (Pauta + Comisión de Venta) */}
            <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl p-5 border border-amber-400/50">
              <div className="flex items-center justify-between text-xs text-amber-300 mb-2 font-black uppercase">
                <span>Total Ciclo Completo</span>
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 rounded-full font-black text-[10px]">
                  Pauta + Venta
                </span>
              </div>
              <div className="text-2xl font-black text-amber-400">
                ${((simuladorPrecioVenta * planesConfig.comisiones.comisionVentaDefault) / 100 + (planesConfig.planes.destacado.precioMensual * 3)).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-300 mt-2 pt-2 border-t border-slate-700">
                Incluye 3 meses Plan Destacado: <strong>+${planesConfig.planes.destacado.precioMensual * 3}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra Inferior de Acción y Guardado */}
      <div className="sticky bottom-4 z-40 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
            <Info size={20} />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-800 block">Guardar Configuración en Sistema</span>
            <span className="text-[11px] text-gray-500">
              {planesConfig.actualizadoEn ? `Última sincronización: ${new Date(planesConfig.actualizadoEn).toLocaleString('es-EC')}` : "Cambios sin sincronizar"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleResetPlanesDefaults}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
          >
            Restablecer Defecto
          </button>

          <button
            type="button"
            disabled={isSavingPlanes}
            onClick={() => handleGuardarPlanes()}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-sage hover:bg-brand-sage/90 text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
          >
            {isSavingPlanes ? (
              <>
                <RefreshCw size={17} className="animate-spin" />
                <span>Guardando en Base de Datos...</span>
              </>
            ) : (
              <>
                <Save size={17} />
                <span>Guardar Configuración de Planes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )}

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
