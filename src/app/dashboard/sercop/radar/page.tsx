"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useProject } from "@/contexts/ProjectContext"
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Calendar, 
  ExternalLink, 
  CheckCircle2, 
  RefreshCw, 
  Layers, 
  ArrowRight,
  TrendingUp,
  Building2,
  AlertCircle,
  Sparkles,
  Loader2,
  Eye,
  FileCheck,
  ShieldCheck,
  Clock,
  Briefcase
} from "lucide-react"

export interface ProcesoSERCOP {
  id: string
  codigo_proceso: string
  entidad_contratante: string
  objeto_proceso: string
  tipo_contratacion: string
  provincia: string
  canton: string
  presupuesto_referencial: number
  fecha_publicacion: string
  fecha_limite_ofertas: string
  match_score_apu: number
  rubros_extraidos_total: number
  estado: string
  cpc_principal?: string
  umbral_vae_minimo?: number
}

// 24 Provincias y principales cantones
const PROVINCIAS_CANTONES: Record<string, string[]> = {
  "Loja": ["Loja", "Catamayo", "Saraguro", "Calvas", "Macará", "Paltas", "Puyango", "Celica", "Gonzanamá", "Zapotillo"],
  "Azuay": ["Cuenca", "Gualaceo", "Paute", "Santa Isabel", "Sigsig", "Chordeleg", "Girón"],
  "Pichincha": ["Quito", "Rumiñahui", "Mejía", "Cayambe", "Pedro Moncayo", "San Miguel de los Bancos"],
  "Guayas": ["Guayaquil", "Samborondón", "Daule", "Durán", "Milagro", "Salitre", "Playas", "Balao"],
  "El Oro": ["Machala", "Pasaje", "Santa Rosa", "Arenillas", "Huaquillas", "Piñas", "Zaruma"],
  "Manabí": ["Portoviejo", "Manta", "Chone", "Montecristi", "Jipijapa", "Sucre", "Pedernales"],
  "Tungurahua": ["Ambato", "Baños", "Pelileo", "Píllaro", "Cevallos", "Mocha"],
  "Chimborazo": ["Riobamba", "Guano", "Alausí", "Colta", "Chambo", "Pallatanga"],
  "Imbabura": ["Ibarra", "Otavalo", "Cotacachi", "Antonio Ante", "Pimampiro"],
  "Santo Domingo": ["Santo Domingo", "La Concordia"],
  "Zamora Chinchipe": ["Zamora", "Yantzaza", "El Pangui", "Centinela del Cóndor", "Chinchipe"],
  "Cañar": ["Azogues", "La Troncal", "Cañar", "Biblián", "El Tambo"],
  "Cotopaxi": ["Latacunga", "Pujilí", "Salcedo", "Saquisilí", "La Maná"],
  "Esmeraldas": ["Esmeraldas", "Atacames", "Quinindé", "San Lorenzo", "Muisne"],
  "Los Ríos": ["Babahoyo", "Quevedo", "Vinces", "Ventanas", "Buena Fe"],
  "Carchi": ["Tulcán", "Montúfar", "Espejo", "Mira", "Bolívar"],
  "Bolívar": ["Guaranda", "San Miguel", "Chimbo", "Caluma", "Echeandía"],
  "Pastaza": ["Puyo", "Mera", "Santa Clara", "Arajuno"],
  "Morona Santiago": ["Macas", "Gualaquiza", "Sucúa", "Limón Indanza", "Méndez"],
  "Napo": ["Tena", "Archidona", "El Chaco", "Quijos"],
  "Sucumbíos": ["Nueva Loja (Lago Agrio)", "Shushufindi", "Cuyabeno", "Putumayo"],
  "Orellana": ["Francisco de Orellana (Coca)", "La Joya de los Sachas", "Loreto"],
  "Santa Elena": ["Santa Elena", "La Libertad", "Salinas"],
  "Galápagos": ["Puerto Baquerizo Moreno", "Puerto Ayora", "Puerto Villamil"]
}

