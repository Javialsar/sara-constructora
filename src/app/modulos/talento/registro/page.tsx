'use client';
import React, { useState } from 'react';
import { Crown, CheckCircle, ArrowLeft, Loader2, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { registerTalentInDB } from '@/lib/services/talentoService';
import { TalentoPlanesService, TalentoPlan } from '@/lib/services/talentoPlanesService';
import { LISTA_PROVINCIAS_ECUADOR, getCantonesPorProvincia } from '@/lib/constants/ecuadorGeo';

export default function RegistroTalento() {
  const [planes] = useState<TalentoPlan[]>(() => TalentoPlanesService.getPlanes());
  const [selectedPlanId, setSelectedPlanId] = useState<string>('vip');
  const [successTx, setSuccessTx] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Ubicación por Provincias y Cantones oficiales
  const [provincia, setProvincia] = useState<string>('Pichincha');
  const [canton, setCanton] = useState<string>('Quito (Iñaquito / La Carolina)');

  const [formData, setFormData] = useState({
    nombre: '',
    rol: '',
    experiencia: 3,
    cedula: '',
    telefono: '',
    email: ''
  });

  const selectedPlan = planes.find(p => p.id === selectedPlanId) || planes[0];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.nombre.trim() || !formData.rol.trim()) {
      setValidationError('Por favor completa todos los campos obligatorios (Nombre y Rol/Especialidad).');
      return;
    }

    setIsSaving(true);
    const transactionId = `SARA-COLOCACION-${Date.now()}`;
    const ubicacionCompleta = `${canton}, ${provincia}`;

    try {
      await registerTalentInDB({
        nombre: formData.nombre,
        rol: formData.rol,
        experiencia: Number(formData.experiencia) || 0,
        ubicacion: ubicacionCompleta,
        plan: selectedPlan.id === 'vip' ? 'VIP' : selectedPlan.id === 'profesional' ? 'Estandar' : 'Basico',
        transactionId,
        feeAmount: 0 // $0 Costo Inicial
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('sara_candidato_plan', selectedPlan.id);
        window.dispatchEvent(new CustomEvent('sara_candidato_plan_changed', { detail: selectedPlan.id }));
      }

      setSuccessTx(transactionId);
    } catch (err: any) {
      setValidationError(`Error al registrar candidato: ${err?.message || 'Error desconocido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (successTx) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <CheckCircle className="w-20 h-20 text-emerald-500 mb-6" />
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">¡Inscripción Exitosa en SARA Talento!</h1>
        <div className="max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 text-left text-sm space-y-3">
          <p className="text-slate-600">
            Tu perfil ha sido registrado bajo el <strong>{selectedPlan.nombre}</strong> con prioridad <strong>{selectedPlan.prioridadMultiplicador}x</strong> en el Radar Geográfico de Construcción.
          </p>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
            🔒 <strong>Modelo Success-Fee:</strong> Tu costo de registro hoy es <strong>$0.00 USD</strong>. La comisión del {selectedPlan.porcentajePrimerMes}% se liquidará únicamente contra el primer mes de salario devengado en obra civil.
          </div>
          <p className="text-slate-500 font-mono text-xs">
            Registro N°: <strong className="text-slate-800">{successTx}</strong>
          </p>
        </div>
        <Link href="/modulos/talento">
          <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-md cursor-pointer">
            Volver al Radar Geográfico
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-800 relative">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-8 relative">
          <Link href="/modulos/talento" className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver
          </Link>
          <div className="text-center mt-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Modelo de Colocación Laboral • $0 Inicial</span>
            </div>
            <h1 className="text-3xl font-extrabold mb-2">Únete a la Red de SARA Talento</h1>
            <p className="text-slate-300 text-sm max-w-xl mx-auto">
              Postula sin pagar nada por adelantado. Accede a obras civiles, fiscalizaciones y licitaciones del SERCOP en todo el Ecuador.
            </p>
          </div>
        </div>

        <form onSubmit={handleRegister} className="p-8">
          {validationError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-sm font-semibold flex items-center justify-between">
              <span>⚠️ {validationError}</span>
              <button 
                type="button" 
                onClick={() => setValidationError(null)}
                className="text-xs text-rose-600 underline font-bold"
              >
                Cerrar
              </button>
            </div>
          )}

          {/* 1. Datos Personales */}
          <h2 className="text-xl font-bold border-b border-slate-100 pb-2 mb-6 text-slate-900">
            1. Datos Profesionales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo *</label>
              <input 
                type="text" 
                required
                value={formData.nombre}
                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none" 
                placeholder="Ej. Ing. Juan Pérez" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rol / Especialidad *</label>
              <input 
                type="text" 
                required
                value={formData.rol}
                onChange={e => setFormData({ ...formData, rol: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none" 
                placeholder="Ej. Ingeniero Civil / Maestro Mayor / Fierrero" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Años de Experiencia</label>
              <input 
                type="number" 
                min={0}
                max={50}
                value={formData.experiencia}
                onChange={e => setFormData({ ...formData, experiencia: parseInt(e.target.value) || 0 })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none" 
                placeholder="Ej. 5" 
              />
            </div>
            
            {/* Ubicación Oficial 24 Provincias & Cantones */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Provincia de Residencia ({LISTA_PROVINCIAS_ECUADOR.length} Provincias)
              </label>
              <select
                value={provincia}
                onChange={e => {
                  const p = e.target.value;
                  setProvincia(p);
                  const cantones = getCantonesPorProvincia(p);
                  setCanton(cantones[0] || 'Centro');
                }}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none bg-white text-sm"
              >
                {LISTA_PROVINCIAS_ECUADOR.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cantón / Sector Destino ({getCantonesPorProvincia(provincia).length} Cantones Disponibles)
              </label>
              <select
                value={canton}
                onChange={e => setCanton(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none bg-white text-sm"
              >
                {getCantonesPorProvincia(provincia).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Planes de Colocación (Success-Fee Model) */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              2. Elige tu Plan de Posicionamiento Laboral
            </h2>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300">
              $0.00 Inversión Inicial
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {planes.map((plan) => {
              const isSelected = plan.id === selectedPlanId;
              const isVip = plan.id === 'vip';
              const isProf = plan.id === 'profesional';

              return (
                <div 
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`border-2 rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between relative bg-white ${
                    isSelected
                      ? isVip
                        ? 'border-amber-400 bg-amber-50/30 ring-2 ring-amber-400/50 shadow-md'
                        : isProf
                        ? 'border-blue-600 bg-blue-50/30 ring-2 ring-blue-500/50 shadow-md'
                        : 'border-slate-500 bg-slate-50 ring-2 ring-slate-400/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isVip && (
                    <div className="absolute top-0 right-0 bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-bl-lg uppercase tracking-wider">
                      Recomendado
                    </div>
                  )}

                  <div>
                    <h3 className="text-base font-extrabold mb-1 text-slate-900 flex items-center gap-1.5">
                      {isVip && <Crown className="w-4 h-4 text-amber-500" />}
                      {isProf && <Sparkles className="w-4 h-4 text-blue-500" />}
                      {plan.nombre}
                    </h3>

                    <div className="my-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-slate-900 font-mono">
                          {plan.porcentajePrimerMes}%
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          $0 Inicial
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 block mt-0.5">del primer mes devengado</span>
                      <span className="text-[11px] font-bold text-purple-700 block mt-1">
                        {plan.prioridadMultiplicador}x Prioridad en Radar
                      </span>
                    </div>

                    <ul className="text-xs space-y-1.5 text-slate-600 mb-4">
                      {plan.beneficios.slice(0, 3).map((b, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={`py-2 rounded-xl text-center text-xs font-bold ${
                    isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isSelected ? '✓ Seleccionado' : 'Seleccionar'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botón de Envío */}
          <button 
            type="submit"
            disabled={isSaving}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl text-base transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            )}
            <span>
              {isSaving 
                ? 'Registrando en Supabase...' 
                : `Completar Registro con ${selectedPlan.nombre} ($0 Costo Inicial)`}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
