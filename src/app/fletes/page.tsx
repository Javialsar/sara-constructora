import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ModuleBrandLogo from '@/components/layout/ModuleBrandLogo';
import FletesProfileSelectorClient from '@/components/fletes/FletesProfileSelectorClient';

export const metadata: Metadata = {
  title: 'SARA-FLETES | ¿Cómo quieres usar SARA-FLETES?',
  description:
    'Elige tu perfil: solicita fletes y renta de vehículos como cliente, o recibe viajes y administra tu billetera como conductor SARA-FLETES.',
};

/**
 * Selector de perfil de SARA-FLETES (estilo Uber / DiDi / inDrive).
 * Separa de forma explícita las dos apps para que el cliente nunca
 * termine en el panel del conductor y viceversa:
 *   - Cliente   → /modulos/fletes            (cotizador y solicitud de viajes)
 *   - Conductor → /modulos/fletes/mi-perfil  (radar, viajes y billetera; protegido por sesión)
 */
export default function FletesSelectorPerfil() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="h-16 px-4 sm:px-8 flex items-center justify-between border-b border-slate-800/80">
        <ModuleBrandLogo modulo="fletes" size="sm" showBackToHolding={false} />
        <Link
          href="/"
          className="min-h-[44px] inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white px-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Grupo SARA
        </Link>
      </header>

      <section className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-16 flex flex-col justify-center">
        <div className="text-center mb-10">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-400">
            SARA-FLETES
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-white mt-2">
            ¿Cómo quieres usar SARA-FLETES?
          </h1>
          <p className="text-sm text-slate-400 mt-3 max-w-xl mx-auto">
            Elige tu perfil para entrar directamente a tu app. Puedes cambiarlo en cualquier momento.
          </p>
        </div>

        <FletesProfileSelectorClient />
      </section>
    </main>
  );
}
