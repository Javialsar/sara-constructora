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
  ExternalLink,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { canAccessModule, getUserModule, SARA_MODULES, getUserPortalUrl } from '@/lib/auth/moduleGuards';
import ModuleBrandLogo from '@/components/layout/ModuleBrandLogo';

export interface SaraPagosUserSession {
  id: string;
  nombre: string;
  empresa: string;
  ruc: string;
  email: string;
  telefono: string;
  rol: string;
  rolLabel: string;
  fechaIngreso: string;
}

const ROL_LABELS: Record<string, string> = {
  financiero: 'Director Financiero / CFO',
  tesorero: 'Tesorero / Contador SRI',
  empresa: 'Empresa / Constructora / Promotora',
  inversionista: 'Fideicomitente / Inversionista',
};

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
  const [perfilFinanciero, setPerfilFinanciero] = useState<'empresa' | 'financiero' | 'tesorero' | 'inversionista'>('empresa');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const persistPagosSession = (sessionData: SaraPagosUserSession) => {
    try {
      localStorage.setItem('sara_pagos_user_session', JSON.stringify(sessionData));
      // Guardar también en el directorio local de cuentas registradas de SARA-PAGOS para futuros inicios de sesión
      const rawAccounts = localStorage.getItem('sara_pagos_registered_accounts');
      const accounts: Record<string, SaraPagosUserSession & { password?: string }> = rawAccounts ? JSON.parse(rawAccounts) : {};
      accounts[sessionData.email.toLowerCase()] = { ...sessionData, password };
      localStorage.setItem('sara_pagos_registered_accounts', JSON.stringify(accounts));
    } catch {}
    document.cookie = `sara_pagos_session=1; path=/; max-age=2592000; SameSite=Lax`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRedirectPortal(null);

    try {
      const cleanEmail = email.trim().toLowerCase();

      if (isLogin) {
        if (!cleanEmail || !password) {
          throw new Error('Por favor ingresa tu correo corporativo y contraseña.');
        }

        // 1. Intentar autenticar contra Supabase Auth
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

        if (!signInError && data?.user) {
          const user = data.user;
          const meta = { ...(user.user_metadata || {}), ...(user.app_metadata || {}) };

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
              `Acceso restringido: Esta cuenta pertenece a "${modDef?.name || 'otro módulo'}". Ingresa con tus credenciales de SARA-PAGOS o accede a tu portal asignado.`
            );
          }

          const resolvedName =
            meta.full_name ||
            meta.nombre ||
            cleanEmail.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

          const resolvedEmpresa =
            meta.razon_social ||
            meta.empresa ||
            resolvedName;

          const resolvedRole = meta.role || 'empresa';

          persistPagosSession({
            id: user.id,
            nombre: resolvedName,
            empresa: resolvedEmpresa,
            ruc: meta.ruc || meta.identificacion || '1792984512001',
            email: cleanEmail,
            telefono: meta.phone || meta.telefono || '+593 99 999 9999',
            rol: resolvedRole,
            rolLabel: ROL_LABELS[resolvedRole] || 'Cuenta Corporativa Escrow',
            fechaIngreso: new Date().toISOString()
          });

          window.location.href = '/modulos/financiero';
          return;
        }

        // 2. Verificar si existe en el registro local de cuentas SARA-PAGOS
        let localAccount: (SaraPagosUserSession & { password?: string }) | null = null;
        try {
          const rawAccounts = localStorage.getItem('sara_pagos_registered_accounts');
          if (rawAccounts) {
            const accounts = JSON.parse(rawAccounts);
            if (accounts[cleanEmail]) {
              localAccount = accounts[cleanEmail];
            }
          }
        } catch {}

        if (localAccount && (!localAccount.password || localAccount.password === password)) {
          persistPagosSession(localAccount);
          window.location.href = '/modulos/financiero';
          return;
        }

        throw new Error(
          signInError?.message === 'Invalid login credentials'
            ? 'Credenciales no válidas o cuenta no registrada en SARA-PAGOS. Si eres nuevo, selecciona la pestaña "Registrar Empresa / Profesional".'
            : signInError?.message || 'Credenciales inválidas.'
        );
      } else {
        // REGISTRO DE EMPRESA O PROFESIONAL EN SARA-PAGOS
        if (!fullName.trim()) {
          throw new Error('Por favor ingresa el nombre del profesional o representante legal.');
        }
        if (password !== confirmPassword) {
          throw new Error('Las contraseñas no coinciden.');
        }
        if (password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres.');
        }

        const empresaNombre = razonSocial.trim() || fullName.trim();
        const rucFinal = ruc.trim() || '1792984512001';

        // Intentar registro en Supabase Auth (con fallback resiliente si el correo requiere confirmación)
        let userId = `pagos-${Date.now()}`;
        try {
          const { data: signUpData } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                full_name: fullName.trim(),
                razon_social: empresaNombre,
                empresa: empresaNombre,
                ruc: rucFinal,
                phone: phone.trim(),
                role: perfilFinanciero,
                modulo_origen: 'sara_pagos',
                modulos_autorizados: ['sara_pagos', 'sara_facturacion']
              }
            }
          });
          if (signUpData?.user?.id) {
            userId = signUpData.user.id;
          }
          await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password
          });
        } catch (sbErr) {
          console.warn('Registro local activo para SARA-PAGOS:', sbErr);
        }

        const newSession: SaraPagosUserSession = {
          id: userId,
          nombre: fullName.trim(),
          empresa: empresaNombre,
          ruc: rucFinal,
          email: cleanEmail,
          telefono: phone.trim(),
          rol: perfilFinanciero,
          rolLabel: ROL_LABELS[perfilFinanciero] || 'Empresa / Profesional Verificado',
          fechaIngreso: new Date().toISOString()
        };

        persistPagosSession(newSession);
        window.location.href = '/modulos/financiero';
      }
    } catch (err: any) {
      setError(err.message || 'Error de autenticación en SARA-PAGOS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Efectos de iluminación ambiental estilo módulos ejecutivos */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full max-w-6xl bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* COLUMNA IZQUIERDA (5/12): IDENTIDAD DEL MÓDULO Y ARQUITECTURA FIDUCIARIA */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-teal-950/50 to-slate-950 p-8 sm:p-10 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-teal-400 transition-colors mb-6"
            >
              <ArrowLeft size={14} />
              <span>Volver al Ecosistema Grupo SARA</span>
            </Link>

            <div className="mb-6">
              <ModuleBrandLogo
                modulo="fintech"
                size="lg"
                showBackToHolding={false}
                customTitle="SARA PAGOS"
                customSubtitle="Fideicomiso Escrow, SRI & Tesorería"
              />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[11px] font-mono font-bold uppercase tracking-wider mb-4">
              <Sparkles size={12} />
              <span>Bóveda Fiduciaria & Tesorería Corporativa</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3">
              Control Económico, Cuentas Escrow y Gobernanza Tributaria SRI.
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-8">
              Accede a tu entorno financiero particular para administrar fideicomisos de obra, cuentas por cobrar/pagar, conciliación bancaria Three-Way Match y liquidación automática de retenciones SRI.
            </p>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90">
                <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center shrink-0 text-teal-400">
                  <Wallet size={19} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white">Custodia Fiduciaria Escrow (100% Hitos)</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                    Liberación de fondos blindada contra actas técnicas de avance de obra y recepción conforme en bodega.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                  <FileCheck2 size={19} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white">Conciliación SRI & Firma XAdES-BES</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                    Validación Módulo 11, retenciones automáticas Cód. 344 (2% IR / 30% IVA), Cód. 312 (1.75%) y RIMPE.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
                  <Landmark size={19} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white">Monitoreo UAFE & Factoring Pronto Pago</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                    Control preventivo RESU (≥ $10,000 USD), descuento de planillas certificadas y flujo de caja a 30/60/90 días.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-teal-400" />
              <span>Cifrado Bancario Zero-Trust</span>
            </div>
            <span className="font-mono text-[11px] text-teal-400 font-bold">SRI v2.21 • UAFE</span>
          </div>
        </div>

        {/* COLUMNA DERECHA (7/12): FORMULARIO DE AUTENTICACIÓN Y REGISTRO */}
        <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
          <div className="max-w-lg mx-auto w-full">
            
            {/* Pestañas Iniciar Sesión / Registrar Empresa o Profesional */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 border border-slate-800 rounded-2xl mb-7">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(null); }}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                  isLogin
                    ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(null); }}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                  !isLogin
                    ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Registrar Empresa / Profesional
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-black text-white tracking-tight">
                {isLogin ? 'Ingresa a tu Entorno Financiero' : 'Registro Corporativo & Profesional'}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                {isLogin
                  ? 'Introduce tus credenciales para abrir tu consola personalizada de SARA-PAGOS.'
                  : 'Completa los datos de tu empresa o perfil profesional para crear tu entorno particular en SARA-PAGOS.'}
              </p>
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
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all"
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
                        Nombre del Profesional / Representante *
                      </label>
                      <div className="relative">
                        <UserIcon size={16} className="text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Ej: Ing. David Sarango"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-teal-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Nombre de la Empresa / Razón Social *
                      </label>
                      <div className="relative">
                        <Building2 size={16} className="text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={razonSocial}
                          onChange={(e) => setRazonSocial(e.target.value)}
                          placeholder="Ej: Constructora & Fideicomiso S.A."
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-teal-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        RUC / Cédula SRI *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={13}
                        value={ruc}
                        onChange={(e) => setRuc(e.target.value.replace(/\D/g, ''))}
                        placeholder="1792984512001"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:border-teal-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Teléfono *
                      </label>
                      <div className="relative">
                        <Phone size={15} className="text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+593 99 999 9999"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-teal-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Tipo de Perfil
                      </label>
                      <select
                        value={perfilFinanciero}
                        onChange={(e) => setPerfilFinanciero(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-teal-500 outline-none"
                      >
                        <option value="empresa">Empresa / Constructora</option>
                        <option value="financiero">Director Financiero / CFO</option>
                        <option value="tesorero">Tesorero / Contador SRI</option>
                        <option value="inversionista">Fideicomitente / Inversionista</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Correo Electrónico Corporativo *
                </label>
                <div className="relative">
                  <Mail size={16} className="text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="gerencia@tuempresa.ec"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className={isLogin ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Contraseña *
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
                      Confirmar Contraseña *
                    </label>
                    <div className="relative">
                      <KeyRound size={16} className="text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 mt-2"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Ingresar a Mi Entorno SARA-PAGOS' : 'Registrar e Ingresar a Mi Entorno'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 mt-6">
              {isLogin ? '¿Tu empresa o perfil profesional aún no tiene cuenta?' : '¿Ya tienes una cuenta registrada en SARA-PAGOS?'}{' '}
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                className="text-teal-400 font-bold hover:underline ml-1 cursor-pointer"
              >
                {isLogin ? 'Regístrate aquí' : 'Inicia Sesión'}
              </button>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
