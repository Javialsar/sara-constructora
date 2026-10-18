'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Share2, 
  Users, 
  HardHat, 
  Plus, 
  Trash2, 
  Crosshair, 
  Compass, 
  UploadCloud, 
  CheckCircle2, 
  Save, 
  FileCheck2, 
  ShieldCheck, 
  PenTool, 
  Warehouse, 
  ShoppingCart, 
  Receipt, 
  Layers,
  FileSpreadsheet,
  QrCode
} from 'lucide-react';
import { 
  EmpresaConfigService, 
  EmpresaIdentidad, 
  ProfesionalStaff, 
  ReportesConfig,
  ModuloFirmaConfig
} from '@/lib/services/empresaConfigService';

// Importación dinámica de Leaflet para evitar problemas de SSR
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-slate-100 dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 text-sm gap-2 animate-pulse">
      <Compass size={28} className="animate-spin text-amber-500" />
      <span>Cargando mapa interactivo & geolocalización satelital...</span>
    </div>
  )
});

// 24 Provincias y Cantones de Ecuador
const PROVINCIAS_ECUADOR: Record<string, string[]> = {
  "Azuay": ["Cuenca", "Gualaceo", "Paute", "Santa Isabel", "Sigsig", "Chordeleg", "Girón", "San Fernando", "Nabón"],
  "Loja": ["Loja", "Catamayo", "Saraguro", "Calvas", "Macará", "Paltas", "Puyango", "Celica", "Gonzanamá", "Zapotillo", "Chaguarpamba", "Espíndola", "Pindal", "Quilanga", "Sozoranga", "Olmedo"],
  "Pichincha": ["Quito", "Rumiñahui", "Mejía", "Cayambe", "Pedro Moncayo", "San Miguel de los Bancos", "Puerto Quito", "Pedro Vicente Maldonado"],
  "Guayas": ["Guayaquil", "Samborondón", "Daule", "Durán", "Milagro", "Salitre", "Playas", "Balao", "El Empalme", "Naranjal", "Pedro Carbo"],
  "El Oro": ["Machala", "Pasaje", "Santa Rosa", "Arenillas", "Huaquillas", "Piñas", "Zaruma", "Atahualpa", "Portovelo"],
  "Manabí": ["Manta", "Portoviejo", "Chone", "Montecristi", "Jipijapa", "Sucre (Bahía)", "Pedernales", "El Carmen", "Tosagua", "Rocafuerte", "Calceta"],
  "Tungurahua": ["Ambato", "Baños", "Pelileo", "Píllaro", "Cevallos", "Mocha", "Patate", "Quero", "Tisaleo"],
  "Chimborazo": ["Riobamba", "Guano", "Alausí", "Colta", "Chambo", "Pallatanga", "Guamote", "Cumandá"],
  "Imbabura": ["Ibarra", "Otavalo", "Cotacachi", "Antonio Ante", "Pimampiro", "Urcuquí"],
  "Cotopaxi": ["Latacunga", "Pujilí", "Salcedo", "Saquisilí", "La Maná", "Pangua", "Sigchos"],
  "Cañar": ["Azogues", "La Troncal", "Cañar", "Biblián", "El Tambo", "Déleg", "Suscal"],
  "Santo Domingo": ["Santo Domingo", "La Concordia"],
  "Esmeraldas": ["Esmeraldas", "Atacames", "Quinindé", "San Lorenzo", "Muisne", "Rioverde", "Eloy Alfaro"],
  "Los Ríos": ["Babahoyo", "Quevedo", "Vinces", "Ventanas", "Buena Fe", "Montalvo", "Valencia"],
  "Carchi": ["Tulcán", "Montúfar", "Espejo", "Mira", "Bolívar", "San Pedro de Huaca"],
  "Bolívar": ["Guaranda", "San Miguel", "Chimbo", "Caluma", "Echeandía", "Chillanes", "Las Naves"],
  "Pastaza": ["Puyo", "Mera", "Santa Clara", "Arajuno"],
  "Morona Santiago": ["Macas", "Gualaquiza", "Sucúa", "Limón Indanza", "Méndez", "Palora"],
  "Napo": ["Tena", "Archidona", "El Chaco", "Quijos", "Carlos Julio Arosemena Tola"],
  "Zamora Chinchipe": ["Zamora", "Yantzaza", "El Pangui", "Centinela del Cóndor", "Chinchipe", "Nangaritza"],
  "Sucumbíos": ["Nueva Loja (Lago Agrio)", "Shushufindi", "Cuyabeno", "Putumayo", "Cascales", "Gonzalo Pizarro"],
  "Orellana": ["Francisco de Orellana (Coca)", "La Joya de los Sachas", "Loreto", "Aguarico"],
  "Santa Elena": ["Santa Elena", "La Libertad", "Salinas"],
  "Galápagos": ["Puerto Baquerizo Moreno", "Puerto Ayora (Santa Cruz)", "Puerto Villamil (Isabela)"]
};

