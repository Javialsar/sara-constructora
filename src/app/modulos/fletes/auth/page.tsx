'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  Mail,
  Lock,
  User,
  ChevronRight,
  AlertCircle,
  Package,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  type FletesAuthRole,
  isTransportistaFromMetadata,
  resolveInitialAuthRole,
  resolvePostAuthRedirect,
} from '@/lib/fletes/profilePreference';

function FletesAuthForm() {
  const searchParams = useSearchParams();
  const rolQuery = searchParams.get('rol');
  const redirectToQuery = searchParams.get('redirectTo');

  const initialRole = resolveInitialAuthRole(rolQuery);

  const [isLogin, setIsLogin] = useState(true);
  const [userRoleOverride, setUserRoleOverride] = useState<FletesAuthRole | null>(null);
  const userRole: FletesAuthRole = userRoleOverride ?? initialRole;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [placa, setPlaca] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectPortal, setRedirectPortal] = useState<{ url: string; name: string } | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRedirectPortal(null);
    setLoading(true);

    try {
      if (isLogin) {
        // 1. Autenticar credenciales
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;

        // 2. Determinar rol priorizando app_metadata (controlado por servidor) sobre user_metadata.
        // Un cliente nunca debe ser redirigido a /modulos/fletes/conductores salvo que su metadata acredite rol transportista.
        const isTransportista = isTransportistaFromMetadata(
          data.user?.app_metadata as Record<string, unknown> | undefined,
          data.user?.user_metadata as Record<string, unknown> | undefined
        );

        const destination = resolvePostAuthRedirect(redirectToQuery, isTransportista);
        router.push(destination);
      } else {
        // REGISTRO EXCLUSIVO PARA SARA_FLETES
        if (userRole === 'transportista' && (!nombre || !placa)) {
          throw new Error('Por favor ingresa tu nombre completo y la placa del vehículo.');
        }
        if (userRole === 'cliente_fletes' && !nombre) {
          throw new Error('Por favor ingresa tu nombre o razón social.');
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: nombre,
              empresa: empresa || undefined,
              placa: userRole === 'transportista' ? placa.toUpperCase() : undefined,
              role: userRole,
              modulo_origen: 'sara_fletes',
              modulos_autorizados: ['sara_fletes'],
            },
          },
        });
        if (signUpError) throw signUpError;

        // Iniciar sesión inmediatamente
        await supabase.auth.signInWithPassword({ email, password });

        const isTransportista = userRole === 'transportista';
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* LADO IZQUIERDO: BRANDING Y POLÍTICA DE SEGREGACIÓN */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-amber-500 to-amber-600 p-8 md:p-10 text-slate-950 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
            <Truck className="w-96 h-96" />
          </div>

          <div className="relative z-10">
            <Link href="/fletes?elegir=1" className="inline-flex items-center gap-2 font-black text-2xl mb-8">
              <div className="bg-slate-950 p-2 rounded-xl text-amber-500 shadow-lg">
                <Truck className="w-6 h-6" />
              </div>
              <span>
                SARA <span className="text-slate-950">Fletes</span>
              </span>
            </Link>

            <h2 className="text-3xl font-black mb-3 leading-tight text-slate-950">
              Red Logística & Renta Multimodal.
            </h2>
            <p className="font-semibold text-amber-950/80 text-sm mb-6 leading-relaxed">
              Plataforma especializada de transporte pesado, fletes locales y renta temporal de vehículos en Ecuador.
            </p>

            <div className="bg-slate-950/10 border border-slate-950/20 p-3.5 rounded-2xl mb-6 backdrop-blur-sm">
              <p className="text-xs font-bold text-slate-950 flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                Servicio Abierto al Público General
              </p>
              <p className="text-[11px] text-slate-900 leading-tight">
                Cualquier persona, particular, empresa de obra o transportista puede solicitar carreras, rentar vehículos por horas/días o registrarse como conductor.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-3 pt-4 border-t border-amber-600/30">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-950">
              <CheckCircle2 className="w-4 h-4 text-slate-950 flex-shrink-0" />
              <span>Fletes con precios justos y mapa satelital en vivo</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-950">
              <CheckCircle2 className="w-4 h-4 text-slate-950 flex-shrink-0" />
              <span>Alquiler de vehículos de trabajo por horas o días</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-950">
              <CheckCircle2 className="w-4 h-4 text-slate-950 flex-shrink-0" />
              <span>Custodia de pagos blindada con Escrow</span>
            </div>
          </div>
        </div>

        {/* LADO DERECHO: FORMULARIO */}
        <div className="w-full md:w-7/12 p-8 md:p-10 bg-slate-900 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-black text-white">
                {isLogin ? 'Acceso a SARA Fletes' : 'Crear Cuenta en Fletes'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isLogin
                  ? `Ingresa como ${userRole === 'cliente_fletes' ? 'cliente' : 'conductor'} con tus credenciales`
                  : 'Registra tu perfil de cliente o transportista'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setRedirectPortal(null);
              }}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : 'Ya tengo cuenta'}
            </button>
          </div>

          {/* ALERTA DE ERROR O REDIRECCIÓN DE MÓDULO */}
          {error && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex flex-col gap-2.5 animate-in fade-in">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
              {redirectPortal && (
                <div className="pt-2 border-t border-rose-900/60">
                  <Link
                    href={redirectPortal.url}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-lg transition-colors shadow-md"
                  >
                    Ir a {redirectPortal.name} →
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* SELECTOR DE TIPO DE CUENTA EN REGISTRO */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Tipo de Cuenta en este Módulo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUserRoleOverride('transportista')}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                      userRole === 'transportista'
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Truck className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-xs text-white leading-tight">Transportista</p>
                      <p className="text-[10px] text-slate-400">Dueño o chofer</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserRoleOverride('cliente_fletes')}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                      userRole === 'cliente_fletes'
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Package className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-xs text-white leading-tight">Cliente / Empresa</p>
                      <p className="text-[10px] text-slate-400">Pide fletes o renta</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      required
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                      placeholder="Juan Pérez o Empresa S.A."
                    />
                  </div>
                </div>

                {userRole === 'transportista' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Placa del Vehículo
                    </label>
                    <div className="relative">
                      <Truck className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                      <input
                        required
                        type="text"
                        value={placa}
                        onChange={(e) => setPlaca(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none uppercase font-mono"
                        placeholder="LBA-1234"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Empresa / Proyecto (Opcional)
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                      <input
                        type="text"
                        value={empresa}
                        onChange={(e) => setEmpresa(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                        placeholder="Constructora o Particular"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black py-3 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-amber-500/20 text-xs mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin mr-2"></span>
                  Verificando Credenciales y Módulo...
                </>
              ) : (
                <>
                  {isLogin ? 'Ingresar a SARA Fletes' : 'Crear Cuenta en Fletes'}
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <Link href="/fletes?elegir=1" className="text-slate-400 hover:text-white font-semibold">
              ← Cambiar perfil Fletes
            </Link>
            <Link href="/login" className="text-amber-400 hover:underline font-bold">
              Portal Maestro SARA →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FletesAuth() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-xs text-slate-400">
          Cargando acceso a SARA Fletes...
        </div>
      }
    >
      <FletesAuthForm />
    </Suspense>
  );
}
