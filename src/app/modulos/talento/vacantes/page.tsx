'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Building2,
  HardHat,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Filter,
  ArrowRight,
  ExternalLink,
  FileText,
  UploadCloud,
  X,
  AlertTriangle,
  Award,
  Sparkles,
  ChevronRight,
  Phone,
  Mail,
  Users,
  Check
} from 'lucide-react';
import TalentoSubNav from '@/components/sara/TalentoSubNav';
import {
  SaraVacantesService,
  VacanteEmpleo,
  CandidatoPostulacion,
  TipoContratoLaboral,
  CategoriaCICS
} from '@/lib/services/saraVacantesService';
import { LISTA_PROVINCIAS_ECUADOR } from '@/lib/constants/ecuadorGeo';

const PROVINCIAS_LISTA = ['Todas', ...LISTA_PROVINCIAS_ECUADOR];

const ESPECIALIDADES_LISTA = [
  'Todas',
  'Ingeniería Civil',
  'Maestro Mayor',
  'Topografía',
  'Fierrero',
  'Albañil',
  'Operador Maquinaria Pesada'
];

const TIPOS_CONTRATO_LISTA: ('Todos' | TipoContratoLaboral)[] = [
  'Todos',
  'Obra cierta',
  'Servicios profesionales',
  'Jornal por tarea',
  'Plazo fijo'
];

