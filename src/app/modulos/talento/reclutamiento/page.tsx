'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Briefcase,
  Building2,
  HardHat,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  DollarSign,
  ShieldCheck,
  FileText,
  MessageSquare,
  X,
  AlertTriangle,
  Award,
  ChevronRight,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Send,
  Eye,
  Check,
  Calendar,
  Lock,
  Layers,
  LayoutGrid,
  List
} from 'lucide-react';
import TalentoSubNav from '@/components/sara/TalentoSubNav';
import { LISTA_PROVINCIAS_ECUADOR, getCantonesPorProvincia } from '@/lib/constants/ecuadorGeo';
import {
  SaraVacantesService,
  VacanteEmpleo,
  CandidatoPostulacion,
  EtapaReclutamiento,
  CategoriaCICS,
  TipoContratoLaboral,
  HitoEscrowContrato
} from '@/lib/services/saraVacantesService';

const ETAPAS_CONFIG: {
  id: EtapaReclutamiento;
  titulo: string;
  subtitulo: string;
  colorBorde: string;
  colorBadge: string;
  colorTexto: string;
}[] = [
  {
    id: 'recibidas',
    titulo: '1. Recibidas',
    subtitulo: 'Nuevas postulaciones en bandeja',
    colorBorde: 'border-slate-700',
    colorBadge: 'bg-slate-800 text-slate-300 border-slate-700',
    colorTexto: 'text-slate-300'
  },
  {
    id: 'en_revision',
    titulo: '2. En Revisión',
    subtitulo: 'Validación de CV y antecedentes',
    colorBorde: 'border-amber-500/40',
    colorBadge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    colorTexto: 'text-amber-300'
  },
  {
    id: 'preseleccionadas',
    titulo: '3. Preseleccionadas',
    subtitulo: 'Cumplen perfil técnico y SST',
    colorBorde: 'border-indigo-500/40',
    colorBadge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    colorTexto: 'text-indigo-300'
  },
  {
    id: 'entrevista',
    titulo: '4. Entrevista',
    subtitulo: 'Coordinación con Residencia',
    colorBorde: 'border-purple-500/40',
    colorBadge: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    colorTexto: 'text-purple-300'
  },
  {
    id: 'evaluacion_tecnica',
    titulo: '5. Eval. Técnica',
    subtitulo: 'Prueba práctica / cubicación',
    colorBorde: 'border-cyan-500/40',
    colorBadge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    colorTexto: 'text-cyan-300'
  },
  {
    id: 'contratacion_escrow',
    titulo: '6. Oferta & Escrow',
    subtitulo: 'Contrato blindado y asignado',
    colorBorde: 'border-emerald-500/40',
    colorBadge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    colorTexto: 'text-emerald-300'
  }
];

