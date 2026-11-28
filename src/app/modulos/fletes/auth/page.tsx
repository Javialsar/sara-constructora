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
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  type FletesAuthRole,
  isTransportistaFromMetadata,
  resolveInitialAuthRole,
  resolvePostAuthRedirect,
} from '@/lib/fletes/profilePreference';
import { GOBEE_BRAND } from '@/lib/gobee/gobeeTypes';

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

  const router = useRouter();
  const supabase = createClient();

  const isDriverMode = userRole === 'transportista';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;

        const isTransportista = isTransportistaFromMetadata(
          data.user?.app_metadata as Record<string, unknown> | undefined,
          data.user?.user_metadata as Record<string, unknown> | undefined
        );

        const destination = resolvePostAuthRedirect(redirectToQuery, isTransportista);
        router.push(destination);
      } else {
        if (isDriverMode && (!nombre || !placa)) {
          throw new Error('Ingresa tu nombre y la placa del vehículo.');
        }
        if (!isDriverMode && !nombre) {
          throw new Error('Ingresa tu nombre completo.');
        }

        const response = await fetch('/api/auth/register-fletes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            nombre,
            telefono: telefono || '0990000000',
            userRole,
            placa,
          }),
        });

        const resData = await response.json();
        if (!response.ok || !resData.success) {
          throw new Error(resData.error || 'No se pudo crear la cuenta.');
        }

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;

        const isTransportista =
          isTransportistaFromMetadata(
            signInData.user?.app_metadata as Record<string, unknown> | undefined,
            signInData.user?.user_metadata as Record<string, unknown> | undefined
          ) || isDriverMode;

        const destination = resolvePostAuthRedirect(redirectToQuery, isTransportista);
        router.push(destination);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error de autenticación';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh bg-[#0F172A] text-white flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5">
        {/* Cabecera compacta GoBee (mobile-first, sin textos largos) */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#FDBE3B] text-[#111827] flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Navigation className="w-7 h-7 fill-[#111827]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Go<span className="text-[#FDBE3B]">Bee</span>
              {isDriverMode ? ' Conductor' : ''}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {isLogin ? 'Inicia sesión para continuar' : 'Crea tu cuenta en segundos'}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLogin && (
            <>
              {/* Selector compacto de rol solo en registro */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUserRoleOverride('transportista')}
                  className={`min-h-[42px] rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isDriverMode
                      ? 'bg-[#FDBE3B] text-[#111827] border-[#FDBE3B]'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Conductor
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleOverride('cliente_fletes')}
                  className={`min-h-[42px] rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    !isDriverMode
                      ? 'bg-[#FDBE3B] text-[#111827] border-[#FDBE3B]'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Cliente
                </button>
              </div>

              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  required
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full min-h-[48px] pl-10 pr-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:border-[#FDBE3B] focus:outline-none"
                  placeholder="Nombre completo"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full min-h-[48px] pl-9 pr-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono text-white placeholder-slate-500 focus:border-[#FDBE3B] focus:outline-none"
                    placeholder="Teléfono"
                  />
                </div>

                {isDriverMode && (
                  <div className="relative">
                    <Truck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      required
                      type="text"
                      value={placa}
                      onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                      className="w-full min-h-[48px] pl-9 pr-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono uppercase text-white placeholder-slate-500 focus:border-[#FDBE3B] focus:outline-none"
                      placeholder="Placa"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full min-h-[48px] pl-10 pr-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:border-[#FDBE3B] focus:outline-none"
              placeholder="Correo electrónico"
            />
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              required
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-h-[48px] pl-10 pr-11 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:border-[#FDBE3B] focus:outline-none"
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
            className="w-full min-h-[52px] rounded-2xl bg-[#FDBE3B] hover:bg-[#F5B024] disabled:opacity-50 text-[#111827] font-black text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {loading ? (
              <span>Ingresando...</span>
            ) : (
              <>
                <span>{isLogin ? 'Ingresar' : 'Crear cuenta'}</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-1 space-y-2">
          <button
            type="button"
            onClick={() => {
              setIsLogin((v) => !v);
              setError(null);
            }}
            className="text-xs font-bold text-[#FDBE3B] hover:underline cursor-pointer"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : 'Ya tengo cuenta · Iniciar sesión'}
          </button>
          <p className="text-[10px] text-slate-500">{GOBEE_BRAND.seal}</p>
        </div>
      </div>
    </main>
  );
}

export default function FletesAuth() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-[#0F172A] flex items-center justify-center text-[#FDBE3B] text-sm font-bold">
          Cargando GoBee...
        </div>
      }
    >
      <GobeeAuthForm />
    </Suspense>
  );
}
