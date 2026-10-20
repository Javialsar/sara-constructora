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
  ExternalLink,
  RotateCcw,
  Send,
  Mail,
  FileSpreadsheet,
  Eye
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { SriXmlService } from '@/lib/services/sriXmlService';
import { 
  ThreeWayMatchService, 
  PurchaseOrder, 
  OrdenDevolucionContable 
} from '@/lib/services/threeWayMatchService';
import { KardexMultibodegaService, DistributionSlipInput } from '@/lib/services/kardexMultibodegaService';
import { IessPayrollService, DailyTareoInput } from '@/lib/services/iessPayrollService';
import { PredictivePurchaseService, SupplierCatalogItem } from '@/lib/services/predictivePurchaseService';
import { VectorKnowledgeService, CollectiveLearningCascadeResult } from '@/lib/services/vectorKnowledgeService';
import { MisProyectosSection } from '@/components/constructora/MisProyectosSection';
import { DirectorioRecursosSection } from '@/components/constructora/DirectorioRecursosSection';
import { ConstructoraDashboardView } from '@/components/constructora/ConstructoraDashboardView';
import { BodegaKardexSection } from '@/components/constructora/BodegaKardexSection';
import { ConfiguracionEmpresaSection } from '@/components/constructora/ConfiguracionEmpresaSection';
import { PlanesSuscripcionSection } from '@/components/constructora/PlanesSuscripcionSection';
import { EquipoAccesosSection } from '@/components/constructora/EquipoAccesosSection';
import { PedidosMaterialesResidenteSection } from '@/components/constructora/PedidosMaterialesResidenteSection';
import {
  ObraMaterialRequestService,
  SolicitudCompraDesdeBodega,
} from '@/lib/services/obraMaterialRequestService';
import { 
  ConstructoraSubscriptionService, 
  AccesoSubscriptionResult 
} from '@/lib/services/constructoraSubscriptionService';
import { exportarAExcel, exportarAPDF } from '@/lib/services/exportReports';
import ThemeToggle from '@/components/ThemeToggle';

export type SuiteTab = 
  | 'dashboard'
  | 'planes'
  | 'configuracion'
  | 'proyectos'
  | 'avances'
  | 'documentos'
  | 'pedidos_obra'
  | 'kardex'
  | 'procura'
  | 'match'
  | 'nomina'
  | 'directorio'
  | 'talento'
  | 'fletes'
  | 'equipo';

export default function EcosistemaAvanzadoPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SuiteTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string>("PANEL PRINCIPAL");
  const [logo, setLogo] = useState<string>('/logo-grupo-sara.png');
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
          'representante_legal',
          'gerente',
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

        // Apertura adaptativa de pestaña según el perfil
        if (role === 'cliente_constructora') {
          setActiveTab('avances');
          setOpenGroup('MI PROYECTO');
        } else if (role === 'bodeguero_constructora') {
          setActiveTab('kardex');
          setOpenGroup('BODEGA E INVENTARIO');
        } else if (role === 'contador_constructora') {
          setActiveTab('match');
          setOpenGroup('CONTABILIDAD Y FINANZAS');
        } else if (role === 'arquitecto_bim') {
          setActiveTab('proyectos');
          setOpenGroup('MIS PROYECTOS');
        } else {
          setActiveTab('dashboard');
          setOpenGroup('PANEL PRINCIPAL');
        }

        const roleLabels: Record<string, string> = {
          representante_legal: 'Representante Legal / Gerente',
          gerente: 'Gerente General',
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
          role: role,
          nombre: meta.nombre || meta.full_name || 'Profesional de Obra',
          empresa: meta.razon_social || meta.empresa || 'Constructora Verificada',
          tipo: roleLabels[role] || meta.tipo_profesional || 'Representante Legal',
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
  // AGENTE GUARDIÁN: CONTROL DE ACCESO Y VIGENCIA DE SUSCRIPCIÓN
  // -------------------------------------------------------------
  const [suscripcionActual, setSuscripcionActual] = useState<AccesoSubscriptionResult | null>(null);

  const verificarSuscripcion = () => {
    const sub = ConstructoraSubscriptionService.verificarAccesoModulos(
      professionalUser?.email || professionalUser?.id
    );
    setSuscripcionActual(sub);
  };

  useEffect(() => {
    if (professionalUser) {
      verificarSuscripcion();
    }
    const handler = () => verificarSuscripcion();
    if (typeof window !== 'undefined') {
      window.addEventListener('constructora_subscription_changed', handler);
      return () => window.removeEventListener('constructora_subscription_changed', handler);
    }
  }, [professionalUser]);

  // Módulos operativos de Imagen 5 que requieren plan activo
  const MODULOS_IMAGEN_5: SuiteTab[] = [
    'dashboard',
    'proyectos',
    'avances',
    'documentos',
    'pedidos_obra',
    'kardex',
    'procura',
    'match',
    'nomina',
    'directorio',
    'talento',
    'fletes',
    'equipo'
  ];

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
  // DEVOLUCIONES DE BODEGA & DESCUENTOS A PROVEEDOR (CONTABILIDAD)
  // -------------------------------------------------------------
  const [contabilidadDevoluciones, setContabilidadDevoluciones] = useState<OrdenDevolucionContable[]>([]);
  const [facturaConDescuento, setFacturaConDescuento] = useState<{
    descuentoAplicado: number;
    nuevoNetoAPagar: number;
    devolucionRef: string;
  } | null>(null);
  const [descuentoAplicadoAlert, setDescuentoAplicadoAlert] = useState<string | null>(null);
  const [selectedDevolucionModal, setSelectedDevolucionModal] = useState<OrdenDevolucionContable | null>(null);

  // Sincronizar devoluciones activas desde el servicio central
  useEffect(() => {
    setContabilidadDevoluciones(ThreeWayMatchService.getDevoluciones());
  }, [activeTab]);

  const handleNotificarProveedor = (devId: string) => {
    ThreeWayMatchService.notificarProveedor(devId);
    setContabilidadDevoluciones(ThreeWayMatchService.getDevoluciones());
    alert('¡Notificación formal enviada al proveedor! Se remitió el Acta de Discrepancia Física de Bodega y el requerimiento de reposición o nota de crédito.');
  };

  const handleAplicarDescuentoContable = (dev: OrdenDevolucionContable) => {
    ThreeWayMatchService.aplicarDescuentoContable(
      dev.id,
      `Deducción automática por faltantes/defectos según Acta ${dev.numeroDevolucion}`,
      matchResult.resumenFinanciero.totalFactura
    );
    setContabilidadDevoluciones(ThreeWayMatchService.getDevoluciones());

    const netoActual = matchResult.retencionPropuesta.valorNetoAPagar;
    const nuevoNeto = Math.max(0, netoActual - dev.totalDescuentoUSD);

    setFacturaConDescuento({
      descuentoAplicado: dev.totalDescuentoUSD,
      nuevoNetoAPagar: nuevoNeto,
      devolucionRef: dev.numeroDevolucion,
    });

    setDescuentoAplicadoAlert(
      `¡Descuento de $${dev.totalDescuentoUSD.toFixed(2)} USD aplicado con éxito en la Factura del Proveedor (${dev.numeroFacturaSRI})! La cuenta por pagar se redujo a $${nuevoNeto.toFixed(2)} USD para evitar pagos indebidos.`
    );
  };

  const handleExportarContabilidad = (formato: 'excel' | 'pdf') => {
    const diffSubtotalPct = matchResult.resumenFinanciero.subtotalOrden > 0
      ? ((Math.abs(matchResult.resumenFinanciero.subtotalFactura - matchResult.resumenFinanciero.subtotalOrden) / matchResult.resumenFinanciero.subtotalOrden) * 100).toFixed(2)
      : '0.00';
    const diffTotalPct = matchResult.resumenFinanciero.totalOrden > 0
      ? ((Math.abs(matchResult.resumenFinanciero.totalFactura - matchResult.resumenFinanciero.totalOrden) / matchResult.resumenFinanciero.totalOrden) * 100).toFixed(2)
      : '0.00';
    const esAprobado = matchResult.status === 'MATCHED_SUCCESS';

    if (formato === 'excel') {
      const datosExcel = [
        {
          'Concepto': 'Subtotal Comprobante SRI',
          'Factura Proveedor ($)': matchResult.resumenFinanciero.subtotalFactura.toFixed(2),
          'Orden de Compra ($)': matchResult.resumenFinanciero.subtotalOrden.toFixed(2),
          'Discrepancia': `${diffSubtotalPct}%`,
          'Dictamen': esAprobado ? 'Aprobado' : 'Rechazado'
        },
        {
          'Concepto': 'IVA 15%',
          'Factura Proveedor ($)': matchResult.resumenFinanciero.ivaFactura.toFixed(2),
          'Orden de Compra ($)': (matchResult.resumenFinanciero.subtotalOrden * 0.15).toFixed(2),
          'Discrepancia': '0.00%',
          'Dictamen': 'Permitido'
        },
        {
          'Concepto': 'Total Factura / OC',
          'Factura Proveedor ($)': matchResult.resumenFinanciero.totalFactura.toFixed(2),
          'Orden de Compra ($)': matchResult.resumenFinanciero.totalOrden.toFixed(2),
          'Discrepancia': `${diffTotalPct}%`,
          'Dictamen': esAprobado ? 'Liquidado para Pago' : 'Pendiente'
        },
        {
          'Concepto': 'Retención Renta Código 312 (1.75%)',
          'Factura Proveedor ($)': matchResult.retencionPropuesta.valorRetenidoRenta.toFixed(2),
          'Orden de Compra ($)': '-',
          'Discrepancia': '-',
          'Dictamen': 'Retenido al Proveedor'
        },
        {
          'Concepto': 'Retención IVA 30%',
          'Factura Proveedor ($)': matchResult.retencionPropuesta.valorRetenidoIva.toFixed(2),
          'Orden de Compra ($)': '-',
          'Discrepancia': '-',
          'Dictamen': 'Retenido al Proveedor'
        },
        {
          'Concepto': 'Valor Neto a Transferir al Proveedor',
          'Factura Proveedor ($)': (matchResult.resumenFinanciero.totalFactura - matchResult.retencionPropuesta.totalRetenido).toFixed(2),
          'Orden de Compra ($)': '-',
          'Discrepancia': '-',
          'Dictamen': 'Neto Pagable'
        }
      ];
      exportarAExcel(datosExcel, 'Liquidacion_Contable_3WayMatch_SARA', 'Contabilidad_SRI', 'contabilidad');
    } else {
      const encabezados = ['Concepto Contable', 'Factura SRI ($)', 'Orden Compra ($)', 'Discrepancia', 'Dictamen Fiscal'];
      const filas = [
        ['Subtotal Bienes y Servicios', `$${matchResult.resumenFinanciero.subtotalFactura.toFixed(2)}`, `$${matchResult.resumenFinanciero.subtotalOrden.toFixed(2)}`, `${diffSubtotalPct}%`, esAprobado ? 'Aprobado' : 'Rechazado'],
        ['IVA 15%', `$${matchResult.resumenFinanciero.ivaFactura.toFixed(2)}`, `$${(matchResult.resumenFinanciero.subtotalOrden * 0.15).toFixed(2)}`, '0.00%', 'Conforme'],
        ['Total Comprobante', `$${matchResult.resumenFinanciero.totalFactura.toFixed(2)}`, `$${matchResult.resumenFinanciero.totalOrden.toFixed(2)}`, `${diffTotalPct}%`, 'Aprobado SRI'],
        ['Retención Renta (1.75%)', `$${matchResult.retencionPropuesta.valorRetenidoRenta.toFixed(2)}`, '-', '-', 'Retenido'],
        ['Retención IVA (30%)', `$${matchResult.retencionPropuesta.valorRetenidoIva.toFixed(2)}`, '-', '-', 'Retenido'],
        ['VALOR LÍQUIDO A PAGAR', `$${(matchResult.resumenFinanciero.totalFactura - matchResult.retencionPropuesta.totalRetenido).toFixed(2)}`, '-', '-', 'Autorizado']
      ];
      exportarAPDF('LIQUIDACIÓN CONTABLE Y FISCAL 3-WAY MATCH SRI', encabezados, filas, 'Liquidacion_Contable_3WayMatch_SARA', 'Auditoría Cruzada Factura SRI vs Orden de Compra vs Bodega con Retenciones LRTI', 'contabilidad');
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
  // TAB 4: PROCURAMIENTO PREDICTIVO GEORREFERENCIADO & SOLICITUDES DE BODEGA
  // -------------------------------------------------------------
  const [selectedCanton, setSelectedCanton] = useState<'Cariamanga' | 'Loja' | 'Cuenca'>('Cariamanga');
  const [solicitudesCompraBodega, setSolicitudesCompraBodega] = useState<SolicitudCompraDesdeBodega[]>([]);
  const [proveedorSeleccionadoOC, setProveedorSeleccionadoOC] = useState<Record<string, string>>({});
  const [ocEmitidaBanner, setOcEmitidaBanner] = useState<string | null>(null);

  useEffect(() => {
    setSolicitudesCompraBodega(ObraMaterialRequestService.getSolicitudesCompraBodega());
    const syncSol = () => setSolicitudesCompraBodega(ObraMaterialRequestService.getSolicitudesCompraBodega());
    if (typeof window !== 'undefined') {
      window.addEventListener('sara_pedidos_obra_updated', syncSol);
      return () => window.removeEventListener('sara_pedidos_obra_updated', syncSol);
    }
  }, [activeTab]);

  const handleEmitirOCDesdeSolicitudBodega = (sol: SolicitudCompraDesdeBodega) => {
    const provElegido =
      proveedorSeleccionadoOC[sol.id] || 'HOLCIM ECUADOR S.A. / ADELCA DISTRIBUCIÓN MAYORISTA';
    const rucElegido = provElegido.includes('ADELCA')
      ? '1790012345001'
      : provElegido.includes('DISENSA')
        ? '1102938475001'
        : '0990004589001';

    const { numeroOC } = ObraMaterialRequestService.emitirOrdenCompraDesdeSolicitud({
      solicitudId: sol.id,
      proveedorNombre: provElegido,
      rucProveedor: rucElegido,
    });

    setSolicitudesCompraBodega(ObraMaterialRequestService.getSolicitudesCompraBodega());
    setOcEmitidaBanner(
      `¡Orden de Compra ${numeroOC} emitida exitosamente a ${provElegido} para cubrir el faltante reportado por el Bodeguero (Solicitud ${sol.numeroSolicitudCompra} • Obra: ${sol.proyectoDestino})!`
    );
  };
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

  const isCliente = professionalUser?.role === 'cliente_constructora';

  const allNavGroups = isCliente ? [
    {
      title: "MI PROYECTO",
      items: [
        { id: "avances", label: "Mi Avance de Obra", icon: ImageIcon },
        { id: "documentos", label: "Mis Planos & Documentos", icon: FileText },
      ]
    }
  ] : [
    {
      title: "PANEL PRINCIPAL",
      items: [
        { id: "dashboard", label: "Dashboard General", icon: LayoutDashboard },
        { id: "planes", label: "Planes - Suscripción", icon: Sparkles },
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
      title: "BODEGA E INVENTARIO",
      items: [
        { id: "pedidos_obra", label: "Pedidos de Materiales (Obra)", icon: Boxes },
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
    },
    {
      title: "ADMINISTRACIÓN & EQUIPO",
      items: [
        { id: "equipo", label: "Equipo & Accesos", icon: UserCheck },
      ]
    }
  ];

  const toggleGroup = (title: string) => {
    setOpenGroup(prev => prev === title ? "" : title);
  };

  const handleTabClick = (tabId: string) => {
    if (isCliente && tabId !== 'avances' && tabId !== 'documentos') {
      return;
    }
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
    if (tab === 'planes' || tab === 'suscripcion') {
      setActiveTab('planes');
      setOpenGroup('PANEL PRINCIPAL');
    } else if (tab === 'equipo' || tab === 'accesos' || tab === 'colaboradores' || tab === 'usuarios') {
      setActiveTab('equipo');
      setOpenGroup('ADMINISTRACIÓN & EQUIPO');
    } else if (tab === 'configuracion' || tab === 'empresa') {
      setActiveTab('configuracion');
    } else if (tab === 'obras' || tab === 'proyectos') {
      setActiveTab('proyectos');
      setOpenGroup('MIS PROYECTOS');
    } else if (tab === 'pedidos_obra' || tab === 'pedidos') {
      setActiveTab('pedidos_obra');
      setOpenGroup('BODEGA E INVENTARIO');
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
      setOpenGroup('BODEGA E INVENTARIO');
    } else if (tab === 'procura' || tab === 'compras') {
      setActiveTab('procura');
      setOpenGroup('BODEGA E INVENTARIO');
    } else if (tab === 'match' || tab === 'contabilidad') {
      setActiveTab('match');
      setOpenGroup('CONTABILIDAD Y FINANZAS');
    } else if (tab === 'nomina') {
      setActiveTab('nomina');
      setOpenGroup('CONTABILIDAD Y FINANZAS');
    } else {
      setActiveTab('dashboard');
      setOpenGroup('PANEL PRINCIPAL');
    }
  };

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard':
        return { group: 'PANEL PRINCIPAL', title: 'Dashboard General de Operaciones' };
      case 'planes':
        return { group: 'PANEL PRINCIPAL', title: 'Planes Oficiales & Suscripción SaaS Constructora' };
      case 'configuracion':
        return { group: 'CONFIGURACIÓN', title: 'Configuración Oficial de la Empresa (Identidad, Membrete & Firmas)' };
      case 'proyectos':
        return { group: 'MIS PROYECTOS', title: 'Obras y Proyectos Activos' };
      case 'pedidos_obra':
        return { group: 'BODEGA E INVENTARIO', title: 'Pedidos de Materiales del Residente a Bodega (APU & Manual)' };
      case 'avances':
        return { group: 'MIS PROYECTOS', title: 'Avances de Obra & Fiscalización Fotográfica' };
      case 'documentos':
        return { group: 'MIS PROYECTOS', title: 'Gestor Documental (Planos & Memorias)' };
      case 'kardex':
        return { group: 'BODEGA E INVENTARIO', title: 'Gestión de Bodega, Inventarios & Kardex' };
      case 'procura':
        return { group: 'BODEGA E INVENTARIO', title: 'Procuramiento Predictivo & Cotizador B2B' };
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
      case 'equipo':
        return { group: 'ADMINISTRACIÓN & EQUIPO', title: 'Equipo & Accesos de la Constructora (RBAC Multi-Tenant)' };
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

      {/* Sidebar estilo Imagen 1 con paleta Constructora (Slate-950 y Ámbar-500) */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 bg-slate-950 dark:bg-black text-white flex flex-col h-full shadow-2xl border-r border-slate-800 transition-all duration-300 ${
        mobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
      } ${isSidebarCollapsed ? "md:w-20" : "md:w-64"}`}>
        {/* Header del Sidebar */}
        <div className={`p-4 border-b border-slate-800 flex items-center ${isSidebarCollapsed ? "justify-center" : "justify-between"} gap-2`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 shrink-0 bg-white rounded-lg flex items-center justify-center p-1 shadow-sm ring-1 ring-amber-500/30">
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
                <p className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">SARA CONSTRUCTORA</p>
              </div>
            )}
          </div>
          {!isSidebarCollapsed && (
            <button 
              onClick={() => setIsSidebarCollapsed(true)} 
              className="hidden md:flex text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-900 transition-colors"
              title="Colapsar menú (modo compacto)"
            >
              <ChevronRight className="rotate-180" size={16} />
            </button>
          )}
          <button 
            onClick={() => setMobileMenuOpen(false)} 
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-900 transition-colors"
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
                  {gIdx > 0 && <div className="border-t border-slate-800 my-2 mx-2" />}
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
                            ? "bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/50" 
                            : "text-slate-400 hover:text-white hover:bg-slate-900"
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
                        ? "text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20"
                        : isOpen 
                          ? "bg-slate-900 text-white" 
                          : "text-slate-400 hover:bg-slate-900 hover:text-white"
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
                        const isLocked = !suscripcionActual?.hasAccess && MODULOS_IMAGEN_5.includes(item.id as SuiteTab);
                        return (
                          <button 
                            key={item.id}
                            onClick={() => handleTabClick(item.id)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all text-left ${
                              isActive 
                                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 ring-1 ring-amber-400/50" 
                                : isLocked
                                  ? "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 font-medium"
                                  : "text-slate-300 hover:bg-slate-900 hover:text-white font-medium"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Icon size={18} className="shrink-0" />
                              <span className="whitespace-nowrap overflow-hidden text-xs truncate">{item.label}</span>
                            </div>
                            {isLocked && (
                              <Lock size={12} className="text-amber-500/70 shrink-0 ml-1.5" />
                            )}
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
        <div className="p-3 border-t border-slate-800">
          {!isCliente && (
            <button 
              onClick={() => handleTabClick('configuracion')}
              title="Configuración de la Empresa" 
              className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center w-11 h-11 mx-auto" : "gap-3 px-3 py-2"} rounded-xl transition-colors text-xs mb-1 ${
                activeTab === 'configuracion' 
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 ring-1 ring-amber-400/50" 
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Settings size={18} className="shrink-0" />
              {!isSidebarCollapsed && <span className="whitespace-nowrap overflow-hidden font-medium">Configuración de la Empresa</span>}
            </button>
          )}
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
              <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
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

            {/* Chip de Estado de Suscripción Oficial */}
            {isCliente ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                <CheckCircle2 size={13} className="text-teal-500 shrink-0" />
                <span>Cliente de Obra Verificado</span>
              </div>
            ) : suscripcionActual && (
              <button
                onClick={() => setActiveTab('planes')}
                title="Ver Planes y Estado de Suscripción"
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  suscripcionActual.hasAccess
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                    : suscripcionActual.motivoBloqueo === 'PENDIENTE_ACTIVACION'
                      ? 'bg-amber-950/40 text-amber-300 border border-amber-500/50 hover:bg-amber-950/60'
                      : 'bg-rose-950/40 text-rose-300 border border-rose-500/50 hover:bg-rose-950/60'
                }`}
              >
                {suscripcionActual.hasAccess ? (
                  <>
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>{suscripcionActual.cliente?.planNombre || 'Plan Pro'} ({suscripcionActual.diasRestantes}d)</span>
                  </>
                ) : (
                  <>
                    <Lock size={13} className="text-amber-500 shrink-0" />
                    <span>{suscripcionActual.motivoBloqueo === 'PENDIENTE_ACTIVACION' ? 'Plan Pendiente' : 'Suscripción Vencida'}</span>
                  </>
                )}
              </button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Chip de Usuario Profesional */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-sm ring-1 ring-amber-400/50">
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
          
          {/* PANTALLA DE BLOQUEO DE SUSCRIPCIÓN PARA MÓDULOS DE IMAGEN 5 */}
          {!isCliente && !suscripcionActual?.hasAccess && MODULOS_IMAGEN_5.includes(activeTab) && (
            <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-amber-500/30 p-8 sm:p-12 text-center max-w-2xl mx-auto my-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto">
                <Lock size={32} />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 inline-block">
                  Control de Acceso • Agente Guardián de Suscripción
                </span>
                <h3 className="text-2xl font-black text-white">
                  Módulo Operativo Bloqueado
                </h3>
                <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  {suscripcionActual?.mensaje || "Para acceder a este módulo se requiere una suscripción activa a SARA Constructora."}
                </p>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-1.5 font-mono text-left max-w-md mx-auto">
                <div className="flex justify-between">
                  <span>Estado Actual:</span>
                  <span className="font-bold text-amber-400">{suscripcionActual?.cliente?.estado || 'SIN PLAN'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Plan Contratado:</span>
                  <span className="text-white">{suscripcionActual?.cliente?.planNombre || 'Ninguno'}</span>
                </div>
                {suscripcionActual?.cliente?.fechaVencimiento && (
                  <div className="flex justify-between">
                    <span>Fecha de Vencimiento:</span>
                    <span className="text-rose-400">{suscripcionActual?.cliente?.fechaVencimiento}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('planes')}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all hover:scale-102 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles size={16} />
                  <span>Ver Planes y Métodos de Pago</span>
                </button>

                <button
                  onClick={() => setActiveTab('configuracion')}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Settings size={16} />
                  <span>Configuración de la Empresa</span>
                </button>
              </div>
            </div>
          )}

          {/* VISTA: PLANES - SUSCRIPCIÓN */}
          {activeTab === 'planes' && (
            <PlanesSuscripcionSection 
              user={professionalUser}
              onPlanChanged={verificarSuscripcion}
            />
          )}

          {/* VISTA: CONFIGURACIÓN DE LA EMPRESA (Viñeta 1 + Viñeta 2) */}
          {activeTab === 'configuracion' && (
            <ConfiguracionEmpresaSection />
          )}

          {/* VISTA 1: DASHBOARD GENERAL (Idéntico a Imagen 1) */}
          {activeTab === 'dashboard' && suscripcionActual?.hasAccess && (
            <ConstructoraDashboardView 
              user={professionalUser}
              onNavigate={handleNavigate}
            />
          )}

          {/* VISTA 2: MIS PROYECTOS */}
          {activeTab === 'proyectos' && suscripcionActual?.hasAccess && (
            <MisProyectosSection user={professionalUser} initialSubTab="obras" />
          )}

          {activeTab === 'pedidos_obra' && suscripcionActual?.hasAccess && (
            <PedidosMaterialesResidenteSection
              user={professionalUser}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'avances' && (isCliente || suscripcionActual?.hasAccess) && (
            <MisProyectosSection user={professionalUser} initialSubTab="avances" />
          )}

          {activeTab === 'documentos' && (isCliente || suscripcionActual?.hasAccess) && (
            <MisProyectosSection user={professionalUser} initialSubTab="documentos" />
          )}

          {/* VISTA 3: DIRECTORIO Y RECURSOS */}
          {activeTab === 'directorio' && suscripcionActual?.hasAccess && (
            <DirectorioRecursosSection user={professionalUser} initialSubTab="clientes" />
          )}

          {activeTab === 'talento' && suscripcionActual?.hasAccess && (
            <DirectorioRecursosSection user={professionalUser} initialSubTab="trabajadores" />
          )}

          {activeTab === 'fletes' && suscripcionActual?.hasAccess && (
            <DirectorioRecursosSection user={professionalUser} initialSubTab="proveedores" />
          )}

          {/* VISTA 4: EQUIPO & ACCESOS DE LA CONSTRUCTORA (RBAC MULTI-TENANT) */}
          {activeTab === 'equipo' && (suscripcionActual?.hasAccess || professionalUser?.role === 'admin' || professionalUser?.role === 'representante_legal') && (
            <EquipoAccesosSection 
              user={professionalUser}
              planInfo={suscripcionActual?.cliente?.planNombre}
            />
          )}

        {/* ------------------------------------------------------------- */}
        {/* PESTAÑA 1: THREE-WAY MATCH SRI */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'match' && suscripcionActual?.hasAccess && (
          <div className="space-y-6">

            {/* Barra Superior de Contabilidad con Botones de Exportar Oficiales */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-500" />
                  <span>Auditoría Contable & Retenciones del SRI (Ecuador)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Conciliación 3-Way Match con tolerancia automática &le; 1% y cálculo de retenciones en la fuente.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportarContabilidad('excel')}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Descargar liquidación contable en Excel"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Descargar Excel</span>
                </button>
                <button
                  onClick={() => handleExportarContabilidad('pdf')}
                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Descargar informe contable y tributario en PDF"
                >
                  <FileText className="w-4 h-4" />
                  <span>Descargar PDF</span>
                </button>
              </div>
            </div>

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

            {/* Banner de Descuento Contable Aplicado */}
            {descuentoAplicadoAlert && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between text-emerald-900 dark:text-emerald-200 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                    <CheckCircle2 size={18} />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      Liquidación Contable Ajustada por Discrepancia de Bodega
                    </h4>
                    <p className="text-xs mt-0.5">{descuentoAplicadoAlert}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDescuentoAplicadoAlert(null)}
                  className="p-1.5 text-emerald-600 hover:text-emerald-800"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* SECCIÓN DEDICADA: ÓRDENES DE DEVOLUCIÓN Y DESCUENTOS POR DISCREPANCIA */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center font-bold shrink-0">
                    <RotateCcw size={20} />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Órdenes de Devolución & Descuentos por Discrepancia Física de Bodega</span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        {contabilidadDevoluciones.length} Actas
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Liquidación cruzada en tiempo real: Insumos rechazados o faltantes en bodega central se notifican al proveedor y se descuentan de la factura antes de ordenar la transferencia.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                    <span className="text-slate-400 block text-[10px]">Total Valor a Descontar:</span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                      ${contabilidadDevoluciones.reduce((acc, d) => acc + d.totalDescuentoUSD, 0).toFixed(2)} USD
                    </span>
                  </div>
                </div>
              </div>

              {/* Lista de Órdenes de Devolución */}
              {contabilidadDevoluciones.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2 opacity-60" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    No existen órdenes de devolución pendientes
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Todas las recepciones físicas de insumos en bodega han ingresado 100% conformes con sus facturas del SRI.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {contabilidadDevoluciones.map((dev) => (
                    <div 
                      key={dev.id}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-amber-500 shrink-0 font-mono font-bold text-xs">
                            {dev.numeroDevolucion}
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white text-sm">
                                {dev.proveedor}
                              </span>
                              <span className="font-mono text-xs text-slate-400">
                                (RUC: {dev.rucProveedor})
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                                dev.estado === 'DESCUENTO_APLICADO_FACTURA'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                                  : dev.estado === 'NOTIFICADO_PROVEEDOR'
                                    ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-sky-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                              }`}>
                                {dev.estado === 'DESCUENTO_APLICADO_FACTURA'
                                  ? '✓ Descuento Aplicado a Factura'
                                  : dev.estado === 'NOTIFICADO_PROVEEDOR'
                                    ? '✉ Notificado al Proveedor'
                                    : '⏳ Pendiente en Contabilidad'}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1 font-mono">
                              <span>OC Ref: <strong className="text-amber-600 dark:text-amber-400">{dev.numeroOCReferencia}</strong></span>
                              <span>•</span>
                              <span>Factura SRI: <strong className="text-slate-700 dark:text-slate-300">{dev.numeroFacturaSRI}</strong></span>
                              <span>•</span>
                              <span>Guía Remisión: <strong className="text-slate-700 dark:text-slate-300">{dev.guiaRemision}</strong></span>
                              <span>•</span>
                              <span>Fecha: {dev.fecha} {dev.hora}</span>
                            </div>
                          </div>
                        </div>

                        {/* Valor y Acciones */}
                        <div className="flex items-center gap-3 self-end lg:self-center">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-mono block">Valor a Descontar</span>
                            <span className="text-lg font-mono font-bold text-rose-600 dark:text-rose-400">
                              -${dev.totalDescuentoUSD.toFixed(2)} USD
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {dev.estado === 'PENDIENTE_NOTIFICACION' && (
                              <button
                                onClick={() => handleNotificarProveedor(dev.id)}
                                className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center gap-1.5 cursor-pointer transition-all"
                                title="Enviar notificación formal con Acta de Discrepancia al Proveedor"
                              >
                                <Mail size={14} />
                                <span>Notificar Proveedor</span>
                              </button>
                            )}

                            {dev.estado !== 'DESCUENTO_APLICADO_FACTURA' && (
                              <button
                                onClick={() => handleAplicarDescuentoContable(dev)}
                                className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer transition-all"
                                title="Aplicar deducción directa en cuenta por pagar de la factura del SRI"
                              >
                                <Receipt size={14} />
                                <span>Aplicar Descuento a Factura</span>
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedDevolucionModal(dev)}
                              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                              title="Ver Acta de Discrepancia de Bodega"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Tabla de Productos con Discrepancia */}
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800/70 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
                              <th className="py-2 px-3 font-semibold">Código</th>
                              <th className="py-2 px-3 font-semibold">Insumo Rechazado / Faltante</th>
                              <th className="py-2 px-2 font-semibold text-center">Unidad</th>
                              <th className="py-2 px-2 font-semibold text-center">Cant. Pedida</th>
                              <th className="py-2 px-2 font-semibold text-center text-emerald-600">Ingresada</th>
                              <th className="py-2 px-2 font-semibold text-center text-rose-600">Faltante/Dañada</th>
                              <th className="py-2 px-3 font-semibold">Motivo Legal</th>
                              <th className="py-2 px-2 font-semibold text-right">C. Unit</th>
                              <th className="py-2 px-3 font-semibold text-right text-rose-600">Total Descuento</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                            {dev.items.map((it, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-400">{it.insumoCodigo}</td>
                                <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{it.insumoNombre}</td>
                                <td className="py-2 px-2 text-center text-slate-500">{it.unidad}</td>
                                <td className="py-2 px-2 text-center font-mono">{it.cantidadPedida}</td>
                                <td className="py-2 px-2 text-center font-mono text-emerald-600 font-bold">{it.cantidadIngresada}</td>
                                <td className="py-2 px-2 text-center font-mono text-rose-600 font-bold">{it.cantidadFaltante + it.cantidadDefectuosa}</td>
                                <td className="py-2 px-3 text-slate-600 dark:text-slate-400 text-[11px]">{it.motivo}</td>
                                <td className="py-2 px-2 text-right font-mono">${it.costoUnitario.toFixed(2)}</td>
                                <td className="py-2 px-3 text-right font-mono font-bold text-rose-600">-${it.subtotalDescuento.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal de Detalle de Devolución para Contabilidad */}
            {selectedDevolucionModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
                <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Expediente de Discrepancia Contable</span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Acta de Devolución {selectedDevolucionModal.numeroDevolucion}
                      </h3>
                    </div>
                    <button 
                      onClick={() => setSelectedDevolucionModal(null)}
                      className="p-1.5 text-slate-400 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Proveedor:</span>
                      <strong className="text-slate-900 dark:text-white">{selectedDevolucionModal.proveedor}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Factura SRI:</span>
                      <span className="font-mono">{selectedDevolucionModal.numeroFacturaSRI}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Orden de Compra:</span>
                      <span className="font-mono text-amber-500 font-bold">{selectedDevolucionModal.numeroOCReferencia}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Guía Remisión:</span>
                      <span className="font-mono">{selectedDevolucionModal.guiaRemision}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Transportista:</span>
                      <span>{selectedDevolucionModal.transportista} ({selectedDevolucionModal.placaVehiculo})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Responsable Bodega:</span>
                      <span>{selectedDevolucionModal.responsableBodega}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex justify-between items-center text-xs">
                    <span className="font-semibold text-rose-800 dark:text-rose-200">
                      Monto Total Descontado / Retenido al Proveedor:
                    </span>
                    <span className="text-xl font-mono font-bold text-rose-600 dark:text-rose-400">
                      -${selectedDevolucionModal.totalDescuentoUSD.toFixed(2)} USD
                    </span>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setSelectedDevolucionModal(null)}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* PESTAÑA 2: BODEGA, INVENTARIOS & KARDEX OPERATIVO */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'kardex' && suscripcionActual?.hasAccess && (
          <BodegaKardexSection user={professionalUser} onNavigate={handleNavigate} />
        )}

        {/* ------------------------------------------------------------- */}
        {/* PESTAÑA 3: NÓMINA IESS CONSTRUCCIÓN & TAREO */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'nomina' && suscripcionActual?.hasAccess && (
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
                    SBU 2026: $482.00 USD
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
        {activeTab === 'procura' && suscripcionActual?.hasAccess && (
          <div className="space-y-6">
            {ocEmitidaBanner && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-4 text-emerald-900 dark:text-emerald-200 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                    <CheckCircle2 size={18} />
                  </span>
                  <p className="text-xs font-semibold">{ocEmitidaBanner}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOcEmitidaBanner(null)}
                  className="p-1.5 rounded-lg hover:bg-black/10 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* BANDEJA DE SOLICITUDES DE COMPRA REMITIDAS POR EL BODEGUERO (POR FALTA DE STOCK) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                    Escalamiento Bodega → Área de Compras
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Solicitudes de Compra Remitidas por el Bodeguero (Faltantes de Stock en Obra)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Materiales solicitados por el Ingeniero Residente que no tuvieron disponibilidad en Bodega Central y requieren emisión de Orden de Compra (OC).
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300">
                  {solicitudesCompraBodega.filter(s => s.estado === 'PENDIENTE_COTIZACION_COMPRAS').length} Pendientes de OC
                </span>
              </div>

              <div className="space-y-4">
                {solicitudesCompraBodega.map(sol => (
                  <div
                    key={sol.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-3"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-rose-600 text-white">
                            {sol.numeroSolicitudCompra}
                          </span>
                          <span className="font-mono text-xs text-amber-600 dark:text-amber-400 font-bold">
                            Origen: {sol.numeroPedidoOrigen}
                          </span>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            • {sol.proyectoDestino} ({sol.frenteObra})
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Solicitado por Residente: <strong>{sol.residenteSolicitante}</strong> • Certificado sin stock por: <strong>{sol.bodegueroSolicitante}</strong> ({sol.fechaSolicitud} {sol.horaSolicitud})
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {sol.estado === 'PENDIENTE_COTIZACION_COMPRAS' ? (
                          <>
                            <select
                              value={
                                proveedorSeleccionadoOC[sol.id] ||
                                'HOLCIM ECUADOR S.A. / ADELCA DISTRIBUCIÓN MAYORISTA'
                              }
                              onChange={e =>
                                setProveedorSeleccionadoOC(prev => ({
                                  ...prev,
                                  [sol.id]: e.target.value,
                                }))
                              }
                              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                            >
                              <option value="HOLCIM ECUADOR S.A. / ADELCA DISTRIBUCIÓN MAYORISTA">
                                Planta Mayorista (Holcim / Adelca - Mejor Precio)
                              </option>
                              <option value="DISENSA DISTRIBUIDORA SUR LOJA">
                                Distribuidor Local Disensa (Entrega 3 Horas)
                              </option>
                              <option value="CANTERA & MATERIALES SUR LOJA CÍA. LTDA.">
                                Cantera & Suministros Sur Loja
                              </option>
                            </select>
                            <button
                              type="button"
                              onClick={() => handleEmitirOCDesdeSolicitudBodega(sol)}
                              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                            >
                              <ShoppingCart size={14} />
                              <span>Generar Orden de Compra (OC)</span>
                            </button>
                          </>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold border border-emerald-300 flex items-center gap-1.5">
                            <CheckCircle2 size={14} />
                            <span>OC Emitida: {sol.numeroOCGenerada} ({sol.proveedorSeleccionado})</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800/80 text-[10px] font-mono uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                            <th className="py-2 px-3">Código</th>
                            <th className="py-2 px-3">Material Faltante en Bodega</th>
                            <th className="py-2 px-2 text-center">Pedido Residente</th>
                            <th className="py-2 px-2 text-center text-emerald-600">Atendido Bodega</th>
                            <th className="py-2 px-2 text-center text-rose-600">Cantidad a Comprar (OC)</th>
                            <th className="py-2 px-3 text-right">Subtotal Est. ($)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                          {sol.itemsAComprar.map((it, idx) => (
                            <tr key={idx}>
                              <td className="py-2 px-3 text-slate-500">{it.codigo}</td>
                              <td className="py-2 px-3 font-sans font-bold text-slate-900 dark:text-white">
                                {it.nombre}
                              </td>
                              <td className="py-2 px-2 text-center">
                                {it.cantidadSolicitadaResidente} {it.unidad}
                              </td>
                              <td className="py-2 px-2 text-center text-emerald-600 font-bold">
                                {it.cantidadDespachadaDesdeBodega} {it.unidad}
                              </td>
                              <td className="py-2 px-2 text-center text-rose-600 font-bold">
                                {it.cantidadAComprar} {it.unidad}
                              </td>
                              <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white">
                                ${it.subtotalEstimadoUSD.toFixed(2)} USD
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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


        </div>
      </main>
    </div>
  );
}
