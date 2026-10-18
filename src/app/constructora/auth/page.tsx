'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  HardHat, 
  Building2, 
  Compass, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Cpu, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { loginProfessionalAction, registerProfessionalAction } from '@/app/actions/professionalAuth';

export default function ConstructoraAuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [tipoProfesional, setTipoProfesional] = useState<'ingeniero' | 'arquitecto' | 'constructora'>('ingeniero');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await loginProfessionalAction(formData);
      if (res?.error) {
        setErrorMsg(res.error);
        setLoading(false);
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('NEXT_REDIRECT')) {
        setErrorMsg(err.message || 'Error iniciando sesión');
        setLoading(false);
      }
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set('tipoProfesional', tipoProfesional);
    try {
      const res = await registerProfessionalAction(formData);
      if (res?.error) {
        setErrorMsg(res.error);
        setLoading(false);
      } else if (res?.success) {
        setSuccessMsg('Registro profesional completado. Por favor inicie sesión con sus credenciales.');
        setTab('login');
        setLoading(false);
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('NEXT_REDIRECT')) {
        setErrorMsg(err.message || 'Error en el registro');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500/20 selection:text-amber-300">
      {/* Background radial gradient glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-slate-950 to-slate-950 -z-10" />

      {/* Header */}
      <header className="border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link href="/constructora" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white">SARA CONSTRUCTORA</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PRO PORTAL
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Consola Técnica & Red Agéntica B2B</p>
          </div>
        </Link>

        <Link
          href="/constructora"
          className="text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          ← Regresar al sitio
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12 flex flex-col items-center justify-center">
        {/* Banner Explicativo de Exclusividad */}
        <div className="text-center max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            Acceso Exclusivo para Ingenieros, Arquitectos y Constructoras
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Suite Operativa de Misión Crítica
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Plataforma agéntica blindada para la auditoría de facturas XML del SRI, Kardex Multibodega, 
            nómina sectorial IESS y compras predictivas con landed cost en 24 provincias.
          </p>
        </div>

        {/* Card Contenedor */}
        <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden p-6 sm:p-8">
          {/* Switch de Pestañas Login / Registro */}
          <div className="flex border-b border-slate-800 mb-6 font-mono text-xs">
            <button
              onClick={() => { setTab('login'); setErrorMsg(''); }}
              className={`flex-1 pb-3 text-center transition-colors relative font-semibold ${
                tab === 'login' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Iniciar Sesión Profesional
              {tab === 'login' && (
                <motion.div
                  layoutId="tabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400"
                />
              )}
            </button>
            <button
              onClick={() => { setTab('register'); setErrorMsg(''); }}
              className={`flex-1 pb-3 text-center transition-colors relative font-semibold ${
                tab === 'register' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Registro B2B de Profesional
              {tab === 'register' && (
                <motion.div
                  layoutId="tabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400"
                />
              )}
            </button>
          </div>

          {/* Mensajes de Alerta */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-400 text-xs font-mono"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-emerald-400 text-xs font-mono"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* Formulario de Login */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Correo Electrónico Corporativo
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="ingenieria@empresa.ec"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-mono transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Contraseña de Seguridad
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-mono transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Acceder a la Suite Agéntica</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-[11px] text-slate-500 font-mono">
                  Protegido bajo cifrado AES-256 y políticas RLS multi-tenant de Supabase.
                </p>
              </div>
            </form>
          )}

          {/* Formulario de Registro Profesional B2B */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Selector de Perfil Profesional */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-2">
                  Seleccione su Perfil Profesional
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoProfesional('ingeniero')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition-all ${
                      tipoProfesional === 'ingeniero'
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <HardHat className="w-4 h-4" />
                    <span className="text-[11px] font-mono font-medium">Ingeniero Civil</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoProfesional('arquitecto')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition-all ${
                      tipoProfesional === 'arquitecto'
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    <span className="text-[11px] font-mono font-medium">Arquitecto BIM</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoProfesional('constructora')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition-all ${
                      tipoProfesional === 'constructora'
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span className="text-[11px] font-mono font-medium">Constructora</span>
                  </button>
                </div>
              </div>

              {/* Nombres y Apellidos */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    placeholder="Carlos"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    required
                    placeholder="Paredes"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              {/* RUC / Cédula y Teléfono */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Cédula / RUC (Ecuador)
                  </label>
                  <input
                    type="text"
                    name="identificacionRuc"
                    required
                    maxLength={13}
                    placeholder="1103948592001"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Teléfono Móvil</label>
                  <input
                    type="tel"
                    name="telefono"
                    required
                    placeholder="0991234567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-mono tabular-nums"
                  />
                </div>
              </div>

              {/* Registro SENESCYT y Razón Social */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Matrícula / SENESCYT
                  </label>
                  <input
                    type="text"
                    name="registroSenescyt"
                    placeholder="1005-2018-9923"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Empresa / Constructora
                  </label>
                  <input
                    type="text"
                    name="razonSocial"
                    placeholder="Constructora Loja Cía. Ltda."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              {/* Correo y Contraseña */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Correo Corporativo</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="gerencia@constructoraloja.ec"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Contraseña (Mínimo 8 caracteres)
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              {/* Código de Contrato de Obra Opcional */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Código de Contrato SARA (Opcional)
                </label>
                <input
                  type="text"
                  name="codigoContratoObra"
                  placeholder="CTR-SARA-2026-089"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-mono"
                />
                <span className="text-[10px] text-slate-500 font-mono">
                  Si ya tienes un contrato civil u obra activa con GRUPO SARA, ingrésalo para auto-vincular tus proyectos.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Completar Registro Profesional</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Credenciales de confianza */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl w-full mt-8">
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
            <Cpu className="w-4 h-4 text-amber-400 mx-auto mb-1.5" />
            <h4 className="text-xs font-bold text-white">4 Agentes Autónomos</h4>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">Orquestación en tiempo real</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
            <FileText className="w-4 h-4 text-emerald-400 mx-auto mb-1.5" />
            <h4 className="text-xs font-bold text-white">Normativa SRI & IESS</h4>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">Auditoría fiscal ecuatoriana</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
            <Sparkles className="w-4 h-4 text-indigo-400 mx-auto mb-1.5" />
            <h4 className="text-xs font-bold text-white">Landed Cost 24 Prov.</h4>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">Ruteo predictivo de fletes</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 px-6 py-4 text-center text-xs text-slate-500 font-mono">
        GRUPO SARA &copy; {new Date().getFullYear()} — Plataforma de Ingeniería y Construcción en Ecuador.
      </footer>
    </div>
  );
}
