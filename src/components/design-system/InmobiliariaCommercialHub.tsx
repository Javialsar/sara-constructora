'use client';

import * as React from 'react';
import { 
  Home, LayoutGrid, List, Map, DollarSign, Calculator, 
  TrendingUp, CheckCircle2, ChevronRight, UserCheck, 
  Bed, Bath, Maximize2, ShieldCheck, PhoneCall, Sparkles,
  Users, Table, Navigation
} from 'lucide-react';
import { SyncBadge } from './SyncBadge';
import { AmortizationTableModal } from './AmortizationTableModal';
import { LeadFunnelKanban } from './LeadFunnelKanban';
import { cn } from '@/lib/utils';

export interface PropertyItem {
  id: string;
  titulo: string;
  sector: string;
  tipo: 'departamento' | 'casa' | 'suite';
  precio: number;
  areaM2: number;
  dormitorios: number;
  banos: number;
  estado: 'disponible' | 'reservado' | 'vendido';
  imagen: string;
  biessAplica: boolean;
}

const PROPERTIES: PropertyItem[] = [
  {
    id: 'prop-1',
    titulo: 'Penthouse Mirador Panorámico',
    sector: 'Cumbayá, Quito',
    tipo: 'departamento',
    precio: 245000,
    areaM2: 172,
    dormitorios: 3,
    banos: 3,
    estado: 'disponible',
    imagen: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80',
    biessAplica: true,
  },
  {
    id: 'prop-2',
    titulo: 'Suite Ejecutiva Plaza Corporativa',
    sector: 'La Carolina, Quito',
    tipo: 'suite',
    precio: 98000,
    areaM2: 64,
    dormitorios: 1,
    banos: 1.5,
    estado: 'reservado',
    imagen: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80',
    biessAplica: true,
  },
  {
    id: 'prop-3',
    titulo: 'Villa Campestre Los Algarrobos',
    sector: 'Tumbaco, Pichincha',
    tipo: 'casa',
    precio: 340000,
    areaM2: 280,
    dormitorios: 4,
    banos: 4.5,
    estado: 'disponible',
    imagen: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
    biessAplica: false,
  }
];

