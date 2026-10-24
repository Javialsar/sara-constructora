"use client"

import React, { useState } from "react"
import Link from "next/link"
import { 
  Building2, 
  Calculator, 
  ShoppingCart, 
  Truck, 
  Home, 
  Hotel, 
  Users, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  ArrowRight,
  Copy,
  Check
} from "lucide-react"
import { submitCotizacion, SubmitCotizacionResponse } from "@/app/actions/public"

const DIVISIONS = [
  { id: "constructora", name: "SARA-CONSTRUCTORA", label: "Obras Civiles & Arquitectura", icon: Building2 },
  { id: "apu", name: "SARA-APU", label: "Software & Presupuestos APU", icon: Calculator },
  { id: "marketplace", name: "SARA-MARKETPLACE", label: "Suministros Mayoristas", icon: ShoppingCart },
  { id: "fletes", name: "SARA-FLETES", label: "Transporte Pesado & Renta", icon: Truck },
  { id: "inmobiliaria", name: "SARA-INMOBILIARIA", label: "Bienes Raíces & Terrenos", icon: Home },
  { id: "alojamiento", name: "SARA-ALOJAMIENTO", label: "Suites Corporativas Stays", icon: Hotel },
  { id: "talento", name: "SARA-TALENTO", label: "Red de Especialistas & Cuadrillas", icon: Users },
  { id: "general", name: "GRUPO SARA", label: "Consulta Institucional / Holding", icon: MessageSquare },
]

