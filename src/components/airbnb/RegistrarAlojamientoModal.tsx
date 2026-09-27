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
  Loader2,
  QrCode,
  ShieldCheck,
  Scale,
  Receipt,
  Percent,
  BadgeInfo,
  HelpCircle
} from "lucide-react"
import AirbnbCoordinatePickerWrapper from "@/components/ui/AirbnbCoordinatePickerWrapper"
import { GuestProfile } from "@/lib/services/guestAuth"
import { getStaysPolicies, StaysPolicies, DEFAULT_STAYS_POLICIES } from "@/lib/services/staysPoliciesService"

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
  initialPolicies?: StaysPolicies
}

export default function RegistrarAlojamientoModal({
  isOpen,
  onClose,
  onSuccess,
  activeGuest,
  existingCount,
  initialPolicies
}: RegistrarAlojamientoModalProps) {
  const [modalTab, setModalTab] = useState<"general" | "multimedia" | "anfitrion" | "caracteristicas" | "politicas">("general")
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [politicas, setPoliticas] = useState<StaysPolicies>(initialPolicies || DEFAULT_STAYS_POLICIES)
  const [isUploadingQr, setIsUploadingQr] = useState(false)
  const [nochesSimuladas, setNochesSimuladas] = useState(3)

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
    anfitrionQrCuenta: activeGuest?.qrCuenta || "",
    modeloMonetizacion: "comision_reserva",
    porcentajeComision: 15,
    cuotaFijaMensual: 45
  })

  // Validación: el título es el primer campo indispensable para desbloquear el flujo
  const isTituloValido = Boolean(formAlojamiento.titulo && formAlojamiento.titulo.trim().length > 0)

  // Control estricto de cambio de pestañas: no se puede saltar sin ingresar al menos el título
  const handleTabClick = (tabId: "general" | "multimedia" | "anfitrion" | "caracteristicas" | "politicas") => {
    if (tabId !== "general" && !isTituloValido) {
      setErrorMessage("Por favor ingresa primero el título del anuncio para habilitar y navegar a las siguientes pestañas.")
      return
    }
    setErrorMessage("")
    setModalTab(tabId)
  }

  // Limpiar y resetear el formulario cada vez que se abre el modal para crear nuevo alojamiento
  useEffect(() => {
    if (isOpen) {
      setModalTab("general")
      setErrorMessage("")
      if (initialPolicies) {
        setPoliticas(initialPolicies)
      }
      getStaysPolicies().then(p => {
        if (p) setPoliticas(p)
      })
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
        anfitrionTitular: activeGuest ? `${activeGuest.nombre} ${activeGuest.apellido || ""}`.trim() : prev.anfitrionTitular,
        anfitrionQrCuenta: activeGuest?.qrCuenta || prev.anfitrionQrCuenta || ""
      }))
    }
  }, [isOpen, generatedCode, activeGuest, initialPolicies])

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

  // Subir imagen del Código QR de la cuenta bancaria del anfitrión
  const handleDeviceQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido (.png, .jpg, .webp)")
      return
    }

    setIsUploadingQr(true)
    try {
      const fileExt = file.name.split(".").pop() || "png"
      const fileName = `qr-${formAlojamiento.codigo || "cta"}-${Date.now()}.${fileExt}`
      const filePath = `alojamientos/qr/${fileName}`

      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { error: uploadErr } = await supabase.storage
        .from("sara-assets")
        .upload(filePath, file, { upsert: true })

      if (!uploadErr) {
        const { data: { publicUrl } } = supabase.storage
          .from("sara-assets")
          .getPublicUrl(filePath)

        setFormAlojamiento(prev => ({
          ...prev,
          anfitrionQrCuenta: publicUrl
        }))
        setIsUploadingQr(false)
        return
      }
    } catch (err) {
      console.warn("Aviso subiendo QR a Supabase Storage, aplicando fallback base64:", err)
    }

    // Fallback seguro a Base64
    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target?.result as string
      if (base64Data) {
        setFormAlojamiento(prev => ({
          ...prev,
          anfitrionQrCuenta: base64Data
        }))
      }
      setIsUploadingQr(false)
    }
    reader.onerror = () => setIsUploadingQr(false)
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
          cuentaBancaria: formattedCuenta,
          qrCuenta: formAlojamiento.anfitrionQrCuenta
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
        <div className="px-4 sm:px-10 py-3 bg-white border-b border-slate-200 shrink-0 shadow-xs">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
            {/* Paso 1 */}
            <button
              type="button"
              onClick={() => handleTabClick("general")}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
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

            <div className="h-px w-4 sm:w-6 bg-slate-200 hidden md:block" />

            {/* Paso 2 */}
            <button
              type="button"
              disabled={!isTituloValido}
              onClick={() => handleTabClick("multimedia")}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                modalTab === "multimedia"
                  ? "bg-slate-900 text-white shadow-md ring-2 ring-slate-900/20 cursor-pointer"
                  : isTituloValido
                  ? "text-slate-600 hover:bg-slate-100 cursor-pointer"
                  : "text-slate-400 opacity-50 cursor-not-allowed"
              }`}
              title={!isTituloValido ? "Ingresa el título del anuncio para desbloquear" : "Fotos & Video"}
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

            <div className="h-px w-4 sm:w-6 bg-slate-200 hidden md:block" />

            {/* Paso 3 */}
            <button
              type="button"
              disabled={!isTituloValido}
              onClick={() => handleTabClick("anfitrion")}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                modalTab === "anfitrion"
                  ? "bg-slate-900 text-white shadow-md ring-2 ring-slate-900/20 cursor-pointer"
                  : isTituloValido
                  ? "text-slate-600 hover:bg-slate-100 cursor-pointer"
                  : "text-slate-400 opacity-50 cursor-not-allowed"
              }`}
              title={!isTituloValido ? "Ingresa el título del anuncio para desbloquear" : "Anfitrión & Banco"}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-black ${
                modalTab === "anfitrion" ? "bg-amber-400 text-slate-950" : "bg-slate-200 text-slate-700"
              }`}>3</span>
              <span>Anfitrión & Banco</span>
              {formAlojamiento.anfitrionQrCuenta && (
                <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-700 rounded-full font-bold">
                  QR ✓
                </span>
              )}
            </button>

            <div className="h-px w-4 sm:w-6 bg-slate-200 hidden md:block" />

            {/* Paso 4 */}
            <button
              type="button"
              disabled={!isTituloValido}
              onClick={() => handleTabClick("caracteristicas")}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                modalTab === "caracteristicas"
                  ? "bg-slate-900 text-white shadow-md ring-2 ring-slate-900/20 cursor-pointer"
                  : isTituloValido
                  ? "text-slate-600 hover:bg-slate-100 cursor-pointer"
                  : "text-slate-400 opacity-50 cursor-not-allowed"
              }`}
              title={!isTituloValido ? "Ingresa el título del anuncio para desbloquear" : "Checklist & Tarifas"}
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

            <div className="h-px w-4 sm:w-6 bg-slate-200 hidden md:block" />

            {/* Paso 5: Políticas, Comisiones & SRI */}
            <button
              type="button"
              disabled={!isTituloValido}
              onClick={() => handleTabClick("politicas")}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                modalTab === "politicas"
                  ? "bg-gradient-to-r from-slate-900 to-amber-950 text-white shadow-md ring-2 ring-amber-500/30 cursor-pointer"
                  : isTituloValido
                  ? "text-amber-800 bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/60 cursor-pointer"
                  : "text-slate-400 opacity-50 cursor-not-allowed"
              }`}
              title={!isTituloValido ? "Ingresa el título del anuncio para desbloquear" : "Políticas, Comisiones & Cancelaciones"}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-black ${
                modalTab === "politicas" ? "bg-amber-400 text-slate-950" : "bg-amber-200 text-amber-900"
              }`}>5</span>
              <span>Políticas & SRI</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-extrabold bg-amber-400/20 text-amber-700">
                50% Host
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

                  {/* Grilla de Fotos Cargadas */}
                  {formAlojamiento.imagenes.length === 0 ? (
                    <div className="text-center py-10 px-4 text-gray-400 border-2 border-dashed border-gray-300 rounded-2xl bg-white space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                        <ImageIcon size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700">Esta sección se encuentra limpia y lista para tus fotos</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Sube fotografías reales de tu inmueble desde tu dispositivo o ingresa un enlace web de alta resolución</p>
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

                {/* 3. Código QR de Cuenta Bancaria / DeUna / Transferencias Rápidas */}
                <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/90 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-amber-500/20 text-amber-800 rounded-lg">
                        <QrCode size={18} />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                          <span>3. Código QR de Cuenta Bancaria (DeUna / Banco Pichincha / Guayaquil / Produbanco)</span>
                        </h5>
                        <p className="text-[11px] text-amber-800/80">
                          Sube el código QR oficial de tu cuenta o monedero para agilizar el depósito automático de tus liquidaciones netas.
                        </p>
                      </div>
                    </div>

                    {formAlojamiento.anfitrionQrCuenta && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-300 shadow-2xs">
                        <Check size={11} strokeWidth={3} /> QR Vinculado
                      </span>
                    )}
                  </div>

                  {formAlojamiento.anfitrionQrCuenta ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-amber-200 shadow-2xs">
                      <div className="relative group w-32 h-32 sm:w-36 sm:h-36 bg-slate-50 rounded-xl overflow-hidden border-2 border-amber-400/80 shadow-inner flex items-center justify-center shrink-0">
                        <img
                          src={formAlojamiento.anfitrionQrCuenta}
                          alt="QR Bancario"
                          className="w-full h-full object-contain p-2"
                        />
                      </div>

                      <div className="space-y-2 text-center sm:text-left flex-1">
                        <div className="text-xs font-extrabold text-slate-800 flex items-center justify-center sm:justify-start gap-1.5">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          <span>Código QR activo para transferencias bancarias directas</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          La administración de SARA utilizará este código QR para transferir tus valores netos tras el check-in del huésped (descontando comisión e IVA/SRI) de forma rápida y sin demoras.
                        </p>
                        <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                          <label className="cursor-pointer px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs">
                            <Upload size={13} />
                            <span>Cambiar QR</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleDeviceQrUpload}
                              className="hidden"
                              disabled={isUploadingQr}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setFormAlojamiento(prev => ({ ...prev, anfitrionQrCuenta: "" }))}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border border-rose-200 cursor-pointer"
                          >
                            <Trash2 size={13} />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border-2 border-dashed border-amber-300 rounded-xl p-5 text-center space-y-2.5">
                      <div className="w-11 h-11 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                        <QrCode size={22} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          Sube el Código QR de tu Cuenta Bancaria o Billetera Móvil
                        </p>
                        <p className="text-[11px] text-slate-500 max-w-md mx-auto mt-0.5 leading-relaxed">
                          Admite imágenes o capturas de pantalla de códigos QR de Banco Pichincha, DeUna, Banco Guayaquil, Produbanco, JEP u otra entidad bancaria autorizada.
                        </p>
                      </div>
                      <div className="pt-1">
                        <label className="inline-flex cursor-pointer px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] text-slate-950 rounded-xl text-xs font-black transition-all items-center gap-2 shadow-sm">
                          {isUploadingQr ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              <span>Subiendo QR...</span>
                            </>
                          ) : (
                            <>
                              <Upload size={14} />
                              <span>Seleccionar Imagen del QR</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleDeviceQrUpload}
                            className="hidden"
                            disabled={isUploadingQr}
                          />
                        </label>
                      </div>
                    </div>
                  )}
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-amber-950">
                        Tarifa por Noche ($ USD) <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md">
                        Valor incluido impuestos (IVA)
                      </span>
                    </div>
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-amber-950">
                        Tarifa de Limpieza ($ USD) <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md">
                        Valor incluido impuestos (IVA)
                      </span>
                    </div>
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

            {/* ========================================================= */}
            {/* VIÑETA 5: POLÍTICAS, COMISIONES, RETENCIONES SRI & CANC. */}
            {/* ========================================================= */}
            {modalTab === "politicas" && (() => {
              const pNoche = Number(formAlojamiento.precioNoche) || 50
              const pLimpieza = Number(formAlojamiento.tarifaLimpieza) || 15
              const subtotalNochesSim = pNoche * nochesSimuladas
              const totalReservaSim = subtotalNochesSim + pLimpieza
              const anticipoCobradoSim = totalReservaSim * (politicas.porcentajeAnticipo / 100)
              const saldoCheckInSim = totalReservaSim - anticipoCobradoSim

              // Cálculo financiero con IVA incluido (Normativa SRI Ecuador)
              // Base Imponible = Total Reserva / (1 + IVA%)
              const baseSinIvaSim = totalReservaSim / (1 + (politicas.ivaPorcentaje / 100))
              const gastosAdmIvaSim = totalReservaSim - baseSinIvaSim
              // La comisión SARA se calcula sobre la BASE IMPONIBLE NETA
              const comisionSaraSim = baseSinIvaSim * (formAlojamiento.porcentajeComision / 100)
              // Valor a transferir al Anfitrión = Total Reserva Bruta - Comisión SARA - Gastos Administrativos
              const netoAnfitrionSim = totalReservaSim - comisionSaraSim - gastosAdmIvaSim

              // Compensaciones al anfitrión (50% de la penalización)
              const pctHostMas10 = (politicas.penalizacionMas10Dias * ((politicas.anfitrionSharePenalizacionMas10Dias ?? 50) / 100))
              const pctHost5a10 = (politicas.penalizacion5a10Dias * ((politicas.anfitrionSharePenalizacion5a10Dias ?? 50) / 100))
              const pctHost2a5 = (politicas.penalizacion2a5Dias * ((politicas.anfitrionSharePenalizacion2a5Dias ?? 50) / 100))
              const pctHost24h = (politicas.penalizacion24Horas * ((politicas.anfitrionSharePenalizacion24Horas ?? 50) / 100))

              const compHostMas10 = totalReservaSim * (pctHostMas10 / 100)
              const compHost5a10 = totalReservaSim * (pctHost5a10 / 100)
              const compHost2a5 = totalReservaSim * (pctHost2a5 / 100)
              const compHost24h = totalReservaSim * (pctHost24h / 100)

              return (
                <div className="space-y-6 animate-fadeIn">
                  {/* Banner de Cabecera */}
                  <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-md border border-amber-500/20 relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-400/30 shrink-0">
                          <ShieldCheck size={26} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h4 className="text-base sm:text-lg font-black tracking-tight text-white">
                              Políticas Oficiales, Comisiones SARA Stays & Facturación SRI
                            </h4>
                            <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                              SRI Legal • 50% Anfitrión
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                            Transparencia financiera garantizada: SARA Constructora & Hospitality gestiona el cobro centralizado, asume la facturación electrónica formal para el SRI y transfiere tu liquidación neta inmediatamente tras el check-in.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-right shrink-0">
                        <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">Anticipo al Reservar</span>
                        <strong className="text-lg font-black text-white">{politicas.porcentajeAnticipo}%</strong>
                        <span className="text-[10px] text-slate-300 block">Saldo al Check-in: {100 - politicas.porcentajeAnticipo}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Fila 1: Comisiones y Facturación SRI */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Tarjeta 1: Comisión de la Empresa y Facturación Electrónica */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                            <Receipt size={18} />
                          </div>
                          <div>
                            <h5 className="text-xs sm:text-sm font-extrabold text-slate-900">
                              Comisión de Plataforma & Gastos Administrativos
                            </h5>
                            <span className="text-[11px] text-slate-500">Valores deducibles aplicados a cada reserva confirmada</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-black bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md">
                          15% SARA
                        </span>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5">
                          <div className="flex items-center justify-between font-bold text-slate-800">
                            <span className="flex items-center gap-1.5">
                              <Percent size={13} className="text-amber-600" />
                              <span>Comisión SARA Stays (15%)</span>
                            </span>
                            <span className="text-amber-700 font-black">15.00%</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            Cubre la gestión multicanal, marketing digital, motor de reservas en tiempo real, soporte al huésped 24/7 y garantía de cobro seguro mediante pasarela bancaria.
                          </p>
                        </div>

                        <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/90 space-y-1.5">
                          <div className="flex items-center justify-between font-bold text-amber-950">
                            <span className="flex items-center gap-1.5">
                              <Receipt size={13} className="text-amber-700" />
                              <span>Gastos Administrativos & Facturación Electrónica SRI</span>
                            </span>
                            <span className="text-amber-900 font-black">{politicas.ivaPorcentaje}% IVA</span>
                          </div>
                          <p className="text-[11px] text-amber-900/80 leading-relaxed">
                            <strong>La empresa SARA se encarga de emitir la facturación electrónica con autorización directa del SRI al huésped</strong>. Se aplica el porcentaje de IVA de ley ({politicas.ivaPorcentaje}% general o la tarifa reducida en feriados turísticos oficiales decretados por el Gobierno) y las retenciones tributarias correspondientes.
                          </p>
                          <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md mt-1">
                            ✓ Te libera de trámites burocráticos de facturación con el huésped
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tarjeta 2: Flujo de Pagos & Liquidación al Check-in */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                            <Landmark size={18} />
                          </div>
                          <div>
                            <h5 className="text-xs sm:text-sm font-extrabold text-slate-900">
                              Flujo de Pago y Transferencia al Anfitrión
                            </h5>
                            <span className="text-[11px] text-slate-500">Garantía de cobro y liquidación sin esperas</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-black bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                          Post Check-in
                        </span>
                      </div>

                      <div className="space-y-3">
                        {/* Paso 1 */}
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                          <span className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                            1
                          </span>
                          <div className="text-xs">
                            <strong className="text-slate-900 block font-bold">Reserva con Anticipo ({politicas.porcentajeAnticipo}%)</strong>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              El huésped cancela el {politicas.porcentajeAnticipo}% a la cuenta central de SARA para confirmar y asegurar las fechas en el calendario.
                            </p>
                          </div>
                        </div>

                        {/* Paso 2 */}
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                          <span className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                            2
                          </span>
                          <div className="text-xs">
                            <strong className="text-slate-900 block font-bold">Check-in y Saldo del {100 - politicas.porcentajeAnticipo}%</strong>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              Al ingresar al alojamiento, el huésped cancela la diferencia restante ({100 - politicas.porcentajeAnticipo}%) para completar el 100% de la estadía.
                            </p>
                          </div>
                        </div>

                        {/* Paso 3 */}
                        <div className="flex items-start gap-3 p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200">
                          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                            3
                          </span>
                          <div className="text-xs">
                            <strong className="text-emerald-950 block font-bold">Transferencia Inmediata al Anfitrión (Cuenta / QR)</strong>
                            <p className="text-[11px] text-emerald-900/80 mt-0.5 leading-relaxed">
                              Una vez validado el Check-in, <strong>SARA transfiere el valor neto directamente a tu cuenta bancaria o código QR registrado</strong>, restando únicamente la comisión y los gastos administrativos/IVA de ley.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fila 2: Escala Oficial de Cancelaciones y Devoluciones (50% Anfitrión) */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-amber-500/10 text-amber-700 rounded-xl border border-amber-200">
                          <Scale size={20} />
                        </div>
                        <div>
                          <h5 className="text-sm font-black text-slate-900">
                            Escala de Penalizaciones por Cancelación & Participación del Anfitrión
                          </h5>
                          <p className="text-xs text-slate-500">
                            En toda cancelación por parte del huésped, <strong>el anfitrión recibe el {politicas.anfitrionSharePenalizacionMas10Dias}% de la penalización retenida</strong> como indemnización por bloqueo de fechas.
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-200">
                        {politicas.anfitrionSharePenalizacionMas10Dias}% para el Anfitrión
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
                      {/* Escala a: > 10 Días */}
                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-col justify-between space-y-2.5">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Anticipación</span>
                            <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Penalización {politicas.penalizacionMas10Dias}%
                            </span>
                          </div>
                          <h6 className="text-xs font-extrabold text-slate-900 pt-0.5">
                            a) MÁS de 10 días
                          </h6>
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                            Permite volver a comercializar las fechas con tiempo oportuno.
                          </p>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-slate-200 text-[11px]">
                          <div className="flex items-center justify-between font-bold bg-emerald-50 text-emerald-900 px-2 py-1 rounded-lg border border-emerald-200 text-[10px]">
                            <span>Comp. Anfitrión:</span>
                            <span className="font-black">{(politicas.penalizacionMas10Dias * ((politicas.anfitrionSharePenalizacionMas10Dias ?? 50) / 100)).toFixed(1)}% al anfitrión</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600 px-1 text-[10px]">
                            <span>SARA Gestión:</span>
                            <span className="font-semibold">{(politicas.penalizacionMas10Dias * ((100 - (politicas.anfitrionSharePenalizacionMas10Dias ?? 50)) / 100)).toFixed(1)}% a SARA</span>
                          </div>
                          <div className="flex items-center justify-between text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-semibold">
                            <span>Reembolso:</span>
                            <span className="font-bold">{Math.max(0, 100 - politicas.penalizacionMas10Dias)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Escala b: 5 a 10 Días */}
                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-col justify-between space-y-2.5">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Anticipación</span>
                            <span className="text-[11px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                              Penalización {politicas.penalizacion5a10Dias}%
                            </span>
                          </div>
                          <h6 className="text-xs font-extrabold text-slate-900 pt-0.5">
                            b) De 5 a 10 días
                          </h6>
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                            Ventana intermedia con impacto moderado en la agenda del anfitrión.
                          </p>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-slate-200 text-[11px]">
                          <div className="flex items-center justify-between font-bold bg-amber-50 text-amber-900 px-2 py-1 rounded-lg border border-amber-200 text-[10px]">
                            <span>Comp. Anfitrión:</span>
                            <span className="font-black">{(politicas.penalizacion5a10Dias * ((politicas.anfitrionSharePenalizacion5a10Dias ?? 50) / 100)).toFixed(1)}% al anfitrión</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600 px-1 text-[10px]">
                            <span>SARA Gestión:</span>
                            <span className="font-semibold">{(politicas.penalizacion5a10Dias * ((100 - (politicas.anfitrionSharePenalizacion5a10Dias ?? 50)) / 100)).toFixed(1)}% a SARA</span>
                          </div>
                          <div className="flex items-center justify-between text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-semibold">
                            <span>Reembolso:</span>
                            <span className="font-bold">{Math.max(0, 100 - politicas.penalizacion5a10Dias)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Escala c: 2 a 5 Días */}
                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-col justify-between space-y-2.5">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Anticipación</span>
                            <span className="text-[11px] font-black text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                              Penalización {politicas.penalizacion2a5Dias}%
                            </span>
                          </div>
                          <h6 className="text-xs font-extrabold text-slate-900 pt-0.5">
                            c) De 2 a 5 días
                          </h6>
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                            Aviso previo corto con alta dificultad para reubicar la estancia.
                          </p>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-slate-200 text-[11px]">
                          <div className="flex items-center justify-between font-bold bg-orange-50 text-orange-900 px-2 py-1 rounded-lg border border-orange-200 text-[10px]">
                            <span>Comp. Anfitrión:</span>
                            <span className="font-black">{(politicas.penalizacion2a5Dias * ((politicas.anfitrionSharePenalizacion2a5Dias ?? 50) / 100)).toFixed(1)}% al anfitrión</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600 px-1 text-[10px]">
                            <span>SARA Gestión:</span>
                            <span className="font-semibold">{(politicas.penalizacion2a5Dias * ((100 - (politicas.anfitrionSharePenalizacion2a5Dias ?? 50)) / 100)).toFixed(1)}% a SARA</span>
                          </div>
                          <div className="flex items-center justify-between text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-semibold">
                            <span>Reembolso:</span>
                            <span className="font-bold">{Math.max(0, 100 - politicas.penalizacion2a5Dias)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Escala d: Dentro de 24 Horas (Sin Devolución) */}
                      <div className="bg-rose-50/70 rounded-2xl p-3.5 border border-rose-200 flex flex-col justify-between space-y-2.5">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Última Hora</span>
                            <span className="text-[11px] font-black text-rose-700 bg-rose-200 px-2 py-0.5 rounded-full">
                              Penalización {politicas.penalizacion24Horas}%
                            </span>
                          </div>
                          <h6 className="text-xs font-extrabold text-rose-950 pt-0.5">
                            d) Dentro de las 24 horas
                          </h6>
                          <p className="text-[10px] text-rose-700 font-semibold leading-relaxed">
                            Cancelación in extremis: fechas bloqueadas sin reocupación posible.
                          </p>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-rose-200 text-[11px]">
                          <div className="flex items-center justify-between font-bold bg-rose-100 text-rose-900 px-2 py-1 rounded-lg border border-rose-300 text-[10px]">
                            <span>Comp. Anfitrión:</span>
                            <span className="font-black">{(politicas.penalizacion24Horas * ((politicas.anfitrionSharePenalizacion24Horas ?? 50) / 100)).toFixed(1)}% al anfitrión</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600 px-1 text-[10px]">
                            <span>SARA Gestión:</span>
                            <span className="font-semibold">{(politicas.penalizacion24Horas * ((100 - (politicas.anfitrionSharePenalizacion24Horas ?? 50)) / 100)).toFixed(1)}% a SARA</span>
                          </div>
                          <div className="flex items-center justify-between text-rose-700 bg-white px-2 py-0.5 rounded text-[10px] font-extrabold border border-rose-200">
                            <span>Reembolso:</span>
                            <span className="font-black text-rose-700">0% (Sin devolución)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100">
                      <span>Plazo oficial de reembolso y liquidación: <strong className="text-slate-700 font-bold">{politicas.diasReembolso}</strong></span>
                      <span>Método: <strong className="text-slate-700 font-bold">{politicas.metodoDevolucion}</strong></span>
                    </div>
                  </div>

                  {/* Fila 3: Simulador Financiero en Tiempo Real para este Alojamiento */}
                  <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 border border-amber-500/20 shadow-lg space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-amber-400 text-slate-950 rounded-xl font-black">
                          <DollarSign size={20} />
                        </div>
                        <div>
                          <h5 className="text-base font-black text-white">
                            Simulador Financiero en Tiempo Real para Tu Alojamiento
                          </h5>
                          <p className="text-xs text-slate-300">
                            Cálculo dinámico basado en tu tarifa configurada de ${formAlojamiento.precioNoche} USD/noche y limpieza de ${formAlojamiento.tarifaLimpieza} USD.
                          </p>
                        </div>
                      </div>

                      {/* Selector de Noches */}
                      <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
                        <span className="text-[10px] text-slate-400 font-bold px-2">Noches:</span>
                        {[1, 2, 3, 5, 7].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setNochesSimuladas(n)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              nochesSimuladas === n
                                ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                                : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      {/* Desglose de Operación */}
                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                          <span className="text-slate-400">Tarifa por Noche (IVA inc.):</span>
                          <span className="font-mono font-bold text-white">${pNoche.toFixed(2)} USD</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                          <span className="text-slate-400">Total Noches ({nochesSimuladas} noches):</span>
                          <span className="font-mono font-bold text-white">${subtotalNochesSim.toFixed(2)} USD</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                          <span className="text-slate-400">Tarifa de Limpieza (IVA inc.):</span>
                          <span className="font-mono font-bold text-white">+${pLimpieza.toFixed(2)} USD</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-slate-800 font-bold">
                          <span className="text-white">Total Reserva Bruta del Huésped (con IVA):</span>
                          <span className="font-mono font-black text-amber-400 text-sm">${totalReservaSim.toFixed(2)} USD</span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-slate-800/80 text-[11px] text-slate-400">
                          <span>Base Imponible neta (sin IVA):</span>
                          <span className="font-mono text-slate-300">${baseSinIvaSim.toFixed(2)} USD</span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-slate-800/80 text-[11px] text-slate-400">
                          <span>• Anticipo cobrado hoy a SARA ({politicas.porcentajeAnticipo}%):</span>
                          <span className="font-mono">${anticipoCobradoSim.toFixed(2)} USD</span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-slate-800/80 text-[11px] text-slate-400">
                          <span>• Saldo que abona el huésped al Check-in ({100 - politicas.porcentajeAnticipo}%):</span>
                          <span className="font-mono">${saldoCheckInSim.toFixed(2)} USD</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 text-rose-300 text-[11px]">
                          <span>- Comisión SARA Stays ({formAlojamiento.porcentajeComision}% s/base imponible neta):</span>
                          <span className="font-mono font-bold">-${comisionSaraSim.toFixed(2)} USD</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 text-amber-300 text-[11px]">
                          <span>- Gastos Adm. / Factura SRI (IVA {politicas.ivaPorcentaje}% extraído del total):</span>
                          <span className="font-mono font-bold">-${gastosAdmIvaSim.toFixed(2)} USD</span>
                        </div>
                      </div>

                      {/* Recuadro de Valor Neto Final */}
                      <div className="bg-slate-950/70 p-6 rounded-3xl border border-emerald-500/30 text-center space-y-4">
                        <div>
                          <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-400 block">
                            Valor a Transferir al Anfitrión (Post Check-in)
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            (Total Reserva Bruta - Comisión SARA - Gastos Administrativos)
                          </span>
                        </div>
                        <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 tracking-tight">
                          ${netoAnfitrionSim.toFixed(2)} <span className="text-lg font-bold text-emerald-200">USD</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed max-w-sm mx-auto">
                          Depositado íntegramente a tu cuenta de <strong className="text-white">{formAlojamiento.anfitrionBanco}</strong> {formAlojamiento.anfitrionQrCuenta ? "o mediante tu código QR registrado" : ""} inmediatamente tras verificar el check-in.
                        </p>

                        <div className="pt-3 border-t border-slate-800 text-[11px] text-left space-y-1">
                          <span className="font-bold text-amber-300 block">Indemnización si el huésped cancela la reserva:</span>
                          <div className="flex justify-between text-slate-300">
                            <span>a) Con &gt; 10 días ({pctHostMas10.toFixed(1)}% al anfitrión):</span>
                            <strong className="text-emerald-400 font-mono">+${compHostMas10.toFixed(2)} USD</strong>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>b) De 5 a 10 días ({pctHost5a10.toFixed(1)}% al anfitrión):</span>
                            <strong className="text-emerald-400 font-mono">+${compHost5a10.toFixed(2)} USD</strong>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>c) De 2 a 5 días ({pctHost2a5.toFixed(1)}% al anfitrión):</span>
                            <strong className="text-emerald-400 font-mono">+${compHost2a5.toFixed(2)} USD</strong>
                          </div>
                          <div className="flex justify-between text-rose-300 font-medium">
                            <span>d) Dentro de las 24 horas ({pctHost24h.toFixed(1)}% al anfitrión - Sin devolución):</span>
                            <strong className="text-emerald-400 font-mono">+${compHost24h.toFixed(2)} USD</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
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
                Paso {modalTab === "general" ? "1" : modalTab === "multimedia" ? "2" : modalTab === "anfitrion" ? "3" : modalTab === "caracteristicas" ? "4" : "5"} de 5:
                {" "}
                <strong className="text-slate-800">
                  {modalTab === "general"
                    ? "Ubicación & Mapa"
                    : modalTab === "multimedia"
                    ? "Fotos & Video"
                    : modalTab === "anfitrion"
                    ? "Anfitrión & Cuenta Bancaria"
                    : modalTab === "caracteristicas"
                    ? "Checklist & Tarifas"
                    : "Políticas, Comisiones & Devoluciones"}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {modalTab !== "general" && (
                <button
                  type="button"
                  onClick={() => {
                    if (modalTab === "politicas") setModalTab("caracteristicas")
                    else if (modalTab === "caracteristicas") setModalTab("anfitrion")
                    else if (modalTab === "anfitrion") setModalTab("multimedia")
                    else if (modalTab === "multimedia") setModalTab("general")
                  }}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <ChevronLeft size={16} />
                  <span>Anterior</span>
                </button>
              )}

              {modalTab !== "politicas" && (
                <button
                  type="button"
                  disabled={modalTab === "general" && !isTituloValido}
                  onClick={() => {
                    if (modalTab === "general") {
                      if (!isTituloValido) {
                        setErrorMessage("Por favor ingresa primero el título del anuncio para continuar.")
                        return
                      }
                      setErrorMessage("")
                      setModalTab("multimedia")
                    } else if (modalTab === "multimedia") {
                      setModalTab("anfitrion")
                    } else if (modalTab === "anfitrion") {
                      setModalTab("caracteristicas")
                    } else if (modalTab === "caracteristicas") {
                      setModalTab("politicas")
                    }
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 ${
                    modalTab === "general" && !isTituloValido
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none opacity-60 select-none"
                      : "bg-slate-900 hover:bg-slate-800 text-white shadow-md cursor-pointer active:scale-95"
                  }`}
                  title={modalTab === "general" && !isTituloValido ? "Debes ingresar al menos el título del anuncio para habilitar este botón" : "Siguiente"}
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
