'use client';
import React, { useState } from 'react';
import { Crown, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import PaymentGatewayModal from '@/components/sara/PaymentGatewayModal';
import { registerTalentInDB } from '@/lib/services/talentoService';

export default function RegistroTalento() {
  const [selectedPlan, setSelectedPlan] = useState<'Basico' | 'Estandar' | 'VIP'>('Basico');
  const [showPayment, setShowPayment] = useState(false);
  const [successTx, setSuccessTx] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    rol: '',
    experiencia: 3,
    ubicacion: ''
  });

  const getPlanFee = () => {
    switch (selectedPlan) {
      case 'VIP': return 49.99;
      case 'Estandar': return 19.99;
      default: return 4.99;
    }
  };

  const handleInitiatePayment = () => {
    setValidationError(null);
    if (!formData.nombre.trim() || !formData.rol.trim() || !formData.ubicacion.trim()) {
      setValidationError('Por favor completa todos los campos obligatorios (Nombre, Especialidad y Ubicación).');
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    setShowPayment(false);
    setIsSaving(true);
    
    // Guardar inmediatamente en Supabase
    await registerTalentInDB({
      nombre: formData.nombre,
      rol: formData.rol,
      experiencia: Number(formData.experiencia) || 0,
      ubicacion: formData.ubicacion,
      plan: selectedPlan,
      transactionId,
      feeAmount: getPlanFee()
    });

    setIsSaving(false);
    setSuccessTx(transactionId);
  };

  if (successTx) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <CheckCircle className="w-20 h-20 text-emerald-500 mb-6" />
        <h1 className="text-3xl font-bold text-slate-800 mb-2">¡Pago y Registro Exitoso!</h1>
        <p className="text-slate-600 max-w-md mb-6">
          Tu perfil ha sido registrado y persistido en la base de datos Supabase con el Plan {selectedPlan}. 
          Transacción aprobada: <strong className="font-mono text-emerald-700">{successTx}</strong>
        </p>
        <Link href="/modulos/talento">
          <button className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors">
            Volver al Radar Geográfico
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-800 relative">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white p-8 relative">
          <Link href="/modulos/talento" className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver
          </Link>
          <div className="text-center mt-4">
            <h1 className="text-3xl font-bold mb-2">Únete a la Red de SARA Talento</h1>
            <p className="text-slate-300">Encuentra trabajo en las mejores obras del país con pagos garantizados vía Escrow.</p>
          </div>
        </div>

        <div className="p-8">
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
          <h2 className="text-xl font-bold border-b border-slate-100 pb-2 mb-6">1. Datos Profesionales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
              <input 
                type="text" 
                value={formData.nombre}
                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Ej. Juan Pérez" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rol / Especialidad</label>
              <input 
                type="text" 
                value={formData.rol}
                onChange={e => setFormData({ ...formData, rol: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Ej. Ingeniero Civil" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Años de Experiencia</label>
              <input 
                type="number" 
                value={formData.experiencia}
                onChange={e => setFormData({ ...formData, experiencia: parseInt(e.target.value) || 0 })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Ej. 5" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación (Ciudad, Sector)</label>
              <input 
                type="text" 
                value={formData.ubicacion}
                onChange={e => setFormData({ ...formData, ubicacion: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Ej. Quito, Cumbayá" 
              />
            </div>
          </div>

          <h2 className="text-xl font-bold border-b border-slate-100 pb-2 mb-6">2. Elige tu Plan de Posicionamiento</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            
            <div 
              onClick={() => setSelectedPlan('Basico')}
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${selectedPlan === 'Basico' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}
            >
              <h3 className="text-lg font-bold mb-1">Plan Básico</h3>
              <p className="text-slate-500 text-sm mb-4">Fee Verificación: $4.99<br/>Comisión: 10%</p>
              <ul className="text-sm space-y-2 text-slate-600">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-blue-500" /> Posicionamiento estándar</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-blue-500" /> Acceso a bolsa de empleo</li>
              </ul>
            </div>

            <div 
              onClick={() => setSelectedPlan('Estandar')}
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${selectedPlan === 'Estandar' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}
            >
              <h3 className="text-lg font-bold mb-1">Plan Estándar</h3>
              <p className="text-slate-500 text-sm mb-4">Fee Verificación: $19.99<br/>Comisión: 20%</p>
              <ul className="text-sm space-y-2 text-slate-600">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-blue-500" /> Prioridad en radar</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-blue-500" /> Recomendaciones semanales</li>
              </ul>
            </div>

            <div 
              onClick={() => setSelectedPlan('VIP')}
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all relative ${selectedPlan === 'VIP' ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-amber-300'}`}
            >
              <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase">Recomendado</div>
              <h3 className="text-lg font-bold mb-1 flex items-center text-amber-900"><Crown className="w-5 h-5 mr-2" /> Plan VIP</h3>
              <p className="text-amber-700 text-sm mb-4">Fee Verificación: $49.99<br/>Comisión: 50%</p>
              <ul className="text-sm space-y-2 text-amber-800">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-amber-500" /> Top #1 en búsquedas</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-amber-500" /> Badge Destacado</li>
              </ul>
            </div>

          </div>

          <button 
            onClick={handleInitiatePayment} 
            disabled={isSaving}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Proceder al Pago Seguro y Registro'}
          </button>
        </div>
      </div>

      <PaymentGatewayModal 
        isOpen={showPayment} 
        onClose={() => setShowPayment(false)} 
        onSuccess={handlePaymentSuccess} 
        planName={selectedPlan} 
      />
    </div>
  );
}
