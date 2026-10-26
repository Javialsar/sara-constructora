'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  KeyRound, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  User,
  Building2,
  DollarSign,
  Clock,
  Sparkles,
  X,
  FileCheck2
} from 'lucide-react';

export interface PlanFirma {
  id: string;
  codigo: string;
  nombre: string;
  tipo_persona: 'NATURAL' | 'JURIDICA';
  vigencia_anios: number;
  precio_usd: number;
  formato: '.p12 / Archivo PFX' | 'Token USB' | 'En la Nube';
  requisitos: string[];
  beneficios: string[];
  activo: boolean;
  es_mas_vendido: boolean;
  entidad_certificadora: string;
}

const PLANES_FIRMAS_INICIALES: PlanFirma[] = [
  {
    id: 'firma-nat-1',
    codigo: 'FIRMA_NATURAL_1A',
    nombre: 'Firma P. Natural (1 Año)',
    tipo_persona: 'NATURAL',
    vigencia_anios: 1,
    precio_usd: 18.00,
    formato: '.p12 / Archivo PFX',
    requisitos: ['Cédula de Identidad escaneada', 'Selfie de verificación biométrica', 'RUC activo (opcional)'],
    beneficios: [
      'Validez legal plena (Ley de Comercio Electrónico)',
      'Compatible con SRI, Quipux, SERCOP, Judicatura',
      'Emisión Express en 15 minutos',
      'Instalación directa en bóveda SARA con 1 clic'
    ],
    activo: true,
    es_mas_vendido: true,
    entidad_certificadora: 'Acreditada ARCOTEL'
  },
  {
    id: 'firma-nat-2',
    codigo: 'FIRMA_NATURAL_2A',
    nombre: 'Firma P. Natural (2 Años)',
    tipo_persona: 'NATURAL',
    vigencia_anios: 2,
    precio_usd: 30.00,
    formato: '.p12 / Archivo PFX',
    requisitos: ['Cédula de Identidad escaneada', 'Selfie de verificación biométrica'],
    beneficios: [
      '2 Años de tranquilidad sin renovar',
      'Ahorro del 20% vs pago anual',
      'Soporte de configuración asistida',
      'Bono de 30 comprobantes en SARA Facturación'
    ],
    activo: true,
    es_mas_vendido: false,
    entidad_certificadora: 'Acreditada ARCOTEL'
  },
  {
    id: 'firma-nat-3',
    codigo: 'FIRMA_NATURAL_3A',
    nombre: 'Firma P. Natural (3 Años)',
    tipo_persona: 'NATURAL',
    vigencia_anios: 3,
    precio_usd: 40.00,
    formato: '.p12 / Archivo PFX',
    requisitos: ['Cédula de Identidad escaneada', 'Selfie de verificación biométrica'],
    beneficios: [
      '3 Años de vigencia legal continua',
      'Costo por año más bajo del mercado ($13.33/año)',
      'Almacenamiento seguro en bóveda encriptada'
    ],
    activo: true,
    es_mas_vendido: false,
    entidad_certificadora: 'Acreditada ARCOTEL'
  },
  {
    id: 'firma-jur-1',
    codigo: 'FIRMA_JURIDICA_1A',
    nombre: 'Firma Representante Legal (1 Año)',
    tipo_persona: 'JURIDICA',
    vigencia_anios: 1,
    precio_usd: 22.00,
    formato: '.p12 / Archivo PFX',
    requisitos: [
      'Nombramiento vigente inscrito en Registro Mercantil',
      'RUC de la empresa',
      'Cédula del Representante Legal',
      'Autorización estatutaria'
    ],
    beneficios: [
      'Firma oficial para compañías S.A., Cía. Ltda., S.A.S.',
      'Apta para trámites en Supercías, SRI y SERCOP',
      'Revisión jurídica de nombramiento en 30 minutos'
    ],
    activo: true,
    es_mas_vendido: false,
    entidad_certificadora: 'Acreditada ARCOTEL'
  },
  {
    id: 'firma-jur-2',
    codigo: 'FIRMA_JURIDICA_2A',
    nombre: 'Firma Representante Legal (2 Años)',
    tipo_persona: 'JURIDICA',
    vigencia_anios: 2,
    precio_usd: 38.00,
    formato: '.p12 / Archivo PFX',
    requisitos: [
      'Nombramiento de Representante Legal inscrito',
      'RUC de la empresa',
      'Cédula de identidad'
    ],
    beneficios: [
      '2 Años de validez empresarial',
      'Prioridad en licitaciones públicas SERCOP',
      'Múltiples sucursales y puntos de emisión'
    ],
    activo: true,
    es_mas_vendido: false,
    entidad_certificadora: 'Acreditada ARCOTEL'
  }
];

