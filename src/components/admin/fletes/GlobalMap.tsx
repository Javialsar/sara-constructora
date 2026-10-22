'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Map, Truck, MapPin, Search, Filter, Star, CheckCircle, Navigation, Layers, RotateCcw } from 'lucide-react';
import dynamic from 'next/dynamic';
import { SaraFletesRealtimeService } from '@/lib/services/saraFletesRealtimeService';

const MapLeaflet = dynamic(() => import('./MapLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
      Cargando mapa satelital y flota en tiempo real...
    </div>
  )
});

export interface DriverMapItem {
  id: string | number;
  name: string;
  plan: 'VIP' | 'Estándar' | 'Basico';
  status: 'Disponible' | 'En Viaje';
  vehicle: string;
  plate: string;
  tipoVehiculo: string;
  latitud: number;
  longitud: number;
  pais: string;
  provincia: string;
  canton: string;
  ciudad: string;
  origen: string;
  destino: string;
  cliente: string;
}

// Flota nacional de transportistas calibrada con SARA Fletes
const INITIAL_DRIVERS: DriverMapItem[] = [
  { 
    id: 'FLT-06', 
    name: 'David Sarango', 
    plan: 'VIP', 
    status: 'Disponible', 
    vehicle: 'Camioneta Pickup 1.2T · SARA', 
    plate: 'LFA-9012', 
    tipoVehiculo: 'PICKUP_1T', 
    latitud: -4.3297, 
    longitud: -79.5586, 
    pais: 'Ecuador', 
    provincia: 'Loja', 
    canton: 'Calvas', 
    ciudad: 'Cariamanga', 
    origen: 'Cariamanga Centro', 
    destino: 'Zona Sur Calvas', 
    cliente: 'GRUPO SARA' 
  },
  { 
    id: 'FLT-01', 
    name: 'Manuel Cárdenas', 
    plan: 'VIP', 
    status: 'Disponible', 
    vehicle: 'Camioneta 1T', 
    plate: 'LBA-3421', 
    tipoVehiculo: 'PICKUP_1T', 
    latitud: -4.3267, 
    longitud: -79.5576, 
    pais: 'Ecuador', 
    provincia: 'Loja', 
    canton: 'Calvas', 
    ciudad: 'Cariamanga', 
    origen: 'Cariamanga', 
    destino: 'Lucero', 
    cliente: 'Ferretería Central' 
  },
  { 
    id: 'FLT-07', 
    name: 'Pedro Jimbo', 
    plan: 'Estándar', 
    status: 'Disponible', 
    vehicle: 'Furgón 3T Urbano', 
    plate: 'LGA-6543', 
    tipoVehiculo: 'FURGON_3T', 
    latitud: -4.3305, 
    longitud: -79.5588, 
    pais: 'Ecuador', 
    provincia: 'Loja', 
    canton: 'Calvas', 
    ciudad: 'Cariamanga', 
    origen: 'N/A', 
    destino: 'N/A', 
    cliente: '' 
  },
  { 
    id: 'FLT-02', 
    name: 'Carlos Mendoza', 
    plan: 'Estándar', 
    status: 'En Viaje', 
    vehicle: 'Camión Hino 5T', 
    plate: 'PBA-1234', 
    tipoVehiculo: 'CAMION_5T', 
    latitud: -0.1807, 
    longitud: -78.4678, 
    pais: 'Ecuador', 
    provincia: 'Pichincha', 
    canton: 'Quito', 
    ciudad: 'Quito', 
    origen: 'Quito Centro', 
    destino: 'Valle de Tumbaco', 
    cliente: 'Constructora Atlas S.A.' 
  },
  { 
    id: 'FLT-03', 
    name: 'Luis Toapanta', 
    plan: 'Basico', 
    status: 'Disponible', 
    vehicle: 'Furgoneta 3.5T Urbano', 
    plate: 'GCA-9876', 
    tipoVehiculo: 'FURGON_3T', 
    latitud: -2.1962, 
    longitud: -79.8862, 
    pais: 'Ecuador', 
    provincia: 'Guayas', 
    canton: 'Guayaquil', 
    ciudad: 'Guayaquil', 
    origen: 'N/A', 
    destino: 'N/A', 
    cliente: '' 
  },
  { 
    id: 'FLT-08', 
    name: 'Juan Pérez', 
    plan: 'VIP', 
    status: 'En Viaje', 
    vehicle: 'Camión Hino 5T', 
    plate: 'PCX-2041', 
    tipoVehiculo: 'CAMION_5T', 
    latitud: -0.2200, 
    longitud: -78.5100, 
    pais: 'Ecuador', 
    provincia: 'Pichincha', 
    canton: 'Quito', 
    ciudad: 'Quito', 
    origen: 'Av. Galo Plaza Lasso', 
    destino: 'Calderón', 
    cliente: 'Hormigonera Andina' 
  },
  { 
    id: 'FLT-04', 
    name: 'Mario López', 
    plan: 'VIP', 
    status: 'Disponible', 
    vehicle: 'Tráiler 20T', 
    plate: 'MAB-5544', 
    tipoVehiculo: 'TRACTO_3S3', 
    latitud: -1.0546, 
    longitud: -80.4545, 
    pais: 'Ecuador', 
    provincia: 'Manabí', 
    canton: 'Portoviejo', 
    ciudad: 'Portoviejo', 
    origen: 'N/A', 
    destino: 'N/A', 
    cliente: '' 
  },
  { 
    id: 'FLT-09', 
    name: 'Ana Gómez', 
    plan: 'Estándar', 
    status: 'Disponible', 
    vehicle: 'Furgoneta 1.5T', 
    plate: 'GBC-9876', 
    tipoVehiculo: 'FURGON_3T', 
    latitud: -2.1500, 
    longitud: -79.9200, 
    pais: 'Ecuador', 
    provincia: 'Guayas', 
    canton: 'Guayaquil', 
    ciudad: 'Guayaquil', 
    origen: 'N/A', 
    destino: 'N/A', 
    cliente: '' 
  },
  { 
    id: 'FLT-10', 
    name: 'Sofía Vélez', 
    plan: 'Estándar', 
    status: 'En Viaje', 
    vehicle: 'Camión 10T', 
    plate: 'XCA-9988', 
    tipoVehiculo: 'CAMION_10T', 
    latitud: -0.2507, 
    longitud: -78.5278, 
    pais: 'Ecuador', 
    provincia: 'Pichincha', 
    canton: 'Quito', 
    ciudad: 'Quito', 
    origen: 'Sur de Quito', 
    destino: 'Machachi', 
    cliente: 'Supermercados La Favorita' 
  },
  { 
    id: 'FLT-11', 
    name: 'Carlos Ruiz', 
    plan: 'Basico', 
    status: 'En Viaje', 
    vehicle: 'Camioneta 4x4', 
    plate: 'PBB-1122', 
    tipoVehiculo: 'PICKUP_1T', 
    latitud: -2.9001, 
    longitud: -79.0059, 
    pais: 'Ecuador', 
    provincia: 'Azuay', 
    canton: 'Cuenca', 
    ciudad: 'Cuenca', 
    origen: 'Cuenca', 
    destino: 'Azogues', 
    cliente: 'Ferretería El Hierro' 
  },
  { 
    id: 'FLT-05', 
    name: 'Jorge Encalada', 
    plan: 'VIP', 
    status: 'Disponible', 
    vehicle: 'Volqueta V3A 14m³', 
    plate: 'ODA-5512', 
    tipoVehiculo: 'VOLQUETA_V3A', 
    latitud: -3.2600, 
    longitud: -79.9600, 
    pais: 'Ecuador', 
    provincia: 'El Oro', 
    canton: 'Machala', 
    ciudad: 'Machala', 
    origen: 'N/A', 
    destino: 'N/A', 
    cliente: '' 
  },
  { 
    id: 'FLT-12', 
    name: 'Marco Vinicio Guamán', 
    plan: 'VIP', 
    status: 'Disponible', 
    vehicle: 'Tractocamión 3S3 30T', 
    plate: 'LEA-4321', 
    tipoVehiculo: 'TRACTO_3S3', 
    latitud: -3.9931, 
    longitud: -79.2042, 
    pais: 'Ecuador', 
    provincia: 'Loja', 
    canton: 'Loja', 
    ciudad: 'Loja', 
    origen: 'N/A', 
    destino: 'N/A', 
    cliente: '' 
  }
];

