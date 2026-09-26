"use client"
import React, { useState, useEffect } from "react"
import {
  Building,
  Lock,
  MapPin,
  ImageIcon,
  Users,
  CheckCircle2,
  DollarSign,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Upload,
  Plus,
  Trash2,
  Star,
  Video,
  Landmark,
  CreditCard,
  Bed,
  Bath,
  Sparkles,
  AlertCircle,
  Loader2
} from "lucide-react"
import AirbnbCoordinatePickerWrapper from "@/components/ui/AirbnbCoordinatePickerWrapper"
import { GuestProfile } from "@/lib/services/guestAuth"

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

interface RegistrarAlojamientoModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (nuevoAlojamiento: any) => void
  activeGuest: GuestProfile | null
  existingCount: number
}

export default function RegistrarAlojamientoModal({
  isOpen,
  onClose,
  onSuccess,
  activeGuest,
  existingCount
}: RegistrarAlojamientoModalProps) {
  const [modalTab, setModalTab] = useState<"general" | "multimedia" | "anfitrion" | "caracteristicas">("general")
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Código secuencial SARA-ALJ-0X
  const nextSeq = Math.max(existingCount + 1, 5)
  const generatedCode = `SARA-ALJ-0${nextSeq}`

  const [formAlojamiento, setFormAlojamiento] = useState({
    codigo: generatedCode,
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
    imagenUrl: "",
    imagenes: [] as string[],
    videoUrl: "",
    nuevaFotoUrl: "",
    amenidades: [
      "Internet/Wifi",
      "Smart TV",
      "Smart Lock (Self Check-in)",
      "Cafetera Nespresso",
      "Parqueadero Subterráneo",
      "Cocina Equipada",
      "Sala de Estar",
      "Comedor",
      "Vista al Río"
    ],
    nuevaAmenidad: "",
    descripcion: "Disfruta de una estadía inigualable en este exclusivo inmueble gestionado por SARA Hospitality, diseñado con acabados de primera calidad, conectividad total y atención personalizada.",
    reglasTexto: "Check-in: 15:00 a 22:00\nCheck-out: 11:00\nNo se permiten fiestas\nNo fumar dentro de la propiedad",
    publicado: true,
    // Anfitrión precompletado con activeGuest
    anfitrionNombre: activeGuest ? `${activeGuest.nombre} ${activeGuest.apellido || ""}`.trim() : "Patricio Carrasco",
    anfitrionTelefono: activeGuest?.telefono || "+593 981804023",
    anfitrionEmail: activeGuest?.email || "anfitrion@gmail.com",
    anfitrionCedulaRuc: activeGuest?.cedula || "0103492817",
    anfitrionBanco: "Banco Pichincha",
    anfitrionTipoCuenta: "Ahorros",
    anfitrionNumeroCuenta: "2201984532",
    anfitrionTitular: activeGuest ? `${activeGuest.nombre} ${activeGuest.apellido || ""}`.trim() : "Patricio Carrasco",
    modeloMonetizacion: "comision_reserva",
    porcentajeComision: 15,
    cuotaFijaMensual: 45
  })

  // Limpiar y resetear el formulario cada vez que se abre el modal para crear nuevo alojamiento
  useEffect(() => {
    if (isOpen) {
      setModalTab("general")
      setErrorMessage("")
      setFormAlojamiento(prev => ({
        ...prev,
        codigo: generatedCode,
        imagenUrl: "",
        imagenes: [],
        videoUrl: "",
        nuevaFotoUrl: "",
        anfitrionNombre: activeGuest ? `${activeGuest.nombre} ${activeGuest.apellido || ""}`.trim() : prev.anfitrionNombre,
        anfitrionTelefono: activeGuest?.telefono || prev.anfitrionTelefono,
        anfitrionEmail: activeGuest?.email || prev.anfitrionEmail,
        anfitrionCedulaRuc: activeGuest?.cedula || prev.anfitrionCedulaRuc,
        anfitrionTitular: activeGuest ? `${activeGuest.nombre} ${activeGuest.apellido || ""}`.trim() : prev.anfitrionTitular
      }))
    }
  }, [isOpen, generatedCode, activeGuest])

  if (!isOpen) return null

  // Subir fotos locales desde el dispositivo (FileReader -> Base64)
  const handleDevicePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return
      const reader = new FileReader()
      reader.onload = (uploadEvent) => {
        const base64Data = uploadEvent.target?.result as string
        if (base64Data) {
          setFormAlojamiento((prev) => {
            const nuevas = [...prev.imagenes, base64Data]
            return {
              ...prev,
              imagenes: nuevas,
              imagenUrl: prev.imagenUrl ? prev.imagenUrl : base64Data
            }
          })
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ""
  }

  // Subir video desde dispositivo
  const handleDeviceVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("video/")) {
      alert("Por favor selecciona un archivo de video válido (.mp4, .mov, etc.)")
      return
    }

    if (file.size > 80 * 1024 * 1024) {
      alert("El video supera el límite de 80MB. Te recomendamos usar un enlace de YouTube o comprimir el video.")
      return
    }

    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      const videoBase64 = uploadEvent.target?.result as string
      if (videoBase64) {
        setFormAlojamiento((prev) => ({
          ...prev,
          videoUrl: videoBase64
        }))
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const handleAddFoto = (url?: string) => {
    const targetUrl = url || formAlojamiento.nuevaFotoUrl
    if (!targetUrl.trim()) return

    setFormAlojamiento(prev => {
      const fotosActualizadas = [...prev.imagenes, targetUrl.trim()]
      return {
        ...prev,
        imagenes: fotosActualizadas,
        imagenUrl: prev.imagenUrl ? prev.imagenUrl : targetUrl.trim(),
        nuevaFotoUrl: ""
      }
    })
  }

  const handleRemoveFoto = (indexToRemove: number) => {
    setFormAlojamiento(prev => {
      const fotosFiltradas = prev.imagenes.filter((_, idx) => idx !== indexToRemove)
      const nuevaPortada = fotosFiltradas[0] || ""
      return {
        ...prev,
        imagenes: fotosFiltradas,
        imagenUrl: prev.imagenUrl === prev.imagenes[indexToRemove] ? nuevaPortada : prev.imagenUrl
      }
    })
  }

  const handleSetPortada = (url: string) => {
    setFormAlojamiento(prev => ({
      ...prev,
      imagenUrl: url
    }))
  }

  const handleToggleAmenidad = (label: string) => {
    setFormAlojamiento(prev => {
      const existe = prev.amenidades.includes(label)
      return {
        ...prev,
        amenidades: existe
          ? prev.amenidades.filter(a => a !== label)
          : [...prev.amenidades, label]
      }
    })
  }

  const handleAddCustomAmenidad = () => {
    if (!formAlojamiento.nuevaAmenidad.trim()) return
    const custom = formAlojamiento.nuevaAmenidad.trim()
    if (!formAlojamiento.amenidades.includes(custom)) {
      setFormAlojamiento(prev => ({
        ...prev,
        amenidades: [...prev.amenidades, custom],
        nuevaAmenidad: ""
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    if (!formAlojamiento.titulo.trim()) {
      setModalTab("general")
      setErrorMessage("Por favor ingresa el título del anuncio.")
      return
    }

    if (formAlojamiento.imagenes.length === 0) {
      setModalTab("multimedia")
      setErrorMessage("Por favor agrega al menos una fotografía para la galería del alojamiento.")
      return
    }

    if (!formAlojamiento.anfitrionNombre.trim() || !formAlojamiento.anfitrionCedulaRuc.trim()) {
      setModalTab("anfitrion")
      setErrorMessage("Por favor completa el nombre y cédula del anfitrión.")
      return
    }

    setIsSaving(true)

    try {
      const formattedCuenta = `${formAlojamiento.anfitrionBanco} ${formAlojamiento.anfitrionTipoCuenta} ${formAlojamiento.anfitrionNumeroCuenta}`.trim()
      const reglasArray = formAlojamiento.reglasTexto.split("\n").map(r => r.trim()).filter(Boolean)
      const imagenesFinal = formAlojamiento.imagenes.length > 0 ? formAlojamiento.imagenes : [formAlojamiento.imagenUrl]

      const payload = {
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
        imagenUrl: formAlojamiento.imagenUrl || imagenesFinal[0],
        imagenes: imagenesFinal,
        videoUrl: formAlojamiento.videoUrl,
        amenidades: formAlojamiento.amenidades,
        descripcion: formAlojamiento.descripcion,
        reglas: reglasArray,
        publicado: true,
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

      // Enviar a la Base de Datos
      const res = await fetch("/api/airbnb/alojamientos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        console.warn("Aviso guardando en BD:", errData)
      }

      // Formatear para el catálogo de la página
      const nuevoFrontend = {
        id: `ab-${Date.now()}`,
        codigo: payload.codigo,
        titulo: payload.titulo,
        tipo: payload.tipo,
        alcance: payload.alcance,
        pais: payload.pais,
        bandera: payload.bandera,
        ciudad: payload.ciudad,
        sector: payload.sector,
        lat: payload.lat,
        lng: payload.lng,
        precioNoche: payload.precioNoche,
        tarifaLimpieza: payload.tarifaLimpieza,
        rating: 5.0,
        reviewsCount: 1,
        isSuperhost: true,
        maxHuespedes: payload.maxHuespedes,
        camas: payload.camas,
        habitaciones: payload.habitaciones,
        banos: payload.banos,
        imagenes: imagenesFinal,
        videoUrl: payload.videoUrl,
        descripcion: payload.descripcion,
        amenidades: payload.amenidades,
        reglas: reglasArray
      }

      onSuccess(nuevoFrontend)
      onClose()
    } catch (err: any) {
      setErrorMessage(err.message || "Error al registrar el alojamiento.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen bg-slate-950/90 backdrop-blur-2xl flex flex-col overflow-hidden animate-fadeIn">
      <div className="w-full h-full bg-slate-50 flex flex-col overflow-hidden">
        {/* Header a Pantalla Completa de Alta Gama */}
        <div className="px-6 sm:px-10 py-4 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between shrink-0 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 rounded-2xl shadow-md border border-amber-300/30 shrink-0">
              <Building size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Registrar Nuevo Alojamiento SARA Stays
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  <Lock size={10} /> {formAlojamiento.codigo}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Configuración integral de ficha pública, geolocalización en tiempo real, multimedia, anfitrión y comisiones SARA.
              </p>
            </div>
          </div>

          {/* Acciones de Cabecera */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/10 shadow-sm"
              title="Cerrar ventana (Esc)"
            >
              <X size={16} />
              <span className="hidden sm:inline">Cerrar (Esc)</span>
            </button>
          </div>
        </div>

        {/* Stepper / Barra de Pasos Organizada */}
        <div className="px-6 sm:px-10 py-3 bg-white border-b border-slate-200 shrink-0 shadow-xs">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            {/* Paso 1 */}
            <button
              type="button"
              onClick={() => setModalTab("general")}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                modalTab === "general"
                  ? "bg-slate-900 text-white shadow-md ring-2 ring-slate-900/20"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-black ${
                modalTab === "general" ? "bg-amber-400 text-slate-950" : "bg-slate-200 text-slate-700"
              }`}>1</span>
              <span>Ubicación & Mapa</span>
            </button>

            <div className="h-px w-6 bg-slate-200 hidden md:block" />

            {/* Paso 2 */}
            <button
              type="button"
              onClick={() => setModalTab("multimedia")}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                modalTab === "multimedia"
                  ? "bg-slate-900 text-white shadow-md ring-2 ring-slate-900/20"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-black ${
                modalTab === "multimedia" ? "bg-amber-400 text-slate-950" : "bg-slate-200 text-slate-700"
              }`}>2</span>
              <span>Fotos & Video</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                modalTab === "multimedia" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
              }`}>
                {formAlojamiento.imagenes.length}
              </span>
            </button>

            <div className="h-px w-6 bg-slate-200 hidden md:block" />

            {/* Paso 3 */}
            <button
              type="button"
              onClick={() => setModalTab("anfitrion")}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                modalTab === "anfitrion"
                  ? "bg-slate-900 text-white shadow-md ring-2 ring-slate-900/20"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-black ${
                modalTab === "anfitrion" ? "bg-amber-400 text-slate-950" : "bg-slate-200 text-slate-700"
              }`}>3</span>
              <span>Anfitrión & Banco</span>
            </button>

            <div className="h-px w-6 bg-slate-200 hidden md:block" />

            {/* Paso 4 */}
            <button
              type="button"
              onClick={() => setModalTab("caracteristicas")}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                modalTab === "caracteristicas"
                  ? "bg-slate-900 text-white shadow-md ring-2 ring-slate-900/20"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-black ${
                modalTab === "caracteristicas" ? "bg-amber-400 text-slate-950" : "bg-slate-200 text-slate-700"
              }`}>4</span>
              <span>Checklist & Tarifas</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                modalTab === "caracteristicas" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
              }`}>
                {formAlojamiento.amenidades.length}
              </span>
            </button>
          </div>
        </div>

        {/* Alerta de Error */}
        {errorMessage && (
          <div className="mx-6 sm:mx-10 mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulario a Pantalla Completa */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-6 bg-slate-100/50">
            <div className="max-w-6xl mx-auto space-y-6 pb-8">
            {/* ========================================================= */}
            {/* VIÑETA 1: DATOS GENERALES & MAPA DE GEOLOCALIZACIÓN       */}
            {/* ========================================================= */}
            {modalTab === "general" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Tarjeta 1: Información de Registro y Clasificación */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-200 shrink-0">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900">
                          Identificación del Inmueble y Ubicación
                        </h4>
                        <p className="text-xs text-slate-500">
                          Datos de catalogación pública para los viajeros en SARA Stays.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fila 1: Código no editable + Título */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Lock size={12} className="text-amber-600" />
                        <span>Código del Sistema</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={formAlojamiento.codigo}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-mono font-black text-slate-800 select-all cursor-not-allowed shadow-inner"
                        />
                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        🔒 Secuencia única automatizada
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Título del Anuncio SARA Stays <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Master Suite de Diseño Contemporáneo Frente al Río Tomebamba"
                        value={formAlojamiento.titulo}
                        onChange={(e) => setFormAlojamiento({ ...formAlojamiento, titulo: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Fila 2: Alcance + Tipo + Ciudad + Sector */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Alcance Geográfico</label>
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
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                      >
                        <option value="nacional">🇪🇨 Nacional (Ecuador)</option>
                        <option value="internacional">🌎 Internacional</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Tipo de Hospedaje <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formAlojamiento.tipo}
                        onChange={(e) => setFormAlojamiento({ ...formAlojamiento, tipo: e.target.value as any })}
                        className="w-full px-3 py-2.5 bg-white border border-amber-400 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
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
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Ciudad</label>
                      <input
                        type="text"
                        required
                        placeholder="Cuenca"
                        value={formAlojamiento.ciudad}
                        onChange={(e) => setFormAlojamiento({ ...formAlojamiento, ciudad: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Sector / Barrio</label>
                      <input
                        type="text"
                        required
                        placeholder="Av. Ordóñez Lasso"
                        value={formAlojamiento.sector}
                        onChange={(e) => setFormAlojamiento({ ...formAlojamiento, sector: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Tarjeta 2: Geolocalización en el Mapa */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
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

                  {/* Componente Leaflet con interactividad y centrado de ciudad */}
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
            {/* VIÑETA 2: MULTIMEDIA (FOTOS & VIDEO & PORTADA)            */}
            {/* ========================================================= */}
            {modalTab === "multimedia" && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <ImageIcon size={16} className="text-orange-500" />
                      Galería Fotográfica y Video de Recorrido
                    </h4>
                    <p className="text-xs text-gray-500">
                      Sube fotos desde tu dispositivo o agrega enlaces web, define la foto principal de portada y añade video tour.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                      Agregar Fotos a la Galería
                    </label>

                    {/* Botón para subir fotos desde el dispositivo */}
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
                      placeholder="O ingresa enlace web de imagen: https://images.unsplash.com/photo-..."
                      value={formAlojamiento.nuevaFotoUrl}
                      onChange={(e) => setFormAlojamiento({ ...formAlojamiento, nuevaFotoUrl: e.target.value })}
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddFoto()}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Plus size={15} />
                      <span>Añadir Enlace</span>
                    </button>
                  </div>

                  {/* Accesos rápidos */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Ejemplos Rápidos:
                    </span>
                    {FOTO_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handleAddFoto(p.url)}
                        className="text-[11px] bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded transition-colors cursor-pointer"
                      >
                        + {p.name}
                      </button>
                    ))}
                  </div>

                  {/* Grilla de Fotos Cargadas */}
                  {formAlojamiento.imagenes.length === 0 ? (
                    <div className="text-center py-10 px-4 text-gray-400 border-2 border-dashed border-gray-300 rounded-2xl bg-white space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                        <ImageIcon size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700">Esta sección se encuentra limpia y lista para tus fotos</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Sube fotografías reales de tu inmueble desde tu dispositivo, ingresa un enlace o usa un ejemplo rápido</p>
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <label className="cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
                          <Upload size={14} />
                          <span>Subir Fotos desde tu Dispositivo</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleDevicePhotoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                      {formAlojamiento.imagenes.map((imgUrl, idx) => {
                        const isCover = formAlojamiento.imagenUrl === imgUrl
                        return (
                          <div
                            key={`${imgUrl}-${idx}`}
                            className={`relative rounded-xl overflow-hidden border-2 bg-gray-100 group transition-all ${
                              isCover ? "border-emerald-500 shadow-md ring-2 ring-emerald-200" : "border-gray-200"
                            }`}
                          >
                            <img
                              src={imgUrl}
                              alt={`Foto ${idx + 1}`}
                              className="w-full h-32 object-cover"
                            />

                            {/* Badge Portada */}
                            {isCover && (
                              <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow flex items-center gap-1 z-10">
                                <Star size={11} className="fill-white" />
                                <span>Portada Principal</span>
                              </div>
                            )}

                            {/* Barra de Acciones */}
                            <div className="p-2 bg-white flex items-center justify-between gap-1 border-t border-gray-100">
                              {!isCover ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetPortada(imgUrl)}
                                  className="text-[11px] font-bold text-gray-600 hover:text-emerald-700 flex items-center gap-1 transition-colors cursor-pointer"
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
                                className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
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

                {/* Sección Video Tour */}
                <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                      <Video size={14} className="text-orange-500" />
                      <span>Video del Recorrido Virtual</span>
                    </label>

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
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* VIÑETA 3: DATOS DEL ANFITRIÓN & CUENTA BANCARIA           */}
            {/* ========================================================= */}
            {modalTab === "anfitrion" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <Users size={16} className="text-orange-500" />
                      Datos del Anfitrión & Cuenta Bancaria para Pagos / Anticipos
                    </h4>
                    <p className="text-xs text-gray-500">
                      Información del dueño o anfitrión para remitir transferencias bancarias y liquidaciones netas de reservas.
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
                        <span className="text-[10px] text-amber-900 font-bold bg-amber-100 px-1.5 py-0.5 rounded">Identificación Oficial</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: 0103492817 o 1103711592"
                        value={formAlojamiento.anfitrionCedulaRuc}
                        onChange={(e) => setFormAlojamiento({ ...formAlojamiento, anfitrionCedulaRuc: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Cuenta Bancaria */}
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
                  </div>

                  {/* Resumen */}
                  <div className="bg-white p-3.5 rounded-lg border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-blue-900 font-medium gap-2 shadow-sm">
                    <div className="flex items-center gap-2">
                      <CreditCard size={18} className="text-blue-600 shrink-0" />
                      <span>
                        Destino de Liquidación: <strong className="font-bold">{formAlojamiento.anfitrionBanco}</strong> • {formAlojamiento.anfitrionTipoCuenta} No. <strong className="font-mono">{formAlojamiento.anfitrionNumeroCuenta || "---"}</strong>
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
            {/* VIÑETA 4: CARACTERÍSTICAS & CHECKLIST DE AMENIDADES       */}
            {/* ========================================================= */}
            {modalTab === "caracteristicas" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-orange-500" />
                      Capacidad, Checklist de Amenidades y Tarifas
                    </h4>
                    <p className="text-xs text-gray-500">
                      Configura la capacidad de huéspedes, comodidades ofrecidas, precios por noche y descripción.
                    </p>
                  </div>
                </div>

                {/* Capacidad y Precios */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-gray-200">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Bed size={13} className="text-orange-500" />
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
                      <Bath size={13} className="text-orange-500" />
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
                      <Bed size={13} className="text-orange-500" />
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
                      <Users size={13} className="text-orange-500" />
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

                {/* Tarifas Base */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/60 p-4 rounded-xl border border-amber-200">
                  <div>
                    <label className="block text-xs font-bold text-amber-950 mb-1">
                      Tarifa por Noche ($ USD) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-xs">$</span>
                      <input
                        type="number"
                        required
                        min={10}
                        value={formAlojamiento.precioNoche}
                        onChange={(e) => setFormAlojamiento({ ...formAlojamiento, precioNoche: Number(e.target.value) })}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-black text-gray-900 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-950 mb-1">
                      Tarifa de Limpieza ($ USD) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-xs">$</span>
                      <input
                        type="number"
                        required
                        min={0}
                        value={formAlojamiento.tarifaLimpieza}
                        onChange={(e) => setFormAlojamiento({ ...formAlojamiento, tarifaLimpieza: Number(e.target.value) })}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-gray-900 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Checklist de Lo Que Ofrece */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-orange-500" />
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
                          className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? "bg-emerald-50/80 border-emerald-400 text-emerald-950 font-bold shadow-2xs"
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

                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Agregar otra amenidad personalizada (Ej: Jacuzzi exterior, Sauna seco...)"
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
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
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
                      rows={3}
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
                      rows={3}
                      value={formAlojamiento.reglasTexto}
                      onChange={(e) => setFormAlojamiento({ ...formAlojamiento, reglasTexto: e.target.value })}
                      placeholder="Check-in: 15:00 a 22:00&#10;Check-out: 11:00&#10;No se permiten fiestas&#10;No fumar"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs leading-relaxed font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>

          {/* Footer Fijo a Pantalla Completa */}
          <div className="px-6 sm:px-10 py-4 border-t border-slate-200 bg-white flex items-center justify-between gap-4 shrink-0 shadow-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            {/* Indicador de Paso */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>
                Paso {modalTab === "general" ? "1" : modalTab === "multimedia" ? "2" : modalTab === "anfitrion" ? "3" : "4"} de 4:
                {" "}
                <strong className="text-slate-800">
                  {modalTab === "general" ? "Ubicación & Mapa" : modalTab === "multimedia" ? "Fotos & Video" : modalTab === "anfitrion" ? "Anfitrión & Liquidaciones" : "Tarifas & Amenidades"}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {modalTab !== "general" && (
                <button
                  type="button"
                  onClick={() => {
                    if (modalTab === "caracteristicas") setModalTab("anfitrion")
                    else if (modalTab === "anfitrion") setModalTab("multimedia")
                    else if (modalTab === "multimedia") setModalTab("general")
                  }}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <ChevronLeft size={16} />
                  <span>Anterior</span>
                </button>
              )}

              {modalTab !== "caracteristicas" && (
                <button
                  type="button"
                  onClick={() => {
                    if (modalTab === "general") setModalTab("multimedia")
                    else if (modalTab === "multimedia") setModalTab("anfitrion")
                    else if (modalTab === "anfitrion") setModalTab("caracteristicas")
                  }}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-black shadow-md transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>Siguiente</span>
                  <ChevronRight size={16} />
                </button>
              )}

              {/* Botón Naranja de Registrar Alojamiento */}
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:scale-[0.98] text-white rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-orange-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} strokeWidth={2.5} />
                    <span>Registrar Alojamiento</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
