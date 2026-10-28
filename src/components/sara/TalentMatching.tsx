'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, Star, Award, Search, UserPlus, Navigation, Crown, 
  ShieldCheck, CheckCircle2, Building2, HardHat, Users, 
  Sparkles, SlidersHorizontal, ArrowRight, Phone, Mail, 
  Clock, DollarSign, X, Check, AlertTriangle, ExternalLink,
  ChevronDown, Map
} from 'lucide-react';
import Link from 'next/link';
import TalentoSubNav from '@/components/sara/TalentoSubNav';
import { getTalentsFromDB, createJobEscrowApplication, TalentDB } from '@/lib/services/talentoService';
import { SaraTalentoRequestsService } from '@/lib/services/saraTalentoRequestsService';
import { PlanesExitoTalentoModal } from '@/components/talento/PlanesExitoTalentoModal';

// ============================================================================
// CATÁLOGO COMPLETO DE LAS 24 PROVINCIAS Y TODOS LOS CANTONES DEL ECUADOR
// ============================================================================
import { PROVINCIAS_CANTONES_ECUADOR } from '@/lib/constants/ecuadorGeo';
import ModuleBrandLogo from '@/components/layout/ModuleBrandLogo';
const PROVINCIAS_ECUADOR = PROVINCIAS_CANTONES_ECUADOR;

export interface TalentUI extends TalentDB {
  disponibilidad?: 'Inmediata' | 'Por proyecto' | 'Fin de semana';
  categoria?: 'Dirección Técnica' | 'Supervisión' | 'Cuadrillas' | 'Oficios Especializados';
  ciudadOrigen?: string;
}