const COORDENADAS_PROVINCIAS: Record<string, [number, number]> = {
  "Azuay": [-2.9001, -79.0058],
  "Loja": [-3.9931, -79.2042],
  "Pichincha": [-0.1806, -78.4678],
  "Guayas": [-2.1894, -79.8890],
  "El Oro": [-3.2581, -79.9550],
  "Manabí": [-1.0545, -80.4544],
  "Tungurahua": [-1.2490, -78.6167],
  "Chimborazo": [-1.6635, -78.6546],
  "Imbabura": [0.3517, -78.1223],
  "Cotopaxi": [-0.9352, -78.6155],
  "Cañar": [-2.7396, -78.8486],
  "Santo Domingo": [-0.2530, -79.1753],
  "Esmeraldas": [0.9592, -79.6539],
  "Los Ríos": [-1.8021, -79.5344],
  "Carchi": [0.8123, -77.7172],
  "Bolívar": [-1.5925, -79.0041],
  "Pastaza": [-1.4923, -78.0025],
  "Morona Santiago": [-2.3086, -78.1113],
  "Napo": [-0.9938, -77.8128],
  "Zamora Chinchipe": [-4.0692, -78.9566],
  "Sucumbíos": [0.0847, -76.8828],
  "Orellana": [-0.4638, -76.9872],
  "Santa Elena": [-2.2262, -80.8587],
  "Galápagos": [-0.9537, -90.9656]
};

export type ModuloReporteTipo = 'obras' | 'bodega' | 'compras' | 'contabilidad';

