'use client';

import React from 'react';
import { 
  Building2, 
  Users, 
  Receipt, 
  Warehouse, 
  HardHat, 
  ArrowUpRight, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ShoppingCart, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  Truck,
  Sparkles
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';

interface ConstructoraDashboardViewProps {
  user: any;
  onNavigate: (tab: any) => void;
  proyectosCount?: number;
  bodegaTotal?: number;
}

export function ConstructoraDashboardView({ 
  user, 
  onNavigate,
  proyectosCount = 9,
  bodegaTotal = 8320
}: ConstructoraDashboardViewProps) {

  // Datos para el gráfico Donut de Estado de Proyectos con colores oficiales de SARA Constructora
  const projectStatusData = [
    { name: 'En Construcción', value: 7, color: '#f59e0b' }, // Ámbar Constructora
    { name: 'En Diseño', value: 2, color: '#fbbf24' },       // Oro
    { name: 'Finalizados', value: 0, color: '#0f172a' },     // Slate profundo
  ];

  // Actividad reciente de obras y personal (Idéntico a Imagen 1)
  const recentActivities = [
    {
      id: 'act-1',
      usuario: user?.nombre || 'Juan Fiel',
      rol: user?.tipo || 'Ingeniero Residente',
      accion: 'Ingresó a la Consola Técnica de Obra',
      fecha: 'Hoy',
      estado: 'activo',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    },
    {
      id: 'act-2',
      usuario: 'Ing. David Sarango M.',
      rol: 'Director de Fiscalización',
      accion: 'Certificó avance físico del 68.5% en Edificio El Mirador (Loja)',
      fecha: '18 oct',
      estado: 'activo',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    },
    {
      id: 'act-3',
      usuario: 'DALTON MEJIA',
      rol: 'Contador Tributario',
      accion: 'Concilió Factura SRI 001-001-000045892 (ADELCA) con tolerancia 0.42%',
      fecha: '16 oct',
      estado: 'activo',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    },
    {
      id: 'act-4',
      usuario: 'Bodega Central Loja',
      rol: 'Jefe de Almacén',
      accion: 'Emitió Vale de Distribución VALE-DIS-001 (1,200 kg acero a Cariamanga)',
      fecha: '15 oct',
      estado: 'activo',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    },
    {
      id: 'act-5',
      usuario: 'Maria Calva',
      rol: 'Cliente Titular',
      accion: 'Revisó bitácora fotográfica de cimentación en Las Acacias',
      fecha: '28 sept',
      estado: 'pendiente',
      badgeColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* ========================================================= */}
      {/* 1. FILA DE 4 TARJETAS KPI (Idéntico a Imagen 1)           */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Proyectos Activos */}
        <div 
          onClick={() => onNavigate('proyectos')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Proyectos Activos</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
            {proyectosCount}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-2">
            <ArrowUpRight size={14} />
            <span>En diseño o construcción</span>
          </p>
        </div>

        {/* Card 2: Clientes Registrados */}
        <div 
          onClick={() => onNavigate('directorio')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Clientes & Contratos</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
            12
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-2">
            <ArrowUpRight size={14} />
            <span>Total registrados en CRM</span>
          </p>
        </div>

        {/* Card 3: Conciliación SRI (Three-Way Match) */}
        <div 
          onClick={() => onNavigate('match')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Conciliación SRI (3-Way)</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Receipt size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
            99.4%
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 mt-2">
            <span>Tolerancia legal ≤ 1.0%</span>
          </p>
        </div>

        {/* Card 4: Stock & Bodega Central */}
        <div 
          onClick={() => onNavigate('kardex')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-500/50 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Custodia en Bodega</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Warehouse size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
            ${bodegaTotal.toLocaleString('es-EC')}
          </div>
          <p className="text-xs text-sky-600 dark:text-sky-400 font-medium flex items-center gap-1 mt-2">
            <span>6,400 kg en Matriz Loja</span>
          </p>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. FILA PRINCIPAL: ESTADO DE PROYECTOS + ACTIVIDAD RECIENTE */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Panel Izquierdo: Gráfico Donut de Estado de Proyectos (Idéntico a Imagen 1) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Estado de Proyectos
            </h3>
            <p className="text-xs text-slate-400">
              Distribución de obras civiles activas
            </p>
          </div>

          <div className="my-6 h-56 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: any) => [`${value} Obras`, name]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Indicador Central */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{proyectosCount}</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Obras</span>
            </div>
          </div>

          {/* Leyenda con Conteo (Idéntica a Imagen 1) */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            {projectStatusData.map((item, i) => (
              <div key={i} className="flex items-center justify-between font-mono">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-300 font-sans font-medium">{item.name}</span>
                </div>
                <strong className="text-slate-900 dark:text-white">{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Panel Derecho: Actividad Reciente (Idéntico a Imagen 1) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">
                  Actividad Reciente
                </h3>
                <p className="text-xs text-slate-400">
                  Operaciones de fiscalización, bodega y conciliación en tiempo real
                </p>
              </div>
              <button 
                onClick={() => onNavigate('proyectos')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Ver historial completo</span>
                <ExternalLink size={12} />
              </button>
            </div>

            {/* Tabla de Actividad (Idéntica a Imagen 1) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-mono uppercase text-[10px] tracking-wider bg-slate-50/50 dark:bg-slate-800/20">
                    <th className="py-3 px-6 font-bold">Usuario / Cliente</th>
                    <th className="py-3 px-6 font-bold">Acción</th>
                    <th className="py-3 px-6 font-bold">Fecha</th>
                    <th className="py-3 px-6 font-bold text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                  {recentActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        <div>{act.usuario}</div>
                        <span className="text-[10px] text-slate-400 font-mono block">{act.rol}</span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {act.accion}
                      </td>
                      <td className="py-3.5 px-6 text-slate-400 font-mono whitespace-nowrap">
                        {act.fecha}
                      </td>
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase tracking-wider ${act.badgeColor}`}>
                          {act.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Sincronización activa con PostgreSQL & Red Agéntica EDA</span>
            <span className="text-emerald-500 font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Ecosistema en Línea
            </span>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. ACCESOS DIRECTOS INTUITIVOS A LOS 5 MÓDULOS DEL HOLDING */}
      {/* ========================================================= */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 relative overflow-hidden shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold border border-amber-500/30 uppercase">
                Módulos Centrales
              </span>
              <span className="text-xs text-slate-400">Ecosistema Integrado para Constructora & Fiscalización</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Navegación Rápida por Área de Especialidad
            </h3>
          </div>
          <button 
            onClick={() => onNavigate('kardex')}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Warehouse size={14} />
            <span>Ir a Bodega & Kardex</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Módulo 1: Mis Proyectos */}
          <div 
            onClick={() => onNavigate('proyectos')}
            className="p-4 rounded-xl bg-slate-850/80 hover:bg-slate-800 border border-slate-700/60 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <HardHat size={18} />
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Mis Proyectos</h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">Avances de obra, curvas físicas y repositorio de planos.</p>
          </div>

          {/* Módulo 2: Bodega & Kardex */}
          <div 
            onClick={() => onNavigate('kardex')}
            className="p-4 rounded-xl bg-slate-850/80 hover:bg-slate-800 border border-slate-700/60 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Warehouse size={18} />
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">Bodega & Kardex</h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">Kardex multibodega, CPP dinámico y vales de despacho.</p>
          </div>

          {/* Módulo 3: Contabilidad SRI */}
          <div 
            onClick={() => onNavigate('match')}
            className="p-4 rounded-xl bg-slate-850/80 hover:bg-slate-800 border border-slate-700/60 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Receipt size={18} />
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors">Contabilidad SRI</h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">Three-Way Match (XML vs OC vs Bodega) y tolerancia legal.</p>
          </div>

          {/* Módulo 4: Compras & Insumos */}
          <div 
            onClick={() => onNavigate('compras')}
            className="p-4 rounded-xl bg-slate-850/80 hover:bg-slate-800 border border-slate-700/60 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <ShoppingCart size={18} />
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">Compras & Insumos</h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">Procuramiento predictivo y cotizador B2B Adelca/Holcim.</p>
          </div>

          {/* Módulo 5: Directorio & Recursos */}
          <div 
            onClick={() => onNavigate('directorio')}
            className="p-4 rounded-xl bg-slate-850/80 hover:bg-slate-800 border border-slate-700/60 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Users size={18} />
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors">Directorio & Recursos</h4>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">Cuadrillas operativas CICS/IESS, proveedores y fletes.</p>
          </div>

        </div>
      </div>

    </div>
  );
}
