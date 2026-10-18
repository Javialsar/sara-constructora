'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Network, 
  FileCheck2, 
  Warehouse, 
  Users, 
  Truck, 
  Brain, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw, 
  Building2, 
  Scale, 
  DollarSign, 
  Activity, 
  MapPin, 
  Layers,
  Sparkles,
  Receipt,
  Boxes,
  Compass,
  Zap,
  Lock,
  LogOut,
  HardHat,
  UserCheck,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Bell,
  Settings,
  Search,
  ShoppingCart,
  Image as ImageIcon,
  FileText,
  ExternalLink
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { SriXmlService } from '@/lib/services/sriXmlService';
import { ThreeWayMatchService, PurchaseOrder } from '@/lib/services/threeWayMatchService';
import { KardexMultibodegaService, DistributionSlipInput } from '@/lib/services/kardexMultibodegaService';
import { IessPayrollService, DailyTareoInput } from '@/lib/services/iessPayrollService';
import { PredictivePurchaseService, SupplierCatalogItem } from '@/lib/services/predictivePurchaseService';
import { VectorKnowledgeService, CollectiveLearningCascadeResult } from '@/lib/services/vectorKnowledgeService';
import { MisProyectosSection } from '@/components/constructora/MisProyectosSection';
import { DirectorioRecursosSection } from '@/components/constructora/DirectorioRecursosSection';
import { ConstructoraDashboardView } from '@/components/constructora/ConstructoraDashboardView';
import ThemeToggle from '@/components/ThemeToggle';

export type SuiteTab = 
  | 'dashboard'
  | 'proyectos'
  | 'avances'
  | 'documentos'
  | 'kardex'
  | 'procura'
  | 'match'
  | 'nomina'
  | 'directorio'
  | 'talento'
  | 'fletes'
  | 'red_agentica';

export default function EcosistemaAvanzadoPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SuiteTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string>("PANEL PRINCIPAL");
  const [logo, setLogo] = useState<string>('/logo-grupo-sara.png');
  const [selectedAgent, setSelectedAgent] = useState<string>('ORCHESTRATOR');
  const [authLoading, setAuthLoading] = useState(true);
  const [professionalUser, setProfessionalUser] = useState<any>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.replace('/constructora/auth');
          return;
        }

        const meta = user.user_metadata || {};
        const role = meta.role || (meta.es_admin ? 'admin' : '');
        const ALLOWED_ROLES = [
          'admin',
          'superadmin',
          'tecnico',
          'profesional_constructora',
          'cliente_constructora',
          'ingeniero_residente',
          'arquitecto_bim',
          'contratista_general',
          'contador_constructora',
          'bodeguero_constructora',
          'tecnico_apoyo_obra',
        ];

        const hasAccess = ALLOWED_ROLES.includes(role) || meta.modulos_autorizados?.includes('sara_constructora');

        if (!hasAccess) {
          router.replace('/constructora/auth');
          return;
        }

        // Apertura adaptativa de pestaña según el perfil (Dashboard General por defecto)
        if (role === 'bodeguero_constructora') {
          setActiveTab('kardex');
          setOpenGroup('BODEGA Y COMPRAS');
        } else if (role === 'contador_constructora') {
          setActiveTab('match');
          setOpenGroup('CONTABILIDAD Y FINANZAS');
        } else if (role === 'cliente_constructora') {
          setActiveTab('dashboard');
          setOpenGroup('PANEL PRINCIPAL');
        } else if (role === 'arquitecto_bim') {
          setActiveTab('proyectos');
          setOpenGroup('MIS PROYECTOS');
        } else {
          setActiveTab('dashboard');
          setOpenGroup('PANEL PRINCIPAL');
        }

        const roleLabels: Record<string, string> = {
          ingeniero_residente: 'Ingeniero Residente',
          arquitecto_bim: 'Arquitecto BIM',
          contador_constructora: 'Contador(a) Tributario',
          bodeguero_constructora: 'Jefe de Bodega & Kardex',
          tecnico_apoyo_obra: 'Técnico de Obra & Topógrafo',
          cliente_constructora: 'Cliente de la Empresa',
          admin: 'Master Admin',
        };

        setProfessionalUser({
          id: user.id,
          email: user.email,
          nombre: meta.nombre || meta.full_name || 'Profesional de Obra',
          empresa: meta.razon_social || meta.empresa || 'Constructora Verificada',
          tipo: roleLabels[role] || meta.tipo_profesional || 'Ingeniero de Obra',
          identificacion: meta.identificacion || meta.ruc || 'Ecuador',
          senescyt: meta.registro_profesional || meta.senescyt || 'SENESCYT Validada',
        });
        setAuthLoading(false);
      } catch (err) {
        router.replace('/constructora/auth');
      }
    };

    verifyAuth();
  }, [router]);

  // -------------------------------------------------------------
  // TAB 1: THREE-WAY MATCH STATE & DATA
  // -------------------------------------------------------------
  const sampleXmlMatch = `<?xml version="1.0" encoding="UTF-8"?>
<factura id="comprobante" version="2.21">
  <infoTributaria>
    <ambiente>2</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>ADELCA ACEROS DEL ECUADOR C.A.</razonSocial>
    <nombreComercial>ADELCA MATRIZ</nombreComercial>
    <ruc>1790012345001</ruc>
    <claveAcceso>1610202601179001234500120010010000458921234567814</claveAcceso>
    <codDoc>01</codDoc>
    <estab>001</estab>
    <ptoEmi>001</ptoEmi>
    <secuencial>000045892</secuencial>
  </infoTributaria>
  <infoFactura>
    <fechaEmision>16/10/2026</fechaEmision>
    <totalSinImpuestos>14160.00</totalSinImpuestos>
    <totalDescuento>0.00</totalDescuento>
    <totalConImpuestos>
      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>4</codigoPorcentaje>
        <baseImponible>14160.00</baseImponible>
        <valor>2124.00</valor>
      </totalImpuesto>
    </totalConImpuestos>
    <importeTotal>16284.00</importeTotal>
  </infoFactura>
  <detalles>
    <detalle>
      <codigoPrincipal>ACERO-12MM</codigoPrincipal>
      <descripcion>Varilla corrugada de acero 12mm x 12m INEN 2167</descripcion>
      <cantidad>12000.00</cantidad>
      <precioUnitario>1.1800</precioUnitario>
      <descuento>0.00</descuento>
      <precioTotalSinImpuesto>14160.00</precioTotalSinImpuesto>
    </detalle>
  </detalles>
  <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
    <ds:KeyInfo><ds:X509Data><ds:X509Certificate>MIIEczCCA1ugAwIBAgIU...</ds:X509Certificate></ds:X509Data></ds:KeyInfo>
  </ds:Signature>
</factura>`;

  const [xmlInput, setXmlInput] = useState(sampleXmlMatch);
  const [matchResult, setMatchResult] = useState(() => {
    const parsed = SriXmlService.parseFacturaXml(sampleXmlMatch);
    const mockPo: PurchaseOrder = {
      id: 'po-adelca-2026-084',
      numeroOrden: 'OC-2026-084',
      proveedorId: 'prov-adelca',
      bodegaDestinoId: 'bod-matriz-01',
      subtotal: 14100.00, // Varianza de 0.42% (dentro de tolerancia <= 1.0%)
      iva: 2115.00,
      total: 16215.00,
      items: [
        {
          codigo: 'ACERO-12MM',
          descripcion: 'Varilla corrugada de acero 12mm x 12m INEN 2167',
          cantidad: 12000,
          precioUnitario: 1.175,
          subtotal: 14100.00,
        }
      ]
    };
    return ThreeWayMatchService.executeMatch(parsed, mockPo);
  });

  const handleRunMatch = () => {
    try {
      const parsed = SriXmlService.parseFacturaXml(xmlInput);
      const mockPo: PurchaseOrder = {
        id: 'po-adelca-2026-084',
        numeroOrden: 'OC-2026-084',
        proveedorId: 'prov-adelca',
        bodegaDestinoId: 'bod-matriz-01',
        subtotal: 14100.00,
        iva: 2115.00,
        total: 16215.00,
        items: [
          {
            codigo: 'ACERO-12MM',
            descripcion: 'Varilla corrugada de acero 12mm x 12m INEN 2167',
            cantidad: 12000,
            precioUnitario: 1.175,
            subtotal: 14100.00,
          }
        ]
      };
      const res = ThreeWayMatchService.executeMatch(parsed, mockPo);
      setMatchResult(res);
    } catch (e: any) {
      alert(`Error en XML: ${e.message}`);
    }
  };

  // -------------------------------------------------------------
  // TAB 2: KARDEX MULTIBODEGA STATE & DATA
  // -------------------------------------------------------------
  const [bodegaCentralStock, setBodegaCentralStock] = useState({
    saldoCantidad: 24500, // kg acero
    cpp: 1.18,
    costoTotal: 28910.0,
    stockSeguridad: 5000,
    rop: 8500,
    eoq: 12000,
  });

  const [obraCariamangaStock, setObraCariamangaStock] = useState({
    saldoCantidad: 3800,
    cpp: 1.18,
    costoTotal: 4484.0,
  });

  const [transferTransferAmount, setTransferAmount] = useState(2500);
  const [transferSuccessLog, setTransferSuccessLog] = useState<string | null>(null);

  const handleTransfer = () => {
    if (transferTransferAmount > bodegaCentralStock.saldoCantidad) {
      alert('Stock insuficiente en Bodega Matriz');
      return;
    }
    setBodegaCentralStock(prev => ({
      ...prev,
      saldoCantidad: prev.saldoCantidad - transferTransferAmount,
      costoTotal: +( (prev.saldoCantidad - transferTransferAmount) * prev.cpp ).toFixed(2),
    }));
    setObraCariamangaStock(prev => ({
      ...prev,
      saldoCantidad: prev.saldoCantidad + transferTransferAmount,
      costoTotal: +( (prev.saldoCantidad + transferTransferAmount) * prev.cpp ).toFixed(2),
    }));
    const valeId = `VALE-CARIAMANGA-${Math.floor(1000 + Math.random() * 9000)}`;
    setTransferSuccessLog(
      `✓ Vale de Distribución ${valeId} ejecutado. Trazabilidad vinculada a Factura SRI 001-001-000045892 (ADELCA). Asiento automático: Debe Obras en Curso ($${(transferTransferAmount * bodegaCentralStock.cpp).toFixed(2)}) / Haber Bodega Matriz.`
    );
  };

  // -------------------------------------------------------------
  // TAB 3: NÓMINA IESS STATE & DATA
  // -------------------------------------------------------------
  const sampleTareos: DailyTareoInput[] = [
    { trabajadorId: 't1', nombreCompleto: 'Segundo Manuel Guamán', cedula: '1103849582', categoriaOcupacional: 'Maestro Mayor', proyectoId: 'proj-cariamanga', rubroApuCodigo: 'RUB-ESTR-01', fecha: '2026-10-16', horasNormales: 8, horasSuplementarias: 2, horasExtraordinarias: 0 },
    { trabajadorId: 't2', nombreCompleto: 'José Luis Cuenca', cedula: '1104829104', categoriaOcupacional: 'Fierrero', proyectoId: 'proj-cariamanga', rubroApuCodigo: 'RUB-ACERO-12', fecha: '2026-10-16', horasNormales: 8, horasSuplementarias: 1, horasExtraordinarias: 1 },
    { trabajadorId: 't3', nombreCompleto: 'Carlos Eduardo Poma', cedula: '1105928174', categoriaOcupacional: 'Albañil', proyectoId: 'proj-cariamanga', rubroApuCodigo: 'RUB-MAMP-02', fecha: '2026-10-16', horasNormales: 8, horasSuplementarias: 0, horasExtraordinarias: 0 },
    { trabajadorId: 't4', nombreCompleto: 'Luis Alberto Morocho', cedula: '1106294821', categoriaOcupacional: 'Peón', proyectoId: 'proj-cariamanga', rubroApuCodigo: 'RUB-EXCAV-01', fecha: '2026-10-16', horasNormales: 8, horasSuplementarias: 3, horasExtraordinarias: 0 },
  ];

  const payrollResult = IessPayrollService.calculatePayroll(sampleTareos, { mes: 10, anio: 2026 }, 'proj-cariamanga');

  // -------------------------------------------------------------
  // TAB 4: PROCURAMIENTO PREDICTIVO GEORREFERENCIADO
  // -------------------------------------------------------------
  const [selectedCanton, setSelectedCanton] = useState<'Cariamanga' | 'Loja' | 'Cuenca'>('Cariamanga');
  const mockSupplierCatalog: SupplierCatalogItem[] = [
    {
      proveedorId: 'prov-holcim-gye',
      razonSocial: 'HOLCIM ECUADOR S.A. (Planta Guayaquil)',
      ciudadSede: 'Guayaquil',
      coordenadas: { lat: -2.1894, lng: -79.8891 },
      coberturaProvincias: ['TODAS'],
      insumoCodigo: 'CEM-HOLCIM',
      insumoNombre: 'Cemento Fuerte Tipo GU 50kg',
      precioBaseUnitario: 7.45,
      escalasDescuento: [
        { minCantidad: 1, maxCantidad: 500, descuentoPct: 0 },
        { minCantidad: 501, maxCantidad: 1500, descuentoPct: 5.0 },
        { minCantidad: 1501, descuentoPct: 9.0 },
      ],
    },
    {
      proveedorId: 'prov-loja-distrib',
      razonSocial: 'DISENSA DISTRIBUIDORA SUR LOJA',
      ciudadSede: 'Loja',
      coordenadas: { lat: -3.9931, lng: -79.2042 },
      coberturaProvincias: ['Loja', 'Zamora Chinchipe'],
      insumoCodigo: 'CEM-HOLCIM',
      insumoNombre: 'Cemento Fuerte Tipo GU 50kg',
      precioBaseUnitario: 7.90,
      escalasDescuento: [
        { minCantidad: 1, maxCantidad: 300, descuentoPct: 0 },
        { minCantidad: 301, descuentoPct: 3.5 },
      ],
    },
  ];

  const landedQuotes = PredictivePurchaseService.quoteBestSupplier(
    { canton: selectedCanton, provincia: selectedCanton === 'Cuenca' ? 'Azuay' : 'Loja' },
    'CEM-HOLCIM',
    1200,
    60.0,
    mockSupplierCatalog
  );

  const consolidationResult = PredictivePurchaseService.consolidateMultiProjectOrders(
    {
      insumoCodigo: 'CEM-HOLCIM',
      pedidosPorProyecto: [
        { proyectoId: 'p1', proyectoNombre: 'Residencial Cariamanga', provincia: 'Loja', canton: 'Cariamanga', cantidadRequerida: 800 },
        { proyectoId: 'p2', proyectoNombre: 'Condominio Mirador Loja', provincia: 'Loja', canton: 'Loja', cantidadRequerida: 900 },
        { proyectoId: 'p3', proyectoNombre: 'Campamento Catamayo', provincia: 'Loja', canton: 'Catamayo', cantidadRequerida: 450 },
      ],
    },
    [
      { minCantidad: 1, maxCantidad: 500, descuentoPct: 0, precioBase: 7.45 },
      { minCantidad: 501, maxCantidad: 1500, descuentoPct: 5.0, precioBase: 7.45 },
      { minCantidad: 1501, descuentoPct: 9.0, precioBase: 7.45 },
    ]
  );

  // -------------------------------------------------------------
  // TAB 5: APRENDIZAJE COLECTIVO CONTINUO & CASCADA
  // -------------------------------------------------------------
  const [learningSimulationInput, setLearningSimulationInput] = useState({
    itemKey: 'cemento_holcim_fuerte_50kg',
    nuevoPrecio: 7.85,
  });

  const [cascadeResult, setCascadeResult] = useState<CollectiveLearningCascadeResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setTimeout(async () => {
      const res = await VectorKnowledgeService.registerPriceMutationFromSri(
        learningSimulationInput.itemKey,
        learningSimulationInput.nuevoPrecio,
        {
          numeroComprobante: '001-002-000849301',
          rucEmisor: '0990004589001',
          razonSocial: 'HOLCIM DISTRIBUCION INDUSTRIAL',
        }
      );
      setCascadeResult(res);
      setIsSimulating(false);
    }, 400);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 font-mono">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 animate-pulse">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-sm font-bold tracking-wider uppercase text-slate-200">
          Autenticando Credenciales Profesionales...
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Verificando perfil de Ingeniero / Arquitecto / Constructora con contrato activo
        </p>
      </div>
    );
  }

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/constructora/auth');
  };

  const allNavGroups = [
    {
      title: "PANEL PRINCIPAL",
      items: [
        { id: "dashboard", label: "Dashboard General", icon: LayoutDashboard },
        { id: "red_agentica", label: "Red Agéntica (8 Agentes)", icon: Brain },
      ]
    },
    {
      title: "MIS PROYECTOS",
      items: [
        { id: "proyectos", label: "Proyectos (Obras)", icon: HardHat },
        { id: "avances", label: "Avances de Obra", icon: ImageIcon },
        { id: "documentos", label: "Gestor Documental", icon: FileText },
      ]
    },
    {
      title: "BODEGA Y COMPRAS",
      items: [
        { id: "kardex", label: "Bodega & Kardex", icon: Warehouse },
        { id: "procura", label: "Compras Predictivas", icon: ShoppingCart },
      ]
    },
    {
      title: "CONTABILIDAD Y FINANZAS",
      items: [
        { id: "match", label: "Contabilidad SRI (3-Way)", icon: Receipt },
        { id: "nomina", label: "Nómina CICS & IESS", icon: Scale },
      ]
    },
    {
      title: "DIRECTORIO Y RECURSOS",
      items: [
        { id: "directorio", label: "Directorio Central", icon: Users },
        { id: "talento", label: "SARA Talento", icon: HardHat },
        { id: "fletes", label: "SARA Fletes (Transporte)", icon: Truck },
      ]
    }
  ];

  const toggleGroup = (title: string) => {
    setOpenGroup(prev => prev === title ? "" : title);
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId as SuiteTab);
    setMobileMenuOpen(false);
    for (const group of allNavGroups) {
      if (group.items.some(i => i.id === tabId)) {
        setOpenGroup(group.title);
        break;
      }
    }
  };

  const handleNavigate = (tab: any) => {
    if (tab === 'obras' || tab === 'proyectos') {
      setActiveTab('proyectos');
      setOpenGroup('MIS PROYECTOS');
    } else if (tab === 'avances') {
      setActiveTab('avances');
      setOpenGroup('MIS PROYECTOS');
    } else if (tab === 'documentos') {
      setActiveTab('documentos');
      setOpenGroup('MIS PROYECTOS');
    } else if (tab === 'talento') {
      setActiveTab('talento');
      setOpenGroup('DIRECTORIO Y RECURSOS');
    } else if (tab === 'fletes') {
      setActiveTab('fletes');
      setOpenGroup('DIRECTORIO Y RECURSOS');
    } else if (tab === 'directorio') {
      setActiveTab('directorio');
      setOpenGroup('DIRECTORIO Y RECURSOS');
    } else if (tab === 'kardex' || tab === 'bodega') {
      setActiveTab('kardex');
      setOpenGroup('BODEGA Y COMPRAS');
    } else if (tab === 'procura' || tab === 'compras') {
      setActiveTab('procura');
      setOpenGroup('BODEGA Y COMPRAS');
    } else if (tab === 'match' || tab === 'contabilidad') {
      setActiveTab('match');
      setOpenGroup('CONTABILIDAD Y FINANZAS');
    } else if (tab === 'nomina') {
      setActiveTab('nomina');
      setOpenGroup('CONTABILIDAD Y FINANZAS');
    } else if (tab === 'red_agentica' || tab === 'conocimiento') {
      setActiveTab('red_agentica');
      setOpenGroup('PANEL PRINCIPAL');
    } else {
      setActiveTab('dashboard');
      setOpenGroup('PANEL PRINCIPAL');
    }
  };

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard':
        return { group: 'PANEL PRINCIPAL', title: 'Dashboard General de Operaciones' };
      case 'proyectos':
        return { group: 'MIS PROYECTOS', title: 'Obras y Proyectos Activos' };
      case 'avances':
        return { group: 'MIS PROYECTOS', title: 'Avances de Obra & Fiscalización Fotográfica' };
      case 'documentos':
        return { group: 'MIS PROYECTOS', title: 'Gestor Documental (Planos & Memorias)' };
      case 'kardex':
        return { group: 'BODEGA Y COMPRAS', title: 'Kardex Multibodega & Distribución a Frentes' };
      case 'procura':
        return { group: 'BODEGA Y COMPRAS', title: 'Procuramiento Predictivo & Cotizador B2B' };
      case 'match':
        return { group: 'CONTABILIDAD Y FINANZAS', title: 'Three-Way Match SRI (XML vs OC vs Bodega)' };
      case 'nomina':
        return { group: 'CONTABILIDAD Y FINANZAS', title: 'Nómina CICS / IESS & Tareo Diario' };
      case 'directorio':
        return { group: 'DIRECTORIO Y RECURSOS', title: 'Directorio Central (Clientes & Proveedores)' };
      case 'talento':
        return { group: 'DIRECTORIO Y RECURSOS', title: 'Gestión de Talento Humano (SARA Talento)' };
      case 'fletes':
        return { group: 'DIRECTORIO Y RECURSOS', title: 'Logística de Carga Pesada (SARA Fletes)' };
      case 'red_agentica':
        return { group: 'PANEL PRINCIPAL', title: 'Red Agéntica EDA & Memoria Colectiva' };
      default:
        return { group: 'SARA CONSTRUCTORA', title: 'Consola Técnica Profesional' };
    }
  };

  const breadcrumb = getBreadcrumb();
  const userInitials = professionalUser?.nombre
    ? professionalUser.nombre.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase()
    : 'CO';

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden font-sans">
      {/* Backdrop para mobile */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar estilo Imagen 1 */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 bg-[#062419] dark:bg-[#03140e] text-white flex flex-col h-full shadow-2xl transition-all duration-300 ${
        mobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
      } ${isSidebarCollapsed ? "md:w-20" : "md:w-64"}`}>
        {/* Header del Sidebar */}
        <div className={`p-4 border-b border-white/10 flex items-center ${isSidebarCollapsed ? "justify-center" : "justify-between"} gap-2`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 shrink-0 bg-white rounded-lg flex items-center justify-center p-1 shadow-sm">
              <img 
                src={logo} 
                alt="SARA Logo" 
                onError={() => setLogo("/logo-hero.png")}
                className="w-full h-full object-contain" 
              />
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <h1 className="font-bold tracking-wider text-sm uppercase text-white truncate max-w-[130px]">
                  {professionalUser?.tipo || "CONSTRUCTORA"}
                </h1>
                <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">SARA CONSTRUCTORA</p>
              </div>
            )}
          </div>
          {!isSidebarCollapsed && (
            <button 
              onClick={() => setIsSidebarCollapsed(true)} 
              className="hidden md:flex text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
              title="Colapsar menú (modo compacto)"
            >
              <ChevronRight className="rotate-180" size={16} />
            </button>
          )}
          <button 
            onClick={() => setMobileMenuOpen(false)} 
            className="md:hidden text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navegación del Sidebar */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          {isSidebarCollapsed ? (
            /* Modo Colapsado (Solo Iconos) */
            <div className="hidden md:flex flex-col items-center gap-1">
              {allNavGroups.map((group, gIdx) => (
                <div key={gIdx} className="w-full">
                  {gIdx > 0 && <div className="border-t border-white/10 my-2 mx-2" />}
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        title={item.label}
                        className={`w-11 h-11 mx-auto flex items-center justify-center rounded-xl transition-all my-1 ${
                          isActive 
                            ? "bg-[#1F422F] text-emerald-300 shadow-lg ring-2 ring-emerald-500/40" 
                            : "text-gray-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <Icon size={20} />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            /* Modo Expandido con Acordeones */
            allNavGroups.map((group, groupIdx) => {
              const isOpen = openGroup === group.title;
              const hasActiveItem = group.items.some(i => i.id === activeTab);
              return (
                <div key={groupIdx} className="mb-2">
                  <button 
                    onClick={() => toggleGroup(group.title)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
                      hasActiveItem
                        ? "text-emerald-400 font-bold bg-white/5"
                        : isOpen 
                          ? "bg-white/10 text-white" 
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{group.title}</span>
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  
                  {isOpen && (
                    <div className="space-y-1 mt-1 pl-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button 
                            key={item.id}
                            onClick={() => handleTabClick(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all text-left ${
                              isActive 
                                ? "bg-[#1F422F] text-emerald-300 shadow-md shadow-black/30 ring-1 ring-emerald-500/30" 
                                : "text-gray-300 hover:bg-white/10 hover:text-white font-medium"
                            }`}
                          >
                            <Icon size={18} className="shrink-0" />
                            <span className="whitespace-nowrap overflow-hidden text-xs">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-3 border-t border-white/10">
          <button 
            onClick={() => handleTabClick('dashboard')}
            title="Inicio Suite" 
            className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center w-11 h-11 mx-auto" : "gap-3 px-3 py-2"} rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-xs mb-1`}
          >
            <Settings size={18} className="shrink-0" />
            {!isSidebarCollapsed && <span className="whitespace-nowrap overflow-hidden font-medium">Configuración de Obra</span>}
          </button>
          <button 
            title="Cerrar Sesión Profesional"
            onClick={handleLogout} 
            className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center w-11 h-11 mx-auto" : "gap-3 px-3 py-2"} rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-xs`}
          >
            <LogOut size={18} className="shrink-0" />
            {!isSidebarCollapsed && <span className="whitespace-nowrap overflow-hidden font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100 dark:bg-slate-950">
        {/* Top Header estilo Imagen 1 */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 z-10 shrink-0">
          <div className="flex items-center gap-3">
            {/* Botón hamburguesa */}
            <button 
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  setMobileMenuOpen(prev => !prev);
                } else {
                  setIsSidebarCollapsed(prev => !prev);
                }
              }}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-slate-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              title="Alternar menú lateral"
            >
              <Menu size={22} />
            </button>
            <div>
              <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span>{breadcrumb.group}</span>
                <span>•</span>
                <span className="hidden sm:inline">GRUPO SARA HOLDING</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-tight">
                {breadcrumb.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Latencia & SRI metrics */}
            <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono tabular-nums">
              <span className="text-slate-400">Latencia Bus:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">142ms</span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className="text-slate-400">Tolerancia SRI:</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">&le; 1.0%</span>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Chip de Usuario Profesional */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {userInitials}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-gray-900 dark:text-white leading-tight truncate max-w-[120px]">
                  {professionalUser?.nombre || "Profesional"}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                  {professionalUser?.empresa || "Constructora"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido scrolleable del Dashboard */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          
          {/* VISTA 1: DASHBOARD GENERAL (Idéntico a Imagen 1) */}
          {activeTab === 'dashboard' && (
            <ConstructoraDashboardView 
              user={professionalUser}
              onNavigate={handleNavigate}
            />
          )}

          {/* VISTA 2: MIS PROYECTOS */}
          {activeTab === 'proyectos' && (
            <MisProyectosSection user={professionalUser} initialSubTab="obras" />
          )}

          {activeTab === 'avances' && (
            <MisProyectosSection user={professionalUser} initialSubTab="avances" />
          )}

          {activeTab === 'documentos' && (
            <MisProyectosSection user={professionalUser} initialSubTab="documentos" />
          )}

          {/* VISTA 3: DIRECTORIO Y RECURSOS */}
          {activeTab === 'directorio' && (
            <DirectorioRecursosSection user={professionalUser} initialSubTab="clientes" />
          )}

          {activeTab === 'talento' && (
            <DirectorioRecursosSection user={professionalUser} initialSubTab="trabajadores" />
          )}

          {activeTab === 'fletes' && (
            <DirectorioRecursosSection user={professionalUser} initialSubTab="proveedores" />
          )}

        {/* ------------------------------------------------------------- */}
        {/* PESTAÑA 1: THREE-WAY MATCH SRI */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'match' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Columna Izquierda: Visor XML y Controles */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-indigo-500" />
                    Entrada XML del SRI (XAdES-BES)
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    XXE-Safe Parser
                  </span>
                </div>

                <textarea
                  value={xmlInput}
                  onChange={(e) => setXmlInput(e.target.value)}
                  rows={11}
                  className="w-full text-xs font-mono p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunMatch}
                    className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all inline-flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Ejecutar Three-Way Match (Tolerancia &le; 1%)
                  </button>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Orden de Compra Vinculada:</span>
                    <span className="font-mono font-semibold">OC-2026-084</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal en Orden:</span>
                    <span className="font-mono font-semibold tabular-nums">$14,100.00 USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Destino de Recepción:</span>
                    <span className="font-semibold">Bodega Central Matriz (Activo)</span>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Resultado del Match y Retención */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Status Card */}
                <div className={`p-4 rounded-2xl border ${
                  matchResult.status === 'MATCHED_SUCCESS'
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-500/30 text-rose-900 dark:text-rose-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {matchResult.status === 'MATCHED_SUCCESS' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-rose-500" />
                      )}
                      <span className="font-bold text-sm">
                        {matchResult.status === 'MATCHED_SUCCESS'
                          ? 'CONCILIACIÓN EXITOSA (MATCHED_SUCCESS)'
                          : 'DISCREPANCIA DETECTADA (DISCREPANCY_ALERT)'}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 shadow-sm border">
                      Varianza: {matchResult.varianzaMaximaDetectadaPct}% (Máx Perm: 1.0%)
                    </span>
                  </div>
                  <p className="text-xs mt-1.5 text-slate-600 dark:text-slate-300">
                    {matchResult.status === 'MATCHED_SUCCESS'
                      ? 'La factura del SRI coincide con la Orden de Compra y Recepción de Bodega dentro del rango de tolerancia permitido. Se aprobó la retención y el asiento de diario contable.'
                      : 'La varianza detectada supera el 1% permitido. El asiento contable está retenido para revisión del supervisor financiero.'}
                  </p>
                </div>

                {/* Tabla de Comparación Three-Way */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Desglose de Valores y Varianza
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                          <th className="text-left pb-2 font-medium">Concepto</th>
                          <th className="text-right pb-2 font-medium">Factura SRI</th>
                          <th className="text-right pb-2 font-medium">Orden Compra</th>
                          <th className="text-right pb-2 font-medium">&Delta; Varianza</th>
                          <th className="text-center pb-2 font-medium">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums">
                        <tr>
                          <td className="py-2 text-slate-800 dark:text-slate-200 font-sans">Subtotal Neto</td>
                          <td className="text-right py-2">${matchResult.resumenFinanciero.subtotalFactura.toFixed(2)}</td>
                          <td className="text-right py-2">${matchResult.resumenFinanciero.subtotalOrden.toFixed(2)}</td>
                          <td className="text-right py-2 font-semibold text-emerald-600 dark:text-emerald-400">
                            +{matchResult.varianzaMaximaDetectadaPct}%
                          </td>
                          <td className="text-center py-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-sans">
                              Permitido
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 text-slate-800 dark:text-slate-200 font-sans">IVA 15%</td>
                          <td className="text-right py-2">${matchResult.resumenFinanciero.ivaFactura.toFixed(2)}</td>
                          <td className="text-right py-2">${(matchResult.resumenFinanciero.subtotalOrden * 0.15).toFixed(2)}</td>
                          <td className="text-right py-2">0.42%</td>
                          <td className="text-center py-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-sans">
                              Permitido
                            </span>
                          </td>
                        </tr>
                        <tr className="font-bold bg-slate-50/50 dark:bg-slate-800/20">
                          <td className="py-2 text-slate-900 dark:text-white font-sans">Total Comprobante</td>
                          <td className="text-right py-2">${matchResult.resumenFinanciero.totalFactura.toFixed(2)}</td>
                          <td className="text-right py-2">${matchResult.resumenFinanciero.totalOrden.toFixed(2)}</td>
                          <td className="text-right py-2">0.42%</td>
                          <td className="text-center py-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-sans">
                              Aprobado
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Propuesta de Retención del SRI (LRTI Ecuador) */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Liquidación de Retención SRI (Normativa Vigente)
                    </h4>
                    <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                      Código 312 + IVA 30%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 block text-[11px]">Ret. Renta 1.75%:</span>
                      <span className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                        ${matchResult.retencionPropuesta.valorRetenidoRenta.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 block text-[11px]">Ret. IVA 30%:</span>
                      <span className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                        ${matchResult.retencionPropuesta.valorRetenidoIva.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 block text-[11px]">Total Retenido:</span>
                      <span className="text-sm font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
                        ${matchResult.retencionPropuesta.totalRetenido.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                      <span className="text-indigo-600 dark:text-indigo-400 block text-[11px] font-medium">Neto a Transferir:</span>
                      <span className="text-sm font-bold font-mono tabular-nums text-indigo-700 dark:text-indigo-300">
                        ${matchResult.retencionPropuesta.valorNetoAPagar.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Asiento Contable Automático */}
                <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5" />
                      Asiento Contable de Diario Automático (Partida Doble)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Cuadrado: SI
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    {matchResult.asientoPropuesto.detalles.map((d, i) => (
                      <div key={i} className="flex justify-between items-center py-1 border-b border-slate-800/60 last:border-0">
                        <span className="text-slate-300">{d.codigoCuenta} - {d.nombreCuenta}</span>
                        <div className="flex gap-4 tabular-nums">
                          <span className={d.debito > 0 ? 'text-emerald-400' : 'text-slate-600'}>
                            D: ${d.debito.toFixed(2)}
                          </span>
                          <span className={d.credito > 0 ? 'text-sky-400' : 'text-slate-600'}>
                            H: ${d.credito.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* PESTAÑA 2: KARDEX MULTIBODEGA & TRAZABILIDAD */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'kardex' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Bodega Matriz (Activo Central) */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-indigo-600 uppercase">Activo Capitalizado Central</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Bodega Central Matriz GRUPO SARA
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    BOD-MATRIZ-01
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border">
                    <span className="text-slate-500 block text-[11px]">Stock Varilla 12mm:</span>
                    <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                      {Number(bodegaCentralStock?.saldoCantidad ?? 0).toLocaleString()} kg
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border">
                    <span className="text-slate-500 block text-[11px]">Costo Prom. (CPP):</span>
                    <span className="text-base font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      ${Number(bodegaCentralStock?.cpp ?? 0).toFixed(4)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border">
                    <span className="text-slate-500 block text-[11px]">Valor en Custodia:</span>
                    <span className="text-base font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                      ${Number(bodegaCentralStock?.costoTotal ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Modelado Matemático de Almacén */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px] uppercase tracking-wider">
                    Modelos Matemáticos de Abastecimiento (SARA-KARDEX)
                  </span>
                  <div className="grid grid-cols-3 gap-2 font-mono text-[11px] tabular-nums">
                    <div>
                      <span className="text-slate-500 block">Punto Reorden (ROP):</span>
                      <span className="font-bold">{Number(bodegaCentralStock?.rop ?? 0).toLocaleString()} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Lote Óptimo (EOQ):</span>
                      <span className="font-bold">{Number(bodegaCentralStock?.eoq ?? 0).toLocaleString()} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Stock Seguridad:</span>
                      <span className="font-bold text-emerald-600">{Number(bodegaCentralStock?.stockSeguridad ?? 0).toLocaleString()} kg</span>
                    </div>
                  </div>
                </div>

                {/* Formulario de Despacho / Vale de Distribución */}
                <div className="pt-2 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Emitir Vale de Distribución hacia Obra
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={transferTransferAmount}
                      onChange={(e) => setTransferAmount(Number(e.target.value))}
                      className="w-32 px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border rounded-lg"
                      placeholder="Cantidad kg"
                    />
                    <button
                      onClick={handleTransfer}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all inline-flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      Despachar a Obra Cariamanga
                    </button>
                  </div>
                  {transferSuccessLog && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
                      {transferSuccessLog}
                    </div>
                  )}
                </div>
              </div>

              {/* Sub-bodega Obra Cariamanga (Costo Proyecto) */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-600 uppercase">Sub-bodega de Proyecto (Obra en Curso)</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Obra Residencial Cariamanga Plaza (Loja)
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    SUB-OBRA-CAR-01
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border">
                    <span className="text-slate-500 block text-[11px]">Stock en Frente de Obra:</span>
                    <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                      {Number(obraCariamangaStock?.saldoCantidad ?? 0).toLocaleString()} kg
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border">
                    <span className="text-slate-500 block text-[11px]">Costo Imputado a Obra:</span>
                    <span className="text-base font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                      ${Number(obraCariamangaStock?.costoTotal ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Trazabilidad Inversa a Factura SRI */}
                <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 text-xs space-y-2">
                  <span className="font-semibold text-emerald-400 block text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Trazabilidad Inversa Certificada (Reverse Traceability)
                  </span>
                  <div className="text-[11px] font-mono space-y-1 text-slate-300">
                    <div>Lote Físico: <span className="text-white">LOT-ADELCA-2026-X1</span></div>
                    <div>Factura SRI Origen: <span className="text-sky-300">001-001-000045892</span></div>
                    <div>RUC Proveedor: <span className="text-slate-400">1790012345001 (ADELCA C.A.)</span></div>
                    <div>Asiento Imputado: <span className="text-emerald-300">CTA 1.1.05.01 (Obras en Curso)</span></div>
                  </div>
                </div>

                {/* Auditoría de Mermas de Construcción */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] uppercase">
                      Auditoría de Despunte y Merma Técnica (Acero)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                      Tolerancia: &le;6.0%
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-mono text-[11px] tabular-nums">
                    <span className="text-slate-500">Merma registrada en cortes:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">4.2% (Dentro de tolerancia legal)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* PESTAÑA 3: NÓMINA IESS CONSTRUCCIÓN & TAREO */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'nomina' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-indigo-600 uppercase">Sector Construcción Ecuador</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Tareo Diario & Rol de Pagos IESS (Aporte Patronal 12.15%)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border">
                    SBU 2026: $470.00 USD
                  </span>
                </div>
              </div>

              {/* Resumen Superior de Nómina */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border">
                  <span className="text-slate-500 block text-[11px]">Operarios en Tareo:</span>
                  <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                    {payrollResult.totalTrabajadores}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border">
                  <span className="text-slate-500 block text-[11px]">Neto Cuadrilla:</span>
                  <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                    ${payrollResult.totalNetoAPagar.toFixed(2)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border">
                  <span className="text-slate-500 block text-[11px]">Obligación IESS (Personal+Pat):</span>
                  <span className="text-lg font-bold font-mono text-sky-600 dark:text-sky-400 tabular-nums">
                    ${payrollResult.totalAporteIessConsolidado.toFixed(2)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                  <span className="text-indigo-600 dark:text-indigo-400 block text-[11px] font-medium">Costo Total Mano Obra (APU):</span>
                  <span className="text-lg font-bold font-mono text-indigo-700 dark:text-indigo-300 tabular-nums">
                    ${payrollResult.costoDirectoTotalManoObra.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Tabla Detallada de Trabajadores */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                      <th className="text-left pb-2 font-medium">Trabajador / Rol</th>
                      <th className="text-left pb-2 font-medium">Cédula</th>
                      <th className="text-right pb-2 font-medium">H. Ord / Supl / Extra</th>
                      <th className="text-right pb-2 font-medium">Ingreso Bruto</th>
                      <th className="text-right pb-2 font-medium">IESS Personal (9.45%)</th>
                      <th className="text-right pb-2 font-medium">Neto a Recibir</th>
                      <th className="text-right pb-2 font-medium">Cargas Pat. (12.15%+Prov)</th>
                      <th className="text-right pb-2 font-medium">Costo Efectivo APU</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums">
                    {payrollResult.detallesPorTrabajador.map((w, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 font-sans font-semibold text-slate-800 dark:text-slate-200">
                          {w.nombreCompleto}
                          <span className="block text-[11px] font-normal text-slate-500 font-sans">{w.categoriaOcupacional}</span>
                        </td>
                        <td className="py-2.5 text-slate-500">{w.cedula}</td>
                        <td className="text-right py-2.5">
                          {w.totalHorasNormales}h / {w.totalHorasSuplementarias}h / {w.totalHorasExtraordinarias}h
                        </td>
                        <td className="text-right py-2.5">${w.totalIngresosGravados.toFixed(2)}</td>
                        <td className="text-right py-2.5 text-rose-600 dark:text-rose-400">-${w.aportePersonalIess.toFixed(2)}</td>
                        <td className="text-right py-2.5 font-bold text-emerald-600 dark:text-emerald-400">${w.netoARecibir.toFixed(2)}</td>
                        <td className="text-right py-2.5 text-sky-600 dark:text-sky-400">${w.totalCargasPatronales.toFixed(2)}</td>
                        <td className="text-right py-2.5 font-bold text-indigo-600 dark:text-indigo-400">
                          ${w.costoHoraEfectivaApu.toFixed(2)}/h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Asiento Contable Automático Nómina */}
              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 space-y-2 text-xs font-mono">
                <span className="text-emerald-400 font-semibold block">
                  Asiento Automático Nómina: Cuenta 1.1.05.02 (Obras en Curso - Mano de Obra) vs Cuentas de Pasivo Laboral
                </span>
                <p className="text-slate-400 text-[11px]">
                  {payrollResult.asientoContableNomina.glosa}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* PESTAÑA 4: PROCURAMIENTO PREDICTIVO (LANDED COST) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'procura' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-sky-600 uppercase">Ruteo Georreferenciado & Landed Cost</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Cotizador Predictivo: Precio Material + Flete en Ecuador
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Destino de la Obra:</span>
                  <select
                    value={selectedCanton}
                    onChange={(e: any) => setSelectedCanton(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-xs font-semibold"
                  >
                    <option value="Cariamanga">Cariamanga (Calvas, Loja)</option>
                    <option value="Loja">Loja (Cantón Loja)</option>
                    <option value="Cuenca">Cuenca (Azuay)</option>
                  </select>
                </div>
              </div>

              {/* Tarjetas de Cotización Landed Cost */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {landedQuotes.map((q, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border relative transition-all ${
                      q.recomendado
                        ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50'
                    }`}
                  >
                    {q.recomendado && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
                        Mejor Landed Cost
                      </span>
                    )}

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white pr-28">
                      {q.razonSocial}
                    </h4>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono tabular-nums">
                      <div>
                        <span className="text-slate-500 text-[11px] block">Distancia Vial:</span>
                        <span className="font-semibold">{q.distanciaKm} km ({q.tiempoEstimadoEntregaHoras}h)</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">Costo Flete Pesado:</span>
                        <span className="font-semibold">${q.fleteTotalUSD.toFixed(2)} USD</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">Precio Material Neto:</span>
                        <span className="font-semibold">${q.precioMaterialUnitarioNeto.toFixed(4)} c/u</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">Costo Unit. Puesto en Obra:</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          ${q.costoUnitarioPuestoEnObraUSD.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-sans">Costo Total Puesto en Obra:</span>
                      <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                        ${q.costoTotalLandedUSD.toFixed(2)} USD
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Consolidación Multiproyecto para Descuentos de Escala */}
              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Consolidación Multiproyecto Automática (Ganancia por Escala)
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Ahorro Neto: ${consolidationResult.ahorroTotalConsolidacionUSD.toFixed(2)} USD
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  El agente detectó que los proyectos de <span className="text-white font-medium">Cariamanga (800 sacos)</span>, <span className="text-white font-medium">Loja (900 sacos)</span> y <span className="text-white font-medium">Catamayo (450 sacos)</span> requieren Cemento Holcim en la misma ventana temporal. Al unificarse en una orden de <span className="text-emerald-300 font-bold">2,150 sacos</span>, se saltó de 0% de descuento individual al <span className="text-emerald-300 font-bold">9.0% de descuento corporativo</span>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-xs tabular-nums">
                  <div className="p-2 rounded bg-slate-800/80">
                    <span className="text-slate-400 text-[10px] block">Costo Separado:</span>
                    <span className="text-slate-200 font-semibold">${consolidationResult.costoSinConsolidarUSD.toFixed(2)}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-800/80">
                    <span className="text-slate-400 text-[10px] block">Costo Consolidado:</span>
                    <span className="text-emerald-400 font-semibold">${consolidationResult.costoConConsolidarUSD.toFixed(2)}</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800">
                    <span className="text-emerald-400 text-[10px] block">Descuento Alcanzado:</span>
                    <span className="text-emerald-300 font-bold">{consolidationResult.descuentoConsolidadoAlcanzadoPct}% OFF</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* PESTAÑA 5: RED AGÉNTICA (8 AGENTES) & APRENDIZAJE COLECTIVO */}
        {/* ------------------------------------------------------------- */}
        {(activeTab === 'red_agentica' || (activeTab as any) === 'conocimiento') && (
          <div className="space-y-6">
            
            {/* Topología Multi-Agente & Orquestación EDA */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
                    Arquitectura Basada en Eventos (EDA) & Saga Transaccional
                  </span>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
                    Red Coreográfica de Agentes Autónomos
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Memoria Unificada:</span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    SharedMemory: 100% Sincronizada
                  </span>
                </div>
              </div>

              {/* Diagrama Interactivo de Nodos */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {/* Nodo 1: Master Orchestrator */}
                <div 
                  onClick={() => setSelectedAgent('ORCHESTRATOR')}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    selectedAgent === 'ORCHESTRATOR'
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                      🤖
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                      Core Bus
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    SARA_MASTER_ORCHESTRATOR
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    Director general, transacciones atómicas distribuidas y prevención de corrupción de datos.
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                    <span>ESTADO: ACTIVO</span>
                    <span>0.00% ERRORES</span>
                  </div>
                </div>

                {/* Nodo 2: Financial Quant */}
                <div 
                  onClick={() => setSelectedAgent('FINANCIAL')}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    selectedAgent === 'FINANCIAL'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                      ⚖️
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      SRI & IESS
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    SARA_FINANCIAL_QUANT
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    Auditor tributario (Cód 312/344), 3-Way Match con tolerancia 1%, firma XAdES-BES y rol de pagos.
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                    <span>TOLERANCIA: &le;1%</span>
                    <span>MATCH: 99.4%</span>
                  </div>
                </div>

                {/* Nodo 3: Kardex Inventory */}
                <div 
                  onClick={() => setSelectedAgent('KARDEX')}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    selectedAgent === 'KARDEX'
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-1 ring-amber-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                      📦
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                      Multibodega
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    SARA_KARDEX_INVENTORY
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    CPP automático, transferencias por vale, stock dinámico acoplado a Gantt y auditoría de mermas.
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-amber-600 dark:text-amber-400">
                    <span>MÉTODO: CPP</span>
                    <span>TRAZA: INVERSA</span>
                  </div>
                </div>

                {/* Nodo 4: Predictive Purchase */}
                <div 
                  onClick={() => setSelectedAgent('PURCHASE')}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    selectedAgent === 'PURCHASE'
                      ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 ring-1 ring-sky-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                      🚚
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300">
                      24 Provincias
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    SARA_PREDICTIVE_PURCHASE
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    Landed Cost (Material + Flete), consolidación por volumen y explosión de materiales BIM/Takeoff.
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-sky-600 dark:text-sky-400">
                    <span>RUTEO: HAVERSINE</span>
                    <span>AHORRO: +12%</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Simulador de Mutación SRI y Cascada de Aprendizaje Colectivo */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-5">
              <div>
                <span className="text-[11px] font-semibold text-violet-600 uppercase">Inteligencia Adaptativa en Tiempo Real</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Simulador de Mutación SRI y Cascada de Aprendizaje Colectivo
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Demuestra cómo la detección de una variación de precio en un XML del SRI propaga el conocimiento vectorial hacia el generador de APU, optimizador de compras y márgenes contables.
                </p>
              </div>

              {/* Panel de Disparo */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border flex flex-wrap items-center gap-4 text-xs">
                <div>
                  <label className="text-slate-500 block text-[11px] mb-1 font-medium">Insumo a Mutar:</label>
                  <select
                    value={learningSimulationInput.itemKey}
                    onChange={(e) => setLearningSimulationInput(prev => ({ ...prev, itemKey: e.target.value }))}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs font-semibold"
                  >
                    <option value="cemento_holcim_fuerte_50kg">Cemento Holcim Fuerte 50kg (Ref: $7.45)</option>
                    <option value="acero_adelca_corrugado_12mm">Acero Adelca 12mm x 12m (Ref: $1.18/kg)</option>
                    <option value="hormigon_premezclado_210">Hormigón Premezclado f'c=210 (Ref: $94.50/m3)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 block text-[11px] mb-1 font-medium">Nuevo Precio Facturado SRI (USD):</label>
                  <input
                    type="number"
                    step="0.05"
                    value={learningSimulationInput.nuevoPrecio}
                    onChange={(e) => setLearningSimulationInput(prev => ({ ...prev, nuevoPrecio: Number(e.target.value) }))}
                    className="w-32 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs font-mono font-bold"
                  />
                </div>

                <div className="pt-4 sm:pt-0">
                  <button
                    onClick={handleRunSimulation}
                    disabled={isSimulating}
                    className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                    Disparar Mutación SRI y Cascada
                  </button>
                </div>
              </div>

              {/* Cascada de Resultados */}
              {cascadeResult && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  
                  {/* Banner de Varianza */}
                  <div className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                    cascadeResult.alertaVolatilidad
                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-500/40 text-amber-900 dark:text-amber-200'
                      : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-500" />
                      <span className="font-bold">
                        Mutación Detectada: {cascadeResult.itemKey}
                      </span>
                      <span>(${cascadeResult.precioAnterior.toFixed(2)} &rarr; ${cascadeResult.precioNuevo.toFixed(2)})</span>
                    </div>
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-900 border">
                      Varianza: {cascadeResult.varianzaPct > 0 ? `+${cascadeResult.varianzaPct}%` : `${cascadeResult.varianzaPct}%`}
                    </span>
                  </div>

                  {/* 3 Pasos de la Cascada */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Paso 1: Agente APU */}
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold">
                          1. SARA-APU
                        </span>
                        <span className="text-emerald-500 text-xs font-bold">✓ Calibrado</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Presupuestos Futuros Ajustados
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Se actualizaron las matrices analíticas de {cascadeResult.cascadaAcciones.apuAjuste.nuevasRecetasActualizadas} recetas estándar.
                      </p>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 font-mono text-[11px] tabular-nums text-slate-600 dark:text-slate-300">
                        Incremento Costo Unitario: +${cascadeResult.cascadaAcciones.apuAjuste.incrementoCostoDirectoUnitarioUSD.toFixed(4)}
                      </div>
                    </div>

                    {/* Paso 2: Agente Compras */}
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-bold">
                          2. SARA-COMPRAS
                        </span>
                        <span className="text-emerald-500 text-xs font-bold">✓ Optimizado</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Proformas Predictivas Regeneradas
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {cascadeResult.cascadaAcciones.comprasOptimizacion.sugerenciaConsolidacionVolumen}
                      </p>
                    </div>

                    {/* Paso 3: Agente Contable */}
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold">
                          3. SARA-FINANZAS
                        </span>
                        <span className="text-emerald-500 text-xs font-bold">✓ Recalculado</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Márgenes de Obras Activas
                      </h4>
                      <div className="space-y-1 pt-1 font-mono text-[10px] tabular-nums">
                        {cascadeResult.cascadaAcciones.contableRecalculoMargenes.proyectosRecalculados.map((p, i) => (
                          <div key={i} className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-0.5 last:border-0">
                            <span className="text-slate-500 font-sans truncate max-w-[130px]">{p.proyectoNombre}</span>
                            <span className="text-slate-800 dark:text-slate-200 font-bold">
                              {p.margenPrevioPct}% &rarr; {p.margenProyectadoNuevoPct}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        </div>
      </main>
    </div>
  );
}
