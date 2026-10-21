'use client';

import React, { useState, useEffect } from 'react';
import {
  HardHat,
  Package,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Wrench,
  Building2,
  ArrowRight,
  Warehouse,
  ShoppingCart,
  ClipboardList,
  ShieldCheck,
  Search,
  Database,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  ObraMaterialRequestService,
  PedidoMaterialObra,
  ItemPedidoResidente,
  PrioridadPedido,
  RubroApuPlantilla,
} from '@/lib/services/obraMaterialRequestService';

interface PedidosMaterialesResidenteSectionProps {
  user: any;
  onNavigate?: (tab: string) => void;
}

interface InsumoMaestroSara {
  id: string;
  codigo: string;
  nombre: string;
  unidad: string;
  precio_sin_iva: number;
  categoria?: string;
  proveedorSugerido?: string;
  enBodegaLocal?: boolean;
}

// 1. Artículos que sí están en el Kardex físico de la Bodega Central de Obra
const CATALOGO_BODEGA_LOCAL = [
  { id: 'cemento_holcim', codigo: 'INS-CEM-001', nombre: 'Cemento Holcim Fuerte 50kg (En Bodega: 85 Sacos)', nombreLimpio: 'Cemento Holcim Fuerte 50kg', categoria: 'CEMENTO' as const, unidad: 'Saco', costoRef: 7.45 },
  { id: 'acero_adelca_12', codigo: 'INS-ACE-012', nombre: 'Varilla Acero Corrugado Adelca 12mm x 12m (En Bodega: 24,500 kg)', nombreLimpio: 'Varilla Acero Corrugado Adelca 12mm x 12m', categoria: 'ACERO' as const, unidad: 'kg', costoRef: 1.18 },
  { id: 'arena_gruesa', codigo: 'INS-ARI-003', nombre: 'Arena Gruesa de Mina Lavada (En Bodega: 18 m³)', nombreLimpio: 'Arena Gruesa de Mina Lavada', categoria: 'ARIDOS' as const, unidad: 'm³', costoRef: 14.5 },
  { id: 'bloque_15', codigo: 'INS-MAM-015', nombre: 'Bloque Alivianado Prensado 15x20x40 (En Bodega: 6,200 u)', nombreLimpio: 'Bloque Alivianado Prensado 15x20x40', categoria: 'MAMPOSTERIA' as const, unidad: 'Unidad', costoRef: 0.48 },
  { id: 'hormigon_210', codigo: 'INS-HOR-210', nombre: 'Hormigón Premezclado f\'c=210 kg/cm² (En Bodega: 65 m³)', nombreLimpio: 'Hormigón Premezclado f\'c=210 kg/cm²', categoria: 'HORMIGON' as const, unidad: 'm³', costoRef: 94.5 },
  { id: 'tuberia_pvc_110', codigo: 'INS-TUB-110', nombre: 'Tubo PVC Sanitario Reforzado 110mm x 3m (En Bodega: 120 Tubos)', nombreLimpio: 'Tubo PVC Sanitario Reforzado 110mm x 3m', categoria: 'TUBERIA' as const, unidad: 'Tubo', costoRef: 11.2 },
];

