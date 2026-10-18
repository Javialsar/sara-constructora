'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  HardHat, 
  Building2, 
  Compass, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  Cpu, 
  Sparkles,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Phone,
  User as UserIcon,
  Loader2,
  FileText,
  Receipt,
  Warehouse,
  Wrench,
  Briefcase
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { canAccessModule, getUserModule, SARA_MODULES, getUserPortalUrl } from '@/lib/auth/moduleGuards';

export default function ConstructoraAuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [redirectPortal, setRedirectPortal] = useState<{ url: string; name: string } | null>(null);

  // Form Fields: 6 Perfiles Especializados de Constructora
  const [tipoProfesional, setTipoProfesional] = useState<
    'ingeniero' | 'arquitecto' | 'contador' | 'bodeguero' | 'tecnico_apoyo' | 'cliente'
  >('ingeniero');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [identificacionRuc, setIdentificacionRuc] = useState('');
  const [registroSenescyt, setRegistroSenescyt] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [codigoContratoObra, setCodigoContratoObra] = useState('');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    setRedirectPortal(null);

    try {
      if (isLogin) {
        // -------------------------------------------------------------
        // INICIO DE SESIÓN CON SEGREGACIÓN ESTRICTA DE MÓDULO
        // -------------------------------------------------------------
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (signInError) {
          throw new Error(
            signInError.message === 'Invalid login credentials'
              ? 'Credenciales inválidas. Verifique su correo corporativo y contraseña.'
              : signInError.message
          );
        }

        const user = data?.user;
        const meta = user?.user_metadata || {};

        // SEGREGACIÓN ESTRICTA DE MÓDULO
        if (!canAccessModule(meta, 'sara_constructora')) {
          await supabase.auth.signOut();
          const userMod = getUserModule(meta);
          const modDef = SARA_MODULES[userMod];
          const portalUrl = getUserPortalUrl(meta);

          setRedirectPortal({
            url: portalUrl,
            name: modDef?.name || 'tu módulo correspondiente',
          });

          throw new Error(
            `Acceso restringido: Esta cuenta está registrada exclusivamente en "${modDef?.name || 'otro módulo'}". Para acceder a SARA-CONSTRUCTORA debes ingresar con una cuenta de Constructora/Ingeniería o dirigirte a tu portal asignado.`
          );
        }

        router.push('/constructora/suite');
      } else {
        // -------------------------------------------------------------
        // REGISTRO PROFESIONAL B2B CON ASIGNACIÓN DE MÓDULO EXCLUSIVO
        // -------------------------------------------------------------
        if (password !== confirmPassword) {
          throw new Error('Las contraseñas no coinciden.');
        }
        if (password.length < 8) {
          throw new Error('La contraseña corporativa debe tener al menos 8 caracteres.');
        }
        if (![10, 13].includes(identificacionRuc.trim().length)) {
          throw new Error('La identificación (Cédula o RUC ecuatoriano) debe tener 10 o 13 dígitos.');
        }

        const roleMap: Record<string, string> = {
          ingeniero: 'ingeniero_residente',
          arquitecto: 'arquitecto_bim',
          contador: 'contador_constructora',
          bodeguero: 'bodeguero_constructora',
          tecnico_apoyo: 'tecnico_apoyo_obra',
          cliente: 'cliente_constructora',
        };

        const selectedRole = roleMap[tipoProfesional] || 'profesional_constructora';

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              full_name: fullName.trim(),
              nombre: fullName.trim(),
              phone: phone.trim(),
              tipo_profesional: tipoProfesional,
              role: selectedRole,
              identificacion: identificacionRuc.trim(),
              ruc: identificacionRuc.trim(),
              registro_profesional: registroSenescyt.trim() || null,
              senescyt: registroSenescyt.trim() || null,
              razon_social: razonSocial.trim() || fullName.trim(),
              empresa: razonSocial.trim() || fullName.trim(),
              codigo_contrato_obra: codigoContratoObra.trim() || null,
              modulo_origen: 'sara_constructora',
              modulos_autorizados: ['sara_constructora'],
              created_at: new Date().toISOString(),
            },
          },
        });

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            throw new Error('Este correo electrónico corporativo ya está registrado en GRUPO SARA.');
          }
          throw signUpError;
        }

        // Intento de inicio automático
        const { error: autoSignInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (!autoSignInError) {
          router.push('/constructora/suite');
        } else {
          setSuccessMsg('Registro exitoso. Inicie sesión con sus nuevas credenciales corporativas.');
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900/90 p-4 font-sans selection:bg-amber-500/20 selection:text-amber-300">
      {/* Fondo decorativo exterior */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-slate-950 to-slate-950 -z-10" />

      {/* Card Contenedor Maestro de 1000px idéntico a SaaS APU */}
      <div className="w-full max-w-[1020px] bg-white dark:bg-slate-950 rounded-3xl shadow-2xl flex overflow-hidden min-h-[640px] relative border border-slate-200 dark:border-slate-800">
        
        {/* Botón Volver */}
        <Link 
          href="/constructora" 
          className="absolute top-6 left-6 flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-amber-500 transition-colors z-20"
        >
          <ArrowLeft size={16} />
          Volver a SARA Constructora
        </Link>

        {/* ========================================================= */}
        {/* LADO IZQUIERDO: FORMULARIO INTERACTIVO (LOGIN / REGISTRO)  */}
        {/* ========================================================= */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center relative bg-white dark:bg-slate-950 overflow-y-auto max-h-[90vh] lg:max-h-none">
          
          {/* Logo y Encabezado del Módulo */}
          <div className="mb-6 mt-8 sm:mt-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/20 text-slate-950">
              <HardHat size={22} className="text-slate-950" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                SARA CONSTRUCTORA
              </h1>
              <p className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">
                Suite Operativa & Red Agéntica
              </p>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight">
            {isLogin ? 'Bienvenido a la Suite' : 'Registro de Profesional'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-xs leading-relaxed">
            {isLogin 
              ? 'Ingresa tus credenciales profesionales para acceder a la consola agéntica de obras.' 
              : 'Acceso exclusivo para Ingenieros Civiles, Arquitectos BIM y Constructoras con contrato.'}
          </p>

          {/* Alerta de Error con Redirección Inter-Módulo */}
          {error && (
            <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 p-4 rounded-xl text-xs font-medium mb-6 border border-amber-200 dark:border-amber-900/50 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle size={17} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-snug">{error}</p>
              </div>
              {redirectPortal && (
                <div className="pt-1">
                  <Link
                    href={redirectPortal.url}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
                  >
                    <span>Ir al portal de {redirectPortal.name}</span>
                    <ExternalLink size={13} />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Alerta de Éxito */}
          {successMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 p-3.5 rounded-xl text-xs font-medium mb-6 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Si es REGISTRO: Selector de Perfil Profesional (6 Roles de Obra) */}
            {!isLogin && (
              <div className="space-y-1.5 pb-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tipo de Usuario & Perfil en la Empresa
                  </label>
                  <span className="text-[10px] text-amber-500 font-mono">Define permisos en la Suite</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {/* 1. Ingeniero */}
                  <button
                    type="button"
                    onClick={() => setTipoProfesional('ingeniero')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      tipoProfesional === 'ingeniero'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-sm ring-1 ring-amber-500/30'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700 text-xs'
                    }`}
                  >
                    <HardHat size={15} className="mx-auto mb-1 text-amber-500" />
                    <span className="text-[11px] block font-semibold">Ingeniero</span>
                    <span className="text-[9px] text-slate-400 block font-mono">Residente</span>
                  </button>

                  {/* 2. Arquitecto */}
                  <button
                    type="button"
                    onClick={() => setTipoProfesional('arquitecto')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      tipoProfesional === 'arquitecto'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-sm ring-1 ring-amber-500/30'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700 text-xs'
                    }`}
                  >
                    <Compass size={15} className="mx-auto mb-1 text-amber-500" />
                    <span className="text-[11px] block font-semibold">Arquitecto</span>
                    <span className="text-[9px] text-slate-400 block font-mono">BIM & Diseño</span>
                  </button>

                  {/* 3. Contador */}
                  <button
                    type="button"
                    onClick={() => setTipoProfesional('contador')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      tipoProfesional === 'contador'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-sm ring-1 ring-amber-500/30'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700 text-xs'
                    }`}
                  >
                    <Receipt size={15} className="mx-auto mb-1 text-emerald-500" />
                    <span className="text-[11px] block font-semibold">Contador(a)</span>
                    <span className="text-[9px] text-slate-400 block font-mono">SRI & IESS</span>
                  </button>

                  {/* 4. Bodeguero */}
                  <button
                    type="button"
                    onClick={() => setTipoProfesional('bodeguero')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      tipoProfesional === 'bodeguero'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-sm ring-1 ring-amber-500/30'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700 text-xs'
                    }`}
                  >
                    <Warehouse size={15} className="mx-auto mb-1 text-amber-500" />
                    <span className="text-[11px] block font-semibold">Bodeguero</span>
                    <span className="text-[9px] text-slate-400 block font-mono">Kardex Matriz</span>
                  </button>

                  {/* 5. Técnico de Apoyo */}
                  <button
                    type="button"
                    onClick={() => setTipoProfesional('tecnico_apoyo')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      tipoProfesional === 'tecnico_apoyo'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-sm ring-1 ring-amber-500/30'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700 text-xs'
                    }`}
                  >
                    <Wrench size={15} className="mx-auto mb-1 text-sky-500" />
                    <span className="text-[11px] block font-semibold">Técnico Apoyo</span>
                    <span className="text-[9px] text-slate-400 block font-mono">Topógrafo / Tareo</span>
                  </button>

                  {/* 6. Cliente de la Empresa */}
                  <button
                    type="button"
                    onClick={() => setTipoProfesional('cliente')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      tipoProfesional === 'cliente'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-sm ring-1 ring-amber-500/30'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700 text-xs'
                    }`}
                  >
                    <Briefcase size={15} className="mx-auto mb-1 text-purple-500" />
                    <span className="text-[11px] block font-semibold">Cliente Obra</span>
                    <span className="text-[9px] text-slate-400 block font-mono">Supervisión</span>
                  </button>
                </div>
              </div>
            )}

            {/* Si es REGISTRO: Nombre Completo */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nombre Completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon size={16} className="text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    required 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs text-slate-800 dark:text-slate-100 outline-none" 
                    placeholder="Ing. David Sarango"
                  />
                </div>
              </div>
            )}

            {/* Si es REGISTRO: Cédula / RUC y Teléfono */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Cédula / RUC</label>
                  <input 
                    type="text" 
                    required 
                    maxLength={13}
                    value={identificacionRuc}
                    onChange={(e) => setIdentificacionRuc(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-xs text-slate-800 dark:text-slate-100 outline-none font-mono tabular-nums" 
                    placeholder="1103948592001"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Teléfono</label>
                  <input 
                    type="tel" 
                    required 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-xs text-slate-800 dark:text-slate-100 outline-none font-mono tabular-nums" 
                    placeholder="0991234567"
                  />
                </div>
              </div>
            )}

            {/* Si es REGISTRO: Registro SENESCYT y Razón Social */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Matrícula SENESCYT</label>
                  <input 
                    type="text" 
                    value={registroSenescyt}
                    onChange={(e) => setRegistroSenescyt(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-xs text-slate-800 dark:text-slate-100 outline-none font-mono" 
                    placeholder="1005-2018-9923"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Empresa / Razón Social</label>
                  <input 
                    type="text" 
                    value={razonSocial}
                    onChange={(e) => setRazonSocial(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-xs text-slate-800 dark:text-slate-100 outline-none" 
                    placeholder="Constructora S.A."
                  />
                </div>
              </div>
            )}

            {/* Correo Electrónico */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Correo Electrónico Corporativo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-slate-400" />
                </div>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-xs text-slate-800 dark:text-slate-100 outline-none font-mono" 
                  placeholder="ingenieria@empresa.ec"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Contraseña</label>
                {isLogin && (
                  <span className="text-[11px] text-amber-500 hover:underline font-medium cursor-pointer">
                    ¿Olvidaste tu contraseña?
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-slate-400" />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-xs text-slate-800 dark:text-slate-100 outline-none font-mono" 
                  placeholder="••••••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirmar Contraseña en Registro */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Confirmar Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-slate-400" />
                  </div>
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'}
                    required 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-xs text-slate-800 dark:text-slate-100 outline-none font-mono" 
                    placeholder="••••••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Botón Submit */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 mt-3 text-xs tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <span>{isLogin ? 'Acceder a la Suite Agéntica' : 'Crear Cuenta Profesional'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Switch Login / Registro */}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-5 font-medium">
            {isLogin ? '¿No tienes una cuenta profesional?' : '¿Ya tienes una cuenta activa?'}{' '}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }} 
              className="text-amber-500 font-bold hover:underline"
            >
              {isLogin ? 'Regístrate como Profesional' : 'Inicia Sesión'}
            </button>
          </p>
        </div>

        {/* ========================================================= */}
        {/* LADO DERECHO: BRANDING, CAPACIDADES & TESTIMONIO DE OBRA  */}
        {/* ========================================================= */}
        <div className="hidden lg:flex w-1/2 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden text-white border-l border-slate-800">
          {/* Fondo decorativo glow */}
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-amber-500/15 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-indigo-600/15 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono mb-4">
              <ShieldCheck size={14} />
              Cero Fuga de Datos • Multi-Tenant Blindado
            </div>
            <h3 className="text-3xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Ingeniería de Precisión y Orquestación Agéntica.
            </h3>

            <ul className="space-y-5">
              <li className="flex gap-3.5">
                <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 text-amber-400">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Three-Way Match SRI (≤ 1.0%)</h4>
                  <p className="text-slate-400 text-xs leading-relaxed mt-0.5">
                    Conciliación automática de facturas XML electrónicas vs Orden de Compra e ingreso a bodega.
                  </p>
                </div>
              </li>

              <li className="flex gap-3.5">
                <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 text-amber-400">
                  <Cpu size={20} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Kardex Multibodega & Trazabilidad Inversa</h4>
                  <p className="text-slate-400 text-xs leading-relaxed mt-0.5">
                    Transferencias atómicas Matriz ➔ Obra con recálculo de Costo Promedio Ponderado en vivo.
                  </p>
                </div>
              </li>

              <li className="flex gap-3.5">
                <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 text-amber-400">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Ruteo de Fletes & Landed Cost 24 Prov.</h4>
                  <p className="text-slate-400 text-xs leading-relaxed mt-0.5">
                    Optimización de cotizaciones con flete ponderado Haversine y descuentos por volumen.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Testimonio de Director de Obra */}
          <div className="relative z-10 bg-white/[0.06] p-5 rounded-2xl border border-white/10 backdrop-blur-md mt-6">
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="text-amber-400 text-sm">★</span>
              ))}
            </div>
            <p className="text-white text-xs font-medium mb-3 leading-relaxed">
              "La sincronización entre el tareo IESS y los rubros APU nos ahorró cientos de horas de cálculo y blindó a la constructora ante cualquier glosa tributaria o laboral."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-slate-950 font-bold text-xs">
                DS
              </div>
              <div>
                <h5 className="text-white font-bold text-xs">Ing. David Sarango M.</h5>
                <p className="text-slate-400 text-[10px]">Director de Obras Civiles</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
