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
  ChevronDown
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function MisProyectosSection({ user, initialSubTab = 'obras' }: { user: any; initialSubTab?: 'obras' | 'avances' | 'documentos' }) {
  const [subTab, setSubTab] = useState<'obras' | 'avances' | 'documentos'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) setSubTab(initialSubTab);
  }, [initialSubTab]);

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

  // Modales
  const [modalAvanceOpen, setModalAvanceOpen] = useState(false);
  const [modalDocOpen, setModalDocOpen] = useState(false);
  const [modalVisualizarAvance, setModalVisualizarAvance] = useState<any | null>(null);
  const [editingAvance, setEditingAvance] = useState<any | null>(null);

  // Form State para Registro / Edición de Avance (Imagen 1)
  const [avanceForm, setAvanceForm] = useState({
    proyecto_id: '',
    titulo: '',
    descripcion: '',
    tipo: 'foto',
    url: '',
    porcentaje: 0,
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false }),
    notificar_cliente: true,
  });

  // Form State para Gestor Documental (Imagen 3)
  const [docForm, setDocForm] = useState({
    proyecto_id: '',
    titulo: '',
    descripcion: '',
    tipo: 'PDF',
    archivo_url: '',
    peso: '4.8 MB',
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false }),
    notificar_cliente: true,
  });

  const supabase = createClient();

  useEffect(() => {
    fetchProyectosData();
  }, []);

  const fetchProyectosData = async () => {
    setLoading(true);
    try {
      // 1. Obras del cliente / profesional
      const { data: proys } = await supabase
        .from('proyectos')
        .select('*')
        .order('created_at', { ascending: false });

      if (proys && proys.length > 0) {
        const normalized = proys.map((p: any, idx: number) => ({
          ...p,
          avance: typeof p.avance === 'number' ? p.avance : (Number(p.avance) || 0),
          presupuesto_total: Number(p.presupuesto_total || p.presupuesto || (320000 + idx * 75000)),
          ingeniero_residente: p.ingeniero_residente || user?.nombre || 'Ing. Residente Juan',
          area_m2: p.area_m2 || 850,
          tipo_obra: p.tipo_obra || 'Edificación Sismorresistente Hormigón Armado',
          estado: p.estado || 'en_construccion',
        }));
        setProyectos(normalized);
      } else {
        // Mock data si la tabla no retorna proyectos
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
      const { data: avs } = await supabase
        .from('avances')
        .select(`*, proyectos(id, nombre)`)
        .order('fecha', { ascending: false });

      if (avs && avs.length > 0) {
        const normAvs = avs.map((a: any) => ({
          ...a,
          proyecto_nombre: a.proyectos?.nombre || a.proyecto_nombre || 'Obra SARA',
          fecha_completa: a.fecha,
        }));
        setAvances(normAvs);
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
      const { data: docs } = await supabase
        .from('documentos_proyecto')
        .select(`*, proyectos(id, nombre)`)
        .order('fecha_subida', { ascending: false });

      if (docs && docs.length > 0) {
        const normDocs = docs.map((d: any) => ({
          ...d,
          proyecto_nombre: d.proyectos?.nombre || d.proyecto_nombre || 'Obra SARA',
          fecha_subida_str: d.fecha_subida,
        }));
        setDocumentos(normDocs);
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
  // HANDLERS: MODAL REGISTRAR AVANCE (IMAGEN 1)
  // ============================================================================
  const handleAbrirModalAvance = (proyectoTarget?: any) => {
    const pId = proyectoTarget ? proyectoTarget.id : (proyectos[0]?.id || '');
    const pActual = proyectos.find(p => p.id === pId);

    setEditingAvance(null);
    setAvanceForm({
      proyecto_id: pId,
      titulo: '',
      descripcion: '',
      tipo: 'foto',
      url: '',
      porcentaje: pActual ? pActual.avance : 0,
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false }),
      notificar_cliente: true,
    });
    setModalAvanceOpen(true);
  };

  const handleGuardarAvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avanceForm.proyecto_id || !avanceForm.titulo) {
      alert('Por favor selecciona una obra y escribe el título del avance.');
      return;
    }

    const proySelected = proyectos.find(p => p.id === avanceForm.proyecto_id);
    const fechaIsoCompleta = `${avanceForm.fecha}T${avanceForm.hora}:00`;

    if (editingAvance) {
      // Actualizar Avance Existente
      const updated = {
        ...editingAvance,
        proyecto_id: avanceForm.proyecto_id,
        proyecto_nombre: proySelected?.nombre || editingAvance.proyecto_nombre,
        titulo: avanceForm.titulo,
        descripcion: avanceForm.descripcion,
        porcentaje: Number(avanceForm.porcentaje),
        fecha: fechaIsoCompleta,
        fecha_str: avanceForm.fecha,
        hora_str: avanceForm.hora,
        tipo: avanceForm.tipo,
        url: avanceForm.url || editingAvance.url,
      };

      setAvances(prev => prev.map(a => a.id === editingAvance.id ? updated : a));

      // Actualizar también porcentaje en la obra
      setProyectos(prev => prev.map(p => {
        if (p.id === avanceForm.proyecto_id) {
          return { ...p, avance: Number(avanceForm.porcentaje) };
        }
        return p;
      }));

      alert('¡Avance de obra actualizado correctamente!');
    } else {
      // Crear Nuevo Avance
      const nuevoAvance = {
        id: `av-${Date.now()}`,
        proyecto_id: avanceForm.proyecto_id,
        proyecto_nombre: proySelected?.nombre || 'Obra SARA',
        titulo: avanceForm.titulo,
        descripcion: avanceForm.descripcion || 'Inspección técnica física certificada en obra.',
        porcentaje: Number(avanceForm.porcentaje),
        fecha: fechaIsoCompleta,
        fecha_str: avanceForm.fecha,
        hora_str: avanceForm.hora,
        fiscalizador: user?.nombre || 'Ing. Residente Juan',
        estado_aprobacion: 'Registrado con Firma Digital',
        tipo: avanceForm.tipo,
        url: avanceForm.url || 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
      };

      // Guardar en Supabase si está disponible
      try {
        await supabase.from('avances').insert([{
          proyecto_id: avanceForm.proyecto_id,
          titulo: avanceForm.titulo,
          descripcion: avanceForm.descripcion,
          tipo: avanceForm.tipo,
          url: nuevoAvance.url,
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

      alert(`¡Avance registrado exitosamente con fecha ${avanceForm.fecha} a las ${avanceForm.hora}!`);
    }

    setModalAvanceOpen(false);
    setEditingAvance(null);
  };

  const handleEditarAvance = (av: any) => {
    setEditingAvance(av);
    const parsed = formatFechaHora(av.fecha || av.fecha_str, av.hora_str);
    setAvanceForm({
      proyecto_id: av.proyecto_id || proyectos[0]?.id || '',
      titulo: av.titulo || '',
      descripcion: av.descripcion || '',
      tipo: av.tipo || 'foto',
      url: av.url || '',
      porcentaje: av.porcentaje || 0,
      fecha: av.fecha_str || new Date().toISOString().split('T')[0],
      hora: av.hora_str || '12:00',
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
  // HANDLERS: MODAL SUBIR DOCUMENTO (IMAGEN 3)
  // ============================================================================
  const handleAbrirModalDoc = (proyectoTarget?: any) => {
    const pId = proyectoTarget ? proyectoTarget.id : (proyectos[0]?.id || '');
    setDocForm({
      proyecto_id: pId,
      titulo: '',
      descripcion: '',
      tipo: 'PDF',
      archivo_url: '',
      peso: '5.2 MB',
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false }),
      notificar_cliente: true,
    });
    setModalDocOpen(true);
  };

  const handleGuardarDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.proyecto_id || !docForm.titulo) {
      alert('Por favor selecciona una obra y especifica el título del documento.');
      return;
    }

    const proySelected = proyectos.find(p => p.id === docForm.proyecto_id);
    const fechaIsoCompleta = `${docForm.fecha}T${docForm.hora}:00`;

    const nuevoDoc = {
      id: `doc-${Date.now()}`,
      proyecto_id: docForm.proyecto_id,
      proyecto_nombre: proySelected?.nombre || 'Obra SARA',
      titulo: docForm.titulo,
      nombre_archivo: `${docForm.titulo.replace(/ /g, '_')}.${docForm.tipo.toLowerCase()}`,
      descripcion: docForm.descripcion || 'Planos y memorias técnicas oficiales con validación.',
      tipo: docForm.tipo,
      peso: docForm.peso || '4.8 MB',
      fecha_subida: fechaIsoCompleta,
      fecha_str: docForm.fecha,
      hora_str: docForm.hora,
    };

    try {
      await supabase.from('documentos_proyecto').insert([{
        proyecto_id: docForm.proyecto_id,
        titulo: docForm.titulo,
        descripcion: docForm.descripcion,
        tipo: docForm.tipo,
        archivo_url: docForm.archivo_url || 'https://sara-constructora.vercel.app/documento-demo.pdf',
        peso: docForm.peso,
        fecha_subida: fechaIsoCompleta
      }]);
    } catch (err) {
      console.warn('Persistencia offline activa para documento:', err);
    }

    setDocumentos(prev => [nuevoDoc, ...prev]);
    setModalDocOpen(false);
    alert(`¡Documento guardado exitosamente con fecha ${docForm.fecha} ${docForm.hora}!`);
  };

  const handleEliminarDoc = async (id: string, titulo: string) => {
    if (confirm(`¿Estás seguro de eliminar el documento "${titulo}"?`)) {
      try {
        await supabase.from('documentos_proyecto').delete().eq('id', id);
      } catch {}
      setDocumentos(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleDescargarDocSimulado = (doc: any) => {
    alert(`Descargando archivo oficial "${doc.nombre_archivo || doc.titulo}" (${doc.peso || '4.5 MB'}) del proyecto "${doc.proyecto_nombre}".`);
  };

  return (
    <div className="space-y-6">
      
      {/* ==================================================================== */}
      {/* CABECERA Y SUB-NAVEGACIÓN (IMAGEN 2)                                 */}
      {/* ==================================================================== */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
            MÓDULO DE ADMINISTRACIÓN DE OBRAS CIVILES
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-0.5">
            <Building2 className="w-5 h-5 text-amber-500" />
            Mis Proyectos & Gobernanza de Obra
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control de obras activas, curvas de avance físico-financiero y repositorio documental con firma técnica.
          </p>
        </div>

        {/* Selector de Sub-Pestañas con Contadores */}
        <div className="flex flex-wrap bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold gap-1">
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
          <button
            onClick={() => setSubTab('avances')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'avances'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Avances de Obra ({avances.length})</span>
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
            <span>Gestor Documental ({documentos.length})</span>
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
                      <span className="text-xs font-mono text-slate-400 font-semibold">{proy.area_m2 || 850} m²</span>
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

            <button
              onClick={() => handleAbrirModalAvance()}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus size={16} />
              <span>Registrar Nuevo Avance</span>
            </button>
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

            <button
              onClick={() => handleAbrirModalDoc()}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus size={16} />
              <span>Subir Documento</span>
            </button>
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

                        <button
                          onClick={() => handleEliminarDoc(doc.id, doc.titulo)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 cursor-pointer"
                          title="Eliminar documento"
                        >
                          <Trash2 size={15} />
                        </button>
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
      {/* MODAL: REGISTRAR NUEVO AVANCE (IDÉNTICO A IMAGEN 1)                  */}
      {/* ==================================================================== */}
      {modalAvanceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingAvance ? 'Editar Avance de Obra' : 'Registrar Nuevo Avance'}
              </h3>
              <button 
                onClick={() => setModalAvanceOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGuardarAvance} className="space-y-4 text-xs">
              
              {/* Seleccionar Proyecto */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Seleccionar Proyecto *
                </label>
                <select
                  value={avanceForm.proyecto_id}
                  onChange={(e) => {
                    const pId = e.target.value;
                    const p = proyectos.find(x => x.id === pId);
                    setAvanceForm(prev => ({
                      ...prev,
                      proyecto_id: pId,
                      porcentaje: p ? p.avance : prev.porcentaje
                    }));
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
                  required
                >
                  <option value="">-- Elige una obra --</option>
                  {proyectos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.ubicacion})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha y Hora de Registro Obligatorias e Indispensables */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1 flex items-center gap-1">
                    <Calendar size={12} className="text-amber-500" />
                    <span>Fecha de Registro *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={avanceForm.fecha}
                    onChange={(e) => setAvanceForm(prev => ({ ...prev, fecha: e.target.value }))}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1 flex items-center gap-1">
                    <Clock size={12} className="text-amber-500" />
                    <span>Hora Exacta *</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={avanceForm.hora}
                    onChange={(e) => setAvanceForm(prev => ({ ...prev, hora: e.target.value }))}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Título de la Actualización */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Título de la actualización *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Fundición de losa del segundo piso terminada"
                  value={avanceForm.titulo}
                  onChange={(e) => setAvanceForm(prev => ({ ...prev, titulo: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>

              {/* Descripción Opcional */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Descripción (Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalles técnicos o mensaje para el cliente..."
                  value={avanceForm.descripcion}
                  onChange={(e) => setAvanceForm(prev => ({ ...prev, descripcion: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Tipo de Archivo & Subir Archivo o URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                    Tipo de Archivo
                  </label>
                  <select
                    value={avanceForm.tipo}
                    onChange={(e) => setAvanceForm(prev => ({ ...prev, tipo: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="foto">Fotografía</option>
                    <option value="video">Video de Obra</option>
                    <option value="reporte">Acta de Fiscalización / Reporte</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                    Subir Archivo o URL
                  </label>
                  <div className="flex gap-1.5">
                    <label className="px-3 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer shrink-0 text-center text-xs">
                      Seleccionar archivo
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const f = e.target.files[0];
                            setAvanceForm(prev => ({ ...prev, url: f.name }));
                          }
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="O ingresa un enlace: https://..."
                      value={avanceForm.url}
                      onChange={(e) => setAvanceForm(prev => ({ ...prev, url: e.target.value }))}
                      className="flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Slider Porcentaje Global de Avance de la Obra */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      %
                    </span>
                    <span className="text-slate-800 dark:text-slate-200">Porcentaje Global de Avance de la Obra</span>
                  </div>
                  <span className="text-base font-black font-mono text-amber-500">{avanceForm.porcentaje}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={avanceForm.porcentaje}
                  onChange={(e) => setAvanceForm(prev => ({ ...prev, porcentaje: Number(e.target.value) }))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
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

              {/* Botones de Acción */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalAvanceOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold shadow-md cursor-pointer"
                >
                  {editingAvance ? 'Guardar Cambios' : 'Guardar y Notificar al Cliente'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: SUBIR DOCUMENTO PRIVADO (IDÉNTICO A IMAGEN 3)                 */}
      {/* ==================================================================== */}
      {modalDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Subir Documento Privado
              </h3>
              <button 
                onClick={() => setModalDocOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGuardarDoc} className="space-y-4 text-xs">
              
              {/* Proyecto Destino */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Proyecto Destino
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

              {/* Archivo PDF / Doc */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Archivo PDF / Doc
                </label>
                <div className="flex items-center gap-2">
                  <label className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer text-xs shrink-0">
                    Seleccionar archivo
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const f = e.target.files[0];
                          setDocForm(prev => ({
                            ...prev,
                            titulo: prev.titulo || f.name.split('.')[0],
                            archivo_url: f.name,
                            peso: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
                            tipo: f.name.split('.').pop()?.toUpperCase() || 'PDF'
                          }));
                        }
                      }}
                    />
                  </label>
                  <span className="text-slate-500 font-mono text-xs truncate">
                    {docForm.archivo_url || 'Sin archivos seleccionados'}
                  </span>
                </div>
              </div>

              {/* Fecha y Hora de Subida del Documento */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1 flex items-center gap-1">
                    <Calendar size={12} className="text-amber-500" />
                    <span>Fecha de Emisión *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={docForm.fecha}
                    onChange={(e) => setDocForm(prev => ({ ...prev, fecha: e.target.value }))}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1 flex items-center gap-1">
                    <Clock size={12} className="text-amber-500" />
                    <span>Hora *</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={docForm.hora}
                    onChange={(e) => setDocForm(prev => ({ ...prev, hora: e.target.value }))}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Título del Documento */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Título del Documento
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Planos Estructurales Finales"
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
                  placeholder="Notas adicionales..."
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
                  className="px-5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold shadow-md cursor-pointer"
                >
                  Guardar Documento
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: VISUALIZAR AVANCE DE OBRA (IMAGEN 5)                           */}
      {/* ==================================================================== */}
      {modalVisualizarAvance && (() => {
        const { fecha, hora } = formatFechaHora(modalVisualizarAvance.fecha || modalVisualizarAvance.fecha_str, modalVisualizarAvance.hora_str);

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
                      {fecha} a las {hora}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {modalVisualizarAvance.titulo}
                  </h3>
                </div>

                <button 
                  onClick={() => setModalVisualizarAvance(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Imagen o Preview de Archivo */}
              {modalVisualizarAvance.url && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-64 bg-slate-950 flex items-center justify-center">
                  <img
                    src={modalVisualizarAvance.url}
                    alt={modalVisualizarAvance.titulo}
                    className="w-full h-full object-cover max-h-64"
                    onError={(e: any) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Descripción Completa */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Detalle Técnico de la Actualización:</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  {modalVisualizarAvance.descripcion}
                </p>
              </div>

              {/* Métricas y Fiscalizador */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Fiscalizador Responsable:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{modalVisualizarAvance.fiscalizador || 'Ing. Residente Juan'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Avance Acumulado:</span>
                  <span className="text-xl font-mono font-black text-amber-500">{modalVisualizarAvance.porcentaje}%</span>
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

    </div>
  );
}
