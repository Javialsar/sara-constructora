"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, FileText, Camera, Video, MapPin, LogOut, Calendar, ChevronRight, HardHat } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function PortalDashboardPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const supabase = createClient()
  
  const [cliente, setCliente] = useState<any>(null)
  const [proyectos, setProyectos] = useState<any[]>([])
  
  // view can be 'list' or 'detail'
  const [view, setView] = useState<'list' | 'detail'>('list')
  const [proyectoActivo, setProyectoActivo] = useState<any>(null)
  const [avances, setAvances] = useState<any[]>([])

  useEffect(() => {
    const init = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push("/portal")
        return
      }
      setIsAuthenticated(true)
      loadClientData(user.id)
    }
    init()
  }, [router, supabase])

  const loadClientData = async (userId: string) => {
    setLoadingData(true)
    const { data: clienteData } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", userId)
      .single()

    if (clienteData) {
      setCliente(clienteData)
      const { data: proyectosData } = await supabase
        .from("proyectos")
        .select("*")
        .eq("cliente_id", userId)
        .order("created_at", { ascending: false })

      if (proyectosData) {
        setProyectos(proyectosData)
      }
    }
    setLoadingData(false)
  }

  const handleSelectProject = async (proyecto: any) => {
    setProyectoActivo(proyecto)
    setLoadingData(true)
    const { data: avancesData } = await supabase
      .from("avances")
      .select("*")
      .eq("proyecto_id", proyecto.id)
      .order("fecha", { ascending: false })
    
    if (avancesData) setAvances(avancesData)
    setView('detail')
    setLoadingData(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/portal")
  }

  if (!isAuthenticated || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-brand-sage/30 border-t-brand-sage rounded-full animate-spin" />
      </div>
    )
  }

  const fotos = avances.filter(a => a.tipo === 'foto')
  const videos = avances.filter(a => a.tipo === 'video')
  const documentos = avances.filter(a => a.tipo === 'documento')
  
  return (
    <div className="min-h-screen pt-28 pb-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-3 text-brand-sage font-bold uppercase tracking-widest text-xs mb-2">
              <Lock size={14} /> Portal de Clientes
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tighter uppercase">
              {view === 'list' ? 'Mis Proyectos' : 'Panel de Seguimiento'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Bienvenido, <span className="font-semibold text-brand-dark">{cliente?.nombre} {cliente?.apellido}</span></p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 font-medium transition-colors self-start"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>

        {proyectos.length === 0 ? (
           <div className="bg-white p-12 text-center border border-gray-200 shadow-sm rounded-xl">
             <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
             <h3 className="text-xl font-bold text-gray-800 mb-2">Aún no tienes proyectos asignados</h3>
             <p className="text-gray-500">Cuando la constructora asigne un proyecto a tu cuenta, aparecerá aquí.</p>
           </div>
        ) : view === 'list' ? (
          /* VISTA DE LISTA DE PROYECTOS */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proyectos.map((p) => {
              const isActive = p.estado === 'en_diseno' || p.estado === 'en_construccion';
              return (
                <div key={p.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  {p.imagen_url ? (
                    <div 
                      className="h-40 bg-gray-200 bg-cover bg-center shrink-0 border-b border-gray-100 relative" 
                      style={{ backgroundImage: `url(${p.imagen_url})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  ) : (
                    <div className="h-40 bg-gradient-to-tr from-brand-dark to-gray-800 shrink-0 flex items-center justify-center border-b border-gray-100 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                      <HardHat className="text-white/20" size={64} />
                    </div>
                  )}
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg text-brand-dark leading-tight">{p.nombre}</h3>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded tracking-wider ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {p.estado.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                      <MapPin size={14} className="text-brand-sage"/>
                      <span>{p.ubicacion}</span>
                    </div>

                    <div className="mt-auto">
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-gray-500 uppercase">Avance</span>
                        <span className="text-brand-sage">{p.avance}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${isActive ? 'bg-brand-sage' : 'bg-gray-300'}`}
                          style={{ width: `${p.avance}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <button
                      onClick={() => handleSelectProject(p)}
                      disabled={!isActive}
                      className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                        isActive 
                        ? 'bg-brand-dark text-white hover:bg-brand-sage hover:text-brand-dark' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isActive ? 'Ver Avance de Obra' : 'Proyecto Inactivo'}
                      {isActive && <ChevronRight size={16} />}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* VISTA DE DETALLE DEL PROYECTO */
          <div className="space-y-6">
            <button 
              onClick={() => setView('list')}
              className="flex items-center gap-2 text-sm font-bold text-brand-sage hover:text-brand-dark transition-colors mb-4"
            >
              <div className="rotate-180"><ChevronRight size={16} /></div>
              Volver a mis proyectos
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Proyecto Activo */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 border border-gray-200 shadow-sm rounded-xl"
                >
                  <div className="flex items-center justify-between mb-6 border-b pb-4">
                    <h3 className="font-bold text-brand-dark uppercase tracking-widest text-xs flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Proyecto Activo
                    </h3>
                  </div>

                  <ul className="space-y-5 text-sm">
                  <li>
                    <span className="block text-gray-400 font-bold text-[10px] uppercase mb-1">Nombre del Proyecto</span>
                    <span className="font-semibold text-brand-dark">{proyectoActivo.nombre}</span>
                  </li>
                  <li>
                    <span className="block text-gray-400 font-bold text-[10px] uppercase mb-1">Ubicación</span>
                    <span className="flex items-center gap-1 font-medium"><MapPin size={14} className="text-brand-sage"/> {proyectoActivo.ubicacion}</span>
                  </li>
                  <li>
                    <span className="block text-gray-400 font-bold text-[10px] uppercase mb-1">Estado</span>
                    <span className="inline-block bg-brand-sage/20 text-brand-dark px-3 py-1.5 font-bold text-xs uppercase tracking-wide">
                      {proyectoActivo.estado.replace('_', ' ')}
                    </span>
                  </li>
                </ul>

                {/* Progress Bar */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-gray-500 uppercase tracking-widest">Avance General</span>
                    <span className="text-brand-sage">{proyectoActivo.avance}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${proyectoActivo.avance}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-brand-sage"
                    />
                  </div>
                </div>
              </motion.div>
              
              {/* Documentos */}
              {documentos.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white p-6 border border-gray-200 shadow-sm rounded-xl"
                >
                  <h3 className="font-bold text-brand-dark mb-4 uppercase tracking-widest text-xs border-b pb-4">Documentos del Proyecto</h3>
                  <ul className="space-y-3">
                    {documentos.map((doc, i) => (
                      <li key={i}>
                        <a href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-gray-600 hover:text-brand-sage transition-colors group py-1">
                          <FileText size={16} className="text-gray-400 group-hover:text-brand-sage shrink-0" />
                          <span className="flex-1 truncate" title={doc.titulo}>{doc.titulo}</span>
                          <ChevronRight size={14} className="text-gray-300 group-hover:text-brand-sage" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Fotografías */}
              {fotos.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white p-6 border border-gray-200 shadow-sm rounded-xl"
                >
                  <div className="flex items-center justify-between mb-6 border-b pb-4">
                    <h3 className="font-bold text-brand-dark uppercase tracking-widest text-xs flex items-center gap-2">
                      <Camera size={16} className="text-brand-sage"/> Registro Fotográfico
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {fotos.map((img, i) => (
                      <a href={img.url} target="_blank" rel="noreferrer" key={i} className="aspect-square bg-gray-100 relative group overflow-hidden cursor-pointer block rounded-lg">
                        <div 
                          className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                          style={{ backgroundImage: `url(${img.url})` }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                        <div className="absolute bottom-2 left-2 right-2 text-[10px] text-white bg-black/70 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                          {img.titulo}
                        </div>
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Video */}
              {videos.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white p-6 border border-gray-200 shadow-sm rounded-xl"
                >
                  <div className="flex items-center justify-between mb-6 border-b pb-4">
                    <h3 className="font-bold text-brand-dark uppercase tracking-widest text-xs flex items-center gap-2">
                      <Video size={16} className="text-brand-sage"/> Último Recorrido / Video
                    </h3>
                  </div>
                  {/* Just a simple button to watch video for now, unless it's a direct mp4 */}
                  <div className="aspect-video bg-gray-100 flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-300 rounded-xl">
                    <Video size={48} className="text-brand-sage mb-4" />
                    <h4 className="font-bold text-gray-800">{videos[0].titulo}</h4>
                    <p className="text-sm text-gray-500 mt-2 mb-4">{videos[0].descripcion}</p>
                    <a href={videos[0].url} target="_blank" rel="noreferrer" className="bg-brand-dark text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-brand-sage transition-colors">
                      Ver Video Completo
                    </a>
                  </div>
                </motion.div>
              )}

              {/* Timeline de Avance */}
              {avances.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white p-6 border border-gray-200 shadow-sm rounded-xl"
                >
                  <h3 className="font-bold text-brand-dark uppercase tracking-widest text-xs border-b pb-4 mb-6">
                    Bitácora de Avances
                  </h3>
                  <div className="space-y-6">
                    {avances.map((item, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full shrink-0 mt-1 ${item.tipo === 'hito' ? 'bg-brand-dark' : 'bg-brand-sage'}`} />
                          {i < avances.length - 1 && <div className="w-px h-8 bg-gray-200 mt-1" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-brand-dark">{item.titulo}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(item.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })} · {item.tipo.toUpperCase()}
                          </p>
                          {item.descripcion && (
                            <p className="text-sm text-gray-500 mt-2">{item.descripcion}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
