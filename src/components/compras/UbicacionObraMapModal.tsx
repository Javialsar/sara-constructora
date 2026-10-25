'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  MapPin, 
  Navigation, 
  X, 
  Check, 
  Crosshair, 
  Building2, 
  Compass, 
  Truck, 
  Info,
  Layers
} from 'lucide-react';
import { 
  CANTONES_ECUADOR, 
  CantonEcuador, 
  CoordenadasGPS, 
  GeoDistanceService 
} from '@/lib/services/geoDistanceService';

// Importación dinámica segura para SSR en Next.js App Router
const DynamicModalMap = dynamic(() => import('@/components/inmobiliaria/ModalMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] bg-slate-900 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400">
      <Compass className="w-8 h-8 text-amber-400 animate-spin" />
      <span className="text-xs font-mono">Cargando visualizador satelital OpenStreetMap...</span>
    </div>
  )
});

interface UbicacionObraMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  coordenadasIniciales: CoordenadasGPS;
  direccionInicial: string;
  referenciaInicial?: string;
  cantonActual: CantonEcuador;
  onConfirmarUbicacion: (datos: {
    coordenadas: CoordenadasGPS;
    direccion: string;
    referencia: string;
    canton: CantonEcuador;
  }) => void;
}

export default function UbicacionObraMapModal({
  isOpen,
  onClose,
  coordenadasIniciales,
  direccionInicial,
  referenciaInicial = '',
  cantonActual,
  onConfirmarUbicacion
}: UbicacionObraMapModalProps) {
  const [coords, setCoords] = useState<CoordenadasGPS>(coordenadasIniciales || { lat: -0.1807, lng: -78.4678 });
  const [direccion, setDireccion] = useState(direccionInicial || '');
  const [referencia, setReferencia] = useState(referenciaInicial || '');
  const [cantonDetectado, setCantonDetectado] = useState<CantonEcuador>(cantonActual);
  const [obteniendoGps, setObteniendoGps] = useState(false);
  const [mensajeGps, setMensajeGps] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCoords(coordenadasIniciales || { lat: -0.1807, lng: -78.4678 });
      setDireccion(direccionInicial || '');
      setReferencia(referenciaInicial || '');
      setCantonDetectado(cantonActual);
      setMensajeGps(null);
    }
  }, [isOpen, coordenadasIniciales, direccionInicial, referenciaInicial, cantonActual]);

  // Actualizar cantón automáticamente cuando cambian las coordenadas
  const handleMapCoordsChange = (lat: number, lng: number) => {
    const newCoords = { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
    setCoords(newCoords);
    const masCercano = GeoDistanceService.encontrarCantonMasCercano(newCoords);
    setCantonDetectado(masCercano);
  };

  // Obtener geolocalización del navegador del cliente
  const handleUsarMiUbicacion = () => {
    if (!navigator.geolocation) {
      setMensajeGps('Tu navegador no cuenta con servicio de GPS.');
      return;
    }
    setObteniendoGps(true);
    setMensajeGps('Detectando satélites GPS...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = {
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6))
        };
        setCoords(newCoords);
        const masCercano = GeoDistanceService.encontrarCantonMasCercano(newCoords);
        setCantonDetectado(masCercano);
        setObteniendoGps(false);
        setMensajeGps(`¡Ubicación fijada con éxito cerca de ${masCercano.nombre}!`);
        if (!direccion) {
          setDireccion(`Sector ${masCercano.nombre}, Obra / Punto de entrega`);
        }
      },
      (err) => {
        setObteniendoGps(false);
        setMensajeGps('No se pudo acceder a tu GPS. Por favor arrastra el marcador manualmente.');
      },
      { timeout: 9000, enableHighAccuracy: true }
    );
  };

  const handleConfirmar = () => {
    const finalDireccion = direccion.trim() || `Sector ${cantonDetectado.nombre}, Calles Principales`;
    onConfirmarUbicacion({
      coordenadas: coords,
      direccion: finalDireccion,
      referencia: referencia.trim(),
      canton: cantonDetectado
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Cabecera del Modal */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 shadow-inner">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Ubicación Exacta de Entrega en Obra
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  <Truck className="w-3 h-3" />
                  Ruteo MTOP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Mueve el marcador o haz clic en el mapa para ubicar el punto exacto de descarga de materiales
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo: División Mapa + Panel de Dirección */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Lado Izquierdo / Superior: Mapa Interactivo con Leaflet */}
          <div className="flex-1 min-h-[320px] sm:min-h-[420px] relative bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800">
            <DynamicModalMap
              lat={coords.lat}
              lng={coords.lng}
              onChange={handleMapCoordsChange}
            />

            {/* Controles flotantes sobre el mapa */}
            <div className="absolute top-3 left-3 z-[400] flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleUsarMiUbicacion}
                disabled={obteniendoGps}
                className="px-3 py-2 bg-slate-950/90 hover:bg-slate-900 text-amber-400 hover:text-amber-300 border border-amber-500/30 backdrop-blur-md rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all"
              >
                <Crosshair className={`w-3.5 h-3.5 ${obteniendoGps ? 'animate-spin' : ''}`} />
                <span>{obteniendoGps ? 'Detectando...' : '📍 Mi Ubicación GPS'}</span>
              </button>

              <div className="px-3 py-2 bg-slate-950/90 border border-slate-700/80 backdrop-blur-md rounded-xl text-[11px] font-mono text-slate-300 shadow-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}</span>
              </div>
            </div>

            {mensajeGps && (
              <div className="absolute bottom-3 left-3 right-3 z-[400] bg-slate-950/90 border border-amber-500/40 text-amber-300 text-xs px-3 py-2 rounded-xl backdrop-blur-md shadow-lg flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{mensajeGps}</span>
              </div>
            )}
          </div>

          {/* Lado Derecho: Formulario de Dirección Exacta y Datos de Logística */}
          <div className="w-full lg:w-96 p-5 sm:p-6 bg-slate-900 flex flex-col justify-between overflow-y-auto space-y-4">
            
            <div className="space-y-4">
              
              {/* Cantón detectado */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-amber-400" />
                  Cantón / Zona Logística:
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white">
                    {cantonDetectado.nombre} ({cantonDetectado.provincia})
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-mono">
                    {cantonDetectado.region}
                  </span>
                </div>
              </div>

              {/* Selector Rápido de Cantón para saltar en el mapa */}
              <div>
                <label className="text-[11px] font-mono font-bold uppercase text-slate-300 block mb-1.5">
                  Cambiar ciudad o cantón de referencia:
                </label>
                <select
                  value={cantonDetectado.id}
                  onChange={(e) => {
                    const sel = CANTONES_ECUADOR.find(c => c.id === e.target.value);
                    if (sel) {
                      setCantonDetectado(sel);
                      setCoords(sel.coordenadas);
                    }
                  }}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {CANTONES_ECUADOR.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.nombre} ({c.provincia}) - {c.region}
                    </option>
                  ))}
                </select>
              </div>

              {/* Input Dirección Exacta */}
              <div>
                <label className="text-[11px] font-mono font-bold uppercase text-slate-300 block mb-1.5">
                  Dirección Exacta (Calles e Intersección) *:
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej: Av. 10 de Agosto N34-120 y Colón, Lote 5"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Input Referencia de Obra */}
              <div>
                <label className="text-[11px] font-mono font-bold uppercase text-slate-300 block mb-1.5">
                  Referencia de Obra / Acceso para Camiones:
                </label>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Ej: Portón metálico azul, frente al parque, apto para volquetas"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Resumen de Coordenadas Guardadas */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-[11px] font-mono text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Coordenada Latitud:</span>
                  <span className="text-white font-bold">{coords.lat}</span>
                </div>
                <div className="flex justify-between">
                  <span>Coordenada Longitud:</span>
                  <span className="text-white font-bold">{coords.lng}</span>
                </div>
                <div className="flex justify-between text-amber-400 pt-1 border-t border-slate-800">
                  <span>Factor Vial MTOP:</span>
                  <span className="font-bold">1.35 (Sinuosidad Andina)</span>
                </div>
              </div>

            </div>

            {/* Botones de Acción */}
            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmar}
                className="flex-[2] py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar Ubicación</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
