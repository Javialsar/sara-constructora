'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Wallet,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Building2,
  User as UserIcon,
  Phone,
  Landmark,
  FileCheck2,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { canAccessModule, getUserModule, SARA_MODULES, getUserPortalUrl } from '@/lib/auth/moduleGuards';
import ModuleBrandLogo from '@/components/layout/ModuleBrandLogo';

export default function SaraPagosAuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectPortal, setRedirectPortal] = useState<{ url: string; name: string } | null>(null);

  // Campos de formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [ruc, setRuc] = useState('');
  const [phone, setPhone] = useState('+593 9');
  const [perfilFinanciero, setPerfilFinanciero] = useState<'financiero' | 'tesorero' | 'empresa' | 'inversionista'>('financiero');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRedirectPortal(null);

    try {
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (signInError) {
          throw new Error(
            signInError.message === 'Invalid login credentials'
              ? 'Credenciales inválidas. Verifica tu correo corporativo y contraseña.'
              : signInError.message
          );
        }

        const user = data?.user;
        const meta = { ...(user?.user_metadata || {}), ...(user?.app_metadata || {}) };

        if (!canAccessModule(meta, 'sara_pagos')) {
          await supabase.auth.signOut();
          const userMod = getUserModule(meta);
          const modDef = SARA_MODULES[userMod];
          const portalUrl = getUserPortalUrl(meta);

          setRedirectPortal({
            url: portalUrl,
            name: modDef?.name || 'tu módulo correspondiente'
          });

          throw new Error(
            `Acceso restringido: Esta cuenta pertenece a "${modDef?.name || 'otro módulo'}". Ingresa con tus credenciales de Tesorería / Fideicomiso Escrow o accede a tu portal asignado.`
          );
        }

        router.push('/modulos/financiero');
      } else {
        if (password !== confirmPassword) {
          throw new Error('Las contraseñas no coinciden.');
        }
        if (password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres.');
        }
        if (!fullName.trim()) {
          throw new Error('Por favor ingresa el nombre del titular o representante.');
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              razon_social: razonSocial.trim() || undefined,
              ruc: ruc.trim() || undefined,
              phone: phone.trim(),
              role: perfilFinanciero,
              modulo_origen: 'sara_pagos',
              modulos_autorizados: ['sara_pagos', 'sara_facturacion']
            }
          }
        });

        if (signUpError) throw signUpError;

        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        router.push('/modulos/financiero');
      }
    } catch (err: any) {
      setError(err.message || 'Error de autenticación en SARA-PAGOS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO DE BÓVEDA ESCROW & TESORERÍA */}
        <div className="w-full lg:w-7/12 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div>
            {/* Cabecera con Logotipo oficial de SARA-PAGOS desde Base de Datos */}
            <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800/80">
              <ModuleBrandLogo
                modulo="fintech"
                size="md"
                showBackToHolding={true}
                customTitle="SARA PAGOS"
                customSubtitle="Fideicomiso Escrow, SRI & Tesorería"
              />
              <Link
                href="/modulos/financiero"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 hover:text-teal-300 bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-xl transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Ver Consola</span>
              </Link>
            </div>

            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full font-bold mb-3">
                <ShieldCheck size={13} />
                Seguridad Fiduciaria Zero-Trust · UAFE & SRI
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {isLogin ? 'Acceso a Bóveda SARA-PAGOS' : 'Apertura de Cuenta Fiduciaria Escrow'}
              </h1>
              <p className="text-slate-400 text-sm mt-1.5">
                {isLogin
                  ? 'Ingresa tus credenciales para gestionar tesorería, fideicomisos Escrow, Factoring y conciliación SRI.'
                  : 'Registra tu empresa o perfil financiero para operar cuentas Escrow blindadas y desembolsos por hitos.'}
              </p>
            </div>

            {/* Selector Login / Registro */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(null); }}
                className={`py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
                  isLogin
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-900/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(null); }}
                className={`py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
                  !isLogin
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-900/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Crear Cuenta Escrow
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs sm:text-sm space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-medium">{error}</p>
                </div>
                {redirectPortal && (
                  <div className="pt-1">
                    <Link
                      href={redirectPortal.url}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all"
                    >
                      <span>Ir al portal de {redirectPortal.name}</span>
                      <ExternalLink size={13} />
                    </Link>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Titular / Representante Legal
                      </label>
                      <div className="relative">
                        <UserIcon size={16} className="text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Ej: Ing. Carlos Andrade"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-teal-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Perfil Financiero
                      </label>
                      <select
                        value={perfilFinanciero}
                        onChange={(e) => setPerfilFinanciero(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-teal-500 outline-none"
                      >
                        <option value="financiero">Director Financiero / CFO</option>
                        <option value="tesorero">Tesorero / Contador SRI</option>
                        <option value="empresa">Empresa / Promotora / Proveedor</option>
                        <option value="inversionista">Fideicomitente / Inversionista</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        RUC / Cédula (Validación SRI)
                      </label>
                      <div className="relative">
                        <Building2 size={16} className="text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          maxLength={13}
                          value={ruc}
                          onChange={(e) => setRuc(e.target.value.replace(/\D/g, ''))}
                          placeholder="1792984512001"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:border-teal-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Teléfono Corporativo
                      </label>
                      <div className="relative">
                        <Phone size={16} className="text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+593 99 999 9999"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-teal-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Razón Social / Entidad (Opcional)
                    </label>
                    <input
                      type="text"
                      value={razonSocial}
                      onChange={(e) => setRazonSocial(e.target.value)}
                      placeholder="Constructora o Fideicomiso S.A."
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-teal-500 outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Correo Electrónico Corporativo
                </label>
                <div className="relative">
                  <Mail size={16} className="text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tesoreria@empresa.ec"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Contraseña de Bóveda
                </label>
                <div className="relative">
                  <Lock size={16} className="text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-teal-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <Lock size={16} className="text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-11 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-teal-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-teal-900/40 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Ingresar a SARA-PAGOS' : 'Activar Cuenta Fiduciaria'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>GRUPO SARA Holding · RUC 1792984512001</span>
            <Link href="/modulos/financiero" className="text-teal-400 hover:underline font-bold">
              Explorar Demo FinTech sin sesión →
            </Link>
          </div>
        </div>

        {/* COLUMNA DERECHA: PROPUESTA DE VALOR FINTECH ESCROW & SRI */}
        <div className="w-full lg:w-5/12 bg-gradient-to-br from-slate-900 via-teal-950/60 to-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-bold">
              <Landmark size={15} />
              <span>Infraestructura FinTech para Construcción & B2B</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Blindaje Financiero, Fideicomiso Escrow y Gobernanza SRI.
            </h2>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/90">
                <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center shrink-0 text-teal-400">
                  <Wallet size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Cuentas de Custodia Escrow (100% Hitos)</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                    Desembolsos liberados exclusivamente contra actas técnicas de avance de obra y recepción conforme en bodega.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/90">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                  <FileCheck2 size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Three-Way Match & Retenciones SRI</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                    Validación automática Módulo 11, XAdES-BES, retenciones Cód. 344 (2% IR / 30% IVA), Cód. 312 (1.75%) y RIMPE.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/90">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Cumplimiento UAFE & Liquidez CFCR</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                    Monitoreo automático de umbral RESU (≥ $10,000 USD), Factoring de pronto pago y estrés de liquidez a 30/60/90 días.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 p-4 rounded-2xl bg-slate-950/90 border border-teal-500/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-teal-400 shrink-0" />
              <span className="text-xs text-slate-300 font-semibold">
                Conectado al Bus Transaccional <strong className="text-teal-300">SARA-PAGOS</strong>
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
              SRI v2.21
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
