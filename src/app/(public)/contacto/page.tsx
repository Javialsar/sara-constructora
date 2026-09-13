"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { MapPin, Phone, Mail, CheckCircle2, Clock, User } from "lucide-react"
export default function ContactoPage() {
  const supabase = createClient()
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    tipo: "",
    etapa: "idea",
    ubicacion: "",
    mensaje: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [config, setConfig] = useState<any>(null)
  
  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase.from('configuracion_empresa').select('*').limit(1).single()
      if (data) setConfig(data)
    }
    fetchConfig()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Combinar datos para que encajen en el esquema de cotizaciones
    const nombreCompleto = `${formData.nombre} ${formData.apellido}`
    const descripcionCompleta = `Ubicación: ${formData.ubicacion} | Etapa: ${formData.etapa} | Mensaje: ${formData.mensaje}`

    const payload = {
      nombre: nombreCompleto,
      email: formData.email,
      telefono: formData.telefono,
      tipo_proyecto: formData.tipo,
      descripcion: descripcionCompleta,
      estado: 'pendiente'
    }

    const { error } = await supabase.from('cotizaciones').insert([payload])

    setIsSubmitting(false)
    if (!error) {
      setSuccess(true)
      setFormData({
        nombre: "", apellido: "", telefono: "", email: "", tipo: "", etapa: "idea", ubicacion: "", mensaje: ""
      })
    } else {
      alert("Error al enviar la solicitud: " + error.message)
    }
  }

  return (
    <div className="pt-36 pb-16 min-h-screen relative overflow-hidden bg-gray-50">
      {/* Cuadrícula de fondo arquitectónica muy suave */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.02) 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }}
      ></div>

      <div className="container relative z-10 mx-auto px-4 md:px-8">
        
        <header className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-dark tracking-tighter mb-4 uppercase">
            ¿TIENES UN PROYECTO EN MENTE?
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-500 font-medium">
            HAGÁMOSLO REALIDAD.
          </h2>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
          
          {/* Contact Info */}
          <div className="lg:col-span-4 h-full">
            <div className="bg-brand-sage text-white p-8 rounded-2xl shadow-xl h-full space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
              <h3 className="text-xl font-bold uppercase tracking-wider border-b border-white/30 pb-4 relative z-10">
                Información de Contacto
              </h3>
              
              <ul className="space-y-6 relative z-10">
                <li className="flex items-start gap-4">
                  <MapPin className="text-white shrink-0 mt-1 drop-shadow-md" size={24} />
                  <div>
                    <h4 className="font-bold mb-1 drop-shadow-sm">Ubicación</h4>
                    <p className="text-white/90 text-sm">{config?.direccion || "Quito - Cuenca - Loja"}</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Phone className="text-white shrink-0 mt-1 drop-shadow-md" size={24} />
                  <div>
                    <h4 className="font-bold mb-1 drop-shadow-sm">Teléfono / WhatsApp</h4>
                    <a href={`https://wa.me/${(config?.telefono_principal || "098 180 4023").replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-white/90 text-sm hover:text-white transition-colors drop-shadow-sm">
                      {config?.telefono_principal || "098 180 4023"}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Mail className="text-white shrink-0 mt-1 drop-shadow-md" size={24} />
                  <div>
                    <h4 className="font-bold mb-1 drop-shadow-sm">Email</h4>
                    <a href={`mailto:${config?.email_contacto || "sara.constructora593@gmail.com"}`} className="text-white/90 text-sm hover:text-white transition-colors drop-shadow-sm">
                      {config?.email_contacto || "sara.constructora593@gmail.com"}
                    </a>
                  </div>
                </li>
              </ul>

              <hr className="border-white/20 my-6 relative z-10" />

              {/* Atención Directa */}
              <div className="relative z-10 space-y-6">
                {config?.equipo_directivo && config.equipo_directivo.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-brand-dark drop-shadow-sm">Atención Directa</h4>
                    <ul className="space-y-4">
                      {config.equipo_directivo.map((miembro: any) => (
                        <li key={miembro.id || miembro.nombre} className="flex items-start gap-3">
                          <User className="text-white shrink-0 mt-0.5 drop-shadow-md" size={18} />
                          <div>
                            <p className="text-sm font-bold text-white drop-shadow-sm">{miembro.nombre}</p>
                            <p className="text-xs text-white/80">{miembro.cargo}</p>
                            {miembro.telefono && (
                              <p className="text-xs text-white/90 mt-0.5">{miembro.telefono}</p>
                            )}
                            {miembro.email && (
                              <a href={`mailto:${miembro.email}`} className="text-xs text-brand-dark font-bold hover:text-white transition-colors block drop-shadow-sm">
                                {miembro.email}
                              </a>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-brand-dark drop-shadow-sm">Horario</h4>
                  <div className="flex items-start gap-3">
                    <Clock className="text-white shrink-0 mt-0.5 drop-shadow-md" size={18} />
                    <p className="text-sm text-white/90">Lunes a Viernes<br/>8:00 AM - 6:00 PM</p>
                  </div>
                </div>

                <div className="pt-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider mb-4 text-brand-dark drop-shadow-sm">Síguenos</h4>
                  <div className="flex gap-4">
                    {config?.instagram_url && (
                      <a href={config.instagram_url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-sage hover:border-brand-sage transition-all text-white">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                      </a>
                    )}
                    {config?.facebook_url && (
                      <a href={config.facebook_url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-sage hover:border-brand-sage transition-all text-white">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                      </a>
                    )}
                    {config?.linkedin_url && (
                      <a href={config.linkedin_url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-sage hover:border-brand-sage transition-all text-white">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                      </a>
                    )}
                    {/* Renderizamos iconos por defecto si no hay ninguna red (fallback) */}
                    {!config?.instagram_url && !config?.facebook_url && !config?.linkedin_url && (
                      <p className="text-sm text-gray-500 italic">No hay redes configuradas</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Registration / Request Portal Form */}
          <div className="lg:col-span-8 bg-white p-8 md:p-10 border border-gray-100 rounded-2xl shadow-xl relative z-10">
            <h3 className="text-2xl font-bold text-brand-black mb-6 border-b border-gray-100 pb-4">
              Portal de Solicitudes y Cotización
            </h3>
            
            {success ? (
              <div className="bg-brand-sage/10 p-8 rounded-xl text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-brand-sage rounded-full flex items-center justify-center text-brand-dark mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-2xl font-bold text-brand-dark mb-2">¡Solicitud Enviada!</h4>
                <p className="text-gray-600 mb-6">Hemos recibido tus datos correctamente. Nuestro equipo se pondrá en contacto contigo muy pronto para discutir tu proyecto.</p>
                <Button onClick={() => setSuccess(false)} variant="outline">
                  Enviar otra solicitud
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="nombre" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Nombre *</label>
                    <input type="text" id="nombre" value={formData.nombre} onChange={(e)=>setFormData({...formData, nombre: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all" required />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="apellido" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Apellido *</label>
                    <input type="text" id="apellido" value={formData.apellido} onChange={(e)=>setFormData({...formData, apellido: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="telefono" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Teléfono / WhatsApp *</label>
                    <input type="tel" id="telefono" value={formData.telefono} onChange={(e)=>setFormData({...formData, telefono: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all" required />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Email *</label>
                    <input type="email" id="email" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="tipo" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tipo de Proyecto *</label>
                    <select id="tipo" value={formData.tipo} onChange={(e)=>setFormData({...formData, tipo: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all appearance-none" required>
                      <option value="">Selecciona una opción</option>
                      <option value="vivienda">Vivienda</option>
                      <option value="edificio">Edificio</option>
                      <option value="local">Local comercial</option>
                      <option value="diseno">Diseño arquitectónico</option>
                      <option value="construccion">Construcción</option>
                      <option value="remodelacion">Remodelación</option>
                      <option value="ingenieria">Ingeniería estructural</option>
                      <option value="topografia">Topografía</option>
                      <option value="consultoria">Consultoría</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="etapa" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Etapa del Proyecto</label>
                    <select id="etapa" value={formData.etapa} onChange={(e)=>setFormData({...formData, etapa: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all appearance-none">
                      <option value="idea">Solo tengo una idea</option>
                      <option value="planos">Ya tengo planos</option>
                      <option value="terreno">Tengo terreno</option>
                      <option value="construccion">En construcción / Obra parada</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="ubicacion" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Ubicación (Ciudad / Sector)</label>
                  <input type="text" id="ubicacion" value={formData.ubicacion} onChange={(e)=>setFormData({...formData, ubicacion: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="mensaje" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Mensaje / Detalles Adicionales *</label>
                  <textarea id="mensaje" value={formData.mensaje} onChange={(e)=>setFormData({...formData, mensaje: e.target.value})} rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-sage focus:ring-1 focus:ring-brand-sage transition-all resize-none" required></textarea>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <input type="checkbox" id="privacidad" className="mt-1 border-gray-300 rounded text-brand-sage focus:ring-brand-sage" required />
                  <label htmlFor="privacidad" className="text-[12px] text-gray-500 leading-relaxed">
                    Acepto la política de privacidad y el tratamiento de mis datos para ser contactado por SARA Constructora.
                  </label>
                </div>

                <div className="pt-4">
                  <Button type="submit" variant="primary" size="lg" className="w-full md:w-auto" disabled={isSubmitting}>
                    {isSubmitting ? "ENVIANDO..." : "ENVIAR SOLICITUD DE COTIZACIÓN"}
                  </Button>
                </div>
              </form>
            )}
          </div>
          
        </div>
      </div>
    </div>
  )
}
