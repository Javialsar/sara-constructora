'use client';

import React, { Suspense, useState } from 'react';
import {
  Mail,
  Lock,
  User,
  ChevronRight,
  AlertCircle,
  Phone,
  Eye,
  EyeOff,
  Navigation,
  Truck,
  Radio,
  Wallet,
  ShieldCheck,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  type FletesAuthRole,
  isTransportistaFromMetadata,
  resolveInitialAuthRole,
  resolvePostAuthRedirect,
} from '@/lib/fletes/profilePreference';
import { GOBEE_BRAND } from '@/lib/gobee/gobeeTypes';

const AUTOFILL_DARK_CLASS =
  '[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#090f1d] [&:-webkit-autofill]:[-webkit-text-fill-color:#f8fafc] [&:-webkit-autofill]:caret-white';

function GobeeAuthForm() {
  const searchParams = useSearchParams();
  const rolQuery = searchParams.get('rol');
  const redirectToQuery = searchParams.get('redirectTo');

  const initialRole = resolveInitialAuthRole(rolQuery);

  const [isLogin, setIsLogin] = useState(true);
  const [userRoleOverride, setUserRoleOverride] = useState<FletesAuthRole | null>(null);
  const userRole: FletesAuthRole = userRoleOverride ?? initialRole;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [placa, setPlaca] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const isDriverMode = userRole === 'transportista';

  const navigateWithFreshSession = (destination: string) => {
    // Navegación completa para que src/proxy.ts reciba las cookies de sesión recién emitidas
    if (typeof window !== 'undefined') {
      window.location.assign(destination);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;

        const appMeta = data.user?.app_metadata as Record<string, unknown> | undefined;
        const userMeta = data.user?.user_metadata as Record<string, unknown> | undefined;

        const explicitClientRole =
          String(appMeta?.role || userMeta?.role || '').toLowerCase() === 'cliente_fletes';

        // Si el usuario ingresa desde el portal de conductor (?rol=conductor) y no está restringido como cliente_fletes,
        // permitir acceso directo al dashboard de conductores.
        const isTransportista =
          isTransportistaFromMetadata(appMeta, userMeta) ||
          (isDriverMode && !explicitClientRole);

        const destination = resolvePostAuthRedirect(redirectToQuery, isTransportista);
        navigateWithFreshSession(destination);
      } else {
        if (isDriverMode && (!nombre.trim() || !placa.trim())) {
          throw new Error('Ingresa tu nombre completo y la placa del vehículo.');
        }
        if (!isDriverMode && !nombre.trim()) {
          throw new Error('Ingresa tu nombre completo.');
        }

        const response = await fetch('/api/auth/register-fletes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password,
            nombre: nombre.trim(),
            telefono: telefono.trim() || '0990000000',
            userRole,
            placa: placa.trim().toUpperCase(),
          }),
        });

        const resData = await response.json();
        if (!response.ok || !resData.success) {
          throw new Error(resData.error || 'No se pudo crear la cuenta.');
        }

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;

        const isTransportista =
          isTransportistaFromMetadata(
            signInData.user?.app_metadata as Record<string, unknown> | undefined,
            signInData.user?.user_metadata as Record<string, unknown> | undefined
          ) || isDriverMode;

        const destination = resolvePostAuthRedirect(redirectToQuery, isTransportista);
        navigateWithFreshSession(destination);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error de autenticación';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-dvh bg-[#0B1120] text-white flex items-center justify-center px-4 py-6 overflow-hidden">
      {/* Iluminación ambiental discreta GoBee */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#FDBE3B]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-[410px] rounded-[28px] bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 shadow-[0_24px_70px_rgba(0,0,0,0.6)] p-6 space-y-5">
        {/* Identidad GoBee compacta */}
        <div className="flex flex-col items-center text-center space-y-2.5">
          <div className="w-14 h-14 rounded-2xl bg-[#FDBE3B] text-[#111827] flex items-center justify-center shadow-lg shadow-amber-500/25 ring-4 ring-[#FDBE3B]/15">
            <Navigation className="w-7 h-7 fill-[#111827]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">
                Go<span className="text-[#FDBE3B]">Bee</span>
              </h1>
              <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-[#FDBE3B]/15 text-[#FDBE3B] border border-[#FDBE3B]/35">
                {isDriverMode ? 'Conductor' : 'Cliente'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed max-w-[300px] mx-auto">
              {isDriverMode
                ? 'Plataforma de conductores para recibir Viajes, Mandaditos, Fletes y Renta en tiempo real con rutas GPS y cobro directo.'
                : 'Solicita Viajes, Mandaditos, Fletes de obra o Renta de vehículos con seguimiento satelital en vivo.'}
            </p>
          </div>
        </div>

        {/* 3 beneficios clave en una sola fila compacta (sin muro de texto) */}
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="rounded-xl bg-slate-950/75 border border-slate-800/80 px-2 py-2 flex flex-col items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-[#FDBE3B]" />
            <span className="text-[10px] font-bold text-slate-300 leading-tight">Radar 24/7</span>
          </div>
          <div className="rounded-xl bg-slate-950/75 border border-slate-800/80 px-2 py-2 flex flex-col items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-bold text-slate-300 leading-tight">Pago Directo</span>
          </div>
          <div className="rounded-xl bg-slate-950/75 border border-slate-800/80 px-2 py-2 flex flex-col items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[10px] font-bold text-slate-300 leading-tight">Viaje Seguro</span>
          </div>
        </div>

        {/* Selector segmentado Iniciar Sesión / Registrarme */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
            className={`min-h-[38px] rounded-xl text-xs font-black transition-all cursor-pointer ${
              isLogin ? 'bg-[#FDBE3B] text-[#111827] shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
            className={`min-h-[38px] rounded-xl text-xs font-black transition-all cursor-pointer ${
              !isLogin ? 'bg-[#FDBE3B] text-[#111827] shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Registrarme
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className={`w-full min-h-[48px] pl-10 pr-3.5 bg-[#090f1d] border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:border-[#FDBE3B] focus:outline-none ${AUTOFILL_DARK_CLASS}`}
                  placeholder="Nombre completo"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className={`w-full min-h-[48px] pl-9 pr-2.5 bg-[#090f1d] border border-slate-800 rounded-2xl text-xs font-mono text-white placeholder-slate-500 focus:border-[#FDBE3B] focus:outline-none ${AUTOFILL_DARK_CLASS}`}
                    placeholder="WhatsApp"
                  />
                </div>

                {isDriverMode && (
                  <div className="relative">
                    <Truck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="text"
                      value={placa}
                      onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                      className={`w-full min-h-[48px] pl-9 pr-2.5 bg-[#090f1d] border border-slate-800 rounded-2xl text-xs font-mono uppercase text-white placeholder-slate-500 focus:border-[#FDBE3B] focus:outline-none ${AUTOFILL_DARK_CLASS}`}
                      placeholder="Placa"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full min-h-[48px] pl-10 pr-3.5 bg-[#090f1d] border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:border-[#FDBE3B] focus:outline-none ${AUTOFILL_DARK_CLASS}`}
              placeholder="Correo electrónico"
            />
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              required
              type={showPassword ? 'text' : 'password'}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full min-h-[48px] pl-10 pr-11 bg-[#090f1d] border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:border-[#FDBE3B] focus:outline-none ${AUTOFILL_DARK_CLASS}`}
              placeholder="Contraseña"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#FDBE3B] cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[52px] rounded-2xl bg-[#FDBE3B] hover:bg-[#F5B024] disabled:opacity-50 text-[#111827] font-black text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-[0.99] cursor-pointer"
          >
            {loading ? (
              <span>Ingresando a tu cabina...</span>
            ) : (
              <>
                <span>{isLogin ? 'Ingresar' : 'Crear Cuenta'}</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[10px] font-medium text-slate-500 pt-1">
          {GOBEE_BRAND.seal} · Soporte 24/7
        </p>
      </div>
    </main>
  );
}

export default function FletesAuth() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-[#0B1120] flex items-center justify-center text-[#FDBE3B] text-sm font-bold">
          Cargando GoBee...
        </div>
      }
    >
      <GobeeAuthForm />
    </Suspense>
  );
}
