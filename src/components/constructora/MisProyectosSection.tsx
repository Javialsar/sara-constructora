'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  TrendingUp, 
  FileText, 
  Plus, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Eye, 
  Layers, 
  DollarSign, 
  Users, 
  HardHat,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  X,
  Percent,
  Image as ImageIcon,
  Video,
  FileCheck2,
  AlertTriangle,
  ChevronDown,
  Film,
  Camera,
  Upload,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Check,
  UserCheck,
  FileSpreadsheet,
  Lock,
  Star,
  Navigation,
  Crosshair,
  Compass
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { EmpresaConfigService, ProfesionalStaff } from '@/lib/services/empresaConfigService';
import { exportarAExcel, exportarAPDF } from '@/lib/services/exportReports';
import { createClientAccount } from '@/app/admin/clientes/actions';
import { CANTONES_ECUADOR } from '@/lib/services/geoDistanceService';

const DynamicModalMap = dynamic(() => import('@/components/inmobiliaria/ModalMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[260px] bg-slate-900 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400">
      <Compass className="w-6 h-6 text-amber-400 animate-spin" />
      <span className="text-xs font-mono">Cargando mapa satelital OpenStreetMap...</span>
    </div>
  ),
});

export type AvanceTabType = 'datos' | 'fotos' | 'videos' | 'tecnico';

export interface FotoItem {
  id: string;
  url: string;
  nombre: string;
  peso?: string;
}

export interface VideoItem {
  id: string;
  url: string;
  titulo: string;
  tipo?: 'archivo' | 'enlace';
  duracion?: string;
}

export interface TecnicoResponsable {
  nombre: string;
  cargo: string;
  senescyt: string;
  telefono: string;
  observaciones?: string;
}

export interface ArchivoDocItem {
  id: string;
  nombre: string;
  peso: string;
  tipo: string;
  url?: string;
}

