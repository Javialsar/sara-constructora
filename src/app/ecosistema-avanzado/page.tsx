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
  UserCheck
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

export default function EcosistemaAvanzadoPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'proyectos' | 'directorio' | 'match' | 'kardex' | 'nomina' | 'procura' | 'conocimiento'>('proyectos');
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
        ];

        const hasAccess = ALLOWED_ROLES.includes(role) || meta.modulos_autorizados?.includes('sara_constructora');

        if (!hasAccess) {
          router.replace('/constructora/auth');
          return;
        }

        setProfessionalUser({
          id: user.id,
          email: user.email,
          nombre: meta.nombre || meta.full_name || 'Profesional de Obra',
          empresa: meta.razon_social || meta.empresa || 'Constructora Verificada',
          tipo: meta.tipo_profesional || (role === 'admin' ? 'Master Admin' : 'Ingeniero Residente'),
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-24 selection:bg-indigo-500 selection:text-white">
      {/* Top Banner Contextual con Identidad Profesional B2B */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-sm shadow-amber-500/20 text-slate-950 font-bold text-sm tracking-wider">
              <HardHat className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 uppercase tracking-wider">
                  Módulo Oficial SARA-CONSTRUCTORA
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Módulo Estrella Online
                </span>
              </div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
                SARA-CONSTRUCTORA: Consola Técnica & Ecosistema Agéntico
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                Servicios Operativos de Obra: Three-Way Match SRI • Kardex Multibodega • Nómina IESS • Procuramiento Predictivo • Aprendizaje Colectivo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Badge de Profesional Verificado */}
            {professionalUser && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-300 font-semibold">{professionalUser.nombre}</span>
                <span className="text-slate-500">({professionalUser.empresa})</span>
              </div>
            )}

            <div className="hidden sm:flex items-center gap-4 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs font-mono tabular-nums">
              <span className="text-slate-500">Latencia Bus:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">142ms</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-slate-500">Tolerancia SRI:</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">&le; 1.0%</span>
            </div>

            <button
              onClick={handleLogout}
              title="Cerrar Sesión Profesional"
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700/60 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* 1. TOPOLOGÍA MULTI-AGENTE & ORQUESTACIÓN */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
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
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
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

          {/* Base de Conocimiento Vectorial Compartida */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                🧠
              </span>
              <div>
                <span className="font-semibold text-white">Base de Conocimiento Vectorial Compartida (Collective Learning)</span>
                <p className="text-slate-400 text-[11px]">Cualquier variación en XML del SRI ajusta APU, Proformas de Compra y Márgenes de Proyecto automáticamente.</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('conocimiento')}
              className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs transition-colors self-start sm:self-auto inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ver Cascada en Vivo
            </button>
          </div>
        </section>

        {/* 2. BARRA DE NAVEGACIÓN DE PESTAÑAS */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 overflow-x-auto space-x-1">
          {/* PESTAÑA 1: MIS PROYECTOS */}
          <button
            onClick={() => setActiveTab('proyectos')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'proyectos'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 dark:border-amber-400 bg-amber-50/40 dark:bg-amber-950/20 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-500" />
            🏗️ Mis Proyectos (Obras, Avances & Planos)
          </button>

          {/* PESTAÑA 2: DIRECTORIO Y RECURSOS */}
          <button
            onClick={() => setActiveTab('directorio')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'directorio'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 dark:border-amber-400 bg-amber-50/40 dark:bg-amber-950/20 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Users className="w-4 h-4 text-amber-500" />
            👥 Directorio & Recursos (Personal, Proveedores & Clientes)
          </button>

          <button
            onClick={() => setActiveTab('match')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'match'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Three-Way Match SRI
          </button>

          <button
            onClick={() => setActiveTab('kardex')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'kardex'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Boxes className="w-4 h-4" />
            2. Kardex Multibodega & Trazabilidad
          </button>

          <button
            onClick={() => setActiveTab('nomina')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'nomina'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            3. Nómina IESS Construcción & Tareo
          </button>

          <button
            onClick={() => setActiveTab('procura')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'procura'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Compass className="w-4 h-4" />
            4. Procuramiento Predictivo (Landed Cost)
          </button>

          <button
            onClick={() => setActiveTab('conocimiento')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'conocimiento'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Zap className="w-4 h-4" />
            5. Aprendizaje Colectivo Continuo
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* PESTAÑA A: MIS PROYECTOS (OBRAS, AVANCES Y PLANOS)            */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'proyectos' && (
          <MisProyectosSection user={professionalUser} />
        )}

        {/* ------------------------------------------------------------- */}
        {/* PESTAÑA B: DIRECTORIO & RECURSOS CONECTADOS                   */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'directorio' && (
          <DirectorioRecursosSection user={professionalUser} />
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
                      {bodegaCentralStock.saldoCantidad.toLocaleString()} kg
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border">
                    <span className="text-slate-500 block text-[11px]">Costo Prom. (CPP):</span>
                    <span className="text-base font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      ${bodegaCentralStock.cpp.toFixed(4)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border">
                    <span className="text-slate-500 block text-[11px]">Valor en Custodia:</span>
                    <span className="text-base font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                      ${bodegaCentralStock.costoTotal.toLocaleString()}
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
                      <span className="font-bold">{bodegaCentralStock.rop.toLocaleString()} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Lote Óptimo (EOQ):</span>
                      <span className="font-bold">{bodegaCentralStock.eoq.toLocaleString()} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Stock Seguridad:</span>
                      <span className="font-bold text-emerald-600">{bodegaCentralStock.stockSeguridad.toLocaleString()} kg</span>
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
                      {obraCariamangaStock.saldoCantidad.toLocaleString()} kg
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border">
                    <span className="text-slate-500 block text-[11px]">Costo Imputado a Obra:</span>
                    <span className="text-base font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                      ${obraCariamangaStock.costoTotal.toLocaleString()}
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
        {/* PESTAÑA 5: APRENDIZAJE COLECTIVO CONTINUO & CASCADA */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'conocimiento' && (
          <div className="space-y-6">
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
    </div>
  );
}
