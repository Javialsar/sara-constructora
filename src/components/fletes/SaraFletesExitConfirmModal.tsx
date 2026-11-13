'use client';

import React from 'react';
import { AlertCircle, LogOut, ArrowRight } from 'lucide-react';

interface SaraFletesExitConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirmExit: () => void;
  hasActiveTrip?: boolean;
}

export function SaraFletesExitConfirmModal({
  isOpen,
  onCancel,
  onConfirmExit,
  hasActiveTrip = false
}: SaraFletesExitConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-xl">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-black text-white">
            {hasActiveTrip ? '¿Seguro que deseas salir?' : '¿Guardar cotización y salir?'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {hasActiveTrip
              ? 'Tienes un flete en progreso. El seguimiento satelital continuará activo en segundo plano, pero perderás esta vista inmediata.'
              : 'Los datos de tu ruta, material y tarifa se mantendrán guardados para cuando regreses a SARA-FLETES.'}
          </p>
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            Continuar aquí
          </button>
          <button
            type="button"
            onClick={onConfirmExit}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            Salir
          </button>
        </div>
      </div>
    </div>
  );
}
