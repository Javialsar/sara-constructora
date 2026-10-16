"use client"
import React, { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import dynamic from "next/dynamic"
import { 
  Settings, 
  Save, 
  CheckCircle2, 
  Hash, 
  FileText, 
  Landmark, 
  ShieldCheck, 
  Percent, 
  Loader2,
  Building2,
  MapPin,
  Globe,
  Phone,
  Mail,
  Share2,
  Users,
  HardHat,
  Plus,
  Trash2,
  Crosshair,
  Compass,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Briefcase,
  Layers,
  UploadCloud,
  Image as ImageIcon,
  CheckSquare,
  FileCheck2,
  QrCode,
  PenTool
} from "lucide-react"

// Importación dinámica de Leaflet para evitar errores en SSR
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-slate-100 dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 text-sm gap-2 animate-pulse">
      <Compass size={28} className="animate-spin text-cyan-600" />
      <span>Cargando mapa interactivo & geolocalización satelital...</span>
    </div>
  )
})

// Coordenadas de referencia inmediata por Provincia en Ecuador
const COORDENADAS_PROVINCIAS: Record<string, [number, number]> = {
  "Azuay": [-2.9001285, -79.0058965],
  "Loja": [-3.99313, -79.20422],
  "Pichincha": [-0.180653, -78.467838],
  "Guayas": [-2.189412, -79.889066],
  "El Oro": [-3.25811, -79.95508],
  "Manabí": [-1.05458, -80.45445],
  "Tungurahua": [-1.24908, -78.61675],
  "Chimborazo": [-1.66355, -78.65465],
  "Imbabura": [0.35171, -78.12233],
  "Cotopaxi": [-0.93521, -78.61554],
  "Cañar": [-2.73969, -78.84860],
  "Santo Domingo": [-0.25305, -79.17536],
  "Esmeraldas": [0.9592, -79.6539],
  "Los Ríos": [-1.80217, -79.53443],
  "Carchi": [0.81237, -77.71727],
  "Bolívar": [-1.59258, -79.00412],
  "Pastaza": [-1.49239, -78.00257],
  "Morona Santiago": [-2.30868, -78.11135],
  "Napo": [-0.9938, -77.8128],
  "Zamora Chinchipe": [-4.06922, -78.95669],
  "Sucumbíos": [0.08473, -76.88283],
  "Orellana": [-0.46389, -76.98722],
  "Santa Elena": [-2.22622, -80.85873],
  "Galápagos": [-0.95377, -90.9656]
}

// 24 Provincias y principales cantones de Ecuador
const PROVINCIAS_ECUADOR: Record<string, string[]> = {
  "Azuay": ["Cuenca", "Gualaceo", "Paute", "Santa Isabel", "Sigsig", "Chordeleg", "Girón", "San Fernando", "Nabón"],
  "Loja": ["Loja", "Catamayo", "Saraguro", "Calvas", "Macará", "Paltas", "Puyango", "Celica", "Gonzanamá", "Zapotillo", "Chaguarpamba", "Espíndola", "Pindal", "Quilanga", "Sozoranga", "Olmedo"],
  "Pichincha": ["Quito", "Rumiñahui", "Mejía", "Cayambe", "Pedro Moncayo", "San Miguel de los Bancos", "Puerto Quito", "Pedro Vicente Maldonado"],
  "Guayas": ["Guayaquil", "Samborondón", "Daule", "Durán", "Milagro", "Salitre", "Playas", "Balao", "El Empalme", "Naranjal", "Pedro Carbo"],
  "El Oro": ["Machala", "Pasaje", "Santa Rosa", "Arenillas", "Huaquillas", "Piñas", "Zaruma", "Atahualpa", "Portovelo"],
  "Manabí": ["Manta", "Portoviejo", "Chone", "Montecristi", "Jipijapa", "Sucre (Bahía)", "Pedernales", "El Carmen", "Tosagua", "Rocafuerte", "Calceta"],
  "Tungurahua": ["Ambato", "Baños", "Pelileo", "Píllaro", "Cevallos", "Mocha", "Patate", "Quero", "Tisaleo"],
  "Chimborazo": ["Riobamba", "Guano", "Alausí", "Colta", "Chambo", "Pallatanga", "Guamote", "Cumandá"],
  "Imbabura": ["Ibarra", "Otavalo", "Cotacachi", "Antonio Ante", "Pimampiro", "Urcuquí"],
  "Cotopaxi": ["Latacunga", "Pujilí", "Salcedo", "Saquisilí", "La Maná", "Pangua", "Sigchos"],
  "Cañar": ["Azogues", "La Troncal", "Cañar", "Biblián", "El Tambo", "Déleg", "Suscal"],
  "Santo Domingo": ["Santo Domingo", "La Concordia"],
  "Esmeraldas": ["Esmeraldas", "Atacames", "Quinindé", "San Lorenzo", "Muisne", "Rioverde", "Eloy Alfaro"],
  "Los Ríos": ["Babahoyo", "Quevedo", "Vinces", "Ventanas", "Buena Fe", "Montalvo", "Valencia"],
  "Carchi": ["Tulcán", "Montúfar", "Espejo", "Mira", "Bolívar", "San Pedro de Huaca"],
  "Bolívar": ["Guaranda", "San Miguel", "Chimbo", "Caluma", "Echeandía", "Chillanes", "Las Naves"],
  "Pastaza": ["Puyo", "Mera", "Santa Clara", "Arajuno"],
  "Morona Santiago": ["Macas", "Gualaquiza", "Sucúa", "Limón Indanza", "Méndez", "Palora"],
  "Napo": ["Tena", "Archidona", "El Chaco", "Quijos", "Carlos Julio Arosemena Tola"],
  "Zamora Chinchipe": ["Zamora", "Yantzaza", "El Pangui", "Centinela del Cóndor", "Chinchipe", "Nangaritza"],
  "Sucumbíos": ["Nueva Loja (Lago Agrio)", "Shushufindi", "Cuyabeno", "Putumayo", "Cascales", "Gonzalo Pizarro"],
  "Orellana": ["Francisco de Orellana (Coca)", "La Joya de los Sachas", "Loreto", "Aguarico"],
  "Santa Elena": ["Santa Elena", "La Libertad", "Salinas"],
  "Galápagos": ["Puerto Baquerizo Moreno", "Puerto Ayora (Santa Cruz)", "Puerto Villamil (Isabela)"]
}