const PROCESOS_DEMO: ProcesoSERCOP[] = [
  {
    id: "sercop-001",
    codigo_proceso: "MCO-MUNIC-LOJA-012-2026",
    entidad_contratante: "GAD MUNICIPAL DEL CANTÓN LOJA",
    objeto_proceso: "REGENERACIÓN URBANA Y CONSTRUCCIÓN DE ACERAS, BORDILLOS Y DRENAJE PLUVIAL SECTOR PUNZARA ALTO",
    tipo_contratacion: "Menor Cuantía Obra",
    provincia: "Loja",
    canton: "Loja",
    presupuesto_referencial: 184520.45,
    fecha_publicacion: "2026-10-12T09:00:00Z",
    fecha_limite_ofertas: "2026-10-24T15:00:00Z",
    match_score_apu: 96.4,
    rubros_extraidos_total: 28,
    estado: "vigente",
    cpc_principal: "54122.00.1",
    umbral_vae_minimo: 40.0
  },
  {
    id: "sercop-002",
    codigo_proceso: "SIE-GADC-CUENCA-045-2026",
    entidad_contratante: "EMPRESA PÚBLICA DE VIVIENDA CUENCA (EMUVI)",
    objeto_proceso: "CONSTRUCCIÓN DE COMPLEJO HABITACIONAL MULTIFAMILIAR ETAPA 2 - ESTRUCTURA HORMIGÓN Y ALBAÑILERÍA",
    tipo_contratacion: "Subasta Inversa Electrónica",
    provincia: "Azuay",
    canton: "Cuenca",
    presupuesto_referencial: 642300.00,
    fecha_publicacion: "2026-10-10T14:30:00Z",
    fecha_limite_ofertas: "2026-10-28T16:00:00Z",
    match_score_apu: 91.8,
    rubros_extraidos_total: 64,
    estado: "vigente",
    cpc_principal: "54112.01.2",
    umbral_vae_minimo: 45.0
  },
  {
    id: "sercop-003",
    codigo_proceso: "MCO-GADM-MACHALA-008-2026",
    entidad_contratante: "ILUSTRE MUNICIPIO DE MACHALA",
    objeto_proceso: "PAVIMENTACIÓN CON CARPETA ASFÁLTICA Y OBRAS HIDROSANITARIAS BARRIO RAYITO DE LUZ",
    tipo_contratacion: "Menor Cuantía Obra",
    provincia: "El Oro",
    canton: "Machala",
    presupuesto_referencial: 320150.80,
    fecha_publicacion: "2026-10-11T11:00:00Z",
    fecha_limite_ofertas: "2026-10-22T17:00:00Z",
    match_score_apu: 88.5,
    rubros_extraidos_total: 35,
    estado: "vigente",
    cpc_principal: "54210.00.1",
    umbral_vae_minimo: 35.0
  },
  {
    id: "sercop-004",
    codigo_proceso: "CON-PREF-ZAMORA-003-2026",
    entidad_contratante: "GOBIERNO PROVINCIAL DE ZAMORA CHINCHIPE",
    objeto_proceso: "CONSULTORÍA PARA ESTUDIOS DEFINITIVOS DE IMPACTO AMBIENTAL Y CÁLCULO ESTRUCTURAL PUENTE RÍO ZAMORA",
    tipo_contratacion: "Consultoría",
    provincia: "Zamora Chinchipe",
    canton: "Zamora",
    presupuesto_referencial: 78900.00,
    fecha_publicacion: "2026-10-09T08:00:00Z",
    fecha_limite_ofertas: "2026-10-20T12:00:00Z",
    match_score_apu: 74.2,
    rubros_extraidos_total: 12,
    estado: "vigente",
    cpc_principal: "83321.00.1",
    umbral_vae_minimo: 60.0
  },
  {
    id: "sercop-005",
    codigo_proceso: "LICO-EPMMOP-UIO-019-2026",
    entidad_contratante: "EMPRESA METROPOLITANA DE MOVILIDAD Y OBRAS PÚBLICAS - QUITO",
    objeto_proceso: "REHABILITACIÓN VIAL INTEGRAL DEL CORREDOR INTEROCEÁNICO Y CONSTRUCCIÓN DE INTERCAMBIADOR CUMBAYÁ",
    tipo_contratacion: "Licitación",
    provincia: "Pichincha",
    canton: "Quito",
    presupuesto_referencial: 1850000.00,
    fecha_publicacion: "2026-10-12T16:00:00Z",
    fecha_limite_ofertas: "2026-11-05T17:00:00Z",
    match_score_apu: 94.5,
    rubros_extraidos_total: 82,
    estado: "vigente",
    cpc_principal: "54210.02.1",
    umbral_vae_minimo: 40.0
  },
  {
    id: "sercop-006",
    codigo_proceso: "COT-MUNIC-GYE-031-2026",
    entidad_contratante: "M.I. MUNICIPALIDAD DE GUAYAQUIL",
    objeto_proceso: "CONSTRUCCIÓN DE SISTEMA DE DRENAJE PLUVIAL Y COLECTORES PRINCIPALES PARROQUIA TARQUI",
    tipo_contratacion: "Cotización",
    provincia: "Guayas",
    canton: "Guayaquil",
    presupuesto_referencial: 920400.00,
    fecha_publicacion: "2026-10-11T10:00:00Z",
    fecha_limite_ofertas: "2026-10-30T15:00:00Z",
    match_score_apu: 89.1,
    rubros_extraidos_total: 45,
    estado: "vigente",
    cpc_principal: "54330.00.1",
    umbral_vae_minimo: 38.0
  },
  {
    id: "sercop-007",
    codigo_proceso: "MCO-GADM-MANTA-027-2026",
    entidad_contratante: "GOBIERNO AUTÓNOMO DESCENTRALIZADO DE MANTA",
    objeto_proceso: "CONSTRUCCIÓN DE PARQUE LINEAL TURÍSTICO Y MURO DE ESCOLLERA DE CONTENCIÓN PLAYA SAN MATEO",
    tipo_contratacion: "Menor Cuantía Obra",
    provincia: "Manabí",
    canton: "Manta",
    presupuesto_referencial: 275000.00,
    fecha_publicacion: "2026-10-10T11:20:00Z",
    fecha_limite_ofertas: "2026-10-25T16:00:00Z",
    match_score_apu: 92.0,
    rubros_extraidos_total: 31,
    estado: "vigente",
    cpc_principal: "54129.00.1",
    umbral_vae_minimo: 40.0
  },
  {
    id: "sercop-008",
    codigo_proceso: "MCO-GADMS-SANTO-DOMINGO-015-2026",
    entidad_contratante: "GAD MUNICIPAL DE SANTO DOMINGO",
    objeto_proceso: "ADECUACIÓN DE ESPACIOS PÚBLICOS, CANCHAS DEPORTIVAS Y BATERÍAS SANITARIAS COOP. CHE GUEVARA",
    tipo_contratacion: "Menor Cuantía Obra",
    provincia: "Santo Domingo",
    canton: "Santo Domingo",
    presupuesto_referencial: 145800.00,
    fecha_publicacion: "2026-10-13T10:00:00Z",
    fecha_limite_ofertas: "2026-10-26T15:00:00Z",
    match_score_apu: 95.0,
    rubros_extraidos_total: 22,
    estado: "vigente",
    cpc_principal: "54122.00.2",
    umbral_vae_minimo: 42.0
  }
]