// Nomenclátor Cantonal por Provincia del Ecuador
const CANTONES_POR_PROVINCIA: Record<string, string[]> = {
  'Loja': ['Todos los Cantones', 'Calvas', 'Loja', 'Catamayo', 'Macará', 'Paltas', 'Gonzanamá', 'Celica', 'Saraguro', 'Espíndola', 'Puyango', 'Zapotillo', 'Pindal', 'Chaguarpamba', 'Quilanga', 'Sozoranga', 'Olmedo'],
  'Pichincha': ['Todos los Cantones', 'Quito', 'Rumiñahui', 'Mejía', 'Cayambe', 'Pedro Moncayo', 'San Miguel de los Bancos', 'Pedro Vicente Maldonado', 'Puerto Quito'],
  'Guayas': ['Todos los Cantones', 'Guayaquil', 'Samborondón', 'Daule', 'Durán', 'Milagro', 'Salitre', 'Playas', 'Balao', 'Balzar', 'Colimes', 'El Empalme', 'El Triunfo', 'Naranjal', 'Naranjito', 'Palestina', 'Pedro Carbo', 'Santa Lucía', 'Yaguachi'],
  'Azuay': ['Todos los Cantones', 'Cuenca', 'Gualaceo', 'Paute', 'Santa Isabel', 'Chordeleg', 'Girón', 'Nabón', 'Sigsig', 'Pucará', 'San Fernando'],
  'Manabí': ['Todos los Cantones', 'Portoviejo', 'Manta', 'Chone', 'Montecristi', 'Jipijapa', 'Sucre', 'Pedernales', 'El Carmen', 'Bolívar', 'Rocafuerte', 'Tosagua', 'Flavio Alfaro', 'Paján', 'Puerto López', 'Santa Ana'],
  'Tungurahua': ['Todos los Cantones', 'Ambato', 'Baños de Agua Santa', 'Pelileo', 'Píllaro', 'Cevallos', 'Mocha', 'Quero', 'Tisaleo'],
  'El Oro': ['Todos los Cantones', 'Machala', 'Pasaje', 'Santa Rosa', 'Arenillas', 'Piñas', 'Zaruma', 'Huaquillas', 'Balsas', 'Chilla', 'El Guabo', 'Marcabelí', 'Portovelo'],
  'Santo Domingo': ['Todos los Cantones', 'Santo Domingo', 'La Concordia'],
  'Chimborazo': ['Todos los Cantones', 'Riobamba', 'Guano', 'Alausí', 'Colta', 'Chambo', 'Cumandá', 'Pallatanga'],
  'Imbabura': ['Todos los Cantones', 'Ibarra', 'Otavalo', 'Cotacachi', 'Antonio Ante', 'Pimampiro', 'Urcuquí'],
  'Cotopaxi': ['Todos los Cantones', 'Latacunga', 'La Maná', 'Pujilí', 'Salcedo', 'Saquisilí', 'Sigchos'],
  'Esmeraldas': ['Todos los Cantones', 'Esmeraldas', 'Atacames', 'Quinindé', 'San Lorenzo', 'Muisne'],
  'Los Ríos': ['Todos los Cantones', 'Babahoyo', 'Quevedo', 'Ventanas', 'Vinces', 'Buena Fe', 'Montalvo'],
  'Santa Elena': ['Todos los Cantones', 'Santa Elena', 'Salinas', 'La Libertad'],
  'Carchi': ['Todos los Cantones', 'Tulcán', 'Montúfar', 'Espejo', 'Mira', 'Bolívar', 'San Pedro de Huaca'],
  'Cañar': ['Todos los Cantones', 'Azogues', 'Cañar', 'La Troncal', 'Biblián'],
  'Pastaza': ['Todos los Cantones', 'Pastaza (Puyo)', 'Mera', 'Santa Clara', 'Arajuno'],
  'Morona Santiago': ['Todos los Cantones', 'Morona (Macas)', 'Gualaquiza', 'Sucúa', 'Limón Indanza'],
  'Napo': ['Todos los Cantones', 'Tena', 'Archidona', 'El Chaco', 'Quijos'],
  'Zamora Chinchipe': ['Todos los Cantones', 'Zamora', 'Yantzaza', 'Centinela del Cóndor', 'El Pangui'],
  'Sucumbíos': ['Todos los Cantones', 'Lago Agrio (Nueva Loja)', 'Shushufindi', 'Cuyabeno', 'Putumayo'],
  'Bolívar': ['Todos los Cantones', 'Guaranda', 'Caluma', 'Chimbo', 'Echeandía', 'San Miguel'],
  'Galápagos': ['Todos los Cantones', 'San Cristóbal', 'Santa Cruz', 'Isabela']
};