export function InmobiliariaCommercialHub() {
  const [viewType, setViewType] = React.useState<'grid' | 'list' | 'map' | 'funnel'>('grid');
  const [selectedProperty, setSelectedProperty] = React.useState<PropertyItem>(PROPERTIES[0]);
  const [hoveredProperty, setHoveredProperty] = React.useState<PropertyItem | null>(null);

  // Mortgage Calculator State
  const [downPaymentPct, setDownPaymentPct] = React.useState<number>(20);
  const [loanTermYears, setLoanTermYears] = React.useState<number>(25);
  const [loanType, setLoanType] = React.useState<'biess' | 'banca'>('biess');

  // Amortization Table Modal Toggle (10/10)
  const [showAmortizationModal, setShowAmortizationModal] = React.useState(false);

  // Interactive Financing Simulation
  const calculation = React.useMemo(() => {
    const price = selectedProperty.precio;
    const downPayment = (price * downPaymentPct) / 100;
    const loanAmount = price - downPayment;
    
    // BIESS Premier 2.99% / VIS-VIP 4.99% / Banca Privada 8.85%
    const annualRate = loanType === 'biess' ? 0.0499 : 0.0885;
    const monthlyRate = annualRate / 12;
    const totalMonths = loanTermYears * 12;
    
    const monthlyPayment = (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) / 
      (Math.pow(1 + monthlyRate, totalMonths) - 1);

    return {
      downPayment,
      loanAmount,
      monthlyPayment,
      annualRate: (annualRate * 100).toFixed(2),
      annualRateNum: Number((annualRate * 100).toFixed(2))
    };
  }, [selectedProperty, downPaymentPct, loanTermYears, loanType]);

  return (
    <div className="w-full bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-sans">
      {/* Header Fijo con Módulo & Status Sync */}
      <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">SARA Inmobiliaria • Portfolio & Leads</h2>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                IVS-2025
              </span>
            </div>
            <p className="text-xs text-slate-400">Tasación econométrica, simulación hipotecaria y funnel comercial</p>
          </div>
        </div>

        {/* View Switcher (Grid / List / Map / Funnel CRM) */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-0.5 rounded-xl border border-slate-800 flex items-center">
            <button
              onClick={() => setViewType('grid')}
              aria-label="Vista en cuadrícula"
              className={cn(
                "p-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1",
                viewType === 'grid' ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Cards</span>
            </button>
            <button
              onClick={() => setViewType('list')}
              aria-label="Vista en lista densa"
              className={cn(
                "p-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1",
                viewType === 'list' ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              )}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Lista</span>
            </button>
            <button
              onClick={() => setViewType('map')}
              aria-label="Vista en mapa"
              className={cn(
                "p-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1",
                viewType === 'map' ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              )}
            >
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Isocronas</span>
            </button>
            <button
              onClick={() => setViewType('funnel')}
              aria-label="Pipeline Comercial Leads"
              className={cn(
                "p-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1",
                viewType === 'funnel' ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              )}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Funnel</span>
            </button>
          </div>

          <SyncBadge status="synced" lastSyncedAt="now" />
        </div>
      </div>

      {/* Hero Metrics (Regla de Top 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-800/60 border-b border-slate-800">
        <div className="p-4 bg-slate-900/60">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Valor Total Cartera Activa</span>
          <div className="text-xl font-bold font-mono text-white mt-1">$683,000</div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3" /> +12.4% Plusvalía Anual Proyectada
          </span>
        </div>

        <div className="p-4 bg-slate-900/60">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Tasa de Absorción Comercial</span>
          <div className="text-xl font-bold font-mono text-teal-400 mt-1">1.8 Meses / Unidad</div>
          <span className="text-[11px] text-slate-400 mt-0.5">Velocidad óptima vs media de mercado (3.4m)</span>
        </div>

        <div className="p-4 bg-slate-900/60">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Leads Precalificados BIESS</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400 inline" />
            18 Prospectos VIP
          </div>
          <span className="text-[11px] text-emerald-400/80 mt-0.5">Capacidad crediticia comprobada $\ge \$1,800/mes</span>
        </div>
      </div>

      {/* Main Layout: Property Catalog + Modular Simulator Panel */}
      {viewType === 'funnel' ? (
        <div className="p-6">
          <LeadFunnelKanban />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row min-h-[500px]">
          {/* Left Column: Properties Grid or List or Map */}
          <div className="flex-1 p-6 border-r border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Catálogo Inmobiliario ({PROPERTIES.length})
              </h3>
              <span className="text-xs text-slate-400">Seleccione un activo para simular amortización</span>
            </div>

            {viewType === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PROPERTIES.map((prop) => {
                  const isSelected = prop.id === selectedProperty.id;

                  return (
                    <div
                      key={prop.id}
                      onClick={() => setSelectedProperty(prop)}
                      onMouseEnter={() => setHoveredProperty(prop)}
                      onMouseLeave={() => setHoveredProperty(null)}
                      className={cn(
                        "group rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 bg-slate-900/40 relative",
                        isSelected 
                          ? "border-emerald-500 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500" 
                          : "border-slate-800 hover:border-slate-700"
                      )}
                    >
                      {/* Property Image with Badge */}
                      <div className="h-40 w-full relative overflow-hidden bg-slate-800">
                        <img 
                          src={prop.imagen} 
                          alt={prop.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        <div className="absolute top-2 left-2 flex gap-1">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider backdrop-blur-md",
                            prop.estado === 'disponible' ? "bg-emerald-500/80 text-white" : "bg-amber-500/80 text-slate-950"
                          )}>
                            {prop.estado}
                          </span>
                          {prop.biessAplica && (
                            <span className="bg-blue-600/90 text-white px-1.5 py-0.5 rounded text-[10px] font-mono font-bold backdrop-blur-md">
                              BIESS 4.99%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-white line-clamp-1">{prop.titulo}</h4>
                            <p className="text-xs text-slate-400">{prop.sector}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-mono font-extrabold text-emerald-400">
                              ${prop.precio.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Technical Specs row */}
                        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                          <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5 text-slate-500" /> {prop.areaM2} m²</span>
                          <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5 text-slate-500" /> {prop.dormitorios} D</span>
                          <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-slate-500" /> {prop.banos} B</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {viewType === 'list' && (
              <div className="space-y-3">
                {PROPERTIES.map(prop => (
                  <div
                    key={prop.id}
                    onClick={() => setSelectedProperty(prop)}
                    className={cn(
                      "p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors",
                      prop.id === selectedProperty.id ? "bg-emerald-950/20 border-emerald-500" : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                    )}
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white">{prop.titulo}</h4>
                      <span className="text-xs text-slate-400">{prop.sector} • {prop.areaM2} m²</span>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-sm font-bold text-emerald-400">${prop.precio.toLocaleString()}</div>
                      <span className="text-[10px] text-slate-500 uppercase">{prop.estado}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewType === 'map' && (
              <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 text-center space-y-4">
                <Navigation className="w-8 h-8 text-emerald-400 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-white">Análisis de Isocronas de Movilidad y Plusvalía</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    Polígonos concéntricos de acceso en vehículo desde {selectedProperty.sector}:
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto font-mono text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-emerald-500/40">
                    <span className="text-emerald-400 font-bold block">10 Minutos</span>
                    <span className="text-[10px] text-slate-400">Hospitales y Colegios</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-teal-500/40">
                    <span className="text-teal-400 font-bold block">20 Minutos</span>
                    <span className="text-[10px] text-slate-400">Centros Financieros</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-blue-500/40">
                    <span className="text-blue-400 font-bold block">30 Minutos</span>
                    <span className="text-[10px] text-slate-400">Aeropuerto Tababela</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Modular Property Detail & Financial Calculator */}
          <div className="w-full lg:w-5/12 bg-slate-900/40 p-6 flex flex-col justify-between">
            <div>
              <div className="pb-4 border-b border-slate-800">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block">
                  Simulador Financiero & Precalificación
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {selectedProperty.titulo}
                </h3>
                <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
                  ${selectedProperty.precio.toLocaleString()}
                </div>
              </div>

              {/* Sliders and Loan Selector */}
              <div className="mt-5 space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                    <span>Tipo de Crédito</span>
                    <span className="font-mono text-emerald-400 font-bold">{calculation.annualRate}% Tasa Anual</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setLoanType('biess')}
                      className={cn(
                        "py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all text-center",
                        loanType === 'biess' ? "bg-emerald-600 text-white border-emerald-500" : "bg-slate-800 text-slate-400 border-slate-700"
                      )}
                    >
                      BIESS Premier (4.99%)
                    </button>
                    <button
                      onClick={() => setLoanType('banca')}
                      className={cn(
                        "py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all text-center",
                        loanType === 'banca' ? "bg-emerald-600 text-white border-emerald-500" : "bg-slate-800 text-slate-400 border-slate-700"
                      )}
                    >
                      Banca Privada (8.85%)
                    </button>
                  </div>
                </div>

                {/* Down Payment Slider */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Entrada Inicial ({downPaymentPct}%)</span>
                    <span className="font-mono text-white font-bold">${calculation.downPayment.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={downPaymentPct}
                    onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Loan Term Slider */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Plazo de Financiamiento</span>
                    <span className="font-mono text-white font-bold">{loanTermYears} Años</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="30"
                    step="5"
                    value={loanTermYears}
                    onChange={(e) => setLoanTermYears(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Monthly Payment Hero Box */}
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-center mt-4">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Cuota Mensual Estimada</span>
                  <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">
                    ${Math.round(calculation.monthlyPayment).toLocaleString()}
                    <span className="text-xs text-slate-400 font-normal"> /mes</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Financiamiento neto: ${calculation.loanAmount.toLocaleString()} a {loanTermYears * 12} meses
                  </span>

                  {/* Trigger Modal Tabla Amortización (10/10) */}
                  <button
                    type="button"
                    onClick={() => setShowAmortizationModal(true)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>Ver Tabla de Amortización Francesa Detallada</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Direct CTA */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Contactar Asesor & Agendar Visita</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tabla de Amortización Francesa */}
      <AmortizationTableModal
        isOpen={showAmortizationModal}
        onClose={() => setShowAmortizationModal(false)}
        loanAmount={calculation.loanAmount}
        annualRatePct={calculation.annualRateNum}
        termYears={loanTermYears}
        propertyTitle={selectedProperty.titulo}
      />
    </div>
  );
}
