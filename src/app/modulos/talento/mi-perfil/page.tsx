'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  FileText,
  History,
  Crown,
  UploadCloud,
  Building2,
  Calendar,
  CheckCircle,
  ShieldCheck,
  Camera,
  Bell,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import PaymentGatewayModal from '@/components/sara/PaymentGatewayModal';
import {
  SaraTalentoRequestsService,
  SolicitudPersonalEmpresa,
} from '@/lib/services/saraTalentoRequestsService';
import { ObraPersonalRequestService } from '@/lib/services/obraPersonalRequestService';

export default function MiPerfilTalento() {
  const [activeTab, setActiveTab] = useState<'datos' | 'documentos' | 'planes' | 'historial'>('historial');
  const [solicitudesOfertas, setSolicitudesOfertas] = useState<SolicitudPersonalEmpresa[]>([]);
  const [bannerRespuesta, setBannerRespuesta] = useState<string | null>(null);

  // Estados para el mapa
  const [provincia, setProvincia] = useState('Pichincha');
  const [ciudad, setCiudad] = useState('Quito');
  const [calle, setCalle] = useState('Av. República del Salvador');

  // Datos personales editables
  const [nombres, setNombres] = useState('Ing. Ana');
  const [apellidos, setApellidos] = useState('Gómez PMP');
  const [telefono, setTelefono] = useState('098 421 8973');
  const [profesion, setProfesion] = useState('Ingeniera Residente de Obra');
  const [tarifaHora, setTarifaHora] = useState('35');
  const [bannerDatosGuardados, setBannerDatosGuardados] = useState(false);

  // Bóveda de Documentos
  const [documentosSubidos, setDocumentosSubidos] = useState<{
    id: string;
    nombre: string;
    tipo: 'CV' | 'SECAP' | 'SENESCYT' | 'CEDULA';
    estado: 'Verificado' | 'En Revisión' | 'Pendiente';
    fecha: string;
  }[]>([
    { id: 'doc-1', nombre: 'Hoja_de_Vida_Ing_Ana_Gomez.pdf', tipo: 'CV', estado: 'Verificado', fecha: '2026-10-15' },
    { id: 'doc-2', nombre: 'Certificado_SECAP_Fiscalizacion.pdf', tipo: 'SECAP', estado: 'Verificado', fecha: '2026-10-12' },
    { id: 'doc-3', nombre: 'Registro_SENESCYT_Civil.pdf', tipo: 'SENESCYT', estado: 'Verificado', fecha: '2026-10-10' }
  ]);

  // Estado para la foto
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de Pago
  const [selectedPlan, setSelectedPlan] = useState<'Basico' | 'Estandar' | 'VIP'>('VIP');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const sync = () => {
      setSolicitudesOfertas(SaraTalentoRequestsService.getSolicitudes());
    };
    sync();
    if (typeof window !== 'undefined') {
      window.addEventListener('sara_talento_solicitudes_cambio', sync);
      window.addEventListener('sara_requerimientos_personal_updated', sync);
      return () => {
        window.removeEventListener('sara_talento_solicitudes_cambio', sync);
        window.removeEventListener('sara_requerimientos_personal_updated', sync);
      };
    }
  }, []);

  const handleDecisionOferta = (
    sol: SolicitudPersonalEmpresa,
    decision: 'ACEPTAR_CONTRATO' | 'RECHAZAR_CONTRATO'
  ) => {
    ObraPersonalRequestService.procesarRespuestaTrabajadorContrato({
      saraTalentoSolicitudId: sol.id,
      decision,
    });
    setSolicitudesOfertas(SaraTalentoRequestsService.getSolicitudes());
    if (decision === 'ACEPTAR_CONTRATO') {
      setBannerRespuesta(
        `✅ Has aceptado formalmente el contrato ${sol.id} para la obra "${sol.obra_destino}". Se han desbloqueado los datos de contacto de ${sol.empresa_solicitante.razon_social} y notificado en tiempo real a Contratación Personal.`
      );
    } else {
      setBannerRespuesta(
        `Has rechazado la oferta ${sol.id}. Se ha notificado a la constructora para que el Agente IA reasigne la vacante.`
      );
    }
  };

  const pendientesCount = solicitudesOfertas.filter(s => s.estado === 'pendiente').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      {/* SIDEBAR */}
      <div className="w-full md:w-64 bg-slate-900 text-white min-h-screen p-6 flex flex-col shadow-xl z-10">
        <div className="mb-8 border-b border-slate-800 pb-6">
          <h2 className="text-2xl font-bold text-white mb-1">Mi Portal SARA</h2>
          <p className="text-slate-400 text-sm">Panel del Profesional / Trabajador</p>
        </div>

        <nav className="space-y-2 flex-grow">
          <button
            onClick={() => setActiveTab('historial')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'historial'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center">
              <Bell className="w-5 h-5 mr-3" /> Ofertas & Contratos
            </span>
            {pendientesCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-bold">
                {pendientesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('datos')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'datos'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-5 h-5 mr-3" /> Datos y Ubicación
          </button>
          <button
            onClick={() => setActiveTab('documentos')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'documentos'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-5 h-5 mr-3" /> Mis Documentos
          </button>
          <button
            onClick={() => setActiveTab('planes')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'planes'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Crown className="w-5 h-5 mr-3" /> Mi Plan Actual
          </button>
        </nav>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <Link href="/modulos/talento">
            <button className="w-full text-slate-400 hover:text-white text-sm font-medium transition-colors cursor-pointer">
              Volver a SARA Talento
            </button>
          </Link>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-5xl mx-auto">
          {/* TAB: BANDEJA DE OFERTAS CONTRACTUALES Y NOTIFICACIONES EN SARA-TALENTO */}
          {activeTab === 'historial' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                    Bandeja Oficial del Profesional • SARA-TALENTO
                  </span>
                  <h2 className="text-2xl font-bold mt-2 text-slate-900">
                    Notificaciones de Contratación y Aceptación de Contratos de Obra
                  </h2>
                  <p className="text-sm text-slate-500">
                    Aquí recibes en tiempo real los pedidos de contratación emitidos desde el menú <strong>Contratación Personal</strong> de las constructoras para que procedas con la aceptación o rechazo del contrato.
                  </p>
                </div>
              </div>

              {bannerRespuesta && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between gap-3">
                  <span className="text-sm font-bold">{bannerRespuesta}</span>
                  <button
                    type="button"
                    onClick={() => setBannerRespuesta(null)}
                    className="text-xs font-bold underline cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {solicitudesOfertas.map(sol => (
                  <div
                    key={sol.id}
                    className={`p-5 rounded-2xl border shadow-sm space-y-4 ${
                      sol.estado === 'pendiente'
                        ? 'bg-white border-amber-400 ring-1 ring-amber-300'
                        : sol.estado === 'aceptado' || sol.estado === 'formalizado'
                        ? 'bg-emerald-50/40 border-emerald-300'
                        : 'bg-slate-100 border-slate-300 opacity-80'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white font-mono text-xs font-bold">
                            {sol.id}
                          </span>
                          <span className="font-bold text-base text-slate-900">
                            {sol.trabajador.nombre_completo} — {sol.trabajador.categoria_ocupacional}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          Empresa Contratante: <strong>{sol.empresa_solicitante.razon_social}</strong> (RUC: {sol.empresa_solicitante.ruc}) • Obra Destino: <strong>{sol.obra_destino}</strong>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {sol.estado === 'pendiente' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDecisionOferta(sol, 'ACEPTAR_CONTRATO')}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
                            >
                              <CheckCircle2 size={15} />
                              <span>Aceptar Contrato de Obra</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDecisionOferta(sol, 'RECHAZAR_CONTRATO')}
                              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
                            >
                              <XCircle size={15} />
                              <span>Rechazar Contrato</span>
                            </button>
                          </>
                        ) : sol.estado === 'aceptado' || sol.estado === 'formalizado' ? (
                          <span className="px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle2 size={14} />
                            <span>Contrato Aceptado ({sol.fecha_aceptacion || 'Activo'})</span>
                          </span>
                        ) : (
                          <span className="px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                            Contrato Rechazado
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-sans uppercase">
                          Tarifa / Jornal Propuesto
                        </span>
                        <span className="font-bold text-slate-900">
                          ${sol.trabajador.costo_horario.toFixed(2)}/h (${sol.trabajador.jornal_real.toFixed(2)}/día)
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-sans uppercase">
                          Inicio según Cronograma
                        </span>
                        <span className="font-bold text-slate-900">{sol.fecha_inicio}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-sans uppercase">
                          Duración Fase
                        </span>
                        <span className="font-bold text-slate-900 font-sans">{sol.duracion}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-sans uppercase">
                          Seguridad SST / EPP
                        </span>
                        <span className="font-bold text-emerald-700 font-sans">
                          {sol.epp_requerido ? 'EPP Altura Decreto 255' : 'EPP Estándar Obra'}
                        </span>
                      </div>
                    </div>

                    {sol.notas_adicionales && (
                      <p className="text-xs text-slate-600 italic">
                        Detalle Técnico: {sol.notas_adicionales}
                      </p>
                    )}

                    {sol.contactos_desbloqueados && (
                      <div className="p-3 rounded-xl bg-emerald-100/70 border border-emerald-300 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-950">
                        <span className="font-bold">
                          🔓 Contacto directo habilitado tras aceptación del contrato:
                        </span>
                        <div className="flex flex-wrap items-center gap-4 font-mono">
                          <span className="flex items-center gap-1">
                            <Phone size={13} /> {sol.empresa_solicitante.telefono}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail size={13} /> {sol.empresa_solicitante.email}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: DATOS Y MAPA */}
          {activeTab === 'datos' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold mb-6">Datos Personales y Geolocalización</h2>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                <div className="p-8 border-b border-slate-100">
                  <h3 className="text-lg font-bold mb-6 text-blue-900 border-b pb-2">
                    Información de Contacto y Perfil
                  </h3>

                  <div className="flex flex-col md:flex-row items-center gap-6 mb-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <div
                      className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden relative group cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {photoPreview ? (
                        <img src={photoPreview} alt="Perfil" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-slate-400 group-hover:opacity-0 transition-opacity" />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-bold text-center px-2">
                          Cambiar Foto
                        </span>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            const reader = new FileReader();
                            reader.onload = event =>
                              setPhotoPreview(event.target?.result as string);
                            reader.readAsDataURL(e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Fotografía del Profesional</h4>
                      <p className="text-sm text-slate-500 mb-2">
                        Sube una foto clara de tu rostro. Esto aumenta un 40% tus posibilidades de contratación.
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm bg-white border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 font-bold text-slate-700 transition-colors shadow-sm"
                      >
                        {photoPreview ? 'Cambiar Imagen' : 'Seleccionar Archivo'}
                      </button>
                    </div>
                  </div>

                  {bannerDatosGuardados && (
                    <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-bold flex items-center justify-between">
                      <span>✅ Datos de perfil y coordenadas guardados exitosamente.</span>
                      <button 
                        type="button" 
                        onClick={() => setBannerDatosGuardados(false)}
                        className="text-xs text-emerald-600 underline"
                      >
                        Cerrar
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nombres</label>
                      <input
                        type="text"
                        value={nombres}
                        onChange={(e) => setNombres(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500"
                        placeholder="Ej. Juan Andrés"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Apellidos</label>
                      <input
                        type="text"
                        value={apellidos}
                        onChange={(e) => setApellidos(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500"
                        placeholder="Ej. Pérez Silva"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Especialidad / Título
                      </label>
                      <input
                        type="text"
                        value={profesion}
                        onChange={(e) => setProfesion(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500"
                        placeholder="Ej. Ingeniero Civil / Maestro Mayor"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Tarifa por Hora (USD)
                      </label>
                      <input
                        type="number"
                        value={tarifaHora}
                        onChange={(e) => setTarifaHora(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500"
                        placeholder="Ej. 30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Correo Electrónico (Protegido)
                      </label>
                      <input
                        type="email"
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500 bg-slate-50"
                        defaultValue="profesional@sara.ec"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Celular / WhatsApp (Bajo Custodia)
                      </label>
                      <input
                        type="tel"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500"
                        placeholder="098 765 4321"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setBannerDatosGuardados(true);
                        setTimeout(() => setBannerDatosGuardados(false), 5000);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow cursor-pointer"
                    >
                      Guardar Cambios de Perfil
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
                <div className="p-8 w-full md:w-1/2 border-r border-slate-100">
                  <h3 className="text-lg font-bold mb-4 text-blue-900 border-b pb-2">
                    Ajuste de Coordenadas
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Provincia</label>
                      <input
                        value={provincia}
                        onChange={e => setProvincia(e.target.value)}
                        type="text"
                        className="w-full border border-slate-300 rounded-lg px-4 py-2"
                        placeholder="Ej. Loja"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Ciudad / Cantón
                      </label>
                      <input
                        value={ciudad}
                        onChange={e => setCiudad(e.target.value)}
                        type="text"
                        className="w-full border border-slate-300 rounded-lg px-4 py-2"
                        placeholder="Ej. Loja"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Calle Principal y Secundaria
                      </label>
                      <input
                        value={calle}
                        onChange={e => setCalle(e.target.value)}
                        type="text"
                        className="w-full border border-slate-300 rounded-lg px-4 py-2"
                        placeholder="Ej. Av. Universitaria"
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-1/2 bg-blue-50 relative min-h-[320px]">
                  {ciudad || provincia ? (
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight={0}
                      marginWidth={0}
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(
                        `${calle} ${ciudad} ${provincia} Ecuador`
                      )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                      style={{ border: 0 }}
                    ></iframe>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="bg-white/95 backdrop-blur px-6 py-3 rounded-xl text-slate-700 font-bold text-sm shadow-lg border border-slate-200">
                        Ingresa tu provincia o ciudad para ubicarte en el mapa
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: DOCUMENTOS */}
          {activeTab === 'documentos' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-slate-900">Bóveda Documental & Certificaciones</h2>
                <p className="text-sm text-slate-500">
                  Sube tus documentos técnicos protegidos bajo custodia institucional. La insignia de <strong>Verificado</strong> solo se activa una vez validado con la base oficial del SECAP / SENESCYT.
                </p>
              </div>

              {/* Grid de carga de archivos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                  <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-base mb-1 text-slate-900">Hoja de Vida Oficial (CV)</h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Formato PDF (máximo 10 MB). Incluye obras ejecutadas y fiscalizaciones.
                  </p>
                  <label className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 flex flex-col items-center justify-center transition-colors bg-slate-50">
                    <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-blue-600">
                      Seleccionar Archivo PDF
                    </span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setDocumentosSubidos(prev => [
                            {
                              id: `doc-${Date.now()}`,
                              nombre: file.name,
                              tipo: 'CV',
                              estado: 'En Revisión',
                              fecha: new Date().toISOString().split('T')[0]
                            },
                            ...prev
                          ]);
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                  <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-base mb-1 text-slate-900">Certificaciones SECAP / SENESCYT / Cédula</h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Títulos profesionales, licencias de prevención de riesgos o SECAP.
                  </p>
                  <label className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 flex flex-col items-center justify-center transition-colors bg-slate-50">
                    <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-emerald-600">
                      Cargar Certificados o Cédula
                    </span>
                    <input 
                      type="file" 
                      className="hidden" 
                      multiple 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setDocumentosSubidos(prev => [
                            {
                              id: `doc-${Date.now()}`,
                              nombre: file.name,
                              tipo: 'SECAP',
                              estado: 'En Revisión',
                              fecha: new Date().toISOString().split('T')[0]
                            },
                            ...prev
                          ]);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Registro Histórico de Documentos en Custodia */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
                  <span>Expediente Documental del Profesional</span>
                  <span className="text-xs text-slate-500 font-normal">
                    {documentosSubidos.length} documento(s) registrado(s)
                  </span>
                </h3>

                <div className="divide-y divide-slate-100">
                  {documentosSubidos.map((doc) => (
                    <div key={doc.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-800 block text-sm">{doc.nombre}</span>
                          <span className="text-slate-500">Tipo: {doc.tipo} • Subido: {doc.fecha}</span>
                        </div>
                      </div>

                      <div>
                        {doc.estado === 'Verificado' ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                            <CheckCircle2 size={12} /> Verificado Oficial
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold">
                            ⏳ En Revisión Técnica
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PLANES */}
          {activeTab === 'planes' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold mb-6">Mi Plan de Visibilidad</h2>
              {paymentSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-emerald-900 mb-2">
                    ¡Plan {selectedPlan} Activo!
                  </h3>
                  <p className="text-emerald-700">
                    Tu perfil ahora goza de los beneficios y posicionamiento del plan seleccionado.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div
                      onClick={() => setSelectedPlan('Basico')}
                      className={`border-2 rounded-xl p-6 cursor-pointer bg-white transition-all ${
                        selectedPlan === 'Basico'
                          ? 'border-blue-600 ring-2 ring-blue-100'
                          : 'border-slate-200'
                      }`}
                    >
                      <h3 className="text-lg font-bold mb-1">Plan Básico</h3>
                      <p className="text-slate-500 text-sm mb-4">Comisión: 10%</p>
                    </div>
                    <div
                      onClick={() => setSelectedPlan('Estandar')}
                      className={`border-2 rounded-xl p-6 cursor-pointer bg-white transition-all ${
                        selectedPlan === 'Estandar'
                          ? 'border-blue-600 ring-2 ring-blue-100'
                          : 'border-slate-200'
                      }`}
                    >
                      <h3 className="text-lg font-bold mb-1">Plan Estándar</h3>
                      <p className="text-slate-500 text-sm mb-4">Comisión: 20%</p>
                    </div>
                    <div
                      onClick={() => setSelectedPlan('VIP')}
                      className={`border-2 rounded-xl p-6 cursor-pointer bg-white transition-all relative ${
                        selectedPlan === 'VIP'
                          ? 'border-amber-400 ring-2 ring-amber-100'
                          : 'border-slate-200'
                      }`}
                    >
                      <h3 className="text-lg font-bold mb-1 flex items-center text-amber-900">
                        <Crown className="w-5 h-5 mr-2" /> Plan VIP
                      </h3>
                      <p className="text-amber-700 text-sm mb-4">Comisión: 50%</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPayment(true)}
                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl text-lg hover:bg-slate-800 transition-colors shadow-lg cursor-pointer"
                  >
                    Actualizar a {selectedPlan} (Pagar Fee)
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <PaymentGatewayModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={() => {
          setShowPayment(false);
          setPaymentSuccess(true);
        }}
        planName={selectedPlan}
      />
    </div>
  );
}
