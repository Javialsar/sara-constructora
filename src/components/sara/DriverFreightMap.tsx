import React, { useState } from 'react';
import { MapPin, Navigation, DollarSign, MessageCircle } from 'lucide-react';

interface FreightAlert {
  id: string;
  origin: string;
  destination: string;
  distance: string;
  referencePrice: number;
}

export default function DriverFreightMap() {
  const [activeAlert, setActiveAlert] = useState<FreightAlert | null>({
    id: 'FLT-8823',
    origin: 'Planta Holcim, Guayaquil',
    destination: 'Obra Residencias, Vía a la Costa',
    distance: '15 km',
    referencePrice: 45.00
  });

  const [counterOffer, setCounterOffer] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'negotiating' | 'accepted'>('idle');

  const handleAccept = () => {
    setStatus('accepted');
    alert('¡Flete aceptado! Ruta iniciada en el mapa.');
  };

  const handleNegotiate = () => {
    if (!counterOffer) return;
    setStatus('negotiating');
    alert(`Contraoferta de $${counterOffer} enviada al constructor. Esperando aprobación...`);
  };

  return (
    <div className="relative h-screen w-full bg-slate-800 font-sans overflow-hidden">
      {/* SIMULACIÓN DE MAPA INTERACTIVO */}
      <div className="absolute inset-0 z-0 opacity-80">
        <img 
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
          alt="Mapa de Rutas" 
          className="w-full h-full object-cover grayscale brightness-75"
        />
      </div>

      {/* OVERLAY DEL CONDUCTOR / TRANSPORTISTA */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-4 md:p-8 flex justify-center">
        {activeAlert && status === 'idle' && (
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border-t-4 border-blue-500 animate-slide-up">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">¡Nuevo Flete Disponible!</h2>
                <p className="text-sm text-slate-500">Material de construcción pesado</p>
              </div>
              <div className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-lg">
                ${activeAlert.referencePrice.toFixed(2)}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-slate-700">
                <MapPin className="w-5 h-5 text-red-500 mr-3" />
                <span className="text-sm font-medium">{activeAlert.origin}</span>
              </div>
              <div className="flex items-center text-slate-700">
                <Navigation className="w-5 h-5 text-blue-500 mr-3" />
                <span className="text-sm font-medium">{activeAlert.destination}</span>
              </div>
              <div className="flex items-center text-slate-500 text-xs ml-8">
                Distancia estimada: {activeAlert.distance}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mb-4">
              <label className="text-xs text-slate-500 mb-1 block">¿Deseas negociar el precio referencial?</label>
              <div className="flex items-center relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3" />
                <input 
                  type="number" 
                  placeholder="Tu contraoferta" 
                  value={counterOffer}
                  onChange={(e) => setCounterOffer(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={handleAccept}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-colors"
              >
                Aceptar ${activeAlert.referencePrice}
              </button>
              <button 
                onClick={handleNegotiate}
                disabled={!counterOffer}
                className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Negociar
              </button>
            </div>
          </div>
        )}

        {status === 'negotiating' && (
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 text-center animate-pulse">
             <h2 className="text-lg font-bold text-slate-800 mb-2">Negociando con el Constructor...</h2>
             <p className="text-slate-500 text-sm">Has propuesto un valor de ${counterOffer}. Espera la confirmación.</p>
          </div>
        )}

        {status === 'accepted' && (
          <div className="bg-blue-600 w-full max-w-md rounded-2xl shadow-2xl p-6 text-center text-white">
             <Navigation className="w-8 h-8 mx-auto mb-3 animate-bounce" />
             <h2 className="text-xl font-bold mb-1">Ruta Iniciada</h2>
             <p className="text-blue-100 text-sm">Dirígete a: {activeAlert?.origin}</p>
          </div>
        )}
      </div>
    </div>
  );
}