export default function RadarLicitacionesSERCOP() {
  const router = useRouter()
  const { createProject, setActiveProject } = useProject()

  const [procesos, setProcesos] = useState<ProcesoSERCOP[]>(PROCESOS_DEMO)
  const [loading, setLoading] = useState(false)
  const [provincia, setProvincia] = useState("todas")
  const [canton, setCanton] = useState("todos")
  const [tipo, setTipo] = useState("todos")
  const [search, setSearch] = useState("")
  const [soloAltoMatch, setSoloAltoMatch] = useState(false)
  
  // Estado modal análisis de pliego
  const [procesoSeleccionado, setProcesoSeleccionado] = useState<ProcesoSERCOP | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [analizandoIA, setAnalizandoIA] = useState(false)
  const [diagnostico, setDiagnostico] = useState<any | null>(null)
  const [creandoObra, setCreandoObra] = useState<string | null>(null)

  // Cantones disponibles según provincia
  const cantonesDisponibles = useMemo(() => {
    if (provincia === "todas" || !PROVINCIAS_CANTONES[provincia]) return []
    return PROVINCIAS_CANTONES[provincia]
  }, [provincia])

  // Filtrado de procesos
  const procesosFiltrados = useMemo(() => {
    return procesos.filter(p => {
      if (provincia !== "todas" && p.provincia.toLowerCase() !== provincia.toLowerCase()) return false
      if (canton !== "todos" && p.canton.toLowerCase() !== canton.toLowerCase()) return false
      if (tipo !== "todos" && p.tipo_contratacion !== tipo) return false
      if (soloAltoMatch && p.match_score_apu < 85) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchText = p.codigo_proceso.toLowerCase().includes(q) ||
                          p.entidad_contratante.toLowerCase().includes(q) ||
                          p.objeto_proceso.toLowerCase().includes(q)
        if (!matchText) return false
      }
      return true
    })
  }, [procesos, provincia, canton, tipo, search, soloAltoMatch])

  // Métricas
  const totalMonto = useMemo(() => {
    return procesosFiltrados.reduce((acc, curr) => acc + curr.presupuesto_referencial, 0)
  }, [procesosFiltrados])

  // Acción 1-clic: Postular y convertir a Proyecto SERCOP
  const handleConvertirAProyecto = async (proceso: ProcesoSERCOP) => {
    try {
      setCreandoObra(proceso.id)
      const nombreObra = `${proceso.codigo_proceso} - ${proceso.objeto_proceso.substring(0, 50)}...`
      
      const nuevo = await createProject({
        nombre: nombreObra,
        ubicacion: `${proceso.canton}, ${proceso.provincia}`,
        provincia: proceso.provincia,
        descripcion: proceso.objeto_proceso,
        regimen: 'publico_sercop',
        codigo_proceso: proceso.codigo_proceso,
        entidad_contratante: proceso.entidad_contratante,
        presupuesto_referencial: proceso.presupuesto_referencial,
        fecha_limite: proceso.fecha_limite_ofertas,
        etapa_sercop: 'oferta'
      })

      if (nuevo) {
        setActiveProject(nuevo)
        // Redirigir directamente a la gestión de proyectos SERCOP o al presupuesto
        router.push('/dashboard/sercop/proyectos')
      }
    } catch (e: any) {
      alert("Error al postular en el proyecto SERCOP: " + e.message)
    } finally {
      setCreandoObra(null)
    }
  }

  // Analizar pliego con IA
  const handleAbrirAnalisisPliego = (proceso: ProcesoSERCOP) => {
    setProcesoSeleccionado(proceso)
    setModalAbierto(true)
    setAnalizandoIA(true)
    setDiagnostico(null)

    // Simular interpretación profunda de pliego normativo
    setTimeout(() => {
      setDiagnostico({
        resumen: `Proceso ${proceso.codigo_proceso} emitido por ${proceso.entidad_contratante}. Pliego de ${proceso.tipo_contratacion}. Requiere cumplimiento estricto de Valor Agregado Ecuatoriano (VAE) >= ${proceso.umbral_vae_minimo || 40}%.`,
        equipo_minimo: [
          "1x Retroexcavadora sobre orugas 130 HP (Mínimo)",
          "2x Volquetes de 8m3 con matrícula vigente",
          "1x Rodillo vibratorio autopropulsado 10 Ton",
          "1x Hormigonera de 1 saco (trompo)",
          "1x Estación total calibrada y nivel topográfico"
        ],
        personal_tecnico: [
          "1x Ingeniero Civil / Residente de Obra (Experiencia min. 3 años en pavimentación/obra civil)",
          "1x Especialista Ambiental / Seguridad Ocupacional",
          "1x Maestro Mayor de Obra calificado"
        ],
        rubros_clave: [
          { item: "01", rubro: "Replanteo y nivelación con equipo topográfico", unidad: "m2", cant: 3500, match: 98 },
          { item: "02", rubro: "Excavación a máquina en suelo natural y desalojo", unidad: "m3", cant: 1420, match: 95 },
          { item: "03", rubro: "Subbase granular clase 3 compactada", unidad: "m3", cant: 890, match: 96 },
          { item: "04", rubro: "Hormigón simple f'c=210 kg/cm2 en aceras e=10cm", unidad: "m2", cant: 2200, match: 99 },
          { item: "05", rubro: "Bordillo de hormigón simple h=40cm fundido en sitio", unidad: "m", cant: 1150, match: 94 },
          { item: "06", rubro: "Tubería PVC corrugado drenaje D=315mm", unidad: "m", cant: 450, match: 92 }
        ],
        recomendacion_sercop: "Verificar índices de precios INEC del mes anterior a la convocatoria. Se recomienda formular oferta con un 3.5% a 5% por debajo del referencial para optimizar puntuación en Subasta/Cotización sin caer en temeridad económica."
      })
      setAnalizandoIA(false)
    }, 900)
  }

  // Días restantes
  const calcularDiasRestantes = (fechaLimite: string) => {
    const diff = new Date(fechaLimite).getTime() - new Date().getTime()
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (dias < 0) return { texto: "Finalizado", color: "text-red-500 bg-red-50 dark:bg-red-950/40" }
    if (dias <= 3) return { texto: `🔥 Quedan ${dias} día${dias > 1 ? 's' : ''}`, color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800" }
    return { texto: `⏳ ${dias} días para entrega`, color: "text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800" }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner Header */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 md:p-8 text-white shadow-xl border border-blue-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={14} className="text-blue-400" />
              <span>Sistema Oficial SERCOP • Ecuador 2026</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Radar Nacional de Licitaciones SERCOP
            </h1>
            <p className="text-sm text-blue-200/80 max-w-2xl leading-relaxed">
              Explora en tiempo real las contrataciones públicas de los 221 cantones del Ecuador. 
              Convierte cualquier pliego en un espacio de trabajo con presupuestos APU y Matriz VAE en 1 solo clic.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => router.push('/dashboard/sercop/agente')}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/10 backdrop-blur-sm transition-all"
            >
              <Sparkles size={15} className="text-amber-400" />
              <span>Auditor Normativo IA</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/sercop/proyectos')}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <Building2 size={15} />
              <span>Mis Proyectos SERCOP</span>
            </button>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <div className="text-gray-400 text-[11px]">Procesos Visibles</div>
            <div className="text-lg font-black text-white mt-0.5">{procesosFiltrados.length}</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <div className="text-gray-400 text-[11px]">Bolsa Referencial</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">
              ${(totalMonto / 1000).toLocaleString('es-EC', { maximumFractionDigits: 1 })}k
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <div className="text-gray-400 text-[11px]">Región Prioritaria</div>
            <div className="text-lg font-black text-amber-300 mt-0.5">
              {provincia === "todas" ? "Nacional (24 Prov.)" : provincia}
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <div className="text-gray-400 text-[11px]">Compatibilidad APU</div>
            <div className="text-lg font-black text-blue-300 mt-0.5">92.4% Promedio</div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros Geográficos y Tipo de Contratación */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
            <Filter size={15} className="text-blue-600" />
            <span>Filtros Geográficos y Tipos de Procedimiento</span>
          </div>
          <button
            onClick={() => {
              setProvincia("todas")
              setCanton("todos")
              setTipo("todos")
              setSearch("")
              setSoloAltoMatch(false)
            }}
            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            Limpiar filtros
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Buscador de texto */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
              Buscar Código / Objeto
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="MCO-MUNIC..., hormigón, alcantarillado..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          {/* Selector de Provincia (24 Provincias) */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
              Provincia (24 Provincias)
            </label>
            <select
              value={provincia}
              onChange={e => {
                setProvincia(e.target.value)
                setCanton("todos")
              }}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800 dark:text-gray-200"
            >
              <option value="todas">🇪🇨 Todas las Provincias (Nacional)</option>
              {Object.keys(PROVINCIAS_CANTONES).sort().map(prov => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>
          </div>

          {/* Selector de Cantón dinámico */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
              Cantón / Jurisdicción
            </label>
            <select
              value={canton}
              disabled={provincia === "todas"}
              onChange={e => setCanton(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800 dark:text-gray-200 disabled:opacity-50"
            >
              <option value="todos">Todos los Cantones</option>
              {cantonesDisponibles.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Tipo de Contratación */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
              Régimen / Tipo de Contratación
            </label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800 dark:text-gray-200"
            >
              <option value="todos">Todos los Tipos de Compra</option>
              <option value="Menor Cuantía Obra">Menor Cuantía Obra (MCO)</option>
              <option value="Cotización">Cotización de Obras (COT)</option>
              <option value="Licitación">Licitación de Obras (LICO)</option>
              <option value="Subasta Inversa Electrónica">Subasta Inversa Electrónica (SIE)</option>
              <option value="Consultoría">Consultoría (CON)</option>
            </select>
          </div>
        </div>

        {/* Toggle para APU Match alto */}
        <div className="flex items-center gap-3 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={soloAltoMatch}
              onChange={e => setSoloAltoMatch(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Mostrar únicamente licitaciones con APU Match superior al 85%</span>
          </label>
        </div>
      </div>

      {/* Grid de Procesos SERCOP */}
      {procesosFiltrados.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-200 dark:border-slate-800 space-y-3">
          <Building2 size={40} className="mx-auto text-gray-300 dark:text-slate-700" />
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
            No se encontraron licitaciones activas con esos filtros
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Prueba seleccionando &quot;Todas las Provincias&quot; o borrando el término de búsqueda para ver más licitaciones nacionales.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {procesosFiltrados.map(proceso => {
            const diasAlerta = calcularDiasRestantes(proceso.fecha_limite_ofertas)
            const esCreando = creandoObra === proceso.id

            return (
              <div
                key={proceso.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Fila superior: Código y Alerta de Plazo */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                      {proceso.codigo_proceso}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diasAlerta.color}`}>
                      {diasAlerta.texto}
                    </span>
                  </div>

                  {/* Entidad y Ubicación */}
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <Building2 size={13} className="text-blue-600" />
                      <span className="truncate">{proceso.entidad_contratante}</span>
                    </h4>
                    <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5 font-medium">
                      <MapPin size={11} className="text-emerald-500" />
                      <span>{proceso.canton}, {proceso.provincia}</span>
                    </div>
                  </div>

                  {/* Objeto de contratación */}
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-100 line-clamp-2 leading-relaxed">
                    {proceso.objeto_proceso}
                  </p>

                  {/* Badges de Información Clave */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-slate-800/80">
                    <div className="p-2 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800">
                      <div className="text-[10px] text-gray-400 uppercase font-semibold">Presupuesto Referencial</div>
                      <div className="text-sm font-black text-gray-900 dark:text-white mt-0.5">
                        ${proceso.presupuesto_referencial.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                      <div className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-semibold flex items-center gap-1">
                        <Sparkles size={10} />
                        <span>SARA APU Match</span>
                      </div>
                      <div className="text-sm font-black text-blue-700 dark:text-blue-300 mt-0.5">
                        {proceso.match_score_apu}% ({proceso.rubros_extraidos_total} rubros)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAbrirAnalisisPliego(proceso)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      title="Analizar Pliego con IA SARA"
                    >
                      <Eye size={13} className="text-blue-600" />
                      <span>Ver Pliego & APUs</span>
                    </button>
                    <a
                      href="https://www.compraspublicas.gob.ec"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl border border-gray-200 dark:border-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      title="Abrir en Portal SERCOP Oficial"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>

                  <button
                    onClick={() => handleConvertirAProyecto(proceso)}
                    disabled={esCreando}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/20 transition-all disabled:opacity-50"
                  >
                    {esCreando ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Creando Proyecto SERCOP...</span>
                      </>
                    ) : (
                      <>
                        <span>🏛️ Postular / Crear Proyecto</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL: Análisis de Pliego con IA */}
      {modalAbierto && procesoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400">
                    {procesoSeleccionado.codigo_proceso}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold">
                    🏛️ Pliego SERCOP
                  </span>
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mt-1">
                  Diagnóstico Normativo & Desglose de Rubros APU
                </h3>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {analizandoIA ? (
              <div className="py-12 text-center space-y-3">
                <Loader2 size={32} className="animate-spin text-blue-600 mx-auto" />
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Agente SARA-SERCOP interpretando especificaciones técnicas y tabla de cantidades...
                </p>
                <p className="text-[11px] text-gray-400">
                  Extrayendo personal técnico, equipo mínimo, umbrales VAE y cruzando con banco de APUs.
                </p>
              </div>
            ) : diagnostico ? (
              <div className="space-y-4 text-xs">
                {/* Resumen */}
                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200 leading-relaxed">
                  <div className="font-bold flex items-center gap-1.5 mb-1 text-blue-800 dark:text-blue-300">
                    <Sparkles size={13} />
                    <span>Dictamen del Agente SARA-SERCOP</span>
                  </div>
                  {diagnostico.resumen}
                </div>

                {/* Rubros extraídos con match de APU */}
                <div>
                  <h4 className="font-extrabold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-1.5">
                    <Layers size={14} className="text-blue-600" />
                    <span>Tabla de Rubros Requeridos vs Banco APU SARA</span>
                  </h4>
                  <div className="border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 dark:bg-slate-950 text-gray-400 font-semibold text-[10px] uppercase">
                        <tr>
                          <th className="p-2.5">Item</th>
                          <th className="p-2.5">Descripción del Rubro</th>
                          <th className="p-2.5">Und</th>
                          <th className="p-2.5 text-right">Cantidad</th>
                          <th className="p-2.5 text-right">APU Match</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-[11px]">
                        {diagnostico.rubros_clave.map((r: any) => (
                          <tr key={r.item} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40">
                            <td className="p-2.5 font-mono text-gray-400">{r.item}</td>
                            <td className="p-2.5 font-bold text-gray-800 dark:text-gray-200">{r.rubro}</td>
                            <td className="p-2.5 text-gray-500">{r.unidad}</td>
                            <td className="p-2.5 text-right font-mono text-gray-800 dark:text-gray-200">{r.cant}</td>
                            <td className="p-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                              {r.match}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Requisitos de Equipo y Personal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 space-y-1.5">
                    <div className="font-bold text-gray-900 dark:text-white text-[11px] uppercase tracking-wider">
                      🚜 Equipo Mínimo Exigido
                    </div>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-300 text-[11px]">
                      {diagnostico.equipo_minimo.map((eq: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 size={12} className="text-blue-500 shrink-0 mt-0.5" />
                          <span>{eq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 space-y-1.5">
                    <div className="font-bold text-gray-900 dark:text-white text-[11px] uppercase tracking-wider">
                      👷 Personal Técnico Clave
                    </div>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-300 text-[11px]">
                      {diagnostico.personal_tecnico.map((pt: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Modal Acciones */}
                <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-2">
                  <button
                    onClick={() => setModalAbierto(false)}
                    className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      setModalAbierto(false)
                      handleConvertirAProyecto(procesoSeleccionado)
                    }}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                  >
                    <span>🏛️ Postular / Convertir a Proyecto SERCOP</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
