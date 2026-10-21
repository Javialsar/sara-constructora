'use client';

import React, { useState, useEffect } from 'react';
import {
  HardHat,
  Calendar,
  FileSpreadsheet,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Trash2,
  ArrowRight,
  Layers,
  Award,
} from 'lucide-react';
import {
  ObraPersonalRequestService,
  RequerimientoPersonalObra,
  VacanteRequeridaObra,
  PlantillaFaseCronogramaApuPersonal,
  PrioridadContratacion,
} from '@/lib/services/obraPersonalRequestService';

interface SolicitarPersonalObraSectionProps {
  residenteActualNombre?: string;
  onIrAContratacionPersonal?: () => void;
}

export function SolicitarPersonalObraSection({
  residenteActualNombre = 'Ing. David Sarango (Residente Técnico de Obra)',
  onIrAContratacionPersonal,
}: SolicitarPersonalObraSectionProps) {
  const plantillasCronograma = ObraPersonalRequestService.getPlantillasCronogramaApu();
  const [requerimientos, setRequerimientos] = useState<RequerimientoPersonalObra[]>([]);
  const [modoSolicitud, setModoSolicitud] = useState<'CRONOGRAMA_APU' | 'MANUAL_ESPECIALISTA'>('CRONOGRAMA_APU');

  // Formulario general del requerimiento
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState('Torre SARA Loja (Pisos 4-8)');
  const [ciudadObra, setCiudadObra] = useState<'Loja' | 'Cariamanga' | 'Cuenca'>('Loja');
  const [frenteObra, setFrenteObra] = useState('Pórticos Estructurales Nivel 6 y Ductos Eléctricos');
  const [faseSeleccionadaId, setFaseSeleccionadaId] = useState(plantillasCronograma[0].id);
  const [prioridad, setPrioridad] = useState<PrioridadContratacion>('URGENTE_48H');
  const [justificacionCronograma, setJustificacionCronograma] = useState(
    'Requerimiento de personal técnico y cuadrillas programado según Ruta Crítica del Cronograma de Obra y techo de Mano de Obra del Presupuesto APU.'
  );
  const [fechaInicioProgramada, setFechaInicioProgramada] = useState('2026-10-24');
  const [fechaFinProgramada, setFechaFinProgramada] = useState('2026-12-24');

  // Selección de perfiles desde el Cronograma + APU
  const [cantidadesPorPerfilApu, setCantidadesPorPerfilApu] = useState<Record<string, number>>({
    'MO-CICS-B1-01': 1,
    'MO-CICS-D2-04': 2,
    'MO-CICS-D2-07': 0,
  });

  // Formulario para agregar un especialista manual adicional
  const [cargoManual, setCargoManual] = useState('Ingeniero Eléctrico / Especialista Redes de Obra');
  const [estructuraManual, setEstructuraManual] = useState<
    'A1_DIRECCION' | 'B1_MAESTRO_MAYOR' | 'C2_ESPECIALISTA' | 'D2_ALBANIL_FIERRERO' | 'E2_PEON'
  >('A1_DIRECCION');
  const [cantidadManual, setCantidadManual] = useState(1);
  const [horasApuManual, setHorasApuManual] = useState(160);
  const [tarifaTechoHoraManual, setTarifaTechoHoraManual] = useState(5.25);
  const [duracionManual, setDuracionManual] = useState('1 Mes (160 Horas)');
  const [certificacionManual, setCertificacionManual] = useState(
    'Título SENESCYT / Certificación SECAP + SST Decreto Ejecutivo 255'
  );
  const [requiereAlturaManual, setRequiereAlturaManual] = useState(true);
  const [vacantesManuales, setVacantesManuales] = useState<VacanteRequeridaObra[]>([]);

  const [bannerExito, setBannerExito] = useState<string | null>(null);

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

  const faseActual: PlantillaFaseCronogramaApuPersonal =
    plantillasCronograma.find(f => f.id === faseSeleccionadaId) || plantillasCronograma[0];

  const handleCambiarFase = (nuevaFaseId: string) => {
    setFaseSeleccionadaId(nuevaFaseId);
    const f = plantillasCronograma.find(x => x.id === nuevaFaseId);
    if (f) {
      const inicial: Record<string, number> = {};
      f.perfilesPresupuestados.forEach((p, idx) => {
        inicial[p.codigoPerfilApu] = idx < 2 ? p.cantidadSugerida : 0;
      });
      setCantidadesPorPerfilApu(inicial);
    }
  };

  const handleAgregarVacanteManual = () => {
    if (!cargoManual.trim() || cantidadManual <= 0) return;
    const nueva: VacanteRequeridaObra = {
      id: `vac-man-${Date.now()}`,
      codigoPerfilApu: `MO-ESP-${Math.floor(100 + Math.random() * 899)}`,
      cargoEspecialidad: cargoManual.trim(),
      estructuraCics: estructuraManual,
      rubroApuRelacionado: 'Requerimiento Especialista Directo de Obra',
      faseCronograma: faseActual.nombreFaseCronograma,
      cantidadPersonasRequeridas: cantidadManual,
      horasHombrePresupuestadasApu: horasApuManual * cantidadManual,
      tarifaHoraTechoApuUSD: tarifaTechoHoraManual,
      jornalDiarioTechoApuUSD: +(tarifaTechoHoraManual * 8).toFixed(2),
      fechaInicioCronograma: fechaInicioProgramada,
      fechaFinCronograma: fechaFinProgramada,
      duracionEstimada: duracionManual,
      certificacionExigida: certificacionManual,
      requiereEppAlturaSst: requiereAlturaManual,
      estadoVacante: 'PENDIENTE_EVALUACION_IA',
    };
    setVacantesManuales(prev => [...prev, nueva]);
  };

  const handleEmitirRequerimientoAContratacion = () => {
    const vacantesDesdeApu: VacanteRequeridaObra[] = [];
    if (modoSolicitud === 'CRONOGRAMA_APU') {
      faseActual.perfilesPresupuestados.forEach(perf => {
        const cant = cantidadesPorPerfilApu[perf.codigoPerfilApu] || 0;
        if (cant > 0) {
          vacantesDesdeApu.push({
            id: `vac-apu-${perf.codigoPerfilApu}-${Date.now()}`,
            codigoPerfilApu: perf.codigoPerfilApu,
            cargoEspecialidad: perf.cargoEspecialidad,
            estructuraCics: perf.estructuraCics,
            rubroApuRelacionado: faseActual.rubroApuReferencia,
            faseCronograma: `${faseActual.nombreFaseCronograma} (${faseActual.semanasCronograma})`,
            cantidadPersonasRequeridas: cant,
            horasHombrePresupuestadasApu:
              perf.horasHombrePresupuestadasApu - perf.horasHombreYaContratadas,
            tarifaHoraTechoApuUSD: perf.tarifaHoraTechoApuUSD,
            jornalDiarioTechoApuUSD: perf.jornalDiarioTechoApuUSD,
            fechaInicioCronograma: fechaInicioProgramada,
            fechaFinCronograma: fechaFinProgramada,
            duracionEstimada: perf.duracionFase,
            certificacionExigida: perf.certificacionExigida,
            requiereEppAlturaSst: perf.requiereEppAlturaSst,
            estadoVacante: 'PENDIENTE_EVALUACION_IA',
          });
        }
      });
    }

    const totalVacantes = [...vacantesDesdeApu, ...vacantesManuales];
    if (totalVacantes.length === 0) {
      return;
    }

    const creado = ObraPersonalRequestService.crearRequerimientoPersonalObra({
      proyectoId: 'proy-sara-obra',
      proyectoNombre: proyectoSeleccionado,
      ciudadObra,
      frenteObraEspecifico: frenteObra,
      faseCronogramaId: faseActual.id,
      faseCronogramaNombre: `${faseActual.nombreFaseCronograma} (${faseActual.semanasCronograma})`,
      solicitadoPorTecnico: residenteActualNombre,
      cargoSolicitante: 'Ingeniero Residente / Técnico Encargado de Obra',
      origen:
        vacantesDesdeApu.length > 0 ? 'CRONOGRAMA_Y_APU' : 'SOLICITUD_ESPECIALISTA_MANUAL',
      prioridad,
      justificacionCronograma,
      vacantes: totalVacantes,
    });

    setVacantesManuales([]);
    setRequerimientos(ObraPersonalRequestService.getRequerimientosPersonal());
    setBannerExito(
      `¡Requerimiento ${creado.numeroRequerimiento} emitido con ${totalVacantes.length} perfil(es) requerido(s)! Ya fue enviado a "Directorio y Recursos → Contratación Personal" para que el Agente IA SARA-TALENTOHUMANO seleccione al candidato más idóneo.`
    );
  };

  return (
    <div className="space-y-6">
      {/* CABECERA CORPORATIVA */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-indigo-500/30 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-amber-500 text-slate-950">
                Requerimientos Materiales / Trabajadores • Opción 2
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                SBU 2026: $482.00 • Tabla CICS & Presupuesto APU
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <HardHat className="w-6 h-6 text-amber-400" />
              Solicitar Profesionales / Trabajadores para la Obra
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl">
              El técnico encargado solicita el personal requerido de acuerdo al <strong>Cronograma de Ejecución de Obra</strong> y al <strong>Presupuesto APU de Mano de Obra</strong>. El requerimiento pasa automáticamente a <strong>Directorio y Recursos → Contratación Personal</strong> para su evaluación con el Agente IA <code className="text-amber-300 font-mono">SARA-TALENTOHUMANO</code>.
            </p>
          </div>

          {onIrAContratacionPersonal && (
            <button
              type="button"
              onClick={onIrAContratacionPersonal}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer shrink-0 transition-all"
            >
              <UserCheck size={16} />
              <span>Ir a Contratación Personal (IA SARA-TALENTO)</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {bannerExito && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-900 dark:text-emerald-200 animate-in fade-in">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
              <CheckCircle2 size={18} />
            </span>
            <div className="space-y-1">
              <p className="text-xs font-bold">{bannerExito}</p>
              {onIrAContratacionPersonal && (
                <button
                  type="button"
                  onClick={onIrAContratacionPersonal}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-300 underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Abrir ahora "Directorio y Recursos → Contratación Personal" para contratar con IA</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setBannerExito(null)}
            className="text-xs font-bold px-2.5 py-1 rounded-lg hover:bg-emerald-200/50 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* FORMULARIO DE SOLICITUD VINCULADO AL CRONOGRAMA Y PRESUPUESTO APU */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              1. Datos del Proyecto, Cronograma de Obra y Presupuesto APU
            </h3>
            <p className="text-xs text-slate-500">
              Selecciona la obra y la fase del cronograma para cargar los perfiles técnicos y obreros contemplados en el presupuesto.
            </p>
          </div>

          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setModoSolicitud('CRONOGRAMA_APU')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                modoSolicitud === 'CRONOGRAMA_APU'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <FileSpreadsheet size={14} />
              <span>Desde Cronograma & Presupuesto APU</span>
            </button>
            <button
              type="button"
              onClick={() => setModoSolicitud('MANUAL_ESPECIALISTA')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                modoSolicitud === 'MANUAL_ESPECIALISTA'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Plus size={14} />
              <span>Agregar Especialista Específico</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Obra / Proyecto Activo:
            </label>
            <select
              value={proyectoSeleccionado}
              onChange={e => setProyectoSeleccionado(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
            >
              <option value="Torre SARA Loja (Pisos 4-8)">Torre SARA Loja (Pisos 4-8)</option>
              <option value="Residencial Cariamanga Plaza">Residencial Cariamanga Plaza</option>
              <option value="Centro Corporativo Cuenca Sur">Centro Corporativo Cuenca Sur</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Ciudad Base de la Obra (Para Anillo GPS IA):
            </label>
            <select
              value={ciudadObra}
              onChange={(e: any) => setCiudadObra(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
            >
              <option value="Loja">Loja (Cantón Loja)</option>
              <option value="Cariamanga">Cariamanga (Calvas)</option>
              <option value="Cuenca">Cuenca (Azuay)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Frente de Trabajo Específico:
            </label>
            <input
              type="text"
              value={frenteObra}
              onChange={e => setFrenteObra(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Fase del Cronograma de Obra & Partida Presupuestaria APU:
            </label>
            <select
              value={faseSeleccionadaId}
              onChange={e => handleCambiarFase(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-800 font-bold text-indigo-950 dark:text-indigo-200"
            >
              {plantillasCronograma.map(f => (
                <option key={f.id} value={f.id}>
                  {f.nombreFaseCronograma} • [{f.semanasCronograma}] — {f.rubroApuReferencia}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Prioridad en Cronograma:
            </label>
            <select
              value={prioridad}
              onChange={(e: any) => setPrioridad(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
            >
              <option value="PROGRAMADA_CRONOGRAMA">🟢 Programada según Cronograma</option>
              <option value="URGENTE_48H">🟡 Urgente Ruta Crítica (48 Horas)</option>
              <option value="INMEDIATA_FRENTE_CRITICO">🔴 Inmediata Frente Crítico (24 Horas)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Fecha Inicio según Cronograma:
            </label>
            <input
              type="date"
              value={fechaInicioProgramada}
              onChange={e => setFechaInicioProgramada(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Fecha Fin Estimada Fase:
            </label>
            <input
              type="date"
              value={fechaFinProgramada}
              onChange={e => setFechaFinProgramada(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Solicitante Técnico Responsable:
            </label>
            <input
              type="text"
              readOnly
              value={residenteActualNombre}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold"
            />
          </div>
        </div>

        {/* MODO 1: EXPLOSIÓN DE MANO DE OBRA DEL PRESUPUESTO APU Y CRONOGRAMA */}
        {modoSolicitud === 'CRONOGRAMA_APU' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold text-slate-900 dark:text-white">
                  Perfiles de Mano de Obra en Presupuesto APU:
                </span>
                <span className="text-slate-500 font-mono">{faseActual.rubroApuReferencia}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Avance Fase Actual: {faseActual.avanceActualFasePct}%
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-[10px] font-mono uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-3">Cód. APU / Categoría CICS</th>
                    <th className="py-2.5 px-3">Profesional / Trabajador Requerido</th>
                    <th className="py-2.5 px-2 text-center">Horas APU Disp.</th>
                    <th className="py-2.5 px-2 text-center">Techo Hora / Jornal APU</th>
                    <th className="py-2.5 px-3">Certificación SECAP / SENESCYT & SST</th>
                    <th className="py-2.5 px-3 text-center">Vacantes a Solicitar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {faseActual.perfilesPresupuestados.map(perf => {
                    const cantElegida = cantidadesPorPerfilApu[perf.codigoPerfilApu] ?? 0;
                    const horasDisponibles =
                      perf.horasHombrePresupuestadasApu - perf.horasHombreYaContratadas;

                    return (
                      <tr
                        key={perf.codigoPerfilApu}
                        className={
                          cantElegida > 0
                            ? 'bg-indigo-50/40 dark:bg-indigo-950/20'
                            : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                        }
                      >
                        <td className="py-3 px-3">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 block">
                            {perf.codigoPerfilApu}
                          </span>
                          <span className="text-[10px] text-slate-500">{perf.estructuraCics}</span>
                        </td>
                        <td className="py-3 px-3 font-sans">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {perf.cargoEspecialidad}
                          </div>
                          <span className="text-[11px] text-slate-500">
                            Duración Cronograma: {perf.duracionFase}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {horasDisponibles} h
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            de {perf.horasHombrePresupuestadasApu} h APU
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className="font-bold text-slate-900 dark:text-white">
                            ${perf.tarifaHoraTechoApuUSD.toFixed(2)}/h
                          </span>
                          <span className="block text-[10px] text-slate-500">
                            Jornal: ${perf.jornalDiarioTechoApuUSD.toFixed(2)}/día
                          </span>
                        </td>
                        <td className="py-3 px-3 font-sans text-[11px] text-slate-600 dark:text-slate-300">
                          <div>{perf.certificacionExigida}</div>
                          {perf.requiereEppAlturaSst && (
                            <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                              <ShieldCheck size={11} /> Exige PTAR Altura & EPP Decreto 255
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="number"
                            min={0}
                            max={20}
                            value={cantElegida}
                            onChange={e =>
                              setCantidadesPorPerfilApu(prev => ({
                                ...prev,
                                [perf.codigoPerfilApu]: Math.max(0, Number(e.target.value)),
                              }))
                            }
                            className="w-20 px-2.5 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-center font-bold text-sm text-slate-900 dark:text-white"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODO 2: AGREGAR ESPECIALISTA O TRABAJADOR ESPECÍFICO MANUAL */}
        {modoSolicitud === 'MANUAL_ESPECIALISTA' && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              Especificar Profesional o Especialista Requerido para la Obra
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Especialidad / Cargo a Solicitar:
                </label>
                <input
                  type="text"
                  value={cargoManual}
                  onChange={e => setCargoManual(e.target.value)}
                  placeholder="Ej: Ingeniero Eléctrico, Topógrafo, Soldador 6G..."
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Estructura Ocupacional CICS:
                </label>
                <select
                  value={estructuraManual}
                  onChange={(e: any) => setEstructuraManual(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  <option value="A1_DIRECCION">A1 • Ingeniero / Arquitecto Residente</option>
                  <option value="B1_MAESTRO_MAYOR">B1 • Maestro Mayor de Obra</option>
                  <option value="C2_ESPECIALISTA">C2 • Técnico Especialista (Eléctrico/Plomero)</option>
                  <option value="D2_ALBANIL_FIERRERO">D2 • Albañil / Fierrero / Encofrador</option>
                  <option value="E2_PEON">E2 • Peón Calificado (SBU 2026 $482)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Cantidad Personas:
                </label>
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={cantidadManual}
                  onChange={e => setCantidadManual(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Techo Tarifa Hora APU ($/h):
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={tarifaTechoHoraManual}
                  onChange={e => setTarifaTechoHoraManual(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Duración del Contrato:
                </label>
                <input
                  type="text"
                  value={duracionManual}
                  onChange={e => setDuracionManual(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Certificación Exigida (SENESCYT / SECAP / SST):
                </label>
                <input
                  type="text"
                  value={certificacionManual}
                  onChange={e => setCertificacionManual(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAgregarVacanteManual}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>Añadir Perfil al Requerimiento</span>
              </button>
            </div>

            {vacantesManuales.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                {vacantesManuales.map(vm => (
                  <div
                    key={vm.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <div>
                      <strong>{vm.cantidadPersonasRequeridas}x {vm.cargoEspecialidad}</strong> ({vm.codigoPerfilApu}) — Techo APU: ${vm.tarifaHoraTechoApuUSD.toFixed(2)}/h • {vm.duracionEstimada}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setVacantesManuales(prev => prev.filter(x => x.id !== vm.id))
                      }
                      className="text-rose-500 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500">
            Al emitir la solicitud, se enviará a <strong>Directorio y Recursos → Contratación Personal</strong> para evaluación del Agente IA con <code className="font-mono text-indigo-500">SARA-TALENTO</code>.
          </div>
          <button
            type="button"
            onClick={handleEmitirRequerimientoAContratacion}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Send size={15} />
            <span>Enviar Requerimiento a Contratación Personal</span>
          </button>
        </div>
      </div>

      {/* HISTORIAL EN VIVO DE REQUERIMIENTOS DE PERSONAL EMITIDOS DESDE OBRA */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              2. Trazabilidad de Requerimientos de Personal de Obra ({requerimientos.length})
            </h3>
            <p className="text-xs text-slate-500">
              Estado en tiempo real de las solicitudes enviadas a Contratación Personal y respuesta de los profesionales en SARA-TALENTO.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {requerimientos.map(req => (
            <div
              key={req.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-3"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-mono font-bold text-xs">
                      {req.numeroRequerimiento}
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {req.proyectoNombre} — {req.frenteObraEspecifico}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {req.faseCronogramaNombre} • Solicitado por: <strong>{req.solicitadoPorTecnico}</strong> ({req.fechaEmision} {req.horaEmision})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {req.estadoGeneral === 'CONTRATACION_COMPLETA' ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold border border-emerald-300">
                      ✅ Contratación Aceptada & Completa
                    </span>
                  ) : req.estadoGeneral === 'REQUIERE_REASIGNACION' ? (
                    <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-mono font-bold border border-rose-300">
                      ⚠️ Rechazo de Candidato — Requiere Reasignación IA
                    </span>
                  ) : req.estadoGeneral === 'EN_PROCESO_ACEPTACION_TALENTO' ? (
                    <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-mono font-bold border border-amber-300">
                      📲 Notificado en SARA-TALENTO (Esperando Aceptación)
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-bold border border-indigo-300">
                      🤖 Pendiente de Contratación en RRHH
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {req.vacantes.map(vac => (
                  <div
                    key={vac.id}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        {vac.codigoPerfilApu} • {vac.cantidadPersonasRequeridas} Vacante(s)
                      </span>
                      <span className="font-mono text-[10px] font-bold text-slate-500">
                        Techo APU: ${vac.tarifaHoraTechoApuUSD.toFixed(2)}/h
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {vac.cargoEspecialidad}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      📅 Inicio: {vac.fechaInicioCronograma} • {vac.duracionEstimada}
                    </div>

                    {vac.estadoVacante === 'CONTRATO_ACEPTADO_ACTIVO' ? (
                      <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        <span>
                          Aceptado por: {vac.candidatoSeleccionadoNombre} ({vac.saraTalentoSolicitudId})
                        </span>
                      </div>
                    ) : vac.estadoVacante === 'NOTIFICADO_EN_SARA_TALENTO' ? (
                      <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                        <Clock size={13} />
                        <span>
                          Notificado: {vac.candidatoSeleccionadoNombre} ({vac.saraTalentoSolicitudId})
                        </span>
                      </div>
                    ) : vac.estadoVacante === 'CONTRATO_RECHAZADO_POR_TRABAJADOR' ? (
                      <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle size={13} />
                        <span>Rechazado por trabajador — Reasignar en Contratación</span>
                      </div>
                    ) : (
                      <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center gap-1">
                        <Sparkles size={12} className="text-indigo-500" />
                        <span>Listo para matching IA en Contratación Personal</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
