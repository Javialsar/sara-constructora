'use client';
import React, { useState, useRef } from 'react';
import { Truck, MapPin, FileText, History, Wallet, Camera, ChevronRight, CheckCircle, Navigation, Package } from 'lucide-react';
import Link from 'next/link';

export default function MiPerfilFletes() {
  const [activeTab, setActiveTab] = useState<'vehiculo' | 'documentos' | 'billetera' | 'historial'>('vehiculo');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados
  const [balance, setBalance] = useState(0);
  const [rechargeAmount, setRechargeAmount] = useState(20);
  const [plan, setPlan] = useState<'VIP' | 'Estandar' | 'Basico'>('Estandar');

  const handleRecharge = () => {
    // Simula una redirección a Kushki/Stripe para recargar
    alert(`Redirigiendo a pasarela para recargar $${rechargeAmount}. Al confirmar, tu saldo aumentará.`);
    setBalance(balance + rechargeAmount);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-64 bg-slate-900 text-white min-h-screen p-6 flex flex-col shadow-xl z-10">
        <div className="mb-8 border-b border-slate-800 pb-6">
          <Link href="/modulos/fletes" className="flex items-center gap-2 font-black text-xl mb-6">
            <div className="bg-amber-500 p-1.5 rounded-lg">
              <Truck className="w-5 h-5 text-slate-900" />
            </div>
            SARA Fletes
          </Link>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Mi Cabina</h2>
          <p className="text-white font-bold">Carlos Mendoza</p>
          <p className="text-slate-400 text-xs font-mono">PBA-1234</p>
        </div>

        <nav className="space-y-2 flex-grow">
          <button onClick={() => setActiveTab('vehiculo')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'vehiculo' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}>
            <Truck className="w-5 h-5 mr-3" /> Vehículo y Radar
          </button>
          <button onClick={() => setActiveTab('documentos')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'documentos' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}>
            <FileText className="w-5 h-5 mr-3" /> Mis Documentos
          </button>
          <button onClick={() => setActiveTab('billetera')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'billetera' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}>
            <Wallet className="w-5 h-5 mr-3" /> Billetera y Plan
          </button>
          <button onClick={() => setActiveTab('historial')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'historial' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}>
            <History className="w-5 h-5 mr-3" /> Historial de Viajes
          </button>
        </nav>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <Link href="/modulos/fletes">
            <button className="w-full text-slate-400 hover:text-white text-sm font-medium transition-colors">
              Cerrar Sesión
            </button>
          </Link>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="max-w-5xl mx-auto">
          
          {/* TAB: VEHICULO */}
          {activeTab === 'vehiculo' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-black mb-6">Datos del Conductor y Radar</h2>
              
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                <div className="p-8 border-b border-slate-100">
                  
                  {/* FOTO DE PERFIL */}
                  <div className="flex flex-col md:flex-row items-center gap-6 mb-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <div 
                      className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden relative group cursor-pointer border-4 border-white shadow-lg"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {photoPreview ? (
                        <img src={photoPreview} alt="Perfil" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-slate-400 group-hover:opacity-0 transition-opacity" />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-bold text-center px-2">Subir Foto</span>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const reader = new FileReader();
                            reader.onload = (event) => setPhotoPreview(event.target?.result as string);
                            reader.readAsDataURL(e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Fotografía del Conductor</h4>
                      <p className="text-sm text-slate-500 mb-2">Para seguridad de los constructores, debes subir una foto clara de tu rostro.</p>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm bg-white border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 font-bold text-slate-700 transition-colors shadow-sm"
                      >
                        {photoPreview ? 'Cambiar Foto' : 'Seleccionar Archivo'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Chofer Registrado</label>
                      <input type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-amber-500" defaultValue="Carlos Mendoza" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Celular / WhatsApp</label>
                      <input type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-amber-500" defaultValue="0991234567" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Vehículo</label>
                      <select className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-amber-500 bg-white">
                        <option>Volqueta (12m3)</option>
                        <option>Camión (5 Ton)</option>
                        <option>Plataforma / Mula</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Placa (Letras y Números)</label>
                      <input type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-amber-500 font-mono uppercase" defaultValue="PBA-1234" />
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-slate-100">
                     <div className="flex items-center justify-between mb-4">
                       <div>
                         <h4 className="font-bold text-slate-800">Ubicación GPS Actual</h4>
                         <p className="text-sm text-slate-500">Transmite tu posición exacta para recibir viajes cercanos.</p>
                       </div>
                       <div className="flex items-center gap-2">
                         <span className="relative flex h-3 w-3">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                         </span>
                         <span className="text-sm font-bold text-emerald-600">Conectado y Transmitiendo</span>
                       </div>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">País</label>
                          <select className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 bg-slate-50">
                            <option>Ecuador</option>
                            <option>Colombia</option>
                            <option>Perú</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Provincia / Departamento</label>
                          <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500" placeholder="Ej. Pichincha" defaultValue="Pichincha" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ciudad / Sector</label>
                          <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500" placeholder="Ej. Quito Sur" defaultValue="Quito Sur" />
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BILLETERA Y COMISIONES */}
          {activeTab === 'billetera' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-black mb-6">Billetera de Recargas y Planes</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  <Wallet className="w-24 h-24 absolute -right-4 -bottom-4 opacity-10 text-white" />
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Saldo Prepago</p>
                  <h3 className={`text-5xl font-black mb-2 ${balance < 5 ? 'text-red-400' : 'text-emerald-400'}`}>${balance.toFixed(2)}</h3>
                  <p className="text-xs text-slate-400 leading-tight">De aquí se debitará el porcentaje de comisión cada vez que ganes un flete.</p>
                </div>

                <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center">
                  <h3 className="font-bold text-lg mb-4 text-slate-800">Recargar Saldo</h3>
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-3 font-bold text-slate-500">$</span>
                      <input 
                        type="number" 
                        value={rechargeAmount}
                        onChange={(e) => setRechargeAmount(Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 font-bold text-lg outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <button onClick={handleRecharge} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-black px-8 rounded-xl transition-colors shadow-md">
                      Pagar (Kushki)
                    </button>
                  </div>
                  {balance < 5 && <p className="text-sm text-red-500 font-bold mt-3">⚠️ Tu saldo es muy bajo. Recarga para seguir recibiendo notificaciones de viajes.</p>}
                </div>
              </div>

              <h3 className="text-xl font-bold mb-4">Selecciona tu Plan de Comisión</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div onClick={() => setPlan('Basico')} className={`cursor-pointer rounded-2xl p-6 border-2 transition-all ${plan === 'Basico' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-black text-lg text-slate-800">Básico</h4>
                    {plan === 'Basico' && <CheckCircle className="w-6 h-6 text-amber-500" />}
                  </div>
                  <div className="text-3xl font-black text-slate-800 mb-2">7% <span className="text-sm text-slate-500 font-medium">/ flete</span></div>
                  <ul className="text-sm text-slate-600 space-y-2 mt-4">
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 text-emerald-500 mr-2"/> Notificaciones estándar</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 text-emerald-500 mr-2"/> Mapa nacional</li>
                  </ul>
                </div>

                <div onClick={() => setPlan('Estandar')} className={`cursor-pointer rounded-2xl p-6 border-2 transition-all ${plan === 'Estandar' ? 'border-blue-500 bg-blue-50 relative overflow-hidden' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  {plan === 'Estandar' && <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">ACTIVO</div>}
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-black text-lg text-blue-900">Estándar</h4>
                    {plan === 'Estandar' && <CheckCircle className="w-6 h-6 text-blue-500" />}
                  </div>
                  <div className="text-3xl font-black text-slate-800 mb-2">15% <span className="text-sm text-slate-500 font-medium">/ flete</span></div>
                  <ul className="text-sm text-slate-600 space-y-2 mt-4">
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 text-emerald-500 mr-2"/> Prioridad de despacho</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 text-emerald-500 mr-2"/> Soporte telefónico</li>
                  </ul>
                </div>

                <div onClick={() => setPlan('VIP')} className={`cursor-pointer rounded-2xl p-6 border-2 transition-all ${plan === 'VIP' ? 'border-purple-500 bg-purple-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-black text-lg text-purple-900">VIP Premium</h4>
                    {plan === 'VIP' && <CheckCircle className="w-6 h-6 text-purple-500" />}
                  </div>
                  <div className="text-3xl font-black text-slate-800 mb-2">25% <span className="text-sm text-slate-500 font-medium">/ flete</span></div>
                  <ul className="text-sm text-slate-600 space-y-2 mt-4">
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 text-emerald-500 mr-2"/> Radar Exclusivo VIP</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 text-emerald-500 mr-2"/> Fletes industriales directos</li>
                  </ul>
                </div>
              </div>

            </div>
          )}

          {/* TAB: HISTORIAL */}
          {activeTab === 'historial' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h2 className="text-3xl font-black mb-6">Mis Viajes Realizados</h2>
               <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                       <th className="p-4 font-medium">Ruta y Fecha</th>
                       <th className="p-4 font-medium">Material</th>
                       <th className="p-4 font-medium">Tarifa Cobrada</th>
                       <th className="p-4 font-medium">Comisión SARA</th>
                     </tr>
                   </thead>
                   <tbody>
                     {[1,2,3].map((i) => (
                       <tr key={i} className="border-b border-slate-100">
                         <td className="p-4">
                           <p className="font-bold text-slate-800">Quito Sur ➔ Cumbayá</p>
                           <p className="text-xs text-slate-500">12 Oct 2026, 14:30</p>
                         </td>
                         <td className="p-4 text-sm font-medium text-slate-600 flex items-center"><Package className="w-4 h-4 mr-2"/> Cemento (8 Ton)</td>
                         <td className="p-4 font-black text-emerald-600">$45.00</td>
                         <td className="p-4 text-sm text-red-500 font-bold">- $6.75 (15%)</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
