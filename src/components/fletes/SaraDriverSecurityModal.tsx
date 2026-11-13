'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Award, 
  Calendar, 
  FileCheck2, 
  UserCheck, 
  X, 
  Truck, 
  PhoneCall, 
  Sparkles,
  MapPin
} from 'lucide-react';

export interface DriverSecurityProfile {
  id: string;
  driverName: string;
  plate: string;
  vehicleName: string;
  rating: number;
  phone?: string;
  licenseType: 'Tipo C' | 'Tipo D' | 'Tipo E';
  yearsExperience: number;
  tripsCount: number;
  antCertified: boolean;
  mtopRegistry: string;
  matriculaYear: number;
  cooperativeName?: string;
  insuranceActive: boolean;
  photoInitial?: string;
}

interface SaraDriverSecurityModalProps {
  driver: DriverSecurityProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestDriver?: (driver: DriverSecurityProfile) => void;
}

export function SaraDriverSecurityModal({
  driver,
  isOpen,
  onClose,
  onRequestDriver
}: SaraDriverSecurityModalProps) {
  if (!isOpen || !driver) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          title="Cerrar ficha"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cabecera del Conductor */}
        <div className="flex items-center gap-3.5 pt-1">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black text-xl shadow-inner shrink-0">
            {driver.photoInitial || driver.driverName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white truncate">{driver.driverName}</h3>
              <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                <ShieldCheck className="w-3 h-3" />
                MTOP OK
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5 flex items-center gap-1.5">
              <span>{driver.vehicleName}</span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                {driver.plate}
              </span>
            </p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
              <span className="text-amber-400 font-bold">★ {driver.rating.toFixed(1)}</span>
              <span>•</span>
              <span>{driver.tripsCount} viajes completados</span>
            </div>
          </div>
        </div>

        {/* Bloque de Verificación y Confianza ANT / MTOP */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-emerald-400" /> Licencia Profesional
            </span>
            <p className="font-bold text-white mt-0.5">{driver.licenseType}</p>
            <p className="text-[9px] text-emerald-400">Puntos ANT: 30/30</p>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-400" /> Experiencia en Obra
            </span>
            <p className="font-bold text-white mt-0.5">{driver.yearsExperience} años en carga</p>
            <p className="text-[9px] text-slate-400">Rutas Sierra y Costa</p>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block flex items-center gap-1">
              <FileCheck2 className="w-3 h-3 text-blue-400" /> Registro MTOP
            </span>
            <p className="font-mono text-xs font-bold text-slate-200 mt-0.5 truncate">{driver.mtopRegistry}</p>
            <p className="text-[9px] text-emerald-400">Habilitación vigente</p>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block flex items-center gap-1">
              <Award className="w-3 h-3 text-purple-400" /> Matrícula y Revisión
            </span>
            <p className="font-bold text-white mt-0.5">Año {driver.matriculaYear}</p>
            <p className="text-[9px] text-emerald-400">RTV Aprobada 2026</p>
          </div>
        </div>

        {/* Garantías de seguridad de SARA */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-3 text-xs space-y-1.5 text-slate-300">
          <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-[11px]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Garantías de Transporte SARA Enterprise</span>
          </div>
          <ul className="text-[10px] space-y-1 text-slate-400 list-disc list-inside">
            <li>Identidad biométrica y antecedentes validados ante la Policía Nacional.</li>
            <li>Seguro de carga activo contra daños en ruta de hasta $15,000 USD.</li>
            <li>Rastreo satelital GPS con telemetría MTOP y botón de pánico en cabina.</li>
          </ul>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 pt-1">
          {driver.phone && (
            <a
              href={`tel:${driver.phone}`}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Llamar
            </a>
          )}
          {onRequestDriver ? (
            <button
              type="button"
              onClick={() => {
                onRequestDriver(driver);
                onClose();
              }}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <Truck className="w-4 h-4 stroke-[2.5]" />
              Elegir este Transportista
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors"
            >
              Entendido
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
