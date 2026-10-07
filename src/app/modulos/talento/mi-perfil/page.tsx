'use client';
import React, { useState } from 'react';
import { MapPin, FileText, History, Crown, UploadCloud, Building2, Calendar, CheckCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import PaymentGatewayModal from '@/components/sara/PaymentGatewayModal';

export default function MiPerfilTalento() {
  const [activeTab, setActiveTab] = useState<'datos' | 'documentos' | 'planes' | 'historial'>('datos');
  
  // Estados para el mapa
  const [provincia, setProvincia] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [calle, setCalle] = useState('');

  // Estados de Pago
  const [selectedPlan, setSelectedPlan] = useState<'Basico' | 'Estandar' | 'VIP'>('VIP');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      {/* SIDEBAR */}
      <div className="w-full md:w-64 bg-slate-900 text-white min-h-screen p-6 flex flex-col shadow-xl z-10">
        <div className="mb-8 border-b border-slate-800 pb-6">
          <h2 className="text-2xl font-bold text-white mb-1">Mi Portal</h2>
          <p className="text-slate-400 text-sm">Panel del Profesional</p>
        </div>

        <nav className="space-y-2 flex-grow">
          <button onClick={() => setActiveTab('datos')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'datos' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <MapPin className="w-5 h-5 mr-3" /> Datos y Ubicación
          </button>
          <button onClick={() => setActiveTab('documentos')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'documentos' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <FileText className="w-5 h-5 mr-3" /> Mis Documentos
          </button>
          <button onClick={() => setActiveTab('planes')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'planes' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <Crown className="w-5 h-5 mr-3" /> Mi Plan Actual
          </button>
          <button onClick={() => setActiveTab('historial')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'historial' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <History className="w-5 h-5 mr-3" /> Historial Obras
          </button>
        </nav>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <Link href="/modulos/talento">
            <button className="w-full text-slate-400 hover:text-white text-sm font-medium transition-colors">
              Cerrar Sesión
            </button>
          </Link>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="max-w-5xl mx-auto">
          
          {/* TAB: DATOS Y MAPA */}
          {activeTab === 'datos' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold mb-6">Datos Personales y Geolocalización</h2>
              
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
                {/* Formulario */}
                <div className="p-8 w-full md:w-1/2 border-r border-slate-100">
                  <h3 className="text-lg font-bold mb-4">Ajuste de Coordenadas</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Provincia</label>
                      <input value={provincia} onChange={(e) => setProvincia(e.target.value)} type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500" placeholder="Ej. Pichincha" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad / Cantón</label>
                      <input value={ciudad} onChange={(e) => setCiudad(e.target.value)} type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500" placeholder="Ej. Quito" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Calle Principal y Secundaria</label>
                      <input value={calle} onChange={(e) => setCalle(e.target.value)} type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500" placeholder="Ej. Av. Amazonas y Naciones Unidas" />
                    </div>
                    <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg mt-4 hover:bg-slate-800 transition-colors">
                      Guardar Ubicación Exacta
                    </button>
                  </div>
                </div>

                {/* Mapa Interactivo Simulado */}
                <div className="w-full md:w-1/2 bg-slate-100 relative min-h-[300px]">
                  <div className="absolute inset-0 bg-[url('https://maps.wikimedia.org/osm-intl/14/4612/8256.png')] bg-cover bg-center opacity-80 mix-blend-multiply"></div>
                  {ciudad && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center animate-in zoom-in duration-300">
                      <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg shadow-blue-500/50 mb-1 animate-bounce">
                        <MapPin className="w-8 h-8" />
                      </div>
                      <div className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        Tu Radar: {calle || ciudad}
                      </div>
                    </div>
                  )}
                  {!ciudad && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="bg-white/90 backdrop-blur px-4 py-2 rounded-lg text-slate-500 font-medium text-sm shadow-sm">
                        Ingresa tu ciudad para fijar el pin en el mapa.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: DOCUMENTOS */}
          {activeTab === 'documentos' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold mb-6">Bóveda de Documentos</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">Hoja de Vida (CV)</h3>
                  <p className="text-sm text-slate-500 mb-6">Sube tu currículum actualizado en PDF.</p>
                  <label className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center transition-colors">
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm font-medium text-blue-600">Haz clic para buscar archivo</span>
                    <span className="text-xs text-slate-400 mt-1">PDF hasta 5MB</span>
                    <input type="file" className="hidden" accept=".pdf" />
                  </label>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">Cédula y Certificaciones</h3>
                  <p className="text-sm text-slate-500 mb-6">Valida tu identidad y títulos técnicos.</p>
                  <label className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-8 flex flex-col items-center justify-center transition-colors">
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm font-medium text-emerald-600">Subir Cédula o Certificados</span>
                    <span className="text-xs text-slate-400 mt-1">JPG, PNG o PDF</span>
                    <input type="file" className="hidden" multiple />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB: HISTORIAL */}
          {activeTab === 'historial' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold mb-6">Mi Historial de Contrataciones</h2>
              
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                      <th className="p-4 font-medium">Constructora / Empresa</th>
                      <th className="p-4 font-medium">Solicitud (Contingente)</th>
                      <th className="p-4 font-medium">Fecha</th>
                      <th className="p-4 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 flex items-center font-bold">
                        <div className="bg-indigo-100 p-2 rounded-lg mr-3"><Building2 className="w-5 h-5 text-indigo-600"/></div>
                        Constructora Uribe Schwarzkopf
                      </td>
                      <td className="p-4 text-slate-600">Dirección de Obra (Edificio QORNER)</td>
                      <td className="p-4 text-slate-500 flex items-center"><Calendar className="w-4 h-4 mr-2"/> 15/09/2026</td>
                      <td className="p-4"><span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">Contratado</span></td>
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 flex items-center font-bold">
                        <div className="bg-indigo-100 p-2 rounded-lg mr-3"><Building2 className="w-5 h-5 text-indigo-600"/></div>
                        Eseico S.A.
                      </td>
                      <td className="p-4 text-slate-600">Levantamiento Topográfico</td>
                      <td className="p-4 text-slate-500 flex items-center"><Calendar className="w-4 h-4 mr-2"/> 02/10/2026</td>
                      <td className="p-4"><span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">Finalizado</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-4 flex items-center font-bold">
                        <div className="bg-indigo-100 p-2 rounded-lg mr-3"><Building2 className="w-5 h-5 text-indigo-600"/></div>
                        Holcim Ecuador
                      </td>
                      <td className="p-4 text-slate-600">Asesoría de Mezclas Especiales</td>
                      <td className="p-4 text-slate-500 flex items-center"><Calendar className="w-4 h-4 mr-2"/> 06/10/2026</td>
                      <td className="p-4"><span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">En Negociación</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: PLANES */}
          {activeTab === 'planes' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold mb-6">Mi Plan de Visibilidad</h2>

              {paymentSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-emerald-900 mb-2">¡Plan {selectedPlan} Activo!</h3>
                  <p className="text-emerald-700">Tu perfil ahora goza de los beneficios y posicionamiento del plan seleccionado.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div onClick={() => setSelectedPlan('Basico')} className={`border-2 rounded-xl p-6 cursor-pointer bg-white transition-all ${selectedPlan === 'Basico' ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200'}`}>
                      <h3 className="text-lg font-bold mb-1">Plan Básico</h3>
                      <p className="text-slate-500 text-sm mb-4">Comisión: 10%</p>
                      <ul className="text-sm space-y-2 text-slate-600">
                        <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-blue-500" /> Radar estándar</li>
                      </ul>
                    </div>

                    <div onClick={() => setSelectedPlan('Estandar')} className={`border-2 rounded-xl p-6 cursor-pointer bg-white transition-all ${selectedPlan === 'Estandar' ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200'}`}>
                      <h3 className="text-lg font-bold mb-1">Plan Estándar</h3>
                      <p className="text-slate-500 text-sm mb-4">Comisión: 20%</p>
                      <ul className="text-sm space-y-2 text-slate-600">
                        <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-blue-500" /> Prioridad sobre básico</li>
                      </ul>
                    </div>

                    <div onClick={() => setSelectedPlan('VIP')} className={`border-2 rounded-xl p-6 cursor-pointer bg-white transition-all relative ${selectedPlan === 'VIP' ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200'}`}>
                      <h3 className="text-lg font-bold mb-1 flex items-center text-amber-900"><Crown className="w-5 h-5 mr-2" /> Plan VIP</h3>
                      <p className="text-amber-700 text-sm mb-4">Comisión: 50%</p>
                      <ul className="text-sm space-y-2 text-amber-800">
                        <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-amber-500" /> Top #1 absoluto</li>
                        <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-amber-500" /> Notificación a empresas</li>
                      </ul>
                    </div>
                  </div>

                  <button onClick={() => setShowPayment(true)} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl text-lg hover:bg-slate-800 transition-colors shadow-lg">
                    Actualizar a {selectedPlan} (Pagar Fee)
                  </button>
                </>
              )}
            </div>
          )}

        </div>
      </div>

      <PaymentGatewayModal 
        isOpen={showPayment} 
        onClose={() => setShowPayment(false)} 
        onSuccess={() => { setShowPayment(false); setPaymentSuccess(true); }} 
        planName={selectedPlan} 
      />
    </div>
  );
}
