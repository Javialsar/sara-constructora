'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Brain,
  UserCheck,
  ShieldCheck,
  MapPin,
  Star,
  CheckCircle2,
  XCircle,
  Send,
  Sparkles,
  Award,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  AlertTriangle,
  FileCheck2,
  Building2,
} from 'lucide-react';
import {
  ObraPersonalRequestService,
  RequerimientoPersonalObra,
  VacanteRequeridaObra,
  CandidatoIdoneoulacionIA,
} from '@/lib/services/obraPersonalRequestService';

interface ContratacionPersonalSectionProps {
  onIrASaraTalento?: () => void;
}

export function ContratacionPersonalSection({
  onIrASaraTalento,
}: ContratacionPersonalSectionProps) {
  const [requerimientos, setRequerimientos] = useState<RequerimientoPersonalObra[]>([]);
  // Guarda qué candidato ha elegido el encargado de contratación para cada vacante (vacanteId -> CandidatoIdoneoulacionIA)
  const [candidatoElegidoPorVacante, setCandidatoElegidoPorVacante] = useState<
    Record<string, CandidatoIdoneoulacionIA>
  >({});
  const [notificacionBanner, setNotificacionBanner] = useState<string | null>(null);

  useEffect(() => {
    const cargar = () => {
      setRequerimientos(ObraPersonalRequestService.sincronizarConSaraTalento());
    };
    cargar();
    if (typeof window !== 'undefined') {
      window.addEventListener('sara_requerimientos_personal_updated', cargar);
      window.addEventListener('sara_talento_solicitudes_cambio', cargar);
      return () => {
        window.removeEventListener('sara_requerimientos_personal_updated', cargar);
        window.removeEventListener('sara_talento_solicitudes_cambio', cargar);
      };
    }
  }, []);

  const handleSeleccionarCandidato = (
    vacanteId: string,
    candidato: CandidatoIdoneoulacionIA
  ) => {
    setCandidatoElegidoPorVacante(prev => ({
      ...prev,
      [vacanteId]: candidato,
    }));
  };

  const handleContratarYNotificar = (
    req: RequerimientoPersonalObra,
    vacante: VacanteRequeridaObra,
    candidato: CandidatoIdoneoulacionIA
  ) => {
    const { solicitudTalentoCreada } =
      ObraPersonalRequestService.contratarYNotificarEnSaraTalento({
        requerimientoId: req.id,
        vacanteId: vacante.id,
        candidato,
      });

    setRequerimientos(ObraPersonalRequestService.getRequerimientosPersonal());
    setNotificacionBanner(
      `¡Oferta de Contrato ${solicitudTalentoCreada.id} registrada en SARA-TALENTO! Se ha enviado notificación push y correo a ${candidato.nombreCompleto} (${candidato.emailContacto}) para que proceda con la aceptación o rechazo del contrato para la obra "${req.proyectoNombre}".`
    );
  };

  const handleRespuestaTrabajador = (
    saraTalentoSolicitudId: string,
    decision: 'ACEPTAR_CONTRATO' | 'RECHAZAR_CONTRATO',
    nombreTrabajador: string
  ) => {
    ObraPersonalRequestService.procesarRespuestaTrabajadorContrato({
      saraTalentoSolicitudId,
      decision,
    });
    setRequerimientos(ObraPersonalRequestService.getRequerimientosPersonal());
    if (decision === 'ACEPTAR_CONTRATO') {
      setNotificacionBanner(
        `✅ ¡${nombreTrabajador} ha ACEPTADO el contrato (${saraTalentoSolicitudId}) en SARA-TALENTO! Contactos corporativos desbloqueados, Pase SST Decreto 255 activado y habilitado para Aviso de Entrada IESS.`
      );
    } else {
      setNotificacionBanner(
        `⚠️ ${nombreTrabajador} ha RECHAZADO la oferta (${saraTalentoSolicitudId}). El Agente IA SARA-TALENTOHUMANO ha preseleccionado automáticamente al siguiente candidato más idóneo del ranking para no retrasar el cronograma.`
      );
    }
  };

  const totalVacantesPendientes = requerimientos.reduce(
    (acc, r) =>
      acc +
      r.vacantes.filter(
        v =>
          v.estadoVacante === 'PENDIENTE_EVALUACION_IA' ||
          v.estadoVacante === 'CONTRATO_RECHAZADO_POR_TRABAJADOR'
      ).length,
    0
  );

  const totalNotificadosEsperando = requerimientos.reduce(
    (acc, r) =>
      acc +
      r.vacantes.filter(v => v.estadoVacante === 'NOTIFICADO_EN_SARA_TALENTO')
        .length,
    0
  );

  const totalContratadosActivos = requerimientos.reduce(
    (acc, r) =>
      acc +
      r.vacantes.filter(v => v.estadoVacante === 'CONTRATO_ACEPTADO_ACTIVO')
        .length,
    0
  );

  return (
    <div className="space-y-6">
      {/* CABECERA DEL CENTRO DE CONTRATACIÓN CON IA SARA-TALENTOHUMANO */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-indigo-500/30 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-emerald-500 text-slate-950">
                Directorio y Recursos • Contratación Personal
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1">
                <Brain size={12} />
                Agente IA SARA-TALENTOHUMANO Integrado con SARA-TALENTO
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-emerald-400" />
              Mesa de Contratación de Personal & Evaluación de Idoneidad IA
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl">
              Recibe los pedidos de personal emitidos por el técnico de obra según el <strong>Cronograma y Presupuesto APU</strong>. El Agente IA cruza cada vacante con los profesionales y trabajadores registrados en <strong>SARA-TALENTO</strong> para determinar quién es el más idóneo (cercanía GPS, tarifa vs techo APU, certificaciones SECAP/SENESCYT y SST Decreto 255). Al presionar <strong>"Contratar y Notificar"</strong>, se registra la oferta en SARA-TALENTO y se notifica al trabajador para su aceptación.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onIrASaraTalento && (
              <button
                type="button"
                onClick={onIrASaraTalento}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Award size={14} className="text-amber-400" />
                <span>Ver Padrón SARA Talento</span>
              </button>
            )}
            <Link
              href="/modulos/talento/mi-perfil"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <span>Portal del Trabajador (Mi Perfil)</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>

        {/* KPIs RÁPIDOS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10 font-mono text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-400 text-[10px] block uppercase">
              Vacantes por Evaluar / Contratar
            </span>
            <span className="text-lg font-bold text-amber-400">
              {totalVacantesPendientes} Perfil(es)
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-400 text-[10px] block uppercase">
              Notificados en SARA-TALENTO (Por Aceptar)
            </span>
            <span className="text-lg font-bold text-sky-400">
              {totalNotificadosEsperando} Oferta(s)
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-400 text-[10px] block uppercase">
              Contratos Aceptados por el Trabajador
            </span>
            <span className="text-lg font-bold text-emerald-400">
              {totalContratadosActivos} Contratado(s)
            </span>
          </div>
        </div>
      </div>

      {notificacionBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-4 text-emerald-900 dark:text-emerald-200 animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
              <CheckCircle2 size={18} />
            </span>
            <p className="text-xs font-bold">{notificacionBanner}</p>
          </div>
          <button
            type="button"
            onClick={() => setNotificacionBanner(null)}
            className="text-xs font-bold px-2.5 py-1 rounded-lg hover:bg-emerald-200/50 cursor-pointer shrink-0"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* LISTA DE REQUERIMIENTOS DE PERSONAL RECIBIDOS DESDE LA OBRA */}
      <div className="space-y-6">
        {requerimientos.map(req => (
          <div
            key={req.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5"
          >
            {/* Cabecera del Pedido de Obra */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs">
                    {req.numeroRequerimiento}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono text-[11px] font-bold">
                    {req.faseCronogramaNombre}
                  </span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1">
                    <Building2 size={14} className="text-indigo-500" />
                    {req.proyectoNombre} ({req.frenteObraEspecifico})
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Solicitado por Técnico Encargado: <strong>{req.solicitadoPorTecnico}</strong> • Fecha: {req.fechaEmision} {req.horaEmision} • Justificación: <em>"{req.justificacionCronograma}"</em>
                </p>
              </div>

              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                {req.vacantes.length} Perfiles Requeridos
              </span>
            </div>

            {/* EVALUACIÓN DE CADA VACANTE CON EL AGENTE IA SARA-TALENTOHUMANO */}
            <div className="space-y-4">
              {req.vacantes.map(vac => {
                const candidatosIA = ObraPersonalRequestService.evaluarCandidatosIdoneosIA(
                  vac,
                  req.ciudadObra
                );
                const mejorPorDefecto =
                  candidatosIA.find(c => c.esMasIdoneoIA) || candidatosIA[0];
                const candidatoSeleccionado =
                  candidatoElegidoPorVacante[vac.id] || mejorPorDefecto;

                const esPendienteORechazado =
                  vac.estadoVacante === 'PENDIENTE_EVALUACION_IA' ||
                  vac.estadoVacante === 'CONTRATO_RECHAZADO_POR_TRABAJADOR';

                return (
                  <div
                    key={vac.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/20 space-y-4"
                  >
                    {/* Resumen de la Vacante Solicitada según Cronograma y APU */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold">
                            {vac.codigoPerfilApu} • {vac.estructuraCics}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono text-[10px] font-bold">
                            {vac.cantidadPersonasRequeridas} Vacante(s) Requerida(s)
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {vac.cargoEspecialidad}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">
                          📅 Cronograma: <strong>{vac.fechaInicioCronograma}</strong> al <strong>{vac.fechaFinCronograma}</strong> ({vac.duracionEstimada}) • 💰 Techo Presupuesto APU: <strong>${vac.tarifaHoraTechoApuUSD.toFixed(2)}/h</strong> (Jornal ${vac.jornalDiarioTechoApuUSD.toFixed(2)}/día) • 🛡️ Exige: {vac.certificacionExigida}
                        </p>
                      </div>

                      <div>
                        {vac.estadoVacante === 'CONTRATO_ACEPTADO_ACTIVO' ? (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold border border-emerald-300 flex items-center gap-1.5">
                            <CheckCircle2 size={14} />
                            <span>Contrato Aceptado ({vac.saraTalentoSolicitudId})</span>
                          </span>
                        ) : vac.estadoVacante === 'NOTIFICADO_EN_SARA_TALENTO' ? (
                          <span className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-mono font-bold border border-amber-300 flex items-center gap-1.5">
                            <Clock size={14} />
                            <span>Notificado en SARA-TALENTO ({vac.saraTalentoSolicitudId})</span>
                          </span>
                        ) : vac.estadoVacante === 'CONTRATO_RECHAZADO_POR_TRABAJADOR' ? (
                          <span className="px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-xs font-mono font-bold border border-rose-300 flex items-center gap-1.5">
                            <AlertTriangle size={14} />
                            <span>Rechazado — Seleccione Siguiente Idóneo IA</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-xs font-mono font-bold border border-indigo-300 flex items-center gap-1.5">
                            <Sparkles size={14} />
                            <span>Evaluado por IA SARA-TALENTOHUMANO</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {vac.motivoRechazoTrabajador && (
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                        <AlertTriangle size={15} className="shrink-0" />
                        <span>
                          <strong>Aviso de SARA-TALENTO:</strong> {vac.motivoRechazoTrabajador} El Agente IA ha promovido automáticamente al siguiente candidato más idóneo de la base de datos.
                        </span>
                      </div>
                    )}

                    {/* SI LA VACANTE ESTÁ PENDIENTE DE CONTRATAR: MOSTRAR TERNAS DE IDONEIDAD DEL AGENTE IA */}
                    {esPendienteORechazado && candidatoSeleccionado && (
                      <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                            <Brain size={15} />
                            Candidatos en SARA-TALENTO Evaluados por el Agente IA (Ordenados por Idoneidad y Cercanía):
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Haz clic en un candidato para revisar su ficha antes de contratar
                          </span>
                        </div>

                        {/* Pestañas de Candidatos sugeridos por IA */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {candidatosIA.map((cand, cIdx) => {
                            const activo =
                              cand.talentoId === candidatoSeleccionado.talentoId;
                            return (
                              <div
                                key={cand.talentoId}
                                onClick={() =>
                                  handleSeleccionarCandidato(vac.id, cand)
                                }
                                className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                                  activo
                                    ? 'border-2 border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-md'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-800/30'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                        cand.esMasIdoneoIA
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                      }`}
                                    >
                                      {cand.esMasIdoneoIA
                                        ? `★ #1 MÁS IDÓNEO IA (${cand.scoreIdoneidadTotal}%)`
                                        : `#${cIdx + 1} Opción (${cand.scoreIdoneidadTotal}% IA)`}
                                    </span>
                                    <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                                      {cand.nombreCompleto}
                                    </h5>
                                    <p className="text-[11px] text-slate-500">
                                      {cand.especialidadCargo}
                                    </p>
                                  </div>

                                  <div className="text-right font-mono shrink-0">
                                    <span className="text-xs font-bold text-amber-500 flex items-center justify-end gap-0.5">
                                      <Star size={12} className="fill-amber-400 text-amber-400" />
                                      {cand.calificacionHistorica.toFixed(1)}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block">
                                      {cand.experienciaAnios} años exp.
                                    </span>
                                  </div>
                                </div>

                                <div className="text-[11px] space-y-1 font-mono pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-500 font-sans">Cercanía Obra:</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">
                                      {cand.etiquetaCercania}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-500 font-sans">Tarifa vs APU:</span>
                                    <span
                                      className={`font-bold ${
                                        cand.dentroTechoApu
                                          ? 'text-emerald-600 dark:text-emerald-400'
                                          : 'text-amber-600 dark:text-amber-400'
                                      }`}
                                    >
                                      ${cand.tarifaHoraPropuestaUSD.toFixed(2)}/h (
                                      {cand.dentroTechoApu ? '✓ Dentro APU' : '+Sobre APU'})
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Dictamen Detallado del Agente IA y Botón de Contratación */}
                        <div className="p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                                <Sparkles size={14} />
                                Dictamen de Idoneidad IA para {candidatoSeleccionado.nombreCompleto}:
                              </span>
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold">
                                Score Total: {candidatoSeleccionado.scoreIdoneidadTotal}/100 pts
                              </span>
                            </div>
                            <p className="text-xs text-slate-300">
                              {candidatoSeleccionado.dictamenAgenteIA}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono text-slate-400">
                              {candidatoSeleccionado.certificacionesVerificadas.map((cert, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700"
                                >
                                  ✓ {cert}
                                </span>
                              ))}
                              {candidatoSeleccionado.cumpleSstDecreto255 && (
                                <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                                  🛡️ Cumple SST Decreto 255 & IESS CD 513
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                handleContratarYNotificar(
                                  req,
                                  vac,
                                  candidatoSeleccionado
                                )
                              }
                              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all"
                            >
                              <Send size={14} />
                              <span>
                                Contratar a {candidatoSeleccionado.nombreCompleto} y Notificar en SARA-TALENTO
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SI YA SE ENVIÓ A SARA-TALENTO (ESPERANDO ACEPTACIÓN DEL PROFESIONAL/TRABAJADOR) */}
                    {vac.estadoVacante === 'NOTIFICADO_EN_SARA_TALENTO' && (
                      <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded bg-amber-500 text-slate-950 font-mono text-[10px] font-bold">
                              NOTIFICADO EN SARA-TALENTO • {vac.saraTalentoSolicitudId}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              Candidato Contratado: {vac.candidatoSeleccionadoNombre} (Score IA: {vac.candidatoSeleccionadoScoreIA}%)
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            Se envió la notificación de contrato al perfil del profesional en <strong>SARA-TALENTO</strong> (Tarifa: <strong>${vac.candidatoSeleccionadoTarifaHoraUSD?.toFixed(2)}/h</strong> • Distancia: {vac.candidatoSeleccionadoDistanciaKm} km). Esperando confirmación de aceptación del trabajador:
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              vac.saraTalentoSolicitudId &&
                              handleRespuestaTrabajador(
                                vac.saraTalentoSolicitudId,
                                'ACEPTAR_CONTRATO',
                                vac.candidatoSeleccionadoNombre || 'Profesional'
                              )
                            }
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
                          >
                            <CheckCircle2 size={14} />
                            <span>Confirmar Aceptación del Trabajador</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              vac.saraTalentoSolicitudId &&
                              handleRespuestaTrabajador(
                                vac.saraTalentoSolicitudId,
                                'RECHAZAR_CONTRATO',
                                vac.candidatoSeleccionadoNombre || 'Profesional'
                              )
                            }
                            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
                          >
                            <XCircle size={14} />
                            <span>Registrar Rechazo (Reasignar IA)</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SI EL TRABAJADOR YA ACEPTÓ EL CONTRATO EN SARA-TALENTO */}
                    {vac.estadoVacante === 'CONTRATO_ACEPTADO_ACTIVO' && (
                      <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded bg-emerald-600 text-white font-mono text-[10px] font-bold">
                              CONTRATO FORMALIZADO ART. 16.1 CT • {vac.saraTalentoSolicitudId}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {vac.candidatoSeleccionadoNombre} (C.I. {vac.candidatoSeleccionadoCedula}) — Incorporado a Obra
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            El profesional aceptó formalmente el contrato en <strong>SARA-TALENTO</strong> el {vac.fechaRespuestaTrabajador}. Aviso de Entrada IESS habilitado y Pase de Seguridad SST (Decreto 255) activo para ingreso a <strong>{req.proyectoNombre}</strong>.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                          <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                            <FileCheck2 size={14} />
                            <span>Tarifa: ${vac.candidatoSeleccionadoTarifaHoraUSD?.toFixed(2)}/h</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
