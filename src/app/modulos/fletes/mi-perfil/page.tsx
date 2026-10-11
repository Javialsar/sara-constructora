
'use client';
import React, { useState, useRef } from 'react';
import { List, Truck, MapPin, FileText, History, Wallet, Camera, ChevronRight, CheckCircle, Navigation, Package, Download, CreditCard, QrCode, Building, UploadCloud, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { getFletesPlanes } from '@/lib/fletes-data';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import StandardCheckoutModal from '@/components/checkout/StandardCheckoutModal';

export default function MiPerfilFletes() {
  const [activeTab, setActiveTab] = useState<'sincronizacion' | 'vehiculo' | 'documentos' | 'billetera' | 'historial' | 'recargas'>('sincronizacion');
  const [planesList, setPlanesList] = useState<any[]>([]);

  React.useEffect(() => {
    getFletesPlanes().then(setPlanesList);
  }, []);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cedulaRef = useRef<HTMLInputElement>(null);
  const licenciaRef = useRef<HTMLInputElement>(null);
  const matriculaRef = useRef<HTMLInputElement>(null);
  
  const [docCedula, setDocCedula] = useState(false);
  const [docLicencia, setDocLicencia] = useState(false);
  const [docMatricula, setDocMatricula] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

    const [incomingRequest, setIncomingRequest] = useState<any>(null);
  const [tripAccepted, setTripAccepted] = useState(false);
  const [accessCode, setAccessCode] = useState<string | null>(null);

  // Simular la llegada de un flete a los 5 segundos de abrir la app
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!incomingRequest && !tripAccepted) {
        setIncomingRequest({
          origen: 'Av. Simón Bolívar y Ruta Viva',
          destino: 'Plaza Lagos, Samborondón',
          cliente: 'Constructora Atlas S.A.',
          valorRef: 145.50
        });
        showToast('¡Nueva solicitud de flete en tu área!');
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleAcceptTrip = () => {
    setIncomingRequest(null);
    setTripAccepted(true);
    setAccessCode('SARA-' + Math.floor(100 + Math.random() * 900));
    showToast('Flete aceptado. Dirígete al origen y presenta tu código de acceso.');
  };

  // Estados Billetera
  const [balance, setBalance] = useState(0);
  const [rechargeAmount, setRechargeAmount] = useState(20);
  const [plan, setPlan] = useState<'VIP' | 'Estandar' | 'Basico'>('Estandar');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutConfig, setCheckoutConfig] = useState<{
    title: string;
    amount: number;
    isSubscription: boolean;
    interval?: string;
  }>({
    title: 'Recarga de Saldo Prepago',
    amount: 20,
    isSubscription: false
  });

  // Estados Ubicacion
  const [driverCountry, setDriverCountry] = useState('Ecuador');
  const [driverProvince, setDriverProvince] = useState('Pichincha');
  const [driverCity, setDriverCity] = useState('Quito Sur');

  const viajes = [
    { id: 1, route: 'Quito Sur -> Cumbayá', embarque: '12 Oct 2026, 14:00', llegada: '12 Oct 2026, 14:45', tiempo: '45 min', tarifa: 45.00, comision: 6.75, utilidad: 38.25 },
    { id: 2, route: 'Mitad del Mundo -> Calderón', embarque: '10 Oct 2026, 09:15', llegada: '10 Oct 2026, 10:20', tiempo: '1h 05 min', tarifa: 60.00, comision: 9.00, utilidad: 51.00 },
    { id: 3, route: 'Sangolquí -> Sur de Quito', embarque: '08 Oct 2026, 16:30', llegada: '08 Oct 2026, 17:10', tiempo: '40 min', tarifa: 35.00, comision: 5.25, utilidad: 29.75 },
  ];

  const historialRecargas = [
    { fecha: '12 Oct 2026, 15:30', referencia: 'TRX-99882211', metodo: 'Tarjeta Crédito', estado: 'En Verificación', valor: 50.00 },
    { fecha: '01 Oct 2026, 09:15', referencia: 'TRX-11223344', metodo: 'Transferencia', estado: 'Aprobado', valor: 100.00 }
  ];

  const handleDownloadExcel = (type: 'viajes' | 'recargas') => {
    if (type === 'viajes') {
      const ws = XLSX.utils.json_to_sheet(viajes);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Viajes");
      XLSX.writeFile(wb, "historial_viajes.xlsx");
    } else {
      const ws = XLSX.utils.json_to_sheet(historialRecargas);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Recargas");
      XLSX.writeFile(wb, "historial_recargas.xlsx");
    }
  };

  const handleDownloadPDF = (type: 'viajes' | 'recargas') => {
    const doc = new jsPDF();
    if (type === 'viajes') {
      doc.text("Historial de Viajes", 14, 15);
      const tableColumn = ["Ruta", "Embarque", "Llegada", "Tiempo", "Tarifa", "Comisión", "Utilidad"];
      const tableRows = viajes.map(v => [
        v.route, v.embarque, v.llegada, v.tiempo, v.tarifa.toString(), v.comision.toString(), v.utilidad.toString()
      ]);
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
      doc.save("historial_viajes.pdf");
    } else {
      doc.text("Historial de Recargas", 14, 15);
      const tableColumn = ["Fecha", "Referencia", "Método", "Estado", "Valor"];
      const tableRows = historialRecargas.map(r => [
        r.fecha, r.referencia, r.metodo, r.estado, r.valor.toString()
      ]);
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
      doc.save("historial_recargas.pdf");
    }
  };

  const handleRecharge = () => {
    setCheckoutConfig({
      title: 'Recarga de Saldo SARA Fletes',
      amount: rechargeAmount,
      isSubscription: false
    });
    setIsCheckoutOpen(true);
  };

  const handleSelectPlanSubscription = (selectedPlanName: string) => {
    const cost = selectedPlanName === 'VIP' ? 49.99 : selectedPlanName === 'Estandar' ? 19.99 : 4.99;
    setPlan(selectedPlanName as any);
    setCheckoutConfig({
      title: `Suscripción a Plan ${selectedPlanName}`,
      amount: cost,
      isSubscription: true,
      interval: 'por mes'
    });
    setIsCheckoutOpen(true);
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
{/* SALDO WIDGET */}
            <div className="mt-4 bg-slate-900/50 border border-slate-700/50 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Saldo Disponible</p>
                <p className="text-2xl font-black text-emerald-400">$119.00</p>
              </div>
              <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                <Wallet className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
        </div>

        <nav className="space-y-2 flex-grow">
          <button onClick={() => setActiveTab('sincronizacion')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'sincronizacion' ? 'bg-emerald-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}>
            <Navigation className="w-5 h-5 mr-3" /> Sincronización Fletes
          </button>
          <button onClick={() => setActiveTab('vehiculo')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'vehiculo' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}>
            <Truck className="w-5 h-5 mr-3" /> Mi Cabina y Perfil
          </button>
          <button onClick={() => setActiveTab('documentos')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'documentos' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}>
            <FileText className="w-5 h-5 mr-3" /> Mis Documentos
          </button>
          <button onClick={() => setActiveTab('billetera')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'billetera' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}>
            <Wallet className="w-5 h-5 mr-3" /> Billetera y Plan
          </button>
          <button onClick={() => setActiveTab('historial')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'historial' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}>
            <List className="w-5 h-5 mr-3" /> Historial de Viajes
          </button>
          <button onClick={() => setActiveTab('recargas')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'recargas' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}>
            <List className="w-5 h-5 mr-3" /> Historial de Recargas
          </button>
        </nav>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <Link href="/modulos/fletes">
            <button className="w-full text-slate-400 hover:text-white text-sm font-medium transition-colors">
              Cerrar Sesi├│n
            </button>
          </Link>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          
          {/* TAB: SINCRONIZACION */}
          {activeTab === 'sincronizacion' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full min-h-[85vh] flex flex-col">
              <h2 className="text-3xl font-black mb-6">Sincronización Fletes (Radar Activo)</h2>
              <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="w-full h-[70vh] rounded-xl shadow-inner overflow-hidden relative">
                   <iframe 
                     width="100%" 
                     height="100%" 
                     frameBorder="0" 
                     scrolling="no" 
                     src={`https://maps.google.com/maps?q=${encodeURIComponent(driverCountry + ' ' + driverProvince + ' ' + driverCity)}&t=m&z=13&output=embed`}
                     style={{ filter: tripAccepted ? 'hue-rotate(90deg) contrast(1.1)' : 'none', transition: 'all 0.5s ease' }}
                   ></iframe>
                   
                   {/* OVERLAY: SOLICITUD ENTRANTE */}
                   {incomingRequest && !tripAccepted && (
                     <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-10 animate-in fade-in zoom-in duration-300">
                       <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
                         <div className="flex justify-between items-start mb-4">
                           <div className="flex items-center gap-2">
                             <span className="relative flex h-3 w-3">
                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                               <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                             </span>
                             <h3 className="font-black text-lg text-slate-800">¡Nuevo Flete Disponible!</h3>
                           </div>
                         </div>
                         
                         <div className="space-y-4 mb-6">
                           <div className="flex items-start gap-3">
                             <div className="bg-slate-100 p-2 rounded-lg mt-1"><MapPin className="w-4 h-4 text-slate-600"/></div>
                             <div>
                               <p className="text-xs text-slate-500 font-bold uppercase">Origen</p>
                               <p className="font-bold text-slate-800">{incomingRequest.origen}</p>
                             </div>
                           </div>
                           <div className="flex items-start gap-3">
                             <div className="bg-slate-100 p-2 rounded-lg mt-1"><Navigation className="w-4 h-4 text-blue-600"/></div>
                             <div>
                               <p className="text-xs text-slate-500 font-bold uppercase">Destino</p>
                               <p className="font-bold text-slate-800">{incomingRequest.destino}</p>
                             </div>
                           </div>
                           <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                             <div>
                               <p className="text-xs text-slate-500 font-bold uppercase">Cliente</p>
                               <p className="font-bold text-slate-700">{incomingRequest.cliente}</p>
                             </div>
                             <div className="text-right">
                               <p className="text-xs text-slate-500 font-bold uppercase">Valor Ref.</p>
                               <p className="font-black text-emerald-600 text-lg">${incomingRequest.valorRef?.toFixed(2)}</p>
                             </div>
                           </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-3">
                           <button onClick={() => setIncomingRequest(null)} className="bg-white border-2 border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors">
                             Negociar
                           </button>
                           <button onClick={handleAcceptTrip} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-black py-3 rounded-xl transition-colors shadow-md">
                             Aceptar
                           </button>
                         </div>
                       </div>
                     </div>
                   )}

                   {/* OVERLAY: VIAJE ACEPTADO (RUTA ACTIVA) */}
                   {tripAccepted && (
                     <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 p-5 z-10 animate-in slide-in-from-bottom-8">
                       <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                         <div className="flex items-center gap-3">
                           <div className="bg-emerald-100 p-2 rounded-lg"><Navigation className="w-6 h-6 text-emerald-600"/></div>
                           <div>
                             <h3 className="font-black text-slate-800">En Ruta hacia Origen</h3>
                             <p className="text-sm text-slate-500 font-medium">Llegada estimada: 12 min</p>
                           </div>
                         </div>
                         <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-center shadow-inner">
                           <p className="text-[10px] font-bold uppercase text-slate-400">Código Acceso</p>
                           <p className="font-mono font-black text-lg tracking-wider text-amber-400">{accessCode}</p>
                         </div>
                       </div>
                       <div className="flex gap-3">
                         <button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                           Navegar (GPS)
                         </button>
                         <button onClick={() => { setTripAccepted(false); setAccessCode(null); showToast('Viaje finalizado exitosamente.'); }} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition-colors text-sm border border-red-100">
                           Finalizar Viaje
                         </button>
                       </div>
                     </div>
                   )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: VEHICULO */}
          {activeTab === 'vehiculo' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-black mb-6">Datos de Mi Cabina y Perfil</h2>
              
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
                      <h4 className="font-bold text-slate-800">Fotograf├¡a del Conductor</h4>
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
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Veh├¡culo</label>
                      <select className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-amber-500 bg-white">
                        <option>Volqueta (12m3)</option>
                        <option>Cami├│n (5 Ton)</option>
                        <option>Plataforma / Mula</option>
                        <option>Camionetas Doble Cabina</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Placa (Letras y N├║meros)</label>
                      <input type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-amber-500 font-mono uppercase" defaultValue="PBA-1234" />
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-slate-100">
                     <div className="flex items-center justify-between mb-4">
                       <div>
                         <h4 className="font-bold text-slate-800">Ubicaci├│n GPS Actual</h4>
                         <p className="text-sm text-slate-500">Transmite tu posici├│n exacta para recibir viajes cercanos y mejorar cobertura.</p>
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
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pa├¡s</label>
                          <select value={driverCountry} onChange={e => setDriverCountry(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500 bg-slate-50">
                            <option>Ecuador</option>
                            <option>Colombia</option>
                            <option>Per├║</option>
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

                                       </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DOCUMENTOS */}
          {activeTab === 'documentos' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-black mb-6">Validaci├│n de Documentos</h2>
              
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl mb-6">
                <p className="text-amber-800 text-sm font-bold">Importante: Para activar tu perfil y empezar a recibir notificaciones de fletes, debes subir copias legibles de tu c├®dula, licencia de conducir y matr├¡cula del veh├¡culo. Ser├ín validados por el Administrador.</p>
              </div>

              <div className="space-y-6">
                
                {/* Cedula */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="bg-slate-100 p-3 rounded-xl"><FileText className="w-6 h-6 text-slate-600" /></div>
                    <div>
                      <h4 className="font-bold text-slate-800">C├®dula de Identidad</h4>
                      <p className="text-sm text-slate-500">Sube una foto o PDF de tu documento (ambos lados).</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    {!docCedula && <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Pendiente</span>}
                    <input type="file" ref={cedulaRef} className="hidden" onChange={(e) => { if(e.target.files && e.target.files[0]) setDocCedula(true); }} />
  {docCedula ? (
    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Recibido</span>
  ) : (
    <button onClick={() => cedulaRef.current?.click()} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800"><UploadCloud className="w-4 h-4"/> Subir</button>
  )}
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
                    {!docLicencia && <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Pendiente</span>}
                    <input type="file" ref={licenciaRef} className="hidden" onChange={(e) => { if(e.target.files && e.target.files[0]) setDocLicencia(true); }} />
  {docLicencia ? (
    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Recibido</span>
  ) : (
    <button onClick={() => licenciaRef.current?.click()} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800"><UploadCloud className="w-4 h-4"/> Subir</button>
  )}
                  </div>
                </div>

                {/* Matricula */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="bg-slate-100 p-3 rounded-xl"><FileText className="w-6 h-6 text-slate-600" /></div>
                    <div>
                      <h4 className="font-bold text-slate-800">Matr├¡cula del Veh├¡culo</h4>
                      <p className="text-sm text-slate-500">Documento actualizado del a├▒o en curso.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    {!docMatricula && <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Pendiente</span>}
                    <input type="file" ref={matriculaRef} className="hidden" onChange={(e) => { if(e.target.files && e.target.files[0]) setDocMatricula(true); }} />
  {docMatricula ? (
    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Recibido</span>
  ) : (
    <button onClick={() => matriculaRef.current?.click()} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800"><UploadCloud className="w-4 h-4"/> Subir</button>
  )}
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
                    <h3 className={`text-5xl font-black mb-2 ${balance < 5 ? 'text-red-400' : 'text-emerald-400'}`}>${balance.toFixed(2)}</h3>
                    <p className="text-xs text-slate-400 leading-tight">De aqu├¡ se debitar├í el porcentaje de comisi├│n cada vez que ganes un flete.</p>
                  </div>
                  {balance < 5 && <div className="mt-4 bg-red-500/20 text-red-300 text-xs font-bold p-2 rounded border border-red-500/30">Saldo bajo. Recarga para recibir notificaciones.</div>}
                </div>

                <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center">
                  <h3 className="font-bold text-lg mb-1 text-slate-800">Recargar Saldo a trav├®s de Administrador SARA</h3>
                  <p className="text-sm text-slate-500 mb-6">El ecosistema est├í integrado a m├®todos de pago autom├íticos. Escoge tu preferencia.</p>
                  
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
                      <div className="text-xs"><p className="font-bold text-slate-800">Tarjetas</p><p className="text-slate-500">Cr├®dito y D├®bito</p></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <Building className="w-8 h-8 text-emerald-600" />
                      <div className="text-xs"><p className="font-bold text-slate-800">Transferencias</p><p className="text-slate-500">Cuentas SARA</p></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <QrCode className="w-8 h-8 text-slate-700" />
                      <div className="text-xs"><p className="font-bold text-slate-800">C├│digo QR</p><p className="text-slate-500">Billeteras M├│viles</p></div>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-4">Selecciona tu Plan de Comisión</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {planesList.length > 0 ? planesList.map((p: any) => (
                    <div key={p.id} onClick={() => handleSelectPlanSubscription(p.nombre)} className={`cursor-pointer rounded-2xl p-6 border-2 transition-all group ${plan === p.nombre ? 'border-amber-500 bg-amber-50 relative overflow-hidden shadow-md' : 'border-slate-200 bg-white hover:border-amber-400 hover:shadow-sm'}`}>
                      {plan === p.nombre && <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">ACTIVO</div>}
                      <div className="flex justify-between items-start mb-4">
                        <h4 className={`font-black text-lg ${plan === p.nombre ? 'text-amber-900' : 'text-slate-800'}`}>{p.nombre}</h4>
                        {plan === p.nombre && <CheckCircle className="w-6 h-6 text-amber-500" />}
                      </div>
                      <div className="text-3xl font-black text-slate-800 mb-2">{p.comision}% <span className="text-sm text-slate-500 font-medium">/ flete</span></div>
                      <p className="text-xs text-slate-500 mb-3">{p.nombre === 'VIP' ? '$49.99/mes' : p.nombre === 'Estandar' ? '$19.99/mes' : '$4.99/mes'}</p>
                      <ul className="text-sm text-slate-600 space-y-2 mt-4 mb-4">
                        <li className="flex items-center"><CheckCircle className="w-4 h-4 text-emerald-500 mr-2"/> Notificaciones prioritarias</li>
                        <li className="flex items-center"><CheckCircle className="w-4 h-4 text-emerald-500 mr-2"/> Cobertura Nacional GPS</li>
                      </ul>
                      <button 
                        type="button" 
                        className={`w-full py-2 rounded-lg text-xs font-bold transition-colors ${plan === p.nombre ? 'bg-amber-500 text-slate-900' : 'bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white'}`}
                      >
                        {plan === p.nombre ? 'Plan Actual' : 'Suscribirse al Plan'}
                      </button>
                    </div>
                  )) : (
                    <div className="col-span-3 text-center text-slate-500 py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">Cargando planes de Supabase...</div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: HISTORIAL */}
          {activeTab === 'historial' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-3xl font-black">Historial Detallado de Viajes</h2>
                 <div className="flex gap-2">
                   <button onClick={() => handleDownloadExcel('viajes')} className="flex items-center bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">
                     <Download className="w-4 h-4 mr-2" /> Excel
                   </button>
                   <button onClick={() => handleDownloadPDF('viajes')} className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors">
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
                         <th className="p-4 font-bold">Comisi├│n SARA</th>
                         <th className="p-4 font-bold">Utilidad Viaje</th>
                       </tr>
                     </thead>
                     <tbody className="text-sm">
                       {viajes.map((viaje) => (
                         <tr key={viaje.id} className="border-b border-slate-100 hover:bg-slate-50">
                           <td className="p-4 font-bold text-slate-800">{viaje.route}</td>
                           <td className="p-4 text-slate-500">{viaje.embarque}</td>
                           <td className="p-4 text-slate-500">{viaje.llegada}</td>
                           <td className="p-4 font-medium text-slate-600">{viaje.tiempo}</td>
                           <td className="p-4 font-black text-slate-800">${viaje.tarifa.toFixed(2)}</td>
                           <td className="p-4 font-bold text-red-500">- ${viaje.comision.toFixed(2)}</td>
                           <td className="p-4 font-black text-emerald-600">${viaje.utilidad.toFixed(2)}</td>
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

      {activeTab === 'recargas' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-800">Historial de Recargas</h2>
                <p className="text-slate-500 mt-1">Verifica tus pagos y transferencias a la billetera SARA.</p>
                <div className="flex gap-2 mt-2">
                   <button onClick={() => handleDownloadExcel('recargas')} className="flex items-center bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">
                     <Download className="w-4 h-4 mr-2" /> Excel
                   </button>
                   <button onClick={() => handleDownloadPDF('recargas')} className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors">
                     <Download className="w-4 h-4 mr-2" /> PDF
                   </button>
                 </div>
              </div>
              <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg flex items-center gap-6 min-w-[250px]">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Saldo Disponible</p>
                  <p className="text-3xl font-black text-emerald-400">$119.00</p>
                </div>
                <div className="p-3 bg-slate-800 rounded-full">
                  <Wallet className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                      <th className="p-4">Fecha y Hora</th>
                      <th className="p-4">Referencia / Comprobante</th>
                      <th className="p-4">Forma de Pago</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Valor Recargado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialRecargas.map((recarga, index) => (
                      <tr key={index} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-slate-600 font-medium">{recarga.fecha}</td>
                        <td className="p-4 text-slate-500 text-sm font-mono flex items-center"><FileText className="w-4 h-4 mr-2 text-slate-400"/> {recarga.referencia}</td>
                        <td className="p-4">
                          <span className="flex items-center text-slate-600 text-sm">
                            {recarga.metodo === 'Tarjeta Cr├®dito' ? <CreditCard className="w-4 h-4 mr-2 text-blue-500" /> : <Building className="w-4 h-4 mr-2 text-slate-500" />}
                            {recarga.metodo}
                          </span>
                        </td>
                        <td className="p-4"><span className={"text-[11px] font-bold px-2.5 py-1 rounded-full border " + (recarga.estado === 'Aprobado' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200')}>{recarga.estado}</span></td>
                        <td className="p-4 font-black text-emerald-600 text-right text-lg">+${recarga.valor.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-50">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <p className="font-bold">{toastMessage}</p>
        </div>
      )}

      {/* MODAL DE CHECKOUT ESTÁNDAR SARA */}
      <StandardCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={(txId) => {
          setIsCheckoutOpen(false);
          if (checkoutConfig.isSubscription) {
            showToast(`¡Suscripción al plan activada con éxito! Ref: ${txId}`);
          } else {
            setBalance(balance + checkoutConfig.amount);
            showToast(`¡Recarga de $${checkoutConfig.amount.toFixed(2)} aplicada! Ref: ${txId}`);
          }
        }}
        title={checkoutConfig.title}
        badgeText="SARA Fletes"
        amount={checkoutConfig.amount}
        isSubscription={checkoutConfig.isSubscription}
        subscriptionInterval={checkoutConfig.interval || 'por mes'}
        items={[
          {
            label: checkoutConfig.isSubscription 
              ? `Acceso a red y beneficios ${checkoutConfig.title}`
              : `Acreditación directa a billetera móvil SARA`,
            amount: checkoutConfig.amount
          }
        ]}
        defaultEmail="carlos.mendoza@gruposara.com"
        defaultCustomerName="Carlos Mendoza"
      />
    </div>
  );
}