export default function PanelReclutamientoPage() {
  const [candidatos, setCandidatos] = useState<CandidatoPostulacion[]>([]);
  const [vacantes, setVacantes] = useState<VacanteEmpleo[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [busquedaTexto, setBusquedaTexto] = useState('');
  const [filtroVacante, setFiltroVacante] = useState<string>('Todas');
  const [vistaModo, setVistaModo] = useState<'kanban' | 'tabla'>('kanban');

  // Modales
  const [candidatoDetalle, setCandidatoDetalle] = useState<CandidatoPostulacion | null>(null);
  const [modalNuevaVacanteAbierto, setModalNuevaVacanteAbierto] = useState(false);
  const [modalFormalizarContrato, setModalFormalizarContrato] = useState<CandidatoPostulacion | null>(null);

  // Formulario Nueva Vacante
  const [nuevaVacTitulo, setNuevaVacTitulo] = useState('');
  const [nuevaVacEspecialidad, setNuevaVacEspecialidad] = useState('Ingeniería Civil');
  const [nuevaVacCics, setNuevaVacCics] = useState<CategoriaCICS>('A1_DIRECCION');
  const [nuevaVacEmpresa, setNuevaVacEmpresa] = useState('GRUPO SARA Constructora S.A.');
  const [nuevaVacRuc, setNuevaVacRuc] = useState('1191782341001');
  const [nuevaVacObra, setNuevaVacObra] = useState('Torre Bellavista Norte');
  const [nuevaVacProvincia, setNuevaVacProvincia] = useState('Pichincha');
  const [nuevaVacCanton, setNuevaVacCanton] = useState('Quito (La Carolina)');
  const [nuevaVacContrato, setNuevaVacContrato] = useState<TipoContratoLaboral>('Obra cierta');
  const [nuevaVacJornal, setNuevaVacJornal] = useState<number>(45);
  const [nuevaVacCupos, setNuevaVacCupos] = useState<number>(2);
  const [nuevaVacExp, setNuevaVacExp] = useState<number>(4);
  const [nuevaVacDescripcion, setNuevaVacDescripcion] = useState('');
  const [nuevaVacUrgencia, setNuevaVacUrgencia] = useState<'Normal' | 'Prioritaria' | 'Urgente 48h'>('Prioritaria');

  // Formulario Formalizar Contrato Escrow
  const [escrowObraDestino, setEscrowObraDestino] = useState('');
  const [escrowFechaInicio, setEscrowFechaInicio] = useState('2026-11-01');
  const [escrowDuracionMeses, setEscrowDuracionMeses] = useState<number>(3);
  const [escrowMontoTotal, setEscrowMontoTotal] = useState<number>(5400);
  const [escrowAnticipo, setEscrowAnticipo] = useState<number>(20);

  // Formulario Notas Privadas
  const [nuevaNotaTexto, setNuevaNotaTexto] = useState('');
  const [nuevaNotaAutor, setNuevaNotaAutor] = useState('Ing. Residente');

  // Feedback accesible
  const [toastFeedback, setToastFeedback] = useState<{ tipo: 'exito' | 'info'; mensaje: string } | null>(null);

  const cargarDatos = () => {
    const cList = SaraVacantesService.getCandidatos();
    const vList = SaraVacantesService.getVacantes();
    setCandidatos(cList);
    setVacantes(vList);
    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Candidatos filtrados
  const candidatosFiltrados = useMemo(() => {
    return candidatos.filter((c) => {
      if (busquedaTexto.trim()) {
        const query = busquedaTexto.toLowerCase();
        const coincide =
          c.nombreCandidato.toLowerCase().includes(query) ||
          c.cedula.includes(query) ||
          c.especialidad.toLowerCase().includes(query) ||
          c.obraDestino.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query);
        if (!coincide) return false;
      }

      if (filtroVacante !== 'Todas' && c.vacanteId !== filtroVacante) {
        return false;
      }

      return true;
    });
  }, [candidatos, busquedaTexto, filtroVacante]);

  // Movimiento de etapas
  const handleAvanzarEtapa = (candidatoId: string, etapaActual: EtapaReclutamiento) => {
    const etapasOrder: EtapaReclutamiento[] = [
      'recibidas',
      'en_revision',
      'preseleccionadas',
      'entrevista',
      'evaluacion_tecnica',
      'contratacion_escrow'
    ];
    const currentIndex = etapasOrder.indexOf(etapaActual);
    if (currentIndex < etapasOrder.length - 1) {
      const nextEtapa = etapasOrder[currentIndex + 1];
      const updated = SaraVacantesService.moverEtapaCandidato(candidatoId, nextEtapa);
      if (updated) {
        cargarDatos();
        if (candidatoDetalle?.id === candidatoId) {
          setCandidatoDetalle(updated);
        }
        setToastFeedback({
          tipo: 'info',
          mensaje: `Candidato promovido a: ${nextEtapa.toUpperCase().replace('_', ' ')}`
        });
        setTimeout(() => setToastFeedback(null), 3500);
      }
    }
  };

  const handleRetrocederEtapa = (candidatoId: string, etapaActual: EtapaReclutamiento) => {
    const etapasOrder: EtapaReclutamiento[] = [
      'recibidas',
      'en_revision',
      'preseleccionadas',
      'entrevista',
      'evaluacion_tecnica',
      'contratacion_escrow'
    ];
    const currentIndex = etapasOrder.indexOf(etapaActual);
    if (currentIndex > 0) {
      const prevEtapa = etapasOrder[currentIndex - 1];
      const updated = SaraVacantesService.moverEtapaCandidato(candidatoId, prevEtapa);
      if (updated) {
        cargarDatos();
        if (candidatoDetalle?.id === candidatoId) {
          setCandidatoDetalle(updated);
        }
        setToastFeedback({
          tipo: 'info',
          mensaje: `Candidato retornado a: ${prevEtapa.toUpperCase().replace('_', ' ')}`
        });
        setTimeout(() => setToastFeedback(null), 3500);
      }
    }
  };

  // Agregar Nota Privada
  const handleAgregarNota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidatoDetalle || !nuevaNotaTexto.trim()) return;

    const updated = SaraVacantesService.agregarNota(
      candidatoDetalle.id,
      nuevaNotaTexto.trim(),
      nuevaNotaAutor,
      'Fiscalizador de Obra / RRHH'
    );
    if (updated) {
      setCandidatoDetalle(updated);
      cargarDatos();
      setNuevaNotaTexto('');
      setToastFeedback({
        tipo: 'exito',
        mensaje: 'Nota de evaluación técnica registrada en el expediente.'
      });
      setTimeout(() => setToastFeedback(null), 3500);
    }
  };

  // Crear y publicar nueva vacante
  const handleCrearVacante = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaVacTitulo.trim() || !nuevaVacObra.trim()) return;

    const vCreada = SaraVacantesService.crearVacante({
      titulo: nuevaVacTitulo,
      especialidad: nuevaVacEspecialidad,
      categoriaCics: nuevaVacCics,
      empresa: nuevaVacEmpresa,
      rucEmpresa: nuevaVacRuc,
      obraDestino: nuevaVacObra,
      provincia: nuevaVacProvincia,
      canton: nuevaVacCanton,
      tipoContrato: nuevaVacContrato,
      modalidad: 'Presencial en Obra',
      jornalDiarioUSD: nuevaVacJornal,
      salarioMensualUSD: Math.round(nuevaVacJornal * 24),
      tarifaHoraUSD: Math.round((nuevaVacJornal / 8) * 100) / 100,
      vacantesDisponibles: nuevaVacCupos,
      experienciaMinimaAnios: nuevaVacExp,
      certificacionesRequeridas: [
        'SECAP Certificación de Competencia',
        'Cumplimiento SST Decreto 255'
      ],
      descripcion:
        nuevaVacDescripcion ||
        `Requerimiento de personal especializado para ejecución de frentes críticos en ${nuevaVacObra}.`,
      responsabilidades: [
        'Cumplimiento estricto del cronograma de obra y especificaciones técnicas.',
        'Uso permanente de EPP y reporte de incidentes en el Libro de Obra.'
      ],
      beneficios: [
        'Afiliación IESS con sectorial de construcción CICS.',
        'Dotación de EPP certificado y seguro contra accidentes.'
      ],
      fechaCierre: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      urgencia: nuevaVacUrgencia
    });

    cargarDatos();
    setModalNuevaVacanteAbierto(false);
    setToastFeedback({
      tipo: 'exito',
      mensaje: `¡Vacante ${vCreada.id} publicada exitosamente en la Bolsa de Empleo!`
    });
    setTimeout(() => setToastFeedback(null), 4500);
  };

  // Formalizar Contrato y Asignar a Obra
  const handleAbrirFormalizarContrato = (cand: CandidatoPostulacion) => {
    setModalFormalizarContrato(cand);
    setEscrowObraDestino(cand.obraDestino);
    // Estimación base: 3 meses * 24 días * jornal
    const baseMonto =
      cand.tipoTarifa === 'jornal'
        ? cand.tarifaPropuestaUSD * 24 * 3
        : cand.tipoTarifa === 'hora'
        ? cand.tarifaPropuestaUSD * 160 * 3
        : cand.tarifaPropuestaUSD * 3;
    setEscrowMontoTotal(Math.round(baseMonto));
  };

  const handleConfirmarContratoEscrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalFormalizarContrato) return;

    const hitos: HitoEscrowContrato[] = [
      {
        id: `h-1-${Date.now()}`,
        descripcion: 'Anticipo inicial y suscripción del Libro de Obra',
        porcentaje: escrowAnticipo,
        montoUSD: Math.round((escrowMontoTotal * escrowAnticipo) / 100),
        estado: 'en_custodia'
      },
      {
        id: `h-2-${Date.now()}`,
        descripcion: 'Avance al 50% certificado por Fiscalización',
        porcentaje: 40,
        montoUSD: Math.round(escrowMontoTotal * 0.4),
        estado: 'pendiente'
      },
      {
        id: `h-3-${Date.now()}`,
        descripcion: 'Finiquito, recepción definitiva y planilla final',
        porcentaje: 100 - escrowAnticipo - 40,
        montoUSD: Math.round(escrowMontoTotal * ((100 - escrowAnticipo - 40) / 100)),
        estado: 'pendiente'
      }
    ];

    const updated = SaraVacantesService.formalizarContratoEscrow(modalFormalizarContrato.id, {
      obraDestino: escrowObraDestino,
      fechaInicio: escrowFechaInicio,
      duracionMeses: escrowDuracionMeses,
      montoTotalEscrowUSD: escrowMontoTotal,
      anticipoPorcentaje: escrowAnticipo,
      hitos
    });

    if (updated) {
      cargarDatos();
      if (candidatoDetalle?.id === updated.id) {
        setCandidatoDetalle(updated);
      }
      setModalFormalizarContrato(null);
      setToastFeedback({
        tipo: 'exito',
        mensaje: `¡Contrato formalizado! $${escrowMontoTotal.toLocaleString()} USD depositados en custodia Escrow.`
      });
      setTimeout(() => setToastFeedback(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* NAVEGACIÓN COHESIVA DE SARA TALENTO */}
      <TalentoSubNav activeRoute="/modulos/talento/reclutamiento" />

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

      {/* TOP HEADER DEL TABLERO DE RECLUTAMIENTO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-2 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
              <Building2 size={14} />
              <span>Panel Corporativo de Constructores & Contratistas</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Tablero de Reclutamiento & Selección</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                {candidatos.length} Candidatos en Embudo
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Gestión visual de postulantes por etapas, registro de notas técnicas y formalización de contratos con blindaje Escrow.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Selector de Vista Kanban / Tabla */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setVistaModo('kanban')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  vistaModo === 'kanban'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid size={14} />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setVistaModo('tabla')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  vistaModo === 'tabla'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List size={14} />
                <span>Lista</span>
              </button>
            </div>

            <button
              onClick={() => setModalNuevaVacanteAbierto(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 border border-blue-400/30 transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Crear y Publicar Nueva Vacante</span>
            </button>
          </div>
        </div>

        {/* BARRA DE FILTROS RÁPIDOS */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={busquedaTexto}
              onChange={(e) => setBusquedaTexto(e.target.value)}
              placeholder="Buscar por candidato, cédula, oficio, obra destino o código..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 text-xs text-white placeholder-slate-400 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filtroVacante}
              onChange={(e) => setFiltroVacante(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:border-blue-500 outline-none cursor-pointer w-full sm:w-64 truncate"
            >
              <option value="Todas">Todas las Convocatorias / Obras</option>
              {vacantes.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.titulo} ({v.obraDestino})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL: KANBAN O TABLA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16 flex-1">
        {vistaModo === 'kanban' ? (
          /* TABLERO KANBAN HORIZONTAL */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 overflow-x-auto pb-6">
            {ETAPAS_CONFIG.map((etapa) => {
              const itemsEnEtapa = candidatosFiltrados.filter((c) => c.etapa === etapa.id);

              return (
                <div
                  key={etapa.id}
                  className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-3 flex flex-col min-w-[240px] space-y-3"
                >
                  {/* Header de la columna */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="space-y-0.5">
                      <span className={`text-xs font-bold ${etapa.colorTexto}`}>
                        {etapa.titulo}
                      </span>
                      <p className="text-[10px] text-slate-500 truncate max-w-[170px]">
                        {etapa.subtitulo}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold border ${etapa.colorBadge}`}
                    >
                      {itemsEnEtapa.length}
                    </span>
                  </div>

                  {/* Lista de Tarjetas de Candidato */}
                  <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[650px] pr-1">
                    {itemsEnEtapa.length === 0 ? (
                      <div className="py-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-[11px]">
                        Sin candidatos en esta etapa
                      </div>
                    ) : (
                      itemsEnEtapa.map((cand) => (
                        <div
                          key={cand.id}
                          className={`group rounded-xl bg-slate-900 border ${etapa.colorBorde} p-3 space-y-2.5 shadow-md hover:shadow-lg transition-all relative`}
                        >
                          {/* Código y Rating */}
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-mono text-slate-400 font-semibold">{cand.id}</span>
                            <div className="flex items-center gap-1 text-amber-400 font-bold">
                              <span>★ {cand.calificacionRating.toFixed(1)}</span>
                            </div>
                          </div>

                          {/* Nombre y Cargo */}
                          <div>
                            <h3 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                              {cand.nombreCandidato}
                            </h3>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <HardHat size={11} className="text-purple-400 shrink-0" />
                              <span className="truncate">{cand.especialidad}</span>
                            </div>
                          </div>

                          {/* Obra Destino y Tarifa */}
                          <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1 text-[11px]">
                            <div className="flex items-center justify-between text-slate-400">
                              <span>Tarifa:</span>
                              <span className="text-emerald-400 font-mono font-bold">
                                ${cand.tarifaPropuestaUSD}/{cand.tipoTarifa}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-400 truncate">
                              <MapPin size={11} className="text-rose-400 shrink-0" />
                              <span className="truncate">{cand.obraDestino}</span>
                            </div>
                          </div>

                          {/* Badges de notas y documentos */}
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <FileText size={11} />
                              {cand.documentos.length} docs
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare size={11} />
                              {cand.notasEmpresa.length} notas
                            </span>
                            {cand.contratoFormalizado && (
                              <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                                <ShieldCheck size={11} /> Escrow
                              </span>
                            )}
                          </div>

                          {/* Botones de Acción Rápida */}
                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1">
                            <button
                              onClick={() => handleRetrocederEtapa(cand.id, cand.etapa)}
                              disabled={cand.etapa === 'recibidas'}
                              title="Retroceder a etapa previa"
                              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <ArrowLeft size={12} />
                            </button>

                            <button
                              onClick={() => setCandidatoDetalle(cand)}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Eye size={11} />
                              <span>Expediente</span>
                            </button>

                            {cand.etapa === 'contratacion_escrow' ? (
                              <button
                                onClick={() => handleAbrirFormalizarContrato(cand)}
                                className="p-1 px-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow"
                                title="Formalizar Contrato Escrow"
                              >
                                <Lock size={11} />
                                <span>Escrow</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAvanzarEtapa(cand.id, cand.etapa)}
                                title="Avanzar a siguiente etapa"
                                className="p-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow"
                              >
                                <ArrowRight size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* VISTA EN TABLA RESUMEN */
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Código</th>
                    <th className="py-3.5 px-4 font-semibold">Candidato</th>
                    <th className="py-3.5 px-4 font-semibold">Especialidad</th>
                    <th className="py-3.5 px-4 font-semibold">Obra Destino</th>
                    <th className="py-3.5 px-4 font-semibold">Tarifa Solicitada</th>
                    <th className="py-3.5 px-4 font-semibold">Etapa Actual</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {candidatosFiltrados.map((c) => {
                    const etapaCfg = ETAPAS_CONFIG.find((e) => e.id === c.etapa);
                    return (
                      <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-purple-400">{c.id}</td>
                        <td className="py-3 px-4 font-bold text-white">
                          <div>{c.nombreCandidato}</div>
                          <span className="text-[10px] text-slate-400 font-mono">C.I. {c.cedula}</span>
                        </td>
                        <td className="py-3 px-4">{c.especialidad}</td>
                        <td className="py-3 px-4">{c.obraDestino}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          ${c.tarifaPropuestaUSD}/{c.tipoTarifa}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${etapaCfg?.colorBadge}`}
                          >
                            {etapaCfg?.titulo}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => setCandidatoDetalle(c)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold cursor-pointer"
                          >
                            Ver Ficha
                          </button>
                          <button
                            onClick={() => handleAbrirFormalizarContrato(c)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer"
                          >
                            Contratar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* MODAL 1: EXPEDIENTE COMPLETO DEL CANDIDATO Y NOTAS PRIVADAS */}
      {/* ==================================================================== */}
      {candidatoDetalle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header del Expediente */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-purple-400 font-bold">
                    {candidatoDetalle.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold">
                    Etapa: {candidatoDetalle.etapa.toUpperCase().replace('_', ' ')}
                  </span>
                  {candidatoDetalle.contratoFormalizado && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
                      <ShieldCheck size={12} /> Contratado Escrow
                    </span>
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  {candidatoDetalle.nombreCandidato}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="text-slate-300">{candidatoDetalle.especialidad}</span>
                  <span>•</span>
                  <span>C.I. {candidatoDetalle.cedula}</span>
                  <span>•</span>
                  <span>{candidatoDetalle.canton}, {candidatoDetalle.provincia}</span>
                </div>
              </div>

              <button
                onClick={() => setCandidatoDetalle(null)}
                className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Selector Rápido de Etapa */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Mover a otra etapa del embudo de selección:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
                {ETAPAS_CONFIG.map((et) => (
                  <button
                    key={et.id}
                    onClick={() => {
                      const updated = SaraVacantesService.moverEtapaCandidato(
                        candidatoDetalle.id,
                        et.id
                      );
                      if (updated) {
                        setCandidatoDetalle(updated);
                        cargarDatos();
                      }
                    }}
                    className={`px-2 py-1.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer truncate ${
                      candidatoDetalle.etapa === et.id
                        ? 'bg-blue-600 text-white font-bold shadow'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {et.titulo}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid 2 Columnas: Datos y Documentos vs Notas de Evaluación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna Izquierda: Información y Documentos */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs">
                  <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <DollarSign size={13} className="text-emerald-400" />
                    Propuesta Económica & Contacto
                  </h3>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tarifa Solicitada:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      ${candidatoDetalle.tarifaPropuestaUSD} USD / {candidatoDetalle.tipoTarifa}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Experiencia:</span>
                    <span className="text-white font-mono">{candidatoDetalle.experienciaAnios} años</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Calificación SARA:</span>
                    <span className="text-amber-400 font-bold">★ {candidatoDetalle.calificacionRating.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Celular:</span>
                    <span className="font-mono text-slate-200">{candidatoDetalle.telefono}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-200 truncate max-w-[180px]">{candidatoDetalle.email}</span>
                  </div>
                </div>

                {/* Mensaje de Presentación */}
                {candidatoDetalle.mensajePresentacion && (
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                      Carta de Presentación del Candidato
                    </span>
                    <p className="text-slate-300 italic leading-relaxed">
                      &quot;{candidatoDetalle.mensajePresentacion}&quot;
                    </p>
                  </div>
                )}

                {/* Documentos del Expediente */}
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <FileText size={13} className="text-purple-400" />
                    Documentos Verificados ({candidatoDetalle.documentos.length})
                  </h3>
                  <div className="space-y-1.5">
                    {candidatoDetalle.documentos.map((d, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-purple-400 shrink-0" />
                          <span className="text-slate-200 truncate max-w-[190px]">{d.nombre}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                          {d.tipo} ✓
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Notas Privadas de Evaluación */}
              <div className="space-y-4 flex flex-col">
                <div className="flex-1 space-y-2 flex flex-col">
                  <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare size={13} className="text-blue-400" />
                      Bitácora de Notas Privadas ({candidatoDetalle.notasEmpresa.length})
                    </span>
                    <span className="text-[10px] text-slate-500">Solo visible para tu empresa</span>
                  </h3>

                  {/* Lista de Notas */}
                  <div className="flex-1 space-y-2 overflow-y-auto max-h-[280px] p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                    {candidatoDetalle.notasEmpresa.length === 0 ? (
                      <div className="text-center py-6 text-slate-500 text-xs">
                        No hay notas internas registradas aún.
                      </div>
                    ) : (
                      candidatoDetalle.notasEmpresa.map((n) => (
                        <div
                          key={n.id}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-800/90 space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="font-bold text-blue-300">{n.autor}</span>
                            <span className="font-mono text-slate-500">{n.fecha}</span>
                          </div>
                          <p className="text-slate-200 leading-relaxed">{n.texto}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Formulario para agregar nueva nota */}
                <form onSubmit={handleAgregarNota} className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Tu nombre / cargo (ej: Residente de Obra)"
                      value={nuevaNotaAutor}
                      onChange={(e) => setNuevaNotaAutor(e.target.value)}
                      className="w-1/2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      required
                      placeholder="Escribe una observación técnica, resultado de entrevista..."
                      value={nuevaNotaTexto}
                      onChange={(e) => setNuevaNotaTexto(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none resize-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setCandidatoDetalle(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cerrar Expediente
              </button>

              <button
                onClick={() => {
                  const targetCand = candidatoDetalle;
                  setCandidatoDetalle(null);
                  handleAbrirFormalizarContrato(targetCand);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Lock size={15} />
                <span>Formalizar Contrato y Asignar a Obra</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: CREAR Y PUBLICAR NUEVA VACANTE (FORMULARIO EMPRESARIAL) */}
      {/* ==================================================================== */}
      {modalNuevaVacanteAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-blue-500/30 rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header del Formulario */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-blue-400 flex items-center gap-1.5">
                  <Building2 size={12} />
                  Publicación Empresarial de Obra Civil
                </span>
                <h2 className="text-lg md:text-xl font-bold text-white">
                  Crear y Publicar Nueva Vacante
                </h2>
                <p className="text-xs text-slate-400">
                  La vacante será visible inmediatamente en la Bolsa de Empleo Pública de GRUPO SARA.
                </p>
              </div>
              <button
                onClick={() => setModalNuevaVacanteAbierto(false)}
                className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCrearVacante} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Título del Puesto / Vacante *
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevaVacTitulo}
                    onChange={(e) => setNuevaVacTitulo(e.target.value)}
                    placeholder="ej: Ingeniero Residente de Estructuras / Maestro Mayor de Obra"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Especialidad</label>
                  <select
                    value={nuevaVacEspecialidad}
                    onChange={(e) => setNuevaVacEspecialidad(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="Ingeniería Civil">Ingeniería Civil</option>
                    <option value="Maestro Mayor">Maestro Mayor</option>
                    <option value="Topografía">Topografía</option>
                    <option value="Fierrero">Fierrero</option>
                    <option value="Albañil">Albañil</option>
                    <option value="Operador Maquinaria Pesada">Operador Maquinaria Pesada</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Categoría CICS</label>
                  <select
                    value={nuevaVacCics}
                    onChange={(e) => setNuevaVacCics(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="A1_DIRECCION">A1: Dirección Técnica</option>
                    <option value="B1_MAESTRO_MAYOR">B1: Maestro Mayor de Obra</option>
                    <option value="C2_ESPECIALISTA">C2: Operador Especialista</option>
                    <option value="D2_ALBANIL_FIERRERO">D2: Albañil / Fierrero</option>
                    <option value="E2_PEON">E2: Peón / Cuadrilla</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Empresa Contratante</label>
                  <input
                    type="text"
                    required
                    value={nuevaVacEmpresa}
                    onChange={(e) => setNuevaVacEmpresa(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Nombre de la Obra Destino *</label>
                  <input
                    type="text"
                    required
                    value={nuevaVacObra}
                    onChange={(e) => setNuevaVacObra(e.target.value)}
                    placeholder="ej: Torre Bellavista Norte / Hospital Los Valles"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Provincia ({LISTA_PROVINCIAS_ECUADOR.length} Provincias)</label>
                  <select
                    value={nuevaVacProvincia}
                    onChange={(e) => {
                      const p = e.target.value;
                      setNuevaVacProvincia(p);
                      const cList = getCantonesPorProvincia(p);
                      setNuevaVacCanton(cList[0] || 'Centro');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-blue-500 outline-none cursor-pointer"
                  >
                    {LISTA_PROVINCIAS_ECUADOR.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Cantón / Sector Destino</label>
                  <select
                    value={nuevaVacCanton}
                    onChange={(e) => setNuevaVacCanton(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-blue-500 outline-none cursor-pointer"
                  >
                    {getCantonesPorProvincia(nuevaVacProvincia).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Tipo de Contrato</label>
                  <select
                    value={nuevaVacContrato}
                    onChange={(e) => setNuevaVacContrato(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="Obra cierta">Obra cierta</option>
                    <option value="Servicios profesionales">Servicios profesionales</option>
                    <option value="Jornal por tarea">Jornal por tarea</option>
                    <option value="Plazo fijo">Plazo fijo</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Jornal Diario (USD)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={nuevaVacJornal}
                    onChange={(e) => setNuevaVacJornal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-emerald-400 font-mono font-bold focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Vacantes / Cupos a Cubrir</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={nuevaVacCupos}
                    onChange={(e) => setNuevaVacCupos(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Nivel de Urgencia</label>
                  <select
                    value={nuevaVacUrgencia}
                    onChange={(e) => setNuevaVacUrgencia(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Prioritaria">Prioritaria</option>
                    <option value="Urgente 48h">Urgente 48h</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Descripción y Requisitos Técnicos
                </label>
                <textarea
                  rows={3}
                  value={nuevaVacDescripcion}
                  onChange={(e) => setNuevaVacDescripcion(e.target.value)}
                  placeholder="Detalla las actividades a ejecutar, normas sísmicas aplicables y especificaciones de seguridad..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:border-blue-500 outline-none leading-relaxed"
                />
              </div>

              {/* Botones de Envío */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalNuevaVacanteAbierto(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <CheckCircle2 size={15} />
                  <span>Publicar Vacante Inmediatamente</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: FORMALIZAR CONTRATO Y ASIGNAR A OBRA CON ESCROW FIDUCIARIO */}
      {/* ==================================================================== */}
      {modalFormalizarContrato && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header del Formulario */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck size={13} />
                  Formalización Contractual SARA-PAGOS & Escrow
                </span>
                <h2 className="text-lg md:text-xl font-bold text-white">
                  Contratar a: {modalFormalizarContrato.nombreCandidato}
                </h2>
                <p className="text-xs text-slate-400">
                  Especialidad: <strong className="text-slate-200">{modalFormalizarContrato.especialidad}</strong> | C.I.{' '}
                  {modalFormalizarContrato.cedula}
                </p>
              </div>
              <button
                onClick={() => setModalFormalizarContrato(null)}
                className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmarContratoEscrow} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Obra Destino de Asignación *</label>
                <input
                  type="text"
                  required
                  value={escrowObraDestino}
                  onChange={(e) => setEscrowObraDestino(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Fecha de Inicio de Labores</label>
                  <input
                    type="date"
                    required
                    value={escrowFechaInicio}
                    onChange={(e) => setEscrowFechaInicio(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Duración Prevista (Meses)</label>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    required
                    value={escrowDuracionMeses}
                    onChange={(e) => setEscrowDuracionMeses(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/20 space-y-3">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Configuración del Fondo en Custodia Escrow
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Monto Total del Contrato (USD)</label>
                    <input
                      type="number"
                      min="100"
                      required
                      value={escrowMontoTotal}
                      onChange={(e) => setEscrowMontoTotal(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-emerald-400 font-mono font-bold focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">% Anticipo Inicial</label>
                    <select
                      value={escrowAnticipo}
                      onChange={(e) => setEscrowAnticipo(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-emerald-500 outline-none cursor-pointer"
                    >
                      <option value="10">10% al firmar Libro de Obra</option>
                      <option value="20">20% al firmar Libro de Obra</option>
                      <option value="30">30% al firmar Libro de Obra</option>
                    </select>
                  </div>
                </div>

                {/* Desglose Normativo IESS Construcción */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Aporte Patronal IESS Construcción (12.15%):</span>
                    <span className="text-white">
                      ${(escrowMontoTotal * 0.1215).toFixed(2)} USD
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Liberación por Hitos Técnicos (Fiscalización):</span>
                    <span className="text-emerald-400 font-bold">3 Hitos Programados (100%)</span>
                  </div>
                </div>
              </div>

              {/* Botones de Envío */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalFormalizarContrato(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Lock size={15} />
                  <span>Constituir Escrow y Asignar Trabajador</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