export default function AdminFacturacionFirmasPlanesPage() {
  const [planes, setPlanes] = useState<PlanFirma[]>(PLANES_FIRMAS_INICIALES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanFirma | null>(null);
  const [formData, setFormData] = useState<Partial<PlanFirma>>({
    codigo: '',
    nombre: '',
    tipo_persona: 'NATURAL',
    vigencia_anios: 1,
    precio_usd: 18.00,
    formato: '.p12 / Archivo PFX',
    requisitos: [],
    beneficios: [],
    activo: true,
    es_mas_vendido: false,
    entidad_certificadora: 'Acreditada ARCOTEL'
  });
  const [nuevoBeneficio, setNuevoBeneficio] = useState('');
  const [nuevoRequisito, setNuevoRequisito] = useState('');
  const [guardadoExito, setGuardadoExito] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sara_admin_planes_firmas');
    if (saved) {
      try {
        setPlanes(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const persistirPlanes = (nuevos: PlanFirma[]) => {
    setPlanes(nuevos);
    localStorage.setItem('sara_admin_planes_firmas', JSON.stringify(nuevos));
    setGuardadoExito(true);
    setTimeout(() => setGuardadoExito(false), 3000);
  };

  const abrirModalCrear = () => {
    setEditingPlan(null);
    setFormData({
      codigo: `FIRMA_${Date.now().toString().slice(-4)}`,
      nombre: '',
      tipo_persona: 'NATURAL',
      vigencia_anios: 1,
      precio_usd: 18.00,
      formato: '.p12 / Archivo PFX',
      requisitos: ['Cédula de Identidad', 'Selfie biométrica'],
      beneficios: ['Validez legal plena SRI', 'Emisión Express en 15 minutos'],
      activo: true,
      es_mas_vendido: false,
      entidad_certificadora: 'Acreditada ARCOTEL'
    });
    setModalOpen(true);
  };

  const abrirModalEditar = (plan: PlanFirma) => {
    setEditingPlan(plan);
    setFormData({ ...plan });
    setModalOpen(true);
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.precio_usd) return;

    if (editingPlan) {
      const actualizados = planes.map(p => 
        p.id === editingPlan.id ? { ...p, ...formData } as PlanFirma : p
      );
      persistirPlanes(actualizados);
    } else {
      const nuevo: PlanFirma = {
        id: `firma-${Date.now()}`,
        codigo: formData.codigo || `FIRMA_${Date.now().toString().slice(-4)}`,
        nombre: formData.nombre || 'Nueva Tarifa',
        tipo_persona: formData.tipo_persona || 'NATURAL',
        vigencia_anios: Number(formData.vigencia_anios) || 1,
        precio_usd: Number(formData.precio_usd) || 18.00,
        formato: formData.formato || '.p12 / Archivo PFX',
        requisitos: formData.requisitos || [],
        beneficios: formData.beneficios || [],
        activo: formData.activo ?? true,
        es_mas_vendido: !!formData.es_mas_vendido,
        entidad_certificadora: formData.entidad_certificadora || 'Acreditada ARCOTEL'
      };
      persistirPlanes([...planes, nuevo]);
    }
    setModalOpen(false);
  };

  const handleEliminar = (id: string) => {
    if (confirm('¿Eliminar esta tarifa de firma digital?')) {
      const filtrados = planes.filter(p => p.id !== id);
      persistirPlanes(filtrados);
    }
  };

  const handleToggleActivo = (id: string) => {
    const actualizados = planes.map(p => 
      p.id === id ? { ...p, activo: !p.activo } : p
    );
    persistirPlanes(actualizados);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {guardadoExito && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5" />
          <span>Catálogo de tarifas de firma electrónica actualizado exitosamente</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase tracking-wide">
              Módulo SARA-FIRMAS DIGITALES
            </span>
            <span className="text-xs text-slate-500 font-medium">Acreditación ARCOTEL</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <KeyRound className="w-8 h-8 text-amber-600" />
            Tarifas y Planes de Firma Electrónica (.p12)
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Gestiona los precios oficiales de emisión de firmas para Personas Naturales y Representantes Legales con vigencias de 1 a 3 años.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/facturacion-electronica#firma-electronica"
            target="_blank"
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <span>Ver Asistente de Firma</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={abrirModalCrear}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Tarifa de Firma</span>
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Tarifas Registradas</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{planes.length}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">Persona Natural & Jurídica</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <KeyRound className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Tarifa Base 1 Año</div>
            <div className="text-3xl font-black text-amber-600 mt-1">$18.00</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Archivo .p12 estándar</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Tiempo de Emisión</div>
            <div className="text-3xl font-black text-blue-600 mt-1">15 min</div>
            <div className="text-[11px] text-blue-600 font-semibold mt-1">Validación biométrica online</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Compatibilidad</div>
            <div className="text-3xl font-black text-emerald-600 mt-1">100%</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">SRI, Quipux, FirmaEC</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid de Planes de Firmas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {planes.map((plan) => (
          <div 
            key={plan.id}
            className={`rounded-2xl border transition-all flex flex-col justify-between ${
              plan.activo ? 'bg-white border-slate-200 hover:shadow-lg hover:border-amber-400' : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start gap-2 mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase flex items-center gap-1 ${
                  plan.tipo_persona === 'NATURAL' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {plan.tipo_persona === 'NATURAL' ? <User className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                  {plan.tipo_persona === 'NATURAL' ? 'P. Natural' : 'P. Jurídica'}
                </span>
                <button
                  onClick={() => handleToggleActivo(plan.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    plan.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {plan.activo ? '● Activa' : '○ Pausada'}
                </button>
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-1">{plan.nombre}</h3>
              <p className="text-xs text-slate-500 mb-4">{plan.entidad_certificadora} · Formato {plan.formato}</p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 font-mono">
                    ${plan.precio_usd.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    / {plan.vigencia_anios} {plan.vigencia_anios === 1 ? 'Año' : 'Años'} vigencia
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Código: <strong className="font-mono text-slate-700">{plan.codigo}</strong>
                </div>
              </div>

              {/* Requisitos */}
              <div className="mb-4">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Requisitos del solicitante:</div>
                <div className="space-y-1">
                  {plan.requisitos.map((r, idx) => (
                    <div key={idx} className="text-xs text-slate-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Beneficios */}
              <div className="space-y-1.5 text-xs text-slate-600">
                {plan.beneficios.map((b, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-tight">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">ID: {plan.id}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => abrirModalEditar(plan)}
                  className="p-2 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-white transition-colors"
                  title="Editar Tarifa"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEliminar(plan.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
                  title="Eliminar Tarifa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Crear / Editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {editingPlan ? 'Editar Tarifa de Firma Digital' : 'Crear Nueva Tarifa de Firma'}
                  </h3>
                  <p className="text-xs text-slate-500">Configura vigencia, requisitos ARCOTEL y costo para el cliente</p>
                </div>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardar} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre de la Tarifa *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre || ''}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej. Firma Natural 2 Años"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Código Único *</label>
                  <input
                    type="text"
                    required
                    value={formData.codigo || ''}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                    placeholder="FIRMA_NATURAL_2A"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tipo de Titular</label>
                  <select
                    value={formData.tipo_persona || 'NATURAL'}
                    onChange={(e) => setFormData({ ...formData, tipo_persona: e.target.value as any })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="NATURAL">Persona Natural</option>
                    <option value="JURIDICA">Persona Jurídica (Empresa)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vigencia (Años)</label>
                  <select
                    value={formData.vigencia_anios || 1}
                    onChange={(e) => setFormData({ ...formData, vigencia_anios: parseInt(e.target.value) })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value={1}>1 Año</option>
                    <option value={2}>2 Años</option>
                    <option value={3}>3 Años</option>
                    <option value={5}>5 Años</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Precio (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="5.00"
                      required
                      value={formData.precio_usd || ''}
                      onChange={(e) => setFormData({ ...formData, precio_usd: parseFloat(e.target.value) })}
                      className="w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Beneficios */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Beneficios del Certificado</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={nuevoBeneficio}
                    onChange={(e) => setNuevoBeneficio(e.target.value)}
                    placeholder="Ej. Aceptado en Quipux y SERCOP"
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!nuevoBeneficio.trim()) return;
                      setFormData(prev => ({ ...prev, beneficios: [...(prev.beneficios || []), nuevoBeneficio.trim()] }));
                      setNuevoBeneficio('');
                    }}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                  >
                    Agregar
                  </button>
                </div>
                <div className="space-y-1 max-h-28 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {(formData.beneficios || []).map((b, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-white px-2.5 py-1 rounded border border-slate-200">
                      <span>{b}</span>
                      <button 
                        type="button" 
                        onClick={() => setFormData(p => ({ ...p, beneficios: (p.beneficios || []).filter((_, i) => i !== idx) }))}
                        className="text-rose-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md"
                >
                  {editingPlan ? 'Guardar Cambios' : 'Crear Tarifa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}