export function ConfiguracionEmpresaSection() {
  const [activeSubTab, setActiveSubTab] = useState<'identidad' | 'reportes'>('identidad');
  const [selectedModuloFirma, setSelectedModuloFirma] = useState<ModuloReporteTipo>('obras');

  const [empresa, setEmpresa] = useState<EmpresaIdentidad>(() => EmpresaConfigService.getEmpresa());
  const [logoBase64, setLogoBase64] = useState<string | null>(() => EmpresaConfigService.getLogo());
  const [staffTecnico, setStaffTecnico] = useState<ProfesionalStaff[]>(() => EmpresaConfigService.getStaff());
  const [reportesConfig, setReportesConfig] = useState<ReportesConfig>(() => EmpresaConfigService.getReportesConfig());

  const [mapPosition, setMapPosition] = useState<[number, number]>([
    empresa.latitud || -3.99313,
    empresa.longitud || -79.20422
  ]);

  const [isLocating, setIsLocating] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [modalStaffOpen, setModalStaffOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nuevoStaff, setNuevoStaff] = useState<Omit<ProfesionalStaff, 'id'>>({
    nombre: '',
    cargo: 'Ingeniero Civil Estructural',
    senescyt: '',
    telefono: '',
    email: ''
  });

  useEffect(() => {
    if (mapPosition && !isNaN(mapPosition[0]) && !isNaN(mapPosition[1])) {
      setEmpresa(prev => ({
        ...prev,
        latitud: Number(mapPosition[0].toFixed(6)),
        longitud: Number(mapPosition[1].toFixed(6))
      }));
    }
  }, [mapPosition]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("El logotipo excede los 2MB permitidos. Por favor sube un archivo optimizado.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setLogoBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleEliminarLogo = () => {
    setLogoBase64(null);
  };

  const handleProvinciaChange = (prov: string) => {
    const cantones = PROVINCIAS_ECUADOR[prov] || [];
    const primerCanton = cantones[0] || prov;
    const coords = COORDENADAS_PROVINCIAS[prov] || mapPosition;

    setEmpresa(prev => ({
      ...prev,
      provincia: prov,
      canton: primerCanton,
      ciudad: primerCanton,
      latitud: coords[0],
      longitud: coords[1]
    }));
    setMapPosition(coords);
  };

  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("La geolocalización no está soportada por tu navegador.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setMapPosition([lat, lng]);
        setEmpresa(prev => ({ ...prev, latitud: lat, longitud: lng }));
        setIsLocating(false);
      },
      (err) => {
        console.warn("GPS error:", err);
        setIsLocating(false);
        alert("No se pudo detectar el GPS automático. Por favor arrastra el marcador manualmente sobre el mapa.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleAgregarStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoStaff.nombre.trim()) return;

    const staffActualizado: ProfesionalStaff[] = [
      ...staffTecnico,
      {
        id: `staff-${Date.now()}`,
        ...nuevoStaff
      }
    ];

    setStaffTecnico(staffActualizado);
    setModalStaffOpen(false);
    setNuevoStaff({
      nombre: '',
      cargo: 'Ingeniero Civil Estructural',
      senescyt: '',
      telefono: '',
      email: ''
    });
  };

  const handleEliminarStaff = (id: string) => {
    setStaffTecnico(prev => prev.filter(s => s.id !== id));
  };

  // Actualización de firmas según el módulo seleccionado
  const handleFirmaChange = (campo: keyof ModuloFirmaConfig, valor: any) => {
    setReportesConfig(prev => ({
      ...prev,
      firmasPorModulo: {
        ...prev.firmasPorModulo,
        [selectedModuloFirma]: {
          ...prev.firmasPorModulo[selectedModuloFirma],
          [campo]: valor
        }
      }
    }));
  };

  const handleGuardarTodo = (e: React.FormEvent) => {
    e.preventDefault();
    EmpresaConfigService.saveConfig(empresa, logoBase64, staffTecnico, reportesConfig);
    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 3500);
  };

  const firmaActual = reportesConfig.firmasPorModulo[selectedModuloFirma];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Banner Superior Corporativo */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest mb-1">
            <Building2 size={16} />
            <span>Configuración Oficial de la Empresa • SARA CONSTRUCTORA</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Identidad Corporativa, Logotipo, Membrete & Firmas por Módulo
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Personaliza los datos legales, geolocalización de la matriz y el esquema de firmas oficiales para los reportes de <b>Obras</b>, <b>Bodega</b>, <b>Compras</b> y <b>Contabilidad</b>.
          </p>
        </div>

        <button
          onClick={handleGuardarTodo}
          className="shrink-0 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-102"
        >
          <Save size={18} />
          <span>Guardar Cambios</span>
        </button>
      </div>

      {guardadoExitoso && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 size={20} className="shrink-0" />
          <div className="text-xs font-medium">
            <span className="font-bold">¡Configuración guardada exitosamente!</span> Los membretes oficiales, firmas por módulo y reportes en PDF y Excel han sido actualizados con los datos de tu empresa.
          </div>
        </div>
      )}

      {/* Selector de Viñetas Principales (Viñeta 1 vs Viñeta 2) */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('identidad')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
            activeSubTab === 'identidad'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Building2 size={16} />
          <span>1. Identidad Corporativa, Logotipo & Geolocalización</span>
        </button>

        <button
          onClick={() => setActiveSubTab('reportes')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
            activeSubTab === 'reportes'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <FileCheck2 size={16} />
          <span>2. Parámetros de Reportes, Membrete & Firmas por Módulo</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIÑETA 1: IDENTIDAD CORPORATIVA, LOGOTIPO, DIRECCIÓN JUNTO AL MAPA       */}
      {/* ========================================================================= */}
      {activeSubTab === 'identidad' && (
        <div className="space-y-6">
          {/* 1.1 IDENTIDAD LEGAL & LOGOTIPO OFICIAL */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-wider">
                <ShieldCheck size={18} className="text-amber-400" />
                <span>Datos Oficiales & Logotipo de la Empresa Constructora</span>
              </div>
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
                Membrete & Facturación
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Logo Cuadro */}
              <div className="lg:col-span-1 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />

                {logoBase64 ? (
                  <div className="space-y-3 w-full flex flex-col items-center">
                    <div className="w-full h-32 bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-inner">
                      <img
                        src={logoBase64}
                        alt="Logotipo Oficial"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 transition-colors"
                      >
                        Cambiar
                      </button>
                      <button
                        type="button"
                        onClick={handleEliminarLogo}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <UploadCloud size={28} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Logotipo de la Empresa</p>
                      <p className="text-[10px] text-slate-400">PNG, JPG o SVG (máx. 2MB)</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-1 text-xs font-bold px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow transition-all font-sans"
                    >
                      Subir Logotipo
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-slate-400 mt-2 text-center">
                  Aparecerá en el encabezado oficial de tus reportes PDF, actas de fiscalización y hojas de Excel.
                </p>
              </div>

              {/* Formulario de Campos de Identidad */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                    Razón Social Oficial (SRI / Registro Mercantil)
                  </label>
                  <input
                    type="text"
                    value={empresa.razon_social}
                    onChange={e => setEmpresa(prev => ({ ...prev, razon_social: e.target.value }))}
                    placeholder="Ej. LIDER ARQUITECTURA & CONSTRUCCIÓN CÍA. LTDA."
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Nombre legal registrado para contratos y facturación electrónica.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                    Nombre Comercial
                  </label>
                  <input
                    type="text"
                    value={empresa.nombre_comercial}
                    onChange={e => setEmpresa(prev => ({ ...prev, nombre_comercial: e.target.value }))}
                    placeholder="Ej. ARQ-PRISMA"
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Nombre de marca visible.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                    Número de RUC (Ecuador)
                  </label>
                  <input
                    type="text"
                    maxLength={13}
                    value={empresa.ruc}
                    onChange={e => setEmpresa(prev => ({ ...prev, ruc: e.target.value }))}
                    placeholder="Ej. 1102978630001"
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">13 dígitos reglamentarios.</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                    Gerente General / Representante Legal
                  </label>
                  <input
                    type="text"
                    value={empresa.gerente}
                    onChange={e => setEmpresa(prev => ({ ...prev, gerente: e.target.value }))}
                    placeholder="Ej. Ing. David Sarango Malacatus"
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Suscribe ofertas técnicas y contratos legales de obra.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 1.2 DIRECCIÓN MATRIZ & GEOLOCALIZACIÓN SATELITAL INTERACTIVA */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="bg-slate-900 text-white p-4 font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs md:text-sm uppercase tracking-wider">
                <MapPin size={18} className="text-amber-400" />
                <span>Dirección Matriz & Geolocalización Satelital Interactiva</span>
              </div>

              <button
                type="button"
                onClick={handleGPSLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition-all disabled:opacity-50"
              >
                <Crosshair size={13} className={isLocating ? "animate-spin" : ""} />
                <span>{isLocating ? "Detectando GPS..." : "📍 Mi Ubicación GPS en Vivo"}</span>
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                      Provincia
                    </label>
                    <select
                      value={empresa.provincia}
                      onChange={e => handleProvinciaChange(e.target.value)}
                      className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {Object.keys(PROVINCIAS_ECUADOR).map(prov => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                      Cantón
                    </label>
                    <select
                      value={empresa.canton}
                      onChange={e => setEmpresa(prev => ({ ...prev, canton: e.target.value, ciudad: e.target.value }))}
                      className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {(PROVINCIAS_ECUADOR[empresa.provincia] || [empresa.canton]).map(cant => (
                        <option key={cant} value={cant}>{cant}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                    Ciudad / Parroquia
                  </label>
                  <input
                    type="text"
                    value={empresa.ciudad}
                    onChange={e => setEmpresa(prev => ({ ...prev, ciudad: e.target.value }))}
                    placeholder="Ej. Loja / El Sagrario"
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                    Calle Principal & Nomenclatura
                  </label>
                  <input
                    type="text"
                    value={empresa.calle_principal}
                    onChange={e => setEmpresa(prev => ({ ...prev, calle_principal: e.target.value }))}
                    placeholder="Ej. Av. Universitaria y 10 de Agosto"
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                    Calle Secundaria / Edificio / Oficina
                  </label>
                  <input
                    type="text"
                    value={empresa.calle_secundaria}
                    onChange={e => setEmpresa(prev => ({ ...prev, calle_secundaria: e.target.value }))}
                    placeholder="Ej. Edif. Corporativo SARA, Piso 4, Of. 402"
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 font-mono flex items-center justify-between">
                  <div>
                    <p className="font-bold">Coordenadas Exactas:</p>
                    <p>Lat: {empresa.latitud}</p>
                    <p>Lng: {empresa.longitud}</p>
                  </div>
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 font-sans text-right max-w-[140px]">
                    Arrastra el marcador en el mapa para afinar la ubicación.
                  </span>
                </div>
              </div>

              {/* Mapa Leaflet */}
              <div className="lg:col-span-7 flex flex-col">
                <div className="w-full h-80 lg:h-full min-h-[320px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative z-0 shadow-sm">
                  <MapComponent position={mapPosition} setPosition={setMapPosition} />
                </div>
                <p className="text-[11px] text-slate-400 mt-2 text-right">
                  💡 <b>Tip de Precisión:</b> Haz clic en el mapa o <b>arrastra el marcador</b> directamente hacia la sede u obra.
                </p>
              </div>
            </div>
          </div>

          {/* 1.3 CANALES DE CONTACTO, SITIO WEB & REDES */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="bg-slate-900 text-white p-4 font-bold flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs md:text-sm uppercase tracking-wider">
                <Share2 size={18} className="text-amber-400" />
                <span>Canales de Contacto, Sitio Web & Redes Sociales</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">Digital & Atención</span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                  Teléfono / WhatsApp Corporativo
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={empresa.telefono}
                    onChange={e => setEmpresa(prev => ({ ...prev, telefono: e.target.value }))}
                    placeholder="+593 99 481 2938"
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-mono font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                  Correo Electrónico Oficial
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={empresa.email}
                    onChange={e => setEmpresa(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contacto@constructorasarango.com"
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                  Sitio Web Corporativo
                </label>
                <div className="relative">
                  <Globe size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="url"
                    value={empresa.sitio_web}
                    onChange={e => setEmpresa(prev => ({ ...prev, sitio_web: e.target.value }))}
                    placeholder="https://saraconstructora.com"
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                  LinkedIn Corporativo
                </label>
                <input
                  type="text"
                  value={empresa.linkedin || ''}
                  onChange={e => setEmpresa(prev => ({ ...prev, linkedin: e.target.value }))}
                  placeholder="linkedin.com/company/saraconstructora"
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                  Instagram de Obra
                </label>
                <input
                  type="text"
                  value={empresa.instagram || ''}
                  onChange={e => setEmpresa(prev => ({ ...prev, instagram: e.target.value }))}
                  placeholder="@saraconstructora.ec"
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                  Facebook Oficial
                </label>
                <input
                  type="text"
                  value={empresa.facebook || ''}
                  onChange={e => setEmpresa(prev => ({ ...prev, facebook: e.target.value }))}
                  placeholder="facebook.com/saraconstructora"
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* 1.4 STAFF TÉCNICO COLEGIADO */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="bg-slate-900 text-white p-4 font-bold flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs md:text-sm uppercase tracking-wider">
                <Users size={18} className="text-amber-400" />
                <span>Staff Técnico Colegiado (Técnicos, Arquitectos & Ingenieros Civiles)</span>
              </div>

              <button
                type="button"
                onClick={() => setModalStaffOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all"
              >
                <Plus size={14} />
                <span>Agregar Profesional</span>
              </button>
            </div>

            <div className="p-6">
              <p className="text-xs text-slate-500 mb-4">
                Profesionales colegiados con registro SENESCYT habilitados para firma de actas de obra, bitácoras de fiscalización, planos y anexos oficiales del SERCOP.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staffTecnico.map((prof) => (
                  <div 
                    key={prof.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-amber-500 transition-all relative group"
                  >
                    <button
                      type="button"
                      onClick={() => handleEliminarStaff(prof.id)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors p-1"
                      title="Eliminar profesional"
                    >
                      <Trash2 size={15} />
                    </button>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                        <HardHat size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{prof.nombre}</h4>
                        <span className="inline-block text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded mt-0.5">
                          {prof.cargo}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-mono text-[11px]">SENESCYT:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{prof.senescyt || "Acreditado"}</span>
                      </div>
                      {prof.telefono && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-mono text-[11px]">Tel:</span>
                          <span>{prof.telefono}</span>
                        </div>
                      )}
                      {prof.email && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-mono text-[11px]">Email:</span>
                          <span className="truncate max-w-[150px]">{prof.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIÑETA 2: PARÁMETROS DE REPORTES, MEMBRETE & FIRMAS POR MÓDULO            */}
      {/* ========================================================================= */}
      {activeSubTab === 'reportes' && (
        <div className="space-y-6">
          {/* 2.1 CONFIGURACIÓN DEL MEMBRETE OFICIAL & ENCABEZADO EN REPORTES (PDF / EXCEL) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-wider">
                <FileCheck2 size={18} className="text-amber-400" />
                <span>Configuración del Membrete Oficial & Encabezado en Reportes (PDF / Excel)</span>
              </div>
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
                Documentos Ejecutivos
              </span>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecciona qué elementos institucionales deben aparecer en la cabecera y el pie de página de los presupuestos, actas de fiscalización, kardex de bodega, órdenes de compra y balances contables.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 cursor-pointer hover:border-amber-500 transition-colors">
                  <input
                    type="checkbox"
                    checked={reportesConfig.incluir_logo}
                    onChange={e => setReportesConfig(prev => ({ ...prev, incluir_logo: e.target.checked }))}
                    className="w-4 h-4 text-amber-500 rounded accent-amber-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Logotipo Oficial</p>
                    <p className="text-[10px] text-slate-400">Mostrar imagen en el encabezado izquierdo.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 cursor-pointer hover:border-amber-500 transition-colors">
                  <input
                    type="checkbox"
                    checked={reportesConfig.incluir_razon_social}
                    onChange={e => setReportesConfig(prev => ({ ...prev, incluir_razon_social: e.target.checked }))}
                    className="w-4 h-4 text-amber-500 rounded accent-amber-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Razón Social & Marca</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{empresa.razon_social} ({empresa.nombre_comercial})</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 cursor-pointer hover:border-amber-500 transition-colors">
                  <input
                    type="checkbox"
                    checked={reportesConfig.incluir_ruc}
                    onChange={e => setReportesConfig(prev => ({ ...prev, incluir_ruc: e.target.checked }))}
                    className="w-4 h-4 text-amber-500 rounded accent-amber-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Número de RUC</p>
                    <p className="text-[10px] text-slate-400 font-mono">RUC: {empresa.ruc}</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 cursor-pointer hover:border-amber-500 transition-colors">
                  <input
                    type="checkbox"
                    checked={reportesConfig.incluir_direccion}
                    onChange={e => setReportesConfig(prev => ({ ...prev, incluir_direccion: e.target.checked }))}
                    className="w-4 h-4 text-amber-500 rounded accent-amber-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Dirección Completa</p>
                    <p className="text-[10px] text-slate-400">{empresa.ciudad}, {empresa.provincia}</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 cursor-pointer hover:border-amber-500 transition-colors">
                  <input
                    type="checkbox"
                    checked={reportesConfig.incluir_telefono}
                    onChange={e => setReportesConfig(prev => ({ ...prev, incluir_telefono: e.target.checked }))}
                    className="w-4 h-4 text-amber-500 rounded accent-amber-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Teléfono & WhatsApp</p>
                    <p className="text-[10px] text-slate-400 font-mono">{empresa.telefono}</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 cursor-pointer hover:border-amber-500 transition-colors">
                  <input
                    type="checkbox"
                    checked={reportesConfig.incluir_qr}
                    onChange={e => setReportesConfig(prev => ({ ...prev, incluir_qr: e.target.checked }))}
                    className="w-4 h-4 text-amber-500 rounded accent-amber-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Código QR de Autenticidad</p>
                    <p className="text-[10px] text-slate-400">Verificación digital en tiempo real.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 2.2 CONFIGURACIÓN DE FIRMAS SEGÚN EL TIPO DE INFORME (OBRAS, BODEGA, COMPRAS, CONTABILIDAD) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-wider">
                <PenTool size={18} className="text-amber-400" />
                <span>Configurar Tipo de Informe y Responsables de Firma</span>
              </div>
              <span className="text-xs text-amber-400 font-mono font-bold">
                Firmas Legales por Área
              </span>
            </div>

            <div className="p-6 space-y-6">
              {/* Selector de Área / Módulo de Informe */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase">
                  Selecciona el Área / Tipo de Informe para Configurar sus Firmantes:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedModuloFirma('obras')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                      selectedModuloFirma === 'obras'
                        ? 'border-amber-500 bg-amber-500/10 text-slate-950 dark:text-white ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <HardHat size={18} className="text-amber-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">1. Obras & Fiscalización</p>
                      <p className="text-[10px] text-slate-500">Avances & Cronogramas</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedModuloFirma('bodega')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                      selectedModuloFirma === 'bodega'
                        ? 'border-amber-500 bg-amber-500/10 text-slate-950 dark:text-white ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Warehouse size={18} className="text-amber-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">2. Bodega & Kardex</p>
                      <p className="text-[10px] text-slate-500">Vales & Devoluciones</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedModuloFirma('compras')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                      selectedModuloFirma === 'compras'
                        ? 'border-amber-500 bg-amber-500/10 text-slate-950 dark:text-white ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <ShoppingCart size={18} className="text-amber-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">3. Compras & Procura</p>
                      <p className="text-[10px] text-slate-500">Órdenes de Compra</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedModuloFirma('contabilidad')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                      selectedModuloFirma === 'contabilidad'
                        ? 'border-amber-500 bg-amber-500/10 text-slate-950 dark:text-white ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Receipt size={18} className="text-amber-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">4. Contabilidad & Finanzas</p>
                      <p className="text-[10px] text-slate-500">SRI, Nómina & Liquidaciones</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Título descriptivo del bloque */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs font-semibold text-amber-700 dark:text-amber-300">
                {firmaActual.titulo_bloque}
              </div>

              {/* Grid: Editor de Firmas (Izquierda) + Vista Previa en Vivo (Derecha) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Formulario de Firmantes */}
                <div className="lg:col-span-6 space-y-4">
                  {/* FIRMA 1 */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Firma Principal (Emisor / Responsable Técnico)
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Título de la Firma:
                      </label>
                      <input
                        type="text"
                        value={firmaActual.firma1_titulo}
                        onChange={e => handleFirmaChange('firma1_titulo', e.target.value)}
                        className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold dark:bg-slate-850"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Nombre del Firmante:
                        </label>
                        <input
                          type="text"
                          value={firmaActual.firma1_nombre}
                          onChange={e => handleFirmaChange('firma1_nombre', e.target.value)}
                          className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold dark:bg-slate-850"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Cargo Institucional:
                        </label>
                        <input
                          type="text"
                          value={firmaActual.firma1_cargo}
                          onChange={e => handleFirmaChange('firma1_cargo', e.target.value)}
                          className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs dark:bg-slate-850"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Documento / Matrícula / SENESCYT:
                      </label>
                      <input
                        type="text"
                        value={firmaActual.firma1_documento}
                        onChange={e => handleFirmaChange('firma1_documento', e.target.value)}
                        className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono dark:bg-slate-850"
                      />
                    </div>
                  </div>

                  {/* FIRMA 2 */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Segunda Firma (Revisión / Aprobación / Recepción)
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                        <input
                          type="checkbox"
                          checked={firmaActual.firma2_habilitada}
                          onChange={e => handleFirmaChange('firma2_habilitada', e.target.checked)}
                          className="rounded text-amber-500 accent-amber-500"
                        />
                        <span>Habilitar</span>
                      </label>
                    </div>

                    {firmaActual.firma2_habilitada && (
                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Título de la Segunda Firma:
                          </label>
                          <input
                            type="text"
                            value={firmaActual.firma2_titulo}
                            onChange={e => handleFirmaChange('firma2_titulo', e.target.value)}
                            className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold dark:bg-slate-850"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                              Nombre del Firmante:
                            </label>
                            <input
                              type="text"
                              value={firmaActual.firma2_nombre}
                              onChange={e => handleFirmaChange('firma2_nombre', e.target.value)}
                              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold dark:bg-slate-850"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                              Cargo Institucional:
                            </label>
                            <input
                              type="text"
                              value={firmaActual.firma2_cargo}
                              onChange={e => handleFirmaChange('firma2_cargo', e.target.value)}
                              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs dark:bg-slate-850"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Documento / Matrícula / C.I.:
                          </label>
                          <input
                            type="text"
                            value={firmaActual.firma2_documento}
                            onChange={e => handleFirmaChange('firma2_documento', e.target.value)}
                            className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono dark:bg-slate-850"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* VISTA PREVIA DEL PIE DE FIRMA EN VIVO (Idéntica a Imagen 2) */}
                <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                        Vista Previa del Bloque de Firmas
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">PDF & Entregables</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Así se estampará al final de tus reportes en PDF para el área de <b>{selectedModuloFirma.toUpperCase()}</b>:
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-dashed border-slate-300 dark:border-slate-700">
                    {/* Firma 1: Izquierda */}
                    <div className="text-center">
                      <div className="w-32 border-b border-slate-800 dark:border-slate-200 mx-auto mb-2"></div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {firmaActual.firma1_nombre || "Nombre del Firmante"}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        {firmaActual.firma1_cargo || "Cargo Institucional"}
                      </p>
                      <p className="text-[9px] font-mono text-slate-400">
                        {firmaActual.firma1_documento || "Documento Oficial"}
                      </p>
                      <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400 mt-1 uppercase">
                        {empresa.razon_social}
                      </p>
                    </div>

                    {/* Firma 2: Derecha */}
                    {firmaActual.firma2_habilitada ? (
                      <div className="text-center">
                        <div className="w-32 border-b border-slate-800 dark:border-slate-200 mx-auto mb-2"></div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {firmaActual.firma2_nombre || "Aprobador General"}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {firmaActual.firma2_cargo || "Cargo de Aprobación"}
                        </p>
                        <p className="text-[9px] font-mono text-slate-400">
                          {firmaActual.firma2_documento || `RUC: ${empresa.ruc}`}
                        </p>
                        <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400 mt-1 uppercase">
                          {empresa.nombre_comercial}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-[10px] text-slate-400 italic">
                        (Segunda firma deshabilitada para este tipo de reporte)
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 text-center">
                    Los cambios se guardan al hacer clic en <b>Guardar Cambios</b> en la barra superior.
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Agregar Profesional al Staff Técnico */}
      {modalStaffOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <HardHat size={18} className="text-amber-500" />
              Agregar Miembro al Staff Técnico
            </h3>

            <form onSubmit={handleAgregarStaff} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Nombre Completo:</label>
                <input
                  type="text"
                  required
                  value={nuevoStaff.nombre}
                  onChange={e => setNuevoStaff(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej. Ing. Patricio Cárdenas"
                  className="w-full px-3 py-2 text-xs border rounded-xl dark:bg-slate-800 dark:border-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Cargo Técnico:</label>
                <input
                  type="text"
                  required
                  value={nuevoStaff.cargo}
                  onChange={e => setNuevoStaff(prev => ({ ...prev, cargo: e.target.value }))}
                  placeholder="Ej. Residente de Obra / Topógrafo"
                  className="w-full px-3 py-2 text-xs border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Registro SENESCYT:</label>
                <input
                  type="text"
                  value={nuevoStaff.senescyt}
                  onChange={e => setNuevoStaff(prev => ({ ...prev, senescyt: e.target.value }))}
                  placeholder="Ej. 1005-2022-837192"
                  className="w-full px-3 py-2 text-xs border rounded-xl dark:bg-slate-800 dark:border-slate-700 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Teléfono:</label>
                  <input
                    type="text"
                    value={nuevoStaff.telefono}
                    onChange={e => setNuevoStaff(prev => ({ ...prev, telefono: e.target.value }))}
                    placeholder="099 123 4567"
                    className="w-full px-3 py-2 text-xs border rounded-xl dark:bg-slate-800 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Email:</label>
                  <input
                    type="email"
                    value={nuevoStaff.email}
                    onChange={e => setNuevoStaff(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="correo@obra.ec"
                    className="w-full px-3 py-2 text-xs border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalStaffOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl"
                >
                  Guardar Profesional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
