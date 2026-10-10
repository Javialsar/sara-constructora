
'use client';
import React, { useState, useRef } from 'react';
import { Truck, MapPin, FileText, History, Wallet, Camera, ChevronRight, CheckCircle, Navigation, Package, Download, CreditCard, QrCode, Building, UploadCloud, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function MiPerfilFletes() {
  const [activeTab, setActiveTab] = useState<'vehiculo' | 'documentos' | 'billetera' | 'historial'>('vehiculo');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados Billetera
  const [balance, setBalance] = useState(0);
  const [rechargeAmount, setRechargeAmount] = useState(20);
  const [plan, setPlan] = useState<'VIP' | 'Estandar' | 'Basico'>('Estandar');

  // Estados Ubicacion
  const [driverCountry, setDriverCountry] = useState('Ecuador');
  const [driverProvince, setDriverProvince] = useState('Pichincha');
  const [driverCity, setDriverCity] = useState('Quito Sur');

  const handleRecharge = () => {
    alert(`Redirigiendo a pasarela (Tarjetas, Transferencia, QR) para recargar $${rechargeAmount}. Al confirmar, tu saldo aumentará.`);
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
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Mi Cabina</p>
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
        <div className="max-w-7xl mx-auto">
          
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
                        <option>Camionetas Doble Cabina</option>
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
                         <p className="text-sm text-slate-500">Transmite tu posición exacta para recibir viajes cercanos y mejorar cobertura.</p>
                       </div>
                       <div className="flex items-center gap-2">
                         <span className="relative flex h-3 w-3">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                         </span>
                         <span className="text-sm font-bold text-emerald-600">Conectado y Transmitiendo</span>
                       </div>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">País</label>
                          <select value={driverCountry} onChange={e => setDriverCountry(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 bg-slate-50">
                            <option>Ecuador</option>
                            <option>Colombia</option>
                            <option>Perú</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Provincia / Departamento</label>
                          <input type="text" value={driverProvince} onChange={e => setDriverProvince(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500" placeholder="Ej. Pichincha" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ciudad / Sector</label>
                          <input type="text" value={driverCity} onChange={e => setDriverCity(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500" placeholder="Ej. Quito Sur" />
                        </div>
                     </div>

                     {/* GEOREFERENCIA MAPA */}
                     <div className="w-full h-64 rounded-xl border border-slate-200 overflow-hidden relative">
                        <iframe 
                          width="100%" 
                          height="100%" 
                          frameBorder="0" 
                          scrolling="no" 
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(driverCountry + ' ' + driverProvince + ' ' + driverCity)}&t=m&z=13&output=embed`}
                        ></iframe>
                     </div>

                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DOCUMENTOS */}
          {activeTab === 'documentos' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-black mb-6">Validación de Documentos</h2>
              
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl mb-6">
                <p className="text-amber-800 text-sm font-bold">Importante: Para activar tu perfil y empezar a recibir notificaciones de fletes, debes subir copias legibles de tu cédula, licencia de conducir y matrícula del vehículo. Serán validados por el Administrador.</p>
              </div>

              <div className="space-y-6">
                
                {/* Cedula */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="bg-slate-100 p-3 rounded-xl"><FileText className="w-6 h-6 text-slate-600" /></div>
                    <div>
                      <h4 className="font-bold text-slate-800">Cédula de Identidad</h4>
                      <p className="text-sm text-slate-500">Sube una foto o PDF de tu documento (ambos lados).</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Pendiente Validación</span>
                    <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800"><UploadCloud className="w-4 h-4"/> Subir</button>
                  </div>
                </div>

                {/* Licencia */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="bg-slate-100 p-3 rounded-xl"><FileText className="w-6 h-6 text-slate-600" /></div>
                    <div>
                      <h4 className="font-bold text-slate-800">Licencia de Conducir (Tipo C/E)</h4>
                      <p className="text-sm text-slate-500">Sube una foto o PDF vigente.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Pendiente Validación</span>
                    <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800"><UploadCloud className="w-4 h-4"/> Subir</button>
                  </div>
                </div>

                {/* Matricula */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="bg-slate-100 p-3 rounded-xl"><FileText className="w-6 h-6 text-slate-600" /></div>
                    <div>
                      <h4 className="font-bold text-slate-800">Matrícula del Vehículo</h4>
                      <p className="text-sm text-slate-500">Documento actualizado del año en curso.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Pendiente Validación</span>
                    <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800"><UploadCloud className="w-4 h-4"/> Subir</button>
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
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between">
                  <Wallet className="w-24 h-24 absolute -right-4 -bottom-4 opacity-10 text-white" />
                  <div>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Saldo Prepago</p>
                    <h3 className={`text-5xl font-black mb-2 ${balance < 5 ? 'text-red-400' : 'text-emerald-400'}`}>$${balance.toFixed(2)}</h3>
                    <p className="text-xs text-slate-400 leading-tight">De aquí se debitará el porcentaje de comisión cada vez que ganes un flete.</p>
                  </div>
                  {balance < 5 && <div className="mt-4 bg-red-500/20 text-red-300 text-xs font-bold p-2 rounded border border-red-500/30">Saldo bajo. Recarga para recibir notificaciones.</div>}
                </div>

                <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center">
                  <h3 className="font-bold text-lg mb-1 text-slate-800">Recargar Saldo a través de Administrador SARA</h3>
                  <p className="text-sm text-slate-500 mb-6">El ecosistema está integrado a métodos de pago automáticos. Escoge tu preferencia.</p>
                  
                  <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-3 font-bold text-slate-500">$</span>
                      <input 
                        type="number" 
                        value={rechargeAmount}
                        onChange={(e) => setRechargeAmount(Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 font-bold text-lg outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <button onClick={handleRecharge} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-black px-8 rounded-xl transition-colors shadow-md flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" /> Pagar Online
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <CreditCard className="w-8 h-8 text-blue-600" />
                      <div className="text-xs"><p className="font-bold text-slate-800">Tarjetas</p><p className="text-slate-500">Crédito y Débito</p></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <Building className="w-8 h-8 text-emerald-600" />
                      <div className="text-xs"><p className="font-bold text-slate-800">Transferencias</p><p className="text-slate-500">Cuentas SARA</p></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <QrCode className="w-8 h-8 text-slate-700" />
                      <div className="text-xs"><p className="font-bold text-slate-800">Código QR</p><p className="text-slate-500">Billeteras Móviles</p></div>
                    </div>
                  </div>
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
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-3xl font-black">Historial Detallado de Viajes</h2>
                 <div className="flex gap-2">
                   <button className="flex items-center bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">
                     <Download className="w-4 h-4 mr-2" /> Excel
                   </button>
                   <button className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors">
                     <Download className="w-4 h-4 mr-2" /> PDF
                   </button>
                 </div>
               </div>
               
               <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left whitespace-nowrap">
                     <thead>
                       <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                         <th className="p-4 font-bold">Ruta</th>
                         <th className="p-4 font-bold">Embarque</th>
                         <th className="p-4 font-bold">Llegada</th>
                         <th className="p-4 font-bold">Tiempo</th>
                         <th className="p-4 font-bold">Tarifa Cobrada</th>
                         <th className="p-4 font-bold">Comisión SARA</th>
                         <th className="p-4 font-bold">Utilidad Viaje</th>
                       </tr>
                     </thead>
                     <tbody className="text-sm">
                       {[
                         { id: 1, route: 'Quito Sur -> Cumbayá', embarque: '12 Oct 2026, 14:00', llegada: '12 Oct 2026, 14:45', tiempo: '45 min', tarifa: 45.00, comision: 6.75, utilidad: 38.25 },
                         { id: 2, route: 'Mitad del Mundo -> Calderón', embarque: '10 Oct 2026, 09:15', llegada: '10 Oct 2026, 10:20', tiempo: '1h 05 min', tarifa: 60.00, comision: 9.00, utilidad: 51.00 },
                         { id: 3, route: 'Sangolquí -> Sur de Quito', embarque: '08 Oct 2026, 16:30', llegada: '08 Oct 2026, 17:10', tiempo: '40 min', tarifa: 35.00, comision: 5.25, utilidad: 29.75 },
                       ].map((viaje) => (
                         <tr key={viaje.id} className="border-b border-slate-100 hover:bg-slate-50">
                           <td className="p-4 font-bold text-slate-800">{viaje.route}</td>
                           <td className="p-4 text-slate-500">{viaje.embarque}</td>
                           <td className="p-4 text-slate-500">{viaje.llegada}</td>
                           <td className="p-4 font-medium text-slate-600">{viaje.tiempo}</td>
                           <td className="p-4 font-black text-slate-800">$${viaje.tarifa.toFixed(2)}</td>
                           <td className="p-4 font-bold text-red-500">- $${viaje.comision.toFixed(2)}</td>
                           <td className="p-4 font-black text-emerald-600">$${viaje.utilidad.toFixed(2)}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>

               {/* Resumen de Totales */}
               <div className="bg-slate-900 rounded-2xl p-6 text-white grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div>
                   <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Viajes Realizados</p>
                   <p className="text-3xl font-black">3</p>
                 </div>
                 <div>
                   <p className="text-slate-400 text-xs font-bold uppercase mb-1">Tarifa Bruta Generada</p>
                   <p className="text-3xl font-black text-white">$140.00</p>
                 </div>
                 <div>
                   <p className="text-slate-400 text-xs font-bold uppercase mb-1">Comisiones Pagadas a SARA</p>
                   <p className="text-3xl font-black text-red-400">-$21.00</p>
                 </div>
                 <div className="bg-emerald-500/20 p-4 rounded-xl -m-4 ml-2 border border-emerald-500/30">
                   <p className="text-emerald-200 text-xs font-bold uppercase mb-1">Utilidad Neta</p>
                   <p className="text-4xl font-black text-emerald-400">$119.00</p>
                 </div>
               </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
