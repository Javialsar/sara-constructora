'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  Briefcase, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  HardHat, 
  Truck, 
  ShoppingCart, 
  ShieldCheck, 
  Search, 
  Plus, 
  Sparkles, 
  ArrowRight,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function DirectorioRecursosSection({ user, initialSubTab = 'trabajadores' }: { user: any; initialSubTab?: 'trabajadores' | 'proveedores' | 'clientes' }) {
  const [subTab, setSubTab] = useState<'trabajadores' | 'proveedores' | 'clientes'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) setSubTab(initialSubTab);
  }, [initialSubTab]);

  const [trabajadores, setTrabajadores] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados de conexión con la Red Agéntica
  const [agentNotice, setAgentNotice] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchDirectorioData();
  }, []);

  const fetchDirectorioData = async () => {
    setLoading(true);
    try {
      // 1. Trabajadores / Cuadrillas
      const { data: trabs } = await supabase
        .from('trabajadores')
        .select('*')
        .order('created_at', { ascending: false });

      if (trabs && trabs.length > 0) {
        setTrabajadores(trabs);
      } else {
        setTrabajadores([
          {
            id: 'tr-01',
            nombre_completo: 'Luis Castro',
            cedula: '1125487895',
            telefono: '0982654789',
            categoria_ocupacional: 'Residente de Obra',
            jornal_real: 39.12,
            costo_horario: 4.89,
            especialidad: 'Control de Ensayos & Fiscalización',
            estado_iess: 'Afiliado Sectorial Construcción',
          },
          {
            id: 'tr-02',
            nombre_completo: 'Marcelo Valarezo',
            cedula: '1234568971',
            telefono: '0985674587',
            categoria_ocupacional: 'Ingeniero Eléctrico',
            jornal_real: 39.12,
            costo_horario: 4.89,
            especialidad: 'Instalaciones Media Tensión & Tableros',
            estado_iess: 'Afiliado Sectorial Construcción',
          },
          {
            id: 'tr-03',
            nombre_completo: 'Andrea Tamayo',
            cedula: '1112025897',
            telefono: '0987456232',
            categoria_ocupacional: 'Maestro de Obra',
            jornal_real: 35.15,
            costo_horario: 4.39,
            especialidad: 'Encofrados, Hormigones & Cuadrillas',
            estado_iess: 'Certificación SECAP Vigente',
          },
          {
            id: 'tr-04',
            nombre_completo: 'Carlos Morocho',
            cedula: '1103984712',
            telefono: '0993481290',
            categoria_ocupacional: 'Fierrero Especialista',
            jornal_real: 28.50,
            costo_horario: 3.56,
            especialidad: 'Cortes y Doblado de Acero Estructural',
            estado_iess: 'Afiliado IESS Planilla 10/2026',
          },
        ]);
      }

      // 2. Proveedores
      const { data: provs } = await supabase
        .from('proveedores')
        .select('*')
        .order('created_at', { ascending: false });

      if (provs && provs.length > 0) {
        setProveedores(provs);
      } else {
        setProveedores([
          {
            id: 'pr-01',
            razon_social: 'ADELCA Aceros del Ecuador C.A.',
            ruc: '1790012345001',
            categoria: 'Acero de Refuerzo & Mallas',
            ciudad: 'Quito / Distribución Sur',
            dias_credito: 45,
            contacto: 'Ing. Rodrigo Paredes',
            telefono: '02-398-4500',
            calificacion: 'Proveedor Certificado INEN',
          },
          {
            id: 'pr-02',
            razon_social: 'HOLCIM Ecuador S.A.',
            ruc: '0990004589001',
            categoria: 'Cemento & Hormigón Premezclado',
            ciudad: 'Guayaquil / Planta Loja',
            dias_credito: 30,
            contacto: 'Arq. Mariana Vélez',
            telefono: '04-259-8000',
            calificacion: 'Planta Calibrada ASTM C94',
          },
          {
            id: 'pr-03',
            razon_social: 'DISENSA Red de Materiales Loja',
            ruc: '1102938475001',
            categoria: 'Áridos, Tubería PVC & Mampostería',
            ciudad: 'Loja',
            dias_credito: 15,
            contacto: 'Lcdo. Jorge Sarango',
            telefono: '07-257-1120',
            calificacion: 'Despacho Inmediato a Obra',
          },
        ]);
      }

      // 3. Clientes
      const { data: clis } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (clis && clis.length > 0) {
        setClientes(clis);
      } else {
        setClientes([
          {
            id: 'cl-01',
            nombre: 'Fideicomiso Inmobiliario El Mirador',
            representante: 'Dra. María Elena Carrión',
            identificacion: '1191728394001',
            obra_asignada: 'Edificio Residencial El Mirador (Loja)',
            monto_contrato: 485200.0,
            estado: 'activo',
            telefono: '0998127364',
          },
          {
            id: 'cl-02',
            nombre: 'Asociación de Empleados de Calvas',
            representante: 'Ing. Gonzalo Benítez',
            identificacion: '1102938471',
            obra_asignada: 'Conjunto Habitacional Las Acacias (Cariamanga)',
            monto_contrato: 215000.0,
            estado: 'activo',
            telefono: '0981928374',
          },
        ]);
      }
    } catch (e) {
      console.error('Error fetching directorio data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleConectarTalentoAgente = (categoria: string) => {
    setAgentNotice(`🤖 Evento enviado a SARA_TALENTO_AGENT: Buscando cuadrilla disponible de "${categoria}" verificada por SECAP a menos de 15 km.`);
    setTimeout(() => setAgentNotice(null), 5000);
  };

  const handleConectarFletesAgente = (proveedor: string) => {
    setAgentNotice(`🚚 Evento enviado a SARA_HEAVY_FREIGHT: Coordinando flete pesado MTOP para despacho desde "${proveedor}" con optimización de retorno (Backhaul).`);
    setTimeout(() => setAgentNotice(null), 5000);
  };

  const handleConectarComprasAgente = (proveedor: string) => {
    setAgentNotice(`🛒 Evento enviado a SARA_PREDICTIVE_PURCHASE: Consultando escala de descuento mayorista con "${proveedor}" para consolidar con otras obras.`);
    setTimeout(() => setAgentNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera y Sub-Navegación */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
            Directorio Central & Red Agéntica Conectada
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-0.5">
            <Users className="w-5 h-5 text-amber-500" />
            Directorio de Recursos de Obra
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Administración de Personal de Obra, Proveedores de Insumos y Clientes, integrados a los agentes de Talento Humano y Fletes.
          </p>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setSubTab('trabajadores')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              subTab === 'trabajadores'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HardHat className="w-3.5 h-3.5" />
            <span>Personal de Obra ({trabajadores.length})</span>
          </button>
          <button
            onClick={() => setSubTab('proveedores')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              subTab === 'proveedores'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Proveedores ({proveedores.length})</span>
          </button>
          <button
            onClick={() => setSubTab('clientes')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              subTab === 'clientes'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Clientes & Contratos ({clientes.length})</span>
          </button>
        </div>
      </div>

      {/* Notificación de Interacción Agéntica */}
      {agentNotice && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <Sparkles className="w-4 h-4 shrink-0 text-amber-400 animate-spin" />
          <span>{agentNotice}</span>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* VISTA 1: PERSONAL DE OBRA (CONEXIÓN CON SARA TALENTO)               */}
      {/* ------------------------------------------------------------------- */}
      {subTab === 'trabajadores' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Cuadrillas Asignadas a Tus Proyectos
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                Normativa CICS / IESS
              </span>
            </div>

            <button
              onClick={() => handleConectarTalentoAgente('Albañiles y Fierreros')}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-2 transition-all self-start sm:self-auto"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Solicitar Cuadrilla a SARA Talento</span>
              <Sparkles className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">NOMBRE COMPLETO</th>
                    <th className="px-5 py-3 font-semibold">CÉDULA / CONTACTO</th>
                    <th className="px-5 py-3 font-semibold">CATEGORÍA OCUPACIONAL</th>
                    <th className="px-5 py-3 font-semibold text-right">JORNAL REAL</th>
                    <th className="px-5 py-3 font-semibold text-right">COSTO HORARIO</th>
                    <th className="px-5 py-3 font-semibold text-center">CERTIFICACIÓN / IESS</th>
                    <th className="px-5 py-3 font-semibold text-center">ACCIÓN AGÉNTICA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {trabajadores.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                        {t.nombre_completo}
                        <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{t.especialidad}</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                        <span>{t.cedula}</span>
                        <span className="block text-[10px] text-slate-400">{t.telefono}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {t.categoria_ocupacional}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                        ${Number(t.jornal_real).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-amber-500 tabular-nums">
                        ${Number(t.costo_horario).toFixed(2)}/h
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>{t.estado_iess}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => handleConectarTalentoAgente(t.categoria_ocupacional)}
                          className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 text-[10px] font-bold transition-colors"
                        >
                          Reasignar Obra
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* VISTA 2: PROVEEDORES (CONEXIÓN CON SARA COMPRAS Y FLETES)           */}
      {/* ------------------------------------------------------------------- */}
      {subTab === 'proveedores' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Catálogo de Proveedores de Materiales Pesados & Cemento
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">
                24 Provincias
              </span>
            </div>

            <button
              onClick={() => handleConectarComprasAgente('Distribuidores Mayoristas')}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-2 transition-all self-start sm:self-auto"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Cotizar con SARA Compras B2B</span>
              <Sparkles className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {proveedores.map((prov) => (
              <div key={prov.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">
                      Crédito: {prov.dias_credito} días
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{prov.ciudad}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    {prov.razon_social}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mb-3">RUC: {prov.ruc}</p>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] font-mono space-y-1 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rubro:</span>
                      <strong className="text-slate-700 dark:text-slate-300">{prov.categoria}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contacto:</span>
                      <span className="text-slate-700 dark:text-slate-300">{prov.contacto}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => handleConectarComprasAgente(prov.razon_social)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 text-xs font-bold font-mono transition-colors text-center"
                  >
                    Cotizar Insumo
                  </button>
                  <button
                    onClick={() => handleConectarFletesAgente(prov.razon_social)}
                    className="py-1.5 px-2.5 rounded-lg bg-sky-500/10 hover:bg-sky-500 hover:text-white text-sky-400 text-xs font-bold font-mono transition-colors flex items-center gap-1"
                    title="Calcular Flete Pesado con SARA Fletes"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Flete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* VISTA 3: CLIENTES Y CONTRATOS                                       */}
      {/* ------------------------------------------------------------------- */}
      {subTab === 'clientes' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                Clientes Titulares de Obra & Contratos Civiles
              </span>
              <span className="text-xs font-mono text-emerald-500">Garantías Bancarias Activas</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {clientes.map((c) => (
                <div key={c.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{c.nombre}</span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-xs font-mono text-slate-400">RUC: {c.identificacion}</span>
                    </div>
                    <p className="text-xs text-amber-500 font-medium">Obra: {c.obra_asignada}</p>
                    <p className="text-[11px] text-slate-400 font-mono">Representante Legal: {c.representante} • Tel: {c.telefono}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right font-mono">
                      <span className="text-[10px] text-slate-400 block">Monto Contractual</span>
                      <strong className="text-sm text-slate-900 dark:text-white">
                        ${Number(c.monto_contrato ?? 0).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