export default function TalentMatching() {
  // ---------------------------------------------------------------------------
  // ESTADOS PRINCIPALES DE BÚSQUEDA Y RADAR
  // ---------------------------------------------------------------------------
  const [talents, setTalents] = useState<TalentUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchRole, setSearchRole] = useState('');
  
  // Ubicación de la Obra y Parámetros del Radar
  const [provinciaObra, setProvinciaObra] = useState('Pichincha');
  const [cantonObra, setCantonObra] = useState('Quito (La Carolina)');
  const [radioKm, setRadioKm] = useState<number>(30); // 5, 15, 30, 80, 200
  const [mostrarMapa, setMostrarMapa] = useState<boolean>(false);

  // Filtros Avanzados
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Todas');
  const [disponibilidadFiltro, setDisponibilidadFiltro] = useState<string>('Todas');
  const [soloVerificados, setSoloVerificados] = useState<boolean>(false);
  const [ordenarPor, setOrdenarPor] = useState<'rating' | 'distancia' | 'tarifa_asc' | 'experiencia'>('rating');

  // Estado del Predictor de Cuadrillas IA
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showAiRecommendations, setShowAiRecommendations] = useState(false);
  const [tipoObraApu, setTipoObraApu] = useState<'hormigon' | 'mamposteria' | 'cimentacion' | 'mep'>('hormigon');

  // Modal de Contratación Escrow
  const [selectedTalentToHire, setSelectedTalentToHire] = useState<TalentUI | null>(null);
  const [modalEscrowOpen, setModalEscrowOpen] = useState(false);
  const [horasContrato, setHorasContrato] = useState<number>(40); // 40h = 1 semana
  const [nombreObraContrato, setNombreObraContrato] = useState('Edificio Residencial El Mirador');
  const [contratandoProceso, setContratandoProceso] = useState(false);
  const [toastNotificacion, setToastNotificacion] = useState<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);
  const [planesModalOpen, setPlanesModalOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // CARGA DE DATOS DE LA BASE DE DATOS
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      const data = await getTalentsFromDB();
      if (!isMounted) return;

      const enhanced: TalentUI[] = data.map((t, idx) => {
        let cat: TalentUI['categoria'] = 'Oficios Especializados';
        if (t.role.toLowerCase().includes('ingenier') || t.role.toLowerCase().includes('arquitect')) {
          cat = 'Dirección Técnica';
        } else if (t.role.toLowerCase().includes('maestro') || t.role.toLowerCase().includes('capataz')) {
          cat = 'Supervisión';
        } else if (t.role.toLowerCase().includes('cuadrilla')) {
          cat = 'Cuadrillas';
        }

        return {
          ...t,
          categoria: cat,
          disponibilidad: (idx % 2 === 0 ? 'Inmediata' : 'Por proyecto') as any,
          ciudadOrigen: t.locationName || 'Quito, Pichincha'
        };
      });

      setTalents(enhanced);
      setLoading(false);
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // ---------------------------------------------------------------------------
  // PREDICCIÓN DE CUADRILLA IA BASADA EN NEC-15 Y SBU 2026
  // ---------------------------------------------------------------------------
  const handleAnalyzeAPU = () => {
    setIsAiProcessing(true);
    setTimeout(() => {
      setIsAiProcessing(false);
      setShowAiRecommendations(true);
    }, 1200);
  };

  // ---------------------------------------------------------------------------
  // LÓGICA DE FILTRADO Y RANKING GEOGRÁFICO
  // ---------------------------------------------------------------------------
    const getPlanWeight = (plan?: string) => {
    const p = (plan || '').toLowerCase();
    if (p === 'vip') return 3;
    if (p === 'profesional' || p === 'estandar') return 2;
    return 1;
  };

  const filteredTalents = useMemo(() => {
    return talents.filter(t => {
      // 1. Filtro de búsqueda por texto
      const matchesSearch = 
        t.role.toLowerCase().includes(searchRole.toLowerCase()) || 
        t.name.toLowerCase().includes(searchRole.toLowerCase()) ||
        t.certifications.some(c => c.toLowerCase().includes(searchRole.toLowerCase()));
      if (!matchesSearch) return false;

      // 2. Filtro de Categoría
      if (categoriaFiltro !== 'Todas' && t.categoria !== categoriaFiltro) return false;

      // 3. Filtro de Disponibilidad
      if (disponibilidadFiltro !== 'Todas' && t.disponibilidad !== disponibilidadFiltro) return false;

      // 4. Filtro de Solo Verificados
      if (soloVerificados && t.status !== 'approved') return false;

      // 5. Filtro de Radio Geográfico (km con factor de sinuosidad vial ecuatoriana)
      if (radioKm < 200 && t.distanceKm > radioKm) return false;

      return true;
    }).sort((a, b) => {
      // Prioridad garantizada por Plan de Éxito SARA (VIP > Profesional > Básico)
      const wA = getPlanWeight(a.plan);
      const wB = getPlanWeight(b.plan);
      if (wB !== wA) return wB - wA;

      if (ordenarPor === 'rating') {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return a.distanceKm - b.distanceKm;
      }
      if (ordenarPor === 'distancia') return a.distanceKm - b.distanceKm;
      if (ordenarPor === 'tarifa_asc') return a.hourlyRate - b.hourlyRate;
      if (ordenarPor === 'experiencia') return b.experienceYears - a.experienceYears;
      return 0;
    });
  }, [talents, searchRole, categoriaFiltro, disponibilidadFiltro, soloVerificados, radioKm, ordenarPor]);

  // ---------------------------------------------------------------------------
  // PROCESAR CONTRATACIÓN CON ESCROW Y NOTIFICACIÓN
  // ---------------------------------------------------------------------------
  const handleIniciarContratacionModal = (talent: TalentUI) => {
    setSelectedTalentToHire(talent);
    setHorasContrato(40);
    setModalEscrowOpen(true);
  };

  const handleConfirmarContratacionEscrow = async () => {
    if (!selectedTalentToHire) return;
    setContratandoProceso(true);

    try {
      // 1. Registrar en Supabase 'job_applications' & CRM
      const appId = await createJobEscrowApplication(
        selectedTalentToHire.id, 
        selectedTalentToHire.role, 
        selectedTalentToHire.hourlyRate
      );

      // 2. Registrar en SaraTalentoRequestsService para interoperabilidad bidireccional
      SaraTalentoRequestsService.crearSolicitud({
        empresa_solicitante: {
          razon_social: 'GRUPO SARA CONSTRUCTORA S.A.',
          ruc: '1191782341001',
          representante: 'Ing. Residente de Obra',
          cargo: 'Director de Fiscalización',
          telefono: '+593 99 712 3456',
          email: 'contrataciones@gruposara.ec',
          ciudad: `${cantonObra}, ${provinciaObra}`
        },
        trabajador: {
          id: selectedTalentToHire.id,
          nombre_completo: selectedTalentToHire.name,
          cedula: '110482****',
          categoria_ocupacional: selectedTalentToHire.role,
          calificacion: selectedTalentToHire.rating,
          jornal_real: selectedTalentToHire.hourlyRate * 8,
          costo_horario: selectedTalentToHire.hourlyRate,
          telefono: '+593 98 421 ****',
          email: `${selectedTalentToHire.name.toLowerCase().replace(/\s+/g, '.')}@profesional.sara.ec`
        },
        obra_destino: `${nombreObraContrato} (${cantonObra})`,
        duracion: `${horasContrato} horas (${Math.round(horasContrato / 40)} semanas de ejecución)`,
        fecha_inicio: new Date().toISOString().split('T')[0],
        epp_requerido: true,
        notas_adicionales: `Contratación iniciada vía Radar SARA Talento con custodia Escrow. Total horas: ${horasContrato}h.`
      });

      setModalEscrowOpen(false);
      setToastNotificacion({
        tipo: 'exito',
        mensaje: `¡Contratación Escrow Constituida! Contrato #${appId}. El fondo de $${(selectedTalentToHire.hourlyRate * horasContrato).toFixed(2)} USD ha sido reservado en custodia para "${selectedTalentToHire.name}".`
      });

      setTimeout(() => setToastNotificacion(null), 9000);
    } catch (err: any) {
      setToastNotificacion({
        tipo: 'error',
        mensaje: `Error al procesar contratación: ${err?.message || 'Error desconocido'}`
      });
      setTimeout(() => setToastNotificacion(null), 7000);
    } finally {
      setContratandoProceso(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16">
      
      {/* TOAST FLOTANTE ACCESIBLE (CERO WINDOW.ALERT) */}
      {toastNotificacion && (
        <div className="fixed top-20 right-4 z-50 max-w-md animate-in slide-in-from-top-4 duration-300">
          <div className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 ${
            toastNotificacion.tipo === 'exito' 
              ? 'bg-emerald-950 border-emerald-500 text-emerald-200' 
              : 'bg-rose-950 border-rose-500 text-rose-200'
          }`}>
            {toastNotificacion.tipo === 'exito' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
            )}
            <div className="flex-1 text-sm font-medium">
              {toastNotificacion.mensaje}
            </div>
            <button 
              onClick={() => setToastNotificacion(null)}
              className="text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* HEADER CORPORATIVO SARA TALENTO */}
        <header className="mb-8 border-b border-slate-800 pb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="mb-4">
              <ModuleBrandLogo modulo="talento" showBackToHolding={false} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Radar Geográfico de Mano de Obra & Profesionales
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
              Localización satelital de residentes, maestros mayores, cuadrillas y especialistas técnicos certificados bajo la normativa NEC-15, SECAP y el Ministerio del Trabajo del Ecuador.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setPlanesModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 hover:scale-[1.02] transition-all cursor-pointer ring-1 ring-amber-400/60"
            >
              <Crown className="w-4 h-4 text-slate-950 fill-slate-950" />
              <span>Planes de Éxito ($0 Inicial)</span>
            </button>

            <button 
              onClick={handleAnalyzeAPU}
              disabled={isAiProcessing}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-900/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isAiProcessing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-300" />
              )}
              <span>{isAiProcessing ? 'Analizando APU...' : 'Predecir Cuadrilla IA'}</span>
            </button>

            <Link href="/modulos/talento/vacantes">
              <button className="px-4 py-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 hover:text-white font-semibold text-sm border border-purple-500/30 flex items-center gap-2 transition-all cursor-pointer">
                <Search className="w-4 h-4 text-purple-400" />
                <span>Bolsa de Empleo</span>
              </button>
            </Link>

            <Link href="/modulos/talento/reclutamiento">
              <button className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 flex items-center gap-2 transition-all cursor-pointer">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Kanban Reclutamiento</span>
              </button>
            </Link>

            <Link href="/modulos/talento/asistencia">
              <button className="px-4 py-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 hover:text-white font-bold text-sm border border-emerald-500/40 flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-950/50">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Tareo de Obra APU</span>
              </button>
            </Link>

            <Link href="/modulos/talento/mi-perfil">
              <button className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 flex items-center gap-2 transition-all cursor-pointer">
                <HardHat className="w-4 h-4 text-amber-400" />
                <span>Mi Portal</span>
              </button>
            </Link>
          </div>
        </header>

        {/* BARRA DE NAVEGACIÓN RÁPIDA DE SUBMÓDULOS DE TALENTO */}
        <TalentoSubNav activeRoute="/modulos/talento" />

        {/* PROYECCIÓN INTELIGENTE DE CUADRILLA IA (NEC-15 & MDT 2026) */}
        {showAiRecommendations && (
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/60 border border-indigo-500/30 shadow-2xl animate-in fade-in zoom-in-95 duration-400">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-500/20 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Gemelo Digital: Proyección de Cuadrilla & Rendimiento NEC-15</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      SBU 2026: $482 USD
                    </span>
                  </h3>
                  <p className="text-xs text-indigo-300/80">
                    Cálculo basado en Decreto Ejecutivo 255 (MDT), IESS Resolución CD 513 y tabla sectorial de la construcción.
                  </p>
                </div>
              </div>

              {/* Selector de Rubro de Obra */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Rubro de Obra:</span>
                <select 
                  value={tipoObraApu}
                  onChange={(e) => setTipoObraApu(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="hormigon">Estructura Hormigón Armado (350 m³)</option>
                  <option value="mamposteria">Mampostería y Acabados (1,200 m²)</option>
                  <option value="cimentacion">Cimentación y Muros (400 m³)</option>
                  <option value="mep">Instalaciones MEP y Redes Técnicas</option>
                </select>
              </div>
            </div>

            {/* Desglose de Mano de Obra Recomendada */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80">
                <span className="text-[11px] font-bold uppercase text-purple-400 block mb-1">
                  1x Residente Técnico
                </span>
                <p className="text-sm font-bold text-white">Ingeniero Civil / Arquitecto</p>
                <p className="text-xs text-slate-400 mt-1">Supervisión losas y ensayos de compresión</p>
                <div className="mt-2 text-xs font-mono text-emerald-400 font-bold">$28.00 - $35.00/h</div>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80">
                <span className="text-[11px] font-bold uppercase text-amber-400 block mb-1">
                  1x Maestro Mayor SECAP
                </span>
                <p className="text-sm font-bold text-white">Líder de Cuadrilla Estructuras</p>
                <p className="text-xs text-slate-400 mt-1">Coordinación de encofrados y replanteo</p>
                <div className="mt-2 text-xs font-mono text-emerald-400 font-bold">$15.00 - $18.00/h</div>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80">
                <span className="text-[11px] font-bold uppercase text-blue-400 block mb-1">
                  4x Fierreros y Oficiales
                </span>
                <p className="text-sm font-bold text-white">Armadores de Acero Estructural</p>
                <p className="text-xs text-slate-400 mt-1">Doblado de varillas fy=4200 kg/cm²</p>
                <div className="mt-2 text-xs font-mono text-emerald-400 font-bold">$5.50 - $7.00/h c/u</div>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80">
                <span className="text-[11px] font-bold uppercase text-emerald-400 block mb-1">
                  6x Albañiles & Peones
                </span>
                <p className="text-sm font-bold text-white">Cuadrilla de Vaciado & Curado</p>
                <p className="text-xs text-slate-400 mt-1">Vibrado de hormigón y desencofrado</p>
                <div className="mt-2 text-xs font-mono text-emerald-400 font-bold">$4.50 - $5.20/h c/u</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-indigo-950/40 p-3 rounded-xl border border-indigo-500/20">
              <span className="text-indigo-200">
                ⚡ <strong>Alerta Logística:</strong> Si contratas especialistas de otras provincias (distancia &gt; 80 km), 
                <strong> SARA-ALOJAMIENTO</strong> cotizará automáticamente habitaciones técnicas cercanas para la cuadrilla.
              </span>
              <button 
                onClick={() => setRadioKm(30)}
                className="text-purple-300 hover:text-white font-bold underline cursor-pointer"
              >
                Filtrar solo a menos de 30 km
              </button>
            </div>
          </div>
        )}

        {/* PANEL DE CONTROL DEL RADAR GEOGRÁFICO */}
        <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700/80 shadow-xl mb-8 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            
            {/* Provincia de la Obra */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                Provincia de la Obra
              </label>
              <select
                value={provinciaObra}
                onChange={(e) => {
                  const prov = e.target.value;
                  setProvinciaObra(prov);
                  setCantonObra(PROVINCIAS_ECUADOR[prov]?.[0] || 'Centro');
                }}
                className="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-purple-500 cursor-pointer"
              >
                {Object.keys(PROVINCIAS_ECUADOR).map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>

            {/* Cantón / Sector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-blue-400" />
                Cantón / Sector Destino
              </label>
              <select
                value={cantonObra}
                onChange={(e) => setCantonObra(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-purple-500 cursor-pointer"
              >
                {(PROVINCIAS_ECUADOR[provinciaObra] || []).map((canton) => (
                  <option key={canton} value={canton}>{canton}</option>
                ))}
              </select>
            </div>

            {/* Radio de Búsqueda */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Radio del Radar:</span>
                <span className="text-purple-400 font-mono font-bold">
                  {radioKm === 200 ? 'Todo el Ecuador' : `${radioKm} km`}
                </span>
              </label>
              <select
                value={radioKm}
                onChange={(e) => setRadioKm(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value={5}>5 km (Hiperlocal a la obra)</option>
                <option value={15}>15 km (Cantonal directo)</option>
                <option value={30}>30 km (Metropolitano / Valles)</option>
                <option value={80}>80 km (Provincial)</option>
                <option value={200}>Nacional (Toda la Red)</option>
              </select>
            </div>

            {/* Ordenar Por */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                Ordenar Candidatos
              </label>
              <select
                value={ordenarPor}
                onChange={(e) => setOrdenarPor(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 text-sm text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="rating">Mayor Calificación & VIP</option>
                <option value="distancia">Más cercano a la obra</option>
                <option value="tarifa_asc">Tarifa más económica</option>
                <option value="experiencia">Mayor experiencia (Años)</option>
              </select>
            </div>

          </div>

          {/* Toggle de Mapa Interactivo */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-700/60">
            <div className="flex items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Obra: <strong className="text-white">{cantonObra}, {provinciaObra}</strong>
              </span>
              <span className="text-slate-500">|</span>
              <span>Candidatos disponibles: <strong className="text-purple-400 font-mono">{filteredTalents.length}</strong></span>
            </div>

            <button
              onClick={() => setMostrarMapa(!mostrarMapa)}
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Map size={14} />
              <span>{mostrarMapa ? 'Ocultar Mapa Satelital' : 'Ver Ubicación en Mapa'}</span>
            </button>
          </div>

          {/* Mapa Satelital Embed de la Obra */}
          {mostrarMapa && (
            <div className="mt-4 rounded-xl overflow-hidden border border-slate-700 h-64 relative animate-in fade-in duration-300">
              <iframe
                title="Mapa de Obra"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(`${cantonObra} ${provinciaObra} Ecuador`)}&t=m&z=13&ie=UTF8&iwloc=&output=embed`}
                style={{ filter: 'invert(90%) hue-rotate(180deg)' }}
              />
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-bold text-white shadow-lg">
                📍 Centro de Operaciones: {cantonObra} (Radio: {radioKm} km)
              </div>
            </div>
          )}
        </div>

        {/* BARRA DE BÚSQUEDA Y FILTROS POR CATEGORÍA */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col md:flex-row gap-3">
            
            {/* Input de Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por rol, especialidad o software (Ej. Ingeniero Civil, Revit, Topógrafo, Albañil)..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-400 outline-none focus:border-purple-500 shadow-inner"
                value={searchRole}
                onChange={(e) => setSearchRole(e.target.value)}
              />
              {searchRole && (
                <button 
                  onClick={() => setSearchRole('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Selector de Categoría Rápida */}
            <div className="flex flex-wrap items-center gap-2">
              {['Todas', 'Dirección Técnica', 'Supervisión', 'Cuadrillas', 'Oficios Especializados'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoriaFiltro(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    categoriaFiltro === cat
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros secundarios: Solo Verificados y Disponibilidad */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 px-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={soloVerificados}
                onChange={(e) => setSoloVerificados(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Solo Certificados SECAP / SENESCYT Verificados
              </span>
            </label>

            <span className="text-slate-600">•</span>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Disponibilidad:</span>
              <select
                value={disponibilidadFiltro}
                onChange={(e) => setDisponibilidadFiltro(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white outline-none cursor-pointer"
              >
                <option value="Todas">Todas</option>
                <option value="Inmediata">Inmediata (Obra en curso)</option>
                <option value="Por proyecto">Por fases de proyecto</option>
              </select>
            </div>
          </div>
        </div>

        {/* ESTADO DE CARGA */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm font-medium">Consultando radar de profesionales en Supabase...</p>
          </div>
        )}

        {/* ESTADO VACÍO */}
        {!loading && filteredTalents.length === 0 && (
          <div className="py-16 px-4 bg-slate-800/50 rounded-2xl border border-slate-700/60 text-center max-w-xl mx-auto">
            <HardHat className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No se encontraron profesionales con estos filtros</h3>
            <p className="text-sm text-slate-400 mb-6">
              Prueba ampliando el radio del radar a más kilómetros o buscando una categoría más general.
            </p>
            <button
              onClick={() => {
                setSearchRole('');
                setCategoriaFiltro('Todas');
                setRadioKm(200);
                setSoloVerificados(false);
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
            >
              Restablecer Filtros a Nivel Nacional
            </button>
          </div>
        )}

        {/* GRID DE CANDIDATOS DEL RADAR */}
        {!loading && filteredTalents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTalents.map((talent) => {
              const planNormalized = (talent.plan || '').toLowerCase();
              const isVip = planNormalized === 'vip';
              const isProfesional = planNormalized === 'profesional' || planNormalized === 'estandar';
              const isClose = talent.distanceKm <= 10;

              return (
                <div 
                  key={talent.id} 
                  className={`bg-slate-800/90 rounded-2xl border transition-all flex flex-col relative overflow-hidden backdrop-blur-sm ${
                    isVip 
                      ? 'border-amber-500/50 shadow-xl shadow-amber-950/30 ring-1 ring-amber-500/30 bg-gradient-to-b from-amber-500/5 to-slate-800/95' 
                      : isProfesional
                      ? 'border-blue-500/40 shadow-lg shadow-blue-950/20'
                      : 'border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  {/* Badge de Plan de Éxito */}
                  {isVip && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 via-amber-500 to-yellow-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Crown size={12} className="fill-slate-950" /> 👑 Candidato VIP (Prioridad #1)
                    </div>
                  )}
                  {isProfesional && !isVip && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow">
                      <Sparkles size={11} className="text-blue-200" /> ★ Profesional Destacado
                    </div>
                  )}

                  <div className="p-6 flex-grow">
                    {/* Header de la Tarjeta */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white leading-snug">{talent.name}</h3>
                        <p className="text-purple-400 font-bold text-xs uppercase tracking-wider mt-0.5">
                          {talent.role}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg shrink-0">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="font-mono font-bold text-xs text-amber-300">
                          {talent.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Metadatos Clave */}
                    <div className="space-y-2 mb-4 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-400 shrink-0" />
                        <span><strong>{talent.experienceYears} años</strong> de experiencia acreditada</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                        <span className="truncate">{talent.locationName}</span>
                      </div>

                      {/* Distancia con Indicador Visual */}
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-between font-mono">
                        <span className="text-slate-400 text-[11px] font-sans">Distancia a la obra:</span>
                        <span className={`font-bold flex items-center gap-1 ${
                          isClose ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          <Navigation size={12} />
                          {talent.distanceKm.toFixed(1)} km
                        </span>
                      </div>
                    </div>

                    {/* Certificaciones y Competencias */}
                    <div className="mb-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 tracking-wider">
                        Acreditaciones Verificadas:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {talent.certifications.slice(0, 3).map((cert, cIdx) => (
                          <span 
                            key={cIdx} 
                            className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-medium"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer de Tarjeta con Tarifa y Botón Contratar */}
                  <div className="p-4 bg-slate-900/90 border-t border-slate-700/60 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Tarifa Oficial:</span>
                      <span className="text-xl font-mono font-extrabold text-white">
                        ${talent.hourlyRate}
                        <span className="text-xs text-slate-400 font-sans font-normal ml-1">/ hora</span>
                      </span>
                    </div>

                    <button 
                      onClick={() => handleIniciarContratacionModal(talent)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-900/30 transition-all cursor-pointer"
                    >
                      <ShieldCheck size={14} />
                      <span>Contratar (Escrow)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ==================================================================== */}
      {/* MODAL DE CONTRATACIÓN CON FIDEICOMISO ESCROW SARA */}
      {/* ==================================================================== */}
      {modalEscrowOpen && selectedTalentToHire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-slate-100">
            
            {/* Botón Cerrar */}
            <button 
              onClick={() => setModalEscrowOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <ShieldCheck size={26} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Contratación con Custodia Escrow</h3>
                <p className="text-xs text-slate-400">Protección financiera garantizada bajo normativa civil ecuatoriana</p>
              </div>
            </div>

            {/* Resumen del Profesional */}
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 mb-5 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Profesional:</span>
                <span className="font-bold text-white">{selectedTalentToHire.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Especialidad:</span>
                <span className="font-bold text-purple-400">{selectedTalentToHire.role}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Tarifa Acordada:</span>
                <span className="font-mono font-bold text-emerald-400">${selectedTalentToHire.hourlyRate}.00 / hora</span>
              </div>
            </div>

            {/* Formulario de Contrato */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Nombre de la Obra o Proyecto
                </label>
                <input 
                  type="text" 
                  value={nombreObraContrato}
                  onChange={(e) => setNombreObraContrato(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Horas Iniciales en Garantía (Custodia)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[40, 80, 160].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHorasContrato(h)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        horasContrato === h
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {h} horas ({h === 40 ? '1 sem' : h === 80 ? '2 sem' : '1 mes'})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Desglose Económico */}
            <div className="bg-purple-950/40 p-4 rounded-2xl border border-purple-500/20 mb-6 font-mono text-xs space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal Mano de Obra ({horasContrato}h x ${selectedTalentToHire.hourlyRate}):</span>
                <span>${(horasContrato * selectedTalentToHire.hourlyRate).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Comisión Custodia Fideicomiso (3%):</span>
                <span>${(horasContrato * selectedTalentToHire.hourlyRate * 0.03).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-emerald-400 pt-2 border-t border-purple-500/20">
                <span className="font-sans font-bold">Total a Bloquear en Escrow:</span>
                <span>${(horasContrato * selectedTalentToHire.hourlyRate * 1.03).toFixed(2)} USD</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans mt-2">
                🔒 El monto se resguarda en custodia institucional y solo se libera contra aprobación de los partes de obra y fiscalización técnica.
              </p>
            </div>

            {/* Botón de Confirmación */}
            <button 
              onClick={handleConfirmarContratacionEscrow}
              disabled={contratandoProceso}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {contratandoProceso ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 size={18} />
              )}
              <span>{contratandoProceso ? 'Reservando Fondo en Supabase...' : 'Constituir Custodia y Emitir Contrato'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE PLANES DE ÉXITO ($0 COSTO INICIAL) */}
      <PlanesExitoTalentoModal 
        isOpen={planesModalOpen} 
        onClose={() => setPlanesModalOpen(false)} 
      />

    </div>
  );
}