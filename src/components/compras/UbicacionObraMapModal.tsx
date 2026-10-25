'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Layers,
  Search,
  Loader2
} from 'lucide-react';
import { 
  CANTONES_ECUADOR, 
  CantonEcuador, 
  CoordenadasGPS, 
  GeoDistanceService,
  ResultadoGeocodificacion
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
  const [ciudadTexto, setCiudadTexto] = useState(cantonActual?.nombre || 'Loja');
  const [calleTexto, setCalleTexto] = useState(direccionInicial || '');
  const [referencia, setReferencia] = useState(referenciaInicial || '');
  const [cantonDetectado, setCantonDetectado] = useState<CantonEcuador>(cantonActual);
  const [obteniendoGps, setObteniendoGps] = useState(false);
  const [mensajeGps, setMensajeGps] = useState<string | null>(null);

  // Estados para Geocodificación Automática (Ciudad + Calle -> Pin en Mapa)
  const [buscandoGeocode, setBuscandoGeocode] = useState(false);
  const [sugerenciasGeocode, setSugerenciasGeocode] = useState<ResultadoGeocodificacion[]>([]);
  const [geocodificacionFeedback, setGeocodificacionFeedback] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCoords(coordenadasIniciales || { lat: -0.1807, lng: -78.4678 });
      setCiudadTexto(cantonActual?.nombre || 'Loja');
      setCalleTexto(direccionInicial || '');
      setReferencia(referenciaInicial || '');
      setCantonDetectado(cantonActual);
      setMensajeGps(null);
      setSugerenciasGeocode([]);
      setGeocodificacionFeedback(null);
    }
  }, [isOpen, coordenadasIniciales, direccionInicial, referenciaInicial, cantonActual]);

  // Ejecutar Geocodificación Combinada: Ciudad + Calle -> Mover Marcador en el mapa en tiempo real
  const ejecutarGeocodificacionCombinada = async (ciudad: string, calle: string) => {
    const ciudadClean = ciudad.replace(/\([^)]*\)/g, '').trim();
    const calleClean = calle.trim();

    if (!ciudadClean && !calleClean) {
      setSugerenciasGeocode([]);
      setGeocodificacionFeedback(null);
      return;
    }

    setBuscandoGeocode(true);
    try {
      const textoBusqueda = calleClean || ciudadClean;
      const ciudadParam = calleClean ? ciudadClean : '';

      const resultados = await GeoDistanceService.geocodificarDireccionEcuador(
        textoBusqueda,
        ciudadParam
      );

      if (resultados && resultados.length > 0) {
        const principal = resultados[0];
        setCoords(principal.coordenadas);
        const nuevoCanton = GeoDistanceService.encontrarCantonMasCercano(principal.coordenadas);
        setCantonDetectado(nuevoCanton);
        setSugerenciasGeocode(resultados);
        setGeocodificacionFeedback(`Marcador ubicado: ${principal.nombreCorto}`);
      } else {
        setSugerenciasGeocode([]);
        // Si no se encontró la calle pero la ciudad es válida, mantener feedback de ciudad
        if (ciudadClean) {
          const matchCity = CANTONES_ECUADOR.find(c => 
            c.nombre.toLowerCase().includes(ciudadClean.toLowerCase()) || ciudadClean.toLowerCase().includes(c.nombre.toLowerCase())
          );
          if (matchCity) {
            setCoords(matchCity.coordenadas);
            setCantonDetectado(matchCity);
            setGeocodificacionFeedback(`Ubicado en ciudad: ${matchCity.nombre}`);
          } else {
            setGeocodificacionFeedback(null);
          }
        }
      }
    } catch (e) {
      // Ignorar error de red
    } finally {
      setBuscandoGeocode(false);
    }
  };

  // Manejador al tipear Ciudad (Autoubicación instantánea en el mapa en tiempo real)
  const handleCiudadChange = (nuevaCiudad: string) => {
    setCiudadTexto(nuevaCiudad);

    // Detección instantánea en el catálogo de cantones para mover el mapa sin esperar red
    const cleanInputCity = nuevaCiudad.replace(/\([^)]*\)/g, '').trim().toLowerCase();
    if (cleanInputCity.length >= 3) {
      const match = CANTONES_ECUADOR.find(c => {
        const cleanCName = c.nombre.replace(/\([^)]*\)/g, '').trim().toLowerCase();
        return cleanCName === cleanInputCity || cleanCName.includes(cleanInputCity) || cleanInputCity.includes(cleanCName);
      });
      if (match) {
        setCantonDetectado(match);
        setCoords(match.coordenadas);
        setGeocodificacionFeedback(`Ciudad ubicada: ${match.nombre} (${match.provincia})`);
      }
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      ejecutarGeocodificacionCombinada(nuevaCiudad, calleTexto);
    }, 300);
  };

  // Manejador al tipear Calle (Autoubicación en tiempo real en el mapa mientras se escribe)
  const handleCalleChange = (nuevaCalle: string) => {
    setCalleTexto(nuevaCalle);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      ejecutarGeocodificacionCombinada(ciudadTexto, nuevaCalle);
    }, 300);
  };

  // Manejador al tipear Referencia (Autoubicación si no hay calle)
  const handleReferenciaChange = (nuevaRef: string) => {
    setReferencia(nuevaRef);
    if (!calleTexto.trim() && nuevaRef.trim().length >= 4) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        ejecutarGeocodificacionCombinada(ciudadTexto, nuevaRef);
      }, 350);
    }
  };

  const handleSeleccionarSugerencia = (sug: ResultadoGeocodificacion) => {
    setCoords(sug.coordenadas);
    const nuevoCanton = GeoDistanceService.encontrarCantonMasCercano(sug.coordenadas);
    setCantonDetectado(nuevoCanton);
    if (sug.ciudad) setCiudadTexto(sug.ciudad);
    if (sug.calle) setCalleTexto(sug.calle);
    setGeocodificacionFeedback(`Marcador ubicado: ${sug.nombreCorto}`);
    setSugerenciasGeocode([]);
  };

  // Actualizar coordenadas y sincronizar ciudad/calle al tocar o arrastrar el marcador en el mapa
  const handleMapCoordsChange = async (lat: number, lng: number) => {
    const newCoords = { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
    setCoords(newCoords);
    const masCercano = GeoDistanceService.encontrarCantonMasCercano(newCoords);
    setCantonDetectado(masCercano);

    // Geocodificación inversa detallada para sincronizar inputs
    try {
      const rev = await GeoDistanceService.geocodificarInversoDetallado(newCoords);
      if (rev) {
        if (rev.ciudad) setCiudadTexto(rev.ciudad);
        if (rev.calle) setCalleTexto(rev.calle);
        setGeocodificacionFeedback(`Ubicación satelital: ${rev.direccionCompleta}`);
      }
    } catch (e) {
      // Fallback
    }
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
      async (pos) => {
        const newCoords = {
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6))
        };
        setCoords(newCoords);
        const masCercano = GeoDistanceService.encontrarCantonMasCercano(newCoords);
        setCantonDetectado(masCercano);
        setCiudadTexto(masCercano.nombre);
        setObteniendoGps(false);
        setMensajeGps(`¡Ubicación fijada con éxito en ${masCercano.nombre}!`);

        try {
          const rev = await GeoDistanceService.geocodificarInversoDetallado(newCoords);
          if (rev?.calle) setCalleTexto(rev.calle);
        } catch (e) {}
      },
      (err) => {
        setObteniendoGps(false);
        setMensajeGps('No se pudo acceder a tu GPS. Por favor escribe la ciudad y calle.');
      },
      { timeout: 9000, enableHighAccuracy: true }
    );
  };

  const handleConfirmar = () => {
    const finalDireccion = [calleTexto.trim(), ciudadTexto.trim()]
      .filter(Boolean)
      .join(', ') || `Sector ${cantonDetectado.nombre}, Calles Principales`;

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

              {/* CAMPO 1: INGRESO DE CIUDAD O CANTÓN */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase text-slate-300 block">
                    1. Ciudad o Cantón *:
                  </label>
                  {buscandoGeocode && (
                    <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Ubicando en mapa...</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    list="cantones-ecuador-datalist"
                    value={ciudadTexto}
                    onChange={(e) => handleCiudadChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
                        ejecutarGeocodificacionCombinada(ciudadTexto, calleTexto);
                      }
                    }}
                    placeholder="Escribe la ciudad: Loja, Quito, Cariamanga, Cuenca..."
                    className="w-full pl-3.5 pr-8 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <datalist id="cantones-ecuador-datalist">
                    {CANTONES_ECUADOR.map(c => (
                      <option key={c.id} value={c.nombre}>{c.provincia} ({c.region})</option>
                    ))}
                  </datalist>
                </div>
              </div>

              {/* CAMPO 2: INGRESO DE CALLE O INTERSECCIÓN */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase text-slate-300 block">
                    2. Calle(s) e Intersección *:
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    Se ubica automáticamente
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={calleTexto}
                    onChange={(e) => handleCalleChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
                        ejecutarGeocodificacionCombinada(ciudadTexto, calleTexto);
                      }
                    }}
                    placeholder="Ej: Cariamanga, atahualpa y Cristobal colon"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                {/* Badge de confirmación o feedback */}
                {geocodificacionFeedback && (
                  <div className="mt-1.5 text-[10px] font-mono text-emerald-400 flex items-center gap-1 bg-slate-950/80 p-1.5 rounded-lg border border-emerald-500/20">
                    <Check className="w-3 h-3 shrink-0 text-emerald-400" />
                    <span className="truncate">{geocodificacionFeedback}</span>
                  </div>
                )}

                {/* Desplegable de Sugerencias Múltiples */}
                {sugerenciasGeocode.length > 1 && (
                  <div className="mt-2 p-2 bg-slate-950 border border-amber-500/30 rounded-xl space-y-1 max-h-36 overflow-y-auto shadow-xl">
                    <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block px-1">
                      Lugares encontrados en {ciudadTexto || cantonDetectado.nombre}:
                    </span>
                    {sugerenciasGeocode.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSeleccionarSugerencia(sug)}
                        className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                      >
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">{sug.nombreCorto}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* CAMPO 3: REFERENCIA DE OBRA */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase text-slate-300 block">
                    3. Referencia de Obra / Acceso para Camiones:
                  </label>
                </div>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => handleReferenciaChange(e.target.value)}
                  placeholder="Ej: Cerca de la Unidad Educativa Ambato, frente al parque"
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