export interface ProfesionalStaff {
  id: string
  nombre: string
  cargo: string
  senescyt: string
  telefono: string
  email: string
}

export interface ReportesConfig {
  incluir_logo: boolean
  incluir_razon_social: boolean
  incluir_ruc: boolean
  incluir_direccion: boolean
  incluir_telefono: boolean
  incluir_email: boolean
  incluir_qr: boolean
  tecnico_firmante_id: string
  segunda_firma_habilitada: boolean
  segunda_firma_cargo: string
  segunda_firma_nombre: string
}

export default function ParametrosClientePage() {
  const supabase = createClient()
  
  // Viñeta Activa (Tabs)
  const [activeTab, setActiveTab] = useState<'empresa' | 'reportes' | 'aiu' | 'sri'>('empresa')

  // Logotipo Oficial de la Empresa
  const [logoBase64, setLogoBase64] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 1. Datos de Identidad Corporativa y Geolocalización
  const [empresa, setEmpresa] = useState({
    razon_social: "LIDER ARQUITECTURA",
    nombre_comercial: "ARQ-PRISMA",
    ruc: "1102978630001",
    gerente: "JOSE DE LA CUADRA",
    provincia: "Pichincha",
    canton: "Quito",
    ciudad: "Quito",
    calle_principal: "Av. República del Salvador",
    calle_secundaria: "y Naciones Unidas, Edificio Prisma, Of. 502",
    telefono: "+593 98 180 4023",
    email: "contacto@arqprisma.com",
    sitio_web: "https://arqprisma.com",
    facebook: "https://facebook.com/arqprisma",
    instagram: "@arqprisma.ec",
    linkedin: "linkedin.com/company/arqprisma",
    latitud: -0.180653,
    longitud: -78.467838
  })

  // Mapa interactivo Leaflet: Coordenadas [lat, lng]
  const [mapPosition, setMapPosition] = useState<[number, number]>([-0.180653, -78.467838])
  const [isLocating, setIsLocating] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)

  // Staff Técnico Colegiado
  const [staffTecnico, setStaffTecnico] = useState<ProfesionalStaff[]>([
    {
      id: "1",
      nombre: "Ing. Javier Sarango Gona",
      cargo: "Director General & Ing. Civil Estructural",
      senescyt: "1005-2016-189423",
      telefono: "+593 98 180 4023",
      email: "gerencia@saraconstructora.com"
    },
    {
      id: "2",
      nombre: "Arq. Carlos Eduardo Mora",
      cargo: "Arquitecto Proyectista & Modelador BIM",
      senescyt: "1012-2019-456781",
      telefono: "+593 99 234 5678",
      email: "arquitectura@saraconstructora.com"
    },
    {
      id: "3",
      nombre: "Ing. Elena Valdivieso",
      cargo: "Ingeniera Residente & Fiscalización de Obras",
      senescyt: "1008-2020-741258",
      telefono: "+593 98 765 4321",
      email: "residencia@saraconstructora.com"
    }
  ])

  // Configuración de Reportes, Membrete & Firmas
  const [reportesConfig, setReportesConfig] = useState<ReportesConfig>({
    incluir_logo: true,
    incluir_razon_social: true,
    incluir_ruc: true,
    incluir_direccion: true,
    incluir_telefono: true,
    incluir_email: true,
    incluir_qr: true,
    tecnico_firmante_id: "1",
    segunda_firma_habilitada: true,
    segunda_firma_cargo: "Representante Legal / Gerente General",
    segunda_firma_nombre: "JOSE DE LA CUADRA"
  })

  // Modal para agregar miembro al Staff Técnico
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false)
  const [nuevoStaff, setNuevoStaff] = useState<Omit<ProfesionalStaff, 'id'>>({
    nombre: "",
    cargo: "Ingeniero Civil Estructural",
    senescyt: "",
    telefono: "",
    email: ""
  })

  // 2. Parámetros de Costos Indirectos AIU, Precisión y Políticas SRI (Ecuador 2026)
  const [params, setParams] = useState({
    // Precisión Decimal
    decimales_calculos: 4,
    decimales_cantidades: 2,
    decimales_precios: 2,

    // Costos Indirectos AIU (10% Admin, 5% Imprevistos, 10% Utilidad, 5% Herramienta Menor)
    porcentaje_admin_default: 10.0,
    porcentaje_imprevistos_default: 5.0,
    porcentaje_utilidad_default: 10.0,
    herramienta_menor_default: 5.0,

    // Políticas Fiscales SRI Ecuador 2026
    regimen_tributario: "general",
    es_agente_retencion: false,
    retencion_renta_pct: 1.75,
    retencion_iva_pct: 30.0,
    tarifa_iva_vigente: 15.0,

    // Cotizador Rápido y Márgenes
    margen_comercial_minimo: 12.0,
    costo_metro_cuadrado_referencial: 450.0
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mensaje, setMensaje] = useState("")

  // Cargar parámetros, logotipo y datos de empresa
  useEffect(() => {
    fetchParametrosYEmpresa()
  }, [])

  // Sincronizar posición del mapa con la empresa
  useEffect(() => {
    if (mapPosition && !isNaN(mapPosition[0]) && !isNaN(mapPosition[1])) {
      setEmpresa(prev => ({
        ...prev,
        latitud: Number(mapPosition[0].toFixed(7)),
        longitud: Number(mapPosition[1].toFixed(7))
      }))
    }
  }, [mapPosition])

  const fetchParametrosYEmpresa = async () => {
    setLoading(true)
    try {
      // 1. Cargar Logotipo
      const savedLogo = localStorage.getItem("my_company_logo")
      if (savedLogo) setLogoBase64(savedLogo)

      // 2. Cargar Datos Empresa
      const savedEmpresa = localStorage.getItem("sara_empresa_identidad")
      if (savedEmpresa) {
        try {
          const parsed = JSON.parse(savedEmpresa)
          setEmpresa(prev => ({ ...prev, ...parsed }))
          if (parsed.latitud && parsed.longitud) {
            setMapPosition([parsed.latitud, parsed.longitud])
          }
        } catch (e) {}
      } else {
        // Fallback a my_company_profile
        const oldProfile = localStorage.getItem("my_company_profile")
        if (oldProfile) {
          try {
            const parsed = JSON.parse(oldProfile)
            if (parsed.formData) {
              setEmpresa(prev => ({
                ...prev,
                razon_social: parsed.formData.razon_social || prev.razon_social,
                nombre_comercial: parsed.formData.nombre_comercial || prev.nombre_comercial,
                ruc: parsed.formData.ruc || prev.ruc,
                gerente: parsed.formData.representante || prev.gerente,
                telefono: parsed.formData.telefono || prev.telefono,
                email: parsed.formData.email || prev.email,
                sitio_web: parsed.formData.website || prev.sitio_web,
                calle_principal: parsed.formData.direccion || prev.calle_principal
              }))
            }
            if (parsed.position) {
              setMapPosition(parsed.position)
              setEmpresa(prev => ({ ...prev, latitud: parsed.position[0], longitud: parsed.position[1] }))
            }
          } catch(e) {}
        }
      }

      // 3. Cargar Staff Técnico
      const savedStaff = localStorage.getItem("sara_empresa_staff")
      if (savedStaff) {
        try {
          const parsedStaff = JSON.parse(savedStaff)
          if (Array.isArray(parsedStaff) && parsedStaff.length > 0) {
            setStaffTecnico(parsedStaff)
          }
        } catch (e) {}
      }

      // 4. Cargar Configuración de Reportes
      const savedReportes = localStorage.getItem("sara_reportes_config")
      if (savedReportes) {
        try {
          const parsedR = JSON.parse(savedReportes)
          setReportesConfig(prev => ({ ...prev, ...parsedR }))
        } catch (e) {}
      }

      // 5. Cargar Parámetros AIU y SRI
      const savedParams = localStorage.getItem("sara_empresa_parametros")
      if (savedParams) {
        try {
          const parsedP = JSON.parse(savedParams)
          setParams(prev => ({ ...prev, ...parsedP }))
        } catch (e) {}
      }

      // 6. Cargar desde Supabase si existe sesión
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        if (user.user_metadata?.empresa_identidad) {
          setEmpresa(prev => ({ ...prev, ...user.user_metadata.empresa_identidad }))
          if (user.user_metadata.empresa_identidad.latitud) {
            setMapPosition([user.user_metadata.empresa_identidad.latitud, user.user_metadata.empresa_identidad.longitud])
          }
        }
        if (user.user_metadata?.empresa_logo) {
          setLogoBase64(user.user_metadata.empresa_logo)
        }
        if (user.user_metadata?.staff_tecnico && Array.isArray(user.user_metadata.staff_tecnico)) {
          setStaffTecnico(user.user_metadata.staff_tecnico)
        }
        if (user.user_metadata?.reportes_config) {
          setReportesConfig(user.user_metadata.reportes_config)
        }

        const { data } = await supabase
          .from('empresa_parametros_cliente')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (data) {
          setParams(prev => ({
            ...prev,
            ...data
          }))
        }
      }
    } catch (err) {
      console.error("Error al cargar parámetros:", err)
    } finally {
      setLoading(false)
    }
  }

  // Manejo de carga de logotipo oficial
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("La imagen debe tener un tamaño inferior a 2 MB.")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setLogoBase64(base64)
        localStorage.setItem("my_company_logo", base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEliminarLogo = () => {
    if (confirm("¿Deseas quitar el logotipo oficial?")) {
      setLogoBase64(null)
      localStorage.removeItem("my_company_logo")
    }
  }

  // Geocodificación y reubicación automática en el mapa
  const reubicarEnMapa = async (provincia: string, canton: string, calle: string) => {
    // 1. Si existe centroide directo de provincia, ubicar inmediatamente
    if (COORDENADAS_PROVINCIAS[provincia]) {
      setMapPosition(COORDENADAS_PROVINCIAS[provincia])
    }

    // 2. Intentar afinar con geocodificación OSM Nominatim
    const query = `${calle ? calle + ", " : ""}${canton}, ${provincia}, Ecuador`
    setIsGeocoding(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`)
      const data = await res.json()
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lon = parseFloat(data[0].lon)
        if (!isNaN(lat) && !isNaN(lon)) {
          setMapPosition([lat, lon])
        }
      }
    } catch (err) {
      console.warn("Geocoding aviso:", err)
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleProvinciaChange = (prov: string) => {
    const cantones = PROVINCIAS_ECUADOR[prov] || []
    const defaultCanton = cantones[0] || prov
    setEmpresa(prev => ({
      ...prev,
      provincia: prov,
      canton: defaultCanton,
      ciudad: defaultCanton
    }))
    reubicarEnMapa(prov, defaultCanton, empresa.calle_principal)
  }

  const handleCantonChange = (cant: string) => {
    setEmpresa(prev => ({
      ...prev,
      canton: cant,
      ciudad: cant
    }))
    reubicarEnMapa(empresa.provincia, cant, empresa.calle_principal)
  }

  // Obtener geolocalización GPS del dispositivo en tiempo real
  const handleObtenerUbicacionGPS = () => {
    if (!navigator.geolocation) {
      alert("La geolocalización no está soportada por tu navegador.")
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = Number(pos.coords.latitude.toFixed(7))
        const newLng = Number(pos.coords.longitude.toFixed(7))
        setMapPosition([newLat, newLng])
        setEmpresa(prev => ({
          ...prev,
          latitud: newLat,
          longitud: newLng
        }))
        setIsLocating(false)
        setMensaje("📍 ¡Ubicación GPS en tiempo real capturada exitosamente!")
        setTimeout(() => setMensaje(""), 4000)
      },
      (err) => {
        console.warn("Error GPS:", err)
        setIsLocating(false)
        alert("No se pudo obtener la posición GPS automática. Puedes arrastrar el marcador sobre el mapa satelital.")
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Agregar profesional al staff técnico
  const handleAgregarStaff = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoStaff.nombre.trim()) return

    const miembro: ProfesionalStaff = {
      id: Date.now().toString(),
      ...nuevoStaff
    }

    const updatedStaff = [...staffTecnico, miembro]
    setStaffTecnico(updatedStaff)
    localStorage.setItem("sara_empresa_staff", JSON.stringify(updatedStaff))
    setIsStaffModalOpen(false)
    setNuevoStaff({
      nombre: "",
      cargo: "Ingeniero Civil Estructural",
      senescyt: "",
      telefono: "",
      email: ""
    })
  }

  const handleEliminarStaff = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este profesional del staff técnico?")) {
      const updatedStaff = staffTecnico.filter(t => t.id !== id)
      setStaffTecnico(updatedStaff)
      localStorage.setItem("sara_empresa_staff", JSON.stringify(updatedStaff))
    }
  }

  // Guardar todos los parámetros y datos
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    setMensaje("")
    
    try {
      // 1. Persistencia local inmediata para todos los módulos y agentes
      localStorage.setItem("sara_empresa_identidad", JSON.stringify(empresa))
      localStorage.setItem("sara_empresa_staff", JSON.stringify(staffTecnico))
      localStorage.setItem("sara_empresa_parametros", JSON.stringify(params))
      localStorage.setItem("sara_reportes_config", JSON.stringify(reportesConfig))
      if (logoBase64) {
        localStorage.setItem("my_company_logo", logoBase64)
      }

      // Compatibilidad con PDF de presupuestos y membretes
      localStorage.setItem("my_company_profile", JSON.stringify({
        formData: {
          nombre_comercial: empresa.nombre_comercial,
          razon_social: empresa.razon_social,
          ruc: empresa.ruc,
          representante: empresa.gerente,
          telefono: empresa.telefono,
          email: empresa.email,
          website: empresa.sitio_web,
          direccion: `${empresa.calle_principal}, ${empresa.calle_secundaria} - ${empresa.ciudad}, ${empresa.provincia}`
        },
        position: mapPosition
      }))

      // Emitir evento para sincronización reactiva en tiempo real en ventanas abiertas
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("empresa_parametros_updated", { 
          detail: { params, empresa, staffTecnico, reportesConfig, logoBase64 } 
        }))
      }

      // 2. Persistencia en Supabase
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.auth.updateUser({
          data: {
            empresa_identidad: empresa,
            empresa_logo: logoBase64,
            staff_tecnico: staffTecnico,
            reportes_config: reportesConfig
          }
        })

        const payload = {
          user_id: user.id,
          decimales_calculos: Number(params.decimales_calculos),
          decimales_cantidades: Number(params.decimales_cantidades),
          decimales_precios: Number(params.decimales_precios),
          porcentaje_admin_default: Number(params.porcentaje_admin_default),
          porcentaje_imprevistos_default: Number(params.porcentaje_imprevistos_default),
          porcentaje_utilidad_default: Number(params.porcentaje_utilidad_default),
          herramienta_menor_default: Number(params.herramienta_menor_default),
          regimen_tributario: params.regimen_tributario,
          es_agente_retencion: params.es_agente_retencion,
          retencion_renta_pct: Number(params.retencion_renta_pct),
          retencion_iva_pct: Number(params.retencion_iva_pct),
          tarifa_iva_vigente: Number(params.tarifa_iva_vigente),
          updated_at: new Date().toISOString()
        }

        await supabase
          .from('empresa_parametros_cliente')
          .upsert([payload], { onConflict: 'user_id' })
      }

      setMensaje("✅ ¡Ficha de empresa, mapa satelital, staff técnico y parámetros de reportes guardados con éxito!")
      setTimeout(() => setMensaje(""), 4500)
    } catch (err: any) {
      setMensaje("⚠️ Error al guardar: " + (err.message || "Error desconocido"))
    } finally {
      setSaving(false)
    }
  }

  const handleEmpresaChange = (field: string, value: any) => {
    setEmpresa(prev => ({ ...prev, [field]: value }))
  }

  const handleParamChange = (field: string, value: any) => {
    setParams(prev => ({ ...prev, [field]: value }))
  }

  const totalAiu = Number(params.porcentaje_admin_default) + Number(params.porcentaje_imprevistos_default) + Number(params.porcentaje_utilidad_default)

  // Obtener técnico firmante activo
  const tecnicoFirmante = staffTecnico.find(t => t.id === reportesConfig.tecnico_firmante_id) || staffTecnico[0]

  if (loading) {
    return (
      <div className="p-12 flex flex-col justify-center items-center h-full">
        <Loader2 className="w-10 h-10 text-cyan-600 animate-spin mb-3" />
        <p className="text-gray-500 font-medium text-sm">Cargando parámetros y ficha empresarial...</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* HEADER DE PÁGINA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
            <ShieldCheck size={16} /> Configuración Maestra de la Empresa
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Building2 className="text-cyan-600 dark:text-cyan-400" size={30} />
            Datos de Empresa, Logotipo & Parámetros
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-2xl text-xs sm:text-sm">
            Ficha de identidad corporativa, logotipo oficial, geolocalización en tiempo real y parámetros para cálculo de presupuestos y firmas en reportes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:shadow-cyan-500/20 disabled:opacity-50 text-sm"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>Guardar Todos los Parámetros</span>
          </button>
        </div>
      </div>

      {mensaje && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all shadow-sm ${
          mensaje.includes("Error") || mensaje.includes("⚠️") 
            ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:border-red-900" 
            : "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900"
        }`}>
          <CheckCircle2 size={20} className={mensaje.includes("Error") ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"} />
          <span>{mensaje}</span>
        </div>
      )}

      {/* SELECTOR DE VIÑETAS (TABS) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        <button
          onClick={() => setActiveTab('empresa')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
            activeTab === 'empresa'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Building2 size={16} />
          <span>1. Identidad Corporativa, Logotipo & Geolocalización</span>
        </button>

        <button
          onClick={() => setActiveTab('reportes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
            activeTab === 'reportes'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <FileCheck2 size={16} />
          <span>2. Parámetros de Reportes, Membrete & Firmas</span>
        </button>

        <button
          onClick={() => setActiveTab('aiu')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
            activeTab === 'aiu'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <FileText size={16} />
          <span>3. Costos Indirectos (AIU) & Precisión Numérica</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">
            {totalAiu}% AIU
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sri')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
            activeTab === 'sri'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Landmark size={16} />
          <span>4. Políticas Tributarias & Retenciones SRI (2026)</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* ========================================================================= */}
        {/* VIÑETA 1: IDENTIDAD CORPORATIVA, LOGOTIPO, DIRECCIÓN JUNTO AL MAPA       */}
        {/* ========================================================================= */}
        {activeTab === 'empresa' && (
          <div className="space-y-6">
            
            {/* 1.1 Logotipo Oficial y Datos Generales de la Empresa */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 font-bold flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Building2 size={18} className="text-cyan-400" />
                  Datos Oficiales & Logotipo de la Empresa Constructora
                </div>
                <span className="text-xs bg-cyan-400/20 text-cyan-300 px-2.5 py-0.5 rounded-full font-medium">
                  RUC & Membrete
                </span>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Cuadro de Logotipo Oficial */}
                <div className="lg:col-span-1 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {logoBase64 ? (
                    <div className="space-y-3 w-full flex flex-col items-center">
                      <div className="w-full h-32 bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-inner">
                        <img 
                          src={logoBase64} 
                          alt="Logotipo Oficial" 
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100"
                        >
                          Cambiar
                        </button>
                        <button
                          type="button"
                          onClick={handleEliminarLogo}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-100"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                        <UploadCloud size={30} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Logotipo de la Empresa</p>
                        <p className="text-[10px] text-slate-400">PNG, JPG o SVG (máx. 2MB)</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-1 text-xs font-bold px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow hover:from-blue-700 hover:to-cyan-700 transition-all"
                      >
                        Subir Logotipo
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 mt-2 text-center">
                    Aparecerá en el encabezado de todos tus presupuestos, ofertas SERCOP y reportes PDF.
                  </p>
                </div>

                {/* Campos de Identidad Legal */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                      Razón Social Oficial (SRI / Registro Mercantil)
                    </label>
                    <input
                      type="text"
                      value={empresa.razon_social}
                      onChange={e => handleEmpresaChange('razon_social', e.target.value)}
                      placeholder="Ej. LIDER ARQUITECTURA"
                      className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Nombre legal registrado para contratos y facturación electrónica.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                      Nombre Comercial
                    </label>
                    <input
                      type="text"
                      value={empresa.nombre_comercial}
                      onChange={e => handleEmpresaChange('nombre_comercial', e.target.value)}
                      placeholder="Ej. ARQ-PRISMA"
                      className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Nombre comercial visible.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                      Número de RUC (Ecuador)
                    </label>
                    <input
                      type="text"
                      maxLength={13}
                      value={empresa.ruc}
                      onChange={e => handleEmpresaChange('ruc', e.target.value)}
                      placeholder="Ej. 1102978630001"
                      className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">13 dígitos reglamentarios.</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                      Gerente General / Representante Legal
                    </label>
                    <input
                      type="text"
                      value={empresa.gerente}
                      onChange={e => handleEmpresaChange('gerente', e.target.value)}
                      placeholder="Ej. JOSE DE LA CUADRA"
                      className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Suscribe ofertas técnicas y contratos legales.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* 1.2 DIRECCIÓN DE LA MATRIZ UBICADA JUNTO AL MAPA (Grid 2 Columnas) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-slate-800 text-white p-4 font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm uppercase tracking-wider">
                  <MapPin size={18} className="text-cyan-400" />
                  Dirección Matriz & Geolocalización Satelital Interactiva
                </div>

                <div className="flex items-center gap-2">
                  {isGeocoding && (
                    <span className="text-xs text-cyan-300 flex items-center gap-1 font-normal bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800 animate-pulse">
                      <Compass size={12} className="animate-spin" /> Buscando en mapa...
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleObtenerUbicacionGPS}
                    disabled={isLocating}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow transition-all hover:scale-102 disabled:opacity-50"
                  >
                    <Crosshair size={13} className={isLocating ? "animate-spin" : ""} />
                    <span>{isLocating ? "Detectando GPS..." : "📍 Mi Ubicación GPS en Vivo"}</span>
                  </button>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* COLUMNA IZQUIERDA: Formulario de Dirección Reactivo */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                        Provincia
                      </label>
                      <select
                        value={empresa.provincia}
                        onChange={e => handleProvinciaChange(e.target.value)}
                        className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        {Object.keys(PROVINCIAS_ECUADOR).map(prov => (
                          <option key={prov} value={prov}>{prov}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                        Cantón
                      </label>
                      <select
                        value={empresa.canton}
                        onChange={e => handleCantonChange(e.target.value)}
                        className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        {(PROVINCIAS_ECUADOR[empresa.provincia] || [empresa.canton]).map(cant => (
                          <option key={cant} value={cant}>{cant}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                      Ciudad / Parroquia
                    </label>
                    <input
                      type="text"
                      value={empresa.ciudad}
                      onChange={e => {
                        handleEmpresaChange('ciudad', e.target.value)
                        reubicarEnMapa(empresa.provincia, empresa.canton, e.target.value)
                      }}
                      placeholder="Ej. Quito / Iñaquito"
                      className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                      Calle Principal & Nomenclatura
                    </label>
                    <input
                      type="text"
                      value={empresa.calle_principal}
                      onChange={e => {
                        handleEmpresaChange('calle_principal', e.target.value)
                        // Disparar geocodificación reactiva con la nueva calle
                        reubicarEnMapa(empresa.provincia, empresa.canton, e.target.value)
                      }}
                      placeholder="Ej. Av. República del Salvador y N34"
                      className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Al escribir o cambiar la calle, el mapa se centra automáticamente.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                      Calle Secundaria / Edificio / Oficina
                    </label>
                    <input
                      type="text"
                      value={empresa.calle_secundaria}
                      onChange={e => handleEmpresaChange('calle_secundaria', e.target.value)}
                      placeholder="Ej. Edif. Prisma, Piso 5, Of. 502"
                      className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl border border-cyan-200 dark:border-cyan-900 text-[11px] text-cyan-900 dark:text-cyan-200 font-mono flex items-center justify-between">
                    <div>
                      <p className="font-bold">Coordenadas Exactas:</p>
                      <p>Lat: {empresa.latitud}</p>
                      <p>Lng: {empresa.longitud}</p>
                    </div>
                    <span className="text-[10px] text-cyan-700 dark:text-cyan-300 font-sans text-right max-w-[140px]">
                      Arrastra el pin en el mapa para afinar la ubicación.
                    </span>
                  </div>
                </div>

                {/* COLUMNA DERECHA: Mapa Satelital Interactivo con Pin Arrastrable */}
                <div className="lg:col-span-7 flex flex-col">
                  <div className="w-full h-80 lg:h-full min-h-[320px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative z-0 shadow-sm">
                    <MapComponent position={mapPosition} setPosition={setMapPosition} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 text-right">
                    💡 <b>Tip de Precisión:</b> Haz clic en el mapa o <b>arrastra el icono azul</b> directamente hacia la puerta de tu sede u obra.
                  </p>
                </div>

              </div>
            </div>

            {/* 1.3 Canales de Contacto & Redes Sociales */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-slate-800 text-white p-4 font-bold flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Share2 size={18} className="text-emerald-400" />
                  Canales de Contacto, Sitio Web & Redes Sociales
                </div>
                <span className="text-xs text-slate-300 font-mono">Digital & Atención</span>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                    Teléfono / WhatsApp Corporativo
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={empresa.telefono}
                      onChange={e => handleEmpresaChange('telefono', e.target.value)}
                      placeholder="+593 98 180 4023"
                      className="w-full border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-mono font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                    Correo Electrónico Oficial
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="email"
                      value={empresa.email}
                      onChange={e => handleEmpresaChange('email', e.target.value)}
                      placeholder="contacto@arqprisma.com"
                      className="w-full border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                    Sitio Web Corporativo
                  </label>
                  <div className="relative">
                    <Globe size={15} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="url"
                      value={empresa.sitio_web}
                      onChange={e => handleEmpresaChange('sitio_web', e.target.value)}
                      placeholder="https://arqprisma.com"
                      className="w-full border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                {/* Redes Sociales */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                    Facebook
                  </label>
                  <input
                    type="text"
                    value={empresa.facebook}
                    onChange={e => handleEmpresaChange('facebook', e.target.value)}
                    placeholder="https://facebook.com/arqprisma"
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={empresa.instagram}
                    onChange={e => handleEmpresaChange('instagram', e.target.value)}
                    placeholder="@arqprisma.ec"
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                    LinkedIn
                  </label>
                  <input
                    type="text"
                    value={empresa.linkedin}
                    onChange={e => handleEmpresaChange('linkedin', e.target.value)}
                    placeholder="linkedin.com/company/arqprisma"
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* 1.4 Ficha del Staff Técnico Colegiado */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-slate-900 text-white p-4 font-bold flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Users size={18} className="text-cyan-400" />
                  Staff Técnico Colegiado (Técnicos, Arquitectos & Ingenieros Civiles)
                </div>

                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all"
                >
                  <Plus size={14} />
                  <span>Agregar Profesional</span>
                </button>
              </div>

              <div className="p-6">
                <p className="text-xs text-slate-500 mb-4">
                  Profesionales legalmente acreditados con registro SENESCYT para firma de memorias de cálculo, planos estructurales, licitaciones SERCOP y dirección técnica de obra.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {staffTecnico.map((prof) => (
                    <div 
                      key={prof.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-cyan-500 transition-colors relative group"
                    >
                      <button
                        type="button"
                        onClick={() => handleEliminarStaff(prof.id)}
                        className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Eliminar profesional"
                      >
                        <Trash2 size={15} />
                      </button>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                          <HardHat size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{prof.nombre}</h4>
                          <span className="inline-block text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded mt-0.5">
                            {prof.cargo}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-mono text-[11px]">SENESCYT:</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{prof.senescyt || "En trámite"}</span>
                        </div>
                        {prof.telefono && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-mono text-[11px]">Tel:</span>
                            <span>{prof.telefono}</span>
                          </div>
                        )}
                        {prof.email && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-mono text-[11px]">Email:</span>
                            <span className="truncate max-w-[150px]">{prof.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIÑETA 2: PARÁMETROS DE REPORTES, MEMBRETE & FIRMAS                       */}
        {/* ========================================================================= */}
        {activeTab === 'reportes' && (
          <div className="space-y-6">
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white p-4 font-bold flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm uppercase tracking-wider">
                  <FileCheck2 size={18} className="text-indigo-400" />
                  Configuración del Membrete Oficial & Encabezado en Reportes (PDF / Excel)
                </div>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-medium">
                  Documentos Ejecuidos
                </span>
              </div>

              <div className="p-6 space-y-6">
                <p className="text-xs text-slate-500">
                  Selecciona qué elementos deben aparecer en la cabecera y el pie de página de los presupuestos, cronogramas Lookahead, informes de fiscalización y desgloses VAE.
                </p>

                {/* Selección de Elementos de Cabecera */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  
                  <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer hover:border-indigo-500 transition-colors">
                    <input
                      type="checkbox"
                      checked={reportesConfig.incluir_logo}
                      onChange={e => setReportesConfig(prev => ({ ...prev, incluir_logo: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Logotipo Oficial</p>
                      <p className="text-[10px] text-slate-400">Mostrar imagen en el encabezado izquierdo.</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer hover:border-indigo-500 transition-colors">
                    <input
                      type="checkbox"
                      checked={reportesConfig.incluir_razon_social}
                      onChange={e => setReportesConfig(prev => ({ ...prev, incluir_razon_social: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Razón Social & Marca</p>
                      <p className="text-[10px] text-slate-400">{empresa.razon_social} ({empresa.nombre_comercial})</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer hover:border-indigo-500 transition-colors">
                    <input
                      type="checkbox"
                      checked={reportesConfig.incluir_ruc}
                      onChange={e => setReportesConfig(prev => ({ ...prev, incluir_ruc: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Número de RUC</p>
                      <p className="text-[10px] text-slate-400">RUC: {empresa.ruc}</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer hover:border-indigo-500 transition-colors">
                    <input
                      type="checkbox"
                      checked={reportesConfig.incluir_direccion}
                      onChange={e => setReportesConfig(prev => ({ ...prev, incluir_direccion: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Dirección Completa</p>
                      <p className="text-[10px] text-slate-400">{empresa.ciudad}, {empresa.provincia}</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer hover:border-indigo-500 transition-colors">
                    <input
                      type="checkbox"
                      checked={reportesConfig.incluir_telefono}
                      onChange={e => setReportesConfig(prev => ({ ...prev, incluir_telefono: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Teléfono & WhatsApp</p>
                      <p className="text-[10px] text-slate-400">{empresa.telefono}</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer hover:border-indigo-500 transition-colors">
                    <input
                      type="checkbox"
                      checked={reportesConfig.incluir_qr}
                      onChange={e => setReportesConfig(prev => ({ ...prev, incluir_qr: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Código QR de Autenticidad</p>
                      <p className="text-[10px] text-slate-400">Verificación digital en tiempo real.</p>
                    </div>
                  </label>

                </div>
              </div>
            </div>

            {/* Técnico que Firmará los Informes Generados */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-slate-800 text-white p-4 font-bold flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm uppercase tracking-wider">
                  <PenTool size={18} className="text-cyan-400" />
                  Responsables de Firma en Informes y Presupuestos
                </div>
                <span className="text-xs text-slate-300 font-mono">Pie de Firma Oficial</span>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Selector del Profesional Firmante Principal */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                        Técnico que Firmará los Informes Generados (Firma Principal)
                      </label>
                      <select
                        value={reportesConfig.tecnico_firmante_id}
                        onChange={e => setReportesConfig(prev => ({ ...prev, tecnico_firmante_id: e.target.value }))}
                        className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-600"
                      >
                        {staffTecnico.map(prof => (
                          <option key={prof.id} value={prof.id}>
                            {prof.nombre} — {prof.cargo} ({prof.senescyt || "SENESCYT N/A"})
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Aparecerá en el bloque de firma de elaboración técnica del presupuesto y cronograma.
                      </p>
                    </div>

                    {/* Checkbox Segunda Firma */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={reportesConfig.segunda_firma_habilitada}
                          onChange={e => setReportesConfig(prev => ({ ...prev, segunda_firma_habilitada: e.target.checked }))}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Habilitar Segunda Firma (Aprobado por / Representante Legal)
                        </span>
                      </label>

                      {reportesConfig.segunda_firma_habilitada && (
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase">Nombre</label>
                            <input
                              type="text"
                              value={reportesConfig.segunda_firma_nombre}
                              onChange={e => setReportesConfig(prev => ({ ...prev, segunda_firma_nombre: e.target.value }))}
                              className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase">Cargo</label>
                            <input
                              type="text"
                              value={reportesConfig.segunda_firma_cargo}
                              onChange={e => setReportesConfig(prev => ({ ...prev, segunda_firma_cargo: e.target.value }))}
                              className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* VISTA PREVIA DEL PIE DE FIRMA EN VIVO */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full">
                        Vista Previa del Bloque de Firmas
                      </span>
                      <p className="text-xs text-slate-500 mt-2">
                        Así se estampará al final de tus entregables en PDF:
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-dashed border-slate-300 dark:border-slate-700">
                      {/* Firma 1: Técnico Responsable */}
                      <div className="text-center">
                        <div className="w-32 border-b border-slate-800 dark:border-slate-300 mx-auto mb-1.5"></div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {tecnicoFirmante?.nombre || "Ingeniero Responsable"}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {tecnicoFirmante?.cargo || "Responsable Técnico"}
                        </p>
                        <p className="text-[9px] font-mono text-slate-400">
                          REG. SENESCYT: {tecnicoFirmante?.senescyt || "1005-2026-000000"}
                        </p>
                        <p className="text-[9px] font-semibold text-blue-600 dark:text-cyan-400 mt-0.5">
                          {empresa.razon_social}
                        </p>
                      </div>

                      {/* Firma 2: Aprobación */}
                      {reportesConfig.segunda_firma_habilitada ? (
                        <div className="text-center">
                          <div className="w-32 border-b border-slate-800 dark:border-slate-300 mx-auto mb-1.5"></div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                            {reportesConfig.segunda_firma_nombre}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {reportesConfig.segunda_firma_cargo}
                          </p>
                          <p className="text-[9px] font-mono text-slate-400">
                            RUC: {empresa.ruc}
                          </p>
                          <p className="text-[9px] font-semibold text-blue-600 dark:text-cyan-400 mt-0.5">
                            {empresa.nombre_comercial}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center text-[10px] text-slate-400 italic">
                          (Segunda firma desactivada)
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIÑETA 3: COSTOS INDIRECTOS (AIU) & PRECISIÓN NUMÉRICA                     */}
        {/* ========================================================================= */}
        {activeTab === 'aiu' && (
          <div className="space-y-6">
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-emerald-700 text-white p-4 font-bold flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm uppercase tracking-wider">
                  <FileText size={18} />
                  3. Costos Indirectos (AIU) Predeterminados para Nuevos Presupuestos
                </div>
                <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-medium">Margen Base</span>
              </div>
              <div className="p-6">
                <p className="text-xs text-slate-500 mb-5">
                  Al crear un nuevo presupuesto en <strong>SARA-APU</strong>, estos porcentajes se aplicarán automáticamente como tu plantilla empresarial. Podrás ajustarlos individualmente por proyecto.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Gastos Generales / Admin (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={params.porcentaje_admin_default}
                        onChange={e => handleParamChange('porcentaje_admin_default', Number(e.target.value))}
                        className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-600 font-mono bg-white dark:bg-slate-800"
                      />
                      <Percent size={14} className="absolute right-3.5 top-3.5 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Costos de oficina técnica, ingeniería y dirección de obra.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Imprevistos de Obra (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={params.porcentaje_imprevistos_default}
                        onChange={e => handleParamChange('porcentaje_imprevistos_default', Number(e.target.value))}
                        className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-600 font-mono bg-white dark:bg-slate-800"
                      />
                      <Percent size={14} className="absolute right-3.5 top-3.5 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Fondo de contingencia para variaciones de campo.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Utilidad Empresarial Deseada (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={params.porcentaje_utilidad_default}
                        onChange={e => handleParamChange('porcentaje_utilidad_default', Number(e.target.value))}
                        className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-600 font-mono bg-white dark:bg-slate-800"
                      />
                      <Percent size={14} className="absolute right-3.5 top-3.5 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Margen neto objetivo antes de retenciones fiscales.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Herramienta Menor (% M.O.)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={params.herramienta_menor_default}
                        onChange={e => handleParamChange('herramienta_menor_default', Number(e.target.value))}
                        className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-600 font-mono bg-white dark:bg-slate-800"
                      />
                      <Percent size={14} className="absolute right-3.5 top-3.5 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Desgaste de palas, carretillas, flexómetros y equipo menor.</p>
                  </div>
                </div>

                {/* KPI Consolidado del Factor AIU */}
                <div className="mt-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-emerald-600 dark:text-emerald-400" size={18} />
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      Factor AIU Total de la Empresa:
                    </span>
                    <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-300">
                      {params.porcentaje_admin_default}% Admin + {params.porcentaje_imprevistos_default}% Imprevistos + {params.porcentaje_utilidad_default}% Utilidad = {totalAiu.toFixed(1)}% AIU
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    * Considerado automáticamente por los agentes de cálculo en presupuestos y cotizador.
                  </span>
                </div>
              </div>
            </div>

            {/* Precisión Decimal */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-slate-900 text-white p-4 font-bold flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Hash size={18} className="text-cyan-400" />
                  Precisión Decimal en Presupuestos y Reportes
                </div>
                <span className="text-xs text-slate-400 font-mono">Norma Ecuatoriana SERCOP</span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Cálculos Internos (Decimales)</label>
                  <input
                    type="number"
                    min="2"
                    max="6"
                    value={params.decimales_calculos}
                    onChange={e => handleParamChange('decimales_calculos', Number(e.target.value))}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50 dark:bg-slate-800/50"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Precisión de punto flotante para cálculo de recetas invisibles (Recomendado: 4).</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Cantidades de Obra (Decimales)</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={params.decimales_cantidades}
                    onChange={e => handleParamChange('decimales_cantidades', Number(e.target.value))}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50 dark:bg-slate-800/50"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Decimales visibles en volúmenes de obra m3, m2, kg (Recomendado: 2).</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Precios en Pantalla y PDF ($)</label>
                  <input
                    type="number"
                    min="2"
                    max="4"
                    value={params.decimales_precios}
                    onChange={e => handleParamChange('decimales_precios', Number(e.target.value))}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50 dark:bg-slate-800/50"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Decimales para exportación de ofertas al cliente y SERCOP (Recomendado: 2).</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIÑETA 4: POLÍTICAS TRIBUTARIAS & RETENCIONES SRI                         */}
        {/* ========================================================================= */}
        {activeTab === 'sri' && (
          <div className="space-y-6">
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 font-bold flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Landmark size={18} className="text-amber-400" />
                  4. Políticas Tributarias & Retenciones SRI (Ecuador 2026)
                </div>
                <span className="text-xs bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full font-medium">SARA-DASHBOARD SRI</span>
              </div>
              <div className="p-6 space-y-6">
                <p className="text-xs text-slate-500">
                  Estas variables alimentan las alertas y reservas preventivas de flujo de caja en <strong>SARA-DASHBOARD SRI</strong> para que tu constructora nunca sufra multas o descalces financieros al momento de liquidar impuestos.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Régimen Tributario de Tu Empresa</label>
                    <select
                      value={params.regimen_tributario}
                      onChange={e => handleParamChange('regimen_tributario', e.target.value)}
                      className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="general">Régimen General (Sociedades / Personas Naturales Obligadas)</option>
                      <option value="rimpe_emprendedor">RIMPE - Sector Emprendedores</option>
                      <option value="rimpe_popular">RIMPE - Negocio Popular</option>
                      <option value="contribuyente_especial">Contribuyente Especial Calificado SRI</option>
                    </select>
                    <p className="text-[11px] text-slate-400 mt-1">Define el formato de declaración semestral o mensual.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Tarifa IVA Vigente (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        value={params.tarifa_iva_vigente}
                        onChange={e => handleParamChange('tarifa_iva_vigente', Number(e.target.value))}
                        className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-600 font-mono bg-white dark:bg-slate-800"
                      />
                      <Percent size={14} className="absolute right-3.5 top-3.5 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Tarifa nacional oficial para construcción (15% según Ley Orgánica 2024-2026).</p>
                  </div>

                  <div className="flex flex-col justify-center">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">¿Eres Agente de Retención SRI?</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={params.es_agente_retencion}
                        onChange={e => handleParamChange('es_agente_retencion', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                        {params.es_agente_retencion ? "SÍ (Designado por Resolución SRI)" : "NO (Sujeto Pasivo Estándar)"}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Retención en la Fuente del Impuesto a la Renta (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.05"
                        value={params.retencion_renta_pct}
                        onChange={e => handleParamChange('retencion_renta_pct', Number(e.target.value))}
                        className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-600 font-mono bg-white dark:bg-slate-800"
                      />
                      <Percent size={14} className="absolute right-3.5 top-3.5 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Porcentaje habitual aplicado a contratos de obra civil y materiales (1.75% / 2.75%).</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Retención del IVA a Proveedores (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        value={params.retencion_iva_pct}
                        onChange={e => handleParamChange('retencion_iva_pct', Number(e.target.value))}
                        className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-600 font-mono bg-white dark:bg-slate-800"
                      />
                      <Percent size={14} className="absolute right-3.5 top-3.5 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Porcentaje de retención sobre el IVA liquidado (30% para bienes, 70% para servicios).</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* BOTÓN INFERIOR DE ACCIÓN GLOBAL */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Configuración activa para la Red Agéntica, Presupuestos y Reportes Oficiales.</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 text-sm"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>Guardar Todos los Parámetros</span>
          </button>
        </div>

      </form>

      {/* MODAL: AGREGAR PROFESIONAL AL STAFF TÉCNICO */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <HardHat size={18} className="text-cyan-600" />
                Registrar Profesional Técnico
              </h3>
              <button 
                onClick={() => setIsStaffModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAgregarStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={nuevoStaff.nombre}
                  onChange={e => setNuevoStaff(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej. Ing. Juan Diego Pérez"
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                  Cargo / Especialidad
                </label>
                <select
                  value={nuevoStaff.cargo}
                  onChange={e => setNuevoStaff(prev => ({ ...prev, cargo: e.target.value }))}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Ingeniero Civil Estructural">Ingeniero Civil Estructural</option>
                  <option value="Arquitecto Proyectista & BIM">Arquitecto Proyectista & BIM</option>
                  <option value="Ingeniero Residente de Obra">Ingeniero Residente de Obra</option>
                  <option value="Ingeniero Fiscalizador Colegiado">Ingeniero Fiscalizador Colegiado</option>
                  <option value="Ingeniero Hidrosanitario">Ingeniero Hidrosanitario</option>
                  <option value="Ingeniero Eléctrico">Ingeniero Eléctrico</option>
                  <option value="Topógrafo con Drones / GIS">Topógrafo con Drones / GIS</option>
                  <option value="Tecnólogo en Construcción Civil">Tecnólogo en Construcción Civil</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                  N° Registro SENESCYT
                </label>
                <input
                  type="text"
                  value={nuevoStaff.senescyt}
                  onChange={e => setNuevoStaff(prev => ({ ...prev, senescyt: e.target.value }))}
                  placeholder="Ej. 1005-2020-984321"
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={nuevoStaff.telefono}
                    onChange={e => setNuevoStaff(prev => ({ ...prev, telefono: e.target.value }))}
                    placeholder="+593 99..."
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                    Email
                  </label>
                  <input
                    type="email"
                    value={nuevoStaff.email}
                    onChange={e => setNuevoStaff(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="ingeniero@..."
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20"
                >
                  Guardar Profesional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