// 2. Semilla curada del Catálogo Maestro de Insumos GRUPO SARA (Acabados, Sanitarios Briggs/FV/Edesa, Eléctricos, Químicos, Encofrados)
// Se combina en tiempo real con la consulta a `supabase.from('insumos')`
const CATALOGO_MAESTRO_SARA_RESPALDO: InsumoMaestroSara[] = [
  {
    id: 'maestro-briggs-01',
    codigo: 'SARA-SAN-0104',
    nombre: 'Asiento para Inodoro / Baño Elongado Caída Lenta Color Beige Marca Briggs',
    unidad: 'Unidad',
    precio_sin_iva: 18.5,
    categoria: 'APARATOS SANITARIOS & GRIFERÍA',
    proveedorSugerido: 'EDESA / BRIGGS ECUADOR S.A.',
  },
  {
    id: 'maestro-briggs-02',
    codigo: 'SARA-SAN-0105',
    nombre: 'Inodoro One Piece Sanitario Elongado Color Beige Línea Montecarlo Marca Briggs',
    unidad: 'Unidad',
    precio_sin_iva: 142.0,
    categoria: 'APARATOS SANITARIOS & GRIFERÍA',
    proveedorSugerido: 'EDESA / BRIGGS ECUADOR S.A.',
  },
  {
    id: 'maestro-briggs-03',
    codigo: 'SARA-SAN-0108',
    nombre: 'Lavamanos de Pedestal / Mesón Porcelana Vitrificada Beige Marca Briggs',
    unidad: 'Unidad',
    precio_sin_iva: 54.8,
    categoria: 'APARATOS SANITARIOS & GRIFERÍA',
    proveedorSugerido: 'EDESA / BRIGGS ECUADOR S.A.',
  },
  {
    id: 'maestro-fv-01',
    codigo: 'SARA-GRI-0210',
    nombre: 'Grifería Monocomando para Lavamanos Cromada Línea Franz Viegener (FV)',
    unidad: 'Unidad',
    precio_sin_iva: 68.5,
    categoria: 'APARATOS SANITARIOS & GRIFERÍA',
    proveedorSugerido: 'FV ÁREA ANDINA S.A.',
  },
  {
    id: 'maestro-sika-01',
    codigo: 'SARA-QUI-009',
    nombre: 'Aditivo Plastificante Acelerante SikaPlast-100 (Caneca 20 Litros)',
    unidad: 'Caneca',
    precio_sin_iva: 46.5,
    categoria: 'ADITIVOS & QUÍMICOS',
    proveedorSugerido: 'SIKA ECUATORIANA S.A.',
  },
  {
    id: 'maestro-sika-02',
    codigo: 'SARA-QUI-014',
    nombre: 'Impermeabilizante Acrílico Elastomérico SikaFill-10 Techo (Caneca 20 kg)',
    unidad: 'Caneca',
    precio_sin_iva: 64.9,
    categoria: 'ADITIVOS & QUÍMICOS',
    proveedorSugerido: 'SIKA ECUATORIANA S.A.',
  },
  {
    id: 'maestro-graiman-01',
    codigo: 'SARA-ACA-0312',
    nombre: 'Porcelanato Rectificado Antideslizante Beige Marfil 60x60cm Graiman (Primera)',
    unidad: 'm²',
    precio_sin_iva: 19.8,
    categoria: 'REVESTIMIENTOS & PISOS',
    proveedorSugerido: 'GRAIMAN CÍA. LTDA.',
  },
  {
    id: 'maestro-pintuco-01',
    codigo: 'SARA-PIN-0088',
    nombre: 'Pintura Látex Acrílica Lavable Koraza / Viniltex Blanco Hueso & Beige (Caneca 5 Gal)',
    unidad: 'Caneca',
    precio_sin_iva: 89.5,
    categoria: 'PINTURAS & ACABADOS',
    proveedorSugerido: 'PINTUCO ECUADOR',
  },
  {
    id: 'maestro-elec-01',
    codigo: 'SARA-ELE-0402',
    nombre: 'Cable Cobre Flexible THHN/THWN-2 Calibre 12 AWG 90°C (Rollo 100m Incable)',
    unidad: 'Rollo',
    precio_sin_iva: 58.4,
    categoria: 'INSTALACIONES ELÉCTRICAS',
    proveedorSugerido: 'INCABLE / ELECTROCABLES C.A.',
  },
  {
    id: 'maestro-enc-01',
    codigo: 'SARA-ENC-004',
    nombre: 'Puntal Metálico Telescópico Galvanizado 3.50m (Capacidad 2.0 Ton)',
    unidad: 'Unidad',
    precio_sin_iva: 22.8,
    categoria: 'ENCOFRADOS & EQUIPOS MENORES',
    proveedorSugerido: 'IMPORTADORA FERRETERA SARA',
  },
  {
    id: 'maestro-malla-01',
    codigo: 'SARA-ACE-018',
    nombre: 'Malla Electrosoldada R-188 (6mm @ 15cm) Plancha 6.00 x 2.40m INEN',
    unidad: 'Plancha',
    precio_sin_iva: 36.4,
    categoria: 'ACEROS & ESTRUCTURAS',
    proveedorSugerido: 'ADELCA / NOVACERO',
  },
];

