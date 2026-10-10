import React from 'react';
import { Map, Navigation, Truck, MapPin } from 'lucide-react';

export default function GlobalMap() {
  const drivers = [
    { id: 1, name: 'Juan Pérez', status: 'Disponible', location: 'Quito Centro', color: 'bg-green-500' },
    { id: 2, name: 'Ana Gómez', status: 'En Viaje', location: 'Guayaquil - Norte', color: 'bg-amber-500' },
    { id: 3, name: 'Carlos Ruiz', status: 'Descanso', location: 'Cuenca', color: 'bg-gray-400' },
  ];

  return (
    <div className="w-full h-full min-h-[700px] flex flex-col bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative">
      {/* Header */}
      <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between z-10 relative">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Map className="w-6 h-6 text-blue-600 dark:text-blue-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Monitoreo de Flota</h2>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
          <Truck className="w-4 h-4" />
          <span>{drivers.length} Conductores Activos</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative w-full h-full">
        <iframe
          src="https://maps.google.com/maps?q=Ecuador&t=m&z=7&output=embed"
          className="absolute inset-0 w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Mapa de Ecuador"
        ></iframe>

        {/* Floating Panel */}
        <div className="absolute top-4 right-4 w-80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[calc(100%-2rem)]">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/50">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center">
              <Navigation className="w-4 h-4 mr-2 text-blue-500" />
              Conductores Conectados
            </h3>
          </div>
          
          <div className="overflow-y-auto p-4 space-y-3">
            {drivers.map(driver => (
              <div key={driver.id} className="flex items-start space-x-3 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                <div className="relative mt-1">
                  <div className={`w-3 h-3 rounded-full ${driver.color} ring-2 ring-white dark:ring-slate-800`}></div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{driver.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{driver.status}</p>
                  <div className="flex items-center mt-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-1.5 rounded">
                    <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                    <span className="truncate">{driver.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
