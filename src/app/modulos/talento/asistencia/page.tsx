'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Users, HardHat, Clock, DollarSign, ShieldCheck, CheckCircle2,
  AlertTriangle, Plus, FileSpreadsheet, ArrowLeft, RefreshCw,
  Search, Award, Check, X, Building2, Calendar, FileCheck2,
  TrendingUp, TrendingDown, HelpCircle, Layers, Eye, ShieldAlert,
  Sparkles, UserCheck, ChevronRight
} from 'lucide-react';
import {
  SaraTareoObraService,
  ProyectoObra,
  RubroApuObra,
  CuadrillaObra,
  RegistroTareoDiario,
  CalculoCostoTrabajadorTareo,
  ResumenJornadaTareo
} from '@/lib/services/saraTareoObraService';
import TalentoSubNav from '@/components/sara/TalentoSubNav';

export default function AsistenciaTareoPage() {
  // ---------------------------------------------------------------------------
  // ESTADOS PRINCIPALES DE SELECCIÓN DE OBRA Y FECHA
  // ---------------------------------------------------------------------------
  const [proyectos, setProyectos] = useState<ProyectoObra[]>([]);
  const [selectedProyectoId, setSelectedProyectoId] = useState<string>('proy-mirador');
  const [selectedFecha, setSelectedFecha] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [rubros, setRubros] = useState<RubroApuObra[]>([]);
  const [cuadrillas, setCuadrillas] = useState<CuadrillaObra[]>([]);
  const [tareos, setTareos] = useState<RegistroTareoDiario[]>([]);
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [filtroCuadrilla, setFiltroCuadrilla] = useState<string>('todas');
  const [pestanaActiva, setPestanaActiva] = useState<'tareo' | 'cuadrillas' | 'analisis_costos'>('tareo');

  // Modales
  const [modalNuevaCuadrillaOpen, setModalNuevaCuadrillaOpen] = useState(false);
  const [modalNuevoTrabajadorOpen, setModalNuevoTrabajadorOpen] = useState(false);
  const [modalFirmarFiscalizacionOpen, setModalFirmarFiscalizacionOpen] = useState(false);
  const [toast, setToast] = useState<{ tipo: 'exito' | 'error' | 'info'; mensaje: string } | null>(null);

  // Formulario Nueva Cuadrilla
  const [formCuadrilla, setFormCuadrilla] = useState({
    nombre: '',
    especialidad: 'Estructuras y Hormigón' as CuadrillaObra['especialidad'],
    maestroLiderNombre: '',
    maestroLiderCedula: '',
    maestroLiderTarifa: 4.80,
    integrantes: [
      { nombre: '', cedula: '', rol: 'Albañil' as const, tarifa: 3.50 },
      { nombre: '', cedula: '', rol: 'Peón' as const, tarifa: 3.10 }
    ]
  });

  // Formulario Nuevo Trabajador en Tareo
  const [formTrabajadorTareo, setFormTrabajadorTareo] = useState({
    nombre: '',
    cedula: '',
    rol: 'Albañil',
    cuadrillaId: '',
    rubroCodigo: 'RUB-001',
    horasNormales: 8,
    horasSuplementarias: 0,
    horasExtraordinarias: 0,
    tarifaBaseHora: 3.50,
    cumpleEPP: true,
    cumpleSeguridadAlturas: true,
    observacionesSST: ''
  });

  // Formulario Firma Fiscalización
  const [formFiscalizador, setFormFiscalizador] = useState({
    nombre: 'Ing. Marco Sarmiento',
    cargo: 'Fiscalizador Principal de Obra - GRUPO SARA',
    cedulaRegistro: '0103982145 / CIP-AZUAY-4921'
  });

  // ---------------------------------------------------------------------------
  // CARGA DE DATOS DESDE EL SERVICIO
  // ---------------------------------------------------------------------------
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    const proys = SaraTareoObraService.getProyectos();
    const rbrs = SaraTareoObraService.getRubrosApu();
    const cuad = SaraTareoObraService.getCuadrillas();
    const tars = SaraTareoObraService.getTareos();

    setProyectos(proys);
    setRubros(rbrs);
    setCuadrillas(cuad);
    setTareos(tars);
  };

  const proyectoActual = useMemo(() => {
    return proyectos.find(p => p.id === selectedProyectoId) || proyectos[0] || {
      id: 'proy-mirador',
      codigo: 'OBRA-CUE-02',
      nombre: 'Edificio Residencial El Mirador (Cuenca)',
      ciudad: 'Cuenca',
      provincia: 'Azuay',
      residente: 'Ing. Ana Gómez PMP',
      fiscalizador: 'Ing. Marco Sarmiento',
      estado: 'En Ejecución',
      presupuestoManoObraUSD: 124500.0
    };
  }, [proyectos, selectedProyectoId]);

  // Cuadrillas asociadas al proyecto actual
  const cuadrillasDelProyecto = useMemo(() => {
    return cuadrillas.filter(c => c.proyectoId === selectedProyectoId);
  }, [cuadrillas, selectedProyectoId]);

  // Tareos filtrados por proyecto actual y fecha seleccionada
  const tareosFiltrados = useMemo(() => {
    return tareos.filter(t => {
      const matchProy = t.proyectoId === selectedProyectoId;
      const matchFecha = t.fecha === selectedFecha;
      const matchCuad = filtroCuadrilla === 'todas' || t.cuadrillaId === filtroCuadrilla;
      const matchText = !filtroTexto || 
        t.nombreTrabajador.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        t.rol.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        t.rubroCodigo.toLowerCase().includes(filtroTexto.toLowerCase());
      return matchProy && matchFecha && matchCuad && matchText;
    });
  }, [tareos, selectedProyectoId, selectedFecha, filtroCuadrilla, filtroTexto]);

  // Análisis de costo real vs APU en tiempo real
  const { detalles, resumen } = useMemo(() => {
    return SaraTareoObraService.calcularAnalisisCosto(tareosFiltrados, rubros);
  }, [tareosFiltrados, rubros]);

  // ---------------------------------------------------------------------------
  // MANEJADORES DE ACCIONES
  // ---------------------------------------------------------------------------

  const mostrarMensaje = (tipo: 'exito' | 'error' | 'info', mensaje: string) => {
    setToast({ tipo, mensaje });
    setTimeout(() => setToast(null), 7000);
  };

  // Modificar horas directamente en la fila
  const handleActualizarHoras = (
    tareoId: string, 
    campo: 'horasNormales' | 'horasSuplementarias' | 'horasExtraordinarias', 
    delta: number
  ) => {
    const item = tareos.find(t => t.id === tareoId);
    if (!item) return;

    const valActual = Number(item[campo]) || 0;
    const nuevoValor = Math.max(0, Math.min(campo === 'horasNormales' ? 12 : 8, valActual + delta));

    const actualizado = SaraTareoObraService.guardarRegistroTareo({
      ...item,
      [campo]: nuevoValor
    });

    setTareos(prev => prev.map(t => t.id === tareoId ? actualizado : t));
  };

  // Cambiar Rubro APU asignado al trabajador
  const handleCambiarRubro = (tareoId: string, rubroCodigo: string) => {
    const item = tareos.find(t => t.id === tareoId);
    const rubro = rubros.find(r => r.codigo === rubroCodigo);
    if (!item || !rubro) return;

    const actualizado = SaraTareoObraService.guardarRegistroTareo({
      ...item,
      rubroCodigo: rubro.codigo,
      rubroDescripcion: rubro.descripcion,
      cumpleSeguridadAlturas: rubro.requiereSeguridadAlturas ? item.cumpleSeguridadAlturas : true
    });

    setTareos(prev => prev.map(t => t.id === tareoId ? actualizado : t));
  };

  // Alternar EPP o Alturas
  const handleToggleSST = (tareoId: string, campo: 'cumpleEPP' | 'cumpleSeguridadAlturas') => {
    const item = tareos.find(t => t.id === tareoId);
    if (!item) return;

    const actualizado = SaraTareoObraService.guardarRegistroTareo({
      ...item,
      [campo]: !item[campo]
    });

    setTareos(prev => prev.map(t => t.id === tareoId ? actualizado : t));
  };

  // Eliminar registro de tareo
  const handleEliminarRegistro = (tareoId: string) => {
    SaraTareoObraService.eliminarRegistroTareo(tareoId);
    setTareos(prev => prev.filter(t => t.id !== tareoId));
    mostrarMensaje('info', 'Registro de asistencia removido de la jornada.');
  };

  // Cargar una cuadrilla completa al tareo del día
  const handleCargarCuadrillaAlTareo = (cuadrilla: CuadrillaObra) => {
    const lote = cuadrilla.integrantes.map(integ => {
      const rubroDefecto = rubros[0]?.codigo || 'RUB-001';
      const rubroObj = rubros[0] || { codigo: 'RUB-001', descripcion: "Hormigón en Losas f'c=240 kg/cm²" };
      return {
        proyectoId: proyectoActual.id,
        proyectoNombre: proyectoActual.nombre,
        fecha: selectedFecha,
        trabajadorId: integ.trabajadorId,
        nombreTrabajador: integ.nombre,
        cedula: integ.cedula,
        rol: integ.rol,
        cuadrillaId: cuadrilla.id,
        cuadrillaNombre: cuadrilla.nombre,
        rubroCodigo: rubroObj.codigo,
        rubroDescripcion: rubroObj.descripcion,
        horasNormales: 8,
        horasSuplementarias: 0,
        tipoRecargoSuplementario: '50%' as const,
        horasExtraordinarias: 0,
        tarifaBaseHora: integ.tarifaHoraBase,
        cumpleEPP: true,
        cumpleSeguridadAlturas: true,
        observacionesSST: 'EPP reglamentario verificado al ingreso.',
        validado: false
      };
    });

    const guardados = SaraTareoObraService.guardarLoteTareo(lote);
    setTareos(prev => {
      const idsGuardados = new Set(guardados.map(g => g.id));
      return [...guardados, ...prev.filter(t => !idsGuardados.has(t.id))];
    });

    mostrarMensaje('exito', `Se han ingresado ${guardados.length} trabajadores de la cuadrilla "${cuadrilla.nombre}" al tareo del día.`);
  };

  // Crear nueva cuadrilla
  const handleGuardarNuevaCuadrilla = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCuadrilla.nombre || !formCuadrilla.maestroLiderNombre) {
      mostrarMensaje('error', 'Por favor complete el nombre de la cuadrilla y del maestro líder.');
      return;
    }

    const liderId = `TAL-LID-${Date.now().toString().slice(-4)}`;
    const integrantesObj = [
      {
        id: `int-${Date.now()}-0`,
        trabajadorId: liderId,
        nombre: formCuadrilla.maestroLiderNombre,
        cedula: formCuadrilla.maestroLiderCedula || '0109988776',
        rol: 'Maestro Mayor' as const,
        tarifaHoraBase: formCuadrilla.maestroLiderTarifa,
        activo: true,
        certificacionSecap: true
      },
      ...formCuadrilla.integrantes
        .filter(i => i.nombre.trim().length > 0)
        .map((i, idx) => ({
          id: `int-${Date.now()}-${idx + 1}`,
          trabajadorId: `TAL-CUA-${Date.now().toString().slice(-4)}-${idx}`,
          nombre: i.nombre,
          cedula: i.cedula || '0105544332',
          rol: i.rol,
          tarifaHoraBase: i.tarifa,
          activo: true,
          certificacionSecap: true
        }))
    ];

    const nueva = SaraTareoObraService.guardarCuadrilla({
      nombre: formCuadrilla.nombre,
      especialidad: formCuadrilla.especialidad,
      maestroLiderId: liderId,
      maestroLiderNombre: formCuadrilla.maestroLiderNombre,
      proyectoId: proyectoActual.id,
      proyectoNombre: proyectoActual.nombre,
      integrantes: integrantesObj,
      estado: 'Activa'
    });

    setCuadrillas(SaraTareoObraService.getCuadrillas());
    setModalNuevaCuadrillaOpen(false);
    mostrarMensaje('exito', `Cuadrilla "${nueva.nombre}" creada con éxito para ${proyectoActual.nombre}.`);

    // Reset formulario
    setFormCuadrilla({
      nombre: '',
      especialidad: 'Estructuras y Hormigón',
      maestroLiderNombre: '',
      maestroLiderCedula: '',
      maestroLiderTarifa: 4.80,
      integrantes: [
        { nombre: '', cedula: '', rol: 'Albañil', tarifa: 3.50 },
        { nombre: '', cedula: '', rol: 'Peón', tarifa: 3.10 }
      ]
    });
  };

  // Agregar trabajador individual al tareo
  const handleGuardarNuevoTrabajadorTareo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTrabajadorTareo.nombre) {
      mostrarMensaje('error', 'El nombre del trabajador es requerido.');
      return;
    }

    const rubroObj = rubros.find(r => r.codigo === formTrabajadorTareo.rubroCodigo) || rubros[0];
    const cuadObj = cuadrillas.find(c => c.id === formTrabajadorTareo.cuadrillaId);

    const nuevo = SaraTareoObraService.guardarRegistroTareo({
      proyectoId: proyectoActual.id,
      proyectoNombre: proyectoActual.nombre,
      fecha: selectedFecha,
      trabajadorId: `TAL-TR-${Date.now().toString().slice(-4)}`,
      nombreTrabajador: formTrabajadorTareo.nombre,
      cedula: formTrabajadorTareo.cedula || '0104829145',
      rol: formTrabajadorTareo.rol,
      cuadrillaId: formTrabajadorTareo.cuadrillaId || undefined,
      cuadrillaNombre: cuadObj?.nombre || undefined,
      rubroCodigo: rubroObj.codigo,
      rubroDescripcion: rubroObj.descripcion,
      horasNormales: Number(formTrabajadorTareo.horasNormales) || 8,
      horasSuplementarias: Number(formTrabajadorTareo.horasSuplementarias) || 0,
      tipoRecargoSuplementario: '50%',
      horasExtraordinarias: Number(formTrabajadorTareo.horasExtraordinarias) || 0,
      tarifaBaseHora: Number(formTrabajadorTareo.tarifaBaseHora) || 3.50,
      cumpleEPP: formTrabajadorTareo.cumpleEPP,
      cumpleSeguridadAlturas: formTrabajadorTareo.cumpleSeguridadAlturas,
      observacionesSST: formTrabajadorTareo.observacionesSST || 'Verificado al ingreso.',
      validado: false
    });

    setTareos(prev => [nuevo, ...prev]);
    setModalNuevoTrabajadorOpen(false);
    mostrarMensaje('exito', `Trabajador ${nuevo.nombreTrabajador} agregado al tareo de hoy.`);

    // Reset
    setFormTrabajadorTareo({
      nombre: '',
      cedula: '',
      rol: 'Albañil',
      cuadrillaId: '',
      rubroCodigo: 'RUB-001',
      horasNormales: 8,
      horasSuplementarias: 0,
      horasExtraordinarias: 0,
      tarifaBaseHora: 3.50,
      cumpleEPP: true,
      cumpleSeguridadAlturas: true,
      observacionesSST: ''
    });
  };

  // Firmar y Validar Tareo Diario por Fiscalización
  const handleEjecutarFirmaFiscalizacion = () => {
    if (tareosFiltrados.length === 0) {
      mostrarMensaje('error', 'No existen registros de tareo para firmar en esta fecha.');
      return;
    }

    const resultado = SaraTareoObraService.firmarYValidarTareo(
      proyectoActual.id,
      selectedFecha,
      {
        nombre: formFiscalizador.nombre,
        cargo: formFiscalizador.cargo,
        cedula: formFiscalizador.cedulaRegistro
      }
    );

    if (resultado.success) {
      setTareos(SaraTareoObraService.getTareos());
      setModalFirmarFiscalizacionOpen(false);
      mostrarMensaje('exito', `✅ Tareo firmado y certificado con éxito. Hash de Seguridad: ${resultado.hash}.`);
    }
  };

  // Exportar reporte de Tareo a Excel
  const handleExportarExcel = () => {
    if (tareosFiltrados.length === 0) {
      mostrarMensaje('error', 'No hay registros disponibles para exportar.');
      return;
    }
    SaraTareoObraService.exportarTareoExcel(
      tareosFiltrados,
      resumen,
      proyectoActual.nombre,
      selectedFecha
    );
    mostrarMensaje('exito', 'Descarga de planilla Excel iniciada con membrete oficial.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      <TalentoSubNav activeRoute="/modulos/talento/asistencia" />

      {/* TOAST FLOTANTE ACCESIBLE */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 max-w-md animate-in slide-in-from-top-4 duration-300">
          <div className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 ${
            toast.tipo === 'exito'
              ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200'
              : toast.tipo === 'error'
              ? 'bg-rose-950/95 border-rose-500 text-rose-200'
              : 'bg-blue-950/95 border-blue-500 text-blue-200'
          }`}>
            {toast.tipo === 'exito' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
            ) : toast.tipo === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
            ) : (
              <HelpCircle className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
            )}
            <div className="flex-1 text-sm font-medium leading-relaxed">
              {toast.mensaje}
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* CONTENEDOR CENTRAL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* BREADCRUMB & NAVEGACIÓN SUPERIOR */}
        <div className="flex items-center justify-between gap-4 mb-4 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <Link href="/modulos/talento" className="hover:text-emerald-400 flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a SARA Talento</span>
            </Link>
            <span>/</span>
            <span className="text-emerald-400 font-semibold">Tareo Diario & Cuadrillas APU</span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/modulos/talento"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Radar Geográfico
            </Link>
            <span className="text-slate-700">•</span>
            <Link
              href="/modulos/talento/mi-perfil"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Portal del Trabajador
            </Link>
            <span className="text-slate-700">•</span>
            <Link
              href="/admin/talento"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Fiscalización Central
            </Link>
          </div>
        </div>

        {/* ENCABEZADO CORPORATIVO SARA CONSTRUCTORA */}
        <header className="mb-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
                <HardHat className="w-3.5 h-3.5" />
                <span>Gestión de Cuadrillas & Tareo de Obra • SBU 2026 $482.00 USD</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>Control de Asistencia & Mano de Obra APU</span>
                {resumen.estadoTareo === 'Validado por Fiscalización' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Validado Oficial
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    Borrador en Curso
                  </span>
                )}
              </h1>
              <p className="text-slate-400 text-sm mt-1.5 max-w-2xl leading-relaxed">
                Fiscalización diaria de horas normales (8h), suplementarias (50%) y extraordinarias (100%), provisión de cargas patronales IESS (12.15%) y auditoría de desviación de costos frente al APU.
              </p>
            </div>

            {/* BOTONES DE ACCIÓN PRINCIPALES */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setModalNuevaCuadrillaOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Nueva Cuadrilla</span>
              </button>

              <button
                onClick={() => setModalNuevoTrabajadorOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <UserCheck className="w-4 h-4 text-blue-400" />
                <span>+ Trabajador a Tareo</span>
              </button>

              <button
                onClick={handleExportarExcel}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all cursor-pointer"
                title="Descargar planilla de asistencia oficial en formato Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Exportar Excel</span>
              </button>

              <button
                onClick={() => setModalFirmarFiscalizacionOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition-all cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4 text-emerald-200" />
                <span>Firmar y Validar Tareo</span>
              </button>
            </div>
          </div>

          {/* BARRA DE FILTROS SUPERIORES: PROYECTO & FECHA */}
          <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Selector de Proyecto */}
            <div className="md:col-span-5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Proyecto de Obra Civil Activo</span>
              </label>
              <select
                value={selectedProyectoId}
                onChange={e => setSelectedProyectoId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                {proyectos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} • {p.nombre} ({p.ciudad})
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Fecha */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Fecha de Tareo</span>
              </label>
              <input
                type="date"
                value={selectedFecha}
                onChange={e => setSelectedFecha(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            {/* Búsqueda de Personal */}
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-purple-400" />
                <span>Buscar en Cuadrillas / Rubros</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nombre, albañil, fierrero, RUB-001..."
                  value={filtroTexto}
                  onChange={e => setFiltroTexto(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                {filtroTexto && (
                  <button
                    onClick={() => setFiltroTexto('')}
                    className="absolute right-3 top-3 text-slate-500 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* =================================================================== */}
        {/* RESUMEN EJECUTIVO DE MANO DE OBRA (KPI CARDS EN TIEMPO REAL)       */}
        {/* =================================================================== */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          
          {/* Card 1: Horas Hombre */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                Horas-Hombre del Día
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px]">
                {resumen.totalTrabajadores} operarios
              </span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              {resumen.totalHorasHombre.toFixed(1)} <span className="text-sm font-sans font-medium text-slate-400">H-H</span>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Norm: <b className="text-slate-200">{resumen.totalHorasNormales}h</b></span>
              <span>Supl 50%: <b className="text-amber-400">{resumen.totalHorasSuplementarias}h</b></span>
              <span>Ext 100%: <b className="text-rose-400">{resumen.totalHorasExtraordinarias}h</b></span>
            </div>
          </div>

          {/* Card 2: Costo Total Real Jornada */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-blue-400" />
                Costo Total Empresa
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                IESS + Provisiones
              </span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              ${resumen.costoTotalRealJornada.toFixed(2)} <span className="text-sm font-sans font-medium text-slate-400">USD</span>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Neto Obreros: <b className="text-slate-200">${resumen.totalNetoTrabajadores.toFixed(2)}</b></span>
              <span>Cargas Patronales: <b className="text-blue-400">${(resumen.totalAportePatronalIess + resumen.totalProvisionesSociales).toFixed(2)}</b></span>
            </div>
          </div>

          {/* Card 3: Desviación vs Presupuesto APU */}
          <div className={`bg-slate-900 border rounded-2xl p-5 shadow-lg relative overflow-hidden ${
            resumen.estadoGeneral === 'Sobrepresupuesto'
              ? 'border-rose-500/40 bg-gradient-to-b from-rose-950/20 to-slate-900'
              : resumen.estadoGeneral === 'Ahorro'
              ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 to-slate-900'
              : 'border-slate-800'
          }`}>
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Desviación vs APU
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                resumen.estadoGeneral === 'Sobrepresupuesto'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : resumen.estadoGeneral === 'Ahorro'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-300'
              }`}>
                {resumen.estadoGeneral}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <div className={`text-3xl font-extrabold font-mono tabular-nums tracking-tight ${
                resumen.desviacionTotalUSD > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {resumen.desviacionTotalUSD >= 0 ? '+' : ''}${resumen.desviacionTotalUSD.toFixed(2)}
              </div>
              <div className="text-xs font-mono font-bold text-slate-400">
                ({resumen.desviacionTotalPorcentaje >= 0 ? '+' : ''}{resumen.desviacionTotalPorcentaje.toFixed(1)}%)
              </div>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Presupuestado: <b className="text-slate-300">${resumen.costoTotalProyectadoApu.toFixed(2)}</b></span>
              <span>Margen: <b className="text-slate-200">SERCOP</b></span>
            </div>
          </div>

          {/* Card 4: Seguridad y Salud en el Trabajo (SST) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                Seguridad SST (Dec. 255)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 text-[10px] font-bold">
                Res. CD 513
              </span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              {resumen.porcentajeCumplimientoEpp}% <span className="text-sm font-sans font-medium text-slate-400">EPP Ok</span>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Trabajo Alturas: <b className="text-teal-300">{resumen.porcentajeSeguridadAlturas}%</b></span>
              <span>Cero Accidentes: <b className="text-emerald-400">100%</b></span>
            </div>
          </div>

        </section>

        {/* =================================================================== */}
        {/* NAVEGACIÓN POR PESTAÑAS DEL MÓDULO                                 */}
        {/* =================================================================== */}
        <div className="flex items-center justify-between border-b border-slate-800 mb-6">
          <div className="flex gap-2 text-sm font-semibold">
            <button
              onClick={() => setPestanaActiva('tareo')}
              className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
                pestanaActiva === 'tareo'
                  ? 'border-emerald-500 text-emerald-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Tareo Diario & Asistencia ({tareosFiltrados.length})</span>
            </button>

            <button
              onClick={() => setPestanaActiva('cuadrillas')}
              className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
                pestanaActiva === 'cuadrillas'
                  ? 'border-emerald-500 text-emerald-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Gestión de Cuadrillas ({cuadrillasDelProyecto.length})</span>
            </button>

            <button
              onClick={() => setPestanaActiva('analisis_costos')}
              className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
                pestanaActiva === 'analisis_costos'
                  ? 'border-emerald-500 text-emerald-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Auditoría Detallada IESS & APU</span>
            </button>
          </div>

          {/* Filtro por Cuadrilla dentro del tareo */}
          {pestanaActiva === 'tareo' && (
            <div className="hidden md:flex items-center gap-2 pb-2">
              <span className="text-xs text-slate-400 font-medium">Cuadrilla:</span>
              <select
                value={filtroCuadrilla}
                onChange={e => setFiltroCuadrilla(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="todas">Todas las cuadrillas</option>
                {cuadrillasDelProyecto.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* VISTA 1: TABLA DE ASISTENCIA Y CONTROL DE HORAS (TAREO DIARIO)     */}
        {/* =================================================================== */}
        {pestanaActiva === 'tareo' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            {tareosFiltrados.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-4 border border-slate-700">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  No hay registros de tareo para el {selectedFecha}
                </h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                  Puede cargar automáticamente una cuadrilla activa de la obra o registrar operarios manualmente.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {cuadrillasDelProyecto.length > 0 && (
                    <button
                      onClick={() => handleCargarCuadrillaAlTareo(cuadrillasDelProyecto[0])}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
                    >
                      <Users className="w-4 h-4" />
                      <span>Cargar Cuadrilla "{cuadrillasDelProyecto[0].nombre}"</span>
                    </button>
                  )}
                  <button
                    onClick={() => setModalNuevoTrabajadorOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Operario Manual</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                      <th className="py-3.5 px-4">Operario & Cédula</th>
                      <th className="py-3.5 px-4">Rol / Especialidad</th>
                      <th className="py-3.5 px-4 min-w-[200px]">Rubro de Obra APU</th>
                      <th className="py-3.5 px-3 text-center">H. Normal (8h)</th>
                      <th className="py-3.5 px-3 text-center">H. Supl (50%)</th>
                      <th className="py-3.5 px-3 text-center">H. Extra (100%)</th>
                      <th className="py-3.5 px-3 text-center font-mono">Total H-H</th>
                      <th className="py-3.5 px-4 text-right">Costo Real ($)</th>
                      <th className="py-3.5 px-4 text-right">APU ($)</th>
                      <th className="py-3.5 px-3 text-center">SST / EPP</th>
                      <th className="py-3.5 px-3 text-center">Estado</th>
                      <th className="py-3.5 px-3 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {detalles.map((d) => {
                      const itemTareo = tareosFiltrados.find(t => t.id === d.registroId);
                      return (
                        <tr key={d.registroId} className="hover:bg-slate-800/40 transition-colors">
                          
                          {/* Operario y Cédula enmascarada */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white text-sm">
                              {d.nombreTrabajador}
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono mt-0.5">
                              <span>CI: {d.cedulaEnmascarada}</span>
                              {itemTareo?.cuadrillaNombre && (
                                <span className="text-purple-400 bg-purple-500/10 px-1.5 py-0.2 rounded text-[10px]">
                                  {itemTareo.cuadrillaNombre.split('-')[0].trim()}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Rol */}
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold border border-slate-700/60">
                              {d.rol}
                            </span>
                            <div className="text-[10px] text-slate-500 mt-1 font-mono">
                              Tarifa: ${d.tarifaHoraBase.toFixed(2)}/h
                            </div>
                          </td>

                          {/* Selector de Rubro APU */}
                          <td className="py-3.5 px-4">
                            <select
                              value={itemTareo?.rubroCodigo || 'RUB-001'}
                              onChange={e => handleCambiarRubro(d.registroId, e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg text-slate-200 text-xs px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
                            >
                              {rubros.map(r => (
                                <option key={r.codigo} value={r.codigo}>
                                  {r.codigo}: {r.descripcion.slice(0, 42)}... (${r.costoHoraHombreApuUSD.toFixed(2)}/hh)
                                </option>
                              ))}
                            </select>
                            {itemTareo && (
                              <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                                <span>Rend: {rubros.find(r => r.codigo === itemTareo.rubroCodigo)?.rendimientoTeoricoHhPorUnidad} hh/unid</span>
                                {rubros.find(r => r.codigo === itemTareo.rubroCodigo)?.requiereSeguridadAlturas && (
                                  <span className="text-teal-400 font-semibold">Requiere Alturas</span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Horas Normales */}
                          <td className="py-3.5 px-3 text-center">
                            <div className="inline-flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5 font-mono">
                              <button
                                onClick={() => handleActualizarHoras(d.registroId, 'horasNormales', -1)}
                                className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-slate-800 font-bold"
                              >
                                -
                              </button>
                              <span className="w-6 text-center font-bold text-white text-xs">
                                {d.horasNormales}
                              </span>
                              <button
                                onClick={() => handleActualizarHoras(d.registroId, 'horasNormales', 1)}
                                className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-slate-800 font-bold"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Horas Suplementarias 50% */}
                          <td className="py-3.5 px-3 text-center">
                            <div className="inline-flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5 font-mono">
                              <button
                                onClick={() => handleActualizarHoras(d.registroId, 'horasSuplementarias', -1)}
                                className="w-5 h-5 flex items-center justify-center text-amber-500 hover:text-white rounded hover:bg-slate-800 font-bold"
                              >
                                -
                              </button>
                              <span className="w-6 text-center font-bold text-amber-400 text-xs">
                                {d.horasSuplementarias}
                              </span>
                              <button
                                onClick={() => handleActualizarHoras(d.registroId, 'horasSuplementarias', 1)}
                                className="w-5 h-5 flex items-center justify-center text-amber-500 hover:text-white rounded hover:bg-slate-800 font-bold"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Horas Extraordinarias 100% */}
                          <td className="py-3.5 px-3 text-center">
                            <div className="inline-flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5 font-mono">
                              <button
                                onClick={() => handleActualizarHoras(d.registroId, 'horasExtraordinarias', -1)}
                                className="w-5 h-5 flex items-center justify-center text-rose-500 hover:text-white rounded hover:bg-slate-800 font-bold"
                              >
                                -
                              </button>
                              <span className="w-6 text-center font-bold text-rose-400 text-xs">
                                {d.horasExtraordinarias}
                              </span>
                              <button
                                onClick={() => handleActualizarHoras(d.registroId, 'horasExtraordinarias', 1)}
                                className="w-5 h-5 flex items-center justify-center text-rose-500 hover:text-white rounded hover:bg-slate-800 font-bold"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Total Horas */}
                          <td className="py-3.5 px-3 text-center font-mono font-bold text-white text-sm">
                            {d.totalHoras}h
                          </td>

                          {/* Costo Real Empresa ($) */}
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                            <div className="font-extrabold text-white text-sm">
                              ${d.costoRealEmpresaTotal.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              (IESS: ${d.aporteIessPatronal.toFixed(2)})
                            </div>
                          </td>

                          {/* Costo Proyectado APU ($) & Desviación */}
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                            <div className="font-bold text-slate-300">
                              ${d.costoTotalProyectadoApu.toFixed(2)}
                            </div>
                            <div className={`text-[10px] font-bold ${
                              d.desviacionCostoUSD > 0 ? 'text-rose-400' : 'text-emerald-400'
                            }`}>
                              {d.desviacionCostoUSD >= 0 ? '+' : ''}${d.desviacionCostoUSD.toFixed(2)} ({d.desviacionPorcentaje.toFixed(1)}%)
                            </div>
                          </td>

                          {/* Checkboxes SST: EPP y Alturas */}
                          <td className="py-3.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {/* EPP Checkbox */}
                              <button
                                onClick={() => handleToggleSST(d.registroId, 'cumpleEPP')}
                                title="Cumplimiento EPP Decreto 255"
                                className={`p-1.5 rounded-lg border transition-all ${
                                  d.cumpleEPP
                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                    : 'bg-rose-500/20 border-rose-500 text-rose-400'
                                }`}
                              >
                                <HardHat className="w-3.5 h-3.5" />
                              </button>

                              {/* Alturas Checkbox */}
                              <button
                                onClick={() => handleToggleSST(d.registroId, 'cumpleSeguridadAlturas')}
                                title="Seguridad en Alturas Res. CD 513 IESS"
                                className={`p-1.5 rounded-lg border transition-all ${
                                  d.cumpleSeguridadAlturas
                                    ? 'bg-teal-500/20 border-teal-500 text-teal-400'
                                    : 'bg-amber-500/20 border-amber-500 text-amber-400'
                                }`}
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Estado de Validación */}
                          <td className="py-3.5 px-3 text-center">
                            {d.validado ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                <Check className="w-3 h-3" />
                                Firmado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                                Pendiente
                              </span>
                            )}
                          </td>

                          {/* Acción eliminar */}
                          <td className="py-3.5 px-3 text-center">
                            <button
                              onClick={() => handleEliminarRegistro(d.registroId)}
                              title="Remover operario de la jornada"
                              className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* VISTA 2: GESTIÓN DE CUADRILLAS DE OBRA                             */}
        {/* =================================================================== */}
        {pestanaActiva === 'cuadrillas' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>Cuadrillas Asignadas a {proyectoActual.nombre}</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Estructura de equipos operativos liderados por Maestros Mayores certificados.
                </p>
              </div>
              <button
                onClick={() => setModalNuevaCuadrillaOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Nueva Cuadrilla</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {cuadrillasDelProyecto.map(c => (
                <div
                  key={c.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {c.especialidad}
                        </span>
                        <h4 className="text-base font-extrabold text-white mt-1.5">
                          {c.nombre}
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {c.estado}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 mb-4">
                      <div className="text-[11px] text-slate-400">Maestro Líder de Cuadrilla:</div>
                      <div className="font-bold text-white text-sm flex items-center gap-1.5 mt-0.5">
                        <Award className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{c.maestroLiderNombre}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Certificación SECAP • Rendimiento Histórico: {c.rendimientoHistorico}%
                      </div>
                    </div>

                    <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                      <span>Integrantes ({c.integrantes.length})</span>
                      <span className="text-slate-500 text-[10px]">Cédulas Enmascaradas</span>
                    </div>

                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {c.integrantes.map(integ => (
                        <div
                          key={integ.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-200">{integ.nombre}</span>
                            <span className="text-slate-400 text-[10px] ml-1.5">({integ.rol})</span>
                          </div>
                          <div className="text-right font-mono text-[11px] text-slate-400">
                            {SaraTareoObraService.enmascararCedula(integ.cedula)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                    <button
                      onClick={() => handleCargarCuadrillaAlTareo(c)}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 hover:border-emerald-500 transition-all cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Tarear Cuadrilla Completa</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* VISTA 3: AUDITORÍA DETALLADA IESS & COMPARATIVA APU                */}
        {/* =================================================================== */}
        {pestanaActiva === 'analisis_costos' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-400" />
                <span>Desglose de Cargas Patronales y Provisión de Ley (Ecuador 2026)</span>
              </h3>
              <p className="text-slate-400 text-xs mb-6 max-w-3xl leading-relaxed">
                Bajo el Código del Trabajo del Ecuador y la Ley de Seguridad Social, el costo hora cargado al APU de la obra no es solo el jornal líquido, sino que incluye el 12.15% patronal IESS/SECAP, Fondo de Reserva (8.33%), Décimo Tercero, Décimo Cuarto (SBU 2026 $482.00) y Vacaciones (4.16%).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 font-bold">Materia Gravada (Jornal + Recargos)</div>
                  <div className="text-xl font-extrabold text-white font-mono mt-1">${resumen.totalMateriaGravada.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Base de aportación IESS</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 font-bold">Aporte Patronal (12.15%)</div>
                  <div className="text-xl font-extrabold text-blue-400 font-mono mt-1">${resumen.totalAportePatronalIess.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-500 mt-1">11.15% IESS + 0.5% SECAP + 0.5% IECE</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 font-bold">Aporte Personal Trabajador (9.45%)</div>
                  <div className="text-xl font-extrabold text-amber-400 font-mono mt-1">${resumen.totalAportePersonalIess.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Descuento en rol de pago</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 font-bold">Provisiones Sociales Acumuladas</div>
                  <div className="text-xl font-extrabold text-purple-400 font-mono mt-1">${resumen.totalProvisionesSociales.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Fondos Reserva + Décimos + Vacaciones</div>
                </div>
              </div>

              {/* Tabla Detallada por Trabajador */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-3">Operario</th>
                      <th className="py-3 px-3 text-right">Materia Gravada</th>
                      <th className="py-3 px-3 text-right">Aporte Patr. 12.15%</th>
                      <th className="py-3 px-3 text-right">Fondo Res. 8.33%</th>
                      <th className="py-3 px-3 text-right">13º Sueldo</th>
                      <th className="py-3 px-3 text-right">14º Sueldo (SBU 482)</th>
                      <th className="py-3 px-3 text-right">Vacaciones</th>
                      <th className="py-3 px-3 text-right">Costo Real Empresa</th>
                      <th className="py-3 px-3 text-right">APU Presupuesto</th>
                      <th className="py-3 px-3 text-right">Desviación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
                    {detalles.map(d => (
                      <tr key={d.registroId} className="hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-sans font-bold text-white">
                          {d.nombreTrabajador}
                          <div className="text-[10px] text-slate-400 font-mono font-normal">{d.rol}</div>
                        </td>
                        <td className="py-3 px-3 text-right text-slate-200">${d.subtotalMateriaGravada.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right text-blue-400">${d.aporteIessPatronal.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right text-slate-300">${d.provisionFondoReserva.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right text-slate-300">${d.provisionDecimoTercero.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right text-slate-300">${d.provisionDecimoCuarto.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right text-slate-300">${d.provisionVacaciones.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right font-extrabold text-emerald-400">${d.costoRealEmpresaTotal.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right text-slate-300">${d.costoTotalProyectadoApu.toFixed(2)}</td>
                        <td className={`py-3 px-3 text-right font-bold ${
                          d.desviacionCostoUSD > 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {d.desviacionCostoUSD >= 0 ? '+' : ''}${d.desviacionCostoUSD.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: NUEVA CUADRILLA DE TRABAJO                                   */}
      {/* ===================================================================== */}
      {modalNuevaCuadrillaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Crear Nueva Cuadrilla de Obra</h3>
                  <p className="text-slate-400 text-xs">Asignada a: {proyectoActual.nombre}</p>
                </div>
              </div>
              <button
                onClick={() => setModalNuevaCuadrillaOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGuardarNuevaCuadrilla} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Nombre de la Cuadrilla</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cuadrilla Delta - Mampostería y Bloque"
                  value={formCuadrilla.nombre}
                  onChange={e => setFormCuadrilla({ ...formCuadrilla, nombre: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Especialidad Operativa</label>
                  <select
                    value={formCuadrilla.especialidad}
                    onChange={e => setFormCuadrilla({ ...formCuadrilla, especialidad: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-xs"
                  >
                    <option value="Estructuras y Hormigón">Estructuras y Hormigón</option>
                    <option value="Albañilería y Acabados">Albañilería y Acabados</option>
                    <option value="Fierrería y Armado">Fierrería y Armado</option>
                    <option value="Encofrado">Encofrado</option>
                    <option value="Obras Preliminares">Obras Preliminares</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Tarifa Maestro Líder ($/h)</label>
                  <input
                    type="number"
                    step="0.10"
                    min="3.88"
                    value={formCuadrilla.maestroLiderTarifa}
                    onChange={e => setFormCuadrilla({ ...formCuadrilla, maestroLiderTarifa: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Maestro Líder */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>Maestro Mayor / Líder de Cuadrilla</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Mstr. Jorge Tenesaca"
                      value={formCuadrilla.maestroLiderNombre}
                      onChange={e => setFormCuadrilla({ ...formCuadrilla, maestroLiderNombre: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Cédula de Identidad</label>
                    <input
                      type="text"
                      placeholder="0104829145"
                      value={formCuadrilla.maestroLiderCedula}
                      onChange={e => setFormCuadrilla({ ...formCuadrilla, maestroLiderCedula: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Integrantes */}
              <div>
                <label className="block font-bold text-slate-300 mb-2">Integrantes de Cuadrilla (Oficiales y Peones)</label>
                <div className="space-y-2">
                  {formCuadrilla.integrantes.map((integ, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder={`Nombre operario ${idx + 1}`}
                          value={integ.nombre}
                          onChange={e => {
                            const newInt = [...formCuadrilla.integrantes];
                            newInt[idx].nombre = e.target.value;
                            setFormCuadrilla({ ...formCuadrilla, integrantes: newInt });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                        />
                      </div>
                      <div className="col-span-3">
                        <select
                          value={integ.rol}
                          onChange={e => {
                            const newInt = [...formCuadrilla.integrantes];
                            newInt[idx].rol = e.target.value as any;
                            newInt[idx].tarifa = e.target.value === 'Peón' ? 3.10 : 3.50;
                            setFormCuadrilla({ ...formCuadrilla, integrantes: newInt });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs"
                        >
                          <option value="Albañil">Albañil</option>
                          <option value="Fierrero">Fierrero</option>
                          <option value="Encofrador">Encofrador</option>
                          <option value="Peón">Peón</option>
                        </select>
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="Cédula"
                          value={integ.cedula}
                          onChange={e => {
                            const newInt = [...formCuadrilla.integrantes];
                            newInt[idx].cedula = e.target.value;
                            setFormCuadrilla({ ...formCuadrilla, integrantes: newInt });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs font-mono"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const newInt = formCuadrilla.integrantes.filter((_, i) => i !== idx);
                            setFormCuadrilla({ ...formCuadrilla, integrantes: newInt });
                          }}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFormCuadrilla({
                      ...formCuadrilla,
                      integrantes: [
                        ...formCuadrilla.integrantes,
                        { nombre: '', cedula: '', rol: 'Peón', tarifa: 3.10 }
                      ]
                    });
                  }}
                  className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>+ Agregar otro integrante</span>
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalNuevaCuadrillaOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg"
                >
                  Guardar Cuadrilla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: AGREGAR TRABAJADOR A LA JORNADA DE HOY                      */}
      {/* ===================================================================== */}
      {modalNuevoTrabajadorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Ingresar Operario al Tareo del Día</h3>
                  <p className="text-slate-400 text-xs">{selectedFecha} • {proyectoActual.nombre}</p>
                </div>
              </div>
              <button
                onClick={() => setModalNuevoTrabajadorOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGuardarNuevoTrabajadorTareo} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Milton Eduardo Yánez"
                    value={formTrabajadorTareo.nombre}
                    onChange={e => setFormTrabajadorTareo({ ...formTrabajadorTareo, nombre: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Cédula de Identidad</label>
                  <input
                    type="text"
                    placeholder="1719283741"
                    value={formTrabajadorTareo.cedula}
                    onChange={e => setFormTrabajadorTareo({ ...formTrabajadorTareo, cedula: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Categoría / Rol</label>
                  <select
                    value={formTrabajadorTareo.rol}
                    onChange={e => {
                      const r = e.target.value;
                      let t = 3.50;
                      if (r === 'Maestro Mayor') t = 4.80;
                      if (r === 'Fierrero' || r === 'Encofrador') t = 3.80;
                      if (r === 'Peón') t = 3.10;
                      setFormTrabajadorTareo({ ...formTrabajadorTareo, rol: r, tarifaBaseHora: t });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    <option value="Maestro Mayor">Maestro Mayor</option>
                    <option value="Fierrero">Fierrero</option>
                    <option value="Encofrador">Encofrador</option>
                    <option value="Albañil">Albañil</option>
                    <option value="Peón">Peón</option>
                    <option value="Topógrafo">Topógrafo</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Tarifa Base ($/h)</label>
                  <input
                    type="number"
                    step="0.10"
                    min="3.01"
                    value={formTrabajadorTareo.tarifaBaseHora}
                    onChange={e => setFormTrabajadorTareo({ ...formTrabajadorTareo, tarifaBaseHora: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Rubro de Obra APU Vinculado</label>
                <select
                  value={formTrabajadorTareo.rubroCodigo}
                  onChange={e => setFormTrabajadorTareo({ ...formTrabajadorTareo, rubroCodigo: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                >
                  {rubros.map(r => (
                    <option key={r.codigo} value={r.codigo}>
                      {r.codigo}: {r.descripcion} (${r.costoHoraHombreApuUSD.toFixed(2)}/hh)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Horas Normales</label>
                  <input
                    type="number"
                    min="0"
                    max="8"
                    value={formTrabajadorTareo.horasNormales}
                    onChange={e => setFormTrabajadorTareo({ ...formTrabajadorTareo, horasNormales: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">H. Suplementarias (50%)</label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    value={formTrabajadorTareo.horasSuplementarias}
                    onChange={e => setFormTrabajadorTareo({ ...formTrabajadorTareo, horasSuplementarias: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">H. Extras (100%)</label>
                  <input
                    type="number"
                    min="0"
                    max="8"
                    value={formTrabajadorTareo.horasExtraordinarias}
                    onChange={e => setFormTrabajadorTareo({ ...formTrabajadorTareo, horasExtraordinarias: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono"
                  />
                </div>
              </div>

              {/* Checkboxes SST */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formTrabajadorTareo.cumpleEPP}
                    onChange={e => setFormTrabajadorTareo({ ...formTrabajadorTareo, cumpleEPP: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-slate-300 font-semibold text-xs">EPP Completo (Dec. 255)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formTrabajadorTareo.cumpleSeguridadAlturas}
                    onChange={e => setFormTrabajadorTareo({ ...formTrabajadorTareo, cumpleSeguridadAlturas: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-teal-500"
                  />
                  <span className="text-slate-300 font-semibold text-xs">Seguridad en Alturas</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalNuevoTrabajadorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg"
                >
                  Agregar a Jornada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: FIRMAR Y VALIDAR TAREO DIARIO (FISCALIZACIÓN)                */}
      {/* ===================================================================== */}
      {modalFirmarFiscalizacionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Certificación y Firma de Fiscalización</h3>
                  <p className="text-slate-400 text-xs">{selectedFecha} • {proyectoActual.nombre}</p>
                </div>
              </div>
              <button
                onClick={() => setModalFirmarFiscalizacionOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Operarios en Obra:</span>
                  <b className="text-white font-mono">{resumen.totalTrabajadores} personas</b>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Total Horas-Hombre (H-H):</span>
                  <b className="text-white font-mono">{resumen.totalHorasHombre} horas</b>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Costo Total a Certificar:</span>
                  <b className="text-emerald-400 font-mono text-sm">${resumen.costoTotalRealJornada.toFixed(2)} USD</b>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Desviación Presupuesto APU:</span>
                  <b className={resumen.desviacionTotalUSD > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                    {resumen.desviacionTotalUSD >= 0 ? '+' : ''}${resumen.desviacionTotalUSD.toFixed(2)} ({resumen.desviacionTotalPorcentaje.toFixed(1)}%)
                  </b>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Nombre del Fiscalizador / Residente</label>
                <input
                  type="text"
                  value={formFiscalizador.nombre}
                  onChange={e => setFormFiscalizador({ ...formFiscalizador, nombre: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Cargo y Matrícula Profesional</label>
                <input
                  type="text"
                  value={formFiscalizador.cargo}
                  onChange={e => setFormFiscalizador({ ...formFiscalizador, cargo: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-[11px] leading-relaxed">
                <b>Declaración Juramentada de Obra:</b> Certifico que el personal registrado cumplió con las jornadas estipuladas, las normas de seguridad del Decreto Ejecutivo 255 y la Resolución CD 513 del IESS, y que las horas suplementarias/extraordinarias corresponden a actividades efectivas en los rubros de obra civil autorizados.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalFirmarFiscalizacionOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleEjecutarFirmaFiscalizacion}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg flex items-center gap-2"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Firmar Electrónicamente</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
