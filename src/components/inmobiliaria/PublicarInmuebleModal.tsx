"use client"
import { Percent } from "lucide-react"
import { getInmobiliariaConfig, InmobiliariaConfigCompleta, DEFAULT_INMOBILIARIA_CONFIG } from "@/lib/services/inmobiliariaPlanesService"
import dynamic from "next/dynamic"

import React, { useState, useRef, useCallback } from "react"
import {
  Building2,
  MapPin,
  Users,
  ImageIcon,
  ShieldCheck,
  Sparkles,
  X,
  Check,
  Sliders,
  UploadCloud,
  FileText,
  Home,
  CheckCircle2,
  Receipt,
  Trash2,
  Plus,
  Star
} from "lucide-react"

interface PublicarInmuebleModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (inmueble: any) => Promise<void>
  propietarioBase: {
    nombre: string
    email: string
    telefono: string
    cedula: string
  }
}

const DynamicModalMap = dynamic(() => import("@/components/inmobiliaria/ModalMap"), { ssr: false })

export default function PublicarInmuebleModal({ isOpen, onClose, onSave, propietarioBase }: PublicarInmuebleModalProps) {
  const [modalSubTab, setModalSubTab] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formInmueble, setFormInmueble] = useState({
    codigo: "", // Se autogenera al guardar o puede dejarlo en blanco
    titulo: "",
    tipo: "casa",
    modalidad: "venta",
    precio: 150000,
    ciudad: "Cuenca",
    sector: "",
    direccion: "",
    areaM2: 120,
    areaConstruidaM2: 100,
    habitaciones: 3,
    banos: 2,
    parqueaderos: 1,
    antiguedad: "A estrenar",
    descripcion: "",
    amenidades: ["Seguridad 24/7", "Área BBQ", "Acabados de Primera"],
    nuevaAmenidadInput: "",
    coordenadas: { lat: -2.8974, lng: -79.0045 },
    imagenUrl: "",
    galeriaImagenes: [] as string[],
    galeriaVideos: [] as string[],
    propietarioNombre: propietarioBase.nombre || "",
    propietarioTelefono: propietarioBase.telefono || "",
    propietarioEmail: propietarioBase.email || "",
    cuentaBancaria: {
      banco: "",
      tipoCuenta: "ahorros",
      numeroCuenta: "",
      titularCedula: propietarioBase.cedula || "",
      qrCuenta: ""
    },
    planPromocion: "destacado",
    tarifaMensual: 65,
    porcentajeComision: 3,
    legalidad: {
      escrituraPublica: '',
      certificadoGravamenes: '',
      pagoImpuestos: '',
      cedulaPropietario: '',
      observaciones: '',
      estado: 'pendiente'
    },
    mesesContratados: 1,
    descuentoPorcentaje: 0
  })

  // Geocodificación Automática
  const geocodeTimer = useRef<NodeJS.Timeout | null>(null)

  const [planesConfig, setPlanesConfig] = useState<InmobiliariaConfigCompleta>(DEFAULT_INMOBILIARIA_CONFIG)
  React.useEffect(() => {
    getInmobiliariaConfig().then(cfg => {
      setPlanesConfig(cfg)
      // Ajustar tarifa base en caso de ser necesario
      setFormInmueble(prev => ({
        ...prev,
        tarifaMensual: cfg.planes[prev.planPromocion as "basico" | "destacado" | "premium"]?.precioMensual || prev.tarifaMensual
      }))
    })
  }, [])

  
  const geocodeAddress = useCallback(async (query: string) => {
    if (!query.trim()) return
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`)
      const data = await response.json()
      if (data && data.length > 0) {
        setFormInmueble(prev => ({
          ...prev,
          coordenadas: {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
          }
        }))
      }
    } catch (error) {
      console.error("Geocoding error:", error)
    }
  }, [])

  const triggerGeocode = useCallback((city: string, sector: string, direccion: string) => {
    if (geocodeTimer.current) {
      clearTimeout(geocodeTimer.current)
    }
    const query = `${direccion} ${sector} ${city}`.trim()
    if (query) {
      geocodeTimer.current = setTimeout(() => {
        geocodeAddress(query)
      }, 500)
    }
  }, [geocodeAddress])

  const handleCityChange = (val: string) => {
    setFormInmueble(prev => {
      const next = { ...prev, ciudad: val }
      triggerGeocode(next.ciudad, next.sector, next.direccion)
      return next
    })
  }
  const handleSectorChange = (val: string) => {
    setFormInmueble(prev => {
      const next = { ...prev, sector: val }
      triggerGeocode(next.ciudad, next.sector, next.direccion)
      return next
    })
  }
  const handleDireccionChange = (val: string) => {
    setFormInmueble(prev => {
      const next = { ...prev, direccion: val }
      triggerGeocode(next.ciudad, next.sector, next.direccion)
      return next
    })
  }

  // Amenidades
  const handleAddAmenidad = () => {
    const valor = formInmueble.nuevaAmenidadInput.trim()
    if (!valor) return
    if (!formInmueble.amenidades.includes(valor)) {
      setFormInmueble(prev => ({
        ...prev,
        amenidades: [...prev.amenidades, valor],
        nuevaAmenidadInput: ""
      }))
    }
  }

  const handleRemoveAmenidad = (tag: string) => {
    setFormInmueble(prev => ({
      ...prev,
      amenidades: prev.amenidades.filter(a => a !== tag)
    }))
  }

  // Manejo de Imágenes (FileReader a Base64 - Simulado para simplificar en local)
  const handleUploadFotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            const url = event.target.result as string
            setFormInmueble(prev => {
              const list = [...(prev.galeriaImagenes || []), url]
              return {
                ...prev,
                galeriaImagenes: list,
                imagenUrl: prev.imagenUrl || url
              }
            })
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleRemoveFoto = (index: number) => {
    setFormInmueble(prev => {
      const list = [...prev.galeriaImagenes]
      const removed = list.splice(index, 1)[0]
      return {
        ...prev,
        galeriaImagenes: list,
        imagenUrl: prev.imagenUrl === removed ? (list[0] || "") : prev.imagenUrl
      }
    })
  }

  const handleSelectPortada = (url: string) => {
    setFormInmueble(prev => ({ ...prev, imagenUrl: url }))
  }

  const handleUploadQR = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormInmueble(prev => ({
            ...prev,
            cuentaBancaria: { ...prev.cuentaBancaria, qrCuenta: event.target!.result as string }
          }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadVideos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const url = URL.createObjectURL(file) // Para previsualización rápida
        setFormInmueble(prev => ({
          ...prev,
          galeriaVideos: [...prev.galeriaVideos, url]
        }))
      })
    }
  }

  const handleRemoveVideo = (index: number) => {
    setFormInmueble(prev => {
      const list = [...prev.galeriaVideos]
      list.splice(index, 1)
      return { ...prev, galeriaVideos: list }
    })
  }

  // Función para procesar archivos de legalidad (guardan solo el nombre o simulan subida por ahora)
  
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_DIM = 1200;
          if (width > height && width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          } else if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.onerror = (e) => reject(e);
      };
      reader.onerror = (e) => reject(e);
    });
  }

  const handleUploadLegalFile = (key: keyof typeof formInmueble.legalidad, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormInmueble(prev => ({
        ...prev,
        legalidad: {
          ...prev.legalidad,
          [key]: e.target.files![0].name
        }
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Autogenerar código si no tiene
    const finalInmueble = { ...formInmueble }
    if (!finalInmueble.codigo) {
      finalInmueble.codigo = `SARA-${finalInmueble.tipo.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`
    }
    if (!(finalInmueble as any).id) {
      (finalInmueble as any).id = crypto.randomUUID();
    }
    
    const payloadSize = JSON.stringify(finalInmueble).length;
    if (payloadSize > 4 * 1024 * 1024) {
      alert("Error: El peso total de las imágenes y documentos (" + (payloadSize / 1024 / 1024).toFixed(1) + " MB) excede el límite permitido (4 MB). Por favor elimina algunos archivos o sube PDFs más ligeros.");
      setIsSubmitting(false);
      return;
    }
    await onSave(finalInmueble)
    setIsSubmitting(false)
  }

  if (!isOpen) return null

  // Cálculo de facturación para viñeta 5
  // El precio del plan YA incluye IVA.
  const precioConIVA = formInmueble.tarifaMensual
  const precioMensualDescontado = precioConIVA * (1 - (formInmueble.descuentoPorcentaje / 100))
  const totalFinal = +(precioMensualDescontado * formInmueble.mesesContratados).toFixed(2)
  const subtotalSinIVA = +(totalFinal / 1.15).toFixed(2)
  const iva15 = +(totalFinal - subtotalSinIVA).toFixed(2)

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col animate-fadeIn overflow-hidden">
      <div className="bg-white w-full h-full flex flex-col justify-between relative overflow-hidden">
        
        {/* HEADER MODAL */}
        <div className="px-6 sm:px-10 pt-5 pb-4 border-b border-gray-100 bg-white shrink-0 shadow-xs relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-6 sm:right-10 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
          >
            <X size={22} />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl shrink-0">
              <Building2 size={26} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                Publicar Inmueble & Configurar Cobro
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Sube la información de tu propiedad para que sea verificada y publicada en el catálogo de SARA.
              </p>
            </div>
          </div>
          
          {/* TABS */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1.5 bg-gray-100/90 rounded-2xl max-w-4xl">
            {[
              { id: 1, label: "1. Inmueble & Mapa", icon: MapPin },
              { id: 2, label: "2. Propietario & Banco", icon: Users },
              { id: 3, label: "3. Fotos & Videos", icon: ImageIcon },
              { id: 4, label: "4. Verificar Legalidad", icon: ShieldCheck },
              { id: 5, label: "5. Plan & Cobro", icon: Sparkles }
            ].map((tab) => {
              const IconComponent = tab.icon
              const isActive = modalSubTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setModalSubTab(tab.id as any)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive ? "bg-white text-slate-900 shadow-sm ring-1 ring-gray-200" : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <IconComponent size={16} className={isActive ? "text-emerald-500" : "text-gray-400"} />
                  <span className="truncate">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* FORM CONTENT */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6 space-y-6">
            
            {/* TAB 1: INMUEBLE Y MAPA */}
            {modalSubTab === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-slate-50 p-5 rounded-2xl border border-gray-200 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                    <Home size={15} className="text-emerald-500" />
                    Identificación y Precio del Inmueble
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Código (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Autogenerado"
                        value={formInmueble.codigo}
                        readOnly={true}
                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-xl text-xs font-bold text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Título de la Publicación</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Casa de Lujo en Challuabamba con Jardín Privado y Vista Panorámica"
                        value={formInmueble.titulo}
                        onChange={(e) => setFormInmueble({ ...formInmueble, titulo: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Propiedad</label>
                      <select
                        value={formInmueble.tipo}
                        onChange={(e) => setFormInmueble({ ...formInmueble, tipo: e.target.value as any })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold"
                      >
                        <option value="casa">Casa</option>
                        <option value="departamento">Departamento</option>
                        <option value="terreno">Terreno</option>
                        <option value="quinta">Quinta</option>
                        <option value="suite">Suite</option>
                        <option value="local">Local Comercial</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Modalidad Comercial</label>
                      <select
                        value={formInmueble.modalidad}
                        onChange={(e) => setFormInmueble({ ...formInmueble, modalidad: e.target.value as any })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold"
                      >
                        <option value="venta">Venta</option>
                        <option value="arriendo">Arriendo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Precio Solicitado ($ USD)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formInmueble.precio}
                        onChange={(e) => setFormInmueble({ ...formInmueble, precio: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-emerald-400 rounded-xl text-xs font-black text-emerald-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                    <Sliders size={15} className="text-emerald-500" />
                    Características Físicas de la Ficha Técnica
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-gray-200">
                      <label className="block text-[10px] font-extrabold uppercase text-gray-500 mb-1">m² tot. (Terreno)</label>
                      <input type="number" required min="0" value={formInmueble.areaM2} onChange={(e) => setFormInmueble({ ...formInmueble, areaM2: Number(e.target.value) })} className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-black text-gray-900" />
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-gray-200">
                      <label className="block text-[10px] font-extrabold uppercase text-gray-500 mb-1">m² cub. (Const.)</label>
                      <input type="number" min="0" value={formInmueble.areaConstruidaM2} onChange={(e) => setFormInmueble({ ...formInmueble, areaConstruidaM2: Number(e.target.value) })} className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-black text-gray-900" />
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-gray-200">
                      <label className="block text-[10px] font-extrabold uppercase text-gray-500 mb-1">Baños</label>
                      <input type="number" step="0.5" min="0" value={formInmueble.banos} onChange={(e) => setFormInmueble({ ...formInmueble, banos: Number(e.target.value) })} className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-black text-gray-900" />
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-gray-200">
                      <label className="block text-[10px] font-extrabold uppercase text-gray-500 mb-1">Parqueaderos</label>
                      <input type="number" min="0" value={formInmueble.parqueaderos} onChange={(e) => setFormInmueble({ ...formInmueble, parqueaderos: Number(e.target.value) })} className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-black text-gray-900" />
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-gray-200">
                      <label className="block text-[10px] font-extrabold uppercase text-gray-500 mb-1">Habitaciones</label>
                      <input type="number" min="0" value={formInmueble.habitaciones} onChange={(e) => setFormInmueble({ ...formInmueble, habitaciones: Number(e.target.value) })} className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-black text-gray-900" />
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-gray-200">
                      <label className="block text-[10px] font-extrabold uppercase text-gray-500 mb-1">Antigüedad</label>
                      <select value={formInmueble.antiguedad} onChange={(e) => setFormInmueble({ ...formInmueble, antiguedad: e.target.value })} className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-black text-gray-900">
                        <option value="A estrenar">A estrenar</option>
                        <option value="En construcción">En construcción</option>
                        <option value="1 a 5 años">1 a 5 años</option>
                        <option value="5 a 10 años">5 a 10 años</option>
                        <option value="Más de 10 años">Más de 10 años</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Descripción Detallada</label>
                    <textarea rows={4} required value={formInmueble.descripcion} onChange={(e) => setFormInmueble({ ...formInmueble, descripcion: e.target.value })} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900" />
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-gray-200 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                    <MapPin size={15} className="text-emerald-500" />
                    Ubicación y Geolocalización
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Ciudad</label>
                      <input type="text" required value={formInmueble.ciudad} onChange={(e) => handleCityChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Sector / Zona</label>
                      <input type="text" value={formInmueble.sector} onChange={(e) => handleSectorChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Dirección Exacta</label>
                      <input type="text" value={formInmueble.direccion} onChange={(e) => handleDireccionChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900" />
                    </div>
                  </div>
                  <div className="h-64 sm:h-72 bg-gray-200 rounded-xl overflow-hidden relative border border-gray-300"
                  >
                    <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-gray-700 font-bold border border-gray-200 pointer-events-none">📍 Arrastra el marcador para precisar tu ubicación exacta</div>
                    <DynamicModalMap lat={formInmueble.coordenadas.lat} lng={formInmueble.coordenadas.lng} onChange={(lat, lng) => setFormInmueble({ ...formInmueble, coordenadas: { lat, lng } })} />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PROPIETARIO Y BANCO */}
            {modalSubTab === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                    <Users size={15} className="text-emerald-500" />
                    Datos del Propietario (Registrado)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Completo</label>
                      <input type="text" readOnly value={formInmueble.propietarioNombre} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono</label>
                      <input type="text" readOnly value={formInmueble.propietarioTelefono} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Correo Electrónico</label>
                      <input type="email" readOnly value={formInmueble.propietarioEmail} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                    <Building2 size={15} className="text-emerald-500" />
                    Datos Bancarios para Recibir Pagos (Opcional)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Banco / Institución</label>
                      <input 
                        type="text" 
                        placeholder="Ej. Banco Pichincha" 
                        value={formInmueble.cuentaBancaria.banco} 
                        onChange={(e) => setFormInmueble({ ...formInmueble, cuentaBancaria: { ...formInmueble.cuentaBancaria, banco: e.target.value } })} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Cuenta</label>
                      <select 
                        value={formInmueble.cuentaBancaria.tipoCuenta} 
                        onChange={(e) => setFormInmueble({ ...formInmueble, cuentaBancaria: { ...formInmueble.cuentaBancaria, tipoCuenta: e.target.value as any } })} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900"
                      >
                        <option value="ahorros">Ahorros</option>
                        <option value="corriente">Corriente</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Número de Cuenta</label>
                      <input 
                        type="text" 
                        value={formInmueble.cuentaBancaria.numeroCuenta} 
                        onChange={(e) => setFormInmueble({ ...formInmueble, cuentaBancaria: { ...formInmueble.cuentaBancaria, numeroCuenta: e.target.value } })} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 font-medium" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Cédula / RUC</label>
                      <input 
                        type="text" 
                        value={formInmueble.cuentaBancaria.titularCedula} 
                        onChange={(e) => setFormInmueble({ ...formInmueble, cuentaBancaria: { ...formInmueble.cuentaBancaria, titularCedula: e.target.value } })} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900" 
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Código QR de la Cuenta (Opcional)</label>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-300">
                        <UploadCloud size={14} /> Subir Imagen QR
                        <input type="file" accept="image/*" className="hidden" onChange={handleUploadQR} />
                      </label>
                      {formInmueble.cuentaBancaria.qrCuenta && (
                        <div className="h-16 w-16 rounded border border-gray-200 overflow-hidden relative group">
                          <img src={formInmueble.cuentaBancaria.qrCuenta} alt="QR" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setFormInmueble(prev => ({ ...prev, cuentaBancaria: { ...prev.cuentaBancaria, qrCuenta: "" } }))} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: FOTOS Y VIDEOS */}
            {modalSubTab === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                      <ImageIcon size={15} className="text-emerald-500" />
                      Galería de Imágenes
                    </h4>
                    <label className="cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
                      <UploadCloud size={14} /> Subir Fotos
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleUploadFotos} />
                    </label>
                  </div>
                  {formInmueble.galeriaImagenes.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                      <ImageIcon size={40} className="text-gray-300 mb-3" />
                      <p className="text-sm font-bold text-gray-700">Sin imágenes</p>
                      <p className="text-xs text-gray-500 mt-1">Sube al menos 1 imagen para la ficha técnica.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {formInmueble.galeriaImagenes.map((url, idx) => {
                        const isPortada = url === formInmueble.imagenUrl
                        return (
                          <div key={idx} className={`relative aspect-square rounded-xl overflow-hidden group border-2 ${isPortada ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-2 ring-emerald-500 scale-105' : 'border-gray-200'}`}>
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                              {!isPortada && (
                                <button type="button" onClick={() => handleSelectPortada(url)} className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-600">
                                  Hacer Portada
                                </button>
                              )}
                              <button type="button" onClick={() => handleRemoveFoto(idx)} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600">
                                <Trash2 size={12} />
                              </button>
                            </div>
                            {isPortada && (
                              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-emerald-500 text-white text-[9px] font-black rounded uppercase flex items-center gap-1 shadow-md">
                                <Star size={10} /> PORTADA
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Galería de Videos */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                      <Building2 size={15} className="text-blue-500" />
                      Videos de la Propiedad
                    </h4>
                    <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
                      <UploadCloud size={14} /> Subir Videos
                      <input type="file" multiple accept="video/*" className="hidden" onChange={handleUploadVideos} />
                    </label>
                  </div>
                  {formInmueble.galeriaVideos.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                      <p className="text-sm font-bold text-gray-700">Sin videos</p>
                      <p className="text-xs text-gray-500 mt-1">Puedes agregar videos para hacer más atractiva tu publicación (opcional).</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {formInmueble.galeriaVideos.map((url, idx) => (
                        <div key={idx} className="relative aspect-video rounded-xl overflow-hidden group border-2 border-gray-200">
                          <video src={url} className="w-full h-full object-cover" controls />
                          <button type="button" onClick={() => handleRemoveVideo(idx)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: VERIFICAR LEGALIDAD */}
            {modalSubTab === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-2">
                    <ShieldCheck size={15} className="text-amber-600" />
                    Verificar Legalidad del Inmueble
                  </h4>
                  <p className="text-sm text-gray-600">Sube los documentos legales para que SARA apruebe tu publicación. Estos documentos no serán públicos.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Escritura Pública</label>
                      <input type="file" accept=".pdf,image/*" onChange={(e) => handleUploadLegalFile("escrituraPublica", e)} className="w-full text-xs text-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Certificado de Gravámenes (Actualizado)</label>
                      <input type="file" accept=".pdf,image/*" onChange={(e) => handleUploadLegalFile("certificadoGravamenes", e)} className="w-full text-xs text-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Pago de Impuestos Prediales (Año Curso)</label>
                      <input type="file" accept=".pdf,image/*" onChange={(e) => handleUploadLegalFile("pagoImpuestos", e)} className="w-full text-xs text-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Cédula del Propietario</label>
                      <input type="file" accept=".pdf,image/*" onChange={(e) => handleUploadLegalFile("cedulaPropietario", e)} className="w-full text-xs text-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: PLAN Y COBRO */}
            {modalSubTab === 5 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                    <Sparkles size={15} className="text-emerald-500" />
                    Elige el Plan de Promoción SARA Inmobiliaria
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* PLANES - Simplificados para el Propietario */}
                    {["basico", "destacado", "premium"].map((planStr) => {
                      const plan = planStr as "basico" | "destacado" | "premium"
                      const cfgPlan = planesConfig.planes[plan]
                      const isActive = formInmueble.planPromocion === plan
                      const colores = { basico: "bg-gray-50 border-gray-200 hover:border-gray-400", destacado: "bg-emerald-50 border-emerald-300 hover:border-emerald-500", premium: "bg-amber-50 border-amber-300 hover:border-amber-500" }
                      
                      return (
                        <div
                          key={plan}
                          onClick={() => setFormInmueble({ ...formInmueble, planPromocion: plan, tarifaMensual: cfgPlan.precioMensual })}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${colores[plan]} ${isActive ? 'ring-2 ring-emerald-500 scale-[1.02]' : ''}`}
                        >
                          {isActive && <div className="absolute top-2 right-2"><CheckCircle2 size={18} className="text-emerald-600" /></div>}
                          <h5 className="font-black text-gray-900 uppercase text-sm mb-1">{cfgPlan.nombre}</h5>
                          <p className="text-xl font-black text-gray-800 mb-2">${cfgPlan.precioMensual}<span className="text-xs text-gray-500 font-medium">/mes</span></p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {cfgPlan.beneficios.map((ben: string, bidx: number) => (
                              <li key={bidx} className="flex items-start gap-1"><Check size={12} className="text-emerald-500 shrink-0 mt-0.5"/> <span className="leading-tight">{ben}</span></li>
                            ))}
                          </ul>
                        </div>
                      )
                    })}
                  </div>

                  {/* Información de Comisiones Dinámica */}
                  <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-900">
                    <h5 className="font-bold mb-2 flex items-center gap-2">
                      <Percent size={16} className="text-indigo-600" />
                      Acuerdo de Corretaje ({formInmueble.modalidad === 'venta' ? 'Venta' : 'Arriendo'})
                    </h5>
                    {formInmueble.modalidad === 'venta' ? (
                      <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li><strong>Comisión Base:</strong> {planesConfig.comisiones.comisionVentaDefault}%</li>
                        <li><strong>Rango permitido:</strong> {planesConfig.comisiones.comisionVentaMin}% al {planesConfig.comisiones.comisionVentaMax}%</li>
                        <li><strong>Exclusividad:</strong> {planesConfig.comisiones.comisionVentaExclusiva}% (Si aplicara)</li>
                        <li>{planesConfig.comisiones.descripcionVenta}</li>
                      </ul>
                    ) : (
                      <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li><strong>Modalidad de cobro:</strong> {planesConfig.comisiones.tipoComisionArriendo === 'primer_canon' ? 'Primer Canon' : 'Porcentaje'}</li>
                        {planesConfig.comisiones.tipoComisionArriendo === 'primer_canon' ? (
                          <li><strong>Honorarios:</strong> {planesConfig.comisiones.porcentajePrimerMes}% del primer mes de arriendo</li>
                        ) : (
                          <li><strong>Honorarios:</strong> {planesConfig.comisiones.comisionArriendoPorcentaje}%</li>
                        )}
                        <li>{planesConfig.comisiones.descripcionArriendo}</li>
                      </ul>
                    )}
                  </div>

                  {/* Detalle de Facturación */}
                  <div className="mt-6 bg-slate-50 p-4 rounded-2xl border border-emerald-100 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-2">
                      <Receipt size={15} className="text-emerald-600" />
                      Detalle del Valor a Cancelar
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Meses Contratados</label>
                        <select
                          value={formInmueble.mesesContratados}
                          onChange={(e) => setFormInmueble({ ...formInmueble, mesesContratados: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value={1}>1 mes</option>
                          <option value={3}>3 meses</option>
                          <option value={6}>6 meses</option>
                          <option value={12}>12 meses (1 año)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Descuento Especial (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formInmueble.descuentoPorcentaje}
                          onChange={(e) => setFormInmueble({ ...formInmueble, descuentoPorcentaje: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-2 text-sm mt-3">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal (sin IVA):</span>
                        <span className="font-bold">${subtotalSinIVA.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>IVA 15%:</span>
                        <span className="font-bold">${iva15.toFixed(2)}</span>
                      </div>
                      {formInmueble.descuentoPorcentaje > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Descuento aplicado ({formInmueble.descuentoPorcentaje}%):</span>
                          <span className="font-bold">-${((precioConIVA * formInmueble.mesesContratados) * formInmueble.descuentoPorcentaje / 100).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-emerald-950 border-t-2 border-emerald-200 pt-3 mt-1">
                        <span className="text-base font-black">TOTAL A CANCELAR:</span>
                        <span className="text-xl font-black">${totalFinal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* FOOTER ACTIONS */}
          <div className="px-6 sm:px-10 py-4 bg-white border-t border-gray-100 flex items-center justify-between shrink-0">
            {modalSubTab > 1 ? (
              <button
                type="button"
                onClick={() => setModalSubTab((prev) => (prev - 1) as any)}
                className="px-5 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
              >
                Anterior
              </button>
            ) : <div />}
            
            {modalSubTab < 5 ? (
              <button
                type="button"
                onClick={() => setModalSubTab((prev) => (prev + 1) as any)}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5 shadow-md transition-colors"
              >
                Siguiente Sección
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Enviando a revisión...</span>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Enviar a Verificación y Publicar</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
