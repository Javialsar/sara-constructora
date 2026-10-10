'use client';
import React, { useState, useMemo } from 'react';
import { Map, Navigation, Truck, MapPin, Search, Filter, Star } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapLeaflet = dynamic(() => import('./MapLeaflet'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500">Cargando mapa interactivo...</div>
});

const MOCK_DRIVERS = [
  { id: 1, name: 'Juan Pérez', plan: 'VIP', status: 'En Viaje', vehicle: 'Camión Hino 5T', plate: 'PBA-1234', latitud: -0.1807, longitud: -78.4678, pais: 'Ecuador', provincia: 'Pichincha', ciudad: 'Quito', origen: 'Quito Centro', destino: 'Valle de Tumbaco', cliente: 'Constructora Atlas S.A.' },
  { id: 2, name: 'Ana Gómez', plan: 'Estándar', status: 'Disponible', vehicle: 'Furgoneta', plate: 'GBC-9876', latitud: -2.1962, longitud: -79.8862, pais: 'Ecuador', provincia: 'Guayas', ciudad: 'Guayaquil', origen: 'N/A', destino: 'N/A', cliente: '' },
  { id: 3, name: 'Carlos Ruiz', plan: 'Basico', status: 'En Viaje', vehicle: 'Camioneta 4x4', plate: 'PBB-1122', latitud: -2.9001, longitud: -79.0059, pais: 'Ecuador', provincia: 'Azuay', ciudad: 'Cuenca', origen: 'Cuenca', destino: 'Azogues', cliente: 'Ferretería El Hierro' },
  { id: 4, name: 'Mario López', plan: 'VIP', status: 'Disponible', vehicle: 'Tráiler 20T', plate: 'MAB-5544', latitud: -1.0546, longitud: -80.4545, pais: 'Ecuador', provincia: 'Manabí', ciudad: 'Portoviejo', origen: 'N/A', destino: 'N/A', cliente: '' },
  { id: 5, name: 'Sofia Velez', plan: 'Estándar', status: 'En Viaje', vehicle: 'Camión 10T', plate: 'XCA-9988', latitud: -0.2507, longitud: -78.5278, pais: 'Ecuador', provincia: 'Pichincha', ciudad: 'Quito', origen: 'Sur de Quito', destino: 'Machachi', cliente: 'Supermercados La Favorita' }
];

export default function GlobalMap() {
  const [pais, setPais] = useState('Ecuador');
  const [provincia, setProvincia] = useState('Todas');
  const [ciudad, setCiudad] = useState('');
  const [search, setSearch] = useState('');

  const filteredDrivers = useMemo(() => {
    let result = MOCK_DRIVERS;
    if (pais && pais !== 'Todos') result = result.filter(d => d.pais === pais);
    if (provincia && provincia !== 'Todas') result = result.filter(d => d.provincia === provincia);
    if (ciudad) result = result.filter(d => d.ciudad.toLowerCase().includes(ciudad.toLowerCase()));
    if (search) result = result.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.plate.toLowerCase().includes(search.toLowerCase()));
    
    // Sort by Plan: VIP first, then Estándar, then Basico
    const planOrder: Record<string, number> = { 'VIP': 1, 'Estándar': 2, 'Basico': 3 };
    result.sort((a, b) => (planOrder[a.plan] || 99) - (planOrder[b.plan] || 99));
    
    return result;
  }, [pais, provincia, ciudad, search]);

  const provinciasList = ['Todas', 'Pichincha', 'Guayas', 'Azuay', 'Manabí', 'Tungurahua', 'Loja'];

  return (
    <div className="w-full h-full min-h-[800px] flex flex-col bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative">
      
      {/* Header & Filters */}
      <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-10 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <Map className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Monitoreo Avanzado de Flota</h2>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-full font-medium">
            <Truck className="w-4 h-4 text-emerald-500" />
            <span>{filteredDrivers.length} Conductores Filtrados</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por conductor o placa..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <select 
              value={pais} 
              onChange={(e) => setPais(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Todos">Todos los países</option>
              <option value="Ecuador">Ecuador</option>
              <option value="Colombia">Colombia</option>
              <option value="Peru">Perú</option>
            </select>
          </div>
          <div>
            <select 
              value={provincia} 
              onChange={(e) => setProvincia(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {provinciasList.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <input 
              type="text" 
              placeholder="Ciudad (Ej. Quito)" 
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row w-full h-full relative overflow-hidden">
        
        {/* Map Container */}
        <div className="flex-1 relative w-full h-full bg-slate-200 dark:bg-slate-900 z-0">
          <MapLeaflet drivers={filteredDrivers} />
        </div>

        {/* Sidebar Panel for Drivers */}
        <div className="w-full md:w-80 h-full bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col z-10 shadow-xl overflow-hidden md:relative absolute right-0 top-0 max-md:max-h-[50%] max-md:bottom-0 max-md:top-auto">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center text-sm">
              <Filter className="w-4 h-4 mr-2 text-indigo-500" />
              Directorio en Tiempo Real
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {filteredDrivers.map(driver => (
              <div key={driver.id} className={`flex flex-col p-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm border ${driver.plan === 'VIP' ? 'border-amber-200 dark:border-amber-900/50 hover:border-amber-400' : 'border-slate-100 dark:border-slate-700 hover:border-indigo-200'} transition-all cursor-pointer`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <div className={`w-2.5 h-2.5 rounded-full mr-2 ${driver.status === 'En Viaje' ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{driver.name}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center ${driver.plan === 'VIP' ? 'bg-amber-100 text-amber-700' : driver.plan === 'Estándar' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                    {driver.plan === 'VIP' && <Star className="w-3 h-3 mr-1 fill-amber-500" />}
                    {driver.plan}
                  </span>
                </div>
                
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <div className="flex items-center">
                    <Truck className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    {driver.vehicle} <span className="mx-1 text-slate-300">•</span> <span className="font-mono">{driver.plate}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    <span className="truncate">{driver.ciudad}, {driver.provincia}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredDrivers.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm flex flex-col items-center">
                <Search className="w-8 h-8 text-slate-300 mb-2" />
                <p>No se encontraron conductores<br/>con estos filtros.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
