'use client';

import React, { Suspense, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Package,
  Truck,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Wallet,
  Loader2,
  UserPlus,
} from 'lucide-react';
import {
  type FletesPerfil,
  FLETES_PERFIL_DESTINO,
  clearStoredFletesPerfil,
  getStoredFletesPerfil,
  setStoredFletesPerfil,
  subscribeFletesPerfil,
} from '@/lib/fletes/profilePreference';

const PERFILES: ReadonlyArray<{
  key: FletesPerfil;
  href: string;
  icon: typeof Package;
  eyebrow: string;
  title: string;
  description: string;
  bullets: ReadonlyArray<{ icon: typeof MapPin; text: string }>;
  cta: string;
  secondaryAuthHref: string;
  secondaryAuthPrompt: string;
  secondaryAuthLabel: string;
  accent: string;
  iconBox: string;
  ctaBox: string;
  secondaryLinkClass: string;
}> = [
  {
    key: 'cliente',
    href: '/modulos/fletes',
    icon: Package,
    eyebrow: 'Soy cliente',
    title: 'Quiero solicitar un flete',
    description:
      'Cotiza en segundos, recibe ofertas de conductores cercanos y rastrea tu carga en tiempo real.',
    bullets: [
      { icon: MapPin, text: 'Flete por viaje o renta por horas / días' },
      { icon: ShieldCheck, text: 'PIN de embarque y entrega verificada' },
    ],
    cta: 'Pedir un flete',
    secondaryAuthHref: '/modulos/fletes/auth?rol=cliente',
    secondaryAuthPrompt: '¿Deseas historial y facturación?',
    secondaryAuthLabel: 'Crear cuenta de cliente',
    accent: 'border-amber-500/40 hover:border-amber-400 hover:shadow-amber-500/20',
    iconBox: 'bg-amber-500 text-slate-950',
    ctaBox: 'bg-amber-500 text-slate-950 group-hover:bg-amber-400',
    secondaryLinkClass: 'text-amber-400 hover:text-amber-300',
  },
  {
    key: 'conductor',
    href: '/modulos/fletes/conductores',
    icon: Truck,
    eyebrow: 'Soy conductor',
    title: 'Quiero manejar y ganar',
    description:
      'Conéctate al radar SARA, acepta o contraoferta viajes y administra tus ganancias.',
    bullets: [
      { icon: Wallet, text: 'Billetera, recargas y cuentas bancarias' },
      { icon: ShieldCheck, text: 'Documentos y vehículo verificados MTOP' },
    ],
    cta: 'Ingresar como conductor',
    secondaryAuthHref: '/modulos/fletes/auth?rol=conductor',
    secondaryAuthPrompt: '¿Aún no eres conductor SARA?',
    secondaryAuthLabel: 'Regístrate con tu vehículo',
    accent: 'border-emerald-500/40 hover:border-emerald-400 hover:shadow-emerald-500/20',
    iconBox: 'bg-emerald-500 text-slate-950',
    ctaBox: 'bg-emerald-500 text-slate-950 group-hover:bg-emerald-400',
    secondaryLinkClass: 'text-emerald-400 hover:text-emerald-300',
  },
];

const getServerSnapshot = (): FletesPerfil | null => null;

function AutoRedirectGuard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forceChoose = searchParams.get('elegir') === '1';

  const storedPerfil = useSyncExternalStore(
    subscribeFletesPerfil,
    getStoredFletesPerfil,
    getServerSnapshot
  );

  useEffect(() => {
    if (forceChoose) {
      clearStoredFletesPerfil();
      return;
    }
    if (storedPerfil) {
      router.replace(FLETES_PERFIL_DESTINO[storedPerfil]);
    }
  }, [forceChoose, storedPerfil, router]);

  if (forceChoose || !storedPerfil) {
    return null;
  }

  const labelPerfil = storedPerfil === 'conductor' ? 'Conductor' : 'Cliente';

  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-6 rounded-2xl border border-amber-500/40 bg-slate-900/90 px-4 py-3 text-xs text-slate-200 flex items-center justify-between gap-3 shadow-lg"
    >
      <div className="flex items-center gap-2.5">
        <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
        <span>
          Entrando a tu app de <strong className="text-white">{labelPerfil}</strong>...
        </span>
      </div>
      <button
        type="button"
        onClick={() => clearStoredFletesPerfil()}
        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 shrink-0"
      >
        Elegir otro perfil
      </button>
    </div>
  );
}

export default function FletesProfileSelectorClient() {
  return (
    <>
      <Suspense fallback={null}>
        <AutoRedirectGuard />
      </Suspense>

      <div className="grid gap-5 md:grid-cols-2">
        {PERFILES.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.key}
              className={`relative flex flex-col rounded-3xl border bg-slate-900/70 p-6 sm:p-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl ${p.accent}`}
            >
              <Link
                href={p.href}
                onClick={() => setStoredFletesPerfil(p.key)}
                className="group flex-1 flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-2xl"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${p.iconBox}`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <p className="mt-5 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  {p.eyebrow}
                </p>
                <h2 className="font-display text-2xl font-black text-white mt-1">
                  {p.title}
                </h2>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  {p.description}
                </p>

                <ul className="mt-5 space-y-2">
                  {p.bullets.map((b) => {
                    const BIcon = b.icon;
                    return (
                      <li
                        key={b.text}
                        className="flex items-center gap-2 text-xs text-slate-300"
                      >
                        <BIcon className="w-4 h-4 text-slate-500 shrink-0" />
                        {b.text}
                      </li>
                    );
                  })}
                </ul>

                <span
                  className={`mt-7 min-h-[48px] inline-flex items-center justify-center gap-1.5 rounded-xl text-sm font-black transition-colors ${p.ctaBox}`}
                >
                  {p.cta}
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>

              <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-400">{p.secondaryAuthPrompt}</span>
                <Link
                  href={p.secondaryAuthHref}
                  onClick={() => setStoredFletesPerfil(p.key)}
                  className={`inline-flex items-center gap-1 font-bold underline-offset-2 hover:underline ${p.secondaryLinkClass}`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {p.secondaryAuthLabel}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-500 mt-8">
        ¿Aún no eres conductor SARA?{' '}
        <Link
          href="/modulos/fletes/auth?rol=conductor"
          className="font-bold text-emerald-400 hover:text-emerald-300 underline-offset-2 hover:underline"
        >
          Regístrate con tu vehículo
        </Link>
      </p>
    </>
  );
}
