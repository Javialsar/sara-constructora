import re

with open('src/app/modulos/fletes/mi-perfil/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State for map
state_imports = """  // Estados Billetera"""
new_state = """  const [incomingRequest, setIncomingRequest] = useState<any>(null);
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

  // Estados Billetera"""
content = content.replace(state_imports, new_state)

# 2. Extract old Map block
map_start_str = '{/* GEOREFERENCIA MAPA */}'
map_start = content.find(map_start_str)

if map_start > -1:
    map_end_str = '</div>\n\n                    </div>'
    map_end_str_win = '</div>\r\n\r\n                    </div>'
    
    map_end = content.find(map_end_str, map_start)
    if map_end == -1:
        map_end = content.find(map_end_str_win, map_start)
        
    if map_end > -1:
        old_map = content[map_start:map_end + 6]
        content = content.replace(old_map, "")
        
        # 3. Add new Tab Sincronizacion
        new_map = """{/* TAB: SINCRONIZACION */}
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
"""
        content = content.replace("{/* TAB: VEHICULO */}", new_map + "\n          {/* TAB: VEHICULO */}")
        
        # Update activeTab state
        content = content.replace("useState<'vehiculo'", "useState<'sincronizacion' | 'vehiculo'")
        content = content.replace("('vehiculo');", "('sincronizacion');")

        # Replace sidebar nav
        nav_pattern = r'<nav className="space-y-2 flex-grow">.*?</nav>'
        new_nav = """<nav className="space-y-2 flex-grow">
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
        </nav>"""
        content = re.sub(nav_pattern, new_nav, content, flags=re.DOTALL)
        
        # Change title
        content = content.replace("Datos del Conductor y Radar", "Datos de Mi Cabina y Perfil")
        
        print("Map replaced successfully")
    else:
        print("Map end not found")

with open('src/app/modulos/fletes/mi-perfil/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
