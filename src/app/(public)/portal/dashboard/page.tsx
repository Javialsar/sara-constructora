"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import ModuloIntroSplash from "@/components/ui/ModuloIntroSplash"
import { 
  Lock, 
  FileText, 
  Camera, 
  Video, 
  MapPin, 
  LogOut, 
  ChevronRight, 
  HardHat, 
  Key, 
  Eye, 
  EyeOff,
  ArrowRight,
  ExternalLink,
  Phone,
  Download,
  Building2,
  Clock,
  X,
  ChevronLeft,
  Mail,
  User,
  ShieldCheck,
  Pause,
  Play
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

const getStatusLabel = (estado: string) => {
  switch (estado) {
    case 'en_diseno': return 'En Diseño Arquitectónico'
    case 'en_construccion': return 'En Construcción Activa'
    case 'finalizado': return 'Obra Entregada'
    default: return (estado || 'En Proceso').replace('_', ' ')
  }
}

export default function PortalDashboardPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  
  const supabase = createClient()
  
  const [cliente, setCliente] = useState<any>(null)
  const [proyectosEnConstruccion, setProyectosEnConstruccion] = useState<any[]>([])
  
  // Carousel automático cada 3 segundos
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isCarouselPaused, setIsCarouselPaused] = useState(false)
  const [slideProgress, setSlideProgress] = useState(0)
  
  // view can be 'list' or 'detail'
  const [view, setView] = useState<'list' | 'detail'>('list')
  const [proyectoActivo, setProyectoActivo] = useState<any>(null)
  const [avances, setAvances] = useState<any[]>([])
  const [documentosPrivados, setDocumentosPrivados] = useState<any[]>([])
  const [mediaTab, setMediaTab] = useState<'fotos' | 'videos'>('fotos')

  useEffect(() => {
    const init = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push("/portal")
        return
      }
      setIsAuthenticated(true)
      loadClientData(user)
    }
    init()
  }, [router, supabase])

  // Temporizador de rotación de imágenes de proyectos cada 3 segundos
  useEffect(() => {
    if (proyectosEnConstruccion.length <= 1 || isCarouselPaused || view !== 'list') return

    const progressInterval = setInterval(() => {
      setSlideProgress((prev) => (prev >= 100 ? 0 : prev + 3.33))
    }, 100)

    const slideInterval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % proyectosEnConstruccion.length)
      setSlideProgress(0)
    }, 3000)

    return () => {
      clearInterval(slideInterval)
      clearInterval(progressInterval)
    }
  }, [proyectosEnConstruccion.length, isCarouselPaused, view])

  const loadClientData = async (user: any) => {
    setLoadingData(true)
    let resolvedCliente: any = null

    // 1. Buscar en clientes por email
    if (user.email) {
      const { data: cByEmail } = await supabase
        .from("clientes")
        .select("*")
        .ilike("email", user.email.trim())
        .maybeSingle()
      if (cByEmail) resolvedCliente = cByEmail
    }

    // 2. Buscar por ID de auth
    if (!resolvedCliente && user.id) {
      const { data: cById } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()
      if (cById) resolvedCliente = cById
    }

    // 3. Fallback con datos directos si aún no se encuentra
    if (!resolvedCliente) {
      const cleanEmail = user.email || ""
      resolvedCliente = {
        id: user.id,
        nombre: user.user_metadata?.nombre || (cleanEmail.includes("dasarango") ? "David" : cleanEmail.split('@')[0]),
        apellido: user.user_metadata?.apellido || (cleanEmail.includes("dasarango") ? "Sarango M." : ""),
        email: cleanEmail,
        telefono: user.user_metadata?.telefono || (cleanEmail.includes("dasarango") ? "+593 96 290 5439" : "")
      }
    }

    setCliente(resolvedCliente)

    // 4. Cargar Proyectos que están en Construcción
    const { data: allProyectos } = await supabase
      .from("proyectos")
      .select("*")
      .order("created_at", { ascending: false })

    if (allProyectos) {
      const construccionProyectos = allProyectos.filter(p => p.estado === 'en_construccion')
      const otrosProyectos = allProyectos.filter(p => p.estado !== 'en_construccion')
      setProyectosEnConstruccion([...construccionProyectos, ...otrosProyectos])
    }

    setLoadingData(false)
  }

  const handleSelectProject = async (proyecto: any) => {
    setProyectoActivo(proyecto)
    setLoadingData(true)
    
    // Obtener avances fotográficos, videos e hitos
    const { data: avancesData } = await supabase
      .from("avances")
      .select("*")
      .eq("proyecto_id", proyecto.id)
      .order("fecha", { ascending: false })
    
    if (avancesData) setAvances(avancesData)

    // Obtener planos y documentos técnicos
    const { data: docsData } = await supabase
      .from("documentos_proyecto")
      .select("*")
      .eq("proyecto_id", proyecto.id)
      .order("fecha_subida", { ascending: false })
    
    if (docsData) setDocumentosPrivados(docsData)

    setView('detail')
    setLoadingData(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/constructora")
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }
    setChangingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    
    if (error) {
      alert("Error al actualizar la contraseña: " + error.message)
    } else {
      alert("Contraseña actualizada exitosamente")
      setIsPasswordModalOpen(false)
      setNewPassword("")
      setConfirmPassword("")
    }
    setChangingPassword(false)
  }

  if (!isAuthenticated || loadingData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#090e11] text-white">
        <div className="w-12 h-12 border-3 border-brand-sage/30 border-t-brand-sage rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Cargando Entorno de Obra...</p>
      </div>
    )
  }

  const fotos = avances.filter(a => a.tipo === 'foto')
  const videos = avances.filter(a => a.tipo === 'video')
  const hitos = avances.filter(a => a.tipo === 'hito' || !a.tipo)
  const documentos = avances.filter(a => a.tipo === 'documento')
  
  const todosLosDocumentos = [
    ...documentosPrivados.map(d => ({ id: d.id, titulo: d.titulo, url: d.archivo_url })),
    ...documentos.map(d => ({ id: d.id, titulo: d.titulo, url: d.url }))
  ]

  const todasLasFotos = [
    ...fotos.map(f => ({ url: f.url, titulo: f.titulo, fecha: f.fecha, descripcion: f.descripcion })),
    ...((proyectoActivo?.galeria || []).map((imgUrl: string, idx: number) => ({
      url: imgUrl,
      titulo: `Fotografía de Proyecto #${idx + 1}`,
      fecha: proyectoActivo?.created_at,
      descripcion: "Registro visual de ejecución arquitectónica"
    })))
  ]

  const todosLosVideos = [
    ...videos.map(v => ({
      url: v.url,
      titulo: v.titulo || "Video de Avance de Obra",
      fecha: v.fecha,
      descripcion: v.descripcion
    })),
    ...(proyectoActivo?.video_url ? [{
      url: proyectoActivo.video_url,
      titulo: "Recorrido Audiovisual / Drone Oficial de la Obra",
      fecha: proyectoActivo?.created_at,
      descripcion: "Registro cinematográfico de la ejecución arquitectónica del proyecto."
    }] : [])
  ]

  const activeSlideProject = proyectosEnConstruccion[currentSlideIndex] || proyectosEnConstruccion[0]

  return (
    <div className="min-h-screen pb-24 bg-[#090e11] text-slate-100">
      {/* Intro con logotipo oficial 3D giratorio */}
      <ModuloIntroSplash modulo="portal" />
      
      {/* Background Decorativo Arquitectónico */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(197,160,89,0.12),rgba(255,255,255,0))] pointer-events-none" />
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: "60px 60px"
        }}
      />

      {/* =========================================================================
          PRIMERA SECCIÓN: CABECERA INTEGRADA CON NOMBRE DEL CLIENTE, CONTACTO,
          EMAIL Y BOTÓN «IR AL PORTAL CONSTRUCTORA»
         ========================================================================= */}
      <nav className="relative z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur-md px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Izquierda: Logotipo y Nombre del Portal */}
        <div className="flex items-center gap-3">
          <Link href="/constructora" className="flex items-center gap-2.5 group">
            <img 
              src="/images/sara-constructora.png" 
              alt="SARA Constructora" 
              className="h-9 md:h-10 w-auto object-contain drop-shadow"
            />
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-widest text-white group-hover:text-brand-sage transition-colors uppercase">
                SARA CONSTRUCTORA
              </span>
              <span className="text-[9px] font-bold tracking-widest text-brand-sage uppercase">
                Portal Privado de Clientes
              </span>
            </div>
          </Link>
        </div>

        {/* Centro: Solo Nombre del Cliente */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/[0.04] border border-white/10 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-brand-sage/20 border border-brand-sage/40 flex items-center justify-center text-brand-sage font-black text-xs shrink-0">
            {cliente?.nombre?.charAt(0) || 'C'}
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-wider text-brand-sage">
              Cliente Activo
            </span>
            <span className="text-xs md:text-sm font-black text-white uppercase tracking-tight">
              {cliente?.nombre} {cliente?.apellido}
            </span>
          </div>
        </div>

        {/* Derecha: Botón Cambiar Contraseña y Cerrar Sesión */}
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setIsPasswordModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 font-bold uppercase tracking-wider transition-all"
            title="Cambiar Contraseña"
          >
            <Key size={13} className="text-brand-sage" />
            <span>Cambiar Contraseña</span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs text-red-300 hover:text-red-200 bg-red-500/10 hover:bg-red-500/20 px-3.5 py-2 rounded-xl border border-red-500/20 font-bold uppercase tracking-wider transition-all"
            title="Cerrar Sesión"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </nav>

      {/* =========================================================================
          CONTENEDOR PRINCIPAL AMPLIO (SECCIÓN DE IMAGEN DE PROYECTOS Y AVANCES)
         ========================================================================= */}
      <div className="container mx-auto px-4 md:px-8 pt-6 relative z-10 space-y-8">
        
        {/* =========================================================================
            VISTA 1: LISTADO Y CARRUSEL ROTATIVO AMPLIO (CADA 3 SEGUNDOS)
           ========================================================================= */}
        {view === 'list' && (
          <div className="space-y-8">
            
            {proyectosEnConstruccion.length > 0 && (
              <div className="space-y-3">
                
                {/* Cabecera del visualizador */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                  <div>
                    <div className="text-brand-sage font-black uppercase tracking-[0.25em] text-[10px]">
                      Visualizador Dinámico de Obra
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                      Proyectos en Rotación Automática
                    </h2>
                  </div>

                  {/* Indicador de rotación cada 3 segundos y Controles */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-xl text-xs font-mono text-slate-300">
                      <Clock size={12} className="text-brand-sage animate-spin" />
                      <span>Rotación: 3s</span>
                      <span className="text-brand-sage font-bold font-mono">
                        ({currentSlideIndex + 1}/{proyectosEnConstruccion.length})
                      </span>
                    </div>

                    <button
                      onClick={() => setIsCarouselPaused(!isCarouselPaused)}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
                      title={isCarouselPaused ? "Reanudar rotación automática" : "Pausar rotación"}
                    >
                      {isCarouselPaused ? <Play size={13} /> : <Pause size={13} />}
                    </button>
                  </div>
                </div>

                {/* Slider Ampliado de Alto Impacto (Mayor Altura y Visibilidad) */}
                <div 
                  className="relative rounded-3xl overflow-hidden bg-[#0c1418] border border-white/15 shadow-2xl min-h-[440px] md:min-h-[540px] flex flex-col justify-end p-6 md:p-12 group"
                  onMouseEnter={() => setIsCarouselPaused(true)}
                  onMouseLeave={() => setIsCarouselPaused(false)}
                >
                  {/* Imagen de fondo con transición suave entre proyectos */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`slide-${activeSlideProject?.id}`}
                      initial={{ opacity: 0, scale: 1.08 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${activeSlideProject?.imagen_url || '/images/sara-constructora.png'})` }}
                    />
                  </AnimatePresence>

                  {/* Degradado Cinematográfico */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090e11] via-[#090e11]/65 to-black/25" />

                  {/* Contenido del Proyecto Activo */}
                  <div className="relative z-10 max-w-3xl space-y-3.5">
                    
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="bg-brand-sage text-brand-dark px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wider shadow-lg">
                        {getStatusLabel(activeSlideProject?.estado)}
                      </span>
                      
                      <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-md text-[11px] font-bold tracking-wide flex items-center gap-1.5 border border-white/15">
                        <MapPin size={13} className="text-brand-sage" />
                        {activeSlideProject?.ubicacion || 'Ecuador'}
                      </span>

                      <span className="bg-black/60 backdrop-blur-md text-brand-sage px-3 py-1 rounded-md text-[11px] font-mono font-bold border border-brand-sage/30">
                        Avance Físico: {activeSlideProject?.avance || 0}%
                      </span>
                    </div>

                    <h3 className="text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight drop-shadow-2xl">
                      {activeSlideProject?.nombre}
                    </h3>

                    {activeSlideProject?.descripcion && (
                      <p className="text-xs md:text-sm text-slate-300 line-clamp-2 leading-relaxed max-w-2xl">
                        {activeSlideProject?.descripcion}
                      </p>
                    )}

                    {/* Botón de acción hacia el detalle del proyecto */}
                    <div className="pt-2 flex flex-wrap items-center gap-4">
                      <button
                        onClick={() => handleSelectProject(activeSlideProject)}
                        className="inline-flex items-center gap-2 bg-brand-sage text-brand-dark px-7 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-white hover:text-brand-dark transition-all shadow-xl group/btn"
                      >
                        <span>Ver Avance & Bitácora en Vivo</span>
                        <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>

                      <span className="text-xs text-slate-400 font-medium">
                        (Transición automática cada 3 segundos)
                      </span>
                    </div>

                  </div>

                  {/* Barra de progreso de 3 segundos en la base */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-brand-sage to-amber-300"
                      style={{ width: `${slideProgress}%` }}
                      transition={{ ease: "linear" }}
                    />
                  </div>

                  {/* Indicadores de bolitas interactivos */}
                  <div className="absolute top-6 right-6 flex items-center gap-1.5 z-20">
                    {proyectosEnConstruccion.map((p, idx) => (
                      <button
                        key={`dot-${p.id}`}
                        onClick={() => {
                          setCurrentSlideIndex(idx)
                          setSlideProgress(0)
                        }}
                        className={`h-2 rounded-full transition-all ${
                          idx === currentSlideIndex 
                            ? 'w-8 bg-brand-sage' 
                            : 'w-2 bg-white/30 hover:bg-white/60'
                        }`}
                        title={`Ver ${p.nombre}`}
                      />
                    ))}
                  </div>

                </div>
              </div>
            )}

            {/* Catálogo Completo de Tarjetas de Proyectos en Construcción */}
            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="text-brand-sage font-black uppercase tracking-[0.25em] text-[10px] mb-0.5">
                    Portafolio de Obras Civiles
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                    Catálogo de Proyectos en Construcción
                  </h2>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400 bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                  {proyectosEnConstruccion.length} Obras Disponibles
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {proyectosEnConstruccion.map((p) => {
                  const totalPhotos = (p.galeria?.length || 0) + 1
                  
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group relative rounded-2xl overflow-hidden bg-[#0c1418] border border-white/10 shadow-2xl transition-all duration-500 hover:border-brand-sage/60 hover:shadow-[0_15px_40px_rgba(197,160,89,0.18)] flex flex-col"
                    >
                      {/* Portada en Alta Resolución con Zoom */}
                      <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-900 shrink-0">
                        {p.imagen_url ? (
                          <div 
                            className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-out"
                            style={{ backgroundImage: `url(${p.imagen_url})` }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-tr from-brand-dark to-slate-900 flex items-center justify-center">
                            <HardHat size={56} className="text-white/20" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1418] via-black/25 to-black/60 opacity-90" />

                        {/* Badges Superiores */}
                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                          <span className="bg-brand-sage text-brand-dark px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wider shadow-lg">
                            {getStatusLabel(p.estado)}
                          </span>

                          <span className="bg-black/60 backdrop-blur-md text-white/90 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide flex items-center gap-1.5 border border-white/15">
                            <Camera size={13} className="text-brand-sage" />
                            {totalPhotos} {totalPhotos === 1 ? 'Foto' : 'Fotos'}
                          </span>
                        </div>

                        {/* Ubicación al pie de la imagen */}
                        <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2 text-xs font-bold text-brand-sage">
                          <MapPin size={14} className="shrink-0" />
                          <span className="truncate uppercase tracking-wider">{p.ubicacion || 'Ecuador'}</span>
                        </div>
                      </div>

                      {/* Contenido de la Tarjeta */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-brand-sage transition-colors leading-snug">
                            {p.nombre}
                          </h3>

                          {p.descripcion && (
                            <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                              {p.descripcion}
                            </p>
                          )}
                        </div>

                        {/* Barra de Progreso de la Obra */}
                        <div className="mt-6 pt-5 border-t border-white/10">
                          <div className="flex justify-between items-center text-xs font-bold mb-2">
                            <span className="text-slate-400 uppercase tracking-widest text-[11px]">Avance de Obra</span>
                            <span className="text-brand-sage font-black font-mono text-sm">{p.avance || 0}%</span>
                          </div>

                          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden p-[1px]">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${p.avance || 0}%` }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-brand-sage to-amber-300 rounded-full shadow-[0_0_12px_rgba(197,160,89,0.5)]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Botón de Acción Principal */}
                      <div className="p-4 pt-0 bg-transparent">
                        <button
                          onClick={() => handleSelectProject(p)}
                          className="w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 bg-brand-sage text-brand-dark hover:bg-white hover:text-brand-dark transition-all duration-300 shadow-lg group/btn"
                        >
                          <span>Ver Avance & Bitácora en Vivo</span>
                          <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            VISTA 2: DETALLE DEL PROYECTO SELECCIONADO (AMPLIADO SIN BLOQUES PREVIOS)
           ========================================================================= */}
        {view === 'detail' && proyectoActivo && (
          <div className="space-y-6">
            
            {/* Botón Volver */}
            <button 
              onClick={() => {
                setView('list')
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-sage hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/10"
            >
              <div className="rotate-180"><ChevronRight size={14} /></div>
              <span>Volver a Proyectos en Construcción</span>
            </button>

            {/* Banner Ampliado de Cabecera del Proyecto Seleccionado */}
            <div className="relative rounded-3xl overflow-hidden bg-[#0c1418] border border-white/10 shadow-2xl min-h-[360px] md:min-h-[460px] flex flex-col justify-end p-6 md:p-12">
              {proyectoActivo.imagen_url && (
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${proyectoActivo.imagen_url})` }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#090e11] via-[#090e11]/75 to-black/35" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 mb-3">
                    <span className="bg-brand-sage text-brand-dark px-3.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider">
                      {getStatusLabel(proyectoActivo.estado)}
                    </span>
                    <span className="bg-white/10 backdrop-blur-md text-white px-3.5 py-1 rounded-md text-[11px] font-bold tracking-wide flex items-center gap-1.5 border border-white/10">
                      <MapPin size={13} className="text-brand-sage" />
                      {proyectoActivo.ubicacion}
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight drop-shadow-2xl">
                    {proyectoActivo.nombre}
                  </h2>
                </div>

                {/* Medidor de Avance Físico Certificado */}
                <div className="bg-black/60 backdrop-blur-md p-5 rounded-2xl border border-white/15 min-w-[210px] text-right">
                  <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Avance Físico Certificado
                  </div>
                  <div className="text-4xl font-black text-brand-sage font-mono">
                    {proyectoActivo.avance || 0}%
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-3 p-[1px]">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-sage to-amber-300 rounded-full"
                      style={{ width: `${proyectoActivo.avance || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Layout de Contenidos: Galería, Bitácora y Documentos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Columna Lateral: Ficha Técnica & Documentación */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Resumen de Ficha Técnica */}
                <div className="bg-[#0c1418] p-6 rounded-2xl border border-white/10">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-sage mb-4 flex items-center gap-2">
                    <Building2 size={15} /> Ficha Técnica de la Obra
                  </h3>
                  
                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="text-slate-400 block uppercase font-bold text-[10px] mb-1">Ubicación Geográfica</span>
                      <span className="text-white font-medium flex items-center gap-1.5">
                        <MapPin size={13} className="text-brand-sage" />
                        {proyectoActivo.ubicacion}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block uppercase font-bold text-[10px] mb-1">Estado de Ejecución</span>
                      <span className="text-white font-medium">{getStatusLabel(proyectoActivo.estado)}</span>
                    </div>

                    {proyectoActivo.descripcion && (
                      <div className="pt-3 border-t border-white/5">
                        <span className="text-slate-400 block uppercase font-bold text-[10px] mb-1">Memoria Descriptiva</span>
                        <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                          {proyectoActivo.descripcion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Planos y Expediente Técnico */}
                {todosLosDocumentos.length > 0 && (
                  <div className="bg-[#0c1418] p-6 rounded-2xl border border-white/10">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-sage mb-4 flex items-center gap-2">
                      <FileText size={15} /> Planos & Expediente Técnico
                    </h3>

                    <ul className="space-y-2">
                      {todosLosDocumentos.map((doc, idx) => (
                        <li key={doc.id || idx}>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-white transition-colors group"
                          >
                            <span className="truncate font-medium">{doc.titulo || 'Documento Técnico'}</span>
                            <Download size={14} className="text-brand-sage group-hover:scale-110 transition-transform shrink-0 ml-2" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contacto Directo con el Ingeniero Residente */}
                <div className="bg-gradient-to-br from-brand-sage/10 to-transparent p-6 rounded-2xl border border-brand-sage/30">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-sage mb-2">
                    Residencia & Fiscalización
                  </h3>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    ¿Tienes consultas técnicas sobre la obra o deseas coordinar una visita a sitio?
                  </p>
                  <a
                    href={`https://wa.me/593981804023?text=Hola,%20soy%20el%20cliente%20${encodeURIComponent(cliente?.nombre || '')}%20y%20tengo%20una%20consulta%20técnica%20sobre%20el%20proyecto%20${encodeURIComponent(proyectoActivo.nombre || '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-brand-sage text-brand-dark py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-white transition-all shadow-lg"
                  >
                    <Phone size={14} />
                    <span>WhatsApp Residente de Obra</span>
                  </a>
                </div>
              </div>

              {/* Columna Principal: Galería Fotográfica Ampliada y Bitácora */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* 1. Módulo Multimedia de Avance de Obra con Viñetas: Registro Fotográfico y Video de Obra */}
                <div className="bg-[#0c1418] p-6 md:p-8 rounded-2xl border border-white/10 space-y-6">
                  
                  {/* Barra de Viñetas / Pestañas de Navegación Multimedia */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                    
                    {/* Botones de Viñetas */}
                    <div className="inline-flex items-center p-1.5 rounded-2xl bg-white/[0.03] border border-white/10 gap-1.5 shadow-inner">
                      
                      {/* Viñeta 1: Registro fotográfico */}
                      <button
                        type="button"
                        onClick={() => setMediaTab('fotos')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                          mediaTab === 'fotos'
                            ? 'bg-brand-sage text-brand-dark shadow-lg shadow-brand-sage/20 scale-[1.02]'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Camera size={15} />
                        <span>Registro fotográfico</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                          mediaTab === 'fotos' ? 'bg-brand-dark/20 text-brand-dark' : 'bg-white/10 text-slate-300'
                        }`}>
                          {todasLasFotos.length}
                        </span>
                      </button>

                      {/* Viñeta 2: Video de obra */}
                      <button
                        type="button"
                        onClick={() => setMediaTab('videos')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                          mediaTab === 'videos'
                            ? 'bg-brand-sage text-brand-dark shadow-lg shadow-brand-sage/20 scale-[1.02]'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Video size={15} />
                        <span>Video de obra</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                          mediaTab === 'videos' ? 'bg-brand-dark/20 text-brand-dark' : 'bg-white/10 text-slate-300'
                        }`}>
                          {todosLosVideos.length}
                        </span>
                      </button>
                    </div>

                    <div className="text-right hidden sm:block">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {mediaTab === 'fotos' ? 'Capturas de Sitio & Drone' : 'Filmación & Vuelos de Drone'}
                      </span>
                    </div>
                  </div>

                  {/* Contenido Viñeta 1: Registro Fotográfico */}
                  {mediaTab === 'fotos' && (
                    <div>
                      {todasLasFotos.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {todasLasFotos.map((img, i) => (
                            <div
                              key={`foto-${i}`}
                              onClick={() => setSelectedPhoto(img.url)}
                              className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 group cursor-pointer border border-white/10 hover:border-brand-sage transition-all shadow-md"
                            >
                              <div 
                                className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500 ease-out"
                                style={{ backgroundImage: `url(${img.url})` }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3" />
                              <div className="absolute bottom-2 left-2 right-2 text-[11px] text-white font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                {img.titulo}
                              </div>
                              <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-brand-sage opacity-0 group-hover:opacity-100 transition-opacity shadow">
                                <Eye size={13} />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-12 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                          <Camera size={38} className="text-slate-500 mx-auto mb-3" />
                          <h4 className="text-sm font-black text-white uppercase">Sin Fotografías Registradas</h4>
                          <p className="text-xs text-slate-400 mt-1">Aún no se han publicado fotografías para este proyecto.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contenido Viñeta 2: Video de Obra */}
                  {mediaTab === 'videos' && (
                    <div className="space-y-6">
                      {todosLosVideos.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {todosLosVideos.map((vid, idx) => (
                            <div 
                              key={`video-${idx}`} 
                              className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden flex flex-col justify-between hover:border-brand-sage/40 transition-all shadow-lg"
                            >
                              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                                {vid.url.endsWith('.mp4') || vid.url.endsWith('.webm') || vid.url.includes('blob:') ? (
                                  <video 
                                    src={vid.url} 
                                    controls 
                                    className="w-full h-full object-cover" 
                                    poster={proyectoActivo.imagen_url || undefined}
                                  />
                                ) : vid.url.includes('youtube.com') || vid.url.includes('youtu.be') ? (
                                  <iframe
                                    src={vid.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                ) : (
                                  <div className="flex flex-col items-center justify-center p-6 text-center">
                                    <Video size={42} className="text-brand-sage mb-2 animate-pulse" />
                                    <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">Video de Avance de Obra</span>
                                  </div>
                                )}
                              </div>

                              <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-brand-sage/15 text-brand-sage border border-brand-sage/30">
                                      Registro Audiovisual #{idx + 1}
                                    </span>
                                    {vid.fecha && (
                                      <span className="text-[10px] font-mono text-slate-400">
                                        {new Date(vid.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                      </span>
                                    )}
                                  </div>

                                  <h4 className="text-sm font-black text-white uppercase leading-snug">
                                    {vid.titulo}
                                  </h4>

                                  {vid.descripcion && (
                                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                      {vid.descripcion}
                                    </p>
                                  )}
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/5">
                                  <a
                                    href={vid.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand-sage hover:text-white transition-colors"
                                  >
                                    <span>Abrir Video Completo</span>
                                    <ExternalLink size={13} />
                                  </a>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-12 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                          <Video size={40} className="text-slate-500 mx-auto mb-3" />
                          <h4 className="text-sm font-black text-white uppercase">Sin Videos de Obra</h4>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                            Los vuelos de drone y recorridos audiovisuales se cargarán periódicamente durante la ejecución de la obra.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* 3. Bitácora de Avances Cronológica */}
                {avances.length > 0 && (
                  <div className="bg-[#0c1418] p-6 md:p-8 rounded-2xl border border-white/10">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                      <Clock size={16} className="text-brand-sage" /> Bitácora Técnica de Obra
                    </h3>

                    <div className="space-y-6">
                      {avances.map((item, idx) => (
                        <div key={item.id || idx} className="flex gap-4 items-start">
                          <div className="flex flex-col items-center">
                            <div className="w-3.5 h-3.5 rounded-full bg-brand-sage ring-4 ring-brand-sage/20 mt-1 shrink-0" />
                            {idx < avances.length - 1 && <div className="w-px h-16 bg-white/10 mt-2" />}
                          </div>

                          <div className="flex-1 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                              <h4 className="text-sm font-black text-white uppercase">{item.titulo}</h4>
                              <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                                {new Date(item.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            {item.descripcion && (
                              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                {item.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modal Lightbox de Foto Ampliada */}
      <AnimatePresence>
        {selectedPhoto && (
          <div 
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-12 right-0 text-white/80 hover:text-white p-2"
              >
                <X size={28} />
              </button>
              <img
                src={selectedPhoto}
                alt="Fotografía de Obra"
                className="max-h-[85vh] w-auto object-contain rounded-2xl shadow-2xl border border-white/15"
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Cambiar Contraseña */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c1418] border border-white/15 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-white">
            <h2 className="text-xl font-black uppercase mb-4 tracking-tight">Cambiar Contraseña</h2>
            <form onSubmit={handleChangePassword}>
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Nueva Contraseña</label>
                <div className="relative">
                  <input 
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2.5 pr-10 text-white text-sm outline-none focus:border-brand-sage"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Confirmar Contraseña</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2.5 pr-10 text-white text-sm outline-none focus:border-brand-sage"
                    placeholder="Repite la contraseña"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsPasswordModalOpen(false)} 
                  className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-white/10 text-slate-300 rounded-xl hover:bg-white/15 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={changingPassword} 
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-brand-sage text-brand-dark rounded-xl hover:bg-white transition-colors disabled:opacity-50"
                >
                  {changingPassword ? "Guardando..." : "Actualizar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
