"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, MapPin, Building2, Pencil, Trash2, X, Star } from "lucide-react"

export default function AdminProyectos() {
  const supabase = createClient()
  const [proyectos, setProyectos] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [editId, setEditId] = useState<string | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [uploadingFile, setUploadingFile] = useState(false)
  const [activeModalTab, setActiveModalTab] = useState<'generales'|'cotizacion'>('generales')
  const [cotizadorParams, setCotizadorParams] = useState<any>(null)

  const [formData, setFormData] = useState({
    nombre: "",
    ubicacion: "",
    descripcion: "",
    estado: "en_diseno",
    latitud: "",
    longitud: "",
    cliente_id: "",
    imagen_url: "",
    destacado: false,
    galeria: [] as string[],
    servicio_id: "diseno-arquitectonico",
    datos_financieros: {
      areaConstruccion: 100,
      areaTerreno: 150,
      plantasSobreRasante: 1,
      plantasBajoRasante: 0,
      tipologia: 'unifamiliar',
      pendiente: 'plana',
      acabados: 'estandar',
      incArquitectura: true,
      incEstructura: true,
      incMep: true,
      incTopografia: true,
      totalObra: 0,
      totalHonorarios: 0,
      honorariosArq: 0,
      honorariosEst: 0,
      honorariosMep: 0,
      honorariosTop: 0,
      subtotalHonorarios: 0,
      valorIva: 0,
      aplicaIva: false,
      porcentajeIva: 15,
      desgloseHonorarios: {} as Record<string, number>
    }
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: dataProyectos, error: errProyectos } = await supabase
      .from("proyectos")
      .select(`*, clientes (nombre, apellido)`)
      .order('created_at', { ascending: false })
      
    if (dataProyectos) setProyectos(dataProyectos)
    
    const { data: dataClientes } = await supabase
      .from("clientes")
      .select("id, nombre, apellido")
      
    if (dataClientes) setClientes(dataClientes)

    // Cargar parámetros del cotizador
    const { data: cParams } = await supabase.from("cotizador_parametros").select("*").eq("id", 1).single()
    if (cParams) setCotizadorParams(cParams)
    
    setLoading(false)
  }

  const defaultDatosFinancieros = {
    areaConstruccion: 100,
    areaTerreno: 150,
    plantasSobreRasante: 1,
    plantasBajoRasante: 0,
    tipologia: 'unifamiliar',
    pendiente: 'plana',
    acabados: 'estandar',
    incArquitectura: true,
    incEstructura: true,
    incMep: true,
    incTopografia: true,
    totalObra: 0,
    totalHonorarios: 0,
    honorariosArq: 0,
    honorariosEst: 0,
    honorariosMep: 0,
    honorariosTop: 0,
    subtotalHonorarios: 0,
    valorIva: 0,
    aplicaIva: false,
    porcentajeIva: 15,
    desgloseHonorarios: {} as Record<string, number>
  }

  const openNewModal = () => {
    setEditId(null)
    setFiles([])
    setActiveModalTab('generales')
    setFormData({ 
      nombre: "", ubicacion: "", descripcion: "", estado: "en_diseno", 
      latitud: "", longitud: "", cliente_id: "", imagen_url: "", destacado: false, 
      galeria: [], servicio_id: "diseno-arquitectonico",
      datos_financieros: defaultDatosFinancieros 
    })
    setIsModalOpen(true)
  }

  const handleEdit = (p: any) => {
    setEditId(p.id)
    setFiles([])
    setActiveModalTab('generales')
    
    // Parse jsonb or use default
    const df = p.datos_financieros ? (typeof p.datos_financieros === 'string' ? JSON.parse(p.datos_financieros) : p.datos_financieros) : defaultDatosFinancieros;
    // Si no tiene todas las props de defaultDatosFinancieros, las completamos
    const safeDf = { ...defaultDatosFinancieros, ...df };

    setFormData({
      nombre: p.nombre,
      ubicacion: p.ubicacion,
      descripcion: p.descripcion || "",
      estado: p.estado,
      latitud: p.latitud ? p.latitud.toString() : "",
      longitud: p.longitud ? p.longitud.toString() : "",
      cliente_id: p.cliente_id || "",
      imagen_url: p.imagen_url || "",
      destacado: p.destacado || false,
      galeria: p.galeria || [],
      servicio_id: p.servicio_id || "diseno-arquitectonico",
      datos_financieros: safeDf
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este proyecto?")) return;
    
    setProyectos(proyectos.filter(p => p.id !== id)) // Optimistic update
    const { error } = await supabase.from("proyectos").delete().eq("id", id)
    if (error) {
      alert("Error al eliminar el proyecto: " + error.message)
      fetchData() // Revert on error
    }
  }

  const calcularFinanzas = (dfSnapshot: any, params: any) => {
    let result = { ...dfSnapshot }
    if (!params) return result;

    let fPendiente = params.factor_pendiente_plana
    if (result.pendiente === 'media') fPendiente = params.factor_pendiente_media
    if (result.pendiente === 'fuerte') fPendiente = params.factor_pendiente_fuerte

    let fAcabados = params.factor_acabados_estandar
    if (result.acabados === 'economico') fAcabados = params.factor_acabados_economico
    if (result.acabados === 'premium') fAcabados = params.factor_acabados_premium

    let fTipologia = params.factor_tipologia_unifamiliar || 1
    if (result.tipologia === 'multifamiliar') fTipologia = params.factor_tipologia_multifamiliar || 1.15
    if (result.tipologia === 'comercial') fTipologia = params.factor_tipologia_comercial || 1.25
    if (result.tipologia === 'industrial') fTipologia = params.factor_tipologia_industrial || 0.85

    let fAltura = 1 + (Math.max(0, result.plantasSobreRasante - 2) * (params.porcentaje_adicional_por_piso || 0.03))
    let fSotano = result.plantasBajoRasante > 0 ? (params.factor_sotano || 1.4) : 1

    const costoObra = result.areaConstruccion * params.costo_base_construccion_m2 * fPendiente * fAcabados * fTipologia * fAltura * fSotano

    let honorariosArq = result.incArquitectura ? result.areaConstruccion * params.tarifa_diseno_arq_m2 * fTipologia * fAltura : 0
    let honorariosEst = result.incEstructura ? result.areaConstruccion * params.tarifa_diseno_est_m2 * fTipologia * fAltura : 0
    let honorariosMep = result.incMep ? result.areaConstruccion * params.tarifa_diseno_mep_m2 * fTipologia : 0
    let honorariosTop = result.incTopografia ? params.tarifa_topografia_base : 0

    const subtotalHonorarios = honorariosArq + honorariosEst + honorariosMep + honorariosTop;
    const valorIva = result.aplicaIva ? (subtotalHonorarios * (result.porcentajeIva / 100)) : 0;

    result.totalObra = costoObra;
    result.honorariosArq = honorariosArq;
    result.honorariosEst = honorariosEst;
    result.honorariosMep = honorariosMep;
    result.honorariosTop = honorariosTop;
    result.subtotalHonorarios = subtotalHonorarios;
    result.valorIva = valorIva;
    result.totalHonorarios = subtotalHonorarios + valorIva;

    return result;
  }

  // Valores calculados en tiempo real para mostrar en UI
  const liveFinanzas = calcularFinanzas(formData.datos_financieros, cotizadorParams);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let finalUrl = formData.imagen_url;
    let finalGaleria = [...formData.galeria];

    if (files.length > 0) {
      setUploadingFile(true)
      
      for (const f of files) {
        const fileExt = f.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `galeria/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('avances')
          .upload(filePath, f, { cacheControl: '3600', upsert: false })

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('avances').getPublicUrl(filePath)
          const uploadedUrl = publicUrlData.publicUrl
          
          if (!finalUrl) {
            finalUrl = uploadedUrl
          } else {
            finalGaleria.push(uploadedUrl)
          }
        }
      }
      setUploadingFile(false)
    }

    // Recalcular finanzas antes de guardar para asegurar datos correctos
    const dfSnapshot = calcularFinanzas(formData.datos_financieros, cotizadorParams);

    const payload = {
      nombre: formData.nombre,
      ubicacion: formData.ubicacion,
      descripcion: formData.descripcion,
      estado: formData.estado,
      latitud: formData.latitud ? parseFloat(formData.latitud) : null,
      longitud: formData.longitud ? parseFloat(formData.longitud) : null,
      cliente_id: formData.cliente_id || null,
      imagen_url: finalUrl,
      destacado: formData.destacado,
      galeria: finalGaleria,
      servicio_id: formData.servicio_id,
      datos_financieros: dfSnapshot
    }

    let error;
    if (editId) {
      const { error: err } = await supabase.from("proyectos").update(payload).eq("id", editId)
      error = err;
    } else {
      const { error: err } = await supabase.from("proyectos").insert([payload])
      error = err;
    }
    
    if (!error) {
      setIsModalOpen(false)
      fetchData()
    } else {
      alert("Error al guardar el proyecto: " + error.message)
    }
  }

  const setAsCover = (url: string) => {
    const newGaleria = formData.galeria.filter(u => u !== url)
    if (formData.imagen_url) {
      newGaleria.push(formData.imagen_url)
    }
    setFormData({ ...formData, imagen_url: url, galeria: newGaleria })
  }
  
  const removeExistingUrl = (url: string) => {
    if (url === formData.imagen_url) {
       if (formData.galeria.length > 0) {
          const newGaleria = [...formData.galeria]
          const nextCover = newGaleria.shift()!
          setFormData({ ...formData, imagen_url: nextCover, galeria: newGaleria })
       } else {
          setFormData({ ...formData, imagen_url: "", galeria: [] })
       }
    } else {
       setFormData({ ...formData, galeria: formData.galeria.filter(u => u !== url) })
    }
  }

  const removePendingFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'en_diseno': return 'bg-yellow-100 text-yellow-800'
      case 'en_construccion': return 'bg-blue-100 text-blue-800'
      case 'finalizado': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'en_diseno': return 'En Diseño'
      case 'en_construccion': return 'En Construcción'
      case 'finalizado': return 'Finalizado'
      default: return estado
    }
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Proyectos</h2>
          <p className="text-gray-500 text-sm mt-1">Administra todas las obras y ubícalas en el mapa.</p>
        </div>
        <button 
          onClick={openNewModal}
          className="flex items-center gap-2 bg-brand-dark hover:bg-brand-sage hover:text-brand-dark text-white px-4 py-2 rounded-lg font-bold transition-colors"
        >
          <Plus size={20} />
          <span>Nuevo Proyecto</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-dark"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold">Proyecto</th>
                  <th className="px-6 py-4 font-bold">Cliente</th>
                  <th className="px-6 py-4 font-bold">Ubicación</th>
                  <th className="px-6 py-4 font-bold">Estado</th>
                  <th className="px-6 py-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {proyectos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      <Building2 size={48} className="mx-auto mb-3 opacity-20" />
                      <p>No hay proyectos registrados aún.</p>
                    </td>
                  </tr>
                ) : (
                  proyectos.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900">{p.nombre}</p>
                          {p.destacado && (
                            <span className="text-yellow-500 text-xs flex items-center bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200" title="Destacado en Landing Page">
                              ★ Destacado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-600">
                        {p.clientes ? `${p.clientes.nombre} ${p.clientes.apellido}` : <span className="text-gray-400 italic">Sin asignar</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="text-brand-sage" />
                          <span>{p.ubicacion}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(p.estado)}`}>
                          {getStatusLabel(p.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => handleEdit(p)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Proyecto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[95vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
              <h3 className="text-xl font-bold text-brand-dark">{editId ? "Editar Proyecto" : "Crear Nuevo Proyecto"}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex border-b border-gray-100 bg-white shrink-0">
              <button 
                type="button"
                onClick={() => setActiveModalTab('generales')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeModalTab === 'generales' ? 'border-brand-sage text-brand-dark' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                1. Datos Generales
              </button>
              <button 
                type="button"
                onClick={() => setActiveModalTab('cotizacion')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeModalTab === 'cotizacion' ? 'border-brand-sage text-brand-dark' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                2. Presupuesto y Honorarios
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
              <div className="p-6 overflow-y-auto flex-1">
                <div className={`${activeModalTab === 'generales' ? 'grid' : 'hidden'} grid-cols-1 md:grid-cols-2 gap-6`}>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700">Nombre del Proyecto *</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Ej. Casa Familia Pérez"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700">Cliente Asignado</label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none bg-white"
                      value={formData.cliente_id}
                      onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}
                    >
                      <option value="">-- Ninguno (Proyecto Público) --</option>
                      {clientes.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700">Ciudad / Sector *</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Ej. Machala, El Oro"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none"
                      value={formData.ubicacion}
                      onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700">Servicio Asociado *</label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none bg-white"
                      value={formData.servicio_id}
                      onChange={(e) => setFormData({...formData, servicio_id: e.target.value})}
                      required
                    >
                      <option value="diseno-arquitectonico">Diseño Arquitectónico</option>
                      <option value="construccion-de-obras">Construcción de Obras</option>
                      <option value="ingenieria-y-calculo-estructural">Ingeniería y Cálculo Estructural</option>
                      <option value="estudios-de-suelos">Estudios de Suelos</option>
                      <option value="topografia-y-planimetria">Topografía y Planimetría</option>
                      <option value="presupuestos-y-apu">Presupuestos y APU</option>
                      <option value="remodelaciones-y-ampliaciones">Remodelaciones y Ampliaciones</option>
                      <option value="direccion-y-supervision">Dirección y Supervisión de Obras</option>
                      <option value="modelado-3d-y-renders">Modelado 3D y Renders</option>
                      <option value="consultoria-tecnica">Consultoría Técnica</option>
                      <option value="otros">Otros</option>
                    </select>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700">Descripción del Proyecto</label>
                    <textarea 
                      rows={4}
                      placeholder="Describe los detalles del proyecto, tipo de edificación, metros cuadrados..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none resize-none"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700">Galería de Imágenes</label>
                    <p className="text-xs text-gray-500 mb-2">Selecciona múltiples imágenes. Marca con la estrella (⭐) la que quieres que sea la Portada.</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                      {/* Mostrar imágenes ya subidas */}
                      {[...(formData.imagen_url ? [formData.imagen_url] : []), ...formData.galeria].map((url) => (
                        <div key={url} className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 ${url === formData.imagen_url ? 'border-brand-sage shadow-md' : 'border-gray-200'}`}>
                          <img src={url} alt="Proyecto" className="w-full h-full object-cover" />
                          
                          {/* Botón de Estrella */}
                          <button 
                            type="button"
                            onClick={() => setAsCover(url)}
                            title={url === formData.imagen_url ? "Portada actual" : "Elegir como portada"}
                            className={`absolute top-2 left-2 p-1.5 rounded-full transition-colors ${url === formData.imagen_url ? 'bg-brand-sage text-brand-dark' : 'bg-black/50 text-white hover:bg-black/70'}`}
                          >
                            <Star size={14} className={url === formData.imagen_url ? "fill-brand-dark" : ""} />
                          </button>

                          {/* Botón de Eliminar */}
                          <button 
                            type="button"
                            onClick={() => removeExistingUrl(url)}
                            title="Eliminar foto"
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                          
                          {url === formData.imagen_url && (
                            <div className="absolute bottom-0 inset-x-0 bg-brand-sage text-brand-dark text-[10px] font-bold text-center py-1 uppercase tracking-wider">
                              Portada
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Mostrar previsualización de archivos nuevos (pendientes de subir) */}
                      {files.map((f, idx) => (
                        <div key={idx} className="relative aspect-[4/3] rounded-lg overflow-hidden border-2 border-dashed border-gray-300 opacity-70 hover:opacity-100 transition-opacity">
                          <img src={URL.createObjectURL(f)} alt="Nuevo" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20" />
                          <span className="absolute bottom-2 left-2 right-2 text-[10px] font-bold text-white bg-black/50 px-2 py-1 rounded truncate text-center">
                            Nuevo (Se subirá)
                          </span>
                          <button 
                            type="button"
                            onClick={() => removePendingFile(idx)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors z-10"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <input 
                      type="file" 
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          setFiles([...files, ...Array.from(e.target.files)])
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-sage/10 file:text-brand-dark hover:file:bg-brand-sage/20 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700">Estado Actual</label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none bg-white"
                      value={formData.estado}
                      onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    >
                      <option value="en_diseno">En Diseño</option>
                      <option value="en_construccion">En Construcción</option>
                      <option value="finalizado">Finalizado</option>
                    </select>
                  </div>

                  <div className="space-y-1 flex flex-col justify-center mt-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-brand-sage rounded border-gray-300 focus:ring-brand-sage"
                        checked={formData.destacado}
                        onChange={(e) => setFormData({...formData, destacado: e.target.checked})}
                      />
                      <span className="text-sm font-bold text-gray-700">Mostrar en Landing Page (Destacado)</span>
                    </label>
                  </div>

                  <div className="space-y-1 md:col-span-2 mt-4 pt-4 border-t border-gray-100">
                    <h4 className="font-bold text-brand-dark mb-2">Coordenadas del Mapa</h4>
                    <p className="text-xs text-gray-500 mb-4">Ingresa las coordenadas de Google Maps para que aparezca en el mapa de proyectos (opcional).</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700">Latitud</label>
                        <input 
                          type="text" 
                          placeholder="Ej. -4.3276"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none"
                          value={formData.latitud}
                          onChange={(e) => setFormData({...formData, latitud: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700">Longitud</label>
                        <input 
                          type="text" 
                          placeholder="Ej. -79.5447"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-sage focus:border-brand-sage outline-none"
                          value={formData.longitud}
                          onChange={(e) => setFormData({...formData, longitud: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Pestaña 2: Cotización / Datos Financieros */}
                <div className={`${activeModalTab === 'cotizacion' ? 'block' : 'hidden'} space-y-8`}>
                  <div className="bg-brand-sage/10 p-4 rounded-lg border border-brand-sage/20 mb-6">
                    <p className="text-sm text-brand-dark">Al guardar el proyecto, se calculará automáticamente el presupuesto y se guardará como un historial financiero inalterable usando las tarifas actuales configuradas en el Cotizador.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Área de Construcción (m²)</label>
                      <input 
                        type="number" 
                        value={formData.datos_financieros.areaConstruccion} 
                        onChange={e => setFormData({...formData, datos_financieros: {...formData.datos_financieros, areaConstruccion: Number(e.target.value)}})} 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage text-lg font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Área del Terreno (m²) - Para topografía</label>
                      <input 
                        type="number" 
                        value={formData.datos_financieros.areaTerreno} 
                        onChange={e => setFormData({...formData, datos_financieros: {...formData.datos_financieros, areaTerreno: Number(e.target.value)}})} 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage text-lg font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Plantas Sobre Rasante</label>
                      <input 
                        type="number" 
                        min="1"
                        value={formData.datos_financieros.plantasSobreRasante} 
                        onChange={e => setFormData({...formData, datos_financieros: {...formData.datos_financieros, plantasSobreRasante: Number(e.target.value)}})} 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Sótanos (Bajo rasante)</label>
                      <input 
                        type="number" 
                        min="0"
                        value={formData.datos_financieros.plantasBajoRasante} 
                        onChange={e => setFormData({...formData, datos_financieros: {...formData.datos_financieros, plantasBajoRasante: Number(e.target.value)}})} 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage"
                      />
                    </div>

                    <div className="md:col-span-2 grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tipología</label>
                        <select 
                          value={formData.datos_financieros.tipologia} 
                          onChange={e => setFormData({...formData, datos_financieros: {...formData.datos_financieros, tipologia: e.target.value}})} 
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage"
                        >
                          <option value="unifamiliar">Unifamiliar</option>
                          <option value="multifamiliar">Multifamiliar</option>
                          <option value="comercial">Comercial / Clínicas</option>
                          <option value="industrial">Industrial / Bodegas</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Topografía</label>
                        <select 
                          value={formData.datos_financieros.pendiente} 
                          onChange={e => setFormData({...formData, datos_financieros: {...formData.datos_financieros, pendiente: e.target.value}})} 
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage"
                        >
                          <option value="plana">Plana (&lt; 5%)</option>
                          <option value="media">Media (5% - 20%)</option>
                          <option value="fuerte">Fuerte (&gt; 20%)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Acabados</label>
                        <select 
                          value={formData.datos_financieros.acabados} 
                          onChange={e => setFormData({...formData, datos_financieros: {...formData.datos_financieros, acabados: e.target.value}})} 
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-brand-sage"
                        >
                          <option value="economico">Económico / Social</option>
                          <option value="estandar">Estándar / Comercial</option>
                          <option value="premium">Premium / Lujo</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <label className="block text-sm font-bold text-gray-700 mb-4">Alcance Cotizado para este Proyecto</label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`flex items-center gap-3 cursor-pointer p-3 border rounded-lg transition-colors ${formData.datos_financieros.incArquitectura ? 'bg-brand-sage/10 border-brand-sage' : 'hover:bg-gray-50'}`}>
                        <input type="checkbox" checked={formData.datos_financieros.incArquitectura} onChange={e => setFormData({...formData, datos_financieros: {...formData.datos_financieros, incArquitectura: e.target.checked}})} className="w-5 h-5 accent-brand-sage" />
                        <span className={formData.datos_financieros.incArquitectura ? 'text-brand-dark font-bold' : ''}>Diseño Arquitectónico</span>
                      </label>
                      <label className={`flex items-center gap-3 cursor-pointer p-3 border rounded-lg transition-colors ${formData.datos_financieros.incEstructura ? 'bg-brand-sage/10 border-brand-sage' : 'hover:bg-gray-50'}`}>
                        <input type="checkbox" checked={formData.datos_financieros.incEstructura} onChange={e => setFormData({...formData, datos_financieros: {...formData.datos_financieros, incEstructura: e.target.checked}})} className="w-5 h-5 accent-brand-sage" />
                        <span className={formData.datos_financieros.incEstructura ? 'text-brand-dark font-bold' : ''}>Diseño Estructural</span>
                      </label>
                      <label className={`flex items-center gap-3 cursor-pointer p-3 border rounded-lg transition-colors ${formData.datos_financieros.incMep ? 'bg-brand-sage/10 border-brand-sage' : 'hover:bg-gray-50'}`}>
                        <input type="checkbox" checked={formData.datos_financieros.incMep} onChange={e => setFormData({...formData, datos_financieros: {...formData.datos_financieros, incMep: e.target.checked}})} className="w-5 h-5 accent-brand-sage" />
                        <span className={formData.datos_financieros.incMep ? 'text-brand-dark font-bold' : ''}>Ingenierías MEP</span>
                      </label>
                      <label className={`flex items-center gap-3 cursor-pointer p-3 border rounded-lg transition-colors ${formData.datos_financieros.incTopografia ? 'bg-brand-sage/10 border-brand-sage' : 'hover:bg-gray-50'}`}>
                        <input type="checkbox" checked={formData.datos_financieros.incTopografia} onChange={e => setFormData({...formData, datos_financieros: {...formData.datos_financieros, incTopografia: e.target.checked}})} className="w-5 h-5 accent-brand-sage" />
                        <span className={formData.datos_financieros.incTopografia ? 'text-brand-dark font-bold' : ''}>Topografía Base</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex items-center gap-6">
                    <label className={`flex items-center gap-3 cursor-pointer p-3 border rounded-lg transition-colors flex-1 ${formData.datos_financieros.aplicaIva ? 'bg-brand-sage/10 border-brand-sage' : 'hover:bg-gray-50'}`}>
                      <input type="checkbox" checked={formData.datos_financieros.aplicaIva} onChange={e => setFormData({...formData, datos_financieros: {...formData.datos_financieros, aplicaIva: e.target.checked}})} className="w-5 h-5 accent-brand-sage" />
                      <span className={formData.datos_financieros.aplicaIva ? 'text-brand-dark font-bold' : ''}>Emitir Factura (Aplica IVA)</span>
                    </label>
                    {formData.datos_financieros.aplicaIva && (
                      <div className="flex-1 flex items-center gap-3">
                        <label className="text-sm font-bold text-gray-700">% IVA:</label>
                        <input 
                          type="number" 
                          min="0"
                          value={formData.datos_financieros.porcentajeIva} 
                          onChange={e => setFormData({...formData, datos_financieros: {...formData.datos_financieros, porcentajeIva: Number(e.target.value)}})} 
                          className="w-24 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-sage text-center"
                        />
                      </div>
                    )}
                  </div>

                  <div className="bg-brand-dark text-white p-6 rounded-xl mt-8">
                    <h4 className="font-bold mb-4 uppercase tracking-wider text-xs text-brand-sage">Previsualización en Tiempo Real</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Subtotal Honorarios:</p>
                        <p className="text-lg font-bold">${(liveFinanzas.subtotalHonorarios || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                        {formData.datos_financieros.aplicaIva && (
                          <>
                            <p className="text-sm text-gray-400 mt-2">IVA ({formData.datos_financieros.porcentajeIva}%):</p>
                            <p className="text-md font-bold">${(liveFinanzas.valorIva || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                            <p className="text-sm text-brand-sage mt-2">Total a Facturar:</p>
                            <p className="text-2xl font-bold text-brand-sage">${(liveFinanzas.totalHonorarios || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                          </>
                        )}
                        {!formData.datos_financieros.aplicaIva && (
                          <p className="text-2xl font-bold text-brand-sage mt-1">${(liveFinanzas.totalHonorarios || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Proyección Obra Civil:</p>
                        <p className="text-2xl font-bold text-brand-sage">${(liveFinanzas.totalObra || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                        <p className="text-xs text-gray-400 mt-1">*Costo de ejecución estimado independiente del diseño.</p>
                      </div>
                    </div>
                  </div>

                  {editId && formData.datos_financieros.totalObra > 0 && (
                    <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 mt-4">
                      <h4 className="font-bold mb-2 uppercase tracking-wider text-xs text-gray-500">Última Cotización Guardada (Histórico)</h4>
                      <p className="text-xs text-gray-500 mb-4">Si presionas "Guardar Cambios", se sobreescribirá con la previsualización actual.</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Honorarios Totales:</p>
                          <p className="text-lg font-bold text-gray-700">${(formData.datos_financieros.totalHonorarios || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Proyección Obra:</p>
                          <p className="text-lg font-bold text-gray-700">${(formData.datos_financieros.totalObra || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                  disabled={uploadingFile}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={uploadingFile}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold bg-brand-dark text-white hover:bg-brand-sage hover:text-brand-dark transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {uploadingFile ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    editId ? "Guardar Cambios" : "Guardar Proyecto"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