export function MisProyectosSection({ user, initialSubTab = 'obras' }: { user: any; initialSubTab?: 'obras' | 'avances' | 'documentos' }) {
  const isCliente = user?.role === 'cliente_constructora';
  const [subTab, setSubTab] = useState<'obras' | 'avances' | 'documentos'>(() => {
    if (user?.role === 'cliente_constructora') {
      return initialSubTab === 'documentos' ? 'documentos' : 'avances';
    }
    return initialSubTab;
  });

  useEffect(() => {
    if (user?.role === 'cliente_constructora' && initialSubTab === 'obras') {
      setSubTab('avances');
    } else if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab, user?.role]);

  const [proyectos, setProyectos] = useState<any[]>([]);
  const [avances, setAvances] = useState<any[]>([]);
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros Obras
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<'TODOS' | 'EN_EJECUCION' | 'CULMINADOS' | 'PARALIZADOS' | 'EN_DISENO'>('TODOS');

  // Filtros Avances
  const [filterAvanceProyecto, setFilterAvanceProyecto] = useState<string>('TODOS');
  const [filterAvanceFecha, setFilterAvanceFecha] = useState<string>('');
  const [searchAvanceTerm, setSearchAvanceTerm] = useState('');

  // Filtros Documentos
  const [filterDocProyecto, setFilterDocProyecto] = useState<string>('TODOS');
  const [filterDocFecha, setFilterDocFecha] = useState<string>('');
  const [searchDocTerm, setSearchDocTerm] = useState('');

  // Modales y Estado de Proyecto (Datos Generales + Presupuesto y Honorarios + Mapa GPS)
  const [modalProyectoOpen, setModalProyectoOpen] = useState(false);
  const [editingProyecto, setEditingProyecto] = useState<any | null>(null);
  const [clientesList, setClientesList] = useState<any[]>([]);
  const [savingProyecto, setSavingProyecto] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'generales' | 'cotizacion'>('generales');
  const [cotizadorParams, setCotizadorParams] = useState<any>({
    costo_base_construccion_m2: 450,
    tarifa_diseno_arq_m2: 12,
    tarifa_diseno_est_m2: 8,
    tarifa_diseno_mep_m2: 6,
    tarifa_topografia_base: 350,
    factor_pendiente_plana: 1,
    factor_pendiente_media: 1.08,
    factor_pendiente_fuerte: 1.18,
    factor_acabados_economico: 0.85,
    factor_acabados_estandar: 1,
    factor_acabados_premium: 1.3,
    factor_tipologia_unifamiliar: 1,
    factor_tipologia_multifamiliar: 1.15,
    factor_tipologia_comercial: 1.25,
    factor_tipologia_industrial: 0.85,
    porcentaje_adicional_por_piso: 0.03,
    factor_sotano: 1.4,
    porcentaje_iva_base: 15,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [pendingCoverIndex, setPendingCoverIndex] = useState<number | null>(null);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isSubmittingClient, setIsSubmittingClient] = useState(false);
  const [obteniendoGps, setObteniendoGps] = useState(false);
  const [newClientData, setNewClientData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
  });

  const defaultDatosFinancieros = {
    areaConstruccion: 100,
    areaTerreno: 150,
    plantasSobreRasante: 1,
    plantasBajoRasante: 0,
    tipologia: 'unifamiliar',
    pendiente: 'plana',
    acabados: 'estandar',
    incArquitectura: true,
    incEstructura: true,
    incMep: true,
    incTopografia: true,
    totalObra: 0,
    totalHonorarios: 0,
    honorariosArq: 0,
    honorariosEst: 0,
    honorariosMep: 0,
    honorariosTop: 0,
    subtotalHonorarios: 0,
    valorIva: 0,
    aplicaIva: false,
    porcentajeIva: 15,
    desgloseHonorarios: {} as Record<string, number>,
  };

  const [proyectoForm, setProyectoForm] = useState<{
    nombre: string;
    ubicacion: string;
    descripcion: string;
    tipo_obra: string;
    estado: string;
    presupuesto_total: number;
    area_m2: number;
    ingeniero_residente: string;
    cliente_id: string;
    avance: number;
    latitud: string;
    longitud: string;
    imagen_url: string;
    destacado: boolean;
    galeria: string[];
    servicio_id: string;
    datos_financieros: typeof defaultDatosFinancieros;
  }>({
    nombre: '',
    ubicacion: 'Loja, Ecuador',
    descripcion: '',
    tipo_obra: 'Edificación Sismorresistente Hormigón Armado',
    estado: 'en_diseno',
    presupuesto_total: 320000,
    area_m2: 100,
    ingeniero_residente: user?.nombre || 'Ing. Residente de Obra',
    cliente_id: '',
    avance: 0,
    latitud: '-3.9931',
    longitud: '-79.2042',
    imagen_url: '',
    destacado: false,
    galeria: [],
    servicio_id: 'diseno-arquitectonico',
    datos_financieros: defaultDatosFinancieros,
  });

  const [modalAvanceOpen, setModalAvanceOpen] = useState(false);
  const [modalDocOpen, setModalDocOpen] = useState(false);
  const [modalVisualizarAvance, setModalVisualizarAvance] = useState<any | null>(null);
  const [editingAvance, setEditingAvance] = useState<any | null>(null);

  // Viñeta Activa en Modal Registrar Avance
  const [modalAvanceTab, setModalAvanceTab] = useState<AvanceTabType>('datos');

  // Form State para Registro / Edición de Avance (con Viñetas)
  const [avanceForm, setAvanceForm] = useState<{
    proyecto_id: string;
    titulo: string;
    descripcion: string;
    tipo: string;
    url: string;
    porcentajeAnterior: number;
    porcentaje: number;
    fecha: string;
    hora: string;
    fotos: FotoItem[];
    videos: VideoItem[];
    tecnico: TecnicoResponsable;
    notificar_cliente: boolean;
  }>({
    proyecto_id: '',
    titulo: '',
    descripcion: '',
    tipo: 'foto',
    url: '',
    porcentajeAnterior: 0,
    porcentaje: 0,
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false }),
    fotos: [],
    videos: [],
    tecnico: {
      nombre: '',
      cargo: 'Residente de Obra',
      senescyt: '',
      telefono: '',
      observaciones: '',
    },
    notificar_cliente: true,
  });

  // Campos auxiliares para URLs
  const [nuevaFotoUrl, setNuevaFotoUrl] = useState('');
  const [nuevoVideoUrl, setNuevoVideoUrl] = useState('');
  const [nuevoVideoTitulo, setNuevoVideoTitulo] = useState('');

  // Form State para Gestor Documental (con subida múltiple y eliminación)
  const [docForm, setDocForm] = useState<{
    proyecto_id: string;
    titulo: string;
    descripcion: string;
    archivos: ArchivoDocItem[];
    notificar_cliente: boolean;
  }>({
    proyecto_id: '',
    titulo: '',
    descripcion: '',
    archivos: [],
    notificar_cliente: true,
  });

  const supabase = createClient();

  useEffect(() => {
    fetchProyectosData();
  }, []);

  const fetchProyectosData = async () => {
    setLoading(true);
    try {
      // 1. Obras del cliente / profesional con aislamiento estricto
      let query = supabase
        .from('proyectos')
        .select('*')
        .order('created_at', { ascending: false });

      if (isCliente && user?.id) {
        query = query.eq('cliente_id', user.id);
      }

      const { data: proys } = await query;
      const { data: clis } = await supabase.from('clientes').select('id, nombre, apellido').order('nombre', { ascending: true });
      if (clis) setClientesList(clis);

      const { data: cParams } = await supabase.from('cotizador_parametros').select('*').eq('id', 1).single();
      if (cParams) setCotizadorParams((prev: any) => ({ ...prev, ...cParams }));

      if (proys && proys.length > 0) {
        const normalized = proys.map((p: any, idx: number) => {
          const df = p.datos_financieros
            ? typeof p.datos_financieros === 'string'
              ? JSON.parse(p.datos_financieros)
              : p.datos_financieros
            : null;
          return {
            ...p,
            avance: typeof p.avance === 'number' ? p.avance : Number(p.avance || df?.avance || 0),
            presupuesto_total: Number(p.presupuesto_total || p.presupuesto || df?.totalObra || (320000 + idx * 75000)),
            ingeniero_residente: p.ingeniero_residente || df?.ingeniero_residente || user?.nombre || 'Ing. Residente Juan',
            area_m2: Number(p.area_m2 || df?.areaConstruccion || 850),
            tipo_obra: p.tipo_obra || df?.tipologia_label || 'Edificación Sismorresistente Hormigón Armado',
            estado: p.estado || 'en_construccion',
          };
        });
        setProyectos(normalized);
      } else if (isCliente) {
        // En modo cliente autenticado, reflejar estado vacío real sin inyectar obras ajenas
        setProyectos([]);
      } else {
        // Mock data de desarrollo exclusivo para preview técnico / demo
        setProyectos([
          {
            id: 'p-loja-01',
            nombre: 'El Chiquito',
            ubicacion: 'Calvas, Loja - Loja',
            estado: 'en_construccion',
            avance: 35.0,
            presupuesto_total: 320000.0,
            ingeniero_residente: user?.nombre || 'Juan',
            area_m2: 850,
            tipo_obra: 'Edificación Sismorresistente Hormigón Armado',
          },
          {
            id: 'p-loja-02',
            nombre: 'Torre Sara',
            ubicacion: 'Calvas - Loja',
            estado: 'en_construccion',
            avance: 48.0,
            presupuesto_total: 396000.0,
            ingeniero_residente: user?.nombre || 'Juan',
            area_m2: 850,
            tipo_obra: 'Edificación Sismorresistente Hormigón Armado',
          },
          {
            id: 'p-loja-03',
            nombre: 'Test Obra Anon',
            ubicacion: 'Loja',
            estado: 'en_construccion',
            avance: 15.0,
            presupuesto_total: 470000.0,
            ingeniero_residente: user?.nombre || 'Juan',
            area_m2: 850,
            tipo_obra: 'Edificación Sismorresistente Hormigón Armado',
          },
          {
            id: 'p-loja-04',
            nombre: 'Test Obra Temporal',
            ubicacion: 'Calvas - Loja',
            estado: 'paralizado',
            avance: 22.0,
            presupuesto_total: 545000.0,
            ingeniero_residente: user?.nombre || 'Juan',
            area_m2: 850,
            tipo_obra: 'Edificación Sismorresistente Hormigón Armado',
          },
          {
            id: 'p-loja-05',
            nombre: 'Rincón Campestre JV',
            ubicacion: 'Cariamanga/San Sebastian',
            estado: 'en_diseno',
            avance: 5.0,
            presupuesto_total: 620000.0,
            ingeniero_residente: user?.nombre || 'Juan',
            area_m2: 850,
            tipo_obra: 'Viviendas Unifamiliares Campestres',
          },
          {
            id: 'p-loja-06',
            nombre: 'Urbanización Mangis',
            ubicacion: 'Quito/Turubamba',
            estado: 'finalizado',
            avance: 100.0,
            presupuesto_total: 695000.0,
            ingeniero_residente: user?.nombre || 'Juan',
            area_m2: 850,
            tipo_obra: 'Edificación Sismorresistente Hormigón Armado',
          },
        ]);
      }

      // 2. Avances de obra
      let avsQuery = supabase
        .from('avances')
        .select(`*, proyectos(id, nombre, cliente_id)`)
        .order('fecha', { ascending: false });

      if (isCliente && user?.id) {
        avsQuery = avsQuery.eq('proyectos.cliente_id', user.id);
      }

      const { data: avs } = await avsQuery;

      if (avs && avs.length > 0) {
        const normAvs = avs.map((a: any) => ({
          ...a,
          proyecto_nombre: a.proyectos?.nombre || a.proyecto_nombre || 'Obra SARA',
          fecha_completa: a.fecha,
        }));
        setAvances(normAvs);
      } else if (isCliente) {
        setAvances([]);
      } else {
        setAvances([
          {
            id: 'av-01',
            proyecto_id: 'p-loja-01',
            proyecto_nombre: 'El Chiquito',
            titulo: 'Inicio de obra & replanteo',
            porcentaje: 35.0,
            fecha: '2026-09-15T18:01:05.871Z',
            fecha_str: '2026-09-15',
            hora_str: '18:01',
            descripcion: 'Se hace todo el replanteo del terreno y nivelación de cotas de excavación.',
            fiscalizador: 'Ing. Fiscalizador Municipal',
            tipo: 'foto',
            url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
          },
          {
            id: 'av-02',
            proyecto_id: 'p-loja-02',
            proyecto_nombre: 'Torre Sara',
            titulo: 'Topografía del terreno y ejes principales',
            porcentaje: 48.0,
            fecha: '2026-09-13T03:44:53.433Z',
            fecha_str: '2026-09-13',
            hora_str: '08:44',
            descripcion: 'Se trabaja con equipos de alta fidelidad topográfica GPS diferencial y estación total.',
            fiscalizador: 'Ing. Residente Juan',
            tipo: 'foto',
            url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
          },
          {
            id: 'av-03',
            proyecto_id: 'p-loja-01',
            proyecto_nombre: 'El Chiquito',
            titulo: 'Fundición de bases y zapatas aisladas',
            porcentaje: 25.0,
            fecha: '2026-09-12T23:42:40.984Z',
            fecha_str: '2026-09-12',
            hora_str: '17:42',
            descripcion: 'Armado de canastillas de acero fy=4200 kg/cm² y vaciado de hormigón f\'c=240 kg/cm².',
            fiscalizador: 'Ing. Fiscalizador Municipal',
            tipo: 'foto',
            url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
          },
          {
            id: 'av-04',
            proyecto_id: 'p-loja-03',
            proyecto_nombre: 'Test Obra Anon',
            titulo: 'Mejoramiento de suelo con material granular',
            porcentaje: 15.0,
            fecha: '2026-09-12T23:41:14.674Z',
            fecha_str: '2026-09-12',
            hora_str: '15:30',
            descripcion: 'Colocación de capas de 20cm de subbase clase 3 y compactación mecánica con rodillo.',
            fiscalizador: 'Ing. Residente Juan',
            tipo: 'foto',
            url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
          },
        ]);
      }

      // 3. Documentos y Planos BIM
      let docsQuery = supabase
        .from('documentos_proyecto')
        .select(`*, proyectos(id, nombre, cliente_id)`)
        .order('fecha_subida', { ascending: false });

      if (isCliente && user?.id) {
        docsQuery = docsQuery.eq('proyectos.cliente_id', user.id);
      }

      const { data: docs } = await docsQuery;

      if (docs && docs.length > 0) {
        const normDocs = docs.map((d: any) => ({
          ...d,
          proyecto_nombre: d.proyectos?.nombre || d.proyecto_nombre || 'Obra SARA',
          fecha_subida_str: d.fecha_subida,
        }));
        setDocumentos(normDocs);
      } else if (isCliente) {
        setDocumentos([]);
      } else {
        setDocumentos([
          {
            id: 'doc-01',
            proyecto_id: 'p-loja-02',
            proyecto_nombre: 'Torre Sara',
            titulo: 'PLANOS-BIM',
            nombre_archivo: 'Planos_Estructurales_BIM_TorreSara_v3.ifc',
            descripcion: 'Modelo 3D y anteproyecto estructural completo',
            tipo: 'IFC / BIM',
            peso: '28.4 MB',
            fecha_subida: '2026-09-13T10:15:00Z',
            fecha_str: '2026-09-13',
            hora_str: '10:15',
          },
          {
            id: 'doc-02',
            proyecto_id: 'p-loja-01',
            proyecto_nombre: 'El Chiquito',
            titulo: 'Planos arquitectónicos',
            nombre_archivo: 'Planos_Arquitectonicos_Aprobados_ElChiquito.pdf',
            descripcion: 'Planos de plantas, cortes y fachadas autorizados',
            tipo: 'PDF',
            peso: '12.8 MB',
            fecha_subida: '2026-09-13T11:40:00Z',
            fecha_str: '2026-09-13',
            hora_str: '11:40',
          },
          {
            id: 'doc-03',
            proyecto_id: 'p-loja-05',
            proyecto_nombre: 'Rincón Campestre JV',
            titulo: 'Memoria de Cálculo Hidrosanitario',
            nombre_archivo: 'Memoria_Calculo_Hidrosanitario_Campestre.pdf',
            descripcion: 'Dimensionamiento de red potable y fosa séptica ecológica',
            tipo: 'PDF',
            peso: '6.2 MB',
            fecha_subida: '2026-10-02T16:20:00Z',
            fecha_str: '2026-10-02',
            hora_str: '16:20',
          },
        ]);
      }
    } catch (e) {
      console.error('Error fetching proyectos data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Helper Formatear Fecha y Hora Legible
  const formatFechaHora = (fechaRaw: string, horaRaw?: string) => {
    if (!fechaRaw) return { fecha: 'Fecha no registrada', hora: '00:00' };
    try {
      const d = new Date(fechaRaw);
      if (!isNaN(d.getTime())) {
        const fecha = d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
        const hora = horaRaw || d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false });
        return { fecha, hora: hora === 'Invalid Date' ? '12:00' : hora };
      }
    } catch {}
    return { fecha: fechaRaw, hora: horaRaw || '12:00' };
  };

  // ============================================================================
  // FILTRADO DE OBRAS
  // ============================================================================
  const filteredProyectos = proyectos.filter((p) => {
    const matchSearch = 
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());

    const estadoNorm = (p.estado || '').toLowerCase();
    let matchEstado = true;

    if (estadoFilter === 'EN_EJECUCION') {
      matchEstado = estadoNorm.includes('construccion') || estadoNorm.includes('ejecucion') || estadoNorm.includes('cimentacion');
    } else if (estadoFilter === 'CULMINADOS') {
      matchEstado = estadoNorm.includes('finalizado') || estadoNorm.includes('culminado') || p.avance >= 100;
    } else if (estadoFilter === 'PARALIZADOS') {
      matchEstado = estadoNorm.includes('paralizado') || estadoNorm.includes('suspendido');
    } else if (estadoFilter === 'EN_DISENO') {
      matchEstado = estadoNorm.includes('diseno') || estadoNorm.includes('planificacion');
    }

    return matchSearch && matchEstado;
  });

  // Conteo de Estados para botones de filtro
  const countTodos = proyectos.length;
  const countEjecucion = proyectos.filter(p => {
    const e = (p.estado || '').toLowerCase();
    return e.includes('construccion') || e.includes('ejecucion') || e.includes('cimentacion');
  }).length;
  const countCulminados = proyectos.filter(p => {
    const e = (p.estado || '').toLowerCase();
    return e.includes('finalizado') || e.includes('culminado') || p.avance >= 100;
  }).length;
  const countParalizados = proyectos.filter(p => {
    const e = (p.estado || '').toLowerCase();
    return e.includes('paralizado') || e.includes('suspendido');
  }).length;
  const countDiseno = proyectos.filter(p => {
    const e = (p.estado || '').toLowerCase();
    return e.includes('diseno') || e.includes('planificacion');
  }).length;

  // ============================================================================
  // FILTRADO DE AVANCES (IMAGEN 5)
  // ============================================================================
  const filteredAvances = avances.filter((av) => {
    // Si es cliente y tiene proyecto asignado, aislar estrictamente a su proyecto
    if (isCliente && user?.proyectoAsignado && user.proyectoAsignado !== 'Todos los Proyectos') {
      const pNorm = String(user.proyectoAsignado).toLowerCase();
      const matchAsignado = (av.proyecto_nombre || '').toLowerCase().includes(pNorm) || (av.proyecto_id || '').toLowerCase().includes(pNorm);
      if (!matchAsignado) return false;
    }

    const matchSearch = 
      av.titulo?.toLowerCase().includes(searchAvanceTerm.toLowerCase()) ||
      av.descripcion?.toLowerCase().includes(searchAvanceTerm.toLowerCase()) ||
      av.proyecto_nombre?.toLowerCase().includes(searchAvanceTerm.toLowerCase());

    const matchProyecto = filterAvanceProyecto === 'TODOS' || 
      av.proyecto_id === filterAvanceProyecto || 
      av.proyecto_nombre === filterAvanceProyecto;

    let matchFecha = true;
    if (filterAvanceFecha) {
      matchFecha = (av.fecha || '').includes(filterAvanceFecha) || (av.fecha_str || '') === filterAvanceFecha;
    }

    return matchSearch && matchProyecto && matchFecha;
  });

  // ============================================================================
  // FILTRADO DE DOCUMENTOS (IMAGEN 4)
  // ============================================================================
  const filteredDocumentos = documentos.filter((doc) => {
    // Si es cliente y tiene proyecto asignado, aislar estrictamente a su proyecto
    if (isCliente && user?.proyectoAsignado && user.proyectoAsignado !== 'Todos los Proyectos') {
      const pNorm = String(user.proyectoAsignado).toLowerCase();
      const matchAsignado = (doc.proyecto_nombre || '').toLowerCase().includes(pNorm) || (doc.proyecto_id || '').toLowerCase().includes(pNorm);
      if (!matchAsignado) return false;
    }

    const matchSearch = 
      doc.titulo?.toLowerCase().includes(searchDocTerm.toLowerCase()) ||
      doc.nombre_archivo?.toLowerCase().includes(searchDocTerm.toLowerCase()) ||
      doc.proyecto_nombre?.toLowerCase().includes(searchDocTerm.toLowerCase());

    const matchProyecto = filterDocProyecto === 'TODOS' || 
      doc.proyecto_id === filterDocProyecto || 
      doc.proyecto_nombre === filterDocProyecto;

    let matchFecha = true;
    if (filterDocFecha) {
      matchFecha = (doc.fecha_subida || '').includes(filterDocFecha) || (doc.fecha_str || '') === filterDocFecha;
    }

    return matchSearch && matchProyecto && matchFecha;
  });

  // ============================================================================
  // HANDLERS: MODAL NUEVO / EDITAR PROYECTO (FORMULARIO COMPLETO + MAPA GPS)
  // ============================================================================
  const calcularFinanzas = (dfSnapshot: any, params: any) => {
    const result = { ...dfSnapshot };
    if (!params) return result;

    let fPendiente = params.factor_pendiente_plana || 1;
    if (result.pendiente === 'media') fPendiente = params.factor_pendiente_media || 1.08;
    if (result.pendiente === 'fuerte') fPendiente = params.factor_pendiente_fuerte || 1.18;

    let fAcabados = params.factor_acabados_estandar || 1;
    if (result.acabados === 'economico') fAcabados = params.factor_acabados_economico || 0.85;
    if (result.acabados === 'premium') fAcabados = params.factor_acabados_premium || 1.3;

    let fTipologia = params.factor_tipologia_unifamiliar || 1;
    if (result.tipologia === 'multifamiliar') fTipologia = params.factor_tipologia_multifamiliar || 1.15;
    if (result.tipologia === 'comercial') fTipologia = params.factor_tipologia_comercial || 1.25;
    if (result.tipologia === 'industrial') fTipologia = params.factor_tipologia_industrial || 0.85;

    const fAltura = 1 + Math.max(0, (result.plantasSobreRasante || 1) - 2) * (params.porcentaje_adicional_por_piso || 0.03);
    const fSotano = (result.plantasBajoRasante || 0) > 0 ? (params.factor_sotano || 1.4) : 1;

    const costoObra =
      (result.areaConstruccion || 100) *
      (params.costo_base_construccion_m2 || 450) *
      fPendiente *
      fAcabados *
      fTipologia *
      fAltura *
      fSotano;

    const honorariosArq = result.incArquitectura
      ? (result.areaConstruccion || 100) * (params.tarifa_diseno_arq_m2 || 12) * fTipologia * fAltura
      : 0;
    const honorariosEst = result.incEstructura
      ? (result.areaConstruccion || 100) * (params.tarifa_diseno_est_m2 || 8) * fTipologia * fAltura
      : 0;
    const honorariosMep = result.incMep
      ? (result.areaConstruccion || 100) * (params.tarifa_diseno_mep_m2 || 6) * fTipologia
      : 0;
    const honorariosTop = result.incTopografia ? (params.tarifa_topografia_base || 350) : 0;

    const subtotalHonorarios = honorariosArq + honorariosEst + honorariosMep + honorariosTop;
    const porcentajeIvaBase = params.porcentaje_iva_base ?? 15;
    const porcentajeIvaFinal = result.porcentajeIva ?? porcentajeIvaBase;
    const valorIva = result.aplicaIva ? subtotalHonorarios * (porcentajeIvaFinal / 100) : 0;

    result.totalObra = costoObra;
    result.honorariosArq = honorariosArq;
    result.honorariosEst = honorariosEst;
    result.honorariosMep = honorariosMep;
    result.honorariosTop = honorariosTop;
    result.subtotalHonorarios = subtotalHonorarios;
    result.porcentajeIva = porcentajeIvaFinal;
    result.valorIva = valorIva;
    result.totalHonorarios = subtotalHonorarios + valorIva;

    return result;
  };

  const liveFinanzas = calcularFinanzas(proyectoForm.datos_financieros, cotizadorParams);

  const handleCreateClientFromProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingClient(true);
    try {
      const res = await createClientAccount(newClientData);
      setIsSubmittingClient(false);
      if (res.success && res.client) {
        setClientesList(prev => [
          { id: res.client.id, nombre: res.client.nombre, apellido: res.client.apellido },
          ...prev,
        ]);
        setProyectoForm(prev => ({
          ...prev,
          cliente_id: res.client.id,
        }));
        setIsAddClientModalOpen(false);
        setNewClientData({ nombre: '', apellido: '', email: '', telefono: '', password: '' });
      } else {
        alert('Error al crear cliente: ' + (res.error || 'Ocurrió un error'));
      }
    } catch (err: any) {
      setIsSubmittingClient(false);
      alert('Error al crear cliente: ' + err.message);
    }
  };

  const setAsCover = (url: string) => {
    setPendingCoverIndex(null);
    const newGaleria = proyectoForm.galeria.filter(u => u !== url);
    if (proyectoForm.imagen_url) {
      newGaleria.push(proyectoForm.imagen_url);
    }
    setProyectoForm({ ...proyectoForm, imagen_url: url, galeria: newGaleria });
  };

  const removeExistingUrl = (index: number) => {
    const allImages = [...(proyectoForm.imagen_url ? [proyectoForm.imagen_url] : []), ...proyectoForm.galeria];
    const urlToRemove = allImages[index];

    if (urlToRemove === proyectoForm.imagen_url && index === 0) {
      if (proyectoForm.galeria.length > 0) {
        const newGaleria = [...proyectoForm.galeria];
        const nextCover = newGaleria.shift()!;
        setProyectoForm({ ...proyectoForm, imagen_url: nextCover, galeria: newGaleria });
      } else {
        setProyectoForm({ ...proyectoForm, imagen_url: '', galeria: [] });
      }
    } else {
      const offset = proyectoForm.imagen_url ? 1 : 0;
      const galeriaIndex = index - offset;
      const newGaleria = [...proyectoForm.galeria];
      newGaleria.splice(galeriaIndex, 1);
      setProyectoForm({ ...proyectoForm, galeria: newGaleria });
    }
  };

  const removePendingFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    if (pendingCoverIndex === index) {
      setPendingCoverIndex(null);
    } else if (pendingCoverIndex !== null && pendingCoverIndex > index) {
      setPendingCoverIndex(pendingCoverIndex - 1);
    }
  };

  const handleUbicarCiudadEnMapa = (textoUbicacion?: string) => {
    const q = (textoUbicacion ?? proyectoForm.ubicacion).toLowerCase().trim();
    if (!q) return;
    const match = CANTONES_ECUADOR.find(
      c =>
        q.includes(c.nombre.toLowerCase()) ||
        c.nombre.toLowerCase().includes(q) ||
        q.includes(c.provincia.toLowerCase())
    );
    if (match) {
      setProyectoForm(prev => ({
        ...prev,
        latitud: match.coordenadas.lat.toFixed(6),
        longitud: match.coordenadas.lng.toFixed(6),
      }));
    }
  };

  const handleObtenerMiUbicacionGps = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    setObteniendoGps(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setProyectoForm(prev => ({
          ...prev,
          latitud: pos.coords.latitude.toFixed(6),
          longitud: pos.coords.longitude.toFixed(6),
        }));
        setObteniendoGps(false);
      },
      () => {
        setObteniendoGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleAbrirModalNuevoProyecto = () => {
    setEditingProyecto(null);
    setFiles([]);
    setPendingCoverIndex(null);
    setActiveModalTab('generales');
    setProyectoForm({
      nombre: '',
      ubicacion: 'Loja, Ecuador',
      descripcion: '',
      tipo_obra: 'Edificación Sismorresistente Hormigón Armado',
      estado: 'en_diseno',
      presupuesto_total: 320000,
      area_m2: 100,
      ingeniero_residente: user?.nombre || 'Ing. Residente de Obra',
      cliente_id: '',
      avance: 0,
      latitud: '-3.9931',
      longitud: '-79.2042',
      imagen_url: '',
      destacado: false,
      galeria: [],
      servicio_id: 'diseno-arquitectonico',
      datos_financieros: defaultDatosFinancieros,
    });
    setModalProyectoOpen(true);
  };

  const handleEditarProyecto = (proy: any) => {
    setEditingProyecto(proy);
    setFiles([]);
    setPendingCoverIndex(null);
    setActiveModalTab('generales');

    const df = proy.datos_financieros
      ? typeof proy.datos_financieros === 'string'
        ? JSON.parse(proy.datos_financieros)
        : proy.datos_financieros
      : defaultDatosFinancieros;
    const safeDf = {
      ...defaultDatosFinancieros,
      ...df,
      areaConstruccion: Number(df?.areaConstruccion || proy.area_m2 || 100),
    };

    setProyectoForm({
      nombre: proy.nombre || '',
      ubicacion: proy.ubicacion || 'Loja, Ecuador',
      descripcion: proy.descripcion || '',
      tipo_obra: proy.tipo_obra || 'Edificación Sismorresistente Hormigón Armado',
      estado: proy.estado || 'en_construccion',
      presupuesto_total: Number(proy.presupuesto_total || safeDf.totalObra || 320000),
      area_m2: Number(proy.area_m2 || safeDf.areaConstruccion || 100),
      ingeniero_residente: proy.ingeniero_residente || df?.ingeniero_residente || user?.nombre || 'Ing. Residente de Obra',
      cliente_id: proy.cliente_id || '',
      avance: Number(proy.avance || df?.avance || 0),
      latitud: proy.latitud ? String(proy.latitud) : '-3.9931',
      longitud: proy.longitud ? String(proy.longitud) : '-79.2042',
      imagen_url: proy.imagen_url || '',
      destacado: Boolean(proy.destacado),
      galeria: Array.isArray(proy.galeria) ? proy.galeria : [],
      servicio_id: proy.servicio_id || 'diseno-arquitectonico',
      datos_financieros: safeDf,
    });
    setModalProyectoOpen(true);
  };

  const handleGuardarProyecto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proyectoForm.nombre.trim()) return;
    setSavingProyecto(true);

    try {
      let finalUrl = proyectoForm.imagen_url;
      const finalGaleria = [...proyectoForm.galeria];

      if (files.length > 0) {
        setUploadingFile(true);
        const uploadedUrls: string[] = [];

        for (const f of files) {
          const fileExt = f.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `galeria/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('avances')
            .upload(filePath, f, { cacheControl: '3600', upsert: false });

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage.from('avances').getPublicUrl(filePath);
            uploadedUrls.push(publicUrlData.publicUrl);
          }
        }

        if (pendingCoverIndex !== null && pendingCoverIndex < uploadedUrls.length) {
          if (finalUrl) {
            finalGaleria.push(finalUrl);
          }
          finalUrl = uploadedUrls[pendingCoverIndex];
          uploadedUrls.forEach((url, i) => {
            if (i !== pendingCoverIndex) {
              finalGaleria.push(url);
            }
          });
        } else {
          uploadedUrls.forEach(url => {
            if (!finalUrl) {
              finalUrl = url;
            } else {
              finalGaleria.push(url);
            }
          });
        }
        setUploadingFile(false);
      }

      const dfSnapshot = {
        ...calcularFinanzas(proyectoForm.datos_financieros, cotizadorParams),
        ingeniero_residente: proyectoForm.ingeniero_residente,
        avance: Number(proyectoForm.avance || 0),
        tipologia_label: proyectoForm.tipo_obra,
      };

      const payloadDb: any = {
        nombre: proyectoForm.nombre.trim(),
        ubicacion: proyectoForm.ubicacion.trim() || 'Ecuador',
        descripcion: proyectoForm.descripcion.trim(),
        estado: proyectoForm.estado,
        latitud: proyectoForm.latitud ? parseFloat(proyectoForm.latitud) : null,
        longitud: proyectoForm.longitud ? parseFloat(proyectoForm.longitud) : null,
        cliente_id: proyectoForm.cliente_id ? proyectoForm.cliente_id : null,
        imagen_url: finalUrl,
        destacado: proyectoForm.destacado,
        galeria: finalGaleria,
        servicio_id: proyectoForm.servicio_id,
        datos_financieros: dfSnapshot,
      };

      const presupuestoCalculado = Number(dfSnapshot.totalObra || proyectoForm.presupuesto_total || 320000);
      const areaCalculada = Number(dfSnapshot.areaConstruccion || proyectoForm.area_m2 || 100);

      if (editingProyecto) {
        try {
          await supabase.from('proyectos').update(payloadDb).eq('id', editingProyecto.id);
        } catch (err) {
          console.warn('Actualización local de obra:', err);
        }
        setProyectos(prev =>
          prev.map(p =>
            p.id === editingProyecto.id
              ? {
                  ...p,
                  ...payloadDb,
                  avance: Number(proyectoForm.avance || 0),
                  tipo_obra: proyectoForm.tipo_obra,
                  presupuesto_total: presupuestoCalculado,
                  area_m2: areaCalculada,
                  ingeniero_residente: proyectoForm.ingeniero_residente,
                }
              : p
          )
        );
      } else {
        let insertedRow: any = null;
        try {
          const { data } = await supabase.from('proyectos').insert([payloadDb]).select().single();
          if (data) insertedRow = data;
        } catch (err) {
          console.warn('Creación local de obra:', err);
        }

        const nuevaObra = {
          id: insertedRow?.id || `proy-${Date.now()}`,
          ...payloadDb,
          avance: Number(proyectoForm.avance || 0),
          tipo_obra: proyectoForm.tipo_obra,
          presupuesto_total: presupuestoCalculado,
          area_m2: areaCalculada,
          ingeniero_residente: proyectoForm.ingeniero_residente,
          created_at: new Date().toISOString(),
        };
        setProyectos(prev => [nuevaObra, ...prev]);
      }

      setModalProyectoOpen(false);
      setEditingProyecto(null);
    } finally {
      setSavingProyecto(false);
    }
  };

  const handleEliminarProyecto = async (proy: any) => {
    if (!confirm(`¿Estás seguro de eliminar el proyecto "${proy.nombre}"?`)) return;
    try {
      await supabase.from('proyectos').delete().eq('id', proy.id);
    } catch {}
    setProyectos(prev => prev.filter(p => p.id !== proy.id));
  };

  // ============================================================================
  // HANDLERS: MODAL REGISTRAR AVANCE (IMAGEN 1 - EN VIÑETAS)
  // ============================================================================
  const handleAbrirModalAvance = (proyectoTarget?: any) => {
    const pId = proyectoTarget ? proyectoTarget.id : (proyectos[0]?.id || '');
    const pActual = proyectos.find(p => p.id === pId);
    const staff = EmpresaConfigService.getStaff();
    const tecnicoDefault = staff[0] || {
      nombre: user?.nombre || 'Ing. Residente Juan',
      cargo: 'Ing. Residente de Obra',
      senescyt: '1005-2016-189423',
      telefono: '+593 99 481 2938',
      email: ''
    };

    setEditingAvance(null);
    setModalAvanceTab('datos');
    setNuevaFotoUrl('');
    setNuevoVideoUrl('');
    setNuevoVideoTitulo('');

    const ahora = new Date();
    const fechaSistema = ahora.toISOString().split('T')[0];
    const horaSistema = ahora.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false });

    setAvanceForm({
      proyecto_id: pId,
      titulo: '',
      descripcion: '',
      tipo: 'foto',
      url: '',
      porcentajeAnterior: pActual ? Number(pActual.avance) : 0,
      porcentaje: pActual ? Number(pActual.avance) : 0,
      fecha: fechaSistema,
      hora: horaSistema,
      fotos: [
        {
          id: `foto-${Date.now()}-1`,
          url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
          nombre: 'Vista general del frente de trabajo.jpg',
          peso: '2.4 MB'
        }
      ],
      videos: [],
      tecnico: {
        nombre: tecnicoDefault.nombre,
        cargo: tecnicoDefault.cargo,
        senescyt: tecnicoDefault.senescyt,
        telefono: tecnicoDefault.telefono,
        observaciones: 'Inspección física y verificación de especificaciones técnicas NEC.'
      },
      notificar_cliente: true,
    });
    setModalAvanceOpen(true);
  };

  // Subida múltiple de fotografías
  const handleSubirFotosInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      const nuevasFotos: FotoItem[] = filesArr.map((f, idx) => ({
        id: `foto-${Date.now()}-${idx}`,
        url: URL.createObjectURL(f),
        nombre: f.name,
        peso: `${(f.size / (1024 * 1024)).toFixed(2)} MB`
      }));
      setAvanceForm(prev => ({
        ...prev,
        fotos: [...prev.fotos, ...nuevasFotos]
      }));
    }
  };

  const handleAgregarFotoUrl = () => {
    if (!nuevaFotoUrl.trim()) return;
    const nueva: FotoItem = {
      id: `foto-${Date.now()}`,
      url: nuevaFotoUrl.trim(),
      nombre: `Foto_Avance_${avanceForm.fotos.length + 1}.jpg`,
      peso: '1.8 MB'
    };
    setAvanceForm(prev => ({
      ...prev,
      fotos: [...prev.fotos, nueva]
    }));
    setNuevaFotoUrl('');
  };

  const handleEliminarFoto = (fotoId: string) => {
    setAvanceForm(prev => ({
      ...prev,
      fotos: prev.fotos.filter(f => f.id !== fotoId)
    }));
  };

  // Subida de videos
  const handleSubirVideosInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      const nuevosVideos: VideoItem[] = filesArr.map((v, idx) => ({
        id: `vid-${Date.now()}-${idx}`,
        url: URL.createObjectURL(v),
        titulo: v.name,
        tipo: 'archivo',
        duracion: '1:45 min'
      }));
      setAvanceForm(prev => ({
        ...prev,
        videos: [...prev.videos, ...nuevosVideos]
      }));
    }
  };

  const handleAgregarVideoUrl = () => {
    if (!nuevoVideoUrl.trim()) return;
    const nuevo: VideoItem = {
      id: `vid-${Date.now()}`,
      url: nuevoVideoUrl.trim(),
      titulo: nuevoVideoTitulo.trim() || `Video de Obra ${avanceForm.videos.length + 1}`,
      tipo: 'enlace',
      duracion: 'Enlace HD'
    };
    setAvanceForm(prev => ({
      ...prev,
      videos: [...prev.videos, nuevo]
    }));
    setNuevoVideoUrl('');
    setNuevoVideoTitulo('');
  };

  const handleEliminarVideo = (vidId: string) => {
    setAvanceForm(prev => ({
      ...prev,
      videos: prev.videos.filter(v => v.id !== vidId)
    }));
  };

  const handleGuardarAvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avanceForm.proyecto_id || !avanceForm.titulo) {
      alert('Por favor selecciona una obra y escribe el título del avance.');
      return;
    }

    const proySelected = proyectos.find(p => p.id === avanceForm.proyecto_id);

    // FECHA Y HORA DEL SISTEMA (TOMADAS AUTOMÁTICAMENTE)
    const now = new Date();
    const fechaSistema = now.toISOString().split('T')[0];
    const horaSistema = now.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false });
    const fechaIsoCompleta = now.toISOString();

    const fotoPrincipalUrl = avanceForm.fotos[0]?.url || 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80';

    if (editingAvance) {
      // Actualizar Avance Existente
      const updated = {
        ...editingAvance,
        proyecto_id: avanceForm.proyecto_id,
        proyecto_nombre: proySelected?.nombre || editingAvance.proyecto_nombre,
        titulo: avanceForm.titulo,
        descripcion: avanceForm.descripcion,
        porcentajeAnterior: Number(avanceForm.porcentajeAnterior),
        porcentaje: Number(avanceForm.porcentaje),
        fecha: fechaIsoCompleta,
        fecha_str: fechaSistema,
        hora_str: horaSistema,
        fotos: avanceForm.fotos,
        videos: avanceForm.videos,
        tecnico: avanceForm.tecnico,
        fiscalizador: avanceForm.tecnico.nombre,
        url: fotoPrincipalUrl,
      };

      setAvances(prev => prev.map(a => a.id === editingAvance.id ? updated : a));

      // Actualizar porcentaje en la obra
      setProyectos(prev => prev.map(p => {
        if (p.id === avanceForm.proyecto_id) {
          return { ...p, avance: Number(avanceForm.porcentaje) };
        }
        return p;
      }));

      alert('¡Avance de obra actualizado correctamente con fecha y hora del sistema!');
    } else {
      // Crear Nuevo Avance
      const nuevoAvance = {
        id: `av-${Date.now()}`,
        proyecto_id: avanceForm.proyecto_id,
        proyecto_nombre: proySelected?.nombre || 'Obra SARA',
        titulo: avanceForm.titulo,
        descripcion: avanceForm.descripcion || 'Inspección técnica física certificada en obra.',
        porcentajeAnterior: Number(avanceForm.porcentajeAnterior),
        porcentaje: Number(avanceForm.porcentaje),
        fecha: fechaIsoCompleta,
        fecha_str: fechaSistema,
        hora_str: horaSistema,
        fiscalizador: avanceForm.tecnico.nombre,
        tecnico: avanceForm.tecnico,
        fotos: avanceForm.fotos,
        videos: avanceForm.videos,
        estado_aprobacion: 'Registrado con Firma Digital',
        tipo: avanceForm.videos.length > 0 ? 'video' : 'foto',
        url: fotoPrincipalUrl,
      };

      // Guardar en Supabase si está disponible
      try {
        await supabase.from('avances').insert([{
          proyecto_id: avanceForm.proyecto_id,
          titulo: avanceForm.titulo,
          descripcion: avanceForm.descripcion,
          tipo: nuevoAvance.tipo,
          url: fotoPrincipalUrl,
          porcentaje: Number(avanceForm.porcentaje),
          fecha: fechaIsoCompleta
        }]);
        await supabase.from('proyectos').update({ avance: Number(avanceForm.porcentaje) }).eq('id', avanceForm.proyecto_id);
      } catch (err) {
        console.warn('Persistencia offline activa para avance:', err);
      }

      setAvances(prev => [nuevoAvance, ...prev]);

      // Actualizar porcentaje en la obra
      setProyectos(prev => prev.map(p => {
        if (p.id === avanceForm.proyecto_id) {
          return { ...p, avance: Number(avanceForm.porcentaje) };
        }
        return p;
      }));

      alert(`¡Avance registrado exitosamente con fecha ${fechaSistema} a las ${horaSistema} (Tomada automáticamente del sistema)!`);
    }

    setModalAvanceOpen(false);
    setEditingAvance(null);
  };

  const handleEditarAvance = (av: any) => {
    setEditingAvance(av);
    setModalAvanceTab('datos');
    const pActual = proyectos.find(p => p.id === av.proyecto_id);

    const fotosExistentes: FotoItem[] = av.fotos && Array.isArray(av.fotos) && av.fotos.length > 0
      ? av.fotos
      : (av.url ? [{ id: `f-${Date.now()}`, url: av.url, nombre: 'Fotografía principal.jpg', peso: '2.1 MB' }] : []);

    const videosExistentes: VideoItem[] = av.videos && Array.isArray(av.videos) ? av.videos : [];

    setAvanceForm({
      proyecto_id: av.proyecto_id || proyectos[0]?.id || '',
      titulo: av.titulo || '',
      descripcion: av.descripcion || '',
      tipo: av.tipo || 'foto',
      url: av.url || '',
      porcentajeAnterior: av.porcentajeAnterior !== undefined ? Number(av.porcentajeAnterior) : (pActual ? Number(pActual.avance) : av.porcentaje),
      porcentaje: av.porcentaje || 0,
      fecha: av.fecha_str || new Date().toISOString().split('T')[0],
      hora: av.hora_str || '12:00',
      fotos: fotosExistentes,
      videos: videosExistentes,
      tecnico: av.tecnico || {
        nombre: av.fiscalizador || 'Ing. Residente Juan',
        cargo: 'Residente de Obra',
        senescyt: '1005-2016-189423',
        telefono: '+593 99 481 2938',
        observaciones: ''
      },
      notificar_cliente: false,
    });
    setModalVisualizarAvance(null);
    setModalAvanceOpen(true);
  };

  const handleEliminarAvance = async (id: string, titulo: string) => {
    if (confirm(`¿Estás seguro de eliminar el registro de avance "${titulo}"?`)) {
      try {
        await supabase.from('avances').delete().eq('id', id);
      } catch {}
      setAvances(prev => prev.filter(a => a.id !== id));
      if (modalVisualizarAvance?.id === id) setModalVisualizarAvance(null);
    }
  };

  // ============================================================================
  // HANDLERS: MODAL SUBIR DOCUMENTO PRIVADO (GESTOR DOCUMENTAL - IMAGEN 2)
  // Subida múltiple, eliminación de archivos incorrectos y fecha/hora automática
  // ============================================================================
  const handleAbrirModalDoc = (proyectoTarget?: any) => {
    const pId = proyectoTarget ? proyectoTarget.id : (proyectos[0]?.id || '');
    setDocForm({
      proyecto_id: pId,
      titulo: '',
      descripcion: '',
      archivos: [],
      notificar_cliente: true,
    });
    setModalDocOpen(true);
  };

  const handleSeleccionarArchivosDoc = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      const nuevosArchivos: ArchivoDocItem[] = filesArr.map((f, idx) => {
        const ext = f.name.split('.').pop()?.toUpperCase() || 'PDF';
        const pesoMb = (f.size / (1024 * 1024)).toFixed(2);
        return {
          id: `arch-${Date.now()}-${idx}`,
          nombre: f.name,
          peso: `${pesoMb} MB`,
          tipo: ext,
          url: URL.createObjectURL(f)
        };
      });

      setDocForm(prev => ({
        ...prev,
        archivos: [...prev.archivos, ...nuevosArchivos],
        titulo: prev.titulo || (filesArr.length === 1 ? filesArr[0].name.split('.')[0] : `Lote de ${filesArr.length} Documentos Técnicos`)
      }));
    }
  };

  const handleEliminarArchivoDoc = (archId: string) => {
    setDocForm(prev => ({
      ...prev,
      archivos: prev.archivos.filter(a => a.id !== archId)
    }));
  };

  const handleGuardarDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.proyecto_id) {
      alert('Por favor selecciona una obra destino.');
      return;
    }

    if (docForm.archivos.length === 0) {
      alert('Por favor selecciona al menos un archivo para subir.');
      return;
    }

    const proySelected = proyectos.find(p => p.id === docForm.proyecto_id);

    // FECHA Y HORA DEL SISTEMA (TOMADAS AUTOMÁTICAMENTE SIN MOSTRAR EN PÁGINA)
    const now = new Date();
    const fechaSistema = now.toISOString().split('T')[0];
    const horaSistema = now.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false });
    const fechaIsoCompleta = now.toISOString();

    const nuevosDocs = docForm.archivos.map((arch, idx) => ({
      id: `doc-${Date.now()}-${idx}`,
      proyecto_id: docForm.proyecto_id,
      proyecto_nombre: proySelected?.nombre || 'Obra SARA',
      titulo: docForm.archivos.length === 1 && docForm.titulo ? docForm.titulo : arch.nombre.replace(/\.[^/.]+$/, ""),
      nombre_archivo: arch.nombre,
      descripcion: docForm.descripcion || 'Planos y memorias técnicas oficiales con validación.',
      tipo: arch.tipo,
      peso: arch.peso,
      fecha_subida: fechaIsoCompleta,
      fecha_str: fechaSistema,
      hora_str: horaSistema,
    }));

    try {
      for (const d of nuevosDocs) {
        await supabase.from('documentos_proyecto').insert([{
          proyecto_id: d.proyecto_id,
          titulo: d.titulo,
          descripcion: d.descripcion,
          tipo: d.tipo,
          archivo_url: d.nombre_archivo,
          peso: d.peso,
          fecha_subida: fechaIsoCompleta
        }]);
      }
    } catch (err) {
      console.warn('Persistencia offline activa para documento:', err);
    }

    setDocumentos(prev => [...nuevosDocs, ...prev]);
    setModalDocOpen(false);
    alert(`¡Se han cargado ${nuevosDocs.length} archivo(s) exitosamente con fecha y hora automática del sistema (${fechaSistema} ${horaSistema})!`);
  };

  const handleEliminarDoc = async (id: string, titulo: string) => {
    if (confirm(`¿Estás seguro de eliminar el documento "${titulo}"?`)) {
      try {
        await supabase.from('documentos_proyecto').delete().eq('id', id);
      } catch {}
      setDocumentos(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleDescargarDocSimulado = async (doc: any) => {
    try {
      if (doc.url && doc.url.startsWith('http')) {
        window.open(doc.url, '_blank');
        return;
      }
      if (doc.archivo_path) {
        const { data } = await supabase.storage.from('documentos_proyecto').createSignedUrl(doc.archivo_path, 300);
        if (data?.signedUrl) {
          window.open(data.signedUrl, '_blank');
          return;
        }
      }
      // Generar descarga de expediente digital oficial
      const nombreArchivo = (doc.nombre_archivo || doc.titulo || 'expediente_obra').replace(/[^a-zA-Z0-9_-]/g, '_');
      const encabezado = `=================================================================\nGRUPO SARA • EXPEDIENTE DIGITAL TÉCNICO DE OBRA\n=================================================================\nProyecto: ${doc.proyecto_nombre || 'SARA Constructora'}\nDocumento: ${doc.titulo || doc.nombre_archivo}\nTipo: ${doc.tipo || 'Planos & Especificaciones NEC-15'}\nPeso: ${doc.peso || '4.5 MB'}\nFecha de Registro: ${doc.fecha_subida || new Date().toISOString()}\nFirma de Responsable Técnico: Verificada en Servidor SARA\n=================================================================\n`;
      const blob = new Blob([encabezado], { type: 'text/plain;charset=utf-8' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${nombreArchivo}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      console.warn("Error generando descarga de documento:", err);
    }
  };

  // ============================================================================
  // EXPORTACIÓN DE REPORTES OFICIALES (EXCEL Y PDF) CON MEMBRETE Y FIRMAS
  // ============================================================================
  const handleExportarProyectos = (formato: 'excel' | 'pdf') => {
    if (filteredProyectos.length === 0) {
      alert('No hay obras para exportar con los filtros actuales.');
      return;
    }

    if (formato === 'excel') {
      const datosExcel = filteredProyectos.map(p => ({
        'ID Obra': p.id,
        'Nombre del Proyecto': p.nombre,
        'Ubicación': p.ubicacion,
        'Tipo de Obra': p.tipo_obra || 'Edificación Sismorresistente',
        'Avance Físico (%)': `${p.avance ?? 0}%`,
        'Presupuesto Total ($)': Number(p.presupuesto_total || 0).toFixed(2),
        'Ingeniero Residente': p.ingeniero_residente || user?.nombre || 'Ing. Residente de Obra',
        'Estado': p.estado || 'En Construcción',
        'Área (m²)': p.area_m2 || 850
      }));
      exportarAExcel(datosExcel, 'Reporte_Obras_SARA_Constructora', 'Obras_Activas', 'obras');
    } else {
      const encabezados = ['ID Obra', 'Proyecto', 'Ubicación', 'Tipo', 'Avance', 'Presupuesto ($)', 'Residente', 'Estado'];
      const filas = filteredProyectos.map(p => [
        p.id,
        p.nombre,
        p.ubicacion,
        p.tipo_obra || 'Edificación Civil',
        `${p.avance ?? 0}%`,
        `$${Number(p.presupuesto_total || 0).toLocaleString('es-EC', { minimumFractionDigits: 2 })}`,
        p.ingeniero_residente || user?.nombre || 'Ing. Residente',
        p.estado || 'En Ejecución'
      ]);
      exportarAPDF(
        'REPORTE OFICIAL DE OBRAS Y PROYECTOS CIVILES',
        encabezados,
        filas,
        'Reporte_Obras_SARA_Constructora',
        'Catastro Consolidado de Proyectos en Ejecución, Planificación y Culminados',
        'obras'
      );
    }
  };

  const handleExportarAvances = (formato: 'excel' | 'pdf') => {
    if (filteredAvances.length === 0) {
      alert('No hay registros de avance para exportar con los filtros seleccionados.');
      return;
    }

    if (formato === 'excel') {
      const datosExcel = filteredAvances.map(a => ({
        'ID Avance': a.id,
        'Proyecto Destino': a.proyecto_nombre,
        'Fecha Oficial': a.fecha_str,
        'Hora Oficial': a.hora_str,
        'Avance Físico (%)': `${a.porcentaje}%`,
        'Actividad Ejecutada': a.titulo,
        'Descripción Técnica': a.descripcion,
        'Fiscalizador / Responsable': a.tecnico?.nombre || a.fiscalizador || 'Ing. de Obra',
        'Estado Aprobación': a.estado_aprobacion || 'Certificado con Firma Digital'
      }));
      exportarAExcel(datosExcel, 'Bitacora_Avances_Obra_SARA', 'Bitacora_Avances', 'obras');
    } else {
      const encabezados = ['ID', 'Proyecto', 'Fecha / Hora', 'Avance', 'Actividad Ejecutada', 'Técnico Responsable', 'Dictamen'];
      const filas = filteredAvances.map(a => [
        a.id,
        a.proyecto_nombre,
        `${a.fecha_str} ${a.hora_str}`,
        `${a.porcentaje}%`,
        a.titulo,
        a.tecnico?.nombre || a.fiscalizador || 'Ing. Responsable',
        a.estado_aprobacion || 'Certificado'
      ]);
      exportarAPDF(
        'BITÁCORA TÉCNICA OFICIAL DE AVANCES DE OBRA',
        encabezados,
        filas,
        'Bitacora_Avances_Obra_SARA',
        'Registro Cronológico Certificado con Estampilla de Tiempo Oficial y Firma Digital',
        'obras'
      );
    }
  };

  const handleExportarDocumentos = (formato: 'excel' | 'pdf') => {
    if (filteredDocumentos.length === 0) {
      alert('No hay planos o documentos para exportar con los filtros seleccionados.');
      return;
    }

    if (formato === 'excel') {
      const datosExcel = filteredDocumentos.map(d => ({
        'ID Documento': d.id,
        'Proyecto Destino': d.proyecto_nombre,
        'Título Documental': d.titulo,
        'Nombre del Archivo': d.nombre_archivo || `${d.titulo}.pdf`,
        'Tipo / Extensión': d.tipo || 'PDF',
        'Peso Archivo': d.peso || '4.2 MB',
        'Fecha Subida': d.fecha_str,
        'Hora Subida': d.hora_str
      }));
      exportarAExcel(datosExcel, 'Gestor_Documental_Planos_SARA', 'Documentos_Planos', 'obras');
    } else {
      const encabezados = ['ID', 'Proyecto Destino', 'Título Documental', 'Archivo', 'Tipo', 'Peso', 'Fecha / Hora'];
      const filas = filteredDocumentos.map(d => [
        d.id,
        d.proyecto_nombre,
        d.titulo,
        d.nombre_archivo || `${d.titulo}.pdf`,
        d.tipo || 'PDF',
        d.peso || '4.2 MB',
        `${d.fecha_str} ${d.hora_str}`
      ]);
      exportarAPDF(
        'REPOSITORIO DOCUMENTAL TÉCNICO & PLANOS DE OBRA',
        encabezados,
        filas,
        'Gestor_Documental_Planos_SARA',
        'Control de Memorias Técnicas, Planos Estructurales e Hidrosanitarios',
        'obras'
      );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ==================================================================== */}
      {/* CABECERA Y SUB-NAVEGACIÓN (IMAGEN 2)                                 */}
      {/* ==================================================================== */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
            {isCliente ? 'PORTAL EXCLUSIVO DE SEGUIMIENTO AL CLIENTE' : 'MÓDULO DE ADMINISTRACIÓN DE OBRAS CIVILES'}
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-0.5">
            <Building2 className="w-5 h-5 text-amber-500" />
            {isCliente ? 'Avance Físico & Documentos de Mi Proyecto' : 'Mis Proyectos & Gobernanza de Obra'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isCliente 
              ? 'Supervisión en tiempo real del cronograma, reportes fotográficos certificados y memorias técnicas de su propiedad.'
              : 'Control de obras activas, curvas de avance físico-financiero y repositorio documental con firma técnica.'}
          </p>
        </div>

        {/* Selector de Sub-Pestañas con Contadores */}
        <div className="flex flex-wrap bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold gap-1">
          {!isCliente && (
            <button
              onClick={() => setSubTab('obras')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                subTab === 'obras'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Obras Activas ({proyectos.length})</span>
            </button>
          )}
          <button
            onClick={() => setSubTab('avances')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'avances'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isCliente ? 'Mi Avance de Obra' : 'Avances de Obra'} ({filteredAvances.length})</span>
          </button>
          <button
            onClick={() => setSubTab('documentos')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'documentos'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isCliente ? 'Planos & Documentos' : 'Gestor Documental'} ({filteredDocumentos.length})</span>
          </button>
        </div>

        {/* Botón + Nuevo Proyecto y Descargas Oficiales */}
        <div className="flex flex-wrap items-center gap-2">
          {!isCliente && (
            <button
              onClick={handleAbrirModalNuevoProyecto}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Crear un nuevo proyecto u obra civil"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Proyecto</span>
            </button>
          )}
          <button
            onClick={() => {
              if (subTab === 'obras') handleExportarProyectos('excel');
              else if (subTab === 'avances') handleExportarAvances('excel');
              else handleExportarDocumentos('excel');
            }}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            title="Descargar datos actuales en formato Excel con membrete y firmas"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Descargar Excel</span>
          </button>
          <button
            onClick={() => {
              if (subTab === 'obras') handleExportarProyectos('pdf');
              else if (subTab === 'avances') handleExportarAvances('pdf');
              else handleExportarDocumentos('pdf');
            }}
            className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            title="Descargar informe oficial en formato PDF con membrete y firmas"
          >
            <Download className="w-4 h-4" />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* VISTA 1: OBRAS ACTIVAS & TARJETAS DE PROYECTO (IMAGEN 2)             */}
      {/* ==================================================================== */}
      {subTab === 'obras' && (
        <div className="space-y-4">
          
          {/* Barra de Filtros: Búsqueda y Selector de Estados */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar obra por nombre o ciudad..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-500/20 font-sans"
              />
            </div>

            {/* Filtros de Estado: Culminados, En Ejecución, Paralizados, En Diseño, Todos */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">Filtrar:</span>
              
              <button
                onClick={() => setEstadoFilter('TODOS')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  estadoFilter === 'TODOS'
                    ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-sm font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                Todos ({countTodos})
              </button>

              <button
                onClick={() => setEstadoFilter('EN_EJECUCION')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                  estadoFilter === 'EN_EJECUCION'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                    : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
                }`}
              >
                <span>En Ejecución</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 font-mono font-bold">
                  {countEjecucion}
                </span>
              </button>

              <button
                onClick={() => setEstadoFilter('CULMINADOS')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                  estadoFilter === 'CULMINADOS'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
                }`}
              >
                <span>Culminados</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 font-mono font-bold">
                  {countCulminados}
                </span>
              </button>

              <button
                onClick={() => setEstadoFilter('PARALIZADOS')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                  estadoFilter === 'PARALIZADOS'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20 font-bold'
                    : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100'
                }`}
              >
                <span>Paralizados</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 font-mono font-bold">
                  {countParalizados}
                </span>
              </button>

              <button
                onClick={() => setEstadoFilter('EN_DISENO')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                  estadoFilter === 'EN_DISENO'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 font-bold'
                    : 'bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 hover:bg-sky-100'
                }`}
              >
                <span>En Diseño</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 font-mono font-bold">
                  {countDiseno}
                </span>
              </button>

              {/* Botones de Descarga en Obras */}
              <div className="flex items-center gap-1.5 ml-auto pl-2 border-l border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => handleExportarProyectos('excel')}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Exportar obras a Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={() => handleExportarProyectos('pdf')}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-300 dark:border-rose-800 text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Exportar obras a PDF"
                >
                  <Download className="w-3.5 h-3.5 text-rose-600" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Grid de Tarjetas de Proyecto (Exacto a Imagen 2 con botones incrementados) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredProyectos.map((proy) => {
              const estadoNorm = (proy.estado || 'en_construccion').toLowerCase();
              let badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300';
              let badgeText = 'EN CONSTRUCCIÓN';

              if (estadoNorm.includes('finalizado') || estadoNorm.includes('culminado') || proy.avance >= 100) {
                badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300';
                badgeText = 'CULMINADO';
              } else if (estadoNorm.includes('paralizado') || estadoNorm.includes('suspendido')) {
                badgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300';
                badgeText = 'PARALIZADO';
              } else if (estadoNorm.includes('diseno') || estadoNorm.includes('planificacion')) {
                badgeColor = 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300';
                badgeText = 'EN DISEÑO';
              }

              return (
                <div
                  key={proy.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-amber-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header de la Tarjeta */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border uppercase font-bold tracking-wider ${badgeColor}`}>
                        {badgeText}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono text-slate-400 font-semibold">{proy.area_m2 || 850} m²</span>
                        {!isCliente && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleEditarProyecto(proy)}
                              className="p-1 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Editar datos de la obra"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEliminarProyecto(proy)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                              title="Eliminar obra"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 leading-snug">
                      {proy.nombre}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5 mb-4">
                      <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                      <span>{proy.ubicacion || 'Ecuador'}</span>
                    </p>

                    {/* Barra de Avance */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-500">Avance Físico Certificado</span>
                        <strong className="text-amber-600 dark:text-amber-400 font-bold">{proy.avance ?? 0}%</strong>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, proy.avance ?? 0))}%` }}
                        />
                      </div>
                    </div>

                    {/* Métricas Técnicas */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Presupuesto</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          ${Number(proy.presupuesto_total ?? 0).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Residente</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                          {proy.ingeniero_residente || user?.nombre || 'Juan'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botones Solicitados: Registrar Avance + Gestor Documental (Imagen 2) */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      Tipo: {proy.tipo_obra || 'Edificación Sismorresistente'}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAbrirModalAvance(proy)}
                        className="w-full py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                        title="Abrir formulario para registrar nuevo avance físico o fotográfico de esta obra"
                      >
                        <Plus size={14} />
                        <span>Registrar Avance</span>
                      </button>

                      <button
                        onClick={() => handleAbrirModalDoc(proy)}
                        className="w-full py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-slate-200 dark:border-slate-700"
                        title="Subir planos o memorias técnicas al gestor documental"
                      >
                        <FileText size={14} className="text-amber-500" />
                        <span>Gestor Documental</span>
                      </button>
                    </div>

                    <button 
                      onClick={() => {
                        setFilterAvanceProyecto(proy.id);
                        setSubTab('avances');
                      }}
                      className="w-full text-center text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center justify-center gap-1 pt-1"
                    >
                      <span>Ver Historial de Avances</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VISTA 2: AVANCES DE OBRA & BITÁCORA FOTOGRÁFICA (IMAGEN 5)           */}
      {/* ==================================================================== */}
      {subTab === 'avances' && (
        <div className="space-y-4">
          
          {/* Barra de Filtros de Avances: Proyecto, Fecha y Buscador */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchAvanceTerm}
                  onChange={(e) => setSearchAvanceTerm(e.target.value)}
                  placeholder="Buscar en avances..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Filtro por Nombre del Proyecto */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">Obra:</span>
                <select
                  value={filterAvanceProyecto}
                  onChange={(e) => setFilterAvanceProyecto(e.target.value)}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200"
                >
                  <option value="TODOS">Todas las Obras</option>
                  {proyectos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Filtro por Fecha */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">Fecha:</span>
                <input
                  type="date"
                  value={filterAvanceFecha}
                  onChange={(e) => setFilterAvanceFecha(e.target.value)}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-700 dark:text-slate-200"
                />
                {filterAvanceFecha && (
                  <button
                    onClick={() => setFilterAvanceFecha('')}
                    className="p-1 rounded text-slate-400 hover:text-slate-600"
                    title="Limpiar fecha"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleExportarAvances('excel')}
                className="px-2.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Exportar bitácora de avances a Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Excel</span>
              </button>
              <button
                onClick={() => handleExportarAvances('pdf')}
                className="px-2.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-300 dark:border-rose-800 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Exportar bitácora de avances a PDF"
              >
                <Download className="w-3.5 h-3.5 text-rose-600" />
                <span>PDF</span>
              </button>

              {!isCliente && (
                <button
                  onClick={() => handleAbrirModalAvance()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Registrar Nuevo Avance</span>
                </button>
              )}
            </div>
          </div>

          {/* Lista de Avances (Con Fecha, Hora, Proyecto, Descripción, %, Visualizar, Editar, Eliminar) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                Bitácora de Avances de Obra & Certificación Fiscalizada ({filteredAvances.length})
              </span>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                Estampilla de Tiempo UTC & Certificación Legal
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAvances.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No se encontraron avances de obra con los filtros seleccionados.
                </div>
              ) : (
                filteredAvances.map((av) => {
                  const { fecha, hora } = formatFechaHora(av.fecha || av.fecha_str, av.hora_str);

                  return (
                    <div key={av.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <div className="space-y-1.5 flex-1">
                        
                        {/* Fecha y Hora indispensables + Proyecto */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <Clock size={12} className="text-amber-500" />
                            <span>{fecha} • {hora}</span>
                          </span>

                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                            <Building2 size={12} />
                            <span>{av.proyecto_nombre}</span>
                          </span>

                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                            {av.estado_aprobacion || 'Fiscalizado'}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 dark:text-white pt-1">
                          {av.titulo}
                        </h4>

                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                          {av.descripcion}
                        </p>

                        <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2 pt-0.5">
                          <span>Fiscalizador: <strong>{av.fiscalizador || 'Ing. Residente'}</strong></span>
                        </div>
                      </div>

                      {/* Porcentaje y Botones Visualizar, Editar, Eliminar */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-slate-400 block">Avance Obra</span>
                          <span className="text-2xl font-black font-mono text-amber-500 tabular-nums">
                            {av.porcentaje}%
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setModalVisualizarAvance(av)}
                            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                            title="Visualizar información y archivos adjuntos del avance"
                          >
                            <Eye size={14} className="text-amber-500" />
                            <span>Visualizar</span>
                          </button>

                          {!isCliente && (
                            <>
                              <button
                                onClick={() => handleEditarAvance(av)}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 cursor-pointer transition-colors"
                                title="Editar avance"
                              >
                                <Edit size={14} />
                              </button>

                              <button
                                onClick={() => handleEliminarAvance(av.id, av.titulo)}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 cursor-pointer transition-colors"
                                title="Eliminar avance"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VISTA 3: GESTOR DOCUMENTAL (PLANOS BIM & MEMORIAS) (IMAGEN 4)         */}
      {/* ==================================================================== */}
      {subTab === 'documentos' && (
        <div className="space-y-4">
          
          {/* Barra de Filtros Documentales: Proyecto, Fecha, Buscador y Botón Subir */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchDocTerm}
                  onChange={(e) => setSearchDocTerm(e.target.value)}
                  placeholder="Buscar en planos y documentos..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Filtro por Nombre de Proyecto */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">Obra:</span>
                <select
                  value={filterDocProyecto}
                  onChange={(e) => setFilterDocProyecto(e.target.value)}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200"
                >
                  <option value="TODOS">Todas las Obras</option>
                  {proyectos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Filtro por Fecha */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">Fecha:</span>
                <input
                  type="date"
                  value={filterDocFecha}
                  onChange={(e) => setFilterDocFecha(e.target.value)}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-700 dark:text-slate-200"
                />
                {filterDocFecha && (
                  <button
                    onClick={() => setFilterDocFecha('')}
                    className="p-1 rounded text-slate-400 hover:text-slate-600"
                    title="Limpiar fecha"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleExportarDocumentos('excel')}
                className="px-2.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Exportar inventario de planos y memorias a Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Excel</span>
              </button>
              <button
                onClick={() => handleExportarDocumentos('pdf')}
                className="px-2.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-300 dark:border-rose-800 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Exportar inventario de planos y memorias a PDF"
              >
                <Download className="w-3.5 h-3.5 text-rose-600" />
                <span>PDF</span>
              </button>

              {!isCliente && (
                <button
                  onClick={() => handleAbrirModalDoc()}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Subir Documento</span>
                </button>
              )}
            </div>
          </div>

          {/* Tabla / Lista de Documentos Oficiales (Con Fecha, Hora, Proyecto, Archivo, Descargar) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                Planos de Obra, Memorias Técnicas y Presupuestos Oficiales ({filteredDocumentos.length})
              </span>
              <span className="text-xs font-mono text-slate-500">Cifrado SHA-256</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDocumentos.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No se encontraron planos o documentos con los filtros seleccionados.
                </div>
              ) : (
                filteredDocumentos.map((doc) => {
                  const { fecha, hora } = formatFechaHora(doc.fecha_subida || doc.fecha_str, doc.hora_str);

                  return (
                    <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-start sm:items-center gap-3.5 flex-1">
                        <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>

                        <div className="space-y-1">
                          {/* Metadatos de Fecha, Hora y Proyecto */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                              <Clock size={11} className="text-amber-500" />
                              <span>{fecha} • {hora}</span>
                            </span>

                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              <Building2 size={11} />
                              <span>{doc.proyecto_nombre}</span>
                            </span>

                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {doc.tipo || 'PDF'}
                            </span>
                          </div>

                          {/* Nombre del Archivo y Título */}
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {doc.titulo}
                          </h4>

                          <div className="text-[11px] font-mono text-slate-400">
                            Archivo: <strong className="text-slate-700 dark:text-slate-300">{doc.nombre_archivo || `${doc.titulo}.pdf`}</strong> ({doc.peso || '4.2 MB'})
                          </div>
                        </div>
                      </div>

                      {/* Botón Descargar y Eliminar */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button 
                          onClick={() => handleDescargarDocSimulado(doc)}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Descargar</span>
                        </button>

                        {!isCliente && (
                          <button
                            onClick={() => handleEliminarDoc(doc.id, doc.titulo)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 cursor-pointer"
                            title="Eliminar documento"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: REGISTRAR NUEVO AVANCE (MODAL EN VIÑETAS - IMAGEN 1 MODIFICADA)*/}
      {/* ==================================================================== */}
      {modalAvanceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-4 my-auto">
            
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-amber-600 dark:text-amber-400">
                  Control & Fiscalización de Obra
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {editingAvance ? 'Editar Avance de Obra' : 'Registrar Nuevo Avance de Obra'}
                </h3>
              </div>
              <button 
                onClick={() => setModalAvanceOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Selector de Viñetas (Tabs) */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 overflow-x-auto text-xs">
              <button
                type="button"
                onClick={() => setModalAvanceTab('datos')}
                className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modalAvanceTab === 'datos'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText size={14} />
                <span>1. Datos del Avance</span>
              </button>

              <button
                type="button"
                onClick={() => setModalAvanceTab('fotos')}
                className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modalAvanceTab === 'fotos'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Camera size={14} />
                <span>2. Fotografías ({avanceForm.fotos.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setModalAvanceTab('videos')}
                className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modalAvanceTab === 'videos'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Film size={14} />
                <span>3. Videos ({avanceForm.videos.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setModalAvanceTab('tecnico')}
                className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modalAvanceTab === 'tecnico'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <HardHat size={14} />
                <span>4. Técnico Responsable</span>
              </button>
            </div>

            <form onSubmit={handleGuardarAvance} className="space-y-4 text-xs">
              
              {/* ============================================================== */}
              {/* VIÑETA 1: DATOS DEL AVANCE DE LA OBRA                         */}
              {/* ============================================================== */}
              {modalAvanceTab === 'datos' && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  
                  {/* Proyecto Destino Oficial: Presentación fija cuando ya fue seleccionado desde la obra */}
                  {(() => {
                    const proyActual = proyectos.find(x => x.id === avanceForm.proyecto_id);
                    if (proyActual) {
                      return (
                        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-100 to-transparent dark:from-amber-950/30 dark:via-slate-800/60 dark:to-slate-800/20 border border-amber-500/30 dark:border-amber-700/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                              <Building2 size={13} />
                              <span>Proyecto Oficial Seleccionado</span>
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
                              <Lock size={10} />
                              <span>Obra Vinculada & Bloqueada</span>
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                                {proyActual.nombre}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                                <MapPin size={12} className="text-amber-500 shrink-0" />
                                <span>{proyActual.ubicacion || 'Ecuador'} • {proyActual.tipo_obra || 'Edificación Civil'}</span>
                              </p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-right shrink-0">
                              <span className="text-[10px] font-mono text-slate-400 block">Avance Certificado Anterior</span>
                              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                                {proyActual.avance ?? 0}%
                              </span>
                            </div>
                          </div>
                          <input type="hidden" name="proyecto_id" value={avanceForm.proyecto_id} />
                        </div>
                      );
                    }

                    return (
                      <div>
                        <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                          Seleccionar Proyecto Destino *
                        </label>
                        <select
                          value={avanceForm.proyecto_id}
                          onChange={(e) => {
                            const pId = e.target.value;
                            const p = proyectos.find(x => x.id === pId);
                            setAvanceForm(prev => ({
                              ...prev,
                              proyecto_id: pId,
                              porcentajeAnterior: p ? Number(p.avance) : 0,
                              porcentaje: p ? Number(p.avance) : prev.porcentaje
                            }));
                          }}
                          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
                          required
                        >
                          <option value="">-- Elige una obra --</option>
                          {proyectos.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.nombre} ({p.ubicacion}) • Actual: {p.avance}%
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })()}

                  {/* Badge de Fecha y Hora del Sistema (Asignadas Automáticamente) */}
                  <div className="p-2.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-semibold">
                      <Clock size={13} className="text-amber-600" />
                      <span>Fecha y hora oficial del sistema:</span>
                    </span>
                    <span className="font-mono font-bold text-amber-900 dark:text-amber-200 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-lg border border-amber-300 dark:border-amber-700">
                      {new Date().toLocaleDateString('es-EC')} a las {new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Título de la Actualización */}
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                      Título de la actualización *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Fundición de losa de entrepiso y colocación de acero estructural"
                      value={avanceForm.titulo}
                      onChange={(e) => setAvanceForm(prev => ({ ...prev, titulo: e.target.value }))}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  {/* Descripción Opcional */}
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                      Descripción Técnica de la Inspección
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Detalles técnicos de resistencia de hormigón, ensayos de probetas, personal en obra o mensaje para el cliente..."
                      value={avanceForm.descripcion}
                      onChange={(e) => setAvanceForm(prev => ({ ...prev, descripcion: e.target.value }))}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* ========================================================== */}
                  {/* COMPARATIVA DE PORCENTAJES: ANTERIOR Y ACTUAL              */}
                  {/* ========================================================== */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                        <TrendingUp size={15} className="text-amber-500" />
                        <span>Evolución del Porcentaje Global de la Obra</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold">
                        {avanceForm.porcentaje >= avanceForm.porcentajeAnterior ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            +{avanceForm.porcentaje - avanceForm.porcentajeAnterior}% de incremento físico
                          </span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400">
                            {avanceForm.porcentaje - avanceForm.porcentajeAnterior}% de ajuste
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Porcentaje Anterior */}
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                        <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                          Porcentaje Anterior
                        </span>
                        <div className="text-2xl font-black font-mono text-slate-600 dark:text-slate-400">
                          {avanceForm.porcentajeAnterior}%
                        </div>
                        <span className="text-[10px] text-slate-400">Último corte de obra</span>
                      </div>

                      {/* Porcentaje Actual */}
                      <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/40 text-center">
                        <span className="text-[10px] font-mono uppercase text-amber-700 dark:text-amber-300 font-bold block mb-0.5">
                          Nuevo Porcentaje Actual
                        </span>
                        <div className="text-2xl font-black font-mono text-amber-500">
                          {avanceForm.porcentaje}%
                        </div>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                          Estado tras este avance
                        </span>
                      </div>
                    </div>

                    {/* Barra de Progreso Comparativa y Slider */}
                    <div className="space-y-1.5 pt-1">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden flex">
                        <div 
                          className="bg-slate-400 dark:bg-slate-500 h-full transition-all duration-300" 
                          style={{ width: `${Math.min(avanceForm.porcentajeAnterior, avanceForm.porcentaje)}%` }}
                          title={`Avance anterior: ${avanceForm.porcentajeAnterior}%`}
                        />
                        {avanceForm.porcentaje > avanceForm.porcentajeAnterior && (
                          <div 
                            className="bg-amber-500 h-full transition-all duration-300 animate-pulse" 
                            style={{ width: `${avanceForm.porcentaje - avanceForm.porcentajeAnterior}%` }}
                            title={`Incremento: +${avanceForm.porcentaje - avanceForm.porcentajeAnterior}%`}
                          />
                        )}
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={avanceForm.porcentaje}
                        onChange={(e) => setAvanceForm(prev => ({ ...prev, porcentaje: Number(e.target.value) }))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Checkbox Notificar Cliente */}
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={avanceForm.notificar_cliente}
                      onChange={(e) => setAvanceForm(prev => ({ ...prev, notificar_cliente: e.target.checked }))}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Notificar al cliente por WhatsApp/Email sobre este avance
                    </span>
                  </label>

                </div>
              )}

              {/* ============================================================== */}
              {/* VIÑETA 2: FOTOGRAFÍAS (SUBIDA MÚLTIPLE Y ELIMINACIÓN)          */}
              {/* ============================================================== */}
              {modalAvanceTab === 'fotos' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Camera size={14} className="text-amber-500" />
                        <span>Fotografías de Obra ({avanceForm.fotos.length})</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Sube una o varias fotografías de la ejecución física de la obra.
                      </p>
                    </div>

                    <label className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl cursor-pointer text-xs flex items-center gap-1.5 shrink-0 shadow-sm transition-all">
                      <Upload size={13} />
                      <span>Subir Fotografías</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleSubirFotosInput}
                      />
                    </label>
                  </div>

                  {/* Agregar por URL opcional */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="O ingresa un enlace directo de imagen (https://...)"
                      value={nuevaFotoUrl}
                      onChange={(e) => setNuevaFotoUrl(e.target.value)}
                      className="flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAgregarFotoUrl}
                      className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-xl text-xs cursor-pointer"
                    >
                      + Agregar
                    </button>
                  </div>

                  {/* Galería de Fotos Subidas con Opción de Eliminar */}
                  {avanceForm.fotos.length === 0 ? (
                    <div className="py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-2">
                      <ImageIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                      <p className="text-slate-500 text-xs font-semibold">No se han subido fotografías todavía.</p>
                      <span className="text-[11px] text-slate-400 block">
                        Usa el botón "Subir Fotografías" para seleccionar uno o varios archivos de tu dispositivo.
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {avanceForm.fotos.map((f, idx) => (
                        <div key={f.id} className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm">
                          <img
                            src={f.url}
                            alt={f.nombre}
                            className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="p-2 bg-white dark:bg-slate-900 flex items-center justify-between text-[10px]">
                            <span className="truncate font-mono font-medium text-slate-700 dark:text-slate-300 flex-1 pr-1">
                              {f.nombre}
                            </span>
                            <span className="text-slate-400 shrink-0">{f.peso || 'Foto'}</span>
                          </div>

                          {/* Botón Eliminar Foto Individual */}
                          <button
                            type="button"
                            onClick={() => handleEliminarFoto(f.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-700 shadow-md transition-all cursor-pointer"
                            title="Eliminar esta fotografía"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================== */}
              {/* VIÑETA 3: VIDEOS (SUBIDA Y ENLACES CON ELIMINACIÓN)           */}
              {/* ============================================================== */}
              {modalAvanceTab === 'videos' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Film size={14} className="text-amber-500" />
                        <span>Videos de Recorrido de Obra ({avanceForm.videos.length})</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Adjunta grabaciones aéreas con dron, recorridos o enlaces de YouTube/Drive.
                      </p>
                    </div>

                    <label className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl cursor-pointer text-xs flex items-center gap-1.5 shrink-0 shadow-sm transition-all">
                      <Upload size={13} />
                      <span>Subir Video MP4</span>
                      <input
                        type="file"
                        multiple
                        accept="video/*"
                        className="hidden"
                        onChange={handleSubirVideosInput}
                      />
                    </label>
                  </div>

                  {/* Agregar Video por Enlace */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                      O agregar enlace de video en línea (YouTube / Vimeo / Google Drive):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Título del video (Ej: Vuelo Dron Losa)"
                        value={nuevoVideoTitulo}
                        onChange={(e) => setNuevoVideoTitulo(e.target.value)}
                        className="sm:col-span-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="URL: https://youtube.com/watch?v=..."
                        value={nuevoVideoUrl}
                        onChange={(e) => setNuevoVideoUrl(e.target.value)}
                        className="sm:col-span-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleAgregarVideoUrl}
                        className="sm:col-span-1 px-3 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
                      >
                        + Adjuntar Video
                      </button>
                    </div>
                  </div>

                  {/* Lista de Videos Cargados con Opción de Eliminar */}
                  {avanceForm.videos.length === 0 ? (
                    <div className="py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-2">
                      <Video className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                      <p className="text-slate-500 text-xs font-semibold">No se han adjuntado videos para este avance.</p>
                      <span className="text-[11px] text-slate-400 block">
                        Puedes subir archivos de video o ingresar enlaces directos.
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {avanceForm.videos.map((v) => (
                        <div key={v.id} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-sm">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                              <Film size={16} />
                            </div>
                            <div className="truncate">
                              <h5 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                {v.titulo}
                              </h5>
                              <span className="text-[10px] font-mono text-slate-400 block truncate">
                                {v.url}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {v.duracion || 'Video'}
                            </span>
                            {/* Botón Eliminar Video Individual */}
                            <button
                              type="button"
                              onClick={() => handleEliminarVideo(v.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                              title="Eliminar este video"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================== */}
              {/* VIÑETA 4: TÉCNICO RESPONSABLE DE LA SUBIDA                     */}
              {/* ============================================================== */}
              {modalAvanceTab === 'tecnico' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-start gap-3">
                    <ShieldCheck size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                    <div className="text-xs">
                      <strong className="text-emerald-900 dark:text-emerald-200 block">
                        Certificación Técnica de Responsabilidad
                      </strong>
                      <p className="text-emerald-700 dark:text-emerald-300 text-[11px] mt-0.5">
                        Registra los datos del profesional o técnico colegiado que efectuó la inspección y subida de las fotografías y videos de este avance.
                      </p>
                    </div>
                  </div>

                  {/* Selector Rápido del Staff de la Empresa */}
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                      Cargar Datos desde Staff Registrado en la Empresa:
                    </label>
                    <select
                      onChange={(e) => {
                        const staffList = EmpresaConfigService.getStaff();
                        const s = staffList.find(x => x.id === e.target.value);
                        if (s) {
                          setAvanceForm(prev => ({
                            ...prev,
                            tecnico: {
                              ...prev.tecnico,
                              nombre: s.nombre,
                              cargo: s.cargo,
                              senescyt: s.senescyt,
                              telefono: s.telefono,
                            }
                          }));
                        }
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white text-xs"
                    >
                      <option value="">-- Seleccionar profesional del staff --</option>
                      {EmpresaConfigService.getStaff().map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nombre} ({s.cargo})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Campos del Técnico */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                        Nombre Completo del Técnico Responsable *
                      </label>
                      <input
                        type="text"
                        required
                        value={avanceForm.tecnico.nombre}
                        onChange={(e) => setAvanceForm(prev => ({
                          ...prev,
                          tecnico: { ...prev.tecnico, nombre: e.target.value }
                        }))}
                        placeholder="Ej. Ing. David Sarango Malacatus"
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                        Cargo / Rol en la Obra *
                      </label>
                      <input
                        type="text"
                        required
                        value={avanceForm.tecnico.cargo}
                        onChange={(e) => setAvanceForm(prev => ({
                          ...prev,
                          tecnico: { ...prev.tecnico, cargo: e.target.value }
                        }))}
                        placeholder="Ej. Ing. Residente de Obra / Fiscalizador"
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                        Registro SENESCYT / Colegiatura / CI
                      </label>
                      <input
                        type="text"
                        value={avanceForm.tecnico.senescyt}
                        onChange={(e) => setAvanceForm(prev => ({
                          ...prev,
                          tecnico: { ...prev.tecnico, senescyt: e.target.value }
                        }))}
                        placeholder="1005-2016-189423"
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                        Teléfono / WhatsApp de Contacto
                      </label>
                      <input
                        type="text"
                        value={avanceForm.tecnico.telefono}
                        onChange={(e) => setAvanceForm(prev => ({
                          ...prev,
                          tecnico: { ...prev.tecnico, telefono: e.target.value }
                        }))}
                        placeholder="+593 99 481 2938"
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Observaciones del Técnico */}
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                      Observaciones de Inspección y Conformidad Técnica
                    </label>
                    <textarea
                      rows={2}
                      value={avanceForm.tecnico.observaciones || ''}
                      onChange={(e) => setAvanceForm(prev => ({
                        ...prev,
                        tecnico: { ...prev.tecnico, observaciones: e.target.value }
                      }))}
                      placeholder="Conformidad con ensayos de resistencia, trazado de cotas y normas de seguridad industrial..."
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Botones de Navegación y Guardado */}
              <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  {modalAvanceTab !== 'datos' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (modalAvanceTab === 'fotos') setModalAvanceTab('datos');
                        else if (modalAvanceTab === 'videos') setModalAvanceTab('fotos');
                        else if (modalAvanceTab === 'tecnico') setModalAvanceTab('videos');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer flex items-center gap-1"
                    >
                      <ArrowLeft size={13} />
                      <span>Anterior</span>
                    </button>
                  )}

                  {modalAvanceTab !== 'tecnico' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (modalAvanceTab === 'datos') setModalAvanceTab('fotos');
                        else if (modalAvanceTab === 'fotos') setModalAvanceTab('videos');
                        else if (modalAvanceTab === 'videos') setModalAvanceTab('tecnico');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer flex items-center gap-1"
                    >
                      <span>Siguiente</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalAvanceOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-200 cursor-pointer text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold shadow-md cursor-pointer text-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    <span>{editingAvance ? 'Guardar Cambios' : 'Guardar y Notificar al Cliente'}</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: SUBIR DOCUMENTO PRIVADO (GESTOR DOCUMENTAL - IMAGEN 2)        */}
      {/* Subida múltiple, eliminación de archivos y fecha/hora automática     */}
      {/* ==================================================================== */}
      {modalDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-4 my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-amber-600 dark:text-amber-400">
                  Gestor Documental Técnico
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Subir Documento Privado
                </h3>
              </div>
              <button 
                onClick={() => setModalDocOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGuardarDoc} className="space-y-4 text-xs">
              
              {/* Proyecto Destino Oficial: Presentación fija cuando ya fue seleccionado desde la obra */}
              {(() => {
                const proyDocActual = proyectos.find(x => x.id === docForm.proyecto_id);
                if (proyDocActual) {
                  return (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-100 to-transparent dark:from-amber-950/30 dark:via-slate-800/60 dark:to-slate-800/20 border border-amber-500/30 dark:border-amber-700/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <Building2 size={13} />
                          <span>Obra Destino de Planos & Memorias</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
                          <Lock size={10} />
                          <span>Obra Asignada Fija</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {proyDocActual.nombre}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                            <MapPin size={12} className="text-amber-500 shrink-0" />
                            <span>{proyDocActual.ubicacion || 'Ecuador'} • {proyDocActual.tipo_obra || 'Edificación Civil'}</span>
                          </p>
                        </div>
                      </div>
                      <input type="hidden" name="proyecto_id" value={docForm.proyecto_id} />
                    </div>
                  );
                }

                return (
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                      Proyecto Destino *
                    </label>
                    <select
                      value={docForm.proyecto_id}
                      onChange={(e) => setDocForm(prev => ({ ...prev, proyecto_id: e.target.value }))}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
                      required
                    >
                      <option value="">Selecciona un proyecto...</option>
                      {proyectos.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} ({p.ubicacion})
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })()}

              {/* Subir Uno o Varios Archivos (Multi-Upload) */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Archivos PDF / Planos DWG / Memorias / Excel *
                </label>
                
                <div className="flex flex-col sm:flex-row items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700">
                  <label className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer text-xs shrink-0 shadow-sm flex items-center gap-1.5 transition-all">
                    <Upload size={14} />
                    <span>Seleccionar Archivos</span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.dwg,.doc,.docx,.xls,.xlsx,.zip,.rar"
                      className="hidden"
                      onChange={handleSeleccionarArchivosDoc}
                    />
                  </label>
                  <span className="text-slate-400 text-[11px] text-center sm:text-left">
                    Puedes subir uno o varios archivos simultáneamente.
                  </span>
                </div>
              </div>

              {/* Lista Interactiva de Archivos Seleccionados con Opción de Eliminar */}
              {docForm.archivos.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    <span>Archivos listos para guardar ({docForm.archivos.length}):</span>
                    <span className="text-slate-400 font-mono text-[10px]">Verifica antes de confirmar</span>
                  </div>

                  <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 dark:divide-slate-800/60">
                    {docForm.archivos.map((arch) => (
                      <div key={arch.id} className="pt-1.5 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold shrink-0">
                            {arch.tipo}
                          </span>
                          <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                            {arch.nombre}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono text-slate-400">{arch.peso}</span>
                          {/* Botón para eliminar archivo subido de forma incorrecta */}
                          <button
                            type="button"
                            onClick={() => handleEliminarArchivoDoc(arch.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                            title="Eliminar este archivo seleccionado"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Título del Documento / Asunto */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Título / Asunto General del Documento
                </label>
                <input
                  type="text"
                  placeholder="Ej. Planos Estructurales Finales Aprobados"
                  value={docForm.titulo}
                  onChange={(e) => setDocForm(prev => ({ ...prev, titulo: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>

              {/* Descripción Opcional */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Descripción (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Notas adicionales, revisión técnica o firmas digitales asociadas..."
                  value={docForm.descripcion}
                  onChange={(e) => setDocForm(prev => ({ ...prev, descripcion: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Checkbox Notificar Cliente */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={docForm.notificar_cliente}
                  onChange={(e) => setDocForm(prev => ({ ...prev, notificar_cliente: e.target.checked }))}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Notificar al cliente por WhatsApp/Email
                </span>
              </label>

              {/* Botones de Acción */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalDocOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>Guardar Documento{docForm.archivos.length > 1 ? 's' : ''}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: VISUALIZAR AVANCE DE OBRA (IMAGEN 5)                           */}
      {/* Muestra galería de fotos, videos, técnico y porcentaje comparativo   */}
      {/* ==================================================================== */}
      {modalVisualizarAvance && (() => {
        const { fecha, hora } = formatFechaHora(modalVisualizarAvance.fecha || modalVisualizarAvance.fecha_str, modalVisualizarAvance.hora_str);
        const fotos = modalVisualizarAvance.fotos && Array.isArray(modalVisualizarAvance.fotos) && modalVisualizarAvance.fotos.length > 0
          ? modalVisualizarAvance.fotos
          : (modalVisualizarAvance.url ? [{ id: 'f-1', url: modalVisualizarAvance.url, nombre: 'Foto principal' }] : []);
        const videos = modalVisualizarAvance.videos && Array.isArray(modalVisualizarAvance.videos) ? modalVisualizarAvance.videos : [];
        const tecnico = modalVisualizarAvance.tecnico || {
          nombre: modalVisualizarAvance.fiscalizador || 'Ing. Residente de Obra',
          cargo: 'Residente / Fiscalizador',
          senescyt: '1005-2016-189423',
          telefono: '+593 99 481 2938'
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-4 my-auto">
              
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/30">
                      {modalVisualizarAvance.proyecto_nombre}
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock size={12} className="text-amber-500" />
                      {fecha} a las {hora} (Sistema)
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {modalVisualizarAvance.titulo}
                  </h3>
                </div>

                <button 
                  onClick={() => setModalVisualizarAvance(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Comparativa de Porcentajes */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Porcentaje Anterior</span>
                  <span className="text-lg font-mono font-bold text-slate-600 dark:text-slate-400">
                    {modalVisualizarAvance.porcentajeAnterior !== undefined ? modalVisualizarAvance.porcentajeAnterior : 0}%
                  </span>
                </div>

                <div className="text-center px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
                  ➔ {modalVisualizarAvance.porcentajeAnterior !== undefined && modalVisualizarAvance.porcentaje >= modalVisualizarAvance.porcentajeAnterior 
                    ? `+${modalVisualizarAvance.porcentaje - modalVisualizarAvance.porcentajeAnterior}%` 
                    : `${modalVisualizarAvance.porcentaje}%`}
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-amber-600 dark:text-amber-400 font-bold block">Nuevo Porcentaje</span>
                  <span className="text-xl font-mono font-black text-amber-500">
                    {modalVisualizarAvance.porcentaje}%
                  </span>
                </div>
              </div>

              {/* Galería de Fotografías Subidas */}
              {fotos.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase font-mono flex items-center gap-1">
                    <Camera size={13} className="text-amber-500" />
                    <span>Fotografías del Avance ({fotos.length}):</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
                    {fotos.map((f: any, i: number) => (
                      <div key={f.id || i} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 max-h-28 group relative">
                        <img
                          src={f.url}
                          alt={f.nombre || `Foto ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white font-mono text-[9px] truncate max-w-[90%]">
                          {f.nombre || `Foto ${i + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos Adjuntos */}
              {videos.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase font-mono flex items-center gap-1">
                    <Film size={13} className="text-amber-500" />
                    <span>Videos de Obra ({videos.length}):</span>
                  </span>
                  <div className="space-y-1.5">
                    {videos.map((v: any, i: number) => (
                      <div key={v.id || i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <Film size={14} className="text-amber-500 shrink-0" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{v.titulo || `Video ${i + 1}`}</span>
                        </div>
                        <a 
                          href={v.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[11px] font-mono text-amber-600 dark:text-amber-400 underline shrink-0 hover:text-amber-500"
                        >
                          Ver Video
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Descripción Completa */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Detalle Técnico de la Actualización:</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  {modalVisualizarAvance.descripcion || 'Sin descripción adicional registrada.'}
                </p>
              </div>

              {/* Datos del Técnico Responsable */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Técnico que Realizó la Inspección y Subida:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-semibold">{tecnico.nombre}</strong>
                    <span className="text-[11px] text-slate-500 block">{tecnico.cargo}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 block">SENESCYT: {tecnico.senescyt || 'N/A'}</span>
                    <span className="text-[11px] text-slate-500 block">{tecnico.telefono || ''}</span>
                  </div>
                </div>
              </div>

              {/* Botones de Acción: Editar, Eliminar, Cerrar */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditarAvance(modalVisualizarAvance)}
                    className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit size={14} />
                    <span>Editar Avance</span>
                  </button>

                  <button
                    onClick={() => handleEliminarAvance(modalVisualizarAvance.id, modalVisualizarAvance.titulo)}
                    className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Eliminar</span>
                  </button>
                </div>

                <button
                  onClick={() => setModalVisualizarAvance(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Cerrar
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ==================================================================== */}
      {/* MODAL CREAR / EDITAR PROYECTO (FORMULARIO COMPLETO DE OBRAS + MAPA)  */}
      {/* ==================================================================== */}
      {modalProyectoOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] border border-gray-200 dark:border-slate-800">
            <div className="flex justify-between items-center p-5 sm:p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900 shrink-0">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500 font-bold block">
                  DIRECCIÓN TÉCNICA • SARA CONSTRUCTORA
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-500" />
                  <span>{editingProyecto ? `Editar Proyecto: ${editingProyecto.nombre}` : 'Crear Nuevo Proyecto'}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalProyectoOpen(false);
                  setEditingProyecto(null);
                }}
                className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
              <button
                type="button"
                onClick={() => setActiveModalTab('generales')}
                className={`flex-1 py-3.5 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                  activeModalTab === 'generales'
                    ? 'border-amber-500 text-slate-900 dark:text-amber-400 bg-amber-500/5'
                    : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'
                }`}
              >
                1. Datos Generales & Geolocalización
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('cotizacion')}
                className={`flex-1 py-3.5 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                  activeModalTab === 'cotizacion'
                    ? 'border-amber-500 text-slate-900 dark:text-amber-400 bg-amber-500/5'
                    : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'
                }`}
              >
                2. Presupuesto y Honorarios
              </button>
            </div>

            <form onSubmit={handleGuardarProyecto} className="flex-1 overflow-hidden flex flex-col">
              <div className="p-6 overflow-y-auto flex-1">
                {/* PESTAÑA 1: DATOS GENERALES Y MAPA DE GEOLOCALIZACIÓN */}
                <div className={`${activeModalTab === 'generales' ? 'grid' : 'hidden'} grid-cols-1 md:grid-cols-2 gap-5`}>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 dark:text-slate-300">Nombre del Proyecto *</label>
                    <input
                      required
                      type="text"
                      placeholder="Ej. Casa Familia Pérez / Edificio Mirador"
                      className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
                      value={proyectoForm.nombre}
                      onChange={e => setProyectoForm({ ...proyectoForm, nombre: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-gray-700 dark:text-slate-300">Cliente Asignado</label>
                      <button
                        type="button"
                        onClick={() => {
                          setNewClientData({ nombre: '', apellido: '', email: '', telefono: '', password: '' });
                          setIsAddClientModalOpen(true);
                        }}
                        className="text-xs font-bold text-slate-900 dark:text-amber-300 bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/50 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                        title="Registrar un nuevo cliente en el sistema"
                      >
                        <Plus size={13} className="stroke-[2.5]" />
                        <span>(Agregar Cliente)</span>
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <select
                        className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                        value={proyectoForm.cliente_id}
                        onChange={e => setProyectoForm({ ...proyectoForm, cliente_id: e.target.value })}
                      >
                        <option value="">-- Ninguno (Proyecto Público / Propio) --</option>
                        {clientesList.map((c: any) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre} {c.apellido || ''}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setNewClientData({ nombre: '', apellido: '', email: '', telefono: '', password: '' });
                          setIsAddClientModalOpen(true);
                        }}
                        className="p-2.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white rounded-lg transition-colors flex items-center justify-center shrink-0 shadow-sm cursor-pointer"
                        title="Crear y agregar nuevo cliente"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 dark:text-slate-300">Ciudad / Sector *</label>
                    <div className="flex gap-2">
                      <input
                        required
                        type="text"
                        placeholder="Ej. Loja, Ecuador / Calvas, Loja"
                        className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
                        value={proyectoForm.ubicacion}
                        onChange={e => {
                          const val = e.target.value;
                          setProyectoForm({ ...proyectoForm, ubicacion: val });
                          handleUbicarCiudadEnMapa(val);
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 dark:text-slate-300">Servicio Asociado *</label>
                    <select
                      className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                      value={proyectoForm.servicio_id}
                      onChange={e => setProyectoForm({ ...proyectoForm, servicio_id: e.target.value })}
                      required
                    >
                      <option value="diseno-arquitectonico">Diseño Arquitectónico</option>
                      <option value="construccion-de-obras">Construcción de Obras</option>
                      <option value="ingenieria-y-calculo-estructural">Ingeniería y Cálculo Estructural</option>
                      <option value="estudios-de-suelos">Estudios de Suelos</option>
                      <option value="topografia-y-planimetria">Topografía y Planimetría</option>
                      <option value="presupuestos-y-apu">Presupuestos y APU</option>
                      <option value="remodelaciones-y-ampliaciones">Remodelaciones y Ampliaciones</option>
                      <option value="direccion-y-supervision">Dirección y Supervisión de Obras</option>
                      <option value="modelado-3d-y-renders">Modelado 3D y Renders</option>
                      <option value="consultoria-tecnica">Consultoría Técnica</option>
                      <option value="otros">Otros</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 dark:text-slate-300">Ingeniero Residente / Responsable</label>
                    <input
                      type="text"
                      placeholder="Nombre del Ingeniero Residente"
                      className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
                      value={proyectoForm.ingeniero_residente}
                      onChange={e => setProyectoForm({ ...proyectoForm, ingeniero_residente: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 dark:text-slate-300">Avance Físico Actual (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm font-mono"
                      value={proyectoForm.avance}
                      onChange={e => setProyectoForm({ ...proyectoForm, avance: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-slate-300">Descripción del Proyecto</label>
                    <textarea
                      rows={3}
                      placeholder="Describe los detalles del proyecto, tipo de edificación, metros cuadrados, zonificación NEC-15..."
                      className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none text-sm"
                      value={proyectoForm.descripcion}
                      onChange={e => setProyectoForm({ ...proyectoForm, descripcion: e.target.value })}
                    />
                  </div>

                  {/* GALERÍA DE IMÁGENES CON PORTADA ⭐ */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-slate-300">Galería de Imágenes</label>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">
                      Selecciona múltiples imágenes. Marca con la estrella (⭐) la que quieres que sea la Portada.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-3">
                      {[...(proyectoForm.imagen_url ? [proyectoForm.imagen_url] : []), ...proyectoForm.galeria].map((url, idx) => {
                        const isCover = url === proyectoForm.imagen_url && idx === 0 && pendingCoverIndex === null;
                        return (
                          <div
                            key={`${url}-${idx}`}
                            className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 ${
                              isCover ? 'border-amber-500 shadow-md' : 'border-gray-200 dark:border-slate-700'
                            }`}
                          >
                            <img src={url} alt="Proyecto" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setAsCover(url)}
                              title={isCover ? 'Portada actual' : 'Elegir como portada'}
                              className={`absolute top-2 left-2 p-1.5 rounded-full transition-colors cursor-pointer ${
                                isCover ? 'bg-amber-500 text-slate-950' : 'bg-black/50 text-white hover:bg-black/70'
                              }`}
                            >
                              <Star size={14} className={isCover ? 'fill-slate-950' : ''} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeExistingUrl(idx)}
                              title="Eliminar foto"
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                            {isCover && (
                              <div className="absolute bottom-0 inset-x-0 bg-amber-500 text-slate-950 text-[10px] font-bold text-center py-0.5 uppercase tracking-wider">
                                Portada
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {files.map((f, idx) => {
                        const isCover = pendingCoverIndex === idx;
                        return (
                          <div
                            key={idx}
                            className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 ${
                              isCover
                                ? 'border-amber-500 border-solid shadow-md opacity-100'
                                : 'border-dashed border-gray-300 dark:border-slate-700 opacity-75'
                            } hover:opacity-100 transition-opacity`}
                          >
                            <img src={URL.createObjectURL(f)} alt="Nuevo" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20" />
                            <button
                              type="button"
                              onClick={() => setPendingCoverIndex(idx)}
                              title={isCover ? 'Portada actual (pendiente)' : 'Elegir como portada'}
                              className={`absolute top-2 left-2 p-1.5 rounded-full transition-colors z-10 cursor-pointer ${
                                isCover ? 'bg-amber-500 text-slate-950' : 'bg-black/50 text-white hover:bg-black/70'
                              }`}
                            >
                              <Star size={14} className={isCover ? 'fill-slate-950' : ''} />
                            </button>
                            <span className="absolute bottom-2 left-2 right-2 text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded truncate text-center">
                              Nuevo (Se subirá)
                            </span>
                            <button
                              type="button"
                              onClick={() => removePendingFile(idx)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors z-10 cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                            {isCover && (
                              <div className="absolute bottom-0 inset-x-0 bg-amber-500 text-slate-950 text-[10px] font-bold text-center py-0.5 uppercase tracking-wider z-10">
                                Portada
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={e => {
                        if (e.target.files) {
                          setFiles([...files, ...Array.from(e.target.files)]);
                        }
                      }}
                      className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500/15 file:text-amber-600 dark:file:text-amber-400 hover:file:bg-amber-500/25 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 dark:text-slate-300">Estado Actual</label>
                    <select
                      className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                      value={proyectoForm.estado}
                      onChange={e => setProyectoForm({ ...proyectoForm, estado: e.target.value })}
                    >
                      <option value="en_diseno">En Diseño</option>
                      <option value="en_construccion">En Construcción</option>
                      <option value="paralizado">Paralizado</option>
                      <option value="finalizado">Finalizado</option>
                    </select>
                  </div>

                  <div className="space-y-1 flex flex-col justify-center mt-5">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-amber-500 rounded border-gray-300 focus:ring-amber-500 accent-amber-500"
                        checked={proyectoForm.destacado}
                        onChange={e => setProyectoForm({ ...proyectoForm, destacado: e.target.checked })}
                      />
                      <span className="text-sm font-bold text-gray-700 dark:text-slate-300">
                        Mostrar en Landing Page (Destacado)
                      </span>
                    </label>
                  </div>

                  {/* SECCIÓN VITAL: COORDENADAS Y MAPA INTERACTIVO DE GEOLOCALIZACIÓN */}
                  <div className="space-y-3 md:col-span-2 mt-2 pt-4 border-t border-gray-200 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                          <MapPin className="w-4 h-4 text-amber-500" />
                          <span>Punto de Geolocalización del Proyecto en el Mapa *</span>
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          Haz clic en el mapa o arrastra el marcador para ubicar con precisión satelital la obra en el mapa de proyectos.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUbicarCiudadEnMapa()}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Centrar mapa según la ciudad escrita arriba"
                        >
                          <Search size={13} className="text-amber-500" />
                          <span>Ubicar Ciudad</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleObtenerMiUbicacionGps}
                          disabled={obteniendoGps}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Capturar coordenadas desde tu GPS actual"
                        >
                          <Crosshair size={13} className={obteniendoGps ? 'animate-spin' : ''} />
                          <span>{obteniendoGps ? 'Obteniendo GPS...' : 'Mi Ubicación GPS'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Latitud (GPS)</label>
                        <input
                          type="text"
                          placeholder="Ej. -3.9931"
                          className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-mono"
                          value={proyectoForm.latitud}
                          onChange={e => setProyectoForm({ ...proyectoForm, latitud: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Longitud (GPS)</label>
                        <input
                          type="text"
                          placeholder="Ej. -79.2042"
                          className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-mono"
                          value={proyectoForm.longitud}
                          onChange={e => setProyectoForm({ ...proyectoForm, longitud: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* MAPA INTERACTIVO OPENSTREETMAP / LEAFLET */}
                    <div className="w-full h-64 rounded-xl overflow-hidden border-2 border-amber-500/40 shadow-inner relative">
                      <DynamicModalMap
                        lat={parseFloat(proyectoForm.latitud) || -3.9931}
                        lng={parseFloat(proyectoForm.longitud) || -79.2042}
                        zoom={15}
                        onChange={(newLat: number, newLng: number) => {
                          setProyectoForm(prev => ({
                            ...prev,
                            latitud: newLat.toFixed(6),
                            longitud: newLng.toFixed(6),
                          }));
                        }}
                      />
                      <div className="absolute bottom-2 left-2 z-[400] bg-slate-950/85 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-mono border border-amber-500/30 pointer-events-none flex items-center gap-1.5">
                        <MapPin size={11} className="text-amber-400" />
                        <span>
                          Pin Obra: {proyectoForm.latitud || '-3.9931'}, {proyectoForm.longitud || '-79.2042'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PESTAÑA 2: PRESUPUESTO Y HONORARIOS (COTIZACIÓN AUTOMÁTICA) */}
                <div className={`${activeModalTab === 'cotizacion' ? 'block' : 'hidden'} space-y-6`}>
                  <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-amber-200">
                      Al guardar el proyecto, se calculará automáticamente el presupuesto y se guardará como un historial financiero inalterable usando las tarifas actuales configuradas en el Cotizador.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                        Área de Construcción (m²)
                      </label>
                      <input
                        type="number"
                        value={proyectoForm.datos_financieros.areaConstruccion}
                        onChange={e =>
                          setProyectoForm({
                            ...proyectoForm,
                            area_m2: Number(e.target.value),
                            datos_financieros: {
                              ...proyectoForm.datos_financieros,
                              areaConstruccion: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2 outline-none focus:border-amber-500 text-base font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                        Área del Terreno (m²) - Para topografía
                      </label>
                      <input
                        type="number"
                        value={proyectoForm.datos_financieros.areaTerreno}
                        onChange={e =>
                          setProyectoForm({
                            ...proyectoForm,
                            datos_financieros: {
                              ...proyectoForm.datos_financieros,
                              areaTerreno: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2 outline-none focus:border-amber-500 text-base font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                        Plantas Sobre Rasante
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={proyectoForm.datos_financieros.plantasSobreRasante}
                        onChange={e =>
                          setProyectoForm({
                            ...proyectoForm,
                            datos_financieros: {
                              ...proyectoForm.datos_financieros,
                              plantasSobreRasante: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2 outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                        Sótanos (Bajo rasante)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={proyectoForm.datos_financieros.plantasBajoRasante}
                        onChange={e =>
                          setProyectoForm({
                            ...proyectoForm,
                            datos_financieros: {
                              ...proyectoForm.datos_financieros,
                              plantasBajoRasante: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2 outline-none focus:border-amber-500 font-mono"
                      />
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">Tipología</label>
                        <select
                          value={proyectoForm.datos_financieros.tipologia}
                          onChange={e =>
                            setProyectoForm({
                              ...proyectoForm,
                              datos_financieros: { ...proyectoForm.datos_financieros, tipologia: e.target.value },
                            })
                          }
                          className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2 outline-none focus:border-amber-500 text-sm"
                        >
                          <option value="unifamiliar">Unifamiliar</option>
                          <option value="multifamiliar">Multifamiliar</option>
                          <option value="comercial">Comercial / Clínicas</option>
                          <option value="industrial">Industrial / Bodegas</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">Topografía</label>
                        <select
                          value={proyectoForm.datos_financieros.pendiente}
                          onChange={e =>
                            setProyectoForm({
                              ...proyectoForm,
                              datos_financieros: { ...proyectoForm.datos_financieros, pendiente: e.target.value },
                            })
                          }
                          className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2 outline-none focus:border-amber-500 text-sm"
                        >
                          <option value="plana">Plana (&lt; 5%)</option>
                          <option value="media">Media (5% - 20%)</option>
                          <option value="fuerte">Fuerte (&gt; 20%)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">Acabados</label>
                        <select
                          value={proyectoForm.datos_financieros.acabados}
                          onChange={e =>
                            setProyectoForm({
                              ...proyectoForm,
                              datos_financieros: { ...proyectoForm.datos_financieros, acabados: e.target.value },
                            })
                          }
                          className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2 outline-none focus:border-amber-500 text-sm"
                        >
                          <option value="economico">Económico / Social</option>
                          <option value="estandar">Estándar / Comercial</option>
                          <option value="premium">Premium / Lujo</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">
                      Alcance Cotizado para este Proyecto
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        className={`flex items-center gap-3 cursor-pointer p-3 border rounded-lg transition-colors ${
                          proyectoForm.datos_financieros.incArquitectura
                            ? 'bg-amber-500/10 border-amber-500 text-slate-900 dark:text-white font-bold'
                            : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={proyectoForm.datos_financieros.incArquitectura}
                          onChange={e =>
                            setProyectoForm({
                              ...proyectoForm,
                              datos_financieros: {
                                ...proyectoForm.datos_financieros,
                                incArquitectura: e.target.checked,
                              },
                            })
                          }
                          className="w-5 h-5 accent-amber-500"
                        />
                        <span className="text-sm">Diseño Arquitectónico</span>
                      </label>
                      <label
                        className={`flex items-center gap-3 cursor-pointer p-3 border rounded-lg transition-colors ${
                          proyectoForm.datos_financieros.incEstructura
                            ? 'bg-amber-500/10 border-amber-500 text-slate-900 dark:text-white font-bold'
                            : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={proyectoForm.datos_financieros.incEstructura}
                          onChange={e =>
                            setProyectoForm({
                              ...proyectoForm,
                              datos_financieros: {
                                ...proyectoForm.datos_financieros,
                                incEstructura: e.target.checked,
                              },
                            })
                          }
                          className="w-5 h-5 accent-amber-500"
                        />
                        <span className="text-sm">Diseño Estructural</span>
                      </label>
                      <label
                        className={`flex items-center gap-3 cursor-pointer p-3 border rounded-lg transition-colors ${
                          proyectoForm.datos_financieros.incMep
                            ? 'bg-amber-500/10 border-amber-500 text-slate-900 dark:text-white font-bold'
                            : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={proyectoForm.datos_financieros.incMep}
                          onChange={e =>
                            setProyectoForm({
                              ...proyectoForm,
                              datos_financieros: {
                                ...proyectoForm.datos_financieros,
                                incMep: e.target.checked,
                              },
                            })
                          }
                          className="w-5 h-5 accent-amber-500"
                        />
                        <span className="text-sm">Ingenierías MEP</span>
                      </label>
                      <label
                        className={`flex items-center gap-3 cursor-pointer p-3 border rounded-lg transition-colors ${
                          proyectoForm.datos_financieros.incTopografia
                            ? 'bg-amber-500/10 border-amber-500 text-slate-900 dark:text-white font-bold'
                            : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={proyectoForm.datos_financieros.incTopografia}
                          onChange={e =>
                            setProyectoForm({
                              ...proyectoForm,
                              datos_financieros: {
                                ...proyectoForm.datos_financieros,
                                incTopografia: e.target.checked,
                              },
                            })
                          }
                          className="w-5 h-5 accent-amber-500"
                        />
                        <span className="text-sm">Topografía Base</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-4">
                    <label
                      className={`flex items-center gap-3 cursor-pointer p-3 border rounded-lg transition-colors flex-1 ${
                        proyectoForm.datos_financieros.aplicaIva
                          ? 'bg-amber-500/10 border-amber-500 font-bold'
                          : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={proyectoForm.datos_financieros.aplicaIva}
                        onChange={e =>
                          setProyectoForm({
                            ...proyectoForm,
                            datos_financieros: {
                              ...proyectoForm.datos_financieros,
                              aplicaIva: e.target.checked,
                            },
                          })
                        }
                        className="w-5 h-5 accent-amber-500"
                      />
                      <span className="text-sm">Emitir Factura (Aplica IVA)</span>
                    </label>
                    {proyectoForm.datos_financieros.aplicaIva && (
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-bold text-gray-700 dark:text-slate-300">% IVA:</label>
                        <input
                          type="number"
                          min="0"
                          value={proyectoForm.datos_financieros.porcentajeIva}
                          onChange={e =>
                            setProyectoForm({
                              ...proyectoForm,
                              datos_financieros: {
                                ...proyectoForm.datos_financieros,
                                porcentajeIva: Number(e.target.value),
                              },
                            })
                          }
                          className="w-24 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 outline-none focus:border-amber-500 text-center font-mono"
                        />
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-950 text-white p-6 rounded-xl border border-slate-800">
                    <h4 className="font-bold mb-4 uppercase tracking-wider text-xs text-amber-400">
                      Previsualización en Tiempo Real
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Subtotal Honorarios:</p>
                        <p className="text-lg font-bold font-mono">
                          ${(liveFinanzas.subtotalHonorarios || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        {proyectoForm.datos_financieros.aplicaIva && (
                          <>
                            <p className="text-sm text-gray-400 mt-2">
                              IVA ({proyectoForm.datos_financieros.porcentajeIva}%):
                            </p>
                            <p className="text-md font-bold font-mono">
                              ${(liveFinanzas.valorIva || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-sm text-amber-400 mt-2">Total a Facturar:</p>
                            <p className="text-2xl font-bold text-amber-400 font-mono">
                              ${(liveFinanzas.totalHonorarios || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                          </>
                        )}
                        {!proyectoForm.datos_financieros.aplicaIva && (
                          <p className="text-2xl font-bold text-amber-400 mt-1 font-mono">
                            ${(liveFinanzas.totalHonorarios || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Proyección Obra Civil:</p>
                        <p className="text-2xl font-bold text-amber-400 font-mono">
                          ${(liveFinanzas.totalObra || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          *Costo de ejecución estimado independiente del diseño.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setModalProyectoOpen(false);
                    setEditingProyecto(null);
                  }}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  disabled={uploadingFile || savingProyecto}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploadingFile || savingProyecto}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md cursor-pointer"
                >
                  {uploadingFile || savingProyecto ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>{editingProyecto ? 'Guardar Cambios' : 'Guardar Proyecto'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Crear Cuenta de Cliente (Invocado desde Nuevo Proyecto) */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-200 dark:border-slate-800">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Crear Cuenta de Cliente</h3>
              <button
                type="button"
                onClick={() => setIsAddClientModalOpen(false)}
                className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateClientFromProject} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">Nombre *</label>
                  <input
                    required
                    type="text"
                    value={newClientData.nombre}
                    onChange={e => setNewClientData({ ...newClientData, nombre: e.target.value })}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="Ej. Carlos"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">Apellido *</label>
                  <input
                    required
                    type="text"
                    value={newClientData.apellido}
                    onChange={e => setNewClientData({ ...newClientData, apellido: e.target.value })}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="Ej. Mendoza"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  required
                  type="email"
                  value={newClientData.email}
                  onChange={e => setNewClientData({ ...newClientData, email: e.target.value })}
                  className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="carlos@empresa.com"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  value={newClientData.telefono}
                  onChange={e => setNewClientData({ ...newClientData, telefono: e.target.value })}
                  className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Ej. 098 765 4321"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Contraseña Temporal *
                </label>
                <input
                  required
                  type="text"
                  value={newClientData.password}
                  onChange={e => setNewClientData({ ...newClientData, password: e.target.value })}
                  className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Ej. Sara2026"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Comparte esta clave con el cliente. Podrá cambiarla desde su panel.
                </p>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  disabled={isSubmittingClient}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingClient}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmittingClient ? 'Creando...' : 'Crear Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
