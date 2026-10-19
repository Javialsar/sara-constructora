'use client';
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, XCircle, Crown, Search, FileText, CheckCircle, Receipt, MapPin, Eye, 
  Building2, User, Clock, Phone, Mail, MessageSquare, AlertCircle, Sparkles, Plus, 
  FileSpreadsheet, FileDown, Lock, Unlock, Send, Check, Briefcase, Calendar, Star,
  Shield, ArrowRight, ExternalLink
} from 'lucide-react';
import { getTalentsFromDB } from '@/lib/services/talentoService';
import { 
  SaraTalentoRequestsService, 
  SolicitudPersonalEmpresa 
} from '@/lib/services/saraTalentoRequestsService';
import { exportarAExcel, exportarAPDF } from '@/lib/services/exportReports';

interface Candidate {
  id: string;
  name: string;
  role: string;
  plan: 'VIP' | 'Estandar' | 'Basico';
  status: 'pending' | 'approved';
  paymentId: string;
  documents: { type: string; status: string }[];
  rating?: number;
}

export default function AdminTalento() {
  const [activeTab, setActiveTab] = useState<'requerimientos' | 'ingresos'>('requerimientos');

  // ---------------------------------------------------------------------------
  // ESTADOS PARA REQUERIMIENTOS DE PERSONAL POR EMPRESAS
  // ---------------------------------------------------------------------------
  const [solicitudes, setSolicitudes] = useState<SolicitudPersonalEmpresa[]>([]);
  const [searchReq, setSearchReq] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pendiente' | 'aceptado'>('todos');
  const [notificacionExito, setNotificacionExito] = useState<string | null>(null);

  // Modal para Enviar Nueva Solicitud
  const [modalNuevaSolicitudOpen, setModalNuevaSolicitudOpen] = useState(false);
  const [formNuevaSolicitud, setFormNuevaSolicitud] = useState({
    empresa_razon_social: 'CONSTRUCTORA EL MIRADOR S.A.S.',
    empresa_ruc: '1190048291001',
    empresa_representante: 'Arq. Carlos Benítez',
    empresa_cargo: 'Director de Obra y Residencia',
    empresa_telefono: '+593 99 876 5432',
    empresa_email: 'contrataciones@elmirador.ec',
    empresa_ciudad: 'Loja, Ecuador',
    trabajador_nombre: 'Ing. Ana Gómez',
    trabajador_especialidad: 'Ingeniero Residente de Obra',
    trabajador_jornal: 42.50,
    trabajador_telefono: '+593 98 421 8973',
    trabajador_email: 'ana.gomez@profesional.sara.ec',
    obra_destino: 'Edificio Residencial El Mirador (Loja)',
    duracion: '3 meses (Fase Estructuras)',
    fecha_inicio: new Date().toISOString().split('T')[0],
    epp_requerido: true,
    notas_adicionales: 'Supervisión técnica de encofrados y vaciado de losas postensadas.'
  });

  // ---------------------------------------------------------------------------
  // ESTADOS PARA CANDIDATOS / INGRESOS A LA RED
  // ---------------------------------------------------------------------------
  const [candidates, setCandidates] = useState<Candidate[]>([
    { 
      id: '1', name: 'Ing. Ana Gómez', role: 'Ingeniera Civil', plan: 'VIP', status: 'pending', 
      paymentId: 'TXN-994827-STRIPE', 
      documents: [{ type: 'Cédula de Identidad', status: 'Verificado' }, { type: 'CV Académico', status: 'Subido' }, { type: 'Título SENESCYT', status: 'Subido' }] 
    },
    { 
      id: '2', name: 'Mstr. Juan Pérez', role: 'Maestro Mayor de Obra', plan: 'Basico', status: 'approved',
      paymentId: 'TXN-112349-KUSHKI',
      documents: [{ type: 'Cédula de Identidad', status: 'Verificado' }, { type: 'Certificado SECAP', status: 'Subido' }]
    },
    { 
      id: '3', name: 'Arq. Luis Silva', role: 'Arquitecto', plan: 'Estandar', status: 'pending',
      paymentId: 'TXN-558291-STRIPE',
      documents: [{ type: 'Cédula de Identidad', status: 'Subido' }, { type: 'Portafolio de Obras', status: 'Subido' }]
    }
  ]);

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // ---------------------------------------------------------------------------
  // CARGA INICIAL Y LISTENERS REACTIVOS
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Cargar requerimientos de empresas
    setSolicitudes(SaraTalentoRequestsService.getSolicitudes());

    const handleActualizacion = () => {
      setSolicitudes(SaraTalentoRequestsService.getSolicitudes());
    };

    window.addEventListener('sara_talento_solicitudes_cambio', handleActualizacion);

    // Cargar candidatos a la red
    getTalentsFromDB().then(data => {
      if (data && data.length > 0) {
        setCandidates(data.map(d => ({
          id: d.id,
          name: d.name,
          role: d.role,
          plan: d.plan,
          status: d.status,
          paymentId: d.paymentId || 'TXN-SARA-VERIFIED',
          documents: d.documents || [{ type: 'Cédula de Identidad', status: 'Verificado' }],
          rating: d.rating
        })));
      }
    });

    return () => {
      window.removeEventListener('sara_talento_solicitudes_cambio', handleActualizacion);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // ACCIONES DE REQUERIMIENTOS DE PERSONAL
  // ---------------------------------------------------------------------------
  const handleAceptarDisponibilidad = (id: string, nombreTrabajador: string, empresa: string) => {
    const actualizada = SaraTalentoRequestsService.aceptarSolicitud(id);
    if (actualizada) {
      setSolicitudes(SaraTalentoRequestsService.getSolicitudes());
      setNotificacionExito(
        `✅ DISPONIBILIDAD ACEPTADA: SARA Talento ha notificado a ${empresa}. Se han habilitado bidireccionalmente los números de contacto y correos para ${nombreTrabajador} y el contratista.`
      );
      setTimeout(() => setNotificacionExito(null), 8000);
    }
  };

  const handleFormalizarContrato = (id: string) => {
    SaraTalentoRequestsService.formalizarContrato(id);
    setSolicitudes(SaraTalentoRequestsService.getSolicitudes());
    setNotificacionExito(`📜 Contrato formalizado con éxito para la solicitud ${id}.`);
    setTimeout(() => setNotificacionExito(null), 5000);
  };

  const handleEnviarNuevaSolicitud = (e: React.FormEvent) => {
    e.preventDefault();
    const nueva = SaraTalentoRequestsService.crearSolicitud({
      empresa_solicitante: {
        razon_social: formNuevaSolicitud.empresa_razon_social,
        ruc: formNuevaSolicitud.empresa_ruc,
        representante: formNuevaSolicitud.empresa_representante,
        cargo: formNuevaSolicitud.empresa_cargo,
        telefono: formNuevaSolicitud.empresa_telefono,
        email: formNuevaSolicitud.empresa_email,
        ciudad: formNuevaSolicitud.empresa_ciudad
      },
      trabajador: {
        id: `tr-custom-${Date.now().toString().slice(-4)}`,
        nombre_completo: formNuevaSolicitud.trabajador_nombre,
        cedula: '110******',
        categoria_ocupacional: formNuevaSolicitud.trabajador_especialidad,
        calificacion: 5.0,
        jornal_real: Number(formNuevaSolicitud.trabajador_jornal) || 40,
        costo_horario: Number((Number(formNuevaSolicitud.trabajador_jornal) / 8).toFixed(2)) || 5,
        telefono: formNuevaSolicitud.trabajador_telefono,
        email: formNuevaSolicitud.trabajador_email
      },
      obra_destino: formNuevaSolicitud.obra_destino,
      duracion: formNuevaSolicitud.duracion,
      fecha_inicio: formNuevaSolicitud.fecha_inicio,
      epp_requerido: formNuevaSolicitud.epp_requerido,
      notas_adicionales: formNuevaSolicitud.notas_adicionales
    });

    setSolicitudes(SaraTalentoRequestsService.getSolicitudes());
    setModalNuevaSolicitudOpen(false);
    setNotificacionExito(`🚀 Solicitud formal ${nueva.id} enviada exitosamente a SARA Talento.`);
    setTimeout(() => setNotificacionExito(null), 6000);
  };

  // ---------------------------------------------------------------------------
  // ACCIONES DE CANDIDATOS
  // ---------------------------------------------------------------------------
  const handleActionCandidate = (id: string, newStatus: 'pending' | 'approved') => {
    setCandidates(candidates.map(c => c.id === id ? { ...c, status: newStatus } : c));
    setSelectedCandidate(null);
  };

  // ---------------------------------------------------------------------------
  // FILTRADO DE SOLICITUDES
  // ---------------------------------------------------------------------------
  const solicitudesFiltradas = solicitudes.filter(s => {
    const coincideTexto = 
      s.empresa_solicitante.razon_social.toLowerCase().includes(searchReq.toLowerCase()) ||
      s.empresa_solicitante.representante.toLowerCase().includes(searchReq.toLowerCase()) ||
      s.trabajador.nombre_completo.toLowerCase().includes(searchReq.toLowerCase()) ||
      s.trabajador.categoria_ocupacional.toLowerCase().includes(searchReq.toLowerCase()) ||
      s.obra_destino.toLowerCase().includes(searchReq.toLowerCase()) ||
      s.id.toLowerCase().includes(searchReq.toLowerCase());

    if (!coincideTexto) return false;
    if (filtroEstado === 'todos') return true;
    if (filtroEstado === 'pendiente') return s.estado === 'pendiente';
    if (filtroEstado === 'aceptado') return s.estado === 'aceptado' || s.estado === 'formalizado';
    return true;
  });

  const totalPendientes = solicitudes.filter(s => s.estado === 'pendiente').length;

  // ---------------------------------------------------------------------------
  // EXPORTACIONES A EXCEL Y PDF
  // ---------------------------------------------------------------------------
  const exportarRequerimientosExcel = () => {
    const datosExcel = solicitudesFiltradas.map(s => ({
      'Código Solicitud': s.id,
      'Empresa Solicitante': s.empresa_solicitante.razon_social,
      'RUC Solicitante': s.empresa_solicitante.ruc,
      'Representante': s.empresa_solicitante.representante,
      'Teléfono Empresa': s.contactos_desbloqueados ? s.empresa_solicitante.telefono : 'En Custodia SARA',
      'Email Empresa': s.contactos_desbloqueados ? s.empresa_solicitante.email : 'En Custodia SARA',
      'Profesional Requerido': s.trabajador.nombre_completo,
      'Especialidad': s.trabajador.categoria_ocupacional,
      'Teléfono Profesional': s.contactos_desbloqueados ? s.trabajador.telefono : 'En Custodia SARA',
      'Email Profesional': s.contactos_desbloqueados ? s.trabajador.email : 'En Custodia SARA',
      'Obra de Destino': s.obra_destino,
      'Tiempo / Duración': s.duracion,
      'Fecha Inicio': s.fecha_inicio,
      'Jornal Acordado ($)': s.trabajador.jornal_real.toFixed(2),
      'Estado Solicitud': s.estado.toUpperCase(),
      'Contactos Desbloqueados': s.contactos_desbloqueados ? 'SI (Mutuos)' : 'NO (Custodia)'
    }));

    exportarAExcel(
      datosExcel, 
      'Requerimientos_Personal_SARA_Talento', 
      'Requerimientos Obra', 
      'talento'
    );
  };

  const exportarRequerimientosPDF = () => {
    const encabezados = [
      'Código',
      'Empresa Solicitante',
      'Profesional',
      'Especialidad',
      'Tiempo / Duración',
      'Obra Destino',
      'Estado',
      'Contacto Desbloqueado'
    ];

    const filas = solicitudesFiltradas.map(s => [
      s.id,
      `${s.empresa_solicitante.razon_social}\nRep: ${s.empresa_solicitante.representante}`,
      s.trabajador.nombre_completo,
      s.trabajador.categoria_ocupacional,
      `${s.duracion}\nInicio: ${s.fecha_inicio}`,
      s.obra_destino,
      s.estado.toUpperCase(),
      s.contactos_desbloqueados ? `HABILITADO\nTel: ${s.trabajador.telefono}` : 'EN CUSTODIA SARA'
    ]);

    exportarAPDF(
      'REPORTE OFICIAL DE REQUERIMIENTOS Y MATCHMAKING LABORAL SARA TALENTO',
      encabezados,
      filas,
      'SARA_Talento_Requerimientos_Obras',
      'Control de intermediación formal de personal de obra y habilitación de datos de contacto entre empresas y trabajadores',
      'talento'
    );
  };

  return (
    <div className="p-4 sm:p-8 font-sans text-slate-800 max-w-7xl mx-auto relative min-h-screen">
      
      {/* ===================================================================== */}
      {/* ENCABEZADO PRINCIPAL & BOTONES OFICIALES                             */}
      {/* ===================================================================== */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase tracking-wider">
              Plataforma de Talento Humano & Obra Civil
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
              Custodia Institucional Activa
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Administración: SARA Talento
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-3xl">
            Gestión de solicitudes de personal emitidas por constructoras, confirmación de disponibilidad técnica y desbloqueo bidireccional seguro de números de contacto y correos para formalizar contratos.
          </p>
        </div>

        {/* Botones de Exportación Corporativa */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={exportarRequerimientosExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            title="Descargar reporte completo en formato Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel</span>
          </button>
          <button
            onClick={exportarRequerimientosPDF}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            title="Descargar reporte en formato PDF membretado con firmas oficiales"
          >
            <FileDown className="w-4 h-4" />
            <span>PDF</span>
          </button>
        </div>
      </header>

      {/* BANNER DE NOTIFICACIÓN AGÉNTICA TEMPORAL */}
      {notificacionExito && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            {notificacionExito}
          </div>
          <button 
            onClick={() => setNotificacionExito(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-base leading-none"
          >
            &times;
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SELECTOR DE PESTAÑAS PRINCIPALES                                    */}
      {/* ===================================================================== */}
      <div className="flex gap-2 border-b border-slate-200 mb-6 pb-px">
        <button
          onClick={() => setActiveTab('requerimientos')}
          className={`px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'requerimientos'
              ? 'border-amber-500 text-amber-600 bg-amber-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Solicitudes de Personal por Empresas (Matchmaking)</span>
          {totalPendientes > 0 && (
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-amber-500 text-slate-950 font-extrabold shadow-sm">
              {totalPendientes} pendientes
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ingresos')}
          className={`px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'ingresos'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>Solicitudes de Ingreso a la Red (Altas & Pagos)</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-slate-200 text-slate-700 font-bold">
            {candidates.length}
          </span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* VISTA 1: REQUERIMIENTOS DE PERSONAL POR EMPRESAS                     */}
      {/* ===================================================================== */}
      {activeTab === 'requerimientos' && (
        <div className="space-y-6">
          
          {/* Barra de Filtros y Botón para Enviar Nueva Solicitud */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar empresa, profesional u obra..."
                  value={searchReq}
                  onChange={(e) => setSearchReq(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs w-full outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Filtro por estado */}
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setFiltroEstado('todos')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    filtroEstado === 'todos' 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todos ({solicitudes.length})
                </button>
                <button
                  onClick={() => setFiltroEstado('pendiente')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    filtroEstado === 'pendiente' 
                      ? 'bg-amber-500 text-slate-950' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Pendientes ({totalPendientes})
                </button>
                <button
                  onClick={() => setFiltroEstado('aceptado')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    filtroEstado === 'aceptado' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Disponibles / Aceptados ({solicitudes.filter(s => s.estado === 'aceptado' || s.estado === 'formalizado').length})
                </button>
              </div>
            </div>

            {/* Botón para abrir modal de solicitud directa */}
            <button
              onClick={() => setModalNuevaSolicitudOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Solicitud de Personal (Empresa)</span>
            </button>
          </div>

          {/* Protocolo Institucional de Custodia y Desbloqueo */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md border border-slate-700/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    Regla de Intermediación & Desbloqueo Seguro de Contactos
                  </h3>
                  <p className="text-slate-300 text-xs mt-1 leading-relaxed max-w-3xl">
                    1. Mientras la solicitud esté <strong className="text-amber-400">Pendiente</strong>, los teléfonos y correos directos de ambas partes permanecen custodiados.<br />
                    2. Al presionar <strong className="text-emerald-400">"Aceptar y Notificar Disponibilidad a la Empresa"</strong>, se produce el match formal: se le habilitan al contratista los datos de contacto del trabajador, y al trabajador le llegan el número y correo de la empresa para ponerse en contacto y formalizar el contrato.
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] font-mono text-slate-400 block">SARA Talento Humano</span>
                <span className="text-xs font-bold text-amber-400">Matchmaking Bidireccional</span>
              </div>
            </div>
          </div>

          {/* LISTA DE TARJETAS DE SOLICITUDES DE PERSONAL */}
          {solicitudesFiltradas.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
              <Building2 className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-600">No se encontraron solicitudes con el criterio indicado.</p>
              <p className="text-xs">Usa el botón "Nueva Solicitud de Personal (Empresa)" para emitir un requerimiento.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {solicitudesFiltradas.map((sol) => {
                const esAceptado = sol.estado === 'aceptado' || sol.estado === 'formalizado';

                return (
                  <div 
                    key={sol.id}
                    className={`bg-white rounded-2xl border transition-all p-5 shadow-sm space-y-4 ${
                      esAceptado 
                        ? 'border-emerald-300 bg-emerald-50/20 shadow-emerald-500/5' 
                        : 'border-slate-200 hover:border-amber-400'
                    }`}
                  >
                    {/* Encabezado de la Tarjeta */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                          {sol.id}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          Emitido: {sol.fecha_solicitud}
                        </span>
                        {sol.fecha_aceptacion && (
                          <span className="text-xs text-emerald-600 font-mono font-bold">
                            • Aceptado: {sol.fecha_aceptacion}
                          </span>
                        )}
                      </div>

                      {/* Badge de Estado */}
                      <div>
                        {sol.estado === 'pendiente' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pendiente de Aceptación (Disponibilidad)</span>
                          </span>
                        )}
                        {sol.estado === 'aceptado' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>✅ Disponibilidad Aceptada (Contactos Habilitados)</span>
                          </span>
                        )}
                        {sol.estado === 'formalizado' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>Contrato Formalizado en Obra</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Contenido Principal: Quién Solicita + Trabajador + Tiempo */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
                      
                      {/* COLUMNA 1: ¿QUIÉN SOLICITA? (EMPRESA SOLICITANTE) */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-blue-600" />
                            Quién Solicita (Empresa / Contratista)
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">RUC: {sol.empresa_solicitante.ruc}</span>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900">
                            {sol.empresa_solicitante.razon_social}
                          </h4>
                          <p className="text-slate-600 font-medium mt-0.5">
                            Rep: {sol.empresa_solicitante.representante} ({sol.empresa_solicitante.cargo})
                          </p>
                          <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {sol.empresa_solicitante.ciudad}
                          </p>
                        </div>

                        {/* DATOS DE CONTACTO DE LA EMPRESA (LLEGAN AL PERSONAL AL ACEPTAR) */}
                        <div className="pt-2 border-t border-slate-200 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">
                            Contacto Directo de la Empresa:
                          </span>
                          
                          {sol.contactos_desbloqueados ? (
                            <div className="p-2.5 rounded-lg bg-emerald-100/60 border border-emerald-300 space-y-1 text-emerald-950 font-medium">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1 text-[11px] font-bold">
                                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                                  {sol.empresa_solicitante.telefono}
                                </span>
                                <div className="flex items-center gap-1">
                                  <a
                                    href={`https://wa.me/${sol.empresa_solicitante.telefono.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 flex items-center gap-0.5"
                                  >
                                    <MessageSquare className="w-2.5 h-2.5" />
                                    WhatsApp
                                  </a>
                                  <a
                                    href={`tel:${sol.empresa_solicitante.telefono}`}
                                    className="px-2 py-0.5 rounded bg-slate-900 text-white font-bold text-[10px] hover:bg-slate-800"
                                  >
                                    Llamar
                                  </a>
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-1">
                                <span className="flex items-center gap-1 text-[11px] text-slate-700">
                                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                                  {sol.empresa_solicitante.email}
                                </span>
                                <a
                                  href={`mailto:${sol.empresa_solicitante.email}?subject=Aceptacion%20Plaza%20Laboral%20${sol.id}`}
                                  className="text-blue-700 hover:underline text-[10px] font-bold"
                                >
                                  Enviar Correo
                                </a>
                              </div>
                              <p className="text-[9px] text-emerald-800 font-mono pt-0.5">
                                ✓ Este contacto fue enviado al personal de obra para coordinar la firma del contrato.
                              </p>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-lg bg-slate-200/60 border border-slate-300 text-slate-500 flex items-center gap-2">
                              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                              <span className="text-[10px] font-mono leading-tight">
                                Teléfono y correo en custodia institucional. Se habilitarán al aceptar la disponibilidad.
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* COLUMNA 2: PROFESIONAL / PERSONAL REQUERIDO */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-amber-500" />
                            Personal Técnico Requerido
                          </span>
                          <span className="text-amber-500 font-extrabold flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {sol.trabajador.calificacion.toFixed(1)} SARA Score
                          </span>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900">
                            {sol.trabajador.nombre_completo}
                          </h4>
                          <p className="text-slate-600 font-medium mt-0.5">
                            {sol.trabajador.categoria_ocupacional}
                          </p>
                          <p className="text-slate-500 text-[11px] font-mono mt-0.5">
                            Jornal: ${sol.trabajador.jornal_real.toFixed(2)} USD | Costo/h: ${sol.trabajador.costo_horario.toFixed(2)} USD
                          </p>
                        </div>

                        {/* DATOS DE CONTACTO DEL TRABAJADOR (SE HABILITAN AL CONTRATISTA) */}
                        <div className="pt-2 border-t border-slate-200 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">
                            Contacto Directo del Profesional:
                          </span>

                          {sol.contactos_desbloqueados ? (
                            <div className="p-2.5 rounded-lg bg-emerald-100/60 border border-emerald-300 space-y-1 text-emerald-950 font-medium">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1 text-[11px] font-bold">
                                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                                  {sol.trabajador.telefono}
                                </span>
                                <div className="flex items-center gap-1">
                                  <a
                                    href={`https://wa.me/${sol.trabajador.telefono.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 flex items-center gap-0.5"
                                  >
                                    <MessageSquare className="w-2.5 h-2.5" />
                                    WhatsApp
                                  </a>
                                  <a
                                    href={`tel:${sol.trabajador.telefono}`}
                                    className="px-2 py-0.5 rounded bg-slate-900 text-white font-bold text-[10px] hover:bg-slate-800"
                                  >
                                    Llamar
                                  </a>
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-1">
                                <span className="flex items-center gap-1 text-[11px] text-slate-700">
                                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                                  {sol.trabajador.email}
                                </span>
                                <a
                                  href={`mailto:${sol.trabajador.email}?subject=Contacto%20de%20Contratacion%20-%20${sol.obra_destino}`}
                                  className="text-blue-700 hover:underline text-[10px] font-bold"
                                >
                                  Enviar Correo
                                </a>
                              </div>
                              <p className="text-[9px] text-emerald-800 font-mono pt-0.5">
                                ✓ Habilitado para el contratista para ponerse de acuerdo y formalizar el contrato.
                              </p>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-lg bg-slate-200/60 border border-slate-300 text-slate-500 flex items-center gap-2">
                              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                              <span className="text-[10px] font-mono leading-tight">
                                Teléfono y correo en custodia institucional SARA Talento. Se desbloquearán al confirmar disponibilidad.
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* COLUMNA 3: ¿PARA QUÉ TIEMPO? (DURACIÓN & DESTINO) */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-purple-600" />
                            Para qué Tiempo & Obra Destino
                          </span>

                          <div className="space-y-1.5 pt-1">
                            <div className="flex justify-between border-b border-slate-200 pb-1">
                              <span className="text-slate-500">Obra / Proyecto:</span>
                              <strong className="text-slate-900 text-right">{sol.obra_destino}</strong>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 pb-1">
                              <span className="text-slate-500">Tiempo Requerido:</span>
                              <strong className="text-purple-700 font-extrabold">{sol.duracion}</strong>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 pb-1">
                              <span className="text-slate-500">Fecha Estimada Inicio:</span>
                              <strong className="text-slate-900">{sol.fecha_inicio}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">EPP Homologado:</span>
                              <span className={sol.epp_requerido ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                                {sol.epp_requerido ? 'Exigido en Obra' : 'Opcional'}
                              </span>
                            </div>
                          </div>

                          {sol.notas_adicionales && (
                            <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-200">
                              "{sol.notas_adicionales}"
                            </p>
                          )}
                        </div>

                        {/* BOTÓN PRINCIPAL DE ACCIÓN: ACEPTACIÓN & NOTIFICACIÓN */}
                        <div className="pt-2">
                          {sol.estado === 'pendiente' ? (
                            <button
                              type="button"
                              onClick={() => handleAceptarDisponibilidad(sol.id, sol.trabajador.nombre_completo, sol.empresa_solicitante.razon_social)}
                              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
                            >
                              <Unlock className="w-4 h-4 text-amber-300" />
                              <span>Aceptar y Notificar Disponibilidad a la Empresa</span>
                            </button>
                          ) : sol.estado === 'aceptado' ? (
                            <div className="space-y-2">
                              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-bold text-center border border-emerald-200">
                                Disponibilidad notificada • Contactos habilitados
                              </div>
                              <button
                                type="button"
                                onClick={() => handleFormalizarContrato(sol.id)}
                                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                              >
                                <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                                <span>Formalizar Contrato Laboral</span>
                              </button>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold text-center border border-blue-200 flex items-center justify-center gap-1.5">
                              <Check className="w-4 h-4 text-blue-600" />
                              <span>Contrato Civil / Laboral Formalizado</span>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ===================================================================== */}
      {/* VISTA 2: SOLICITUDES DE INGRESO A LA RED (PLANES VIP/BÁSICO & AUDITORÍA) */}
      {/* ===================================================================== */}
      {activeTab === 'ingresos' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-50">
            <div>
              <h2 className="font-bold text-base text-slate-900">Postulantes e Ingresos a la Red SARA</h2>
              <p className="text-xs text-slate-500">Revisión de documentos habilitantes, asignación de estrellas de confianza y comprobantes de suscripción.</p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar postulante..." 
                className="pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500" 
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs border-b border-slate-200 uppercase font-mono">
                  <th className="p-4 font-bold">Profesional</th>
                  <th className="p-4 font-bold">Especialidad</th>
                  <th className="p-4 font-bold">Plan (Comisión)</th>
                  <th className="p-4 font-bold">Estado</th>
                  <th className="p-4 font-bold text-right">Acción Requerida</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(candidate => (
                  <tr key={candidate.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{candidate.name}</td>
                    <td className="p-4 text-slate-600">{candidate.role}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center w-max ${
                        candidate.plan === 'VIP' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        candidate.plan === 'Estandar' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {candidate.plan === 'VIP' && <Crown className="w-3 h-3 mr-1" />}
                        {candidate.plan} 
                        <span className="font-normal opacity-70 ml-1">
                          ({candidate.plan === 'VIP' ? '50%' : candidate.plan === 'Estandar' ? '20%' : '10%'})
                        </span>
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        candidate.status === 'approved' ? 'text-emerald-700 bg-emerald-100 font-bold' : 'text-amber-700 bg-amber-100 font-bold'
                      }`}>
                        {candidate.status === 'approved' ? 'Alta (Visible en Red)' : 'Pendiente Revisión'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => setSelectedCandidate(candidate)} 
                        className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 text-xs font-bold transition-colors inline-flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {candidate.status === 'pending' ? 'Revisar para Alta' : 'Ver Expediente'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: EMITIR NUEVA SOLICITUD DE PERSONAL (EMPRESA SOLICITANTE)        */}
      {/* ===================================================================== */}
      {modalNuevaSolicitudOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header Modal */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Nueva Solicitud de Personal por Empresa
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Registra la empresa solicitante, el tiempo requerido y el personal buscado
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setModalNuevaSolicitudOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200/60 text-slate-500 hover:text-slate-900 flex items-center justify-center"
              >
                &times;
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleEnviarNuevaSolicitud} className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
              
              {/* Sección 1: Quién Solicita */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
                <span className="font-bold text-blue-900 text-xs block uppercase flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  1. ¿Quién Solicita? (Datos de la Empresa / Contratista)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Razón Social / Constructora *</label>
                    <input
                      type="text"
                      required
                      value={formNuevaSolicitud.empresa_razon_social}
                      onChange={(e) => setFormNuevaSolicitud({ ...formNuevaSolicitud, empresa_razon_social: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">RUC de la Empresa *</label>
                    <input
                      type="text"
                      required
                      value={formNuevaSolicitud.empresa_ruc}
                      onChange={(e) => setFormNuevaSolicitud({ ...formNuevaSolicitud, empresa_ruc: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Representante / Director de Obra *</label>
                    <input
                      type="text"
                      required
                      value={formNuevaSolicitud.empresa_representante}
                      onChange={(e) => setFormNuevaSolicitud({ ...formNuevaSolicitud, empresa_representante: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Teléfono Corporativo *</label>
                    <input
                      type="text"
                      required
                      value={formNuevaSolicitud.empresa_telefono}
                      onChange={(e) => setFormNuevaSolicitud({ ...formNuevaSolicitud, empresa_telefono: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Correo Electrónico Corporativo *</label>
                  <input
                    type="email"
                    required
                    value={formNuevaSolicitud.empresa_email}
                    onChange={(e) => setFormNuevaSolicitud({ ...formNuevaSolicitud, empresa_email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    🔒 Este correo y teléfono se mantendrán protegidos y sólo se habilitarán al trabajador cuando éste acepte la disponibilidad.
                  </p>
                </div>
              </div>

              {/* Sección 2: Personal Solicitado */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-3">
                <span className="font-bold text-amber-900 text-xs block uppercase flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-600" />
                  2. Profesional o Personal Técnico Requerido
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Nombre del Profesional / Trabajador *</label>
                    <input
                      type="text"
                      required
                      value={formNuevaSolicitud.trabajador_nombre}
                      onChange={(e) => setFormNuevaSolicitud({ ...formNuevaSolicitud, trabajador_nombre: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Especialidad / Cargo en Obra *</label>
                    <input
                      type="text"
                      required
                      value={formNuevaSolicitud.trabajador_especialidad}
                      onChange={(e) => setFormNuevaSolicitud({ ...formNuevaSolicitud, trabajador_especialidad: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Jornal Diario ($ USD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formNuevaSolicitud.trabajador_jornal}
                      onChange={(e) => setFormNuevaSolicitud({ ...formNuevaSolicitud, trabajador_jornal: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Teléfono Profesional *</label>
                    <input
                      type="text"
                      required
                      value={formNuevaSolicitud.trabajador_telefono}
                      onChange={(e) => setFormNuevaSolicitud({ ...formNuevaSolicitud, trabajador_telefono: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Email Profesional *</label>
                    <input
                      type="email"
                      required
                      value={formNuevaSolicitud.trabajador_email}
                      onChange={(e) => setFormNuevaSolicitud({ ...formNuevaSolicitud, trabajador_email: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 3: ¿Para qué tiempo? & Obra */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 text-xs block uppercase flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-600" />
                  3. ¿Para qué Tiempo? & Obra Destino
                </span>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Proyecto / Obra Destino *</label>
                  <input
                    type="text"
                    required
                    value={formNuevaSolicitud.obra_destino}
                    onChange={(e) => setFormNuevaSolicitud({ ...formNuevaSolicitud, obra_destino: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Duración Prevista *</label>
                    <select
                      value={formNuevaSolicitud.duracion}
                      onChange={(e) => setFormNuevaSolicitud({ ...formNuevaSolicitud, duracion: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 bg-white"
                    >
                      <option value="1 mes (Fase Cimentación)">1 mes (Fase Cimentación)</option>
                      <option value="3 meses (Fase Estructuras)">3 meses (Fase Estructuras)</option>
                      <option value="6 meses (Obra Gruesa)">6 meses (Obra Gruesa)</option>
                      <option value="Proyecto Completo (12 meses)">Proyecto Completo (12 meses)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Fecha Estimada de Inicio *</label>
                    <input
                      type="date"
                      required
                      value={formNuevaSolicitud.fecha_inicio}
                      onChange={(e) => setFormNuevaSolicitud({ ...formNuevaSolicitud, fecha_inicio: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="modal-epp-req"
                    checked={formNuevaSolicitud.epp_requerido}
                    onChange={(e) => setFormNuevaSolicitud({ ...formNuevaSolicitud, epp_requerido: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300"
                  />
                  <label htmlFor="modal-epp-req" className="text-slate-700 text-xs cursor-pointer font-medium">
                    Exigir Kit de EPP Homologado (Casco, Calzado Dieléctrico con Punta de Acero y Chaleco)
                  </label>
                </div>
              </div>

              {/* Botones del Modal */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalNuevaSolicitudOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar la Solicitud a SARA Talento</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL EXISTENTE: REVISIÓN Y ALTA DE CANDIDATOS (DOCUMENTOS & PAGOS)  */}
      {/* ===================================================================== */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur">
              <h2 className="text-xl font-bold flex items-center">
                <ShieldCheck className="w-6 h-6 text-blue-600 mr-2" />
                Auditoría y Alta de Profesional
              </h2>
              <button onClick={() => setSelectedCandidate(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Info General */}
              <div className="flex bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-500 mr-4">
                  {selectedCandidate.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">{selectedCandidate.name}</h3>
                  <p className="text-slate-600 font-medium">{selectedCandidate.role}</p>
                  <p className="text-sm text-slate-500 mt-1 flex items-center"><MapPin className="w-4 h-4 mr-1" /> Validando Ubicación GPS</p>
                </div>
                
                {/* Asignador de Estrellas Admin */}
                <div className="ml-auto flex flex-col items-end justify-center border-l border-slate-200 pl-6">
                  <span className="text-xs font-bold text-slate-400 uppercase mb-1">Calificación Inicial (SARA Score)</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star}
                        onClick={() => {
                          setCandidates(candidates.map(c => c.id === selectedCandidate.id ? { ...c, rating: star } : c));
                          setSelectedCandidate({ ...selectedCandidate, rating: star });
                        }}
                        className={`transition-colors ${
                          (selectedCandidate.rating || 0) >= star 
                            ? 'text-amber-400 hover:text-amber-500' 
                            : 'text-slate-300 hover:text-amber-200'
                        }`}
                      >
                        <svg className="w-8 h-8 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Estrellas de Confianza</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Documentos */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-3 flex items-center border-b pb-2">
                    <FileText className="w-5 h-5 text-blue-500 mr-2" />
                    Documentos de Respaldo
                  </h4>
                  <ul className="space-y-3">
                    {selectedCandidate.documents.map((doc, idx) => (
                      <li key={idx} className="flex justify-between items-center text-sm border border-slate-200 p-2 rounded-lg bg-white shadow-sm">
                        <span className="font-medium text-slate-700">{doc.type}</span>
                        <a href="#" className="text-blue-600 hover:underline text-xs font-bold">Ver PDF</a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pagos */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-3 flex items-center border-b pb-2">
                    <Receipt className="w-5 h-5 text-emerald-500 mr-2" />
                    Validación de Pago
                  </h4>
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                    <p className="text-xs text-emerald-800 uppercase font-bold mb-1">Plan Contratado</p>
                    <p className="text-lg font-black text-emerald-900 mb-3">{selectedCandidate.plan} ({selectedCandidate.plan === 'VIP' ? '50%' : selectedCandidate.plan === 'Estandar' ? '20%' : '10%'} com.)</p>
                    
                    <p className="text-xs text-emerald-800 uppercase font-bold mb-1">ID Transacción (Kushki/Stripe)</p>
                    <code className="text-xs bg-white px-2 py-1 rounded text-emerald-700 font-mono font-bold block mb-2">{selectedCandidate.paymentId}</code>
                    
                    <div className="flex items-center text-emerald-700 text-sm font-bold mt-3">
                      <CheckCircle className="w-4 h-4 mr-1" /> Pago Confirmado en Banco
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
              <button 
                onClick={() => setSelectedCandidate(null)}
                className="px-6 py-2 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-100"
              >
                Cerrar
              </button>
              
              {selectedCandidate.status === 'pending' ? (
                <button 
                  onClick={() => handleActionCandidate(selectedCandidate.id, 'approved')}
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center shadow-md shadow-blue-500/20"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Aprobar y Dar de Alta
                </button>
              ) : (
                <button 
                  onClick={() => handleActionCandidate(selectedCandidate.id, 'pending')}
                  className="px-6 py-2 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 flex items-center shadow-md shadow-amber-500/20"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Revocar Alta
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