export function PedidosMaterialesResidenteSection({
  user,
  onNavigate,
}: PedidosMaterialesResidenteSectionProps) {
  const rubrosPlantillas = ObraMaterialRequestService.getRubrosApuPlantillas();

  const [pedidosList, setPedidosList] = useState<PedidoMaterialObra[]>([]);
  const [modoIngreso, setModoIngreso] = useState<'APU' | 'MANUAL'>('APU');
  const [selectedRubroId, setSelectedRubroId] = useState<string>(rubrosPlantillas[0]?.id || 'rub-apu-01');

  // Datos generales de la solicitud del Residente
  const [proyectoNombre, setProyectoNombre] = useState<string>('Torre SARA Loja (Pisos 4-8)');
  const [frenteObra, setFrenteObra] = useState<string>('Losa y Columnas Eje A-E (Nivel 6)');
  const [prioridad, setPrioridad] = useState<PrioridadPedido>('URGENTE_24H');
  const [justificacion, setJustificacion] = useState<string>(
    'Requerimiento de materiales según cronograma de fundición semanal y control de avance físico de obra.'
  );

  // Carrito de ítems a solicitar a Bodega
  const [itemsCarrito, setItemsCarrito] = useState<ItemPedidoResidente[]>([]);

  // Campos para agregar un ítem en Modo Manual / Catálogo Maestro
  const [manualCatalogoId, setManualCatalogoId] = useState<string>('catalogo_maestro_sara');
  const [busquedaMaestroQuery, setBusquedaMaestroQuery] = useState<string>('');
  const [resultadosMaestro, setResultadosMaestro] = useState<InsumoMaestroSara[]>(CATALOGO_MAESTRO_SARA_RESPALDO);
  const [buscandoEnSupabase, setBuscandoEnSupabase] = useState<boolean>(false);
  const [insumoMaestroSeleccionado, setInsumoMaestroSeleccionado] = useState<InsumoMaestroSara | null>(
    CATALOGO_MAESTRO_SARA_RESPALDO[0]
  );

  const [manualCodigoCustom, setManualCodigoCustom] = useState<string>('SARA-SAN-0104');
  const [manualNombreCustom, setManualNombreCustom] = useState<string>(
    CATALOGO_MAESTRO_SARA_RESPALDO[0].nombre
  );
  const [manualUnidadCustom, setManualUnidadCustom] = useState<string>(
    CATALOGO_MAESTRO_SARA_RESPALDO[0].unidad
  );
  const [manualCostoCustom, setManualCostoCustom] = useState<number>(
    CATALOGO_MAESTRO_SARA_RESPALDO[0].precio_sin_iva
  );
  const [manualCantidad, setManualCantidad] = useState<number>(15);
  const [manualObs, setManualObs] = useState<string>('Requerimiento emergente en frente de obra');

  // Banner de confirmación
  const [bannerExito, setBannerExito] = useState<string | null>(null);

  const cargarDatos = () => {
    setPedidosList(ObraMaterialRequestService.getPedidos());
  };

  useEffect(() => {
    cargarDatos();
    const handler = () => cargarDatos();
    window.addEventListener('sara_pedidos_obra_updated', handler);
    return () => window.removeEventListener('sara_pedidos_obra_updated', handler);
  }, []);

  // Buscador en vivo contra el Catálogo Maestro de Insumos de GRUPO SARA (Supabase `insumos` + Semilla Maestra)
  useEffect(() => {
    let cancelado = false;
    const buscarEnCatalogoMaestro = async () => {
      const q = busquedaMaestroQuery.trim().toLowerCase();

      // 1. Filtrar primero sobre la semilla curada (incluye matching flexible brigs -> briggs, bano -> baño)
      const qNorm = q
        .replace(/brigs/g, 'briggs')
        .replace(/[áä]/g, 'a')
        .replace(/[éë]/g, 'e')
        .replace(/[íï]/g, 'i')
        .replace(/[óö]/g, 'o')
        .replace(/[úü]/g, 'u');

      const coincidenciasLocales = CATALOGO_MAESTRO_SARA_RESPALDO.filter(item => {
        if (!qNorm) return true;
        const textoItem = `${item.codigo} ${item.nombre} ${item.categoria || ''} ${item.proveedorSugerido || ''}`
          .toLowerCase()
          .replace(/[áä]/g, 'a')
          .replace(/[éë]/g, 'e')
          .replace(/[íï]/g, 'i')
          .replace(/[óö]/g, 'o')
          .replace(/[úü]/g, 'u');
        const palabras = qNorm.split(/\s+/).filter(Boolean);
        return palabras.every(p => textoItem.includes(p)) || textoItem.includes(qNorm);
      });

      setBuscandoEnSupabase(true);
      try {
        const supabase = createClient();
        let query = supabase
          .from('insumos')
          .select('id, codigo, nombre, unidad, precio_sin_iva, categoria')
          .eq('estado', true)
          .limit(15);

        if (q.length >= 2) {
          const primeraPalabra = q.split(/\s+/)[0];
          query = query.or(`nombre.ilike.%${primeraPalabra}%,codigo.ilike.%${primeraPalabra}%`);
        }

        const { data } = await query;
        if (!cancelado) {
          const desdeDb: InsumoMaestroSara[] = (data || []).map((row: any) => ({
            id: String(row.id),
            codigo: String(row.codigo || 'SARA-INS'),
            nombre: String(row.nombre || 'Insumo Maestro SARA'),
            unidad: String(row.unidad || 'u'),
            precio_sin_iva: Number(row.precio_sin_iva) || 10.0,
            categoria: row.categoria || 'CATÁLOGO MAESTRO APU SARA',
            proveedorSugerido: 'Red de Proveedores Calificados GRUPO SARA',
          }));

          const codigosVistos = new Set(coincidenciasLocales.map(c => c.codigo));
          const fusionados = [
            ...coincidenciasLocales,
            ...desdeDb.filter(d => !codigosVistos.has(d.codigo)),
          ];
          setResultadosMaestro(fusionados);
        }
      } catch {
        if (!cancelado) {
          setResultadosMaestro(coincidenciasLocales);
        }
      } finally {
        if (!cancelado) {
          setBuscandoEnSupabase(false);
        }
      }
    };

    const timer = setTimeout(buscarEnCatalogoMaestro, 180);
    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [busquedaMaestroQuery]);

  const handleSeleccionarInsumoMaestro = (item: InsumoMaestroSara) => {
    setInsumoMaestroSeleccionado(item);
    setManualCodigoCustom(item.codigo);
    setManualNombreCustom(item.nombre);
    setManualUnidadCustom(item.unidad);
    setManualCostoCustom(item.precio_sin_iva);
    setManualObs(
      `Sin stock en bodega de obra • Solicitado del Catálogo Maestro de Insumos GRUPO SARA (${item.codigo})`
    );
  };

  const currentRubro: RubroApuPlantilla | undefined = rubrosPlantillas.find(
    r => r.id === selectedRubroId
  );

  // Cargar materiales desde la receta APU seleccionada
  const handleCargarRecetaApu = () => {
    if (!currentRubro) return;
    const nuevosItems: ItemPedidoResidente[] = currentRubro.insumosReceta.map((ins, idx) => ({
      id: `cart-apu-${Date.now()}-${idx}`,
      insumoKardexId: ins.insumoKardexId,
      codigo: ins.codigo,
      nombre: ins.nombre,
      categoria: ins.categoria,
      unidad: ins.unidad,
      origenItem: 'APU',
      rubroApuCodigo: currentRubro.codigoRubro,
      rubroApuNombre: currentRubro.nombreRubro,
      cantidadPresupuestadaApu: ins.techoPresupuestadoTotal,
      cantidadDespachadaPrevia: ins.yaDespachadoAcumulado,
      cantidadSolicitada: ins.sugeridoParaPedido,
      cantidadDespachadaBodega: 0,
      cantidadFaltanteParaCompra: 0,
      costoUnitarioEstimadoUSD: ins.costoUnitarioRefUSD,
      observacionTecnica: `Explosión APU ${currentRubro.codigoRubro} (Incluye ${ins.desperdicioNecPct}% desperdicio NEC)`,
    }));

    setItemsCarrito(prev => {
      const codigosExistentes = new Set(prev.map(p => p.codigo));
      const filtrados = nuevosItems.filter(n => !codigosExistentes.has(n.codigo));
      return [...prev, ...filtrados];
    });
  };

  // Agregar ítem manual o del Catálogo Maestro de Insumos SARA
  const handleAgregarItemManual = () => {
    if (manualCantidad <= 0) return;

    const esDeCatalogoMaestro = manualCatalogoId === 'catalogo_maestro_sara';
    const esCustomNoCatalogado = manualCatalogoId === 'custom_nuevo';
    const refBodega = CATALOGO_BODEGA_LOCAL.find(c => c.id === manualCatalogoId);

    const nuevoItem: ItemPedidoResidente = {
      id: `cart-man-${Date.now()}`,
      insumoKardexId:
        esDeCatalogoMaestro || esCustomNoCatalogado
          ? `maestro_${Date.now()}`
          : refBodega?.id || 'custom',
      codigo: esDeCatalogoMaestro
        ? manualCodigoCustom || insumoMaestroSeleccionado?.codigo || 'SARA-INS-01'
        : esCustomNoCatalogado
          ? `INS-ESP-${Math.floor(100 + Math.random() * 899)}`
          : refBodega?.codigo || 'INS-BOD-01',
      nombre:
        esDeCatalogoMaestro || esCustomNoCatalogado
          ? manualNombreCustom.trim() || 'Insumo Catálogo Maestro SARA'
          : refBodega?.nombreLimpio || 'Insumo de Bodega',
      categoria:
        esDeCatalogoMaestro || esCustomNoCatalogado
          ? 'OTROS'
          : refBodega?.categoria || 'OTROS',
      unidad:
        esDeCatalogoMaestro || esCustomNoCatalogado
          ? manualUnidadCustom
          : refBodega?.unidad || 'Unidad',
      origenItem: esDeCatalogoMaestro ? 'CATALOGO_MAESTRO_SARA' : 'MANUAL',
      cantidadSolicitada: manualCantidad,
      cantidadDespachadaBodega: 0,
      cantidadFaltanteParaCompra: 0,
      costoUnitarioEstimadoUSD:
        esDeCatalogoMaestro || esCustomNoCatalogado
          ? manualCostoCustom
          : refBodega?.costoRef || 10,
      observacionTecnica: manualObs || 'Solicitud de obra',
      esDeCatalogoMaestroSara: esDeCatalogoMaestro,
    };

    setItemsCarrito(prev => [...prev, nuevoItem]);
  };

  const handleActualizarCantidadCarrito = (id: string, nuevaCant: number) => {
    setItemsCarrito(prev =>
      prev.map(it => (it.id === id ? { ...it, cantidadSolicitada: Math.max(1, nuevaCant) } : it))
    );
  };

  const handleEliminarDelCarrito = (id: string) => {
    setItemsCarrito(prev => prev.filter(it => it.id !== id));
  };

  const handleEnviarPedidoABodega = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemsCarrito.length === 0) return;

    const tieneApu = itemsCarrito.some(i => i.origenItem === 'APU');
    const tieneManual = itemsCarrito.some(i => i.origenItem !== 'APU');
    const origen =
      tieneApu && tieneManual
        ? 'MIXTO_APU_Y_MANUAL'
        : tieneApu
          ? 'APU_PRESUPUESTO'
          : 'MANUAL_EMERGENTE';

    const creado = ObraMaterialRequestService.crearPedidoResidente({
      proyectoId: proyectoNombre.toLowerCase().includes('cariamanga') ? 'proy-cariamanga' : 'proy-torre-loja',
      proyectoNombre,
      frenteObraEspecifico: frenteObra,
      faseApuId: currentRubro?.id,
      faseApuNombre: currentRubro ? `${currentRubro.codigoRubro} • ${currentRubro.nombreRubro}` : undefined,
      residenteNombre: user?.nombre || 'Ing. David Sarango (Residente de Obra)',
      residenteCargo: user?.tipo || 'Ingeniero Residente de Obra',
      origen,
      prioridad,
      justificacionGeneral: justificacion,
      items: itemsCarrito,
    });

    setItemsCarrito([]);
    cargarDatos();
    setBannerExito(
      `¡Pedido ${creado.numeroPedido} emitido y enviado en tiempo real a la Bandeja del Bodeguero! Los artículos que pertenecen al Catálogo Maestro SARA y no tienen stock físico en Bodega pasarán automáticamente a Orden de Compra en el Área de Compras.`
    );
  };

  const totalValorEstimadoCarrito = itemsCarrito.reduce(
    (acc, it) => acc + it.cantidadSolicitada * it.costoUnitarioEstimadoUSD,
    0
  );

  return (
    <div className="space-y-6">
      {/* ENCABEZADO HERO DEL RESIDENTE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                <HardHat size={18} />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                Ingeniería Residente • Abastecimiento de Frentes de Obra
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Pedidos de Materiales a Bodega (APU, Bodega Local & Catálogo Maestro SARA)
            </h1>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Solicita materiales cargando las cantidades desde el{' '}
              <strong className="text-amber-300">Presupuesto APU</strong>, seleccionando del{' '}
              <strong className="text-emerald-300">Stock de Bodega</strong> o buscando en el{' '}
              <strong className="text-sky-300">Catálogo Maestro de Insumos de GRUPO SARA</strong> cuando el artículo no exista en la bodega de la obra.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('kardex')}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Warehouse size={16} />
                <span>Ir a Bandeja del Bodeguero ({pedidosList.filter(p => p.estado === 'PENDIENTE_BODEGA').length})</span>
              </button>
            )}
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('procura')}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShoppingCart size={15} className="text-sky-400" />
                <span>Ver Área de Compras</span>
              </button>
            )}
          </div>
        </div>

        {/* Flujo de 3 Pasos Visual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-5 border-t border-slate-800/80 mt-5 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/70 flex items-start gap-3">
            <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black font-mono flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <span className="font-bold text-white block">Residente Pide (APU o Catálogo Maestro)</span>
              <span className="text-[11px] text-slate-400">
                Si un ítem no está en bodega, lo busca en el Catálogo Maestro de Insumos SARA.
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/70 flex items-start gap-3">
            <span className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 font-black font-mono flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <span className="font-bold text-white block">Bodeguero Verifica Stock y Despacha</span>
              <span className="text-[11px] text-slate-400">
                Emite el Vale de Salida por lo disponible en Kardex al costo CPP.
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/70 flex items-start gap-3">
            <span className="w-7 h-7 rounded-lg bg-sky-500 text-slate-950 font-black font-mono flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <span className="font-bold text-white block">Faltantes Pasan a Área de Compras</span>
              <span className="text-[11px] text-slate-400">
                El Bodeguero genera la Orden/Solicitud de Compra con el código del Catálogo Maestro.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BANNER DE CONFIRMACIÓN */}
      {bannerExito && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-4 text-emerald-900 dark:text-emerald-200 animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
              <CheckCircle2 size={18} />
            </span>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Pedido Transmitido a Bodega & Kardex
              </h4>
              <p className="text-xs mt-0.5">{bannerExito}</p>
            </div>
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('kardex')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
            >
              <span>Atender como Bodeguero</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}

      {/* FORMULARIO PRINCIPAL EN 2 COLUMNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUMNA IZQUIERDA (7 COL): SELECTOR DE MATERIALES (APU O MANUAL / CATÁLOGO MAESTRO) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                Paso 1 • Selección de Insumos de Obra
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ¿Cómo deseas armar el pedido de materiales?
              </h3>
            </div>

            {/* Conmutador APU vs Manual */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setModoIngreso('APU')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  modoIngreso === 'APU'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers size={14} />
                <span>Desde Presupuesto APU</span>
              </button>

              <button
                type="button"
                onClick={() => setModoIngreso('MANUAL')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  modoIngreso === 'MANUAL'
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Wrench size={14} />
                <span>Pedido Manual / Catálogo Maestro</span>
              </button>
            </div>
          </div>

          {/* MODO A: APOYADO EN EL MÓDULO APU DEL PRESUPUESTO */}
          {modoIngreso === 'APU' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Seleccionar Rubro del Presupuesto APU de la Obra:
                </label>
                <select
                  value={selectedRubroId}
                  onChange={e => setSelectedRubroId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                >
                  {rubrosPlantillas.map(r => (
                    <option key={r.id} value={r.id}>
                      [{r.codigoRubro}] {r.nombreRubro} ({r.cantidadTotalObra} {r.unidadRubro})
                    </option>
                  ))}
                </select>
              </div>

              {currentRubro && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">
                        {currentRubro.faseObra}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Explosión de Insumos Autorizados por el APU ({currentRubro.codigoRubro})
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={handleCargarRecetaApu}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Plus size={14} />
                      <span>Cargar Materiales del Rubro al Pedido</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 text-[10px] font-mono uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700">
                          <th className="py-2 px-3">Material (Receta APU)</th>
                          <th className="py-2 px-2 text-center">Techo APU</th>
                          <th className="py-2 px-2 text-center">Ya Despachado</th>
                          <th className="py-2 px-2 text-center text-emerald-600">Saldo Disp. APU</th>
                          <th className="py-2 px-2 text-center text-amber-600">Sugerido Hoy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                        {currentRubro.insumosReceta.map((ins, i) => {
                          const saldoApu = ins.techoPresupuestadoTotal - ins.yaDespachadoAcumulado;
                          return (
                            <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                              <td className="py-2.5 px-3 font-sans">
                                <div className="font-bold text-slate-900 dark:text-white">{ins.nombre}</div>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {ins.codigo} • Merma NEC: +{ins.desperdicioNecPct}%
                                </span>
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                {ins.techoPresupuestadoTotal.toLocaleString()} {ins.unidad}
                              </td>
                              <td className="py-2.5 px-2 text-center text-slate-500">
                                {ins.yaDespachadoAcumulado.toLocaleString()} {ins.unidad}
                              </td>
                              <td className="py-2.5 px-2 text-center font-bold text-emerald-600 dark:text-emerald-400">
                                {saldoApu.toLocaleString()} {ins.unidad}
                              </td>
                              <td className="py-2.5 px-2 text-center font-bold text-amber-600 dark:text-amber-400">
                                {ins.sugeridoParaPedido.toLocaleString()} {ins.unidad}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODO B: PEDIDO DESDE BODEGA O BÚSQUEDA EN CATÁLOGO MAESTRO DE INSUMOS GRUPO SARA */}
          {modoIngreso === 'MANUAL' && (
            <div className="p-4 rounded-2xl bg-sky-50/40 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/50 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 text-xs font-bold">
                  <Database size={15} />
                  <span>Selección en Bodega Local o Búsqueda en Catálogo Maestro de Insumos GRUPO SARA</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
                  Sincronizado con Catálogo Maestro APU
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                    1. Seleccionar Origen del Material:
                  </label>
                  <select
                    value={manualCatalogoId}
                    onChange={e => setManualCatalogoId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                  >
                    <optgroup label="🔎 NO ESTÁ EN BODEGA → BUSCAR EN CATÁLOGO MAESTRO GRUPO SARA">
                      <option value="catalogo_maestro_sara">
                        🌐 Buscar en el Catálogo Maestro de Insumos del Grupo SARA (Sin stock en bodega local)
                      </option>
                    </optgroup>
                    <optgroup label="📦 EXISTENCIAS ACTUALES EN BODEGA DE OBRA">
                      {CATALOGO_BODEGA_LOCAL.map(c => (
                        <option key={c.id} value={c.id}>
                          [{c.codigo}] {c.nombre} (CPP: ${c.costoRef})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="➕ OTRO ARTÍCULO NO CATALOGADO">
                      <option value="custom_nuevo">
                        ✍️ Escribir Material Especial Nuevo (No existe en Bodega ni en Catálogo Maestro)
                      </option>
                    </optgroup>
                  </select>
                </div>

                {/* BUSCADOR EN VIVO DEL CATÁLOGO MAESTRO DE INSUMOS DEL GRUPO SARA */}
                {manualCatalogoId === 'catalogo_maestro_sara' && (
                  <div className="sm:col-span-2 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-sky-300 dark:border-sky-800 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                        <Search size={14} />
                        <span>Buscar Artículo en el Catálogo Maestro de Insumos del Grupo SARA:</span>
                      </label>
                      {buscandoEnSupabase && (
                        <span className="text-[10px] font-mono text-sky-500 flex items-center gap-1">
                          <Loader2 size={12} className="animate-spin" /> Consultando BD Maestra...
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={busquedaMaestroQuery}
                        onChange={e => setBusquedaMaestroQuery(e.target.value)}
                        placeholder="Escribe ej: asiento baño briggs beige, inodoro, grifería FV, porcelanato, cable, sika..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                    </div>

                    {/* Lista de resultados del Catálogo Maestro */}
                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800">
                      {resultadosMaestro.length === 0 ? (
                        <div className="p-3 text-center text-slate-400 text-xs">
                          No se encontró coincidencia exacta en el Catálogo Maestro. Puedes editar el nombre abajo directamente.
                        </div>
                      ) : (
                        resultadosMaestro.map(item => {
                          const isSelected = insumoMaestroSeleccionado?.codigo === item.codigo;
                          return (
                            <button
                              key={item.id + item.codigo}
                              type="button"
                              onClick={() => handleSeleccionarInsumoMaestro(item)}
                              className={`w-full text-left p-2.5 transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                isSelected
                                  ? 'bg-sky-50 dark:bg-sky-950/60 border-l-4 border-sky-500'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-amber-400 font-mono text-[10px] font-bold">
                                    {item.codigo}
                                  </span>
                                  <span className="font-bold text-slate-900 dark:text-white truncate">
                                    {item.nombre}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                                  {item.categoria || 'CATÁLOGO MAESTRO SARA'} • {item.proveedorSugerido || 'Proveedor Oficial'}
                                </div>
                              </div>
                              <div className="text-right shrink-0 font-mono">
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                                  ${item.precio_sin_iva.toFixed(2)} USD
                                </span>
                                <span className="text-[10px] text-slate-400">por {item.unidad}</span>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {(manualCatalogoId === 'catalogo_maestro_sara' || manualCatalogoId === 'custom_nuevo') && (
                  <>
                    <div className="sm:col-span-2">
                      <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                        Nombre y Especificación Técnica del Material (Autorrellenado del Catálogo Maestro o Personalizado):
                      </label>
                      <input
                        type="text"
                        value={manualNombreCustom}
                        onChange={e => setManualNombreCustom(e.target.value)}
                        placeholder="Ej. Asiento para Inodoro / Baño Color Beige Modelo Elongado Marca Briggs"
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                        Unidad de Medida:
                      </label>
                      <input
                        type="text"
                        value={manualUnidadCustom}
                        onChange={e => setManualUnidadCustom(e.target.value)}
                        placeholder="Unidad / Saco / Rollo"
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                        Costo Unitario Catálogo Maestro ($):
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        value={manualCostoCustom}
                        onChange={e => setManualCostoCustom(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                    Cantidad Requerida en Obra:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={manualCantidad}
                    onChange={e => setManualCantidad(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-semibold block mb-1">
                    Motivo / Aplicación en Frente:
                  </label>
                  <input
                    type="text"
                    value={manualObs}
                    onChange={e => setManualObs(e.target.value)}
                    placeholder="Ej. Equipamiento de baños departamentos Nivel 6"
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAgregarItemManual}
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus size={14} />
                  <span>
                    {manualCatalogoId === 'catalogo_maestro_sara'
                      ? 'Agregar Artículo del Catálogo Maestro al Pedido'
                      : 'Agregar Ítem Manual al Pedido'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TABLA DE ÍTEMS EN EL CARRITO DEL PEDIDO ACTUAL */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ClipboardList size={14} className="text-amber-500" />
                <span>Detalle de Materiales a Solicitar al Bodeguero ({itemsCarrito.length} ítems)</span>
              </h4>
              {itemsCarrito.length > 0 && (
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  Valor Ref: ${totalValorEstimadoCarrito.toFixed(2)} USD
                </span>
              )}
            </div>

            {itemsCarrito.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-400">
                Haz clic en <strong>"Cargar Materiales del Rubro al Pedido"</strong> o busca un insumo en el <strong>Catálogo Maestro del Grupo SARA</strong> para armar tu requisición.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/70 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <th className="py-2 px-3">Origen</th>
                      <th className="py-2 px-3">Material Solicitado</th>
                      <th className="py-2 px-2 text-center">Cantidad a Pedir</th>
                      <th className="py-2 px-2 text-center">Unidad</th>
                      <th className="py-2 px-2 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {itemsCarrito.map(it => (
                      <tr key={it.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              it.origenItem === 'APU'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : it.origenItem === 'CATALOGO_MAESTRO_SARA'
                                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                  : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                            }`}
                          >
                            {it.origenItem === 'CATALOGO_MAESTRO_SARA' ? 'CATÁLOGO SARA' : it.origenItem}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-bold text-slate-900 dark:text-white">{it.nombre}</div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {it.codigo} • ${it.costoUnitarioEstimadoUSD.toFixed(2)}/{it.unidad}{' '}
                            {it.rubroApuCodigo ? `• ${it.rubroApuCodigo}` : ''}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            min="1"
                            value={it.cantidadSolicitada}
                            onChange={e => handleActualizarCantidadCarrito(it.id, Number(e.target.value))}
                            className="w-24 text-center p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                          />
                        </td>
                        <td className="py-2 px-2 text-center font-mono text-slate-500">{it.unidad}</td>
                        <td className="py-2 px-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleEliminarDelCarrito(it.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                            title="Quitar ítem"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA (5 COL): DATOS DE ENVÍO AL BODEGUERO */}
        <form
          onSubmit={handleEnviarPedidoABodega}
          className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between space-y-4"
        >
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
                Paso 2 • Destino y Firma Digital del Residente
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Emitir Pedido Oficial al Bodeguero
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                  Proyecto / Obra Destino:
                </label>
                <select
                  value={proyectoNombre}
                  onChange={e => setProyectoNombre(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                >
                  <option value="Torre SARA Loja (Pisos 4-8)">Torre SARA Loja (Pisos 4-8)</option>
                  <option value="Residencial Cariamanga Plaza">Residencial Cariamanga Plaza</option>
                  <option value="Edificio Residencial El Mirador">Edificio Residencial El Mirador</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                  Frente Específico de Obra / Ubicación:
                </label>
                <input
                  type="text"
                  value={frenteObra}
                  onChange={e => setFrenteObra(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                  Prioridad de Abastecimiento:
                </label>
                <select
                  value={prioridad}
                  onChange={e => setPrioridad(e.target.value as PrioridadPedido)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                >
                  <option value="NORMAL_PROGRAMADO">🟢 Normal Programado (Según Cronograma)</option>
                  <option value="URGENTE_24H">🟡 Urgente (Requerido en 24 Horas)</option>
                  <option value="EMERGENCIA_CRITICA">🔴 Emergencia Crítica (Frente Detenido / Fundición Hoy)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                  Justificación Técnica para Bodega y Compras:
                </label>
                <textarea
                  rows={3}
                  value={justificacion}
                  onChange={e => setJustificacion(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  <span>Regla Automática de Gobernanza Bodega → Compras:</span>
                </div>
                <p>
                  Al enviar este pedido, el <strong>Bodeguero</strong> verificará las existencias en el Kardex. Lo que esté en stock se despachará con <strong>Vale de Obra</strong>; y los artículos traídos del <strong>Catálogo Maestro de Insumos SARA</strong> que no estén en bodega generarán una <strong>Solicitud de Compra</strong> directa al Área de Compras.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={itemsCarrito.length === 0}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
              itemsCarrito.length > 0
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25 cursor-pointer'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send size={15} />
            <span>Enviar Pedido al Bodeguero ({itemsCarrito.length} Ítems)</span>
          </button>
        </form>
      </div>

      {/* HISTORIAL Y TRAZABILIDAD EN VIVO DE PEDIDOS DEL RESIDENTE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package size={16} className="text-amber-500" />
              <span>Mis Pedidos de Materiales Emitidos y Estado en Bodega / Compras</span>
            </h3>
            <p className="text-xs text-slate-400">
              Seguimiento en tiempo real desde que el Residente solicita hasta el Vale de Despacho o la Orden de Compra.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {pedidosList.length} Pedidos Registrados
          </span>
        </div>

        <div className="space-y-3">
          {pedidosList.map(ped => (
            <div
              key={ped.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 space-y-3"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-slate-900 text-amber-400">
                      {ped.numeroPedido}
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {ped.proyectoNombre}
                    </span>
                    <span className="text-xs text-slate-400">• {ped.frenteObraEspecifico}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        ped.prioridad === 'EMERGENCIA_CRITICA'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : ped.prioridad === 'URGENTE_24H'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {ped.prioridad.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    Solicitante: <strong className="text-slate-700 dark:text-slate-300">{ped.residenteNombre}</strong> • Fecha: {ped.fechaEmision} {ped.horaEmision} • Origen: {ped.origen.replace(/_/g, ' ')}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {ped.estado === 'PENDIENTE_BODEGA' && (
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 flex items-center gap-1.5">
                      <Clock size={13} />
                      <span>En Bandeja del Bodeguero (Pendiente Despacho)</span>
                    </span>
                  )}
                  {ped.estado === 'DESPACHADO_TOTAL_BODEGA' && (
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 size={13} />
                      <span>Despachado 100% desde Bodega ({ped.valesGeneradosRef.join(', ')})</span>
                    </span>
                  )}
                  {ped.estado === 'DESPACHADO_PARCIAL_Y_EN_COMPRAS' && (
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 flex items-center gap-1.5">
                      <ShoppingCart size={13} />
                      <span>Despacho Parcial + Saldo en Compras ({ped.solicitudCompraRef})</span>
                    </span>
                  )}
                  {ped.estado === 'ESCALADO_A_COMPRAS' && (
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 flex items-center gap-1.5">
                      <AlertTriangle size={13} />
                      <span>Sin Stock: Escalado a Compras ({ped.solicitudCompraRef})</span>
                    </span>
                  )}
                  {ped.estado === 'ORDEN_COMPRA_EMITIDA' && (
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300 flex items-center gap-1.5">
                      <CheckCircle2 size={13} />
                      <span>Orden de Compra Emitida ({ped.ordenCompraGeneradaRef})</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/70 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <th className="py-2 px-3">Código</th>
                      <th className="py-2 px-3">Material / Insumo</th>
                      <th className="py-2 px-2 text-center">Origen</th>
                      <th className="py-2 px-2 text-center">Cant. Solicitada</th>
                      <th className="py-2 px-2 text-center text-emerald-600">Despachado Bodega</th>
                      <th className="py-2 px-2 text-center text-rose-600">Escalado a Compras</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {ped.items.map(it => (
                      <tr key={it.id}>
                        <td className="py-2 px-3 text-slate-500">{it.codigo}</td>
                        <td className="py-2 px-3 font-sans font-semibold text-slate-900 dark:text-white">
                          {it.nombre}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800">
                            {it.origenItem === 'CATALOGO_MAESTRO_SARA' ? 'CATÁLOGO SARA' : it.origenItem}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center font-bold">
                          {it.cantidadSolicitada.toLocaleString()} {it.unidad}
                        </td>
                        <td className="py-2 px-2 text-center text-emerald-600 font-bold">
                          {ped.estado === 'PENDIENTE_BODEGA'
                            ? '-'
                            : `${it.cantidadDespachadaBodega.toLocaleString()} ${it.unidad}`}
                        </td>
                        <td className="py-2 px-2 text-center text-rose-600 font-bold">
                          {ped.estado === 'PENDIENTE_BODEGA'
                            ? '-'
                            : it.cantidadFaltanteParaCompra > 0
                              ? `${it.cantidadFaltanteParaCompra.toLocaleString()} ${it.unidad}`
                              : '0'}
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
    </div>
  );
}