export default function ContactoPage() {
  const [selectedDivision, setSelectedDivision] = useState<string>("constructora")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successResult, setSuccessResult] = useState<SubmitCotizacionResponse | null>(null)
  const [copiedCode, setCopiedCode] = useState<boolean>(false)

  // Form states to preserve data on error
  const [formData, setFormData] = useState({
    nombre: "",
    empresa: "",
    email: "",
    telefono: "",
    ciudad: "Quito",
    presupuesto_estimado: "",
    descripcion: "",
    consentimiento: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errorMsg) setErrorMsg(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!formData.consentimiento) {
      setErrorMsg("Debe aceptar el consentimiento de tratamiento de datos para continuar.")
      return
    }

    setIsSubmitting(true)

    try {
      const payload = new FormData()
      payload.append("nombre", formData.nombre)
      payload.append("empresa", formData.empresa)
      payload.append("email", formData.email)
      payload.append("telefono", formData.telefono)
      payload.append("tipo_proyecto", selectedDivision)
      payload.append("presupuesto_estimado", formData.presupuesto_estimado)
      payload.append("descripcion", `[Ubicación: ${formData.ciudad}] ${formData.descripcion}`)
      // Honeypot field (always empty from real users)
      payload.append("sara_hp_check", "")

      const res = await submitCotizacion(payload)

      if (res.error) {
        setErrorMsg(res.error)
      } else if (res.success) {
        setSuccessResult(res)
      }
    } catch (err: any) {
      setErrorMsg("Ocurrió un error inesperado al procesar la solicitud. Por favor intente nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 3000)
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Luces y ambientación técnica */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-sage/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 md:px-8 max-w-7xl">
        {/* Header Institucional */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-brand-sage/40 text-brand-sage text-xs font-bold uppercase tracking-widest mb-4 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-brand-sage" />
            <span>Mesa de Entrada & Cotizaciones Oficiales</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight uppercase mb-4 drop-shadow-xl">
            Cotiza tu Proyecto con <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-sage via-amber-400 to-white">GRUPO SARA</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal border-l-2 border-brand-sage/60 pl-4">
            Ingeniería de vanguardia, tecnología integral y respaldo empresarial en todo el Ecuador. Registra los requerimientos de tu obra o consulta corporativa y recibe una respuesta técnica garantizada con trazabilidad digital.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Columna Izquierda: Selector de División y Formulario de Cotización */}
          <div className="lg:col-span-8 bg-slate-900/90 backdrop-blur-xl border border-white/[0.08] ring-1 ring-black/[0.05] rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl">
            
            {successResult ? (
              /* Vista de Éxito Confirmado con ID de Seguimiento */
              <div className="text-center py-10 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500 rounded-3xl flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
                    Registro Técnico Confirmado
                  </span>
                  <h2 className="font-display text-3xl font-extrabold text-white">
                    ¡Solicitud Recibida con Éxito!
                  </h2>
                  <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                    Hemos registrado tu solicitud de cotización en el sistema central de GRUPO SARA. Un ingeniero fiscalizador o especialista técnico asignado se pondrá en contacto contigo.
                  </p>
                </div>

                {/* Código de Seguimiento */}
                {successResult.trackingCode && (
                  <div className="bg-slate-950 p-5 rounded-2xl border border-white/10 max-w-md mx-auto space-y-2">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                      Código Único de Seguimiento (Tracking ID)
                    </span>
                    <div className="flex items-center justify-between bg-slate-900 px-4 py-2.5 rounded-xl border border-white/[0.06]">
                      <span className="font-mono text-lg font-black text-amber-400 tracking-wider">
                        {successResult.trackingCode}
                      </span>
                      <button
                        onClick={() => handleCopyTracking(successResult.trackingCode!)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                        title="Copiar código"
                      >
                        {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-400 block pt-1">
                      Guarda este código para consultar el estado en línea o comunicarte con tu asesor.
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                  <a
                    href={`https://wa.me/593981804023?text=${encodeURIComponent(`Hola GRUPO SARA. Acabo de registrar mi cotización con código ${successResult.trackingCode || ''}. Quisiera coordinar detalles técnicos.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[48px] px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98]"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Contactar Asesor Directo vía WhatsApp</span>
                  </a>

                  <button
                    onClick={() => {
                      setSuccessResult(null)
                      setFormData({
                        nombre: "",
                        empresa: "",
                        email: "",
                        telefono: "",
                        ciudad: "Quito",
                        presupuesto_estimado: "",
                        descripcion: "",
                        consentimiento: true,
                      })
                    }}
                    className="min-h-[48px] px-5 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-semibold text-xs uppercase tracking-wider transition-all"
                  >
                    Nueva Solicitud
                  </button>
                </div>
              </div>
            ) : (
              /* Formulario de Captación */
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. Selector de División de Negocio */}
                <div className="space-y-3">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                    <span>1. Selecciona el Módulo o Servicio de Interés *</span>
                    <span className="text-[10px] text-brand-sage">{selectedDivision.toUpperCase()}</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {DIVISIONS.map((div) => {
                      const Icon = div.icon
                      const isSelected = selectedDivision === div.id
                      return (
                        <button
                          key={div.id}
                          type="button"
                          onClick={() => setSelectedDivision(div.id)}
                          className={`min-h-[64px] p-3 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                            isSelected 
                              ? "bg-amber-500/10 border-amber-500 text-white shadow-md ring-1 ring-amber-500" 
                              : "bg-slate-950/60 border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.04]"
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isSelected ? "text-amber-400" : "text-slate-400"}`} />
                          <div>
                            <span className="text-[11px] font-bold block truncate">{div.name}</span>
                            <span className="text-[9px] text-slate-400 block truncate">{div.label}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Alerta de Error si ocurre */}
                {errorMsg && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3 text-xs leading-relaxed">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
                    <div>
                      <span className="font-bold block">No se pudo procesar:</span>
                      <span>{errorMsg}</span>
                    </div>
                  </div>
                )}

                {/* 2. Datos del Contacto y Empresa */}
                <div className="space-y-4">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 border-b border-white/[0.08] pb-2">
                    2. Información del Solicitante
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        required
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ej. Ing. Carlos Andrade"
                        className="w-full min-h-[46px] px-4 rounded-xl bg-slate-950 border border-white/[0.12] text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all placeholder:text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                        Empresa / Razón Social (Opcional)
                      </label>
                      <input
                        type="text"
                        name="empresa"
                        value={formData.empresa}
                        onChange={handleChange}
                        placeholder="Ej. Constructora Andrade & Hijos S.A."
                        className="w-full min-h-[46px] px-4 rounded-xl bg-slate-950 border border-white/[0.12] text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all placeholder:text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                        Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="contacto@empresa.com"
                        className="w-full min-h-[46px] px-4 rounded-xl bg-slate-950 border border-white/[0.12] text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all placeholder:text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                        Teléfono / Celular WhatsApp *
                      </label>
                      <input
                        type="tel"
                        name="telefono"
                        required
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="098 123 4567"
                        className="w-full min-h-[46px] px-4 rounded-xl bg-slate-950 border border-white/[0.12] text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Requerimientos del Proyecto */}
                <div className="space-y-4">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 border-b border-white/[0.08] pb-2">
                    3. Alcance Técnico del Proyecto
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                        Ciudad / Ubicación en Ecuador
                      </label>
                      <select
                        name="ciudad"
                        value={formData.ciudad}
                        onChange={handleChange}
                        className="w-full min-h-[46px] px-4 rounded-xl bg-slate-950 border border-white/[0.12] text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                      >
                        <option value="Quito">Quito / Pichincha</option>
                        <option value="Cuenca">Cuenca / Azuay</option>
                        <option value="Guayaquil">Guayaquil / Guayas</option>
                        <option value="Loja">Loja / Loja</option>
                        <option value="Ambato">Ambato / Tungurahua</option>
                        <option value="Manta">Manta / Manabí</option>
                        <option value="Galápagos">Galápagos</option>
                        <option value="Otra">Otra Provincia / Ciudad</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                        Presupuesto Estimado (USD) (Opcional)
                      </label>
                      <input
                        type="text"
                        name="presupuesto_estimado"
                        value={formData.presupuesto_estimado}
                        onChange={handleChange}
                        placeholder="Ej. $45,000"
                        className="w-full min-h-[46px] px-4 rounded-xl bg-slate-950 border border-white/[0.12] text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                      Descripción del Requerimiento Técnico *
                    </label>
                    <textarea
                      name="descripcion"
                      required
                      rows={4}
                      value={formData.descripcion}
                      onChange={handleChange}
                      placeholder="Indique metros cuadrados aproximados, etapa actual (planos, terreno, obra gris o terminados), plazos deseados o especificaciones particulares..."
                      className="w-full p-4 rounded-xl bg-slate-950 border border-white/[0.12] text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all placeholder:text-slate-600 resize-y"
                    />
                  </div>
                </div>

                {/* Consentimiento de datos y Honeypot antispam */}
                <div className="space-y-3 pt-2">
                  {/* Honeypot field invisible para humanos */}
                  <div className="hidden" aria-hidden="true">
                    <input type="text" name="sara_hp_check" tabIndex={-1} autoComplete="off" />
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.consentimiento}
                      onChange={(e) => setFormData(prev => ({ ...prev, consentimiento: e.target.checked }))}
                      className="mt-1 h-4 w-4 rounded border-gray-700 bg-slate-950 text-amber-500 focus:ring-amber-400 focus:ring-offset-slate-900"
                    />
                    <span className="text-xs text-slate-400 leading-relaxed">
                      Autorizo a GRUPO SARA a registrar y procesar mis datos de contacto exclusivamente para la elaboración de la cotización técnica y seguimiento de la propuesta conforme a la legislación de protección de datos personales de Ecuador.
                    </span>
                  </label>
                </div>

                {/* Botón de Envío */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[52px] px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Validando y Registrando Solicitud...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Enviar Solicitud de Cotización Técnica</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>

          {/* Columna Derecha: Canales Oficiales, Presencia y Garantías */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Tarjeta de Contacto Directo */}
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/[0.08] ring-1 ring-black/[0.05] rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold tracking-widest text-brand-sage uppercase">
                  Atención Inmediata
                </span>
                <h3 className="font-display text-xl font-bold text-white">
                  Canales Oficiales
                </h3>
              </div>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-950/60 border border-white/[0.06]">
                  <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block mb-0.5">Central Telefónica / WhatsApp</span>
                    <a href="tel:0981804023" className="hover:text-amber-400 tabular-nums transition-colors block">
                      098 180 4023 / +593 98 180 4023
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-950/60 border border-white/[0.06]">
                  <Mail className="w-5 h-5 text-brand-sage shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block mb-0.5">Correo Corporativo</span>
                    <a href="mailto:sara.constructora593@gmail.com" className="hover:text-brand-sage transition-colors block">
                      sara.constructora593@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-950/60 border border-white/[0.06]">
                  <MapPin className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block mb-0.5">Sedes & Cobertura Nacional</span>
                    <p className="text-slate-400 leading-relaxed">
                      Quito (Pichincha) · Cuenca (Azuay) · Loja · Operaciones y despachos a nivel nacional.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-950/60 border border-white/[0.06]">
                  <Clock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block mb-0.5">Horario Técnico</span>
                    <p className="text-slate-400">
                      Lunes a Viernes: 08h00 - 18h00<br />
                      Sábados (Guardia de Obra): 08h30 - 13h00
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón WhatsApp Directo */}
              <a
                href="https://wa.me/593981804023?text=Hola%20GRUPO%20SARA.%20Deseo%20informaci%C3%B3n%20técnica%20sobre%20sus%20servicios%20de%20construcci%C3%B3n%20e%20ingenier%C3%ADa."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[46px] rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <span>Chatear por WhatsApp Oficial</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Garantías Corporativas */}
            <div className="bg-slate-900/60 border border-white/[0.08] rounded-3xl p-6 space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Garantías GRUPO SARA</span>
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Respuesta técnica garantizada en menos de 24 horas.</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Cálculos con normativas sísmicas vigentes (NEC-15).</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Seguridad jurídica, contratos y pólizas de fiel cumplimiento.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