const PROVINCIAS_ECUADOR = [
  'Todas', 'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro', 'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja', 'Los Ríos', 'Manabí', 'Morona Santiago', 'Napo', 'Pastaza', 'Pichincha', 'Santa Elena', 'Santo Domingo', 'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe'
];

const TIPOS_VEHICULOS = [
  { value: 'TODOS', label: 'Todos los Tipos de Vehículo' },
  { value: 'PICKUP_1T', label: 'Camioneta Pickup (1T - 1.2T)' },
  { value: 'FURGON_3T', label: 'Furgoneta / Furgón (1.5T - 3.5T)' },
  { value: 'CAMION_5T', label: 'Camión Mediano (5T)' },
  { value: 'CAMION_10T', label: 'Camión Pesado (10T)' },
  { value: 'VOLQUETA_V3A', label: 'Volqueta (14m³ / 27T)' },
  { value: 'TRACTO_3S3', label: 'Tráiler / Mula (20T - 30T)' }
];

export default function GlobalMap() {
  const [drivers, setDrivers] = useState<DriverMapItem[]>(INITIAL_DRIVERS);
  const [selectedDriver, setSelectedDriver] = useState<DriverMapItem | null>(null);

  // Filtros Avanzados
  const [searchConductor, setSearchConductor] = useState('');
  const [searchPlaca, setSearchPlaca] = useState('');
  const [provincia, setProvincia] = useState('Todas');
  const [canton, setCanton] = useState('Todos los Cantones');
  const [ciudad, setCiudad] = useState('');
  const [tipoVehiculo, setTipoVehiculo] = useState('TODOS');
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'Disponible' | 'En Viaje'>('TODOS');

  // Sincronización en tiempo real con SARA Fletes
  useEffect(() => {
    // 1. Verificar si hay un despacho aceptado guardado
    const accepted = SaraFletesRealtimeService.getAcceptedDispatch();
    const activeReq = SaraFletesRealtimeService.getActiveRequest();

    if (accepted) {
      setDrivers(prev => prev.map(d => {
        if (d.name.toLowerCase().includes(accepted.driverName.toLowerCase()) || d.plate === accepted.plate) {
          return {
            ...d,
            status: 'En Viaje',
            origen: activeReq?.origen || d.origen,
            destino: activeReq?.destino || d.destino,
            cliente: activeReq?.clienteNombre || 'Cliente SARA Fletes'
          };
        }
        return d;
      }));
    }

    // 2. Suscribirse a eventos en vivo del bus SARA Fletes
    const unsub = SaraFletesRealtimeService.subscribe((evt) => {
      if (evt.type === 'CLIENTE_ACEPTO_CONDUCTOR') {
        const payload = evt.payload;
        setDrivers(prev => prev.map(d => {
          if (d.name.toLowerCase().includes(payload.driverName.toLowerCase()) || d.plate === payload.plate) {
            return {
              ...d,
              status: 'En Viaje',
              origen: activeReq?.origen || 'Punto de Carga',
              destino: activeReq?.destino || 'Punto de Entrega',
              cliente: 'Cliente SARA Fletes'
            };
          }
          return d;
        }));
      } else if (evt.type === 'CANCELAR_SOLICITUD_FLETE' || evt.type === 'FLETE_COMPLETADO') {
        setDrivers(prev => prev.map(d => ({ ...d, status: 'Disponible' })));
      }
    });

    return () => unsub();
  }, []);

  // Lista de cantones reactiva según la provincia seleccionada
  const cantonesDisponibles = useMemo(() => {
    if (provincia === 'Todas' || !CANTONES_POR_PROVINCIA[provincia]) {
      return ['Todos los Cantones', 'Calvas', 'Loja', 'Quito', 'Guayaquil', 'Cuenca', 'Portoviejo', 'Machala', 'Ambato'];
    }
    return CANTONES_POR_PROVINCIA[provincia];
  }, [provincia]);

  // Manejo de cambio de provincia
  const handleProvinciaChange = (p: string) => {
    setProvincia(p);
    setCanton('Todos los Cantones');
  };

  // Restablecer filtros
  const handleResetFilters = () => {
    setSearchConductor('');
    setSearchPlaca('');
    setProvincia('Todas');
    setCanton('Todos los Cantones');
    setCiudad('');
    setTipoVehiculo('TODOS');
    setFiltroEstado('TODOS');
    setSelectedDriver(null);
  };

  // Filtrado reactivo multidimensional
  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => {
      // 1. Filtro por Conductor
      if (searchConductor && !d.name.toLowerCase().includes(searchConductor.toLowerCase())) {
        return false;
      }

      // 2. Filtro por Placa
      if (searchPlaca && !d.plate.toLowerCase().replace('-', '').includes(searchPlaca.toLowerCase().replace('-', ''))) {
        return false;
      }

      // 3. Filtro por Provincia
      if (provincia !== 'Todas' && d.provincia.toLowerCase() !== provincia.toLowerCase()) {
        return false;
      }

      // 4. Filtro por Cantón
      if (canton !== 'Todos los Cantones') {
        const cleanCanton = canton.split(' ')[0].toLowerCase();
        if (!d.canton.toLowerCase().includes(cleanCanton)) return false;
      }

      // 5. Filtro por Ciudad / Parroquia
      if (ciudad && !d.ciudad.toLowerCase().includes(ciudad.toLowerCase()) && !d.canton.toLowerCase().includes(ciudad.toLowerCase())) {
        return false;
      }

      // 6. Filtro por Tipo de Vehículo
      if (tipoVehiculo !== 'TODOS' && d.tipoVehiculo !== tipoVehiculo) {
        return false;
      }

      // 7. Filtro por Estado
      if (filtroEstado !== 'TODOS' && d.status !== filtroEstado) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const planOrder: Record<string, number> = { 'VIP': 1, 'Estándar': 2, 'Basico': 3 };
      return (planOrder[a.plan] || 99) - (planOrder[b.plan] || 99);
    });
  }, [drivers, searchConductor, searchPlaca, provincia, canton, ciudad, tipoVehiculo, filtroEstado]);

  return (
    <div className="w-full h-full min-h-[850px] flex flex-col bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative">
      
      {/* Header & Advanced Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-10 relative space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/60 rounded-xl">
              <Map className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Monitoreo Avanzado de Flota
                <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                  Sincronizado SARA Fletes
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Filtros multidimensionales por provincia, cantón, ciudad, conductor, placa y tipo de vehículo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Limpiar Filtros
            </button>
            <div className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-3.5 py-1.5 rounded-xl font-bold border border-slate-200 dark:border-slate-700">
              <Truck className="w-4 h-4 text-emerald-500" />
              <span>{filteredDrivers.length} de {drivers.length} Vehículos</span>
            </div>
          </div>
        </div>

        {/* Multi-Criteria Filter Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 pt-1">
          {/* 1. Conductor */}
          <div className="relative">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
              Conductor
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Ej. David Sarango" 
                value={searchConductor}
                onChange={(e) => setSearchConductor(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* 2. Placa */}
          <div className="relative">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
              Nro de Placa
            </label>
            <input 
              type="text" 
              placeholder="Ej. LFA-9012" 
              value={searchPlaca}
              onChange={(e) => setSearchPlaca(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 uppercase"
            />
          </div>

          {/* 3. Provincia */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
              Provincia
            </label>
            <select 
              value={provincia} 
              onChange={(e) => handleProvinciaChange(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            >
              {PROVINCIAS_ECUADOR.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* 4. Cantón */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
              Cantón
            </label>
            <select 
              value={canton} 
              onChange={(e) => setCanton(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            >
              {cantonesDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* 5. Ciudad / Parroquia */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
              Ciudad / Parroquia
            </label>
            <input 
              type="text" 
              placeholder="Ej. Cariamanga" 
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* 6. Tipo de Vehículo */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
              Tipo de Vehículo
            </label>
            <select 
              value={tipoVehiculo} 
              onChange={(e) => setTipoVehiculo(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            >
              {TIPOS_VEHICULOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area (Map + Live Directory) */}
      <div className="flex-1 flex flex-col md:flex-row w-full h-full relative overflow-hidden">
        
        {/* Map Container */}
        <div className="flex-1 relative w-full h-full bg-slate-200 dark:bg-slate-900 z-0">
          <MapLeaflet drivers={filteredDrivers} selectedDriver={selectedDriver} />
        </div>

        {/* Sidebar Panel for Drivers Directory */}
        <div className="w-full md:w-88 h-full bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col z-10 shadow-2xl overflow-hidden md:relative absolute right-0 top-0 max-md:max-h-[50%] max-md:bottom-0 max-md:top-auto">
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center text-xs uppercase tracking-wide">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
              Directorio en Tiempo Real
            </h3>
            <span className="text-[11px] text-slate-500 font-mono font-bold">
              {filteredDrivers.length} unidades
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
            {filteredDrivers.map(driver => {
              const isSelected = selectedDriver?.id === driver.id;
              return (
                <div 
                  key={driver.id} 
                  onClick={() => setSelectedDriver(driver)}
                  className={`flex flex-col p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-md ring-2 ring-indigo-500/20' 
                      : driver.plan === 'VIP' 
                        ? 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/50 hover:border-amber-400' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${driver.status === 'En Viaje' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                      <p className="font-black text-slate-900 dark:text-slate-100 text-xs truncate">{driver.name}</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center ${
                      driver.plan === 'VIP' 
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300' 
                        : driver.plan === 'Estándar' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300' 
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {driver.plan === 'VIP' && <Star className="w-2.5 h-2.5 mr-1 fill-amber-500" />}
                      {driver.plan}
                    </span>
                  </div>
                  
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold truncate">
                        <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {driver.vehicle}
                      </span>
                      <span className="font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/60">
                        {driver.plate}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">
                        <strong>{driver.canton}</strong> ({driver.ciudad}), {driver.provincia}
                      </span>
                    </div>

                    {driver.status === 'En Viaje' && (
                      <div className="mt-1 p-1.5 bg-amber-50 dark:bg-amber-950/40 rounded border border-amber-200 dark:border-amber-900/60 text-[10px]">
                        <p className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                          Viaje en Curso: {driver.origen} → {driver.destino}
                        </p>
                        {driver.cliente && (
                          <p className="text-slate-600 dark:text-slate-400 text-[9px] mt-0.5 truncate">
                            Cliente: {driver.cliente}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {filteredDrivers.length === 0 && (
              <div className="text-center py-10 text-slate-500 text-xs flex flex-col items-center">
                <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="font-bold text-slate-700 dark:text-slate-300">No se encontraron transportistas</p>
                <p className="text-[11px] text-slate-400 mt-1">Prueba cambiando la provincia, cantón o vehículo.</p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-3 bg-slate-900 dark:bg-slate-700 text-white font-bold px-3 py-1 rounded-lg text-xs hover:bg-indigo-600 transition-colors"
                >
                  Restablecer Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
