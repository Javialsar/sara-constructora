'use client';
import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Navigation, DollarSign, MessageCircle, Loader2, CheckCircle, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface FreightRequest {
  id: string;
  origin: string;
  destination: string;
  material: string;
  weight: number; // toneladas
  referencePrice: number;
  status: 'searching' | 'negotiating' | 'accepted';
}

export default function SaraFletesEngine() {
  const [viewMode, setViewMode] = useState<'constructor' | 'driver'>('constructor');
  
  // Estado global simulado del viaje
  const [activeFreight, setActiveFreight] = useState<FreightRequest | null>(null);
  
  // --- ESTADOS CONSTRUCTOR ---
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [material, setMaterial] = useState('Cemento Holcim (Sacos)');
  const [weight, setWeight] = useState<number>(5); // 5 Toneladas base
  const [isCalculating, setIsCalculating] = useState(false);

  // --- ESTADOS TRANSPORTISTA ---
  const [counterOffer, setCounterOffer] = useState<string>('');
  
  // Función: Constructor solicita camión
  const handleRequestTruck = () => {
    if(!origin || !destination) return alert("Ingresa origen y destino");
    setIsCalculating(true);
    
    // Simulamos el algoritmo de costeo logístico (Ej: $2.50 base + $1.20 x Tonelada + factor distancia simulado)
    setTimeout(() => {
      const simulatedPrice = 15.00 + (weight * 2.50);
      setActiveFreight({
        id: 'FLT-' + Math.floor(Math.random() * 10000),
        origin,
        destination,
        material,
        weight,
        referencePrice: simulatedPrice,
        status: 'searching'
      });
      setIsCalculating(false);
      // Auto-cambio a vista de transportista para la demo
      setTimeout(() => setViewMode('driver'), 1500);
    }, 2000);
  };

  // Función: Transportista acepta
  const handleDriverAccept = () => {
    if(activeFreight) {
      setActiveFreight({ ...activeFreight, status: 'accepted' });
    }
  };

  // Función: Transportista negocia
  const handleDriverNegotiate = () => {
    if(activeFreight && counterOffer) {
      setActiveFreight({ ...activeFreight, status: 'negotiating' });
      // Simulamos que el constructor acepta la contraoferta en 3 segundos
      setTimeout(() => {
        setActiveFreight(prev => prev ? { ...prev, referencePrice: parseFloat(counterOffer), status: 'accepted' } : null);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col">
      {/* HEADER NAVBAR */}
      <header className="bg-slate-950 text-white p-4 flex justify-between items-center shadow-md relative z-20">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-lg"><Truck className="w-6 h-6 text-slate-900" /></div>
          <h1 className="text-xl font-bold tracking-tight">SARA <span className="text-amber-500">Fletes</span></h1>
        </div>
        
        {/* Filtros Geográficos Rápidos */}
        <div className="hidden md:flex gap-2">
          <select className="bg-slate-800 border-none text-sm rounded px-3 py-1.5 outline-none text-slate-300">
             <option>Ecuador</option>
             <option>Colombia</option>
          </select>
          <select className="bg-slate-800 border-none text-sm rounded px-3 py-1.5 outline-none text-slate-300">
             <option>Pichincha</option>
             <option>Guayas</option>
             <option>Azuay</option>
          </select>
          <select className="bg-slate-800 border-none text-sm rounded px-3 py-1.5 outline-none text-slate-300">
             <option>Todas las Volquetas</option>
             <option>Camiones 5T</option>
             <option>Mulas 20T</option>
          </select>
        </div>
        
        {/* Toggle de Roles para la Demo */}
        <div className="bg-slate-800 p-1 rounded-lg flex text-sm font-bold">
          <button 
            onClick={() => setViewMode('constructor')} 
            className={`px-4 py-2 rounded-md transition-all ${viewMode === 'constructor' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}
          >
            Modo Constructor
          </button>
          <button 
            onClick={() => setViewMode('driver')} 
            className={`px-4 py-2 rounded-md transition-all ${viewMode === 'driver' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}
          >
            Modo Transportista
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/modulos/fletes/auth" className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            Soy Transportista (Login)
          </Link>
          <Link href="/" className="text-slate-400 hover:text-white text-sm">Inicio</Link>
        </div>
      </header>

      {/* ÁREA PRINCIPAL SPLIT */}
      <div className="flex-1 relative flex">
        
        {/* FONDO MAPA GLOBAL DINÁMICO */}
        <div className="absolute inset-0 z-0 bg-slate-800">
          <iframe 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="no" 
            src={`https://maps.google.com/maps?q=${encodeURIComponent(activeFreight ? `${activeFreight.origin} to ${activeFreight.destination} Ecuador` : 'Quito Ecuador')}&t=m&z=12&ie=UTF8&iwloc=&output=embed`}
            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(85%) opacity(0.6)' }}
          ></iframe>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* VISTA 1: CONSTRUCTOR (Solicitante) */}
        {/* ---------------------------------------------------------------- */}
        {viewMode === 'constructor' && (
          <div className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-2xl font-bold text-slate-800">Solicitar Volqueta</h2>
              <p className="text-slate-500 text-sm">Cotiza y encuentra transporte en segundos.</p>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-5">
              <div className="relative">
                <div className="absolute left-4 top-10 bottom-10 w-0.5 bg-slate-200"></div>
                
                <div className="relative z-10 mb-6">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Punto de Carga (Origen)</label>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center mr-3 z-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                    </div>
                    <input 
                      type="text" 
                      value={origin} onChange={e => setOrigin(e.target.value)}
                      className="flex-1 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all bg-slate-50"
                      placeholder="Ej. Planta Holcim San Eduardo" 
                    />
                  </div>
                </div>

                <div className="relative z-10">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Punto de Descarga (Destino)</label>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-amber-500 flex items-center justify-center mr-3 z-10 shadow-sm shadow-amber-500/20">
                      <MapPin className="w-4 h-4 text-amber-600" />
                    </div>
                    <input 
                      type="text" 
                      value={destination} onChange={e => setDestination(e.target.value)}
                      className="flex-1 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all bg-slate-50"
                      placeholder="Ej. Obra Torre Qorner" 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Carga y Volumen</label>
                <div className="flex gap-3 mb-4">
                  <div className="flex-1">
                    <select value={material} onChange={e => setMaterial(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-3 outline-none text-sm bg-slate-50">
                      <option>Cemento (Sacos)</option>
                      <option>Arena / Ripio</option>
                      <option>Varillas de Acero</option>
                      <option>Bloques / Ladrillos</option>
                      <option>Desalojo de Escombros</option>
                    </select>
                  </div>
                  <div className="w-1/3 flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3">
                    <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} className="w-full bg-transparent outline-none text-center font-bold text-slate-700" />
                    <span className="text-xs font-bold text-slate-400 ml-1">TON</span>
                  </div>
                </div>
              </div>

              {activeFreight ? (
                <div className="mt-8 bg-amber-50 border border-amber-200 p-6 rounded-xl text-center animate-in fade-in zoom-in duration-300">
                  {activeFreight.status === 'searching' && (
                    <>
                      <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-3" />
                      <h3 className="font-bold text-amber-900 text-lg">Buscando Transportistas...</h3>
                      <p className="text-amber-700 text-sm">Precio Referencial: <strong className="text-xl">${activeFreight.referencePrice.toFixed(2)}</strong></p>
                      <p className="text-xs text-amber-600 mt-2">Notificando a camioneros en un radio de 5km</p>
                    </>
                  )}
                  {activeFreight.status === 'negotiating' && (
                    <>
                      <MessageCircle className="w-10 h-10 text-blue-500 animate-pulse mx-auto mb-3" />
                      <h3 className="font-bold text-blue-900 text-lg">Un chofer está ofertando</h3>
                      <p className="text-blue-700 text-sm">Analizando contraoferta...</p>
                    </>
                  )}
                  {activeFreight.status === 'accepted' && (
                    <>
                      <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                      <h3 className="font-bold text-emerald-900 text-lg">¡Flete Asignado!</h3>
                      <p className="text-emerald-700 text-sm">El camión está en camino por <strong>${activeFreight.referencePrice.toFixed(2)}</strong></p>
                      <button onClick={() => setActiveFreight(null)} className="mt-4 text-xs font-bold text-emerald-800 underline">Nuevo Flete</button>
                    </>
                  )}
                </div>
              ) : (
                <button 
                  onClick={handleRequestTruck}
                  disabled={isCalculating}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center mt-6"
                >
                  {isCalculating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Calculando Tarifa...</> : 'Calcular Tarifa y Pedir Flete'}
                </button>
              )}

            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* VISTA 2: TRANSPORTISTA (Driver App) */}
        {/* ---------------------------------------------------------------- */}
        {viewMode === 'driver' && (
          <div className="relative z-10 w-full h-full flex items-end justify-center pb-8 p-4">
            
            {!activeFreight ? (
              <div className="bg-slate-900/90 backdrop-blur-md text-white p-6 rounded-2xl shadow-2xl flex flex-col items-center border border-slate-700 max-w-sm w-full animate-in fade-in slide-in-from-bottom">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                  <Navigation className="w-12 h-12 text-blue-400" />
                </div>
                <h3 className="font-bold text-lg">Radar Activo</h3>
                <p className="text-slate-400 text-sm text-center mt-1">Buscando viajes cercanos a tu ubicación. Espera requerimientos de constructoras...</p>
              </div>
            ) : (
              <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border-t-4 border-amber-500 animate-in slide-in-from-bottom duration-500">
                {activeFreight.status === 'searching' && (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-black text-slate-800">¡Nuevo Viaje Cerca!</h2>
                        <p className="text-sm font-bold text-amber-600 flex items-center"><Package className="w-4 h-4 mr-1"/> {activeFreight.weight} TON - {activeFreight.material}</p>
                      </div>
                      <div className="bg-emerald-100 text-emerald-800 font-black px-4 py-2 rounded-xl text-2xl shadow-inner">
                        ${activeFreight.referencePrice.toFixed(2)}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl mb-6 space-y-3 border border-slate-100">
                      <div className="flex items-start text-slate-700">
                        <div className="w-6 flex justify-center mt-0.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div></div>
                        <div className="flex-1"><p className="text-xs text-slate-500 font-bold uppercase">Recoger en:</p><p className="text-sm font-bold">{activeFreight.origin}</p></div>
                      </div>
                      <div className="flex items-start text-slate-700">
                        <div className="w-6 flex justify-center mt-0.5"><MapPin className="w-4 h-4 text-amber-500" /></div>
                        <div className="flex-1"><p className="text-xs text-slate-500 font-bold uppercase">Entregar en:</p><p className="text-sm font-bold">{activeFreight.destination}</p></div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">¿Deseas contraofertar el precio?</label>
                      <div className="flex items-center relative">
                        <DollarSign className="w-5 h-5 text-slate-400 absolute left-3" />
                        <input 
                          type="number" 
                          placeholder="Tu tarifa propuesta" 
                          value={counterOffer}
                          onChange={(e) => setCounterOffer(e.target.value)}
                          className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button 
                        onClick={handleDriverAccept}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold transition-colors shadow-lg"
                      >
                        Aceptar Viaje
                      </button>
                      <button 
                        onClick={handleDriverNegotiate}
                        disabled={!counterOffer}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 py-4 rounded-xl font-black transition-colors disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 shadow-lg flex items-center justify-center"
                      >
                        Ofertar
                      </button>
                    </div>
                  </>
                )}

                {activeFreight.status === 'negotiating' && (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Enviando Contraoferta...</h2>
                    <p className="text-slate-500">Has propuesto <strong>${counterOffer}</strong>. Esperando aprobación del constructor.</p>
                  </div>
                )}

                {activeFreight.status === 'accepted' && (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Navigation className="w-10 h-10 text-emerald-600 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">¡Ruta Iniciada!</h2>
                    <p className="text-slate-600 font-medium">Dirígete al punto de carga.</p>
                    <div className="mt-6 bg-slate-900 text-white font-bold p-4 rounded-xl">
                      Tarifa Final: ${activeFreight.referencePrice.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