export default function BolsaVacantesPage() {
  const [vacantes, setVacantes] = useState<VacanteEmpleo[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros de búsqueda
  const [busquedaTexto, setBusquedaTexto] = useState('');
  const [filtroProvincia, setFiltroProvincia] = useState('Todas');
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('Todas');
  const [filtroContrato, setFiltroContrato] = useState<'Todos' | TipoContratoLaboral>('Todos');
  const [filtroJornalMin, setFiltroJornalMin] = useState<number>(0);

  // Estados de modales
  const [vacanteSeleccionada, setVacanteSeleccionada] = useState<VacanteEmpleo | null>(null);
  const [modalPostulacionAbierto, setModalPostulacionAbierto] = useState(false);
  const [postulacionExitosa, setPostulacionExitosa] = useState<CandidatoPostulacion | null>(null);

  // Datos del formulario de postulación
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tarifaPropuesta, setTarifaPropuesta] = useState<number>(35);
  const [tipoTarifa, setTipoTarifa] = useState<'jornal' | 'hora' | 'mensual'>('jornal');
  const [mensajePresentacion, setMensajePresentacion] = useState('');
  const [experienciaAnios, setExperienciaAnios] = useState<number>(5);
  const [archivosCargados, setArchivosCargados] = useState<
    { nombre: string; tipo: 'CV' | 'SECAP' | 'SENESCYT' | 'CEDULA' | 'ALTURAS' | 'IESS'; verificado: boolean }[]
  >([
    { nombre: 'Hoja_de_Vida_Actualizada_2026.pdf', tipo: 'CV', verificado: true },
    { nombre: 'Cedula_Identidad_Escaneada.pdf', tipo: 'CEDULA', verificado: true }
  ]);
  const [nuevoArchivoNombre, setNuevoArchivoNombre] = useState('');
  const [nuevoArchivoTipo, setNuevoArchivoTipo] = useState<'CV' | 'SECAP' | 'SENESCYT' | 'CEDULA' | 'ALTURAS' | 'IESS'>('SECAP');
  const [aceptaTerminos, setAceptaTerminos] = useState(true);
  const [postulando, setPostulando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
  const [toastFeedback, setToastFeedback] = useState<{ tipo: 'exito' | 'info'; mensaje: string } | null>(null);

  // Carga inicial
  useEffect(() => {
    const list = SaraVacantesService.getVacantes();
    setVacantes(list);
    setLoading(false);
  }, []);

  // Filtrado reactivo
  const vacantesFiltradas = useMemo(() => {
    return vacantes.filter((v) => {
      // Búsqueda por texto
      if (busquedaTexto.trim()) {
        const query = busquedaTexto.toLowerCase();
        const coincide =
          v.titulo.toLowerCase().includes(query) ||
          v.descripcion.toLowerCase().includes(query) ||
          v.obraDestino.toLowerCase().includes(query) ||
          v.empresa.toLowerCase().includes(query) ||
          v.especialidad.toLowerCase().includes(query);
        if (!coincide) return false;
      }

      // Filtro Provincia
      if (filtroProvincia !== 'Todas' && v.provincia !== filtroProvincia) {
        return false;
      }

      // Filtro Especialidad
      if (filtroEspecialidad !== 'Todas' && v.especialidad !== filtroEspecialidad) {
        return false;
      }

      // Filtro Contrato
      if (filtroContrato !== 'Todos' && v.tipoContrato !== filtroContrato) {
        return false;
      }

      // Filtro Jornal Mínimo
      if (filtroJornalMin > 0 && v.jornalDiarioUSD < filtroJornalMin) {
        return false;
      }

      return true;
    });
  }, [vacantes, busquedaTexto, filtroProvincia, filtroEspecialidad, filtroContrato, filtroJornalMin]);

  // Manejador para abrir modal de postulación
  const handleAbrirPostulacion = (v: VacanteEmpleo) => {
    setVacanteSeleccionada(v);
    setTarifaPropuesta(v.jornalDiarioUSD);
    setTipoTarifa('jornal');
    setMensajePresentacion(
      `Estimada dirección de obra de ${v.empresa}: Me postulo a la vacante de ${v.titulo} para la obra ${v.obraDestino}. Cuento con experiencia comprobada en proyectos similares y total disponibilidad de inicio.`
    );
    setErrorFormulario(null);
    setModalPostulacionAbierto(true);
  };

  // Agregar archivo al formulario
  const handleAgregarArchivo = () => {
    if (!nuevoArchivoNombre.trim()) {
      setErrorFormulario('Por favor ingresa un nombre para el documento o selecciona uno válido.');
      return;
    }
    const cleanName = nuevoArchivoNombre.endsWith('.pdf') ? nuevoArchivoNombre : `${nuevoArchivoNombre}.pdf`;
    setArchivosCargados((prev) => [
      ...prev,
      { nombre: cleanName, tipo: nuevoArchivoTipo, verificado: true }
    ]);
    setNuevoArchivoNombre('');
    setErrorFormulario(null);
    setToastFeedback({ tipo: 'info', mensaje: `Documento "${cleanName}" adjuntado al expediente.` });
    setTimeout(() => setToastFeedback(null), 3500);
  };

  // Eliminar archivo
  const handleEliminarArchivo = (index: number) => {
    setArchivosCargados((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Enviar postulación
  const handleEnviarPostulacion = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorFormulario(null);

    if (!nombre.trim()) {
      setErrorFormulario('El nombre completo es requerido.');
      return;
    }
    if (!cedula.trim() || cedula.length < 10) {
      setErrorFormulario('Ingresa una cédula de identidad ecuatoriana válida (10 dígitos).');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorFormulario('Ingresa un correo electrónico de contacto válido.');
      return;
    }
    if (!telefono.trim()) {
      setErrorFormulario('El teléfono celular de contacto es obligatorio.');
      return;
    }
    if (tarifaPropuesta <= 0) {
      setErrorFormulario('La tarifa propuesta debe ser mayor a 0 USD.');
      return;
    }
    if (!aceptaTerminos) {
      setErrorFormulario('Debes certificar el cumplimiento de la normativa SST y veracidad de documentos.');
      return;
    }
    if (!vacanteSeleccionada) return;

    setPostulando(true);

    try {
      const postulacion = SaraVacantesService.postularCandidato({
        vacanteId: vacanteSeleccionada.id,
        vacanteTitulo: vacanteSeleccionada.titulo,
        obraDestino: vacanteSeleccionada.obraDestino,
        nombreCandidato: nombre,
        cedula,
        email,
        telefono,
        especialidad: vacanteSeleccionada.especialidad,
        categoriaCics: vacanteSeleccionada.categoriaCics,
        provincia: vacanteSeleccionada.provincia,
        canton: vacanteSeleccionada.canton,
        experienciaAnios,
        calificacionRating: 4.9,
        tarifaPropuestaUSD: tarifaPropuesta,
        tipoTarifa,
        mensajePresentacion,
        certificaciones: vacanteSeleccionada.certificacionesRequeridas,
        documentos: archivosCargados
      });

      setPostulando(false);
      setModalPostulacionAbierto(false);
      setPostulacionExitosa(postulacion);
      setToastFeedback({
        tipo: 'exito',
        mensaje: `¡Postulación registrada con éxito! Código: ${postulacion.id}`
      });
      setTimeout(() => setToastFeedback(null), 5000);
    } catch (err) {
      setPostulando(false);
      setErrorFormulario('Ocurrió un error al procesar tu postulación. Intenta nuevamente.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* NAVEGACIÓN COHESIVA DE SARA TALENTO */}
      <TalentoSubNav activeRoute="/modulos/talento/vacantes" />

      {/* FEEDBACK FLOTANTE ACCESIBLE (CERO WINDOW.ALERT) */}
      {toastFeedback && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md ${
              toastFeedback.tipo === 'exito'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : 'bg-indigo-950/90 border-indigo-500/50 text-indigo-200'
            }`}
          >
            {toastFeedback.tipo === 'exito' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
            )}
            <span className="text-sm font-semibold">{toastFeedback.mensaje}</span>
          </div>
        </div>
      )}

      {/* HERO BANNER DE LA BOLSA DE EMPLEO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-2 pb-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-900 border border-purple-500/20 p-6 md:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                <HardHat className="w-3.5 h-3.5 text-purple-400" />
                <span>Sector Construcción Civil del Ecuador 2026</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Bolsa de Empleo Civil & Cuadrillas Técnicas
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Postúlate a proyectos inmobiliarios y de infraestructura certificados por GRUPO SARA.
                Garantía de pagos en custodia <span className="text-purple-300 font-semibold">Escrow</span>,
                afiliación al <span className="text-purple-300 font-semibold">IESS</span> y fiscalización bajo norma NEC-15.
              </p>
            </div>

            <div className="flex flex-wrap md:flex-col items-start md:items-end gap-3 shrink-0">
              <Link href="/modulos/talento/reclutamiento">
                <button className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 border border-blue-400/30 transition-all cursor-pointer">
                  <Building2 size={16} />
                  <span>Soy Empresa: Publicar Vacante</span>
                </button>
              </Link>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>{vacantes.length} Vacantes Activas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-purple-400" />
                  <span>Cero Intermediarios Abusivos</span>
                </div>
              </div>
            </div>
          </div>

          {/* BARRA DE BÚSQUEDA INTEGRADA */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 pointer-events-none" />
              <input
                type="text"
                value={busquedaTexto}
                onChange={(e) => setBusquedaTexto(e.target.value)}
                placeholder="Buscar por cargo (Ingeniero, Maestro, Fierrero), nombre de obra, empresa o palabra clave..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700/80 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 text-sm text-white placeholder-slate-400 outline-none transition-all"
              />
              {busquedaTexto && (
                <button
                  onClick={() => setBusquedaTexto('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL: FILTROS LATERALES + LISTA DE VACANTES */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* PANEL DE FILTROS (COL 1) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5 sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Filter className="w-4 h-4 text-purple-400" />
                  <span>Filtros de Búsqueda</span>
                </div>
                {(filtroProvincia !== 'Todas' ||
                  filtroEspecialidad !== 'Todas' ||
                  filtroContrato !== 'Todos' ||
                  filtroJornalMin > 0 ||
                  busquedaTexto) && (
                  <button
                    onClick={() => {
                      setFiltroProvincia('Todas');
                      setFiltroEspecialidad('Todas');
                      setFiltroContrato('Todos');
                      setFiltroJornalMin(0);
                      setBusquedaTexto('');
                    }}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold cursor-pointer underline"
                  >
                    Restablecer
                  </button>
                )}
              </div>

              {/* Filtro Provincia */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Provincia</span>
                  <MapPin size={13} className="text-purple-400" />
                </label>
                <select
                  value={filtroProvincia}
                  onChange={(e) => setFiltroProvincia(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-purple-500 outline-none cursor-pointer"
                >
                  {PROVINCIAS_LISTA.map((p) => (
                    <option key={p} value={p}>
                      {p === 'Todas' ? 'Todas las Provincias' : p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro Especialidad / Oficio */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Oficio / Especialidad</span>
                  <HardHat size={13} className="text-amber-400" />
                </label>
                <select
                  value={filtroEspecialidad}
                  onChange={(e) => setFiltroEspecialidad(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-purple-500 outline-none cursor-pointer"
                >
                  {ESPECIALIDADES_LISTA.map((esp) => (
                    <option key={esp} value={esp}>
                      {esp === 'Todas' ? 'Todas las Especialidades' : esp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro Tipo de Contrato */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Tipo de Contrato</span>
                  <Briefcase size={13} className="text-blue-400" />
                </label>
                <div className="space-y-1.5">
                  {TIPOS_CONTRATO_LISTA.map((tc) => (
                    <button
                      key={tc}
                      onClick={() => setFiltroContrato(tc)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                        filtroContrato === tc
                          ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <span>{tc}</span>
                      {filtroContrato === tc && <Check size={12} className="text-purple-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro Jornal Mínimo */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Jornal Diario Mínimo</span>
                  <span className="font-mono text-purple-400">
                    {filtroJornalMin === 0 ? 'Sin límite' : `$${filtroJornalMin} USD`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="70"
                  step="5"
                  value={filtroJornalMin}
                  onChange={(e) => setFiltroJornalMin(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>$0 USD</span>
                  <span>$35 USD</span>
                  <span>$70+ USD</span>
                </div>
              </div>

              {/* Resumen de Certificaciones */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Certificaciones Clave
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] text-slate-300">
                    SECAP Laboral
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] text-slate-300">
                    SENESCYT
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] text-slate-300">
                    Alturas Dec. 255
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] text-slate-300">
                    IESS CD 513
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* LISTADO DE VACANTES (COL 2, 3, 4) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2">
              <span>
                Mostrando <strong className="text-white">{vacantesFiltradas.length}</strong> ofertas laborales disponibles
              </span>
              <span className="text-slate-500">Ordenadas por prioridad y fecha reciente</span>
            </div>

            {loading ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-slate-400">Cargando ofertas activas del sector de la construcción...</p>
              </div>
            ) : vacantesFiltradas.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                  <Search size={28} />
                </div>
                <h3 className="text-lg font-bold text-white">No se encontraron vacantes con los filtros seleccionados</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Intenta cambiar la provincia, el oficio o restablecer los filtros para ver todas las convocatorias vigentes en el país.
                </p>
                <button
                  onClick={() => {
                    setFiltroProvincia('Todas');
                    setFiltroEspecialidad('Todas');
                    setFiltroContrato('Todos');
                    setFiltroJornalMin(0);
                    setBusquedaTexto('');
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Ver Todas las Vacantes
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {vacantesFiltradas.map((vac) => {
                  const cuposRestantes = vac.vacantesDisponibles - vac.vacantesCubiertas;
                  const porcentajeCubierto = Math.round(
                    (vac.vacantesCubiertas / vac.vacantesDisponibles) * 100
                  );

                  return (
                    <div
                      key={vac.id}
                      className="group relative rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/40 p-5 md:p-6 transition-all duration-200 shadow-lg hover:shadow-purple-500/5 space-y-4"
                    >
                      {/* Fila Superior: Título, Badges y Empresa */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs text-purple-400 font-semibold">{vac.id}</span>
                            {vac.urgencia === 'Urgente 48h' && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <Clock size={10} />
                                Urgente 48h
                              </span>
                            )}
                            {vac.urgencia === 'Prioritaria' && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                                Prioritaria
                              </span>
                            )}
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-medium">
                              {vac.tipoContrato}
                            </span>
                          </div>

                          <h2 className="text-lg md:text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                            {vac.titulo}
                          </h2>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-0.5">
                            <span className="flex items-center gap-1 text-slate-300 font-medium">
                              <Building2 size={13} className="text-purple-400" />
                              {vac.empresa}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={13} className="text-rose-400" />
                              {vac.obraDestino} ({vac.provincia})
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={13} className="text-slate-500" />
                              Cierre: {vac.fechaCierre}
                            </span>
                          </div>
                        </div>

                        {/* Columna Salario / Jornal */}
                        <div className="sm:text-right shrink-0 bg-slate-950/60 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-slate-800">
                          <div className="text-xs text-slate-400 font-medium">Jornal Estimado</div>
                          <div className="text-xl font-extrabold text-emerald-400 font-mono">
                            ${vac.jornalDiarioUSD}{' '}
                            <span className="text-xs text-slate-400 font-normal">USD / día</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            ~${vac.salarioMensualUSD} USD/mes | ${vac.tarifaHoraUSD}/h
                          </div>
                        </div>
                      </div>

                      {/* Descripción breve */}
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                        {vac.descripcion}
                      </p>

                      {/* Chips de Certificaciones */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
                          <Award size={12} className="text-purple-400" />
                          Requisitos:
                        </span>
                        {vac.certificacionesRequeridas.map((cert) => (
                          <span
                            key={cert}
                            className="px-2 py-0.5 rounded-md bg-purple-950/40 border border-purple-500/20 text-purple-300 text-[10px] font-medium"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>

                      {/* Footer de Tarjeta: Barra de Cupos y Botones */}
                      <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="space-y-1 min-w-[130px]">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-slate-400">Cupos:</span>
                              <span className="text-white font-semibold">
                                {cuposRestantes} de {vac.vacantesDisponibles} libres
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${porcentajeCubierto}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            Min. {vac.experienciaMinimaAnios} años exp.
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setVacanteSeleccionada(vac)}
                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                          >
                            Ver Detalles
                          </button>
                          <button
                            onClick={() => handleAbrirPostulacion(vac)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <span>Postularme Ahora</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL 1: DETALLE DE LA VACANTE */}
      {/* ==================================================================== */}
      {vacanteSeleccionada && !modalPostulacionAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Botón Cerrar */}
            <button
              onClick={() => setVacanteSeleccionada(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Header del Modal */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-purple-400 font-bold">
                  {vacanteSeleccionada.id}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-medium">
                  {vacanteSeleccionada.tipoContrato}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
                  {vacanteSeleccionada.modalidad}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white">
                {vacanteSeleccionada.titulo}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1 font-semibold text-purple-300">
                  <Building2 size={14} />
                  {vacanteSeleccionada.empresa} (RUC: {vacanteSeleccionada.rucEmpresa})
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <MapPin size={14} className="text-rose-400" />
                  {vacanteSeleccionada.obraDestino} — {vacanteSeleccionada.canton},{' '}
                  {vacanteSeleccionada.provincia}
                </span>
              </div>
            </div>

            {/* Cuadro Salarial y Cupos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Jornal Diario</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">
                  ${vacanteSeleccionada.jornalDiarioUSD} USD
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Salario Mensual</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">
                  ${vacanteSeleccionada.salarioMensualUSD} USD
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Experiencia Mín.</span>
                <span className="text-base font-extrabold text-white font-mono">
                  {vacanteSeleccionada.experienciaMinimaAnios} años
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Cupos Libres</span>
                <span className="text-base font-extrabold text-purple-400 font-mono">
                  {vacanteSeleccionada.vacantesDisponibles - vacanteSeleccionada.vacantesCubiertas} vacantes
                </span>
              </div>
            </div>

            {/* Descripción Completa */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-purple-400" />
                Descripción del Puesto
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {vacanteSeleccionada.descripcion}
              </p>
            </div>

            {/* Responsabilidades */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                Responsabilidades Principales
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {vacanteSeleccionada.responsabilidades.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Certificaciones y Requisitos */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Award size={14} className="text-amber-400" />
                Certificaciones Exigidas
              </h3>
              <div className="flex flex-wrap gap-2">
                {vacanteSeleccionada.certificacionesRequeridas.map((c) => (
                  <span
                    key={c}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-medium"
                  >
                    ✓ {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Beneficios de Ley y Campamento */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-indigo-400" />
                Beneficios de Ley y Dotación en Obra
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {vacanteSeleccionada.beneficios.map((ben, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                    <span>{ben}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Botones de Acción */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setVacanteSeleccionada(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cerrar Detalle
              </button>
              <button
                onClick={() => {
                  handleAbrirPostulacion(vacanteSeleccionada);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                <HardHat size={15} />
                <span>Postularme a esta Vacante</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: FORMULARIO DE POSTULACIÓN INTERACTIVO */}
      {/* ==================================================================== */}
      {modalPostulacionAbierto && vacanteSeleccionada && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header del Formulario */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400 flex items-center gap-1.5">
                  <Sparkles size={12} />
                  Postulación Oficial GRUPO SARA
                </span>
                <h2 className="text-lg md:text-xl font-bold text-white">
                  Postularme a: {vacanteSeleccionada.titulo}
                </h2>
                <p className="text-xs text-slate-400">
                  Obra: <strong className="text-slate-300">{vacanteSeleccionada.obraDestino}</strong> |{' '}
                  {vacanteSeleccionada.empresa}
                </p>
              </div>
              <button
                onClick={() => setModalPostulacionAbierto(false)}
                className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {errorFormulario && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0 text-rose-400" />
                <span>{errorFormulario}</span>
              </div>
            )}

            <form onSubmit={handleEnviarPostulacion} className="space-y-5">
              {/* Bloque 1: Datos Personales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Nombre y Apellido Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="ej: Ing. Carlos Morales"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-purple-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Cédula de Identidad Ecuatoriana *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
                    placeholder="ej: 1718293041"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-purple-500 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos.morales@profesional.sara.ec"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-purple-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Teléfono Celular / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+593 99 123 4567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-purple-500 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Bloque 2: Propuesta Económica & Experiencia */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
                  Propuesta Económica & Experiencia
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Tarifa Propuesta (USD) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        min="1"
                        step="0.5"
                        required
                        value={tarifaPropuesta}
                        onChange={(e) => setTarifaPropuesta(Number(e.target.value))}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-emerald-400 font-mono font-bold focus:border-purple-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Unidad de Cobro</label>
                    <select
                      value={tipoTarifa}
                      onChange={(e) => setTipoTarifa(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-purple-500 outline-none cursor-pointer"
                    >
                      <option value="jornal">Por Jornal Diario (8h)</option>
                      <option value="hora">Por Hora Trabajada</option>
                      <option value="mensual">Mensual Consolidado</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Años de Experiencia</label>
                    <input
                      type="number"
                      min="0"
                      max="40"
                      value={experienciaAnios}
                      onChange={(e) => setExperienciaAnios(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 bg-purple-950/30 p-2.5 rounded-xl border border-purple-500/20 flex items-center justify-between">
                  <span>Referencia de la vacante:</span>
                  <span className="font-mono text-purple-300 font-semibold">
                    ${vacanteSeleccionada.jornalDiarioUSD} USD/día (~${vacanteSeleccionada.tarifaHoraUSD}/h)
                  </span>
                </div>
              </div>

              {/* Bloque 3: Mensaje de Presentación */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Mensaje de Presentación / Carta de Motivación</span>
                  <span className="text-[10px] text-slate-500">Opcional pero recomendado</span>
                </label>
                <textarea
                  rows={3}
                  value={mensajePresentacion}
                  onChange={(e) => setMensajePresentacion(e.target.value)}
                  placeholder="Explica brevemente tu experiencia en obras similares, proyectos ejecutados y disponibilidad horaria..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:border-purple-500 outline-none leading-relaxed"
                />
              </div>

              {/* Bloque 4: Expediente Digital de Documentos */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <UploadCloud size={14} className="text-purple-400" />
                    Bóveda de Documentos Adjuntos ({archivosCargados.length})
                  </span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <ShieldCheck size={12} />
                    Validación Automática SARA
                  </span>
                </div>

                {/* Lista de archivos adjuntos */}
                <div className="space-y-1.5">
                  {archivosCargados.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText size={14} className="text-purple-400 shrink-0" />
                        <span className="text-slate-200 truncate">{doc.nombre}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-950 text-purple-300 border border-purple-500/30">
                          {doc.tipo}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleEliminarArchivo(idx)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Eliminar archivo"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Subir nuevo archivo interactivo */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={nuevoArchivoNombre}
                    onChange={(e) => setNuevoArchivoNombre(e.target.value)}
                    placeholder="Nombre del documento (ej. Certificado_SECAP.pdf)"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-purple-500 outline-none"
                  />
                  <select
                    value={nuevoArchivoTipo}
                    onChange={(e) => setNuevoArchivoTipo(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:border-purple-500 outline-none"
                  >
                    <option value="SECAP">Certificado SECAP</option>
                    <option value="SENESCYT">Título SENESCYT</option>
                    <option value="ALTURAS">Trabajo en Alturas</option>
                    <option value="CV">Hoja de Vida (CV)</option>
                    <option value="CEDULA">Cédula</option>
                    <option value="IESS">Historial IESS</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAgregarArchivo}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-colors cursor-pointer shrink-0"
                  >
                    + Adjuntar
                  </button>
                </div>
              </div>

              {/* Checklist Legal y SST */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="terminosSst"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-purple-600 focus:ring-purple-500 accent-purple-500 cursor-pointer"
                />
                <label htmlFor="terminosSst" className="text-[11px] text-slate-400 cursor-pointer">
                  Certifico bajo juramento que los datos y documentos proporcionados son fidedignos y
                  autorizo a GRUPO SARA a validar antecedentes laborales y cumplimiento SST bajo el
                  Decreto Ejecutivo 255 y la Resolución CD 513 del IESS.
                </label>
              </div>

              {/* Botones de Envío */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalPostulacionAbierto(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={postulando}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  {postulando ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Enviando Postulación...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      <span>Confirmar y Postularme</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: CONFIRMACIÓN VISUAL INMEDIATA DE POSTULACIÓN EXITOSA */}
      {/* ==================================================================== */}
      {postulacionExitosa && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl text-center relative animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                Postulación Recibida Satisfactoriamente
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold text-white">
                ¡Bienvenido al Proceso de Selección!
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tu postulación para la vacante <strong className="text-white">{postulacionExitosa.vacanteTitulo}</strong> ha
                sido registrada en el Tablero de Reclutamiento de la empresa.
              </p>
            </div>

            {/* Ficha Resumen */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Código de Seguimiento:</span>
                <span className="font-mono text-purple-400 font-bold">{postulacionExitosa.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Candidato:</span>
                <span className="text-white font-medium">{postulacionExitosa.nombreCandidato}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tarifa Propuesta:</span>
                <span className="text-emerald-400 font-mono font-bold">
                  ${postulacionExitosa.tarifaPropuestaUSD} USD / {postulacionExitosa.tipoTarifa}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Obra Destino:</span>
                <span className="text-slate-200">{postulacionExitosa.obraDestino}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Etapa Inicial:</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase">
                  1. Recibidas
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/modulos/talento/mi-perfil" className="w-full sm:w-auto">
                <button
                  onClick={() => setPostulacionExitosa(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  Ver en Mi Portal
                </button>
              </Link>
              <Link href="/modulos/talento/reclutamiento" className="w-full sm:w-auto">
                <button
                  onClick={() => setPostulacionExitosa(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Users size={14} />
                  <span>Ver Tablero Kanban de Empresas</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
